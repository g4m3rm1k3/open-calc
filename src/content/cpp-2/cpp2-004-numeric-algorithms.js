const ACCUM_CODE = `#include <iostream>
#include <vector>
#include <numeric>
#include <functional>
using namespace std;

// __OUTPUT__: sum=55\\nproduct=3628800\\nmax_str: charlie\\nconcat: 12345

int main() {
    vector<int> v = {1,2,3,4,5,6,7,8,9,10};

    // accumulate: fold left with initial value
    int sum = accumulate(v.begin(), v.end(), 0);
    cout << "sum=" << sum << "\\n";

    // custom binary op: fold with multiplication
    long long prod = accumulate(v.begin(), v.end(), 1LL, multiplies<long long>{});
    cout << "product=" << prod << "\\n";

    // accumulate works on any type — find longest string
    vector<string> words = {"hi","charlie","bob"};
    string longest = accumulate(words.begin(), words.end(), string{},
        [](const string& acc, const string& s){
            return s.length() > acc.length() ? s : acc;
        });
    cout << "max_str: " << longest << "\\n";

    // accumulate strings: concat
    vector<string> digits = {"1","2","3","4","5"};
    string joined = accumulate(digits.begin(), digits.end(), string{});
    cout << "concat: " << joined << "\\n";

    return 0;
}`;

const PREFIX_CODE = `#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

// __OUTPUT__: partial_sum: 1 3 6 10 15\\nadjacent_diff: 1 1 1 1 1\\ninner_product: 55\\niota: 0 1 2 3 4 5 6 7 8 9

int main() {
    vector<int> v = {1,2,3,4,5};

    // partial_sum: running totals (prefix sums)
    vector<int> prefix(v.size());
    partial_sum(v.begin(), v.end(), prefix.begin());
    cout << "partial_sum: ";
    for (int x : prefix) cout << x << " ";
    cout << "\\n";

    // adjacent_difference: differences between consecutive elements
    vector<int> diffs(v.size());
    adjacent_difference(v.begin(), v.end(), diffs.begin());
    cout << "adjacent_diff: ";
    for (size_t i=1; i<diffs.size(); i++) cout << diffs[i] << " ";
    cout << "\\n";

    // inner_product: dot product of two ranges
    vector<int> w = {1,2,3,4,5};
    int dot = inner_product(v.begin(), v.end(), w.begin(), 0);
    cout << "inner_product: " << dot << "\\n";

    // iota: fill with consecutive values
    vector<int> seq(10);
    iota(seq.begin(), seq.end(), 0);
    cout << "iota: ";
    for (int x : seq) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const SORT_ALGO_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

// __OUTPUT__: sorted: 1 2 3 4 5 6 7 8 9 10\\npartial sort top 3: 1 2 3\\nnth_element[4]: 5\\nbinary_search 7: yes\\nlower_bound 5: index 4

int main() {
    vector<int> v = {5,3,8,1,9,2,7,4,6,10};
    sort(v.begin(), v.end());
    cout << "sorted: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // partial_sort: only sort first k elements — O(n log k)
    vector<int> v2 = {5,3,8,1,9,2,7,4,6,10};
    partial_sort(v2.begin(), v2.begin()+3, v2.end());
    cout << "partial sort top 3: " << v2[0] << " " << v2[1] << " " << v2[2] << "\\n";

    // nth_element: O(n) partition — v[n] is what it would be if sorted
    vector<int> v3 = {5,3,8,1,9,2,7,4,6,10};
    nth_element(v3.begin(), v3.begin()+4, v3.end());
    cout << "nth_element[4]: " << v3[4] << "\\n";

    // binary_search: O(log n) — requires sorted range
    cout << "binary_search 7: " << (binary_search(v.begin(), v.end(), 7) ? "yes" : "no") << "\\n";

    // lower_bound: first element >= value
    auto lb = lower_bound(v.begin(), v.end(), 5);
    cout << "lower_bound 5: index " << (lb - v.begin()) << "\\n";

    return 0;
}`;

const TRANSFORM_REDUCE_CODE = `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cmath>
using namespace std;

// __OUTPUT__: sum of squares: 385\\nmax abs: 9\\nnormalized: 0.27 0.53 0.8 0.07 0.13\\ncount > 5: 5

int main() {
    vector<int> v = {1,2,3,4,5,6,7,8,9,10};

    // transform_reduce: map each element then fold (C++17)
    int sumSq = transform_reduce(v.begin(), v.end(), 0,
                                 plus<int>{},
                                 [](int x){ return x*x; });
    cout << "sum of squares: " << sumSq << "\\n";

    // transform + accumulate: max absolute value
    vector<int> mixed = {-3,7,-1,9,-8,5};
    int maxAbs = *max_element(mixed.begin(), mixed.end(),
                              [](int a, int b){ return abs(a) < abs(b); });
    cout << "max abs: " << abs(maxAbs) << "\\n";

    // normalize a vector: divide by L2 norm
    vector<double> u = {2.0,4.0,6.0,0.5,1.0};
    double norm = sqrt(inner_product(u.begin(), u.end(), u.begin(), 0.0));
    vector<double> normalized(u.size());
    transform(u.begin(), u.end(), normalized.begin(),
              [norm](double x){ return x/norm; });
    cout << "normalized: ";
    for (double x : normalized) cout << round(x*100)/100 << " ";
    cout << "\\n";

    // count_if: count elements satisfying predicate
    int cnt = count_if(v.begin(), v.end(), [](int x){ return x>5; });
    cout << "count > 5: " << cnt << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-004",
  slug: "numeric-algorithms",
  chapter: "cpp-2",
  order: 4,
  title: "Numeric Algorithms",
  subtitle: "accumulate, partial_sum, inner_product, sort variants, transform_reduce",
  tags: ["c++", "cpp", "numeric", "accumulate", "partial_sum", "inner_product", "iota", "transform_reduce", "sort"],
  aliases: [
    "c++ numeric algorithms",
    "c++ accumulate",
    "c++ partial_sum",
    "c++ inner_product",
    "c++ transform_reduce",
    "c++ binary_search lower_bound",
  ],

  hook: `\`<numeric>\` gives you the building blocks of data computation: fold (accumulate), running totals (partial_sum), dot product (inner_product), and the C++17 parallel-ready transform_reduce. Combined with \`<algorithm>\`'s sort variants and binary search, these express whole computations in single expressive lines rather than manual loops.`,

  mentalModel: [
    "**`accumulate` is a generalized fold.** `accumulate(begin, end, init, op)` starts with `init` and applies `op(acc, element)` left-to-right. Without `op`, it uses `+`. With `multiplies<T>{}`, it's a product. With a custom lambda, it can compute max, build a string, or collect into any type.",
    "**`partial_sum` and `adjacent_difference` are inverses.** `partial_sum` computes running totals. `adjacent_difference` computes consecutive differences. Applying both gives back the original. Use `partial_sum` for prefix sum arrays (O(1) range sum queries after O(n) preprocessing).",
    "**Sort variants for partial work.** `sort` is O(n log n) full sort. `partial_sort(first, middle, last)` sorts only the first k elements — O(n log k). `nth_element(first, nth, last)` places the correct element at `nth` and partitions — O(n). Use `nth_element` for median or top-K without full sort.",
  ],

  intuition: {
    prose: [
      "**`lower_bound` and `upper_bound` on sorted ranges.** `lower_bound(begin, end, val)` returns the first position where `val` could be inserted to keep order (first element >= val). `upper_bound` returns the last such position (first element > val). Together they find the half-open range `[lower, upper)` of all occurrences of `val`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**accumulate — run it then explore:**\n\n- Change the initial value from `0` to `100` — what's the sum?\n- Use `accumulate` to compute the product of squares: lambda `[](long long a, int x){ return a * x*x; }`.\n- Use `accumulate` to count how many elements are even.\n- What happens with `accumulate` on an empty range? (returns init value)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ACCUM_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**partial_sum and related — run it then explore:**\n\n- Use `partial_sum` prefix array to compute range sum [2..4] in O(1): `prefix[4] - prefix[1]`.\n- `adjacent_difference` with `multiplies<int>{}` — what does it compute? (ratios between consecutive elements)\n- `inner_product` with custom ops: `inner_product(a, end, w, 0, plus<int>{}, [](int x, int w){ return x*w; })` — same result?\n- `iota(v, v+5, 10)` starts at 10 — produces 10 11 12 13 14.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PREFIX_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`nth_element` for O(n) median.** After `nth_element(v.begin(), v.begin()+n/2, v.end())`, `v[n/2]` is the median (element that would be at that position in sorted order). All elements before it are <= it; all after are >=. Useful when you need the k-th smallest without sorting everything.",
      "**`transform_reduce` for parallel computation (C++17).** The two-range version `transform_reduce(first1, last1, first2, init)` computes an inner product. The one-range version applies a unary transform then reduces. With an execution policy (`std::execution::par`), this can run in parallel. The key constraint: the reduction must be associative and commutative for correct parallel results.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Sort variants — run it then explore:**\n\n- `nth_element` for median: after the call, what is `v3[4]`? What about `v3[0]`?\n- `partial_sort` only guarantees the first k elements are sorted — print all of `v2` after partial_sort.\n- `binary_search` on an unsorted range — does it give correct results? (no — UB/wrong)\n- `lower_bound(v.begin(), v.end(), 5)` — what index? Try with a value not in the range.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SORT_ALGO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**transform_reduce and count_if — run it then explore:**\n\n- Compute L1 norm (sum of absolute values) using transform_reduce.\n- `count_if` with `v.size() - count_if(...)` to count elements <= 5.\n- Compute variance: first find mean, then `transform_reduce` with `(x-mean)^2`.\n- Use `any_of` and `all_of` to check predicates without counting.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TRANSFORM_REDUCE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "binary_search requires a sorted range",
        body: "`binary_search`, `lower_bound`, and `upper_bound` all assume the range is sorted (by the same comparator). Calling them on unsorted data gives incorrect results — no error, just wrong answers. Always sort first, or use a sorted container.",
      },
      {
        type: "tip",
        title: "Use nth_element for top-K instead of full sort",
        body: "`nth_element` is O(n) average case — much faster than O(n log n) `sort` when you only need to find the k-th element or partition into 'top K' and 'rest'. After the call, elements before `nth` are <= *nth and elements after are >= *nth.",
      },
    ],
  },

  examples: [
    {
      title: "O(1) range sum queries with prefix sums",
      body: `// Precompute: O(n)
std::vector<int> data = {3,1,4,1,5,9,2,6,5,3};
std::vector<int> prefix(data.size() + 1, 0);
std::partial_sum(data.begin(), data.end(), prefix.begin() + 1);

// Query sum of [l, r] (inclusive): O(1)
auto rangeSum = [&](int l, int r) { return prefix[r+1] - prefix[l]; };
// rangeSum(2, 5) = 4+1+5+9 = 19
// rangeSum(0, 9) = total sum`,
    },
    {
      title: "Statistics with numeric algorithms",
      body: `#include <numeric>
#include <cmath>

double mean(const std::vector<double>& v) {
    return std::accumulate(v.begin(), v.end(), 0.0) / v.size();
}

double variance(const std::vector<double>& v) {
    double m = mean(v);
    return std::transform_reduce(v.begin(), v.end(), 0.0,
        std::plus<double>{},
        [m](double x){ return (x-m)*(x-m); }) / v.size();
}

double stddev(const std::vector<double>& v) { return std::sqrt(variance(v)); }`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Use `iota`, `partial_sum`, and `inner_product` to compute the sum of products of all pairs (i,j) where i<j from 1 to N. For N=4: pairs are (1,2),(1,3),(1,4),(2,3),(2,4),(3,4) → products sum = 2+3+4+6+8+12 = 35. Hint: (sum_all)^2 - sum_of_squares = 2 * sum_of_pair_products.",
      hint: "Fill a vector with 1..N using iota. `total = accumulate(...)`. `sumSq = inner_product(v,v,0)`. Answer = (total*total - sumSq) / 2.",
      walkthrough: [
        "iota(v.begin(), v.end(), 1)",
        "int total = accumulate(v.begin(), v.end(), 0)",
        "int sumSq = inner_product(v.begin(), v.end(), v.begin(), 0)",
        "int result = (total*total - sumSq) / 2",
        "For N=4: total=10, sumSq=30, result=(100-30)/2=35",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `moving_average(vector<double>& v, int k)` function that returns a vector of k-window moving averages. Use `partial_sum` to precompute prefix sums, then compute each window average as `(prefix[i+k] - prefix[i]) / k` in O(1) per window. Return a vector of size `v.size() - k + 1`.",
      hint: "Prefix sum has size `v.size()+1` with `prefix[0]=0`. Window [i, i+k-1] sum = `prefix[i+k] - prefix[i]`. Loop from i=0 to v.size()-k.",
      walkthrough: [
        "vector<double> prefix(v.size()+1, 0);",
        "partial_sum(v.begin(), v.end(), prefix.begin()+1);",
        "vector<double> result;",
        "for (int i=0; i+k <= v.size(); i++) result.push_back((prefix[i+k]-prefix[i])/k);",
        "return result;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-004-q1",
        type: "choice",
        text: "What does `accumulate(v.begin(), v.end(), 1, multiplies<int>{})` compute?",
        options: [
          "Sum of all elements plus 1",
          "Product of all elements (starting multiplication from 1)",
          "Sum of all elements times 1",
          "Count of elements equal to 1",
        ],
        answer: 1,
        explanation:
          "`accumulate` with `multiplies<int>{}` folds with multiplication instead of addition. Starting from `1` (the identity for multiplication), it computes `1 * v[0] * v[1] * ... * v[n-1]` — the product of all elements.",
      },
      {
        id: "cpp2-004-q2",
        type: "choice",
        text: "What is `partial_sum`'s output for `{1,2,3,4,5}`?",
        options: [
          "{1,2,3,4,5} (unchanged)",
          "{1,3,6,10,15} (running totals)",
          "{0,1,3,6,10} (exclusive prefix sum)",
          "{1,1,1,1,1} (differences)",
        ],
        answer: 1,
        explanation:
          "`partial_sum` computes running totals: result[i] = sum of first i+1 elements. For {1,2,3,4,5}: 1, 1+2=3, 3+3=6, 6+4=10, 10+5=15.",
      },
      {
        id: "cpp2-004-q3",
        type: "choice",
        text: "What is the time complexity of `nth_element`?",
        options: [
          "O(n log n) — same as sort",
          "O(n) average case — uses introselect/quickselect",
          "O(n log k) where k is the position",
          "O(1) — uses binary search",
        ],
        answer: 1,
        explanation:
          "`nth_element` uses introselect/quickselect — average O(n), worst case O(n) for introselect variants. It's significantly faster than O(n log n) `sort` when you only need to find the k-th element or partition data. After the call, only `v[nth]` is guaranteed to be correct; others are partitioned but not sorted.",
      },
      {
        id: "cpp2-004-q4",
        type: "choice",
        text: "What does `lower_bound(v.begin(), v.end(), 5)` return when `v = {1,3,5,5,7}`?",
        options: [
          "Iterator to the first 5 (index 2)",
          "Iterator to the last 5 (index 3)",
          "Iterator to 7 (first element > 5)",
          "v.end() because 5 appears multiple times",
        ],
        answer: 0,
        explanation:
          "`lower_bound` returns an iterator to the *first* element that is >= the target value. For `{1,3,5,5,7}` with target 5, that's the first 5 at index 2. `upper_bound` would return the first element > 5 (the 7 at index 4).",
      },
    ],
  },
};

export default lesson;
