# Lesson 26 — Running Rust

## What You Will Build

Rust code blocks compile with `rustc` and run. A `println!("hello")` snippet works without
the student writing `fn main()`. Borrow checker errors — the errors Rust is famous for —
appear in full in the stderr panel. The student reads a real ownership error and understands
what it means. The output panel makes Rust's famously detailed compiler messages readable.

---

## What You Need to Know First

- Lesson 25: `CExecutor`, two-step compilation, signal handling in `runProcess`
- Lesson 6: `LocalExecutor`, temp files, the `Executor` interface

---

## The Lesson

### Step 1 — Rust's Compilation Model

Rust is compiled. Like C, you cannot run Rust source directly — `rustc file.rs` compiles
the source to a native binary. Unlike C, there is no linker invocation to worry about for
single-file programs: `rustc main.rs` produces an executable called `main` (or `main.exe`
on Windows) in the current directory.

**Why Rust is different from C:**
Rust's compiler is not just a code generator — it is a proof checker. Before producing
a binary, `rustc` verifies three guarantees:
- **Memory safety:** No null pointer dereferences, no buffer overflows (at compile time).
- **Thread safety:** Data races are detected at compile time and rejected.
- **Resource management:** Every resource (file, socket, allocation) is freed exactly once.

These guarantees come from Rust's **ownership system** — a set of rules enforced by the
compiler. No runtime garbage collector is needed because the compiler proves at compile time
when each value can be freed.

**The borrow checker:**
The borrow checker is the part of the Rust compiler that enforces ownership rules. It
rejects code that would cause a use-after-free, double-free, or data race. The error
messages are deliberately verbose — they explain *what* rule was violated and *why*, often
with a suggestion for how to fix it.

**CS lens:** Rust's approach is a trade-off: harder to write (the compiler rejects more code
than C or Python) but safer to run (entire classes of runtime bugs are impossible). For a
learning environment, the borrow checker errors are pedagogically valuable — the student
sees exactly what ownership violation they made, not a crash at runtime.

### Step 2 — The Rust Executor

```typescript
// packages/executor/src/RustExecutor.ts
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { Executor, ExecutionOptions, ExecutionResult } from './types'
import { runProcess } from './runProcess'

const FN_MAIN_PREAMBLE = `fn main() {\n`
const FN_MAIN_SUFFIX = `}\n`

function wrapSnippet(code: string): string {
  const hasMain = /\bfn\s+main\s*\(\s*\)/.test(code)
  if (hasMain) return code

  // Wrap the snippet in fn main()
  const indented = code
    .split('\n')
    .map(line => (line.length > 0 ? `    ${line}` : line))
    .join('\n')

  return `${FN_MAIN_PREAMBLE}${indented}\n${FN_MAIN_SUFFIX}`
}

export class RustExecutor implements Executor {
  readonly name = 'rust-local'

  canHandle(language: string): boolean {
    return language === 'rust' || language === 'rs'
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code, timeoutMs = 30_000 } = options
    const wrappedCode = wrapSnippet(code)
    const id = Date.now()
    const sourceFile = join(tmpdir(), `codex_rust_${id}.rs`)
    const binaryFile = join(tmpdir(), `codex_rust_${id}`)

    await writeFile(sourceFile, wrappedCode, 'utf-8')

    try {
      // Step 1: compile
      const compileResult = await runProcess('rustc', [
        '--edition', '2021',
        '-o', binaryFile,
        sourceFile,
      ], 30_000)

      if (compileResult.exitCode !== 0) {
        return {
          ...compileResult,
          stderr: ['[Compile error — Rust borrow checker or type error]', ...compileResult.stderr],
        }
      }

      // Step 2: run
      return await runProcess(binaryFile, [], timeoutMs)
    } finally {
      await unlink(sourceFile).catch(() => {})
      await unlink(binaryFile).catch(() => {})
    }
  }
}
```

**`--edition 2021` explained:**
Rust releases a new "edition" every three years. Each edition can introduce language changes
that would otherwise be backwards-incompatible. The default edition when you install the
compiler may be older than 2021. Specifying `--edition 2021` ensures the student gets
current Rust features (like the improved `IntoIterator` for arrays) regardless of when
they installed `rustc`.

**30-second timeout:**
Rust compilation is slower than C compilation for complex programs (the borrow checker does
significant work). For simple snippets, compilation is fast. The 30-second timeout is generous
to handle occasional slow compilation on old machines.

**Snippet detection:**
The regex `/\bfn\s+main\s*\(\s*\)/` matches `fn main()` with optional whitespace. It uses
`\b` (word boundary) to avoid matching `fn not_main()`. If no `fn main()` is found, the
snippet's statements are wrapped in `fn main()`.

### Step 3 — Reading Rust Error Messages

Rust's error messages are structured and detailed. Example for a borrow error:

```
error[E0596]: cannot borrow `s` as mutable, as it is not declared as mutable
 --> /tmp/codex_rust_123.rs:2:5
  |
1 |     let s = String::from("hello");
  |         - help: consider changing this to be mutable: `mut s`
2 |     s.push_str(", world");
  |     ^ cannot borrow as mutable
```

Each error has:
- An error code (`E0596`) — searchable in the Rust error index
- The exact file and line number
- A visual pointer to the problematic code
- A `help:` suggestion for how to fix it

The stderr panel in Codex renders these verbatim, preserving the ASCII-art pointers and
the `help:` suggestions. Because the student is viewing the error next to the code they
wrote (the Monaco editor is above the output panel), the context switch is minimal.

**The most common errors students encounter:**

1. **Not mutable (`E0596`):** `let s = String::new(); s.push_str("hello");`
   Fix: `let mut s = String::new();`

2. **Use after move (`E0382`):** `let s = String::from("hello"); let t = s; println!("{}", s);`
   Fix: `let s = String::from("hello"); let t = s.clone(); println!("{}", t);`

3. **Borrow while borrowed (`E0502`):** Reading and mutating the same variable at the same time.

These errors are *learning content*, not obstacles. The output panel that shows them is a
classroom blackboard.

### Step 4 — Register Rust and Update RUNNABLE_LANGUAGES

In `packages/executor/src/index.ts`:
```typescript
export { RustExecutor } from './RustExecutor'
```

In `apps/electron/src/main.ts`:
```typescript
import { LocalExecutor, GoExecutor, CExecutor, RustExecutor } from '@codex/executor'
const executors = [new LocalExecutor(), new GoExecutor(), new CExecutor(), new RustExecutor()]
```

In `packages/renderer/src/CodeBlock.tsx`:
```typescript
export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'go',
  'c',
  'rust', 'rs',
])
```

Add to `MONACO_LANGUAGE_MAP`:
```typescript
rust: 'rust',
rs: 'rust',
```

### Step 5 — Test Cases

**Hello world snippet:**
```rust
println!("hello from Rust");
```
Expected: `hello from Rust`

**Complete program:**
```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("sum = {}", sum);
}
```

**Borrow checker error:**
```rust
let s = String::from("hello");
let t = s;
println!("{}", s);
```
Expected: `[Compile error — Rust borrow checker or type error]` followed by the full E0382 message.

---

## Security: Rust's Safety Guarantees Do Not Sandbox Execution

A common misconception: Rust's ownership system and borrow checker prevent memory safety
bugs. They do not sandbox what a Rust program *does* at runtime.

A safe Rust program can:
- Read any file the user can read: `std::fs::read_to_string("/etc/passwd")`
- Make HTTP requests: `reqwest::get("https://external.com")`
- Spawn child processes: `std::process::Command::new("rm").arg("-rf").spawn()`

Rust's guarantees eliminate *unintentional* bugs — buffer overflows, use-after-free,
data races. Intentional code is not affected. A Rust block in a curriculum you did not
write can do everything a C block can do, with the advantage that it is less likely to
accidentally crash.

**The mitigations** are identical to Lessons 24 and 25: 30-second timeout (Rust compilation
takes longer), process isolation, and the trust model. The Docker executor with
`--network none` is the sandboxed alternative.

**Why this is still worth teaching:** Rust's safety guarantees mean that *accidental*
memory corruption — which is responsible for the majority of real-world C security
vulnerabilities (CVEs, buffer overflows in network parsers, etc.) — is impossible in
safe Rust. The lesson here is that "memory safe" and "sandboxed" are different properties.
A language can be memory safe and still have full OS access.

---

## Connect the Pieces

The Rust executor completes the local executor set for compiled languages: Go, C, and Rust
all compile to native binaries via `runProcess`. In Lesson 13's fallback chain, Rust has no
WASM tier (there is no production-ready `rustc`-in-WASM), so it falls directly to Tier 3
(Docker) if `rustc` is not installed. Lesson 18 wires up the Docker executor that serves
as Tier 3 for both Go and Rust.

The borrow checker errors visible in the output panel are a feature of the curriculum, not
a side effect. A future lesson on Rust's ownership model will deliberately show these errors
as examples — the student runs the code, reads the error, and understands the rule.

---

## What Breaks Without This

Without the `--edition 2021` flag, code that uses edition-2021 features (like iterating
directly over an array without `.iter()`) produces a confusing error about "IntoIterator
not implemented." The edition flag makes this a non-issue: the compiler targets the
version of Rust the lesson was written for.

---

## Definition of Done

- [ ] `println!("hello")` in a Rust snippet outputs `hello`
- [ ] A complete Rust program with `fn main()` runs unchanged
- [ ] A borrow error shows the full `rustc` error message including the `help:` line
- [ ] A compile error is clearly labelled as `[Compile error]` in the output
- [ ] The Rust Monaco editor has Rust syntax highlighting
- [ ] You can answer: what is the borrow checker?
- [ ] You can answer: why does Rust not have a garbage collector?
- [ ] `git commit` with a message explaining why
