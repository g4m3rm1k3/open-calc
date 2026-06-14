const FUNC_TPL_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: max(3,7)=7\\nmax(3.14,2.71)=3.14\\nmax(hello,world)=world\\nclamp(15,0,10)=10

template<typename T>
T maxOf(T a, T b) { return (a > b) ? a : b; }

template<typename T>
T clamp(T val, T lo, T hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

int main() {
    cout << "max(3,7)="       << maxOf(3, 7)                         << endl;
    cout << "max(3.14,2.71)=" << maxOf(3.14, 2.71)                   << endl;
    cout << "max(hello,world)="<< maxOf(string("hello"),string("world")) << endl;
    cout << "clamp(15,0,10)=" << clamp(15, 0, 10)                    << endl;
    return 0;
}`;

const CLASS_TPL_CODE = `#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

// __OUTPUT__: push 1 2 3\\npop: 3\\npeek: 2  size: 2

template<typename T>
class Stack {
    vector<T> data;
public:
    void push(const T& val) { data.push_back(val); }

    T pop() {
        if (data.empty()) throw runtime_error("empty");
        T top = data.back(); data.pop_back(); return top;
    }

    const T& peek() const {
        if (data.empty()) throw runtime_error("empty");
        return data.back();
    }

    bool   empty() const { return data.empty(); }
    size_t size()  const { return data.size(); }
};

int main() {
    Stack<int> s;
    for (int x : {1, 2, 3}) { s.push(x); cout << "push " << x << "\\n"; }
    cout << "pop: " << s.pop() << "\\n";
    cout << "peek: " << s.peek() << "  size: " << s.size() << "\\n";
    return 0;
}`;

const MULTI_TPL_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: name => Alice\\nage => 30\\ntemperature => 98.6

template<typename K, typename V>
struct Pair {
    K key; V value;
    void print() const { cout << key << " => " << value << endl; }
};

// Template function with multiple types
template<typename A, typename B>
auto add(A a, B b) { return a + b; }   // return type deduced

int main() {
    Pair<string,string>{"name","Alice"}.print();
    Pair<string,int>   {"age", 30}    .print();
    Pair<string,double>{"temperature",98.6}.print();

    cout << add(3, 4.5)   << endl;   // 7.5 (int + double = double)
    cout << add(string("Hi"), string(" there")) << endl;

    return 0;
}`;

const SPEC_TPL_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: print<int>: 42\\nprint<double>: 3.14\\nprint<string>: "hello" (length 5)

// Generic template
template<typename T>
void print(const T& val) {
    cout << "print<" << typeid(val).name() << ">: " << val << endl;
}

// Specialization for string — different behavior for strings
template<>
void print<string>(const string& val) {
    cout << "print<string>: \\"" << val << "\\" (length " << val.length() << ")" << endl;
}

int main() {
    print(42);
    print(3.14);
    print(string("hello"));   // uses the specialization
    return 0;
}`;

const lesson = {
  id: "cpp-1-004",
  slug: "templates",
  chapter: "cpp-1",
  order: 4,
  title: "Templates",
  subtitle: "Write code once that works with any type — generic programming",
  tags: [
    "c++",
    "cpp",
    "templates",
    "generic-programming",
    "type-parameters",
    "specialization",
  ],
  aliases: [
    "c++ templates",
    "c++ generic programming",
    "c++ function template",
    "c++ class template",
    "c++ template specialization",
  ],

  hook: `Why write \`max(int, int)\` and \`max(double, double)\` and \`max(string, string)\` separately when the logic is identical? Templates let you write code once and have the compiler generate type-specific versions for you. Every STL container — \`vector<T>\`, \`map<K,V>\`, \`pair<T,U>\` — is a template. Once you understand templates, the entire standard library opens up.`,

  mentalModel: [
    "**`template<typename T>` creates a blueprint.** The compiler generates a concrete function or class for each type you use it with. `maxOf(3, 7)` generates an `int` version; `maxOf(3.14, 2.71)` generates a `double` version. The generated code is identical to writing them by hand — zero runtime overhead.",
    "**Class templates parameterize the type of stored data.** `Stack<int>` is a stack of ints. `Stack<string>` is a stack of strings. Same implementation, different types. The compiler generates both classes from one template definition.",
    "**Template specialization overrides the generic behavior for specific types.** `template<> void print<string>(...)` provides custom behavior when `T` is `string`. The generic template handles everything else. Specialization is how the standard library provides type-specific optimizations.",
  ],

  intuition: {
    prose: [
      "**The compiler writes the code, you write the pattern.** `template<typename T> T maxOf(T a, T b)` is a pattern. Each time you call `maxOf(3, 7)`, the compiler generates `int maxOf(int a, int b)`. This happens at compile time — by runtime, the functions are fully specialized. Template instantiation is compile-time polymorphism (vs virtual functions which are runtime).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Function templates — run it then explore:**\n\n- Try `maxOf(3, 3.14)` — compile error. Why? (T must be the same for both arguments)\n- Fix it: `maxOf<double>(3, 3.14)` — explicit type argument forces promotion.\n- Add `template<typename T> T minOf(T a, T b)` — same pattern, different operation.\n- Try `maxOf(true, false)` — bool is comparable, returns true.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FUNC_TPL_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          '**Class template Stack — run it then explore:**\n\n- Try `Stack<string> ss; ss.push("hello"); ss.push("world");` — strings work identically.\n- Try `Stack<double>` — same template, different type.\n- What happens when you `pop()` an empty stack? (throws runtime_error)\n- Add a `void print() const` method that prints all elements without modifying the stack.',
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CLASS_TPL_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Multiple type parameters.** `template<typename K, typename V> struct Pair` has two independent type parameters. `Pair<string, int>` generates a struct with a string key and int value. `auto add(A a, B b)` with two template parameters handles mixed-type arithmetic — `add(3, 4.5)` returns a `double`. The `auto` return type lets the compiler deduce from the expression.",
      "**Template specialization is full replacement.** `template<> void print<string>` completely replaces the generic template for `string`. The compiler looks for the most specific match: exact specialization > partial specialization > generic template. Use it when the generic implementation is incorrect or suboptimal for a specific type.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Multiple type parameters — run it then explore:**\n\n- Add `Pair<int, vector<string>>` — templates can have complex type parameters.\n- Change `add` to return the sum of a vector of mixed-type values using a fold.\n- Try `Pair<Pair<int,int>, string>` — nested templates.\n- Add a `swap(Pair<K,V>&)` method that swaps key and value.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MULTI_TPL_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          "**Template specialization — run it then explore:**\n\n- Add a specialization for `double` that formats to 2 decimal places.\n- Try `print(42)` and `print(42.0)` — which specialization is called for each?\n- What does `typeid(val).name()` print for different types? (compiler-specific names)\n- Add `print(vector<int>{1,2,3})` — does the generic template handle it?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SPEC_TPL_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "info",
        title: "Templates are instantiated at compile time",
        body: "The compiler generates a separate function or class for each type combination used. `maxOf<int>` and `maxOf<double>` are two separate functions in the compiled binary. This is why template code must be in headers (not .cpp files) — the compiler needs the definition at each instantiation site.",
      },
      {
        type: "tip",
        title: "Prefer `auto` return types for mixed-type arithmetic",
        body: "`template<typename A, typename B> auto add(A a, B b) { return a + b; }` deduces the return type from the expression. Without `auto`, you'd need to specify the return type (or use `decltype(a+b)`). C++14 auto return type deduction makes this natural.",
      },
    ],
  },

  examples: [
    {
      title: "Generic min/max/clamp functions",
      body: `template<typename T>
T clamp(T val, T lo, T hi) {
    return (val < lo) ? lo : (val > hi) ? hi : val;
}

template<typename T>
const T& minOf(const T& a, const T& b) { return (a < b) ? a : b; }

template<typename T>
const T& maxOf(const T& a, const T& b) { return (a > b) ? a : b; }

// Works with any comparable type
cout << clamp(15, 0, 10)    << endl;   // 10
cout << minOf(3.14, 2.71)   << endl;   // 2.71
cout << maxOf(string("a"), string("z")) << endl;  // z`,
    },
    {
      title: "Generic find in container",
      body: `template<typename Container, typename T>
int findIndex(const Container& c, const T& target) {
    int i = 0;
    for (const auto& x : c) {
        if (x == target) return i;
        i++;
    }
    return -1;
}

vector<int>    v = {3, 1, 4, 1, 5};
vector<string> s = {"a", "b", "c"};

cout << findIndex(v, 4) << endl;       // 2
cout << findIndex(s, "b") << endl;     // 1
cout << findIndex(v, 99) << endl;      // -1`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `template<typename T> class MinStack` that supports `push(T)`, `pop()`, `top()`, and `getMin()` — all O(1). The trick: maintain a second stack of minimums. When pushing x, push `min(x, current_min)` to the min stack. When popping, pop both stacks.",
      hint: "Two stacks: `stack<T> data` and `stack<T> minStack`. `getMin()` returns `minStack.top()`.",
      walkthrough: [
        "private: stack<T> data, minStack;",
        "push(x): data.push(x); minStack.push(minStack.empty() ? x : min(x, minStack.top()));",
        "pop(): data.pop(); minStack.pop();",
        "getMin(): return minStack.top();",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write `template<typename T> vector<T> filter(const vector<T>& v, function<bool(T)> pred)` and `template<typename T, typename R> vector<R> transform(const vector<T>& v, function<R(T)> f)`. Test with a vector of ints: filter even numbers, then transform to their squares.",
      hint: "`#include <functional>`. filter: loop and push if pred(x). transform: loop and push f(x).",
      walkthrough: [
        "filter: vector<T> result; for (auto& x : v) if (pred(x)) result.push_back(x); return result;",
        "transform: vector<R> result; for (auto& x : v) result.push_back(f(x)); return result;",
        "Test: auto evens = filter(v, [](int x){ return x%2==0; });",
        "auto squares = transform<int,int>(evens, [](int x){ return x*x; });",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-004-q1",
        type: "choice",
        text: "When does template instantiation occur?",
        options: [
          "At runtime, the first time the function is called",
          "At compile time, for each unique type combination used",
          "Only once, regardless of how many types are used",
          "When the program is linked",
        ],
        answer: 1,
        explanation:
          "Templates are instantiated at compile time. Each unique combination of type arguments generates a separate compiled function or class. By runtime, all template code is already compiled into type-specific machine code.",
      },
      {
        id: "cpp1-004-q2",
        type: "choice",
        text: "Why does `maxOf(3, 3.14)` fail to compile without explicit type arguments?",
        options: [
          "Templates don't support floating-point types",
          "T must be the same for both arguments — 3 is int, 3.14 is double, they don't match",
          "You can't use templates with mixed arithmetic",
          "maxOf doesn't support comparison between numbers",
        ],
        answer: 1,
        explanation:
          "Template argument deduction requires unambiguous type inference. `maxOf(3, 3.14)` tries to deduce `T` as both `int` (from 3) and `double` (from 3.14) — a conflict. Fix: `maxOf<double>(3, 3.14)` forces both to double, or use two type parameters.",
      },
      {
        id: "cpp1-004-q3",
        type: "choice",
        text: "What does template specialization `template<> void print<string>(...)` do?",
        options: [
          "Creates a new template with string type",
          "Replaces the generic template's behavior specifically for string arguments",
          "Makes the generic template incompatible with string",
          "Creates an overloaded function alongside the template",
        ],
        answer: 1,
        explanation:
          "Template specialization provides a custom implementation for a specific type. When `print` is called with a `string`, the specialized version is used instead of the generic template. All other types still use the generic version.",
      },
      {
        id: "cpp1-004-q4",
        type: "choice",
        text: "Why must template definitions typically be in header files (not .cpp files)?",
        options: [
          "C++ requires it by specification",
          "The compiler needs the full definition at each instantiation site to generate type-specific code",
          "Templates use special compilation that only works in headers",
          "Templates can't have implementation — only declarations",
        ],
        answer: 1,
        explanation:
          "The compiler generates code for each type used with a template. It needs the full template definition (not just a declaration) at every place the template is used. Since .cpp files are compiled independently, placing templates in headers ensures the definition is visible wherever they're instantiated.",
      },
    ],
  },
};

export default lesson;
