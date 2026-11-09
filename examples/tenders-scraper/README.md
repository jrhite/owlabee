# Tenders Scraper: EU TED, UK Find a Tender & AusTender

Apify Store: [apify.com/owlabee/tenders-scraper](https://apify.com/owlabee/tenders-scraper) · Pay per result; see the Store page for current pricing.

Collects public tenders and contract award notices from four official open procurement APIs (EU TED, UK Find a Tender, UK Contracts Finder and AusTender) and returns them in one normalized record with the deadline, estimated value and currency, buyer, CPV or UNSPSC classifications, lots, notice and document links, and the source's license and attribution line. The record shape matches the Grants.gov API opportunity records. Monitor mode emits only new or updated notices. No API key, login or proxy.

## Inputs that matter

| Field | What it does |
|---|---|
| `keywords` | Required. Search terms; `*` returns every notice in the window. |
| `sources` | `ted`, `findATender`, `contractsFinder`, `ausTender`. Default `ted`. |
| `noticeTypes` | `bid`, `award`, `planning`. Default `bid`. |
| `countries` | Buyer countries for TED, as ISO codes. |
| `cpvCodes` | CPV codes or prefixes (TED and UK); `unspscCodes` for AusTender. |
| `onlyNewSinceLastRun` | Monitor mode: emit only notices that are new or changed. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "keywords": [
    "software"
  ],
  "sources": [
    "ted"
  ],
  "noticeTypes": [
    "bid"
  ],
  "postedWithinDays": 7,
  "maxResults": 20
}
```

## Run it

All scripts read your token from the `APIFY_TOKEN` environment variable (Apify Console → Settings → API & Integrations). Never commit a token.

```bash
export APIFY_TOKEN=<your Apify API token>

./curl.sh                                          # curl, sync endpoint, prints JSON
pip install apify-client && python python.py       # Python client
npm install apify-client && node node.mjs          # Node.js client
```

Each run is billed to your Apify account per result. To cap spend, set a maximum total charge for the run in the Console, or pass `maxTotalChargeUsd` as a run option.

## Use it from an AI agent (MCP)

[`mcp.json`](mcp.json) points an MCP client at Apify's hosted MCP server with only this Actor enabled:

```json
{
  "mcpServers": {
    "owlabee-tenders-scraper": {
      "url": "https://mcp.apify.com/?tools=owlabee/tenders-scraper",
      "headers": {
        "Authorization": "Bearer ${APIFY_TOKEN}"
      }
    }
  }
}
```

Clients differ in how they expand environment variables in this file: Claude Code reads `${APIFY_TOKEN}` from your environment and Cursor uses `${env:APIFY_TOKEN}`. Otherwise, put the token in your local copy of the file and keep that copy out of version control. For Claude Desktop, which starts local servers, bridge through `mcp-remote`:

```json
{
  "mcpServers": {
    "owlabee-tenders-scraper": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/tenders-scraper",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer <your Apify API token>"
      }
    }
  }
}
```

## Sample output

One dataset item, shortened to the main fields (from the Actor's README):

```json
{
  "source": "ted",
  "recordType": "opportunity",
  "opportunityId": "ted:779189-2026",
  "title": "Slovakia – Financial transaction processing and clearing-house services – Akceptácia platobných kariet prostredníctvom internetu",
  "agency": "Železničná spoločnosť Slovensko, a.s.",
  "status": "open",
  "postedDate": "2026-11-09",
  "closeDate": "2026-12-08",
  "url": "https://ted.europa.eu/en/notice/-/detail/779189-2026",
  "country": "SK",
  "noticeType": "bid",
  "estimatedValue": 2794882,
  "currency": "EUR",
  "classifications": [
    {
      "scheme": "CPV",
      "code": "66172000",
      "description": null
    }
  ],
  "sourceLicense": "CC-BY-4.0 (Commission Decision 2011/833/EU)",
  "attribution": "© European Union, 1998–2026, data from TED (Decision 2011/833/EU)",
  "fetchedAt": "2026-11-09T06:02:33.288Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
