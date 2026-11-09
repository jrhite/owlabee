# Product Recall Feed — FDA, NHTSA & CPSC Recalls API

Apify Store: [apify.com/owlabee/product-recall-feed](https://apify.com/owlabee/product-recall-feed) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/product-recalls-api/](https://owlabee.com/product-recalls-api/)

No-code recipe: [FDA, NHTSA and CPSC Product Recalls to Email with n8n](https://owlabee.com/product-recalls-email-n8n/)

Pulls US product recalls from openFDA enforcement reports, NHTSA and CPSC through their official public APIs, and on request recalls and alerts from Health Canada (with CFIA and Transport Canada), the UK (OPSS, MHRA, FSA) and the EU Safety Gate, and writes each recall in one normalized record: agency, recall id, date, product, hazard, classification, firm, remedy and a link to the official notice. Filter by date, keyword, firm, product type or vehicle; changes mode emits only recalls not seen before.

## Inputs that matter

| Field | What it does |
|---|---|
| `agencies` | `fda-drug`, `fda-device`, `fda-food`, `nhtsa`, `cpsc` (the default five), plus opt-in feeds such as `health-canada`, `uk-fsa` or `eu-safety-gate`. |
| `jurisdictions` | `US`, `CA`, `GB`, `EU`: adds every feed of each. |
| `daysBack` | Window ending today (1 to 3650). Default 30. |
| `keyword` | Product, description or hazard text. |
| `vehicles` | NHTSA lookups, one per line: `make, model, year`. |
| `maxResultsPerSource` | Newest-first cap per feed. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "agencies": [
    "fda-drug",
    "fda-device",
    "fda-food",
    "nhtsa",
    "cpsc"
  ],
  "daysBack": 30,
  "maxResultsPerSource": 5
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
    "owlabee-product-recall-feed": {
      "url": "https://mcp.apify.com/?tools=owlabee/product-recall-feed",
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
    "owlabee-product-recall-feed": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/product-recall-feed",
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
  "agency": "CPSC",
  "source": "cpsc",
  "recallId": "27055",
  "date": "2026-10-29",
  "title": "Bodum USA Recalls 5.9 Million French Press Coffee Makers with Replaceable Glass Carafes Due to Risk of Serious Burn Injury",
  "hazard": "The carafe can unexpectedly break during use if the glass carafe is damaged or cracked, including by use of a metal spoon to stir the cof…",
  "severity": null,
  "firm": "Bodum USA, Inc., of New York, New York",
  "url": "https://cpsc.gov/Recalls/2027/Bodum-USA-Recalls-5-9-Million-French-Press-Coffee-Makers-with-Replaceable-Glass-Carafes-Due-to-Risk-of-Seri…",
  "fetchedAt": "2026-11-01T12:55:01.288Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
