#!/usr/bin/env node
// Generates the static site in docs/ (GitHub Pages) from tools/site-content.mjs and tools/actors.mjs.
// Zero dependencies: `node tools/build-site.mjs`. Commit the generated docs/ output.
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { pages } from './site-content.mjs';
import { actors, storeUrl, apiUrl, mcpUrl } from './actors.mjs';
import { BASE_URL, SITE_NAME, REPO_URL, STORE_PROFILE_URL, INDEXNOW_KEY, MAKER_NAME, MAKER_URL, GA_MEASUREMENT_ID } from './site-config.mjs';
import { referenceSections } from './pacer-courts.mjs';
import { mark, C } from './brand/render.mjs';

const UPDATED = '2026-11-07';
const root = new URL('../', import.meta.url);
const docs = new URL('docs/', root);

if (!BASE_URL.endsWith('/')) throw new Error('BASE_URL must end with a slash');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const pre = (text, label) => `<pre tabindex="0"${label ? ` aria-label="${esc(label)}"` : ''}><code>${esc(text)}</code></pre>`;
const actorByName = Object.fromEntries(actors.map((a) => [a.name, a]));
const pageBySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));

// The brand mark (tools/brand/render.mjs), inlined so it costs no request. Its lines take
// currentColor, so CSS turns it charcoal on cream and cream on charcoal (the reversed mark);
// the monocle and beak stay gold. Decorative: the wordmark next to it carries the name.
const inlineMark = (cls, size, detail = 'full') => {
  const svg = mark({ line: 'currentColor', accent: C.gold, size, detail });
  const out = svg.replace(/ role="img" aria-label="[^"]*"><title>[^<]*<\/title>/, ` class="${cls}" aria-hidden="true" focusable="false">`);
  if (out === svg) throw new Error('mark() markup changed; update inlineMark');
  return out;
};
const logo = inlineMark('logo', 40, 'monocle');

// Files from the brand kit (brand/) that the pages reference, copied to the site root.
const BRAND_FILES = ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'og-image.png', 'icon-512.png'];
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap';

const disclaimer = `owlabee is an independent developer publishing Actors on Apify Store. This site is not affiliated with or endorsed by Apify or by any agency, court, registry or company it names. Data comes from public sources as each source publishes it; coverage and freshness vary, so check the linked source record before relying on a value.`;

// Google Analytics 4, only when GA_MEASUREMENT_ID is set.
// - Loads only on owlabee.com itself, so local previews and forks never count as visits.
// - Consent Mode v2: ad storage and ad signals denied everywhere (no ads here); analytics
//   storage granted, but denied in the EEA, UK and Switzerland, where GA sends cookieless
//   pings, so no cookie banner is needed there.
// - A click on any Apify Store link sends GA4's recommended `generate_lead`, with
//   `lead_method: "apify_store"` and `link_location` (nav, page or footer): the site's
//   job is sending readers to the Store. Mark generate_lead as a key event in GA.
// Disclosed in the footer and on /privacy/, which Google's Analytics terms require.
const STRICT_REGIONS = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];
function analyticsTag() {
  if (!GA_MEASUREMENT_ID) return '';
  const host = new URL(BASE_URL).hostname;
  const cfg = JSON.stringify({ id: GA_MEASUREMENT_ID, hosts: [host, `www.${host}`], regions: STRICT_REGIONS });
  return `<script>
(function (c) {
  if (c.hosts.indexOf(location.hostname) === -1) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  gtag('consent', 'default', { analytics_storage: 'denied', region: c.regions });
  gtag('js', new Date());
  gtag('config', c.id);
  document.addEventListener('click', function (e) {
    var a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a) return;
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (u.hostname !== 'apify.com' || u.pathname.indexOf('/owlabee') !== 0) return;
    var where = a.closest('header, nav') ? 'nav' : a.closest('footer') ? 'footer' : 'page';
    gtag('event', 'generate_lead', { lead_method: 'apify_store', link_location: where });
  }, true);
  var t = document.createElement('script');
  t.async = true;
  t.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(c.id);
  document.head.appendChild(t);
})(${cfg.replace(/</g, '\\u003c')});
</script>`;
}

const privacyNote = GA_MEASUREMENT_ID
  ? `Google Analytics counts visits (cookieless in the EEA, UK and Switzerland); fonts load from Google Fonts. <a href="${BASE_URL}privacy/">Privacy</a>`
  : `No cookies or trackers; fonts load from Google Fonts. <a href="${BASE_URL}privacy/">Privacy</a>`;

function layout({ title, description, path, body, jsonld, prefix, type = 'article', absolute = false, home = false }) {
  const url = BASE_URL + path;
  const href = (p) => (absolute ? BASE_URL + p : prefix + p);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${absolute ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`}
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${BASE_URL}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="owlabee: public records and web data, as clean JSON.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE_URL}og-image.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="${C.cream}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${C.charcoal}" media="(prefers-color-scheme: dark)">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_URL}">
<link rel="stylesheet" href="${href('style.css')}">
${jsonld ? ld(jsonld) : ''}
${analyticsTag()}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap wrap-wide header-row">
<a class="brand" href="${href('')}">${logo}<span class="wordmark">${SITE_NAME}</span></a>
<nav aria-label="Site">
<a href="${href('')}#guides">Guides</a>
<a href="${href('')}#actors">All Actors</a>
<a href="${REPO_URL}">GitHub</a>
<a class="nav-store" href="${STORE_PROFILE_URL}">Apify Store</a>
</nav>
</div>
</header>
<main id="main"${home ? ' class="home"' : ' class="wrap"'}>
${body}
</main>
<footer class="site-footer">
<div class="wrap wrap-wide">
<p>${esc(disclaimer)}</p>
<p><a href="${STORE_PROFILE_URL}">owlabee on Apify Store</a> · <a href="${REPO_URL}">Examples on GitHub</a> (MIT) · ${privacyNote}</p>
<p class="maker">© ${new Date().getUTCFullYear()} owlabee · <a href="${BASE_URL}">${esc(new URL(BASE_URL).hostname)}</a> · Built with <span role="img" aria-label="love">❤️</span> by <a class="maker-link" href="${MAKER_URL}">${esc(MAKER_NAME)}</a></p>
</div>
</footer>
</body>
</html>
`;
}

function curlFor(name, input) {
  return `export APIFY_TOKEN=<your Apify API token>

curl -sS -X POST \\
  "${apiUrl(name)}" \\
  -H "Authorization: Bearer \${APIFY_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(input, null, 2)}'`;
}

function mcpFor(name) {
  return JSON.stringify(
    { mcpServers: { [`owlabee-${name}`]: { url: mcpUrl(name), headers: { Authorization: 'Bearer ${APIFY_TOKEN}' } } } },
    null,
    2,
  );
}

function guidePage(p) {
  const a = actorByName[p.actor];
  if (!a) throw new Error(`unknown actor ${p.actor} on ${p.slug}`);
  const store = storeUrl(a.name);
  const examples = `${REPO_URL}/tree/main/examples/${a.name}`;
  const fullTitle = `${p.title} | ${SITE_NAME}`;
  const middle = p.kind === 'reference'
    ? `<nav class="toc" aria-label="On this page">
<a href="#source">Source and date</a><a href="#courts">District &amp; bankruptcy</a><a href="#appellate">Courts of appeals</a><a href="#national">National courts</a><a href="#by-status">By status</a><a href="#monitor">Monitor a court</a><a href="#faq">FAQ</a>
</nav>
${referenceSections({ input: p.input, guideLinks: p.guideLinks.map((g) => `<a href="../${g}/">${esc(pageBySlug[g].nav)}</a>`).join(', ') })}
`
    : `<nav class="toc" aria-label="On this page">
<a href="#source">The source</a><a href="#fields">Fields</a><a href="#example">Example output</a><a href="#use-cases">Use cases</a><a href="#run">Run it</a><a href="#faq">FAQ</a>
</nav>

<section id="source">
<h2>The source and its limits</h2>
${p.source.trim()}
</section>

<section id="fields">
<h2>Fields you get</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Field</th><th scope="col">What it holds</th></tr></thead>
<tbody>
${p.fields.map(([f, d]) => `<tr><td><code>${esc(f)}</code></td><td>${d}</td></tr>`).join('\n')}
</tbody>
</table></div>
</section>

<section id="example">
<h2>Example output</h2>
<p>${p.example.caption}</p>
${pre(JSON.stringify(p.example.json, null, 2), 'Example output record')}
</section>

<section id="use-cases">
<h2>Use cases</h2>
${p.useCases.map(([h, t]) => `<h3>${esc(h)}</h3>\n<p>${t}</p>`).join('\n')}
</section>

<section id="run">
<h2>How to run it</h2>
<p>You need an Apify account and its API token (Console → Settings → API &amp; Integrations). Each run is billed per result to your account; set a maximum total charge for the run to cap spend.</p>
<h3>With curl</h3>
<p>The sync endpoint starts a run, waits up to 300 seconds and returns the dataset items. ${p.inputCaption}</p>
${pre(curlFor(a.name, p.input), 'curl command')}${(p.moreInputs ?? []).map((m) => `\n<p>${m.caption}</p>\n${pre(JSON.stringify(m.json, null, 2), 'Actor input')}`).join('')}
<h3>From an AI agent (MCP)</h3>
<p>Apify hosts an MCP server. This config exposes only this Actor to the agent:</p>
${pre(mcpFor(a.name), 'MCP client configuration')}
<p>Then ask, for example: <q>${esc(p.prompt)}</q></p>
<h3>Python, Node.js and more examples</h3>
<p>Runnable <code>curl.sh</code>, <code>python.py</code>, <code>node.mjs</code> and <code>mcp.json</code> files for this Actor are in <a href="${examples}">examples/${esc(a.name)}</a> on GitHub.</p>
</section>

`;
  const body = `
<article>
<div class="guide-head">
<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Guides</a> <span aria-hidden="true">›</span> ${esc(p.nav)}</nav>
<p class="kicker">${esc(a.group)}</p>
<h1>${esc(p.title)}</h1>
<p class="lede">${p.lede}</p>
<div class="cta">
<a class="button" href="${store}">Open the Actor on Apify Store</a>
<p class="note">${esc(a.title)}. Pay per result; see the Store page for current pricing.</p>
</div>
</div>
${middle}<section id="faq">
<h2>FAQ</h2>
${p.faq.map(([q, t]) => `<h3>${q}</h3>\n<p>${t}</p>`).join('\n')}
</section>

<aside class="cta-box">
<h2>Try it on Apify Store</h2>
<p>${esc(a.title)}. ${esc(a.returns)}.</p>
<p><a class="button" href="${store}">Open on Apify Store</a></p>
<p class="note">Pay per result; see the Store page for current pricing.</p>
</aside>

<section class="related">
<h2>Related guides</h2>
<ul>
${p.related.map((s) => `<li><a href="../${s}/">${esc(pageBySlug[s].title)}</a></li>`).join('\n')}
</ul>
</section>
</article>`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: p.title,
        description: p.description,
        url: BASE_URL + p.slug + '/',
        inLanguage: 'en-US',
        dateModified: UPDATED,
        author: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
        about: { '@id': store },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': store,
        name: a.title,
        description: a.returns,
        url: store,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.faq.map(([q, t]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(t) } })),
      },
    ],
  };
  return layout({ title: fullTitle, description: p.description, path: p.slug + '/', body, jsonld, prefix: '../' });
}

function indexPage() {
  const description =
    'Guides to public data (permits, grants, SAM.gov, OSHA, EPA, recalls, PACER, licenses, DNS, sitemaps, Shopify, podcasts, Bluesky, job boards) and documents as JSON.';
  const groups = [...new Set(actors.map((a) => a.group))];
  const groupOf = (p) => actorByName[p.actor].group;
  const guideGroups = groups.filter((g) => pages.some((p) => groupOf(p) === g));
  const body = `
<section class="hero">
<div class="wrap wrap-wide">
<div class="hero-grid">
<div class="lockup">
${inlineMark('lockup-mark', 132)}
<p class="lockup-word"><span class="lockup-name">${SITE_NAME}</span><span class="dotcom">.com</span></p>
<p class="motto">Wise data. Honest work.</p>
<p class="tagline">The owl sees clearly; the bee does the work.</p>
</div>
<div class="hero-copy">
<p class="kicker">Apify Actors · pay per result · ready for AI agents</p>
<h1>Public data sources, <span class="hl">as clean JSON</span></h1>
<p class="lede">owlabee publishes ${actors.length} Actors on Apify Store that read public data sources (permit portals, federal APIs, court feeds, license registries, DNS, sitemaps, storefronts, podcast feeds, Bluesky and job boards) or convert documents, and return normalized JSON. These guides explain each source, what you get from it, and how to run it with curl or from an AI agent.</p>
<p class="hero-cta"><a class="button" href="#guides">Browse the guides</a> <a class="button button-ghost" href="${STORE_PROFILE_URL}">See them on Apify Store</a></p>
</div>
</div>
<ul class="stats">
<li><strong>${actors.length}</strong><span>Actors on Apify Store</span></li>
<li><strong>${pages.length}</strong><span>guides to the sources</span></li>
<li><strong>Per result</strong><span>billed to your own Apify account</span></li>
<li><strong>MCP</strong><span>every Actor works as an agent tool</span></li>
</ul>
</div>
</section>

<section id="guides" class="band">
<div class="wrap wrap-wide">
<h2>Guides</h2>
<p class="note">Every Actor is pay per result, billed to your own Apify account; see each Store page for current pricing.</p>
${guideGroups
  .map(
    (g) => `<h3 class="group-title">${esc(g)}</h3>
<ul class="cards">
${pages
  .filter((p) => groupOf(p) === g)
  .map((p) => `<li><a href="${p.slug}/"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span><em aria-hidden="true">Read the guide →</em></a></li>`)
  .join('\n')}
</ul>`,
  )
  .join('\n')}
</div>
</section>

<section id="actors" class="band band-alt">
<div class="wrap wrap-wide">
<h2>All Actors</h2>
<div class="actor-groups">
${groups
  .map(
    (g) => `<div class="actor-group">
<h3>${esc(g)}</h3>
<ul class="actor-list">
${actors
  .filter((a) => a.group === g)
  .map(
    (a) =>
      `<li><a href="${storeUrl(a.name)}"><strong>${esc(a.title)}</strong></a><span>${esc(a.returns)}.</span><a class="small" href="${REPO_URL}/tree/main/examples/${a.name}">Examples on GitHub</a></li>`,
  )
  .join('\n')}
</ul>
</div>`,
  )
  .join('\n')}
</div>
</div>
</section>

<section id="how" class="band">
<div class="wrap wrap-wide">
<h2>How running an Actor works</h2>
<ol class="steps">
<li>Create an Apify account and copy your API token from Console → Settings → API &amp; Integrations.</li>
<li>Send the Actor's input as JSON to <code>https://api.apify.com/v2/acts/owlabee~&lt;actor&gt;/run-sync-get-dataset-items</code> with <code>Authorization: Bearer &lt;token&gt;</code>, or use the Python and Node.js clients.</li>
<li>Or connect an AI agent to <code>https://mcp.apify.com/?tools=owlabee/&lt;actor&gt;</code>, Apify's hosted MCP server.</li>
</ol>
<p>Each guide has a ready-to-run input. More examples, one folder per Actor, are on <a href="${REPO_URL}">GitHub</a>.</p>
</div>
</section>`;

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL, inLanguage: 'en-US', description },
      {
        '@type': 'ItemList',
        name: 'Guides',
        itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: BASE_URL + p.slug + '/', name: p.title })),
      },
    ],
  };
  return layout({
    title: `${SITE_NAME}: public records and web data as JSON`,
    description,
    path: '',
    body,
    jsonld,
    prefix: '',
    type: 'website',
    home: true,
  });
}

function privacyPage() {
  const analytics = GA_MEASUREMENT_ID
    ? `<p>This site uses Google Analytics 4 to count visits and see which guides are read. It records things like the pages you view, how you arrived (a search, a link, or directly), whether you follow a link to an Actor on Apify Store, your approximate location at country or city level, and your device and browser type. Google does not give owlabee your IP address.</p>
<p>Advertising features are turned off. If you visit from the European Economic Area, the UK or Switzerland, Google Analytics runs in a cookieless mode and sets no analytics cookies. Elsewhere it sets first-party cookies (named <code>_ga</code>) to tell new visits from return ones.</p>
<p>Google processes this data under its own <a href="https://policies.google.com/privacy">privacy policy</a>. You can opt out on every site with Google's <a href="https://tools.google.com/dlpage/gaoptout">opt-out browser add-on</a>, or by blocking scripts from <code>googletagmanager.com</code>.</p>`
    : `<p>This site runs no analytics and sets no cookies.</p>`;
  const body = `
<article>
<div class="guide-head">
<h1>Privacy</h1>
<p class="lede">What owlabee.com collects. No accounts, no forms, no ads.</p>
</div>
<section>
<h2>Visit statistics</h2>
${analytics}
</section>
<section>
<h2>Fonts and hosting</h2>
<p>The fonts (Jost and Cormorant Garamond) load from Google Fonts, so your browser asks Google's servers for them. The site is hosted on GitHub Pages, which, like any web host, handles the requests your browser makes and keeps routine logs to run and protect the service.</p>
</section>
<section>
<h2>Running an Actor</h2>
<p>The Actors themselves run on Apify, under your own Apify account. What you send them and what they return is covered by <a href="https://apify.com/privacy-policy">Apify's privacy policy</a>, not this site.</p>
</section>
</article>`;
  return layout({ title: `Privacy | ${SITE_NAME}`, description: 'What owlabee.com collects: visit statistics, fonts from Google Fonts, and hosting on GitHub Pages.', path: 'privacy/', body, prefix: '../', type: 'website' });
}

function notFoundPage() {
  const body = `
<h1>Page not found</h1>
<p class="lede">That page does not exist. The guides are listed below.</p>
<ul>
${pages.map((p) => `<li><a href="${BASE_URL}${p.slug}/">${esc(p.title)}</a></li>`).join('\n')}
</ul>
<p><a class="button" href="${BASE_URL}">Back to all guides</a></p>`;
  return layout({ title: `Page not found | ${SITE_NAME}`, description: 'Page not found.', path: '404.html', body, absolute: true, type: 'website' });
}

// write
mkdirSync(docs, { recursive: true });
writeFileSync(new URL('index.html', docs), indexPage());
writeFileSync(new URL('404.html', docs), notFoundPage());
mkdirSync(new URL('privacy/', docs), { recursive: true });
writeFileSync(new URL('privacy/index.html', docs), privacyPage());
for (const p of pages) {
  const dir = new URL(`${p.slug}/`, docs);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), guidePage(p));
}
copyFileSync(new URL('site.css', import.meta.url), new URL('style.css', docs));
for (const f of BRAND_FILES) copyFileSync(new URL(`brand/${f}`, root), new URL(f, docs));
writeFileSync(new URL('.nojekyll', docs), '');
writeFileSync(new URL(`${INDEXNOW_KEY}.txt`, docs), `${INDEXNOW_KEY}\n`);
// GitHub Pages custom domain: written when BASE_URL is not a github.io address.
const host = new URL(BASE_URL).hostname;
if (!host.endsWith('.github.io')) writeFileSync(new URL('CNAME', docs), `${host}\n`);
writeFileSync(new URL('robots.txt', docs), `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}sitemap.xml\n`);
writeFileSync(
  new URL('sitemap.xml', docs),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', ...pages.map((p) => p.slug + '/')].map((p) => `<url><loc>${BASE_URL}${p}</loc><lastmod>${UPDATED}</lastmod></url>`).join('\n')}
</urlset>
`,
);

// keep the site link in README.md in sync with BASE_URL
const readmeUrl = new URL('README.md', root);
const readme = readFileSync(readmeUrl, 'utf8');
const shown = BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
writeFileSync(readmeUrl, readme.replace(/<!-- site -->[\s\S]*?<!-- \/site -->/, `<!-- site -->[${shown}](${BASE_URL})<!-- /site -->`));

console.log(`site: index, 404 and ${pages.length} guides written to docs/ for ${BASE_URL}`);
