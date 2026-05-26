const OPS_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: --- Arithmetic ---\\n17 / 5 = 3 (integer division!)\\n17.0 / 5 = 3.4\\n17 % 5 = 2 (remainder)\\n--- Increment/Decrement ---\\nx starts: 10\\nx++ = 10 (post: returns then increments)\\n++x = 12 (pre: increments then returns)\\n--- Comparison (returns bool) ---\\n5 == 5: 1\\n5 != 3: 1\\n5 > 3: 1\\n--- Logical ---\\ntrue && false: 0\\ntrue || false: 1\\n!true: 0\\n--- Bitwise ---\\n0b1010 & 0b1100 = 8 (1000)\\n0b1010 | 0b1100 = 14 (1110)\\n5 << 2 = 20 (shift left = multiply by 4)

int main() {
    // ── Arithmetic ─────────────────────────────────────────────
    cout << "--- Arithmetic ---" << endl;
    cout << "17 / 5 = "    << 17 / 5      << " (integer division!)" << endl;
    cout << "17.0 / 5 = "  << 17.0 / 5   << endl;
    cout << "17 % 5 = "    << 17 % 5      << " (remainder)" << endl;

    // ── Increment / Decrement ──────────────────────────────────
    cout << "--- Increment/Decrement ---" << endl;
    int x = 10;
    cout << "x starts: " << x++ << endl;   // prints 10, THEN increments
    // x is now 11
    cout << "x++ = " << (x-1) << " (post: returns then increments)" << endl;
    cout << "++x = " << ++x   << " (pre: increments then returns)" << endl;

    // ── Comparison ─────────────────────────────────────────────
    cout << "--- Comparison (returns bool) ---" << endl;
    cout << "5 == 5: " << (5 == 5) << endl;
    cout << "5 != 3: " << (5 != 3) << endl;
    cout << "5 > 3: "  << (5 > 3)  << endl;

    // ── Logical ────────────────────────────────────────────────
    cout << "--- Logical ---" << endl;
    cout << "true && false: " << (true && false) << endl;
    cout << "true || false: " << (true || false) << endl;
    cout << "!true: "         << (!true)         << endl;

    // ── Bitwise ────────────────────────────────────────────────
    cout << "--- Bitwise ---" << endl;
    cout << "0b1010 & 0b1100 = " << (0b1010 & 0b1100) << " (1000)" << endl;
    cout << "0b1010 | 0b1100 = " << (0b1010 | 0b1100) << " (1110)" << endl;
    cout << "5 << 2 = " << (5 << 2) << " (shift left = multiply by 4)" << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-004",
  slug: "operators-and-expressions",
  chapter: "cpp-0",
  order: 4,
  title: "Operators and Expressions",
  subtitle: "Arithmetic, comparison, logical, bitwise, and assignment operators",
  tags: ["c++", "cpp", "operators", "expressions", "arithmetic", "bitwise", "modulo", "precedence"],
  aliases: [
    "c++ operators",
    "integer division c++",
    "modulo operator c++",
    "bitwise operators c++",
    "operator precedence c++",
  ],

  hook: `Operators are the verbs of C++. Every calculation, every comparison, every logic check uses operators. The subtleties here — integer division, post-vs-pre increment, short-circuit evaluation, bitwise vs logical — are what separate code that does what you intend from code that silently does something else.`,

  mentalModel: [
    "**Integer division truncates toward zero.** `17 / 5 = 3`, not `3.4`. C++ divides two integers and drops the fractional part. To get a floating-point result, at least one operand must be a `double`: `17.0 / 5 = 3.4`. This is the #1 silent bug for beginners.",
    "**`%` is remainder (modulo), not modulus.** `17 % 5 = 2` because `17 = 3*5 + 2`. For positive numbers, this equals the mathematical modulus. For negative numbers, the sign of the result matches the dividend in C++: `-7 % 3 == -1`. Use `%` to test divisibility (`n % 2 == 0` means even) and to wrap indices in circular buffers.",
    "**Short-circuit evaluation means the right side may never run.** In `a && b`, if `a` is false, `b` is never evaluated. In `a || b`, if `a` is true, `b` is skipped. This is not just an optimization — it's relied upon for safety: `ptr != nullptr && ptr->value > 0` won't crash because if `ptr` is null, the right side is never reached.",
  ],

  intuition: {
    prose: [
      "C++ operators follow a strict **precedence** hierarchy. Multiplication and division bind tighter than addition: `2 + 3 * 4 = 14` (not 20). Comparison operators (`<`, `>`, `==`, `!=`) bind tighter than logical operators (`&&`, `||`). So `a > 0 && b > 0` parses as `(a > 0) && (b > 0)` — which is what you want. When in doubt, use parentheses: they're free and make intent explicit.",
      "**`++` and `--` have two forms.** Post-increment `x++` returns the current value of `x`, then increments it. Pre-increment `++x` increments first, then returns the new value. Standalone in a statement (`x++;` or `++x;`) they behave identically. The difference matters inside expressions: `int y = x++;` sets `y` to old `x`, while `int y = ++x;` sets `y` to new `x`. In modern C++, prefer pre-increment for iterators and objects where copying is expensive.",
      "**Compound assignment operators** (`+=`, `-=`, `*=`, `/=`, `%=`, `<<=`, `>>=`, `&=`, `|=`, `^=`) combine an operation with assignment. `x += 5` is exactly `x = x + 5` but shorter and often clearer. They read well: `total += price;` says 'add price to total'.",
      "**Bitwise operators work bit-by-bit.** `&` (AND) outputs 1 only where both inputs are 1. `|` (OR) outputs 1 where either input is 1. `^` (XOR) outputs 1 where inputs differ. `<<` (left shift) multiplies by 2^n. `>>` (right shift) divides by 2^n (for non-negative values). These are essential for embedded systems, flags, and performance-critical code. Don't confuse bitwise `&` with logical `&&` — they produce very different results.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Compile and explore operator behavior:**\n\n1. Run the code — note integer division drops the decimal\n2. Try `7 / 2` vs `7.0 / 2` vs `7 / 2.0` — which gives 3.5?\n3. Try `(-7) % 3` — what sign does the result have?\n4. Try `0b1111 ^ 0b1010` — XOR gives you `0101` = 5\n5. Try `1 << 10` — that's 2^10 = 1024\n6. Try `(5 > 3) + (4 > 2)` — booleans are ints! What result do you get?",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": OPS_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Integer division is exact — it truncates toward zero.** Given `int a = 7, b = 2`, `a / b` yields exactly `3`. The `.5` is discarded, not rounded. This is defined behavior. To round instead of truncate: `(a + b/2) / b` for positive values, or cast to double first. The type of the result is the 'wider' type: `int / int → int`, `double / int → double`, `int / double → double`. Only when BOTH operands are integer does integer division apply.",
      "**Operator precedence is a table, not intuition.** The full C++ precedence table has ~16 levels. Postfix `++/--` binds tighter than prefix `++/--`, which binds tighter than `*`, which binds tighter than `+`. Bitwise AND `&` binds tighter than `==`, which trips up flag checks: `if (flags & MASK == 0)` is parsed as `if (flags & (MASK == 0))` — wrap the bitwise op: `if ((flags & MASK) == 0)`. Parentheses always override precedence.",
      "**`&&` and `||` are sequenced (short-circuit) operators.** The left operand is always evaluated first. If it determines the result, the right operand is not evaluated — and any side effects in the right operand do not occur. This is guaranteed by the C++ standard. Functions like `if (vec.size() > 0 && vec[0] == target)` are safe because `vec[0]` is only accessed if `vec` is non-empty. This property is fundamental to safe pointer dereferencing patterns.",
    ],
    callouts: [
      {
        type: "warning",
        title: "= is assignment, == is comparison",
        body: "`if (x = 5)` assigns 5 to x and then tests whether 5 is truthy (it always is). This is almost certainly a bug — you wanted `if (x == 5)`. Many compilers warn about this. Some developers write `if (5 == x)` (Yoda conditions) to prevent it — the compiler will catch `if (5 = x)` as an error.",
      },
      {
        type: "info",
        title: "Booleans are integers in C++",
        body: "`true` is 1, `false` is 0. You can add booleans: `(3 > 2) + (4 > 1) == 2`. This enables counting: `int count = (a > 0) + (b > 0) + (c > 0)` counts how many are positive. Conversely, any non-zero integer converts to `true` in a boolean context.",
      },
      {
        type: "tip",
        title: "Use bitmasks for flags",
        body: "Instead of N boolean variables, pack them into one int using bitwise OR to set flags and AND to test them:\n```\nconst int BOLD   = 0b001;\nconst int ITALIC = 0b010;\nint style = BOLD | ITALIC;   // both\nif (style & BOLD) { /* bold is set */ }\nstyle &= ~ITALIC;            // clear italic\n```",
      },
    ],
  },

  examples: [
    {
      title: "Integer vs floating-point division",
      body: `int a = 7, b = 2;
double c = 7.0, d = 2.0;

// Integer division
cout << a / b << endl;         // 3  (truncated)
cout << -7 / 2 << endl;        // -3 (truncates toward zero)

// Floating-point division
cout << c / d << endl;         // 3.5
cout << a / d << endl;         // 3.5  (int promoted to double)
cout << double(a) / b << endl; // 3.5  (explicit cast)

// Remainder
cout << 7 % 3 << endl;         // 1
cout << -7 % 3 << endl;        // -1 (sign matches dividend in C++)`,
    },
    {
      title: "Common expression patterns",
      body: `// Average of two integers without overflow
int avg = a + (b - a) / 2;    // avoids overflow; same as (a+b)/2

// Divisibility checks
bool isEven = (n % 2 == 0);
bool isDivBy3 = (n % 3 == 0);

// Clamp a value to [min, max] using ternary
int clamped = (x < lo) ? lo : (x > hi) ? hi : x;

// Conditional without branch (booleans are ints)
int abs_val = (x >= 0) ? x : -x;

// Swap without temp variable (using XOR)
a ^= b;  b ^= a;  a ^= b;   // classic XOR swap`,
    },
    {
      title: "Bitwise flag operations",
      body: `// Define flags as powers of 2 (one bit each)
const unsigned int READ    = 1u << 0;  // 001
const unsigned int WRITE   = 1u << 1;  // 010
const unsigned int EXECUTE = 1u << 2;  // 100

unsigned int perms = READ | WRITE;     // 011 = 3

// Test a flag
if (perms & READ)    cout << "readable" << endl;
if (perms & EXECUTE) cout << "executable" << endl;  // not set

// Set a flag
perms |= EXECUTE;   // perms = 111 = 7

// Clear a flag
perms &= ~WRITE;    // perms = 101 = 5

// Toggle a flag
perms ^= READ;      // flip READ`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that reads an integer `n` and prints: (1) whether it's even or odd (using `%`), (2) the result of `n / 4` as an integer, (3) the result of `n / 4.0` as a double. Show the difference clearly with labels.",
      hint: "`n % 2 == 0` means even. For floating-point division, write `n / 4.0`.",
      walkthrough: [
        "Read int n from cin",
        "Test `n % 2 == 0` for even/odd",
        "Print `n / 4` (integer division, truncates)",
        "Print `n / 4.0` (promotes n to double)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Bit manipulation: Read an integer, then print (1) its value with the 3rd bit (bit index 2, value 4) SET using `|`, (2) its value with the 3rd bit CLEARED using `& ~(1 << 2)`, (3) whether the 3rd bit is currently set using `&`. Print as both decimal and binary-style annotation.",
      hint: "Use `1 << 2` to create a mask for bit 2 (value 4). Test with `n & 4`, set with `n | 4`, clear with `n & ~4`.",
      walkthrough: [
        "Set mask = 1 << 2 = 4",
        "Set: `n | mask`",
        "Clear: `n & ~mask` (bitwise NOT of mask flips all bits)",
        "Test: `if (n & mask)` — if result is non-zero, bit is set",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-004-q1",
        type: "choice",
        text: "What does `7 / 2` evaluate to in C++ when both are ints?",
        options: ["3.5", "3", "4", "Undefined"],
        answer: 1,
        explanation:
          "Integer division truncates toward zero. `7 / 2 = 3` (the `.5` is dropped). To get `3.5`, at least one operand must be a floating-point type: `7.0 / 2` or `7 / 2.0`.",
      },
      {
        id: "cpp0-004-q2",
        type: "choice",
        text: "In `int y = x++;`, what value does y get?",
        options: [
          "The new value of x (after increment)",
          "The old value of x (before increment)",
          "0",
          "A compiler error",
        ],
        answer: 1,
        explanation:
          "Post-increment `x++` returns the current value and then increments. So `y` gets the value x had before the increment. Use `++x` (pre-increment) if you want y to get the incremented value.",
      },
      {
        id: "cpp0-004-q3",
        type: "choice",
        text: "Given `bool a = false; bool b = func();`, in `a && b`, when is `func()` called?",
        options: [
          "Always — both sides are always evaluated",
          "Never — a is false so b is never evaluated (short-circuit)",
          "Only in debug builds",
          "Only if a and b are declared volatile",
        ],
        answer: 1,
        explanation:
          "`&&` short-circuits: if the left operand is false, the result is false regardless of the right. `func()` is not called. This is guaranteed by the C++ standard and is essential for safe null-pointer patterns.",
      },
      {
        id: "cpp0-004-q4",
        type: "choice",
        text: "What does `flags & MASK == 0` most likely evaluate as?",
        options: [
          "`(flags & MASK) == 0` — tests if the bits are clear",
          "`flags & (MASK == 0)` — bitwise AND with either 0 or 1",
          "A compile error",
          "Undefined behavior",
        ],
        answer: 1,
        explanation:
          "`==` has higher precedence than `&` in C++, so `flags & MASK == 0` parses as `flags & (MASK == 0)`. Since `MASK == 0` is either 0 or 1, this usually gives the wrong result. Always write `(flags & MASK) == 0` with explicit parentheses.",
      },
    ],
  },
};

export default lesson;
