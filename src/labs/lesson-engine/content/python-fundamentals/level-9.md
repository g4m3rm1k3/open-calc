---
series: python-fundamentals
level: 9
title: String Methods
lang: python
---

# String Methods

A string is not just a sequence of characters — it is an object, and objects have **methods**: functions built into the object that you call with dot notation. `"hello".upper()` calls the `upper` method on the string `"hello"` and returns `"HELLO"`.

Because strings are immutable (Level 8), every string method returns a **new string**. The original is never modified.

## Case Methods

```python
message = "Hello, World!"

print(message.upper())
print(message.lower())
print(message.title())
print(message.swapcase())
```

```text
HELLO, WORLD!
hello, world!
Hello, World!
hELLO, wORLD!
```

- `.upper()` — all uppercase
- `.lower()` — all lowercase
- `.title()` — first letter of each word capitalised
- `.swapcase()` — uppercase becomes lower, lowercase becomes upper

These are useful for case-insensitive comparisons: `user_input.lower() == "yes"` matches `"YES"`, `"Yes"`, and `"yes"`.

## strip(), lstrip(), rstrip() — Removing Whitespace

User input almost always has unwanted whitespace. These methods remove it:

```python
raw_input = "   hello   "

print(repr(raw_input.strip()))
print(repr(raw_input.lstrip()))
print(repr(raw_input.rstrip()))
```

```text
'hello'
'hello   '
'   hello'
```

`repr(string)` — returns the string with quotes and escape sequences visible, making whitespace obvious. `.strip()` removes from both ends. `.lstrip()` removes from the left only. `.rstrip()` removes from the right only.

**SE lens:** Always strip user input before processing it. Whitespace bugs are among the most common and hardest to spot because they are invisible. `"yes" == " yes"` is `False`, but you would never see the difference by eye.

## replace() — Substituting Substrings

`.replace(old, new)` — returns a new string with every occurrence of `old` replaced by `new`.

```python
sentence = "the cat sat on the mat"

print(sentence.replace("cat", "dog"))
print(sentence.replace("the", "a"))
print(sentence.replace(" ", "_"))
```

```text
the dog sat on the mat
a cat sat on a mat
the_cat_sat_on_the_mat
```

`.replace()` is case-sensitive. `.replace("cat", "dog")` does not affect `"Cat"` or `"CAT"`.

## split() and join() — Between Strings and Lists

`.split(separator)` — splits a string into a list of substrings at every occurrence of `separator`.

```python
csv_line = "Ada,Lovelace,1815,mathematician"
parts = csv_line.split(",")
print(parts)
print(parts[0])
print(parts[2])
```

```text
['Ada', 'Lovelace', '1815', 'mathematician']
Ada
1815
```

You get a **list** — covered fully in Level 21. For now: a list is an ordered collection in square brackets, and you can index it the same way you index a string.

`separator.join(list_of_strings)` — the inverse of split. Joins a list of strings with the separator between each one.

```python
words = ["the", "quick", "brown", "fox"]
sentence = " ".join(words)
path_parts = ["Users", "ada", "documents"]
file_path = "/".join(path_parts)

print(sentence)
print(file_path)
```

```text
the quick brown fox
Users/ada/documents
```

**CS lens:** `split` and `join` are inverses: `sep.join(text.split(sep)) == text`. This pair is the foundation of text processing pipelines — parse CSV, process fields, rebuild output.

## startswith() and endswith()

`.startswith(prefix)` — returns `True` if the string begins with `prefix`.
`.endswith(suffix)` — returns `True` if the string ends with `suffix`.

```python
filename = "report_2026.pdf"

print(filename.endswith(".pdf"))
print(filename.endswith(".csv"))
print(filename.startswith("report"))
print(filename.startswith("summary"))
```

```text
True
False
True
False
```

Useful for filtering filenames, URLs, and any string with meaningful prefixes or suffixes.

## find() and count()

`.find(substring)` — returns the index of the first occurrence of `substring`, or `-1` if not found.
`.count(substring)` — returns the number of non-overlapping occurrences.

```python
text = "banana"

print(text.find("an"))
print(text.find("xy"))
print(text.count("a"))
print(text.count("an"))
```

```text
1
-1
3
2
```

## Challenge: clean_name

Write a function `clean_name(raw_input)` that takes a messily formatted name and returns it cleaned up: whitespace stripped, title case applied.

`"  ada lovelace  "` → `"Ada Lovelace"`
`"GRACE HOPPER"` → `"Grace Hopper"`

Use `.strip()` then `.title()`. Method calls can be chained: `raw_input.strip().title()` strips first, then applies title case to the result.

```challenge
def clean_name(raw_input):
    pass
```

```test
assert clean_name("  ada lovelace  ") == "Ada Lovelace"
assert clean_name("GRACE HOPPER") == "Grace Hopper"
assert clean_name("alan turing") == "Alan Turing"
assert clean_name("   LINUS TORVALDS   ") == "Linus Torvalds"
assert clean_name("guido van rossum") == "Guido Van Rossum"
```
