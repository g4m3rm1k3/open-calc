---
series: python-fundamentals
level: 8
title: Strings
lang: python
---

# Strings

A string is a sequence of characters. That definition sounds simple, but it hides a lot: what is a character, what is a sequence, what can you do with one? This lesson answers all three — including why strings are **immutable** (cannot be changed after creation) and why that matters.

## Creating Strings

Python has three ways to create a string literal:

```python
single_quoted = 'Hello, world'
double_quoted = "Hello, world"
triple_quoted = """This string
spans multiple
lines."""

print(single_quoted)
print(double_quoted)
print(triple_quoted)
```

Single and double quotes are identical — use whichever avoids escaping. `"It's fine"` is cleaner than `'It\'s fine'`. Triple quotes span multiple lines and preserve the line breaks.

## Escape Sequences

Some characters cannot be typed directly inside a string. **Escape sequences** represent them using a backslash prefix:

```text
\n    newline — moves to the next line
\t    tab — horizontal whitespace
\\    literal backslash
\'    literal single quote inside single-quoted string
\"    literal double quote inside double-quoted string
```

```python
print("Line one\nLine two\nLine three")
print("Column A\tColumn B\tColumn C")
print("The path is C:\\Users\\Ada")
```

```text
Line one
Line two
Line three
Column A	Column B	Column C
The path is C:\Users\Ada
```

## len() — String Length

`len(string)` — returns the number of characters in the string. `len("hello")` → `5`. `len("")` → `0`.

```python
word = "Python"
sentence = "Hello, world!"
empty = ""

print(len(word))
print(len(sentence))
print(len(empty))
```

```text
6
13
0
```

`len()` counts every character including spaces, punctuation, and escape sequences (each `\n` counts as one character).

## Indexing — Accessing One Character

A string is a **sequence** — characters in a fixed order, each at a numbered position called an **index**. Indices start at `0`.

```text
String:   P  y  t  h  o  n
Index:    0  1  2  3  4  5
Negative:-6 -5 -4 -3 -2 -1
```

`string[index]` — returns the character at that position. Negative indices count from the end.

```python
language = "Python"

first_char = language[0]
third_char = language[2]
last_char = language[-1]
second_last = language[-2]

print(first_char)
print(third_char)
print(last_char)
print(second_last)
```

```text
P
t
n
o
```

Accessing an index that does not exist raises an `IndexError: string index out of range`.

**CS lens:** Zero-based indexing comes from the mathematical definition of arrays — the index represents an offset from the start. The first element is 0 offsets from the start, the second is 1 offset, and so on. This is consistent across Python lists, tuples, and strings.

## Slicing — Accessing a Range

`string[start:stop]` — returns a new string containing characters from index `start` up to (but not including) `stop`.

```python
message = "Hello, Python!"

greeting = message[0:5]
language = message[7:13]
last_three = message[-3:]
all_but_last = message[:-1]

print(greeting)
print(language)
print(last_three)
print(all_but_last)
```

```text
Hello
Python
on!
Hello, Python
```

- `[0:5]` — characters at indices 0, 1, 2, 3, 4 (not 5)
- `[7:13]` — indices 7 through 12
- `[-3:]` — last 3 characters (start omitted → from beginning; stop omitted → to end)
- `[:-1]` — everything except the last character

**Enable Debug and step through this.** Watch each slice variable get assigned and check that the indices match your expectation.

## Strings Are Immutable

You cannot change a character inside a string. This is **immutability** — once a string object is created, its characters are fixed forever.

```python
word = "hello"
word[0] = "H"
```

This raises `TypeError: 'str' object does not support item assignment`.

To "change" a string, you create a new one:

```python
word = "hello"
capitalized = "H" + word[1:]
print(capitalized)
```

```text
Hello
```

`word[1:]` — all characters from index 1 to the end, which is `"ello"`. Prepend `"H"` to get `"Hello"`.

**CS lens:** Immutability makes strings safe to share between parts of a program — you never have to worry that passing a string to a function will change the original. It also makes strings **hashable**, which is why they can be used as dictionary keys (Level 23).

## in — Membership Testing

`substring in string` — returns `True` if `substring` appears anywhere inside `string`.

```python
sentence = "the quick brown fox"

print("quick" in sentence)
print("cat" in sentence)
print("the" in sentence)
print("THE" in sentence)
```

```text
True
False
True
False
```

Case sensitive: `"THE"` is not in the sentence even though `"the"` is.

## Challenge: initials

Write a function `initials(first_name, last_name)` that returns the initials in the format `"G.H."` — the first character of each name, followed by a period, with no space between.

`string[0]` — returns the first character of the string.

```challenge
def initials(first_name, last_name):
    pass
```

```test
assert initials("Grace", "Hopper") == "G.H."
assert initials("Ada", "Lovelace") == "A.L."
assert initials("Alan", "Turing") == "A.T."
assert initials("Linus", "Torvalds") == "L.T."
assert initials("Guido", "van Rossum") == "G.v."
```
