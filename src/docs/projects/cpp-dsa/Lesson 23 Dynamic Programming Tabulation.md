# Lesson 23: Dynamic Programming: Tabulation

**What you will build**
You will write standalone C++ scripts that solve problems by pre-computing and storing subproblem answers iteratively rather than recursively. The transferable problem this solves is calculating values strictly from the bottom up, ensuring every dependency is ready before it is needed, while eliminating the memory overhead and stack risks of recursive function calls. Finally, you will optimize memory by squashing a two-dimensional grid into a single one-dimensional array.

**What you need to know first**
Lesson 22 Memoization, Lesson 12 Standard Library Containers.

**Terms used in this lesson**
- **Tabulation** — Building a table (usually an array or vector) iteratively from the smallest subproblem up to the final target. *Why it exists:* To compute recurrent relationships sequentially without the hidden context-switching overhead and stack limits of recursive function calls.
- **Dependency order** — The explicit, manual sequence in which subproblems must be solved. *Why it exists:* Because in a bottom-up loop, you cannot calculate state `i` until every state it depends on is already computed and sitting in the table; recursion pauses to get dependencies automatically, but tabulation requires you to order the loops correctly.
- **Space optimization** — The practice of discarding old subproblem answers that will never be needed again. *Why it exists:* To dramatically reduce the memory footprint of a dynamic programming algorithm, often converting an $O(N^2)$ memory requirement into $O(N)$ when the algorithm only looks backward a fixed number of steps.

**Objects and methods used**

- **`std::vector<T>` / `constructor(size, value)`**
  - *What it is:* A dynamic array that initializes itself with a specific count of identical elements.
  - *Implementation:* `vector(size_type count, const T& value);`
  - *Its use:* Instantiating our full dynamic programming table pre-filled with base values (like `0` or `1`), avoiding the need to manually push elements in a setup loop.

**Everything else in the file, not this lesson's subject but still explained.**

- **`std::cout` / `<<`**
  - *What it is:* The standard character output stream.
  - *Implementation:* `extern std::ostream cout;`
  - *Its use:* Printing our final dynamic programming answers to the terminal to verify correctness.

---

## Concept Unit: Dependency Order in Tabulation

### The Problem
When you use memoization, the recursive function calls automatically pause to solve any subproblems they need, naturally resolving dependencies. But recursive calls carry stack overhead and risk stack overflow on deep inputs. To solve subproblems iteratively with a simple loop, you must manually guarantee that before you calculate step $i$, the answers for $i-1$ and $i-2$ are already computed. You need a structured way to order the work from smallest to largest.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the core bottom-up pattern in isolation.
- **Files affected:** Created `fib_tabulation.cpp`.
- **Change type:** Add.
- **Location:** A standalone file.
- **Dependencies:** Lesson 12 `std::vector`.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int n = 5;
    std::vector<int> dp(n + 1, 0);
    
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    std::cout << "Answer for " << n << ": " << dp[n] << "\n";
    return 0;
}
```

### The Updated Project
Because this is a brand-new standalone script, there is no surrounding structure. The code above represents the entire file.

### Isolate the Concept
To prove how `std::vector` pre-fills a table of a specific size, compile and run this fragment:
```cpp
#include <iostream>
#include <vector>
int main() {
    std::vector<int> table(4, -1);
    for(int val : table) std::cout << val << " ";
    return 0;
}
```
**Output:** `-1 -1 -1 -1`
This proves that the constructor allocates exactly four slots and initializes every single one to `-1` immediately. This is called **pre-allocation**. It is exactly what `std::vector<int> dp(n + 1, 0)` in the code above is doing, isolated, ensuring we have a fully sized, zeroed-out table ready for direct index access before the loop even starts.

### Discard the Throwaway Example
The `table` fragment is deleted and will not appear again.

### Mechanical Walkthrough
- `#include <iostream>`: Pulls in the standard output stream definitions.
- `#include <vector>`: Pulls in the standard vector container definitions.
- `int n = 5;`: Declares the target subproblem we want to solve.
- `std::vector<int> dp(n + 1, 0);`: Instantiates a vector named `dp` holding integers. It creates `n + 1` elements (6 elements total, so indices `0` through `5` are valid), and sets each to `0`. We need `n + 1` so that `dp[n]` is a valid addressable index.
- `dp[0] = 0;`: Manually sets the base case for $0$. 
- `dp[1] = 1;`: Manually sets the base case for $1$.
- `for (int i = 2; i <= n; i++)`: The core iteration order. It begins at `2` because `0` and `1` are already solved. It strictly moves upward.
- `dp[i] = dp[i - 1] + dp[i - 2];`: The state transition equation. It calculates the current state by reading the two previous states directly from the table. Because the loop strictly counts up, `i - 1` and `i - 2` are guaranteed to have been solved in earlier iterations.
- `std::cout << "Answer for " << n << ": " << dp[n] << "\n";`: Prints the final solved target.

Execution trace for the loop:
```text
Iteration 1: i=2, dp[2] = dp[1] + dp[0] = 1 + 0 = 1
Iteration 2: i=3, dp[3] = dp[2] + dp[1] = 1 + 1 = 2
Iteration 3: i=4, dp[4] = dp[3] + dp[2] = 2 + 1 = 3
Iteration 4: i=5, dp[5] = dp[4] + dp[3] = 3 + 2 = 5
```

### CS Lens
This is **Tabulation** — the bottom-up approach to Dynamic Programming. 

```text
Also recognized in: generating Pascal's Triangle, calculating Levenshtein distance 
in spell checkers, and route-finding algorithms like Floyd-Warshall.
```
By systematically computing from smallest to largest, tabulation avoids the recursive call stack completely.

### SE Lens
The alternative not chosen is top-down memoization with recursive function calls. The tradeoff here is control versus simplicity. Tabulation requires you to figure out the exact topological order of dependencies (which is easy for a 1D sequence but hard for complex graphs), but in return, it executes as a blazing-fast contiguous memory loop with zero stack-frame overhead.

### Commands
Compile the code:
```bash
g++ -std=c++17 fib_tabulation.cpp -o fib_tabulation
```
The `g++` command invokes the compiler, `-std=c++17` forces the C++17 standard, and `-o fib_tabulation` names the resulting executable.

### Run It
```bash
./fib_tabulation
```
**Output:**
```text
Answer for 5: 5
```

### Connection
Now that we can iterate predictably through a single dimension, we must apply this dependency ordering to problems with two dimensions.

---

## Concept Unit: Converting Memoization to a 2D Table

### The Problem
A 2D dynamic programming problem (like finding unique paths on a grid) has two variables: a row and a column. Memoization uses a recursive function taking two arguments, but a bottom-up approach needs to iterate through a 2D grid in a specific order so that every cell's dependencies (the cell directly above it and the cell directly left of it) are already computed and filled before we reach the current cell.

### Project Change
- **Reference Source:** No reference counterpart — this isolates the 2D tabulation technique.
- **Files affected:** Created `unique_paths_2d.cpp`.
- **Change type:** Add.
- **Location:** A standalone file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int rows = 3;
    int cols = 3;
    std::vector<std::vector<int>> dp(rows, std::vector<int>(cols, 0));
    
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == 0 || c == 0) {
                dp[r][c] = 1;
            } else {
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
            }
        }
    }
    
    std::cout << "Paths to bottom-right: " << dp[rows - 1][cols - 1] << "\n";
    return 0;
}
```

### The Updated Project
Because this is a standalone script, there is no surrounding structure.

### Isolate the Concept
To prove how 2D vector nesting works, run this isolated fragment:
```cpp
#include <iostream>
#include <vector>
int main() {
    std::vector<std::vector<int>> grid(2, std::vector<int>(3, 9));
    std::cout << grid[1][2];
    return 0;
}
```
**Output:** `9`
This proves that we can nest a vector inside a vector to create a 2D grid. The outer constructor creates `2` elements, and populates each with a copy of the inner `std::vector<int>(3, 9)`. This is called a **vector of vectors**. It is exactly what the `dp` declaration in the code above is doing, isolated.

### Discard the Throwaway Example
The `grid` fragment is deleted.

### Mechanical Walkthrough
- `int rows = 3;`: Defines the vertical dimension of our grid.
- `int cols = 3;`: Defines the horizontal dimension of our grid.
- `std::vector<std::vector<int>> dp(...)`: Declares a vector where every element is itself another `std::vector<int>`.
- `(rows, std::vector<int>(cols, 0))`: The outer vector allocates `rows` (3) slots. For every slot, it inserts a brand new inner vector of size `cols` (3), initialized to `0`. 
- `for (int r = 0; r < rows; r++)`: The outer loop visits every row sequentially from top to bottom.
- `for (int c = 0; c < cols; c++)`: The inner loop visits every column in the current row from left to right. This left-to-right, top-to-bottom iteration is the explicit **dependency order** for this problem.
- `if (r == 0 || c == 0)`: The base case check. If we are on the very top edge (`r == 0`) or the very left edge (`c == 0`), there is only 1 way to reach this cell (moving straight).
- `dp[r][c] = 1;`: Fills the base case directly into the table.
- `dp[r][c] = dp[r - 1][c] + dp[r][c - 1];`: The recurrence relation. It computes the current cell by adding the paths from the cell directly above (`r - 1`) and the cell directly to the left (`c - 1`). Because of our nested loop order, both of those cells were guaranteed to be visited and filled in earlier loop iterations.

Execution trace for the interior cell at `r=1, c=1`:
1. `dp[r-1][c]` evaluates to `dp[0][1]`, which the loop previously set to `1` (top edge base case).
2. `dp[r][c-1]` evaluates to `dp[1][0]`, which the loop previously set to `1` (left edge base case).
3. `dp[1][1] = dp[0][1] + dp[1][0] = 1 + 1`, resulting in `2`.

### CS Lens
This is **2D Tabulation**. Because we strictly iterate top-down and left-right, every cell acts as a dependency sink that only reads backward in time. 

```text
Also recognized in: computing Longest Common Subsequence in diff tools, 
zero-one Knapsack problems, and sequence alignment in bioinformatics.
```

### SE Lens
The alternative not chosen is a 2D recursive function using a hash map for memoization. The tradeoff here is memory locality. A 2D `std::vector` places its rows in predictable memory, allowing the CPU cache to efficiently prefetch the data. A recursive map causes random heap jumps, making the recursive version noticeably slower on large grids even if the mathematical time complexity is identical.

### Commands
Compile the code:
```bash
g++ -std=c++17 unique_paths_2d.cpp -o unique_paths_2d
```

### Run It
```bash
./unique_paths_2d
```
**Output:**
```text
Paths to bottom-right: 6
```

### Connection
We successfully built a 2D table to hold all subproblems, but looking closely at the equation, we realize we are storing old rows that we never look at again.

---

## Concept Unit: Space Optimization (Reducing 2D to 1D)

### The Problem
The 2D table above uses $O(m \times n)$ memory. But look at the dependency: when calculating row `r`, you only ever look at row `r` (the current cell's left neighbor) and row `r-1` (the cell directly above it). Row `r-2` and earlier are completely dead memory. To save space, we want to reduce the entire 2D matrix down to a single 1D array that continuously overwrites itself.

### Project Change
- **Reference Source:** No reference counterpart — this proves the space optimization transformation.
- **Files affected:** Created `unique_paths_1d.cpp`.
- **Change type:** Add.
- **Location:** A standalone file.
- **Dependencies:** None.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    int rows = 3;
    int cols = 3;
    std::vector<int> dp(cols, 1);
    
    for (int r = 1; r < rows; r++) {
        for (int c = 1; c < cols; c++) {
            dp[c] = dp[c] + dp[c - 1];
        }
    }
    
    std::cout << "Paths to bottom-right: " << dp[cols - 1] << "\n";
    return 0;
}
```

### The Updated Project
Because this is a standalone script, there is no surrounding structure.

### Isolate the Concept
To prove how in-place mutation works, run this fragment:
```cpp
#include <iostream>
int main() {
    int value = 5;
    value = value + 2;
    std::cout << value;
    return 0;
}
```
**Output:** `7`
This proves that the right side of the `=` operator reads the old, existing value (`5`) before the assignment overwrites the variable with the newly computed value (`7`). This is called **in-place updating**. It is exactly what `dp[c] = dp[c] + dp[c - 1]` in the code above is doing, isolated.

### Discard the Throwaway Example
The `value` fragment is deleted.

### Mechanical Walkthrough
- `int rows = 3;`: Sets the number of rows.
- `int cols = 3;`: Sets the number of columns.
- `std::vector<int> dp(cols, 1);`: We declare a single 1D array representing just *one* row. We initialize every column to `1`. This pre-fills the array to perfectly mimic the `r=0` top-edge base case.
- `for (int r = 1; r < rows; r++)`: The outer loop still simulates moving row by row, starting from row 1.
- `for (int c = 1; c < cols; c++)`: The inner loop moves left to right. We start at column 1 because the left edge (`c=0`) is always `1`.
- `dp[c] = dp[c] + dp[c - 1];`: The space optimization core.
- `dp[c]` (on the right side of `=`): Reads the value currently sitting at index `c`. Because we haven't overwritten it yet this iteration, this is the value from the *previous* row. It acts exactly like `dp[r - 1][c]`.
- `dp[c - 1]` (on the right side of `=`): Reads the value at the previous index. Because the inner loop moves left to right, column `c - 1` was already updated during this current row's iteration. It acts exactly like `dp[r][c - 1]`.
- `dp[c]` (on the left side of `=`): Overwrites the slot with the new sum, fully migrating this slot from "old row" to "new row".
- `std::cout << "Paths to bottom-right: " << dp[cols - 1] << "\n";`: The final answer is sitting in the last slot of the array once all rows are processed.

Execution trace for the second row (`r = 1`):
1. `Start state` is `dp = [1, 1, 1]`, which represents row 0.
2. The inner loop evaluates `c = 1`. It calculates `dp[1] + dp[0]`, reading `1 + 1 = 2`. It overwrites `dp[1]`. The state becomes `[1, 2, 1]`.
3. The inner loop evaluates `c = 2`. It calculates `dp[2] + dp[1]`, reading `1 + 2 = 3`. It overwrites `dp[2]`. The state becomes `[1, 2, 3]`.

### CS Lens
This is **Space Optimization**. By analyzing the topological bounds of our recurrence relation, we proved that the problem only has a lookback depth of 1 row. Dropping an entire dimension shifts the memory complexity from $O(N^2)$ to $O(N)$, which is often the difference between a program passing or crashing out of memory on a server. 

```text
Also recognized in: sliding window algorithms, audio processing buffers, 
and streaming cellular automata logic.
```

### SE Lens
The alternative not chosen is keeping the full 2D array. The tradeoff here is debugging visibility versus hardware limits. When you squash the matrix down to 1D, you permanently destroy the historical states, making it impossible to print out the whole 2D grid to verify your intermediate math. You sacrifice observability to guarantee the program fits in RAM.

### Commands
Compile the code:
```bash
g++ -std=c++17 unique_paths_1d.cpp -o unique_paths_1d
```

### Run It
```bash
./unique_paths_1d
```
**Output:**
```text
Paths to bottom-right: 6
```

### Connection
You have transitioned from building heavy recursive call trees down to maintaining a single, hyper-efficient one-dimensional array.

---

## Closing

### Connect the pieces
Every step we took reduced the runtime burden. We began by removing the call stack overhead completely using a 1D vector loop. We then proved we could map a two-variable recursive problem onto a 2D vector matrix by iterating strictly left-to-right and top-to-bottom. Finally, we analyzed the dependencies in that matrix and compressed it down to a 1D array, reducing the memory footprint entirely while arriving at the exact same answer (`6`).

### What breaks without this
If you alter the iteration order to violate the dependencies, the logic collapses.
Modify the inner loop of `unique_paths_1d.cpp` to run backwards:
```cpp
for (int c = cols - 1; c >= 1; c--) {
    dp[c] = dp[c] + dp[c - 1];
}
```
**Output:**
```text
Paths to bottom-right: 3
```
Because the inner loop runs right-to-left, `dp[c - 1]` has not been updated yet for the current row when `dp[c]` needs it. You accidentally read the old row's value instead of the current row's value, ruining the mathematics completely. Bottom-up DP relies strictly on correct ordering.

### Exercises
1. **Fibonacci Space Optimization:** Modify the `fib_tabulation.cpp` script. Since Fibonacci only looks back two steps (`i-1` and `i-2`), you do not need a full vector. Rewrite it using just three integer variables (`prev2`, `prev1`, `current`) and no arrays at all.
2. **Min Cost Tabulation:** Create a script that uses a 1D vector to find the minimum cost to climb stairs. Each step has a cost, and you can jump 1 or 2 steps. Calculate the cost at `dp[i]` by taking the minimum of the two prior steps plus the current cost.
3. **Print the History:** In the `unique_paths_2d.cpp` script, add a nested loop at the very end of `main` that prints out the entire completed 2D grid to the terminal, row by row, so you can visualize the numbers growing.

### Definition of done
- [ ] You have compiled and run a 1D tabulation script.
- [ ] You have compiled and run a 2D tabulation grid.
- [ ] You have compiled and run a space-optimized 1D array that overwrites itself.
- [ ] You can explain out loud why dependency order matters in bottom-up loops.
- [ ] Code has been verified and deleted; no production files were modified.
