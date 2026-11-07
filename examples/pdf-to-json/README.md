# PDF & Document to JSON Extractor (AI) — Invoices, Forms

Apify Store: [apify.com/owlabee/pdf-to-json](https://apify.com/owlabee/pdf-to-json) · Pay per result; see the Store page for current pricing.

Guide on the site: [https://owlabee.com/document-to-json/](https://owlabee.com/document-to-json/)

Takes PDF, DOCX or HTML documents by URL plus your own JSON Schema and returns one JSON object per document that matches it, for invoices, contracts, forms and statements. The rules extractor needs no model; Claude extraction is available with your own Anthropic key or the hosted tiers.

## Inputs that matter

| Field | What it does |
|---|---|
| `urls` | Required. Document URLs. |
| `schema` | Required. A JSON Schema (draft-07 subset) of the object you want per document. |
| `extractor` | `rules` (no model), `byok` (your Anthropic key) or `hosted`. |
| `includeMarkdown` | Also return the converted document text. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "urls": [
    "https://www.irs.gov/pub/irs-pdf/fw9.pdf"
  ],
  "schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Title of the form"
      },
      "formNumber": {
        "type": "string",
        "description": "The form number, e.g. W-9 or 1040"
      },
      "revisionDate": {
        "type": "string",
        "format": "date",
        "description": "Revision date of the form"
      },
      "issuer": {
        "type": "string",
        "description": "Agency or organization that issues the form"
      },
      "fields": {
        "type": "array",
        "description": "The numbered fields a filer completes",
        "items": {
          "type": "object",
          "properties": {
            "label": {
              "type": "string"
            },
            "description": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "extractor": "rules",
  "includeMarkdown": false
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
    "owlabee-pdf-to-json": {
      "url": "https://mcp.apify.com/?tools=owlabee/pdf-to-json",
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
    "owlabee-pdf-to-json": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/pdf-to-json",
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
  "url": "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
  "filename": "fw9.pdf",
  "pages": 6,
  "title": "Form W-9 (Rev. March 2024)",
  "extractionMethod": "rules",
  "data": {
    "title": "Form W-9 (Rev. March 2024)",
    "formNumber": "W-9",
    "revisionDate": "2024-03",
    "issuer": "Department of the Treasury",
    "fields": [
      {
        "label": "Name of entity/individual",
        "description": "An entry is required. (For a sole proprietor or disregarded entity, enter the owner’s name on line 1, and enter the business/disregarded …"
      },
      {
        "label": "Business name/disregarded entity name, if different from above",
        "description": null
      },
      {
        "label": "Address (number, street, and apt. or suite no.)",
        "description": "See instructions. Requester’s name and address (optional)"
      }
    ]
  },
  "overallConfidence": 0.58,
  "filledFields": 5,
  "totalFields": 5,
  "fetchedAt": "2026-10-17T10:22:02.464Z"
}
```

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
