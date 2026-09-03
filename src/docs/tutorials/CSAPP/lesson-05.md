# Lesson 05: The Compilation Pipeline — Preprocessing, Compilation, Assembly, and Linking

**What you will build**
The reader will understand each of the four stages of the compilation pipeline — preprocessing, compilation, assembly, and linking — and will be able to stop the pipeline at any stage and inspect the output. The transferable insight: the compiler is a pipeline of text transformations ending in binary. Each stage has well-defined inputs and outputs. Understanding this pipeline is what lets you diagnose 'why won't this compile/link?' errors at the right level.

**What you need to know first**
Lessons 00-04.

**Terms used in this lesson**
- **Preprocessor** — A text processing stage that runs before actual compilation, handling file inclusion, macro substitution, and conditional compilation. It exists to enable code reuse and configuration without complicating the compiler's parsing phase.
- **Compiler** — The stage that translates preprocessed C source code into assembly language. It exists to bridge high-level, human-readable logic into architecture-specific CPU instructions.
- **Assembler** — The tool that converts readable assembly language mnemonics into raw machine code bytes, packaged in an object file. It exists because CPUs only understand binary, not text.
- **Linker** — The final stage that combines multiple object files and libraries into a single executable, resolving references between them. It exists so programs can be split across multiple source files and reuse shared libraries.
- **Macro** — A textual substitution rule defined for the preprocessor. It exists to allow configurable constants and inline code generation before compilation begins.
- **Object file** — A binary file containing machine code and data, but with unresolved references to symbols in other files. It exists as an intermediate, reusable compilation unit.
- **Static linking** — The process of copying all required library code directly into the final executable at link time. It exists to produce self-contained binaries that do not depend on external files at runtime.
- **Dynamic linking** — The process of recording a dependency on a shared library in the executable, which the OS resolves at runtime. It exists to save disk space and memory by sharing code across multiple running programs.

**Objects and methods used**
- **`gcc`**
  - *What it is:* The GNU Compiler Collection frontend driver.
  - *Implementation:* A command-line program (`/usr/bin/gcc`).
  - *Its use:* Drives the entire compilation pipeline by invoking `cpp`, `cc1`, `as`, and `ld` on your behalf.
  - *Type:* CLI tool / Pipeline orchestrator.
  - *Responsibility:* Parses arguments and launches the correct underlying pipeline tools to produce the requested output.
  - *Depends on:* Source files, command-line flags, and system paths.
  - *Connects to:* Passes control and temporary files to `cpp`, `cc1`, `as`, and `ld`.
  - *Shape:* The entry point to the compilation architecture.
- **`cpp`**
  - *What it is:* The C Preprocessor.
  - *Implementation:* An executable often found at `/usr/bin/cpp`.
  - *Its use:* Performs raw text substitution and macro expansion.
  - *Type:* CLI tool / Text transformer.
  - *Responsibility:* Resolves all `#` directives in C source code.
  - *Depends on:* C source code files and included header files.
  - *Connects to:* Outputs an intermediate `.i` file for the compiler.
  - *Shape:* The first stage of the compilation pipeline.
- **`cc1`**
  - *What it is:* The actual C compiler.
  - *Implementation:* An internal GCC executable (e.g., `/usr/libexec/gcc/.../cc1`).
  - *Its use:* Translates valid preprocessed C code into assembly.
  - *Type:* CLI tool / Code generator.
  - *Responsibility:* Lexical analysis, parsing, type checking, optimization, and x86-64 assembly generation.
  - *Depends on:* Preprocessed C code (`.i` files).
  - *Connects to:* Outputs an assembly (`.s`) file.
  - *Shape:* The second stage of the compilation pipeline.
- **`as`**
  - *What it is:* The GNU Assembler.
  - *Implementation:* A command-line executable (`/usr/bin/as`).
  - *Its use:* Translates assembly instructions into raw machine code.
  - *Type:* CLI tool / Assembler.
  - *Responsibility:* Generates ELF object files from textual assembly mnemonics.
  - *Depends on:* Assembly (`.s`) files.
  - *Connects to:* Outputs an object (`.o`) file.
  - *Shape:* The third stage of the compilation pipeline.
- **`ld`**
  - *What it is:* The GNU Linker.
  - *Implementation:* A command-line executable (`/usr/bin/ld`).
  - *Its use:* Stitches object files together.
  - *Type:* CLI tool / Linker.
  - *Responsibility:* Resolves undefined symbols and relocates addresses to produce a final executable or shared library.
  - *Depends on:* Object (`.o`) files and static/dynamic libraries.
  - *Connects to:* Outputs an executable or shared object.
  - *Shape:* The final stage of the compilation pipeline.
- **`objdump`**
  - *What it is:* A binary inspection tool.
  - *Implementation:* A command-line executable.
  - *Its use:* Disassembles machine code back into assembly text.
  - *Type:* CLI tool / Disassembler.
  - *Responsibility:* Displays information from object files, including raw hex and disassembled instructions.
  - *Depends on:* Compiled binary or object files.
  - *Connects to:* Standard output for human inspection.
  - *Shape:* A diagnostic utility operating on compilation artifacts.
- **`nm`**
  - *What it is:* A symbol table inspection tool.
  - *Implementation:* A command-line executable.
  - *Its use:* Lists defined and undefined symbols in object files.
  - *Type:* CLI tool / Inspector.
  - *Responsibility:* Extracts symbol names, types, and addresses.
  - *Depends on:* Object files or executables containing symbol tables.
  - *Connects to:* Standard output for human inspection.
  - *Shape:* A diagnostic utility for symbol resolution issues.
- **`readelf`**
  - *What it is:* An ELF file inspection tool.
  - *Implementation:* A command-line executable.
  - *Its use:* Displays structural information about ELF binaries.
  - *Type:* CLI tool / Inspector.
  - *Responsibility:* Parses and formats the internal sections and headers of ELF files.
  - *Depends on:* ELF format binaries.
  - *Connects to:* Standard output for human inspection.
  - *Shape:* A diagnostic utility for understanding binary structure.

## Concept Unit: 1. The preprocessor (cpp) — text substitution before compilation

### The Problem
How does the compiler know what `printf` is if we don't define it in our file? How can we define constants that don't take up memory at runtime? What if we want to include different code based on the operating system we are compiling for?

### Introduce the concept in isolation
```c
#define DOUBLE(x) ((x)*2)
int main(void) {
    int x = DOUBLE(5);
    return 0;
}
```
**Output (via `gcc -E`):**
```c
int main(void) {
    int x = ((5)*2);
    return 0;
}
```
This proves that the preprocessor performs literal text substitution before any real C parsing occurs. The macro `DOUBLE(5)` is completely replaced by `((5)*2)` in the text stream.

### Discard the throwaway
This throwaway macro example is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing pipeline behaviors.
- **Files affected:** `add.c` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** Standard C library headers.

### The New Code
```c
#include <stdio.h>
#define DOUBLE(x) ((x)*2)
#define MAX 100

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int x = DOUBLE(5);
    printf("%d\n", x);
    return 0;
}
```

### The Updated Project
```c
1: #include <stdio.h> // <- new
2: #define DOUBLE(x) ((x)*2) // <- new
3: #define MAX 100 // <- new
4: 
5: int add(int a, int b) { // <- new
6:     return a + b; // <- new
7: } // <- new
8: 
9: int main(void) { // <- new
10:     int x = DOUBLE(5); // <- new
11:     printf("%d\n", x); // <- new
12:     return 0; // <- new
13: } // <- new
```
This complete file demonstrates preprocessor directives alongside normal C functions.

### Mechanical walkthrough
- `#include`: A preprocessor directive instructing it to find a file.
- `<stdio.h>`: The name of the system header file to locate and copy-paste into the current location.
- `#define`: A preprocessor directive instructing it to create a text substitution macro.
- `DOUBLE(x)`: The name and parameter list of the macro.
- `((x)*2)`: The replacement text, using double parentheses to prevent operator precedence bugs (e.g., `DOUBLE(3+4)` becomes `((3+4)*2)`, not `(3+4*2)`).
- `#define MAX 100`: Defines a simple macro that replaces `MAX` with `100`.
- `int add(int a, int b)`: A function declaration defining an `add` function.
- `{ return a + b; }`: The body of the `add` function.
- `int main(void)`: The entry point function.
- `int x = DOUBLE(5);`: Variable declaration invoking the macro.
- `printf("%d\n", x);`: A function call using the `printf` declaration pulled in from `stdio.h`.
- `return 0;`: Returns success from the entry point.

### CS lens
**Text Substitution / Macros.** This is the fundamental CS concept of manipulating source code as strings before parsing it as an Abstract Syntax Tree. Real-world places it appears:
- HTML templating engines (Jinja, EJS) expanding variables before sending to a browser.
- Lisp macros, which manipulate syntax trees rather than raw text.
- Build system variables (e.g., Makefiles expanding `$@`).

### SE lens
**Configuration without Overhead.** The design principle is shifting work to compile-time. The alternative NOT chosen is declaring `const int MAX = 100;` and a standard `double(x)` function. The real tradeoff is that macros have no runtime overhead (no function call stack frames, no memory allocated for constants), but they bypass the compiler's type checking and scope rules, leading to notoriously difficult bugs.

### Commands needed
```bash
gcc -E add.c -o add.i
```

### Run it
Predicted confidently: The `add.i` file will contain thousands of lines from the `stdio.h` header, followed by the `add` function, and the `main` function with `DOUBLE(5)` expanded to `((5)*2)`. We know this because the `-E` flag stops GCC after the preprocessor stage.

### One sentence connecting to previous unit
Now that the preprocessor has expanded all includes and macros into a pure C file, the actual compiler must translate that logic into machine instructions.

## Concept Unit: 2. The compiler (cc1) — C to assembly

### The Problem
How does a high-level `return x * x;` statement become something an Intel processor can actually execute? What intermediate form bridges the gap between C syntax and binary? What happens if you ask the compiler to optimize the output?

### Introduce the concept in isolation
```c
long square(long x) {
    return x * x;
}
```
**Output (via `gcc -S -O2`):**
```asm
square:
    movq   %rdi, %rax
    imulq  %rdi, %rax
    ret
```
This proves that the compiler translates C logic directly into x86-64 assembly instructions, assigning variables to CPU registers (`%rdi`, `%rax`) based on calling conventions.

### Discard the throwaway
This throwaway `square` example is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing pipeline behaviors.
- **Files affected:** `square.c` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** The C compiler.

### The New Code
```c
long square(long x) {
    return x * x;
}
```

### The Updated Project
```c
1: long square(long x) { // <- new
2:     return x * x; // <- new
3: } // <- new
```
This is the isolated C code that we will compile into assembly language.

### Mechanical walkthrough
- `long`: A C keyword specifying a 64-bit integer type on Linux/x86-64.
- `square`: The name of the function being declared.
- `(long x)`: The parameter list, taking one 64-bit integer named `x`.
- `{`: Begins the function body.
- `return`: A C keyword instructing the function to exit and pass a value back.
- `x`: A reference to the input parameter.
- `*`: The C multiplication operator.
- `x`: A second reference to the input parameter.
- `;`: Terminates the statement.
- `}`: Ends the function body.

### CS lens
**Code Generation / Intermediate Representation.** This is the fundamental CS concept of transforming a high-level AST into a lower-level, machine-specific instruction set. Real-world places it appears:
- Java's `javac` compiling Java source to JVM bytecode.
- WebAssembly (Wasm) compilers translating Rust to browser-executable instructions.
- JIT (Just-In-Time) compilers in V8 (Chrome) turning JavaScript into native machine code at runtime.

### SE lens
**Separation of Concerns (Front-end vs Back-end).** The design principle is decoupling language parsing from architecture targeting. The alternative NOT chosen is writing a monolithic tool that reads C and directly emits binary bytes for an Intel chip. The real tradeoff is that outputting intermediate textual assembly allows developers to inspect, debug, and even hand-edit the compiler's output before it becomes opaque machine code.

### Commands needed
```bash
gcc -S -O2 -o square.s square.c
```

### Run it
Predicted confidently: The `square.s` file will contain a `square:` label, a `movq` instruction moving the argument from `%rdi` to `%rax`, an `imulq` instruction squaring it, and a `ret` instruction. We know this because `-S` stops GCC after the compilation stage, emitting assembly, and `-O2` produces optimal instructions.

### One sentence connecting to previous unit
Now that we have human-readable assembly instructions, we need a tool to convert them into raw binary numbers the CPU can read.

## Concept Unit: 3. The assembler (as) — assembly to object file

### The Problem
If the CPU only executes raw bytes, how do we convert textual assembly instructions like `movl %edi, %eax` into binary? Where does the resulting binary data live before it becomes a complete executable?

### Introduce the concept in isolation
```asm
add:
    movl   %edi, %eax
    addl   %esi, %eax
    ret
```
**Output (via `as add.s -o add.o`, then `objdump -d add.o`):**
```asm
0000000000000000 <add>:
   0: 89 f8     mov    %edi,%eax
   2: 01 f0     add    %esi,%eax
   4: c3        ret
```
This proves that the assembler converts text mnemonics into highly specific binary opcode sequences (`89 f8` for `movl %edi,%eax`), packing them sequentially starting at address `0`.

### Discard the throwaway
This throwaway `add` assembly example is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing pipeline behaviors.
- **Files affected:** `add.s` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** The GNU Assembler.

### The New Code
```asm
add:
    movl   %edi, %eax
    addl   %esi, %eax
    ret
```

### The Updated Project
```asm
1: add: // <- new
2:     movl   %edi, %eax // <- new
3:     addl   %esi, %eax // <- new
4:     ret // <- new
```
This file contains the raw x86-64 assembly instructions to be assembled into an object file.

### Mechanical walkthrough
- `add:`: A label defining a symbol at the current memory address.
- `movl`: The assembly mnemonic to move a 32-bit long word (lower 32 bits of a register).
- `%edi`: The source register, containing the first integer argument per the x86-64 calling convention.
- `,`: Syntactic separator.
- `%eax`: The destination register, used for returning integer values.
- `addl`: The assembly mnemonic to add a 32-bit long word to another.
- `%esi`: The source register, containing the second integer argument.
- `%eax`: The destination register, which will hold the sum.
- `ret`: The assembly mnemonic to return from a procedure, popping the return address off the stack.

### CS lens
**Instruction Encoding.** This is the fundamental CS concept of mapping human-readable commands to specific binary opcodes defined by a hardware architecture. Real-world places it appears:
- Network protocol serialization, where structured data is packed into raw byte frames.
- MIDI files, where musical notes are encoded into specific byte sequences.
- Emulators (like a GameBoy emulator), which read these raw byte opcodes and simulate their effects.

### SE lens
**The Object File Abstraction.** The design principle is modular compilation units. The alternative NOT chosen is assembling everything directly into a final executable file. The real tradeoff is that object files (`.o`) allow large codebases to be compiled incrementally—if you change one C file, you only have to reassemble that one file, leaving the other object files untouched, massively speeding up build times.

### Commands needed
```bash
as add.s -o add.o
objdump -d add.o
nm add.o
readelf -S add.o
```

### Run it
Predicted confidently: Running `nm add.o` will show `0000000000000000 T add`, meaning the symbol `add` is exported in the `.text` section at offset 0. We know this because the object file contains the exact machine code for the function, but lacks final absolute memory addresses.

### One sentence connecting to previous unit
Now that we have a compiled object file containing binary code but starting at address zero, we need a way to combine it with other object files and assign real memory addresses.

## Concept Unit: 4. The linker (ld) — combining object files and resolving symbols

### The Problem
If `main.c` calls `square()` but `square()` is defined in `math_util.c`, how does `main` know where to jump when it executes? What tool stitches multiple `.o` files together into one program? How are external functions resolved?

### Introduce the concept in isolation
```c
extern int square(int x);
int main(void) {
    return square(4);
}
```
**Output (via compilation to `main.o` and `nm` inspection):**
```
         U square
00000000 T main
```
This proves that the compiler and assembler leave the address for `square` as `U` (Undefined). They emit a placeholder, deferring the resolution of that symbol's address to the next stage.

### Discard the throwaway
This throwaway linker-resolution example is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing pipeline behaviors.
- **Files affected:** `math_util.c` (created), `main.c` (created)
- **Change type:** Add
- **Location:** New files.
- **Dependencies:** The linker.

### The New Code
```c
/* math_util.c */
int square(int x) { return x * x; }
int cube(int x)   { return x * x * x; }

/* main.c */
#include <stdio.h>
extern int square(int x);
extern int cube(int x);

int main(void) {
    printf("%d %d\n", square(4), cube(3));
    return 0;
}
```

### The Updated Project
```c
/* math_util.c */
1: int square(int x) { return x * x; } // <- new
2: int cube(int x)   { return x * x * x; } // <- new

/* main.c */
3: #include <stdio.h> // <- new
4: extern int square(int x); // <- new
5: extern int cube(int x); // <- new
6: 
7: int main(void) { // <- new
8:     printf("%d %d\n", square(4), cube(3)); // <- new
9:     return 0; // <- new
10: } // <- new
```
These two files represent a multi-file C program that requires linking.

### Mechanical walkthrough
- `int square(int x)`: Declaration of the `square` function in `math_util.c`.
- `{ return x * x; }`: Body of the `square` function.
- `int cube(int x)`: Declaration of the `cube` function in `math_util.c`.
- `{ return x * x * x; }`: Body of the `cube` function.
- `#include <stdio.h>`: Includes standard I/O declarations in `main.c`.
- `extern`: A C keyword indicating that a symbol is defined in another file.
- `int square(int x);`: Forward declaration of `square`, promising the compiler it exists elsewhere.
- `extern int cube(int x);`: Forward declaration of `cube`.
- `int main(void)`: Entry point in `main.c`.
- `printf`: Function call to a library function.
- `"%d %d\n"`: The format string.
- `square(4)`: A call to the externally defined `square` function.
- `cube(3)`: A call to the externally defined `cube` function.
- `return 0;`: Exits the program successfully.

### CS lens
**Symbol Resolution and Relocation.** This is the fundamental CS concept of taking isolated chunks of logic and graphing them together, assigning absolute memory addresses, and patching branch instructions to point to those addresses. Real-world places it appears:
- DNS resolution, where string names (google.com) are resolved to absolute IP addresses.
- Module bundlers (like Webpack), which resolve `import` statements across many JS files into a single bundle.
- Dependency injection frameworks, which wire disconnected components together at startup.

### SE lens
**The `extern` Contract.** The design principle is explicit boundary declarations. The alternative NOT chosen is having the compiler scan all source files on disk to find where a function is magically defined. The real tradeoff is that `extern` requires manual bookkeeping (usually via header files), but it ensures the compiler can process `main.c` completely independently of `math_util.c`, maintaining strict compilation isolation.

### Commands needed
```bash
gcc -c math_util.c -o math_util.o
gcc -c main.c -o main.o
gcc math_util.o main.o -o prog
```

### Run it
Predicted confidently: The `prog` executable will print `16 27`. We know this because the linker will successfully assign final addresses to `square` and `cube` from `math_util.o`, and patch the call instructions in `main.o` to jump to those addresses.

### One sentence connecting to previous unit
Now that we understand how the linker connects object files together, we must look at how it connects object files to pre-compiled system libraries.

## Concept Unit: 5. Static vs. dynamic linking — .a libraries and .so libraries

### The Problem
If a program uses `printf`, does the code for `printf` get copied directly into the executable, or does the executable just ask the OS for it when it runs? How can multiple programs share the same system library without wasting RAM and disk space?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <dlfcn.h>
int main(void) {
    void *handle = dlopen("libm.so.6", RTLD_LAZY);
    double (*cos_fn)(double) = dlsym(handle, "cos");
    printf("%f\n", cos_fn(0.0));
    dlclose(handle);
    return 0;
}
```
**Output (via `gcc dltest.c -ldl -o dltest`):**
```
1.000000
```
This proves that a program can load a library file (`.so`) at runtime, dynamically search its symbol table for a function name, and execute it, entirely bypassing compile-time linking.

### Discard the throwaway
This throwaway dynamic loading example is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are observing pipeline behaviors.
- **Files affected:** `dltest.c` (created)
- **Change type:** Add
- **Location:** New file.
- **Dependencies:** `libdl` and `libm`.

### The New Code
```c
#include <stdio.h>
#include <dlfcn.h>

int main(void) {
    void *handle = dlopen("libm.so.6", RTLD_LAZY);
    if (!handle) { return 1; }

    double (*cos_fn)(double) = dlsym(handle, "cos");
    printf("cos(0) = %f\n", cos_fn(0.0));
    dlclose(handle);
    return 0;
}
```

### The Updated Project
```c
1: #include <stdio.h> // <- new
2: #include <dlfcn.h> // <- new
3: 
4: int main(void) { // <- new
5:     void *handle = dlopen("libm.so.6", RTLD_LAZY); // <- new
6:     if (!handle) { return 1; } // <- new
7: 
8:     double (*cos_fn)(double) = dlsym(handle, "cos"); // <- new
9:     printf("cos(0) = %f\n", cos_fn(0.0)); // <- new
10:     dlclose(handle); // <- new
11:     return 0; // <- new
12: } // <- new
```
This isolated file demonstrates how shared objects can be loaded at runtime.

### Mechanical walkthrough
- `#include <dlfcn.h>`: Includes declarations for the dynamic linking loader API.
- `void *`: A raw C pointer to an unspecified type.
- `handle`: The variable storing the reference to the loaded library.
- `dlopen`: A system function that maps a shared library into the process's virtual address space.
- `"libm.so.6"`: The name of the math shared library.
- `RTLD_LAZY`: A flag telling `dlopen` to resolve symbols only as they are executed.
- `if (!handle) { return 1; }`: Error checking in case the library is missing.
- `double`: The C return type for floating-point numbers.
- `(*cos_fn)(double)`: The syntax for declaring a function pointer named `cos_fn` that takes a `double` and returns a `double`.
- `dlsym`: A system function that scans the loaded library's symbol table for a string name and returns its memory address.
- `handle`: The library handle to search in.
- `"cos"`: The name of the function to find.
- `printf("cos(0) = %f\n", cos_fn(0.0));`: Calls the function through the pointer and prints the float result.
- `dlclose(handle);`: Unmaps the library from the process's address space.

### CS lens
**Dynamic Loading and Late Binding.** This is the fundamental CS concept of deferring the resolution of dependencies until the program is actually running. Real-world places it appears:
- Browser plugins or application extensions loading modules on demand.
- The JVM loading `.class` files dynamically as they are referenced.
- Game engines swapping out rendering backends (DirectX vs OpenGL .dlls) based on configuration.

### SE lens
**Static vs Dynamic Size/Updates.** The design principle is controlling dependency boundaries. The alternative NOT chosen is statically compiling `libm.a` directly into the binary. The real tradeoff is that static linking creates large, self-contained binaries that never break due to missing system files, while dynamic linking creates tiny binaries but risks "dependency hell" if the correct `.so` versions are missing at runtime.

### Commands needed
```bash
gcc -shared -fPIC math_util.c -o libmath.so
ldd /bin/ls
```

### Run it
Predicted confidently: Running `ldd /bin/ls` will show a list of `.so` dependencies like `libc.so.6`, proving that standard utilities heavily rely on dynamic linking to the OS standard libraries rather than compiling everything statically.

### One sentence connecting to previous unit
Understanding how the linker binds symbols at runtime is the final step in the pipeline that turns C source code into an executing process.

## Closing

### Connect the pieces
We have traced the compilation pipeline from source to executable. When you type `gcc add.c main.c -o prog`, the `gcc` driver orchestrates four distinct stages. First, `cpp` executes all text substitution, pasting header files and expanding macros. Second, `cc1` parses that raw C text and generates x86-64 assembly instructions (`add.s`). Third, `as` translates those mnemonics into raw binary opcodes inside object files (`add.o`). Finally, `ld` combines `add.o` and `main.o`, resolves the `extern` symbols, patches in absolute memory addresses, and dynamically links `libc` to produce a runnable ELF binary. You can now stop this pipeline at any stage and inspect the output. Lesson 06 dives into x86-64 assembly registers and the mov instruction. The compilation pipeline is a series of text-to-text and text-to-binary transformations, each with a clean interface, which is why you can replace any stage (e.g., use clang instead of gcc) without touching the others.
