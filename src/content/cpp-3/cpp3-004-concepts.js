const CONCEPT_BASIC_CODE = `#include <iostream>
#include <concepts>
using namespace std;

// __OUTPUT__: add(1,2)=3\\nadd(1.5,2.5)=4\\nbigger: charlie\\nintegral: yes  float: no

// Concept: a named constraint on template types
template<typename T>
concept Numeric = is_arithmetic_v<T>;

template<typename T>
concept Ordered = requires(T a, T b) { { a < b } -> convertible_to<bool>; };

// Constrain with concept — better error messages than enable_if
template<Numeric T>
T add(T a, T b) { return a + b; }

template<Ordered T>
T bigger(T a, T b) { return a < b ? b : a; }

int main() {
    cout << "add(1,2)=" << add(1, 2) << "\\n";
    cout << "add(1.5,2.5)=" << add(1.5, 2.5) << "\\n";
    cout << "bigger: " << bigger(string("alice"), string("charlie")) << "\\n";

    // Concept checks at call site
    cout << "integral: " << (integral<int> ? "yes":"no") << "\\n";
    cout << "float: " << (integral<float> ? "yes":"no") << "\\n";

    return 0;
}`;

const REQUIRES_CODE = `#include <iostream>
#include <concepts>
#include <string>
using namespace std;

// __OUTPUT__: serialize int: 42\\nserialize str: hello\\ncontainer size: 5\\ncallable result: 100

// requires clause: inline constraint
template<typename T>
requires is_arithmetic_v<T> || is_same_v<T, string>
void serialize(T val) {
    if constexpr (is_same_v<T, string>)
        cout << "serialize str: " << val << "\\n";
    else
        cout << "serialize int: " << val << "\\n";
}

// requires expression: check type capabilities
template<typename T>
concept Container = requires(T c) {
    c.size();           // must have size()
    c.begin();          // must have begin()
    c.end();            // must have end()
    typename T::value_type;  // must have value_type
};

template<Container C>
void printSize(const C& c) { cout << "container size: " << c.size() << "\\n"; }

// Concept for callable with return type
template<typename F, typename... Args>
concept Invocable = requires(F f, Args... args) {
    { f(args...) } -> convertible_to<int>;
};

template<Invocable<int> F>
void call(F f) { cout << "callable result: " << f(10) << "\\n"; }

int main() {
    serialize(42);
    serialize(string("hello"));
    vector<int> v = {1,2,3,4,5};
    printSize(v);
    call([](int x){ return x * x; });
    return 0;
}`;

const CONCEPT_OVERLOAD_CODE = `#include <iostream>
#include <concepts>
#include <string>
using namespace std;

// __OUTPUT__: process int: 42\\nprocess float: 3.14\\nprocess other: hello\\nsort_range called

// Concept-based overloading: cleaner than SFINAE
template<integral T>          void process(T v) { cout << "process int: " << v << "\\n"; }
template<floating_point T>    void process(T v) { cout << "process float: " << v << "\\n"; }
template<typename T>          void process(T v) { cout << "process other: " << v << "\\n"; }

// Subsumption: more constrained concept wins
template<typename T>
concept Sortable = requires(T v) { v.begin(); v.end(); };

template<typename T>
concept RandomAccessSortable = Sortable<T>
    && requires(T v) { v.begin()[0]; };  // random access

template<Sortable T>
void sort_range(T& v) { cout << "sort_range called\\n"; }

template<RandomAccessSortable T>
void sort_range(T& v) {
    sort(v.begin(), v.end());
    cout << "sort_range (fast path) called\\n";
}

int main() {
    process(42);
    process(3.14);
    process(string("hello"));

    vector<int> v = {3,1,2};
    sort_range(v);   // RandomAccessSortable wins (more constrained)

    return 0;
}`;

const STD_CONCEPTS_CODE = `#include <iostream>
#include <concepts>
#include <ranges>
using namespace std;

// __OUTPUT__: same_as: yes\\nderived: yes\\nconvertible: yes\\nrange: yes\\noutput range: yes

struct Base {};
struct Child : Base {};

int main() {
    // Standard library concepts (C++20 <concepts>)
    cout << "same_as: " << (same_as<int, int> ? "yes":"no") << "\\n";
    cout << "derived: " << (derived_from<Child, Base> ? "yes":"no") << "\\n";
    cout << "convertible: " << (convertible_to<int, double> ? "yes":"no") << "\\n";

    // Range concepts (C++20 <ranges>)
    cout << "range: " << (ranges::range<vector<int>> ? "yes":"no") << "\\n";
    cout << "output range: " << (ranges::output_range<vector<int>, int> ? "yes":"no") << "\\n";

    // Use concept in auto parameter (abbreviated function template, C++20)
    auto square = [](integral auto x) { return x * x; };
    cout << "square(5)=" << square(5) << "\\n";
    // square(3.14);  // compile error: 3.14 is not integral

    auto add = [](auto a, auto b) requires requires { a + b; } {
        return a + b;
    };
    cout << "add: " << add(1, 2) << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-004",
  slug: "concepts",
  chapter: "cpp-3",
  order: 4,
  title: "Concepts (C++20)",
  subtitle: "Named constraints on template types — cleaner than SFINAE, better error messages",
  tags: ["c++", "cpp", "concepts", "requires", "C++20", "integral", "floating_point", "constraints"],
  aliases: [
    "c++ concepts",
    "c++ requires clause",
    "c++ template constraints",
    "c++ C++20 concepts",
    "c++ concept definition",
  ],

  hook: `SFINAE with \`enable_if\` works but produces cryptic error messages and unreadable code. C++20 Concepts let you express the same constraints clearly: \`template<integral T>\` instead of \`template<typename T, enable_if_t<is_integral_v<T>, int> = 0>\`. When a constraint fails, the error message tells you exactly which concept wasn't satisfied.`,

  mentalModel: [
    "**A concept is a named boolean predicate on types.** `concept Numeric = is_arithmetic_v<T>` defines a reusable constraint. Use it to constrain template parameters: `template<Numeric T>`. The compiler checks the constraint before instantiating the template.",
    "**`requires` expressions check type capabilities.** `requires(T a) { a.size(); }` checks that `a.size()` is valid — not just that it compiles, but that it's a well-formed expression. Combine checks with `&&` and `||`. Check return types with `{ expr } -> concept`.",
    "**Concept subsumption: the more constrained overload wins.** If `RandomAccessSortable` refines `Sortable` (adds constraints), the `RandomAccessSortable` overload is preferred when both match. The compiler selects the most specific applicable overload — no ambiguity.",
  ],

  intuition: {
    prose: [
      "**Abbreviated function templates with `auto` concepts.** `void f(integral auto x)` is shorthand for `template<integral T> void f(T x)`. The concept constrains the `auto` parameter inline. This is the cleanest syntax for simple constraints.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Basic concepts — run it then explore:**\n\n- Try `add(string(\"a\"), string(\"b\"))` — what error? (not Numeric — clear message vs SFINAE gibberish)\n- Define `concept Printable = requires(T v) { cout << v; }` — test with int, string, Widget.\n- `bigger(3, 5)` vs `bigger(string(\"a\"), string(\"b\"))` — both work since both are Ordered.\n- `concept EvenInt = integral<T> && requires(T v) { v % 2; }` — compose concepts.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONCEPT_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**requires expressions — run it then explore:**\n\n- Add a return type constraint: `{ c.size() } -> same_as<size_t>` — stricter check.\n- `concept Hashable = requires(T v) { hash<T>{}(v); }` — detect if type can be used in unordered_map.\n- Nested requires: `requires(T a, T b) { { a + b } -> same_as<T>; }` — addition must return same type.\n- What happens when `printSize(42)` is called? (concept not satisfied, compile error with description)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": REQUIRES_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Concept overloading with subsumption.** When two overloads both match but one's concept implies the other's, the more constrained one is selected. `RandomAccessSortable` (requires `Sortable` + random access) is preferred over `Sortable` alone. This replaces the SFINAE `enable_if` priority ordering pattern.",
      "**Standard library concepts.** C++20 provides concepts in `<concepts>`: `integral`, `floating_point`, `same_as`, `derived_from`, `convertible_to`, `invocable`, `regular`, `copyable`. In `<iterator>`: `input_iterator`, `random_access_iterator`. In `<ranges>`: `range`, `view`, `sized_range`. Use these building blocks rather than defining your own when possible.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Concept overloading — run it then explore:**\n\n- Change `sort_range` to use a `list<int>` — which overload? (Sortable, not RandomAccess)\n- Subsumption: add `template<typename T> void process(T v)` as a fallback — does `process(Widget{})` work now? (yes)\n- A concept that requires another concept: `concept IntContainer = Container<T> && requires(T c) { { c[0] } -> integral; }`\n- What if two overloads have unrelated constraints and both match? (ambiguity error)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONCEPT_OVERLOAD_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Standard concepts and auto — run it then explore:**\n\n- `auto square = [](floating_point auto x) { return x*x; }` — only floats.\n- `auto add = [](auto a, auto b) requires same_as<decltype(a), decltype(b)>` — same type required.\n- `ranges::range<int>` — false, int is not a range.\n- `copyable<unique_ptr<int>>` — false (not copyable). `movable<unique_ptr<int>>` — true.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STD_CONCEPTS_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "tip",
        title: "Prefer concepts over enable_if for new code",
        body: "Concepts produce readable error messages, cleaner syntax, and proper overload resolution with subsumption. `template<integral T>` is strictly better than `template<typename T, enable_if_t<is_integral_v<T>, int> = 0>`. Use SFINAE only when targeting pre-C++20 compilers.",
      },
      {
        type: "info",
        title: "Four ways to constrain a template",
        body: "1. `template<Concept T>` — concept as template parameter. 2. `template<typename T> requires Concept<T>` — requires clause. 3. `void f(Concept auto x)` — abbreviated template. 4. `template<typename T> void f(T x) requires Concept<T>` — trailing requires. All are equivalent; choose the clearest for context.",
      },
    ],
  },

  examples: [
    {
      title: "Concept-constrained generic container",
      body: `template<typename T>
concept Printable = requires(T v) {
    { std::cout << v } -> std::same_as<std::ostream&>;
};

template<Printable T>
void printAll(const std::vector<T>& v) {
    for (const auto& elem : v) std::cout << elem << " ";
    std::cout << "\\n";
}
// printAll(vector<int>{1,2,3})    — works
// printAll(vector<Widget>{...})   — compile error if Widget isn't Printable`,
    },
    {
      title: "Concept for graph traversal",
      body: `template<typename G>
concept Graph = requires(G g) {
    typename G::node_type;
    { g.neighbors(std::declval<typename G::node_type>()) }
        -> std::ranges::range;
    { g.nodes() } -> std::ranges::range;
};

template<Graph G>
void bfs(const G& graph, typename G::node_type start) {
    // Works for any type satisfying the Graph concept
    // — adjacency list, adjacency matrix, implicit graph, etc.
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Define a `Serializable` concept: a type T is Serializable if it has a `toString() const` method returning `string`. Write a `template<Serializable T> void log(const T& v)` that calls `v.toString()`. Test with a struct that satisfies it and verify the error for a struct that doesn't.",
      hint: "`concept Serializable = requires(const T& v) { { v.toString() } -> same_as<string>; };`",
      walkthrough: [
        "concept Serializable = requires(const T& v) { { v.toString() } -> same_as<string>; };",
        "template<Serializable T> void log(const T& v) { cout << v.toString(); }",
        "struct Good { string toString() const { return \"good\"; } };",
        "struct Bad { void toString() {} };  // returns void, not string",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a concept `Summable<T>` that is satisfied when T supports `+` and has a zero value constructible as `T{}`. Then write `template<Summable T> T sum(vector<T> v)`. Test with `int`, `double`, and a custom `Vec2{float x,y}` with `operator+` defined.",
      hint: "`concept Summable = requires(T a, T b) { { a + b } -> same_as<T>; } && default_initializable<T>;`",
      walkthrough: [
        "concept Summable = requires(T a, T b) { { a+b } -> same_as<T>; } && default_initializable<T>;",
        "template<Summable T> T sum(vector<T> v) { T result{}; for (auto& x : v) result = result + x; return result; }",
        "Test int, double, Vec2{} — all work if + is defined and T{} = zero",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-004-q1",
        type: "choice",
        text: "What is the key advantage of Concepts over SFINAE with enable_if?",
        options: [
          "Concepts are faster to compile",
          "Concepts produce readable error messages, support subsumption-based overloading, and have cleaner syntax",
          "Concepts allow more complex constraints",
          "SFINAE is deprecated in C++20",
        ],
        answer: 1,
        explanation:
          "Concepts provide three improvements: (1) Clear error messages stating which concept wasn't satisfied, (2) Subsumption — more constrained overloads are preferred automatically, (3) Clean syntax: `template<integral T>` vs `enable_if_t<is_integral_v<T>>`. SFINAE still works in C++20 but concepts are preferred for new code.",
      },
      {
        id: "cpp3-004-q2",
        type: "choice",
        text: "What does `requires(T v) { v.size(); }` check?",
        options: [
          "That T::size() returns size_t",
          "That the expression v.size() is well-formed (compiles) for type T",
          "That size() is a public member function",
          "That v.size() returns a non-negative integer",
        ],
        answer: 1,
        explanation:
          "A simple `requires` expression checks that expressions are well-formed — that they compile without error. It doesn't check return types or values. To check the return type: `{ v.size() } -> same_as<size_t>` or `-> convertible_to<size_t>`.",
      },
      {
        id: "cpp3-004-q3",
        type: "choice",
        text: "What is concept subsumption?",
        options: [
          "A concept that includes all types",
          "When concept A implies concept B (A is more constrained), the A overload is preferred over B when both match",
          "The process of substituting types into a concept",
          "A concept that inherits from another concept",
        ],
        answer: 1,
        explanation:
          "If concept `RandomAccess` implies `Sortable` (requires everything Sortable requires plus more), then `RandomAccess` subsumes `Sortable`. When both overloads match, the `RandomAccess` overload is preferred — the compiler picks the most specific match. This replaces SFINAE priority ordering.",
      },
      {
        id: "cpp3-004-q4",
        type: "choice",
        text: "What does `void f(integral auto x)` mean?",
        options: [
          "f takes any type and casts it to int",
          "Abbreviated function template: shorthand for `template<integral T> void f(T x)`",
          "f is called only with literal integer arguments",
          "auto is constrained to the integral concept at runtime",
        ],
        answer: 1,
        explanation:
          "`integral auto` is abbreviated template syntax — the `auto` is constrained by the `integral` concept. It's syntactic sugar for `template<integral T> void f(T x)`. The compiler deduces T from the argument and checks that T satisfies `integral`. If not, compilation fails with a clear concept error.",
      },
    ],
  },
};

export default lesson;
