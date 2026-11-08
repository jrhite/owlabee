# Website Change Monitor — Sitemap Monitor & Page Diff

Apify Store: [apify.com/owlabee/website-change-monitor](https://apify.com/owlabee/website-change-monitor) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/sitemap-change-monitor/](https://owlabee.com/sitemap-change-monitor/)

No-code recipe: [Website Change Alerts in Slack with n8n](https://owlabee.com/website-changes-slack-n8n/)

Discovers every page of a site through its sitemaps (robots.txt, sitemap indexes, gzipped and text sitemaps). Discover mode lists the URLs with lastmod. Monitor mode keeps a snapshot per site and reports new, removed, lastmod-changed, content-changed and status-changed pages, with a word-level preview and a severity for each change. No browser is used.

## Inputs that matter

| Field | What it does |
|---|---|
| `sites` | Required. Site or sitemap URLs. |
| `mode` | `discover` lists URLs; `monitor` compares with the previous run. |
| `maxPages` | Max page URLs per site, in sitemap order. |
| `contentSelector` | CSS selectors for the part of the page to hash. |
| `includePatterns` | Keep only matching URLs (globs, regexes or substrings). |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "sites": [
    "https://www.sitemaps.org/sitemap.xml"
  ],
  "mode": "discover",
  "maxPages": 15
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
    "owlabee-website-change-monitor": {
      "url": "https://mcp.apify.com/?tools=owlabee/website-change-monitor",
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
    "owlabee-website-change-monitor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/website-change-monitor",
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
  "changeType": "discovered",
  "url": "https://www.sitemaps.org/protocol.html",
  "lastmod": "2022-12-15",
  "detectedAt": "2026-10-16T12:49:14.231Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
