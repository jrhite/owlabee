# Bluesky Monitor & Scraper — Posts, Keywords, Followers

Apify Store: [apify.com/owlabee/bluesky-monitor](https://apify.com/owlabee/bluesky-monitor) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/bluesky-monitor/](https://owlabee.com/bluesky-monitor/)

Searches Bluesky posts by keyword or hashtag and reads profiles, author feeds, followers and following lists from the public AT Protocol API, as flat JSON records. With "Only new since last run" a schedule emits only posts or followers that appeared since the previous run.

## Inputs that matter

| Field | What it does |
|---|---|
| `mode` | Required. `searchPosts`, `profiles`, `authorFeed`, `followers`, `following` or `searchActors`. |
| `queries` | Required. Search terms, hashtags or handles, depending on the mode. |
| `maxResults` | Cap on dataset items across all queries. |
| `sort` | `latest` or `top` (searchPosts only). |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "mode": "authorFeed",
  "queries": [
    "bsky.app"
  ],
  "maxResults": 20,
  "sort": "latest"
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
    "owlabee-bluesky-monitor": {
      "url": "https://mcp.apify.com/?tools=owlabee/bluesky-monitor",
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
    "owlabee-bluesky-monitor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/bluesky-monitor",
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
  "type": "post",
  "query": "apify",
  "authorHandle": "bsky.app",
  "text": "We shipped a new Apify integration today! Try the open API: https://docs.bsky.app",
  "createdAt": "2026-10-15T18:02:11.482Z",
  "likeCount": 310,
  "repostCount": 40,
  "replyCount": 12,
  "quoteCount": 5,
  "hasImages": true,
  "postUrl": "https://bsky.app/profile/bsky.app/post/3l6oveex3ii2l",
  "fetchedAt": "2026-10-16T12:40:32.064Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
