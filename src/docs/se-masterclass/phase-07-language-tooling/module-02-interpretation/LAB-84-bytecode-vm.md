# SE Masterclass — LAB-84 — Bytecode and VMs

**Prerequisites:** LAB-83 (Tree-Walking Interpreter)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is re-walking the same AST node repeatedly (in a loop, say) slower than executing a flat instruction list?
2. What does a stack machine use its stack *for*, mechanically, when evaluating `2 + 3 * 4`?
3. Why does compiling `2 + 3 * 4` still need to respect the same precedence LAB-82's parser already encoded — doesn't the AST already have that solved?

## What You Will Build

A compiler that flattens Nano's AST into a linear bytecode instruction list, and a stack-machine VM that executes it — run side-by-side against LAB-83's tree-walking interpreter on the same program, producing identical results by a different route.

```
Source: 2 + 3 * 4

Bytecode:
  PUSH 2
  PUSH 3
  PUSH 4
  MUL
  ADD

VM execution (stack shown after each instruction):
  PUSH 2   -> [2]
  PUSH 3   -> [2, 3]
  PUSH 4   -> [2, 3, 4]
  MUL      -> [2, 12]
  ADD      -> [14]
```

## Concept: Bytecode Compilation

**What it is:** Instead of interpreting the AST directly (LAB-83), a bytecode compiler walks the tree *once*, ahead of time, and emits a flat sequence of simple instructions — a **stack machine** program. A stack machine VM then executes that instruction list with a simple loop: fetch the next instruction, do what it says (usually push or pop values from a stack), repeat. This is exactly LAB-16's (Phase 1) fetch-decode-execute VM, revisited here with a real compiler feeding it instead of hand-written bytecode.

**The problem before:** LAB-83's tree-walking interpreter re-visits the same AST nodes every time control flow revisits them — a `while` loop body gets re-`switch`ed on `node.type` every single iteration, even though the node's *shape* never changes between iterations. That's real, repeated overhead: the interpreter is re-deciding "what kind of node is this" over and over for code whose structure was already fully known after parsing.

**The solution:** Compile once — walk the AST a single time and emit a flat array of instructions like `PUSH`, `ADD`, `JUMP_IF_FALSE` — then execute that flat array with a tight loop that never touches the AST again. The stack machine gives every instruction one clean job: `PUSH` puts a value on a stack, `ADD` pops two values and pushes their sum, `MUL` pops two and pushes their product. Composing instructions is what recovers precedence: `2 + 3 * 4` compiles `3` and `4` and a `MUL` *before* the `ADD`, so by the time `ADD` runs, the stack already holds `2` and `12` (the already-computed product) — precedence was resolved once, at compile time, by the *order* instructions were emitted, mirroring exactly how LAB-82's parser nested `3 * 4` inside the `+` node.

**Canonical example:**

```typescript
function compile(node: Expression, instructions: Instruction[]): void {
  if (node.type === "NumberLiteral") { instructions.push({ op: "PUSH", value: node.value }); return }
  if (node.type === "BinaryExpression") {
    compile(node.left, instructions)
    compile(node.right, instructions)
    instructions.push({ op: node.operator === "+" ? "ADD" : "MUL" })
  }
}
```

**Project Application:** This is the last "core mechanics" lab before Phase 7's seven mini-projects (LAB-85–91) — several of them (the compiler in LAB-87 especially) build directly on the "walk AST, emit flat output" shape this lab establishes, just targeting JavaScript source text instead of a custom bytecode.

**Watch for:** Emitting operands to a binary operation in the wrong order. `compile(node.right)` before `compile(node.left)` for a non-commutative operator like `-` silently computes `b - a` instead of `a - b` — the stack doesn't know which value "was left" once both are pushed, so the compiler must get emission order right, since the VM has no way to check it later.

## Step 1: The instruction set

```typescript
type Instruction =
  | { op: "PUSH"; value: number | string | boolean }
  | { op: "LOAD"; name: string }
  | { op: "STORE"; name: string }
  | { op: "ADD" } | { op: "SUB" } | { op: "MUL" } | { op: "DIV" }
  | { op: "EQ" } | { op: "NEQ" } | { op: "LT" } | { op: "LTE" } | { op: "GT" } | { op: "GTE" }
  | { op: "JUMP"; target: number }
  | { op: "JUMP_IF_FALSE"; target: number }
  | { op: "POP" }
```

Every instruction is one small, unambiguous operation — this is deliberately much less expressive per-instruction than a single AST node, and that's the point: a flat instruction with no children is what makes a simple fetch-execute loop (Step 3) possible at all, trading the AST's rich structure for uniform, cheap-to-execute steps. `JUMP`/`JUMP_IF_FALSE` carry a `target` index into the instruction array — bytecode's equivalent of an AST's `IfStatement.thenBranch` pointer, but expressed as "go to instruction #N" instead of "recurse into this subtree."

### SAVE AND TRY

Hand-write the instruction list for `2 + 3 * 4` from "What You Will Build" as a plain array literal and count the instructions — 5 total (`PUSH 2`, `PUSH 3`, `PUSH 4`, `MUL`, `ADD`), confirming there's exactly one instruction per operation, with no instruction needing to "know" about any other.

## Step 2: Compiling expressions

```typescript
function compileExpression(node: Expression, instructions: Instruction[]): void {
  switch (node.type) {
    case "NumberLiteral": case "StringLiteral": case "BooleanLiteral":
      instructions.push({ op: "PUSH", value: node.value })
      return
    case "Identifier":
      instructions.push({ op: "LOAD", name: node.name })
      return
    case "BinaryExpression": {
      compileExpression(node.left, instructions)
      compileExpression(node.right, instructions)
      const opMap: Record<string, Instruction["op"]> = {
        "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV",
        "==": "EQ", "!=": "NEQ", "<": "LT", "<=": "LTE", ">": "GT", ">=": "GTE",
      }
      instructions.push({ op: opMap[node.operator] } as Instruction)
      return
    }
    case "AssignmentExpression":
      compileExpression(node.value, instructions)
      instructions.push({ op: "STORE", name: node.name })
      return
  }
}
```

`BinaryExpression` compiles its `left`, then its `right`, then emits the operator instruction *last* — that emission order is exactly what the concept section's `2 + 3 * 4` example depends on: children are fully compiled (and will run) before the operator that combines them, so by the time `ADD`/`MUL` executes at runtime, its operands are already sitting on the stack waiting.

### SAVE AND TRY

```typescript
const ast = new Parser(new Lexer("2 + 3 * 4").tokenize()).parseExpression()
const instructions: Instruction[] = []
compileExpression(ast, instructions)
console.log(instructions.map(i => i.op))
// ["PUSH", "PUSH", "PUSH", "MUL", "ADD"]
```

`MUL` appears *before* `ADD` in the flat list, even though `+` is the outermost node in the AST — confirming compilation naturally produces a "children before parent" (post-order) instruction sequence.

## Step 3: The stack machine VM

```typescript
class VM {
  private stack: (number | string | boolean)[] = []
  private variables = new Map<string, number | string | boolean>()

  run(instructions: Instruction[]): void {
    let pc = 0 // program counter -- which instruction runs next
    while (pc < instructions.length) {
      const instruction = instructions[pc]

      switch (instruction.op) {
        case "PUSH": this.stack.push(instruction.value); pc++; break
        case "LOAD": this.stack.push(this.variables.get(instruction.name)!); pc++; break
        case "STORE": this.variables.set(instruction.name, this.stack[this.stack.length - 1]); pc++; break
        case "POP": this.stack.pop(); pc++; break

        case "ADD": { const b = this.stack.pop() as number, a = this.stack.pop() as number; this.stack.push(a + b); pc++; break }
        case "SUB": { const b = this.stack.pop() as number, a = this.stack.pop() as number; this.stack.push(a - b); pc++; break }
        case "MUL": { const b = this.stack.pop() as number, a = this.stack.pop() as number; this.stack.push(a * b); pc++; break }
        case "DIV": { const b = this.stack.pop() as number, a = this.stack.pop() as number; this.stack.push(a / b); pc++; break }

        case "LT": { const b = this.stack.pop() as number, a = this.stack.pop() as number; this.stack.push(a < b); pc++; break }
        case "EQ": { const b = this.stack.pop(), a = this.stack.pop(); this.stack.push(a === b); pc++; break }

        case "JUMP": pc = instruction.target; break
        case "JUMP_IF_FALSE": pc = this.stack.pop() ? pc + 1 : instruction.target; break

        default: pc++
      }
    }
  }

  top(): number | string | boolean { return this.stack[this.stack.length - 1] }
}
```

This `pc`/`while` loop is LAB-16's fetch-decode-execute cycle again, unchanged in structure: read the instruction at `pc`, act on it, advance `pc` (or, for jumps, *set* `pc` directly instead of incrementing — which is the entire mechanism behind loops and conditionals in bytecode: control flow is just "assign a different value to `pc`"). Binary operators pop `b` before `a` (`b = pop()`, then `a = pop()`) because the stack is LIFO — `right` was pushed last by Step 2's compiler, so it comes off first, and `a - b` must read `a` as the operand pushed *first* to get subtraction's argument order correct.

### SAVE AND TRY

```typescript
const vm = new VM()
vm.run(instructions) // from Step 2's "2 + 3 * 4" compilation
console.log(vm.top()) // 14
```

Compare this to `evaluate(ast, new Environment())` from LAB-83 on the identical source — both should produce `14`, via completely different execution strategies (recursive tree evaluation vs. a flat instruction loop).

## Step 4: Compiling control flow — jumps as the AST's structure, flattened

```typescript
function compileStatement(node: Statement, instructions: Instruction[]): void {
  switch (node.type) {
    case "ExpressionStatement":
      compileExpression(node.expression, instructions)
      instructions.push({ op: "POP" }) // discard the unused result
      return

    case "LetStatement":
      compileExpression(node.initializer, instructions)
      instructions.push({ op: "STORE", name: node.name })
      instructions.push({ op: "POP" })
      return

    case "IfStatement": {
      compileExpression(node.condition, instructions)
      const jumpIfFalseIndex = instructions.length
      instructions.push({ op: "JUMP_IF_FALSE", target: -1 }) // patched below

      compileStatement(node.thenBranch, instructions)

      if (node.elseBranch) {
        const jumpOverElseIndex = instructions.length
        instructions.push({ op: "JUMP", target: -1 }) // patched below
        ;(instructions[jumpIfFalseIndex] as any).target = instructions.length
        compileStatement(node.elseBranch, instructions)
        ;(instructions[jumpOverElseIndex] as any).target = instructions.length
      } else {
        ;(instructions[jumpIfFalseIndex] as any).target = instructions.length
      }
      return
    }

    case "WhileStatement": {
      const loopStart = instructions.length
      compileExpression(node.condition, instructions)
      const jumpIfFalseIndex = instructions.length
      instructions.push({ op: "JUMP_IF_FALSE", target: -1 }) // patched below

      compileStatement(node.body, instructions)
      instructions.push({ op: "JUMP", target: loopStart }) // back edge -- this IS the loop

      ;(instructions[jumpIfFalseIndex] as any).target = instructions.length
      return
    }

    case "BlockStatement":
      node.statements.forEach(s => compileStatement(s, instructions))
      return
  }
}
```

This is called **backpatching**: the compiler emits a jump instruction with a placeholder `target: -1` *before* it knows how many instructions the branch it's jumping over will take, then goes back and fills in the real index once that branch has been fully compiled and its length is known. `WhileStatement`'s `JUMP` back to `loopStart` is the entire mechanism of looping in bytecode — there's no `while` construct in the VM at all, just "jump backward to re-check the condition," which is a direct, flattened translation of the AST's recursive `WhileStatement.body` structure into a linear "go back to instruction N" instruction.

### SAVE AND TRY

```typescript
const source = "let total = 0; let i = 0; while (i < 3) { total = total + i; i = i + 1; }"
const ast = new Parser(new Lexer(source).tokenize()).parseProgram()
const instructions: Instruction[] = []
ast.statements.forEach(s => compileStatement(s, instructions))

const vm = new VM()
vm.run(instructions)
console.log((vm as any).variables.get("total")) // 3  -- 0+1+2
```

Compare against LAB-83's tree-walking interpreter on the identical source (same `total` result, `3`) — same program, same answer, one via re-walking the tree every loop iteration, the other via jumping backward through a flat, pre-compiled instruction list.

## 🎯 Challenge

Add a simple "instructions executed" counter to the VM (`instructionCount++` on every loop iteration of `run`), and compare it against a similarly instrumented count of "AST node visits" in LAB-83's `evaluate`/`execute` for the same `while`-loop program from Step 4's SAVE AND TRY. Confirm the two counts are in the same ballpark (bytecode isn't magic — it still does comparable *work*, it's the per-step overhead of re-dispatching on `node.type` that the flat instruction loop removes).

<details>
<summary>Solution</summary>

```typescript
class VM {
  instructionCount = 0
  // ...
  run(instructions: Instruction[]): void {
    let pc = 0
    while (pc < instructions.length) {
      this.instructionCount++
      const instruction = instructions[pc]
      // ...unchanged switch...
    }
  }
}

// Instrument LAB-83's evaluate/execute similarly:
let nodeVisitCount = 0
function evaluate(node: Expression, env: Environment): NanoValue {
  nodeVisitCount++
  switch (node.type) { /* ...unchanged... */ }
}
```

Both counters end up roughly proportional to the loop's iteration count times the work per iteration — the real-world win of bytecode isn't "doing less work," it's that each VM instruction is a flat array index + a `switch` on a small enum, which is cheaper per-step than re-walking and re-dispatching on a tree node's `type` field, especially once a real implementation adds inline caching or a jump table.

</details>

## Mental Model

| Concept | Tree-walking interpreter (LAB-83) | Bytecode VM (this lab) |
|---|---|---|
| When work happens | Every time a node is visited, every iteration | Once, at compile time — then execution just runs flat instructions |
| Control flow | Recursive function calls (`execute` calling itself) | `pc` jumps (`JUMP`, `JUMP_IF_FALSE`) |
| Where values live | JS call stack + `NanoValue` returns | An explicit `stack` array inside the VM |
| Precedence | Encoded in AST nesting | Encoded in instruction *emission order* |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does the compiler emit a `BinaryExpression`'s operator instruction after both operands, not before? | |
| 2 | What is backpatching, and why does `IfStatement` compilation need it? | |
| 3 | What single instruction pattern implements looping in this VM, with no dedicated "loop" instruction at all? | |

## Quick Check Answers

1. Re-walking a tree means re-running the `switch (node.type)` dispatch on the same node structure every time control revisits it (e.g. every loop iteration); a flat instruction list, once compiled, needs no further dispatch on node *kind* — only a cheap array-index fetch.
2. It provides values (or expects them) via a shared stack: operands are pushed by earlier instructions, an operator pops the values it needs and pushes its result, so the stack is the sole channel through which sub-computations pass values to the operations that combine them.
3. Yes — the AST already encodes correct precedence through nesting, but the compiler must still walk that nested structure in the right order (children before parent) when *emitting* flat instructions, or the flattened instruction sequence would lose the ordering the AST had encoded structurally.

*Next: [LAB-85 — Template Engine](../module-03-mini-projects/LAB-85-template-engine.md)*
