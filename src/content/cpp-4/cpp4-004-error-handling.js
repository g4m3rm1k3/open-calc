const EXCEPTION_CODE = `#include <iostream>
#include <stdexcept>
#include <system_error>
using namespace std;

// __OUTPUT__: caught: file not found\\ncaught system error: No such file or directory\\nfinally: cleanup done

void open_file(const string& path) {
    if (path.empty())
        throw invalid_argument("path cannot be empty");
    if (path == "missing.txt")
        throw runtime_error("file not found");
}

int main() {
    // Standard exception hierarchy: exception → runtime_error, logic_error, etc.
    try {
        open_file("missing.txt");
    } catch (const runtime_error& e) {
        cout << "caught: " << e.what() << "\\n";
    } catch (const exception& e) {
        cout << "base caught: " << e.what() << "\\n";
    }

    // system_error: OS-level errors with error code
    try {
        throw system_error(make_error_code(errc::no_such_file_or_directory));
    } catch (const system_error& e) {
        cout << "caught system error: " << e.what() << "\\n";
    }

    // RAII for cleanup — no finally needed
    cout << "finally: cleanup done\\n";

    return 0;
}`;

const CUSTOM_EXCEPTION_CODE = `#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

// __OUTPUT__: DatabaseError: connection refused (code 1001)\\nNetworkError: timeout\\ncaught as AppError

struct AppError : public runtime_error {
    int code;
    AppError(const string& msg, int code)
        : runtime_error(msg), code(code) {}
};

struct DatabaseError : AppError {
    DatabaseError(const string& msg, int code)
        : AppError("DatabaseError: " + msg, code) {}
};

struct NetworkError : AppError {
    NetworkError(const string& msg)
        : AppError("NetworkError: " + msg, 2000) {}
};

void connect_db() {
    throw DatabaseError("connection refused", 1001);
}

void fetch_data() {
    throw NetworkError("timeout");
}

int main() {
    auto run = [](auto fn) {
        try { fn(); }
        catch (const DatabaseError& e) { cout << e.what() << " (code " << e.code << ")\\n"; }
        catch (const NetworkError& e)  { cout << e.what() << "\\n"; }
        catch (const AppError& e)      { cout << "caught as AppError\\n"; }
    };

    run(connect_db);
    run(fetch_data);
    run([]{ throw AppError("unknown", 9999); });

    return 0;
}`;

const EXPECTED_CODE = `#include <iostream>
#include <variant>
#include <string>
using namespace std;

// __OUTPUT__: parse ok: 42\\nparse error: not a number\\nchained: 84\\nno exception overhead

// Simple Expected<T, E> — C++23 has std::expected
template<typename T, typename E>
struct Expected {
    variant<T, E> data;
    bool ok() const { return holds_alternative<T>(data); }
    T& value() { return get<T>(data); }
    E& error() { return get<E>(data); }
    static Expected success(T v) { return {v}; }
    static Expected fail(E e) { return {e}; }
};

Expected<int, string> parse_int(const string& s) {
    try {
        size_t pos;
        int v = stoi(s, &pos);
        if (pos != s.size()) return Expected<int,string>::fail("extra chars");
        return Expected<int,string>::success(v);
    } catch (...) {
        return Expected<int,string>::fail("not a number");
    }
}

int main() {
    auto r1 = parse_int("42");
    if (r1.ok()) cout << "parse ok: " << r1.value() << "\\n";

    auto r2 = parse_int("hello");
    if (!r2.ok()) cout << "parse error: " << r2.error() << "\\n";

    // Chain: double the parsed value
    auto r3 = parse_int("42");
    int doubled = r3.ok() ? r3.value() * 2 : 0;
    cout << "chained: " << doubled << "\\n";
    cout << "no exception overhead\\n";

    return 0;
}`;

const NOEXCEPT_CODE = `#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

// __OUTPUT__: noexcept move: vector grew efficiently\\nnoexcept swap: O(1)\\nterminates on throw in noexcept

void safe_op() noexcept {
    // Promises: this function never throws
    // If it does throw: std::terminate() is called immediately
    // Used for: destructors, move constructors, swap
}

struct FastBuf {
    vector<int> data;

    // noexcept move ctor: vector can use move instead of copy when reallocating
    FastBuf(FastBuf&& other) noexcept : data(move(other.data)) {}

    // noexcept swap: required for efficient standard algorithms
    void swap(FastBuf& other) noexcept {
        data.swap(other.data);
    }
};

int main() {
    vector<FastBuf> v;
    for (int i = 0; i < 5; i++) {
        FastBuf b; b.data = {i};
        v.push_back(move(b));   // move ctor called — fast because noexcept
    }
    cout << "noexcept move: vector grew efficiently\\n";

    FastBuf a, b;
    a.data = {1, 2}; b.data = {3, 4};
    a.swap(b);
    cout << "noexcept swap: O(1)\\n";

    // std::terminate if noexcept function throws:
    // auto bad = []() noexcept { throw runtime_error("oops"); };
    // bad();  // terminate!
    cout << "terminates on throw in noexcept\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-4-004",
  slug: "error-handling",
  chapter: "cpp-4",
  order: 4,
  title: "Error Handling",
  subtitle: "exceptions, custom exception hierarchies, std::expected, noexcept, error codes",
  tags: ["c++", "cpp", "exceptions", "error handling", "expected", "noexcept", "error_code", "system_error"],
  aliases: [
    "c++ exceptions",
    "c++ error handling",
    "c++ expected",
    "c++ noexcept",
    "c++ custom exceptions",
  ],

  hook: `Error handling is where code gets messy. Error codes scatter if-checks through every call site. Exceptions can be ignored or caught at the wrong level. C++ gives you a full toolkit: exceptions for exceptional conditions, error codes for expected failures, \`noexcept\` for no-failure guarantees, and \`std::expected\` (C++23) for explicit success/failure return types. The right tool depends on the context — performance-critical paths, library APIs, and application code have different requirements.`,

  mentalModel: [
    "**Exceptions are for unexpected errors that cross module boundaries.** They unwind the stack automatically, call destructors (RAII cleanup), and carry structured information. Catch at the level where you can meaningfully handle the error. Don't use exceptions for control flow or expected conditions (empty container, parse failure).",
    "**`noexcept` is a promise — and a contract with the standard library.** If a move constructor is `noexcept`, `std::vector` can use it during reallocation (safe to half-complete a move). If it's not `noexcept`, vector falls back to copy. `noexcept` on destructors is the default and should always be maintained.",
    "**`std::expected<T, E>` makes errors explicit in the type system.** The function returns either a value or an error — the caller must explicitly check. No exception propagation overhead, no silent error ignoring. C++23 standard; use `variant<T, E>` as a polyfill for C++20.",
  ],

  intuition: {
    prose: [
      "**The 'exceptions vs error codes' debate: use both.** In performance-critical hot paths (parsing, codec, game loops), exceptions are expensive — every possible throw site must be tracked. Use error codes or `std::expected`. For application-level code (database queries, file operations, user input), exceptions give clean error propagation through multiple layers without plumbing every intermediate function.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Exceptions and catching — run it then explore:**\n\n- Catch `const exception&` before `const runtime_error&` — which runs? (order matters: first match wins)\n- Throw from a destructor: what happens? (std::terminate if another exception is active)\n- `throw;` (rethrow without args) inside a catch block — re-throws the same exception.\n- `exception_ptr p = current_exception()` — capture and rethrow across threads.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": EXCEPTION_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Custom exception hierarchy — run it then explore:**\n\n- Add a `QueryError : DatabaseError` — caught by DatabaseError handler (polymorphism).\n- `catch (...)` — catches everything — use as last resort with rethrow for logging.\n- `e.code` is only on AppError subclasses — base `exception` doesn't have it.\n- Why inherit from `runtime_error` not `exception` directly? (what() implementation)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CUSTOM_EXCEPTION_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`std::expected` is a value-based alternative to exceptions.** The return type `Expected<int, string>` says: this function either gives you an int or tells you why it failed. No hidden control flow, no exception overhead, and the compiler ensures you handle both cases. C++23 standardizes this as `std::expected<T, E>` with `.value()`, `.error()`, `.and_then()`, and `.transform()` methods.",
      "**`noexcept` affects performance beyond just removing exception tables.** With `noexcept` move constructors, `std::vector` uses moves during reallocation — O(n) moves vs O(n) copies. With `noexcept` on swap, algorithms like `std::sort` can use efficient swap variants. Always mark move constructors, destructors, and swap as `noexcept` when they don't throw.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**std::expected / Expected<T,E> — run it then explore:**\n\n- Chain operations: `parse_int(s).and_then([](int n){ return expected<int,string>{n*2}; })` — map over success.\n- `or_else` for error transformation: `r.or_else([](string e){ return Expected<int,string>::success(-1); })`.\n- Compare: exception version vs expected version — where does each clean up?\n- C++23 `std::expected` has `.transform()`, `.and_then()`, `.transform_error()` — use them.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": EXPECTED_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**noexcept and move semantics — run it then explore:**\n\n- Remove `noexcept` from FastBuf move ctor — does vector still use it? (no — falls back to copy)\n- `static_assert(noexcept(FastBuf(move(a))))` — compile-time check that move is noexcept.\n- `is_nothrow_move_constructible<FastBuf>::value` — same check at runtime.\n- Mark a function `noexcept(noexcept(data.swap(other.data)))` — conditional noexcept.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": NOEXCEPT_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never throw from a destructor",
        body: "If an exception is being propagated and a destructor throws a second exception, `std::terminate()` is called. Destructors are `noexcept` by default in C++11+. If cleanup can fail, log the error and swallow it — destructors must not throw. If you need to report a cleanup failure, use a finalizer pattern that returns an error code.",
      },
      {
        type: "tip",
        title: "Use std::error_code for library APIs",
        body: "`std::error_code` and `std::error_category` are the standard error code system. Unlike plain ints, error codes are typed (category + value), comparable, and convertible to messages via `ec.message()`. Functions can take an `error_code& ec` output parameter — no exception, caller checks ec. This is the pattern used by `<filesystem>` and `<networking>`.",
      },
    ],
  },

  examples: [
    {
      title: "Error propagation with std::expected (C++23)",
      body: `#include <expected>
#include <string>
#include <charconv>

std::expected<int, std::string> parse_int(std::string_view s) {
    int val;
    auto [ptr, ec] = std::from_chars(s.begin(), s.end(), val);
    if (ec != std::errc{})
        return std::unexpected("parse error: " + std::string(s));
    if (ptr != s.end())
        return std::unexpected("trailing chars after: " + std::string(ptr));
    return val;
}

std::expected<int, std::string> double_parse(std::string_view s) {
    return parse_int(s).transform([](int n) { return n * 2; });
}

// Usage:
// auto r = double_parse("21");
// if (r) cout << *r;   // 42
// else   cout << r.error();`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Create a `Result<T>` type using `std::variant<T, std::string>` where the string is the error message. Write `ok()`, `value()`, and `error()` methods. Then write `safe_divide(int a, int b) -> Result<int>` that returns an error on division by zero. Chain two divisions: `safe_divide(100, safe_divide(10, 2).value())`.",
      hint: "`variant<T, string>` with `holds_alternative<T>()`. For chaining, check `ok()` before calling `.value()`.",
      walkthrough: [
        "template<typename T> struct Result { variant<T, string> v; bool ok() { return holds_alternative<T>(v); } T value() { return get<T>(v); } string error() { return get<string>(v); } };",
        "Result<int> safe_divide(int a, int b) { if(b==0) return {string(\"div by zero\")}; return {a/b}; }",
        "auto r = safe_divide(10, 2); if(r.ok()) auto r2 = safe_divide(100, r.value());",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Design an exception hierarchy for a JSON parser: `JsonError` (base) → `ParseError` (syntax error, has line/column), `TypeError` (wrong type accessed, has expected/actual type), `KeyError` (missing key, has key name). Each should include a descriptive `what()`. Write a `parse_json(string)` function that throws the appropriate error for three different inputs.",
      hint: "Inherit each from `std::runtime_error`. Store extra info as members. Format `what()` in the constructor by passing a composed message to `runtime_error()`.",
      walkthrough: [
        "struct ParseError : JsonError { int line, col; ParseError(int l, int c, string msg) : JsonError('Parse error at '+to_string(l)+':'+to_string(c)+': '+msg), line(l), col(c) {} };",
        "struct TypeError : JsonError { string expected, actual; };",
        "struct KeyError : JsonError { string key; };",
        "parse_json(\"{\") → throw ParseError(1, 2, \"expected }\")",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-004-q1",
        type: "choice",
        text: "What happens if a destructor throws during stack unwinding from another exception?",
        options: [
          "The destructor exception is silently discarded",
          "std::terminate() is called — two simultaneous exceptions is unhandled",
          "The original exception is replaced by the destructor exception",
          "The destructor exception propagates normally",
        ],
        answer: 1,
        explanation:
          "During stack unwinding (exception propagating), destructors run. If a destructor throws, there are now two active exceptions — C++ cannot propagate both, so `std::terminate()` is called immediately. Destructors are implicitly `noexcept` in C++11+. Always ensure destructors don't throw; if cleanup can fail, log and swallow the error.",
      },
      {
        id: "cpp4-004-q2",
        type: "choice",
        text: "Why does marking a move constructor `noexcept` matter for `std::vector`?",
        options: [
          "noexcept move constructors run faster by skipping error checks",
          "If the move ctor is not noexcept, std::vector falls back to copying during reallocation to preserve the strong exception guarantee — noexcept allows O(n) moves instead",
          "noexcept is required for move constructors to compile",
          "std::vector only calls move constructors if they are noexcept",
        ],
        answer: 1,
        explanation:
          "`std::vector::push_back` may reallocate. During reallocation, it must copy or move existing elements. If the move ctor might throw, a half-moved vector would be in an inconsistent state — violating the strong exception guarantee. So vector copies (safe: original is intact if copy throws). If the move ctor is `noexcept`, vector moves — faster, no copying.",
      },
      {
        id: "cpp4-004-q3",
        type: "choice",
        text: "When should you use `std::expected<T, E>` instead of exceptions?",
        options: [
          "Always — expected is always better than exceptions",
          "For expected/common failure modes (parse error, file not found, validation failure) where failure is part of normal operation — avoids exception overhead and makes errors explicit in the type",
          "Only in embedded systems where exceptions are disabled",
          "When the error type is an integer",
        ],
        answer: 1,
        explanation:
          "Exceptions are best for unexpected errors that cross many layers (memory allocation failure, OS errors). `std::expected` is better when: failure is a normal outcome (not exceptional), you're in a performance-critical path, or you want the type system to enforce error handling. A JSON parser might 'fail' on every invalid input — that's expected, not exceptional.",
      },
      {
        id: "cpp4-004-q4",
        type: "choice",
        text: "What does `catch (...)` catch?",
        options: [
          "Only std::exception subclasses",
          "Everything — any C++ exception including non-class types like thrown ints, and including exceptions from third-party code",
          "Only runtime_error and its subclasses",
          "Nothing — it's a syntax error",
        ],
        answer: 1,
        explanation:
          "`catch (...)` (three dots, not an ellipsis type) catches everything — any C++ exception, regardless of type. Useful as a last-resort catch in a library boundary (to prevent exceptions from escaping an API that promises no-throw), combined with `throw;` to rethrow after logging, or at main() to print an error before exiting.",
      },
    ],
  },
};

export default lesson;
