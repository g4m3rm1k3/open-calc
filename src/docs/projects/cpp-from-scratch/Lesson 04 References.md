# Lesson 04: References

**What you will build:** A series of isolated console programs that alias variables, pass them to functions without copying memory, and demonstrate the structural differences between references and pointers at the compiler level. This lesson contains only throwaway code to isolate and prove these concepts.

**What you need to know first:** Basic functions and types (Lesson 01), and the distinction between a variable and a memory address (Lesson 02).

**Terms introduced in this lesson:**
- **Reference** — an alias for an existing variable. *Why it exists:* to allow a program to give multiple names to the exact same piece of memory, enabling direct access without copying data.
- **Pass by Value** — a mechanism where a function receives a separate copy of the data. *Why it exists:* to guarantee that a function cannot accidentally alter the caller's original variable, isolating state safely.
- **Pass by Reference** — a mechanism where a function receives direct access to the original data rather than a copy. *Why it exists:* to avoid the performance cost of copying large amounts of data, and to allow a function to intentionally modify the caller's data.

**Objects and methods used:**
- **`std::string`**
  - *What it is:* A standard library type that stores and manages sequences of text.
  - *Implementation:* `class basic_string` managing an array of `char` values, capable of growing dynamically.
  - *Its use:* To demonstrate a piece of data large enough that copying it becomes visibly inefficient.

**Everything else in the file, not this lesson's subject but still explained.**
- **`std::cout`**
  - *What it is:* The standard output stream.
  - *Implementation:* A global instance of `std::ostream` mapped to the terminal.
  - *Its use:* To make the internal state of memory visible so you can verify what your program is doing.

---

## Concept Unit: The Copying Problem (Pass by Value)

### The Problem
When you hand data to a function, the language must decide how that data is delivered. By default, the language creates a brand-new variable and copies the data into it. This is safe, but it means the function cannot alter the original data, and if the data is large (like a massive body of text), copying it repeatedly wastes memory and time.

### The New Code
```cpp
#include <iostream>
#include <string>

void attemptChange(std::string text) {
    text = "Changed!";
}

int main() {
    std::string originalMessage = "Original";
    attemptChange(originalMessage);
    std::cout << originalMessage << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>` includes the standard library for terminal output.
- `#include <string>` includes the standard library for text sequences, so we can work with a piece of data more substantial than a simple integer.
- `void attemptChange(std::string text)` declares a function that takes a `std::string` argument. By default, `text` is a brand-new, independent memory location allocated specifically for this function call.
- `text = "Changed!";` overwrites the contents of that new, independent memory location.
- `std::string originalMessage = "Original";` allocates memory in `main` and stores the starting text.
- `attemptChange(originalMessage);` calls the function. The computer reads the characters from `originalMessage`, physically copies them to the new memory location belonging to `text`, and then executes the function body.
- `std::cout << originalMessage << "\n";` prints the value from `main`'s memory. It prints "Original" because `attemptChange` only modified its own isolated copy.

### CS Lens
This embodies the concept of "Pass by Value." The caller and the callee have strict memory isolation. The callee receives an identical, independent clone of the data, not the data itself.

### SE Lens
The design principle here is isolation by default. The alternative not chosen is having functions share the exact same memory location automatically. The tradeoff is performance versus safety: copying an integer takes almost no time, but copying a list of a million items every time a function is called would bring a program to a halt. Pass by value prioritizes safety against unintended modifications at the cost of execution speed for large structures.

### Run It Yourself
1. Open a terminal and run `touch pass_by_value.cpp`.
2. Open `pass_by_value.cpp` and replace its contents with the code above.
3. Compile it with `g++ -std=c++17 pass_by_value.cpp -o pass_by_value`.
4. Run `./pass_by_value`.
5. Expected output:
   ```
   Original
   ```

---

## Concept Unit: What a Reference Is

### The Problem
If we want to avoid copying memory, or if we specifically want two parts of a program to talk about the exact same location in memory, we need a way to give an existing memory location a second name without duplicating its contents.

### The New Code
```cpp
#include <iostream>

int main() {
    int originalScore = 100;
    int& aliasedScore = originalScore;
    
    aliasedScore = 50;
    
    std::cout << originalScore << "\n";
    std::cout << aliasedScore << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int originalScore = 100;` allocates standard memory for an integer and stores 100.
- `int& aliasedScore = originalScore;` declares a **reference**. The ampersand operator (`&`), when attached directly to a type (`int&`), tells the compiler this is not a new variable. It is an alias—a second name—for the exact same physical memory location as `originalScore`.
- `aliasedScore = 50;` writes the value 50 into the memory. Because `aliasedScore` is just another name for `originalScore`, this writes 50 directly over the original 100.
- `std::cout << originalScore << "\n";` prints 50.
- `std::cout << aliasedScore << "\n";` prints 50. There is only one integer in memory, just accessed through two different names.

### CS Lens
This embodies Memory Aliasing. It allows multiple identifiers in a program to route to the exact same physical hardware address, avoiding the overhead of creating parallel data structures.

### SE Lens
The alternative not chosen is forcing the programmer to use raw memory addresses (pointers) whenever they want to share data. The tradeoff here is syntactic safety versus flexibility: a reference must be bound to a real variable the exact moment it is created and can never be reassigned to point at something else later. This removes an entire class of bugs where a reference might accidentally point to nothing (null), at the cost of being permanently locked to its initial target.

### Run It Yourself
1. Open a terminal and run `touch reference_alias.cpp`.
2. Open `reference_alias.cpp` and replace its contents with the code above.
3. Compile it with `g++ -std=c++17 reference_alias.cpp -o reference_alias`.
4. Run `./reference_alias`.
5. Expected output:
   ```
   50
   50
   ```

---

## Concept Unit: Passing by Reference

### The Problem
We established that passing large data by value creates slow, expensive copies, and prevents a function from updating the caller's data. By combining function arguments with references, we can solve both issues at once.

### The New Code
```cpp
#include <iostream>
#include <string>

void actualChange(std::string& text) {
    text = "Changed!";
}

int main() {
    std::string message = "Original";
    actualChange(message);
    std::cout << message << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `void actualChange(std::string& text)` declares a function that takes a reference (`&`). The compiler does not allocate new memory for a copy of the string. Instead, `text` becomes a direct alias to whatever existing variable is handed to it.
- `text = "Changed!";` writes new data directly into that shared memory location.
- `std::string message = "Original";` allocates the memory in `main`.
- `actualChange(message);` calls the function. No copying occurs. The name `text` inside the function temporarily routes to the exact same memory as `message`.
- `std::cout << message << "\n";` prints "Changed!" because the function altered the original memory directly, unhindered by pass-by-value isolation.

### CS Lens
This embodies "Pass by Reference." The callee is given direct, unmediated access to the caller's memory. This is foundational in systems programming for achieving zero-copy data processing.

### SE Lens
The tradeoff is lost local certainty. When you pass by value, you know with absolute certainty that your variable will not change after the function returns. When you pass by reference, you surrender that guarantee. To regain it when you just want to avoid the performance cost of copying without allowing modification, C++ heavily relies on `const` references (`const std::string&`), enforcing read-only access at the compiler level while still preventing the copy.

### Run It Yourself
1. Open a terminal and run `touch pass_by_reference.cpp`.
2. Open `pass_by_reference.cpp` and replace its contents with the code above.
3. Compile it with `g++ -std=c++17 pass_by_reference.cpp -o pass_by_reference`.
4. Run `./pass_by_reference`.
5. Expected output:
   ```
   Changed!
   ```

---

## Concept Unit: References vs. Pointers

### The Problem
C++ also has pointers (introduced previously), which store memory addresses and can be used to share data. If both pointers and references let us avoid copying and modify original data, why have both? We need to understand how a reference structurally differs from a pointer at the language level.

### The New Code
```cpp
#include <iostream>

int main() {
    int targetA = 10;
    int targetB = 20;

    // Pointer approach
    int* ptr = &targetA;
    ptr = &targetB; 
    *ptr = 99;      

    // Reference approach
    int& ref = targetA;
    ref = targetB;  

    std::cout << "targetA: " << targetA << "\n";
    std::cout << "targetB: " << targetB << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int* ptr = &targetA;` creates a pointer. The `&` here means "get the address of", not reference. The pointer itself is a distinct variable sitting in memory that stores `targetA`'s numeric address.
- `ptr = &targetB;` changes the address stored inside the pointer. It now points to `targetB`. This is valid because a pointer is its own independent variable.
- `*ptr = 99;` uses the dereference operator (`*`) to follow the address and write `99` into `targetB`.
- `int& ref = targetA;` creates a reference. Unlike a pointer, a reference is not structurally a separate variable you can manipulate. It is irrevocably welded to `targetA`.
- `ref = targetB;` looks like it might make the reference point to `targetB`. It does not. Because `ref` is permanently welded to `targetA`, this line reads the value of `targetB` (20) and writes it directly into `targetA`.
- `std::cout << "targetA: " << targetA << "\n";` prints 20, because the reference assignment altered its value.
- `std::cout << "targetB: " << targetB << "\n";` prints 99, because the pointer was successfully re-seated and then dereferenced.

### CS Lens
Pointers are indirect addressing made explicit as a first-class variable: they have their own memory, can point to nothing (`nullptr`), and can change targets. References are a syntactic abstraction provided by the compiler to create a permanent alias: they have no visible memory address of their own, cannot be null, and cannot be re-seated.

### SE Lens
The engineering tradeoff is safety versus capability. Pointers are necessary for data structures like linked lists where relationships must change over time. References are safer and cleaner for function arguments because you never have to check if a reference is `nullptr`—the compiler guarantees it points to valid memory upon creation.

### Run It Yourself
1. Open a terminal and run `touch references_vs_pointers.cpp`.
2. Open `references_vs_pointers.cpp` and replace its contents with the code above.
3. Compile it with `g++ -std=c++17 references_vs_pointers.cpp -o references_vs_pointers`.
4. Run `./references_vs_pointers`.
5. Expected output:
   ```
   targetA: 20
   targetB: 99
   ```

---

## Connect the Pieces

Observe how references and pointers dictate memory interaction:
We define data. By default, passing that data to a function makes a full copy, eating memory and isolating the function from the caller's state. To share the original data, we use a reference. Unlike a pointer, which is a separate variable holding an address that can be reassigned or nulled, a reference acts as a permanent, compiler-enforced alias to the original data. Passing by reference gives the function direct access to the memory without the structural overhead of pointer arithmetic or dereferencing.

## What Breaks Without This

Without references, avoiding large copies requires pointers. This introduces nullability risks everywhere. Let's see how a reference removes this risk.

Open a terminal and run `touch invalid_reference.cpp`. Add this code:

```cpp
int main() {
    int& badRef;
    return 0;
}
```

Compile it with `g++ -std=c++17 invalid_reference.cpp -o invalid_reference`. The compilation fails before the program ever runs.
**The error:**
`error: declaration of reference variable 'badRef' requires an initializer`

The compiler caught the flaw. Unlike a pointer, which could be left uninitialized and crash your program at runtime, a reference *must* be bound to a valid variable the instant it is created.

## Exercises

1. Create a function that takes two `int` parameters by value, and swaps their values. Call it from `main` and print the results to prove that pass-by-value failed to swap the caller's variables.
2. Change the function signature to take two `int&` parameters instead. Recompile and run to observe the successful swap.
3. Declare an `int` variable and a pointer to it. Then, try to declare a reference to that pointer. Manipulate the value through the reference.

## Definition of Done
- [ ] You have written and executed code that proves pass-by-value copies data.
- [ ] You have written and executed code that proves references alias memory and avoid copying.
- [ ] You have intentionally triggered a compiler error by leaving a reference uninitialized.
- [ ] You have verified the behavioral difference between pointer reassignment and reference reassignment.
- [ ] You can explain the structural difference between a pointer and a reference out loud, in your own words.
