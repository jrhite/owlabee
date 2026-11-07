# OSHA Inspections by Company + EPA Enforcement Report

Apify Store: [apify.com/owlabee/osha-epa-enforcement-report](https://apify.com/owlabee/osha-epa-enforcement-report) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://jrhite.github.io/owlabee/osha-inspections-by-company/](https://jrhite.github.io/owlabee/osha-inspections-by-company/) and [https://jrhite.github.io/owlabee/epa-echo-enforcement/](https://jrhite.github.io/owlabee/epa-echo-enforcement/)

Looks up OSHA inspections with their violations and penalties through the U.S. Department of Labor Data API, and EPA and state enforcement cases recorded in EPA ECHO, by company name, identifier, state or ZIP. Each inspection or case is one normalized record with a name-match confidence, plus an optional per-company summary record. OSHA needs your own free DOL API key; EPA needs none.

## Inputs that matter

| Field | What it does |
|---|---|
| `companies` | Company or establishment names. |
| `identifiers` | `osha:<inspection number>` or `frs:<EPA FRS registry id>`. |
| `state` | Two-letter state code for the site or facility. |
| `sources` | `osha`, `epa`. Default both. |
| `dolApiKey` | Your free DOL Data API key. Required for OSHA only. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "companies": [
    "Tesla"
  ],
  "state": "CA",
  "sources": [
    "epa"
  ]
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
    "owlabee-osha-epa-enforcement-report": {
      "url": "https://mcp.apify.com/?tools=owlabee/osha-epa-enforcement-report",
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
    "owlabee-osha-epa-enforcement-report": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/osha-epa-enforcement-report",
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
  "recordType": "enforcement-case",
  "agency": "EPA",
  "query": "Tesla",
  "entityName": "Tesla Motors, Inc.",
  "city": "FREMONT",
  "state": "CA",
  "actionDate": "2019-03-28",
  "actionType": "Administrative - Formal",
  "status": "Final Order Issued",
  "penaltyUsd": 31000,
  "sourceUrl": "https://echo.epa.gov/enforcement-case-report?id=09-2019-0029",
  "matchConfidence": "medium",
  "fetchedAt": "2026-11-01T13:01:08.211Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
