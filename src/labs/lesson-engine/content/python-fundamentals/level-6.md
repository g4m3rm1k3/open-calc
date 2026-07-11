---
series: python-fundamentals
level: 6
title: Types
lang: python
---

# Types

Every value in Python has a type. The type determines what operations are valid — you can multiply two integers, but you cannot multiply two strings. Understanding types is understanding Python's rules for what is allowed and why.

Python is **dynamically typed**: types are attached to values, not to variable names. The same variable can hold an integer on line 3 and a string on line 7. This flexibility is useful but requires you to track types in your head.

## The Four Primitive Types

Python has four primitive types you will use in nearly every program:

```python
whole_number = 42
decimal_number = 3.14159
text_value = "Hello, Python"
boolean_value = True

print(type(whole_number))
print(type(decimal_number))
print(type(text_value))
print(type(boolean_value))
```

```text
<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
```

`type(value)` — returns the type of the value as a type object. The output `<class 'int'>` means the value belongs to the class `int`. You will learn about classes much later — for now, "class" and "type" mean the same thing.

**CS lens:** Python's type system is built on **objects**. Every value — including integers and booleans — is an object: a bundle of data and the operations allowed on it. An `int` object knows how to add itself to another `int`. A `str` object knows how to find a substring. The type defines what the object can do.

## Type Names as Strings

`type(value).__name__` extracts just the type name as a plain string, without the `<class '...'>` wrapper:

```python
score = 95
ratio = 0.87
label = "accuracy"
active = False

print(type(score).__name__)
print(type(ratio).__name__)
print(type(label).__name__)
print(type(active).__name__)
```

```text
int
float
str
bool
```

`.__name__` — accesses the `name` attribute of the type object. An **attribute** is a value stored inside an object, accessed with a dot. `type(score)` returns the `int` type object. `int.__name__` is the string `"int"`.

## isinstance() — Checking Types Safely

`type(value) == int` works but is fragile. The standard way to check a type is `isinstance()`:

`isinstance(value, type)` — returns `True` if `value` is an instance of `type` (or any subtype). `isinstance(42, int)` → `True`. `isinstance("hi", int)` → `False`.

```python
measurement = 98.6
count = 10
name = "Ada"
flag = True

print(isinstance(measurement, float))
print(isinstance(count, int))
print(isinstance(name, str))
print(isinstance(flag, bool))
print(isinstance(flag, int))
```

```text
True
True
True
True
True
```

The last line is `True` — `bool` is a subtype of `int` in Python. `True` is literally `1` and `False` is literally `0`. This is a quirk: `True + True` is `2`, `False * 100` is `0`. It exists for historical reasons and is rarely useful.

## Type Conversion

Python does not automatically convert between types. When you need a value in a different type, you convert it explicitly using the type name as a function:

```python
age_text = "25"
age_number = int(age_text)
age_float = float(age_text)
back_to_text = str(age_number)

print(age_text, type(age_text).__name__)
print(age_number, type(age_number).__name__)
print(age_float, type(age_float).__name__)
print(back_to_text, type(back_to_text).__name__)
```

```text
25 str
25 int
25.0 float
25 str
```

Conversion functions: `int()`, `float()`, `str()`, `bool()`. Each raises a `ValueError` if the input cannot be converted — `int("hello")` raises `ValueError: invalid literal for int() with base 10: 'hello'`.

**Enable Debug and step through this.** Watch the type of each variable in the variables panel as it is assigned.

## What bool() Considers True and False

Every Python value has a boolean interpretation. `bool(value)` returns `True` or `False` based on whether the value is considered "truthy" or "falsy":

```python
print(bool(0))
print(bool(1))
print(bool(-99))
print(bool(""))
print(bool("hello"))
print(bool(0.0))
```

```text
False
True
True
False
True
False
```

**Falsy values in Python:** `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict), `None`. Everything else is truthy. This matters when you learn `if` in Level 14.

## Challenge: describe_value

Write a function `describe_value(value)` that returns a string describing the value's type and content, in the format `"int: 42"` or `"str: hello"`.

`type(value).__name__` — returns the type name as a string, e.g. `"int"`, `"float"`, `"str"`, `"bool"`.

`str(value)` — converts any value to its string representation.

The returned string is always `type_name + ": " + str(value)`.

```challenge
def describe_value(value):
    pass
```

```test
assert describe_value(42) == "int: 42"
assert describe_value("hello") == "str: hello"
assert describe_value(3.14) == "float: 3.14"
assert describe_value(True) == "bool: True"
assert describe_value(0) == "int: 0"
```
