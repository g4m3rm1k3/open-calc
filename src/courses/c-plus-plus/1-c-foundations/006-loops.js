const WHILE_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 1 2 3 4 5\\nSum 1..10 = 55

int main() {
    // while: repeat while condition is true
    int i = 1;
    while (i <= 5) {
        cout << i << " ";
        i++;      // must advance — or infinite loop
    }
    cout << endl;

    // Accumulate a sum
    int sum = 0, j = 1;
    while (j <= 10) { sum += j; j++; }
    cout << "Sum 1..10 = " << sum << endl;

    return 0;
}`;

const FOR_CODE = `#include <iostream>
#include <vector>
using namespace std;

// __OUTPUT__: 0 1 2 3 4\\n3 1 4 1 5 9

int main() {
    // for: init ; condition ; update — all in one line
    for (int i = 0; i < 5; i++) {
        cout << i << " ";
    }
    cout << endl;

    // Range-based for: iterate over every element
    vector<int> nums = {3, 1, 4, 1, 5, 9};
    for (int n : nums) {
        cout << n << " ";
    }
    cout << endl;

    return 0;
}`;

const DOWHILE_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Skipping evens, stopping at 7: 1 3 5\\nAttempt 1\\nAttempt 2\\nAttempt 3

int main() {
    // break exits the loop; continue skips to next iteration
    cout << "Skipping evens, stopping at 7: ";
    for (int k = 1; k <= 10; k++) {
        if (k == 7)      break;     // exit entirely
        if (k % 2 == 0)  continue;  // skip even numbers
        cout << k << " ";
    }
    cout << endl;

    // do-while: body always runs at least once
    int attempt = 0;
    do {
        attempt++;
        cout << "Attempt " << attempt << endl;
    } while (attempt < 3);

    return 0;
}`;

const NESTED_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: 1 2 3\\n2 4 6\\n3 6 9\\nPrimes: 2 3 5 7 11 13 17 19

int main() {
    // Nested loops: multiplication table
    for (int r = 1; r <= 3; r++) {
        for (int c = 1; c <= 3; c++) {
            cout << r * c << " ";
        }
        cout << endl;
    }

    // Inner break only exits the inner loop
    cout << "Primes: ";
    for (int n = 2; n <= 20; n++) {
        bool prime = true;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) { prime = false; break; }
        }
        if (prime) cout << n << " ";
    }
    cout << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-006",
  slug: "loops",
  chapter: "cpp-0",
  order: 6,
  title: "Loops",
  subtitle: "while, for, range-based for, do-while — repeat code and process collections",
  tags: ["c++", "cpp", "while", "for", "do-while", "loops", "break", "continue", "iteration"],
  aliases: [
    "c++ for loop",
    "c++ while loop",
    "c++ iteration",
    "range-based for c++",
    "c++ break continue",
  ],

  hook: `Computers do repetitive work effortlessly. Loops are how you harness that — sum a million numbers, process every item in a list, retry until success. Every algorithm is built from loops. Getting them right (right bounds, right condition, no off-by-one) is a core skill.`,

  mentalModel: [
    "**`while` checks its condition before every iteration.** If false on the first check, the body never runs. You control the loop variable — declare it before, update it inside. Forget the update and you have an infinite loop.",
    "**`for` bundles init, condition, and update in one line.** `for (int i = 0; i < n; i++)` is `while` with the loop control visible up front. The variable `i` is scoped to the loop. The three parts are optional — `for (;;)` is an infinite loop.",
    "**Range-based `for` iterates over every element.** `for (int x : vec)` gives each element in turn — no index needed. Use `auto& x` to modify elements in place. Use `const auto& x` to read large objects without copying.",
  ],

  intuition: {
    prose: [
      "**`while` is for 'repeat until'.** You don't know how many iterations up front — you keep going until a condition changes. Classic uses: reading input until valid, processing until a queue is empty, retrying until success.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then explore:**\n\n- Change `i <= 5` to `i < 5` — how many numbers print?\n- Change the while loop to count down from 5 to 1.\n- Compute the sum of squares: change `sum += j` to `sum += j * j`.\n- Try `while (true) { ... break; }` with a counter that breaks at 3. Same output as do-while?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": WHILE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**for and range-based for — run it then explore:**\n\n- Change `i < 5` to `i <= 5` — how many numbers now? Off-by-one is the most common loop bug.\n- Change `for (int n : nums)` to `for (int& n : nums) n *= 2;` — does the vector change in place?\n- Add a `for` loop that prints only the even-indexed elements: `for (int i = 0; i < nums.size(); i += 2)`.\n- Replace the range-based for with an index-based for — same output?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FOR_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`break` exits the innermost loop only.** `continue` skips the rest of the current iteration and moves to the next condition check. In nested loops, `break` only breaks the inner loop — the outer loop continues. To break both loops, use a boolean flag or put the inner loop in a function and `return`.",
      "**`do-while` always runs at least once.** The condition is checked after the body. Classic use: input validation — you always need at least one read attempt. Less common than `while` and `for`, but the right tool when 'run first, check after' is the logic.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**break, continue, do-while — run it then explore:**\n\n- Change `k == 7` to `k == 5` — which numbers print?\n- Remove the `continue` line — what changes? All numbers up to break?\n- Change `while (attempt < 3)` to `while (attempt < 1)` — how many times does it print?\n- Try `do {} while (false)` — runs exactly once regardless of condition.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": DOWHILE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Nested loops — run it then explore:**\n\n- Change the table to 5×5 by changing the loop bounds.\n- Print a right triangle: outer loop rows 1-5, inner loop `col < row` stars.\n- The prime sieve has `break` in the inner loop — change the inner break to `prime = false` only (no break). Does it still work? Which is faster?\n- Try printing the Fibonacci sequence up to 20 using a single loop.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": NESTED_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Off-by-one errors",
        body: "`for (int i = 0; i < n; i++)` iterates n times (0 to n-1). `i <= n` iterates n+1 times. For arrays: use `< size`. For 1-to-n counts: use `<= n`. Always check the first and last iteration value.",
      },
      {
        type: "tip",
        title: "Prefer range-based for when you don't need the index",
        body: "`for (auto x : vec)` is cleaner than `for (int i = 0; i < vec.size(); i++)` when you only care about values. Add `&` to modify in place: `for (auto& x : vec) x *= 2;`. Add `const` to prevent accidental modification: `for (const auto& x : vec)`.",
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
    int next = a + b;  a = b;  b = next;
}
// 0 1 1 2 3 5 8 13 21 34

// Maximum in a vector
vector<int> v = {3, 7, 2, 9, 1};
int maxVal = v[0];
for (int x : v) if (x > maxVal) maxVal = x;
cout << "Max: " << maxVal;  // 9`,
    },
    {
      title: "Input validation with do-while",
      body: `int choice;
do {
    cout << "Enter 1, 2, or 3: ";
    cin >> choice;
    if (choice < 1 || choice > 3)
        cout << "Invalid.\\n";
} while (choice < 1 || choice > 3);

cout << "You chose: " << choice;`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Read a positive integer `n` and print: (1) the sum of 1 to n, (2) n! (factorial), (3) all multiples of 3 up to n. Use a single `for` loop and accumulate sum and product in the same pass.",
      hint: "Initialize `sum = 0, product = 1` before the loop. Test `i % 3 == 0` inside.",
      walkthrough: [
        "Read int n from cin",
        "Initialize sum = 0, product = 1",
        "for i = 1 to n: sum += i; product *= i; if i%3==0 print i",
        "After loop, print sum and product",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Collatz conjecture: start with a positive integer `n`. If even, divide by 2; if odd, multiply by 3 and add 1. Repeat until n reaches 1. Print each value and count the steps. Try several starting values — the conjecture is that all sequences eventually reach 1.",
      hint: "Use `while (n != 1)`. Check `n % 2 == 0` to decide which branch.",
      walkthrough: [
        "Read int n from cin",
        "Initialize steps = 0",
        "while n != 1: n = (n%2==0) ? n/2 : 3*n+1; print n; steps++",
        "Print total steps",
        "Try n=27 — it takes 111 steps",
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
          "i goes 0, 1, 2, 3, 4 — that's 5 iterations. The condition `i < 5` is false when i=5, exiting the loop.",
      },
      {
        id: "cpp0-006-q2",
        type: "choice",
        text: "What distinguishes a do-while loop from a while loop?",
        options: [
          "do-while can only count up",
          "do-while executes the body at least once before checking the condition",
          "do-while is faster",
          "do-while requires break to exit",
        ],
        answer: 1,
        explanation:
          "`do { ... } while (cond)` executes the body first, then checks. Even if the condition is false on first check, the body has already run once.",
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
          "`break` exits the immediately enclosing loop or switch only. To break out of nested loops, use a flag variable or return from a function.",
      },
      {
        id: "cpp0-006-q4",
        type: "choice",
        text: "What does `for (auto& x : vec) x *= 2;` do?",
        options: [
          "Doubles a copy of each element — vec unchanged",
          "Doubles each element in-place because x is a reference",
          "Compile error: cannot modify elements in range-based for",
          "Doubles every other element",
        ],
        answer: 1,
        explanation:
          "`auto& x` declares x as a reference to each element. Assigning to x modifies the actual element in vec. Without `&`, x is a copy and vec is unchanged.",
      },
    ],
  },
};

export default lesson;
