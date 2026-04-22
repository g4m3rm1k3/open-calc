// Chapter js2.1 — Lesson 2-1: Functions — The Reusable Unit

const LESSON_JS_CORE_2_1 = {
  title: 'Functions — The Reusable Unit',
  subtitle: 'Declarations, expressions, arrows, and why functions are values.',
  sequential: true,

  cells: [

    // ─── Part 1: Why Functions Exist ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 1 — Why Functions Exist

You have already seen code that runs top-to-bottom, once. That is fine for a script that does one thing.

But programs are not single tasks. They are collections of *operations that need to happen at different times, with different inputs, multiple times.* Functions are how you name an operation and reuse it.

Every language has them — C calls them functions, Java calls them methods, Rust calls them fns. In JavaScript:

\`\`\`js
function greet(name) {
  return "Hello, " + name + "!";
}

greet("Alice");  // "Hello, Alice!"
greet("Bob");    // "Hello, Bob!"
\`\`\`

Define once, call many times with different inputs. That is all a function is.

What makes JavaScript unusual: **it has three different syntaxes for creating a function**, and they are not interchangeable. By the end of this lesson you will know when each one is appropriate and why.`,
    },

    // ─── Part 1 Cell: basic function declaration ──────────────────────────────
    {
      type: 'js',
      instruction: `### Your First Function Declaration

A **function declaration** uses the \`function\` keyword followed by a name. The name is the label you will use to call it later.

The function body — everything between the braces — runs only when called. Not when defined.

Run this. Then try changing \`"World"\` to your name.`,
      html: `<div class="output-panel">
  <div class="label">Return value</div>
  <div id="result" class="result-box">—</div>
  <div class="label">Console logs appear below</div>
</div>`,
      css: `.output-panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:12px;font-family:monospace;}
.label{color:#475569;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
.result-box{background:#0f2233;border:1px solid #38bdf8;border-radius:8px;padding:12px;font-size:15px;font-weight:700;color:#38bdf8;}`,
      startCode: `// --- Define the function (nothing runs yet) ---
function greet(name) {
  return "Hello, " + name + "!";
}

// --- Call the function (this is when it actually executes) ---
const message = greet("World");
console.log(message);

document.getElementById('result').textContent = message;`,
      outputHeight: 200,
    },

    // ─── Part 2: Functions Are Values ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Functions Are First-Class Values

Here is the concept that separates JavaScript from older languages like C: **a function is just a value**, like a number or a string.

In C, a function is a fixed address in memory — you can hold a *pointer* to it, but it is a second-class citizen. In JavaScript, a function is a proper value you can store, pass around, and return from other functions with no special syntax.

That means you can:
- Store a function in a variable
- Pass a function to another function as an argument
- Return a function from a function

The syntax that makes this obvious is the **function expression**:

\`\`\`js
// Function declaration — the name is part of the syntax
function add(a, b) { return a + b; }

// Function expression — the function is a value assigned to a variable
const add = function(a, b) { return a + b; };
\`\`\`

Both work. Both produce a callable function. But their *behavior around hoisting* is completely different — we will cover that shortly.`,
    },

    // ─── Part 2 Cell: function expression ────────────────────────────────────
    {
      type: 'js',
      instruction: `### Function Expression: Function as a Value

Run this and watch how \`double\` is just a variable that *happens to hold a function*. You can inspect it with \`typeof\`, pass it around, reassign it.

Notice: the function on the right of \`=\` has no name. It is **anonymous**. You access it through the variable \`double\`.`,
      html: `<div class="panel">
  <div class="row" id="r1">typeof double: ?</div>
  <div class="row" id="r2">double(7): ?</div>
  <div class="row" id="r3">applying twice: ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// Function stored in a variable — it is a value
const double = function(n) {
  return n * 2;
};

console.log(typeof double);       // "function"
console.log(double(7));           // 14

// Because double is just a value, you can pass it to another function
function applyTwice(fn, value) {
  return fn(fn(value));           // call fn, then call fn again on the result
}

const result = applyTwice(double, 3); // double(double(3)) = double(6) = 12

document.getElementById('r1').textContent = 'typeof double: ' + typeof double;
document.getElementById('r2').textContent = 'double(7): ' + double(7);
document.getElementById('r3').textContent = 'applyTwice(double, 3): ' + result;`,
      outputHeight: 200,
    },

    // ─── Part 3: Arrow Functions ──────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 3 — Arrow Functions: The Short Form

ES6 (2015) introduced **arrow functions** — a shorter syntax for function expressions. You will see them everywhere in modern JavaScript.

\`\`\`js
// Three equivalent forms of the same function:
const add = function(a, b) { return a + b; }  // function expression
const add = (a, b) => { return a + b; }        // arrow, explicit return
const add = (a, b) => a + b;                   // arrow, implicit return
\`\`\`

**Implicit return**: when the body is a single expression with no braces, that expression's value is returned automatically. No \`return\` keyword needed.

If you know C#, this is similar to a lambda expression: \`(a, b) => a + b\`. If you know Rust, it mirrors closures: \`|a, b| a + b\`. The arrow syntax is now common across many modern languages for the same reason — it is less noise for short operations.

### The one real difference: \`this\`

Arrow functions do **not** have their own \`this\`. They inherit it from the surrounding scope. For now: use arrow functions for short callbacks and array methods. Use \`function\` declarations for methods on objects. We will revisit \`this\` in the Objects lesson.`,
    },

    // ─── Part 3 Cell: arrow functions ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Arrow Functions in Practice

Three forms of the same operation — pick the one that reads best for your use case.

Arrow functions shine in array methods like \`.map()\`, \`.filter()\`, \`.reduce()\`. Run the cell and see how concise the transformation becomes.`,
      html: `<div class="panel">
  <div class="label">Explicit return</div>
  <div class="row" id="r1">?</div>
  <div class="label">Implicit return (single expression)</div>
  <div class="row" id="r2">?</div>
  <div class="label">Array .map() with arrow</div>
  <div class="row" id="r3">?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.label{color:#475569;font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// Explicit return — braces required, return keyword required
const square1 = (n) => { return n * n; };

// Implicit return — single expression, no braces, no return keyword
const square2 = n => n * n;    // parens optional when exactly one parameter

// Arrow functions in array methods
const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(n => n * n);

console.log('square1(9):', square1(9));
console.log('square2(9):', square2(9));
console.log('squared:', squared);

document.getElementById('r1').textContent = 'square1(9) = ' + square1(9);
document.getElementById('r2').textContent = 'square2(9) = ' + square2(9);
document.getElementById('r3').textContent = '[1,2,3,4,5].map(n => n*n) = [' + squared + ']';`,
      outputHeight: 220,
    },

    // ─── Part 4: Hoisting ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 4 — Hoisting: The Thing That Trips Everyone Up

JavaScript processes your code in two passes before running it:

1. **Parsing pass** — reads all \`function\` declarations and puts them in memory first
2. **Execution pass** — runs your code line by line

This means **function declarations can be called before they appear in the file**. The engine already knows about them.

\`\`\`js
// This works — declaration is hoisted to the top of its scope
sayHello();
function sayHello() { console.log("Hello!"); }
\`\`\`

**Function expressions and arrow functions are NOT hoisted.** Only the variable name is hoisted (as \`undefined\`), not the function value:

\`\`\`js
// This crashes
sayHello();              // TypeError: sayHello is not a function
const sayHello = () => console.log("Hello!");
\`\`\`

In C or Java, calling a function before its definition is a compile error — you find out immediately. In JavaScript with \`var\`, you get a silent \`undefined\` and a runtime crash. This is one of several reasons modern JavaScript uses \`let\` and \`const\` — they throw a clear error instead of silently producing garbage.

**Practical rule**: define before you call. Rely on hoisting only when it genuinely improves readability (e.g., putting your \`main()\` call at the top of a file, with implementations below).`,
    },

    // ─── Part 4 Cell: hoisting demo ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Hoisting: Declaration vs Expression

The declaration call succeeds even though it appears *before* the definition in the source. The expression call would fail if placed before the \`const\` line.

Run it, then try moving \`callExpression()\` above its \`const\` line and observe the error.`,
      html: `<div class="panel">
  <div class="row" id="r1">Declaration (called before defined): ?</div>
  <div class="row" id="r2">Expression (called after defined): ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// Call the declaration BEFORE it appears in the source — this is legal
const d1 = callDeclaration();

// The declaration is hoisted — the engine already knows about it
function callDeclaration() {
  return "Declaration: hoisted! Called before definition.";
}

// Expression must be defined before it can be called
const callExpression = () => "Expression: defined before calling.";
const d2 = callExpression();

document.getElementById('r1').textContent = d1;
document.getElementById('r2').textContent = d2;
console.log(d1);
console.log(d2);`,
      outputHeight: 190,
    },

    // ─── Part 5: Parameters and Return Values ─────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 5 — Parameters, Defaults, and Return Values

**Default parameters** (ES6):
\`\`\`js
function greet(name = "stranger") {
  return "Hello, " + name + "!";
}
greet();          // "Hello, stranger!"
greet("Alice");   // "Hello, Alice!"
\`\`\`

**Extra arguments are silently ignored** — unlike C, which would be undefined behavior, JavaScript just discards them:
\`\`\`js
greet("Alice", "Bob", "Charlie"); // "Hello, Alice!" — extras dropped
\`\`\`

**Missing arguments become \`undefined\`:**
\`\`\`js
function add(a, b) { return a + b; }
add(5);   // NaN — because 5 + undefined = NaN
\`\`\`

**Rest parameters** — collect any remaining arguments into an array. This is variadic functions, the same idea as \`printf\` in C or variadic templates in C++, but without the complexity:
\`\`\`js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4, 5); // 15
\`\`\`

**Every function returns a value.** If you do not write \`return\`, the function returns \`undefined\`. There is no \`void\` keyword — the implicit return type is simply \`undefined\`.`,
    },

    // ─── Part 5 Cell: parameters ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Default and Rest Parameters

Run this. Then try calling \`sum()\` with no arguments (should return 0) and \`greet()\` with a name.`,
      html: `<div class="panel">
  <div class="row" id="r1">greet(): ?</div>
  <div class="row" id="r2">greet("Alice"): ?</div>
  <div class="row" id="r3">sum(1,2,3,4,5): ?</div>
  <div class="row" id="r4">no-return function: ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// Default parameter
function greet(name = "stranger") {
  return "Hello, " + name + "!";
}

// Rest parameter — collects all arguments into an array
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

// Function with no return statement returns undefined
function noReturn() {
  const x = 1 + 1; // does work but returns nothing
}

document.getElementById('r1').textContent = 'greet() → ' + greet();
document.getElementById('r2').textContent = 'greet("Alice") → ' + greet("Alice");
document.getElementById('r3').textContent = 'sum(1,2,3,4,5) → ' + sum(1, 2, 3, 4, 5);
document.getElementById('r4').textContent = 'noReturn() → ' + noReturn();
console.log('noReturn():', noReturn()); // undefined`,
      outputHeight: 230,
    },

    // ─── Part 6: Scope ───────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 6 — Scope: Where Names Are Visible

A function creates a **scope** — a private namespace. Variables declared inside are invisible outside.

\`\`\`js
function compute() {
  const result = 42;   // only visible inside compute()
  return result;
}

console.log(result);   // ReferenceError — result does not exist here
\`\`\`

**Scope chains**: when JavaScript looks up a name, it searches outward from the current scope, up through enclosing scopes, until it finds the name or runs out (giving a \`ReferenceError\`).

\`\`\`js
const prefix = "Hello";

function greet(name) {
  return prefix + ", " + name;   // can read prefix from the outer scope
}
\`\`\`

Every language with lexical scope works this way — C's local variables, Rust's block scopes, Go's function-level scope. The rule is the same: inner can see outer, outer cannot see inner.

**Block scope (\`let\` and \`const\`)**: JavaScript distinguishes between *function scope* (for the legacy \`var\`) and *block scope* (for \`let\`/\`const\`). A \`let\` inside an \`if\` block is gone when the block closes — exactly like a local variable in a C \`if\` block.

\`\`\`js
function example() {
  if (true) {
    let x = 10;    // block-scoped — dies when } closes
  }
  console.log(x);  // ReferenceError
}
\`\`\``,
    },

    // ─── Part 6 Cell: scope chain ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Scope in Action

The function reads \`prefix\` from the outer scope automatically. But \`inner\` is gone the moment the function returns — the catch block proves it does not exist outside.`,
      html: `<div class="panel">
  <div class="row ok" id="r1">outer-to-inner lookup: ?</div>
  <div class="row ok" id="r2">return value visible outside: ?</div>
  <div class="row err" id="r3">inner variable from outside: ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}
.err{border-color:#f87171;color:#fca5a5;}`,
      startCode: `const prefix = "→";   // outer scope

function annotate(msg) {
  const inner = prefix + " " + msg;  // private to this function
  return inner;
}

const output = annotate("function scope");

let leaked;
try {
  leaked = inner;       // inner does not exist here
} catch (e) {
  leaked = "ReferenceError: inner is not defined";
}

document.getElementById('r1').textContent = 'annotate sees prefix: ' + annotate("visible");
document.getElementById('r2').textContent = 'output outside: ' + output;
document.getElementById('r3').textContent = leaked;
console.log('outer lookup works:', output);`,
      outputHeight: 220,
    },

    // ─── Wrap-up ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## You Can Now Do the Following

**Define functions three ways:**
- \`function name() {}\` — declaration, hoisted, named
- \`const name = function() {}\` — expression, not hoisted, can be anonymous
- \`const name = () => {}\` — arrow, not hoisted, no own \`this\`, implicit return available

**Treat functions as values:** pass them to \`.map()\`, \`.filter()\`, \`.sort()\`, or any function that expects a callback.

**Predict hoisting:** declarations are available before their source position; expressions are not.

**Read scope chains:** inner scopes see outer names. Outer scopes cannot see inside.

---

**Next lesson: Closures** — what happens when a function *captures* variables from its outer scope, and why that gives JavaScript one of its most powerful patterns for managing state without global variables.`,
    },

  ],
};

export default {
  id: 'js-core-2-1-functions',
  slug: 'functions-the-reusable-unit',
  chapter: 'js2.1',
  order: 0,
  title: 'Functions — The Reusable Unit',
  subtitle: 'Declarations, expressions, arrows, hoisting, and scope.',
  tags: ['javascript', 'functions', 'scope', 'hoisting', 'arrow-functions'],

  hook: {
    question: 'Why does JavaScript have three different ways to write a function?',
    realWorldContext: 'Every non-trivial JavaScript program is a network of functions. Understanding the differences between declaration, expression, and arrow syntax unlocks the patterns you will see in every real codebase.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'A function declaration is hoisted — the engine knows about it before any code runs.',
      'A function expression is just a value stored in a variable — treat it like a number or string.',
      'Arrow functions are the short form: implicit return when there are no braces, no own `this`.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'What Trips Everyone Up',
        body: 'Only function *declarations* are hoisted. Calling a `const fn = () => {}` before that line crashes with "fn is not a function". The variable exists but holds nothing callable yet.',
      },
      {
        type: 'tip',
        title: 'Arrow Functions Across Languages',
        body: 'The `=>` syntax appears in C# lambdas, Rust closures (`|a, b| a + b`), and Java lambda expressions. JavaScript arrow functions are the same idea — a short anonymous function without ceremony.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Functions — Declaration, Expression, Arrow, Scope',
        props: { lesson: LESSON_JS_CORE_2_1 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Function declarations are hoisted — safe to call before their source position.',
    'Function expressions and arrows are values — they live in variables, not in the hoisting pass.',
    'Arrow functions inherit `this` from their enclosing scope — do not use them as object methods.',
    'Every function creates a scope. Variables inside are invisible outside.',
    'The scope chain searches outward: local → enclosing → global.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
};
