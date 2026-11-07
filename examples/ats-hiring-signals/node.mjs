// Run Hiring Signals & ATS Jobs Scraper — Greenhouse, Lever, Ashby (owlabee/ats-hiring-signals) once and print the dataset items.
// Setup: npm install apify-client
// Token: export APIFY_TOKEN=<your Apify API token>
import { readFile } from 'node:fs/promises';
import { ApifyClient } from 'apify-client';

const ACTOR_ID = 'owlabee/ats-hiring-signals';

const token = process.env.APIFY_TOKEN;
if (!token) throw new Error('Set APIFY_TOKEN to your Apify API token');

const input = JSON.parse(await readFile(new URL('./input.json', import.meta.url), 'utf8'));

const client = new ApifyClient({ token });
const run = await client.actor(ACTOR_ID).call(input);
console.log(`Run ${run.id} finished with status ${run.status}`);

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(JSON.stringify(items, null, 2));
