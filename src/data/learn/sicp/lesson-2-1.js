export const lesson = {
  id: 'sicp-2-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.1.1–2.1.3  Data Abstraction',
  checkpoints: [
    { id: 'cp-pairs',    label: 'Pairs' },
    { id: 'cp-barriers', label: 'Barriers' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 2 introduces the second major technique for managing complexity: data abstraction. Chapter 1 showed how to isolate the way a computation is used from how it is implemented — we called the implementation a black box. Chapter 2 applies the same idea to data. We will build compound data objects and then hide how they are built behind a clean interface.',
      code: null,
    },

    // ── Terminology: Compound Data & ADT ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'compound-data-vocab',
      text: 'Chapter 1 dealt with primitive data — individual numbers and booleans. A compound data object is a value assembled from other values. The goal is to raise the conceptual level: instead of passing numerator and denominator as two separate arguments everywhere, we pass a single rational-number object. To define a compound type we specify three things: a constructor that builds a new instance, selectors that extract components from an instance, and optionally predicates that test whether a value belongs to the type. This trio is the interface of an abstract data type.',
      code: null,
    },

    // ── Pairs ─────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'pairs-intro',
      text: 'The fundamental building block is the pair. In the JavaScript edition of SICP, a pair is a two-element array. pair is the constructor: it builds a new pair. head is the selector for the first element. tail is the selector for the second. These three names form a complete interface — higher-level code will use only these names, never the underlying array directly.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\n\nconst p = pair(1, 2);\nconsole.log(head(p)); // 1\nconsole.log(tail(p)); // 2',
    },
    {
      type: 'narration',
      id: 'pairs-nested',
      text: 'Pairs can hold anything — including other pairs. Chaining pairs this way is how SICP builds lists. Notice that head and tail navigate the structure without knowing anything about the underlying array — they use the pair interface exclusively.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\n\nconst nested = pair(1, pair(2, 3));\nconsole.log(head(nested));        // 1\nconsole.log(head(tail(nested)));  // 2\nconsole.log(tail(tail(nested)));  // 3',
    },

    // ── Terminology: Wishful Thinking ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'wishful-thinking-vocab',
      text: 'SICP\'s design technique for building abstract data types is called wishful thinking: assume the constructor and selectors already exist and work correctly, write all the operations that use them first, then decide how to implement the constructor and selectors afterward. This separates what the abstraction does from how it is represented. We will write add_rat and mul_rat assuming make_rat, numer, and denom work — without yet specifying how a rational is stored.',
      code: null,
    },

    // ── Rational numbers ──────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'rat-definition',
      text: 'The motivating example is rational numbers — fractions like 1/3 or 5/6. We define three names using wishful thinking: the constructor make_rat(n, d) builds a rational from numerator and denominator, the selector numer(x) extracts the numerator, and the selector denom(x) extracts the denominator. All arithmetic will use only these three names.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\n\nfunction make_rat(n, d) { return pair(n, d); }\nfunction numer(x)       { return head(x); }\nfunction denom(x)       { return tail(x); }\n\nfunction print_rat(x) {\n  console.log(`${numer(x)} / ${denom(x)}`);\n}\n\nprint_rat(make_rat(1, 3)); // 1 / 3\nprint_rat(make_rat(5, 6)); // 5 / 6',
    },
    {
      type: 'narration',
      id: 'rat-arithmetic',
      text: 'Arithmetic on rationals follows standard fraction rules. To add: cross-multiply the numerators and add, denominator is the product of denominators. To multiply: multiply numerators and denominators directly. Every operation is written entirely through make_rat, numer, and denom — never touching the underlying pair or array.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction make_rat(n, d) { return pair(n, d); }\nfunction numer(x)       { return head(x); }\nfunction denom(x)       { return tail(x); }\nfunction print_rat(x)   { console.log(`${numer(x)} / ${denom(x)}`); }\n\nfunction add_rat(x, y) {\n  return make_rat(numer(x) * denom(y) + numer(y) * denom(x),\n                  denom(x) * denom(y));\n}\n\nfunction mul_rat(x, y) {\n  return make_rat(numer(x) * numer(y),\n                  denom(x) * denom(y));\n}\n\nconst one_half  = make_rat(1, 2);\nconst one_third = make_rat(1, 3);\n\nprint_rat(add_rat(one_half, one_third)); // 5 / 6\nprint_rat(mul_rat(one_half, one_third)); // 1 / 6',
    },
    {
      type: 'codelens',
      id: 'codelens-add-rat',
      text: 'Open CodeLens on add_rat. Step through it and notice: add_rat never accesses p[0] or p[1] directly — it only calls numer and denom. Those call head and tail. Those access the array. The arithmetic is completely insulated from the storage. You are watching three layers of abstraction in action.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction make_rat(n, d) { return pair(n, d); }\nfunction numer(x)       { return head(x); }\nfunction denom(x)       { return tail(x); }\n\nfunction add_rat(x, y) {\n  return make_rat(\n    numer(x) * denom(y) + numer(y) * denom(x),\n    denom(x) * denom(y)\n  );\n}\n\nconst result = add_rat(make_rat(1, 2), make_rat(1, 3));\nconsole.log(`${numer(result)} / ${denom(result)}`);',
    },
    {
      type: 'checkpoint',
      id: 'cp-pairs',
    },
    {
      type: 'challenge',
      id: 'challenge-rat-ops',
      text: 'You have seen add_rat and mul_rat. Write sub_rat(x, y) which subtracts y from x, and equal_rat(x, y) which returns true when the two rationals represent the same value. For subtraction: numer(x)*denom(y) - numer(y)*denom(x) over denom(x)*denom(y). For equality: cross-multiply and check if the numerators match.',
      expectedOutput: '-1 / 6\ntrue\nfalse',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction make_rat(n, d) { return pair(n, d); }\nfunction numer(x)       { return head(x); }\nfunction denom(x)       { return tail(x); }\nfunction print_rat(x)   { console.log(`${numer(x)} / ${denom(x)}`); }\n\n// Write sub_rat(x, y) and equal_rat(x, y)\n\n\nconst one_half  = make_rat(1, 2);\nconst one_third = make_rat(1, 3);\nconst two_sixth = make_rat(2, 6);\n\nprint_rat(sub_rat(one_third, one_half)); // -1 / 6\nconsole.log(equal_rat(one_third, two_sixth)); // true\nconsole.log(equal_rat(one_third, one_half));  // false\n',
      hint: 'function sub_rat(x, y) {\n  return make_rat(numer(x) * denom(y) - numer(y) * denom(x),\n                  denom(x) * denom(y));\n}\nfunction equal_rat(x, y) {\n  return numer(x) * denom(y) === numer(y) * denom(x);\n}',
      tests: [
        { call: 'numer(sub_rat(make_rat(1,3), make_rat(1,2)))', expected: -1 },
        { call: 'denom(sub_rat(make_rat(1,3), make_rat(1,2)))', expected: 6  },
        { call: 'equal_rat(make_rat(1,3), make_rat(2,6))',      expected: true  },
        { call: 'equal_rat(make_rat(1,3), make_rat(1,2))',      expected: false },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `const h = make_rat(1,3), h2 = make_rat(1,2), h3 = make_rat(2,6);\n` +
            `return typeof sub_rat === 'function' && typeof equal_rat === 'function' &&\n` +
            `  numer(sub_rat(h, h2)) === -1 && denom(sub_rat(h, h2)) === 6 &&\n` +
            `  equal_rat(h, h3) === true && equal_rat(h, h2) === false`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Abstraction barriers ──────────────────────────────────────────────────────

    // ── Terminology: Abstraction Barrier ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'barrier-vocab',
      text: 'An abstraction barrier is a horizontal boundary between layers of a system. Code above the barrier uses the layer below only through its published interface — the constructor and selectors. Code below the barrier implements the interface however it wants. Because no code above can peek below, the implementation can change completely without touching the layers above it. This containment of change is why abstraction barriers matter in large systems: you can fix bugs, optimise, or change representations without rewriting every caller.',
      code: null,
    },
    {
      type: 'narration',
      id: 'barriers-gcd',
      text: 'There is a bug in our rational arithmetic: 1/2 + 1/3 gives 5/6, but 1/2 + 1/2 gives 4/4, not 1/1. We forgot to reduce fractions. The fix: put the reduction in make_rat using GCD. Notice what is beautiful — we only change make_rat. Every function above the barrier — add_rat, sub_rat, mul_rat — automatically gets the fix without knowing anything changed.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction numer(x)   { return head(x); }\nfunction denom(x)   { return tail(x); }\nfunction print_rat(x) { console.log(`${numer(x)} / ${denom(x)}`); }\n\nfunction gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }\n\nfunction make_rat(n, d) {\n  const g = gcd(Math.abs(n), Math.abs(d));\n  return pair(n / g, d / g);\n}\n\nfunction add_rat(x, y) {\n  return make_rat(numer(x) * denom(y) + numer(y) * denom(x),\n                  denom(x) * denom(y));\n}\n\nprint_rat(add_rat(make_rat(1, 2), make_rat(1, 3))); // 5 / 6\nprint_rat(add_rat(make_rat(1, 2), make_rat(1, 2))); // 1 / 1',
    },
    {
      type: 'narration',
      id: 'barriers-concept',
      text: 'Here are the four layers of the rational-number system as a stack of barriers. Nothing above a barrier knows about anything below it. add_rat does not know about make_rat\'s internal GCD logic. make_rat does not know whether pair uses an array or a closure. This layered independence is what makes large programs maintainable.',
      code: '//  ┌─────────────────────────────────────────────────────┐\n//  │  Programs that use rational numbers                   │\n//  │  add_rat  sub_rat  mul_rat  equal_rat  print_rat       │\n//  ├───────────────────────── barrier ─────────────────────┤\n//  │  make_rat  numer  denom                               │\n//  ├───────────────────────── barrier ─────────────────────┤\n//  │  pair  head  tail                                     │\n//  ├───────────────────────── barrier ─────────────────────┤\n//  │  JavaScript arrays  [x, y]                            │\n//  └───────────────────────────────────────────────────────┘\n\n// Nothing above a barrier can see below it.\nconsole.log(\'Barriers contain change.\');',
    },

    // ── Procedural pairs ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'procedural-pairs',
      text: 'SICP asks: what actually is data? We said pair is a two-element array. But here is pair implemented with no array at all — just functions. pair returns a function (dispatch) that remembers x and y in its closure. head calls that function with 0, tail calls it with 1. head and tail of this pair behave exactly the same as before. Data does not need to be built into the language — it can be synthesised from functions.',
      code: 'function pair(x, y) {\n  function dispatch(m) {\n    if (m === 0) return x;\n    if (m === 1) return y;\n    throw new Error(`argument not 0 or 1 — got ${m}`);\n  }\n  return dispatch;\n}\nfunction head(z) { return z(0); }\nfunction tail(z) { return z(1); }\n\nconst p = pair(42, 99);\nconsole.log(head(p)); // 42\nconsole.log(tail(p)); // 99\n\n// Nothing stored in an array — the values live in the closure.',
    },
    {
      type: 'codelens',
      id: 'codelens-procedural-pair',
      text: 'Open CodeLens on the procedural pair. When pair(42, 99) is called, it returns the dispatch function — a closure that has captured x=42 and y=99. When head(p) calls p(0), it calls dispatch(0), which returns x from the closure. Step through it and watch where the values live. There is no array anywhere.',
      code: 'function pair(x, y) {\n  function dispatch(m) {\n    if (m === 0) return x;\n    if (m === 1) return y;\n  }\n  return dispatch;\n}\nfunction head(z) { return z(0); }\nfunction tail(z) { return z(1); }\n\nconst p = pair(42, 99);\nconsole.log(head(p));\nconsole.log(tail(p));',
    },
    {
      type: 'checkpoint',
      id: 'cp-barriers',
    },
    {
      type: 'challenge',
      id: 'challenge-procedural-pair',
      text: 'Using only the procedural pair, build a point abstraction: make_point(x, y), x_point(p), y_point(p). Then write distance(p1, p2) = sqrt((x2-x1)² + (y2-y1)²) using Math.sqrt. distance from (0,0) to (3,4) should be 5. All operations must go through make_point, x_point, y_point — no array indexing.',
      expectedOutput: '0\n0\n5',
      startCode: 'function pair(x, y) {\n  function dispatch(m) {\n    if (m === 0) return x;\n    if (m === 1) return y;\n  }\n  return dispatch;\n}\nfunction head(z) { return z(0); }\nfunction tail(z) { return z(1); }\n\nfunction make_point(x, y) { return pair(x, y); }\nfunction x_point(p)       { return head(p); }\nfunction y_point(p)       { return tail(p); }\n\n// Write distance(p1, p2)\n\n\nconst origin = make_point(0, 0);\nconst p      = make_point(3, 4);\n\nconsole.log(x_point(origin)); // 0\nconsole.log(y_point(origin)); // 0\nconsole.log(distance(origin, p)); // 5\n',
      hint: 'function distance(p1, p2) {\n  const dx = x_point(p2) - x_point(p1);\n  const dy = y_point(p2) - y_point(p1);\n  return Math.sqrt(dx * dx + dy * dy);\n}',
      tests: [
        { call: 'x_point(make_point(3, 4))',                              expected: 3 },
        { call: 'y_point(make_point(3, 4))',                              expected: 4 },
        { call: 'Math.round(distance(make_point(0,0), make_point(3,4)))', expected: 5 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof distance === 'function' &&\n` +
            `  x_point(make_point(3, 4)) === 3 &&\n` +
            `  y_point(make_point(3, 4)) === 4 &&\n` +
            `  Math.abs(distance(make_point(0,0), make_point(3,4)) - 5) < 0.01`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
