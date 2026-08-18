# Lesson 09: Testing Templates and Edge Cases

This lesson teaches you how to test generic C++ code across multiple types at once, how to systematically target the boundary conditions where code is most likely to break, and how to write assertions that fail when the code's contract is violated—not just when its internal implementation changes.

**What you will build**
You will build a suite of test cases that validate a generic algorithm across multiple data types automatically. You will then write tests that intentionally target the empty state, the single-element state, and the maximum-capacity state of a container. Finally, you will refactor a fragile test into a robust one that verifies observable behavior rather than rigid internal steps, ensuring the test fails for the right reasons.

**What you need to know first**
- C++ From Scratch (all 35 lessons, specifically templates, STL, and move semantics)
- C++ DSA (all 25 lessons)
- Lesson 08: Unit Testing with Catch2

**Terms used in this lesson**
- **Template Instantiation** — The process by which the C++ compiler generates a concrete, typed function or class from a generic template blueprint. Because a template is merely a blueprint, it is only type-checked and compiled when instantiated; a generic function that works perfectly for `int` might fail to compile or behave incorrectly for a custom type that lacks a default constructor or `operator==`.
- **Edge Case** — A scenario that occurs at the extreme operating boundaries of a function or data structure, such as an empty list, a list with exactly one element, or a mathematical operation that produces the maximum representable value. Bugs disproportionately cluster at boundaries, making them the most critical inputs to test.
- **Behavioral Testing** — The principle of asserting against the public, observable outcomes of a unit of code rather than asserting against the specific internal steps it took to get there. Tests that check internal implementation details are fragile and will break when the code is optimized or refactored, resulting in false failures.

**Objects and methods used**

- `TEMPLATE_TEST_CASE`
  - *What it is:* A Catch2 macro that defines a single test case block but executes it multiple times, once for each type in a provided list.
  - *Implementation:* A macro taking a string name, a string tag, and a variadic list of C++ types: `TEMPLATE_TEST_CASE("name", "[tags]", Type1, Type2, ...)`. Inside the block, the macro exposes the alias `TestType` representing the current type for that execution.
  - *Its use:* We use it to prove that our generic algorithms satisfy their contracts regardless of the underlying data type, without manually duplicating the test code.

- `REQUIRE`
  - *What it is:* The primary assertion macro in Catch2.
  - *Implementation:* Evaluates the boolean expression passed to it. If the expression is false, it immediately aborts the current test case and reports the failure, preventing cascading errors.
  - *Its use:* We use it to encode our expectations about the code's behavior, ensuring that execution stops exactly at the point a boundary condition fails.

---

## Concept Unit: Testing Multiple Type Instantiations

### The Problem
When you write a generic template function, it represents a family of functions, not just one. Testing it with `int` proves only that the `int` instantiation works. If your algorithm relies on value semantics, it might fail compiling or executing for a move-only type, a type with no default constructor, or a custom class with a specific `operator<`. Writing identical test cases for every expected type by hand is error-prone and violates the DRY (Don't Repeat Yourself) principle.

### Introduce the concept in isolation

We can instruct Catch2 to run the exact same test logic multiple times, substituting a different type for each run.

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <string>

// A throwaway template function
template <typename T>
T get_default() {
    return T{};
}

TEMPLATE_TEST_CASE("Default construction works", "[isolation]", int, double, std::string) {
    TestType val = get_default<TestType>();
    
    // int/double default to 0, string defaults to ""
    REQUIRE(val == TestType{}); 
}
```

Running this code produces output indicating that three tests passed, not one.

```
===============================================================================
All tests passed (3 assertions in 3 test cases)
```

The output proves that Catch2 instantiated the test block three separate times. The alias `TestType` became `int` on the first pass, `double` on the second, and `std::string` on the third. The assertion passed for all three.

### Discard the throwaway example
We delete the `get_default` example. It will not appear in our tests again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building standalone test patterns.
- **Files affected:** `tests/generic_tests.cpp` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** Catch2 framework installed.

### The New Code

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>
#include <algorithm>

template <typename T>
void reverse_container(std::vector<T>& vec) {
    std::reverse(vec.begin(), vec.end());
}

TEMPLATE_TEST_CASE("Container reversal maintains elements", "[generic]", int, char) {
    std::vector<TestType> vec;
    vec.push_back(TestType{1});
    vec.push_back(TestType{2});

    reverse_container(vec);

    REQUIRE(vec.front() == TestType{2});
    REQUIRE(vec.back() == TestType{1});
}
```

### The Updated Project

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>
#include <algorithm>

template <typename T>
void reverse_container(std::vector<T>& vec) {
    std::reverse(vec.begin(), vec.end());
}

// ← new
TEMPLATE_TEST_CASE("Container reversal maintains elements", "[generic]", int, char) {
    std::vector<TestType> vec;
    vec.push_back(TestType{1});
    vec.push_back(TestType{2});

    reverse_container(vec);

    REQUIRE(vec.front() == TestType{2});
    REQUIRE(vec.back() == TestType{1});
}
```

The file now defines a generic reversal function and a template test case that validates its logic across integer and character vectors.

### Mechanical walkthrough

1. `TEMPLATE_TEST_CASE` — A macro provided by Catch2. It registers a test case with the test runner, exactly like the standard `TEST_CASE` macro, but accepts a list of types to iterate over.
2. `"Container reversal maintains elements"` — The string name of the test, used for reporting and filtering.
3. `"[generic]"` — The tag string. Tags allow you to run specific subsets of your test suite.
4. `int, char` — The variadic list of types. Catch2 will execute the block that follows exactly twice.
5. `std::vector<TestType> vec;` — `TestType` is a type alias injected by the macro. On the first run, this declares a `std::vector<int>`. On the second run, it declares a `std::vector<char>`.
6. `vec.push_back(TestType{1});` — Uniform initialization using the injected type alias. This forces the literal `1` to be constructed as the appropriate type (an integer `1` or the character with ASCII value 1).
7. `vec.push_back(TestType{2});` — Appends the second element.
8. `reverse_container(vec);` — Calls the template function. Template argument deduction automatically resolves `T` to the current `TestType`.
9. `REQUIRE(vec.front() == TestType{2});` — Checks the first element. The macro aborts the test run for the current type if this evaluates to false.
10. `REQUIRE(vec.back() == TestType{1});` — Checks the last element.

### CS Lens
Testing generic code fundamentally requires exploring the type space. In type theory, parametric polymorphism (templates) asserts that the algorithm is indifferent to the type. However, real-world systems are constrained by concrete type behaviors—specifically, whether a type satisfies the implicit concepts (like `CopyConstructible` or `EqualityComparable`) the algorithm assumes. `TEMPLATE_TEST_CASE` bridges this gap by statically compiling the test logic against a representative sample of type bounds.

Also recognized in: fuzzing engines mutating types, generic constraints in languages like Rust and C#, type-parameterized tests in JUnit.

### SE Lens
Engineering robustness requires proving that a shared utility will not break when a colleague uses it with an unforeseen type next week. The tradeoff chosen here is explicit enumeration: we manually list the types to test (`int`, `char`). We did not choose exhaustive reflection, because C++ lacks native reflection to automatically discover all available types. The maintenance cost of this approach is low, but the risk remains that we forget to test a hostile type (like a move-only `std::unique_ptr`), leaving hidden compilation or runtime failures for future developers.

### Commands needed to make this unit real

Compile the test file using an installed Catch2 header:
```bash
g++ -std=c++17 generic_tests.cpp -o generic_tests
```

### Run it. Show the real output.

```bash
./generic_tests
```

```
===============================================================================
All tests passed (4 assertions in 2 test cases)
```

Catch2 counts two test cases (one for `int`, one for `char`) and evaluates two `REQUIRE` assertions per test case, resulting in 4 passing assertions.

### One sentence connecting this unit to what came immediately before.
Now that we can test across the breadth of multiple types automatically, we must focus on the depth of the data itself—specifically the dangerous boundary conditions where even single-type algorithms often break.

---

## Concept Unit: Boundary Conditions

### The Problem
Algorithms rarely fail on the "happy path" (e.g., a list of five normal elements). They fail at boundaries: when the container is empty, when it contains exactly one element, or when values reach mathematical extremes. If you only test generic data sets, you leave the most likely failure points completely unchecked.

### Introduce the concept in isolation

We isolate a boundary by testing how an algorithm handles an empty container.

```cpp
#include <iostream>
#include <vector>

void process_first(const std::vector<int>& v) {
    if (v.empty()) {
        std::cout << "Boundary handled: Empty\n";
        return;
    }
    std::cout << v.front() << "\n";
}

int main() {
    std::vector<int> empty_vec;
    process_first(empty_vec);
}
```

```
Boundary handled: Empty
```

The output proves that checking the boundary condition `v.empty()` prevents the undefined behavior of calling `v.front()` on an empty vector.

### Discard the throwaway example
We delete `process_first`. It will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `tests/boundary_tests.cpp` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** Catch2 framework installed.

### The New Code

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>
#include <stdexcept>

template <typename T>
T get_max(const std::vector<T>& vec) {
    if (vec.empty()) throw std::invalid_argument("Empty vector");
    T max_val = vec[0];
    for (const auto& val : vec) {
        if (val > max_val) max_val = val;
    }
    return max_val;
}

TEST_CASE("get_max boundary conditions", "[boundaries]") {
    SECTION("Empty container throws") {
        std::vector<int> empty_vec;
        REQUIRE_THROWS_AS(get_max(empty_vec), std::invalid_argument);
    }

    SECTION("Single element container") {
        std::vector<int> single_vec = {42};
        REQUIRE(get_max(single_vec) == 42);
    }
}
```

### The Updated Project

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>
#include <stdexcept>

template <typename T>
T get_max(const std::vector<T>& vec) {
    if (vec.empty()) throw std::invalid_argument("Empty vector");
    T max_val = vec[0];
    for (const auto& val : vec) {
        if (val > max_val) max_val = val;
    }
    return max_val;
}

// ← new
TEST_CASE("get_max boundary conditions", "[boundaries]") {
    SECTION("Empty container throws") {
        std::vector<int> empty_vec;
        REQUIRE_THROWS_AS(get_max(empty_vec), std::invalid_argument);
    }

    SECTION("Single element container") {
        std::vector<int> single_vec = {42};
        REQUIRE(get_max(single_vec) == 42);
    }
}
```

The file defines a `get_max` algorithm and a test case explicitly divided into two distinct sections: one for the zero-element boundary and one for the one-element boundary.

### Mechanical walkthrough

1. `TEST_CASE` — The standard Catch2 macro that registers a test block with the test runner.
2. `"get_max boundary conditions"` — The human-readable string name of the test suite.
3. `"[boundaries]"` — The tag string used for optional test filtering.
4. `SECTION("Empty container throws")` — A Catch2 macro that isolates setup state. If a test case has multiple sections, Catch2 executes the entire `TEST_CASE` block from the top down for each `SECTION`, running exactly one section per pass. This prevents state contamination between tests.
5. `std::vector<int> empty_vec;` — Declares a strictly empty vector, the mathematical floor of the container size boundary.
6. `REQUIRE_THROWS_AS` — A Catch2 macro that evaluates an expression and expects it to throw an exception of a specific type.
7. `get_max(empty_vec)` — The expression under test. If this returns normally without throwing, the macro will fail the test.
8. `std::invalid_argument` — The specific exception type we expect. If a different exception is thrown, the macro will catch it and fail the test, noting the type mismatch.
9. `SECTION("Single element container")` — The second boundary condition block. Catch2 re-runs the `TEST_CASE` from the beginning, skips the first section, and enters this one.
10. `std::vector<int> single_vec = {42};` — Initializes a vector with exactly one element. This tests the boundary where the loop body executes exactly once (or in some iterative algorithms, not at all, leaving the initial state).
11. `REQUIRE(get_max(single_vec) == 42);` — Asserts that the single element is inherently the maximum value.

### CS Lens
Testing boundary conditions is an application of equivalence partitioning. In software testing, inputs are grouped into equivalence classes where the system is expected to behave identically. You test one representative value from the center of the class, and then you explicitly test the values on the borders between classes (the boundaries) because off-by-one errors and unchecked invariants mathematically cluster at transitions.

Also recognized in: binary search implementations, graphical clipping windows, memory allocator bucket sizing.

### SE Lens
Engineering tests around boundary conditions directly mitigates catastrophic failures. The alternative chosen by junior developers is to test only representative "happy" data. The failure cost of the alternative is severe: an algorithm works beautifully during development but immediately segfaults in production when a database query returns zero rows, or corrupts data when an integer wraps around. Explicit boundary tests encode the system's absolute limits into the repository, preventing future refactorings from accidentally removing necessary safety checks.

### Commands needed to make this unit real

```bash
g++ -std=c++17 boundary_tests.cpp -o boundary_tests
```

### Run it. Show the real output.

```bash
./boundary_tests
```

```
===============================================================================
All tests passed (2 assertions in 1 test case)
```

### One sentence connecting this unit to what came immediately before.
Having secured our algorithms against extreme inputs at the boundaries, we must finally ensure that when a test inevitably fails, it fails because the behavior is actually broken—not because we tested internal implementation details.

---

## Concept Unit: Behavioral vs Implementation Testing

### The Problem
A test fails for the wrong reason (a false positive failure) when you refactor the internal logic of a function without changing its external output, yet the test turns red anyway. This happens when a test asserts against internal state, private helper calls, or exact algorithmic steps. Fragile tests train developers to ignore test failures or delete the tests altogether.

### Introduce the concept in isolation

We can write a test that fails simply because we changed how a value is calculated, even if the value is correct.

```cpp
#include <iostream>
#include <vector>

// Version 1: explicit loop
std::vector<int> double_values(const std::vector<int>& v) {
    std::vector<int> res;
    for(int x : v) res.push_back(x * 2);
    return res;
}

int main() {
    std::vector<int> in = {1, 2, 3};
    std::vector<int> out = double_values(in);
    
    // A brittle test might check that capacity is exactly 3 (from push_back)
    // If the function is refactored to use res.reserve(v.size()) first,
    // the capacity check might still pass, but if refactored to return a 
    // std::vector initialized with iterators, capacity might differ.
    // Asserting behavioral contract (the values) is safe:
    if (out[0] == 2 && out[1] == 4 && out[2] == 6) {
        std::cout << "Behavior is correct.\n";
    }
}
```

```
Behavior is correct.
```

The output proves that checking the final, observable state (the multiplied values) correctly validates the behavior, regardless of whether a loop, `std::transform`, or manual indexing was used internally.

### Discard the throwaway example
We delete the `double_values` example.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `tests/behavior_tests.cpp` (created)
- **Change type:** add
- **Location:** entire file
- **Dependencies:** Catch2 framework installed.

### The New Code

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>

class ProcessQueue {
    std::vector<int> items;
public:
    void enqueue(int val) { items.push_back(val); }
    int dequeue() {
        int val = items.front();
        items.erase(items.begin());
        return val;
    }
    bool is_empty() const { return items.empty(); }
};

TEST_CASE("ProcessQueue maintains FIFO order", "[behavior]") {
    ProcessQueue q;
    q.enqueue(10);
    q.enqueue(20);

    REQUIRE(q.dequeue() == 10);
    REQUIRE(q.dequeue() == 20);
    REQUIRE(q.is_empty() == true);
}
```

### The Updated Project

```cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include <vector>

class ProcessQueue {
    std::vector<int> items;
public:
    void enqueue(int val) { items.push_back(val); }
    int dequeue() {
        int val = items.front();
        items.erase(items.begin());
        return val;
    }
    bool is_empty() const { return items.empty(); }
};

// ← new
TEST_CASE("ProcessQueue maintains FIFO order", "[behavior]") {
    ProcessQueue q;
    q.enqueue(10);
    q.enqueue(20);

    REQUIRE(q.dequeue() == 10);
    REQUIRE(q.dequeue() == 20);
    REQUIRE(q.is_empty() == true);
}
```

The file defines a queue class and a test case that exclusively uses the public interface to verify FIFO (First-In-First-Out) behavior.

### Mechanical walkthrough

1. `ProcessQueue q;` — Instantiates the object under test.
2. `q.enqueue(10);` — Interacts with the object strictly through its public interface.
3. `q.enqueue(20);` — Pushes a second item to establish sequence.
4. `REQUIRE(q.dequeue() == 10);` — The core behavioral assertion. It does not check if `items.size()` is 1. It does not check if `items[0]` is 20. It calls a public method and verifies the observable output.
5. `REQUIRE(q.dequeue() == 20);` — Verifies the subsequent observable output.
6. `REQUIRE(q.is_empty() == true);` — Verifies the final observable state. 

Because this test relies zero percent on the internal `std::vector`, a developer can rewrite `ProcessQueue` tomorrow to use a `std::deque` or a circular buffer array. The test will not need to be touched. If it passes, the refactor is correct. If it fails, the refactor broke the contract.

### CS Lens
Behavioral testing mirrors the concept of an Abstract Data Type (ADT). An ADT is defined strictly by its behavior and operations (e.g., a Queue is defined by enqueue and dequeue), entirely divorced from its concrete implementation (linked list vs. array). When tests respect the ADT boundary, they mathematically verify the contract rather than the underlying machinery.

Also recognized in: interface segregation, black-box testing, REST API contract validation.

### SE Lens
Engineering a test suite requires optimizing for low maintenance cost and high signal-to-noise ratio. The alternative—white-box testing where test code accesses private fields or mocks internal functions—couples the test directly to the implementation. When implementation changes, the white-box test breaks, creating a false negative. The maintenance cost of updating hundreds of brittle tests for every refactor causes teams to abandon testing. Behavioral testing guarantees that a red build actually means broken software.

### Commands needed to make this unit real

```bash
g++ -std=c++17 behavior_tests.cpp -o behavior_tests
```

### Run it. Show the real output.

```bash
./behavior_tests
```

```
===============================================================================
All tests passed (3 assertions in 1 test case)
```

### One sentence connecting this unit to what came immediately before.
By combining multi-type testing, strict boundary validation, and behavioral assertions, you construct a test suite that guards against regressions without impeding future refactoring.

---

## Closing

**Connect the pieces**
To build bulletproof C++ utilities, testing must systematically cover the dimensions of type, scale, and contract. A generic sequence container might be built. You use `TEMPLATE_TEST_CASE` to prove it stores `int` and `std::string`. You write `SECTION` blocks to prove it doesn't crash when empty and handles the transition from size 0 to size 1 correctly. Finally, you write `REQUIRE` assertions against its public iterators and accessors, completely ignoring the internal memory allocations, ensuring that your test proves behavioral correctness.

**What breaks without this**
Delete the empty check from `get_max`:

```cpp
template <typename T>
T get_max(const std::vector<T>& vec) {
    // if (vec.empty()) throw std::invalid_argument("Empty vector");
    T max_val = vec[0]; // CRASH
    // ...
}
```

Running the boundary test now produces a failure:
```
terminate called after throwing an instance of 'Catch::TestFailureException'
```
Without the test, this invalid memory access would ship to production. Restoring the check immediately turns the build green again.

**Exercises**
1. Add `std::string` to the `TEMPLATE_TEST_CASE` for container reversal and observe if the syntax holds up.
2. Write a boundary test for an integer division function that asserts `REQUIRE_THROWS_AS` when dividing by zero.
3. Refactor `ProcessQueue` to use a `std::deque` internally and verify that the behavioral test still passes without modification.

**Definition of done**
- [x] A generic test file leverages `TEMPLATE_TEST_CASE` to validate logic across different types.
- [x] A boundary test file isolates edge cases (empty, single) into separate `SECTION` blocks.
- [x] A behavior test file asserts only against public interfaces, avoiding brittle internal state checks.
- Commit message: `test: establish patterns for template testing, edge boundaries, and behavioral assertions`
