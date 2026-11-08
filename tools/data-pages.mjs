// "Free data" pages: owlabee.com/data/ and one page per snapshot in docs/data/<id>.json.
// The snapshots are written by tools/data-pages/refresh.mjs (one small, capped run of our own
// Actor each, cut down to an allowlist of fields); this module only renders them. Rendered by
// tools/build-site.mjs through tools/discovery-pages.mjs.
//
// Guardrails (mmm docs/legal/GUARDRAILS.md): no person names or contact details on any page;
// permits at street level only; every licensed source carries its attribution sentence verbatim;
// non-affiliation lines; the permits page carries the consumer-report notice.
import { existsSync, readFileSync } from 'node:fs';

const dataDir = new URL('../docs/data/', import.meta.url);
const load = (id) => {
  const f = new URL(`${id}.json`, dataDir);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
};

export const NOTICE = 'Not a consumer report. Not for employment, credit, insurance, housing or tenant-screening decisions.';

const AGENCIES = {
  'fda-drug': ['FDA', 'drug enforcement reports (openFDA)', 'US'],
  'fda-device': ['FDA', 'medical device enforcement reports (openFDA)', 'US'],
  'fda-food': ['FDA', 'food and cosmetics enforcement reports (openFDA)', 'US'],
  nhtsa: ['NHTSA', 'vehicle and equipment recall campaigns', 'US'],
  cpsc: ['CPSC', 'consumer product recalls (SaferProducts)', 'US'],
  'health-canada': ['Health Canada', 'recalls and safety alerts, incl. CFIA and Transport Canada', 'CA'],
  'uk-opss': ['OPSS', 'UK Office for Product Safety and Standards reports and recalls', 'GB'],
  'uk-mhra': ['MHRA', 'UK drug and medical device alerts', 'GB'],
  'uk-fsa': ['FSA', 'UK Food Standards Agency alerts and recall notices', 'GB'],
  'eu-safety-gate': ['EU Safety Gate', 'alerts on dangerous non-food products (EU/EEA)', 'EU'],
};

const PERMIT_SOURCES = {
  nyc: ['DOB NOW: Build – Approved Permits', 'https://data.cityofnewyork.us/d/rbx6-tga4'],
  chicago: ['Building Permits', 'https://data.cityofchicago.org/d/ydr8-5enu'],
  'san-francisco': ['DBI Building Permits', 'https://data.sfgov.org/d/i98e-djp9'],
  seattle: ['SDCI Building Permits', 'https://data.seattle.gov/d/76t5-zqzr'],
  austin: ['Issued Construction Permits', 'https://data.austintexas.gov/d/3syk-w9eu'],
  boston: ['Approved Building Permits (Analyze Boston, CKAN)', null],
  nashville: ['Building Permits Issued (ArcGIS)', null],
  raleigh: ['Building Permits (ArcGIS)', null],
  'denver-residential': ['Residential construction permits (ArcGIS)', null],
  columbus: ['Building Permits (ArcGIS)', null],
};

const SLED_SOURCES = {
  'la-city': ['City of Los Angeles, RAMP Open Bid Opportunities', 'https://data.lacity.org/d/hf3r-utnq'],
  'montgomery-md': ['Montgomery County, MD, Solicitations', 'https://data.montgomerycountymd.gov/d/eeq6-nnwe'],
  delaware: ['State of Delaware, Open Bids', 'https://data.delaware.gov/d/2hnj-zwix'],
};

const day = (iso) => (iso ? String(iso).slice(0, 10) : '');
const longDate = (iso) => new Date(`${day(iso)}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const money = (n) => (typeof n === 'number' ? `$${Math.round(n).toLocaleString('en-US')}` : '–');
const groupBy = (rows, f) => rows.reduce((m, r) => (m.get(f(r)) ? m.get(f(r)).push(r) : m.set(f(r), [r]), m), new Map());

// Shared page frame for data and comparison pages.
export function frame(ctx, { crumbs, kicker, title, lede, actor, ctaText, toc, sections, faq = [], related = [] }) {
  const { esc } = ctx;
  const store = ctx.storeUrl(actor.name);
  return `
<article>
<div class="guide-head">
<nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
<p class="kicker">${esc(kicker)}</p>
<h1>${esc(title)}</h1>
<p class="lede">${lede}</p>
<div class="cta">
<a class="button" href="${store}">${esc(ctaText)}</a>
<p class="note">${esc(actor.title)} on Apify Store. Pay per result; see the Store page for current pricing.</p>
</div>
</div>
${toc?.length ? `<nav class="toc" aria-label="On this page">\n${toc.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('')}\n</nav>\n` : ''}
${sections.join('\n')}
${faq.length ? `<section id="faq">\n<h2>FAQ</h2>\n${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join('\n')}\n</section>` : ''}

<aside class="cta-box">
<h2>Get this as JSON, on a schedule</h2>
<p>${esc(actor.title)}. ${esc(actor.returns)}.</p>
<p><a class="button" href="${store}">Open on Apify Store</a></p>
<p class="note">Run it from the Console, the API or an AI agent (MCP), or save the input as a Task with a daily schedule. Pay per result, billed to your own Apify account.</p>
</aside>
${related.length ? `\n<section class="related">\n<h2>Related</h2>\n<ul>\n${related.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('\n')}\n</ul>\n</section>` : ''}
</article>`;
}

function table(head, rows, cls = '') {
  return `<div class="table-wrap"><table${cls ? ` class="${cls}"` : ''}>
<thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
<tbody>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</tbody>
</table></div>`;
}

function datasetLd(ctx, { path, name, description, snap, credit, sources }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url: ctx.BASE_URL + path,
    dateModified: snap.generatedAt,
    creator: { '@type': 'Organization', name: ctx.SITE_NAME, url: ctx.BASE_URL },
    isAccessibleForFree: true,
    creditText: credit,
    isBasedOn: sources,
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${ctx.BASE_URL}data/${snap.dataset}.json` }],
  };
}

const howMade = (ctx, snap, actorName, extra = '') => `<section id="method">
<h2>How this page is made</h2>
<p>Generated on <strong>${longDate(snap.generatedAt)}</strong> (${ctx.esc(snap.generatedAt.replace(/\.\d+Z$/, 'Z'))}) from ${snap.inputs.length === 1 ? 'one run' : `${snap.inputs.length} runs`} of our own <a href="${ctx.storeUrl(actorName)}">${ctx.esc(ctx.actorByName[actorName].title)}</a> Actor, each with a small fixed input and a spending cap. ${extra}It is refreshed once a week. The records shown are a sample, not the full feed: the Actor returns every record in the window.</p>
<p>The same records as JSON: <a href="../${snap.dataset}.json">data/${snap.dataset}.json</a>. To reproduce them, run the Actor with ${snap.inputs.length === 1 ? 'this input' : 'these inputs'}:</p>
${snap.inputs.map((i) => ctx.pre(JSON.stringify(i, null, 2), 'Actor input')).join('\n')}
${snap.sourcesFailed?.length ? `<p class="note">Sources that could not be read in this run: ${ctx.esc(snap.sourcesFailed.join(', '))}.</p>` : ''}
</section>`;

// ---------- recalls ----------

function recallsPage(ctx, page) {
  const { esc } = ctx;
  const snap = load('recalls');
  const actor = ctx.actorByName['product-recall-feed'];
  const recs = snap.records;
  const bySource = groupBy(recs, (r) => r.source);
  const hazards = new Map();
  for (const r of recs) for (const h of r.hazardCategories ?? ['other']) hazards.set(h, (hazards.get(h) ?? 0) + 1);
  const hazardRows = [...hazards].sort((a, b) => b[1] - a[1]).map(([h, n]) => [`<code>${esc(h)}</code>`, String(n), [...new Set(recs.filter((r) => (r.hazardCategories ?? ['other']).includes(h)).map((r) => AGENCIES[r.source]?.[0] ?? r.agency))].map(esc).join(', ')]);
  const order = Object.keys(AGENCIES).filter((s) => bySource.has(s));
  const agencySections = order.map((s) => {
    const [name, what] = AGENCIES[s];
    const rows = bySource.get(s).map((r) => [
      `<span class="nowrap">${esc(day(r.date))}</span>`,
      `${r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title)}${r.productType ? `<br><span class="note">${esc(r.productType)}</span>` : ''}`,
      esc(r.hazard ?? ''),
      esc([r.classification, r.severity ? `severity ${r.severity}` : null].filter(Boolean).join(' · ') || '–'),
      esc(r.firm ?? '–'),
    ]);
    return `<h3 id="${s}">${esc(name)}: ${esc(what)} (${rows.length})</h3>\n${table(['Date', 'Recall', 'Hazard', 'Class', 'Firm'], rows, 'data-table')}`;
  });
  const usCount = recs.filter((r) => AGENCIES[r.source]?.[2] === 'US').length;
  const sections = [
    `<section id="summary">
<h2>This week at a glance</h2>
<p>${recs.length} recalls and alerts from ${order.length} agency feeds: ${usCount} from the US (FDA, NHTSA, CPSC; the last 14 days, since FDA publishes enforcement reports weekly) and ${recs.length - usCount} from Canada, the UK and the EU (the last 7 days). At most six of the newest per feed.</p>
<h3>By hazard</h3>
<p>Hazard categories are read from each agency's own wording by a fixed keyword table (no AI); one recall can carry several.</p>
${table(['Hazard category', 'Recalls', 'Agencies'], hazardRows, 'data-table')}
</section>`,
    `<section id="by-agency">
<h2>By agency</h2>
${agencySections.join('\n')}
</section>`,
    howMade(ctx, snap, actor.name, 'Firm names are reproduced as each agency publishes them; the records describe products and firms, not people. '),
    `<section id="sources">
<h2>Sources and attribution</h2>
<ul>
<li>US: FDA enforcement reports through openFDA (<code>api.fda.gov</code>), NHTSA recall campaigns through DOT open data, CPSC recalls through the SaferProducts API. openFDA's own disclaimer applies: do not rely on openFDA to make decisions regarding medical care, and assume results are unvalidated.</li>
<li>Canada: Contains information licensed under the Open Government Licence – Canada (Health Canada, CFIA, Transport Canada).</li>
<li>UK: Contains public sector information licensed under the Open Government Licence v3.0 (OPSS, MHRA, FSA).</li>
<li>EU: © European Union, Safety Gate, published by the European Commission; reusable under Commission Decision 2011/833/EU (CC BY 4.0).</li>
</ul>
<p>Keep these attributions with any redistribution of the records. Not affiliated with or endorsed by FDA, NHTSA, CPSC, Health Canada, CFIA, Transport Canada, OPSS, MHRA, the Food Standards Agency or the European Commission; the names identify the source of each record.</p>
</section>`,
  ];
  const body = frame(ctx, {
    crumbs: `<a href="../../">Home</a> <span aria-hidden="true">›</span> <a href="../">Free data</a> <span aria-hidden="true">›</span> Product recalls`,
    kicker: `Free data · updated ${longDate(snap.generatedAt)}`,
    title: page.title,
    lede: `The newest product recalls and safety alerts from ten government feeds in the US, Canada, the UK and the EU, grouped by agency and by hazard. Generated ${longDate(snap.generatedAt)} from our own recall Actor.`,
    actor,
    ctaText: 'Get every recall as JSON',
    toc: [['summary', 'At a glance'], ['by-agency', 'By agency'], ['method', 'How it is made'], ['sources', 'Sources'], ['faq', 'FAQ']],
    sections,
    faq: [
      ['How do I get every recall, not just this sample?', `Run <a href="${ctx.storeUrl(actor.name)}">${esc(actor.title)}</a> with the input shown above and a larger <code>maxResultsPerSource</code>, or turn on <code>onlyNewSinceLastRun</code> and schedule it daily to receive only new recalls, by webhook if you like.`],
      ['Can I filter by keyword, firm or vehicle?', 'Yes. The Actor takes a keyword (for example "salmonella" or "lithium battery"), a firm name, FDA recall classes and "make, model, year" vehicle lookups. The <a href="../../product-recalls-api/">product recalls API guide</a> lists every field.'],
      ['Is USDA FSIS (meat and poultry) included?', 'No. The Actor reads FDA, NHTSA, CPSC and the Canadian, UK and EU feeds listed above. FSIS publishes its own recall API; see the <a href="../../compare/product-recall-data-sources/">recall data sources comparison</a>.'],
    ],
    related: [['../../product-recalls-api/', 'Product recalls API guide'], ['../../compare/product-recall-data-sources/', 'Product recall data sources compared'], ['../', 'All free data pages']],
  });
  const jsonld = datasetLd(ctx, { path: page.path, name: page.title, description: page.description, snap, credit: 'owlabee, from FDA (openFDA), NHTSA, CPSC, Health Canada (OGL – Canada), OPSS, MHRA and FSA (OGL v3.0) and EU Safety Gate (© European Union, CC BY 4.0)', sources: ['https://open.fda.gov/', 'https://www.nhtsa.gov/', 'https://www.cpsc.gov/', 'https://recalls-rappels.canada.ca/', 'https://www.gov.uk/', 'https://ec.europa.eu/safety-gate-alerts/'] });
  return { body, jsonld, lastmod: day(snap.generatedAt) };
}

// ---------- grants and bids ----------

function grantsPage(ctx, page) {
  const { esc } = ctx;
  const snap = load('grants');
  const actor = ctx.actorByName['grants-gov-api'];
  const fed = snap.records.filter((r) => r.source === 'grantsGov');
  const sled = snap.records.filter((r) => r.source !== 'grantsGov');
  const link = (r) => (r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : esc(r.title));
  const byAgency = [...groupBy(fed, (r) => r.agency)].sort((a, b) => b[1].length - a[1].length);
  const fedRows = fed.map((r) => [`<span class="nowrap">${esc(day(r.postedDate))}</span>`, `${link(r)}<br><span class="note">${esc(r.number ?? '')}</span>`, esc(r.agency ?? ''), esc(r.status ?? ''), `<span class="nowrap">${esc(day(r.closeDate) || '–')}</span>`]);
  const sledGroups = [...groupBy(sled, (r) => r.dataset)];
  const sledSections = Object.keys(SLED_SOURCES).map((k) => {
    const rows = (sledGroups.find(([d]) => d === k)?.[1] ?? []).map((r) => [`<span class="nowrap">${esc(day(r.postedDate))}</span>`, link(r), esc(r.agency ?? ''), `<span class="nowrap">${esc(day(r.closeDate) || '–')}</span>`]);
    const [name, url] = SLED_SOURCES[k];
    return `<h3 id="sled-${k}">${esc(name)} (${rows.length})</h3>\n${rows.length ? table(['Posted', 'Solicitation', 'Department', 'Closes'], rows, 'data-table') : '<p class="note">Nothing matched "services" or "construction" in the last 14 days in this dataset.</p>'}\n<p class="note">Source: <a href="${esc(url)}">${esc(url.replace('https://', ''))}</a> (open data).</p>`;
  });
  const sections = [
    `<section id="summary">
<h2>This week at a glance</h2>
<p>${fed.length} federal grant opportunities posted or forecasted on Grants.gov in the 7 days to ${longDate(snap.generatedAt)}, matching one broad keyword search (research, health, education, community, infrastructure, housing, energy), and ${sled.length} state and local solicitations from three open-data bid datasets (the last 14 days, keywords "services" and "construction").</p>
${table(['Agency', 'New opportunities'], byAgency.slice(0, 12).map(([a, rs]) => [esc(a), String(rs.length)]), 'data-table')}
</section>`,
    `<section id="federal">
<h2>Federal grants (Grants.gov)</h2>
${table(['Posted', 'Opportunity', 'Agency', 'Status', 'Closes'], fedRows, 'data-table')}
<p class="note">Federal contract notices from SAM.gov are not on this page: the SAM.gov API needs each user's own free key. The Actor reads SAM.gov with yours.</p>
</section>`,
    `<section id="state-local">
<h2>State and local bids</h2>
${sledSections.join('\n')}
</section>`,
    howMade(ctx, snap, actor.name, 'Only the opportunity is shown: agency points of contact, vendors and award recipients are left off this page. '),
    `<section id="sources">
<h2>Sources</h2>
<p>Federal opportunities come from the Grants.gov <code>search2</code> API (<a href="https://www.grants.gov/api/common/search2">grants.gov/api</a>), which needs no key. State and local records come from the open-data datasets linked above, read through their public Socrata APIs. Use the data in compliance with each source's terms. Not affiliated with or endorsed by Grants.gov, HHS, SAM.gov, GSA or the cities, counties and states named; the names identify the source of the records.</p>
</section>`,
  ];
  const body = frame(ctx, {
    crumbs: `<a href="../../">Home</a> <span aria-hidden="true">›</span> <a href="../">Free data</a> <span aria-hidden="true">›</span> Grants and bids`,
    kicker: `Free data · updated ${longDate(snap.generatedAt)}`,
    title: page.title,
    lede: `Federal grant opportunities posted on Grants.gov this week, plus new city, county and state solicitations from open-data bid datasets. Generated ${longDate(snap.generatedAt)} from our own grants Actor.`,
    actor,
    ctaText: 'Get every opportunity as JSON',
    toc: [['summary', 'At a glance'], ['federal', 'Federal grants'], ['state-local', 'State & local bids'], ['method', 'How it is made'], ['sources', 'Sources'], ['faq', 'FAQ']],
    sections,
    faq: [
      ['How do I get opportunities for my own keywords?', `Run <a href="${ctx.storeUrl(actor.name)}">${esc(actor.title)}</a> with your keywords. Add <code>"samGov"</code> to <code>sources</code> with your free SAM.gov key for federal contract notices, and turn on <code>onlyNewSinceLastRun</code> on a daily schedule to receive only what is new or changed.`],
      ['Which state and local datasets are covered?', 'Nineteen official open-data datasets (Los Angeles, New York City, Montgomery County MD, Mesa AZ, Cook County IL, Illinois, Delaware, California, New York SUCF, TxDOT, Baton Rouge, San Diego County and the national E-Rate Form 470 file). The <a href="../../grants-gov-api/">Grants.gov API guide</a> lists them.'],
      ['Can it rank opportunities for my organization?', `Yes, a separate Actor does that: <a href="${ctx.storeUrl('grant-matching')}">${esc(ctx.actorByName['grant-matching'].title)}</a> scores each opportunity against a profile of your organization and explains the score.`],
    ],
    related: [['../../grants-gov-api/', 'Grants.gov API guide'], ['../../sam-gov-contract-opportunities/', 'SAM.gov contract opportunities guide'], ['../../compare/grants-gov-api-alternatives/', 'Grants.gov API vs alternatives'], ['../', 'All free data pages']],
  });
  const jsonld = datasetLd(ctx, { path: page.path, name: page.title, description: page.description, snap, credit: 'owlabee, from the Grants.gov search2 API and the open-data portals of the City of Los Angeles, Montgomery County (MD) and the State of Delaware', sources: ['https://www.grants.gov/', ...Object.values(SLED_SOURCES).map(([, u]) => u)] });
  return { body, jsonld, lastmod: day(snap.generatedAt) };
}

// ---------- building permits ----------

function permitsPage(ctx, page) {
  const { esc } = ctx;
  const snap = load('permits');
  const actor = ctx.actorByName['building-permits-scraper'];
  const byCity = [...groupBy(snap.records, (r) => r.jurisdiction)];
  const summaryRows = byCity.map(([j, rs]) => {
    const costs = rs.map((r) => r.estimatedCost).filter((n) => typeof n === 'number');
    const types = [...groupBy(rs, (r) => r.permitType)].sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([t]) => t);
    return [`<a href="#${esc(j)}">${esc(rs[0].jurisdictionName)}</a>`, String(rs.length), costs.length ? money(costs.reduce((a, b) => a + b, 0)) : 'not published', esc(types.join(', '))];
  });
  const citySections = byCity.map(([j, rs]) => {
    const [name, url] = PERMIT_SOURCES[j] ?? [null, null];
    const rows = rs.map((r) => [`<span class="nowrap">${esc(r.issuedDate ?? '')}</span>`, `${esc(r.permitType ?? '')}${r.permitSubtype ? `<br><span class="note">${esc(r.permitSubtype)}</span>` : ''}`, esc(r.status ?? '–'), `<span class="nowrap">${money(r.estimatedCost)}</span>`, `${esc(r.street ?? '–')}${r.city ? `, ${esc(r.city)}` : ''}`, `<code>${esc(r.permitNumber ?? '')}</code>`]);
    return `<h3 id="${esc(j)}">${esc(rs[0].jurisdictionName)} (${rs.length})</h3>\n${table(['Issued', 'Permit type', 'Status', 'Valuation', 'Street, city', 'Permit number'], rows, 'data-table')}${name ? `\n<p class="note">Source: ${url ? `<a href="${esc(url)}">${esc(name)}</a>` : esc(name)}, the jurisdiction's open-data portal.</p>` : ''}`;
  });
  const sections = [
    `<section id="summary">
<h2>This week at a glance</h2>
<p>The newest permits issued in ten US cities in the 7 days to ${longDate(snap.generatedAt)}: at most seven per city, newest first. Valuation is the declared or estimated job cost as the city publishes it (some publish none, and some publish placeholder values such as $1).</p>
${table(['City', 'Permits shown', 'Valuation of those shown', 'Most common types'], summaryRows, 'data-table')}
</section>`,
    `<section id="by-city">
<h2>By city</h2>
<p>Location is shown at street level only: house numbers are removed. Names of owners, applicants and contractors are not shown on this page.</p>
${citySections.join('\n')}
</section>`,
    howMade(ctx, snap, actor.name, 'Each record is cut down to permit type, status, dates, valuation, permit number and the street and city of the site. '),
    `<section id="notice">
<h2>Legal</h2>
<p><strong>${esc(NOTICE)}</strong> These are public records published by each city under its open-data terms, shown as published (with the house number removed). Not affiliated with or endorsed by any of the cities named; their names identify the source of the records. If you use permit records for outreach, telemarketing laws apply (in the US the TCPA and the National Do Not Call Registry).</p>
</section>`,
  ];
  const body = frame(ctx, {
    crumbs: `<a href="../../">Home</a> <span aria-hidden="true">›</span> <a href="../">Free data</a> <span aria-hidden="true">›</span> Building permits`,
    kicker: `Free data · updated ${longDate(snap.generatedAt)}`,
    title: page.title,
    lede: `New building permits issued this week in New York, Chicago, San Francisco, Seattle, Austin, Boston, Nashville, Denver, Raleigh and Columbus: type, status, valuation and street. Generated ${longDate(snap.generatedAt)} from our own permits Actor.`,
    actor,
    ctaText: 'Get every permit as JSON',
    toc: [['summary', 'At a glance'], ['by-city', 'By city'], ['method', 'How it is made'], ['notice', 'Legal'], ['faq', 'FAQ']],
    sections,
    faq: [
      ['How do I get every permit, or only roofing or solar permits?', `Run <a href="${ctx.storeUrl(actor.name)}">${esc(actor.title)}</a> with your cities, a date window and <code>permitTypes</code> such as <code>["roof", "solar"]</code>, or a <code>minEstimatedCost</code>. Monitor mode (<code>onlyNewSinceLastRun</code>) on a daily schedule returns only permits not seen before.`],
      ['Which cities are covered?', 'The Actor reads 120 official open-data datasets: 102 US cities, counties, states and trade-permit datasets, and 18 Canadian ones. The <a href="../../building-permits-api/">building permits API guide</a> explains the fields; the Actor\'s README lists every jurisdiction.'],
      ['What about cities on Accela or EnerGov portals?', `A sister Actor reads those: <a href="${ctx.storeUrl('accela-energov-permit-scraper')}">${esc(ctx.actorByName['accela-energov-permit-scraper'].title)}</a>, in the same schema.`],
    ],
    related: [['../../building-permits-api/', 'Building permits API guide'], ['../../accela-energov-permits/', 'Accela and EnerGov permits guide'], ['../../compare/building-permit-data-apis/', 'Building permit data APIs compared'], ['../', 'All free data pages']],
  });
  const jsonld = datasetLd(ctx, { path: page.path, name: page.title, description: page.description, snap, credit: 'owlabee, from the open-data portals of the cities named', sources: Object.values(PERMIT_SOURCES).map(([, u]) => u).filter(Boolean) });
  return { body, jsonld, lastmod: day(snap.generatedAt) };
}

// ---------- hub ----------

function hubPage(ctx, page, list) {
  const { esc } = ctx;
  const body = `
<article>
<div class="guide-head">
<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> <span aria-hidden="true">›</span> Free data</nav>
<p class="kicker">Free data · refreshed weekly</p>
<h1>${esc(page.title)}</h1>
<p class="lede">Weekly snapshots of public records, made by running our own Actors on a small, fixed input: product recalls, grant and bid opportunities, and building permits. Free to read and to download as JSON.</p>
</div>
<section>
<h2>Pages</h2>
<ul class="cards">
${list.map((p) => `<li><a href="../${p.path}"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span><em aria-hidden="true">${esc(p.updated ? `Updated ${longDate(p.updated)}` : 'Open')} →</em></a></li>`).join('\n')}
</ul>
</section>
<section>
<h2>About the snapshots</h2>
<p>Each page shows a sample of the newest records, cut down to a few fields, and links to the same records as JSON in <code>/data/</code>. Each source's attribution and licence line is on its page. Names of individuals are never shown: permits list the street, not the house number, and grant pages list the opportunity, not its contacts.</p>
<p>For the full feed, your own filters or a daily schedule, run the Actor behind each page on Apify Store; every page links to it.</p>
</section>
</article>`;
  return { body };
}

const listMeta = [
  { id: 'recalls', path: 'data/product-recalls-this-week/', nav: 'Product recalls this week', title: "This week's product recalls: FDA, NHTSA, CPSC, Canada, UK and EU", description: 'The newest product recalls and safety alerts from ten government feeds, grouped by agency and hazard, updated weekly. Free, with a JSON download.', render: recallsPage },
  { id: 'grants', path: 'data/grant-and-bid-opportunities-this-week/', nav: 'Grants and bids this week', title: 'New federal grant and bid opportunities this week', description: 'Grants.gov opportunities posted this week plus new city, county and state solicitations from open-data bid datasets, updated weekly, with a JSON download.', render: grantsPage },
  { id: 'permits', path: 'data/building-permits-this-week/', nav: 'Building permits this week', title: 'New building permits by city this week', description: 'Building permits issued this week in ten US cities: permit type, status, valuation and street, updated weekly from official open data, with a JSON download.', render: permitsPage },
];

// The pages build-site writes: { path, title, description, group, render(ctx) -> { body, jsonld?, lastmod? } }.
export const dataPages = (() => {
  const list = listMeta.filter((p) => load(p.id)).map((p) => ({ ...p, group: 'data', updated: day(load(p.id).generatedAt), render: (ctx) => p.render(ctx, p) }));
  const hub = { path: 'data/', nav: 'Free data', title: 'Free public data, refreshed weekly', description: 'Free weekly snapshots of product recalls, grant and bid opportunities and building permits, made with owlabee Actors, with JSON downloads.', group: 'hub' };
  hub.render = (ctx) => hubPage(ctx, hub, list);
  return list.length ? [hub, ...list] : [];
})();
