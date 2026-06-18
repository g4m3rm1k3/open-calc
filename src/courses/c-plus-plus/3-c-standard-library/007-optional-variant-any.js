const OPTIONAL_CODE = `#include <iostream>
#include <optional>
#include <vector>
using namespace std;

// __OUTPUT__: found: 42\\nnot found\\nvalue_or: 0\\nsafe_div: 5\\nsafe_div by zero: no result

optional<int> findEven(const vector<int>& v) {
    for (int x : v)
        if (x % 2 == 0) return x;
    return nullopt;   // no value
}

optional<double> safeDivide(double a, double b) {
    if (b == 0) return nullopt;
    return a / b;
}

int main() {
    auto r1 = findEven({1,3,5,42,7});
    if (r1) cout << "found: " << *r1 << "\\n";   // dereference like pointer

    auto r2 = findEven({1,3,5});
    if (!r2) cout << "not found\\n";

    // value_or: return default if empty
    cout << "value_or: " << r2.value_or(0) << "\\n";

    auto d1 = safeDivide(10, 2);
    if (d1) cout << "safe_div: " << *d1 << "\\n";

    auto d2 = safeDivide(10, 0);
    cout << "safe_div by zero: " << (d2 ? to_string(*d2) : "no result") << "\\n";

    return 0;
}`;

const VARIANT_CODE = `#include <iostream>
#include <variant>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: int: 42\\nstring: hello\\ndouble: 3.14\\nbad access caught\\nindex: 1

int main() {
    // variant: type-safe discriminated union
    using Token = variant<int, string, double>;
    vector<Token> tokens = {42, string("hello"), 3.14};

    // holds_alternative + get: check type then extract
    for (const auto& t : tokens) {
        if (holds_alternative<int>(t))
            cout << "int: " << get<int>(t) << "\\n";
        else if (holds_alternative<string>(t))
            cout << "string: " << get<string>(t) << "\\n";
        else if (holds_alternative<double>(t))
            cout << "double: " << get<double>(t) << "\\n";
    }

    // get with wrong type throws std::bad_variant_access
    Token v = string("world");
    try {
        get<int>(v);
    } catch (const bad_variant_access&) {
        cout << "bad access caught\\n";
    }

    // index(): which alternative is active (0=int, 1=string, 2=double)
    cout << "index: " << v.index() << "\\n";

    return 0;
}`;

const VISIT_CODE = `#include <iostream>
#include <variant>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: int: 42\\nstring: hello\\ndouble: 3.14\\narea: 78.54\\narea: 6

using Shape = variant<struct Circle, struct Rect>;
struct Circle { double r; };
struct Rect   { int w, h; };

int main() {
    // visit: apply a callable to whatever type is active
    using Token = variant<int, string, double>;
    vector<Token> tokens = {42, string("hello"), 3.14};

    for (const auto& t : tokens) {
        visit([](auto&& arg) {
            using T = decay_t<decltype(arg)>;
            if constexpr (is_same_v<T, int>)    cout << "int: " << arg << "\\n";
            if constexpr (is_same_v<T, string>) cout << "string: " << arg << "\\n";
            if constexpr (is_same_v<T, double>) cout << "double: " << arg << "\\n";
        }, t);
    }

    // visit for polymorphism without virtual
    vector<Shape> shapes = {Circle{5.0}, Rect{2,3}};
    for (const auto& s : shapes) {
        visit([](auto&& shape) {
            using T = decay_t<decltype(shape)>;
            if constexpr (is_same_v<T, Circle>)
                cout << "area: " << 3.14159 * shape.r * shape.r << "\\n";
            if constexpr (is_same_v<T, Rect>)
                cout << "area: " << shape.w * shape.h << "\\n";
        }, s);
    }

    return 0;
}`;

const ANY_CODE = `#include <iostream>
#include <any>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: holds int: 42\\nhas value: yes\\nholds string: hello\\nbad_any_cast caught\\ntype: i\\nany_cast pointer: safe

int main() {
    // any: stores any single value, type-erased
    any a = 42;
    cout << "holds int: " << any_cast<int>(a) << "\\n";
    cout << "has value: " << (a.has_value() ? "yes" : "no") << "\\n";

    // reassign to different type
    a = string("hello");
    cout << "holds string: " << any_cast<string>(a) << "\\n";

    // wrong-type cast throws bad_any_cast
    try {
        any_cast<int>(a);
    } catch (const bad_any_cast&) {
        cout << "bad_any_cast caught\\n";
    }

    // type(): get the type_info
    cout << "type: " << a.type().name() << "\\n";

    // Pointer cast: returns nullptr instead of throwing
    auto* p = any_cast<string>(&a);
    cout << "any_cast pointer: " << (p ? "safe" : "null") << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-007",
  slug: "optional-variant-any",
  chapter: "cpp-2",
  order: 7,
  title: "optional, variant, any",
  subtitle: "Type-safe nullable values, discriminated unions, and type-erased storage",
  tags: ["c++", "cpp", "optional", "variant", "any", "visit", "nullopt", "holds_alternative", "C++17"],
  aliases: [
    "c++ optional",
    "c++ variant",
    "c++ any",
    "c++ std::optional",
    "c++ std::visit",
    "c++ nullable",
    "c++ discriminated union",
  ],

  hook: `Returning \`-1\` as a sentinel, using \`void*\` for type erasure, or storing a union with a tag field — these are C-era patterns with C-era safety. \`std::optional\` replaces nullable sentinels. \`std::variant\` replaces tagged unions. \`std::any\` replaces \`void*\`. All three express intent clearly and catch type errors at compile time.`,

  mentalModel: [
    "**`optional<T>` is either T or nothing.** Replaces null pointers, sentinel values (-1, \"\", nullptr), or out-parameters for 'not found'. Check with `if (opt)` or `.has_value()`. Access with `*opt` or `.value()` (throws if empty). `.value_or(default)` returns the value or a fallback.",
    "**`variant<A,B,C>` is a type-safe tagged union.** Exactly one of A, B, or C is active at any time. `holds_alternative<T>(v)` checks which. `get<T>(v)` extracts (throws on wrong type). `std::visit(visitor, v)` calls the visitor with the active alternative — exhaustive dispatch, compiler-checked.",
    "**`any` is a type-erased container for a single value.** Unlike `variant`, the type isn't known at compile time. `any_cast<T>(a)` extracts (throws on wrong type). `any_cast<T>(&a)` returns nullptr on wrong type (safe). Use when you genuinely don't know the type at compile time — callback systems, configuration maps.",
  ],

  intuition: {
    prose: [
      "**`std::visit` with `if constexpr` is exhaustive pattern matching.** The generic lambda `[](auto&& arg)` receives the active alternative. `if constexpr (is_same_v<T, X>)` dispatches at compile time — the compiler checks every branch. If you add a new type to the variant and forget a branch, the `visit` still compiles (silently ignoring the new type). For exhaustive checking, use the overloaded pattern.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**optional — run it then explore:**\n\n- Access an empty optional with `*r2` — undefined behavior (no throw for `*`).\n- Use `.value()` instead of `*` — it throws `std::bad_optional_access` when empty.\n- Chain: `findEven(v).value_or(findEven(v2).value_or(-1))` — fallback chain.\n- `optional<string> s = nullopt; s.value_or(\"\").size()` — safe even when empty.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": OPTIONAL_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**variant — run it then explore:**\n\n- Add a fourth type to the variant: `variant<int, string, double, bool>`. Does the loop still handle it? (no — add another else-if)\n- `get<2>(t)` — access by index instead of type.\n- Try assigning `v = 99` when `v` holds a string — which alternative is active now?\n- `variant<int, int>` — is that valid? (yes, but get<int> is ambiguous — use get<0> or get<1>)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VARIANT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`visit` for exhaustive dispatch without virtual.** A `variant<Circle, Rect, Triangle>` with `visit` is a closed-set polymorphism alternative to virtual functions. Adding a new type to the variant forces you to update all visit calls (compile error if any case is missing in the overloaded visitor pattern). Virtual functions allow subclassing anywhere — open set. `variant`+`visit` is better when the set of types is fixed and known at compile time.",
      "**`any` overhead.** `std::any` uses type erasure — stores a type-erased destructor, copy constructor, and type info. For small types (typically ≤ 2 pointer sizes), `any` stores them inline (no heap). For large types, it heap-allocates. `any_cast<T>(a)` compares `typeid` at runtime. Use `any` only when the type is truly unknown at compile time — prefer `optional` or `variant` when you know the possible types.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**visit with if constexpr — run it then explore:**\n\n- Add a new `Triangle` struct to the Shape variant — does the visit compile without a Triangle branch? (yes — silently skips)\n- Use the overloaded pattern for exhaustive checking: `struct overloaded : Fs... { using Fs::operator()...; };`\n- `visit` returns a value: `auto area = visit([](auto s) -> double { ... }, shape);`\n- Two-argument visit: `visit([](auto a, auto b){...}, v1, v2)` — dispatches on both.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VISIT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**std::any — run it then explore:**\n\n- `any_cast<string>(&a)` returns a pointer — nullptr if wrong type, safe alternative to try/catch.\n- Store a `vector<int>` in an `any` — does it work? (yes, any stores any copyable type)\n- `a.reset()` — clears the any, `has_value()` returns false.\n- `a.type() == typeid(string)` — safe runtime type check before casting.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ANY_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Dereferencing empty optional is undefined behavior",
        body: "`*opt` on an empty optional is UB — no throw, no safety. Use `.value()` for a checked access that throws `bad_optional_access`, or check `if (opt)` before dereferencing. The unsafe `*` operator is provided for performance in inner loops where you've already checked.",
      },
      {
        type: "tip",
        title: "Prefer variant over any when types are known",
        body: "`variant<int, string>` catches type errors at compile time. `any` defers to runtime. If you know the possible types at compile time, use `variant` — it's more efficient (no heap allocation for small types, static dispatch) and safer (exhaustive visitor checking).",
      },
    ],
  },

  examples: [
    {
      title: "Result type with optional error",
      body: `#include <optional>
#include <string>

template<typename T>
struct Result {
    std::optional<T> value;
    std::optional<std::string> error;

    static Result ok(T v) { return {v, std::nullopt}; }
    static Result fail(std::string e) { return {std::nullopt, e}; }

    bool isOk() const { return value.has_value(); }
    operator bool() const { return isOk(); }
};

Result<int> parse(const std::string& s) {
    try { return Result<int>::ok(std::stoi(s)); }
    catch (...) { return Result<int>::fail("invalid: " + s); }
}

// auto r = parse("42");  // r.isOk() = true, *r.value = 42
// auto r2 = parse("abc"); // r2.isOk() = false, *r2.error = "invalid: abc"`,
    },
    {
      title: "Overloaded visitor pattern",
      body: `#include <variant>
#include <iostream>

// Overloaded: compose multiple lambdas into one visitor
template<typename... Ts>
struct overloaded : Ts... { using Ts::operator()...; };
template<typename... Ts> overloaded(Ts...) -> overloaded<Ts...>;

using Token = std::variant<int, double, std::string>;

Token t = 3.14;
std::visit(overloaded{
    [](int i)         { std::cout << "int: " << i << "\\n"; },
    [](double d)      { std::cout << "double: " << d << "\\n"; },
    [](const std::string& s) { std::cout << "str: " << s << "\\n"; },
}, t);
// Adding a new type to Token without adding a handler = compile error`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `parseNumber(string s)` that returns `optional<double>`. Return the parsed number if successful, `nullopt` if `stod` throws. Test with `\"3.14\"`, `\"abc\"`, `\"\"`, `\"1e300\"`. Then chain: `parseNumber(s).value_or(0.0)` as a safe fallback.",
      hint: "`try { return stod(s); } catch(...) { return nullopt; }`. The `value_or` pattern replaces the need for if/else at every call site.",
      walkthrough: [
        "optional<double> parseNumber(const string& s)",
        "try { return stod(s); } catch(...) { return nullopt; }",
        "Test 4 cases, verify nullopt for invalid input",
        "cout << parseNumber(s).value_or(0.0) << endl;",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a simple expression tree using `variant`. An `Expr` is either a `Number` (double), a `BinOp` (operator char, left Expr, right Expr), or a `Variable` (string name). Write `evaluate(Expr, map<string,double> env)` using `std::visit`. Test with `(x + 2) * 3` where x=5.",
      hint: "Use recursive variant: `struct BinOp { char op; unique_ptr<Expr> left, right; };`. Visit with lambdas for each case. BinOp case recurses: `evaluate(*b.left, env) op evaluate(*b.right, env)`.",
      walkthrough: [
        "using Expr = variant<Number, BinOp, Variable>;",
        "evaluate: visit with overloaded",
        "Number: return n.val",
        "Variable: return env.at(v.name)",
        "BinOp: recursively evaluate left and right, apply op",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-007-q1",
        type: "choice",
        text: "What is the difference between `*opt` and `opt.value()` for a `std::optional`?",
        options: [
          "They are identical",
          "*opt is undefined behavior when empty; .value() throws bad_optional_access when empty",
          ".value() is undefined behavior when empty; *opt throws",
          "*opt checks bounds; .value() is unchecked",
        ],
        answer: 1,
        explanation:
          "`*opt` (operator*) is unchecked — if `opt` is empty, it's undefined behavior (no exception). `.value()` throws `std::bad_optional_access` when empty. Use `.value()` for safety or check `if (opt)` before using `*`.",
      },
      {
        id: "cpp2-007-q2",
        type: "choice",
        text: "What does `std::visit(visitor, v)` do for a `std::variant`?",
        options: [
          "Iterates over all alternatives",
          "Calls visitor with the currently-active alternative, with the correct type",
          "Returns the index of the active alternative",
          "Throws if the variant is empty (valueless)",
        ],
        answer: 1,
        explanation:
          "`std::visit` calls the visitor with the active alternative, passing it with its correct static type. The visitor must be callable with every possible alternative type. This is pattern matching over the variant — the correct overload is chosen at runtime based on which alternative is active.",
      },
      {
        id: "cpp2-007-q3",
        type: "choice",
        text: "When should you use `std::any` instead of `std::variant`?",
        options: [
          "Always — any is more flexible",
          "When the set of possible types is not known at compile time — e.g., plugin systems, scripting bridges",
          "When you need better performance than variant",
          "When the types don't have copy constructors",
        ],
        answer: 1,
        explanation:
          "`variant` requires knowing all possible types at compile time and is more efficient (no heap for small types, compile-time dispatch). `any` defers everything to runtime — use it when types come from plugins, dynamic loading, or configurations where the set can't be known ahead of time.",
      },
      {
        id: "cpp2-007-q4",
        type: "choice",
        text: "What does `any_cast<string>(&a)` return when `a` holds an `int`?",
        options: [
          "Throws bad_any_cast",
          "Returns nullptr (safe cast — no exception)",
          "Returns a pointer to undefined memory",
          "Returns a pointer to an empty string",
        ],
        answer: 1,
        explanation:
          "The pointer form of `any_cast` (`any_cast<T>(&a)`) returns `nullptr` if the type doesn't match, instead of throwing. It's the safe alternative to the value form. Use it when you want to test if the any holds a given type without a try/catch.",
      },
    ],
  },
};

export default lesson;
