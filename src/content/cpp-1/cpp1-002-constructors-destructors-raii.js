const CTOR_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: [A] constructed\\n[B] constructed with 42\\n[B] destructed\\n[A] destructed

class Widget {
    string name;
    int value;
public:
    Widget(string n)          : name(n), value(0)  { cout << "[" << name << "] constructed\\n"; }
    Widget(string n, int v)   : name(n), value(v)  { cout << "[" << name << "] constructed with " << v << "\\n"; }
    ~Widget()                                       { cout << "[" << name << "] destructed\\n"; }

    int get() const { return value; }
};

int main() {
    Widget a("A");
    {
        Widget b("B", 42);
    }   // b destroyed here (scope end)
    // a destroyed at main's end
    return 0;
}`;

const RAII_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: acquired lock\\ndoing work...\\nreleased lock  (always, even on exception)

class Lock {
    string resource;
public:
    Lock(string r) : resource(r) {
        cout << "acquired " << resource << endl;
    }
    ~Lock() {
        cout << "released " << resource << endl;
    }
};

void doWork() {
    Lock lk("lock");          // acquire
    cout << "doing work..." << endl;
    // even if an exception is thrown here, ~Lock() runs
}                             // lk destroyed: release guaranteed

int main() {
    doWork();
    return 0;
}`;

const COPY_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: [buf] constructed\\n[buf_copy] deep copy\\nbuf[0]=10 buf_copy[0]=10\\nafter buf[0]=99: buf[0]=99 buf_copy[0]=10\\n[buf_copy] destructed\\n[buf] destructed

class Buffer {
    int* data;
    int  size;
    string name;
public:
    Buffer(int sz, string n) : data(new int[sz]), size(sz), name(n) {
        for (int i=0; i<sz; i++) data[i] = 0;
        cout << "[" << name << "] constructed\\n";
    }
    // Deep copy constructor — own copy of data
    Buffer(const Buffer& o) : data(new int[o.size]), size(o.size), name(o.name+"_copy") {
        for (int i=0; i<size; i++) data[i] = o.data[i];
        cout << "[" << name << "] deep copy\\n";
    }
    ~Buffer() { delete[] data; cout << "[" << name << "] destructed\\n"; }

    void set(int i, int v) { if(i<size) data[i]=v; }
    int  get(int i) const  { return data[i]; }
};

int main() {
    Buffer buf(3, "buf");
    buf.set(0, 10);
    Buffer copy = buf;        // invokes copy constructor
    cout << "buf[0]=" << buf.get(0) << " buf_copy[0]=" << copy.get(0) << "\\n";
    buf.set(0, 99);           // change buf — copy should be unaffected
    cout << "after buf[0]=99: buf[0]=" << buf.get(0) << " buf_copy[0]=" << copy.get(0) << "\\n";
    return 0;
}`;

const RULE5_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: constructed\\nmove constructed — source emptied\\ndestructed (no-op: nullptr)\\ndestructed

class UniqueArray {
    int* data;
    int  size;
public:
    UniqueArray(int sz) : data(new int[sz]), size(sz) { cout << "constructed\\n"; }

    // Move constructor: steal the data, leave source in valid-but-empty state
    UniqueArray(UniqueArray&& o) noexcept : data(o.data), size(o.size) {
        o.data = nullptr; o.size = 0;
        cout << "move constructed — source emptied\\n";
    }

    // Rule of Five: also need copy ctor, copy assignment, move assignment
    UniqueArray(const UniqueArray&) = delete;           // no copies allowed
    UniqueArray& operator=(const UniqueArray&) = delete;

    ~UniqueArray() {
        delete[] data;   // safe: delete nullptr is a no-op
        cout << "destructed\\n";
    }
};

int main() {
    UniqueArray a(5);
    UniqueArray b = move(a);   // move: a is now empty
    return 0;
}`;

const lesson = {
  id: "cpp-1-002",
  slug: "constructors-destructors-raii",
  chapter: "cpp-1",
  order: 2,
  title: "Constructors, Destructors & RAII",
  subtitle: "Lifecycle management — acquire in the constructor, release in the destructor",
  tags: ["c++", "cpp", "constructor", "destructor", "raii", "copy-constructor", "move", "rule-of-five"],
  aliases: [
    "c++ constructor",
    "c++ destructor",
    "RAII c++",
    "c++ copy constructor",
    "c++ rule of three",
  ],

  hook: `Every resource — memory, files, locks, sockets — must be acquired and released. C++ gives you a guarantee: when an object leaves scope, its destructor runs — always, even on exceptions. RAII (Resource Acquisition Is Initialization) uses this to make resource leaks structurally impossible.`,

  mentalModel: [
    "**Constructor runs when an object is created; destructor runs when it's destroyed.** Objects on the stack are destroyed when they leave scope. This order is guaranteed — even if exceptions are thrown. RAII exploits this: put 'acquire' in the constructor and 'release' in the destructor, and the cleanup is automatic.",
    "**The Rule of Three (or Five): if you define any of destructor, copy constructor, or copy assignment — define all three.** The default compiler-generated versions do shallow copies — they copy pointers, not the data they point to. Shallow copies lead to double-free and dangling-pointer bugs. If your class owns a resource, write deep copies.",
    "**Move semantics transfer ownership instead of copying.** The move constructor 'steals' the source's data and sets the source to a valid-but-empty state. This is O(1) for large objects — no copying. `std::move(x)` is a cast that enables the move constructor. After `b = std::move(a)`, `a` is empty.",
  ],

  intuition: {
    prose: [
      "**Scope = lifetime.** C++ objects live exactly as long as the `{}` block they're in. This is deterministic and predictable — unlike garbage collection, you know exactly when cleanup happens. The destructor fires at the closing `}` of the scope.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Lifecycle — run it then explore:**\n\n- Change `Widget b(\"B\", 42)` to be outside the inner braces — which destructor runs first?\n- Add a third Widget in main — trace the destruction order (reverse of construction).\n- Add `throw runtime_error(\"oops\")` inside the inner scope — does b's destructor still run? (Hint: yes — stack unwinding)\n- Remove the destructor — what changes? (Nothing visible, but the resource is 'leaked')",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CTOR_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**RAII pattern — run it then explore:**\n\n- Add `throw runtime_error(\"error\")` inside doWork — does the lock still get released?\n- Wrap the throw in a try/catch in main — does the output change?\n- Change the Lock to simulate a file: constructor opens, destructor closes.\n- What happens if you forget the Lock and just print 'acquired' manually? (No automatic release)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RAII_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Shallow copy is the bug.** Without a copy constructor, `Buffer copy = buf` copies the pointer `data` — now both objects point to the same memory. When either destructor runs, it deletes the memory. When the other destructor runs, it double-deletes — undefined behavior. Deep copy (allocating new memory and copying the data) prevents this.",
      "**Move semantics: steal, don't copy.** `UniqueArray b = move(a)` calls the move constructor which takes a's pointer and sets a's pointer to `nullptr`. Now b owns the data, a is empty. `delete nullptr` is a no-op, so a's destructor is safe. This is how `std::vector`, `std::string`, and other standard types efficiently transfer ownership.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Deep copy vs shallow copy — run it then explore:**\n\n- Remove the copy constructor and let the compiler generate one (shallow copy). Does `buf_copy[0]` change when you set `buf[0] = 99`? (Yes — they share the pointer)\n- Add a copy assignment operator: `Buffer& operator=(const Buffer& o) { ... }` — handle self-assignment.\n- What order do destructors run in? (Reverse of construction)\n- Add a print method and verify the copy is truly independent.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": COPY_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Move semantics — run it then explore:**\n\n- Try `UniqueArray c = a;` instead of `move(a)` — what error do you get? (copy is deleted)\n- After `UniqueArray b = move(a)`, try accessing `a`'s data — it's nullptr, don't dereference.\n- Change `= delete` on the copy constructor to the default. Now try `UniqueArray c = a` — does it compile? What happens when both destructors run?\n- Add `noexcept` to the move constructor — required for vector to use moves during reallocation.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RULE5_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "The Rule of Three/Five: define all or none",
        body: "If your class defines a destructor, copy constructor, or copy assignment operator — define all three (Rule of Three). In modern C++, also add move constructor and move assignment (Rule of Five). Or use the Rule of Zero: own no raw resources directly — use smart pointers and standard containers, which handle their own lifecycle.",
      },
      {
        type: "tip",
        title: "Rule of Zero: let the compiler do it",
        body: "If you use `unique_ptr`, `shared_ptr`, `vector`, `string` for all owned resources, you never need to write a destructor or copy/move constructor — the compiler-generated versions correctly call the members' own destructors. This is the modern C++ way: avoid raw `new`/`delete`.",
      },
    ],
  },

  examples: [
    {
      title: "RAII file handle",
      body: `#include <fstream>
class FileHandle {
    fstream file;
public:
    FileHandle(const string& path, ios::openmode mode)
        : file(path, mode) {
        if (!file) throw runtime_error("Cannot open: " + path);
    }
    // No destructor needed — fstream closes on destruction (RAII)
    fstream& get() { return file; }
};

void writeData(const string& path, const string& data) {
    FileHandle f(path, ios::out);
    f.get() << data;
}  // file automatically closed here`,
    },
    {
      title: "Self-assignment guard in copy assignment",
      body: `Buffer& operator=(const Buffer& other) {
    if (this == &other) return *this;  // self-assignment guard

    delete[] data;                     // free old memory

    size = other.size;
    data = new int[size];              // allocate new
    for (int i = 0; i < size; i++)
        data[i] = other.data[i];       // deep copy

    return *this;  // allow chaining: a = b = c
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write an `AutoTimer` RAII class. Constructor records `start = steady_clock::now()`. Destructor computes and prints the elapsed time in milliseconds. Use it to time a computation: put a `AutoTimer t;` at the start of a block, then do some work (a large loop), and the timing prints automatically when the scope ends.",
      hint: "`#include <chrono>`. `auto start = chrono::steady_clock::now();`. Elapsed: `chrono::duration_cast<chrono::milliseconds>(end - start).count()`.",
      walkthrough: [
        "#include <chrono> using namespace chrono;",
        "class AutoTimer { steady_clock::time_point start; public:",
        "AutoTimer() : start(steady_clock::now()) {}",
        "~AutoTimer() { auto end = now(); auto ms = duration_cast<milliseconds>(end-start).count(); cout << ms << \"ms\\n\"; }",
        "Test: { AutoTimer t; for (int i=0; i<1e8; i++); }",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `SmartArray<int>` class with Rule of Five. Support: constructor (allocate n ints), destructor (free), copy constructor (deep copy), copy assignment (deep copy + self-assignment guard), move constructor (steal + null source), move assignment (steal + null source + self-assignment). Print a message in each special member. Test all five operations in main.",
      hint: "Move constructor: steal `other.data`, set `other.data = nullptr`, set `other.size = 0`. Move assignment: same but also free this->data first.",
      walkthrough: [
        "private: int* data; int size;",
        "Constructor: data = new int[n]; size = n;",
        "Destructor: delete[] data;",
        "Copy ctor: new allocation + memcpy",
        "Copy assignment: self-check, delete old, new allocation + copy",
        "Move ctor: steal data/size, set other.data=nullptr",
        "Move assignment: self-check, delete old, steal, null other",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-002-q1",
        type: "choice",
        text: "When does a stack-allocated object's destructor run?",
        options: [
          "When the garbage collector decides to collect it",
          "When the object leaves its enclosing scope (closing `}`)",
          "When you explicitly call `delete` on it",
          "When the program exits",
        ],
        answer: 1,
        explanation:
          "Stack objects are destroyed deterministically when they leave their scope — the closing `}`. This happens even if an exception is thrown (stack unwinding). This is the foundation of RAII.",
      },
      {
        id: "cpp1-002-q2",
        type: "choice",
        text: "What is RAII?",
        options: [
          "Random Access Iteration Interface",
          "Resource Acquisition Is Initialization — own resources in constructor, release in destructor",
          "A design pattern where objects are allocated on the heap",
          "A way to prevent exceptions",
        ],
        answer: 1,
        explanation:
          "RAII ties resource lifetime to object lifetime. Acquire in the constructor, release in the destructor. Because the destructor always runs when the object goes out of scope, the resource release is guaranteed — even on exceptions.",
      },
      {
        id: "cpp1-002-q3",
        type: "choice",
        text: "What bug does a missing copy constructor cause for a class that owns a raw pointer?",
        options: [
          "The copy will always be empty",
          "Two objects share the same memory; when either destructor runs, the other has a dangling pointer",
          "The original object gets cleared after copying",
          "The program won't compile",
        ],
        answer: 1,
        explanation:
          "The compiler-generated copy constructor does a shallow copy — copies the pointer value, not the data. Two objects point to the same heap memory. The first destructor deletes it. The second destructor double-deletes it — undefined behavior (usually a crash).",
      },
      {
        id: "cpp1-002-q4",
        type: "choice",
        text: "What does `UniqueArray b = std::move(a)` do?",
        options: [
          "Copies a into b and then deletes a",
          "Calls a's move constructor — b steals a's data, a is left in a valid-but-empty state",
          "Creates a shallow copy of a in b",
          "Nothing — move is only valid for rvalue temporaries",
        ],
        answer: 1,
        explanation:
          "`std::move(a)` casts `a` to an rvalue reference, triggering the move constructor. The move constructor 'steals' a's internal pointer (setting a's pointer to nullptr) and stores it in b. a is now empty but destructible (delete nullptr is safe).",
      },
    ],
  },
};

export default lesson;
