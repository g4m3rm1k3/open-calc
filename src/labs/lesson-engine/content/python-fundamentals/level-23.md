---
series: python-fundamentals
level: 23
title: Dictionaries
lang: python
---

# Dictionaries

A dictionary maps **keys** to **values**. Given a key, you can retrieve the associated value in O(1) time — regardless of how many entries the dictionary has. This makes dictionaries the right data structure any time you need to look something up by name, by ID, or by any other identifier.

A list retrieves values by position (integer index). A dictionary retrieves values by key (any hashable value — usually a string or integer).

## Creating Dictionaries

```python
person = {
    "name": "Ada Lovelace",
    "birth_year": 1815,
    "occupation": "mathematician",
}

print(person["name"])
print(person["birth_year"])
print(len(person))
```

```text
Ada Lovelace
1815
3
```

`{}` with `key: value` pairs. Keys are usually strings. Values can be any type. `person["name"]` retrieves the value for the key `"name"`.

Accessing a key that does not exist raises `KeyError: 'missing_key'`.

**CS lens:** Python dictionaries are implemented as **hash tables**. When you write `person["name"]`, Python hashes the string `"name"` to a number, uses that number to find the bucket in memory where the value is stored, and returns it. This is O(1) — constant time regardless of dictionary size. A list search (`"name" in list`) is O(n) — it checks every element. Hash tables trade memory for lookup speed.

## Adding, Updating, and Deleting

```python
config = {"debug": False, "port": 8080}

config["host"] = "localhost"
config["port"] = 9090
del config["debug"]

print(config)
```

```text
{'port': 9090, 'host': 'localhost'}
```

`config["host"] = "localhost"` — adds a new key. `config["port"] = 9090` — updates an existing key. `del config["debug"]` — removes the key.

## get() — Safe Lookup

`dict.get(key)` — returns the value for `key`, or `None` if the key does not exist (no `KeyError`).
`dict.get(key, default)` — returns `default` instead of `None` when the key is missing.

```python
user_settings = {"theme": "dark", "font_size": 14}

theme = user_settings.get("theme")
language = user_settings.get("language", "English")
missing = user_settings.get("missing_key")

print(theme)
print(language)
print(missing)
```

```text
dark
English
None
```

Use `.get()` when a missing key is normal and expected. Use `dict[key]` when a missing key is a bug — the `KeyError` will tell you immediately.

## keys(), values(), items()

```python
scores = {"Alice": 92, "Bob": 87, "Charlie": 95}

print(list(scores.keys()))
print(list(scores.values()))

for name, score in scores.items():
    print(f"{name}: {score}")
```

```text
['Alice', 'Bob', 'Charlie']
[92, 87, 95]
Alice: 92
Bob: 87
Charlie: 95
```

`.keys()` — all keys. `.values()` — all values. `.items()` — `(key, value)` pairs, typically used in `for` loops with tuple unpacking.

## in — Membership Testing on Keys

`key in dict` tests if a key exists:

```python
capitals = {"France": "Paris", "Germany": "Berlin", "Italy": "Rome"}

print("France" in capitals)
print("Spain" in capitals)
```

```text
True
False
```

`key in dict` checks keys, not values. O(1) — uses the hash table.

## Building Dictionaries Dynamically

```python
word_counts = {}
text = "the cat sat on the mat the cat"

for word in text.split():
    if word in word_counts:
        word_counts[word] = word_counts[word] + 1
    else:
        word_counts[word] = 1

print(word_counts)
```

```text
{'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1}
```

This is the **frequency count pattern** — one of the most common uses of dictionaries. Count how many times each unique value appears.

**Enable Debug and step through this.** Watch the dictionary grow as each word is processed.

## Challenge: word_frequency

Write a function `word_frequency(sentence)` that returns a dictionary mapping each unique word to the number of times it appears.

Words are separated by spaces. Case-sensitive: `"The"` and `"the"` are different words.

`.split()` with no argument splits on any whitespace. `sentence.split()` → `["the", "cat", ...]`.

```challenge
def word_frequency(sentence):
    pass
```

```test
assert word_frequency("the cat sat on the mat") == {"the": 2, "cat": 1, "sat": 1, "on": 1, "mat": 1}
assert word_frequency("hello hello hello") == {"hello": 3}
assert word_frequency("one") == {"one": 1}
assert word_frequency("a b a b a") == {"a": 3, "b": 2}
```
