#!/usr/bin/env node
// Link check for the generated site in docs/. Zero dependencies.
//
//   node tools/check-links.mjs              # internal links and #anchors, plus sitemap.xml and llms.txt
//   node tools/check-links.mjs --external   # also request every external link once (GET, follows redirects)
//
// Internal: every href/src that points into the site (relative, root-relative or under BASE_URL)
// must resolve to a file in docs/, and every #fragment must match an id on the target page.
// Every sitemap <loc> and every owlabee.com link in llms.txt must resolve too.
// External: reported as failures only for 404/410 and DNS errors; 401/403/429 and timeouts are
// listed as warnings, since many government sites refuse datacenter IPs.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { BASE_URL } from './site-config.mjs';

const docs = new URL('../docs/', import.meta.url);
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const u = new URL(e.name + (e.isDirectory() ? '/' : ''), dir);
    if (e.isDirectory()) walk(u);
    else if (e.name.endsWith('.html')) files.push(u);
  }
})(docs);

const site = new URL(BASE_URL);
const idsCache = new Map();
const idsOf = (fileUrl) => {
  if (!idsCache.has(fileUrl.href)) {
    const html = readFileSync(fileUrl, 'utf8');
    idsCache.set(fileUrl.href, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(fileUrl.href);
};

// Map a URL on the site to the file that serves it, or null.
function fileFor(u) {
  let p = decodeURIComponent(u.pathname).replace(/^\//, '');
  const candidate = new URL(p, docs);
  if (p === '' || p.endsWith('/')) return existsSync(new URL('index.html', candidate)) ? new URL('index.html', candidate) : null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  if (existsSync(new URL(p + '/index.html', docs))) return null; // directory without trailing slash: GitHub Pages redirects, but we want canonical links
  return null;
}

const problems = [];
const external = new Map();
let checked = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const rel = f.href.slice(docs.href.length);
  const pageUrl = new URL(rel.replace(/index\.html$/, ''), site);
  for (const t of html.matchAll(/<[a-z][^>]*>/gi)) {
    if (/\srel="(preconnect|dns-prefetch)"/.test(t[0])) continue; // origins, not pages
    const m = t[0].match(/\s(?:href|src)="([^"]*)"/);
    if (!m) continue;
    const raw = m[1].replace(/&amp;/g, '&');
    if (!raw || raw.startsWith('mailto:') || raw.startsWith('data:') || raw.startsWith('javascript:')) continue;
    let u;
    try {
      u = new URL(raw, pageUrl);
    } catch {
      problems.push(`${rel}: unparseable link ${raw}`);
      continue;
    }
    if (u.host !== site.host) {
      if (/^https?:$/.test(u.protocol)) {
        u.hash = '';
        if (!external.has(u.href)) external.set(u.href, rel);
      }
      continue;
    }
    checked++;
    const target = fileFor(u);
    if (!target) {
      problems.push(`${rel}: broken internal link ${raw}`);
      continue;
    }
    if (u.hash && target.href.endsWith('.html') && !idsOf(target).has(decodeURIComponent(u.hash.slice(1)))) problems.push(`${rel}: missing anchor ${raw}`);
  }
}

for (const [name, re] of [['sitemap.xml', /<loc>([^<]+)<\/loc>/g], ['llms.txt', /\((https?:\/\/[^)\s]+)\)/g]]) {
  const f = new URL(name, docs);
  if (!existsSync(f)) {
    problems.push(`${name} is missing`);
    continue;
  }
  for (const m of readFileSync(f, 'utf8').matchAll(re)) {
    const u = new URL(m[1]);
    if (u.host !== site.host) {
      if (!external.has(u.href)) external.set(u.href, name);
      continue;
    }
    checked++;
    if (!fileFor(u)) problems.push(`${name}: ${m[1]} does not resolve to a file in docs/`);
  }
}

const warnings = [];
if (process.argv.includes('--external')) {
  const urls = [...external.keys()];
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (owlabee link check)' } });
        if (res.status === 404 || res.status === 410) problems.push(`${external.get(url)}: ${url} -> HTTP ${res.status}`);
        else if (res.status >= 400) warnings.push(`${url} -> HTTP ${res.status}`);
        await res.body?.cancel();
      } catch (e) {
        const code = e.cause?.code ?? e.name;
        if (code === 'ENOTFOUND') problems.push(`${external.get(url)}: ${url} -> DNS ${code}`);
        else warnings.push(`${url} -> ${code}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const p of problems) console.log(`FAIL: ${p}`);
console.log(`links: ${files.length} pages, ${checked} internal links checked, ${external.size} external links${process.argv.includes('--external') ? ' requested' : ' (not requested; pass --external)'}, ${problems.length} problems, ${warnings.length} warnings`);
process.exitCode = problems.length ? 1 : 0;
