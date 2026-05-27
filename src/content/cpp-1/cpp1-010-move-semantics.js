const LRVAL_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: lvalue: x=42\\nrvalue: temp is gone\\nrvalue ref: r=99\\nafter move: s=''

int main() {
    // lvalue: has a name, persists
    int x = 42;
    int& lref = x;        // lvalue reference — binds to named variable
    cout << "lvalue: x=" << lref << "\\n";

    // rvalue: temporary, no name, about to die
    // int& bad = 5;      // error: can't bind lvalue ref to rvalue
    const int& cr = 5;   // const lvalue ref CAN bind to rvalue (extends lifetime)
    cout << "rvalue: temp is gone\\n";

    // rvalue reference &&: binds to temporaries only
    int&& r = 99;         // extends the 99 temporary's lifetime
    cout << "rvalue ref: r=" << r << "\\n";

    // std::move: CAST to rvalue ref — doesn't move anything itself
    string s = "hello";
    string s2 = std::move(s);   // move constructor called — s is now empty
    cout << "after move: s='" << s << "'\\n";

    return 0;
}`;

const MOVE_CTOR_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: [A] born\\n[A] copy -> [A_copy] born\\n[A] move -> [A_moved] born\\n[A] dead (null, skip)\\n[A_moved] dead\\n[A_copy] dead\\n[A] dead

struct Buf {
    int* data;
    string name;
    Buf(string n) : data(new int[100]{}), name(n) { cout << "[" << n << "] born\\n"; }
    ~Buf() {
        if (!data) { cout << "[" << name << "] dead (null, skip)\\n"; return; }
        cout << "[" << name << "] dead\\n";
        delete[] data;
    }
    // Copy: allocate + copy all 100 ints — O(n)
    Buf(const Buf& o) : data(new int[100]), name(o.name + "_copy") {
        for (int i=0; i<100; i++) data[i] = o.data[i];
        cout << "[" << o.name << "] copy -> [" << name << "] born\\n";
    }
    // Move: steal pointer, null source — O(1)
    Buf(Buf&& o) noexcept : data(o.data), name(o.name + "_moved") {
        o.data = nullptr;   // prevent double-free in o's destructor
        cout << "[" << o.name << "] move -> [" << name << "] born\\n";
    }
};

int main() {
    Buf a("A");
    Buf b = a;              // copy — allocates
    Buf c = std::move(a);   // move — steals, a.data=nullptr
    return 0;
}`;

const RVO_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: make: born\\nresult has data\\nmake2: born\\nmoved: born\\nmake2: dead (null, skip)\\nmoved: dead\\nresult: dead

struct Heavy {
    int* data;
    Heavy() : data(new int[1000]{}) { cout << "make: born\\n"; }
    ~Heavy() {
        if (!data) { cout << "make: dead (null, skip)\\n"; return; }
        cout << (data ? "result: dead" : "make: dead (null, skip)") << "\\n";
        delete[] data;
    }
    Heavy(Heavy&& o) noexcept : data(o.data) {
        o.data = nullptr;
        cout << "moved: born\\n";
    }
    Heavy(const Heavy&) = delete;
};

Heavy makeRVO() {
    Heavy h;        // constructed directly in caller's storage (RVO)
    return h;       // no move, no copy — zero overhead
}

Heavy makeMoved() {
    Heavy h;
    return std::move(h);   // WRONG: disables RVO, forces a move instead
}

int main() {
    Heavy result = makeRVO();    // RVO: "make: born" only — no "moved: born"
    cout << "result has data\\n";

    Heavy moved = makeMoved();   // "make: born" + "moved: born" — extra overhead
    return 0;
}`;

const MOVE_CONTAINER_CODE = `#include <iostream>
#include <vector>
#include <string>
using namespace std;

// __OUTPUT__: --- string move ---\\nafter: src='' dst='hello world'\\n--- vector move ---\\nafter: v.size=0 v2.size=5\\n--- emplace vs push ---\\npush_back copies/moves string arg\\nemplace_back constructs in-place

int main() {
    // Move a string — O(1): pointer swap, no character copy
    string src = "hello world";
    string dst = std::move(src);
    cout << "--- string move ---\\n";
    cout << "after: src='" << src << "' dst='" << dst << "'\\n";

    // Move a vector — O(1): steals internal array
    vector<int> v = {1,2,3,4,5};
    vector<int> v2 = std::move(v);
    cout << "--- vector move ---\\n";
    cout << "after: v.size=" << v.size() << " v2.size=" << v2.size() << "\\n";

    // emplace_back: constructs in-place — zero copies or moves of the element
    vector<string> words;
    words.reserve(3);
    words.push_back("foo");           // constructs, then copies/moves into vector
    words.emplace_back("bar");        // constructs directly inside vector
    words.emplace_back(3, 'x');       // calls string(3, 'x') inside vector
    cout << "--- emplace vs push ---\\n";
    cout << "push_back copies/moves string arg\\n";
    cout << "emplace_back constructs in-place\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-1-010",
  slug: "move-semantics",
  chapter: "cpp-1",
  order: 10,
  title: "Move Semantics",
  subtitle: "Steal resources instead of copying — rvalue references, move constructors, RVO",
  tags: ["c++", "cpp", "move-semantics", "rvalue-reference", "std::move", "RVO", "noexcept", "emplace"],
  aliases: [
    "c++ move semantics",
    "c++ rvalue reference",
    "c++ std::move",
    "c++ move constructor",
    "c++ RVO",
  ],

  hook: `Before C++11, returning a large object from a function meant copying it — allocate new memory, copy all elements, destroy the original. Move semantics lets C++ steal the internal buffer from a temporary instead. The result: O(1) regardless of size. This is the key to writing high-performance C++ that avoids invisible copies.`,

  mentalModel: [
    "**Lvalues have names; rvalues are temporaries.** An lvalue is a variable you can take the address of. An rvalue is a temporary — a literal, function return value, or expression result. Rvalues are 'about to die' — safe to steal their resources. `int x = 5`: `x` is lvalue, `5` is rvalue.",
    "**`std::move` is a cast, not a move.** `std::move(x)` casts `x` to `T&&` (rvalue reference) — it does nothing at runtime by itself. The actual resource transfer happens in the move constructor that receives the `T&&`. After `std::move(x)`, `x` is valid but empty — don't use it again without re-assigning.",
    "**RVO: the compiler eliminates moves entirely.** Return Value Optimization constructs the return value directly in the caller's storage — no copy, no move. Write `return result;` not `return std::move(result);` — `std::move` disables RVO and forces a move instead of nothing.",
  ],

  intuition: {
    prose: [
      "**Rvalue references let you overload on 'this is temporary'.** `Buffer(Buffer&& o)` only binds to rvalues — temporaries and `std::move()` results. The implementation steals `o.data`, sets `o.data = nullptr`, and exits in O(1). When `o` destructs, its destructor finds `nullptr` and skips the delete.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**lvalues vs rvalues — run it then explore:**\n\n- Try `int& bad = 5;` — compile error: lvalue ref can't bind to rvalue.\n- Try `int&& r2 = x;` — compile error: rvalue ref can't bind to named lvalue.\n- After `string s2 = std::move(s)`, print `s.size()` — what is it? (0 — moved-from is empty)\n- Re-assign `s = \"world\"` and print it — moved-from objects are reusable after assignment.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": LRVAL_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Move constructor — run it then explore:**\n\n- Remove `noexcept` from the move constructor — does it still compile? (yes, but vector won't use it)\n- Delete the move constructor with `= delete` — what happens to `std::move(a)`? (falls back to copy)\n- Print `a.data` after the move — it's `nullptr` (c stole it)\n- Add `cout << a.data` inside Buf — verify nullptr after move.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MOVE_CTOR_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`noexcept` move constructors matter for `vector`.** When `vector` grows beyond capacity, it must relocate all elements. It uses move constructors *only if they're `noexcept`*. Without `noexcept`, `vector` falls back to copying to preserve the strong exception guarantee. Mark your move constructors `noexcept` — it's a performance requirement, not optional.",
      "**Rule of Zero: prefer RAII members over raw resources.** If your class members are `unique_ptr`, `vector`, `string` — the compiler generates correct copy/move/destruction for free. You only need a manual move constructor when managing a raw pointer or OS handle directly. Use the Rule of Zero: let member types do the work.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**RVO — run it then explore:**\n\n- Count 'born' in makeRVO output vs makeMoved — RVO has one, makeMoved has two.\n- Add `return std::move(h)` to makeRVO — now you see 'moved: born' (RVO disabled).\n- Change `makeMoved` back to `return h` — does RVO kick in? (yes — NRVO)\n- The rule: never write `return std::move(local)` — you're opting out of a free optimization.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RVO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Move containers and emplace — run it then explore:**\n\n- After moving `v`, try `v.push_back(6)` — moved-from vector is still usable (empty, not broken).\n- Add a `vector<string>` with `push_back(std::move(someString))` — does `someString` become empty?\n- Change `emplace_back(3, 'x')` to `push_back(string(3, 'x'))` — functionally identical but emplace avoids one move.\n- `words.reserve(10)` before any pushes — does it prevent reallocation moves?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MOVE_CONTAINER_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Don't return std::move(local) — it disables RVO",
        body: "`return std::move(result)` looks helpful but prevents RVO, forcing a move instead of nothing. The compiler constructs `result` directly in the caller's storage with RVO — zero overhead. Write `return result;` and let the compiler optimize. Only use `std::move` in a return when the type is move-only and RVO isn't applicable (e.g., returning a parameter, not a local).",
      },
      {
        type: "tip",
        title: "Moved-from objects are valid but empty — reuse with re-assignment",
        body: "After `auto b = std::move(a)`, `a` is in a valid-but-unspecified state. For `std::string` and `std::vector`, the standard guarantees they're empty. You can safely re-assign: `a = \"new value\"`. Never read a moved-from object without first re-assigning — the content is unspecified.",
      },
    ],
  },

  examples: [
    {
      title: "Move constructor — steal and null pattern",
      body: `class Buffer {
    int* data;
    size_t size;
public:
    Buffer(size_t n) : data(new int[n]{}), size(n) {}
    ~Buffer() { delete[] data; }

    // Move: O(1) — steal pointer, null source
    Buffer(Buffer&& o) noexcept : data(o.data), size(o.size) {
        o.data = nullptr;   // destructor checks: if (!data) skip delete
        o.size = 0;
    }
    Buffer& operator=(Buffer&& o) noexcept {
        if (this != &o) {
            delete[] data;          // free own resources first
            data = o.data; size = o.size;
            o.data = nullptr; o.size = 0;
        }
        return *this;
    }
    // Copy: O(n) — deep copy
    Buffer(const Buffer& o) : data(new int[o.size]), size(o.size) {
        std::copy(o.data, o.data + size, data);
    }
};`,
    },
    {
      title: "Pass-by-value + move idiom for constructors",
      body: `// Anti-pattern: lvalue arg copies twice (into param + into member)
void setName_ref(const std::string& name) { this->name = name; }

// Better: one copy if lvalue, one move if rvalue (move into param)
void setName_val(std::string name) { this->name = std::move(name); }

struct Person {
    std::string name;
    // Pass by value: one copy (lvalue) or one move (rvalue) into param
    // Then move from param into member — always two operations, optimal
    Person(std::string n) : name(std::move(n)) {}
};

Person p1("Alice");              // temporary: move into n, move into member
std::string s = "Bob";
Person p2(s);                    // copy into n, move into member
Person p3(std::move(s));         // move into n, move into member — s is empty`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Demonstrate that `std::move` on a `const` object silently falls back to a copy. Create a `Tracer` class that prints 'copied' or 'moved' in its copy and move constructors. Declare `const Tracer t;` and do `Tracer t2 = std::move(t);`. Verify it prints 'copied' not 'moved'. Explain why.",
      hint: "`const Tracer` can't bind to `Tracer&&` (non-const rvalue ref). The compiler falls back to `const Tracer&` — copy constructor. `std::move` on const is silently a no-op.",
      walkthrough: [
        "struct Tracer { Tracer(const Tracer&) { cout << 'copied'; } Tracer(Tracer&&) noexcept { cout << 'moved'; } };",
        "const Tracer t;",
        "Tracer t2 = std::move(t);  // prints 'copied' — const can't bind to T&&",
        "Reason: std::move produces const Tracer&&; copy ctor (const Tracer&) is a better match",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `MoveableStack<T>` using `std::vector<T>` as storage. Provide: default constructor, move constructor (steal the vector), copy constructor (deep copy), `push(T)`, `pop()`, `top() const`, `size() const`, `empty() const`. Test: create a stack with 5 elements, move it into a second stack, verify the original is empty and the second has 5 elements.",
      hint: "Move constructor: `data(std::move(o.data))` — vector's own move does all the work in O(1). Copy constructor: `data(o.data)` — vector's copy does O(n) deep copy.",
      walkthrough: [
        "template<typename T> class MoveableStack { vector<T> data; };",
        "Move ctor: MoveableStack(MoveableStack&& o) noexcept : data(std::move(o.data)) {}",
        "Copy ctor: MoveableStack(const MoveableStack& o) : data(o.data) {}",
        "push: data.push_back(std::move(val)); pop: data.pop_back();",
        "top: return data.back(); size: return data.size();",
        "Test: push 5, move, check original.empty() == true, copy.size() == 5",
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
          "Performs a cast to rvalue reference — the actual resource transfer happens in the move constructor that receives it",
          "Copies x into a temporary then destroys x",
          "Marks x as invalid so future accesses are compile errors",
        ],
        answer: 1,
        explanation:
          "`std::move(x)` is purely a cast to `T&&`. At runtime it does nothing by itself — it just changes overload resolution so the move constructor is called instead of the copy constructor. The actual resource stealing happens in the constructor that receives the `T&&`.",
      },
      {
        id: "cpp1-010-q2",
        type: "choice",
        text: "Why must move constructors be `noexcept` for `std::vector` to use them during reallocation?",
        options: [
          "std::vector doesn't use move constructors",
          "std::vector uses copies if the move constructor might throw, to preserve the strong exception guarantee",
          "noexcept makes the move constructor faster by skipping exception tables",
          "The C++ standard requires noexcept on all move constructors",
        ],
        answer: 1,
        explanation:
          "When `vector` reallocates, it must relocate all elements. If a move constructor might throw mid-way, some elements are already moved and some aren't — the original is partially destroyed. To preserve the strong exception guarantee, `vector` falls back to copying unless the move constructor is `noexcept`.",
      },
      {
        id: "cpp1-010-q3",
        type: "choice",
        text: "Why should you avoid `return std::move(local);` in a function?",
        options: [
          "std::move is not allowed in return statements",
          "It disables Return Value Optimization — the compiler would otherwise construct the object directly in the caller's storage with zero overhead",
          "It causes a double-free of the local variable",
          "std::move only works on heap-allocated objects",
        ],
        answer: 1,
        explanation:
          "With RVO, the compiler constructs the local variable directly in the caller's storage — no copy, no move. `return std::move(local)` prevents this by explicitly requesting a move, which is slower than RVO (which does nothing). Always write `return local;`.",
      },
      {
        id: "cpp1-010-q4",
        type: "choice",
        text: "What is the state of a `std::string` after it has been moved from?",
        options: [
          "Undefined behavior to access it",
          "Valid but unspecified — guaranteed to be a valid empty-or-arbitrary string; safe to re-assign",
          "Always exactly empty string (\"\")",
          "The string is destroyed and accessing it is a crash",
        ],
        answer: 1,
        explanation:
          "The C++ standard requires moved-from objects to be in a 'valid but unspecified state'. For `std::string`, this means it's a valid string (destructor is safe, re-assignment works), but the content is unspecified — may be empty, may not be. Don't read the content; do re-assign before using it again.",
      },
    ],
  },
};

export default lesson;
