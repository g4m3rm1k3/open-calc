# Lesson 25: Backtracking

**What you will build**
You will build a program that solves the classic N-Queens problem by systematically placing queens on a board, detecting conflicts, and undoing choices that lead to dead ends. The transferable problem this solves is exploring a massive space of possible solutions efficiently by discarding bad paths as early as possible without getting stuck.

**What you need to know first**
Lesson 03 Recursion, Lesson 12 Standard Library Containers.

**Terms used in this lesson**
- **State-space tree** — The theoretical web of all possible choices a program can make, represented as branches in a tree. *Why it exists:* To give programmers a mental model for visualizing how an algorithm searches through billions of potential configurations one step at a time.
- **Backtracking** — A recursive algorithmic pattern that builds a solution incrementally and abandons a path the moment it realizes it cannot succeed. *Why it exists:* To solve problems where the answer is a sequence of dependent choices, allowing the program to "undo" a bad choice and try the next option without starting over from scratch.
- **Pruning** — The act of stopping the exploration of a specific branch in the state-space tree early because it violates a constraint. *Why it exists:* To save computational time. Searching every single possibility (brute force) is mathematically impossible for large inputs; pruning skips dead ends before computing them.

**Objects and methods used**
- **`std::vector<T>` / `push_back`**
  - *What it is:* A dynamic array that can grow in size, reappearing from Lesson 12.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* To append a new choice onto our running sequence of decisions.
- **`std::vector<T>` / `pop_back`**
  - *What it is:* A method that removes the last element of a dynamic array.
  - *Implementation:* `void pop_back();`
  - *Its use:* To "undo" our last choice when a path fails, physically removing the most recent decision from our running state.
- **`std::abs`**
  - *What it is:* A mathematical function that returns the absolute (positive) value of an integer.
  - *Implementation:* `int abs(int n);`
  - *Its use:* To calculate diagonal distances on a grid without worrying about whether the difference is negative or positive.

---

## Concept Unit: The Generate-and-Test Loop

### The Problem
When searching for a valid combination of choices, the naive approach is to generate every single complete combination first, and then test each one to see if it works. This is known as brute force. For even small problems, this generates an exponentially large number of failures. You need a way to build a partial solution step-by-step, test it immediately, and retreat if it fails, before generating the rest of the combination.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because it isolates the core backtracking loop before applying it to a grid.
- **Files affected:** `backtrack_demo.cpp` (created)
- **Change type:** Add

### The New Code
```cpp
#include <iostream>
#include <vector>

void findPaths(std::vector<int>& path, int step) {
    if (step == 3) {
        std::cout << "Valid path: ";
        for (int p : path) std::cout << p << " ";
        std::cout << "\n";
        return;
    }

    for (int choice = 1; choice <= 2; choice++) {
        // 1. Choose
        path.push_back(choice);
        
        // 2. Explore
        findPaths(path, step + 1);
        
        // 3. Un-choose (Backtrack)
        path.pop_back();
    }
}

int main() {
    std::vector<int> path;
    findPaths(path, 0);
    return 0;
}
```

### The Updated Project
Because this is a brand-new file isolating a concept, the code shown above is the complete working state. The `findPaths` function systematically builds and breaks down sequences of `1`s and `2`s.

### Mechanical Walkthrough
- `void findPaths(std::vector<int>& path, int step)`: A recursive function taking a vector by reference (so all recursive calls share and mutate the exact same list) and an integer tracking the current depth.
- `if (step == 3)`: The base case. If we have successfully made 3 choices, we consider the path complete, print it, and return.
- `for (int choice = 1; choice <= 2; choice++)`: The generate loop. At every step, the algorithm has exactly two options: pick `1` or pick `2`.
- `path.push_back(choice);`: The "Choose" step. We commit the current choice to our shared state.
- `findPaths(path, step + 1);`: The "Explore" step. We recursively call the function to make the *next* choice, moving one step deeper into the state-space tree.
- `path.pop_back();`: The "Un-choose" or "Backtrack" step. Once the recursive call returns (either because it found a solution or hit a dead end), we remove the choice we just made. This restores the `path` vector to its exact previous state, allowing the `for` loop to advance and try the next choice on a clean slate.

Execution trace for the recursive calls:
1. `step 0` loop starts, chooses `1`. `path` mutates to `[1]`. Recursion dives to `step 1`.
2. `step 1` loop starts, chooses `1`. `path` mutates to `[1, 1]`. Recursion dives to `step 2`.
3. `step 2` loop starts, chooses `1`. `path` mutates to `[1, 1, 1]`. Recursion dives to `step 3`.
4. `step 3` hits the base case, prints the valid path, and returns control to `step 2`.
5. `step 2` resumes immediately after the recursive call. It executes `path.pop_back()`, shrinking the path back to `[1, 1]`. The loop advances to `choice = 2`.
6. `step 2` chooses `2`. `path` mutates to `[1, 1, 2]`. Recursion dives to `step 3`.
7. `step 3` hits the base case, prints the valid path, and returns control to `step 2`.
8. `step 2` executes `path.pop_back()`, shrinking the path back to `[1, 1]`. Its loop finishes, and it returns control to `step 1`.

### CS Lens
This embodies **Depth-First Search (DFS)** on a state-space tree. The algorithm plunges down a single path as deep as possible before exploring siblings. The sequence of pushing a choice, recurring, and popping the choice is the universal blueprint for backtracking.

### SE Lens
The alternative not chosen is passing the vector by value (making a copy for every recursive call). The tradeoff is performance. Copying the vector avoids the need to manually execute `pop_back` to undo state, but dynamically allocating a new array on every single node of an exponential tree would consume massive amounts of CPU time and memory. Mutating a single shared reference and rigorously cleaning up after yourself is standard for high-performance searches.

### Run It Yourself
1. Open a terminal and compile: `g++ -std=c++17 backtrack_demo.cpp -o backtrack_demo`
2. Run it: `./backtrack_demo`
3. Observe the output generating all 8 permutations of length 3:
   ```
   Valid path: 1 1 1 
   Valid path: 1 1 2 
   Valid path: 1 2 1 
   ...
   ```
4. Delete `backtrack_demo.cpp`. This throwaway example will not appear in the project again.

---

## Concept Unit: Pruning the Tree (N-Queens)

### The Problem
Generating all combinations is fine for small trees, but the N-Queens problem asks us to place 8 queens on an 8x8 chessboard such that no two queens attack each other (no two share the same row, column, or diagonal). If we generate all possible column placements for 8 rows, that is $8^8 = 16,777,216$ states. We need to detect collisions *while* building the path and stop exploring immediately if a constraint is violated.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are implementing the classic N-Queens solver natively.
- **Files affected:** `nqueens.cpp` (created)
- **Change type:** Add

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <cmath>

bool isValid(const std::vector<int>& board, int currentRow, int proposedCol) {
    for (int r = 0; r < currentRow; r++) {
        int c = board[r];
        if (c == proposedCol) return false;
        if (std::abs(c - proposedCol) == std::abs(r - currentRow)) return false;
    }
    return true;
}

void solveNQueens(std::vector<int>& board, int currentRow, int n, int& solutions) {
    if (currentRow == n) {
        solutions++;
        return;
    }

    for (int col = 0; col < n; col++) {
        if (isValid(board, currentRow, col)) {
            board.push_back(col);
            solveNQueens(board, currentRow + 1, n, solutions);
            board.pop_back();
        }
    }
}

int main() {
    int n = 8;
    std::vector<int> board;
    int solutions = 0;
    
    solveNQueens(board, 0, n, solutions);
    
    std::cout << "Found " << solutions << " solutions for " << n << " Queens.\n";
    return 0;
}
```

### The Updated Project
Because this is a brand-new file, the code shown above is the complete working state. The `solveNQueens` function implements the core backtracking pattern, guarded by the `isValid` constraint checker.

### Mechanical Walkthrough
- `bool isValid(const std::vector<int>& board, int currentRow, int proposedCol)`: A helper function that checks if placing a queen at `(currentRow, proposedCol)` conflicts with any previously placed queens.
- `const std::vector<int>& board`: We pass the board by `const` reference because the validation logic only needs to read the history, not alter it. The index in the vector represents the row, and the value represents the column the queen is in.
- `for (int r = 0; r < currentRow; r++)`: Loops through every row that already has a queen placed in it.
- `int c = board[r];`: Reads the column position of the previously placed queen.
- `if (c == proposedCol) return false;`: Checks for a column collision. If any previous queen `c` is in the same column we are proposing, this placement is invalid.
- `if (std::abs(c - proposedCol) == std::abs(r - currentRow)) return false;`: Checks for a diagonal collision. Two points are on the same diagonal if the absolute horizontal difference equals the absolute vertical difference.
- `std::abs(...)`: Calculates the absolute value, eliminating the need to check positive and negative diagonal slopes separately.
- `if (isValid(board, currentRow, col))`: The pruning trigger. We only execute the `push_back`/recurse/`pop_back` sequence if the proposed column is safe. If it is not, the `for` loop skips it entirely, instantly severing that branch of the state-space tree from exploration.
- `solutions++`: A counter passed by reference that increments every time a valid leaf node in the state-space tree is reached.

### CS Lens
This is **Pruning**. By checking validity *before* recursing, the algorithm avoids generating the millions of child states that would flow from an obviously invalid placement. This reduces the search space for 8 Queens from 16.7 million paths down to just 2,056 actual recursive checks. Also recognized in: chess engines evaluating moves (Alpha-Beta pruning), pathfinding algorithms like A*, and constraint satisfaction solvers.

### SE Lens
The alternative not chosen is representing the board as a full 2D array `int board[8][8]` and scanning the whole grid for conflicts. The tradeoff is space and validation speed. By recognizing that each row can only hold exactly one queen, we flatten the state into a single 1D vector `std::vector<int>` where the index implies the row. This dramatically shrinks the memory footprint and speeds up the collision math since we only check exact mathematical coordinates rather than scanning empty array slots.

### Run It Yourself
1. Compile: `g++ -std=c++17 nqueens.cpp -o nqueens`
2. Run it: `./nqueens`
3. Observe the output:
   ```
   Found 92 solutions for 8 Queens.
   ```

Connecting this unit to the previous: the `isValid` condition turns our naive generate-and-test loop into an intelligent, constrained search.

---

## Connect the Pieces

Watch a single decision flow through the complete system: At row 0, the loop places a queen at column 0. The recursion goes to row 1. The loop tries column 0, but `isValid` detects a vertical collision and skips it. The loop tries column 1, but `isValid` detects a diagonal collision and skips it. The loop tries column 2, `isValid` approves, the choice is `push_back`'d, and the recursion dives to row 2. If row 2 finds no valid columns at all, its loop finishes and it returns. The recursion unwinds back to row 1, `pop_back` physically removes the queen from column 2, and row 1 advances to test column 3 on a clean board.

## What Breaks Without This

Remove the pruning step by commenting out the `if (isValid(...))` check and its matching braces in `solveNQueens`. Recompile and run. 
The program will eventually finish and report an astronomical number of "solutions" (16,777,216) because it simply accepted every possible column placement for 8 rows as a valid path, proving that the constraints are the only thing stopping the exponential explosion of states. Restore the `isValid` check.

## Exercises

1. **Count the Nodes:** Add a global or reference variable `int recursiveCalls = 0;` and increment it at the very top of `solveNQueens`. Print this out at the end to see exactly how many times the function was called to find those 92 solutions.
2. **Visualizer:** Modify the base case `if (currentRow == n)` to call a new function `void printBoard(const std::vector<int>& board)` that uses a nested loop to print `Q` for queens and `.` for empty spaces for exactly the first solution found, then forcefully exit the program.
3. **Bigger Boards:** Change `n` to `10`. Recompile and run. Note the slight delay in execution time as the state-space tree expands exponentially.

## Definition of Done

- [ ] You have run a backtracking loop that undoes its own state using `pop_back`.
- [ ] You have run an N-Queens solver that calculates diagonal constraints.
- [ ] You can explain out loud how pruning saves computational time.
- [ ] `git add src/docs/projects/cpp-dsa/"Lesson 25 Backtracking.md"`
- [ ] `git commit -m "Add lesson 25 on backtracking, state-space trees, and N-Queens"`
