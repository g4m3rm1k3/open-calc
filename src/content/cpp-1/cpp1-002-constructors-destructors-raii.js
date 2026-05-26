const RAII_CODE = `#include <iostream>
#include <string>
using namespace std;

class ManagedBuffer {
private:
    int*   data;
    size_t size;
    string name;

public:
    // Constructor — acquires resource
    ManagedBuffer(size_t sz, string n)
        : data(new int[sz]), size(sz), name(n) {
        cout << "[" << name << "] Constructor: allocated " << sz << " ints" << endl;
        for (size_t i = 0; i < sz; i++) data[i] = 0;
    }

    // Destructor — releases resource (called automatically)
    ~ManagedBuffer() {
        delete[] data;
        cout << "[" << name << "] Destructor: freed memory" << endl;
    }

    // Copy constructor (deep copy)
    ManagedBuffer(const ManagedBuffer& other)
        : data(new int[other.size]), size(other.size), name(other.name + "_copy") {
        for (size_t i = 0; i < size; i++) data[i] = other.data[i];
        cout << "[" << name << "] Copy constructor" << endl;
    }

    // Copy assignment operator
    ManagedBuffer& operator=(const ManagedBuffer& other) {
        if (this == &other) return *this;  // self-assignment guard
        delete[] data;                     // release old
        size = other.size;
        data = new int[size];
        for (size_t i = 0; i < size; i++) data[i] = other.data[i];
        cout << "[" << name << "] Copy assignment from " << other.name << endl;
        return *this;
    }

    void set(size_t idx, int val) { if (idx < size) data[idx] = val; }
    int  get(size_t idx) const    { return idx < size ? data[idx] : -1; }

    void print() const {
        cout << name << ": [";
        for (size_t i = 0; i < size; i++) {
            cout << data[i];
            if (i+1 < size) cout << ", ";
        }
        cout << "]" << endl;
    }
};

// __OUTPUT__: [buf1] Constructor: allocated 3 ints\\n[buf2] Constructor: allocated 3 ints\\nbuf1: [10, 20, 30]\\n[buf1_copy] Copy constructor\\nbuf1_copy: [10, 20, 30]\\n[buf2] Copy assignment from buf1\\nbuf2: [10, 20, 30]\\n--- Leaving scope ---\\n[buf1_copy] Destructor: freed memory\\n[buf2] Destructor: freed memory\\n[buf1] Destructor: freed memory

int main() {
    ManagedBuffer buf1(3, "buf1");
    ManagedBuffer buf2(3, "buf2");
    buf1.set(0, 10); buf1.set(1, 20); buf1.set(2, 30);
    buf1.print();

    ManagedBuffer buf3 = buf1;    // copy constructor
    buf3.print();

    buf2 = buf1;                  // copy assignment
    buf2.print();

    cout << "--- Leaving scope ---" << endl;
    // Destructors called automatically in reverse order: buf3, buf2, buf1
    return 0;
}`;

const lesson = {
  id: "cpp-1-002",
  slug: "constructors-destructors-raii",
  chapter: "cpp-1",
  order: 2,
  title: "Constructors, Destructors, and RAII",
  subtitle: "Control object lifetime and tie resource management to scope with RAII",
  tags: ["c++", "cpp", "constructor", "destructor", "RAII", "copy-constructor", "rule-of-three", "memory-management"],
  aliases: [
    "c++ destructor",
    "c++ RAII",
    "c++ rule of three",
    "c++ copy constructor",
    "resource acquisition is initialization",
  ],

  hook: `C++ gives you explicit control over what happens when objects are created and destroyed. This is not just syntax sugar — it's the mechanism behind C++'s most powerful design pattern: **RAII (Resource Acquisition Is Initialization)**. RAII means tying a resource (memory, file handle, mutex, socket) to an object's lifetime. When the object is constructed, the resource is acquired. When it goes out of scope, the destructor runs and releases the resource — automatically, deterministically, even if an exception is thrown. This is why C++ doesn't need garbage collection.`,

  mentalModel: [
    "**The destructor runs automatically when an object goes out of scope.** No `free()`, no `close()`, no manual cleanup — the compiler inserts the destructor call at the closing `}`. This is guaranteed even if the scope is exited by an exception. RAII turns resource management from a manual, error-prone task into an automatic, compiler-enforced one.",
    "**The Rule of Three (Rule of Five in C++11).** If a class manages a resource (defines a custom destructor), you almost certainly need to also define a copy constructor and copy assignment operator. Otherwise, the default shallow copy just copies the pointer — both copies point to the same memory. When the first destructs, the second has a dangling pointer. The 'Rule of Three': if you define one, define all three.",
    "**Default-generated members.** The compiler generates default constructor, copy constructor, copy assignment, and destructor if you don't define them. For classes with only value members (no pointers), the defaults work correctly. For classes with raw pointers or handles, the defaults do the wrong thing (shallow copy). This is the central decision point in class design.",
  ],

  intuition: {
    prose: [
      "**What RAII looks like in practice.** Instead of: `FILE* f = fopen(...); /* ... */ fclose(f);` with the risk of forgetting `fclose` on every exit path, you write a class where the constructor opens the file and the destructor closes it. `FileHandle fh(\"data.txt\");` — when `fh` goes out of scope, the destructor runs and closes the file. Even if an exception is thrown, the destructor runs. The `std::unique_ptr`, `std::fstream`, `std::lock_guard` — these are all RAII wrappers in the standard library.",
      "**Shallow copy vs deep copy.** `ManagedBuffer b2 = b1` with a default copy constructor copies the pointer `data` — both `b1` and `b2` have `data` pointing to the same heap memory. When `b1` destructs, it calls `delete[] data`. Now `b2.data` is a dangling pointer. The solution: deep copy allocates new memory and copies the elements. The copy constructor in the example does this: `data(new int[other.size])` then copies element by element.",
      "**Self-assignment guard.** `if (this == &other) return *this;` in the copy assignment operator handles `buf1 = buf1`. Without it: you `delete[] data` first, then try to copy from `other.data` — but `this == &other` means `other.data` was just freed. Always check for self-assignment in copy assignment operators before releasing the old resource.",
      "**Order of construction and destruction.** In `{ A a; B b; C c; }`, objects are constructed in declaration order (a, b, c) and destroyed in reverse order (c, b, a). This reverse-order destruction is important for dependencies: if `c` depends on `b`, and `b` depends on `a`, destruction in reverse ensures dependencies are still alive when needed.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Trace object lifetimes:**\n\n1. Compile and run — observe construction and destruction order\n2. Add a `{ ManagedBuffer temp(2, \"temp\"); }` block inside main — temp's destructor runs when the block exits\n3. Remove the copy constructor — what output changes when you do `buf3 = buf1`? (shallow copy: both will try to free same memory)\n4. Add a `printAll(const ManagedBuffer& b)` free function to see const& access\n5. Add a move constructor `ManagedBuffer(ManagedBuffer&& other)` that steals the pointer instead of copying",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": RAII_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The Rule of Five (C++11).** With move semantics, the 'Rule of Three' extends to five: if you define any of {destructor, copy constructor, copy assignment, move constructor, move assignment}, you should explicitly define or `= default` / `= delete` all five. Move operations transfer ownership without copying — essential for efficiency. The move constructor `ManagedBuffer(ManagedBuffer&&)` steals the resource from a temporary object, setting its pointer to `nullptr` so the temporary's destructor is harmless.",
      "**`= default` and `= delete`.** You can explicitly request the compiler-generated defaults: `MyClass(const MyClass&) = default;`. Or explicitly forbid operations: `MyClass(const MyClass&) = delete;` — then any attempt to copy the object is a compile error. This is how non-copyable resources (like `unique_ptr`, mutexes) are implemented. Explicitly `= delete` operations you intend to forbid rather than leaving them undefined.",
      "**Constructor delegation (C++11).** One constructor can call another: `Circle() : Circle(0, 0, 1) {}` delegates to `Circle(double, double, double)`. This avoids duplicating initialization logic. Common pattern: a default constructor delegates to a parameterized constructor with sensible defaults. Member initializer lists are always more efficient than assignment in the constructor body for non-trivial types.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Double free: why the Rule of Three matters",
        body: "If you define a destructor that calls `delete[] data` but don't define a copy constructor, copying the object gives two objects with the same `data` pointer. Both destructors call `delete[]` on the same memory — this is a double free, which is undefined behavior (usually a crash). Always define copy constructor + copy assignment when you define a destructor.",
      },
      {
        type: "info",
        title: "RAII in the standard library",
        body: "Every major resource type in C++ has an RAII wrapper: `std::unique_ptr`/`std::shared_ptr` (memory), `std::fstream` (files), `std::lock_guard`/`std::unique_lock` (mutexes), `std::jthread` (threads in C++20). Use these wrappers rather than raw pointers and manual cleanup — they make resource safety automatic.",
      },
      {
        type: "tip",
        title: "Destructor should never throw",
        body: "Destructors are called during stack unwinding when an exception propagates. If a destructor throws during unwinding, `std::terminate` is called (immediate crash). Always write `noexcept` destructors. If cleanup can fail (e.g., flushing a file), handle the error inside the destructor (log it, silently ignore, or store a flag) rather than throwing.",
      },
    ],
  },

  examples: [
    {
      title: "RAII file handle",
      body: `#include <fstream>
#include <stdexcept>

class FileHandle {
    std::FILE* fp;
public:
    FileHandle(const char* name, const char* mode) {
        fp = std::fopen(name, mode);
        if (!fp) throw std::runtime_error("Cannot open file");
    }
    ~FileHandle() {
        if (fp) std::fclose(fp);  // always runs, even on exception
    }

    // Prevent copy (resource should have one owner)
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    std::FILE* get() const { return fp; }
};

// Usage: file is automatically closed at end of scope
// FileHandle f("data.txt", "r");
// // use f.get() for C file ops
// // destructor closes file even if exception thrown`,
    },
    {
      title: "Rule of Five with move semantics",
      body: `class Buffer {
    int* data;
    size_t size;
public:
    Buffer(size_t n) : data(new int[n]), size(n) {}

    // Destructor
    ~Buffer() { delete[] data; }

    // Copy constructor (deep copy)
    Buffer(const Buffer& o)
        : data(new int[o.size]), size(o.size) {
        std::copy(o.data, o.data + size, data);
    }

    // Copy assignment
    Buffer& operator=(const Buffer& o) {
        if (this != &o) {
            delete[] data;
            size = o.size;
            data = new int[size];
            std::copy(o.data, o.data + size, data);
        }
        return *this;
    }

    // Move constructor (steal the pointer — no copy!)
    Buffer(Buffer&& o) noexcept
        : data(o.data), size(o.size) {
        o.data = nullptr;  // prevent double-free
        o.size = 0;
    }

    // Move assignment
    Buffer& operator=(Buffer&& o) noexcept {
        if (this != &o) {
            delete[] data;
            data = o.data;  size = o.size;
            o.data = nullptr; o.size = 0;
        }
        return *this;
    }
};`,
    },
    {
      title: "RAII mutex lock guard",
      body: `// RAII wrapper for a mutex — locks on construction, unlocks on destruction
template<typename Mutex>
class LockGuard {
    Mutex& mtx;
public:
    LockGuard(Mutex& m) : mtx(m) { mtx.lock(); }
    ~LockGuard()                 { mtx.unlock(); }

    // Non-copyable, non-movable
    LockGuard(const LockGuard&) = delete;
    LockGuard& operator=(const LockGuard&) = delete;
};

// Usage:
// std::mutex m;
// {
//     LockGuard<std::mutex> lock(m);  // locks here
//     // critical section
// }  // unlocks here automatically (even if exception thrown)`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Implement an `IntArray` class: dynamically-allocated integer array with constructor `IntArray(size_t n)`, destructor, copy constructor (deep copy), copy assignment (with self-assignment guard), `operator[]` (both const and non-const overloads), and `size()`. Test by creating two arrays, modifying one, copying it to another, and verifying independence.",
      hint: "Non-const `operator[]` returns `int&`; const version returns `const int&`. Check `this != &other` in copy assignment before `delete[] data`.",
      walkthrough: [
        "Private: int* data; size_t sz;",
        "Constructor: data = new int[n]{}; sz = n;",
        "Destructor: delete[] data;",
        "Copy ctor: data = new int[o.sz]; std::copy(o.data, o.data+o.sz, data);",
        "Copy assign: guard, delete, allocate, copy",
        "operator[](size_t i): return data[i]; — two versions",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "RAII timer: write a `Timer` class that records the start time in its constructor (`std::chrono::steady_clock::now()`) and prints elapsed time in its destructor. Then write a function `expensive()` that loops 100 million times. Wrap the call with `{ Timer t; expensive(); }` and see the timing output automatically when the block exits.",
      hint: "Use `#include <chrono>`. In the destructor: `auto end = steady_clock::now(); auto ms = duration_cast<milliseconds>(end - start).count();`",
      walkthrough: [
        "#include <chrono> using namespace std::chrono;",
        "Constructor: start = steady_clock::now();",
        "Destructor: auto elapsed = duration_cast<milliseconds>(steady_clock::now() - start); cout << elapsed.count() << \"ms\" << endl;",
        "In main: { Timer t; expensive(); } — destructor fires as block closes",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-002-q1",
        type: "choice",
        text: "When does a C++ destructor run?",
        options: [
          "Only when you call `delete` on the object",
          "Automatically when the object goes out of scope — including on exceptions",
          "Only at the end of `main()`",
          "When the garbage collector runs",
        ],
        answer: 1,
        explanation:
          "Destructors run deterministically when an object's scope ends — the compiler inserts the call at the closing `}`. For heap objects, the destructor runs when you call `delete`. Crucially, destructors also run during stack unwinding when an exception propagates — this is why RAII is exception-safe.",
      },
      {
        id: "cpp1-002-q2",
        type: "choice",
        text: "What is RAII?",
        options: [
          "A garbage collection algorithm used by C++",
          "Tying resource acquisition to object construction and release to destruction",
          "A way to avoid using constructors in performance-critical code",
          "An acronym for the Rule of Three",
        ],
        answer: 1,
        explanation:
          "RAII (Resource Acquisition Is Initialization) means: acquire a resource in the constructor, release it in the destructor. When the RAII object goes out of scope, the resource is automatically released — no manual cleanup needed, even in the presence of exceptions.",
      },
      {
        id: "cpp1-002-q3",
        type: "choice",
        text: "Why does defining a custom destructor mean you probably need a custom copy constructor too?",
        options: [
          "The compiler requires all three to be defined together",
          "Without a custom copy constructor, the default does a shallow copy — two objects share the same raw pointer, causing a double-free when both destruct",
          "Custom destructors disable the compiler-generated copy constructor",
          "Copy constructors always call the destructor",
        ],
        answer: 1,
        explanation:
          "If you manage a resource (hence the custom destructor), the default copy constructor copies the pointer value only (shallow copy). Both objects then point to the same resource. When the first destructs, the resource is freed. When the second destructs, it frees already-freed memory — undefined behavior (double-free).",
      },
      {
        id: "cpp1-002-q4",
        type: "choice",
        text: "What does `MyClass(const MyClass&) = delete;` accomplish?",
        options: [
          "Defines the copy constructor to do nothing",
          "Makes copying the class a compile error",
          "Generates an optimized default copy constructor",
          "Allows copying only within the class itself",
        ],
        answer: 1,
        explanation:
          "`= delete` explicitly forbids an operation — any attempt to copy the object won't compile. This is how non-copyable types (unique ownership, mutexes) are implemented. Better than leaving it private or undefined because the error message is clearer.",
      },
    ],
  },
};

export default lesson;
