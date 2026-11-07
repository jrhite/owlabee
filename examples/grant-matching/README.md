# Grant Matching & RFP Bid/No-Bid Scorer (AI) — Grants.gov

Apify Store: [apify.com/owlabee/grant-matching](https://apify.com/owlabee/grant-matching) · Pay per result; see the Store page for current pricing.

Takes a one-time description of your organization, fetches opportunities from Grants.gov, SAM.gov and USAspending (or scores records you supply), and gives each a fit score, a verdict, the reasons behind it and any disqualifiers. The rules scorer needs no model; Claude scoring is available with your own Anthropic key or the hosted tiers.

## Inputs that matter

| Field | What it does |
|---|---|
| `companyProfile` | Required. Name, description, capabilities, NAICS codes, set-asides, locations and keywords. |
| `searchTerms` | Keywords to search in the enabled sources. |
| `sources` | `grantsGov`, `samGov`, `usaspending`. |
| `maxOpportunities` | Cap on opportunities scored per run (1 to 1,000). |
| `scorer` | `rules` (no model), `byok` (your Anthropic key) or `hosted`. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "companyProfile": {
    "name": "Cascadia Civil Engineering",
    "description": "Civil engineering firm with 40 staff, NAICS 541330, SBA small business, serving the Pacific Northwest; past EPA and USDA rural water and wastewater grants.",
    "capabilities": [
      "water infrastructure design",
      "wastewater treatment",
      "stormwater management",
      "rural water systems",
      "environmental engineering"
    ],
    "naicsCodes": [
      "541330",
      "237110"
    ],
    "setAsides": [
      "SBA"
    ],
    "organizationType": "small business",
    "businessSize": "small",
    "locations": [
      "WA",
      "OR",
      "ID"
    ],
    "keywords": [
      "water",
      "wastewater",
      "infrastructure",
      "drinking water",
      "rural"
    ],
    "pastAwards": [
      "EPA Water Infrastructure Improvements for the Nation",
      "USDA Rural Development Water and Waste Disposal"
    ],
    "budgetRange": {
      "min": 50000,
      "max": 5000000
    }
  },
  "searchTerms": [
    "water infrastructure"
  ],
  "sources": [
    "grantsGov"
  ],
  "oppStatuses": [
    "posted"
  ],
  "postedWithinDays": 30,
  "maxOpportunities": 25,
  "scorer": "rules"
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
    "owlabee-grant-matching": {
      "url": "https://mcp.apify.com/?tools=owlabee/grant-matching",
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
    "owlabee-grant-matching": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/grant-matching",
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
  "source": "provided",
  "recordType": "opportunity",
  "title": "Wastewater Treatment Plant Engineering Services",
  "agency": "City of Yakima",
  "closeDate": "2026-12-15",
  "url": "https://example.org/rfp/22",
  "fitScore": 100,
  "fitVerdict": "strong",
  "disqualifiers": [],
  "fitSummary": "Wastewater Treatment Plant Engineering Services (City of Yakima) scores 100/100 for Cascadia Civil Engineering, a strong fit. Matches you…",
  "daysToClose": 59,
  "scoreMethod": "rules",
  "fetchedAt": "2026-10-17T10:26:20.692Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
