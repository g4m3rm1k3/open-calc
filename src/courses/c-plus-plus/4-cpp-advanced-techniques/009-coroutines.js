const CORO_BASICS_CODE = `#include <iostream>
#include <coroutine>
using namespace std;

// __OUTPUT__: generator created\\nfirst: 1\\nsecond: 2\\nthird: 3\\ndone

struct Generator {
    struct promise_type {
        int current;
        Generator get_return_object() { return Generator{handle_type::from_promise(*this)}; }
        suspend_always initial_suspend() { return {}; }
        suspend_always final_suspend() noexcept { return {}; }
        suspend_always yield_value(int v) { current = v; return {}; }
        void return_void() {}
        void unhandled_exception() { terminate(); }
    };
    using handle_type = coroutine_handle<promise_type>;
    handle_type h;
    ~Generator() { if (h) h.destroy(); }

    int next() {
        h.resume();
        return h.promise().current;
    }
    bool done() { return h.done(); }
};

Generator count_up(int n) {
    for (int i = 1; i <= n; i++)
        co_yield i;
}

int main() {
    auto gen = count_up(3);
    cout << "generator created\\n";
    cout << "first: " << gen.next() << "\\n";
    cout << "second: " << gen.next() << "\\n";
    cout << "third: " << gen.next() << "\\n";
    cout << "done\\n";
    return 0;
}`;

const AWAIT_CODE = `#include <iostream>
#include <coroutine>
using namespace std;

// __OUTPUT__: task started\\nsuspended — doing other work\\nresumed\\ntask done: 42

struct Task {
    struct promise_type {
        int result;
        Task get_return_object() { return Task{handle_type::from_promise(*this)}; }
        suspend_never initial_suspend() { return {}; }   // runs immediately
        suspend_always final_suspend() noexcept { return {}; }
        void return_value(int v) { result = v; }
        void unhandled_exception() { terminate(); }
    };
    using handle_type = coroutine_handle<promise_type>;
    handle_type h;
    ~Task() { if (h) h.destroy(); }

    // Custom awaitable: suspends the coroutine
    struct Suspend {
        bool await_ready() { return false; }          // always suspend
        void await_suspend(coroutine_handle<>) {}     // do nothing (manual resume)
        void await_resume() {}
    };

    int get() { return h.promise().result; }
    void resume() { h.resume(); }
};

Task my_task() {
    cout << "task started\\n";
    co_await Task::Suspend{};      // suspend here
    cout << "resumed\\n";
    co_return 42;
}

int main() {
    auto t = my_task();
    cout << "suspended — doing other work\\n";
    t.resume();
    cout << "task done: " << t.get() << "\\n";
    return 0;
}`;

const GENERATOR_CODE = `#include <iostream>
#include <coroutine>
#include <optional>
using namespace std;

// __OUTPUT__: fibonacci: 0 1 1 2 3 5 8 13 21 34\\nfiltered evens: 0 2 8 34

template<typename T>
struct Gen {
    struct promise_type {
        optional<T> val;
        Gen get_return_object() { return {coroutine_handle<promise_type>::from_promise(*this)}; }
        suspend_always initial_suspend() { return {}; }
        suspend_always final_suspend() noexcept { return {}; }
        suspend_always yield_value(T v) { val = v; return {}; }
        void return_void() { val.reset(); }
        void unhandled_exception() { terminate(); }
    };
    coroutine_handle<promise_type> h;
    ~Gen() { if (h) h.destroy(); }

    struct Iter {
        coroutine_handle<promise_type> h;
        bool operator!=(nullptr_t) { return !h.done() && h.promise().val.has_value(); }
        Iter& operator++() { h.resume(); return *this; }
        T operator*() { return *h.promise().val; }
    };
    Iter begin() { h.resume(); return {h}; }
    nullptr_t end() { return nullptr; }
};

Gen<int> fibonacci(int limit) {
    int a = 0, b = 1;
    while (a <= limit) {
        co_yield a;
        auto next = a + b; a = b; b = next;
    }
}

int main() {
    cout << "fibonacci:";
    for (int x : fibonacci(40)) cout << " " << x;
    cout << "\\n";

    cout << "filtered evens:";
    for (int x : fibonacci(40))
        if (x % 2 == 0) cout << " " << x;
    cout << "\\n";

    return 0;
}`;

const PIPELINE_CODE = `#include <iostream>
#include <coroutine>
#include <vector>
using namespace std;

// __OUTPUT__: pipeline: map then filter\\nresult: 4 16 36\\nsteps executed lazily

template<typename T>
struct Gen {
    struct promise_type {
        T val{};
        Gen get_return_object() { return {coroutine_handle<promise_type>::from_promise(*this)}; }
        suspend_always initial_suspend() { return {}; }
        suspend_always final_suspend() noexcept { return {}; }
        suspend_always yield_value(T v) { val = v; return {}; }
        void return_void() {}
        void unhandled_exception() { terminate(); }
    };
    coroutine_handle<promise_type> h;
    ~Gen() { if (h) h.destroy(); }
    bool next() { h.resume(); return !h.done(); }
    T value() { return h.promise().val; }
};

Gen<int> range(int n) {
    for (int i = 1; i <= n; i++) co_yield i;
}

Gen<int> map_sq(Gen<int> src) {
    while (src.next()) co_yield src.value() * src.value();
}

Gen<int> filter_even(Gen<int> src) {
    while (src.next()) if (src.value() % 2 == 0) co_yield src.value();
}

int main() {
    cout << "pipeline: map then filter\\n";
    cout << "result:";
    auto pipeline = filter_even(map_sq(range(6)));
    while (pipeline.next()) cout << " " << pipeline.value();
    cout << "\\n";
    cout << "steps executed lazily\\n";
    return 0;
}`;

const lesson = {
  id: "cpp-3-009",
  slug: "coroutines",
  chapter: "cpp-3",
  order: 9,
  title: "Coroutines",
  subtitle: "co_yield, co_await, co_return, generators, coroutine_handle",
  tags: ["c++", "cpp", "coroutine", "co_yield", "co_await", "co_return", "generator", "coroutine_handle"],
  aliases: [
    "c++ coroutine",
    "c++ co_yield",
    "c++ co_await",
    "c++ generator",
    "c++ coroutine_handle",
  ],

  hook: `A function runs to completion and returns once. A coroutine can pause mid-execution, yield a value, and be resumed later — keeping its local state across suspensions. This enables generators (lazy infinite sequences), async/await patterns (suspend while waiting for I/O), and pipelines (lazy evaluation). C++20 coroutines are stackless — they allocate state on the heap and resume via a handle. The machinery is verbose, but the user-facing code is clean.`,

  mentalModel: [
    "**A coroutine is a function containing `co_yield`, `co_await`, or `co_return`.** The compiler transforms it into a state machine. When it hits a suspend point, it saves all local variables to heap-allocated state and returns control to the caller. Calling `.resume()` on the handle picks up where it left off.",
    "**`co_yield value` suspends and passes a value to the caller.** Used for generators. The coroutine is resumed the next time the caller asks for a value. `co_return value` completes the coroutine. `co_await awaitable` suspends until the awaitable is ready — used for async I/O.",
    "**Every coroutine needs a `promise_type`.** The promise controls behavior at each lifecycle event: `initial_suspend` (run immediately or suspend on start?), `final_suspend` (stay alive for the handle or destroy?), `yield_value` (what happens on co_yield?), `return_value`/`return_void` (what happens on co_return?). The `get_return_object()` method creates the user-visible return type.",
  ],

  intuition: {
    prose: [
      "**Coroutines are lazy by design.** A generator coroutine only produces the next value when asked. This enables infinite sequences that never compute more than needed, and pipelines where data flows through stages only when the consumer pulls. No intermediate containers, no wasted computation.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Basic generator with co_yield — run it then explore:**\n\n- Add a `cout << 'between yields\\n'` between two `co_yield` calls — watch the interleaving with main.\n- Make `count_up` yield squares instead — `co_yield i*i`.\n- Call `gen.next()` 4 times when only 3 yields exist — what happens at `done()`?\n- `suspend_always initial_suspend()` vs `suspend_never` — does the coroutine start immediately?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CORO_BASICS_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**co_await and manual resume — run it then explore:**\n\n- Change `initial_suspend` to `suspend_always` — does the task run at all before `t.resume()`?\n- Add a second `co_await Task::Suspend{}` — how many times must you call `t.resume()`?\n- Print the coroutine address: `cout << t.h.address()` — that's the heap-allocated state.\n- `await_ready() { return true; }` — coroutine never suspends, runs to completion immediately.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": AWAIT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Range-for works with coroutine generators via begin/end iterators.** Define `begin()` to resume and return an iterator, define the iterator's `operator++` to resume again, and `operator!=` to check `h.done()`. This gives you the clean `for (int x : gen)` syntax while the generator runs lazily.",
      "**Coroutine pipelines compose naturally.** A generator that takes another generator as input reads from it and yields transformed values. The chain `filter(map(source))` only runs when the outermost consumer pulls — pure lazy evaluation without library support. This is the foundation of async execution frameworks, game loop coroutines, and cooperative multitasking.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Range-for with generator — run it then explore:**\n\n- Create `Gen<string> words()` that co_yields words one at a time — iterate with range-for.\n- `fibonacci(0)` — yields just 0? Trace through initial_suspend then first resume.\n- Add a `take(n)` adapter: wrap a Gen and stop after n values.\n- Compose: `for (int x : take(5, fibonacci(1000)))` — only 5 values computed.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": GENERATOR_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Lazy pipeline — run it then explore:**\n\n- Add a `cout` inside `range` — verify it only runs when pipeline.next() is called.\n- Add a `filter_gt(Gen src, int threshold)` stage: co_yield only values > threshold.\n- Pipeline: `filter_gt(filter_even(map_sq(range(10))), 10)` — trace what executes.\n- Benchmark: pipeline vs eager vector transform — does lazy avoid the intermediate vector?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PIPELINE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "final_suspend() should return suspend_always for handles you store",
        body: "If `final_suspend` returns `suspend_never`, the coroutine destroys itself on completion — calling `h.resume()` or `h.done()` after that is undefined behavior. Return `suspend_always` and manually call `h.destroy()` (usually in the RAII wrapper's destructor).",
      },
      {
        type: "tip",
        title: "Use C++23 std::generator for production generators",
        body: "C++23 adds `std::generator<T>` — a standardized, well-optimized generator coroutine. It handles all the promise_type boilerplate and supports range-for. For generators in real code, prefer `std::generator` over writing your own promise_type machinery.",
      },
    ],
  },

  examples: [
    {
      title: "Async task with co_await (simplified executor)",
      body: `// Simplified — real async coroutines integrate with an event loop
#include <coroutine>
#include <functional>
#include <iostream>

struct AsyncTask {
    struct promise_type {
        AsyncTask get_return_object() { return {coroutine_handle<promise_type>::from_promise(*this)}; }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() { std::terminate(); }
    };
    std::coroutine_handle<promise_type> h;
    ~AsyncTask() { if (h) h.destroy(); }
};

// Awaitable that resumes on the next "tick"
struct Yield {
    std::function<void()> callback;
    bool await_ready() { return false; }
    void await_suspend(std::coroutine_handle<> h) {
        callback = [h]() mutable { h.resume(); };
    }
    void await_resume() {}
};`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a coroutine generator `Gen<int> range(int start, int stop, int step)` that yields integers from `start` to `stop-1` incrementing by `step`. Use it with range-for to print `0 2 4 6 8`. Then write `Gen<int> repeat(int val, int times)` that yields the same value N times.",
      hint: "Use the Gen template from the lesson. `for (int i = start; i < stop; i += step) co_yield i;`",
      walkthrough: [
        "Gen<int> range(int start, int stop, int step) { for(int i=start; i<stop; i+=step) co_yield i; }",
        "for (int x : range(0, 10, 2)) cout << x << ' ';",
        "Gen<int> repeat(int v, int n) { for(int i=0;i<n;i++) co_yield v; }",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `zip` coroutine that takes two `Gen<int>` generators and yields pairs until either is exhausted. `zip(range(1,4,1), range(10,40,10))` should yield `(1,10), (2,20), (3,30)`. Then implement `enumerate` that wraps a generator and yields `(index, value)` pairs starting from 0.",
      hint: "Use `pair<int,int>` as the yield type. Advance both generators in lockstep.",
      walkthrough: [
        "Gen<pair<int,int>> zip(Gen<int> a, Gen<int> b) { while(a.next() && b.next()) co_yield {a.value(), b.value()}; }",
        "Gen<pair<int,int>> enumerate(Gen<int> g) { int i=0; while(g.next()) co_yield {i++, g.value()}; }",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-009-q1",
        type: "choice",
        text: "What does `co_yield x` do in a coroutine?",
        options: [
          "Terminates the coroutine and returns x to the caller",
          "Suspends the coroutine, saves its state, and makes x available to the caller — the coroutine resumes from this point on the next .resume() call",
          "Allocates x on the heap for later retrieval",
          "Launches a new coroutine with value x",
        ],
        answer: 1,
        explanation:
          "`co_yield x` calls `promise.yield_value(x)`, then suspends the coroutine. The coroutine's entire local state (variables, instruction pointer) is preserved. When `.resume()` is called on the coroutine handle, execution continues from immediately after the `co_yield`. `co_return` terminates the coroutine.",
      },
      {
        id: "cpp3-009-q2",
        type: "choice",
        text: "What does `initial_suspend() { return suspend_always{}; }` mean?",
        options: [
          "The coroutine runs to completion immediately on construction",
          "The coroutine suspends immediately when called — it doesn't execute any body code until the first .resume()",
          "The coroutine is destroyed before executing",
          "The coroutine runs in a new thread",
        ],
        answer: 1,
        explanation:
          "`initial_suspend` controls what happens right after the coroutine frame is created. `suspend_always` means it suspends immediately — no code in the function body runs until you call `.resume()`. `suspend_never` means it runs until the first explicit suspend point. Most generators use `suspend_always` so they don't execute until asked.",
      },
      {
        id: "cpp3-009-q3",
        type: "choice",
        text: "Why should `final_suspend()` usually return `suspend_always`?",
        options: [
          "To avoid memory leaks",
          "So the coroutine frame stays alive after completion, letting you read the final value before destroying it with h.destroy()",
          "To make the coroutine restartable",
          "final_suspend has no effect on behavior",
        ],
        answer: 1,
        explanation:
          "When a coroutine completes, `final_suspend` determines whether the frame is destroyed immediately (`suspend_never`) or kept alive (`suspend_always`). If you're storing the final result in `promise.result`, you need the frame alive to read it. `suspend_always` lets your RAII wrapper read the result then call `h.destroy()` in its destructor.",
      },
      {
        id: "cpp3-009-q4",
        type: "choice",
        text: "What is the difference between `co_await` and `co_yield`?",
        options: [
          "co_await is for generators; co_yield is for async tasks",
          "co_yield suspends and produces a value for the caller; co_await suspends and waits for an external result to become available",
          "co_await cannot be used with coroutine_handle",
          "They are identical — different syntax for the same operation",
        ],
        answer: 1,
        explanation:
          "`co_yield value` pushes a value out to the caller (generator pattern). `co_await awaitable` waits for something to become ready — if not ready, suspends and lets the awaitable arrange for resumption when it is (async I/O, timer, another coroutine completing). They serve complementary patterns: pull (co_yield) vs. push (co_await).",
      },
    ],
  },
};

export default lesson;
