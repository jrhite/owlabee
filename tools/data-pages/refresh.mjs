#!/usr/bin/env node
// Refreshes the "free data" snapshots behind owlabee.com/data/ and rebuilds the site.
//
//   APIFY_TOKEN=... node tools/data-pages/refresh.mjs            # every dataset
//   APIFY_TOKEN=... node tools/data-pages/refresh.mjs recalls     # one or more ids
//   node tools/data-pages/refresh.mjs --build-only                 # re-render from the saved snapshots
//
// Each dataset is one or two runs of one of our own Actors on the owlabee Apify account, with a
// small, fixed input and a hard cap of MAX_CHARGE_USD per run (maxTotalChargeUsd; the Actor stops
// cleanly when its event charges reach it). The dataset is read back, every record is cut down to
// an allowlist of fields (no person names, no contact details: see mmm docs/legal/GUARDRAILS.md
// and the notes per dataset below), and the result is written to docs/data/<id>.json. The pages
// are rendered from those files by tools/data-pages.mjs when tools/build-site.mjs runs, which
// this script does at the end.
//
// The token is read from the environment, sent only in the Authorization header, and never
// printed or written anywhere. Zero dependencies (Node 20+). Behind a proxy, run with
// NODE_USE_ENV_PROXY=1 (and NODE_EXTRA_CA_CERTS if the proxy re-signs TLS).
//
// Cadence: the mmm coordinator re-runs this weekly (its daily run does it on Mondays) and
// commits the new snapshots through a PR. There is deliberately no GitHub Actions workflow:
// it would need the Apify token as a repository secret.
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const API = 'https://api.apify.com/v2';
const MAX_CHARGE_USD = 0.1; // per run. Owner's own account, so the events are not billed, but runs stay tiny.
const MEMORY_MB = 512;
const TIMEOUT_SECS = 600;
const root = new URL('../../', import.meta.url);
const outDir = new URL('docs/data/', root);

const clip = (s, n) => (s == null ? null : String(s).length > n ? String(s).slice(0, n - 1).trimEnd() + '…' : String(s));
const pick = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

// Street-level location only: drop the house number, unit and anything after the first comma
// (some portals append city, state and zip), so no row points at one house.
export function streetOnly(address) {
  if (!address) return null;
  let s = String(address).split(',')[0];
  s = s.replace(/\b(apt|apartment|unit|ste|suite|bldg|building|fl|floor|rm|room|lot|spc|space)\b\.?\s*[\w-]*$/i, '');
  s = s.replace(/#\s*[\w-]+/g, '');
  s = s.replace(/^\s*(\d+\s+\d\/\d|\d+[A-Z]?\s*[-–]\s*\d+[A-Z]?|\d+[A-Z]?)\s+/i, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (!s || /^\d/.test(s) || /^(n\/?a|none|unknown|tbd)$/i.test(s)) return null;
  return s;
}

export const DATASETS = {
  recalls: {
    actor: 'product-recall-feed',
    // Two runs so each stays under the cap: the five default US feeds, then the opt-in Canada,
    // UK and EU feeds. FDA publishes enforcement reports weekly, so the US window is 14 days.
    runs: [
      { agencies: ['fda-drug', 'fda-device', 'fda-food', 'nhtsa', 'cpsc'], daysBack: 14, maxResultsPerSource: 6, maxSecondsPerSource: 120, onlyNewSinceLastRun: false, includeRaw: false },
      { agencies: ['health-canada', 'uk-opss', 'uk-mhra', 'uk-fsa', 'eu-safety-gate'], daysBack: 7, maxResultsPerSource: 6, maxSecondsPerSource: 120, onlyNewSinceLastRun: false, includeRaw: false },
    ],
    // Recalls describe products and firms, as the agency publishes them, not people.
    shape: (r) =>
      pick({
        agency: r.agency,
        source: r.source,
        jurisdiction: r.jurisdiction,
        recallId: r.recallId,
        date: r.date,
        title: clip(r.title, 220),
        productType: clip(r.productType, 80),
        productCategory: r.productCategory,
        hazard: clip(r.hazard, 240),
        hazardCategories: Array.isArray(r.hazardCategories) && r.hazardCategories.length ? r.hazardCategories : undefined,
        classification: clip(r.classification, 60),
        severity: r.severity,
        firm: clip(r.firm, 120),
        url: r.url,
      }),
    key: (r) => `${r.source}:${r.recallId}`,
    sort: (a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')),
  },
  grants: {
    actor: 'grants-gov-api',
    // Grants.gov OR-matches the words of one keyword, so one broad keyword is one search.
    // The state and local datasets match a keyword as full text, so they get two short ones,
    // one run per dataset so a busy one (Los Angeles) cannot use up the others' share.
    runs: [
      { keywords: ['research health education community infrastructure housing energy'], sources: ['grantsGov'], oppStatuses: ['posted', 'forecasted'], postedWithinDays: 7, maxResults: 80, fetchDetails: false, includeRecentAwards: false, onlyNewSinceLastRun: false },
      { keywords: ['services', 'construction'], sources: ['sled'], sledJurisdictions: ['la-city'], postedWithinDays: 14, maxResults: 20, fetchDetails: false, includeRecentAwards: false, onlyNewSinceLastRun: false },
      { keywords: ['services', 'construction'], sources: ['sled'], sledJurisdictions: ['montgomery-md'], postedWithinDays: 14, maxResults: 20, fetchDetails: false, includeRecentAwards: false, onlyNewSinceLastRun: false },
      { keywords: ['services', 'construction'], sources: ['sled'], sledJurisdictions: ['delaware'], postedWithinDays: 14, maxResults: 20, fetchDetails: false, includeRecentAwards: false, onlyNewSinceLastRun: false },
    ],
    // Opportunities only. Agency points of contact, vendors, recipients and principal
    // investigators are left out: the page lists what is open, not who is behind it.
    shape: (r) =>
      pick({
        source: r.source,
        level: r.level,
        jurisdiction: r.jurisdiction,
        state: r.state,
        dataset: r.dataset,
        datasetUrl: r.datasetUrl,
        noticeType: r.noticeType,
        opportunityId: r.opportunityId,
        number: r.number ?? r.solicitationNumber,
        title: clip(r.title, 220),
        agency: clip(r.agency, 120),
        status: r.status,
        postedDate: r.postedDate ? String(r.postedDate).slice(0, 10) : null,
        closeDate: r.closeDate ? String(r.closeDate).slice(0, 10) : null,
        url: r.url,
      }),
    keep: (r) => r.recordType !== 'award',
    key: (r) => `${r.source}:${r.opportunityId}`,
    sort: (a, b) => String(b.postedDate ?? '').localeCompare(String(a.postedDate ?? '')),
  },
  permits: {
    actor: 'building-permits-scraper',
    // Two runs of five US cities, seven newest permits each, to stay under the cap.
    runs: [
      { jurisdictions: ['nyc', 'chicago', 'san-francisco', 'seattle', 'raleigh'], issuedWithinDays: 7, maxResultsPerJurisdiction: 7, maxSecondsPerJurisdiction: 120, onlyNewSinceLastRun: false, includeRaw: false },
      { jurisdictions: ['austin', 'boston', 'nashville', 'denver-residential', 'columbus'], issuedWithinDays: 7, maxResultsPerJurisdiction: 7, maxSecondsPerJurisdiction: 120, onlyNewSinceLastRun: false, includeRaw: false },
    ],
    // US jurisdictions only. No owner, applicant or contractor names (the Actor returns them as
    // the city publishes them; this page does not), no phone, no coordinates or parcel ids, no
    // work description (free text can name people), and the site address cut to street level.
    shape: (r) =>
      pick({
        jurisdiction: r.jurisdiction,
        jurisdictionName: r.jurisdictionName,
        city: r.city,
        state: r.state,
        permitNumber: r.permitNumber,
        permitType: clip(r.permitType, 80),
        permitSubtype: clip(r.permitSubtype, 80),
        status: clip(r.status, 40),
        issuedDate: r.issuedDate ? String(r.issuedDate).slice(0, 10) : null,
        estimatedCost: typeof r.estimatedCost === 'number' ? r.estimatedCost : null,
        street: streetOnly(r.address),
      }),
    keep: (r) => r.country === 'US',
    key: (r) => `${r.jurisdiction}:${r.permitNumber}`,
    sort: (a, b) => String(b.issuedDate ?? '').localeCompare(String(a.issuedDate ?? '')),
  },
};

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path.split('?')[0]}: HTTP ${res.status} ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function runActor(name, input, token) {
  const qs = new URLSearchParams({ maxTotalChargeUsd: String(MAX_CHARGE_USD), memory: String(MEMORY_MB), timeout: String(TIMEOUT_SECS), waitForFinish: '60' });
  let run = (await api(`/acts/owlabee~${name}/runs?${qs}`, { method: 'POST', body: input, token })).data;
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
    run = (await api(`/actor-runs/${run.id}?waitForFinish=60`, { token })).data;
  }
  const items = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await api(`/datasets/${run.defaultDatasetId}/items?clean=true&format=json&limit=1000&offset=${offset}`, { token });
    items.push(...page);
    if (page.length < 1000) break;
  }
  return { run, items };
}

async function refresh(id, token) {
  const d = DATASETS[id];
  const items = [];
  const runs = [];
  for (const input of d.runs) {
    const { run, items: got } = await runActor(d.actor, input, token);
    items.push(...got);
    runs.push(run);
    console.log(`${id}: ${d.actor} run ${run.status}, ${got.length} items, platform usage $${(run.usageTotalUsd ?? 0).toFixed(4)}, events ${JSON.stringify(run.chargedEventCounts ?? {})}`);
  }
  const errors = items.filter((r) => r.error);
  const seen = new Set();
  const records = [];
  for (const r of items) {
    if (r.error || (d.keep && !d.keep(r))) continue;
    const k = d.key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    records.push(d.shape(r));
  }
  records.sort(d.sort);
  const snapshot = {
    dataset: id,
    actor: d.actor,
    storeUrl: `https://apify.com/owlabee/${d.actor}`,
    generatedAt: new Date().toISOString(),
    runStatus: runs.every((r) => r.status === 'SUCCEEDED') ? 'SUCCEEDED' : runs.map((r) => r.status).join(','),
    inputs: d.runs,
    sourcesFailed: [...new Set(errors.map((e) => e.source ?? e.agency ?? e.jurisdiction ?? e.dataset).filter(Boolean))],
    count: records.length,
    records,
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(new URL(`${id}.json`, outDir), JSON.stringify(snapshot, null, 1) + '\n');
  const usd = runs.reduce((t, r) => t + (r.usageTotalUsd ?? 0), 0);
  console.log(`${id}: ${items.length} items -> ${records.length} records, ${errors.length} error items, platform usage $${usd.toFixed(4)}`);
  return usd;
}

async function main(args) {
  if (!args.includes('--build-only')) {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
      console.error('APIFY_TOKEN is not set. Export it (never commit it), or pass --build-only.');
      process.exit(1);
    }
    const ids = args.filter((a) => !a.startsWith('--'));
    for (const id of ids) if (!DATASETS[id]) throw new Error(`unknown dataset ${id}; one of ${Object.keys(DATASETS).join(', ')}`);
    let total = 0;
    let failed = 0;
    for (const id of ids.length ? ids : Object.keys(DATASETS)) {
      try {
        total += await refresh(id, token);
      } catch (e) {
        failed++;
        console.error(`${id}: ${e.message}`);
      }
    }
    console.log(`total platform usage $${total.toFixed(4)}`);
    if (failed) process.exitCode = 1;
  }
  const build = spawnSync(process.execPath, [new URL('tools/build-site.mjs', root).pathname], { stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

// Run only when executed, not when imported (tests and the page renderer import streetOnly).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main(process.argv.slice(2));
