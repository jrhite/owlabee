// PACER RSS court registry for the guide pages. Data: pacer-courts.data.json, copied from the
// court registry of the owlabee/federal-court-docket-monitor Actor (a live sweep of every CM/ECF
// district and bankruptcy court). Nothing here adds facts beyond that registry.
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('./pacer-courts.data.json', import.meta.url), 'utf8'));

export const SWEPT_AT = data.sweptAt;
export const COURTS = data.courts;
const BY_CODE = new Map(COURTS.map((c) => [c.code, c]));

// USPS state and territory names for the registry's state codes.
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', GU: 'Guam', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', MP: 'Northern Mariana Islands', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', PR: 'Puerto Rico', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VI: 'U.S. Virgin Islands',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};
for (const c of COURTS) if (!STATE_NAMES[c.state]) throw new Error(`no state name for ${c.state}`);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => n.toLocaleString('en-US');

export const court = (code) => {
  const c = BY_CODE.get(code);
  if (!c) throw new Error(`court ${code} is not in the registry`);
  return c;
};
export const fullName = (c) => `U.S. ${c.type === 'district' ? 'District' : 'Bankruptcy'} Court, ${c.name}`;
export const feedUrl = (c) => `https://ecf.${c.code}.uscourts.gov/cgi-bin/rss_outside.pl`;

const STATUS = {
  full: 'Live: all entry types',
  partial: 'Live: some entry types',
  empty: 'Answered with no entries',
  unreachable: 'Did not answer',
};
export const statusLabel = (c) => STATUS[c.status];

function unreachableReason(note = '') {
  if (/timed out/i.test(note)) return 'timed out';
  if (/empty reply/i.test(note)) return 'empty reply';
  if (/HTTP \d+/.test(note)) return note.match(/HTTP \d+/)[0];
  return note || 'no answer';
}

/** What the feed carries, from the registry; "unknown" when the sweep saw no entries. */
export function carriesHtml(c) {
  if (c.status === 'full') return 'All entry types';
  if (c.status === 'partial') return `Only: ${c.entryTypes.map((t) => `<code>${esc(t)}</code>`).join(', ')}`;
  if (c.status === 'empty') return 'Unknown (feed answered with no entries)';
  return `Unknown (${esc(unreachableReason(c.probeNote))} from a datacenter IP)`;
}

export const totals = (() => {
  const t = { all: COURTS.length, full: 0, partial: 0, empty: 0, unreachable: 0, entries: 0, district: 0, bankruptcy: 0 };
  for (const c of COURTS) {
    t[c.status]++;
    t[c.type]++;
    t.entries += c.probedEntries24h;
  }
  t.live = t.full + t.partial;
  return t;
})();

/** A small table of selected courts, for the use-case guides. Links each code to its row on the reference page. */
export function courtTable(codes, refPrefix) {
  const rows = codes
    .map(court)
    .map(
      (c) =>
        `<tr><td><a href="${refPrefix}#${c.code}"><code>${c.code}</code></a></td><td>${esc(fullName(c))}</td><td>${statusLabel(c)}</td><td>${carriesHtml(c)}</td><td>${c.status === 'full' || c.status === 'partial' ? num(c.probedEntries24h) : '–'}</td></tr>`,
    )
    .join('\n');
  return `<div class="table-wrap"><table class="court-list">
<thead><tr><th scope="col">Code</th><th scope="col">Court</th><th scope="col">Feed at the ${SWEPT_AT} sweep</th><th scope="col">What it carries</th><th scope="col">Entries in its 24-hour feed</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>`;
}

/** Body of the reference page (everything between the lede and the FAQ). */
export function referenceSections({ guideLinks, input }) {
  const states = [...new Set(COURTS.map((c) => c.state))];
  const busiest = COURTS.filter((c) => c.status === 'full' || c.status === 'partial')
    .sort((a, b) => b.probedEntries24h - a.probedEntries24h)
    .slice(0, 10);
  const codes = (status) =>
    COURTS.filter((c) => c.status === status)
      .map((c) => `<a href="#${c.code}"><code>${c.code}</code></a>`)
      .join(' ');

  const rows = states
    .map((st) => {
      const list = COURTS.filter((c) => c.state === st);
      return list
        .map(
          (c, i) =>
            `<tr id="${c.code}"${i === 0 ? ` class="group-start"` : ''}><td${i === 0 ? ` id="state-${st}"` : ''}>${st}</td><td><code>${c.code}</code></td><td>${esc(fullName(c))}</td><td class="status-${c.status}">${statusLabel(c)}</td><td>${carriesHtml(c)}</td><td class="num">${c.status === 'full' || c.status === 'partial' ? num(c.probedEntries24h) : '–'}</td></tr>`,
        )
        .join('\n');
    })
    .join('\n');

  return `
<section id="source">
<h2>Where this list comes from</h2>
<p>This table is the court registry of owlabee's <a href="../pacer-rss-docket-monitor/">PACER RSS Docket Monitor</a> Actor, published as is. The registry was generated from a live sweep of all ${totals.district} district courts and ${totals.bankruptcy} bankruptcy courts on <strong>${SWEPT_AT}</strong>, made from a datacenter IP. It was last updated on that date. The status of each court is what that sweep saw, not a guarantee: courts change their feed settings, and a feed that was empty or did not answer may work from another network or on another day.</p>
<p>Each CM/ECF court's public feed lives at <code>https://ecf.&lt;code&gt;.uscourts.gov/cgi-bin/rss_outside.pl</code> and covers only the <strong>trailing 24 hours</strong> of docket activity. No PACER account is needed to read a feed; opening a linked document on PACER is subject to PACER's own fees.</p>
<h3>At a glance</h3>
<ul>
<li><strong>${totals.live} of ${totals.all}</strong> courts had a live feed: ${totals.full} publish every docket entry type and ${totals.partial} publish only some types.</li>
<li><strong>${totals.empty}</strong> feeds answered with no entries, and <strong>${totals.unreachable}</strong> did not answer requests from a datacenter IP.</li>
<li>The live feeds carried <strong>${num(totals.entries)}</strong> entries in their 24-hour windows at the time of the sweep.</li>
</ul>
<h3>How to read the columns</h3>
<ul>
<li><strong>Live: all entry types</strong>: the feed says "Docket entries of type: all".</li>
<li><strong>Live: some entry types</strong>: the feed publishes only the CM/ECF entry types listed, exactly as the feed advertises them (for example <code>cmp</code>, <code>motion</code>, <code>order</code>).</li>
<li><strong>Answered with no entries</strong>: the endpoint exists but carried nothing during the sweep, so what it carries is unknown.</li>
<li><strong>Did not answer</strong>: the request timed out, got an empty reply or an HTTP error from a datacenter IP, so what it carries is unknown.</li>
<li><strong>Entries in its 24-hour feed</strong>: how many items the feed held at sweep time. It is one day's sample, not an average.</li>
</ul>
</section>

<section id="courts">
<h2>All ${totals.all} courts</h2>
<p>Grouped by state, each district's district court followed by its bankruptcy court. Jump to a state: ${states.map((s) => `<a href="#state-${s}" title="${esc(STATE_NAMES[s])}">${s}</a>`).join(' ')}</p>
<div class="table-wrap"><table class="courts">
<thead><tr><th scope="col">State</th><th scope="col">Code</th><th scope="col">Court</th><th scope="col">Feed</th><th scope="col">What it carries</th><th scope="col">Entries in 24 h</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
</section>

<section id="by-status">
<h2>Courts by feed status</h2>
<h3>All entry types (${totals.full})</h3>
<p class="codes">${codes('full')}</p>
<h3>Some entry types (${totals.partial})</h3>
<p class="codes">${codes('partial')}</p>
<h3>Answered with no entries (${totals.empty})</h3>
<p class="codes">${codes('empty')}</p>
<h3>Did not answer from a datacenter IP (${totals.unreachable})</h3>
<p class="codes">${codes('unreachable')}</p>
<h3>Largest feeds at the sweep</h3>
<p>The ten live feeds holding the most entries in their 24-hour window on ${SWEPT_AT}. One day's sample, so treat it as a rough guide to volume.</p>
<ol>
${busiest.map((c) => `<li><a href="#${c.code}"><code>${c.code}</code></a> ${esc(fullName(c))}: ${num(c.probedEntries24h)} entries</li>`).join('\n')}
</ol>
</section>

<section id="monitor">
<h2>Monitor a court from this list</h2>
<p>The Actor reads these feeds and returns each entry as JSON. Put any code from the table in <code>courts</code>:</p>
<pre tabindex="0" aria-label="Input for one court"><code>${esc(JSON.stringify(input, null, 2))}</code></pre>
<p><code>courts</code> also accepts <code>all</code> (every court with a live feed), <code>all-district</code>, <code>all-bankruptcy</code>, and a two-letter state code such as <code>TX</code> for every live court in that state. These aliases leave out courts whose feed was empty or did not answer at the sweep, but a court you name by its code is always tried, and the run's summary reports what each court returned.</p>
<p>Ready-made inputs for common uses: ${guideLinks}.</p>
</section>`;
}
