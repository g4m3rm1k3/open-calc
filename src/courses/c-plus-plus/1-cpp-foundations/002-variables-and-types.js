const INT_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: a = 42\\nb = -7\\nsum = 35\\nproduct = -294\\na / b = -6\\na % b = 0

int main() {
    int a = 42;
    int b = -7;

    cout << "a = "       << a     << endl;
    cout << "b = "       << b     << endl;
    cout << "sum = "     << a + b << endl;
    cout << "product = " << a * b << endl;
    cout << "a / b = "   << a / b << endl;
    cout << "a % b = "   << a % b << endl;

    return 0;
}`;

const FLOAT_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 7 / 2 = 3\\n7.0 / 2 = 3.5\\npi = 3.14159\\nprecision trap: 0.30000000000000004

int main() {
    // Integer division truncates — this surprises beginners
    cout << "7 / 2 = "   << 7 / 2   << endl;   // 3, not 3.5
    cout << "7.0 / 2 = " << 7.0 / 2 << endl;   // 3.5

    double pi = 3.14159265358979;
    cout << "pi = " << pi << endl;

    // 0.1 cannot be stored exactly in binary
    double x = 0.1 + 0.2;
    cout << "precision trap: " << x << endl;

    return 0;
}`;

const AUTO_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: count = 0\\nname = Alice\\ntemp = 36.6\\nflag = 1\\nPI = 3.14159

int main() {
    // auto: compiler deduces type from the initial value
    auto count = 0;                // int
    auto name  = string("Alice");  // std::string
    auto temp  = 36.6;             // double
    auto flag  = true;             // bool

    cout << "count = " << count << endl;
    cout << "name = "  << name  << endl;
    cout << "temp = "  << temp  << endl;
    cout << "flag = "  << flag  << endl;

    // const: value locked after initialization
    const double PI = 3.14159;
    cout << "PI = " << PI << endl;

    // PI = 3.0;  // ← compile error: assignment to const

    return 0;
}`;

const SIZES_CODE = `#include <iostream>
#include <climits>
using namespace std;

// __OUTPUT__: sizeof(int) = 4\\nsizeof(double) = 8\\nsizeof(char) = 1\\nINT_MAX = 2147483647\\nOverflow wraps: -2147483648\\n'A' as int = 65

int main() {
    cout << "sizeof(int) = "    << sizeof(int)    << endl;
    cout << "sizeof(double) = " << sizeof(double) << endl;
    cout << "sizeof(char) = "   << sizeof(char)   << endl;

    cout << "INT_MAX = " << INT_MAX << endl;

    // Signed overflow: silently wraps around
    int overflow = INT_MAX + 1;
    cout << "Overflow wraps: " << overflow << endl;

    // char is just a small integer — 'A' is ASCII 65
    char letter = 'A';
    cout << "'A' as int = " << (int)letter << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-002",
  slug: "variables-and-types",
  chapter: "cpp-0",
  order: 2,
  title: "Variables and Types",
  subtitle: "Store numbers, text, and truth values — the type determines what your data can do",
  tags: ["c++", "cpp", "variables", "int", "double", "bool", "auto", "const", "overflow"],
  aliases: [
    "c++ variables",
    "c++ int double",
    "c++ auto keyword",
    "c++ const",
    "c++ data types",
    "c++ integer overflow",
  ],

  hook: `Every program manipulates data. Before you can manipulate it, you store it in a variable — and the type you choose determines what operations are valid, how much memory it uses, and what happens at the edges. Get the type wrong and \`7/2\` gives you \`3\`, not \`3.5\`.`,

  mentalModel: [
    "**The type determines what the bits mean.** `int x = 65` and `char c = 65` store the same bits, but `cout << c` prints `A` while `cout << x` prints `65`. Every type is a contract: these operations are legal, this is the range, this is the meaning.",
    "**Integer division truncates — no rounding.** `7 / 2` is `3` in C++. If either operand is a `double`, the result is `double`: `7.0 / 2` is `3.5`. This surprises almost every beginner at least once.",
    "**`auto` deduces, `const` forbids change.** `auto x = 3.14` makes `x` a `double` — the compiler infers from the right side. `const double PI = 3.14` locks `PI` permanently; any reassignment is a compile error.",
  ],

  intuition: {
    prose: [
      "**Integers first.** `int` is the default whole-number type — 32 bits, range roughly ±2 billion. Arithmetic works as expected except for two traps: integer division truncates toward zero, and overflow wraps silently. Run the code and experiment — change the values, push them to the limits.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it, then explore:**\n\n- What does `%` (modulo) actually compute? Try `10 % 3`, `15 % 4`.\n- Try `a / b` with `b = 5`. Does it round or truncate?\n- Set `a = 2147483647` and add 1. What do you get? Include `<climits>` and use `INT_MAX`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": INT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**The integer division trap:**\n\n- Run it. Why does `7 / 2` give `3` but `7.0 / 2` gives `3.5`?\n- Fix it a third way: cast — `(double)7 / 2`.\n- Can you ever make `0.1 + 0.2` print exactly `0.3`? Why not?\n- Add: `bool equal = (0.1 + 0.2 == 0.3); cout << equal;` — what prints?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FLOAT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Floating-point is binary, not decimal.** `0.1` in decimal is a repeating fraction in binary — like `1/3` in decimal. It gets stored as the closest representable value. Tiny rounding errors accumulate. Never use `==` to compare floats; use `abs(a - b) < epsilon`.",
      "**Signed integer overflow is undefined behavior.** The C++ standard says signed overflow can do anything — the compiler assumes it never happens and optimizes accordingly. On most hardware it wraps (INT_MAX + 1 → INT_MIN), but never rely on it. Use `long long` for large values.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**auto, const, and type sizes:**\n\n- Run it. Add `auto z = 42;` — use `sizeof(z)` to confirm it's an int (4 bytes).\n- Try to reassign `PI = 3.0;` — read the compiler error carefully.\n- Change `auto temp = 36.6;` to `auto temp = 36.6f;` — use `sizeof` to see the difference.\n- Add `long long big = 9000000000LL;` — print it and its size.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": AUTO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Sizes, limits, and overflow — run and observe:**\n\n- Change `INT_MAX + 1` to `INT_MAX + 1LL` (64-bit addition). No overflow!\n- Change `char letter = 'A'` to `'Z'` — what number is it?\n- Add `unsigned int u = 0; u -= 1;` — unsigned wraps differently than signed. What do you get?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SIZES_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never compare floats with ==",
        body: "`if (x == 0.3)` is almost always wrong — floating-point representation errors mean `0.1 + 0.2` is not exactly `0.3`. Use `fabs(x - 0.3) < 1e-9` or restructure to avoid equality comparison entirely.",
      },
      {
        type: "tip",
        title: "Use long long for anything that might exceed 2 billion",
        body: "`int` maxes out around 2.1 billion. Population counts, file sizes, timestamps, and loop counters over large arrays can all exceed this. `long long` goes to 9.2 × 10^18. When in doubt, use `long long` — it has the same speed as `int` on 64-bit systems.",
      },
    ],
  },

  examples: [
    {
      title: "Declaring and using variables",
      body: `int age = 25;
double height = 1.75;   // meters
char initial = 'M';
bool isStudent = true;
string name = "Alice";  // #include <string>

// sizeof shows memory usage
cout << sizeof(int)    << endl;  // 4
cout << sizeof(double) << endl;  // 8`,
    },
    {
      title: "auto and const in practice",
      body: `auto count = 0;        // int — deduced from 0
auto ratio = 1.0 / 3;  // double — one operand is double

const int MAX_RETRIES = 3;   // can never change
const double TAX = 0.13;

// const is good style for values that shouldn't change:
// it documents intent and catches accidental reassignment`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Create a student record with four variables: `name` (string), `age` (int), `gpa` (double), `enrolled` (bool). Initialize each, then print them with labels. Change `age` to use `auto` and verify it still compiles.",
      hint: "Include `<string>`. Print with `cout << \"Name: \" << name << endl;`",
      walkthrough: [
        "string name = \"Alice\"; int age = 20; double gpa = 3.7; bool enrolled = true;",
        "cout << \"Name: \" << name << endl; etc.",
        "auto age = 20; — works the same",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Demonstrate integer overflow. Set `int x = 2000000000`. Add 500000000 to it and print the result — observe the overflow. Fix it by using `long long`. Print `sizeof(int)` and `sizeof(long long)` to confirm the size difference. Then write a safe addition: check if `x + y > INT_MAX` before adding.",
      hint: "Use `INT_MAX` from `<climits>`. `long long y = 2000000000LL; y += 500000000;`",
      walkthrough: [
        "int x = 2000000000; x += 500000000; — overflow, prints negative",
        "long long safe = 2000000000LL; safe += 500000000; — correct",
        "if (x > INT_MAX - 500000000) { overflow! } else { x += 500000000; }",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-002-q1",
        type: "choice",
        text: "What does `7 / 2` evaluate to in C++?",
        options: ["3.5", "3", "4", "3.0"],
        answer: 1,
        explanation:
          "When both operands are integers, C++ performs integer division — the result is truncated toward zero. `7 / 2 = 3`. To get `3.5`, make at least one operand a double: `7.0 / 2` or `(double)7 / 2`.",
      },
      {
        id: "cpp0-002-q2",
        type: "choice",
        text: "What type does `auto x = 3.14;` give `x`?",
        options: ["float", "double", "int", "long double"],
        answer: 1,
        explanation:
          "Floating-point literals without a suffix are `double` in C++. `auto` deduces the type from the initializer, so `x` is `double`. Use `3.14f` for `float` or `3.14L` for `long double`.",
      },
      {
        id: "cpp0-002-q3",
        type: "choice",
        text: "Why is `if (a + b == 0.3)` dangerous when `a = 0.1` and `b = 0.2`?",
        options: [
          "Floating-point addition is always exact",
          "0.1 and 0.2 can't be represented exactly in binary — their sum may differ from 0.3 by a tiny rounding error",
          "The `==` operator is not defined for double",
          "You must cast to int before comparing",
        ],
        answer: 1,
        explanation:
          "Floating-point numbers are stored in binary, and 0.1 and 0.2 are repeating fractions in binary — like 1/3 in decimal. The nearest representable values add up to something like 0.30000000000000004, not exactly 0.3. Use `fabs(a + b - 0.3) < 1e-9` for floating-point comparisons.",
      },
      {
        id: "cpp0-002-q4",
        type: "choice",
        text: "What does `const double PI = 3.14159;` prevent?",
        options: [
          "PI from being used in expressions",
          "PI from being reassigned after initialization",
          "PI from being printed with cout",
          "PI from being passed to functions",
        ],
        answer: 1,
        explanation:
          "`const` makes a variable read-only after initialization. You can use `PI` in expressions, pass it to functions, and print it — but any attempt to assign a new value is a compile error. It documents intent and catches accidental modifications.",
      },
    ],
  },
};

export default lesson;
