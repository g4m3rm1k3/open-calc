const PIPELINE_CODE = `#include <iostream>
#include <vector>
#include <ranges>
using namespace std;

// __OUTPUT__: evens: 2 4 6 8 10\\nsquares of evens: 4 16 36 64 100\\nfirst 3 evens: 2 4 6

int main() {
    vector<int> v = {1,2,3,4,5,6,7,8,9,10};

    // filter: lazy — only evaluates when iterated
    auto evens = v | views::filter([](int x){ return x%2==0; });
    cout << "evens: ";
    for (int x : evens) cout << x << " ";
    cout << "\\n";

    // pipe multiple adapters: filter then transform
    auto squaresOfEvens = v
        | views::filter([](int x){ return x%2==0; })
        | views::transform([](int x){ return x*x; });
    cout << "squares of evens: ";
    for (int x : squaresOfEvens) cout << x << " ";
    cout << "\\n";

    // take: limit to first n results
    auto first3Evens = v
        | views::filter([](int x){ return x%2==0; })
        | views::take(3);
    cout << "first 3 evens: ";
    for (int x : first3Evens) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const VIEW_ADAPT_CODE = `#include <iostream>
#include <vector>
#include <ranges>
#include <string>
using namespace std;

// __OUTPUT__: reverse: 5 4 3 2 1\\ndrop 7: 8 9 10\\niota 0..4: 0 1 2 3 4\\niota even: 0 2 4 6 8

int main() {
    vector<int> v = {1,2,3,4,5};

    // reverse: iterate backwards without copying
    cout << "reverse: ";
    for (int x : v | views::reverse) cout << x << " ";
    cout << "\\n";

    // drop: skip first n elements
    vector<int> w = {1,2,3,4,5,6,7,8,9,10};
    cout << "drop 7: ";
    for (int x : w | views::drop(7)) cout << x << " ";
    cout << "\\n";

    // iota: infinite range starting from value
    cout << "iota 0..4: ";
    for (int x : views::iota(0) | views::take(5)) cout << x << " ";
    cout << "\\n";

    // compose: first 5 even numbers (iota is infinite)
    cout << "iota even: ";
    for (int x : views::iota(0)
                | views::filter([](int x){ return x%2==0; })
                | views::take(5))
        cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const RANGE_ALGO_CODE = `#include <iostream>
#include <vector>
#include <ranges>
#include <algorithm>
using namespace std;

// __OUTPUT__: sorted: 1 2 3 4 5\\nfound 3: yes\\ncount evens: 5\\nall positive: yes\\npartitioned: 2 4 6 1 3 5

int main() {
    vector<int> v = {3,1,4,1,5,2};

    // ranges algorithms: take the container directly (no begin/end)
    ranges::sort(v);
    cout << "sorted: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // ranges::find: returns iterator
    auto it = ranges::find(v, 3);
    cout << "found 3: " << (it != v.end() ? "yes" : "no") << "\\n";

    // ranges::count_if
    vector<int> w = {1,2,3,4,5,6,7,8,9,10};
    cout << "count evens: " << ranges::count_if(w, [](int x){ return x%2==0; }) << "\\n";

    // ranges::all_of
    cout << "all positive: "
         << (ranges::all_of(w, [](int x){ return x>0; }) ? "yes" : "no") << "\\n";

    // ranges::partition
    vector<int> p = {1,2,3,4,5,6};
    ranges::partition(p, [](int x){ return x%2==0; });
    cout << "partitioned: ";
    for (int x : p) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const SPLIT_JOIN_CODE = `#include <iostream>
#include <vector>
#include <ranges>
#include <string>
using namespace std;

// __OUTPUT__: split: hello | world | foo\\njoin: 1 2 3 4 5 6\\nkeys: alice bob\\nvalues: 95 87

int main() {
    // split view: split on delimiter
    string s = "hello world foo";
    cout << "split: ";
    for (auto word : s | views::split(' ')) {
        for (char c : word) cout << c;
        cout << " | ";
    }
    cout << "\\n";

    // join: flatten nested ranges
    vector<vector<int>> nested = {{1,2,3},{4,5,6}};
    cout << "join: ";
    for (int x : nested | views::join) cout << x << " ";
    cout << "\\n";

    // transform to extract keys from pairs
    vector<pair<string,int>> scores = {{"alice",95},{"bob",87}};
    cout << "keys: ";
    for (const auto& k : scores | views::keys) cout << k << " ";
    cout << "\\n";

    cout << "values: ";
    for (const auto& v2 : scores | views::values) cout << v2 << " ";
    cout << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-009",
  slug: "ranges",
  chapter: "cpp-2",
  order: 9,
  title: "Ranges (C++20)",
  subtitle: "Lazy pipeline composition with views — filter, transform, take, split, join",
  tags: ["c++", "cpp", "ranges", "views", "filter", "transform", "take", "C++20", "lazy", "pipeline"],
  aliases: [
    "c++ ranges",
    "c++ views",
    "c++ ranges filter",
    "c++ ranges transform",
    "c++ lazy evaluation",
    "c++ pipeline",
  ],

  hook: `\`copy_if\` + \`transform\` + \`accumulate\` chained together requires intermediate vectors at each step. C++20 ranges let you compose the same operations lazily — each element flows through the pipeline only once, no intermediate allocation, evaluated on demand as you iterate.`,

  mentalModel: [
    "**Views are lazy — nothing executes until you iterate.** `v | views::filter(pred) | views::transform(f)` creates an adaptor chain. No computation happens yet. When you write `for (int x : pipeline)`, each iteration pulls one element through the entire chain. The pipeline is evaluated element by element, not stage by stage.",
    "**`|` pipes adaptors together.** `range | adaptor` returns a new view that wraps the original. Multiple pipes compose left-to-right: `v | filter | transform | take`. This is the 'pipeline' syntax from functional programming, made efficient through lazy evaluation.",
    "**Range algorithms take the container directly.** `ranges::sort(v)` instead of `sort(v.begin(), v.end())`. No begin/end boilerplate. `ranges::find(v, 5)` returns an iterator. Same algorithms, cleaner call site.",
  ],

  intuition: {
    prose: [
      "**Lazy evaluation means no intermediate allocation.** Classic `filter` → `transform` creates two new vectors. Ranges `v | filter | transform` creates zero vectors — elements pass through the chain on each `*it++`. For large data, this can be the difference between O(n) memory and O(1).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Filter and transform pipeline — run it then explore:**\n\n- Add `| views::take(2)` to the pipeline — does it stop early? (yes — lazy, only 2 elements evaluated)\n- Materialize the view into a vector: `auto result = squaresOfEvens | ranges::to<vector>()` (C++23) or `vector<int>(squaresOfEvens.begin(), squaresOfEvens.end())`.\n- `views::transform` vs `std::transform` — which requires an output range? (std::transform does, views::transform is lazy)\n- Chain 3 operations: filter odd, multiply by 3, drop first 2.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PIPELINE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**View adaptors — run it then explore:**\n\n- `views::iota(1, 11)` — bounded iota, like 1..10.\n- `views::reverse` on a `forward_list` — compile error (needs bidirectional).\n- `views::drop_while([](int x){ return x<5; })` — drop while condition holds.\n- `views::take_while([](int x){ return x<5; })` — take while condition holds.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VIEW_ADAPT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`ranges::sort` vs `std::sort`.** `ranges::sort(v)` takes the range directly. `std::sort` takes iterators. Both are O(n log n). The ranges version also accepts a projection: `ranges::sort(students, {}, &Student::name)` sorts by name without a comparator lambda. Projections are a C++20 feature.",
      "**Views are not always cheaper.** Lazy evaluation avoids intermediate storage but can repeat computation. If you iterate the same view multiple times, the pipeline runs again each time. If the pipeline is expensive (e.g., file I/O), cache the result in a vector. Views are optimal for single-pass operations.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Range algorithms — run it then explore:**\n\n- `ranges::sort(v, greater<int>{})` — sort descending.\n- `ranges::sort(v, {}, [](int x){ return -x; })` — sort with projection.\n- `ranges::unique` + `erase` to remove duplicates (same as classic erase-unique idiom).\n- `ranges::copy(v, ostream_iterator<int>(cout, ' '))` — copy to stdout.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RANGE_ALGO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**split, join, keys/values — run it then explore:**\n\n- `views::split` on a string produces char ranges, not strings — collect into `string` with `string(word.begin(), word.end())`.\n- `views::join` on nested vectors — what's the type of each element?\n- `views::keys` on an `unordered_map` — does iteration order matter?\n- Add `| views::filter([](auto& p){ return p.second > 90; }) | views::keys` — names of students scoring > 90.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SPLIT_JOIN_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "info",
        title: "Ranges require C++20 — check your compiler",
        body: "`#include <ranges>` and `std::views` require C++20 (`-std=c++20`). Most C++20 range views are supported in GCC 10+, Clang 13+, MSVC 19.29+. `views::zip` and `ranges::to` require C++23.",
      },
      {
        type: "tip",
        title: "Prefer ranges::sort over std::sort for new code",
        body: "`ranges::sort(v)` is less error-prone than `sort(v.begin(), v.end())` — no begin/end boilerplate, no accidental iterator order errors, and supports projections. It's strictly more convenient with the same performance.",
      },
    ],
  },

  examples: [
    {
      title: "Word frequency with ranges",
      body: `#include <ranges>
#include <algorithm>
#include <vector>
#include <string>

// Count words longer than 4 chars, collect sorted unique words
std::vector<std::string> longUniqueWords(const std::vector<std::string>& words) {
    std::vector<std::string> result;
    for (const auto& w : words | std::views::filter([](const std::string& s){ return s.size() > 4; }))
        result.push_back(w);
    std::ranges::sort(result);
    auto [newEnd, _] = std::ranges::unique(result);
    result.erase(newEnd, result.end());
    return result;
}`,
    },
    {
      title: "Infinite sequence with take",
      body: `#include <ranges>
#include <iostream>

// Fibonacci sequence as a lazy view (C++23 generator-style)
// Workaround in C++20: use iota + transform via stateful lambda
int main() {
    // First 10 even numbers ≥ 1: O(1) space
    for (int x : std::views::iota(1)
                | std::views::filter([](int x){ return x%2==0; })
                | std::views::take(10))
        std::cout << x << " ";
    // 2 4 6 8 10 12 14 16 18 20
    // No vector created — fully lazy
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Using C++20 ranges, write a one-liner (plus a for loop) that: given `vector<int> v`, prints the sum of squares of all odd numbers in the vector. Use `views::filter`, `views::transform`, and accumulate the results. Test with `{1,2,3,4,5,6,7,8,9,10}`.",
      hint: "`auto pipeline = v | views::filter([](int x){return x%2!=0;}) | views::transform([](int x){return x*x;});` then `accumulate(pipeline.begin(), pipeline.end(), 0)`.",
      walkthrough: [
        "auto odds_sq = v | views::filter([](int x){ return x%2!=0; }) | views::transform([](int x){ return x*x; });",
        "int sum = accumulate(odds_sq.begin(), odds_sq.end(), 0);",
        "Expected: 1+9+25+49+81 = 165",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Using ranges, write `topN(vector<pair<string,int>> scores, int n)` that returns the top-N names by score. Use `ranges::partial_sort` or sort + take. Input: `{{'alice',92},{'bob',75},{'charlie',88},{'diana',95}}`. For N=2, return `['diana','alice']`.",
      hint: "`ranges::sort(scores, greater<>{}, &pair<string,int>::second)` sorts by second field descending. Then `views::take(n) | views::keys` extracts names.",
      walkthrough: [
        "ranges::sort(scores, greater<>{}, [](auto& p){ return p.second; });",
        "vector<string> result;",
        "for (auto& [name,_] : scores | views::take(n)) result.push_back(name);",
        "return result;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-009-q1",
        type: "choice",
        text: "When does a ranges pipeline `v | views::filter(f) | views::transform(g)` actually execute?",
        options: [
          "Immediately when the pipeline expression is evaluated",
          "When you iterate over it (lazy — one element at a time)",
          "When you call .materialize() on it",
          "When the pipeline goes out of scope",
        ],
        answer: 1,
        explanation:
          "Range views are lazy. `v | filter | transform` creates an adaptor chain — no computation happens. When you iterate (`for (auto x : pipeline)` or call `begin()`/`*it++`), each increment pulls one element through the entire chain. Nothing executes until iteration.",
      },
      {
        id: "cpp2-009-q2",
        type: "choice",
        text: "What is the memory advantage of `v | views::filter | views::transform` over the classic approach?",
        options: [
          "Ranges use less stack memory",
          "The classic approach creates intermediate vectors; ranges pipeline creates none — O(1) extra memory",
          "Ranges compress the data",
          "There is no memory difference",
        ],
        answer: 1,
        explanation:
          "Classic `copy_if` → `transform` creates an intermediate vector after each step. A ranges pipeline threads each element through all adaptors without any intermediate storage — O(1) extra memory regardless of input size. For large inputs, this can be significant.",
      },
      {
        id: "cpp2-009-q3",
        type: "choice",
        text: "What does `ranges::sort(v, {}, &Student::name)` do?",
        options: [
          "Sorts v using the default comparator on &Student::name",
          "Sorts v by the 'name' member — {} uses default less<>, &Student::name is the projection",
          "Passes a null comparator and sorts by pointer address",
          "This is a compile error — ranges::sort doesn't support member pointers",
        ],
        answer: 1,
        explanation:
          "The third argument to `ranges::sort` is a *projection* — applied to each element before comparison. `&Student::name` projects each student to their name, so sorting is by name. The `{}` passes the default comparator `less<>`. This replaces a custom comparator lambda.",
      },
      {
        id: "cpp2-009-q4",
        type: "choice",
        text: "What does `views::iota(0)` produce?",
        options: [
          "A vector containing {0}",
          "An infinite lazy sequence 0, 1, 2, 3, ... — only generates values when iterated",
          "A random number starting from 0",
          "A compile error — iota requires a bounds argument",
        ],
        answer: 1,
        explanation:
          "`views::iota(0)` creates a lazy infinite sequence starting from 0. No values are generated until you iterate. Use `| views::take(n)` to limit it. `views::iota(0, 10)` creates a bounded sequence [0, 10). The infinite form is safe — it's only evaluated on demand.",
      },
    ],
  },
};

export default lesson;
