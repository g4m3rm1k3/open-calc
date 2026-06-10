# Lisp-CPP Lesson Contract

**What this document is:** The lesson structure contract for the C++ Lisp Interpreter
series. Every lesson in this series is governed by this file AND by
`CURRICULUM.json` simultaneously. Neither overrides the other.

---

## §1 — Purpose

This series builds a complete Lisp interpreter in C++ from scratch — no
libraries, no shortcuts. The student starts with a compiled binary and ends
with a working interactive Lisp REPL that supports closures, tail-call
optimization, garbage collection, and a standard library written in Lisp
itself.

The project is the MIT-era foundational exercise: SICP Chapter 4's
metacircular evaluator, implemented not in Lisp but in C++, so that every
layer of abstraction is visible and owned by the student. The C++ implementation
forces the student to understand what Scheme hides: memory layout, pointer
arithmetic, scope chains as data structures, and the call stack as a physical
object.

**Tech stack:**
- Language: C++17
- Build tool: CMake 3.20+
- Compiler: GCC (g++) or Clang (clang++)
- Memory checking: AddressSanitizer (built into GCC/Clang) or Valgrind
- Profiling: gprof or perf (LAB-30 only)
- Editor: any (VSCode recommended for IntelliSense)
- Platform: Linux, macOS, or Windows (WSL2 recommended on Windows)

No external C++ libraries are used. Everything — lexer, parser, evaluator,
environment, GC — is written by the student.

---

## §2 — The Two-File Rule

Every lesson for Lisp-CPP is governed by two documents simultaneously.
Neither overrides the other. Before writing any lesson, the agent must read both.
(1) CURRICULUM.json — the lab index, concept list, tags, and visible results.
(2) This file — the concept block template, laws, naming rules, and self-check.

---

## §3 — The Tech Stack (authoritative)

```
Language:  C++17
Compiler:  g++ (GCC 11+) or clang++ (Clang 14+)
Build:     CMake 3.20+
Memory:    AddressSanitizer (-fsanitize=address) during development
Debug:     gdb or lldb
Profile:   gprof (LAB-30 only)
Libraries: C++ Standard Library only (no Boost, no external deps)
```

No lesson may introduce a library or tool not listed here without an explicit
"introducing [tool]" section in that lab.

---

## §4 — Naming Rules (non-negotiable)

| Item | Rule | Example |
|------|------|---------|
| Types (structs, classes, enums) | PascalCase | `Token`, `LispVal`, `Environment` |
| Enum values | SCREAMING_SNAKE_CASE | `TOKEN_LPAREN`, `TOKEN_NUMBER` |
| Functions (free functions) | snake_case, verb phrase | `tokenize`, `parse_expr`, `eval_expr` |
| Member functions | snake_case, verb phrase | `env.lookup()`, `env.define()` |
| Variables and parameters | snake_case | `token_list`, `current_env`, `node_ptr` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_HEAP_SIZE`, `GC_THRESHOLD` |
| Files | snake_case `.cpp` / `.h` | `lexer.cpp`, `environment.h` |
| Test files | `test_` prefix | `test_lexer.cpp`, `test_eval.cpp` |

**Domain-specific naming rules:**

- **LispVal** — All values the interpreter can produce are of type `LispVal`.
  Never call them `Value`, `Object`, or `SchemeVal`.
- **Environment** — The scope chain struct/class is always `Environment`.
  Never `Scope`, `Frame`, or `Context`.
- **Node** — AST nodes are always `Node`. The root type is `NodePtr`
  (alias for `std::unique_ptr<Node>`).
- **eval / apply** — The two core functions are always named `eval` and `apply`.
  These are the canonical SICP names and must not be renamed.

---

## §5 — The Concept Block Template (mandatory)

Every concept tagged in CURRICULUM.json must have a block in this exact format,
in this exact order, before any code that uses it. No section may be omitted.

```markdown
### Concept: [Name]

**What it is:** One sentence. The precise definition — not a metaphor, not an
analogy, the actual mechanism. If it is an abstraction, say what it abstracts.

**The problem without it:** Concrete code or situation that exists WITHOUT this
concept. Show running code that produces the wrong result, a compile error, or
a behavior the student has already seen fail. Do not describe in prose only —
show it.

**How it works:** The mechanism. Not what it does — WHY it does it that way.
The causal chain from input to output. For abstractions: what it hides, what
the raw version looks like, what invariant it protects.

**The code:** The minimal working example. Every line explained with a comment.
No unexplained syntax. No forward references. If a keyword appears that has not
been defined in a prior lab, define it here first.

**Try it differently:** An alternative the student can switch to in under 30
seconds that produces a visibly different (usually worse) result. Name the
alternative, show exactly what to change, describe what they will see. Tell
them to switch back.

**Transfer:** Where does this concept appear OUTSIDE this interpreter? One
concrete example from a completely different domain — a web server, a game
engine, a database, a graphics pipeline. Prevents the student from thinking
this is interpreter-specific.
```

For **design patterns**, add:

```markdown
**Pattern category:** Creational / Structural / Behavioral / Non-GoF
**Official name:** [Gang of Four name or established name]
**Tradeoff:** What does using this pattern cost?
```

For **math or memory formulas**, use the Math Block format instead:

```markdown
### Math: [Formula Name]

**What it computes:** One sentence.

**The real-world analogy:** Plain English before any symbols.

**The canonical example:** The simplest illustration.
  [diagram or ASCII art]
  [formula in plain text]
  [formula in C++ code]

**Why it matters here:** One sentence connecting to the upcoming code.

**Watch for:** The most common mistake.
```

---

## §6 — Lesson Structure (mandatory, in this order)

Every lesson markdown file must contain these sections in this order:

1. **Header** — series name, lab number, title, prerequisites, what this lab
   adds, time estimate
2. **What You Will Build** — exact visible end state with sample terminal output
3. **Quick Check Questions** — 2–3 questions the student should attempt before
   reading (answers at bottom)
4. **Concept Blocks** — one block per tag, in the order concepts are first used
   in the code
5. **Step-by-Step Build** — numbered steps, every step produces a compilable
   and runnable result, every step ends with a COMPILE AND RUN block
6. **What Just Happened** — one paragraph narrative connecting all steps to the
   concept blocks, written after the student has seen everything work
7. **Self-Check** — 3–5 questions the student answers from memory after the lab
8. **What's Next** — one sentence preview of the next lab
9. **Transfer Exercise** — one task applying today's concept in a non-interpreter
   context (a game, a web server, a file parser — never another Lisp)

---

## §7 — The COMPILE AND RUN Standard

This series uses terminal compilation. Every checkpoint must specify the exact
compile command and expected output.

```markdown
### COMPILE AND RUN

```bash
g++ -std=c++17 -Wall -Wextra -fsanitize=address -o lisp main.cpp
./lisp
```

You should see:
```
[exact terminal output — every character]
```

Change something: Change [specific line] to [different value]. Recompile.
You should see [specific different result]. Change it back.

What if it breaks? If you see [specific error message], it means [cause].
Fix: [specific fix].
```

A COMPILE AND RUN is invalid if:
- The compile command is not shown
- The expected output is vague
- There is no "change something" experiment
- There is no "what if it breaks?" section

---

## §8 — The C++ Discipline

These rules apply to all code in every lesson:

**No undefined behavior.** Every raw pointer is checked for null before
dereferencing. Every union access goes through the tag. Every array access is
bounds-checked in debug builds.

**Explain every keyword on first use.** `const`, `&`, `*`, `->`, `::`, `auto`,
`nullptr`, `struct`, `class`, `enum class`, `virtual`, `override`, `explicit` —
every C++ keyword that appears for the first time in the series gets a one-line
inline explanation in a comment AND a concept block if it is substantial.

**Show memory.** When introducing heap allocation, show the address. When
introducing a data structure, show how it lays out in memory with a diagram.
The student must be able to draw the memory model on paper at any point.

**No magic numbers.** Every literal that is not 0 or 1 has a named constant:
```cpp
const size_t GC_THRESHOLD = 1024; // trigger GC after this many allocations
```

**No `using namespace std;`.** Every standard library name is fully qualified:
`std::string`, `std::vector`, `std::unordered_map`. The student must always know
where a name comes from.

---

## §9 — Self-Check (agent must pass before submitting any lesson)

```
[ ] Every tag in CURRICULUM.json for this lab has a concept block in the lesson
[ ] Every concept block has all 6 sections in the correct order
[ ] Every step produces a compilable result with the exact compile command shown
[ ] No term appears before it is defined (Law 6)
[ ] Every decision names an alternative and explains the specific tradeoff (Law 9)
[ ] visibleAtEnd from CURRICULUM.json matches the terminal output shown in §2
[ ] No library is used that is not in the tech stack list (§3)
[ ] Naming rules (§4) are followed in all code examples
[ ] The Transfer exercise is not another interpreter scenario — different domain
[ ] The lesson can be completed in one sitting (under 90 minutes)
[ ] Every raw pointer is null-checked in all code examples
[ ] Every C++ keyword used for the first time has an inline explanation comment
[ ] The COMPILE AND RUN block includes: exact command, exact output, change experiment, error guide
[ ] No `using namespace std;` appears anywhere
[ ] AddressSanitizer flag (-fsanitize=address) is included in every compile command
```

---

## §10 — Concept Dependency Chain (C++ specific)

Before teaching concept B, concept A must already be taught:

```
Pointers
  requires: memory address, stack vs heap

Structs
  requires: basic types (int, char, bool), sizeof

Enums
  requires: integer types, named constants

std::vector
  requires: arrays, heap allocation, RAII concept

Recursive data structures
  requires: pointers, structs, nullptr

Parser (recursive descent)
  requires: recursive functions, structs, enums, std::vector

Tagged union
  requires: struct, enum, union keyword, sizeof

Environment (hash map)
  requires: std::unordered_map, structs, pointers, linked list concept

Closures
  requires: lambda (the concept), environment, pointers, first-class functions

Smart pointers (unique_ptr)
  requires: raw pointers, new/delete, RAII concept, destructors

Garbage collection (mark-sweep)
  requires: heap allocation, pointers, reachability concept, graph traversal

Templates
  requires: functions, type system, compile vs runtime

Virtual functions
  requires: classes, inheritance, pointers, vtable concept

std::variant
  requires: tagged union (the problem), templates, std::visit
```

If a lab needs a concept from further down this chain, every preceding concept
must already have been taught.
