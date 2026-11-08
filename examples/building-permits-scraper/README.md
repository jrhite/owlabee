# Building Permits Scraper — Roofing & Construction Leads

Apify Store: [apify.com/owlabee/building-permits-scraper](https://apify.com/owlabee/building-permits-scraper) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/building-permits-api/](https://owlabee.com/building-permits-api/)

No-code recipe: [Building Permits to Google Sheets with Make](https://owlabee.com/building-permits-google-sheets-make/)

Pulls building permits from official US open-data portals (Socrata, CKAN, ArcGIS and CARTO APIs) and writes them in one normalized schema: permit number, type, work description, status, dates, estimated cost, address with coordinates and parcel id, and the contractor's name, license and phone where the jurisdiction publishes them. Monitor mode emits only permits not seen on earlier runs.

## Inputs that matter

| Field | What it does |
|---|---|
| `jurisdictions` | Required. Registry ids such as `chicago` or `seattle`, or `all`. |
| `issuedWithinDays` | Only permits issued in the last N days (1 to 3650). |
| `permitTypes` | Words matched against permit type and subtype, for example `roof` or `solar`. |
| `maxResultsPerJurisdiction` | Newest-first cap per jurisdiction. |
| `onlyNewSinceLastRun` | Monitor mode: emit only permits not seen before. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "jurisdictions": [
    "chicago",
    "seattle"
  ],
  "issuedWithinDays": 7,
  "maxResultsPerJurisdiction": 25,
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
    "owlabee-building-permits-scraper": {
      "url": "https://mcp.apify.com/?tools=owlabee/building-permits-scraper",
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
    "owlabee-building-permits-scraper": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/building-permits-scraper",
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
  "jurisdiction": "nyc",
  "jurisdictionName": "New York City, NY",
  "permitNumber": "B01186301-S6-MS",
  "permitType": "Mechanical Systems",
  "status": "Permit Issued",
  "issuedDate": "2026-10-14",
  "estimatedCost": null,
  "address": "280 BERGEN STREET",
  "contractorName": "DEVELOPING NY STATE LLC",
  "contractorPhone": null,
  "sourceUrl": "https://data.cityofnewyork.us/d/rbx6-tga4",
  "fetchedAt": "2026-10-16T13:25:32.995Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
