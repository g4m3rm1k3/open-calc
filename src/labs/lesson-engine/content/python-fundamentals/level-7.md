---
series: python-fundamentals
level: 7
title: Numbers & Arithmetic
lang: python
---

# Numbers & Arithmetic

Python has two numeric types you will use constantly: `int` for whole numbers and `float` for decimals. They look similar but behave differently in ways that cause real bugs if you do not understand them.

This lesson covers every arithmetic operator, the rules for when results are ints vs floats, and the quirks of floating-point arithmetic that surprise every programmer the first time they encounter them.

## The Six Arithmetic Operators

```python
dividend = 17
divisor = 5

print(dividend + divisor)
print(dividend - divisor)
print(dividend * divisor)
print(dividend / divisor)
print(dividend // divisor)
print(dividend % divisor)
```

```text
22
12
85
3.4
3
2
```

The first three are familiar. The last three deserve explanation:

- `/` — **true division**. Always returns a float, even when both operands are integers. `17 / 5` is `3.4`. `10 / 2` is `5.0`, not `5`.
- `//` — **floor division**. Divides and rounds down to the nearest integer. `17 // 5` is `3`. `17 // 5` floors `3.4` to `3`. Works on floats too: `17.0 // 5` is `3.0`.
- `%` — **modulo**. Returns the remainder after floor division. `17 % 5` is `2` because `17 = 3 * 5 + 2`.

**CS lens:** The `//` and `%` operators always satisfy: `(dividend // divisor) * divisor + (dividend % divisor) == dividend`. This is the **division algorithm** — any integer divided by a non-zero integer has a unique quotient and remainder. Modulo is used constantly in programming: checking if a number is even (`n % 2 == 0`), wrapping around a circular range, and hashing.

## Exponentiation

`**` — the exponentiation operator. `base ** exponent` raises base to the power of exponent.

```python
print(2 ** 10)
print(9 ** 0.5)
print(2 ** -1)
```

```text
1024
3.0
0.5
```

`9 ** 0.5` is the square root of 9. `2 ** -1` is `1/2`. Python handles negative and fractional exponents correctly.

## Operator Precedence

Python evaluates expressions using standard mathematical precedence:

```text
1. **           (exponentiation, right to left)
2. + -          (unary plus and minus)
3. * / // %     (multiplication and division, left to right)
4. + -          (addition and subtraction, left to right)
```

```python
result_a = 2 + 3 * 4
result_b = (2 + 3) * 4
result_c = 2 ** 3 ** 2
result_d = 10 - 3 - 2

print(result_a)
print(result_b)
print(result_c)
print(result_d)
```

```text
14
20
512
5
```

`2 ** 3 ** 2` evaluates right to left: `3 ** 2 = 9`, then `2 ** 9 = 512`. Exponentiation is right-associative — this is the mathematical convention.

When in doubt, use parentheses. They cost nothing and make intent explicit.

## int vs float: When Types Matter

Whether you get an `int` or `float` depends on which operators and types you use:

```text
int + int   → int        (5 + 3 = 8)
int * int   → int        (5 * 3 = 15)
int / int   → float      (5 / 3 = 1.666...)
int // int  → int        (5 // 3 = 1)
int + float → float      (5 + 3.0 = 8.0)
float + float → float    (5.0 + 3.0 = 8.0)
```

The rule: as soon as a float appears, the result is a float. Except `//` with two ints always returns an int.

```python
print(type(5 + 3))
print(type(5 + 3.0))
print(type(10 / 2))
print(type(10 // 2))
```

```text
<class 'int'>
<class 'float'>
<class 'float'>
<class 'int'>
```

## Floating-Point Precision

Floats are stored in binary (base 2). Most decimal fractions cannot be represented exactly in binary, so they are stored as the closest approximation.

```python
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
```

```text
0.30000000000000004
False
```

`0.1 + 0.2` is not exactly `0.3`. This is not a Python bug — it is a fundamental property of how IEEE 754 floating-point arithmetic works, present in every language that uses it (C, Java, JavaScript, Swift). The decimal `0.1` has no exact binary representation, so the stored value is `0.1000000000000000055511151231257827021181583404541015625`. Adding two such approximations produces a slightly wrong result.

**The fix:** never compare floats with `==`. Use `round()` or check that the difference is below a tolerance.

```python
result = 0.1 + 0.2
expected = 0.3
tolerance = 1e-10

print(round(result, 10) == round(expected, 10))
print(abs(result - expected) < tolerance)
```

```text
True
True
```

**CS lens:** IEEE 754 is the standard for floating-point arithmetic used by virtually every processor and language. 64-bit floats (Python's default) have about 15–17 significant decimal digits of precision. This is sufficient for most calculations but catastrophic for financial software — bank systems use exact decimal arithmetic, not floats.

## Useful Built-ins

```python
print(abs(-42))
print(abs(-3.7))
print(round(3.14159, 2))
print(round(2.5))
print(max(3, 1, 4, 1, 5, 9))
print(min(3, 1, 4, 1, 5, 9))
```

```text
42
3.7
3.14
2
9
1
```

- `abs(value)` — absolute value (distance from zero). Always non-negative.
- `round(value, digits)` — rounds to `digits` decimal places. `round(value)` rounds to the nearest integer.
- `max(*values)` — returns the largest value from any number of arguments.
- `min(*values)` — returns the smallest value.

## Challenge: bmi

Write a function `bmi(weight_kg, height_m)` that calculates Body Mass Index.

The formula: `BMI = weight_kg / (height_m ** 2)`

Return the result rounded to 1 decimal place.

`round(value, digits)` — rounds to `digits` decimal places.

```challenge
def bmi(weight_kg, height_m):
    pass
```

```test
assert bmi(70, 1.75) == 22.9
assert bmi(90, 1.80) == 27.8
assert bmi(50, 1.60) == 19.5
assert bmi(100, 1.70) == 34.6
```
