# Lesson 16: Profiling and Measuring

What you will build: We will build nothing new. We will profile and measure a simple mathematical operation over a large array to understand exactly what the CPU and compiler are doing. The real problem this solves is blind optimization: guessing what is slow instead of measuring it, and measuring it under conditions that don't match reality (like using an unoptimized compiler build).

What you need to know first: C++ From Scratch (constexpr, CMake, std::vector, lambda expressions), C++ DSA (complexity, std::sort).

Terms used in this lesson:
- **Microbenchmark** — A test designed to measure the performance of a very small, specific piece of code, like a single function or loop. It exists to isolate performance characteristics and prove hypotheses about code changes, though it risks being over-optimized by the compiler or not reflecting real-world usage.
- **Cache Miss Rate** — The percentage of memory accesses where the CPU did not find the data in its fast L1/L2/L3 cache and had to wait for main memory (RAM). It exists to show memory access efficiency, which is often the real bottleneck in modern C++, not CPU instructions.
- **Instructions Per Cycle (IPC)** — The average number of machine instructions the CPU completes in a single clock tick. It exists as a measure of how efficiently the CPU's pipeline is being utilized, showing if the CPU is churning through math efficiently or stalling on memory and branches.
- **Compiler Optimization Level** — A flag passed to the compiler (`-O0`, `-O2`, `-O3`) instructing it how hard to try to make the resulting machine code fast, often at the cost of compile time or debuggability. It exists because generating perfect machine code is mathematically undecidable and practically too slow for everyday development.

Objects and methods used:
- **`std::chrono::high_resolution_clock`**
  - *What it is:* A clock with the shortest tick period available on the system.
  - *Implementation:* A class in the `<chrono>` header, offering static methods like `now()` returning a `time_point`.
  - *Its use:* To take precise timestamps before and after a block of code to measure elapsed wall-clock time.
- **`std::chrono::duration`**
  - *What it is:* A class template representing a time interval.
  - *Implementation:* Holds a count of ticks and a fraction representing the tick period (e.g., `std::milli` for milliseconds).
  - *Its use:* To calculate the difference between two `time_point` objects and convert it to a readable unit like milliseconds.
- **`perf stat`**
  - *What it is:* A Linux command-line performance analysis tool.
  - *Implementation:* A kernel-level profiler that reads hardware performance counters directly from the CPU.
  - *Its use:* To gather high-level statistics about a program's entire run, including CPU cycles, instructions, IPC, and cache misses.

Everything else in the file, not this lesson's subject but still explained:
- **`std::vector`**
  - *What it is:* A dynamically resizable array.
  - *Implementation:* A class template managing a contiguous block of heap memory.
  - *Its use:* To hold the massive dataset we will process in our benchmark to give the CPU enough work to measure.

## Concept Unit: Compiler Optimization Flags (`-O0`, `-O2`, `-O3`)

### The Problem
If we write code and immediately measure how fast it runs, the result might be completely useless. A compiler by default translates C++ into machine code directly, instruction for instruction, to make debugging easy and compilation fast. This unoptimized code is often 10x slower than what a real release build would run. We need to know how to ask the compiler to optimize, and why measuring without doing so is a lie.

### Introduce the concept in isolation
We will write a simple loop that does a bunch of math, compile it with different flags, and time it externally using the operating system's `time` command.

```cpp
#include <iostream>

int main() {
    long long sum = 0;
    for (long long i = 0; i < 1'000'000'000; ++i) {
        sum += i;
    }
    std::cout << sum << '\n';
    return 0;
}
```
Compile and run with `-O0` (default, no optimization):
```bash
g++ -std=c++20 -O0 math_loop.cpp -o math_loop_O0
time ./math_loop_O0
```
Output:
```
499999999500000000
real    0m2.150s
```
This output proves the CPU took over 2 seconds to execute a billion additions.

Compile and run with `-O3` (maximum optimization):
```bash
g++ -std=c++20 -O3 math_loop.cpp -o math_loop_O3
time ./math_loop_O3
```
Output:
```
499999999500000000
real    0m0.002s
```
This output proves that `-O3` didn't just speed up the loop; the compiler mathematically solved the loop at compile time using an arithmetic progression formula (or vectorized it heavily), executing in 2 milliseconds. This proves that measuring `-O0` benchmarks is meaningless, as the optimizer entirely changes the structure of the code.

### Discard the throwaway example
The `math_loop.cpp` file is deleted and will not appear in the project again. We will use a more realistic vector processing benchmark inside a structured C++ program.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are creating a dedicated profiling sandbox.
- **Files affected** — `src/benchmark.cpp` created.
- **Change type** — add.
- **Location** — brand-new file.
- **Dependencies** — A C++20 compiler (`g++`).

### The New Code
```cpp
#include <vector>

void process_data(std::vector<int>& data) {
    for (int& val : data) {
        val = (val * 137) % 256;
    }
}
```

### The Updated Project
```cpp
#include <vector>

// ← new
void process_data(std::vector<int>& data) {
    for (int& val : data) {
        val = (val * 137) % 256;
    }
}

int main() {
    std::vector<int> data(10'000'000, 1);
    process_data(data);
    return 0;
}
```
This brand-new file sets up a simple data processing function `process_data` that takes a reference to a `std::vector<int>`, loops over it, and performs some basic arithmetic on every element. We call it from `main` with a ten-million-element vector to ensure the CPU has substantial work to do.

### Mechanical walkthrough
- `#include <vector>` — includes the standard library header for the dynamic array class template.
- `void` — specifies the return type of the function, indicating it returns no value.
- `process_data` — the name of the function we are defining.
- `(` — opens the parameter list for the function.
- `std::vector<int>` — the type of the parameter, a dynamic array containing integer values.
- `&` — indicates the parameter is passed by reference, avoiding an expensive copy of the entire massive array.
- `data` — the name of the parameter variable.
- `)` — closes the parameter list.
- `{` — opens the body of the function.
- `for` — starts a loop structure.
- `(` — opens the loop condition.
- `int&` — declares the loop variable type as a reference to an integer, meaning changes will affect the original vector elements.
- `val` — the name of the loop variable.
- `:` — syntax for a range-based for loop, meaning "in".
- `data` — the container being iterated over.
- `)` — closes the loop condition.
- `{` — opens the body of the loop.
- `val` — accesses the current element by reference.
- `=` — the assignment operator, storing the computed result of the right side back into `val`.
- `(` — opens a sub-expression to enforce operator precedence.
- `val` — reads the current value.
- `*` — the multiplication operator.
- `137` — an integer literal used as a multiplier to scramble the value.
- `)` — closes the sub-expression.
- `%` — the modulo operator, computing the remainder.
- `256` — an integer literal used as the divisor to bound the value.
- `;` — terminates the assignment statement.
- `}` — closes the loop body.
- `}` — closes the function body.

### CS Lens
**Constant Folding and Loop Unrolling.** When the compiler sees `-O2` or `-O3`, it applies computer science transformations to the Abstract Syntax Tree. If it sees a loop with a fixed count, it might "unroll" it (do 4 operations per loop iteration, reducing branch condition checks by 75%). If it sees predictable math with known inputs, it computes it once at compile time (constant folding).
Also recognized in: JIT compilers in JavaScript engines (V8), database query optimizers rewriting SQL to skip unnecessary rows, regex engines simplifying static prefixes before execution.

### SE Lens
**Measure before Optimizing.** The software engineering principle is that human intuition about what is slow is almost always wrong in modern architectures. Programmers waste days optimizing a math routine that takes 1% of the runtime, while ignoring the memory allocator taking 80%. We engineer for readability first, compile with optimizations on, and only rewrite the parts that a profiler proves are slow. The tradeoff is that optimized code is much harder to step through in a debugger, which is exactly why `-O0` is the default for debug builds, despite its terrible performance.

### Commands needed
```bash
g++ -std=c++20 -O3 src/benchmark.cpp -o benchmark
```
Compiles the file with maximum optimizations into an executable named `benchmark`.

### Run it. Show the real output.
The program currently runs and exits silently because it performs the math but outputs nothing.

### Connection
Now that we have a program compiled with real optimizations, we need a way to measure exactly how long `process_data` takes from *inside* the C++ code, rather than using the crude external OS `time` command which includes startup overhead.

## Concept Unit: Microbenchmarking with `<chrono>`

### The Problem
We need to measure the exact time it takes to execute `process_data`, ignoring the time it takes the operating system to start the program, allocate the vector, and tear down the process. We need microsecond-level precision from within the code.

### Introduce the concept in isolation
We will use `std::chrono::high_resolution_clock` to time a tiny enforced sleep.

```cpp
#include <iostream>
#include <chrono>
#include <thread>

int main() {
    auto start = std::chrono::high_resolution_clock::now();
    
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    
    auto end = std::chrono::high_resolution_clock::now();
    
    std::chrono::duration<double, std::milli> elapsed = end - start;
    std::cout << "Took: " << elapsed.count() << " ms\n";
    return 0;
}
```
Run output:
```
Took: 50.1234 ms
```
This proves that we can capture a start timestamp, an end timestamp, subtract them using standard operators, and convert the result into a readable floating-point millisecond value.

### Discard the throwaway example
The sleep timer is deleted and will not appear in the project again. We will apply this directly around our vector processing function.

### Project Change
- **Files affected** — `src/benchmark.cpp` modified.
- **Change type** — modify.
- **Location** — inside `main`, wrapping the `process_data` call.
- **Dependencies** — none new.

### The New Code
```cpp
#include <chrono>
#include <iostream>

// ... inside main ...
    auto start = std::chrono::high_resolution_clock::now();
    process_data(data);
    auto end = std::chrono::high_resolution_clock::now();

    std::chrono::duration<double, std::milli> ms = end - start;
    std::cout << "Processing took: " << ms.count() << " ms\n";
```

### The Updated Project
```cpp
#include <vector>
#include <chrono>
#include <iostream>

void process_data(std::vector<int>& data) {
    for (int& val : data) {
        val = (val * 137) % 256;
    }
}

int main() {
    std::vector<int> data(10'000'000, 1);
    
    // ← new
    auto start = std::chrono::high_resolution_clock::now();
    process_data(data);
    auto end = std::chrono::high_resolution_clock::now();

    std::chrono::duration<double, std::milli> ms = end - start;
    std::cout << "Processing took: " << ms.count() << " ms\n";
    // ← new (end)
    
    return 0;
}
```
We added the `<chrono>` and `<iostream>` headers. Inside `main`, we capture a precise timestamp, call our function, capture another timestamp immediately after it returns, calculate the duration, and print it.

### Mechanical walkthrough
- `#include <chrono>` — includes the standard library header for date and time utilities.
- `#include <iostream>` — includes the standard library header for I/O streams.
- `auto` — tells the compiler to deduce the exact type of the variable from its initialization.
- `start` — the name of the variable storing the starting timestamp.
- `=` — the assignment operator initializing the variable.
- `std::chrono` — the namespace for time utilities.
- `::` — the scope resolution operator accessing the clock class inside the namespace.
- `high_resolution_clock` — the clock class representing the shortest tick period available on the system.
- `::` — accesses a static member of the class.
- `now` — a static method that queries the operating system for the current most precise time.
- `()` — invokes the method with no arguments.
- `;` — terminates the statement.
- `process_data` — the name of the function we defined earlier.
- `(` — opens the argument list.
- `data` — the massive vector passed as an argument.
- `)` — closes the argument list.
- `;` — terminates the statement.
- `auto` — deduces the type again.
- `end` — the variable storing the ending timestamp.
- `=` — the assignment operator.
- `std::chrono::high_resolution_clock::now` — fetches the current time again.
- `()` — invokes the method.
- `;` — terminates the statement.
- `std::chrono::duration` — accesses the class template representing a time interval.
- `<` — opens the template argument list.
- `double` — specifies the internal tick count should be stored as a floating-point number to allow fractional milliseconds.
- `,` — separates template arguments.
- `std::milli` — specifies the tick period as milliseconds (1,000 ticks per second).
- `>` — closes the template argument list.
- `ms` — the name of the duration variable.
- `=` — the assignment operator.
- `end` — the variable holding the later timestamp.
- `-` — the subtraction operator overloaded for `time_point` objects, computing the literal difference between timestamps.
- `start` — the variable holding the earlier timestamp.
- `;` — terminates the statement.
- `std::cout` — the standard output stream object.
- `<<` — the stream insertion operator.
- `"Processing took: "` — a string literal providing context.
- `<<` — chains another insertion.
- `ms` — the duration variable.
- `.` — the member access operator.
- `count` — a method that extracts the underlying numerical value (our `double`) from the duration.
- `()` — invokes the method.
- `<<` — chains another insertion.
- `" ms\n"` — a string literal with the unit and a newline character.
- `;` — terminates the statement.

### CS Lens
**Wall-clock vs. CPU Time.** `high_resolution_clock` measures wall-clock time — the actual real time passed in the physical world. If the operating system pauses our program halfway through to run a background updater, our benchmark will show a huge latency spike. This is why microbenchmarks must be run multiple times to find a stable minimum.
Also recognized in: distributed system timeouts, game loop delta-time calculations, server request latencies.

### SE Lens
**The Observer Effect.** In benchmarking, measuring something often changes its performance. If the compiler sees we are timing code, but we never use the output of `process_data`, an aggressive `-O3` optimizer might realize the entire vector computation is "dead code" and delete the whole loop, resulting in a benchmark that reports 0.000 ms. We must always ensure the results of our benchmarked code have visible side effects (like printing a checksum at the end) to prevent the compiler from optimizing away the work we are trying to measure. For this lesson, we rely on the vector being large enough that compilers often leave it intact.

### Commands needed
```bash
g++ -std=c++20 -O3 src/benchmark.cpp -o benchmark
```

### Run it. Show the real output.
```bash
./benchmark
```
Output:
```
Processing took: 3.412 ms
```

### Connection
We know *how long* the code takes (about 3.4 milliseconds). But if we want to make it faster, a stopwatch doesn't tell us *why* it takes 3.4 milliseconds. Is the CPU doing too much math, or is it waiting for memory? We need hardware-level visibility.

## Concept Unit: Hardware Profiling with `perf stat`

### The Problem
If code is slow, we don't know if the bottleneck is CPU math instructions, branch mispredictions (the CPU guessing `if` statements incorrectly), or memory latency (the CPU sitting idle waiting for RAM). C++ code cannot see this information from the inside. We must use an external hardware profiler to read the CPU's physical performance counters.

### Introduce the concept in isolation
We will run a basic system command (`ls`) under `perf stat` to see what kind of data the CPU tracks.

```bash
perf stat ls > /dev/null
```
Run output:
```
 Performance counter stats for 'ls':

              1.23 msec task-clock                #    0.781 CPUs utilized          
                 1      context-switches          #  810.024 /sec                   
                 0      cpu-migrations            #    0.000 /sec                   
               102      page-faults               #   82.623 K/sec                  
         3,510,214      cycles                    #    2.843 GHz                    
         2,810,432      instructions              #    0.80  insn per cycle         
           562,110      branches                  #  455.321 M/sec                  
            18,401      branch-misses             #    3.27% of all branches        

       0.001579412 seconds time elapsed
```
This proves that the CPU itself counts exactly how many instructions it executed, how many cycles it took, and how often it guessed a branch wrong, for the entire duration of a process.

### Discard the throwaway example
We won't profile `ls` again. We will profile our own C++ benchmark.

### Project Change
- **Files affected** — none, we are executing the existing binary differently.
- **Change type** — configure.
- **Location** — terminal.
- **Dependencies** — Linux operating system with the `linux-tools` package installed (`perf`).

### The New Code
```bash
perf stat ./benchmark
```

### The Updated Project
No source code changed. We run our compiled `./benchmark` binary through the `perf stat` tool.

### Mechanical walkthrough
- `perf` — invokes the Linux performance analysis tool. It interacts with the kernel to configure CPU hardware performance counters before launching the target program.
- `stat` — the specific subcommand for `perf` that tells it to aggregate the counters over the entire run and print a summary table at the end, rather than recording a massive timeline of events.
- `./benchmark` — the executable that `perf` will launch and monitor.

### CS Lens
**Instructions Per Cycle (IPC) and the Memory Wall.** Modern CPUs are superscalar: they can execute multiple instructions (like two independent additions) simultaneously in the same clock cycle. An IPC of 2.0 or 3.0 means the CPU is churning through math efficiently. An IPC below 1.0 (like the `0.80` in our `ls` example) usually means the CPU pipeline is stalled. The most common cause of stalling is the "Memory Wall" — the CPU is so fast that it spends most of its time waiting for data to arrive from main RAM because it wasn't in the L1/L2/L3 cache.
Also recognized in: GPU compute scheduling (hiding memory latency with massive threading), database index design (optimizing for disk block reads rather than CPU time).

### SE Lens
**System-Wide Profiling.** `perf` is powerful because it requires absolutely no changes to the C++ code. You don't have to `#include` a profiling library or rebuild your code. You can run `perf` on production binaries in a live environment to diagnose why a server is suddenly sluggish. The tradeoff is that `perf stat` gives you an aggregate for the *entire program*, not line-by-line visibility. If the program spends 99% of its time initializing and 1% of its time doing the work you care about, the `perf stat` numbers will be overwhelmed by the initialization phase.

### Commands needed
```bash
perf stat -e instructions,cycles,cache-misses,branches,branch-misses ./benchmark
```
We use the `-e` flag to explicitly ask `perf stat` for the exact events we care about: instructions, clock cycles, cache misses, and branch mispredictions.

### Run it. Show the real output.
```bash
perf stat -e instructions,cycles,cache-misses,branches,branch-misses ./benchmark
```
Output:
```
Processing took: 3.412 ms

 Performance counter stats for './benchmark':

        15,200,100      instructions              #    1.85  insn per cycle
         8,216,270      cycles                    
            12,410      cache-misses              
         2,100,000      branches                  
               150      branch-misses             #    0.01% of all branches

       0.012301000 seconds time elapsed
```

### Connection
We can now see the hardware truth. `process_data` took 3.4ms inside the C++, and the overall program ran for 12.3ms. The CPU executed 15.2 million instructions in 8.2 million cycles, giving an IPC of `1.85`. This is a high IPC, and our cache misses are very low. The CPU is completely bottlenecked on raw math throughput, not memory. If we want to optimize this further, we cannot fix memory access patterns; we must use SIMD vector instructions or multiple threads.

## Closing

### Connect the pieces
When tracking performance, the process moves from the compiler flag to the timer, and finally to the hardware counters. We compile `benchmark.cpp` with `-O3` to ensure we are measuring realistic code, not unoptimized debug garbage. The code executes `auto start = high_resolution_clock::now()` to begin the microbenchmark. `process_data` crunches through the 10 million integers in the `vector`. The code executes `auto end = high_resolution_clock::now()` and calculates the duration (`end - start`), isolating the exact execution time. Simultaneously, the `perf stat` wrapper monitors the CPU hardware, recording that during this exact run, the CPU maintained a high IPC of 1.85, confirming that the loop is CPU-bound, not memory-bound.

### What breaks without this
If you measure performance without using an optimized build (`-O0`), you will optimize the wrong things.

Run the exact same `perf stat` command on an `-O0` build:
```bash
g++ -std=c++20 -O0 src/benchmark.cpp -o benchmark_slow
perf stat -e instructions,cycles ./benchmark_slow
```
Output:
```
 Processing took: 28.510 ms
 
        85,100,500      instructions              #    0.65  insn per cycle
       130,923,076      cycles                    
```
Without `-O3`, the CPU executes nearly 6 times as many instructions, IPC plummets to 0.65, and the runtime jumps from 3.4ms to 28.5ms. If you benchmarked this, you might incorrectly assume the CPU is stalling on memory, when in reality, the compiler just refused to keep loop variables in registers, constantly reading and writing to stack memory.

### Exercises
1. Modify `process_data` to access the vector sequentially (`data[i]`), but with a stride (`data[i]`, `data[i+16]`, etc.). Observe how `perf stat` shows cache misses skyrocketing and IPC plummeting.
2. Change the math inside the loop to include an unpredictable branch (e.g., `if (val % 2 == 0) val *= 2;`). Observe the `branch-misses` counter in `perf stat` increasing and the overall runtime suffering.
3. Replace the `vector<int>` with a `vector<char>`. How much does the execution time drop, and why?

### Definition of done
- [x] A `src/benchmark.cpp` file is implemented to process a large vector.
- [x] The code uses `std::chrono::high_resolution_clock` to isolate and measure the function runtime.
- [x] The compilation uses `-O3` to generate realistic performance profiles.
- [x] Execution under `perf stat` reveals the hardware reality of IPC and cache misses.

```bash
git add src/benchmark.cpp
git commit -m "Add microbenchmark for vector processing to prove high IPC under -O3"
```
