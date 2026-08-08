# Lite Intro B — Math Basics Beneath Lesson 1

**Purpose:** Lesson 1 starts at vectors and matrices, assuming comfort with basic algebra and the idea of a "function" underneath that. This is the layer beneath that layer — order of operations, exponents, what a function actually is, and reading a simple graph. If any of this is shaky, it's worth 20 minutes here before Lesson 1, since everything downstream builds on it being automatic.

---

## 1. Order of Operations

When an expression has multiple operations, they don't run left-to-right blindly — there's a fixed priority order, commonly remembered as **PEMDAS**: Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right).

```
2 + 3 * 4       = 2 + 12 = 14        (multiplication before addition)
(2 + 3) * 4     = 5 * 4 = 20         (parentheses override the default order)
2 ** 3 + 1      = 8 + 1 = 9          (exponent before addition)
10 - 4 / 2      = 10 - 2 = 8         (division before subtraction)
```

**Why this matters here specifically:** an expression like `reward + DISCOUNT_FACTOR * np.max(next_q_values[i])` (seen constantly from Lesson 9 onward) relies on multiplication happening *before* addition — the discount factor only multiplies the max-Q term, not the whole sum. Misreading order of operations is a real, easy way to misunderstand a formula that's actually correct as written.

**Practice:** compute `3 + 2 * (4 - 1) ** 2` by hand, step by step.

<details><summary>Answer</summary>

`(4-1) = 3` → `3**2 = 9` → `2*9 = 18` → `3+18 = 21`
</details>

---

## 2. Exponents and Roots

An exponent means repeated multiplication: `x^n` (written `x ** n` in Python) means "multiply `x` by itself `n` times."

```
2^3 = 2 * 2 * 2 = 8
5^2 = 5 * 5 = 25
x^1 = x        (anything to the power of 1 is itself)
x^0 = 1        (anything to the power of 0 is 1, by definition)
```

A **square root** (`√x`) is the reverse question: "what number, multiplied by itself, gives `x`?" `√25 = 5`, because `5 * 5 = 25`.

**Fractional exponents** are a specific, useful equivalence worth knowing: `x^0.5` is exactly the same thing as `√x`. This shows up directly in Lesson 13's priority formula, `(|td_error| + epsilon) ** alpha` — when `alpha = 0.5`, that's literally taking a square root of the TD error, scaling how strongly priority responds to error size.

**Practice:** what is `4 ** 0.5`? What is `2 ** 4`?

<details><summary>Answer</summary>

`4 ** 0.5 = 2` (the square root of 4). `2 ** 4 = 16` (2×2×2×2).
</details>

---

## 3. Negative Numbers and Absolute Value

**Absolute value** (`|x|`) strips the sign off a number — it's "how far is this number from zero," always non-negative:

```
|5| = 5
|-5| = 5
|-3.2| = 3.2
```

In Python, `abs(x)` computes this. This shows up constantly in the RL lessons — Lesson 13's `abs(td_error)` specifically doesn't care whether the network *overestimated* or *underestimated*; being wrong in either direction is treated as equally informative for prioritization purposes.

**Practice:** what is `abs(-7.5) - abs(3)`?

<details><summary>Answer</summary>

`7.5 - 3 = 4.5`
</details>

---

## 4. What a Function Actually Is

A **function**, in the math sense (not the Python `def` sense, though they're related), is a rule that takes an input and produces exactly one output. `f(x) = x + 3` means "whatever you give this function, add 3 and hand it back."

```
f(x) = x + 3
f(2) = 5
f(10) = 13
f(-1) = 2
```

**A function of multiple variables** just takes more than one input:

```
f(x, y) = x * y + 2
f(3, 4) = 3*4 + 2 = 14
```

This is exactly what `V(s)` and `Q(s, a)` mean throughout the RL lessons — `V` is a function that takes a state and returns one number (its value); `Q` is a function that takes a state *and* an action and returns one number. The math notation `V(s)` and the Python code `value_network.predict(state)` are the same underlying idea — a rule mapping inputs to an output — just one written in mathematical notation and the other executed by a trained neural network standing in for that rule.

**Practice:** given `g(x, y) = 2x - y`, compute `g(5, 3)`.

<details><summary>Answer</summary>

`2*5 - 3 = 10 - 3 = 7`
</details>

---

## 5. Reading a Simple Graph — the Coordinate Plane

A graph plots points using two numbers: how far right/left (the `x`-coordinate) and how far up/down (the `y`-coordinate), written `(x, y)`.

```
(0, 0)   = the origin, the center point
(3, 2)   = 3 units right, 2 units up
(-2, 4)  = 2 units left, 4 units up
(1, -5)  = 1 unit right, 5 units down
```

**Slope** describes how steep a line is — "how much does `y` change for a given change in `x`":

```
slope = (change in y) / (change in x)
```

A slope of `2` means "for every 1 unit right, go up 2 units" — steep and rising. A slope of `-1` means "for every 1 unit right, go down 1 unit" — falling. A slope of `0` means flat, no change.

**Why this matters here:** every reward curve, loss curve, and training plot throughout the series is exactly this — episode number (or epoch) on the x-axis, some measured value on the y-axis. "The rolling average trends upward" is just "this curve has a generally positive slope." A derivative (Lesson 10) is the formalized version of this same slope idea, applied to a smooth curve at one exact point instead of a straight line between two points.

**Practice:** if a line passes through `(0, 1)` and `(2, 5)`, what's its slope?

<details><summary>Answer</summary>

`slope = (5 - 1) / (2 - 0) = 4 / 2 = 2`
</details>

---

## 6. Percentages and Ratios

A **percentage** is just a fraction out of 100. `85%` means `85/100`, or `0.85` as a decimal.

```
0.85 as a percentage:  0.85 * 100 = 85%
30% as a decimal:      30 / 100 = 0.30
```

A **ratio** compares two quantities. "3 to 1" (`3:1`) means for every 3 of one thing, there's 1 of the other.

**Why this matters here:** epsilon in epsilon-greedy (Lesson 7) is literally a percentage/probability — `epsilon = 0.3` means "30% chance of a random action." Lesson 20's classifier output (a sigmoid value between 0 and 1) is read the exact same way — `0.85` means "the model estimates an 85% chance this is a failure-trending reading." Getting comfortable converting between "0.85," "85%," and "85 out of 100" fluently makes reading model outputs throughout the series faster and more intuitive.

**Practice:** a model outputs `0.127` for a binary classification. What percentage is that, and would you call it a confident or unconfident prediction of "positive"?

<details><summary>Answer</summary>

`12.7%` — a fairly unconfident prediction of "positive" (much closer to predicting "negative," since it's well under 50%).
</details>

---

## Self-check before Lesson 1

If these all feel automatic — order of operations, exponents, absolute value, "a function maps inputs to outputs," reading a slope, converting between decimals/percentages — Lesson 1's leap into vectors and matrices will feel like a natural next step rather than a jump. If any single one above felt shaky, it's worth a few extra practice problems on just that topic (a quick web search for "[topic] practice problems" will turn up plenty) before starting the main series.
