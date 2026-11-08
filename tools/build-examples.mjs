#!/usr/bin/env node
// Generates examples/<actor>/ (README.md, input.json, curl.sh, python.py, node.mjs, mcp.json)
// and the Actor table in the root README.md. Zero dependencies: `node tools/build-examples.mjs`.
import { mkdirSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { actors, storeUrl, apiUrl, mcpUrl } from './actors.mjs';
import { BASE_URL } from './site-config.mjs';
import { pages } from './site-content.mjs';

const root = new URL('../', import.meta.url);
const json = (v) => JSON.stringify(v, null, 2) + '\n';

for (const a of actors) {
  const dir = new URL(`examples/${a.name}/`, root);
  mkdirSync(dir, { recursive: true });
  const w = (file, text) => writeFileSync(new URL(file, dir), text);

  w('input.json', json(a.input));

  w('curl.sh', `#!/usr/bin/env bash
# Run ${a.title}
# (owlabee/${a.name}) once and print its dataset items as JSON.
# Needs curl 7.76+ and your Apify API token in APIFY_TOKEN.
# Short runs only: the sync endpoint waits up to 300 seconds. Use python.py or node.mjs for longer runs.
set -euo pipefail
: "\${APIFY_TOKEN:?Set APIFY_TOKEN to your Apify API token}"
cd "$(dirname "$0")"

curl -sS --fail-with-body -X POST \\
  "${apiUrl(a.name)}" \\
  -H "Authorization: Bearer \${APIFY_TOKEN}" \\
  -H "Content-Type: application/json" \\
  --data @input.json
`);
  chmodSync(new URL('curl.sh', dir), 0o755);

  w('python.py', `"""Run ${a.title} (owlabee/${a.name}) once and print each dataset item.

Setup:  pip install apify-client
Token:  export APIFY_TOKEN=<your Apify API token>
"""
import json
import os
from pathlib import Path

from apify_client import ApifyClient

ACTOR_ID = "owlabee/${a.name}"

token = os.environ.get("APIFY_TOKEN")
if not token:
    raise SystemExit("Set APIFY_TOKEN to your Apify API token")

run_input = json.loads((Path(__file__).parent / "input.json").read_text(encoding="utf-8"))

client = ApifyClient(token)
run = client.actor(ACTOR_ID).call(run_input=run_input)
if run is None:
    raise SystemExit("The run did not start")
print(f"Run {run['id']} finished with status {run['status']}")

for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(json.dumps(item, ensure_ascii=False))
`);

  w('node.mjs', `// Run ${a.title} (owlabee/${a.name}) once and print the dataset items.
// Setup: npm install apify-client
// Token: export APIFY_TOKEN=<your Apify API token>
import { readFile } from 'node:fs/promises';
import { ApifyClient } from 'apify-client';

const ACTOR_ID = 'owlabee/${a.name}';

const token = process.env.APIFY_TOKEN;
if (!token) throw new Error('Set APIFY_TOKEN to your Apify API token');

const input = JSON.parse(await readFile(new URL('./input.json', import.meta.url), 'utf8'));

const client = new ApifyClient({ token });
const run = await client.actor(ACTOR_ID).call(input);
console.log(\`Run \${run.id} finished with status \${run.status}\`);

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(JSON.stringify(items, null, 2));
`);

  w('mcp.json', json({
    mcpServers: {
      [`owlabee-${a.name}`]: {
        url: mcpUrl(a.name),
        headers: { Authorization: 'Bearer ${APIFY_TOKEN}' },
      },
    },
  }));

  w('README.md', exampleReadme(a));
}

function exampleReadme(a) {
  const guides = a.page ? [a.page] : a.pages ?? [];
  const guideLines = guides.length
    ? `\nGuide on the site: ${guides.map((p) => `[${BASE_URL}${p}/](${BASE_URL}${p}/)`).join(' and ')}\n`
    : '';
  const recipes = pages.filter((p) => p.kind === 'integration' && p.actor === a.name);
  const recipeLines = recipes.length
    ? `\nNo-code recipe${recipes.length > 1 ? 's' : ''}: ${recipes.map((p) => `[${p.title}](${BASE_URL}${p.slug}/)`).join(' · ')}\n`
    : '';
  const desktop = {
    mcpServers: {
      [`owlabee-${a.name}`]: {
        command: 'npx',
        args: ['-y', 'mcp-remote', mcpUrl(a.name), '--header', 'Authorization:${AUTH_HEADER}'],
        env: { AUTH_HEADER: 'Bearer <your Apify API token>' },
      },
    },
  };
  return `# ${a.title}

Apify Store: [apify.com/owlabee/${a.name}](${storeUrl(a.name)}) · Pay per result; see the Store page for current pricing.
${guideLines}${recipeLines}
${a.purpose}

## Inputs that matter

| Field | What it does |
|---|---|
${a.keyInputs.map(([f, n]) => `| \`${f}\` | ${n} |`).join('\n')}

The full list of fields, defaults and limits is on the Store page under **Input**. [\`input.json\`](input.json) holds the Actor's own quick-start input, which every script here sends:

\`\`\`json
${JSON.stringify(a.input, null, 2)}
\`\`\`

## Run it

All scripts read your token from the \`APIFY_TOKEN\` environment variable (Apify Console → Settings → API & Integrations). Never commit a token.

\`\`\`bash
export APIFY_TOKEN=<your Apify API token>

./curl.sh                                          # curl, sync endpoint, prints JSON
pip install apify-client && python python.py       # Python client
npm install apify-client && node node.mjs          # Node.js client
\`\`\`

Each run is billed to your Apify account per result. To cap spend, set a maximum total charge for the run in the Console, or pass \`maxTotalChargeUsd\` as a run option.

## Use it from an AI agent (MCP)

[\`mcp.json\`](mcp.json) points an MCP client at Apify's hosted MCP server with only this Actor enabled:

\`\`\`json
${JSON.stringify(JSON.parse(readFileSync(new URL(`examples/${a.name}/mcp.json`, root), 'utf8')), null, 2)}
\`\`\`

Clients differ in how they expand environment variables in this file: Claude Code reads \`\${APIFY_TOKEN}\` from your environment and Cursor uses \`\${env:APIFY_TOKEN}\`. Otherwise, put the token in your local copy of the file and keep that copy out of version control. For Claude Desktop, which starts local servers, bridge through \`mcp-remote\`:

\`\`\`json
${JSON.stringify(desktop, null, 2)}
\`\`\`

## Sample output

One dataset item, shortened to the main fields (from the Actor's README):

\`\`\`json
${JSON.stringify(a.sample, null, 2)}
\`\`\`
${a.sampleNote ? `\n${a.sampleNote}\n` : ''}
Field values come from the public source as published. Check the source record (the link in each item) before relying on a value.

---

Example code in this folder is MIT licensed. owlabee is an independent developer on Apify Store, not affiliated with Apify or with any agency or company named here.
`;
}

// Root README Actor table, between markers.
const readmeUrl = new URL('README.md', root);
const readme = readFileSync(readmeUrl, 'utf8');
const rows = actors
  .map((a) => `| [${a.title}](${storeUrl(a.name)}) | ${a.returns} | [examples/${a.name}](examples/${a.name}/) |`)
  .join('\n');
const table = `| Actor | What it returns | Examples |\n|---|---|---|\n${rows}`;
const next = readme
  .replace(/<!-- actors -->[\s\S]*?<!-- \/actors -->/, `<!-- actors -->\n${table}\n<!-- /actors -->`)
  .replace(/<!-- count -->[\s\S]*?<!-- \/count -->/g, `<!-- count -->${actors.length}<!-- /count -->`);
writeFileSync(readmeUrl, next);
console.log(`examples: ${actors.length} Actors written`);
