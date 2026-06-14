const ASYNC_CODE = `#include <iostream>
#include <future>
#include <chrono>
using namespace std;

// __OUTPUT__: launched async task\\nresult: 42\\nelapsed: fast (ran concurrently)

int heavy_compute(int x) {
    this_thread::sleep_for(chrono::milliseconds(10));
    return x * x;
}

int main() {
    cout << "launched async task\\n";

    // launch::async — runs in a new thread immediately
    future<int> f = async(launch::async, heavy_compute, 6);

    // Do other work while it runs...
    this_thread::sleep_for(chrono::milliseconds(5));

    int result = f.get();  // blocks until ready
    cout << "result: " << result << "\\n";
    cout << "elapsed: fast (ran concurrently)\\n";

    return 0;
}`;

const PROMISE_CODE = `#include <iostream>
#include <future>
#include <thread>
using namespace std;

// __OUTPUT__: worker: computing...\\nmain: waiting...\\nworker: done\\nmain: got 99

void worker(promise<int> prom) {
    cout << "worker: computing...\\n";
    this_thread::sleep_for(chrono::milliseconds(5));
    prom.set_value(99);      // fulfill the promise
    cout << "worker: done\\n";
}

int main() {
    promise<int> prom;
    future<int> fut = prom.get_future();

    thread t(worker, move(prom));
    cout << "main: waiting...\\n";

    int val = fut.get();     // blocks until promise fulfilled
    cout << "main: got " << val << "\\n";

    t.join();
    return 0;
}`;

const PACKAGED_CODE = `#include <iostream>
#include <future>
#include <thread>
#include <functional>
using namespace std;

// __OUTPUT__: task created\\nthread: running task\\nresult: 25

int main() {
    // packaged_task wraps a callable — future tracks its return value
    packaged_task<int(int)> task([](int x) {
        cout << "thread: running task\\n";
        return x * x;
    });

    future<int> fut = task.get_future();
    cout << "task created\\n";

    thread t(move(task), 5);   // move task into thread
    t.join();

    cout << "result: " << fut.get() << "\\n";

    return 0;
}`;

const MULTI_FUTURE_CODE = `#include <iostream>
#include <future>
#include <vector>
using namespace std;

// __OUTPUT__: launched 4 tasks\\nresults: 0 1 4 9\\nshared_future: 42 42 42

int compute(int x) { return x * x; }

int main() {
    // Launch multiple async tasks
    vector<future<int>> futures;
    for (int i = 0; i < 4; i++)
        futures.push_back(async(launch::async, compute, i));

    cout << "launched 4 tasks\\n";
    cout << "results:";
    for (auto& f : futures)
        cout << " " << f.get();
    cout << "\\n";

    // shared_future: multiple consumers can wait on same result
    promise<int> p;
    shared_future<int> sf = p.get_future().share();
    p.set_value(42);

    cout << "shared_future:";
    for (int i = 0; i < 3; i++)
        cout << " " << sf.get();    // can call get() multiple times
    cout << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-008",
  slug: "async-futures",
  chapter: "cpp-3",
  order: 8,
  title: "Async and Futures",
  subtitle: "std::async, future, promise, packaged_task, shared_future",
  tags: ["c++", "cpp", "async", "future", "promise", "packaged_task", "shared_future", "concurrency"],
  aliases: [
    "c++ async",
    "c++ future",
    "c++ promise",
    "c++ packaged_task",
    "c++ shared_future",
  ],

  hook: `\`std::thread\` is low-level — you manage the thread and have no direct way to get a return value. \`std::async\` gives you a higher-level model: launch a task, get a \`future\` back, call \`.get()\` when you need the result. It handles thread management and exception propagation automatically. For most async work, this is the right starting point.`,

  mentalModel: [
    "**`std::async` launches a task and returns a `future<T>`.** `launch::async` guarantees a new thread. `launch::deferred` runs lazily (on `.get()`). The default is implementation-defined — always specify. Calling `.get()` blocks until ready and returns the value (or rethrows any exception the task threw).",
    "**`promise<T>` and `future<T>` are the two ends of a channel.** One thread holds the `promise` and calls `set_value()` (or `set_exception()`). Another thread holds the `future` and calls `get()`. The future blocks until the promise is fulfilled. A promise can only be fulfilled once.",
    "**`packaged_task<R(Args...)>` wraps a callable so its return value becomes a future.** Unlike `async`, it doesn't launch a thread — you move it into a thread or call it directly. Useful for task queues: wrap work as packaged_tasks, get futures, push tasks to workers.",
  ],

  intuition: {
    prose: [
      "**Futures propagate exceptions automatically.** If the async task throws, `.get()` rethrows the exception in the calling thread. This is much cleaner than thread-based exception handling where you'd need to manually catch and pass exceptions via shared state. Always call `.get()` (or `.wait()`) — if a future's destructor runs before `.get()`, the thread is joined (for `launch::async`), blocking there instead.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**std::async — run it then explore:**\n\n- Change `launch::async` to `launch::deferred` — task runs on `.get()` call, not concurrently.\n- Throw an exception inside `heavy_compute` — catch it around `f.get()`.\n- Launch 4 async tasks simultaneously — do they run in parallel? (check with timestamps)\n- What happens if you never call `f.get()`? (future destructor blocks until task completes for `launch::async`)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ASYNC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**promise and future — run it then explore:**\n\n- Call `set_value` twice — what exception is thrown?\n- `set_exception(make_exception_ptr(runtime_error(\"fail\")))` — catch it in main at `fut.get()`.\n- `promise<void>` + `future<void>`: use for signaling with no value — `set_value()` with no args.\n- What if thread exits without calling `set_value`? (broken_promise exception at `.get()`)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PROMISE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`packaged_task` decouples task creation from execution.** It's the building block for thread pools and task schedulers. The task and its future are created together, but execution happens when someone calls the task (like a function). Move it into a thread, post it to a queue, or call it directly. The future stays with whoever needs the result.",
      "**`shared_future<T>` allows multiple consumers.** A regular `future` can only be `get()`-ed once (it moves the result out). `shared_future` is copyable — multiple threads can each call `get()` and receive the same value. Create via `future.share()`. Use when multiple downstream tasks need the same upstream result.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**packaged_task — run it then explore:**\n\n- Call `task(5)` directly (no thread) — still works, future gets the result.\n- Store packaged_tasks in a `queue<packaged_task<int(int)>>` — dispatch from a worker thread.\n- `task.valid()`: false after it's been moved — check before use.\n- Return a string from the task — `packaged_task<string()>` — get it via future.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PACKAGED_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Multiple futures and shared_future — run it then explore:**\n\n- Call `sf.get()` from 3 different threads concurrently — all get the same value.\n- Call `f.get()` twice on a regular future — throws `std::future_error`.\n- `future::wait_for(duration)`: returns `future_status::ready/timeout/deferred` — poll without blocking.\n- `when_all` pattern: launch N tasks, wait for all with a loop of `.get()` calls.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MULTI_FUTURE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "launch::async futures block on destruction",
        body: "A `future` returned by `async(launch::async, ...)` joins the thread in its destructor if `.get()` was never called. This means `auto f = async(launch::async, ...);` followed by immediately discarding `f` is NOT fire-and-forget — it blocks right there. Name the future and call `.get()` or use `detach` explicitly via `std::thread`.",
      },
      {
        type: "tip",
        title: "Use async for coarse-grained parallelism; prefer thread pools for fine-grained",
        body: "`std::async` creates a new thread (or uses a pool, implementation-defined). For many small tasks, the overhead of thread creation dominates. Use `packaged_task` with a real thread pool (or coroutines) for high-frequency task dispatch.",
      },
    ],
  },

  examples: [
    {
      title: "Fan-out / fan-in with futures",
      body: `#include <future>
#include <vector>
#include <numeric>

// Fan-out: launch N parallel tasks
// Fan-in: collect all results
int parallel_sum(const std::vector<int>& v, int threads) {
    int chunk = v.size() / threads;
    std::vector<std::future<int>> futs;

    for (int i = 0; i < threads; i++) {
        int lo = i * chunk;
        int hi = (i == threads-1) ? v.size() : lo + chunk;
        futs.push_back(std::async(std::launch::async, [&v, lo, hi] {
            return std::accumulate(v.begin()+lo, v.begin()+hi, 0);
        }));
    }

    int total = 0;
    for (auto& f : futs) total += f.get();
    return total;
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Use `std::async` to compute the sum of squares of numbers 1–100 on a background thread. While it runs, print 'main: working...'. Then call `.get()` and print the result. Handle the case where the task throws by catching `std::exception`.",
      hint: "`async(launch::async, [] { int s=0; for(int i=1;i<=100;i++) s+=i*i; return s; })`",
      walkthrough: [
        "auto f = async(launch::async, [] { int s=0; for(int i=1;i<=100;i++) s+=i*i; return s; });",
        "cout << 'main: working...\\n';",
        "try { cout << f.get(); } catch(exception& e) { cerr << e.what(); }",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a simple parallel map: given `vector<int> data` and a function `f`, return a `vector<int>` where each element is `f(data[i])` computed in parallel using one `async` per element. Then implement a timeout: if any future takes more than 50ms, return -1 for that element using `wait_for`.",
      hint: "`future_status::ready` vs `future_status::timeout` from `wait_for(50ms)`.",
      walkthrough: [
        "vector<future<int>> futs; for(auto x: data) futs.push_back(async(launch::async, f, x));",
        "vector<int> results;",
        "for(auto& fut: futs) {",
        "  if(fut.wait_for(50ms)==future_status::ready) results.push_back(fut.get());",
        "  else results.push_back(-1);",
        "}",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-008-q1",
        type: "choice",
        text: "What does `future::get()` do if the async task threw an exception?",
        options: [
          "Returns a default-constructed value",
          "Rethrows the exception in the calling thread",
          "Returns std::nullopt",
          "Calls std::terminate",
        ],
        answer: 1,
        explanation:
          "Futures propagate exceptions automatically. If the task throws, the exception is stored in the shared state. When `.get()` is called, it rethrows that exception. This lets you handle async errors with normal try/catch at the point where you consume the result.",
      },
      {
        id: "cpp3-008-q2",
        type: "choice",
        text: "What is the key difference between `packaged_task` and `std::async`?",
        options: [
          "packaged_task returns a shared_future; async returns a regular future",
          "async launches execution immediately (with launch::async); packaged_task is a callable that only executes when called or moved into a thread",
          "packaged_task supports exceptions; async does not",
          "async requires a return type; packaged_task does not",
        ],
        answer: 1,
        explanation:
          "`std::async(launch::async, ...)` immediately launches a thread. `packaged_task` just wraps a callable — you decide when and where it runs by calling it or moving it into a thread. This makes `packaged_task` suitable for task queues, where tasks are created now but dispatched to workers later.",
      },
      {
        id: "cpp3-008-q3",
        type: "choice",
        text: "Why does `auto f = std::async(std::launch::async, work);` sometimes block unexpectedly?",
        options: [
          "async with launch::async always blocks the calling thread",
          "If f goes out of scope without .get() being called, f's destructor joins the thread — blocking there",
          "async uses launch::deferred by default",
          "Futures are not movable",
        ],
        answer: 1,
        explanation:
          "For `launch::async`, the future returned is special: if it's destroyed without `.get()` being called, the destructor blocks until the thread finishes. So `{ auto f = async(launch::async, work); }` — `f` goes out of scope at `}`, destructor blocks. This makes 'fire and forget' impossible with async futures.",
      },
      {
        id: "cpp3-008-q4",
        type: "choice",
        text: "When should you use `shared_future` instead of `future`?",
        options: [
          "When the result is a large object",
          "When multiple threads need to call .get() on the same result",
          "When you want to avoid blocking",
          "When the task uses packaged_task",
        ],
        answer: 1,
        explanation:
          "`future::get()` is a one-shot operation — it moves the value out. A regular future can only be consumed by one thread. `shared_future` is copyable; multiple threads can each call `.get()` and all receive the same result. Create via `future.share()` or `promise.get_future()` then `.share()`.",
      },
    ],
  },
};

export default lesson;
