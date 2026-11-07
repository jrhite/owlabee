// Renders the owlabee brand kit into brand/ (SVG masters + PNG exports) and the
// per-Actor Apify icons into brand/apify-icons/. Zero dependencies beyond a
// Playwright Chromium (for PNGs) and Python Pillow (for favicon.ico).
//
//   node tools/brand/render.mjs
//
// The mark: two pointy-top honeycomb cells sharing a wall (owl eyes), pupils,
// a gold monocle on the right eye and a honey-drop beak. Palette and type follow
// the brand kit: Cream #FAF7F1, Charcoal #2E2E2E, Gold #C29A45, Gold Deep #8C6A26,
// Sage #7F8E7C, Stone #5E5A55, Linen #F4EDE2, Hairline #E2D3B5; Jost + Cormorant Garamond.
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

export const C = {
    cream: '#FAF7F1', charcoal: '#2E2E2E', gold: '#C29A45', goldDeep: '#8C6A26',
    sage: '#7F8E7C', stone: '#5E5A55', linen: '#F4EDE2', hairline: '#E2D3B5',
};
const FONTS = 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,400;1,500&display=swap';

/**
 * The mark as an SVG string. `detail`: 'full' (monocle + chain), 'monocle' (no chain),
 * 'eyes' (no monocle), 'bare' (no monocle, no beak). Stroke weights grow as detail drops,
 * so small sizes stay legible.
 */
export function mark({ line = C.charcoal, accent = C.gold, detail = 'full', size = 100, title = 'owlabee' } = {}) {
    const sw = { full: 4.5, monocle: 5, eyes: 7, bare: 9 }[detail];
    const pr = { full: 7, monocle: 7.5, eyes: 9, bare: 10 }[detail];
    const parts = [
        `<g fill="none" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round">`,
        '<polygon points="30.95,24 50,35 50,57 30.95,68 11.9,57 11.9,35"/>',
        '<polygon points="69.05,24 88.1,35 88.1,57 69.05,68 50,57 50,35"/>',
        '</g>',
        `<circle cx="30.95" cy="45" r="${pr}" fill="${line}"/>`,
        `<circle cx="69.05" cy="45" r="${pr}" fill="${line}"/>`,
    ];
    if (detail === 'full' || detail === 'monocle') parts.push(`<circle cx="69.05" cy="45" r="13.5" fill="none" stroke="${accent}" stroke-width="${detail === 'full' ? 3 : 3.4}"/>`);
    if (detail === 'full') parts.push(`<path d="M78.6,54.6 C83,62 88,71 84,83" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`);
    if (detail !== 'bare') parts.push(detail === 'eyes' ? `<polygon points="44,64 56,64 50,76" fill="${accent}"/>` : `<polygon points="45,64.5 55,64.5 50,73" fill="${accent}"/>`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${title}"><title>${title}</title><g transform="translate(0,2)">${parts.join('')}</g></svg>`;
}

const wordmark = (color, accent, px) => `
<div style="display:flex;flex-direction:column;align-items:center;gap:${Math.round(px * 0.22)}px">
  <div style="font-family:Jost;font-weight:500;font-size:${px}px;letter-spacing:0.26em;margin-right:-0.26em;line-height:1;color:${color}">OWLABEE</div>
  <div style="display:flex;align-items:center;gap:${Math.round(px * 0.25)}px;width:100%">
    <div style="flex-grow:1;height:${Math.max(1, px / 30)}px;background:${accent}"></div>
    <div style="font-family:Jost;font-size:${Math.round(px * 0.42)}px;letter-spacing:0.3em;margin-right:-0.3em;color:${accent}">.COM</div>
    <div style="flex-grow:1;height:${Math.max(1, px / 30)}px;background:${accent}"></div>
  </div>
</div>`;

// Apify Actor icons: one per Actor, three category colors, same layout everywhere.
const CATS = {
    records: { bg: C.charcoal, line: C.cream, accent: C.gold, text: C.cream, sub: '#D9CDB5', rule: C.gold },
    web: { bg: C.sage, line: C.cream, accent: C.cream, text: C.cream, sub: '#F1EDE4', rule: C.cream },
    docs: { bg: C.gold, line: C.charcoal, accent: C.charcoal, text: C.charcoal, sub: '#3A342B', rule: C.charcoal },
};
export const ACTOR_ICONS = [
    // [repo dir, platform name, code, subtitle, category]
    ['accela-energov-permit-scraper', 'accela-energov-permit-scraper', 'ACCELA', 'PERMIT PORTALS', 'records'],
    ['building-permits-scraper', 'building-permits-scraper', 'PERMITS', 'BUILDING PERMITS', 'records'],
    ['federal-court-docket-monitor', 'federal-court-docket-monitor', 'PACER', 'FEDERAL DOCKETS', 'records'],
    ['gov-opportunity-feed', 'grants-gov-api', 'GRANTS', 'GRANTS & CONTRACTS', 'records'],
    ['osha-epa-enforcement-report', 'osha-epa-enforcement-report', 'OSHA', 'EPA ENFORCEMENT', 'records'],
    ['product-recall-feed', 'product-recall-feed', 'RECALLS', 'FDA · NHTSA · CPSC', 'records'],
    ['us-license-verifier', 'us-license-verifier', 'LICENSE', 'VERIFICATION', 'records'],
    ['ats-hiring-signals', 'ats-hiring-signals', 'JOBS', 'HIRING SIGNALS', 'web'],
    ['bluesky-monitor', 'bluesky-monitor', 'BLUESKY', 'SOCIAL MONITOR', 'web'],
    ['domain-intelligence', 'domain-intelligence', 'DMARC', 'DOMAIN INTEL', 'web'],
    ['podcast-rss-scraper', 'podcast-rss-scraper', 'PODCAST', 'RSS FEEDS', 'web'],
    ['shopify-catalog-monitor', 'shopify-catalog-monitor', 'SHOPIFY', 'CATALOG MONITOR', 'web'],
    ['website-change-monitor', 'website-change-monitor', 'DIFF', 'SITE CHANGES', 'web'],
    ['document-to-json-extractor', 'document-to-json-extractor', 'JSON', 'DOCUMENT TO JSON', 'docs'],
    ['drone-roof-inspection-report', 'drone-roof-inspection-report', 'ROOF', 'DRONE INSPECTION', 'docs'],
    ['gov-opportunity-fit-scorer', 'gov-opportunity-fit-scorer', 'FIT', 'BID / NO-BID SCORER', 'docs'],
    ['pdf-to-markdown', 'pdf-to-markdown', 'PDF', 'TO MARKDOWN', 'docs'],
    ['podcast-episode-summarizer', 'podcast-episode-summarizer', 'SUMMARY', 'PODCAST AI', 'docs'],
];

function actorIcon([, , code, sub, cat]) {
    const s = CATS[cat];
    const codePx = code.length <= 4 ? 92 : code.length <= 5 ? 80 : code.length <= 6 ? 68 : 60;
    return `<div style="width:512px;height:512px;background:${s.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
  ${mark({ line: s.line, accent: s.accent, detail: 'full', size: 236 })}
  <div style="font-family:Jost;font-weight:500;font-size:${codePx}px;letter-spacing:0.14em;margin-right:-0.14em;line-height:1;color:${s.text}">${code}</div>
  <div style="width:96px;height:3px;background:${s.rule};margin:10px 0 6px"></div>
  <div style="font-family:Jost;font-weight:400;font-size:24px;letter-spacing:0.2em;margin-right:-0.2em;color:${s.sub}">${sub.replace(/&/g, '&amp;')}</div>
</div>`;
}

const tile = (bg, inner, size, radius = 0, border = '') =>
    `<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};${border}box-sizing:border-box;display:flex;align-items:center;justify-content:center">${inner}</div>`;

const og = () => `<div style="width:1200px;height:630px;box-sizing:border-box;background:${C.cream};color:#2B2B2B;padding:72px 96px;display:grid;grid-template-columns:1fr 380px;align-items:center;gap:72px">
  <div style="display:flex;flex-direction:column;gap:26px">
    <div style="width:420px">${wordmark(C.charcoal, C.gold, 56)}</div>
    <div style="font-family:'Cormorant Garamond';font-style:italic;font-size:48px;line-height:1.12;color:${C.goldDeep}">Public records and web data, as clean JSON.</div>
    <div style="font-family:Jost;font-size:19px;letter-spacing:0.2em">PERMITS · GRANTS · COURT FILINGS · RECALLS</div>
    <div style="font-family:Jost;font-weight:300;font-size:20px;color:${C.stone}">Pay per result. Every record links to its public source.</div>
  </div>
  <div style="width:380px;height:380px;border-radius:50%;border:2px solid #D9C7A0;box-sizing:border-box;display:flex;align-items:center;justify-content:center">${mark({ size: 260 })}</div>
</div>`;

const banner = () => `<div style="width:1500px;height:500px;box-sizing:border-box;background:${C.cream};color:#2B2B2B;display:grid;grid-template-columns:1fr 520px;align-items:center">
  <div style="padding-left:120px;display:flex;flex-direction:column;gap:20px">
    <div style="width:470px">${wordmark(C.charcoal, C.gold, 64)}</div>
    <div style="font-family:Jost;font-size:20px;letter-spacing:0.24em;margin-top:10px">WISE DATA. HONEST WORK.</div>
    <div style="font-family:'Cormorant Garamond';font-style:italic;font-size:28px;color:${C.goldDeep}">The owl sees clearly; the bee does the work.</div>
  </div>
  <div style="display:flex;justify-content:center">${mark({ size: 360 })}</div>
</div>`;

async function main() {
    // Loaded here, not at the top, so tools/build-site.mjs can import mark() with zero dependencies.
    const { chromium } = require('playwright');
    const OUT = new URL('../../brand/', import.meta.url).pathname;
    const ICONS = join(OUT, 'apify-icons');
    mkdirSync(ICONS, { recursive: true });

    // SVG masters (no text, so they render the same everywhere).
    const svgs = {
        'owlabee-mark.svg': mark({}),
        'owlabee-mark-reversed.svg': mark({ line: C.cream }),
        'owlabee-mark-charcoal.svg': mark({ accent: C.charcoal }),
        'owlabee-mark-cream.svg': mark({ line: C.cream, accent: C.cream }),
        'owlabee-mark-small.svg': mark({ detail: 'eyes' }),
        'favicon.svg': mark({ detail: 'eyes' }),
    };
    for (const [f, s] of Object.entries(svgs)) writeFileSync(join(OUT, f), s + '\n');

    const browser = await chromium.launch();
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const shot = async (html, w, h, file, transparent = false) => {
        await page.setViewportSize({ width: w, height: h });
        await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>html,body{margin:0;background:${transparent ? 'transparent' : C.cream}}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: h }, omitBackground: transparent });
    };

    // Mark PNGs (transparent).
    for (const s of [256, 512, 1024]) await shot(mark({ size: s }), s, s, join(OUT, `owlabee-mark-${s}.png`), true);
    await shot(mark({ size: 1024, line: C.cream }), 1024, 1024, join(OUT, 'owlabee-mark-reversed-1024.png'), true);

    // Avatars (GitHub org, Apify profile, social): 1024 squares, platforms crop to a circle.
    await shot(tile(C.cream, `<div style="width:900px;height:900px;border-radius:50%;border:16px solid ${C.gold};box-sizing:border-box;display:flex;align-items:center;justify-content:center">${mark({ size: 640, detail: 'monocle' })}</div>`, 1024), 1024, 1024, join(OUT, 'avatar-cream-1024.png'));
    await shot(tile(C.charcoal, mark({ size: 720, line: C.cream, detail: 'monocle' }), 1024), 1024, 1024, join(OUT, 'avatar-charcoal-1024.png'));

    // App icons (square, full bleed).
    await shot(tile(C.cream, mark({ size: 760, detail: 'monocle' }), 1024), 1024, 1024, join(OUT, 'app-icon-cream-1024.png'));
    await shot(tile(C.charcoal, mark({ size: 760, line: C.cream, detail: 'monocle' }), 1024), 1024, 1024, join(OUT, 'app-icon-charcoal-1024.png'));
    await shot(tile(C.sage, mark({ size: 760, line: C.cream, accent: C.cream, detail: 'monocle' }), 1024), 1024, 1024, join(OUT, 'app-icon-sage-1024.png'));
    await shot(tile(C.gold, mark({ size: 760, line: C.charcoal, accent: C.charcoal, detail: 'monocle' }), 1024), 1024, 1024, join(OUT, 'app-icon-gold-1024.png'));

    // Favicons: charcoal tile, eyes only (no monocle), beak dropped at 16.
    const fav = (s, detail) => tile(C.charcoal, mark({ size: Math.round(s * 0.84), line: C.cream, detail }), s, Math.round(s * 0.22));
    await shot(fav(16, 'bare'), 16, 16, join(OUT, 'favicon-16.png'), true);
    await shot(fav(32, 'eyes'), 32, 32, join(OUT, 'favicon-32.png'), true);
    await shot(fav(48, 'eyes'), 48, 48, join(OUT, 'favicon-48.png'), true);
    await shot(tile(C.charcoal, mark({ size: 150, line: C.cream, detail: 'monocle' }), 180), 180, 180, join(OUT, 'apple-touch-icon.png'));
    await shot(tile(C.charcoal, mark({ size: 420, line: C.cream, detail: 'monocle' }), 512), 512, 512, join(OUT, 'icon-512.png'));

    // Lockups (PNG, transparent).
    await shot(`<div style="width:900px;height:620px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">${mark({ size: 300 })}<div style="width:560px">${wordmark(C.charcoal, C.gold, 84)}</div></div>`, 900, 620, join(OUT, 'owlabee-lockup-primary.png'), true);
    await shot(`<div style="width:1200px;height:360px;display:flex;align-items:center;justify-content:center;gap:40px">${mark({ size: 240 })}<div style="width:620px">${wordmark(C.charcoal, C.gold, 84)}</div></div>`, 1200, 360, join(OUT, 'owlabee-lockup-horizontal.png'), true);
    await shot(`<div style="width:1200px;height:360px;display:flex;align-items:center;justify-content:center;gap:40px">${mark({ size: 240, line: C.cream })}<div style="width:620px">${wordmark(C.cream, C.gold, 84)}</div></div>`, 1200, 360, join(OUT, 'owlabee-lockup-horizontal-reversed.png'), true);

    // Social card and profile banner.
    await shot(og(), 1200, 630, join(OUT, 'og-image.png'));
    await shot(banner(), 1500, 500, join(OUT, 'banner-1500x500.png'));

    // Apify Actor icons.
    for (const a of ACTOR_ICONS) await shot(actorIcon(a), 512, 512, join(ICONS, `${a[1]}.png`));
    await browser.close();

    // favicon.ico from the 16/32/48 PNGs.
    execFileSync('python3', ['-I', '-c', `
from PIL import Image
import sys
o = sys.argv[1]
imgs = [Image.open(o + f'/favicon-{s}.png').convert('RGBA') for s in (16, 32, 48)]
imgs[2].save(o + '/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=imgs[:2])
`, OUT]);
    console.log(`brand/: ${Object.keys(svgs).length} SVG, PNG exports, favicon.ico; apify-icons: ${ACTOR_ICONS.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
