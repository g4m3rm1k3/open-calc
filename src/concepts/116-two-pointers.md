---
concept: 116-two-pointers
name: Two Pointers
---

## Definition

The Two Pointers technique uses two index variables moving through a data
structure — often from opposite ends, or at different speeds — to solve a
problem in a single pass, instead of checking every possible pair with
nested loops.

## Problem

Many problems naively require checking every pair of elements — does any
pair sum to a target value? — an O(n²) nested-loop approach. On sorted
data, two pointers starting at opposite ends and moving inward based on a
comparison can find the same answer in a single O(n) pass.

## Execution

Find two numbers in sorted [1, 3, 5, 7, 9] that sum to 12
↓
left=0 (value 1), right=4 (value 9): sum=10, too SMALL — move left pointer right
↓
left=1 (value 3), right=4 (value 9): sum=12 — FOUND, return (3, 9)

## Computer Science

This works specifically because the data is sorted — if the current sum
is too small, moving the left pointer right can only increase the sum
(since everything to the right is bigger), and if too large, moving the
right pointer left can only decrease it. Each move provably eliminates
possibilities that could never have worked, without needing to check them
individually.

Tags: Sorted invariant, Single-pass algorithms, Linear time, Pointer movement

## Software Engineering

Two pointers turns an O(n²) nested-loop pattern into O(n) whenever the data
has an exploitable order — common uses include the "two sum on sorted
array" shown here, detecting a palindrome (pointers from both ends moving
inward, comparing), and merging two sorted arrays (a pointer in each,
always advancing whichever is smaller).

Tags: Palindrome checking, Merging sorted arrays, Linear-time optimization

## Common Mistakes

- Applying two pointers to UNSORTED data expecting it to work the same way — the technique's correctness depends entirely on the sorted order; on unsorted data, moving a pointer based on a comparison doesn't reliably eliminate anything.
- Moving the wrong pointer, or both at once, when only one should move — this can skip over the actual answer entirely, since each pointer's movement direction encodes a specific, provable assumption about what's now impossible.

## Exercises

- Trace two pointers by hand on sorted `[1, 2, 4, 6, 8, 9]` looking for a pair summing to 10, writing out `left`, `right`, and the current sum at each step.
- Adapt the technique to check whether a string is a palindrome, using two pointers starting at each end and moving inward.

## javascript

```javascript
function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1
  while (left < right) {
    const sum = arr[left] + arr[right]
    if (sum === target) return [arr[left], arr[right]]
    if (sum < target) left++
    else right--
  }
  return null
}

console.log(twoSumSorted([1, 3, 5, 7, 9], 12))   // [ 3, 9 ]
console.log(twoSumSorted([1, 3, 5, 7, 9], 20))   // null — no pair sums to 20
```
Walkthrough: `left` and `right` start at opposite ends. If the sum is too
small, `left` moves right (toward bigger numbers); if too large, `right`
moves left (toward smaller numbers) — each move is justified by the
array's sorted order, letting the whole array be checked in a single pass.

## python

```python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return (arr[left], arr[right])
        if total < target:
            left += 1
        else:
            right -= 1
    return None


print(two_sum_sorted([1, 3, 5, 7, 9], 12))   # (3, 9)
print(two_sum_sorted([1, 3, 5, 7, 9], 20))   # None -- no pair sums to 20
```
Walkthrough: identical opposite-ends mechanics as the JavaScript version —
each pointer's movement direction is justified purely by the sorted order
of the array.
