const STL_CODE = `#include <iostream>
#include <map>
#include <set>
#include <unordered_map>
#include <queue>
#include <deque>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: --- map (sorted by key) ---\\napple: 3\\nbanana: 5\\ncherry: 2\\nFound apple: 3\\n--- set (unique sorted values) ---\\n1 2 3 5 8 \\nIn set? yes\\n--- unordered_map (O(1) average) ---\\nalice: 95\\nbob: 87\\n--- queue (FIFO) ---\\nProcessing: task1\\nProcessing: task2\\nProcessing: task3\\n--- priority_queue (max-heap) ---\\nNext: 42\\nNext: 17\\nNext: 5\\n--- deque (double-ended) ---\\n0 1 2 3 4

int main() {
    // ── map: sorted key-value, O(log n) ───────────────────────
    cout << "--- map (sorted by key) ---" << endl;
    map<string, int> inventory;
    inventory["banana"] = 5;
    inventory["apple"]  = 3;
    inventory["cherry"] = 2;

    for (const auto& [key, val] : inventory)   // iterates in key-sorted order
        cout << key << ": " << val << endl;

    if (auto it = inventory.find("apple"); it != inventory.end())
        cout << "Found apple: " << it->second << endl;

    // ── set: sorted unique values, O(log n) ───────────────────
    cout << "--- set (unique sorted values) ---" << endl;
    set<int> primes = {2, 3, 5, 2, 3, 8, 1};  // duplicates silently dropped
    for (int p : primes) cout << p << " ";
    cout << endl;
    cout << "In set? " << (primes.count(3) ? "yes" : "no") << endl;

    // ── unordered_map: hash table, O(1) average ───────────────
    cout << "--- unordered_map (O(1) average) ---" << endl;
    unordered_map<string, int> scores;
    scores["alice"] = 95;
    scores["bob"]   = 87;
    for (const auto& [name, score] : scores)
        cout << name << ": " << score << endl;

    // ── queue: FIFO ───────────────────────────────────────────
    cout << "--- queue (FIFO) ---" << endl;
    queue<string> tasks;
    tasks.push("task1"); tasks.push("task2"); tasks.push("task3");
    while (!tasks.empty()) {
        cout << "Processing: " << tasks.front() << endl;
        tasks.pop();
    }

    // ── priority_queue: max-heap ──────────────────────────────
    cout << "--- priority_queue (max-heap) ---" << endl;
    priority_queue<int> pq;
    pq.push(5); pq.push(42); pq.push(17);
    while (!pq.empty()) {
        cout << "Next: " << pq.top() << endl;
        pq.pop();
    }

    // ── deque: O(1) push/pop at both ends ────────────────────
    cout << "--- deque (double-ended) ---" << endl;
    deque<int> dq;
    dq.push_back(2);  dq.push_back(3);  dq.push_back(4);
    dq.push_front(1); dq.push_front(0);
    for (int x : dq) cout << x << " ";
    cout << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-1-008",
  slug: "stl-containers",
  chapter: "cpp-1",
  order: 8,
  title: "STL Containers",
  subtitle:
    "Choose the right data structure: map, set, unordered_map, queue, deque, priority_queue",
  tags: [
    "c++",
    "cpp",
    "STL",
    "map",
    "set",
    "unordered_map",
    "queue",
    "priority_queue",
    "deque",
    "data-structures",
  ],
  aliases: [
    "c++ map",
    "c++ set",
    "c++ unordered_map",
    "c++ queue",
    "c++ priority queue",
    "c++ deque",
    "c++ STL containers",
  ],

  hook: `The C++ Standard Library ships with battle-tested data structures covering every common access pattern. Sorted key-value lookup? \`map\`. Fast average-case lookup by key? \`unordered_map\`. Unique sorted elements? \`set\`. Task queues? \`queue\` or \`priority_queue\`. Efficient insertion at both ends? \`deque\`. Knowing which container to reach for — and why — is the difference between O(1) and O(n) in the hot path.`,

  mentalModel: [
    "**Ordered vs unordered.** `map`, `set`, `multimap`, `multiset` are backed by red-black trees — all operations are O(log n), and iteration is in sorted order. `unordered_map`, `unordered_set` are backed by hash tables — average O(1) lookup but O(n) worst case (hash collisions), and iteration order is arbitrary. Choose ordered when you need sorted traversal or range queries; choose unordered for raw lookup speed.",
    "**Adaptors wrap sequences.** `queue`, `stack`, and `priority_queue` are *container adaptors* — they wrap an underlying container (`deque` by default) and restrict the interface. `queue` exposes only FIFO operations (front, push, pop). `stack` exposes LIFO (top, push, pop). `priority_queue` exposes heap operations (top is always the max). They enforce access discipline, not new data layouts.",
    "**`deque` vs `vector`.** `vector` is a contiguous array — O(1) random access, O(n) `push_front`. `deque` (double-ended queue) is a sequence of fixed-size chunks — O(1) `push_front` and `push_back`, O(1) random access (slightly slower than vector due to chunk indirection). Use `deque` when you need efficient insertion at both ends. `queue` and `stack` default to `deque` as their backing container.",
  ],

  intuition: {
    prose: [
      '**`map::operator[]` creates entries.** `m["key"]` does not just look up "key" — if "key" doesn\'t exist, it inserts a default-constructed value (0 for int, "" for string) and returns a reference to it. This is convenient for counting (`wordCount[word]++`) but dangerous for read-only access: `m["typo"]` silently creates an entry. For read-only lookup, use `m.find(key)` (returns iterator) or `m.at(key)` (throws `out_of_range`).',
      "**`count` vs `find` for membership.** `set.count(x)` returns 0 or 1 (it's a set — at most one occurrence). `set.find(x) != set.end()` does the same thing. For `multiset`/`multimap`, `count` returns the actual count; `find` returns the first match. In modern C++ (C++20), `set.contains(x)` is cleaner and reads like English. For unordered containers, `count` is O(1) average; for ordered, O(log n).",
      "**Priority queue ordering.** `priority_queue<int>` is a max-heap: `top()` gives the largest element. For a min-heap: `priority_queue<int, vector<int>, greater<int>>`. For custom types, provide a comparator. Common pattern: Dijkstra's algorithm uses `priority_queue<pair<int,int>, vector<...>, greater<...>>` where `pair.first` is the distance — the unvisited node with the smallest distance is always at the top.",
      "**Structured bindings and range-for.** `for (const auto& [key, val] : myMap)` uses C++17 structured bindings to unpack each `pair<const Key, Value>`. Without it: `for (const auto& p : myMap) { p.first; p.second; }`. Always use `const auto&` in range-for to avoid copying heavy objects. If you need to modify values: `for (auto& [key, val] : myMap) val *= 2;` — note: keys in map are always `const`, only values are modifiable.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          '**Explore container operations:**\n\n1. Compile and run — observe sorted order in `map`, dropped duplicates in `set`\n2. Add `inventory["apple"] += 10` then print — map updates in place\n3. Try `inventory["newFruit"]` without assigning — notice it creates an entry with value 0\n4. Change `priority_queue<int>` to `priority_queue<int, vector<int>, greater<int>>` — now it\'s a min-heap\n5. Add a `multiset<int>` with duplicate values — count() returns actual count\n6. Benchmark: add 1M elements to `map` vs `unordered_map` and compare insert speed',
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
      "**Iterator invalidation rules by container.** `map`/`set`/`unordered_map`: insertion never invalidates existing iterators (tree/hash table). `unordered_map` rehashing invalidates ALL iterators. `deque`: inserting at front/back invalidates all iterators (but not references to existing elements for back-only insertions). Rule of thumb: after any mutating operation, assume iterators are invalid unless you know the specific container's guarantee.",
      "**Custom hash functions for `unordered_map`.** Built-in types (int, string, pointer) have standard hashes. For custom types as keys, provide a hash specialization: `template<> struct std::hash<MyType> { size_t operator()(const MyType& x) const { return hash<string>()(x.id); } };` and an `operator==`. Without these, `unordered_map<MyType, ...>` won't compile.",
      '**`emplace` vs `insert`.** `m.insert({"key", value})` constructs a `pair` then copies/moves it into the map. `m.emplace("key", value)` constructs the pair *in-place* inside the map — no intermediate object. For containers of complex objects, `emplace_back` / `emplace` can be significantly faster than `push_back` / `insert`. In modern C++, prefer `emplace` for containers of non-trivial types.',
    ],
    callouts: [
      {
        type: "warning",
        title:
          "map::operator[] creates entries — use find() for read-only access",
        body: '`if (m["key"] == 0)` is not a safe way to check if a key is absent. It inserts a zero-valued entry if the key doesn\'t exist. Always use `m.find("key") != m.end()` or `m.count("key")` to check membership, and `m.at("key")` (throws on missing) or `find` for safe read access.',
      },
      {
        type: "info",
        title: "Container complexity summary",
        body: "vector: O(1) back push/pop, O(n) front; deque: O(1) both ends; map/set: O(log n) all; unordered_map/set: O(1) avg, O(n) worst; priority_queue: O(log n) push/pop, O(1) top; queue/stack: O(1) all (amortized). When in doubt: vector for sequences, unordered_map for lookup tables, priority_queue for scheduling.",
      },
      {
        type: "tip",
        title: "Use reserve() to avoid rehashing in unordered_map",
        body: "If you know the approximate number of elements upfront, call `m.reserve(N)` before inserting. This pre-allocates bucket capacity and avoids rehashing — which invalidates all iterators and takes O(n) time. For frequently-looked-up tables built once and read many times, `reserve` is a free win.",
      },
    ],
  },

  examples: [
    {
      title: "Word frequency counter with map",
      body: `#include <map>
#include <sstream>
#include <string>
#include <algorithm>

std::map<std::string, int> wordFrequency(const std::string& text) {
    std::map<std::string, int> freq;
    std::istringstream ss(text);
    std::string word;
    while (ss >> word) {
        // Normalize: lowercase, strip punctuation
        std::transform(word.begin(), word.end(), word.begin(), ::tolower);
        word.erase(std::remove_if(word.begin(), word.end(), ::ispunct), word.end());
        if (!word.empty()) freq[word]++;
    }
    return freq;
}

// Usage:
// auto freq = wordFrequency("the cat sat on the mat the cat");
// for (auto& [w, c] : freq) cout << w << ": " << c << endl;
// Outputs in sorted order: cat:2, mat:1, on:1, sat:1, the:3`,
    },
    {
      title: "Graph BFS with queue",
      body: `#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <vector>

std::vector<int> bfs(int start,
                     const std::unordered_map<int, std::vector<int>>& graph) {
    std::vector<int> order;
    std::unordered_set<int> visited;
    std::queue<int> q;

    q.push(start);
    visited.insert(start);

    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);

        for (int neighbor : graph.at(node)) {
            if (!visited.count(neighbor)) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}`,
    },
    {
      title: "LRU cache with map + list",
      body: `#include <list>
#include <unordered_map>

class LRUCache {
    int capacity;
    std::list<std::pair<int,int>> order;  // front = most recent
    std::unordered_map<int, std::list<std::pair<int,int>>::iterator> cache;

public:
    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        auto it = cache.find(key);
        if (it == cache.end()) return -1;
        order.splice(order.begin(), order, it->second); // move to front
        return it->second->second;
    }

    void put(int key, int value) {
        if (cache.count(key)) {
            cache[key]->second = value;
            order.splice(order.begin(), order, cache[key]);
        } else {
            if ((int)order.size() == capacity) {
                cache.erase(order.back().first);
                order.pop_back();
            }
            order.push_front({key, value});
            cache[key] = order.begin();
        }
    }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        'Implement a phone book using `map<string, string>` (name → number). Support: `add(name, number)`, `lookup(name)` (returns number or "Not found"), `remove(name)`, `listAll()` (prints all contacts in alphabetical order). Test with 5+ contacts, look up existing and nonexistent names, remove one, list remaining.',
      hint: "Use `find()` for safe lookup. `erase(name)` removes a key. Range-for over `map` already gives alphabetical order.",
      walkthrough: [
        "map<string,string> book;",
        "add: book[name] = number;",
        "lookup: auto it = book.find(name); return (it != book.end()) ? it->second : 'Not found'",
        "remove: book.erase(name);",
        "listAll: for (const auto& [n, num] : book) cout << n << ': ' << num",
      ],
    },
    {
      difficulty: "hard",
      problem:
        "Build a task scheduler with priorities. Use `priority_queue<pair<int,string>, vector<pair<int,string>>, greater<>>` as a min-heap (lower number = higher priority). Implement `addTask(priority, description)` and `processAll()` that prints tasks in priority order. Add 6 tasks with mixed priorities. Then extend: support 'delayed tasks' — tasks that become available only after a tick count. Use a second `priority_queue<pair<int,string>>` for pending tasks where first = available-tick.",
      hint: "For the delayed extension, `runTick(int tick)` moves tasks from the pending queue to the ready queue if their available-tick <= current tick.",
      walkthrough: [
        "using Task = pair<int,string>; priority_queue<Task, vector<Task>, greater<Task>> ready;",
        "addTask: ready.push({priority, desc});",
        "processAll: while (!ready.empty()) { auto [p,d] = ready.top(); ready.pop(); cout << p << ': ' << d; }",
        "Delayed: struct DelayedTask { int tick; int priority; string desc; };",
        "runTick: while (!pending.empty() && pending.top().tick <= tick) { move to ready }",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-008-q1",
        type: "choice",
        text: 'What does `myMap["key"]` do if "key" does not exist in the map?',
        options: [
          "Returns a default-constructed value without modifying the map",
          'Inserts a default-constructed entry for "key" and returns a reference to it',
          "Throws `std::out_of_range`",
          "Returns `end()` iterator",
        ],
        answer: 1,
        explanation:
          "`operator[]` on a `map` performs insert-if-absent: if the key doesn't exist, it inserts a default-constructed value (0 for int) and returns a reference to that new entry. This is why `map[key]++` works as a counter but `if (map[key] == 0)` is not a safe absence check — it creates the entry.",
      },
      {
        id: "cpp1-008-q2",
        type: "choice",
        text: "What is the average-case time complexity of lookup in `unordered_map` vs `map`?",
        options: [
          "Both O(log n)",
          "unordered_map: O(1) average; map: O(log n)",
          "unordered_map: O(n) average; map: O(1)",
          "Both O(1)",
        ],
        answer: 1,
        explanation:
          "`unordered_map` uses a hash table — average O(1) for find/insert/erase but O(n) worst case on hash collisions. `map` uses a red-black tree — always O(log n) for all operations, iteration in sorted key order. Choose `unordered_map` for raw speed, `map` when sorted order or range queries matter.",
      },
      {
        id: "cpp1-008-q3",
        type: "choice",
        text: "What is the output order of `priority_queue<int> pq` after pushing 3, 1, 4, 1, 5, 9 and popping all?",
        options: [
          "3 1 4 1 5 9 (insertion order)",
          "1 1 3 4 5 9 (ascending)",
          "9 5 4 3 1 1 (descending — max first)",
          "9 1 5 1 4 3 (heap internal order)",
        ],
        answer: 2,
        explanation:
          "`priority_queue<int>` is a max-heap: `top()` always returns the largest element. Popping all elements produces descending order: 9, 5, 4, 3, 1, 1. For ascending order (min first), use `priority_queue<int, vector<int>, greater<int>>`.",
      },
      {
        id: "cpp1-008-q4",
        type: "choice",
        text: "Which container would you choose to implement a sliding window minimum over a stream of integers?",
        options: [
          "std::set — to maintain sorted order and get minimum with begin()",
          "std::queue — because it's a queue",
          "std::map — for key-value mapping",
          "std::priority_queue — for O(1) minimum",
        ],
        answer: 0,
        explanation:
          "`std::set` (or `std::multiset` if duplicates can occur) maintains sorted order — the minimum is always at `*begin()`. When the window slides, remove the outgoing element with `erase()` and insert the incoming one. All operations are O(log n). A `priority_queue` can't efficiently remove arbitrary elements (only top).",
      },
    ],
  },
};

export default lesson;
