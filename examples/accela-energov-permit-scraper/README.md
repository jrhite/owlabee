# Accela Citizen Access & EnerGov Permit Scraper (Any City)

Apify Store: [apify.com/owlabee/accela-energov-permit-scraper](https://apify.com/owlabee/accela-energov-permit-scraper) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://jrhite.github.io/owlabee/accela-energov-permits/](https://jrhite.github.io/owlabee/accela-energov-permits/)

Reads building permits from city and county portals that run Accela Citizen Access or Tyler EnerGov Citizen Self Service, using the same public search the portal web page uses. Each permit comes back in the same normalized schema as the Building Permits Scraper. Turn on permit details for valuation, contractor, license, owner and applicant.

## Inputs that matter

| Field | What it does |
|---|---|
| `jurisdictions` | Required. Registry ids such as `overland-park-ks`, or `all`, `all-energov`, `all-accela`. |
| `issuedWithinDays` | Window in days (1 to 365). On Accela portals this filters on the application date. |
| `includeDetails` | Fetch each permit's detail record for valuation, contractor and owner fields. |
| `maxResultsPerJurisdiction` | Newest-first cap per jurisdiction. |
| `onlyNewSinceLastRun` | Monitor mode: emit only permits not seen before. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "jurisdictions": [
    "overland-park-ks",
    "southlake-tx"
  ],
  "issuedWithinDays": 7,
  "maxResultsPerJurisdiction": 25,
  "maxSecondsPerJurisdiction": 900,
  "includeDetails": false,
  "onlyNewSinceLastRun": false,
  "includeRaw": false
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
    "owlabee-accela-energov-permit-scraper": {
      "url": "https://mcp.apify.com/?tools=owlabee/accela-energov-permit-scraper",
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
    "owlabee-accela-energov-permit-scraper": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/accela-energov-permit-scraper",
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
  "jurisdiction": "hernando-county-fl",
  "jurisdictionName": "Hernando County, FL",
  "permitNumber": "ELER-000154-2026",
  "permitType": "General Electric - Residential",
  "status": "Issued",
  "appliedDate": "2026-10-14T10:40:15",
  "issuedDate": "2026-10-16T15:12:23",
  "estimatedCost": 3630,
  "address": "1234 Example Ave, SPRING HILL, FL, 34606",
  "contractorName": "RIVERA'S ELECTRIC INC.",
  "sourceUrl": "https://hernandocountyfl-energovweb.tylerhost.net/apps/selfservice#/permit/8c0f…",
  "fetchedAt": "2026-10-17T10:50:12.345Z",
  "isNew": true
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
