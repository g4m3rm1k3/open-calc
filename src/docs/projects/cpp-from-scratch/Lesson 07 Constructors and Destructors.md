# Lesson 07: Constructors and Destructors

**What you will build:** You will build isolated programs that define how custom objects are initialized when they are created, and how they clean up after themselves when they are destroyed. The transferable problem this solves is resource lifecycle management: guaranteeing that an object starts in a valid state and correctly releases anything it holds when it is no longer needed.

**What you need to know first:** Lesson 06 (Classes and Objects).

**Terms introduced in this lesson:**
- **Default Constructor** — a constructor that can be called with no arguments. *Why it exists:* to provide a fallback initialization state when the caller does not specify exactly how the object should be built.
- **Constructor Overloading** — defining more than one constructor for a single class, each taking different arguments. *Why it exists:* to give the caller flexibility in how much information they have available when creating the object.
- **Scope** — the region of code where a variable name is valid and the object it points to is kept alive. *Why it exists:* to define strict, predictable boundaries for when an object's lifetime ends, preventing memory from being held indefinitely.
- **Stack** — the automatic memory region where local variables and objects live. *Why it exists:* to provide fast, compiler-managed memory that automatically reclaims space when a scope ends.
- **Destructor** — a special block of code that runs exactly once, automatically, right before an object is destroyed. *Why it exists:* to give the object a chance to perform cleanup (like closing files or releasing memory) before it ceases to exist.

**Objects and methods used:**
- **std::cout**
  - *What it is:* The standard character output stream.
  - *Implementation:* An object of type `std::ostream` from the `<iostream>` header.
  - *Its use:* We use it to print visible messages during initialization and destruction to prove exactly when these events happen.

---

## Concept Unit: The Default Constructor

### The Problem
When you create an object, you want its memory to start in a predictable state. If a class has a constructor that requires arguments, you must provide those arguments every time. Sometimes, you want to allow creating an object without providing any initial data, falling back to safe default values. You need a way to define what happens when an object is created completely empty.

### The New Code
```cpp
#include <iostream>

class Sensor {
public:
    int id;

    Sensor() {
        id = 0;
        std::cout << "Default constructor ran.\n";
    }
};

int main() {
    Sensor s1;
    std::cout << "Sensor ID: " << s1.id << "\n";
    return 0;
}
```

### Mechanical Walkthrough
- `#include <iostream>`: Instructs the compiler to pull in the declarations for the standard input/output library, enabling printing.
- `class Sensor { ... };`: Defines the blueprint for our custom type. The trailing semicolon is structurally required by C++ to close a class definition.
- `public:`: An access modifier ensuring that the fields and constructors that follow can be used by any code outside the class.
- `int id;`: A field inside the class. Each `Sensor` object gets its own `id` integer in memory.
- `Sensor()`: The **default constructor**. It is a method with the exact same name as the class, and crucially, it takes no parameters inside the `()`. It has no return type, not even `void`.
- `id = 0;`: The initialization logic inside the constructor. It gives the object's `id` field a definite, safe starting value, preventing it from holding random memory garbage.
- `std::cout << "Default constructor ran.\n";`: Prints a message. The `<<` operator streams the string literal into the standard output object. `\n` is the newline character.
- `int main() { ... }`: The mandatory entry point for any C++ program.
- `Sensor s1;`: This creates an object of type `Sensor` on the stack, named `s1`. Because there are no parentheses or arguments after `s1`, the compiler explicitly looks for a default constructor and executes it immediately.
- `std::cout << "Sensor ID: " << s1.id << "\n";`: Reads the `id` field out of `s1` using the `.` operator and prints it.
- `return 0;`: Signals to the operating system that the program completed successfully.

### CS Lens
The default constructor represents the "zero state" of a finite state machine. When memory is first allocated for an object, whatever binary garbage happened to be in RAM is now part of the object. The constructor's job is to overwrite that meaningless data with structured, valid data.

### SE Lens
The engineering principle is Fail-Safe Defaults. The alternative not chosen is forcing the caller to supply an ID every single time (`Sensor s1(0);`). The tradeoff is that the default constructor hides the explicit choice of the value `0` inside the class, reducing boilerplate for the caller, but meaning the caller might not realize what ID they actually got.

### Run It Yourself
1. Open a terminal and run `touch main.cpp`.
2. Open `main.cpp` and replace all contents with the code above.
3. Run `g++ -std=c++17 main.cpp -o main` to compile it.
4. Run `./main` (or `.\main.exe` on Windows).
5. The exact expected output is:
Default constructor ran.
Sensor ID: 0
6. This code exists only to teach and is explicitly discarded.

---

## Concept Unit: Constructor Overloading

### The Problem
Sometimes you want to create a `Sensor` using the safe default state, but other times you already know exactly what `id` the sensor should have right when you create it. You need a way to support multiple initialization paths for the same class, allowing the caller to provide arguments if they have them, or omit them if they don't.

### The New Code
```cpp
#include <iostream>

class Sensor {
public:
    int id;

    Sensor() {
        id = 0;
        std::cout << "Default constructor: ID = " << id << "\n";
    }

    Sensor(int customId) {
        id = customId;
        std::cout << "Parameterized constructor: ID = " << id << "\n";
    }
};

int main() {
    Sensor s1;
    Sensor s2(42);
    return 0;
}
```

### Mechanical Walkthrough
- `Sensor(int customId)`: A second constructor in the same class, taking exactly one `int` argument. Because its parameter list differs from the default constructor, the compiler considers it a distinct, valid overload. This is called **constructor overloading**.
- `id = customId;`: Assigns the caller-provided value to the object's internal field.
- `Sensor s1;`: Creates the first object on the stack with no arguments, triggering the `Sensor()` default constructor.
- `Sensor s2(42);`: Creates a second, entirely separate object on the stack. The caller provides the integer `42`, so the compiler routes execution directly to the `Sensor(int)` constructor.

### CS Lens
Constructor overloading is a specific instance of static polymorphism. The compiler decides exactly which block of code to run at compile time based entirely on the type and number of arguments, avoiding any runtime performance penalty for the decision.
Also recognized in: strongly-typed mathematical functions (like `abs(int)` vs `abs(float)`), generic programming interfaces, and builder patterns.

### SE Lens
The engineering principle is API Flexibility. The alternative not chosen is naming the initialization methods differently, like `initDefault()` and `initCustom(int)`. The tradeoff is that overloading reuses the single concept of "creation" (the class name), reducing cognitive load for the reader. However, if there are too many overloads with similar parameter types, it becomes ambiguous which one is actually running.

### Run It Yourself
1. Open `main.cpp` and replace all contents with the code above.
2. Run `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
4. The exact expected output is:
Default constructor: ID = 0
Parameterized constructor: ID = 42
5. This code exists only to teach and is explicitly discarded.

---

## Concept Unit: Scope and the Stack

### The Problem
If every object created simply existed forever, the computer would eventually run out of memory. You need a set of rules that dictate exactly when an object is no longer needed, so the computer can automatically reclaim its memory without the programmer having to manually delete it.

### The New Code
```cpp
#include <iostream>

class Sensor {
public:
    Sensor() {
        std::cout << "Sensor created.\n";
    }
};

int main() {
    std::cout << "Before scope.\n";
    {
        Sensor s1;
        std::cout << "Inside scope.\n";
    }
    std::cout << "After scope.\n";
    return 0;
}
```

### Mechanical Walkthrough
- `int main() { ... }`: The outermost scope for the function.
- `std::cout << "Before scope.\n";`: Prints before anything else happens.
- `{`: This bare opening curly brace begins a new block scope. It creates a temporary boundary within the code.
- `Sensor s1;`: The object is created, memory is allocated on the stack, and the constructor runs, printing its message.
- `std::cout << "Inside scope.\n";`: Prints while the object is alive and the name `s1` is valid.
- `}`: The closing brace ends the block scope. At this exact line, any variables declared inside the block, including `s1`, immediately go out of scope. The compiler automatically reclaims `s1`'s memory from the stack.
- `std::cout << "After scope.\n";`: Prints after the block has closed. If we tried to type `s1.id` here, the compiler would halt with an error, because `s1` no longer exists.

### CS Lens
The stack is a Last-In, First-Out (LIFO) data structure managed directly by the CPU and the compiler. When a scope opens, the stack pointer moves to allocate space. When the scope closes, the stack pointer simply moves back, instantly invalidating all memory that was just used. This makes stack allocation incredibly fast, with zero overhead for a garbage collector.

### SE Lens
The engineering principle is Deterministic Lifetime. The alternative not chosen is a garbage-collected heap, where objects live indefinitely until a background process decides to clean them up. The tradeoff is that the stack gives you absolute, predictable control over when memory is reclaimed, but it restricts the object's lifetime strictly to the block it was declared in. If you need the object to survive returning from the function, the stack cannot be used.

### Run It Yourself
1. Open `main.cpp` and replace all contents with the code above.
2. Run `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
4. The exact expected output is:
Before scope.
Sensor created.
Inside scope.
After scope.
5. This code exists only to teach and is explicitly discarded.

---

## Concept Unit: The Destructor

### The Problem
When a scope ends, the memory for the object is instantly reclaimed. But if your object was holding onto something else—like an open file, a network connection, or manually requested heap memory—simply erasing the object leaves that external resource locked forever. You need a way for the object to execute a final cleanup action right before its memory is destroyed.

### The New Code
```cpp
#include <iostream>

class Sensor {
public:
    Sensor() {
        std::cout << "Sensor created.\n";
    }

    ~Sensor() {
        std::cout << "Sensor destroyed. Cleaning up!\n";
    }
};

int main() {
    std::cout << "Before scope.\n";
    {
        Sensor s1;
        std::cout << "Inside scope.\n";
    }
    std::cout << "After scope.\n";
    return 0;
}
```

### Mechanical Walkthrough
- `~Sensor()`: The **destructor**. It is declared with a tilde `~` followed exactly by the class name. It takes no arguments and has no return type. A class can only ever have exactly one destructor.
- `std::cout << "Sensor destroyed... \n";`: The cleanup logic. In a real program, this is where you would write code to close files or free memory.
- `}`: When the closing brace of the scope is hit, the compiler automatically injects a call to the destructor for `s1`.
- `Sensor destroyed. Cleaning up!`: This prints *before* "After scope.", proving the destructor execution is blocking and immediate. The program halts its normal flow to let the object clean up before its memory is erased.

### CS Lens
The destructor is the cleanup phase of the state machine. It handles the transition from a valid, structured state back into raw, meaningless memory.
Also recognized in: `finally` blocks in exception handling, context managers in Python (`__exit__`), and the `Dispose` pattern in C#.

### SE Lens
The engineering principle is Resource Acquisition Is Initialization (RAII). The alternative not chosen is requiring the caller to manually invoke a cleanup method, like `s1.close()`, before the scope ends. The tradeoff is that RAII binds the resource lifecycle directly to the object's scope. If the caller forgets to call `close()`, or if the program crashes out of the scope early due to an error, the destructor is still guaranteed to run, preventing resource leaks. The cost is that cleanup logic is hidden implicitly at the `}` bracket.

### Run It Yourself
1. Open `main.cpp` and replace all contents with the code above.
2. Run `g++ -std=c++17 main.cpp -o main`.
3. Run `./main`.
4. The exact expected output is:
Before scope.
Sensor created.
Inside scope.
Sensor destroyed. Cleaning up!
After scope.
5. This code exists only to teach and is explicitly discarded.

---

## Connect the Pieces
Consider the flow of the `Sensor` object. When execution reaches its declaration on the stack, memory is allocated, and the compiler selects the appropriate constructor (default or overloaded) to initialize its state. The object exists and is usable as long as execution remains within its block scope. The moment execution touches the closing brace `}` of that scope, the compiler automatically invokes the `~Sensor()` destructor, allowing the object to perform its final actions before its memory is instantly reclaimed by the stack.

## What Breaks Without This
If we try to pass arguments to an object that only has a default constructor, the compiler will stop us.

Modify the first example in this lesson by changing `Sensor s1;` to `Sensor s1(99);`:
```cpp
#include <iostream>

class Sensor {
public:
    int id;
    Sensor() { id = 0; }
};

int main() {
    Sensor s1(99);
    return 0;
}
```

When you attempt to compile this, you will receive an error:
`error: no matching function for call to 'Sensor::Sensor(int)'`

To fix this, either remove the `(99)` to use the default constructor, or add an overloaded constructor `Sensor(int)` that tells the compiler how to handle the argument. You must respect the exact initialization paths the class provides.

## Exercises
1. Create a `FileHandler` class with a default constructor that prints "File opened" and a destructor that prints "File closed". Create an instance of it inside a block scope and observe the output.
2. Add an overloaded constructor to `FileHandler` that takes a `std::string filename` (you will need `#include <string>`) and prints "File [filename] opened". Create a second instance inside the same scope using this constructor. Notice the order in which the two destructors run when the scope ends (hint: the stack is Last-In, First-Out).
3. Try explicitly calling the destructor yourself (e.g., `s1.~Sensor();`) inside the scope. Observe what happens to the output when the scope ends (the destructor will run twice, which is dangerous in real code and often causes crashes).

## Definition of Done
- You can write a default constructor to initialize an object.
- You can write an overloaded constructor to accept arguments during creation.
- You understand that an object on the stack ceases to exist at the end of its scope `}`.
- You can write a destructor using `~` to execute cleanup code automatically.
- You can explain constructors, destructors, and stack scope out loud, in your own words, to someone who hasn't read this lesson.
