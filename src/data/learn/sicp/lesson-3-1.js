export const lesson = {
  id: 'sicp-3-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.1  Assignment and Local State',
  checkpoints: [
    { id: 'cp-local-state',      label: 'Local State' },
    { id: 'cp-bank-account',     label: 'Objects with State' },
    { id: 'cp-costs',            label: 'Costs of Assignment' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapters 1 and 2 were written in a beautiful, clean world where functions had no memory. Call square(5) once and it returns 25. Call it a million times, it always returns 25. The substitution model works perfectly: replace the argument, evaluate the body, done. Chapter 3 breaks that world on purpose. Why? Because the real systems we want to model — bank accounts, random number generators, circuit simulators — have state that changes over time. To model a bank account faithfully, withdrawing $30 must leave the account with $30 less than before. We need functions that remember.',
      code: null,
    },

    // ── What state means ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'state-observation',
      text: 'Here is a simple question that Chapters 1 and 2 cannot answer: write a function that returns 1 the first time it is called, 2 the second time, 3 the third time, and so on. Think about it for a moment. The function takes no arguments. Every time you call it you want a different result. But a pure function with no arguments must return the same value every time — there is nothing to vary. The only way to make the return value change between calls is to have the function remember something across calls. That memory is state.',
      code: null,
    },
    {
      type: 'narration',
      id: 'state-vocab',
      text: 'Local state is information a function retains between calls. The word "local" means it belongs to that function and is not visible outside it. In JavaScript, we create a mutable binding with let instead of const. The assignment operator = changes the current value of a let binding. A function that changes a binding when called is said to have a side effect — it does something beyond returning a value. Functions with side effects violate referential transparency, a property we will examine carefully at the end of this lesson.',
      code: null,
    },

    // ── The counter: simplest stateful object ─────────────────────────────────────
    {
      type: 'narration',
      id: 'counter-intro',
      text: 'The simplest stateful object is a counter. make_counter returns a function. Inside make_counter, we declare let count = 0. This binding lives in make_counter\'s scope. The returned function, when called, increments count and returns the new value. Each call to the returned function changes count — the binding is mutable. Run it and watch: same function, same arguments (none), different results every time.',
      code: 'function make_counter() {\n  let count = 0;           // mutable binding — starts at 0\n  return function() {\n    count = count + 1;     // side effect: changes count\n    return count;\n  };\n}\n\nconst c = make_counter();\nconsole.log(c()); // 1\nconsole.log(c()); // 2\nconsole.log(c()); // 3',
    },
    {
      type: 'narration',
      id: 'independent-counters',
      text: 'Each call to make_counter creates a fresh count binding. Two counters created separately are completely independent — each has its own count, starting at 0, advancing separately. This is the key property of local state: it is encapsulated. Nothing outside make_counter can see or change the count directly. The only way to interact with it is through the returned function.',
      code: 'function make_counter() {\n  let count = 0;\n  return () => { count++; return count; };\n}\n\nconst c1 = make_counter();\nconst c2 = make_counter(); // independent — its own count\n\nconsole.log(c1()); // 1\nconsole.log(c1()); // 2\nconsole.log(c2()); // 1 — c2 starts fresh, not affected by c1\nconsole.log(c1()); // 3 — c1 continues independently',
    },
    {
      type: 'challenge',
      id: 'challenge-accumulator',
      text: 'Write make_accumulator(initial) that returns a function. Each call to the returned function takes an amount and adds it to a running total that starts at initial. The function returns the new total each time. make_accumulator(5) creates an accumulator starting at 5; calling it with 10 gives 15, then calling it again with 10 gives 25.',
      expectedOutput: '15\n25\n30',
      startCode: '// make_accumulator: returns a function that accumulates a running total\nfunction make_accumulator(initial) {\n  // your code here\n}\n\nconst acc = make_accumulator(5);\nconsole.log(acc(10)); // 15\nconsole.log(acc(10)); // 25\nconsole.log(acc(5));  // 30\n',
      hint: 'function make_accumulator(initial) {\n  let total = initial;\n  return amount => { total = total + amount; return total; };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst a=make_accumulator(5);return a(10)===15&&a(10)===25&&a(5)===30`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-local-state',
    },

    // ── The bank account: message-passing style ────────────────────────────────────
    {
      type: 'narration',
      id: 'bank-account-motivation',
      text: 'A counter has only one operation. Real objects have multiple operations that all share the same state. A bank account needs at least two: withdraw and deposit. Both must access and modify the same balance. The trick is to define balance once, define both operations as closures over it, and then return a dispatch function that routes messages to the right operation. This is the message-passing style of object-oriented programming — and SICP builds it from closures, with no special object syntax.',
      code: null,
    },
    {
      type: 'narration',
      id: 'bank-account-code',
      text: 'Here is make_account. The balance binding is shared by withdraw and deposit — they both close over the same let balance declaration. The dispatch function acts as a router: it takes a message string and returns the appropriate operation. Call acc("withdraw") to get the withdraw function, then call that with an amount.',
      code: 'function make_account(initial) {\n  let balance = initial;\n\n  function withdraw(amount) {\n    if (balance >= amount) {\n      balance = balance - amount;\n      return balance;\n    }\n    return \'Insufficient funds\';\n  }\n\n  function deposit(amount) {\n    balance = balance + amount;\n    return balance;\n  }\n\n  return function dispatch(msg) {\n    if (msg === \'withdraw\') return withdraw;\n    if (msg === \'deposit\')  return deposit;\n    if (msg === \'balance\')  return balance;\n    throw new Error(`Unknown message: ${msg}`);\n  };\n}\n\nconst acc = make_account(100);\nconsole.log(acc(\'balance\'));       // 100\nconsole.log(acc(\'withdraw\')(25));  // 75\nconsole.log(acc(\'withdraw\')(75));  // 0\nconsole.log(acc(\'withdraw\')(10));  // Insufficient funds',
    },
    {
      type: 'narration',
      id: 'independence-of-accounts',
      text: 'Two accounts created from make_account are completely independent. Their balance bindings are separate closures over separate let declarations. Withdrawing from one account has no effect on the other. This is the encapsulation property: each account object owns its own state, invisible to all other code. Compare this to a global variable called balance — any function anywhere could change it accidentally. Local state prevents that.',
      code: 'function make_account(initial) {\n  let balance = initial;\n  const withdraw = amount => { balance -= amount; return balance; };\n  const get_balance = () => balance;\n  return { withdraw, get_balance };\n}\n\nconst joint  = make_account(500);\nconst savings = make_account(1000);\n\njoint.withdraw(200);\nconsole.log(joint.get_balance());   // 300 — only joint changed\nconsole.log(savings.get_balance()); // 1000 — savings unaffected',
    },
    {
      type: 'challenge',
      id: 'challenge-monitored',
      text: 'Write make_monitored(f) that wraps any function f and counts how many times it has been called. The returned function behaves exactly like f for normal arguments. But if called with the string "how_many_calls", it returns the call count. If called with "reset_count", it resets the counter to 0. make_monitored(Math.sqrt)(25) should return 5, and after two such calls, "how_many_calls" should return 2.',
      expectedOutput: '5\n4\n2\n0',
      startCode: '// make_monitored: wraps f, counts its calls\nfunction make_monitored(f) {\n  // your code here\n}\n\nconst m_sqrt = make_monitored(Math.sqrt);\nconsole.log(m_sqrt(25));                // 5\nconsole.log(m_sqrt(16));                // 4\nconsole.log(m_sqrt(\'how_many_calls\')); // 2\nm_sqrt(\'reset_count\');\nconsole.log(m_sqrt(\'how_many_calls\')); // 0\n',
      hint: 'function make_monitored(f) {\n  let count = 0;\n  return function(x) {\n    if (x === \'how_many_calls\') return count;\n    if (x === \'reset_count\') { count = 0; return; }\n    count++;\n    return f(x);\n  };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst m=make_monitored(x=>x*x);m(5);m(3);return m('how_many_calls')===2&&(m('reset_count'),m('how_many_calls')===0)`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-bank-account',
    },

    // ── Costs of assignment ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'referential-transparency-vocab',
      text: 'Chapters 1 and 2 had a beautiful property: referential transparency. An expression is referentially transparent if you can replace it with its value everywhere it appears without changing the program\'s meaning. square(5) always means 25, so you can substitute 25 for square(5) anywhere. This made the substitution model work. It also makes programs easy to reason about: a function call is just a value, not a potentially time-dependent event. Assignment destroys referential transparency. After let x = 0; x = x + 1, the expression x no longer has a fixed meaning — it depends on when you evaluate it.',
      code: null,
    },
    {
      type: 'narration',
      id: 'same-expression-different-results',
      text: 'Here is the referential transparency failure made concrete. In a pure world, f(x) + f(x) always equals 2 * f(x). But if f has a side effect — like incrementing a counter — then f(x) is not the same value each time it is called. The two calls may return different numbers. You cannot substitute the first result for the second.',
      code: 'let call_count = 0;\n\nfunction f(x) {\n  call_count++;\n  return x * x + call_count; // result depends on call order\n}\n\n// Are these the same? Not anymore.\nconsole.log(f(3));      // 10 (9 + 1)\nconsole.log(f(3));      // 11 (9 + 2)\n\n// f(3) + f(3) ≠ 2 * f(3)   — referential transparency is gone',
    },
    {
      type: 'narration',
      id: 'identity-vs-value-vocab',
      text: 'Assignment also introduces object identity — the distinction between two objects that happen to hold the same value and two names that refer to the same object. With immutable data, this distinction does not exist: two numbers equal to 5 are indistinguishable. With mutable state, it is crucial. Two bank accounts starting at $100 are not the same account. Withdrawing from one does not touch the other. But if two names refer to the same account object — an alias — then withdrawing through either name changes the shared balance. This accidental aliasing is a common source of hard-to-find bugs.',
      code: null,
    },
    {
      type: 'narration',
      id: 'aliasing-demo',
      text: 'Here is aliasing in action. acc2 is not a copy of acc1 — it IS acc1, the same object in memory. Withdrawing through acc2 changes the same balance that acc1 sees. Compare acc3, which is a truly independent account.',
      code: 'function make_account(initial) {\n  let balance = initial;\n  return {\n    withdraw: amount => { balance -= amount; return balance; },\n    balance:  () => balance,\n  };\n}\n\nconst acc1 = make_account(100);\nconst acc2 = acc1;   // alias — same object\nconst acc3 = make_account(100); // independent\n\nacc1.withdraw(30);\nconsole.log(acc2.balance()); // 70 — acc2 sees the change (same object)\nconsole.log(acc3.balance()); // 100 — acc3 unaffected (different object)',
    },
    {
      type: 'narration',
      id: 'assignment-tradeoff',
      text: 'SICP is honest about the tradeoff. Assignment lets us model things that change — and that is genuinely useful. A random number generator needs state to produce different numbers each call. A simulation needs objects that evolve. A cache needs to remember previous computations. But every use of assignment carries a cost: the substitution model is gone, referential transparency is gone, reasoning about program correctness becomes harder. The rest of Chapter 3 explores the full consequences. Chapter 3.2 builds the environment model to replace substitution. Chapter 3.3 shows what mutable data structures look like. Chapter 3.4 shows what happens when multiple processes share mutable state concurrently — and why it is so hard to get right.',
      code: null,
    },
    {
      type: 'narration',
      id: 'rand-vocab',
      text: 'A concrete example of necessary state: random number generators. A pseudo-random number generator maintains a seed — a number — and produces the next "random" number by applying a deterministic formula to the seed, updating the seed as a side effect. Without state, it would return the same number every call. The state is exactly what makes it useful.',
      code: 'function make_rand(initial_seed) {\n  let x = initial_seed;\n  return function() {\n    // Linear congruential generator — a classic formula\n    x = (x * 1664525 + 1013904223) & 0xffffffff;\n    return (x >>> 0) / 0xffffffff; // normalize to [0, 1)\n  };\n}\n\nconst rand = make_rand(42);\nconsole.log(rand().toFixed(4)); // some value\nconsole.log(rand().toFixed(4)); // a different value\nconsole.log(rand().toFixed(4)); // a third value',
    },
    {
      type: 'challenge',
      id: 'challenge-memoize',
      text: 'Write memoize(f) that wraps any pure function f in a cache. The first time memoize(f)(x) is called, it computes f(x), stores the result in a Map, and returns it. Subsequent calls with the same x return the cached result without calling f again. A call_count variable proves f is only called once per unique argument. memoize(square) should compute square(5) once even when called three times with 5.',
      expectedOutput: '25\n25\n25\n1',
      startCode: '// memoize: cache results to avoid recomputing\nfunction memoize(f) {\n  // your code here\n}\n\nlet call_count = 0;\nconst square = x => { call_count++; return x * x; };\n\nconst memo_square = memoize(square);\nconsole.log(memo_square(5)); // 25 — computes\nconsole.log(memo_square(5)); // 25 — cached\nconsole.log(memo_square(5)); // 25 — cached\nconsole.log(call_count);     // 1  — f called only once\n',
      hint: 'function memoize(f) {\n  const cache = new Map();\n  return x => {\n    if (cache.has(x)) return cache.get(x);\n    const result = f(x);\n    cache.set(x, result);\n    return result;\n  };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nlet n=0;const sq=x=>{n++;return x*x;};const m=memoize(sq);m(5);m(5);m(5);return m(5)===25&&n===1`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-costs',
    },
  ],
}
