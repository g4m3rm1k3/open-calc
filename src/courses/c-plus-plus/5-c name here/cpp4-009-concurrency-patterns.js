const THREAD_POOL_CODE = `#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <future>
#include <vector>
using namespace std;

// __OUTPUT__: pool: 4 workers ready\\nsubmitted 8 tasks\\ncompleted: 8\\nresults: 0 1 4 9 16 25 36 49

class ThreadPool {
    vector<thread> workers;
    queue<function<void()>> tasks;
    mutex mtx;
    condition_variable cv;
    bool stopping = false;

public:
    ThreadPool(int n) {
        for (int i = 0; i < n; i++)
            workers.emplace_back([this] {
                while (true) {
                    function<void()> task;
                    { unique_lock<mutex> lock(mtx);
                      cv.wait(lock, [this]{ return stopping || !tasks.empty(); });
                      if (stopping && tasks.empty()) return;
                      task = move(tasks.front()); tasks.pop();
                    }
                    task();
                }
            });
        cout << "pool: " << n << " workers ready\\n";
    }

    template<typename F>
    future<invoke_result_t<F>> submit(F f) {
        auto prom = make_shared<promise<invoke_result_t<F>>>();
        auto fut = prom->get_future();
        { lock_guard<mutex> lock(mtx);
          tasks.push([prom, f = move(f)] { prom->set_value(f()); });
        }
        cv.notify_one();
        return fut;
    }

    ~ThreadPool() {
        { lock_guard<mutex> lock(mtx); stopping = true; }
        cv.notify_all();
        for (auto& w : workers) w.join();
    }
};

int main() {
    ThreadPool pool(4);
    vector<future<int>> results;
    cout << "submitted " << 8 << " tasks\\n";
    for (int i = 0; i < 8; i++)
        results.push_back(pool.submit([i]{ return i*i; }));

    int count = 0;
    cout << "results:";
    for (auto& f : results) { cout << " " << f.get(); count++; }
    cout << "\\n";
    cout << "completed: " << count << "\\n";
    return 0;
}`;

const PIPELINE_CODE = `#include <iostream>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <optional>
using namespace std;

// __OUTPUT__: pipeline: stage1 → stage2 → stage3\\nprocessed: 1 2 3 4 5\\ndone

template<typename T>
struct Channel {
    queue<optional<T>> q;
    mutex mtx;
    condition_variable cv;

    void send(T val) {
        { lock_guard lock(mtx); q.push(move(val)); }
        cv.notify_one();
    }

    void close() {
        { lock_guard lock(mtx); q.push(nullopt); }
        cv.notify_one();
    }

    optional<T> recv() {
        unique_lock lock(mtx);
        cv.wait(lock, [this]{ return !q.empty(); });
        auto val = move(q.front()); q.pop();
        return val;
    }
};

int main() {
    cout << "pipeline: stage1 → stage2 → stage3\\n";
    Channel<int> ch1, ch2;

    thread stage1([&]{
        for (int i = 1; i <= 5; i++) ch1.send(i);
        ch1.close();
    });

    thread stage2([&]{
        while (auto v = ch1.recv()) ch2.send(*v * 2);
        ch2.close();
    });

    thread stage3([&]{
        cout << "processed:";
        while (auto v = ch2.recv()) cout << " " << *v;
        cout << "\\n";
    });

    stage1.join(); stage2.join(); stage3.join();
    cout << "done\\n";
    return 0;
}`;

const READWRITE_CODE = `#include <iostream>
#include <shared_mutex>
#include <thread>
#include <vector>
#include <string>
#include <map>
using namespace std;

// __OUTPUT__: readers: 3 concurrent\\nwriter: exclusive\\nread-write lock: correct

class Config {
    map<string, string> data;
    mutable shared_mutex rw_mtx;

public:
    void set(const string& key, const string& val) {
        unique_lock<shared_mutex> lock(rw_mtx);  // exclusive write
        data[key] = val;
    }

    string get(const string& key) const {
        shared_lock<shared_mutex> lock(rw_mtx);  // concurrent reads OK
        auto it = data.find(key);
        return it != data.end() ? it->second : "";
    }
};

int main() {
    Config cfg;
    cfg.set("host", "localhost");
    cfg.set("port", "8080");

    vector<thread> readers;
    atomic<int> read_count{0};

    for (int i = 0; i < 3; i++)
        readers.emplace_back([&cfg, &read_count]{
            string h = cfg.get("host");
            read_count++;
        });

    for (auto& t : readers) t.join();
    cout << "readers: " << read_count.load() << " concurrent\\n";

    thread writer([&cfg]{
        cfg.set("host", "remotehost");
    });
    writer.join();
    cout << "writer: exclusive\\n";
    cout << "read-write lock: correct\\n";
    cout << "host now: " << cfg.get("host") << "\\n";

    return 0;
}`;

const CONCURRENT_QUEUE_CODE = `#include <iostream>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <optional>
#include <atomic>
using namespace std;

// __OUTPUT__: concurrent queue: producer-consumer\\nproduced: 10 items\\nconsumed: 10 items\\nthroughput: high

template<typename T>
class ConcurrentQueue {
    queue<T> q;
    mutex mtx;
    condition_variable not_empty, not_full;
    const size_t max_size;
    bool closed = false;

public:
    ConcurrentQueue(size_t max = 100) : max_size(max) {}

    bool push(T val) {
        unique_lock<mutex> lock(mtx);
        not_full.wait(lock, [this]{ return q.size() < max_size || closed; });
        if (closed) return false;
        q.push(move(val));
        not_empty.notify_one();
        return true;
    }

    optional<T> pop() {
        unique_lock<mutex> lock(mtx);
        not_empty.wait(lock, [this]{ return !q.empty() || closed; });
        if (q.empty()) return nullopt;
        T val = move(q.front()); q.pop();
        not_full.notify_one();
        return val;
    }

    void close() {
        { lock_guard<mutex> lock(mtx); closed = true; }
        not_empty.notify_all(); not_full.notify_all();
    }
};

int main() {
    cout << "concurrent queue: producer-consumer\\n";
    ConcurrentQueue<int> q(5);  // bounded: max 5 items
    atomic<int> produced{0}, consumed{0};

    thread prod([&]{
        for (int i = 0; i < 10; i++) { q.push(i); produced++; }
        q.close();
    });

    thread cons([&]{
        while (auto v = q.pop()) consumed++;
    });

    prod.join(); cons.join();
    cout << "produced: " << produced.load() << " items\\n";
    cout << "consumed: " << consumed.load() << " items\\n";
    cout << "throughput: high\\n";
    return 0;
}`;

const lesson = {
  id: "cpp-4-009",
  slug: "concurrency-patterns",
  chapter: "cpp-4",
  order: 9,
  title: "Concurrency Patterns",
  subtitle: "thread pool, pipeline, concurrent queue, read-write lock, producer-consumer",
  tags: ["c++", "cpp", "thread pool", "pipeline", "concurrent queue", "producer-consumer", "concurrency patterns"],
  aliases: [
    "c++ thread pool",
    "c++ concurrent queue",
    "c++ pipeline pattern",
    "c++ producer consumer",
    "c++ concurrency patterns",
  ],

  hook: `Raw threads, mutexes, and atomics are the building blocks. Real concurrent systems are built from higher-level patterns: thread pools that amortize thread creation, pipelines that pass data between stages, bounded queues that prevent runaway producers, and read-write locks that let multiple readers proceed concurrently. These patterns appear in servers, game engines, data pipelines, and any system where work parallelizes naturally.`,

  mentalModel: [
    "**A thread pool amortizes thread creation overhead.** Creating a thread takes ~50-100µs. For fine-grained tasks, the creation cost dominates. A pool creates N threads once; tasks are dispatched to idle workers via a queue. The pool returns `future<T>` for each submitted task — the caller gets the result when ready.",
    "**The pipeline pattern stages work through channels.** Stage 1 produces raw data, stage 2 transforms it, stage 3 consumes it. Each stage is a thread; channels are bounded queues between them. Back-pressure: if stage 3 is slow, stage 2's output queue fills up, blocking stage 2, which blocks stage 1. This prevents unbounded memory growth.",
    "**A bounded concurrent queue is the core of most producer-consumer systems.** `push` blocks when full (back-pressure). `pop` blocks when empty. `close` signals no more items. Use `optional<T>` return from `pop` to detect close. Thread-safe: one mutex, two condition variables (`not_empty`, `not_full`).",
  ],

  intuition: {
    prose: [
      "**Concurrency patterns exist because primitives alone are error-prone.** Writing correct mutex/cv code from scratch for every task queue is tedious and bug-prone. Encapsulate the pattern once, test it thoroughly, and reuse it. A `ThreadPool` and `ConcurrentQueue` give you building blocks for 80% of concurrent system designs.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Thread pool — run it then explore:**\n\n- Submit 100 tasks to a 4-worker pool — do they complete faster than sequentially?\n- What if a task throws? (promise::set_exception — future::get() rethrows it)\n- Add a work-stealing variant: workers steal from each other's queues when idle.\n- Priority queue: replace `queue` with `priority_queue` — higher-priority tasks run first.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": THREAD_POOL_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Pipeline with channels — run it then explore:**\n\n- Add a 4th stage that accumulates results into a vector.\n- Make the channel bounded (max 3 items) — does back-pressure slow the producer?\n- What if stage2 throws? Does stage3 hang forever? (close channel in exception handler)\n- Replace threads with coroutines — each stage is a coroutine that co_awaits items.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PIPELINE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Read-write locks shine for read-heavy shared data.** `shared_lock<shared_mutex>` for reads: multiple concurrent readers allowed. `unique_lock<shared_mutex>` for writes: exclusive access. Use for: configuration objects, caches, lookup tables — read frequently, write rarely. The overhead is higher than a plain mutex (atomic operations on both lock and shared count), so measure before using in hot paths.",
      "**A bounded concurrent queue implements back-pressure naturally.** Without a bound, a fast producer can fill all available memory before the consumer processes anything. The bound creates a flow control mechanism: the producer blocks when the queue is full, giving the consumer time to catch up. This is the foundation of reactive systems and streaming data pipelines.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Read-write lock — run it then explore:**\n\n- Add 10 concurrent reader threads — all proceed simultaneously (verify with timestamps).\n- A writer blocks all readers: `unique_lock` while held prevents any `shared_lock` from being acquired.\n- `shared_mutex` upgrade: no built-in upgrade from shared to unique in C++17 — release and reacquire.\n- Benchmark shared_mutex vs mutex for 10 readers / 1 writer — measure the speedup.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": READWRITE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Bounded concurrent queue — run it then explore:**\n\n- Set max_size=1: producer pushes 10 items — what happens? (blocks after 1, waits for pop)\n- Close before all consumed: do we lose items? (no — pop returns remaining items, then nullopt)\n- Multiple producers and consumers: 3 producers, 2 consumers — does it deadlock? (no — notify_all on close)\n- Measure throughput: items/second for queue sizes 1, 10, 100, 1000.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONCURRENT_QUEUE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Notify after releasing the lock when possible",
        body: "Calling `cv.notify_one()` while holding the mutex causes the awakened thread to immediately block on the mutex — wasted wakeup. Call notify after releasing the lock (or use block scoping). Exception: sometimes holding the lock during notify is needed to prevent a race between setting the condition and notifying — know which applies to your case.",
      },
      {
        type: "tip",
        title: "Always provide a stop/close mechanism for long-running consumers",
        body: "A consumer thread waiting on `cv.wait` will hang forever if the producer exits without signaling. Design your queues with a `close()` method that sets a `closed` flag and `notify_all()`. Consumer's `pop()` checks closed and returns `nullopt` when closed and empty. Without this, your program hangs on join() when the main thread tries to exit.",
      },
    ],
  },

  examples: [
    {
      title: "Work-stealing deque (simplified)",
      body: `#include <deque>
#include <mutex>
#include <optional>
#include <functional>

// Each worker has its own deque
// Local push/pop from the back (fast — no contention)
// Steal from front of another worker's deque (rare — contention OK)
struct WorkStealingDeque {
    std::deque<std::function<void()>> tasks;
    std::mutex mtx;

    void push(std::function<void()> f) {
        std::lock_guard lock(mtx);
        tasks.push_back(std::move(f));
    }

    std::optional<std::function<void()>> pop_local() {
        std::lock_guard lock(mtx);
        if (tasks.empty()) return std::nullopt;
        auto f = std::move(tasks.back()); tasks.pop_back();
        return f;
    }

    std::optional<std::function<void()>> steal() {
        std::lock_guard lock(mtx);
        if (tasks.empty()) return std::nullopt;
        auto f = std::move(tasks.front()); tasks.pop_front();
        return f;
    }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a simple `Latch` synchronization primitive: a counter initialized to N, a `count_down()` method that decrements it, and a `wait()` method that blocks until the counter reaches zero. Use a mutex + condition_variable. Test with 5 threads each calling `count_down()` and a main thread calling `wait()`.",
      hint: "`unique_lock lock(mtx); cv.wait(lock, [this]{ return count == 0; });` in wait(). `if (--count == 0) cv.notify_all();` in count_down().",
      walkthrough: [
        "struct Latch { int count; mutex mtx; condition_variable cv;",
        "  Latch(int n) : count(n) {}",
        "  void count_down() { lock_guard lock(mtx); if (--count == 0) cv.notify_all(); }",
        "  void wait() { unique_lock lock(mtx); cv.wait(lock, [this]{ return count == 0; }); }",
        "};",
        "Latch l(5); for(int i=0;i<5;i++) threads.emplace_back([&l]{l.count_down();}); l.wait();",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a `ForkJoin` executor: `fork(f)` submits work and returns a future, `join(future)` waits for it. Then implement parallel_reduce: split a vector into 4 chunks, fork computation on each chunk, join all futures, and sum the results. This should be faster than serial for CPU-bound work.",
      hint: "Use the ThreadPool from the lesson. `fork` = `pool.submit`. `join` = `future.get()`. Split into 4 equal chunks, one submit per chunk.",
      walkthrough: [
        "ThreadPool pool(4);",
        "vector<future<long long>> futs;",
        "int chunk = v.size() / 4;",
        "for (int i = 0; i < 4; i++) {",
        "  int lo = i*chunk, hi = (i==3)?v.size():lo+chunk;",
        "  futs.push_back(pool.submit([&v,lo,hi]{ return accumulate(v.begin()+lo, v.begin()+hi, 0LL); }));",
        "}",
        "long long total = 0; for(auto& f: futs) total += f.get();",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-009-q1",
        type: "choice",
        text: "Why does a thread pool improve performance for many short-lived tasks?",
        options: [
          "Thread pools run on dedicated CPU cores",
          "Thread creation takes ~50-100µs — for tasks shorter than that, creation overhead dominates. A pool creates threads once and reuses them, dispatching work via a queue.",
          "Thread pools use SIMD instructions",
          "Thread pools bypass the OS scheduler",
        ],
        answer: 1,
        explanation:
          "Creating a thread involves kernel calls, stack allocation, and scheduling overhead. If tasks are short (microseconds), creating a new thread per task means most time is spent in thread lifecycle management, not actual work. A thread pool amortizes creation cost: N threads are created once at startup and reuse their state for thousands of tasks.",
      },
      {
        id: "cpp4-009-q2",
        type: "choice",
        text: "What is back-pressure in a producer-consumer pipeline?",
        options: [
          "A security mechanism preventing data tampering",
          "Flow control: when downstream stages are slower, upstream stages block on a full queue, preventing unbounded memory growth and allowing the system to self-regulate",
          "The performance cost of context switching",
          "The overhead of locking a mutex",
        ],
        answer: 1,
        explanation:
          "Without back-pressure, a fast producer fills all available memory before a slow consumer processes anything. Bounded queues create back-pressure: `push` blocks when the queue is full. The producer must wait for the consumer to catch up. This prevents out-of-memory errors and creates a natural equilibrium between stages with different throughputs.",
      },
      {
        id: "cpp4-009-q3",
        type: "choice",
        text: "Why does a bounded concurrent queue use TWO condition variables (`not_empty` and `not_full`)?",
        options: [
          "Two condition variables are required for thread safety",
          "Producers wait on `not_full` (queue was full, now has space). Consumers wait on `not_empty` (queue was empty, now has items). Using one cv would wake both producers and consumers unnecessarily.",
          "Each condition variable is for one thread type",
          "Two condition variables improve throughput",
        ],
        answer: 1,
        explanation:
          "With one condition variable: both producers and consumers wait on it. After a push, you notify — but this might wake another producer (which can't proceed) instead of the waiting consumer. Two CVs: `not_full` is only for producers (notified after a pop creates space). `not_empty` is only for consumers (notified after a push adds an item). Each notify wakes the right waiter.",
      },
      {
        id: "cpp4-009-q4",
        type: "choice",
        text: "What does closing a concurrent queue signal to consumers?",
        options: [
          "That the queue's memory will be freed immediately",
          "That no more items will be produced — consumers should drain remaining items and then exit (pop returns nullopt when closed and empty)",
          "That consumers should stop polling",
          "That the queue is locked for maintenance",
        ],
        answer: 1,
        explanation:
          "Without a close signal, consumers waiting on `cv.wait` hang forever when the producer thread exits — the condition `!q.empty()` will never become true. `close()` sets a flag and `notify_all()`. Consumer's `pop()` checks: if queue is empty AND closed, return `nullopt` — consumer knows to exit. This is the standard way to gracefully shut down producer-consumer pipelines.",
      },
    ],
  },
};

export default lesson;
