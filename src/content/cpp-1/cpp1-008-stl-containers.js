const MAP_CODE = `#include <iostream>
#include <map>
#include <string>
using namespace std;

// __OUTPUT__: apple: 3\\nbanana: 5\\ncherry: 2\\nfound apple: 3\\napple missing? no

int main() {
    map<string, int> inv;
    inv["banana"] = 5;
    inv["apple"]  = 3;
    inv["cherry"] = 2;

    // map iterates in sorted key order
    for (const auto& [k, v] : inv) cout << k << ": " << v << "\\n";

    // find: safe lookup — no insertion side effect
    auto it = inv.find("apple");
    if (it != inv.end()) cout << "found apple: " << it->second << "\\n";

    // operator[] creates the key if missing — use find to check
    cout << "apple missing? " << (inv.count("xyz") ? "yes" : "no") << "\\n";

    return 0;
}`;

const SET_CODE = `#include <iostream>
#include <set>
#include <unordered_map>
#include <string>
using namespace std;

// __OUTPUT__: set: 1 2 3 5 8\\nin set? yes\\nunordered: alice=95 bob=87

int main() {
    // set: unique sorted values — duplicates silently dropped
    set<int> s = {2, 3, 5, 2, 3, 8, 1};
    cout << "set: ";
    for (int x : s) cout << x << " ";
    cout << "\\nin set? " << (s.count(3) ? "yes" : "no") << "\\n";

    // unordered_map: hash table — O(1) average lookup vs O(log n) for map
    unordered_map<string, int> scores;
    scores["alice"] = 95;
    scores["bob"]   = 87;
    cout << "unordered: ";
    for (const auto& [n, sc] : scores) cout << n << "=" << sc << " ";
    cout << "\\n";

    return 0;
}`;

const QUEUE_CODE = `#include <iostream>
#include <queue>
#include <deque>
using namespace std;

// __OUTPUT__: FIFO: task1 task2 task3\\ndeque: 0 1 2 3 4

int main() {
    // queue: FIFO — front exits first
    queue<string> tasks;
    tasks.push("task1"); tasks.push("task2"); tasks.push("task3");
    cout << "FIFO: ";
    while (!tasks.empty()) {
        cout << tasks.front() << " ";
        tasks.pop();
    }
    cout << "\\n";

    // deque: O(1) push/pop at BOTH ends
    deque<int> dq;
    dq.push_back(2);  dq.push_back(3);  dq.push_back(4);
    dq.push_front(1); dq.push_front(0); // prepend
    cout << "deque: ";
    for (int x : dq) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const HEAP_CODE = `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// __OUTPUT__: max-heap: 42 17 5\\nmin-heap: 5 17 42

int main() {
    // priority_queue: max-heap by default
    priority_queue<int> maxHeap;
    maxHeap.push(5); maxHeap.push(42); maxHeap.push(17);
    cout << "max-heap: ";
    while (!maxHeap.empty()) { cout << maxHeap.top() << " "; maxHeap.pop(); }
    cout << "\\n";

    // min-heap: use greater<int> comparator
    priority_queue<int, vector<int>, greater<int>> minHeap;
    minHeap.push(5); minHeap.push(42); minHeap.push(17);
    cout << "min-heap: ";
    while (!minHeap.empty()) { cout << minHeap.top() << " "; minHeap.pop(); }
    cout << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-1-008",
  slug: "stl-containers",
  chapter: "cpp-1",
  order: 8,
  title: "STL Containers",
  subtitle: "map, set, unordered_map, queue, deque, priority_queue — choose the right structure",
  tags: ["c++", "cpp", "STL", "map", "set", "unordered_map", "queue", "priority_queue", "deque"],
  aliases: [
    "c++ map",
    "c++ set",
    "c++ unordered_map",
    "c++ queue",
    "c++ priority queue",
    "c++ deque",
    "c++ STL containers",
  ],

  hook: ``\`vector\`` covers most cases, but sometimes you need ordered lookup, uniqueness enforcement, FIFO processing, or priority-based scheduling. Each STL container has a specific performance contract. Knowing which to reach for — and why — is what separates developers who fight their data structures from ones who work with them.`,

  mentalModel: [
    "**`map<K,V>`: sorted key-value, O(log n).** Internally a red-black tree. Keys are always sorted — iteration gives alphabetical/numerical order. Use when you need sorted iteration or range queries. Warning: `map[key]` inserts a default-constructed value if the key is missing — use `.find()` to check without inserting.",
    "**`unordered_map<K,V>`: hash table, O(1) average.** No ordering guarantee, but 3-10× faster than `map` for large datasets. Use when you don't need sorted order and just want fast lookup by key.",
    "**`set<T>`: sorted unique values. `queue<T>`: FIFO. `priority_queue<T>`: max-heap.** Each enforces a specific access pattern — set for membership testing, queue for task processing, priority_queue for 'always give me the highest priority next'.",
  ],

  intuition: {
    prose: [
      "**`map` vs `unordered_map` — sorted vs fast.** Both map keys to values. `map` gives you sorted iteration but costs O(log n) per lookup. `unordered_map` gives O(1) average but iterates in an unpredictable hash order. Default: `unordered_map`. Use `map` when you need sorted keys.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**map — run it then explore:**\n\n- Try `inv[\"xyz\"]` — it inserts a 0-count entry! Check `inv.size()` before and after.\n- Use `inv.find(\"xyz\")` instead — does it insert? (No)\n- Add 10 more fruits and iterate — do they come out sorted?\n- `inv.erase(\"apple\")` — verify it's gone with `inv.count(\"apple\")`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MAP_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**set and unordered_map — run it then explore:**\n\n- Insert a duplicate into the set: `s.insert(3)`. Does the size change? (No)\n- Try `s.insert({4,6,7})` — bulk insert. Does order hold?\n- `unordered_map` has no guaranteed order — run multiple times. Does alice always come before bob?\n- Use `scores.count(\"alice\")` to check membership. What's the difference from `find`?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SET_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Queue and deque access patterns.** `queue` is a strict FIFO adapter — you can only access `front()` and `back()`. `deque` (double-ended queue) supports O(1) push/pop at both ends AND O(1) random access by index. Use `deque` when you need sliding-window access or BFS-style breadth-first processing.",
      "**Priority queue is a heap.** `priority_queue` pops elements in max-first order (largest first). For min-first order: `priority_queue<int, vector<int>, greater<int>>`. Use for scheduling (highest priority task first), Dijkstra's algorithm (shortest path), or any 'always next best' access pattern. Push and pop are O(log n).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**queue and deque — run it then explore:**\n\n- `queue` doesn't support random access — try `tasks[0]`. What error?\n- Change `deque` to `push_front` only — acts like a stack.\n- Use `deque` as a sliding window: push to back, pop from front to maintain size 3.\n- `deque` supports `dq[2]` — try it. `queue` doesn't.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": QUEUE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**priority_queue — run it then explore:**\n\n- Push the same value twice — does it appear twice when popping?\n- Change to a min-heap: `priority_queue<int, vector<int>, greater<int>>`.\n- Use a priority_queue to sort: push all elements, pop all — is it sorted?\n- Push `pair<int,string>` — which element has priority? (first field of pair)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": HEAP_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "map::operator[] inserts on missing key",
        body: "`inventory[\"missing\"]` creates a new entry with a default value (0 for int) and returns a reference to it. This silently modifies the map. Use `inventory.find(\"missing\") != inventory.end()` or `inventory.count(\"missing\")` to check without inserting.",
      },
      {
        type: "info",
        title: "Container selection cheat sheet",
        body: "**vector**: default ordered collection. **unordered_map**: fast key→value lookup. **map**: sorted key→value or range queries. **set**: unique membership, sorted. **unordered_set**: unique membership, fast. **queue**: FIFO task processing. **priority_queue**: always-next-best (heap). **deque**: O(1) push/pop at both ends.",
      },
    ],
  },

  examples: [
    {
      title: "Word frequency with unordered_map",
      body: `string text = "the cat sat on the mat the cat";
unordered_map<string, int> freq;
stringstream ss(text);
string word;
while (ss >> word) freq[word]++;

for (const auto& [w, c] : freq)
    cout << w << ": " << c << "\\n";
// cat: 2, the: 3, sat: 1, ...`,
    },
    {
      title: "Top-K elements with priority_queue",
      body: `vector<int> data = {5, 3, 8, 1, 9, 2, 7, 4, 6};
int k = 3;

// Min-heap of size k: keeps k largest
priority_queue<int, vector<int>, greater<int>> pq;
for (int x : data) {
    pq.push(x);
    if ((int)pq.size() > k) pq.pop();   // evict smallest
}

cout << "Top " << k << ": ";
while (!pq.empty()) { cout << pq.top() << " "; pq.pop(); }
// 7 8 9 (in min-heap order — reverse of arrival)`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Word frequency counter using `map<string,int>`. Read a string of words, count each, then print in alphabetical order. Also print the most frequent word. Bonus: use `unordered_map` instead — is the output still alphabetical?",
      hint: "`map` iterates in sorted key order. For most frequent: iterate and track the max count.",
      walkthrough: [
        "map<string,int> freq; stringstream ss(text); string w; while(ss>>w) freq[w]++;",
        "for (auto& [w,c] : freq) cout << w << \": \" << c;",
        "Max: iterate and track pair with highest value",
        "With unordered_map: same logic, but output order is undefined",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a priority task queue. Each task has a `string name` and `int priority`. Use `priority_queue<pair<int,string>>` where higher int = higher priority. Write `addTask(priority, name)` and `processNext()` which prints and removes the highest-priority task. Test with 5 tasks of mixed priorities.",
      hint: "`pair<int,string>` compares by first element (priority) first. Max-heap gives highest priority first. `pq.top().second` is the task name.",
      walkthrough: [
        "priority_queue<pair<int,string>> pq;",
        "addTask: pq.push({priority, name});",
        "processNext: if empty return; cout << pq.top().second; pq.pop();",
        "Test: add 5 tasks with priorities 1,5,3,2,4; process all",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-008-q1",
        type: "choice",
        text: "What does `inventory[\"missing_key\"]` do on a `map<string,int>`?",
        options: [
          "Returns 0 without modifying the map",
          "Throws an exception",
          "Inserts a new entry with value 0 and returns a reference to it",
          "Returns end() iterator",
        ],
        answer: 2,
        explanation:
          "`map::operator[]` inserts a default-constructed value if the key doesn't exist. For `int`, that's 0. The map is modified. Use `.find()` or `.count()` to check without inserting.",
      },
      {
        id: "cpp1-008-q2",
        type: "choice",
        text: "What is the time complexity difference between `map` and `unordered_map` for lookup?",
        options: [
          "Both are O(1)",
          "map is O(log n); unordered_map is O(1) average",
          "Both are O(log n)",
          "map is O(1); unordered_map is O(n) worst case",
        ],
        answer: 1,
        explanation:
          "`map` is a red-black tree: O(log n) for insert, find, erase. `unordered_map` is a hash table: O(1) average, O(n) worst case (hash collisions). For most use cases, `unordered_map` is 3-10x faster.",
      },
      {
        id: "cpp1-008-q3",
        type: "choice",
        text: "What does `priority_queue<int>` pop first?",
        options: [
          "The smallest element (min-heap)",
          "The first element inserted (FIFO)",
          "The largest element (max-heap by default)",
          "A random element",
        ],
        answer: 2,
        explanation:
          "`priority_queue` is a max-heap by default — `.top()` and `.pop()` give the largest element. For a min-heap: `priority_queue<int, vector<int>, greater<int>>`.",
      },
      {
        id: "cpp1-008-q4",
        type: "choice",
        text: "What makes `set<T>` different from `vector<T>` with duplicates removed?",
        options: [
          "set is faster for all operations",
          "set automatically maintains sorted order and enforces uniqueness with O(log n) insert/find",
          "set supports random access by index",
          "set uses less memory",
        ],
        answer: 1,
        explanation:
          "`set` maintains sorted order (red-black tree) and enforces uniqueness at insertion time — duplicates are silently ignored. O(log n) insert and find. `vector` requires manual deduplication and sorting. Use `unordered_set` for O(1) membership without ordering.",
      },
    ],
  },
};

export default lesson;
