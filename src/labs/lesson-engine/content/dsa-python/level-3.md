---
series: dsa-python
level: 3
title: Stacks
lang: python
---

# Stacks

A stack is a Last-In, First-Out (LIFO) structure. The last thing pushed on is the
first thing popped off — like a stack of plates. Stacks appear everywhere: the
function call stack, undo history, expression evaluation, and bracket matching.
Python lists implement all stack operations efficiently.

## The Stack as a List

Python's list supports stack operations directly. `append()` pushes to the top (end);
`pop()` removes from the top. Both are O(1).

```python
stack = []

stack.append("first")
stack.append("second")
stack.append("third")

print(stack)         # ["first", "second", "third"]
print(stack[-1])     # "third"  — peek at top without removing
print(stack.pop())   # "third"  — remove and return top
print(stack.pop())   # "second"
print(stack)         # ["first"]
```

**CS lens:** The defining property of a stack is LIFO. Only the top element is
accessible — you cannot reach elements below the top without first removing everything
above. This constraint is what makes stacks useful: it models any situation where the
most recently encountered item must be resolved before earlier ones.

**SE lens:** Stacks are the natural data structure for anything that must be "unwound"
in reverse order. When Python evaluates a nested function call like `f(g(h(x)))`,
it pushes `h`, then `g`, then `f` onto the call stack. When `h` finishes, it's popped;
then `g` runs; then `f`. The nesting is encoded in the order of pushes.

A stack enables a clean algorithm for reversing sequences. Push everything, then
pop everything — the pop order is the reverse of the push order.

```python
def reverse_string(s):
    stack = []
    for char in s:
        stack.append(char)
    result = []
    while stack:           # "while stack" is True when the stack is non-empty
        result.append(stack.pop())
    return "".join(result)

print(reverse_string("hello"))   # "olleh"
print(reverse_string("abcde"))   # "edcba"
```

## Challenge: balanced parentheses

Given a string containing only `(`, `)`, `[`, `]`, `{`, `}`, return `True` if every
opening bracket has a matching closing bracket in the correct order.

When you see an opening bracket, push it. When you see a closing bracket, check
whether the top of the stack is its matching opener. If it is, pop. If it is not —
or the stack is empty — the string is unbalanced. At the end, the stack must be empty.

```challenge
def is_balanced(s):
    pass
```

```test
assert is_balanced("()[]{}") == True
assert is_balanced("([{}])") == True
assert is_balanced("([)]") == False
assert is_balanced(")") == False
assert is_balanced("") == True
assert is_balanced("{[}") == False
```

## Stacks for Monotonic Problems

A monotonic stack maintains elements in strictly increasing or decreasing order.
When a new element violates the ordering, pop until the order is restored, then push.
This gives O(n) solutions to problems that appear to need O(n²).

The "next greater element" problem: for each element, find the first element to its
right that is greater than it. Use a stack to track elements whose "next greater" has
not yet been found.

```python
def next_greater(arr):
    result = [-1] * len(arr)   # default: no greater element exists
    stack = []                 # stack of indices

    for index in range(len(arr)):
        # pop all indices whose element is smaller than arr[index]
        while stack and arr[stack[-1]] < arr[index]:
            smaller_index = stack.pop()
            result[smaller_index] = arr[index]
        stack.append(index)

    return result

print(next_greater([4, 5, 2, 10, 8]))
# [5, 10, 10, -1, -1]
# 4 → 5 (next greater),  5 → 10,  2 → 10,  10 → -1,  8 → -1
```

**CS lens:** Each element is pushed once and popped once — O(n) total. Without a
stack, you would need a nested loop: for each element, scan right until you find
something greater — O(n²). The stack stores "unanswered questions" (elements with
no next-greater yet found) and resolves them the moment a larger element arrives.

**SE lens:** This is the monotonic stack pattern. It appears in histogram problems,
stock span calculation, and temperature forecasting. The invariant is: the stack always
holds indices in the order their elements appear, with no "next greater" resolved yet.

```python
def daily_temperatures(temperatures):
    # How many days to wait for a warmer temperature?
    waiting = [0] * len(temperatures)
    stack = []  # indices of days still waiting for warmth

    for today in range(len(temperatures)):
        while stack and temperatures[stack[-1]] < temperatures[today]:
            cold_day = stack.pop()
            waiting[cold_day] = today - cold_day
        stack.append(today)

    return waiting

print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
```

## Challenge: evaluate RPN expression

Evaluate a mathematical expression in Reverse Polish Notation (RPN). In RPN, operators
follow their operands: `3 4 +` means `3 + 4`. The expression is given as a list of
strings. Operators are `"+"`, `"-"`, `"*"`, `"/"`.

Use a stack. When you see a number, push it. When you see an operator, pop two numbers
(right operand first, then left), apply the operator, and push the result. At the end,
the stack contains exactly one value — the answer. Division truncates toward zero: use
`int(a / b)`, not `a // b` (which floors toward negative infinity).

```challenge
def eval_rpn(tokens):
    pass
```

```test
assert eval_rpn(["2", "1", "+", "3", "*"]) == 9
assert eval_rpn(["4", "13", "5", "/", "+"]) == 6
assert eval_rpn(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) == 22
assert eval_rpn(["3", "4", "+"]) == 7
assert eval_rpn(["5", "1", "2", "+", "4", "*", "+", "3", "-"]) == 14
```
