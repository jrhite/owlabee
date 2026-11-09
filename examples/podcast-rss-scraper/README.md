# Podcast RSS Scraper — Episodes, Transcripts & Apple Podcasts

Apify Store: [apify.com/owlabee/podcast-rss-scraper](https://apify.com/owlabee/podcast-rss-scraper) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/podcast-rss-feed-scraper/](https://owlabee.com/podcast-rss-feed-scraper/)

Turns podcast RSS feeds, Apple Podcasts show links or search terms into show and episode records: title, publish date, duration, audio URL, chapters and Podcasting 2.0 transcript links, with optional transcript text and JSON chapters. Opt-in inputs read Apple's top-shows charts, fyyd.de and gpodder.net directory searches, and Podcast Index GUIDs (with your own free Podcast Index key). No browser and no login.

## Inputs that matter

| Field | What it does |
|---|---|
| `feeds` | Required. RSS feed URLs, Apple Podcasts show URLs, `search:` terms, `charts:us`, `fyyd:` or `gpodder:` terms, or `pi:` Podcast Index GUIDs. |
| `maxEpisodesPerFeed` | Newest-first cap on episode records per feed. |
| `fetchTranscripts` | Download each episode's transcript and attach the text. |
| `fetchChapters` | Download each episode's Podcasting 2.0 JSON chapters file. |
| `onlyNewSinceLastRun` | Return only episodes not seen before. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "feeds": [
    "https://feeds.npr.org/510318/podcast.xml",
    "https://podnews.net/rss"
  ],
  "maxEpisodesPerFeed": 10
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
    "owlabee-podcast-rss-scraper": {
      "url": "https://mcp.apify.com/?tools=owlabee/podcast-rss-scraper",
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
    "owlabee-podcast-rss-scraper": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/podcast-rss-scraper",
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
  "feedUrl": "https://podnews.net/rss",
  "showTitle": "Podnews Daily - podcast industry and podcasting news",
  "title": "PAVE Studios shows head to Disney+ and Hulu",
  "pubDate": "2026-10-16T10:09:41.000Z",
  "durationSeconds": 291,
  "audioUrl": "https://op3.dev/e,pg=9b024349-ccf0-5f69-a609-6b82873eab3c/podnews.net/audio/podnews261016.mp3",
  "link": "https://podnews.net/update/pave-disney-hulu-clues",
  "transcriptUrl": "https://podnews.net/audio/podnews261016.mp3.vtt",
  "transcriptFormat": "vtt",
  "transcriptWords": 730,
  "fetchedAt": "2026-10-16T13:13:06.512Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
