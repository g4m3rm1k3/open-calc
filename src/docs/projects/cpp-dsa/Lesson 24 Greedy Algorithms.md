# Lesson 24: Greedy Algorithms

**What you will build:** You will write C++ functions that solve optimization problems by aggressively making the best immediate choice at every step. These programs demonstrate how to bypass exhaustive searching. The transferable problem this solves is identifying when a fast, naive, step-by-step approach is mathematically guaranteed to yield the perfect global solution, and recognizing the structural traps where it fails.

**What you need to know first:** DSA Lesson 01: Big-O Notation, C++ From Scratch (Lesson 35).

**Terms used in this lesson:**
- **Greedy algorithm** — An algorithmic paradigm that builds a solution piece by piece, always choosing the next piece that offers the most obvious and immediate benefit. *Why it exists:* To dramatically reduce computation time by never reconsidering past choices and never predicting future ones.
- **Local optimum** — The most advantageous choice available right now, given only the current state. *Why it exists:* It provides a single, unambiguous rule for the algorithm to execute at each step without needing memory of past steps or analysis of future steps.
- **Global optimum** — The absolute best possible solution among all conceivable valid solutions for the entire problem. *Why it exists:* This is the final answer you are actually trying to find; comparing the greedy result to this determines if the algorithm was successful.
- **Greedy choice property** — A mathematical characteristic indicating that picking the local optimum strictly leads to a global optimum. *Why it exists:* It is the primary prerequisite for trusting a greedy algorithm; if a problem lacks this, the greedy approach is merely guessing.
- **Optimal substructure** — A characteristic where an optimal solution to the whole problem is built strictly out of optimal solutions to its smaller subproblems. *Why it exists:* It is the secondary prerequisite, guaranteeing that after making one greedy choice, applying the exact same greedy logic to the remaining data will still work.

**Objects and methods used:**
- **`std::sort`**
  - *What it is:* The C++ Standard Library's optimized sorting function.
  - *Implementation:* `void sort(RandomIt first, RandomIt last, Compare comp);`
  - *Its use:* To pre-organize data so that the greedy algorithm can simply process items sequentially from start to finish.
- **Lambda expressions**
  - *What it is:* An anonymous function defined directly at the site where it is invoked.
  - *Implementation:* `[capture](parameters) { body }`
  - *Its use:* To define the precise, custom comparison rule that dictates which item should be considered "better" by the sorting algorithm.

---

## Concept Unit: Activity Selection (The Greedy Success)

### The Problem
You have a single conference room and a list of requested meetings, each with a specific start and end time. You want to schedule the maximum possible number of meetings in that single room. Evaluating every possible combination of meetings would take exponential time. You need a fast sequence of choices that guarantees the maximum schedule.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are demonstrating algorithmic logic in isolation.
- **Files affected** — Created `activity.cpp`.
- **Change type** — Add.
- **Location** — A brand-new file.
- **Dependencies** — A C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <vector>
#include <algorithm>

struct Activity {
    std::string name;
    int start;
    int end;
};

int main() {
    std::vector<Activity> activities = {
        {"A", 1, 4},
        {"B", 3, 5},
        {"C", 0, 6},
        {"D", 5, 7},
        {"E", 3, 9},
        {"F", 5, 9},
        {"G", 6, 10},
        {"H", 8, 11},
        {"I", 8, 12},
        {"J", 2, 14},
        {"K", 12, 16}
    };

    // The Greedy Choice: Sort by earliest end time.
    std::sort(activities.begin(), activities.end(), [](const Activity& a, const Activity& b) {
        return a.end < b.end;
    });

    std::vector<Activity> schedule;
    int current_time = 0;

    for (const Activity& act : activities) {
        if (act.start >= current_time) {
            schedule.push_back(act);
            current_time = act.end;
        }
    }

    std::cout << "Max activities scheduled: " << schedule.size() << "\n";
    for (const Activity& act : schedule) {
        std::cout << act.name << " (" << act.start << "-" << act.end << ")\n";
    }

    return 0;
}
```

### Mechanical Walkthrough
- `#include <algorithm>`: Instructs the compiler to include the file defining sorting and searching algorithms, required for `std::sort`.
- `struct Activity`: Defines a custom data type holding a name, start time, and end time. This binds the three pieces of data together so they move as one unit when sorted.
- `std::sort(...)`: Calls the standard library sorting algorithm. It requires three arguments: the beginning of the range, the end of the range, and a custom comparison rule.
- `[](const Activity& a, const Activity& b) { return a.end < b.end; }`: A lambda expression serving as the comparison rule. It instructs `std::sort` to place activity `a` before activity `b` strictly if `a` finishes before `b`. This establishes our local optimum: the activity that frees up the room the fastest.
- `std::vector<Activity> schedule`: Initializes an empty dynamic array to store the final chosen activities.
- `int current_time = 0`: Tracks the moment the conference room will next become available. Initially, the room is free at time zero.
- `for (const Activity& act : activities)`: Iterates over the now-sorted list of activities one by one.
- `if (act.start >= current_time)`: The condition checking if the current activity is compatible with the schedule. Because the list is sorted by end time, the very first activity that meets this condition is mathematically guaranteed to be the best possible choice.
- `schedule.push_back(act)`: Appends the compatible activity to our final result list.
- `current_time = act.end`: Updates the room's availability to the end time of the newly scheduled activity. This locks the room for that duration and prevents overlapping choices in future iterations.

1. `act` = A (1-4): The condition `start (1) >= current_time (0)` evaluates to true, meaning the room is free. The code appends `A` to `schedule` and updates `current_time` to `4`.
2. `act` = B (3-5): The condition `start (3) >= current_time (4)` evaluates to false because it overlaps with `A`. The code skips it.
3. `act` = C (0-6): The condition `start (0) >= current_time (4)` evaluates to false. The code skips it.
4. `act` = D (5-7): The condition `start (5) >= current_time (4)` evaluates to true. The code appends `D` to `schedule` and updates `current_time` to `7`.

### CS Lens
This algorithm works because it possesses the **greedy choice property** and **optimal substructure**. By always picking the activity that ends earliest, we leave the maximum possible remaining time for all subsequent activities. Once we make that greedy choice, the remainder of the timeline (from `act.end` onward) is an exact, smaller copy of the original problem (optimal substructure). There is no scenario where picking an activity that ends later could possibly allow more subsequent activities to fit.

### SE Lens
The alternative not chosen is dynamic programming or recursive backtracking to evaluate every valid non-overlapping subset. The tradeoff is computation time: a greedy approach runs in O(N log N) time (dominated entirely by the `std::sort`), whereas backtracking takes O(2^N) exponential time. When the problem structure allows it, greedy algorithms are the most performant choice in software engineering.

### Commands needed to make this unit real
- `g++ -std=c++17 activity.cpp -o activity`: Compiles the file using the C++17 standard, naming the output executable `activity`.
- `./activity`: Runs the compiled executable.

### Run It
```text
Max activities scheduled: 4
A (1-4)
D (5-7)
H (8-11)
K (12-16)
```

### Discard the throwaway example
This code is an isolated proof of the greedy scheduling concept. It is explicitly discarded here and will not carry forward into a larger project.

### Connection
You just proved that a greedy choice works perfectly when a problem's structure guarantees it. But what happens when the data doesn't provide those guarantees?

---

## Concept Unit: The Limits of Greed (The Counterexample)

### The Problem
You need to make exact change for a specific amount of money using the absolute minimum number of coins. A greedy algorithm would naturally pick the largest possible coin that fits, subtract its value, and repeat. But if your currency denominations don't perfectly align, this logical local optimum traps you in a terrible global solution.

### Project Change
- **Reference Source** — No reference counterpart — this is a from-scratch addition because we are proving algorithmic failure in isolation.
- **Files affected** — Created `coin_fail.cpp`.
- **Change type** — Add.
- **Location** — A brand-new file.
- **Dependencies** — A C++17 compiler.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    // A fictional currency system
    std::vector<int> denominations = {11, 5, 1};
    int target_amount = 15;
    
    std::vector<int> coins_used;
    int remaining = target_amount;
    
    for (int coin : denominations) {
        while (remaining >= coin) {
            coins_used.push_back(coin);
            remaining -= coin;
        }
    }
    
    std::cout << "Target: " << target_amount << "\n";
    std::cout << "Coins used: " << coins_used.size() << "\n";
    for (int coin : coins_used) {
        std::cout << coin << " ";
    }
    std::cout << "\n";
    
    return 0;
}
```

### Mechanical Walkthrough
- `std::vector<int> denominations = {11, 5, 1}`: Defines our available coin sizes, already sorted from largest to smallest. This ordering is critical because the greedy strategy always attempts the largest choice first.
- `int remaining = target_amount`: A variable tracking how much change is left to make. It starts at `15`.
- `for (int coin : denominations)`: Iterates through each available coin size, starting with the largest (`11`).
- `while (remaining >= coin)`: A loop that continuously applies the current coin as long as it fits into the remaining amount. This is the greedy choice in action: grab the biggest piece possible, as many times as possible, before moving on.
- `coins_used.push_back(coin)`: Records the choice.
- `remaining -= coin`: Deducts the chosen coin's value from the total left to make.

1. `coin` = 11: The condition `remaining (15) >= 11` evaluates to true. The code pushes `11` into `coins_used` and subtracts `11`, leaving `remaining` at `4`.
2. `coin` = 11: The condition `remaining (4) >= 11` evaluates to false. The inner loop terminates, and the outer loop advances to the next coin.
3. `coin` = 5: The condition `remaining (4) >= 5` evaluates to false. The inner loop terminates, and the outer loop advances to the next coin.
4. `coin` = 1: The condition `remaining (4) >= 1` evaluates to true. The inner loop runs four consecutive times, pushing four `1`s and leaving `remaining` at `0`.

### CS Lens
This is where the **greedy choice property** fails. The greedy algorithm produced a result of 5 coins (one 11-cent coin, four 1-cent coins). However, the absolute optimal solution is 3 coins (three 5-cent coins). By making the locally optimal choice at the very first step (grabbing the massive 11-cent coin), the algorithm backed itself into a corner where it was forced to use inefficient 1-cent coins for the rest of the work. The problem structure does not guarantee that picking the largest coin yields the fewest total coins. (Note: The greedy algorithm *does* work for standard US denominations like 25, 10, 5, 1).

### SE Lens
The alternative not chosen is using dynamic programming to calculate the exact optimal combination for all possible sums up to the target. The tradeoff here is correctness versus speed. A greedy algorithm is useless if it silently returns the wrong answer. In software engineering, you must mathematically prove your problem possesses the greedy choice property before deploying a greedy algorithm to production.

### Commands needed to make this unit real
- `g++ -std=c++17 coin_fail.cpp -o coin_fail`
- `./coin_fail`

### Run It
```text
Target: 15
Coins used: 5
11 1 1 1 1 
```

### Discard the throwaway example
This code isolates the failure mode of greedy algorithms. It is discarded here.

### Connection
The greedy algorithm executed its logic flawlessly, but the underlying data invalidated the strategy, proving that "fast" is only valuable when "correct" is mathematically guaranteed.

---

## Closing

**Connect the pieces**
A greedy algorithm is not a specific block of code; it is a way of thinking. In the activity selection, the choice (earliest end time) guaranteed success because no future combination could possibly fit more meetings into the same span. In the coin change problem, the choice (largest coin) failed because it ignored better combinations that didn't include the largest coin. Both used the exact same aggressive, local-optimum logic, but only one had the mathematical properties to support it.

**What breaks without this**
If you alter the activity selection sorting rule to be greedy about *start times* instead of end times, the logic breaks.
Change the lambda in `activity.cpp`:
```cpp
// Incorrect greedy choice: earliest start time
return a.start < b.start;
```
If an activity starts at `0` but lasts until `100`, the algorithm will eagerly select it first, locking the room for 100 hours and rejecting dozens of shorter meetings. The local optimum must be carefully chosen to leave the maximum possible room for future steps.

**Exercises**
1. **The US Currency Proof:** Modify the coin change code to use US denominations `{25, 10, 5, 1}` and set the target to `93`. Observe that the greedy approach produces the correct minimal amount of coins.
2. **Fractional Knapsack:** You have 50 pounds of space in a bag. You have three items: Item A (10 lbs, $60), Item B (20 lbs, $100), Item C (30 lbs, $120). Write a greedy loop that takes as much of the most valuable item *per pound* as possible, proving it maximizes the total dollar value.
3. **The Counterexample Trap:** Can you find a target amount for the `{11, 5, 1}` currency where the greedy algorithm *does* accidentally produce the optimal solution?

**Definition of Done**
- [ ] You can define "local optimum" and "global optimum."
- [ ] You can explain the "greedy choice property" and "optimal substructure."
- [ ] You have compiled and run a successful greedy scheduling algorithm.
- [ ] You have compiled and run a failing greedy coin change algorithm.
- [ ] You committed your code with a message like: `Proof: Activity selection succeeds with greedy strategy, arbitrary coin change fails.`
