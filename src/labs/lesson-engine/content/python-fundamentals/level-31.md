---
series: python-fundamentals
level: 31
title: Type Hints
lang: python
---

Type hints are annotations that state what type a variable, parameter, or return value is expected to hold. Python does not enforce them at runtime — annotated code runs identically to unannotated code. What type hints do is make the code's contract explicit, enabling editors and tools to catch mistakes before you run the program.

## Function Annotations

Annotate parameters with `: type` after the name. Annotate the return type with `-> type` before the colon:

```python
def greet(name: str, times: int) -> str:
    return (name + " ") * times

result = greet("Hello", 3)
print(result)
print(greet("Hi", 0))
```

```text
Hello Hello Hello 
(empty string)
```

`name: str` — the caller is expected to pass a string.
`times: int` — the caller is expected to pass an integer.
`-> str` — the function is expected to return a string.

The annotation is a claim, not a constraint. `greet(42, "three")` runs without error — Python does not check annotations at runtime. Tools like `mypy` and your editor check them statically, before running.

**CS lens:** Static type checking — verifying types before execution — catches entire classes of bugs automatically. A function that expects `str` and receives `None` will eventually crash with `AttributeError`. A type checker reports this immediately, without running the program. Type hints move bug discovery from runtime to write-time.

## Basic Types

```python
def calculate_tax(income: float, rate: float) -> float:
    return income * rate

def is_adult(age: int) -> bool:
    return age >= 18

def repeat_char(char: str, count: int) -> str:
    return char * count

print(calculate_tax(50000.0, 0.20))
print(is_adult(17))
print(repeat_char("-", 10))
```

```text
10000.0
False
----------
```

The four basic annotatable types: `int`, `float`, `str`, `bool`. These are the same types from Level 6 — the annotations just make them visible at the function boundary.

## None Return Type

A function that returns nothing is annotated with `-> None`:

```python
def print_header(title: str) -> None:
    border = "=" * len(title)
    print(border)
    print(title)
    print(border)

print_header("Sales Report")
```

```text
============
Sales Report
============
```

`-> None` is the annotation equivalent of a function that returns `None` implicitly (Level 18). Omitting the return annotation entirely is valid but ambiguous — annotating `-> None` makes the intent explicit.

## Collection Types

For lists, tuples, and dictionaries, use `list`, `tuple`, and `dict` directly in Python 3.9+:

```python
def average(scores: list) -> float:
    return sum(scores) / len(scores)

def swap(pair: tuple) -> tuple:
    first, second = pair
    return second, first

def get_grade(gradebook: dict, student: str) -> str:
    return gradebook.get(student, "not enrolled")

print(average([88, 92, 75, 95]))
print(swap(("Alice", "Bob")))
print(get_grade({"Alice": "A", "Bob": "B"}, "Alice"))
```

```text
87.5
('Bob', 'Alice')
A
```

For more specific annotations (`list[int]`, `dict[str, float]`), Python 3.9+ supports them directly. For older Python, `from typing import List, Dict` provides the same syntax as `List[int]`, `Dict[str, float]`.

## Optional — When None Is a Valid Value

`Optional[T]` means the value is either type `T` or `None`. Import it from `typing`:

```python
from typing import Optional

def find_first_negative(numbers: list) -> Optional[int]:
    for number in numbers:
        if number < 0:
            return number
    return None

print(find_first_negative([1, -3, 5, -7]))
print(find_first_negative([1, 2, 3]))
```

```text
-3
None
```

`Optional[int]` is the annotation for "returns an int, or None if no match is found." Without the annotation, the caller cannot tell from the signature alone whether `None` is a possible return value.

**SE lens:** `Optional` is a documentation contract. It tells callers: "check for `None` before using this value." In production code, forgetting to handle `None` is the source of countless `AttributeError` and `TypeError` crashes. Annotating with `Optional` forces the issue into the open.

## Challenge: clamp

Write a function `clamp(value: int, minimum: int, maximum: int) -> int` that returns `value` constrained to the range `[minimum, maximum]`.

- If `value` is less than `minimum`, return `minimum`.
- If `value` is greater than `maximum`, return `maximum`.
- Otherwise, return `value`.

Include the type annotations in the function signature.

```challenge
def clamp(value: int, minimum: int, maximum: int) -> int:
    pass
```

```test
assert clamp(5, 0, 10) == 5
assert clamp(-3, 0, 10) == 0
assert clamp(15, 0, 10) == 10
assert clamp(0, 0, 10) == 0
assert clamp(10, 0, 10) == 10
assert clamp(7, 7, 7) == 7
```
