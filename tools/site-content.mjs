// Content for the guide pages in docs/. Every claim here comes from the Actor's README,
// input schema or dataset schema. Inline HTML is allowed in text fields; JSON fields are objects.
// Inputs are validated against each Actor's input schema before publishing.

import { courtTable } from './pacer-courts.mjs';

export const pages = [
  {
    slug: 'building-permits-api',
    actor: 'building-permits-scraper',
    title: 'Building Permits API: 97 US and Canadian Jurisdictions as JSON',
    nav: 'Building permits API',
    description:
      'Get building permits from 120 open-data datasets in 97 US and Canadian cities, counties and states as one JSON schema: permit type, status, dates, cost, address and contractor where published.',
    lede:
      'Many US and Canadian cities and counties publish their building permits on open-data portals, but each portal has its own API, column names and permit-type labels. The Building Permits Scraper reads 120 datasets from 97 of them and returns every permit in one schema, with a link back to the source row.',
    source: `
<p>The data comes from the jurisdictions' own open-data portals, which run on four kinds of software: <strong>Socrata</strong> (the SODA API), <strong>CKAN DataStore</strong>, <strong>ArcGIS REST</strong> and <strong>CARTO SQL</strong>. Examples are New York City (DOB NOW approved permits), Chicago, Los Angeles (LADBS), Seattle (SDCI), Austin, Philadelphia (L&amp;I, via CARTO), Boston (CKAN), Washington, DC and Miami-Dade County (ArcGIS), plus one state, New Jersey, and 14 Canadian cities and regions such as Toronto, Montréal, Calgary, Edmonton, Winnipeg and Halifax. Where a city publishes separate electrical, HVAC, plumbing, roof or solar permit datasets, those are entries of their own. Each entry was checked live, and the Actor calls the portal APIs directly over HTTPS: no browser, no login, no proxies.</p>
<p>For a place that is not in the list, Socrata auto-discovery sends one request to the public Socrata Discovery API, finds datasets whose name says "permit" for that place, maps their columns by name and crawls them. Records from a discovered dataset carry a <code>mappingConfidence</code> of <code>high</code>, <code>medium</code> or <code>low</code>. Discovery only searches Socrata portals.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Coverage is each jurisdiction's own dataset. Some publish no valuation (Washington, DC, Philadelphia, Maricopa County) or no contractor columns (Los Angeles, Detroit). Louisville publishes active permits only and Tucson residential permits only.</li>
<li>Update frequency differs: most portals refresh daily, a few weekly or every few weeks, and some issued dates lag by one to three weeks.</li>
<li>Requests are limited to two per second per portal. Socrata allows anonymous use; an optional free Socrata app token raises its rate limits.</li>
<li>Each portal uses its own permit-type vocabulary, so use generic words such as <code>roof</code> or <code>solar</code> and check <code>permitType</code> values after a first run.</li>
</ul>`,
    fields: [
      ['permitNumber, permitType, permitSubtype', 'The permit as the jurisdiction labels it'],
      ['workDescription, status', 'Free-text scope of work and the current status'],
      ['appliedDate, issuedDate, finalizedDate, expirationDate', 'ISO-8601 dates as published'],
      ['estimatedCost', 'Declared job value in the local currency (USD in the US, CAD in Canada, never converted), or null where the jurisdiction publishes none'],
      ['address, city, state, zip, parcelId, latitude, longitude', 'Location of the work'],
      ['contractorName, contractorLicense, contractorPhone', 'Only where the jurisdiction publishes them; nothing is inferred'],
      ['ownerName, applicantName', 'Where published'],
      ['sourceApi, sourceUrl, sourceRecordId', 'Which API answered and a link to the source dataset or row'],
      ['isNew', 'Present in monitor mode for permits not seen on earlier runs'],
    ],
    example: {
      caption: 'One permit record from New York City (from the Actor\'s README):',
      json: {
        jurisdiction: 'nyc',
        jurisdictionName: 'New York City, NY',
        permitNumber: 'B01186301-S6-MS',
        permitType: 'Mechanical Systems',
        permitSubtype: 'Initial Permit',
        workDescription: 'Mechanical Systems filed in conjunction to NB application #B01186301-I1.',
        status: 'Permit Issued',
        appliedDate: '2026-02-20',
        issuedDate: '2026-10-14',
        finalizedDate: null,
        expirationDate: '2027-10-14',
        estimatedCost: null,
        address: '280 BERGEN STREET',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11217',
        parcelId: '3003880020',
        latitude: 40.683782,
        longitude: -73.982946,
        contractorName: 'DEVELOPING NY STATE LLC',
        contractorLicense: '612632',
        contractorPhone: null,
        ownerName: 'DEVELOPING NY STATE',
        applicantName: 'YITCHOK KATZ',
        sourceApi: 'socrata',
        sourceUrl: 'https://data.cityofnewyork.us/d/rbx6-tga4',
        sourceRecordId: 'B01186301-S6-MS-1',
        fetchedAt: '2026-10-16T13:25:32.995Z',
      },
    },
    useCases: [
      ['Weekly re-roof lead list', 'Set <code>permitTypes</code> to <code>["roof", "re-roof"]</code> and <code>issuedWithinDays</code> to 7 for one city. Each record has the address and, where published, the contractor who pulled the permit.'],
      ['Daily new-permit feed', 'Schedule the Actor with <code>onlyNewSinceLastRun</code> and a <code>webhookUrl</code>. The first run is a baseline; later runs send only permits not seen before, flagged <code>isNew: true</code>.'],
      ['Larger jobs only', 'Use <code>minEstimatedCost</code> to drop permits below a declared value (permits with no declared cost are kept), for example to find commercial projects for suppliers.'],
    ],
    input: {
      jurisdictions: ['chicago', 'seattle'],
      issuedWithinDays: 7,
      minEstimatedCost: 50000,
      maxResultsPerJurisdiction: 12,
      onlyNewSinceLastRun: false,
      includeRaw: false,
    },
    inputCaption: 'Permits issued in Chicago and Seattle in the last 7 days with a declared cost of at least 50,000 USD:',
    prompt: 'List the building permits issued in Chicago and Seattle in the last 7 days with an estimated cost above fifty thousand dollars, including the contractor and address.',
    faq: [
      ['Do I need an API key for the city portals?', 'No. The portals are public open-data APIs. A Socrata app token is optional and only raises Socrata\'s rate limits.'],
      ['Why is <code>estimatedCost</code> or the contractor empty?', 'The jurisdiction does not publish that column. Turn on <code>includeRaw</code> to see every field the portal does publish.'],
      ['My city runs Accela or EnerGov instead of an open-data portal.', 'Use the <a href="../accela-energov-permits/">Accela Citizen Access and EnerGov permit scraper</a>, which returns the same schema.'],
      ['What happens when a portal is down?', 'That jurisdiction produces one error item and the rest of the run continues.'],
      ['How do I control what a run costs?', 'Set <code>maxResultsPerJurisdiction</code>, keep the date window short, and set a maximum total charge for the run. In monitor mode you pay only for new permits.'],
    ],
    related: ['accela-energov-permits', 'professional-license-verification'],
  },

  {
    slug: 'accela-energov-permits',
    actor: 'accela-energov-permit-scraper',
    title: 'Accela Citizen Access and EnerGov Permit Data as JSON',
    nav: 'Accela & EnerGov permits',
    description:
      'Read building permits from Accela Citizen Access and Tyler EnerGov Citizen Self Service portals in 31 US cities and counties: type, status, dates, valuation, contractor.',
    lede:
      'Many cities and counties publish no permit dataset at all. Their permits are only searchable in an Accela Citizen Access (ACA) or Tyler EnerGov Citizen Self Service (CSS) portal. This Actor reads those portals and returns each permit as JSON.',
    source: `
<p><strong>Accela Citizen Access</strong> and <strong>Tyler EnerGov Citizen Self Service</strong> are permit portals that many US local governments use for public permit search. The Actor talks to the same public search the portal page uses: EnerGov's JSON search API, and ACA's General Search page. It pages newest-first and writes every permit in the same schema as the <a href="../building-permits-api/">open-data Building Permits Scraper</a>, so records from both can share one pipeline.</p>
<p>31 portals are in the registry (17 EnerGov, 14 Accela), each verified live, including Richmond, VA, Overland Park, KS, Hernando County, FL, Riverside County, CA, Sacramento, Tampa, Oakland, Denver and Fort Worth. With an optional free Accela developer app id, Accela agencies can instead be read through the Construct API's anonymous mode; the README describes that path as best-effort.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>EnerGov filters on the <strong>issued</strong> date. ACA's General Search filters on the <strong>record (application) date</strong> and shows no issue date, so on ACA portals <code>issuedDate</code> is null and <code>appliedDate</code> holds the record date.</li>
<li>Valuation, contractor, license, owner and applicant come from each permit's detail record, which needs <code>includeDetails</code> (one extra request per permit).</li>
<li>Requests to each portal are spaced at least one second apart. A portal that shows a CAPTCHA or blocks datacenter traffic returns an error item and is listed as unsupported; the Actor does not work around it.</li>
<li>The window is capped at 365 days, and ACA agencies commonly cap their own date range at one year.</li>
</ul>`,
    fields: [
      ['permitNumber, permitType, permitSubtype', 'Permit number, type and work class'],
      ['workDescription, status', 'Description and current status (Issued, Finaled, Applied and so on)'],
      ['appliedDate, issuedDate, finalizedDate, expirationDate', 'Dates as the portal publishes them'],
      ['estimatedCost', 'Valuation, with <code>includeDetails</code>'],
      ['address, city, state, zip, parcelId', 'Location; coordinates only through the Accela API engine'],
      ['contractorName, contractorLicense, ownerName, applicantName', 'With <code>includeDetails</code>'],
      ['sourceApi', '<code>energov</code>, <code>accela-aca</code> or <code>accela-api</code>'],
      ['sourceUrl, detailFetched, isNew', 'Link to the permit, whether details were fetched, and the monitor-mode flag'],
    ],
    example: {
      caption: 'One EnerGov permit from Hernando County, FL, with details fetched (from the Actor\'s README):',
      json: {
        jurisdiction: 'hernando-county-fl',
        jurisdictionName: 'Hernando County, FL',
        permitNumber: 'ELER-000154-2026',
        permitType: 'General Electric - Residential',
        permitSubtype: 'Electrical',
        workDescription: 'Replace 200A service panel and meter can',
        status: 'Issued',
        appliedDate: '2026-10-14T10:40:15',
        issuedDate: '2026-10-16T15:12:23',
        finalizedDate: null,
        expirationDate: '2027-04-14T15:12:23',
        estimatedCost: 3630,
        address: '1234 Example Ave, SPRING HILL, FL, 34606',
        city: 'SPRING HILL',
        state: 'FL',
        zip: '34606',
        parcelId: '1097388',
        contractorName: "RIVERA'S ELECTRIC INC.",
        contractorLicense: 'ID-000000718',
        ownerName: null,
        applicantName: "RIVERA'S ELECTRIC INC.",
        sourceApi: 'energov',
        sourceUrl: 'https://hernandocountyfl-energovweb.tylerhost.net/apps/selfservice#/permit/8c0f…',
        fetchedAt: '2026-10-17T10:50:12.345Z',
        detailFetched: true,
        isNew: true,
      },
    },
    useCases: [
      ['Re-roof permits with contractor names', 'Most EnerGov and Accela portals file re-roofs under their own permit type. <code>permitTypes: ["roof"]</code> with <code>includeDetails</code> on returns the week\'s re-roof permits with contractors.'],
      ['One feed across portal types', 'Combine this Actor with the open-data scraper. Both write the same fields, so a single table can hold permits from Chicago\'s Socrata portal and Tampa\'s Accela portal.'],
      ['Daily monitor for a county', 'With <code>onlyNewSinceLastRun</code>, details are fetched only for permits not seen before, and a <code>webhookUrl</code> receives the new ones.'],
    ],
    input: {
      jurisdictions: ['hernando-county-fl'],
      issuedWithinDays: 7,
      permitTypes: ['roof'],
      includeDetails: true,
      maxResultsPerJurisdiction: 100,
      onlyNewSinceLastRun: false,
    },
    inputCaption: 'Roofing permits issued in Hernando County, FL in the last 7 days, with contractor details:',
    prompt: 'Find the roofing permits issued in Hernando County, Florida this week and list each address with the contractor who pulled it.',
    faq: [
      ['Which portals are supported?', 'The 31 jurisdictions in the registry, or <code>all</code>, <code>all-energov</code> and <code>all-accela</code>. Portals that load search through partial postbacks or show reCAPTCHA are not supported.'],
      ['Why is <code>issuedDate</code> null on Accela portals?', 'ACA\'s General Search lists records by application date and shows no issue date. <code>status</code> tells you whether the permit was issued.'],
      ['Does it need proxies or a login?', 'No. Both portal families answer plain HTTPS requests for every jurisdiction in the registry.'],
      ['Can you add my city?', 'If it runs EnerGov Citizen Self Service or Accela Citizen Access with a public General Search page, usually yes. Ask on the Store page.'],
      ['How do I keep runs small?', 'Use a short <code>issuedWithinDays</code>, cap <code>maxResultsPerJurisdiction</code>, leave <code>includeDetails</code> off unless you need valuation or contractor fields, and set a maximum total charge.'],
    ],
    related: ['building-permits-api', 'professional-license-verification'],
  },

  {
    slug: 'grants-gov-api',
    actor: 'grants-gov-api',
    title: 'Grants.gov API: Federal Grant Opportunities as JSON',
    nav: 'Grants.gov API',
    description:
      'Search federal grant opportunities on the official Grants.gov API by keyword and get normalized JSON with new and updated flags, details and recent USAspending awards.',
    lede:
      'Grants.gov is the federal government\'s listing of grant opportunities, and it has a public API that needs no key. This Actor searches it by keyword, normalizes each opportunity, and on scheduled runs reports only what is new or changed.',
    source: `
<p>The <strong>Grants.gov API</strong> lists federal grant opportunities with the statuses <code>forecasted</code>, <code>posted</code>, <code>closed</code> and <code>archived</code>. The Actor searches it for each keyword and, with <code>fetchDetails</code>, calls Grants.gov's <code>fetchOpportunity</code> for each result to add award ceiling and floor, expected awards, total funding, eligibilities, funding categories and the agency contact. No key and no login are needed.</p>
<p>The same Actor can add recent <strong>USAspending.gov</strong> awards for the same keywords (who won similar grants and contracts), and SAM.gov contract notices, covered on the <a href="../sam-gov-contract-opportunities/">SAM.gov page</a>. Every record has the same core fields, so one feed can hold all of them.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Grants.gov OR-matches the words of a keyword: "small business" matches "small" or "business". Use specific phrases.</li>
<li><code>postedWithinDays</code> (1 to 365) applies to the Grants.gov open date.</li>
<li>Requests are limited to two per second per host, with backoff on errors. Each keyword on each source has a 10-minute budget.</li>
<li>When the agency set no award ceiling, <code>awardCeiling</code> is null rather than a guess.</li>
</ul>`,
    fields: [
      ['opportunityId, number, title', 'Grants.gov id, the opportunity number and title'],
      ['agency, agencyCode', 'Posting agency'],
      ['status, docType', 'forecasted, posted, closed or archived; synopsis or forecast'],
      ['postedDate, closeDate, lastUpdated', 'Key dates'],
      ['assistanceListings', 'Assistance Listing (CFDA) numbers'],
      ['awardCeiling, awardFloor, expectedAwards, estimatedTotalFunding', 'With <code>fetchDetails</code>; null when not set'],
      ['eligibilities, fundingCategories, fundingInstruments, costSharing', 'With <code>fetchDetails</code>'],
      ['agencyContactName, agencyContactEmail, description', 'With <code>fetchDetails</code>'],
      ['url, isNew, isUpdated', 'Link to the Grants.gov listing and the monitor-mode flags'],
    ],
    example: {
      caption: 'One Grants.gov opportunity with details fetched (shape from the Actor\'s README; values illustrative):',
      json: {
        source: 'grantsGov',
        recordType: 'opportunity',
        keyword: 'small business',
        opportunityId: '351083',
        number: 'SBA-OED-26-001',
        title: 'Small Business Development Centers Program',
        agency: 'Small Business Administration',
        agencyCode: 'SBA',
        status: 'posted',
        docType: 'synopsis',
        postedDate: '2026-10-10',
        closeDate: '2026-12-15',
        assistanceListings: ['59.037'],
        awardCeiling: null,
        awardFloor: 0,
        expectedAwards: 62,
        estimatedTotalFunding: 125000000,
        costSharing: true,
        fundingCategories: ['Business and Commerce'],
        fundingInstruments: ['Cooperative Agreement'],
        url: 'https://www.grants.gov/search-results-detail/351083',
        detailsFetched: true,
        isNew: true,
        isUpdated: false,
        jurisdiction: 'United States',
        level: 'federal',
        fetchedAt: '2026-10-16T12:00:00.000Z',
      },
    },
    useCases: [
      ['Grant alert feed for a program area', 'Schedule a keyword search with <code>onlyNewSinceLastRun</code>. Unseen opportunities arrive with <code>isNew: true</code>; ones whose title, status, dates or award fields changed arrive with <code>isUpdated: true</code>.'],
      ['Forecasts before they post', 'Add <code>forecasted</code> to <code>oppStatuses</code> to see opportunities agencies have announced but not yet opened.'],
      ['Who won similar awards', 'Turn on <code>includeRecentAwards</code> to add USAspending award records (recipient, amount, award type, dates) for the same keywords.'],
    ],
    input: {
      keywords: ['rural broadband', 'digital equity'],
      sources: ['grantsGov'],
      oppStatuses: ['posted', 'forecasted'],
      postedWithinDays: 30,
      maxResults: 200,
      fetchDetails: true,
      maxDetails: 100,
      onlyNewSinceLastRun: true,
      stateStoreName: 'broadband-grants-state',
    },
    inputCaption: 'Posted and forecasted grants for two keywords from the last 30 days, with details, in monitor mode:',
    prompt: 'Find federal grants posted on Grants.gov in the last 30 days about rural broadband or digital equity, with close dates and award ceilings.',
    faq: [
      ['Do I need a Grants.gov API key?', 'No. Grants.gov needs no key. Only the SAM.gov source needs a free personal key.'],
      ['How does "only new or updated" work?', 'For every source and keyword the Actor stores a fingerprint per opportunity in a named key-value store. Unchanged opportunities are skipped and not charged. Change <code>stateStoreName</code> to start over.'],
      ['Can it rank opportunities for my organization?', 'Pass the results to the <a href="https://apify.com/owlabee/grant-matching">Grant Matching and RFP Bid/No-Bid Scorer</a>, which scores each record against a profile you describe once.'],
      ['Does it scrape the grants.gov website?', 'No. It uses the official public APIs only, with no HTML scraping, proxies or login.'],
      ['Are state and local grants included?', 'No. The optional <code>sled</code> source reads six state and local procurement datasets (bids, not grants); it is not a nationwide state and local feed.'],
    ],
    related: ['sam-gov-contract-opportunities', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'sam-gov-contract-opportunities',
    actor: 'grants-gov-api',
    title: 'SAM.gov Contract Opportunities API Feed by Keyword',
    nav: 'SAM.gov opportunities',
    description:
      'Pull federal contract notices from the SAM.gov Get Opportunities API by keyword, NAICS code, set-aside and state, with points of contact and new-notice flags.',
    lede:
      'SAM.gov publishes federal contract opportunities (solicitations, presolicitations, sources sought and award notices) through its Get Opportunities API. With your own free SAM.gov key, this Actor searches it by keyword and filters, and flags notices that are new or changed since the last run.',
    source: `
<p>The <strong>SAM.gov Get Opportunities API</strong> is the official public API for federal contract notices. It requires a free personal API key, which any individual can request; no entity registration is needed:</p>
<ol>
<li>Create or sign in to an account at <a href="https://sam.gov">sam.gov</a>.</li>
<li>Open your profile, then <strong>Account Details</strong>.</li>
<li>Under <strong>Public API Key</strong>, click <strong>Request</strong>, enter your password and copy the key.</li>
<li>Pass it as <code>samApiKey</code>. It is stored as an encrypted secret input and never written to logs.</li>
</ol>
<p><code>samFilters</code> passes <code>naics</code>, <code>setAside</code>, <code>state</code> and <code>ptype</code> (notice type) to the API. The Actor asks for up to 1,000 notices per request, so one keyword normally costs one request.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>A personal, non-federal key has a small daily request allowance. Keep the keyword list short on SAM.gov schedules.</li>
<li>SAM.gov matches keywords against the notice title, and the posted-date window is at most one year.</li>
<li>Without a key the SAM.gov source is skipped with a log line; a rejected key produces a <code>SAM_AUTH_FAILED</code> error item.</li>
<li>Points of contact are returned exactly as the agency published them.</li>
</ul>
<p>The same Actor also reads six state and local bid datasets from city, county and state open-data portals (Los Angeles, New York City School Construction Authority, Montgomery County, MD, Mesa, AZ, Cook County, IL and Illinois) with <code>sources: ["sled"]</code>. That is a small set, not a nationwide state and local feed.</p>`,
    fields: [
      ['noticeId, solicitationNumber, title', 'SAM.gov notice id, solicitation number and title'],
      ['department, subTier, office', 'The contracting organization; <code>agency</code> holds the department'],
      ['type, baseType, status', 'Notice type (for example Combined Synopsis/Solicitation) and active or inactive'],
      ['postedDate, responseDeadLine, archiveDate', '<code>closeDate</code> repeats the response deadline'],
      ['naicsCode, classificationCode, setAside, setAsideCode', 'Classification and set-aside'],
      ['placeOfPerformance', 'City, state, ZIP and country'],
      ['pointOfContact[]', 'Type, name, title, email and phone, as published'],
      ['award', 'Award number, amount, date and awardee on award notices'],
      ['url, descriptionUrl, isNew, isUpdated', 'Notice link, the description endpoint, and monitor-mode flags'],
    ],
    example: {
      caption: 'One SAM.gov notice (shape from the Actor\'s normalizer; illustrative values from its test fixture):',
      json: {
        source: 'samGov',
        recordType: 'opportunity',
        keyword: 'it support',
        opportunityId: 'ab12cd34ef56ab12cd34ef56ab12cd34',
        noticeId: 'ab12cd34ef56ab12cd34ef56ab12cd34',
        title: 'Small Business IT Support Services',
        solicitationNumber: 'W912DY26R0012',
        agency: 'DEPT OF DEFENSE',
        department: 'DEPT OF DEFENSE',
        subTier: 'DEPT OF THE ARMY',
        office: 'ACC-APG',
        status: 'active',
        type: 'Combined Synopsis/Solicitation',
        postedDate: '2026-10-12',
        responseDeadLine: '2026-11-15T14:00:00-05:00',
        closeDate: '2026-11-15T14:00:00-05:00',
        naicsCode: '541512',
        classificationCode: 'D399',
        setAside: 'Total Small Business Set-Aside (FAR 19.5)',
        setAsideCode: 'SBA',
        placeOfPerformance: { city: 'Aberdeen Proving Ground', state: 'MD', zip: '21005', country: 'UNITED STATES' },
        pointOfContact: [{ type: 'primary', fullName: 'John Q. Public', title: 'Contract Specialist', email: 'contracting.officer@army.mil', phone: '410-555-0199', fax: null }],
        award: null,
        url: 'https://sam.gov/opp/ab12cd34ef56ab12cd34ef56ab12cd34/view',
        descriptionUrl: 'https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=ab12cd34ef56ab12cd34ef56ab12cd34',
        jurisdiction: 'United States',
        level: 'federal',
      },
    },
    useCases: [
      ['Set-aside alerts for one NAICS code', 'Filter <code>samFilters</code> by NAICS, set-aside and state, schedule daily with <code>onlyNewSinceLastRun</code>, and send new notices to a webhook.'],
      ['Grants and contracts in one feed', 'Enable <code>grantsGov</code> and <code>samGov</code> together. Both share <code>title</code>, <code>agency</code>, <code>postedDate</code>, <code>closeDate</code> and <code>url</code>.'],
      ['Bid/no-bid triage', 'Send the notices to the <a href="https://apify.com/owlabee/grant-matching">Grant Matching and RFP Bid/No-Bid Scorer</a> to rank them against your company profile.'],
    ],
    input: {
      keywords: ['cybersecurity'],
      sources: ['samGov'],
      samApiKey: '<YOUR_SAM_GOV_API_KEY>',
      samFilters: { naics: '541512', setAside: 'SBA', state: 'VA', ptype: 'o,k' },
      postedWithinDays: 7,
      maxResults: 100,
      onlyNewSinceLastRun: true,
    },
    inputCaption: 'Small business set-aside notices for one NAICS code in Virginia, posted in the last 7 days (replace the key placeholder with your own key):',
    prompt: 'Find SAM.gov solicitations posted this week for NAICS 541512 that are small business set-asides in Virginia, with response deadlines and points of contact.',
    faq: [
      ['Is a SAM.gov key really free?', 'Yes. Any individual with a SAM.gov account can request a personal public API key from Account Details. Federal and entity-associated accounts get larger daily allowances.'],
      ['What do the <code>ptype</code> and <code>setAside</code> codes mean?', 'They are passed straight to SAM.gov. Notice types: <code>o</code> Solicitation, <code>k</code> Combined Synopsis/Solicitation, <code>p</code> Presolicitation, <code>r</code> Sources Sought, <code>s</code> Special Notice, <code>a</code> Award Notice (comma-separate several). Set-aside codes include <code>SBA</code>, <code>8A</code>, <code>HZC</code>, <code>SDVOSBC</code> and <code>WOSB</code>; the input field lists them all.'],
      ['Does it read the sam.gov website?', 'No. Only the official API, with your key. No HTML scraping, proxies or login.'],
      ['What if my daily quota runs out?', 'SAM.gov answers with a rate-limit error and the Actor writes one <code>SAM_RATE_LIMITED</code> error item for that keyword; the other sources continue.'],
      ['Can it include recent awards?', 'Yes. <code>includeRecentAwards</code> adds USAspending.gov award records for the same keywords.'],
    ],
    related: ['grants-gov-api', 'osha-inspections-by-company'],
  },

  {
    slug: 'public-tenders-api',
    actor: 'tenders-scraper',
    title: 'Public Tenders API: EU TED, UK Find a Tender and AusTender',
    nav: 'EU, UK and Australian tenders',
    description:
      'Public tenders and contract awards from EU TED, UK Find a Tender, UK Contracts Finder and AusTender as one JSON record, filtered by keyword, country, CPV or UNSPSC code.',
    lede:
      'The EU, the UK and Australia each publish public procurement notices through an open API, with different query models and field names. This Actor searches all four sources and returns every notice in one record shape with the deadline, estimated value, buyer, classification codes and links to the notice and its documents, and on a schedule returns only notices you have not seen.',
    source: `
<table>
<thead><tr><th>Source id</th><th>Source</th><th>What it returns</th><th>Keyword search</th><th>License</th></tr></thead>
<tbody>
<tr><td><code>ted</code></td><td>EU TED (Tenders Electronic Daily): above-threshold procurement in the 27 EU countries, the EEA and partner countries</td><td>Calls for competition, award and direct-award notices, prior information notices</td><td>TED full-text search, on the server</td><td>CC BY 4.0 (Commission Decision 2011/833/EU)</td></tr>
<tr><td><code>findATender</code></td><td>UK Find a Tender: UK above-threshold notices</td><td>Tender, award and planning notices (OCDS)</td><td>Matched by the Actor in the date window</td><td>Open Government Licence v3.0</td></tr>
<tr><td><code>contractsFinder</code></td><td>UK Contracts Finder: central government and below-threshold notices</td><td>Tender, award and pipeline notices (OCDS), with the "suitable for SMEs" flag</td><td>Matched by the Actor in the date window</td><td>Open Government Licence v3.0</td></tr>
<tr><td><code>ausTender</code></td><td>AusTender: Australian Commonwealth contract notices</td><td>Contract notices (awards) with value, dates and UNSPSC code</td><td>Matched by the Actor in the date window</td><td>CC BY 3.0 AU</td></tr>
</tbody>
</table>
<p>All four are official open APIs that need no key or account, and the Actor uses no login, proxy or browser. The UK and Australian APIs have no keyword parameter, so the Actor reads their date window once per run and keeps notices whose title, description, buyer name or code descriptions contain every word of the keyword. <code>countries</code> narrows TED; the UK and Australian sources are national.</p>
<p>The record shape matches the opportunity records of the <a href="../grants-gov-api/">Grants.gov API</a> Actor (<code>opportunityId</code>, <code>title</code>, <code>agency</code>, <code>postedDate</code>, <code>closeDate</code>, <code>noticeType</code>, <code>classifications</code>, <code>estimatedValue</code>), so US and international results can go into one table. Every record and the run summary carry the source's license and attribution line; keep it with any redistribution.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>AusTender's open approaches to market are not in its open API, so AusTender returns awarded contracts only.</li>
<li>TED reads up to <code>maxPagesPerSource</code> pages of 100 notices per keyword (default 10). The shared UK and Australian windows read at most 3 Find a Tender pages, 5 Contracts Finder pages or 7 AusTender days per keyword in a run; the run summary says when a cap was hit.</li>
<li>Lots, procurement documents and submission links for TED come from one more request per notice, only with <code>fetchDetails</code> on.</li>
<li>Buyer contact persons are left out by default (<code>omitContacts</code>), and award winners whose names read as private individuals are withheld with <code>nameWithheld: true</code>. Company winners are always named.</li>
</ul>`,
    fields: [
      ['source, opportunityId, noticeId', 'Which source answered and the notice id'],
      ['title, titleOriginal, description', 'The notice in English where the source has it, and in its original language'],
      ['agency, buyer', 'The contracting authority, with country and city'],
      ['status, postedDate, closeDate, deadline', 'ISO dates as published'],
      ['noticeType, type, procurementMethod, contractNature', '<code>bid</code>, <code>award</code>, <code>planning</code>, <code>intent-to-award</code> or <code>other</code>, plus the source\'s own notice type'],
      ['estimatedValue, awardedValue, currency', 'Values as published'],
      ['classifications', 'CPV or UNSPSC codes'],
      ['country, buyerCountries, jurisdiction, placeOfPerformance', 'Where the buyer is and where the work is done'],
      ['awardees, lots', 'Award winners and lots, where published'],
      ['url, documentsUrl, submissionUrl', 'The notice, its procurement documents and its e-submission page'],
      ['sourceLicense, attribution', 'The source\'s license and the attribution line to keep'],
      ['isNew, isUpdated', 'In monitor mode'],
    ],
    example: {
      caption: 'A TED call for competition with details fetched (from the Actor\'s README; description shortened):',
      json: {
        source: 'ted',
        recordType: 'opportunity',
        keyword: '*',
        opportunityId: 'ted:779189-2026',
        noticeId: '779189-2026',
        title: 'Slovakia – Financial transaction processing and clearing-house services – Akceptácia platobných kariet prostredníctvom internetu',
        titleOriginal: 'Akceptácia platobných kariet prostredníctvom internetu',
        agency: 'Železničná spoločnosť Slovensko, a.s.',
        status: 'open',
        postedDate: '2026-11-09',
        closeDate: '2026-12-08',
        deadline: '2026-12-08',
        url: 'https://ted.europa.eu/en/notice/-/detail/779189-2026',
        fetchedAt: '2026-11-09T06:02:33.288Z',
        jurisdiction: 'Slovakia',
        country: 'SK',
        buyerCountries: ['SK'],
        noticeType: 'bid',
        type: 'cn-standard',
        procurementMethod: 'open',
        contractNature: ['services'],
        description: 'Predmetom zákazky je poskytovanie služby platobnej brány …',
        estimatedValue: 2794882,
        currency: 'EUR',
        awardedValue: null,
        classifications: [{ scheme: 'CPV', code: '66172000', description: null }],
        buyer: { name: 'Železničná spoločnosť Slovensko, a.s.', id: null, country: 'SK', city: 'Bratislava', website: null },
        awardees: [],
        placeOfPerformance: ['anyw'],
        documentsUrl: 'https://www.uvo.gov.sk/vyhladavanie/vyhladavanie-zakaziek/dokumenty/566107',
        submissionUrl: 'https://zssk.eranet.sk/#/tenderPublicDetails/85',
        lots: [{ lotId: 'LOT-0001', title: 'Akceptácia platobných kariet prostredníctvom internetu', estimatedValue: 2794882, currency: 'EUR', deadline: '2026-12-08', durationValue: 48, durationUnit: 'MONTH' }],
        sourceLicense: 'CC-BY-4.0 (Commission Decision 2011/833/EU)',
        attribution: '© European Union, 1998–2026, data from TED (Decision 2011/833/EU)',
        detailsFetched: true,
      },
    },
    useCases: [
      ['Daily tender alert for a sector', 'Search a CPV branch such as <code>72000000</code> (IT services) with <code>keywords: ["*"]</code>, turn on <code>onlyNewSinceLastRun</code>, and schedule it daily with a <code>webhookUrl</code>.'],
      ['UK opportunities for small suppliers', 'Search <code>findATender</code> and <code>contractsFinder</code> together; Contracts Finder notices carry its "suitable for SMEs" flag.'],
      ['Who won Australian Government contracts', 'Search <code>ausTender</code> with a UNSPSC code such as <code>80100000</code> (management consulting) to see recent awards, suppliers and values.'],
    ],
    input: {
      keywords: ['*'],
      sources: ['ted'],
      countries: ['DE', 'FR'],
      cpvCodes: ['72000000'],
      postedWithinDays: 3,
    },
    inputCaption: 'IT services tenders published in Germany and France in the last three days (from the Actor\'s README):',
    prompt: 'Find EU tenders for cybersecurity services published this week in Germany, Austria and the Netherlands, with deadlines and estimated values.',
    faq: [
      ['Does it need an API key or proxies?', 'No. All four sources are official open APIs that need no key or account.'],
      ['Why do UK and Australian notices take longer to search?', 'Those APIs have no keyword search, so the Actor reads the date window and matches the keyword itself. Narrow the window or the codes to see more notices within the page caps.'],
      ['Can I get only new tenders every day?', 'Yes. Turn on <code>onlyNewSinceLastRun</code> and schedule the task. The first run is a baseline; later runs return only new or changed notices, flagged <code>isNew</code> or <code>isUpdated</code>. Use a different <code>stateStoreName</code> per schedule.'],
      ['Why are buyer contact names missing?', 'Contact persons are personal data under the GDPR and UK GDPR, so <code>omitContacts</code> is on by default. Turn it off to get the contact as the notice publishes it; you are then responsible for processing it lawfully.'],
      ['Can I combine this with US federal opportunities?', 'Yes. The record shape matches the <a href="../grants-gov-api/">Grants.gov</a> and <a href="../sam-gov-contract-opportunities/">SAM.gov</a> opportunity records, so the datasets can be merged.'],
    ],
    related: ['sam-gov-contract-opportunities', 'grants-gov-api'],
  },

  {
    slug: 'osha-inspections-by-company',
    actor: 'osha-epa-inspections',
    title: 'OSHA Inspections by Company: DOL Data API Lookup',
    nav: 'OSHA inspections',
    description:
      'Look up OSHA inspections, violations and penalties by company name, inspection number, state or ZIP through the DOL Data API, with a name-match confidence per record.',
    lede:
      'OSHA inspection and citation data is published by the U.S. Department of Labor through its Data API. This Actor looks up inspections by company name or inspection number and returns one record per inspection with its violations and penalties, graded by how well the establishment name matched.',
    source: `
<p>The data comes from the <strong>DOL Data API v4</strong> (<code>apiprod.dol.gov</code>), datasets <code>OSHA/inspection</code> and <code>OSHA/violation</code>. It includes federal OSHA and State Plan inspections as DOL publishes them.</p>
<p><strong>The DOL API needs a key.</strong> Keys are free: sign in at <a href="https://dataportal.dol.gov">dataportal.dol.gov</a>, open your account's API keys page, and pass the key as <code>dolApiKey</code>. It is stored as an encrypted secret and only sent to <code>apiprod.dol.gov</code>. Without a key the Actor still runs its EPA source (see <a href="../epa-echo-enforcement/">EPA ECHO enforcement</a>) and writes one <code>DOL_API_KEY_MISSING</code> item for each DOL source.</p>
<p><strong>Opt-in sources.</strong> The default is still <code>sources: ["osha", "epa"]</code>. Add <code>msha</code> for Mine Safety and Health Administration inspections with their citations and assessed penalties, <code>whd</code> for Wage and Hour Division compliance actions since FY 2005 (back wages, employees owed, civil money penalties), or <code>fmcsa</code> for a motor carrier's profile and roadside inspections, looked up by <code>usdot:&lt;USDOT number&gt;</code> only. <code>includeAccidents</code> adds OSHA fatality and catastrophe investigations linked to the inspections found, with personal names redacted from the abstract. MSHA and WHD use the same DOL key; FMCSA uses U.S. DOT open data and needs none.</p>
<h3>How name matching works</h3>
<p>Agencies record establishment names, not company ids, so every record carries <code>matchConfidence</code> and <code>matchBasis</code>:</p>
<ul>
<li><code>high</code>: names equal after removing case, punctuation and suffixes such as Inc or LLC, or an exact <code>osha:</code> identifier lookup.</li>
<li><code>medium</code>: your name is a whole-word prefix of the agency's name ("Tesla" and "TESLA MOTORS INC").</li>
<li><code>low</code>: your words appear elsewhere in the name, or only as part of a word.</li>
</ul>
<p><code>minMatchConfidence</code> (default <code>medium</code>) drops weaker matches before they are written or charged, and the summary record lists every distinct matched name separately.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Inspections come back newest first. A short or generic name scans more rows; add a state or ZIP.</li>
<li>Agency data lag the agencies' own systems, and statuses and penalties can change after an inspection is first published.</li>
<li>Each agency has a time budget per run (<code>timeBudgetSecs</code>, default 300 seconds), at roughly one to three seconds per company.</li>
</ul>`,
    fields: [
      ['recordId, entityName', '<code>osha:&lt;activity number&gt;</code> and the establishment name'],
      ['address, city, state, zip, naicsCode', 'Inspection site'],
      ['actionDate, closedDate, status', 'Inspection opened, case closed, and <code>open</code> or <code>closed</code>'],
      ['actionType', 'Inspection type: Complaint, Planned, Accident, Referral, Follow-up and others'],
      ['violationCount, violationsByType', 'Citations, by serious, willful, repeat, other and unclassified'],
      ['penaltyUsd, initialPenaltyUsd', 'Current and initial penalty totals as published'],
      ['matchBasis, matchConfidence, matchedName', 'How the record matched your query'],
      ['sourceUrl', 'The OSHA inspection detail page'],
    ],
    example: {
      caption: 'Shape of one OSHA inspection record (field names from the Actor; the establishment and values are placeholders):',
      json: {
        recordType: 'inspection',
        agency: 'OSHA',
        recordId: 'osha:000000000',
        query: 'Example Roofing',
        entityName: 'EXAMPLE ROOFING LLC',
        address: '100 MAIN ST',
        city: 'AUSTIN',
        state: 'TX',
        zip: '78701',
        naicsCode: '238160',
        actionDate: '2024-05-14',
        closedDate: null,
        actionType: 'Planned',
        status: 'open',
        penaltyUsd: 0,
        initialPenaltyUsd: 0,
        violationCount: 1,
        violationsByType: { other: 1 },
        lawOrProgram: 'OSH Act',
        sourceUrl: 'https://www.osha.gov/ords/imis/establishment.inspection_detail?id=000000000',
        matchBasis: 'name-exact',
        matchConfidence: 'high',
        matchedName: 'EXAMPLE ROOFING LLC',
      },
    },
    useCases: [
      ['Supplier and contractor checks', 'Look up a list of contractors by name and state and read each one\'s inspection history, violation counts and penalties as published by DOL.'],
      ['One inspection by number', 'Pass <code>identifiers: ["osha:316113513"]</code> to fetch a known inspection and its citations.'],
      ['Weekly watch on a company list', 'Turn on <code>monitor</code> to write only new or changed inspections (status, penalty or closing date) since the last run, and send them to a webhook.'],
    ],
    input: {
      companies: ['Acme Roofing', 'Mistras Group'],
      state: 'TX',
      dateFrom: '2021-01-01',
      sources: ['osha'],
      dolApiKey: '<your free DOL API key>',
      minMatchConfidence: 'medium',
    },
    inputCaption: 'OSHA inspections since 2021 for two companies in Texas (replace the key placeholder with your own free DOL key):',
    prompt: 'Look up OSHA inspections since 2021 for Acme Roofing in Texas, with violation counts, penalties and how confident each name match is.',
    faq: [
      ['Why does OSHA need a key when EPA does not?', 'The DOL Data API does not answer without one. The key is free from dataportal.dol.gov and only used for <code>apiprod.dol.gov</code>.'],
      ['Why did I get records for a different company?', 'Agencies record establishment names. Check <code>matchConfidence</code> and <code>matchBasis</code>, raise <code>minMatchConfidence</code> to <code>high</code>, add a state or ZIP, or look up exact identifiers.'],
      ['Are State Plan inspections included?', 'Yes, as DOL publishes them in the same datasets.'],
      ['Is this a rating of the company?', 'No. Records describe what the agency published, nothing more.'],
      ['Does it cover mines, wage cases or trucking companies?', 'Yes, as opt-in sources: <code>msha</code> (mine inspections), <code>whd</code> (Wage and Hour cases) and <code>fmcsa</code> (carrier safety, by <code>usdot:</code> number only). They are off unless you add them, so a saved input returns the same records at the same cost.'],
      ['Can I get EPA cases in the same run?', 'Yes. Add <code>epa</code> to <code>sources</code>. The per-company summary then counts records and penalties by agency.'],
    ],
    related: ['epa-echo-enforcement', 'professional-license-verification'],
  },

  {
    slug: 'epa-echo-enforcement',
    actor: 'osha-epa-inspections',
    title: 'EPA ECHO Enforcement Cases by Company or Facility',
    nav: 'EPA ECHO enforcement',
    description:
      'Find EPA and state enforcement cases in EPA ECHO by company name, FRS facility id, state or ZIP: law, status, dates, penalties and outcome, as normalized JSON. No API key.',
    lede:
      'EPA\'s Enforcement and Compliance History Online (ECHO) records federal and state environmental enforcement cases. Its case search cannot filter by company name, so this Actor finds a company\'s facilities first and then reads their cases, returning one normalized record per case.',
    source: `
<p><strong>EPA ECHO</strong> web services (<code>echodata.epa.gov</code>) publish enforcement cases with the case number and name, category, status, primary law (CAA, CWA, RCRA and others), filing and settlement dates, federal and state or local penalties, and the outcome. No key is needed.</p>
<p>Because ECHO's company-name filter for cases is not usable, the Actor runs a facility search for each company and then reads the case lists of the matched facilities. By default it checks only facilities that ECHO flags with formal enforcement actions or penalties; <code>epaAllFacilities</code> checks every matched facility, up to <code>maxFacilitiesPerCompany</code>. You can also look up a facility directly by its 12-digit FRS registry id with <code>frs:&lt;id&gt;</code>.</p>
<p>ECHO includes state-led and locally led cases that states report to EPA. State agencies' own systems are not queried.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>A very broad name can exceed ECHO's query limit and returns a <code>QUERY_TOO_BROAD</code> item; add a state or ZIP.</li>
<li>A case found through a matched facility can be filed under another party's name. Its <code>matchConfidence</code> is then <code>low</code> and <code>matchNote</code> says so.</li>
<li>Agency data lag EPA's internal systems, and statuses and penalties can change after a case is first published.</li>
</ul>`,
    fields: [
      ['recordId, entityName', '<code>epa:&lt;case number&gt;</code> and the case or defendant name'],
      ['facilityName, facilityRegistryId', 'The matched facility and its FRS registry id'],
      ['address, city, state, zip, naicsCode', 'Facility location and industry'],
      ['actionDate, closedDate', 'Case filed (or settled, when no filing date)'],
      ['actionType, status, outcome', 'For example Administrative - Formal, Final Order Issued, Final Order With Penalty'],
      ['lawOrProgram', 'Primary law: CAA, CWA, RCRA and others'],
      ['penaltyUsd', 'Penalty as published'],
      ['matchBasis, matchConfidence, matchedName, sourceUrl', 'How the record matched, and the ECHO case report link'],
    ],
    example: {
      caption: 'One EPA case from a quick-start run on 2026-11-01 (from the Actor\'s README, raw fields omitted):',
      json: {
        recordType: 'enforcement-case',
        agency: 'EPA',
        recordId: 'epa:09-2019-0029',
        query: 'Tesla',
        entityName: 'Tesla Motors, Inc.',
        facilityName: 'TESLA MOTORS INC',
        facilityRegistryId: '110000482898',
        address: '45500 FREMONT BLVD',
        city: 'FREMONT',
        state: 'CA',
        zip: '94538',
        naicsCode: '336111',
        actionDate: '2019-03-28',
        closedDate: null,
        actionType: 'Administrative - Formal',
        status: 'Final Order Issued',
        penaltyUsd: 31000,
        lawOrProgram: 'RCRA',
        outcome: 'Final Order With Penalty',
        sourceUrl: 'https://echo.epa.gov/enforcement-case-report?id=09-2019-0029',
        matchBasis: 'facility-name',
        matchConfidence: 'medium',
        matchedName: 'TESLA MOTORS INC',
        fetchedAt: '2026-11-01T13:01:08.211Z',
      },
    },
    useCases: [
      ['Due diligence on a facility', 'Look up a plant by FRS id and read every case filed against it, with the law involved and the outcome.'],
      ['Supplier screening without a key', 'Run <code>sources: ["epa"]</code> for a list of supplier names and states. EPA needs no key, so this works before you request a DOL key.'],
      ['Scheduled watch', 'Turn on <code>monitor</code> to write only new or changed cases, fingerprinted by status, penalty and closing date, and post them to a webhook.'],
    ],
    input: {
      companies: ['Tesla'],
      state: 'CA',
      sources: ['epa'],
    },
    inputCaption: 'EPA ECHO cases for facilities matching "Tesla" in California (the Actor\'s own quick-start input):',
    prompt: 'Which EPA enforcement cases are on record for Tesla facilities in California, and under which law was each filed?',
    faq: [
      ['Does EPA ECHO need an API key?', 'No. ECHO web services are public. Only the DOL sources (OSHA and the opt-in MSHA and Wage and Hour sources) need a key.'],
      ['Why does it search facilities first?', 'ECHO\'s company-name filter for cases is not usable, so cases are found through the facilities that match the name.'],
      ['Are state cases included?', 'Cases that states report to EPA are in ECHO and are returned (the lead agency is in the raw case data). State agencies\' own databases are not queried.'],
      ['How do I avoid records for similarly named companies?', 'Add a state or ZIP, raise <code>minMatchConfidence</code>, or look up facilities by FRS id.'],
      ['What does the summary record contain?', 'Per company: record counts and penalty totals by agency, open records, counts by match confidence, the most recent action and every matched name.'],
    ],
    related: ['osha-inspections-by-company', 'product-recalls-api'],
  },

  {
    slug: 'product-recalls-api',
    actor: 'product-recall-feed',
    title: 'Product Recalls API: FDA, NHTSA and CPSC in One Feed',
    nav: 'Product recalls API',
    description:
      'US product recalls from openFDA (drugs, devices, food), NHTSA (vehicles) and CPSC (consumer products) in one normalized JSON record, plus opt-in Canada, UK and EU feeds, with a new-recalls-only mode.',
    lede:
      'Three federal agencies publish US recalls, each with its own API and field names. This Actor reads all three and writes each recall as one record with the same fields: agency, recall id, date, product, hazard, classification, firm, remedy and a link to the official notice. Opt-in feeds add Canada, the UK and the EU Safety Gate in the same record.',
    source: `
<table>
<thead><tr><th>Source id</th><th>Agency feed</th><th>Official API</th><th>Freshness</th></tr></thead>
<tbody>
<tr><td><code>fda-drug</code></td><td>FDA drug enforcement reports</td><td><code>api.fda.gov/drug/enforcement.json</code> (openFDA)</td><td>Weekly</td></tr>
<tr><td><code>fda-device</code></td><td>FDA medical device enforcement reports</td><td><code>api.fda.gov/device/enforcement.json</code></td><td>Weekly</td></tr>
<tr><td><code>fda-food</code></td><td>FDA food and cosmetics enforcement reports</td><td><code>api.fda.gov/food/enforcement.json</code></td><td>Weekly</td></tr>
<tr><td><code>nhtsa</code></td><td>NHTSA recall campaigns: vehicles, equipment, tires, child seats</td><td>DOT open data <code>datahub.transportation.gov</code>, dataset <code>6axg-epim</code></td><td>Daily</td></tr>
<tr><td><code>vehicles</code> input</td><td>NHTSA recalls for one make, model and year</td><td><code>api.nhtsa.gov/recalls/recallsByVehicle</code></td><td>Daily</td></tr>
<tr><td><code>cpsc</code></td><td>CPSC consumer product recalls</td><td><code>www.saferproducts.gov/RestWebServices/Recall</code></td><td>Daily</td></tr>
<tr><td><code>fda-device-recall</code> (opt-in)</td><td>FDA medical device recall database</td><td><code>api.fda.gov/device/recall.json</code> (openFDA)</td><td>Weekly</td></tr>
<tr><td><code>fda-rss</code> (opt-in)</td><td>FDA recall press releases</td><td>FDA recalls RSS feed on fda.gov</td><td>Daily; newest 20</td></tr>
<tr><td><code>health-canada</code> (opt-in)</td><td>Health Canada recalls and safety alerts, including CFIA and Transport Canada</td><td>Open data JSON on <code>recalls-rappels.canada.ca</code></td><td>Daily</td></tr>
<tr><td><code>uk-opss</code> (opt-in)</td><td>UK Office for Product Safety and Standards reports and recalls</td><td>GOV.UK Search API</td><td>Daily</td></tr>
<tr><td><code>uk-mhra</code> (opt-in)</td><td>UK MHRA drug and medical device alerts</td><td>GOV.UK Search API</td><td>Daily</td></tr>
<tr><td><code>uk-fsa</code> (opt-in)</td><td>UK Food Standards Agency allergy alerts and recall notices</td><td><code>data.food.gov.uk/food-alerts</code></td><td>Daily</td></tr>
<tr><td><code>eu-safety-gate</code> (opt-in)</td><td>EU Safety Gate alerts for dangerous non-food products</td><td>Weekly report XML on <code>ec.europa.eu/safety-gate-alerts</code></td><td>Weekly</td></tr>
</tbody>
</table>
<p>The first five feeds are the default. The opt-in feeds run only when you list them in <code>agencies</code> or pick their country in <code>jurisdictions</code> (<code>US</code>, <code>CA</code>, <code>GB</code>, <code>EU</code>). Every record carries <code>jurisdiction</code>, <code>recordType</code>, <code>productCategory</code> and <code>hazardCategories</code> from one shared taxonomy. Keep the source's attribution with any redistribution: Open Government Licence – Canada (Health Canada, CFIA, Transport Canada), Open Government Licence v3.0 (OPSS, MHRA, FSA), and for EU Safety Gate data © European Union, reusable under Commission Decision 2011/833/EU (CC BY 4.0).</p>
<h3>Limits worth knowing</h3>
<ul>
<li>openFDA allows 240 requests per minute and 1,000 per day per IP without a key. A free openFDA key (<code>fdaApiKey</code>) raises those limits.</li>
<li>FDA lists a recall in its enforcement report after classifying it, which can be weeks after the firm's announcement. NHTSA and CPSC publish within days. Use a <code>daysBack</code> of 30 or more for FDA.</li>
<li>CPSC has no server-side keyword or firm search, so the whole date window is downloaded and filtered locally.</li>
<li>FDA enforcement reports have no remedy field, so <code>remedy</code> is null for FDA recalls.</li>
</ul>`,
    fields: [
      ['agency, source, recallId', 'FDA recall number, NHTSA campaign number or CPSC recall number'],
      ['date, title, product, productType, description', 'What was recalled and when'],
      ['hazard', 'FDA reason for recall, NHTSA consequence summary, or CPSC hazards'],
      ['classification, severity', 'FDA Class I/II/III; NHTSA "Do not drive" or "Park outside"; CPSC remedy options. Severity is high, medium or low where it can be derived'],
      ['firm, distribution, quantity, country, state', 'Recalling firm and distribution as published'],
      ['remedy, status', 'Corrective action (NHTSA, CPSC) and status where published'],
      ['url', 'openFDA record query, nhtsa.gov or cpsc.gov recall page'],
      ['isNew', 'In changes mode, for recalls not seen before'],
    ],
    example: {
      caption: 'One CPSC recall (from the Actor\'s README; long text shortened):',
      json: {
        agency: 'CPSC',
        source: 'cpsc',
        recallId: '27055',
        date: '2026-10-29',
        title: 'Bodum USA Recalls 5.9 Million French Press Coffee Makers with Replaceable Glass Carafes Due to Risk of Serious Burn Injury',
        product: 'Bodum French Press coffee makers with 8-cup and 12-cup replaceable glass carafes …',
        productType: 'Unpowered Coffee Makers or Teapots',
        hazard: 'The carafe can unexpectedly break during use if the glass carafe is damaged or cracked …, posing a risk of serious burn injuries.',
        classification: 'Repair',
        severity: null,
        firm: 'Bodum USA, Inc., of New York, New York',
        remedy: 'Consumers should stop using metal spoons or utensils to stir coffee in the glass carafe immediately …',
        status: null,
        quantity: '5.9 million',
        state: null,
        country: 'Portugal; Thailand',
        url: 'https://cpsc.gov/Recalls/2027/Bodum-USA-Recalls-5-9-Million-French-Press-Coffee-Makers-with-Replaceable-Glass-Carafes-Due-to-Risk-of-Serious-Burn-Injury',
        fetchedAt: '2026-11-01T12:55:01.288Z',
      },
    },
    useCases: [
      ['Daily Class I alert', 'Schedule <code>fda-drug</code> and <code>fda-food</code> with <code>fdaClassifications: ["Class I"]</code> and <code>onlyNewSinceLastRun</code>. The first run is a baseline; later runs post only new recalls to your webhook.'],
      ['Recalls on a fleet\'s vehicles', 'List vehicles as <code>make, model, year</code> in <code>vehicles</code>. Each lookup returns every NHTSA recall on that vehicle, whatever the date window.'],
      ['One hazard across agencies', 'Search a keyword such as <code>lithium</code> across <code>cpsc</code>, <code>nhtsa</code> and <code>fda-device</code> over a year to see related recalls side by side.'],
    ],
    input: {
      agencies: ['fda-drug', 'fda-food'],
      daysBack: 14,
      fdaClassifications: ['Class I'],
      onlyNewSinceLastRun: true,
      webhookUrl: 'https://example.com/hooks/recalls',
    },
    inputCaption: 'Class I food and drug recalls from the last 14 days, new ones only, posted to a webhook:',
    prompt: 'List the Class I FDA drug and food recalls from the last two weeks with the firm, the reason and the distribution.',
    faq: [
      ['Do I need API keys?', 'No. Every feed is a public API or open-data file. An openFDA key is optional and only raises openFDA\'s rate limits.'],
      ['Which countries are covered?', 'The US by default; Canada, the United Kingdom and the EU/EEA when you choose them in <code>jurisdictions</code> or pick their feeds in <code>agencies</code>. Each record says where it came from in <code>jurisdiction</code> and <code>agency</code>.'],
      ['Why is a recall from the news missing?', 'FDA lists recalls in enforcement reports after classifying them, often weeks later. NHTSA and CPSC publish faster.'],
      ['Why is <code>severity</code> null for CPSC?', 'CPSC publishes no recall class. FDA classes map to high, medium and low, and NHTSA recalls with a do-not-drive or park-outside advisory are high.'],
      ['What happens if one agency API is down?', 'That feed yields one error item and the others continue.'],
      ['Can I see the agency\'s original fields?', 'Yes. <code>includeRaw</code> attaches the agency record as a nested <code>raw</code> object.'],
    ],
    related: ['epa-echo-enforcement', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'pacer-rss-docket-monitor',
    actor: 'pacer-docket-monitor',
    title: 'PACER RSS Feeds: Monitor New Federal Court Filings',
    nav: 'PACER RSS docket monitor',
    description:
      'Read the free public PACER RSS feeds of federal district, bankruptcy, appellate and national courts as JSON and filter filings by party, case number, entry type or chapter.',
    lede:
      'Federal district and bankruptcy courts running CM/ECF can publish a free RSS feed of their last 24 hours of docket activity, and so can the Court of Federal Claims, the Court of International Trade and some courts of appeals. This Actor reads those feeds for the courts you choose, normalizes each entry, filters it, and on scheduled runs keeps only entries that are new since the last run. No PACER account is needed.',
    source: `
<p>The feeds are the courts' own public endpoints, <code>https://ecf.&lt;court&gt;.uscourts.gov/cgi-bin/rss_outside.pl</code> (and <code>…/n/beam/servlet/TransportRoom?servlet=RSSGenerator</code> for the courts of appeals). Each entry has the case number, the case title (the lead parties), the docket text, the document number with a link, and the filing time. Documents are linked, never downloaded; opening a document on PACER is subject to PACER's own fees.</p>
<p>Coverage differs per court. The registry lists 203 courts, and 143 had a live feed at their last probe:</p>
<ul>
<li><strong>District and bankruptcy courts</strong> (sweep of 2026-10-17): of 188, 94 published every entry type, 41 published a subset (typically complaints, motions and orders), 23 answered with no entries, and 30 did not answer datacenter requests.</li>
<li><strong>Court of Federal Claims and Court of International Trade</strong> (probe of 2026-11-07): both live. Court of International Trade feed titles carry only the case number, so party filters cannot match there.</li>
<li><strong>Courts of appeals</strong> (probe of 2026-11-07): 6 of 13 had entries. Appellate feeds carry orders, opinions and judgments only, never new appeals, so they are for following an appeal you already know about; <code>newCasesOnly</code> drops every appellate entry.</li>
</ul>
<p>The Actor still tries every court you name and reports what happened. The full list is on <a href="../pacer-rss-feeds-by-court/">PACER RSS feeds by court</a>.</p>
<p>For past dockets, the optional historical pass reads the RECAP archive through the Free Law Project's CourtListener API, in the same record shape with <code>source: "courtlistener-recap"</code>.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Each feed covers the <strong>trailing 24 hours</strong> only. Schedule at least daily; hourly is a good default, since courts regenerate feeds every 30 to 60 minutes.</li>
<li>Nature of suit, party lists, judges and the full docket text are not in the feeds. The case title carries only the lead parties, so a party that is not first-named may be missing.</li>
<li><code>entryTypes</code> is a heuristic over the entry text; use <code>entryKeywords</code> for precision.</li>
<li>The CourtListener API allows 5 requests per minute, 50 per hour and 125 per day by default, shared by anonymous callers; a free CourtListener token gives a run its own allowance.</li>
</ul>`,
    fields: [
      ['court, courtName, courtType, state', 'CM/ECF court code and name; district, bankruptcy, appellate or national (<code>state</code> is null for the last two)'],
      ['caseNumber, caseNumberShort, caseTitle, caseType', 'Case as published, a normalized number, the lead parties, and civil, criminal, bankruptcy and so on'],
      ['entryText, entryCategory', 'Docket text and a heuristic category (complaint, petition, motion, order …)'],
      ['documentNumber, documentUrl, docketUrl', 'Document number and links to the document and docket on PACER'],
      ['bankruptcyChapter, trustee, office', 'Bankruptcy entries only'],
      ['filedAt, pubDateRaw', 'Filing time, and the original timestamp string'],
      ['likelyNewCase, matchedFilters, isNew', 'Document number 1, which filters matched, and the monitor-mode flag'],
      ['source, recapUrl', '<code>pacer-rss</code> or <code>courtlistener-recap</code>'],
    ],
    example: {
      caption: 'One docket entry from the Southern District of New York (from the Actor\'s README):',
      json: {
        recordType: 'docket-entry',
        entryId: 'nysd:663583:517',
        court: 'nysd',
        courtName: 'U.S. District Court, Southern District of New York',
        courtType: 'district',
        state: 'NY',
        caseNumber: '1:26-cv-03810',
        caseNumberShort: '26-cv-3810',
        caseTitle: 'First-Citizens Bank & Trust Company v. Patriot Bank, N.A.',
        caseType: 'civil',
        bankruptcyChapter: null,
        entryText: 'Certificate of Service Other',
        entryCategory: 'notice',
        documentNumber: 153,
        documentUrl: 'https://ecf.nysd.uscourts.gov/doc1/127140563915?caseid=663583&de_seq_num=517',
        docketUrl: 'https://ecf.nysd.uscourts.gov/cgi-bin/DktRpt.pl?663583',
        filedAt: '2026-10-17T07:34:33.000Z',
        likelyNewCase: false,
        matchedFilters: ['party:Patriot Bank'],
        isNew: true,
        source: 'pacer-rss',
        recapUrl: null,
        fetchedAt: '2026-10-17T10:22:00.283Z',
      },
    },
    useCases: [
      ['New cases naming a company', 'Combine <code>partyKeywords</code>, <code>entryTypes: ["complaint"]</code> and <code>newCasesOnly</code> to catch a new case opened against or by a company in the courts you watch.'],
      ['Chapter 11 filings', 'Watch <code>deb</code> and <code>nysb</code> with <code>bankruptcyChapters: ["11"]</code> and <code>onlyNewSinceLastRun</code> on an hourly schedule.'],
      ['Follow one case', 'Pass <code>caseNumbers</code> to get every new motion and order in a case without checking the docket by hand.'],
    ],
    input: {
      courts: ['deb', 'nysb'],
      bankruptcyChapters: ['11'],
      maxEntriesPerCourt: 25,
      maxResults: 25,
      onlyNewSinceLastRun: true,
      stateStoreName: 'pacer-chapter-11-de-sdny-monitor',
      notifyOnlyOnResults: true,
    },
    inputCaption: 'New Chapter 11 entries in the Delaware and Southern District of New York bankruptcy courts, new since the last run:',
    prompt: 'Every hour, check the Delaware and SDNY bankruptcy courts for new Chapter 11 filings and give me the case title, entry text and docket link.',
    faq: [
      ['Do I need a PACER account?', 'No. The RSS feeds are public, unauthenticated endpoints. Only opening a linked document on PACER is subject to PACER\'s fees.'],
      ['How far back does it go?', 'The live feeds cover 24 hours. Turn on <code>includeHistorical</code> to also read dockets from the last 1 to 365 days in the RECAP archive. That needs a free CourtListener API token in <code>courtListenerApiKey</code>, since the CourtListener API no longer answers anonymous requests.'],
      ['Why does the same entry appear twice?', 'Some courts attach two event labels to one entry. Both are published with the same <code>entryId</code>; <code>entryKey</code> tells them apart.'],
      ['Can I get the judge or all parties?', 'Not from the feed. Open <code>docketUrl</code> on PACER. Historical RECAP records do include parties, nature of suit and the assigned judge when the archive has them.'],
      ['What if a court\'s feed is down?', 'That court produces one error item and the run continues with the others.'],
    ],
    related: ['pacer-rss-feeds-by-court', 'patent-litigation-docket-monitor', 'bankruptcy-filings-monitor', 'sdny-securities-class-action-monitor'],
  },

  {
    slug: 'pacer-rss-feeds-by-court',
    kind: 'reference',
    actor: 'pacer-docket-monitor',
    title: 'PACER RSS Feeds by Court: All 203 Federal Courts Listed',
    nav: 'PACER RSS feeds by court',
    description:
      'Which federal courts publish a PACER RSS feed and what each carries: code, name, status and entry types for 203 district, bankruptcy, appellate and national courts.',
    lede:
      'Federal courts on CM/ECF can publish a free RSS feed of their docket activity, but not all do, and many publish only some kinds of entries. This page lists all 203 courts in the registry (94 district, 94 bankruptcy, 13 courts of appeals, the Court of Federal Claims and the Court of International Trade) with their CM/ECF code, whether the feed was live, and what it carries.',
    input: { courts: ['nysd'], maxEntriesPerCourt: 100, onlyNewSinceLastRun: false },
    guideLinks: ['patent-litigation-docket-monitor', 'bankruptcy-filings-monitor', 'sdny-securities-class-action-monitor', 'pacer-rss-docket-monitor'],
    prompt: 'Which bankruptcy courts in Texas publish a PACER RSS feed with every entry type?',
    faq: [
      ['How do I read a court\'s PACER RSS feed directly?', 'For district, bankruptcy and national courts, open <code>https://ecf.&lt;code&gt;.uscourts.gov/cgi-bin/rss_outside.pl</code> with the code from the table, for example <code>https://ecf.nysd.uscourts.gov/cgi-bin/rss_outside.pl</code>. Courts of appeals use <code>https://ecf.&lt;code&gt;.uscourts.gov/n/beam/servlet/TransportRoom?servlet=RSSGenerator</code>.'],
      ['Can I see new appeals in a court of appeals feed?', 'No. Appellate feeds carry orders, opinions and judgments only, never new appeals or briefs. Use them to follow an appeal you already know about, by its case number.'],
      ['Why can\'t I filter the Court of International Trade by party?', 'Its feed titles carry only the case number, with no party names, so party filters have nothing to match. Filter by case number or entry text.'],
      ['Do I need a PACER account?', 'Not to read the feeds. They are public, unauthenticated endpoints. Opening a linked document on PACER is subject to PACER\'s own fees.'],
      ['Why do some courts publish only some entry types?', 'Each court chooses which CM/ECF entry types its feed includes. The table lists the types a partial feed advertises, as the feed states them.'],
      ['What does "did not answer" mean?', 'During the probe the court\'s server timed out, sent an empty reply or returned an HTTP error to a request from a datacenter IP. The feed may still work from another network.'],
      ['How far back does a feed go?', 'District, bankruptcy and national feeds cover the trailing 24 hours. To keep a running record, read the feeds at least daily; the Actor\'s README suggests hourly, since courts regenerate feeds every 30 to 60 minutes.'],
      ['How current is this list?', `It reflects the Actor's registry: district and bankruptcy courts from a sweep on 2026-10-17, courts of appeals and national courts from a probe on 2026-11-07. Feed settings change, so a court you name is always tried and each run reports what every court returned.`],
    ],
    related: ['pacer-rss-docket-monitor', 'patent-litigation-docket-monitor', 'bankruptcy-filings-monitor', 'sdny-securities-class-action-monitor'],
  },

  {
    slug: 'patent-litigation-docket-monitor',
    actor: 'pacer-docket-monitor',
    title: 'Patent Case Alerts: D. Del., E.D. Tex. and W.D. Tex. Dockets',
    nav: 'Patent cases: Delaware & Texas',
    description:
      'Watch new civil cases in the District of Delaware and the Eastern and Western Districts of Texas from their PACER RSS feeds, and find patent dockets in the RECAP archive.',
    lede:
      'This guide shows how to follow new cases in the District of Delaware (<code>ded</code>) and the Eastern and Western Districts of Texas (<code>txed</code>, <code>txwd</code>) from their public PACER RSS feeds, and how to narrow to patent cases. The live feeds do not say what a case is about, so the guide also covers the RECAP archive pass, which does.',
    source: `
<p>At the Actor's 2026-10-17 sweep, all three courts published every entry type:</p>
${courtTable(['ded', 'txed', 'txwd'], '../pacer-rss-feeds-by-court/')}
<h3>What the live feeds can and cannot tell you</h3>
<p>Each feed entry has the case number, the case title (the lead parties, such as "Smith v. Acme Corp et al"), a short docket text in brackets, the document number with a link, and the filing time. <strong>Nature of suit, party lists, judges and the full docket text are not in the feeds.</strong> In the Actor's test data the docket text is the entry's label, such as <code>[Notice of Filing]</code>.</p>
<p>So there are two ways to find patent cases:</p>
<ul>
<li><strong>New civil cases, then review.</strong> <code>caseTypes: ["civil"]</code> with <code>newCasesOnly</code> keeps document number 1 of each civil case (the complaint or notice of removal). You get every new civil case in the three courts, with the case title and docket link to review.</li>
<li><strong>Keyword plus the RECAP archive.</strong> <code>entryKeywords</code> matches the docket text, case-insensitively. In the live feeds it matches only when a court's docket text contains the word. With <code>includeHistorical</code> and a free CourtListener API token in <code>courtListenerApiKey</code>, plain keywords (not regexes) are also sent to the RECAP archive's search of entry descriptions, through the Free Law Project's CourtListener API. Archive records carry <code>natureOfSuit</code>, <code>cause</code>, <code>parties</code> and <code>assignedTo</code>.</li>
</ul>
<h3>Limits worth knowing</h3>
<ul>
<li>Each live feed covers only the trailing 24 hours. Schedule at least daily; hourly is a good default.</li>
<li>The RECAP archive holds what RECAP users and the Free Law Project have fetched from PACER, so coverage of a given case varies.</li>
<li>The CourtListener API allows 5 requests per minute, 50 per hour and 125 per day by default, shared by anonymous callers. A free CourtListener token gives a run its own allowance.</li>
<li>This page describes public docket data and how to filter it. It is not legal advice.</li>
</ul>`,
    fields: [
      ['court, courtName, caseNumber, caseTitle', 'Where and which case; the title names the lead parties'],
      ['caseType', '<code>civil</code> for cv case numbers'],
      ['entryText, entryCategory', 'The docket text in the feed and a heuristic category such as <code>complaint</code>'],
      ['documentNumber, likelyNewCase', 'Document 1 marks the opening of a case'],
      ['documentUrl, docketUrl', 'Links to the document and the docket on PACER'],
      ['matchedFilters', 'Which filters the entry matched'],
      ['natureOfSuit, cause, parties, assignedTo', 'Archive records only (<code>source: "courtlistener-recap"</code>)'],
      ['recapUrl', 'The docket or entry on CourtListener, for archive records'],
    ],
    example: {
      caption: 'Shape of a new-case record from the live feed (field names from the Actor; the case and its parties are placeholders):',
      json: {
        recordType: 'docket-entry',
        court: 'txed',
        courtName: 'U.S. District Court, Eastern District of Texas',
        courtType: 'district',
        state: 'TX',
        caseNumber: '2:26-cv-01234',
        caseNumberShort: '26-cv-1234',
        caseTitle: 'Example Patent Holdings LLC v. Sample Devices Inc.',
        caseType: 'civil',
        entryText: 'Complaint',
        entryCategory: 'complaint',
        documentNumber: 1,
        docketUrl: 'https://ecf.txed.uscourts.gov/cgi-bin/DktRpt.pl?000000',
        likelyNewCase: true,
        matchedFilters: ['caseType:civil', 'newCase'],
        isNew: true,
        source: 'pacer-rss',
        recapUrl: null,
      },
    },
    useCases: [
      ['Hourly list of new civil cases', 'Run the first input below every hour with <code>onlyNewSinceLastRun</code>. Each run returns only cases opened since the previous one, with titles and docket links, ready to screen for patent matters.'],
      ['30-day backfill of patent dockets', 'Run the second input to search the RECAP archive for patent-related dockets filed in the three courts in the last 30 days, with nature of suit and parties where the archive has them.'],
      ['A company you follow', 'Add <code>partyKeywords</code> with the company\'s name to be told when a new case in these courts names it in the title, or in the party list of an archive record.'],
    ],
    input: {
      courts: ['ded', 'txed', 'txwd'],
      caseTypes: ['civil'],
      newCasesOnly: true,
      onlyNewSinceLastRun: true,
      stateStoreName: 'new-civil-ded-txed-txwd',
      maxEntriesPerCourt: 200,
      notifyOnlyOnResults: true,
    },
    inputCaption: 'Every new civil case in the three courts since the last run:',
    moreInputs: [
      {
        caption: 'The second input adds the keyword "patent" and the RECAP archive pass for the last 30 days. The keyword applies to live entries too, so live complaints whose docket text lacks the word are left out:',
        json: {
          courts: ['ded', 'txed', 'txwd'],
          caseTypes: ['civil'],
          entryKeywords: ['patent'],
          newCasesOnly: true,
          includeHistorical: true,
          courtListenerApiKey: '<your free CourtListener API token>',
          historicalSinceDays: 30,
          maxHistoricalPerCourt: 100,
          maxEntriesPerCourt: 200,
        },
      },
    ],
    prompt: 'List the new civil cases filed today in the District of Delaware and the Eastern and Western Districts of Texas, with case titles and docket links.',
    faq: [
      ['Can the live feed tell me which new cases are patent cases?', 'Not directly. The feeds carry no nature of suit, and the docket text is short. Review new cases by title and docket, or use the archive pass, whose records include <code>natureOfSuit</code>.'],
      ['Why use a plain keyword instead of a regex for the archive?', 'Only plain keywords are sent to the archive\'s search. A regex is applied locally to the records the search returns.'],
      ['How many archive dockets can a run read?', 'Up to <code>maxHistoricalPerCourt</code> per court (1 to 1,000, default 100), paced at one page of 20 dockets every 12 seconds. Without your own CourtListener token, plan on about 100 dockets per court and a handful of courts per run.'],
      ['Does it download complaints?', 'No. Documents are linked, never downloaded. Opening one on PACER is subject to PACER\'s fees.'],
      ['Is this legal advice?', 'No. It describes public docket data and how to filter it.'],
    ],
    related: ['pacer-rss-feeds-by-court', 'sdny-securities-class-action-monitor', 'bankruptcy-filings-monitor', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'bankruptcy-filings-monitor',
    actor: 'pacer-docket-monitor',
    title: 'New Chapter 11 and Chapter 7 Filings from PACER RSS Feeds',
    nav: 'New bankruptcy filings',
    description:
      'Get new Chapter 11 and Chapter 7 bankruptcy petitions from the public PACER RSS feeds of Delaware, S.D.N.Y. and Texas bankruptcy courts, filtered by chapter.',
    lede:
      'Bankruptcy courts publish their docket activity in public RSS feeds, and most put the chapter in front of each entry. This guide shows how to turn those feeds into a running list of new Chapter 11 and Chapter 7 petitions in Delaware, the Southern District of New York and the Texas bankruptcy courts.',
    source: `
<p>Courts used in this guide, from the Actor's registry (sweep of 2026-10-17):</p>
${courtTable(['deb', 'nysb', 'txsb', 'txnb', 'njb', 'vaeb', 'ilnb'], '../pacer-rss-feeds-by-court/')}
<p>The input below uses the four with feeds of every entry type. Of the others, the New Jersey feed's advertised types do not include a petition type, and the Eastern District of Virginia and Northern District of Illinois bankruptcy feeds did not answer from a datacenter IP at the sweep. The Actor still tries any court you name, and the run's summary says what each one returned.</p>
<h3>How bankruptcy entries are read</h3>
<ul>
<li>Most bankruptcy courts put a prefix before the entry text, for example <code>Type: bk Office: 1 Chapter: 7 Trustee: …</code>. The Actor reads <code>bankruptcyChapter</code>, <code>trustee</code> and <code>office</code> from it, or the chapter from the entry text.</li>
<li><code>bankruptcyChapters</code> keeps entries under the chapters you list (7, 9, 11, 12, 13 or 15). Entries without a chapter are dropped when it is set.</li>
<li><code>newCasesOnly</code> keeps document number 1 of each case, which in a bankruptcy case is the petition. <code>caseTypes: ["bankruptcy"]</code> leaves out adversary proceedings, which have their own case type.</li>
<li>Bankruptcy case numbers often have no type code (<code>26-11511</code>), and some courts append judge initials or the chapter. The Actor keeps the number as published and adds a normalized <code>caseNumberShort</code>.</li>
</ul>
<h3>Limits worth knowing</h3>
<ul>
<li>Each feed covers only the trailing 24 hours. Schedule hourly or at least daily.</li>
<li>The feed carries the case title and the short docket text only; open <code>docketUrl</code> on PACER for the filing itself.</li>
<li>This page describes public docket data and how to filter it. It is not legal or financial advice.</li>
</ul>`,
    fields: [
      ['court, courtName, caseNumber, caseNumberShort', 'Where and which case'],
      ['caseTitle', 'The case name as the court publishes it, usually the debtor'],
      ['bankruptcyChapter, trustee, office', 'From the prefix the court publishes'],
      ['entryText, entryCategory', 'Docket text and a heuristic category such as <code>petition</code>'],
      ['documentNumber, likelyNewCase', 'Document 1 is the petition'],
      ['filedAt', 'Filing time'],
      ['documentUrl, docketUrl', 'Links to the document and docket on PACER'],
      ['matchedFilters, isNew', 'Which filters matched, and the new-since-last-run flag'],
    ],
    example: {
      caption: 'Shape of a new Chapter 11 petition record (field names from the Actor; the debtor and numbers are placeholders):',
      json: {
        recordType: 'docket-entry',
        court: 'deb',
        courtName: 'U.S. Bankruptcy Court, District of Delaware',
        courtType: 'bankruptcy',
        state: 'DE',
        caseNumber: '26-10000',
        caseNumberShort: '26-10000',
        caseTitle: 'Example Holdings, Inc.',
        caseType: 'bankruptcy',
        bankruptcyChapter: 11,
        trustee: null,
        office: '1',
        entryText: 'Voluntary Petition',
        entryCategory: 'petition',
        documentNumber: 1,
        docketUrl: 'https://ecf.deb.uscourts.gov/cgi-bin/DktRpt.pl?000000',
        likelyNewCase: true,
        matchedFilters: ['caseType:bankruptcy', 'chapter:11', 'newCase'],
        isNew: true,
        source: 'pacer-rss',
      },
    },
    useCases: [
      ['Hourly Chapter 11 alerts', 'Schedule the input below hourly with a <code>webhookUrl</code>. Only petitions not seen on earlier runs are sent.'],
      ['Chapter 7 only, one court', 'Set <code>courts: ["deb"]</code> and <code>bankruptcyChapters: ["7"]</code> for the README\'s ready-made Delaware Chapter 7 feed.'],
      ['Every live court in a state', 'Use a state code such as <code>courts: ["TX"]</code>, which expands to every court in that state with a live feed at the last sweep, district courts included. <code>caseTypes: ["bankruptcy"]</code> keeps only bankruptcy cases.'],
    ],
    input: {
      courts: ['deb', 'nysb', 'txsb', 'txnb'],
      caseTypes: ['bankruptcy'],
      bankruptcyChapters: ['11', '7'],
      newCasesOnly: true,
      onlyNewSinceLastRun: true,
      stateStoreName: 'new-ch11-ch7-petitions',
      maxEntriesPerCourt: 500,
      notifyOnlyOnResults: true,
    },
    inputCaption: 'New Chapter 11 and Chapter 7 petitions in four bankruptcy courts, new since the last run:',
    prompt: 'Alert me every hour to new Chapter 11 petitions filed in Delaware (deb) and SDNY Bankruptcy (nysb), only ones not seen before.',
    faq: [
      ['Where does the chapter come from?', 'From the "Chapter:" prefix most bankruptcy courts publish before the entry text, or from the entry text itself.'],
      ['Why are adversary proceedings left out?', 'They have their own case type, <code>adversary</code>. Remove <code>caseTypes</code>, or add <code>adversary</code>, to include them.'],
      ['Does the first run send everything?', 'The first run with <code>onlyNewSinceLastRun</code> is a baseline. Later runs emit only entries not seen before.'],
      ['Can I watch for a specific debtor?', 'Yes. <code>partyKeywords</code> matches the case title, and <code>caseNumbers</code> follows one case.'],
      ['Is this legal or financial advice?', 'No. It describes public docket data and how to filter it.'],
    ],
    related: ['pacer-rss-feeds-by-court', 'patent-litigation-docket-monitor', 'sdny-securities-class-action-monitor', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'sdny-securities-class-action-monitor',
    actor: 'pacer-docket-monitor',
    title: 'S.D.N.Y. Securities and Class Action Complaint Alerts',
    nav: 'S.D.N.Y. securities & class actions',
    description:
      'Follow new civil complaints in the Southern District of New York from its PACER RSS feed and find securities and class-action dockets with keywords and the RECAP archive.',
    lede:
      'The Southern District of New York publishes a large, partial PACER RSS feed that includes complaints. This guide shows how to get every new civil case opened there, and how to narrow to securities and class-action matters with keywords, party names and the RECAP archive.',
    source: `
<p>At the Actor's sweep of 2026-10-17, the S.D.N.Y. feed was live and published only the entry types below. <code>cmp</code> (complaints) is among them:</p>
${courtTable(['nysd'], '../pacer-rss-feeds-by-court/')}
<h3>What the feed gives you, and what it does not</h3>
<p>Each entry has the case number, the case title (lead parties), a short docket text in brackets such as <code>[Memorandum of Law in Support of Motion]</code>, the document number with a link, and the filing time. The feed has no nature of suit, party list or full docket text, so "securities" or "class action" appears in a live entry only if the court's docket text for it contains the phrase.</p>
<ul>
<li><code>caseTypes: ["civil"]</code> with <code>newCasesOnly</code> returns document number 1 of every new civil case: the complaint or notice of removal.</li>
<li><code>entryKeywords</code> such as <code>class action</code> or <code>securities</code> narrow live entries whose docket text contains them. With <code>includeHistorical</code> and a free CourtListener API token in <code>courtListenerApiKey</code>, plain keywords are also sent to the RECAP archive's search of entry descriptions, and archive records carry <code>natureOfSuit</code>, <code>cause</code> and the full <code>parties</code> list.</li>
<li><code>partyKeywords</code> matches the case title in live entries and the party list in archive records, so it also finds companies that are not first-named.</li>
</ul>
<h3>Limits worth knowing</h3>
<ul>
<li>The feed covers the trailing 24 hours, and busy courts publish thousands of entries a day. Use filters and <code>maxEntriesPerCourt</code>.</li>
<li>A party that is not first-named may be missing from a live case title; the archive pass and <code>docketUrl</code> have the rest.</li>
<li>This page describes public docket data and how to filter it. It is not legal advice.</li>
</ul>`,
    fields: [
      ['caseNumber, caseTitle, caseType', 'The case; the title names the lead parties'],
      ['entryText, entryCategory', 'Docket text in the feed and a heuristic category'],
      ['documentNumber, likelyNewCase', 'Document 1 opens the case'],
      ['documentUrl, docketUrl', 'Links to the document and docket on PACER'],
      ['matchedFilters, isNew', 'Which filters matched, and the new-since-last-run flag'],
      ['natureOfSuit, cause, parties, assignedTo', 'Archive records only'],
      ['moreEntriesInArchive, recapUrl', 'Archive records: more entries exist on CourtListener, and the link'],
    ],
    example: {
      caption: 'Shape of a new civil case record from the live S.D.N.Y. feed (field names from the Actor; the case and parties are placeholders):',
      json: {
        recordType: 'docket-entry',
        court: 'nysd',
        courtName: 'U.S. District Court, Southern District of New York',
        courtType: 'district',
        state: 'NY',
        caseNumber: '1:26-cv-09999',
        caseNumberShort: '26-cv-9999',
        caseTitle: 'Doe v. Example Corp. et al',
        caseType: 'civil',
        entryText: 'Complaint',
        entryCategory: 'complaint',
        documentNumber: 1,
        docketUrl: 'https://ecf.nysd.uscourts.gov/cgi-bin/DktRpt.pl?000000',
        likelyNewCase: true,
        matchedFilters: ['caseType:civil', 'newCase'],
        isNew: true,
        source: 'pacer-rss',
      },
    },
    useCases: [
      ['Every new civil complaint, hourly', 'Run the first input on an hourly schedule. Each run lists cases opened since the previous one, to screen by title for securities and class-action matters.'],
      ['Keyword search with the archive', 'Run the second input to combine live keyword matching with a 30-day RECAP archive search for "class action" and "securities", with nature of suit where the archive has it.'],
      ['Issuers you follow', 'Put the companies you follow in <code>partyKeywords</code> with <code>newCasesOnly</code> to be told when a new S.D.N.Y. case names one of them.'],
    ],
    input: {
      courts: ['nysd'],
      caseTypes: ['civil'],
      newCasesOnly: true,
      onlyNewSinceLastRun: true,
      stateStoreName: 'new-civil-nysd',
      maxEntriesPerCourt: 300,
      notifyOnlyOnResults: true,
    },
    inputCaption: 'Every new civil case in S.D.N.Y. since the last run:',
    moreInputs: [
      {
        caption: 'The second input adds the keywords and a 30-day RECAP archive pass. The keywords apply to live entries too, so live complaints whose docket text lacks them are left out:',
        json: {
          courts: ['nysd'],
          caseTypes: ['civil'],
          entryKeywords: ['class action', 'securities'],
          newCasesOnly: true,
          includeHistorical: true,
          courtListenerApiKey: '<your free CourtListener API token>',
          historicalSinceDays: 30,
          maxHistoricalPerCourt: 100,
          maxEntriesPerCourt: 300,
        },
      },
    ],
    prompt: 'Which new lawsuits were filed in the Southern District of New York today naming a bank? Give me case number, title and the docket link.',
    faq: [
      ['Does the S.D.N.Y. feed include complaints?', 'Yes. At the 2026-10-17 sweep its feed advertised <code>cmp</code> among its entry types.'],
      ['Why might a securities complaint not match my keyword?', 'The live feed\'s docket text is short. If the text for a complaint does not contain your phrase, it will not match. The new-civil-cases input catches it regardless.'],
      ['Can I search all parties, not just the lead ones?', 'In archive records, yes: <code>partyKeywords</code> matches the full party list. Live entries only have the case title.'],
      ['Can I follow one case after it is filed?', 'Yes. Put its number in <code>caseNumbers</code>; <code>1:26-cv-03810</code>, <code>26-cv-3810</code> and similar forms all work.'],
      ['Is this legal advice?', 'No. It describes public docket data and how to filter it.'],
    ],
    related: ['pacer-rss-feeds-by-court', 'patent-litigation-docket-monitor', 'bankruptcy-filings-monitor', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'professional-license-verification',
    actor: 'license-verification-api',
    title: 'Professional License Lookup: 7 States and the NPI Registry',
    nav: 'License verification',
    description:
      'Look up professional licenses by number, or by name within one board, in Texas, Florida, Colorado, Washington, Connecticut, New Jersey, Michigan and the NPI Registry: status and expiration.',
    lede:
      'State licensing boards publish their license records in different places and formats. This Actor queries ten official boards in seven states plus the federal NPI Registry, by license number or by name within one board, and returns one normalized record per license with a status and an expiration date. The board\'s disciplinary fields are available on request.',
    source: `
<table>
<thead><tr><th>Source id</th><th>Board</th><th>Coverage</th><th>How it is queried</th></tr></thead>
<tbody>
<tr><td><code>TX_TDLR</code></td><td>Texas Department of Licensing and Regulation</td><td>About 1.0 M licenses: electricians, A/C and HVAC, cosmetologists, barbers, tow operators and more</td><td>Socrata open-data API on data.texas.gov</td></tr>
<tr><td><code>FL_DBPR</code></td><td>Florida Department of Business &amp; Professional Regulation</td><td>Real estate, construction contractors, home inspectors, CPAs, architects, engineers and more</td><td>The public "Verify a Licensee" portal, one request per query</td></tr>
<tr><td><code>CO_DORA</code></td><td>Colorado Department of Regulatory Agencies</td><td>About 1.6 M licenses across every DORA profession, with disciplinary case numbers</td><td>Socrata open-data API on data.colorado.gov, updated daily</td></tr>
<tr><td><code>WA_DOH</code></td><td>Washington State Department of Health</td><td>About 2.5 M health-care credentials, with an "action taken" flag</td><td>Socrata open-data API on data.wa.gov, updated daily</td></tr>
<tr><td><code>NPI</code></td><td>CMS NPPES NPI Registry (federal)</td><td>Every US health-care provider and organization with an NPI</td><td>Official JSON API at npiregistry.cms.hhs.gov</td></tr>
<tr><td><code>CT_ELICENSE</code> (opt-in)</td><td>Connecticut eLicense (Consumer Protection and Public Health)</td><td>About 2.1 M credentials: home improvement and trade contractors, nurses, physicians, real estate and more</td><td>Socrata open-data API on data.ct.gov, updated daily</td></tr>
<tr><td><code>TX_BON</code> (opt-in)</td><td>Texas Board of Nursing</td><td>Registered and licensed vocational nurses, with a current-board-action flag</td><td>Socrata open-data API on data.texas.gov, updated weekly</td></tr>
<tr><td><code>TX_TMB</code> (opt-in)</td><td>Texas Medical Board</td><td>About 514 k licenses and permits: physicians, physician assistants and more</td><td>Socrata open-data API on data.texas.gov, updated daily</td></tr>
<tr><td><code>TX_TREC</code> (opt-in)</td><td>Texas Real Estate Commission</td><td>Sales agents, brokers and broker companies, and real estate inspectors</td><td>Socrata open-data API on data.texas.gov, updated daily</td></tr>
<tr><td><code>NJ_MYLICENSE</code> (opt-in)</td><td>New Jersey Division of Consumer Affairs</td><td>Every profession on the state's License Verification System</td><td>The public verification site, one lookup at a time at one request per second</td></tr>
<tr><td><code>MI_LARA</code> (opt-in)</td><td>Michigan Department of Licensing and Regulatory Affairs</td><td>Every license type on LARA's public licensee search (about 170)</td><td>The public licensee search, one lookup at a time at one request per second</td></tr>
</tbody>
</table>
<p>The first five sources are the default; the six opt-in boards answer only when you list them in <code>sources</code> or name their board in a query. Queries are one line each: <code>TX:3365:Master Electrician</code>, <code>name:Jane Smith:FL</code>, <code>npi:1003000126</code>, or pinned to a board with <code>tdlr:</code>, <code>dbpr:</code>, <code>dora:</code>, <code>doh:</code>, <code>elicense:</code>, <code>bon:</code>, <code>tmb:</code>, <code>trec:</code>, <code>mylicense:</code> or <code>lara:</code>. A query with a state goes only to that state's enabled boards. A license number without a state goes to every enabled source; a name without a state or board is answered only when exactly one source is enabled, because name lookups work within one board and are never a search across states.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Texas publishes no status column, so its status is derived from the expiration date (<code>statusDerived: true</code>).</li>
<li>Open-data extracts can lag the board's live database: Colorado and Washington refresh daily, Texas less often.</li>
<li>Florida returns the first 50 matches of the portal's result page. Common names can match hundreds of licenses; narrow with a state, license type or city.</li>
<li>New Jersey and Michigan are read one lookup at a time.</li>
<li>Other states return an <code>INVALID_QUERY</code> item that names the supported ones. California's DCA and CSLB lookups are not included.</li>
<li>Each record notes that you should confirm with the issuing board before relying on it.</li>
</ul>`,
    fields: [
      ['state, board, source', 'Which registry answered'],
      ['licenseNumber, licenseType, licenseSubtype, profession', 'The license'],
      ['holderName, businessName', 'As the board publishes them'],
      ['status, rawStatus, statusDerived', 'Normalized status (ACTIVE, EXPIRED, SUSPENDED, REVOKED, PROBATION, PENDING, INACTIVE, UNKNOWN) and the board\'s own value'],
      ['issueDate, expirationDate', 'Where published'],
      ['city, county, zip', 'Where published'],
      ['disciplinaryActionFlag, disciplinaryAction', 'Only with <code>includeDiscipline: true</code>: the board\'s own disciplinary fields as published, where the board publishes them'],
      ['verified, verificationNotes', 'Verify mode: found, active and not expired, with plain-English notes'],
      ['sourceUrl, sourceRecordId', 'Where to confirm the record'],
    ],
    example: {
      caption: 'A Texas master electrician in verify mode, query <code>TX:3365:Master Electrician</code> (from the Actor\'s README):',
      json: {
        state: 'TX',
        board: 'TDLR',
        source: 'TX_TDLR',
        licenseNumber: '3365',
        licenseType: 'Master Electrician',
        licenseSubtype: 'ME',
        profession: 'Electrical',
        status: 'ACTIVE',
        rawStatus: null,
        statusDerived: true,
        holderName: 'Womack, Thomas F',
        businessName: null,
        issueDate: null,
        expirationDate: '2027-03-19',
        county: 'Walker',
        sourceUrl: 'https://www.tdlr.texas.gov/LicenseSearch/',
        sourceRecordId: 'MASTER ELECTRICIAN#3365',
        query: 'TX:3365:Master Electrician',
        found: true,
        verified: true,
        verificationNotes: [
          'Active; expires 2027-03-19.',
          'Status derived from the expiration date because the source publishes no status field.',
          'Confirm with the issuing board before relying on this result.',
        ],
      },
    },
    useCases: [
      ['Check a contractor\'s trade license', 'Look up an electrician or HVAC contractor by number in TDLR, or a Florida contractor in DBPR, and read the status and expiration date.'],
      ['Bulk provider lookups', 'Send a list of NPIs or names to the NPI Registry and get taxonomy codes and the self-reported state license number for each.'],
      ['Status-change watch', 'Turn on <code>monitor</code> to write only licenses that are new, changed (status or expiration) or removed since the last run.'],
    ],
    input: {
      queries: ['npi:1003000126', 'name:John Smith:TX'],
      lookups: [],
      mode: 'verify',
      sources: ['TX_TDLR', 'FL_DBPR', 'CO_DORA', 'WA_DOH', 'NPI'],
      maxResultsPerQuery: 5,
      maxResults: 20,
      monitor: false,
    },
    inputCaption: 'One NPI and one Texas name search in verify mode (the Actor\'s own quick-start input):',
    prompt: 'Is Texas master electrician license 3365 active, and when does it expire?',
    faq: [
      ['Which states are covered?', 'By default Texas (TDLR trades and occupations), Florida (DBPR professions), Colorado (all DORA professions) and Washington (health-care credentials), plus every US health-care provider through the NPI Registry. Opt-in: Texas nursing (BON), medicine (TMB) and real estate (TREC), Connecticut (all eLicense credentials), New Jersey (all Division of Consumer Affairs professions) and Michigan (all LARA license types).'],
      ['Where is the disciplinary flag?', 'Off by default. Set <code>includeDiscipline: true</code> and boards that publish disciplinary fields (Colorado, Washington, Texas BON, Texas Medical Board, New Jersey and Michigan) return them as published. The Actor adds no severity or risk score.'],
      ['What does <code>verified</code> mean?', 'The license was found, its status is ACTIVE and the expiration date is today or later. Statuses such as "Active - With Conditions" normalize to PROBATION and do not verify.'],
      ['Is this the board\'s official verification?', 'No. It reads the boards\' public records and links each one. Confirm with the issuing board before relying on a result.'],
      ['Why do I get several records for one number?', 'License numbers repeat across license types in Texas and Colorado. Add the type, for example <code>TX:3365:Master Electrician</code>.'],
      ['Does it need proxies or a key?', 'No. A free Socrata app token is optional and only raises rate limits on the Socrata open-data datasets.'],
    ],
    related: ['building-permits-api', 'osha-inspections-by-company'],
  },

  {
    slug: 'spf-dmarc-dkim-checker',
    actor: 'spf-dmarc-dkim-checker',
    title: 'Bulk SPF, DMARC and DKIM Checker for Domain Lists',
    nav: 'SPF, DMARC & DKIM checker',
    description:
      'Check SPF, DMARC, DKIM, MTA-STS and BIMI for a list of domains and get a 0-100 email security score per domain, plus RDAP WHOIS, DNS, TLS expiry and HTTP headers.',
    lede:
      'Checking email authentication one domain at a time is slow. This Actor takes a list of domains and returns one record per domain with its SPF, DMARC, DKIM, MTA-STS and BIMI setup, an email security score, and optionally WHOIS, TLS and HTTP data.',
    source: `
<p>Everything comes from public sources: DNS records over DNS-over-HTTPS (Cloudflare, with Google as fallback), registration data from <strong>RDAP</strong> (the successor to WHOIS), and each domain's own TLS and HTTP endpoints. No API keys, proxies or browser.</p>
<p>The <code>dns</code> section reads A, AAAA, MX, NS, TXT, CAA and SOA records and checks:</p>
<ul>
<li><strong>SPF</strong>: record present, syntax, lookup count and the <code>all</code> qualifier.</li>
<li><strong>DMARC</strong>: policy, subdomain policy, <code>pct</code>, and aggregate and forensic reporting addresses.</li>
<li><strong>DKIM</strong>: 18 common selectors probed, plus any you add.</li>
<li><strong>MTA-STS</strong> record and policy mode, and <strong>BIMI</strong>.</li>
</ul>
<h3>How the email security score is computed</h3>
<table>
<thead><tr><th>Check</th><th>Points</th></tr></thead>
<tbody>
<tr><td>SPF record present and valid (10 lookups or fewer, no unknown terms, single record)</td><td>25</td></tr>
<tr><td>DMARC policy <code>reject</code> / <code>quarantine</code> / <code>none</code></td><td>35 / 20 / 5</td></tr>
<tr><td>At least one DKIM selector found</td><td>25</td></tr>
<tr><td>MTA-STS record present</td><td>10</td></tr>
<tr><td>BIMI record present</td><td>5</td></tr>
</tbody>
</table>
<h3>Limits worth knowing</h3>
<ul>
<li>DKIM selectors cannot be listed from outside, only probed. A domain whose selector is not in the list shows no DKIM even if it is configured; add your provider's selector in <code>dkimSelectors</code>.</li>
<li>The SPF lookup count covers the top-level record only (includes are not followed), so it is a lower bound.</li>
<li>Subdomains are reduced to their registrable domain, and many registries redact WHOIS contact data.</li>
<li>All sections of a domain share a 20-second budget; a slow source marks its own section as an error without blocking the others.</li>
</ul>`,
    fields: [
      ['dns.spfRecord, spfValid, spfAllQualifier, spfLookupCount, spfIssues', 'SPF'],
      ['dns.dmarcRecord, dmarcPolicy, dmarcSubdomainPolicy, dmarcPct, hasRua, hasRuf', 'DMARC'],
      ['dns.dkimSelectorsProbed, dkimSelectorsFound', 'DKIM'],
      ['dns.mtaStsPresent, mtaStsPolicyMode, bimiRecord', 'MTA-STS and BIMI'],
      ['dns.mx, mxProviderGuess', 'Mail servers and a provider guess (Google, Microsoft, Zoho and others)'],
      ['emailSecurityScore, summary', 'Score from 0 to 100 and a one-line summary'],
      ['whois.*', 'Registrar, registration and expiration dates, nameservers, DNSSEC (with <code>whois</code>)'],
      ['tls.*, http.*', 'Certificate issuer and expiry, status code, redirects, security headers, tech hints'],
    ],
    example: {
      caption: 'The email-security part of one record for github.com (from the Actor\'s README; values illustrative, other sections omitted):',
      json: {
        domain: 'github.com',
        dns: {
          status: 'ok',
          hasMx: true,
          mxProviderGuess: 'google',
          spfRecord: 'v=spf1 ip4:192.30.252.0/22 include:_netblocks.google.com ... ~all',
          spfValid: true,
          spfAllQualifier: '~all',
          spfLookupCount: 7,
          spfIssues: [],
          dmarcRecord: 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@github.com',
          dmarcPolicy: 'reject',
          dmarcSubdomainPolicy: null,
          dmarcPct: 100,
          hasRua: true,
          hasRuf: false,
          dmarcIssues: [],
          dkimSelectorsProbed: 18,
          dkimSelectorsFound: ['google', 'pm'],
          mtaStsPresent: true,
          mtaStsPolicyMode: 'enforce',
          bimiRecord: null,
        },
        dmarcPolicy: 'reject',
        emailSecurityScore: 95,
        errors: {},
      },
    },
    useCases: [
      ['Deliverability audit of a client list', 'Run the <code>dns</code> section over every client domain and sort by <code>emailSecurityScore</code> to find missing DMARC or a soft SPF policy.'],
      ['Expiry watch', 'Run <code>whois</code> and <code>tls</code> on a schedule and alert on low <code>daysUntilExpiry</code> for domains and certificates.'],
      ['Lead segmentation', 'Combine <code>dns</code> and <code>http</code> to group domains by mail provider and tech stack hints.'],
    ],
    input: {
      domains: ['example.com', 'github.com', 'apify.com', 'cloudflare.com', 'mozilla.org', 'wikipedia.org', 'stripe.com', 'shopify.com', 'nytimes.com', 'python.org'],
      sections: ['dns'],
      dkimSelectors: [],
      maxConcurrency: 5,
    },
    inputCaption: 'SPF, DMARC and DKIM for ten domains, DNS section only:',
    prompt: 'Check SPF, DMARC and DKIM for these ten domains and list the ones whose DMARC policy is not reject, with their email security score.',
    faq: [
      ['Why does a domain show no DKIM when I know it has it?', 'DKIM selectors are not discoverable. The Actor probes 18 common ones; add yours in <code>dkimSelectors</code> (for example <code>fm1</code> for Fastmail or <code>krs</code> for Klaviyo).'],
      ['Does it send email or change anything?', 'No. It only reads public DNS, RDAP, TLS and HTTP responses.'],
      ['How many domains can I check?', 'The list has no fixed cap. Up to 20 domains run in parallel (<code>maxConcurrency</code>), and the run stops cleanly at its maximum total charge.'],
      ['Why is a WHOIS field empty?', 'Most registries redact personal data, and some country domains offer no RDAP. The Actor reports exactly what the registry returns.'],
      ['What if a site has no web server?', '<code>tls.status</code> and <code>http.status</code> become <code>unavailable</code>; the DNS and WHOIS sections are still filled.'],
    ],
    related: ['sitemap-change-monitor', 'shopify-price-tracker'],
  },

  {
    slug: 'sitemap-change-monitor',
    actor: 'website-change-monitor',
    title: 'Sitemap Monitor: Track New, Removed and Changed Pages',
    nav: 'Sitemap change monitor',
    description:
      'Monitor a website through its sitemaps: new, removed and updated pages, content changes with word-level diff previews, and a severity per change. No browser needed.',
    lede:
      'A site\'s sitemaps list every page it wants indexed, with last-modified dates. This Actor reads them, keeps a snapshot per site, and on each run reports which pages appeared, disappeared, changed their lastmod date or changed their content.',
    source: `
<p>The Actor follows <code>robots.txt</code> <code>Sitemap:</code> lines, sitemap indexes, and plain, gzipped and text sitemaps, falling back to <code>/sitemap.xml</code> and <code>/sitemap_index.xml</code>. That is the <a href="https://www.sitemaps.org/protocol.html">sitemaps protocol</a> sites already publish for search engines.</p>
<ul>
<li><strong>Discover mode</strong> lists every page URL with <code>lastmod</code>, <code>changefreq</code> and <code>priority</code>.</li>
<li><strong>Monitor mode</strong> keeps a snapshot per site and emits one record per change: <code>new-url</code>, <code>removed-url</code>, <code>lastmod-changed</code>, <code>content-changed</code> and <code>status-changed</code>.</li>
</ul>
<p>Content changes are detected without a browser. Each HTML page is scoped to a CSS selector (<code>main, article, body</code> by default), stripped of scripts, styles and whitespace noise, optionally stripped of numbers and dates, and hashed. A changed page gets a word-level preview of what was added and removed, and a <code>severity</code> of low, medium or high with a reason.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Only pages listed in the sitemaps are tracked.</li>
<li><code>maxPages</code> cuts the list in sitemap order. In monitor mode set it above the site's page count, or the tail of the sitemap will look removed.</li>
<li>Pages are fetched as plain HTML (up to 1 MB, 20-second timeout), at about two requests per second per host, and <code>robots.txt</code> Disallow rules are honored. JavaScript-rendered content is not executed.</li>
<li>The first monitor run is a baseline: every page becomes a <code>baseline</code> record and changes appear from the second run on.</li>
</ul>`,
    fields: [
      ['changeType', 'discovered, baseline, new-url, removed-url, lastmod-changed, content-changed, status-changed or error'],
      ['url, site, sitemapUrl', 'The page, the input site and the sitemap it came from'],
      ['lastmod, changefreq, priority', 'As listed in the sitemap'],
      ['status, title, contentHash', 'HTTP status, page title and the content hash'],
      ['changedFields', 'Every field that changed when several changed at once'],
      ['changedPreview', 'Added and removed word counts, previews and a similarity ratio'],
      ['severity, severityReason', 'low, medium or high, with a one-phrase reason'],
      ['before, after', 'Previous and current page snapshots'],
    ],
    example: {
      caption: 'A content-changed record from a monitor run (shape from the Actor\'s README; values illustrative, snapshots omitted):',
      json: {
        changeType: 'content-changed',
        site: 'https://example.com',
        url: 'https://example.com/pricing',
        changedFields: ['contentHash', 'lastmod'],
        title: 'Pricing — Example',
        lastmod: '2026-10-16',
        status: 200,
        contentHash: '3f9a1c…',
        changedPreview: {
          addedWords: 3,
          removedWords: 1,
          addedPreview: 'SSO now included',
          removedPreview: 'Add-on',
          similarity: 0.94,
          changedRatio: 0.06,
          numbersChanged: false,
        },
        severity: 'low',
        severityReason: '6% of the text changed',
        detectedAt: '2026-10-16T12:00:09.000Z',
      },
    },
    useCases: [
      ['New pages on a competitor\'s site', 'Monitor with <code>checkContent: false</code> for a lighter, sitemap-only diff that reports new and removed URLs.'],
      ['Documentation or policy page changes', 'Narrow with <code>includePatterns</code> and a <code>contentSelector</code> such as <code>main</code>, and get content-changed records with a diff preview.'],
      ['Full URL inventory', 'Discover mode lists every URL in a site\'s sitemaps with its last-modified date, for SEO audits or crawl planning.'],
    ],
    input: {
      sites: ['https://www.sitemaps.org/sitemap.xml'],
      mode: 'monitor',
      checkContent: false,
      maxPages: 200,
      stateStoreName: 'website-change-monitor-sitemaps-org',
      resetBaseline: false,
      notifyOnlyOnChanges: true,
    },
    inputCaption: 'Sitemap-level monitoring (new and removed pages, lastmod changes) for one site:',
    prompt: 'Tell me which pages were added to or removed from sitemaps.org since the last check.',
    faq: [
      ['Does it work with sitemap indexes and gzipped sitemaps?', 'Yes. Indexes are followed recursively, <code>.xml.gz</code> files are decompressed and plain-text sitemaps are accepted.'],
      ['How do I avoid false positives from dates and counters?', 'Point <code>contentSelector</code> at the element with the real content and turn on <code>ignoreNumbers</code>.'],
      ['How is severity decided?', 'A removed page or a page that starts failing is high, a new page is medium, a lastmod change with unchanged content is low, and a content change is scored by the share of words that changed.'],
      ['Can I get alerts?', 'Set <code>webhookUrl</code>. By default it is called only when changes were found, with a run summary and up to 1,000 change records.'],
      ['Does it render JavaScript?', 'No. Pages are fetched as plain HTML; use a selector that targets server-rendered markup.'],
    ],
    related: ['shopify-price-tracker', 'spf-dmarc-dkim-checker'],
  },

  {
    slug: 'shopify-price-tracker',
    actor: 'shopify-catalog-monitor',
    title: 'Shopify Price Tracker: Catalog and Changes as JSON',
    nav: 'Shopify price tracker',
    description:
      'Export any public Shopify store\'s catalog from products.json, every variant with price, compare-at price, availability and SKU, or track price and stock changes.',
    lede:
      'Every Shopify storefront serves its public catalog as JSON at <code>/products.json</code>. This Actor reads it for one store or many, writes one clean record per variant or product, and in changes mode reports only what moved since the last run: prices, stock and new or removed products.',
    source: `
<p>Shopify storefronts expose <code>/products.json</code> (and <code>/collections.json</code>) publicly. The Actor paginates each store 250 products at a time, normalizes prices to numbers, builds canonical product URLs and stamps each record with <code>fetchedAt</code>. No browser, proxies or API keys.</p>
<p>In <strong>changes</strong> mode it keeps the previous snapshot of each store in a key-value store you name and writes only what changed, with <code>before</code> and <code>after</code> values and the percentage price move. Change types are <code>new-product</code>, <code>removed-product</code>, <code>new-variant</code>, <code>removed-variant</code>, <code>price-changed</code>, <code>availability-changed</code> and <code>title-changed</code>.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Requests to each store are spaced about 500 ms apart, so a 5,000-product store takes roughly 15 to 20 seconds.</li>
<li>Most stores do not expose inventory quantities; <code>inventoryQuantity</code> is null unless the store publishes it.</li>
<li>Password-protected stores, stores not on Shopify, and stores that block datacenter traffic return an error item. The Actor does not use residential proxies or browsers to get around that.</li>
<li>When <code>maxProductsPerStore</code> truncates a listing, removals are not reported for that store, to avoid false "removed" events.</li>
</ul>`,
    fields: [
      ['storeDomain, productId, productHandle, productTitle', 'The store and product'],
      ['vendor, productType, tags', 'As set by the store'],
      ['variantId, variantTitle, sku, barcode, option1-3', 'The variant'],
      ['price, compareAtPrice', 'Numbers in the store\'s currency'],
      ['available, inventoryQuantity', 'Availability; quantity only where the store publishes it'],
      ['productUrl, imageUrl, grams', 'Canonical URL, image and weight'],
      ['createdAt, updatedAt, publishedAt', 'Timestamps from Shopify'],
      ['recordType, changeType, before, after, percentChange', 'In changes mode'],
    ],
    example: {
      caption: 'A price-changed record in changes mode (from the Actor\'s README; illustrative ids):',
      json: {
        recordType: 'change',
        changeType: 'price-changed',
        changedFields: ['price'],
        before: { price: 98, compareAtPrice: 120 },
        after: { price: 88.2, compareAtPrice: 120 },
        percentChange: -10,
        detectedAt: '2026-10-17T12:00:00.000Z',
        storeDomain: 'www.allbirds.com',
        productTitle: 'Wool Runner',
        variantTitle: 'Natural Grey / 9',
        price: 88.2,
        available: true,
        productUrl: 'https://www.allbirds.com/products/wool-runner',
      },
    },
    useCases: [
      ['Competitor price tracking', 'Run changes mode daily on a set of competitor stores and send <code>price-changed</code> events, with the percentage move, to a webhook.'],
      ['Supplier stock watch', 'Watch <code>availability-changed</code> events on a supplier\'s store to know when variants go out of stock or come back.'],
      ['Catalog export', 'Snapshot mode exports every variant with price, SKU, options and image, for analysis or a product feed.'],
    ],
    input: {
      storeUrls: ['www.deathwishcoffee.com'],
      mode: 'changes',
      granularity: 'variant',
      maxProductsPerStore: 30,
      includeCollections: false,
      stateStoreName: 'shopify-price-monitor-deathwishcoffee',
    },
    inputCaption: 'Price and stock changes on one store (the first run stores a baseline):',
    prompt: 'Track the prices on www.deathwishcoffee.com and tell me which variants changed price or went out of stock since yesterday.',
    faq: [
      ['Does it need a Shopify API key?', 'No. It reads the public <code>products.json</code> endpoint that Shopify serves for storefronts.'],
      ['Why does the first changes run return so many records?', 'There is nothing to compare against yet, so the full catalog is stored as <code>baseline</code> records. Later runs return only changes.'],
      ['What counts as a change?', 'Price, compare-at price, availability, product title and variant title, plus products and variants that appear or disappear. A new product is one event, not one per variant.'],
      ['Can I track stores that are not on Shopify?', 'Use the <a href="../ecommerce-price-tracker/">e-commerce price tracker</a>, which reads WooCommerce, Magento and other stores in the same record shape. For page and content changes on any site, use the <a href="../sitemap-change-monitor/">sitemap change monitor</a>.'],
      ['How do I start a fresh baseline?', 'Use a new <code>stateStoreName</code>, or delete the store\'s key in the existing one.'],
    ],
    related: ['sitemap-change-monitor', 'spf-dmarc-dkim-checker'],
  },

  {
    slug: 'ecommerce-price-tracker',
    actor: 'ecommerce-scraper',
    title: 'E-commerce Price Tracker: WooCommerce, Magento and Any Store',
    nav: 'E-commerce price tracker',
    description:
      'Export a WooCommerce, Magento, Shopify, Squarespace, BigCommerce or Wix store\'s catalog as JSON, every variant with price, stock and SKU, or track price and stock changes.',
    lede:
      'Most online stores publish their catalog somewhere public: WooCommerce and Magento through storefront APIs, Shopify through <code>products.json</code>, and almost every other platform as schema.org Product data on each product page. This Actor detects the platform, reads the catalog the cheapest public way, writes one record per variant or product in one shape, and in changes mode reports only what moved since the last run.',
    source: `
<table>
<thead><tr><th>Platform</th><th>How it is read</th><th>Products per request</th></tr></thead>
<tbody>
<tr><td>WooCommerce</td><td>Store API <code>/wp-json/wc/store/v1/products</code>, the unauthenticated API WooCommerce's block checkout uses; variations by id</td><td>100</td></tr>
<tr><td>Magento 2 / Adobe Commerce</td><td>Guest storefront GraphQL <code>/graphql</code>, configurable products with their variants</td><td>50</td></tr>
<tr><td>Shopify</td><td>Public <code>products.json</code></td><td>250</td></tr>
<tr><td>Squarespace, BigCommerce, Wix, Salesforce Commerce Cloud, custom stores</td><td>Product URLs from the store's XML sitemap, then the schema.org <code>Product</code> / <code>ProductGroup</code> JSON-LD on each product page</td><td>1 per page</td></tr>
</tbody>
</table>
<p>The Actor looks at a store's home page once to detect the platform. If a catalog API is disabled, blocked or disallowed by robots.txt, <code>auto</code> mode falls back to the product pages' JSON-LD. You can also skip discovery and pass <code>productUrls</code> to watch a fixed set of product pages on any platform. Every record has the same shape as the <a href="../shopify-price-tracker/">Shopify price tracker</a>'s, plus <code>platform</code>, <code>source</code>, <code>currency</code> and <code>categories</code>, so datasets from both Actors line up. No browser, proxy, login or API key.</p>
<p>In <strong>changes</strong> mode it keeps the previous snapshot of each store in a key-value store you name and writes only what changed, with <code>before</code> and <code>after</code> values and the percentage price move. Change types are <code>new-product</code>, <code>removed-product</code>, <code>new-variant</code>, <code>removed-variant</code>, <code>price-changed</code>, <code>availability-changed</code> and <code>title-changed</code>.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>robots.txt is read first and honored for every request. If it cannot be reached, the store is not read.</li>
<li>Requests to one store are spaced at least 500 ms apart, and each store has a time budget (<code>maxSecondsPerStore</code>, default 900 seconds). When a store stops early, what was read is kept, and in changes mode no removals are reported for that store.</li>
<li>The JSON-LD route needs one request per product page and reads at most 25 sitemap files per store. Product pages without Product JSON-LD and an offer are counted and reported, not guessed at.</li>
<li>Ecwid and Shopware 6 are not supported, because their storefront APIs need the merchant's access token. Stores that block datacenter traffic return an error item; the Actor does not use proxies or browsers to get around that.</li>
</ul>`,
    fields: [
      ['storeDomain, platform, source', 'The store, its detected platform and the reader used (<code>woocommerce-store-api</code>, <code>magento-graphql</code>, <code>shopify-products-json</code> or <code>json-ld</code>)'],
      ['productId, productHandle, productTitle, productUrl', 'The product'],
      ['vendor, productType, categories, tags', 'As set by the store'],
      ['variantId, variantTitle, sku, barcode, option1-3', 'The variant; JSON-LD records take <code>barcode</code> from a GTIN'],
      ['price, compareAtPrice, currency', 'Numbers in the store\'s currency; on JSON-LD pages <code>compareAtPrice</code> comes from a strike-through price'],
      ['available', 'Availability; <code>null</code> when a JSON-LD offer does not say'],
      ['imageUrl, fetchedAt', 'Image and read time'],
      ['recordType, changeType, changedFields, before, after, percentChange', '<code>snapshot</code>, <code>baseline</code>, <code>change</code> or <code>error</code>; change fields in changes mode'],
    ],
    example: {
      caption: 'A variant record from the WooCommerce Store API (from the Actor\'s README):',
      json: {
        storeDomain: 'mercantile.wordpress.org',
        platform: 'woocommerce',
        source: 'woocommerce-store-api',
        productId: '34907',
        productHandle: 'blue-wordpress-flannel-button-down',
        productTitle: 'Blue WordPress Flannel Button-down',
        vendor: null,
        productType: 'Apparel',
        categories: ['Apparel', 'Unisex'],
        tags: [],
        productUrl: 'https://mercantile.wordpress.org/product/blue-wordpress-flannel-button-down/',
        variantId: '34916',
        variantTitle: 'Adult Unisex MD',
        sku: 'A8C-151-M',
        barcode: null,
        price: 48,
        compareAtPrice: null,
        currency: 'USD',
        available: true,
        option1: 'Adult Unisex MD',
        imageUrl: 'https://mercantile.wordpress.org/wp-content/uploads/2026/10/Howdy-51.png',
        fetchedAt: '2026-11-09T06:04:35.773Z',
        recordType: 'snapshot',
      },
    },
    useCases: [
      ['Competitor price tracking across platforms', 'Run changes mode daily on competitor stores, whatever they run on, and send <code>price-changed</code> events with the percentage move to a webhook.'],
      ['Watch specific products', 'Pass a list of product page URLs in <code>productUrls</code> to track price and availability of the items you care about, on any platform that publishes Product JSON-LD.'],
      ['Catalog export', 'Snapshot mode exports every variant with price, currency, SKU, categories and image, for analysis, MAP checks or a product feed.'],
    ],
    input: {
      storeUrls: ['mercantile.wordpress.org'],
      mode: 'changes',
      granularity: 'variant',
      stateStoreName: 'mercantile-price-watch',
      webhookUrl: 'https://hooks.example.com/price-changes',
    },
    inputCaption: 'A daily price and stock monitor on one WooCommerce store, posted to a webhook (from the Actor\'s README; the first run writes the baseline):',
    prompt: 'Every morning check these three Magento and WooCommerce competitor stores for price drops and new products and post only the changes to my webhook.',
    faq: [
      ['Does it need an API key or proxies?', 'No. It reads public catalog endpoints and product pages with plain HTTP. Stores that block datacenter traffic return an error item.'],
      ['Which platform will my store be read with?', 'The <code>platform</code> and <code>source</code> fields on every record say so. Set <code>platform</code> to force one.'],
      ['Why does the first changes run return so many records?', 'There is nothing to compare against yet, so the full catalog is stored as <code>baseline</code> records. Later runs return only changes.'],
      ['Is there a Shopify-only version?', 'Yes, the <a href="../shopify-price-tracker/">Shopify price tracker</a>, which also reports collection membership. This Actor reads Shopify stores too, without collections.'],
      ['Does it touch carts, checkout or customer data?', 'No. It reads only the product data the store publishes to every visitor.'],
    ],
    related: ['shopify-price-tracker', 'sitemap-change-monitor'],
  },

  {
    slug: 'pdf-to-markdown-rag',
    actor: 'pdf-to-markdown',
    title: 'PDF to Markdown for RAG: Headings, Tables, Chunks and OCR',
    nav: 'PDF to Markdown for RAG',
    description:
      'Convert PDF, Office, OpenDocument, EPUB, HTML, text, CSV and image URLs to clean Markdown with headings, GFM tables and page markers, plus heading-aware chunks for embedding and OCR in 21 languages.',
    lede:
      'Retrieval pipelines work best on text that keeps a document\'s structure: headings at the right level, tables as tables, and page numbers you can cite. This Actor turns document URLs into that kind of Markdown and can split it into heading-aware chunks ready to embed.',
    source: `
<p>The input is any public document URL: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>PPTX</strong> (one page per slide, speaker notes kept), <strong>XLSX/XLSM</strong> (one table per sheet), <strong>OpenDocument</strong> (ODT, ODP, ODS), <strong>EPUB</strong>, <strong>HTML</strong>, <strong>Markdown</strong>, <strong>plain text</strong>, <strong>CSV/TSV</strong> and <strong>images</strong> (PNG, JPEG, GIF, WebP, TIFF, BMP, AVIF, HEIC, read with OCR), plus <code>kvs://&lt;storeId&gt;/&lt;key&gt;</code> references to files in your own Apify key-value stores and <code>data:</code> URLs. Conversion runs inside the Actor with open-source libraries (pdf.js, mammoth, turndown and tesseract.js). There is no browser and no external conversion service; the Actor contacts only the URLs you give it and your optional webhook.</p>
<p>For PDFs it rebuilds the layout from the file's own text layer: headings from font-size and bold clusters, tables from column alignment, two-column pages read column by column, and running headers, footers and page numbers stripped. Each document becomes one record with the Markdown and its metadata (title, author, producer, creation date, page count, headings, tables and links).</p>
<h3>Chunks and OCR</h3>
<ul>
<li><code>chunk: true</code> adds one <code>chunk</code> record per heading-aware chunk, with <code>startPage</code>, <code>endPage</code>, the <code>headingPath</code> it sits under and a token estimate. Chunk size and overlap are configurable.</li>
<li><code>ocr: true</code> runs bundled OCR models on PDF pages that have no text layer and on image inputs, in up to three of 21 languages per run (<code>ocrLanguages</code>, English by default). Without it, those pages are listed in <code>needsOcrPages</code> and marked in the Markdown, and nothing is recognized.</li>
<li><code>extractTables: true</code> adds one <code>table</code> record per table, with its rows as objects, and writes a CSV file per table to the key-value store.</li>
<li><code>extractImages: true</code> saves the images embedded in PDF, DOCX, PPTX, OpenDocument and EPUB files to the key-value store and links them from the Markdown.</li>
</ul>
<h3>Limits worth knowing</h3>
<ul>
<li>Files up to 25 MB by default (<code>maxFileSizeMb</code>, at most 50), a 20-second download timeout by default, and 10 minutes of conversion per file. After that, the pages converted so far are returned with a <code>PROCESSING_TIMEOUT</code> warning.</li>
<li>Layout reconstruction is heuristic. Complex forms, rotated text, equations and multi-line table cells are best effort.</li>
<li>Image inputs are capped at 10 MB each.</li>
<li>OCR reads at most three languages per run and takes about two to five seconds per page.</li>
<li>Password-protected, corrupt or unsupported files return an error item with a clear code instead of failing the run.</li>
</ul>`,
    fields: [
      ['recordType', '<code>document</code>, <code>chunk</code> when chunking is on, or <code>table</code> when <code>extractTables</code> is on'],
      ['url, filename, mimeType, bytes', 'The source file'],
      ['pages, pagesProcessed', 'Page count and pages converted'],
      ['title, author, producer, creationDate', 'Document metadata, where the file has it'],
      ['markdown', 'The converted text, with <code>&lt;!-- page N --&gt;</code> markers unless <code>pageBreaks</code> is off'],
      ['characters, words, headings, tables, links', 'Size and structure of the result'],
      ['needsOcrPages, ocrPages, warnings', 'Pages without a text layer, pages recognized by OCR, and conversion notes'],
      ['chunkIndex, chunkCount, startPage, endPage, headingPath, tokensEstimate', 'On chunk records'],
      ['kvsKey', 'The <code>.md</code> file key when <code>saveToKeyValueStore</code> is on'],
    ],
    example: {
      caption: 'One chunk record from the "Attention Is All You Need" paper on arXiv (from the Actor\'s README; Markdown shortened):',
      json: {
        recordType: 'chunk',
        url: 'https://arxiv.org/pdf/1706.03762v7',
        filename: '1706.03762v7.pdf',
        chunkIndex: 4,
        chunkCount: 17,
        startPage: 3,
        endPage: 4,
        headingPath: ['Attention Is All You Need', '3 Model Architecture', '3.2 Attention'],
        markdown: '### 3.2 Attention\n\nAn attention function can be described as mapping a query and a set of key-value pairs to an output ...',
        tokensEstimate: 572,
        characters: 2287,
        fetchedAt: '2026-10-16T13:20:00.000Z',
      },
    },
    useCases: [
      ['RAG ingestion', 'Turn on <code>chunk</code> and send the chunk records to your embedding step. <code>startPage</code>, <code>endPage</code> and <code>headingPath</code> let answers cite where a passage came from.'],
      ['Mixed document folders', 'Send PDFs, DOCX files and HTML pages in one run and get the same record shape back for each. <code>saveToKeyValueStore</code> also writes each one as a <code>.md</code> file.'],
      ['Scanned PDFs', 'Turn on <code>ocr</code> for scans. The Markdown marks which pages were recognized, so you can review them separately.'],
    ],
    input: {
      urls: ['https://arxiv.org/pdf/1706.03762v7'],
      chunk: true,
      chunkTokens: 800,
      chunkOverlapTokens: 80,
      ocr: false,
      saveToKeyValueStore: false,
      pageBreaks: true,
      maxFileSizeMb: 25,
      downloadTimeoutSecs: 20,
    },
    inputCaption: 'One arXiv paper as Markdown plus 800-token chunks with an 80-token overlap:',
    prompt: 'Convert this PDF to Markdown and split it into chunks of about 800 tokens, keeping the page numbers and section headings for each chunk.',
    faq: [
      ['Does it send my documents to another service?', 'No. Files are downloaded over HTTPS and converted inside the Actor. Only the URLs you give and your optional webhook are contacted.'],
      ['How do chunks reference pages?', 'Each chunk carries <code>startPage</code> and <code>endPage</code> from the page markers, and <code>headingPath</code>, the headings it sits under.'],
      ['What happens with a scanned PDF?', 'Pages with no text layer are listed in <code>needsOcrPages</code> and marked in the Markdown. Turn on <code>ocr</code> to have them recognized; they then appear in <code>ocrPages</code>.'],
      ['How are DOCX and HTML pages counted?', 'DOCX files use their saved page count. When that is missing, and for HTML, Markdown and text, pages are estimated at one per roughly 3,000 characters (<code>pagesEstimated: true</code>).'],
      ['I need specific fields, not Markdown.', 'Use the <a href="../document-to-json/">document to JSON extractor</a>, which runs the same layout engine against a schema you define.'],
    ],
    related: ['document-to-json', 'podcast-rss-feed-scraper'],
  },

  {
    slug: 'document-to-json',
    actor: 'pdf-to-json',
    title: 'PDF to JSON with Your Own Schema: Invoices, Forms, Quotes',
    nav: 'Document to JSON',
    description:
      'Extract PDF, Office, EPUB, HTML and scanned documents into JSON that matches a JSON Schema you define, with per-field confidence and missing fields. Rules mode or Claude.',
    lede:
      'Pass document URLs and a JSON Schema describing the object you want (invoice number, line items, totals, form fields, dates) and get back one JSON object per document in exactly that shape, with a confidence score per field and a list of fields that were not found.',
    source: `
<p>Documents are read from public URLs, your own key-value stores (<code>kvs://</code>) or <code>data:</code> URLs: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>PPTX</strong>, <strong>XLSX/XLSM</strong>, <strong>OpenDocument</strong> (ODT, ODP, ODS), <strong>EPUB</strong>, <strong>HTML</strong>, <strong>Markdown</strong>, <strong>plain text</strong>, <strong>CSV/TSV</strong> and <strong>images</strong> (PNG, JPEG, GIF, WebP, TIFF, BMP, AVIF). They go through a layout engine first (headings, tables, lists and page markers), so table rows stay rows and labels stay next to their values.</p>
<p>The <code>schema</code> input is a JSON Schema (draft-07 subset): <code>type: object</code> at the top, field types string, number, integer, boolean, array and object, with <code>description</code>, <code>format</code> (date, date-time, email, uri) and <code>enum</code>. Nested objects and arrays of objects work; <code>$ref</code>, <code>oneOf</code> and <code>anyOf</code> do not.</p>
<h3>Three extractors</h3>
<ul>
<li><strong><code>rules</code></strong>: no language model. It collects label/value pairs, tables, numbered form fields, dates, amounts, emails, phone numbers and URLs and matches them to your field names and descriptions, coercing types. Every value is verbatim from the document.</li>
<li><strong><code>byok</code></strong>: Claude fills the schema with the Anthropic API key you supply, on a <code>fast</code>, <code>balanced</code> or <code>best</code> tier. Items record tokens used.</li>
<li><strong><code>hosted</code></strong>: Claude on the Actor's own key. This is what an empty <code>extractor</code> means when the Actor's model key is configured. If the model cannot be reached, the document gets the rules extraction instead, marked <code>rules-fallback</code>.</li>
</ul>
<p>In model modes, document text is sent to the Anthropic API only to produce the extraction. Each mode is priced differently; see the Store page.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Scanned PDFs and photos are read with the built-in OCR (21 bundled languages, up to three per run) when you set <code>ocr: true</code> with <code>extractor: "rules"</code>. OCR does not run in the model modes; for model extraction of a scan, convert it first with the <a href="../pdf-to-markdown-rag/">PDF to Markdown Actor</a> with OCR on, save the Markdown to a key-value store, and pass the <code>kvs://</code> reference. With OCR off, a scan returns a <code>NO_TEXT</code> error item.</li>
<li>Schemas can be up to 6 levels deep and 200 fields. Model modes cut documents at <code>maxInputTokens</code> (at most 40,000, about 60 pages) and cap output at 4,000 tokens per document, so very long line-item tables may be cut.</li>
<li>The rules extractor's date and amount parsing is tuned to English-language business documents.</li>
<li>URLs that resolve to private or local network addresses are rejected.</li>
</ul>`,
    fields: [
      ['data', 'The filled object, in the shape of your schema; fields not found are null'],
      ['confidence, overallConfidence', 'A score per field and for the whole document'],
      ['filledFields, totalFields, missingFields', 'What was and was not found'],
      ['extractionMethod, extractionNotes', '<code>rules</code>, <code>byok</code>, <code>hosted</code> or <code>rules-fallback</code>, and where each value came from'],
      ['lowConfidenceFields', 'Model modes: fields the model was unsure about'],
      ['url, filename, mimeType, pages, title, author', 'The source document'],
      ['textPreview, markdown', 'A 1,000-character preview; the full text with <code>includeMarkdown</code>'],
      ['needsOcrPages, warnings', 'Pages without text and conversion notes'],
    ],
    example: {
      caption: 'IRS Form W-9 extracted with the rules extractor and the quick-start schema (from the Actor\'s README; shortened):',
      json: {
        recordType: 'document',
        url: 'https://www.irs.gov/pub/irs-pdf/fw9.pdf',
        filename: 'fw9.pdf',
        pages: 6,
        extractionMethod: 'rules',
        data: {
          title: 'Form W-9 (Rev. March 2024)',
          formNumber: 'W-9',
          revisionDate: '2024-03',
          issuer: 'Department of the Treasury',
          fields: [
            { label: 'Name of entity/individual', description: 'An entry is required. …' },
            { label: 'Business name/disregarded entity name, if different from above', description: null },
            { label: 'City, state, and ZIP code', description: null },
          ],
        },
        confidence: { title: 0.8, formNumber: 0.6, revisionDate: 0.6, issuer: 0.4, fields: 0.5 },
        overallConfidence: 0.58,
        filledFields: 5,
        totalFields: 5,
        missingFields: [],
        fetchedAt: '2026-10-17T10:22:02.464Z',
      },
    },
    useCases: [
      ['Invoices to line items', 'Describe vendor, invoice number, dates, totals and a <code>lineItems</code> array once, then send every invoice through the same schema. Field descriptions guide both the rules matcher and the model.'],
      ['Batch form fields', 'Run several government forms through one schema to get each form\'s number, revision date, issuer and numbered fields as JSON.'],
      ['Supplier quotes and specifications', 'The Actor\'s task examples turn a supplier quote into line items and a roofing specification PDF into a takeoff of the roof system and materials.'],
    ],
    input: {
      urls: ['https://www.irs.gov/pub/irs-pdf/fw9.pdf', 'https://www.irs.gov/pub/irs-pdf/fw4.pdf'],
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the form' },
          formNumber: { type: 'string', description: 'The form number, e.g. W-9 or 1040' },
          revisionDate: { type: 'string', format: 'date', description: 'Revision date of the form' },
          issuer: { type: 'string', description: 'Agency or organization that issues the form' },
        },
      },
      extractor: 'rules',
      includeMarkdown: false,
    },
    inputCaption: 'Two IRS form PDFs through one small schema with the rules extractor (no model):',
    prompt: 'Extract the invoice number, invoice date, vendor, total and line items from these three PDF invoices as JSON.',
    faq: [
      ['Which extractor should I use?', 'Use <code>rules</code> for well-labeled documents with a known layout, bulk first passes, and data that must not go to a model. Use a model mode for fields that need reading comprehension or long, messy documents.'],
      ['How do I write the schema?', 'As ordinary JSON Schema. Descriptions matter in every mode: the rules extractor matches them against labels, and the model reads them as instructions. Use <code>format: "date"</code> for ISO dates and <code>enum</code> for fixed choices.'],
      ['Is my Anthropic key safe in <code>byok</code> mode?', 'It is stored as an encrypted secret input, sent only to api.anthropic.com, and never logged or written to the dataset.'],
      ['What happens if the model fails?', 'The document gets the rules extraction, marked <code>rules-fallback</code> with the reason, so a run does not fail because of the model.'],
      ['Does it work on scanned documents?', 'Yes, in rules mode: set <code>ocr: true</code> with <code>extractor: "rules"</code> and scanned pages and photos are read with the built-in OCR. For a model mode, run them through the PDF to Markdown Actor with OCR first, then pass the saved Markdown by <code>kvs://</code> reference.'],
    ],
    related: ['pdf-to-markdown-rag', 'grants-gov-api'],
  },

  {
    slug: 'podcast-summarizer',
    actor: 'podcast-summarizer',
    title: 'Podcast Summarizer: Chapters and Quotes from Transcripts',
    nav: 'Podcast summarizer',
    description:
      'Summarize podcast episodes from RSS feeds or Apple Podcasts links: abstract, key topics, timestamped chapters, quotes, guests and action items from published transcripts.',
    lede:
      'Many podcasts now publish a transcript file with each episode. This Actor reads it, falls back to the show notes when there is none, and writes a structured summary per episode: an abstract, key topics, chapters with timestamps, notable quotes, named guests and action items.',
    source: `
<p>Input is a list of <strong>RSS or Atom feed URLs</strong>, <strong>Apple Podcasts show links</strong> or IDs, or <code>search:&lt;show name&gt;</code> terms. Apple links and searches are resolved through Apple's public iTunes Lookup and Search API, which needs no key.</p>
<p>For each episode the Actor downloads the <strong>Podcasting 2.0</strong> <code>&lt;podcast:transcript&gt;</code> file the feed links (text, WebVTT, SRT, JSON or HTML, up to 2 MB). It does not download or transcribe audio. When an episode has no transcript, the show notes are summarized instead and <code>transcriptSource</code> says <code>description</code>; chapters and quote timestamps are then empty.</p>
<h3>Three summarizers</h3>
<ul>
<li><strong><code>extractive</code></strong>: no language model. A deterministic summary that picks sentences and keywords from the text itself, so topics, chapters and quotes are verbatim.</li>
<li><strong><code>byok</code></strong>: Claude writes the summary with the Anthropic API key you supply, on a <code>fast</code>, <code>balanced</code> or <code>best</code> tier.</li>
<li><strong><code>hosted</code></strong>: Claude on the Actor's own key. This is what an empty <code>summarizer</code> means when the Actor's model key is configured. If the model fails, the episode gets the extractive summary, marked <code>extractive-fallback</code>.</li>
</ul>
<p>Each mode is priced differently; see the Store page.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Named guests come from <code>&lt;podcast:person role="guest"&gt;</code> tags and speaker labels; the show's author and the first voice of an episode are treated as hosts.</li>
<li>The extractive summarizer makes chapters only for texts of 300 words or more, about one per 800 words, up to 8.</li>
<li>Model modes cut transcripts at <code>maxInputTokens</code> (at most 40,000 tokens, about three hours of speech) and say so on the item.</li>
<li>Apple lookups are limited to about 20 requests per minute.</li>
</ul>`,
    fields: [
      ['showTitle, title, pubDate, durationSeconds', 'The episode'],
      ['audioUrl, link, episodeGuid', 'Where the episode lives'],
      ['transcriptSource, transcriptUrl, transcriptFormat, transcriptWords', '<code>transcript</code> or <code>description</code>, and the transcript used'],
      ['summary.abstract', 'A short abstract of the episode'],
      ['summary.keyTopics', 'Key topics'],
      ['summary.chapters', 'Chapters with titles, summaries and start times where the transcript has them'],
      ['summary.notableQuotes', 'Quotes with speaker and timestamp'],
      ['summary.namedGuests, summary.actionItems', 'Guests and action items mentioned'],
      ['summaryMethod, modelTier', '<code>extractive</code>, <code>byok</code>, <code>hosted</code> or <code>extractive-fallback</code>'],
    ],
    example: {
      caption: 'One Podnews Daily episode summarized in extractive mode (from the Actor\'s README; shortened):',
      json: {
        recordType: 'episode',
        feedUrl: 'https://podnews.net/rss',
        showTitle: 'Podnews Daily - podcast industry and podcasting news',
        title: 'PAVE Studios shows head to Disney+ and Hulu',
        pubDate: '2026-10-16T10:09:41.000Z',
        durationSeconds: 291,
        transcriptSource: 'transcript',
        transcriptFormat: 'vtt',
        transcriptWords: 724,
        summaryMethod: 'extractive',
        summary: {
          abstract: 'Meanwhile, in Australia, podcast publisher Mammamia is to make it to Samsung TV Plus as a streaming TV channel. …',
          keyTopics: ['adam curry', 'youtube short', 'samsung tv', 'tv plus', 'pave studios'],
          chapters: [{ title: 'Adam Curry & Youtube Short', summary: 'YouTube leads in almost every territory, with 32% market share globally …', startTime: 0, startTimestamp: '0:00' }],
          notableQuotes: [{ quote: 'Adam Curry is to step back from No Agenda, with the show on October the 29th being his last.', speaker: 'James Cridland', timestamp: '1:29' }],
          namedGuests: ['Adam Curry'],
          actionItems: ['You can find out more with a link in our show notes.'],
        },
        fetchedAt: '2026-10-16T15:33:45.237Z',
      },
    },
    useCases: [
      ['Show notes and newsletters', 'Get chapters, quotes and an abstract for each new episode of the shows you cover, ready to edit into notes or a newsletter.'],
      ['Media monitoring', 'Search summaries and quotes for a brand or topic to see what was said, by whom and at what minute.'],
      ['Indexing a back catalog', 'Run the extractive summarizer over many episodes for search indexes. It needs no key and returns topics and quotes verbatim from the transcript.'],
    ],
    input: {
      feeds: ['https://rss.buzzsprout.com/1538779.rss'],
      maxEpisodesPerFeed: 3,
      summarizer: 'extractive',
      maxConcurrency: 3,
    },
    inputCaption: 'Extractive summaries (no model) for the three newest episodes of one feed:',
    prompt: 'Summarize the two latest episodes of The Daily with chapters, notable quotes and the guests mentioned.',
    faq: [
      ['Does it transcribe audio?', 'No. It uses the transcript file the podcast publishes, or the show notes when there is none.'],
      ['Can I pass an Apple Podcasts link or just a show name?', 'Yes. Apple links and IDs are resolved with the iTunes Lookup API, and <code>search:show name</code> takes the top iTunes Search match with a public feed.'],
      ['Which summarizer should I use?', 'Extractive for bulk back catalogs, indexing and monitoring; a model mode when you want written abstracts and chapter titles in prose.'],
      ['Can I summarize specific episodes only?', 'Yes. List episode GUIDs, episode page URLs or audio URLs in <code>episodes</code>. GUIDs from the <a href="../podcast-rss-feed-scraper/">podcast RSS scraper</a> work directly.'],
      ['What if a transcript cannot be downloaded?', 'The show notes are summarized instead, and an episode with neither produces a <code>NO_TEXT</code> error item.'],
    ],
    related: ['podcast-rss-feed-scraper', 'pdf-to-markdown-rag'],
  },

  {
    slug: 'podcast-rss-feed-scraper',
    actor: 'podcast-rss-scraper',
    title: 'Podcast RSS Feed Scraper: Episodes and Transcripts as JSON',
    nav: 'Podcast RSS scraper',
    description:
      'Turn podcast RSS feeds, Apple Podcasts links or show names into show and episode JSON: dates, durations, audio URLs, chapters and Podcasting 2.0 transcripts.',
    lede:
      'Every podcast is published as an RSS feed, but feeds vary in namespaces, duration formats and show-note markup. This Actor parses them into clean show and episode records, finds the feed for an Apple Podcasts link or show name, and can download each episode\'s transcript as text.',
    source: `
<p>The Actor parses the <strong>RSS 2.0</strong>, <strong>iTunes</strong> and <strong>Podcasting 2.0</strong> namespaces with an XML parser; no browser and no proxies. It handles odd feeds: non-standard namespace prefixes, missing GUIDs, durations given as <code>MM:SS</code>, <code>HH:MM:SS</code> or seconds, and HTML show notes.</p>
<p>Apple Podcasts URLs, bare Apple IDs and <code>search:&lt;term&gt;</code> entries are resolved through Apple's public iTunes Lookup and Search API, which needs no key. A show web page with an RSS autodiscovery link also works.</p>
<p>Opt-in discovery and lookup inputs: <code>charts:us</code> or <code>charts:gb/technology</code> reads Apple's top-shows chart for a country (optionally one genre) and scrapes each show's own feed; records carry the chart they came from, never the rank. <code>fyyd:&lt;term&gt;</code> and <code>gpodder:&lt;term&gt;</code> take the top result of a fyyd.de or gpodder.net directory search. Podcast Index GUIDs (<code>pi:&lt;guid&gt;</code>) resolve to the publisher's feed with your own free Podcast Index API key and secret.</p>
<p>With <code>fetchChapters</code>, each episode's Podcasting 2.0 JSON chapters file is downloaded and attached as <code>chapters</code> (start and end time, title, image, link).</p>
<p>With <code>fetchTranscripts</code>, each episode's <code>&lt;podcast:transcript&gt;</code> file is downloaded (plain text first, then WebVTT, SRT, JSON or HTML, up to 2 MB) and returned as <code>transcriptText</code> with timestamps and cue numbers removed and speaker names kept as labels.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Feeds are fetched up to 30 MB each with a 20-second timeout, at about two requests per second per host.</li>
<li>Only transcripts published in the feed are downloaded; audio is never transcribed.</li>
<li>Apple lists some shows without a public feed (Apple-exclusive or subscription shows); those return an <code>APPLE_NO_FEED_URL</code> error item.</li>
<li>Apple lookups are limited to about 20 requests per minute, so many Apple inputs resolve more slowly than feed URLs.</li>
<li><code>ownerEmail</code> is included only when the feed publishes it.</li>
</ul>`,
    fields: [
      ['recordType', '<code>show</code> or <code>episode</code>'],
      ['title, description, author, language, categories, explicit', 'Show metadata'],
      ['episodeCount, lastBuildDate, latestEpisodeAt, podcastGuid, funding', 'Show-level Podcasting 2.0 and feed details'],
      ['episodeGuid, title, pubDate, durationSeconds, season, episode, episodeType', 'Episode metadata'],
      ['audioUrl, audioType, audioBytes, imageUrl, link', 'Media and links'],
      ['transcripts, transcriptUrl, transcriptFormat', 'Transcript links in the feed'],
      ['transcriptText, transcriptWords', 'With <code>fetchTranscripts</code>'],
      ['resolvedVia, searchAlternatives', 'How an Apple link or search term was resolved, and other matches'],
    ],
    example: {
      caption: 'One Podnews Daily episode with its transcript fetched (from the Actor\'s README; shortened):',
      json: {
        recordType: 'episode',
        feedUrl: 'https://podnews.net/rss',
        showTitle: 'Podnews Daily - podcast industry and podcasting news',
        episodeGuid: 'https://podnews.net/update/pave-disney-hulu-clues',
        title: 'PAVE Studios shows head to Disney+ and Hulu',
        pubDate: '2026-10-16T10:09:41.000Z',
        durationSeconds: 291,
        episode: 2450,
        episodeType: 'full',
        explicit: false,
        audioUrl: 'https://op3.dev/e,pg=9b024349-ccf0-5f69-a609-6b82873eab3c/podnews.net/audio/podnews261016.mp3',
        audioType: 'audio/mpeg',
        link: 'https://podnews.net/update/pave-disney-hulu-clues',
        transcriptUrl: 'https://podnews.net/audio/podnews261016.mp3.vtt',
        transcriptFormat: 'vtt',
        transcriptText: 'James Cridland: From our free daily newsletter, the latest from podnews.net with Soundstack. …',
        transcriptWords: 730,
        fetchedAt: '2026-10-16T13:13:06.512Z',
      },
    },
    useCases: [
      ['New-episode alerts', 'Turn on <code>onlyNewSinceLastRun</code> and schedule the Actor. The first run is a baseline; later runs return only episodes with GUIDs not seen before and POST them to your webhook.'],
      ['Transcript text for search or LLM analysis', 'Turn on <code>fetchTranscripts</code> to get plain transcript text with speaker labels for shows that publish transcripts.'],
      ['Find a feed from a show name', 'Pass <code>search:Hard Fork</code> or an Apple Podcasts link; the show record records how it was resolved and lists other matches.'],
    ],
    input: {
      feeds: ['https://podnews.net/rss'],
      maxEpisodesPerFeed: 5,
      includeShowRecord: true,
      fetchTranscripts: true,
      onlyNewSinceLastRun: false,
      maxConcurrency: 5,
    },
    inputCaption: 'The five newest episodes of one feed, with transcript text:',
    prompt: 'Get the last 20 episodes of Planet Money from Apple Podcasts with their publish dates, durations and audio URLs.',
    faq: [
      ['Does it need an API key?', 'No. Feeds, transcript files and the iTunes API are public endpoints.'],
      ['Which transcript formats are supported?', 'Plain text, WebVTT, SRT, Podcasting 2.0 JSON and HTML. Timestamps, cue numbers and styling are removed; speaker names are kept.'],
      ['How does monitoring work?', 'The Actor stores each feed\'s seen episode GUIDs (up to 5,000) in the key-value store named by <code>stateStoreName</code> and returns only unseen ones on later runs.'],
      ['Can it resolve Podcast Index GUIDs?', 'No. That needs a Podcast Index API key, so those inputs return <code>GUID_RESOLUTION_UNAVAILABLE</code>.'],
      ['I want summaries, not raw transcripts.', 'The <a href="../podcast-summarizer/">podcast summarizer</a> takes the same inputs and writes an abstract, chapters and quotes per episode.'],
    ],
    related: ['podcast-summarizer', 'bluesky-monitor'],
  },

  {
    slug: 'bluesky-monitor',
    actor: 'bluesky-monitor',
    title: 'Bluesky Monitor: Posts, Hashtags and Followers as JSON',
    nav: 'Bluesky monitor',
    description:
      'Search Bluesky posts by keyword or hashtag and read profiles, author feeds, follower lists, threads, quotes and lists from the public AT Protocol API as flat JSON, with a new-since-last-run mode.',
    lede:
      'Bluesky runs on the open AT Protocol, and its public API answers without a login. This Actor reads it in six main modes (post search, profiles, author feeds, followers, following and account search), plus opt-in modes for a post\'s thread, quotes, likes and reposts and for custom feeds, lists and starter packs, and writes every result as a flat record, so you can follow keywords, hashtags or accounts on a schedule.',
    source: `
<p>The data comes from Bluesky's <strong>public, unauthenticated AT Protocol API</strong>: the <code>public.api.bsky.app</code> AppView, with its origin <code>api.bsky.app</code> as a fallback for post search. These are the same public endpoints the Bluesky app uses. No login, API key, proxies or browser.</p>
<table>
<thead><tr><th>Mode</th><th>Queries are</th><th>Returns</th></tr></thead>
<tbody>
<tr><td><code>searchPosts</code></td><td>Keywords, hashtags, phrases and search operators</td><td>Matching posts</td></tr>
<tr><td><code>authorFeed</code></td><td>Handles, DIDs or profile URLs</td><td>The accounts' posts</td></tr>
<tr><td><code>profiles</code></td><td>Handles, DIDs or profile URLs</td><td>Profiles with follower, following and post counts</td></tr>
<tr><td><code>followers</code>, <code>following</code></td><td>Handles, DIDs or profile URLs</td><td>Follower or following lists</td></tr>
<tr><td><code>searchActors</code></td><td>Search terms</td><td>Matching accounts</td></tr>
<tr><td><code>postThread</code>, <code>quotes</code> (opt-in)</td><td>Post URLs</td><td>Every reply in the post's thread, or the posts quoting it</td></tr>
<tr><td><code>likedBy</code>, <code>repostedBy</code> (opt-in)</td><td>Post URLs</td><td>The accounts that liked or reposted the post</td></tr>
<tr><td><code>customFeed</code>, <code>listFeed</code> (opt-in)</td><td>Custom feed or list URLs</td><td>The feed's posts, or posts by the list's members</td></tr>
<tr><td><code>listMembers</code>, <code>starterPack</code> (opt-in)</td><td>List or starter pack URLs</td><td>Member profiles with counts</td></tr>
</tbody>
</table>
<h3>Limits worth knowing</h3>
<ul>
<li><strong>Post search returns at most 100 posts per query per run.</strong> From datacenter networks the public host refuses post search, and the origin host serves only the first page of results without a login. Use <code>since</code>, narrower queries, several queries, or the new-since-last-run mode on a schedule to keep up.</li>
<li>Requests are limited to about two per second. One request returns up to 100 posts or followers, so 10,000 followers take about a minute.</li>
<li>Follower records do not include per-follower counts; run <code>profiles</code> on the handles you care about.</li>
<li>Posts and profiles whose authors opted out of logged-out visibility may be missing, as they are on the public web.</li>
</ul>`,
    fields: [
      ['type, query', '<code>post</code>, <code>profile</code>, <code>follower</code> or <code>following</code>, and the query that found it'],
      ['text, createdAt, langs', 'Post content and time'],
      ['likeCount, repostCount, replyCount, quoteCount', 'Engagement counts'],
      ['authorHandle, authorDisplayName, authorDid', 'Post author'],
      ['hasImages, hasVideo, embedUrls, externalUrl', 'Media and links'],
      ['isReply, isRepost, quotedPostUrl', 'Thread context'],
      ['postUrl, uri', 'Link to the post on bsky.app and its AT URI'],
      ['handle, displayName, description, followersCount, followsCount, postsCount', 'On profile records'],
      ['subjectHandle', 'On follower records: the account you asked about'],
    ],
    example: {
      caption: 'One post record from <code>searchPosts</code> (from the Actor\'s README; shortened):',
      json: {
        type: 'post',
        query: 'apify',
        uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3l6oveex3ii2l',
        authorHandle: 'bsky.app',
        authorDisplayName: 'Bluesky',
        text: 'We shipped a new Apify integration today! Try the open API: https://docs.bsky.app',
        createdAt: '2026-10-15T18:02:11.482Z',
        likeCount: 310,
        repostCount: 40,
        replyCount: 12,
        quoteCount: 5,
        langs: ['en'],
        hasImages: true,
        hasVideo: false,
        isReply: false,
        isRepost: false,
        postUrl: 'https://bsky.app/profile/bsky.app/post/3l6oveex3ii2l',
        fetchedAt: '2026-10-16T12:40:32.064Z',
      },
    },
    useCases: [
      ['Brand and keyword mentions', 'Run <code>searchPosts</code> with <code>sort: "latest"</code> and <code>onlyNewSinceLastRun</code> on a schedule, and send each run\'s new posts to a webhook.'],
      ['Follower growth', 'Run <code>followers</code> with the new-since-last-run mode to get only new followers of an account on each run.'],
      ['Account research', 'Run <code>profiles</code> on a list of handles for follower, following and post counts in one table.'],
    ],
    input: {
      mode: 'searchPosts',
      queries: ['apify'],
      maxResults: 50,
      sort: 'latest',
      onlyNewSinceLastRun: true,
      stateStoreName: 'bluesky-keyword-brand-mention-monitor',
    },
    inputCaption: 'New Bluesky posts mentioning a keyword since the last run, newest first:',
    prompt: 'Find the latest Bluesky posts with the hashtag #opensource and list the authors, text and like counts.',
    faq: [
      ['Does it need a Bluesky login or API key?', 'No. It uses Bluesky\'s public, unauthenticated API endpoints.'],
      ['Can I search hashtags or exact phrases?', 'Yes. <code>#opensource</code>, <code>"exact phrase"</code> and operators such as <code>from:handle</code>, <code>lang:en</code> or <code>domain:example.com</code> are passed to Bluesky\'s search.'],
      ['How does new-since-last-run work?', 'Per mode and query, the Actor stores the keys of records it already emitted (the most recent 10,000) and stops paging when it reaches known records. Profiles are re-emitted only when something changed, listed in <code>changedFields</code>.'],
      ['Why do I get at most 100 posts for a search?', 'Post search from datacenter networks returns only the first page of results without a login. Split broad topics into several queries or narrow them with <code>since</code>.'],
      ['What happens with a bad handle?', 'It produces an error item such as <code>PROFILE_NOT_FOUND</code> and the rest of the run continues.'],
    ],
    related: ['podcast-rss-feed-scraper', 'sitemap-change-monitor'],
  },

  {
    slug: 'job-board-api-hiring-signals',
    actor: 'job-postings-api',
    title: 'Greenhouse, Lever and Ashby Jobs API and Hiring Signals',
    nav: 'Job board API & hiring signals',
    description:
      'Get open jobs from Greenhouse, Lever, Ashby, SmartRecruiters and Workable boards as normalized JSON, or new, removed and changed roles per company between runs.',
    lede:
      'Most company career pages are built on one of a few applicant tracking systems, and each has a public job-board API. This Actor reads Greenhouse, Lever, Ashby, SmartRecruiters and Workable boards, normalizes every open role, and in signals mode reports what changed at each company since the last run.',
    source: `
<p>Only the providers' <strong>public, unauthenticated job-board APIs</strong> are used: <code>boards-api.greenhouse.io</code>, <code>api.lever.co</code> (and <code>api.eu.lever.co</code>), <code>api.ashbyhq.com/posting-api</code>, <code>api.smartrecruiters.com/v1/companies</code> and <code>apply.workable.com/api</code>. Private or password-protected boards are not supported.</p>
<p>Boards are given as <code>provider:boardId</code> (<code>greenhouse:stripe</code>), as a public board URL, or as a company's own careers page URL. For a careers page, the Actor fetches it once and looks for a supported board in the final URL or the HTML. Three curated presets (<code>ai-labs</code>, <code>developer-tools</code>, <code>fintech</code>) add 50 to 59 boards each.</p>
<p>In <strong>signals</strong> mode each board is compared with the snapshot from the previous run, producing <code>new-role</code>, <code>removed-role</code>, <code>title-changed</code> and <code>location-changed</code> events plus one <code>board-summary</code> per company with open roles, net change, top departments and locations, remote share and a 0 to 100 hiring velocity score.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Requests to each provider are limited to about two per second. Descriptions on SmartRecruiters and Workable need one extra request per job.</li>
<li>Workable's API sits behind a firewall. When both of its endpoints refuse, the board returns a <code>WORKABLE_BLOCKED</code> error item; no residential proxies are used.</li>
<li><code>city</code> and <code>country</code> are best-effort parses of free-text locations. Salary data appears only where the provider exposes it (Ashby and Lever) and the company publishes it.</li>
<li>Careers pages that render their job list only in the browser, with no link to the job board in the HTML, return <code>ATS_NOT_DETECTED</code>.</li>
<li>Only currently listed jobs are returned. Boards over <code>maxJobsPerBoard</code> are marked truncated and removals are not reported for them.</li>
</ul>`,
    fields: [
      ['type', '<code>job</code>, a signal type, <code>board-summary</code> or <code>error</code>'],
      ['provider, boardId, companyName, jobId', 'Which board and job'],
      ['title, department, team', 'The role'],
      ['location, city, country, remote', 'Raw location, best-effort city and country, and a remote flag'],
      ['employmentType, postedAt, updatedAt', 'Where the provider exposes them'],
      ['applyUrl, jobUrl', 'Links to the posting'],
      ['descriptionText, compensation', 'With <code>includeDescription</code>; compensation on Ashby and Lever where published'],
      ['openRoles, netChange, topDepartments, remoteShare, hiringVelocityScore', 'On <code>board-summary</code> records in signals mode'],
    ],
    example: {
      caption: 'A <code>board-summary</code> record from a signals run (from the Actor\'s README):',
      json: {
        type: 'board-summary',
        provider: 'lever',
        boardId: 'spotify',
        baseline: false,
        openRoles: 312,
        previousOpenRoles: 298,
        newSinceLastRun: 21,
        removedSinceLastRun: 7,
        changedSinceLastRun: 3,
        netChange: 14,
        topDepartments: [{ name: 'Engineering', count: 140 }, { name: 'Sales', count: 45 }],
        topLocations: [{ name: 'Stockholm, Sweden', count: 120 }, { name: 'New York, NY', count: 80 }],
        remoteShare: 0.18,
        hiringVelocityScore: 58,
        truncated: false,
        previousSnapshotAt: '2026-10-09T12:00:00.000Z',
        detectedAt: '2026-10-16T12:00:00.000Z',
      },
    },
    useCases: [
      ['Weekly hiring signals for target accounts', 'Run signals mode weekly on a list of company boards to see which companies are adding roles, removing them or shifting focus, with a velocity score per company.'],
      ['Job export across providers', 'Pull open roles from Greenhouse, Lever and Ashby boards in one run, all in the same record shape.'],
      ['Start from a careers page', 'Paste a company\'s careers URL instead of hunting for its board id; the Actor detects the board behind it.'],
    ],
    input: {
      boards: ['greenhouse:stripe'],
      mode: 'signals',
      includeDescription: false,
      maxJobsPerBoard: 80,
      stateStoreName: 'hiring-signals-stripe-weekly',
      maxConcurrency: 5,
    },
    inputCaption: 'Signals mode on one Greenhouse board (the first run stores a baseline):',
    prompt: 'Which roles did Stripe add or remove on its Greenhouse job board since last week?',
    faq: [
      ['Does it need an API key or proxies?', 'No. Greenhouse, Lever, Ashby and SmartRecruiters publish job-board APIs that need no credentials. Workable sometimes blocks datacenter traffic.'],
      ['How do I find a company\'s board id?', 'Open a job on the company\'s careers page and paste its URL (for example <code>boards.greenhouse.io/&lt;token&gt;</code> or <code>jobs.lever.co/&lt;company&gt;</code>), or paste the careers page itself.'],
      ['What happens on the first signals run?', 'There is no snapshot yet, so every current job is written as a <code>job</code> record with a baseline summary. Change events start with the second run.'],
      ['Why are some fields null?', 'Providers expose different fields: some Greenhouse boards have no posted date, Lever has no update date, SmartRecruiters departments are optional. The Actor does not guess them.'],
      ['Does it read LinkedIn or job aggregators?', 'No. Only the five providers\' public job-board APIs and, when you give one, the company\'s own careers page.'],
    ],
    related: ['spf-dmarc-dkim-checker', 'bluesky-monitor'],
  },

  // ---------------------------------------------------------------------------------------------
  // No-code recipes (kind: 'integration'). They use Apify's own official apps on Zapier, Make and
  // n8n; the module names follow docs.apify.com/platform/integrations/{zapier,make,n8n} as read on
  // 2026-11-08. Each recipe runs a saved Apify task in monitor mode so the platform only ever sees
  // records that are new since the last run.
  // ---------------------------------------------------------------------------------------------

  {
    slug: 'pacer-docket-alerts-slack-zapier',
    kind: 'integration',
    platform: 'Zapier',
    actor: 'pacer-docket-monitor',
    title: 'Get New PACER Docket Entries in Slack with Zapier',
    nav: 'PACER filings to Slack (Zapier)',
    description:
      'Post new federal court filings that name your company or clients to a Slack channel: a scheduled Apify task reads the public PACER RSS feeds and Zapier\'s Apify app sends each new entry to Slack.',
    lede:
      'The PACER Docket Monitor reads the free public RSS feeds of federal courts and, in monitor mode, returns only docket entries it has not returned before. Save it as an Apify task, schedule it hourly, and a Zap built on Apify\'s official Zapier app posts each new entry to Slack with the case title, the docket text and a link to the docket. No PACER account and no code.',
    what: `
<p>An Apify schedule runs a saved task every hour. The task watches the Southern and Eastern Districts of New York for new complaints whose case title contains a name you choose. When a run finishes, the Zap's Apify trigger fires, the Zap fetches that run's dataset, and Slack gets one message per new docket entry.</p>
<p>Swap the filters and the same Zap covers other alerts: Chapter 11 petitions in Delaware (<code>bankruptcyChapters</code>), every new motion and order in a case you follow (<code>caseNumbers</code>), or patent complaints in Texas. The <a href="../pacer-rss-docket-monitor/">PACER RSS docket monitor guide</a> lists every filter.</p>`,
    before: [
      'An Apify account. The Actor is billed per result to that account; the Store page lists the current prices. To cap what one run can cost, set a maximum total charge in the task\'s run options.',
      'A Zapier account with Slack connected. The Zap has more than two steps, so check that your Zapier plan allows multi-step Zaps.',
      'The court codes to watch. <a href="../pacer-rss-feeds-by-court/">PACER RSS feeds by court</a> lists all 203 courts and whether each feed was live at the last probe.',
    ],
    inputHeading: 'Step 1: Save the input as an Apify task',
    inputIntro:
      'Open the Actor in Apify Console from its Store page. On the <strong>Input</strong> tab, switch to the JSON editor, paste this input, replace <code>Acme</code> with the names you watch, and click <strong>Save as a new task</strong>:',
    input: {
      courts: ['nysd', 'nyed'],
      partyKeywords: ['Acme'],
      entryTypes: ['complaint'],
      newCasesOnly: true,
      maxResults: 200,
      onlyNewSinceLastRun: true,
      stateStoreName: 'zapier-slack-ny-complaints',
    },
    inputAfter: `
<p><code>onlyNewSinceLastRun</code> with a <code>stateStoreName</code> of its own makes every run return only entries that earlier runs of this task have not returned, so Slack never gets the same filing twice. On the first run nothing has been seen yet, so it returns every matching entry in the current feeds (the trailing 24 hours). Run the task once from Console now, so Zapier has a finished run to test with.</p>
<p>Then open <strong>Schedules</strong> in Console, create a schedule that runs hourly, and add the task to it. Courts regenerate their feeds every 30 to 60 minutes and each feed covers only the last 24 hours, so hourly catches every entry; daily is the minimum.</p>`,
    stepsHeading: 'Step 2: Build the Zap',
    steps: [
      ['Trigger: Apify, Finished task run', 'Create a Zap and choose <strong>Apify</strong> as the trigger app with the <strong>Finished task run</strong> event. Connect your Apify account (Zapier opens an Apify sign-in window; click <strong>Allow Access</strong>), pick the task you saved, and click <strong>Test Trigger</strong>. Zapier fills the test from the run you just made.'],
      ['Search: Apify, Fetch dataset items', 'Add an <strong>Apify</strong> step with the <strong>Fetch dataset items</strong> search and map the dataset ID to the default dataset of the run from the trigger step. Test the step: it returns the docket entries of that run.'],
      ['Loop over the items', 'Add <strong>Looping by Zapier</strong> and loop over the fetched items, so each docket entry runs through the next steps on its own. Map <code>caseTitle</code>, <code>courtName</code>, <code>entryText</code>, <code>docketUrl</code> and <code>error</code> into the loop.'],
      ['Filter out error items', 'Inside the loop, add <strong>Filter by Zapier</strong>: continue only if <code>error</code> does not exist. A court whose feed is down produces one item with an <code>error</code> code instead of failing the run, and you probably do not want that in the channel.'],
      ['Action: Slack, Send Channel Message', `<p>Add <strong>Slack</strong> with <strong>Send Channel Message</strong>, pick the channel, and build the text from the mapped fields (insert each one with Zapier's field picker; the braces below stand for those fields), for example:</p>
${'<pre tabindex="0" aria-label="Slack message template"><code>New filing in {courtName}: {caseTitle}\n{entryText}\nDocket: {docketUrl}</code></pre>'}
<p>Test the step, then publish the Zap. From now on, the new entries of each scheduled run are posted to Slack.</p>`],
    ],
    fieldsIntro: 'Each dataset item is one docket entry. These fields make a useful Slack message:',
    mapping: [
      ['caseTitle', 'The lead parties, for example <q>Acme Corp v. Example LLC</q>'],
      ['courtName, court', 'Court name and CM/ECF code'],
      ['caseNumber', 'Case number as the court publishes it'],
      ['entryText, entryCategory', 'Docket text and a heuristic category (complaint, motion, order …)'],
      ['docketUrl, documentUrl', 'Links to the docket and the document on PACER (opening them is subject to PACER fees)'],
      ['filedAt', 'Filing time, ISO 8601'],
      ['error', 'Present only on error items; use it to filter them out'],
    ],
    limits: [
      'Apify bills the Actor per feed checked and per matching entry, at the prices on its Store page. An hourly schedule on two courts is 48 feed checks a day plus the entries that match.',
      'Zapier counts the steps a Zap runs against your Zapier plan\'s task allowance; with a loop, each entry adds its own filter and Slack steps.',
      'The trigger fires when a run finishes. A schedule that runs hourly therefore posts at most once an hour per batch of entries.',
      'Feeds cover only the trailing 24 hours and carry the lead parties, not every party. The <a href="../pacer-rss-docket-monitor/">docket monitor guide</a> covers the other source limits.',
      'Case titles name individuals. Not a consumer report. Not for employment, credit, insurance, housing or tenant-screening decisions.',
    ],
    faq: [
      ['Why a task and a trigger, and not the Run Actor action?', 'Zapier\'s Apify app can also start a run with <strong>Run Actor</strong>, but Apify\'s Zapier documentation gives synchronous runs a hard 30-second timeout. Feed checks across several courts can take longer, so the scheduled task with the <strong>Finished task run</strong> trigger is the dependable pattern.'],
      ['Can I skip Zapier entirely?', 'For a plain "a run finished" notice, yes: the task\'s <strong>Integrations</strong> tab in Apify Console has a Slack integration. To post the entries themselves without Zapier, set the Actor\'s <code>webhookUrl</code> to an endpoint you control; the POST body carries the run summary and up to 1,000 emitted entries.'],
      ['Do I need a PACER account?', 'No. The RSS feeds are public. Only opening a linked document on PACER is subject to PACER\'s own fees.'],
      ['How do I watch other courts or a single case?', 'Edit the task input: change <code>courts</code>, or replace <code>partyKeywords</code> with <code>caseNumbers</code>. Keep a separate <code>stateStoreName</code> for each task so their memories of seen entries stay apart.'],
      ['Is this affiliated with Zapier or Apify?', 'No. owlabee is an independent developer on Apify Store; the Zapier app used here is Apify\'s own. Not affiliated with or endorsed by Zapier, Slack, Apify or the federal courts.'],
    ],
    related: ['pacer-rss-docket-monitor', 'bankruptcy-filings-monitor', 'grants-gov-to-google-sheets-zapier', 'website-changes-slack-n8n'],
  },

  {
    slug: 'grants-gov-to-google-sheets-zapier',
    kind: 'integration',
    platform: 'Zapier',
    actor: 'grants-gov-api',
    title: 'New Grants.gov Opportunities to Google Sheets with Zapier',
    nav: 'Grants.gov to Google Sheets (Zapier)',
    description:
      'Add every new Grants.gov opportunity that matches your keywords to a Google Sheet, with agency, dates and link: a scheduled Apify task searches the official Grants.gov API and Zapier writes the rows.',
    lede:
      'The Grants.gov API & SAM.gov Scraper searches the official Grants.gov API by keyword and, in monitor mode, returns only opportunities that are new or updated since its last run. Save it as an Apify task, schedule it daily, and a Zap built on Apify\'s official Zapier app adds one Google Sheets row per opportunity: a running pipeline sheet with no copy and paste.',
    what: `
<p>A daily Apify schedule runs a saved task that searches Grants.gov for posted and forecasted opportunities about rural broadband and digital equity. When the run finishes, the Zap fetches its dataset and appends one row per opportunity to your sheet: number, title, agency, status, posted and close dates, award ceiling and the Grants.gov link.</p>
<p>Add <code>"samGov"</code> to <code>sources</code> (with your own free SAM.gov API key) to also get federal contract notices in the same sheet; see the <a href="../sam-gov-contract-opportunities/">SAM.gov guide</a>.</p>`,
    before: [
      'An Apify account. The Actor is billed per result to that account; the Store page lists the current prices. Set a maximum total charge in the task\'s run options to cap a run.',
      'A Zapier account with Google Sheets connected. The Zap has more than two steps, so check that your Zapier plan allows multi-step Zaps.',
      'A Google Sheet with a header row, for example: <code>number</code>, <code>title</code>, <code>agency</code>, <code>status</code>, <code>postedDate</code>, <code>closeDate</code>, <code>awardCeiling</code>, <code>url</code>, <code>isUpdated</code>.',
    ],
    inputHeading: 'Step 1: Save the input as an Apify task',
    inputIntro:
      'Open the Actor in Apify Console from its Store page. On the <strong>Input</strong> tab, switch to the JSON editor, paste this input, change the keywords to your own, and click <strong>Save as a new task</strong>:',
    input: {
      keywords: ['rural broadband', 'digital equity'],
      sources: ['grantsGov'],
      oppStatuses: ['posted', 'forecasted'],
      postedWithinDays: 30,
      maxResults: 200,
      fetchDetails: true,
      maxDetails: 100,
      onlyNewSinceLastRun: true,
      stateStoreName: 'zapier-sheets-broadband-grants',
    },
    inputAfter: `
<p>In monitor mode each run returns only opportunities that are new (<code>isNew: true</code>) or changed (<code>isUpdated: true</code>) since the last run of this task. The first run has nothing to compare with, so it returns everything posted in the last 30 days: a good way to fill the sheet once. <code>fetchDetails</code> adds the award ceiling, eligibility and the agency contact for up to <code>maxDetails</code> records. Run the task once from Console now, so Zapier has a finished run to test with.</p>
<p>Then open <strong>Schedules</strong> in Console, create a daily schedule, and add the task to it.</p>`,
    stepsHeading: 'Step 2: Build the Zap',
    steps: [
      ['Trigger: Apify, Finished task run', 'Create a Zap with <strong>Apify</strong> as the trigger app and the <strong>Finished task run</strong> event. Connect your Apify account (click <strong>Allow Access</strong> in the window that opens), pick the task, and click <strong>Test Trigger</strong>.'],
      ['Search: Apify, Fetch dataset items', 'Add an <strong>Apify</strong> step with the <strong>Fetch dataset items</strong> search, map the dataset ID to the default dataset of the run from the trigger, and test it.'],
      ['Loop over the items', 'Add <strong>Looping by Zapier</strong> and loop over the fetched items, mapping the fields you want in the sheet plus <code>error</code>.'],
      ['Filter out error items', 'Add <strong>Filter by Zapier</strong>: continue only if <code>error</code> does not exist. A source that is down produces one coded error item instead of failing the run.'],
      ['Action: Google Sheets, Create Spreadsheet Row', 'Add <strong>Google Sheets</strong> with <strong>Create Spreadsheet Row</strong>, pick the spreadsheet and worksheet, and map each column to a field from the loop. Test, then publish the Zap.'],
    ],
    fieldsIntro: 'Each dataset item is one opportunity (<code>recordType: "opportunity"</code>). Useful columns:',
    mapping: [
      ['number, title', 'Opportunity number and title'],
      ['agency, agencyCode', 'Posting agency'],
      ['status, docType', 'forecasted, posted, closed or archived; synopsis or forecast'],
      ['postedDate, closeDate', 'Key dates, YYYY-MM-DD'],
      ['awardCeiling, awardFloor, estimatedTotalFunding', 'With <code>fetchDetails</code>; null when the agency did not set them'],
      ['url', 'The Grants.gov listing'],
      ['isNew, isUpdated', 'Whether the row is a new opportunity or a change to one already in your sheet'],
    ],
    limits: [
      'Apify bills the Actor per opportunity and per detail fetched, at the prices on its Store page. In monitor mode you pay only for new and updated records after the first run.',
      'Zapier counts each step a Zap runs against your plan\'s task allowance; with a loop, each opportunity adds its own steps.',
      'An updated opportunity arrives as a new row with <code>isUpdated: true</code>; the Zap does not edit the earlier row. Sort or filter the sheet on <code>number</code> to see an opportunity\'s history.',
      'Grants.gov search matches keywords the way Grants.gov does; check a first run and tighten the keywords if it returns too much.',
    ],
    faq: [
      ['Why not the Run Actor action on a Zapier schedule?', 'Apify\'s Zapier documentation gives synchronous runs a hard 30-second timeout, and a run with details for many records can take longer. The scheduled task with the <strong>Finished task run</strong> trigger has no such limit.'],
      ['Can I export to Google Sheets without Zapier?', 'Apify Console lists a Google Sheets export among the ready-made integrations on a task\'s <strong>Integrations</strong> tab. Zapier is useful when you also want filters, other apps, or one row per record in a sheet you already have.'],
      ['Do I need a Grants.gov key?', 'No. The Grants.gov API needs no key. SAM.gov, if you add it, needs your own free personal key in <code>samApiKey</code>.'],
      ['Can I also rank opportunities by fit?', 'The <a href="https://apify.com/owlabee/grant-matching">Grant Matching & RFP Bid/No-Bid Scorer</a> scores Grants.gov, SAM.gov and USAspending records against a description of your organization. The same Zap pattern works with its output.'],
      ['Is this affiliated with Zapier, Google or Grants.gov?', 'No. owlabee is an independent developer on Apify Store, and the Zapier app used here is Apify\'s own. Not affiliated with or endorsed by Zapier, Google, Apify or any agency named.'],
    ],
    related: ['grants-gov-api', 'sam-gov-contract-opportunities', 'pacer-docket-alerts-slack-zapier', 'building-permits-google-sheets-make'],
  },

  {
    slug: 'building-permits-google-sheets-make',
    kind: 'integration',
    platform: 'Make',
    actor: 'building-permits-scraper',
    title: 'Building Permits to Google Sheets with Make',
    nav: 'Building permits to Sheets (Make)',
    description:
      'Send new roofing, solar or any other building permits from US city open-data portals to a Google Sheet every day with Make (formerly Integromat) and Apify\'s official Make app.',
    lede:
      'The Building Permits Scraper reads 120 open-data datasets from 97 US and Canadian cities, counties and states and, in monitor mode, returns only permits it has not returned before. Save it as an Apify task, schedule it daily, and a three-module Make scenario built on Apify\'s official Make app adds each new permit to a Google Sheet: a lead list for contractors and suppliers that fills itself.',
    what: `
<p>A daily Apify schedule runs a saved task that pulls roofing permits issued in Austin, Seattle and Denver over the last 7 days. When the run finishes, Make's <strong>Watch Task Runs</strong> trigger starts the scenario, <strong>Get Dataset Items</strong> reads the run's permits, and Google Sheets gets one row per new permit with the address, the work description, the declared cost and the contractor where the city publishes one.</p>
<p>Change <code>jurisdictions</code> and <code>permitTypes</code> for your market: <code>solar</code>, <code>pool</code>, <code>hvac</code> or <code>demolition</code> work the same way. The <a href="../building-permits-api/">building permits guide</a> describes the sources, and the Actor's Store page lists all 120 datasets; cities on Accela or EnerGov portals use the <a href="../accela-energov-permits/">Accela and EnerGov scraper</a>, which has the same schema and works with this scenario.</p>`,
    before: [
      'An Apify account. The Actor is billed per result to that account; the Store page lists the current prices. Set a maximum total charge in the task\'s run options to cap a run.',
      'A Make account with a Google connection.',
      'A Google Sheet with a header row, for example: <code>issuedDate</code>, <code>jurisdictionName</code>, <code>permitNumber</code>, <code>permitType</code>, <code>workDescription</code>, <code>address</code>, <code>city</code>, <code>zip</code>, <code>estimatedCost</code>, <code>contractorName</code>, <code>contractorPhone</code>, <code>sourceUrl</code>.',
    ],
    inputHeading: 'Step 1: Save the input as an Apify task',
    inputIntro:
      'Open the Actor in Apify Console from its Store page. On the <strong>Input</strong> tab, switch to the JSON editor, paste this input, set your own jurisdictions and permit words, and click <strong>Save as a new task</strong>:',
    input: {
      jurisdictions: ['austin', 'seattle', 'denver-residential'],
      permitTypes: ['roof', 're-roof'],
      issuedWithinDays: 7,
      maxResultsPerJurisdiction: 500,
      onlyNewSinceLastRun: true,
      stateStoreName: 'make-sheets-roof-permits',
      includeRaw: false,
    },
    inputAfter: `
<p>With <code>onlyNewSinceLastRun</code> each run returns only permits that earlier runs of this task have not returned (flagged <code>isNew: true</code>), so the sheet gets no duplicates. The first run returns everything issued in the window. A 7-day window on a daily schedule also catches portals that publish a few days late. Run the task once from Console now, so Make has a run to map fields from.</p>
<p>Then open <strong>Schedules</strong> in Console, create a daily schedule, and add the task to it.</p>`,
    stepsHeading: 'Step 2: Build the Make scenario',
    steps: [
      ['Trigger: Apify, Watch Task Runs', 'Create a scenario and add the <strong>Apify</strong> app\'s <strong>Watch Task Runs</strong> trigger. Create a connection (OAuth, or paste an API token from Console → Settings → API &amp; Integrations), then pick the task. The trigger registers a webhook in Apify that fires whenever a run of the task finishes.'],
      ['Search: Apify, Get Dataset Items', 'Add <strong>Apify → Get Dataset Items</strong> and map <strong>Dataset ID</strong> to the default dataset ID from the trigger\'s output. If the variables do not show yet, run the scenario once while the task runs, then map them.'],
      ['Filter out error items', 'On the link between Get Dataset Items and the next module, set up a filter: continue only if <code>error</code> does not exist. A portal that is down produces one error item, such as <code>HTTP_503</code>, instead of failing the run.'],
      ['Action: Google Sheets, Add a Row', 'Add <strong>Google Sheets → Add a Row</strong>, pick the spreadsheet and sheet, and map each column to a permit field. Get Dataset Items outputs one bundle per permit, so the module adds one row per permit. (Apify\'s own Make guide uses <strong>Bulk Add Rows</strong> with an aggregator instead, which uses fewer operations on large runs.) Save the scenario and switch it on.'],
    ],
    fieldsIntro: 'Each dataset item is one permit. Fields that make a useful lead row:',
    mapping: [
      ['issuedDate, appliedDate', 'Dates as the portal publishes them'],
      ['jurisdictionName, permitNumber', 'Where the permit was issued and its number'],
      ['permitType, permitSubtype, workDescription', 'What the work is, in the city\'s own words'],
      ['address, city, state, zip', 'The job site'],
      ['estimatedCost', 'Declared job value, or empty where the city publishes none'],
      ['contractorName, contractorLicense, contractorPhone', 'Only where the city publishes them; nothing is inferred'],
      ['sourceUrl', 'Link to the source dataset or row, to check a value'],
    ],
    limits: [
      'Apify bills the Actor per permit, per jurisdiction and per results page, at the prices on its Store page. In monitor mode you pay for new permits only after the first run.',
      'Make counts operations per module run; with one row per permit, a run with 100 new permits uses about 100 Google Sheets operations.',
      'Each city publishes its own columns: some have no cost or contractor columns, and update frequency ranges from daily to every few weeks. The <a href="../building-permits-api/">building permits guide</a> lists the gaps.',
      'If you contact people from the sheet, telemarketing and e-mail laws apply: the TCPA and the National Do Not Call Registry in the US, CASL in Canada.',
      'Not a consumer report. Not for employment, credit, insurance, housing or tenant-screening decisions.',
    ],
    faq: [
      ['Can Make run the Actor itself instead of a task schedule?', 'Yes. Apify\'s <strong>Run an Actor</strong> module with <strong>Run synchronously</strong> set to Yes waits for the run, and Make\'s own scheduler can start the scenario. Apify\'s documentation warns that Make enforces a plan-dependent timeout on synchronous runs and that output is incomplete when a run exceeds it, so for many jurisdictions the task trigger is safer.'],
      ['Why are some contractor columns empty?', 'The city does not publish them. Set <code>includeRaw</code> to <code>true</code> once to see every column a portal does publish.'],
      ['Do I need API keys for the city portals?', 'No. They are public open-data APIs. A free Socrata app token is optional and only raises Socrata\'s rate limits.'],
      ['Is this affiliated with Make or Google?', 'No. owlabee is an independent developer on Apify Store, and the Make app used here is Apify\'s own. Not affiliated with or endorsed by Make, Google, Apify or any city named.'],
    ],
    related: ['building-permits-api', 'accela-energov-permits', 'shopify-price-changes-slack-make', 'grants-gov-to-google-sheets-zapier'],
  },

  {
    slug: 'shopify-price-changes-slack-make',
    kind: 'integration',
    platform: 'Make',
    actor: 'shopify-catalog-monitor',
    title: 'Competitor Shopify Price Changes to Slack with Make',
    nav: 'Shopify price changes to Slack (Make)',
    description:
      'Get a Slack message when a competitor\'s Shopify store changes a price, drops a product or restocks: a daily Apify task compares the public catalog and a Make scenario posts the changes.',
    lede:
      'The Shopify Catalog Monitor reads a store\'s public product catalog and, in changes mode, compares it with the previous run and returns only what changed: prices, availability, new and removed products. Save it as an Apify task, schedule it daily, and a Make scenario built on Apify\'s official Make app posts each price change to Slack with the old and new price.',
    what: `
<p>A daily Apify schedule runs a saved task on one or more competitor stores. The first run stores a baseline of every variant; every later run returns change records. Make's <strong>Watch Task Runs</strong> trigger starts the scenario when a run finishes, <strong>Get Dataset Items</strong> reads the changes, a filter keeps price changes, and Slack gets one message each: product, variant, before and after price, and the percent change.</p>
<p>Keep other <code>changeType</code> values in the filter to also hear about <code>new-product</code>, <code>removed-product</code> or <code>availability-changed</code>. The <a href="../shopify-price-tracker/">Shopify price tracker guide</a> lists every field.</p>`,
    before: [
      'An Apify account. The Actor is billed per result to that account; the Store page lists the current prices. Set a maximum total charge in the task\'s run options to cap a run.',
      'A Make account with a Slack connection.',
      'The competitor stores\' domains. Only public storefronts work: a password-protected or blocked store returns one error item, and the Actor does not work around it.',
    ],
    inputHeading: 'Step 1: Save the input as an Apify task',
    inputIntro:
      'Open the Actor in Apify Console from its Store page. On the <strong>Input</strong> tab, switch to the JSON editor, paste this input with your competitors\' domains, and click <strong>Save as a new task</strong>:',
    input: {
      storeUrls: ['www.allbirds.com', 'www.deathwishcoffee.com'],
      mode: 'changes',
      granularity: 'variant',
      maxProductsPerStore: 2000,
      includeCollections: false,
      stateStoreName: 'make-slack-competitor-prices',
    },
    inputAfter: `
<p>The first <code>changes</code> run writes one <code>baseline</code> record per variant and is billed like a snapshot; the Store page has the rate. From the second run on, the dataset holds only <code>change</code> records, so later runs bill for what changed rather than for the whole catalog. Run the task once from Console now to write the baseline.</p>
<p>Then open <strong>Schedules</strong> in Console, create a daily schedule, and add the task to it.</p>`,
    stepsHeading: 'Step 2: Build the Make scenario',
    steps: [
      ['Trigger: Apify, Watch Task Runs', 'Create a scenario and add <strong>Apify → Watch Task Runs</strong>. Create a connection (OAuth, or an API token from Console → Settings → API &amp; Integrations) and pick the task.'],
      ['Search: Apify, Get Dataset Items', 'Add <strong>Apify → Get Dataset Items</strong> and map <strong>Dataset ID</strong> to the default dataset ID from the trigger.'],
      ['Filter: price changes only', 'On the link to the next module, set up a filter with two conditions: <code>recordType</code> equals <code>change</code>, and <code>changeType</code> equals <code>price-changed</code>. This also drops the baseline records of the first run and any error items.'],
      ['Action: Slack, Create a Message', `<p>Add <strong>Slack → Create a Message</strong>, pick the channel, and build the text from the mapped fields (insert each one from Make's mapping panel; the braces below stand for those fields), for example:</p>
${'<pre tabindex="0" aria-label="Slack message template"><code>{storeDomain}: {productTitle} ({variantTitle})\n{before.price} → {after.price} ({percentChange}%)\n{productUrl}</code></pre>'}
<p>Save the scenario and switch it on.</p>`],
    ],
    fieldsIntro: 'Each change record carries the current variant fields plus what changed:',
    mapping: [
      ['recordType, changeType', '<code>change</code>, and one of <code>price-changed</code>, <code>availability-changed</code>, <code>new-product</code>, <code>removed-product</code>, <code>new-variant</code>, <code>removed-variant</code>, <code>title-changed</code>'],
      ['storeDomain, productTitle, variantTitle', 'Which store and product'],
      ['before.price, after.price, percentChange', 'The old and new price (in the store\'s currency) and the change in percent'],
      ['before.compareAtPrice, after.compareAtPrice', 'The "was" price, to spot a sale starting or ending'],
      ['available', 'Whether the variant can be bought now'],
      ['productUrl', 'Link to the product page'],
    ],
    limits: [
      'Apify bills the first run per baseline record and later runs per change, at the prices on the Store page. A daily check of a store whose prices rarely change costs little after the baseline.',
      'Make counts operations per module run; each change that passes the filter adds one Slack operation.',
      'The catalog is the store\'s public <code>products.json</code>: stock quantities appear only where the store publishes them.',
    ],
    faq: [
      ['Can I put the changes in a sheet instead?', 'Yes. Replace the Slack module with Google Sheets → Add a Row and map the same fields. The <a href="../building-permits-google-sheets-make/">permits-to-Sheets recipe</a> shows that module.'],
      ['How do I start over with a fresh baseline?', 'Use a new <code>stateStoreName</code> in the task, or delete the key for that store in the named key-value store.'],
      ['Does it work for non-Shopify stores?', 'No. A store that is not on Shopify returns one <code>NOT_SHOPIFY</code> error item.'],
      ['Is this affiliated with Shopify, Make or Slack?', 'No. owlabee is an independent developer on Apify Store, and the Make app used here is Apify\'s own. Not affiliated with or endorsed by Shopify, Make, Slack, Apify or any store named; the store names are examples.'],
    ],
    related: ['shopify-price-tracker', 'website-changes-slack-n8n', 'building-permits-google-sheets-make', 'pacer-docket-alerts-slack-zapier'],
  },

  {
    slug: 'product-recalls-email-n8n',
    kind: 'integration',
    platform: 'n8n',
    actor: 'product-recall-feed',
    title: 'FDA, NHTSA and CPSC Product Recalls to Email with n8n',
    nav: 'Product recalls to email (n8n)',
    description:
      'E-mail yourself every new FDA, NHTSA or CPSC recall each morning with n8n and Apify\'s official n8n node: one workflow, a JSON input, and only recalls you have not seen before.',
    lede:
      'The Product Recall Feed reads FDA, NHTSA and CPSC recalls (plus Health Canada, UK and EU feeds) into one record shape and, in monitor mode, returns only recalls it has not returned before. A four-node n8n workflow built on Apify\'s official n8n node runs it every morning and e-mails the new recalls. No task or schedule in Apify is needed: n8n does the scheduling.',
    what: `
<p>An n8n <strong>Schedule Trigger</strong> starts the workflow at 7:00 every day. The Apify node runs the Actor with the input below and waits for it, a second Apify node reads the run's dataset, a filter drops error items, and an e-mail node sends one message per new recall with the product, the hazard and the agency link.</p>
<p>The input watches Class I FDA food and drug recalls plus CPSC consumer product recalls. Add a <code>vehicles</code> list for a fleet, or set <code>keyword</code> or <code>firm</code> to follow one product line or supplier. The <a href="../product-recalls-api/">product recalls guide</a> covers every source and field.</p>`,
    before: [
      'An Apify account and its API token (Console → Settings → API &amp; Integrations). The Actor is billed per result to that account; the Store page lists the current prices.',
      'An n8n instance, on n8n Cloud or self-hosted, with the Apify node installed. On self-hosted n8n: Settings → Community Nodes → Install, package <code>@apify/n8n-nodes-apify</code>. On n8n Cloud: search for Apify in the nodes panel and install it (the instance owner may need to allow verified community nodes in the Cloud Admin Panel first).',
      'An e-mail node with credentials: <strong>Gmail</strong>, or <strong>Send Email</strong> over SMTP.',
    ],
    inputHeading: 'Step 1: The input',
    inputIntro: 'This JSON goes into the <strong>Custom input</strong> field of the Run an Actor node in step 2:',
    input: {
      agencies: ['fda-food', 'fda-drug', 'cpsc'],
      daysBack: 30,
      fdaClassifications: ['Class I'],
      maxResultsPerSource: 100,
      onlyNewSinceLastRun: true,
      stateStoreName: 'n8n-email-recalls',
    },
    inputAfter: `
<p>With <code>onlyNewSinceLastRun</code> the Actor remembers, in a key-value store named <code>n8n-email-recalls</code> in your Apify account, which recalls it has returned, and each run returns only the new ones. The first run returns everything in the 30-day window. The window is long on purpose: FDA lists a recall in its enforcement report only after classifying it, which can be weeks after the firm's announcement, and monitor mode keeps the long window from sending anything twice. <code>fdaClassifications</code> applies to the FDA sources only; CPSC recalls pass through.</p>`,
    stepsHeading: 'Step 2: Build the n8n workflow',
    steps: [
      ['Schedule Trigger', 'Create a workflow and add a <strong>Schedule Trigger</strong> that fires daily at the hour you want.'],
      ['Apify: Run an Actor', 'Add the <strong>Apify</strong> node with the <strong>Run an Actor</strong> operation. Create a credential (<strong>Apify API</strong> with your token, or <strong>Apify OAuth2 API</strong> on n8n Cloud), choose the Product Recall Feed Actor (<code>owlabee/product-recall-feed</code>), paste the input above into <strong>Custom input</strong>, and set <strong>Wait for finish</strong> to true so the next node runs only after the run completes.'],
      ['Apify: Get dataset items', 'Add a second <strong>Apify</strong> node with <strong>Get dataset items</strong> and set <strong>Dataset ID</strong> to the <code>defaultDatasetId</code> value from the Run an Actor output. It outputs one item per recall.'],
      ['Filter', 'Add a <strong>Filter</strong> node that keeps items where <code>error</code> does not exist. An agency API that is down produces one error item such as <code>FETCH_FAILED</code> instead of failing the run.'],
      ['E-mail: Gmail or Send Email', `<p>Add <strong>Gmail</strong> (send a message) or <strong>Send Email</strong>. n8n runs it once per recall. Use expressions for the subject and body, for example:</p>
${'<pre tabindex="0" aria-label="E-mail template"><code>Subject: {{ $json.agency }} recall: {{ $json.title }}\n\n{{ $json.product }}\nHazard: {{ $json.hazard }}\nFirm: {{ $json.firm }}\nClassification: {{ $json.classification }}\n{{ $json.url }}</code></pre>'}
<p>For one digest e-mail instead, put an <strong>Aggregate</strong> node before it. Save the workflow and activate it.</p>`],
    ],
    fieldsIntro: 'Each dataset item is one recall in the shared record shape:',
    mapping: [
      ['agency, recallId', 'FDA, NHTSA or CPSC and the agency\'s recall number'],
      ['date, title, product', 'When and what was recalled'],
      ['hazard', 'FDA reason for recall, NHTSA consequence summary, or CPSC hazards'],
      ['classification, severity', 'FDA Class I/II/III, NHTSA or CPSC remedy type; severity where it can be derived'],
      ['firm, distribution, quantity', 'Recalling firm and distribution as published'],
      ['url', 'The agency record'],
    ],
    limits: [
      'Apify bills the Actor per recall record and per agency API request, at the prices on its Store page. In monitor mode later runs only return, and only charge per record for, new recalls.',
      'Apify\'s documentation lists OAuth2 credentials for n8n Cloud only; self-hosted n8n uses the API token credential.',
      'Agencies publish on their own schedules: openFDA enforcement reports update weekly, NHTSA and CPSC within days. The <a href="../product-recalls-api/">recalls guide</a> covers each source.',
    ],
    faq: [
      ['Can I trigger the workflow from an Apify schedule instead?', 'Yes. Save the input as a task with an Apify schedule and start the workflow with the Apify node\'s <strong>On new Apify event</strong> trigger (Resource to Watch: your task; Event Type: Succeeded), then read the dataset as in step 3. The <a href="../website-changes-slack-n8n/">website changes recipe</a> uses that trigger.'],
      ['Does it need an openFDA key?', 'No. An optional <code>fdaApiKey</code> only raises openFDA\'s rate limits.'],
      ['Can I watch recalls for specific vehicles?', 'Yes. Add <code>vehicles</code>, one entry per vehicle as <code>"make, model, year"</code> (for example <code>"Ford, F-150, 2021"</code>). Each lookup returns every NHTSA recall on that vehicle.'],
      ['Is this affiliated with n8n or the agencies?', 'No. owlabee is an independent developer on Apify Store, and the n8n node used here is Apify\'s own. Not affiliated with or endorsed by n8n, Google, Apify, the FDA, NHTSA or CPSC.'],
    ],
    related: ['product-recalls-api', 'website-changes-slack-n8n', 'epa-echo-enforcement', 'pacer-docket-alerts-slack-zapier'],
  },

  {
    slug: 'website-changes-slack-n8n',
    kind: 'integration',
    platform: 'n8n',
    actor: 'website-change-monitor',
    title: 'Website Change Alerts in Slack with n8n',
    nav: 'Website changes to Slack (n8n)',
    description:
      'Post new, removed and changed pages of any website to Slack with n8n: a scheduled Apify task watches the site\'s sitemaps and the Apify trigger node starts the workflow when a run finishes.',
    lede:
      'The Website Change Monitor reads a site\'s sitemaps, fetches the pages, and on every run after the first returns only what changed: new pages, removed pages and pages whose text changed, with a preview of the words added and removed. Save it as an Apify task on a schedule, and an n8n workflow built on Apify\'s official node posts the changes that matter to Slack.',
    what: `
<p>An Apify schedule runs a saved task that watches a competitor's site. When a run succeeds, the Apify node's <strong>On new Apify event</strong> trigger starts the workflow, a second Apify node reads the run's dataset, a filter keeps new, removed and content-changed pages of medium or high severity, and Slack gets one message per change with the page title, the URL and a preview of the edit.</p>
<p>Use <code>includePatterns</code> to watch only part of a site, such as <code>/pricing</code> or <code>/blog/</code>, and <code>contentSelector</code> to ignore headers and footers. The <a href="../sitemap-change-monitor/">sitemap change monitor guide</a> covers every option.</p>`,
    before: [
      'An Apify account and its API token (Console → Settings → API &amp; Integrations). The Actor is billed per result to that account; the Store page lists the current prices. Set a maximum total charge in the task\'s run options to cap a run.',
      'An n8n instance with the Apify node installed (self-hosted: Settings → Community Nodes → Install <code>@apify/n8n-nodes-apify</code>; n8n Cloud: search for Apify in the nodes panel) and a Slack credential.',
    ],
    inputHeading: 'Step 1: Save the input as an Apify task',
    inputIntro:
      'Open the Actor in Apify Console from its Store page. On the <strong>Input</strong> tab, switch to the JSON editor, paste this input with the site you watch, and click <strong>Save as a new task</strong>:',
    input: {
      sites: ['https://www.sitemaps.org/'],
      mode: 'monitor',
      checkContent: true,
      maxPages: 200,
      stateStoreName: 'n8n-slack-site-changes',
      resetBaseline: false,
    },
    inputAfter: `
<p>In <code>monitor</code> mode the first run records a baseline of every page; each later run compares with the previous one and emits only changes. Run the task once from Console now to record the baseline. Then open <strong>Schedules</strong> in Console, create a daily (or hourly) schedule, and add the task to it.</p>`,
    stepsHeading: 'Step 2: Build the n8n workflow',
    steps: [
      ['Trigger: Apify, On new Apify event', 'Create a workflow and add the <strong>Apify</strong> node\'s <strong>On new Apify event</strong> trigger with your Apify credential. Set <strong>Resource to Watch</strong> to the task you saved and <strong>Event Type</strong> to <strong>Succeeded</strong>.'],
      ['Apify: Get dataset items', 'Add an <strong>Apify</strong> node with <strong>Get dataset items</strong> and set <strong>Dataset ID</strong> to the run\'s default dataset ID from the trigger output (in Apify\'s run webhook payload it is <code>resource.defaultDatasetId</code>; check the trigger\'s test output for the exact path).'],
      ['Filter', 'Add a <strong>Filter</strong> node with two conditions: <code>changeType</code> is one of <code>new-url</code>, <code>removed-url</code> or <code>content-changed</code>, and <code>severity</code> is not <code>low</code>. This also drops the baseline records of the first run.'],
      ['Slack: Send Message', `<p>Add the <strong>Slack</strong> node, send a message to your channel, and build the text with expressions, for example:</p>
${'<pre tabindex="0" aria-label="Slack message template"><code>{{ $json.changeType }} ({{ $json.severity }}): {{ $json.title }}\n{{ $json.url }}\n+ {{ $json.changedPreview.addedPreview }}\n- {{ $json.changedPreview.removedPreview }}</code></pre>'}
<p>Save the workflow and activate it.</p>`],
    ],
    fieldsIntro: 'Each dataset item is one page event:',
    mapping: [
      ['changeType', '<code>new-url</code>, <code>removed-url</code>, <code>lastmod-changed</code>, <code>content-changed</code>, <code>status-changed</code>, <code>baseline</code> or <code>error</code>'],
      ['url, title', 'The page'],
      ['severity, severityReason', 'low, medium or high, with a one-phrase reason'],
      ['changedPreview.addedPreview, changedPreview.removedPreview', 'Short previews of the text added and removed'],
      ['changedPreview.similarity', 'How similar the new text is to the old, 0 to 1'],
      ['lastmod, status', 'Sitemap lastmod and the HTTP status'],
    ],
    limits: [
      'Apify bills the Actor per page checked and per change, at the prices on its Store page. <code>maxPages</code> caps the pages checked per run.',
      'The Actor finds pages through the site\'s sitemaps (and optionally its feeds); a page that is in no sitemap is not watched.',
      'The trigger fires only on finished runs with the event type you choose; add a second workflow on <strong>Failed</strong> if you want to hear about failures.',
    ],
    faq: [
      ['Can I skip n8n?', 'The Actor can POST its own alert: set <code>webhookUrl</code> to an endpoint you control, and with <code>notifyOnlyOnChanges</code> it posts only when something changed. n8n is useful for filtering on severity and formatting the Slack message.'],
      ['How do I watch only the pricing page?', 'Add <code>"includePatterns": ["/pricing"]</code> to the input. Patterns can be globs, regular expressions or substrings of the URL.'],
      ['How do I reset the baseline?', 'Run the task once with <code>resetBaseline</code> set to <code>true</code>, or use a new <code>stateStoreName</code>.'],
      ['Is this affiliated with n8n or Slack?', 'No. owlabee is an independent developer on Apify Store, and the n8n node used here is Apify\'s own. Not affiliated with or endorsed by n8n, Slack, Apify or any site named.'],
    ],
    related: ['sitemap-change-monitor', 'shopify-price-changes-slack-make', 'product-recalls-email-n8n', 'pacer-docket-alerts-slack-zapier'],
  },
];
