const LAMBDA_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
#include <numeric>
#include <string>
using namespace std;

// __OUTPUT__: --- Lambda basics ---\\nSquare of 5: 25\\nAdd 10 to 7: 17\\n--- Capture modes ---\\nMultiplier x3: 15\\nRunning total: 55\\n--- STL algorithms with lambdas ---\\nEvens: 2 4 6 8 10 \\nSquares: 1 4 9 16 25 \\nSum: 55\\nMax: 10\\n--- Sorting with custom comparator ---\\nalice (92)\\nbob (88)\\ncharlie (75)\\n--- std::function ---\\nApply double: 10\\nApply square: 25

int main() {
    // ── Lambda syntax: [capture](params) -> return { body } ───
    cout << "--- Lambda basics ---" << endl;
    auto square = [](int x) { return x * x; };
    cout << "Square of 5: " << square(5) << endl;

    int offset = 10;
    auto addOffset = [offset](int x) { return x + offset; };  // capture by value
    cout << "Add 10 to 7: " << addOffset(7) << endl;

    // ── Capture modes ─────────────────────────────────────────
    cout << "--- Capture modes ---" << endl;
    int factor = 3;
    auto multiply = [&factor](int x) { return x * factor; };  // capture by ref
    cout << "Multiplier x3: " << multiply(5) << endl;

    int total = 0;
    vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    for_each(nums.begin(), nums.end(), [&total](int x) { total += x; });
    cout << "Running total: " << total << endl;

    // ── STL algorithms with lambdas ───────────────────────────
    cout << "--- STL algorithms with lambdas ---" << endl;

    // copy_if: filter evens into new vector
    vector<int> evens;
    copy_if(nums.begin(), nums.end(), back_inserter(evens),
            [](int x) { return x % 2 == 0; });
    cout << "Evens: ";
    for (int e : evens) cout << e << " ";
    cout << endl;

    // transform: squares in-place
    vector<int> squares(nums.size());
    transform(nums.begin(), nums.end(), squares.begin(),
              [](int x) { return x * x; });
    cout << "Squares: ";
    for (int s : squares) cout << s << " ";
    cout << endl;

    // accumulate: sum
    int sum = accumulate(nums.begin(), nums.end(), 0,
                         [](int acc, int x) { return acc + x; });
    cout << "Sum: " << sum << endl;

    // max_element
    auto maxIt = max_element(nums.begin(), nums.end());
    cout << "Max: " << *maxIt << endl;

    // ── Sorting with custom comparator ────────────────────────
    cout << "--- Sorting with custom comparator ---" << endl;
    vector<pair<string, int>> students = {
        {"charlie", 75}, {"alice", 92}, {"bob", 88}
    };
    sort(students.begin(), students.end(),
         [](const auto& a, const auto& b) { return a.second > b.second; }); // desc score
    for (const auto& [name, score] : students)
        cout << name << " (" << score << ")" << endl;

    // ── std::function: type-erased callable ───────────────────
    cout << "--- std::function ---" << endl;
    function<int(int)> fn;
    fn = [](int x) { return x * 2; };
    cout << "Apply double: " << fn(5) << endl;
    fn = [](int x) { return x * x; };   // reassign to different lambda
    cout << "Apply square: " << fn(5) << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-1-009",
  slug: "lambdas-algorithms",
  chapter: "cpp-1",
  order: 9,
  title: "Lambdas and STL Algorithms",
  subtitle:
    "Write expressive, functional-style code with lambda expressions and the STL algorithm library",
  tags: [
    "c++",
    "cpp",
    "lambda",
    "algorithm",
    "std::function",
    "capture",
    "transform",
    "sort",
    "accumulate",
    "functional",
  ],
  aliases: [
    "c++ lambda",
    "c++ lambda expression",
    "c++ std::function",
    "c++ transform algorithm",
    "c++ sort with comparator",
    "c++ accumulate",
    "c++ functional programming",
  ],

  hook: `Before C++11, passing behavior to algorithms meant writing named function objects (functors) or free functions. Lambdas changed everything: define behavior exactly where you need it, capture local variables, and pass the result directly to \`sort\`, \`transform\`, \`filter\`. Combined with the STL algorithm library, lambdas let you express data transformation pipelines in a few lines that would otherwise take loops, temporaries, and bookkeeping.`,

  mentalModel: [
    "**A lambda is an anonymous function object.** `[capture](params) { body }` creates an unnamed object whose `operator()` is the body. The compiler generates a unique class for each lambda. Because it's an object, it can capture local state — this is what differentiates lambdas from plain function pointers. `auto f = [x](int y) { return x + y; }` is sugar for a generated class with an `x` member and `operator()(int y)`.",
    "**Capture by value vs reference.** `[x]` captures `x` by value at the time of the lambda's creation — later changes to `x` don't affect the lambda. `[&x]` captures by reference — the lambda sees changes to `x` and can modify it. `[=]` captures everything in scope by value; `[&]` captures everything by reference; `[=, &x]` mixes (everything by value except `x` by reference). Prefer explicit captures over `[=]`/`[&]` to make dependencies visible.",
    "**`std::function<R(Args...)>` is a type-erased callable.** A lambda's actual type is compiler-generated and unnamed — you can't spell it. `std::function<int(int)>` accepts any callable (lambda, free function, functor) that takes `int` and returns `int`. Use `std::function` for storing callables in containers, callback fields, or function parameters that must accept different callables. But: `std::function` has overhead (heap allocation, virtual dispatch) — prefer `auto` or template parameters when the callable type is known at compile time.",
  ],

  intuition: {
    prose: [
      "**STL algorithms vs hand-rolled loops.** `std::sort(v.begin(), v.end(), cmp)` — the standard library sort is introsort: O(n log n) worst case, in-place, highly optimized. The hand-rolled bubble sort you'd write is O(n²). More importantly, algorithms *communicate intent*: `copy_if` tells the reader 'filter this range'; `transform` tells the reader 'map this range'; a raw loop says 'do something'. Algorithm names are documentation.",
      "**`back_inserter` and output iterators.** Many algorithms take an output range. `copy_if(src.begin(), src.end(), back_inserter(dest), pred)` uses `back_inserter(dest)` — an iterator adaptor that calls `dest.push_back()` each time the algorithm writes to it. Without `back_inserter`, you'd need to pre-size `dest`. Other output adaptors: `front_inserter` (calls `push_front`), `inserter(c, pos)` (inserts at position).",
      "**Mutable lambdas.** By default, value-captured variables are `const` inside the lambda — you can't modify the captured copy. `[x]() mutable { x++; return x; }` adds `mutable`, removing the `const` on the generated `operator()`. The capture is still a copy — changes don't affect the original `x`. Mutable lambdas are useful for stateful generators.",
      "**Generic lambdas (C++14+).** `[](auto x, auto y) { return x + y; }` uses `auto` parameters — the compiler generates a templated `operator()`. This works with any types that support `+`. Combined with `std::transform`, you get behavior that adapts to the element type. C++20 adds explicit template parameters in lambdas: `[]<typename T>(T x) { ... }`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Build algorithm pipelines:**\n\n1. Compile and run — trace lambda captures and algorithm outputs\n2. Write a lambda that returns true if a string length > 4, use `copy_if` to filter a string vector\n3. Use `sort` with a lambda to sort strings by length (shortest first)\n4. Chain: filter evens, transform to squares, accumulate — three-step pipeline\n5. Write a `makeAdder(int n)` function that returns a lambda capturing `n`\n6. Store lambdas in a `vector<function<int(int)>>` and apply each to 5",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": LAMBDA_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Dangling reference captures.** `[&]` capturing a local variable by reference creates a dangling reference if the lambda outlives the variable's scope. The classic bug: returning a lambda that captured a local by reference. `auto f = [&x]() { return x; }; return f;` — when `f` is called, `x` is gone. Rule: only capture by reference if the lambda's lifetime is strictly shorter than the captured variable's. For lambdas returned from functions or stored in data structures, capture by value.",
      "**`std::function` overhead vs templates.** A template parameter `template<typename F> void apply(F f, int x)` is zero overhead — the compiler sees the concrete type and can inline. `std::function<int(int)>` uses type erasure (typically a `void*` + function pointer, or small-buffer optimization) — it may heap-allocate and can't be inlined. For hot paths, prefer template parameters. Use `std::function` when you need to store the callable in a data structure, pass across translation unit boundaries, or the template parameter would infect a class.",
      "**Parallel algorithms (C++17).** `std::sort(std::execution::par, v.begin(), v.end())` runs in parallel on multiple threads. Add `#include <execution>` and link with TBB on some platforms. Available policies: `seq` (sequential), `par` (parallel), `par_unseq` (parallel + SIMD). The lambda/comparator must be thread-safe (no shared mutable state). This is the closest C++ gets to data parallelism without explicit threading.",
    ],
    callouts: [
      {
        type: "warning",
        title:
          "Never capture local variables by reference in a lambda that outlives them",
        body: "Returning a `[&]` lambda, storing it in a class field, or passing it to an async operation while the captured variables are on the stack creates a dangling reference. The lambda appears to work locally but crashes or corrupts memory when called later. Capture by value (`[=]` or explicit `[x, y]`) for any lambda that might outlive the current scope.",
      },
      {
        type: "info",
        title: "Algorithm complexity cheat sheet",
        body: "`sort`: O(n log n); `stable_sort`: O(n log² n); `find`/`find_if`: O(n); `binary_search`/`lower_bound` (sorted range): O(log n); `copy_if`/`transform`/`for_each`: O(n); `accumulate`: O(n); `min_element`/`max_element`: O(n); `nth_element` (partial sort): O(n) average.",
      },
      {
        type: "tip",
        title: "Use ranges (C++20) for composable pipelines",
        body: "C++20 ranges allow composing algorithms without intermediate vectors: `auto result = v | views::filter([](int x){ return x%2==0; }) | views::transform([](int x){ return x*x; });`. This is lazy — elements are processed one at a time, no temporary containers. If you're on C++20, prefer ranges over chained algorithm calls for readability and efficiency.",
      },
    ],
  },

  examples: [
    {
      title: "Function factory: closures returning lambdas",
      body: `// Functions that return lambdas — closures
auto makeMultiplier(int factor) {
    return [factor](int x) { return x * factor; };  // captures factor by value
}

auto makeRangePredicate(int lo, int hi) {
    return [lo, hi](int x) { return x >= lo && x <= hi; };
}

// Usage:
auto triple = makeMultiplier(3);
auto inRange = makeRangePredicate(10, 20);

std::vector<int> data = {5, 12, 18, 25, 3, 15};
std::vector<int> result;
std::copy_if(data.begin(), data.end(), std::back_inserter(result), inRange);
// result = {12, 18, 15}

std::transform(result.begin(), result.end(), result.begin(), triple);
// result = {36, 54, 45}`,
    },
    {
      title: "Pipeline: filter → transform → reduce",
      body: `#include <vector>
#include <algorithm>
#include <numeric>

// Process pipeline: keep positives, square them, sum
int sumSquaredPositives(const std::vector<int>& data) {
    std::vector<int> positives;
    std::copy_if(data.begin(), data.end(), std::back_inserter(positives),
                 [](int x) { return x > 0; });

    std::vector<int> squared(positives.size());
    std::transform(positives.begin(), positives.end(), squared.begin(),
                   [](int x) { return x * x; });

    return std::accumulate(squared.begin(), squared.end(), 0);
}

// C++20 ranges version (lazy, no intermediate containers):
// auto result = data | views::filter([](int x){ return x > 0; })
//                    | views::transform([](int x){ return x*x; });
// int sum = ranges::fold_left(result, 0, plus<>{});`,
    },
    {
      title: "Event system with std::function callbacks",
      body: `#include <functional>
#include <vector>
#include <string>

class Button {
    std::vector<std::function<void(const std::string&)>> handlers;
public:
    // Register any callable: lambda, function, functor
    void onClick(std::function<void(const std::string&)> handler) {
        handlers.push_back(std::move(handler));
    }

    void click(const std::string& label) {
        for (auto& h : handlers) h(label);
    }
};

// Usage:
// Button btn;
// btn.onClick([](const std::string& l){ cout << "Clicked: " << l; });
// int count = 0;
// btn.onClick([&count](const std::string&){ count++; });
// btn.click("OK");   // fires all handlers`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Write a generic `pipeline` function: `template<typename T, typename... Transforms>` that takes a `vector<T>` and any number of transform functions (lambdas). Each transform takes and returns a `vector<T>`. Chain them: the output of each becomes the input of the next. Test with: filter evens → square each → keep only values < 50 → sort descending. Start with `{1,2,3,4,5,6,7,8,9,10}`.",
      hint: "Use a fold: `auto result = data; for each transform: result = transform(result); return result;`. For variadic, use `(result = transforms(result), ...)` fold expression.",
      walkthrough: [
        "template<typename T> auto pipeline(vector<T> v) { return v; }",
        "template<typename T, typename F, typename... Rest> auto pipeline(vector<T> v, F fn, Rest... rest)",
        "{ return pipeline(fn(v), rest...); }",
        "Transform 1: copy_if for evens",
        "Transform 2: transform for squares",
        "Transform 3: copy_if for < 50",
        "Transform 4: sort with greater<T>{}",
      ],
    },
    {
      difficulty: "hard",
      problem:
        "Build a memoization wrapper: `template<typename F> auto memoize(F fn)` that returns a new function with the same signature but caches results by argument. Test with a slow Fibonacci implementation: `auto fib = memoize([&](int n) -> long long { return n <= 1 ? n : fib(n-1) + fib(n-2); })`. Without memoization, `fib(40)` takes seconds. With it, nearly instant. Hint: use `std::unordered_map` for the cache, and `std::function` for the recursive reference.",
      hint: "The cache map lives in the returned lambda's capture. `std::function<long long(int)> fib` must be declared before the lambda to allow recursive capture by reference.",
      walkthrough: [
        "template<typename R, typename Arg> auto memoize(function<R(Arg)> fn)",
        "{ unordered_map<Arg, R> cache; return [fn, cache](Arg x) mutable -> R { if (cache.count(x)) return cache[x]; return cache[x] = fn(x); }; }",
        "For recursive: declare `function<long long(int)> fib;` first",
        "Then: `fib = memoize<long long,int>([&fib](int n) -> long long { return n<=1 ? n : fib(n-1)+fib(n-2); });`",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-009-q1",
        type: "choice",
        text: "What does `[&x, y]` in a lambda capture list mean?",
        options: [
          "Capture x and y both by reference",
          "Capture x by reference and y by value",
          "Capture x by value and y by reference",
          "Capture everything by reference except y",
        ],
        answer: 1,
        explanation:
          "`[&x, y]` captures `x` by reference (changes to `x` are visible in the lambda, and the lambda can modify `x`) and `y` by value (a copy of `y` at the time of lambda creation). `&` before a variable name means capture that variable by reference.",
      },
      {
        id: "cpp1-009-q2",
        type: "choice",
        text: "What is the risk of `[&]` capture in a lambda returned from a function?",
        options: [
          "The lambda will be too slow due to reference indirection",
          "Local variables captured by reference become dangling when the function returns — the lambda holds references to destroyed stack variables",
          "The lambda cannot be stored in std::function",
          "The compiler will reject the lambda",
        ],
        answer: 1,
        explanation:
          "If you `return [&]() { return localVar; }`, the returned lambda holds a reference to `localVar` — but `localVar` lives on the function's stack frame, which is gone when the function returns. Calling the lambda later reads a dangling reference — undefined behavior. Capture by value `[=]` or `[localVar]` for lambdas that outlive the current scope.",
      },
      {
        id: "cpp1-009-q3",
        type: "choice",
        text: "When should you prefer `std::function<int(int)>` over a template parameter for a callable?",
        options: [
          "Always — std::function is the modern, recommended way",
          "When you need to store callables in a data structure or field, or accept different callable types at runtime",
          "When performance is critical — std::function has less overhead",
          "Never — template parameters are always better",
        ],
        answer: 1,
        explanation:
          "Template parameters (`template<typename F> void apply(F f)`) are zero-overhead (compiler sees concrete type, can inline) but can't be stored in containers or class fields. `std::function` adds type erasure overhead but enables storing and passing heterogeneous callables. Use templates for algorithm parameters; `std::function` for callbacks, event handlers, and stored callables.",
      },
      {
        id: "cpp1-009-q4",
        type: "choice",
        text: "What does `std::transform(v.begin(), v.end(), v.begin(), [](int x){ return x*2; })` do?",
        options: [
          "Creates a new vector with doubled values",
          "Doubles each element in v in-place (output range = input range)",
          "Returns the sum of doubled values",
          "Filters elements where x*2 is true",
        ],
        answer: 1,
        explanation:
          "When the output iterator equals the input begin (`v.begin()`), `std::transform` writes results back into the same container, effectively doubling each element in-place. The lambda is applied to each element and the result is written to the corresponding position in the output range.",
      },
    ],
  },
};

export default lesson;
