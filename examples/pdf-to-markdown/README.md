# PDF to Markdown for RAG — DOCX, OCR & Chunks

Apify Store: [apify.com/owlabee/pdf-to-markdown](https://apify.com/owlabee/pdf-to-markdown) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/pdf-to-markdown-rag/](https://owlabee.com/pdf-to-markdown-rag/)

Converts PDF, DOCX, HTML, Markdown and text documents from URLs into Markdown with headings, lists, tables and links, plus metadata. Optional heading-aware chunks are ready for embedding, and optional OCR handles scanned pages. No browser and no external API.

## Inputs that matter

| Field | What it does |
|---|---|
| `urls` | Required. Document URLs. |
| `chunk` | Also emit heading-aware chunk records. |
| `ocr` | Run OCR on pages without extractable text. |
| `saveToKeyValueStore` | Also save each document as a `.md` file. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "urls": [
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "https://arxiv.org/pdf/1706.03762v7"
  ],
  "chunk": false,
  "ocr": false,
  "saveToKeyValueStore": false
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
    "owlabee-pdf-to-markdown": {
      "url": "https://mcp.apify.com/?tools=owlabee/pdf-to-markdown",
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
    "owlabee-pdf-to-markdown": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/pdf-to-markdown",
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
  "recordType": "document",
  "url": "https://arxiv.org/pdf/1706.03762v7",
  "filename": "1706.03762v7.pdf",
  "pages": 15,
  "title": null,
  "markdown": "<!-- page 1 -->\n\n# Attention Is All You Need\n\n| Ashish Vaswani∗ | Noam Shazeer∗ | ... |\n\n## Abstract\n\nThe dominant sequence transduction …",
  "words": 6004,
  "tables": 12,
  "fetchedAt": "2026-10-16T13:20:00.000Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
