const STL_CODE = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>  // sort, find, accumulate, etc.
#include <numeric>    // accumulate
using namespace std;

// __OUTPUT__: --- vector basics ---\\nv: 10 20 30 40 50 \\nSize: 5  Front: 10  Back: 50\\nAfter push_back(60): 10 20 30 40 50 60 \\nAfter pop_back: size=5\\n--- sorting and searching ---\\nSorted: 1 2 3 5 7 8 9 \\nMax: 9  Min: 1  Sum: 35\\nfind(5): found at index 3\\n--- string as container ---\\nChars: H e l l o \\nSorted string: Helo\\n--- 2D vector (matrix) ---\\n1 2 3 \\n4 5 6 \\n7 8 9

int main() {
    // ── vector basics ──────────────────────────────────────────
    cout << "--- vector basics ---" << endl;
    vector<int> v = {10, 20, 30, 40, 50};

    cout << "v: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    cout << "Size: " << v.size()
         << "  Front: " << v.front()
         << "  Back: " << v.back() << endl;

    v.push_back(60);
    cout << "After push_back(60): ";
    for (int x : v) cout << x << " ";
    cout << endl;

    v.pop_back();
    cout << "After pop_back: size=" << v.size() << endl;

    // ── sorting and searching ──────────────────────────────────
    cout << "--- sorting and searching ---" << endl;
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7};
    sort(nums.begin(), nums.end());     // ascending
    cout << "Sorted: ";
    for (int n : nums) cout << n << " ";
    cout << endl;

    cout << "Max: " << *max_element(nums.begin(), nums.end()) << endl;
    cout << "Min: " << *min_element(nums.begin(), nums.end()) << endl;
    cout << "Sum: " << accumulate(nums.begin(), nums.end(), 0) << endl;

    auto it = find(nums.begin(), nums.end(), 5);
    if (it != nums.end())
        cout << "find(5): found at index " << (it - nums.begin()) << endl;

    // ── string as STL container ────────────────────────────────
    cout << "--- string as container ---" << endl;
    string hello = "Hello";
    cout << "Chars: ";
    for (char c : hello) cout << c << " ";
    cout << endl;

    string sorted_s = hello;
    sort(sorted_s.begin(), sorted_s.end());
    // Remove duplicate chars by using unique
    sorted_s.erase(unique(sorted_s.begin(), sorted_s.end()), sorted_s.end());
    cout << "Sorted string: " << sorted_s << endl;

    // ── 2D vector ──────────────────────────────────────────────
    cout << "--- 2D vector (matrix) ---" << endl;
    vector<vector<int>> matrix = {{1,2,3},{4,5,6},{7,8,9}};
    for (auto& row : matrix) {
        for (int val : row) cout << val << " ";
        cout << endl;
    }

    return 0;
}`;

const lesson = {
  id: "cpp-0-010",
  slug: "stl-basics",
  chapter: "cpp-0",
  order: 10,
  title: "STL Basics",
  subtitle: "Use std::vector, std::string, and the standard algorithms from <algorithm>",
  tags: ["c++", "cpp", "stl", "vector", "algorithm", "sort", "find", "accumulate", "iterator"],
  aliases: [
    "c++ vector",
    "c++ stl",
    "c++ sort algorithm",
    "c++ standard library",
    "c++ iterators",
  ],

  hook: `The Standard Template Library (STL) is C++'s built-in toolkit for data structures and algorithms. Before you write any loop to find a max, sort an array, or count elements — the STL already has it, tested, optimized, and portable. Learning the STL is what separates a C programmer who uses C++ from a real C++ developer. The vector alone replaces 80% of use cases for arrays.`,

  mentalModel: [
    "**`std::vector<T>` is a dynamically-sized array.** It stores elements contiguously in memory (like C-arrays) but can grow and shrink. Push elements with `push_back()`, access with `[]` or `.at()`, iterate with range-based for. The STL `vector` is the default choice for any ordered collection — use it unless you have a specific reason to choose another container.",
    "**Iterators are the STL's universal pointer-like interface.** `v.begin()` returns an iterator to the first element; `v.end()` is one past the last. STL algorithms take `(begin, end)` ranges, making them work with any STL container. `*it` dereferences the iterator; `it++` advances it. For `vector`, iterators are essentially pointers — `v.begin() + 3` works like pointer arithmetic.",
    "**`<algorithm>` gives you generic operations that work on any container range.** `sort(v.begin(), v.end())` sorts a vector. `find(v.begin(), v.end(), x)` searches for x. `accumulate(v.begin(), v.end(), 0)` sums. `max_element`, `min_element`, `count`, `reverse`, `copy` — these all follow the same (begin, end) pattern. Learn the pattern once, apply it to any container.",
  ],

  intuition: {
    prose: [
      "**Why `vector` over raw arrays?** Raw arrays are fixed-size, can't be returned from functions easily, lose their size when passed to functions, and can't be assigned with `=`. `std::vector` solves all of these: `vector<int> v2 = v1;` copies correctly; `v.size()` is always accurate; you can `push_back` to grow; you can `return v;` from functions. The performance difference is minimal — `vector` stores elements in the same contiguous layout as arrays, and modern implementations are highly optimized.",
      "**Vector memory and capacity.** `v.size()` is how many elements are currently in the vector. `v.capacity()` is how many it can hold before needing to reallocate. When `size == capacity` and you `push_back`, the vector allocates a new, larger buffer (typically 2×), copies elements, and frees the old. This amortizes the allocation cost — `push_back` is O(1) amortized. Use `v.reserve(n)` to pre-allocate space if you know the size upfront — avoids repeated reallocations.",
      "**The `<algorithm>` header is massive and powerful.** Beyond `sort` and `find`: `count(begin, end, val)` counts occurrences, `reverse(begin, end)` reverses in-place, `transform(begin, end, out_begin, func)` applies a function element-wise, `remove_if(begin, end, pred)` moves unwanted elements to the end (use with `erase`), `unique(begin, end)` removes consecutive duplicates. Mastering the standard algorithms is one of the most valuable skills in C++.",
      "**Iterators as a design pattern.** Every STL container — `vector`, `list`, `map`, `set`, `deque` — exposes iterators. This means ALL standard algorithms work with ALL standard containers without modification. `sort(list.begin(), list.end())` won't compile (sort needs random-access iterators), but `find`, `count`, `accumulate`, and others work on every iterable container. This iterator abstraction is what makes the STL 'generic'.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Explore the STL:**\n\n1. Compile and run — trace the vector and algorithm operations\n2. Add `sort(v.rbegin(), v.rend())` — sort in descending order using reverse iterators\n3. Use `count(nums.begin(), nums.end(), 3)` to count occurrences of 3\n4. Use `reverse(hello.begin(), hello.end())` to reverse a string in-place\n5. Try `v.erase(v.begin() + 2)` to remove element at index 2\n6. Combine: `v.erase(remove_if(v.begin(), v.end(), [](int x){return x%2==0;}), v.end())` — remove all even numbers",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": STL_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Iterator invalidation.** After certain `vector` operations, existing iterators become invalid: if `push_back` causes a reallocation, ALL iterators are invalidated (the vector moved its buffer). `erase` invalidates iterators at or after the erased position. This is why the erase-remove idiom uses the pattern `v.erase(remove_if(...), v.end())` rather than erasing in a loop — erasing in a loop while iterating is a classic bug. Never use a `vector` iterator after any modifying operation that might cause reallocation.",
      "**Algorithm complexity guarantees.** `std::sort` is O(n log n) — introsort (quicksort + heapsort hybrid). `std::find` is O(n) linear search (no assumption of order). `std::binary_search` is O(log n) but requires a sorted range. `std::lower_bound` / `std::upper_bound` return iterators to the first/last position where a value would be inserted in a sorted range — the foundation for binary search in the STL. Knowing complexities matters for choosing the right algorithm.",
      "**Custom comparators.** `sort(v.begin(), v.end(), comp)` where `comp(a, b)` returns true if `a` should come before `b`. Sort descending: `sort(v.begin(), v.end(), greater<int>())`. Sort structs by field: `sort(people.begin(), people.end(), [](const Person& a, const Person& b){ return a.age < b.age; })`. Lambdas (covered in cpp-1) make comparators concise. The comparator must satisfy strict weak ordering: irreflexive, asymmetric, transitive.",
    ],
    callouts: [
      {
        type: "warning",
        title: "vector::operator[] does NOT bounds-check",
        body: "`v[i]` for out-of-range `i` is undefined behavior — just like C arrays. Use `v.at(i)` during development: it throws `std::out_of_range` if `i >= v.size()`. For performance-critical production code, `[]` is fine once the logic is verified correct.",
      },
      {
        type: "info",
        title: "String is a sequence container too",
        body: "`std::string` works with all `<algorithm>` functions: `sort(s.begin(), s.end())` sorts characters, `find(s.begin(), s.end(), 'x')` finds a character, `count(s.begin(), s.end(), 'a')` counts occurrences. You get all STL algorithms on strings for free because string exposes standard iterators.",
      },
      {
        type: "tip",
        title: "reserve() before push_back() in a loop",
        body: "If you know you'll add 1000 elements: `v.reserve(1000)` allocates the space upfront, avoiding ~10 reallocations. `reserve` changes capacity but not size. Always `reserve` for known-size builds: performance difference can be 2-5× for large vectors.",
      },
    ],
  },

  examples: [
    {
      title: "vector idioms: build, filter, transform",
      body: `vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// Erase-remove idiom: remove all even numbers
numbers.erase(
    remove_if(numbers.begin(), numbers.end(),
              [](int x){ return x % 2 == 0; }),
    numbers.end()
);
// {1, 3, 5, 7, 9}

// Transform: square each element (in-place)
transform(numbers.begin(), numbers.end(), numbers.begin(),
          [](int x){ return x * x; });
// {1, 9, 25, 49, 81}

// Accumulate with custom operation (product)
int product = accumulate(numbers.begin(), numbers.end(), 1,
                         [](int acc, int x){ return acc * x; });`,
    },
    {
      title: "Sorting with custom comparator",
      body: `struct Student {
    string name;
    double gpa;
};

vector<Student> students = {
    {"Alice", 3.8}, {"Bob", 3.5}, {"Charlie", 3.9}
};

// Sort by GPA descending
sort(students.begin(), students.end(),
     [](const Student& a, const Student& b){
         return a.gpa > b.gpa;   // > for descending
     });

for (const auto& s : students)
    cout << s.name << ": " << s.gpa << endl;
// Charlie: 3.9
// Alice: 3.8
// Bob: 3.5`,
    },
    {
      title: "Binary search on sorted vector",
      body: `vector<int> sorted = {1, 3, 5, 7, 9, 11, 13, 15};

// Check if value exists (O(log n))
bool found = binary_search(sorted.begin(), sorted.end(), 7);

// Find insertion point
auto it = lower_bound(sorted.begin(), sorted.end(), 8);
// *it == 9, it points to where 8 would go

// Insert and keep sorted
sorted.insert(it, 8);
// {1, 3, 5, 7, 8, 9, 11, 13, 15}

// Count elements in range [5, 10]
auto lo = lower_bound(sorted.begin(), sorted.end(), 5);
auto hi = upper_bound(sorted.begin(), sorted.end(), 10);
cout << "Count in [5,10]: " << (hi - lo) << endl;  // 4`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Read n integers into a vector, then print: (1) the sorted vector, (2) the median value (middle element after sorting — for odd n), (3) how many elements are above the average. Use STL algorithms where possible: `sort`, `accumulate`.",
      hint: "Median = sorted_v[n/2] for odd n. Average = total / n. Count above-average with a manual loop or `count_if`.",
      walkthrough: [
        "Read n, then push_back n values into a vector",
        "sort(v.begin(), v.end())",
        "Median: v[v.size()/2]",
        "Average: accumulate(v.begin(), v.end(), 0.0) / v.size()",
        "Count above average: manual loop or count_if",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Word frequency counter. Read a paragraph (multiple words on multiple lines — read until EOF using `while(cin >> word)`). Store word counts in a `map<string, int>`. Print each unique word and its count, sorted alphabetically. Hint: `map` automatically sorts by key.",
      hint: "Include `<map>`. `map<string,int> freq; freq[word]++;` increments the count (starts at 0 if first time). Iterate: `for (auto& [word, count] : freq)`.",
      walkthrough: [
        "#include <map>",
        "string word; while (cin >> word) freq[word]++;",
        "for (auto& [w, c] : freq) cout << w << \": \" << c << endl;",
        "map automatically iterates in alphabetical order",
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
          "`v.end()` returns an iterator to one-past-the-last element — it doesn't point to valid data. All STL ranges use [begin, end) convention: begin is inclusive, end is exclusive. `*v.end()` is undefined behavior.",
      },
      {
        id: "cpp0-010-q2",
        type: "choice",
        text: "What is the time complexity of `std::sort`?",
        options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
        answer: 2,
        explanation:
          "`std::sort` uses introsort (a hybrid of quicksort, heapsort, and insertion sort), guaranteeing O(n log n) worst case. This is optimal for comparison-based sorting.",
      },
      {
        id: "cpp0-010-q3",
        type: "choice",
        text: "After `vector<int> v = {1,2,3}; v.push_back(4); auto it = v.begin();`, what might happen to `it` if you `push_back` many more elements?",
        options: [
          "it always remains valid and points to 1",
          "it becomes invalid if push_back causes a reallocation",
          "it advances to the newly added element",
          "it becomes nullptr",
        ],
        answer: 1,
        explanation:
          "When `push_back` causes reallocation (when size reaches capacity), the vector moves its internal buffer to a larger allocation. All existing iterators, pointers, and references become invalid because they point to the old buffer. Always re-obtain iterators after potential reallocation.",
      },
      {
        id: "cpp0-010-q4",
        type: "choice",
        text: "What does `remove_if(v.begin(), v.end(), pred)` do to the vector?",
        options: [
          "Erases all elements satisfying pred from v",
          "Moves elements satisfying pred to the end and returns an iterator to the new logical end — but does not change v.size()",
          "Creates a new vector with matching elements removed",
          "Throws an exception for each element satisfying pred",
        ],
        answer: 1,
        explanation:
          "`remove_if` rearranges elements: elements NOT satisfying pred are moved to the front, elements satisfying pred are moved to the back (in unspecified order). It returns an iterator to the new 'logical end'. The vector's size doesn't change — you must call `v.erase(it, v.end())` to actually shrink it. This is the erase-remove idiom.",
      },
    ],
  },
};

export default lesson;
