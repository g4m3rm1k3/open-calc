export const lesson = {
  id: 'sicp-3-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.2  The Environment Model of Evaluation',
  checkpoints: [
    { id: 'cp-frames',      label: 'Frames & Environments' },
    { id: 'cp-application', label: 'Applying Functions' },
    { id: 'cp-closures',    label: 'Closures as Objects' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'We have been using two mental models. First, the substitution model (Section 1.1.5): replace parameters with arguments, evaluate. It works for pure functions but fails with mutation — calling a stateful function twice with the same argument gives different results, and substitution cannot explain why.\n\nSection 3.2 introduces the environment model: the real mechanism JavaScript uses. It correctly explains closures, mutation, and object identity. Everything CodeLens shows in the Scope Chain panel is the environment model made visible.',
      code: null,
    },

    // ── Frames and Environments ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'frame-vocab',
      text: 'Two building blocks:\n\n  Frame — a table of name-to-value bindings. Like a dictionary: {x: 5, y: 10}. Each name appears at most once per frame.\n\n  Environment — a frame PLUS a pointer to an enclosing environment. Environments form a chain. The outermost is the global environment.\n\nLooking up a name: search the current frame first, then the enclosing frame, and so on up to global. First match wins.',
      code: null,
    },
    {
      type: 'narration',
      id: 'frame-diagram',
      text: 'After two const declarations, the global environment has two bindings. Any expression evaluated at top level looks up names in that frame.',
      code: `const x = 10;
const y = 20;

// Global environment:
// ┌─────────────┐
// │  x → 10    │
// │  y → 20    │
// └─────────────┘

console.log(x + y);  // 30`,
    },
    {
      type: 'narration',
      id: 'nested-frames',
      text: 'Nested functions create a chain of environments. The inner frame points to the outer frame.',
      code: `function outer() {
  const a = 1;
  function inner() {
    const b = 2;
    return a + b;  // a found in outer's frame, b in inner's
  }
  return inner();
}

// During inner():
// inner's frame { b:2 } ──enc──> outer's frame { a:1, inner:fn } ──enc──> global
// Looking up a: not in inner's frame → go up → found in outer's frame: 1

console.log(outer());  // 3`,
    },
    { type: 'checkpoint', id: 'cp-frames' },

    // ── Application rule ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'application-rule',
      text: 'The environment model\'s rule for calling a function:\n\n  1. Create a NEW frame.\n  2. Bind each parameter to the corresponding argument in the new frame.\n  3. The new frame\'s enclosing environment = the environment where the FUNCTION WAS DEFINED (its closure environment), NOT the caller\'s environment.\n  4. Evaluate the body in this new environment.\n\nStep 3 is the key: lexical scope. The new frame extends the function\'s definition environment, not the call site.',
      code: null,
    },
    {
      type: 'narration',
      id: 'application-demo',
      text: 'Calling square(5): a new frame {x:5} is created extending GLOBAL (where square was defined). The body x*x uses x from that frame.',
      code: `function square(x) {
  return x * x;
}

// square(5):
// New frame { x:5 } ──enc──> global { square:fn }
// Body: x*x → look up x → found in new frame: 5 → 5*5 = 25

console.log(square(5));  // 25`,
    },
    {
      type: 'narration',
      id: 'lexical-scope-demo',
      text: 'The key test for lexical scope: a function\'s free variables are resolved in the environment where it was DEFINED, not where it is CALLED. Here f is defined in global but called inside g — it still sees x from global (10), not x from g\'s frame (99).',
      code: `const x = 10;

function f(y) {
  return x + y;  // x is free — resolved in f's definition environment (global)
}

function g() {
  const x = 99;  // this x is in g's frame only
  return f(5);   // f is called here, but f's x comes from global, not g
}

console.log(g());  // 15, not 104 — lexical scope, not dynamic scope`,
    },
    { type: 'checkpoint', id: 'cp-application' },

    // ── Closures as objects ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'closure-as-object',
      text: 'In the environment model, a closure is a PAIR: (function code, pointer to its definition environment). When make_counter is called, a frame F1 {count:0} is created. The returned arrow function is a closure: its code plus a pointer to F1. Calling the closure finds count by following that pointer and mutates it IN F1.',
      code: null,
    },
    {
      type: 'narration',
      id: 'closure-demo',
      text: 'Two separate calls to make_counter create TWO separate frames. The closures are independent because they point to different frames.',
      code: `function make_counter() {
  let count = 0;
  return () => { count++; return count; };
}

// c1 ──env──> Frame F1 { count: 0 }
// c2 ──env──> Frame F2 { count: 0 }   (separate frame!)

const c1 = make_counter();
const c2 = make_counter();

console.log(c1());  // 1 — F1: count = 1
console.log(c1());  // 2 — F1: count = 2
console.log(c2());  // 1 — F2: count = 1 — independent`,
    },
    {
      type: 'narration',
      id: 'shared-frame',
      text: 'The bank account: withdraw, deposit, and dispatch are all created in the SAME make_account call — they all point to the SAME frame containing balance. Calling withdraw mutates balance in that shared frame. This is why the account\'s balance persists: the object IS the frame; the methods ARE the closures.',
      code: `function make_account(balance) {
  function withdraw(amount) { balance -= amount; return balance; }
  function deposit(amount)  { balance += amount; return balance; }
  function dispatch(msg)    { return msg==='withdraw'?withdraw:deposit; }
  return dispatch;
}

// All three closures share the SAME frame:
// Frame { balance:100, withdraw:fn, deposit:fn, dispatch:fn }
//
// Calling withdraw(30) mutates balance in that shared frame → 70.
// Calling deposit(50) reads the same frame → 70+50 = 120.

const acc = make_account(100);
console.log(acc('withdraw')(30));  // 70
console.log(acc('deposit')(50));   // 120`,
    },
    {
      type: 'codelens',
      id: 'codelens-environment',
      text: 'Open CodeLens on make_account(100). Expand the Scope Chain panel during a withdraw call. You will see: withdraw\'s own frame, then make_account\'s frame containing balance, then global. When withdraw assigns to balance, watch the value change in make_account\'s frame. That chain is the environment model.',
      code: `function make_account(balance) {
  function withdraw(amount) { balance = balance - amount; return balance; }
  function deposit(amount)  { balance = balance + amount; return balance; }
  function dispatch(msg)    { return msg==='withdraw'?withdraw:deposit; }
  return dispatch;
}
const acc = make_account(100);
console.log(acc('withdraw')(30));
console.log(acc('deposit')(20));`,
    },
    { type: 'checkpoint', id: 'cp-closures' },

    {
      type: 'challenge',
      id: 'challenge-env-model',
      text: 'Write make_adder_factory() that returns a function which, when called with n, returns a function that adds n to its argument. So make_adder_factory()(5)(3) = 8. Draw the environment chain at the innermost call: three frames, each extending the previous.',
      expectedOutput: '8\n15\n3',
      startCode: `// make_adder_factory returns a function (call it make_adder)
// make_adder(n) returns a function that adds n
// make_adder_factory()(5)(3) should be 8

function make_adder_factory() {
  return function(n) {
    return function(x) {
      return n + x;  // n from middle frame, x from inner frame
    };
  };
}

const make_adder = make_adder_factory();
const add5 = make_adder(5);
const add12 = make_adder(12);

console.log(add5(3));    // 8
console.log(add12(3));   // 15
console.log(add5(-2));   // 3
`,
      hint: 'The structure is already correct — just trace the environment chain: inner frame {x:3} → middle frame {n:5} → outer frame {} → global.',
      validate: ({ logs }) => logs.some(l => l.includes('8')) && logs.some(l => l.includes('15')),
    },
  ],
}
