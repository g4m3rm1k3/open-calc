const ASAN_CODE = `#include <iostream>
#include <vector>
using namespace std;

// __OUTPUT__: AddressSanitizer catches: heap buffer overflow\\nuse-after-free\\nstack overflow\\nmemory leak

// These bugs are SILENT without ASan — wrong output or crash later
void demo_bugs() {
    // Bug 1: heap buffer overflow
    // vector<int> v(5);
    // v[10] = 1;  // ASan: heap-buffer-overflow at line X

    // Bug 2: use after free
    // int* p = new int(42);
    // delete p;
    // cout << *p;  // ASan: heap-use-after-free

    // Bug 3: stack buffer overflow
    // int arr[5];
    // arr[6] = 1;  // ASan: stack-buffer-overflow

    // Bug 4: memory leak
    // int* leak = new int[100];  // ASan: detected at exit

    cout << "AddressSanitizer catches: heap buffer overflow\\n";
    cout << "use-after-free\\n";
    cout << "stack overflow\\n";
    cout << "memory leak\\n";
}

int main() {
    demo_bugs();
    return 0;
}
// Compile: g++ -fsanitize=address -fno-omit-frame-pointer -g -O1 main.cpp`;

const UBSAN_CODE = `#include <iostream>
#include <climits>
using namespace std;

// __OUTPUT__: UBSan catches: signed overflow\\nnull deref\\nshift overflow\\ndivide by zero

void demo_ub() {
    // Bug 1: signed integer overflow (UB in C++)
    // int x = INT_MAX;
    // x++;  // UBSan: signed integer overflow: INT_MAX + 1

    // Bug 2: null pointer dereference
    // int* p = nullptr;
    // *p = 1;  // UBSan: null-pointer-dereference

    // Bug 3: shift by too much
    // int x = 1;
    // x << 64;  // UBSan: shift exponent 64 is too large for 32-bit type int

    // Bug 4: integer divide by zero
    // int a = 1, b = 0;
    // int c = a / b;  // UBSan: division by zero

    cout << "UBSan catches: signed overflow\\n";
    cout << "null deref\\n";
    cout << "shift overflow\\n";
    cout << "divide by zero\\n";
}

int main() {
    demo_ub();
    return 0;
}
// Compile: g++ -fsanitize=undefined -g main.cpp`;

const TSAN_CODE = `#include <iostream>
#include <thread>
#include <atomic>
using namespace std;

// __OUTPUT__: TSan catches data races\\nsafe atomic: 2000\\nunsafe int (TSan would flag this): avoid

atomic<int> safe_counter{0};
int unsafe_counter = 0;   // data race if accessed from multiple threads

void bump_safe() {
    for (int i = 0; i < 1000; i++)
        safe_counter.fetch_add(1, memory_order_relaxed);
}

void bump_unsafe() {
    for (int i = 0; i < 1000; i++)
        unsafe_counter++;   // TSan: data race on unsafe_counter
}

int main() {
    cout << "TSan catches data races\\n";

    thread t1(bump_safe), t2(bump_safe);
    t1.join(); t2.join();
    cout << "safe atomic: " << safe_counter << "\\n";

    // Don't run the unsafe version under TSan:
    // thread t3(bump_unsafe), t4(bump_unsafe);
    // t3.join(); t4.join();
    cout << "unsafe int (TSan would flag this): avoid\\n";

    return 0;
}
// Compile: g++ -fsanitize=thread -g main.cpp`;

const VALGRIND_CODE = `#include <iostream>
#include <cstring>
using namespace std;

// __OUTPUT__: Valgrind: memcheck finds uninit reads\\nheap leaks\\nvalgrind --leak-check=full\\nno false negatives on real programs

void demo_valgrind() {
    // Bug 1: reading uninitialized memory
    // int x;
    // if (x > 0) cout << "positive\\n";  // Valgrind: Conditional jump on uninit value

    // Bug 2: memory leak
    // char* buf = new char[100];
    // strcpy(buf, "hello");
    // // no delete — Valgrind: 100 bytes definitely lost

    // Bug 3: invalid read (freed memory)
    // int* p = new int(5);
    // delete p;
    // cout << *p;  // Valgrind: Invalid read of size 4

    cout << "Valgrind: memcheck finds uninit reads\\n";
    cout << "heap leaks\\n";
    cout << "valgrind --leak-check=full\\n";
    cout << "no false negatives on real programs\\n";
}

// vs ASan: Valgrind is slower (10-30x) but needs no recompile
// ASan is faster (2x) but requires recompile with -fsanitize=address

int main() {
    demo_valgrind();
    return 0;
}`;

const lesson = {
  id: "cpp-4-003",
  slug: "sanitizers",
  chapter: "cpp-4",
  order: 3,
  title: "Sanitizers and Debugging",
  subtitle: "AddressSanitizer, UBSan, ThreadSanitizer, Valgrind, gdb",
  tags: ["c++", "cpp", "sanitizer", "asan", "ubsan", "tsan", "valgrind", "debugging", "gdb"],
  aliases: [
    "c++ sanitizer",
    "c++ asan",
    "c++ ubsan",
    "c++ tsan",
    "c++ valgrind",
    "c++ debugging",
  ],

  hook: `C++ bugs don't always crash at the bug site. A buffer overflow corrupts memory that crashes 10 function calls later with a misleading error. An uninitialized variable silently produces wrong output. A data race is wrong 1% of the time. Sanitizers are compiler-inserted instrumentation that catches bugs precisely at the point they happen — with a full stack trace. They're not optional: run ASan and UBSan on every test run.`,

  mentalModel: [
    "**AddressSanitizer (ASan) catches memory safety violations.** Heap buffer overflow, use-after-free, stack overflow, heap use-after-return, memory leaks. Compile with `-fsanitize=address -g`. ~2x slowdown. Reports the exact line, the allocation site, and the access. Use on every test run.",
    "**UBSan catches undefined behavior.** Signed integer overflow, null pointer dereference, shift by too-large amount, alignment violations, integer divide by zero. Compile with `-fsanitize=undefined`. Minimal overhead. The compiler assumes UB can't happen and optimizes accordingly — UBSan catches where that assumption breaks.",
    "**ThreadSanitizer (TSan) catches data races.** Reports the two conflicting accesses with full stack traces for both threads. ~5-15x slowdown, significant memory overhead. Can't combine with ASan. Run TSan on concurrent code in CI. Note: TSan has occasional false positives with non-standard lock implementations.",
  ],

  intuition: {
    prose: [
      "**Sanitizers are not optional tools for hard bugs — they catch easy bugs you miss.** A one-character typo like `arr[n]` instead of `arr[n-1]` is an off-by-one that ASan catches immediately with a clear error. Without ASan, the bug silently corrupts memory and crashes somewhere unrelated, often only in production under load. The cost of enabling sanitizers on your test suite is 2x slowdown — a small price for instant, precise bug reports.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**AddressSanitizer — read then explore:**\n\n- Uncomment the heap buffer overflow: does it crash immediately? (yes, with ASan)\n- Without ASan: does `v[10] = 1` always crash? (no — silent memory corruption)\n- ASan output includes the allocation stack trace — trace back to `new`/`push_back`.\n- Memory leak detection: run with `ASAN_OPTIONS=detect_leaks=1` (default on Linux).\n- Combine: `-fsanitize=address,undefined` catches both at once.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ASAN_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**UBSan — read then explore:**\n\n- Uncomment signed overflow: at `-O0` it may 'work', at `-O2` the compiler assumes it can't happen and optimizes it away.\n- `INT_MAX + 1` is UB for `int` — use `unsigned int` or `__builtin_add_overflow` for checked arithmetic.\n- UBSan with `-fsanitize=undefined,integer`: adds integer overflow checking.\n- Null pointer deref: UBSan catches it before the crash — with the source line.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": UBSAN_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**ThreadSanitizer instruments every memory access.** At runtime, TSan maintains a 'shadow memory' that tracks the last thread to read/write each location. If two threads access the same location without a happens-before relationship, TSan reports the data race with both stack traces. The report shows the conflicting access, the previous access, and the thread creating the conflict.",
      "**Valgrind's memcheck runs without recompilation.** `valgrind --leak-check=full ./myapp` runs your existing binary under instrumentation. 10-30x slowdown. Catches uninitialized reads, invalid memory accesses, and leaks. Useful for third-party code you can't recompile, or when confirming ASan findings. Prefer ASan+sanitize flags for code you control — faster and more precise.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**ThreadSanitizer — read then explore:**\n\n- Uncomment `bump_unsafe` and run two threads — TSan reports the data race.\n- TSan report shows: 'WRITE of size 4 by thread T2' + 'READ of size 4 by thread T1'.\n- Add `mutex mtx; lock_guard<mutex> lock(mtx);` inside bump_unsafe — TSan passes.\n- TSan false positive rate: near-zero for standard sync, higher for custom lock-free code.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TSAN_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Valgrind vs ASan — read then explore:**\n\n- Uncomment the uninitialized variable: does your compiler warn? (often yes with -Wall)\n- Valgrind catches more false negatives than ASan for uninitialized values — why? (shadow tracking vs redzone approach)\n- `valgrind --tool=callgrind ./myapp` — call graph profiler (different tool)\n- When does Valgrind shine over ASan? (binaries without debug symbols, third-party code)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VALGRIND_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "ASan and TSan cannot be combined",
        body: "AddressSanitizer and ThreadSanitizer use incompatible shadow memory implementations. You must choose: `-fsanitize=address,undefined` OR `-fsanitize=thread`. Run two separate CI jobs — one with ASan+UBSan, one with TSan. They catch different categories of bugs.",
      },
      {
        type: "tip",
        title: "Add sanitizers to your CMake Debug build by default",
        body: "In CMakeLists.txt: `if(CMAKE_BUILD_TYPE STREQUAL Debug)` → `target_compile_options(mylib PRIVATE -fsanitize=address,undefined)` + `target_link_options(mylib PRIVATE -fsanitize=address,undefined)`. Then all Debug builds automatically run with sanitizers — no developer needs to remember.",
      },
    ],
  },

  examples: [
    {
      title: "gdb quick reference",
      body: `# Compile with debug info (no optimization for accurate line numbers)
g++ -g -O0 -o myapp main.cpp

# Start gdb
gdb ./myapp

# Common gdb commands:
# run [args]         — start the program
# bt                 — backtrace: show call stack on crash
# frame N            — switch to stack frame N
# print x            — print variable x
# info locals        — print all local variables in current frame
# break file.cpp:42  — set breakpoint at line 42
# break func_name    — set breakpoint at function entry
# next               — step over (don't enter function calls)
# step               — step into
# continue           — run until next breakpoint
# watch x            — break when variable x changes

# Run under ASan in gdb: ASAN_OPTIONS=abort_on_error=1 gdb ./myapp
# The ASAN report is printed, then the abort() lets gdb show the backtrace`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Take this buggy code and identify all bugs using sanitizer reasoning (even without running it): `void f() { int* p = new int[10]; for (int i = 0; i <= 10; i++) p[i] = i; }`. List: (1) what ASan would report, (2) what line, (3) what the fix is.",
      hint: "Loop goes `i <= 10` — that's 11 elements (0-10) in a 10-element array. Also: `delete[] p` missing.",
      walkthrough: [
        "Bug 1: p[10] = 10 — heap-buffer-overflow (array size 10, index 10 is out of bounds)",
        "ASan: heap-buffer-overflow on write of size 4 at offset 40 in region of size 40",
        "Fix 1: change i <= 10 to i < 10",
        "Bug 2: no delete[] p — memory leak",
        "ASan: 40 bytes in 1 blocks are definitely lost",
        "Fix 2: add delete[] p; at end of function (or use vector)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a function `int sum_array(int* arr, int n)` and then write a test that intentionally triggers an ASan heap-buffer-overflow by passing `n` larger than the allocated array. Catch the ASan signal using `signal(SIGABRT, ...)` and return -1 instead of crashing. Then explain why this is the WRONG approach to handling ASan errors.",
      hint: "ASan calls `abort()` on error — you CAN catch SIGABRT. But the right fix is to fix the bug, not catch the abort.",
      walkthrough: [
        "Catching SIGABRT from ASan errors hides the bug — it doesn't fix it",
        "The memory is already corrupted when ASan fires — the program state is undefined",
        "The right approach: fix the bounds check (pass correct n, or check n against allocation size)",
        "Use assertions: assert(n <= allocated_size)",
        "Or use span<int> which carries its own size",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-003-q1",
        type: "choice",
        text: "What does AddressSanitizer detect that a regular crash does not?",
        options: [
          "Logic errors in algorithms",
          "The exact line of the memory violation — including violations that corrupt memory silently without crashing (yet)",
          "Performance bottlenecks",
          "Missing return statements",
        ],
        answer: 1,
        explanation:
          "Without ASan, a heap buffer overflow might corrupt memory that isn't accessed until 10 function calls later — the crash is misleading. ASan instruments every memory access with bounds checks, detecting the violation precisely where it happens with a full stack trace to both the access and the allocation.",
      },
      {
        id: "cpp4-003-q2",
        type: "choice",
        text: "Why does UBSan catch bugs that crash at -O0 but disappear at -O2?",
        options: [
          "-O2 fixes undefined behavior automatically",
          "The compiler assumes UB cannot happen and optimizes based on that assumption — the undefined operation is compiled away, but the program's behavior is now wrong in a different way",
          "-O2 turns off UBSan",
          "UBSan only works at -O0",
        ],
        answer: 1,
        explanation:
          "The compiler transforms code assuming no UB. Signed overflow 'can't happen', so `if (x + 1 > x)` (true for non-INT_MAX) gets optimized to `if (true)`. At -O2 this check disappears. The bug is still there — UBSan catches it at -O2 too, before the compiler makes incorrect assumptions. This is why UBSan matters most at high optimization.",
      },
      {
        id: "cpp4-003-q3",
        type: "choice",
        text: "Why can't AddressSanitizer and ThreadSanitizer be used simultaneously?",
        options: [
          "They slow the program too much together",
          "Both use incompatible shadow memory implementations — they claim overlapping address ranges for instrumentation metadata",
          "ASan only works on Linux, TSan only on macOS",
          "TSan requires LLVM, ASan requires GCC",
        ],
        answer: 1,
        explanation:
          "ASan uses a shadow memory mapping to track 8 bytes of application memory per 1 byte of shadow. TSan uses a different shadow memory layout to track per-address thread access history. Both try to use fixed shadow memory address ranges that overlap — enabling both causes a startup crash or incorrect behavior.",
      },
      {
        id: "cpp4-003-q4",
        type: "choice",
        text: "When should you prefer Valgrind over AddressSanitizer?",
        options: [
          "Always — Valgrind is more accurate",
          "When you can't recompile the binary (third-party code, release builds) or need to detect uninitialized value reads more comprehensively",
          "For performance profiling",
          "When the bug is a data race",
        ],
        answer: 1,
        explanation:
          "ASan requires recompilation with `-fsanitize=address`. Valgrind runs any existing binary with no recompilation needed. Valgrind's memcheck also tracks uninitialized value reads more aggressively than ASan. Tradeoff: Valgrind is 10-30x slower vs ASan's ~2x. For code you control, prefer ASan. For binaries you can't recompile, use Valgrind.",
      },
    ],
  },
};

export default lesson;
