const THREAD_BASIC_CODE = `#include <iostream>
#include <thread>
#include <chrono>
using namespace std;

// __OUTPUT__: main: start\\nthread A: hello\\nthread B: hello\\nmain: both done

void worker(string name) {
    cout << "thread " << name << ": hello\\n";
    this_thread::sleep_for(chrono::milliseconds(1));
}

int main() {
    cout << "main: start\\n";

    // Create threads — start immediately
    thread tA(worker, "A");
    thread tB(worker, "B");

    // join: wait for the thread to finish
    tA.join();
    tB.join();

    cout << "main: both done\\n";

    // Thread IDs and hardware concurrency
    cout << "hardware threads: " << thread::hardware_concurrency() << "\\n";

    return 0;
}`;

const MUTEX_CODE = `#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
using namespace std;

// __OUTPUT__: final counter: 1000\\nwithout mutex: wrong (data race)\\nwith mutex: correct

mutex mtx;
int counter = 0;

void increment(int n) {
    for (int i=0; i<n; i++) {
        lock_guard<mutex> lock(mtx);  // RAII: locks on construction, unlocks on destruction
        counter++;
    }
}

int main() {
    counter = 0;
    vector<thread> threads;
    for (int i=0; i<10; i++)
        threads.emplace_back(increment, 100);
    for (auto& t : threads) t.join();

    cout << "final counter: " << counter << "\\n";

    // Without mutex: data race — counter++ is NOT atomic
    // Read value → add 1 → write back: another thread can read between steps
    cout << "without mutex: wrong (data race)\\n";
    cout << "with mutex: correct\\n";

    return 0;
}`;

const UNIQUE_LOCK_CODE = `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
using namespace std;

// __OUTPUT__: producer: put 1\\nconsumer: got 1\\nproducer: put 2\\nconsumer: got 2\\ndone

mutex mtx;
condition_variable cv;
int data = 0;
bool ready = false;

void producer() {
    for (int i=1; i<=2; i++) {
        this_thread::sleep_for(chrono::milliseconds(10));
        {
            unique_lock<mutex> lock(mtx);
            data = i;
            ready = true;
            cout << "producer: put " << i << "\\n";
        }
        cv.notify_one();   // wake consumer
        this_thread::sleep_for(chrono::milliseconds(5));
    }
}

void consumer() {
    for (int i=0; i<2; i++) {
        unique_lock<mutex> lock(mtx);
        cv.wait(lock, []{ return ready; });   // atomic: releases lock while waiting
        cout << "consumer: got " << data << "\\n";
        ready = false;
    }
}

int main() {
    thread prod(producer), cons(consumer);
    prod.join(); cons.join();
    cout << "done\\n";
    return 0;
}`;

const SHARED_MUTEX_CODE = `#include <iostream>
#include <thread>
#include <shared_mutex>
#include <vector>
using namespace std;

// __OUTPUT__: readers can read concurrently\\nwriter has exclusive access\\nvalue: 42

shared_mutex rw_mtx;
int shared_data = 0;

void reader(int id) {
    shared_lock<shared_mutex> lock(rw_mtx);  // multiple readers allowed
    int val = shared_data;
    cout << "reader " << id << " saw: " << val << "\\n";
}

void writer(int val) {
    unique_lock<shared_mutex> lock(rw_mtx);  // exclusive write
    shared_data = val;
    cout << "writer set: " << val << "\\n";
}

int main() {
    cout << "readers can read concurrently\\n";
    cout << "writer has exclusive access\\n";

    writer(42);
    vector<thread> readers;
    for (int i=0; i<3; i++) readers.emplace_back(reader, i);
    for (auto& t : readers) t.join();

    cout << "value: " << shared_data << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-006",
  slug: "threads-mutex",
  chapter: "cpp-3",
  order: 6,
  title: "Threads and Mutex",
  subtitle: "std::thread, lock_guard, unique_lock, condition_variable, shared_mutex",
  tags: ["c++", "cpp", "thread", "mutex", "lock_guard", "condition_variable", "shared_mutex", "concurrency"],
  aliases: [
    "c++ thread",
    "c++ mutex",
    "c++ concurrency",
    "c++ lock_guard",
    "c++ condition_variable",
    "c++ shared_mutex",
  ],

  hook: `Modern CPUs have multiple cores — serial code leaves them idle. \`std::thread\` lets you use them. But shared data accessed by multiple threads without synchronization is a data race — undefined behavior. \`mutex\` serializes access. \`condition_variable\` coordinates producer/consumer patterns. Understanding these is essential for any performance-critical or server-side application.`,

  mentalModel: [
    "**`std::thread` starts execution immediately on construction.** Always call `join()` or `detach()` before the thread object is destroyed — not calling either is `std::terminate`. `join()` blocks until the thread finishes. `detach()` lets it run independently (no way to wait for it).",
    "**`lock_guard<mutex>` is RAII mutex locking.** Locks on construction, unlocks on destruction. Even if an exception is thrown or an early return happens, the mutex is always released. Never use `mutex::lock()/unlock()` manually — use RAII wrappers.",
    "**`condition_variable` coordinates between threads.** `cv.wait(lock, pred)` atomically releases the lock and sleeps until another thread calls `cv.notify_one()` or `cv.notify_all()` AND the predicate is true. The predicate handles spurious wakeups.",
  ],

  intuition: {
    prose: [
      "**Data races are undefined behavior in C++.** Two threads accessing the same variable where at least one writes, without synchronization, is a data race. The result is undefined — not just incorrect, but UB. The CPU may reorder instructions, the compiler may optimize out the write. Use mutex or atomics for all shared mutable state.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Basic threads — run it then explore:**\n\n- Output order of A and B is not guaranteed — run multiple times.\n- Missing `tA.join()` before program ends: `std::terminate` is called — try it.\n- `thread::hardware_concurrency()` — how many cores on this machine?\n- Create 5 threads in a loop with `emplace_back` — join all after.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": THREAD_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Mutex and lock_guard — run it then explore:**\n\n- Remove `lock_guard` — run 100 threads incrementing 1000 times — final count is wrong (data race).\n- `try_lock()`: attempt to lock without blocking — returns false if locked.\n- `lock_guard` vs `unique_lock`: `unique_lock` can be unlocked manually and transferred — `lock_guard` cannot.\n- Time the locked vs unlocked version — how much does mutex add per increment?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MUTEX_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`unique_lock` for condition_variable.** `cv.wait(lock, pred)` requires a `unique_lock` (not `lock_guard`) because it needs to release the lock while waiting. It atomically: (1) releases the lock, (2) sleeps, (3) reacquires the lock on wakeup, (4) checks the predicate. If pred is false, it goes back to sleep (handles spurious wakeups).",
      "**`shared_mutex` for read-heavy workloads.** `shared_lock` allows multiple concurrent readers. `unique_lock` gives exclusive write access (no concurrent readers or writers). Use for caches, configuration objects, or any data that's read frequently but written rarely. More overhead than `mutex` — only worth it when readers >> writers.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**condition_variable — run it then explore:**\n\n- Remove the predicate from `cv.wait` — what happens? (spurious wakeups may cause issues)\n- `cv.notify_all()` instead of `notify_one()` — wakes all waiting threads.\n- Add a third item to produce — does the consumer handle all of them?\n- What if producer calls `notify_one()` before consumer calls `wait()`? (notification is lost — producer must set `ready=true` before notifying)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": UNIQUE_LOCK_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**shared_mutex — run it then explore:**\n\n- Multiple readers can run concurrently — verify by printing thread IDs.\n- Writer blocks all readers: while writer holds unique_lock, reader.lock() blocks.\n- `shared_mutex` is more expensive than `mutex` — benchmark with 10 readers/1 writer.\n- Try `upgrade_lock` (C++26) — currently use separate read/write phases.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SHARED_MUTEX_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never let a thread object be destroyed without join() or detach()",
        body: "If a `std::thread` object is destroyed while its thread is still running (neither joined nor detached), `std::terminate()` is called — the whole program aborts. Use RAII wrappers or `jthread` (C++20, auto-joins on destruction).",
      },
      {
        type: "tip",
        title: "Use std::jthread (C++20) for automatic join",
        body: "`std::jthread` automatically joins on destruction — no `join()` call needed. It also supports cooperative cancellation via `stop_token`. Prefer `jthread` over `thread` in new C++20 code.",
      },
    ],
  },

  examples: [
    {
      title: "Thread pool pattern",
      body: `#include <thread>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <functional>

class ThreadPool {
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
    bool stop = false;
public:
    ThreadPool(int n) {
        for (int i = 0; i < n; i++)
            workers.emplace_back([this] {
                while (true) {
                    std::function<void()> task;
                    { std::unique_lock<std::mutex> lock(mtx);
                      cv.wait(lock, [this]{ return stop || !tasks.empty(); });
                      if (stop && tasks.empty()) return;
                      task = std::move(tasks.front()); tasks.pop();
                    }
                    task();
                }
            });
    }
    void enqueue(std::function<void()> f) {
        { std::lock_guard<std::mutex> lock(mtx); tasks.push(std::move(f)); }
        cv.notify_one();
    }
    ~ThreadPool() {
        { std::lock_guard<std::mutex> lock(mtx); stop = true; }
        cv.notify_all();
        for (auto& w : workers) w.join();
    }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a thread-safe `Counter` class with `increment()`, `decrement()`, and `value() const` methods. Use a `mutex` inside the class. Create 10 threads each calling `increment()` 100 times. Verify the final count is 1000.",
      hint: "Private `mutex mtx` and `int count = 0`. Each method uses `lock_guard<mutex>`. `value()` also needs a lock (reading shared data).",
      walkthrough: [
        "class Counter { mutex mtx; int count=0; public:",
        "  void increment() { lock_guard<mutex> lk(mtx); ++count; }",
        "  void decrement() { lock_guard<mutex> lk(mtx); --count; }",
        "  int value() const { lock_guard<mutex> lk(const_cast<mutex&>(mtx)); return count; }",
        "};",
        "10 threads × 100 increments → final=1000",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a thread-safe bounded queue with `push(T)` (blocks when full) and `pop()` → T (blocks when empty). Use `mutex` + `condition_variable`. Test with a producer pushing 20 items into a queue of capacity 5, and a consumer popping them with a 10ms delay between pops.",
      hint: "Two condition_variables: `not_full` and `not_empty`. `push` waits on `not_full` when `q.size() == capacity`. `pop` waits on `not_empty` when `q.empty()`.",
      walkthrough: [
        "queue<T> q; mutex mtx; condition_variable not_full, not_empty; int cap;",
        "push: unique_lock lk; not_full.wait(lk, [&]{ return q.size()<cap; }); q.push(v); not_empty.notify_one();",
        "pop: unique_lock lk; not_empty.wait(lk, [&]{ return !q.empty(); }); T v=q.front(); q.pop(); not_full.notify_one(); return v;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-006-q1",
        type: "choice",
        text: "What happens if you destroy a `std::thread` object without calling `join()` or `detach()`?",
        options: [
          "The thread is automatically joined",
          "std::terminate() is called — the program aborts",
          "The thread continues running as a background task",
          "The destructor blocks until the thread finishes",
        ],
        answer: 1,
        explanation:
          "If a `thread` object's destructor is called while the thread is still joinable (running but not joined/detached), `std::terminate()` is called immediately. This is a hard program abort. Always join or detach before the thread object goes out of scope. Use `jthread` (C++20) for automatic joining.",
      },
      {
        id: "cpp3-006-q2",
        type: "choice",
        text: "Why is `lock_guard` preferred over manual `mutex.lock()/unlock()`?",
        options: [
          "lock_guard is faster",
          "lock_guard uses RAII — the mutex is always unlocked when the guard goes out of scope, even on exceptions",
          "lock_guard supports recursive locking",
          "lock_guard prevents priority inversion",
        ],
        answer: 1,
        explanation:
          "Manual `lock()`/`unlock()` requires a matching unlock for every code path, including exceptions and early returns. Missing one causes a deadlock. `lock_guard` is RAII — its destructor always unlocks, regardless of how the scope is exited.",
      },
      {
        id: "cpp3-006-q3",
        type: "choice",
        text: "Why must `cv.wait()` use `unique_lock` instead of `lock_guard`?",
        options: [
          "unique_lock is faster for condition variables",
          "cv.wait() must release the mutex while sleeping — unique_lock supports manual unlock; lock_guard does not",
          "lock_guard doesn't work with condition_variable",
          "unique_lock provides better spurious wakeup protection",
        ],
        answer: 1,
        explanation:
          "`cv.wait(lock, pred)` atomically releases the lock and sleeps. When notified, it reacquires the lock. This requires unlocking and relocking the mutex, which `lock_guard` doesn't support (it's locked for its entire lifetime). `unique_lock` supports `unlock()` and `lock()` calls.",
      },
      {
        id: "cpp3-006-q4",
        type: "choice",
        text: "When should you use `shared_mutex` over regular `mutex`?",
        options: [
          "Always — shared_mutex is strictly better",
          "When multiple threads read frequently but writes are rare — shared_lock allows concurrent reads",
          "When you need to share the mutex between processes",
          "When the critical section is very short",
        ],
        answer: 1,
        explanation:
          "`shared_mutex` has more overhead than `mutex` (atomic operations on both lock and shared count). It's beneficial when reads dominate writes, as multiple `shared_lock`s can hold the mutex simultaneously. For write-heavy or balanced workloads, regular `mutex` is faster.",
      },
    ],
  },
};

export default lesson;
