# Lesson 05: Functions

**What you will build:** A series of isolated console programs that group instructions into named, reusable blocks, pass data into them in different ways, and return results. You will observe how data is copied, how memory locations are shared directly, and how the C++ compiler guarantees that shared data cannot be unexpectedly modified.

**What you need to know first:** Basic types, variables, memory addresses, pointers, and references (assumed covered in prior lessons).

**Terms introduced in this lesson:**
- **Function** — a named block of code that performs a specific task. *Why it exists:* so that you can reuse a sequence of instructions without rewriting them, and name that sequence so its purpose is clear.
- **Return Type** — the type of data a function hands back to whoever called it once it finishes. *Why it exists:* so that the caller can safely use the result in further calculations, knowing exactly what shape the data will be.
- **Parameter** — a variable declared in a function's signature that acts as a placeholder for the actual data passed in. *Why it exists:* so the function can operate on different data each time it is called.
- **Argument** — the actual data provided to a function when it is called. *Why it exists:* to give the function specific values to work with for a single execution.
- **Pass-by-Value** — a method of passing arguments where the function receives a brand-new copy of the data. *Why it exists:* to guarantee that any changes made inside the function cannot affect the original data.
- **Pass-by-Reference** — a method of passing arguments where the function receives direct access to the original data's memory location using an alias. *Why it exists:* to avoid the cost of copying large data and to allow a function to modify the original data.
- **Pass-by-Pointer** — a method of passing arguments where the function receives the memory address of the original data. *Why it exists:* to allow a function to modify the original data, while also allowing the possibility that no data was provided at all (a null pointer).
- **const Parameter** — a parameter marked as immutable. *Why it exists:* to allow a function to read original data directly (saving copying time) while having the compiler guarantee the function cannot accidentally modify it.

**Objects and methods used:**
- **std::cout**
  - *What it is:* The standard character output stream in C++.
  - *Implementation:* An object of type `std::ostream` defined in `<iostream>`.
  - *Its use:* To print the values of variables to the terminal so we can verify how our functions manipulate data.
- **std::endl**
  - *What it is:* A manipulator that inserts a newline character and flushes the output stream.
  - *Implementation:* A function template defined in `<ostream>`.
  - *Its use:* To ensure our terminal output is readable and immediately printed.

**Everything else in the file, not this lesson's subject but still explained:**
- **std::string**
  - *What it is:* A standard library class representing a sequence of characters.
  - *Implementation:* A typedef for `std::basic_string<char>` in `<string>`.
  - *Its use:* To demonstrate passing larger, more complex data structures to functions, where copying becomes expensive and referencing becomes necessary.

---

## Concept Unit: Functions and Return Types

### The Problem
Writing the same math or logic repeatedly is error-prone. We need a way to define an operation once, give it a name, and receive a result back so we can use it multiple times without duplicating code.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because this series uses throwaway code to prove concepts in isolation.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** N/A.
- **Dependencies:** A C++17 compiler (e.g., `g++` or `clang++`).

### The New Code
```cpp
#include <iostream>

int calculateArea(int width, int height) {
    int area = width * height;
    return area;
}

int main() {
    int roomArea = calculateArea(5, 10);
    std::cout << "Area: " << roomArea << std::endl;
    return 0;
}
```

### The Updated Project
*(Skipped: `main.cpp` is a brand-new file with nothing surrounding it yet.)*

### Mechanical Walkthrough
- `#include <iostream>` imports the standard input/output stream library, giving us access to `std::cout`.
- `int calculateArea(int width, int height)` is the function signature. The first `int` is the return type, declaring that this function will give back an integer. `calculateArea` is the function's name. `(int width, int height)` are the parameters, stating that anyone calling this function must provide two integers.
- `{` begins the function's body, the block of code that executes when the function is called.
- `int area = width * height;` allocates a new integer variable named `area` and assigns it the mathematical product of the two parameters.
- `return area;` halts the function's execution and hands the value stored in `area` back to the caller. The type of this value matches the `int` return type declared in the signature.
- `}` ends the function's body.
- `int main()` is the entry point of every C++ program.
- `int roomArea = calculateArea(5, 10);` calls the function. The values `5` and `10` are the arguments. The program pauses `main`, jumps into `calculateArea`, runs it, takes the returned `50`, and stores it in the newly allocated `roomArea` variable.
- `std::cout << "Area: " << roomArea << std::endl;` prints the result to the console.
- `return 0;` signals to the operating system that the program completed successfully.

### CS Lens
This embodies the concept of subroutines and abstraction. By wrapping an operation in a function, we abstract away the implementation details. The caller only needs to know the inputs and outputs, not how the work is actually performed. Also recognized in: mathematical functions, CPU jump instructions, RPC (Remote Procedure Calls).

### SE Lens
The design principle here is DRY (Don't Repeat Yourself). The alternative not chosen is inline duplication—writing `width * height` every time you need an area. The tradeoff is a slight performance overhead (function call overhead) to jump the instruction pointer to another memory location, but it drastically reduces maintenance cost because the logic is centralized in one place.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main` compiles the C++ source file into an executable named `main`.
- `./main` (or `.\main.exe` on Windows) runs the compiled executable.

### Run it. Show the real output.
```
Area: 50
```

### Discard the throwaway example
This file is now explicitly discarded and will not appear in the project again.

### Connection
Now that we can pass data into a function, we need to understand exactly how that data is handed over, because C++ defaults to a specific behavior that isolates our original variables from changes.

---

## Concept Unit: Pass-by-Value

### The Problem
When we hand data to a function, we need to know if the function can destroy or alter our original data. If a function misbehaves and modifies a parameter, it shouldn't corrupt the caller's state.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** N/A.
- **Dependencies:** A C++17 compiler.

### The New Code
```cpp
#include <iostream>

void attemptBonus(int score) {
    score = score + 50;
    std::cout << "Inside function: " << score << std::endl;
}

int main() {
    int originalScore = 100;
    attemptBonus(originalScore);
    std::cout << "Outside function: " << originalScore << std::endl;
    return 0;
}
```

### The Updated Project
*(Skipped: `main.cpp` is a brand-new file.)*

### Mechanical Walkthrough
- `void attemptBonus(int score)` declares a function. The `void` return type means this function returns nothing at all.
- `score = score + 50;` adds 50 to the local parameter `score`.
- `std::cout << "Inside function: " << score << std::endl;` prints the modified local variable, outputting 150.
- `int originalScore = 100;` allocates memory in `main` for an integer and stores 100.
- `attemptBonus(originalScore);` calls the function. Because this is pass-by-value (the default in C++), the compiler physically copies the binary data `100` from `originalScore` into a completely new memory location reserved for the `score` parameter. 
- `std::cout << "Outside function: " << originalScore << std::endl;` prints the variable in `main`. It outputs 100, proving that `originalScore` was completely untouched by the mutation inside the function.

### CS Lens
This embodies pass-by-value and stack isolation. The function executes in its own isolated stack frame, creating localized copies of all incoming arguments. 

### SE Lens
The engineering principle is data isolation by default. The alternative not chosen is shared memory for all variables. The tradeoff is memory duplication: pass-by-value is incredibly fast and safe for small fundamental types (like `int` or `bool`), but doing this for a massive multi-megabyte string would waste memory and CPU cycles copying data pointlessly.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`
- `./main`

### Run it. Show the real output.
```
Inside function: 150
Outside function: 100
```

### Discard the throwaway example
This file is now explicitly discarded.

### Connection
Pass-by-value protects our data, but sometimes we *want* a function to modify our original data directly without making a copy.

---

## Concept Unit: Pass-by-Reference

### The Problem
We need a way to grant a function direct access to our existing memory. We want to avoid the cost of copying data, and we want mutations inside the function to actually alter the original variable in the caller.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** N/A.
- **Dependencies:** A C++17 compiler.

### The New Code
```cpp
#include <iostream>

void grantBonus(int& score) {
    score = score + 50;
    std::cout << "Inside function: " << score << std::endl;
}

int main() {
    int myScore = 100;
    grantBonus(myScore);
    std::cout << "Outside function: " << myScore << std::endl;
    return 0;
}
```

### The Updated Project
*(Skipped: `main.cpp` is a brand-new file.)*

### Mechanical Walkthrough
- `void grantBonus(int& score)` declares a function that takes a reference. The `&` symbol after the type means `score` is not a new integer; it is a direct alias to whatever existing integer is passed in.
- `score = score + 50;` adds 50 to `score`. Because `score` is a reference, this operation reaches across the boundary of the function and directly mutates the original memory location.
- `int myScore = 100;` allocates memory in `main` holding 100.
- `grantBonus(myScore);` calls the function. No copy is made. The parameter `score` becomes an alternate name for `myScore`'s exact memory address.
- `std::cout << "Outside function: " << myScore << std::endl;` prints `myScore`, which outputs 150, proving that the function successfully mutated the original data.

### CS Lens
This embodies pointer semantics abstracted safely. Under the hood, a reference is implemented as a pointer (a memory address), but the compiler hides the memory management from you, making it look and act exactly like a normal variable.

### SE Lens
The tradeoff here is performance versus safety. You eliminate the CPU overhead of copying data, but you surrender the isolation guarantee. If `grantBonus` modifies the data improperly, `main` suffers the consequences immediately.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`
- `./main`

### Run it. Show the real output.
```
Inside function: 150
Outside function: 150
```

### Discard the throwaway example
This file is now explicitly discarded.

### Connection
References are powerful, but they require the data to actually exist. Sometimes, we want a function to modify data, but we also need a way to say "there is no data right now."

---

## Concept Unit: Pass-by-Pointer

### The Problem
A reference must always point to a valid object; it cannot be empty. If we are writing a function that updates a player's score, but the player might not be logged in (so their score doesn't exist), we need a way to pass an empty value safely.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** N/A.
- **Dependencies:** A C++17 compiler.

### The New Code
```cpp
#include <iostream>

void optionalBonus(int* scorePointer) {
    if (scorePointer != nullptr) {
        *scorePointer = *scorePointer + 50;
        std::cout << "Added bonus. New score: " << *scorePointer << std::endl;
    } else {
        std::cout << "No score provided. Skipping." << std::endl;
    }
}

int main() {
    int myScore = 100;
    
    optionalBonus(&myScore);
    std::cout << "In main: " << myScore << std::endl;
    
    optionalBonus(nullptr);
    
    return 0;
}
```

### The Updated Project
*(Skipped: `main.cpp` is a brand-new file.)*

### Mechanical Walkthrough
- `void optionalBonus(int* scorePointer)` declares a function taking a pointer to an integer. The `*` signifies that it expects a memory address, not the value itself.
- `if (scorePointer != nullptr)` checks if the pointer is empty. `nullptr` is the standard C++ keyword representing a null (empty) memory address. This is the crucial difference from references: pointers can explicitly point to nothing.
- `*scorePointer = *scorePointer + 50;` dereferences the pointer using the `*` operator, reaching into the memory address to modify the actual integer stored there.
- `optionalBonus(&myScore);` passes the exact memory address of `myScore` to the function using the address-of operator `&`.
- `optionalBonus(nullptr);` passes an empty address. The function's `if` check safely catches this and skips the modification, preventing a crash.

### CS Lens
This embodies memory addressing and nullability. Allowing a pointer to be null means the function caller can opt out of providing data, which is a common pattern in C-style APIs and older C++ codebases.

### SE Lens
The alternative not chosen is using `std::optional` (a modern C++ feature). The tradeoff of using raw pointers is safety. If you forget to write the `if (scorePointer != nullptr)` check and attempt to dereference a null pointer, the operating system will instantly terminate your program with a segmentation fault.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`
- `./main`

### Run it. Show the real output.
```
Added bonus. New score: 150
In main: 150
No score provided. Skipping.
```

### Discard the throwaway example
This file is now explicitly discarded.

### Connection
We've seen that passing by reference avoids copying, which is fast, but allows mutation, which is dangerous. We need a way to get the performance of a reference with the safety of a copy.

---

## Concept Unit: const Parameters

### The Problem
When dealing with large data structures like a long string of text, passing by value is unacceptably slow because the entire text must be duplicated in memory. Passing by reference is fast, but it accidentally grants the function the power to mutate the original string. We need to give the function direct access to the memory, but strictly forbid it from making changes.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** N/A.
- **Dependencies:** A C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <string>

void printName(const std::string& name) {
    // name = "Hacked"; // The compiler would reject this line
    std::cout << "Player Name: " << name << std::endl;
}

int main() {
    std::string player = "Alice";
    printName(player);
    return 0;
}
```

### The Updated Project
*(Skipped: `main.cpp` is a brand-new file.)*

### Mechanical Walkthrough
- `#include <string>` imports the standard string library, allowing us to use `std::string`.
- `void printName(const std::string& name)` declares the parameter as a constant reference. `const` locks the data, and `&` passes it by reference.
- `// name = "Hacked";` is commented out. If you uncommented this line, the C++ compiler would categorically refuse to compile the program. The `const` keyword forms a legally binding contract that this function will only read the memory, never write to it.
- `std::cout << "Player Name: " << name << std::endl;` reads the original string memory and prints it perfectly.
- `std::string player = "Alice";` allocates a larger, more complex string structure in memory.
- `printName(player);` passes the reference. No memory is copied, and the caller is mathematically guaranteed that `"Alice"` will not be altered.

### CS Lens
This embodies immutability enforced by the compiler. It shifts the burden of verifying safety from the programmer's brain to the compiler's static analysis engine.

### SE Lens
The design principle is "const correctness". The alternative not chosen is relying on programmer discipline (trusting them not to write `name = "Hacked";` while just using a plain `std::string&`). The tradeoff is a slightly more verbose signature, but it completely eliminates an entire class of bugs where data changes unexpectedly beneath you. Modern C++ style dictates that all references should be `const` unless the function specifically exists to mutate the data.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main`
- `./main`

### Run it. Show the real output.
```
Player Name: Alice
```

### Discard the throwaway example
This file is now explicitly discarded.

---

## Connect the Pieces

Observe how the compiler enforces data boundaries based on the function signature:
We define `int original = 100;`. We pass it to `void passByValue(int x)`. The compiler physically clones `100` into a new memory block. The function mutates `x`, but `original` remains safe. Next, we pass it to `void passByRef(int& x)`. The compiler passes the memory address directly. The function mutates `x`, and `original` is permanently altered. Finally, we declare a large text block `std::string text = "Hello";` and pass it to `void print(const std::string& str)`. The compiler passes the memory address to avoid an expensive copy, but erects a static analysis firewall around the reference, guaranteeing that the function cannot overwrite the text.

## What Breaks Without This

Without `const` correctness on references, a function designed only to read data might accidentally destroy it. Let's force the compiler to stop you.

Open `main.cpp` and write:
```cpp
#include <string>

void displayData(const std::string& data) {
    data = "Corrupted!";
}

int main() {
    std::string info = "Safe";
    displayData(info);
    return 0;
}
```

Run `g++ -std=c++17 main.cpp -o main`. The compilation fails before the program ever runs.
**The error:**
`error: assignment of read-only reference 'data'`

The compiler caught the logic flaw. To fix it, you must respect the immutable contract. Restore it by deleting the line that attempts to modify `data`.

## Exercises

1. Write a function `int subtract(int a, int b)` that returns the result of `a - b`. Call it from `main` and print the result.
2. Write a function `void tripleValue(int& number)` that takes a reference and multiplies the original variable by 3. Pass a variable in `main` to it, and print the variable before and after to prove it changed.
3. Attempt to write a function that takes a `const int&` parameter and try to add 1 to it inside the function. Run `g++` and observe the compiler error preventing the mutation.

## Definition of Done
- [ ] You have written and executed a function that returns a calculated value.
- [ ] You have proven with output that a pass-by-value parameter copies data, isolating the original variable.
- [ ] You have proven with output that a pass-by-reference parameter mutates the original variable.
- [ ] You have written a function that handles a `nullptr` pass-by-pointer safely without crashing.
- [ ] You have intentionally triggered a compiler error by trying to mutate a `const` reference parameter.
- [ ] You can explain the performance vs. safety tradeoff of pass-by-value vs pass-by-reference out loud.
