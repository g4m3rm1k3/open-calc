const FWDREF_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: lvalue: string&\\nrvalue: string&&\\ntemplate lvalue: string&\\ntemplate rvalue: string&&

void process(string& s)  { cout << "lvalue: string&\\n"; }
void process(string&& s) { cout << "rvalue: string&&\\n"; }

// T&& is a FORWARDING reference when T is deduced
template<typename T>
void wrapper(T&& arg) {
    // arg has a name → it's an lvalue inside wrapper
    // std::forward restores the original value category
    process(forward<T>(arg));
}

int main() {
    string s = "hello";
    process(s);               // lvalue — calls process(string&)
    process(string("hi"));    // rvalue — calls process(string&&)

    wrapper(s);               // T=string& → forwards as lvalue
    wrapper(string("hi"));    // T=string  → forwards as rvalue

    return 0;
}`;

const VARIADIC_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: sum: 15\\nprint: 1 hello 3.14\\nmake: Widget(5, hello)

// Variadic template: accept any number of args of any types
template<typename... Args>
int sum(Args... args) {
    return (args + ...);   // fold expression: sum all args
}

// Print any number of args with spaces
template<typename T, typename... Rest>
void print(T first, Rest... rest) {
    cout << first;
    if constexpr (sizeof...(rest) > 0) { cout << " "; print(rest...); }
    else cout << "\\n";
}

struct Widget {
    int n; string s;
    Widget(int n, string s) : n(n), s(s) {
        cout << "Widget(" << n << ", " << s << ")\\n";
    }
};

int main() {
    cout << "sum: " << sum(1, 2, 3, 4, 5) << "\\n";
    cout << "print: "; print(1, "hello", 3.14);

    // Perfect forwarding into constructor
    cout << "make: ";
    auto w = make_unique<Widget>(5, "hello");

    return 0;
}`;

const EMPLACE_CODE = `#include <iostream>
#include <vector>
#include <map>
using namespace std;

// __OUTPUT__: push_back moved: Widget created\\nvector size: 1\\nemplace_back: Widget created\\nmap emplace: entry added

struct Widget {
    string name;
    Widget(string n) : name(move(n)) { cout << "Widget created\\n"; }
    Widget(const Widget&) { cout << "Widget copied\\n"; }
    Widget(Widget&&) noexcept { cout << "Widget moved\\n"; }
};

int main() {
    vector<Widget> v;
    v.reserve(4);

    // push_back with temporary: one move
    cout << "push_back moved: ";
    v.push_back(Widget("a"));

    cout << "vector size: " << v.size() << "\\n";

    // emplace_back: construct in-place — zero moves
    cout << "emplace_back: ";
    v.emplace_back("b");   // forwards "b" directly to Widget(string)

    // map::emplace: construct key+value in-place
    map<int, Widget> m;
    cout << "map emplace: ";
    m.emplace(piecewise_construct,
              forward_as_tuple(1),
              forward_as_tuple("entry"));
    cout << "entry added\\n";

    return 0;
}`;

const FOLD_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: sum: 15\\nall true: yes\\nany >5: yes\\nconcat: hello world\\nmin: 1

// Fold expressions (C++17): apply op to all pack elements
template<typename... T> auto sum(T... v) { return (v + ...); }       // unary right fold
template<typename... T> bool allTrue(T... v) { return (v && ...); }  // all must be true
template<typename... T> bool anyGT5(T... v) { return ((v > 5) || ...); }

// Concat strings with fold
template<typename... T>
string concat(T... s) { return (string(s) + ...); }

// Min via fold with lambda (C++17)
template<typename T, typename... Rest>
T myMin(T first, Rest... rest) {
    if constexpr (sizeof...(rest) == 0) return first;
    else return min(first, myMin(rest...));
}

int main() {
    cout << "sum: " << sum(1,2,3,4,5) << "\\n";
    cout << "all true: " << (allTrue(true,true,true) ? "yes" : "no") << "\\n";
    cout << "any >5: " << (anyGT5(1,2,6,3) ? "yes" : "no") << "\\n";
    cout << "concat: " << concat("hello"," ","world") << "\\n";
    cout << "min: " << myMin(3,1,4,1,5) << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-001",
  slug: "perfect-forwarding",
  chapter: "cpp-3",
  order: 1,
  title: "Perfect Forwarding & Variadic Templates",
  subtitle: "Forwarding references, std::forward, parameter packs, and fold expressions",
  tags: ["c++", "cpp", "perfect-forwarding", "variadic-templates", "fold-expressions", "std::forward", "T&&"],
  aliases: [
    "c++ perfect forwarding",
    "c++ variadic template",
    "c++ fold expression",
    "c++ std::forward",
    "c++ forwarding reference",
    "c++ universal reference",
  ],

  hook: `How does \`make_unique<T>(args...)\` pass arguments to T's constructor without extra copies, and work for any number of arguments of any types? Two features: variadic templates (any count of any types) and perfect forwarding (preserving lvalue/rvalue-ness through a template). Together they're the foundation of the modern C++ factory pattern.`,

  mentalModel: [
    "**`T&&` in a template is a forwarding reference, not an rvalue reference.** `T&&` where `T` is a deduced template parameter can bind to both lvalues (T deduces to `X&`) and rvalues (T deduces to `X`). `std::forward<T>(arg)` restores the original value category — lvalue stays lvalue, rvalue stays rvalue.",
    "**`typename... Args` is a parameter pack.** `Args...` expands to zero or more types. `args...` expands to zero or more values. `sizeof...(args)` gives the count at compile time. Expand with `(f(args), ...)` or fold with `(args op ...)`.",
    "**Fold expressions (C++17) collapse a pack with an operator.** `(args + ...)` is a right fold: `a + (b + (c + 0))`. `(... + args)` is a left fold: `((0 + a) + b) + c`. Available for all binary operators: `+`, `&&`, `||`, `,`, etc.",
  ],

  intuition: {
    prose: [
      "**Without `forward`, all arguments inside a template become lvalues.** Inside `wrapper(T&& arg)`, `arg` has a name — it's an lvalue. Without `forward<T>(arg)`, you'd always call the lvalue overload of `process`. `forward<T>(arg)` is a cast: if T was deduced as an lvalue reference, it casts back to lvalue; if T was deduced as a non-reference, it casts to rvalue.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Forwarding references — run it then explore:**\n\n- Remove `forward<T>` from `wrapper` — does `wrapper(string(\"hi\"))` still call the rvalue overload? (no — becomes lvalue)\n- Add a third overload `process(const string&)` — which overloads get called?\n- `template<typename T> void sink(T&& arg)` — what deduces for `sink(42)`? For `int x; sink(x)`?\n- `auto&&` is also a forwarding reference — try `auto&& ref = someValue;`",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FWDREF_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Variadic templates — run it then explore:**\n\n- `sizeof...(args)` at compile time — print it inside `print`.\n- `sum()` with zero args — does it compile? (fold expressions handle empty packs for `+` with value 0)\n- Add a `tuple_print` that prints each element with its type: `typeid(first).name()`.\n- `if constexpr` — the else branch must compile but not execute. Try removing it — what's the base case?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VARIADIC_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`emplace_back` uses perfect forwarding internally.** `vector<T>::emplace_back(Args&&... args)` forwards args directly to `T`'s constructor using `new(ptr) T(std::forward<Args>(args)...)`. Zero copies or moves — the object is constructed in place in the vector's storage. This is the same mechanism as `make_unique` and `make_shared`.",
      "**Reference collapsing rules.** Template deduction with `T&&`: if the caller passes an lvalue of type `X`, T deduces as `X&`, and `X& &&` collapses to `X&`. If the caller passes an rvalue of type `X`, T deduces as `X`, and `X&&` stays `X&&`. These rules are what make forwarding references work — the & in the deduced type 'infects' the &&.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**emplace vs push — run it then explore:**\n\n- Compare: `v.push_back(Widget(\"a\"))` vs `v.emplace_back(\"a\")` — how many Widget constructions?\n- `v.push_back(existingWidget)` — copies. `v.push_back(move(existingWidget))` — moves.\n- Use `map::try_emplace` (C++17): only constructs if key absent. Verify: call twice with same key.\n- `forward_as_tuple` — creates a tuple of forwarding references for piecewise construction.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": EMPLACE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Fold expressions — run it then explore:**\n\n- `(args * ...)` — product fold. What does `sum()` with zero args return for `(v + ...)`? (empty fold for `+` = 0)\n- `(cout << ... << args)` — print all args without spaces using fold.\n- `(v.push_back(args), ...)` — add all args to a vector in one fold.\n- Left fold `(... + args)` vs right fold `(args + ...)` — does it matter for addition? For subtraction?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FOLD_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Don't std::move after std::forward — or use both on the same arg",
        body: "After `std::forward<T>(arg)`, `arg` may be in a moved-from state if it was an rvalue. Don't use `arg` again. And never use both `forward` and `move` on the same parameter — pick one. `forward` is for forwarding references in templates; `move` is for known rvalue conversions.",
      },
      {
        type: "tip",
        title: "Use auto&& in range-for for perfect forwarding",
        body: "`for (auto&& elem : range)` is the safest loop form. For lvalue containers, `elem` is an lvalue reference (no copy). For rvalue ranges (returned by value), `elem` is an rvalue reference (can move from elements). It's universally correct.",
      },
    ],
  },

  examples: [
    {
      title: "make_unique implementation with perfect forwarding",
      body: `template<typename T, typename... Args>
std::unique_ptr<T> makeUnique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}
// This is essentially what std::make_unique does.
// std::forward preserves lvalue/rvalue-ness of each argument:
// - lvalue args are forwarded as lvalues (copied into T's constructor)
// - rvalue args are forwarded as rvalues (moved into T's constructor)`,
    },
    {
      title: "Type-safe printf with fold expression",
      body: `#include <iostream>
template<typename... Args>
void typedPrint(Args&&... args) {
    // Unary left fold over comma operator:
    // evaluates each (cout << arg) in left-to-right order
    ((std::cout << std::forward<Args>(args)), ...);
    std::cout << "\\n";
}

// typedPrint("x=", 42, " y=", 3.14);
// → x=42 y=3.14
// Accepts any types, zero overhead, fully inlined`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a variadic `printAll(Args... args)` that prints each argument on its own line, preceded by its 1-based index. Test with `printAll(\"hello\", 42, 3.14, true)`. Use a fold expression with an index counter (hint: use a lambda with a mutable counter, expanded in the fold).",
      hint: "Use `int i = 0; ((cout << ++i << \": \" << args << '\\n'), ...);` inside a lambda or inline.",
      walkthrough: [
        "template<typename... Args> void printAll(Args... args)",
        "int i = 0;",
        "((cout << ++i << \": \" << args << '\\n'), ...);",
        "Test: printAll(\"hello\", 42, 3.14, true)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `Cache<Key, Value>` with a `getOrCreate(Key k, Args&&... args)` method. If k exists, return the cached value. If not, construct a new Value using `args` (perfect forwarding) and cache it. Use `unordered_map<Key, Value>`. Verify that Value is constructed only once even if called twice with the same key.",
      hint: "`auto [it, inserted] = cache.try_emplace(k, forward<Args>(args)...);` — constructs in-place only if key is absent. Return `it->second`.",
      walkthrough: [
        "unordered_map<Key, Value> cache;",
        "getOrCreate(Key k, Args&&... args):",
        "auto [it, inserted] = cache.try_emplace(k, forward<Args>(args)...);",
        "return it->second;",
        "Test: call twice with same key — constructor prints only once",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-001-q1",
        type: "choice",
        text: "What does `std::forward<T>(arg)` do when T is deduced as `string&`?",
        options: [
          "Moves arg",
          "Casts arg to lvalue reference (string&) — preserving that it was originally an lvalue",
          "Casts arg to rvalue reference (string&&)",
          "Does nothing — just returns arg",
        ],
        answer: 1,
        explanation:
          "When T is deduced as `string&` (the caller passed an lvalue), `forward<string&>(arg)` casts to `string& &&` which collapses to `string&` — an lvalue reference. The original lvalue category is preserved. When T is `string` (rvalue), `forward<string>(arg)` produces `string&&`.",
      },
      {
        id: "cpp3-001-q2",
        type: "choice",
        text: "What does `(args + ...)` mean in a fold expression?",
        options: [
          "Sum the pack left-to-right: ((a + b) + c)",
          "Sum the pack right-to-left: (a + (b + c))",
          "Apply + to adjacent pairs only",
          "Compile error — you must specify an initial value",
        ],
        answer: 1,
        explanation:
          "`(args + ...)` is a unary right fold: it expands to `a + (b + (c + ...))`. `(... + args)` is a unary left fold: `((a + b) + c)`. For associative operators like `+` and `*`, the result is the same. For non-associative operators (like `-`), order matters.",
      },
      {
        id: "cpp3-001-q3",
        type: "choice",
        text: "Why does `emplace_back(args...)` avoid a copy/move compared to `push_back(T(args...))`?",
        options: [
          "emplace_back uses a faster memory allocation",
          "emplace_back constructs the object directly in the vector's storage via perfect forwarding; push_back constructs a temporary then moves/copies it in",
          "emplace_back disables bounds checking",
          "There is no difference",
        ],
        answer: 1,
        explanation:
          "`push_back(T(args...))` first constructs a temporary T, then moves it into the vector's storage (one move). `emplace_back(args...)` forwards args to T's constructor directly at the vector's storage address — one construction, zero moves. For expensive-to-move types, emplace is strictly better.",
      },
      {
        id: "cpp3-001-q4",
        type: "choice",
        text: "What is the value of `sizeof...(args)` when called as `f(1, 'a', 3.14)`?",
        options: [
          "The total byte size of all arguments",
          "3 — the number of arguments in the pack",
          "The size of the largest argument type",
          "Compile error — sizeof... only works on types",
        ],
        answer: 1,
        explanation:
          "`sizeof...(pack)` is a compile-time constant equal to the number of elements in the parameter pack. `sizeof...(args)` in a function called as `f(1, 'a', 3.14)` evaluates to 3. It works on both type packs (`sizeof...(Ts)`) and value packs (`sizeof...(args)`).",
      },
    ],
  },
};

export default lesson;
