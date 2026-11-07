# Grants.gov API & SAM.gov Scraper — Federal Grants Feed

Apify Store: [apify.com/owlabee/grants-gov-api](https://apify.com/owlabee/grants-gov-api) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/grants-gov-api/](https://owlabee.com/grants-gov-api/)

Searches the official Grants.gov API (no key) and the SAM.gov Get Opportunities API (free personal key) by keyword, optionally adds recent USAspending.gov awards and six state and local open-data bid datasets, and normalizes every record to the same field names. Monitor mode flags records as new or updated since the last run.

## Inputs that matter

| Field | What it does |
|---|---|
| `keywords` | Required. Search terms; each is searched in every enabled source. |
| `sources` | `grantsGov`, `samGov`, `sled`. Default `["grantsGov"]`. |
| `oppStatuses` | Grants.gov statuses: `forecasted`, `posted`, `closed`, `archived`. |
| `postedWithinDays` | Only records posted in the last N days (1 to 365). |
| `samApiKey` | Your free SAM.gov API key. SAM.gov is skipped without it. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "keywords": [
    "small business"
  ],
  "sources": [
    "grantsGov"
  ],
  "oppStatuses": [
    "posted"
  ],
  "postedWithinDays": 14,
  "maxResults": 25,
  "fetchDetails": false,
  "includeRecentAwards": false,
  "onlyNewSinceLastRun": false
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
    "owlabee-grants-gov-api": {
      "url": "https://mcp.apify.com/?tools=owlabee/grants-gov-api",
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
    "owlabee-grants-gov-api": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/grants-gov-api",
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
  "source": "grantsGov",
  "recordType": "opportunity",
  "title": "Small Business Development Centers Program",
  "agency": "Small Business Administration",
  "status": "posted",
  "postedDate": "2026-10-10",
  "closeDate": "2026-12-15",
  "url": "https://www.grants.gov/search-results-detail/351083",
  "isNew": true,
  "jurisdiction": "United States",
  "fetchedAt": "2026-10-16T12:00:00.000Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
