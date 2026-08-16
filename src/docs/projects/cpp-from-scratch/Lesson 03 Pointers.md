# Lesson 03: Pointers

**What you will build**
A series of isolated console programs that allocate memory for data, inspect memory addresses directly, manipulate data remotely through those addresses, and deliberately crash a program by misusing an empty address. This teaches the transferable problem of understanding memory indirection and the severe consequences of violating memory rules in C++.

**What you need to know first**
- Lesson 01: Basic console output, variables, and the `int` type.
- Lesson 02: Compilation via `g++`.

**Terms introduced in this lesson**
- **Pointer** — a variable whose value is a memory address rather than a piece of application data. *Why it exists:* so that a program can share, observe, or modify a single piece of data from multiple places without making expensive copies of it.
- **Memory Address** — a unique numerical identifier for a specific byte of RAM. *Why it exists:* so the computer's hardware and the operating system know exactly where to store and retrieve specific data.
- **Null Pointer** — a pointer that explicitly holds no valid memory address. *Why it exists:* to provide a safe, testable state indicating that a pointer is not currently pointing at any valid data.
- **Undefined Behavior (UB)** — a situation where the C++ standard deliberately does not specify what must happen, allowing the compiler to do whatever it wants (including crashing, corrupting data, or seemingly working fine). *Why it exists:* to allow compilers to optimize code heavily by assuming you will never write code that breaks fundamental memory rules.

**Objects and methods used**

- **Everything else in the file, not this lesson's subject but still explained:**
  - **`std::cout`**
    - *What it is:* The standard output stream.
    - *Implementation:* Reappearing from Lesson 01.
    - *Its use:* To make the internal state of our variables and memory addresses visible so we can verify what our program is doing.

---

## Concept Unit: The Address-Of Operator `&`

### The Problem
We have data safely stored in a variable, but to tell another part of the system *where* that data is instead of just giving it a copy, we need a way to ask the computer for the data's actual physical location in memory.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are proving fundamental language mechanics.
- **Files affected:** `main.cpp` (created)
- **Change type:** add
- **Location:** The entire file.
- **Dependencies:** A C++17 compiler (`g++`).

### The New Code
```cpp
#include <iostream>

int main() {
    int score = 42;
    std::cout << &score << "\n";
    return 0;
}
```

### The Updated Project
```cpp
#include <iostream>

int main() {
    int score = 42;
    std::cout << &score << "\n"; // ← new
    return 0;
}
```
This is a complete, minimal C++ program that allocates an integer and prints its memory address to the console.

### Mechanical Walkthrough
- `#include <iostream>` tells the compiler to pull in the declarations for standard input and output.
- `int main() {` is the entry point of the program.
- `int score = 42;` allocates memory for a 32-bit integer named `score` and assigns it the value `42`.
- `std::cout <<` pushes data to the standard output stream.
- `&score` — **first appearance**: The address-of operator `&` placed immediately before a variable name asks the compiler for the memory address where that variable is physically stored. It evaluates to a memory address, not the value `42`.
- `<< "\n";` pushes a newline character to the output stream.
- `return 0;` signals successful completion of the program to the operating system.
- `}` closes the function block.

### CS Lens
This embodies the concept of Indirection. Instead of operating on data directly, we are obtaining the means to locate the data. Indirection is a foundational concept in computer science. Also recognized in: file system paths, URLs, database indexes.

### SE Lens
The engineering principle is transparency vs. abstraction. C++ gives you the exact memory address because it prioritizes transparency and control. The alternative not chosen is hiding memory management entirely (like Java or Python do). The tradeoff is that you have extreme power over hardware, but you bear the total responsibility for using that power safely.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o app` compiles the source code into an executable named `app`.
- `./app` runs the resulting executable.

### Run it
```
0x7ffee23b9a1c
```
*(Your exact output will differ, as the OS assigns a different memory address each time the program runs).*

### Discard the throwaway example
The code in `main.cpp` is deleted and will not appear in the project again.

We have proven we can find a memory address; now we need a place to store it.

---

## Concept Unit: Pointers

### The Problem
Now that we can obtain a memory address using the `&` operator, we need a dedicated variable type capable of safely storing that address so we can pass it around the program. We cannot just store it in an `int`, because memory addresses have different sizes and rules than regular numbers.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp`
- **Change type:** replace
- **Location:** Inside `main()`.

### The New Code
```cpp
int score = 42;
int* addressOfScore = &score;
std::cout << addressOfScore << "\n";
```

### The Updated Project
```cpp
#include <iostream>

int main() {
    int score = 42;
    int* addressOfScore = &score; // ← new
    std::cout << addressOfScore << "\n";
    return 0;
}
```
The program now stores the memory address in a dedicated variable before printing it.

### Mechanical Walkthrough
- `int score = 42;` allocates the data variable.
- `int* addressOfScore` — **first appearance**: Declares a variable of type "pointer to int". The `*` here is part of the type declaration. It modifies `int` to mean "memory address of an int". This variable will hold a location, not an integer value.
- `= &score;` evaluates the address of `score` and assigns it to the pointer variable.
- `std::cout << addressOfScore << "\n";` prints the memory address stored inside the pointer.

### CS Lens
This embodies the concept of References. A variable that holds the location of data rather than the data itself.

### SE Lens
The engineering principle is typing by reference target. Why declare it as `int*` instead of just a generic `address` type? Because C++ insists on strict type safety even for memory addresses. The compiler tracks what *kind* of data lives at that address, preventing you from accidentally reading an `int` address as if it were a `double` address. 

### Run it
```
0x7ffcd34f8104
```

### Discard the throwaway example
The code inside `main()` is deleted.

We can store addresses. Now we need to travel to them.

---

## Concept Unit: The Dereference Operator `*`

### The Problem
Once we hold a memory address in a pointer variable, we need a way to travel to that exact address and interact with the actual data stored there, either to read it or mutate it, without ever touching the original variable name directly.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp`
- **Change type:** replace
- **Location:** Inside `main()`.

### The New Code
```cpp
int score = 42;
int* pScore = &score;

*pScore = 99;

std::cout << score << "\n";
```

### The Updated Project
```cpp
#include <iostream>

int main() {
    int score = 42;
    int* pScore = &score;
    
    *pScore = 99; // ← new
    
    std::cout << score << "\n";
    return 0;
}
```
The program alters the original integer indirectly by traveling through the pointer.

### Mechanical Walkthrough
- `int score = 42;` allocates the original integer.
- `int* pScore = &score;` stores its address in a pointer.
- `*pScore = 99;` — **first appearance**: The dereference operator `*`. When placed in front of a pointer variable *that is already declared*, it means "go to the address this pointer holds, and access the data there." We assign `99` into that location, mutating the original `score` indirectly.
- `std::cout << score << "\n";` prints the original `score` variable to prove it was changed.

### CS Lens
This embodies Shared State. Multiple paths (the variable name `score`, and the pointer `pScore`) now lead to the exact same piece of memory.

### SE Lens
The engineering principle is mutability through indirection. The alternative not chosen is returning a modified copy every time data changes. C++ allows direct in-place mutation through pointers because copying large structures is computationally expensive. The tradeoff is that analyzing the code becomes harder: `score` changed, even though the word `score` is never on the left side of an equals sign on that line.

### Run it
```
99
```
The output proves the value was mutated remotely.

### Discard the throwaway example
The code inside `main()` is deleted.

What happens if a pointer has no valid destination?

---

## Concept Unit: `nullptr` and Undefined Behavior

### The Problem
If a pointer is declared but hasn't been assigned a valid address yet, it holds whatever garbage data happened to be in RAM. We need a way to explicitly mark a pointer as empty, and we must understand the catastrophic consequence of trying to dereference a pointer that points nowhere.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp`
- **Change type:** replace
- **Location:** Inside `main()`.

### The New Code
```cpp
int* pEmpty = nullptr;
std::cout << *pEmpty << "\n"; 
```

### The Updated Project
```cpp
#include <iostream>

int main() {
    int* pEmpty = nullptr; // ← new
    std::cout << *pEmpty << "\n"; // ← new
    return 0;
}
```
The program explicitly creates an empty pointer and then deliberately attempts to travel to it.

### Mechanical Walkthrough
- `int* pEmpty = nullptr;` — **first appearance**: `nullptr` is a language keyword representing a safe, explicit "nowhere." It explicitly zeros out the pointer so it doesn't hold random garbage memory.
- `std::cout <<` prepares to output data.
- `*pEmpty` — **first appearance of UB**: We apply the dereference operator `*` to an empty address. We are telling the CPU "go to address 0 and read the integer there." The operating system reserves address 0 to trap errors. The standard dictates this is Undefined Behavior. The OS intercepts the illegal memory access and forcibly kills the program.
- `<< "\n";` is never reached.

### CS Lens
This embodies Memory Protection and Segmentation Faults. Modern operating systems isolate memory. When a program tries to read memory it does not own (like the zero page), the hardware issues a fault, and the OS terminates the process.

### SE Lens
The engineering principle is "Fast vs Safe". C++ chooses fast. The alternative not chosen is having the compiler automatically inject a check `if (pEmpty == nullptr) abort()` before every single dereference operator. C++ refuses to add this hidden cost. It assumes you, the programmer, will check for `nullptr` yourself before dereferencing. If you fail, the result is Undefined Behavior.

### Run it
```
Segmentation fault (core dumped)
```
*(On Windows, the program will silently exit with a non-zero error code or pop up a crash dialog).*

### Discard the throwaway example
The code inside `main()` is deleted.

---

## Connect the Pieces

1. `int a = 10;` creates data.
2. `int* p = &a;` uses the address-of operator `&` to find the data's location and stores it in the pointer `p`.
3. `*p = 20;` uses the dereference operator `*` to travel to the location and mutate the original data to `20`.
4. `p = nullptr;` severs the connection, making `p` point nowhere safely.
5. `*p = 30;` attempts to travel to nowhere, triggering Undefined Behavior and crashing the application.

## What breaks without this
Without pointers, you could never build complex data structures like linked lists or trees, where objects must maintain references to other objects. You would be forced to copy entire objects every time you passed them to a function, quickly exhausting memory and destroying performance.

## Exercises
1. Create a `double` variable with the value `3.14`.
2. Create a pointer to that `double`.
3. Print the memory address using the pointer.
4. Dereference the pointer to change the value to `2.71`.
5. Print the original `double` variable to confirm it changed.

## Definition of done
- [ ] You have written code that uses `&` to get a memory address.
- [ ] You have declared a pointer variable with `*`.
- [ ] You have used the dereference operator `*` to modify a variable indirectly.
- [ ] You have deliberately crashed a program by dereferencing a `nullptr`.
- [ ] You can explain the difference between the `&` operator and the `*` operator out loud.
