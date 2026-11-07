# AI Drone Roof Inspection Report — Findings & Repair Scope

Apify Store: [apify.com/owlabee/drone-roof-inspection-report](https://apify.com/owlabee/drone-roof-inspection-report) · Pay per result; see the Store page for current pricing.

Turns drone and ground photos of roofs into a per-building inspection report: photos grouped into buildings by GPS and time, defect findings per photo, a condition grade and a repair scope priced from your own price list, plus a Markdown report and a contact sheet. The rules analyzer indexes photos without a model; Claude vision is available with your own Anthropic key or the hosted tiers.

## Inputs that matter

| Field | What it does |
|---|---|
| `imageUrls` | Required. Roof photo URLs, in the order you want them numbered. |
| `analyzer` | `rules` (no model), `byok` (your Anthropic key) or `hosted`. |
| `priceList` | Optional. Your own materials and labor prices for the estimate. |
| `buildings` | Optional. Which photos belong to which building. |

The full list of fields, defaults and limits is on the Store page under **Input**. [`input.json`](input.json) holds the Actor's own quick-start input, which every script here sends:

```json
{
  "imageUrls": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/US_Navy_070706-N-3832S-057_Cyptologic_Technician_Technical_1st_Class_Jason_Guidry_nails_shingles_onto_the_roof_of_a_house_during_a_community_relations_project_with_Habitat_for_Humanity.jpg/960px-US_Navy_070706-N-3832S-057_Cyptologic_Technician_Technical_1st_Class_Jason_Guidry_nails_shingles_onto_the_roof_of_a_house_during_a_community_relations_project_with_Habitat_for_Humanity.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/US_Navy_090611-N-9712C-001_Aviation_Electronics_Technician_2nd_Class_Sonny_Abernathy_nails_shingles_to_the_roof_of_a_Habitat_for_Humanity_house.jpg/960px-US_Navy_090611-N-9712C-001_Aviation_Electronics_Technician_2nd_Class_Sonny_Abernathy_nails_shingles_to_the_roof_of_a_Habitat_for_Humanity_house.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Staggered_planks_on_the_roof_referred_to_as_%22skip_sheathing%22_forms_the_surface_for_new_cedar_shingles_to_be_attached_to_the_roof._%283d6d81ed-74ae-4577-b77a-8f05e2b5c48b%29.jpg/960px-Staggered_planks_on_the_roof_referred_to_as_%22skip_sheathing%22_forms_the_surface_for_new_cedar_shingles_to_be_attached_to_the_roof._%283d6d81ed-74ae-4577-b77a-8f05e2b5c48b%29.jpg"
  ],
  "analyzer": "rules"
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
    "owlabee-drone-roof-inspection-report": {
      "url": "https://mcp.apify.com/?tools=owlabee/drone-roof-inspection-report",
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
    "owlabee-drone-roof-inspection-report": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com/?tools=owlabee/drone-roof-inspection-report",
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
  "recordType": "photo",
  "photoNumber": 3,
  "url": "https://example.com/inspections/oak-ridge/DJI_0003.JPG",
  "buildingLabel": "Building 1",
  "analysisMethod": "hosted",
  "view": "close-up",
  "summary": "South slope near the eave; several missing tabs and a lifted row next to the plumbing vent.",
  "findingCount": 2,
  "confidence": 0.78,
  "fetchedAt": "2026-10-19T09:12:44.118Z"
}
```

This sample comes from a Claude vision run. The rules analyzer in `input.json` indexes photos and groups them into buildings but leaves findings empty.

Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
