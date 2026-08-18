# Lesson 11: std::expected and Error Codes

You will build a mathematical evaluation pipeline that parses raw strings into integers and performs division, handling malformed inputs and division-by-zero exclusively through value-based error reporting. The working feature is a safe math evaluator, but the transferable problem this lesson is actually about is replacing implicit, hidden control flow (exceptions) with explicit, typed error contracts that carry zero stack-unwinding overhead, and chaining those operations without writing nested boilerplate.

**What you need to know first:**
- C++ From Scratch (Exceptions) — what an exception is, `try`/`catch`, and the mechanics of stack unwinding.
- C++ From Scratch (Lambdas) — capturing variables, `auto` parameters, trailing return types.
- C++ From Scratch (Templates and STL) — type parameters, move semantics, standard library vocabulary types.

**Terms used in this lesson:**
- **Stack unwinding** — the process where the C++ runtime walks backward up the call stack, destroying local variables and searching for a matching `catch` block when an exception is thrown. It exists to guarantee resource cleanup (RAII) during an error, but costs significant execution time and prevents the compiler from optimizing control flow.
- **Sum type (Tagged Union)** — a data structure that holds exactly one of several distinct, strictly defined types at any given moment, accompanied by a tag indicating which type is currently active. It exists to represent mutually exclusive states (like "success" OR "error") in a single variable without dynamic allocation or unsafe casts.
- **Monadic interface** — a design pattern providing standard methods (like `.and_then` or `.transform`) to chain operations on wrapper types. It exists to remove boilerplate: the wrapper internally checks if it holds a valid value before passing it to the next operation, halting the chain early if an error occurs.
- **Zero-overhead principle** — the C++ design philosophy that you don't pay for what you don't use. Applied to error handling, it means reporting an error should not cost more execution time than returning a normal value, which value-based error reporting achieves by treating errors as ordinary data.

**Objects and methods used:**

- **`std::expected`**
  - *What it is:* A standard library sum type representing either a successful expected value or an unexpected error value.
  - *Implementation:* `template<class T, class E> class expected;`
  - *Its use:* We use this as the return type for our failable operations to make the error contract explicit in the function signature and avoid exception overhead.

- **`std::unexpected`**
  - *What it is:* A utility type used to hold an error value meant to be stored in the error channel of a `std::expected`.
  - *Implementation:* `template<class E> class unexpected;`
  - *Its use:* We return this from our functions when an operation fails, allowing `std::expected` to construct itself in the error state.

- **`std::expected::and_then`**
  - *What it is:* A monadic binding method that takes a function returning *another* `std::expected`, and executes it only if the current object contains a success value.
  - *Implementation:* `template<class F> constexpr auto and_then(F&& f) &;`
  - *Its use:* We use this to chain our `parse` and `divide` steps, where each step can independently fail, without writing nested `if` statements.

- **`std::expected::transform`**
  - *What it is:* A monadic mapping method that takes a function returning a raw value, executes it on the success value, and wraps the result in a new `std::expected`.
  - *Implementation:* `template<class F> constexpr auto transform(F&& f) &;`
  - *Its use:* We use this for infallible data conversions, like converting the successful division result back into a string for display.

- **`std::expected::or_else`**
  - *What it is:* A monadic recovery method that takes a function returning a `std::expected`, and executes it only if the current object contains an error.
  - *Implementation:* `template<class F> constexpr auto or_else(F&& f) &;`
  - *Its use:* We use this to catch and replace errors at the end of our pipeline, providing a safe fallback value.

**Everything else in the file, not this lesson's subject but still explained:**

- **`std::from_chars`**
  - *What it is:* A low-level, high-performance parsing function from the `<charconv>` header that does not allocate memory and does not throw exceptions.
  - *Implementation:* `std::from_chars_result from_chars(const char* first, const char* last, int& value);`
  - *Its use:* We use this to parse strings into integers because it perfectly aligns with our zero-overhead, exception-free error model.

- **`std::from_chars_result`**
  - *What it is:* The return type of `std::from_chars`, containing a pointer to the first unparsed character and an error code.
  - *Implementation:* `struct from_chars_result { const char* ptr; std::errc ec; };`
  - *Its use:* We inspect its `ec` member to determine if our string parsing succeeded or failed.

---

## Concept Unit: Returning Success or Failure by Value

### The Problem

When a function can fail, it needs a way to inform the caller. The traditional C++ approach is throwing an exception. However, exceptions have hidden control flow: a `throw` statement immediately aborts the current path and jumps up the call stack. This stack unwinding is computationally expensive. In high-performance, real-time, or deeply embedded systems, that overhead is unacceptable. We need a way to return either a valid result or an error directly, as ordinary data, so the compiler can optimize it exactly like a normal return value.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the pattern.
- **Files affected:** `math_parser.cpp` (Created)
- **Change type:** Add
- **Location:** Brand new file
- **Dependencies:** C++23 compiler (`-std=c++23`)

### The New Code

```cpp
#include <expected>
#include <string_view>
#include <string>
#include <charconv>

std::expected<int, std::string> parse_int(std::string_view str) {
    int result = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), result);
    
    if (ec == std::errc{}) {
        return result;
    }
    
    return std::unexpected("Parse failed: not an integer");
}
```

### The Updated Project

```cpp
// math_parser.cpp
#include <expected>
#include <string_view>
#include <string>
#include <charconv>
#include <iostream>

// ← new
std::expected<int, std::string> parse_int(std::string_view str) {
    int result = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), result);
    
    if (ec == std::errc{}) {
        return result;
    }
    
    return std::unexpected("Parse failed: not an integer");
}

int main() {
    auto parsed = parse_int("42");
    if (parsed.has_value()) {
        std::cout << "Success: " << parsed.value() << "\n";
    } else {
        std::cout << "Error: " << parsed.error() << "\n";
    }
    return 0;
}
```
This file now contains a complete, exception-free string parsing pipeline that manually checks the return state and prints the corresponding output.

### The Concept in Isolation

```cpp
#include <expected>
#include <string>
#include <iostream>

std::expected<double, std::string> get_temperature(bool sensor_working) {
    if (sensor_working) {
        return 22.5;
    }
    return std::unexpected("Sensor offline");
}

int main() {
    auto result = get_temperature(false);
    std::cout << "Has value? " << result.has_value() << "\n";
    std::cout << "Error message: " << result.error() << "\n";
}
```

Output:
```text
Has value? 0
Error message: Sensor offline
```

This output proves that the function successfully smuggled an error string out through the return channel instead of a double, without throwing. This is exactly what `std::expected` in the real code just shown is doing, isolated: acting as a dual-channel return type. This is called a **sum type**, specifically implemented as `std::expected`.

This throwaway example is now deleted and will not appear in the project again.

### Mechanical Walkthrough

- `std::expected<int, std::string>` — the return type. It declares a sum type that holds *either* an `int` (the expected success type) *or* a `std::string` (the unexpected error type), but never both. It enforces an explicit error contract: the caller cannot ignore that this function might fail.
- `parse_int(std::string_view str)` — the function signature taking a non-owning view of a string.
- `int result = 0;` — a local integer initialized to zero to hold the successfully parsed value.
- `auto [ptr, ec]` — a structured binding declaration that unpacks the two members of the `std::from_chars_result` struct.
- `=` — the assignment operator.
- `std::from_chars(...)` — a low-level, high-performance parsing function that reads characters and converts them to a number. It guarantees it will never throw an exception.
- `str.data()` — a method call on the string view returning a pointer to the start of the character array.
- `,` — the argument separator.
- `str.data() + str.size()` — pointer arithmetic calculating the end of the character array, passed as the upper bound for parsing.
- `,` — the argument separator.
- `result` — the local integer passed by reference, which `from_chars` will populate if successful.
- `if (ec == std::errc{})` — an equality check. `std::errc{}` constructs a default-initialized error code, which represents "no error". We are checking if the parsing succeeded.
- `{ return result; }` — implicitly constructs a `std::expected` in its success state using the integer value.
- `return` — the return keyword.
- `std::unexpected("Parse failed: not an integer")` — explicitly constructs a utility wrapper holding the error string. Because `std::expected` can be implicitly constructed from an expected value *or* an unexpected wrapper, returning this tells the compiler to build the `std::expected` in its error state.

### CS Lens

This pattern embodies the concept of a **Sum Type**, often called a Tagged Union or Result type. In type theory, a sum type `A | B` means a value can be exactly one of those types. This is fundamentally different from a Product type (like a `struct`), which holds `A` *and* `B` simultaneously. 

Also recognized in: Rust's `Result<T, E>`, Haskell's `Either a b`, Swift's `Result`, functional programming monads.

### SE Lens

We engineered this with `std::expected` to achieve **Zero-Overhead Error Handling**. The alternative not chosen was `try`/`catch` with exceptions. Throwing an exception requires the compiler to emit side-tables for unwinding and requires the runtime to traverse the stack dynamically. By using `std::expected`, the error is just ordinary data returned in registers or on the stack. The CPU treats an error path with the exact same predictable performance cost as a success path. The maintenance trade-off is that callers must explicitly check the result; they cannot silently let an error bubble up the stack without explicitly returning it themselves.

### Commands Needed

To compile this C++23 code:
```bash
g++ -std=c++23 math_parser.cpp -o math_parser
```
- `g++` — the GNU C++ compiler.
- `-std=c++23` — enables the C++23 standard, which is strictly required for `std::expected`.
- `math_parser.cpp` — our source file.
- `-o math_parser` — sets the output executable name.

### Execution and Output

```bash
./math_parser
```
Output:
```text
Success: 42
```

### Connection

We now have a function that returns errors as values, but manually writing `if (parsed.has_value())` to check it is tedious, especially if we want to immediately pass that value to *another* operation that might also fail.

---

## Concept Unit: Chaining Failable Operations (.and_then)

### The Problem

If we want to parse an integer, and then divide 100 by that integer, both steps can fail (parsing can fail on bad text; division can fail on zero). If we manually check `.has_value()` after every step, we get nested `if` statements—often called the "pyramid of doom." We need a way to chain operations such that if step one fails, step two is automatically skipped and the error passes straight through to the end, without writing manual checks.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `math_parser.cpp` (Modified)
- **Change type:** Add
- **Location:** Above `main`, and replacing the body of `main`.
- **Dependencies:** `parse_int` from the previous unit.

### The New Code

```cpp
std::expected<int, std::string> divide_100_by(int divisor) {
    if (divisor == 0) {
        return std::unexpected("Division by zero");
    }
    return 100 / divisor;
}

// Inside main:
auto pipeline_result = parse_int("0").and_then(divide_100_by);
```

### The Updated Project

```cpp
// math_parser.cpp
#include <expected>
#include <string_view>
#include <string>
#include <charconv>
#include <iostream>

std::expected<int, std::string> parse_int(std::string_view str) {
    int result = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), result);
    if (ec == std::errc{}) { return result; }
    return std::unexpected("Parse failed: not an integer");
}

// ← new
std::expected<int, std::string> divide_100_by(int divisor) {
    if (divisor == 0) {
        return std::unexpected("Division by zero");
    }
    return 100 / divisor;
}

int main() {
    // ← new
    auto pipeline_result = parse_int("0").and_then(divide_100_by);
    
    if (pipeline_result.has_value()) {
        std::cout << "Pipeline Success: " << pipeline_result.value() << "\n";
    } else {
        std::cout << "Pipeline Error: " << pipeline_result.error() << "\n";
    }
    return 0;
}
```
This file now chains two separate failable operations together. The `main` function initiates parsing, and seamlessly passes the result to the division operation only if parsing succeeded, avoiding explicit nesting.

### The Concept in Isolation

```cpp
#include <expected>
#include <string>
#include <iostream>

std::expected<int, std::string> get_user_id() {
    return std::unexpected("Database down");
}

std::expected<std::string, std::string> get_email(int id) {
    return "user@example.com";
}

int main() {
    auto email = get_user_id().and_then(get_email);
    std::cout << "Error encountered: " << email.error() << "\n";
}
```

Output:
```text
Error encountered: Database down
```

This output proves that `get_email` was completely skipped because `get_user_id` returned an error, and the error propagated intact to the final result. This is exactly what `.and_then` in the real code just shown is doing, isolated: acting as an automatic short-circuiting bridge. This is called a **monadic bind operation**.

This throwaway example is now deleted and will not appear in the project again.

### Mechanical Walkthrough

- `std::expected<int, std::string>` — the return type for our division function, explicitly stating it can fail and return an error string.
- `divide_100_by(int divisor)` — the function signature. Notice it takes a plain `int`, not a `std::expected`. It assumes it is receiving a valid value.
- `if (divisor == 0)` — a conditional check preventing division by zero, which causes hardware faults.
- `{ return std::unexpected("Division by zero"); }` — constructs the expected object in the error state.
- `return 100 / divisor;` — performs the division and implicitly constructs the success state.
- `auto pipeline_result` — type deduction for the final `std::expected` object resulting from the chain.
- `=` — the assignment operator.
- `parse_int("0")` — invokes our parsing function, which will succeed and return the integer `0`.
- `.and_then` — a method on `std::expected`. It inspects the current state of the expected object. If it contains an error, it returns that error immediately. If it contains a success value, it unpacks that value and passes it to the provided function.
- `(divide_100_by)` — the function passed as an argument to `.and_then`. The extracted integer `0` is fed directly into `divisor`. Since `divide_100_by` returns a `std::expected`, the chain remains flat.

1. `parse_int("0")` — successfully parses the string and returns a `std::expected` holding the integer `0`.
2. `.and_then(...)` — sees the success state, extracts `0`, and calls `divide_100_by(0)`.
3. `divide_100_by(0)` — detects the zero divisor and returns an error holding `"Division by zero"`.
4. `pipeline_result` — receives the error state.

### CS Lens

This embodies the **Monad** design pattern. A monad is simply a wrapper type that provides a specific interface to sequence operations. The `.and_then` method (often called `bind` or `>>=` in functional languages) is the defining feature: it takes a wrapped value, unwraps it, applies a function that returns a *new* wrapped value, and flattens the result so you don't end up with `expected<expected<T>>`.

Also recognized in: `std::optional::and_then`, JavaScript `Promise.then()`, C# LINQ `SelectMany`.

### SE Lens

We engineered this using a monadic interface to achieve **Linear Flow without Boilerplate**. The alternative not chosen was checking `has_value()` after every call and manually returning the error. The cost of that alternative is cognitive load: the "happy path" of the business logic becomes buried under error-handling noise. `.and_then` allows us to describe the logical sequence of operations clearly, deferring the error handling until the very end, while maintaining strictly typed, zero-overhead execution.

### Execution and Output

```bash
g++ -std=c++23 math_parser.cpp -o math_parser
./math_parser
```
Output:
```text
Pipeline Error: Division by zero
```

### Connection

We can chain failable operations, but what if the next step in our pipeline is guaranteed to succeed, or we want to intercept a final error and provide a safe default?

---

## Concept Unit: Transforming and Recovering (.transform and .or_else)

### The Problem

Not all operations in a pipeline can fail. If we want to take our final integer and format it as a string for display, that formatting operation always succeeds. We can't use `.and_then` because `.and_then` demands a function that returns a `std::expected`. We need a way to apply an infallible function to our success value. Furthermore, if an error *did* happen anywhere in the chain, we might want to recover from it by substituting a safe default value, rather than letting the error escape.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `math_parser.cpp` (Modified)
- **Change type:** Replace
- **Location:** The `pipeline_result` assignment in `main`.
- **Dependencies:** Standard `<string>` formatting.

### The New Code

```cpp
auto pipeline_result = parse_int("XYZ")
    .and_then(divide_100_by)
    .transform([](int val) {
        return "The answer is: " + std::to_string(val);
    })
    .or_else([](const std::string& err) -> std::expected<std::string, std::string> {
        return "Default answer: -1 (Reason: " + err + ")";
    });
```

### The Updated Project

```cpp
// math_parser.cpp
#include <expected>
#include <string_view>
#include <string>
#include <charconv>
#include <iostream>

std::expected<int, std::string> parse_int(std::string_view str) {
    int result = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), result);
    if (ec == std::errc{}) { return result; }
    return std::unexpected("Parse failed: not an integer");
}

std::expected<int, std::string> divide_100_by(int divisor) {
    if (divisor == 0) { return std::unexpected("Division by zero"); }
    return 100 / divisor;
}

int main() {
    // ← new
    auto pipeline_result = parse_int("XYZ")
        .and_then(divide_100_by)
        .transform([](int val) {
            return "The answer is: " + std::to_string(val);
        })
        .or_else([](const std::string& err) -> std::expected<std::string, std::string> {
            return "Default answer: -1 (Reason: " + err + ")";
        });
    
    // pipeline_result is now guaranteed to have a success value because or_else caught errors.
    std::cout << pipeline_result.value() << "\n";
    return 0;
}
```
This file now defines a fully robust pipeline that processes data, maps it to a new type, and handles errors intrinsically. `main` no longer needs an `if` block, because `.or_else` guarantees a valid string outcome.

### The Concept in Isolation

```cpp
#include <expected>
#include <string>
#include <iostream>

int main() {
    std::expected<int, std::string> data = 5;
    
    auto mapped = data
        .transform([](int x) { return x * 2; })
        .or_else([](auto) -> std::expected<int, std::string> { return 0; });
        
    std::cout << "Mapped: " << mapped.value() << "\n";
}
```

Output:
```text
Mapped: 10
```

This output proves that the function inside `.transform` ran and altered the internal value from `5` to `10`, without explicitly re-wrapping it. This is exactly what `.transform` in the real code just shown is doing, isolated: mapping a value cleanly. This is called a **monadic map operation**.

This throwaway example is now deleted and will not appear in the project again.

### Mechanical Walkthrough

- `auto pipeline_result` — type deduction. Because `.transform` changes the success type to a `std::string`, the final type of this chain is `std::expected<std::string, std::string>`.
- `=` — assignment operator.
- `parse_int("XYZ")` — starts the chain. This will fail immediately.
- `.and_then(divide_100_by)` — skipped entirely, because the prior step resulted in an error.
- `.transform` — a monadic method. Unlike `.and_then`, it expects a function that returns a plain value, not a `std::expected`. If the current state is success, it applies the function and automatically wraps the raw result in a new `std::expected`. If the state is an error, it skips the function and passes the error along.
- `([](int val) { ... })` — a lambda expression passed into `.transform`. It receives the success integer from the previous step.
- `return "The answer is: " + std::to_string(val);` — converts the integer to a string and concatenates it. This plain string return type is intercepted by `.transform` and wrapped into a success state.
- `.or_else` — a monadic method that acts on the *error* channel. If the state is a success, it skips the function. If the state is an error, it unwraps the error and passes it to the provided function. The function must return a `std::expected` matching the success type of the chain.
- `([](const std::string& err) -> std::expected<std::string, std::string> { ... })` — a lambda explicitly returning a new `std::expected`. We use a trailing return type `->` to force the exact match.
- `return "Default answer: -1 (Reason: " + err + ")";` — constructs a fallback success value embedding the original error message. Because it's returned from the `.or_else` lambda, it overrides the error and turns the pipeline back into a success state.

1. `parse_int("XYZ")` — fails, yielding an error holding `"Parse failed: not an integer"`.
2. `.and_then(...)` — skips because of the error.
3. `.transform(...)` — skips because of the error.
4. `.or_else(...)` — sees the error, extracts it, and generates a *success* state holding `"Default answer: -1 (Reason: Parse failed: not an integer)"`.

### CS Lens

This completes the pipeline by mirroring the **Map** and **Catch** paradigms. 
`.transform` is structurally identical to the mathematical `map` functor: applying a pure function `A -> B` to a wrapped `A` to get a wrapped `B`. `.or_else` is the monadic equivalent of a `catch` block, intercepting the failure track and forcing execution back onto the success track.

Also recognized in: JavaScript `Promise.catch()`, Java `Optional.map()`, Rust `.map()` and `.unwrap_or_else()`.

### SE Lens

We engineered this using `.transform` and `.or_else` to achieve **Functional Pipeline Composition**. The alternative not chosen was breaking the chain, inspecting the type, conditionally formatting, or throwing an exception to be caught in `main`. The chosen design centralizes all logic (the happy path *and* the recovery path) into a single expression. This makes the data flow strictly linear top-to-bottom, dramatically lowering the chance of uninitialized variable bugs or unhandled edge cases, because the compiler enforces the type signatures of each chain link.

### Execution and Output

```bash
g++ -std=c++23 math_parser.cpp -o math_parser
./math_parser
```
Output:
```text
Default answer: -1 (Reason: Parse failed: not an integer)
```

### Connection

We have taken a raw string, pushed it through a sequence of failable validations, transformed it, and successfully intercepted an error—all without a single `try`/`catch` block or exception being thrown.

---

## Closing

The pipeline works because `std::expected` forces a dual-channel return type, and the monadic operations act as railway switches. A success value stays on the upper track, passing through `.and_then` and `.transform`. The moment an error occurs, the switch flips to the lower track, bypassing the success operations, until it hits `.or_else` which resolves it.

**What breaks without this:**
If you remove `.or_else` from the chain and change `pipeline_result.value()` back to simply printing `.value()` while passing `"XYZ"`, the code will compile, but crash at runtime. `std::expected::value()` throws a `std::bad_expected_access` exception if called on an error state. `std::expected` guarantees you handle your errors, either intrinsically via monadic chains or explicitly via `.has_value()`.

**Exercises:**
- Modify `divide_100_by` to return `std::unexpected("Number too large")` if the divisor is > 100. Run the pipeline with `"200"` and verify `.or_else` intercepts it.
- Replace `.or_else` with `.transform_error`, which alters the error message but leaves the pipeline in the error state, then use `if (!result.has_value())` to print it.

**Definition of Done:**
- [x] Create a parser that returns `std::expected`.
- [x] Chain it to a division function using `.and_then`.
- [x] Transform success values to strings and catch errors with `.or_else`.
- [x] Commit: `feat: implement zero-overhead math pipeline with std::expected` because we must ensure exception-free operation for hard real-time requirements.
