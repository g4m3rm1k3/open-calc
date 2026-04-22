// J11 — Lesson 5-3: Anime.js — Animations from a CDN

const LESSON_JS_CORE_5_3 = {
  title: 'Anime.js — Animations from a CDN',
  subtitle: 'Build smooth, declarative animations with one of the most popular animation libraries.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — Why a Library for Animations?

CSS animations handle simple transitions. But when you need:
- Sequencing (A finishes, then B starts)
- Staggering (each item animates 100ms after the previous one)
- Keyframes with easing curves
- Animation callbacks and playback control
- Animating JavaScript values (not just CSS)

…writing raw CSS or requestAnimationFrame by hand becomes painful fast.

**Anime.js** is a lightweight (~17 KB) animation library. One CDN tag:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
\`\`\`

The core API:
\`\`\`js
anime({
  targets: '.box',           // CSS selector, DOM element, or array
  translateX: 250,           // animate CSS transform: translateX
  opacity: [0, 1],           // [from, to]
  duration: 800,             // ms
  easing: 'easeOutElastic(1, .5)',
  delay: anime.stagger(100), // stagger each target by 100ms
  complete: () => console.log('done'),
});
\`\`\`

Unlike CSS \`transition\`, Anime.js:
- Works on SVG attributes, object properties, and custom values — not just CSS
- Can be paused, reversed, seeked, and composed
- Provides a timeline API for complex sequences`,
    },

    {
      type: 'js',
      instruction: `### Basic Animations — Translate, Scale, Rotate, Color

Run this and click the buttons to see each animation type. Each calls \`anime()\` with different properties.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;display:flex;flex-direction:column;gap:12px;align-items:center;">
  <script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
    <div id="box1" style="width:60px;height:60px;background:#38bdf8;border-radius:8px;"></div>
    <div id="box2" style="width:60px;height:60px;background:#34d399;border-radius:8px;"></div>
    <div id="box3" style="width:60px;height:60px;background:#a78bfa;border-radius:8px;"></div>
    <div id="box4" style="width:60px;height:60px;background:#f472b6;border-radius:8px;"></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:380px;">
    <button id="btn1" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Translate</button>
    <button id="btn2" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Scale + Rotate</button>
    <button id="btn3" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Color + Radius</button>
    <button id="btn4" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Reset All</button>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `document.getElementById('btn1').onclick = () => {
  anime({
    targets: '#box1',
    translateX: [0, 120, 0],   // keyframes: go right, come back
    duration: 1200,
    easing: 'easeInOutQuad',
  });
};

document.getElementById('btn2').onclick = () => {
  anime({
    targets: '#box2',
    scale: [1, 1.4, 1],
    rotate: '1turn',            // 1 full rotation
    duration: 900,
    easing: 'easeOutElastic(1, .4)',
  });
};

document.getElementById('btn3').onclick = () => {
  anime({
    targets: '#box3',
    backgroundColor: ['#a78bfa', '#f59e0b', '#a78bfa'],
    borderRadius: ['8px', '50%', '8px'],
    duration: 1000,
    easing: 'easeInOutSine',
  });
};

document.getElementById('btn4').onclick = () => {
  anime({
    targets: ['#box1', '#box2', '#box3', '#box4'],
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
    borderRadius: '8px',
    backgroundColor: (el, i) => ['#38bdf8', '#34d399', '#a78bfa', '#f472b6'][i],
    duration: 400,
    easing: 'easeOutQuad',
  });
};

console.log('Anime.js loaded — click the buttons');`,
      outputHeight: 280,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Staggering and Timelines

**Staggering** applies a delay offset to each element in a group:

\`\`\`js
anime({
  targets: '.item',
  translateY: [-30, 0],
  opacity: [0, 1],
  delay: anime.stagger(80),        // 0ms, 80ms, 160ms, 240ms...
  easing: 'easeOutBack',
});
\`\`\`

**Stagger options:**
\`\`\`js
anime.stagger(100, { start: 200 })        // start after 200ms
anime.stagger(100, { from: 'center' })    // radiate from center element
anime.stagger(100, { direction: 'reverse' }) // last element first
\`\`\`

**Timelines** sequence animations:

\`\`\`js
const tl = anime.timeline({ easing: 'easeOutExpo', duration: 750 });

tl.add({ targets: '#title',   translateY: [-20, 0], opacity: [0, 1] })
  .add({ targets: '#subtitle', translateY: [-10, 0], opacity: [0, 1] }, '-=400')  // overlap by 400ms
  .add({ targets: '.cards',   translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(100) });
\`\`\`

The second argument to \`.add()\` is a time offset — \`'-=400'\` means start 400ms before the previous animation ends. \`'+=200'\` means 200ms after.`,
    },

    {
      type: 'js',
      instruction: `### Staggering — Entrance Animation

Click Run to see the cards animate in with a staggered entrance. This is the pattern used in every modern dashboard and landing page.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;min-height:240px;">
  <script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
  <div id="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">
    ${Array.from({length: 6}, (_, i) => `<div class="card" style="background:#1e2a3f;border:1px solid #334155;border-radius:10px;padding:16px;opacity:0;">
      <div style="color:#94a3b8;font-family:monospace;font-size:12px;">Card ${i + 1}</div>
      <div style="color:#38bdf8;font-family:monospace;font-size:20px;margin-top:4px;">${(Math.random() * 100 | 0)}%</div>
    </div>`).join('')}
  </div>
  <button id="replayBtn" style="width:100%;background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:8px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Replay</button>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `function runEntrance() {
  // Reset first
  anime.set('.card', { opacity: 0, translateY: 20, scale: 0.95 });

  anime({
    targets: '.card',
    opacity: [0, 1],
    translateY: [20, 0],
    scale: [0.95, 1],
    duration: 600,
    delay: anime.stagger(80, { easing: 'easeOutQuad' }),
    easing: 'easeOutBack(1.2)',
    complete: () => console.log('Entrance complete'),
  });
}

document.getElementById('replayBtn').onclick = runEntrance;
runEntrance();`,
      outputHeight: 300,
    },

    {
      type: 'js',
      instruction: `### Timeline — Sequenced Page Intro

Timelines let you orchestrate complex multi-step animations declaratively. This builds a page intro sequence.`,
      html: `<div style="background:#09111c;padding:24px;border-radius:12px;min-height:260px;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;">
  <script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
  <div id="logo" style="width:64px;height:64px;background:linear-gradient(135deg,#38bdf8,#a78bfa);border-radius:16px;opacity:0;"></div>
  <div id="headline" style="color:#e2e8f0;font-family:monospace;font-size:20px;font-weight:bold;opacity:0;">OpenCalc</div>
  <div id="tagline" style="color:#64748b;font-family:monospace;font-size:13px;opacity:0;">Learn JavaScript interactively.</div>
  <div style="display:flex;gap:8px;margin-top:4px;">
    <button id="getStarted" style="background:#3b82f6;border:none;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:13px;opacity:0;">Get Started</button>
    <button id="learnMore" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:monospace;font-size:13px;opacity:0;">Learn More</button>
  </div>
  <button id="replayBtn" style="margin-top:8px;background:transparent;border:1px solid #1e2a3f;color:#475569;padding:6px 14px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:11px;">Replay</button>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `function runIntro() {
  anime.set(['#logo', '#headline', '#tagline', '#getStarted', '#learnMore'], { opacity: 0 });

  const tl = anime.timeline({ easing: 'easeOutExpo' });

  tl
    .add({
      targets: '#logo',
      scale: [0.5, 1],
      opacity: [0, 1],
      rotate: [-15, 0],
      duration: 700,
    })
    .add({
      targets: '#headline',
      translateY: [-12, 0],
      opacity: [0, 1],
      duration: 500,
    }, '-=200')    // start 200ms before logo finishes
    .add({
      targets: '#tagline',
      translateY: [-8, 0],
      opacity: [0, 1],
      duration: 400,
    }, '-=100')
    .add({
      targets: ['#getStarted', '#learnMore'],
      translateY: [10, 0],
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(80),
      complete: () => console.log('Intro sequence complete'),
    }, '+=50');
}

document.getElementById('replayBtn').onclick = runIntro;
runIntro();`,
      outputHeight: 320,
    },

    {
      type: 'js',
      instruction: `### Animating SVG and Values

Anime.js can animate SVG path attributes and plain JavaScript object properties — not just CSS. This makes it possible to build animated charts, progress rings, and data visualizations.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;display:flex;flex-direction:column;gap:16px;align-items:center;">
  <script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
  <svg width="140" height="140" viewBox="0 0 140 140">
    <circle cx="70" cy="70" r="60" fill="none" stroke="#1e2a3f" stroke-width="10"/>
    <circle id="ring" cx="70" cy="70" r="60" fill="none" stroke="#38bdf8" stroke-width="10"
      stroke-linecap="round" stroke-dasharray="377" stroke-dashoffset="377"
      transform="rotate(-90 70 70)"/>
    <text id="pct" x="70" y="76" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="22">0%</text>
  </svg>
  <div style="display:flex;gap:8px;">
    <button id="btn25" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:7px 12px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">25%</button>
    <button id="btn75" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:7px 12px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">75%</button>
    <button id="btn100" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:7px 12px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">100%</button>
    <button id="btn0" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:7px 12px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px;">Reset</button>
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `const CIRCUMFERENCE = 2 * Math.PI * 60;  // 377
const pctEl = document.getElementById('pct');
const obj = { value: 0 };

function animateTo(percent) {
  anime({
    targets: obj,
    value: percent,
    duration: 700,
    easing: 'easeInOutQuad',
    update() {
      // Animate the SVG stroke-dashoffset (0 = full circle, CIRCUMFERENCE = empty)
      const offset = CIRCUMFERENCE * (1 - obj.value / 100);
      document.getElementById('ring').setAttribute('stroke-dashoffset', offset);
      pctEl.textContent = Math.round(obj.value) + '%';
    },
  });
}

document.getElementById('btn25').onclick = () => animateTo(25);
document.getElementById('btn75').onclick = () => animateTo(75);
document.getElementById('btn100').onclick = () => animateTo(100);
document.getElementById('btn0').onclick = () => animateTo(0);

console.log('SVG progress ring ready');`,
      outputHeight: 300,
    },

    {
      type: 'challenge',
      instruction: `### Challenge: Staggered List Entrance

Using Anime.js (already loaded in the HTML), animate all \`.item\` elements so they:
- Start at opacity 0 and translateX -30
- Animate to opacity 1 and translateX 0
- Use \`anime.stagger(100)\` for delay
- Duration 500ms, easing \`'easeOutCubic'\`

Log \`'animated'\` in the \`complete\` callback.`,
      html: `<div style="background:#09111c;padding:20px;border-radius:12px;">
  <script src="https://cdn.jsdelivr.net/npm/animejs@3/lib/anime.min.js"></script>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${['JavaScript', 'CSS', 'HTML', 'Anime.js', 'Chart.js'].map((label, i) =>
      `<div class="item" style="background:#1e2a3f;border:1px solid #334155;color:#94a3b8;padding:10px 14px;border-radius:8px;font-family:monospace;font-size:13px;opacity:0;">${label}</div>`
    ).join('')}
  </div>
</div>`,
      css: `body{margin:0;padding:0;background:#09111c;}`,
      startCode: `// Animate the .item elements in with a staggered entrance
// opacity: 0 → 1, translateX: -30 → 0
// delay: anime.stagger(100), duration: 500, easing: 'easeOutCubic'
// log 'animated' when complete`,
      solutionCode: `anime({
  targets: '.item',
  opacity: [0, 1],
  translateX: [-30, 0],
  duration: 500,
  delay: anime.stagger(100),
  easing: 'easeOutCubic',
  complete: () => console.log('animated'),
});`,
      check: (code, logs) =>
        /anime\s*\(/.test(code) &&
        /stagger/.test(code) &&
        /translateX/.test(code) &&
        logs[0] === 'animated',
      successMessage: 'Correct! Staggered list entrances are one of the most common UI animation patterns — they draw the eye sequentially down the list.',
      failMessage: 'Call anime({ targets: \'.item\', opacity, translateX, delay: anime.stagger(100), duration, easing, complete }).',
      outputHeight: 280,
    },

  ],
};

export default {
  id: 'js-core-5-3-animejs',
  slug: 'animejs-animations-from-cdn',
  chapter: 'js5.1',
  order: 2,
  title: 'Anime.js — Animations from a CDN',
  subtitle: 'Declarative animations, staggering, timelines, SVG, and smooth UI motion.',
  tags: ['javascript', 'animejs', 'animation', 'cdn', 'svg', 'timeline', 'stagger'],

  hook: {
    question: 'How do you build smooth, sequenced animations without writing requestAnimationFrame by hand?',
    realWorldContext: 'Anime.js powers entrance animations, data visualization transitions, and UI micro-interactions across thousands of production apps. One script tag, a declarative API, and zero dependencies.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'anime({ targets, property: value, duration, easing }) — the core API.',
      'Arrays as property values mean [from, to]. Single values animate from current to target.',
      'anime.stagger(ms) delays each target element incrementally.',
      'anime.timeline() sequences multiple animations with time offsets.',
      'Anime.js can animate SVG attributes and plain JS object properties, not just CSS.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Easing Reference',
        body: 'Anime.js ships with easeIn/Out/InOut variants for: Linear, Quad, Cubic, Quart, Quint, Sine, Expo, Circ, Elastic, Back, Bounce. Plus spring physics via spring(). The elastic and back easings are best for UI elements that feel "alive".',
      },
      {
        type: 'tip',
        title: 'Performance',
        body: 'Anime.js animates transform and opacity by default — these are GPU-composited and do not trigger layout reflow. Avoid animating width, height, top, left — use translate instead. The library handles this automatically when you use translateX/Y.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Anime.js — Animations from a CDN',
        props: { lesson: LESSON_JS_CORE_5_3 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'anime({ targets, property, duration, easing, delay, complete }) — core call.',
    '[from, to] syntax for property values. Array values = keyframe sequence.',
    'anime.stagger(ms) — increments delay per target element.',
    'anime.timeline() — add() in sequence with offset string ("-=300" = overlap).',
    'animate: transform, opacity, SVG attributes, JS object properties.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
