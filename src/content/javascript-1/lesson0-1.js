const LESSON_JS_CORE_0_1 = {
  title: 'What Is a Programming Language?',
  subtitle: 'Learn it as a visual system: syntax, semantics, spec, and engine.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### Before You Begin\n\nThis is a **conceptual lesson** — you are building mental models, not writing JavaScript yet. Every line of code you write later will be more reliable when these foundations are precise.\n\nFor each visual cell:\n1. **Read the instruction fully** before pressing Run.\n2. **Form a prediction** — what should this show?\n3. **Run it**, then explain which rule produced that behavior.\n\nBy the end of this lesson you will have four precise terms: **syntax**, **semantics**, **spec**, **engine**. These terms replace vague explanations like "JavaScript does weird things."`,
    },
    {
      type: 'js',
      instruction: `### The Programming Language Contract\n\nA programming language is a formal contract between a developer and a machine.\n\nWhen you write code, you are not issuing hardware instructions directly. You are writing symbols that follow the rules of a **language specification** — a precise document that defines what those symbols must mean. Any engine that correctly implements that spec will honor those rules and produce the same result.\n\nThis contract separates two things:\n- **What** must happen — defined by the spec\n- **How** it happens — decided by the engine\n\nThe animation below shows this flow. Run it and watch human intent connect to machine behavior through the language contract.`,
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
      instruction: `### Syntax: The Rules of Grammar\n\n**Syntax** is the structural grammar of a language — the rules that define whether code is well-formed.\n\nA syntax check happens **before** any code runs. The parser reads the tokens you wrote and verifies they follow legal patterns. If the structure is wrong (wrong order, missing bracket, misplaced keyword), execution stops immediately with a \`SyntaxError\`. Your code never runs at all.\n\n> **Important**: Syntax says nothing about whether your code is correct or useful — only whether it is structurally legal.\n\n"Eat the car quietly" is grammatically valid English but makes no sense. Same idea applies here. The three tokens below illustrate this. Two pass the structure check; one does not. Watch the gate classify them.`,
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
  }, i * 520);
});

setTimeout(() => {
  bad.style.borderColor = '#ef4444';
  bad.style.background = '#3a0d14';
  bad.style.transform = 'translateX(-4px)';
  gate.textContent = 'Syntax gate: accepted 2, rejected 1';
  console.log('Syntax checks form, not usefulness.');
}, 1400);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Semantics: The Meaning\n\n**Semantics** is what code means — the value or behavior it produces when executed.\n\nTwo pieces of code with different appearances can share identical semantics if they evaluate to the same result. JavaScript follows standard operator precedence: multiplication runs before addition. So both \`2 + 3 * 4\` and \`2 + (3 * 4)\` mean exactly the same thing — they both produce 14.\n\n**Key Insight**:\n- You can write the same meaning in multiple syntactic forms.\n- You can write similar-looking code that has different meanings.\n\nRun the cell and confirm both expressions evaluate to the same value.`,
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
      instruction: `### One Spec, Many Engines\n\n**ECMAScript** is the name of the JavaScript language specification. It is a published standard document — currently maintained by the TC39 committee — that precisely defines how every feature must behave.\n\n**V8** (Chrome/Node), **SpiderMonkey** (Firefox), and **JavaScriptCore** (Safari) are separate implementations of that specification. They compete on speed and efficiency, but they must all produce the same results for any valid JavaScript program.\n\n> **Key takeaway**: Your code targets the **spec**. Any engine that correctly implements the spec will execute it correctly.\n\nWatch the three engines each confirm compliance with the spec.`,
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
  }, i * 520);
});
console.log('One spec, multiple engines.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Browser vs. Server Runtimes\n\nThe core JavaScript language — syntax, operators, and types — is identical whether code runs in a browser or on a server. What changes are the **Host APIs**.\n\n- **Browser Runtime**: Exposes the DOM (\`document\`), \`window\`, and user events.\n- **Node.js Runtime**: Exposes the filesystem (\`fs\`), \`process\`, and networking.\n\nNeither set is part of the JavaScript spec; they are provided by the environment. This is why \`document is not defined\` appears in Node.js. The language stayed the same; the environment changed.\n\nCompare what each environment provides below.`,
      html: `<div class="ctx">
  <div class="btns">
    <button id="browserBtn">Browser</button>
    <button id="serverBtn">Server</button>
  </div>
  <ul id="list"></ul>
</div>`,
      css: `.ctx{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;flex-direction:column;gap:10px;}
.btns{display:flex;gap:8px;}
button{flex:1;padding:8px;border:1px solid #334155;background:#111827;color:#cbd5e1;border-radius:8px;cursor:pointer;font-weight:700;}
ul{margin:0;padding-left:18px;color:#93c5fd;font-size:12px;line-height:1.8;}`,
      startCode: `const capabilities = {
  browser: ['DOM (document.querySelector)', 'window object', 'User Events (clicks)'],
  server: ['File System (fs)', 'Process Management', 'Network Sockets'],
};
const list = document.getElementById('list');

function render(mode) {
  list.innerHTML = capabilities[mode].map((x) => '<li>' + x + '</li>').join('');
  console.log('Runtime changed to:', mode);
}

document.getElementById('browserBtn').onclick = () => render('browser');
document.getElementById('serverBtn').onclick = () => render('server');
render('browser');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Substitution & Evaluation\n\nJavaScript evaluates expressions by substituting known values step by step. This is how the engine "thinks."\n\nIf \`x = 5\`, the engine sees \`y = x + 2\` and substitutes it: \`y = 5 + 2 = 7\`. When it later sees \`z = y * 3\`, it substitutes: \`z = 7 * 3 = 21\`. \n\nThis **substitution model** is your primary debugging tool. When code behaves unexpectedly, trace the substitutions. The answer is always in the values.\n\nWatch each line collapse. Deterministic values make code predictable.`,
      html: `<div class="trace">
  <div class="line" id="l1">x = 5</div>
  <div class="line" id="l2">y = x + 2</div>
  <div class="line" id="l3">z = y * 3</div>
  <div class="line out" id="l4">z = ?</div>
</div>`,
      css: `.trace{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;flex-direction:column;gap:8px;}
.line{padding:8px 10px;border:1px solid #334155;border-radius:8px;color:#cbd5e1;background:#111827;transition:all .3s ease;font-family:monospace;}
.out{color:#93c5fd;font-weight:800;border-color:#38bdf8;}`,
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
    if(i === steps.length - 1) {
       el.style.borderColor = '#10b981';
       el.style.background = '#06201b';
    } else {
       el.style.borderColor = '#38bdf8';
       el.style.background = '#082f49';
    }
  }, i * 520);
});
console.log('Execution is substitution of values.');`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `A function is deterministic if the same input always produces the same output — no matter how many times you call it or when.\n\nDeterminism is a prerequisite for reliable reasoning. If f(6) always returns 37, you can substitute f(6) with 37 anywhere in your mental model. If f(6) might return different values depending on hidden state, your reasoning breaks down.\n\nMost real-world bugs occur when code that should be deterministic secretly depends on external state — a global variable that changed, a network response that varied, a timestamp that shifted. Pure deterministic functions have no such dependencies.\n\nRun the function twice with the same input and confirm it returns the same value.`,
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
      instruction: `As you write more JavaScript, you will use hundreds of APIs. It matters which layer they come from.\n\nECMAScript spec features like Array.map, Promise.then, and Object.keys are guaranteed to work identically in every conforming JavaScript environment — browser, server, edge runtime, or embedded device.\n\nHost APIs like document.querySelector, window.setTimeout, and fetch are provided by the environment. Some are shared across environments (setTimeout was eventually added to the spec). Others are browser-only or Node-only. When you see "document is not defined" in Node.js, you have hit this boundary.\n\nCore language features travel with you everywhere. Host APIs depend on where you are.`,
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
      instruction: `Before moving to challenges, lock in the four core terms from this lesson.\n\nSyntax — the structural rules that determine whether code is well-formed. Checked before execution.\nSemantics — the meaning or value a piece of code produces when it runs.\nSpec (ECMAScript) — the contract that defines what every language feature must do.\nEngine — the implementation that executes your code according to the spec.\n\nThese four terms replace vague descriptions. Every confusing JavaScript behavior has an explanation in these terms — never in "JavaScript is weird."\n\nRun to activate the map. Then, before looking at challenges, write a one-sentence definition for each term in your own words.`,
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
  }, i * 420);
});
console.log('Vocabulary locked: syntax, semantics, spec, engine.');`,
      outputHeight: 220,
    },
    {
      type: 'markdown',
      instruction: `### Before Challenges\n\nThese challenges test your **understanding of the concepts**, not your ability to write JavaScript. You are not expected to know JavaScript syntax yet — that starts in Phase 1.\n\nEach challenge gives you code that is mostly pre-written. Your job is to:\n- Change a single value to reflect your prediction or understanding\n- Or complete a single console.log with your own words\n\nDo not guess. If you are unsure of an answer, rerun the relevant visual cell and reason from the model before submitting.`,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 1: Operator precedence prediction. In Slide 3 you saw that multiplication runs before addition. What does 5 + 2 * 3 evaluate to? Change myAnswer to your predicted number, then run to check.',
      html: `<div class="challenge-panel">
  <div>Goal: set myAnswer to the correct value.</div>
  <div id="light">WAITING</div>
</div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;align-content:center;gap:10px;color:#cbd5e1;}
#light{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;font-weight:800;}`,
      startCode: `// Multiplication runs before addition (operator precedence).
// 5 + 2 * 3  means  5 + (2 * 3)
//
// Change myAnswer to your predicted number.
const myAnswer = 0;

const actual = 5 + 2 * 3;
console.log('My answer:', myAnswer);
console.log('Actual:', actual);
console.log('Correct?', myAnswer === actual);
document.getElementById('light').textContent = myAnswer === actual ? 'PASS' : 'FAIL — try again';
document.getElementById('light').style.background = myAnswer === actual ? '#052e28' : '#3a0d14';
document.getElementById('light').style.borderColor = myAnswer === actual ? '#10b981' : '#ef4444';
`,
      solutionCode: `const myAnswer = 11;
const actual = 5 + 2 * 3;
console.log('My answer:', myAnswer);
console.log('Actual:', actual);
console.log('Correct?', myAnswer === actual);
document.getElementById('light').textContent = 'PASS';
document.getElementById('light').style.background = '#052e28';
document.getElementById('light').style.borderColor = '#10b981';
`,
      check: (code) => /myAnswer\s*=\s*11/.test(code),
      successMessage: 'Correct. Semantics (operator precedence) determines meaning, not surface appearance.',
      failMessage: 'Multiplication runs first: 2 * 3 = 6, then 5 + 6 = ?',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 2: Spec vs engine. ECMAScript is the spec; V8 is an engine. Change whatIsECMAScript and whatIsV8 to the strings "spec" or "engine" to classify each correctly.',
      html: `<div class="challenge-panel"><div id="status">Waiting for your classification...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Options: 'spec' or 'engine'
const whatIsECMAScript = '???'; // change this
const whatIsV8 = '???';          // change this

const correct = whatIsECMAScript === 'spec' && whatIsV8 === 'engine';
console.log('ECMAScript is the:', whatIsECMAScript);
console.log('V8 is an:', whatIsV8);
console.log('Correct?', correct);
document.getElementById('status').textContent = correct ? 'Correct!' : 'Check your answers.';
document.getElementById('status').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const whatIsECMAScript = 'spec';
const whatIsV8 = 'engine';
const correct = whatIsECMAScript === 'spec' && whatIsV8 === 'engine';
console.log('ECMAScript is the:', whatIsECMAScript);
console.log('V8 is an:', whatIsV8);
console.log('Correct?', correct);
document.getElementById('status').textContent = 'Correct!';
document.getElementById('status').style.borderColor = '#10b981';
`,
      check: (code) => /whatIsECMAScript\s*=\s*['"]spec['"]/.test(code) && /whatIsV8\s*=\s*['"]engine['"]/.test(code),
      successMessage: 'Exactly right: one contract, many implementations.',
      failMessage: 'ECMAScript is the published standard (spec). V8 is an implementation (engine).',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 3: Identify the syntax error. Line A is valid JavaScript. Line B has a syntax error. Change errorLine to the letter of the broken line.',
      html: `<div class="challenge-panel"><div id="status">Waiting for your answer...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Line A:  const greeting = 'hello';   <- valid structure
// Line B:  const = greeting 'hello';   <- broken structure
//
// Which line has a syntax error? Change errorLine to 'A' or 'B'.
const errorLine = '?';

const correct = errorLine === 'B';
console.log('Syntax error is on line:', errorLine);
console.log('Correct?', correct);
document.getElementById('status').textContent = correct ? 'Correct!' : 'Look at each line carefully.';
document.getElementById('status').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const errorLine = 'B';
const correct = errorLine === 'B';
console.log('Syntax error is on line:', errorLine);
console.log('Correct?', correct);
document.getElementById('status').textContent = 'Correct!';
document.getElementById('status').style.borderColor = '#10b981';
`,
      check: (code) => /errorLine\s*=\s*['"]B['"]/.test(code),
      successMessage: 'Line B puts the = before the name, which violates the grammar rule for declarations.',
      failMessage: 'In Line B the tokens are in the wrong order: "const = greeting" is not valid structure.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 4: Synthesis. Write one sentence inside console.log that uses all four terms from this lesson: syntax, semantics, spec, engine.',
      html: `<div class="challenge-panel"><div id="status">Waiting for your synthesis...</div></div>`,
      css: `.challenge-panel{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#status{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Replace the ??? with a sentence that includes:
// syntax, semantics, spec, engine
console.log('???');
`,
      solutionCode: `console.log('Syntax is form, semantics is meaning, the spec is the contract, and the engine is the implementation that runs it.');
document.getElementById('status').textContent = 'Synthesis complete.';
document.getElementById('status').style.borderColor = '#10b981';
`,
      check: (code) => {
        const lower = code.toLowerCase();
        return lower.includes('console.log') && lower.includes('syntax') && lower.includes('semantics') && lower.includes('spec') && lower.includes('engine');
      },
      successMessage: 'First lesson complete. Your model is now precise and reusable.',
      failMessage: 'Your logged sentence must include all four terms: syntax, semantics, spec, and engine.',
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
        body: 'Every cell is visual and runnable. The concept is seen, not just described.',
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
