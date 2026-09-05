# Lesson 09: Dictionaries — Key-Value Stores

What you will build: The reader understands Python dicts: O(1) key lookup, creation, get/set/delete, iteration patterns, common dict methods, and dict comprehensions. The transferable insight: a dict is a hash map. It trades memory for speed: O(1) average lookup instead of O(n) linear search. Any algorithm that repeatedly searches a list for a value should use a dict instead. This is one of the most important performance insights in Python programming.

What you need to know first: Lessons 00-08.

**Terms used in this lesson**
- **Dictionary** — A data structure that stores key-value pairs, providing average O(1) time complexity for lookups, insertions, and deletions. It trades memory for speed, avoiding linear searches.
- **Key** — The unique identifier used to look up a value in a dictionary. Keys must be immutable (hashable), such as strings, integers, floats, or tuples.
- **Value** — The data associated with a key in a dictionary. Values can be of any type, can be mutable, and can be duplicated across different keys.
- **Hash Map** — The underlying computer science data structure that powers Python dictionaries, using a hash function to compute an index into an array of buckets or slots.
- **Hashable** — An object is hashable if it has a hash value which never changes during its lifetime, and can be compared to other objects. Immutable types like strings and numbers are hashable.
- **KeyError** — An exception raised when a dictionary key is not found in the set of existing keys.
- **Iterable** — An object capable of returning its members one at a time, allowing it to be iterated over in a for-loop.
- **Comprehension** — A concise syntax for creating a new dictionary by iterating over an iterable and applying an expression to each item.
- **In-place** — An operation that modifies the original data structure directly, rather than returning a new copy.

**Objects and methods used**
- **`dict`**
  - *What it is:* The built-in dictionary type in Python.
  - *Implementation:* `class dict(**kwarg)`
  - *Its use:* To create a new dictionary to map keys to values.
  - *Type:* Built-in class.
  - *Responsibility:* Manages a collection of key-value pairs, ensuring unique keys and providing fast O(1) lookups.
  - *Depends on:* Keys being hashable objects.
  - *Connects to:* Can be iterated over, returning keys.
  - *Shape:* A core Python language data structure.
- **`dict.get()`**
  - *What it is:* A method to safely retrieve a value from a dictionary.
  - *Implementation:* `def get(self, key, default=None)`
  - *Its use:* To look up a key without risking a `KeyError` if the key does not exist.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Returns the value for `key` if `key` is in the dictionary, otherwise returns the `default` value.
  - *Depends on:* A target key, and optionally a default value.
  - *Connects to:* Called on a dictionary instance.
  - *Shape:* Public API of the `dict` class.
- **`dict.pop()`**
  - *What it is:* A method to remove a specified key and return its value.
  - *Implementation:* `def pop(self, key)`
  - *Its use:* To extract and remove a key-value pair in one step.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Removes the key from the dictionary and returns its value. Raises `KeyError` if the key is not found.
  - *Depends on:* A target key.
  - *Connects to:* Called on a dictionary instance.
  - *Shape:* Public API of the `dict` class.
- **`dict.keys()`**
  - *What it is:* A method that returns a view object of the dictionary's keys.
  - *Implementation:* `def keys(self)`
  - *Its use:* To iterate over or inspect the keys of a dictionary.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Provides a dynamic view of the dictionary's keys.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Called on a dictionary instance; returns a view object.
  - *Shape:* Public API of the `dict` class.
- **`dict.values()`**
  - *What it is:* A method that returns a view object of the dictionary's values.
  - *Implementation:* `def values(self)`
  - *Its use:* To iterate over or inspect the values of a dictionary.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Provides a dynamic view of the dictionary's values.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Called on a dictionary instance; returns a view object.
  - *Shape:* Public API of the `dict` class.
- **`dict.items()`**
  - *What it is:* A method that returns a view object of the dictionary's key-value pairs.
  - *Implementation:* `def items(self)`
  - *Its use:* To iterate over both keys and values simultaneously.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Provides a dynamic view of the dictionary's items as tuples `(key, value)`.
  - *Depends on:* The dictionary instance.
  - *Connects to:* Called on a dictionary instance; returns a view object.
  - *Shape:* Public API of the `dict` class.
- **`dict.update()`**
  - *What it is:* A method to update the dictionary with elements from another dictionary object.
  - *Implementation:* `def update(self, other)`
  - *Its use:* To merge another dictionary into the current one, overwriting existing keys.
  - *Type:* Instance method of `dict`.
  - *Responsibility:* Modifies the dictionary in-place by adding or updating key-value pairs.
  - *Depends on:* Another dictionary.
  - *Connects to:* Called on a dictionary instance.
  - *Shape:* Public API of the `dict` class.
- **`collections.Counter`**
  - *What it is:* A dictionary subclass for counting hashable objects.
  - *Implementation:* `class Counter(dict)`
  - *Its use:* To cleanly and efficiently count frequencies of items in an iterable.
  - *Type:* Class in the `collections` module.
  - *Responsibility:* Maintains a mapping of elements to their counts, defaulting missing elements to 0.
  - *Depends on:* An iterable or mapping to initialize counts.
  - *Connects to:* Inherits from `dict`.
  - *Shape:* Standard library utility.
- **`collections.defaultdict`**
  - *What it is:* A dictionary subclass that calls a factory function to supply missing values.
  - *Implementation:* `class defaultdict(default_factory=None)`
  - *Its use:* To handle missing keys gracefully by automatically creating a default value when a key is first accessed.
  - *Type:* Class in the `collections` module.
  - *Responsibility:* Overrides missing key lookup to provide default values using the `default_factory`.
  - *Depends on:* A callable `default_factory` (like `int` or `list`).
  - *Connects to:* Inherits from `dict`.
  - *Shape:* Standard library utility.

## Concept Unit: Dict literals and basic operations

### The Problem
If you have a list of user IDs and want to look up a user's name, searching through a list of pairs `[('id1', 'Alice'), ('id2', 'Bob')]` takes O(n) time. How can you find the name associated with an ID in O(1) time? What data structure maps unique keys to values directly?

### Introduce the concept in isolation
```python
user = {'name': 'Alice', 'age': 30}
print(user['name'])
user['age'] = 31
print(user.get('email', 'No Email'))
deleted_age = user.pop('age')
print(user)
```
Output:
```
Alice
No Email
{'name': 'Alice'}
```
This proves that **dictionaries** can be created with literal syntax `{}`, values can be accessed and modified via `[key]`, missing keys can be safely retrieved with `.get()`, and `.pop()` removes a key and returns its value. 

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition to build a text analyzer.
- **Files affected:** `analyzer.py` (created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** None.

### The New Code
```python
config = {'case_sensitive': False, 'min_length': 3}
config['language'] = 'en'
print("Language:", config.get('language'))
```

### The Updated Project
```python
1: config = {'case_sensitive': False, 'min_length': 3} # ← new
2: config['language'] = 'en' # ← new
3: print("Language:", config.get('language')) # ← new
```
This establishes a basic dictionary with configuration settings, adds a new key, and safely retrieves it.

### Mechanical walkthrough
- `{}` creates a new dictionary literal containing key-value pairs.
- `'case_sensitive': False` defines a string key `'case_sensitive'` mapping to the boolean value `False`.
- `,` separates the key-value pairs.
- `'min_length': 3` maps another string key to an integer value.
- `config['language'] = 'en'` assigns the value `'en'` to the key `'language'` in the `config` dictionary. If the key exists, it is overwritten; if not, it is created.
- `print(...)` calls the built-in print function.
- `"Language:"` is a literal string.
- `config.get('language')` calls the `get` method on the `config` dictionary with the key `'language'`. It returns the value safely without raising a `KeyError`.

### CS lens
This is a Hash Map. It appears in databases for indexing, in caches (like Memcached or Redis) for fast retrieval, and in symbol tables in compilers to track variable definitions. It provides average O(1) time complexity for insertions and lookups by passing the key through a hash function.

### SE lens
Using a dictionary for configuration over multiple separate variables is a design principle of grouping related state. The alternative NOT chosen is having standalone variables like `config_language` and `config_min_length`. The real tradeoff is that dictionaries lack formal structure (you can misspell a key at runtime), whereas formal classes or objects enforce schema but require more boilerplate.

### Commands needed
`python3 analyzer.py`

### Run it
Predicted confidently: Language: en

### One sentence connecting to previous unit
Now that we can store key-value pairs and look them up efficiently, we need a way to iterate through all the data stored in a dictionary.

## Concept Unit: Dict methods — keys, values, items

### The Problem
You have a dictionary full of configuration settings and you want to print all of them. How do you loop over a dictionary? Does looping give you the keys, the values, or both?

### Introduce the concept in isolation
```python
d = {'a': 1, 'b': 2}
for k, v in d.items():
    print(f"{k}: {v}")
print('a' in d)
d.update({'c': 3, 'a': 99})
print(d)
```
Output:
```
a: 1
b: 2
True
{'a': 99, 'b': 2, 'c': 3}
```
This proves that `.items()` provides both the key and the value for iteration, the `in` operator provides O(1) membership testing for keys, and `.update()` merges dictionaries and overwrites conflicts. These are core **dictionary methods**.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analyzer.py` (modified)
- **Change type:** Add
- **Location:** At the end of the file.
- **Dependencies:** None.

### The New Code
```python
for key, val in config.items():
    print(f"Config {key} -> {val}")
if 'language' in config:
    print("Language is configured.")
```

### The Updated Project
```python
1: config = {'case_sensitive': False, 'min_length': 3}
2: config['language'] = 'en'
3: print("Language:", config.get('language'))
4: for key, val in config.items(): # ← new
5:     print(f"Config {key} -> {val}") # ← new
6: if 'language' in config: # ← new
7:     print("Language is configured.") # ← new
```
This loops through the configuration dictionary to display all settings and performs an O(1) check to see if a specific key exists.

### Mechanical walkthrough
- `for key, val in` starts an iteration unpacking two variables at once.
- `config.items()` returns a view object of all key-value tuple pairs in the dictionary.
- `print(f"Config {key} -> {val}")` prints each key and value using an f-string.
- `if 'language' in config:` tests whether the string `'language'` is a key currently present in the dictionary.
- `print("Language is configured.")` executes if the `in` check returns `True`.

### CS lens
Iterating over dictionary views and performing membership tests are core operations on Collections. This appears in JSON parsing (iterating over object properties), routing tables in networking (iterating paths), and file system directory listings (where filenames are keys). The `in` operator uses the underlying hash map to achieve O(1) time complexity.

### SE lens
Using `.items()` is a design principle of idiomatic iteration. The alternative NOT chosen is looping over keys (`for key in config:`) and then looking up the value (`val = config[key]`). The real tradeoff is that `.items()` is more readable and slightly faster since it avoids the secondary hash lookup, but it unpacks pairs which is unnecessary if you only need the keys.

### Commands needed
`python3 analyzer.py`

### Run it
Predicted confidently:
Config case_sensitive -> False
Config min_length -> 3
Config language -> en
Language is configured.

### One sentence connecting to previous unit
With the ability to traverse and check membership efficiently, we can use dictionaries to aggregate data, such as counting how many times words appear in a text.

## Concept Unit: Dict as counter — the frequency pattern

### The Problem
You have a list of words and want to know how many times each word occurs. If you loop through the words, how do you add 1 to a dictionary key's count without crashing when the key doesn't exist yet?

### Introduce the concept in isolation
```python
from collections import defaultdict, Counter
words = ['apple', 'banana', 'apple']
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)
print(Counter(words))
```
Output:
```
{'apple': 2, 'banana': 1}
Counter({'apple': 2, 'banana': 1})
```
This proves that `.get(w, 0)` is a safe way to initialize and increment counters in one line, and that the `collections.Counter` class provides this exact **frequency pattern** out of the box.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analyzer.py` (modified)
- **Change type:** Add
- **Location:** At the end of the file.
- **Dependencies:** None.

### The New Code
```python
from collections import Counter
text = "the cat sat on the mat"
words = text.split()
word_counts = Counter(words)
print("Top word count:", word_counts['the'])
```

### The Updated Project
```python
1:  config = {'case_sensitive': False, 'min_length': 3}
...
6:  if 'language' in config:
7:      print("Language is configured.")
8:  from collections import Counter # ← new
9:  text = "the cat sat on the mat" # ← new
10: words = text.split() # ← new
11: word_counts = Counter(words) # ← new
12: print("Top word count:", word_counts['the']) # ← new
```
This splits a sentence into words and uses a `Counter` to build a frequency dictionary of those words instantly.

### Mechanical walkthrough
- `from collections import Counter` imports the `Counter` class from the standard library's `collections` module.
- `text = "the cat sat on the mat"` assigns a string literal to `text`.
- `words = text.split()` calls the string method `split()` to break the string into a list of words on whitespace.
- `word_counts = Counter(words)` instantiates a `Counter` object, passing in the list of words. It automatically counts the occurrences of each element.
- `print(...)` prints the result.
- `word_counts['the']` looks up the frequency of the string `'the'` in the Counter dictionary.

### CS lens
The frequency pattern is a form of a Histogram. It appears in data analytics for summarizing event occurrences, in natural language processing (NLP) for bag-of-words models, and in image processing to count pixel intensities.

### SE lens
Using the standard library `Counter` is a principle of reusing robust primitives. The alternative NOT chosen is manually looping and using `counts[w] = counts.get(w, 0) + 1`. The real tradeoff is that `Counter` is highly optimized in C and clearly communicates intent, but introduces an import that might feel like overhead for a trivial single-use script.

### Commands needed
`python3 analyzer.py`

### Run it
Predicted confidently: Top word count: 2

### One sentence connecting to previous unit
Counting is a common way to build a dictionary from a list, but sometimes we want to dynamically generate a dictionary based on arbitrary rules and transformations.

## Concept Unit: Dict comprehensions

### The Problem
You have a dictionary of word counts, but you want to create a new dictionary containing only the words that appear more than once, or maybe map each word to its length. How can you build and filter a new dictionary in a single readable line without writing a full loop?

### Introduce the concept in isolation
```python
base_dict = {'a': 1, 'b': 2, 'c': 3}
filtered = {k: v * 10 for k, v in base_dict.items() if v > 1}
inverted = {v: k for k, v in base_dict.items()}
print(filtered)
print(inverted)
```
Output:
```
{'b': 20, 'c': 30}
{1: 'a', 2: 'b', 3: 'c'}
```
This proves that **dictionary comprehensions** can iterate, filter, and transform an existing dictionary (or any iterable) to build a new dictionary concisely, even swapping keys and values.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analyzer.py` (modified)
- **Change type:** Add
- **Location:** At the end of the file.
- **Dependencies:** None.

### The New Code
```python
long_words = {word: count for word, count in word_counts.items() if len(word) >= config['min_length']}
print("Filtered counts:", long_words)
```

### The Updated Project
```python
...
11: word_counts = Counter(words)
12: print("Top word count:", word_counts['the'])
13: long_words = {word: count for word, count in word_counts.items() if len(word) >= config['min_length']} # ← new
14: print("Filtered counts:", long_words) # ← new
```
This uses a dictionary comprehension to filter out short words, applying the minimum length setting from the `config` dictionary.

### Mechanical walkthrough
- `{ ... }` curly braces surrounding a `for` loop signify a dictionary comprehension (because of the `key: value` syntax inside).
- `word: count` is the expression defining the key-value pair to insert into the new dictionary.
- `for word, count in word_counts.items()` iterates over every key-value pair in the `word_counts` dictionary.
- `if len(word) >= config['min_length']` is an optional filter condition. The key-value pair is only included if the length of the string `word` is greater than or equal to the integer stored in `config['min_length']`.
- `print("Filtered counts:", long_words)` prints the resulting dictionary.

### CS lens
Comprehensions represent declarative programming and map/filter operations. This declarative approach appears in SQL queries (`SELECT ... WHERE`), in functional programming languages (like Haskell's list comprehensions), and in big data processing pipelines (like Spark transformations).

### SE lens
Using a comprehension embraces Pythonic expressiveness. The alternative NOT chosen is initializing an empty dictionary, looping, and using an `if` block with assignment. The real tradeoff is that comprehensions are concise and faster (implemented in C), but they can become unreadable if the filtering or mapping logic grows too complex.

### Commands needed
`python3 analyzer.py`

### Run it
Predicted confidently: Filtered counts: {'the': 2, 'cat': 1, 'sat': 1, 'mat': 1}

### One sentence connecting to previous unit
Sometimes after processing and filtering our dictionaries, we need to guarantee the order of the items or merge them with other dictionaries.

## Concept Unit: Ordered dicts and merging (Python 3.7+)

### The Problem
If you have two configuration dictionaries, how do you combine them so that the settings from the second one override the first? And when you print them, will the keys come out in random order or the order you added them?

### Introduce the concept in isolation
```python
d1 = {'a': 1, 'b': 2}
d2 = {'b': 99, 'c': 3}
merged = {**d1, **d2}
merged_op = d1 | d2
print(merged)
print(merged_op)
```
Output:
```
{'a': 1, 'b': 99, 'c': 3}
{'a': 1, 'b': 99, 'c': 3}
```
This proves that dictionaries can be **merged** using the unpacking syntax `{**d1, **d2}` or the union operator `|` (Python 3.9+). It also implicitly demonstrates that modern Python dictionaries preserve insertion order.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `analyzer.py` (modified)
- **Change type:** Add
- **Location:** At the end of the file.
- **Dependencies:** Requires Python 3.9+ for the `|` operator.

### The New Code
```python
user_config = {'language': 'fr', 'theme': 'dark'}
final_config = config | user_config
print("Final Config:", final_config)
sorted_counts = dict(sorted(long_words.items(), key=lambda kv: kv[1], reverse=True))
print("Sorted Counts:", sorted_counts)
```

### The Updated Project
```python
...
13: long_words = {word: count for word, count in word_counts.items() if len(word) >= config['min_length']}
14: print("Filtered counts:", long_words)
15: user_config = {'language': 'fr', 'theme': 'dark'} # ← new
16: final_config = config | user_config # ← new
17: print("Final Config:", final_config) # ← new
18: sorted_counts = dict(sorted(long_words.items(), key=lambda kv: kv[1], reverse=True)) # ← new
19: print("Sorted Counts:", sorted_counts) # ← new
```
This merges a base configuration with a user configuration using the union operator, and creates a new dictionary sorted by frequency count, taking advantage of modern Python's insertion-ordered dictionaries.

### Mechanical walkthrough
- `user_config = {'language': 'fr', 'theme': 'dark'}` creates a new dictionary.
- `final_config = config | user_config` uses the dictionary union operator `|` to merge `config` and `user_config`. Conflicts are resolved by keeping the value from `user_config` (the right operand).
- `print(...)` prints the merged configuration.
- `sorted(...)` is a built-in function that takes an iterable and returns a sorted list.
- `long_words.items()` provides the iterable of key-value pairs to sort.
- `key=lambda kv: kv[1]` provides a lambda function to sort by the dictionary values (the second element, index 1, of each tuple).
- `reverse=True` sorts the values in descending order.
- `dict(...)` takes the sorted list of tuples and converts it back into a dictionary. Because Python 3.7+ preserves insertion order, this new dictionary remains sorted.
- `print("Sorted Counts:", sorted_counts)` prints the sorted dictionary.

### CS lens
Merging structures and maintaining insertion order are foundational concepts. This appears in configuration management systems (cascading overrides like base config -> env config -> user config), in LRU caches (which depend on insertion/access order), and in log aggregators that merge structured JSON logs.

### SE lens
Using the `|` operator provides declarative clarity. The alternative NOT chosen is using `config.copy()` and then `config.update(user_config)`. The real tradeoff is that the union operator creates a new dictionary cleanly and functional-style, but it requires Python 3.9+.

### Commands needed
`python3 analyzer.py`

### Run it
Predicted confidently:
Final Config: {'case_sensitive': False, 'min_length': 3, 'language': 'fr', 'theme': 'dark'}
Sorted Counts: {'the': 2, 'cat': 1, 'sat': 1, 'mat': 1}

### One sentence connecting to previous unit
We've traced the complete lifecycle of a dictionary, from creation and querying to filtering, merging, and relying on its ordered nature.

## Closing

### Connect the pieces
Building a word-frequency dictionary from the sentence `"the cat sat on the mat"` perfectly traces all these concepts in action. You start by splitting the string into an iterable of words. You can manually loop through this list using `word_counts[word] = word_counts.get(word, 0) + 1` to safely initialize and increment counts, proving O(1) key access and avoiding `KeyError`. Alternatively, passing the words directly into `collections.Counter()` leverages the frequency pattern instantly. Once counted, you can use a dictionary comprehension to filter out words below a certain length. Finally, by sorting the `.items()` and passing them back into `dict()`, you rely on Python's insertion-order guarantee to maintain a frequency-ranked list of words, which you could then cleanly merge with other text analyses using the `|` operator.
