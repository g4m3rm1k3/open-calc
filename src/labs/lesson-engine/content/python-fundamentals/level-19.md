---
series: python-fundamentals
level: 19
title: Scope
lang: python
---

# Scope

A variable's **scope** is the region of code where it exists and can be used. Understanding scope answers the question "why can't I use this variable here?" — one of the most common sources of confusion for beginners.

Python uses the **LEGB rule** to look up names: Local, Enclosing, Global, Built-in, in that order.

## Local Scope

Variables created inside a function exist only inside that function. They are **local** to it:

```python
def calculate_tax(income):
    tax_rate = 0.20
    tax_amount = income * tax_rate
    return tax_amount

result = calculate_tax(50000)
print(result)
print(tax_rate)
```

```text
10000.0
NameError: name 'tax_rate' is not defined
```

`tax_rate` and `tax_amount` are local to `calculate_tax`. They exist while the function runs and disappear when it returns. The last line raises a `NameError` because `tax_rate` does not exist in the outer scope.

**Enable Debug and step through this** (remove the failing last line first). Watch `tax_rate` and `tax_amount` appear in the variables panel when `calculate_tax` starts, then disappear after it returns.

**CS lens:** Each function call creates a new **stack frame** — a block of memory holding the local variables for that call. When the function returns, the frame is popped off the call stack and its variables are released. This is what makes recursion possible: each recursive call gets its own frame with its own variables.

## Global Scope

Variables created at the top level of a file (outside any function) are **global**. Functions can read global variables but cannot reassign them without the `global` keyword:

```python
pi = 3.14159

def circle_area(radius):
    return pi * radius ** 2

def bad_update():
    pi = 99

print(circle_area(5))
bad_update()
print(pi)
```

```text
78.53975
3.14159
```

`bad_update()` creates a new local `pi = 99` — it does not change the global `pi`. After the call, the global `pi` is still `3.14159`.

## Why Avoiding global Is Good Practice

```python
total_users = 0

def register_user():
    global total_users
    total_users = total_users + 1

register_user()
register_user()
print(total_users)
```

```text
2
```

The `global` keyword lets you reassign a global variable from inside a function. This works, but creates **hidden coupling** — any function can modify `total_users`, making it hard to track where changes come from. In larger programs, this creates bugs that are very hard to find.

**SE lens:** Functions should communicate through parameters and return values, not through shared global state. If multiple functions need to share state, the state should be passed explicitly as a parameter or encapsulated in a class (covered later). Globals make code harder to test, harder to reason about, and harder to change.

## The LEGB Lookup Order

When Python encounters a name, it searches in this order:

```text
1. Local    — inside the current function
2. Enclosing — inside any enclosing function (nested functions, covered later)
3. Global   — at the module (file) level
4. Built-in — Python's built-in names (print, len, range, int, ...)
```

```python
message = "global"

def outer():
    message = "outer"

    def inner():
        print(message)

    inner()

outer()
print(message)
```

```text
outer
global
```

`inner()` has no local `message`, so Python looks in the enclosing scope (`outer`) and finds `"outer"`. The top-level `print` finds the global `"global"`.

## Challenge: make_counter

Write a function `running_total(values_list)` that returns the sum of all numbers in a list.

The function uses a local variable `total` to accumulate. This tests that you understand local scope: `total` starts fresh on each call (it is local), so calling `running_total` twice with different lists gives independent results.

`values_list` — a list of numbers. Iterate over it with `for value in values_list`.

```challenge
def running_total(values_list):
    pass
```

```test
assert running_total([1, 2, 3]) == 6
assert running_total([10, 20, 30]) == 60
assert running_total([]) == 0
assert running_total([-1, 1]) == 0
assert running_total([100]) == 100
```
