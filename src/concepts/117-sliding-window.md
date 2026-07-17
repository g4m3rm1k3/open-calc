---
concept: 117-sliding-window
name: Sliding Window
---

## Definition

The Sliding Window technique maintains a running range (window) over a
contiguous portion of an array or string, expanding and shrinking it
incrementally, instead of recomputing a result from scratch for every
possible window position.

## Problem

Finding the best contiguous subarray or substring of some size, by
checking every possible window from scratch, redoes shared work between
overlapping windows, O(n × window size). A sliding window updates the
running result incrementally as the window moves one step, reusing most of
the previous window's computation.

## Execution

Find the maximum sum of any 3 consecutive numbers in [2, 1, 5, 1, 3, 2]
↓
First window [2,1,5]: sum = 8 — current max = 8
↓
Slide right by one: remove 2 (leaving), add 1 (entering) → new window
[1,5,1]: sum = 8-2+1 = 7 — max stays 8
↓
Slide again: remove 1, add 3 → new window [5,1,3]: sum = 7-1+3 = 9 — new max = 9
↓
Slide again: remove 5, add 2 → new window [1,3,2]: sum = 9-5+2 = 6 — max stays 9
↓
No more positions — answer: 9 (from window [5,1,3])

## Computer Science

This works because a sliding window's sum (or other incrementally
maintainable property) can be updated in O(1) per slide — subtract what's
leaving, add what's entering — rather than needing to re-sum the entire new
window from scratch, which is what turns an O(n × window size) naive
approach into O(n) total.

Tags: Incremental update, Linear time, Contiguous subarray, Amortized O(1)

## Software Engineering

This is the standard technique for "best/longest/shortest contiguous
subarray or substring satisfying some property" problems — fixed-size
windows (as shown here) update in strict O(1) per slide; variable-size
windows (expanding or shrinking based on a condition, like "longest
substring with no repeated characters") are a related but slightly more
involved variant of the same idea.

Tags: Fixed-size windows, Variable-size windows, String problems

## Common Mistakes

- Recomputing the whole window's sum from scratch on every slide instead of incrementally updating it — this works correctly but defeats the entire performance benefit, degrading back to O(n × window size).
- Off-by-one errors in exactly which element leaves and which enters when the window slides — easy to shift the window by the wrong amount or miscount its boundary.

## Exercises

- Trace the sliding window by hand for a window size of 2 over the same array, and confirm the running-sum update at each slide.
- Adapt the technique to a VARIABLE-size window that finds the longest substring without repeating characters — when does the window need to shrink instead of just slide?

## javascript

```javascript
function maxSubarraySum(arr, k) {
  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += arr[i]
  let maxSum = windowSum

  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i]   // remove what's leaving, add what's entering
    maxSum = Math.max(maxSum, windowSum)
  }
  return maxSum
}

console.log(maxSubarraySum([2, 1, 5, 1, 3, 2], 3))   // 9 — from the window [5, 1, 3]
```
Walkthrough: the initial window's sum is computed once, directly. Every
slide afterward updates that running sum in O(1) — subtracting the
element that just left the window and adding the one that just entered —
instead of re-summing the whole new window from scratch.

## python

```python
def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i - k] + arr[i]   # remove what's leaving, add what's entering
        max_sum = max(max_sum, window_sum)
    return max_sum


print(max_subarray_sum([2, 1, 5, 1, 3, 2], 3))   # 9 -- from the window [5, 1, 3]
```
Walkthrough: identical incremental-update mechanics as the JavaScript
version — the running sum is adjusted by exactly one subtraction and one
addition per slide, regardless of window size.
