export const lesson = {
  id: 'sicp-3-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.1  Assignment and Local State',
  checkpoints: [
    { id: 'cp-local-state',       label: 'Local State' },
    { id: 'cp-costs-assignment',  label: 'Costs of Assignment' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapters 1 and 2 built a rich world of computation without ever changing a variable. Every value was immutable. The substitution model worked perfectly because calling a function twice with the same arguments always gave the same result. Chapter 3 introduces assignment — the ability to change the value bound to a name. This single addition transforms the entire character of programming: programs gain memory, objects gain identity over time, and the clean substitution model breaks down.',
      code: null,
    },

    // ── Terminology: State and Mutation ──────────────────────────────────────────
    {
      type: 'narration',
      id: 'state-vocab',
      text: 'Local state is the information a function retains between calls. A function with local state behaves differently depending on its history — it has memory. Mutation (or assignment) is the act of changing a previously bound name to a new value. In JavaScript, const creates an immutable binding; let creates a mutable one. The assignment operator = changes a let binding in place. A function that mutates state when called is said to have a side effect: it does something beyond returning a value.',
      code: null,
    },

    // ── 3.1.1  Local State Variables ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'counter-intro',
      text: 'The simplest stateful object: a counter. make_counter returns a function that remembers how many times it has been called. The counter variable lives inside make_counter\'s scope, captured as a closure. Each call to the returned function increments it. Run it — each call returns a different value even though no arguments change.',
      code: 'function make_counter() {\n  let count = 0;            // local state — mutable\n  return function() {\n    count = count + 1;      // assignment: changes the binding\n    return count;\n  };\n}\n\nconst c = make_counter();\nconsole.log(c()); // 1\nconsole.log(c()); // 2\nconsole.log(c()); // 3\n\nconst d = make_counter(); // a fresh counter — independent state\nconsole.log(d()); // 1',
    },

    // ── 3.1.2  Benefits of Assignment ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'make-account',
      text: 'Here is the classic SICP example: a bank account. make_account takes an initial balance and returns a dispatch function. The dispatch function routes messages — "withdraw", "deposit", or "balance" — to the appropriate inner function. Both withdraw and deposit close over the balance variable and can mutate it. Two accounts created with make_account are completely independent — each has its own balance.',
      code: 'function make_account(initial_balance) {\n  let balance = initial_balance;\n\n  function withdraw(amount) {\n    if (balance >= amount) {\n      balance = balance - amount;\n      return balance;\n    }\n    return \'Insufficient funds\';\n  }\n\n  function deposit(amount) {\n    balance = balance + amount;\n    return balance;\n  }\n\n  function dispatch(msg) {\n    if (msg === \'withdraw\') return withdraw;\n    if (msg === \'deposit\')  return deposit;\n    if (msg === \'balance\')  return balance;\n    throw new Error(`Unknown message: ${msg}`);\n  }\n\n  return dispatch;\n}\n\nconst acc = make_account(100);\nconsole.log(acc(\'balance\'));        // 100\nconsole.log(acc(\'withdraw\')(25));   // 75\nconsole.log(acc(\'withdraw\')(30));   // 45\nconsole.log(acc(\'deposit\')(50));    // 95\nconsole.log(acc(\'balance\'));        // 95',
    },
    {
      type: 'challenge',
      id: 'challenge-accumulator',
      text: 'Write make_accumulator(n) that returns a function. Each time the returned function is called with an amount, it adds the amount to a running total that starts at n and returns the new total. make_accumulator(5)(10) → 15, then calling again with 10 → 25.',
      expectedOutput: '15\n25\n30',
      startCode: '// make_accumulator(n): returns a function that accumulates a running total starting at n\nfunction make_accumulator(n) {\n  // your code here\n}\n\nconst acc = make_accumulator(5);\nconsole.log(acc(10)); // 15\nconsole.log(acc(10)); // 25\nconsole.log(acc(5));  // 30\n',
      hint: 'function make_accumulator(n) {\n  let total = n;\n  return function(amount) {\n    total = total + amount;\n    return total;\n  };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `const acc = make_accumulator(5);\n` +
            `return typeof make_accumulator === 'function' && acc(10)===15 && acc(10)===25 && acc(5)===30`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-local-state',
    },

    // ── 3.1.3  Costs of Assignment ────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'referential-transparency-vocab',
      text: 'In Chapters 1 and 2, every expression had a fixed value — you could replace any expression with its value anywhere it appeared without changing the program\'s meaning. This property is called referential transparency. Assignment destroys it. After let x = 0; x = x + 1, the expression x no longer has a fixed value — it depends on when you evaluate it. The substitution model assumed referential transparency. Without it, the substitution model gives wrong answers for programs with state.',
      code: null,
    },
    {
      type: 'narration',
      id: 'identity-vs-value-vocab',
      text: 'Assignment also introduces object identity — the distinction between two objects that happen to have the same value and two names that refer to the same object. With immutable values, this distinction does not exist. With mutable state, it is crucial: two independent bank accounts with the same balance are not the same account. Mutating one does not affect the other. This is called aliasing when two names do refer to the same mutable object — a common source of bugs.',
      code: null,
    },
    {
      type: 'narration',
      id: 'costs-demo',
      text: 'Here is the referential transparency violation in code. square(x) + square(x) should equal 2 * square(x) if everything is pure. But if square has a side effect — like a counter — the two calls produce different results. Same arguments, different outputs. The substitution model cannot handle this.',
      code: 'let call_count = 0;\n\nfunction square_with_counter(x) {\n  call_count++;\n  return x * x;\n}\n\n// In a pure world: square(5) + square(5) === 2 * square(5)\n// With side effects, this no longer holds:\ncall_count = 0;\nconst result1 = square_with_counter(5) + square_with_counter(5);\nconsole.log(`Result: ${result1}, calls: ${call_count}`);  // Result: 50, calls: 2\n\ncall_count = 0;\nconst s = square_with_counter(5);\nconst result2 = s + s;\nconsole.log(`Result: ${result2}, calls: ${call_count}`);  // Result: 50, calls: 1\n\n// Same mathematical value, but different number of calls — different behaviour',
    },
    {
      type: 'narration',
      id: 'assignment-tradeoff',
      text: 'SICP is candid about the tradeoff. Assignment lets us model objects with changing state — bank accounts, random number generators, simulations — in a way that purely functional code cannot. But it makes programs harder to reason about because the same expression can mean different things at different times. The rest of Chapter 3 explores the consequences: the need for the full environment model (Chapter 3.2), the difficulties of mutable data structures (Chapter 3.3), and the chaos of concurrency (Chapter 3.4).',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-monitored',
      text: 'Write make_monitored(f) that takes a function f and returns a monitored version. The monitored version behaves like f for normal arguments. But if called with the string "how_many_calls", it returns how many times f has been called. If called with "reset_count", it resets the counter to 0.',
      expectedOutput: '25\n9\n2\n0',
      startCode: '// make_monitored(f): wraps f with a call counter\nfunction make_monitored(f) {\n  // your code here\n}\n\nconst m_square = make_monitored(x => x * x);\nconsole.log(m_square(5));                  // 25\nconsole.log(m_square(3));                  // 9\nconsole.log(m_square(\'how_many_calls\'));   // 2\nm_square(\'reset_count\');\nconsole.log(m_square(\'how_many_calls\'));   // 0\n',
      hint: 'function make_monitored(f) {\n  let count = 0;\n  return function(x) {\n    if (x === \'how_many_calls\') return count;\n    if (x === \'reset_count\') { count = 0; return; }\n    count++;\n    return f(x);\n  };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `const m = make_monitored(x => x * x);\n` +
            `m(5); m(3);\n` +
            `const c = m('how_many_calls');\n` +
            `m('reset_count');\n` +
            `const c2 = m('how_many_calls');\n` +
            `return typeof make_monitored==='function' && c===2 && c2===0`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-costs-assignment',
    },
  ],
}
