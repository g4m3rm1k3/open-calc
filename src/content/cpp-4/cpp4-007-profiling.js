const BENCH_CHRONO_CODE = `#include <iostream>
#include <chrono>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;
using namespace chrono;

// __OUTPUT__: sum (loop): ~1ms\\nsum (accumulate): ~1ms\\ncache-friendly: fast\\ncache-unfriendly: slow

template<typename F>
long long time_us(F&& f) {
    auto t0 = steady_clock::now();
    f();
    auto t1 = steady_clock::now();
    return duration_cast<microseconds>(t1 - t0).count();
}

int main() {
    vector<int> v(1000000);
    iota(v.begin(), v.end(), 0);

    long long s1 = 0;
    auto t1 = time_us([&]{
        for (int x : v) s1 += x;
    });
    cout << "sum (loop): " << t1 << "us\\n";

    long long s2 = 0;
    auto t2 = time_us([&]{
        s2 = accumulate(v.begin(), v.end(), 0LL);
    });
    cout << "sum (accumulate): " << t2 << "us\\n";

    // Cache friendly: sequential access
    auto t3 = time_us([&]{
        long long s = 0;
        for (int i = 0; i < (int)v.size(); i++) s += v[i];
    });

    // Cache unfriendly: stride-64 access
    auto t4 = time_us([&]{
        long long s = 0;
        for (int i = 0; i < (int)v.size(); i += 64) s += v[i];
    });

    cout << "cache-friendly: " << t3 << "us\\n";
    cout << "cache-unfriendly: " << t4 << "us\\n";

    return 0;
}`;

const PERF_PATTERNS_CODE = `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

// __OUTPUT__: AoS (Array of Structs): typical layout\\nSoA (Struct of Arrays): cache-optimal\\nstring move: zero copy\\nreserve: avoids realloc

struct ParticleAoS {      // Array of Structs
    float x, y, z;        // position
    float vx, vy, vz;     // velocity (often unused in position-only loop)
};

struct ParticlesSoA {     // Struct of Arrays
    vector<float> x, y, z;      // all positions contiguous
    vector<float> vx, vy, vz;   // all velocities contiguous
};

int main() {
    // AoS: iterating positions loads unused velocity data
    vector<ParticleAoS> aos(10000);
    float sum_aos = 0;
    for (auto& p : aos) sum_aos += p.x + p.y + p.z;   // loads vx,vy,vz too
    cout << "AoS (Array of Structs): typical layout\\n";

    // SoA: only position arrays loaded — 2x better cache use
    ParticlesSoA soa;
    soa.x.resize(10000); soa.y.resize(10000); soa.z.resize(10000);
    float sum_soa = 0;
    for (int i = 0; i < 10000; i++) sum_soa += soa.x[i] + soa.y[i] + soa.z[i];
    cout << "SoA (Struct of Arrays): cache-optimal\\n";

    // String optimization
    string s = "expensive to copy";
    string moved = move(s);   // O(1): pointer swap, not O(n) copy
    cout << "string move: zero copy\\n";

    // Reserve to avoid reallocations
    vector<int> v;
    v.reserve(1000);   // one allocation, no realloc during push_back
    for (int i = 0; i < 1000; i++) v.push_back(i);
    cout << "reserve: avoids realloc\\n";

    return 0;
}`;

const GPROF_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// __OUTPUT__: profiling: gprof/perf/vtune\\nhot function found\\noptimized: 10x speedup

// Profiling workflow:
// 1. Compile: g++ -pg -O2 -o myapp main.cpp    (gprof)
//    or:      g++ -g -O2 -o myapp main.cpp      (perf/valgrind)
// 2. Run: ./myapp  (generates gmon.out for gprof)
// 3. Profile: gprof myapp gmon.out | head -20   (flat profile)
//    or:      perf record ./myapp && perf report
//    or:      valgrind --tool=callgrind ./myapp

// Typical profiling output:
//  % time   cumulative self   calls  name
//  45.23       2.31     2.31  1000000  hot_function
//  32.10       3.95     1.64   500000  string_copy

void hot_function(vector<int>& v) {
    // Simulated hot path — called 1M times
    sort(v.begin(), v.end());
}

int main() {
    cout << "profiling: gprof/perf/vtune\\n";
    vector<int> v = {5, 3, 1, 4, 2};
    for (int i = 0; i < 1000; i++) hot_function(v);
    cout << "hot function found\\n";
    cout << "optimized: 10x speedup\\n";
    return 0;
}`;

const COMPILER_OPT_CODE = `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

// __OUTPUT__: -O0: no optimization\\n-O2: inline + vectorize\\n-O3: aggressive\\n__builtin_expect: branch prediction

[[nodiscard]] int compute(int x) {
    return x * x + 2 * x + 1;   // (x+1)^2 — compiler may simplify
}

void vectorizable(vector<float>& a, const vector<float>& b) {
    // Auto-vectorization at -O2 with -march=native
    for (int i = 0; i < (int)a.size(); i++)
        a[i] = sqrt(b[i]);   // SIMD sqrt on 4/8 floats simultaneously
}

int main() {
    cout << "-O0: no optimization\\n";
    cout << "-O2: inline + vectorize\\n";
    cout << "-O3: aggressive\\n";

    // Branch prediction hint
    int x = 5;
    if (__builtin_expect(x > 0, 1)) {   // hint: usually true
        cout << "__builtin_expect: branch prediction\\n";
    }

    // [[likely]] / [[unlikely]] (C++20)
    if (x > 0) [[likely]] {
        cout << "likely branch\\n";
    }

    // restrict: tell compiler pointers don't alias (C-style)
    // void add(float* __restrict__ a, const float* __restrict__ b, int n)

    return 0;
}`;

const lesson = {
  id: "cpp-4-007",
  slug: "profiling",
  chapter: "cpp-4",
  order: 7,
  title: "Performance and Profiling",
  subtitle: "chrono benchmarking, gprof, perf, cache effects, AoS vs SoA, compiler hints",
  tags: ["c++", "cpp", "profiling", "performance", "gprof", "perf", "cache", "AoS", "SoA", "optimization"],
  aliases: [
    "c++ profiling",
    "c++ performance",
    "c++ gprof",
    "c++ perf",
    "c++ cache optimization",
    "c++ optimization",
  ],

  hook: `Premature optimization is the root of all evil — but so is ignoring performance until it's a crisis. Professional C++ developers measure first, optimize second. A profiler tells you exactly which 10% of code uses 90% of the time. Understanding cache behavior, data layout (AoS vs SoA), and compiler optimizations turns a slow program into a fast one without guessing.`,

  mentalModel: [
    "**Profile before optimizing.** Measure with `std::chrono::steady_clock` for micro-benchmarks, `gprof` for function-level profiles, `perf` for CPU hardware counters. Optimization without measurement is guessing. The hot path is almost never where you think it is.",
    "**Cache is king.** Modern CPUs execute faster than memory. A cache miss (accessing memory not in L1/L2) costs ~100ns — hundreds of operations. Dense, sequential data structures (arrays, not linked lists) are cache-friendly. Struct of Arrays (SoA) beats Array of Structs (AoS) for data-parallel loops.",
    "**Compilers optimize aggressively at `-O2`/`-O3`.** Inlining, loop unrolling, SIMD vectorization, dead code elimination. Help the compiler: use `const`, avoid aliasing (use `__restrict__`), use `[[likely]]`/`[[unlikely]]` for branches, and avoid virtual dispatch in hot loops.",
  ],

  intuition: {
    prose: [
      "**The memory hierarchy is the performance story.** L1 cache: ~1ns, 64KB. L2: ~4ns, 256KB. L3: ~10ns, 8MB. RAM: ~100ns, GB. A tight loop over a `vector<int>` is L1-resident — very fast. The same loop over a `list<int>` follows pointers — each node potentially a cache miss. This is why `std::vector` beats `std::list` for almost everything despite worse asymptotic 'theory'.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Benchmarking with chrono — run it then explore:**\n\n- Run 5 times: are the timings stable? (cache warming effects on first run)\n- Increase vector size to 10M — where does it stop fitting in L2 cache?\n- `accumulate` vs manual loop: does the compiler generate the same code at -O2? (probably yes)\n- Compare `vector<int>` sequential vs `list<int>` sequential — measure the cache miss penalty.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": BENCH_CHRONO_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Cache and data layout — run it then explore:**\n\n- AoS: struct has 6 floats, loop only uses 3 — 50% of each cache line is wasted.\n- SoA: position arrays are contiguous — full cache lines used for positions.\n- Benchmark AoS vs SoA position-sum loop with 1M particles — measure the speedup.\n- `reserve(n)` before push_back loop: count the reallocations without it (log2(n) reallocations).",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PERF_PATTERNS_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**gprof gives function-level timing. perf gives hardware counter data.** `gprof` instruments function calls — good for finding hot functions. `perf stat` gives cache misses, branch mispredictions, IPC (instructions per cycle). `perf record` + `perf report` gives a call graph with hardware event sampling. For branch-heavy code, `perf stat -e branch-misses` is more informative than raw time.",
      "**Compiler optimizations change what you measure.** At `-O0`, loops aren't vectorized, functions aren't inlined, dead code isn't eliminated. At `-O2`, the compiler may transform your loop into SIMD instructions that process 8 floats at once. Always benchmark at the optimization level you ship. Use `__attribute__((noinline))` or `volatile` sinks to prevent the compiler from optimizing away your benchmark.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Profiling workflow — read then explore:**\n\n- Compile with `-pg -O2` and run — generates `gmon.out`.\n- `gprof myapp gmon.out`: flat profile shows `% time` per function.\n- Call graph: which callers call the hot function, and how often?\n- `perf stat ./myapp`: look at IPC (higher is better) and cache-miss rate.\n- `perf record -g ./myapp && perf report` — annotated call graph.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": GPROF_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Compiler optimization hints — run it then explore:**\n\n- Compile with `-O0` vs `-O2`: does `compute(x)` get inlined? (check with `nm` or `-S` assembly)\n- `-march=native -O2`: enables AVX2/SSE4 — `vectorizable()` uses SIMD sqrt.\n- `[[nodiscard]]` on `compute` — warning if return value is discarded.\n- `__builtin_expect` vs `[[likely]]` (C++20): modern code uses the attribute form.\n- Add `volatile` to prevent optimizer from eliminating a benchmark loop.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": COMPILER_OPT_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Micro-benchmarks lie without warm-up and repetition",
        body: "First run: cold cache, JIT effects, OS scheduling. Results vary 2-10x. Always: (1) warm up — run the function once before timing, (2) repeat 100+ times and take the median or minimum, (3) use `DoNotOptimize` sinks (Google Benchmark) to prevent the compiler from optimizing the benchmark away. Consider Google Benchmark library for serious micro-benchmarking.",
      },
      {
        type: "tip",
        title: "Use perf stat first — it tells you what KIND of problem you have",
        body: "`perf stat ./myapp` reports: instructions, cycles, IPC, cache-misses, branch-misses. IPC < 1 → memory bound (cache misses). IPC close to 4+ → compute bound. High branch-miss rate → branch prediction problem. This tells you which optimization direction to pursue before spending time on code changes.",
      },
    ],
  },

  examples: [
    {
      title: "Google Benchmark micro-benchmark",
      body: `#include <benchmark/benchmark.h>
#include <vector>
#include <numeric>

static void BM_VectorSum(benchmark::State& state) {
    std::vector<int> v(state.range(0));
    std::iota(v.begin(), v.end(), 0);

    for (auto _ : state) {
        long long sum = 0;
        for (int x : v) sum += x;
        benchmark::DoNotOptimize(sum);  // prevent optimizer from removing
    }

    state.SetBytesProcessed(state.iterations() * state.range(0) * sizeof(int));
}

BENCHMARK(BM_VectorSum)->Range(1<<10, 1<<20);  // from 1K to 1M elements
BENCHMARK_MAIN();

// Output:
// BM_VectorSum/1024     208 ns     0.5 GB/s
// BM_VectorSum/1048576  214398 ns  4.7 GB/s  (L3 bandwidth bound)`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `Benchmark` class with `start()` and `stop()` methods that measures elapsed microseconds using `steady_clock`. Add a `report(name)` method that prints the timing. Use it to compare: summing 1M ints with a range-for loop vs with `std::accumulate`. Report both timings.",
      hint: "`chrono::duration_cast<chrono::microseconds>(t1 - t0).count()`",
      walkthrough: [
        "struct Benchmark { steady_clock::time_point t0; long long elapsed=0;",
        "  void start() { t0 = steady_clock::now(); }",
        "  void stop() { elapsed = duration_cast<microseconds>(steady_clock::now()-t0).count(); }",
        "  void report(string name) { cout << name << ': ' << elapsed << 'us\\n'; }",
        "};",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement both AoS and SoA layouts for a 2D physics simulation with position (x,y) and velocity (vx,vy). Write an `update_positions(float dt)` function for each. Benchmark both with 100K particles over 1000 steps. Measure and explain the difference.",
      hint: "AoS: `struct Particle { float x,y,vx,vy; }; vector<Particle>`. SoA: `struct Particles { vector<float> x,y,vx,vy; }`. SoA loop: `for i: x[i] += vx[i]*dt` — 2 float arrays accessed, not 4.",
      walkthrough: [
        "AoS loop: for(auto& p: particles) { p.x += p.vx*dt; p.y += p.vy*dt; } — loads all 4 floats per particle",
        "SoA loop: for i: x[i]+=vx[i]*dt; for i: y[i]+=vy[i]*dt; — only 2 arrays accessed per loop",
        "SoA is ~2x faster: each cache line contains 16 floats of x or vx — fully utilized",
        "AoS: cache line has x,y,vx,vy interleaved — 50% wasted loading unused vy for x-update",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-007-q1",
        type: "choice",
        text: "Why is `std::list` often slower than `std::vector` for iteration despite O(n) for both?",
        options: [
          "list has more function call overhead",
          "list nodes are scattered in heap memory — each node access is a potential cache miss (pointer chasing). vector elements are contiguous — sequential access is cache-friendly.",
          "list uses more memory",
          "vector is hardware-accelerated",
        ],
        answer: 1,
        explanation:
          "Modern CPUs prefetch sequential memory automatically — iterating a contiguous array is nearly as fast as registers. `std::list` nodes are individually heap-allocated and scattered in memory. Each `->next` dereference is a pointer chase that likely misses the L1 and L2 cache, costing ~100ns. This is why `vector` is the default container even for frequent insertions.",
      },
      {
        id: "cpp4-007-q2",
        type: "choice",
        text: "What does 'Array of Structs vs Struct of Arrays' mean for cache performance?",
        options: [
          "SoA uses less memory than AoS",
          "AoS: each struct has all fields together (interleaved). SoA: all values of each field are contiguous. If a loop only uses some fields, SoA is more cache-efficient (no wasted loads of unused fields).",
          "AoS is for small structs, SoA for large ones",
          "They have identical cache behavior",
        ],
        answer: 1,
        explanation:
          "If a Particle has 6 floats (x,y,z,vx,vy,vz) and a loop only updates positions (x,y,z += vx,vy,vz * dt), then each AoS cache line also loads the unused velocity data. SoA has x,y,z in separate arrays — a loop over x only loads x values. This doubles the useful data per cache line for position-only operations.",
      },
      {
        id: "cpp4-007-q3",
        type: "choice",
        text: "Why should you always benchmark at the target optimization level (-O2 or -O3)?",
        options: [
          "The program doesn't run at -O0",
          "At -O0, loops aren't vectorized and functions aren't inlined — you're measuring unrepresentative code. The relative performance of different approaches may completely change under optimization.",
          "-O2 runs faster so benchmarks complete sooner",
          "Sanitizers only work at -O2",
        ],
        answer: 1,
        explanation:
          "At -O0, `accumulate` may be many times slower than a manual loop (not inlined). At -O2, both may generate identical assembly. You're shipping -O2 code — benchmark what you ship. Also: the compiler may eliminate benchmark code entirely at -O2 if results aren't used. Use `benchmark::DoNotOptimize` or `volatile` sinks.",
      },
      {
        id: "cpp4-007-q4",
        type: "choice",
        text: "What does `__builtin_expect(condition, 1)` tell the compiler?",
        options: [
          "The condition is always true",
          "The condition is likely true — the compiler should lay out code so the likely branch is in the fall-through path (no jump), improving branch prediction and instruction cache utilization",
          "The condition should be evaluated at compile time",
          "The branch should be eliminated",
        ],
        answer: 1,
        explanation:
          "Processors predict branches and prefetch along the predicted path. A misprediction costs 15-20 cycles. `__builtin_expect(x, 1)` tells the compiler the branch is usually taken — it lays out code so the taken path is sequential (no jump instruction), improving the pipeline. C++20's `[[likely]]` and `[[unlikely]]` attributes are the standard way to express this.",
      },
    ],
  },
};

export default lesson;
