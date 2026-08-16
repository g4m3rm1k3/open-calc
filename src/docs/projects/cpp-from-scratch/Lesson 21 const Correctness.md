# Lesson 21: const Correctness

**What you will build**
You will write C++ code that explicitly declares which data is allowed to change and which is read-only. You will prove that the compiler enforces these rules, and you will see how failing to mark read-only data correctly breaks the code for anyone trying to use it.

**What you need to know first**
Lesson 03 Pointers, Lesson 04 References, Lesson 06 Classes and Objects.

**Terms introduced in this lesson**
- **const correctness** — the practice of using the `const` keyword everywhere a variable, pointer, reference, or method does not modify state. *Why it exists:* To enlist the compiler in proving that data isn't accidentally modified, and to allow read-only data to flow through a program safely.
- **const member function** — a method that is forbidden from modifying the object it belongs to. *Why it exists:* So that you can still call methods on an object even when you only have read-only access to it.
- **mutable** — a keyword applied to a class field that allows it to be modified even inside a `const` member function. *Why it exists:* To permit internal housekeeping (like caching or read-counting) that doesn't affect the logical, outward-facing state of the object.

**Objects and methods used**
- **std::string**
  - *What it is:* A standard library class representing a sequence of characters.
  - *Implementation:* `class basic_string { ... }` (Lesson N covers this).
  - *Its use:* Providing a realistic, non-trivial object to pass by reference.
- **std::cout / operator<<**
  - *What it is:* The standard output stream and its insertion operator.
  - *Implementation:* `extern ostream cout;`
  - *Its use:* Printing values to verify our code.

---

## Concept Unit: `const` Variables

### The Problem
When a value is meant to be read-only (like a maximum capacity or a fixed hardware address), leaving it as a normal variable allows other code to accidentally change it. The compiler won't stop the modification, leading to unpredictable behavior when the rest of the program assumes the value remained fixed.

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone example.
- **Files affected:** `main.cpp` (created).
- **Change type:** add.
- **Location:** A new file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>

int main() {
    const int max_players = 4;
    // max_players = 5; // The compiler will reject this
    std::cout << "Max players: " << max_players << "\n";
    return 0;
}
```

### The Updated Project
The `main.cpp` file now holds a complete, runnable program that declares a read-only variable and prints it.
```cpp
// ← new
#include <iostream>

int main() {
    const int max_players = 4;
    std::cout << "Max players: " << max_players << "\n";
    return 0;
}
// ← new
```

### Introduce the concept in isolation
This is exactly what `const` in the code above is doing, isolated. If we uncomment the assignment:
```cpp
const int max_players = 4;
max_players = 5;
```
Running this produces a compiler error: `assignment of read-only variable 'max_players'`. This proves that `const` isn't just a suggestion; it creates a **constant variable**, and the compiler physically prevents any assignment to it after initialization.

### Discard the throwaway example
This code is explicitly discarded and will not appear again.

### Mechanical walkthrough
- `#include <iostream>` — includes the standard input/output stream library so we can print to the terminal.
- `int main() { ... }` — the entry point of a C++ program.
- `const` — the keyword that marks the data as immutable after initialization. Without it, the variable could be modified at any time.
- `int` — the data type specifying we are storing an integer.
- `max_players = 4;` — initialization of the variable. Because it is `const`, this is the only time it can be assigned a value.
- `std::cout << ... << "\n";` — basic, already-established syntax for printing to the console.

### CS Lens
This is immutability. By guaranteeing that a value cannot change, we reduce the state space of a program, making it easier to reason about. Also recognized in: functional programming languages where all variables are immutable by default, hardware ROM (Read-Only Memory), and database primary keys.

### SE Lens
The alternative not chosen is using a preprocessor macro `#define MAX_PLAYERS 4`. The tradeoff of `const` is that it creates a typed, scoped variable that the debugger can inspect, whereas macros are blind text-replacements that lack type safety and scope, polluting the global namespace.

### Commands needed to make this unit real
- `g++ -std=c++17 main.cpp -o main` — compiles the C++ source code into an executable named `main`.
- `./main` (or `.\main.exe` on Windows) — runs the compiled executable.

### Run it
```text
Max players: 4
```

### Connection
We've protected a simple integer, but programs pass much larger objects around. Next, we apply this protection to pointers and references.

---

## Concept Unit: `const` Pointers and References

### The Problem
When passing a large object to a function, copying it by value is slow. We pass by reference or pointer to avoid the copy (Lesson 04). However, doing so gives the function full power to modify the original object. We need a way to grant the performance of passing by reference without granting the permission to modify.

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone example.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <string>

void PrintPlayer(const std::string& name, const int* score_ptr) {
    std::cout << "Player: " << name << ", Score: " << *score_ptr << "\n";
}

int main() {
    std::string player_name = "Alice";
    int score = 150;
    
    PrintPlayer(player_name, &score);
    return 0;
}
```

### The Updated Project
The `main.cpp` file now passes data to a function using a `const` reference and a pointer to `const`.
```cpp
#include <iostream>
#include <string>

// + replacing previous main
void PrintPlayer(const std::string& name, const int* score_ptr) {
    std::cout << "Player: " << name << ", Score: " << *score_ptr << "\n";
}

int main() {
    std::string player_name = "Alice";
    int score = 150;
    
    PrintPlayer(player_name, &score);
    return 0;
}
```

### Introduce the concept in isolation
This is exactly what `const std::string&` and `const int*` are doing. If the function attempts to modify the data:
```cpp
void Cheat(const int* score_ptr) {
    *score_ptr = 9999;
}
```
The compiler throws an error: `assignment of read-only location '*score_ptr'`. This is called a **pointer to const** or **reference to const**. It proves that the function is locked into a read-only view of the data, even though the original variables in `main` are not `const`.

### Discard the throwaway example
This code is explicitly discarded and will not appear again.

### Mechanical walkthrough
- `const std::string& name` — a reference to a string, marked `const`. The function accesses the original string without copying it, but the `const` qualifier explicitly forbids the function from altering it.
- `const int* score_ptr` — a pointer to an integer, marked `const`. The pointer itself holds an address, but it promises not to modify the integer residing at that address. Without the `const`, the function could rewrite the caller's score.
- `*score_ptr` — basic, already-established syntax for dereferencing a pointer to read its value.
- `PrintPlayer(player_name, &score);` — passing a regular, non-`const` variable into a function that takes it as `const`. The compiler happily allows this, safely downgrading full-access to read-only access for the duration of the function call.

### CS Lens
This is the Principle of Least Privilege. A function should only be given the permissions it strictly requires to do its job. A printing function only needs to read; giving it write access creates unnecessary risk. Also recognized in: file system permissions (read vs. write), database user roles, and CPU ring levels.

### SE Lens
The alternative not chosen is passing by value (`void PrintPlayer(std::string name)`). The tradeoff of `const` references is that we must type slightly more complex syntax, but we gain identical safety to pass-by-value while completely avoiding the CPU and memory cost of duplicating the data.

### Commands needed to make this unit real
(No new commands.)

### Run it
```text
Player: Alice, Score: 150
```

### Connection
We can restrict a function from modifying a passed object. But what happens if that object is a class, and the function tries to call the object's methods? 

---

## Concept Unit: `const` Member Functions

### The Problem
If you have a read-only view of an object (like a `const` reference), the compiler forbids you from calling any methods on it. The compiler cannot look inside every method to check if it modifies the object's fields. Unless explicitly told otherwise, the compiler assumes every method modifies the object, and blocks the call.

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone example.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <string>

class Player {
public:
    std::string name;
    
    std::string GetName() const {
        return name;
    }
};

void PrintName(const Player& p) {
    std::cout << p.GetName() << "\n";
}

int main() {
    Player p;
    p.name = "Bob";
    PrintName(p);
    return 0;
}
```

### The Updated Project
We define a class with a `const` method and call it through a `const` reference.
```cpp
// + replacing previous main
#include <iostream>
#include <string>

class Player {
public:
    std::string name;
    
    std::string GetName() const {
        return name;
    }
};

void PrintName(const Player& p) {
    std::cout << p.GetName() << "\n";
}

int main() {
    Player p;
    p.name = "Bob";
    PrintName(p);
    return 0;
}
```

### Introduce the concept in isolation
This is exactly what the `const` at the end of `GetName()` is doing. If we remove it:
```cpp
std::string GetName() { return name; }
```
And try to call it from `PrintName`:
```cpp
void PrintName(const Player& p) {
    std::cout << p.GetName(); // Compiler error
}
```
The compiler throws an error: `passing 'const Player' as 'this' argument discards qualifiers`. This proves that without the `const` keyword on the method, the compiler refuses to trust it with a `const` object. Adding `const` creates a **const member function**, explicitly promising the compiler that calling this method won't change the object's fields.

### Discard the throwaway example
This code is explicitly discarded and will not appear again.

### Mechanical walkthrough
- `class Player { ... };` — basic, already-established syntax for defining a class blueprint.
- `std::string GetName()` — declares a method returning a string.
- `const` (after the parameter list) — modifies the implicit `this` pointer of the method, changing it from `Player* const this` to `const Player* const this`. This legally binds the method to a contract: it cannot modify any non-static members of the class. Without it, the compiler assumes the method mutates state.
- `return name;` — reads the field. If we wrote `name = "hacked";` here, the compiler would block it because the method is `const`.
- `void PrintName(const Player& p)` — receives the object as a read-only reference.
- `p.GetName()` — succeeds because `GetName()` is certified as `const`, matching the read-only restriction on `p`.

### CS Lens
This is contract-based design. The method signature acts as a binding contract between the caller and the implementer. The compiler is the enforcer, ensuring neither side violates the terms. Also recognized in: interface segregation, static type systems, and API schemas like OpenAPI.

### SE Lens
The alternative not chosen is having the compiler perform deep flow analysis on every method body to automatically deduce if it changes state. The tradeoff of explicit `const` methods is that the programmer must manually label them, but this prevents a minor internal implementation change (like adding a debug counter) from silently changing the method's implicit signature and breaking distant callers.

### Commands needed to make this unit real
(No new commands.)

### Run it
```text
Bob
```

### Connection
When one function takes a `const` reference, it forces all methods it calls to be `const`. What happens when an API gets this wrong?

---

## Concept Unit: Const-Incorrect APIs Break Callers

### The Problem
If you write a function or a method that only reads data, but you forget to mark its parameters or signature as `const`, you create a const-incorrect API. A caller who has `const` data is physically forbidden from passing their data to your function, even if your function doesn't actually modify anything. 

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone example.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>

// Poorly written API: promises nothing, but only reads.
void DisplayScore(int& current_score) {
    std::cout << "Score: " << current_score << "\n";
}

void ProcessPlayer(const int& read_only_score) {
    // We only have read-only access. We try to call an API.
    // DisplayScore(read_only_score); // ERROR!
}

int main() {
    int score = 500;
    ProcessPlayer(score);
    return 0;
}
```

### The Updated Project
The `main.cpp` demonstrates how a missing `const` infects the call chain.
```cpp
// + replacing previous main
#include <iostream>

void DisplayScore(int& current_score) {
    std::cout << "Score: " << current_score << "\n";
}

void ProcessPlayer(const int& read_only_score) {
    // The call below is intentionally commented out to allow compilation.
    // DisplayScore(read_only_score); 
}

int main() {
    int score = 500;
    ProcessPlayer(score);
    return 0;
}
```

### Introduce the concept in isolation
This proves the viral nature of `const`. If we uncomment the call:
```cpp
DisplayScore(read_only_score);
```
The compiler throws: `binding reference of type 'int&' to 'const int' discards qualifiers`. The compiler is protecting the `const` data. `DisplayScore` demands a non-const reference (which means "I want permission to modify this"). The compiler refuses to upgrade a read-only reference into a writable reference. Thus, a const-incorrect API breaks its callers.

### Discard the throwaway example
This code is explicitly discarded and will not appear again.

### Mechanical walkthrough
- `void DisplayScore(int& current_score)` — the parameter lacks `const`. To the compiler, this signature explicitly requests write access, regardless of what the body actually does.
- `void ProcessPlayer(const int& read_only_score)` — the parameter is `const`. This function only has read access.
- `DisplayScore(read_only_score);` — the attempted handoff. The compiler checks permissions: the caller has read-only access, but the callee demands read-write. Request denied, compilation fails. 

### CS Lens
This is type system propagation. In type theory, `T` and `const T` are different types. A `T` can be implicitly coerced into a `const T` (shedding privileges is safe), but a `const T` cannot be coerced into a `T` (escalating privileges is unsafe). Also recognized in: taint tracking algorithms and information flow security.

### SE Lens
The alternative not chosen is casting away constness using `const_cast`. The tradeoff of strict const-correctness is that applying it retroactively to a large codebase is notoriously difficult, because a single `const` missing at the bottom of a call chain requires changing every signature above it. This is why `const` must be applied from day one.

### Commands needed to make this unit real
(No new commands.)

### Run it
*(Compiles successfully because the broken call is commented out. No output.)*

### Connection
So far, `const` means absolutely no changes to any fields. But sometimes, a logical read operation requires an internal, physical write.

---

## Concept Unit: `mutable` for Invisible State

### The Problem
Sometimes a method is logically `const` — to the outside world, it just reads data — but physically it needs to modify a hidden internal field, like updating a read-counter, locking a mutex, or caching a calculation. A `const` method is strictly forbidden from modifying any field, making this impossible.

### Project Change
- **Reference Source:** No reference counterpart — this is a standalone example.
- **Files affected:** `main.cpp` (replaced).
- **Change type:** replace.
- **Location:** Entire file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>

class Sensor {
public:
    int GetTemperature() const {
        read_count++;
        return 72; // Fake temperature
    }

    int GetReads() const {
        return read_count;
    }

private:
    mutable int read_count = 0;
};

int main() {
    const Sensor s;
    s.GetTemperature();
    s.GetTemperature();
    std::cout << "Reads: " << s.GetReads() << "\n";
    return 0;
}
```

### The Updated Project
The `main.cpp` now uses `mutable` to allow a `const` object to track its own read metrics.
```cpp
// + replacing previous main
#include <iostream>

class Sensor {
public:
    int GetTemperature() const {
        read_count++;
        return 72;
    }

    int GetReads() const {
        return read_count;
    }

private:
    mutable int read_count = 0;
};

int main() {
    const Sensor s;
    s.GetTemperature();
    s.GetTemperature();
    std::cout << "Reads: " << s.GetReads() << "\n";
    return 0;
}
```

### Introduce the concept in isolation
This is exactly what `mutable` is doing. If we remove it:
```cpp
private:
    int read_count = 0;
```
The compiler throws: `increment of member 'Sensor::read_count' in read-only object`. This proves that the `const` on `GetTemperature()` physically locks down all normal fields. The `mutable` keyword overrides this lock for a specific field, creating a permanent exception.

### Discard the throwaway example
This code is explicitly discarded and will not appear again.

### Mechanical walkthrough
- `mutable int read_count = 0;` — declares a field with the `mutable` specifier. This exempts the field from the class's `const` restrictions. Even if the entire object is `const`, this specific field can be modified. Without it, caching or read-tracking in `const` methods is impossible.
- `int GetTemperature() const` — a const member function. Logically, getting the temperature shouldn't change the sensor's outward state.
- `read_count++;` — inside the `const` method, we modify the field. Because of `mutable`, the compiler allows this operation.
- `const Sensor s;` — the entire object is declared `const`.
- `s.GetTemperature();` — calling the const method succeeds, and internally updates the counter.

### CS Lens
This distinguishes between logical constness and physical constness. Physical constness means the raw bytes of the object in memory do not change. Logical constness means the observable state of the object does not change. `mutable` exists to allow logical constness even when physical constness is violated. Also recognized in: lazy evaluation architectures, memoization algorithms.

### SE Lens
The alternative not chosen is forcing the caller to pass in a separate non-const tracking object to hold the metrics. The tradeoff of `mutable` is that it creates a backdoor in your immutability guarantees. Overusing it makes `const` meaningless, which is why it is reserved strictly for hidden, internal state like mutexes or caches.

### Commands needed to make this unit real
(No new commands.)

### Run it
```text
Reads: 2
```

### Connection
We have now seen how `const` protects variables, how it protects data passed across boundaries, and how `mutable` allows safe exceptions.

---

## Connect the Pieces

Let's trace the full lifecycle of a value guarded by const correctness.
1. `std::string data = "Critical";` — a normal, modifiable value is created.
2. `void Process(const std::string& input)` — the value is passed to a function. The compiler safely narrows the access to read-only for the scope of the function.
3. `input.length()` — inside the function, a method is called on the object. The compiler checks `length()`'s signature, sees it is marked `const`, and allows the call.
4. If `length()` needed to cache its result internally, it would update a `mutable` field, satisfying both the compiler's physical checks and the caller's logical expectations.

## What Breaks Without This

Without const correctness, the compiler cannot enforce your design intents.

**The Broken Code:**
```cpp
#include <iostream>

void UpdateScore(int* score) {
    *score = -1; // Unintentional corruption
}

int main() {
    int my_score = 100;
    UpdateScore(&my_score); 
    std::cout << my_score << "\n";
    return 0;
}
```

**The Output:**
```text
-1
```
*To fix it, you add `const` to the pointer parameter (`const int* score`). The compiler will then immediately flag the illegal assignment inside `UpdateScore` as an error before the code even runs.*

## Exercises
1. Write a `Player` class with a `set_score` method and a `get_score` method. Try putting `const` on `set_score` and observe the compiler error.
2. Create a function that takes a `const Player&`. Try calling `set_score` on it.
3. Add a `mutable` boolean `was_read` to the `Player` class, and set it to true inside `get_score`.

## Definition of Done
- [ ] You understand that `const` physically prevents assignment.
- [ ] You can pass large objects efficiently using `const` references without fear of modification.
- [ ] You know to label read-only methods with `const` so they can be called on `const` objects.
- [ ] You understand why a missing `const` in a parameter list breaks code that tries to use it.
- [ ] You can explain const correctness out loud, in your own words, to someone who hasn't read this lesson.
- [ ] You have committed your code: `git commit -m "Demonstrate const correctness so that the compiler enforces our read-only contracts"`
