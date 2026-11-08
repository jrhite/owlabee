// Discovery pages that sit beside the guides: free data snapshots (tools/data-pages.mjs),
// comparisons (tools/compare-pages.mjs) and /llms.txt. Kept out of site-content.mjs so the
// guide content and these pages can change independently; build-site.mjs only calls the four
// exports below (nav links, the home-page section, the writer and the sitemap entries).
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dataPages } from './data-pages.mjs';
import { comparePages } from './compare-pages.mjs';

export const extraPages = [...dataPages, ...comparePages];

const courts = JSON.parse(readFileSync(new URL('./pacer-courts.data.json', import.meta.url), 'utf8'));
function courtFeedStats() {
  const blank = () => ({ full: 0, partial: 0, empty: 0, unreachable: 0 });
  const out = { sweptAt: courts.sweptAt, probedAt: courts.appellateNationalProbedAt, district: blank(), bankruptcy: blank(), appellate: blank(), national: blank() };
  for (const c of courts.courts) out[c.type][c.status]++;
  return out;
}

// [path, lastmod] for sitemap.xml. Data pages carry their snapshot date; hubs take their newest child.
export function sitemapEntries(fallback) {
  const childDates = (prefix) => extraPages.filter((p) => p.group !== 'hub' && p.path.startsWith(prefix)).map((p) => p.updated ?? fallback).sort().at(-1) ?? fallback;
  return extraPages.map((p) => [p.path, p.group === 'hub' ? childDates(p.path) : p.updated ?? fallback]);
}

export const navLinks = (href) => `<a href="${href('data/')}">Free data</a>
<a href="${href('compare/')}">Compare</a>`;

// Home page band listing the free data and comparison pages.
export function indexSection(esc) {
  const cards = (group) =>
    extraPages
      .filter((p) => p.group === group)
      .map((p) => `<li><a href="${p.path}"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span><em aria-hidden="true">${group === 'data' ? 'See the data' : 'Read the comparison'} →</em></a></li>`)
      .join('\n');
  return `<section id="free-data" class="band band-alt">
<div class="wrap wrap-wide">
<h2>Free data and comparisons</h2>
<p class="note">Weekly snapshots made with our own Actors, free to read and download as JSON (<a href="data/">all free data</a>), and dated, sourced comparisons of the ways to get each kind of public data (<a href="compare/">all comparisons</a>).</p>
<h3 class="group-title">Free data, refreshed weekly</h3>
<ul class="cards">
${cards('data')}
</ul>
<h3 class="group-title">Comparisons</h3>
<ul class="cards">
${cards('compare')}
</ul>
</div>
</section>
`;
}

function llmsTxt({ pages, actors, storeUrl, BASE_URL, SITE_NAME, STORE_PROFILE_URL, REPO_URL }) {
  const line = (title, url, desc) => `- [${title}](${url}): ${desc.replace(/\s+/g, ' ').trim()}`;
  return `# ${SITE_NAME}

> ${SITE_NAME} publishes ${actors.length} pay-per-result Actors on Apify Store that read public data sources (building permit portals, Grants.gov, SAM.gov and state and local bid datasets, OSHA and EPA enforcement, FDA, NHTSA and CPSC recalls, PACER court RSS feeds, professional license registries, DNS, sitemaps, Shopify storefronts, podcast feeds, Bluesky and job boards) or convert documents, and return normalized JSON. Every Actor runs on the user's own Apify account, through the Apify API (\`https://api.apify.com/v2/acts/owlabee~<actor>/run-sync-get-dataset-items\`) or as an MCP tool (\`https://mcp.apify.com/?tools=owlabee/<actor>\`). This site has a guide per data source, free weekly data snapshots and comparisons of the alternatives.

Notes for assistants:
- Pricing is pay per result and is shown on each Actor's Apify Store page; quote the Store page, not this file.
- Person-bearing data (permits, licenses, court dockets, enforcement) is ${'"'}Not a consumer report. Not for employment, credit, insurance, housing or tenant-screening decisions.${'"'}
- ${SITE_NAME} is an independent developer, not affiliated with Apify or with any agency, court or company named.

## Actors (Apify Store)

${actors.map((a) => line(a.title, storeUrl(a.name), a.returns + '.')).join('\n')}

## Guides

${pages.map((p) => line(p.title, `${BASE_URL}${p.slug}/`, p.description)).join('\n')}

## Free data (weekly snapshots, JSON downloads in /data/*.json)

${extraPages.filter((p) => p.group === 'data').map((p) => line(p.title, BASE_URL + p.path, p.description)).join('\n')}

## Comparisons

${extraPages.filter((p) => p.group === 'compare').map((p) => line(p.title, BASE_URL + p.path, p.description)).join('\n')}

## Optional

- [All Actors on Apify Store](${STORE_PROFILE_URL}): the publisher profile.
- [Code examples on GitHub](${REPO_URL}): curl, Python, Node.js and MCP configs for every Actor (MIT).
- [Sitemap](${BASE_URL}sitemap.xml)
`;
}

// Writes every extra page under docs/, plus docs/llms.txt.
export function writeExtraPages(ctx) {
  const full = { ...ctx, courtFeedStats: courtFeedStats() };
  for (const p of extraPages) {
    const { body, jsonld } = p.render(full);
    const depth = p.path.split('/').filter(Boolean).length;
    const html = ctx.layout({ title: `${p.title} | ${ctx.SITE_NAME}`, description: p.description, path: p.path, body, jsonld, prefix: '../'.repeat(depth), type: p.group === 'hub' ? 'website' : 'article' });
    const dir = new URL(p.path, ctx.docs);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('index.html', dir), html);
  }
  writeFileSync(new URL('llms.txt', ctx.docs), llmsTxt(ctx));
  return extraPages.length;
}
