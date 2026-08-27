# Lesson 05: The Compilation Pipeline — Preprocessor, Compiler, Assembler, Linker

What you will build:
The reader will understand what each of the four compilation stages does, what files it reads and produces, why errors appear at different stages, and what an object file and executable actually contain. The transferable insight: 'compilation' is four distinct programs run in sequence — confusing them leads to mysterious errors; understanding them turns every error message from cryptic to obvious.

What you need to know first:
- Lesson 00
- Lesson 01
- Lesson 02
- Lesson 03
- Lesson 04

Pipeline diagram:
Source Code (`hello.c`) → Preprocessor (`cpp`) → Expanded Source (`hello.i`) → Compiler (`cc1`) → Assembly Text (`hello.s`) → Assembler (`as`) → Object File (`hello.o`) → Linker (`ld`) → Executable (`hello`)

Terms used in this lesson:
- **Preprocessor** — a text transformation tool that replaces #include directives, expands macros, and evaluates conditional compilation, preparing the raw source text for the actual compiler. It exists to enable text substitution without parsing C syntax.
- **Compiler** — the translation program that takes preprocessed C code and produces architecture-specific assembly text. It exists to map high-level language constructs to lower-level machine concepts.
- **Assembler** — a translation program that converts readable assembly language text into raw binary machine code. It exists to generate the exact bits the CPU understands.
- **Linker** — a program that combines multiple compiled object files and libraries into a single executable, resolving references between them and assigning final memory addresses. It exists so that code can be built in separate files rather than one massive unit.
- **Macro** — a named text substitution defined by `#define`. It exists to allow for constants and inline code generation without function call overhead.
- **ELF (Executable and Linkable Format)** — the standard binary file format for object files, shared libraries, and executables on Linux. It exists to organize code and data into structured sections the OS loader understands.
- **Symbol Table** — a data structure in an object file that maps names (like variables and functions) to their offsets within the file. It exists so the linker knows where everything is when combining files.
- **Static Linking** — the process of copying all required library code directly into the final executable at build time. It exists to create self-contained binaries that don't depend on external library files at runtime.
- **Dynamic Linking** — the process of deferring the loading of library code until the program is executed. It exists to save disk space and memory by sharing a single copy of a library (like `libc.so`) across multiple running programs.
- **Position-Independent Code (PIC)** — machine code that executes correctly regardless of where it is loaded in memory. It exists to enable dynamic linking, where a shared library might be loaded at a different address every time.
- **GOT (Global Offset Table)** — a table used by position-independent code to find global variables and functions. It exists because the exact address of external code isn't known until runtime.
- **PLT (Procedure Linkage Table)** — a trampoline table that routes function calls to their addresses in the GOT. It exists to allow lazy binding of shared library functions.

Objects and methods used:

- **`gcc`**
  - *What it is:* The GNU Compiler Collection driver program.
  - *Implementation:* An executable binary that orchestrates `cpp`, `cc1`, `as`, and `ld`.
  - *Its use:* We use it to invoke the entire compilation pipeline or stop at specific stages using flags.
  - *Type:* Command-line executable.
  - *Responsibility:* Parses command-line arguments and invokes the correct underlying tools in the correct order to turn source files into executables.
  - *Depends on:* C source files, system headers, and the availability of the underlying pipeline tools.
  - *Connects to:* Calls `cpp`, `cc1`, `as`, and `ld` as child processes.
  - *Shape:* The primary user-facing entry point to the build system.

- **`printf`**
  - *What it is:* A standard C library function for formatted output.
  - *Implementation:* `int printf(const char *format, ...);` defined in `<stdio.h>` and implemented in `libc`.
  - *Its use:* Used in our example code to demonstrate how external symbols are resolved by the linker.
  - *Type:* Standard library function.
  - *Responsibility:* Formats data according to a format string and writes it to standard output.
  - *Depends on:* A valid format string and matching variadic arguments.
  - *Connects to:* Calls lower-level system write operations to output characters.
  - *Shape:* A globally available utility function provided by the C standard library.

Everything else in the file, not this lesson's subject but still explained:
(None)

## Concept Unit: The four stages — overview

### The Problem
When you type `gcc hello.c -o hello`, an executable pops out. But C is a high-level language, and the CPU only understands raw binary machine instructions. How does text become binary? If there is an error, who reports it? Without understanding the intermediate steps, errors like "undefined reference" look like compiler bugs instead of predictable tool behaviors.

Pause and think: if you wanted to translate C to machine code, would you do it in one pass? What if you wanted to use code written by someone else?

### Introduce the concept in isolation
The `gcc` command is actually a driver that runs four distinct programs. We can stop it after each step to see what it did.

```c
// Throwaway lab: isolated.c
#define NUM 5
int main(void) { return NUM; }
```

Predicted output (confidence: 100%):
Running `gcc -E isolated.c` (stop after preprocessor) will print the source code but with `NUM` replaced by `5`. The output proves that the preprocessor merely manipulates text before any compilation happens. This pipeline is called the **Compilation Pipeline**.

### Discard the throwaway example
The isolated code above is deleted and will not appear in the project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are exploring the build pipeline tools.
Files affected: none yet.
Change type: exploration.
Location: n/a.
Dependencies: `gcc`.

### The New Code
```c
// hello.c
#include <stdio.h>

int main(void) {
    printf("Hello, world\n");
    return 0;
}
```

### The Updated Project
```c
// hello.c
1: #include <stdio.h>
2: 
3: int main(void) {
4:     printf("Hello, world\n"); // ← new
5:     return 0;
6: }
```
We have a basic C program that calls a standard library function.

### Mechanical walkthrough
- `#include <stdio.h>`: The preprocessor directive that includes the standard input/output header file.
- `int main(void)`: The entry point function.
- `printf(...)`: A call to the standard library function.
- `return 0;`: The exit status of the program.

### CS Lens
The pipeline is:
1. `cpp` (Preprocessor): `hello.c` -> `hello.i` (expanded text)
2. `cc1` (Compiler): `hello.i` -> `hello.s` (assembly text)
3. `as` (Assembler): `hello.s` -> `hello.o` (binary object)
4. `ld` (Linker): `hello.o` + libraries -> `hello` (executable)

## Concept Unit: Stage 1: The Preprocessor (cpp)

### The Problem
We want to share code (like definitions of functions) and use constants without duplicating them everywhere. If we type `#define MAX 100`, how does the compiler know what `MAX` is? 

### Introduce the concept in isolation
```c
// Throwaway lab: pre.c
#define GREETING "hello"
#define MAX(a,b) ((a)>(b)?(a):(b))

int main(void)
{
    int bigger = MAX(3, 7);
    return bigger;
}
```

Predicted output of `gcc -E pre.c` (confidence: 100%):
```c
int main(void)
{
    int bigger = ((3)>(7)?(3):(7));
    return bigger;
}
```
The output proves that the preprocessor substitutes text exactly as defined. This tool is the **Preprocessor**.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
No reference counterpart.
Files affected: `hello_macro.c` (created).
Change type: add.
Location: brand-new file.

### The New Code
```c
/* Source: hello.c */
#include <stdio.h>         /* replaced with contents of stdio.h */
#define GREETING "hello"   /* text substitution */
#define MAX(a,b) ((a)>(b)?(a):(b))

int main(void)
{
    printf("%s, world\n", GREETING);
    int bigger = MAX(3, 7);
    printf("%d\n", bigger);  /* 7 */
    return 0;
}
```

### The Updated Project
```c
1: /* Source: hello.c */
2: #include <stdio.h>         /* replaced with contents of stdio.h */ // ← new
3: #define GREETING "hello"   /* text substitution */ // ← new
4: #define MAX(a,b) ((a)>(b)?(a):(b)) // ← new
5: 
6: int main(void) // ← new
7: { // ← new
8:     printf("%s, world\n", GREETING); // ← new
9:     int bigger = MAX(3, 7); // ← new
10:     printf("%d\n", bigger);  /* 7 */ // ← new
11:     return 0; // ← new
12: } // ← new
```
We now have a program utilizing macros.

### Mechanical walkthrough
- `#include <stdio.h>`: Replaced by the literal contents of `stdio.h` (hundreds of lines of declarations).
- `#define GREETING "hello"`: A text substitution rule.
- `MAX(3, 7)`: Replaced inline with `((3)>(7)?(3):(7))`.
Beware the macro double-evaluation danger: `MAX(a++, b)` would become `((a++)>(b)?(a++):(b))`, incrementing `a` twice.

## Concept Unit: Stage 2: The Compiler (cc1)

### The Problem
The preprocessor leaves us with a giant C text file. How does this become something the CPU can execute? 

### Introduce the concept in isolation
```c
// Throwaway lab: comp.c
long add(long a, long b) { return a + b; }
```

Predicted output of `gcc -S comp.c` (confidence: 100%):
```asm
add:
    movq    %rdi, %rax
    addq    %rsi, %rax
    ret
```
The output proves the compiler translates high-level C into architecture-specific assembly instructions. This tool is the **Compiler**.

### Discard the throwaway example
Discarded.

### Project Change
No reference counterpart.
Files affected: none.
Change type: conceptual explanation.
Location: n/a.

### The New Code
```c
long add(long a, long b)
{
    return a + b;
}
```

### The Updated Project
```c
1: long add(long a, long b) // ← new
2: { // ← new
3:     return a + b; // ← new
4: } // ← new
```

### Mechanical walkthrough
- `add:`: A label indicating the start of the function.
- `movq %rdi, %rax`: Move quadword (8 bytes) from `%rdi` (first argument `a`) to `%rax` (return register).
- `addq %rsi, %rax`: Add quadword in `%rsi` (second argument `b`) to `%rax`.
- `ret`: Return to the caller with the result in `%rax`.

## Concept Unit: Stage 3: The Assembler (as)

### The Problem
We have text representing assembly instructions (`movq`, `addq`). But the CPU reads binary bits, not ASCII text. 

### Introduce the concept in isolation
```asm
# Throwaway lab: asm.s
add:
    movq %rdi, %rax
    ret
```

Predicted output (confidence: 100%):
Running `as asm.s -o asm.o` yields a binary file. The output proves the assembler translates text instructions into exact machine opcodes. This tool is the **Assembler**.

### Discard the throwaway example
Discarded.

### Project Change
No reference counterpart.
Files affected: none.

### The New Code
```
.text   -- machine code instructions (binary)
.data   -- initialized global/static variables
.bss    -- uninitialized global/static (zero-initialized)
.rodata -- read-only data (string literals)
.symtab -- symbol table: names and their offsets
.rel.text -- relocation entries: addresses to patch at link time
```

### The Updated Project
```
1: .text   -- machine code instructions (binary) // ← new
2: .data   -- initialized global/static variables // ← new
3: .bss    -- uninitialized global/static (zero-initialized) // ← new
4: .rodata -- read-only data (string literals) // ← new
5: .symtab -- symbol table: names and their offsets // ← new
6: .rel.text -- relocation entries: addresses to patch at link time // ← new
```
This represents the structure of an ELF object file.

### Mechanical walkthrough
- `.text`: Where the actual machine instructions live.
- `.data` / `.bss`: Storage for variables.
- `.symtab`: A table tracking where functions and variables are located.
If we call `printf`, its entry in the symbol table is marked `UNDEF` because the assembler doesn't have the code for it.

## Concept Unit: Stage 4: The Linker (ld)

### The Problem
Our object file is binary, but it has `UNDEF` holes. It doesn't know where `printf` is, and it assumes it starts at address 0. How does it become a runnable program?

### Introduce the concept in isolation
```c
// Throwaway lab: link.c
extern void missing();
int main(void) { missing(); return 0; }
```

Predicted output (confidence: 100%):
Linking this file alone fails with `undefined reference to 'missing'`. The output proves the linker enforces that every symbol must exist exactly once. This tool is the **Linker**.

### Discard the throwaway example
Discarded.

### Project Change
No reference counterpart.
Files affected: none.

### The New Code
```
Input:  hello.o  +  printf.o (from libc.a)  +  crt0.o
Output: hello (executable)

Relocation example:
hello.o:  call 0x00000000   (placeholder for printf)
After ld: call 0x401050    (actual address of printf)
```

### The Updated Project
```
1: Input:  hello.o  +  printf.o (from libc.a)  +  crt0.o // ← new
2: Output: hello (executable) // ← new
3: 
4: Relocation example: // ← new
5: hello.o:  call 0x00000000   (placeholder for printf) // ← new
6: After ld: call 0x401050    (actual address of printf) // ← new
```

### Mechanical walkthrough
- **Symbol resolution:** The linker matches every `UNDEF` symbol to a definition in another object file or library.
- **Relocation:** It assigns real memory addresses and patches placeholders (`0x00000000` -> `0x401050`).

## Concept Unit: Static vs dynamic linking

### The Problem
If a thousand programs use `printf`, do we copy the code for `printf` into every single executable? That would waste disk space.

### Introduce the concept in isolation
```c
// Throwaway lab: dyn.c
int main() { return 0; }
```
Predicted output: `ldd ./a.out` shows a dependency on `libc.so`. The output proves that dynamic dependencies are recorded but not copied. This is **Dynamic Linking**.

### Discard the throwaway example
Discarded.

### Project Change
No reference counterpart.

### The New Code
```c
/* Checking dynamic dependencies conceptually: ldd ./hello would show */
/* linux-vdso.so.1 */
/* libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 */
/* /lib64/ld-linux-x86-64.so.2 */
```

### The Updated Project
```c
1: /* Checking dynamic dependencies conceptually: ldd ./hello would show */ // ← new
2: /* linux-vdso.so.1 */ // ← new
3: /* libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 */ // ← new
4: /* /lib64/ld-linux-x86-64.so.2 */ // ← new
```

### Mechanical walkthrough
- `.a` (Static Library): The linker COPIES needed `.o` files into the executable.
- `.so` (Shared Library): The linker records the dependency. The OS dynamic linker loads it at runtime.
Shared libraries use Position-Independent Code (PIC) compiled with `-fPIC`, using the Global Offset Table (GOT) and Procedure Linkage Table (PLT) to find functions at runtime.

## Concept Unit: Error diagnostics by stage

### The Problem
When you type `gcc` and get an error, it's a wall of text. How do you know what to fix?

### Introduce the concept in isolation
```c
// Throwaway lab: err.c
#include <notfound.h>
```
Predicted output: `fatal error: notfound.h: No such file or directory`. This is a **Preprocessor error**.

### Discard the throwaway example
Discarded.

### Project Change
No reference counterpart.

### The New Code
```
Preprocessor errors:
  fatal error: stdio.h: No such file or directory
  -> Misspelled #include or missing system headers

Compiler errors:
  error: expected ';' before '}'
  -> C syntax error
  error: 'x' undeclared
  -> Variable used before declaration

Linker errors:
  undefined reference to 'sqrt'
  -> Missing -lm flag
  undefined reference to 'pthread_create'
  -> Missing -lpthread flag
  multiple definition of 'counter'
  -> Defined a global in a header included in two .c files
```

### The Updated Project
```
1: Preprocessor errors: // ← new
2:   fatal error: stdio.h: No such file or directory // ← new
3:   -> Misspelled #include or missing system headers // ← new
4: 
5: Compiler errors: // ← new
6:   error: expected ';' before '}' // ← new
7:   -> C syntax error // ← new
8:   error: 'x' undeclared // ← new
9:   -> Variable used before declaration // ← new
10: 
11: Linker errors: // ← new
12:   undefined reference to 'sqrt' // ← new
13:   -> Missing -lm flag // ← new
14:   undefined reference to 'pthread_create' // ← new
15:   -> Missing -lpthread flag // ← new
16:   multiple definition of 'counter' // ← new
17:   -> Defined a global in a header included in two .c files // ← new
```

### Mechanical walkthrough
- **Preprocessor errors:** Usually missing files or macro issues. It happens before C syntax is checked.
- **Compiler errors:** Syntax errors, type mismatches. It knows about C rules.
- **Linker errors:** "undefined reference" means it compiled fine, but it couldn't find the definition later. "multiple definition" means two files provided the exact same symbol name.

---

Closing: Module 1 continues with Lesson 06 -- x86-64 assembly. Now that you know how the compiler produces assembly, you will read it. Exercises: what does `gcc -E hello.c` output (describe); what happens if two .c files both define `int counter = 0;` globally and you link them; what is the difference between a .a and .so file?
