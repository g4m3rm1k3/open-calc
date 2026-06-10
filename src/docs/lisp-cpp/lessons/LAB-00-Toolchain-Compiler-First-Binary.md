# Lisp-CPP — LAB 00 — Toolchain: Compiler, Build System, First Binary

**Prerequisites:** A terminal. A text editor. No C++ knowledge assumed.

**What this lab adds:**
- A working C++ source file
- A CMake build system that compiles it
- A native binary that prints to the terminal

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Python runs your code directly from the `.py` file. What do you think C++ does differently?
> 2. If you write a function in one `.cpp` file and call it from another, what problem needs solving before the program can run?
> 3. What does `./lisp` mean compared to just typing `lisp`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is done, your terminal will look exactly like this:

```
$ cmake -S . -B build
-- The CXX compiler identification is GNU 11.4.0
-- Configuring done
-- Build files have been written to: /home/user/lisp-cpp/build
$ cmake --build build
[ 50%] Building CXX object CMakeFiles/lisp.dir/src/main.cpp.o
[100%] Linking CXX executable lisp
[100%] Built target lisp
$ ./build/lisp
Lisp interpreter v0.1
```

That last line comes from a native binary — machine code your CPU reads directly,
with no Python, no Node, no runtime of any kind sitting between your code and the hardware.

---

## Concept: Compiled vs. Interpreted Languages

**What it is:** A compiler translates your entire source file into machine code
before any of it runs. An interpreter reads and executes your source code
line-by-line at runtime.

**The problem this solves:**

CPUs do not understand C++ or Python. They understand machine code: a sequence
of binary instructions specific to their architecture (x86-64, ARM, etc.).
Something must bridge the gap between human-readable source and CPU instructions.

**How each approach bridges that gap:**

```
INTERPRETED (Python, JavaScript):
  Your .py file
      ↓
  Python interpreter (itself a compiled binary)
      ↓ reads and executes each line
  CPU

COMPILED (C++, Rust, C):
  Your .cpp file
      ↓
  Compiler (g++) — runs once, offline
      ↓ produces
  Binary (./lisp) — machine code
      ↓ runs directly
  CPU
```

**What this means in practice:**

- A compiled binary runs with no interpreter present. Copy `./lisp` to any
  Linux machine with the same CPU architecture and it works.
- Compiled code runs faster because there is no interpreter overhead at runtime.
  The compiler had time to optimize during compilation.
- Compiled code catches many errors at compile time, before you ever run anything.
  If you misspell a function name in C++, you find out immediately. In Python,
  you find out when that line executes — which might be hours into a run.

**Transfer:** This series builds an interpreter written in a compiled language.
You will see both models simultaneously: the C++ compiler compiles your interpreter
binary once; your interpreter then interprets Lisp source code at runtime. This
is how CPython (the reference Python implementation) works: compiled C code that
interprets Python bytecode.

---

## Concept: The Four Stages of C++ Compilation

**What it is:** `g++` is not one program — it is four programs run in sequence.
Each stage transforms your code into a form the next stage can process.

**The stages:**

```
Stage 1 — Preprocessor
  Input:  your .cpp file (text)
  Job:    expands #include, #define, #ifdef
  Output: one big .cpp file with all includes pasted in
  Tool:   cpp (the C preprocessor)

Stage 2 — Compiler
  Input:  preprocessed .cpp (text)
  Job:    translates C++ to assembly language
  Output: .s file (assembly text — human readable but machine-specific)
  Tool:   cc1plus (the actual C++ compiler)

Stage 3 — Assembler
  Input:  .s file (assembly text)
  Job:    translates assembly to binary machine code
  Output: .o file (object file — binary, not yet runnable)
  Tool:   as (the GNU assembler)

Stage 4 — Linker
  Input:  one or more .o files
  Job:    combines them into one executable, resolves cross-file references
  Output: ./lisp (the final runnable binary)
  Tool:   ld (the GNU linker)
```

**Why you need to know this:**

Error messages tell you which stage failed:
- `error: 'printf' was not declared` → compiler stage (you forgot `#include`)
- `undefined reference to 'tokenize'` → linker stage (you forgot to add `lexer.cpp` to CMake)
- `Segmentation fault` at runtime → the binary ran but did something illegal with memory

When you know which stage the error comes from, you know where to look.

**Transfer:** Every C, C++, and Rust project goes through these same four stages.
The Rust compiler (`rustc`) runs them internally. CMake coordinates them for
multi-file projects. Understanding stages is what lets you read compiler error
messages instead of just guessing.

---

## Concept: What `main()` Is and Why It Looks That Way

**What it is:** `main` is the function the operating system calls when your binary starts.
It is the mandatory entry point — every C++ program must have exactly one.

**The full signature explained, word by word:**

```cpp
int main(int argc, char* argv[])
```

| Part | Type | Meaning |
|------|------|---------|
| `int` | return type | main returns an integer — the exit code |
| `main` | function name | the OS looks for this exact name |
| `int argc` | parameter 1 | **arg**ument **c**ount: how many command-line arguments |
| `char* argv[]` | parameter 2 | **arg**ument **v**ector: array of the actual argument strings |

**Exit codes — what `return 0` means:**

When `main` returns, it hands that integer back to the operating system.
By convention: `0` = success, anything else = error.
This is how shell scripts use `&&`:

```bash
cmake --build build && ./lisp   # only runs ./lisp if cmake succeeded (returned 0)
```

**`char*` — what is the asterisk?**

`char` is the type for a single character. `char*` is a **pointer** to a character —
specifically, the memory address where the first character of a string lives.
C-style strings are just a sequence of characters in memory ending with a
zero byte (`\0`). The pointer tells you where they start.

You do not need to fully understand pointers yet — LAB-01 covers them completely.
For now: `char* argv[]` means "an array of strings."

**`argc` and `argv` in practice:**

```bash
./lisp script.lisp --verbose
```

In this call:
- `argc` = 3 (three strings: `"./lisp"`, `"script.lisp"`, `"--verbose"`)
- `argv[0]` = `"./lisp"` (always the program name)
- `argv[1]` = `"script.lisp"`
- `argv[2]` = `"--verbose"`

We use these in LAB-28 to load Lisp source files from the command line.
For now, we ignore them.

**Transfer:** Every compiled language has an entry point with this same shape:
Rust has `fn main()`, Go has `func main()`, Java has `public static void main(String[] args)`.
The `args` parameter in all of them serves the same purpose as `argv` in C++.

---

## Concept: `#include` and Header Files

**What it is:** `#include` is a preprocessor directive that copies the contents
of another file into your source file before the compiler sees it.

**The problem without it:**

`printf` is a function defined in the C standard library — it was compiled years
ago and lives in a binary library file on your system. To call it, your compiler
needs to know its *signature*: what parameters it takes, what it returns.
That signature lives in a **header file** (`cstdio`). Without `#include <cstdio>`,
the compiler has never seen the name `printf` and refuses to compile.

**Angle brackets vs. quotes:**

```cpp
#include <cstdio>    // look in the system's standard library directories
#include "lexer.h"   // look in your project directory first, then system dirs
```

Standard library headers use `< >`. Your own headers use `" "`.

**What the preprocessor actually does:**

The preprocessor finds `cstdio` on your system (typically at
`/usr/include/c++/11/cstdio`) and pastes its entire contents at the
`#include` line. The compiler then sees one giant file. This is why
compile errors sometimes reference line numbers in headers you never
directly edited.

**`\n` — what is the backslash-n in the string?**

Inside a string literal (`"..."`), the backslash introduces an **escape sequence** —
a special character that cannot be typed directly:

| Escape | Character | ASCII value |
|--------|-----------|-------------|
| `\n`   | newline   | 10 |
| `\t`   | tab       | 9  |
| `\\`   | literal backslash | 92 |
| `\0`   | null terminator (end of string) | 0 |

Without `\n`, `printf("Lisp interpreter v0.1")` would print with no newline
and the next shell prompt would appear on the same line.

**Transfer:** Python's `import`, JavaScript's `import`/`require`, Rust's `use` —
all solve the same problem: making a name from another file visible in the current
one. C's `#include` is the most raw version: it literally copies text. Every
other language learned from C's problems and built something cleaner.

---

## Concept: CMake — Why a Build System Exists

**What it is:** CMake is a build system generator. It reads `CMakeLists.txt`
(your description of the project) and generates the platform-specific build
files (`Makefile` on Linux/macOS, Visual Studio project files on Windows) that
do the actual compilation.

**The problem without it:**

With one file, you compile like this:
```bash
g++ -std=c++17 -Wall -fsanitize=address -o lisp src/main.cpp
```

By LAB-07 you have six source files. Every time you compile:
```bash
g++ -std=c++17 -Wall -fsanitize=address -o lisp src/main.cpp src/lexer.cpp src/parser.cpp src/eval.cpp src/environment.cpp src/value.cpp
```

Forget one file → linker error. Add a file → update every developer's compile
command. Move a file → update again. On Windows the command is different.
On macOS the AddressSanitizer flag is spelled differently.

**How CMake solves this:**

You describe the project once in `CMakeLists.txt`. CMake generates the right
build files for whatever platform you are on. Then you just type `cmake --build build`.
CMake also tracks which files changed and only recompiles those — this is called
**incremental compilation**. A change to `lexer.cpp` recompiles only `lexer.cpp`,
not all six files.

**What each CMakeLists line does:**

```cmake
cmake_minimum_required(VERSION 3.20)
```
Declares the minimum CMake version needed. If someone has CMake 2.8, they get
a clear error immediately instead of a confusing failure later.

```cmake
project(lisp CXX)
```
Names the project `lisp` and declares the language is C++ (`CXX` is CMake's
name for C++). This tells CMake to find a C++ compiler.

```cmake
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
```
Requires C++17. `std::variant` (LAB-19) and `std::optional` need it.
`REQUIRED ON` means: fail loudly if C++17 is unavailable. Without it,
CMake silently falls back to an older standard and your code fails with
cryptic errors deep in a source file.

```cmake
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fsanitize=address -fno-omit-frame-pointer")
```
`CMAKE_CXX_FLAGS` is the string of flags passed to `g++` for every compilation.
`${CMAKE_CXX_FLAGS}` expands the existing value (so we append, not replace).
`-fsanitize=address` enables **AddressSanitizer** (explained next).
`-fno-omit-frame-pointer` keeps stack frame pointers in the binary so ASAN
can show you meaningful stack traces.

```cmake
add_executable(lisp src/main.cpp)
```
Declares one executable target named `lisp`, built from `src/main.cpp`.
As files are added each lab, they appear here.

```cmake
target_compile_options(lisp PRIVATE -Wall -Wextra)
```
`-Wall` enables all standard warnings. `-Wextra` enables additional ones.
`PRIVATE` means these flags apply only to this target, not to dependencies.
Warnings are not errors — the code still compiles — but they flag probable bugs.

**Transfer:** Every large C++ project uses CMake (LLVM, FreeCAD, OpenCV, Qt).
Rust's equivalent is `Cargo.toml`. Python's is `pyproject.toml`. The concept —
describe the project once, generate platform-specific build instructions — is universal.

---

## Concept: AddressSanitizer — Your Memory Safety Net

**What it is:** AddressSanitizer (ASAN) is a compiler feature that instruments
every memory access in your binary to detect memory errors at runtime.

**What it catches:**

| Error | What it means |
|-------|--------------|
| Use-after-free | Accessing memory after calling `delete` |
| Heap buffer overflow | Writing past the end of a `new`-allocated array |
| Stack buffer overflow | Writing past the end of a local array |
| Memory leak | Allocating with `new` and never calling `delete` |

**How it works:**

ASAN adds shadow memory alongside every allocation — metadata that tracks
whether each byte of memory is valid to access. Every load and store in your
program is preceded by a check against the shadow memory. If the check fails,
ASAN prints a detailed report and terminates the program.

This is critical for this project. By LAB-06 you are managing raw pointers
to tree nodes. ASAN is the difference between a bug that silently corrupts
data and a bug that immediately tells you exactly which line caused it.

**The cost:** Programs run roughly 2x slower with ASAN. That is fine for
development. For the final release build (if you ever make one), you remove
the flag.

**Transfer:** Valgrind does the same job without compiler instrumentation, but
runs 20x slower. ASAN is the modern replacement. Both Rust's borrow checker
and ASAN exist because C and C++ have no built-in memory safety — they differ
in when they catch errors (compile time vs. runtime).

---

## Step 1 — Create the Project Structure

Open a terminal. Create the directories:

```bash
mkdir lisp-cpp
cd lisp-cpp
mkdir src
```

Your final project structure over the series will be:

```
lisp-cpp/
├── CMakeLists.txt     ← build description (you write this)
├── src/
│   ├── main.cpp       ← entry point (you write this)
│   ├── lexer.h        ← added in LAB-05
│   ├── lexer.cpp      ← added in LAB-05
│   └── ...            ← more files added each lab
└── build/             ← generated by CMake, never edit manually
    ├── Makefile
    └── lisp           ← the compiled binary
```

**Why `build/` is separate from source:**

CMake generates dozens of files in the build directory: Makefiles, dependency
tracking files, compiler caches. Keeping them in `build/` means:
1. `git status` only shows your source files
2. If the build breaks, `rm -rf build/` and start fresh — your source is untouched
3. This is called an **out-of-source build** and is CMake best practice

---

## Step 2 — Write `CMakeLists.txt`

Create `CMakeLists.txt` in the `lisp-cpp/` root (not inside `src/`):

```cmake
cmake_minimum_required(VERSION 3.20)            # ← add this

project(lisp CXX)                               # ← add this

set(CMAKE_CXX_STANDARD 17)                      # ← add this
set(CMAKE_CXX_STANDARD_REQUIRED ON)             # ← add this

set(CMAKE_CXX_FLAGS                             # ← add this
    "${CMAKE_CXX_FLAGS} -fsanitize=address -fno-omit-frame-pointer")

add_executable(lisp                             # ← add this
    src/main.cpp
)

target_compile_options(lisp PRIVATE -Wall -Wextra)  # ← add this
```

Every line is explained in the CMake concept block above.

---

## Step 3 — Write `src/main.cpp`

Create `src/main.cpp`:

```cpp
#include <cstdio>   // ← provides printf — explained in the #include concept block

// main() is the entry point — the OS calls this function when the binary starts.
// int argc: how many command-line arguments were passed
// char* argv[]: the actual argument strings (array of C strings)
// We ignore both for now — they become useful in LAB-28
int main(int argc, char* argv[]) {

    // printf: print formatted text to stdout (the terminal).
    // "..." is a string literal — text between double quotes.
    // \n is the newline escape sequence — moves the cursor to the next line.
    printf("Lisp interpreter v0.1\n");

    // Return 0 to the OS: signal that the program succeeded.
    // Non-zero return = error. Shell scripts use this to chain commands.
    return 0;
}
```

---

## Step 4 — Configure and Build

From inside `lisp-cpp/`:

```bash
cmake -S . -B build
```

- `-S .` tells CMake: the source is in the current directory (`.`)
- `-B build` tells CMake: put generated files in `build/`

This generates the `Makefile`. You only need to run this once (or when you
change `CMakeLists.txt`).

```bash
cmake --build build
```

This runs `make` inside the `build/` directory. It compiles `main.cpp` and
links the `lisp` binary.

### COMPILE AND RUN

```bash
cmake -S . -B build
cmake --build build
./build/lisp
```

You should see:
```
Lisp interpreter v0.1
```

**Check the exit code:**
```bash
echo $?
```
Expected: `0`

`$?` is a shell variable that holds the exit code of the last command.
This is `return 0` from `main()` — it traveled from your C++ code through
the OS and into the shell variable.

**Change something:** Change `v0.1` to `v0.2`. Run `cmake --build build` again
(no need to re-run `cmake -S . -B build`). You should see `[ 50%] Building CXX object...`
followed by `[100%] Linking`. Only `main.cpp` recompiled — not because there is
only one file, but because CMake tracked that only this file changed. Change it back.

**What if it breaks?**

| Error message | Cause | Fix |
|---------------|-------|-----|
| `cmake: command not found` | CMake not installed | `sudo apt install cmake` |
| `g++: command not found` | GCC not installed | `sudo apt install build-essential` |
| `error: 'printf' was not declared` | Missing `#include <cstdio>` | Add the include |
| `CMakeLists.txt not found` | Wrong directory | Run from `lisp-cpp/`, not `src/` |
| `./build/lisp: No such file` | Build failed silently | Check the `cmake --build` output for errors |

---

## Step 5 — Inspect the Binary

```bash
ls -lh ./build/lisp
```

Expected: a file 100KB–2MB. This is the compiled machine code.

```bash
file ./build/lisp
```

Expected (Linux): `lisp: ELF 64-bit LSB pie executable, x86-64, ...`

- **ELF** — Executable and Linkable Format: the binary container format Linux uses
- **64-bit** — uses 64-bit memory addresses (can address up to 16 exabytes of RAM)
- **x86-64** — compiled for Intel/AMD 64-bit processors
- **pie** — Position Independent Executable: can load at any memory address (a security feature)

This file contains no C++ syntax, no variable names, no comments. Just the
sequence of machine instructions your CPU executes directly.

---

## What Just Happened

You wrote three lines of C++ and they produced a CPU-executable binary.
The path: `main.cpp` → preprocessor expands `#include <cstdio>` →
compiler translates to machine code → linker produces `./build/lisp` →
OS loads it into memory → CPU executes it → `printf` calls the OS's
`write` system call → characters appear in the terminal.

Every lab adds to this binary. By LAB-24 it will be an interactive Lisp REPL.
The binary is the vessel — everything you build lives inside it.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| CMake configured | `cmake -S . -B build` exits with no errors |
| Binary compiled | `cmake --build build` produces `build/lisp` |
| Binary runs | `./build/lisp` prints `Lisp interpreter v0.1` |
| Exit code correct | `echo $?` prints `0` immediately after |
| ASAN active | No ASAN errors printed during normal run |
| Incremental build works | Change version string, rebuild — only one file recompiles |

---

## Self-Check (answer from memory after completing the lab)

1. Name the four stages of C++ compilation. What does each stage produce?
2. What does `return 0` in `main()` communicate, and to what?
3. Why does `#include <cstdio>` use angle brackets instead of quotes?
4. What problem does CMake solve that a single `g++` command does not?
5. What kind of memory error does AddressSanitizer detect that the compiler itself cannot?

---

## What's Next

LAB-01 opens the running binary in your mind — you will see the two memory regions
C++ programs use (stack and heap), write your first pointer, and understand why
every data structure decision in this interpreter traces back to those two regions.

---

## Quick Check Answers

**1. What does C++ do differently from Python?**
C++ compiles the entire program to machine code before any of it runs. The result
is a binary that the CPU executes directly — no interpreter needed at runtime.
Python reads and executes the source file line-by-line through the Python interpreter
at runtime. C++ pays the compilation cost once; Python pays interpretation cost every run.

**2. If you write a function in one `.cpp` file and call it from another, what problem needs solving?**
The linker problem. The compiler turns each `.cpp` file into an `.o` object file
independently. Each `.o` may reference functions defined in other `.o` files.
The linker's job is to connect those references — to find the definition of
`tokenize()` in `lexer.o` and wire it to the call site in `main.o`. Without the
linker, you get "undefined reference" errors even though the function exists.

**3. What does `./lisp` mean compared to just `lisp`?**
`./` means "in the current directory." Without it, the shell searches every
directory in your `PATH` environment variable (`/usr/bin`, `/usr/local/bin`, etc.)
for a program named `lisp`. Since you did not install your interpreter there,
the shell cannot find it. `./` bypasses the PATH search and looks exactly where
you tell it. This is also a security feature: a malicious `ls` binary in your
current directory cannot accidentally run when you type `ls` — the shell only
finds programs in PATH, not the current directory, unless you use `./`.
