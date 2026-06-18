const ATOMIC_BASIC_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: counter: 1000\\nflag: 1\\nloaded: 42

atomic<int> counter{0};
atomic<bool> flag{false};

void bump(int n) {
    for (int i = 0; i < n; i++)
        counter.fetch_add(1, memory_order_relaxed);
}

int main() {
    thread t1(bump, 500), t2(bump, 500);
    t1.join(); t2.join();
    cout << "counter: " << counter.load() << "\\n";

    flag.store(true);
    cout << "flag: " << flag.load() << "\\n";

    atomic<int> x{42};
    cout << "loaded: " << x.load(memory_order_seq_cst) << "\\n";

    return 0;
}`;

const CAS_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: CAS succeeded: old=0 new=1\\nCAS failed: expected=1 actual=1\\nfinal: 5

atomic<int> val{0};

void cas_loop(int target) {
    int expected = val.load();
    while (!val.compare_exchange_weak(expected, target)) {
        // expected updated to current val on failure — retry
    }
}

int main() {
    int exp = 0;
    bool ok = val.compare_exchange_strong(exp, 1);
    cout << "CAS succeeded: old=" << exp << " new=" << val.load() << "\\n";

    exp = 1;
    ok = val.compare_exchange_strong(exp, 99);
    cout << "CAS failed: expected=" << 1 << " actual=" << exp << "\\n";

    // CAS loop: multiple threads racing to set val
    val = 0;
    thread t1(cas_loop, 5), t2(cas_loop, 5);
    t1.join(); t2.join();
    cout << "final: " << val.load() << "\\n";

    return 0;
}`;

const MEMORDER_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: seq_cst: safe\\nacquire-release: safe for single producer\\nrelaxed: ordering not guaranteed

atomic<int> data{0};
atomic<bool> ready{false};

void producer() {
    data.store(42, memory_order_relaxed);
    ready.store(true, memory_order_release);  // release: data write happens before
}

void consumer() {
    while (!ready.load(memory_order_acquire));  // acquire: sees data write after
    cout << "data: " << data.load(memory_order_relaxed) << "\\n";
}

int main() {
    cout << "seq_cst: safe\\n";
    cout << "acquire-release: safe for single producer\\n";
    cout << "relaxed: ordering not guaranteed\\n";

    thread prod(producer), cons(consumer);
    prod.join(); cons.join();

    return 0;
}`;

const LOCKFREE_CODE = `#include <iostream>
#include <atomic>
#include <thread>
#include <vector>
using namespace std;

// __OUTPUT__: lock-free stack push/pop\\npopped: 3\\npopped: 2\\npopped: 1\\nis_lock_free: 1

struct Node { int val; Node* next; };

struct LockFreeStack {
    atomic<Node*> head{nullptr};

    void push(int v) {
        Node* n = new Node{v, head.load()};
        while (!head.compare_exchange_weak(n->next, n));
    }

    int pop() {
        Node* old = head.load();
        while (old && !head.compare_exchange_weak(old, old->next));
        return old ? old->val : -1;
    }
};

int main() {
    LockFreeStack s;
    cout << "lock-free stack push/pop\\n";
    s.push(1); s.push(2); s.push(3);
    cout << "popped: " << s.pop() << "\\n";
    cout << "popped: " << s.pop() << "\\n";
    cout << "popped: " << s.pop() << "\\n";
    cout << "is_lock_free: " << s.head.is_lock_free() << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-3-007",
  slug: "atomics",
  chapter: "cpp-3",
  order: 7,
  title: "Atomics and Lock-Free Programming",
  subtitle: "std::atomic, fetch_add, compare_exchange, memory_order",
  tags: ["c++", "cpp", "atomic", "lock-free", "memory_order", "compare_exchange", "concurrency"],
  aliases: [
    "c++ atomic",
    "c++ lock-free",
    "c++ memory order",
    "c++ compare_exchange",
    "c++ fetch_add",
  ],

  hook: `Mutex serializes access — only one thread at a time. For simple shared counters or flags, that's overkill. \`std::atomic<T>\` gives you thread-safe read-modify-write operations without locking. But atomics come with a subtlety: the CPU and compiler can reorder instructions. \`memory_order\` controls that reordering. Get it wrong and you have a data race with no mutex to blame.`,

  mentalModel: [
    "**`atomic<T>` operations are indivisible.** `fetch_add`, `load`, `store`, `exchange` complete atomically — no other thread can observe a half-done operation. This eliminates data races on the atomic itself, but NOT on non-atomic data it guards.",
    "**`compare_exchange_weak/strong` is the foundation of lock-free algorithms.** CAS atomically: if current value equals expected, write new value and return true. If not, write current value into expected and return false. `_weak` may spuriously fail (use in a loop). `_strong` never spuriously fails.",
    "**`memory_order` controls visibility of surrounding operations.** `seq_cst` is safest (default): total order across all threads. `acquire`/`release` pair: release ensures prior writes visible to thread that does acquire. `relaxed`: no ordering guarantees beyond atomicity of the operation itself.",
  ],

  intuition: {
    prose: [
      "**Atomics vs mutex: pick the right tool.** For a single counter or flag, `atomic<int>` is faster than `mutex` — no kernel involvement, no thread sleep/wake. For protecting a struct with multiple fields (invariant: fields must be consistent with each other), use `mutex` — atomics can't protect multi-variable invariants.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Atomic basics — run it then explore:**\n\n- Replace `fetch_add(1, memory_order_relaxed)` with `counter++` — does it still compile? (yes, `++` is atomic too)\n- Change to 100 threads × 100 increments — still correct?\n- `exchange(val)`: atomically sets and returns old value — try it.\n- `atomic<int>` vs `volatile int`: remove atomic, add volatile — run 10 threads — count is wrong.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ATOMIC_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**compare_exchange — run it then explore:**\n\n- `compare_exchange_strong` vs `_weak`: strong never spuriously fails — use in non-loop contexts.\n- CAS loop pattern: load → compute new value → CAS — retry on failure.\n- Build a lock-free max: multiple threads try to CAS in their value only if larger than current.\n- `fetch_add` returns the OLD value — use it to implement a unique ID generator.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CAS_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`memory_order` is about instruction reordering, not correctness of the atomic itself.** The CPU and compiler reorder independent instructions for performance. `memory_order_release` on a store: all preceding writes are visible before this store. `memory_order_acquire` on a load: all subsequent reads see writes that happened before the corresponding release. Together they form a synchronization point — the classic producer/consumer handoff.",
      "**`memory_order_relaxed` only guarantees atomicity.** No ordering with respect to other memory operations. Use only for counters where you just need the final value to be correct, not for signaling between threads. `seq_cst` (default) imposes a total order on all seq_cst operations across all threads — expensive on ARM, where it requires a full memory barrier.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**memory_order acquire-release — run it then explore:**\n\n- Change `memory_order_release` to `memory_order_relaxed` on ready.store — is data guaranteed visible? (no)\n- Change `memory_order_acquire` to `memory_order_relaxed` on ready.load — same issue.\n- Add a second data variable: `data2.store(99, relaxed)` before ready.store — is data2 visible after acquire? (yes — release 'carries' all prior writes)\n- `memory_order_seq_cst` on both: identical behavior here, but ensures total order.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MEMORDER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Lock-free stack — run it then explore:**\n\n- Push 1000 items from 10 threads concurrently — does pop retrieve all 1000?\n- `is_lock_free()`: returns true if no mutex used internally — verify on your platform.\n- ABA problem: if memory is reused, old pointer == new pointer but data changed — this simple stack has ABA. Research hazard pointers.\n- Compare throughput vs a mutex-protected stack for 1M push/pop operations.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": LOCKFREE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Atomics don't protect non-atomic data from races",
        body: "An `atomic<bool> ready` flag doesn't protect a plain `int data`. You need the acquire/release pair on the flag to ensure the non-atomic data is visible. Without it, `data` is still a data race even if `ready` is atomic.",
      },
      {
        type: "tip",
        title: "Default memory_order_seq_cst is safe but expensive on ARM",
        body: "On x86, seq_cst loads are free (x86 is TSO). On ARM, seq_cst requires a full DMB barrier on every load — expensive. Use acquire/release when the total order isn't needed. Use relaxed for pure counters (stats, metrics) where order doesn't matter.",
      },
    ],
  },

  examples: [
    {
      title: "Spinlock using atomic_flag",
      body: `#include <atomic>

class Spinlock {
    std::atomic_flag flag = ATOMIC_FLAG_INIT;
public:
    void lock() {
        while (flag.test_and_set(std::memory_order_acquire))
            ;  // spin
    }
    void unlock() {
        flag.clear(std::memory_order_release);
    }
};

// Use like mutex:
// Spinlock sl;
// sl.lock();
// // critical section
// sl.unlock();
// Or with lock_guard via std::lock_guard<Spinlock>`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a thread-safe reference counter using `std::atomic<int>`. Methods: `addRef()` increments, `release()` decrements and returns true when count reaches zero (caller should delete). Use `memory_order_acq_rel` on release so destructor work is visible.",
      hint: "`fetch_sub(1, memory_order_acq_rel) == 1` means it just hit zero.",
      walkthrough: [
        "atomic<int> count{1};",
        "void addRef() { count.fetch_add(1, memory_order_relaxed); }",
        "bool release() { return count.fetch_sub(1, memory_order_acq_rel) == 1; }",
        "acq_rel on release: acquire ensures we see all prior writes to the object; release ensures our writes are visible before destruction",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a lock-free single-producer single-consumer (SPSC) queue using two atomics: `head` (consumer advances) and `tail` (producer advances). Use a fixed-size circular buffer. `push` fails if full, `pop` fails if empty. Use `memory_order_release` on tail write and `memory_order_acquire` on tail read.",
      hint: "Producer writes at `tail % N`, stores with release. Consumer reads at `head % N`, loads tail with acquire to see the write.",
      walkthrough: [
        "T buf[N]; atomic<size_t> head{0}, tail{0};",
        "bool push(T v): size_t t=tail.load(relaxed); if t-head.load(acquire)==N return false; buf[t%N]=v; tail.store(t+1, release); return true;",
        "bool pop(T& v): size_t h=head.load(relaxed); if tail.load(acquire)==h return false; v=buf[h%N]; head.store(h+1, release); return true;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-007-q1",
        type: "choice",
        text: "What does `compare_exchange_weak` do when the current value does NOT equal expected?",
        options: [
          "It writes the new value anyway and returns true",
          "It writes the current value into expected and returns false",
          "It throws an exception",
          "It blocks until the value equals expected",
        ],
        answer: 1,
        explanation:
          "CAS (compare-and-swap): if current == expected, write new value, return true. If current != expected, write current value INTO expected (so you can see what it actually is) and return false. This lets you retry with the updated expected value. `_weak` may also fail spuriously (return false even when equal) — always use in a retry loop.",
      },
      {
        id: "cpp3-007-q2",
        type: "choice",
        text: "When should you use `memory_order_relaxed`?",
        options: [
          "Never — seq_cst is always correct",
          "For independent counters/stats where you only need the final value to be correct, not ordering with other memory",
          "For any producer/consumer pattern",
          "When using compare_exchange",
        ],
        answer: 1,
        explanation:
          "`memory_order_relaxed` provides atomicity only — no ordering with respect to other memory operations. It's correct for hit counters, statistics, or any scenario where you only need the cumulative value to be correct, not to signal that other data is ready. Using it for producer/consumer flags is a bug.",
      },
      {
        id: "cpp3-007-q3",
        type: "choice",
        text: "What is the acquire/release pair used for?",
        options: [
          "Locking and unlocking a mutex",
          "Ensuring a store (release) and a later load (acquire) of the same atomic create a synchronization point: writes before the release are visible after the acquire",
          "Making all atomic operations seq_cst",
          "Preventing the CPU from executing instructions out of order globally",
        ],
        answer: 1,
        explanation:
          "A `store(release)` on atomic A followed by a `load(acquire)` on the same A in another thread creates a happens-before edge. All memory writes that happened before the release store are guaranteed to be visible after the acquire load — even non-atomic writes. This is how you safely pass data between producer and consumer.",
      },
      {
        id: "cpp3-007-q4",
        type: "choice",
        text: "Why is `atomic<int>` NOT sufficient to protect a multi-field struct?",
        options: [
          "atomic only works with primitive types",
          "An atomic protects a single variable — two atomic stores to separate fields are not jointly atomic; another thread can observe one update but not the other",
          "atomic is slower than mutex for structs",
          "Structs require shared_mutex",
        ],
        answer: 1,
        explanation:
          "A data structure invariant often requires multiple fields to be updated together (e.g., `size` and `capacity`). Two separate atomic operations are NOT a single atomic transaction — a thread can observe `size` updated but `capacity` not yet. Use `mutex` to protect invariants spanning multiple variables.",
      },
    ],
  },
};

export default lesson;
