export const lesson = {
  id: 'sicp-3-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.1  Assignment and Local State',
  checkpoints: [
    { id: 'cp-local-state', label: 'Local State' },
    { id: 'cp-bank',        label: 'Objects with State' },
    { id: 'cp-costs',       label: 'Costs of Assignment' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'Chapters 1 and 2 were written in a beautiful, clean world. Call square(5) once and it returns 25. Call it a million times, it always returns 25. The substitution model works perfectly: replace the argument, evaluate the body, done.\n\nChapter 3 breaks that world — on purpose. Why? Because the real systems we want to model have state that changes over time. A bank account must remember its balance. A random number generator must return a different value each call. A circuit simulator must track signal values. None of these fit the pure-function model.\n\nSection 3.1 introduces assignment — mutation of variable bindings — and shows what it enables and what it costs.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // The puzzle that motivates state
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'state-puzzle',
      text: 'Here is a simple question that Chapters 1 and 2 cannot answer:\n\n  Write a function that returns 1 the first time it is called, 2 the second time, 3 the third time, and so on. The function takes no arguments.\n\nThink about this. A pure function with no arguments must return the same value every time — there is nothing to vary. To return a different value each call, the function must remember something between calls. That memory is state.',
      code: null,
    },

    // ── local state and mutation ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'mutation-vocab',
      text: 'New concepts:\n\n  Local state — information a function retains between calls. It belongs to that function and is not visible outside.\n\n  Mutable binding — a variable whose value can be changed after it is created. In JavaScript, let creates a mutable binding; const creates an immutable one.\n\n  Assignment — the operation = that changes the value of a mutable binding. It is a side effect: something that happens beyond returning a value.\n\n  Side effect — any observable action beyond returning a value. Logging, mutation, I/O.',
      code: null,
    },

    // ── Build make_counter ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'counter-closure-shell',
      text: 'Solve the puzzle. make_counter returns a function. Inside make_counter we create a mutable binding with let. This binding persists as long as the closure exists.',
      code: `function make_counter() {
  let count = 0;           // mutable binding — persists in the closure
  // return a function that uses count
}`,
    },
    {
      type: 'narration',
      id: 'counter-increment',
      text: 'The returned function increments count and returns the new value. The = operator changes count in place — this is mutation.',
      code: `function make_counter() {
  let count = 0;
  return function() {
    count = count + 1;   // mutation: change count in the closure
    return count;
  };
}`,
    },
    {
      type: 'narration',
      id: 'counter-test',
      text: 'Call the counter multiple times. Same function, same (no) arguments, different results each time. This is impossible with pure functions. The state lives in the closure.',
      code: `function make_counter() {
  let count = 0;
  return function() {
    count = count + 1;
    return count;
  };
}

const c = make_counter();
console.log(c());  // 1
console.log(c());  // 2
console.log(c());  // 3`,
    },
    {
      type: 'narration',
      id: 'counter-independence',
      text: 'Each call to make_counter creates a fresh, independent closure. c1 and c2 have separate count bindings — incrementing one has no effect on the other.',
      code: `function make_counter() {
  let count = 0;
  return function() { count = count + 1; return count; };
}

const c1 = make_counter();
const c2 = make_counter();

console.log(c1());  // 1
console.log(c1());  // 2
console.log(c2());  // 1 — c2 started its own count from 0
console.log(c1());  // 3 — c1 continues from where it left off`,
    },
    { type: 'checkpoint', id: 'cp-local-state' },

    // ══════════════════════════════════════════════════════════════════════════
    // Objects with state — the bank account
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'bank-account-motivation',
      text: 'The canonical example of stateful objects: a bank account. It has a balance that changes when you deposit or withdraw. Multiple operations share the same state. The implementation: a closure over a mutable balance binding, with multiple functions as the "methods."',
      code: null,
    },
    {
      type: 'narration',
      id: 'bank-account-shell',
      text: 'Build the shell. make_account takes an initial balance and will return a dispatch function.',
      code: `function make_account(balance) {
  // balance is mutable — withdraw and deposit will change it
  // return a dispatch function
}`,
    },
    {
      type: 'narration',
      id: 'bank-account-withdraw',
      text: 'Add the withdraw function as a local helper. It checks the balance, then mutates it if sufficient funds exist.',
      code: `function make_account(balance) {
  function withdraw(amount) {
    if (balance >= amount) {
      balance = balance - amount;   // mutation
      return balance;
    }
    return 'Insufficient funds';
  }
  // deposit and dispatch to be added
}`,
    },
    {
      type: 'narration',
      id: 'bank-account-deposit',
      text: 'Add deposit. It always succeeds — just adds to balance.',
      code: `function make_account(balance) {
  function withdraw(amount) {
    if (balance >= amount) { balance = balance - amount; return balance; }
    return 'Insufficient funds';
  }
  function deposit(amount) {
    balance = balance + amount;
    return balance;
  }
  // dispatch to be added
}`,
    },
    {
      type: 'narration',
      id: 'bank-account-dispatch',
      text: 'Add the dispatch function — message passing. The account receives a string and returns the corresponding operation function.',
      code: `function make_account(balance) {
  function withdraw(amount) {
    if (balance >= amount) { balance = balance - amount; return balance; }
    return 'Insufficient funds';
  }
  function deposit(amount) {
    balance = balance + amount;
    return balance;
  }
  function dispatch(msg) {
    if (msg === 'withdraw') return withdraw;
    if (msg === 'deposit')  return deposit;
    if (msg === 'balance')  return balance;
    throw new Error('Unknown message: ' + msg);
  }
  return dispatch;
}`,
    },
    {
      type: 'narration',
      id: 'bank-account-test',
      text: 'Create an account and use it. acc1("withdraw")(10) calls dispatch with "withdraw", gets back the withdraw function, then calls it with 10.',
      code: `function make_account(balance) {
  function withdraw(amount) {
    if (balance >= amount) { balance = balance - amount; return balance; }
    return 'Insufficient funds';
  }
  function deposit(amount) { balance = balance + amount; return balance; }
  function dispatch(msg) {
    if (msg === 'withdraw') return withdraw;
    if (msg === 'deposit')  return deposit;
    if (msg === 'balance')  return balance;
  }
  return dispatch;
}

const acc1 = make_account(100);

console.log(acc1('balance'));          // 100
console.log(acc1('withdraw')(30));     // 70
console.log(acc1('deposit')(50));      // 120
console.log(acc1('withdraw')(200));    // 'Insufficient funds'
console.log(acc1('balance'));          // 120`,
    },
    {
      type: 'codelens',
      id: 'codelens-bank-account',
      text: 'Open CodeLens on make_account(100). Watch the heap: when make_account returns the dispatch function, that function\'s closure contains a mutable binding for balance. Step through a withdraw call — watch the variable_assign event fire as balance changes in the closure frame. The account IS the closure; the balance IS the mutable binding.',
      code: `function make_account(balance) {
  function withdraw(amount) {
    if (balance >= amount) { balance = balance - amount; return balance; }
    return 'Insufficient funds';
  }
  function deposit(amount) { balance = balance + amount; return balance; }
  function dispatch(msg) {
    if (msg === 'withdraw') return withdraw;
    if (msg === 'deposit')  return deposit;
    if (msg === 'balance')  return balance;
  }
  return dispatch;
}
const acc = make_account(100);
console.log(acc('withdraw')(30));
console.log(acc('balance'));`,
    },
    { type: 'checkpoint', id: 'cp-bank' },

    {
      type: 'challenge',
      id: 'challenge-accumulator',
      text: 'Write make_accumulator(n) that returns a function. Each time you call that function with an amount, it adds the amount to a running total and returns the new total. The initial total is n. acc = make_accumulator(5); acc(10) = 15; acc(10) = 25.',
      expectedOutput: '15\n25\n30',
      startCode: `function make_accumulator(n) {
  let total = n;
  return function(amount) {
    // add amount to total, return new total
  };
}

const acc = make_accumulator(5);
console.log(acc(10));  // 15
console.log(acc(10));  // 25
console.log(acc(5));   // 30
`,
      hint: 'function make_accumulator(n) {\n  let total = n;\n  return function(amount) {\n    total = total + amount;\n    return total;\n  };\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst a=make_accumulator(5);return a(10)===15&&a(10)===25&&a(5)===30`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // The costs of assignment
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'referential-transparency-vocab',
      text: 'Assignment destroys referential transparency — the property that you can always replace an expression with its value without changing the program\'s meaning.\n\nFor pure functions, this holds: if square(5) = 25, you can replace square(5) with 25 anywhere. The program behaves the same. With stateful functions, this breaks: counter() might return 1 the first time and 2 the second time. You CANNOT replace counter() with its first value — the program would behave differently.',
      code: null,
    },
    {
      type: 'narration',
      id: 'referential-demo',
      text: 'See the difference directly. make_decrementer is pure — D1 and D2 behave identically. make_withdraw is stateful — W1 and W2 are different objects: W1(10) returns 15, but W2(10) also returns 15 because W2 starts fresh.',
      code: `// Pure function — D1 and D2 are interchangeable
function make_decrementer(n) {
  return amount => n - amount;
}
const D1 = make_decrementer(25);
const D2 = make_decrementer(25);
console.log(D1(5));  // 20
console.log(D2(5));  // 20 — same — D1 and D2 are interchangeable

// Stateful function — W1 and W2 are distinct objects
function make_withdraw(balance) {
  return amount => {
    balance = balance - amount;
    return balance;
  };
}
const W1 = make_withdraw(25);
const W2 = make_withdraw(25);
console.log(W1(5));  // 20 — W1's balance is now 20
console.log(W1(5));  // 15 — W1's balance is now 15
console.log(W2(5));  // 20 — W2 is independent — it still starts at 25`,
    },
    {
      type: 'narration',
      id: 'costs-insight',
      text: 'With purely functional programs you could ask: "does x equal y?" and mean "are they the same value?" With stateful objects the question splits into two: "do they have the same state right now?" (value equality) and "are they literally the same object, so that changing one changes the other?" (identity equality).\n\nIn the functional world, these two questions have the same answer. In the stateful world they diverge — and reasoning about programs becomes much harder.\n\nThis is not a reason to avoid assignment. State is necessary to model stateful systems. But it should be used consciously, knowing the cost.',
      code: null,
    },
    {
      type: 'narration',
      id: 'shared-state',
      text: 'The most dangerous form of state: two names pointing to the same mutable object. Changing the balance through W1 also changes it through W2 — because they share the SAME closure, not just the same initial value.',
      code: `function make_account(balance) {
  function withdraw(amount) { balance -= amount; return balance; }
  function deposit(amount)  { balance += amount; return balance; }
  function dispatch(msg)    { return msg==='withdraw'?withdraw:deposit; }
  return dispatch;
}

// Two names for the same account — shared identity
const peter_account = make_account(100);
const paul_account  = peter_account;   // NOT a copy — same object

console.log(peter_account('withdraw')(50)); // 50 — Peter withdraws
console.log(paul_account('withdraw')(0));   // check balance — ALSO 50!
// Paul sees the same balance — they share the same state`,
    },
    { type: 'checkpoint', id: 'cp-costs' },

    {
      type: 'challenge',
      id: 'challenge-make-monitored',
      text: 'Write make_monitored(f) that wraps a function and tracks how many times it has been called. The returned function behaves like f for normal arguments, but responds to the special string "how many calls?" with the call count. It should also respond to "reset count" by resetting the counter to 0.',
      expectedOutput: '25\n9\n2\n0',
      startCode: `function make_monitored(f) {
  let call_count = 0;
  return function(x) {
    if (x === 'how many calls?') return call_count;
    if (x === 'reset count') { call_count = 0; return 0; }
    // normal case: increment count, call f(x), return result
  };
}

const mon_sqrt = make_monitored(Math.sqrt);

console.log(mon_sqrt(625));             // 25
console.log(mon_sqrt(81));              // 9
console.log(mon_sqrt('how many calls?')); // 2
console.log(mon_sqrt('reset count'));   // 0
`,
      hint: 'call_count++;\nreturn f(x);',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst m=make_monitored(Math.sqrt);m(625);m(81);return m('how many calls?')===2`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
