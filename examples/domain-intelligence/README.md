# SPF, DMARC & DKIM Checker — Bulk Domain WHOIS, DNS & SSL

Apify Store: [apify.com/owlabee/domain-intelligence](https://apify.com/owlabee/domain-intelligence) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://jrhite.github.io/owlabee/spf-dmarc-dkim-checker/](https://jrhite.github.io/owlabee/spf-dmarc-dkim-checker/)

Checks a list of domains and returns one record per domain: RDAP WHOIS registration data, DNS records, SPF, DMARC, DKIM (18 common selectors plus yours), MTA-STS and BIMI with an email security score from 0 to 100, TLS certificate expiry, HTTP security headers and tech stack hints. It uses public RDAP, DNS-over-HTTPS and each domain's own public endpoints.

## Inputs that matter

| Field | What it does |
|---|---|
| `domains` | Required. Domains, URLs or email addresses; deduplicated by registrable domain. |
| `sections` | Any of `whois`, `dns`, `tls`, `http`. Default all four. |
| `dkimSelectors` | Extra DKIM selectors to probe besides the built-in 18. |
| `maxConcurrency` | Domains checked in parallel (1 to 20). |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "domains": [
    "example.com",
    "apify.com",
    "github.com"
  ],
  "sections": [
    "whois",
    "dns",
    "tls",
    "http"
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
    "owlabee-domain-intelligence": {
      "url": "https://mcp.apify.com/?tools=owlabee/domain-intelligence",
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
    "owlabee-domain-intelligence": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/domain-intelligence",
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
  "domain": "github.com",
  "fetchedAt": "2026-10-16T12:00:00.000Z",
  "registrar": "MarkMonitor Inc.",
  "expirationDate": "2026-10-09T18:20:50.000Z",
  "mxProviderGuess": "google",
  "dmarcPolicy": "reject",
  "tlsDaysUntilExpiry": 112,
  "httpStatusCode": 200,
  "techHints": [
    "Stripe"
  ],
  "emailSecurityScore": 95,
  "summary": "github.com: registered via MarkMonitor Inc., expires in 358 days; MX google, SPF ok (~all), DMARC reject, DKIM google/pm, MTA-STS; email …"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
