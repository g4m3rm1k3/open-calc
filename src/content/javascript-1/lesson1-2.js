const LESSON_JS_CORE_1_2 = {
  title: 'Expressions vs Statements',
  subtitle: 'How JavaScript decides whether code produces a value or controls execution.',
  sequential: true,

  cells: [
    // ─── SECTION 1: The Core Split ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Core Split

JavaScript code is made of two fundamental kinds of things:

**Expressions** — code that *produces a value*. You can use an expression anywhere a value is expected.

**Statements** — code that *does something* (controls flow, declares names, loops). Statements do not produce a usable value.

Quick reference:

| Kind | Example | Produces a value? |
|---|---|---|
| Expression | \`2 + 3\` | yes — \`5\` |
| Expression | \`score >= 70 ? 'pass' : 'fail'\` | yes |
| Statement | \`if (x > 0) { ... }\` | no |
| Statement | \`for (let i = 0; ...)\` | no |

The reason this matters: **you can only embed expressions**, not statements, inside other expressions.`,
    },

    // ─── CELL 1: Expression → Value ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Expression → Value

Every expression evaluates to a concrete value. Here we evaluate \`2 + 3 * 4\` and display the result. Operator precedence applies, so multiplication runs first.

Open the **Console** tab to see the log.`,
      html: `<div class="panel">
  <div class="label">Expression</div>
  <div class="code-box">2 + 3 * 4</div>
  <div class="label">Evaluates to</div>
  <div id="val" class="result-box">?</div>
  <div class="hint">Multiplication before addition: 3 * 4 = 12, then 2 + 12 = 14</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:monospace;color:#cbd5e1;}
.label{color:#94a3b8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.code-box{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;font-size:14px;}
.result-box{background:#0c2035;border:1px solid #38bdf8;border-radius:8px;padding:10px;font-size:18px;font-weight:800;color:#38bdf8;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `const result = 2 + 3 * 4;
console.log('2 + 3 * 4 =', result);
document.getElementById('val').textContent = result;`,
      outputHeight: 220,
    },

    // ─── CELL 2: Markdown — Expressions can be nested ─────────────────────────
    {
      type: 'markdown',
      instruction: `### Expressions Can Nest

Because every expression produces a value, you can drop one inside another:

\`\`\`js
(2 + 3) * (4 + 1)   // inner (2+3) → 5, inner (4+1) → 5, outer → 25
\`\`\`

Every operand slot in an expression can be filled by another expression. That recursive structure is what makes JavaScript code composable.`,
    },

    // ─── CELL 3: Assignment is also an expression ──────────────────────────────
    {
      type: 'js',
      instruction: `### Assignment is an Expression

\`x = 5\` is an expression — it *returns the assigned value* (5).

That means you can use an assignment inside another expression:

\`\`\`js
const y = (x = 5); // x becomes 5, y becomes 5
\`\`\`

This is often called a **chained assignment**.`,
      html: `<div class="panel">
  <div class="label">Assignment chain</div>
  <div class="code-box">const y = (x = 5)</div>
  <div id="aout" class="result-box">x = ?, y = ?</div>
  <div class="hint">Assignment returns the value it assigned.</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:monospace;color:#cbd5e1;}
.label{color:#94a3b8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.code-box{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;font-size:14px;}
.result-box{background:#0c2035;border:1px solid #38bdf8;border-radius:8px;padding:10px;font-size:15px;font-weight:800;color:#38bdf8;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `let x = 0;
const y = (x = 5);
console.log('x:', x);
console.log('y:', y);
document.getElementById('aout').textContent = 'x = ' + x + ', y = ' + y;`,
      outputHeight: 200,
    },

    // ─── CELL 4: Markdown — Statements control execution ──────────────────────
    {
      type: 'markdown',
      instruction: `### Statements Control Execution

Statements *direct* what the engine does next. They do not produce values you can capture.

- \`if\` — conditionally runs a block
- \`for\` — repeats a block
- \`while\` — repeats while a condition is true
- \`return\` — exits a function with an optional value
- \`throw\` — raises an error

You cannot write:

\`\`\`js
const x = if (score > 70) { 'pass' };  // SYNTAX ERROR
\`\`\`

Because \`if\` is a statement, not an expression. It produces no value to assign.`,
    },

    // ─── CELL 5: if vs ternary ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### if (statement) vs ternary (expression)

The \`if\` keyword is a statement — it runs a block but returns nothing.

The ternary \`condition ? a : b\` is an expression — it evaluates to either \`a\` or \`b\`.

Run the cell and compare both outputs.`,
      html: `<div class="compare">
  <div class="card">
    <div class="card-label">if statement</div>
    <div id="r1" class="card-val">?</div>
  </div>
  <div class="card">
    <div class="card-label">ternary expression</div>
    <div id="r2" class="card-val">?</div>
  </div>
  <div class="footer">Both choose a value — only one IS a value.</div>
</div>`,
      css: `.compare{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:14px;align-content:start;font-family:monospace;}
.card{background:#111827;border:1px solid #334155;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;}
.card-label{color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;}
.card-val{background:#0c2035;border:1px solid #38bdf8;border-radius:8px;padding:8px;color:#38bdf8;font-weight:800;text-align:center;font-size:15px;}
.footer{grid-column:1/-1;color:#64748b;font-size:11px;}`,
      startCode: `const score = 82;

// if statement — no return value
let label1 = '';
if (score >= 70) {
  label1 = 'pass';
} else {
  label1 = 'fail';
}

// ternary expression — returns a value directly
const label2 = score >= 70 ? 'pass' : 'fail';

console.log('if result:', label1);
console.log('ternary result:', label2);
document.getElementById('r1').textContent = label1;
document.getElementById('r2').textContent = label2;`,
      outputHeight: 200,
    },

    // ─── CELL 6: Function declaration vs function expression ──────────────────
    {
      type: 'markdown',
      instruction: `### Function Declarations vs Function Expressions

A function can be created two ways:

\`\`\`js
// Declaration — this is a STATEMENT
function add(a, b) { return a + b; }

// Expression — this is a VALUE stored in a variable
const add = function(a, b) { return a + b; };

// Arrow expression — also a VALUE
const add = (a, b) => a + b;
\`\`\`

**Key difference**: A function expression can appear anywhere a value is expected (as an argument, returned from another function, stored in an array). A declaration cannot.`,
    },

    {
      type: 'js',
      instruction: `### Functions as Values

Because a function expression is a value, you can pass it directly as an argument — no need to name it first.

Run this and watch the console.`,
      html: `<div class="panel">
  <div class="label">Functions as first-class values</div>
  <div id="fout" class="result-box">?</div>
  <div class="hint">The anonymous arrow function was passed directly as an argument.</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:monospace;color:#cbd5e1;}
.label{color:#94a3b8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.result-box{background:#0c2035;border:1px solid #38bdf8;border-radius:8px;padding:10px;font-size:14px;color:#38bdf8;font-weight:800;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `const nums = [3, 1, 4, 1, 5, 9, 2];

// Arrow function expression passed directly as an argument
const sorted = nums.slice().sort((a, b) => a - b);

console.log('original:', nums.join(', '));
console.log('sorted:  ', sorted.join(', '));

document.getElementById('fout').textContent = 'sorted: ' + sorted.join(', ');`,
      outputHeight: 180,
    },

    // ─── CELL 7: Object literal vs block statement ─────────────────────────────
    {
      type: 'markdown',
      instruction: `### Curly Braces: Block vs Object Literal

\`{}\` is ambiguous in JavaScript:

- At the **start of a statement**, JS treats \`{}\` as a **block** of code.
- Inside an **expression** context (after \`=\`, inside \`()\`, etc.), JS treats \`{}\` as an **object literal**.

Arrow functions expose this trap:

\`\`\`js
const bad  = () => { name: 'Ada' };   // JS reads { } as a BLOCK — returns undefined
const good = () => ({ name: 'Ada' }); // wrapping in () forces object literal expression
\`\`\`

The parentheses around \`{ }\` tell JS: "an expression starts here", which forces object literal interpretation.`,
    },

    {
      type: 'js',
      instruction: `### Blocks vs Objects: Live Demo

Run the cell and compare what \`bad()\` and \`good()\` return.`,
      html: `<div class="panel">
  <div class="label">bad() — block statement —</div>
  <div id="bad" class="result-box result-bad">?</div>
  <div class="label">good() — object expression —</div>
  <div id="good" class="result-box result-good">?</div>
  <div class="hint">Wrap object literals in ( ) when returning from an arrow function.</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:8px;font-family:monospace;color:#cbd5e1;}
.label{color:#94a3b8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.result-box{border-radius:8px;padding:10px;font-size:14px;font-weight:800;}
.result-bad{background:#1f0a0a;border:1px solid #ef4444;color:#f87171;}
.result-good{background:#0c2035;border:1px solid #10b981;color:#34d399;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `const bad  = () => { name: 'Ada' };       // block, returns undefined
const good = () => ({ name: 'Ada' });    // object expression

console.log('bad():', bad());
console.log('good():', good());

document.getElementById('bad').textContent  = 'bad()  = ' + bad();
document.getElementById('good').textContent = 'good() = ' + JSON.stringify(good());`,
      outputHeight: 200,
    },

    // ─── CELL 8: Short-circuit expressions ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Short-Circuit Expressions

\`&&\` and \`||\` are expressions that return one of their operands, not just \`true\`/\`false\`:

- \`A && B\` — evaluates \`A\`. If falsy, returns \`A\`. If truthy, returns \`B\`.
- \`A || B\` — evaluates \`A\`. If truthy, returns \`A\`. If falsy, returns \`B\`.

This lets you write conditional side effects as expressions:

\`\`\`js
isReady && launch();       // launch() only runs if isReady is truthy
name = name || 'default';  // use 'default' if name is falsy
\`\`\``,
    },

    {
      type: 'js',
      instruction: `### Short-Circuits in Action

Watch the console — only the truthy branch fires.`,
      html: `<div class="panel">
  <div id="sc1" class="row">&&: ?</div>
  <div id="sc2" class="row">||: ?</div>
  <div class="hint">Short-circuit stops evaluation as soon as the result is determined.</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:monospace;color:#cbd5e1;}
.row{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;font-size:13px;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `const isLoggedIn = true;
const username = '';

const greeting = isLoggedIn && 'Welcome back!';
const displayName = username || 'Guest';

console.log('&& result:', greeting);
console.log('|| result:', displayName);

document.getElementById('sc1').textContent = '&& result: ' + greeting;
document.getElementById('sc2').textContent = '|| result: ' + displayName;`,
      outputHeight: 180,
    },

    // ─── CELL 9: Evaluation order ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Evaluation Order

JavaScript evaluates operands **left to right**. Run this and watch the call order in the console.`,
      html: `<div class="panel">
  <div id="ord" class="row">call order: ?</div>
  <div id="tot" class="row">total: ?</div>
  <div class="hint">Left sub-expression is always evaluated before right.</div>
</div>`,
      css: `.panel{height:100%;background:#0a1220;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px;font-family:monospace;color:#cbd5e1;}
.row{background:#111827;border:1px solid #334155;border-radius:8px;padding:10px;font-size:13px;}
.hint{color:#64748b;font-size:11px;}`,
      startCode: `const log = [];
function A() { log.push('A'); return 1; }
function B() { log.push('B'); return 2; }
function C() { log.push('C'); return 3; }

const total = A() + B() + C();

console.log('Call order:', log.join(' -> '));
console.log('Total:', total);

document.getElementById('ord').textContent = 'call order: ' + log.join(' -> ');
document.getElementById('tot').textContent = 'total: ' + total;`,
      outputHeight: 180,
    },

    // ─── SUMMARY ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### Summary

- **Expressions** produce values and can be nested inside other expressions.
- **Statements** control execution and cannot be used where a value is expected.
- Assignment (\`=\`) is an expression — it returns the value it assigned.
- Ternary (\`? :\`) is the expression equivalent of \`if\`.
- Arrow functions returning objects need \`({})\` because \`{}\` alone is read as a block statement.
- \`&&\` and \`||\` are short-circuit expressions that return one of their operands.

**Next**: Functions in depth — parameters, closures, and scope chains.`,
    },

    // ─── CHALLENGES ───────────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 1: Ternary Rewrite

Rewrite the \`if\` block below as a **single ternary expression** assigned to \`label\`.`,
      html: `<div class="panel" id="c1">Waiting...</div>`,
      css: `.panel{height:100%;border:1px solid #334155;border-radius:12px;background:#0a1220;display:grid;place-items:center;color:#94a3b8;font-size:16px;font-weight:800;font-family:monospace;}`,
      startCode: `const score = 61;
let label = '';

// TODO: replace the if/else below with ONE ternary expression
if (score >= 70) {
  label = 'pass';
} else {
  label = 'fail';
}

console.log(label);`,
      solutionCode: `const score = 61;
const label = score >= 70 ? 'pass' : 'fail';
console.log(label);
document.getElementById('c1').textContent = 'label = ' + label;
document.getElementById('c1').style.color = '#10b981';`,
      check: (js) => js.includes('?') && js.includes(':') && !js.includes('if ('),
      successMessage: 'Correct. Ternary is an expression — it returns a value.',
      failMessage: 'Replace the entire if/else with: label = score >= 70 ? "pass" : "fail"',
      outputHeight: 160,
    },
    {
      type: 'challenge',
      instruction: `### Challenge 2: Chained Assignment

Make both \`a\` and \`b\` equal \`7\` using a **single line**. Hint: assignment is an expression.`,
      html: `<div class="panel" id="c2">Waiting...</div>`,
      css: `.panel{height:100%;border:1px solid #334155;border-radius:12px;background:#0a1220;display:grid;place-items:center;color:#94a3b8;font-size:16px;font-weight:800;font-family:monospace;}`,
      startCode: `let a = 0;
let b = 0;

// TODO: set both a and b to 7 in ONE line

console.log('a:', a, 'b:', b);`,
      solutionCode: `let a = 0;
let b = a = 7;
console.log('a:', a, 'b:', b);
document.getElementById('c2').textContent = 'a = ' + a + ', b = ' + b;
document.getElementById('c2').style.color = '#10b981';`,
      check: (js) => js.includes('b = a = 7') || js.includes('b = (a = 7)'),
      successMessage: 'Right. Assignment returns the assigned value, so b catches it.',
      failMessage: 'Use: b = a = 7  (one line, no extra statements)',
      outputHeight: 160,
    },
    {
      type: 'challenge',
      instruction: `### Challenge 3: Fix the Arrow Function

The arrow function below returns \`undefined\`. Fix it so it returns the object \`{ name, score }\`.`,
      html: `<div class="panel" id="c3">Waiting...</div>`,
      css: `.panel{height:100%;border:1px solid #334155;border-radius:12px;background:#0a1220;display:grid;place-items:center;color:#94a3b8;font-size:14px;font-weight:800;font-family:monospace;}`,
      startCode: `const makePlayer = (name, score) => { name: name, score: score };

const p = makePlayer('Ada', 99);
console.log('player:', p);`,
      solutionCode: `const makePlayer = (name, score) => ({ name: name, score: score });
const p = makePlayer('Ada', 99);
console.log('player:', p);
document.getElementById('c3').textContent = JSON.stringify(p);
document.getElementById('c3').style.color = '#10b981';`,
      check: (js) => js.includes('({') || js.includes('return {'),
      successMessage: 'Yes. Wrapping in () makes JS treat {} as an object expression.',
      failMessage: 'Use ({ name: name, score: score }) — the outer parens are required.',
      outputHeight: 160,
    },
    {
      type: 'challenge',
      instruction: `### Challenge 4: Short-Circuit Default

Use \`||\` to set \`displayName\` to \`'Anonymous'\` when \`username\` is an empty string.`,
      html: `<div class="panel" id="c4">Waiting...</div>`,
      css: `.panel{height:100%;border:1px solid #334155;border-radius:12px;background:#0a1220;display:grid;place-items:center;color:#94a3b8;font-size:16px;font-weight:800;font-family:monospace;}`,
      startCode: `const username = '';

// TODO: use || to assign 'Anonymous' when username is empty
const displayName = username;

console.log(displayName);`,
      solutionCode: `const username = '';
const displayName = username || 'Anonymous';
console.log(displayName);
document.getElementById('c4').textContent = 'displayName = ' + displayName;
document.getElementById('c4').style.color = '#10b981';`,
      check: (js) => js.includes('||') && js.includes("'Anonymous'"),
      successMessage: 'Good. || returns the right operand when the left is falsy.',
      failMessage: "Write: const displayName = username || 'Anonymous'",
      outputHeight: 160,
    },
    {
      type: 'challenge',
      instruction: `### Challenge 5: Expression vs Statement Spot Check

There are 3 expressions and 2 statements below. Add a comment \`// expression\` or \`// statement\` after each line. Then run the cell.`,
      html: `<div class="panel" id="c5">Waiting...</div>`,
      css: `.panel{height:100%;border:1px solid #334155;border-radius:12px;background:#0a1220;display:grid;place-items:center;color:#94a3b8;font-size:14px;font-weight:800;font-family:monospace;padding:10px;text-align:center;}`,
      startCode: `2 + 2
let x = 10
x > 5 ? 'big' : 'small'
if (x > 5) { console.log('big'); }
x++`,
      solutionCode: `// expression: 2+2 produces 4
// statement: let x = 10 is a declaration
// expression: ternary returns a value
// statement: if controls flow, returns nothing
// expression: x++ returns old x then increments

const answers = ['expression', 'statement', 'expression', 'statement', 'expression'];
document.getElementById('c5').textContent = answers.join(' | ');
document.getElementById('c5').style.color = '#10b981';`,
      check: (js) => js.includes('// expression') && js.includes('// statement'),
      successMessage: 'Right. Expressions return values; statements control execution.',
      failMessage: 'Add "// expression" or "// statement" as a comment after each line.',
      outputHeight: 160,
    },
  ],
};

export default {
  id: 'j1-expressions-statements',
  title: 'Expressions vs Statements',
  slug: 'expressions-vs-statements',
  number: '1.2',
  chapter: 'js1.1',
  description: 'Understand how JavaScript decides whether code produces a value or controls execution.',

  tags: ['javascript', 'expressions', 'statements', 'ternary', 'short-circuit', 'syntax'],

  intuition: {
    prose: [
      'Every piece of JavaScript code is either an expression (produces a value) or a statement (controls execution).',
      'This split determines where code can appear — expressions can be nested inside other expressions, statements cannot.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Curly Brace Trap',
        body: 'In arrow functions, {} is read as a block statement, not an object. Wrap with () => ({}) to return an object literal.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Expressions vs Statements Lab',
        props: {
          lesson: LESSON_JS_CORE_1_2,
        },
      },
    ],
  },

  mentalModel: [
    'Expression: code that resolves to a value and can be embedded inside other expressions.',
    'Statement: code that directs execution (if, for, while, return) and produces no embeddable value.',
    'Ternary (? :) is the expression equivalent of an if statement.',
    'Assignment (=) is itself an expression — it returns the assigned value.',
    'Short-circuit operators (&& and ||) return one of their operands, not just true/false.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
