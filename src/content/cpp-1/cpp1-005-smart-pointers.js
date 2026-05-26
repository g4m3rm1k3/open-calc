const SMART_PTR_CODE = `#include <iostream>
#include <memory>
#include <string>
#include <vector>
using namespace std;

class Resource {
    string name;
public:
    Resource(const string& n) : name(n) {
        cout << "  [" << name << "] acquired" << endl;
    }
    ~Resource() {
        cout << "  [" << name << "] released" << endl;
    }
    void use() const { cout << "  Using " << name << endl; }
    string getName() const { return name; }
};

// __OUTPUT__: --- unique_ptr: exclusive ownership ---\\n  [Database] acquired\\n  Using Database\\n  [File] acquired\\n  Transferred to ptr2\\n  [File] released\\n  [Database] released\\n--- shared_ptr: shared ownership ---\\n  [Config] acquired\\n  ref count: 2\\n  ref count: 1\\n  [Config] released\\n--- weak_ptr: non-owning observation ---\\n  [Cache] acquired\\nweak still valid, cache: Cache\\n  [Cache] released\\nweak expired — resource was freed\\n--- make_unique factory ---\\n  [Widget] acquired\\n  [Widget] released

int main() {
    // ── unique_ptr: single owner ───────────────────────────────
    cout << "--- unique_ptr: exclusive ownership ---" << endl;
    {
        auto db = make_unique<Resource>("Database");
        db->use();

        auto file = make_unique<Resource>("File");
        auto file2 = move(file);    // transfer ownership (file is now null)
        cout << "  Transferred to ptr2" << endl;
        // file is nullptr; file2 owns the resource
    }  // db and file2 destroyed here

    // ── shared_ptr: multiple owners ────────────────────────────
    cout << "--- shared_ptr: shared ownership ---" << endl;
    {
        auto cfg = make_shared<Resource>("Config");
        cout << "  ref count: " << cfg.use_count() << endl;
        {
            auto cfg2 = cfg;   // copy increases ref count
            cout << "  ref count: " << cfg.use_count() << endl;
        }  // cfg2 destroyed; count goes back to 1
        cout << "  ref count: " << cfg.use_count() << endl;
    }  // last owner destroys: resource released

    // ── weak_ptr: non-owning observer ─────────────────────────
    cout << "--- weak_ptr: non-owning observation ---" << endl;
    weak_ptr<Resource> weak;
    {
        auto cache = make_shared<Resource>("Cache");
        weak = cache;  // observe without owning
        if (auto locked = weak.lock()) {
            cout << "weak still valid, cache: " << locked->getName() << endl;
        }
    }  // cache destroyed; weak doesn't prevent destruction
    if (weak.expired())
        cout << "weak expired — resource was freed" << endl;

    // ── make_unique for exception safety ──────────────────────
    cout << "--- make_unique factory ---" << endl;
    auto w = make_unique<Resource>("Widget");
    // Automatically freed when w goes out of scope

    return 0;
}`;

const lesson = {
  id: "cpp-1-005",
  slug: "smart-pointers",
  chapter: "cpp-1",
  order: 5,
  title: "Smart Pointers and Memory Management",
  subtitle: "Use unique_ptr, shared_ptr, and weak_ptr to manage heap memory safely",
  tags: ["c++", "cpp", "smart-pointers", "unique_ptr", "shared_ptr", "weak_ptr", "RAII", "memory-management"],
  aliases: [
    "c++ smart pointers",
    "c++ unique_ptr",
    "c++ shared_ptr",
    "c++ memory management",
    "c++ new delete",
  ],

  hook: `Raw \`new\` and \`delete\` are the biggest source of bugs in C++: leaks (forgot to delete), double-frees (deleted twice), dangling pointers (pointer used after delete). Smart pointers solve all three by applying RAII to heap memory. In modern C++, you almost never write \`new\` and \`delete\` directly — you use \`make_unique\` and \`make_shared\`. The result: memory-safe code with zero garbage-collection overhead.`,

  mentalModel: [
    "**`unique_ptr<T>`: one owner, automatic cleanup.** A `unique_ptr` owns its resource exclusively — it can't be copied, only moved. When it goes out of scope, it `delete`s the pointed-to object. Use it for 'this resource belongs to exactly one thing'. It's a zero-overhead abstraction: a `unique_ptr` is exactly the size of a raw pointer, with no extra indirection.",
    "**`shared_ptr<T>`: shared ownership via reference counting.** Multiple `shared_ptr`s can own the same object. The object is destroyed when the last `shared_ptr` is destroyed (ref count drops to 0). The count is maintained atomically (thread-safe). Use it when ownership is genuinely shared — when multiple objects need to keep a resource alive. It has overhead: one extra heap allocation for the control block.",
    "**`weak_ptr<T>`: observe without owning.** A `weak_ptr` can observe a `shared_ptr`-managed object without keeping it alive. It doesn't affect the ref count. Use `weak.lock()` to get a temporary `shared_ptr` — it returns `nullptr` if the object was already destroyed. Crucial for breaking `shared_ptr` cycles (which would otherwise cause memory leaks).",
  ],

  intuition: {
    prose: [
      "**Why `make_unique` over `new`?** `new Resource(...)` returns a raw pointer — if you then pass it to a function and that function throws before you store it in a `unique_ptr`, you have a leak. `make_unique<Resource>(...)` constructs the object and wraps it in a unique_ptr atomically — no intermediate raw pointer, no leak window. Always use `make_unique` and `make_shared`.",
      "**`unique_ptr` transfer of ownership.** You can't copy a `unique_ptr` (`auto p2 = p1` is a compile error — ownership can't be duplicated). You CAN move it: `auto p2 = move(p1)` — ownership transfers to `p2`, and `p1` becomes `nullptr`. This is how `unique_ptr` prevents accidental sharing while still allowing transfer. Pass `unique_ptr` by value to functions that take ownership; pass by `const unique_ptr<T>&` to functions that only use the resource.",
      "**Circular `shared_ptr` references cause leaks.** If `A` holds a `shared_ptr<B>` and `B` holds a `shared_ptr<A>`, neither's ref count ever reaches zero — both leak. Break the cycle: one of them should hold a `weak_ptr`. The 'parent holds shared_ptr to child, child holds weak_ptr to parent' pattern is standard for tree/graph structures.",
      "**When to use which.** Default to `unique_ptr` — it's zero overhead and expresses exclusive ownership clearly. Use `shared_ptr` only when you genuinely need shared ownership. Use `weak_ptr` to observe shared objects without affecting their lifetime (caching, back-references, event observers). Use raw pointers only for non-owning references (the object's lifetime is guaranteed to outlive the use): `const T*` or `T*` for 'borrow, don't own'.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Trace ownership and lifetimes:**\n\n1. Compile and run — observe acquisition/release order for unique_ptr vs shared_ptr\n2. Try `auto p2 = p1;` with unique_ptr — what error do you get? Why?\n3. Move p1 into a function: `void take(unique_ptr<Resource> r) { r->use(); }` — resource freed when function returns\n4. Create a shared_ptr cycle and check for leaks: A holds shared_ptr<B>, B holds shared_ptr<A>\n5. Break the cycle by changing one to weak_ptr — observe that resource is now freed\n6. Try `shared_ptr<int> p = make_shared<int>(42); cout << *p;` — dereferencing works like raw pointer",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": SMART_PTR_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`shared_ptr` control block.** `make_shared<T>(args)` makes a single allocation for both the T object and the control block (ref count + weak count). Two-step construction (`shared_ptr<T>(new T(args))`) makes two allocations. This is why `make_shared` is preferred: better performance and a smaller total allocation. The control block persists as long as any `weak_ptr` references it — even after the strong count reaches 0.",
      "**Custom deleters.** Smart pointers accept custom deleters for non-memory resources: `unique_ptr<FILE, decltype(&fclose)>(fopen(...), fclose)` — when the unique_ptr destructs, it calls `fclose` instead of `delete`. Similarly for `SDL_Surface`, database handles, GPU textures. This is how the 'RAII for everything' pattern works with C library resources that use non-delete cleanup.",
      "**`std::enable_shared_from_this`.** If an object managed by a `shared_ptr` needs to hand out `shared_ptr`s to itself (e.g., in a callback), it can inherit from `enable_shared_from_this<T>` and call `shared_from_this()`. Calling `shared_from_this()` on an object NOT currently managed by a `shared_ptr` is undefined behavior. This is an advanced pattern but essential for objects that register themselves as observers.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never create two separate shared_ptr owning the same raw pointer",
        body: "`shared_ptr<T> p1(raw); shared_ptr<T> p2(raw);` — two separate control blocks, each with ref count 1. Both will try to delete the object. Double-free, undefined behavior. Always use `make_shared` or copy a single `shared_ptr`: `shared_ptr<T> p2 = p1`.",
      },
      {
        type: "info",
        title: "unique_ptr is zero overhead",
        body: "`sizeof(unique_ptr<T>)` equals `sizeof(T*)` — 8 bytes on 64-bit. No ref count, no control block. Its `get()` method returns the raw pointer in O(1). Using `unique_ptr` is literally as fast as using a raw pointer — the only overhead is the destructor call (which would be needed anyway).",
      },
      {
        type: "tip",
        title: "Ownership vocabulary",
        body: "Use these to communicate ownership in code reviews and docs: `unique_ptr` = owns exclusively. `shared_ptr` = owns jointly. `weak_ptr` = observes only (doesn't own). Raw pointer `T*` = borrows (doesn't own, lifetime guaranteed by caller). Raw reference `T&` = borrows (non-null, lifetime guaranteed by caller). Being explicit about ownership prevents entire classes of bugs.",
      },
    ],
  },

  examples: [
    {
      title: "Factory pattern with unique_ptr",
      body: `class Shape { public: virtual ~Shape() {} virtual double area() const = 0; };
class Circle   : public Shape { double r; public: Circle(double r):r(r){} double area() const override { return 3.14*r*r; } };
class Rectangle: public Shape { double w,h; public: Rectangle(double w,double h):w(w),h(h){} double area() const override { return w*h; } };

// Factory: caller owns the result via unique_ptr
unique_ptr<Shape> makeShape(const string& type, double a, double b = 0) {
    if (type == "circle")    return make_unique<Circle>(a);
    if (type == "rectangle") return make_unique<Rectangle>(a, b);
    return nullptr;  // unknown type
}

auto s1 = makeShape("circle", 5.0);
auto s2 = makeShape("rectangle", 3.0, 4.0);
if (s1) cout << s1->area() << endl;   // 78.5
if (s2) cout << s2->area() << endl;   // 12.0`,
    },
    {
      title: "shared_ptr for shared cache",
      body: `class CachedData {
    vector<int> data;
    string key;
public:
    CachedData(string k, vector<int> d) : key(k), data(move(d)) {}
    const vector<int>& get() const { return data; }
    ~CachedData() { cout << "Cache " << key << " freed" << endl; }
};

map<string, shared_ptr<CachedData>> cache;

shared_ptr<CachedData> getOrLoad(const string& key) {
    auto it = cache.find(key);
    if (it != cache.end()) return it->second;
    // Simulate loading
    auto data = make_shared<CachedData>(key, vector<int>{1,2,3,4,5});
    cache[key] = data;
    return data;
}

// Multiple callers share the same data — no copies
auto d1 = getOrLoad("dataset_A");
auto d2 = getOrLoad("dataset_A");
cout << d1.use_count() << endl;  // 3 (cache + d1 + d2)`,
    },
    {
      title: "Breaking shared_ptr cycles with weak_ptr",
      body: `struct Node {
    int value;
    shared_ptr<Node> next;      // strong — owns next
    weak_ptr<Node>   prev;      // weak — observes prev, doesn't own

    Node(int v) : value(v) {}
    ~Node() { cout << "Node " << value << " destroyed" << endl; }
};

// Doubly-linked list nodes without cycle leaks
auto n1 = make_shared<Node>(1);
auto n2 = make_shared<Node>(2);
auto n3 = make_shared<Node>(3);

n1->next = n2;  n2->prev = n1;
n2->next = n3;  n3->prev = n2;
// When n1, n2, n3 go out of scope, all are properly freed
// (If prev were shared_ptr, n1-n2 would form a cycle and leak)`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Build a simple observer pattern. `EventSystem` holds a `vector<weak_ptr<Listener>>`. `Listener` is a class with `virtual void onEvent(string)`. `EventSystem::subscribe(shared_ptr<Listener>)` adds a weak_ptr. `EventSystem::broadcast(string)` iterates listeners — uses `lock()` to get a shared_ptr, calls `onEvent`, removes expired ones. Test: create two listeners, broadcast, destroy one, broadcast again.",
      hint: "In broadcast: `if (auto sp = weak.lock()) sp->onEvent(msg); else markExpired`. Erase expired: remove_if with lock() == nullptr.",
      walkthrough: [
        "Listener base class with virtual onEvent",
        "EventSystem holds vector<weak_ptr<Listener>>",
        "subscribe: push weak_ptr from argument",
        "broadcast: for each weak, lock(); if valid call onEvent; erase expired",
        "Test: create 2 listeners, broadcast, let one go out of scope, broadcast again",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "RAII file writer. Create a class `SafeFile` that wraps `unique_ptr<FILE, decltype(&fclose)>`. Constructor takes a filename and mode, uses `fopen`. Destructor is automatic (unique_ptr handles fclose). Provide `write(string)` and `isOpen()`. In main, write several lines to a temp file, then verify by reading it back with `cat`.",
      hint: "Constructor: `file(fopen(name, mode), fclose)` where file is `unique_ptr<FILE, decltype(&fclose)>`. isOpen: return file != nullptr.",
      walkthrough: [
        "Member: unique_ptr<FILE, decltype(&fclose)> fp;",
        "Constructor: fp(fopen(name, mode), fclose)",
        "isOpen: return fp != nullptr",
        "write: fprintf(fp.get(), \"%s\", s.c_str())",
        "In main: SafeFile f(\"test.txt\", \"w\"); f.write(\"line 1\n\"); // fclose automatic",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-005-q1",
        type: "choice",
        text: "What is the main advantage of `make_unique` over `new` followed by storing in a `unique_ptr`?",
        options: [
          "make_unique is faster because it avoids vtable lookups",
          "make_unique is exception-safe — no raw pointer is ever exposed, preventing leaks if construction throws",
          "make_unique allows shared ownership",
          "make_unique works with arrays but new doesn't",
        ],
        answer: 1,
        explanation:
          "`make_unique<T>(args)` constructs T and wraps it atomically. `unique_ptr<T>(new T(args))` exposes a raw pointer momentarily — if something between `new` and the `unique_ptr` constructor throws, you leak. `make_unique` has no such window. It's also shorter to write.",
      },
      {
        id: "cpp1-005-q2",
        type: "choice",
        text: "Can you copy a `unique_ptr`?",
        options: [
          "Yes — the copy shares ownership",
          "Yes — the copy increments a reference count",
          "No — unique_ptr is move-only; use `std::move` to transfer ownership",
          "Yes, but only by dereferencing first",
        ],
        answer: 2,
        explanation:
          "`unique_ptr` has a deleted copy constructor — copying is a compile error. You can only move it (`auto p2 = std::move(p1)`), transferring ownership. After the move, `p1` is null. This enforces the 'exactly one owner' invariant.",
      },
      {
        id: "cpp1-005-q3",
        type: "choice",
        text: "What problem does `weak_ptr` solve?",
        options: [
          "It makes shared_ptr faster by avoiding reference counting",
          "It allows non-owning observation of a shared_ptr-managed object, preventing reference cycle leaks",
          "It provides thread-safe access to the pointed-to object",
          "It converts raw pointers to managed ones",
        ],
        answer: 1,
        explanation:
          "`weak_ptr` observes a `shared_ptr`-managed object without contributing to the ref count. This breaks `shared_ptr` reference cycles (where A owns B and B owns A — neither ever reaches ref count 0). `weak_ptr::lock()` gives a temporary `shared_ptr` to safely access the object if it still exists.",
      },
      {
        id: "cpp1-005-q4",
        type: "choice",
        text: "When does a `shared_ptr`-managed object get destroyed?",
        options: [
          "When the first shared_ptr to it goes out of scope",
          "When any shared_ptr to it is reset",
          "When the last shared_ptr (not weak_ptr) to it is destroyed or reset",
          "At the end of the program",
        ],
        answer: 2,
        explanation:
          "The `shared_ptr` control block tracks the strong reference count. The object is destroyed when the strong count reaches 0 — i.e., when the last `shared_ptr` pointing to it is destroyed or reset. `weak_ptr`s don't count toward the strong count.",
      },
    ],
  },
};

export default lesson;
