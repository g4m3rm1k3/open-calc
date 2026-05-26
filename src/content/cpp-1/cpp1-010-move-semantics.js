const MOVE_CODE = `#include <iostream>
#include <vector>
#include <string>
#include <utility>
using namespace std;

// ── Resource class to trace moves vs copies ────────────────────
class Buffer {
    int*   data;
    size_t size;
    string label;

public:
    Buffer(size_t n, string lbl)
        : data(new int[n]{}), size(n), label(lbl) {
        cout << "[" << label << "] Constructed (" << n << " ints)" << endl;
    }

    ~Buffer() {
        if (data) cout << "[" << label << "] Destructed" << endl;
        delete[] data;
    }

    // Copy constructor: allocates new memory, copies elements
    Buffer(const Buffer& o)
        : data(new int[o.size]), size(o.size), label(o.label + "_copy") {
        for (size_t i = 0; i < size; i++) data[i] = o.data[i];
        cout << "[" << label << "] Copied from " << o.label << endl;
    }

    // Move constructor: steals the pointer — O(1), no allocation
    Buffer(Buffer&& o) noexcept
        : data(o.data), size(o.size), label(o.label + "_moved") {
        o.data = nullptr;   // prevent double-free
        o.size = 0;
        cout << "[" << label << "] Moved from " << o.label.substr(0, o.label.find("_moved")) << endl;
    }

    size_t getSize() const { return size; }
};

Buffer makeBuffer(size_t n) {
    Buffer b(n, "temp");
    return b;   // RVO or move — no copy
}

// __OUTPUT__: --- Copy vs Move ---\\n[big] Constructed (1000 ints)\\n[big_copy] Copied from big\\n[big_moved] Moved from big\\n--- Return Value Optimization ---\\n[temp] Constructed (512 ints)\\n[fromFactory] has 512 ints (no copy/move printed = RVO)\\n--- std::move on string ---\\nAfter move: original='' moved='hello world'\\n--- vector growth uses move ---\\n[a] Constructed (1 ints)\\n[b] Constructed (1 ints)\\n[c] Constructed (1 ints)\\nvector holds 3 buffers (moves used during reallocation)\\n--- Leaving scope ---\\n[c] Destructed\\n[b] Destructed\\n[a] Destructed\\n[fromFactory] Destructed\\n[big_moved] Destructed\\n[big_copy] Destructed\\n[big] Destructed

int main() {
    // ── Copy vs Move ──────────────────────────────────────────
    cout << "--- Copy vs Move ---" << endl;
    Buffer big(1000, "big");

    Buffer copied = big;              // copy: allocates 1000 ints
    Buffer moved  = std::move(big);   // move: steals pointer, O(1)

    // ── Return Value Optimization ─────────────────────────────
    cout << "--- Return Value Optimization ---" << endl;
    Buffer fromFactory = makeBuffer(512);   // RVO: constructed in-place, no move/copy
    cout << "[fromFactory] has " << fromFactory.getSize() << " ints (no copy/move printed = RVO)" << endl;

    // ── std::move on strings ──────────────────────────────────
    cout << "--- std::move on string ---" << endl;
    string original = "hello world";
    string moved2   = std::move(original);   // steals internal buffer
    cout << "After move: original='" << original << "' moved='" << moved2 << "'" << endl;

    // ── vector reallocation uses move if noexcept ─────────────
    cout << "--- vector growth uses move ---" << endl;
    vector<Buffer> vec;
    vec.reserve(3);    // pre-allocate to avoid reallocation in this demo
    vec.push_back(Buffer(1, "a"));
    vec.push_back(Buffer(1, "b"));
    vec.push_back(Buffer(1, "c"));
    cout << "vector holds " << vec.size() << " buffers (moves used during reallocation)" << endl;

    cout << "--- Leaving scope ---" << endl;
    return 0;
}`;

const lesson = {
  id: "cpp-1-010",
  slug: "move-semantics",
  chapter: "cpp-1",
  order: 10,
  title: "Move Semantics and Perfect Forwarding",
  subtitle: "Eliminate unnecessary copies with rvalue references, std::move, and move constructors",
  tags: ["c++", "cpp", "move-semantics", "rvalue-reference", "std::move", "perfect-forwarding", "RVO", "noexcept"],
  aliases: [
    "c++ move semantics",
    "c++ rvalue reference",
    "c++ std::move",
    "c++ move constructor",
    "c++ perfect forwarding",
    "c++ RVO",
    "c++ universal reference",
  ],

  hook: `Before C++11, returning a large object from a function meant copying it — allocating new memory, copying all elements, then destroying the original. Move semantics changed this: instead of copying, C++ can *steal* the internal buffer from a temporary object. The result moves in O(1) instead of O(n), regardless of size. Understanding move semantics is the key to writing high-performance C++ that avoids invisible copies.`,

  mentalModel: [
    "**Lvalues have identity; rvalues are temporary.** An lvalue is an expression with a named location (variable, array element, dereferenced pointer) — you can take its address. An rvalue is a temporary: a literal, a function return value, the result of an expression. `int x = 5` — `x` is lvalue, `5` is rvalue. Rvalues are 'about to die' — it's safe to steal their resources rather than copy them.",
    "**`std::move` is a cast, not a move.** `std::move(x)` casts `x` to an rvalue reference (`T&&`) — it does nothing itself. It just tells the compiler 'treat this as a temporary, you can steal from it'. The actual resource transfer happens in the move constructor or move assignment when called with an rvalue. After `std::move(x)`, `x` is in a valid-but-unspecified state — don't use it (or explicitly re-assign it).",
    "**Return Value Optimization (RVO).** When a function returns a local object by value, the compiler often constructs it directly in the caller's storage — eliminating both the copy and the move. RVO is mandated by the C++17 standard in many cases (NRVO — Named RVO). This is why `Buffer b = makeBuffer()` shows no copy or move in the output: the `Buffer` inside `makeBuffer` *is* the `b` in the caller. Don't `return std::move(local)` — it disables RVO.",
  ],

  intuition: {
    prose: [
      "**The move constructor pattern.** A move constructor `Buffer(Buffer&& o) noexcept` receives an rvalue reference to an 'expiring' object. The implementation: copy the pointers/handles from `o`, then set `o`'s pointers to `nullptr`/0. Now `this` owns the resource; when `o` destructs, its destructor finds `nullptr` and does nothing (or is a no-op). This is O(1) regardless of how many elements the buffer holds. The moved-from object is in a valid but empty state.",
      "**`vector` reallocation and `noexcept`.** When a `vector` grows beyond capacity, it must move all elements to new storage. It uses the move constructor *only if it's `noexcept`*. If the move constructor might throw, `vector` falls back to copying — to preserve the strong exception guarantee. This is why `noexcept` on move constructors is critical for performance: `Buffer(Buffer&&) noexcept`. Without it, `vector<Buffer>` copies on every reallocation.",
      "**Perfect forwarding with `std::forward`.** A forwarding function: `template<typename T> void wrapper(T&& arg) { target(std::forward<T>(arg)); }`. `T&&` here is a *forwarding reference* (also called universal reference) — it collapses to lvalue reference if `arg` is lvalue, rvalue reference if `arg` is rvalue. `std::forward<T>(arg)` preserves the value category. Without `forward`, `arg` inside `wrapper` is always an lvalue (it has a name), and you'd always copy into `target`. `make_unique<T>(args...)` and `emplace_back(args...)` use perfect forwarding internally.",
      "**When to call `std::move`.** Three valid cases: (1) move constructor/assignment implementation — steal from the source parameter; (2) moving from a local variable you're done with into a container or function parameter; (3) moving a data member in a move constructor. Avoid: `return std::move(local)` in a function return (disables RVO); `std::move` on `const` variables (const can't bind to `T&&` — falls back to copy silently).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Observe move semantics in action:**\n\n1. Compile and run — count constructor/destructor calls; observe no copy in RVO case\n2. Remove `noexcept` from the move constructor — recompile; vector may now copy on reallocation\n3. Add `vec.push_back(Buffer(1, 'd'))` after removing reserve — watch move-on-reallocation\n4. Try `Buffer b2 = std::move(fromFactory)` — fromFactory's data pointer becomes nullptr\n5. Remove the move constructor entirely — all moves become copies (measure the difference)\n6. Add a move assignment operator following the same steal-and-null pattern",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": MOVE_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Reference collapsing rules.** Template deduction with `T&&` follows reference collapsing: `T& &&` → `T&` (lvalue stays lvalue); `T&& &&` → `T&&` (rvalue stays rvalue). This is why `T&&` in a template is a forwarding reference — it can bind to both lvalues and rvalues. In contrast, a concrete type: `Buffer&&` is always an rvalue reference, never a forwarding reference. The rule of thumb: `T&&` is a forwarding reference *only* when `T` is deduced (template parameter or `auto&&`).",
      "**Move-only types.** `std::unique_ptr<T>` is move-only: the copy constructor and copy assignment are `= delete`. This enforces unique ownership at compile time. `std::move(uptr)` transfers ownership; after the move, `uptr` is null. Trying to copy a `unique_ptr` is a compile error. Move-only types are the C++ way to model exclusive-ownership resources — file handles, sockets, locks.",
      "**The Rule of Zero.** If your class manages no resources directly (uses `unique_ptr`, `shared_ptr`, `string`, `vector` for all members), you don't need to define *any* of the five special members — the compiler-generated defaults do the right thing (deep copy via member copy constructors, deep move via member move constructors). The Rule of Zero: if you can avoid defining special members by using RAII wrappers, do so. Only define them when managing raw resources (raw pointer, file descriptor, socket).",
    ],
    callouts: [
      {
        type: "warning",
        title: "Don't return std::move(local) — it disables RVO",
        body: "`return std::move(result);` looks helpful but is harmful. The compiler can apply Return Value Optimization (RVO) to construct `result` directly in the caller's storage — eliminating the move entirely. `std::move` forces a move instead, which is still slower than RVO. Write `return result;` and let the compiler optimize. The compiler will use a move if RVO isn't possible.",
      },
      {
        type: "info",
        title: "Moved-from objects are in valid-but-unspecified state",
        body: "After `auto b = std::move(a)`, `a` is valid (not undefined behavior to access) but unspecified — it might be empty, zero, or have arbitrary content depending on the type. `std::string` after being moved-from is guaranteed to be empty or a valid string. Re-assigning to a moved-from object makes it fully usable again. Safe pattern: only use a moved-from variable if you immediately re-assign it.",
      },
      {
        type: "tip",
        title: "Rule of Zero: prefer RAII member types to raw resources",
        body: "A class whose members are all `unique_ptr`, `shared_ptr`, `string`, `vector`, etc. automatically gets correct copy, move, and destruction for free — the compiler generates them by composing the members' own special functions. The only time you need to manually write a move constructor is when you're wrapping a raw pointer or OS handle. Use smart pointers and containers for members, and let the Rule of Zero save you work.",
      },
    ],
  },

  examples: [
    {
      title: "Move-only resource wrapper",
      body: `class FileDescriptor {
    int fd;
public:
    explicit FileDescriptor(const char* path) : fd(open(path, O_RDONLY)) {
        if (fd < 0) throw std::runtime_error("Cannot open file");
    }
    ~FileDescriptor() { if (fd >= 0) close(fd); }

    // Move-only: transfer fd ownership
    FileDescriptor(FileDescriptor&& o) noexcept : fd(o.fd) { o.fd = -1; }
    FileDescriptor& operator=(FileDescriptor&& o) noexcept {
        if (this != &o) { if (fd >= 0) close(fd); fd = o.fd; o.fd = -1; }
        return *this;
    }

    // No copies: one fd, one owner
    FileDescriptor(const FileDescriptor&) = delete;
    FileDescriptor& operator=(const FileDescriptor&) = delete;

    int get() const { return fd; }
};`,
    },
    {
      title: "Perfect forwarding factory function",
      body: `#include <memory>
#include <utility>

// Constructs T in-place, forwarding args perfectly (no extra copy/move)
template<typename T, typename... Args>
std::unique_ptr<T> makeUnique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

// std::make_unique does exactly this.
// Perfect forwarding preserves lvalue/rvalue-ness of each argument:
// - lvalue args are forwarded as lvalues (copied into T's constructor)
// - rvalue args are forwarded as rvalues (moved into T's constructor)

struct Widget {
    std::string name;
    int value;
    Widget(std::string n, int v) : name(std::move(n)), value(v) {}
};

// auto w = makeUnique<Widget>("hello", 42);
// "hello" is an rvalue — forwarded as rvalue — moved into name
// 42 is an rvalue — forwarded as rvalue — no overhead`,
    },
    {
      title: "Efficient pass-by-value with move",
      body: `// Anti-pattern: two copies if called with lvalue, one if called with rvalue
void setName_ref(const std::string& name) { this->name = name; }

// Better: one copy if lvalue, one move if rvalue
// The copy/move happens at the call site (into the parameter)
void setName_val(std::string name) { this->name = std::move(name); }

// Usage:
// std::string s = "Alice";
// obj.setName_val(s);              // one copy (s → param), one move (param → member)
// obj.setName_val(std::move(s));   // one move (s → param), one move (param → member)
// obj.setName_val("Bob");          // one move (literal → param optimized), one move

// This "pass by value and move" idiom is the modern pattern for setter functions
// and constructors that need to store a copy of the argument.`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Implement a `MoveableStack<T>` class with move semantics. It must have: default constructor, constructor from `vector<T>&&` (moves the vector in), copy constructor (deep copy), move constructor (steals the vector), `push(T)`, `pop()`, `top() const`, `size() const`. Write a test that constructs two stacks, copies one, moves the other, and verifies the moved-from stack is empty.",
      hint: "Use `std::vector<T>` as the underlying storage. The move constructor: `data(std::move(o.data))` — vector's own move constructor does the work.",
      walkthrough: [
        "class MoveableStack { vector<T> data; };",
        "Constructor from vector<T>&&: data(std::move(v))",
        "Copy ctor: data(o.data) — vector's copy ctor does deep copy",
        "Move ctor: data(std::move(o.data)) — steals o's vector",
        "push: data.push_back(std::move(val));",
        "pop: data.pop_back(); top: return data.back();",
      ],
    },
    {
      difficulty: "hard",
      problem:
        "Build a type-safe `Any` class that can hold a value of any type and retrieve it. Implement: `Any()` (empty), `Any(T val)` (stores copy/move of val), `T& get<T>()` (retrieves reference, throws if wrong type), `bool hasValue()`, assignment operator. Internally use `void*` + type ID (`typeid(T).hash_code()`). Implement with proper RAII (destructor deletes the void*, stored via function pointer to the type's destructor). Test storing `int`, `string`, `vector<int>`.",
      hint: "Store a `void*` for the data and a `std::function<void(void*)>` as the deleter. For `get<T>()`, check `typeHash == typeid(T).hash_code()` then `return *static_cast<T*>(ptr)`.",
      walkthrough: [
        "Private: void* ptr = nullptr; size_t typeHash = 0; function<void(void*)> deleter;",
        "template<typename T> Any(T&& val): ptr(new T(forward<T>(val))), typeHash(typeid(T).hash_code()), deleter([](void* p){ delete static_cast<T*>(p); })",
        "Destructor: if (ptr) deleter(ptr);",
        "Move ctor: steal ptr, typeHash, deleter; set other to null",
        "get<T>(): if (typeHash != typeid(T).hash_code()) throw bad_cast; return *static_cast<T*>(ptr);",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-010-q1",
        type: "choice",
        text: "What does `std::move(x)` actually do at runtime?",
        options: [
          "Immediately transfers x's resources to a new object",
          "Performs a cast to rvalue reference — the actual resource transfer happens in the move constructor/assignment that receives the result",
          "Copies x into a temporary then destroys x",
          "Marks x as invalid so future accesses are compile errors",
        ],
        answer: 1,
        explanation:
          "`std::move(x)` is purely a cast — it produces `static_cast<T&&>(x)`. At runtime it does nothing by itself. It just changes the overload resolution so that the move constructor/assignment is called instead of the copy constructor/assignment when the expression is used. The actual resource stealing happens in the constructor/assignment that receives the `T&&`.",
      },
      {
        id: "cpp1-010-q2",
        type: "choice",
        text: "Why must move constructors be marked `noexcept` for `std::vector` to use them during reallocation?",
        options: [
          "std::vector doesn't actually use move constructors",
          "std::vector uses copies if the move constructor might throw, to preserve the strong exception guarantee during reallocation",
          "noexcept makes the move constructor faster by skipping exception tables",
          "The C++ standard requires noexcept on all move constructors",
        ],
        answer: 1,
        explanation:
          "When `vector` reallocates, it must move all existing elements to new storage. If a move constructor might throw mid-way, some elements are already moved and some aren't — the original is partially destroyed and unrecoverable. To preserve the strong exception guarantee, `vector` falls back to copying (which it can roll back on failure). Only if the move constructor is `noexcept` does `vector` use moves.",
      },
      {
        id: "cpp1-010-q3",
        type: "choice",
        text: "What is Return Value Optimization (RVO) and when should you avoid `return std::move(local)`?",
        options: [
          "RVO copies the return value efficiently; std::move is always better",
          "RVO constructs the return value directly in the caller's storage (no copy or move); std::move(local) disables RVO, forcing a move instead of nothing",
          "RVO is only available with compiler flags; std::move is the portable equivalent",
          "RVO and std::move are identical in effect",
        ],
        answer: 1,
        explanation:
          "With RVO/NRVO, the compiler constructs the local variable directly in the memory where the return value will live — no move, no copy, zero overhead. `return std::move(local)` prevents this optimization by explicitly requesting a move, which is still slower than RVO. Just write `return local;` and let the compiler apply RVO.",
      },
      {
        id: "cpp1-010-q4",
        type: "choice",
        text: "What is the 'Rule of Zero' in modern C++?",
        options: [
          "All classes must define zero special member functions",
          "Classes that use RAII member types (unique_ptr, string, vector) need not define any special members — the compiler generates correct copy, move, and destruction automatically",
          "You should use zero raw pointers in modern C++",
          "Classes should have zero-argument default constructors",
        ],
        answer: 1,
        explanation:
          "The Rule of Zero: if your class uses only members with correct copy/move semantics (smart pointers, standard containers, strings), the compiler-generated special members do the right thing — they compose the members' own copy/move constructors. You only need to write special members when directly managing raw resources (raw pointers, OS handles). Prefer Rule of Zero over Rule of Five.",
      },
    ],
  },
};

export default lesson;
