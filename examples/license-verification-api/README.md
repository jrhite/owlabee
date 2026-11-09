# License Verification API — 7 States + NPI Registry

Apify Store: [apify.com/owlabee/license-verification-api](https://apify.com/owlabee/license-verification-api) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/professional-license-verification/](https://owlabee.com/professional-license-verification/)

Looks up professional licenses by license number, or by name within one board, in Texas TDLR, Florida DBPR, Colorado DORA, Washington DOH and the federal NPI Registry, plus six opt-in boards (Texas Board of Nursing, Texas Medical Board, Texas Real Estate Commission, Connecticut eLicense, New Jersey MyLicense and Michigan LARA), and returns one normalized record per license with a normalized status, expiration date and a link to the source; the board's disciplinary fields come on request. Verify mode adds `verified` and plain-English notes.

## Inputs that matter

| Field | What it does |
|---|---|
| `queries` | One-line queries such as `TX:3365:Master Electrician`, `name:Jane Smith:FL` or `npi:1003000126`. |
| `lookups` | Structured alternative to `queries`. |
| `mode` | `lookup` or `verify`. |
| `sources` | `TX_TDLR`, `FL_DBPR`, `CO_DORA`, `WA_DOH`, `NPI` (the default), plus opt-in `TX_BON`, `TX_TMB`, `TX_TREC`, `CT_ELICENSE`, `NJ_MYLICENSE`, `MI_LARA`. |
| `maxResultsPerQuery` | Cap per query across sources (1 to 200). |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "queries": [
    "npi:1003000126",
    "name:John Smith:TX"
  ],
  "lookups": [],
  "mode": "verify",
  "sources": [
    "TX_TDLR",
    "FL_DBPR",
    "CO_DORA",
    "WA_DOH",
    "NPI"
  ],
  "maxResultsPerQuery": 5,
  "maxResults": 20,
  "monitor": false
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
    "owlabee-license-verification-api": {
      "url": "https://mcp.apify.com/?tools=owlabee/license-verification-api",
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
    "owlabee-license-verification-api": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/license-verification-api",
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
  "state": "TX",
  "board": "TDLR",
  "source": "TX_TDLR",
  "licenseNumber": "3365",
  "licenseType": "Master Electrician",
  "status": "ACTIVE",
  "holderName": "Womack, Thomas F",
  "businessName": null,
  "expirationDate": "2027-03-19",
  "disciplinaryActionFlag": null,
  "sourceUrl": "https://www.tdlr.texas.gov/LicenseSearch/",
  "fetchedAt": "2026-10-16T13:18:49.662Z",
  "verified": true
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
