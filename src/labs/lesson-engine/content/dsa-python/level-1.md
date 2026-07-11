---
series: dsa-python
level: 1
title: Two Pointers
lang: python
---

# Two Pointers

A nested loop compares every pair of elements in O(n²). The two-pointer technique
replaces it with two index variables that start at opposite ends of the array and
close in toward each other. Each step eliminates at least one position, so the whole
scan finishes in O(n). This level teaches you to see when a problem has that
structure — and to use the debugger to watch exactly how the pointers move.

## The Closing-in Pattern

Place `left` at index 0 and `right` at the last index. Each iteration compares what
they point at, decides what to do, then moves one or both inward. When they meet,
the scan is complete.

A palindrome reads the same forwards and backwards. To check it: compare the
characters at `left` and `right`. If they match, both are confirmed — move both
inward. If they don't match, stop — the string cannot be a palindrome.

Here is the full trace for `"racecar"` — read this before running the code:

```text
left=0 → 'r'   right=6 → 'r'   match → move both inward
left=1 → 'a'   right=5 → 'a'   match → move both inward
left=2 → 'c'   right=4 → 'c'   match → move both inward
left=3           right=3        left < right is False → exit loop → True
```

For `"hello"`:

```text
left=0 → 'h'   right=4 → 'o'   mismatch → return False immediately
```

The code below prints each iteration so you can see the trace live. **Enable Debug
and step through it** — watch `left`, `right`, `left_char`, and `right_char` update
in the variables panel on the right as each line executes. Notice when `left` and
`right` cross.

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
print(is_palindrome("level"))     # True
```

`left_char` and `right_char` are stored in local variables deliberately — so the
debugger shows you the character values alongside the indices. Without them, you'd
only see the index numbers and have to compute `s[left]` mentally.

**CS lens:** Two pointers use O(1) extra memory — only the two indices are state.
The naive approach reverses the string (`s[::-1]`) and compares: also O(n) time but
O(n) extra memory for the copy. Two pointers make no copy.

**SE lens:** The invariant is: "every pair checked so far has matched." Moving
`left` inward is safe because we have confirmed the character at the old `left` index
matches. Moving `right` inward for the same reason. Breaking this — moving a pointer
when characters have not been checked — produces silent wrong answers.

## Challenge: is palindrome (ignoring punctuation)

Write `is_palindrome(s)` that returns `True` if `s` is a palindrome after removing
all non-alphanumeric characters and converting to lowercase.

`"A man, a plan, a canal: Panama"` is a palindrome. `"race a car"` is not.

Two methods you will need:
- `char.isalnum()` — returns `True` if the character is a letter or digit
- `char.lower()` — returns the lowercased character

Filter the string into a clean list of characters first, then apply the same
closing-in logic from the step above. The empty string is a palindrome.

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

The palindrome pattern always moves both pointers inward. Some problems require
choosing *which* pointer to move based on what you find. When the array is sorted,
that choice can be proved correct — not guessed.

`pair_sum_exists` asks: does any pair in a sorted array add up to `target`?

The sum of `arr[left] + arr[right]` is the current candidate. Because the array is
sorted you know: moving `right` left will decrease the sum (smaller right value),
moving `left` right will increase it (larger left value). So:

```text
arr = [1, 3, 5, 7, 9]   target = 10

left=0 (1)  right=4 (9)   sum=10   found! → True

arr = [1, 3, 5, 7, 9]   target = 6

left=0 (1)  right=4 (9)   sum=10   too large → right -= 1
left=0 (1)  right=3 (7)   sum=8    too large → right -= 1
left=0 (1)  right=2 (5)   sum=6    too large → right -= 1
left=0 (1)  right=1 (3)   sum=4    too small → left  += 1
left=1       right=1       left < right is False → exit → False
```

No pair is checked twice. No valid pair is skipped. **Enable Debug and step through**
— watch `left`, `right`, and `current_sum` in the variables panel. Every movement is
logically forced by the sorted order.

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
            left += 1    # sum too small — need a larger value on the left
        else:
            right -= 1   # sum too large — need a smaller value on the right
    return False

print(pair_sum_exists([1, 3, 5, 7, 9], 10))   # True
print(pair_sum_exists([1, 3, 5, 7, 9], 6))    # False
print(pair_sum_exists([2, 4, 6, 8], 7))        # False — no exact pair
```

**CS lens:** Because the array is sorted, every pointer movement is logically forced.
"Sum is too large, so the only way to decrease it is to move `right` left" is a proof,
not an observation. The two pointers work because sorted order converts a two-variable
search into a series of single-variable decisions.

**SE lens:** Two-pointer algorithms are fast because data structure properties
(sorted order here) encode the decision logic. Without sorting, you cannot know which
pointer to move. The algorithm's correctness depends on the precondition — that is why
`pair_sum_exists` only works on sorted input and why callers must sort first.

## Challenge: find the duplicate

You are given a list of `n + 1` integers where each integer is between `1` and `n`
inclusive. Exactly one value appears twice. Find it using O(1) extra space — no
visited set, no sorting.

Treat the array as an implicit graph: position `i` points to position `arr[i]`. Because
one value appears twice, two positions point to the same place — creating a cycle.
Floyd's cycle detection (the fast/slow pointer pattern) finds where the cycle begins,
which is the duplicate.

Phase 1 — find a meeting point inside the cycle:
- `slow` advances by 1 each step: `slow = arr[slow]`
- `fast` advances by 2 each step: `fast = arr[arr[fast]]`
- When `slow == fast` they are inside the cycle

Phase 2 — find the cycle entry (the duplicate):
- Reset `slow = 0` (back to the start of the array)
- Advance both by 1 each step
- Where they meet is the duplicate value

**Enable Debug on your solution** and step through both phases. Watch `slow` and
`fast` converge in phase 1, then watch `slow` catch up from index 0 in phase 2.

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
