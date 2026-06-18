// SICP — JavaScript — Lesson 5.4b
export const lesson = {
  id: 'sicp-5-4b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '5.4b  Compilation and the Full Picture',
  checkpoints: [
    { id: 'cp-compiler',    label: 'The Compiler' },
    { id: 'cp-open-coding', label: 'Open Coding' },
    { id: 'cp-full-chain',  label: 'The Full Chain' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — INTERPRETATION VS COMPILATION
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'The explicit-control evaluator is correct but slow. Consider what happens when it evaluates `factorial(n)` for a large n — on every single call it:\n  1. Reads `factorial` from the environment (a Map lookup)\n  2. Checks whether the procedure is primitive or compound\n  3. Reads `n` from the environment\n  4. Tests whether `n === 0`\n  5. Dispatches on the expression type of the body\n  6. ... and repeats for every recursive call\n\nAll of those checks are IDENTICAL on every call. `factorial` is always a compound procedure. `n` is always a local variable. The `if` is always an if-expression. A compiler can do these checks ONCE — at compile time — and generate instructions that skip them entirely at runtime.\n\nThis is the fundamental tradeoff: interpretation is flexible but slow; compilation is rigid but fast. A compiler sacrifices the ability to redefine `factorial` at runtime in exchange for removing the dispatch overhead at every call. That tradeoff is what makes compiled languages like C and Rust faster than interpreted ones.',
      code: null,
    },

    {
      type: 'narration',
      id: 'compiler-structure',
      text: 'The compiler has a clean recursive structure. `compile(exp, target, linkage)` takes:\n\n  exp      — the expression to compile (an AST node)\n  target   — which register should hold the result (usually "val")\n  linkage  — what to do after: "return" (goto continue), "next" (fall through), or a label name\n\nIt returns an instruction SEQUENCE — an array of register machine instructions. Composing these sequences builds the full program.\n\nThe linkage parameter is the compiler\'s way of handling tail calls. When linkage is "return", the compiled code ends with `goto continue` — the callee\'s result is the caller\'s result, no extra frame needed. When linkage is "next", the code just falls through to the next instruction in the sequence.',
      code: `// The compiler structure
function compile(exp, target, linkage) {
  if (exp.type === 'lit')    return compile_literal(exp, target, linkage);
  if (exp.type === 'var')    return compile_variable(exp, target, linkage);
  if (exp.type === 'if')     return compile_if(exp, target, linkage);
  if (exp.type === 'lambda') return compile_lambda(exp, target, linkage);
  if (exp.type === 'app')    return compile_combination(exp, target, linkage);
  throw new Error('Unknown expression: ' + exp.type);
}

// Linkage: what to do after this instruction sequence
function end_with_linkage(linkage, instructions) {
  if (linkage === 'next')   return instructions;
  if (linkage === 'return') return [...instructions, ['goto', ['reg', 'continue']]];
  return [...instructions, ['goto', ['label', linkage]]];
}

console.log('compile(exp, target, linkage) dispatches on exp.type');
console.log('linkage "return" appends: goto continue');
console.log('linkage "next"   appends: nothing (fall through)');
console.log('linkage <label>  appends: goto <label>');`,
    },

    {
      type: 'narration',
      id: 'compiling-literals',
      text: 'Compile the base cases. These are trivial — one instruction each. The key point is that the DISPATCH happens at compile time, not runtime. In the interpreter, `eval-dispatch` checks `exp.type === "lit"` on every evaluation. The compiled code for a literal never needs to check — it IS an assign instruction.',
      code: `// Compiling literals and variables

function compile_literal(exp, target, linkage) {
  // One instruction: assign target = (const exp.val)
  const instructions = [['assign', target, ['const', exp.val]]];
  console.log('compile_literal(' + exp.val + ', "' + target + '") -> ' + JSON.stringify(instructions));
  return end_with_linkage(linkage, instructions);
}

function compile_variable(exp, target, linkage) {
  // One instruction: assign target = lookup(env, exp.name)
  const instructions = [['assign', target, ['op', 'lookup'], ['reg', 'env'], ['const', exp.name]]];
  console.log('compile_variable("' + exp.name + '", "' + target + '") -> ' + JSON.stringify(instructions));
  return end_with_linkage(linkage, instructions);
}

function end_with_linkage(linkage, insts) {
  if (linkage === 'next') return insts;
  return [...insts, ['goto', linkage === 'return' ? ['reg','continue'] : ['label',linkage]]];
}

const lit_code = compile_literal({ type:'lit', val:42 }, 'val', 'next');
console.log('literal 42:', JSON.stringify(lit_code));

const var_code = compile_variable({ type:'var', name:'x' }, 'val', 'return');
console.log('variable x:', JSON.stringify(var_code));
// Note: variable x ends with goto continue (because linkage='return')`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — COMPILING COMBINATIONS
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'compiling-combinations',
      text: 'Compiling a function call `f(x, y)` is where the interesting optimization happens. The compiler must:\n\n  1. Compile the operator into `proc` register\n  2. Compile each argument, adjoining to `argl`\n  3. Emit the apply instruction\n\nThe key optimization is the PRESERVING analysis. When compiling each piece, the compiler statically determines which registers the piece might modify. A literal argument cannot modify `env`. So if both arguments are literals, the compiler emits NO save/restore around them. A variable lookup cannot modify `env` either — it only reads from it. Only a sub-application can modify `env` (by creating new frames). The compiler saves `env` only around sub-expressions that might modify it.\n\nIn the interpreter, we ALWAYS save `env` around every argument evaluation, even if the argument is a literal. The compiler eliminates those unnecessary saves.',
      code: `// compile_combination with preserving analysis
function compile_combination(exp, target, linkage) {
  // Which registers does compiling the operator need to preserve?
  // If args are all literals, we never need to save env.
  const all_args_simple = exp.args.every(a => a.type === 'lit' || a.type === 'var');
  console.log('  all args simple (no nested calls):', all_args_simple);

  // Compile operator into proc register
  const op_code = compile(exp.fn, 'proc', 'next');

  // Compile each argument into val, then adjoin to argl
  let argl_code = [['assign', 'argl', ['const', []]]];
  for (let i = exp.args.length - 1; i >= 0; i--) {
    const arg_code = compile(exp.args[i], 'val', 'next');
    argl_code = [...argl_code, ...arg_code,
                 ['assign', 'argl', ['op', 'adjoin'], ['reg', 'val'], ['reg', 'argl']]];
  }

  // Emit apply
  const apply_code = end_with_linkage(linkage, [['goto', ['label', 'apply-dispatch']]]);

  // Preserving: only save continue if linkage is 'return' AND op_code uses env
  // (simplified: save continue unless linkage is 'next' with no further calls)
  const needs_save_continue = linkage === 'return' || linkage !== 'next';
  const wrap = needs_save_continue
    ? [['save', 'continue'], ...op_code, ...argl_code, ...apply_code, ['restore', 'continue']]
    : [...op_code, ...argl_code, ...apply_code];

  console.log('  instructions emitted:', wrap.length);
  return wrap;
}

function compile(exp, target, linkage) {
  if (exp.type === 'lit') return end_with_linkage(linkage, [['assign', target, ['const', exp.val]]]);
  if (exp.type === 'var') return end_with_linkage(linkage, [['assign', target, ['op','lookup'],['reg','env'],['const',exp.name]]]);
  if (exp.type === 'app') return compile_combination(exp, target, linkage);
  throw new Error('bad exp');
}
function end_with_linkage(l, insts) {
  if (l === 'next') return insts;
  return [...insts, ['goto', l==='return' ? ['reg','continue'] : ['label',l]]];
}

const add_code = compile({ type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:2},{type:'lit',val:3}] }, 'val', 'next');
console.log('\\n(+ 2 3) compiled to', add_code.length, 'instructions');`,
    },

    { type: 'checkpoint', id: 'cp-compiler' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — OPEN CODING
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'open-coding',
      text: 'Open coding is an optimization specifically for KNOWN primitives: +, -, *, /, <, =, and similar operations. When the compiler sees `(+ 2 3)`, it knows at compile time that `+` is the addition operation. It does not need to:\n  1. Look up "+" in the environment\n  2. Check whether the result is a primitive procedure\n  3. Build an argl list\n  4. Call through apply-dispatch\n\nInstead, it emits DIRECT arithmetic instructions:\n  compile 2 into r1\n  compile 3 into r2\n  add r1 r2 into val\n\nThree instructions instead of fifteen or more. Open coding is why `a + b` in compiled code is a single CPU instruction, while the same expression evaluated through a general apply-dispatch mechanism requires dozens. This is the fundamental reason compiled arithmetic is so much faster than interpreted arithmetic.',
      code: `// Open coding: direct instructions for known primitives

const OPEN_CODED_PRIMITIVES = new Set(['+', '-', '*', '/', '<', '=', '<=', '>=']);

function compile_open_coded(exp, target, linkage) {
  // exp.fn.name is a known primitive
  const op_name = exp.fn.name;
  console.log('  open-coding: ' + op_name + ' with ' + exp.args.length + ' args');

  // Compile each argument directly — no argl list, no proc register
  const arg_regs = ['arg1', 'arg2'];
  let insts = [];
  for (let i = 0; i < exp.args.length; i++) {
    // Compile arg into a temporary register
    insts = [...insts, ...compile(exp.args[i], arg_regs[i], 'next')];
  }
  // Direct operation: no environment lookup, no procedure check, no apply dispatch
  insts.push(['assign', target, ['op', op_name], ['reg', arg_regs[0]], ['reg', arg_regs[1]]]);
  console.log('  open-coded instructions:', insts.length, '(vs ~15 for general path)');
  return end_with_linkage(linkage, insts);
}

// Modified compile: check for open-coded primitives FIRST
function compile_with_open_coding(exp, target, linkage) {
  if (exp.type === 'lit') return end_with_linkage(linkage, [['assign', target, ['const', exp.val]]]);
  if (exp.type === 'var') return end_with_linkage(linkage, [['assign', target, ['op','lookup'],['reg','env'],['const',exp.name]]]);
  if (exp.type === 'app' && exp.fn.type === 'var' && OPEN_CODED_PRIMITIVES.has(exp.fn.name)) {
    return compile_open_coded(exp, target, linkage);
  }
  if (exp.type === 'app') return ['GENERAL_COMBINATION_PATH'];
  throw new Error('bad exp');
}
function end_with_linkage(l, insts) {
  if (l === 'next') return insts;
  return [...insts, ['goto', l==='return' ? ['reg','continue'] : ['label',l]]];
}
function compile(exp, target, linkage) { return compile_with_open_coding(exp, target, linkage); }

console.log('--- General path for (+ x 3) ---');
// Simulating what the general path would emit (many more instructions)

console.log('\\n--- Open-coded path for (+ 2 3) ---');
const oc = compile_with_open_coding(
  { type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:2},{type:'lit',val:3}] },
  'val', 'next'
);
console.log('Instructions:', oc.length);  // 3: assign arg1, assign arg2, add -> val`,
    },

    {
      type: 'narration',
      id: 'tail-calls-in-compiler',
      text: 'Tail call optimization in the compiler is elegant. The linkage parameter carries the information:\n\n  When a call is in tail position — the last thing a function body does — its linkage is "return". The compiler detects this and does NOT emit `save continue` before the call. The caller\'s `continue` is already correct — the callee\'s result IS the caller\'s result.\n\nCompare the two versions of factorial:\n\n  factorial(n) = if n===0 then 1 else n * factorial(n-1)\n\nThe multiplication `n * factorial(n-1)` means `factorial(n-1)` is NOT in tail position — we need n to multiply by the result. The compiler emits `save n` and `save continue` before the recursive call. Stack depth: Θ(n).\n\n  factorial_iter(n, acc) = if n===0 then acc else factorial_iter(n-1, n*acc)\n\nThe call `factorial_iter(n-1, n*acc)` IS in tail position — it is the entire else branch. Linkage is "return". The compiler emits NO save/restore. Stack depth: Θ(1). This is true tail call elimination.',
      code: `// Tail call elimination: show what the compiler emits for each case

function show_factorial_compilation() {
  // NON-TAIL: n * factorial(n-1)
  // The * is applied AFTER the recursive call — not tail position
  // Compiler emits:
  console.log('--- Non-tail factorial (compiled instructions) ---');
  const non_tail_insts = [
    // test n===0
    ['assign', 'flag', ['op', '='], ['reg', 'n'], ['const', 0]],
    ['branch', ['label', 'base-case']],
    // NOT tail position: must save before recursive call
    ['save', 'continue'],    // <-- saves a frame
    ['save', 'n'],           // <-- saves n for the multiply
    ['assign', 'n', ['op', '-'], ['reg', 'n'], ['const', 1]],
    ['assign', 'continue', ['label', 'after-recursive-call']],
    ['goto', ['label', 'factorial-entry']],
    // after-recursive-call:
    ['restore', 'n'],        // pop n
    ['restore', 'continue'], // pop continue
    ['assign', 'val', ['op', '*'], ['reg', 'n'], ['reg', 'val']],
    ['goto', ['reg', 'continue']],
    // base case
    ['assign', 'val', ['const', 1]],
    ['goto', ['reg', 'continue']],
  ];
  const saves    = non_tail_insts.filter(i => i[0] === 'save').length;
  const restores = non_tail_insts.filter(i => i[0] === 'restore').length;
  console.log('Instructions:', non_tail_insts.length);
  console.log('save/restore pairs per call:', saves, '/', restores, ' -> stack grows Theta(n)');

  // TAIL: factorial_iter(n-1, n*acc) — last thing in else branch
  // Compiler emits:
  console.log('\\n--- Tail-recursive factorial_iter (compiled instructions) ---');
  const tail_insts = [
    // test n===0
    ['assign', 'flag', ['op', '='], ['reg', 'n'], ['const', 0]],
    ['branch', ['label', 'base-case']],
    // TAIL position: no save/restore needed
    ['assign', 'acc', ['op', '*'], ['reg', 'n'], ['reg', 'acc']],
    ['assign', 'n',   ['op', '-'], ['reg', 'n'], ['const', 1]],
    ['goto', ['label', 'factorial-iter-entry']], // reuse current frame
    // base case
    ['assign', 'val', ['reg', 'acc']],
    ['goto', ['reg', 'continue']],
  ];
  const saves2    = tail_insts.filter(i => i[0] === 'save').length;
  const restores2 = tail_insts.filter(i => i[0] === 'restore').length;
  console.log('Instructions:', tail_insts.length);
  console.log('save/restore pairs per call:', saves2, '/', restores2, ' -> stack depth = 1 always');
}

show_factorial_compilation();`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 4 — THE FULL CHAIN
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'full-chain',
      text: 'The complete chain from source text to result:\n\n  (1) SOURCE TEXT: `"factorial(5)"`\n\n  (2) PARSER → AST: a function-call node `{type:"app", fn:{type:"var",name:"factorial"}, args:[{type:"lit",val:5}]}`\n\n  (3a) INTERPRETER PATH (Chapter 4): the metacircular evaluator walks the AST using the environment model (Chapter 3.2), calling evaluate/apply repeatedly. Uses JavaScript\'s own stack for bookkeeping.\n\n  (3b) COMPILER PATH (Chapter 5.4b): the compiler walks the AST once and emits register machine instructions. Decides at compile time which registers to save, whether to open-code primitives, whether tail calls need stack frames.\n\n  (4) REGISTER MACHINE (Chapter 5.1): runs the instruction sequences. Every instruction is a thunk produced by the assembler.\n\n  (5) MEMORY MODEL (Chapter 5.3): allocates pairs as entries in two parallel arrays. The free pointer advances with each cons call.\n\n  (6) GARBAGE COLLECTOR (Chapter 5.3): when memory fills up, Cheney\'s stop-and-copy algorithm compacts live pairs into the free half. Unreachable pairs are silently abandoned.\n\n  Result: 120.',
      code: null,
    },

    { type: 'checkpoint', id: 'cp-full-chain' },

    {
      type: 'narration',
      id: 'what-you-have-built',
      text: 'Pause and look back at the full arc of SICP.\n\nYou have built, from scratch:\n\n  1. A LANGUAGE — expressions, environments, closures (Chapters 1–3)\n  2. An INTERPRETER — evaluate/apply, the metacircular evaluator (Chapter 4)\n  3. A COMPILER — compile(exp, target, linkage), open coding (Chapter 5.4b)\n  4. A VIRTUAL MACHINE — the register machine simulator (Chapter 5.1)\n  5. A MEMORY SYSTEM — pairs as parallel arrays, tagged values (Chapter 5.3)\n  6. A GARBAGE COLLECTOR — stop-and-copy, Cheney\'s algorithm (Chapter 5.3)\n\nReal language implementations — V8 (JavaScript), the JVM (Java, Kotlin, Scala), CPython (Python), Erlang/BEAM — do exactly these six things. The scale and the speed differ wildly. The structure is identical.\n\nV8 has a parser, multiple tiers of JIT compilation, a register allocator, a generational garbage collector with incremental marking, and years of micro-optimization. But at its core: an environment model, an evaluator, a compiler to register machine instructions, and a memory manager with GC. Every one of those components is something you now understand from first principles.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'codelens-compiler',
      text: 'Step through compiling `(+ 2 3)`. Watch the compile function dispatch on `exp.type === "app"`. Watch it detect that `+` is an open-coded primitive. Watch `compile_open_coded` compile each argument (2 and 3) into separate registers with single assign instructions, then emit a direct add instruction. Count: 3 instructions total, no environment lookup, no procedure check, no apply-dispatch.',
      code: `// Compile (+ 2 3) — watch the dispatch and instruction emission
function compile_expr(exp, target) {
  console.log('compile called: exp.type=' + exp.type +
              (exp.type==='app' ? ' op=' + exp.fn.name : ' val=' + exp.val));

  if (exp.type === 'lit') {
    console.log('  -> emit: assign ' + target + ' = const(' + exp.val + ')');
    return [['assign', target, ['const', exp.val]]];
  }

  if (exp.type === 'app' && ['+','-','*','/'].includes(exp.fn.name)) {
    console.log('  -> open-coded primitive: ' + exp.fn.name);
    const r1 = compile_expr(exp.args[0], 'arg1');
    const r2 = compile_expr(exp.args[1], 'arg2');
    console.log('  -> emit: assign ' + target + ' = ' + exp.fn.name + '(arg1, arg2)');
    return [...r1, ...r2, ['assign', target, ['op', exp.fn.name], ['reg','arg1'], ['reg','arg2']]];
  }

  return [];
}

const insts = compile_expr(
  { type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:2},{type:'lit',val:3}] },
  'val'
);
console.log('\\nCompiled to', insts.length, 'instructions:');
insts.forEach((inst, i) => console.log('  [' + i + ']', JSON.stringify(inst)));`,
    },

    {
      type: 'codelens',
      id: 'codelens-open-coding',
      text: 'Compare the open-coded path to the general path for adding 2 + 3. The general path goes through environment lookup, procedure type check, argl construction, and apply-dispatch — many steps. The open-coded path emits 3 instructions and touches no environment or apply machinery at all. This difference scales: in a tight inner loop doing thousands of arithmetic operations, the open-coded version is dramatically faster.',
      code: `// Compare: general path vs open-coded path for (+ 2 3)

// GENERAL PATH — what the interpreter does
function general_add(env) {
  let steps = 0;
  // 1. look up "+" in environment
  const proc = env['+'];  steps++;
  console.log('step ' + steps + ': lookup "+"');
  // 2. check procedure type
  if (typeof proc !== 'function') throw new Error('not a procedure'); steps++;
  console.log('step ' + steps + ': check proc type (is primitive?)');
  // 3. evaluate arg1
  const a1 = 2; steps++;
  console.log('step ' + steps + ': eval arg 2');
  // 4. evaluate arg2
  const a2 = 3; steps++;
  console.log('step ' + steps + ': eval arg 3');
  // 5. build argl list
  const argl = [a1, a2]; steps++;
  console.log('step ' + steps + ': build argl=[2,3]');
  // 6. apply
  const result = proc(...argl); steps++;
  console.log('step ' + steps + ': apply -> ' + result);
  return { result, steps };
}

// OPEN-CODED PATH — what the compiler emits (3 instructions)
function opencoded_add() {
  let steps = 0;
  const arg1 = 2; steps++;   // assign arg1 = const(2)
  console.log('step ' + steps + ': assign arg1=2');
  const arg2 = 3; steps++;   // assign arg2 = const(3)
  console.log('step ' + steps + ': assign arg2=3');
  const val = arg1 + arg2; steps++;  // assign val = +(arg1, arg2)
  console.log('step ' + steps + ': assign val=arg1+arg2=' + val);
  return { result: val, steps };
}

console.log('--- General path ---');
const g = general_add({ '+': (a,b) => a+b });
console.log('Result:', g.result, '  Steps:', g.steps);

console.log('\\n--- Open-coded path ---');
const o = opencoded_add();
console.log('Result:', o.result, '  Steps:', o.steps);

console.log('\\nSpeedup factor:', g.steps / o.steps + 'x');`,
    },

    {
      type: 'challenge',
      id: 'challenge-compiler',
      text: 'Implement a mini-compiler that handles literals, variables, and addition (two-argument only, open-coded). `compile_and_run(exp, env)` should compile the expression to an instruction sequence, then execute it. Test: compiling and running `{op:"+", left:{type:"lit",val:3}, right:{type:"var",name:"x"}}` in env `{x:4}` should return 7.',
      expectedOutput: '7\n15\n0',
      startCode: `// Mini-compiler: literals, variables, open-coded addition

function compile_expr(exp) {
  // Returns an array of "instructions" — each instruction is a function
  // that takes a register object and returns the next register state.
  // Supported: {type:'lit', val:n}, {type:'var', name:s}, {op:'+', left:..., right:...}

  if (exp.type === 'lit') {
    // emit: set val = exp.val
  }
  if (exp.type === 'var') {
    // emit: set val = env[exp.name]
  }
  if (exp.op === '+') {
    // compile left into arg1, right into arg2, then add
  }
  return [];
}

function run_instructions(insts, env) {
  const regs = { val: null, arg1: null, arg2: null, env };
  for (const inst of insts) inst(regs);
  return regs.val;
}

function compile_and_run(exp, env) {
  const insts = compile_expr(exp);
  return run_instructions(insts, env);
}

const env = { x: 4, y: 11 };
console.log(compile_and_run({ op:'+', left:{type:'lit',val:3},  right:{type:'var',name:'x'} }, env)); // 7
console.log(compile_and_run({ op:'+', left:{type:'var',name:'y'}, right:{type:'lit',val:4}  }, env)); // 15
console.log(compile_and_run({ op:'+', left:{type:'lit',val:0},  right:{type:'lit',val:0}  }, env)); // 0
`,
      hint: 'if (exp.type === "lit") return [regs => { regs.val = exp.val; }];\nif (exp.type === "var") return [regs => { regs.val = regs.env[exp.name]; }];\nif (exp.op === "+") {\n  const l = compile_expr(exp.left).map(f => regs => { f(regs); regs.arg1 = regs.val; });\n  const r = compile_expr(exp.right).map(f => regs => { f(regs); regs.arg2 = regs.val; });\n  return [...l, ...r, regs => { regs.val = regs.arg1 + regs.arg2; }];\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nconst env={x:4,y:11}; return compile_and_run({op:"+",left:{type:"lit",val:3},right:{type:"var",name:"x"}},env)===7 && compile_and_run({op:"+",left:{type:"var",name:"y"},right:{type:"lit",val:4}},env)===15')
          return fn() === true
        } catch { return false }
      },
    },

    {
      type: 'challenge',
      id: 'challenge-full-chain',
      text: 'Connect all the pieces. Write a function `run_program(ast, env)` that compiles an AST to instruction functions, runs those instructions, and returns the result. Test it with the expression that computes 2*3 + 4*5 = 26. Use an AST with nested + and * nodes.',
      expectedOutput: '26\n100\n1',
      startCode: `// Full chain: compile AST -> instruction functions -> execute -> result

function compile_node(exp) {
  // Handles: {type:'lit',val:n}, {type:'var',name:s},
  //          {op:'+',left,right}, {op:'*',left,right}
  if (exp.type === 'lit') {
    return [regs => { regs.val = exp.val; }];
  }
  if (exp.type === 'var') {
    return [regs => { regs.val = regs.env[exp.name]; }];
  }
  if (exp.op === '+' || exp.op === '*') {
    const left_insts  = compile_node(exp.left);
    const right_insts = compile_node(exp.right);
    const save_left   = regs => { regs.arg1 = regs.val; };
    const save_right  = regs => { regs.arg2 = regs.val; };
    const apply       = exp.op === '+'
      ? regs => { regs.val = regs.arg1 + regs.arg2; }
      : regs => { regs.val = regs.arg1 * regs.arg2; };
    // compile left into val, save to arg1
    // compile right into val, save to arg2
    // apply op
    // Note: need to handle nesting — save arg1 before compiling right
  }
  return [];
}

function run_program(ast, env) {
  const insts = compile_node(ast);
  const regs = { val: null, arg1: null, arg2: null, env };
  for (const inst of insts) inst(regs);
  return regs.val;
}

// 2*3 + 4*5 = 26
const ast1 = { op:'+',
  left:  { op:'*', left:{type:'lit',val:2}, right:{type:'lit',val:3} },
  right: { op:'*', left:{type:'lit',val:4}, right:{type:'lit',val:5} }
};
console.log(run_program(ast1, {}));  // 26

// 10*10 = 100
const ast2 = { op:'*', left:{type:'lit',val:10}, right:{type:'lit',val:10} };
console.log(run_program(ast2, {}));  // 100

// 1*1 = 1
const ast3 = { op:'*', left:{type:'lit',val:1}, right:{type:'lit',val:1} };
console.log(run_program(ast3, {}));  // 1
`,
      hint: 'For the op case, you need to save arg1 before compiling the right side:\nconst left_save = left_insts.concat([regs => { regs.arg1 = regs.val; }]);\nconst right_save = right_insts.concat([regs => { regs.arg2 = regs.val; }]);\nreturn [...left_save, ...right_save, apply];',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nconst ast={op:"+",left:{op:"*",left:{type:"lit",val:2},right:{type:"lit",val:3}},right:{op:"*",left:{type:"lit",val:4},right:{type:"lit",val:5}}}; return run_program(ast,{})===26')
          return fn() === true
        } catch { return false }
      },
    },

    { type: 'checkpoint', id: 'cp-open-coding' },
  ],
}
