const THROW_CODE = `#include <iostream>
#include <stdexcept>
using namespace std;

// __OUTPUT__: 10/2=5\\nCaught: division by zero

double safeDivide(double a, double b) {
    if (b == 0) throw invalid_argument("division by zero");
    return a / b;
}

int main() {
    try {
        cout << "10/2=" << safeDivide(10, 2) << "\\n";
        cout << safeDivide(5, 0) << "\\n";   // throws
        cout << "never reached\\n";
    } catch (const invalid_argument& e) {
        cout << "Caught: " << e.what() << "\\n";
    }
    return 0;
}`;

const STD_EXCEPT_CODE = `#include <iostream>
#include <stdexcept>
#include <vector>
using namespace std;

// __OUTPUT__: out_of_range: index 10 >= size 3\\nruntime_error: connection failed\\nbad_alloc or other: ...

int main() {
    // out_of_range — for index/key violations
    try {
        vector<int> v = {1,2,3};
        if (10 >= v.size()) throw out_of_range("index 10 >= size 3");
    } catch (const out_of_range& e) {
        cout << "out_of_range: " << e.what() << "\\n";
    }

    // runtime_error — for errors detected at runtime
    try {
        throw runtime_error("connection failed");
    } catch (const runtime_error& e) {
        cout << "runtime_error: " << e.what() << "\\n";
    }

    // catch std::exception — catches all standard exceptions
    try {
        throw bad_alloc();
    } catch (const exception& e) {
        cout << "bad_alloc or other: " << e.what() << "\\n";
    }

    return 0;
}`;

const CUSTOM_EXCEPT_CODE = `#include <iostream>
#include <stdexcept>
using namespace std;

// __OUTPUT__: OK: Alice age 30\\nValidationError [400]: age out of range: -1

class AppError : public runtime_error {
    int code;
public:
    AppError(string msg, int c) : runtime_error(msg), code(c) {}
    int errorCode() const { return code; }
};

class ValidationError : public AppError {
public:
    ValidationError(string msg) : AppError(msg, 400) {}
};

void validate(string name, int age) {
    if (name.empty()) throw ValidationError("name empty");
    if (age < 0 || age > 150)
        throw ValidationError("age out of range: " + to_string(age));
    cout << "OK: " << name << " age " << age << "\\n";
}

int main() {
    for (auto [n, a] : vector<pair<string,int>>{{"Alice",30},{"Bob",-1}}) {
        try {
            validate(n, a);
        } catch (const AppError& e) {
            cout << "ValidationError [" << e.errorCode() << "]: " << e.what() << "\\n";
        }
    }
    return 0;
}`;

const UNWIND_CODE = `#include <iostream>
#include <stdexcept>
using namespace std;

// __OUTPUT__: Lock acquired\\nwork in progress...\\nLock released\\nCaught: something went wrong

class Lock {
public:
    Lock()  { cout << "Lock acquired\\n"; }
    ~Lock() { cout << "Lock released\\n"; }  // runs even on exception
};

void doWork() {
    Lock lk;
    cout << "work in progress...\\n";
    throw runtime_error("something went wrong");
    // Lock destructor still runs — stack unwinding guarantees it
}

int main() {
    try {
        doWork();
    } catch (const exception& e) {
        cout << "Caught: " << e.what() << "\\n";
    }
    return 0;
}`;

const lesson = {
  id: "cpp-1-007",
  slug: "exceptions",
  chapter: "cpp-1",
  order: 7,
  title: "Exceptions",
  subtitle: "throw, try, catch — handle errors without obscuring normal flow",
  tags: ["c++", "cpp", "exceptions", "throw", "catch", "try", "runtime_error", "exception-safety"],
  aliases: [
    "c++ exceptions",
    "c++ try catch",
    "c++ throw",
    "c++ exception handling",
    "c++ custom exceptions",
  ],

  hook: `Error codes litter every call site and are easy to ignore. Exceptions separate the error-handling path from the normal path. When something goes wrong deep in a call stack, an exception unwinds back to wherever you're prepared to handle it — and RAII guarantees cleanup along the way.`,

  mentalModel: [
    "**`throw` creates an exception object and unwinds the call stack.** Control jumps to the nearest enclosing `catch` that matches the thrown type. All stack frames between the throw and the catch are unwound — destructors run, resources are released.",
    "**`catch (const T& e)` catches exceptions by reference.** Catch by const reference to avoid slicing (derived types caught as base). Catch in order from most-derived to most-base — the first matching catch wins. `catch (const exception& e)` catches all standard exceptions.",
    "**C++ exception hierarchy: `exception` → `runtime_error` / `logic_error` → specific types.** Derive your custom exceptions from standard ones so callers can catch them with existing catch blocks. `e.what()` returns the error message.",
  ],

  intuition: {
    prose: [
      "**throw/try/catch is a structured goto.** The thrown object carries information about the error. The catch block handles it. Normal control flow doesn't need to check error codes — the exception jumps past everything between the error and the handler.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Basic throw/catch — run it then explore:**\n\n- What happens to the `cout << \"never reached\"` line? (skipped — exception jumps past it)\n- Add a `catch (...)` block — catches anything that falls through.\n- What if the throw happens before the try block? (uncaught exception, program terminates)\n- Try `throw 42` — you can throw any type, but catching it requires matching `catch (int e)`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": THROW_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Standard exceptions — run it then explore:**\n\n- Catch `runtime_error` with `catch (const exception& e)` instead — does it still work? (yes — polymorphism)\n- Add `catch (...)` after the specific catches — what does it do?\n- Try `v.at(10)` instead of the manual throw — what exception does it throw?\n- Add multiple catch blocks for the same try — which one runs?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STD_EXCEPT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Custom exceptions carry structured data.** A bare `runtime_error(\"age invalid\")` only has a message string. A `ValidationError` with an HTTP-style `errorCode()` lets callers make programmatic decisions. Derive from standard exceptions so `catch (const exception&)` still works as a catch-all.",
      "**Stack unwinding + RAII = exception safety.** When an exception is thrown, the stack unwinds back to the matching catch. Every local variable's destructor runs during unwind. This is why RAII-based resource management (smart pointers, file streams, locks) is safe under exceptions — the cleanup happens automatically.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Custom exceptions — run it then explore:**\n\n- Add a `DatabaseError : public AppError` with code 500. Throw it from a `connectDB()` function.\n- Catch `DatabaseError` specifically before `AppError` — which catch wins for each?\n- Try `catch (const runtime_error& e)` — does it catch ValidationError? (yes, because AppError extends runtime_error)\n- Add `noexcept` to `validate` — then throw inside it. What happens? (terminate is called)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CUSTOM_EXCEPT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Stack unwinding with RAII — run it then explore:**\n\n- Does the Lock destructor run before or after the catch block? (before — during unwind)\n- Add a second Lock inside doWork — do both destructors run?\n- Remove the try/catch in main — program terminates, but do destructors still run? (implementation-defined — usually yes)\n- Add `Lock lk2` outside doWork in main — does it get destroyed if doWork throws?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": UNWIND_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never throw from a destructor",
        body: "If an exception is already being thrown (stack unwinding) and a destructor throws another exception, `std::terminate` is called — no cleanup, program dies. Mark destructors `noexcept` (the default since C++11). Any cleanup in a destructor must not throw.",
      },
      {
        type: "tip",
        title: "Catch by const reference to prevent slicing",
        body: "`catch (const exception& e)` catches all exceptions derived from `exception` and preserves the derived type's `what()`. `catch (exception e)` copies by value — a derived type is sliced to the base, losing overridden `what()`. Always use `const&` in catch.",
      },
    ],
  },

  examples: [
    {
      title: "Standard exception hierarchy",
      body: `// std::exception
//   ├── logic_error
//   │   ├── invalid_argument
//   │   ├── out_of_range
//   │   └── domain_error
//   └── runtime_error
//       ├── range_error
//       └── overflow_error

try {
    throw out_of_range("index 42 out of range");
} catch (const logic_error& e) {
    cout << "logic: " << e.what();    // catches it — out_of_range IS-A logic_error
} catch (const exception& e) {
    cout << "other: " << e.what();    // fallback — never reached here
}`,
    },
    {
      title: "Exception-safe function",
      body: `// Strong exception guarantee: either succeeds fully or throws with no side effects
void transferFunds(Account& from, Account& to, double amount) {
    if (amount <= 0) throw invalid_argument("amount must be positive");
    if (from.balance() < amount) throw runtime_error("insufficient funds");

    // Both operations needed for consistency
    from.debit(amount);
    try {
        to.credit(amount);
    } catch (...) {
        from.credit(amount);   // undo debit if credit fails
        throw;                 // re-throw the original exception
    }
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write `double parseDouble(const string& s)` that uses `stod(s)` but catches `invalid_argument` and `out_of_range` — returning 0.0 for invalid input and printing an error. Test with `\"3.14\"`, `\"abc\"`, `\"1e999\"` (overflow), and `\"\"` (empty).",
      hint: "`stod` throws `invalid_argument` for non-numeric input and `out_of_range` for overflow. Catch both separately.",
      walkthrough: [
        "try { return stod(s); }",
        "catch (const invalid_argument&) { cerr << \"invalid: \" << s; return 0; }",
        "catch (const out_of_range&) { cerr << \"overflow: \" << s; return 0; }",
        "Test with 4 cases",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a `Result<T>` type (simplified) that holds either a value or an error message, without using exceptions. `Result<T>` has `bool ok`, `T value`, `string error`. Write `Result<double> divide(double a, double b)` and `Result<int> parseInt(string s)`. Compose them: parse two strings, divide, handle errors at each step.",
      hint: "struct Result { bool ok; T value; string error; }; static Result success(T v) {...}; static Result fail(string e) {...};",
      walkthrough: [
        "template<typename T> struct Result { bool ok; T value; string error; };",
        "static Result<T> success(T v) { return {true, v, \"\"}; }",
        "static Result<T> fail(string e) { return {false, {}, e}; }",
        "divide: if b==0 return fail('div by zero'); return success(a/b);",
        "parseInt: try stoi; catch return fail",
        "Main: chain results, check ok at each step",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-007-q1",
        type: "choice",
        text: "What happens to local variables between a `throw` and the matching `catch`?",
        options: [
          "They remain valid until the program ends",
          "Their destructors run during stack unwinding",
          "They are immediately zeroed out",
          "It depends on whether they are on the heap",
        ],
        answer: 1,
        explanation:
          "Stack unwinding runs the destructor of every local variable in every stack frame between the throw and the catch. This is why RAII works under exceptions — resource cleanup in destructors is guaranteed.",
      },
      {
        id: "cpp1-007-q2",
        type: "choice",
        text: "Why catch by `const reference` (`catch (const exception& e)`) rather than by value?",
        options: [
          "References are faster to catch",
          "Catching by value slices derived types — the derived class's what() is lost",
          "The exception object doesn't exist on the stack",
          "const prevents re-throwing",
        ],
        answer: 1,
        explanation:
          "Catching by value copies the exception — if it's a derived type, the copy is sliced to the base class. The derived class's overridden `what()` is lost. Catching by `const&` preserves the full derived type.",
      },
      {
        id: "cpp1-007-q3",
        type: "choice",
        text: "Given catches for both `ValidationError` and `AppError` (its base), which must come first?",
        options: [
          "AppError — base classes must always be caught first",
          "ValidationError — more-derived types must be caught before less-derived ones",
          "Either order — the most specific one is always tried first",
          "It depends on the compiler",
        ],
        answer: 1,
        explanation:
          "Catch blocks are tried in order. If `AppError` comes first, it catches `ValidationError` exceptions too (because `ValidationError IS-A AppError`). The `ValidationError` catch is never reached. Catch most-derived types first.",
      },
      {
        id: "cpp1-007-q4",
        type: "choice",
        text: "What does `noexcept` on a function declaration mean?",
        options: [
          "The function cannot be called if exceptions are active",
          "The function promises not to throw — if it does, std::terminate is called",
          "The function automatically catches all exceptions internally",
          "The function's exceptions are ignored by the caller",
        ],
        answer: 1,
        explanation:
          "`noexcept` is a promise that the function won't throw. If it does throw, `std::terminate` is called immediately — no catch can handle it. The optimizer can generate better code for `noexcept` functions. Destructors and move constructors should be `noexcept`.",
      },
    ],
  },
};

export default lesson;
