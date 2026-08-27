# Lesson 27: Linking — Object Files, Symbol Resolution, and Shared Libraries

What you will build: The reader will understand what the linker does: how it resolves symbols across object files, how it relocates addresses, how static libraries work, and how shared libraries differ. The transferable insight: linking is the step that makes separate compilation possible — any large C codebase (Linux kernel, SQLite, CPython) depends on the linker to combine hundreds of .o files into one executable.

What you need to know first: Lessons 00-26.

**Terms used in this lesson**
- **Linker** — The program that combines separate object files into a single executable, resolving references between them and assigning final memory addresses to their code and data. It solves the problem of having to recompile the entire project every time a single line of code changes.
- **Separate compilation** — The practice of compiling each source file independently into its own object file. It solves the problem of unmanageable build times on large codebases.
- **Symbol resolution** — The linker pass that matches every reference to a function or variable (a symbol) to exactly one definition across all object files. It solves the problem of code in one file needing to call code in another file without knowing where it is during compilation.
- **Relocation** — The linker pass that patches placeholder addresses in the machine code with final, real memory addresses. It solves the problem that the compiler generates code assuming it starts at address 0, which cannot be true for all files combined.
- **ELF (Executable and Linkable Format)** — The standard binary file format for object files, executables, and shared libraries on Linux. It solves the problem of needing a structured way to store machine code, data, and metadata (like the symbol table) so tools can read and manipulate them.
- **Strong symbol** — A defined function or an initialized global variable. It solves the problem of knowing which definition is the authoritative source for a symbol name.
- **Weak symbol** — An uninitialized global variable declaration. It solves the problem of allowing multiple files to declare the same global without causing an automatic linker error, though it is a common source of bugs.
- **Static library (.a)** — An archive of object files. When linked, the linker copies the needed object files directly into the final executable. It solves the problem of distributing reusable code that does not require any external dependencies at runtime.
- **Shared library (.so)** — A library that is loaded and linked dynamically at runtime rather than copied into the executable. It solves the problem of massive executable sizes and allows multiple programs to share the same library code in memory.
- **Position-Independent Code (PIC)** — Machine code that can execute correctly regardless of where it is loaded in memory. It solves the problem of shared libraries needing to be loaded at unpredictable addresses by different processes without altering their machine code.
- **Global Offset Table (GOT)** — A table of addresses used by PIC to find global variables and functions indirectly. It solves the problem of how PIC can reference symbols without hardcoding their absolute addresses in the instruction stream.

**Objects and methods used**
- **`add`**
  - *What it is:* A placeholder arithmetic function.
  - *Implementation:* `int add(int a, int b);`
  - *Its use:* Used to demonstrate a cross-file function call that must be resolved by the linker.
  - *Type:* Free function.
  - *Responsibility:* Adds two integers.
  - *Depends on:* Two integer arguments.
  - *Connects to:* Called by `main`.
  - *Shape:* An external symbol in the context of the calling file.

- **`printf`**
  - *What it is:* A standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);`
  - *Its use:* Used to demonstrate external symbol references and GOT indirection for shared libraries.
  - *Type:* Standard library function.
  - *Responsibility:* Formats and prints data to standard output.
  - *Depends on:* A format string and variable arguments matching the format specifiers.
  - *Connects to:* The terminal output stream (stdout).
  - *Shape:* An external symbol provided by libc.so.

## Concept Unit: What the linker does and why it exists

### The Problem
If we write our entire program in one giant C file, the compiler knows where every function is. But what if our project grows to a million lines of code? Recompiling a million lines every time we change a single typo is agonizingly slow. How do we split our code into multiple files, compile them separately, but still allow a function in file A to call a function in file B? When file A is compiled, how can it generate a call instruction to a function whose address it does not know yet?

### Introduce the concept in isolation
```c
/* file: main.c */
extern int add(int a, int b);  /* declared but not defined here */
int main(void) {
    return add(2, 3);
}

/* file: add.c */
int add(int a, int b) {
    return a + b;
}
```
If we run `gcc -c main.c`, it compiles successfully to `main.o`. The compiler leaves a note saying "I need `add` but I don't know where it is."
If we run `gcc main.o`, we get an error: `undefined reference to 'add'`.
If we run `gcc main.o add.o`, it succeeds.
This proves that the compiler and the **linker** are separate tools. The compiler processes one file at a time; the linker combines them and resolves the missing pieces.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating build mechanics rather than application features.
- **Files affected:** `main.c`, `math.c`
- **Change type:** add
- **Location:** Project root.
- **Dependencies:** None.

### The New Code
```c
/* math.c */
int math_add(int a, int b) {
    return a + b;
}
```

### The Updated Project
```c
// ← new
1: /* math.c */
2: int math_add(int a, int b) {
3:     return a + b;
4: }
```
The project now contains a separate file with a function to be linked later.

### Mechanical walkthrough
- `int` — the return type of the function.
- `math_add` — the name of the function, which will become a global symbol in the object file.
- `(int a, int b)` — the parameter list, defining the types and names of arguments.
- `{ return a + b; }` — the body of the function, executing the addition and returning the result.

### CS lens
Symbol resolution. In computer science, resolving identifiers to their definitions is a fundamental problem across many domains. It appears in DNS (resolving hostnames to IP addresses), in dependency injection frameworks (resolving interface requests to concrete classes), in module systems (resolving imports in Python or Node.js), and in file systems (resolving file paths to inodes).

### SE lens
Separation of concerns via separate compilation. The alternative is the monolithic compilation unit (often called a "unity build" in C++), which can improve optimization and simplify the build process. The real tradeoff is build time versus runtime optimization: separate compilation makes incremental builds fast (only recompile changed files), but prevents the compiler from optimizing across file boundaries unless Link-Time Optimization (LTO) is used.

### Commands needed
`gcc -c math.c`

### Run it
Predicted confidently: `math.o` is produced. No executable is made because there is no `main` and we used `-c` (compile only).

### One sentence connecting to previous unit
Now that we know the linker combines separate files, we must look at the internal structure of these object files to see how the linker reads them.

## Concept Unit: ELF object file structure

### The Problem
If `main.o` needs `add`, and `add.o` provides `add`, how exactly does the linker find this out? The object files are not plain text anymore; they are machine code. How is the machine code organized so that the linker can distinguish between executable instructions, initialized data, and a list of missing symbols?

### Introduce the concept in isolation
```c
/* Example: what lands where */
int global_init = 42;      /* .data */
int global_uninit;         /* .bss */
const char *msg = "hi";    /* msg pointer in .data, "hi" in .rodata */
static int s = 10;         /* .data (static = local to this file) */

void foo(void) {           /* .text */
    int local = 5;         /* stack (not in any section) */
}
```
This proves that variables and code are bucketed into specific sections by the compiler. An **ELF section** categorizes the compiled output into logical groups.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating ELF sections.
- **Files affected:** `data.c`
- **Change type:** add
- **Location:** Project root.
- **Dependencies:** None.

### The New Code
```c
/* data.c */
int my_global = 99;
const char *greeting = "Hello, linker!";
void print_it(void) {}
```

### The Updated Project
```c
// ← new
1: /* data.c */
2: int my_global = 99;
3: const char *greeting = "Hello, linker!";
4: void print_it(void) {}
```
The project now contains a file that populates `.data`, `.rodata`, and `.text` sections.

### Mechanical walkthrough
- `int my_global = 99;` — an initialized global variable, which will be placed in the `.data` section.
- `const char *greeting` — a pointer to characters, placed in `.data`.
- `"Hello, linker!"` — a read-only string literal, placed in the `.rodata` section.
- `void print_it(void) {}` — a function definition, whose machine code goes into the `.text` section.

### CS lens
Metadata vs Data. The ELF file doesn't just contain raw machine code; it contains headers and tables describing that code. This appears in image files (EXIF data describing pixel arrays), network packets (TCP headers describing the payload), databases (schemas describing row data), and Java `.class` files (constant pools and method tables).

### SE lens
Standardized formats. The alternative is for every compiler to invent its own object file format. The real tradeoff is flexibility versus interoperability. By adhering to the ELF standard, tools like `gcc`, `ld`, `nm`, and `objdump` can all interoperate, even if written by different organizations, at the cost of the format being complex and rigid to accommodate every architecture.

### Commands needed
`readelf -S data.o` (shows sections)
`nm data.o` (shows symbols)

### Run it
Predicted confidently: `readelf` will output a table showing `.text`, `.data`, `.bss`, and `.rodata` sections, each with a size and offset in the file.

### One sentence connecting to previous unit
Knowing that ELF files have a symbol table (`.symtab`), we can now explore how the linker decides which symbol to use when there are multiple conflicting names.

## Concept Unit: Symbol resolution — strong vs weak symbols

### The Problem
What happens if two different object files define a global variable with the exact same name? Does the compiler catch this? No, because it only sees one file at a time. When the linker combines them, how does it handle the collision? Does it throw an error, pick one randomly, or merge them?

### Introduce the concept in isolation
```c
/* file: foo.c */
#include <stdio.h>
int x = 100;   /* strong symbol: initialized global */
void foo(void) { /* strong symbol: function definition */
    printf("x = %d\n", x);
}

/* file: bar.c */
int x;          /* weak symbol: uninitialized global */
void bar(void) {
    x = 200;    /* modifies foo.c's 'x' silently! */
}
```
If we link these, it compiles without error. The linker resolves the **weak symbol** `x` in `bar.c` to the **strong symbol** `x` in `foo.c`. `bar()` will overwrite `foo`'s `x`. This proves that the linker uses strength rules to resolve name collisions, which can cause silent, dangerous bugs.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating symbol collisions.
- **Files affected:** `module1.c`, `module2.c`
- **Change type:** add
- **Location:** Project root.
- **Dependencies:** None.

### The New Code
```c
/* module1.c */
int config = 1;
void init_mod1(void) {}

/* module2.c */
int config;
void init_mod2(void) { config = 2; }
```

### The Updated Project
```c
// ← new
1: /* module1.c */
2: int config = 1;
3: void init_mod1(void) {}
```
```c
// ← new
1: /* module2.c */
2: int config;
3: void init_mod2(void) { config = 2; }
```
The project now contains two modules that accidentally share a global variable name.

### Mechanical walkthrough
- `int config = 1;` — defines a strong symbol in module1.c because it is initialized.
- `void init_mod1(void) {}` — defines a strong symbol (function).
- `int config;` — defines a weak symbol in module2.c because it is uninitialized.
- `void init_mod2(void) { config = 2; }` — writes to `config`, which the linker will wire to module1's `config`.

### CS lens
Resolution precedence rules. Many systems must reconcile conflicting definitions based on priority. This appears in CSS (specificity rules resolving conflicting styles), in shell aliases vs built-ins vs PATH binaries, in variable shadowing in block scopes, and in prototype inheritance in JavaScript (resolving a property on the object vs its prototype chain).

### SE lens
Global state and namespace pollution. The alternative is encapsulating state (e.g., using `static int config;` to make it local to the file, or passing context structs). The real tradeoff is convenience versus safety. Globals are easy to access but make the system fragile to naming collisions and hard to reason about, as unrelated modules can silently corrupt each other's state via weak symbol resolution.

### Commands needed
`gcc module1.c module2.c -o mod_prog`

### Run it
Predicted confidently: The compilation succeeds with no linker errors. `init_mod2` will modify the `config` variable defined in `module1.c`.

### One sentence connecting to previous unit
Once the linker has figured out which definition every symbol points to, it must modify the machine code to actually point to those final addresses.

## Concept Unit: Relocation — patching addresses

### The Problem
When the compiler builds `main.o`, it creates a `call` instruction to `add`. But `add` is in `add.o`. The compiler doesn't know where `add` will be placed in memory when the final program runs. If it doesn't know the address, what bytes does it put in the `call` instruction? And how does those placeholder bytes turn into a real address later?

### Introduce the concept in isolation
```asm
# main.o before linking (address 0x0):
0: 48 bf 00 00 00 00 00 00 00 00  movabs $0x0,%rdi  # placeholder: &msg
a: e8 00 00 00 00                 callq  0xf         # placeholder: printf

# Relocation entry in .rel.text:
# Offset 0x2: R_X86_64_64 -> msg  (patch 8-byte absolute address)
# Offset 0xb: R_X86_64_PC32 -> printf (patch 4-byte PC-relative offset)

# After linking (msg placed at 0x601030, printf at 0x400410):
0: 48 bf 30 10 60 00 00 00 00 00  movabs $0x601030,%rdi  # patched!
a: e8 fc 03 00 00                 callq  0x400410         # patched!
```
This proves that the compiler writes dummy zeros for addresses and leaves a to-do list (relocation entries). The linker performs **relocation** by computing the real address and overwriting the dummy bytes.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `caller.c`
- **Change type:** add
- **Location:** Project root.
- **Dependencies:** None.

### The New Code
```c
extern void callee(void);
void caller(void) {
    callee();
}
```

### The Updated Project
```c
// ← new
1: extern void callee(void);
2: void caller(void) {
3:     callee();
4: }
```
The project now has a function that requires PC-relative relocation to call an external function.

### Mechanical walkthrough
- `extern` — a keyword declaring that the following symbol is defined elsewhere.
- `void callee(void);` — the signature of the external symbol.
- `void caller(void)` — the definition of our local function.
- `callee();` — a function call that will compile into a `callq` instruction with a placeholder relative offset, generating an `R_X86_64_PC32` relocation entry.

### CS lens
Patching and late binding. Modifying a stream of instructions or data after initial generation is common. This appears in JIT compilers (patching hot paths with optimized native code), in 3D graphics (shader uniform updates), in self-extracting executables, and in hot-reloading web development frameworks (patching the DOM without a full refresh).

### SE lens
Two-pass processing. The alternative is a single-pass compiler that requires all code to be strictly ordered (like early Pascal, where everything must be defined before use). The real tradeoff is memory/complexity versus flexibility. A two-pass system allows arbitrary cross-references and forward declarations, making large codebases easier to organize, at the cost of writing an intermediate representation (object files) and running a second tool (the linker).

### Commands needed
`objdump -d caller.o`
`readelf -r caller.o`

### Run it
Predicted confidently: `objdump` will show `callq` followed by `00 00 00 00`. `readelf` will show a relocation entry for `callee` at the exact offset of those zeros.

### One sentence connecting to previous unit
With symbol resolution and relocation, the linker can combine our object files, but this process works differently depending on whether we use static archives or shared runtime libraries.

## Concept Unit: Static libraries (.a) and shared libraries (.so)

### The Problem
If ten different programs on our system all use `printf`, and we statically link `libc` into all of them, the exact same machine code for `printf` is copied ten times onto our hard drive and into memory. This wastes massive amounts of space. How can we have the programs share a single copy of `printf`?

### Introduce the concept in isolation
```c
/* Static library: the linker COPIES needed .o files into the executable */
/* gcc -c util.c -o util.o */
/* ar rcs libutil.a util.o other.o   <- create archive */
/* gcc main.c -L. -lutil -o prog     <- link statically */
/* Result: all of util.o copied into 'prog' */

/* Shared library: linked at RUNTIME by the dynamic linker */
/* gcc -shared -fPIC util.c -o libutil.so */
/* gcc main.c -L. -lutil -o prog */
/* Result: prog records 'needs libutil.so' but doesn't copy code */
/* At runtime: ld-linux.so loads libutil.so, resolves symbols */
```
This proves that **static libraries** embed code at compile-time, while **shared libraries** defer linking until execution time.

### Discard the throwaway
This throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `app.c`
- **Change type:** add
- **Location:** Project root.
- **Dependencies:** `libc.so` (implicit).

### The New Code
```c
#include <stdio.h>
int main(void) {
    printf("Using shared libc\n");
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: int main(void) {
3:     printf("Using shared libc\n");
4:     return 0;
5: }
```
The project contains a standard entry point that relies on the dynamic linker to find `printf` in the shared C library at runtime.

### Mechanical walkthrough
- `#include <stdio.h>` — includes declarations so the compiler knows the signature of `printf`.
- `int main(void)` — the entry point for the executable.
- `printf("Using shared libc\n");` — calls a function that is not in our object file, nor statically linked, but provided by `libc.so`.
- `return 0;` — exits successfully.

### CS lens
Indirection and late binding. Shared libraries rely on the dynamic linker and the Global Offset Table (GOT) to resolve addresses at the absolute last second. This appears in virtual method tables in OOP (dynamic dispatch at runtime), in DNS caching, in lazy evaluation in functional programming, and in operating system virtual memory (mapping virtual pages to physical frames at fault time).

### SE lens
Static vs Dynamic Linking. The alternative to shared libraries is static linking (creating standalone fat binaries). The real tradeoff is deployability versus footprint. Static binaries are incredibly easy to deploy because they have no external dependencies (favored by Go and Rust). Dynamic binaries save memory and allow security updates to underlying libraries (like OpenSSL) without recompiling every app, but risk "DLL hell" if library versions become incompatible.

### Commands needed
`ldd ./app`

### Run it
Predicted confidently: `ldd ./app` will output a list of shared libraries, explicitly listing `libc.so.6` and `ld-linux-x86-64.so.2` (the dynamic linker itself).

### One sentence connecting to previous unit
With the knowledge of how shared libraries load into memory, we have completed the picture of how a C program is built and prepared for execution by the operating system.

## Closing

### Connect the pieces
Trace a simple `hello.c` from source to running process across all the concepts we've covered:
1. The compiler compiles `hello.c` into an ELF object file (`hello.o`), placing the machine code in `.text` and the string in `.rodata`. It sees `printf` and leaves a placeholder and a relocation entry.
2. The linker runs, reads `hello.o`, and sees the unresolved symbol `printf`.
3. Because `printf` is in a shared library (`libc.so`), the linker doesn't copy the code. Instead, it adds a dynamic relocation entry and points the `call` to a stub.
4. When you run `./hello`, the OS kernel loads the executable into memory, but it doesn't start `main` immediately.
5. The kernel hands control to the dynamic linker (`ld-linux.so`).
6. The dynamic linker finds `libc.so`, loads it into memory, and patches the GOT (Global Offset Table) so that the stub can find the real `printf`.
7. Finally, control jumps to `main`, and your program prints "hello". 

The linker is what makes separate compilation practical — without it, every C file would need to know the final address of every function at compile time. Module 4 begins with Lesson 28 — Unix I/O.
