# Lesson 6: Strings in Depth

**What you will build**
The reader will master Python strings: indexing, slicing, the most important string methods, f-strings, and the immutability rule. The transferable problems: (1) strings are IMMUTABLE sequences — every "modification" creates a new string; understanding this prevents confusion when string methods seem to not work; (2) slicing is a universal Python pattern — the same `[start:stop:step]` syntax works on lists, tuples, and any sequence; (3) f-strings are the modern way to build strings from variables — cleaner and safer than concatenation.

**What you need to know first**
Lessons 0–5 (REPL, types, variables, conditionals, iteration, functions).

**Terms used in this lesson**
- **Sequence** — an ordered collection of items that can be accessed by their numerical position.
- **Index** — an integer representing a specific position within a sequence.
- **IndexError** — an error raised when attempting to access an index that is outside the bounds of a sequence.
- **Slicing** — extracting a sub-sequence using the `[start:stop:step]` bracket notation.
- **Immutability** — a property meaning an object's internal state cannot be modified in-place after it is created.
- **TypeError** — an error raised when an operation is applied to an inappropriate type (e.g., trying to modify an immutable string).
- **Method** — a function tied directly to an object, called using dot notation (e.g., `object.method()`).
- **Substring** — a continuous sequence of characters found within a larger string.
- **f-string** — a formatted string literal prefixed with `f` that evaluates Python expressions inside `{}` at runtime.
- **Accumulator pattern** — a common programming pattern where a variable is initialized before a loop and updated during each iteration to build a final result.
- **Membership** — checking whether a specific element or substring exists inside a collection, typically using the `in` keyword.
- **Concatenation** — joining strings end-to-end to produce a new string.
- **Iteration** — processing a collection one item at a time in a loop.

**Objects and methods used**

**str**
- *What it is:* Python's built-in text sequence type.
- *Implementation:* `class str(object)`
- *Its use:* Represents all textual data in Python.
- *Type:* Class.
- *Responsibility:* Stores ordered, immutable sequences of Unicode characters.
- *Depends on:* Character data provided during instantiation or literal definition.
- *Connects to:* Supports sequence operations, slicing, and string-specific methods.
- *Shape:* Core built-in type at the language level.

**str.strip()**
- *What it is:* A string method to remove whitespace.
- *Implementation:* `def strip(self, chars=None) -> str`
- *Its use:* Cleaning up unwanted leading and trailing whitespace from strings.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a new string with leading and trailing characters (defaults to whitespace) removed.
- *Depends on:* The original string instance.
- *Connects to:* Often used directly on user input before processing.
- *Shape:* A string transformation utility.

**str.lower()**
- *What it is:* A string method for lowercase conversion.
- *Implementation:* `def lower(self) -> str`
- *Its use:* Normalizing text for case-insensitive comparisons.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a new string with all cased characters converted to lowercase.
- *Depends on:* The original string instance.
- *Connects to:* Called on strings representing case-insensitive data.
- *Shape:* A string transformation utility.

**str.upper()**
- *What it is:* A string method for uppercase conversion.
- *Implementation:* `def upper(self) -> str`
- *Its use:* Displaying text prominently or normalizing text.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a new string with all cased characters converted to uppercase.
- *Depends on:* The original string instance.
- *Connects to:* Called on strings to uniformly capitalize them.
- *Shape:* A string transformation utility.

**str.title()**
- *What it is:* A string method for title-casing.
- *Implementation:* `def title(self) -> str`
- *Its use:* Formatting names or titles.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a new string where words start with an uppercase character and the remaining characters are lowercase.
- *Depends on:* The original string instance.
- *Connects to:* Displaying formatted text to users.
- *Shape:* A string transformation utility.

**str.replace()**
- *What it is:* A string method to substitute substrings.
- *Implementation:* `def replace(self, old, new, count=-1) -> str`
- *Its use:* Swapping out specific characters or words for others.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a new string with all occurrences of substring `old` replaced by `new`.
- *Depends on:* The original string instance, the target substring, and the replacement substring.
- *Connects to:* Text substitution tasks.
- *Shape:* A string transformation utility.

**str.split()**
- *What it is:* A string method to divide a string into a list.
- *Implementation:* `def split(self, sep=None, maxsplit=-1) -> list[str]`
- *Its use:* Breaking sentences into words or parsing delimited data.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a list of the words in the string, using `sep` as the delimiter string.
- *Depends on:* The original string instance and an optional delimiter.
- *Connects to:* Creates a list sequence from a string sequence.
- *Shape:* A parsing and splitting utility.

**str.join()**
- *What it is:* A string method to combine an iterable of strings.
- *Implementation:* `def join(self, iterable) -> str`
- *Its use:* Merging a list of strings into a single string with a specific separator.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns a string which is the concatenation of the strings in `iterable`, separated by the calling string.
- *Depends on:* An iterable containing string elements, and the string instance serving as the separator.
- *Connects to:* Reversing the operation of `str.split()`.
- *Shape:* A combination utility.

**str.find()**
- *What it is:* A string method to locate a substring.
- *Implementation:* `def find(self, sub, start=None, end=None) -> int`
- *Its use:* Finding the index where a substring begins.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns the lowest index in the string where substring `sub` is found, or `-1` if not found.
- *Depends on:* The original string instance and the target substring.
- *Connects to:* Position-based logic and slicing.
- *Shape:* A searching utility.

**str.startswith()**
- *What it is:* A string method to check the beginning of a string.
- *Implementation:* `def startswith(self, prefix, start=None, end=None) -> bool`
- *Its use:* Determining if a string begins with a specific pattern.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns `True` if the string starts with the specified `prefix`, otherwise `False`.
- *Depends on:* The original string instance and a prefix string.
- *Connects to:* Conditional logic filtering strings.
- *Shape:* A boolean query method.

**str.endswith()**
- *What it is:* A string method to check the end of a string.
- *Implementation:* `def endswith(self, suffix, start=None, end=None) -> bool`
- *Its use:* Determining if a string ends with a specific pattern (like a file extension).
- *Type:* Instance method on `str`.
- *Responsibility:* Returns `True` if the string ends with the specified `suffix`, otherwise `False`.
- *Depends on:* The original string instance and a suffix string.
- *Connects to:* Conditional logic filtering strings.
- *Shape:* A boolean query method.

**str.isspace()**
- *What it is:* A string method to check for purely whitespace characters.
- *Implementation:* `def isspace(self) -> bool`
- *Its use:* Validating if a string is empty or contains only spaces.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns `True` if all characters in the string are whitespace and there is at least one character, otherwise `False`.
- *Depends on:* The original string instance.
- *Connects to:* Input validation.
- *Shape:* A boolean query method.

**str.isalnum()**
- *What it is:* A string method to check for alphanumeric characters.
- *Implementation:* `def isalnum(self) -> bool`
- *Its use:* Validating if a string only contains letters and numbers.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns `True` if all characters in the string are alphanumeric and there is at least one character.
- *Depends on:* The original string instance.
- *Connects to:* Input validation.
- *Shape:* A boolean query method.

**str.count()**
- *What it is:* A string method to count occurrences of a substring.
- *Implementation:* `def count(self, sub, start=None, end=None) -> int`
- *Its use:* Finding out how many times a character or word appears in a string.
- *Type:* Instance method on `str`.
- *Responsibility:* Returns the number of non-overlapping occurrences of substring `sub`.
- *Depends on:* The original string instance and the target substring.
- *Connects to:* String analysis tasks.
- *Shape:* An analytical query method.

---

## Concept Unit: Strings as sequences — indexing

### The Problem
When we deal with textual data, we often need to look at specific characters. If a string is a sequence of letters, how would you ask for the very first letter? How about the last letter, especially if you do not know exactly how long the string is?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition because we are demonstrating string functions.
- **Files affected:** `lesson06.py` (created).
- **Change type:** Add.
- **Location:** Top of file.
- **Dependencies:** None.

### The New Code
```python
def get_first_and_last(text):
    return (text[0], text[-1])
```

### The Updated Project
```python
# lesson06.py
# ← new
def get_first_and_last(text):
    return (text[0], text[-1])
```
This new file defines a function that returns the first and last characters of a provided string, leveraging indices.

### Isolate and Discard
Let's see how string characters are accessed using positions. We will execute some throwaway REPL code to observe the behavior of indices.

```python
>>> s = 'hello'
>>> s[0]
'h'
>>> s[1]
'e'
>>> s[4]
'o'
>>> s[-1]
'o'
>>> s[-2]
'l'
>>> s[5]
IndexError: string index out of range
```
This is called **indexing**. A string is an ordered sequence of characters. Each character has an index starting at `0`. Negative indices count from the end: `-1` is the last character, `-2` is second-to-last. Accessing an index beyond the string's length raises an `IndexError`. We will now discard this throwaway REPL example; it exists only to show how indexing operates.

### Mechanical Walkthrough
- `def get_first_and_last(text):` defines a new function taking a single argument `text`.
- `return (text[0], text[-1])` creates and returns a tuple.
- `text[0]` is a bracket-notation index access. It asks the string `text` for the character at position `0` (the first character).
- `text[-1]` is a bracket-notation index access using a negative index. It asks the string `text` for the character at position `-1` (the very last character).

---

## Concept Unit: Slicing — extracting substrings

### The Problem
Indexing gives us a single character, but what if we want a chunk of characters? How would you extract the first five characters of a string, or every other character?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `get_first_and_last`.
- **Dependencies:** None.

### The New Code
```python
def extract_prefix(text):
    return text[0:5]
```

### The Updated Project
```python
# lesson06.py
def get_first_and_last(text):
    return (text[0], text[-1])

# ← new
def extract_prefix(text):
    return text[0:5]
```
This adds a function that extracts exactly the first five characters from the provided string.

### Isolate and Discard
Let's isolate how we can grab multiple characters using a start, stop, and step.

```python
>>> s = 'hello world'
>>> s[0:5]
'hello'
>>> s[6:]
'world'
>>> s[:5]
'hello'
>>> s[::2]
'hlowrd'
>>> s[::-1]
'dlrow olleh'
>>> s[0:5:2]
'hlo'
```
This is called **slicing**. It uses the syntax `[start:stop:step]`. The `start` defaults to `0`, `stop` defaults to the length of the string, and `step` defaults to `1`. The `stop` index is EXCLUSIVE (up to but not including). The `s[::-1]` slice reverses the string. The full trace of `s[::2]` takes indices 0, 2, 4, 6, 8, 10, resulting in `'h','l','o','w','r','d'`. We will discard this throwaway code now.

### Mechanical Walkthrough
- `def extract_prefix(text):` defines a function taking a string `text`.
- `return text[0:5]` executes a slice on `text`.
- `text[0:5]` begins at index `0` and goes up to, but does not include, index `5`. It extracts the first five characters as a new string, which is then returned.

---

## Concept Unit: String immutability

### The Problem
We know how to read characters out of a string, but what if we want to change a typo? If `s = 'hello'`, what happens if we try to set the first letter to a capital 'H' by doing `s[0] = 'H'`?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `extract_prefix`.
- **Dependencies:** None.

### The New Code
```python
def capitalize_first(text):
    return text[0].upper() + text[1:]
```

### The Updated Project
```python
# lesson06.py
def extract_prefix(text):
    return text[0:5]

# ← new
def capitalize_first(text):
    return text[0].upper() + text[1:]
```
This adds a function that safely creates a new string with a capitalized first letter, avoiding the trap of trying to modify the string in-place.

### Isolate and Discard
Let's observe what happens when we try to assign a new character directly, and how we must handle it instead.

```python
>>> s = 'hello'
>>> s[0] = 'H'
TypeError: 'str' object does not support item assignment
>>> s = 'H' + s[1:]  # create a NEW string
>>> s
'Hello'
```
This demonstrates **immutability**. Strings cannot be modified in place. `s[0] = 'H'` fails with a `TypeError`. To "change" a string, you must create a new one. This is critical: string methods always return a NEW string; they never change the original. This lab code is now discarded.

### Mechanical Walkthrough
- `def capitalize_first(text):` defines a function to return a capitalized version of a string.
- `text[0]` gets the first character of the string.
- `.upper()` is called on that single-character string, returning a new uppercase string.
- `text[1:]` slices the original string from index `1` to the end.
- `+` concatenates the new uppercase character with the rest of the string, producing an entirely new string, which is returned.

---

## Concept Unit: Key string methods

### The Problem
Writing manual slices to clean or search text is tedious. How can we easily find words, change cases, or remove trailing spaces without writing custom loops?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `capitalize_first`.
- **Dependencies:** None.

### The New Code
```python
def clean_and_split(text):
    return text.strip().lower().split()
```

### The Updated Project
```python
# lesson06.py
def capitalize_first(text):
    return text[0].upper() + text[1:]

# ← new
def clean_and_split(text):
    return text.strip().lower().split()
```
This function combines multiple string methods to clean up input text (removing edge whitespace, lowercasing it, and dividing it into a list of words).

### Isolate and Discard
Let's exercise Python's built-in string methods in a lab environment.

```python
>>> s = '  Hello, World!  '
>>> s.strip()
'Hello, World!'
>>> s.lower()
'  hello, world!  '
>>> s.upper()
'  HELLO, WORLD!  '
>>> 'hello world'.title()
'Hello World'
>>> 'hello'.replace('l', 'r')
'herro'
>>> 'hello world'.split()
['hello', 'world']
>>> 'a,b,c'.split(',')
['a', 'b', 'c']
>>> ' '.join(['hello', 'world'])
'hello world'
>>> ','.join(['a', 'b', 'c'])
'a,b,c'
>>> 'hello world'.find('world')
6
>>> 'hello world'.find('xyz')
-1
>>> 'hello'.startswith('he')
True
>>> 'hello'.endswith('lo')
True
>>> '  '.isspace()
True
>>> 'hello123'.isalnum()
True
>>> 'hello world'.count('l')
3
```
These are **string methods**. They are built-in tools for string manipulation. For each method shown above, a NEW string or value is returned, leaving the original string unmodified. We will discard this REPL block.

### Mechanical Walkthrough
- `def clean_and_split(text):` defines a function.
- `text.strip()` calls the `strip` method on `text`, returning a new string with leading and trailing whitespace removed.
- `.lower()` is called on the new string returned by `strip()`, returning yet another new string, all in lowercase.
- `.split()` is called on that lowercase string, which divides it on spaces and returns a list of string words. This chained sequence safely transforms the data step-by-step.

---

## Concept Unit: f-strings — the modern way to format strings

### The Problem
If we have variables and we want to combine them into a sentence, we could use `+` to concatenate them. But what if one is a number? We'd have to convert it first, and the code gets messy. How do we cleanly inject variables directly into text?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `clean_and_split`.
- **Dependencies:** None.

### The New Code
```python
def greet_user(name, age):
    return f"Hello, {name}! You are {age} years old."
```

### The Updated Project
```python
# lesson06.py
def clean_and_split(text):
    return text.strip().lower().split()

# ← new
def greet_user(name, age):
    return f"Hello, {name}! You are {age} years old."
```
This adds a function that uses modern string formatting to build a personalized greeting.

### Isolate and Discard
Let's see how this formatting evaluates expressions in real time.

```python
>>> name = 'Alice'
>>> age = 30
>>> f'Hello, {name}! You are {age} years old.'
'Hello, Alice! You are 30 years old.'
>>> pi = 3.14159
>>> f'Pi is approximately {pi:.2f}'
'Pi is approximately 3.14'
>>> f'100 + 200 = {100 + 200}'
'100 + 200 = 300'
>>> width = 10
>>> f'{name:>{width}}'
'     Alice'
>>> f'{42:05d}'
'00042'
```
This is called an **f-string** (formatted string literal). It starts with `f` before the quote. `{expr}` is replaced by the evaluated result of the expression at runtime. `{value:.2f}` formats a float to two decimal places. `{value:>10}` right-aligns the text in a field 10 characters wide. This throwaway lab code is discarded.

### Mechanical Walkthrough
- `def greet_user(name, age):` defines a function taking two parameters.
- `return f"Hello, {name}! You are {age} years old."` returns an f-string.
- `f"..."` denotes that the string is a formatted string literal.
- `{name}` dynamically evaluates the `name` variable and inserts its string representation directly into the output.
- `{age}` dynamically evaluates the `age` variable (even if it's an integer) and inserts its string representation, avoiding the need for manual `str(age)` conversion or concatenation.

---

## Concept Unit: String membership and iteration

### The Problem
How can we check if a specific word is hidden inside a longer sentence? Or what if we need to examine a string, one single character at a time?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `greet_user`.
- **Dependencies:** None.

### The New Code
```python
def print_vowels_only(text):
    for char in text:
        if char.lower() in 'aeiou':
            print(char)
```

### The Updated Project
```python
# lesson06.py
def greet_user(name, age):
    return f"Hello, {name}! You are {age} years old."

# ← new
def print_vowels_only(text):
    for char in text:
        if char.lower() in 'aeiou':
            print(char)
```
This function iterates through characters and uses membership checking to print only the vowels.

### Isolate and Discard
Let's examine how the `in` operator works with strings, and how loops consume them.

```python
>>> 'ell' in 'hello'
True
>>> 'xyz' in 'hello'
False
>>> 'xyz' not in 'hello'
True
>>> for char in 'hello':
...     print(char.upper())
...
H
E
L
L
O
```
This demonstrates **string membership and iteration**. The `in` operator checks if a substring exists within a larger string. When used in a loop (`for char in s`), Python automatically iterates through the string one character at a time. The lab code is now discarded.

### Mechanical Walkthrough
- `for char in text:` iterates over the string `text`. On each loop, `char` is assigned the next single character.
- `char.lower()` converts the character to lowercase so the check is case-insensitive.
- `in 'aeiou'` is a membership check. It asks whether the lowercase character exists anywhere within the substring `'aeiou'`.
- `print(char)` prints the character to the console if it matched the condition.

---

## Concept Unit: Building strings with loops (accumulation)

### The Problem
If strings are immutable, how do we programmatically construct a new string character by character (for instance, if we wanted to reverse a string manually)?

### Project Change
- **Reference Source:** No reference counterpart - this is a from-scratch addition.
- **Files affected:** `lesson06.py`.
- **Change type:** Add.
- **Location:** Below `print_vowels_only`.
- **Dependencies:** None.

### The New Code
```python
def reverse_string(s):
    result = ''
    for char in s:
        result = char + result
    return result
```

### The Updated Project
```python
# lesson06.py
def print_vowels_only(text):
    for char in text:
        if char.lower() in 'aeiou':
            print(char)

# ← new
def reverse_string(s):
    result = ''
    for char in s:
        result = char + result
    return result
```
This adds a function that builds a reversed version of the input string using a loop.

### Isolate and Discard
Let's see this pattern in action to see how the result variable grows.

```python
>>> def reverse_string(s):
...     result = ''
...     for char in s:
...         result = char + result
...     return result
...
>>> print(reverse_string('hello'))
olleh
```
This is the **string accumulator pattern**. We build a string character by character. For the input `'hi'`, `result` starts as `''`; after `'h'`, `result = 'h'`; after `'i'`, `result = 'ih'`. We are continuously creating new strings. (Note: for large strings, `''.join(list_of_chars)` is more efficient than `+` in a loop, because each `+` creates a new string object). We discard this throwaway code.

### Mechanical Walkthrough
- `def reverse_string(s):` defines the function.
- `result = ''` initializes an empty string to serve as our accumulator.
- `for char in s:` iterates over every character in the string.
- `result = char + result` concatenates the current character *before* the previous contents of `result`. Because strings are immutable, `char + result` creates a brand-new string in memory, and the assignment `result =` points our variable to that new string.
- `return result` yields the completely assembled string.

---

## Closing
Strings are immutable sequences with a rich set of methods. Lesson 7 introduces lists — mutable sequences that are the workhorse of Python data handling. 

**Exercises:**
- Write a function `is_palindrome(s)` using slicing.
- Write `count_vowels(s)` using `in` membership.
- Write `title_case(s)` from scratch using `.split()`, `.capitalize()`, and `.join()`.
