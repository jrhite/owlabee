#!/usr/bin/env node
// Generates the static site in docs/ (GitHub Pages) from tools/site-content.mjs and tools/actors.mjs.
// Zero dependencies: `node tools/build-site.mjs`. Commit the generated docs/ output.
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { pages } from './site-content.mjs';
import { actors, storeUrl, apiUrl, mcpUrl } from './actors.mjs';
import { BASE_URL, SITE_NAME, REPO_URL, STORE_PROFILE_URL, INDEXNOW_KEY } from './site-config.mjs';

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

const disclaimer = `owlabee is an independent developer publishing Actors on Apify Store. This site is not affiliated with or endorsed by Apify or by any agency, court, registry or company it names. Data comes from public sources as each source publishes it; coverage and freshness vary, so check the linked source record before relying on a value.`;

function layout({ title, description, path, body, jsonld, prefix, type = 'article', absolute = false }) {
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
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="${href('style.css')}">
${jsonld ? ld(jsonld) : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap header-row">
<a class="brand" href="${href('')}">${SITE_NAME}</a>
<nav aria-label="Site">
<a href="${href('')}#guides">Guides</a>
<a href="${href('')}#actors">All Actors</a>
<a href="${REPO_URL}">GitHub</a>
</nav>
</div>
</header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-footer">
<div class="wrap">
<p>${esc(disclaimer)}</p>
<p><a href="${STORE_PROFILE_URL}">owlabee on Apify Store</a> · <a href="${REPO_URL}">Examples on GitHub</a> (MIT) · No cookies, scripts or trackers on this site.</p>
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
  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Guides</a> <span aria-hidden="true">›</span> ${esc(p.nav)}</nav>
<article>
<h1>${esc(p.title)}</h1>
<p class="lede">${p.lede}</p>
<div class="cta">
<a class="button" href="${store}">Open the Actor on Apify Store</a>
<p class="note">${esc(a.title)}. Pay per result; see the Store page for current pricing.</p>
</div>
<nav class="toc" aria-label="On this page">
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
${pre(curlFor(a.name, p.input), 'curl command')}
<h3>From an AI agent (MCP)</h3>
<p>Apify hosts an MCP server. This config exposes only this Actor to the agent:</p>
${pre(mcpFor(a.name), 'MCP client configuration')}
<p>Then ask, for example: <q>${esc(p.prompt)}</q></p>
<h3>Python, Node.js and more examples</h3>
<p>Runnable <code>curl.sh</code>, <code>python.py</code>, <code>node.mjs</code> and <code>mcp.json</code> files for this Actor are in <a href="${examples}">examples/${esc(a.name)}</a> on GitHub.</p>
</section>

<section id="faq">
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
  const body = `
<h1>Public data sources as JSON</h1>
<p class="lede">owlabee publishes ${actors.length} Actors on Apify Store that read public data sources (permit portals, federal APIs, court feeds, license registries, DNS, sitemaps, storefronts, podcast feeds, Bluesky and job boards) or convert documents, and return normalized JSON. These guides explain each source, what you get from it, and how to run it with curl or from an AI agent.</p>
<p class="note">Every Actor is pay per result, billed to your own Apify account; see each Store page for current pricing.</p>

<section id="guides">
<h2>Guides</h2>
<ul class="cards">
${pages
  .map(
    (p) => `<li><a href="${p.slug}/"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span></a></li>`,
  )
  .join('\n')}
</ul>
</section>

<section id="actors">
<h2>All Actors</h2>
${groups
  .map(
    (g) => `<h3>${esc(g)}</h3>
<ul class="actor-list">
${actors
  .filter((a) => a.group === g)
  .map(
    (a) =>
      `<li><a href="${storeUrl(a.name)}"><strong>${esc(a.title)}</strong></a><span>${esc(a.returns)}.</span><a class="small" href="${REPO_URL}/tree/main/examples/${a.name}">Examples on GitHub</a></li>`,
  )
  .join('\n')}
</ul>`,
  )
  .join('\n')}
</section>

<section id="how">
<h2>How running an Actor works</h2>
<ol>
<li>Create an Apify account and copy your API token from Console → Settings → API &amp; Integrations.</li>
<li>Send the Actor's input as JSON to <code>https://api.apify.com/v2/acts/owlabee~&lt;actor&gt;/run-sync-get-dataset-items</code> with <code>Authorization: Bearer &lt;token&gt;</code>, or use the Python and Node.js clients.</li>
<li>Or connect an AI agent to <code>https://mcp.apify.com/?tools=owlabee/&lt;actor&gt;</code>, Apify's hosted MCP server.</li>
</ol>
<p>Each guide has a ready-to-run input. More examples, one folder per Actor, are on <a href="${REPO_URL}">GitHub</a>.</p>
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
  });
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
for (const p of pages) {
  const dir = new URL(`${p.slug}/`, docs);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), guidePage(p));
}
copyFileSync(new URL('site.css', import.meta.url), new URL('style.css', docs));
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
