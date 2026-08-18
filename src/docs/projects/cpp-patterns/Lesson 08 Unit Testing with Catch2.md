# Lesson 08: Unit Testing with Catch2

What you will build
In this lesson, you will build a test suite for a C++ component using the Catch2 testing framework. You will integrate Catch2 via CMake's dependency manager, write tests using the Arrange-Act-Assert pattern, manage test setup using isolated sections, differentiate between fatal and non-fatal assertions, and refactor code to use dependency injection to make it fully testable. The working feature is a verified calculator module; the transferable skills are test-driven design, isolated test execution, and designing for testability.

What you need to know first
- C++ From Scratch series (language, memory model, STL, smart pointers, CMake, etc.)
- C++ DSA series (algorithms, data structures)

Terms used in this lesson
- **Unit Testing** — verifying individual units of code (functions, classes) in isolation to ensure they behave correctly before they are combined into a larger system. Exists to catch logic errors early, locally, and reliably, rather than debugging the whole program.
- **Arrange-Act-Assert (AAA)** — a structured pattern for writing tests. You set up the inputs (Arrange), execute the behavior being tested (Act), and verify the outcome (Assert). Exists to keep tests readable and focused on one specific behavior.
- **Test-Driven Development (TDD)** — a feedback loop where you write a failing test first, write the minimum code to pass it, and then refactor. Exists to ensure test coverage is 100% and that the code's design is dictated by its usage.
- **Dependency Injection** — passing external dependencies (like loggers, databases, or sensors) into a class rather than the class constructing them or pulling them from globals. Exists so that in a test environment, you can pass a fake or mock version of the dependency.

Objects and methods used
- **`FetchContent_Declare`**
  - *What it is:* A CMake command to declare an external dependency.
  - *Implementation:* `FetchContent_Declare(name GIT_REPOSITORY url GIT_TAG tag)`
  - *Its use:* Used here to tell CMake where to download the Catch2 framework from GitHub.
- **`FetchContent_MakeAvailable`**
  - *What it is:* A CMake command to populate and add a previously declared dependency.
  - *Implementation:* `FetchContent_MakeAvailable(name)`
  - *Its use:* Used to actually download Catch2 and make its targets (like `Catch2::Catch2WithMain`) available to link against in our build.
- **`TEST_CASE`**
  - *What it is:* A Catch2 macro defining a single, standalone test.
  - *Implementation:* `TEST_CASE("Description", "[tags]") { ... }`
  - *Its use:* Used to group a specific test scenario. Catch2 automatically registers the block as a runnable test without manual registration.
- **`REQUIRE`**
  - *What it is:* A Catch2 assertion macro that evaluates an expression and aborts the current test if false.
  - *Implementation:* `REQUIRE(expression);`
  - *Its use:* Used for critical assertions where, if the condition fails, the rest of the test block is invalid or unsafe to run (e.g., checking a pointer is not null before dereferencing it).
- **`CHECK`**
  - *What it is:* A Catch2 assertion macro that evaluates an expression and records a failure if false, but allows the test to continue.
  - *Implementation:* `CHECK(expression);`
  - *Its use:* Used for independent assertions where multiple things can be checked and you want to see all failures in one run, rather than stopping at the first.
- **`SECTION`**
  - *What it is:* A Catch2 macro to define a sub-case within a `TEST_CASE`.
  - *Implementation:* `SECTION("Description") { ... }`
  - *Its use:* Used to share setup code defined at the top of a `TEST_CASE`. Catch2 executes the entire `TEST_CASE` from the top for *each* `SECTION`, ensuring completely isolated state per section.

## Concept Unit: Integrating Catch2 with CMake FetchContent

### The Problem
Before we can write tests, we need a testing framework. C++ does not have a built-in standard testing library. Instead of manually downloading headers and source files for Catch2, we want our build system (CMake) to automatically fetch it so that anyone cloning our repository can just build it without manually resolving dependencies.

### Introduce the concept in isolation
We will write a throwaway `CMakeLists.txt` and a simple `main.cpp` that includes Catch2 and runs its default test runner. 

```cmake
# CMakeLists.txt (Throwaway)
cmake_minimum_required(VERSION 3.14)
project(Catch2IsolatedLab)

include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

add_executable(isolated_test main.cpp)
target_link_libraries(isolated_test PRIVATE Catch2::Catch2WithMain)
```

```cpp
// main.cpp (Throwaway)
#include <catch2/catch_test_macros.hpp>

TEST_CASE("Isolation proof") {
    REQUIRE(1 == 1);
}
```

**Commands needed to make this unit real:**
```bash
cmake -S . -B build
cmake --build build
./build/isolated_test
```

**Output:**
```
===============================================================================
All tests passed (1 assertion in 1 test case)
```
The output proves that CMake successfully reached out to GitHub, downloaded Catch2 version 3.4.0, compiled it, linked it into our executable, and that the `Catch2WithMain` target automatically provided a `main()` function that ran our **test macro**.

### Discard the throwaway example
The isolated `CMakeLists.txt` and `main.cpp` are deleted. They will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are introducing our own unit testing pipeline.
- **Files affected:** `CMakeLists.txt` (modified).
- **Change type:** Configuration addition.
- **Location:** At the bottom of the existing top-level `CMakeLists.txt`.
- **Dependencies:** An active internet connection for the initial CMake configure step.

### The New Code
```cmake
include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

add_executable(calculator_tests tests/calculator_tests.cpp)
target_link_libraries(calculator_tests PRIVATE Catch2::Catch2WithMain)
```

### The Updated Project
```cmake
cmake_minimum_required(VERSION 3.17)
project(CalculatorApp)

# ... previous project targets (calculator_lib, etc.) ...

# ← new
include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

add_executable(calculator_tests tests/calculator_tests.cpp)
target_link_libraries(calculator_tests PRIVATE Catch2::Catch2WithMain)
```
The build configuration now defines a second executable, `calculator_tests`, which will build our test suite by compiling our test files and linking them against the Catch2 framework.

### Mechanical walkthrough
1. `include(FetchContent)` — loads the `FetchContent` module, a standard CMake module. This must be explicitly included because it provides the macros we call next; it is not loaded by default.
2. `FetchContent_Declare(` — begins the definition of a dependency we want CMake to know about. It does not download anything yet.
3. `Catch2` — the internal name CMake will use to refer to this fetched content.
4. `GIT_REPOSITORY` — a keyword argument telling CMake the source is a Git repository.
5. `https://github.com/catchorg/Catch2.git` — the URL of the official Catch2 repository.
6. `GIT_TAG` — a keyword argument specifying which exact commit, branch, or tag to fetch.
7. `v3.4.0` — the specific stable release tag. Pinning to a specific tag is critical for reproducible builds; if we used `master`, the build could break unexpectedly when upstream changes.
8. `)` — closes the declaration.
9. `FetchContent_MakeAvailable(Catch2)` — instructs CMake to actually execute the fetch (if not already cached locally) and immediately call `add_subdirectory()` on the downloaded source. This exposes all of Catch2's exported targets to our build.
10. `add_executable(calculator_tests tests/calculator_tests.cpp)` — creates a new executable target named `calculator_tests` built from our soon-to-be-created test file.
11. `target_link_libraries(` — begins linking dependencies to our target.
12. `calculator_tests` — the target we are linking to.
13. `PRIVATE` — specifies that Catch2 is an implementation detail of `calculator_tests` and should not be propagated to anything that links against `calculator_tests` (though executables aren't linked against anyway).
14. `Catch2::Catch2WithMain` — the specific target exposed by Catch2. `Catch2::` is an alias namespace. `Catch2WithMain` is a convenience library that includes the Catch2 framework *and* a pre-written `main()` function that parses command-line arguments and runs the tests.

### CS Lens
The concept of a build system dynamically resolving, downloading, and integrating third-party code at configuration time is called **Dependency Management**. 
Also recognized in: Node's `npm`, Rust's `cargo`, Python's `pip`, Java's `Maven`. 

### SE Lens
The principle here is **Reproducible Builds**. The alternative not chosen is downloading the Catch2 header manually and committing it to our source control repository (the "vendoring" approach). While vendoring guarantees the file is always present without internet access, it bloats the repository and makes updating to newer versions a manual, error-prone chore. `FetchContent` trades a one-time network fetch for an automated, declarative, and easily updatable dependency graph. The maintenance cost is minimal, provided the upstream repository (GitHub) and the pinned tag remain available.

## Concept Unit: TEST_CASE and Arrange-Act-Assert

### The Problem
We need to test a `Calculator::add(int, int)` function. We could write a `main()` function with `if (add(2, 2) != 4) std::cerr << "Fail!";`, but as tests grow, managing the execution, reporting failures, and isolating crashes manually becomes an untameable mess. We need a structured way to define a test scenario.

### Introduce the concept in isolation
We will write a throwaway `TEST_CASE` macro to demonstrate how Catch2 registers and executes a test block.

```cpp
// throwaway_test.cpp
#include <catch2/catch_test_macros.hpp>
#include <string>

TEST_CASE("String concatenation", "[strings]") {
    // Arrange
    std::string a = "Hello";
    std::string b = " World";
    
    // Act
    std::string result = a + b;
    
    // Assert
    REQUIRE(result == "Hello World");
}
```

**Commands needed to make this unit real:**
Compile and run the executable.

**Output:**
```
===============================================================================
All tests passed (1 assertion in 1 test case)
```
The output proves that `TEST_CASE` automatically registers the block into the test runner without us writing a `main()` or calling the function explicitly. The test runs, the `REQUIRE` evaluates the boolean expression, and it reports success.

### Discard the throwaway example
The `throwaway_test.cpp` file is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `tests/calculator_tests.cpp` (created).
- **Change type:** Addition.
- **Location:** A brand new file.
- **Dependencies:** The Catch2 library integrated in the previous step, and an assumed existing `calculator.hpp` providing `Calculator::add`.

### The New Code
```cpp
#include <catch2/catch_test_macros.hpp>
#include "../src/calculator.hpp"

TEST_CASE("Calculator adds two integers", "[calculator]") {
    Calculator calc;
    
    int result = calc.add(5, 7);
    
    REQUIRE(result == 12);
}
```

### The Updated Project
```cpp
// tests/calculator_tests.cpp
// ← new
#include <catch2/catch_test_macros.hpp>
#include "../src/calculator.hpp"

TEST_CASE("Calculator adds two integers", "[calculator]") {
    Calculator calc;
    
    int result = calc.add(5, 7);
    
    REQUIRE(result == 12);
}
```
The file now contains a single, automatically-registered test verifying the addition functionality of our `Calculator` class.

### Mechanical walkthrough
1. `#include <catch2/catch_test_macros.hpp>` — includes the Catch2 header providing the `TEST_CASE` and `REQUIRE` macros.
2. `#include "../src/calculator.hpp"` — includes our production code header so we can instantiate the class being tested.
3. `TEST_CASE(` — a macro that expands to a statically-registered function. Catch2 uses complex C++ initialization mechanics behind the scenes so that simply defining this block registers it globally before `main()` starts.
4. `"Calculator adds two integers"` — a free-form string describing what the test proves. This is printed if the test fails.
5. `,` — separates the description from the tags.
6. `"[calculator]"` — an optional tag string. Tags are enclosed in brackets. When running the test executable from the command line, you can filter which tests run by specifying tags (e.g., `./calculator_tests [calculator]`).
7. `) {` — closes the macro arguments and opens the test body block.
8. `Calculator calc;` — this is the **Arrange** phase. We instantiate the object under test and set up any necessary preconditions.
9. `int result = calc.add(5, 7);` — this is the **Act** phase. We invoke the specific behavior we are testing and capture its output. We do not mix this with assertions.
10. `REQUIRE(` — a Catch2 macro that evaluates its argument. If the argument evaluates to `false`, the test is immediately halted, marked as failed, and the runner proceeds to the next `TEST_CASE`.
11. `result == 12` — the boolean expression being evaluated. This is the **Assert** phase. Catch2 decomposes this expression so that if it fails, it can print the actual value of `result` alongside the expected `12`.
12. `);` — closes the assertion.
13. `}` — closes the test block.

### CS Lens
The structural pattern employed here is **Arrange-Act-Assert (AAA)**. 
Also recognized in: database transaction testing (setup schema, run query, verify rows), integration testing (start server, send HTTP request, verify 200 OK), hardware testing (apply voltage, flip relay, measure output).

### SE Lens
The principle here is **Separation of Concerns within Tests**. The alternative not chosen is writing code like `REQUIRE(calc.add(5, 7) == 12);` directly inline. While shorter, combining the Act and Assert phases makes the code harder to read, harder to step through in a debugger, and obscures what the test is actually doing when the setup grows complex. AAA creates a predictable rhythm: what do we have, what do we do, what do we expect. The maintenance cost of AAA is slightly more vertical space, but it pays off instantly when a test fails and the boundaries of the failure are clear.

## Concept Unit: `SECTION` for Test Reuse

### The Problem
If we want to test multiple operations on a single `Calculator` instance (like add, subtract, multiply), creating a new `TEST_CASE` for each one duplicates the `Calculator calc;` setup. But if we put multiple assertions in one `TEST_CASE`, state might leak: if `calc` had internal state (like a memory registry), the second operation might be affected by the first. We need a way to share setup code while guaranteeing a fresh environment for each check.

### Introduce the concept in isolation
We will write a throwaway test using a local variable and two `SECTION`s to prove how Catch2 executes them.

```cpp
// throwaway_section.cpp
#include <catch2/catch_test_macros.hpp>
#include <vector>

TEST_CASE("Section execution proof", "[sections]") {
    std::vector<int> v;
    v.push_back(1);
    
    SECTION("Appending 2") {
        v.push_back(2);
        REQUIRE(v.size() == 2);
    }
    
    SECTION("Appending 3") {
        v.push_back(3);
        REQUIRE(v.size() == 2);
        REQUIRE(v.back() == 3);
    }
}
```

**Commands needed to make this unit real:**
Compile and run the test.

**Output:**
```
===============================================================================
All tests passed (3 assertions in 1 test case)
```
The output proves a seemingly impossible C++ execution trace: the `TEST_CASE` block was actually executed **twice**. 
1. The runner enters the `TEST_CASE`, creates `v`, pushes `1`.
2. It hits the first `SECTION`, enters it, pushes `2`, asserts size is 2.
3. It skips the second `SECTION` and exits the `TEST_CASE`. `v` is destroyed.
4. The runner re-enters the `TEST_CASE` from the top, creates a brand new `v`, pushes `1`.
5. It skips the first `SECTION`.
6. It hits the second `SECTION`, enters it, pushes `3`, asserts size is 2 and back is 3.

### Discard the throwaway example
The `throwaway_section.cpp` file is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `tests/calculator_tests.cpp` (modified).
- **Change type:** Refactor and Addition.
- **Location:** Replacing the previous `TEST_CASE` body.
- **Dependencies:** None.

### The New Code
```cpp
TEST_CASE("Calculator arithmetic operations", "[calculator]") {
    Calculator calc;
    
    SECTION("Addition computes correct sum") {
        REQUIRE(calc.add(5, 7) == 12);
    }
    
    SECTION("Subtraction computes correct difference") {
        REQUIRE(calc.subtract(10, 4) == 6);
    }
}
```

### The Updated Project
```cpp
#include <catch2/catch_test_macros.hpp>
#include "../src/calculator.hpp"

// ← new (replaced previous TEST_CASE)
TEST_CASE("Calculator arithmetic operations", "[calculator]") {
    Calculator calc;
    
    SECTION("Addition computes correct sum") {
        REQUIRE(calc.add(5, 7) == 12);
    }
    
    SECTION("Subtraction computes correct difference") {
        REQUIRE(calc.subtract(10, 4) == 6);
    }
}
```
The test suite now groups all basic arithmetic tests under one `TEST_CASE`, sharing the `Calculator calc;` setup, but guaranteeing that each `SECTION` operates on a freshly constructed `calc` object.

### Mechanical walkthrough
1. `TEST_CASE("Calculator arithmetic operations", "[calculator]") {` — defines the parent test block.
2. `Calculator calc;` — the shared Arrange phase. This line will execute anew for every section encountered below.
3. `SECTION(` — a macro defining a leaf node in the test execution tree.
4. `"Addition computes correct sum"` — the description. If this section fails, Catch2 prints both the `TEST_CASE` description and the `SECTION` description.
5. `) {` — opens the section block.
6. `REQUIRE(calc.add(5, 7) == 12);` — the assertion (with inline act).
7. `}` — closes the first section.
8. `SECTION("Subtraction computes correct difference") {` — defines the second section. Catch2 internally tracks which sections it has already visited so it knows to skip the first and enter this one on its second pass through the parent block.
9. `REQUIRE(calc.subtract(10, 4) == 6);` — the assertion for the second section.
10. `}` — closes the second section.

### CS Lens
The execution model here is a **Tree Traversal of Execution Paths**. 
Also recognized in: depth-first search algorithms, backtracking parsing, fork-based process testing, speculative execution in CPUs.

### SE Lens
The principle here is **Test Isolation via Fixtures**. The alternative not chosen is using traditional object-oriented `setUp()` and `tearDown()` methods found in xUnit frameworks (like JUnit or GoogleTest). While OOP fixtures work, they force you to split your setup away from your test body, often requiring class member variables that pollute the namespace. Catch2's `SECTION` approach leverages lexical scoping: setup code is just standard C++ code written physically above the test, local variables are automatically destroyed when the scope exits, and isolation is guaranteed by the framework re-running the scope. The maintenance cost is minimal, though deep nesting of sections can make the "what executes when" trace confusing.

## Concept Unit: `REQUIRE` vs `CHECK`

### The Problem
If a single section contains multiple assertions verifying different properties of a result, and the first assertion fails using `REQUIRE`, the test immediately halts. You won't know if the remaining assertions would have passed or failed until you fix the first one and re-run. Sometimes we want to see a full report of all failures at once.

### Introduce the concept in isolation
We will write a throwaway test that intentionally fails using both macros to observe the execution flow.

```cpp
// throwaway_check.cpp
#include <catch2/catch_test_macros.hpp>

TEST_CASE("Check vs Require", "[assertions]") {
    int val = 5;
    
    CHECK(val == 10);
    CHECK(val == 20);
    
    REQUIRE(val == 30);
    CHECK(val == 40); // Will this run?
}
```

**Commands needed to make this unit real:**
Compile and run the test.

**Output:**
```
...
throwaway_check.cpp:6: FAILED:
  CHECK( val == 10 )
with expansion:
  5 == 10

throwaway_check.cpp:7: FAILED:
  CHECK( val == 20 )
...

throwaway_check.cpp:9: FAILED:
  REQUIRE( val == 30 )
...

===============================================================================
test cases: 1 | 1 failed
assertions: 3 | 3 failed
```
The output proves that `CHECK(val == 10)` failed, but the test continued to execute `CHECK(val == 20)`. When `REQUIRE(val == 30)` failed, it immediately aborted the block, proving that `CHECK(val == 40)` was never executed. 

### Discard the throwaway example
The `throwaway_check.cpp` file is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `tests/calculator_tests.cpp` (modified).
- **Change type:** Addition.
- **Location:** A new section inside the existing `TEST_CASE`.
- **Dependencies:** None.

### The New Code
```cpp
    SECTION("Division computes quotient and remainder") {
        auto [quotient, remainder] = calc.divide(10, 3);
        
        CHECK(quotient == 3);
        CHECK(remainder == 1);
    }
```

### The Updated Project
```cpp
TEST_CASE("Calculator arithmetic operations", "[calculator]") {
    Calculator calc;
    
    SECTION("Addition computes correct sum") {
        REQUIRE(calc.add(5, 7) == 12);
    }
    
    SECTION("Subtraction computes correct difference") {
        REQUIRE(calc.subtract(10, 4) == 6);
    }
    
    // ← new
    SECTION("Division computes quotient and remainder") {
        auto [quotient, remainder] = calc.divide(10, 3);
        
        CHECK(quotient == 3);
        CHECK(remainder == 1);
    }
}
```
We added a test for division that returns multiple values. We use `CHECK` because the quotient and remainder are independent properties of the result; if the quotient is wrong, we still want to know if the remainder was right or wrong in the same test run.

### Mechanical walkthrough
1. `SECTION("Division computes quotient and remainder") {` — opens the new isolated block.
2. `auto [quotient, remainder] = ` — structured binding (already taught in C++ From Scratch) to unpack the `std::pair` or struct returned by division.
3. `calc.divide(10, 3);` — the Act phase.
4. `CHECK(` — a Catch2 macro that evaluates its argument, records a failure if false, but allows execution to proceed to the next statement.
5. `quotient == 3);` — the first independent assertion.
6. `CHECK(remainder == 1);` — the second independent assertion. If the quotient check failed, this line still runs.
7. `}` — closes the section.

### CS Lens
The distinction between `REQUIRE` and `CHECK` embodies the concept of **Fatal vs. Non-Fatal Assertions**.
Also recognized in: compiler diagnostics (fatal error vs. warning), test frameworks (GoogleTest's `ASSERT_EQ` vs `EXPECT_EQ`), error handling strategies (panic vs. recoverable error).

### SE Lens
The principle here is **Maximizing Developer Feedback**. The alternative not chosen is using `REQUIRE` everywhere. If division was broken entirely, a `REQUIRE` on the quotient would stop execution, and the developer wouldn't know the remainder was also broken until they fixed the quotient, recompiled, and re-ran. Using `CHECK` for parallel, non-dependent properties provides a complete diagnostic picture in one pass. However, `REQUIRE` is still mandatory when subsequent code relies on the assertion — for instance, `REQUIRE(ptr != nullptr); CHECK(ptr->value == 5);`. If you used `CHECK` for the null pointer, the program would segfault on the next line, crashing the test runner instead of reporting a clean failure.

## Concept Unit: Dependency Injection for Testability

### The Problem
Our `Calculator` has a new requirement: it must log every operation to a file. The developer implements this by opening a file inside `add()` and writing to it. Suddenly, our tests fail if the hardcoded file path is read-only, tests overwrite each other's logs when run in parallel, and the test suite leaves garbage `.txt` files on disk. The `Calculator` has a hidden, hard-to-test global dependency (the file system).

### Introduce the concept in isolation
We will write a throwaway program demonstrating a hardcoded dependency, then refactor it to accept its dependency from the outside.

```cpp
// throwaway_di.cpp
#include <iostream>
#include <string>

// Bad: Hardcoded dependency
struct GlobalLogger {
    void log(const std::string& msg) { std::cout << "DISK WRITE: " << msg << "\n"; }
};

void doWork_bad() {
    GlobalLogger logger; // Cannot intercept or replace this
    logger.log("Work done.");
}

// Good: Dependency Injection
struct ILogger {
    virtual void log(const std::string& msg) = 0;
    virtual ~ILogger() = default;
};

void doWork_good(ILogger& logger) {
    logger.log("Work done.");
}

struct FakeLogger : ILogger {
    std::string last_msg;
    void log(const std::string& msg) override { last_msg = msg; }
};

int main() {
    FakeLogger test_logger;
    doWork_good(test_logger);
    std::cout << "Intercepted: " << test_logger.last_msg << "\n";
}
```

**Commands needed to make this unit real:**
Compile and run.

**Output:**
```
Intercepted: Work done.
```
The output proves that by passing the logger *in* rather than constructing it *inside*, the calling code (our test) gains complete control. We intercepted the log message in memory without ever touching the disk.

### Discard the throwaway example
The `throwaway_di.cpp` file is deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `tests/calculator_tests.cpp` (modified).
- **Change type:** Refactor.
- **Location:** The `Calculator` setup inside the `TEST_CASE`.
- **Dependencies:** An assumed update to the production `Calculator` code where it now takes an `ILogger&` in its constructor.

### The New Code
```cpp
    struct TestLogger : public ILogger {
        std::vector<std::string> messages;
        void log(const std::string& msg) override {
            messages.push_back(msg);
        }
    };
    
    TestLogger logger;
    Calculator calc(logger);
```

### The Updated Project
```cpp
TEST_CASE("Calculator arithmetic operations", "[calculator]") {
    // ← new
    struct TestLogger : public ILogger {
        std::vector<std::string> messages;
        void log(const std::string& msg) override {
            messages.push_back(msg);
        }
    };
    
    TestLogger logger;
    Calculator calc(logger);
    
    SECTION("Addition computes correct sum") {
        REQUIRE(calc.add(5, 7) == 12);
        REQUIRE(logger.messages.size() == 1);
        CHECK(logger.messages[0] == "Added 5 and 7");
    }
    
    // ... other sections unchanged ...
}
```
The test suite now defines a custom `TestLogger` that captures logs in memory, passes it to the `Calculator`, and verifies that the `Calculator` actually performed the logging.

### Mechanical walkthrough
1. `struct TestLogger : public ILogger {` — declares a local, test-only class that inherits from the production interface `ILogger`. Defining it inside the `TEST_CASE` keeps it localized to where it is used.
2. `std::vector<std::string> messages;` — a container to store the arguments passed to `log`. This is our memory-backed "disk".
3. `void log(const std::string& msg) override {` — implements the pure virtual function required by `ILogger`.
4. `messages.push_back(msg);` — captures the intercepted string instead of printing it or writing it to a file.
5. `};` — closes the struct.
6. `TestLogger logger;` — instantiates our fake dependency. This is part of the Arrange phase.
7. `Calculator calc(logger);` — **Dependency Injection**. We pass the dependency into the object rather than letting the object construct a real file logger itself.
8. `REQUIRE(logger.messages.size() == 1);` — a new assertion verifying the side-effect (logging) actually occurred. We use `REQUIRE` because if the vector is empty, accessing index 0 on the next line will crash the test.
9. `CHECK(logger.messages[0] == "Added 5 and 7");` — a non-fatal check verifying the content of the log message.

### CS Lens
The architectural principle here is **Inversion of Control (IoC)** via **Dependency Injection**.
Also recognized in: UI event loops (registering a callback rather than polling), hardware interrupt vectors, web frameworks (Spring Boot injecting database repositories).

### SE Lens
The principle here is **Designing for Testability**. The alternative not chosen is patching or mocking global state (e.g., redirecting `std::cout` or using a macro to redefine a class). While patching works in dynamic languages like Python, C++ is statically linked, making globals extremely hostile to testing. Hardcoded dependencies make code rigid; if `Calculator` news up a `FileLogger`, it can never be used in a context without a filesystem (like embedded hardware or a fast unit test). Dependency injection shifts the responsibility of *choosing* the dependency up the call stack, ensuring the unit itself remains isolated, purely functional, and entirely testable. The maintenance cost is slightly more boilerplate (interfaces and constructors), but the payoff is absolute decoupling.

---

## Closing

In this lesson, we established a complete unit testing workflow. A `Calculator` requires testing. We used CMake's `FetchContent` to dynamically acquire Catch2. We defined a `TEST_CASE` containing `SECTION` blocks, ensuring that every arithmetic operation gets a fresh `Calculator` instance. We invoked the target methods (Act), and verified results using `REQUIRE` (for fatal guarantees) and `CHECK` (for independent properties). Finally, when the `Calculator` grew a dependency on a logger, we applied Dependency Injection to pass a `TestLogger` from the test suite, allowing us to capture and verify side-effects strictly in memory.

**What breaks without this**
If you remove the `REQUIRE` on `logger.messages.size() == 1` and the Calculator forgets to log, `logger.messages[0]` will access out-of-bounds memory, resulting in a segmentation fault that crashes the test runner completely without a helpful error message. `REQUIRE` acts as the safety gate.

**Exercises**
1. Change `FetchContent_Declare` to use `GIT_TAG master`. Reconfigure CMake. Does it pull the latest code? Why is this dangerous for a production build?
2. Inside a `SECTION`, define another `SECTION`. Add a `printf` to trace when it runs. Catch2 supports arbitrary nesting.
3. Write a test that deliberately fails a `REQUIRE` on line 1 and a `CHECK` on line 2. Observe the console output.

**Definition of Done**
- [x] Catch2 is integrated via `FetchContent`.
- [x] Test cases follow the Arrange-Act-Assert pattern.
- [x] `SECTION`s are used to isolate state between sub-tests.
- [x] `REQUIRE` and `CHECK` are used correctly based on assertion fatality.
- [x] Globals are refactored into injected dependencies to allow mocking.
- [x] `git commit -m "Add Catch2 unit testing framework and DI calculator tests to guarantee isolated feature verification"`
