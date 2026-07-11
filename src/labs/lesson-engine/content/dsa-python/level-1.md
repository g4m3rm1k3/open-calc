---
series: dsa-python
level: 1
title: Two Pointers
lang: python
---

# Two Pointers

A nested loop compares every pair of elements — O(n²). The two-pointer technique
replaces nested loops with two index variables that start at opposite ends and
move toward each other. Because each step eliminates at least one position from
consideration, the whole problem is solved in a single O(n) pass. This level teaches
you to see when a problem has that structure, and to use the debugger to watch exactly
how the pointers move.

## The Closing-in Pattern

`left` starts at index 0. `right` starts at the last index. At each step you compare
what they point at, decide what to do, then move one or both pointers inward. The loop
ends when they meet.

A palindrome reads the same forwards and backwards. Checking it with two pointers:
compare the character at `left` to the character at `right`. If they match, both must
be correct — move both inward. If they don't match, the string cannot be a palindrome —
stop immediately.

Here is the full trace for `"racecar"` before you run the code:

```
start:   left=0 → 'r'   right=6 → 'r'   match → move inward
step 2:  left=1 → 'a'   right=5 → 'a'   match → move inward
step 3:  left=2 → 'c'   right=4 → 'c'   match → move inward
step 4:  left=3 → 'e'   right=3 → 'e'   left < right is False → exit → True
```

For `"hello"`:

```
start:   left=0 → 'h'   right=4 → 'o'   mismatch → return False immediately
```

The code below prints the state at every step. Run it first without Debug to see all
the iterations printed. Then **enable Debug and step through line by line** — watch
`left`, `right`, and the characters they point at update in the variables panel on the
right as each line executes.

```python
def is_palindrome(s):
    left = 0
    right = len(s) - 1
    while left < right:
        left_char = s[left]
        right_char = s[right]
        print(f"left={left} → '{left_char}'   right={right} → '{right_char}'")
        if left_char != right_char:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"))   # True
print(is_palindrome("hello"))     # False
```

**CS lens:** Each iteration either finds a mismatch and stops, or moves both pointers
one step inward. In the worst case (a palindrome), `n/2` iterations are needed —
O(n). A naive approach reverses the string with `s[::-1]` and compares: also O(n)
time, but O(n) extra memory for the reversed copy. Two pointers use O(1) extra memory —
only `left` and `right`.

**SE lens:** The invariant is: if every pair checked so far has matched, the string
is still a palindrome candidate. Moving `left` inward is safe because we have already
confirmed the character at the old `left` matches. Moving `right` inward is safe for
the same reason. Breaking this invariant — moving a pointer when characters have not
been checked — would silently produce wrong answers.

## Challenge: is palindrome (ignoring punctuation)

Write `is_palindrome(s)` that returns `True` if `s` is a palindrome after removing
all non-alphanumeric characters and lowercasing everything.
`"A man, a plan, a canal: Panama"` is a palindrome. `"race a car"` is not.

`char.isalnum()` returns `True` if a character is a letter or digit.
`char.lower()` lowercases a character. Filter the string first, then apply the
same closing-in logic from the step above.

```challenge
def is_palindrome(s):
    pass
```

```test
assert is_palindrome("racecar") == True
assert is_palindrome("hello") == False
assert is_palindrome("A man, a plan, a canal: Panama") == True
assert is_palindrome("race a car") == False
assert is_palindrome("") == True
assert is_palindrome("a") == True
```

## Making a Decision at Each Step

The closing-in pattern for palindromes always moves both pointers inward. Some problems
require deciding which pointer to move based on what you find. When the input is sorted,
that decision can be made with certainty — no guessing, no backtracking.

`pair_sum_exists` asks: does any pair in a sorted array add up to `target`?

With two pointers starting at opposite ends, the current sum is `arr[left] + arr[right]`.
Because the array is sorted, you know exactly what moving each pointer does:
- Moving `right` left picks a smaller right value → smaller sum
- Moving `left` right picks a larger left value → larger sum

Here is the full trace for `arr = [1, 3, 5, 7, 9]`, `target = 10`:

```
left=0 (1)  right=4 (9)   sum=10  → found! return True
```

And for `target = 6`:

```
left=0 (1)  right=4 (9)   sum=10  too large → move right left
left=0 (1)  right=3 (7)   sum=8   too large → move right left
left=0 (1)  right=2 (5)   sum=6   too large → move right left
left=0 (1)  right=1 (3)   sum=4   too small → move left right
left=1 (3)  right=1 (3)   left < right is False → exit → False
```

Enable Debug and step through the code below. Watch `left`, `right`, and `current_sum`
in the variables panel. Notice: no pair is checked twice, and no pair that could be the
answer is skipped.

```python
def pair_sum_exists(arr, target):
    left = 0
    right = len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        print(f"left={left} ({arr[left]})  right={right} ({arr[right]})  sum={current_sum}")
        if current_sum == target:
            return True
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return False

print(pair_sum_exists([1, 3, 5, 7, 9], 10))  # True
print(pair_sum_exists([1, 3, 5, 7, 9], 6))   # False
```

**CS lens:** Because the array is sorted, moving left right strictly increases the sum
and moving right left strictly decreases it. This means every pointer movement is
logically forced — not a guess. The guarantee that no valid pair is skipped is a
proof, not an observation. That proof is what elevates this from a heuristic to an
algorithm.

**SE lens:** The decision (`left += 1` vs `right -= 1`) encodes mathematical knowledge
about the domain: sorted arrays. Two-pointer algorithms are fast because the data
structure's sorted property tells you what to do at each step. Without sorting,
the decision cannot be made with certainty and two pointers do not work.

## Challenge: find the duplicate

You are given a list of `n + 1` integers where each integer is in the range `1` to `n`
inclusive. Exactly one value appears twice. Find it without sorting and without
using extra memory for a visited structure.

Treat the list as an implicit structure where `arr[i]` points to position `arr[i]`.
Because one value appears twice, two positions point to the same place — creating a
cycle. Use a slow pointer (advances by 1) and a fast pointer (advances by 2).

Phase 1: advance until `slow == fast` (they are inside the cycle).
Phase 2: reset `slow = 0`. Advance both by 1 until they meet again. Where they meet
is the duplicate value.

Enable Debug and step through the two phases separately. Watch how slow and fast
converge in phase 1, then how slow catches up from index 0 in phase 2.

```challenge
def find_duplicate(arr):
    pass
```

```test
assert find_duplicate([1, 3, 4, 2, 2]) == 2
assert find_duplicate([3, 1, 3, 4, 2]) == 3
assert find_duplicate([1, 1]) == 1
assert find_duplicate([2, 2, 2, 2, 2]) == 2
```
