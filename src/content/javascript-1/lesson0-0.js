// ─── shared studio HTML ──────────────────────────────────────────────────────
// All three typing-demo cells use the same layout: split editor + live preview.
// Tab state is driven by CSS classes (ahtml / acss / ajs / done).
const STUDIO_HTML = `<div class="studio">
  <div class="ep">
    <div class="tabs">
      <span class="tab" id="th">HTML</span>
      <span class="tab" id="tc">CSS</span>
      <span class="tab" id="tj">JS</span>
    </div>
    <pre class="code" id="cd"></pre>
  </div>
  <div class="pp">
    <div class="pb">&#8635; Live Preview</div>
    <iframe id="pv" scrolling="no"></iframe>
    <div class="sb" id="sb"></div>
  </div>
</div>`;

// ─── shared studio CSS ────────────────────────────────────────────────────────
const STUDIO_CSS = `body{padding:0;margin:0;overflow:hidden;height:100vh}
.studio{height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#050a10}
.ep{display:flex;flex-direction:column;border-right:1px solid #162438}
.tabs{background:#03080f;border-bottom:1px solid #162438;display:flex;padding:0 8px;gap:2px;flex-shrink:0}
.tab{padding:10px 16px;font:700 11px/1 sans-serif;letter-spacing:.06em;color:#475569;border-bottom:2px solid transparent;transition:all .25s ease;user-select:none;opacity:0.6}
.tab.ahtml{color:#fb923c;border-color:#fb923c;background:#0a1520;opacity:1}
.tab.acss{color:#4ade80;border-color:#4ade80;background:#0a1520;opacity:1}
.tab.ajs{color:#facc15;border-color:#facc15;background:#0a1520;opacity:1}
.tab.done{color:#64748b;border-color:transparent;text-decoration:line-through;opacity:0.4}
.code{flex:1;font:400 12px/1.8 'Fira Code',monospace;color:#f1f5f9;white-space:pre-wrap;word-break:break-all;margin:0;padding:20px;overflow:auto;background:#03080f}
.pp{display:flex;flex-direction:column;background:#0a1118}
.pb{background:#03080f;border-bottom:1px solid #162438;padding:10px 14px;font:700 10px/1 sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#475569;flex-shrink:0}
#pv{flex:1;border:none;width:100%;height:100%;background:#0a1118}
.sb{background:#064e3b;border-top:1px solid #10b981;color:#6ee7b7;font:700 11px/1 sans-serif;padding:10px 14px;display:none;letter-spacing:.05em;flex-shrink:0}`;

// ─────────────────────────────────────────────────────────────────────────────

const LESSON_JS_CORE_0_0 = {
  title: 'How to Use This Notebook',
  subtitle: 'Press Run on each cell. Watch code appear and render live.',
  sequential: true,

  cells: [

    // ── 0. Intro ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Welcome to your interactive learning environment\n\nBefore writing any JavaScript, you need to understand the tool. Every interactive cell in this course is a live coding environment built from three layers:\n\n- **HTML** — defines the structure of what appears on screen\n- **CSS** — controls how that structure looks\n- **JavaScript** — makes it respond to interaction\n\nThe next three cells demonstrate each layer by building a live page from nothing. **Press Run on each cell** and watch the notebook type code and render it in real time.\n\nYou are not writing any code yet. You are learning to read the instrument.`,
    },

    // ── 0.5. UI Orientation ──────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Anatomy of a Notebook Cell\n\nEvery interactive cell in this course has the same structure:\n\n- **Editor tabs (HTML / CSS / JS)** — each tab holds one layer of the page. The JS tab is where most of your work happens. You can switch between tabs to read or edit any layer.\n\n- **Run** — executes the cell. The preview updates and the console below streams any \`console.log\` output. You will press this after every edit.\n\n- **Reset** — restores the editor to the original starter code. Use this when you want to start over.\n\n- **Challenge cells** look different: a purple header, a prompt above the editor, and a green/red result banner after you press Run. Challenges are gated — they appear only after the lesson slides that teach the concept being tested.\n\n- **Sequential locking** — cells unlock in order. You cannot skip ahead. Each cell builds on the one before it.`,
    },

    // ── 0.6. The Console ─────────────────────────────────────────────────────
    {
      type: "markdown",
      instruction: `### The Console: Your Feedback Loop\n\nIn professional development, we spend as much time looking at the **Console** as we do looking at the screen. The console is a direct communication line from your code to you.\n\nWhile the **Preview** window shows you visual results (HTML/CSS), the **Console** shows you what is happening inside the computer's logic. We use \`console.log()\` to "print" values so we can see data in motion.\n\n**Try it**: In the next cell, press **Run**. Notice how the Console automatically slides open to show you the output, while the Preview window stays hidden because there is no visual code to display.`
    },
    {
      type: "js",
      instruction: `### The Console in Action\n\nEvery professional developer uses the console to debug and inspect data. This is our primary way of "seeing" what the computer is thinking when there is no user interface yet.\n\nPress **Run** to execute the code. You will see three different messages appear in the console below. Notice that:\n\n1.  **Multiple values** can be logged in one line.\n2.  **Logic results** (like \`1 + 1\`) evaluate before being printed.\n3.  **The Window stays hidden** if there is no HTML or CSS.\n\nExperiment: try changing the numbers or text, then press Run again.`,
      startCode: `// This is a comment. The computer ignores it.\n// The line below tells the computer to send a message to the Console.\n\nconsole.log("Hello from the Console!");\nconsole.log("1 + 1 =", 1 + 1);\nconsole.log("The Console is where we debug our logic.");`,
      showPreviewByDefault: false
    },

    // ── 1. HTML tab demo ─────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### HTML: The Skeleton\n\nPress **Run**.\n\nThe HTML tab activates and code starts typing into the editor. Watch the preview on the right: as soon as the code is complete, the page structure appears.\n\nHTML is the skeleton of every web page. It defines elements — headings, paragraphs, buttons — without any styling or behavior. The rendered result looks bare because HTML only answers one question: **what is on the page?**\n\nEvery element you will ever interact with in a browser starts as an HTML tag like the ones you see typing out now.`,
      html: STUDIO_HTML,
      css: STUDIO_CSS,
      startCode: `var pre = document.getElementById('cd');
var pv  = document.getElementById('pv');
var sb  = document.getElementById('sb');
var tabH = document.getElementById('th');
var tabC = document.getElementById('tc');
var tabJ = document.getElementById('tj');

setTimeout(function() {
  tabH.className = 'tab ahtml';
  startTyping();
}, 550);

var code = \`<div class="card">
  <h2>HTML = Structure</h2>
  <p>HTML defines every element on the page.</p>
  <p>No style. No behavior. Just <strong>structure</strong>.</p>
  <button id="btn">I am waiting for CSS and JS</button>
</div>\`;

function hlHTML(raw) {
  var e = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return e
    .replace(/(&lt;[\/]?)([\w\d-]+)/g,'$1<b style="color:#60a5fa">$2</b>')
    .replace(/(&gt;)/g,'<span style="color:#475569">$1</span>')
    .replace(/(&lt;)/g,'<span style="color:#475569">$1</span>')
    .replace(/([\w\d-]+)(=)(&quot;[^&]*&quot;)/g,'<span style="color:#fb923c">$1</span><span style="color:#4ade80">$2</span><span style="color:#4ade80">$3</span>');
}

function startTyping() {
  var pos = 0;
  function tick() {
    if (pos >= code.length) {
      setTimeout(function() {
        pre.innerHTML = hlHTML(code);
        pv.srcdoc = '<style>body{margin:0;padding:20px;background:#0d1523;font-family:sans-serif;color:#e2e8f0}h2{color:#94a3b8;margin:0 0 10px;font-size:18px;font-weight:700}p{color:#64748b;margin:0 0 10px;font-size:13px;line-height:1.6}strong{color:#94a3b8}#btn{margin-top:6px;background:#111827;color:#475569;border:1px solid #1e293b;padding:9px 18px;border-radius:6px;font-size:12px;cursor:default}</style>' + code;
        sb.textContent = '✓ HTML rendered — structure without style or behavior';
        sb.style.display = 'block';
      }, 100);
      return;
    }
    pre.textContent = code.slice(0, ++pos) + '█';
    setTimeout(tick, 12);
  }
  tick();
}
// tick() is called via the setTimeout above`,
      outputHeight: 320,
    },

    // ── 2. CSS tab demo ──────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### CSS: The Presentation Layer\n\nPress **Run**.\n\nWatch the HTML tab mark itself as done and the CSS tab activate. The same structural elements from the previous step now receive style.\n\n**CSS** answers a different question: **how should each element look?** It targets elements by tag name or class, then assigns visual rules — color, spacing, shape, shadow. The page you are looking at right now is HTML dressed in CSS.\n\nThe preview shows the transformation: the bare elements from the HTML step become a composed, styled card. Nothing structural changed — only the presentation layer was added.`,
      html: STUDIO_HTML,
      css: STUDIO_CSS,
      startCode: `var pre = document.getElementById('cd');
var pv  = document.getElementById('pv');
var sb  = document.getElementById('sb');
var tabH = document.getElementById('th');
var tabC = document.getElementById('tc');

tabH.className = 'tab done';
setTimeout(function() {
  tabC.className = 'tab acss';
  startTyping();
}, 550);

var html = '<div class="card"><h2>HTML + CSS = Styled</h2><p>CSS controls how elements <em>look</em>.</p><p>Color, spacing, shape, shadow.</p><button id="btn">Now I have a face</button></div>';

var code = \`.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 26px;
}
h2  { color: #38bdf8; margin: 0 0 10px; font-size: 19px; }
p   { color: #94a3b8; margin: 0 0 10px; font-size: 13px; line-height: 1.6; }
em  { color: #4ade80; font-style: normal; font-weight: 600; }
#btn {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all .2s;
}
#btn:hover { background: #0284c7; }\`;

function hlCSS(raw) {
  return raw
    .replace(/([#.]?[\w-]+)\s*\{/g,'<span style="color:#60a5fa">$1</span> {')
    .replace(/([\w-]+)(\s*:)/g,'<span style="color:#c084fc">$1</span>$2')
    .replace(/(#[0-9a-fA-F]{3,6})/g,'<span style="color:#4ade80">$1</span>')
    .replace(/\b([\d.]+(?:px|em|rem|%|s|vh|vw))\b/g,'<span style="color:#fb923c">$1</span>');
}

function startTyping() {
  var pos = 0;
  function tick() {
    if (pos >= code.length) {
      setTimeout(function() {
        pre.innerHTML = hlCSS(code);
        pv.srcdoc = '<style>body{margin:0;padding:20px;background:#0f172a;font-family:sans-serif;color:#e2e8f0}' + code + '</style>' + html;
        sb.textContent = '\u2713 CSS applied \u2014 the skeleton now has a face';
        sb.style.display = 'block';
        console.log('CSS transforms structure into a styled page. Nothing structural changed.');
      }, 120);
      return;
    }
    pre.textContent = code.slice(0, ++pos) + '█';
    setTimeout(tick, 10);
  }
  tick();
}`,
      outputHeight: 320,
    },

    // ── 3. JS tab demo ───────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### JavaScript: The Behavior\n\nPress **Run**.\n\nHTML and CSS tabs mark themselves done. The JS tab activates and JavaScript code types in. After the typing completes, the preview becomes interactive.\n\n**Click the button in the preview** — it responds. That response is JavaScript. It listens for events (your click), reads the current state (how many times you have clicked), and updates the page (changes the button text and fills the progress bar).\n\nThis is the full picture:\n- **HTML** is the structure\n- **CSS** is the appearance\n- **JavaScript** is what makes the page alive and responsive. \n\nEvery interactive element on the web is these three layers working together.`,
      html: STUDIO_HTML,
      css: STUDIO_CSS,
      startCode: `var pre = document.getElementById('cd');
var pv  = document.getElementById('pv');
var sb  = document.getElementById('sb');
var tabH = document.getElementById('th');
var tabC = document.getElementById('tc');
var tabJ = document.getElementById('tj');

tabH.className = 'tab done';
tabC.className = 'tab done';

setTimeout(function() {
  tabJ.className = 'tab ajs';
  startTyping();
}, 550);

var htmlSrc = '<div class="card"><h2>HTML + CSS + JS = Interactive</h2><p>Click the button five times to fill the bar.</p><div class="track"><div class="bar" id="bar"></div></div><button id="btn">Click me!</button></div>';

var cssSrc = '.card{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:26px;font-family:sans-serif;color:#e2e8f0}h2{color:#38bdf8;margin:0 0 10px;font-size:19px}p{color:#94a3b8;margin:0 0 14px;font-size:13px;line-height:1.6}.track{background:#0f172a;border-radius:999px;height:7px;margin-bottom:18px;overflow:hidden}.bar{height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#4ade80);transition:width .4s ease;border-radius:999px}#btn{background:#0ea5e9;color:white;border:none;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all .25s}';

var code = \`const btn = document.getElementById('btn');
const bar = document.getElementById('bar');
let n = 0;

btn.onclick = function() {
  n++;
  bar.style.width = Math.min(n * 20, 100) + '%';
  btn.textContent = n < 5
    ? 'Clicked ' + n + ' / 5'
    : 'Done! JS made this happen.';
  if (n >= 5) {
    btn.style.background = '#10b981';
    btn.style.boxShadow = '0 0 18px #10b98155';
  }
};\`;

function hlJS(raw) {
  var e = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return e
    .replace(/\\b(const|let|var|function|return|if|else)\\b/g,'<span style="color:#c084fc">$1</span>')
    .replace(/\\b(document|Math)\\b/g,'<span style="color:#60a5fa">$1</span>')
    .replace(/'([^']*)'/g,"'<span style=\\\"color:#4ade80\\\">$1</span>'")
    .replace(/\\b(\\d+)\\b/g,'<span style="color:#fb923c">$1</span>');
}

function startTyping() {
  var pos = 0;
  function tick() {
    if (pos >= code.length) {
      setTimeout(function() {
        pre.innerHTML = hlJS(code);
        pv.srcdoc = '<style>body{margin:0;padding:20px;background:#0f172a}' + cssSrc + '</style>' + htmlSrc + '<scr' + 'ipt>' + code + '<' + '/script>';
        sb.textContent = '\u2713 JS loaded \u2014 click the button in the preview';
        sb.style.display = 'block';
        console.log('JavaScript makes the page interactive. Click the button in the preview.');
      }, 120);
      return;
    }
    pre.textContent = code.slice(0, ++pos) + '█';
    setTimeout(tick, 10);
  }
  tick();
}`,
      outputHeight: 320,
    },

    // ── 4. How the notebook cells work ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Anatomy of a Notebook Cell\n\nEvery interactive cell in this course has the same structure:\n\n**Editor tabs (HTML / CSS / JS)** — each tab holds one layer of the page. The JS tab is where most of your work happens. You can switch between tabs to read or edit any layer.\n\n**Run** — executes the cell. The preview updates and the console below streams any \`console.log\` output. You will press this after every edit.\n\n**Reset** — restores the editor to the original starter code. Use this when you want to start over.\n\n**Challenge cells** look different: a purple header, a prompt above the editor, and a green/red result banner after you press Run. Challenges are gated — they appear only after the lesson slides that teach the concept being tested.\n\n**Sequential locking** — cells unlock in order. You cannot skip ahead. Each cell builds on the one before it.`,
    },

    // ── 5. "JavaScript is alive" animated demo ───────────────────────────────
    {
      type: 'js',
      instruction: `Press Run. No editing. No output to inspect.\n\nThis cell has one purpose: show you that JavaScript is live, responsive, and already running in your browser before you have written a single line yourself.\n\nThe animation you are about to see — the pulsing rings, the ticker, the cycling messages — is powered by exactly the same language you are about to learn. It runs in real time inside the same kind of iframe every lesson uses.\n\nAfter the course, you will build things like this from scratch.`,
      html: `<div class="scene">
  <div class="rings">
    <div class="ring r1"></div>
    <div class="ring r2"></div>
    <div class="ring r3"></div>
  </div>
  <div class="core">
    <div class="lang-label">JavaScript</div>
    <div class="sub" id="sub">is live in your browser</div>
  </div>
  <div class="ticker" id="tk">000000</div>
  <div class="dots" id="dots"></div>
</div>`,
      css: `body{padding:0;margin:0;overflow:hidden;height:100vh;background:radial-gradient(ellipse at 50% 50%,#0a1a30 0%,#020810 100%)}
.scene{height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.rings{position:absolute;display:flex;align-items:center;justify-content:center}
.ring{position:absolute;border-radius:50%;border:1px solid rgba(56,189,248,0.3);animation:pulse 3s ease-out infinite}
.r1{width:120px;height:120px;animation-delay:0s}
.r2{width:200px;height:200px;animation-delay:.8s;border-color:rgba(56,189,248,0.18)}
.r3{width:300px;height:300px;animation-delay:1.6s;border-color:rgba(56,189,248,0.08)}
@keyframes pulse{0%{transform:scale(.85);opacity:.9}50%{transform:scale(1.06);opacity:.5}100%{transform:scale(.85);opacity:.9}}
.core{position:relative;text-align:center;z-index:2}
.lang-label{font:700 26px/1 'Fira Code',monospace;color:#38bdf8;letter-spacing:.08em;text-shadow:0 0 28px #38bdf866,0 0 60px #38bdf833;margin-bottom:12px}
.sub{font:400 13px/1 system-ui;color:#60a5fa;letter-spacing:.05em;transition:opacity .3s ease;min-height:18px}
.ticker{position:absolute;bottom:18px;right:20px;font:700 13px/1 'Fira Code',monospace;color:#1e3a58;letter-spacing:.1em}
.dots{position:absolute;inset:0;pointer-events:none}
.dot{position:absolute;border-radius:50%;animation:rise linear forwards}
@keyframes rise{0%{opacity:.9;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-280px) scale(.3)}}`,
      startCode: `var msgs = [
  'is live in your browser',
  'animates every element',
  'responds to your clicks',
  'makes pages interactive',
  'is what you will master',
  'runs right now, in this cell'
];
var mi = 0;
var sub = document.getElementById('sub');

setInterval(function() {
  sub.style.opacity = '0';
  setTimeout(function() {
    mi = (mi + 1) % msgs.length;
    sub.textContent = msgs[mi];
    sub.style.opacity = '1';
  }, 300);
}, 2200);

var n = 0;
var tk = document.getElementById('tk');
setInterval(function() {
  tk.textContent = String(++n).padStart(6, '0');
}, 35);

var colors = ['#38bdf8','#4ade80','#a78bfa','#fb923c','#f472b6'];
var dots = document.getElementById('dots');
function spawnDot() {
  var d = document.createElement('div');
  d.className = 'dot';
  var size = 3 + Math.random() * 5;
  d.style.width  = size + 'px';
  d.style.height = size + 'px';
  d.style.left   = (10 + Math.random() * 80) + '%';
  d.style.bottom = (5 + Math.random() * 20) + '%';
  d.style.background = colors[Math.floor(Math.random() * colors.length)];
  d.style.animationDuration = (2 + Math.random() * 2.5) + 's';
  d.style.boxShadow = '0 0 6px ' + colors[Math.floor(Math.random() * colors.length)] + '99';
  dots.appendChild(d);
  setTimeout(function() { d.remove(); }, 4500);
}
setInterval(spawnDot, 240);
console.log('JavaScript is running. Welcome to the notebook.');`,
      outputHeight: 280,
    },

    // ── 6. Ready ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### You are ready for Lesson 0.1\n\nYou now know how the tool works:\n- Each cell is a live HTML + CSS + JS environment\n- **Run** executes your code and updates the preview\n- **Reset** restores the starting code\n- Challenge cells test your understanding — green means pass, red means try again\n- Cells unlock sequentially — each concept builds on the last\n\nLesson 0.1 begins Phase 0: conceptual foundations. You are not writing JavaScript syntax yet — you are building the mental model that makes every line you write later *explainable*.\n\nMove to the next lesson when you are ready.`,
    },

  ],
};

export default {
  id: 'js-core-0-0-notebook-intro',
  slug: 'how-to-use-this-notebook',
  chapter: 'js0.1',
  order: 0,
  title: 'How to Use This Notebook',
  subtitle: 'Press Run. Watch code appear. See it render.',
  tags: ['javascript', 'notebook', 'intro', 'html', 'css', ],

  hook: {
    question: 'What happens when you press Run?',
    realWorldContext: 'Before writing code you need to know the tool. This lesson demos the notebook by building a live page from nothing.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'Every interactive cell is a live HTML + CSS + JS environment.',
      'HTML defines structure, CSS defines appearance, JavaScript defines behavior.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Just Press Run',
        body: 'In this lesson you are watching the notebook, not writing code. Press Run on each cell and observe.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Notebook Orientation: HTML, CSS, and JavaScript',
        props: {
          lesson: LESSON_JS_CORE_0_0,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'HTML = structure. CSS = appearance. JavaScript = behavior.',
    'Run executes the cell. The preview updates immediately.',
    'Reset restores the original code.',
    'Cells are sequential — each unlocks after the previous.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
