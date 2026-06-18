const CONSTEXPR_BASIC_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: factorial(5)=120\\nfib(10)=55\\narray size: 120\\nsqrt(2)=1.414

constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n-1);
}

constexpr int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}

constexpr double sqrt_approx(double x, double guess=1.0, int iter=20) {
    return iter == 0 ? guess
        : sqrt_approx(x, (guess + x/guess)/2.0, iter-1);
}

int main() {
    // Computed at COMPILE TIME — no runtime cost
    constexpr int f = factorial(5);
    cout << "factorial(5)=" << f << "\\n";

    constexpr int fib10 = fib(10);
    cout << "fib(10)=" << fib10 << "\\n";

    // Use constexpr result as array size — must be compile-time constant
    int arr[factorial(5)];   // arr[120]
    cout << "array size: " << sizeof(arr)/sizeof(int) << "\\n";

    constexpr double s = sqrt_approx(2.0);
    cout << "sqrt(2)=" << s << "\\n";

    return 0;
}`;

const CONSTEVAL_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: compile-time pi: 3.14159\\nruntime pow: 8\\nconsteval only: 100\\nif constexpr: int branch

constexpr double PI = 3.14159265358979;

// consteval: MUST be called at compile time
consteval int square(int n) { return n * n; }

// constexpr: can run at compile OR runtime
constexpr int pow2(int n) {
    int result = 1;
    for (int i=0; i<n; i++) result *= 2;
    return result;
}

template<typename T>
void typeDispatch(T val) {
    // if constexpr: branch eliminated at compile time
    if constexpr (is_integral_v<T>)
        cout << "int branch\\n";
    else
        cout << "other branch\\n";
}

int main() {
    cout << "compile-time pi: " << PI << "\\n";

    int n = 3;
    cout << "runtime pow: " << pow2(n) << "\\n";  // runtime

    // square(10) is ALWAYS compile-time
    cout << "consteval only: " << square(10) << "\\n";

    // if constexpr: dead branch not compiled
    cout << "if constexpr: ";
    typeDispatch(42);     // int
    // typeDispatch(3.14); // "other branch"

    return 0;
}`;

const CONSTEXPR_CLASS_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: point (3,4)\\ndist=5\\ncompile-time dist: 5\\nmax: 10

struct Point {
    double x, y;
    constexpr Point(double x, double y) : x(x), y(y) {}
    constexpr double distSq() const { return x*x + y*y; }
};

constexpr double csqrt(double x, double g=1.0, int i=50) {
    return i==0 ? g : csqrt(x, (g+x/g)/2.0, i-1);
}

constexpr Point origin{0,0};
constexpr Point p{3,4};
constexpr double dist = csqrt(p.distSq());  // all compile-time

template<typename T>
constexpr T cmax(T a, T b) { return a > b ? a : b; }

int main() {
    cout << "point (" << p.x << "," << p.y << ")\\n";
    cout << "dist=" << dist << "\\n";

    // Use in static_assert: compile-time guarantee
    static_assert(p.distSq() == 25.0, "Distance squared must be 25");
    cout << "compile-time dist: " << dist << "\\n";

    constexpr int m = cmax(7, 10);
    cout << "max: " << m << "\\n";

    return 0;
}`;

const STATIC_ASSERT_CODE = `#include <iostream>
#include <type_traits>
using namespace std;

// __OUTPUT__: int size: 4\\nfloat is floating: yes\\nstring is trivial: no\\ncustom check: ok

template<typename T>
void requireNumeric() {
    static_assert(is_arithmetic_v<T>,
                  "T must be a numeric type");
}

template<typename T, size_t N>
constexpr T arraySum(const T (&arr)[N]) {
    T total{};
    for (size_t i=0; i<N; i++) total += arr[i];
    return total;
}

int main() {
    // static_assert: compile-time error if condition is false
    static_assert(sizeof(int) >= 4, "int must be at least 4 bytes");
    cout << "int size: " << sizeof(int) << "\\n";

    // Type traits: compile-time type queries
    cout << "float is floating: "
         << (is_floating_point_v<float> ? "yes" : "no") << "\\n";
    cout << "string is trivial: "
         << (is_trivial_v<string> ? "yes" : "no") << "\\n";

    requireNumeric<double>();   // ok
    // requireNumeric<string>(); // compile error: "T must be a numeric type"

    constexpr int arr[] = {1,2,3,4,5};
    static_assert(arraySum(arr) == 15, "Sum must be 15");
    cout << "custom check: ok\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-002",
  slug: "constexpr",
  chapter: "cpp-3",
  order: 2,
  title: "constexpr and Compile-Time Programming",
  subtitle: "Move computation from runtime to compile time — constexpr, consteval, if constexpr, static_assert",
  tags: ["c++", "cpp", "constexpr", "consteval", "static_assert", "if constexpr", "compile-time", "type_traits"],
  aliases: [
    "c++ constexpr",
    "c++ consteval",
    "c++ static_assert",
    "c++ if constexpr",
    "c++ compile-time",
    "c++ type traits",
  ],

  hook: `The compiler knows things at compile time that you'd normally compute at runtime: array sizes, mathematical constants, type properties. \`constexpr\` lets you write ordinary C++ functions that the compiler evaluates during compilation. The result: zero runtime overhead, compile-time errors instead of runtime crashes, and templates that specialize on type properties.`,

  mentalModel: [
    "**`constexpr` functions run at compile time when given `constexpr` arguments.** The same function can run at both compile time and runtime. If called with runtime values, it executes normally. If called in a `constexpr` context (initializing a `constexpr` variable, array size), the compiler evaluates it.",
    "**`consteval` forces compile-time execution.** A `consteval` function must always be called at compile time — calling with runtime arguments is a compile error. Use `consteval` when you want a guarantee that something is computed at compile time (no runtime overhead ever).",
    "**`if constexpr` eliminates dead branches at compile time.** Unlike regular `if`, both branches of `if constexpr` don't need to be valid for all template instantiations — the false branch is discarded before checking for errors. Essential for template specialization within a single function body.",
  ],

  intuition: {
    prose: [
      "**`static_assert` is a compile-time `assert`.** `static_assert(condition, message)` fails to compile if condition is false. Use it to enforce interface contracts, validate template arguments, or express invariants that can be checked at compile time. The error message is shown in the compiler output.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**constexpr functions — run it then explore:**\n\n- Use `factorial(5)` as an array size: `int arr[factorial(5)]` — does it compile? (yes)\n- Change `constexpr int f = factorial(5)` to `int f = factorial(5)` — still works but no compile-time guarantee.\n- Try `constexpr int bad = factorial(-1)` — what happens? (infinite recursion, likely compile error)\n- `constexpr` functions must have at least one `return` — try adding side effects (`cout`). Does it compile?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONSTEXPR_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**consteval and if constexpr — run it then explore:**\n\n- Try `int n = 5; square(n)` — compile error: consteval requires constant.\n- `constexpr int n = 5; square(n)` — works.\n- `if constexpr` dead branch: add `if constexpr (is_same_v<T,int>) { 1/0; }` in the 'other' branch — doesn't cause error for int (branch eliminated).\n- `typeDispatch(3.14)` — which branch executes? What is T?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONSTEVAL_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`constexpr` classes enable compile-time objects.** A class with a `constexpr` constructor and `constexpr` member functions can be fully used at compile time. `constexpr Point p{3,4}; constexpr double d = p.distSq()` — the entire computation happens in the compiler. In C++20, even `vector` and `string` can be `constexpr`.",
      "**Type traits give compile-time type information.** `is_integral_v<T>`, `is_same_v<T,U>`, `is_trivially_copyable_v<T>` are all compile-time boolean constants. Combined with `if constexpr`, they let you write type-specific code paths in a single template without specialization.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**constexpr class — run it then explore:**\n\n- `static_assert(p.distSq() == 25.0)` — if the assertion fails, the compile error includes the message.\n- Change `p{3,5}` — does the static_assert fire? (yes, 9+25≠25)\n- Create a `constexpr array<int,factorial(4)>` — array size computed at compile time.\n- `constexpr auto reflect = Point{-p.x, -p.y}` — reflect point through origin at compile time.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONSTEXPR_CLASS_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**static_assert and type traits — run it then explore:**\n\n- `requireNumeric<string>()` — uncomment and see the compile error with your message.\n- `is_pointer_v<int*>` vs `is_pointer_v<int>` — compile-time type checking.\n- `remove_const_t<const int>` → `int` — type transformation.\n- `static_assert(arraySum(arr) == 15)` — if you change arr, does the assertion fail at compile time?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STATIC_ASSERT_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "tip",
        title: "Use constexpr for mathematical constants",
        body: "`constexpr double PI = 3.14159265358979;` is computed once and inlined everywhere it's used — no memory access, no runtime cost. Prefer `constexpr` over `const` for numeric constants where the value is known at compile time.",
      },
      {
        type: "info",
        title: "C++20: constexpr is more powerful",
        body: "C++20 allows `constexpr` `virtual` functions, `try`/`catch` in constexpr (as long as no exception is thrown), `new`/`delete`, `std::vector` and `std::string` in constexpr contexts. The barrier between compile-time and runtime code is much thinner in C++20.",
      },
    ],
  },

  examples: [
    {
      title: "Compile-time lookup table",
      body: `#include <array>

constexpr auto makeSinTable(int n) {
    std::array<double, 360> table{};
    for (int i = 0; i < n; ++i)
        table[i] = /* compile-time sin approx */;
    return table;
}

// C++20: constexpr std::array with std::sin is allowed
// constexpr auto SIN_TABLE = makeSinTable(360);
// sin(x) → SIN_TABLE[x]  — zero runtime computation, pure table lookup`,
    },
    {
      title: "Type-based dispatch with if constexpr",
      body: `#include <type_traits>
#include <iostream>

template<typename T>
void serialize(const T& val) {
    if constexpr (std::is_arithmetic_v<T>) {
        std::cout << "numeric: " << val << "\\n";
    } else if constexpr (std::is_same_v<T, std::string>) {
        std::cout << "string: \\"" << val << "\\"\\n";
    } else {
        std::cout << "unknown type\\n";
    }
}
// No virtual dispatch, no runtime overhead
// Dead branches are eliminated by the compiler`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `constexpr bool isPrime(int n)` that determines if n is prime at compile time. Use `static_assert(isPrime(7))` and `static_assert(!isPrime(9))` to verify. Then create a `constexpr array<bool,20>` sieve indicating which numbers 0-19 are prime.",
      hint: "Check divisibility from 2 to sqrt(n) using a for loop in constexpr. `constexpr bool sieve[20]` initialized with `{0, 0, isPrime(2), ...}` or a helper constexpr function.",
      walkthrough: [
        "constexpr bool isPrime(int n) { if (n<2) return false; for (int i=2; i*i<=n; i++) if(n%i==0) return false; return true; }",
        "static_assert(isPrime(7) && !isPrime(9));",
        "constexpr auto makeSieve = []() constexpr { array<bool,20> s{}; for (int i=0; i<20; i++) s[i]=isPrime(i); return s; };",
        "constexpr auto sieve = makeSieve();",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a `TypeList<Ts...>` template with compile-time operations: `size()` returns the count of types, `contains<T>()` returns whether T is in the list, `index_of<T>()` returns the index. All must be `constexpr`. Test with `TypeList<int,double,string>`: size=3, contains<double>=true, index_of<string>=2.",
      hint: "Use recursive templates or fold expressions. `contains<T>()`: `(is_same_v<T,Ts> || ...)`. `index_of<T>()`: recursive with counter.",
      walkthrough: [
        "template<typename... Ts> struct TypeList { static constexpr size_t size() { return sizeof...(Ts); } };",
        "template<typename T> static constexpr bool contains() { return (is_same_v<T,Ts> || ...); }",
        "index_of: recursive helper counting non-matches",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-002-q1",
        type: "choice",
        text: "When does a `constexpr` function actually run at compile time?",
        options: [
          "Always — constexpr functions always run at compile time",
          "When called in a constexpr context (e.g., initializing a constexpr variable or as a template argument)",
          "Never — constexpr is just a hint to the compiler",
          "Only when optimization is enabled",
        ],
        answer: 1,
        explanation:
          "A `constexpr` function runs at compile time when the context requires a compile-time constant — `constexpr int x = f(5)`, array size `int arr[f(5)]`, or template argument `std::array<int, f(5)>`. With runtime arguments or in a regular assignment, it runs at runtime like any function.",
      },
      {
        id: "cpp3-002-q2",
        type: "choice",
        text: "What is the difference between `constexpr` and `consteval`?",
        options: [
          "They are identical",
          "constexpr can run at compile or runtime; consteval must always run at compile time",
          "consteval is faster than constexpr",
          "constexpr is for variables; consteval is for functions",
        ],
        answer: 1,
        explanation:
          "`constexpr` functions are *allowed* to run at compile time but can also run at runtime. `consteval` functions *must* always be called at compile time — a call with runtime arguments is a compile error. Use `consteval` when you want to guarantee zero runtime overhead.",
      },
      {
        id: "cpp3-002-q3",
        type: "choice",
        text: "Why use `if constexpr` instead of regular `if` in templates?",
        options: [
          "if constexpr is faster at runtime",
          "if constexpr discards the false branch before type-checking — allowing code that would be invalid for some types to exist in the branch",
          "Regular if doesn't work inside templates",
          "if constexpr allows non-boolean conditions",
        ],
        answer: 1,
        explanation:
          "With a regular `if`, both branches must compile for every template instantiation. With `if constexpr`, the false branch is completely discarded — it's not type-checked. This allows you to write `if constexpr (is_integral_v<T>) { /* uses integer ops */ } else { /* uses float ops */ }` without the integer branch breaking float instantiations.",
      },
      {
        id: "cpp3-002-q4",
        type: "choice",
        text: "What does `static_assert(sizeof(int) >= 4, \"message\")` do?",
        options: [
          "Prints the message at runtime if the condition is false",
          "Causes a compile error with the message if sizeof(int) < 4",
          "Throws an exception if sizeof(int) < 4",
          "Asserts at runtime like assert()",
        ],
        answer: 1,
        explanation:
          "`static_assert` is evaluated at compile time. If the condition is false, compilation fails with the message as the error. If true, no code is generated — zero runtime overhead. It's used to enforce architectural constraints, validate template arguments, and document assumptions about the platform.",
      },
    ],
  },
};

export default lesson;
