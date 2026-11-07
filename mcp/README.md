# MCP Registry entries

Each folder holds one `server.json` listed in the [official MCP Registry](https://registry.modelcontextprotocol.io) under `io.github.jrhite`. Each entry points to Apify's hosted MCP server (`https://mcp.apify.com`) with a fixed set of owlabee Actors as tools. The server itself is run by Apify, not by us. Clients authenticate with their own Apify API token, and runs are billed per result to that Apify account.

| Entry | Actors |
| --- | --- |
| `us-public-records` | building permits, Accela/EnerGov permits, Grants.gov & SAM.gov, grant fit scorer, OSHA/EPA enforcement, product recalls, license verification, PACER dockets |
| `web-monitoring` | SPF/DMARC/WHOIS checker, website change monitor, Shopify catalog monitor, ATS hiring signals, Bluesky monitor, podcast RSS |
| `documents-to-data` | PDF to Markdown, document to JSON, podcast summarizer, drone roof inspection report |

To update an entry, edit its `server.json`, bump `version`, merge to `main`, then run the **Publish to MCP Registry** workflow (Actions tab → Run workflow). It signs in with GitHub OIDC, so no secret is stored.
