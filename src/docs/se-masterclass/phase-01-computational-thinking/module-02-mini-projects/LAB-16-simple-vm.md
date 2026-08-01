# SE Masterclass — LAB-16 — Simple VM

**Language: JavaScript (Node.js)** — the capstone of the LAB-09–16 project.

**Prerequisites:** All of LAB-09–15. This lab reuses LAB-11's parser and LAB-12's AST directly — instead of WALKING the tree to compute an answer (LAB-12), you will COMPILE the tree into a flat list of instructions, then execute those instructions with a completely different technique: a fetch-decode-execute loop, exactly like real CPU hardware.

**What this lab adds:**
- The fetch-decode-execute cycle — what every CPU, and every bytecode VM, actually does
- A stack-based instruction set: a small, fixed vocabulary of operations
- Compiling LAB-11's AST into a flat sequence of instructions (not walking it directly, like LAB-12 did)
- Running that instruction sequence with an explicit stack (LAB-05) and instruction pointer
- Why this two-step approach (compile, then run) is how real interpreters and languages work

**Time:** 100–130 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-12's evaluator directly walked the AST recursively to produce a number. This lab produces a FLAT LIST of instructions first, then runs THAT. What might be worth trading recursion for a flat list?
> 2. A stack-based VM computes `3 + 4` by pushing `3`, pushing `4`, then running `ADD`, which pops two values and pushes their sum. Why does `ADD` need to pop TWO values, not one?
> 3. What does "instruction pointer" mean, and what happens to it after each instruction runs, in the ordinary (non-jumping) case?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Hand-Written Bytecode: 3 + 4 ===
program:
  PUSH 3
  PUSH 4
  ADD
  PRINT
  HALT
output: 7

=== Fetch-Decode-Execute Trace ===
ip=0 fetch PUSH 3    | stack after: [3]
ip=1 fetch PUSH 4    | stack after: [3, 4]
ip=2 fetch ADD       | stack after: [7]
ip=3 fetch PRINT     | stack after: [7]        (7 printed)
ip=4 fetch HALT      | stack after: [7]        (execution stopped)

=== Compiling "3 + 4 * 2" from the AST (LAB-11) ===
program:
  PUSH 3
  PUSH 4
  PUSH 2
  MUL
  ADD
  PRINT
  HALT
output: 11

=== Variables: STORE and LOAD ===
program for "x = 5" then "x + 3":
  PUSH 5
  STORE x
  LOAD x
  PUSH 3
  ADD
  PRINT
  HALT
output: 8

=== Control Flow: Conditional Jump ===
program (if x > 3 print "big" else print "small"), x = 10:
  LOAD x
  PUSH 3
  GT
  JMP_IF_FALSE 7
  PUSH_STR "big"
  PRINT
  JMP 9
  PUSH_STR "small"
  PRINT
  HALT
output: big

=== Full Pipeline: Source Text to VM Execution ===
"10 - 2 * 3" -> tokenize -> parse -> compile -> run -> 4
```

---

### Concept: The Fetch-Decode-Execute Cycle

**What it is:** Every CPU — and every bytecode VM modeling one — runs the same loop forever: **fetch** the next instruction (using a pointer that tracks "where am I"), **decode** what kind of instruction it is, **execute** it (which may change data, and usually advances the pointer to the next instruction).

**The problem before:** LAB-12's evaluator directly recursed through the AST — elegant, but tightly coupled to the TREE'S shape. The recursion depth mirrors the expression's nesting depth, and there's no natural "pause here, resume later" point — a real CPU can't just "recurse into a tree"; it reads one flat sequence of instructions, one at a time, forever, from actual memory.

**The solution:** Compile the tree into a FLAT list of simple instructions first (a completely separate step, done ONCE), then run a simple loop that walks that flat list — no recursion needed to EXECUTE it, even though the ORIGINAL expression may have been deeply nested.

**Canonical example (General Explanation):**

Think of sheet music vs. a live jazz improvisation. LAB-12's tree-walking evaluator is like reading and playing a piece of music by reasoning about its NESTED musical structure in your head as you go (phrase within phrase within phrase). This lab's VM is like a player piano: someone ALREADY transcribed the piece into a flat sequence of "press key 42, release, press key 45..." instructions, and the player piano just plays them in order, one at a time, with no understanding of the original musical structure at all.

```js
let ip = 0                          // instruction pointer — "where am I in the program"
while (ip < program.length) {
  const instruction = program[ip]    // FETCH
  // DECODE + EXECUTE happens inside the dispatch table lookup
  ip++                                // advance to the next instruction (unless a jump changes this)
}
```

**Project Application (The "Why" here):** This is exactly the architecture behind real language runtimes — the Python interpreter, the Java Virtual Machine, V8 (which runs your `node main.js` right now) all compile source code down to some form of bytecode FIRST, then execute that bytecode with a fetch-decode-execute loop, for reasons Step 5's Mental Model section covers directly.

**Watch for:** "Compile" here does NOT mean "turn into machine code that runs on real silicon" (that's a much bigger job, covered starting in LAB-87). It means "turn a tree into a flatter, simpler representation that's easier and more uniform to execute" — bytecode is still interpreted by a program (this lab's `run()` function), not executed directly by hardware.

---

## Step 1 — Hand-Write Bytecode and a Stack-Based VM

A **stack-based** VM keeps ALL its working data on one stack (LAB-05). Instructions either PUSH values onto it or POP values off it to compute something.

```js
// vm.js

const OP = {                          // ← add: opcode constants — using strings for readability in this lab
  PUSH: 'PUSH',
  ADD: 'ADD',
  SUB: 'SUB',
  MUL: 'MUL',
  DIV: 'DIV',
  PRINT: 'PRINT',
  HALT: 'HALT',
}

function run(program) {
  const stack = []                     // ← add: the VM's entire working memory, for this lab
  let ip = 0                            // ← add: instruction pointer

  while (ip < program.length) {
    const instr = program[ip]           // ← add: FETCH

    if (instr.op === OP.PUSH) {
      stack.push(instr.arg)              // ← add: DECODE + EXECUTE — push the literal value
    } else if (instr.op === OP.ADD) {
      const b = stack.pop()               // ← add: pop TWO operands — order matters, see below
      const a = stack.pop()
      stack.push(a + b)
    } else if (instr.op === OP.PRINT) {
      console.log(`output: ${stack[stack.length - 1]}`)   // peek, don't pop — PRINT shouldn't consume the value
    } else if (instr.op === OP.HALT) {
      return stack                        // ← add: stop the loop entirely
    } else {
      throw new Error(`Unknown opcode: ${instr.op}`)
    }

    ip++                                  // ← add: advance to the next instruction
  }

  return stack
}

module.exports = { OP, run }
```

```js
// main.js
const { OP, run } = require('./vm')

console.log('=== Hand-Written Bytecode: 3 + 4 ===')
const program = [
  { op: OP.PUSH, arg: 3 },
  { op: OP.PUSH, arg: 4 },
  { op: OP.ADD },
  { op: OP.PRINT },
  { op: OP.HALT },
]

console.log('program:')
for (const instr of program) {
  console.log(`  ${instr.op}${instr.arg !== undefined ? ' ' + instr.arg : ''}`)
}

run(program)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Hand-Written Bytecode: 3 + 4 ===
program:
  PUSH 3
  PUSH 4
  ADD
  PRINT
  HALT
output: 7
```

**Trace the stack by hand, instruction by instruction:**
- `PUSH 3` → stack: `[3]`
- `PUSH 4` → stack: `[3, 4]`
- `ADD` → pops `4` (as `b`), pops `3` (as `a`), pushes `3 + 4 = 7` → stack: `[7]`
- `PRINT` → reads (without removing) the top of the stack → prints `7`
- `HALT` → stops the loop, returns the stack

**Why `ADD` pops `b` before `a`:** The stack is LIFO (LAB-05) — the LAST thing pushed is the FIRST thing popped. `4` was pushed after `3`, so `4` comes off FIRST. Naming it `b` (the second operand) and `3` as `a` (the first operand) keeps the naming intuitive even though the POP order is reversed from the PUSH order — this matters MORE for non-commutative operators like `SUB`/`DIV`, which you'll add next.

**Change something:** Hand-write a program for `10 - 3` using `OP.SUB` (not yet defined — you'll add it in Step 2). Predict the correct pop order (`a - b`, where `a` was pushed first) before writing the VM code for it.

---

## Step 2 — Instrument the Fetch-Decode-Execute Loop

Make the cycle VISIBLE, the same instinct as LAB-07's traced factorial.

```js
function runTraced(program) {
  const stack = []
  let ip = 0

  while (ip < program.length) {
    const instr = program[ip]                                    // FETCH
    const label = `${instr.op}${instr.arg !== undefined ? ' ' + instr.arg : ''}`

    if (instr.op === OP.PUSH) {
      stack.push(instr.arg)
    } else if (instr.op === OP.ADD) {
      const b = stack.pop()
      const a = stack.pop()
      stack.push(a + b)
    } else if (instr.op === OP.PRINT) {
      // no stack change — peek only
    } else if (instr.op === OP.HALT) {
      console.log(`ip=${ip} fetch ${label.padEnd(12)} | stack after: [${stack.join(', ')}]        (execution stopped)`)
      return stack
    }

    if (instr.op === OP.PRINT) {
      console.log(`ip=${ip} fetch ${label.padEnd(12)} | stack after: [${stack.join(', ')}]        (${stack[stack.length - 1]} printed)`)
    } else {
      console.log(`ip=${ip} fetch ${label.padEnd(12)} | stack after: [${stack.join(', ')}]`)
    }

    ip++                                                          // advance — this is what "fetch the NEXT one" means
  }

  return stack
}
```

Add to `main.js`:

```js
console.log('\n=== Fetch-Decode-Execute Trace ===')
runTraced(program)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Fetch-Decode-Execute Trace ===
ip=0 fetch PUSH 3    | stack after: [3]
ip=1 fetch PUSH 4    | stack after: [3, 4]
ip=2 fetch ADD       | stack after: [7]
ip=3 fetch PRINT     | stack after: [7]        (7 printed)
ip=4 fetch HALT      | stack after: [7]        (execution stopped)
```

**Confirm `ip` genuinely tracks position, not just a loop counter:** In THIS program, `ip` happens to match "how many instructions have run" exactly (0, 1, 2, 3, 4), because nothing jumps yet. Once `JMP` is introduced (Step 4), `ip` will visibly SKIP or REPEAT values — this trace format will make that jump behavior directly visible too.

---

## Step 3 — A Real Compiler: AST to Bytecode

Instead of hand-writing programs, COMPILE them from LAB-11's AST — reusing the parser you already built.

```js
// compiler.js
const { OP } = require('./vm')

function compile(node, code = []) {
  if (node.type === 'Number') {
    code.push({ op: OP.PUSH, arg: node.value })          // ← add: base case — a literal becomes one PUSH
    return code
  }

  if (node.type === 'BinaryOp') {
    compile(node.left, code)                               // ← add: compile the LEFT subtree first — its instructions go first
    compile(node.right, code)                               // ← add: then the right — this is LAB-06's postorder again
    const opMap = { '+': OP.ADD, '-': OP.SUB, '*': OP.MUL, '/': OP.DIV }
    code.push({ op: opMap[node.operator] })                  // ← add: THEN the operator — matches evaluation order exactly
    return code
  }

  throw new Error(`Cannot compile node type: ${node.type}`)
}

module.exports = { compile }
```

Add `SUB`, `MUL`, `DIV` to `vm.js`'s dispatch (inside `run`, alongside `ADD`):

```js
} else if (instr.op === OP.SUB) {
  const b = stack.pop()
  const a = stack.pop()
  stack.push(a - b)                    // a - b, NOT b - a — pop order matters here
} else if (instr.op === OP.MUL) {
  const b = stack.pop()
  const a = stack.pop()
  stack.push(a * b)
} else if (instr.op === OP.DIV) {
  const b = stack.pop()
  const a = stack.pop()
  if (b === 0) throw new Error('division by zero')
  stack.push(a / b)
}
```

### SAVE AND TRY

```js
// main.js
const { parse } = require('./parser')          // from LAB-11
const { compile } = require('./compiler')

console.log('\n=== Compiling "3 + 4 * 2" from the AST (LAB-11) ===')
const ast = parse('3 + 4 * 2')
const compiled = compile(ast)

console.log('program:')
for (const instr of compiled) {
  console.log(`  ${instr.op}${instr.arg !== undefined ? ' ' + instr.arg : ''}`)
}
console.log(`  PRINT`)
console.log(`  HALT`)

run([...compiled, { op: OP.PRINT }, { op: OP.HALT }])
```

```bash
node main.js
```

**Expected:**
```
=== Compiling "3 + 4 * 2" from the AST (LAB-11) ===
program:
  PUSH 3
  PUSH 4
  PUSH 2
  MUL
  ADD
  PRINT
  HALT
output: 11
```

**Confirm precedence carried all the way through:** `MUL` appears BEFORE `ADD` in the compiled program — because `compile` recursed into `node.right` (the `4 * 2` subtree) and finished emitting ITS instructions before emitting the outer `+`'s `ADD` instruction. This is the SAME structural guarantee from LAB-12 (the tree shape already encodes precedence), now expressed as INSTRUCTION ORDER instead of RECURSION ORDER — two completely different execution strategies (tree-walk vs. flat bytecode), both correctly respecting the same precedence, because both are driven by the same underlying AST.

**Change something:** Compile `"(3 + 4) * 2"` and confirm `ADD` now appears BEFORE `MUL` in the output program — the parenthesized subtraction of roles flips which operator's instructions get emitted first, exactly mirroring LAB-11's parenthesization discussion.

---

## Step 4 — Variables: STORE and LOAD

A VM needs somewhere to keep named values between instructions — reusing LAB-12's environment idea, but as VM "memory" instead of a JS object passed through recursive calls.

```js
// Add to vm.js's OP object:
STORE: 'STORE',   // pop the top of the stack, save it under a name
LOAD: 'LOAD',     // push the value saved under a name
```

```js
// Add to run()'s dispatch, and thread a 'memory' object through:
function run(program) {
  const stack = []
  const memory = {}                     // ← add: named storage — LAB-12's environment, VM-flavored
  let ip = 0

  while (ip < program.length) {
    const instr = program[ip]

    if (instr.op === OP.STORE) {
      memory[instr.arg] = stack.pop()     // ← add: pop the computed value, save it under this name
    } else if (instr.op === OP.LOAD) {
      if (!(instr.arg in memory)) throw new Error(`undefined variable "${instr.arg}"`)
      stack.push(memory[instr.arg])        // ← add: push the SAVED value back onto the stack
    }
    // ... existing PUSH/ADD/SUB/MUL/DIV/PRINT/HALT cases unchanged

    ip++
  }
  return stack
}
```

### SAVE AND TRY

```js
console.log('\n=== Variables: STORE and LOAD ===')
const varProgram = [
  { op: OP.PUSH, arg: 5 },
  { op: OP.STORE, arg: 'x' },
  { op: OP.LOAD, arg: 'x' },
  { op: OP.PUSH, arg: 3 },
  { op: OP.ADD },
  { op: OP.PRINT },
  { op: OP.HALT },
]

console.log('program for "x = 5" then "x + 3":')
for (const instr of varProgram) {
  console.log(`  ${instr.op}${instr.arg !== undefined ? ' ' + instr.arg : ''}`)
}
run(varProgram)
```

```bash
node main.js
```

**Expected:**
```
=== Variables: STORE and LOAD ===
program for "x = 5" then "x + 3":
  PUSH 5
  STORE x
  LOAD x
  PUSH 3
  ADD
  PRINT
  HALT
output: 8
```

**Trace the stack AND memory together:** `PUSH 5` → stack `[5]`. `STORE x` → pops `5`, stack `[]`, memory `{x: 5}`. `LOAD x` → pushes memory's `x`, stack `[5]`. `PUSH 3` → stack `[5, 3]`. `ADD` → stack `[8]`. `PRINT` → outputs `8`.

---

## Step 5 — Control Flow: Jumps

Real programs branch (`if`) and loop (`while`). At the bytecode level, BOTH are built from exactly one primitive: **jumping** — setting `ip` to something OTHER than `ip + 1`.

```js
// Add to vm.js's OP object:
GT: 'GT',                       // pop two, push 1 if a > b else 0 (no boolean type in this tiny VM)
JMP: 'JMP',                     // unconditionally set ip to instr.arg
JMP_IF_FALSE: 'JMP_IF_FALSE',   // pop one; if it's 0 (falsy), set ip to instr.arg
PUSH_STR: 'PUSH_STR',           // push a string literal (this VM's numbers-only PUSH can't hold text)
```

```js
// Add to run()'s dispatch:
} else if (instr.op === OP.GT) {
  const b = stack.pop()
  const a = stack.pop()
  stack.push(a > b ? 1 : 0)
} else if (instr.op === OP.PUSH_STR) {
  stack.push(instr.arg)
} else if (instr.op === OP.JMP) {
  ip = instr.arg                  // ← add: set ip directly — the '+1' at the loop's end will be skipped this iteration
  continue                         // ← add: skip the normal ip++ at the bottom — 'arg' IS the next ip, exactly
} else if (instr.op === OP.JMP_IF_FALSE) {
  const condition = stack.pop()
  if (condition === 0) {
    ip = instr.arg
    continue                       // ← add: same reasoning — don't also add 1 after jumping
  }
}
```

**Why `JMP`/`JMP_IF_FALSE` need `continue`:** Every other instruction falls through to `ip++` at the bottom of the loop, advancing to the NEXT instruction normally. A jump instruction sets `ip` to its OWN target directly — if the loop's `ip++` ran afterward too, the jump would land one instruction too far. `continue` skips straight to the next `while` check, bypassing that trailing `ip++` for this one iteration only.

### SAVE AND TRY

```js
console.log('\n=== Control Flow: Conditional Jump ===')
// if (x > 3) print "big" else print "small"
const condProgram = [
  { op: OP.LOAD, arg: 'x' },        // 0
  { op: OP.PUSH, arg: 3 },          // 1
  { op: OP.GT },                    // 2:  x > 3  -> 1 or 0
  { op: OP.JMP_IF_FALSE, arg: 7 },  // 3:  if false, jump to index 7 (the "small" branch)
  { op: OP.PUSH_STR, arg: 'big' },  // 4
  { op: OP.PRINT },                 // 5
  { op: OP.JMP, arg: 9 },           // 6:  skip the "small" branch entirely
  { op: OP.PUSH_STR, arg: 'small' },// 7
  { op: OP.PRINT },                 // 8
  { op: OP.HALT },                  // 9
]

console.log('program (if x > 3 print "big" else print "small"), x = 10:')
for (const instr of condProgram) {
  console.log(`  ${instr.op}${instr.arg !== undefined ? ' ' + instr.arg : ''}`)
}

const condMemory = { x: 10 }
run(condProgram, condMemory)   // (assumes 'run' accepts an initial memory object — pass it in, or STORE x=10 as the first instructions)
```

**Expected:**
```
=== Control Flow: Conditional Jump ===
program (if x > 3 print "big" else print "small"), x = 10:
  LOAD x
  PUSH 3
  GT
  JMP_IF_FALSE 7
  PUSH_STR big
  PRINT
  JMP 9
  PUSH_STR small
  PRINT
  HALT
output: big
```

**Trace the jump by hand:** `LOAD x` → `[10]`. `PUSH 3` → `[10, 3]`. `GT` → pops `3` and `10`, pushes `10 > 3 ? 1 : 0` = `1` → `[1]`. `JMP_IF_FALSE 7` → pops `1`; since it's NOT `0`, the condition holds, so NO jump happens — `ip` advances normally to `4`. `PUSH_STR 'big'` → `['big']`. `PRINT` → outputs `big`. `JMP 9` → `ip` jumps STRAIGHT to `9`, skipping indices `7` and `8` (the `'small'` branch) entirely. `HALT` at index `9` stops execution. The `'small'` branch's instructions exist in the program but were NEVER FETCHED — this is exactly what "skipping a branch" means at the instruction level.

**Change something:** Change `condMemory` to `{ x: 1 }`. Trace by hand: `GT` now pushes `0` (since `1 > 3` is false). `JMP_IF_FALSE 7` pops `0` — condition IS `0` (falsy) — `ip` jumps to `7`, landing exactly on `PUSH_STR 'small'`. Confirm the output is `small`.

---

## Step 6 — The Complete Pipeline

```js
const { tokenize } = require('./lexer')       // LAB-10

function compileAndRun(input) {
  const ast = parse(input)                      // LAB-11: text -> tree
  const bytecode = compile(ast)                  // this lab: tree -> flat instructions
  bytecode.push({ op: OP.PRINT }, { op: OP.HALT })
  return run(bytecode)                            // this lab: instructions -> answer
}

console.log('\n=== Full Pipeline: Source Text to VM Execution ===')
const source = '10 - 2 * 3'
console.log(`"${source}" -> tokenize -> parse -> compile -> run -> ${compileAndRun(source)[0]}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Full Pipeline: Source Text to VM Execution ===
"10 - 2 * 3" -> tokenize -> parse -> compile -> run -> 4
```

**The entire module, traced one final time:** `tokenize` (LAB-10) turns `"10 - 2 * 3"` into tokens. `parse` (LAB-11) turns tokens into a tree where `*` is a child of `-` (precedence, structurally). `compile` (this lab) walks that SAME tree — postorder, exactly like LAB-06 and LAB-12 — but instead of computing a number directly, it EMITS instructions in the order things need to happen. `run` executes those flat instructions with a stack and an instruction pointer, arriving at `4` (`10 - (2 * 3) = 10 - 6 = 4`) — the identical answer LAB-12's tree-walker would have given, produced by a completely different execution STRATEGY.

---

## Mental Model: Why Bother With Bytecode When Tree-Walking (LAB-12) Already Works?

| Advantage | Why it matters |
|---|---|
| **Portability** | The same bytecode can run on ANY machine that has an implementation of `run()` — Python's `.pyc` files and the JVM's `.class` files work exactly this way, letting one compiled form run anywhere the VM exists |
| **Speed** | A flat instruction loop is generally faster than repeated recursive tree traversal — no function-call overhead (LAB-07's stack-frame cost) per node, just array indexing |
| **Sandboxing** | A VM can restrict EXACTLY what instructions exist — no `FILE_DELETE` opcode means the bytecode literally cannot delete files, a much stronger guarantee than hoping application code "remembers" not to |
| **Serialization** | A flat array of `{op, arg}` objects can be saved to disk or sent over a network trivially (LAB-26); a live, in-memory recursive call stack cannot |
| **Debugging tools** | Breakpoints, single-stepping, and this lab's `runTraced` all become straightforward once execution is "one instruction at a time" instead of buried inside recursive calls |

**Where you will see this again:**
- LAB-84 (Bytecode and VMs) generalizes this EXACT architecture — opcodes, a stack, fetch-decode-execute — to a much larger instruction set with functions, loops, and closures
- LAB-87 (Compiler) extends `compile()`'s AST-walking pattern to a real source-to-target translation
- Every language runtime you will ever use (Python, Java, Ruby, PHP, and V8 itself, running this very lab's `node` command) uses this same fetch-decode-execute shape internally

---

## Module 2 Complete

You've now built, end to end: a **calculator** (LAB-09), a **lexer** (LAB-10), a **parser** (LAB-11), a **tree-walking evaluator** (LAB-12), a **state machine** (LAB-13), a **dependency graph** (LAB-14), a **priority-queue scheduler** (LAB-15), and a **bytecode VM** (this lab) — the exact same lexer and parser feeding BOTH a tree-walking evaluator and a compile-then-run VM. This is not eight unrelated exercises — it's one coherent picture of how software translates human intent into a computer executing instructions, at every layer.

---

## Final Check

| Feature | How to verify |
|---|---|
| Hand-written `3 + 4` bytecode correctly prints `7` | Step 1 |
| The traced fetch-decode-execute loop shows `ip` and the stack changing each step | Step 2 |
| `compile(parse('3 + 4 * 2'))` produces bytecode where `MUL` precedes `ADD` | Step 3 |
| `STORE`/`LOAD` correctly persist a value across instructions | Step 4 |
| `JMP_IF_FALSE` correctly skips the "big" branch when the condition is false | Step 5 |
| The full pipeline (`tokenize → parse → compile → run`) produces the correct answer for a precedence-sensitive expression | Step 6 |
| You can explain, without notes, why `JMP` needs `continue` in the fetch loop | The trailing `ip++` would double-advance |

---

## Quick Check Answers

**1. Why trade recursion for a flat instruction list?**

A flat list can be executed with a simple loop instead of the call stack (LAB-07) — no risk of stack overflow from deep recursion, and it can be inspected, saved, sent elsewhere, or stepped through one instruction at a time (this lab's `runTraced`), none of which is straightforward with a live recursive call in progress. The Mental Model table above lists five concrete advantages (portability, speed, sandboxing, serialization, debugging) that all follow from having a flat, static, inspectable program instead of a transient call stack.

**2. Why does `ADD` need to pop TWO values, not one?**

Because addition is a BINARY operation — it needs two operands to produce one result. The stack-based design encodes this directly: `PUSH 3` and `PUSH 4` place both operands on the stack first, and `ADD` consumes exactly the two values a binary operator needs, leaving exactly one value (the result) behind — the stack shrinks by one net item per binary operation (two popped, one pushed), which is exactly why a valid arithmetic program always ends with precisely one value remaining on the stack, ready for `PRINT`.

**3. What is the "instruction pointer," and what happens to it normally?**

The instruction pointer (`ip`) is a single number tracking "which instruction should be fetched next" — the VM's equivalent of a bookmark in the program. In the ORDINARY (non-jumping) case, `ip` increments by exactly 1 after every instruction, so execution proceeds straight through the program in order — demonstrated in Step 2's trace, where `ip` went `0, 1, 2, 3, 4` in lockstep with each fetched instruction. Step 5's `JMP`/`JMP_IF_FALSE` are the ONLY instructions that override this default — setting `ip` to something other than "the next one" is the entire mechanism behind `if`, `while`, and every other control-flow construct in every real programming language.

---

*Phase 1 complete. Next: [Phase 2 — Core Software Engineering](../../phase-02-core-software-engineering/README.md), starting with [LAB-17 — Modules and Interfaces](../../phase-02-core-software-engineering/module-01-architecture/LAB-17-modules-and-interfaces.md)*
