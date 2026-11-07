# owlabee

owlabee publishes <!-- count -->18<!-- /count --> pay-per-result [Apify](https://apify.com) Actors that turn public data sources (permit portals, federal APIs, court feeds, license registries, DNS, sitemaps, storefronts) into normalized JSON.

This repo has runnable examples for each Actor: curl, Python, Node.js and an MCP config for AI agents. Each Actor is billed per result to your own Apify account; see its Store page for current pricing.

Guides to the data sources: **<!-- site -->[owlabee.com](https://owlabee.com/)<!-- /site -->**

Made by [Jacob Hite](https://jacobhite.com/).

## Actors

<!-- actors -->
| Actor | What it returns | Examples |
|---|---|---|
| [Building Permits Scraper — Roofing & Construction Leads](https://apify.com/owlabee/building-permits-scraper) | Building permits from 61 US city, county and state open-data portals: type, status, dates, cost, address, contractor | [examples/building-permits-scraper](examples/building-permits-scraper/) |
| [Accela Citizen Access & EnerGov Permit Scraper (Any City)](https://apify.com/owlabee/accela-energov-permit-scraper) | Permits from Accela Citizen Access and Tyler EnerGov portals in 31 cities and counties, in the same schema as the open-data scraper | [examples/accela-energov-permit-scraper](examples/accela-energov-permit-scraper/) |
| [Grants.gov API & SAM.gov Scraper — Federal Grants Feed](https://apify.com/owlabee/grants-gov-api) | Grants.gov grant opportunities and SAM.gov contract notices by keyword, plus optional USAspending awards and six state and local bid datasets | [examples/grants-gov-api](examples/grants-gov-api/) |
| [Grant Matching & RFP Bid/No-Bid Scorer (AI) — Grants.gov](https://apify.com/owlabee/grant-matching) | Grants.gov, SAM.gov and USAspending opportunities ranked by fit to your organization, with reasons and disqualifiers | [examples/grant-matching](examples/grant-matching/) |
| [PACER RSS Docket Monitor — New Federal Court Filings](https://apify.com/owlabee/federal-court-docket-monitor) | New docket entries from the public PACER RSS feeds of federal district, bankruptcy, appellate and national courts, filtered by party, case or entry type | [examples/federal-court-docket-monitor](examples/federal-court-docket-monitor/) |
| [OSHA Inspections by Company + EPA Enforcement Report](https://apify.com/owlabee/osha-epa-inspections) | OSHA inspections, violations and penalties (DOL Data API) and EPA ECHO enforcement cases by company, facility, state or ZIP | [examples/osha-epa-inspections](examples/osha-epa-inspections/) |
| [Product Recall Feed — FDA, NHTSA & CPSC Recalls API](https://apify.com/owlabee/product-recall-feed) | FDA drug, device and food recalls, NHTSA vehicle recalls and CPSC consumer product recalls in one normalized record | [examples/product-recall-feed](examples/product-recall-feed/) |
| [License Verification API — TDLR, DBPR, DORA, WA DOH, NPI](https://apify.com/owlabee/license-verification-api) | Professional license records by name or number from Texas TDLR, Florida DBPR, Colorado DORA, Washington DOH and the NPI Registry | [examples/license-verification-api](examples/license-verification-api/) |
| [SPF, DMARC & DKIM Checker — Bulk Domain WHOIS, DNS & SSL](https://apify.com/owlabee/spf-dmarc-dkim-checker) | One record per domain: SPF, DMARC, DKIM, MTA-STS and BIMI with a 0-100 email security score, RDAP WHOIS, DNS, TLS and HTTP headers | [examples/spf-dmarc-dkim-checker](examples/spf-dmarc-dkim-checker/) |
| [Website Change Monitor — Sitemap Monitor & Page Diff](https://apify.com/owlabee/website-change-monitor) | Pages discovered through a site's sitemaps, and new, removed, updated and content-changed pages between runs with diff previews | [examples/website-change-monitor](examples/website-change-monitor/) |
| [Shopify Catalog Monitor & Price Tracker — Products Scraper](https://apify.com/owlabee/shopify-catalog-monitor) | Every product or variant of a public Shopify store from products.json, or price, stock and new or removed product changes | [examples/shopify-catalog-monitor](examples/shopify-catalog-monitor/) |
| [Bluesky Monitor & Scraper — Posts, Keywords, Followers](https://apify.com/owlabee/bluesky-monitor) | Bluesky posts by keyword or hashtag, profiles, author feeds and follower lists from the public AT Protocol API | [examples/bluesky-monitor](examples/bluesky-monitor/) |
| [Hiring Signals & ATS Jobs Scraper — Greenhouse, Lever, Ashby](https://apify.com/owlabee/job-postings-api) | Open roles from Greenhouse, Lever, Ashby, SmartRecruiters and Workable job boards, or new, removed and changed roles per company | [examples/job-postings-api](examples/job-postings-api/) |
| [Podcast RSS Scraper — Episodes, Transcripts & Apple Podcasts](https://apify.com/owlabee/podcast-rss-scraper) | Show and episode records from podcast RSS feeds, Apple Podcasts links or search terms, with Podcasting 2.0 transcripts | [examples/podcast-rss-scraper](examples/podcast-rss-scraper/) |
| [Podcast Episode Summarizer (AI) — Transcript to Summary](https://apify.com/owlabee/podcast-summarizer) | Per-episode abstract, key topics, chapters, quotes, guests and action items from Podcasting 2.0 transcripts or show notes | [examples/podcast-summarizer](examples/podcast-summarizer/) |
| [PDF to Markdown for RAG — DOCX, OCR & Chunks](https://apify.com/owlabee/pdf-to-markdown) | Clean Markdown from PDF, DOCX, HTML and text URLs, with optional heading-aware RAG chunks and OCR for scanned pages | [examples/pdf-to-markdown](examples/pdf-to-markdown/) |
| [PDF & Document to JSON Extractor (AI) — Invoices, Forms](https://apify.com/owlabee/pdf-to-json) | One JSON object per PDF, DOCX or HTML document that matches the JSON Schema you supply, with per-field confidence | [examples/pdf-to-json](examples/pdf-to-json/) |
| [AI Drone Roof Inspection Report — Findings & Repair Scope](https://apify.com/owlabee/drone-roof-inspection-report) | Per-photo roof defect findings, per-building condition grade and repair scope, a Markdown report and a contact sheet | [examples/drone-roof-inspection-report](examples/drone-roof-inspection-report/) |
<!-- /actors -->

## Quick start

1. Create an Apify account and copy your API token from **Console → Settings → API & Integrations**.
2. Put it in your environment. Never commit it.

   ```bash
   export APIFY_TOKEN=<your Apify API token>
   ```

3. Run any example. Every folder has an `input.json` taken from that Actor's own quick-start input:

   ```bash
   cd examples/product-recall-feed
   ./curl.sh
   ```

   Or call the API directly. `run-sync-get-dataset-items` starts a run, waits for it (up to 300 seconds) and returns the dataset items:

   ```bash
   curl -sS -X POST \
     "https://api.apify.com/v2/acts/owlabee~product-recall-feed/run-sync-get-dataset-items" \
     -H "Authorization: Bearer ${APIFY_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"agencies": ["fda-drug", "nhtsa", "cpsc"], "daysBack": 30, "maxResultsPerSource": 5}'
   ```

Python (`pip install apify-client`) and Node.js (`npm install apify-client`) versions are in each folder as `python.py` and `node.mjs`. To cap spend on a run, set its maximum total charge in the Console or pass `maxTotalChargeUsd` as a run option.

## Use from AI agents (MCP)

Apify hosts an MCP server at `mcp.apify.com`. Add `?tools=` to expose only the Actors you want. This config gives an agent the recall feed and the license lookup:

```json
{
  "mcpServers": {
    "owlabee": {
      "url": "https://mcp.apify.com/?tools=owlabee/product-recall-feed,owlabee/license-verification-api",
      "headers": { "Authorization": "Bearer ${APIFY_TOKEN}" }
    }
  }
}
```

Claude Code expands `${APIFY_TOKEN}` from your environment; Cursor uses `${env:APIFY_TOKEN}`. Each `examples/<actor>/mcp.json` is the same config for one Actor, and its README shows the `mcp-remote` variant for Claude Desktop.

## Repository layout

| Path | What it is |
|---|---|
| `examples/<actor>/` | `input.json`, `curl.sh`, `python.py`, `node.mjs`, `mcp.json` and a README per Actor |
| `docs/` | The static guide site, served by GitHub Pages (generated, plain HTML and one CSS file) |
| `tools/` | Zero-dependency Node scripts that generate `examples/` and `docs/` |

To change the site's base URL, edit `tools/site-config.mjs`, then run `node tools/build-examples.mjs && node tools/build-site.mjs` and commit the output.

## Notes

- Data comes from public sources as each source publishes it. Coverage, freshness and field completeness vary by source; check the linked source record before relying on a value.
- owlabee is an independent developer on Apify Store. It is not affiliated with or endorsed by Apify, or by any agency, court, registry or company named in this repo.
- Example code is MIT licensed (see [LICENSE](LICENSE)).
