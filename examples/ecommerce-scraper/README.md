# E-commerce Scraper & Price Monitor — WooCommerce, Magento

Apify Store: [apify.com/owlabee/ecommerce-scraper](https://apify.com/owlabee/ecommerce-scraper) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/ecommerce-price-tracker/](https://owlabee.com/ecommerce-price-tracker/)

Detects a store's platform and reads its catalog the cheapest public way: the WooCommerce Store API, Magento GraphQL, Shopify `products.json`, or, on Squarespace, BigCommerce, Wix and custom stores, the schema.org Product JSON-LD on each product page. Every product or variant becomes one record with price, compare-at price, currency, availability, SKU and image, in the Shopify Catalog Monitor's shape. Changes mode keeps the previous snapshot and writes only price, stock, title and new or removed product changes. No browser, proxy, login or API key.

## Inputs that matter

| Field | What it does |
|---|---|
| `storeUrls` | Store domains or any store URL (or use `productUrls`). |
| `productUrls` | Product pages to watch on any platform, read from their JSON-LD. |
| `mode` | `snapshot` (full catalog) or `changes` (only changes since the last run). |
| `platform` | `auto` (default), `woocommerce`, `magento`, `shopify` or `jsonld`. |
| `maxProductsPerStore` | Cap per store (default 1000). |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "storeUrls": [
    "venia.magento.com",
    "mercantile.wordpress.org"
  ],
  "mode": "snapshot",
  "maxProductsPerStore": 10
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
    "owlabee-ecommerce-scraper": {
      "url": "https://mcp.apify.com/?tools=owlabee/ecommerce-scraper",
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
    "owlabee-ecommerce-scraper": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/ecommerce-scraper",
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
  "storeDomain": "mercantile.wordpress.org",
  "platform": "woocommerce",
  "source": "woocommerce-store-api",
  "productTitle": "Blue WordPress Flannel Button-down",
  "productUrl": "https://mercantile.wordpress.org/product/blue-wordpress-flannel-button-down/",
  "variantTitle": "Adult Unisex MD",
  "sku": "A8C-151-M",
  "price": 48,
  "compareAtPrice": null,
  "currency": "USD",
  "available": true,
  "fetchedAt": "2026-11-09T06:04:35.773Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
