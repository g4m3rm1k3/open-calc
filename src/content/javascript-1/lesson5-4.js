// J12 — Lesson 5-4: Day.js — Dates and Times from a CDN

const LESSON_JS_CORE_5_4 = {
  title: 'Day.js — Dates and Times from a CDN',
  subtitle: 'Parse, format, manipulate, and compare dates without the native Date API pain.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — The Problem with Native Dates

JavaScript's built-in \`Date\` is one of the most complained-about APIs in the language:

\`\`\`js
// January is 0, December is 11 — infamous gotcha
new Date(2024, 0, 15)   // Jan 15, NOT month 0

// Parsing is inconsistent across browsers
new Date('2024-01-15')  // UTC midnight
new Date('01/15/2024')  // local midnight — different value!

// Formatting requires manual work
const d = new Date();
d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
// "2024-01-15"
\`\`\`

**Day.js** is a 2 KB immutable date library with a clean API that mirrors the popular Moment.js (deprecated) but at a fraction of the size:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
\`\`\`

\`\`\`js
dayjs('2024-01-15').format('MMMM D, YYYY')   // "January 15, 2024"
dayjs().add(7, 'day').format('ddd, MMM D')    // "Mon, Jan 22"
dayjs('2024-12-25').diff(dayjs(), 'day')      // days until Christmas
\`\`\`

**Immutability**: every Day.js method returns a *new* Day.js object. The original is never modified — unlike the native Date which mutates in place. This is the same design as Rust's \`DateTime\`, Haskell's time types, and Java's \`java.time\` package.`,
    },

    {
      type: 'js',
      instruction: `### Parsing and Formatting

Day.js accepts ISO strings, timestamps, native Dates, and format strings. Every operation chains.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;font-family:monospace;font-size:12px;color:#94a3b8;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <div id="out" style="white-space:pre-wrap;line-height:1.8;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const out = document.getElementById('out');
const log = (label, val) => {
  out.textContent += label.padEnd(28) + val + '\n';
};

const now = dayjs();

// Parsing
log('now:', now.format());
log('from ISO string:', dayjs('2024-07-04').format('MMMM D, YYYY'));
log('from timestamp:', dayjs(0).format('YYYY-MM-DD'));  // Unix epoch

// Formatting tokens
log('full:', now.format('dddd, MMMM D YYYY'));           // Thursday, January 15 2024
log('short:', now.format('MM/DD/YY'));
log('time:', now.format('h:mm A'));                      // 3:45 PM
log('iso:', now.toISOString());
log('unix ms:', now.valueOf());

// Extracting parts
log('year:', now.year());
log('month (0-indexed):', now.month());  // 0 = Jan — same as native
log('day of month:', now.date());
log('day of week:', now.day());          // 0 = Sunday

console.log('All formatting done');`,
      outputHeight: 300,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Manipulation and Comparison

All manipulation methods return a new Day.js instance. Chain them freely.

\`\`\`js
dayjs().add(1, 'month')          // one month from now
dayjs().subtract(2, 'week')      // two weeks ago
dayjs().startOf('month')         // first moment of this month
dayjs().endOf('year')            // last moment of this year
dayjs().set('hour', 12)          // same day at noon
\`\`\`

**Units**: \`'year'\`, \`'month'\`, \`'week'\`, \`'day'\`, \`'hour'\`, \`'minute'\`, \`'second'\`, \`'millisecond'\`

**Comparing:**
\`\`\`js
const a = dayjs('2024-01-01');
const b = dayjs('2024-06-15');

b.diff(a, 'day')          // 166 — b minus a in days
a.isBefore(b)             // true
b.isAfter(a)              // true
a.isSame('2024-01-01')    // true

dayjs.max(a, b)           // b — the later date
dayjs.min(a, b)           // a — the earlier date
\`\`\`

**isBefore / isAfter / isSame** are the clean replacements for the native \`date1 < date2\` comparison (which compares timestamps — works but is less readable).`,
    },

    {
      type: 'js',
      instruction: `### Date Arithmetic and Countdown Timers

Build a live countdown to an upcoming event.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;font-family:monospace;display:flex;flex-direction:column;gap:12px;align-items:center;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <div style="color:#64748b;font-size:12px;">Countdown to New Year</div>
  <div id="countdown" style="color:#38bdf8;font-size:28px;letter-spacing:2px;">--:--:--</div>
  <div id="progress" style="width:100%;height:6px;background:#1e2a3f;border-radius:3px;">
    <div id="bar" style="height:100%;background:#38bdf8;border-radius:3px;transition:width 0.5s;width:0%;"></div>
  </div>
  <div style="color:#475569;font-size:11px;" id="meta"></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin-top:4px;">
    <div style="background:#1e2a3f;border-radius:8px;padding:10px;text-align:center;">
      <div id="days" style="color:#a78bfa;font-size:18px;">--</div>
      <div style="color:#475569;font-size:10px;">days</div>
    </div>
    <div style="background:#1e2a3f;border-radius:8px;padding:10px;text-align:center;">
      <div id="hours" style="color:#34d399;font-size:18px;">--</div>
      <div style="color:#475569;font-size:10px;">hours</div>
    </div>
    <div style="background:#1e2a3f;border-radius:8px;padding:10px;text-align:center;">
      <div id="minutes" style="color:#f472b6;font-size:18px;">--</div>
      <div style="color:#475569;font-size:10px;">minutes</div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const now = dayjs();
const thisYear = now.year();
// Target: next Jan 1
const target = dayjs(now.isAfter(dayjs(thisYear + '-01-01'))
  ? (thisYear + 1) + '-01-01'
  : thisYear + '-01-01');

const yearStart = dayjs(thisYear + '-01-01');
const yearEnd = dayjs((thisYear + 1) + '-01-01');
const totalDays = yearEnd.diff(yearStart, 'day');

document.getElementById('meta').textContent =
  'Target: ' + target.format('MMMM D, YYYY');

function tick() {
  const now = dayjs();
  const totalSeconds = target.diff(now, 'second');

  if (totalSeconds <= 0) {
    document.getElementById('countdown').textContent = 'Happy New Year!';
    return;
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById('countdown').textContent =
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');

  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;

  // Progress through the year
  const elapsed = now.diff(yearStart, 'day');
  const pct = (elapsed / totalDays * 100).toFixed(1);
  document.getElementById('bar').style.width = pct + '%';
}

tick();
setInterval(tick, 1000);
console.log('Countdown started');`,
      outputHeight: 340,
    },

    {
      type: 'js',
      instruction: `### Plugins — RelativeTime and More

Day.js has a plugin system. Load plugins with a second script tag and activate with \`dayjs.extend()\`.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;font-family:monospace;font-size:12px;color:#94a3b8;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/isBetween.js"></script>
  <div id="out" style="white-space:pre-wrap;line-height:1.9;"></div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `// Activate plugins
dayjs.extend(dayjs_plugin_relativeTime);
dayjs.extend(dayjs_plugin_duration);
dayjs.extend(dayjs_plugin_isBetween);

const out = document.getElementById('out');
const log = (label, val) => {
  out.textContent += label.padEnd(28) + val + '\n';
};

// --- RelativeTime plugin ---
const yesterday = dayjs().subtract(1, 'day');
const lastWeek  = dayjs().subtract(6, 'day');
const lastMonth = dayjs().subtract(45, 'day');
const future    = dayjs().add(3, 'hour');

log('yesterday:', yesterday.fromNow());    // "a day ago"
log('6 days ago:', lastWeek.fromNow());    // "6 days ago"
log('45 days ago:', lastMonth.fromNow());  // "a month ago"
log('3 hours from now:', future.fromNow()); // "in 3 hours"
log('time to future:', dayjs().to(future)); // "in 3 hours"

// --- Duration plugin ---
const dur = dayjs.duration({ hours: 2, minutes: 30, seconds: 15 });
log('duration humanize:', dur.humanize());       // "3 hours"
log('duration in minutes:', dur.asMinutes());    // 150.25
log('duration format:', dur.format('HH:mm:ss')); // "02:30:15"

// --- isBetween plugin ---
const start = dayjs('2024-01-01');
const end   = dayjs('2024-12-31');
const mid   = dayjs('2024-06-15');
const out2  = dayjs('2025-01-01');

log('June 15 in 2024?', mid.isBetween(start, end));   // true
log('Jan 1 2025 in 2024?', out2.isBetween(start, end)); // false

console.log('All plugins working');`,
      outputHeight: 320,
    },

    {
      type: 'js',
      instruction: `### Real Pattern — Event Log with Human Times

A common UI pattern: show timestamps as "5 minutes ago" and update them live.`,
      html: `<div style="background:#09111c;padding:16px;border-radius:12px;font-family:monospace;font-size:12px;color:#94a3b8;min-height:220px;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js"></script>
  <div style="color:#475569;font-size:11px;margin-bottom:10px;">Event Log (times update live)</div>
  <div id="log" style="display:flex;flex-direction:column;gap:6px;"></div>
  <button id="addEvt" style="margin-top:10px;width:100%;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:7px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">+ Add Event</button>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `dayjs.extend(dayjs_plugin_relativeTime);

const events = [
  { id: 1, msg: 'User signed in', ts: dayjs().subtract(3, 'minute') },
  { id: 2, msg: 'File uploaded', ts: dayjs().subtract(90, 'second') },
  { id: 3, msg: 'Build started', ts: dayjs().subtract(20, 'second') },
];

const messages = [
  'API request completed', 'Cache invalidated', 'Email sent',
  'Payment processed', 'Session expired', 'Config reloaded'
];
let nextId = 4;

function render() {
  const container = document.getElementById('log');
  container.innerHTML = '';
  [...events].reverse().forEach(e => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#1e2a3f;padding:8px 12px;border-radius:6px;';
    row.innerHTML =
      '<span style="color:#e2e8f0;">' + e.msg + '</span>' +
      '<span style="color:#475569;font-size:10px;" title="' + e.ts.format('HH:mm:ss') + '">' +
        e.ts.fromNow() +
      '</span>';
    container.appendChild(row);
  });
}

document.getElementById('addEvt').onclick = () => {
  events.push({
    id: nextId++,
    msg: messages[Math.floor(Math.random() * messages.length)],
    ts: dayjs(),
  });
  render();
};

render();
setInterval(render, 10000);  // update relative times every 10s
console.log('Event log running');`,
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Date Formatter

Write a function \`formatDate(isoString, style)\` that formats a date differently based on \`style\`:
- \`'short'\` → \`'01/15/2024'\`
- \`'long'\` → \`'January 15, 2024'\`
- \`'relative'\` → \`'X days ago'\` (use \`fromNow()\`)

Log all three for \`'2024-01-15'\`.

(Day.js and relativeTime plugin are already loaded.)`,
      html: `<div style="background:#09111c;padding:12px;border-radius:8px;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js"></script>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `dayjs.extend(dayjs_plugin_relativeTime);

function formatDate(isoString, style) {
  // your code
}

console.log(formatDate('2024-01-15', 'short'));
console.log(formatDate('2024-01-15', 'long'));
console.log(formatDate('2024-01-15', 'relative'));`,
      solutionCode: `dayjs.extend(dayjs_plugin_relativeTime);

function formatDate(isoString, style) {
  const d = dayjs(isoString);
  if (style === 'short') return d.format('MM/DD/YYYY');
  if (style === 'long') return d.format('MMMM D, YYYY');
  if (style === 'relative') return d.fromNow();
  return d.format();
}

console.log(formatDate('2024-01-15', 'short'));
console.log(formatDate('2024-01-15', 'long'));
console.log(formatDate('2024-01-15', 'relative'));`,
      check: (code, logs) =>
        /dayjs/.test(code) &&
        logs[0] === '01/15/2024' &&
        logs[1] === 'January 15, 2024' &&
        /ago/.test(logs[2] || ''),
      successMessage: 'Correct! Day.js format tokens are readable and consistent — no more manual string padding.',
      failMessage: 'Use dayjs(isoString).format(\'MM/DD/YYYY\') for short, \'MMMM D, YYYY\' for long, and .fromNow() for relative.',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Schedule Builder

Write a function \`buildSchedule(startISO, count, intervalDays)\` that returns an array of \`count\` formatted date strings, each \`intervalDays\` apart, starting from \`startISO\`.

\`\`\`js
buildSchedule('2024-01-01', 4, 7)
// ['Jan 01', 'Jan 08', 'Jan 15', 'Jan 22']
\`\`\`

Log the result as a JSON string.`,
      html: `<div style="background:#09111c;padding:12px;border-radius:8px;">
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `function buildSchedule(startISO, count, intervalDays) {
  // your code
}

console.log(JSON.stringify(buildSchedule('2024-01-01', 4, 7)));`,
      solutionCode: `function buildSchedule(startISO, count, intervalDays) {
  const result = [];
  let current = dayjs(startISO);
  for (let i = 0; i < count; i++) {
    result.push(current.format('MMM DD'));
    current = current.add(intervalDays, 'day');
  }
  return result;
}
console.log(JSON.stringify(buildSchedule('2024-01-01', 4, 7)));`,
      check: (code, logs) =>
        /dayjs/.test(code) &&
        /\.add\s*\(/.test(code) &&
        logs[0] === '["Jan 01","Jan 08","Jan 15","Jan 22"]',
      successMessage: 'Correct! Because Day.js is immutable, .add() always returns a new object — no accidental mutation of the start date.',
      failMessage: 'Use dayjs(startISO), then .add(intervalDays, \'day\') in a loop. Format each with .format(\'MMM DD\').',
      outputHeight: 200,
    },

  ],
};

export default {
  id: 'js-core-5-4-dayjs',
  slug: 'dayjs-dates-and-times-from-cdn',
  chapter: 'js5.1',
  order: 3,
  title: 'Day.js — Dates and Times from a CDN',
  subtitle: 'Parse, format, manipulate, and compare dates with an immutable 2 KB library.',
  tags: ['javascript', 'dayjs', 'dates', 'cdn', 'time', 'formatting', 'plugins'],

  hook: {
    question: 'Why is "January is month 0" such a famous JavaScript bug?',
    realWorldContext: 'Dates are in every app — timestamps, countdowns, schedules, "posted 3 minutes ago". The native Date API has enough gotchas to fill a book. Day.js gives you a clean, immutable API in 2 KB.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'dayjs(isoString) to parse. .format(\'YYYY-MM-DD\') to print.',
      '.add(n, unit) / .subtract(n, unit) return new Day.js instances — never mutates.',
      '.diff(other, unit) → integer. .isBefore / .isAfter / .isSame for comparisons.',
      'Plugins: relativeTime (.fromNow()), duration, isBetween, timezone, and more.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Immutability Matters',
        body: 'Native Date mutates: const d = new Date(); d.setMonth(d.getMonth() + 1) changes d in place. Day.js never does this — every operation returns a new object. This eliminates a whole class of subtle bugs where multiple parts of the code share a date reference.',
      },
      {
        type: 'tip',
        title: 'Timezones',
        body: 'Day.js works in local time by default. For UTC use .utc() (requires the utc plugin). For named timezones use the timezone plugin with the tz() method. Most apps only need local time — reach for timezone support when you have international scheduling requirements.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Day.js — Dates and Times from a CDN',
        props: { lesson: LESSON_JS_CORE_5_4 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'dayjs() = now. dayjs(string) = parsed. dayjs(ms) = from Unix timestamp.',
    'format(\'YYYY-MM-DD HH:mm:ss\') — YYYY year, MM month, DD day, HH 24h hour.',
    '.add(n, \'day\') / .subtract(n, \'week\') — always returns new instance.',
    '.diff(other, \'day\') → signed integer. Positive = other is in the past.',
    'Plugins activate via dayjs.extend(plugin). Load plugin script before calling extend.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
