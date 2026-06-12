export const lesson = {
  id: 'sicp-2-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.1.1–2.1.3  Data Abstraction',
  checkpoints: [
    { id: 'cp-pairs',           label: 'Pairs' },
    { id: 'cp-rational',        label: 'Rational Numbers' },
    { id: 'cp-barriers',        label: 'Abstraction Barriers' },
    { id: 'cp-procedural-data', label: 'Data from Functions' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 1 showed how to abstract over PROCESSES — instead of repeating a loop pattern five times, you write it once and pass the varying part in. Chapter 2 applies the same principle to DATA. Instead of passing numerator and denominator as separate arguments everywhere, you bundle them into one rational-number object and pass that.\n\nThe technique is data abstraction: define a compound type through its constructor and selectors, then write all code that uses the type exclusively through those names. The representation — how the data is actually stored — is hidden behind a barrier. Change the representation, and nothing above the barrier needs to change.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2.1 — Pairs
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'compound-data-vocab',
      text: 'Vocabulary for Chapter 2:\n\n  Compound data object — a value assembled from other values. A rational number bundles a numerator and denominator. A point bundles an x and y coordinate.\n\n  Constructor — a function that builds a new instance: make_rat(n, d) creates a rational.\n\n  Selector — a function that extracts a component: numer(r) returns the numerator of r.\n\n  Abstract data type — a type defined entirely by its constructor and selectors. Code above the interface never accesses the internals directly.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pair-intro',
      text: 'The fundamental building block of Chapter 2 is the pair — a two-element container. In the JavaScript edition of SICP, a pair is a two-element array. Three functions form the pair interface:\n  pair(x, y) — the constructor\n  head(p) — selector for the first element\n  tail(p) — selector for the second element',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }`,
    },
    {
      type: 'narration',
      id: 'pair-use',
      text: 'Use pair to bundle two values together, then extract them. The access goes through head and tail — never through direct array indexing. This is the discipline of data abstraction: use the interface, not the representation.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }

const p = pair(1, 2);
console.log(head(p));  // 1
console.log(tail(p));  // 2`,
    },
    {
      type: 'narration',
      id: 'pair-nested',
      text: 'Pairs can hold anything — including other pairs. This is the closure property of pairs: an element of a pair can itself be a pair. It is what will allow us to build lists in the next lesson.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }

const nested = pair(1, pair(2, 3));
console.log(head(nested));        // 1
console.log(head(tail(nested)));  // 2  — head of the inner pair
console.log(tail(tail(nested)));  // 3  — tail of the inner pair`,
    },
    { type: 'checkpoint', id: 'cp-pairs' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2.1.1 — Rational Numbers
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'wishful-thinking-vocab',
      text: 'SICP\'s design technique: wishful thinking. Write all the code that USES a new data type before deciding how to IMPLEMENT it. Assume make_rat, numer, and denom already work perfectly — write add_rat and mul_rat in terms of them. Only then decide what pair structure to use.\n\nThis separates two concerns that should be separate: what the type does (its interface) from how it is stored (its representation).',
      code: null,
    },
    {
      type: 'narration',
      id: 'rat-interface',
      text: 'Declare the three interface functions. make_rat is the constructor; numer and denom are the selectors. We have not implemented them yet — just declared their names. Code below this line can be written as if they work.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }

// Interface (not yet implemented — placeholders)
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }`,
    },
    {
      type: 'narration',
      id: 'rat-print',
      text: 'Add a display helper. This uses only the interface names — it never touches the underlying pair.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }

function print_rat(x) {
  console.log(\`\${numer(x)} / \${denom(x)}\`);
}

print_rat(make_rat(1, 3));  // 1 / 3
print_rat(make_rat(5, 6));  // 5 / 6`,
    },

    // ── Rational arithmetic ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'rat-add',
      text: 'Write add_rat. The formula for adding fractions: n₁/d₁ + n₂/d₂ = (n₁×d₂ + n₂×d₁) / (d₁×d₂). Use only numer, denom, and make_rat — never the underlying pair.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }
function print_rat(x)   { console.log(\`\${numer(x)} / \${denom(x)}\`); }

function add_rat(x, y) {
  return make_rat(
    numer(x) * denom(y) + numer(y) * denom(x),
    denom(x) * denom(y)
  );
}`,
    },
    {
      type: 'narration',
      id: 'rat-mul',
      text: 'Add mul_rat. Multiplication is simpler: n₁/d₁ × n₂/d₂ = (n₁×n₂)/(d₁×d₂).',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }
function print_rat(x)   { console.log(\`\${numer(x)} / \${denom(x)}\`); }
function add_rat(x, y) {
  return make_rat(numer(x) * denom(y) + numer(y) * denom(x), denom(x) * denom(y));
}

function mul_rat(x, y) {
  return make_rat(numer(x) * numer(y), denom(x) * denom(y));
}`,
    },
    {
      type: 'narration',
      id: 'rat-test',
      text: 'Test both operations. Note: 1/2 + 1/2 = 4/4 — not yet reduced. We will fix that shortly.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }
function print_rat(x)   { console.log(\`\${numer(x)} / \${denom(x)}\`); }
function add_rat(x, y) {
  return make_rat(numer(x)*denom(y) + numer(y)*denom(x), denom(x)*denom(y));
}
function mul_rat(x, y) {
  return make_rat(numer(x)*numer(y), denom(x)*denom(y));
}

const one_half  = make_rat(1, 2);
const one_third = make_rat(1, 3);

print_rat(add_rat(one_half, one_third));  // 5 / 6  ✓
print_rat(mul_rat(one_half, one_third));  // 1 / 6  ✓
print_rat(add_rat(one_half, one_half));   // 4 / 4  ← not reduced yet`,
    },
    {
      type: 'codelens',
      id: 'codelens-add-rat',
      text: 'Open CodeLens on add_rat. Watch the call stack: add_rat calls numer and denom four times, then calls make_rat. make_rat calls pair. pair stores the values. Numer and denom call head/tail which access the array. You are watching THREE layers of abstraction in action — the arithmetic layer knows nothing about pairs; the rational layer knows nothing about arrays.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }
function add_rat(x, y) {
  return make_rat(numer(x)*denom(y)+numer(y)*denom(x), denom(x)*denom(y));
}
const r = add_rat(make_rat(1,2), make_rat(1,3));
console.log(\`\${numer(r)} / \${denom(r)}\`);`,
    },
    { type: 'checkpoint', id: 'cp-rational' },

    {
      type: 'challenge',
      id: 'challenge-rat-ops',
      text: 'Write sub_rat(x, y) and equal_rat(x, y). Subtraction: n₁d₂ − n₂d₁ over d₁d₂. Equality: cross-multiply and compare (n₁×d₂ === n₂×d₁). Use only numer, denom, make_rat.',
      expectedOutput: '-1 / 6\ntrue\nfalse',
      startCode: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function make_rat(n, d) { return pair(n, d); }
function numer(x)       { return head(x); }
function denom(x)       { return tail(x); }
function print_rat(x)   { console.log(\`\${numer(x)} / \${denom(x)}\`); }

// Write sub_rat(x, y) and equal_rat(x, y)

const one_third = make_rat(1, 3);
const one_half  = make_rat(1, 2);
const two_sixth = make_rat(2, 6);

print_rat(sub_rat(one_third, one_half));      // -1 / 6
console.log(equal_rat(one_third, two_sixth)); // true
console.log(equal_rat(one_third, one_half));  // false
`,
      hint: 'function sub_rat(x, y) {\n  return make_rat(numer(x)*denom(y) - numer(y)*denom(x), denom(x)*denom(y));\n}\nfunction equal_rat(x, y) {\n  return numer(x) * denom(y) === numer(y) * denom(x);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst h=make_rat(1,3),h2=make_rat(1,2),h3=make_rat(2,6);\nreturn typeof sub_rat==='function' && numer(sub_rat(h,h2))===-1 && equal_rat(h,h3)===true && equal_rat(h,h2)===false`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2.1.2 — Abstraction Barriers
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'barrier-vocab',
      text: 'An abstraction barrier is a boundary between layers of a system. Code above a barrier uses the layer below only through its published interface. Code below the barrier implements that interface however it wants. Neither side can reach through the barrier.\n\nThe payoff: you can change anything below a barrier without touching anything above it. The change is contained.',
      code: null,
    },
    {
      type: 'narration',
      id: 'barriers-diagram',
      text: 'Here are the four layers of our rational number system. Each horizontal line is a barrier — code above it is independent of code below it.',
      code: `//  ┌────────────────────────────────────────────────────┐
//  │  Programs using rational numbers                    │
//  │  add_rat  sub_rat  mul_rat  equal_rat  print_rat    │
//  ├───────────────────── barrier ──────────────────────┤
//  │  make_rat  numer  denom                            │
//  ├───────────────────── barrier ──────────────────────┤
//  │  pair  head  tail                                  │
//  ├───────────────────── barrier ──────────────────────┤
//  │  JavaScript arrays  [x, y]                         │
//  └────────────────────────────────────────────────────┘

// Nothing above a barrier can peek below it.
console.log('Four independent layers.');`,
    },
    {
      type: 'narration',
      id: 'barriers-gcd-fix',
      text: 'There is a bug: 1/2 + 1/2 gives 4/4, not 1/1. We forgot to reduce fractions. Fix: put GCD reduction in make_rat. The beautiful part — only make_rat changes. add_rat, sub_rat, mul_rat automatically get the fix because they all go through make_rat.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function numer(x)   { return head(x); }
function denom(x)   { return tail(x); }
function print_rat(x) { console.log(\`\${numer(x)} / \${denom(x)}\`); }

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// Updated make_rat — reduces on construction
function make_rat(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return pair(n / g, d / g);
}

function add_rat(x, y) {
  return make_rat(numer(x)*denom(y) + numer(y)*denom(x), denom(x)*denom(y));
}

print_rat(add_rat(make_rat(1,2), make_rat(1,3))); // 5 / 6  ✓
print_rat(add_rat(make_rat(1,2), make_rat(1,2))); // 1 / 1  ✓ (now reduced)`,
    },
    { type: 'checkpoint', id: 'cp-barriers' },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2.1.3 — What Is Data?
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'what-is-data-question',
      text: 'SICP asks: what is data, really? We said pair is implemented as a two-element array. But is that necessary? Is an array the "real" pair? Or is pair defined entirely by the contract it satisfies?\n\nThe contract: for any values x and y,\n  head(pair(x, y)) = x\n  tail(pair(x, y)) = y\n\nAnything that satisfies these two equations IS a valid pair implementation. The array is just one choice. SICP demonstrates another: a closure.',
      code: null,
    },
    {
      type: 'narration',
      id: 'procedural-pair-build',
      text: 'Here is pair implemented with no array — just a function. pair returns a function (dispatch) that has captured x and y in its closure. When you call that function with 0, it returns x. When you call it with 1, it returns y.',
      code: `function pair(x, y) {
  function dispatch(m) {
    if (m === 0) return x;
    if (m === 1) return y;
  }
  return dispatch;
}`,
    },
    {
      type: 'narration',
      id: 'procedural-head-tail',
      text: 'head calls dispatch with 0; tail calls dispatch with 1. The interface is identical to before.',
      code: `function pair(x, y) {
  function dispatch(m) {
    if (m === 0) return x;
    if (m === 1) return y;
  }
  return dispatch;
}

function head(z) { return z(0); }
function tail(z) { return z(1); }`,
    },
    {
      type: 'narration',
      id: 'procedural-pair-test',
      text: 'Test it. The values live inside the closure — there is no array anywhere.',
      code: `function pair(x, y) {
  function dispatch(m) {
    if (m === 0) return x;
    if (m === 1) return y;
  }
  return dispatch;
}
function head(z) { return z(0); }
function tail(z) { return z(1); }

const p = pair(42, 99);
console.log(head(p));  // 42
console.log(tail(p));  // 99
// No array — the values are captured in the closure`,
    },
    {
      type: 'narration',
      id: 'procedural-insight',
      text: 'This is the key insight of SICP 2.1.3: DATA does not need to be a built-in primitive. Data is defined by BEHAVIOUR — by the contract of what its operations do. A pair is anything that satisfies head(pair(x,y)) = x and tail(pair(x,y)) = y. The array implementation and the closure implementation are both valid pairs. This blurs the distinction between data and procedures — a theme that runs through the rest of the book.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-procedural-pair',
      text: 'Open CodeLens on pair(42, 99). pair returns the dispatch function — a closure. In the heap, that function has a closure slot pointing to a frame containing x=42 and y=99. When head(p) calls p(0), it calls dispatch(0), which looks up x in the captured frame. Step through and watch where the values live — there is no array.',
      code: `function pair(x, y) {
  function dispatch(m) {
    if (m === 0) return x;
    if (m === 1) return y;
  }
  return dispatch;
}
function head(z) { return z(0); }
function tail(z) { return z(1); }
const p = pair(42, 99);
console.log(head(p));
console.log(tail(p));`,
    },
    { type: 'checkpoint', id: 'cp-procedural-data' },

    {
      type: 'challenge',
      id: 'challenge-point',
      text: 'Using the procedural pair (not arrays), build a point abstraction: make_point(x, y), x_point(p), y_point(p), and distance(p1, p2) = sqrt((x2−x1)² + (y2−y1)²). All operations must use make_point, x_point, y_point — no array indexing. distance((0,0), (3,4)) = 5.',
      expectedOutput: '0\n0\n5',
      startCode: `function pair(x, y) {
  function dispatch(m) { return m === 0 ? x : y; }
  return dispatch;
}
function head(z) { return z(0); }
function tail(z) { return z(1); }

function make_point(x, y) { return pair(x, y); }
function x_point(p)       { return head(p); }
function y_point(p)       { return tail(p); }

// Write distance(p1, p2) using x_point and y_point
function distance(p1, p2) {
  // sqrt((x2-x1)² + (y2-y1)²)
}

const origin = make_point(0, 0);
const p      = make_point(3, 4);
console.log(x_point(origin));       // 0
console.log(y_point(origin));       // 0
console.log(distance(origin, p));   // 5
`,
      hint: 'function distance(p1, p2) {\n  const dx = x_point(p2) - x_point(p1);\n  const dy = y_point(p2) - y_point(p1);\n  return Math.sqrt(dx*dx + dy*dy);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof distance === 'function' && Math.abs(distance(make_point(0,0), make_point(3,4)) - 5) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
