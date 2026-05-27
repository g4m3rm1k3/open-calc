const ARRAY_LIST_CODE = `#include <iostream>
#include <array>
#include <list>
using namespace std;

// __OUTPUT__: array: 1 2 3 4 5 size=5\\nlist front=0 back=4\\nlist after insert: 0 99 1 2 3 4\\nlist after erase: 0 1 2 3 4

int main() {
    // std::array: fixed size, stack-allocated, zero overhead
    array<int, 5> a = {1,2,3,4,5};
    cout << "array: ";
    for (int x : a) cout << x << " ";
    cout << "size=" << a.size() << "\\n";

    // list: doubly linked — O(1) insert/erase anywhere, no shifting
    list<int> lst = {0,1,2,3,4};
    cout << "list front=" << lst.front() << " back=" << lst.back() << "\\n";

    // insert_after the front — O(1), no elements shift
    auto it = lst.begin();
    lst.insert(next(it), 99);
    cout << "list after insert: ";
    for (int x : lst) cout << x << " ";
    cout << "\\n";

    // erase by iterator — O(1), only invalidates that iterator
    it = next(lst.begin());   // points to 99
    lst.erase(it);
    cout << "list after erase: ";
    for (int x : lst) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const DEQUE_CODE = `#include <iostream>
#include <deque>
using namespace std;

// __OUTPUT__: deque: 0 1 2 3 4 5 6 7 8 9\\nfront=0 back=9\\nafter pop_front: 1 2 3 4 5 6 7 8 9\\ndeque[3]=4\\nafter push_front 10: 10 1 2 3 4 5 6 7 8 9

int main() {
    // deque: O(1) push/pop at both ends, O(1) random access
    deque<int> dq;
    for (int i=5; i<10; i++) dq.push_back(i);
    for (int i=4; i>=0; i--) dq.push_front(i);

    cout << "deque: ";
    for (int x : dq) cout << x << " ";
    cout << "\\n";
    cout << "front=" << dq.front() << " back=" << dq.back() << "\\n";

    dq.pop_front();
    cout << "after pop_front: ";
    for (int x : dq) cout << x << " ";
    cout << "\\n";

    // random access — O(1) but two pointer dereferences (slower than vector)
    cout << "deque[3]=" << dq[3] << "\\n";

    dq.push_front(10);
    cout << "after push_front 10: ";
    for (int x : dq) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const FWDLIST_CODE = `#include <iostream>
#include <forward_list>
using namespace std;

// __OUTPUT__: fl: 1 2 3 4 5\\nafter insert_after(1): 1 99 2 3 4 5\\nafter erase_after(99): 1 99 3 4 5\\nafter push_front: 0 1 99 3 4 5

int main() {
    // forward_list: singly linked — smallest per-node overhead
    forward_list<int> fl = {1,2,3,4,5};
    cout << "fl: ";
    for (int x : fl) cout << x << " ";
    cout << "\\n";

    // insert_after: need iterator to the element BEFORE insertion point
    auto it = fl.begin();   // points to 1
    fl.insert_after(it, 99);
    cout << "after insert_after(1): ";
    for (int x : fl) cout << x << " ";
    cout << "\\n";

    // erase_after: removes element AFTER the iterator
    auto it2 = next(fl.begin());   // points to 99
    fl.erase_after(it2);           // erases 2
    cout << "after erase_after(99): ";
    for (int x : fl) cout << x << " ";
    cout << "\\n";

    // push_front: O(1) — only front operations, no push_back
    fl.push_front(0);
    cout << "after push_front: ";
    for (int x : fl) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const SPLICE_CODE = `#include <iostream>
#include <list>
using namespace std;

// __OUTPUT__: a: 1 2 3\\nb: 10 20 30\\nafter splice b into a at pos 2: 1 10 20 30 2 3\\nb is now: empty\\nafter splice_one: 1 20 30 2 3  moved: 10

int main() {
    list<int> a = {1,2,3};
    list<int> b = {10,20,30};
    cout << "a: "; for (int x:a) cout<<x<<" "; cout<<"\\n";
    cout << "b: "; for (int x:b) cout<<x<<" "; cout<<"\\n";

    // splice: move all of b into a before position 2 — O(1), no copies
    auto pos = next(a.begin());   // points to 2
    a.splice(pos, b);
    cout << "after splice b into a at pos 2: ";
    for (int x:a) cout<<x<<" "; cout<<"\\n";
    cout << "b is now: " << (b.empty() ? "empty" : "not empty") << "\\n";

    // splice a single element: move just the first element of a into another list
    list<int> moved;
    moved.splice(moved.begin(), a, a.begin());   // O(1)
    cout << "after splice_one: ";
    for (int x:a) cout<<x<<" "; cout<<" moved: ";
    for (int x:moved) cout<<x<<" "; cout<<"\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-002",
  slug: "sequence-containers",
  chapter: "cpp-2",
  order: 2,
  title: "Sequence Containers",
  subtitle: "array, list, forward_list, deque — when vector isn't the right tool",
  tags: ["c++", "cpp", "STL", "list", "deque", "array", "forward_list", "sequence-containers", "splice"],
  aliases: [
    "c++ list",
    "c++ forward_list",
    "c++ array vs vector",
    "c++ deque",
    "c++ sequence containers",
    "c++ linked list",
  ],

  hook: `\`vector\` covers 80% of use cases. The other 20% — O(1) insertion in the middle, minimal memory overhead, fixed-size stack allocation, efficient front insertion — each has a dedicated container. Picking the wrong one means paying O(n) where O(1) was available, or burning cache lines on pointer chasing when contiguous memory was possible.`,

  mentalModel: [
    "**`std::array<T,N>` is a zero-overhead C array with STL interface.** Size is a compile-time constant. Elements live on the stack. All algorithms work on it. Prefer it over `T arr[N]` — it's copyable, has `.size()`, `.at()` (bounds-checked), and supports range-for.",
    "**`list` shines for stable iterators and O(1) splice.** `list::erase(it)` and `list::insert(it, val)` are O(1) and don't invalidate any other iterators. `list::splice` moves nodes between lists in O(1). Use when insertion/deletion dominates access, or when you hold iterators long-term.",
    "**`deque` is O(1) at both ends with O(1) random access.** Implemented as a sequence of fixed-size chunks. `push_front`/`push_back` add to existing chunks or allocate new ones. Random access is two pointer dereferences (slightly slower than vector). The backing container for `std::queue` and `std::stack`.",
  ],

  intuition: {
    prose: [
      "**`forward_list` is the minimal linked list.** Singly linked — each node stores one pointer instead of two. No `push_back`, no `size()`, no backward iteration. Operations are `_after` variants: `insert_after`, `erase_after`. Smallest per-node overhead when you truly need a linked list. Use when memory is tighter than `list` and you only traverse forward.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**array and list — run it then explore:**\n\n- Try `a.at(10)` — throws `out_of_range` (bounds-checked vs `a[10]` which is UB).\n- `std::array` supports `==` between two arrays of the same type/size — try it.\n- After `list::erase`, save a second iterator before erasing — is it still valid? (yes, only erased iterator is invalidated)\n- Try `sort(lst.begin(), lst.end())` — compile error (list is bidirectional, sort needs random-access). Use `lst.sort()` instead.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ARRAY_LIST_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**deque — run it then explore:**\n\n- `deque` supports `[]` and `.at()` — try `dq.at(100)` (throws out_of_range).\n- Compare: `deque` uses `push_front` but `vector` doesn't have it — try `vector::push_front` (compile error).\n- Insert in the middle of a deque — does it shift? (yes, either front or back half shifts)\n- Use a deque as a queue: `push_back` to enqueue, `front()` + `pop_front()` to dequeue.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": DEQUE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`forward_list` requires `_after` operations.** Because each node only knows its successor, you can only insert/erase *after* a known position. `before_begin()` returns a special iterator to the conceptual element before the first — use `insert_after(before_begin(), val)` to prepend.",
      "**The cache reality of linked lists.** Each node is a separate heap allocation, likely at a random address. Traversing a `list` with 10,000 elements follows 10,000 random pointers — 10,000 potential cache misses. Benchmarks consistently show `vector` outperforms `list` for insert-heavy workloads on modern hardware for small-to-medium sizes, because shifting adjacent cache lines is cheaper than pointer chasing. Profile before choosing `list`.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**forward_list — run it then explore:**\n\n- `forward_list` has no `.size()` — use `std::distance(fl.begin(), fl.end())` instead (O(n)).\n- `before_begin()` + `insert_after(before_begin(), 0)` — prepend an element.\n- `fl.remove(99)` — removes all elements equal to 99 in O(n).\n- Can you use `sort` with `forward_list`? (no — use `fl.sort()` member function)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FWDLIST_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**list splice — run it then explore:**\n\n- `splice` transfers nodes — no copies, no allocation, O(1). Verify: b is empty after splicing.\n- `a.splice(a.end(), b)` — appends all of b to a.\n- Splice a range: `a.splice(pos, b, b.begin(), b.end())` — move a subrange.\n- Try merging two sorted lists: `a.merge(b)` — O(n) merge, b becomes empty.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SPLICE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "info",
        title: "Container selection guide",
        body: "**vector**: default. **array**: fixed-size, stack. **deque**: O(1) front+back. **list**: O(1) insert anywhere + stable iterators. **forward_list**: minimal linked list (memory-critical). Reach for `list` only when you've profiled and confirmed cache misses aren't dominating.",
      },
      {
        type: "warning",
        title: "list::sort() — not std::sort()",
        body: "`std::sort` requires random-access iterators — it won't compile with `list`. Use the member function `lst.sort()` instead, which is a merge sort that works with bidirectional iterators. Same O(n log n) complexity, but operates on list nodes directly.",
      },
    ],
  },

  examples: [
    {
      title: "LRU cache with list + unordered_map",
      body: `// list holds keys in access order (most recent at front)
// unordered_map maps key → list iterator for O(1) access

class LRUCache {
    int capacity;
    list<int> order;
    unordered_map<int, list<int>::iterator> pos;
public:
    LRUCache(int cap) : capacity(cap) {}

    void access(int key) {
        if (pos.count(key)) order.erase(pos[key]);  // O(1) list erase
        order.push_front(key);
        pos[key] = order.begin();
        if ((int)order.size() > capacity) {
            pos.erase(order.back());
            order.pop_back();
        }
    }
    bool contains(int key) { return pos.count(key) > 0; }
};`,
    },
    {
      title: "deque as sliding window",
      body: `#include <deque>
#include <vector>

// Max in each sliding window of size k — O(n) using deque
std::vector<int> slidingMax(const std::vector<int>& v, int k) {
    std::deque<int> dq;  // stores indices, front = max of current window
    std::vector<int> result;
    for (int i = 0; i < (int)v.size(); i++) {
        // Remove elements outside window
        while (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
        // Remove smaller elements from back
        while (!dq.empty() && v[dq.back()] < v[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(v[dq.front()]);
    }
    return result;
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a `deque`-based palindrome checker. Read a string into a `deque<char>`, then repeatedly compare and pop from front and back. If all pairs match, it's a palindrome. Test with 'racecar', 'hello', 'abba'.",
      hint: "While `dq.size() > 1`: compare `dq.front()` == `dq.back()`, then `pop_front()` + `pop_back()`. If sizes are odd, one middle char left (doesn't matter).",
      walkthrough: [
        "deque<char> dq(s.begin(), s.end());",
        "while (dq.size() > 1) { if (dq.front() != dq.back()) return false; dq.pop_front(); dq.pop_back(); }",
        "return true;",
        "Test: racecar→true, hello→false, abba→true",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Use `list` to implement a task scheduler. Tasks have a priority (int) and name (string). `addTask(priority, name)` inserts in sorted order (highest priority first) using `list::insert` with a linear search. `processNext()` removes and returns the first task. Why is `list` better than `vector` here for repeated insertions in the middle?",
      hint: "Find the insertion point: `auto it = tasks.begin(); while (it != tasks.end() && it->priority >= priority) ++it;`. Then `tasks.insert(it, {priority, name})`. With list, this insert is O(1); with vector it would shift elements.",
      walkthrough: [
        "list<pair<int,string>> tasks;",
        "addTask: linear search to find pos, list::insert O(1)",
        "processNext: return tasks.front().second; tasks.pop_front();",
        "vs vector: insert in middle requires shifting O(n) elements",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-002-q1",
        type: "choice",
        text: "What is the key advantage of `std::array` over a raw C array `int arr[5]`?",
        options: [
          "std::array is faster than raw arrays",
          "std::array participates in STL algorithms, is copyable, has .size() and .at() bounds checking",
          "std::array allocates on the heap for safety",
          "std::array can resize at runtime",
        ],
        answer: 1,
        explanation:
          "`std::array` is the same size and performance as a raw C array (stack-allocated, zero overhead) but provides the STL interface: `.size()`, `.at()` (bounds-checked), range-for, and compatibility with all algorithms. It's copyable and comparable with `==`. Raw C arrays decay to pointers, losing size information.",
      },
      {
        id: "cpp2-002-q2",
        type: "choice",
        text: "What is `list::splice` and why is it O(1)?",
        options: [
          "splice copies elements from one list to another",
          "splice transfers nodes (by relinking pointers) without copying or allocating — just pointer updates",
          "splice is O(n) because it iterates through the moved range",
          "splice is a sorting operation",
        ],
        answer: 1,
        explanation:
          "`list::splice` transfers nodes from one list to another by relinking the `next`/`prev` pointers — no elements are copied or allocated. The node memory stays the same; only the pointer connections change. This makes it O(1) for single elements and O(1) for a full-list transfer (the range version is O(n) because it needs to count elements).",
      },
      {
        id: "cpp2-002-q3",
        type: "choice",
        text: "Why does `forward_list` use `insert_after` instead of `insert`?",
        options: [
          "insert_after is faster than insert",
          "Singly-linked nodes only know their successor — to insert before a node, you'd need the previous node which isn't stored",
          "forward_list can only grow at the back",
          "insert_after is the C++11 naming convention",
        ],
        answer: 1,
        explanation:
          "A singly-linked list node only stores a pointer to the *next* node, not the previous. To insert before position `it`, you'd need the node before `it`, but you can't get there without traversal. `insert_after` only needs the current node's pointer (to the next), which is immediately available.",
      },
      {
        id: "cpp2-002-q4",
        type: "choice",
        text: "When should you choose `list` over `vector` for a task scheduler with frequent insertions?",
        options: [
          "Always — list insertions are O(1) which is always better than vector's O(n)",
          "When elements are large and expensive to copy, and insertion position is found via iterator (not index), so list's O(1) insert outweighs its cache miss penalty",
          "Never — vector always outperforms list due to cache",
          "When the list has more than 1000 elements",
        ],
        answer: 1,
        explanation:
          "`list::insert` is O(1) once you have the iterator — but finding the position is O(n) either way. For small element counts, `vector` wins due to cache effects. `list` wins when elements are large (expensive to copy/move on shift), the working set fits in cache even with pointer chasing, or you need stable iterators. Profile before deciding.",
      },
    ],
  },
};

export default lesson;
