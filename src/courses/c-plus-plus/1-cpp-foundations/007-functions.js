const BASIC_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Area of circle r=5: 78.5398\\n10! = 3628800

double circleArea(double r) {
    const double PI = 3.14159265358979;
    return PI * r * r;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Area of circle r=5: " << circleArea(5) << endl;
    cout << "10! = " << factorial(10) << endl;
    return 0;
}`;

const PARAMS_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: after val: a=7 (unchanged)\\nafter ref: b=14 (modified)

void doubleByVal(int x) { x *= 2; }    // copy — caller unchanged
void doubleByRef(int& x) { x *= 2; }  // reference — caller modified

int main() {
    int a = 7;
    doubleByVal(a);
    cout << "after val: a=" << a << " (unchanged)" << endl;

    int b = 7;
    doubleByRef(b);
    cout << "after ref: b=" << b << " (modified)" << endl;

    return 0;
}`;

const OVERLOAD_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: square(3) = 9\\nsquare(2.5) = 6.25\\ngreet() = Hello!\\ngreet(Bob) = Hello, Bob!

int    square(int x)    { return x * x; }
double square(double x) { return x * x; }

// Default parameter: caller can omit name
void greet(string name = "") {
    if (name.empty()) cout << "Hello!" << endl;
    else              cout << "Hello, " << name << "!" << endl;
}

int main() {
    cout << "square(3) = "   << square(3)   << endl;
    cout << "square(2.5) = " << square(2.5) << endl;
    greet();
    greet("Bob");
    return 0;
}`;

const RECURSE_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: fib(8) = 21\\ngcd(48, 18) = 6

// Fibonacci: each number is sum of two before it
int fib(int n) {
    if (n <= 1) return n;       // base cases: fib(0)=0, fib(1)=1
    return fib(n-1) + fib(n-2); // recursive case
}

// Euclid's GCD: gcd(a,b) = gcd(b, a%b), stops at gcd(a,0)=a
int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main() {
    cout << "fib(8) = "      << fib(8)     << endl;
    cout << "gcd(48, 18) = " << gcd(48,18) << endl;
    return 0;
}`;

const lesson = {
  id: "cpp-0-007",
  slug: "functions",
  chapter: "cpp-0",
  order: 7,
  title: "Functions",
  subtitle: "Define reusable logic, pass data in and out, and understand pass-by-reference",
  tags: ["c++", "cpp", "functions", "parameters", "return", "recursion", "pass-by-reference", "overloading"],
  aliases: [
    "c++ functions",
    "pass by value vs reference c++",
    "c++ recursion",
    "function overloading c++",
    "default parameters c++",
  ],

  hook: `Functions are the fundamental unit of code organization. Name a piece of logic, test it independently, reuse it anywhere. Every serious program is decomposed into functions. Learning to design them well — clear names, single responsibilities, clean interfaces — is what separates code you can maintain from code you have to rewrite.`,

  mentalModel: [
    "**A function takes parameters and returns a value.** The return type comes first, then the name, then the parameter list. `double circleArea(double r)` is a contract: give it a `double` radius, get back a `double` area. Inside, `r` is a local variable — changes don't affect the caller.",
    "**Pass by value copies the argument. Pass by reference gives the function access to the caller's variable.** `void f(int x)` — `x` is a copy, caller unchanged. `void f(int& x)` — `x` IS the caller's variable, changes propagate back. Use `const int& x` for large objects you want to read without copying.",
    "**Recursion: a function that calls itself.** Every recursive function needs a base case (stops recursion) and a recursive case (calls itself with a simpler input). Each call gets its own local variables on the call stack. Missing base case = infinite recursion = stack overflow.",
  ],

  intuition: {
    prose: [
      "**Functions avoid repetition and make code testable.** If you write `PI * r * r` in three places and later want to change the formula, you change one function instead of hunting down three spots. A function also gives the logic a name — `circleArea(5)` is clearer than `3.14159 * 5 * 5`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then explore:**\n\n- Add a `double sphereVolume(double r)` function using the formula `(4.0/3.0) * PI * r * r * r`.\n- Call `factorial(0)` and `factorial(1)` — does the base case handle them?\n- Trace the recursion: `factorial(4)` calls `factorial(3)` calls... draw the call stack on paper.\n- Try `factorial(20)` — does it overflow `int`? Change to `long long` if so.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Pass by value vs reference — run it then explore:**\n\n- Add `void triple(int& x) { x *= 3; }` and test it.\n- Add `void swap(int& a, int& b) { int tmp = a; a = b; b = tmp; }` — does it work?\n- Try passing `7` directly to `doubleByRef`: `doubleByRef(7)` — does it compile? (Hint: can't take a reference to a literal)\n- Change `doubleByRef(int& x)` to `doubleByRef(const int& x)` and try `x *= 2` — compile error?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PARAMS_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Overloading: same name, different parameter types.** `square(3)` calls `int square(int)`. `square(2.5)` calls `double square(double)`. The compiler resolves which version at compile time based on argument types — zero runtime overhead. Don't overload for different behaviors — only for the same operation on different types.",
      "**Recursion depth and the call stack.** Every function call creates a stack frame. Deep recursion (or infinite recursion) exhausts the stack — typically 1-8 MB, enough for ~100,000 frames. `fib(50)` is catastrophically slow — it recomputes the same values billions of times. Iterative or memoized solutions are practical. Recognize when recursion is elegant (GCD, tree traversal) vs when it's a trap (naive Fibonacci).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Overloading and default params — run it then explore:**\n\n- Add `string square(string s) { return s + s; }` — `square(\"hi\")` should return `\"hihi\"`.\n- Try calling `greet()` with and without an argument — confirm both work.\n- Add `void log(string msg, bool newline = true)` — `log(\"hi\")` adds a newline, `log(\"hi\", false)` doesn't.\n- Try `square(3.0f)` — does it call the `double` version or cause ambiguity?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": OVERLOAD_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Recursion — run it then explore:**\n\n- Run `fib(10)`, `fib(15)`, `fib(20)` — notice it gets slow. Count the calls by adding a static counter.\n- Trace `gcd(48, 18)` by hand: gcd(48,18)→gcd(18,12)→gcd(12,6)→gcd(6,0)=6.\n- Add `bool isPrime(int n)` using recursion: test divisors from 2 up.\n- Try `fib(0)`, `fib(1)` — base cases return the right values?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RECURSE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never return a reference to a local variable",
        body: "`int& bad() { int x = 5; return x; }` — `x` is destroyed when `bad()` returns. The reference is dangling (points to freed memory). Always return by value for local data.",
      },
      {
        type: "tip",
        title: "Use const& for large read-only parameters",
        body: "`void print(const string& s)` avoids copying the string (the `&`) while preventing modification (the `const`). For small types like `int`, `double`, `char` — pass by value. For strings, vectors, or large structs — pass by `const&`.",
      },
    ],
  },

  examples: [
    {
      title: "Pass by const reference for large objects",
      body: `#include <vector>

// Avoids copying — reads without modifying
double average(const vector<int>& data) {
    if (data.empty()) return 0.0;
    int sum = 0;
    for (int x : data) sum += x;
    return (double)sum / data.size();
}

// Passes by reference to modify — output parameter
void normalize(vector<double>& v, double scale) {
    for (double& x : v) x /= scale;
}`,
    },
    {
      title: "Overloaded min for different types",
      body: `int    minOf(int a, int b)       { return (a < b) ? a : b; }
double minOf(double a, double b)  { return (a < b) ? a : b; }
string minOf(string a, string b)  { return (a < b) ? a : b; }

cout << minOf(3, 7)        << endl;  // 3
cout << minOf(2.5, 1.8)    << endl;  // 1.8
cout << minOf("cat","ant") << endl;  // ant (lexicographic)`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write `bool isPrime(int n)` — returns true if n is prime. Test divisors from 2 up to sqrt(n): if any divides evenly, it's not prime. Use it to print all primes from 2 to 50.",
      hint: "Loop `d = 2` while `d * d <= n`. If `n % d == 0`, return false. Return true at the end.",
      walkthrough: [
        "if n < 2 return false",
        "for d = 2; d*d <= n; d++: if n%d==0 return false",
        "return true",
        "In main: for i = 2..50: if isPrime(i) cout << i",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write `int reverseDigits(int n)` and `bool isPalindrome(int n)` — a number is a palindrome if it equals its digit-reversal (121, 1331). Handle negatives by returning false. Then use recursion to write `int sumDigits(int n)` — sum all digits of n.",
      hint: "reverseDigits: `while n > 0: rev = rev*10 + n%10; n /= 10`. sumDigits: base case `n == 0`, recursive case `n%10 + sumDigits(n/10)`.",
      walkthrough: [
        "reverseDigits: rev=0; while n>0: rev = rev*10 + n%10; n /= 10; return rev",
        "isPalindrome: if n < 0 return false; return n == reverseDigits(n)",
        "sumDigits: if n == 0 return 0; return n%10 + sumDigits(n/10)",
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
          "f(int x) is faster because it avoids copying",
        ],
        answer: 1,
        explanation:
          "`void f(int x)` receives a copy. Changes inside `f` don't affect the caller. `void f(int& x)` receives a reference to the caller's variable — changes propagate back.",
      },
      {
        id: "cpp0-007-q2",
        type: "choice",
        text: "What causes a stack overflow in recursion?",
        options: [
          "The return value is too large",
          "A function returns without a value",
          "Missing base case causes infinite recursion that fills the call stack",
          "A compile error from calling a function before declaring it",
        ],
        answer: 2,
        explanation:
          "Each call pushes a stack frame. Without a base case, recursion never terminates — the stack fills up and the OS kills the program with a stack overflow / segfault.",
      },
      {
        id: "cpp0-007-q3",
        type: "choice",
        text: "What is the idiomatic way to pass a large `std::vector` to a function that only reads it?",
        options: [
          "`void f(vector<int> v)` — by value",
          "`void f(vector<int>& v)` — by reference",
          "`void f(const vector<int>& v)` — by const reference",
          "`void f(vector<int>* v)` — by pointer",
        ],
        answer: 2,
        explanation:
          "`const vector<int>&` avoids copying (the `&`) while the `const` signals the function won't modify the data. This is the standard idiom for read-only large parameters.",
      },
      {
        id: "cpp0-007-q4",
        type: "choice",
        text: "Can two functions with the same name but only different return types coexist as overloads?",
        options: [
          "Yes, the compiler picks based on context",
          "No, overload resolution uses parameter types, not return types",
          "Only if the return types are related by inheritance",
          "Yes, but only in C++17 and later",
        ],
        answer: 1,
        explanation:
          "Overload resolution is based on parameter count and types only — not return type. `int f(int)` and `double f(int)` are ambiguous at the call site `f(5)` and will cause a compile error.",
      },
    ],
  },
};

export default lesson;
