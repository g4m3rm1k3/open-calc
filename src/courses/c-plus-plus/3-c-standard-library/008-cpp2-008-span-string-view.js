const SPAN_BASIC_CODE = `#include <iostream>
#include <span>
#include <vector>
#include <array>
using namespace std;

// __OUTPUT__: vector: 1 2 3 4 5\\narray: 10 20 30\\nC array: 5 6 7 8\\nsubspan: 2 3 4\\nsize=5 empty=no

// span: non-owning view over contiguous data
void print(span<const int> s) {
    for (int x : s) cout << x << " ";
    cout << "\\n";
}

int main() {
    // span accepts vector, array, C array — same function
    vector<int> v = {1,2,3,4,5};
    array<int,3> a = {10,20,30};
    int carr[] = {5,6,7,8};

    cout << "vector: "; print(v);
    cout << "array: ";  print(a);
    cout << "C array: "; print(carr);

    // subspan: view into a portion — no copy
    span<int> sp(v);
    cout << "subspan: "; print(sp.subspan(1, 3));   // start=1, count=3

    // span properties
    cout << "size=" << sp.size()
         << " empty=" << (sp.empty() ? "yes" : "no") << "\\n";

    return 0;
}`;

const SPAN_MUTATE_CODE = `#include <iostream>
#include <span>
#include <vector>
#include <algorithm>
using namespace std;

// __OUTPUT__: before: 5 1 4 2 3\\nafter sort [1..4]: 5 1 2 3 4\\ndoubled: 2 4 6 8 10\\nfirst_half: 1 2 3

// span<int> (non-const): allows mutation
void sortSubrange(span<int> s, size_t start, size_t len) {
    sort(s.subspan(start, len).begin(),
         s.subspan(start, len).end());
}

void doubleAll(span<int> s) {
    for (int& x : s) x *= 2;
}

int main() {
    vector<int> v = {5,1,4,2,3};
    cout << "before: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    sortSubrange(v, 1, 4);   // sort index 1..4 in-place
    cout << "after sort [1..4]: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    vector<int> w = {1,2,3,4,5};
    doubleAll(w);
    cout << "doubled: ";
    for (int x : w) cout << x << " ";
    cout << "\\n";

    // first/last: take first n or last n elements
    span<int> sp(w);
    cout << "first_half: ";
    for (int x : sp.first(3)) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const STRVIEW_BASIC_CODE = `#include <iostream>
#include <string>
#include <string_view>
using namespace std;

// __OUTPUT__: length=12\\nfirst 5: Hello\\nfound at: 7\\nno alloc substr: world\\nstarts_with: yes\\ncount of o: 2

void analyze(string_view sv) {
    cout << "length=" << sv.length() << "\\n";
    cout << "first 5: " << sv.substr(0, 5) << "\\n";

    auto pos = sv.find("world");
    if (pos != string_view::npos)
        cout << "found at: " << pos << "\\n";

    // substr on string_view: zero allocation
    cout << "no alloc substr: " << sv.substr(pos) << "\\n";

    cout << "starts_with: " << (sv.starts_with("Hello") ? "yes" : "no") << "\\n";

    int count = 0;
    for (char c : sv) if (c == 'o') count++;
    cout << "count of o: " << count << "\\n";
}

int main() {
    analyze("Hello, world");  // string literal — no allocation
    return 0;
}`;

const VIEW_COMPARE_CODE = `#include <iostream>
#include <span>
#include <string_view>
#include <vector>
#include <string>
using namespace std;

// __OUTPUT__: span size=5 data same: yes\\nstrview same data: yes\\nspan: no null term\\nstrview: no null term\\ndangling risk: avoid storing views of temporaries

int main() {
    vector<int> v = {1,2,3,4,5};

    // span stores pointer+size — points into v's storage
    span<int> sp = v;
    cout << "span size=" << sp.size()
         << " data same: " << (sp.data() == v.data() ? "yes" : "no") << "\\n";

    string s = "hello world";

    // string_view stores pointer+size — points into s's storage
    string_view sv = s;
    cout << "strview same data: " << (sv.data() == s.data() ? "yes" : "no") << "\\n";

    // Neither has a null terminator guarantee (unlike C strings)
    cout << "span: no null term\\n";
    cout << "strview: no null term\\n";

    // Lifetime rules: views must not outlive their source
    // span<int> danger; { vector<int> temp; danger = temp; } // DANGLING
    // string_view dv = string("temp");  // DANGLING — temporary destroyed
    cout << "dangling risk: avoid storing views of temporaries\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-008",
  slug: "span-string-view",
  chapter: "cpp-2",
  order: 8,
  title: "span and string_view",
  subtitle: "Non-owning views over contiguous data — zero-copy parameters and subrange access",
  tags: ["c++", "cpp", "span", "string_view", "C++20", "C++17", "non-owning", "view", "zero-copy"],
  aliases: [
    "c++ span",
    "c++ string_view",
    "c++ non-owning view",
    "c++ zero-copy",
    "c++ subspan",
  ],

  hook: `Every time you pass a \`const vector<int>&\` to a function, it only works for vectors. Pass a C array or \`std::array\` and you need a different overload. \`std::span<T>\` unifies all of these — it's a non-owning view over any contiguous sequence. \`string_view\` does the same for strings. Zero allocation, zero copying, one function.`,

  mentalModel: [
    "**`span<T>` is a pointer + size over contiguous memory.** It accepts `vector<T>`, `array<T,N>`, C arrays, and raw pointers + sizes — all without copying. `span<const T>` for read-only views, `span<T>` for mutable. Use `subspan(start, count)` to view a portion.",
    "**`string_view` is a pointer + size over a character sequence.** All `string` operations work on it (`find`, `substr`, `starts_with`) without allocating. `substr` on a `string_view` returns another `string_view` — no copies. A function taking `string_view` accepts `string`, `string_view`, `char*`, and string literals.",
    "**Views don't own their data — lifetime is your responsibility.** A `span` into a vector becomes dangling when the vector is destroyed or reallocated. A `string_view` into a temporary `string` is immediately dangling. Never store a view longer than its source lives. Never return a view into a local variable.",
  ],

  intuition: {
    prose: [
      "**`span::subspan` enables zero-copy slice access.** Instead of creating a new vector containing elements 2..4, `sp.subspan(2, 3)` gives you a view of those elements in the original memory. Sort it, modify it, pass it to another function — all without allocation.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**span basics — run it then explore:**\n\n- Change `print(span<const int>)` to `print(const vector<int>&)` — does it still work with `array` and C array? (no — compile error)\n- `sp.first(2)` and `sp.last(2)` — get front and back slices.\n- Print `sp.data()` and `v.data()` — they should be the same pointer.\n- Try `span<int> sp2(v.data()+1, 3)` — manual construction from pointer + size.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SPAN_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Mutable span — run it then explore:**\n\n- `doubleAll(v)` modifies v in-place — verify v changed after the call.\n- `sortSubrange` with start=0, len=5 — sorts the whole vector.\n- Wrap a C array in a span: `int arr[] = {3,1,2}; span<int> s(arr); sort(s.begin(), s.end()); // arr is sorted`.\n- `span<const int>` prevents modification — try assigning `s[0] = 99` with const span.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SPAN_MUTATE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`string_view::data()` is not null-terminated.** Unlike `string::c_str()`, `string_view::data()` may not have a `\\0` terminator. Never pass `sv.data()` to a function expecting a C string (`printf(\"%s\", sv.data())` — undefined behavior if no null terminator). If you need a C string, construct `string(sv).c_str()`.",
      "**Fixed-size spans with static extent.** `span<int, 5>` is a `span` with compile-time-known size. It has zero overhead — no size stored, just a pointer. Functions taking `span<T, N>` with a fixed N enforce size at compile time. Most of the time you want dynamic extent (`span<int>`) for flexibility.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**string_view — run it then explore:**\n\n- `analyze(string(\"hello, world\"))` — the temporary `string` lives for the call duration, so it's safe.\n- `string_view sv = string(\"temp\"); cout << sv;` — DANGLING: temporary destroyed.\n- `sv.remove_prefix(7)` — modifies the view (moves start forward), not the string.\n- `sv.remove_suffix(1)` — shrinks the end of the view.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STRVIEW_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**span vs string_view internals — run it then explore:**\n\n- Verify `sp.data() == v.data()` — span is truly a view, not a copy.\n- `v.push_back(6)` after creating `sp` — sp may now be dangling (reallocation).\n- `string_view` comparison: `sv1 == sv2` compares character content, not pointers.\n- `string s2 = string(sv)` — explicitly create an owning copy when you need to outlive the source.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VIEW_COMPARE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Views become dangling when source is modified or destroyed",
        body: "`vector::push_back` may reallocate — any `span` into that vector becomes a dangling pointer. A `string_view` into a temporary `string` dangles immediately. Store views only when you can guarantee the source outlives them.",
      },
      {
        type: "tip",
        title: "Use span and string_view for function parameters, not member variables",
        body: "`void process(span<const int> data)` is safe — the span is valid for the function call. `struct Foo { span<int> data; }` is risky — the source must outlive the Foo object. Default: use views as parameters, owning types as members.",
      },
    ],
  },

  examples: [
    {
      title: "Uniform container function with span",
      body: `#include <span>
#include <numeric>

// Works with vector, array, C array, or raw pointer+size
double average(std::span<const double> data) {
    if (data.empty()) return 0.0;
    return std::accumulate(data.begin(), data.end(), 0.0) / data.size();
}

// All these work:
// std::vector<double> v = {1,2,3,4,5};  average(v);
// std::array<double,3> a = {1,2,3};     average(a);
// double arr[] = {1,2,3};               average(arr);
// double* p = ...; size_t n = ...;      average({p, n});`,
    },
    {
      title: "In-place partition with subspan",
      body: `#include <span>
#include <algorithm>

// Partition a vector in-place using spans for zero-copy subranges
void processChunks(std::span<int> data, size_t chunkSize) {
    for (size_t i = 0; i < data.size(); i += chunkSize) {
        auto chunk = data.subspan(i, std::min(chunkSize, data.size() - i));
        std::sort(chunk.begin(), chunk.end());  // sort each chunk in-place
    }
}

// std::vector<int> v = {5,3,1,8,2,4,7,6};
// processChunks(v, 4);  // sorts [5,3,1,8] and [2,4,7,6] independently`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `printReverse(span<const int> s)` that prints elements in reverse order using `s.last(s.size())` or manual indexing. Then write `reverseInPlace(span<int> s)` that reverses without a copy. Test with vector, array, and a C array — all three should work with the same function.",
      hint: "`reverseInPlace`: `std::reverse(s.begin(), s.end())` or swap elements manually. Both `span<const int>` and `span<int>` accept all contiguous containers.",
      walkthrough: [
        "printReverse: for (size_t i=s.size(); i>0; i--) cout << s[i-1] << ' ';",
        "reverseInPlace: std::reverse(s.begin(), s.end());",
        "Test: vector<int> v, array<int,5> a, int arr[3] — all pass to same function",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a `tokenize(string_view input, char delim)` that returns a `vector<string_view>` of tokens. Each `string_view` points into `input` — no copies. Handle empty tokens (consecutive delimiters). Test that the returned views still point into the original string's memory.",
      hint: "Find delimiter positions, create substrings with `input.substr(start, len)`. `string_view::find(delim, pos)` to advance. Push each `string_view` to result.",
      walkthrough: [
        "size_t start=0; while true:",
        "  pos = input.find(delim, start);",
        "  result.push_back(input.substr(start, pos-start));",
        "  if pos==npos break; else start=pos+1;",
        "Verify: result[0].data() == input.data() (same pointer)",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-008-q1",
        type: "choice",
        text: "What is the advantage of `span<const int>` over `const vector<int>&` as a function parameter?",
        options: [
          "span is faster to copy",
          "span accepts vector, array, C array, and raw pointers — const vector& only accepts vectors",
          "span is always const while vector& can be modified",
          "span stores elements more compactly",
        ],
        answer: 1,
        explanation:
          "`span<const int>` accepts any contiguous sequence: `vector<int>`, `array<int,N>`, C arrays, and `{ptr, size}` — all without copying. `const vector<int>&` only accepts `vector` (or types that implicitly convert to one). `span` is the zero-overhead unifying abstraction.",
      },
      {
        id: "cpp2-008-q2",
        type: "choice",
        text: "What does `span::subspan(start, count)` return?",
        options: [
          "A new vector containing elements from start to start+count",
          "A span (non-owning view) into the same memory, starting at index 'start' with 'count' elements",
          "An iterator to the element at index 'start'",
          "A copy of the subrange as a std::array",
        ],
        answer: 1,
        explanation:
          "`subspan(start, count)` creates a new span over the same memory — no copy, no allocation. It's a view into a portion of the original sequence. Modifying through the subspan modifies the original data. Omitting `count` takes the rest: `sp.subspan(2)` is elements from index 2 to end.",
      },
      {
        id: "cpp2-008-q3",
        type: "choice",
        text: "Why can't you call `string_view::c_str()` like `string::c_str()`?",
        options: [
          "string_view doesn't have string operations",
          "string_view data may not be null-terminated — there's no guarantee of a \\0 after the last character",
          "c_str() requires heap allocation which string_view avoids",
          "string_view::data() already returns a null-terminated string",
        ],
        answer: 1,
        explanation:
          "`string::c_str()` guarantees a null-terminated C string. `string_view` is just a pointer + length into arbitrary character data — the character at `data()[size()]` may be anything. A `string_view` into the middle of a string has no null terminator. Use `string(sv).c_str()` when a C string is needed.",
      },
      {
        id: "cpp2-008-q4",
        type: "choice",
        text: "When does a `span` become dangling?",
        options: [
          "Never — span manages its own memory",
          "When the underlying container is destroyed, reallocated (e.g., vector push_back), or goes out of scope",
          "When you call subspan on it",
          "After the span is passed to a function",
        ],
        answer: 1,
        explanation:
          "A `span` holds a raw pointer into its source's memory. If `vector::push_back` triggers reallocation, the old memory is freed — the span becomes dangling. If the vector goes out of scope, same result. Always ensure the source outlives the span.",
      },
    ],
  },
};

export default lesson;
