// Comparison pages: owlabee.com/compare/ and one page per topic. Rendered by tools/build-site.mjs
// through tools/discovery-pages.mjs.
//
// Rules for this file: only facts we checked, each with its source and the date we checked it;
// say where an alternative is better; describe, never disparage. Prices are quoted as each
// vendor publishes them on the date given and will change, so every number carries that date.
// Apify Store numbers come from one GET https://api.apify.com/v2/store?search=<topic> request per
// page (users = Store "total users"; price = the primary per-result event on the Free tier).
import { frame } from './data-pages.mjs';

const CHECKED = '2026-11-08';
const CHECKED_LONG = 'November 8, 2026';

const a = (href, text) => `<a href="${href}">${text}</a>`;

function table(head, rows) {
  return `<div class="table-wrap"><table class="data-table">
<thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
<tbody>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</tbody>
</table></div>`;
}

const storeTable = (rows, search) => `${table(
  ['Actor', 'Total users', 'Primary price per result'],
  rows.map(([id, title, users, price]) => [`${a(`https://apify.com/${id}`, title)}<br><span class="note"><code>${id}</code></span>`, String(users), price]),
)}
<p class="note">From the Apify Store API (<code>GET https://api.apify.com/v2/store?search=${encodeURIComponent(search)}</code>) on ${CHECKED_LONG}, the most-used results. Store pages show current figures; most Actors also charge a small per-run start fee.</p>`;

const sourcesList = (items) => `<section id="sources">
<h2>Sources</h2>
<p>All checked on ${CHECKED_LONG} unless noted.</p>
<ul>
${items.map(([href, text]) => `<li>${a(href, text)}</li>`).join('\n')}
</ul>
</section>`;

const TOPICS = [
  {
    slug: 'building-permit-data-apis',
    nav: 'Building permit data APIs',
    title: 'Building permit data APIs compared',
    description: 'City open-data portals, Shovels, ATTOM and Apify Actors for building permit data: coverage, freshness and published prices, checked November 2026.',
    actor: 'building-permits-scraper',
    lede: 'Four ways to get building permit records into your own systems: read each city\'s open-data portal yourself, buy a national dataset (Shovels, ATTOM), or run an Actor that reads the portals for you. What each one is, what it costs where the price is published, and where each is the better choice.',
    summary: [
      ['City open-data portals (Socrata, ArcGIS, CKAN)', 'Each city\'s own permit dataset, through its public API', 'Free; a free app token raises Socrata rate limits', 'One or two cities, full control, no vendor'],
      ['Shovels', 'National permit, contractor and property data, AI-classified; web app, API, CLI', 'Free plan with 500 credits a month and 1 year of history; Basic $599/month (25,000 credits); Pro $999/month (50,000); 1 credit = 1 record', 'National coverage and long history'],
      ['ATTOM', 'Building permits within its national property data', 'Permit data by quote; its Property Data API lists Basic plans from $500/month', 'Property-level history alongside assessor, sales and mortgage data'],
      ['Our Actor: Building Permits Scraper', '120 official open-data datasets (102 US, 18 Canadian) in one normalized schema, with monitor mode', '$0.002 per permit, per jurisdiction queried and per results page (Store API)', 'Fresh daily permits from the cities it covers, pay per use'],
    ],
    body: () => `
<section id="portals">
<h2>City open-data portals</h2>
<p>Most large US cities publish issued permits on an open-data portal, usually Socrata (Tyler Data &amp; Insights), ArcGIS or CKAN, with a public API and no login. It is the original source, it is free, and it is usually updated daily. Socrata's documentation says requests without an application token "come from a shared pool via IP address" and may be throttled, while a free token lets the portal throttle by application instead, with a higher limit (${a('https://dev.socrata.com/docs/app-tokens.html', 'Socrata: Application Tokens')}).</p>
<p>The cost is your time: every city names its columns differently, stores dates and valuations differently, and some publish no valuation or contractor at all. Two cities are easy; twenty is a maintenance job.</p>
</section>

<section id="shovels">
<h2>Shovels</h2>
<p>Shovels sells national permit data with AI-classified permit types, contractor profiles, properties, zoning decisions and resident records, through a web app, a REST API, a CLI and a Google Sheets add-on. Its pricing page lists a Free plan (500 credits a month, 1 year of record history, 1 seat), Basic at $599 a month (25,000 credits, full history), Pro at $999 a month (50,000 credits, up to 2 seats) and custom Enterprise plans; "1 credit = 1 record" (${a('https://www.shovels.ai/pricing', 'shovels.ai/pricing')}).</p>
</section>

<section id="attom">
<h2>ATTOM</h2>
<p>ATTOM's building permit page says it holds "over 300 million building permits from over 2,000 building departments nationwide", updated monthly, with permit type classification, status, job cost, description and contractor information; pricing is by quote (${a('https://www.attomdata.com/solutions/nationwide-building-permit-data/', 'ATTOM: Nationwide Building Permit Data')}). Its Property Data API pricing page lists Basic Property plans starting at $500 a month and notes that endpoint availability varies by licence (${a('https://www.attomdata.com/solutions/delivery/property-data-api/pricing/', 'ATTOM: Property Data API pricing')}).</p>
</section>

<section id="ours">
<h2>Our Actor: Building Permits Scraper</h2>
<p>${a('https://apify.com/owlabee/building-permits-scraper', 'Building Permits Scraper')} reads 120 official open-data datasets (61 original US cities, counties and states, 14 trade-permit datasets, 27 more US entries and 18 Canadian ones) and returns one schema: permit number, type, status, dates, valuation, site address, and contractor name, licence and phone where the city publishes them. Monitor mode returns only permits not seen on earlier runs. On ${CHECKED_LONG} the Store API listed $0.002 per permit, $0.002 per jurisdiction queried and $0.002 per results page. A sister Actor, ${a('https://apify.com/owlabee/accela-energov-permit-scraper', 'Accela Citizen Access &amp; EnerGov Permit Scraper')}, covers 31 cities and counties on those portals. See this week's sample on <a href="../../data/building-permits-this-week/">New building permits by city this week</a>.</p>
<p>Limits: only jurisdictions that publish open data are covered, history goes back as far as each portal keeps, and it does not classify permits beyond the city's own type and subtype.</p>
</section>

<section id="better">
<h2>Where the alternatives are better</h2>
<ul>
<li><strong>National coverage and history:</strong> Shovels and ATTOM cover thousands of building departments, including ones with no open-data portal. Our Actor covers only the 120 datasets it lists.</li>
<li><strong>Permit classification:</strong> Shovels classifies permits with AI and ATTOM lists permit type classifiers; our Actor keeps each city's own type and subtype, which you filter by keyword.</li>
<li><strong>One city, no vendor:</strong> the city's own API is free and is the source of record.</li>
<li><strong>Our Actor fits</strong> when you want the newest permits from many of the covered cities in one schema, on a daily schedule, and pay only for what a run returns.</li>
</ul>
</section>

<section id="store">
<h2>Other building permit Actors on Apify Store</h2>
${storeTable([
  ['pink_comic/building-permits-construction-leads', 'Building Permits Scraper - Contractor &amp; Construction Leads', 162, '$0.002'],
  ['intelscrape/building-permit-scraper', 'Building Permits Scraper — Contractor &amp; Construction Leads', 113, '$0.005'],
  ['hanamira/building-permits-search', 'Building Permits Search', 66, '$0.004'],
  ['inexhaustible_glass/us-building-permits-scraper', 'US Building Permits Scraper — Construction Leads', 53, '$0.008'],
  ['owlabee/building-permits-scraper', 'Building Permits Scraper — Roofing &amp; Construction Leads (ours)', 3, '$0.002'],
], 'building permits')}
</section>`,
    sources: [
      ['https://dev.socrata.com/docs/app-tokens.html', 'Socrata developer docs: Application Tokens'],
      ['https://www.shovels.ai/pricing', 'Shovels: Pricing'],
      ['https://www.attomdata.com/solutions/nationwide-building-permit-data/', 'ATTOM: Nationwide Building Permit Data'],
      ['https://www.attomdata.com/solutions/delivery/property-data-api/pricing/', 'ATTOM: Property Data API pricing'],
      ['https://apify.com/owlabee/building-permits-scraper', 'Building Permits Scraper on Apify Store'],
      ['https://api.apify.com/v2/store?search=building%20permits', 'Apify Store API: search "building permits"'],
    ],
    related: [['../../building-permits-api/', 'Building permits API guide'], ['../../data/building-permits-this-week/', 'New building permits by city this week'], ['../', 'All comparisons']],
  },
  {
    slug: 'pacer-docket-alert-options',
    nav: 'PACER docket alerts',
    title: 'PACER docket alert options compared',
    description: 'PACER itself, court RSS feeds, CourtListener docket alerts, PacerMonitor and Apify Actors for new federal court filing alerts: coverage, published prices and limits.',
    actor: 'pacer-docket-monitor',
    lede: 'Ways to hear about new filings in federal cases: check PACER yourself, read the courts\' free RSS feeds, use CourtListener\'s docket alerts, subscribe to a commercial service such as PacerMonitor, or run an Actor on the RSS feeds. What each costs where the price is published, and what each misses.',
    summary: [
      ['PACER (pacer.uscourts.gov)', 'The official record: dockets and documents for every federal court', '$0.10 per page, at most $3 per document (searches, reports and transcripts uncapped); billed only above $30 a quarter', 'Reading the docket and the documents themselves'],
      ['Court RSS feeds (CM/ECF)', 'New docket entries as each court chooses to publish them', 'Free, no login', 'Watching whole courts, if the court publishes a full feed'],
      ['CourtListener docket alerts (Free Law Project)', 'Email or webhook alerts on dockets you follow, from RSS and other sources', 'A number of alerts free (more with the RECAP extension); members unlimited; bulk commercial rates on request', 'Individuals following specific cases'],
      ['PacerMonitor', 'Federal case research with custom alerts', 'Plus $49/month (5 alerts), Professional $99/month (20), Enterprise $499/month (15 users, unlimited); API by quote', 'Teams that want a research tool with alerts'],
      ['Our Actor: PACER RSS Docket Monitor', 'New entries from court RSS feeds, filtered by party, case, entry type or keyword, as JSON', '$0.005 per court feed checked, $0.003 per matching entry, $0.001 per unfiltered entry (Store API)', 'Feeding new filings into your own systems on a schedule'],
    ],
    body: (ctx) => {
      const c = ctx.courtFeedStats;
      return `
<section id="pacer">
<h2>PACER</h2>
<p>PACER is the federal judiciary's own access service and the source every other option draws on. Its fee page: "$0.10 per page", "You won't be charged more than $3 per document", no maximum for search results, non-case-specific reports or transcripts, "$2.40 per audio file", and "Users are billed on a quarterly basis if they accrue more than $30 in the previous quarter" (${a('https://pacer.uscourts.gov/pacer-pricing-how-fees-work', 'PACER: How fees work')}). PACER is where you read the documents; it is not an alert service.</p>
</section>

<section id="rss">
<h2>Court RSS feeds</h2>
<p>Many district and bankruptcy courts publish an RSS feed of new docket entries from CM/ECF, free and without a login, but each court decides whether to publish one and which entry types it carries. Our own probe of every court's feed (district and bankruptcy courts on ${c.sweptAt}, appellate and national courts on ${c.probedAt}) found: district courts ${c.district.full} full, ${c.district.partial} partial, ${c.district.empty} empty, ${c.district.unreachable} that did not answer from a datacenter IP; bankruptcy courts ${c.bankruptcy.full} full, ${c.bankruptcy.partial} partial, ${c.bankruptcy.empty} empty, ${c.bankruptcy.unreachable} no answer; courts of appeals ${c.appellate.partial} partial and ${c.appellate.empty} empty. The court-by-court table is on <a href="../../pacer-rss-feeds-by-court/">PACER RSS feeds by court</a>.</p>
</section>

<section id="courtlistener">
<h2>CourtListener docket alerts</h2>
<p>Free Law Project's CourtListener sends docket alerts by email or webhook "when there are new filings in cases" (${a('https://wiki.free.law/c/courtlistener/help/alerts', 'CourtListener help: Alerts')}). Its help page says it allows a number of docket alerts for free, gives a bonus to users with the RECAP browser extension, lets members "create as many docket alerts as they need" while monitoring for commercial usage, and offers bulk commercial rates; it also says alerts "are only as good as our sources", and that for less active cases they may take longer "or may not arrive at all" (${a('https://wiki.free.law/c/courtlistener/help/alerts/docket-alerts-for-pacer', 'CourtListener help: Docket Alerts for PACER')}). For a person following a handful of cases, this is the best free option.</p>
</section>

<section id="pacermonitor">
<h2>PacerMonitor</h2>
<p>PacerMonitor's pricing page lists Plus at $49 a month (single user, documents 15¢ a page, 5 custom alerts), Professional at $99 a month (documents 10¢ a page, 20 custom alerts), Enterprise at $499 a month (15 users, unlimited custom alerts), an API by quote, and a free account at a flat $5 per document (${a('https://www.pacermonitor.com/pricing', 'PacerMonitor: Plans and Pricing')}).</p>
</section>

<section id="ours">
<h2>Our Actor: PACER RSS Docket Monitor</h2>
<p>${a('https://apify.com/owlabee/pacer-docket-monitor', 'PACER RSS Docket Monitor')} reads the courts' public RSS feeds, normalizes each entry (court, case number, case type, entry text, document link, filed time) and filters by party, case number, case type, entry type, keyword or bankruptcy chapter; monitor mode returns only entries not seen on earlier runs, with an optional webhook. On ${CHECKED_LONG} the Store API listed $0.005 per court feed checked, $0.003 per matching entry and $0.001 per entry when no filter is set. It sees only what the feeds publish: no documents, nothing from courts with empty feeds, and older filings only through an optional CourtListener pass with your own CourtListener token.</p>
</section>

<section id="better">
<h2>Where the alternatives are better</h2>
<ul>
<li><strong>Following a few specific cases:</strong> CourtListener docket alerts are free up to its limit and draw on more sources than RSS alone.</li>
<li><strong>Reading documents:</strong> PACER (or a service that resells its documents, such as PacerMonitor) is required; RSS feeds and our Actor give the entry and a link, not the PDF.</li>
<li><strong>Courts without a full feed:</strong> a commercial service that polls dockets will see entries that a partial or empty feed never publishes.</li>
<li><strong>Our Actor fits</strong> when you want every new entry matching a filter across many courts, as structured JSON in your own pipeline, on a schedule.</li>
</ul>
</section>

<section id="store">
<h2>Other PACER Actors on Apify Store</h2>
<p>Most of these search the RECAP archive (historical dockets) rather than monitoring live feeds.</p>
${storeTable([
  ['pink_comic/recap-federal-court-dockets', 'Federal Court Dockets Search - PACER/RECAP Diligence API', 22, '$0.002'],
  ['haketa/federal-court-records-scraper', 'Federal Court Records Scraper - PACER RECAP &amp; Opinions', 18, '$0.003'],
  ['andrew_avina/pacer-intelligence-mcp', 'PACER Court Records Intelligence MCP — 1B+ Federal Cases', 17, '$0.003'],
  ['moving_beacon-owner1/pacer-rss-docket-monitor', 'PACER RSS Docket Monitor', 3, '$0.00999'],
  ['owlabee/pacer-docket-monitor', 'PACER RSS Docket Monitor — New Federal Court Filings (ours)', 1, '$0.003 per match'],
], 'pacer')}
</section>`;
    },
    sources: [
      ['https://pacer.uscourts.gov/pacer-pricing-how-fees-work', 'PACER: Pricing, how fees work'],
      ['https://wiki.free.law/c/courtlistener/help/alerts', 'CourtListener help: Alerts'],
      ['https://wiki.free.law/c/courtlistener/help/alerts/docket-alerts-for-pacer', 'CourtListener help: Docket Alerts for PACER'],
      ['https://www.pacermonitor.com/pricing', 'PacerMonitor: Plans and Pricing'],
      ['../../pacer-rss-feeds-by-court/', 'owlabee: PACER RSS feeds by court (our probe of every feed)'],
      ['https://apify.com/owlabee/pacer-docket-monitor', 'PACER RSS Docket Monitor on Apify Store'],
      ['https://api.apify.com/v2/store?search=pacer', 'Apify Store API: search "pacer"'],
    ],
    related: [['../../pacer-rss-docket-monitor/', 'PACER RSS docket monitor guide'], ['../../pacer-rss-feeds-by-court/', 'PACER RSS feeds by court'], ['../', 'All comparisons']],
  },
  {
    slug: 'product-recall-data-sources',
    nav: 'Product recall data sources',
    title: 'Product recall data sources compared',
    description: 'openFDA, NHTSA, CPSC, USDA FSIS, Health Canada, UK and EU Safety Gate recall data, and Apify Actors that combine them: access, limits and licences.',
    actor: 'product-recall-feed',
    lede: 'Recall data is free from the agencies that publish it, but each agency has its own API, schema, update cadence and licence. This page lists the official sources, what each needs, and when a combined feed saves work.',
    summary: [
      ['openFDA (FDA)', 'Drug, device and food enforcement reports; device recall database', 'Free API key; 240 requests a minute; 120,000 a day per key (1,000 a day per IP without one)', 'FDA-only work, adverse events and labels too'],
      ['NHTSA', 'Vehicle, equipment, tire and child-seat recall campaigns; lookups by make, model and year', 'Free', 'Vehicle recalls by VIN-level detail and model'],
      ['CPSC (SaferProducts API)', 'Consumer product recalls', 'Free; XML or JSON', 'Consumer products in the US'],
      ['USDA FSIS Recall API', 'Meat, poultry and egg product recalls and public health alerts', 'Free; JSON', 'Meat and poultry, which FDA does not cover'],
      ['Health Canada, UK (OPSS, MHRA, FSA), EU Safety Gate', 'National recall and alert feeds', 'Free under open licences that require attribution', 'Products sold outside the US'],
      ['Our Actor: Product Recall Feed', 'FDA, NHTSA and CPSC by default; Canada, UK and EU feeds opt-in; one schema, hazard categories, changes mode', '$0.002 per recall, $0.004 per agency request, $0.01 per bulk file (Store API)', 'One normalized multi-agency feed on a schedule'],
    ],
    body: () => `
<section id="us">
<h2>US agencies</h2>
<h3>openFDA</h3>
<p>openFDA serves FDA's drug, device and food enforcement reports (and much more) as JSON. Its authentication page states the limits: "With no API key: 240 requests per minute, per IP address. 1,000 requests per day, per IP address. With an API key: 240 requests per minute, per key. 120,000 requests per day, per key." Its page also says a key is required and "is free of charge" (${a('https://open.fda.gov/apis/authentication/', 'openFDA: Authentication')}). FDA publishes enforcement reports weekly.</p>
<h3>NHTSA</h3>
<p>NHTSA publishes recall campaigns as open data and through its public API at ${a('https://api.nhtsa.gov/', 'api.nhtsa.gov')}, including recalls by make, model and year, with no key.</p>
<h3>CPSC</h3>
<p>CPSC's recalls API page says the data "is publicly available to consumers and businesses as well as software and application developers" and "can be retrieved in XML or in JSON" (${a('https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information', 'CPSC: Recalls API information')}).</p>
<h3>USDA FSIS</h3>
<p>FSIS, which covers meat, poultry and processed egg products, launched a Recall API for recalls and public health alerts in JSON in 2023 (${a('https://www.fsis.usda.gov/news-events/news-press-releases/fsis-launches-new-data-tool-recall-and-public-health-alert-api', 'FSIS press release')}). Our Actor does not read it.</p>
</section>

<section id="intl">
<h2>Canada, UK and EU</h2>
<ul>
<li><strong>Health Canada</strong> publishes recalls and safety alerts (including CFIA and Transport Canada) as one open-data JSON file on ${a('https://recalls-rappels.canada.ca/en', 'recalls-rappels.canada.ca')}. Attribution: "Contains information licensed under the Open Government Licence – Canada."</li>
<li><strong>UK:</strong> OPSS product safety reports and MHRA drug and device alerts are on GOV.UK, and Food Standards Agency alerts on <code>data.food.gov.uk</code>. Attribution: "Contains public sector information licensed under the Open Government Licence v3.0."</li>
<li><strong>EU Safety Gate</strong> publishes weekly reports of dangerous non-food products (${a('https://ec.europa.eu/safety-gate-alerts/screen/webReport', 'Safety Gate')}). Attribution: "© European Union", reusable under Commission Decision 2011/833/EU (CC BY 4.0).</li>
</ul>
</section>

<section id="ours">
<h2>Our Actor: Product Recall Feed</h2>
<p>${a('https://apify.com/owlabee/product-recall-feed', 'Product Recall Feed')} reads FDA (drug, device, food), NHTSA and CPSC by default, and the FDA device recall database, FDA press releases, Health Canada, OPSS, MHRA, FSA and EU Safety Gate on request. Every record has the same fields (agency, date, title, product, hazard, classification, severity, firm, remedy, url) plus hazard categories read by a fixed keyword table, and a changes mode that returns only recalls not seen before. On ${CHECKED_LONG} the Store API listed $0.002 per recall, $0.004 per agency API request and $0.01 per bulk file download (the Health Canada file). This week's sample: <a href="../../data/product-recalls-this-week/">This week's product recalls</a>.</p>
</section>

<section id="better">
<h2>Where the alternatives are better</h2>
<ul>
<li><strong>One agency only:</strong> calling openFDA, NHTSA or CPSC directly is free and gives every field the agency publishes.</li>
<li><strong>Meat and poultry:</strong> use the FSIS Recall API; our Actor does not cover FSIS.</li>
<li><strong>FDA beyond recalls:</strong> openFDA also serves adverse events, labels and NDC data, which our Actor does not.</li>
<li><strong>Our Actor fits</strong> when you need several agencies, or several countries, in one schema on a daily schedule, without maintaining ten integrations.</li>
</ul>
</section>

<section id="store">
<h2>Other recall Actors on Apify Store</h2>
${storeTable([
  ['gabrielaxy/product-recall-aggregator', 'Product Recall Aggregator', 6, 'free'],
  ['koalastuff/eu-safety-gate-alert-monitor', 'EU Safety Gate Product Recalls &amp; Alerts API', 4, 'tiered, see Store'],
  ['datapilot/product-recall-monitor', 'Product Recall Monitor', 3, '$0.002'],
  ['foo121/recall-aggregator', 'Product Recall Aggregator — FDA, NHTSA &amp; CPSC', 3, '$0.004'],
  ['owlabee/product-recall-feed', 'Product Recall Feed — FDA, NHTSA &amp; CPSC Recalls API (ours)', 2, '$0.002'],
], 'product recall')}
</section>`,
    sources: [
      ['https://open.fda.gov/apis/authentication/', 'openFDA: Authentication and limits'],
      ['https://api.nhtsa.gov/', 'NHTSA API'],
      ['https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information', 'CPSC: Recalls API information'],
      ['https://www.fsis.usda.gov/news-events/news-press-releases/fsis-launches-new-data-tool-recall-and-public-health-alert-api', 'USDA FSIS: Recall and public health alert API (press release)'],
      ['https://recalls-rappels.canada.ca/en', 'Health Canada: Recalls and safety alerts'],
      ['https://ec.europa.eu/safety-gate-alerts/screen/webReport', 'EU Safety Gate'],
      ['https://apify.com/owlabee/product-recall-feed', 'Product Recall Feed on Apify Store'],
      ['https://api.apify.com/v2/store?search=product%20recall', 'Apify Store API: search "product recall"'],
    ],
    related: [['../../product-recalls-api/', 'Product recalls API guide'], ['../../data/product-recalls-this-week/', "This week's product recalls"], ['../', 'All comparisons']],
  },
  {
    slug: 'grants-gov-api-alternatives',
    nav: 'Grants.gov API vs alternatives',
    title: 'Grants.gov API vs alternatives',
    description: 'The Grants.gov search2 API, Simpler.Grants.gov API, the Grants.gov XML extract, SAM.gov, USAspending, Instrumentl and Apify Actors for finding grant opportunities.',
    actor: 'grants-gov-api',
    lede: 'Federal grant opportunities are free from the government in four shapes (two APIs, a daily file and the website), and commercial tools add foundation grants and workflow on top. What each one gives you, what it needs, and where it is the better choice.',
    summary: [
      ['Grants.gov search2 API', 'Keyword and filter search of federal opportunities', 'Free; "Authentication and authorization is not required"', 'Simple searches from your own code'],
      ['Simpler.Grants.gov API', 'Search and full details for every opportunity', 'Free API key; 60 requests a minute and 10,000 a day per key by default', 'Production integrations that want richer fields'],
      ['Grants.gov XML extract', 'The whole opportunity database as one daily file', 'Free; about 78 MB zipped (November 2026)', 'Loading everything into your own database'],
      ['SAM.gov Get Opportunities API', 'Federal contract notices (not grants)', 'Free personal API key; daily limits by account role', 'Contracting, not grants'],
      ['Instrumentl', 'Grant discovery and workflow, including private foundations', 'From $299/month paid annually ($349 monthly), up to $999/month', 'Nonprofit grant teams'],
      ['Our Actor: Grants.gov API &amp; SAM.gov Scraper', 'Grants.gov, SAM.gov (your key), USAspending, NIH, NSF, Federal Register and 19 state and local bid datasets in one schema', '$0.001 per record, $0.004 per source and keyword searched (Store API)', 'A scheduled multi-source feed without code'],
    ],
    body: () => `
<section id="grants-gov">
<h2>Grants.gov: two APIs and a daily file</h2>
<p><strong>search2.</strong> The Grants.gov <code>search2</code> endpoint (<code>POST https://api.grants.gov/v1/api/search2</code>) searches opportunities by keyword, status, agency, eligibility, funding category and assistance listing; its documentation says "Authentication and authorization is not required for search2" (${a('https://www.grants.gov/api/common/search2', 'Grants.gov: search2')}). It returns summary fields; details take a second call per opportunity.</p>
<p><strong>Simpler.Grants.gov API.</strong> The newer API needs a free key and, per its developer page, supports keyword and fielded search, pagination, sorting and full details for one opportunity, with default rate limits of "60 requests per minute and 10,000 requests per day per key"; inactive keys are disabled after 30 days without use (${a('https://simpler.grants.gov/developer', 'Simpler.Grants.gov: Developers')}).</p>
<p><strong>XML extract.</strong> "Once a day, the Grants.gov database of grants is exported to an XML file"; the files listed on ${CHECKED_LONG} were 78.4 MB each (${a('https://www.grants.gov/xml-extract', 'Grants.gov: XML Extract')}). The best choice if you want the whole database locally.</p>
</section>

<section id="others">
<h2>SAM.gov and USAspending</h2>
<p>Federal <em>contract</em> opportunities are on SAM.gov, not Grants.gov. Its Get Opportunities API requires an API key, and "Request per day are limited based on the federal or non-federal or general roles" (${a('https://open.gsa.gov/api/get-opportunities-public-api/', 'GSA: Get Opportunities Public API')}). Past awards (who won what) are in the free USAspending API (${a('https://api.usaspending.gov/', 'api.usaspending.gov')}).</p>
</section>

<section id="commercial">
<h2>Commercial grant tools</h2>
<p>Instrumentl's pricing page lists Discover at $299 a month paid annually ($349 paid monthly, up to 3 users), Pre-Award at $499 ($579 monthly) and Full Lifecycle at $999 ($1,159 monthly), each with a 14-day trial, and says it lists more than 37,000 active grants (${a('https://www.instrumentl.com/pricing', 'Instrumentl: Pricing')}). Tools like this cover private foundation and corporate grants, which no government API does, and add application tracking.</p>
</section>

<section id="ours">
<h2>Our Actor: Grants.gov API &amp; SAM.gov Scraper</h2>
<p>${a('https://apify.com/owlabee/grants-gov-api', 'Grants.gov API &amp; SAM.gov Scraper')} searches Grants.gov (no key), SAM.gov (your own free key), and optionally USAspending awards, NIH RePORTER, NSF awards, Federal Register funding notices and 19 state and local open-data bid datasets, and returns one schema. Monitor mode flags what is new or changed since the last run, and a webhook can deliver it. On ${CHECKED_LONG} the Store API listed $0.001 per record and $0.004 per source and keyword searched ($0.002 per optional detail fetch). This week's sample: <a href="../../data/grant-and-bid-opportunities-this-week/">New federal grant and bid opportunities this week</a>. To rank opportunities against your organization, ${a('https://apify.com/owlabee/grant-matching', 'Grant Matching &amp; RFP Bid/No-Bid Scorer')} does the scoring.</p>
</section>

<section id="better">
<h2>Where the alternatives are better</h2>
<ul>
<li><strong>Private foundations:</strong> Instrumentl and similar tools cover foundation and corporate funders; government APIs and our Actor do not.</li>
<li><strong>The whole database:</strong> the free daily XML extract beats any per-record price.</li>
<li><strong>Your own code, federal grants only:</strong> search2 and the Simpler.Grants.gov API are free.</li>
<li><strong>Our Actor fits</strong> when you want grants, contracts and state and local bids in one feed on a schedule, without writing the integrations.</li>
</ul>
</section>

<section id="store">
<h2>Other Grants.gov Actors on Apify Store</h2>
${storeTable([
  ['taroyamada/procurement-intel-actor', 'TED, SAM.gov &amp; Grants.gov Scraper — Bid Alerts', 20, '$0.008'],
  ['solidcode/grants-gov-scraper', 'Grants.gov Federal Grants Scraper', 9, '$0.0096'],
  ['hridayrungta/grants-gov-scraper', 'Federal Grants Database | Grants.gov Data | $1.5 / 1K', 6, '$0.0015'],
  ['fortuitous_pirate/grants-gov-scraper', 'Grants Gov Scraper — No Login, $4.38/1k', 6, '$0.0014'],
  ['owlabee/grants-gov-api', 'Grants.gov API &amp; SAM.gov Scraper — Federal Grants Feed (ours)', 2, '$0.001'],
], 'grants.gov')}
</section>`,
    sources: [
      ['https://www.grants.gov/api/common/search2', 'Grants.gov: search2 API'],
      ['https://simpler.grants.gov/developer', 'Simpler.Grants.gov: Developers'],
      ['https://www.grants.gov/xml-extract', 'Grants.gov: XML Extract'],
      ['https://open.gsa.gov/api/get-opportunities-public-api/', 'GSA: SAM.gov Get Opportunities Public API'],
      ['https://api.usaspending.gov/', 'USAspending API'],
      ['https://www.instrumentl.com/pricing', 'Instrumentl: Pricing'],
      ['https://apify.com/owlabee/grants-gov-api', 'Grants.gov API & SAM.gov Scraper on Apify Store'],
      ['https://api.apify.com/v2/store?search=grants.gov', 'Apify Store API: search "grants.gov"'],
    ],
    related: [['../../grants-gov-api/', 'Grants.gov API guide'], ['../../sam-gov-contract-opportunities/', 'SAM.gov contract opportunities guide'], ['../../data/grant-and-bid-opportunities-this-week/', 'New grant and bid opportunities this week'], ['../', 'All comparisons']],
  },
];

function comparePage(ctx, t) {
  const actor = ctx.actorByName[t.actor];
  const sections = [
    `<section id="summary">
<h2>At a glance</h2>
${table(['Option', 'What you get', 'Cost, as published', 'Best for'], t.summary.map(([o, w, c, b]) => [`<strong>${o}</strong>`, w, c, b]))}
<p class="note">Prices and limits as each provider published them on ${CHECKED_LONG}; they change, so check the linked page before you decide.</p>
</section>`,
    t.body(ctx),
    sourcesList(t.sources.map(([h, x]) => [h, ctx.esc(x)])),
  ];
  const body = frame(ctx, {
    crumbs: `<a href="../../">Home</a> <span aria-hidden="true">›</span> <a href="../">Compare</a> <span aria-hidden="true">›</span> ${ctx.esc(t.nav)}`,
    kicker: `Comparison · checked ${CHECKED_LONG}`,
    title: t.title,
    lede: t.lede,
    actor,
    ctaText: 'Open our Actor on Apify Store',
    toc: [['summary', 'At a glance'], ['better', 'Where alternatives are better'], ['store', 'Apify Store'], ['sources', 'Sources']],
    sections,
    related: t.related,
  });
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: t.title,
    description: t.description,
    url: `${ctx.BASE_URL}compare/${t.slug}/`,
    inLanguage: 'en-US',
    dateModified: CHECKED,
    author: { '@type': 'Organization', name: ctx.SITE_NAME, url: ctx.BASE_URL },
    publisher: { '@type': 'Organization', name: ctx.SITE_NAME, url: ctx.BASE_URL },
    citation: t.sources.filter(([h]) => h.startsWith('http')).map(([h]) => h),
  };
  return { body, jsonld, lastmod: CHECKED };
}

function hub(ctx, page, list) {
  const { esc } = ctx;
  const body = `
<article>
<div class="guide-head">
<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> <span aria-hidden="true">›</span> Compare</nav>
<p class="kicker">Comparisons · checked ${CHECKED_LONG}</p>
<h1>${esc(page.title)}</h1>
<p class="lede">Honest comparisons of the ways to get public data: the official sources, commercial services and Apify Actors, ours included. Every price and limit is quoted from its source with the date we checked it, and every page says where the alternatives are the better choice.</p>
</div>
<section>
<h2>Comparisons</h2>
<ul class="cards">
${list.map((p) => `<li><a href="../${p.path}"><strong>${esc(p.title)}</strong><span>${esc(p.description)}</span><em aria-hidden="true">Read the comparison →</em></a></li>`).join('\n')}
</ul>
</section>
</article>`;
  return { body, lastmod: CHECKED };
}

export const comparePages = (() => {
  const list = TOPICS.map((t) => ({ path: `compare/${t.slug}/`, nav: t.nav, title: t.title, description: t.description, group: 'compare', updated: CHECKED, render: (ctx) => comparePage(ctx, t) }));
  const h = { path: 'compare/', nav: 'Compare', title: 'Public data sources compared', description: 'Honest, dated comparisons of official APIs, commercial services and Apify Actors for permits, PACER alerts, recalls and grants.', group: 'hub' };
  h.render = (ctx) => hub(ctx, h, list);
  return [h, ...list];
})();
