// SICP — JavaScript — Lesson 5.1
export const lesson = {
  id: 'sicp-5-1',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '5.1  Register Machines',
  checkpoints: [
    { id: 'cp-registers',         label: 'Registers & Controllers' },
    { id: 'cp-gcd-machine',       label: 'GCD Machine' },
    { id: 'cp-factorial-machine', label: 'Factorial Machine' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — WHAT IS A REGISTER MACHINE?
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'When you write `let x = 0; x = x + 1` in JavaScript, the computer does not execute "increment x." It executes a sequence of primitive operations on registers: load the value of x from memory into register R1, load the constant 1 into register R2, add R1 and R2 using the arithmetic logic unit, store the result back to memory. A register machine is the abstract model of this physical reality.\n\nChapter 5 of SICP descends to the hardware level. Understanding register machines means understanding what a CPU actually is — not metaphorically, but precisely. It also reveals something profound: the cost of recursion, where tail calls are free, and why iterative processes use constant space. Every one of these facts becomes visible in the register machine model.',
      code: null,
    },

    {
      type: 'narration',
      id: 'what-is-register',
      text: 'A register is a named storage location that holds exactly one value at a time. A register machine has:\n\n  • A fixed set of registers (named slots: a, b, t, …)\n  • A fixed set of primitive operations (+, -, %, test-equal-zero, …)\n  • A controller: an ordered sequence of labeled instructions\n\nThe controller IS the program. Each instruction does one of a small number of things: read from a register and apply an operation, writing the result to another register; test a register value and branch (jump) to a different label; or unconditionally jump to a label.\n\nThis is ALL a CPU does. Millions — now billions — of times per second. Modern CPUs have many registers (x86-64 has 16 general-purpose ones) and many more operations, but the model is identical to what SICP builds here.',
      code: `// A conceptual sketch of the GCD machine state
const gcd_machine = {
  registers: { a: 48, b: 18 },
  // controller (instruction sequence):
  // loop: test b === 0 → branch to done
  //       t ← a mod b
  //       a ← b
  //       b ← t
  //       goto loop
  // done: register a holds the GCD
  controller: [
    { label: 'loop' },
    { op: 'test',   args: ['b', 0],      result: 'flag' },
    { op: 'branch', cond: 'flag',        target: 'done' },
    { op: 'assign', target: 't',         source: ['rem', 'a', 'b'] },
    { op: 'assign', target: 'a',         source: ['reg', 'b'] },
    { op: 'assign', target: 'b',         source: ['reg', 't'] },
    { op: 'goto',   target: 'loop' },
    { label: 'done' },
  ],
};

console.log('registers:', gcd_machine.registers);
console.log('instructions:', gcd_machine.controller.length);`,
    },

    {
      type: 'narration',
      id: 'gcd-machine-trace',
      text: 'Let us trace the GCD machine step by step. The machine has two data registers — `a` and `b` — and a temporary register `t`. The controller:\n\n  (loop)\n    test whether b = 0\n    if yes: goto done\n    t ← a mod b       (save the remainder)\n    a ← b             (shift b into a)\n    b ← t             (shift remainder into b)\n    goto loop\n  (done)\n    the value in a is the GCD\n\nTrace with a=48, b=18:\n\n  Step 1: b≠0 → t=48%18=12, a=18, b=12\n  Step 2: b≠0 → t=18%12=6,  a=12, b=6\n  Step 3: b≠0 → t=12%6=0,   a=6,  b=0\n  Step 4: b=0 → goto done → answer: a=6\n\nFour iterations, five register assignments, four tests. Every operation is explicit. Nothing is hidden. Compare this to calling `gcd(48, 18)` in JavaScript — the register machine is what that call becomes after the compiler and runtime are done with it.',
      code: `// Explicit step-by-step trace of the GCD machine
let a = 48, b = 18, t = 0;
let step = 0;

console.log('Start: a=' + a + ', b=' + b);

while (b !== 0) {
  step++;
  t = a % b;    // t ← a mod b
  a = b;        // a ← b
  b = t;        // b ← t
  console.log('After step ' + step + ': a=' + a + ', b=' + b);
}

console.log('Done after ' + step + ' iterations: GCD = ' + a);
// Start: a=48, b=18
// After step 1: a=18, b=12
// After step 2: a=12, b=6
// After step 3: a=6,  b=0
// Done after 3 iterations: GCD = 6`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — BUILDING THE GCD MACHINE
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'gcd-machine-code',
      text: 'Now implement the GCD machine as a JavaScript object. The machine has registers stored in a Map, operations stored in a Map (mapping operation names to JavaScript functions), and a controller as an array of instruction objects. An `execute` function runs one instruction at a time — it reads the current program counter (PC), fetches the instruction, executes it, and either advances the PC or jumps.\n\nBuild it step by step. First, the register infrastructure:',
      code: `// Step 1: register infrastructure
function make_machine(reg_names, ops) {
  const registers = new Map();
  for (const name of reg_names) {
    registers.set(name, null);
  }
  // operations map: name → JavaScript function
  const operations = new Map(Object.entries(ops));

  return { registers, operations };
}

const m = make_machine(['a', 'b', 't'], {
  rem: (a, b) => a % b,
  equal_zero: (x) => x === 0,
});

m.registers.set('a', 48);
m.registers.set('b', 18);
console.log('a =', m.registers.get('a'));   // 48
console.log('b =', m.registers.get('b'));   // 18`,
    },

    {
      type: 'narration',
      id: 'gcd-machine-run',
      text: 'Now wire up the GCD machine\'s specific controller — the actual instruction sequence. Add an instruction executor and a loop that runs until it reaches the "done" label. Count the instructions executed.',
      code: `function make_gcd_machine() {
  const reg = { a: 0, b: 0, t: 0 };
  const ops = { rem: (a, b) => a % b };

  // controller: array of instruction objects
  const controller = [
    // index 0: test b === 0
    { type: 'test', reg: 'b', val: 0 },
    // index 1: branch to index 6 if test passed
    { type: 'branch', target: 6 },
    // index 2: t ← a mod b
    { type: 'assign', dest: 't', op: 'rem', srcs: ['a', 'b'] },
    // index 3: a ← b
    { type: 'assign', dest: 'a', src: 'b' },
    // index 4: b ← t
    { type: 'assign', dest: 'b', src: 't' },
    // index 5: goto index 0
    { type: 'goto', target: 0 },
    // index 6: done (halt)
    { type: 'halt' },
  ];

  function step(pc, flag) {
    const inst = controller[pc];
    if (inst.type === 'test')   return { pc: pc + 1, flag: reg[inst.reg] === inst.val };
    if (inst.type === 'branch') return { pc: flag ? inst.target : pc + 1, flag };
    if (inst.type === 'assign' && inst.op) {
      reg[inst.dest] = ops[inst.op](...inst.srcs.map(s => reg[s]));
      return { pc: pc + 1, flag };
    }
    if (inst.type === 'assign') { reg[inst.dest] = reg[inst.src]; return { pc: pc + 1, flag }; }
    if (inst.type === 'goto')   return { pc: inst.target, flag };
    return null; // halt
  }

  function run(a, b) {
    reg.a = a; reg.b = b; reg.t = 0;
    let pc = 0, flag = false, count = 0;
    while (true) {
      const result = step(pc, flag);
      if (!result) break;
      pc = result.pc; flag = result.flag; count++;
    }
    return { result: reg.a, instructions: count };
  }

  return { run };
}

const machine = make_gcd_machine();
const r = machine.run(48, 18);
console.log('GCD(48,18) =', r.result);         // 6
console.log('Instructions:', r.instructions);  // 22

const r2 = machine.run(100, 75);
console.log('GCD(100,75) =', r2.result);        // 25`,
    },

    {
      type: 'narration',
      id: 'data-path-vs-controller',
      text: 'There are two complementary ways to describe a register machine.\n\nThe DATA PATH diagram shows which registers connect to which operations — it is a picture of the machine\'s wiring. For the GCD machine: registers a, b, t are boxes; the `rem` operation is a box with two inputs (a, b) and one output (to t); arrows show how data flows. This is the silicon — it describes what the machine CAN compute.\n\nThe CONTROLLER diagram shows the sequence of instructions — it is a picture of the machine\'s behavior over time. The loop, test, branch, assign, goto instructions. This is the microcode — it describes what the machine DOES compute.\n\nEvery real CPU has both: the data path is etched in silicon; the controller is the instruction set. Both views are necessary. SICP insists on making both explicit because they reveal different things about computation.',
      code: null,
    },

    { type: 'checkpoint', id: 'cp-registers' },
    { type: 'checkpoint', id: 'cp-gcd-machine' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — THE FACTORIAL MACHINE (STACK)
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'factorial-recursive',
      text: 'The GCD machine is iterative — no stack needed. The registers a and b simply hold the current state, and the controller loops. Now consider recursive factorial.\n\n  factorial(n) = n * factorial(n-1)\n\nEach call to factorial(n) calls factorial(n-1) — and we need to remember the current value of n so we can multiply it by the result. That means saving state before the recursive call and restoring it after.\n\nIn a register machine, we do this explicitly with a STACK. The `save r` instruction pushes the current contents of register r onto the stack. The `restore r` instruction pops the top of the stack back into register r. The `continue` register holds a label — the address to jump to after the current operation finishes. This is the explicit return address.',
      code: null,
    },

    {
      type: 'narration',
      id: 'factorial-machine-code',
      text: 'The factorial machine has registers: `n` (current argument), `product` (accumulating result), `continue` (return label), plus a stack. Walk through factorial(4) — the stack grows to depth 4, then unwinds entirely:',
      code: `function make_factorial_machine() {
  const reg = { n: 0, product: 0, continue: 'done' };
  const stack = [];

  // Controller (written as labeled blocks for clarity)
  // factorial-entry:
  //   test n = 1 → branch to base-case
  //   save continue
  //   save n
  //   n ← n - 1
  //   continue ← after-recursive-call
  //   goto factorial-entry
  // after-recursive-call:
  //   restore n
  //   restore continue
  //   product ← n * product
  //   goto continue
  // base-case:
  //   product ← 1
  //   goto continue
  // done: (halt)

  function run(n) {
    reg.n = n;
    reg.product = 1;
    reg.continue = 'done';
    const calls = [];

    function execute(label) {
      if (label === 'done') return;
      if (label === 'factorial-entry') {
        if (reg.n === 1) {
          reg.product = 1;
          execute(reg.continue);
        } else {
          stack.push(reg.continue);  // save continue
          stack.push(reg.n);         // save n
          const saved_n = reg.n;
          calls.push('save n=' + reg.n + '  stack depth=' + stack.length);
          reg.n = reg.n - 1;
          reg.continue = 'after-recursive-call';
          execute('factorial-entry');
        }
      } else if (label === 'after-recursive-call') {
        reg.n = stack.pop();           // restore n
        reg.continue = stack.pop();    // restore continue
        calls.push('restore n=' + reg.n + '  stack depth=' + stack.length);
        reg.product = reg.n * reg.product;
        execute(reg.continue);
      }
    }

    execute('factorial-entry');
    calls.forEach(c => console.log(' ', c));
    return reg.product;
  }

  return { run };
}

const m = make_factorial_machine();
const result = m.run(5);
console.log('factorial(5) =', result);  // 120`,
    },

    {
      type: 'narration',
      id: 'complexity-in-machine',
      text: 'Notice the complexity results, now made brutally visible:\n\nThe GCD machine: each iteration reduces b by at least half (on average), because a mod b < b/2 when b is large. This gives Θ(log n) steps — same as Euclid\'s algorithm expressed in JavaScript.\n\nThe factorial machine: it performs exactly n-1 save operations and n-1 restore operations to compute factorial(n). That is Θ(n) steps and Θ(n) stack depth.\n\nThe complexity of an algorithm is a property of the algorithm, NOT the implementation language. Whether you write factorial in JavaScript, Python, C, or register machine instructions, you get the same Θ(n) behavior. Register machines make this brutally visible because you can count every single instruction. There is no hiding behind abstractions.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'codelens-gcd-machine',
      text: 'Step through the GCD machine executing with a=12, b=8. Watch the registers a and b change at each step. Watch the test instruction produce a boolean that determines whether the branch fires. Notice that the state is entirely contained in two registers — there is no stack, no call frames, no hidden state.',
      code: `// GCD machine — step through with a=12, b=8
let a = 12, b = 8, t;

// Step 1: test b===0? No (b=8). t = 12%8 = 4, a = 8, b = 4
console.log('Initial: a=' + a + ', b=' + b);

while (b !== 0) {
  t = a % b;
  a = b;
  b = t;
  console.log('a=' + a + ', b=' + b + (b === 0 ? ' → HALT' : ''));
}

console.log('GCD =', a);  // 4`,
    },

    {
      type: 'codelens',
      id: 'codelens-stack',
      text: 'Step through the factorial machine for n=4. Watch save push frames onto the stack as n counts down from 4 to 1. Then watch restore pop them as the result multiplies back up. The maximum stack depth equals n-1 — this is what makes recursive factorial Θ(n) in space.',
      code: `// Factorial machine — watch the stack grow and shrink
const stack = [];

function factorial_trace(n, cont) {
  console.log('factorial(' + n + ')  stack depth=' + stack.length);
  if (n === 1) {
    console.log('base case: product=1');
    return 1;
  }
  // save continue and n
  stack.push(cont);
  stack.push(n);
  console.log('  save n=' + n + ' → stack: [' + stack.join(',') + ']');

  const sub = factorial_trace(n - 1, 'after-call');

  // restore
  const saved_n = stack.pop();
  const saved_cont = stack.pop();
  console.log('  restore n=' + saved_n + ' → stack depth=' + stack.length);
  const result = saved_n * sub;
  console.log('  product = ' + saved_n + ' * ' + sub + ' = ' + result);
  return result;
}

const answer = factorial_trace(4, 'done');
console.log('factorial(4) =', answer);  // 24`,
    },

    {
      type: 'challenge',
      id: 'challenge-gcd-machine',
      text: 'Implement a minimal register machine `make_machine(regs, ops)` with a `run_gcd(a, b)` method. The machine should use two registers (`a` and `b`) and implement the GCD algorithm iteratively (no stack). Run it on (48, 18) to get 6 and on (100, 75) to get 25.',
      expectedOutput: '6\n25',
      startCode: `function make_machine(reg_names, ops) {
  const registers = {};
  for (const name of reg_names) registers[name] = 0;
  // ops is an object: { rem: (a,b) => a%b }

  function run_gcd(a, b) {
    registers.a = a;
    registers.b = b;
    // implement: while b !== 0: t = a%b, a = b, b = t
    // return registers.a
  }

  return { registers, run_gcd };
}

const m = make_machine(['a', 'b', 't'], { rem: (a, b) => a % b });
console.log(m.run_gcd(48, 18));   // 6
console.log(m.run_gcd(100, 75));  // 25
`,
      hint: 'function run_gcd(a, b) {\n  registers.a = a; registers.b = b;\n  while (registers.b !== 0) {\n    const t = registers.a % registers.b;\n    registers.a = registers.b;\n    registers.b = t;\n  }\n  return registers.a;\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof make_machine === "function" && make_machine(["a","b","t"],{rem:(a,b)=>a%b}).run_gcd(48,18) === 6 && make_machine(["a","b","t"],{rem:(a,b)=>a%b}).run_gcd(100,75) === 25')
          return fn() === true
        } catch { return false }
      },
    },

    { type: 'checkpoint', id: 'cp-factorial-machine' },

    {
      type: 'challenge',
      id: 'challenge-factorial-machine',
      text: 'Extend the machine concept with a stack. Implement `make_factorial_machine()` that returns an object with a `run(n)` method. The machine must use explicit save/restore operations on a stack array to handle the recursive structure. run(5) should return 120.',
      expectedOutput: '120\n6\n1',
      startCode: `function make_factorial_machine() {
  const stack = [];
  // registers: n, product, continue
  // implement recursive factorial using a stack
  // save and restore should push/pop from the stack array

  function run(n) {
    // your implementation
    // return the factorial of n
  }

  return { run };
}

const m = make_factorial_machine();
console.log(m.run(5));  // 120
console.log(m.run(3));  // 6
console.log(m.run(1));  // 1
`,
      hint: 'function run(n) {\n  const stack = [];\n  function fact(n) {\n    if (n === 1) return 1;\n    stack.push(n);\n    const sub = fact(n - 1);\n    const saved = stack.pop();\n    return saved * sub;\n  }\n  return fact(n);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof make_factorial_machine === "function" && make_factorial_machine().run(5) === 120 && make_factorial_machine().run(3) === 6')
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
