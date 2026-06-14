const VECTOR_CODE = `#include <iostream>
#include <vector>
using namespace std;

// __OUTPUT__: size=5 front=10 back=50\\n10 20 30 40 50\\nafter push: 10 20 30 40 50 60\\nafter pop: size=5

int main() {
    vector<int> v = {10, 20, 30, 40, 50};

    cout << "size=" << v.size()
         << " front=" << v.front()
         << " back=" << v.back() << endl;

    for (int x : v) cout << x << " ";
    cout << endl;

    v.push_back(60);
    cout << "after push: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    v.pop_back();
    cout << "after pop: size=" << v.size() << endl;

    return 0;
}`;

const SORT_SEARCH_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

// __OUTPUT__: sorted: 1 2 3 5 7 8 9\\nmax=9 min=1 sum=35\\n5 found at index 3

int main() {
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7};

    sort(nums.begin(), nums.end());
    cout << "sorted: ";
    for (int n : nums) cout << n << " ";
    cout << endl;

    cout << "max=" << *max_element(nums.begin(), nums.end())
         << " min=" << *min_element(nums.begin(), nums.end())
         << " sum=" << accumulate(nums.begin(), nums.end(), 0) << endl;

    auto it = find(nums.begin(), nums.end(), 5);
    if (it != nums.end())
        cout << "5 found at index " << (it - nums.begin()) << endl;

    return 0;
}`;

const FILTER_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

// __OUTPUT__: odds: 1 3 5 7 9\\nsquared: 1 9 25 49 81\\nproduct: 945

int main() {
    vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    // Erase-remove idiom: remove all even numbers
    v.erase(remove_if(v.begin(), v.end(),
                      [](int x){ return x % 2 == 0; }),
            v.end());
    cout << "odds: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    // transform: square each element in-place
    transform(v.begin(), v.end(), v.begin(),
              [](int x){ return x * x; });
    cout << "squared: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    int product = accumulate(v.begin(), v.end(), 1,
                             [](int a, int b){ return a * b; });
    cout << "product: " << product << endl;

    return 0;
}`;

const MATRIX_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// __OUTPUT__: 1 2 3\\n4 5 6\\n7 8 9\\nsorted chars: Helo

int main() {
    // 2D vector: vector of vectors
    vector<vector<int>> grid = {{1,2,3},{4,5,6},{7,8,9}};
    for (auto& row : grid) {
        for (int v : row) cout << v << " ";
        cout << endl;
    }

    // string works with all <algorithm> functions
    string s = "Hello";
    sort(s.begin(), s.end());
    s.erase(unique(s.begin(), s.end()), s.end());
    cout << "sorted chars: " << s << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-010",
  slug: "stl-basics",
  chapter: "cpp-0",
  order: 10,
  title: "STL Basics",
  subtitle:
    "std::vector, sort, find, accumulate — the standard toolkit every C++ developer uses daily",
  tags: [
    "c++",
    "cpp",
    "stl",
    "vector",
    "algorithm",
    "sort",
    "find",
    "accumulate",
    "iterator",
  ],
  aliases: [
    "c++ vector",
    "c++ stl",
    "c++ sort algorithm",
    "c++ standard library",
    "c++ iterators",
  ],

  hook: `Before you write any loop to find a max, sort a list, or count elements — the STL already has it, tested and optimized. \`std::vector\` alone replaces 80% of array use cases. Learning the STL is what separates C programmers using C++ syntax from real C++ developers.`,

  mentalModel: [
    "**`std::vector<T>` is a dynamically-sized array.** Elements are contiguous in memory (same layout as C arrays), so access is O(1). `push_back` grows the vector, `pop_back` shrinks it. It knows its own size: `v.size()`. This is your default container for ordered data.",
    "**Iterators are the STL's universal interface.** `v.begin()` points to the first element; `v.end()` is one past the last. All STL algorithms take `(begin, end)` ranges — `sort(v.begin(), v.end())` — making them work with any container. The [begin, end) convention means `end` is never dereferenced.",
    "**`<algorithm>` gives you generic operations: sort, find, transform, remove_if, accumulate.** They all work on any container range. Learn the pattern once, apply everywhere.",
  ],

  intuition: {
    prose: [
      "**`vector` is your go-to.** Fixed-size C arrays are useful but don't know their size, don't support copy assignment, and can't grow. `vector` solves all of this while maintaining the same cache-friendly contiguous memory layout.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Run it — then explore vector operations:**\n\n- Try `v[10]` — out-of-bounds, no check. Try `v.at(10)` — throws an exception.\n- `v.insert(v.begin() + 2, 99)` — insert at index 2. What's the new size?\n- `v.erase(v.begin())` — remove the first element.\n- `v.clear()` — empties the vector. Then `v.push_back(1)` — it's back.\n- Check `v.empty()` after clearing.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VECTOR_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          "**Sort, search, accumulate — run it then explore:**\n\n- Try `sort(nums.rbegin(), nums.rend())` for descending sort.\n- Use `count(nums.begin(), nums.end(), 3)` — how many 3s are there?\n- Use `binary_search(nums.begin(), nums.end(), 5)` after sorting — O(log n).\n- Change the `find` target to a value not in the vector. What does `it != nums.end()` tell you?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SORT_SEARCH_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The erase-remove idiom.** `remove_if` doesn't actually remove — it moves unwanted elements to the end and returns an iterator to the new logical end. The vector size is unchanged. You must call `.erase(it, v.end())` to actually shrink it. This two-step idiom is idiomatic C++.",
      "**`transform` applies a function element-wise.** `transform(begin, end, out, func)` applies `func` to each element in [begin, end) and writes results to `out`. For in-place transformation: pass `v.begin()` as both input and output. Combine with `accumulate(begin, end, init, func)` for fold operations — the two-argument form sums, the four-argument form lets you customize with any binary operation.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Filter and transform — run it then explore:**\n\n- Change the filter to remove numbers > 5 instead of even numbers.\n- Change transform to cube each element: `x * x * x`.\n- Use `count_if(v.begin(), v.end(), [](int x){ return x > 10; })` after squaring — how many squared values exceed 10?\n- Use `accumulate` with `+` (the default) to sum the squared odds.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FILTER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          "**2D vector and string as container — run it then explore:**\n\n- Add a row to the grid: `grid.push_back({10, 11, 12})` — then print all rows.\n- Access `grid[1][2]` — what's the value?\n- Try `sort(s.begin(), s.end())` on `\"banana\"` — what comes out?\n- Use `count(s.begin(), s.end(), 'a')` on `\"banana\"` — how many 'a's?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MATRIX_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "vector[] does NOT bounds-check",
        body: "`v[i]` for out-of-range `i` is undefined behavior. Use `v.at(i)` during development — it throws `std::out_of_range`. Switch to `[]` in verified production code for performance.",
      },
      {
        type: "warning",
        title: "Iterator invalidation after push_back",
        body: "If `push_back` causes reallocation (size reaches capacity), ALL iterators become invalid — they point to the old buffer. Never use an iterator across a potentially-reallocating operation. Use `reserve(n)` upfront to prevent this.",
      },
      {
        type: "tip",
        title: "reserve() before building a vector in a loop",
        body: "If you know you'll add 1000 elements: `v.reserve(1000)` pre-allocates space, avoiding ~10 reallocations. `reserve` changes capacity but not size. Performance improvement can be 2-5× for large builds.",
      },
    ],
  },

  examples: [
    {
      title: "Sort structs with a custom comparator",
      body: `struct Student { string name; double gpa; };

vector<Student> students = {
    {"Alice", 3.8}, {"Bob", 3.5}, {"Charlie", 3.9}
};

// Sort by GPA descending
sort(students.begin(), students.end(),
     [](const Student& a, const Student& b){
         return a.gpa > b.gpa;
     });

for (const auto& s : students)
    cout << s.name << ": " << s.gpa << endl;
// Charlie: 3.9 / Alice: 3.8 / Bob: 3.5`,
    },
    {
      title: "Binary search on sorted vector",
      body: `vector<int> sorted = {1, 3, 5, 7, 9, 11};

// Check existence O(log n) — requires sorted range
bool found = binary_search(sorted.begin(), sorted.end(), 7);

// Insert and keep sorted
auto it = lower_bound(sorted.begin(), sorted.end(), 6);
sorted.insert(it, 6);   // {1,3,5,6,7,9,11}

// Count elements in range [5, 10]
auto lo = lower_bound(sorted.begin(), sorted.end(), 5);
auto hi = upper_bound(sorted.begin(), sorted.end(), 10);
cout << (hi - lo) << endl;  // 4  (5,6,7,9)`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Read n integers into a vector, then print: (1) the sorted vector, (2) the median (middle element after sorting for odd n), (3) how many elements are above the average. Use `sort` and `accumulate`.",
      hint: "Median: `v[v.size()/2]` after sorting. Average: `accumulate(v.begin(), v.end(), 0.0) / v.size()`.",
      walkthrough: [
        "Read n, push_back n values",
        "sort(v.begin(), v.end())",
        "Median: v[v.size()/2]",
        "Average: accumulate / size",
        "Count above average with loop or count_if",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Word frequency counter. Read words from stdin with `while (cin >> word)`. Count with a `map<string, int>` — `freq[word]++` auto-initializes to 0. Print each word and count in alphabetical order (map iterates in sorted key order). Then find and print the most-frequent word.",
      hint: "`#include <map>`. Iterate: `for (auto& [word, count] : freq)`. For most-frequent: track the max while iterating.",
      walkthrough: [
        "map<string,int> freq; string word; while (cin >> word) freq[word]++;",
        'for (auto& [w, c] : freq) cout << w << ": " << c;',
        "Track max: auto maxIt = max_element(freq.begin(), freq.end(), [](auto& a, auto& b){ return a.second < b.second; });",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-010-q1",
        type: "choice",
        text: "What does `v.end()` return?",
        options: [
          "An iterator to the last element",
          "An iterator to one past the last element",
          "nullptr",
          "The size of the vector",
        ],
        answer: 1,
        explanation:
          "`v.end()` is one past the last element — it marks the end of the range but doesn't point to valid data. All STL ranges use [begin, end) where end is exclusive. `*v.end()` is undefined behavior.",
      },
      {
        id: "cpp0-010-q2",
        type: "choice",
        text: "What is the time complexity of `std::sort`?",
        options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
        answer: 2,
        explanation:
          "`std::sort` uses introsort (quicksort + heapsort hybrid), guaranteeing O(n log n) worst case.",
      },
      {
        id: "cpp0-010-q3",
        type: "choice",
        text: "After `v.push_back(x)` causes a reallocation, what happens to iterators obtained before the push?",
        options: [
          "They remain valid and point to the same elements",
          "They become invalid — the vector moved its buffer",
          "They advance to point to the new element",
          "They become nullptr",
        ],
        answer: 1,
        explanation:
          "Reallocation copies all elements to a new buffer. Old iterators point to the old buffer and become dangling. Always re-obtain iterators after potentially-reallocating operations. Use `reserve()` to prevent reallocation.",
      },
      {
        id: "cpp0-010-q4",
        type: "choice",
        text: "What does `remove_if(v.begin(), v.end(), pred)` return?",
        options: [
          "The vector with matching elements deleted",
          "An iterator to the new logical end — elements satisfying pred moved to the back",
          "The count of removed elements",
          "A new vector without the matching elements",
        ],
        answer: 1,
        explanation:
          "`remove_if` rearranges elements but doesn't change size — it returns an iterator marking the new logical end. Call `v.erase(it, v.end())` to actually shrink the vector. This is the erase-remove idiom.",
      },
    ],
  },
};

export default lesson;
