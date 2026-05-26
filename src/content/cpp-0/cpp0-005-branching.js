const BRANCH_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Score: 85\\nGrade: B\\nPassed: yes\\n\\nDay 3 = Wednesday\\n\\nSign: positive\\nAbsolute value: 42

int main() {
    // ── if / else if / else ────────────────────────────────────
    int score = 85;
    cout << "Score: " << score << endl;

    string grade;
    if (score >= 90)      grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else                  grade = "F";

    cout << "Grade: " << grade << endl;

    // Ternary: condition ? value_if_true : value_if_false
    string result = (score >= 60) ? "yes" : "no";
    cout << "Passed: " << result << endl << endl;

    // ── switch / case ──────────────────────────────────────────
    int day = 3;
    string dayName;
    switch (day) {
        case 1:  dayName = "Monday";    break;
        case 2:  dayName = "Tuesday";   break;
        case 3:  dayName = "Wednesday"; break;
        case 4:  dayName = "Thursday";  break;
        case 5:  dayName = "Friday";    break;
        default: dayName = "Weekend";   break;
    }
    cout << "Day " << day << " = " << dayName << endl << endl;

    // ── Nested conditions and short-circuit ────────────────────
    int n = 42;
    string sign;
    if (n > 0)      sign = "positive";
    else if (n < 0) sign = "negative";
    else            sign = "zero";
    cout << "Sign: " << sign << endl;

    // Ternary for absolute value
    int abs_n = (n >= 0) ? n : -n;
    cout << "Absolute value: " << abs_n << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-005",
  slug: "branching",
  chapter: "cpp-0",
  order: 5,
  title: "Branching",
  subtitle: "Control which code runs with if/else, switch, and the ternary operator",
  tags: ["c++", "cpp", "if", "else", "switch", "ternary", "conditional", "branching"],
  aliases: [
    "c++ if else",
    "c++ switch statement",
    "c++ ternary operator",
    "conditional logic c++",
    "c++ control flow",
  ],

  hook: `Programs that always do the same thing regardless of input aren't useful. Branching lets your code make decisions — respond differently to different inputs, handle errors, follow different code paths. Every non-trivial program is a tree of branches, and understanding how to structure them cleanly separates maintainable code from spaghetti.`,

  mentalModel: [
    "**`if` evaluates a boolean expression and executes the block if true.** The expression in `if (expr)` can be any expression that's convertible to bool: comparisons (`x > 0`), logical combinations (`x > 0 && x < 10`), even plain integers (0 is false, everything else is true). The block is `{ }` — single statements don't technically need braces, but always use them: it prevents bugs when you add lines later.",
    "**`else if` chains test conditions in order, stopping at the first true one.** Only one branch executes. The conditions are tested sequentially: once `score >= 90` is true, the `else if (score >= 80)` block is not entered — even though 95 ≥ 80 as well. Structure your chains from most specific (or most restrictive) to least specific.",
    "**`switch` compares one value against integer constants.** It compiles to a jump table — O(1) regardless of how many cases — making it faster than a chain of `if/else` for large case sets. Always include `break` to prevent **fallthrough** (execution continuing into the next case). Use fallthrough intentionally by omitting `break` when multiple cases share behavior.",
  ],

  intuition: {
    prose: [
      "An `if-else if-else` chain is a decision tree. When grading, you don't ask 'is it A?', 'is it B?', 'is it C?' independently — you ask them in sequence and commit to the first true answer. The compiler generates this as a series of conditional jumps. The CPU evaluates the condition, and if true, jumps over the `else` branch to the code after. Branch prediction hardware in modern CPUs tries to guess which branch will be taken, often achieving near-zero penalty for predictable branches.",
      "The **ternary operator** `condition ? true_value : false_value` is a compact expression that evaluates to one of two values. It's an *expression* (produces a value) unlike `if` (a *statement*). This means you can use it inside a larger expression: `cout << (x > 0 ? \"positive\" : \"negative\")`. Use it for simple value selection; use `if/else` for complex logic with multiple statements.",
      "**`switch` is specifically for integer-typed values.** The expression in `switch (expr)` must be integral (int, char, enum, bool, long). Each `case` label must be an integer *constant expression* (no variables, no ranges). If you forget `break`, execution falls through to the next case — this is a common bug but also an intentional pattern: `case 'a': case 'A':` to handle both uppercase and lowercase.",
      "**Nested conditions become hard to read quickly.** When you have `if` inside `if` inside `if`, the cyclomatic complexity explodes. A useful technique: **early return** (or 'guard clauses') — check error conditions or edge cases first and return/break immediately, leaving the main logic at a low indentation level. This flattens the code tree and makes the happy path obvious.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Experiment with branching:**\n\n1. Change `score = 85` to `score = 95`, `70`, `59` — does the grade update correctly?\n2. Change `day = 3` to `day = 7` — do you see `Weekend`?\n3. Remove a `break` from the switch — observe fallthrough behavior\n4. Try the ternary for a 3-way comparison: `(x > 0) ? 1 : (x < 0) ? -1 : 0`\n5. What happens if you `switch` on a `double`? (Hint: compile error — switch requires integral type)",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": BRANCH_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Dangling else.** In `if (a) if (b) stmt1; else stmt2;`, the `else` binds to the nearest `if` — so it pairs with `if (b)`, not `if (a)`. This is called the dangling else problem and is a historic source of bugs. The C++ grammar resolves it unambiguously, but it's confusing. Always use braces: `if (a) { if (b) { stmt1; } else { stmt2; } }`. Your intent is unambiguous.",
      "**Switch fallthrough is an intentional feature with accidental-use traps.** When you omit `break`, execution continues into the next case's code. This is useful for grouping cases with identical behavior. Since C++17, you can annotate intentional fallthrough with `[[fallthrough]];` — the compiler will then warn about unintentional fallthrough but stay silent for annotated ones. Always add `default:` to `switch` to handle unexpected values.",
      "**Constexpr `if` (C++17) evaluates at compile time.** `if constexpr (condition)` is evaluated by the compiler: the false branch is not compiled at all (only checked for syntax). This is powerful in templates where different types need different code paths. The ordinary `if` evaluates at runtime — `if constexpr` is a compile-time switch. This removes template specialization boilerplate in many cases.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Forgetting break in switch causes fallthrough",
        body: "If you omit `break` in a `case`, execution falls through to the next case's code — even if the next case label doesn't match. This silently executes extra code. Use `break` after every case unless fallthrough is intentional, and annotate intentional fallthrough with `[[fallthrough]];` (C++17).",
      },
      {
        type: "info",
        title: "switch vs if-else performance",
        body: "For small case counts (2-4), `if-else` and `switch` generate similar code. For larger counts, `switch` compiles to a jump table — O(1) lookup regardless of case count. This makes `switch` much faster for things like parsing event types, state machines, or command dispatching with many cases.",
      },
      {
        type: "tip",
        title: "Guard clauses flatten nested code",
        body: "Instead of deeply nested `if`s, check error cases early and return:\n```cpp\n// Nested (hard to read)\nif (ptr != nullptr) {\n  if (ptr->value > 0) {\n    // ... main logic\n  }\n}\n// Guard clause (easy to read)\nif (ptr == nullptr) return;\nif (ptr->value <= 0) return;\n// ... main logic\n```",
      },
    ],
  },

  examples: [
    {
      title: "Grading system with all branches covered",
      body: `int score;
cin >> score;

if (score < 0 || score > 100) {
    cout << "Invalid score" << endl;
} else if (score >= 90) {
    cout << "A — Excellent" << endl;
} else if (score >= 80) {
    cout << "B — Good" << endl;
} else if (score >= 70) {
    cout << "C — Satisfactory" << endl;
} else if (score >= 60) {
    cout << "D — Passing" << endl;
} else {
    cout << "F — Failing" << endl;
}`,
    },
    {
      title: "Switch with intentional fallthrough",
      body: `char c;
cin >> c;

switch (c) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
    case 'A': case 'E': case 'I': case 'O': case 'U':
        cout << c << " is a vowel" << endl;
        break;
    case ' ': case '\\t': case '\\n':
        cout << c << " is whitespace" << endl;
        break;
    default:
        if (isalpha(c))
            cout << c << " is a consonant" << endl;
        else
            cout << c << " is a punctuation/digit" << endl;
}`,
    },
    {
      title: "Ternary chains and complex conditions",
      body: `int x = 15;

// Ternary for sign function (-1, 0, 1)
int sign = (x > 0) ? 1 : (x < 0) ? -1 : 0;

// Compound boolean conditions
int a = 5, b = 10, c = 3;
bool inRange = (a >= 0 && a <= 10);      // range check
bool anyNeg  = (a < 0 || b < 0 || c < 0); // any negative

// FizzBuzz (classic interview example)
for (int i = 1; i <= 20; i++) {
    if (i % 15 == 0)      cout << "FizzBuzz" << endl;
    else if (i % 3 == 0)  cout << "Fizz" << endl;
    else if (i % 5 == 0)  cout << "Buzz" << endl;
    else                  cout << i << endl;
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a BMI calculator. Read weight (kg) and height (m), compute BMI = weight / (height * height), then classify: < 18.5 = Underweight, 18.5–25 = Normal, 25–30 = Overweight, ≥ 30 = Obese. Print the BMI value and category.",
      hint: "Use `if / else if / else`. Remember to use `double` for the inputs to avoid integer division.",
      walkthrough: [
        "Read `double weight, height` from cin",
        "Compute `double bmi = weight / (height * height)`",
        "Chain if/else if/else to classify",
        "Print bmi and the category string",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a simple text-based menu using switch. Print: `1. Add  2. Subtract  3. Multiply  4. Quit`. Read choice, then read two numbers for options 1-3 and perform the operation. For 4, print `Goodbye!`. For invalid input, print `Invalid choice`. Use the `default` case.",
      hint: "Read an `int choice` first, then switch on it. Read the numbers inside cases 1-3.",
      walkthrough: [
        "Print the menu using cout",
        "Read int choice with cin",
        "switch(choice) with cases 1-4 and default",
        "For cases 1-3, read two doubles inside the case and compute",
        "Don't forget `break` after each case",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-005-q1",
        type: "choice",
        text: "In an if-else if chain, how many branches execute when the first condition is true?",
        options: [
          "All conditions are still checked",
          "Only the first matching branch executes, then control jumps past the chain",
          "The matching branch and all subsequent else-if branches",
          "It depends on whether the conditions overlap",
        ],
        answer: 1,
        explanation:
          "Only one branch in an if-else if-else chain executes. Once a true condition is found, its block runs and all remaining else-if and else blocks are skipped. Conditions after the first true one are never evaluated.",
      },
      {
        id: "cpp0-005-q2",
        type: "choice",
        text: "What happens in a switch when you omit `break` from a case?",
        options: [
          "The program exits the switch and continues after it",
          "A compile error",
          "Execution falls through and runs the next case's code",
          "The switch restarts from case 1",
        ],
        answer: 2,
        explanation:
          "Without `break`, execution falls through to the next case's statements — the case label is ignored. This continues until a `break` or the end of the switch. It's a common bug; use `[[fallthrough]]` to mark intentional fallthrough.",
      },
      {
        id: "cpp0-005-q3",
        type: "choice",
        text: "What types can be used as the expression in `switch (expr)`?",
        options: [
          "Any type",
          "Only int",
          "Integral types: int, char, enum, bool, long",
          "Integral types and floating-point types",
        ],
        answer: 2,
        explanation:
          "`switch` requires an integral (integer-valued) expression: `int`, `char`, `enum`, `bool`, `long`, and similar. You cannot switch on `double`, `string`, or other non-integral types — those require if-else chains.",
      },
      {
        id: "cpp0-005-q4",
        type: "choice",
        text: "What does `int x = (a > b) ? a : b;` compute?",
        options: [
          "The minimum of a and b",
          "The maximum of a and b",
          "a minus b",
          "1 if a > b, else 0",
        ],
        answer: 1,
        explanation:
          "The ternary `(a > b) ? a : b` evaluates to `a` if `a > b`, otherwise `b`. So it returns the larger of the two — the maximum. This is a common idiom.",
      },
    ],
  },
};

export default lesson;
