const sim2_002 = {
  id: 'sim2-002',
  slug: 'evaluating-expressions',
  chapter: 'sim2',
  order: 2,
  title: 'Evaluating Expressions',
  description: 'Learn why "x*x" is just a string and how JavaScript\'s Function constructor turns text into executable math.',

  hook: 'The hardest part of building a graphing calculator isn\'t the graph — it\'s understanding how to take a string like `"Math.sin(x) + x/2"` that the user types, and turn it into a function JavaScript can actually call. This lesson shows you the exact mechanism.',

  intuition: {
    prose: [
      'In JavaScript, `"x * x"` is just a string of characters. It has no mathematical meaning on its own. To turn it into something callable, you need the **`Function` constructor** — a built-in way to compile a string of code into a function at runtime.',
      'The pattern is: `new Function(\'x\', \'return \' + expr)`. This creates a real function that accepts `x` as an argument and returns the evaluated result. You can then call it with any number: `fn(3.14)` gives you the result.',
      'The key danger is **user input can break things**: typos, incomplete expressions like `"x/"`, or invalid names all cause `SyntaxError` or `ReferenceError`. Always wrap evaluations in `try/catch` and show a friendly message instead of crashing.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Function Constructor',
        body: '`new Function(param1, ..., body)` — compiles a string as a function body. Example: `new Function(\'x\', \'return x*x\')` produces `(x) => x*x`. The last argument is always the body; earlier arguments are parameter names.',
      },
      {
        type: 'warning',
        title: 'Never Use eval()',
        body: '`eval(string)` runs code with access to the current scope — a security risk. `new Function(...)` creates an isolated scope with only the parameters you explicitly pass in. Always prefer `new Function` for user-supplied expressions.',
      },
      {
        type: 'insight',
        title: 'Injecting Math Into Scope',
        body: 'By default, `new Function(\'x\', body)` doesn\'t have access to `Math.sin`, `Math.PI`, etc. — they must be passed in. One clean approach: `new Function(\'x\', \'Math\', body)` and call it as `fn(x, Math)`. Or destructure Math properties into the body string with `with(Math){...}`.',
      },
    ],
    visualizations: [
      {
        id: 'sim2-002-viz',
        title: 'Evaluating Expressions',
        initialProps: {
          initialCells: [
            // ── Cell 1: Strings vs. Math ─────────────────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'Strings vs. Math',
              code: `// "x * x" is a string — JavaScript doesn't know it's math.
// Open the console (bottom of this preview) to see the difference.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 14px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .box {
      padding: 14px 16px; border-radius: 8px;
      font-size: 13px; line-height: 1.7; font-family: monospace
    }
    .box.str { background: #fef9c3; border: 1px solid #fde047; color: #713f12 }
    .box.fn  { background: #dcfce7; border: 1px solid #86efac; color: #14532d }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase;
             letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px }
  </style>
  <div class="wrap">
    <h3>String vs. Function</h3>
    <div>
      <div class="label">A string (not callable)</div>
      <div class="box str" id="strBox"></div>
    </div>
    <div>
      <div class="label">A compiled function (callable!)</div>
      <div class="box fn" id="fnBox"></div>
    </div>
  </div>
\`

// A string — just characters, no math yet
const expr = 'x * x'
app.querySelector('#strBox').textContent =
  \`typeof "\${expr}" = "\${typeof expr}"\\nCalling it: \${expr}(4) would throw TypeError\`

// The Function constructor compiles it into a real function
const fn = new Function('x', 'return ' + expr)
const result = fn(4)    // call with x = 4

app.querySelector('#fnBox').textContent =
  \`fn = new Function('x', 'return \${expr}')\\nfn(4) = \${result}\\nfn(7) = \${fn(7)}\``,
            },
            // ── Cell 2: Calling Math Functions ───────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Calling Math Functions',
              code: `// new Function runs in an isolated scope — Math is not automatically available.
// Pass it as a parameter, or use 'with(Math){...}' to pull everything in.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    table { border-collapse: collapse; width: 100%; font-size: 13px }
    th { background: #0f172a; color: white; padding: 8px 12px; text-align: left; font-weight: 600 }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace }
    td:first-child { color: #0284c7 }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: #f8fafc }
  </style>
  <div class="wrap">
    <h3>Math Functions via Function Constructor</h3>
    <table>
      <tr><th>Expression</th><th>x = π/2</th><th>x = π</th></tr>
      <tbody id="tbody"></tbody>
    </table>
  </div>
\`

// Build an evaluator that has access to Math
function makeEvaluator(expr) {
  // 'with(Math){...}' brings sin, cos, PI, etc. into scope
  return new Function('x', \`with(Math){ return \${expr} }\`)
}

const expressions = [
  'sin(x)',
  'cos(x)',
  'sin(x) * cos(x)',
  'sqrt(abs(sin(x)))',
  '2 * PI - x',
]

const tbody = app.querySelector('#tbody')
const PI = Math.PI

for (const expr of expressions) {
  const fn = makeEvaluator(expr)
  const a  = fn(PI / 2).toFixed(4)
  const b  = fn(PI).toFixed(4)
  tbody.innerHTML += \`<tr><td>\${expr}</td><td>\${a}</td><td>\${b}</td></tr>\`
}`,
            },
            // ── Cell 3: Error Handling ────────────────────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Handling Bad Input',
              code: `// Users make typos. Always catch errors and show a friendly message.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 14px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none
    }
    input:focus { border-color: #0284c7 }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: #0284c7; color: white }
    .result {
      padding: 12px 14px; border-radius: 8px; font-size: 14px; font-family: monospace;
      min-height: 44px; display: flex; align-items: center
    }
    .ok  { background: #dcfce7; border: 1px solid #86efac; color: #14532d }
    .err { background: #fee2e2; border: 1px solid #fca5a5; color: #7f1d1d }
    .hint { font-size: 11px; color: #94a3b8 }
  </style>
  <div class="wrap">
    <h3>Try these: <code>x/</code> then <code>sin(x)</code></h3>
    <div class="row">
      <input id="expr" type="text" value="sin(x) + x/2" placeholder="f(x) = ...">
      <button id="evalBtn">Eval at x=1</button>
    </div>
    <div class="result ok" id="output">f(1) = 1.3415</div>
    <p class="hint">Try typing incomplete expressions like <code>x/</code> or unknown names like <code>foo(x)</code></p>
  </div>
\`

const input  = app.querySelector('#expr')
const output = app.querySelector('#output')
const btn    = app.querySelector('#evalBtn')

function evaluate(exprStr, xVal) {
  try {
    const fn = new Function('x', \`with(Math){ return \${exprStr} }\`)
    const result = fn(xVal)
    if (!isFinite(result)) throw new Error('Result is not finite: ' + result)
    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

btn.addEventListener('click', () => {
  const { ok, value, error } = evaluate(input.value, 1)
  if (ok) {
    output.className = 'result ok'
    output.textContent = \`f(1) = \${value.toFixed(6)}\`
  } else {
    output.className = 'result err'
    output.textContent = '⚠ ' + error
  }
})`,
            },
            // ── Cell 4: Live Expression Evaluator ────────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Live Expression Evaluator',
              code: `// Combine input + evaluator + a table of sample values.
// This is the expression engine we'll reuse in the function plotter.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none
    }
    input:focus { border-color: #0284c7 }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: #0284c7; color: white }
    .err-box { display: none; padding: 10px 14px; background: #fee2e2;
               border: 1px solid #fca5a5; border-radius: 8px;
               color: #7f1d1d; font-size: 13px }
    table { border-collapse: collapse; width: 100%; font-size: 13px }
    th { background: #0f172a; color: white; padding: 7px 10px; text-align: center; font-weight: 600 }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0;
         text-align: center; font-family: monospace }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: #f8fafc }
  </style>
  <div class="wrap">
    <h3>f(x) evaluator</h3>
    <div class="row">
      <input id="expr" type="text" value="sin(x) * x">
      <button id="evalBtn">Evaluate</button>
    </div>
    <div class="err-box" id="errBox"></div>
    <table>
      <tr><th>x</th><th>f(x)</th></tr>
      <tbody id="tbody"></tbody>
    </table>
  </div>
\`

const exprInput = app.querySelector('#expr')
const errBox    = app.querySelector('#errBox')
const tbody     = app.querySelector('#tbody')
const btn       = app.querySelector('#evalBtn')

function buildTable(exprStr) {
  errBox.style.display = 'none'
  tbody.innerHTML = ''
  const xValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
  try {
    const fn = new Function('x', \`with(Math){ return \${exprStr} }\`)
    for (const x of xValues) {
      const y = fn(x)
      tbody.innerHTML += \`<tr><td>\${x}</td><td>\${isFinite(y) ? y.toFixed(5) : 'undef'}</td></tr>\`
    }
  } catch (e) {
    errBox.style.display = 'block'
    errBox.textContent = '⚠ ' + e.message
  }
}

btn.addEventListener('click', () => buildTable(exprInput.value))
buildTable(exprInput.value)`,
            },
            // ── Challenge 1: Unit Conversion Calculator ───────────────────────────
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Fix the Evaluator',
              difficulty: 'easy',
              prompt: 'The evaluator below has a bug — it crashes on expressions like `sqrt(x)` even though that should work. Find and fix the issue, then test it with `sqrt(x)`, `log(x)`, and `PI * x`.',
              hint: 'Look carefully at how the Function body is constructed. Is `with(Math)` actually in the body string? Check for a missing bracket or string concatenation issue.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px
    }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: #0284c7; color: white }
    .out { padding: 12px; background: #f1f5f9; border-radius: 8px;
           font-family: monospace; font-size: 14px; min-height: 40px }
  </style>
  <div class="wrap">
    <h3>Broken Evaluator — find the bug!</h3>
    <div class="row">
      <input id="expr" type="text" value="sqrt(x)">
      <button id="btn">Eval at x=4</button>
    </div>
    <div class="out" id="out">Result will appear here</div>
  </div>
\`

const exprInput = app.querySelector('#expr')
const out       = app.querySelector('#out')

app.querySelector('#btn').addEventListener('click', () => {
  const expr = exprInput.value
  try {
    // BUG: the function body doesn't bring Math into scope correctly
    const fn = new Function('x', 'return ' + expr)
    const result = fn(4)
    out.textContent = 'f(4) = ' + result
  } catch (e) {
    out.textContent = 'Error: ' + e.message
  }
})`,
            },
            // ── Challenge 2: Sample Table ─────────────────────────────────────────
            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Two-Variable Evaluator',
              difficulty: 'medium',
              prompt: 'Extend the evaluator to support two variables: x and a. Add a second input for the value of `a`. The user types an expression like `a * sin(x)` and a value for `a`, and the table shows f(x, a) for x from -2 to 2 in steps of 0.5.',
              hint: 'Change `new Function(\'x\', body)` to `new Function(\'x\', \'a\', body)` and pass both `x` and `a` when calling: `fn(x, a)`. Read `a` from the second input with `parseFloat(aInput.value)`.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .row { display: flex; gap: 8px; align-items: center }
    input[type=text] {
      flex: 1; padding: 9px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px
    }
    input[type=number] {
      width: 80px; padding: 9px 12px; font-size: 14px;
      border: 1.5px solid #cbd5e1; border-radius: 8px; text-align: center
    }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: #0284c7; color: white }
    .err { display:none; padding:8px 12px; background:#fee2e2; border-radius:8px;
           color:#7f1d1d; font-size:13px }
    table { border-collapse: collapse; width: 100%; font-size: 12px }
    th { background: #0f172a; color: white; padding: 6px 10px; text-align: center }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: #f8fafc }
  </style>
  <div class="wrap">
    <h3>f(x, a) evaluator</h3>
    <div class="row">
      <input id="expr" type="text" value="a * sin(x)" placeholder="f(x, a)">
      <label style="font-size:13px;white-space:nowrap">a =</label>
      <input id="aVal" type="number" value="2" step="0.5">
      <button id="btn">Evaluate</button>
    </div>
    <div class="err" id="errBox"></div>
    <table><tr><th>x</th><th>f(x, a)</th></tr><tbody id="tbody"></tbody></table>
  </div>
\`

// TODO: read aVal, build a two-variable evaluator, populate the table
`,
            },
            // ── Challenge 3: Evaluator with Custom Constants ──────────────────────
            {
              id: 7,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Custom Constants',
              difficulty: 'hard',
              prompt: 'Build an evaluator that lets the user define constants before the expression. The UI should have a text area for definitions like `k = 9; n = 3` and a text input for the expression like `k * sin(n * x)`. The evaluator should parse the definitions and make those constants available when evaluating.',
              hint: 'Parse the definitions by splitting on `;`, then for each `key = value` string, extract the key and evaluate the value with `parseFloat`. Build the Function body as: `const k = ...; const n = ...; with(Math){ return expr }`. Or pass an object of constants and use `with` on that too.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    label { font-size: 12px; font-weight: 600; color: #64748b }
    textarea {
      width: 100%; padding: 9px 12px; font-size: 13px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; resize: none
    }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px
    }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: #0284c7; color: white }
    .out { padding: 12px; background: #f1f5f9; border-radius: 8px;
           font-family: monospace; font-size: 13px; line-height: 1.8; min-height: 50px }
  </style>
  <div class="wrap">
    <h3>Custom Constants Evaluator</h3>
    <label>Constants (semicolon-separated)</label>
    <textarea id="consts" rows="2">k = 9; n = 3</textarea>
    <label>Expression f(x)</label>
    <div class="row">
      <input id="expr" type="text" value="k * sin(n * x)">
      <button id="btn">Evaluate</button>
    </div>
    <div class="out" id="out">Results will appear here</div>
  </div>
\`

// TODO: parse constants, inject them, evaluate f(x) for a few x values
`,
            },
          ],
        },
      },
    ],
  },
}

export default sim2_002
