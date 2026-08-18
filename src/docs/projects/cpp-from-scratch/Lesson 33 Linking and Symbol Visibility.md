# Lesson 33: Linking and Symbol Visibility

**What you will build:** A series of multi-file C++ programs that demonstrate how the compiler and linker resolve names across different files. You will cause linker errors on purpose to understand the One Definition Rule, then manage symbol visibility using `inline`, `static`, and `extern`. Finally, you will explore how these concepts map to static and dynamic libraries.

**What you need to know first:** Lesson 15 Namespaces and Header Files, Lesson 32 The Build System CMake.

**Terms used in this lesson:**
- **Translation Unit** — a single `.cpp` source file and all the header files it includes, after the preprocessor has flattened them into one text stream. *Why it exists:* so the compiler can process code in independent, parallel chunks rather than parsing the entire project at once.
- **Linker** — a tool that takes the compiled output (object files) from multiple translation units and connects them into a final executable. *Why it exists:* to match the promises made in one file (declarations) with their actual implementations (definitions) in another.
- **One Definition Rule (ODR)** — the strict C++ requirement that a variable or function can be declared many times, but defined exactly once across the entire program. *Why it exists:* to prevent ambiguity, ensuring the linker never has to guess which implementation of a symbol to use.
- **Linkage** — the rule governing whether a name defined in one translation unit can be seen by the linker when processing other units. *Why it exists:* to let developers hide internal details and avoid name collisions between unrelated files.
- **Static Library** — an archive of compiled object files that the linker copies directly into your final executable. *Why it exists:* to bundle reusable code in a way that guarantees the resulting executable is completely self-contained.
- **Dynamic Library** — a compiled library that remains a separate file (`.dll`, `.so`, or `.dylib`) and is loaded into memory only when the program runs. *Why it exists:* to save memory and disk space by allowing multiple running programs to share a single copy of the library.

**Objects and methods used:**
- **g++**
  - *What it is:* The GNU C++ compiler and linker driver.
  - *Implementation:* A command-line tool (`g++ -std=c++17 a.cpp b.cpp`).
  - *Its use:* To compile source code into object files and link them together, exposing where the compilation vs. linking phases fail.

---

## Concept Unit: Translation Units and the Linker

### The Problem
When a project grows beyond a single file, you split it into multiple `.cpp` files. The compiler processes each file in complete isolation. If `main.cpp` calls a function defined in `math.cpp`, the compiler doesn't know what the function does—it only knows the signature provided by a header. A separate step is required to stitch the isolated pieces together.

### The New Code
```cpp
// math.cpp
int add(int a, int b) {
    return a + b;
}

// main.cpp
#include <iostream>

// Declaration: promises the compiler that 'add' exists somewhere.
int add(int a, int b);

int main() {
    std::cout << add(5, 7) << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int add(int a, int b) { ... }` in `math.cpp` is a **definition**. It provides the actual machine instructions for the function.
- `int add(int a, int b);` in `main.cpp` is a **declaration**. It tells the compiler while processing `main.cpp`, "Trust me, a function with this signature exists. Let me call it."
- `std::cout << add(5, 7) << "\n";` calls the function. At compile time, the compiler leaves a blank spot (a symbol reference) for the address of `add`.
- When both files are compiled and passed to the linker, the linker finds the definition in `math.cpp`'s object file and fills in the blank spot in `main.cpp`'s object file.

### CS Lens
This embodies the separation of compilation and linking. The compiler translates high-level text into machine code (object files), but leaves unresolved addresses for external symbols. The linker is essentially a graph resolver: it walks through all object files, matching unresolved references (edges) to concrete definitions (nodes). 

### SE Lens
The engineering principle is modularity and parallel builds. By processing translation units in isolation, a build system like CMake can compile 100 source files simultaneously on a multi-core machine. If you change one `.cpp` file, only that file needs recompiling; the linker just quickly stitches the new object file with the 99 unchanged ones.

### Run It Yourself
1. Create `math.cpp` and `main.cpp` with the code above.
2. Compile and link them together: `g++ -std=c++17 main.cpp math.cpp -o app`
3. Run `./app`.
4. Expected output:
   ```
   12
   ```

---

## Concept Unit: The One Definition Rule (ODR)

### The Problem
Because header files are literally copy-pasted into source files by the preprocessor, putting a function definition inside a header means every `.cpp` file that includes it gets its own identical copy of the function. When the linker tries to combine them, it sees multiple identical definitions and doesn't know which one to pick.

### The New Code
```cpp
// utils.h
int multiply(int a, int b) {
    return a * b;
}

// a.cpp
#include "utils.h"
int useA() { return multiply(2, 3); }

// b.cpp
#include "utils.h"
int useB() { return multiply(4, 5); }

// main.cpp
int useA();
int useB();
int main() {
    useA();
    useB();
    return 0;
}
```

### Mechanical Walkthrough
- `int multiply(int a, int b) { ... }` defines a function inside a header.
- `#include "utils.h"` in `a.cpp` copies the definition into `a.cpp`.
- `#include "utils.h"` in `b.cpp` copies the definition into `b.cpp`.
- `g++ -std=c++17 a.cpp b.cpp main.cpp` instructs the compiler to process both files. The compiler succeeds, because in isolation, `a.cpp` has exactly one definition of `multiply`, and `b.cpp` has exactly one definition.
- The linker fails. It sees the symbol `multiply` defined in both `a.o` and `b.o`, and strict C++ rules forbid it from guessing which one is the "correct" one.

### CS Lens
This embodies the One Definition Rule (ODR). A program can declare a symbol as many times as it wants (so the compiler knows its type), but there must be exactly one authoritative chunk of memory or machine code for it. 

### SE Lens
The tradeoff here is manual separation of interface and implementation. To solve this, C++ forces engineers to put declarations in `.h` files and definitions in exactly one `.cpp` file. This adds boilerplate compared to modern languages like Rust or Go, but it keeps the compiler fast and the linker unambiguous.

### Run It Yourself
1. Create `utils.h`, `a.cpp`, `b.cpp`, and `main.cpp`.
2. Run `g++ -std=c++17 a.cpp b.cpp main.cpp -o app`.
3. Expected output (Linker error):
   ```
   multiple definition of `multiply(int, int)'
   ```
4. **Discard these files** — this was to prove the failure.

---

## Concept Unit: inline

### The Problem
Sometimes, a function is so small (like a one-line getter) that putting its definition in a separate `.cpp` file feels tedious and hurts performance by preventing the compiler from substituting the code directly at the call site. We need a way to put a definition in a header file without violating the ODR when multiple translation units include it.

### The New Code
```cpp
// math_inline.h
inline int subtract(int a, int b) {
    return a - b;
}

// one.cpp
#include "math_inline.h"
int callOne() { return subtract(10, 2); }

// two.cpp
#include "math_inline.h"
#include <iostream>
int callOne();
int main() {
    std::cout << callOne() << " and " << subtract(10, 5) << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `inline int subtract(...)` marks the function with the `inline` keyword.
- `#include "math_inline.h"` pastes the definition into both `one.cpp` and `two.cpp`.
- The `inline` keyword changes the ODR rules for this specific function. It tells the linker: "You might see multiple identical definitions of this function across different object files. Trust me, they are all exactly the same. Just pick one and discard the rest, or substitute the code directly."
- The linker successfully merges the program without throwing a "multiple definition" error.

### CS Lens
This embodies Link-Time Deduplication. Historically, `inline` was a hint to the compiler to inject the function's assembly directly at the call site (avoiding the overhead of a jump instruction). Today, modern compilers optimize and inline functions regardless of the keyword. The actual semantic meaning of `inline` in modern C++ is purely an ODR exemption: "allow multiple identical definitions and merge them."

### SE Lens
The alternative not chosen is forcing all definitions into `.cpp` files. The tradeoff of using `inline` extensively (which is what template and header-only libraries do) is slower compile times, because every time you include the header, the compiler has to parse and generate code for the function over and over, only for the linker to throw away the duplicates at the very end.

### Run It Yourself
1. Create `math_inline.h`, `one.cpp`, and `two.cpp`.
2. Run `g++ -std=c++17 one.cpp two.cpp -o app`.
3. Run `./app`.
4. Expected output:
   ```
   8 and 5
   ```

---

## Concept Unit: static Linkage

### The Problem
You write a complex algorithm in a `.cpp` file and create a small helper function, like `cleanInput()`. Later, a teammate writes their own `.cpp` file and also names a helper function `cleanInput()`. Even though neither of you put the function in a header file, the linker will see both and throw a multiple definition ODR error. You need a way to tell the linker that a function is private to its specific translation unit.

### The New Code
```cpp
// parser.cpp
#include <iostream>

static void logMessage() {
    std::cout << "Parser log\n";
}

void parse() { logMessage(); }

// network.cpp
#include <iostream>

static void logMessage() {
    std::cout << "Network log\n";
}

void connect() { logMessage(); }

// main.cpp
void parse();
void connect();
int main() {
    parse();
    connect();
    return 0;
}
```

### Mechanical Walkthrough
- `static void logMessage()` defines a function in `parser.cpp`. In C++, applying `static` to a free-standing function or global variable changes its **linkage** to "internal."
- `static void logMessage()` in `network.cpp` does the same.
- Internal linkage means the symbol name is never exported to the linker. The linker literally cannot see `logMessage` when connecting the object files.
- `parse()` calls its local `logMessage()`, and `connect()` calls its local `logMessage()`. There is no conflict because the compiler resolved the addresses locally before the linker was even invoked.

### CS Lens
This embodies Internal Linkage (Information Hiding). By keeping symbols local to the translation unit, you avoid polluting the global namespace. (Note: in modern C++, using an anonymous namespace `namespace { void logMessage() {} }` achieves the exact same thing and is preferred, but `static` is extremely common in legacy codebases).

### SE Lens
The engineering principle is encapsulation. The tradeoff of making a helper function `static` is that it is completely untestable from the outside. A unit test cannot call `logMessage()` to verify its behavior; it can only test `parse()` and assume `logMessage()` works.

### Run It Yourself
1. Create `parser.cpp`, `network.cpp`, and `main.cpp`.
2. Run `g++ -std=c++17 parser.cpp network.cpp main.cpp -o app`.
3. Run `./app`.
4. Expected output:
   ```
   Parser log
   Network log
   ```

---

## Concept Unit: extern

### The Problem
If `static` hides a variable or function, how do you explicitly share a global variable across multiple files? If you define `int systemState = 0;` in a header, the ODR will cause a multiple definition error when included twice. We need a way to declare a variable without defining it, so the linker can wire it up later.

### The New Code
```cpp
// config.h
// Declaration only: tells the compiler the variable exists elsewhere.
extern int maxConnections;

// config.cpp
// Definition: allocates the actual memory.
int maxConnections = 100;

// main.cpp
#include "config.h"
#include <iostream>

int main() {
    std::cout << "Max connections: " << maxConnections << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `extern int maxConnections;` in `config.h` is a pure declaration. The `extern` keyword tells the compiler: "The memory for this integer is allocated in some other translation unit. Do not allocate memory here; just leave a reference for the linker."
- `int maxConnections = 100;` in `config.cpp` is the sole definition. This is where the ODR is satisfied.
- `#include "config.h"` in `main.cpp` gives `main.cpp` visibility to the `extern` declaration, allowing the compiler to successfully compile `main.cpp`.
- The linker matches the external reference from `main.o` to the memory address defined in `config.o`.

### CS Lens
This embodies External Linkage. Functions have external linkage by default (which is why you don't need to write `extern void parse();`). Variables do not, so to share global state, you must explicitly use `extern` to decouple the declaration of a variable's type from the allocation of its memory.

### SE Lens
The alternative not chosen is putting global state inside classes as `static` members (which also require out-of-line definitions). Using `extern` global variables is widely considered an anti-pattern in modern C++ because it creates hidden dependencies and race conditions in multi-threaded programs. However, it is fundamentally how operating system APIs (like `errno` in POSIX) are provided to C++ programs.

### Run It Yourself
1. Create `config.h`, `config.cpp`, and `main.cpp`.
2. Run `g++ -std=c++17 config.cpp main.cpp -o app`.
3. Run `./app`.
4. Expected output:
   ```
   Max connections: 100
   ```

---

## Concept Unit: Static vs. Dynamic Libraries

### The Problem
When you write a useful set of files (like a math library or a graphics engine), you don't want to hand other developers 500 raw `.cpp` files to compile themselves. You want to pre-compile them into a single package they can link against. But how should that code be delivered to the final executable?

### The Explanation (Conceptual)
There is no throwaway code here, because creating libraries requires specific build system (CMake) commands rather than C++ syntax. 

**Static Libraries (`.a` on Linux/Mac, `.lib` on Windows):**
A static library is just an archive (like a zip file) of `.o` object files. When you compile your `main.cpp` and link against a static library, the linker extracts the specific object files it needs from the archive and physically copies their machine code directly into your final `app` executable. 
- *The Benefit:* Your `app` is a single, self-contained file. You can give it to anyone, and it will just run.
- *The Drawback:* If 10 programs on your computer use the same static library, that library's code is duplicated 10 times on your hard drive and in RAM.

**Dynamic Libraries (`.so` on Linux, `.dylib` on Mac, `.dll` on Windows):**
A dynamic library is compiled into a standalone file. When you link your program against it, the linker does *not* copy the code. Instead, it embeds a note in your executable saying: "When you run this program, go find `libmath.dll` on the hard drive and load it into memory."
- *The Benefit:* Memory and disk space are saved because multiple programs can share the same library. You can also upgrade the library (like patching a security flaw in OpenSSL) without recompiling the main program.
- *The Drawback:* If the library file is missing, deleted, or the wrong version, your program will instantly crash on startup (the infamous "DLL hell").

### CS Lens
This embodies the tradeoff between Early Binding and Late Binding. Static linking binds addresses at compile time, guaranteeing stability. Dynamic linking defers binding until the operating system's loader maps the program into memory, trading stability for flexibility and resource sharing.

---

## Connect the Pieces

Observe how a real project balances these visibility rules:
You build a dynamic library (`.dll`). The public API functions are declared in a header and defined in `.cpp` files with external linkage so users can call them. You mark tiny getter methods as `inline` to avoid ODR violations when users include your headers. Inside the library, you hide your messy, internal helper functions using `static` linkage so their names don't conflict with functions in the user's own codebase. 

## What Breaks Without This

If you ignore the One Definition Rule, the build completely halts. 
If you ignore `static` linkage and let all helpers have external linkage, linking multiple large libraries together will result in symbol collisions (e.g., both libraries defined a global function named `init()`), requiring massive refactoring to fix.

## Exercises

1. Create a header file with a function `int square(int x) { return x * x; }`. Include it in two different `.cpp` files and write a `main` function to compile them. Verify it fails with an ODR error.
2. Add the `inline` keyword to `square` and recompile to prove the ODR violation is resolved.
3. Try to access an internal `static` function from another file by declaring its signature manually (`void helper();`). Observe the "undefined reference" error because the linker cannot see the `static` symbol.

## Definition of Done
- [ ] You have compiled multiple `.cpp` files together and observed the linking phase succeed.
- [ ] You have intentionally caused a multiple definition error by violating the ODR.
- [ ] You have used `inline` to allow a function definition in a header file.
- [ ] You have used `static` to hide a function from the linker.
- [ ] You have used `extern` to share a global variable without violating ODR.
- [ ] You can explain the difference between a static library and a dynamic library.
