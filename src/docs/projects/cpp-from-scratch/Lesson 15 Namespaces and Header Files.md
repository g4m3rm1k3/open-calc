# Lesson 15: Namespaces and Header Files

**What you will build:** A series of isolated console programs that organize code into separate compartments and distinct files, proving how the compiler reads declarations across file boundaries and how the linker ultimately stitches them together into a single executable.

**What you need to know first:** Lesson 05 Functions, Lesson 06 Classes and Objects.

**Terms introduced in this lesson:**
- **Namespace** — a named scope that groups related code together. *Why it exists:* to prevent naming collisions when multiple libraries or parts of a program happen to use the exact same name for a function or class.
- **Header File** — a file containing only the declarations (signatures) of functions and classes, not their implementations. *Why it exists:* to tell the compiler the shape of the code before it sees the actual body, allowing different files to call each other's code.
- **Source File** — a file containing the actual implementations (bodies) of functions and classes. *Why it exists:* to hold the computational logic that is compiled into machine instructions.
- **Translation Unit** — the ultimate result of a source file after the preprocessor resolves all its `#include` directives. *Why it exists:* because the C++ compiler processes code strictly one unit at a time, in complete isolation from the rest of the program.
- **Linker** — a tool that runs after the compiler, connecting the compiled translation units together. *Why it exists:* to resolve the empty placeholders left by the compiler when a function was declared but implemented in a different file.
- **Include Guard** — a directive preventing a header file from being pasted multiple times into the same translation unit. *Why it exists:* to prevent compilation errors caused by the compiler seeing the exact same declaration twice.

**Objects and methods used:**
- **std::cout**
  - *What it is:* The standard character output stream.
  - *Implementation:* `extern std::ostream cout;` (declared in `<iostream>`).
  - *Its use:* To output text to the console, proving our programs are running.
- **g++**
  - *What it is:* The GNU C++ compiler and linker driver.
  - *Implementation:* A command-line executable.
  - *Its use:* To translate our C++ text files into machine code and link them into a final program.

---

## Concept Unit: Namespaces

### The Problem
When a codebase grows large, or when you use multiple external libraries, you inevitably encounter naming collisions. Two different programmers might both write a function named `calculateGravity()` or a class named `Window`. We need a way to isolate names so the compiler knows exactly which version we mean.

### The New Code
```cpp
#include <iostream>

namespace Physics {
    double calculateGravity() {
        return 9.81;
    }
}

namespace UI {
    double calculateGravity() {
        return 0.0;
    }
}

int main() {
    double realGravity = Physics::calculateGravity();
    double screenGravity = UI::calculateGravity();
    
    std::cout << realGravity << "\n";
    std::cout << screenGravity << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>` copies the standard input/output declarations into this file.
- `namespace Physics { ... }` creates a named scope called `Physics`. Any function, class, or variable declared inside these braces belongs exclusively to this namespace.
- `double calculateGravity() { ... }` inside `Physics` defines the function.
- `namespace UI { ... }` creates a second, entirely separate boundary.
- `double calculateGravity() { ... }` inside `UI` defines a function with the exact same name. Because it is in a different namespace, it does not conflict with the first one.
- `int main() { ... }` defines the entry point of the program.
- `double realGravity = Physics::calculateGravity();` calls the function. The `::` is the **scope resolution operator**. It tells the compiler to look strictly inside the `Physics` boundary for a function named `calculateGravity`.
- `double screenGravity = UI::calculateGravity();` does the same for the `UI` boundary.
- `std::cout << ...` uses the `::` operator to access `cout` from the `std` (standard) namespace.

### CS Lens
This embodies the concept of a hierarchical namespace. It transforms a flat, global list of names into a structured tree. This is mathematically identical to a computer's file system, where you cannot have two files named `data.txt` in the same folder, but you can have one in `/physics/data.txt` and one in `/ui/data.txt`.

### SE Lens
The engineering principle is encapsulation and collision prevention. The alternative not chosen is prefixing every name manually (like `Physics_calculateGravity()`), which is what older languages like C rely on. The tradeoff C++ makes is slightly more typing at the call site, but it fundamentally solves the problem of integrating third-party libraries without fear that their internal names will break your program.

### Run It Yourself
1. Open a terminal and create a file named `namespaces.cpp`.
2. Paste the code above into the file.
3. Compile with: `g++ -std=c++17 namespaces.cpp -o namespaces`
4. Run the program with `./namespaces` (or `.\namespaces.exe` on Windows).
5. Expected output:
   ```
   9.81
   0
   ```

---

## Concept Unit: The `using` Declaration

### The Problem
Typing a full namespace path like `std::cout` or `Physics::calculateGravity()` repeatedly is tedious and clutters the code. We need a way to tell the compiler, "For the rest of this block, if I use this name, assume I mean the one from this specific namespace."

### The New Code
```cpp
#include <iostream>

namespace Database {
    void connect() {
        std::cout << "Connecting to database...\n";
    }
}

int main() {
    using Database::connect;
    using std::cout;
    
    connect();
    cout << "Finished.\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `namespace Database { ... }` creates a namespace holding a `connect` function.
- `using Database::connect;` tells the compiler that whenever it sees the bare word `connect` in this scope, it should assume it means `Database::connect`. 
- `using std::cout;` instructs the compiler that the bare word `cout` resolves to `std::cout`.
- `connect();` calls the function without needing the `Database::` prefix.
- `cout << "Finished.\n";` uses the standard output stream without the `std::` prefix.

### CS Lens
This embodies scope modification. The compiler maintains a lookup table (a symbol table) for the current scope. A `using` declaration injects a specific symbol from an external namespace directly into the local symbol table, bypassing the need for explicit path traversal.

### SE Lens
The alternative is `using namespace std;`, which dumps *every* name from the standard library into the current scope. The tradeoff of targeting specific symbols (`using std::cout;`) instead of whole namespaces is that it takes a few extra lines of typing, but prevents catastrophic silent name collisions. If you dump a massive namespace and happen to create a function that shares a name with something inside it, the compiler might silently choose the wrong one, leading to bugs that are incredibly difficult to trace.

### Run It Yourself
1. Create a file named `using_decl.cpp`.
2. Paste the code above into the file.
3. Compile with: `g++ -std=c++17 using_decl.cpp -o using_decl`
4. Run the program.
5. Expected output:
   ```
   Connecting to database...
   Finished.
   ```

---

## Concept Unit: Header Files and Source Files

### The Problem
Writing an entire program in one file becomes impossible to manage. We need to split code into multiple files. However, the C++ compiler reads files strictly from top to bottom, one at a time. If `main.cpp` calls a function defined in `math_utils.cpp`, the compiler will fail when reading `main.cpp` because it has no idea what that function looks like. We need a way to promise the compiler that a function exists and tell it the exact signature, without providing the full body.

### The New Code

**File 1: `math_utils.h`**
```cpp
double square(double x);
```

**File 2: `math_utils.cpp`**
```cpp
#include "math_utils.h"

double square(double x) {
    return x * x;
}
```

**File 3: `main.cpp`**
```cpp
#include <iostream>
#include "math_utils.h"

int main() {
    std::cout << square(5.0) << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `double square(double x);` in the `.h` file is a **forward declaration**. It ends in a semicolon, not braces. It tells the compiler, "A function named `square` exists. It takes a `double` and returns a `double`. Trust me, you will find the body later."
- `#include "math_utils.h"` in the `.cpp` files is a preprocessor command. Before the compiler even tries to understand the C++ code, the preprocessor physically copies the exact text from `math_utils.h` and pastes it into the `.cpp` file, replacing the `#include` line. The double quotes `""` tell the preprocessor to look in the current folder for the file, while brackets `<>` are reserved for system libraries.
- `double square(double x) { return x * x; }` in `math_utils.cpp` is the **definition**. It provides the actual computational logic.
- `square(5.0)` in `main.cpp` is the call. When the compiler reads `main.cpp`, it first pastes the header. Because it sees the declaration, it validates that `5.0` is a double, and permits the call.

### CS Lens
This embodies the separation of Interface (the header) and Implementation (the source). It is a foundational concept in modular programming. You give other modules exactly the information they need to talk to your code (the interface), completely hiding the underlying complexity (the implementation).

### SE Lens
The alternative not chosen is requiring the compiler to automatically scan the entire project folder to find definitions, which languages like Java and C# do. The tradeoff C++ makes requires you to manually manage headers. The benefit is compilation speed for massive codebases: if you change the internal logic of `math_utils.cpp` without altering `math_utils.h`, files that depend on the header (like `main.cpp`) do not need to be recompiled at all.

### Run It Yourself
1. Create `math_utils.h`, `math_utils.cpp`, and `main.cpp` in the same folder and paste the respective code.
2. Compile both `.cpp` files together: `g++ -std=c++17 main.cpp math_utils.cpp -o program`
3. Run `./program`.
4. Expected output:
   ```
   25
   ```

---

## Concept Unit: Include Guards

### The Problem
Because `#include` literally copies and pastes text, including a file multiple times in the same chain creates a disaster. If `renderer.h` includes `shapes.h`, and `main.cpp` includes both, the preprocessor will paste `shapes.h` twice into `main.cpp`. The compiler will then see two identical declarations of the same struct and crash, refusing to redefine it. We need a way to tell the preprocessor to ignore a file if it has already been pasted.

### The New Code

**File 1: `engine.h`**
```cpp
#pragma once

struct Engine {
    int horsepower;
};
```

**File 2: `car.h`**
```cpp
#pragma once
#include "engine.h"

struct Car {
    Engine motor;
};
```

**File 3: `main.cpp`**
```cpp
#include <iostream>
#include "engine.h"
#include "car.h"

int main() {
    Car myCar;
    myCar.motor.horsepower = 400;
    std::cout << "HP: " << myCar.motor.horsepower << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#pragma once` is a preprocessor directive placed at the very top of a header file. 
- When the preprocessor processes `#include "engine.h"` in `main.cpp`, it copies the text of `engine.h`.
- When it processes `#include "car.h"`, it copies the text of `car.h`.
- Inside `car.h`, there is another `#include "engine.h"`. The preprocessor sees that it has already processed `engine.h` in this translation unit, and because of the `#pragma once` directive, it strictly refuses to copy the contents a second time.
- The compiler ultimately receives a file with exactly one definition of `Engine` and one definition of `Car`.

### CS Lens
This embodies idempotency. An operation is idempotent if doing it once has the same effect as doing it multiple times. `#pragma once` makes the act of including a header idempotent, protecting the system from recursive or duplicate state changes.

### SE Lens
The older alternative to `#pragma once` is the "include guard" pattern, which involves wrapping the file in `#ifndef MY_HEADER_H`, `#define MY_HEADER_H`, and `#endif`. `#pragma once` achieves the exact same thing in a single line, is less error-prone (no risk of typos in the macro name), and is slightly faster for the compiler to process. It is supported by every modern C++ compiler, making the old macro pattern obsolete for new code.

### Run It Yourself
1. Create `engine.h`, `car.h`, and `main.cpp`.
2. Compile: `g++ -std=c++17 main.cpp -o auto` (Note: header files are never passed directly to `g++`).
3. Run `./auto`.
4. Expected output:
   ```
   HP: 400
   ```

---

## Concept Unit: The Linker

### The Problem
When `main.cpp` is compiled, the compiler only checks that the functions it calls were declared in a header. It leaves a blank space in the compiled machine code where the actual function memory address should be. If the implementation is in a different file, how do these blank spaces get filled in so the program can actually execute?

### The New Code
Instead of writing new C++ code, we will compile the files from the `math_utils` unit using different commands to observe how the compilation pipeline actually works.

```bash
g++ -std=c++17 -c main.cpp
g++ -std=c++17 main.cpp -o broken_program
g++ -std=c++17 main.cpp math_utils.cpp -o program
```

### Mechanical Walkthrough
- `g++ -c main.cpp` tells the compiler to compile the C++ text into machine code (creating `main.o` or `main.obj`), but strictly stop there. It does not attempt to create a final executable. This succeeds because `main.cpp` has the header, which is all the compiler requires to validate the grammar and types.
- `g++ main.cpp -o broken_program` tells the compiler to compile the code *and* invoke the Linker to build the final executable. The compiler does its job, but the Linker throws a fatal error: `undefined reference to 'square(double)'`. The Linker looked for the implementation of `square`, couldn't find it, and refused to output a broken program.
- `g++ main.cpp math_utils.cpp -o program` gives the compiler both files. It compiles them both into object files behind the scenes, and passes both to the Linker. The Linker finds the empty placeholder in `main`'s machine code, finds the actual address of `square` in `math_utils`'s machine code, and stitches them together into the final `program`. 

### CS Lens
This embodies multi-stage processing and late binding. The task of translating human text into machine instructions (compiling) is strictly decoupled from the task of wiring those instructions together (linking). 

### SE Lens
The alternative not chosen is forcing the compiler to output a final executable immediately every time a single file is processed. The tradeoff of the compile-then-link pipeline is slightly more complex build commands. The massive advantage is incremental builds. In a project with 1,000 files, if you change one `.cpp` file, you only have to recompile that single file. The linker then quickly restitches the 1 new object file with the 999 old object files, reducing build times from hours to seconds.

### Run It Yourself
1. Ensure you have the `math_utils.h`, `math_utils.cpp`, and `main.cpp` files from the earlier unit.
2. Run `g++ -std=c++17 main.cpp -o broken`. Observe the linker error.
3. Run `g++ -std=c++17 main.cpp math_utils.cpp -o program`. Observe that it successfully completes.

---

## Connect the Pieces

Observe the lifecycle of a modern C++ project:
We write `double calculate() { return 1.0; }` in a `.cpp` file, nesting it in `namespace Engine` to isolate the name. We declare the signature `double calculate();` inside a `.h` file, wrapped in `#pragma once` to prevent duplication. A second file uses `#include` to safely absorb the signature, and uses `using Engine::calculate;` to avoid typing the namespace over and over. The compiler validates each file in isolation, turning them into machine code. Finally, the linker unites the files, matching the call site in the second file to the exact machine instructions in the first.

## What Breaks Without This

Without the linker, your code can compile perfectly but never run. The compiler only verifies that you followed the rules of grammar; the linker verifies that the universe actually contains what you promised it did.

Run the broken command from the Linker unit again:
`g++ -std=c++17 main.cpp -o broken_program`

**The error:**
```
/usr/bin/ld: /tmp/ccXXXXXX.o: in function `main':
main.cpp:(.text+0x15): undefined reference to `square(double)'
collect2: error: ld returned 1 exit status
```

The error doesn't come from `g++` directly—it comes from `ld` (the GNU linker). It successfully found `main`, but halted at `undefined reference`. Fix it by supplying all necessary `.cpp` files to the compilation command.

## Exercises

1. Create a namespace `Math` and write a function `int add(int a, int b)`. In `main()`, call it using the `::` operator without any `using` declarations.
2. Create `logger.h` with an `#pragma once` guard and a function declaration `void log(std::string message);` (you will need `#include <string>` in the header). Implement it in `logger.cpp`, and call it from `main.cpp`. Compile all of them together.
3. Deliberately remove `#pragma once` from `logger.h`, include `logger.h` twice in `main.cpp` manually (`#include "logger.h"` written twice in a row), and attempt to compile. Observe the "redefinition" compiler error.

## Definition of Done
- [ ] You have written and executed code that successfully isolates functions using namespaces.
- [ ] You have used `#pragma once` to protect a header file from being included multiple times.
- [ ] You have split a single program across a `.h` file, a `.cpp` implementation, and a `.cpp` entry point.
- [ ] You have intentionally triggered a linker error by compiling a file without its required implementations.
- [ ] You can explain the exact difference between the compiler and the linker out loud, in your own words.
