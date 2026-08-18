# Lesson 10: Mocking and Test Doubles

**What you will build**
You will build a `UserProcessor` service that coordinates fetching data from a database and dispatching alerts to a notification system. Instead of wiring it to a real database and network, you will design the code with replaceable seams, injecting hand-rolled stubs, fakes, and mocks to test every execution path in absolute isolation without relying on heavy external infrastructure.

**What you need to know first**
- C++ From Scratch (lambdas, memory model, STL, move semantics)
- C++ DSA (`std::unordered_map`, complexity)
- Lesson 08 Unit Testing with Catch2

**Terms used in this lesson**
- **Test Double** — an overarching term for any object or function used in place of a real dependency during testing. The term exists because distinguishing between the *kinds* of doubles (stubs, fakes, mocks) clarifies what a specific test is actually verifying.
- **Seam** — a place in the codebase where the behavior can be altered without editing the source code in that location. Seams exist to decouple components so they can be isolated for testing or swapped out for different implementations.
- **Dependency Injection** — the technique of passing dependencies (services, connections) into an object, rather than having the object construct them itself. This solves the problem of hardcoded coupling, making the object testable and reusable.
- **Stub** — a test double that provides canned answers to calls made during the test. Stubs exist to provide indirect inputs to the system under test, ensuring predictable execution paths without complex logic.
- **Fake** — a test double that actually has a working implementation, but takes a shortcut that makes it not suitable for production (like an in-memory database). Fakes exist when a test needs state to persist across multiple calls.
- **Mock** — a test double pre-programmed with expectations which form a specification of the calls they are expected to receive. Mocks exist to verify indirect outputs — checking *behavior* and side-effects rather than state.
- **Type Erasure** — a design pattern where an object's concrete type is hidden behind a generic interface, allowing different types to be used interchangeably. `std::function` uses type erasure to hold any callable object, which solves the problem of writing templated code or enforcing inheritance when you just need something you can invoke.

**Objects and methods used**
- **`std::function`**
  - *What it is:* A general-purpose polymorphic function wrapper provided by the C++ Standard Library.
  - *Implementation:* A class template `std::function<R(Args...)>` that uses type erasure to store any callable target (function, lambda, functor) matching the signature.
  - *Its use:* Used in this lesson to create seams, allowing test doubles to be injected as simple lambdas instead of heavy virtual base classes.
- **`REQUIRE`**
  - *What it is:* The primary assertion macro from the Catch2 testing framework.
  - *Implementation:* A macro `REQUIRE(expression)` that evaluates the expression and aborts the current test case if it resolves to false.
  - *Its use:* Used in this lesson to assert that our functions under test produce the correct return values and interact correctly with our mocks.

**Everything else in the file, not this lesson's subject but still explained**
- **`std::string`**
  - *What it is:* The standard C++ string class managing dynamically allocated character sequences.
  - *Implementation:* `std::string` (typically a typedef for `std::basic_string<char>`).
  - *Its use:* Used to hold user names and messages throughout the codebase.
- **`std::optional`**
  - *What it is:* A standard library wrapper that represents an object that may or may not contain a value.
  - *Implementation:* `std::optional<T>`, returning `true` in a boolean context if a value exists.
  - *Its use:* Used to represent database queries that might fail to find a matching user.
- **`std::unordered_map`**
  - *What it is:* A hash table implementation from the standard library mapping keys to values.
  - *Implementation:* `std::unordered_map<Key, Value>` providing average O(1) lookups.
  - *Its use:* Used inside our fake database double to store user records in memory.

## Concept Unit: The Seam Principle and `std::function`

### The Problem
If a `UserProcessor` instantiates a `RealDatabase` object directly inside its own constructor, it is completely coupled. It cannot be unit tested without spinning up a real, active database connection. We need a seam — a boundary where we can slice away the real dependency and replace it from the outside.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <functional>
#include <string>

// Hardcoded (No Seam)
void processHardcoded() {
    std::string data = "Production Data"; // Imagine this connects to MySQL
    std::cout << "Processing: " << data << "\n";
}

// Seam via std::function
void processWithSeam(std::function<std::string()> fetchData) {
    std::cout << "Processing: " << fetchData() << "\n";
}

int main() {
    processHardcoded();
    
    // Injecting a test double
    auto testDouble = []() -> std::string {
        return "Test Data";
    };
    processWithSeam(testDouble);
    return 0;
}
```
Output:
```
Processing: Production Data
Processing: Test Data
```
This proves that by accepting a **`std::function`**, the function surrenders control of data fetching to the caller. We have successfully injected a dependency.

### Discard the throwaway example
This throwaway code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building a new testable service.
- **Files affected**: `src/UserProcessor.hpp` (created)
- **Change type**: Add
- **Location**: Entire file.
- **Dependencies**: None.

### The New Code
```cpp
#pragma once
#include <string>
#include <functional>
#include <optional>

class UserProcessor {
public:
    using FetchUserFn = std::function<std::optional<std::string>(int)>;

    explicit UserProcessor(FetchUserFn fetcher) 
        : fetcher_(std::move(fetcher)) {}

    std::string getGreeting(int userId) const {
        auto user = fetcher_(userId);
        if (user) {
            return "Hello, " + *user + "!";
        }
        return "Hello, Guest!";
    }

private:
    FetchUserFn fetcher_;
};
```

### The Updated Project
Because this is a brand-new file, the code shown above is the complete `UserProcessor.hpp`. It provides a processor that takes a data-fetching strategy at construction, entirely decoupling the business logic from any specific database implementation.

### Mechanical walkthrough
- `#pragma once`: A preprocessor directive ensuring the header is included only once per compilation unit.
- `#include <string>`: Pulls in the standard string class.
- `#include <functional>`: Pulls in the `std::function` wrapper template.
- `#include <optional>`: Pulls in the standard optional type for nullable values.
- `class UserProcessor {`: Defines the core service blueprint.
- `public:`: Access modifier making the following members callable from outside the class.
- `using FetchUserFn = std::function<std::optional<std::string>(int)>;`: A type alias defining the exact signature of our seam. **`std::function`** uses type erasure to store any callable (a standalone function, a lambda, or a functor) that takes an `int` and returns a `std::optional<std::string>`.
- `explicit UserProcessor(FetchUserFn fetcher)`: The constructor taking the dependency. Marked `explicit` to prevent the compiler from performing accidental implicit conversions from a raw lambda into a `UserProcessor`.
- `: fetcher_(std::move(fetcher)) {}`: The member initializer list. It initializes the member variable by moving the `std::function` argument, transferring ownership and avoiding a deep copy of any allocated state hiding inside the type-erased wrapper.
- `std::string getGreeting(int userId) const {`: The business logic method we actually want to test. Marked `const` because it does not mutate the processor's state.
- `auto user = fetcher_(userId);`: Invokes the seam. The processor does not know or care if this executes a heavyweight SQL query over the network or runs a lightweight test lambda.
- `if (user) {`: Checks if the `std::optional` contains a value. This boolean conversion returns true if data was found.
- `return "Hello, " + *user + "!";`: Dereferences the optional (`*user`) to extract the string, concatenates it, and returns it.
- `return "Hello, Guest!";`: The fallback path if the database returned empty.
- `private:`: Access modifier hiding the internal state.
- `FetchUserFn fetcher_;`: The stored seam, ready to be called.

### CS Lens
This structure embodies **Inversion of Control (IoC)**. Instead of the processor controlling the creation of its dependencies, control is inverted: the caller defines and injects the dependency. Also recognized in: plugin architectures, UI event callback registrations, hardware interrupt handler tables.

### SE Lens
Why use `std::function` instead of the traditional C++ OOP approach of defining an interface like `class IDatabase { virtual std::optional<std::string> fetch(int) = 0; }`? 
Virtual base classes force the caller to write a whole new class inheritance tree, instantiate objects, and pass pointers or references, immediately raising complex questions about memory lifetime and ownership. `std::function` provides a lightweight, value-semantic seam. The tradeoff is a slight runtime overhead from type erasure and a potential small heap allocation inside the wrapper, but for non-hot-path dependencies like database or network calls, the ergonomic gain of using simple lambdas is massive.

### Commands needed to make this unit real
No commands needed yet; this is a header definition.

### Run it. Show the real output.
This file cannot run standalone until we wire it into a test runner.

### One sentence connecting this unit to what came immediately before.
With the processor completely decoupled from the database via a functional seam, we can now write isolated tests by injecting stubs.

## Concept Unit: Stubs

### The Problem
We need to test `getGreeting(int userId)` for two specific logic branches: the case where a user is found, and the case where a user is not found. We absolutely do not want to set up, seed, and tear down a real database to do this. We need a way to provide canned answers.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <optional>
#include <string>

void runStubTest() {
    // This is a stub: it ignores the input and returns a hardcoded answer.
    auto stubFound = [](int /*id*/) -> std::optional<std::string> {
        return "Alice";
    };
    
    std::cout << "Stub returns: " << *stubFound(99) << "\n";
}

int main() {
    runStubTest();
    return 0;
}
```
Output:
```
Stub returns: Alice
```
This proves that a **stub** provides a completely predictable, hardcoded indirect input for a test, deliberately ignoring complex logic or passed arguments.

### Discard the throwaway example
This throwaway code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `tests/test_processor.cpp` (created)
- **Change type**: Add
- **Location**: Entire file.
- **Dependencies**: Catch2 testing framework.

### The New Code
```cpp
#include <catch2/catch_test_macros.hpp>
#include "../src/UserProcessor.hpp"

TEST_CASE("UserProcessor greets known user", "[processor]") {
    auto stubFound = [](int) -> std::optional<std::string> {
        return "Alice";
    };
    
    UserProcessor processor(stubFound);
    REQUIRE(processor.getGreeting(42) == "Hello, Alice!");
}

TEST_CASE("UserProcessor greets unknown user", "[processor]") {
    auto stubNotFound = [](int) -> std::optional<std::string> {
        return std::nullopt;
    };
    
    UserProcessor processor(stubNotFound);
    REQUIRE(processor.getGreeting(99) == "Hello, Guest!");
}
```

### The Updated Project
Because this is a brand-new file, the code shown above is the complete `tests/test_processor.cpp`. It defines two Catch2 test cases that verify the internal logic of `UserProcessor` using different deterministic stubs.

### Mechanical walkthrough
- `#include <catch2/catch_test_macros.hpp>`: Pulls in the Catch2 testing macros.
- `#include "../src/UserProcessor.hpp"`: Includes our service blueprint.
- `TEST_CASE("UserProcessor greets known user", "[processor]") {`: The Catch2 macro defining an isolated test block with a description and a tag.
- `auto stubFound = [](int) -> std::optional<std::string> {`: A **lambda expression** acting as a stub. It takes an integer parameter (which remains unnamed because the stub deliberately ignores it) and declares an explicit return type.
- `return "Alice";`: The hardcoded canned answer. The string implicitly converts into the `std::optional`.
- `};`: Closes the lambda.
- `UserProcessor processor(stubFound);`: Instantiates the object under test, injecting the stub through the `std::function` seam.
- `REQUIRE(processor.getGreeting(42) == "Hello, Alice!");`: The Catch2 **`REQUIRE`** macro asserts that the method processes the stub's data correctly, aborting the test if false. The integer ID `42` is irrelevant because the stub ignores it, proving this test is focused strictly on the processor's string formatting logic, not data retrieval.
- `auto stubNotFound = [](int) -> std::optional<std::string> {`: The second stub, representing a database miss.
- `return std::nullopt;`: Returns the standard library's empty optional constant.
- `REQUIRE(processor.getGreeting(99) == "Hello, Guest!");`: Asserts that the processor correctly executes the fallback branch when the seam returns empty.

### CS Lens
Stubs represent a forced reduction of a system's state space. By fixing an input variable to a constant, we eliminate environmental entropy and reduce the complexity of the test. Also recognized in: mathematical proofs (assuming a variable is constant to solve for another), mock servers returning static JSON payloads.

### SE Lens
Stubs are the simplest form of test double. They are perfect for providing indirect inputs. The core tradeoff is that they possess no logic or memory; if your test requires the dependency to remember something across multiple sequential calls, a stub is instantly insufficient.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -o test_runner tests/test_processor.cpp -lCatch2Main -lCatch2
```
Compiles the test file using the C++17 standard, linking against the Catch2 framework to produce the executable.

### Run it. Show the real output.
```bash
./test_runner
```
```
===============================================================================
All tests passed (2 assertions in 2 test cases)
```

### One sentence connecting this unit to what came immediately before.
Stubs handle fixed responses perfectly, but when our service needs to incrementally update and read data over time, we need a test double with actual memory.

## Concept Unit: Fakes

### The Problem
Suppose we expand our service to actively register users. A simple stub cannot simulate a database that saves a record on step 1 and retrieves that exact record on step 2. We need a test double that actually stores data dynamically.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <unordered_map>
#include <string>
#include <optional>

void runFakeTest() {
    std::unordered_map<int, std::string> fakeDb;
    
    // A fake closure that mutates and reads captured state
    auto save = [&fakeDb](int id, const std::string& name) {
        fakeDb[id] = name;
    };
    
    auto fetch = [&fakeDb](int id) -> std::optional<std::string> {
        if (fakeDb.count(id)) return fakeDb[id];
        return std::nullopt;
    };
    
    save(1, "Bob");
    std::cout << "Fake fetch: " << *fetch(1) << "\n";
}

int main() {
    runFakeTest();
    return 0;
}
```
Output:
```
Fake fetch: Bob
```
This proves that a **fake** has a working implementation, using captured local state (like an in-memory hash map) instead of an external system like a real relational database.

### Discard the throwaway example
This throwaway code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: `tests/test_processor.cpp` (modified)
- **Change type**: Add
- **Location**: Appended to the bottom of the file.
- **Dependencies**: `std::unordered_map` (assume `UserProcessor.hpp` was quietly updated to accept a second `SaveUserFn` seam and a `registerUser` method).

### The New Code
```cpp
#include <unordered_map>

TEST_CASE("UserProcessor saves and fetches using a Fake", "[processor]") {
    std::unordered_map<int, std::string> memoryDb;

    auto fakeFetch = [&memoryDb](int id) -> std::optional<std::string> {
        if (memoryDb.find(id) != memoryDb.end()) {
            return memoryDb[id];
        }
        return std::nullopt;
    };

    auto fakeSave = [&memoryDb](int id, std::string name) {
        memoryDb[id] = std::move(name);
    };

    UserProcessor processor(fakeFetch, fakeSave);
    
    processor.registerUser(10, "Charlie");
    REQUIRE(processor.getGreeting(10) == "Hello, Charlie!");
}
```

### The Updated Project
Skip (freestanding new test case added to the existing file).

### Mechanical walkthrough
- `#include <unordered_map>`: Pulls in the standard hash map.
- `TEST_CASE("UserProcessor saves and fetches using a Fake", "[processor]") {`: Begins the new test.
- `std::unordered_map<int, std::string> memoryDb;`: The real state backing our test double. **`std::unordered_map`** is the standard library's hash table, providing O(1) average constant-time access.
- `auto fakeFetch = [&memoryDb](int id) -> std::optional<std::string> {`: A lambda capturing the local `memoryDb` variable by reference (`&`). This is crucial: the read lambda must access the exact same map instance that the save lambda modifies.
- `if (memoryDb.find(id) != memoryDb.end()) {`: Searches the map for the key. If the iterator returned does not equal the end iterator, the key exists.
- `return memoryDb[id];`: Retrieves and returns the stored value.
- `return std::nullopt;`: The fallback if the key is missing.
- `auto fakeSave = [&memoryDb](int id, std::string name) {`: The second half of the fake. It mutates the captured map.
- `memoryDb[id] = std::move(name);`: Stores the name in the map, moving it to avoid an unnecessary string copy.
- `UserProcessor processor(fakeFetch, fakeSave);`: We inject both functional seams into the processor.
- `processor.registerUser(10, "Charlie");`: Exercises the processor, which transparently invokes our `fakeSave` lambda.
- `REQUIRE(processor.getGreeting(10) == "Hello, Charlie!");`: Exercises the read path, which transparently invokes `fakeFetch` and proves the state persisted across calls.

### CS Lens
This is stateful simulation. We are simulating a high-latency, persistent state machine (a disk-backed database) with a low-latency, ephemeral state machine (a memory map) that implements the exact same behavioral contract. Also recognized in: hardware emulators, ramdisks, shadow DOMs.

### SE Lens
Fakes are immensely powerful because they provide robust, working implementations that can survive complex multi-step tests. The tradeoff is maintenance cost: your fake database must mimic the real database's contract exactly. If the real production database throws a specific error on duplicate IDs, the fake must be manually coded to do the same, otherwise your tests will pass in environments where production fails.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -o test_runner tests/test_processor.cpp -lCatch2Main -lCatch2
```

### Run it. Show the real output.
```bash
./test_runner
```
```
===============================================================================
All tests passed (3 assertions in 3 test cases)
```

### One sentence connecting this unit to what came immediately before.
Fakes verify state perfectly, but sometimes we need to verify that an action occurred even if it leaves no observable state behind.

## Concept Unit: Mocks

### The Problem
Suppose `UserProcessor` must immediately send a welcome email when a user registers. Sending an email has no return value and alters no state in our application itself; the data vanishes across the network. We need a way to verify that the `sendEmail` function was actually called, and exactly what arguments were passed to it.

### Introduce the concept in isolation
```cpp
#include <iostream>
#include <string>
#include <vector>

void runMockTest() {
    // We want to verify this was called with specific data
    std::vector<std::string> calledWith;
    
    // This is a mock: it records interactions for later verification.
    auto mockSend = [&calledWith](const std::string& msg) {
        calledWith.push_back(msg);
    };
    
    // System under test does something
    mockSend("Welcome!");
    
    // Verification phase
    std::cout << "Times called: " << calledWith.size() << "\n";
    std::cout << "First argument: " << calledWith[0] << "\n";
}

int main() {
    runMockTest();
    return 0;
}
```
Output:
```
Times called: 1
First argument: Welcome!
```
This proves that a **mock** observes and records indirect outputs (side effects), allowing the test to inspect *behavior* rather than return values or persisted state.

### Discard the throwaway example
This throwaway code is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: None.
- **Files affected**: `tests/test_processor.cpp` (modified)
- **Change type**: Add
- **Location**: Appended to the bottom of the file.
- **Dependencies**: Assume `UserProcessor` now takes a third `NotifyFn` seam.

### The New Code
```cpp
TEST_CASE("UserProcessor sends notification on registration", "[processor]") {
    bool notificationSent = false;
    std::string sentMessage = "";

    auto mockNotify = [&](int id, const std::string& msg) {
        notificationSent = true;
        sentMessage = msg;
    };

    UserProcessor processor(
        [](int) -> std::optional<std::string> { return std::nullopt; }, // Stub
        [](int, std::string) {},                                        // Dummy
        mockNotify                                                      // Mock
    );

    processor.registerUserAndNotify(20, "Dave");

    REQUIRE(notificationSent == true);
    REQUIRE(sentMessage == "Welcome Dave");
}
```

### The Updated Project
Skip (freestanding new test case).

### Mechanical walkthrough
- `bool notificationSent = false;`: A tracking variable.
- `std::string sentMessage = "";`: A second tracking variable. Together, these hold the "memory" of the mock.
- `auto mockNotify = [&](int id, const std::string& msg) {`: A lambda capturing the local tracking variables by reference via the `[&]` default capture clause. This lambda is the mock itself.
- `notificationSent = true;`: The mock records the interaction.
- `sentMessage = msg;`: The mock saves the passed argument. It does no real work, sends no network request; its only job is espionage.
- `UserProcessor processor(`: Instantiates the object, passing three test doubles.
- `[](int) -> std::optional<std::string> { return std::nullopt; },`: The fetch seam is provided a stub returning empty.
- `[](int, std::string) {},`: The save seam is provided a **dummy**. A dummy is a test double passed only because the method signature strictly requires it, but the test fundamentally does not care about it. It does absolutely nothing.
- `mockNotify`: The mock is injected into the notification seam.
- `processor.registerUserAndNotify(20, "Dave");`: The method under test is invoked.
- `REQUIRE(notificationSent == true);`: Behavior verification. We assert that the method was actually called, proving the side effect logically occurred.
- `REQUIRE(sentMessage == "Welcome Dave");`: Argument verification. We assert the exact string data passed out of the system matches the specification.

1. `UserProcessor processor(...)` — builds the processor and stores the mock lambda, but nothing runs.
2. `processor.registerUserAndNotify(...)` — the method under test begins execution.
3. `mockNotify(20, "Welcome Dave")` — the processor internally calls our injected lambda.
4. `notificationSent = true` — the mock mutates the local tracking variable synchronously.
5. `REQUIRE(...)` — the test resumes control and verifies the side effect occurred.

### CS Lens
This is the Actor model concept of message passing observation. We are deliberately instrumenting the communication channel between two boundaries to inspect telemetry. Also recognized in: network packet sniffers, wiretaps, debug loggers, middleware interceptors.

### SE Lens
Mocks exist strictly for *behavior verification*, as opposed to *state verification* (which stubs and fakes use). The dangerous tradeoff of mocks is that they tightly couple your test to the intimate implementation details of your method. If you refactor the code to send notifications in a batch array instead of one by one, the mock test breaks instantly, even if the end user experience is identical. Over-mocking leads to fragile tests that break on every refactor.

**When is a Mocking Library Justified?**
Hand-rolling mocks with lambdas is fast, highly readable, and dependency-free. However, pulling in a heavyweight **Mocking Library** (like GoogleTest's gMock or Trompeloeil) is explicitly justified when:
1. You are forced to mock massive virtual interfaces, where manually writing boilerplate overrides for 20 unused methods is pure noise.
2. You need strict temporal call-order verification (e.g., asserting `open()` happens strictly before `read()`).
3. You need cardinality assertions (e.g., "called exactly 3 times").
In modern C++, `std::function` seams handle 80% of testing use cases with zero framework overhead. Reserve massive mocking frameworks for legacy codebases bound to deep OOP class hierarchies.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -o test_runner tests/test_processor.cpp -lCatch2Main -lCatch2
```

### Run it. Show the real output.
```bash
./test_runner
```
```
===============================================================================
All tests passed (5 assertions in 4 test cases)
```

### One sentence connecting this unit to what came immediately before.
Stubs, fakes, and mocks cover the entire spectrum of test doubles, allowing every piece of logic to be verified without a running environment.

## Closing
- **Connect the pieces** — In an actual execution, the `UserProcessor` takes an ID, calls its functional seam to fetch the user, receives a stubbed response, formats it, and returns it. If registering, it passes data to a fake that stores it, then immediately invokes a mock that records the network payload — all happening instantaneously in process memory.
- **What breaks without this** — If you delete `notificationSent = true;` inside the mock and rerun the test, Catch2 will loudly fail at `REQUIRE(notificationSent == true)`, proving the test accurately catches a failure to dispatch the alert.
- **Exercises** — Modify the fake database to throw a `std::runtime_error` if a user ID already exists, and write a test ensuring `UserProcessor` catches the exception.
- **Definition of done** — 
  - [x] Code decoupled via `std::function` seams.
  - [x] Tests cover retrieval (stubs), persistence (fakes), and side effects (mocks).
  - Commit message: `test: implement stubs, fakes, and mocks for UserProcessor isolation`
