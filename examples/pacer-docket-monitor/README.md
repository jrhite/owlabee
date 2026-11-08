# PACER RSS Docket Monitor — New Federal Court Filings

Apify Store: [apify.com/owlabee/pacer-docket-monitor](https://apify.com/owlabee/pacer-docket-monitor) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/pacer-rss-docket-monitor/](https://owlabee.com/pacer-rss-docket-monitor/)

No-code recipe: [Get New PACER Docket Entries in Slack with Zapier](https://owlabee.com/pacer-docket-alerts-slack-zapier/)

Reads the free public RSS feeds that federal district and bankruptcy courts, the Court of Federal Claims, the Court of International Trade and courts of appeals publish from CM/ECF, normalizes every docket entry, and filters by party name, case number, case type, entry type, keyword or bankruptcy chapter. Monitor mode flags only entries that are new since the last run. An optional pass reads older dockets from the RECAP archive through the CourtListener API.

## Inputs that matter

| Field | What it does |
|---|---|
| `courts` | Required. CM/ECF court codes such as `nysd`, `deb`, `ca4` or `cofc`; `all` (district and bankruptcy), `all-district`, `all-bankruptcy`, `all-appellate`, `all-national`; or state codes. |
| `partyKeywords` | Keep entries whose case title contains any of these. |
| `entryTypes` | For example `complaint`, `petition`, `motion`, `order`. |
| `newCasesOnly` | Keep only document number 1 of a case. |
| `onlyNewSinceLastRun` | Monitor mode: emit only entries not seen before. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "courts": [
    "nysd"
  ],
  "newCasesOnly": false,
  "maxEntriesPerCourt": 40,
  "onlyNewSinceLastRun": false
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
    "owlabee-pacer-docket-monitor": {
      "url": "https://mcp.apify.com/?tools=owlabee/pacer-docket-monitor",
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
    "owlabee-pacer-docket-monitor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/pacer-docket-monitor",
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
  "recordType": "docket-entry",
  "court": "nysd",
  "caseNumber": "1:26-cv-03810",
  "caseTitle": "First-Citizens Bank & Trust Company v. Patriot Bank, N.A.",
  "bankruptcyChapter": null,
  "entryText": "Certificate of Service Other",
  "entryCategory": "notice",
  "documentNumber": 153,
  "docketUrl": "https://ecf.nysd.uscourts.gov/cgi-bin/DktRpt.pl?663583",
  "filedAt": "2026-10-17T07:34:33.000Z",
  "isNew": true,
  "source": "pacer-rss",
  "fetchedAt": "2026-10-17T10:22:00.283Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
