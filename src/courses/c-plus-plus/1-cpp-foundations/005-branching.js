const IF_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Score: 85\\nGrade: B\\nPassed: yes

int main() {
    int score = 85;
    cout << "Score: " << score << endl;

    string grade;
    if      (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else                  grade = "F";

    cout << "Grade: " << grade << endl;

    string result = (score >= 60) ? "yes" : "no";
    cout << "Passed: " << result << endl;

    return 0;
}`;

const SWITCH_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Day 3 = Wednesday

int main() {
    int day = 3;
    string name;

    switch (day) {
        case 1:  name = "Monday";    break;
        case 2:  name = "Tuesday";   break;
        case 3:  name = "Wednesday"; break;
        case 4:  name = "Thursday";  break;
        case 5:  name = "Friday";    break;
        default: name = "Weekend";   break;
    }

    cout << "Day " << day << " = " << name << endl;
    return 0;
}`;

const TERNARY_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: abs(-7) = 7\\nsign of 42 = positive\\nmax(3, 9) = 9

int main() {
    int x = -7;
    int abs_x = (x >= 0) ? x : -x;
    cout << "abs(" << x << ") = " << abs_x << endl;

    int n = 42;
    string sign = (n > 0) ? "positive" : (n < 0) ? "negative" : "zero";
    cout << "sign of " << n << " = " << sign << endl;

    int a = 3, b = 9;
    int bigger = (a > b) ? a : b;
    cout << "max(" << a << ", " << b << ") = " << bigger << endl;

    return 0;
}`;

const GUARD_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Score 110 rejected: out of range\\nScore 85 -> Grade B

string getGrade(int score) {
    // Guard clauses: reject invalid input first, at low indent
    if (score < 0 || score > 100) {
        return "rejected: out of range";
    }
    // Main logic is flat — no nesting needed
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

int main() {
    cout << "Score 110 " << getGrade(110) << endl;
    cout << "Score 85 -> Grade " << getGrade(85) << endl;
    return 0;
}`;

const lesson = {
  id: "cpp-0-005",
  slug: "branching",
  chapter: "cpp-0",
  order: 5,
  title: "Branching",
  subtitle: "if/else, switch, ternary, and guard clauses — make decisions in code",
  tags: ["c++", "cpp", "if", "else", "switch", "ternary", "conditional", "branching"],
  aliases: [
    "c++ if else",
    "c++ switch statement",
    "c++ ternary operator",
    "conditional logic c++",
    "c++ control flow",
  ],

  hook: `Programs that always do the same thing regardless of input aren't useful. Branching makes code respond to data. Every non-trivial program is a tree of decisions — learning to structure those decisions cleanly is what separates readable code from spaghetti.`,

  mentalModel: [
    "**`if/else if/else` tests conditions in order and runs the first matching branch.** Once a true condition is found, all remaining branches are skipped. Structure chains from most restrictive to least restrictive — `score >= 90` before `score >= 80` — or every high score will match the first condition.",
    "**`switch` matches one integer value against constants.** It compiles to a jump table — O(1) lookup. Always add `break` after each case or execution falls through into the next. Use `default` to handle unexpected values. `switch` only works on integral types: `int`, `char`, `enum` — not `string` or `double`.",
    "**The ternary `cond ? a : b` is an expression that produces a value.** Unlike `if`, it can appear inside other expressions: `cout << (x > 0 ? \"pos\" : \"neg\")`. Use it for simple value selection. Use `if/else` when you have multiple statements or complex logic.",
  ],

  intuition: {
    prose: [
      "**if/else if/else is a decision chain.** Conditions are tested in order — only the first true one executes. Changing a score from 85 to 95 should change the grade from B to A. Run the code and verify it does.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then experiment:**\n\n- Change `score = 85` to `95`, `79`, `65`, `55` — does the grade update correctly?\n- What happens if you change the order of else-if branches (put `>= 80` before `>= 90`)? Try it.\n- Change the ternary `score >= 60` to test against a different threshold.\n- Add a check at the top: `if (score < 0 || score > 100)` — print an error and return early.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": IF_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**switch — run it then explore:**\n\n- Change `day = 3` to `7` — do you see `Weekend`?\n- Remove the `break` after `case 3` — what happens? This is fallthrough.\n- Try grouping cases: `case 6: case 7: name = \"Weekend\"; break;` — both match.\n- Try switching on a `char`: `char c = 'A'; switch(c)` — does it compile? switch works on any integral type.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SWITCH_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Ternary as an expression.** The key difference: `if` is a statement, ternary is an expression. That means you can use it anywhere a value is expected — in `cout <<`, in initialization, in function arguments. `int abs = (x >= 0) ? x : -x;` is idiomatic. Chain them for 3-way comparisons: `(n > 0) ? \"pos\" : (n < 0) ? \"neg\" : \"zero\"`.",
      "**Guard clauses flatten nested code.** When you check error conditions at the top and return early, the main logic stays at low indentation. Compare deep nesting vs guard clauses — the guard version is easier to read because the happy path is always at the lowest indent level. Every extra level of nesting adds cognitive load.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Ternary — run it then explore:**\n\n- What does `(a > b) ? a : b` compute for other values? Try `a=10, b=5` and `a=5, b=10`.\n- Write a `clamp` using nested ternaries: `int clamped = (x < 0) ? 0 : (x > 100) ? 100 : x;`\n- Try `cout << ((x > 0) ? \"pos\" : \"non-pos\") << endl;` — ternary directly in cout.\n- What type does `(true) ? 1 : 2.5` produce? (Hint: the compiler finds a common type)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TERNARY_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Guard clauses — run it then explore:**\n\n- Try `getGrade(-5)` and `getGrade(101)` — does the guard reject them?\n- Remove the guard clause and see how the function would need to be restructured with nested ifs.\n- Add another guard: reject scores exactly 0 with a specific message `\"zero score\"`.\n- Add a function `string classify(int n)` that returns \"negative\", \"zero\", or \"positive\" using guard clauses.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": GUARD_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Forgetting break causes switch fallthrough",
        body: "Without `break`, execution continues into the next case's statements. This is a common silent bug. Mark intentional fallthrough with `[[fallthrough]];` (C++17) so the compiler warns about accidental cases.",
      },
      {
        type: "tip",
        title: "Guard clauses keep nesting shallow",
        body: "Check invalid/edge cases first and return early. The main logic then runs flat, without deep nesting. A function with 3+ levels of `if` nesting is usually a sign you should add guard clauses or split into smaller functions.",
      },
    ],
  },

  examples: [
    {
      title: "FizzBuzz — classic branching exercise",
      body: `for (int i = 1; i <= 20; i++) {
    if      (i % 15 == 0) cout << "FizzBuzz\\n";
    else if (i % 3 == 0)  cout << "Fizz\\n";
    else if (i % 5 == 0)  cout << "Buzz\\n";
    else                  cout << i << "\\n";
}`,
    },
    {
      title: "Vowel/consonant with switch fallthrough",
      body: `char c = 'e';
switch (c) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
        cout << c << " is a vowel\\n";
        break;
    default:
        cout << c << " is not a vowel\\n";
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a BMI calculator. Read weight (kg) and height (m), compute `BMI = weight / (height * height)`, then classify: < 18.5 = Underweight, 18.5–25 = Normal, 25–30 = Overweight, >= 30 = Obese. Print the BMI value and category.",
      hint: "Use `if/else if/else`. Use `double` for inputs to avoid integer division.",
      walkthrough: [
        "Read double weight, height from cin",
        "Compute double bmi = weight / (height * height)",
        "Chain if/else if/else to classify",
        "Print bmi and category",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a simple calculator using switch. Read two numbers and an operator character (`+`, `-`, `*`, `/`). Use switch on the operator to compute and print the result. Handle division by zero as a special case. Use a `default` case for unknown operators.",
      hint: "Read `char op; double a, b; cin >> a >> op >> b;` then `switch(op)`.",
      walkthrough: [
        "cin >> a >> op >> b",
        "switch(op) with cases '+', '-', '*', '/'",
        "For '/': check if b == 0 first",
        "Default case: print unknown operator",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-005-q1",
        type: "choice",
        text: "In an if-else if-else chain, how many branches execute when the first condition is true?",
        options: [
          "All conditions are checked",
          "Only the first matching branch, then control jumps past the chain",
          "The matching branch and all subsequent ones",
          "It depends on whether conditions overlap",
        ],
        answer: 1,
        explanation:
          "Only one branch executes. Once a true condition is found, its block runs and all remaining else-if and else blocks are skipped.",
      },
      {
        id: "cpp0-005-q2",
        type: "choice",
        text: "What happens in a switch when you omit `break` from a case?",
        options: [
          "Control exits the switch",
          "A compile error",
          "Execution falls through and runs the next case's code",
          "The switch restarts from case 1",
        ],
        answer: 2,
        explanation:
          "Without `break`, execution falls through — the next case's statements run even if that case label didn't match. Mark intentional fallthrough with `[[fallthrough]]`.",
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
          "`switch` requires an integral expression. You cannot switch on `double`, `float`, or `string` — use if-else for those.",
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
          "The ternary evaluates to `a` when `a > b`, otherwise `b`. This returns the larger of the two — the maximum.",
      },
    ],
  },
};

export default lesson;
