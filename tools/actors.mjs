// Per-Actor metadata shared by build-examples.mjs, build-site.mjs and the README table.
// Inputs and sample outputs live in actors.data.json (copied from each Actor's README quick start
// and output example). Everything here is written from the Actor READMEs and input schemas.
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('./actors.data.json', import.meta.url), 'utf8'));

// order: the order of the README table
const meta = {
  'building-permits-scraper': {
    group: 'Permits and property',
    returns: 'Building permits from 61 US city, county and state open-data portals: type, status, dates, cost, address, contractor',
    purpose:
      'Pulls building permits from official US open-data portals (Socrata, CKAN, ArcGIS and CARTO APIs) and writes them in one normalized schema: permit number, type, work description, status, dates, estimated cost, address with coordinates and parcel id, and the contractor\'s name, license and phone where the jurisdiction publishes them. Monitor mode emits only permits not seen on earlier runs.',
    keyInputs: [
      ['jurisdictions', 'Required. Registry ids such as `chicago` or `seattle`, or `all`.'],
      ['issuedWithinDays', 'Only permits issued in the last N days (1 to 3650).'],
      ['permitTypes', 'Words matched against permit type and subtype, for example `roof` or `solar`.'],
      ['maxResultsPerJurisdiction', 'Newest-first cap per jurisdiction.'],
      ['onlyNewSinceLastRun', 'Monitor mode: emit only permits not seen before.'],
    ],
    page: 'building-permits-api',
  },
  'accela-energov-permit-scraper': {
    group: 'Permits and property',
    returns: 'Permits from Accela Citizen Access and Tyler EnerGov portals in 31 cities and counties, in the same schema as the open-data scraper',
    purpose:
      'Reads building permits from city and county portals that run Accela Citizen Access or Tyler EnerGov Citizen Self Service, using the same public search the portal web page uses. Each permit comes back in the same normalized schema as the Building Permits Scraper. Turn on permit details for valuation, contractor, license, owner and applicant.',
    keyInputs: [
      ['jurisdictions', 'Required. Registry ids such as `overland-park-ks`, or `all`, `all-energov`, `all-accela`.'],
      ['issuedWithinDays', 'Window in days (1 to 365). On Accela portals this filters on the application date.'],
      ['includeDetails', 'Fetch each permit\'s detail record for valuation, contractor and owner fields.'],
      ['maxResultsPerJurisdiction', 'Newest-first cap per jurisdiction.'],
      ['onlyNewSinceLastRun', 'Monitor mode: emit only permits not seen before.'],
    ],
    page: 'accela-energov-permits',
  },
  'grants-gov-api': {
    group: 'Government and public records',
    returns: 'Grants.gov grant opportunities and SAM.gov contract notices by keyword, plus optional USAspending awards and six state and local bid datasets',
    purpose:
      'Searches the official Grants.gov API (no key) and the SAM.gov Get Opportunities API (free personal key) by keyword, optionally adds recent USAspending.gov awards and six state and local open-data bid datasets, and normalizes every record to the same field names. Monitor mode flags records as new or updated since the last run.',
    keyInputs: [
      ['keywords', 'Required. Search terms; each is searched in every enabled source.'],
      ['sources', '`grantsGov`, `samGov`, `sled`. Default `["grantsGov"]`.'],
      ['oppStatuses', 'Grants.gov statuses: `forecasted`, `posted`, `closed`, `archived`.'],
      ['postedWithinDays', 'Only records posted in the last N days (1 to 365).'],
      ['samApiKey', 'Your free SAM.gov API key. SAM.gov is skipped without it.'],
    ],
    page: 'grants-gov-api',
  },
  'grant-matching': {
    group: 'Government and public records',
    returns: 'Grants.gov, SAM.gov and USAspending opportunities ranked by fit to your organization, with reasons and disqualifiers',
    purpose:
      'Takes a one-time description of your organization, fetches opportunities from Grants.gov, SAM.gov and USAspending (or scores records you supply), and gives each a fit score, a verdict, the reasons behind it and any disqualifiers. The rules scorer needs no model; Claude scoring is available with your own Anthropic key or the hosted tiers.',
    keyInputs: [
      ['companyProfile', 'Required. Name, description, capabilities, NAICS codes, set-asides, locations and keywords.'],
      ['searchTerms', 'Keywords to search in the enabled sources.'],
      ['sources', '`grantsGov`, `samGov`, `usaspending`.'],
      ['maxOpportunities', 'Cap on opportunities scored per run (1 to 1,000).'],
      ['scorer', '`rules` (no model), `byok` (your Anthropic key) or `hosted`.'],
    ],
  },
  'pacer-docket-monitor': {
    group: 'Government and public records',
    returns: 'New docket entries from the public PACER RSS feeds of federal district, bankruptcy, appellate and national courts, filtered by party, case or entry type',
    purpose:
      'Reads the free public RSS feeds that federal district and bankruptcy courts, the Court of Federal Claims, the Court of International Trade and courts of appeals publish from CM/ECF, normalizes every docket entry, and filters by party name, case number, case type, entry type, keyword or bankruptcy chapter. Monitor mode flags only entries that are new since the last run. An optional pass reads older dockets from the RECAP archive through the CourtListener API.',
    keyInputs: [
      ['courts', 'Required. CM/ECF court codes such as `nysd`, `deb`, `ca4` or `cofc`; `all` (district and bankruptcy), `all-district`, `all-bankruptcy`, `all-appellate`, `all-national`; or state codes.'],
      ['partyKeywords', 'Keep entries whose case title contains any of these.'],
      ['entryTypes', 'For example `complaint`, `petition`, `motion`, `order`.'],
      ['newCasesOnly', 'Keep only document number 1 of a case.'],
      ['onlyNewSinceLastRun', 'Monitor mode: emit only entries not seen before.'],
    ],
    page: 'pacer-rss-docket-monitor',
  },
  'osha-epa-inspections': {
    group: 'Government and public records',
    returns: 'OSHA inspections, violations and penalties (DOL Data API) and EPA ECHO enforcement cases by company, facility, state or ZIP',
    purpose:
      'Looks up OSHA inspections with their violations and penalties through the U.S. Department of Labor Data API, and EPA and state enforcement cases recorded in EPA ECHO, by company name, identifier, state or ZIP. Each inspection or case is one normalized record with a name-match confidence, plus an optional per-company summary record. OSHA needs your own free DOL API key; EPA needs none.',
    keyInputs: [
      ['companies', 'Company or establishment names.'],
      ['identifiers', '`osha:<inspection number>` or `frs:<EPA FRS registry id>`.'],
      ['state', 'Two-letter state code for the site or facility.'],
      ['sources', '`osha`, `epa`. Default both.'],
      ['dolApiKey', 'Your free DOL Data API key. Required for OSHA only.'],
    ],
    pages: ['osha-inspections-by-company', 'epa-echo-enforcement'],
  },
  'product-recall-feed': {
    group: 'Government and public records',
    returns: 'FDA drug, device and food recalls, NHTSA vehicle recalls and CPSC consumer product recalls in one normalized record',
    purpose:
      'Pulls US product recalls from openFDA enforcement reports, NHTSA and CPSC through their official public APIs and writes each recall in one normalized record: agency, recall id, date, product, hazard, classification, firm, remedy and a link to the official notice. Filter by date, keyword, firm, product type or vehicle; changes mode emits only recalls not seen before.',
    keyInputs: [
      ['agencies', '`fda-drug`, `fda-device`, `fda-food`, `nhtsa`, `cpsc`. Default all five.'],
      ['daysBack', 'Window ending today (1 to 3650). Default 30.'],
      ['keyword', 'Product, description or hazard text.'],
      ['vehicles', 'NHTSA lookups, one per line: `make, model, year`.'],
      ['maxResultsPerSource', 'Newest-first cap per feed.'],
    ],
    page: 'product-recalls-api',
  },
  'license-verification-api': {
    group: 'Government and public records',
    returns: 'Professional license records by name or number from Texas TDLR, Florida DBPR, Colorado DORA, Washington DOH and the NPI Registry',
    purpose:
      'Looks up professional licenses by name or license number in five official public registries (Texas TDLR, Florida DBPR, Colorado DORA, Washington DOH and the federal NPI Registry) and returns one normalized record per license with a normalized status, expiration date, a disciplinary-action flag and a link to the source. Verify mode adds `verified` and plain-English notes.',
    keyInputs: [
      ['queries', 'One-line queries such as `TX:3365:Master Electrician`, `name:Jane Smith:FL` or `npi:1003000126`.'],
      ['lookups', 'Structured alternative to `queries`.'],
      ['mode', '`lookup` or `verify`.'],
      ['sources', 'Subset of `TX_TDLR`, `FL_DBPR`, `CO_DORA`, `WA_DOH`, `NPI`.'],
      ['maxResultsPerQuery', 'Cap per query across sources (1 to 200).'],
    ],
    page: 'professional-license-verification',
  },
  'spf-dmarc-dkim-checker': {
    group: 'Web and domains',
    returns: 'One record per domain: SPF, DMARC, DKIM, MTA-STS and BIMI with a 0-100 email security score, RDAP WHOIS, DNS, TLS and HTTP headers',
    purpose:
      'Checks a list of domains and returns one record per domain: RDAP WHOIS registration data, DNS records, SPF, DMARC, DKIM (18 common selectors plus yours), MTA-STS and BIMI with an email security score from 0 to 100, TLS certificate expiry, HTTP security headers and tech stack hints. It uses public RDAP, DNS-over-HTTPS and each domain\'s own public endpoints.',
    keyInputs: [
      ['domains', 'Required. Domains, URLs or email addresses; deduplicated by registrable domain.'],
      ['sections', 'Any of `whois`, `dns`, `tls`, `http`. Default all four.'],
      ['dkimSelectors', 'Extra DKIM selectors to probe besides the built-in 18.'],
      ['maxConcurrency', 'Domains checked in parallel (1 to 20).'],
    ],
    page: 'spf-dmarc-dkim-checker',
  },
  'website-change-monitor': {
    group: 'Web and domains',
    returns: 'Pages discovered through a site\'s sitemaps, and new, removed, updated and content-changed pages between runs with diff previews',
    purpose:
      'Discovers every page of a site through its sitemaps (robots.txt, sitemap indexes, gzipped and text sitemaps). Discover mode lists the URLs with lastmod. Monitor mode keeps a snapshot per site and reports new, removed, lastmod-changed, content-changed and status-changed pages, with a word-level preview and a severity for each change. No browser is used.',
    keyInputs: [
      ['sites', 'Required. Site or sitemap URLs.'],
      ['mode', '`discover` lists URLs; `monitor` compares with the previous run.'],
      ['maxPages', 'Max page URLs per site, in sitemap order.'],
      ['contentSelector', 'CSS selectors for the part of the page to hash.'],
      ['includePatterns', 'Keep only matching URLs (globs, regexes or substrings).'],
    ],
    page: 'sitemap-change-monitor',
  },
  'shopify-catalog-monitor': {
    group: 'Web and domains',
    returns: 'Every product or variant of a public Shopify store from products.json, or price, stock and new or removed product changes',
    purpose:
      'Reads the public catalog of a Shopify store from its storefront `products.json` and writes one record per variant (or per product) with price, compare-at price, availability, SKU, options and image. Changes mode keeps the previous snapshot and writes only what changed, with before and after values and the percentage price move.',
    keyInputs: [
      ['storeUrls', 'Required. Store domains or any store URL.'],
      ['mode', '`snapshot` (full catalog) or `changes` (only changes since the last run).'],
      ['granularity', '`variant` or `product`.'],
      ['maxProductsPerStore', 'Pagination cap per store.'],
    ],
    page: 'shopify-price-tracker',
  },
  'bluesky-monitor': {
    group: 'Web and domains',
    returns: 'Bluesky posts by keyword or hashtag, profiles, author feeds and follower lists from the public AT Protocol API',
    purpose:
      'Searches Bluesky posts by keyword or hashtag and reads profiles, author feeds, followers and following lists from the public AT Protocol API, as flat JSON records. With "Only new since last run" a schedule emits only posts or followers that appeared since the previous run.',
    keyInputs: [
      ['mode', 'Required. `searchPosts`, `profiles`, `authorFeed`, `followers`, `following` or `searchActors`.'],
      ['queries', 'Required. Search terms, hashtags or handles, depending on the mode.'],
      ['maxResults', 'Cap on dataset items across all queries.'],
      ['sort', '`latest` or `top` (searchPosts only).'],
    ],
    page: 'bluesky-monitor',
  },
  'job-postings-api': {
    group: 'Web and domains',
    returns: 'Open roles from Greenhouse, Lever, Ashby, SmartRecruiters and Workable job boards, or new, removed and changed roles per company',
    purpose:
      'Reads company job boards on Greenhouse, Lever, Ashby, SmartRecruiters and Workable through their public job-board APIs. Jobs mode writes one normalized record per open role (title, department, location, remote, apply URL). Signals mode compares with the previous snapshot and reports new, removed and changed roles per company.',
    keyInputs: [
      ['boards', 'Job boards such as `greenhouse:stripe` or `lever:spotify`.'],
      ['companyPreset', 'Optional curated list: `ai-labs`, `developer-tools`, `fintech`.'],
      ['mode', '`jobs` or `signals`.'],
      ['maxJobsPerBoard', 'Cap on job records per board.'],
    ],
    page: 'job-board-api-hiring-signals',
  },
  'podcast-rss-scraper': {
    group: 'Documents and media',
    returns: 'Show and episode records from podcast RSS feeds, Apple Podcasts links or search terms, with Podcasting 2.0 transcripts',
    purpose:
      'Turns podcast RSS feeds, Apple Podcasts show links or search terms into show and episode records: title, publish date, duration, audio URL, chapters and Podcasting 2.0 transcript links, with optional transcript text. No browser and no login.',
    keyInputs: [
      ['feeds', 'Required. RSS feed URLs, Apple Podcasts show URLs or search terms.'],
      ['maxEpisodesPerFeed', 'Newest-first cap on episode records per feed.'],
      ['fetchTranscripts', 'Download each episode\'s transcript and attach the text.'],
      ['onlyNewSinceLastRun', 'Return only episodes not seen before.'],
    ],
    page: 'podcast-rss-feed-scraper',
  },
  'podcast-summarizer': {
    group: 'Documents and media',
    returns: 'Per-episode abstract, key topics, chapters, quotes, guests and action items from Podcasting 2.0 transcripts or show notes',
    purpose:
      'Summarizes podcast episodes from RSS feeds or Apple Podcasts links: abstract, key topics, timestamped chapters, quotes, guests and action items, built from the episode\'s Podcasting 2.0 transcript (show notes when there is none). The extractive mode needs no model; Claude summaries are available with your own Anthropic key or the hosted tiers.',
    keyInputs: [
      ['feeds', 'Required. RSS feeds or Apple Podcasts links.'],
      ['maxEpisodesPerFeed', 'Newest-first cap on episodes per feed.'],
      ['summarizer', '`extractive` (no model), `byok` (your Anthropic key) or `hosted`.'],
      ['episodes', 'Specific episode GUIDs or URLs.'],
    ],
    page: 'podcast-summarizer',
  },
  'pdf-to-markdown': {
    group: 'Documents and media',
    returns: 'Clean Markdown from PDF, DOCX, HTML and text URLs, with optional heading-aware RAG chunks and OCR for scanned pages',
    purpose:
      'Converts PDF, DOCX, HTML, Markdown and text documents from URLs into Markdown with headings, lists, tables and links, plus metadata. Optional heading-aware chunks are ready for embedding, and optional OCR handles scanned pages. No browser and no external API.',
    keyInputs: [
      ['urls', 'Required. Document URLs.'],
      ['chunk', 'Also emit heading-aware chunk records.'],
      ['ocr', 'Run OCR on pages without extractable text.'],
      ['saveToKeyValueStore', 'Also save each document as a `.md` file.'],
    ],
    page: 'pdf-to-markdown-rag',
  },
  'pdf-to-json': {
    group: 'Documents and media',
    returns: 'One JSON object per PDF, DOCX or HTML document that matches the JSON Schema you supply, with per-field confidence',
    purpose:
      'Takes PDF, DOCX or HTML documents by URL plus your own JSON Schema and returns one JSON object per document that matches it, for invoices, contracts, forms and statements. The rules extractor needs no model; Claude extraction is available with your own Anthropic key or the hosted tiers.',
    keyInputs: [
      ['urls', 'Required. Document URLs.'],
      ['schema', 'Required. A JSON Schema (draft-07 subset) of the object you want per document.'],
      ['extractor', '`rules` (no model), `byok` (your Anthropic key) or `hosted`.'],
      ['includeMarkdown', 'Also return the converted document text.'],
    ],
    page: 'document-to-json',
  },
  'drone-roof-inspection-report': {
    group: 'Documents and media',
    returns: 'Per-photo roof defect findings, per-building condition grade and repair scope, a Markdown report and a contact sheet',
    purpose:
      'Turns drone and ground photos of roofs into a per-building inspection report: photos grouped into buildings by GPS and time, defect findings per photo, a condition grade and a repair scope priced from your own price list, plus a Markdown report and a contact sheet. The rules analyzer indexes photos without a model; Claude vision is available with your own Anthropic key or the hosted tiers.',
    keyInputs: [
      ['imageUrls', 'Required. Roof photo URLs, in the order you want them numbered.'],
      ['analyzer', '`rules` (no model), `byok` (your Anthropic key) or `hosted`.'],
      ['priceList', 'Optional. Your own materials and labor prices for the estimate.'],
      ['buildings', 'Optional. Which photos belong to which building.'],
    ],
    sampleNote: 'This sample comes from a Claude vision run. The rules analyzer in `input.json` indexes photos and groups them into buildings but leaves findings empty.',
  },
};

export const ORDER = Object.keys(meta);

export const actors = ORDER.map((name) => {
  const d = data.find((x) => x.name === name);
  if (!d) throw new Error(`no data for ${name}`);
  return { ...d, ...meta[name] };
});

export const storeUrl = (name) => `https://apify.com/owlabee/${name}`;
export const apiUrl = (name) => `https://api.apify.com/v2/acts/owlabee~${name}/run-sync-get-dataset-items`;
export const mcpUrl = (name) => `https://mcp.apify.com/?tools=owlabee/${name}`;
