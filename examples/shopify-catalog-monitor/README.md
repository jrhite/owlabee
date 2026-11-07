# Shopify Catalog Monitor & Price Tracker — Products Scraper

Apify Store: [apify.com/owlabee/shopify-catalog-monitor](https://apify.com/owlabee/shopify-catalog-monitor) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://jrhite.github.io/owlabee/shopify-price-tracker/](https://jrhite.github.io/owlabee/shopify-price-tracker/)

Reads the public catalog of a Shopify store from its storefront `products.json` and writes one record per variant (or per product) with price, compare-at price, availability, SKU, options and image. Changes mode keeps the previous snapshot and writes only what changed, with before and after values and the percentage price move.

## Inputs that matter

| Field | What it does |
|---|---|
| `storeUrls` | Required. Store domains or any store URL. |
| `mode` | `snapshot` (full catalog) or `changes` (only changes since the last run). |
| `granularity` | `variant` or `product`. |
| `maxProductsPerStore` | Pagination cap per store. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "storeUrls": [
    "allbirds.com",
    "www.deathwishcoffee.com"
  ],
  "mode": "snapshot",
  "maxProductsPerStore": 100
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
    "owlabee-shopify-catalog-monitor": {
      "url": "https://mcp.apify.com/?tools=owlabee/shopify-catalog-monitor",
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
    "owlabee-shopify-catalog-monitor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/shopify-catalog-monitor",
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
  "recordType": "snapshot",
  "storeDomain": "www.allbirds.com",
  "productTitle": "Wool Runner",
  "productUrl": "https://www.allbirds.com/products/wool-runner",
  "variantTitle": "Natural Grey / 9",
  "price": 98,
  "available": true,
  "fetchedAt": "2026-10-16T12:00:00.000Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
