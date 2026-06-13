// SICP — JavaScript — Lesson 4.2
export const lesson = {
  id: 'sicp-4-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '4.2  Lazy Evaluation and Infinite Streams',
  checkpoints: [
    { id: 'cp-thunks',  label: 'Thunks & Lazy Evaluation' },
    { id: 'cp-streams', label: 'Infinite Streams' },
    { id: 'cp-sieve',   label: 'Sieve of Eratosthenes' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — LAZY EVALUATION AND THUNKS
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'In 1990, a committee of programming language researchers released Haskell — a language that made a radical design choice: evaluate NOTHING until the result is actually needed. Every standard language you know (JavaScript, Python, Java, C) uses applicative-order evaluation: all function arguments are evaluated before the function is called. Haskell uses normal-order evaluation — also called "lazy evaluation" — and evaluates an expression only when its value is demanded.\n\nThis sounds like a performance optimisation, and it is. But the deeper consequence is something that applicative-order languages cannot express naturally: infinite data structures. If you never evaluate a list\'s tail until you actually access it, the tail can be an arbitrarily long — even infinite — computation that materialises one element at a time. Today we add lazy evaluation to our Chapter 4 evaluator, then use it to build infinite streams.',
      code: null,
    },

    // ── Applicative vs normal order ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'applicative-vs-normal',
      text: 'Applicative order: evaluate arguments first, then call the function. Normal order: pass arguments unevaluated, evaluate them only when (and if) the function body actually uses them. For pure functions with no side effects, both orders give the same result. But they differ when an argument causes an error, loops forever, or is simply never used.\n\nHere is the classic example. Define `f(x, y)` that always returns x, ignoring y entirely. In applicative order, `f(1, bad_computation())` crashes because `bad_computation()` is evaluated before the call, even though its result is discarded. In normal order (simulated here with a thunk — a zero-argument function), `bad_computation` is never evaluated because y is never used:',
      code: `function bad_computation() {
  throw new Error('this should never be evaluated!');
}

// APPLICATIVE ORDER: y is evaluated before f is called.
function f_applicative(x, y) {
  return x;   // ignores y entirely
}

try {
  f_applicative(1, bad_computation());  // crashes — y evaluated eagerly
} catch (e) {
  console.log('applicative order crashed: ' + e.message);
}

// NORMAL ORDER (simulated with a thunk): y is wrapped in () => ...
// f only calls the thunk if it needs y. Since f ignores y, it never calls it.
function f_normal_order(x, y_thunk) {
  return x;   // never calls y_thunk(), so bad_computation never runs
}

const result = f_normal_order(1, () => bad_computation());
console.log('normal order result: ' + result);   // 1 — no crash`,
    },

    // ── Thunks ────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'thunk-idea',
      text: 'A thunk is a delayed computation: a zero-argument function that, when called, produces a value. `const t = () => some_expression` creates a thunk — the expression is not evaluated until `t()` is called. Wrapping a value in a thunk delays (defers) it. Calling the thunk forces it. Thunks are the implementation mechanism for lazy evaluation: instead of passing the value of an argument, you pass a thunk that will compute the value on demand.',
      code: `// A thunk is just a zero-argument function.
const eager_result = 5 * 5;          // evaluated immediately: 25
const lazy_square  = () => 5 * 5;   // thunk: NOT evaluated yet

console.log('eager: ' + eager_result);    // 25
console.log('lazy before force: ' + typeof lazy_square);  // function

// Forcing the thunk by calling it:
const forced = lazy_square();
console.log('lazy after force: ' + forced);   // 25

// Thunks can capture variables:
function make_lazy_sum(a, b) {
  return () => a + b;   // sum is not computed until the thunk is called
}

const deferred_sum = make_lazy_sum(100, 200);
console.log('sum thunk created, not yet computed');
console.log('forcing sum: ' + deferred_sum());   // 300`,
    },

    // ── Memoized thunks ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'thunk-memoized',
      text: 'Naive thunks have an inefficiency: if you force the same thunk twice, it recomputes the expression both times. For pure expressions this is just wasted work; for expressions with side effects it is incorrect — the side effect fires twice. The solution is memoization: a memoized thunk evaluates once and caches the result, returning the cached value on every subsequent force.\n\nThis is exactly what Haskell does internally for every lazy expression. SICP calls it the "memo-thunk" of Section 4.2.2. `make_thunk(f)` returns a memoized thunk object with a `force()` method. The first call to `force()` evaluates `f()`, stores the result, and sets a `forced` flag. Every subsequent call sees the flag and returns the cached value immediately:',
      code: `function make_thunk(expr_fn) {
  return {
    forced: false,
    value:  undefined,
    force() {
      if (this.forced) {
        return this.value;         // already computed — return cached
      }
      this.value  = expr_fn();     // evaluate exactly once
      this.forced = true;
      return this.value;
    }
  };
}

let eval_count = 0;

const expensive = make_thunk(() => {
  eval_count++;
  console.log('  (computing expensive value...)');
  let sum = 0;
  for (let i = 1; i <= 1000; i++) sum += i;
  return sum;
});

console.log('thunk created — not evaluated yet');
console.log('eval_count before force: ' + eval_count);   // 0

console.log('first force:  ' + expensive.force());       // computes: 500500
console.log('eval_count after first force: ' + eval_count);  // 1

console.log('second force: ' + expensive.force());       // cached: 500500
console.log('eval_count after second force: ' + eval_count); // still 1`,
    },

    { type: 'checkpoint', id: 'cp-thunks' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — INFINITE STREAMS
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'streams-idea',
      text: 'With memoized thunks we can build infinite data structures. A stream is a list whose tail is a thunk — it is not evaluated until you explicitly access it. `stream_cons(head, tail_thunk)` pairs a value with a deferred rest. `stream_car(s)` returns the head immediately. `stream_cdr(s)` forces the tail thunk to get the next stream pair. Because the tail is unevaluated, it can represent an infinitely long sequence that materialises one element at a time, on demand.\n\nAt any moment, only the finite prefix you have actually accessed exists in memory. The rest of the "infinite" structure is just a collection of as-yet-unevaluated thunks, each waiting to produce the next element when forced:',
      code: `// Stream primitives:
const stream_cons = (head, tail_thunk) => ({ head, tail: tail_thunk });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();   // force the tail thunk
const stream_null = null;
const is_stream_null = s => s === null;

// stream_take: materialise the first n elements into a JS array.
function stream_take(n, s) {
  if (n === 0 || is_stream_null(s)) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}

// The infinite stream of integers starting from n:
function integers_from(n) {
  // The tail is a thunk — integers_from(n+1) is NOT called yet.
  return stream_cons(n, () => integers_from(n + 1));
}

const nats = integers_from(1);
console.log('first element: ' + stream_car(nats));          // 1
console.log('first 5:  ' + stream_take(5, nats));           // 1,2,3,4,5
console.log('first 10: ' + stream_take(10, integers_from(1)));`,
    },

    // ── Stream operations ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'integers-stream',
      text: 'The infinite stream of integers starting from n is the prototype infinite stream. `integers_from(1)` is conceptually [1, 2, 3, 4, ...] — unbounded. But in memory, at the moment of creation, it is just a pair: the head 1, and a thunk that will produce the rest when forced. Calling `stream_cdr` forces the thunk, which calls `integers_from(2)` — creating another pair: head 2, thunk for the rest. At any moment only the nodes you have traversed are materialised.\n\nThe crucial measure: `stream_take(k, integers_from(1))` creates exactly k stream nodes and k thunks. The remaining infinity is not computed. This is the laziness guarantee:',
      code: `const stream_cons = (head, tail_thunk) => ({ head, tail: tail_thunk });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();
function stream_take(n, s) {
  if (n === 0 || s === null) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}

// Count how many nodes are created:
let nodes_created = 0;
function integers_from(n) {
  nodes_created++;
  return stream_cons(n, () => integers_from(n + 1));
}

nodes_created = 0;
const first5 = stream_take(5, integers_from(1));
console.log('first 5 integers: ' + first5);
console.log('nodes created: ' + nodes_created);   // exactly 5 — not infinity

nodes_created = 0;
const first3 = stream_take(3, integers_from(100));
console.log('first 3 from 100: ' + first3);
console.log('nodes created: ' + nodes_created);   // exactly 3`,
    },

    {
      type: 'narration',
      id: 'stream-operations',
      text: '`stream_map` and `stream_filter` on infinite streams also return infinite streams — each tail is a thunk that applies the operation to the rest, on demand. The key is that neither function evaluates more than the head of the stream and defers the rest. Walk through `stream_filter(is_odd, integers_from(1))`: it checks 1 (odd — keep it), and the tail thunk, when forced, calls `stream_filter(is_odd, stream_cdr(...))` which checks 2 (even — skip it), then checks 3 (odd — keep it), and so on. The stream of odd integers is built one element at a time:',
      code: `const stream_cons = (h, t) => ({ head: h, tail: t });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();
const is_null     = s => s === null;
function stream_take(n, s) {
  if (n === 0 || is_null(s)) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}
function integers_from(n) {
  return stream_cons(n, () => integers_from(n + 1));
}

// stream_map: apply f to every element of an infinite stream.
function stream_map(f, s) {
  if (is_null(s)) return null;
  return stream_cons(f(stream_car(s)), () => stream_map(f, stream_cdr(s)));
}

// stream_filter: keep only elements satisfying pred.
function stream_filter(pred, s) {
  if (is_null(s)) return null;
  if (pred(stream_car(s))) {
    return stream_cons(stream_car(s), () => stream_filter(pred, stream_cdr(s)));
  }
  return stream_filter(pred, stream_cdr(s));   // skip this element, recurse
}

const nats    = integers_from(1);
const squares = stream_map(n => n * n, nats);
const odds    = stream_filter(n => n % 2 !== 0, nats);

console.log('first 5 squares: ' + stream_take(5, squares));   // 1,4,9,16,25
console.log('first 5 odds:    ' + stream_take(5, odds));       // 1,3,5,7,9`,
    },

    // ── Codelens: thunk forcing ────────────────────────────────────────────────

    {
      type: 'codelens',
      id: 'codelens-thunk',
      text: 'Step through forcing a memoized thunk twice. On the first call to `force()`, watch `this.forced` change from false to true — the expression is evaluated, the result stored. On the second call, `this.forced` is already true: the function returns the cached value immediately without re-running the expression. The `eval_count` stays at 1 after both forces — each expression evaluates at most once, no matter how many times the thunk is forced.',
      code: `function make_thunk(expr_fn) {
  return {
    forced: false,
    value: undefined,
    force() {
      if (this.forced) {
        console.log('  cache hit — returning: ' + this.value);
        return this.value;
      }
      console.log('  evaluating for the first time...');
      this.value  = expr_fn();
      this.forced = true;
      console.log('  result cached: ' + this.value);
      return this.value;
    }
  };
}

let eval_count = 0;
const t = make_thunk(() => {
  eval_count++;
  return 6 * 7;
});

console.log('forced flag: ' + t.forced);    // false
const v1 = t.force();
console.log('after first force: ' + v1 + ', eval_count=' + eval_count);  // 42, 1
const v2 = t.force();
console.log('after second force: ' + v2 + ', eval_count=' + eval_count); // 42, 1
console.log('forced flag: ' + t.forced);    // true`,
      lang: 'js',
    },

    { type: 'checkpoint', id: 'cp-streams' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — SIEVE OF ERATOSTHENES
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'sieve-idea',
      text: 'The Sieve of Eratosthenes is an ancient algorithm for finding all prime numbers, described by the Greek mathematician Eratosthenes around 240 BC. The classical version uses an array: write down all integers from 2. Circle 2 (prime). Cross out all multiples of 2. Circle the next uncrossed number (3). Cross out all multiples of 3. Repeat. Every circled number is prime.\n\nOn an infinite stream, this algorithm becomes self-referential and elegant: start with the stream of integers from 2. The first element is 2 — mark it as prime, and filter all multiples of 2 from the rest. The first element of what remains is 3 — mark it as prime, filter multiples of 3. This sieve never terminates (there are infinitely many primes), but because the filtering is lazy, we can demand as many primes as we want and each one is computed on demand.',
      code: null,
    },

    {
      type: 'narration',
      id: 'sieve-code',
      text: '`sieve(s)` is a single, self-referential definition. Take the first element of the stream — call it p. It is prime. The tail of the result is: `sieve` applied to the stream with all multiples of p removed. This recursive definition is not circular because the tail is deferred — it is a thunk that will only be evaluated when `stream_cdr` is called on the result. SICP calls this one of the most beautiful programs in the book. `stream_take(10, sieve(integers_from(2)))` gives the first 10 primes:',
      code: `const stream_cons = (h, t) => ({ head: h, tail: t });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();
const is_null     = s => s === null;
function stream_take(n, s) {
  if (n === 0 || is_null(s)) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}
function integers_from(n) {
  return stream_cons(n, () => integers_from(n + 1));
}
function stream_filter(pred, s) {
  if (is_null(s)) return null;
  if (pred(stream_car(s)))
    return stream_cons(stream_car(s), () => stream_filter(pred, stream_cdr(s)));
  return stream_filter(pred, stream_cdr(s));
}

// The sieve: first element is prime; tail is the sieve of what remains
// after removing all multiples of that prime.
function sieve(s) {
  const p = stream_car(s);
  return stream_cons(
    p,
    () => sieve(stream_filter(n => n % p !== 0, stream_cdr(s)))
  );
}

const primes = sieve(integers_from(2));

console.log('first 5 primes:  ' + stream_take(5,  primes));
// 2,3,5,7,11
console.log('first 10 primes: ' + stream_take(10, primes));
// 2,3,5,7,11,13,17,19,23,29`,
    },

    // ── Codelens: stream forcing ───────────────────────────────────────────────

    {
      type: 'codelens',
      id: 'codelens-stream',
      text: 'Step through `stream_take(3, integers_from(1))`. Watch each call to `stream_cdr` force one thunk, which constructs the next stream node and another thunk. After 3 elements are taken, no further thunks are forced. The stream node for 4, 5, 6, ... does not exist yet — those numbers have never been computed. This is the laziness guarantee: you pay only for what you use.',
      code: `const stream_cons = (head, tail_thunk) => ({ head, tail: tail_thunk });
const stream_car  = s => s.head;
const stream_cdr  = s => {
  console.log('  forcing tail of node ' + s.head + '...');
  return s.tail();
};

let nodes = 0;
function integers_from(n) {
  nodes++;
  console.log('  creating node: ' + n + ' (total nodes: ' + nodes + ')');
  return stream_cons(n, () => integers_from(n + 1));
}

console.log('=== stream_take(3, integers_from(1)) ===');
nodes = 0;

function stream_take(n, s) {
  if (n === 0 || s === null) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}

const result = stream_take(3, integers_from(1));
console.log('result: ' + result);
console.log('total nodes ever created: ' + nodes);  // exactly 4 (nodes 1-4)`,
      lang: 'js',
    },

    // ── Challenges ────────────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'challenge-stream-ops',
      text: 'Implement stream_filter(pred, s) and stream_map(f, s). Both should work on infinite streams and return infinite streams. Test them together: stream_take(5, stream_map(x => x * x, integers_from(1))) should give [1, 4, 9, 16, 25]. The stream primitives and integers_from are provided.',
      expectedOutput: '1,4,9,16,25',
      startCode: `const stream_cons = (h, t) => ({ head: h, tail: t });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();
const is_null     = s => s === null;
function stream_take(n, s) {
  if (n === 0 || is_null(s)) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}
function integers_from(n) {
  return stream_cons(n, () => integers_from(n + 1));
}

// Implement stream_map(f, s):
// — if s is null, return null
// — otherwise: head = f(stream_car(s)), tail thunk = () => stream_map(f, stream_cdr(s))
function stream_map(f, s) {
  // your code here
}

// Implement stream_filter(pred, s):
// — if s is null, return null
// — if pred(stream_car(s)) is true: keep head, defer filter of tail
// — else: skip head, recurse immediately on tail
function stream_filter(pred, s) {
  // your code here
}

const squares = stream_map(x => x * x, integers_from(1));
console.log(stream_take(5, squares).join(','));
`,
      hint: 'function stream_map(f, s) {\n  if (is_null(s)) return null;\n  return stream_cons(f(stream_car(s)), () => stream_map(f, stream_cdr(s)));\n}\nfunction stream_filter(pred, s) {\n  if (is_null(s)) return null;\n  if (pred(stream_car(s)))\n    return stream_cons(stream_car(s), () => stream_filter(pred, stream_cdr(s)));\n  return stream_filter(pred, stream_cdr(s));\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof stream_map === "function" && typeof stream_filter === "function" && stream_take(5, stream_map(x => x * x, integers_from(1))).join(",") === "1,4,9,16,25"')
          return fn() === true
        } catch { return false }
      },
    },

    {
      type: 'challenge',
      id: 'challenge-sieve',
      text: 'Implement sieve(s) using stream_filter. The first element of the stream is a prime p. The tail is: sieve applied to the stream with all multiples of p removed. Then verify that stream_take(5, sieve(integers_from(2))) gives [2, 3, 5, 7, 11]. All helper functions are provided.',
      expectedOutput: '2,3,5,7,11',
      startCode: `const stream_cons = (h, t) => ({ head: h, tail: t });
const stream_car  = s => s.head;
const stream_cdr  = s => s.tail();
const is_null     = s => s === null;
function stream_take(n, s) {
  if (n === 0 || is_null(s)) return [];
  return [stream_car(s), ...stream_take(n - 1, stream_cdr(s))];
}
function integers_from(n) {
  return stream_cons(n, () => integers_from(n + 1));
}
function stream_filter(pred, s) {
  if (is_null(s)) return null;
  if (pred(stream_car(s)))
    return stream_cons(stream_car(s), () => stream_filter(pred, stream_cdr(s)));
  return stream_filter(pred, stream_cdr(s));
}

// Implement sieve(s):
// — let p = stream_car(s)  (this is prime)
// — return a stream_cons of p with a tail thunk that:
//     calls sieve on stream_filter(n => n % p !== 0, stream_cdr(s))
function sieve(s) {
  // your code here
}

console.log(stream_take(5, sieve(integers_from(2))).join(','));
`,
      hint: 'function sieve(s) {\n  const p = stream_car(s);\n  return stream_cons(\n    p,\n    () => sieve(stream_filter(n => n % p !== 0, stream_cdr(s)))\n  );\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof sieve === "function" && stream_take(5, sieve(integers_from(2))).join(",") === "2,3,5,7,11"')
          return fn() === true
        } catch { return false }
      },
    },

    { type: 'checkpoint', id: 'cp-sieve' },
  ],
}
