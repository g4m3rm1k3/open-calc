# Lesson 01: Types and Variables

**What you will build:** A series of isolated console programs that allocate memory for data, manipulate that data, and prove how the C++ compiler enforces rules about what that data represents. You will observe how values are copied in memory and how the compiler acts as a gatekeeper to prevent invalid operations before the program is ever allowed to run.

**What you need to know first:** Nothing.

**Terms introduced in this lesson:**
- **Variable** — a named location in memory used to store data. *Why it exists:* so that your program can store, retrieve, and manipulate data over time without needing to hardcode memory addresses.
- **Value Type** — a category of data types where the variable directly contains its data. *Why it exists:* to provide fast, stack-allocated storage for small, fundamental pieces of data.
- **Type Safety** — a language feature ensuring that a variable is only used in ways consistent with its defined type. *Why it exists:* to catch errors at compile time rather than crashing unexpectedly while the program is running.
- **Compile Time** — the period when the C++ compiler translates your source code into executable instructions. *Why it exists:* to validate the structure, syntax, and type safety of your code before it executes.
- **Runtime** — the period when the executable instructions are actively executing on the computer. *Why it exists:* to perform the actual computational work defined by your code.
- **Type Inference** — the compiler's ability to deduce the type of a variable from the value assigned to it. *Why it exists:* to reduce redundant typing without sacrificing the guarantees of type safety.

**Objects and methods used:**
- **std::cout**
  - *What it is:* The standard output stream representing the console.
  - *Implementation:* Defined in the `<iostream>` standard library header.
  - *Its use:* To make the internal state of your variables visible so you can verify what your program is doing.
- **main**
  - *What it is:* The entry point of every C++ program.
  - *Implementation:* A function returning an `int`, typically `int main() { ... }`.
  - *Its use:* The operating system looks for this specific function to start executing your compiled program.

---

## Concept Unit: Value Types

### The Problem
A program needs to hold onto information—numbers, characters, true/false states—so it can use them later. When you store this information, you need a guarantee that if you give a copy of this information to another part of your program, altering the copy will not accidentally overwrite the original data.

### The New Code
```cpp
#include <iostream>

int main() {
    int originalScore = 100;
    double temperature = 98.6;
    bool isOnline = true;
    char grade = 'A';
    
    int copiedScore = originalScore;
    copiedScore = 50;
    
    std::cout << originalScore << "\n";
    std::cout << copiedScore << "\n";
    return 0;
}
```

### The Updated Project
Because this is the first lesson, this new code *is* the entire project. It defines the entry point (`main`) and runs sequentially from top to bottom.

### Mechanical Walkthrough
- `#include <iostream>` tells the compiler to copy the declarations for standard input and output routines into this file. Without this, the compiler will not know what `std::cout` is.
- `int main()` defines the function where the operating system starts execution. It returns an `int` to the operating system to indicate success or failure.
- `{` and `}` define the boundaries of the `main` function.
- `int originalScore = 100;` declares a variable of type `int` (an integer) named `originalScore` and assigns it the value `100`. The compiler allocates memory specifically sized for an integer, because without exactly defining the size and shape of the data, the computer cannot safely store or retrieve it.
- `double temperature = 98.6;` allocates memory for a double-precision floating-point number. The `double` type is used here because an `int` cannot store fractional values; attempting to do so would result in the compiler dropping the fraction.
- `bool isOnline = true;` allocates memory for a boolean value. This works because a `bool` strictly represents binary logic (`true` or `false`), which is the fundamental unit of decision-making in computation.
- `char grade = 'A';` allocates memory for a single character. The single quotes are required to tell the compiler this is a character literal, not a variable name or text string.
- `int copiedScore = originalScore;` creates a completely new `int` variable named `copiedScore`. It reads the value stored in `originalScore` (`100`) and writes that exact value into the new memory location belonging to `copiedScore`.
- `copiedScore = 50;` overwrites the data in the memory location of `copiedScore`. Because `copiedScore` is a separate location in memory, this change affects only `copiedScore`. The original memory location remains completely untouched.
- `std::cout << originalScore << "\n";` prints the value of `originalScore`, followed by a newline character. `std::cout` represents the console output, and the `<<` operator pushes data into it.
- `std::cout << copiedScore << "\n";` prints the copied value. Because the variables are isolated in memory, printing `originalScore` outputs `100`, and printing `copiedScore` outputs `50`.
- `return 0;` signals to the operating system that the program completed successfully.

### CS Lens
This embodies the concept of "Pass by Value" and stack allocation. Small, fundamental units of data are stored directly where they are declared. When you assign one value type to another, the computer physically copies the binary data from one memory address to another, ensuring total isolation between the two variables.

### SE Lens
The engineering principle is data isolation by default. The alternative not chosen is storing all variables as shared references. The tradeoff is that value types require copying memory every time they are assigned, which is incredibly fast for small data (like an `int`), but would be computationally expensive if applied to massive structures.

### Commands needed to make this unit real
To compile and run a C++ program from the terminal:
1. Compile: `g++ -std=c++17 main.cpp -o main`
   - `g++`: the C++ compiler.
   - `-std=c++17`: forces the compiler to follow the C++17 standard rules.
   - `main.cpp`: your source code file.
   - `-o main`: names the resulting executable `main` (or `main.exe` on Windows).
2. Run: `./main` (or `.\main.exe` on Windows).

### Run It Yourself
1. Open a terminal and create a new file named `main.cpp`.
2. Paste the code above into the file.
3. Compile it: `g++ -std=c++17 main.cpp -o main`
4. Run it: `.\main.exe` (Windows) or `./main` (macOS/Linux)
5. Expected output:
```
100
50
```

---

## Concept Unit: Type Safety

### The Problem
If a variable is designed to hold an integer, storing raw text inside it represents a catastrophic logic failure. If the program attempts to perform arithmetic on an incompatible type, the computer does not know how to process that instruction. We need the system to categorically refuse invalid data long before the code is actually executed.

### The New Code
```cpp
#include <iostream>

int main() {
    int quantity = 5;
    
    // The compiler requires strict types.
    // If we want a character, we must provide one.
    // Uncommenting the next line would cause a compiler error:
    // int badValue = "apples";

    char itemInitial = 'A';
    
    std::cout << quantity << itemInitial << "\n";
    return 0;
}
```

### The Updated Project
Replaces the content of `main.cpp`. It introduces a demonstration of type strictness.

### Mechanical Walkthrough
- `int quantity = 5;` creates a variable strictly bound to the rules of integers.
- `int badValue = "apples";` is commented out. If active, the compiler would refuse to compile the program because a string literal (`"apples"`) has a different memory layout than an integer. The compiler acts as a gatekeeper.
- `char itemInitial = 'A';` creates a variable strictly bound to the rules of a single character.
- `std::cout << quantity << itemInitial << "\n";` chains multiple values into the output stream. The `<<` operator is smart enough to handle different types appropriately because the compiler knows exactly what type `quantity` and `itemInitial` are.

### CS Lens
This embodies Static Typing. The shape and constraints of every variable are evaluated against strict rules before the program is permitted to run. This is similar to a physical puzzle box: if you try to put a square peg in a round hole, the physical constraints prevent it immediately, rather than letting you drop it in and causing a jam later.

### SE Lens
The alternative not chosen is Dynamic Typing (used by Python or JavaScript), where variables have no fixed type and can hold anything at any time. The real tradeoff here is friction versus safety. C++ forces you to explicitly declare intentions, which slows down initial development but drastically reduces runtime crashes in production by catching misalignments during compilation.

### Run It Yourself
1. Replace the contents of `main.cpp` with the code above.
2. Compile and run it.
3. Expected output:
```
5A
```

---

## Concept Unit: Local Type Inference (auto)

### The Problem
When the type of a variable is blatantly obvious from the value being assigned to it, forcing the programmer to write out the type name is redundant. We need a way to let the compiler figure out the type automatically, without sacrificing the strict safety rules established in the previous unit.

### The New Code
```cpp
#include <iostream>

int main() {
    auto year = 2024;
    auto isComplete = false;
    auto grade = 'A';
    auto temperature = 98.6;

    std::cout << year + 1 << "\n";
    return 0;
}
```

### The Updated Project
Replaces the content of `main.cpp`. It uses the `auto` keyword to deduce types automatically.

### Mechanical Walkthrough
- `auto year = 2024;` instructs the compiler to deduce the type of `year` by looking at the right side of the equals sign. Because `2024` is an integer literal, the compiler locks `year` to the `int` type. It is exactly identical to writing `int year = 2024;`.
- `auto isComplete = false;` locks `isComplete` to the `bool` type because `false` is a boolean literal.
- `auto grade = 'A';` locks `grade` to the `char` type because of the single quotes.
- `auto temperature = 98.6;` locks `temperature` to the `double` type because it has a fractional component.
- `std::cout << year + 1 << "\n";` performs integer math. If `auto` meant "dynamic type", the compiler wouldn't know if this was a valid operation until runtime. Because `auto` is statically typed, the compiler guarantees this math is valid before the program runs.

### CS Lens
This embodies Type Inference. The compiler acts as a static analyzer, tracing the flow of data to prove the type without explicit annotation. 

### SE Lens
The alternative not chosen is requiring explicit type annotations everywhere. The tradeoff `auto` introduces is readability. While it saves keystrokes and makes code visually cleaner, it can obscure the exact type from the human reader if the right side of the assignment is a complex function call rather than an obvious literal.

### Run It Yourself
1. Replace the contents of `main.cpp` with the code above.
2. Compile and run it.
3. Expected output:
```
2025
```

---

## Connect the Pieces

Observe how strict data typing governs data isolation and behavior:
We define `int a = 10;`. The compiler allocates a memory block for an integer. We use type inference to create a copy: `auto b = a;`. The compiler infers `b` is also an `int`. We assign `b = 20;`. Because `int` is a value type, `a` remains `10`. We attempt to store text: `b = "twenty";`. The compiler strictly enforces type safety, completely rejecting the change because `b` was locked as an `int` at compile time, demonstrating that `auto` does not bypass the rules of static typing.

## What Breaks Without This

Without type safety, your programs would crash unpredictably when given incompatible data. Let's force the compiler to stop you.

Open `main.cpp` and write this inside `main`:
```cpp
int target = "hello";
```

Compile the program: `g++ -std=c++17 main.cpp -o main`

The compilation fails before the program ever runs.
**The error:**
`error: invalid conversion from 'const char*' to 'int'`

The compiler caught the logic flaw. To fix it, you must respect the types. Restore it by either changing the value to a valid number, or declaring the appropriate type for text.

## Exercises

1. Create a `double` variable representing a price. Use `auto` to create a second variable that holds that price. Change the second variable. Print both to prove the first price did not change.
2. Create an `auto` variable and assign it the character `'X'`. On the next line, attempt to assign a string `"hello"` to that same variable. Run the compiler to observe the type inference locking the variable's type, causing a compile-time error.

## Definition of Done
- [ ] You have written and executed code that proves changing a copied integer does not change the original.
- [ ] You have intentionally triggered a compiler error by assigning the wrong data type to a variable.
- [ ] You have verified that `auto` enforces type safety at compile time.
- [ ] You can explain type safety out loud, in your own words, to someone who hasn't read this lesson.
