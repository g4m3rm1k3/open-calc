const VARS_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: --- Integer types ---\\nint i = 42\\nlong long big = 9000000000\\nsize = int:4 double:8 char:1 bool:1\\n--- Floating point ---\\ndouble pi = 3.14159\\nfloat approx = 3.14159 (less precise)\\n--- Text and logic ---\\nchar grade = 'A'\\nbool passed = 1\\nstring name = Alice\\n--- auto deduction ---\\nauto x = 100 (int)\\nauto y = 2.718 (double)\\n--- const ---\\nconst double TAX_RATE = 0.13

int main() {
    // ── Integer types ──────────────────────────────────────────
    int i = 42;
    long long big = 9000000000LL;
    cout << "--- Integer types ---" << endl;
    cout << "int i = " << i << endl;
    cout << "long long big = " << big << endl;
    cout << "size = int:" << sizeof(int)
         << " double:" << sizeof(double)
         << " char:"   << sizeof(char)
         << " bool:"   << sizeof(bool) << endl;

    // ── Floating-point ─────────────────────────────────────────
    double pi = 3.14159265358979;
    float  approx = 3.14159265358979f;   // f suffix = float literal
    cout << "--- Floating point ---" << endl;
    cout << "double pi = "    << pi     << endl;
    cout << "float approx = " << approx << " (less precise)" << endl;

    // ── Text and booleans ──────────────────────────────────────
    char   grade  = 'A';
    bool   passed = true;
    string name   = "Alice";
    cout << "--- Text and logic ---" << endl;
    cout << "char grade = "  << grade  << endl;
    cout << "bool passed = " << passed << endl;  // prints 0 or 1
    cout << "string name = " << name   << endl;

    // ── auto keyword ───────────────────────────────────────────
    auto x = 100;        // compiler deduces int
    auto y = 2.718;      // compiler deduces double
    cout << "--- auto deduction ---" << endl;
    cout << "auto x = " << x << " (int)"    << endl;
    cout << "auto y = " << y << " (double)" << endl;

    // ── const ──────────────────────────────────────────────────
    const double TAX_RATE = 0.13;
    cout << "--- const ---" << endl;
    cout << "const double TAX_RATE = " << TAX_RATE << endl;
    // TAX_RATE = 0.15;  // ← compiler error: cannot assign to const

    return 0;
}`;

const lesson = {
  id: "cpp-0-002",
  slug: "variables-and-types",
  chapter: "cpp-0",
  order: 2,
  title: "Variables and Types",
  subtitle: "Store data in memory: integers, doubles, booleans, characters, strings",
  tags: ["c++", "cpp", "variables", "types", "int", "double", "string", "auto", "const"],
  aliases: [
    "c++ variables",
    "c++ data types",
    "int double char bool",
    "c++ string",
    "auto keyword c++",
  ],

  hook: `Every program stores data in memory. Variables give names to memory locations, and types tell the compiler how many bytes to allocate and what operations are legal. C++ is statically typed: the compiler knows every variable's type at compile time, which is why it generates such fast code — no type-checking at runtime.`,

  mentalModel: [
    "A **variable** is a named memory location. `int x = 5;` tells the compiler: reserve 4 bytes, name them `x`, and store the bit pattern for 5 there. Every subsequent use of `x` reads from or writes to those same bytes.",
    "**Types constrain operations.** `int / int` performs integer division (truncates). `double / double` performs floating-point division. The type system prevents you from accidentally mixing apples and oranges — or flags the conversion explicitly.",
    "**`auto` asks the compiler to deduce the type** from the initializer. `auto x = 42;` makes `x` an `int`. `auto y = 42.0;` makes `y` a `double`. Use `auto` when the type is obvious from context; spell out the type when clarity matters.",
  ],

  intuition: {
    prose: [
      "C++ has a small set of **fundamental types** built into the language. Integer types (`int`, `long long`, `short`, `unsigned int`) store whole numbers. Floating-point types (`double`, `float`) store approximations of real numbers using IEEE 754 binary encoding. `char` stores a single character as its ASCII code. `bool` stores `true` (1) or `false` (0).",
      "**`sizeof` is your ruler.** `sizeof(int)` returns 4 on nearly all modern 64-bit systems — meaning an `int` occupies 4 bytes = 32 bits, so it can represent values from −2 147 483 648 to 2 147 483 647. `sizeof(double)` returns 8 (64-bit double). Understanding sizes prevents overflow surprises and informs how much memory your data structures use.",
      "`std::string` is not a fundamental type — it's a class in the standard library that manages heap-allocated character arrays for you. Include `<string>` to use it. You can concatenate strings with `+`, compare them with `==`, get their length with `.length()`, and index individual characters with `[i]`. Unlike C-style `char` arrays, `std::string` handles memory automatically.",
      "**`const` is a contract.** Declaring `const double PI = 3.14159` tells the compiler (and every reader) that this value never changes. The compiler enforces it — any assignment to `PI` after initialization is a compile error. Use `const` liberally: it documents intent, catches bugs, and enables optimizations.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Try these experiments:**\n\n1. Compile and run to see all output\n2. Change `int i = 42` to `int i = 2147483647` — that's `INT_MAX`. Now add 1 (`i + 1`) and print: what happens? (overflow wraps around)\n3. Try `auto z = 'X'` — what type does it deduce?\n4. Uncomment the `TAX_RATE = 0.15` line and try to compile: read the error\n5. Try `sizeof(long long)` vs `sizeof(int)` — what's the difference?",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": VARS_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Integer overflow is undefined behavior in C++.** Adding 1 to `INT_MAX` (2 147 483 647) for a signed `int` doesn't wrap around cleanly — it's *undefined behavior*, meaning the compiler can assume it never happens and optimize accordingly, producing surprising results. To avoid this, use `long long` for large values or the `<limits>` header: `std::numeric_limits<int>::max()`. For truly arbitrary integers, use a library.",
      "**Floating-point is not exact.** `0.1 + 0.2 == 0.3` is `false` in C++. IEEE 754 represents real numbers in base 2, and most decimal fractions can't be represented exactly — they round to the nearest representable value. Never compare floats with `==`; instead use `std::abs(a - b) < epsilon` for some small tolerance. `double` gives 15–17 significant decimal digits; `float` gives only 6–9.",
      "**Initialization vs assignment.** C++ has three initialization syntaxes: `int x = 5;` (copy-init), `int x(5);` (direct-init), and `int x{5};` (brace-init, C++11). Prefer `int x{5}` — it's the most uniform and prevents narrowing conversions: `int x{3.14}` is a compile error, but `int x = 3.14` silently truncates. For local variables with no initializer like `int x;`, the value is *indeterminate* (garbage) — always initialize.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Uninitialized variables hold garbage",
        body: "`int x;` does NOT set `x` to 0. It holds whatever bytes happened to be in that memory location. Reading an uninitialized variable is undefined behavior. Always write `int x = 0;` or `int x{};` (zero-initializes to 0).",
      },
      {
        type: "info",
        title: "C++ fixed-width integer types",
        body: "For portable, exact-size integers, use `<cstdint>`: `int32_t` (exactly 32 bits), `int64_t` (exactly 64 bits), `uint8_t` (8-bit unsigned). These guarantee the same size on every platform — important for file formats, network protocols, and embedded systems.",
      },
      {
        type: "tip",
        title: "String literals vs char arrays",
        body: '`"hello"` is a C-style string literal (a `const char*` pointing to read-only memory). `std::string s = "hello"` copies it into a heap-managed object. Use `std::string` in modern C++ — it\'s safer, composable with `+`, and handles memory for you.',
      },
    ],
  },

  examples: [
    {
      title: "Type sizes and limits",
      body: `#include <iostream>
#include <climits>    // INT_MAX, LLONG_MAX
#include <cfloat>     // DBL_MAX, FLT_EPSILON
using namespace std;

int main() {
    cout << "int:       " << sizeof(int)       << " bytes, max = " << INT_MAX  << endl;
    cout << "long long: " << sizeof(long long) << " bytes, max = " << LLONG_MAX << endl;
    cout << "double:    " << sizeof(double)    << " bytes" << endl;
    cout << "float eps: " << FLT_EPSILON << endl;  // smallest representable difference
    return 0;
}`,
    },
    {
      title: "String operations",
      body: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string first = "Alice";
    string last  = "Smith";
    string full  = first + " " + last;   // concatenation

    cout << full << endl;                     // Alice Smith
    cout << full.length() << endl;            // 11
    cout << full[0] << endl;                  // A
    cout << full.substr(6, 5) << endl;        // Smith (start, length)
    cout << full.find("Smith") << endl;       // 6 (index)

    if (first == "Alice") cout << "Hello, Alice!" << endl;
    return 0;
}`,
    },
    {
      title: "Brace initialization prevents narrowing",
      body: `// int x = 3.7;    // silently truncates to 3 (legal but lossy)
// int x{3.7};       // COMPILE ERROR: narrowing conversion — good!

int a{42};           // OK: exact integer
double b{3.14};      // OK
// int c{3.14};      // ERROR caught at compile time

// Zero-initialize with empty braces
int zero{};          // = 0
double d{};          // = 0.0
std::string s{};     // = ""`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Declare variables for a student record: name (string), age (int), GPA (double), enrolled (bool). Print them all with labels. Then try changing `enrolled` to `const bool enrolled = true;` and verify the compiler stops you from reassigning it.",
      hint: "Use `const bool enrolled = true;` and then try `enrolled = false;` below it.",
      walkthrough: [
        "Declare each variable with an appropriate type and sensible test value",
        "Print each variable with cout using labels like `Name: Alice`",
        "Add `const bool enrolled = true;` and then try to assign `enrolled = false;` below",
        "The compile error you get is the compiler enforcing your const contract",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Demonstrate integer overflow. Declare `int x = 2147483647` (INT_MAX). Print `x`, then print `x + 1`, then print `x * 2`. What values do you see? Now change `x` to `long long` — does overflow still occur?",
      hint: "The value wraps to a large negative number. With long long, the maximum is 9 223 372 036 854 775 807.",
      walkthrough: [
        "Start with `int x = 2147483647` — this is the largest representable int (2^31 - 1)",
        "Print `x + 1` — you should see −2147483648 (overflow wraps around for signed int)",
        "Change the type to `long long x = 2147483647LL` — now `x + 1` works correctly",
        "The lesson: always pick a type large enough for your expected range",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-002-q1",
        type: "choice",
        text: "What does `int x;` initialize `x` to?",
        options: [
          "0",
          "nullptr",
          "An indeterminate (garbage) value",
          "−1",
        ],
        answer: 2,
        explanation:
          "Local variables with no initializer hold whatever bytes happened to be in that stack memory. This is undefined behavior when read. Always write `int x = 0;` or `int x{};`.",
      },
      {
        id: "cpp0-002-q2",
        type: "choice",
        text: "Which initialization syntax prevents narrowing conversions at compile time?",
        options: [
          "`int x = 3.7;`",
          "`int x(3.7);`",
          "`int x{3.7};`",
          "All three prevent it",
        ],
        answer: 2,
        explanation:
          "Brace-initialization `{...}` (C++11 uniform initialization) rejects narrowing conversions with a compile error. `int x{3.7}` fails to compile. The other forms silently truncate to 3.",
      },
      {
        id: "cpp0-002-q3",
        type: "choice",
        text: "What type does `auto x = 42.0f;` deduce?",
        options: ["double", "float", "int", "long double"],
        answer: 1,
        explanation:
          "The `f` suffix makes `42.0f` a `float` literal (not `double`). `auto` deduces `float`. Without the `f`, `42.0` is a `double` literal.",
      },
      {
        id: "cpp0-002-q4",
        type: "choice",
        text: "Why is `0.1 + 0.2 == 0.3` false in C++?",
        options: [
          "C++ has a bug in its + operator",
          "IEEE 754 floating-point cannot represent 0.1 or 0.2 exactly in binary",
          "The == operator doesn't work for doubles",
          "You need to include <cmath> first",
        ],
        answer: 1,
        explanation:
          "0.1 and 0.2 have no exact binary representation (like 1/3 in decimal). The sum rounds slightly off from the stored approximation of 0.3. Compare floats with `abs(a - b) < 1e-9` instead.",
      },
    ],
  },
};

export default lesson;
