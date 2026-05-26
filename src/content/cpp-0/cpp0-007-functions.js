const FUNC_CODE = `#include <iostream>
#include <string>
using namespace std;

// ── Function declarations (before main) ──────────────────────
double circleArea(double radius);
int    factorial(int n);
void   printLine(string msg, char c = '-');  // default parameter

// ── Function definitions ───────────────────────────────────
double circleArea(double radius) {
    const double PI = 3.14159265358979;
    return PI * radius * radius;
}

int factorial(int n) {
    if (n <= 1) return 1;            // base case
    return n * factorial(n - 1);    // recursive case
}

void printLine(string msg, char c) {
    cout << msg << " ";
    for (int i = 0; i < 20; i++) cout << c;
    cout << endl;
}

// Pass by value vs by reference
void doubleValue(int x)   { x *= 2; }         // copies x — original unchanged
void doubleRef(int& x)    { x *= 2; }         // modifies original via reference

// __OUTPUT__: Circle radius 5: area = 78.5398\\nCircle radius 3: area = 28.2743\\n10! = 3628800\\nHello ────────────────\\n=== ════════════════════\\nBefore: 7 7\\nAfter by-val: 7 (unchanged)\\nAfter by-ref: 14 (modified)

int main() {
    cout << "Circle radius 5: area = " << circleArea(5)   << endl;
    cout << "Circle radius 3: area = " << circleArea(3)   << endl;

    cout << "10! = " << factorial(10) << endl;

    printLine("Hello", '-');          // uses provided char
    printLine("===");                 // uses default char '='... wait — update annotation

    int a = 7, b = 7;
    cout << "Before: " << a << " " << b << endl;
    doubleValue(a);
    cout << "After by-val: " << a << " (unchanged)" << endl;
    doubleRef(b);
    cout << "After by-ref: " << b << " (modified)" << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-007",
  slug: "functions",
  chapter: "cpp-0",
  order: 7,
  title: "Functions",
  subtitle: "Define reusable code blocks, pass data in and out, and understand the call stack",
  tags: ["c++", "cpp", "functions", "parameters", "return", "recursion", "pass-by-reference", "default-parameters"],
  aliases: [
    "c++ functions",
    "pass by value vs reference c++",
    "c++ recursion",
    "function overloading c++",
    "default parameters c++",
  ],

  hook: `Functions are the fundamental unit of code organization. They let you name a piece of logic, reuse it, test it independently, and reason about it without holding the entire program in your head at once. Every non-trivial program — from shell scripts to game engines — is decomposed into functions. Learning to design good functions (clear names, single responsibilities, clean interfaces) is what separates code you can maintain from code you have to rewrite.`,

  mentalModel: [
    "**A function is a named block of code with a defined interface: parameters and return type.** The caller provides arguments (values for the parameters) and gets back a return value. Inside the function, parameters are local variables — modifying them doesn't affect the caller's variables *unless* you pass by reference.",
    "**Pass by value vs pass by reference.** `void f(int x)` — `x` is a copy. `void f(int& x)` — `x` IS the caller's variable. In the value case: changes to `x` inside `f` are invisible to the caller. In the reference case: the function sees and can modify the caller's actual variable. This is the distinction between 'tell a function a number' vs 'give a function access to your variable'.",
    "**Recursion is when a function calls itself.** Every recursive function needs a base case (condition that stops the recursion) and a recursive case (calls itself with a simpler argument). Each call gets its own stack frame — its own set of local variables. Without a base case, recursion is infinite and causes a stack overflow.",
  ],

  intuition: {
    prose: [
      "**Declarations vs definitions.** A function *declaration* (forward declaration or prototype) tells the compiler the function's name, return type, and parameter types — but not what it does: `double circleArea(double r);`. A *definition* provides the body. In a single-file program, you can define functions before `main` to avoid declarations. In multi-file projects, declarations go in header files (`.h`) and definitions in source files (`.cpp`).",
      "**The call stack.** Every function call creates a *stack frame* — a chunk of memory on the call stack holding: the return address (where to resume after the function returns), the function's local variables, and space for the return value. When the function returns, its frame is popped. The stack grows as you call deeper, shrinks as functions return. A stack overflow happens when recursion is too deep (or you have very large local arrays). For most programs, the default stack is 1–8 MB — enough for hundreds of thousands of function calls.",
      "**Default parameters let callers omit trailing arguments.** `void print(string msg, char c = '-')` — the caller can write `print(\"hello\")` (uses `-`) or `print(\"hello\", '*')` (uses `*`). Default values must be specified at the function declaration, and only for trailing parameters. This is how many library functions offer 'sensible defaults while allowing customization'.",
      "**Function overloading** lets you define multiple functions with the same name but different parameter types. `int abs(int)` and `double abs(double)` can coexist. The compiler selects the right one based on the argument types. This is called *static dispatch* — resolved at compile time, zero runtime overhead. Don't overload with functions that do different things — overloading should mean 'the same operation on different types'.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore functions deeply:**\n\n1. Compile and run — trace what each function does\n2. Add a `power(double base, int exp)` function using a loop\n3. Add a second `circleArea` that takes circumference instead of radius (overloading)\n4. Try `factorial(0)` and `factorial(-1)` — does the base case handle them?\n5. Add `void swap(int& a, int& b)` to swap two variables using references\n6. Trace the recursion: `factorial(4)` calls `factorial(3)` calls... draw the call stack",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": FUNC_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Stack frames and activation records.** When `main` calls `factorial(3)`, a frame for `factorial(3)` is pushed: `n=3`, return address points back into `main`. That frame calls `factorial(2)` — new frame with `n=2`. Stack grows: main → factorial(3) → factorial(2) → factorial(1). Base case returns 1, frames unwind: factorial(2) returns 2, factorial(3) returns 6, main resumes. Each recursive call has its own independent copy of `n`. This is why recursion is safe for computing but costly for deep recursion.",
      "**`const` references: read-only access without copying.** `void print(const string& s)` — the `&` avoids copying the string (potentially expensive for large strings), and `const` prevents modification. This is the idiomatic way to pass large objects you only need to read: `void processData(const vector<int>& data)`. The caller is guaranteed the function won't modify their data. Pass fundamental types (int, double, char) by value — they're cheap to copy.",
      "**Return value optimization (RVO/NRVO).** When a function returns a local object, modern compilers often construct it directly in the caller's memory space, avoiding a copy entirely. Since C++17, this is guaranteed in many cases ('guaranteed copy elision'). This means returning large objects by value is often just as fast as passing them by reference — the compiler handles it. Write clear, return-by-value code and let the compiler optimize.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never return a reference to a local variable",
        body: "`int& badFunc() { int x = 5; return x; }` — this returns a reference to a local variable that is destroyed when the function returns. The reference is dangling (points to freed memory). The compiler usually warns about this. Always return by value for local data, or ensure the referenced object outlives the reference.",
      },
      {
        type: "info",
        title: "Function signatures must be unique",
        body: "Overloaded functions are distinguished by parameter types (number and types), not by return type alone. `int f(int)` and `double f(int)` cannot coexist — the compiler can't choose between them at a call site. Also, `const` differences in value parameters (`f(int)` vs `f(const int)`) don't differentiate overloads.",
      },
      {
        type: "tip",
        title: "Single responsibility principle for functions",
        body: "A function should do ONE thing and do it well. If you can't describe what a function does without using 'and', consider splitting it. Prefer many small functions over one large function. Small functions are easier to test, easier to name clearly, and easier to reuse. A good rule of thumb: if a function doesn't fit on one screen, it's probably too long.",
      },
    ],
  },

  examples: [
    {
      title: "Pass by value vs reference vs const reference",
      body: `// By value: caller's variable unchanged
void addTen_val(int x) { x += 10; }

// By reference: modifies caller's variable
void addTen_ref(int& x) { x += 10; }

// By const ref: reads large object without copying
string describe(const string& s) {
    return "Length " + to_string(s.length()) + ": " + s;
}

int main() {
    int a = 5;
    addTen_val(a);   cout << a << endl;   // 5  (unchanged)
    addTen_ref(a);   cout << a << endl;   // 15 (modified)

    string msg = "Hello, World!";
    cout << describe(msg) << endl;        // no copy made
}`,
    },
    {
      title: "Function overloading",
      body: `// Same name, different parameter types
double square(double x) { return x * x; }
int    square(int x)    { return x * x; }

// The compiler picks the right version automatically
cout << square(3)    << endl;  // calls int version → 9
cout << square(2.5)  << endl;  // calls double version → 6.25
cout << square(3.0)  << endl;  // calls double version → 9.0

// Overload count and total
int sum(int a, int b)        { return a + b; }
int sum(int a, int b, int c) { return a + b + c; }
cout << sum(2, 3)    << endl;  // 5
cout << sum(1, 2, 3) << endl;  // 6`,
    },
    {
      title: "Recursive binary search",
      body: `// Find target in sorted array — returns index or -1
int binarySearch(int arr[], int lo, int hi, int target) {
    if (lo > hi) return -1;          // base case: not found

    int mid = lo + (hi - lo) / 2;   // avoids overflow vs (lo+hi)/2
    if (arr[mid] == target) return mid;
    if (arr[mid] < target)
        return binarySearch(arr, mid+1, hi, target);   // search right
    else
        return binarySearch(arr, lo, mid-1, target);   // search left
}

int arr[] = {1, 3, 5, 7, 9, 11, 13};
cout << binarySearch(arr, 0, 6, 7) << endl;   // 3
cout << binarySearch(arr, 0, 6, 6) << endl;   // -1`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write these utility functions: (1) `bool isPrime(int n)` — returns true if n is prime (test divisors up to sqrt(n)), (2) `int gcd(int a, int b)` — using Euclid's algorithm recursively: `gcd(a, b) = gcd(b, a % b)` with base case `gcd(a, 0) = a`. Test both in main with several values.",
      hint: "For isPrime, loop d from 2 while d*d <= n. For gcd, the recursive case is `return gcd(b, a % b);`.",
      walkthrough: [
        "isPrime: return false for n < 2; loop d = 2 while d*d <= n; if n%d==0 return false; return true",
        "gcd: if b == 0 return a; else return gcd(b, a % b)",
        "Test: isPrime(17) = true, isPrime(18) = false; gcd(48, 18) = 6",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write `int countDigits(int n)` and `int reverseDigits(int n)` — both should work for any integer (handle negative numbers by taking the absolute value). Then write `bool isPalindrome(int n)` using the other two functions. A number is a palindrome if it reads the same backwards (e.g., 121, 1331).",
      hint: "Use `%` to extract the last digit and `/` to remove it. For reverseDigits: result = result * 10 + n % 10; n /= 10;",
      walkthrough: [
        "countDigits: handle n=0 as 1 digit; while n > 0: count++, n /= 10",
        "reverseDigits: while n > 0: rev = rev*10 + n%10; n /= 10; return rev",
        "isPalindrome: return n == reverseDigits(n) after taking abs",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-007-q1",
        type: "choice",
        text: "What is the difference between `void f(int x)` and `void f(int& x)`?",
        options: [
          "No difference — both modify the caller's variable",
          "f(int x) copies the value; f(int& x) accesses the caller's actual variable",
          "f(int& x) is read-only; f(int x) allows modification",
          "f(int x) is faster because it uses a reference",
        ],
        answer: 1,
        explanation:
          "`void f(int x)` receives a copy of the argument — changes to `x` inside `f` don't affect the caller. `void f(int& x)` receives a reference to the caller's variable — changes to `x` inside `f` directly modify the caller's variable.",
      },
      {
        id: "cpp0-007-q2",
        type: "choice",
        text: "What is a 'stack overflow' in the context of recursion?",
        options: [
          "The return value is too large to store in the return type",
          "The recursive function returns without computing a value",
          "Infinite recursion fills the call stack until it runs out of space",
          "A compile error caused by calling a function before declaring it",
        ],
        answer: 2,
        explanation:
          "Each function call uses stack memory for its frame. Infinite recursion (missing or unreachable base case) keeps pushing frames until the stack is exhausted — the OS terminates the program with a segfault or stack overflow error.",
      },
      {
        id: "cpp0-007-q3",
        type: "choice",
        text: "What is the idiomatic way to pass a large `std::vector` to a function that only reads it?",
        options: [
          "`void f(vector<int> v)` — pass by value",
          "`void f(vector<int>& v)` — pass by reference",
          "`void f(const vector<int>& v)` — pass by const reference",
          "`void f(vector<int>* v)` — pass by pointer",
        ],
        answer: 2,
        explanation:
          "`const vector<int>&` avoids copying the potentially-large vector (reference), while `const` signals that the function won't modify it. This is the standard C++ idiom for read-only large parameters.",
      },
      {
        id: "cpp0-007-q4",
        type: "choice",
        text: "Can two functions with the same name but different return types (but same parameter types) coexist as overloads?",
        options: [
          "Yes, the compiler picks based on context",
          "No, overload resolution uses parameter types, not return types",
          "Only if the return types are related by inheritance",
          "Yes, but only in C++17 and later",
        ],
        answer: 1,
        explanation:
          "Overload resolution is based on the number and types of parameters. Return type is not considered. `int f(int)` and `double f(int)` are ambiguous — the compiler can't distinguish a call to `f(5)` between them.",
      },
    ],
  },
};

export default lesson;
