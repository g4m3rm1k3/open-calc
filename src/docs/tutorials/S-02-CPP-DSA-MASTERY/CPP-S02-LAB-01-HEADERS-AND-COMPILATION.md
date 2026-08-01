# CPP DSA — LAB-01 — Header Files and Compilation

**Prerequisites:** Basic C++ syntax (variables, functions, if you can write and compile a single `.cpp` "hello world," you're ready)

## Quick Check

Before starting, answer these (answers at the bottom):

1. When you write `#include <iostream>`, what does the compiler actually do with that line?
2. Why can't you just write your entire program in one giant `.cpp` file forever and call it a day?
3. What do you think happens if the same function is *defined* (not just declared) in two files that both get compiled together?

## What You Will Build

A two-file C++ project — `Greeter.h` and `Greeter.cpp` — plus a `main.cpp` that uses it, compiled by hand from the command line so you see every step the build process actually performs, not just a single "Run" button doing something invisible.

```
$ g++ -c Greeter.cpp -o Greeter.o
$ g++ -c main.cpp -o main.o
$ g++ Greeter.o main.o -o greeter_app
$ ./greeter_app
Hello, Ada! Welcome to the DSA series.
```

## Concept: Declaration vs. Definition — Why Header Files Exist

**What it is:** C++ splits every function and class into two separate ideas: a **declaration** (its name, parameters, and return type — "this exists and looks like this") and a **definition** (the actual body — "here's what it does"). A header file (`.h`) conventionally holds declarations; a source file (`.cpp`) holds definitions. `#include` is a literal, dumb text-paste operation — the preprocessor copies the entire contents of the included file into the spot where `#include` appears, before the compiler ever runs.

**The problem before:** If every `.cpp` file in a project needs to *use* a function, but only one `.cpp` file should *define* it, how does the file using it even know the function exists, what it's called, and what arguments it takes? Copy-pasting the function's full body into every file that uses it would work, technically — until you have ten files all defining the same function, and the linker (the tool that stitches compiled files together) has no idea which one is the "real" one, and refuses to build at all. This is the answer to Quick Check question 3, and it's not a hypothetical — it's a real, common beginner error called a "multiple definition" linker error.

**The solution:** Declare once, in a header, include that header everywhere the function is *used*. Define once, in exactly one `.cpp` file. The compiler processes each `.cpp` file completely independently into an object file (`.o`), using only the declarations it can see (via `#include`) to check that calls look correct — it doesn't need the actual definition yet, just the promise that one exists somewhere. Only later, at the **link** step, does the linker take every `.o` file and stitch them into one program, matching each declared-but-not-yet-defined function call to its one real definition.

**Canonical example:**

```cpp
// Greeter.h -- the declaration (the promise)
#ifndef GREETER_H
#define GREETER_H

void greet(const std::string& name);

#endif
```

```cpp
// Greeter.cpp -- the definition (the promise kept)
#include "Greeter.h"
#include <iostream>

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "! Welcome to the DSA series.\n";
}
```

**Project Application:** Every data structure in this series — `MyVector`, `MyLinkedList`, `MyHashMap` — gets its own `.h`/`.cpp` pair starting in LAB-06. Getting comfortable with this split now means every later lab's file layout is already familiar, not a new hurdle stacked on top of a new data structure.

**Watch for:** Forgetting the header guard (`#ifndef`/`#define`/`#endif`, explained in Step 2). Without it, a header accidentally `#include`-d twice by different files that both get compiled together produces the exact "multiple definition" error this lab's concept section just described — except now it's a bug in *your* project, not a hypothetical.

## Step 1: One file, then splitting it

Start with everything in one file, to see the baseline before splitting it:

```cpp
// main.cpp -- everything in one file, for now
#include <iostream>
#include <string>

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "! Welcome to the DSA series.\n";
}

int main() {
    greet("Ada");
    return 0;
}
```

Compile and run it directly — no splitting yet:

```
$ g++ main.cpp -o greeter_app
$ ./greeter_app
Hello, Ada! Welcome to the DSA series.
```

This single command actually did two jobs at once, invisibly: it **compiled** `main.cpp` into machine code, and it **linked** that machine code into a runnable program, `greeter_app`. Step 2 splits the file; Step 3 splits that single command into its real two steps, so you see the seam that was hidden here.

### SAVE AND TRY

Run the two commands above yourself. Confirm `greeter_app` (or `greeter_app.exe` on Windows) is a new file that appeared in your directory — that's the actual compiled program, not something virtual the IDE is hiding from you.

## Step 2: Splitting into a header and a source file

```cpp
// Greeter.h
#ifndef GREETER_H
#define GREETER_H

#include <string>

void greet(const std::string& name);

#endif
```

```cpp
// Greeter.cpp
#include "Greeter.h"
#include <iostream>

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "! Welcome to the DSA series.\n";
}
```

```cpp
// main.cpp
#include "Greeter.h"

int main() {
    greet("Ada");
    return 0;
}
```

`#ifndef GREETER_H` / `#define GREETER_H` / `#endif` is a **header guard**: the first time this file is `#include`-d, `GREETER_H` isn't yet defined, so the preprocessor defines it and includes everything between the guards. If the *same* header gets `#include`-d again anywhere else in the same compiled unit (which happens more often than you'd expect once projects grow — one header including another, which includes the first again), `GREETER_H` is now already defined, so the preprocessor skips the entire contents the second time, preventing the exact "declared twice" problem a raw copy-paste `#include` would otherwise cause.

Notice `main.cpp` uses `#include "Greeter.h"` (quotes) while `<iostream>` uses angle brackets — quotes tell the preprocessor to look in the current project directory first; angle brackets tell it to look in the system/standard library search paths. Using the wrong one for your own files is a common "file not found" error for beginners.

### SAVE AND TRY

Create all three files exactly as shown, in the same directory. Before compiling, trace through by hand: when the preprocessor processes `main.cpp`, what does the fully-expanded, `#include`-resolved text of that file actually look like, top to bottom? Write it out on paper or in a scratch file — this is exactly what `g++ -E main.cpp` would show you if you ran it (try that command too, and compare).

## Step 3: Compiling each file separately, then linking

```
$ g++ -c Greeter.cpp -o Greeter.o
$ g++ -c main.cpp -o main.o
$ g++ Greeter.o main.o -o greeter_app
$ ./greeter_app
Hello, Ada! Welcome to the DSA series.
```

`-c` tells `g++` to **compile only** — translate one `.cpp` file into an object file (`.o`) containing machine code, and stop. Compiling `main.cpp` alone succeeds even though `greet`'s actual *definition* lives in a completely different file `main.cpp` was never shown — because `main.cpp` only needed `Greeter.h`'s *declaration* to check the call `greet("Ada")` looks correct (right name, right argument type). The final command with no `-c` flag is the **link** step: it takes both `.o` files and produces one executable, and this is the step that actually resolves `main.o`'s call to `greet` against `Greeter.o`'s real definition of it.

### SAVE AND TRY

Run only the first two commands (both `-c` compiles), then try to run `./greeter_app` — it won't exist yet, because you haven't linked. Then run just the compile of `main.cpp` alone, without ever compiling `Greeter.cpp`, and try to link `main.o` by itself into an executable (`g++ main.o -o greeter_app`). You should get a linker error mentioning `greet` is undefined — a hands-on demonstration of the declaration/definition split: the compile step was happy with just the declaration, but the link step demands the real definition exists *somewhere* among the files you gave it.

## Step 4: What happens without a header guard (reproducing the bug on purpose)

```cpp
// BrokenGreeter.h -- deliberately missing the guard
void greet(const std::string& name);
```

```cpp
// BrokenA.h
#include "BrokenGreeter.h"
```

```cpp
// BrokenB.h
#include "BrokenGreeter.h"
```

```cpp
// broken_main.cpp
#include "BrokenA.h"
#include "BrokenB.h"

int main() { return 0; }
```

Without header guards, `broken_main.cpp`'s preprocessing pastes `BrokenGreeter.h`'s contents in *twice* — once via `BrokenA.h`, once via `BrokenB.h` — meaning the same declaration appears twice in the same translation unit. (For a plain declaration like this one, some compilers tolerate the duplicate; the real danger appears the moment a header declares something the compiler treats more strictly, like a `class` — LAB-02 will hit that version of this exact bug.)

### SAVE AND TRY

Create these four files and try to compile `broken_main.cpp`. Then add header guards to `BrokenGreeter.h` and recompile — confirm the behavior (or the error, depending on what your compiler tolerates) changes. This "reproduce it broken, then fix it and confirm the fix" pattern is one you'll use constantly for the rest of this series — LAB-20 is built entirely around it.

## 🎯 Challenge

Add a second function, `farewell(const std::string& name)`, to `Greeter.h`/`Greeter.cpp` — declared in the header, defined in the source file — and call it from `main.cpp` after `greet`. Recompile using the three-command process from Step 3 (not a single one-shot compile), and confirm both greetings print.

<details>
<summary>Solution</summary>

```cpp
// Greeter.h
#ifndef GREETER_H
#define GREETER_H

#include <string>

void greet(const std::string& name);
void farewell(const std::string& name);

#endif
```

```cpp
// Greeter.cpp
#include "Greeter.h"
#include <iostream>

void greet(const std::string& name) {
    std::cout << "Hello, " << name << "! Welcome to the DSA series.\n";
}

void farewell(const std::string& name) {
    std::cout << "Goodbye, " << name << "! See you in the next lab.\n";
}
```

```cpp
// main.cpp
#include "Greeter.h"

int main() {
    greet("Ada");
    farewell("Ada");
    return 0;
}
```

Both functions live in the same header/source pair — one header can declare as many functions as belong together conceptually; there's no rule requiring one function per file. `main.cpp` didn't need to change its `#include` at all, since it was already pulling in the whole header.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `#include` | Some kind of import/module system | A literal, dumb copy-paste of text, done by the preprocessor before compiling |
| Header files | Where the "real" code lives | Where declarations (promises) live — definitions live in `.cpp` files |
| Compiling | One step that makes a runnable program | Two steps: compile each file to an object file, then link them together |
| Header guards | Optional style preference | Required — prevents duplicate-declaration errors when headers include each other |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | What's the difference between what the compile step checks and what the link step checks? | |
| 2 | Why does `main.cpp` compile successfully even without ever seeing `Greeter.cpp`? | |
| 3 | What specific error would you expect if you deleted the header guard from a header declaring a `class`, and two other headers both included it into the same file? | |

## Quick Check Answers

1. The preprocessor pastes the entire contents of the included file, in place, at the exact location of the `#include` line — before the compiler proper ever runs.
2. A single giant file becomes impossible to compile incrementally — changing one line anywhere forces recompiling the entire program every time, and there's no way to declare "this function exists" separately from "here's its implementation," which is exactly what's needed to let separate files use each other's functions without each one needing the other's full source.
3. The linker sees two full definitions of the same function across the compiled files and fails with a "multiple definition" (or "duplicate symbol") error, because it has no way to know which of the two identical definitions is the "real" one to use.

*Next: [LAB-02 — Classes, Structs, and Encapsulation](CPP-S02-LAB-02-CLASSES-AND-ENCAPSULATION.md)*
