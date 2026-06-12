export const lesson = {
  id: 'sicp-3-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.2  The Environment Model of Evaluation',
  checkpoints: [
    { id: 'cp-frames',      label: 'Frames & Lookup' },
    { id: 'cp-closures',    label: 'Closures' },
    { id: 'cp-mutation',    label: 'Mutation in Frames' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'The substitution model served us well through Chapter 2. To evaluate square(5), substitute 5 for x in x*x and get 25. Clean and correct. But the moment we introduced assignment in Chapter 3.1, the model broke. After let x = 0; x = x + 1, what do you substitute for x? The substitution model cannot answer that question. Chapter 3.2 introduces the model that can: the environment model.',
      code: null,
    },

    // ── Why substitution breaks ───────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'substitution-breaks',
      text: 'Here is the exact failure. The substitution model says: to evaluate balance - amount, replace balance with its value. But which value? The value when the function was defined? The value right now? After withdrawal it will be a third value. Substitution assumes names have fixed values. Assignment destroys that assumption.',
      code: 'function make_account(initial) {\n  let balance = initial;\n  function withdraw(amount) {\n    balance = balance - amount;\n    return balance;\n  }\n  return withdraw;\n}\n\nconst w = make_account(100);\nconsole.log(w(30)); // 70\nconsole.log(w(30)); // 40 — same call, different result\n// Substitution cannot explain this: "balance" is not a fixed value',
    },

    // ── Terminology: Frames ───────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'frame-vocab',
      text: 'The environment model replaces the idea of fixed values with frames. A frame is a table of bindings — name-to-value pairs for a particular scope. Unlike substitution, frames are mutable: assignment changes the value in the frame without creating a new frame. The binding name → value stays in the same frame; only the value changes. This is what lets balance go from 100 to 70 to 40 across calls.',
      code: null,
    },
    {
      type: 'narration',
      id: 'global-frame-code',
      text: 'There is always exactly one global frame. Top-level declarations add bindings to it. Here we simulate a frame as a JavaScript Map. Lookup finds the value. Set changes it in place.',
      code: '// A frame is a table of name→value bindings\nconst global_frame = new Map([\n  [\'pi\', 3.14159],\n  [\'e\',  2.71828],\n]);\n\nconsole.log(global_frame.get(\'pi\')); // 3.14159\n\n// Assignment mutates the existing frame — no new frame created\nglobal_frame.set(\'pi\', 3.0);\nconsole.log(global_frame.get(\'pi\')); // 3.0 — changed in place',
    },

    // ── Terminology: Environment as chain of frames ───────────────────────────────
    {
      type: 'narration',
      id: 'environment-chain-vocab',
      text: 'An environment is not a single frame — it is a chain of frames. Each frame has a pointer to its enclosing environment. The chain ends at the global frame. When the interpreter looks up a name, it searches the current frame first. If not found, it searches the enclosing frame. Then the enclosing of that, and so on, up to the global frame. If still not found, the name is unbound — an error.',
      code: null,
    },
    {
      type: 'narration',
      id: 'lookup-algorithm-code',
      text: 'Here is lookup written explicitly. It takes a name and an environment (chain of frames). It searches the current frame, then recurses up the chain.',
      code: 'function make_env(frame, enclosing) {\n  return { frame, enclosing };\n}\n\nfunction lookup(name, env) {\n  if (env === null) throw new Error(`Unbound name: ${name}`);\n  if (env.frame.has(name)) return env.frame.get(name);\n  return lookup(name, env.enclosing); // try the enclosing frame\n}\n\n// Example: x in local, pi in global\nconst global = make_env(new Map([[\'pi\', 3.14]]), null);\nconst local  = make_env(new Map([[\'x\', 5]]), global);\n\nconsole.log(lookup(\'x\',  local));  // 5  — found in local frame\nconsole.log(lookup(\'pi\', local));  // 3.14 — found in global via chain',
    },

    // ── Function calls create frames ──────────────────────────────────────────────
    {
      type: 'narration',
      id: 'call-creates-frame-vocab',
      text: 'Every function call creates a new frame. The frame contains the formal parameters bound to the argument values. The frame\'s enclosing environment is the environment where the function was defined — not where it was called. This is lexical scoping: the chain of frames follows the textual structure of the code, not the dynamic call history.',
      code: null,
    },
    {
      type: 'narration',
      id: 'call-creates-frame-code',
      text: 'Here is the extend operation: it creates a new frame with parameter bindings and links it to the base environment. Every function call does this.',
      code: 'function make_env(frame, enclosing) { return { frame, enclosing }; }\nfunction lookup(name, env) {\n  if (env === null) throw new Error(`Unbound: ${name}`);\n  return env.frame.has(name) ? env.frame.get(name) : lookup(name, env.enclosing);\n}\n\nfunction extend_env(params, args, base) {\n  const frame = new Map();\n  params.forEach((p, i) => frame.set(p, args[i]));\n  return make_env(frame, base); // new frame, enclosing = base\n}\n\nconst global = make_env(new Map([[\'y\', 10]]), null);\n\n// Simulating a call to function(x) { x + y } with x=3\nconst call_env = extend_env([\'x\'], [3], global);\n\nconsole.log(lookup(\'x\', call_env)); // 3  — in call frame\nconsole.log(lookup(\'y\', call_env)); // 10 — found in global via chain',
    },
    {
      type: 'codelens',
      id: 'codelens-frame-chain',
      text: 'Open CodeLens on extend_env. Watch how the new frame is created with x=3, and its enclosing pointer set to the global environment. When lookup searches for "y", it fails in the call frame (no y there) and follows the enclosing pointer to global. The chain is the scope hierarchy.',
      code: 'function make_env(frame, enc) { return { frame, enclosing: enc }; }\nfunction lookup(name, env) {\n  if (env === null) throw new Error(`Unbound: ${name}`);\n  return env.frame.has(name) ? env.frame.get(name) : lookup(name, env.enclosing);\n}\nfunction extend_env(params, args, base) {\n  const frame = new Map();\n  params.forEach((p,i) => frame.set(p, args[i]));\n  return make_env(frame, base);\n}\n\nconst global = make_env(new Map([[\'y\', 10]]), null);\nconst call_env = extend_env([\'x\'], [3], global);\nconsole.log(lookup(\'x\', call_env));\nconsole.log(lookup(\'y\', call_env));',
    },
    {
      type: 'checkpoint',
      id: 'cp-frames',
    },

    // ── Closures ──────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'closure-vocab',
      text: 'Now we can state precisely what a closure is. In the environment model, a closure is a pair: the function\'s code (its parameter list and body) plus the environment that existed when the function was defined. This captured environment is the closure\'s home — when the closure is later called, the new call frame\'s enclosing environment is this captured environment, not the environment where the call happens.',
      code: null,
    },
    {
      type: 'narration',
      id: 'closure-creation',
      text: 'When we write const add5 = n => n + 5 at the top level, the interpreter creates a closure object pairing the code (n => n + 5) with the current global environment. When we write make_adder(5), the interpreter calls make_adder, which creates a call frame with n=5 bound to global, and returns a closure: { code: x => n + x, env: E1 } where E1 is the frame with n=5.',
      code: '// Closure creation: a closure is { code, defining_env }\nfunction make_env(frame, enc) { return { frame, enclosing: enc }; }\nfunction lookup(n, env) {\n  if (!env) throw new Error(`Unbound: ${n}`);\n  return env.frame.has(n) ? env.frame.get(n) : lookup(n, env.enclosing);\n}\nfunction extend_env(params, args, base) {\n  const frame = new Map(); params.forEach((p,i)=>frame.set(p,args[i]));\n  return make_env(frame, base);\n}\n\nconst global = make_env(new Map(), null);\n\n// make_adder(5) creates a closure capturing E1 where n=5\nconst E1 = extend_env([\'n\'], [5], global); // call frame for make_adder(5)\n\n// The returned closure captures E1\nconst closure_add5 = { params: [\'x\'], body_desc: \'n + x\', env: E1 };\n\n// When called: extend E1 with x=3\nconst E2 = extend_env([\'x\'], [3], closure_add5.env);\nconsole.log(lookup(\'n\', E2)); // 5 — found in E1 via chain\nconsole.log(lookup(\'x\', E2)); // 3 — found in E2',
    },
    {
      type: 'narration',
      id: 'two-closures-two-frames',
      text: 'Each call to make_adder creates a new, independent frame. add5 and add10 are different closures pointing to different frames. Mutating one cannot affect the other. This is the environment model explanation of why closures are independent.',
      code: 'const make_adder = n => x => n + x;\n\nconst add5  = make_adder(5);  // closure captures frame where n=5\nconst add10 = make_adder(10); // separate closure, separate frame where n=10\n\nconsole.log(add5(3));    // 8  — looks up n=5 in its frame\nconsole.log(add10(3));   // 13 — looks up n=10 in its own frame\n\n// The two closures are independent — different frames, different n',
    },
    {
      type: 'codelens',
      id: 'codelens-closure',
      text: 'Open CodeLens on make_adder(5) and then add5(3). When make_adder(5) is called, a frame E1 is created with n=5. The arrow function x => n + x is the closure — it captures E1. When add5(3) is called, a new frame E2 is created with x=3, and E2\'s enclosing is E1. Step through it and watch how n is found by following the enclosing pointer from E2 to E1.',
      code: 'const make_adder = n => x => n + x;\nconst add5 = make_adder(5);\nconsole.log(add5(3));',
    },
    {
      type: 'checkpoint',
      id: 'cp-closures',
    },

    // ── Mutation in frames ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'mutation-in-frames-vocab',
      text: 'Assignment — balance = balance - amount — does not create a new frame or a new binding. It finds the binding in the frame chain and changes its value in place. The set operation walks the same chain as lookup, but instead of returning the value, it replaces it. Since all closures that close over the same frame share the same frame object, mutation is visible to all of them. That shared mutability is the essence of local state.',
      code: null,
    },
    {
      type: 'narration',
      id: 'set-env-code',
      text: 'Here is set_env — the assignment operation in the environment model. It walks the chain until it finds the binding, then mutates it.',
      code: 'function make_env(frame, enc) { return { frame, enclosing: enc }; }\nfunction extend_env(params, args, base) {\n  const f = new Map(); params.forEach((p,i)=>f.set(p,args[i]));\n  return make_env(f, base);\n}\n\nfunction set_env(name, val, env) {\n  if (env === null) throw new Error(`Cannot set unbound: ${name}`);\n  if (env.frame.has(name)) {\n    env.frame.set(name, val); // mutate in place\n    return;\n  }\n  set_env(name, val, env.enclosing); // search up the chain\n}\nfunction lookup(name, env) {\n  if (!env) throw new Error(`Unbound: ${name}`);\n  return env.frame.has(name) ? env.frame.get(name) : lookup(name, env.enclosing);\n}\n\nconst E1 = extend_env([\'balance\'], [100], make_env(new Map(), null));\nconsole.log(lookup(\'balance\', E1)); // 100\nset_env(\'balance\', 70, E1);          // assignment mutates E1\nconsole.log(lookup(\'balance\', E1)); // 70 — changed in place',
    },
    {
      type: 'narration',
      id: 'make-account-env-model',
      text: 'Now the bank account is clear. make_account(100) creates frame E1 with balance=100. The returned dispatch function, withdraw, and deposit are all closures over E1. When withdraw(30) runs, set_env changes balance in E1 from 100 to 70. When deposit(50) runs later, it reads the current value from E1 — 70 — and changes it to 120. The closures share E1. That shared frame is the account\'s state.',
      code: 'function make_account(initial) {\n  let balance = initial;        // E1: balance = initial\n\n  function withdraw(amount) {   // closure over E1\n    if (balance >= amount) {\n      balance = balance - amount; // mutates E1\n      return balance;\n    }\n    return \'Insufficient funds\';\n  }\n  function deposit(amount) {    // also closes over E1\n    balance = balance + amount;  // mutates the same E1\n    return balance;\n  }\n  return { withdraw, deposit, get_balance: () => balance };\n}\n\nconst acc = make_account(100);\nconsole.log(acc.withdraw(30));     // 70  — E1: balance = 70\nconsole.log(acc.deposit(50));      // 120 — E1: balance = 120\nconsole.log(acc.get_balance());    // 120 — same E1',
    },
    {
      type: 'narration',
      id: 'aliasing-warning',
      text: 'If two names refer to the same closure object, mutations through either name affect both. This is aliasing: two names, one frame. It is a common source of bugs. In the environment model, aliasing is not a special case — it is just two references to the same object in the heap. The environment model makes aliasing explicit and predictable.',
      code: 'function make_account(initial) {\n  let balance = initial;\n  return { withdraw: amount => { balance -= amount; return balance; },\n           balance:  () => balance };\n}\n\nconst acc1 = make_account(100);\nconst acc2 = acc1;   // aliasing: acc2 IS acc1 — same object\n\nacc1.withdraw(30);\nconsole.log(acc1.balance()); // 70\nconsole.log(acc2.balance()); // 70 — acc2 sees the same change\n\n// Compare: two independent accounts\nconst acc3 = make_account(100);\nacc1.withdraw(10);\nconsole.log(acc3.balance()); // 100 — unaffected',
    },
    {
      type: 'codelens',
      id: 'codelens-mutation',
      text: 'Open CodeLens on make_account and trace withdraw(30). Watch: when make_account(100) is called, a frame E1 is created with balance=100. The withdraw function closes over E1. When withdraw(30) runs in frame E2, the assignment balance -= amount finds balance in E1 (via enclosing) and changes it there. E2 is gone after the call; E1 persists with the updated balance.',
      code: 'function make_account(initial) {\n  let balance = initial;\n  function withdraw(amount) {\n    balance = balance - amount;\n    return balance;\n  }\n  return withdraw;\n}\n\nconst w = make_account(100);\nconsole.log(w(30));\nconsole.log(w(20));',
    },
    {
      type: 'challenge',
      id: 'challenge-env-trace',
      text: 'Trace this program using the environment model. make_counter() creates a frame with count=0. Each call to the returned function creates a new call frame, runs count++, and returns count. What does c1()+c1()+c2() evaluate to? c1 and c2 are independent closures — each closes over its own frame.',
      expectedOutput: '5',
      startCode: 'function make_counter() {\n  let count = 0;\n  return () => { count++; return count; };\n}\n\nconst c1 = make_counter();\nconst c2 = make_counter();\n\n// c1 has its own frame: count starts at 0\n// c2 has its own frame: count starts at 0\n// What does this print?\nconsole.log(c1() + c1() + c2());\n',
      hint: 'c1() = 1 (count becomes 1). c1() = 2 (count becomes 2). c2() = 1 (its own count becomes 1). 1+2+1 = 4... wait, let\'s check: c1() returns 1, c1() returns 2, c2() returns 1. But + evaluates left to right, so 1+2=3, then 3+c2()... but c2() still returns 1 since it\'s independent. Answer: 1+2+1=4? Re-run and check.',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.trim() === '4'),
    },
    {
      type: 'challenge',
      id: 'challenge-shared-state',
      text: 'Write make_shared_account(initial) that returns TWO withdrawal functions — both closing over the same balance. The key: define balance once, define both functions before returning them, and return them in an object. After w1(30) and w2(20), the shared balance should be 50 — not 70 and 80 independently.',
      expectedOutput: '70\n50',
      startCode: '// make_shared_account: both functions close over the SAME balance\nfunction make_shared_account(initial) {\n  // your code here\n}\n\nconst { w1, w2 } = make_shared_account(100);\nconsole.log(w1(30)); // 70 — balance is now 70\nconsole.log(w2(20)); // 50 — balance is now 50 (shared, not independent)\n',
      hint: 'function make_shared_account(initial) {\n  let balance = initial;\n  return {\n    w1: amount => { balance -= amount; return balance; },\n    w2: amount => { balance -= amount; return balance; },\n  };\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `const {w1,w2}=make_shared_account(100);\n` +
            `return w1(30)===70 && w2(20)===50`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-mutation',
    },
  ],
}
