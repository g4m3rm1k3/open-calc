const ARITH_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 17 / 5 = 3\\n17.0 / 5 = 3.4\\n17 % 5 = 2\\n-7 % 3 = -2

int main() {
    // Integer division truncates — no rounding
    cout << "17 / 5 = "   << 17 / 5   << endl;   // 3, not 3.4
    cout << "17.0 / 5 = " << 17.0 / 5 << endl;   // 3.4 — one double promotes both

    // % gives remainder — sign matches the dividend
    cout << "17 % 5 = "  << 17 % 5  << endl;     // 2
    cout << "-7 % 3 = "  << -7 % 3  << endl;     // -2 (matches sign of -7)

    return 0;
}`;

const INCR_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: x = 10\\npost x++: 10  x is now: 11\\npre ++x: 12  x is now: 12

int main() {
    int x = 10;
    cout << "x = " << x << endl;

    // Post-increment: returns old value, then increments
    cout << "post x++: " << x++ << "  x is now: " << x << endl;

    // Pre-increment: increments first, then returns new value
    cout << "pre ++x: "  << ++x << "  x is now: " << x << endl;

    return 0;
}`;

const COMPARE_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 5 == 5: 1\\n5 != 3: 1\\n5 > 3: 1\\ntrue && false: 0\\ntrue || false: 1\\n!true: 0

int main() {
    // Comparison operators return 1 (true) or 0 (false)
    cout << "5 == 5: "  << (5 == 5)  << endl;
    cout << "5 != 3: "  << (5 != 3)  << endl;
    cout << "5 > 3: "   << (5 > 3)   << endl;

    // Logical operators — && short-circuits if left is false
    cout << "true && false: " << (true && false) << endl;
    cout << "true || false: " << (true || false) << endl;
    cout << "!true: "         << (!true)         << endl;

    return 0;
}`;

const BITWISE_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: AND: 8\\nOR: 14\\nXOR: 6\\nshift left 5<<2: 20\\nshift right 20>>2: 5

int main() {
    // Bitwise: work on individual bits
    // 0b1010 = 10,  0b1100 = 12
    cout << "AND: "  << (0b1010 & 0b1100) << endl;   // 1000 = 8
    cout << "OR: "   << (0b1010 | 0b1100) << endl;   // 1110 = 14
    cout << "XOR: "  << (0b1010 ^ 0b1100) << endl;   // 0110 = 6

    // Left shift = multiply by 2^n,  right shift = divide by 2^n
    cout << "shift left 5<<2: "  << (5 << 2) << endl;  // 5 * 4 = 20
    cout << "shift right 20>>2: " << (20 >> 2) << endl; // 20 / 4 = 5

    return 0;
}`;

const lesson = {
  id: "cpp-0-004",
  slug: "operators-and-expressions",
  chapter: "cpp-0",
  order: 4,
  title: "Operators and Expressions",
  subtitle: "Arithmetic, comparison, logical, and bitwise — and the traps that trip everyone up",
  tags: ["c++", "cpp", "operators", "expressions", "arithmetic", "bitwise", "modulo", "precedence"],
  aliases: [
    "c++ operators",
    "integer division c++",
    "modulo operator c++",
    "bitwise operators c++",
    "operator precedence c++",
  ],

  hook: `Every calculation, every decision, every bit manipulation uses operators. Most are obvious — but a few will silently produce wrong results until you understand them. Integer division, pre vs post increment, short-circuit evaluation, bitwise vs logical: these are the gaps between what you expect and what C++ does.`,

  mentalModel: [
    "**Integer division truncates toward zero.** `17 / 5 = 3`, not `3.4`. The fractional part is dropped — not rounded. To get `3.4`, at least one operand must be a `double`: `17.0 / 5`. This is the #1 silent bug for beginners.",
    "**Post-increment `x++` returns the old value first, then increments. Pre-increment `++x` increments first, then returns.** Standalone (`x++;`) they're identical. In expressions (`y = x++;` vs `y = ++x;`) they differ. In modern C++, prefer `++x` — it's never slower and sometimes faster for complex objects.",
    "**`&&` and `||` short-circuit.** In `a && b`, if `a` is false, `b` is never evaluated. In `a || b`, if `a` is true, `b` is skipped. This isn't just optimization — it's relied upon for safety: `ptr && ptr->value > 0` won't crash because the right side only runs when `ptr` is non-null.",
  ],

  intuition: {
    prose: [
      "**Arithmetic operators.** `+`, `-`, `*`, `/`, `%` are the basics. Division and modulo are the ones to watch: integer division truncates, and `%` gives the remainder with the sign of the dividend.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then experiment:**\n\n- Change `17` to `7`. What does `7 / 5` give? What about `7 % 5`?\n- Try `7 / 2` vs `7.0 / 2` vs `(double)7 / 2` — all give 3.5?\n- Try `(-7) % 3` — what sign does the result have? Why?\n- Try `10 % 3`, `15 % 4`, `100 % 7` — can you predict the result before running?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ARITH_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Pre vs post increment — run it then explore:**\n\n- Change `cout << x++` to `cout << ++x` on line 10. What changes?\n- Set `x = 10`, then do `int y = x++; int z = ++x;` — what are y, z, and x afterwards?\n- Try `cout << x++ << \" \" << x++;` — what prints? (Hint: evaluation order is tricky here)\n- What does `x += 5` do? Same as `x = x + 5`?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": INCR_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Comparison operators return `bool` (printed as 0 or 1).** `==`, `!=`, `<`, `>`, `<=`, `>=` all produce a boolean. In C++, `true` is 1 and `false` is 0 — you can add booleans: `(3 > 2) + (4 > 1)` equals 2. This enables counting: `int positives = (a > 0) + (b > 0) + (c > 0);`",
      "**Bitwise operators work bit-by-bit on the binary representation.** `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (left shift), `>>` (right shift). Left shift by n multiplies by 2^n. Essential for embedded systems, flag bitmasks, and performance-critical code. Do not confuse `&` (bitwise AND) with `&&` (logical AND) — they produce very different results on non-boolean values.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Comparison and logical — run it then explore:**\n\n- Add `int a = 5; cout << (a > 0) + (a > 3) + (a > 10);` — how many conditions are true?\n- Try `int x = 0; cout << (x != 0 && 10/x > 1);` — does dividing by zero crash? Why not?\n- Try `bool b = 42; cout << b;` — what prints? (non-zero ints are truthy)\n- Try `cout << (5 == 5) + (3 > 2);` — booleans added together.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": COMPARE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Bitwise operators — run it then explore:**\n\n- Try `0b1111 & 0b0101` — which bits survive?\n- Try `0b1111 ^ 0b1111` — XOR with itself always gives 0. Why?\n- Try `1 << 10` — what's 2^10?\n- Define flags: `const int A = 1 << 0; const int B = 1 << 1; int flags = A | B;` — test `flags & A`, `flags & B`. Then clear A with `flags &= ~A` and test again.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": BITWISE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "= is assignment, == is comparison",
        body: "`if (x = 5)` assigns 5 to x and is always true — almost certainly a bug. You wanted `if (x == 5)`. Many compilers warn about this. Enable `-Wall` so the compiler catches it.",
      },
      {
        type: "warning",
        title: "Bitwise & vs logical &&",
        body: "`if (flags & MASK == 0)` parses as `flags & (MASK == 0)` because `==` has higher precedence than `&`. Write `if ((flags & MASK) == 0)` with explicit parentheses — always parenthesize bitwise operations in conditions.",
      },
    ],
  },

  examples: [
    {
      title: "Integer vs floating-point division",
      body: `int a = 7, b = 2;

cout << a / b        << endl;  // 3   — integer division truncates
cout << -7 / 2       << endl;  // -3  — truncates toward zero
cout << a / 2.0      << endl;  // 3.5 — one double promotes both
cout << (double)a / b << endl; // 3.5 — explicit cast

// Remainder
cout << 7 % 3  << endl;  // 1
cout << -7 % 3 << endl;  // -1 — sign matches dividend`,
    },
    {
      title: "Bitmask flag operations",
      body: `const unsigned int READ    = 1u << 0;  // 001
const unsigned int WRITE   = 1u << 1;  // 010
const unsigned int EXECUTE = 1u << 2;  // 100

unsigned int perms = READ | WRITE;     // 011

if (perms & READ)    cout << "readable\\n";    // yes
if (perms & EXECUTE) cout << "executable\\n";  // no

perms |= EXECUTE;   // set:   perms = 111
perms &= ~WRITE;    // clear: perms = 101
perms ^= READ;      // toggle: flip READ`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that reads an integer `n` and prints: (1) whether it's even or odd using `%`, (2) `n / 4` as an integer, (3) `n / 4.0` as a double. Show the difference clearly with labels.",
      hint: "`n % 2 == 0` means even. For floating-point division write `n / 4.0`.",
      walkthrough: [
        "Read int n from cin",
        "Test n % 2 == 0 for even/odd",
        "Print n / 4 (integer division, truncates)",
        "Print n / 4.0 (promotes n to double)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Bit manipulation: read an integer, then print (1) its value with bit 2 SET using `| (1 << 2)`, (2) its value with bit 2 CLEARED using `& ~(1 << 2)`, (3) whether bit 2 is currently set using `& (1 << 2)`. Then swap two variables using XOR: `a ^= b; b ^= a; a ^= b;` — verify both variables swapped.",
      hint: "`1 << 2` creates a mask for bit 2 (value 4). `~` flips all bits.",
      walkthrough: [
        "int mask = 1 << 2; // = 4",
        "Set: n | mask",
        "Clear: n & ~mask",
        "Test: if (n & mask) — non-zero means set",
        "XOR swap: a ^= b; b ^= a; a ^= b;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-004-q1",
        type: "choice",
        text: "What does `7 / 2` evaluate to when both operands are int?",
        options: ["3.5", "3", "4", "Undefined behavior"],
        answer: 1,
        explanation:
          "Integer division truncates toward zero. `7 / 2 = 3`. To get `3.5`, at least one operand must be floating-point: `7.0 / 2` or `(double)7 / 2`.",
      },
      {
        id: "cpp0-004-q2",
        type: "choice",
        text: "In `int y = x++;`, what value does y receive?",
        options: [
          "The incremented value of x",
          "The original value of x before incrementing",
          "0",
          "Undefined",
        ],
        answer: 1,
        explanation:
          "Post-increment `x++` returns the current value and then increments. `y` gets x's value before the increment. Use `++x` if you want `y` to receive the incremented value.",
      },
      {
        id: "cpp0-004-q3",
        type: "choice",
        text: "Given `bool a = false;`, in `a && expensiveFunc()`, when is `expensiveFunc()` called?",
        options: [
          "Always — both sides are always evaluated",
          "Never — a is false so the right side is short-circuited",
          "Only in debug builds",
          "Only if expensiveFunc has no side effects",
        ],
        answer: 1,
        explanation:
          "`&&` short-circuits: if the left operand is false, the result is false regardless. `expensiveFunc()` is not called. This is guaranteed by the C++ standard.",
      },
      {
        id: "cpp0-004-q4",
        type: "choice",
        text: "What does `flags & MASK == 0` most likely parse as?",
        options: [
          "`(flags & MASK) == 0` — tests if the bits are clear",
          "`flags & (MASK == 0)` — AND with 0 or 1 (almost certainly wrong)",
          "A compile error",
          "Undefined behavior",
        ],
        answer: 1,
        explanation:
          "`==` has higher precedence than `&`, so it parses as `flags & (MASK == 0)`. Since `MASK == 0` is 0 or 1, this gives wrong results. Always write `(flags & MASK) == 0` with explicit parentheses.",
      },
    ],
  },
};

export default lesson;
