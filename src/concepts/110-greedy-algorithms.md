---
concept: 110-greedy-algorithms
name: Greedy Algorithms
---

## Definition

A greedy algorithm builds a solution by always making the choice that looks
best right now, without reconsidering that choice later — never
backtracking, never looking ahead to see if a different early choice would
have led to a better overall result.

## Problem

Trying every possible combination of choices to find the guaranteed-best
overall solution is often too slow. For certain specific problems, it
turns out that always taking the locally-best option at each step happens
to also produce the globally-best result — greedy exploits that when it's
actually true, without ever exploring the other options.

## Execution

Making change for 67 cents using US coins [25, 10, 5, 1], greedily
↓
Take the LARGEST coin that still fits: 25 (fits in 67) → remaining 42
↓
Take the largest that fits: 25 again → remaining 17
↓
Take the largest that fits: 10 → remaining 7
↓
Take the largest that fits: 5 → remaining 2
↓
Take the largest that fits: 1, 1 → remaining 0 — total coins used: 6 (25,25,10,5,1,1)

## Computer Science

Greedy only produces the truly optimal answer when the problem has the
"greedy choice property" (a locally optimal choice is always part of some
globally optimal solution) AND optimal substructure — proving a greedy
algorithm is correct for a given problem requires actually verifying that
property holds, not just assuming it because the algorithm "seems
reasonable."

Tags: Greedy choice property, Optimal substructure, Local vs global optimum

## Software Engineering

US coin denominations happen to make greedy correct for making change, but
NOT every coin system does — a system with coins [1, 3, 4] making change
for 6 greedily picks 4 then 1 then 1 (3 coins), while the true optimal is
3+3 (2 coins). Greedy's speed and simplicity are only a win when the
problem's structure actually guarantees it finds the true optimum.

Tags: Coin change counterexample, Dynamic programming fallback, Algorithm correctness

## Common Mistakes

- Assuming greedy is correct for a problem just because it "feels right" or works on the first few test cases — the greedy choice property needs to actually hold for every case; unverified greedy is a common source of subtly wrong solutions.
- Applying greedy to a problem that actually requires considering multiple options together (where Dynamic Programming's exhaustive-but-efficient approach is needed instead) — greedy commits to one choice and never reconsiders it, even if a later step reveals that choice was wrong.

## Exercises

- Trace the greedy coin-change algorithm by hand for making 30 cents with denominations [25, 10, 5, 1], and confirm it finds the true minimum (2 coins: 25+5).
- Using the denominations [1, 3, 4], compare the greedy answer for amount 6 against the true optimal answer found by trying all combinations — confirm greedy gives the WRONG answer here.

## javascript

```javascript
function greedyCoins(amount, denominations) {
  const sorted = [...denominations].sort((a, b) => b - a)
  const used = []
  for (const coin of sorted) {
    while (amount >= coin) {
      used.push(coin)
      amount -= coin
    }
  }
  return used
}

console.log(greedyCoins(67, [25, 10, 5, 1]))   // [ 25, 25, 10, 5, 1, 1 ] — optimal here
console.log(greedyCoins(6, [4, 3, 1]))         // [ 4, 1, 1 ] — 3 coins, but 3+3 (2 coins) is actually better!
```
Walkthrough: `greedyCoins` always takes the largest coin that still fits,
repeatedly, never reconsidering. For US-style denominations this happens
to always find the true minimum — but for `[4, 3, 1]` making 6, greedy's
`[4, 1, 1]` (3 coins) is worse than the true optimal `[3, 3]` (2 coins),
proving greedy isn't automatically correct just because it ran and
produced an answer.

## python

```python
def greedy_coins(amount, denominations):
    sorted_coins = sorted(denominations, reverse=True)
    used = []
    for coin in sorted_coins:
        while amount >= coin:
            used.append(coin)
            amount -= coin
    return used


print(greedy_coins(67, [25, 10, 5, 1]))   # [25, 25, 10, 5, 1, 1] -- optimal here
print(greedy_coins(6, [4, 3, 1]))         # [4, 1, 1] -- 3 coins, but 3+3 (2 coins) is actually better!
```
Walkthrough: identical greedy mechanics as the JavaScript version — the
same counterexample demonstrates that greedy's speed doesn't come with a
correctness guarantee unless the specific problem's structure actually
supports it.
