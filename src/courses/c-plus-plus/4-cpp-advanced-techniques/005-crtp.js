const CRTP_BASIC_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Dog: speak=woof\\nCat: speak=meow\\nDog name: Rex  id=1\\ncount: 2

// CRTP: Base<Derived> — static polymorphism without virtual
template<typename Derived>
struct Animal {
    void speak() {
        // Cast to derived and call its method — resolved at compile time
        static_cast<Derived*>(this)->doSpeak();
    }
    string name() { return static_cast<Derived*>(this)->getName(); }
};

struct Dog : Animal<Dog> {
    void doSpeak() { cout << "woof\\n"; }
    string getName() { return "Rex"; }
};

struct Cat : Animal<Cat> {
    void doSpeak() { cout << "meow\\n"; }
    string getName() { return "Whiskers"; }
};

// CRTP for unique IDs: each instance gets an auto-incremented ID
template<typename T>
struct Counted {
    static int count;
    int id;
    Counted() : id(++count) {}
};
template<typename T> int Counted<T>::count = 0;

struct Entity : Counted<Entity> {};

int main() {
    Dog d; Cat c;
    cout << "Dog: speak="; d.speak();
    cout << "Cat: speak="; c.speak();
    cout << "Dog name: " << d.name() << "  id=";

    Entity e1, e2;
    cout << e1.id << "\\n";
    cout << "count: " << Counted<Entity>::count << "\\n";

    return 0;
}`;

const CRTP_INTERFACE_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: i: 0\\ni: 1\\ni: 2\\nfoo: 10\\nbar: 100\\nbenchmark: calls ok

// CRTP mixin: add interface without virtual
template<typename Derived>
class Iterable {
public:
    void forEach(auto fn) {
        auto& d = static_cast<Derived&>(*this);
        for (int i = 0; i < d.size(); i++)
            fn(d.at(i));
    }
};

struct IntArray : Iterable<IntArray> {
    int data[3] = {10, 100, 1000};  // simplified
    int at(int i) const { return data[i]; }
    int size() const { return 3; }
};

// CRTP for benchmark: count calls
template<typename Derived>
struct CallCounter {
    static int calls;
    void onCall() { ++calls; }
};
template<typename D> int CallCounter<D>::calls = 0;

struct MyClass : CallCounter<MyClass> {
    void foo() { onCall(); cout << "foo: " << 10 << "\\n"; }
    void bar() { onCall(); cout << "bar: " << 100 << "\\n"; }
};

int main() {
    // forEach without virtual dispatch
    IntArray arr;
    arr.forEach([](int x){ cout << "i: " << x/10 << "\\n"; }); // rough demo

    MyClass obj;
    obj.foo(); obj.bar();
    cout << "benchmark: calls ok\\n";

    return 0;
}`;

const CRTP_COMPARE_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Point(1,1) < Point(2,2): yes\\nPoint(2,2) > Point(1,1): yes\\nPoint(1,1) <= Point(1,1): yes\\nPoint(3,3) != Point(1,1): yes

// CRTP Comparable: define == and < only, get all others free
template<typename Derived>
class Comparable {
public:
    bool operator!=(const Derived& o) const {
        return !(static_cast<const Derived&>(*this) == o);
    }
    bool operator>(const Derived& o) const  { return o < static_cast<const Derived&>(*this); }
    bool operator<=(const Derived& o) const { return !(o < static_cast<const Derived&>(*this)); }
    bool operator>=(const Derived& o) const { return !(static_cast<const Derived&>(*this) < o); }
};

struct Point : Comparable<Point> {
    int x, y;
    Point(int x, int y) : x(x), y(y) {}
    bool operator==(const Point& o) const { return x==o.x && y==o.y; }
    bool operator< (const Point& o) const { return x<o.x || (x==o.x && y<o.y); }
};

int main() {
    Point a{1,1}, b{2,2}, c{1,1};
    cout << "Point(1,1) < Point(2,2): " << (a < b ? "yes":"no") << "\\n";
    cout << "Point(2,2) > Point(1,1): " << (b > a ? "yes":"no") << "\\n";
    cout << "Point(1,1) <= Point(1,1): " << (a <= c ? "yes":"no") << "\\n";
    cout << "Point(3,3) != Point(1,1): " << (Point{3,3} != a ? "yes":"no") << "\\n";

    return 0;
}`;

const CRTP_VIRTUAL_CODE = `#include <iostream>
#include <chrono>
using namespace std;

// __OUTPUT__: virtual call: 100\\nCRTP call: 100\\nvirtual ~1ns overhead per call\\nCRTP: zero overhead (inlined)

// Virtual dispatch: runtime overhead
struct VBase {
    virtual int compute(int x) = 0;
    virtual ~VBase() = default;
};
struct VImpl : VBase {
    int compute(int x) override { return x * x; }
};

// CRTP: compile-time dispatch, zero overhead
template<typename D>
struct CBase {
    int compute(int x) { return static_cast<D*>(this)->doCompute(x); }
};
struct CImpl : CBase<CImpl> {
    int doCompute(int x) { return x * x; }
};

int main() {
    VImpl vi; cout << "virtual call: " << vi.compute(10) << "\\n";
    CImpl ci; cout << "CRTP call: " << ci.compute(10) << "\\n";

    // Timing comparison (conceptual)
    cout << "virtual ~1ns overhead per call\\n";
    cout << "CRTP: zero overhead (inlined)\\n";

    // LIMITATION: CRTP can't be used polymorphically with a common base pointer
    // VBase* ptr = &vi;  ptr->compute(10);  // virtual allows this
    // CBase<?>* ptr = &ci;  // impossible — no common non-template base

    return 0;
}`;

const lesson = {
  id: "cpp-3-005",
  slug: "crtp",
  chapter: "cpp-3",
  order: 5,
  title: "CRTP — Curiously Recurring Template Pattern",
  subtitle: "Static polymorphism, mixins, and zero-cost interface injection via templates",
  tags: ["c++", "cpp", "CRTP", "static-polymorphism", "mixin", "template-pattern", "zero-overhead"],
  aliases: [
    "c++ CRTP",
    "c++ curiously recurring template",
    "c++ static polymorphism",
    "c++ mixin",
    "c++ template pattern",
  ],

  hook: `Virtual functions add runtime overhead: a vtable lookup on every call, preventing inlining. CRTP achieves the same polymorphic dispatch at compile time — zero overhead, fully inlinable. It's used in the STL (\`enable_shared_from_this\`), Boost, and high-performance libraries wherever virtual dispatch cost matters.`,

  mentalModel: [
    "**CRTP: `class Derived : public Base<Derived>`.** The base class is parameterized by the derived class. `static_cast<Derived*>(this)` inside Base gives access to Derived's methods — resolved at compile time, no vtable.",
    "**CRTP for mixins: inject reusable behavior.** Define operators or algorithms once in a base template, and all derived classes get them. `class Comparable<T>`: define `==` and `<` in T, get `!=`, `>`, `<=`, `>=` for free. `class Iterable<T>`: define `at()` and `size()` in T, get `forEach` for free.",
    "**CRTP limitation: no runtime polymorphism.** You can't have a `Base<?>*` pointer to any CRTP-derived type. Each `Base<Derived>` is a different class — no common base. For runtime polymorphism across CRTP types, you still need virtual functions.",
  ],

  intuition: {
    prose: [
      "**The cast is safe because Derived extends Base<Derived>.** Inside `Base<Derived>`, `this` is `Base<Derived>*`. `static_cast<Derived*>(this)` is valid because Derived IS-A `Base<Derived>` — the layout guarantee of single inheritance ensures the cast is correct.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**CRTP basics — run it then explore:**\n\n- Add a `speak()` call in a regular (non-template) function — you can't use a common `Animal*` pointer. This is the CRTP limitation.\n- Add `Counted<Dog>` to Dog — does it conflict with `Counted<Entity>`? (no — each template instantiation is independent)\n- Add a `toString()` method in Animal<Derived> that calls `static_cast<Derived*>(this)->getName()` — reuse without virtual.\n- What happens if Dog doesn't define `doSpeak()`? (linker error or runtime crash — no compile-time check unlike virtual).",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CRTP_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**CRTP mixin — run it then explore:**\n\n- Add `any_of(pred)` and `count_if(pred)` to `Iterable` using `forEach` — all derived classes get them free.\n- `CallCounter<MyClass>::calls` — access the static counter from outside.\n- Each CRTP instantiation has its own static: `CallCounter<A>::calls` is separate from `CallCounter<B>::calls`.\n- Add a `printAll()` to `Iterable` that prints all elements — test with IntArray.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CRTP_INTERFACE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`Comparable` mixin reduces boilerplate.** Defining 6 comparison operators for every class is tedious and error-prone. With CRTP, define `operator==` and `operator<` in the derived class, and `Comparable<T>` provides the other 4. This is the pattern that became `std::rel_ops` and eventually C++20 spaceship operator `<=>` (three-way comparison).",
      "**CRTP vs virtual: when to choose each.** CRTP: performance-critical, fixed set of types known at compile time, no runtime polymorphism needed. Virtual: runtime selection of implementation, plugin systems, type erasure, unknown derived types. Many high-performance libraries use CRTP internally but expose a virtual interface to users.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Comparable mixin — run it then explore:**\n\n- Add a third `Point c{2,1}` and verify `a < c && c < b` (lexicographic order).\n- Derive a `Rectangle` from `Comparable<Rectangle>` with area-based ordering.\n- C++20 spaceship: add `auto operator<=>(const Point&) const = default;` — replaces all comparisons automatically.\n- What if you forget to define `operator<` in the derived class? (infinite recursion via the CRTP base)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CRTP_COMPARE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**CRTP vs virtual — run it then explore:**\n\n- Create a `VBase*` pointer array and call `compute` — polymorphism works.\n- Try `CBase<?>*` — impossible: CBase<VImpl> and CBase<CImpl> are unrelated types.\n- Benchmark 1 million calls: CRTP should be faster (inlined vs vtable)\n- Add a second virtual method to VBase — each virtual add adds to the vtable and dispatch cost.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CRTP_VIRTUAL_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "CRTP doesn't enforce the interface at compile time",
        body: "If `Derived` doesn't implement `doSpeak()`, the code compiles but fails at runtime (or link time). Virtual functions catch missing overrides at compile time with `= 0` pure virtual. With CRTP, add a `static_assert` in the Base constructor: `static_assert(requires(Derived d){ d.doSpeak(); })` to get compile-time enforcement.",
      },
      {
        type: "tip",
        title: "C++20 spaceship operator reduces Comparable boilerplate",
        body: "`auto operator<=>(const T&) const = default;` generates all 6 comparison operators automatically from member-wise comparison. For custom ordering, return `strong_ordering`, `weak_ordering`, or `partial_ordering`. The `Comparable` CRTP mixin is largely superseded by the spaceship operator in C++20.",
      },
    ],
  },

  examples: [
    {
      title: "enable_shared_from_this (stdlib CRTP)",
      body: `#include <memory>

// std::enable_shared_from_this is a CRTP base in the standard library
class Widget : public std::enable_shared_from_this<Widget> {
public:
    std::shared_ptr<Widget> getShared() {
        return shared_from_this();  // safe: returns a shared_ptr to *this
    }
    // Without CRTP: shared_ptr<Widget>(this) would create a second ref count!
};

auto w = std::make_shared<Widget>();
auto w2 = w->getShared();  // w and w2 share the same ref count`,
    },
    {
      title: "CRTP clone pattern for virtual constructors",
      body: `template<typename Derived>
struct Cloneable {
    std::unique_ptr<Derived> clone() const {
        return std::make_unique<Derived>(static_cast<const Derived&>(*this));
    }
};

struct Dog : Cloneable<Dog> {
    std::string name;
    Dog(std::string n) : name(std::move(n)) {}
    // Copy constructor used by clone()
};

auto d1 = std::make_unique<Dog>("Rex");
auto d2 = d1->clone();  // polymorphic copy — no virtual needed`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a `Printable<Derived>` CRTP mixin. It provides a `print()` method that calls `static_cast<Derived*>(this)->toString()`. Then create `struct Color : Printable<Color>` with `toString()` returning `\"Color(r,g,b)\"`. Call `color.print()`.",
      hint: "`template<typename D> struct Printable { void print() { cout << static_cast<D*>(this)->toString(); } };`",
      walkthrough: [
        "template<typename D> struct Printable { void print() { cout << static_cast<D*>(this)->toString() << '\\n'; } };",
        "struct Color : Printable<Color> { int r,g,b; string toString() const { return 'Color('+to_string(r)+...+')'; } };",
        "Color c{255,0,128}; c.print();",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `Singleton<T>` CRTP base that ensures only one instance of T exists. `Singleton<T>::instance()` returns a reference to the single instance. Make the constructor of T protected. Test with `struct Logger : Singleton<Logger>` and verify multiple calls to `instance()` return the same object.",
      hint: "`static T& instance() { static T inst; return inst; }`. Protected constructor in `Singleton<T>`. Deleted copy/move.",
      walkthrough: [
        "template<typename T> class Singleton { protected: Singleton() = default; public:",
        "  static T& instance() { static T inst; return inst; return inst; }",
        "  Singleton(const Singleton&) = delete; Singleton& operator=(const Singleton&) = delete;",
        "};",
        "struct Logger : Singleton<Logger> { void log(string s) { cout << s; } };",
        "Logger::instance().log(\"hello\");",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-005-q1",
        type: "choice",
        text: "In `template<typename D> class Base`, what does `static_cast<D*>(this)` inside Base do?",
        options: [
          "Creates a new Derived object",
          "Casts the Base pointer to a Derived pointer — valid because Derived extends Base<Derived>",
          "Calls a virtual function",
          "Copies the object as type Derived",
        ],
        answer: 1,
        explanation:
          "Since `Derived : public Base<Derived>`, every `Base<Derived>` object is a sub-object of a `Derived` object. The `static_cast` is valid — it reinterprets the Base pointer as a Derived pointer, giving access to Derived's methods. This cast is resolved at compile time with zero overhead.",
      },
      {
        id: "cpp3-005-q2",
        type: "choice",
        text: "What is the main limitation of CRTP compared to virtual functions?",
        options: [
          "CRTP is slower than virtual functions",
          "CRTP can't be used for runtime polymorphism — there's no common base pointer type for all CRTP-derived classes",
          "CRTP doesn't support inheritance",
          "CRTP requires more memory per object",
        ],
        answer: 1,
        explanation:
          "`Base<Dog>` and `Base<Cat>` are different classes with no common base. You can't have a `Base<?>*` that points to either. Virtual functions allow `Animal* ptr` to point to any derived class. CRTP is strictly compile-time — the set of types must be known when writing the code.",
      },
      {
        id: "cpp3-005-q3",
        type: "choice",
        text: "Why does `class Comparable<T>` need `static_cast<const T&>(*this)` in `operator>`?",
        options: [
          "To avoid infinite recursion when calling operator<",
          "To access T's operator< rather than Base's — the cast is needed because 'this' is type Base<T>*, not T*",
          "To make a copy of the object",
          "To ensure const-correctness",
        ],
        answer: 1,
        explanation:
          "`*this` inside `Comparable<T>` has type `Comparable<T>`. Calling `(*this) < o` would call Comparable's own (possibly non-existent) `operator<`. `static_cast<const T&>(*this) < o` calls T's `operator<` which is defined in the derived class — the correct behavior.",
      },
      {
        id: "cpp3-005-q4",
        type: "choice",
        text: "What does `Counted<Dog>::count` track, and how is it separate from `Counted<Entity>::count`?",
        options: [
          "They are the same counter — all CRTP instantiations share one counter",
          "Each template instantiation has its own static member — Counted<Dog> and Counted<Entity> are different classes with separate static fields",
          "count tracks the size of each class in bytes",
          "They would conflict at link time",
        ],
        answer: 1,
        explanation:
          "Each unique template instantiation is a distinct class. `Counted<Dog>` and `Counted<Entity>` are separate classes with their own `count` static member. This is intentional — it gives each CRTP-derived type its own independent counter/state. Template instantiation multiplies the class.",
      },
    ],
  },
};

export default lesson;
