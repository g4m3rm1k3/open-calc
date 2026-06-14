const sim2_002 = {
  id: 'sim2-002',
  slug: 'evaluating-expressions',
  chapter: 'sim2',
  order: 2,
  title: 'Evaluating Expressions',
  description: 'Learn how the Function constructor turns a user-typed string into executable math — and how to handle the three ways it can fail.',

  hook: {
    question: 'How does a graphing calculator turn the string `"sin(x) + x/2"` into a number your computer can actually compute?',
    realWorldContext: 'Every tool that evaluates user-typed formulas — spreadsheets, Desmos, Wolfram Alpha, CodePen — is built on this same primitive: compiling a string into a callable function at runtime. JavaScript exposes the mechanism directly through the `Function` constructor, no libraries required. This lesson shows you exactly how it works, how to make `sin`, `cos`, and `PI` available to the user, and how to handle the three distinct ways user input can fail.',
  },

  intuition: {
    prose: [
      'Everything the user types in a formula field is text. The string `"x * x"` is five characters — the CPU has no idea it represents squaring. Before any computation can happen, that string must be compiled into a callable function. This is the fundamental problem every formula evaluator solves.',
      'JavaScript\'s `Function` constructor does this directly: `new Function(\'x\', \'return x * x\')`. It parses the second string as a function body, creates a new function object, and returns it. Calling `fn(4)` then executes that code with `x` bound to `4`. The string is the source code; the constructor is the compiler.',
      'The `Function` constructor runs in a clean, isolated scope — it cannot see any variables from the surrounding code. This is mostly a security feature: user-typed expressions can\'t access your app\'s state or interfere with its variables. The tradeoff is that `Math.sin`, `Math.PI`, and similar globals are also invisible by default.',
      'To bring math functions into scope, use `with(Math)`: `new Function(\'x\', \'with(Math){ return \' + expr + \' }\')`. The `with(obj)` statement promotes all properties of `obj` into local scope, so `sin(x)` works without the `Math.` prefix. This is the one legitimate use of `with` in modern JavaScript — inside a `new Function` body where the scope is already isolated.',
      'User input fails in exactly three ways. **SyntaxError**: unparseable text like `"x/"` — thrown during compilation. **ReferenceError**: an unknown name like `"foo(x)"` — thrown when the function is called. **Silent invalid value**: `"1/0"` returns `Infinity` and `"sqrt(-1)"` returns `NaN` without throwing anything at all.',
      'The first two are caught by wrapping in `try/catch`. The third is not — `Infinity` and `NaN` are valid JavaScript values that flow silently past any error handler. You must check `isFinite(result)` explicitly and treat non-finite results as error cases.',
      'Before building any UI, verify the evaluator with a sample table: evaluate the expression at 9–10 evenly-spaced x values and display the results in rows. A table immediately reveals whether the function produces sensible output, where it diverges, and whether the Math scope injection is working. It takes minutes to build and saves hours of debugging a visual that looks wrong but is hard to inspect.',
      'The pattern generalizes cleanly to multiple variables: `new Function(\'x\', \'a\', body)` creates a function of two inputs, called as `fn(xValue, aValue)`. This is how you\'d build a plotter with amplitude or frequency controls — the user types `a * sin(x)` and `a` comes from a separate number input.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 10 — The Expression Engine',
        body: 'The `Function` constructor pattern you learn here is used unchanged in every subsequent lesson. The function plotter, the parametric curve tool, and the final calculator all depend on the evaluator built in these four cells.',
      },
      {
        type: 'definition',
        title: 'The Function Constructor',
        body: '`new Function(param1, ..., body)` — compiles a string as a function body. The last argument is always the body; all earlier arguments are parameter names. `new Function(\'x\', \'return x*x\')` is equivalent to writing `(x) => x*x`. At runtime it is a real function object — callable, inspectable, and no different from one you wrote by hand.',
      },
      {
        type: 'procedure',
        title: 'The Three-Line Evaluator',
        body: '(1) `const fn = new Function(\'x\', \`with(Math){ return \${expr} }\`)` — compile with Math in scope. (2) `const result = fn(xValue)` — call with a number. (3) `if (!isFinite(result)) throw new Error(\'not finite\')` — reject Infinity and NaN. Wrap all three lines in `try/catch`.',
      },
      {
        type: 'warning',
        title: 'Never Use eval()',
        body: '`eval(string)` runs code in the current scope — giving user input read/write access to your local variables and enabling arbitrary code execution. `new Function(...)` creates an isolated scope with only the parameters you explicitly pass. Always use `new Function` for any user-supplied expression.',
      },
      {
        type: 'insight',
        title: 'Scope Isolation Is a Security Feature',
        body: 'The fact that `new Function` cannot see your local variables is by design. If it could, a user who typed `authToken` into a formula field could exfiltrate your `let authToken = ...` variable. Scope isolation makes the evaluator safe to expose in any public-facing UI.',
      },
      {
        type: 'insight',
        title: 'The Only Legitimate Use of `with`',
        body: '`with(obj)` is banned by strict mode and deprecated everywhere else because it makes scope resolution unpredictable. The exception: inside a `new Function` body, where the scope is already isolated and the object (`Math`) is fully trusted. Using `with(Math)` here is idiomatic and safe.',
      },
      {
        type: 'warning',
        title: 'Three Ways Input Can Fail',
        body: '(1) **SyntaxError** — unparseable text like `x/` or `sin(x` — thrown during `new Function(...)` construction. (2) **ReferenceError** — unknown name like `foo(x)` — thrown when `fn(x)` runs. (3) **Invalid result** — `1/0` → `Infinity`, `sqrt(-1)` → `NaN` — no throw, must check `isFinite(result)` separately.',
      },
      {
        type: 'insight',
        title: 'Infinity Is Not an Error',
        body: '`1/0` in JavaScript returns `Infinity` without throwing — your `try/catch` will silently pass it through. `NaN` behaves the same way. Both are legitimate JavaScript values. Always check `isFinite(result)` as a second gate after the try/catch.',
      },
      {
        type: 'strategy',
        title: 'Test With Known Values First',
        body: 'Before wiring any UI, verify the evaluator by hand: `fn(0)`, `fn(Math.PI/2)`, `fn(Math.PI)`. For `sin(x)` those should be 0, 1, ~0. If the results are wrong, scope injection is broken. Catching this in a table takes seconds; catching it in a visual plotter takes hours.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Evaluating Expressions',
        mathBridge: 'The four cells below build the evaluator incrementally: compile a string, inject Math into scope, catch errors, then assemble a complete sample table. Each cell is a standalone program — run it, read the output, then change the expression before moving on.',
        initialProps: {
          initialCells: [
            // ── Cell 1: Strings vs. Math ─────────────────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'Strings vs. Math',
              prose: [
                'In JavaScript, `"x * x"` is just a sequence of characters — the language has no idea it represents multiplication. To turn a string into executable code, you use the **`Function` constructor**: `new Function(\'x\', \'return x * x\')`. This compiles the string as a function body and returns a real callable function. The string is the *source code*; `new Function` is the compiler.',
                'This is the exact mechanism that powers every graphing calculator, formula evaluator, and spreadsheet engine. When Excel evaluates `=A1 * B1`, it is doing something equivalent: turning a string the user typed into a computation the machine can execute.',
              ],
              code: `// "x * x" is a string — JavaScript doesn't know it's math.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 14px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    .box {
      padding: 14px 16px; border-radius: 8px;
      font-size: 13px; line-height: 1.7; font-family: monospace
    }
    .box.str { background: #fef9c3; border: 1px solid #fde047; color: #713f12 }
    .box.fn  { background: #dcfce7; border: 1px solid #86efac; color: #14532d }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase;
             letter-spacing: 0.06em; color: var(--muted); margin-bottom: 6px }
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

const expr = 'x * x'
app.querySelector('#strBox').textContent =
  \`typeof "\${expr}" = "\${typeof expr}"\\nCalling it: \${expr}(4) would throw TypeError\`

const fn = new Function('x', 'return ' + expr)
const result = fn(4)

app.querySelector('#fnBox').textContent =
  \`fn = new Function('x', 'return \${expr}')\\nfn(4) = \${result}\\nfn(7) = \${fn(7)}\``,
            },
            // ── Cell 2: Calling Math Functions ───────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Calling Math Functions',
              prose: [
                '`new Function(\'x\', body)` runs the body in a clean isolated scope — it cannot see your local variables, and it cannot see global browser objects like `Math`. To make `Math.sin`, `Math.cos`, and `Math.PI` available, you need to explicitly bring them in.',
                'The cleanest way is the `with` statement: `new Function(\'x\', \'with(Math){ return \' + expr + \' }\')`. The `with(Math)` block promotes all properties of `Math` into scope, so the user can type `sin(x)` instead of `Math.sin(x)`. This is the only legitimate use case for `with` in modern JavaScript.',
              ],
              code: `// new Function runs in an isolated scope — Math is not automatically available.
// Use 'with(Math){...}' to pull everything in.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    table { border-collapse: collapse; width: 100%; font-size: 13px }
    th { background: var(--text); color: var(--bg); padding: 8px 12px; text-align: left; font-weight: 600 }
    td { padding: 8px 12px; border-bottom: 1px solid var(--border); font-family: monospace; color: var(--text) }
    td:first-child { color: var(--accent) }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: var(--surface2) }
  </style>
  <div class="wrap">
    <h3>Math Functions via Function Constructor</h3>
    <table>
      <tr><th>Expression</th><th>x = π/2</th><th>x = π</th></tr>
      <tbody id="tbody"></tbody>
    </table>
  </div>
\`

function makeEvaluator(expr) {
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
              prose: [
                'User-supplied expressions will fail — not occasionally, but constantly. `"x/"` is a `SyntaxError` because the parser can\'t finish the expression. `"foo(x)"` is a `ReferenceError` because `foo` doesn\'t exist. `"1/0"` returns `Infinity`, not an error. Each failure mode needs its own response.',
                'The pattern is: wrap every `new Function` call in a `try/catch`, and separately check `isFinite(result)` on the output. If either fails, show a friendly message — never expose the raw JavaScript error to the user. The error text is useful during development but confusing in a finished app.',
              ],
              code: `// Users make typos. Always catch errors and show a friendly message.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 14px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px; outline: none;
      background: var(--surface); color: var(--text)
    }
    input:focus { border-color: var(--accent) }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface) }
    .result {
      padding: 12px 14px; border-radius: 8px; font-size: 14px; font-family: monospace;
      min-height: 44px; display: flex; align-items: center
    }
    .ok  { background: #dcfce7; border: 1px solid #86efac; color: #14532d }
    .err { background: #fee2e2; border: 1px solid #fca5a5; color: #7f1d1d }
    .hint { font-size: 11px; color: var(--muted) }
  </style>
  <div class="wrap">
    <h3>Try these: <code>x/</code> then <code>sin(x)</code></h3>
    <div class="row">
      <input id="expr" type="text" value="sin(x) + x/2" placeholder="f(x) = ...">
      <button id="evalBtn">Eval at x=1</button>
    </div>
    <div class="result ok" id="output">f(1) = 1.3415</div>
    <p class="hint">Try incomplete expressions like <code>x/</code> or unknown names like <code>foo(x)</code></p>
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
              prose: [
                'A table of sample values is the simplest way to debug a function before you plot it. Pick 9 evenly-spaced x values — say `-2` to `2` in steps of `0.5` — evaluate your expression at each one, and display the results in rows. If a value is `Infinity` or `NaN`, show `"undef"` rather than letting a nonsense number through.',
                'This is the core engine that will power the function plotter in the next lesson. The evaluator, error handling, and sample table you write here are exactly the building blocks you\'ll need — we\'ll add a canvas and coordinate transform on top.',
              ],
              code: `// Combine input + evaluator + a table of sample values.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px; outline: none;
      background: var(--surface); color: var(--text)
    }
    input:focus { border-color: var(--accent) }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface) }
    .err-box { display: none; padding: 10px 14px; background: #fee2e2;
               border: 1px solid #fca5a5; border-radius: 8px;
               color: #7f1d1d; font-size: 13px }
    table { border-collapse: collapse; width: 100%; font-size: 13px }
    th { background: var(--text); color: var(--bg); padding: 7px 10px; text-align: center; font-weight: 600 }
    td { padding: 7px 10px; border-bottom: 1px solid var(--border);
         text-align: center; font-family: monospace; color: var(--text) }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: var(--surface2) }
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
            // ── Challenge 1: Fix the Evaluator ───────────────────────────────────
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Fix the Evaluator',
              difficulty: 'easy',
              prose: [
                'Debugging is a critical skill, and the best debugging is reading carefully. The evaluator below builds its `Function` body incorrectly — it\'s one small omission that makes `sqrt(x)`, `log(x)`, and `PI` all fail with `ReferenceError`. Read the body string construction line by line before running the code.',
              ],
              prompt: 'The evaluator below has a bug — it crashes on expressions like `sqrt(x)` even though that should work. Find and fix the issue, then test it with `sqrt(x)`, `log(x)`, and `PI * x`.',
              hint: 'Look carefully at how the Function body is constructed. Is `with(Math)` actually in the body string? Check for a missing bracket or string concatenation issue.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text)
    }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface) }
    .out { padding: 12px; background: var(--surface2); border-radius: 8px;
           font-family: monospace; font-size: 14px; min-height: 40px; color: var(--text) }
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
            // ── Challenge 2: Two-Variable Evaluator ──────────────────────────────
            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Two-Variable Evaluator',
              difficulty: 'medium',
              prose: [
                '`new Function` can accept any number of parameter names before the body string. `new Function(\'x\', \'a\', body)` creates a function of two variables — call it with `fn(xValue, aValue)`. This is how you\'d build a plotter that lets the user tune an amplitude or frequency with a slider: `a * sin(x)` where `a` comes from a separate input.',
              ],
              prompt: 'Extend the evaluator to support two variables: x and a. Add a second input for the value of `a`. The user types an expression like `a * sin(x)` and a value for `a`, and the table shows f(x, a) for x from -2 to 2 in steps of 0.5.',
              hint: 'Change `new Function(\'x\', body)` to `new Function(\'x\', \'a\', body)` and pass both `x` and `a` when calling: `fn(x, a)`. Read `a` from the second input with `parseFloat(aInput.value)`.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    .row { display: flex; gap: 8px; align-items: center }
    input[type=text] {
      flex: 1; padding: 9px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text)
    }
    input[type=number] {
      width: 80px; padding: 9px 12px; font-size: 14px; text-align: center;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text)
    }
    label { font-size: 13px; color: var(--text) }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface) }
    .err { display:none; padding:8px 12px; background:#fee2e2; border-radius:8px;
           color:#7f1d1d; font-size:13px }
    table { border-collapse: collapse; width: 100%; font-size: 12px }
    th { background: var(--text); color: var(--bg); padding: 6px 10px; text-align: center }
    td { padding: 6px 10px; border-bottom: 1px solid var(--border);
         text-align: center; font-family: monospace; color: var(--text) }
    tr:last-child td { border-bottom: none }
    tr:nth-child(even) td { background: var(--surface2) }
  </style>
  <div class="wrap">
    <h3>f(x, a) evaluator</h3>
    <div class="row">
      <input id="expr" type="text" value="a * sin(x)" placeholder="f(x, a)">
      <label>a =</label>
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
              prose: [
                'Named constants unlock a much richer expression language: `k * sin(n * x)` is far more readable than `9 * sin(3 * x)`. The trick is to parse a simple definition string like `"k = 9; n = 3"` by splitting on `;`, then splitting each piece on `=` to get a key-value pair. You can inject those constants into the `Function` body as `const` declarations before the `with(Math)` block.',
              ],
              prompt: 'Build an evaluator that lets the user define constants before the expression. The UI should have a text area for definitions like `k = 9; n = 3` and a text input for the expression like `k * sin(n * x)`. The evaluator should parse the definitions and make those constants available when evaluating.',
              hint: 'Parse the definitions by splitting on `;`, then for each `key = value` string, extract the key and evaluate the value with `parseFloat`. Build the Function body as: `const k = ...; const n = ...; with(Math){ return expr }`. Or pass an object of constants and use `with` on that too.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: var(--text) }
    label { font-size: 12px; font-weight: 600; color: var(--muted) }
    textarea {
      width: 100%; padding: 9px 12px; font-size: 13px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px; resize: none;
      background: var(--surface); color: var(--text)
    }
    .row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text)
    }
    button { padding: 9px 16px; font-size: 14px; font-weight: 600;
             border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface) }
    .out { padding: 12px; background: var(--surface2); border-radius: 8px;
           font-family: monospace; font-size: 13px; line-height: 1.8;
           min-height: 50px; color: var(--text) }
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
