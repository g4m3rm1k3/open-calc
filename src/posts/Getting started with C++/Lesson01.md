# C++ and the Machine: A First Program

In 1979, a Danish computer scientist named Bjarne Stroustrup sat in a Bell Labs office in Murray Hill, New Jersey, frustrated. He was writing a distributed operating system for his PhD dissertation at Cambridge and had discovered that Simula 67 — the language designed specifically for object-oriented programming and simulation — was simply too slow. The runtime overhead of Simula's virtual dispatch was killing him. But C, the language that Bell Labs ran on, was blazingly fast and gave him direct control over memory. It just didn't have any notion of classes, objects, or the elegant type abstractions he needed.

So he started adding them. He built a preprocessor called *Cfront* that took his new hybrid language — initially called **"C with Classes"** — and translated it into plain C, which then compiled normally. It was a hack, but it worked. The language grew: virtual functions in 1983, operator overloading, references, constants. By the time he formally named it **C++** in 1983, the joke was already baked in. The `++` is C's post-increment operator — applied to the name of C itself. Even the language's name is a piece of code.

C++ is now 45 years old. It runs inside your browser's JavaScript engine, your game engine, your operating system's kernel modules, the trading algorithms moving billions of dollars per second, and the firmware of spacecraft. It is one of the most consequential pieces of software engineering thinking in history, and it starts with a single file and a compiler.

## What "Compiled" Actually Means

Before you write a single line of C++, you need to understand something that Python and JavaScript programmers often take for granted: the distinction between source code and machine code.

When you write Python, there's an *interpreter* sitting between you and the CPU. You run `python script.py`, and the Python runtime reads your source file, converts it on the fly into bytecode, and executes it. Every time you run the script, that translation happens again. This convenience comes at a cost: there's always a middleman, and the middleman takes time.

C++ works differently. You write source code once, and you hand it to a **compiler** — specifically, a program like `g++` (GNU C++ Compiler) or `clang++` — which reads your entire program, analyzes it, optimizes it, and produces a **binary executable**: a file of raw machine instructions your CPU can run directly, with no middleman. That binary is what you ship, what you deploy, what your customers run.

```cpp
// This is your source code — human readable
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

The implication is significant. The compiler has **full visibility** into your entire program before it runs a single instruction. It can inline functions across files, eliminate dead code, reorder operations for better CPU pipeline utilization, replace a loop that always runs five times with five separate statements. Python can't do this — it sees one line at a time. This is why C++ programs are often 10–100x faster than equivalent Python for compute-intensive work.

## The Four Stages of Building a C++ Program

When you run `g++ main.cpp -o hello`, you're actually triggering a pipeline of four distinct tools. Understanding this pipeline will save you hours of debugging.

**Stage 1 — Preprocessing.** The C preprocessor (a separate program, `cpp`) runs first. It handles every line that starts with `#`. The `#include <iostream>` directive tells the preprocessor: "Find the file called `iostream` in the system include path and paste its entire contents right here." By the time the preprocessor is done, your "one-line include" has expanded into thousands of lines of type declarations and function signatures. You can see this with `g++ -E main.cpp`.

**Stage 2 — Compilation.** The compiler itself (`cc1plus` inside GCC) parses the expanded source code, type-checks it, and translates it into assembly language — the human-readable form of CPU instructions specific to your architecture.

**Stage 3 — Assembly.** The assembler (`as`) converts the assembly text into binary **object code** — a `.o` file. This is nearly machine code, but it has unresolved references: it knows that `std::cout` exists but not yet where it lives in memory.

**Stage 4 — Linking.** The linker (`ld`) takes your `.o` files and the pre-compiled standard library (`libstdc++.so` or `libstdc++.a`) and resolves all those references. It produces the final executable where every function call points to a real address.

Each stage can fail. When you get a **"undefined reference to..."** error, that's the linker failing — you've declared a function but forgotten to compile the file that defines it. When you get a **"no member named..."** error, that's the compiler. Knowing which stage failed points you to the right fix immediately.

## Anatomy of Hello World

Let's dissect that first program:

```cpp
#include <iostream>
using namespace std;

// __OUTPUT__: Hello, World!
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

**`#include <iostream>`** — This is the most common include in C++. `iostream` is the *input/output stream* library. Without it, the compiler has no idea what `cout` is. The angle brackets mean "look in the system include path"; your own headers use quotes: `#include "myfile.h"`.

**`using namespace std;`** — The entire C++ standard library lives in a namespace called `std`. A **namespace** is a named scope that prevents naming collisions. Without this line, you'd need to write `std::cout`, `std::endl`, `std::string` everywhere — the `std::` prefix makes it explicit that this name comes from the standard library. In educational code, `using namespace std` is convenient. In large production codebases, developers usually prefer explicit `std::` prefixes to avoid subtle bugs where your local function `find()` silently shadows `std::find()`.

**`int main()`** — Every C++ program must have exactly one `main` function. This is the entry point — where execution begins. The `int` means it returns an integer. This integer is the **exit code**, reported back to the shell. By universal Unix convention: `0` means success, anything else means failure. This is why `return 0;` ends `main`.

**`cout << "Hello, World!" << endl;`** — `cout` is the standard character output stream, connected to your terminal's stdout. The `<<` operator is the *stream insertion operator* — it "inserts" data into the stream. `endl` is a stream manipulator that writes a newline character (`\n`) *and* flushes the buffer, ensuring the text actually appears immediately. (Using `"\n"` instead of `endl` is faster when you have a lot of output, because flushing is expensive.)

## Running the Program

In a real environment, the workflow is:

```bash
g++ main.cpp -o hello   # compile
./hello                  # run
echo $?                  # check exit code (should be 0)
```

The `-o hello` flag names the output binary. Without it, GCC defaults to `a.out` — a historical artifact from the days of "assembler output." Always name your binaries explicitly.

The `&&` operator lets you chain commands, running the second only if the first succeeds (exit code 0):

```bash
g++ main.cpp -o hello && ./hello
```

This is actually using the exact same mechanism as `return 0`. The shell is checking your program's exit code.

## The `__OUTPUT__` Annotation

The runnable code blocks in this blog use a virtual compiler. When you run a `cpp` block, it sends your code to a real compiler (Wandbox) over the network. The `// __OUTPUT__: Hello, World!` comment in some examples is just a documentation hint showing what to expect — the real output comes from the actual compiler.

Try editing the string in the example above. Change `"Hello, World!"` to your name and run it. You just compiled and ran real C++.

## Variations and Experiments

C++ gives you several ways to write the same thing. Here's `printf` — the C function that `cout` was designed to replace:

```cpp
#include <cstdio>

int main() {
    printf("Hello from C-style printf!");
    printf("\n");
    return 0;
}
```

`printf` is faster than `cout` in some benchmarks (it doesn't go through the full stream machinery), but it has no type safety — passing the wrong type to a format string is undefined behavior and a source of real security vulnerabilities. `cout` is type-safe: the compiler knows the type of what you're inserting.

You can also use `std::print` in C++23, finally bringing Python-style formatted output into the standard:

```cpp
#include <iostream>
#include <format>

int main() {
    std::cout << std::format("The answer is {}", 42) << std::endl;
    return 0;
}
```

## What "Undefined Behavior" Means

You'll hear this phrase constantly in C++. When the C++ standard says something is **undefined behavior (UB)**, it means the standard places no constraints on what the program does. The compiler is free to assume it never happens and optimize accordingly. This is not a bug in the compiler — it's a design choice that enables extraordinary optimization but demands programmer discipline.

The canonical example: signed integer overflow. In C++, `INT_MAX + 1` is undefined behavior. GCC has been known to simply *remove* the check `if (x + 1 > x)` because it assumes signed overflow never happens, making that condition always true. Real security vulnerabilities have been introduced this way.

C++ gives you the power and performance of the machine. That power comes with responsibility. The language trusts you. This series is about learning to be worthy of that trust.

## Where We're Going

Over the next lessons, we'll build upward from this foundation: types and memory, operators, control flow, functions, arrays, pointers, classes, templates. Each topic will tie back to the same question: *why does C++ work this way?* The answer is almost always rooted in the 1970s, in the hardware constraints of that era, and in Bjarne's fundamental goal — to give programmers the tools to write large, complex programs without sacrificing the performance of C.

Let's go.
