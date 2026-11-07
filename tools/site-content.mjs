// Content for the guide pages in docs/. Every claim here comes from the Actor's README,
// input schema or dataset schema. Inline HTML is allowed in text fields; JSON fields are objects.
// Inputs are validated against each Actor's input schema before publishing.

export const pages = [
  {
    slug: 'building-permits-api',
    actor: 'building-permits-scraper',
    title: 'Building Permits API: 61 US Open-Data Portals as JSON',
    nav: 'Building permits API',
    description:
      'Get building permits from 61 US city, county and state open-data portals as one JSON schema: permit type, status, dates, cost, address and contractor where published.',
    lede:
      'Many US cities and counties publish their building permits on open-data portals, but each portal has its own API, column names and permit-type labels. The Building Permits Scraper reads 61 of them and returns every permit in one schema, with a link back to the source row.',
    source: `
<p>The data comes from the jurisdictions' own open-data portals, which run on four kinds of software: <strong>Socrata</strong> (the SODA API), <strong>CKAN DataStore</strong>, <strong>ArcGIS REST</strong> and <strong>CARTO SQL</strong>. Examples are New York City (DOB NOW approved permits), Chicago, Los Angeles (LADBS), Seattle (SDCI), Austin, Philadelphia (L&amp;I, via CARTO), Boston (CKAN), Washington, DC and Miami-Dade County (ArcGIS), plus one state, New Jersey. Each entry was checked live, and the Actor calls the portal APIs directly over HTTPS: no browser, no login, no proxies.</p>
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
      ['estimatedCost', 'Declared job value in USD, or null where the jurisdiction publishes none'],
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
      ['Can it rank opportunities for my organization?', 'Pass the results to the <a href="https://apify.com/owlabee/gov-opportunity-fit-scorer">Grant Matching and RFP Bid/No-Bid Scorer</a>, which scores each record against a profile you describe once.'],
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
      ['Bid/no-bid triage', 'Send the notices to the <a href="https://apify.com/owlabee/gov-opportunity-fit-scorer">Grant Matching and RFP Bid/No-Bid Scorer</a> to rank them against your company profile.'],
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
    slug: 'osha-inspections-by-company',
    actor: 'osha-epa-enforcement-report',
    title: 'OSHA Inspections by Company: DOL Data API Lookup',
    nav: 'OSHA inspections',
    description:
      'Look up OSHA inspections, violations and penalties by company name, inspection number, state or ZIP through the DOL Data API, with a name-match confidence per record.',
    lede:
      'OSHA inspection and citation data is published by the U.S. Department of Labor through its Data API. This Actor looks up inspections by company name or inspection number and returns one record per inspection with its violations and penalties, graded by how well the establishment name matched.',
    source: `
<p>The data comes from the <strong>DOL Data API v4</strong> (<code>apiprod.dol.gov</code>), datasets <code>OSHA/inspection</code> and <code>OSHA/violation</code>. It includes federal OSHA and State Plan inspections as DOL publishes them.</p>
<p><strong>The DOL API needs a key.</strong> Keys are free: sign in at <a href="https://dataportal.dol.gov">dataportal.dol.gov</a>, open your account's API keys page, and pass the key as <code>dolApiKey</code>. It is stored as an encrypted secret and only sent to <code>apiprod.dol.gov</code>. Without a key the Actor still runs its EPA source (see <a href="../epa-echo-enforcement/">EPA ECHO enforcement</a>) and writes one <code>DOL_API_KEY_MISSING</code> item for OSHA.</p>
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
      ['Can I get EPA cases in the same run?', 'Yes. Add <code>epa</code> to <code>sources</code>. The per-company summary then counts records and penalties by agency.'],
    ],
    related: ['epa-echo-enforcement', 'professional-license-verification'],
  },

  {
    slug: 'epa-echo-enforcement',
    actor: 'osha-epa-enforcement-report',
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
      ['Does EPA ECHO need an API key?', 'No. ECHO web services are public. Only the OSHA source needs a key.'],
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
      'US product recalls from openFDA (drugs, devices, food), NHTSA (vehicles) and CPSC (consumer products) in one normalized JSON record, with a new-recalls-only mode.',
    lede:
      'Three federal agencies publish US recalls, each with its own API and field names. This Actor reads all three and writes each recall as one record with the same fields: agency, recall id, date, product, hazard, classification, firm, remedy and a link to the official notice.',
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
</tbody>
</table>
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
      ['Do I need API keys?', 'No. All three agencies have public APIs. An openFDA key is optional and only raises openFDA\'s rate limits.'],
      ['Why is a recall from the news missing?', 'FDA lists recalls in enforcement reports after classifying them, often weeks later. NHTSA and CPSC publish faster.'],
      ['Why is <code>severity</code> null for CPSC?', 'CPSC publishes no recall class. FDA classes map to high, medium and low, and NHTSA recalls with a do-not-drive or park-outside advisory are high.'],
      ['What happens if one agency API is down?', 'That feed yields one error item and the others continue.'],
      ['Can I see the agency\'s original fields?', 'Yes. <code>includeRaw</code> attaches the agency record as a nested <code>raw</code> object.'],
    ],
    related: ['epa-echo-enforcement', 'pacer-rss-docket-monitor'],
  },

  {
    slug: 'pacer-rss-docket-monitor',
    actor: 'federal-court-docket-monitor',
    title: 'PACER RSS Feeds: Monitor New Federal Court Filings',
    nav: 'PACER RSS docket monitor',
    description:
      'Read the free public PACER RSS feeds of federal district and bankruptcy courts as JSON and filter new filings by party, case number, entry type or bankruptcy chapter.',
    lede:
      'Every federal district and bankruptcy court running CM/ECF publishes a free RSS feed of its last 24 hours of docket activity. This Actor reads those feeds for the courts you choose, normalizes each entry, filters it, and on scheduled runs keeps only entries that are new since the last run. No PACER account is needed.',
    source: `
<p>The feeds are the courts' own public endpoints, <code>https://ecf.&lt;court&gt;.uscourts.gov/cgi-bin/rss_outside.pl</code>. Each entry has the case number, the case title (the lead parties), the docket text, the document number with a link, and the filing time. Documents are linked, never downloaded; opening a document on PACER is subject to PACER's own fees.</p>
<p>Coverage differs per court. In the Actor's sweep of 2026-10-17, 94 courts published every entry type, 41 published a subset (typically complaints, motions and orders), 23 answered with no entries, and 30 did not answer datacenter requests. The Actor still tries every court you name and reports what happened.</p>
<p>For past dockets, the optional historical pass reads the RECAP archive through the Free Law Project's CourtListener API, in the same record shape with <code>source: "courtlistener-recap"</code>.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Each feed covers the <strong>trailing 24 hours</strong> only. Schedule at least daily; hourly is a good default, since courts regenerate feeds every 30 to 60 minutes.</li>
<li>Nature of suit, party lists, judges and the full docket text are not in the feeds. The case title carries only the lead parties, so a party that is not first-named may be missing.</li>
<li><code>entryTypes</code> is a heuristic over the entry text; use <code>entryKeywords</code> for precision.</li>
<li>The CourtListener API allows 5 requests per minute, 50 per hour and 125 per day by default, shared by anonymous callers; a free CourtListener token gives a run its own allowance.</li>
</ul>`,
    fields: [
      ['court, courtName, courtType, state', 'CM/ECF court code and name; district or bankruptcy'],
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
      ['How far back does it go?', 'The live feeds cover 24 hours. Turn on <code>includeHistorical</code> to also read dockets from the last 1 to 365 days in the RECAP archive.'],
      ['Why does the same entry appear twice?', 'Some courts attach two event labels to one entry. Both are published with the same <code>entryId</code>; <code>entryKey</code> tells them apart.'],
      ['Can I get the judge or all parties?', 'Not from the feed. Open <code>docketUrl</code> on PACER. Historical RECAP records do include parties, nature of suit and the assigned judge when the archive has them.'],
      ['What if a court\'s feed is down?', 'That court produces one error item and the run continues with the others.'],
    ],
    related: ['grants-gov-api', 'product-recalls-api'],
  },

  {
    slug: 'professional-license-verification',
    actor: 'us-license-verifier',
    title: 'Professional License Lookup: TDLR, DBPR, DORA, WA DOH, NPI',
    nav: 'License verification',
    description:
      'Look up professional licenses by name or number in Texas TDLR, Florida DBPR, Colorado DORA, Washington DOH and the NPI Registry: status, expiration, discipline flag.',
    lede:
      'State licensing boards publish their license records in different places and formats. This Actor queries five official public registries by name or license number and returns one normalized record per license, with a status, an expiration date and a disciplinary-action flag.',
    source: `
<table>
<thead><tr><th>Source id</th><th>Board</th><th>Coverage</th><th>How it is queried</th></tr></thead>
<tbody>
<tr><td><code>TX_TDLR</code></td><td>Texas Department of Licensing and Regulation</td><td>About 1.0 M licenses: electricians, A/C and HVAC, cosmetologists, barbers, tow operators and more</td><td>Socrata open-data API on data.texas.gov</td></tr>
<tr><td><code>FL_DBPR</code></td><td>Florida Department of Business &amp; Professional Regulation</td><td>Real estate, construction contractors, home inspectors, CPAs, architects, engineers and more</td><td>The public "Verify a Licensee" portal, one request per query</td></tr>
<tr><td><code>CO_DORA</code></td><td>Colorado Department of Regulatory Agencies</td><td>About 1.6 M licenses across every DORA profession, with disciplinary case numbers</td><td>Socrata open-data API on data.colorado.gov, updated daily</td></tr>
<tr><td><code>WA_DOH</code></td><td>Washington State Department of Health</td><td>About 2.5 M health-care credentials, with an "action taken" flag</td><td>Socrata open-data API on data.wa.gov, updated daily</td></tr>
<tr><td><code>NPI</code></td><td>CMS NPPES NPI Registry (federal)</td><td>Every US health-care provider and organization with an NPI</td><td>Official JSON API at npiregistry.cms.hhs.gov</td></tr>
</tbody>
</table>
<p>Queries are one line each: <code>TX:3365:Master Electrician</code>, <code>name:Jane Smith:FL</code>, <code>npi:1003000126</code>, or pinned to a board with <code>tdlr:</code>, <code>dbpr:</code>, <code>dora:</code>, <code>doh:</code>. A query with a state goes only to that state's board; a query without one goes to every enabled source.</p>
<h3>Limits worth knowing</h3>
<ul>
<li>Texas publishes no status column, so its status is derived from the expiration date (<code>statusDerived: true</code>).</li>
<li>Open-data extracts can lag the board's live database: Colorado and Washington refresh daily, Texas less often.</li>
<li>Florida returns the first 50 matches of the portal's result page. Common names can match hundreds of licenses; narrow with a state, license type or city.</li>
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
      ['disciplinaryActionFlag', 'True when the board records an action (Colorado adds case details)'],
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
        disciplinaryActionFlag: null,
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
      ['Which states are covered?', 'Texas (TDLR trades and occupations), Florida (DBPR professions), Colorado (all DORA professions) and Washington (health-care credentials), plus every US health-care provider through the NPI Registry.'],
      ['What does <code>verified</code> mean?', 'The license was found, its status is ACTIVE and the expiration date is today or later. Statuses such as "Active - With Conditions" normalize to PROBATION and do not verify.'],
      ['Is this the board\'s official verification?', 'No. It reads the boards\' public records and links each one. Confirm with the issuing board before relying on a result.'],
      ['Why do I get several records for one number?', 'License numbers repeat across license types in Texas and Colorado. Add the type, for example <code>TX:3365:Master Electrician</code>.'],
      ['Does it need proxies or a key?', 'No. A free Socrata app token is optional and only raises rate limits on the Texas, Colorado and Washington datasets.'],
    ],
    related: ['building-permits-api', 'osha-inspections-by-company'],
  },

  {
    slug: 'spf-dmarc-dkim-checker',
    actor: 'domain-intelligence',
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
      ['Can I track stores that are not on Shopify?', 'No. For other sites, the <a href="../sitemap-change-monitor/">sitemap change monitor</a> reports page and content changes.'],
      ['How do I start a fresh baseline?', 'Use a new <code>stateStoreName</code>, or delete the store\'s key in the existing one.'],
    ],
    related: ['sitemap-change-monitor', 'spf-dmarc-dkim-checker'],
  },
];
