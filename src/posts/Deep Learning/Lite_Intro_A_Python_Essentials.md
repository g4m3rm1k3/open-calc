# Lite Intro A — Python Idioms This Series Assumes

**Purpose:** a short, standalone primer on the specific "intermediate Python" patterns used constantly throughout the 23-lesson series without ever being taught from scratch — comprehensions, unpacking, the `key=` idiom, f-strings, and the object-method calling pattern. If any of these ever felt like "I can pattern-match it but couldn't write it cold," this is the lesson that fixes that. Nothing here is RL/ML-specific — it's pure Python, and it's worth being genuinely solid on before (or alongside) Lesson 1.

---

## 1. List and Dict Comprehensions

**The old way (a loop building a list):**
```python
squares = []
for number in range(5):
    squares.append(number ** 2)
print(squares)   # [0, 1, 4, 9, 16]
```

**The comprehension way — the same thing, one line:**
```python
squares = [number ** 2 for number in range(5)]
print(squares)   # [0, 1, 4, 9, 16]
```

Read it left to right as: "give me `number ** 2`, for every `number` in `range(5)`." The pattern is always `[expression for item in iterable]`.

**Dict comprehensions work the same way, just building a dictionary instead:**
```python
squares_dict = {number: number ** 2 for number in range(5)}
print(squares_dict)   # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

You saw this exact pattern in Lesson 7: `{action: 0.0 for action in ACTIONS}` — "give me a dictionary entry for every action, starting at 0.0."

**With a condition — filtering while building:**
```python
even_squares = [number ** 2 for number in range(10) if number % 2 == 0]
print(even_squares)   # [0, 4, 16, 36, 64]
```

**Practice:** write a comprehension that builds a list of the cubes (`x**3`) of every number from 1 to 10 that's greater than 5.

<details><summary>Answer</summary>

```python
[x ** 3 for x in range(1, 11) if x > 5]
```
</details>

---

## 2. Unpacking Multiple Return Values

A Python function can return more than one value at once, and you can "unpack" them straight into separate variables in one line:

```python
def get_min_and_max(numbers):
    return min(numbers), max(numbers)

smallest, largest = get_min_and_max([3, 7, 1, 9, 4])
print(smallest, largest)   # 1 9
```

Under the hood, `return min(numbers), max(numbers)` actually returns a single **tuple** `(1, 9)`, and `smallest, largest = ...` unpacks that tuple into two variables in one line — Python matches them up by position.

This is exactly why Gym's `environment.step(action)` call looks like this:

```python
next_state, reward, terminated, truncated, info = environment.step(action)
```

`step()` returns one tuple with 5 values; this line unpacks all 5 into named variables at once instead of you manually indexing `result[0]`, `result[1]`, etc.

**Practice:** write a function that returns both the sum and the average of a list of numbers, then call it and unpack both results into named variables.

<details><summary>Answer</summary>

```python
def sum_and_average(numbers):
    return sum(numbers), sum(numbers) / len(numbers)

total, average = sum_and_average([2, 4, 6, 8])
print(total, average)   # 20 5.0
```
</details>

---

## 3. The `key=` Argument — Customizing How Python Compares Things

`max()`, `min()`, and `sorted()` normally compare items directly. `key=` lets you tell them "don't compare the items themselves — compare *this specific thing about* each item instead."

```python
words = ["hi", "hello", "hey", "greetings"]

longest_word = max(words, key=len)
print(longest_word)   # "greetings" - compared by LENGTH, not alphabetically
```

`key=len` means: "for each word, compute `len(word)`, and find whichever word has the biggest result." Without `key=`, `max(words)` would just do alphabetical comparison instead.

**The specific pattern from Lesson 7**, which is worth staring at until it clicks:

```python
action_values = {"up": 2.1, "down": 5.7, "left": 0.3, "right": 5.7}
best_action = max(action_values, key=action_values.get)
```

`max(action_values, ...)` — looping over a dictionary by default gives you its *keys* (`"up"`, `"down"`, etc.), not its values. `key=action_values.get` says: "for each key, look up its value using `.get()`, and find whichever key has the biggest looked-up value." This is `argmax` over a dictionary, written using `max` + `key=` instead of NumPy.

**Practice:** given `prices = {"apple": 1.50, "banana": 0.75, "mango": 3.20}`, find the cheapest fruit using `min` and `key=`.

<details><summary>Answer</summary>

```python
cheapest = min(prices, key=prices.get)
print(cheapest)   # "banana"
```
</details>

---

## 4. f-Strings and Format Specifiers

An f-string lets you embed Python expressions directly inside a string, prefixed with `f`:

```python
name = "Alex"
score = 87.5
print(f"{name} scored {score} points")   # Alex scored 87.5 points
```

Anything inside `{}` gets evaluated as real Python — not just variable names:

```python
print(f"Doubled: {score * 2}")   # Doubled: 175.0
```

**Format specifiers** — the `:` inside the braces controls *how* a value gets displayed:

```python
pi = 3.14159265
print(f"{pi:.2f}")    # 3.14   - .2f means "float, 2 decimal places"
print(f"{42:5d}")     # "   42" - 5d means "integer, padded to width 5"
print(f"{0.856:.1%}") # 85.6%  - .1% means "percentage, 1 decimal place"
```

The pattern from Lesson 6: `f"{values[row, col]:6.2f}"` means "format this number as a float with 2 decimal places, padded to at least 6 characters wide" — used to make columns of numbers line up neatly when printed.

**Practice:** print a variable `temperature = 98.6234` formatted to exactly 1 decimal place.

<details><summary>Answer</summary>

```python
temperature = 98.6234
print(f"{temperature:.1f}")   # 98.6
```
</details>

---

## 5. Objects and the `object.method(...)` Pattern

You've been calling things like `environment.step(action)` and `model.fit(...)` throughout the series without ever building a class yourself — worth understanding what's actually happening, even without writing your own classes yet.

An **object** bundles data together with functions that operate on that data (those functions are called **methods** when they belong to an object). `environment` is an object; `.step(...)` is a method that belongs to it, and calling it can both use *and* change the object's internal data (in Gym's case, moving the simulation forward).

```python
my_list = [3, 1, 4, 1, 5]
my_list.sort()          # .sort() is a METHOD belonging to the list object
print(my_list)           # [1, 1, 3, 4, 5]

my_list.append(9)        # another method - modifies my_list in place
print(my_list)            # [1, 1, 3, 4, 5, 9]
```

`my_list.sort()` and `my_list.append(9)` are the exact same pattern as `environment.step(action)` or `model.predict(state)` — an object, a dot, a method name, parentheses with any needed arguments inside. Once this pattern is comfortable, every library call in the whole series reads the same way: "some object, doing something it knows how to do."

**Practice:** given `my_string = "hello world"`, use two different string methods (look them up if needed) to (a) make it uppercase, and (b) replace `"world"` with `"there"`.

<details><summary>Answer</summary>

```python
my_string = "hello world"
print(my_string.upper())              # HELLO WORLD
print(my_string.replace("world", "there"))   # hello there
```
</details>

---

## 6. Positional vs. Keyword Arguments

Function calls throughout the series mix two styles of passing arguments:

```python
def describe_pet(name, animal_type, age):
    print(f"{name} is a {age}-year-old {animal_type}")

describe_pet("Rex", "dog", 3)                          # positional - matched by ORDER
describe_pet(name="Rex", animal_type="dog", age=3)      # keyword - matched by NAME
describe_pet("Rex", animal_type="dog", age=3)           # mixed - positional first, then keyword
```

All three calls do the same thing. **Keyword arguments** let you skip worrying about exact order, and they also let a function have optional arguments with sensible defaults:

```python
def build_greeting(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(build_greeting("Sam"))                    # Hello, Sam!
print(build_greeting("Sam", greeting="Hi"))       # Hi, Sam!
```

This is exactly why `layers.Dense(16, activation="relu", input_shape=(4,))` works: `16` is positional (the number of neurons — the layer's first expected argument), while `activation` and `input_shape` are passed by keyword, in whatever order, because the `Dense` layer's definition gives them default values and accepts them by name.

**Practice:** without running it, predict what `build_greeting(greeting="Hey", name="Jordan")` prints.

<details><summary>Answer</summary>

`Hey, Jordan!` — keyword arguments can be passed in any order, since they're matched by name, not position.
</details>

---

## Self-check before moving on

If you can read this line from Lesson 9 and explain every single piece of syntax in it without hesitation, this primer has done its job:

```python
states = np.array([transition[0] for transition in minibatch])
```

(A list comprehension pulling the first element out of every tuple in `minibatch`, wrapped in `np.array(...)` to convert the resulting list into a NumPy array.) If that reads smoothly now, you're set for the rest of the series's code without the Python syntax itself ever being the bottleneck.
