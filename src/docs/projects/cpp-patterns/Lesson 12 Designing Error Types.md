# Lesson 12: Designing Error Types

What you will build
We will build a series of isolated failure-reporting structures to demonstrate how C++ handles errors across boundaries. We are examining how to represent failure states using strong enums, context-rich structs, and the standard library's `<system_error>` machinery, solving the fragility of bare integer return codes and differentiating when to recover versus when to crash.

What you need to know first
- C++ From Scratch series (`enum class`, `struct`, virtual functions, `<iostream>`)
- Lesson 11 (`std::expected`)

Terms used in this lesson
- **Bare Integer Error Code** — a design pattern where failures are returned as generic integers (`-1`, `404`). It exists to provide low-overhead signaling, but fails in C++ because integers lack type safety and meaning.
- **Strong Enum** — a scoped enumeration (`enum class`) that does not implicitly convert to an integer. It exists to force the compiler to enforce type boundaries between different enumerations.
- **Contextual Error** — an error representation that carries dynamic state (like a filename or line number) alongside the failure reason. It exists to provide actionable diagnostics to the caller.
- **Recoverable Error** — a failure state (like missing configuration or invalid user input) that the calling code is expected to anticipate and handle. It exists to be routed and mitigated without terminating the process.
- **Unrecoverable Error** — a failure state (like a null pointer dereference or corrupted memory) representing a broken program invariant. It exists to terminate the process immediately because safe execution is no longer possible.

Objects and methods used
- **`std::expected`**
  - *What it is:* A standard vocabulary type holding either a valid result or an error value.
  - *Implementation:* `template<class T, class E> class expected;`
  - *Its use:* We use it to return our custom error types predictably without using exceptions.
- **`std::error_category`**
  - *What it is:* A standard base class defining a specific domain of errors.
  - *Implementation:* `class error_category { virtual const char* name() const noexcept = 0; virtual std::string message(int ev) const = 0; }`
  - *Its use:* We subclass it to map our custom enums to human-readable strings.
- **`std::error_code`**
  - *What it is:* A standard type pairing an integer error value with a pointer to its `std::error_category`.
  - *Implementation:* `class error_code { int val_; const error_category* cat_; }`
  - *Its use:* We use it as a uniform, non-allocating error type that can erase the specific enum type while retaining its domain.
- **`std::abort`**
  - *What it is:* A standard library function that terminates the program immediately.
  - *Implementation:* `[[noreturn]] void abort() noexcept;`
  - *Its use:* We call it to forcefully halt execution when encountering an unrecoverable error.

Everything else in the file, not this lesson's subject but still explained
- **`std::string`**
  - *What it is:* A standard library string type.
  - *Implementation:* `class basic_string;`
  - *Its use:* Used to hold dynamic diagnostic messages in our context-rich error structs.

---

## Concept Unit: The Failure of Bare Integer Error Codes

### The Problem
When a function fails, it must communicate that failure to the caller. Historically, C and early C++ used bare integers as return codes to signal success or failure. This fails because integers carry no type safety and no inherent meaning, allowing the caller to easily ignore the error or mistake it for a valid result.

### Isolate the Concept
We run a simple function returning an integer error code to see how easily it can be misused.
```cpp
#include <iostream>

int parseConfiguration() {
    // -1 represents "file not found"
    return -1; 
}

int main() {
    int result = parseConfiguration();
    // The compiler allows this dangerous arithmetic on an error code
    std::cout << "Result doubled: " << (result * 2) << "\n";
    return 0;
}
```
Output:
```text
Result doubled: -2
```
This proves that the compiler treats the error code exactly like normal data. This is called **in-band error signaling**, where the error shares the same type as valid data.

### Discard the Throwaway
This file is deleted. We will not use bare integers for errors.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the baseline anti-pattern.
- **Files affected:** `legacy_error.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```cpp
int processData() {
    return 404; // 404 represents "not found"
}
```

### The Updated Project
```cpp
#include <iostream>

int processData() {
    return 404; // 404 represents "not found"
}

int main() {
    int status = processData();
    if (status != 0) {
        std::cout << "Error: " << status << "\n";
    }
    return 0;
}
```
This structure calls a function that returns an integer and checks if it is non-zero, printing the raw integer if it is.

### Mechanical Walkthrough
1. `int` — the return type of the function. It is a fundamental signed integer type. It provides no information about whether it represents a count, an index, or a failure.
2. `processData()` — the function declaration. It accepts no arguments.
3. `return 404;` — returns an integer literal. The meaning of `404` is entirely undocumented in the type system; the caller must rely on external documentation to know what it means.
4. `int status = processData();` — stores the result. The type `int` allows `status` to be passed into any math function or array subscript operator without warning.
5. `if (status != 0)` — a conditional check assuming `0` means success. This is a convention, not a rule enforced by the language.
6. `std::cout << "Error: " << status << "\n";` — prints the integer to standard output. The user sees `Error: 404`, which is opaque and unhelpful.

### CS Lens
This embodies **In-band Signaling**, where control information (the error state) and data share the same channel and type.
Also recognized in: C standard library functions (like `getchar()` returning `-1` for EOF), sentinel values in algorithms, and early Unix system calls.

### SE Lens
The design principle violated here is **Type Safety**. The alternative chosen was using a generic `int` for performance and simplicity, avoiding the overhead of complex objects. The maintenance cost is high: callers routinely forget to check the error code or accidentally use the error code as valid data, leading to silent data corruption or out-of-bounds memory accesses further down the line.

### Commands Needed
```bash
g++ -std=c++20 legacy_error.cpp -o legacy_error
```
Compiles the C++ source file `legacy_error.cpp` into an executable named `legacy_error` using the C++20 standard.

### Run It
```bash
./legacy_error
```
Output:
```text
Error: 404
```

### Connection
Because bare integers provide no safety and no meaning, we need a mechanism that forces errors to be a distinct, incompatible type.

---

## Concept Unit: Strong Error Enums

### The Problem
If we use integers, the compiler cannot stop us from mixing up error codes with math or confusing one library's error codes with another's. We need a way to declare a closed set of failure reasons that cannot be implicitly converted to or from integers.

### Isolate the Concept
We define a scoped enumeration to represent our errors.
```cpp
#include <iostream>

enum class ParseError {
    MissingFile,
    InvalidSyntax
};

void printError(ParseError err) {
    if (err == ParseError::MissingFile) {
        std::cout << "File is missing.\n";
    }
}

int main() {
    printError(ParseError::MissingFile);
    return 0;
}
```
Output:
```text
File is missing.
```
This proves that the error is explicitly named and scoped. This is called a **strong enum**.

### Discard the Throwaway
This minimal isolation is discarded. We will now apply it to a function returning a result.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to build a safe error boundary.
- **Files affected:** `enum_error.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** `<expected>` from C++23 (or supported in C++20 extensions).

### The New Code
```cpp
enum class ConfigError {
    NotFound,
    PermissionDenied
};

std::expected<int, ConfigError> loadConfig() {
    return std::unexpected(ConfigError::NotFound);
}
```

### The Updated Project
```cpp
#include <iostream>
#include <expected>

// ← new
enum class ConfigError {
    NotFound,
    PermissionDenied
};

std::expected<int, ConfigError> loadConfig() {
    return std::unexpected(ConfigError::NotFound);
}
// ← new

int main() {
    auto result = loadConfig();
    if (!result.has_value()) {
        if (result.error() == ConfigError::NotFound) {
            std::cout << "Configuration not found.\n";
        }
    }
    return 0;
}
```
This structure defines a strong enum for configuration errors and returns it wrapped in a `std::expected`. The caller checks for an error and explicitly matches the enum value.

### Mechanical Walkthrough
1. `enum class ConfigError` — declares a scoped enumeration. Unlike a plain `enum`, the values inside are strongly typed and scoped to `ConfigError`.
2. `{ NotFound, PermissionDenied };` — the closed set of exact failure states. They have no implicit integer value exposed to the programmer.
3. `std::expected<int, ConfigError>` — a standard library template that holds either the expected success type (`int`) or the error type (`ConfigError`). It forces the caller to acknowledge both possibilities.
4. `loadConfig()` — the function declaration.
5. `return std::unexpected(ConfigError::NotFound);` — constructs an error state. `std::unexpected` is a wrapper that tells `std::expected` to initialize its error channel instead of its value channel.
6. `auto result = loadConfig();` — calls the function, storing the `std::expected` object.
7. `if (!result.has_value())` — checks if the expected object contains an error.
8. `if (result.error() == ConfigError::NotFound)` — accesses the error channel via `.error()` and compares it safely. Because `ConfigError` is an `enum class`, comparing it to an integer or a different enum type would cause a compiler error.
9. `std::cout << "Configuration not found.\n";` — prints a hardcoded message based on the typed error.

### CS Lens
This embodies **Algebraic Data Types**, specifically a Sum Type (or disjoint union), where a type can be exactly one of a constrained set of variants (Success OR Error).
Also recognized in: Rust's `Result` type, Haskell's `Either`, Swift's `Result`, network protocol state machines.

### SE Lens
The design principle here is **Make Invalid State Unrepresentable**. The alternative was returning an integer, which allows millions of invalid states (what does error `999` mean?). By using `enum class`, the compiler guarantees that only `NotFound` or `PermissionDenied` can ever be returned as an error, eliminating entire categories of boundary bugs.

### Commands Needed
```bash
g++ -std=c++20 enum_error.cpp -o enum_error
```
Compiles the application.

### Run It
```bash
./enum_error
```
Output:
```text
Configuration not found.
```

### Connection
Strong enums prevent type confusion, but they carry no dynamic data: an enum tells us *that* a file was not found, but it cannot tell us *which* file was missing.

---

## Concept Unit: Rich Error Types for Context

### The Problem
An `enum class` is a static identifier. When parsing a 10,000-line configuration file, returning `ConfigError::InvalidSyntax` is useless because it doesn't tell the caller *where* the syntax error occurred. We need an error type that carries dynamic state.

### Isolate the Concept
We define a struct that holds both an error code and runtime context.
```cpp
#include <iostream>
#include <string>

enum class ParseError { Syntax };

struct DetailedError {
    ParseError code;
    std::string context;
    int line;
};

int main() {
    DetailedError err = {ParseError::Syntax, "Missing semicolon", 42};
    std::cout << "Error at line " << err.line << ": " << err.context << "\n";
    return 0;
}
```
Output:
```text
Error at line 42: Missing semicolon
```
This proves that an error can act as a standard data container. This is called a **Contextual Error**.

### Discard the Throwaway
We delete this isolated struct. We will now integrate a rich error type into our parser function.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to build context-aware diagnostics.
- **Files affected:** `rich_error.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** `<string>`, `<expected>`.

### The New Code
```cpp
struct ParseContextError {
    ConfigError code;
    std::string filename;
    int lineNumber;
};

std::expected<void, ParseContextError> parseLine() {
    return std::unexpected(ParseContextError{
        ConfigError::InvalidSyntax, "server.cfg", 15
    });
}
```

### The Updated Project
```cpp
#include <iostream>
#include <string>
#include <expected>

enum class ConfigError {
    NotFound,
    InvalidSyntax
};

// ← new
struct ParseContextError {
    ConfigError code;
    std::string filename;
    int lineNumber;
};

std::expected<void, ParseContextError> parseLine() {
    return std::unexpected(ParseContextError{
        ConfigError::InvalidSyntax, "server.cfg", 15
    });
}
// ← new

int main() {
    auto result = parseLine();
    if (!result.has_value()) {
        const auto& err = result.error();
        std::cout << "Failed in " << err.filename 
                  << " at line " << err.lineNumber << "\n";
    }
    return 0;
}
```
This structure replaces the bare enum with a struct holding the enum alongside a string and an integer, providing the caller with exact diagnostic context when the function fails.

### Mechanical Walkthrough
1. `struct ParseContextError` — defines a custom data structure for our error.
2. `ConfigError code;` — embeds the strong enum we defined earlier. The caller can still `switch` on this for logic routing.
3. `std::string filename;` — a standard dynamically allocated string holding the name of the file that caused the error.
4. `int lineNumber;` — an integer storing exactly where the parser failed.
5. `std::expected<void, ParseContextError>` — the return type. `void` means the function produces no value on success, only success itself, but produces a `ParseContextError` on failure.
6. `parseLine()` — the function declaration.
7. `return std::unexpected(...)` — triggers the error channel of the `std::expected`.
8. `ParseContextError{ ConfigError::InvalidSyntax, "server.cfg", 15 }` — uses uniform initialization (brace initialization) to instantly construct the struct with its three members.
9. `const auto& err = result.error();` — retrieves the error object by `const` reference, avoiding an unnecessary copy of the `std::string` inside it.
10. `std::cout << ...` — accesses `err.filename` and `err.lineNumber` to print a highly specific diagnostic message.

### CS Lens
This embodies **Out-of-Band Diagnostics**, where the error type encapsulates a payload of telemetry data rather than just a minimal signal, separating the *category* of the error (for logic routing) from the *context* of the error (for human debugging).
Also recognized in: HTTP response bodies containing JSON error details, Java's Exception stack traces, compiler diagnostic ASTs.

### SE Lens
The design principle here is **Observability**. The alternative is dropping the file and line data and returning only `InvalidSyntax`, which saves memory (no `std::string` allocation). The tradeoff is that when this runs in production, an `InvalidSyntax` log with no filename is impossible to debug. We pay the cost of allocating a string on the error path to make the system maintainable.

### Commands Needed
```bash
g++ -std=c++20 rich_error.cpp -o rich_error
```
Compiles the context-rich error example.

### Run It
```bash
./rich_error
```
Output:
```text
Failed in server.cfg at line 15
```

### Connection
Rich error types are perfect for predictable, anticipated failures like bad user input. But not all errors should be caught and logged; some mean the program's fundamental logic is broken.

---

## Concept Unit: Recoverable vs. Unrecoverable Errors

### The Problem
If a network request times out, we want to retry it — that is a recoverable error. If our code tries to dereference a null pointer because of a logic bug, retrying won't fix it; the program's internal state is corrupted. Returning a `std::expected` for a logic bug forces callers to handle states that should never exist. We need to distinguish between errors we report, and errors that kill the process.

### Isolate the Concept
We force a hard termination using the standard library's abort function.
```cpp
#include <iostream>
#include <cstdlib>

void checkPointer(int* ptr) {
    if (ptr == nullptr) {
        std::cout << "Fatal logic bug: null pointer. Terminating.\n";
        std::abort();
    }
    std::cout << "Pointer is valid.\n";
}

int main() {
    int* p = nullptr;
    checkPointer(p);
    return 0;
}
```
Output:
```text
Fatal logic bug: null pointer. Terminating.
```
This proves that we can instantly halt the program without returning an error to the caller. This is called an **Unrecoverable Error**.

### Discard the Throwaway
This file is discarded. We will now apply the distinction in our parser.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `recoverable.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** `<cstdlib>`.

### The New Code
```cpp
std::expected<void, ConfigError> processBuffer(const char* buffer) {
    if (buffer == nullptr) {
        std::abort(); // Unrecoverable: logic bug
    }
    
    return std::unexpected(ConfigError::InvalidSyntax); // Recoverable
}
```

### The Updated Project
```cpp
#include <iostream>
#include <expected>
#include <cstdlib>

enum class ConfigError { InvalidSyntax };

// ← new
std::expected<void, ConfigError> processBuffer(const char* buffer) {
    if (buffer == nullptr) {
        std::abort(); // Unrecoverable: logic bug
    }
    
    return std::unexpected(ConfigError::InvalidSyntax); // Recoverable
}
// ← new

int main() {
    const char* badInput = "invalid_data";
    auto result = processBuffer(badInput);
    if (!result.has_value()) {
        std::cout << "Recovered from syntax error.\n";
    }

    std::cout << "Triggering unrecoverable error...\n";
    processBuffer(nullptr);
    return 0;
}
```
This structure demonstrates both paths: an anticipated user-data error that is returned safely as a **Recoverable Error**, and a developer logic bug that triggers an **Unrecoverable Error** via `std::abort()`.

### Mechanical Walkthrough
1. `processBuffer(const char* buffer)` — a function that expects a valid memory buffer to parse.
2. `if (buffer == nullptr)` — a check for a broken contract. The caller is legally required to provide a valid pointer. If it's null, the programmer made a mistake, not the user.
3. `std::abort();` — a standard library function that instantly terminates the process. It does not throw an exception, it does not unwind the stack, and it cannot be caught. It is a hard crash.
4. `return std::unexpected(ConfigError::InvalidSyntax);` — the alternative path. If the buffer is valid but the text inside it is garbled, that is an environmental failure (bad input). We return it as an expected enum so the caller can recover.
5. `auto result = processBuffer(badInput);` — executes the recoverable path. The program logs it and continues.
6. `processBuffer(nullptr);` — executes the unrecoverable path. The program dies immediately.

### CS Lens
This embodies the **Fail-Fast** principle. When a system's internal state becomes untrustworthy (a broken invariant), halting immediately prevents the corruption from cascading into databases, filesystems, or security vulnerabilities.
Also recognized in: Rust's `panic!`, assertions in C, hardware memory-protection faults.

### SE Lens
The design principle here is **Contract Enforcement**. The alternative is returning a `ConfigError::NullPointer` to the caller. That is a terrible design because it forces every layer of the application to check for and route an error that represents a developer typo. By aborting, we shift the failure from runtime error-handling logic back to the developer's debugging session, where bugs belong.

### Commands Needed
```bash
g++ -std=c++20 recoverable.cpp -o recoverable
```
Compiles the mixed-failure application.

### Run It
```bash
./recoverable
```
Output:
```text
Recovered from syntax error.
Triggering unrecoverable error...
```
*(The program then exits with an OS-level abort signal).*

### Connection
We now have strong enums, context structs, and aborts. But what if we are building a library that needs to interoperate with the standard library's network or file system errors? Returning our custom enum means our errors don't mix with standard ones.

---

## Concept Unit: `std::error_code` and `std::error_category`

### The Problem
If our project uses `ConfigError`, but the networking library returns `std::errc::connection_refused`, we cannot store them in the same `std::expected` type. We need a type-erased container that can hold *any* library's error code uniformly, without allocating memory like a rich struct would.

### Isolate the Concept
We create a custom category and map our enum to `std::error_code`.
```cpp
#include <iostream>
#include <system_error>

enum class DbError { Locked = 1 };

class DbCategory : public std::error_category {
public:
    const char* name() const noexcept override { return "Database"; }
    std::string message(int ev) const override {
        if (ev == 1) return "Database is locked";
        return "Unknown";
    }
};

const DbCategory& getDbCategory() {
    static DbCategory instance;
    return instance;
}

int main() {
    std::error_code ec(static_cast<int>(DbError::Locked), getDbCategory());
    std::cout << ec.category().name() << " error: " << ec.message() << "\n";
    return 0;
}
```
Output:
```text
Database error: Database is locked
```
This proves we can bundle an integer code with a category object to give it identity and strings. This is called the **Error Code Pattern**.

### Discard the Throwaway
This manual construction is discarded. The standard library expects us to overload a specific function to make this automatic.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition adapting our enum to the C++ standard library's error facility.
- **Files affected:** `system_error.cpp` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** `<system_error>`.

### The New Code
```cpp
enum class ConfigError { NotFound = 1 };

namespace std {
    template <> struct is_error_code_enum<ConfigError> : true_type {};
}

std::error_code make_error_code(ConfigError e) {
    static struct : std::error_category {
        const char* name() const noexcept override { return "Config"; }
        std::string message(int ev) const override {
            return ev == 1 ? "File not found" : "Unknown";
        }
    } cat;
    return {static_cast<int>(e), cat};
}
```

### The Updated Project
```cpp
#include <iostream>
#include <system_error>
#include <expected>

// ← new
enum class ConfigError { NotFound = 1 };

namespace std {
    template <> struct is_error_code_enum<ConfigError> : true_type {};
}

std::error_code make_error_code(ConfigError e) {
    static struct : std::error_category {
        const char* name() const noexcept override { return "Config"; }
        std::string message(int ev) const override {
            return ev == 1 ? "File not found" : "Unknown";
        }
    } cat;
    return {static_cast<int>(e), cat};
}
// ← new

std::expected<void, std::error_code> loadSystem() {
    // Implicitly calls make_error_code
    return std::unexpected(ConfigError::NotFound); 
}

int main() {
    auto result = loadSystem();
    if (!result.has_value()) {
        std::error_code ec = result.error();
        std::cout << "[" << ec.category().name() << "] " 
                  << ec.message() << "\n";
    }
    return 0;
}
```
This structure registers our custom `ConfigError` enum with the C++ `<system_error>` machinery, allowing it to be implicitly converted into a standard `std::error_code` that carries its category and string representation.

### Mechanical Walkthrough
1. `enum class ConfigError { NotFound = 1 };` — our strong enum, now assigned a specific integer value.
2. `namespace std { template <> struct is_error_code_enum<ConfigError> : true_type {}; }` — we open the `std` namespace and specialize a type trait. This tells the compiler, "Yes, `ConfigError` is legally allowed to be converted into a `std::error_code`."
3. `std::error_code make_error_code(ConfigError e)` — the exact factory function signature the standard library looks for via Argument-Dependent Lookup (ADL) when converting our enum.
4. `static struct : std::error_category { ... } cat;` — creates an anonymous struct inheriting from `std::error_category`, and immediately instantiates a `static` instance of it named `cat`. It is static so there is exactly one instance in the entire program, making pointer comparisons fast.
5. `const char* name() const noexcept override` — overrides the base class virtual method to return a domain name string (`"Config"`).
6. `std::string message(int ev) const override` — overrides the method that converts the raw integer (`ev`) back into a human-readable string (`"File not found"`).
7. `return {static_cast<int>(e), cat};` — constructs the `std::error_code`, pairing the integer value of the enum with a reference to our singleton category.
8. `std::expected<void, std::error_code>` — the function now returns a universal `std::error_code` instead of our custom enum.
9. `return std::unexpected(ConfigError::NotFound);` — the compiler sees an enum, sees the `is_error_code_enum` trait is true, and automatically calls `make_error_code` for us.
10. `ec.category().name()` and `ec.message()` — the caller invokes standard methods on the `std::error_code` to retrieve our custom strings, entirely agnostic to the fact that it came from `ConfigError`.

### CS Lens
This embodies **Type Erasure**. The caller only knows about `std::error_code` and `std::error_category`. The specific enum type (`ConfigError`) has been erased, but its behavior (how to stringify it) is preserved dynamically via the virtual methods on the category pointer.
Also recognized in: `std::function`, Java interfaces, polymorphism in device drivers.

### SE Lens
The design principle here is **Interoperability**. The alternative is forcing the caller to write a giant `std::variant<ConfigError, NetworkError, FsError>` to hold all possible failure types. By adopting `std::error_code`, a single application can seamlessly combine failures from the OS, standard libraries, and our custom code into a single, uniform error-handling pipeline.

### Commands Needed
```bash
g++ -std=c++20 system_error.cpp -o system_error
```
Compiles the application.

### Run It
```bash
./system_error
```
Output:
```text
[Config] File not found
```

### Connection
By registering our strong enums with `std::error_category`, we achieve the type safety of an enum, the string diagnostics of a rich struct, and the zero-allocation performance of an integer, fully integrating with standard C++ boundaries.

---

## Closing

We have built a sequence of tools for signaling failure across application boundaries. A user inputs bad data, generating a `ConfigError::InvalidSyntax`. This is wrapped in a `ParseContextError` with the exact line number, returned as a **Recoverable Error** via `std::expected`. At the top level, it is converted into a `std::error_code` and logged via `ec.message()`. Meanwhile, an internal null pointer triggers `std::abort()`, immediately halting the process as an **Unrecoverable Error**.

### What breaks without this
If we remove the `is_error_code_enum` trait from the last unit:
```cpp
// namespace std { template <> struct is_error_code_enum<ConfigError> : true_type {}; }
```
```text
error: no viable conversion from 'std::unexpected<ConfigError>' to 'std::expected<void, std::error_code>'
```
The compiler refuses to implicitly convert the enum, preventing us from accidentally passing un-registered integers as error codes. Type safety is preserved.

### Exercises
1. Expand the `ParseContextError` to include a `std::string_view` of the exact bad token instead of just the line number.
2. Add a `PermissionDenied` error to `ConfigError` and implement its string conversion in the `error_category`.
3. Try catching a `std::abort()` with a `try { ... } catch(...) { ... }` block to prove to yourself that unrecoverable errors cannot be intercepted.

### Definition of Done
- [x] Bare integers are rejected for error states due to lack of type safety.
- [x] Anticipated failures are returned as strong enums.
- [x] Diagnostic context is packaged in rich error structs.
- [x] Contract violations use `std::abort()` to fail fast.
- [x] Custom enums are wired into `std::error_code` for standard interoperability.

```bash
git commit -m "Adopt strong enums and std::error_code for type-safe failure routing"
```
