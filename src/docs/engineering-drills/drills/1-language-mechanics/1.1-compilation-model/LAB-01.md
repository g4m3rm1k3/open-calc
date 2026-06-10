# Drill 1.1 — C++: The Compilation Model and Header Files

**Standalone drill. No prerequisites. No series.**
**Time estimate:** 90–120 minutes
**What you will build:** A tiny calculator split across `math.h`, `math.cpp`, and `main.cpp`
**What you will understand:** What the compiler, assembler, and linker actually do — and why

---

## Quick Check

Read these questions now. Answer them yourself before starting.
You will find the answers in this lab — they reference specific code you will write.

1. If you write a function in `main.cpp` and another `.cpp` file needs to call it, what does the other file actually need to compile successfully? The function's source code, or just its signature?

2. `#include "math.h"` — what does this line literally do to your source file before compilation? Where does the compiler see the result?

3. You include `math.h` in both `main.cpp` and `math.cpp`. Without include guards, what exact error does the linker produce? Why does including a header twice cause a problem?

4. You have `math.o` and `main.o` — two compiled object files. Neither is an executable. What is the linker's job, and what information does it need that was not in either object file alone?

*(Answers at the bottom of this lab, referenced to the exact code that proves each one.)*

---

## The Concept: What the Compiler Actually Does

### Concept: The C++ Build Pipeline

**What it is:**
Building a C++ program is a four-stage pipeline. Most developers call the whole thing "compiling," but that word only names one of the four stages. Each stage has a distinct job, distinct inputs, and distinct outputs — and distinct error messages when it fails.

**The problem before:**
You write a `.cpp` file and run `g++ myfile.cpp -o myprogram`. It either works or it doesn't. You have no model for *why* it fails. "Undefined reference" errors are mysterious. "Multiple definition" errors seem random. You don't know where to look.

**The solution:**
A concrete mental model of the four stages: **preprocessor → compiler → assembler → linker**. Once you know what each stage does, every error message names itself.

**What it hides:**
The `g++` command runs all four stages silently by default. Flags like `-E`, `-S`, and `-c` expose the intermediate outputs so you can see exactly what each stage produces.

**Canonical example (general):**
You ask an architect to build a house. The architect (preprocessor) gathers all the blueprints and pastes them into one complete document. The structural engineer (compiler) converts that document into a specification of beams and loads. The factory (assembler) manufactures the components. The construction crew (linker) assembles the components into the final building.

**Project application:**
When you split `math.h`, `math.cpp`, and `main.cpp`, each `.cpp` file goes through the first three stages independently, producing a `.o` object file. The linker runs once at the end, combining all `.o` files into the final `calculator` executable. This is why you can recompile only the file that changed.

**Constraints:**
- The compiler only sees one `.cpp` file at a time — it cannot look at other `.cpp` files
- The compiler needs to know a function *exists* (declaration) before it can compile a call to it
- The linker needs to find the actual machine code for that function (definition)
- A definition must appear in exactly one translation unit (one `.cpp` file)

**Failure modes:**
- `error: 'add' was not declared in this scope` — the compiler cannot find a declaration
- `undefined reference to 'add(int, int)'` — the linker cannot find a definition
- `multiple definition of 'add(int, int)'` — the linker found the same definition twice

**Operational reality:**
In a project with 200 `.cpp` files, a build system (CMake, Make) tracks which files changed and recompiles only those. Each `.cpp` file is a "translation unit" — the unit of independent compilation. Large projects can have thousands of them. The ability to recompile files independently is the entire reason C++ splits code across files.

**You will see this again in:**
Every C/C++ project ever. CAD/CAM software, game engines, firmware, the Linux kernel — all use exactly this model. When you open a real codebase (like FreeCAD or OpenCV), understanding translation units explains why the directory structure looks the way it does.

**Watch for:**
The difference between a compiler error (source code problem — wrong syntax, wrong type) and a linker error (missing or duplicate definitions — architectural problem). They look different and mean different things.

---

### Concept: Declaration vs Definition

**What it is:**
A **declaration** tells the compiler a name exists and what its type is.
A **definition** provides the actual implementation (for functions) or allocates actual memory (for variables).

**The problem before:**
You put a function in one file and call it from another. The compiler complains. You copy the whole function into both files. Now the linker complains about duplicates. You do not understand why either error happened.

**The solution:**
Declarations go in `.h` files. Definitions go in `.cpp` files. The compiler only needs declarations to compile a call site. The linker uses definitions to fill in the actual machine code.

**What it hides:**
The distinction is invisible when everything lives in one file — the compiler sees the definition and treats it as both. The split only becomes necessary (and visible) when code is spread across multiple files.

**Canonical example (general):**
A movie credits list says "Directed by Christopher Nolan" — that is a declaration (the name exists, the role is known). The actual footage of Christopher Nolan directing is the definition (the real thing). The credits file can reference his name without including the footage.

**Project application:**
`math.h` contains `int add(int a, int b);` — the declaration. `math.cpp` contains the function body — the definition. `main.cpp` includes `math.h`, sees the declaration, compiles successfully. The linker then finds the definition in `math.o`.

**Constraints:**
- A declaration can appear in many files (through includes) — that is fine
- A definition must appear in exactly one `.cpp` file
- Violating this rule produces "multiple definition" linker errors

**Failure modes:**
Putting a function body (definition) directly in a header file, then including that header in two `.cpp` files. Both translation units contain the definition. The linker sees it twice and reports an error.

**Operational reality:**
Header-only libraries (a popular pattern in modern C++) work around this rule using `inline` functions or template specialization rules that permit multiple identical definitions. You will encounter this. Now you will understand why those keywords exist.

**You will see this again in:**
Every `.h` / `.cpp` pair in every C/C++ project. The OpenGL headers you will use in CAD/CAM work are pure declarations — the actual GL functions are defined in the GPU driver library that the linker connects to.

**Watch for:**
When you see `extern` in a header file before a variable declaration, that is explicitly marking it as a declaration, not a definition. The definition lives in exactly one `.cpp` file.

---

### Concept: The Preprocessor and `#include`

**What it is:**
The C preprocessor is a text substitution engine that runs before the compiler sees your code. It handles `#include`, `#define`, `#ifdef`, and `#pragma` directives. It does not understand C++ syntax — it is pure text manipulation.

**The problem before:**
You see `#include "math.h"` and mentally read it as "import the math module." That mental model is wrong and will cause you confusion when things go wrong.

**The solution:**
`#include "math.h"` is a copy-paste command. The preprocessor opens `math.h`, reads every character, and pastes it directly into your source file at the point of the `#include`. The compiler then sees one large combined file. You can see the result with `g++ -E`.

**What it hides:**
The compiler never sees your original source file with `#include` directives. It only sees the preprocessed output — a single stream of text with all includes expanded.

**Canonical example (general):**
A word processor's "Insert > File" feature that literally pastes the contents of another document into the current one. The result is one document. There is no link back to the original file.

**Project application:**
When you run `g++ -E main.cpp`, you will see the preprocessed output. Every line from `math.h` appears verbatim, followed by the code from `main.cpp`. The `#include "math.h"` line itself disappears — it was a preprocessor instruction, not C++ code.

**Constraints:**
- `#include <header>` searches the system include path (standard library, installed packages)
- `#include "header.h"` searches the current directory first, then the system path
- Include order matters if headers depend on each other — a declaration must appear before its use

**Failure modes:**
Including a file that doesn't exist produces a preprocessor error, not a compiler error. The error message says "No such file or directory" before any C++ parsing has occurred.

**Operational reality:**
In large projects, fully expanding all includes can produce hundreds of thousands of lines of text from a small source file. This is why "precompiled headers" (`.pch` files) exist — they save the preprocessed output of expensive headers so the compiler doesn't re-expand them on every build.

**You will see this again in:**
Every C++ build system discussion about "include paths" (`-I` flag). CMake's `target_include_directories`. The reason some projects have a dedicated `include/` folder separate from `src/`. All of it is managing what the preprocessor can find.

**Watch for:**
The difference between an include error ("file not found") and a compile error ("undeclared identifier"). They occur at different stages. The preprocessor runs first.

---

### Concept: Include Guards

**What it is:**
A set of three preprocessor directives at the top and bottom of every header file that prevent its contents from being pasted twice into the same translation unit.

**The problem before:**
File A includes `math.h`. File B includes `math.h`. `main.cpp` includes both File A and File B. The preprocessor pastes `math.h` twice into `main.cpp`'s translation unit. The compiler sees duplicate declarations and (if the header contains definitions) the linker sees duplicate definitions.

**The solution:**
```cpp
#ifndef MATH_H        // "if MATH_H is not defined..."
#define MATH_H        // "...define MATH_H (mark this file as seen)..."
// ... header contents ...
#endif                // "...end of the conditional block"
```
The first time the preprocessor expands this file, `MATH_H` is not defined, so the contents are included and `MATH_H` gets defined. Every subsequent include of this file sees that `MATH_H` is already defined and skips the entire block.

**What it hides:**
The name (`MATH_H`) is just a preprocessor flag — a macro with no value. The convention is to use the filename in uppercase with dots replaced by underscores. The actual name doesn't matter as long as it's unique and consistent.

**Canonical example (general):**
A "Do Not Disturb" sign on a hotel room door. Once the sign is out, anyone who checks will skip that room. The room's contents are processed only once.

**Project application:**
You will first build `math.h` without guards and deliberately trigger the duplicate inclusion problem by seeing it in the preprocessed output. Then you will add guards and show the problem disappearing.

**Constraints:**
The guard macro name must be globally unique. By convention: uppercase filename with underscores. If two different headers use the same guard name, one of them will be silently skipped — a subtle and hard-to-find bug.

**Failure modes:**
Forgetting the `#endif` at the end produces a cascading preprocessor error. Mismatching the `#ifndef` name and the `#define` name means the guard never triggers.

**Operational reality:**
Modern compilers support `#pragma once` as a simpler alternative — one line at the top of the header, no closing `#endif` needed. It works the same way. Most new C++ code uses `#pragma once`. Older codebases and portable code use traditional guards. You will see both.

**You will see this again in:**
Every header file in every C/C++ codebase. OpenGL headers, CGAL (for CAD geometry), Eigen (for linear algebra) — all of them use include guards or `#pragma once`.

**Watch for:**
If you copy a header file and forget to change the guard name, the second header will silently be skipped everywhere. This produces confusing "undeclared identifier" errors where the file clearly exists.

---

## Step 1 — Everything in One File (It Works, But See Why It Breaks)

**Goal:** Get a working calculator. Understand why this structure cannot scale.

Create a working directory:

```
1.1-compilation-model/
    main.cpp
```

**`main.cpp`:**

```cpp
#include <iostream>   // Pull in the standard library's I/O declarations
                      // (cout, endl, etc.) — preprocessor will paste iostream here

// A function DEFINITION — it declares AND provides the body
// The compiler sees this before main(), so it knows what add() is when it sees the call
int add(int a, int b) {
    return a + b;     // Return the sum — the CPU will execute this instruction
}

// Another definition — subtract takes two ints, returns their difference
int subtract(int a, int b) {
    return a - b;     // The minus operator maps to a single CPU SUB instruction
}

// Another definition — multiply
int multiply(int a, int b) {
    return a * b;     // Maps to MUL instruction at the machine level
}

// main() is special: the OS calls this function when the program starts
// The OS reads the return value: 0 = success, anything else = failure
int main() {
    int x = 10;       // Allocate 4 bytes on the stack, store the value 10
    int y = 3;        // Allocate 4 bytes on the stack, store the value 3

    // Call our functions — the compiler knows their signatures from the definitions above
    std::cout << "add(10, 3) = " << add(x, y) << std::endl;
    std::cout << "subtract(10, 3) = " << subtract(x, y) << std::endl;
    std::cout << "multiply(10, 3) = " << multiply(x, y) << std::endl;

    return 0;          // Tell the OS: success
}
```

**COMPILE AND RUN:**

```bash
g++ main.cpp -o calculator
./calculator
```

**Exact expected output:**
```
add(10, 3) = 13
subtract(10, 3) = 7
multiply(10, 3) = 30
```

**Terminal verification — watch the build pipeline:**

```bash
# Step 1: preprocessor only (-E flag) — see what the compiler actually receives
# Pipe through tail to skip the massive iostream expansion and see your code
g++ -E main.cpp | tail -30
```

You will see your function definitions appear at the bottom of several thousand lines of `iostream` expansion. That entire wall of text is what the compiler processes — not your original file.

```bash
# Step 2: compile to assembly (-S flag) — see the machine instructions before assembly
g++ -S main.cpp -o main.s
# Open main.s and find the 'add' label — that is your add() function in assembly
```

```bash
# Step 3: compile to object file (-c flag) — stop before linking
g++ -c main.cpp -o main.o
# main.o is binary machine code, not yet an executable
# Try running it:
./main.o   # This will fail or produce garbage — it's not an executable
```

**Change something — experiment:**

Move the `add()` function definition to *after* `main()`, so `main()` tries to call a function it hasn't seen yet. Recompile.

```bash
g++ main.cpp -o calculator
```

You may get a warning but it will likely still compile — because the compiler is lenient about implicit function declarations in C mode. Now add `-std=c++17 -Wall -Werror` (strict mode) and recompile:

```bash
g++ -std=c++17 -Wall -Werror main.cpp -o calculator
```

You will get: `error: 'add' was not declared in this scope`. This is the compiler telling you it reached a call to `add()` before it saw what `add()` is. This is exactly the problem declarations solve. Restore the function to the top.

**Why this doesn't scale:**
Right now, everything is in one 30-line file. Imagine 50 functions shared across 10 different `.cpp` files. You would have to copy the function bodies into every file that uses them. Any change to a function requires updating every copy. This is the problem header files solve.

---

## Step 2 — Separate Declarations into `math.h`

**Goal:** Create `math.h` with declarations only. Understand what a declaration is and why the compiler accepts it without a body.

Add a new file:

```
1.1-compilation-model/
    main.cpp
    math.h          ← new
```

**`math.h`** (declarations only — no function bodies):

```cpp
// A DECLARATION tells the compiler:
//   - A function named 'add' exists somewhere
//   - It takes two int parameters
//   - It returns an int
// That is ALL the compiler needs to compile a call to add().
// The compiler does not need the body here — the body will be found by the LINKER later.

// The semicolon ends the declaration — there is no opening brace, no body
int add(int a, int b);

// Same pattern: declare the name, the parameters, and the return type
int subtract(int a, int b);

// Same pattern
int multiply(int a, int b);
```

**Update `main.cpp`** — replace the function bodies with an include:

```cpp
#include <iostream>    // Standard library I/O declarations (system header — use <>)
#include "math.h"      // Our own header (local file — use "")
                       // The preprocessor will literally paste math.h contents here
                       // After preprocessing, this file will contain the three declarations
                       // exactly as if you had typed them here by hand

// main() can now call add(), subtract(), and multiply() because:
// 1. The preprocessor pasted their declarations from math.h
// 2. The compiler sees those declarations before it sees the calls
// 3. The compiler trusts the linker will find the actual bodies later
int main() {
    int x = 10;
    int y = 3;

    std::cout << "add(10, 3) = " << add(x, y) << std::endl;
    std::cout << "subtract(10, 3) = " << subtract(x, y) << std::endl;
    std::cout << "multiply(10, 3) = " << multiply(x, y) << std::endl;

    return 0;
}
```

**COMPILE AND RUN — but watch the failure first:**

Try to compile `main.cpp` alone:

```bash
g++ main.cpp -o calculator
```

**Exact expected error:**
```
/usr/bin/ld: /tmp/ccXXXXXX.o: in function `main':
main.cpp:(.text+0x...): undefined reference to `add(int, int)'
main.cpp:(.text+0x...): undefined reference to `subtract(int, int)'
main.cpp:(.text+0x...): undefined reference to `multiply(int, int)'
collect2: error: ld returned 1 exit status
```

Read this error carefully. It says `/usr/bin/ld` — that is the **linker** (`ld`). Not the compiler. The compiler accepted your code because the declarations were present. The linker failed because it could not find the definitions. The function bodies no longer exist anywhere — you deleted them from `main.cpp` and haven't created `math.cpp` yet.

This error message is the linker speaking. You will recognize it from now on.

**Terminal verification:**

```bash
# Compile to object file only (stop before linking) — this SUCCEEDS
g++ -c main.cpp -o main.o
# No error: the compiler is happy — it found the declarations

# Now try to link main.o alone into an executable — this FAILS
g++ main.o -o calculator
# Linker error: undefined references
```

The `-c` flag proves the compiler accepted the code. The linker error proves that the problem is missing definitions, not bad syntax.

**Change something — experiment:**

In `math.h`, change the declaration of `add` to take three parameters:
```cpp
int add(int a, int b, int c);  // Wrong — main.cpp calls it with two arguments
```

Recompile:
```bash
g++ -c main.cpp -o main.o
```

You get a compiler error: `error: too many arguments to function`. The compiler checked your call against the declaration and caught the mismatch. Restore the correct declaration.

---

## Step 3 — Create `math.cpp` with Definitions

**Goal:** Move the function bodies into a separate `.cpp` file. Understand that each `.cpp` is compiled independently.

Add:

```
1.1-compilation-model/
    main.cpp
    math.h
    math.cpp        ← new
```

**`math.cpp`:**

```cpp
#include "math.h"    // Include our own header — this is important.
                     // math.cpp needs the declarations too, so the compiler
                     // can verify that the function signatures match exactly.
                     // If add() in math.h declares "int add(int, int)" but
                     // you write "float add(float, float)" here, the compiler
                     // will catch the mismatch.

// This is a DEFINITION — it provides the actual body, the machine code
// The signature must exactly match the declaration in math.h
int add(int a, int b) {
    return a + b;    // These bytes of machine code are what the linker will
                     // copy into the final executable when main.o calls add()
}

// Definition for subtract
int subtract(int a, int b) {
    return a - b;
}

// Definition for multiply
int multiply(int a, int b) {
    return a * b;
}
```

**COMPILE AND RUN:**

Now compile *both* `.cpp` files. The linker needs both object files:

```bash
# Compile math.cpp into math.o (stop before linking with -c)
g++ -c math.cpp -o math.o

# Compile main.cpp into main.o (stop before linking with -c)
g++ -c main.cpp -o main.o

# Link both object files into the final executable
g++ main.o math.o -o calculator

# Run it
./calculator
```

**Exact expected output:**
```
add(10, 3) = 13
subtract(10, 3) = 7
multiply(10, 3) = 30
```

Or compile everything in one command (g++ runs all stages automatically):

```bash
g++ main.cpp math.cpp -o calculator
./calculator
```

**Exact expected output:** same as above.

**Terminal verification — see the whole pipeline:**

```bash
# See what declarations the compiler gave main.o to work with
g++ -E main.cpp | grep -A 3 "^int add"
# You should see: int add(int a, int b); (the declaration, pasted from math.h)

# See the object file's exported symbols (the definitions it contains)
nm math.o | grep " T "
# 'T' means "defined in the text (code) section"
# You should see symbols for add, subtract, and multiply

# See the object file's imported symbols (what it expects the linker to provide)
nm main.o | grep " U "
# 'U' means "undefined — needs to be found by the linker"
# You should see add, subtract, multiply listed as undefined in main.o
```

This is exactly what the linker does: it takes `main.o` (which has three undefined symbols) and `math.o` (which defines those symbols) and connects them.

**Change something — experiment:**

Delete `math.o` after compiling, then try to link with just `main.o`:

```bash
rm math.o
g++ main.o -o calculator
```

The linker error returns — the definitions are gone again. Add `math.o` back:

```bash
g++ -c math.cpp -o math.o
g++ main.o math.o -o calculator
```

Fixed. You have now manually triggered and resolved an "undefined reference" error by understanding its actual cause.

---

## Step 4 — See `#include` as a Text Paste

**Goal:** Prove that `#include` is literal text substitution, not a module import.

You do not write any new code in this step. You use `g++ -E` to see the preprocessed output.

**COMPILE AND RUN:**

```bash
# Show the full preprocessed output of main.cpp
# Warning: this will be several thousand lines due to iostream expansion
g++ -E main.cpp -o main_preprocessed.cpp

# Count the lines
wc -l main_preprocessed.cpp
```

**Expected output:** Something like `28000 main_preprocessed.cpp` — twenty-eight thousand lines from a 15-line source file. Almost all of it is the expansion of `<iostream>` pulling in the entire C++ standard library's I/O declarations.

```bash
# Find where your math.h declarations appear in the expansion
grep -n "int add" main_preprocessed.cpp
```

**Expected output:**
```
27983: int add(int a, int b);
27984: int subtract(int a, int b);
27985: int multiply(int a, int b);
```

(Line numbers will vary, but they will appear near the end of the file, right before your `main()` function.)

```bash
# Show lines around that point
sed -n '27980,27995p' main_preprocessed.cpp
```

You will see your three declarations from `math.h` appearing verbatim, followed immediately by the code from `main.cpp`. The `#include "math.h"` line itself is gone — replaced entirely by the pasted content.

**The critical insight:** The compiler never saw `#include "math.h"`. It saw the contents of `math.h` pasted directly into the source. This is why the compiler accepts calls to `add()` — it saw the declaration right there in the source stream.

**Terminal verification:**

```bash
# Compare your original math.h with its appearance in the preprocessed output
cat math.h
# Then:
grep -A 3 "int add" main_preprocessed.cpp
# The content is identical — it is a literal copy
```

**Change something — experiment:**

Create a temporary file called `greeting.txt` (not even a `.h` file) with one line:
```
std::cout << "Hello from included text!" << std::endl;
```

Now `#include "greeting.txt"` inside your `main()` function in `main.cpp`, and compile. It will work. The preprocessor does not care about the file extension — it copies any file. Remove this experiment after you have confirmed it works.

This proves `#include` is a file copy operation, not a language feature that understands "header files."

---

## Step 5 — Include Guards: The Multiple Inclusion Problem

**Goal:** Demonstrate the double-inclusion problem, then fix it with include guards.

**First, create the problem deliberately.**

Create a new file `extra.h`:

```
1.1-compilation-model/
    main.cpp
    math.h
    math.cpp
    extra.h         ← new (temporary, for demonstration)
```

**`extra.h`:**

```cpp
// This header includes math.h — it needs the math declarations for some reason
#include "math.h"
```

Now update `main.cpp` to include both:

```cpp
#include <iostream>
#include "math.h"    // Includes math.h once
#include "extra.h"   // Includes extra.h, which also includes math.h
                     // Net result: math.h is pasted into this file TWICE
                     // The preprocessor does not know it already pasted it

int main() {
    int x = 10;
    int y = 3;
    std::cout << "add(10, 3) = " << add(x, y) << std::endl;
    std::cout << "subtract(10, 3) = " << subtract(x, y) << std::endl;
    std::cout << "multiply(10, 3) = " << multiply(x, y) << std::endl;
    return 0;
}
```

**COMPILE AND RUN — watch the current non-error:**

```bash
g++ main.cpp math.cpp -o calculator
./calculator
```

Right now it *compiles*. Duplicate declarations are technically allowed in C++ — declaring a function twice is not an error as long as the signatures match. But this will not hold when the header contains something that can only appear once (like a `struct` definition or a `const` variable definition, as you will see shortly).

**Force the problem** — add a struct to `math.h`:

Update `math.h`:

```cpp
// A struct DEFINITION — this can only appear once per translation unit
// If math.h is included twice, this struct is defined twice, which is an error
struct CalcResult {
    int value;     // The computed result
    bool overflow; // Whether the operation overflowed
};

int add(int a, int b);
int subtract(int a, int b);
int multiply(int a, int b);
```

**COMPILE AND RUN — watch the failure:**

```bash
g++ main.cpp math.cpp -o calculator
```

**Exact expected error:**
```
In file included from extra.h:1,
                 from main.cpp:3:
math.h:3:8: error: redefinition of 'struct CalcResult'
    3 | struct CalcResult {
      |        ^~~~~~~~~~
math.h:3:8: note: previous definition of 'struct CalcResult'
```

The compiler is telling you it saw `CalcResult` defined twice. The first time was from `#include "math.h"`. The second time was from `#include "extra.h"` which itself included `math.h` again.

**Now add include guards to fix it:**

Update `math.h`:

```cpp
// INCLUDE GUARD — top of file
// Convention: filename in uppercase, dots and slashes replaced with underscores
#ifndef MATH_H   // "If the macro MATH_H has not been defined yet..."
#define MATH_H   // "...then define it now (mark this file as 'seen')"
                 // Everything between #ifndef and #endif is only processed once

// This struct definition is now safe — the guard ensures it appears only once
struct CalcResult {
    int value;     // The computed result
    bool overflow; // Whether the operation overflowed
};

// Declarations are safe to repeat, but the guard protects them too
int add(int a, int b);
int subtract(int a, int b);
int multiply(int a, int b);

#endif  // MATH_H  -- closes the #ifndef block
        // The comment "MATH_H" is optional but conventional — it marks which guard this closes
```

**COMPILE AND RUN:**

```bash
g++ main.cpp math.cpp -o calculator
./calculator
```

**Exact expected output:**
```
add(10, 3) = 13
subtract(10, 3) = 7
multiply(10, 3) = 30
```

**Terminal verification:**

```bash
# See the guard in action — preprocessor output shows the block included once
g++ -E main.cpp | grep -c "CalcResult"
# Expected: 1 (appeared once despite math.h being included twice)

# Without the guard, you would see:
# Expected: 2 (struct definition appears twice, causing the error)
```

**Change something — experiment:**

Replace the three-line guard with `#pragma once` at the top of `math.h`:

```cpp
#pragma once   // Modern alternative to include guards — same effect, one line

struct CalcResult {
    int value;
    bool overflow;
};

int add(int a, int b);
int subtract(int a, int b);
int multiply(int a, int b);
```

Recompile — it still works. `#pragma once` is a compiler extension (not standard C++) but is supported by every major compiler. It prevents the file from being included more than once. The traditional guard is portable to any preprocessor; `#pragma once` requires a modern compiler. For this drill, restore the traditional guard.

Clean up:
- Delete `extra.h` — it was temporary
- Restore `main.cpp` to not include `extra.h`

---

## Step 6 — Final Build: The Complete Correct Structure

**Goal:** Build the final version of the calculator with the correct three-file structure. Understand every file's role.

**Final file structure:**

```
1.1-compilation-model/
    math.h      — declarations + include guard
    math.cpp    — definitions
    main.cpp    — usage (includes math.h for declarations)
```

**`math.h`** (final version):

```cpp
#ifndef MATH_H     // Include guard: prevents double inclusion
#define MATH_H

// Declarations only — no bodies, no implementation details
// Any .cpp file that includes this header can call these functions
// without knowing how they are implemented
int add(int a, int b);
int subtract(int a, int b);
int multiply(int a, int b);

#endif // MATH_H
```

**`math.cpp`** (final version):

```cpp
#include "math.h"   // Include our own header to verify signatures match

// The actual implementations — machine code lives here after compilation
// This file is the only place these functions are defined
// The linker will find them here when main.o references them

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int multiply(int a, int b) {
    return a * b;
}
```

**`main.cpp`** (final version):

```cpp
#include <iostream>  // System header: standard I/O declarations (use <>)
#include "math.h"    // Local header: our function declarations (use "")

// main.cpp knows NOTHING about how add/subtract/multiply are implemented
// It only knows their signatures, from the declarations in math.h
// This is the correct separation: caller knows the interface, not the implementation

int main() {
    int x = 10;
    int y = 3;

    std::cout << "add(10, 3) = "      << add(x, y)      << std::endl;
    std::cout << "subtract(10, 3) = " << subtract(x, y) << std::endl;
    std::cout << "multiply(10, 3) = " << multiply(x, y) << std::endl;

    return 0;
}
```

**COMPILE AND RUN — the full sequence:**

```bash
# Option 1: Manually, step by step
g++ -std=c++17 -Wall -c math.cpp -o math.o    # Compile math.cpp → math.o
g++ -std=c++17 -Wall -c main.cpp -o main.o    # Compile main.cpp → main.o
g++ main.o math.o -o calculator               # Link → executable
./calculator

# Option 2: All at once (g++ runs all stages automatically)
g++ -std=c++17 -Wall main.cpp math.cpp -o calculator
./calculator
```

**Exact expected output:**
```
add(10, 3) = 13
subtract(10, 3) = 7
multiply(10, 3) = 30
```

**Terminal verification — the complete mental model:**

```bash
# 1. Confirm math.o exports its definitions (T = Text section = code)
nm math.o | grep " T "
# Expected: symbols for _Z3addii, _Z8subtractii, _Z8multiplyii
# (The mangled names encode the function name + parameter types)

# 2. Confirm main.o imports those definitions (U = Undefined = needs linker)
nm main.o | grep " U "
# Expected: the same mangled names, listed as undefined

# 3. Confirm the final executable has resolved all references (no U symbols for our functions)
nm calculator | grep -E "add|subtract|multiply"
# Expected: the symbols appear as T (defined), not U (undefined)
```

The linker's job is visible in those `nm` outputs: it takes the `U` (undefined) symbols in `main.o` and connects them to the `T` (defined) symbols in `math.o`.

---

## Quick Check Answers

**1. What does the other file need to compile a call — source code or just the signature?**
Just the signature (the declaration). See Step 2: `main.cpp` included only `math.h` (declarations, no bodies) and compiled successfully with `g++ -c main.cpp -o main.o`. The compiler accepted calls to `add()`, `subtract()`, and `multiply()` because their declarations were present. The compiler does not need the bodies — the linker finds those later.

**2. What does `#include "math.h"` literally do?**
It pastes the file's text content directly into the source file at that point. See Step 4: running `g++ -E main.cpp` produced a file where the `#include` directive disappeared and was replaced by the exact text of `math.h`. The compiler never sees the `#include` — the preprocessor removes it before the compiler runs.

**3. What error does double inclusion produce?**
When `math.h` contained a `struct CalcResult` definition and was included twice (directly and through `extra.h`), the compiler reported `error: redefinition of 'struct CalcResult'`. This is a compiler error (not a linker error) because the compiler processes the translation unit and sees the type defined twice. The include guard in Step 5 fixed it by making the second paste a no-op.

**4. What is the linker's job and what information did it need?**
The linker combines compiled object files into a final executable. It matched "undefined" references in `main.o` (visible via `nm main.o | grep " U "`) against "defined" symbols in `math.o` (visible via `nm math.o | grep " T "`). The linker needed the actual machine code for `add`, `subtract`, and `multiply` — which existed only in `math.o`, not in `main.o`.

---

## Challenge

No solution is provided. Requirements only.

### String Utilities Module

Build a string processing module split across `strings.h` and `strings.cpp`. Use it from `main.cpp`.

**Requirements checklist:**

- [ ] `strings.h` contains declarations for three functions:
  - `std::string reverse_str(std::string s)` — returns the string reversed
  - `std::string to_upper(std::string s)` — returns the string in all uppercase
  - `int count_vowels(std::string s)` — returns the count of vowels (a, e, i, o, u, case-insensitive)
- [ ] `strings.h` has correct include guards (not `#pragma once` — use the traditional form)
- [ ] `strings.cpp` includes `strings.h` and provides definitions for all three functions
- [ ] `main.cpp` includes `strings.h` and calls all three functions, printing results
- [ ] The program compiles and runs correctly: `g++ -std=c++17 main.cpp strings.cpp -o stringutil`

**Demonstrate the double-inclusion problem:**

- [ ] Create `helper.h` that includes `strings.h`
- [ ] Update `main.cpp` to include both `strings.h` and `helper.h`
- [ ] Temporarily add a `struct StringStats { int length; int vowels; };` to `strings.h`
- [ ] Temporarily **remove** the include guard from `strings.h`
- [ ] Compile and show the `redefinition of 'struct StringStats'` error
- [ ] Restore the include guard and show the error disappear

**Starter code for `main.cpp`:**

```cpp
#include <iostream>
#include "strings.h"
// Add helper.h include here for the double-inclusion demonstration

int main() {
    std::string word = "Hello World";

    std::cout << "Original:  " << word << std::endl;
    std::cout << "Reversed:  " << reverse_str(word) << std::endl;
    std::cout << "Uppercase: " << to_upper(word) << std::endl;
    std::cout << "Vowels:    " << count_vowels(word) << std::endl;

    return 0;
}
```

**Expected output:**
```
Original:  Hello World
Reversed:  dlroW olleH
Uppercase: HELLO WORLD
Vowels:    3
```

**When you're done:**
You can call `reverse_str`, `to_upper`, and `count_vowels` from `main.cpp` without `main.cpp` knowing anything about their implementations. You can demonstrate the double-inclusion error and fix it with include guards. You can explain what each of the three `g++ -c` commands does and why the final link step requires both object files.

**Stuck?** Ask AI: "In C++, my program compiles with `g++ -c main.cpp` but fails with 'undefined reference' when I try to link. What stage is failing and what does it mean?"
