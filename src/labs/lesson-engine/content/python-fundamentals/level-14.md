---
series: python-fundamentals
level: 14
title: if / elif / else
lang: python
---

# if / elif / else

Comparison operators (Level 13) produce booleans. `if` uses those booleans to decide which code to execute. This is **conditional execution** — the program takes different paths depending on the data.

Every interesting program makes decisions. `if` is how Python makes them.

## if — Execute When True

```python
temperature = 35

if temperature > 30:
    print("It is hot outside.")

print("Program continues.")
```

```text
It is hot outside.
Program continues.
```

The `if` statement has three parts:
- `if` — keyword
- `temperature > 30` — the **condition**: any expression that evaluates to a boolean
- `:` — colon that ends the condition
- Indented body — one or more lines that execute only when the condition is `True`

If `temperature` were `20`, the condition would be `False` and `"It is hot outside."` would not print. The `"Program continues."` line always runs — it is not inside the `if` block.

**Python uses indentation to define blocks.** The body of an `if` must be indented consistently (4 spaces is the standard). This is not style — it is syntax. A `SyntaxError` results from inconsistent indentation.

**Enable Debug and step through this** with `temperature = 35`, then change it to `20` and run again. Watch the debugger skip the indented block when the condition is False.

## else — Execute When False

`else` provides code to run when the `if` condition is `False`:

```python
score = 55
passing_threshold = 60

if score >= passing_threshold:
    result = "Pass"
else:
    result = "Fail"

print(f"Result: {result}")
```

```text
Result: Fail
```

`if` and `else` are complementary — exactly one of the two blocks always executes.

## elif — Multiple Conditions

`elif` (short for "else if") checks additional conditions in sequence:

```python
temperature = 22

if temperature < 0:
    description = "freezing"
elif temperature < 10:
    description = "cold"
elif temperature < 20:
    description = "cool"
elif temperature < 30:
    description = "warm"
else:
    description = "hot"

print(f"{temperature}°C is {description}.")
```

```text
22°C is warm.
```

Python checks conditions top to bottom and executes the first block whose condition is `True`. Once a match is found, all remaining `elif` and `else` blocks are skipped. You can have as many `elif` blocks as needed. `else` is optional.

**CS lens:** This pattern — checking conditions in sequence and taking the first matching branch — is called a **decision tree**. The order of conditions matters: `elif temperature < 30` is only reached if all previous conditions were `False`, which implicitly means `temperature >= 20`. This makes the conditions simpler to write.

## Nested if

`if` blocks can contain other `if` blocks:

```python
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Entry permitted.")
    else:
        print("No ticket.")
else:
    print("Must be 18 or older.")
```

```text
Entry permitted.
```

Nesting works but can get hard to read. When you have more than two levels of nesting, consider restructuring — often the nested conditions can be combined with `and`.

## Challenge: classify_bmi

Now that you have `if`, return to the BMI classification from Level 13.

Write a function `classify_bmi(bmi_value)` that returns:
- `"Underweight"` if BMI is below 18.5
- `"Normal"` if BMI is 18.5 to below 25.0
- `"Overweight"` if BMI is 25.0 to below 30.0
- `"Obese"` if BMI is 30.0 or above

Use `if` / `elif` / `else`. The conditions must be checked in order from lowest to highest — once you know the BMI is not below 18.5, you do not need to check `>= 18.5` again in the next branch.

```challenge
def classify_bmi(bmi_value):
    pass
```

```test
assert classify_bmi(17.0) == "Underweight"
assert classify_bmi(22.0) == "Normal"
assert classify_bmi(27.5) == "Overweight"
assert classify_bmi(35.0) == "Obese"
assert classify_bmi(18.5) == "Normal"
assert classify_bmi(25.0) == "Overweight"
```
