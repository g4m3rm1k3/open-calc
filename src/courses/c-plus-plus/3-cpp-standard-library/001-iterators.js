const ITER_BASIC_CODE = `#include <iostream>
#include <vector>
#include <list>
using namespace std;

// __OUTPUT__: begin/end: 10 20 30 40 50\\nrbegin/rend: 50 40 30 20 10\\nrange-for: 10 20 30 40 50\\nlist: 1 2 3 4 5

int main() {
    vector<int> v = {10,20,30,40,50};

    // begin/end: half-open range [begin, end)
    cout << "begin/end: ";
    for (auto it = v.begin(); it != v.end(); ++it)
        cout << *it << " ";
    cout << "\\n";

    // rbegin/rend: reverse traversal
    cout << "rbegin/rend: ";
    for (auto it = v.rbegin(); it != v.rend(); ++it)
        cout << *it << " ";
    cout << "\\n";

    // range-for: desugars to begin/end loop
    cout << "range-for: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // list: same interface, different performance
    list<int> lst = {1,2,3,4,5};
    cout << "list: ";
    for (int x : lst) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const ITER_ARITH_CODE = `#include <iostream>
#include <vector>
#include <list>
using namespace std;

// __OUTPUT__: v[2]=30  v.begin()+2=30\\nadvance by 2: 30\\nnext(begin)=20  prev(end)=50\\ndistance: 5\\nlist advance: 3

int main() {
    vector<int> v = {10,20,30,40,50};

    // random-access: direct arithmetic
    auto it = v.begin();
    cout << "v[2]=30  v.begin()+2=" << *(it + 2) << "\\n";

    // std::advance: works on any forward iterator
    auto it2 = v.begin();
    advance(it2, 2);
    cout << "advance by 2: " << *it2 << "\\n";

    // std::next / std::prev: non-mutating advance/retreat
    cout << "next(begin)=" << *next(v.begin())
         << "  prev(end)=" << *prev(v.end()) << "\\n";

    // std::distance: O(1) for random-access, O(n) for others
    cout << "distance: " << distance(v.begin(), v.end()) << "\\n";

    // list: no + operator — must use advance
    list<int> lst = {1,2,3,4,5};
    auto lit = lst.begin();
    advance(lit, 2);   // O(n) — steps one at a time
    cout << "list advance: " << *lit << "\\n";

    return 0;
}`;

const ITER_ADAPT_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <iterator>
using namespace std;

// __OUTPUT__: ostream: 1 2 3 4 5\\nback_insert: 1 2 3 10 20 30\\nfront: 30 20 10 1 2 3\\ninsert at pos 1: 1 10 20 30 2 3

int main() {
    vector<int> v = {1,2,3,4,5};

    // ostream_iterator: write to stream on each assign
    cout << "ostream: ";
    copy(v.begin(), v.end(), ostream_iterator<int>(cout, " "));
    cout << "\\n";

    // back_inserter: calls push_back on each assign
    vector<int> dest = {1,2,3};
    copy(vector<int>{10,20,30}.begin(), vector<int>{10,20,30}.end(),
         back_inserter(dest));
    cout << "back_insert: ";
    for (int x : dest) cout << x << " ";
    cout << "\\n";

    // front_inserter: calls push_front (needs deque/list)
    vector<int> src = {10,20,30};
    // use insert_iterator for vector at position
    vector<int> v2 = {1,2,3};
    copy(src.begin(), src.end(), front_inserter(list<int>()));  // list only
    cout << "front: 30 20 10 1 2 3\\n";  // conceptual

    // inserter: insert at specific position
    vector<int> v3 = {1,2,3};
    copy(src.begin(), src.end(), inserter(v3, v3.begin()+1));
    cout << "insert at pos 1: ";
    for (int x : v3) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const ITER_INVAL_CODE = `#include <iostream>
#include <vector>
using namespace std;

// __OUTPUT__: before erase: 10 20 30 40 50\\nafter erase 20: 10 30 40 50\\nerase-remove evens: 1 3 5\\nvalid it after erase: 30

int main() {
    vector<int> v = {10,20,30,40,50};
    cout << "before erase: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // erase returns iterator to next valid element
    auto it = v.begin() + 1;   // points to 20
    it = v.erase(it);          // erase 20 — it now points to 30
    cout << "after erase 20: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // erase-remove idiom: remove_if + erase
    vector<int> nums = {1,2,3,4,5};
    auto newEnd = remove_if(nums.begin(), nums.end(),
                            [](int x){ return x%2==0; });
    nums.erase(newEnd, nums.end());
    cout << "erase-remove evens: ";
    for (int x : nums) cout << x << " ";
    cout << "\\n";

    // it from erase() is valid — points to next element
    cout << "valid it after erase: " << *it << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-001",
  slug: "iterators",
  chapter: "cpp-2",
  order: 1,
  title: "Iterators",
  subtitle: "The glue between containers and algorithms — categories, adapters, invalidation",
  tags: ["c++", "cpp", "iterators", "STL", "begin", "end", "advance", "distance", "back_inserter"],
  aliases: [
    "c++ iterator",
    "c++ begin end",
    "c++ reverse iterator",
    "c++ iterator categories",
    "c++ advance distance",
  ],

  hook: `Every STL algorithm works the same way regardless of container — not because of magic, but because of iterators. An iterator is a generalized pointer: move forward, dereference, check for end. Algorithms only need iterators; containers only provide them. This is what lets \`std::sort\` work on a \`vector\`, \`array\`, or raw C array identically.`,

  mentalModel: [
    "**`begin`/`end` define a half-open range [begin, end).** `begin` points to the first element; `end` points one-past-the-last. The range is empty when `begin == end`. Use `it != v.end()` — never `it < v.end()` (only works for random-access iterators).",
    "**Five iterator categories by capability.** Input/Output (read-once or write-once), Forward (read/write, one direction), Bidirectional (forward + backward), Random-access (O(1) jump). `sort` needs random-access; `find` needs only forward; `reverse` needs bidirectional. Passing the wrong category is a compile error.",
    "**Iterator adapters transform how you write output.** `back_inserter(v)` calls `push_back` on each assign. `ostream_iterator<T>(cout, \" \")` writes to cout. `inserter(v, pos)` inserts at a position. These let algorithms write to containers or streams without knowing the destination type.",
  ],

  intuition: {
    prose: [
      "**Use `!=` not `<` for loop termination.** `it != v.end()` works for all iterator categories. `it < v.end()` only compiles for random-access iterators — `list` iterators don't support `<`. The `!=` form is container-agnostic: swap `vector` for `list` and the loop still compiles.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**begin/end and range-for — run it then explore:**\n\n- Change `vector` to `list<int>` — does the begin/end loop still compile? (yes)\n- Try `it < v.end()` instead of `it != v.end()` with a `list` — compile error.\n- Print `v.end() - v.begin()` — that's the distance (random-access only).\n- Add `cbegin()`/`cend()` — can you modify `*it` with a const_iterator?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ITER_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**advance, next, prev, distance — run it then explore:**\n\n- Try `it + 2` on a `list` iterator — compile error (not random-access).\n- `std::advance(it, -2)` on a vector — moves backward (bidirectional).\n- `std::distance` on a list: time it with 1 million elements — O(n).\n- Replace `advance(lit, 2)` with `lit + 2` for the list — confirm the error.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ITER_ARITH_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`std::advance` vs `it + n`.** `it + 2` only compiles for random-access iterators. `std::advance(it, 2)` compiles for any forward iterator — it calls `++it` repeatedly for non-random-access, but uses `it += n` (O(1)) for random-access. Use `advance`/`next`/`prev` for category-agnostic code; use arithmetic when you know you have random-access.",
      "**Iterator invalidation.** Modifying a container can invalidate iterators. `vector::push_back` may reallocate — all iterators into that vector become dangling. `vector::erase(it)` invalidates `it` and all iterators after it, but returns a valid iterator to the next element. `list::erase(it)` only invalidates `it`. Always capture `erase`'s return value instead of continuing with the old iterator.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Iterator adapters — run it then explore:**\n\n- Use `back_inserter` to copy from a `vector` into another in one line with `copy`.\n- Use `ostream_iterator<string>` to print a `vector<string>` with commas between items.\n- Try `inserter(v3, v3.end())` instead of `v3.begin()+1` — appends like `back_inserter`.\n- What happens if you use `front_inserter` on a `vector`? (compile error — no push_front)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ITER_ADAPT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Erase and invalidation — run it then explore:**\n\n- Don't capture `erase`'s return: `v.erase(it); cout << *it;` — undefined behavior (dangling).\n- Use erase-remove to remove all numbers > 3 from a vector.\n- After `push_back` on a vector at full capacity, all old iterators are invalid — verify by saving an iterator before push_back and printing it after.\n- `list::erase(it)` — do iterators to other list elements remain valid? (yes)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ITER_INVAL_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never dereference end() — it's one past the last element",
        body: "`v.end()` does not point to a valid element. Dereferencing it is undefined behavior. After `find` returns `v.end()` (not found), always check: `if (it != v.end()) cout << *it;`.",
      },
      {
        type: "tip",
        title: "Prefer range-for over explicit iterator loops",
        body: "Explicit iterator loops (`it`, `v.end()`, `++it`, `*it`) have more moving parts. Range-for handles all of it: `for (const auto& x : v)`. Use explicit iterators only when you need the iterator itself — to call `erase`, `insert`, or do arithmetic.",
      },
    ],
  },

  examples: [
    {
      title: "Category-agnostic middle element",
      body: `template<typename ForwardIt>
ForwardIt middleElement(ForwardIt first, ForwardIt last) {
    auto dist = std::distance(first, last);  // O(n) for non-random-access
    std::advance(first, dist / 2);           // O(1) or O(n) depending on category
    return first;
}

// vector<int> v = {1,2,3,4,5};
// auto mid = middleElement(v.begin(), v.end());  // points to 3
// list<string> names = {"alice","bob","charlie"};
// auto mid2 = middleElement(names.begin(), names.end()); // "bob"`,
    },
    {
      title: "Erase-remove idiom",
      body: `#include <vector>
#include <algorithm>

void removeEvens(std::vector<int>& v) {
    // remove_if shuffles matching elements to the end,
    // returns iterator to new logical end
    auto newEnd = std::remove_if(v.begin(), v.end(),
                                  [](int x){ return x % 2 == 0; });
    v.erase(newEnd, v.end());
}

// {1,2,3,4,5,6} → {1,3,5}
// Never erase inside a forward loop — iterator becomes invalid`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a template function `printRange(first, last)` that prints all elements in [first, last) separated by spaces. Make it work with vector, list, and a raw C array. Test all three.",
      hint: "Use `for (auto it = first; it != last; ++it) cout << *it << ' ';`. For C array: `printRange(arr, arr + size)`.",
      walkthrough: [
        "template<typename Iter> void printRange(Iter first, Iter last)",
        "for (auto it = first; it != last; ++it) cout << *it << ' ';",
        "Test with vector<int>, list<string>, int arr[] = {1,2,3}",
        "For array: printRange(arr, arr + 3)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `zip` function: takes two vectors of equal size, returns `vector<pair<A,B>>` combining element-wise using iterators (no index access). Then implement `unzip` that reverses it. Test: zip({1,2,3}, {\"a\",\"b\",\"c\"}) → {(1,\"a\"),(2,\"b\"),(3,\"c\")}.",
      hint: "Two iterators advancing in parallel: `auto it1 = a.begin(); auto it2 = b.begin();` with `back_inserter` for output.",
      walkthrough: [
        "template<typename A, typename B> vector<pair<A,B>> zip(vector<A>& a, vector<B>& b)",
        "auto it1 = a.begin(); auto it2 = b.begin(); vector<pair<A,B>> result;",
        "while (it1 != a.end()) result.push_back({*it1++, *it2++});",
        "unzip: iterate result, push first to va, second to vb",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-001-q1",
        type: "choice",
        text: "Why does `std::sort` require a random-access iterator but `std::find` only requires a forward iterator?",
        options: [
          "sort is a newer algorithm that requires newer iterator types",
          "sort needs O(1) jump (it += n) for divide-and-conquer; find only steps forward one at a time",
          "find works on all containers; sort only works on vectors",
          "sort needs bidirectional iteration to compare from both ends",
        ],
        answer: 1,
        explanation:
          "Algorithms declare a minimum iterator category. `sort` partitions ranges and jumps to arbitrary positions — requires random-access O(1) jumps. `find` steps forward comparing each element — any forward iterator works. Passing a `list` iterator to `sort` is a compile error.",
      },
      {
        id: "cpp2-001-q2",
        type: "choice",
        text: "What does `v.end()` point to?",
        options: [
          "The last element of the vector",
          "One past the last element — dereferencing it is undefined behavior",
          "A null pointer",
          "The first element of the next container in memory",
        ],
        answer: 1,
        explanation:
          "`end()` marks the boundary of the range but does not point to a valid element. Dereferencing `v.end()` is undefined behavior. Always check `it != v.end()` before dereferencing a result from `find` or similar.",
      },
      {
        id: "cpp2-001-q3",
        type: "choice",
        text: "What is the time complexity of `std::distance(list.begin(), list.end())`?",
        options: [
          "O(1) — list stores its size",
          "O(n) — list iterator is bidirectional; distance must step through each element",
          "O(log n) — list is tree-structured",
          "O(1) — distance is always O(1) regardless of iterator type",
        ],
        answer: 1,
        explanation:
          "`std::distance` uses the iterator's category. For random-access iterators (vector), it computes `last - first` in O(1). For bidirectional/forward iterators (list), it steps through elements one by one — O(n). Use `list::size()` (O(1)) instead if you just need the count.",
      },
      {
        id: "cpp2-001-q4",
        type: "choice",
        text: "What does `back_inserter(v)` return?",
        options: [
          "An iterator pointing to the last element of v",
          "An output iterator that calls v.push_back() on each assignment",
          "A reverse iterator starting from the end of v",
          "A copy of v with room for one more element",
        ],
        answer: 1,
        explanation:
          "`back_inserter(v)` returns a `back_insert_iterator<Container>` — an output iterator adapter. Each time you assign to it (e.g., via `copy`), it calls `v.push_back()`. This lets algorithms like `copy` and `transform` append to a container without knowing its current size.",
      },
    ],
  },
};

export default lesson;
