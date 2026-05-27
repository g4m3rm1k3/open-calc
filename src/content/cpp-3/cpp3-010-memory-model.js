const RACE_CODE = `#include <iostream>
#include <thread>
using namespace std;

// __OUTPUT__: without sync: data race (UB)\\nwith volatile: still a race (volatile != atomic)\\nuse atomic or mutex

int shared = 0;     // plain int — data race if accessed from multiple threads

void writer() { shared = 42; }
void reader() { int x = shared; (void)x; }

int main() {
    cout << "without sync: data race (UB)\\n";

    // This IS a data race — undefined behavior
    // thread t1(writer), t2(reader);
    // t1.join(); t2.join();
    // Don't run — behavior is undefined

    cout << "with volatile: still a race (volatile != atomic)\\n";
    cout << "use atomic or mutex\\n";

    // volatile only prevents compiler from caching the variable
    // Does NOT prevent CPU reordering or guarantee visibility
    // volatile int v = 0;  // WRONG for inter-thread communication

    return 0;
}`;

const HAPPENS_BEFORE_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: sequenced-before: within one thread\\nsynchronizes-with: across threads via atomic\\nhappens-before: transitive closure

atomic<int> x{0}, y{0};
int r1 = 0, r2 = 0;

void thread1() {
    x.store(1, memory_order_seq_cst);   // A
    r1 = y.load(memory_order_seq_cst);  // B
}

void thread2() {
    y.store(1, memory_order_seq_cst);   // C
    r2 = x.load(memory_order_seq_cst);  // D
}

int main() {
    cout << "sequenced-before: within one thread\\n";
    cout << "synchronizes-with: across threads via atomic\\n";
    cout << "happens-before: transitive closure\\n";

    thread t1(thread1), t2(thread2);
    t1.join(); t2.join();

    // seq_cst guarantees: r1==0 && r2==0 is impossible
    // Either A before C or C before A in the total order
    cout << "r1=" << r1 << " r2=" << r2 << " (not both 0)\\n";

    return 0;
}`;

const REORDER_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: store-load reordering: possible on non-seq_cst\\nacquire-release prevents it\\nseq_cst: total order on all operations

atomic<bool> flag1{false}, flag2{false};
int data1 = 0, data2 = 0;

void produce() {
    data1 = 99;                              // (1)
    flag1.store(true, memory_order_release); // (2) — (1) visible before (2)
}

void consume() {
    while (!flag1.load(memory_order_acquire)); // (3) — waits for (2)
    // (4) happens after (3) acquires — so sees data1=99
    cout << "data1: " << data1 << "\\n";        // guaranteed: 99
}

int main() {
    cout << "store-load reordering: possible on non-seq_cst\\n";
    cout << "acquire-release prevents it\\n";
    cout << "seq_cst: total order on all operations\\n";

    thread t1(produce), t2(consume);
    t1.join(); t2.join();

    return 0;
}`;

const UB_CODE = `#include <iostream>
#include <atomic>
#include <thread>
using namespace std;

// __OUTPUT__: signed overflow: UB (use unsigned or check)\\nnull deref: UB\\nout-of-bounds: UB\\natomic ops: well-defined

int main() {
    cout << "signed overflow: UB (use unsigned or check)\\n";
    // int x = INT_MAX; x++;  // UB — don't do this

    cout << "null deref: UB\\n";
    // int* p = nullptr; *p = 1;  // UB

    cout << "out-of-bounds: UB\\n";
    // int arr[3]; arr[5] = 1;  // UB

    cout << "atomic ops: well-defined\\n";
    atomic<int> a{0};
    thread t1([&]{ a.fetch_add(1, memory_order_relaxed); });
    thread t2([&]{ a.fetch_add(1, memory_order_relaxed); });
    t1.join(); t2.join();
    cout << "result: " << a.load() << "\\n";  // always 2 — defined

    // Data race on plain int: UB — compiler may optimize away the write
    // int counter = 0;
    // thread bad([&]{ counter++; });  // UB with concurrent reads

    return 0;
}`;

const lesson = {
  id: "cpp-3-010",
  slug: "memory-model",
  chapter: "cpp-3",
  order: 10,
  title: "The C++ Memory Model",
  subtitle: "data races, happens-before, sequenced-before, memory_order, undefined behavior",
  tags: ["c++", "cpp", "memory model", "data race", "happens-before", "undefined behavior", "memory_order", "UB"],
  aliases: [
    "c++ memory model",
    "c++ data race",
    "c++ undefined behavior",
    "c++ happens-before",
    "c++ sequenced-before",
  ],

  hook: `C++ has a formal memory model that defines exactly when a value written by one thread is visible to another. Without understanding it, code that looks correct can silently produce wrong results — not because of bugs in your logic, but because the CPU or compiler reordered your instructions. Data races are undefined behavior: not just wrong, but a compiler license to do anything. The memory model tells you exactly what guarantees you have and what you must do to get them.`,

  mentalModel: [
    "**A data race is two threads accessing the same memory, at least one writes, with no synchronization.** Data races are undefined behavior in C++. UB doesn't mean 'might get the wrong value' — it means the compiler can assume it never happens and optimize accordingly. Code that looks harmless under UB can be optimized into something completely unexpected.",
    "**'Happens-before' is the formal ordering relationship.** If A happens-before B, B sees all of A's side effects. Within a single thread, earlier statements happen-before later ones (sequenced-before). Across threads, synchronization operations (acquire/release pairs, seq_cst operations, mutex lock/unlock) create happens-before edges.",
    "**`volatile` is NOT for thread synchronization.** `volatile` prevents the compiler from caching a variable in a register — it's for memory-mapped I/O where hardware changes the value. It does not prevent CPU reordering, does not create happens-before edges, does not make operations atomic. Use `std::atomic` for inter-thread communication.",
  ],

  intuition: {
    prose: [
      "**The CPU and compiler both reorder instructions.** The compiler reorders for optimization (dead code elimination, loop hoisting, register allocation). The CPU executes out of order for performance (store buffers, instruction pipelining). The C++ memory model defines which reorderings are visible to other threads and what synchronization prevents them.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Data races and volatile — run it then explore:**\n\n- Enable the racy thread code (remove the comment) — does it crash? print wrong? (UB: anything can happen)\n- `volatile int v` — is this safe between threads? (no — just prevents register caching)\n- Add `-fsanitize=thread` to compilation: TSan detects data races at runtime.\n- Try atomics: replace `shared` with `atomic<int>` — now it's defined behavior.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RACE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Happens-before and seq_cst — run it then explore:**\n\n- Run 1000 times: can you ever get r1==0 && r2==0? (no — seq_cst prevents it)\n- Change to `memory_order_relaxed` on all operations — now r1==0 && r2==0 is possible.\n- 'Sequenced-before': A is sequenced-before B in the same thread — does this always mean B sees A? (yes, within a thread)\n- Draw the happens-before graph for thread1 and thread2.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": HAPPENS_BEFORE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Store-load reordering: the most dangerous reordering.** On x86, stores and loads to different addresses are not reordered (Total Store Order). On ARM and POWER, they can be. A relaxed store followed by a relaxed load to a different address may appear swapped to another thread. `seq_cst` prevents this via a full memory barrier. `acquire`/`release` prevents it for the specific acquire-release pair but not in general.",
      "**UB is a contract between you and the compiler.** The compiler assumes your code has no UB and optimizes accordingly. A data race is UB — the compiler can eliminate a dead store to a variable it 'knows' no other thread touches (because you promised no data race). This is why race conditions can disappear at low optimization and appear at `-O2`. Always use atomic or mutex for shared mutable state.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Acquire-release ordering — run it then explore:**\n\n- Remove the release from flag1.store — is data1 guaranteed visible? (no)\n- Remove the acquire from flag1.load — same issue: no synchronization.\n- Can the consume thread see flag1=true but data1=0? Only without acquire-release.\n- Add data2 written before the release — is it also visible after the acquire? (yes — release carries all prior writes)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": REORDER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Undefined behavior in practice — run it then explore:**\n\n- Enable the signed overflow line — at `-O2` the compiler may eliminate the overflow check entirely.\n- Enable the out-of-bounds write — with AddressSanitizer (`-fsanitize=address`) it's detected.\n- The atomic counter always gives 2 — verify by running 1000 times.\n- Compare: `counter++` on a plain int from two threads under TSan (`-fsanitize=thread`) — race detected.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": UB_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Data race = undefined behavior, not just 'might get wrong answer'",
        body: "A data race gives the compiler permission to assume the variable is never accessed by another thread and optimize aggressively. A real-world example: a spin-wait `while (!flag)` on a non-atomic `flag` can be compiled into `if (!flag) while(true)` — an infinite loop — because the compiler sees no way `flag` can change (no synchronization). Always use `atomic<bool>`.",
      },
      {
        type: "tip",
        title: "Use ThreadSanitizer (TSan) during testing",
        body: "Compile with `-fsanitize=thread` (Clang/GCC) to detect data races at runtime. TSan adds ~5-15x overhead but catches races that static analysis misses. Run your test suite with TSan on CI — races that appear only under load are easier to catch with a sanitizer than to debug from a crash.",
      },
    ],
  },

  examples: [
    {
      title: "Double-checked locking — correct C++11 version",
      body: `#include <atomic>
#include <mutex>

class Singleton {
    static std::atomic<Singleton*> instance;
    static std::mutex mtx;
public:
    static Singleton* get() {
        Singleton* p = instance.load(std::memory_order_acquire);
        if (!p) {
            std::lock_guard<std::mutex> lock(mtx);
            p = instance.load(std::memory_order_relaxed);
            if (!p) {
                p = new Singleton();
                instance.store(p, std::memory_order_release);
            }
        }
        return p;
    }
};
// acquire on read: see the fully-constructed object
// release on write: object construction visible before pointer is published`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Identify the data race in this code and fix it with `std::atomic`. Then explain WHY the original code is undefined behavior, not just 'probably wrong': `int hits = 0; void handler() { hits++; }` called from 10 concurrent threads.",
      hint: "`atomic<int> hits{0};` then `hits.fetch_add(1, memory_order_relaxed)` — relaxed is fine for a counter.",
      walkthrough: [
        "int hits++ is NOT atomic: it's load, add, store — three separate operations",
        "Another thread can read between the load and store — lost update",
        "Two threads doing hits++ simultaneously may both read 5, both store 6 — one increment lost",
        "Fix: atomic<int> hits{0}; hits.fetch_add(1, memory_order_relaxed);",
        "UB because: compiler can eliminate the load/store under the assumption no other thread touches it",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a publish-subscribe flag correctly using acquire-release: a producer writes data to a struct, then sets an atomic bool `published`. A consumer spins on `published` and then reads the struct. Write both producer and consumer, use the correct memory orders, and explain what breaks if you use `memory_order_relaxed` on both.",
      hint: "Producer: write struct, then `published.store(true, release)`. Consumer: `while (!published.load(acquire))`. The acquire-release pair is the synchronization edge.",
      walkthrough: [
        "struct Msg { int id; string text; } msg;",
        "atomic<bool> published{false};",
        "Producer: msg = {1, 'hello'}; published.store(true, memory_order_release);",
        "Consumer: while(!published.load(memory_order_acquire)); // then read msg safely",
        "With relaxed: no synchronization edge — consumer may see published=true but msg still uninitialized",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp3-010-q1",
        type: "choice",
        text: "What exactly is a data race in C++?",
        options: [
          "Any situation where two threads access the same variable",
          "Two threads accessing the same memory location, at least one is a write, without any synchronization between them",
          "A race condition that causes incorrect output",
          "Using a mutex incorrectly",
        ],
        answer: 1,
        explanation:
          "A data race requires: (1) two or more threads, (2) accessing the same memory location, (3) at least one access is a write, (4) no happens-before relationship between the accesses. All four conditions must be true. Two concurrent reads are NOT a data race. Adding a mutex or atomic operations eliminates the data race by creating a happens-before edge.",
      },
      {
        id: "cpp3-010-q2",
        type: "choice",
        text: "Why is `volatile int x` NOT safe for inter-thread communication?",
        options: [
          "volatile variables are read-only",
          "volatile only prevents compiler register-caching — it does not prevent CPU reordering, does not create happens-before edges, and does not make operations atomic",
          "volatile is deprecated in C++20",
          "volatile requires a special lock",
        ],
        answer: 1,
        explanation:
          "`volatile` was designed for memory-mapped I/O where hardware can change a variable's value outside the program. It tells the compiler: 'don't cache this in a register, always load/store to memory.' But it says nothing about ordering or atomicity at the CPU level. On ARM, a volatile store can still be reordered with a volatile load. Use `std::atomic`.",
      },
      {
        id: "cpp3-010-q3",
        type: "choice",
        text: "What is the 'happens-before' relationship?",
        options: [
          "A guarantee that A executes before B in wall-clock time",
          "A formal ordering: if A happens-before B, B is guaranteed to see all side effects of A — includes sequenced-before (within a thread) and synchronizes-with (across threads via atomics/mutex)",
          "The order in which threads are scheduled by the OS",
          "A guarantee only provided by seq_cst operations",
        ],
        answer: 1,
        explanation:
          "'Happens-before' is a formal partial order defined by the C++ memory model. It's not about time — it's about visibility. If A happens-before B, B must observe all writes done by A. It's built from: sequenced-before (same thread), synchronizes-with (atomic acquire/release pairs, mutex lock/unlock), and is transitively closed.",
      },
      {
        id: "cpp3-010-q4",
        type: "choice",
        text: "Under what conditions can the compiler optimize away a spin-wait loop like `while (!flag)` making it an infinite loop?",
        options: [
          "When flag is declared static",
          "When flag is a non-atomic, non-volatile plain variable — the compiler assumes no other thread modifies it (no data race allowed) and may hoist the load out of the loop",
          "Only when -O3 is used",
          "When the thread has high priority",
        ],
        answer: 1,
        explanation:
          "The compiler assumes your code has no undefined behavior. A non-atomic `flag` accessed by multiple threads is a data race (UB). Given that UB 'can't happen', the compiler concludes only this thread modifies `flag`. Since `flag` is false before the loop and not written in the loop, it hoists the load: `if (!flag) while(true)`. This is why `atomic<bool>` is required for signal flags between threads.",
      },
    ],
  },
};

export default lesson;
