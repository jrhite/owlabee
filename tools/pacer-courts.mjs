// PACER RSS court registry for the guide pages. Data: pacer-courts.data.json, copied from the
// court registry of the owlabee/pacer-docket-monitor Actor: a live sweep of every CM/ECF
// district and bankruptcy court, plus a later probe of the courts of appeals, the Court of Federal
// Claims and the Court of International Trade. Nothing here adds facts beyond that registry.
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('./pacer-courts.data.json', import.meta.url), 'utf8'));

/** Date of the sweep behind the district and bankruptcy rows. */
export const SWEPT_AT = data.sweptAt;
/** Date of the probe behind the appellate and national rows. */
export const APPELLATE_NATIONAL_PROBED_AT = data.appellateNationalProbedAt;
export const COURTS = data.courts;
const BY_CODE = new Map(COURTS.map((c) => [c.code, c]));
const STATE_COURTS = COURTS.filter((c) => c.type === 'district' || c.type === 'bankruptcy');
const APPELLATE = COURTS.filter((c) => c.type === 'appellate');
const NATIONAL = COURTS.filter((c) => c.type === 'national');

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
for (const c of STATE_COURTS) if (!STATE_NAMES[c.state]) throw new Error(`no state name for ${c.state}`);
for (const c of [...APPELLATE, ...NATIONAL]) if (c.state !== null) throw new Error(`${c.code} should have no state`);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => n.toLocaleString('en-US');
const isLive = (c) => c.status === 'full' || c.status === 'partial';
const notConfigured = (c) => /not configured for feed/i.test(c.probeNote ?? '');

export const court = (code) => {
  const c = BY_CODE.get(code);
  if (!c) throw new Error(`court ${code} is not in the registry`);
  return c;
};

/** Display name, as the Actor writes it into records. */
export function fullName(c) {
  if (c.type === 'bankruptcy') return `U.S. Bankruptcy Court, ${c.name}`;
  if (c.type === 'appellate') return `U.S. Court of Appeals for the ${c.name}`;
  if (c.type === 'national') return `U.S. ${c.name}`;
  return `U.S. District Court, ${c.name}`;
}

export const feedUrl = (c) =>
  c.type === 'appellate'
    ? `https://ecf.${c.code}.uscourts.gov/n/beam/servlet/TransportRoom?servlet=RSSGenerator`
    : `https://ecf.${c.code}.uscourts.gov/cgi-bin/rss_outside.pl`;

export function statusLabel(c) {
  if (c.status === 'full') return 'Live: all entry types';
  if (c.status === 'partial') return 'Live: some entry types';
  if (c.status === 'unreachable') return 'Did not answer';
  if (notConfigured(c)) return 'No feed configured';
  if (c.entryTypes.length) return 'Configured, no entries at the probe';
  return 'Answered with no entries';
}

function unreachableReason(note = '') {
  if (/timed out/i.test(note)) return 'timed out';
  if (/empty reply/i.test(note)) return 'empty reply';
  if (/HTTP \d+/.test(note)) return note.match(/HTTP \d+/)[0];
  return note || 'no answer';
}

const chips = (types) => types.map((t) => `<code>${esc(t)}</code>`).join(', ');

/** What the feed carries, from the registry; "unknown" when the probe saw no entries. */
export function carriesHtml(c) {
  let html;
  if (c.status === 'full') html = 'All entry types';
  else if (c.status === 'partial') html = `Only: ${chips(c.entryTypes)}`;
  else if (c.status === 'unreachable') html = `Unknown (${esc(unreachableReason(c.probeNote))} from a datacenter IP)`;
  else if (notConfigured(c)) html = 'Nothing (the court answers "not configured for feed")';
  else if (c.entryTypes.length) html = `Configured for ${chips(c.entryTypes)}; no entries at the probe, which ran on a Saturday`;
  else html = 'Unknown (feed answered with no entries)';
  if (c.code === 'cit') html += '. Titles carry the case number only, no party names';
  return html;
}

function count(list) {
  const t = { all: list.length, full: 0, partial: 0, empty: 0, unreachable: 0, entries: 0 };
  for (const c of list) {
    t[c.status]++;
    t.entries += c.probedEntries24h;
  }
  t.live = t.full + t.partial;
  return t;
}
export const totals = {
  ...count(COURTS),
  stateCourts: count(STATE_COURTS),
  appellate: count(APPELLATE),
  national: count(NATIONAL),
  district: COURTS.filter((c) => c.type === 'district').length,
  bankruptcy: COURTS.filter((c) => c.type === 'bankruptcy').length,
};

const probeDateOf = (c) => c.probedAt ?? SWEPT_AT;

/** A small table of selected courts, for the use-case guides. Links each code to its row on the reference page. */
export function courtTable(codes, refPrefix) {
  const list = codes.map(court);
  const dates = [...new Set(list.map(probeDateOf))];
  const when = dates.length === 1 ? `at the ${dates[0]} ${dates[0] === SWEPT_AT ? 'sweep' : 'probe'}` : 'at its probe';
  const window = list.some((c) => c.type === 'appellate') ? 'its feed' : 'its 24-hour feed';
  const rows = list
    .map(
      (c) =>
        `<tr><td><a href="${refPrefix}#${c.code}"><code>${c.code}</code></a></td><td>${esc(fullName(c))}</td><td>${statusLabel(c)}</td><td>${carriesHtml(c)}</td><td>${isLive(c) ? num(c.probedEntries24h) : '–'}</td></tr>`,
    )
    .join('\n');
  return `<div class="table-wrap"><table class="court-list">
<thead><tr><th scope="col">Code</th><th scope="col">Court</th><th scope="col">Feed ${when}</th><th scope="col">What it carries</th><th scope="col">Entries in ${window}</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>`;
}

const HEAD = `<thead><tr><th scope="col">State</th><th scope="col">Code</th><th scope="col">Court</th><th scope="col">Feed</th><th scope="col">What it carries</th><th scope="col">Entries in feed</th></tr></thead>`;
const row = (c, first, stateCell) =>
  `<tr id="${c.code}"${first ? ' class="group-start"' : ''}><td${first && c.state ? ` id="state-${c.state}"` : ''}>${stateCell}</td><td><code>${c.code}</code></td><td>${esc(fullName(c))}</td><td class="status-${c.status}">${statusLabel(c)}</td><td>${carriesHtml(c)}</td><td class="num">${isLive(c) ? num(c.probedEntries24h) : '–'}</td></tr>`;

/** Body of the reference page (everything between the lede and the FAQ). */
export function referenceSections({ guideLinks, input }) {
  const states = [...new Set(STATE_COURTS.map((c) => c.state))];
  const busiest = STATE_COURTS.filter(isLive)
    .sort((a, b) => b.probedEntries24h - a.probedEntries24h)
    .slice(0, 10);
  const codes = (status) =>
    COURTS.filter((c) => c.status === status)
      .map((c) => `<a href="#${c.code}"><code>${c.code}</code></a>`)
      .join(' ');

  const stateRows = states
    .map((st) => STATE_COURTS.filter((c) => c.state === st).map((c, i) => row(c, i === 0, st)).join('\n'))
    .join('\n');
  const t = totals;
  const s = t.stateCourts;
  const ap = t.appellate;
  const na = t.national;

  return `
<section id="source">
<h2>Where this list comes from</h2>
<p>This table is the court registry of owlabee's <a href="../pacer-rss-docket-monitor/">PACER RSS Docket Monitor</a> Actor, published as is. It comes from two probes, both made from a datacenter IP:</p>
<ul>
<li>The <strong>${t.district} district courts and ${t.bankruptcy} bankruptcy courts</strong> were swept on <strong>${SWEPT_AT}</strong>.</li>
<li>The <strong>${ap.all} courts of appeals</strong>, the <strong>Court of Federal Claims</strong> and the <strong>Court of International Trade</strong> were probed on <strong>${APPELLATE_NATIONAL_PROBED_AT}</strong>, a Saturday.</li>
</ul>
<p>Each status is what its probe saw, not a guarantee: courts change their feed settings, and a feed that was empty or did not answer may work from another network or on another day.</p>
<p>District, bankruptcy and national courts publish their feed at <code>https://ecf.&lt;code&gt;.uscourts.gov/cgi-bin/rss_outside.pl</code>, covering the <strong>trailing 24 hours</strong> of docket activity. The courts of appeals publish theirs at <code>https://ecf.&lt;code&gt;.uscourts.gov/n/beam/servlet/TransportRoom?servlet=RSSGenerator</code>. No PACER account is needed to read a feed; opening a linked document on PACER is subject to PACER's own fees.</p>
<h3>At a glance</h3>
<ul>
<li><strong>${t.live} of ${t.all}</strong> courts had a live feed: ${t.full} publish every docket entry type and ${t.partial} publish only some types.</li>
<li>District and bankruptcy courts (${SWEPT_AT}): ${s.live} of ${s.all} live (${s.full} all types, ${s.partial} some types), ${s.empty} answered with no entries, ${s.unreachable} did not answer. Their live feeds held ${num(s.entries)} entries at sweep time.</li>
<li>Courts of appeals (${APPELLATE_NATIONAL_PROBED_AT}): ${ap.live} of ${ap.all} had entries. The other ${ap.empty} published none: six are not configured for a feed, and the Second Circuit's feed is configured but was empty on the day of the probe.</li>
<li>National courts (${APPELLATE_NATIONAL_PROBED_AT}): both live. The Court of Federal Claims publishes every entry type; the Court of International Trade publishes some.</li>
</ul>
<h3>How to read the columns</h3>
<ul>
<li><strong>Live: all entry types</strong>: the feed says "Docket entries of type: all".</li>
<li><strong>Live: some entry types</strong>: the feed publishes only the types listed, exactly as the feed advertises them (for example <code>cmp</code>, <code>motion</code>, <code>order</code>, or <code>orders</code>, <code>opinions</code>, <code>judgments</code> for a court of appeals).</li>
<li><strong>Answered with no entries</strong>: the endpoint exists but carried nothing during the probe, so what it carries is unknown.</li>
<li><strong>No feed configured</strong>: the court of appeals answers "not configured for feed".</li>
<li><strong>Did not answer</strong>: the request timed out, got an empty reply or an HTTP error from a datacenter IP, so what it carries is unknown.</li>
<li><strong>Entries in feed</strong>: how many items the feed held at probe time. It is one day's sample, not an average, and the two probes ran on different dates.</li>
</ul>
</section>

<section id="courts">
<h2>District and bankruptcy courts (${s.all})</h2>
<p>Swept on ${SWEPT_AT}. Grouped by state, each district's district court followed by its bankruptcy court. Jump to a state: ${states.map((st) => `<a href="#state-${st}" title="${esc(STATE_NAMES[st])}">${st}</a>`).join(' ')}</p>
<div class="table-wrap"><table class="courts">
${HEAD}
<tbody>
${stateRows}
</tbody>
</table></div>
</section>

<section id="appellate">
<h2>Courts of appeals (${ap.all})</h2>
<p>Probed on ${APPELLATE_NATIONAL_PROBED_AT}. <strong>Appellate feeds carry orders, opinions and judgments only. They never list new appeals or briefs</strong>, so they are for following an appeal you already know about, not for spotting new ones. In the Actor, <code>newCasesOnly</code> drops every appellate entry; follow an appeal with <code>caseNumbers</code> instead.</p>
<div class="table-wrap"><table class="courts">
${HEAD}
<tbody>
${APPELLATE.map((c, i) => row(c, i === 0, '–')).join('\n')}
</tbody>
</table></div>
<p>The probe ran on a Saturday, so the Second Circuit (<code>ca2</code>), whose feed is configured for orders and opinions, had nothing to show. <code>all-appellate</code> selects the ${ap.live} circuits with entries at the probe; name <code>ca2</code> explicitly to watch it.</p>
</section>

<section id="national">
<h2>National courts: Federal Claims and International Trade (${na.all})</h2>
<p>Probed on ${APPELLATE_NATIONAL_PROBED_AT}. Both use the same feed as the district courts, so their records have the same shape.</p>
<div class="table-wrap"><table class="courts">
${HEAD}
<tbody>
${NATIONAL.map((c, i) => row(c, i === 0, '–')).join('\n')}
</tbody>
</table></div>
<ul>
<li><code>all-national</code> selects both. <code>cfc</code> and <code>uscfc</code> are accepted for <code>cofc</code>.</li>
<li><strong>Court of International Trade feed titles carry only the case number</strong>, no party names, so party filters cannot match its entries. Filter it by case number or entry text instead.</li>
</ul>
</section>

<section id="by-status">
<h2>Courts by feed status</h2>
<h3>All entry types (${t.full})</h3>
<p class="codes">${codes('full')}</p>
<h3>Some entry types (${t.partial})</h3>
<p class="codes">${codes('partial')}</p>
<h3>No entries or no feed configured (${t.empty})</h3>
<p class="codes">${codes('empty')}</p>
<h3>Did not answer from a datacenter IP (${t.unreachable})</h3>
<p class="codes">${codes('unreachable')}</p>
<h3>Largest district and bankruptcy feeds</h3>
<p>The ten live district and bankruptcy feeds holding the most entries in their 24-hour window on ${SWEPT_AT}. One day's sample, so treat it as a rough guide to volume.</p>
<ol>
${busiest.map((c) => `<li><a href="#${c.code}"><code>${c.code}</code></a> ${esc(fullName(c))}: ${num(c.probedEntries24h)} entries</li>`).join('\n')}
</ol>
</section>

<section id="monitor">
<h2>Monitor a court from this list</h2>
<p>The Actor reads these feeds and returns each entry as JSON. Put any code from the tables in <code>courts</code>:</p>
<pre tabindex="0" aria-label="Input for one court"><code>${esc(JSON.stringify(input, null, 2))}</code></pre>
<p><code>courts</code> also accepts these aliases, each expanding to the courts with a live feed at their last probe:</p>
<ul>
<li><code>all</code>: every district and bankruptcy court. It does not include the courts of appeals or the national courts.</li>
<li><code>all-district</code> and <code>all-bankruptcy</code>.</li>
<li><code>all-appellate</code>: the courts of appeals with entries.</li>
<li><code>all-national</code>: the Court of Federal Claims and the Court of International Trade.</li>
<li>A two-letter state code such as <code>TX</code>: that state's district and bankruptcy courts.</li>
</ul>
<p>A court you name by its code is always tried, even if its feed was empty or did not answer at the probe, and the run's summary reports what each court returned.</p>
<p>Ready-made inputs for common uses: ${guideLinks}.</p>
</section>`;
}
