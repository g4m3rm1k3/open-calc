const LESSON_JS_CORE_0_1 = {
  title: 'What Is a Programming Language?',
  subtitle: 'Learn it as a visual system: syntax, semantics, spec, and engine.',
  sequential: true,

  cells: [
    {
      type: 'js',
      instruction: 'Slide 1: A language is a contract. Hit Run to animate the contract between human intent and machine behavior.',
      html: `<div class="stage">
  <div class="label top">Human Intent</div>
  <div class="arrow" id="flow"></div>
  <div class="label bottom">Machine Behavior</div>
  <div class="caption" id="status">Press Run to activate the contract.</div>
</div>`,
      css: `.stage {height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(180deg,#09111c,#101d2b);color:#dbeafe;border-radius:10px;}
.label {padding:8px 14px;border:1px solid #334155;border-radius:999px;background:#0f172a;font-weight:700;}
.arrow {width:4px;height:24px;background:#334155;position:relative;transition:all .5s ease;}
.arrow::after {content:'';position:absolute;bottom:-7px;left:-4px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #334155;}
.caption {font-size:12px;color:#93c5fd;text-align:center;}`,
      startCode: `const flow = document.getElementById('flow');
const status = document.getElementById('status');

flow.style.height = '94px';
flow.style.background = '#22d3ee';
flow.style.boxShadow = '0 0 18px #22d3ee99';
flow.style.transform = 'translateY(0)';
flow.style.setProperty('--head', '#22d3ee');
status.textContent = 'Language active: symbols now carry executable meaning.';
console.log('A programming language maps intent to behavior.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 2: Syntax is the shape of code. Run to see legal forms pass the gate.',
      html: `<div class="board">
  <div class="token" id="t1">const x = 4;</div>
  <div class="token" id="t2">if (x > 2) { ... }</div>
  <div class="token bad" id="t3">const = x 4;</div>
  <div class="gate" id="gate">Syntax Gate</div>
</div>`,
      css: `.board{height:100%;display:grid;grid-template-columns:1fr;gap:10px;padding:14px;background:#0b1220;border-radius:10px;}
.token{padding:8px 10px;border:1px solid #334155;background:#111c30;color:#e2e8f0;border-radius:8px;transition:all .35s ease;font-family:monospace;font-size:12px;}
.bad{opacity:.65}
.gate{margin-top:4px;padding:10px;border:1px dashed #334155;border-radius:8px;text-align:center;color:#93c5fd;font-weight:700;}`,
      startCode: `const good = ['t1', 't2'];
const bad = document.getElementById('t3');
const gate = document.getElementById('gate');

good.forEach((id, i) => {
  const el = document.getElementById(id);
  setTimeout(() => {
    el.style.borderColor = '#10b981';
    el.style.background = '#052e28';
    el.style.transform = 'translateX(8px)';
  }, i * 260);
});

setTimeout(() => {
  bad.style.borderColor = '#ef4444';
  bad.style.background = '#3a0d14';
  bad.style.transform = 'translateX(-4px)';
  gate.textContent = 'Syntax gate: accepted 2, rejected 1';
  console.log('Syntax checks form, not usefulness.');
}, 650);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 3: Semantics is meaning. Run to watch two different forms produce the same outcome.',
      html: `<div class="wrap">
  <div class="card"><div>2 + 3 * 4</div><div class="out" id="a">?</div></div>
  <div class="card"><div>2 + (3 * 4)</div><div class="out" id="b">?</div></div>
  <div class="eq" id="eq">Meaning not computed yet</div>
</div>`,
      css: `.wrap{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#0a1220;padding:14px;border-radius:10px;color:#e2e8f0;}
.card{border:1px solid #334155;border-radius:10px;padding:10px;background:#111827;display:flex;flex-direction:column;justify-content:space-between;}
.out{font-size:22px;font-weight:800;color:#93c5fd;text-align:right;}
.eq{grid-column:1/-1;text-align:center;border:1px dashed #334155;border-radius:8px;padding:8px;color:#93c5fd;}`,
      startCode: `const a = 2 + 3 * 4;
const b = 2 + (3 * 4);
document.getElementById('a').textContent = String(a);
document.getElementById('b').textContent = String(b);
const eq = document.getElementById('eq');
eq.textContent = a === b ? 'Different syntax, same semantics.' : 'Different meaning.';
eq.style.color = a === b ? '#34d399' : '#f87171';
console.log('a =', a, 'b =', b, 'equal =', a === b);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 4: Abstraction layers hide details. Run to reveal the stack from hardware up to your app.',
      html: `<div class="stack" id="stack"></div>`,
      css: `.stack{height:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;background:#0a1320;padding:14px;border-radius:10px;}
.layer{padding:8px 10px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#cbd5e1;opacity:.35;transform:translateY(10px);transition:all .35s ease;font-size:12px;}`,
      startCode: `const labels = ['Hardware', 'Operating System', 'JavaScript Engine', 'Runtime APIs', 'Your Program'];
const stack = document.getElementById('stack');
stack.innerHTML = labels.map((label) => '<div class="layer">' + label + '</div>').join('');

Array.from(stack.children).forEach((el, i) => {
  setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.background = i === labels.length - 1 ? '#082f49' : '#0f172a';
    el.style.borderColor = i === labels.length - 1 ? '#38bdf8' : '#334155';
  }, i * 220);
});
console.log('Abstraction lowers cognitive load while preserving behavior.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 5: ECMAScript is the spec; engines implement it. Run to animate one spec powering many engines.',
      html: `<div class="grid">
  <div class="spec" id="spec">ECMAScript Spec</div>
  <div class="engine" id="v8">V8</div>
  <div class="engine" id="sm">SpiderMonkey</div>
  <div class="engine" id="jsc">JavaScriptCore</div>
</div>`,
      css: `.grid{height:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:center;background:#0a1120;padding:14px;border-radius:10px;}
.spec{grid-column:1/-1;text-align:center;padding:10px;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#93c5fd;font-weight:800;}
.engine{padding:10px;border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;text-align:center;transition:all .35s ease;}`,
      startCode: `['v8', 'sm', 'jsc'].forEach((id, i) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    el.style.background = '#052e28';
    el.style.borderColor = '#10b981';
    el.textContent = el.textContent + ' ✓';
  }, i * 260);
});
console.log('One spec, multiple engines.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 6: Runtime context changes available APIs. Run and toggle between browser and server capabilities.',
      html: `<div class="ctx">
  <button id="browserBtn">Browser</button>
  <button id="serverBtn">Server</button>
  <ul id="list"></ul>
</div>`,
      css: `.ctx{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;flex-direction:column;gap:10px;}
button{padding:8px 10px;border:1px solid #334155;background:#111827;color:#cbd5e1;border-radius:8px;cursor:pointer;font-weight:700;}
ul{margin:0;padding-left:18px;color:#93c5fd;font-size:12px;line-height:1.8;}`,
      startCode: `const capabilities = {
  browser: ['DOM access', 'window object', 'user events'],
  server: ['filesystem', 'process APIs', 'raw network sockets'],
};
const list = document.getElementById('list');

function render(mode) {
  list.innerHTML = capabilities[mode].map((x) => '<li>' + x + '</li>').join('');
  console.log('Runtime mode:', mode);
}

document.getElementById('browserBtn').onclick = () => render('browser');
document.getElementById('serverBtn').onclick = () => render('server');
render('browser');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 7: Evaluation follows rules. Run to animate step-by-step substitution.',
      html: `<div class="trace">
  <div class="line" id="l1">x = 5</div>
  <div class="line" id="l2">y = x + 2</div>
  <div class="line" id="l3">z = y * 3</div>
  <div class="line out" id="l4">z = ?</div>
</div>`,
      css: `.trace{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;flex-direction:column;gap:8px;}
.line{padding:8px 10px;border:1px solid #334155;border-radius:8px;color:#cbd5e1;background:#111827;transition:all .3s ease;font-family:monospace;}
.out{color:#93c5fd;font-weight:800;}`,
      startCode: `const steps = [
  { id: 'l1', txt: 'x = 5' },
  { id: 'l2', txt: 'y = 5 + 2 = 7' },
  { id: 'l3', txt: 'z = 7 * 3 = 21' },
  { id: 'l4', txt: 'z = 21' },
];
steps.forEach((s, i) => {
  setTimeout(() => {
    const el = document.getElementById(s.id);
    el.textContent = s.txt;
    el.style.borderColor = '#22d3ee';
    el.style.background = '#082f49';
  }, i * 260);
});
console.log('Execution is deterministic when inputs are fixed.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 8: Determinism check. Run twice and compare outputs for same input.',
      html: `<div class="det">
  <div class="row">Input: <span id="input"></span></div>
  <div class="row">Run 1: <span id="r1">?</span></div>
  <div class="row">Run 2: <span id="r2">?</span></div>
  <div class="row" id="verdict">Not evaluated</div>
</div>`,
      css: `.det{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:8px;align-content:center;}
.row{padding:8px 10px;border:1px solid #334155;border-radius:8px;background:#111827;color:#dbeafe;font-family:monospace;}
#verdict{font-weight:800;color:#93c5fd;}`,
      startCode: `function f(n) { return n * n + 1; }
const n = 6;
const first = f(n);
const second = f(n);

document.getElementById('input').textContent = String(n);
document.getElementById('r1').textContent = String(first);
document.getElementById('r2').textContent = String(second);
const verdict = document.getElementById('verdict');
verdict.textContent = first === second ? 'Same input -> same output' : 'Non-deterministic';
verdict.style.color = first === second ? '#34d399' : '#f87171';
console.log('Deterministic function verified:', first === second);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 9: Language vs runtime APIs. Run to show core JS methods and host-provided APIs side-by-side.',
      html: `<div class="api-grid">
  <div><h4>Core JS (Spec)</h4><ul id="core"></ul></div>
  <div><h4>Browser Runtime</h4><ul id="host"></ul></div>
</div>`,
      css: `.api-grid{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
h4{margin:0 0 6px 0;color:#93c5fd;font-size:12px;}
ul{margin:0;padding-left:16px;color:#cbd5e1;font-size:12px;line-height:1.7;}`,
      startCode: `const core = ['Array.map', 'Promise.then', 'Object.keys'];
const host = ['document.querySelector', 'window.setTimeout', 'fetch'];

document.getElementById('core').innerHTML = core.map((x) => '<li>' + x + '</li>').join('');
document.getElementById('host').innerHTML = host.map((x) => '<li>' + x + '</li>').join('');
console.log('Core JS comes from spec; host APIs come from runtime environment.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: 'Slide 10: Concept map. Run to pulse all first-principles terms together before challenges.',
      html: `<div class="map">
  <div class="node" id="n1">Syntax</div>
  <div class="node" id="n2">Semantics</div>
  <div class="node" id="n3">Spec</div>
  <div class="node" id="n4">Engine</div>
</div>`,
      css: `.map{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-content:center;}
.node{padding:12px;border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;text-align:center;font-weight:800;transition:all .25s ease;}`,
      startCode: `['n1', 'n2', 'n3', 'n4'].forEach((id, i) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    el.style.background = '#082f49';
    el.style.borderColor = '#22d3ee';
    el.style.color = '#e0f2fe';
    el.style.transform = 'scale(1.03)';
  }, i * 180);
});
console.log('Vocabulary locked: syntax, semantics, spec, engine.');`,
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 1: Build a syntax/semantics demo. Define `left` and `right` so they use different syntax but evaluate to the same number. Log `left === right`.',
      html: `<div class="challenge-panel">
  <div>Goal: make the equality light turn green.</div>
  <div id="light">WAITING</div>
</div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;align-content:center;gap:10px;color:#cbd5e1;}
#light{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;font-weight:800;}`,
      startCode: `// Define both values and log equality.
// const left = ...
// const right = ...
// console.log(left === right)
`,
      solutionCode: `const left = 2 + 3 * 4;
const right = 2 + (3 * 4);
const same = left === right;
console.log(same);
document.getElementById('light').textContent = same ? 'PASS' : 'FAIL';
document.getElementById('light').style.background = same ? '#052e28' : '#3a0d14';
document.getElementById('light').style.borderColor = same ? '#10b981' : '#ef4444';`,
      check: (code) => /const\s+left/.test(code) && /const\s+right/.test(code) && /left\s*===\s*right/.test(code),
      successMessage: 'Great. You separated code form from meaning.',
      failMessage: 'Create left/right and log left === right.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 2: Model spec and engines. Create `specName` and `engines`, then log both.',
      html: `<div class="challenge-panel"><div id="status">Waiting for your model...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// const specName = 'ECMAScript';
// const engines = ['V8', 'SpiderMonkey'];
// console.log(specName);
// console.log(engines);
`,
      solutionCode: `const specName = 'ECMAScript';
const engines = ['V8', 'SpiderMonkey', 'JavaScriptCore'];
console.log(specName);
console.log(engines);
document.getElementById('status').textContent = specName + ' -> ' + engines.length + ' engines mapped';
document.getElementById('status').style.borderColor = '#10b981';`,
      check: (code) => /specName/.test(code) && /engines/.test(code) && /console\.log/.test(code),
      successMessage: 'Exactly right: one contract, many implementations.',
      failMessage: 'Declare specName, engines, and log both.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 3: Create `runtime` with `browser` and `server` arrays. Log one capability from each.',
      html: `<div class="challenge-panel"><div id="status">Waiting for runtime map...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// const runtime = {
//   browser: [...],
//   server: [...]
// };
// console.log(runtime.browser[0]);
// console.log(runtime.server[0]);
`,
      solutionCode: `const runtime = {
  browser: ['DOM', 'window'],
  server: ['filesystem', 'network sockets'],
};
console.log(runtime.browser[0]);
console.log(runtime.server[0]);
document.getElementById('status').textContent = 'Browser + Server capabilities mapped';
document.getElementById('status').style.borderColor = '#10b981';`,
      check: (code) => /runtime\s*=\s*\{/.test(code) && /browser/.test(code) && /server/.test(code) && /runtime\.browser\[0\]/.test(code) && /runtime\.server\[0\]/.test(code),
      successMessage: 'Nice. Language stayed the same while host capabilities changed.',
      failMessage: 'Define runtime.browser/runtime.server and log one item from each.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 4: In one console.log sentence, include all four words: syntax, semantics, spec, engine.',
      html: `<div class="challenge-panel"><div id="status">Waiting for final synthesis...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// Write one summary sentence and log it.
`,
      solutionCode: `const sentence = 'Syntax is form, semantics is meaning, spec is the contract, and the engine is the implementation.';
console.log(sentence);
document.getElementById('status').textContent = 'Synthesis complete.';
document.getElementById('status').style.borderColor = '#10b981';`,
      check: (code) => {
        const lower = code.toLowerCase();
        return lower.includes('console.log') && lower.includes('syntax') && lower.includes('semantics') && lower.includes('spec') && lower.includes('engine');
      },
      successMessage: 'First lesson complete. Your model is now precise and reusable.',
      failMessage: 'Your logged sentence must include syntax, semantics, spec, and engine.',
      outputHeight: 220,
    },
  ],
};

export default {
  id: 'js-core-0-1-language-model',
  slug: 'what-is-a-programming-language',
  chapter: 'js0.1',
  order: 0,
  title: 'What Is a Programming Language?',
  subtitle: 'Visual-first foundations: syntax, semantics, spec, and engines',
  tags: ['javascript', 'foundations', 'syntax', 'semantics', 'ecmascript', 'runtime'],

  hook: {
    question: 'If JavaScript runs in different places, what exactly remains invariant?',
    realWorldContext:
      'This lesson treats JavaScript as a system model, not trivia. You will see behavior directly through interactive visual cells.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'A programming language is a formal mapping from symbols to behavior.',
      'ECMAScript defines shared semantics; engines implement those semantics in real runtimes.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'No Passive Reading',
        body: 'Every cell is now visual and runnable so the concept is seen, not just described.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'JavaScript Core Notebook: Interactive Slide Lab',
        props: {
          lesson: LESSON_JS_CORE_0_1,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Syntax constrains valid structure; semantics determines meaning.',
    'The spec is the contract; engines are compliant implementations.',
    'Runtime context changes host APIs, not core language semantics.',
    'Deterministic code maps identical input to identical output.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
