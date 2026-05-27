const LAMBDA_BASIC_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: square(5)=25\\naddOffset(7)=17\\nfactor=3 multiply(5)=15

int main() {
    // Lambda: [capture](params) -> rettype { body }
    auto square = [](int x) { return x * x; };
    cout << "square(5)=" << square(5) << "\\n";

    // Capture by value: copy at lambda creation time
    int offset = 10;
    auto addOffset = [offset](int x) { return x + offset; };
    cout << "addOffset(7)=" << addOffset(7) << "\\n";

    // Capture by reference: reads current value of factor
    int factor = 3;
    auto multiply = [&factor](int x) { return x * factor; };
    cout << "factor=3 multiply(5)=" << multiply(5) << "\\n";

    return 0;
}`;

const CAPTURE_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// __OUTPUT__: after [&] total: 55\\nby value: counter=0 (copy)\\nmutable: counter=5

int main() {
    vector<int> nums = {1,2,3,4,5,6,7,8,9,10};

    // [&] captures all locals by reference
    int total = 0;
    for_each(nums.begin(), nums.end(), [&](int x){ total += x; });
    cout << "after [&] total: " << total << "\\n";

    // [=] captures by value — lambda has its own copy
    int counter = 0;
    auto fn = [counter]() mutable { counter++; return counter; };
    fn(); fn(); fn(); fn(); fn();
    cout << "by value: counter=" << counter << " (copy)\\n";

    // mutable: allows modifying the lambda's captured copy
    auto counter2 = [c=0]() mutable { return ++c; };
    for (int i=0; i<5; i++) counter2();
    cout << "mutable: counter=" << counter2() << "\\n";

    return 0;
}`;

const ALGO_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

// __OUTPUT__: evens: 2 4 6 8 10\\nsquares: 1 4 9 16 25\\nsum=55  max=10

int main() {
    vector<int> nums = {1,2,3,4,5,6,7,8,9,10};

    // copy_if: filter into new vector
    vector<int> evens;
    copy_if(nums.begin(), nums.end(), back_inserter(evens),
            [](int x){ return x % 2 == 0; });
    cout << "evens: ";
    for (int e : evens) cout << e << " ";
    cout << "\\n";

    // transform: map each element to its square
    vector<int> squares(5);
    transform(nums.begin(), nums.begin()+5, squares.begin(),
              [](int x){ return x * x; });
    cout << "squares: ";
    for (int s : squares) cout << s << " ";
    cout << "\\n";

    int sum = accumulate(nums.begin(), nums.end(), 0);
    int mx  = *max_element(nums.begin(), nums.end());
    cout << "sum=" << sum << "  max=" << mx << "\\n";

    return 0;
}`;

const STDFUNC_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
using namespace std;

// __OUTPUT__: charlie(75)\\nalice(92)\\nbob(88)  — wait, sorted desc\\nalice(92) bob(88) charlie(75)\\ndouble: 10\\nsquare: 25

int main() {
    // Sort with custom comparator lambda
    vector<pair<string,int>> students = {{"charlie",75},{"alice",92},{"bob",88}};
    sort(students.begin(), students.end(),
         [](const auto& a, const auto& b){ return a.second > b.second; });
    for (const auto& [n,s] : students) cout << n << "(" << s << ") ";
    cout << "\\n";

    // std::function: type-erased callable — store any callable
    function<int(int)> fn = [](int x){ return x * 2; };
    cout << "double: " << fn(5) << "\\n";
    fn = [](int x){ return x * x; };   // reassign to different lambda
    cout << "square: " << fn(5) << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-1-009",
  slug: "lambdas-algorithms",
  chapter: "cpp-1",
  order: 9,
  title: "Lambdas and STL Algorithms",
  subtitle: "Inline functions, capture modes, and expressive algorithm composition",
  tags: ["c++", "cpp", "lambda", "algorithm", "std::function", "capture", "transform", "accumulate"],
  aliases: [
    "c++ lambda",
    "c++ lambdas",
    "c++ algorithm",
    "c++ std::function",
    "c++ capture modes",
    "c++ functional programming",
  ],

  hook: `Lambdas let you write a function exactly where you need it — no name, no declaration, just logic. Combined with STL algorithms, they turn verbose loops into one-liner expressions that say what they mean: 'filter these', 'transform those', 'accumulate this'. This is expressive, efficient code.`,

  mentalModel: [
    "**Lambda syntax: `[capture](params) { body }`.** The capture list specifies which outer variables the lambda can use: `[]` captures nothing, `[x]` copies `x`, `[&x]` references `x`, `[=]` copies all, `[&]` references all. Captured variables are baked into the lambda at its creation point.",
    "**Capture by value copies at lambda creation; capture by reference reads current value.** `int x = 5; auto f = [x]{ return x; }; x = 10; f()` returns `5` (captured old value). `auto g = [&x]{ return x; }; x = 10; g()` returns `10` (references current x).",
    "**`std::function<R(Args)>` stores any callable.** Unlike a concrete lambda type (which is unique and anonymous), `std::function` can hold a lambda, function pointer, or functor. Use it when you need to store or pass callables of a specific signature. It has overhead vs raw lambdas — only use it when you need the flexibility.",
  ],

  intuition: {
    prose: [
      "**Lambdas are anonymous functions.** `auto square = [](int x){ return x*x; }` creates a closure and stores it in `square`. You call it like a function: `square(5)`. Lambdas passed to `sort`, `find_if`, `copy_if` replace the verbose functor pattern from pre-C++11.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Lambda basics — run it then explore:**\n\n- Change `offset = 10` to `offset = 100` after the lambda is created. What does `addOffset(7)` return? (Still 17 — captured by value)\n- Change `[offset]` to `[&offset]` — now what happens?\n- Add a lambda that takes two ints and returns the larger one.\n- Try `auto fn = [](auto x){ return x*x; }` — generic lambda (C++14). Call with int and double.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": LAMBDA_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Capture modes — run it then explore:**\n\n- Change `[&]` to `[=]` in the for_each. Does total get updated? (No — captured by value)\n- Demonstrate dangling reference: create a lambda capturing `[&x]` where `x` is a local, then call the lambda after `x`'s scope ends.\n- `[c=0]` is an init-capture — initializes a new variable in the lambda. Try `[sum=0, &nums]() mutable { for (int x:nums) sum+=x; return sum; }`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CAPTURE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Algorithm + lambda = expressive pipeline.** `copy_if(begin, end, out, pred)` copies elements satisfying pred. `transform(begin, end, out, func)` applies func to each element. `accumulate(begin, end, init, func)` folds left. Combined: `accumulate(evens.begin(), evens.end(), 0, [](int a, int x){ return a + x*x; })` — sum of squares of even numbers in one expression.",
      "**`std::function` has overhead.** It uses type erasure — virtual dispatch under the hood. A concrete lambda is inlined by the compiler (zero overhead). `std::function` prevents inlining and adds a heap allocation for large closures. Only use `std::function` when you need to store callables of different types with the same signature (callbacks, plugin systems).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Algorithms with lambdas — run it then explore:**\n\n- Chain: filter evens, then transform squares, then accumulate sum — what's the sum of squares of evens from 1-10?\n- Use `count_if(nums.begin(), nums.end(), [](int x){ return x>5; })` — how many are > 5?\n- `any_of(nums.begin(), nums.end(), [](int x){ return x>9; })` — is any element > 9?\n- `remove_if` + `erase` to remove all odd numbers in-place.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ALGO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**std::function and sort comparator — run it then explore:**\n\n- Sort alphabetically: `[](const auto& a, const auto& b){ return a.first < b.first; }`.\n- Store a function in a `map<string, function<int(int)>>`: `ops[\"double\"] = [](int x){ return x*2; };`\n- Use `std::function` as a callback: `void doWork(function<void(int)> callback)` — call it with a lambda.\n- What happens if you assign `nullptr` to a `std::function` and call it? (throws bad_function_call)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STDFUNC_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Capturing local variables by reference in long-lived lambdas",
        body: "If a lambda captures a local by reference `[&x]` and outlives the scope where `x` was defined, the reference dangles. Symptom: accessing a freed stack address — undefined behavior. If the lambda might outlive the scope, capture by value `[x]` instead.",
      },
      {
        type: "tip",
        title: "Use [&] carefully — prefer explicit captures",
        body: "`[&]` captures everything by reference — convenient but makes it easy to accidentally create dangling references or unexpected side effects. In long-lived lambdas or callbacks, list captures explicitly: `[&total, &count]` makes the dependencies visible.",
      },
    ],
  },

  examples: [
    {
      title: "Pipeline: filter → transform → accumulate",
      body: `vector<int> nums = {1,2,3,4,5,6,7,8,9,10};

// Filter: keep only evens
vector<int> evens;
copy_if(nums.begin(), nums.end(), back_inserter(evens),
        [](int x){ return x%2==0; });

// Transform: square each even
transform(evens.begin(), evens.end(), evens.begin(),
          [](int x){ return x*x; });

// Accumulate: sum of squares of evens
int result = accumulate(evens.begin(), evens.end(), 0);
// evens: {4,16,36,64,100} → sum = 220`,
    },
    {
      title: "Generic higher-order functions",
      body: `template<typename T, typename Pred>
vector<T> filter(const vector<T>& v, Pred pred) {
    vector<T> result;
    copy_if(v.begin(), v.end(), back_inserter(result), pred);
    return result;
}

template<typename T, typename F>
auto map_each(const vector<T>& v, F f) {
    vector<decltype(f(v[0]))> result;
    transform(v.begin(), v.end(), back_inserter(result), f);
    return result;
}

auto odds   = filter(nums, [](int x){ return x%2!=0; });
auto cubed  = map_each(odds, [](int x){ return x*x*x; });`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Given a vector of strings, use STL algorithms with lambdas to: (1) filter strings longer than 4 chars into a new vector, (2) transform all filtered strings to uppercase (loop `toupper` per char), (3) sort alphabetically, (4) print the result. Use `copy_if`, `transform`, `sort`.",
      hint: "`copy_if` with `s.length() > 4`. For uppercase: `transform(s.begin(), s.end(), s.begin(), ::toupper)` on each string.",
      walkthrough: [
        "copy_if with length > 4 predicate",
        "for each string in result: transform chars to uppercase",
        "sort(result.begin(), result.end())",
        "Print with for loop",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a `compose` function that takes two `function<int(int)>` callables and returns a new function that applies the second then the first: `compose(f, g)(x) == f(g(x))`. Test with `double_it` and `square`. Then compose three functions.",
      hint: "`function<int(int)> compose(function<int(int)> f, function<int(int)> g) { return [f,g](int x){ return f(g(x)); }; }`",
      walkthrough: [
        "function<int(int)> compose(function<int(int)> f, function<int(int)> g)",
        "Return [f,g](int x){ return f(g(x)); };",
        "auto double_it = [](int x){ return x*2; }",
        "auto square = [](int x){ return x*x; }",
        "compose(double_it, square)(5) == double_it(square(5)) == 50",
        "Three-way: compose(double_it, compose(square, double_it))(3) == ?",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-009-q1",
        type: "choice",
        text: "What does `[x]` in a lambda capture mean?",
        options: [
          "x is captured by reference — changes to x inside the lambda affect x outside",
          "x is captured by value — the lambda gets a copy of x's value at capture time",
          "x is passed as a parameter when the lambda is called",
          "x is a return value of the lambda",
        ],
        answer: 1,
        explanation:
          "Capture by value `[x]` copies x's value at the time the lambda is created. Later changes to the outer x don't affect the lambda's copy. Capture by reference `[&x]` accesses the current value of x.",
      },
      {
        id: "cpp1-009-q2",
        type: "choice",
        text: "What happens to `total` after `for_each(nums.begin(), nums.end(), [=total](int x){ total += x; })`?",
        options: [
          "total is updated to the sum of all elements",
          "total is unchanged — [=] captures by value, the lambda modifies its own copy",
          "Compile error — cannot capture with =",
          "total is set to the last element",
        ],
        answer: 1,
        explanation:
          "`[=total]` (or `[=]`) captures total by value. The lambda modifies its own copy — the outer `total` is unchanged. To update the outer total, use `[&total]` or `[&]`.",
      },
      {
        id: "cpp1-009-q3",
        type: "choice",
        text: "What does `copy_if(begin, end, back_inserter(result), pred)` do?",
        options: [
          "Copies elements that do NOT satisfy pred into result",
          "Copies elements that satisfy pred into result",
          "Returns a new container with elements satisfying pred",
          "Modifies elements in [begin, end) that satisfy pred",
        ],
        answer: 1,
        explanation:
          "`copy_if` copies elements from [begin, end) for which pred returns true, appending to the output iterator. `back_inserter(result)` is an iterator that calls `result.push_back()` for each copied element.",
      },
      {
        id: "cpp1-009-q4",
        type: "choice",
        text: "When should you prefer `std::function<T>` over a raw lambda?",
        options: [
          "Always — std::function is faster",
          "When you need to store callables of the same signature in a variable, container, or function parameter",
          "When the lambda captures variables by reference",
          "std::function is never needed — lambdas cover all cases",
        ],
        answer: 1,
        explanation:
          "`std::function` provides type erasure — it can hold any callable with a matching signature. Use it for callbacks, event handlers, or containers of callables. Avoid for hot paths because of virtual dispatch overhead. Raw lambdas passed directly to algorithms are inlined.",
      },
    ],
  },
};

export default lesson;
