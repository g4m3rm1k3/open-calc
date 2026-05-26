const EXCEPT_CODE = `#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

// ── Custom exception hierarchy ─────────────────────────────────
class AppError : public runtime_error {
    int code;
public:
    AppError(const string& msg, int c)
        : runtime_error(msg), code(c) {}
    int errorCode() const { return code; }
};

class DatabaseError : public AppError {
public:
    DatabaseError(const string& msg)
        : AppError("DB: " + msg, 500) {}
};

class ValidationError : public AppError {
public:
    ValidationError(const string& msg)
        : AppError("Validation: " + msg, 400) {}
};

// ── Function that can throw ────────────────────────────────────
double safeDivide(double a, double b) {
    if (b == 0) throw invalid_argument("Division by zero");
    return a / b;
}

vector<int> getElement(const vector<int>& v, size_t i) {
    if (i >= v.size())
        throw out_of_range("Index " + to_string(i) + " >= size " + to_string(v.size()));
    return {v[i]};
}

void processUser(const string& name, int age) {
    if (name.empty())     throw ValidationError("name cannot be empty");
    if (age < 0 || age > 150) throw ValidationError("age out of range: " + to_string(age));
    cout << "User OK: " << name << ", age " << age << endl;
}

// __OUTPUT__: --- Basic exception handling ---\\n10 / 2 = 5\\nCaught: Division by zero\\n--- Standard exceptions ---\\nCaught out_of_range: Index 10 >= size 3\\n--- Custom exceptions ---\\nUser OK: Alice, age 30\\nCaught AppError [400]: Validation: age out of range: -1\\n--- Exception in destructor? No! ---\\nResource acquired\\nResource released\\n--- Finally pattern with RAII ---\\nLock acquired\\nWork done\\nLock released (always)

int main() {
    // ── Basic try/catch/throw ──────────────────────────────────
    cout << "--- Basic exception handling ---" << endl;
    try {
        cout << "10 / 2 = " << safeDivide(10, 2) << endl;
        cout << safeDivide(5, 0) << endl;   // throws
    } catch (const invalid_argument& e) {
        cout << "Caught: " << e.what() << endl;
    }

    // ── Standard library exceptions ───────────────────────────
    cout << "--- Standard exceptions ---" << endl;
    try {
        vector<int> v = {1, 2, 3};
        auto r = getElement(v, 10);   // throws out_of_range
    } catch (const out_of_range& e) {
        cout << "Caught out_of_range: " << e.what() << endl;
    }

    // ── Custom exception hierarchy ────────────────────────────
    cout << "--- Custom exceptions ---" << endl;
    vector<pair<string,int>> users = {{"Alice", 30}, {"Bob", -1}};
    for (auto& [name, age] : users) {
        try {
            processUser(name, age);
        } catch (const AppError& e) {
            cout << "Caught AppError [" << e.errorCode() << "]: " << e.what() << endl;
        }
    }

    // ── RAII ensures cleanup even under exceptions ─────────────
    cout << "--- Exception in destructor? No! ---" << endl;
    struct Resource {
        Resource()  { cout << "Resource acquired" << endl; }
        ~Resource() { cout << "Resource released" << endl; }
    };
    try {
        Resource r;
        // even if we throw, ~Resource() runs
    } catch (...) {}

    // ── Finally pattern: RAII lock ────────────────────────────
    cout << "--- Finally pattern with RAII ---" << endl;
    struct Lock {
        Lock()  { cout << "Lock acquired"           << endl; }
        ~Lock() { cout << "Lock released (always)"  << endl; }
    };
    {
        Lock lk;
        cout << "Work done" << endl;
    }   // lk destructs here regardless

    return 0;
}`;

const lesson = {
  id: "cpp-1-007",
  slug: "exceptions",
  chapter: "cpp-1",
  order: 7,
  title: "Exceptions and Error Handling",
  subtitle: "Propagate errors automatically up the call stack with C++ exceptions",
  tags: ["c++", "cpp", "exceptions", "try-catch", "throw", "error-handling", "noexcept", "custom-exceptions"],
  aliases: [
    "c++ exceptions",
    "c++ try catch",
    "c++ throw",
    "c++ error handling",
    "c++ custom exception",
    "c++ noexcept",
  ],

  hook: `Error codes get lost. Return values for errors mix error state with data. Exceptions give you a third path: when a function encounters a condition it can't handle, it *throws* — and the error propagates automatically up the call stack until some caller catches it. No manual propagation, no ignored error codes, no null returns. And because C++ destructors run on stack unwinding, RAII objects clean up automatically even when exceptions fly.`,

  mentalModel: [
    "**Throw, propagate, catch.** `throw expr` creates an exception object and begins *stack unwinding* — the runtime pops stack frames one by one, running destructors of all local objects, until it finds a `catch` block that matches the exception type. If no `catch` matches, `std::terminate()` is called (program aborts). A `catch(...)` catches anything.",
    "**Catch by const reference.** `catch (const std::exception& e)` catches `e` by reference — no copy, and you get the virtual `what()` dispatch even if the thrown type is a derived class. Catching by value causes *object slicing* (same problem as value-slicing in inheritance). Always `catch (const SomeException& e)`.",
    "**`noexcept` marks functions that never throw.** `void f() noexcept` is a promise: if `f` throws, `std::terminate` is called immediately. The compiler can optimize `noexcept` functions more aggressively. Destructors are implicitly `noexcept`. Move constructors should be `noexcept` — otherwise `std::vector` won't use them during reallocation (it falls back to copying for exception safety).",
  ],

  intuition: {
    prose: [
      "**Stack unwinding in detail.** When `throw` executes, the runtime records the exception object, then starts popping stack frames. For each frame popped: all local variables in that frame have their destructors called in reverse construction order (RAII cleanup). Then the runtime checks: does this frame have a matching `catch`? If yes, enter the handler. If no, pop the next frame. This is why RAII is 'exception safe' — destructors always run regardless of how the scope is exited.",
      "**Exception hierarchy design.** Derive your exceptions from `std::exception` or its subclasses (`std::runtime_error`, `std::logic_error`). This lets callers either catch your specific type or use a broad `catch (const std::exception& e)`. Structure them like a class hierarchy: a base `AppError` for all application errors, with derived `DatabaseError`, `ValidationError`, etc. Callers can catch at the granularity they need.",
      "**`try/catch` is not free.** Exception setup has near-zero overhead on the happy path (no exception) in modern ABIs — the cost is paid in code size (unwind tables) not in runtime checks. But *catching* an exception is expensive: stack unwinding, RTTI lookup, handler matching. Exceptions should be exceptional — not used for control flow or performance-critical paths. 'Exceptional' means conditions the caller has no way to prevent (file not found, network timeout, corrupted data).",
      "**The RAII 'finally' pattern.** C++ has no `finally` keyword. You don't need one: a local RAII object whose destructor does the cleanup *is* a finally block. `std::lock_guard` is the canonical example — the mutex is always released whether the function returns normally, via exception, or any other path. This is strictly more powerful than `finally`: the cleanup is tied to the object's lifetime, not a code block.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore exception mechanics:**\n\n1. Compile and run — trace the throw/catch flow\n2. Add a `catch (const exception& e)` after the specific catches — it catches anything derived from exception\n3. Remove a `catch` and let the exception propagate — what happens? (terminate)\n4. Add `noexcept` to `safeDivide` — what happens when it throws? (terminate immediately)\n5. Derive `NetworkError` from `AppError` — catch it with `catch (const AppError&)` — works because it's a base\n6. Add a function with multiple nested try/catch and see which handler fires",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": EXCEPT_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Exception safety guarantees.** Functions are categorized by how they behave when exceptions occur: *No-throw* (never throws, marked `noexcept`); *Strong* (if it throws, state is unchanged — like a transaction); *Basic* (if it throws, the object is in a valid but unspecified state — no leaks, no corruption); *No guarantee* (anything goes). Design toward strong or basic guarantees. The copy-and-swap idiom achieves the strong guarantee for assignment operators.",
      "**`std::terminate` and `noexcept`.** Three things call `terminate`: (1) unhandled exception reaches `main`, (2) exception thrown during stack unwinding (from a destructor), (3) `noexcept` function throws. Destructors are implicitly `noexcept` — throwing from a destructor during unwinding calls `terminate`. This is why destructor bodies must be `try`/`catch`-wrapped if they do anything that could throw.",
      "**`std::exception_ptr` and rethrowing.** `std::current_exception()` captures the active exception into an `exception_ptr` that can be stored and rethrown later — even in a different thread. `std::rethrow_exception(ptr)` throws it. This is how thread pools and `std::future` propagate exceptions: the worker thread captures the exception, the calling thread rethrows it. `throw;` (no operand) inside a catch rethrows the current exception without slicing.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never throw from a destructor",
        body: "If a destructor throws while the stack is already unwinding from another exception, `std::terminate` is called — the program crashes immediately. Wrap destructor bodies in `try { ... } catch (...) {}` if they do anything that might throw. Better: design destructors to be infallible (just release memory and close handles).",
      },
      {
        type: "info",
        title: "Catch order: most-derived first",
        body: "Catch handlers are checked top to bottom. `catch (const AppError&)` will match a `DatabaseError` (which derives from `AppError`). Always put more-derived catch handlers before less-derived ones. If you put `catch (const exception&)` first, it catches everything and the specific handlers below never run.",
      },
      {
        type: "tip",
        title: "Use exceptions for exceptional conditions only",
        body: "Exceptions are for conditions the immediate caller can't prevent or anticipate: missing file, network timeout, corrupted input, out-of-memory. They are NOT for expected control flow (checking if a key exists in a map, validating user input in a tight loop). For expected 'failure' paths, return `std::optional` or `std::expected` (C++23). Reserve exceptions for the truly unexpected.",
      },
    ],
  },

  examples: [
    {
      title: "Custom exception hierarchy with error codes",
      body: `class HttpError : public std::runtime_error {
    int statusCode_;
public:
    HttpError(int code, const std::string& msg)
        : std::runtime_error(msg), statusCode_(code) {}
    int statusCode() const { return statusCode_; }
};

class NotFoundError    : public HttpError {
public: NotFoundError(const std::string& path)
    : HttpError(404, "Not found: " + path) {} };

class UnauthorizedError : public HttpError {
public: UnauthorizedError()
    : HttpError(401, "Unauthorized") {} };

// Callers can catch HttpError for all HTTP errors,
// or specific subclass for fine-grained handling
void handleRequest(const std::string& path, bool auth) {
    if (!auth)                 throw UnauthorizedError{};
    if (path == "/secret")     throw NotFoundError{path};
    std::cout << "OK: " << path << std::endl;
}`,
    },
    {
      title: "Strong exception guarantee with copy-and-swap",
      body: `class SafeArray {
    int* data;
    size_t size;
public:
    SafeArray(size_t n) : data(new int[n]{}), size(n) {}
    ~SafeArray() { delete[] data; }

    // Copy constructor (strong guarantee — new allocation, no side effects)
    SafeArray(const SafeArray& o)
        : data(new int[o.size]), size(o.size) {
        std::copy(o.data, o.data + size, data);
    }

    // Swap — noexcept, just exchanges pointers
    void swap(SafeArray& o) noexcept {
        std::swap(data, o.data);
        std::swap(size, o.size);
    }

    // Copy assignment with strong guarantee: copy-and-swap
    // 1. Make a copy (copy ctor, may throw — but *this is unchanged)
    // 2. Swap with copy (noexcept)
    // 3. Old data destroyed when copy goes out of scope
    SafeArray& operator=(SafeArray o) {   // pass by value = copy
        swap(o);
        return *this;
    }
};`,
    },
    {
      title: "Catching and rethrowing for logging",
      body: `void processFile(const std::string& path) {
    try {
        // ... file operations that may throw ...
        std::ifstream f(path);
        if (!f) throw std::runtime_error("Cannot open: " + path);
        // ... parse ...
    } catch (const std::exception& e) {
        // Log the error with context, then rethrow
        std::cerr << "[ERROR] processFile(" << path << "): "
                  << e.what() << std::endl;
        throw;  // rethrows current exception, no slicing
    }
}

// Caller decides whether to recover or let it propagate further
int main() {
    try {
        processFile("data.txt");
    } catch (const std::runtime_error& e) {
        std::cerr << "Fatal: " << e.what() << std::endl;
        return 1;
    }
}`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Build a safe integer calculator. Define `DivisionByZeroError` and `OverflowError` as custom exceptions inheriting from `std::runtime_error`. Implement `safeAdd(int a, int b)` (throw `OverflowError` if result would overflow `INT_MAX`/`INT_MIN`) and `safeDivide(int a, int b)` (throw `DivisionByZeroError` if b==0). Write a `calculate(string expr)` that parses `\"10 + 5\"`, `\"100 / 0\"`, `\"2000000000 + 2000000000\"` and handles exceptions gracefully.",
      hint: "Check overflow before adding: if `b > 0 && a > INT_MAX - b` it overflows. Include `<climits>` for INT_MAX/INT_MIN.",
      walkthrough: [
        "class DivisionByZeroError : public runtime_error with custom message",
        "class OverflowError : public runtime_error with values in message",
        "safeAdd: check (b > 0 && a > INT_MAX - b) || (b < 0 && a < INT_MIN - b)",
        "safeDivide: if (b == 0) throw DivisionByZeroError",
        "calculate: parse with istringstream, call safe functions, catch and print",
      ],
    },
    {
      difficulty: "hard",
      problem:
        "Implement a `Transaction` class that wraps a vector<int> with strong exception safety. It should support `begin()`, `push(int)`, `commit()`, and `rollback()`. `commit()` applies all pending pushes atomically (either all succeed or none). If `commit()` throws mid-way (simulate with a validator that throws on values > 1000), the original vector is unchanged. Test by committing {1, 2, 3} (success) then {500, 1500, 200} (throws on 1500, original unchanged).",
      hint: "Keep a 'pending' vector separate from 'committed'. `commit()` builds a new combined vector first — only assigns to the committed vector once all validation passes.",
      walkthrough: [
        "Private: vector<int> committed, pending;",
        "push(): add to pending only",
        "commit(): build combined = committed + pending; validate all; then committed = combined; clear pending",
        "rollback(): pending.clear()",
        "Validator: if (v > 1000) throw runtime_error('value too large')",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-007-q1",
        type: "choice",
        text: "What happens to local objects in a stack frame when an exception propagates through it?",
        options: [
          "They are leaked — the destructor is not called",
          "Their destructors are called in reverse construction order (stack unwinding)",
          "They are moved to the heap for later cleanup",
          "They are destroyed only if the exception is caught",
        ],
        answer: 1,
        explanation:
          "Stack unwinding: as an exception propagates through each stack frame, C++ calls the destructor of every local object in that frame in reverse construction order. This is why RAII is exception-safe — cleanup happens automatically regardless of how scope is exited.",
      },
      {
        id: "cpp1-007-q2",
        type: "choice",
        text: "Why should exceptions be caught by const reference (`catch (const std::exception& e)`) rather than by value?",
        options: [
          "Catching by value is not allowed by the C++ standard",
          "Catching by value causes object slicing — the derived type's data is lost and virtual dispatch is broken",
          "Catching by value prevents access to the `what()` method",
          "Catching by reference is slower but more correct",
        ],
        answer: 1,
        explanation:
          "If you `catch (std::exception e)` by value, the thrown object (e.g., a `DatabaseError`) is copied into a `std::exception` value — losing the derived class data and vtable. `e.what()` would call `std::exception::what()` not `DatabaseError::what()`. Catching by `const&` avoids the copy and preserves virtual dispatch.",
      },
      {
        id: "cpp1-007-q3",
        type: "choice",
        text: "What does `noexcept` guarantee, and what happens if a `noexcept` function throws?",
        options: [
          "`noexcept` prevents the function from throwing at compile time; it is a compile error to throw",
          "`noexcept` is a runtime promise; if violated, `std::terminate()` is called immediately",
          "`noexcept` causes the exception to be silently swallowed",
          "`noexcept` means the function can only throw `std::bad_alloc`",
        ],
        answer: 1,
        explanation:
          "`noexcept` is a runtime contract. The compiler doesn't prevent throwing; but if a `noexcept` function does throw, the runtime calls `std::terminate()` immediately — bypassing any try/catch blocks. Destructors are implicitly `noexcept` for this reason.",
      },
      {
        id: "cpp1-007-q4",
        type: "choice",
        text: "Why should catch handlers be ordered from most-derived to least-derived exception types?",
        options: [
          "C++ catches in alphabetical order — derived class names come before base class names",
          "Handlers are checked top-to-bottom; a less-derived base catch will match derived exceptions, preventing specific handlers below it from ever running",
          "The compiler reorders handlers automatically — order doesn't matter",
          "Derived exceptions cannot be caught by base class handlers",
        ],
        answer: 1,
        explanation:
          "Catch handlers are checked in order. If `catch (const std::exception&)` appears before `catch (const DatabaseError&)`, the first handler matches `DatabaseError` (because it derives from `exception`), and the more specific handler never runs. Always order: most specific first, broadest last.",
      },
    ],
  },
};

export default lesson;
