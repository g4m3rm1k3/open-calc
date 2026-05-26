const LOOPS_CODE = `#include <iostream>
#include <vector>
using namespace std;

// __OUTPUT__: --- while loop ---\\n1 2 3 4 5 \\n--- for loop (sum) ---\\nSum 1..10 = 55\\n--- range-based for ---\\n3 1 4 1 5 9 2 6 \\n--- do-while (runs at least once) ---\\nAttempt 1\\nAttempt 2\\nAttempt 3\\n--- break and continue ---\\nSkipping evens, stopping at 7: 1 3 5 \\n--- Nested loops (multiplication table) ---\\n1 2 3 \\n2 4 6 \\n3 6 9

int main() {
    // ── while ──────────────────────────────────────────────────
    cout << "--- while loop ---" << endl;
    int i = 1;
    while (i <= 5) {
        cout << i << " ";
        i++;          // don't forget to advance, or it loops forever!
    }
    cout << endl;

    // ── for ────────────────────────────────────────────────────
    cout << "--- for loop (sum) ---" << endl;
    int sum = 0;
    for (int j = 1; j <= 10; j++) {
        sum += j;
    }
    cout << "Sum 1..10 = " << sum << endl;

    // ── range-based for (C++11) ────────────────────────────────
    cout << "--- range-based for ---" << endl;
    vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    for (int n : nums) {
        cout << n << " ";
    }
    cout << endl;

    // ── do-while ───────────────────────────────────────────────
    cout << "--- do-while (runs at least once) ---" << endl;
    int attempt = 0;
    do {
        attempt++;
        cout << "Attempt " << attempt << endl;
    } while (attempt < 3);

    // ── break and continue ─────────────────────────────────────
    cout << "--- break and continue ---" << endl;
    cout << "Skipping evens, stopping at 7: ";
    for (int k = 1; k <= 10; k++) {
        if (k == 7) break;           // exit loop entirely
        if (k % 2 == 0) continue;    // skip rest of this iteration
        cout << k << " ";
    }
    cout << endl;

    // ── Nested loops ───────────────────────────────────────────
    cout << "--- Nested loops (multiplication table) ---" << endl;
    for (int row = 1; row <= 3; row++) {
        for (int col = 1; col <= 3; col++) {
            cout << (row * col) << " ";
        }
        cout << endl;
    }

    return 0;
}`;

const lesson = {
  id: "cpp-0-006",
  slug: "loops",
  chapter: "cpp-0",
  order: 6,
  title: "Loops",
  subtitle: "Repeat code with while, for, do-while, and range-based for",
  tags: ["c++", "cpp", "while", "for", "do-while", "loops", "break", "continue", "iteration"],
  aliases: [
    "c++ for loop",
    "c++ while loop",
    "c++ iteration",
    "range-based for c++",
    "c++ break continue",
  ],

  hook: `Computers are good at one thing humans aren't: doing the same thing a million times without boredom or error. Loops are how you harness that power. Every algorithm — sorting, searching, processing data — is built from loops. Understanding when to use each loop type, and how to avoid common pitfalls like off-by-one errors and infinite loops, is foundational to writing correct programs.`,

  mentalModel: [
    "**`while` is for 'repeat while true'.** Use it when you don't know how many iterations you need upfront: reading input until valid, processing until a condition is met. You're responsible for the loop variable — declare it before, update it inside, or you'll loop forever.",
    "**`for` is for counted iteration.** It bundles init, condition, and update into one line: `for (int i = 0; i < n; i++)`. The three parts are separated by semicolons. Any or all can be empty (`for (;;)` is an infinite loop). Loop variable `i` is scoped to the loop block in C++.",
    "**Range-based `for` (C++11) is for 'for each element'.** `for (int x : collection)` iterates over every element in `collection` — works with arrays, `vector`, `string`, and anything with `begin()`/`end()`. Use `const auto& x` to avoid copying large elements. This is the preferred form in modern C++ for collection iteration.",
  ],

  intuition: {
    prose: [
      "**`while` vs `for` vs `do-while`** differ in one key dimension: where the condition is checked relative to the loop body. `while` checks *before* entering — the body may never execute. `for` is `while` with init/update syntax sugar — still checks before. `do-while` checks *after* — the body always executes at least once. Use `do-while` for input validation: `do { cin >> x; } while (x <= 0);` — you always need at least one input attempt.",
      "**Off-by-one errors** are the most common loop bug. `for (int i = 0; i < n; i++)` iterates `n` times (indices 0 to n-1). `for (int i = 0; i <= n; i++)` iterates `n+1` times. Decide whether your loop should use `<` or `<=` based on what you're iterating over: 0-based arrays use `< size`, 1-based counts use `<= n`. Writing tests for the first and last iteration is a good habit.",
      "**`break` exits the innermost loop immediately.** `continue` skips the rest of the current iteration and goes to the next. They only affect the innermost enclosing loop — in nested loops, `break` only breaks the inner loop. To break out of nested loops, use a flag variable, a function return, or the C `goto` (rarely used in modern C++). A common pattern: `bool found = false; for (...) { for (...) { if (cond) { found = true; break; } } if (found) break; }`",
      "**Infinite loops are legitimate.** `while (true) { ... }` with an internal `break` or `return` is a common pattern for server loops, game loops, and REPL (read-eval-print loop) designs. The key is always having a clear exit condition that will eventually trigger. Use `while (running)` where `running` is a flag that gets set to false, or `while (true)` with explicit `break` conditions.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Experiment with loops:**\n\n1. Compile and run — trace each section's output\n2. Change the while loop to count down: start at 5, go to 1\n3. Compute the sum of squares: `for (int i=1; i<=10; i++) sum += i*i;`\n4. Change range-based for to `for (int& n : nums) n *= 2;` — modify in place\n5. Try a `while(true)` loop that breaks when a counter hits 3 (simulating a game loop)\n6. Print a 5×5 multiplication table by adjusting the nested loop bounds",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": LOOPS_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Loop invariants are the key to correctness.** A loop invariant is a property that holds at the start of every iteration. For a sum loop: invariant = 'after iteration i, `sum` holds the sum of elements 0 through i-1'. At loop termination, i = n and the invariant gives us 'sum holds the sum of all n elements'. Writing down invariants — even informally — forces you to think about what the loop is doing and catches off-by-one errors before they become bugs.",
      "**Range-based for and iterators.** `for (auto& x : container)` is syntactic sugar for iterator-based iteration: `auto it = container.begin(); while (it != container.end()) { x = *it; ...; ++it; }`. This is why it works with any container that provides `begin()` and `end()` — including custom classes. The `auto&` (reference) avoids copying and allows modification. `const auto&` allows reading without copying but prevents modification.",
      "**Loop transformation and optimization.** Compilers aggressively optimize loops: loop unrolling (replicating body to reduce iteration overhead), vectorization (processing multiple elements per CPU instruction using SIMD), and hoisting (moving loop-invariant computations out of the loop). Enabling `-O2` or `-O3` triggers these. Understanding that the compiler transforms your loop means you can write clear, correct code and let the optimizer handle performance — premature micro-optimization of loops is usually counterproductive.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Infinite loops: always have an exit",
        body: "Every loop must eventually terminate (unless it's an intentional server/game loop). Common infinite loop causes: forgetting to increment `i`, using `=` instead of `==` in the condition, off-by-one in the condition direction. If your program hangs, add a print inside the loop to see if it's looping.",
      },
      {
        type: "info",
        title: "Loop variable scope",
        body: "Variables declared in a `for` loop header are scoped to the loop: `for (int i = 0; ...)` — `i` is not accessible after the loop. This is intentional and good — it prevents 'leaking' loop variables into outer scope. If you need the final value, declare it before the loop: `int i = 0; for (; i < n; i++) {...}; // i accessible here`",
      },
      {
        type: "tip",
        title: "Prefer range-based for when you don't need the index",
        body: "If you need the value but not its position, `for (auto x : vec)` is cleaner than `for (int i = 0; i < vec.size(); i++) { auto x = vec[i]; }`. If you need both value and index, use the index-based form or `std::enumerate` (C++23). Use `const auto&` for read-only access to complex objects.",
      },
    ],
  },

  examples: [
    {
      title: "Classic algorithms using loops",
      body: `// Fibonacci sequence
int a = 0, b = 1;
for (int i = 0; i < 10; i++) {
    cout << a << " ";
    int next = a + b;
    a = b;
    b = next;
}
// Output: 0 1 1 2 3 5 8 13 21 34

// Find maximum in array
int arr[] = {3, 7, 2, 9, 1, 5};
int n = 6;
int maxVal = arr[0];
for (int i = 1; i < n; i++) {
    if (arr[i] > maxVal) maxVal = arr[i];
}
cout << "Max: " << maxVal << endl;  // 9

// Count vowels in string
string s = "hello world";
int vowelCount = 0;
for (char c : s) {
    if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u') vowelCount++;
}
cout << "Vowels: " << vowelCount << endl;  // 3`,
    },
    {
      title: "Nested loops: pattern printing",
      body: `// Print a right triangle of *
int h = 5;
for (int row = 1; row <= h; row++) {
    for (int col = 0; col < row; col++) {
        cout << "* ";
    }
    cout << "\\n";
}
// *
// * *
// * * *
// * * * *
// * * * * *

// Prime number sieve (basic trial division)
for (int n = 2; n <= 20; n++) {
    bool isPrime = true;
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) { isPrime = false; break; }
    }
    if (isPrime) cout << n << " ";
}
// 2 3 5 7 11 13 17 19`,
    },
    {
      title: "do-while for validated input",
      body: `int choice;
do {
    cout << "Enter 1, 2, or 3: ";
    cin >> choice;
    if (choice < 1 || choice > 3) {
        cout << "Invalid. ";
    }
} while (choice < 1 || choice > 3);

cout << "You chose: " << choice << endl;

// Input validation with cin fail check
double x;
cout << "Enter a positive number: ";
while (!(cin >> x) || x <= 0) {
    cin.clear();
    cin.ignore(1000, '\\n');
    cout << "Try again: ";
}
cout << "Got: " << x << endl;`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that reads a positive integer `n` and prints: (1) the sum of all integers from 1 to n, (2) the product (n!), (3) all integers from 1 to n that are divisible by 3. Use a single `for` loop and accumulate sum and product in the same pass.",
      hint: "Initialize `sum = 0, product = 1` before the loop. Test `i % 3 == 0` inside the loop.",
      walkthrough: [
        "Read int n from cin",
        "Initialize sum = 0, product = 1",
        "for (int i = 1; i <= n; i++): sum += i; product *= i; if (i % 3 == 0) print i",
        "After loop, print sum and product",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Collatz conjecture: Start with any positive integer `n`. If `n` is even, divide by 2. If odd, multiply by 3 and add 1. Repeat until `n` reaches 1. Print each value in the sequence and count the steps. The conjecture is that all sequences eventually reach 1 — verify it for several starting values.",
      hint: "Use `while (n != 1)`. Check `n % 2 == 0` to decide which operation to apply.",
      walkthrough: [
        "Read int n from cin",
        "Initialize step counter: int steps = 0",
        "while (n != 1): check if n is even (n/2) or odd (3*n+1), print n, increment steps",
        "After loop, print total steps",
        "Try n = 27 — it takes 111 steps!",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-006-q1",
        type: "choice",
        text: "How many times does `for (int i = 0; i < 5; i++)` execute its body?",
        options: ["4", "5", "6", "It depends on the body"],
        answer: 1,
        explanation:
          "`i` goes from 0 to 4 (inclusive) — the body executes when i=0,1,2,3,4 — that's 5 iterations. The condition `i < 5` is false when `i = 5`, which exits the loop.",
      },
      {
        id: "cpp0-006-q2",
        type: "choice",
        text: "What distinguishes a do-while loop from a while loop?",
        options: [
          "do-while can only count up",
          "do-while executes the body at least once before checking the condition",
          "do-while is faster than while",
          "do-while requires break to exit",
        ],
        answer: 1,
        explanation:
          "`do { ... } while (cond);` executes the body first, then checks the condition. If the condition is false on the first check, the body has still run once. Use it when the body must always execute at least once, like prompting for input.",
      },
      {
        id: "cpp0-006-q3",
        type: "choice",
        text: "In nested loops, what does `break` do?",
        options: [
          "Exits all loops",
          "Exits only the innermost enclosing loop",
          "Goes to the next iteration of the outer loop",
          "Causes a compile error in nested contexts",
        ],
        answer: 1,
        explanation:
          "`break` only exits the immediately enclosing loop or switch. To break out of nested loops, use a flag variable, a function return, or additional conditions.",
      },
      {
        id: "cpp0-006-q4",
        type: "choice",
        text: "What does `for (auto& x : vec) x *= 2;` do?",
        options: [
          "Creates a copy of each element and doubles the copy",
          "Doubles each element in-place because x is a reference",
          "Compile error: cannot modify elements in range-based for",
          "Doubles every other element",
        ],
        answer: 1,
        explanation:
          "`auto& x` declares `x` as a reference to each element. Assigning to `x` modifies the actual element in `vec`. Without the `&`, `x` is a copy and modifications don't affect the vector.",
      },
    ],
  },
};

export default lesson;
