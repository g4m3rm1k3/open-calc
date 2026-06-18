// SICP — JavaScript — Lesson 5.4
export const lesson = {
  id: 'sicp-5-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '5.4  The Explicit-Control Evaluator',
  checkpoints: [
    { id: 'cp-registers',      label: 'Evaluator Registers' },
    { id: 'cp-eval-dispatch',  label: 'eval-dispatch' },
    { id: 'cp-apply-dispatch', label: 'apply-dispatch' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — FROM METACIRCULAR TO EXPLICIT CONTROL
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'In Chapter 4 we wrote a metacircular evaluator — a JavaScript evaluator written in JavaScript. It was elegant. `evaluate(exp, env)` called itself recursively, and JavaScript\'s own call stack kept track of all the pending computations. Every environment frame was a JavaScript object, automatically garbage-collected when no longer reachable. The bookkeeping was real, but invisible — done by the host language.\n\nChapter 5.4 translates that same evaluator into register machine instructions. Now every saved register is explicit. Every environment frame allocation is visible. Every return address is stored in the `continue` register, not pushed automatically by a function call. This is how EVERY real language runtime works: Python\'s CPython interpreter, Java\'s JVM, V8 running JavaScript. Underneath each one is a register machine (or something very close to it) running an explicit-control evaluator. Chapter 5.4 makes this transparent.',
      code: null,
    },

    {
      type: 'narration',
      id: 'evaluator-registers',
      text: 'The explicit-control evaluator has seven registers. Understanding what each one does is the key to understanding the whole machine:\n\n  exp       — the expression currently being evaluated\n  env       — the current environment (a chain of frames)\n  val       — the most recently computed value (the "result" register)\n  proc      — the procedure about to be applied\n  argl      — the list of evaluated arguments being assembled\n  continue  — the label to jump to when the current operation finishes (the return address)\n  stack     — the saved-register stack (used for save/restore)\n\nEvery operation the metacircular evaluator performed implicitly is now explicit in these registers. When `evaluate` was called recursively, JavaScript automatically saved the current `exp`, `env`, etc. on the call stack. Now WE must save them with explicit `save` instructions, and restore them with explicit `restore` instructions.',
      code: `// The evaluator's registers — initialized to null
const registers = new Map([
  ['exp',      null],   // expression being evaluated
  ['env',      null],   // current environment
  ['val',      null],   // most recently computed value
  ['proc',     null],   // procedure being applied
  ['argl',     null],   // argument list being built
  ['continue', null],   // where to jump after current operation
  // '__stack' is implicit — an array we push/pop
]);

// Example: set up to evaluate the literal 42
registers.set('exp', { type: 'lit', val: 42 });
registers.set('continue', 'done');

console.log('exp:', registers.get('exp'));
console.log('continue:', registers.get('continue'));
// After eval-dispatch runs: registers.get('val') === 42`,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — EVAL-DISPATCH
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'eval-dispatch',
      text: 'The `eval-dispatch` entry point is the central hub of the evaluator. It reads `exp` and dispatches on the expression type. The metacircular evaluator\'s `evaluate` function had an if-else chain; here it is a chain of test instructions followed by branches:\n\n  test: is exp a number literal?  → branch to ev-self-eval\n  test: is exp a variable name?   → branch to ev-variable\n  test: is exp an if expression?  → branch to ev-if\n  test: is exp a lambda?          → branch to ev-lambda\n  test: is exp an application?    → branch to ev-application\n  else: error\n\nEach branch handles one expression type, sets `val` to the result, and then jumps to `continue`. That final `goto continue` is the equivalent of a function return in the metacircular evaluator.',
      code: `// eval-dispatch as a JavaScript function (simulating the instruction sequence)
function eval_dispatch(registers, env_ops) {
  const exp = registers.get('exp');
  const env = registers.get('env');

  // is it a literal? (number, boolean, string)
  if (exp.type === 'lit') {
    registers.set('val', exp.val);
    return registers.get('continue');  // goto continue
  }

  // is it a variable name?
  if (exp.type === 'var') {
    registers.set('val', env_ops.lookup(exp.name, env));
    return registers.get('continue');
  }

  // is it an if expression?
  if (exp.type === 'if') {
    return 'ev-if';
  }

  // is it a lambda?
  if (exp.type === 'lambda') {
    return 'ev-lambda';
  }

  // is it an application (function call)?
  if (exp.type === 'app') {
    return 'ev-application';
  }

  throw new Error('Unknown expression type: ' + exp.type);
}

// Test: evaluating a literal
const regs = new Map([['exp', {type:'lit', val:42}], ['continue','done'], ['val',null], ['env',null]]);
const next = eval_dispatch(regs, { lookup: () => null });
console.log('val:', regs.get('val'));   // 42
console.log('next:', next);             // 'done'`,
    },

    {
      type: 'narration',
      id: 'evaluating-combinations',
      text: 'Evaluating an application `f(x, y)` requires evaluating three sub-expressions and then applying the procedure. In the metacircular evaluator, this happened transparently:\n\n  evaluate(f, env)  → recursive call (pushes frame)\n  evaluate(x, env)  → recursive call (pushes frame)\n  evaluate(y, env)  → recursive call (pushes frame)\n  apply(proc, args) → recursive call (pushes frame)\n\nIn the explicit-control evaluator, every one of those "pushes a frame" steps is now an explicit `save` instruction. Before evaluating the operator `f`, we must save `continue` and `env` because evaluating f might need to use those registers. After evaluating f, we restore them. Before evaluating each argument, same thing.\n\nEvery save/restore pair corresponds to exactly one recursive call in the metacircular evaluator. Made visible.',
      code: `// ev-application: evaluating f(x, y)
// Assume registers, env_ops, stack, eval_dispatch are available

function ev_application(registers, stack, env_ops) {
  const exp = registers.get('exp');   // the app node: {type:'app', fn:..., args:[...]}
  const env = registers.get('env');

  // Step 1: save continue and env (we need them after evaluating the operator)
  stack.push(registers.get('continue'));  // save continue
  stack.push(env);                         // save env
  console.log('  saved continue and env; stack depth=' + stack.length);

  // Step 2: evaluate the operator
  registers.set('exp', exp.fn);
  registers.set('continue', 'after-operator');
  // ... goto eval-dispatch (in real machine)
  // Simulate: evaluate operator directly
  registers.set('val', env_ops.lookup(exp.fn.name, env));

  // after-operator:
  const saved_env = stack.pop();           // restore env
  const saved_cont = stack.pop();          // restore continue
  console.log('  restored continue and env; stack depth=' + stack.length);

  registers.set('proc', registers.get('val'));  // save operator result as proc

  // Step 3: evaluate arguments, building argl
  const argl = [];
  for (const arg_exp of exp.args) {
    registers.set('exp', arg_exp);
    registers.set('val', env_ops.eval_simple(arg_exp, saved_env));
    argl.push(registers.get('val'));
    console.log('  evaluated arg:', registers.get('val'));
  }
  registers.set('argl', argl);
  registers.set('continue', saved_cont);
  return 'apply-dispatch';
}

// Demo
const stack = [];
const env = { x: 3, y: 4, add: (a,b) => a+b };
const regs = new Map([
  ['exp',      { type:'app', fn:{type:'var',name:'add'}, args:[{type:'lit',val:3},{type:'lit',val:4}] }],
  ['env',      env],
  ['continue', 'done'],
  ['proc',     null], ['argl', null], ['val', null]
]);
const env_ops = { lookup: (n, e) => e[n], eval_simple: (e, env) => e.type==='lit' ? e.val : env[e.name] };
const next = ev_application(regs, stack, env_ops);
console.log('proc:', regs.get('proc'));  // add function
console.log('argl:', regs.get('argl'));  // [3, 4]
console.log('next:', next);              // 'apply-dispatch'`,
    },

    { type: 'checkpoint', id: 'cp-registers' },
    { type: 'checkpoint', id: 'cp-eval-dispatch' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — APPLY-DISPATCH
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'apply-dispatch',
      text: '`apply-dispatch` reads `proc` and `argl` and performs the application. There are two cases:\n\n  1. PRIMITIVE procedure: call the underlying JavaScript function directly. Store the result in `val`. Goto `continue`. Simple.\n\n  2. COMPOUND procedure (a closure): create a new environment frame that binds the closure\'s parameters to the values in `argl`, extending the closure\'s captured environment. Load the closure\'s body into `exp`. Load the new frame into `env`. Goto `eval-dispatch`.\n\nCase 2 is the full implementation of the environment model from Chapter 3.2 — closures carry their defining environment, and application extends it. Now every step of that process is explicit in register machine instructions.',
      code: `// apply-dispatch as a JavaScript function
function apply_dispatch(registers, env_ops) {
  const proc = registers.get('proc');
  const argl = registers.get('argl');

  // Case 1: primitive procedure
  if (proc.type === 'primitive') {
    const result = proc.fn(...argl);
    registers.set('val', result);
    console.log('  primitive apply:', proc.name, '(' + argl + ') =', result);
    return registers.get('continue');   // goto continue
  }

  // Case 2: compound procedure (closure)
  if (proc.type === 'closure') {
    // Extend the closure's environment
    const new_frame = {};
    for (let i = 0; i < proc.params.length; i++) {
      new_frame[proc.params[i]] = argl[i];
    }
    const new_env = { frame: new_frame, parent: proc.env };
    console.log('  closure apply: new frame', new_frame);
    registers.set('env', new_env);
    registers.set('exp', proc.body);
    return 'eval-dispatch';   // evaluate the body in the new environment
  }

  throw new Error('Unknown procedure type');
}

// Demo: apply a primitive +
const regs = new Map([
  ['proc', { type:'primitive', name:'+', fn: (a,b) => a+b }],
  ['argl', [3, 4]],
  ['val', null],
  ['continue', 'done'],
]);
const next = apply_dispatch(regs, {});
console.log('val:', regs.get('val'));   // 7
console.log('next:', next);             // 'done'`,
    },

    {
      type: 'narration',
      id: 'stack-is-call-stack',
      text: 'Now step back and look at the machine stack. What IS it?\n\nIt is the call stack you have seen in CodeLens all along. Every frame in the CodeLens visualization corresponds to a set of saved registers on this stack. When the metacircular evaluator called `evaluate` recursively, JavaScript automatically pushed a frame containing the local variables and the return address onto its call stack. That happened invisibly.\n\nIn the explicit-control evaluator, that same push is written as:\n  save continue\n  save env\n  save exp\n  (evaluate sub-expression)\n  restore exp\n  restore env\n  restore continue\n\nAnd the pop is explicit too. The stack IS the deferred computations — the pending multiplications of recursive factorial, the pending additions of tree-recursive Fibonacci. Every saved-register group is one deferred operation. Now it is all visible.',
      code: null,
    },

    {
      type: 'narration',
      id: 'tail-calls',
      text: 'Tail call optimization becomes visible in the explicit-control evaluator.\n\nA tail call is an application that is the LAST operation in a function body — nothing needs to happen after it returns. In the metacircular evaluator, tail calls still pushed a new frame onto the JavaScript call stack, because JavaScript does not (in general) optimize them away.\n\nIn the explicit-control evaluator: if we are about to make a tail call, the `continue` register already holds where to go after the CALLEE returns. We do NOT need to save `continue` before the call — the caller\'s saved registers are already on the stack. So we skip the `save continue` instruction.\n\nThis means: no new frame is pushed onto the explicit-control evaluator\'s stack. The callee runs, sets `val`, and jumps to the same `continue` the caller would have jumped to. The stack DOES NOT GROW. A tail-recursive function runs in constant stack space — zero extra saves, zero extra restores. This is why tail-recursive processes are iterative: the stack depth is bounded.',
      code: `// Compare: non-tail vs tail recursive factorial
// In the explicit-control evaluator:

// NON-TAIL: factorial(n) = n * factorial(n-1)
// After the recursive call, we need n to multiply.
// So we must save n before the call — the stack grows Theta(n).
function factorial_nontail(n, stack_sim) {
  if (n === 0) return 1;
  stack_sim.push(n);   // save n — explicit stack frame
  const sub = factorial_nontail(n - 1, stack_sim);
  stack_sim.pop();     // restore n
  return n * sub;
}

// TAIL: factorial_iter(n, acc) — acc carries the product
// The recursive call is the LAST thing we do. Nothing to save.
// The stack stays at depth 1 regardless of n.
function factorial_tail(n, acc, depth_counter) {
  depth_counter.max = Math.max(depth_counter.max, depth_counter.cur);
  if (n === 0) return acc;
  depth_counter.cur++;
  const result = factorial_tail(n - 1, n * acc, depth_counter);
  depth_counter.cur--;
  return result;
}

const nt_stack = [];
const nt_result = factorial_nontail(6, nt_stack);
console.log('Non-tail factorial(6):', nt_result, '  max stack saved:', 6);

const depth = { cur: 1, max: 1 };
const t_result = factorial_tail(6, 1, depth);
console.log('Tail factorial(6):', t_result, '  (tail calls: no grow needed)');
console.log('In ECEval: tail version saves 0 registers per call');`,
    },

    {
      type: 'narration',
      id: 'putting-it-together',
      text: 'The explicit-control evaluator is complete. SICP\'s full version is about 700 register machine instructions — every one derivable from the principles we have built. The structure maps precisely onto the metacircular evaluator:\n\n  Every recursive call to evaluate → save/goto eval-dispatch/restore\n  Every application                → save/goto apply-dispatch/restore\n  Every environment extension      → explicit call to extend_env\n  Every return                     → goto continue\n\nThe metacircular evaluator was elegant because it hid all this bookkeeping inside JavaScript. The explicit-control evaluator is transparent: every cost is visible, every saved register is counted, every stack frame is explicit. That transparency is exactly why SICP builds it.',
      code: `// Complete mini-ECEval: evaluate (2 + 3) * 4 = 20
function mini_eceval(ast) {
  const stack = [];
  const regs = { exp: ast, env: { '+': (a,b)=>a+b, '*': (a,b)=>a*b }, val: null, continue: 'done', proc: null, argl: null };

  function goto(label) {
    if (label === 'eval-dispatch') return eval_dispatch();
    if (label === 'apply-dispatch') return apply_dispatch();
    if (label === 'done') return regs.val;
    throw new Error('Unknown label: ' + label);
  }

  function eval_dispatch() {
    const exp = regs.exp;
    if (exp.type === 'lit')    { regs.val = exp.val; return goto(regs.continue); }
    if (exp.type === 'var')    { regs.val = regs.env[exp.name]; return goto(regs.continue); }
    if (exp.type === 'app')    { return ev_app(); }
    throw new Error('bad exp');
  }

  function ev_app() {
    const exp = regs.exp;
    stack.push(regs.continue); stack.push(regs.env);
    regs.exp = exp.fn; regs.continue = 'after-op';
    function after_op() {
      regs.env = stack.pop(); regs.continue = stack.pop();
      regs.proc = regs.val;
      regs.argl = exp.args.map(a => { regs.exp = a; eval_dispatch(); return regs.val; });
      return goto('apply-dispatch');
    }
    eval_dispatch(); return after_op();
  }

  function apply_dispatch() {
    regs.val = regs.proc(...regs.argl);
    return goto(regs.continue);
  }

  return goto('eval-dispatch');
}

// (2 + 3) * 4
const ast = {
  type: 'app', fn: { type:'var', name:'*' },
  args: [
    { type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:2},{type:'lit',val:3}] },
    { type:'lit', val:4 },
  ],
};

console.log('(2+3)*4 =', mini_eceval(ast));  // 20`,
    },

    { type: 'checkpoint', id: 'cp-apply-dispatch' },

    {
      type: 'codelens',
      id: 'codelens-eval-dispatch',
      text: 'Step through eval-dispatch handling two cases: a literal `{type:"lit", val:42}` and a variable `{type:"var", name:"x"}`. Watch how the `val` register gets set in each case. Watch the `continue` register determine where execution jumps after val is set. The `continue` register IS the return address — the address that would have been pushed onto the call stack by a function call.',
      code: `// eval-dispatch for two cases: literal and variable
const env = { x: 10, y: 20 };
const regs = { exp: null, env, val: null, continue: 'done' };
let jumped_to = null;

function eval_dispatch() {
  const exp = regs.exp;
  console.log('eval-dispatch: exp=' + JSON.stringify(exp));

  if (exp.type === 'lit') {
    regs.val = exp.val;
    console.log('  literal -> val=' + regs.val + ', goto ' + regs.continue);
    jumped_to = regs.continue;
    return;
  }
  if (exp.type === 'var') {
    regs.val = regs.env[exp.name];
    console.log('  variable "' + exp.name + '" -> val=' + regs.val + ', goto ' + regs.continue);
    jumped_to = regs.continue;
    return;
  }
}

// Case 1: literal
regs.exp = { type: 'lit', val: 42 };
regs.continue = 'done';
eval_dispatch();
console.log('jumped to:', jumped_to, '  val:', regs.val);

// Case 2: variable
regs.exp = { type: 'var', name: 'x' };
regs.continue = 'after-x';
eval_dispatch();
console.log('jumped to:', jumped_to, '  val:', regs.val);`,
    },

    {
      type: 'codelens',
      id: 'codelens-combination',
      text: 'Step through evaluating (2 + 3). Watch save/restore of env and continue before and after evaluating the operator. Watch argl being built up [2, 3] as each argument is evaluated. Watch apply-dispatch call the + operation. Count the save/restore pairs — there are exactly as many as there would be recursive calls in the metacircular evaluator.',
      code: `// Trace evaluating (2 + 3) through the explicit-control evaluator
const stack = [];
const env = { '+': (a, b) => a + b };
let val = null, proc = null, argl = null;
let continue_reg = 'done';

function save(reg_name, value) {
  stack.push([reg_name, value]);
  console.log('  SAVE ' + reg_name + '=' + JSON.stringify(value) + '  depth=' + stack.length);
}
function restore() {
  const [name, value] = stack.pop();
  console.log('  RESTORE ' + name + '=' + JSON.stringify(value) + '  depth=' + stack.length);
  return [name, value];
}

console.log('Evaluating: (+ 2 3)');
console.log('--- ev-application ---');
save('continue', continue_reg);
save('env', env);

// Evaluate operator: +
val = env['+'];
console.log('  operator -> val=<fn>');

let saved_env, saved_cont;
[, saved_env] = restore();   // restore env (actually restore both in order)
[, saved_cont] = restore();  // restore continue
proc = val;
console.log('  proc = + function');

// Evaluate arguments
console.log('--- ev-args ---');
val = 2; argl = [val]; console.log('  arg1 -> argl=[2]');
val = 3; argl = [...argl, val]; console.log('  arg2 -> argl=[2,3]');

// apply-dispatch
console.log('--- apply-dispatch ---');
val = proc(...argl);
console.log('  primitive + applied: val=' + val + ', goto ' + saved_cont);`,
    },

    {
      type: 'challenge',
      id: 'challenge-eceval',
      text: 'Implement a minimal explicit-control evaluator. It must support: number literals, variable lookup from an environment object, and function application (calling a function from the environment with evaluated arguments). Test it by evaluating the expression (2 + 3) * 4, which should return 20.',
      expectedOutput: '20\n7\n1',
      startCode: `// Mini ECEval: evaluate AST nodes using explicit register tracking

function make_eceval(env) {
  // registers
  const regs = { exp: null, val: null, continue: 'done', proc: null, argl: null };
  const stack = [];

  function evaluate(exp) {
    regs.exp = exp;
    return dispatch();
  }

  function dispatch() {
    const exp = regs.exp;
    // Handle: {type:'lit', val:n}  -> return n
    // Handle: {type:'var', name:s} -> return env[s]
    // Handle: {type:'app', fn:..., args:[...]} -> evaluate fn, evaluate args, call
  }

  return { evaluate };
}

const env = { '+': (a,b) => a+b, '*': (a,b) => a*b, '-': (a,b) => a-b };
const eceval = make_eceval(env);

// (2+3)*4 = 20
const expr1 = { type:'app', fn:{type:'var',name:'*'},
  args:[
    {type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:2},{type:'lit',val:3}]},
    {type:'lit',val:4}
  ]};
console.log(eceval.evaluate(expr1));  // 20

// 3+4 = 7
const expr2 = {type:'app', fn:{type:'var',name:'+'}, args:[{type:'lit',val:3},{type:'lit',val:4}]};
console.log(eceval.evaluate(expr2));  // 7

// 5-4 = 1
const expr3 = {type:'app', fn:{type:'var',name:'-'}, args:[{type:'lit',val:5},{type:'lit',val:4}]};
console.log(eceval.evaluate(expr3));  // 1
`,
      hint: 'function dispatch() {\n  const exp = regs.exp;\n  if (exp.type === "lit") return exp.val;\n  if (exp.type === "var") return env[exp.name];\n  if (exp.type === "app") {\n    const fn = evaluate(exp.fn);\n    const args = exp.args.map(a => evaluate(a));\n    return fn(...args);\n  }\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nconst e={"+": (a,b)=>a+b, "*":(a,b)=>a*b}; const ev=make_eceval(e); const ast={type:"app",fn:{type:"var",name:"*"},args:[{type:"app",fn:{type:"var",name:"+"},args:[{type:"lit",val:2},{type:"lit",val:3}]},{type:"lit",val:4}]}; return ev.evaluate(ast) === 20')
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
