# Hiring Signals & ATS Jobs Scraper — Greenhouse, Lever, Ashby

Apify Store: [apify.com/owlabee/ats-hiring-signals](https://apify.com/owlabee/ats-hiring-signals) · Pay per result; see the Store page for current pricing.

Reads company job boards on Greenhouse, Lever, Ashby, SmartRecruiters and Workable through their public job-board APIs. Jobs mode writes one normalized record per open role (title, department, location, remote, apply URL). Signals mode compares with the previous snapshot and reports new, removed and changed roles per company.

## Inputs that matter

| Field | What it does |
|---|---|
| `boards` | Job boards such as `greenhouse:stripe` or `lever:spotify`. |
| `companyPreset` | Optional curated list: `ai-labs`, `developer-tools`, `fintech`. |
| `mode` | `jobs` or `signals`. |
| `maxJobsPerBoard` | Cap on job records per board. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "boards": [
    "greenhouse:stripe",
    "lever:spotify"
  ],
  "mode": "jobs",
  "includeDescription": false,
  "maxJobsPerBoard": 50
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
    "owlabee-ats-hiring-signals": {
      "url": "https://mcp.apify.com/?tools=owlabee/ats-hiring-signals",
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
    "owlabee-ats-hiring-signals": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/ats-hiring-signals",
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
  "type": "job",
  "provider": "greenhouse",
  "boardId": "stripe",
  "title": "Senior Backend Engineer, Payments",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "remote": false,
  "postedAt": "2026-09-01T16:00:00.000Z",
  "applyUrl": "https://boards.greenhouse.io/stripe/jobs/4012345007",
  "fetchedAt": "2026-10-16T12:00:00.000Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
