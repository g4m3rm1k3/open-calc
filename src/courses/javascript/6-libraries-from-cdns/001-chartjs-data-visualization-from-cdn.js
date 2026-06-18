// J7 — Lesson 5-1: Chart.js from CDN

const LESSON_JS_CORE_5_1 = {
  title: 'Chart.js — Data Visualization from a CDN',
  subtitle: 'Load a library from a CDN, read the docs, and build interactive charts.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Loading Libraries from a CDN

A **CDN (Content Delivery Network)** hosts library files globally. Instead of installing a package locally, you add a \`<script>\` tag and the library is available immediately.

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
\`\`\`

After this script loads, \`Chart\` is available as a global variable in your JavaScript.

**How to find CDN links:**
- [jsDelivr](https://www.jsdelivr.com/) — paste any npm package name
- [cdnjs](https://cdnjs.com/) — curated CDN
- [unpkg](https://unpkg.com/) — mirrors npm directly

**When to use a CDN vs npm:**
- CDN: quick demos, standalone scripts, browser-only pages
- npm: anything with a build step (React, Next.js, Vite) — use npm install

**Chart.js** is a widely-used charting library. It renders to an HTML5 \`<canvas>\` element and provides bar, line, pie, scatter, radar, and more chart types. Every chart follows the same structure:

\`\`\`js
const chart = new Chart(canvasElement, {
  type: 'bar',        // chart type
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'My Data',
      data: [10, 20, 15],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    }]
  },
  options: {
    // responsive, scales, plugins, animations...
  }
});
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Your First Chart.js Chart

The HTML panel loads Chart.js from the CDN. Run this and see a bar chart. Try changing the \`data\` values or adding a new label/value pair.`,
      html: `<div style="height:100%;background:#09111c;padding:16px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <canvas id="myChart" style="flex:1"></canvas>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue ($K)',
      data: [42, 38, 65, 59, 80, 74],
      backgroundColor: [
        'rgba(59,130,246,0.8)',
        'rgba(99,102,241,0.8)',
        'rgba(139,92,246,0.8)',
        'rgba(168,85,247,0.8)',
        'rgba(217,70,239,0.8)',
        'rgba(236,72,153,0.8)',
      ],
      borderRadius: 6,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'var(--color-text-primary, #1e293b)" } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'var(--color-text-primary, #1e293b)" } },
    },
  }
});

console.log('Chart rendered via Chart.js from CDN');`,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Chart Types and Datasets

Chart.js supports multiple datasets on the same chart and many chart types. Each type has the same API — only the \`type\` field changes (and some type-specific options).

**Available types:** \`bar\`, \`line\`, \`pie\`, \`doughnut\`, \`radar\`, \`polarArea\`, \`scatter\`, \`bubble\`

**Multiple datasets on one chart:**
\`\`\`js
data: {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: 'Revenue', data: [100, 120, 90, 150], ... },
    { label: 'Expenses', data: [80, 95, 85, 110], ... },
  ]
}
\`\`\`

**Line chart with smooth curves:**
\`\`\`js
{ type: 'line', ..., datasets: [{ tension: 0.4, fill: true, ... }] }
\`\`\`

**Reading the docs**: Chart.js has excellent documentation. The pattern is always the same — find the option in the docs, add it to the right nesting level (dataset vs options vs plugins). When something does not work, check nesting first.`,
    },

    {
      type: 'js',
      instruction: `### Multi-Dataset Line Chart with Live Updates

This renders two datasets and updates them every second. This pattern — chart.data.datasets[0].data = newData; chart.update() — is how you connect a Chart.js chart to live data.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <canvas id="liveChart" style="flex:1"></canvas>
  <div style="display:flex;gap:8px;">
    <button id="pauseBtn" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;">Pause</button>
    <button id="resetBtn" style="flex:1;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:12px;">Reset</button>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `const MAX_POINTS = 20;
let paused = false;

const labels = Array.from({length: MAX_POINTS}, (_, i) => i);
const serverData = Array.from({length: MAX_POINTS}, () => Math.random() * 80 + 20);
const clientData = Array.from({length: MAX_POINTS}, () => Math.random() * 60 + 10);

const chart = new Chart(document.getElementById('liveChart'), {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Server Load %',
        data: [...serverData],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
      {
        label: 'Client Requests/s',
        data: [...clientData],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { labels: { color: '#94a3b8', boxWidth: 12 } } },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100, ticks: { color: '#64748b' }, grid: { color: 'var(--color-text-primary, #1e293b)" } },
    },
  }
});

let tick = MAX_POINTS;
const interval = setInterval(() => {
  if (paused) return;

  // Shift data left, add new point on right
  chart.data.labels.push(tick++);
  chart.data.labels.shift();
  chart.data.datasets[0].data.push(Math.random() * 80 + 20);
  chart.data.datasets[0].data.shift();
  chart.data.datasets[1].data.push(Math.random() * 60 + 10);
  chart.data.datasets[1].data.shift();

  chart.update();   // re-render with new data
}, 500);

document.getElementById('pauseBtn').onclick = () => {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
};
document.getElementById('resetBtn').onclick = () => {
  chart.data.datasets[0].data = Array.from({length: MAX_POINTS}, () => 50);
  chart.data.datasets[1].data = Array.from({length: MAX_POINTS}, () => 30);
  chart.update();
};`,
      outputHeight: 340,
    },

    {
      type: 'js',
      instruction: `### Pie + Fetch: Real Data Chart

This fetches real data from JSONPlaceholder, groups it, and renders it as a pie chart. This is the full pattern: fetch → transform → chart.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <div id="status" style="color:var(--color-text-secondary, #475569);font-family:monospace;font-size:12px;">Loading…</div>
  <canvas id="pieChart" style="flex:1;max-height:260px;"></canvas>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `// Fetch todos, group by userId, count completed per user
async function buildChart() {
  const statusEl = document.getElementById('status');
  try {
    const todos = await fetch('https://jsonplaceholder.typicode.com/todos')
      .then(r => r.json());

    // Group completed todos by userId
    const byUser = {};
    todos.filter(t => t.completed).forEach(t => {
      byUser[t.userId] = (byUser[t.userId] || 0) + 1;
    });

    const labels  = Object.keys(byUser).map(id => 'User ' + id);
    const data    = Object.values(byUser);
    const colors  = labels.map((_, i) =>
      'hsl(' + (i * 37) + ', 70%, 55%)'
    );

    statusEl.textContent = 'Loaded ' + todos.length + ' todos from API';

    new Chart(document.getElementById('pieChart'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11 } }
          },
          title: {
            display: true,
            text: 'Completed Todos by User',
            color: '#64748b',
          }
        }
      }
    });
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
  }
}

buildChart();`,
      outputHeight: 340,
    },

    {
      type: 'challenge',
      instruction: `### Challenge: Radar Chart

Using Chart.js from the CDN (already included in the HTML), render a **radar** chart showing skill levels for three developers.

\`\`\`js
const skills = ['JS', 'CSS', 'Node', 'SQL', 'Git'];
const dev1 = [90, 70, 85, 60, 95];
const dev2 = [75, 90, 60, 80, 70];
const dev3 = [60, 65, 90, 95, 80];
\`\`\`

Each developer should be a separate dataset with a different color. Set \`type: 'radar'\`.`,
      html: `<div style="height:100%;background:#09111c;padding:14px;border-radius:12px;box-sizing:border-box;">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <canvas id="radarChart" style="width:100%;height:100%;"></canvas>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;height:100vh;}`,
      startCode: `const skills = ['JS', 'CSS', 'Node', 'SQL', 'Git'];
const dev1 = [90, 70, 85, 60, 95];
const dev2 = [75, 90, 60, 80, 70];
const dev3 = [60, 65, 90, 95, 80];

// Create a radar chart on #radarChart with all three developers as datasets
// Each dataset needs: label, data, borderColor, backgroundColor (use rgba with low alpha)`,
      solutionCode: `const skills = ['JS', 'CSS', 'Node', 'SQL', 'Git'];
const dev1 = [90, 70, 85, 60, 95];
const dev2 = [75, 90, 60, 80, 70];
const dev3 = [60, 65, 90, 95, 80];
new Chart(document.getElementById('radarChart'), {
  type: 'radar',
  data: {
    labels: skills,
    datasets: [
      { label: 'Dev 1', data: dev1, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)' },
      { label: 'Dev 2', data: dev2, borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.2)' },
      { label: 'Dev 3', data: dev3, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.2)' },
    ]
  },
  options: { scales: { r: { ticks: { color: '#64748b' }, grid: { color: 'var(--color-text-primary, #1e293b)" }, pointLabels: { color: '#94a3b8' } } }, plugins: { legend: { labels: { color: '#94a3b8' } } } }
});`,
      check: (code) =>
        /type\s*:\s*['"]radar['"]/.test(code) &&
        /datasets/.test(code) &&
        /dev1/.test(code) && /dev2/.test(code) && /dev3/.test(code),
      successMessage: 'Correct! Radar charts are great for comparing multi-dimensional data across entities.',
      failMessage: 'Set type: "radar", then add three datasets with label, data (dev1/dev2/dev3), borderColor, backgroundColor.',
      outputHeight: 320,
    },

  ],
};

export default {
  id: 'js-core-5-1-chartjs',
  slug: 'chartjs-data-visualization-from-cdn',
  chapter: 'js5.1',
  order: 0,
  title: 'Chart.js — Data Visualization from a CDN',
  subtitle: 'Load a library from a CDN, build bar, line, pie, and radar charts, connect to live data.',
  tags: ['javascript', 'chartjs', 'cdn', 'data-visualization', 'canvas', 'charts'],

  hook: {
    question: 'How do you add a professional charting library to a page in 30 seconds?',
    realWorldContext: 'Dashboards, analytics tools, data apps — all need charts. Chart.js is the most widely used browser charting library. One script tag and you have access to 8 chart types with animation, tooltips, and responsive layout.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'CDN = one <script> tag, library available as a global variable.',
      'Every Chart.js chart: new Chart(canvas, { type, data: { labels, datasets }, options }).',
      'Update a live chart: push new data, shift old data, call chart.update().',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Reading Library Docs',
        body: 'The Chart.js API always follows the same nesting: type → data → datasets[i] → options. When an option does not work, check you are at the right nesting level.',
      },
      {
        type: 'tip',
        title: 'Destroying Before Recreating',
        body: 'If you render a Chart.js chart on a canvas that already has one, you get an error. Call `chart.destroy()` first, or keep a reference and call `.update()` instead of creating a new chart.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Chart.js — Bar, Line, Pie, Live Updates, Fetch + Chart',
        props: { lesson: LESSON_JS_CORE_5_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    '<script src="cdnURL"> loads a library as a global. No install needed.',
    'Chart: new Chart(canvas, { type, data: { labels, datasets }, options }).',
    'Live update: push/shift data arrays, then chart.update().',
    'Multiple datasets = multiple lines/bars on same axes.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
