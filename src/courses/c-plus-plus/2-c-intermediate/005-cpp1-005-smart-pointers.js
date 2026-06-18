const UNIQUE_CODE = `#include <iostream>
#include <memory>
using namespace std;

// __OUTPUT__: [DB] acquired\\nusing DB\\n[File] acquired\\ntransferred ownership\\n[File] released\\n[DB] released

struct Resource {
    string name;
    Resource(string n) : name(n) { cout << "[" << name << "] acquired\\n"; }
    ~Resource()                  { cout << "[" << name << "] released\\n"; }
    void use() const             { cout << "using " << name << "\\n"; }
};

int main() {
    auto db = make_unique<Resource>("DB");
    db->use();

    auto file  = make_unique<Resource>("File");
    auto file2 = move(file);             // transfer — file is now nullptr
    cout << "transferred ownership\\n";
    // file2 goes out of scope: releases File
    // db goes out of scope: releases DB
    return 0;
}`;

const SHARED_CODE = `#include <iostream>
#include <memory>
using namespace std;

// __OUTPUT__: [Config] acquired\\ncount=1\\ncount=2\\ncount=1\\n[Config] released

struct Config {
    Config()  { cout << "[Config] acquired\\n"; }
    ~Config() { cout << "[Config] released\\n"; }
};

int main() {
    auto cfg = make_shared<Config>();
    cout << "count=" << cfg.use_count() << "\\n";  // 1

    {
        auto cfg2 = cfg;      // shared ownership — ref count goes to 2
        cout << "count=" << cfg.use_count() << "\\n";  // 2
    }   // cfg2 destroyed, count back to 1

    cout << "count=" << cfg.use_count() << "\\n";  // 1
    // cfg destroyed — count 0 — Config released
    return 0;
}`;

const WEAK_CODE = `#include <iostream>
#include <memory>
using namespace std;

// __OUTPUT__: [Cache] acquired\\nstill alive: Cache\\n[Cache] released\\nexpired

struct Cache {
    string name;
    Cache(string n) : name(n) { cout << "[" << name << "] acquired\\n"; }
    ~Cache()                  { cout << "[" << name << "] released\\n"; }
};

int main() {
    weak_ptr<Cache> weak;

    {
        auto cache = make_shared<Cache>("Cache");
        weak = cache;   // observe without owning — ref count stays 1

        if (auto locked = weak.lock())    // get a temporary shared_ptr
            cout << "still alive: " << locked->name << "\\n";
    }   // cache destroyed — weak doesn't prevent it

    if (weak.expired())
        cout << "expired\\n";

    return 0;
}`;

const OWNER_CODE = `#include <iostream>
#include <memory>
#include <vector>
using namespace std;

// __OUTPUT__: Widget created\\nWidget used\\nWidget destroyed

struct Widget {
    Widget()  { cout << "Widget created\\n";  }
    ~Widget() { cout << "Widget destroyed\\n"; }
    void use(){ cout << "Widget used\\n"; }
};

// Function that borrows — takes raw pointer (doesn't own)
void borrow(const Widget* w) { w->use(); }

// Function that takes shared ownership
void share(shared_ptr<Widget> w) { w->use(); }

int main() {
    auto w = make_unique<Widget>();
    borrow(w.get());   // pass raw pointer — no ownership transfer
    // w is still the owner
    return 0;
}`;

const lesson = {
  id: "cpp-1-005",
  slug: "smart-pointers",
  chapter: "cpp-1",
  order: 5,
  title: "Smart Pointers",
  subtitle:
    "unique_ptr, shared_ptr, weak_ptr — automatic, safe memory management",
  tags: [
    "c++",
    "cpp",
    "smart-pointers",
    "unique_ptr",
    "shared_ptr",
    "weak_ptr",
    "RAII",
    "memory",
  ],
  aliases: [
    "c++ smart pointers",
    "c++ unique_ptr",
    "c++ shared_ptr",
    "c++ memory management",
    "c++ new delete",
  ],

  hook: `Raw \`new\` and \`delete\` are the biggest source of C++ bugs: leaks (forgot delete), double-frees, dangling pointers. Smart pointers apply RAII to heap memory — they delete automatically when they go out of scope. In modern C++, you almost never write \`new\` and \`delete\` directly.`,

  mentalModel: [
    "**`unique_ptr`: one owner, automatic cleanup.** Cannot be copied — only moved. When it goes out of scope, it deletes the object. Zero overhead vs a raw pointer. Default choice for heap allocation.",
    "**`shared_ptr`: shared ownership via reference counting.** Multiple `shared_ptr`s can own the same object. The object is deleted when the last one is destroyed (ref count → 0). Has overhead: one extra heap allocation for the control block. Use when ownership is genuinely shared.",
    "**`weak_ptr`: observe without owning.** Doesn't prevent the object from being destroyed. Use `weak.lock()` to get a temporary `shared_ptr` — returns `nullptr` if the object is gone. Essential for breaking `shared_ptr` cycles.",
  ],

  intuition: {
    prose: [
      "**`unique_ptr` is the default.** It's exactly the size of a raw pointer, with no extra runtime cost. `make_unique<T>(args)` constructs the object on the heap and returns a `unique_ptr`. When the `unique_ptr` goes out of scope — or when you `move` it elsewhere — the object is automatically deleted.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          '**unique_ptr — run it then explore:**\n\n- Try `auto file3 = file;` after the move — compile error (unique_ptr can\'t be copied).\n- `file.get()` returns the raw pointer after the move — what is it? (nullptr)\n- Add `if (file) cout << "file valid";` — implicit bool conversion checks for nullptr.\n- Return a unique_ptr from a function: `auto make_db() { return make_unique<Resource>("DB"); }`',
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": UNIQUE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          "**shared_ptr and ref counting — run it then explore:**\n\n- Add a third `shared_ptr<Config> cfg3 = cfg` inside a nested scope. When does the count drop?\n- Pass `cfg` to a function `void f(shared_ptr<Config> c)` — what does the count become inside f?\n- Try `shared_ptr<Config> cfg4 = move(cfg)` — does cfg's count drop?\n- What's the count just before the Config is released?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SHARED_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`weak_ptr` breaks cycles.** If two objects hold `shared_ptr`s to each other, their ref counts never reach zero — a memory leak. Solution: one direction is a `shared_ptr`, the other is a `weak_ptr`. The `weak_ptr` doesn't keep the object alive. Common case: parent holds `shared_ptr<Child>`, child holds `weak_ptr<Parent>` back.",
      "**Ownership semantics.** `unique_ptr` = exclusive ownership. `shared_ptr` = shared ownership. Raw pointer = borrowing (non-owning). When a function just needs to use an object but doesn't own it, take a raw pointer (`Widget*`) or reference (`Widget&`) — calling `.get()` on a `unique_ptr` yields the raw pointer. Never store raw pointers obtained from smart pointers — they become dangling when the smart pointer is destroyed.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**weak_ptr — run it then explore:**\n\n- Assign `weak = nullptr` before the scope ends — does that release the Cache early? (No — weak doesn't own it)\n- Try `weak.lock()` after the cache is destroyed — returns nullptr.\n- Add a second `shared_ptr<Cache> cache2 = cache` — does the weak still expire when cache goes out of scope? (No — cache2 still owns it)\n- What's the use_count of a weak_ptr? (weak.use_count() counts strong owners only)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": WEAK_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge:
          "**Ownership patterns — run it then explore:**\n\n- Change `borrow(const Widget* w)` to take `Widget&` — often cleaner for non-null borrowing.\n- Try `unique_ptr<Widget> w2 = move(w)` before borrow — does borrow crash? (no, but w is null after)\n- Add `share(shared_ptr<Widget>)` and call it with `make_shared<Widget>()` — count inside?\n- Demonstrate ownership transfer: `return make_unique<Widget>()` from a factory function.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": OWNER_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "tip",
        title: "Prefer unique_ptr by default",
        body: "`unique_ptr` has zero overhead over raw pointers. Use it unless you actually need shared ownership. `shared_ptr` costs one extra heap allocation and atomic reference counting. Don't reach for `shared_ptr` just because you're unsure about ownership — figure out who owns the object.",
      },
      {
        type: "warning",
        title: "Never store raw pointers from smart pointers long-term",
        body: "`w.get()` gives you the raw pointer for passing to functions that borrow it — that's fine. But don't store it in a struct or return it from a function. If the `unique_ptr` or `shared_ptr` is destroyed, your stored raw pointer becomes dangling.",
      },
    ],
  },

  examples: [
    {
      title: "shared_ptr cycle and how to break it with weak_ptr",
      body: `struct Child;
struct Parent {
    shared_ptr<Child> child;
    ~Parent() { cout << "Parent destroyed\\n"; }
};

struct Child {
    weak_ptr<Parent> parent;   // weak_ptr — doesn't prevent Parent destruction
    ~Child()  { cout << "Child destroyed\\n"; }
};

auto p = make_shared<Parent>();
auto c = make_shared<Child>();
p->child = c;
c->parent = p;   // weak_ptr — no cycle
// Both are destroyed when p and c go out of scope`,
    },
    {
      title: "Factory returning unique_ptr",
      body: `class Connection {
    string url;
public:
    Connection(string u) : url(u) { cout << "Connected to " << url << "\\n"; }
    ~Connection() { cout << "Disconnected\\n"; }
    void query() const { cout << "Querying " << url << "\\n"; }
};

unique_ptr<Connection> connect(const string& url) {
    return make_unique<Connection>(url);  // move-constructed on return
}

auto conn = connect("db://localhost");
conn->query();
// conn destroyed at end of scope — disconnects automatically`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Demonstrate the memory leak that raw `new` can cause, then fix it with `unique_ptr`. Create a `Resource` class that prints on construction and destruction. Allocate with `new` in a function, then throw an exception before `delete`. The destructor never runs. Rewrite using `make_unique` — the destructor runs even with the exception.",
      hint: 'Without smart pointer: `Resource* r = new Resource(); throw runtime_error("oops");` — r is leaked. With unique_ptr: `auto r = make_unique<Resource>();` — destructor runs during stack unwinding.',
      walkthrough: [
        "Raw version: new Resource, throw — destructor never called, memory leaked",
        "Smart version: make_unique<Resource>, throw — ~Resource called during stack unwind",
        "Catch the exception in main and verify the destructor ran",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a `Cache<K, V>` class using `unordered_map<K, weak_ptr<V>>`. `get(key)` returns a `shared_ptr<V>` if the entry is still alive (lock succeeds), otherwise removes the stale entry and returns nullptr. `insert(key, shared_ptr<V>)` stores a weak_ptr. Demonstrate: insert an entry, retrieve it, then let the original shared_ptr expire, then try to retrieve again.",
      hint: "`unordered_map<K, weak_ptr<V>> cache;`. In get: `auto it = cache.find(key); if (it != end) { if (auto sp = it->second.lock()) return sp; else cache.erase(it); }`",
      walkthrough: [
        "unordered_map<K, weak_ptr<V>> cache;",
        "insert: cache[key] = value; (stores weak_ptr from shared_ptr)",
        "get: find key; lock weak_ptr; if null, erase and return nullptr; else return locked",
        "Test: insert, get (valid), let original expire, get again (nullptr)",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-005-q1",
        type: "choice",
        text: "What happens when a `unique_ptr` goes out of scope?",
        options: [
          "Nothing — the programmer must explicitly call delete",
          "The pointed-to object is automatically deleted",
          "The pointer is set to nullptr but the object remains",
          "The object is moved to global scope",
        ],
        answer: 1,
        explanation:
          "`unique_ptr` applies RAII: its destructor calls `delete` on the owned pointer. This happens when the `unique_ptr` goes out of scope, is reassigned, or is explicitly reset — always, including during exception unwinding.",
      },
      {
        id: "cpp1-005-q2",
        type: "choice",
        text: "When is the object managed by a `shared_ptr` destroyed?",
        options: [
          "When the first `shared_ptr` owning it goes out of scope",
          "When all `shared_ptr`s owning it are destroyed (ref count reaches 0)",
          "When you explicitly call `.reset()` on any owner",
          "When `weak_ptr` observers expire",
        ],
        answer: 1,
        explanation:
          "`shared_ptr` uses reference counting. The object is destroyed when the last `shared_ptr` owning it is destroyed, moved from, or reset — bringing the ref count to zero. `weak_ptr` observers don't count toward the ref count.",
      },
      {
        id: "cpp1-005-q3",
        type: "choice",
        text: "What does `weak_ptr::lock()` return if the managed object has been destroyed?",
        options: [
          "A dangling shared_ptr to freed memory",
          "nullptr (as a shared_ptr)",
          "Throws an exception",
          "A shared_ptr with ref count 0",
        ],
        answer: 1,
        explanation:
          "If the managed object is gone (all `shared_ptr` owners released it), `lock()` returns an empty `shared_ptr` (equivalent to `nullptr`). Always check `if (auto sp = weak.lock())` before using the result.",
      },
      {
        id: "cpp1-005-q4",
        type: "choice",
        text: "Why use `weak_ptr` instead of a raw pointer to break shared_ptr cycles?",
        options: [
          "weak_ptr is faster than raw pointers",
          "weak_ptr can detect if the object is still alive; raw pointers become dangling silently",
          "Raw pointers can't point to shared_ptr-managed objects",
          "weak_ptr automatically deletes the object when it expires",
        ],
        answer: 1,
        explanation:
          "`weak_ptr` integrates with the `shared_ptr` ref counting machinery — `lock()` safely returns nullptr if the object is gone. A raw pointer would become dangling when the `shared_ptr` is destroyed, and there's no way to detect this without additional bookkeeping.",
      },
    ],
  },
};

export default lesson;
