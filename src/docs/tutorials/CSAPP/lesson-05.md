# Lesson 05: The Compilation Pipeline — Preprocessor, Compiler, Assembler, Linker

## What you need to know first
Lessons 00–04 (tour, C, bits, integers, floating point).

## What you will build
The reader will understand what each of the four compilation stages does, what files it reads and produces, why errors appear at different stages, and what an object file and executable actually contain. The transferable insight: "compilation" is four distinct programs run in sequence — confusing them leads to mysterious errors; understanding them turns every error message from cryptic to obvious.

## Objects and Methods
* gcc
  * What it is: The GNU Compiler Collection command-line driver.
  * Implementation: A C program that orchestrates the execution of cpp, cc1, as, and ld.
  * Its use: To compile C source files into executables or object files.
  * Type: Command-line tool.
  * Responsibility: Running the correct stages of the compilation pipeline with appropriate arguments.
  * Depends on: The preprocessor, compiler, assembler, and linker binaries.
  * Connects to: Source files, object files, and executables.
  * Shape: A command string like `gcc hello.c -o hello`.
* cpp
  * What it is: The C Preprocessor.
  * Implementation: A text-substitution engine.
  * Its use: Expanding macros, including headers, and evaluating conditional compilation directives.
  * Type: Text processor.
  * Responsibility: Transforming raw C source code into expanded C source code.
  * Depends on: Source files and header files.
  * Connects to: The compiler (cc1).
  * Shape: A program that takes a `.c` file and produces a `.i` file.
* cc1
  * What it is: The C Compiler.
  * Implementation: A complex program performing parsing, semantic analysis, and code generation.
  * Its use: Translating expanded C code into assembly language.
  * Type: Compiler.
  * Responsibility: Generating correct and optimized assembly code for the target architecture.
  * Depends on: The expanded source code from cpp.
  * Connects to: The assembler (as).
  * Shape: A program that takes a `.i` file and produces a `.s` file.
* as
  * What it is: The Assembler.
  * Implementation: A program that translates assembly mnemonics into machine code.
  * Its use: Converting text assembly into a relocatable object file.
  * Type: Assembler.
  * Responsibility: Generating machine code and building symbol and relocation tables.
  * Depends on: Assembly source files.
  * Connects to: The linker (ld).
  * Shape: A program that takes a `.s` file and produces a `.o` file.
* ld
  * What it is: The Linker.
  * Implementation: A program that combines object files and resolves references.
  * Its use: Creating the final executable binary.
  * Type: Linker.
  * Responsibility: Symbol resolution and relocation.
  * Depends on: Relocatable object files (`.o`) and libraries (`.a`, `.so`).
  * Connects to: The operating system loader.
  * Shape: A program that takes `.o` files and produces an executable without an extension (or `.exe`).

## Concept Units

### The four stages — overview

The tool that orchestrates all four stages is `gcc`. `gcc hello.c -o hello` runs all four automatically. You can stop at any stage: `gcc -E` (preprocess only), `gcc -S` (compile to assembly), `gcc -c` (assemble to object file). This pipeline was designed in the 1970s and is still used today — your Python interpreter, your web browser, your OS kernel all went through this exact pipeline.

Throwaway lab:
```racket
#lang racket
(displayln "gcc hello.c -o hello")
```

The pipeline stages:
1. `hello.c` --[cpp: Preprocessor]--> `hello.i` (expanded C source)
2. `hello.i` --[cc1: Compiler]------> `hello.s` (x86-64 assembly text)
3. `hello.s` --[as: Assembler]------> `hello.o` (relocatable object, binary)
4. `hello.o` --[ld: Linker]---------> `hello` (executable binary)

### Stage 1: The Preprocessor (cpp)

The preprocessor is a text transformation tool. It replaces `#include <file>` with the literal text of that file, replaces `#define NAME value` with the value everywhere NAME appears, evaluates `#ifdef` / `#ifndef` / `#endif` conditional compilation, removes comments (they are not needed after preprocessing), and handles `#pragma` and `#error` directives.

Throwaway lab:
```racket
#lang racket
(define GREETING "hello")
(define (MAX a b) (if (> a b) a b))
(displayln (format "~a, world" GREETING))
```

Why macros are dangerous: `MAX(a++, b)` expands to `((a++)>(b)?(a++):(b))` — `a` is incremented TWICE. This is why C++ replaced most macros with `inline` functions and templates.

### Stage 2: The Compiler (cc1)

The compiler takes the preprocessed C source and produces x86-64 assembly text. It performs lexical analysis, parsing, semantic analysis, IR generation, optimization, and code generation. Arguments arrive in `%rdi` and `%rsi` (System V AMD64 calling convention). The return value goes in `%rax`.

Throwaway lab:
```racket
#lang racket
(define (add a b) (+ a b))
(displayln (add 3 7))
```

### Stage 3: The Assembler (as)

The assembler reads the `.s` file (text) and produces a `.o` file (binary ELF object). An object file has sections like `.text` (machine code), `.data` (initialized global variables), `.bss` (uninitialized global variables), and `.symtab` (symbol table).

Throwaway lab:
```racket
#lang racket
(define symbol-table 
  (list (list "add" "FUNC" "GLOBAL" ".text" 0 8)
        (list "main" "FUNC" "GLOBAL" ".text" 8 32)
        (list "printf" "FUNC" "GLOBAL" "UNDEF" 0 0)))
(displayln symbol-table)
```

`printf` is UNDEF — the assembler doesn't know where it is. The linker will resolve it.

### Stage 4: The Linker (ld)

The linker combines multiple `.o` files and libraries into one executable. Its two main tasks are symbol resolution (every UNDEF symbol must be defined exactly once) and relocation (patching addresses so functions can call each other).

Throwaway lab:
```racket
#lang racket
(define resolved-printf-address "0x401050")
(displayln (string-append "call " resolved-printf-address))
```

Two common linker errors are "undefined reference" (missing library or object file) and "multiple definition" (two files define the same symbol).

### Static vs dynamic linking

Static library (`.a` = archive): the linker COPIES the needed `.o` files from the library into the executable.
Dynamic library (`.so` = shared object): the linker records which library is needed but does NOT copy the code. The dynamic linker (`ld.so`) loads the library at runtime and patches the addresses.

Throwaway lab:
```racket
#lang racket
(displayln "ldd ./hello shows: libc.so.6")
```

Shared libraries must be compiled as Position-Independent Code (PIC) using `-fPIC` so they can be loaded at any address.

### What goes wrong at each stage — error diagnostics

Preprocessor errors: `fatal error: stdio.h: No such file or directory` → You spelled `#include` wrong.
Compiler errors: `error: 'printf' undeclared` → Missing `#include <stdio.h>`.
Assembler errors: `Error: junk at end of line` → Usually only happens if you write assembly directly.
Linker errors: `undefined reference to 'sqrt'` → Missing `-lm` flag.

Throwaway lab:
```racket
#lang racket
(displayln "Understanding WHICH stage produced an error is half the battle.")
```

## Closing
Module 1 continues with Lesson 06 — x86-64 assembly. Now that you know how the compiler produces assembly, you'll read it. This is where C programming becomes systems programming.
Exercises:
1. What does `gcc -E hello.c` output?
2. What happens if you define a function in two different `.c` files and link them together?
3. What is the difference between a `.a` file and a `.so` file?
