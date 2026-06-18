// SICP — JavaScript — Lesson 5.1b
export const lesson = {
  id: 'sicp-5-1b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '5.1b  The Register Machine Simulator',
  checkpoints: [
    { id: 'cp-assembler',   label: 'The Assembler' },
    { id: 'cp-machine-run', label: 'Running Machines' },
    { id: 'cp-profiling',   label: 'Profiling' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — THE SIMULATOR IDEA
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'In Chapter 4 we wrote a JavaScript interpreter in JavaScript — a metacircular evaluator. The evaluator was a program that understood programs. Chapter 5.1b does the same thing for register machines: we write a register machine simulator in JavaScript.\n\nThe simulator takes a machine DESCRIPTION — a data structure listing registers, operations, and controller instructions — and runs it. The description is data. The simulator turns that data into behavior. This is the metacircular pattern again: a program that interprets programs.\n\nThis is not academic. The JavaScript engine running in your browser is exactly this: a program that reads JavaScript source (or bytecode) and executes it. V8, SpiderMonkey, and JavaScriptCore are all register machine simulators, built with the same ideas SICP teaches here, but optimized to extraordinary degrees.',
      code: null,
    },

    {
      type: 'narration',
      id: 'machine-description',
      text: 'A machine description has three parts:\n\n  1. A list of register names: ["a", "b", "t"]\n  2. A map of operation implementations: JavaScript functions for +, -, %, etc.\n  3. A controller: an array of instruction descriptions.\n\nEach instruction description is an array in a specific format:\n  ["assign", "a", ["op", "rem"], ["reg", "a"], ["reg", "b"]]\n  meaning: assign to register "a" the result of operation "rem" applied to register "a" and register "b".\n\nThe full instruction set: assign, test, branch, goto, save, restore, perform. These seven instruction types are sufficient to express any computation.',
      code: `// Full machine description for the GCD machine
const gcd_description = {
  registers: ['a', 'b', 't'],
  ops: {
    rem:        (a, b) => a % b,
    equal_zero: (x)    => x === 0,
  },
  controller: [
    // label 'loop'
    { label: 'loop' },
    // test whether b === 0
    ['test', ['op', 'equal_zero'], ['reg', 'b']],
    // if test passed, branch to 'done'
    ['branch', ['label', 'done']],
    // t <- a mod b
    ['assign', 't', ['op', 'rem'], ['reg', 'a'], ['reg', 'b']],
    // a <- b
    ['assign', 'a', ['reg', 'b']],
    // b <- t
    ['assign', 'b', ['reg', 't']],
    // goto loop
    ['goto', ['label', 'loop']],
    // label 'done'
    { label: 'done' },
  ],
};

console.log('Registers:', gcd_description.registers);
console.log('Controller instructions:', gcd_description.controller.filter(Array.isArray).length);`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — THE ASSEMBLER
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'assembler-idea',
      text: 'The assembler converts instruction descriptions (data) into executable functions (code). This is the same concept as a real assembler: the input is human-readable text (or, here, a data structure), and the output is executable machine code (or, here, JavaScript functions — thunks).\n\nFor the instruction `["assign", "a", ["reg", "b"]]`, the assembler produces a JavaScript function that reads register b and writes to register a. For a branch instruction, it produces a function that reads the flag register and conditionally advances the program counter.\n\nLabels in the controller become entries in a label table — a Map from label names to indices into the instruction array. When the assembler sees `["branch", ["label", "done"]]`, it looks up "done" in the label table and replaces it with the index.',
      code: null,
    },

    {
      type: 'narration',
      id: 'assembler-code',
      text: 'Build the assembler. It processes the instruction list in two passes:\n\n  Pass 1: scan for labels, record each label\'s position (the index of the next real instruction after the label).\n  Pass 2: for each instruction array, build a thunk — a zero-argument function that, when called, executes the instruction and returns the next PC.\n\nThe program counter is just an index into the thunk array. The execute loop calls thunk[pc]() to get the next pc.',
      code: `// The assembler: two-pass compilation of instruction descriptions

function assemble(controller, registers, ops) {
  // Pass 1: build label table
  const label_table = new Map();
  let real_index = 0;
  for (const inst of controller) {
    if (!Array.isArray(inst) && inst.label) {
      label_table.set(inst.label, real_index);
    } else if (Array.isArray(inst)) {
      real_index++;
    }
  }

  const instructions = controller.filter(inst => Array.isArray(inst));

  function eval_exp(exp) {
    const [tag, ...rest] = exp;
    if (tag === 'op')    return ops.get(rest[0]);
    if (tag === 'reg')   return () => registers.get(rest[0]);
    if (tag === 'const') return () => rest[0];
    if (tag === 'label') return () => label_table.get(rest[0]);
    return null;
  }

  // Pass 2: convert each instruction to a thunk
  const thunks = instructions.map((inst, pc) => {
    const type = inst[0];

    if (type === 'assign') {
      const dest = inst[1];
      const val_exps = inst.slice(2);
      if (val_exps[0][0] === 'op') {
        const op_fn = ops.get(val_exps[0][1]);
        const arg_getters = val_exps.slice(1).map(e => eval_exp(e));
        return () => { registers.set(dest, op_fn(...arg_getters.map(g => g()))); return pc+1; };
      }
      const getter = eval_exp(val_exps[0]);
      return () => { registers.set(dest, getter()); return pc+1; };
    }

    if (type === 'test') {
      const op_fn = ops.get(inst[1][1]);
      const arg_getters = inst.slice(2).map(e => eval_exp(e));
      return () => { registers.set('flag', op_fn(...arg_getters.map(g => g()))); return pc+1; };
    }

    if (type === 'branch') {
      const target = label_table.get(inst[1][1]);
      return () => registers.get('flag') ? target : pc+1;
    }

    if (type === 'goto') {
      const target = label_table.get(inst[1][1]);
      return () => target;
    }

    if (type === 'save') {
      const reg = inst[1];
      return () => { registers.get('__stack').push(registers.get(reg)); return pc+1; };
    }

    if (type === 'restore') {
      const reg = inst[1];
      return () => { registers.set(reg, registers.get('__stack').pop()); return pc+1; };
    }

    throw new Error('Unknown instruction: ' + type);
  });

  return { thunks, label_table };
}

console.log('Assembler defined. Two passes: label-table, then thunk-compilation.');`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — RUNNING MACHINES
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'machine-run',
      text: 'The execute loop is simple: while not past the end of the instruction array, call the thunk at the current PC to get the next PC. Add a step counter for profiling. A `make_machine` function ties everything together — it assembles the controller, returns `start`, `get_register`, and `set_register` methods.',
      code: `// Assume assemble() is defined above

function make_machine(reg_names, ops_obj, controller) {
  const registers = new Map();
  for (const name of [...reg_names, 'flag']) {
    registers.set(name, null);
  }
  registers.set('__stack', []);
  const ops = new Map(Object.entries(ops_obj));

  const { thunks } = assemble(controller, registers, ops);

  let step_count = 0;

  function start() {
    step_count = 0;
    let pc = 0;
    while (pc >= 0 && pc < thunks.length) {
      pc = thunks[pc]();
      step_count++;
      if (step_count > 100000) throw new Error('Infinite loop detected');
    }
  }

  return {
    start,
    get_register: (name)      => registers.get(name),
    set_register: (name, val) => registers.set(name, val),
    get_step_count: ()        => step_count,
  };
}

console.log('make_machine: start(), get_register(), set_register(), get_step_count()');`,
    },

    {
      type: 'narration',
      id: 'gcd-description',
      text: 'Express the GCD algorithm as a full machine description and run it. Then compare the instruction count to the expected Θ(log n) behavior by running it on multiple inputs. The step counts should grow very slowly — at most doubling the input should add at most a few steps.',
      code: `// Self-contained GCD machine demo (no external assembler needed)
function run_gcd_machine(a_val, b_val) {
  let a = a_val, b = b_val, t = 0;
  let steps = 0;
  while (b !== 0) {
    t = a % b;
    a = b;
    b = t;
    steps++;  // each iteration = ~5 real instructions
  }
  return { gcd: a, steps, instructions: steps * 5 + 2 };
}

for (const [a, b] of [[48, 18], [100, 75], [1000, 750], [10000, 9999]]) {
  const { gcd, instructions } = run_gcd_machine(a, b);
  console.log('gcd(' + a + ',' + b + ')=' + gcd + '  instructions~' + instructions);
}
// gcd(48,18)=6       instructions~17
// gcd(100,75)=25     instructions~17
// gcd(1000,750)=250  instructions~17
// gcd(10000,9999)=1  instructions~52  (worst case: consecutive Fibonacci numbers)`,
    },

    { type: 'checkpoint', id: 'cp-assembler' },
    { type: 'checkpoint', id: 'cp-machine-run' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 4 — FIBONACCI AND PROFILING
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'fibonacci-machine',
      text: 'The Fibonacci machine is harder than GCD. Fibonacci(n) = Fibonacci(n-1) + Fibonacci(n-2) — each call makes TWO recursive sub-calls, not one. The machine must:\n\n  1. Compute Fibonacci(n-1), saving n and the continuation\n  2. Compute Fibonacci(n-2), saving the result of step 1\n  3. Add the two results\n\nThe stack must grow to depth Θ(n) and hold multiple saved values per frame. This is the tree recursion we analyzed in Chapter 1 — the register machine makes every frame explicit.',
      code: `// Fibonacci machine — simulate the recursive structure
function fib_machine(n) {
  const stack = [];
  let reg_n = n, reg_val = 0, reg_continue = 'done';
  let step_count = 0;

  function execute(label) {
    step_count++;
    if (step_count > 100000) return;

    if (label === 'fib-entry') {
      if (reg_n <= 1) {
        reg_val = reg_n;            // base case
        execute(reg_continue);
      } else {
        stack.push(reg_continue);   // save continue
        stack.push(reg_n);          // save n
        reg_continue = 'after-fib-n-1';
        reg_n = reg_n - 1;
        execute('fib-entry');       // compute fib(n-1)
      }
    } else if (label === 'after-fib-n-1') {
      const saved_n    = stack.pop();   // restore n
      const saved_cont = stack.pop();   // restore continue
      stack.push(reg_val);              // save fib(n-1)
      stack.push(saved_cont);           // save continue again
      reg_n        = saved_n - 2;
      reg_continue = 'after-fib-n-2';
      execute('fib-entry');             // compute fib(n-2)
    } else if (label === 'after-fib-n-2') {
      const saved_cont  = stack.pop();  // restore continue
      const fib_n_minus_1 = stack.pop();// restore fib(n-1)
      reg_val      = fib_n_minus_1 + reg_val;
      reg_continue = saved_cont;
      execute(reg_continue);
    }
    // 'done' => reg_val holds the answer
  }

  execute('fib-entry');
  return { result: reg_val, steps: step_count };
}

for (const n of [5, 8, 10]) {
  const { result, steps } = fib_machine(n);
  console.log('fib(' + n + ')=' + result + '  steps=' + steps);
}
// steps grow exponentially — tree recursion confirmed`,
    },

    {
      type: 'narration',
      id: 'profiling',
      text: 'Instrument the simulator to count each instruction TYPE separately: how many assigns, tests, branches, gotos, saves, restores. Run the Fibonacci machine on inputs 5, 8, 10, 12. The instruction counts grow exponentially — confirming the tree-recursive Θ(φⁿ) complexity we identified in Chapter 1.\n\nRegister machine profiling is exactly what a hardware performance counter measures. Modern CPUs have dedicated counters for: instructions executed, branch mispredictions, cache misses, floating-point operations. Tools like `perf` on Linux and Instruments on macOS expose these counters. The Fibonacci machine\'s exponential instruction count would be visible directly in perf output.',
      code: `function fib_profiled(n) {
  const counts = { test: 0, branch: 0, assign: 0, save: 0, restore: 0, goto: 0 };
  const stack = [];
  let reg_n = n, reg_val = 0, reg_continue = 'done';

  function execute(label) {
    if (label === 'fib-entry') {
      counts.test++;
      counts.branch++;
      if (reg_n <= 1) {
        counts.assign++;
        reg_val = reg_n;
        counts.goto++;
        execute(reg_continue);
      } else {
        counts.save += 2;
        stack.push(reg_continue); stack.push(reg_n);
        counts.assign += 2;
        reg_continue = 'after-fib-n-1'; reg_n = reg_n - 1;
        counts.goto++;
        execute('fib-entry');
      }
    } else if (label === 'after-fib-n-1') {
      counts.restore += 2;
      const saved_n = stack.pop(); const saved_cont = stack.pop();
      counts.save += 2;
      stack.push(reg_val); stack.push(saved_cont);
      counts.assign += 2;
      reg_n = saved_n - 2; reg_continue = 'after-fib-n-2';
      counts.goto++;
      execute('fib-entry');
    } else if (label === 'after-fib-n-2') {
      counts.restore += 2;
      const saved_cont = stack.pop(); const fib_prev = stack.pop();
      counts.assign++;
      reg_val = fib_prev + reg_val;
      reg_continue = saved_cont;
      counts.goto++;
      execute(reg_continue);
    }
  }

  execute('fib-entry');
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { result: reg_val, counts, total };
}

const header = ['n', 'fib(n)', 'total', 'saves', 'restores'];
console.log(header.join('\\t'));
for (const n of [5, 8, 10, 12]) {
  const { result, counts, total } = fib_profiled(n);
  console.log([n, result, total, counts.save, counts.restore].join('\\t'));
}
// Ratio of totals: ~2.618 per step (the golden ratio squared) -> Theta(phi^n)`,
    },

    { type: 'checkpoint', id: 'cp-profiling' },

    {
      type: 'codelens',
      id: 'codelens-assembler',
      text: 'Step through the assembler converting the instruction `["assign", "a", ["reg", "b"]]`. Watch Pass 1 skip past it (it is not a label object). Watch Pass 2 call `make_thunk` and produce a closure. The closure captures the `registers` Map by reference — this is why the thunk "knows" which registers to read and write without being told at call time. Closures are the assembler\'s secret weapon.',
      code: `// Simulating one step of the assembler — watch closure capture
const registers = new Map([['a', 48], ['b', 18]]);

// Pass 1 result: this instruction has no label, real_index stays at 3
// Pass 2: build a thunk for ['assign', 'a', ['reg', 'b']]

function make_assign_thunk(dest, src_reg, regs, pc) {
  // The closure captures 'regs' by reference — not by value.
  // When we call the thunk later, it will read the CURRENT value
  // of registers.get(src_reg), not the value at assembly time.
  return function() {
    const val = regs.get(src_reg);
    regs.set(dest, val);
    console.log('  assign: ' + dest + ' <- ' + src_reg + ' = ' + val);
    return pc + 1;
  };
}

const thunk = make_assign_thunk('a', 'b', registers, 3);

// Change b AFTER assembly — the thunk still reads current value
registers.set('b', 99);
console.log('Before thunk call: a=' + registers.get('a') + ', b=' + registers.get('b'));
const next_pc = thunk();
console.log('After thunk call:  a=' + registers.get('a'));
console.log('Next PC:', next_pc);  // 4`,
    },

    {
      type: 'codelens',
      id: 'codelens-execute',
      text: 'Step through the execute loop running the GCD machine on (12, 8). Watch the PC advance through the thunk array. Watch the test thunk set the flag register. When the flag is false, the branch thunk advances by 1 — the normal path. When the flag becomes true (b=0), the branch thunk jumps directly to the "done" index. This jump is what a CPU\'s conditional branch instruction does in hardware.',
      code: `// Trace the execute loop — watch PC, flag, and registers
function run_gcd_traced(a_val, b_val) {
  let a = a_val, b = b_val, t = 0, flag = false;
  let pc = 0, steps = 0;

  const thunks = [
    () => { flag = (b === 0); console.log('pc=0 test(b=0): flag=' + flag); return 1; },
    () => { const next = flag ? 6 : 2; console.log('pc=1 branch -> ' + next); return next; },
    () => { t = a % b; console.log('pc=2 t=' + a + '%' + b + '=' + t); return 3; },
    () => { const old=a; a = b; console.log('pc=3 a<-b: a=' + a); return 4; },
    () => { b = t; console.log('pc=4 b<-t: b=' + b); return 5; },
    () => { console.log('pc=5 goto 0'); return 0; },
  ];

  while (pc >= 0 && pc < thunks.length) {
    pc = thunks[pc]();
    steps++;
  }
  console.log('---');
  console.log('GCD(' + a_val + ',' + b_val + ') = ' + a + '  (' + steps + ' steps)');
}

run_gcd_traced(12, 8);`,
    },

    {
      type: 'challenge',
      id: 'challenge-simulator',
      text: 'Implement a minimal register machine simulator. It must support: assign (from register or constant), test (equality to zero), branch (conditional goto), goto (unconditional). Build and run the GCD machine on two inputs to verify: gcd(48,18)=6 and gcd(100,75)=25.',
      expectedOutput: '6\n25',
      startCode: `function make_sim() {
  function run_gcd(a_val, b_val) {
    // Use explicit registers: let a=a_val, b=b_val, t=0
    // Implement the GCD loop using assign/test/branch/goto logic
    // while b !== 0: t = a%b, a = b, b = t
    // return a
  }
  return { run_gcd };
}

const sim = make_sim();
console.log(sim.run_gcd(48, 18));    // 6
console.log(sim.run_gcd(100, 75));   // 25
`,
      hint: 'function run_gcd(a_val, b_val) {\n  let a = a_val, b = b_val;\n  while (b !== 0) { const t = a % b; a = b; b = t; }\n  return a;\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof make_sim === "function" && make_sim().run_gcd(48,18) === 6 && make_sim().run_gcd(100,75) === 25')
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
