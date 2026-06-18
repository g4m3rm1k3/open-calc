const TIMING_CODE = `#include <iostream>
#include <chrono>
using namespace std;
using namespace chrono;

// __OUTPUT__: loop took: ~1 ms\\nduration: 1500 ms\\nin seconds: 1.5\\nnanoseconds: 1500000000

int main() {
    // steady_clock: monotonic, never goes backward — use for timing
    auto start = steady_clock::now();
    volatile long long x = 0;
    for (int i=0; i<1000000; i++) x += i;
    auto end = steady_clock::now();

    // duration_cast: convert between time units
    auto ms = duration_cast<milliseconds>(end - start).count();
    cout << "loop took: ~" << ms << " ms\\n";

    // Constructing durations explicitly
    auto d = milliseconds(1500);
    cout << "duration: " << d.count() << " ms\\n";

    // Convert to different units
    auto secs = duration<double>(d);
    cout << "in seconds: " << secs.count() << "\\n";

    auto ns = duration_cast<nanoseconds>(d);
    cout << "nanoseconds: " << ns.count() << "\\n";

    return 0;
}`;

const TIMEPOINT_CODE = `#include <iostream>
#include <chrono>
#include <ctime>
using namespace std;
using namespace chrono;

// __OUTPUT__: now (epoch ms): large number\\ndiff in seconds: 10\\nsystem_clock: wall-clock time\\nsteady_clock: monotonic — no calendar

int main() {
    // time_point: a point in time on a specific clock
    auto now = system_clock::now();
    auto epochMs = duration_cast<milliseconds>(now.time_since_epoch()).count();
    cout << "now (epoch ms): " << epochMs << "\\n";

    // Arithmetic: time_point + duration = time_point
    auto future = now + seconds(10);
    auto diff = duration_cast<seconds>(future - now).count();
    cout << "diff in seconds: " << diff << "\\n";

    // system_clock: maps to wall-clock time — can be adjusted
    cout << "system_clock: wall-clock time\\n";

    // steady_clock: monotonic — never goes backward
    // Use for benchmarking (not affected by NTP or DST)
    cout << "steady_clock: monotonic — no calendar\\n";

    return 0;
}`;

const RANDOM_CODE = `#include <iostream>
#include <random>
using namespace std;

// __OUTPUT__: dice [1,6]: 3 6 1 5 4\\nunit [0,1): 0.37 0.15 0.95 0.74 0.44\\nnormal(0,1): 0.46 -0.84 1.21 -0.31 0.77\\nbool (p=0.3): 0 1 0 0 1

int main() {
    // mt19937: Mersenne Twister — high quality, fast PRNG
    mt19937 rng(42);   // seed=42: reproducible sequence

    // uniform_int_distribution: [min, max] inclusive
    uniform_int_distribution<int> dice(1, 6);
    cout << "dice [1,6]: ";
    for (int i=0; i<5; i++) cout << dice(rng) << " ";
    cout << "\\n";

    // uniform_real_distribution: [min, max)
    mt19937 rng2(42);
    uniform_real_distribution<double> unit(0.0, 1.0);
    cout << "unit [0,1): ";
    for (int i=0; i<5; i++) cout << unit(rng2) << " ";
    cout << "\\n";

    // normal_distribution: Gaussian, mean=0, stddev=1
    mt19937 rng3(99);
    normal_distribution<double> norm(0.0, 1.0);
    cout << "normal(0,1): ";
    for (int i=0; i<5; i++) cout << norm(rng3) << " ";
    cout << "\\n";

    // bernoulli_distribution: true with probability p
    mt19937 rng4(7);
    bernoulli_distribution coin(0.3);
    cout << "bool (p=0.3): ";
    for (int i=0; i<5; i++) cout << coin(rng4) << " ";
    cout << "\\n";

    return 0;
}`;

const SHUFFLE_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
using namespace std;

// __OUTPUT__: original: 1 2 3 4 5 6 7 8 9 10\\nshuffled: 4 9 2 7 1 6 3 10 8 5\\nreshuffle: different\\nsample 3: 3 7 1

int main() {
    vector<int> v = {1,2,3,4,5,6,7,8,9,10};
    cout << "original: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // shuffle: Fisher-Yates via RNG — uniform random permutation
    mt19937 rng(42);
    shuffle(v.begin(), v.end(), rng);
    cout << "shuffled: ";
    for (int x : v) cout << x << " ";
    cout << "\\n";

    // Different seed → different shuffle
    shuffle(v.begin(), v.end(), mt19937(99));
    cout << "reshuffle: different\\n";

    // sample: pick k distinct elements from range (C++17)
    vector<int> src = {1,2,3,4,5,6,7,8,9,10};
    vector<int> chosen;
    sample(src.begin(), src.end(), back_inserter(chosen), 3, mt19937(42));
    cout << "sample 3: ";
    for (int x : chosen) cout << x << " ";
    cout << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-2-006",
  slug: "chrono-random",
  chapter: "cpp-2",
  order: 6,
  title: "Chrono and Random",
  subtitle: "High-resolution timing, time points, and quality random number generation",
  tags: ["c++", "cpp", "chrono", "random", "mt19937", "steady_clock", "uniform_distribution", "shuffle"],
  aliases: [
    "c++ chrono",
    "c++ timing",
    "c++ random number",
    "c++ mt19937",
    "c++ shuffle",
    "c++ steady_clock",
  ],

  hook: `Timing code with \`clock()\` has resolution issues and \`rand()\` produces weak random numbers. \`<chrono>\` gives you type-safe duration arithmetic with nanosecond resolution. \`<random>\` gives you a Mersenne Twister with proper distributions. Neither has the pitfalls of the C equivalents.`,

  mentalModel: [
    "**Three clock types for different purposes.** `steady_clock` is monotonic — never goes backward, ideal for benchmarking. `system_clock` maps to wall-clock time — can be adjusted by NTP or DST, use for timestamps. `high_resolution_clock` is usually `steady_clock` on modern platforms. Always use `steady_clock` for duration measurement.",
    "**Duration arithmetic is type-safe.** `milliseconds(500) + seconds(1)` works and gives `milliseconds(1500)`. `duration_cast<T>` converts between units. `.count()` extracts the raw number. You can't accidentally mix milliseconds and nanoseconds without an explicit cast.",
    "**`mt19937` + distribution = correct random numbers.** Create the engine once (seeded with `random_device{}()` for non-reproducible, or a fixed seed for reproducible). Pass it to a distribution on each call. Never use `rand()` — its quality and range are implementation-defined.",
  ],

  intuition: {
    prose: [
      "**Seed with `random_device` for non-reproducible randomness.** `mt19937 rng(random_device{}())` uses hardware entropy to seed the PRNG. Use a fixed seed like `42` for reproducible test sequences. Never use `srand(time(0))` — `time` has 1-second resolution and is predictable.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Timing — run it then explore:**\n\n- Change the loop count from 1,000,000 to 100,000,000 — does the time scale linearly?\n- `duration_cast<microseconds>` — more precision for short operations.\n- Time a `sort` of 10,000 random ints — what's the ms count?\n- `system_clock::now()` vs `steady_clock::now()` — try both for timing. Which is safer?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TIMING_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Time points — run it then explore:**\n\n- `auto deadline = steady_clock::now() + seconds(5);` — create a future time point.\n- Check if deadline has passed: `steady_clock::now() > deadline`.\n- Convert `system_clock::now()` to a `time_t` with `system_clock::to_time_t()` for display.\n- Subtract two `system_clock::now()` calls around a sleep — what duration do you get?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": TIMEPOINT_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`mt19937` vs `mt19937_64`.** `mt19937` produces 32-bit random numbers; `mt19937_64` produces 64-bit. For generating `uint64_t` values or needing more than 2^32 distinct values, use `mt19937_64`. Both have the same period (2^19937 - 1) and good statistical properties.",
      "**`std::sample` for random subset selection.** `sample(first, last, out, n, rng)` selects `n` distinct elements from `[first, last)` with uniform probability, preserving relative order. O(n) for forward/output iterators. Use for random holdout sets, random sampling from large collections.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Random distributions — run it then explore:**\n\n- Same seed (42) always produces the same sequence — verify.\n- Use `random_device{}()` as seed for non-reproducible output.\n- `uniform_int_distribution<int>(1,100)` — simulate 100 dice rolls, count how often each value appears.\n- `normal_distribution<double>(100, 15)` — IQ scores. How many fall outside [70, 130]?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": RANDOM_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Shuffle and sample — run it then explore:**\n\n- Same seed produces same shuffle every time — verify with seed=42.\n- `std::sample` with different seeds — is the order of selected elements preserved? (yes)\n- Implement a deck of cards: 52 ints, shuffle, deal 5.\n- `sample` 3 from a range of 3 — always returns all 3? (yes — can't sample more than range size)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SHUFFLE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never use rand() in modern C++",
        body: "`rand()` has poor statistical quality, implementation-defined range, and global state. Use `mt19937` with `uniform_int_distribution` or `uniform_real_distribution` for correct, reproducible, high-quality random numbers.",
      },
      {
        type: "tip",
        title: "Create the engine once, reuse it",
        body: "Constructing `mt19937` has some cost (initializing the state array). Create one engine per use-site, call it repeatedly. Don't create a new `mt19937` for each random number — you'll get correlated values if seeded with time-based seeds.",
      },
    ],
  },

  examples: [
    {
      title: "RAII benchmark timer",
      body: `#include <chrono>
#include <iostream>
#include <string>

struct Timer {
    std::string name;
    std::chrono::steady_clock::time_point start;

    Timer(std::string n) : name(std::move(n)), start(std::chrono::steady_clock::now()) {}
    ~Timer() {
        auto elapsed = std::chrono::steady_clock::now() - start;
        auto ms = std::chrono::duration_cast<std::chrono::microseconds>(elapsed).count();
        std::cout << name << ": " << ms << " μs\\n";
    }
};

// Usage:
// { Timer t("sort 1M ints"); std::sort(v.begin(), v.end()); }
// Prints: "sort 1M ints: 234567 μs"`,
    },
    {
      title: "Reproducible random test data",
      body: `#include <random>
#include <vector>

// Generate reproducible test data — same seed = same data
std::vector<int> makeTestData(int n, unsigned seed = 42) {
    std::mt19937 rng(seed);
    std::uniform_int_distribution<int> dist(1, 1000);
    std::vector<int> data(n);
    std::generate(data.begin(), data.end(), [&]{ return dist(rng); });
    return data;
}

// makeTestData(10)         → same 10 values every run
// makeTestData(10, 99)     → different but reproducible
// makeTestData(10, std::random_device{}()) → non-reproducible`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `benchmark(string name, function<void()> fn, int iterations=1000)` that times a function over `iterations` calls and prints the average time in microseconds. Use `steady_clock`. Test by benchmarking `sort` of a 1000-element vector.",
      hint: "Take `start = steady_clock::now()` before the loop, call `fn()` in the loop, take `end` after, then `duration_cast<microseconds>(end-start).count() / iterations`.",
      walkthrough: [
        "auto start = steady_clock::now();",
        "for (int i=0; i<iterations; i++) fn();",
        "auto us = duration_cast<microseconds>(steady_clock::now()-start).count()/iterations;",
        "cout << name << ': ' << us << ' us avg';",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `WeightedSampler<T>`: given a vector of (item, weight) pairs, `sample()` returns a random item where probability is proportional to weight. Use `discrete_distribution<int>` which accepts a range of weights. Test: sample from {('A',1),('B',2),('C',7)} 10000 times — verify C appears ~70% of the time.",
      hint: "`discrete_distribution<int> dist(weights.begin(), weights.end())` — `dist(rng)` returns an index with probability proportional to the corresponding weight.",
      walkthrough: [
        "Extract weights into a vector<double>",
        "discrete_distribution<int> dist(weights.begin(), weights.end())",
        "sample(): return items[dist(rng)].first",
        "Test: count appearances of each item over 10000 samples",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-006-q1",
        type: "choice",
        text: "Why use `steady_clock` instead of `system_clock` for benchmarking?",
        options: [
          "steady_clock has better resolution than system_clock",
          "steady_clock is monotonic — it never goes backward; system_clock can be adjusted by NTP or DST",
          "system_clock is deprecated in C++17",
          "steady_clock is faster to query",
        ],
        answer: 1,
        explanation:
          "`steady_clock` is guaranteed to be monotonic — time only moves forward, regardless of system time adjustments (NTP, DST, user changes). `system_clock` maps to wall-clock time and can jump backward. For timing code duration, `steady_clock` always gives correct positive elapsed times.",
      },
      {
        id: "cpp2-006-q2",
        type: "choice",
        text: "What does `duration_cast<milliseconds>(end - start).count()` return?",
        options: [
          "A floating-point number of milliseconds",
          "An integer number of milliseconds (truncated)",
          "A duration object you must convert again",
          "The number of clock ticks",
        ],
        answer: 1,
        explanation:
          "`duration_cast` converts between duration types (truncating, not rounding). `.count()` returns the raw underlying integer value. For `milliseconds`, that's an integer milliseconds count. Use `duration<double, milli>(elapsed).count()` for a floating-point result with fractional milliseconds.",
      },
      {
        id: "cpp2-006-q3",
        type: "choice",
        text: "What is wrong with `mt19937 rng(time(0))` as a seed?",
        options: [
          "time(0) doesn't compile with mt19937",
          "time(0) has 1-second resolution — programs started in the same second get the same seed and produce identical sequences",
          "mt19937 doesn't accept integer seeds",
          "time(0) returns a negative number",
        ],
        answer: 1,
        explanation:
          "`time(0)` returns seconds since epoch — two processes started within the same second get the same seed. Use `std::random_device{}()` for hardware entropy-based seeding. `random_device` is the correct C++11 way to get a non-predictable seed.",
      },
      {
        id: "cpp2-006-q4",
        type: "choice",
        text: "What is `std::sample` used for?",
        options: [
          "Sampling the performance of an algorithm",
          "Selecting n distinct elements uniformly at random from a range, preserving relative order",
          "Sampling every k-th element from a range",
          "Computing statistical samples of numeric data",
        ],
        answer: 1,
        explanation:
          "`std::sample(first, last, out, n, rng)` selects `n` distinct elements from `[first, last)` with equal probability for every possible subset of size n. The selected elements appear in the same relative order as in the input. Useful for train/test splits, random subsets, Monte Carlo sampling.",
      },
    ],
  },
};

export default lesson;
