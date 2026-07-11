# Variables and Types

A variable is a named container for a value. When you write `x = 5`, you are telling Python to create
a box called `x` and put the number `5` inside it.

---

## What Is a Variable?

A variable has three things: a **name**, a **value**, and a **type**.

| Thing | Example |
|-------|---------|
| Name | `x` |
| Value | `5` |
| Type | integer |

When you use `x` later in your program, Python replaces it with whatever value the box holds.

---

:::concept{title="Run Your First Variable"}
Try running this. Then change the value of `name` and run again.

```python
name = "Ada Lovelace"
year = 1843
message = "First programmer: " + name + " (" + str(year) + ")"
print(message)
```
:::

---

## Types Python Knows About

Python has four primitive types you will use constantly:

- **int** — whole numbers: `0`, `-7`, `1000000`
- **float** — decimal numbers: `3.14`, `-0.5`
- **str** — text: `"hello"`, `'world'`
- **bool** — true or false: `True`, `False`

Python figures out the type from the value you assign. You don't declare it.

---

:::prediction{prompt="What will this print? Write your prediction before running."}
```python
x = 10
y = 3
print(x + y)
print(x - y)
print(x * y)
print(x / y)
print(x // y)
print(x % y)
```
:::reveal
The `/` operator gives a float even when both operands are ints. `//` is integer (floor) division.
`%` is the remainder. These are the six arithmetic operators you will use constantly.
:::

---

## Type Conversion

You can convert between types with built-in functions:

- `int("42")` → `42`
- `float("3.14")` → `3.14`
- `str(100)` → `"100"`
- `bool(0)` → `False`

:::concept{title="Type Conversion Lab"}
```python
# Convert and combine
age_str = "25"
age_int = int(age_str)
print("Next year:", age_int + 1)
print("Type:", type(age_int))
```
:::

---

:::quiz{question="Which of these will cause a TypeError in Python?"}
- [ ] `print(str(42) + " items")`
- [x] `print("Total: " + 42)`
- [ ] `print(42 + 8)`
- [ ] `print(float(42))`

:::explanation
Python won't implicitly convert `42` to a string for you. You must write `"Total: " + str(42)`.
This is called **strict typing** — Python only coerces types when the operation is unambiguous.
:::
:::

---

## Project: Temperature Converter

Now apply what you learned. Here is a temperature converter you can add to your project.

:::project{title="Temperature Converter"}
Add this to your project and run it to verify it works before moving on.

```python
def celsius_to_fahrenheit(c):
    return (c * 9/5) + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5/9

temp_c = 100
temp_f = celsius_to_fahrenheit(temp_c)
print(f"{temp_c}°C = {temp_f}°F")
print(f"{temp_f}°F = {fahrenheit_to_celsius(temp_f)}°C")
```
:::

---

:::checkpoint
- I can create a variable and assign a value to it
- I understand the difference between `int`, `float`, `str`, and `bool`
- I can use type conversion functions (`int()`, `str()`, `float()`)
- I ran the temperature converter and it produced correct output
:::
