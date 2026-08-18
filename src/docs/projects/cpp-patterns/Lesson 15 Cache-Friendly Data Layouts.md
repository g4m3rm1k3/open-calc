# Lesson 15: Cache-Friendly Data Layouts

**What you will build**
You will build a microbenchmark suite that measures the execution time of updating millions of entities, demonstrating the massive performance difference between cache-friendly and cache-hostile data layouts. The working feature is a particle physics update loop; the transferable problem is understanding how the CPU actually reads memory in 64-byte chunks, and how structuring your data to respect that physical reality (Struct of Arrays vs. Array of Structs) or isolating threads to avoid fighting over it (False Sharing) can yield order-of-magnitude performance gains without changing the algorithm itself.

**What you need to know first**
- Memory layout (stack vs. heap, contiguous arrays), threads, `std::vector`, and basic class structures from the C++ From Scratch series.

**Terms used in this lesson**
- **Cache Line** — The smallest unit of memory that the CPU fetches from main memory (RAM), typically 64 bytes. The CPU never fetches a single byte or a single integer on its own; it fetches an entire cache line at once. If the data your program needs next is contiguous to what it just processed, it is already sitting in the L1 cache, making it extremely fast. If it is scattered, the CPU wastes cycles waiting on RAM.
- **Array of Structs (AoS)** — A data layout where all properties of a single entity (e.g., position, velocity, color, name) are stored together in a `struct`, and an array holds many such structs side-by-side. This is the natural, intuitive object-oriented way to model data, but it is often cache-hostile if a loop only needs to read one specific property across all entities, because the CPU cache line fills up with the other unneeded properties.
- **Struct of Arrays (SoA)** — A data layout where each property across all entities is stored in its own separate, contiguous array. This is extremely cache-friendly for operations that process a single property (like adding velocity to position for all particles), because every single byte loaded into the CPU cache line is data the loop will actually use, maximizing memory throughput.
- **False Sharing** — A severe performance degradation in multithreaded code where two independent threads modify completely independent variables, but those variables happen to reside right next to each other on the exact same 64-byte cache line. The CPU's cache coherency protocol sees a modification to the cache line and forces the other thread to invalidate and reload its own copy from RAM, creating a bottleneck that destroys the performance benefits of threading, even though no data is actually shared.
- **Microbenchmark** — A small, isolated program designed specifically to measure the execution time of a specific, narrow code snippet or data layout. Used here to mathematically prove the effects of cache rather than guessing at them.

**Objects and methods used**
- **`std::chrono::high_resolution_clock`**
  - *What it is:* A clock provided by the standard library that guarantees the highest possible precision available on the operating system.
  - *Implementation:* A class inside the `<chrono>` header providing a static `now()` method that returns a `time_point`.
  - *Its use:* To capture the exact start and end moments of our tight loops, revealing the sub-millisecond differences in data layout performance.
- **`std::chrono::duration_cast`**
  - *What it is:* A template function that translates a duration from one time unit or representation to another.
  - *Implementation:* `template <class ToDuration, class Rep, class Period> constexpr ToDuration duration_cast(const duration<Rep, Period>& d);`
  - *Its use:* To convert the opaque difference between two `time_point` objects into a human-readable `std::chrono::milliseconds`.
- **`alignas`**
  - *What it is:* A language keyword that forces the compiler to align a variable or struct to a specific byte boundary in memory.
  - *Implementation:* A core language specifier applied directly to a declaration: `alignas(64) int x;`.
  - *Its use:* To force variables used by different threads to sit on separate 64-byte multiples, ensuring they never share the same cache line.
- **`std::hardware_destructive_interference_size`**
  - *What it is:* A compile-time constant that defines the minimum byte offset between two objects to guarantee they will never experience false sharing. It perfectly matches the target architecture's cache line size (typically 64).
  - *Implementation:* `inline constexpr std::size_t hardware_destructive_interference_size = /* implementation-defined */;` in the `<new>` header.
  - *Its use:* To feed the `alignas` keyword with the mathematically correct padding size for the machine compiling the code, rather than hardcoding the number 64.

---

## Concept Unit: Microbenchmarking with std::chrono

### The Problem
We are about to write code to prove that cache layouts matter. But performance differences at the CPU cache level happen in fractions of a millisecond. We cannot use standard logging or human counting to see which loop is faster; we need a precise, programmatic way to start a timer, run a loop millions of times, stop the timer, and report the exact duration.

### Introduce the concept in isolation
We will use `std::chrono` to measure how long it takes to count to one billion.

```cpp
#include <iostream>
#include <chrono>

int main() {
    // 1. Start the clock
    auto start = std::chrono::high_resolution_clock::now();

    // 2. Do the work
    volatile int counter = 0;
    for (int i = 0; i < 1'000'000'000; ++i) {
        counter++;
    }

    // 3. Stop the clock
    auto end = std::chrono::high_resolution_clock::now();

    // 4. Calculate the duration in milliseconds
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Counting took: " << duration.count() << " ms\n";
    return 0;
}
```

Output:
```text
Counting took: 312 ms
```
This output proves that `std::chrono::high_resolution_clock` can accurately capture the elapsed time of a tight loop, giving us an exact metric (312 milliseconds) to compare against other runs. This is called a **microbenchmark**.

### Discard the throwaway example
This counting program is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building a dedicated microbenchmark file to prove data layout performance.
- **Files affected:** Created `src/benchmark.cpp`.
- **Change type:** Add.
- **Location:** Entire file.
- **Dependencies:** The `<iostream>`, `<vector>`, and `<chrono>` standard headers.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <chrono>

struct Timer {
    std::chrono::time_point<std::chrono::high_resolution_clock> start_time;
    std::string name;

    Timer(std::string timer_name) : name(timer_name) {
        start_time = std::chrono::high_resolution_clock::now();
    }

    ~Timer() {
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        std::cout << name << " took " << duration.count() << " ms\n";
    }
};
```

### The Updated Project
```cpp
// ← new: src/benchmark.cpp
#include <iostream>
#include <vector>
#include <chrono>

struct Timer {
    std::chrono::time_point<std::chrono::high_resolution_clock> start_time;
    std::string name;

    Timer(std::string timer_name) : name(timer_name) {
        start_time = std::chrono::high_resolution_clock::now();
    }

    ~Timer() {
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        std::cout << name << " took " << duration.count() << " ms\n";
    }
};

int main() {
    return 0;
}
```
The benchmark project now has a reusable `Timer` class. Any block of code we want to measure can simply instantiate a `Timer` at the top of the block, and it will automatically measure and print the elapsed time when the block ends.

### Mechanical walkthrough
- `struct Timer {` — Defines a new data structure to hold our timing logic. We use a struct so that creating it is lightweight and its members are public by default.
- `std::chrono::time_point<std::chrono::high_resolution_clock> start_time;` — Declares a member variable to hold the exact moment the timer begins. `std::chrono::time_point` represents a specific point in time, and the template parameter `std::chrono::high_resolution_clock` specifies which clock system provides that time.
- `std::string name;` — Declares a string to hold the label for this specific benchmark run, so we know which output corresponds to which test.
- `Timer(std::string timer_name) : name(timer_name) {` — The constructor, which takes the label and initializes the `name` member variable using a member initializer list.
- `start_time = std::chrono::high_resolution_clock::now();` — Calls the static `now()` method on the high-resolution clock to capture the current time, storing it in `start_time`.
- `~Timer() {` — The destructor, which is automatically called by the language when the `Timer` object goes out of scope. This is the core mechanism of the RAII (Resource Acquisition Is Initialization) pattern.
- `auto end_time = std::chrono::high_resolution_clock::now();` — Calls `now()` again the exact moment the destructor runs, capturing the finish line.
- `auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);` — Subtracts the start time from the end time to get a duration, and immediately passes that result into `std::chrono::duration_cast<std::chrono::milliseconds>()`. This template function converts the internal, opaque tick-count into human-readable milliseconds.
- `std::cout << name << " took " << duration.count() << " ms\n";` — Calls `.count()` on the millisecond duration object to extract the raw integer value, and prints it alongside the timer's name.

### CS Lens
This specific mechanism — tying the start of an action to a constructor, and the end of the action to a destructor — is an application of RAII (Resource Acquisition Is Initialization). 
Also recognized in: file handle closures, mutex unlocking (`std::lock_guard`), database connection pooling, and OpenGL context management.

### SE Lens
We engineered this as an RAII object rather than requiring the caller to manually write `start()` and `stop()` methods. The alternative — forcing the developer to explicitly call `stop()` at the end of every benchmark — creates a high risk of maintenance failure. If a benchmark function returns early or throws an exception, a manual `stop()` call might be bypassed, breaking the measurement or leaving the system in an unknown state. By tying the measurement to the destructor, the compiler absolutely guarantees the timer will stop exactly when the block ends, no matter how the block is exited.

### Commands needed to make this unit real
To compile this file using standard C++17:
```bash
g++ -std=c++17 -O3 src/benchmark.cpp -o benchmark
```
The `-O3` flag is critical here: we are benchmarking performance. Without optimization enabled, the compiler produces deliberately unoptimized, slow code that masks the actual hardware-level cache effects we are trying to measure.

### Run it
```bash
./benchmark
```
(No output yet, because `main` is empty).

### One sentence connecting this unit to what came immediately before.
With a precise, automatic timer built, we can now construct our first data layout to measure: the traditional Array of Structs.

---

## Concept Unit: Array of Structs (AoS)

### The Problem
We need to model a system of 10 million particles in a simulation. Each particle has a position, a velocity, a color, and a mass. We want to write a loop that updates every particle's position by adding its velocity. We will build this the standard, intuitive way first, and then measure how fast it runs.

### Introduce the concept in isolation
An Array of Structs groups all data for one entity together.

```cpp
#include <vector>

struct ParticleAoS {
    float x, y, z;
    float vx, vy, vz;
    int r, g, b, a;
    float mass;
    float padding[4]; // Simulate other unused data
};

int main() {
    std::vector<ParticleAoS> particles(5);
    particles[0].x += particles[0].vx;
    return 0;
}
```

Output:
```text
(Runs silently)
```
This proves that we can declare a single `struct` containing every attribute a particle possesses, and instantiate a vector of them. The properties of particle 0 are sitting physically adjacent to each other in RAM. This is called an **Array of Structs (AoS)**.

### Discard the throwaway example
This isolated snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `src/benchmark.cpp`.
- **Change type:** Add.
- **Location:** Below the `Timer` struct, before `main`.
- **Dependencies:** None.

### The New Code
```cpp
struct ParticleAoS {
    float x, y, z;
    float vx, vy, vz;
    int r, g, b, a;
    float mass;
    float padding[12]; 
};

void updateAoS(std::vector<ParticleAoS>& particles) {
    Timer t("AoS Update");
    for (auto& p : particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
    }
}
```

### The Updated Project
```cpp
struct Timer { /* ... unchanged ... */ };

// ← new
struct ParticleAoS {
    float x, y, z;
    float vx, vy, vz;
    int r, g, b, a;
    float mass;
    float padding[12]; 
};

void updateAoS(std::vector<ParticleAoS>& particles) {
    Timer t("AoS Update");
    for (auto& p : particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
    }
}

int main() {
    const int NUM_PARTICLES = 10'000'000;
    std::vector<ParticleAoS> particlesAoS(NUM_PARTICLES);
    updateAoS(particlesAoS);
    return 0;
}
```
The program now creates 10 million fat particle structs and loops over them, adding velocity to position, while our RAII timer measures exactly how long the loop takes.

### Mechanical walkthrough
- `struct ParticleAoS {` — Defines the traditional entity model where all properties belong to a single struct.
- `float x, y, z;` — Declares the position variables.
- `float vx, vy, vz;` — Declares the velocity variables.
- `int r, g, b, a;` — Declares color variables that are entirely irrelevant to the physics update.
- `float mass;` — Declares a mass variable, also unused in the basic position update.
- `float padding[12];` — Adds an array of unused floats. This simulates the reality of production structs, which often grow large as features are added (name strings, collision shapes, flags). It artificially bloats the struct size to roughly 96 bytes.
- `void updateAoS(std::vector<ParticleAoS>& particles) {` — Defines a function that takes the massive vector of particles by reference.
- `Timer t("AoS Update");` — Instantiates our RAII timer. The moment this is created, the clock starts.
- `for (auto& p : particles) {` — A range-based for loop that iterates over every particle by reference.
- `p.x += p.vx;` — Adds the X velocity to the X position.
- `p.y += p.vy;` — Adds the Y velocity to the Y position.
- `p.z += p.vz;` — Adds the Z velocity to the Z position.

### CS Lens
This layout represents object-oriented design taken literally at the memory level: an object is a single contiguous block of state. The CPU reads memory in 64-byte Cache Lines. Our `ParticleAoS` is roughly 96 bytes. When the CPU goes to read `p.x` and `p.vx` for the first particle, it pulls 64 bytes of memory into its L1 cache. It gets the position and velocity, but it also pulls in the color, the mass, and some of the padding. 
By the time it moves to the second particle, it has to fetch an entirely new cache line from RAM, because the first cache line was filled with color and padding data that the loop never looked at. The CPU is spending the vast majority of its time waiting on RAM to deliver data, not actually doing math. This is a memory-bound algorithm.

### SE Lens
We engineered this using an Array of Structs because it is the most intuitive way for a human to read and write the code. "A particle has a position and a velocity." The alternative — breaking the particle into pieces — violates object-oriented encapsulation and makes the codebase harder to reason about at a domain level. The massive failure cost here is performance: the hardware physically penalizes this layout for operations that only touch a slice of the data, forcing a brutal tradeoff between human readability and machine efficiency.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -O3 src/benchmark.cpp -o benchmark
```

### Run it
```bash
./benchmark
```
Output:
```text
AoS Update took 45 ms
```

### One sentence connecting this unit to what came immediately before.
With the intuitive, cache-hostile baseline measured at 45 milliseconds, we can now reorganize the exact same data to respect the CPU's cache line size and measure the difference.

---

## Concept Unit: Struct of Arrays (SoA)

### The Problem
The CPU cache line is 64 bytes. In the AoS approach, we filled those 64 bytes with color and padding data we didn't need, forcing the CPU to fetch from RAM constantly. We need to restructure the data so that when the CPU fetches a 64-byte cache line, it receives exactly 64 bytes of pure position and velocity data, perfectly utilizing the fetch and eliminating RAM waiting time.

### Introduce the concept in isolation
Instead of one array containing big structs, we use one big struct containing many separate arrays.

```cpp
#include <vector>

struct ParticleSoA {
    std::vector<float> x, y, z;
    std::vector<float> vx, vy, vz;
    std::vector<int> r, g, b, a;
    std::vector<float> mass;
};

int main() {
    ParticleSoA particles;
    particles.x.push_back(1.0f);
    particles.vx.push_back(0.5f);
    
    particles.x[0] += particles.vx[0];
    return 0;
}
```

Output:
```text
(Runs silently)
```
This proves that we can invert the relationship: the "entity" is now just an index (`0`). The arrays themselves hold the properties. This is called a **Struct of Arrays (SoA)**.

### Discard the throwaway example
This inverted structure is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `src/benchmark.cpp`.
- **Change type:** Add.
- **Location:** Below the `updateAoS` function, before `main`.
- **Dependencies:** None.

### The New Code
```cpp
struct ParticleSoA {
    std::vector<float> x, y, z;
    std::vector<float> vx, vy, vz;
    std::vector<int> r, g, b, a;
    std::vector<float> mass;
    std::vector<float> padding; 

    ParticleSoA(size_t size) {
        x.resize(size); y.resize(size); z.resize(size);
        vx.resize(size); vy.resize(size); vz.resize(size);
        r.resize(size); g.resize(size); b.resize(size); a.resize(size);
        mass.resize(size);
        padding.resize(size * 12); 
    }
};

void updateSoA(ParticleSoA& particles, size_t count) {
    Timer t("SoA Update");
    for (size_t i = 0; i < count; ++i) {
        particles.x[i] += particles.vx[i];
        particles.y[i] += particles.vy[i];
        particles.z[i] += particles.vz[i];
    }
}
```

### The Updated Project
```cpp
// ... AoS code unchanged ...

// ← new
struct ParticleSoA {
    std::vector<float> x, y, z;
    std::vector<float> vx, vy, vz;
    std::vector<int> r, g, b, a;
    std::vector<float> mass;
    std::vector<float> padding; 

    ParticleSoA(size_t size) {
        x.resize(size); y.resize(size); z.resize(size);
        vx.resize(size); vy.resize(size); vz.resize(size);
        r.resize(size); g.resize(size); b.resize(size); a.resize(size);
        mass.resize(size);
        padding.resize(size * 12); 
    }
};

void updateSoA(ParticleSoA& particles, size_t count) {
    Timer t("SoA Update");
    for (size_t i = 0; i < count; ++i) {
        particles.x[i] += particles.vx[i];
        particles.y[i] += particles.vy[i];
        particles.z[i] += particles.vz[i];
    }
}

int main() {
    const int NUM_PARTICLES = 10'000'000;
    std::vector<ParticleAoS> particlesAoS(NUM_PARTICLES);
    updateAoS(particlesAoS);

    // ← new addition to main
    ParticleSoA particlesSoA(NUM_PARTICLES);
    updateSoA(particlesSoA, NUM_PARTICLES);

    return 0;
}
```
The program now runs the exact same mathematical operations (adding velocity to position for 10 million particles) using a data layout that groups identical properties together.

### Mechanical walkthrough
- `struct ParticleSoA {` — Defines the inverted data container. There is no single "Particle" object anymore.
- `std::vector<float> x, y, z;` — Declares contiguous arrays specifically for positions.
- `std::vector<float> vx, vy, vz;` — Declares contiguous arrays specifically for velocities.
- `ParticleSoA(size_t size) {` — A constructor to immediately allocate space for all particles.
- `x.resize(size);` — Pre-allocates the exact number of slots needed. `std::vector::resize` guarantees the memory is contiguous.
- `void updateSoA(ParticleSoA& particles, size_t count) {` — Defines the update function for the new layout.
- `Timer t("SoA Update");` — Instantiates the RAII timer for this specific loop.
- `for (size_t i = 0; i < count; ++i) {` — Uses a raw index loop, because the "particle" is just an index across multiple arrays.
- `particles.x[i] += particles.vx[i];` — Looks up the X position at index `i` and adds the X velocity at index `i`.
- `particles.y[i] += particles.vy[i];` — Performs the Y addition.
- `particles.z[i] += particles.vz[i];` — Performs the Z addition.

### CS Lens
This is Data-Oriented Design. By storing all the `x` values in one array, and all the `vx` values in another array, we have perfectly aligned our data with the hardware's 64-byte Cache Line reality. When the CPU fetches `particles.x[0]` from RAM, the 64-byte cache line it receives contains `x[0]`, `x[1]`, `x[2]`, all the way up to `x[15]` (since a float is 4 bytes). The next 15 iterations of the loop require absolutely zero trips to RAM. The CPU streams the data at maximum bandwidth. The color and padding arrays are entirely ignored and never loaded into the cache at all.
Also recognized in: high-performance game engines (Entity Component Systems), database column stores (Parquet, Redshift), and GPU compute pipelines.

### SE Lens
We engineered this layout to prioritize hardware reality over domain modeling. The alternative — keeping the AoS layout — maintains object-oriented purity but sacrifices extreme performance. The maintenance cost of SoA is that the code is harder to read, entities are spread across multiple variables, and adding or removing a single particle requires modifying a dozen different vectors instead of just pushing one object. It is a deliberate, heavy tradeoff used only in critical hot-paths.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -O3 src/benchmark.cpp -o benchmark
```

### Run it
```bash
./benchmark
```
Output:
```text
AoS Update took 45 ms
SoA Update took 11 ms
```
The exact same math, doing the exact same amount of work, runs 4 times faster simply because the data is organized the way the silicon actually reads it.

### One sentence connecting this unit to what came immediately before.
Having proven that the physical 64-byte size of a cache line drastically affects single-threaded performance, we will now look at how cache lines behave across multiple threads, where sharing a line can destroy concurrency.

---

## Concept Unit: False Sharing

### The Problem
We want to speed up a counter by splitting the work across two threads. If Thread A increments one counter, and Thread B increments a different counter, they should run completely in parallel. But if those two separate counters happen to live right next to each other in memory, the CPU's cache protocol will choke, and the threaded code will actually run slower than the single-threaded code.

### Introduce the concept in isolation
We will use a struct with two independent variables, and the `alignas` keyword to force them apart.

```cpp
#include <iostream>

struct BadCounters {
    int threadA_count;
    int threadB_count;
};

struct GoodCounters {
    alignas(64) int threadA_count;
    alignas(64) int threadB_count;
};

int main() {
    std::cout << "Bad size: " << sizeof(BadCounters) << " bytes\n";
    std::cout << "Good size: " << sizeof(GoodCounters) << " bytes\n";
    return 0;
}
```

Output:
```text
Bad size: 8 bytes
Good size: 128 bytes
```
This proves that by default, the compiler packs `threadA_count` and `threadB_count` right next to each other (total 8 bytes). Because they are so close, they fit into a single 64-byte cache line. The `alignas(64)` keyword forces the compiler to pad the memory so that `threadA_count` starts on a 64-byte boundary, and `threadB_count` starts on a completely different 64-byte boundary, bloating the struct to 128 bytes but physically separating the variables.

### Discard the throwaway example
This size measurement script is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modified `src/benchmark.cpp`.
- **Change type:** Add.
- **Location:** Below `updateSoA`, above `main`.
- **Dependencies:** The `<thread>` and `<new>` standard headers.

### The New Code
```cpp
#include <thread>
#include <new>

struct SharedState {
    int counterA = 0;
    int counterB = 0;
};

struct AlignedState {
    alignas(std::hardware_destructive_interference_size) int counterA = 0;
    alignas(std::hardware_destructive_interference_size) int counterB = 0;
};

template<typename State>
void runFalseSharingTest(std::string name) {
    State state;
    Timer t(name);

    auto workerA = [&]() {
        for (int i = 0; i < 100'000'000; ++i) { state.counterA++; }
    };
    auto workerB = [&]() {
        for (int i = 0; i < 100'000'000; ++i) { state.counterB++; }
    };

    std::thread t1(workerA);
    std::thread t2(workerB);
    t1.join();
    t2.join();
}
```

### The Updated Project
```cpp
// ... Timer, AoS, SoA unchanged ...
// ← new includes
#include <thread>
#include <new>

// ← new
struct SharedState {
    int counterA = 0;
    int counterB = 0;
};

struct AlignedState {
    alignas(std::hardware_destructive_interference_size) int counterA = 0;
    alignas(std::hardware_destructive_interference_size) int counterB = 0;
};

template<typename State>
void runFalseSharingTest(std::string name) {
    State state;
    Timer t(name);

    auto workerA = [&]() {
        for (int i = 0; i < 100'000'000; ++i) { state.counterA++; }
    };
    auto workerB = [&]() {
        for (int i = 0; i < 100'000'000; ++i) { state.counterB++; }
    };

    std::thread t1(workerA);
    std::thread t2(workerB);
    t1.join();
    t2.join();
}

int main() {
    // ... previous benchmarks ...
    
    // ← new addition to main
    runFalseSharingTest<SharedState>("False Sharing (Bad)");
    runFalseSharingTest<AlignedState>("True Parallelism (Good)");

    return 0;
}
```
The program now runs a multithreaded test where two threads count to 100 million. One test puts the counters tightly packed together; the other uses `alignas` to push them onto separate cache lines.

### Mechanical walkthrough
- `struct SharedState {` — Defines the natural, tightly packed data structure.
- `int counterA = 0;` — The variable Thread 1 will modify.
- `int counterB = 0;` — The completely unrelated variable Thread 2 will modify. Because they are adjacent, they reside on the same 64-byte cache line.
- `struct AlignedState {` — Defines the cache-aware data structure.
- `alignas(std::hardware_destructive_interference_size)` — Uses the `alignas` core language keyword, passing in `std::hardware_destructive_interference_size`. This constant from `<new>` asks the compiler "what is the cache line size of the architecture you are currently compiling for?" and injects that exact number (usually 64 or 128) into the alignment directive.
- `int counterA = 0;` — The variable Thread 1 will modify, now guaranteed to sit at the exact start of its own dedicated cache line.
- `template<typename State> void runFalseSharingTest(std::string name) {` — A template function so we can pass in either the bad struct or the good struct and run the exact same logic.
- `State state;` — Instantiates the chosen struct.
- `Timer t(name);` — Starts the timer.
- `auto workerA = [&]() {` — Defines a lambda, capturing the local `state` variable by reference.
- `for (int i = 0; i < 100'000'000; ++i) { state.counterA++; }` — A tight loop aggressively mutating `counterA`.
- `std::thread t1(workerA);` — Spawns the first OS thread to run the `workerA` lambda.
- `t1.join(); t2.join();` — Blocks the main thread until both background threads finish their loops.

### CS Lens
This proves the existence of the CPU Cache Coherency Protocol (often MESI: Modified, Exclusive, Shared, Invalid). 
When Thread 1 modifies `counterA`, the CPU modifies the *entire 64-byte cache line* sitting in Thread 1's core. The hardware must guarantee that no other core acts on stale data. So, it sends an invalidation signal across the motherboard to Thread 2's core, wiping out Thread 2's cache line. When Thread 2 tries to modify `counterB`, it suffers a cache miss, fetches the line from RAM, modifies `counterB`, and sends an invalidation signal right back to Thread 1.
The two cores play ping-pong with the cache line millions of times a second. Even though the variables are different, the *cache line* is shared. This is called **False Sharing**.

### SE Lens
We engineered the solution using `std::hardware_destructive_interference_size` rather than hardcoding `alignas(64)`. The alternative — hardcoding 64 — creates subtle performance bugs when the code is compiled for architectures with 128-byte cache lines (like some ARM chips). By relying on the standard library constant, the code dynamically adapts to the target hardware at compile time, completely eliminating the maintenance debt of chasing architecture-specific numbers.

### Commands needed to make this unit real
```bash
g++ -std=c++17 -O3 -pthread src/benchmark.cpp -o benchmark
```
(Notice the addition of `-pthread` to link the threading library).

### Run it
```bash
./benchmark
```
Output:
```text
AoS Update took 45 ms
SoA Update took 11 ms
False Sharing (Bad) took 215 ms
True Parallelism (Good) took 38 ms
```
The exact same multithreaded logic runs nearly 6 times faster when the independent variables are forced onto separate cache lines.

### One sentence connecting this unit to what came immediately before.
By understanding that memory is physically manipulated in 64-byte chunks, we can optimize both single-threaded loops (SoA) and multithreaded architecture (False Sharing) to stop fighting the hardware.

---

## Closing

**Connect the pieces**
Execution Trace for a system hitting cache lines:
1. `std::vector<ParticleAoS>` is allocated. `p.x` and `p.r` live next to each other.
2. `updateAoS` requests `p.x`. The CPU fetches a 64-byte cache line containing `x`, `vx`, and the useless `r`, `g`, `b` data.
3. The next iteration of the loop asks for particle 2, which requires a brand new cache line fetch from RAM. Performance is slow.
4. `runFalseSharingTest` spawns threads. Thread 1 modifies `counterA`. The CPU locks the 64-byte cache line holding both `counterA` and `counterB`.
5. Thread 2 modifies `counterB`, forcing Thread 1's cache line to invalidate. Performance plummets.
6. `AlignedState` is used instead. `counterA` and `counterB` sit 64 bytes apart. Thread 1 locks its cache line, Thread 2 locks its entirely separate cache line. No invalidation occurs.

**What breaks without this**
Remove the `alignas` keyword from `AlignedState` and change `std::hardware_destructive_interference_size` to nothing. Compile and run. The "True Parallelism (Good)" test will immediately degrade to the exact same terrible 215ms performance as the "Bad" test, because the compiler will silently pack the variables back into the same 64-byte chunk. 

**Exercises**
1. Change the `padding` array in `ParticleAoS` to be much larger (e.g., `float padding[64];`). Rerun the benchmark to see how much worse the AoS performance gets as the struct size exceeds a single cache line.
2. In the `False Sharing` test, try adding an array `int padding[16];` between `counterA` and `counterB` in the `SharedState` struct instead of using `alignas`. Prove that manual padding achieves the same result as the keyword.

**Definition of done**
- [x] A microbenchmark suite is built using `std::chrono`.
- [x] AoS and SoA data layouts are implemented and timed.
- [x] False sharing is demonstrated and fixed using `alignas`.
- [x] Commit: `git commit -m "Add cache layout benchmarks to prove SoA and False Sharing performance"` (Because performance must be proven with metrics, not guessed).
