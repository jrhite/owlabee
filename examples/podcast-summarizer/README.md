# Podcast Episode Summarizer (AI) — Transcript to Summary

Apify Store: [apify.com/owlabee/podcast-summarizer](https://apify.com/owlabee/podcast-summarizer) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/podcast-summarizer/](https://owlabee.com/podcast-summarizer/)

Summarizes podcast episodes from RSS feeds or Apple Podcasts links: abstract, key topics, timestamped chapters, quotes, guests and action items, built from the episode's Podcasting 2.0 transcript (show notes when there is none). The extractive mode needs no model; Claude summaries are available with your own Anthropic key or the hosted tiers.

## Inputs that matter

| Field | What it does |
|---|---|
| `feeds` | Required. RSS feeds or Apple Podcasts links. |
| `maxEpisodesPerFeed` | Newest-first cap on episodes per feed. |
| `summarizer` | `extractive` (no model), `byok` (your Anthropic key) or `hosted`. |
| `episodes` | Specific episode GUIDs or URLs. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "feeds": [
    "https://podnews.net/rss"
  ],
  "maxEpisodesPerFeed": 2,
  "summarizer": "extractive"
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
    "owlabee-podcast-summarizer": {
      "url": "https://mcp.apify.com/?tools=owlabee/podcast-summarizer",
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
    "owlabee-podcast-summarizer": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/podcast-summarizer",
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
  "recordType": "episode",
  "showTitle": "Podnews Daily - podcast industry and podcasting news",
  "title": "PAVE Studios shows head to Disney+ and Hulu",
  "pubDate": "2026-10-16T10:09:41.000Z",
  "durationSeconds": 291,
  "transcriptSource": "transcript",
  "summaryMethod": "extractive",
  "summary": {
    "abstract": "Meanwhile, in Australia, podcast publisher Mammamia is to make it to Samsung TV Plus as a streaming TV channel. YouTube leads in almost e…",
    "keyTopics": [
      "adam curry",
      "youtube short",
      "samsung tv"
    ],
    "chapters": [
      {
        "title": "Adam Curry & Youtube Short",
        "summary": "YouTube leads in almost every territory, with 32% market share globally, and added 27 million users in 2025, suggests the research.",
        "startTime": 0,
        "startTimestamp": "0:00"
      },
      {
        "title": "Apple & Norway",
        "summary": "And in podcast news, the Vardø Witch Trials, an independent English-language documentary about Norway's deadliest witch hunt, is number o…",
        "startTime": 157,
        "startTimestamp": "2:37"
      }
    ],
    "notableQuotes": [
      {
        "quote": "Adam Curry is to step back from No Agenda, with the show on October the 29th being his last.",
        "speaker": "James Cridland",
        "timestamp": "1:29"
      },
      {
        "quote": "YouTube is readying an AI-powered tool that'll take a clip of audio and make it into a YouTube short, according to YouTube's Emma Sweet.",
        "speaker": "James Cridland",
        "timestamp": "2:01"
      }
    ],
    "namedGuests": [
      "Adam Curry"
    ],
    "actionItems": [
      "You can find out more with a link in our show notes."
    ]
  },
  "fetchedAt": "2026-10-16T15:33:45.237Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
