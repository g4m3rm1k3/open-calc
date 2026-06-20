// Chapter js2.1 — Lesson 2-3: Arrays

const LESSON_JS_CORE_2_3 = {
  title: 'Arrays — Ordered Collections',
  subtitle: 'Creating, reading, transforming, and destructuring ordered data.',
  sequential: true,

  cells: [

    // ─── Part 1: What an Array Is ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 1 — What an Array Is

An array is an **ordered list of values**. Each value sits at a numbered position called an **index**, starting at 0.

\`\`\`js
const colors = ["red", "green", "blue"];
//               0       1        2
colors[0]   // "red"
colors[2]   // "blue"
colors[3]   // undefined — past the end, no crash
\`\`\`

JavaScript arrays are dynamically sized and can hold mixed types — numbers, strings, objects, even other arrays — in the same list. This is different from C or Java arrays, which have a fixed size and a single declared element type.

**Reading and writing:**
\`\`\`js
colors[1] = "yellow";   // mutate in place
colors.length           // 3 — live property, updates automatically
colors[colors.length - 1]  // last element — classic pattern
\`\`\`

**Common methods:**
| Method | What it does |
|---|---|
| \`push(val)\` | Add to end |
| \`pop()\` | Remove from end, return it |
| \`unshift(val)\` | Add to start |
| \`shift()\` | Remove from start, return it |
| \`indexOf(val)\` | Find position, or -1 |
| \`includes(val)\` | true/false membership check |
| \`slice(a, b)\` | Copy a portion — does not mutate |
| \`splice(i, n)\` | Remove n elements at index i — mutates |`,
    },

    // ─── Part 1 Cell: basic array operations ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Building and Mutating an Array

Run this and watch the log. Notice that \`push\` and \`pop\` both return something useful — \`push\` returns the new length, \`pop\` returns the removed element.`,
      html: `<div class="panel">
  <div id="log" class="log-box"></div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:16px;border-radius:12px;display:flex;flex-direction:column;font-family:monospace;}
.log-box{flex:1;background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#93c5fd;font-size:13px;line-height:1.8;overflow-y:auto;}`,
      startCode: `const fruits = ["apple", "banana"];

log("initial: " + JSON.stringify(fruits));
log("length: " + fruits.length);

const newLen = fruits.push("cherry");
log("after push('cherry'): " + JSON.stringify(fruits) + "  (push returned " + newLen + ")");

const removed = fruits.pop();
log("after pop(): " + JSON.stringify(fruits) + "  (pop returned '" + removed + "')");

log("index of 'banana': " + fruits.indexOf("banana"));
log("includes 'cherry': " + fruits.includes("cherry"));

const slice = fruits.slice(0, 1);
log("slice(0,1): " + JSON.stringify(slice) + " — original unchanged: " + JSON.stringify(fruits));

function log(msg) {
  const logEl = document.getElementById('log');
  const line = document.createElement('div');
  line.textContent = msg;
  logEl.appendChild(line);
}`,
      outputHeight: 270,
    },

    // ─── Part 2: Iteration ────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 2 — Iterating Arrays

**\`for...of\`** — the clearest way to loop over values. Use this when you do not need the index:
\`\`\`js
for (const item of fruits) {
  console.log(item);
}
\`\`\`

**\`forEach\`** — call a function once per element:
\`\`\`js
fruits.forEach((item, index) => {
  console.log(index, item);
});
\`\`\`

**Classic \`for\` loop** — use when you need the index for logic, or need to break early:
\`\`\`js
for (let i = 0; i < fruits.length; i++) {
  if (fruits[i] === "stop") break;
  console.log(fruits[i]);
}
\`\`\`

**What trips everyone up**: \`for...in\` exists but is for *objects*, not arrays. On arrays it iterates over index *strings* and can include inherited properties. Never use \`for...in\` on an array.

\`\`\`js
// Wrong — for...in on an array
for (const i in fruits) { }    // i is "0", "1", "2" as strings

// Right — for...of on an array
for (const item of fruits) { }  // item is the value
\`\`\``,
    },

    // ─── Part 2 Cell: iteration ───────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Three Ways to Loop

Run this and compare the output. Each loop style suits a different situation — read the comments to see which is which.`,
      html: `<div class="panel">
  <div class="section-label">for...of</div>
  <div id="s1" class="section"></div>
  <div class="section-label">forEach (with index)</div>
  <div id="s2" class="section"></div>
  <div class="section-label">classic for (with break)</div>
  <div id="s3" class="section"></div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:6px;font-family:monospace;overflow-y:auto;}
.section-label{color:var(--color-text-secondary, #475569);font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.section{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:8px;color:#93c5fd;font-size:12px;line-height:1.8;}`,
      startCode: `const animals = ["cat", "dog", "elephant", "stop", "fish"];

// for...of — clean, no index, no break issues
let s1 = "";
for (const animal of animals) {
  s1 += animal + "  ";
}

// forEach — gives index automatically
let s2 = "";
animals.forEach((animal, i) => {
  s2 += i + ":" + animal + "  ";
});

// classic for — break on "stop"
let s3 = "";
for (let i = 0; i < animals.length; i++) {
  if (animals[i] === "stop") { s3 += "(stopped at index " + i + ")"; break; }
  s3 += animals[i] + "  ";
}

document.getElementById('s1').textContent = s1;
document.getElementById('s2').textContent = s2;
document.getElementById('s3').textContent = s3;`,
      outputHeight: 260,
    },

    // ─── Part 3: map / filter / reduce ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 3 — The Big Three: map, filter, reduce

These three methods transform arrays without mutation. They are the foundation of modern JavaScript data processing — you will use them constantly.

---

**\`map(fn)\`** — transform every element, return a new array of the same length:
\`\`\`js
[1, 2, 3].map(n => n * 2)   // [2, 4, 6]
\`\`\`

---

**\`filter(fn)\`** — keep only elements where \`fn\` returns true:
\`\`\`js
[1, 2, 3, 4, 5].filter(n => n % 2 === 0)  // [2, 4]
\`\`\`

---

**\`reduce(fn, initial)\`** — fold the array into a single value:
\`\`\`js
[1, 2, 3, 4].reduce((total, n) => total + n, 0)  // 10
\`\`\`

The \`fn\` receives \`(accumulator, currentValue)\`. The second argument to \`reduce\` is the starting value of the accumulator.

---

**They chain** — because each returns a new array (except reduce), you can connect them:
\`\`\`js
[1, 2, 3, 4, 5]
  .filter(n => n % 2 !== 0)  // [1, 3, 5] — odd numbers
  .map(n => n * n)            // [1, 9, 25] — squared
  .reduce((sum, n) => sum + n, 0)  // 35 — total
\`\`\`

None of these methods touch the original array. That immutability is intentional — it makes data flow predictable and debugging straightforward.`,
    },

    // ─── Part 3 Cell: map filter reduce ──────────────────────────────────────
    {
      type: 'js',
      instruction: `### map → filter → reduce Pipeline

This cell builds a pipeline: start with product data, filter to in-stock items, map to their prices, then sum the total.

Try adding another product or changing the \`inStock\` flag.`,
      html: `<div class="panel">
  <div class="label">Products</div>
  <div id="products" class="section"></div>
  <div class="label">In-stock only (filter)</div>
  <div id="filtered" class="section"></div>
  <div class="label">Prices (map)</div>
  <div id="prices" class="section"></div>
  <div class="label">Total (reduce)</div>
  <div id="total" class="total-box">$0</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:6px;font-family:monospace;overflow-y:auto;}
.label{color:var(--color-text-secondary, #475569);font-size:10px;letter-spacing:.08em;text-transform:uppercase;}
.section{background:#050e1a;border:1px solid #1e293b;border-radius:8px;padding:8px;color:#93c5fd;font-size:12px;line-height:1.7;}
.total-box{background:#0f2233;border:2px solid #38bdf8;border-radius:8px;padding:10px;color:#38bdf8;font-size:18px;font-weight:800;text-align:center;}`,
      startCode: `const products = [
  { name: "Keyboard",  price: 89,  inStock: true  },
  { name: "Monitor",   price: 349, inStock: false  },
  { name: "Mouse",     price: 45,  inStock: true   },
  { name: "Webcam",    price: 120, inStock: true   },
  { name: "Headset",   price: 199, inStock: false  },
];

// filter — keep only in-stock items
const inStock = products.filter(p => p.inStock);

// map — extract just the prices
const prices = inStock.map(p => p.price);

// reduce — sum the prices
const total = prices.reduce((sum, price) => sum + price, 0);

document.getElementById('products').textContent =
  products.map(p => p.name + " $" + p.price + (p.inStock ? " ✓" : " ✗")).join("  |  ");
document.getElementById('filtered').textContent =
  inStock.map(p => p.name).join(", ");
document.getElementById('prices').textContent =
  "$" + prices.join("  +  $");
document.getElementById('total').textContent = "$" + total;

console.log("In-stock prices:", prices);
console.log("Total:", total);`,
      outputHeight: 280,
    },

    // ─── Part 4: Destructuring and Spread ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 4 — Destructuring and Spread

**Destructuring** unpacks array values into named variables in one line:

\`\`\`js
const [first, second, ...rest] = [10, 20, 30, 40, 50];
// first = 10, second = 20, rest = [30, 40, 50]
\`\`\`

You can skip elements with a blank comma:
\`\`\`js
const [,, third] = [10, 20, 30];   // third = 30
\`\`\`

This is syntactic sugar — the engine is just reading array indices. It is especially useful with functions that return multiple values as an array.

---

**Spread (\`...\`)** expands an array into individual values:

\`\`\`js
const a = [1, 2, 3];
const b = [4, 5, 6];
const combined = [...a, ...b];    // [1, 2, 3, 4, 5, 6]

Math.max(...a);   // same as Math.max(1, 2, 3) → 3
\`\`\`

Spread creates a **shallow copy** — modifying the copy's top-level elements does not affect the original. Nested objects inside are still shared references (more on this in the Objects lesson).

\`\`\`js
const copy = [...original];   // new array, same element values
\`\`\``,
    },

    // ─── Part 4 Cell: destructuring + spread ─────────────────────────────────
    {
      type: 'js',
      instruction: `### Destructuring and Spread in Action

Run this and look at how much cleaner destructuring is compared to \`arr[0]\`, \`arr[1]\`. Then see spread used to combine arrays and copy without mutation.`,
      html: `<div class="panel">
  <div class="row" id="r1">destructuring: ?</div>
  <div class="row" id="r2">rest: ?</div>
  <div class="row" id="r3">combined: ?</div>
  <div class="row" id="r4">copy independence: ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:18px;border-radius:12px;display:flex;flex-direction:column;gap:10px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}`,
      startCode: `// Destructuring — unpack array values into named variables
const scores = [98, 76, 54, 32, 11];
const [gold, silver, ...remaining] = scores;

// Spread — expand into individual values or combine arrays
const teamA = ["Alice", "Bob"];
const teamB = ["Carol", "Dave"];
const combined = [...teamA, ...teamB];

// Spread copy — new array, does not affect original on push
const copy = [...scores];
copy.push(999);

document.getElementById('r1').textContent =
  "gold=" + gold + "  silver=" + silver;
document.getElementById('r2').textContent =
  "remaining=" + JSON.stringify(remaining);
document.getElementById('r3').textContent =
  "combined=" + JSON.stringify(combined);
document.getElementById('r4').textContent =
  "original length=" + scores.length + "  copy length=" + copy.length + " (independent)";

console.log("gold:", gold, "silver:", silver);
console.log("remaining:", remaining);`,
      outputHeight: 230,
    },

    // ─── Part 5: find, some, every, sort ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Part 5 — Searching and Sorting

**\`find(fn)\`** — returns the *first element* where \`fn\` is true, or \`undefined\`:
\`\`\`js
users.find(u => u.id === 3)
\`\`\`

**\`findIndex(fn)\`** — same but returns the index, or \`-1\`.

**\`some(fn)\`** — true if *at least one* element passes the test:
\`\`\`js
scores.some(s => s >= 90)   // is anyone passing?
\`\`\`

**\`every(fn)\`** — true if *all* elements pass the test:
\`\`\`js
scores.every(s => s >= 0)   // are all scores non-negative?
\`\`\`

**\`sort(fn)\`** — sorts *in place*, returns the same array. Without a comparator it sorts as strings (which breaks number sorting):
\`\`\`js
[10, 9, 100].sort()               // [10, 100, 9] — wrong! string sort
[10, 9, 100].sort((a, b) => a - b) // [9, 10, 100] — numeric ascending
[10, 9, 100].sort((a, b) => b - a) // [100, 10, 9] — numeric descending
\`\`\`

**The sort comparator rule**: return negative to put \`a\` before \`b\`, positive to put \`b\` before \`a\`, zero for equal. \`a - b\` gives ascending numeric order because it is negative when \`a\` is smaller.`,
    },

    // ─── Part 5 Cell: search + sort ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `### find, some, every, sort

The number sort gotcha is the most common array bug in interviews. Make sure you understand the comparator before you move on.`,
      html: `<div class="panel">
  <div class="row" id="r1">find: ?</div>
  <div class="row" id="r2">some / every: ?</div>
  <div class="row" id="r3">sort (wrong): ?</div>
  <div class="row good" id="r4">sort (correct): ?</div>
</div>`,
      css: `.panel{height:100%;background:#09111c;padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px;font-family:monospace;}
.row{background:#111827;border:1px solid #1e293b;border-radius:8px;padding:10px;color:#e2e8f0;font-size:13px;}
.good{border-color:#4ade80;color:#86efac;}`,
      startCode: `const users = [
  { id: 1, name: "Alice", score: 88 },
  { id: 2, name: "Bob",   score: 45 },
  { id: 3, name: "Carol", score: 91 },
];

const numbers = [10, 9, 100, 3, 47];

const carol = users.find(u => u.name === "Carol");
const anyPassing = users.some(u => u.score >= 90);
const allPassing = users.every(u => u.score >= 50);

// sort mutates — spread to avoid touching the original
const wrongSort  = [...numbers].sort();                 // string sort!
const rightSort  = [...numbers].sort((a, b) => a - b); // numeric sort

document.getElementById('r1').textContent =
  "find Carol: " + JSON.stringify(carol);
document.getElementById('r2').textContent =
  "some >= 90: " + anyPassing + "   every >= 50: " + allPassing;
document.getElementById('r3').textContent =
  "sort() without comparator: [" + wrongSort + "]  ← wrong";
document.getElementById('r4').textContent =
  "sort((a,b)=>a-b): [" + rightSort + "]  ← correct";`,
      outputHeight: 260,
    },

    // ─── Wrap-up ──────────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## You Can Now Do the Following

**Create and mutate arrays** with \`push\`, \`pop\`, \`splice\`, and direct index assignment.

**Iterate three ways**: \`for...of\` for clean loops, \`forEach\` when you need the index, classic \`for\` when you need \`break\`. Never use \`for...in\` on arrays.

**Transform without mutation** using \`map\`, \`filter\`, and \`reduce\` — chain them for data pipelines.

**Unpack with destructuring** and **combine with spread** — two syntaxes that cut noise significantly.

**Sort correctly** — always pass a comparator to \`.sort()\` when sorting numbers.

---

### Before the Challenges

Apply the big three: \`filter\`, \`map\`, and \`reduce\`. Each challenge uses real-looking data.`,
    },

    // ─── Challenge 1: filter ─────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 1: Filter Active Users

Given the array below, use \`.filter()\` to create a new array \`activeUsers\` that contains only users where \`active\` is \`true\`. Then log the count.

Expected: \`active count: 3\``,
      startCode: `const users = [
  { name: "Alice", active: true  },
  { name: "Bob",   active: false },
  { name: "Carol", active: true  },
  { name: "Dave",  active: false },
  { name: "Eve",   active: true  },
];

const activeUsers = null; // replace with .filter()

console.log("active count:", activeUsers.length);`,
      solutionCode: `const users = [
  { name: "Alice", active: true  },
  { name: "Bob",   active: false },
  { name: "Carol", active: true  },
  { name: "Dave",  active: false },
  { name: "Eve",   active: true  },
];
const activeUsers = users.filter(u => u.active);
console.log("active count:", activeUsers.length);`,
      check: (code, logs) =>
        /\.filter\s*\(/.test(code) && logs[0] === 'active count: 3',
      successMessage: 'Correct! .filter() with a predicate is the cleanest way to select a subset.',
      failMessage: 'Use .filter(u => u.active) — the callback should return true for users you want to keep.',
    },

    // ─── Challenge 2: map ────────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 2: Map to Display Strings

Given the products array, use \`.map()\` to produce an array of strings in this format: \`"Keyboard — $89"\`. Log each one.

Expected output (3 lines):
\`\`\`
Keyboard — $89
Mouse — $45
Webcam — $120
\`\`\``,
      startCode: `const products = [
  { name: "Keyboard", price: 89  },
  { name: "Mouse",    price: 45  },
  { name: "Webcam",   price: 120 },
];

const labels = null; // replace with .map()

labels.forEach(label => console.log(label));`,
      solutionCode: `const products = [
  { name: "Keyboard", price: 89  },
  { name: "Mouse",    price: 45  },
  { name: "Webcam",   price: 120 },
];
const labels = products.map(p => p.name + " — $" + p.price);
labels.forEach(label => console.log(label));`,
      check: (code, logs) =>
        /\.map\s*\(/.test(code) &&
        logs[0] === 'Keyboard — $89' &&
        logs[1] === 'Mouse — $45' &&
        logs[2] === 'Webcam — $120',
      successMessage: 'Correct! .map() transforms every element into a new form — same length, different shape.',
      failMessage: 'Use .map(p => p.name + " — $" + p.price) to build the label string for each product.',
    },

    // ─── Challenge 3: reduce ─────────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `### Challenge 3: Total Revenue with reduce

Use \`.reduce()\` to calculate the total revenue from the orders array. Each order has a \`quantity\` and \`unitPrice\`. Log the result as: \`"total: 485"\`

Expected: \`total: 485\``,
      startCode: `const orders = [
  { item: "Widget",  quantity: 3, unitPrice: 25  },
  { item: "Gadget",  quantity: 2, unitPrice: 80  },
  { item: "Doohickey", quantity: 5, unitPrice: 27 },
];

// Each order contributes quantity * unitPrice to the total
const total = null; // replace with .reduce()

console.log("total:", total);`,
      solutionCode: `const orders = [
  { item: "Widget",  quantity: 3, unitPrice: 25  },
  { item: "Gadget",  quantity: 2, unitPrice: 80  },
  { item: "Doohickey", quantity: 5, unitPrice: 27 },
];
const total = orders.reduce((sum, o) => sum + o.quantity * o.unitPrice, 0);
console.log("total:", total);`,
      check: (code, logs) =>
        /\.reduce\s*\(/.test(code) && logs[0] === 'total: 485',
      successMessage: 'Correct! reduce folds the whole array into one value — totals, max, groupings, all use this pattern.',
      failMessage: 'Use .reduce((sum, o) => sum + o.quantity * o.unitPrice, 0). The second argument is the starting value.',
    },

  ],
};

export default {
  id: 'js-core-2-3-arrays',
  slug: 'arrays-ordered-collections',
  chapter: 'js2.1',
  order: 2,
  title: 'Arrays — Ordered Collections',
  subtitle: 'map, filter, reduce, destructuring, spread, and sorting.',
  tags: ['javascript', 'arrays', 'map', 'filter', 'reduce', 'destructuring'],

  hook: {
    question: 'Why do JavaScript arrays have so many methods — and which ones do you actually need?',
    realWorldContext: 'Almost every JavaScript program processes lists of data: products, users, messages, search results. The array methods in this lesson are how professional JavaScript handles that data cleanly.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      '`map` transforms — same length, different values. `filter` selects — shorter or equal length. `reduce` collapses — one value out.',
      'These methods never mutate the original array. That predictability is why they replaced manual loops in modern JavaScript.',
      'Destructuring and spread are syntax shortcuts — they compile down to index reads and pushes.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Sort Bug',
        body: '`.sort()` without a comparator converts elements to strings — `[10, 9, 100].sort()` gives `[10, 100, 9]`. Always pass `(a, b) => a - b` for numbers.',
      },
      {
        type: 'warning',
        title: 'for...in on Arrays',
        body: 'Never use `for...in` on arrays. It iterates index strings and can include inherited properties. Use `for...of` or `forEach`.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Arrays — map, filter, reduce, destructuring, spread',
        props: { lesson: LESSON_JS_CORE_2_3 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    '`map` → same-length transformed array. `filter` → subset. `reduce` → single value.',
    'These methods return new arrays — the original is unchanged.',
    '`sort` mutates in place — spread-copy before sorting if you want to keep the original.',
    'Destructuring is shorthand for index reads. Spread is shorthand for copying elements.',
    'Never `for...in` on an array. Use `for...of`.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You use .map() on an array. What does it return, and what happens to the original array?',
      options: [
        'It modifies and returns the original array',
        'It returns a new same-length array with the transformation applied; the original is unchanged',
        'It returns undefined — you must save the result to a variable first',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You need a single total from an array of numbers. Which method is the right tool?',
      options: [
        '.map() — it transforms each element into the total',
        '.reduce() — it accumulates a single value across all elements',
        '.filter() — it returns elements that pass a condition, which you then add up',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You want to sort a copy of an array without altering the original. What must you do before calling .sort()?',
      options: [
        'Nothing — .sort() always returns a sorted copy and leaves the original intact',
        'Create a copy first with spread ([...arr]) or .slice() — .sort() mutates the array in place',
        'Call .freeze() on the original to protect it from .sort()',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why should you avoid for...in when iterating an array?',
      options: [
        'for...in is slower than for...of on arrays',
        'for...in iterates over all enumerable properties including inherited ones — not just array indexes, leading to unexpected keys',
        'for...in skips the last element of every array',
      ],
      correct: 1,
    },
  ],
};
