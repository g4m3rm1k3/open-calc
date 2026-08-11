# Lesson 81: The Step Python Skips Entirely — Source to Binary

**What you will build:** the same "hello world" program, taken through
every real stage of C compilation by hand — preprocessing, compiling
to assembly, assembling to object code, and linking to a final
executable — using the actual tools (`gcc`, `nm`, `file`) at each
step, plus two genuinely different failure modes (a compile error and
a link error) proven to happen at different stages. The working
feature is a compiled program that runs. The transferable insight:
every one of these stages has been happening invisibly, every single
time `gcc file.c -o program` was typed as one command — this lesson
doesn't add new behavior, it makes visible a pipeline that was always
there.

**What you need to know first:** nothing from a specific earlier
lesson — this is the deliberate start of Track 13, building on the
general OS-level comfort from Track 1 (processes, how a program
actually starts and runs) rather than any one specific prior lesson.
Track 13 is new: everything from here through its end is C or Rust,
not Python, and the differences that follow are the entire point.

---

## Concept Unit: The Problem — Python Hides This Completely

### The Problem

Running a Python script is one step: `python3 script.py`. Nothing
separate compiles first, nothing extra gets produced on disk, and
there's no moment where "the code" and "the running program" are
observably different things. C makes every one of those steps real,
separate, and inspectable — and understanding what each one does is
the actual subject of this lesson.

### The New Code

```python
print("hello from Python")
```

### Run It

```
$ python3 lab1_python_baseline.py
hello from Python
$ ls
lab1_python_baseline.py
```

One command, one file before, the same one file after — nothing was
produced, nothing was left behind. This is genuinely different from
what's about to happen with C, not just a difference in syntax.

### CS Lens

Python is called an **interpreted language** in casual use, though the
more precise fact is that its reference implementation (CPython)
compiles source to an intermediate bytecode internally, then
interprets *that* — invisibly, in memory, with no separate file a
person normally sees. C is a **compiled language** in a much more
literal, visible sense: a real, separate program (the compiler)
translates C source all the way down to a real, separate file (a
binary the operating system can execute directly) — and every
intermediate stage along that path is a real file this lesson is about
to produce and inspect.

---

## Concept Unit: A C Program Cannot Simply Be Run

### The Problem

Before touching the compilation pipeline at all, it's worth confirming
directly: unlike a Python script, a `.c` file cannot be executed on its
own, under any circumstances. Proving this concretely, rather than
just stating it, sets up exactly what compilation has to accomplish.

### The New Code

```c
#include <stdio.h>

int main() {
    printf("hello from C\n");
    return 0;
}
```

### Run It

```
$ ./hello.c
/bin/sh: ./hello.c: Permission denied
exit code: 126
```

The operating system refused outright — a `.c` file has no execute
permission by default, and even if it did, the OS has no idea how to
run raw C source text as instructions; it isn't machine code, and
nothing about the file format tells the OS to try interpreting it as
anything.

### Mechanical Walkthrough

- `#include <stdio.h>` — **first appearance of a C preprocessor
  directive.** This is not a Python-style import that runs at
  program-start; it's an instruction to the *compiler's preprocessor*,
  a step that runs *before* real compilation even begins, textually
  pasting in declarations from the C standard library's I/O header —
  covered concretely in the next unit.
- `int main() { ... }` — **first appearance of C's actual program
  entry point.** Unlike Python (where top-level statements just run in
  file order), a C program's execution always begins at a function
  specifically named `main` — the operating system, once it loads a
  compiled binary, looks for and calls this exact function to start
  the program.
- `printf("hello from C\n");` — a function call, syntactically similar
  to Python, but note the `;` — **first appearance of the statement
  terminator this lesson's later "what breaks" section deliberately
  omits** to trigger a real compile error.
- `return 0;` — **first appearance of a program-level return value.**
  `main`'s return value becomes the whole program's exit code — `0`
  conventionally means success, already familiar in spirit from
  Lesson 79's `sys.exit(2)` signaling a specific kind of failure; here
  the convention is the same, just at the level of an entire compiled
  program instead of one Python script.

### CS Lens

Refusing to execute a plain text file as a program, unless it's
already been transformed into a format the OS specifically understands
(a binary with the right structure and permissions), is not a
C-specific rule — it's how every operating system's process-launching
mechanism works. Also recognized in: a `.txt` file refusing to "run,"
Lesson 61's own hex/binary viewer work distinguishing readable text
from a file's actual byte-level structure, and the very fact that a
Python script *can* be run directly only because `python3` itself is
already a compiled binary, cooperating with the OS to interpret the
`.py` file's text on the script's behalf.

---

## Concept Unit: Preprocessing — Before Real Compilation Begins

### The Problem

`#include <stdio.h>` referenced a whole separate file's worth of
declarations (for `printf`, among many others) — nothing about that
line is valid C syntax on its own; something has to expand it into
real code *before* the compiler proper ever sees it.

### The New Code

```
gcc -E hello.c -o hello.i
```

### Run It

```
$ wc -l hello.i
819 hello.i
$ tail -10 hello.i
# 983 "/usr/include/stdio.h" 3 4

# 2 "hello.c" 2


# 3 "hello.c"
int main() {
    printf("hello from C\n");
    return 0;
}
```

**819 lines**, expanded from a 5-line source file. Almost all of it is
declarations pulled in from `stdio.h` and the headers *it* includes in
turn — real proof that `#include` is a literal textual expansion, not
a lightweight reference the way Python's `import` is. The original
5 lines of `hello.c` are still recognizable, unchanged, right at the
very end.

### Mechanical Walkthrough

- `gcc -E hello.c -o hello.i` — **first appearance of a compiler flag
  used to stop the pipeline early**, deliberately, purely to inspect
  an intermediate stage. `-E` tells `gcc` to run *only* the
  preprocessor and stop — no actual compilation happens yet. `.i` is
  the conventional file extension for preprocessed C source.
- The `# 983 "/usr/include/stdio.h" 3 4` lines scattered through the
  output are **line markers** — the preprocessor's way of recording
  "this expanded text originally came from this file, at this line
  number" — so that if a later stage reports an error, it can still
  point back at the *original* source location, not some arbitrary
  line deep inside the 819-line expanded file.

### CS Lens

Textually expanding references before real processing begins is a
distinct phase from parsing or executing, worth recognizing as its own
category. Also recognized in: a templating engine expanding `{% include %}`
directives before rendering a page, a build tool resolving `@import`
statements in CSS before bundling, and — a direct, deliberate contrast
worth naming — Python's own `import` mechanism, which does *not* work
this way: importing a module in Python loads and runs a separate
compiled/interpreted unit at runtime, never textually pastes another
file's source into the importing file the way `#include` does.

---

## Concept Unit: Compiling to Assembly

### The Problem

Preprocessed C is still C — human-readable, high-level syntax. The
actual translation toward something a CPU can execute happens next:
turning that C into **assembly**, a much lower-level, still
human-readable representation of the exact CPU instructions the
program will eventually run.

### The New Code

```
gcc -S hello.i -o hello.s
```

### Run It

```
$ cat hello.s
	.file	"hello.c"
	.text
	.section	.rodata
.LC0:
	.string	"hello from C"
	.text
	.globl	main
	.type	main, @function
main:
.LFB0:
	.cfi_startproc
	endbr64
	pushq	%rbp
	movq	%rsp, %rbp
	leaq	.LC0(%rip), %rax
	movq	%rax, %rdi
	call	puts@PLT
	movl	$0, %eax
	popq	%rbp
	ret
	.cfi_endproc
...
```

(Trimmed for length — the real file also includes some standard
debug/security metadata directives, unimportant to what's being
demonstrated here.)

### Mechanical Walkthrough

- `gcc -S hello.i -o hello.s` — **first appearance of stopping the
  pipeline at the assembly stage.** `-S` runs preprocessing and
  compilation, but stops before assembling into machine code — `.s`
  is the conventional extension for assembly source.
- `.LC0: .string "hello from C"` — the string literal from the C
  source, stored in a labeled location — worth noting concretely:
  even a single string constant gets its own explicit, named storage
  location at this level; nothing is implicit the way a Python string
  literal is.
- `call puts@PLT` — **one genuinely surprising, real detail worth
  stopping on.** The C source called `printf`, but the generated
  assembly calls `puts` instead. This is a real compiler optimization,
  not an error: `gcc` recognized that this specific `printf` call had
  no format specifiers beyond a single trailing newline, and replaced
  it with a call to `puts` (which appends a newline automatically and
  has less overhead than `printf`'s general-purpose formatting logic)
  — a genuine, observable instance of a compiler transforming code
  into something behaviorally identical but more efficient, entirely
  invisible from the C source alone.
- The rest (`pushq %rbp`, `movq`, `leaq`, `ret`, and similar) are real
  x86-64 assembly instructions — not meant to be memorized here, just
  recognized as: this is genuinely what "a running program" is, all
  the way down — direct, sequential CPU instructions, with nothing
  higher-level like a "function call" existing at this level except as
  a `call` instruction plus a convention (the stack, `%rbp`) for how
  arguments and return addresses are tracked.

### CS Lens

Assembly is the last stage where a human can still meaningfully read
the actual instructions a CPU will execute — one more translation step
(assembling) turns this into raw binary opcodes with no textual form
at all. Also recognized in: this being exactly the representation
Lesson 61's hex/binary viewer work eventually bottoms out at
(compiled machine code, viewed as raw bytes, is assembly's
instructions with all the human-readable mnemonics stripped away), and
disassemblers (tools that reconstruct *approximate* assembly from
compiled binaries, the reverse direction of this exact stage).

---

## Concept Unit: Assembling to an Object File

### The Problem

Assembly is still text — readable instructions, but not yet the actual
binary machine code a CPU executes, and still not something the OS can
run directly.

### The New Code

```
gcc -c hello.s -o hello.o
```

### Run It

```
$ file hello.o
hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
$ ./hello.o
/bin/sh: ./hello.o: Permission denied
exit code: 126
```

The object file is genuinely binary now (confirmed by `file`, which
recognizes the **ELF** format — Linux's standard binary format) — but
it *still* can't be run directly, and `file` says exactly why in one
word: **relocatable**, not executable.

### Mechanical Walkthrough

- `gcc -c hello.s -o hello.o` — **first appearance of the `-c` flag**,
  running preprocessing, compilation, *and* assembly, but stopping
  before the final step. `-c` is the one intermediate-stage flag
  genuinely common in everyday use (unlike `-E` or `-S`, mostly used
  for teaching or debugging) — it's how large C projects compile many
  source files independently, before combining them, covered directly
  next.
- `file hello.o` reporting **"relocatable"** — a real, specific,
  meaningful term: this file contains real machine code, but every
  memory address inside it is provisional, written as "figure this out
  later, relative to wherever this code eventually ends up" — because
  at this stage, the compiler has no idea what *other* code (like the
  real implementation of `puts`, living in the C standard library) it
  will eventually be combined with, or at what memory addresses.

### CS Lens

Producing real machine code with addresses left deliberately unresolved,
to be filled in during a later, separate step, is what makes
**separate compilation** possible at all — the ability to compile many
source files independently (in parallel, even, on different machines)
and combine them afterward, rather than needing an entire program's
source in one place at once. Also recognized in: separately compiled
libraries in any language with a compiled step, dynamically linked
shared libraries (`.so`/`.dll` files) resolved at *program startup*
rather than compile time, and even Lesson 78's `MiniGit` commits,
which similarly reference other objects (parent commits) by an
identifier resolved *later*, at read time, rather than embedding the
referenced content directly.

---

## Concept Unit: Linking — Resolving What's Still Missing

### The Problem

`hello.o` contains real machine code for `main`, but `main` calls
`puts` — and `hello.o` has no idea where `puts`'s actual implementation
lives; that code is part of the C standard library, compiled entirely
separately, long before this program ever existed. Something has to
find it and connect the two.

### The New Code

```
nm hello.o
```

### Run It

```
0000000000000000 T main
                 U puts
```

`nm` lists an object file's **symbols** — named things it defines or
needs. `T main` means `main` is defined here (`T` = "in the text/code
section"), with a real address. `U puts` means `puts` is **undefined**
— referenced, but not resolved — exactly the "figure this out later"
gap the previous unit's "relocatable" label was describing concretely.

Linking is the step that closes this gap:

```
gcc hello.o -o hello_linked
```

```
$ file hello_linked
hello_linked: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ...
$ ./hello_linked
hello from C
```

Now genuinely executable — `file` confirms it (no more "relocatable"),
and it runs, producing the real output.

### One Real Detail Worth Confirming Directly

By default, `gcc` produces a **dynamically linked** executable —
`puts`'s actual code isn't copied into `hello_linked` at all; instead,
the executable records that it needs `puts`, and the *operating
system's own dynamic linker* resolves and loads it at the moment the
program actually starts running, from a shared C library file already
present on the system. This can be proven directly by forcing full
**static** linking instead — copying everything needed directly into
the binary — and comparing:

```
gcc -static hello.o -o hello_static
nm hello_static | grep -w puts
```

```
0000000000404d30 W puts
```

No more `U` — `puts` now has a real address (`0000000000404d30`)
baked directly into `hello_static`'s own machine code, because static
linking copied the actual implementation in, rather than leaving a
reference for the OS to resolve later.

### Mechanical Walkthrough

- `nm hello.o` — **first appearance of a symbol table inspection
  tool.** Every object file and executable carries a table of the
  names it defines and the names it still needs — `nm` reads and
  prints that table directly, making an otherwise invisible internal
  bookkeeping structure something a person can actually look at.
- `T main` vs `U puts` — the single-letter codes are meaningful:
  a capital letter generally means "defined here, in this section of
  the file"; `U` specifically means "used but not defined here" —
  exactly the gap linking exists to close.
- `gcc hello.o -o hello_linked` — invoked with no special flags at
  all, this is **linking**, the final pipeline stage: find every `U`
  symbol's actual definition (searching standard system library
  locations automatically, for something as ubiquitous as `puts`), and
  either patch in its resolved address directly (static linking) or
  record enough information for the OS to resolve it at startup
  (dynamic linking, the default).

### CS Lens

Deferring symbol resolution until the very last possible moment —
sometimes all the way to program startup, in the dynamic-linking
case — trades a small runtime cost (resolving addresses each time the
program starts) for real, substantial benefits: multiple programs on
the same system can share one copy of a common library in memory
(rather than each carrying its own private copy, as static linking
would produce), and a security patch to that shared library benefits
every program using it without any of them needing to be recompiled.

---

## What Breaks Without This — Two Genuinely Different Failures

### A Compile-Time Error

```c
#include <stdio.h>

int main() {
    printf("missing semicolon")
    return 0;
}
```

```
$ gcc broken_syntax.c -o broken_syntax
broken_syntax.c: In function 'main':
broken_syntax.c:4:32: error: expected ';' before 'return'
    4 |     printf("missing semicolon")
      |                                ^
      |                                ;
    5 |     return 0;
      |     ~~~~~~
exit code: 1
```

A genuine syntax error, caught during **compilation** — before assembly,
before linking, before any object file even exists. The error message
correctly points at line 4, column 32, and even helpfully suggests
where the missing `;` belongs.

### A Link-Time Error

```c
#include <stdio.h>

int mystery_function(int x);   // declared, but never actually defined anywhere

int main() {
    printf("about to call it\n");
    int result = mystery_function(5);
    printf("result: %d\n", result);
    return 0;
}
```

```
$ gcc -c broken_link.c -o broken_link.o
compile exit code: 0
$ gcc broken_link.o -o broken_link
/usr/bin/ld: broken_link.o: in function `main':
broken_link.c:(.text+0x21): undefined reference to `mystery_function'
collect2: error: ld returned 1 exit status
link exit code: 1
```

This is the concrete, load-bearing proof of everything this lesson
built: `mystery_function` is **declared** (its name and signature are
known to the compiler, satisfying C's rules for calling it), so
compiling to an object file succeeds completely — exit code `0`,
confirmed directly, not assumed. It's only at the *separate* linking
step, when `ld` (the actual linker program `gcc` invokes on this
lesson's behalf) goes looking for `mystery_function`'s real
implementation and finds nothing, that the failure occurs — a
genuinely different tool, at a genuinely different pipeline stage,
producing a genuinely different kind of error message
(`undefined reference`, not a syntax complaint) than the compile
error above.

## Exercises

- Deliberately break `hello.c` at each stage in turn — a preprocessor
  error (`#include <does_not_exist.h>`), a type error the compiler
  catches, and a linker error like the one above — and confirm which
  of `gcc -E`, `gcc -S`/`-c`, or full `gcc` first reports each one.
- Compare the file sizes of `hello` (dynamically linked) and
  `hello_static` (statically linked) directly — research why the
  static version is dramatically larger.
- Use `objdump -d hello.o` to view the object file's actual disassembled
  machine code instructions, and compare it against `hello.s`'s
  human-written assembly — confirm they represent the same program.
- Research `gcc -O2` (optimization level 2) and compare the generated
  assembly (`gcc -O2 -S hello.c -o hello_opt.s`) against this lesson's
  unoptimized version — look specifically for what changed around the
  `printf`-to-`puts` substitution already observed here.

## Definition of Done

- [ ] `hello.c` compiled and run through the full pipeline —
      `-E`, `-S`, `-c`, and final linking — each intermediate file
      (`hello.i`, `hello.s`, `hello.o`) actually produced and inspected
      on your own machine.
- [ ] Confirmed directly, with `file`, that `hello.o` is "relocatable"
      while the final linked binary is not.
- [ ] `nm hello.o` run for real, confirming `puts` shows as `U`
      (undefined) before linking.
- [ ] The static-vs-dynamic linking comparison run for real, confirming
      `puts` gets a real address in the statically linked binary's
      symbol table but not the dynamically linked one's.
- [ ] Both failure modes reproduced on your own machine: a compile
      error (with a specific line/column) and a link error (with
      `gcc -c` succeeding first, confirmed by its own exit code, before
      the link step fails separately).
- [ ] Can explain out loud, without looking at the code, why a `.c`
      file cannot simply be executed the way a `.py` file can.
- [ ] Committed both `hello.c` and a note of the exact `gcc` commands
      used at each stage — the commands are as much the artifact of
      this lesson as the code itself.
