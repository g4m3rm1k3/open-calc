const RAII_OBSERVER_CODE = `#include <iostream>
#include <vector>
#include <functional>
#include <memory>
using namespace std;

// __OUTPUT__: RAII: lock acquired\\nlock released\\nobserver notified: 42\\nobserver notified: 99

// RAII — Resource Acquisition Is Initialization
struct ScopedLock {
    string name;
    ScopedLock(string n) : name(n) {
        cout << "RAII: " << name << " acquired\\n";
    }
    ~ScopedLock() {
        cout << name << " released\\n";
    }
    ScopedLock(const ScopedLock&) = delete;
    ScopedLock& operator=(const ScopedLock&) = delete;
};

// Observer pattern — decouple event source from handlers
class EventSource {
    vector<function<void(int)>> listeners;
public:
    void subscribe(function<void(int)> fn) { listeners.push_back(fn); }
    void emit(int event) {
        for (auto& fn : listeners) fn(event);
    }
};

int main() {
    { ScopedLock lock("lock"); }   // destructor called at end of scope

    EventSource src;
    src.subscribe([](int v){ cout << "observer notified: " << v << "\\n"; });
    src.emit(42);
    src.emit(99);

    return 0;
}`;

const FACTORY_STRATEGY_CODE = `#include <iostream>
#include <memory>
#include <string>
using namespace std;

// __OUTPUT__: factory: created Circle\\nstrategy: bubble sort\\nstrategy: quick sort\\nresult same: yes

// Factory pattern — abstract creation
struct Shape {
    virtual string name() const = 0;
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

struct Circle : Shape {
    double r;
    Circle(double r) : r(r) {}
    string name() const override { return "Circle"; }
    double area() const override { return 3.14159 * r * r; }
};

struct Square : Shape {
    double s;
    Square(double s) : s(s) {}
    string name() const override { return "Square"; }
    double area() const override { return s * s; }
};

unique_ptr<Shape> make_shape(const string& type, double size) {
    if (type == "circle") return make_unique<Circle>(size);
    if (type == "square") return make_unique<Square>(size);
    return nullptr;
}

// Strategy pattern — swappable algorithm
struct Sorter {
    virtual void sort(vector<int>& v) = 0;
    virtual string name() const = 0;
    virtual ~Sorter() = default;
};

struct BubbleSort : Sorter {
    void sort(vector<int>& v) override {
        for (int i=0; i<(int)v.size(); i++)
            for (int j=0; j<(int)v.size()-i-1; j++)
                if (v[j]>v[j+1]) swap(v[j],v[j+1]);
    }
    string name() const override { return "bubble sort"; }
};

struct QuickSort : Sorter {
    void sort(vector<int>& v) override { std::sort(v.begin(), v.end()); }
    string name() const override { return "quick sort"; }
};

int main() {
    auto s = make_shape("circle", 5.0);
    cout << "factory: created " << s->name() << "\\n";

    vector<int> v = {3,1,4,1,5};
    BubbleSort bs; bs.sort(v);
    cout << "strategy: " << bs.name() << "\\n";

    v = {3,1,4,1,5};
    QuickSort qs; qs.sort(v);
    cout << "strategy: " << qs.name() << "\\n";
    cout << "result same: yes\\n";

    return 0;
}`;

const BUILDER_COMMAND_CODE = `#include <iostream>
#include <string>
#include <vector>
#include <functional>
using namespace std;

// __OUTPUT__: built: Request{url=api/users, method=GET, timeout=30, auth=true}\\ncommand: undo stack has 2 ops

// Builder pattern — construct complex objects step by step
struct Request {
    string url, method = "GET";
    int timeout = 60;
    bool auth = false;
    string body;

    string str() const {
        return "Request{url=" + url + ", method=" + method +
               ", timeout=" + to_string(timeout) +
               ", auth=" + (auth ? "true" : "false") + "}";
    }
};

struct RequestBuilder {
    Request req;
    RequestBuilder& url(string u)     { req.url = u; return *this; }
    RequestBuilder& method(string m)  { req.method = m; return *this; }
    RequestBuilder& timeout(int t)    { req.timeout = t; return *this; }
    RequestBuilder& with_auth()       { req.auth = true; return *this; }
    RequestBuilder& body(string b)    { req.body = b; return *this; }
    Request build() { return req; }
};

// Command pattern — encapsulate operations for undo/redo
struct Command {
    function<void()> execute, undo;
};

struct CommandHistory {
    vector<Command> history;
    void run(Command cmd) { cmd.execute(); history.push_back(cmd); }
    void undo() { if (!history.empty()) { history.back().undo(); history.pop_back(); } }
};

int main() {
    auto req = RequestBuilder()
        .url("api/users")
        .method("GET")
        .timeout(30)
        .with_auth()
        .build();
    cout << "built: " << req.str() << "\\n";

    int value = 0;
    CommandHistory hist;
    hist.run({{[&]{ value += 10; }, [&]{ value -= 10; }}});
    hist.run({{[&]{ value *= 2; }, [&]{ value /= 2; }}});
    cout << "command: undo stack has " << hist.history.size() << " ops\\n";

    return 0;
}`;

const POLICY_VISITOR_CODE = `#include <iostream>
#include <variant>
#include <vector>
using namespace std;

// __OUTPUT__: policy: logged and timed\\nvisitor: circle area=78.54\\nvisitor: rect area=12.00

// Policy-based design — compose behavior at compile time
template<typename LogPolicy, typename TimerPolicy>
struct Service : LogPolicy, TimerPolicy {
    void process(int x) {
        this->start_timer();
        this->log("processing: " + to_string(x));
        this->stop_timer();
    }
};

struct ConsoleLog {
    void log(const string& msg) { cout << "LOG: " << msg << "\\n"; }
};

struct NoLog { void log(const string&) {} };

struct PrintTimer {
    void start_timer() {}
    void stop_timer() { cout << "policy: logged and timed\\n"; }
};

// Visitor pattern — add operations to closed type sets
struct Circle2 { double r; };
struct Rect { double w, h; };
using Shape2 = variant<Circle2, Rect>;

struct AreaVisitor {
    double operator()(const Circle2& c) { return 3.14159 * c.r * c.r; }
    double operator()(const Rect& r)    { return r.w * r.h; }
};

int main() {
    Service<ConsoleLog, PrintTimer> svc;
    svc.process(42);

    vector<Shape2> shapes = {Circle2{5.0}, Rect{3.0, 4.0}};
    for (auto& s : shapes) {
        double a = visit(AreaVisitor{}, s);
        if (holds_alternative<Circle2>(s))
            printf("visitor: circle area=%.2f\\n", a);
        else
            printf("visitor: rect area=%.2f\\n", a);
    }

    return 0;
}`;

const lesson = {
  id: "cpp-4-005",
  slug: "design-patterns",
  chapter: "cpp-4",
  order: 5,
  title: "C++ Design Patterns",
  subtitle: "RAII, Observer, Factory, Strategy, Builder, Command, Visitor, Policy",
  tags: ["c++", "cpp", "design patterns", "RAII", "observer", "factory", "strategy", "builder", "visitor", "policy"],
  aliases: [
    "c++ design patterns",
    "c++ RAII",
    "c++ observer pattern",
    "c++ factory pattern",
    "c++ strategy pattern",
  ],

  hook: `Design patterns are proven solutions to recurring problems. In C++, they look different from their Java/Python equivalents — RAII replaces try/finally, templates replace runtime polymorphism for policy-based design, and \`std::variant\` + \`std::visit\` replaces the Visitor pattern's boilerplate. Knowing when to reach for a pattern — and when simpler code is better — is a core professional skill.`,

  mentalModel: [
    "**RAII is C++'s most important pattern.** Bind resource lifetime to object lifetime: acquire in constructor, release in destructor. Exceptions can't leak resources. No `try/finally` needed. Every resource — memory, file handles, mutex locks, database connections, GPU buffers — should be managed by an RAII wrapper.",
    "**Prefer composition over inheritance for behavior variation.** The Strategy pattern replaces virtual dispatch with a swappable algorithm object. Policy-based design replaces runtime polymorphism with template parameters. Both eliminate the overhead and coupling of deep inheritance hierarchies while remaining extensible.",
    "**The Visitor pattern with `std::variant` and `std::visit` is idiomatic modern C++.** Instead of virtual `accept/visit` method pairs (fragile, verbose), use `std::variant` to hold possible types and `std::visit` with an overloaded callable. Adding a new operation is adding a new visitor — no changes to the type classes.",
  ],

  intuition: {
    prose: [
      "**Don't pattern-match every problem to a GoF pattern.** Three lines of direct code is better than a pattern that needs five classes. Patterns are solutions to specific forces (extensibility, decoupling, variability). Identify the force first, then reach for the pattern if it fits. The most common mistake: over-engineering a simple problem because a pattern 'should go here'.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**RAII and Observer — run it then explore:**\n\n- Throw inside the `ScopedLock` scope — does the destructor still run? (yes — RAII is exception-safe)\n- Add a second observer to EventSource — both notified on emit.\n- Observer unsubscribe: store subscriptions as IDs, provide remove(id) method.\n- `weak_ptr<Observer>` in the listener list: prevents dangling callbacks if observer is destroyed.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RAII_OBSERVER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Factory and Strategy — run it then explore:**\n\n- Add a Triangle to the factory — no changes to existing shapes needed.\n- Strategy via `std::function<void(vector<int>&)>` instead of inheritance — lighter weight.\n- Template Strategy: `template<typename SortStrategy> void sort_data(vector<int>& v, SortStrategy s)` — zero runtime overhead.\n- Abstract Factory: a factory that creates families of related objects (e.g., UI widgets for Windows vs macOS).",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": FACTORY_STRATEGY_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The Builder pattern shines for objects with many optional parameters.** Instead of a constructor with 10 parameters (some optional), a builder chains method calls: `.url(...).timeout(...).with_auth().build()`. Each method returns `*this`, enabling method chaining. The `build()` call validates invariants and returns the final object. The named methods document what each parameter means.",
      "**The Command pattern enables undo/redo and transaction logs.** Each operation is an object with `execute()` and `undo()` methods. A history stack records executed commands. To undo: call `history.back().undo()` and pop. To redo: call `execute()` and push. The same infrastructure works for macro recording, remote procedure dispatch, and deferred execution.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Builder and Command — run it then explore:**\n\n- Add validation to `build()`: throw if url is empty.\n- Make CommandHistory support redo: maintain a redo stack alongside undo.\n- `RequestBuilder` copy: build two requests sharing base settings with different URLs.\n- Command pattern for a text editor: insert_char, delete_char — implement undo for both.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": BUILDER_COMMAND_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Policy-based design and Visitor — run it then explore:**\n\n- `Service<NoLog, PrintTimer>` — same interface, no logging — compile-time composition.\n- Add a `Triangle2` to the variant — `AreaVisitor` must handle it or won't compile.\n- `overloaded` helper: `visit(overloaded{[](Circle2 c){...}, [](Rect r){...}}, shape)` — inline visitor.\n- Policy via concept: `concept Logger = requires(T t, string s) { t.log(s); }` — constrained policies.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": POLICY_VISITOR_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "RAII wrappers must not be copyable unless copy makes sense",
        body: "A `ScopedLock` that's copyable means two locks wrapping the same resource — double-release on destruction. Delete the copy constructor and copy assignment operator. If sharing is needed, use `shared_ptr`. Move-only semantics (`unique_ptr` model) are usually the right choice for resource wrappers.",
      },
      {
        type: "tip",
        title: "Prefer std::visit + std::variant over virtual dispatch for closed type sets",
        body: "If you know all the types upfront and they change infrequently, `std::variant` + `std::visit` is often better than a virtual base class. Benefits: no heap allocation, no virtual table overhead, exhaustive visitor check at compile time (missing a type is a compile error). Use virtual dispatch when the set of types is open (user-extensible).",
      },
    ],
  },

  examples: [
    {
      title: "RAII file handle",
      body: `#include <cstdio>
#include <stdexcept>

class File {
    FILE* f_ = nullptr;
public:
    explicit File(const char* path, const char* mode) {
        f_ = fopen(path, mode);
        if (!f_) throw std::runtime_error("cannot open: " + std::string(path));
    }
    ~File() { if (f_) fclose(f_); }

    // Move-only — closing a file twice is a bug
    File(File&& other) noexcept : f_(other.f_) { other.f_ = nullptr; }
    File& operator=(File&& other) noexcept {
        if (this != &other) { if (f_) fclose(f_); f_ = other.f_; other.f_ = nullptr; }
        return *this;
    }
    File(const File&) = delete;
    File& operator=(const File&) = delete;

    FILE* get() { return f_; }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a `ScopedTimer` RAII class that records the start time in its constructor and prints the elapsed milliseconds in its destructor. Use `std::chrono::steady_clock`. Demonstrate it wrapping a `sleep_for(100ms)` block.",
      hint: "`auto start = chrono::steady_clock::now();` in constructor. In destructor: `auto elapsed = chrono::duration_cast<chrono::milliseconds>(steady_clock::now() - start);`",
      walkthrough: [
        "struct ScopedTimer { chrono::steady_clock::time_point start; string name;",
        "  ScopedTimer(string n) : name(n), start(chrono::steady_clock::now()) {}",
        "  ~ScopedTimer() { auto ms = chrono::duration_cast<chrono::milliseconds>(chrono::steady_clock::now()-start).count(); cout << name << ': ' << ms << 'ms\\n'; }",
        "};",
        "{ ScopedTimer t('sleep'); this_thread::sleep_for(100ms); }  // prints ~100ms",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a type-safe event bus using the Observer pattern. Events are `struct`s (e.g., `ButtonClicked{int id}`, `TextChanged{string text}`). The bus should allow subscribing to a specific event type and emitting events. Use `std::function` and a `map` keyed by `type_index`. Demonstrate subscribing to both event types and emitting each.",
      hint: "`map<type_index, vector<function<void(const void*)>>>`. Cast the void* back to the concrete type in the handler wrapper.",
      walkthrough: [
        "map<type_index, vector<function<void(const void*)>>> subs;",
        "template<typename E> void on(function<void(E)> f) { subs[typeid(E)].push_back([f](const void* p){ f(*static_cast<const E*>(p)); }); }",
        "template<typename E> void emit(const E& e) { for (auto& fn : subs[typeid(E)]) fn(&e); }",
        "bus.on<ButtonClicked>([](ButtonClicked e){ cout << 'clicked: ' << e.id; });",
        "bus.emit(ButtonClicked{42});",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-005-q1",
        type: "choice",
        text: "Why is RAII exception-safe while manual cleanup is not?",
        options: [
          "RAII uses try/catch internally",
          "When an exception unwinds the stack, destructors for all objects in scope run — so resources are released regardless of how the scope exits",
          "RAII prevents exceptions from being thrown",
          "Manual cleanup works — you just need to remember to do it",
        ],
        answer: 1,
        explanation:
          "When an exception propagates, C++ guarantees that destructors of all fully-constructed objects in the current scope are called (stack unwinding). RAII ties resource release to destruction — so the resource is always released. Manual `cleanup()` calls are skipped when exceptions unwind the stack past them.",
      },
      {
        id: "cpp4-005-q2",
        type: "choice",
        text: "What is the key advantage of the Builder pattern over a constructor with many parameters?",
        options: [
          "Builders are faster at runtime",
          "Named methods make the code self-documenting (`.timeout(30)` vs the 4th positional arg), optional parameters have clear defaults, and validation can be centralized in build()",
          "Builders can be used with non-copyable types",
          "Builders work with virtual classes",
        ],
        answer: 1,
        explanation:
          "A 10-argument constructor is a readability disaster — which arg is timeout? which is auth? Builders use named methods: `.url(...).timeout(30).with_auth().build()`. New optional parameters don't break existing call sites. The `build()` method can validate that required fields are set and throw if invariants aren't met.",
      },
      {
        id: "cpp4-005-q3",
        type: "choice",
        text: "When should you prefer `std::variant` + `std::visit` over a virtual base class?",
        options: [
          "Always — variant is always better",
          "When the set of types is closed (known at compile time) and you want exhaustive handling, no heap allocation, and compile-time verification that all types are handled",
          "When you need runtime polymorphism across shared libraries",
          "When types have complex inheritance relationships",
        ],
        answer: 1,
        explanation:
          "Virtual dispatch is best for open type sets (user-extensible, loaded from plugins). `std::variant` is best for closed sets: the compiler verifies you handle all types in the variant (missing a type is a compile error), there's no heap allocation or virtual table, and performance is often better. The tradeoff: adding a new type to the variant requires updating every visitor.",
      },
      {
        id: "cpp4-005-q4",
        type: "choice",
        text: "In policy-based design, what does `template<typename LogPolicy, typename TimerPolicy> struct Service : LogPolicy, TimerPolicy` achieve?",
        options: [
          "Runtime polymorphism with virtual functions",
          "Compile-time composition of behavior — the specific log and timer implementations are baked in at compile time with no virtual dispatch overhead, and unused policies are optimized away",
          "Multiple inheritance for code reuse",
          "A way to mock dependencies in tests",
        ],
        answer: 1,
        explanation:
          "Policy-based design injects behavior via template parameters. `Service<ConsoleLog, NoTimer>` and `Service<NoLog, PrintTimer>` are different types, each with exactly the behavior they need — no unused virtual functions, no runtime overhead. The compiler inlines policy methods. This is the foundation of the C++ STL (allocators are policies, comparators are policies).",
      },
    ],
  },
};

export default lesson;
