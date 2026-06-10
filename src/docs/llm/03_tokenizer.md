# Module 03 — The Tokenizer
### Turn text into numbers. Build BPE completely from scratch.

---

## How to Use This Module

Read each section fully before typing the code for that section.
Every code block has a section header above it explaining what it does and why.
Create `03_tokenizer.py` and type every line including comments.

---

## PART 1 — What Is a Tokenizer and Why Do We Need One?

---

### 1.1 The Problem in Plain English

A language model works with numbers. Text is characters.
We need to map every piece of text to a sequence of integers.

This mapping is called **tokenization**.
The thing that does it is called a **tokenizer**.
Each unit of text it maps to an integer is called a **token**.

---

### 1.2 Three Approaches and Their Trade-offs

**Approach 1: One integer per character**

Every unique character gets its own ID.
"Hello" → [7, 4, 11, 11, 14]  (using some mapping)

Pros:
- Simple to build
- Handles any text — unknown words just get split to characters
- Small vocabulary (26 + punctuation ≈ 70-100 for English)

Cons:
- Long sequences: "Hello, world!" becomes 13 tokens
- The model must learn to spell before it can learn grammar
- Slow to train because long sequences = expensive attention computation

**Approach 2: One integer per word**

Every unique word gets its own ID.
"The cat sat" → [482, 89, 712]

Pros:
- Short sequences: one token per word
- Common words are single tokens

Cons:
- Huge vocabulary: English has ~170,000 words
- Unknown words (names, typos, technical terms) cannot be handled
- "run", "runs", "running", "ran" are four different unrelated tokens even though they share meaning

**Approach 3: Byte-Pair Encoding (BPE)**

Start with characters. Repeatedly merge the most frequent adjacent pair.
Result: common words become single tokens, rare words split to sub-word pieces.

"the" → [the]  (1 token — very common, gets its own token)
"tokenization" → [token, ization]  (2 tokens — split at a useful boundary)
"xkqmwz" → [x, k, q, m, w, z]  (6 tokens — falls back to characters)

Pros:
- Vocabulary size is a tunable parameter (typically 32k-100k)
- Shorter sequences than character-level
- No unknown words — worst case falls back to characters
- Subword pieces share across related words ("run", "running" both contain "run")

Cons:
- More complex to build
- The tokenization depends on which language/domain you train it on

**We build all three**, starting with character-level (simplest to understand,
what we actually use for training), then BPE (to understand how real models work).

---

### 1.3 What a Tokenizer Stores

A tokenizer needs exactly two things:

1. **char_to_id** (also called vocabulary or vocab): a dictionary mapping each token string to its integer ID.
   ```
   {"a": 0, "b": 1, "c": 2, "\n": 3, " ": 4, ...}
   ```

2. **id_to_char** (the reverse mapping): a dictionary mapping each integer ID back to its token string.
   ```
   {0: "a", 1: "b", 2: "c", 3: "\n", 4: " ", ...}
   ```

With these two dictionaries, you can:
- **encode**: convert text → list of integers (char_to_id)
- **decode**: convert list of integers → text (id_to_char)

The model only ever sees the integers. It never sees the text directly.

---

## PART 2 — Building the Character-Level Tokenizer

---

### 2.1 Building the Vocabulary

The vocabulary is built from the training text.
We scan all the text, find every unique character, sort them,
and assign an integer ID to each one.

Why sort? So the mapping is deterministic — if you rebuild the tokenizer
on the same text, you always get the same mapping.

```python
# 03_tokenizer.py
#
# In this file we build:
# 1. A character-level tokenizer (simple, what we use for training)
# 2. A BPE tokenizer (what real models use — we build this to understand it)
# 3. The dataset: Shakespeare + Python code
#
# The tokenizer is the first thing that runs before any model training.
# Every word, every character you feed the model goes through this.

import os
import math
import pickle
import urllib.request
from collections import Counter


# -------------------------------------------------------
# THE CHARACTER-LEVEL TOKENIZER
#
# Plain English:
#   - Scan the training text for all unique characters
#   - Sort them (for determinism)
#   - Assign integer IDs in order
#   - Build encode and decode functions
# -------------------------------------------------------

class CharTokenizer:
    """
    A character-level tokenizer.
    Each unique character in the training text becomes one token.
    
    After building:
      tokenizer.encode("Hi")  → [7, 8]        (ints)
      tokenizer.decode([7, 8]) → "Hi"          (text)
      tokenizer.vocab_size     → 70 or however many unique chars
    """
    
    def __init__(self):
        # These will be populated by build_vocab()
        self.char_to_id = {}  # string → int  ("a" → 0, "b" → 1, ...)
        self.id_to_char = {}  # int → string  (0 → "a", 1 → "b", ...)
        self.vocab_size  = 0   # how many unique characters
    
    def build_vocab(self, text):
        """
        Scan text, find all unique characters, assign IDs.
        
        text: the full training text (a single long string)
        
        After this call:
          self.char_to_id is populated
          self.id_to_char is populated
          self.vocab_size is set
        """
        # Step 1: find all unique characters
        # set() removes duplicates. sorted() puts them in a consistent order.
        unique_chars = sorted(set(text))
        
        # Step 2: assign an integer to each character
        # enumerate() gives us (0, char_0), (1, char_1), etc.
        for integer_id, character in enumerate(unique_chars):
            self.char_to_id[character] = integer_id  # "a" → 0
            self.id_to_char[integer_id] = character  # 0 → "a"
        
        self.vocab_size = len(unique_chars)
        
        print(f"Built vocabulary:")
        print(f"  Unique characters: {self.vocab_size}")
        print(f"  Characters: {repr(''.join(unique_chars))}")
    
    def encode(self, text):
        """
        Convert a string to a list of integer IDs.
        Each character → its integer ID from char_to_id.
        
        Raises an error if a character is not in the vocabulary.
        This can happen if you encode text containing characters
        that were not in the training text.
        """
        result = []
        for character in text:
            if character not in self.char_to_id:
                raise ValueError(
                    f"Character {repr(character)} is not in the vocabulary. "
                    f"Only characters seen during build_vocab() can be encoded. "
                    f"You may have a character in your text that was not in training data."
                )
            result.append(self.char_to_id[character])
        return result
    
    def decode(self, ids):
        """
        Convert a list of integer IDs back to a string.
        Each integer → its character from id_to_char.
        
        This is the inverse of encode. encode then decode should
        give back the original string exactly.
        """
        result = []
        for integer_id in ids:
            if integer_id not in self.id_to_char:
                raise ValueError(
                    f"Token ID {integer_id} is not in the vocabulary. "
                    f"Valid IDs are 0 to {self.vocab_size - 1}."
                )
            result.append(self.id_to_char[integer_id])
        return ''.join(result)  # join all characters into a single string
    
    def __repr__(self):
        return f"CharTokenizer(vocab_size={self.vocab_size})"
```

```python
# Test the tokenizer on a small string first
tokenizer = CharTokenizer()
test_text  = "Hello, world! 123"
tokenizer.build_vocab(test_text)

print()
print("=== TOKENIZER TESTS ===")
print()

# Test encode
sample    = "Hello"
encoded   = tokenizer.encode(sample)
print(f"encode({repr(sample)}) → {encoded}")

# Test decode
decoded = tokenizer.decode(encoded)
print(f"decode({encoded}) → {repr(decoded)}")

# Test roundtrip — encode then decode should give back original
print(f"Roundtrip matches: {sample == decoded}")
print()

# Show the full vocabulary mapping
print("Full vocabulary (ID → character):")
for i, char in sorted(tokenizer.id_to_char.items()):
    # Show printable representation so we can see spaces and newlines
    print(f"  ID {i:2d} → {repr(char)}")
print()
```

---

### 2.2 Downloading and Preparing the Training Data

```python
# -------------------------------------------------------
# DOWNLOADING THE SHAKESPEARE DATASET
#
# The full text of Shakespeare's works.
# About 1 million characters.
# This is the classic dataset for character-level LM training.
# -------------------------------------------------------

def download_file(url, local_path):
    """Download a file if it does not already exist locally."""
    if os.path.exists(local_path):
        print(f"File already exists: {local_path}")
    else:
        print(f"Downloading {local_path}...")
        urllib.request.urlretrieve(url, local_path)
        print(f"Done.")

# Shakespeare — classic training text for character-level models
SHAKESPEARE_URL  = (
    "https://raw.githubusercontent.com/karpathy/char-rnn/"
    "master/data/tinyshakespeare/input.txt"
)
SHAKESPEARE_PATH = "shakespeare.txt"

download_file(SHAKESPEARE_URL, SHAKESPEARE_PATH)

with open(SHAKESPEARE_PATH, 'r', encoding='utf-8') as f:
    shakespeare_text = f.read()

print()
print("=== SHAKESPEARE DATASET ===")
print(f"Total characters: {len(shakespeare_text):,}")
print(f"Unique characters: {len(set(shakespeare_text))}")
print()
print("First 300 characters:")
print(shakespeare_text[:300])
print()
print("Last 200 characters:")
print(shakespeare_text[-200:])
```

```python
# -------------------------------------------------------
# THE PYTHON CODE DATASET
#
# We write this ourselves — representative Python patterns
# covering: functions, classes, algorithms, data structures.
#
# We repeat it multiple times to balance the dataset.
# Shakespeare has ~1M characters; we repeat Python code
# to get a comparable amount.
# -------------------------------------------------------

python_code = '''
# Functions and basic patterns
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def is_even(n):
    return n % 2 == 0

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

def factorial(n):
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers")
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fibonacci(n):
    if n <= 0:
        return []
    if n == 1:
        return [0]
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Sorting algorithms
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j   = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid   = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j  = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left  = [x for x in arr if x < pivot]
    mid   = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + mid + quicksort(right)

# Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Classes and OOP
class Node:
    def __init__(self, value):
        self.value = value
        self.next  = None
    
    def __repr__(self):
        return f"Node({self.value})"

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0
    
    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        self.size += 1
    
    def prepend(self, value):
        new_node      = Node(value)
        new_node.next = self.head
        self.head     = new_node
        self.size    += 1
    
    def delete(self, value):
        if not self.head:
            return
        if self.head.value == value:
            self.head = self.head.next
            self.size -= 1
            return
        current = self.head
        while current.next:
            if current.next.value == value:
                current.next = current.next.next
                self.size   -= 1
                return
            current = current.next
    
    def to_list(self):
        result  = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result
    
    def __len__(self):
        return self.size
    
    def __repr__(self):
        return f"LinkedList({self.to_list()})"

class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]
    
    def is_empty(self):
        return len(self.items) == 0
    
    def __len__(self):
        return len(self.items)

class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.pop(0)
    
    def front(self):
        return self.items[0]
    
    def is_empty(self):
        return len(self.items) == 0

class BinaryTree:
    def __init__(self, value):
        self.value = value
        self.left  = None
        self.right = None
    
    def insert(self, value):
        if value < self.value:
            if self.left is None:
                self.left = BinaryTree(value)
            else:
                self.left.insert(value)
        else:
            if self.right is None:
                self.right = BinaryTree(value)
            else:
                self.right.insert(value)
    
    def inorder(self):
        result = []
        if self.left:
            result.extend(self.left.inorder())
        result.append(self.value)
        if self.right:
            result.extend(self.right.inorder())
        return result
    
    def search(self, value):
        if value == self.value:
            return True
        elif value < self.value and self.left:
            return self.left.search(value)
        elif value > self.value and self.right:
            return self.right.search(value)
        return False

# Functional programming patterns
numbers = list(range(1, 21))
squares      = [x ** 2 for x in numbers]
evens        = [x for x in numbers if x % 2 == 0]
even_squares = [x ** 2 for x in numbers if x % 2 == 0]
cubes        = [x ** 3 for x in range(1, 11)]

words    = ["hello", "world", "python", "programming", "learning"]
upper    = [w.upper() for w in words]
lengths  = {w: len(w) for w in words}
long_words = [w for w in words if len(w) > 5]

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat   = [x for row in matrix for x in row]
transposed = [[matrix[j][i] for j in range(len(matrix))]
              for i in range(len(matrix[0]))]

# Higher order functions
def apply(f, lst):
    return [f(x) for x in lst]

def compose(f, g):
    return lambda x: f(g(x))

double     = lambda x: x * 2
square     = lambda x: x ** 2
double_square = compose(double, square)

# String operations
def reverse_string(s):
    return s[::-1]

def is_palindrome(s):
    cleaned = s.lower().replace(" ", "").replace(",", "").replace(".", "")
    return cleaned == cleaned[::-1]

def count_words(text):
    words = text.lower().split()
    return Counter(words)

def title_case(text):
    return " ".join(word.capitalize() for word in text.split())

# Dictionary operations
def invert_dict(d):
    return {v: k for k, v in d.items()}

def merge_dicts(d1, d2):
    result = d1.copy()
    result.update(d2)
    return result

def group_by(lst, key_fn):
    groups = {}
    for item in lst:
        key = key_fn(item)
        if key not in groups:
            groups[key] = []
        groups[key].append(item)
    return groups
'''

# Repeat to get more training data
# (Shakespeare is ~1M chars; this makes ~700k chars of Python)
python_text = python_code * 15

print("=== PYTHON CODE DATASET ===")
print(f"Total characters: {len(python_text):,}")
print(f"Unique characters: {len(set(python_text))}")
```

```python
# -------------------------------------------------------
# COMBINE AND TOKENIZE
#
# We concatenate Shakespeare and Python code with a separator.
# The separator is a visible divider so the model learns
# that these are different domains.
# -------------------------------------------------------

# Separator between domains
# Using === makes it visually distinct and creates a unique pattern
separator = "\n\n" + "=" * 60 + "\n" + "# PYTHON CODE\n" + "=" * 60 + "\n\n"

# Combined text
combined_text = shakespeare_text + separator + python_text

print("=== COMBINED DATASET ===")
print(f"Shakespeare: {len(shakespeare_text):,} characters")
print(f"Python code: {len(python_text):,} characters")
print(f"Combined:    {len(combined_text):,} characters")
print()

# Build tokenizer on the combined text
# The vocabulary must include ALL characters from both domains
tokenizer_final = CharTokenizer()
tokenizer_final.build_vocab(combined_text)

print()
print("Characters that are in Python but not Shakespeare:")
shak_chars = set(shakespeare_text)
code_chars  = set(python_text)
code_only   = code_chars - shak_chars
print(f"  {sorted(code_only)}")
print()
print("These characters (like _, #, [, ]) appear in code but not prose.")
print("The model will learn their context from the Python section.")
```

```python
# -------------------------------------------------------
# ENCODE THE FULL DATASET
# -------------------------------------------------------

# Encode the entire combined text as a sequence of integers
# This is what we feed to the model during training
print("Encoding full dataset...")
all_ids = tokenizer_final.encode(combined_text)

print(f"Total tokens: {len(all_ids):,}")
print(f"First 50 tokens: {all_ids[:50]}")
print(f"Decoded back: {repr(tokenizer_final.decode(all_ids[:50]))}")
print()

# Verify the roundtrip works perfectly
sample_text  = combined_text[:1000]
sample_ids   = tokenizer_final.encode(sample_text)
sample_back  = tokenizer_final.decode(sample_ids)
roundtrip_ok = sample_text == sample_back
print(f"Roundtrip check (1000 chars): {'PASSED' if roundtrip_ok else 'FAILED'}")
```

```python
# -------------------------------------------------------
# TRAIN / VALIDATION SPLIT
#
# We split 90% for training, 10% for validation.
#
# Important: we use a SEQUENTIAL split, not a random split.
# Why?
#
# Random split would leak future information.
# Example: if we randomly place "HAMLET:\nTo be" in training
# and "or not to be" in validation, the model has effectively
# seen both sides of the split during training.
#
# Sequential split: train on the first 90% of the text,
# validate on the last 10%. More honest evaluation.
# -------------------------------------------------------

import torch

# Convert to PyTorch tensor for easy slicing and model feeding
data = torch.tensor(all_ids, dtype=torch.long)

# 90% / 10% split
n_train = int(0.9 * len(data))
n_val   = len(data) - n_train

train_data = data[:n_train]
val_data   = data[n_train:]

print("=== DATASET SPLIT ===")
print(f"Total tokens:      {len(data):,}")
print(f"Training tokens:   {len(train_data):,}  ({100*len(train_data)/len(data):.0f}%)")
print(f"Validation tokens: {len(val_data):,}    ({100*len(val_data)/len(data):.0f}%)")
print()

# Save everything we need for training
torch.save(train_data, 'train_data.pt')
torch.save(val_data,   'val_data.pt')
with open('tokenizer.pkl', 'wb') as f:
    pickle.dump({
        'char_to_id': tokenizer_final.char_to_id,
        'id_to_char': tokenizer_final.id_to_char,
        'vocab_size':  tokenizer_final.vocab_size,
    }, f)

print("Saved files:")
print("  train_data.pt  — training token IDs")
print("  val_data.pt    — validation token IDs")
print("  tokenizer.pkl  — vocabulary mappings")
print()
print("These are loaded in module 08 (training loop) and beyond.")
```

```python
# -------------------------------------------------------
# INSPECT TRAINING EXAMPLES
#
# Let us look at what the model actually sees during training.
#
# The language modeling objective is:
# Given tokens at positions [0...t-1], predict the token at position t.
#
# We pack this into (input, target) pairs where:
#   input  = tokens at positions [0, 1, ..., T-1]
#   target = tokens at positions [1, 2, ..., T]
#
# So target[i] is always the next token after input[i].
# The model sees input and must predict target.
# -------------------------------------------------------

block_size = 32   # how many tokens we look at at once (we use 128 for training)

print("=== WHAT THE MODEL SEES DURING TRAINING ===")
print()
print(f"Block size: {block_size} tokens")
print("At each position, the model predicts the next token.")
print()

# Sample from the Shakespeare part (beginning of training data)
sample_start = 1000   # skip the very beginning
x = train_data[sample_start     : sample_start + block_size]     # input
y = train_data[sample_start + 1 : sample_start + block_size + 1] # target

print("Input sequence (what the model reads):")
print(f"  {repr(tokenizer_final.decode(x.tolist()))}")
print()
print("Target sequence (what the model must predict):")
print(f"  {repr(tokenizer_final.decode(y.tolist()))}")
print()
print("Position-by-position (input → what to predict):")
for i in range(8):
    in_char  = tokenizer_final.decode([x[i].item()])
    out_char = tokenizer_final.decode([y[i].item()])
    context  = tokenizer_final.decode(x[:i+1].tolist())
    print(f"  After {repr(context[-10:]):15s}  predict: {repr(out_char)}")
print()
print("One sequence of length 32 gives us 32 training examples.")
print("We process 32 sequences at once (a batch).")
print("So each training step uses 32 × 32 = 1024 examples.")
```

---

## PART 3 — Building BPE From Scratch

---

### 3.1 The BPE Algorithm Explained

BPE was originally a text compression algorithm.
Applied to tokenization:

**Training phase:**
1. Start: represent every word as a sequence of characters
   "low" → ['l', 'o', 'w']
   "lower" → ['l', 'o', 'w', 'e', 'r']

2. Count how often each adjacent pair appears across all words
   ('l', 'o') appears: however many times 'lo' starts a word
   ('o', 'w') appears: however many times 'ow' appears in a word

3. Find the most frequent pair. Merge it into a new single token.
   If ('e', 's') is most frequent: merge to 'es'
   Now "lowers" → ['l', 'o', 'w', 'es', 't']

4. Add the new token 'es' to the vocabulary.

5. Repeat from step 2 until vocabulary reaches the target size.

**Encoding phase (using trained BPE on new text):**
Apply the merge rules IN THE SAME ORDER they were learned.
This is critical — the order determines the tokenization.

---

### 3.2 Code: BPE From Scratch

```python
# -------------------------------------------------------
# BPE TOKENIZER — BUILT FROM SCRATCH
#
# We implement the full Byte-Pair Encoding algorithm.
# This is what GPT, Llama, and every major LLM uses.
#
# After building this, when you load a HuggingFace tokenizer,
# you will know exactly what it is doing internally.
# -------------------------------------------------------

class BPETokenizer:
    """
    Byte-Pair Encoding tokenizer, built completely from scratch.
    
    Training: learns merge rules from corpus.
    Encoding: applies merge rules to new text.
    Decoding: converts token IDs back to text.
    """
    
    def __init__(self):
        # The merge rules, in the order they were learned.
        # Each rule is: ((token_a, token_b), merged_token)
        # When encoding, we apply these rules in this order.
        self.merges = []
        
        # The vocabulary: maps token string → integer ID
        self.vocab = {}
        
        # Reverse vocabulary: maps integer ID → token string
        self.id_to_token = {}
        
        self.vocab_size = 0
    
    def _get_pair_counts(self, tokenized_words):
        """
        Count all adjacent token pairs across all words.
        
        tokenized_words: dict mapping (tuple of tokens) → word_frequency
        Example: {('l', 'o', 'w', '</w>'): 5, ('h', 'i', '</w>'): 3}
        
        Returns: Counter mapping (token_a, token_b) → total_count
        
        The </w> is a special "end of word" marker.
        It tells the tokenizer where word boundaries are.
        """
        pair_counts = Counter()
        
        for word_tokens, word_frequency in tokenized_words.items():
            # word_tokens is a tuple like ('l', 'o', 'w', '</w>')
            # We count each adjacent pair in this word,
            # weighted by how often this word appears
            for i in range(len(word_tokens) - 1):
                pair = (word_tokens[i], word_tokens[i + 1])
                pair_counts[pair] += word_frequency
        
        return pair_counts
    
    def _apply_merge(self, pair_to_merge, tokenized_words):
        """
        Merge all occurrences of pair_to_merge in tokenized_words.
        
        pair_to_merge: a tuple (token_a, token_b) to merge
        tokenized_words: the current state of the vocabulary
        
        Returns: new tokenized_words with all occurrences merged.
        
        Example:
          pair_to_merge = ('l', 'o')
          ('l', 'o', 'w') → ('lo', 'w')
          ('l', 'o', 'w', 'e', 'r') → ('lo', 'w', 'e', 'r')
        """
        merged_token      = pair_to_merge[0] + pair_to_merge[1]
        new_tokenized     = {}
        
        for word_tokens, word_frequency in tokenized_words.items():
            # Scan through word_tokens looking for pair_to_merge
            new_tokens = []
            i = 0
            while i < len(word_tokens):
                # Check if the current and next token form our target pair
                is_pair = (
                    i < len(word_tokens) - 1 and
                    word_tokens[i]     == pair_to_merge[0] and
                    word_tokens[i + 1] == pair_to_merge[1]
                )
                
                if is_pair:
                    # Replace the two tokens with the merged token
                    new_tokens.append(merged_token)
                    i += 2   # skip both tokens of the pair
                else:
                    # Keep this token unchanged
                    new_tokens.append(word_tokens[i])
                    i += 1
            
            new_tokenized[tuple(new_tokens)] = word_frequency
        
        return new_tokenized
    
    def train(self, text, target_vocab_size):
        """
        Learn BPE merges from text until vocabulary reaches target_vocab_size.
        
        Steps:
        1. Count word frequencies in the text
        2. Represent each word as a tuple of characters + </w>
        3. Repeatedly find and merge the most frequent adjacent pair
        4. Stop when we reach target_vocab_size
        """
        print(f"Training BPE tokenizer (target size: {target_vocab_size})")
        
        # Step 1: Count word frequencies
        # We split on whitespace to get words
        word_freq = Counter(text.split())
        
        # Step 2: Represent each word as characters + end-of-word marker
        # The </w> marker tells us where words end after tokenization.
        # This is important because 'er' at the end of a word ('lower')
        # is different from 'er' in the middle ('first').
        tokenized_words = {}
        for word, freq in word_freq.items():
            # Split word into characters, add end-of-word marker
            char_tuple = tuple(list(word) + ['</w>'])
            tokenized_words[char_tuple] = freq
        
        # Initial vocabulary: all unique characters (including </w>)
        initial_vocab = set()
        for word_tokens in tokenized_words:
            initial_vocab.update(word_tokens)
        
        current_vocab = sorted(initial_vocab)
        print(f"Initial vocabulary ({len(current_vocab)} tokens): "
              f"{current_vocab[:15]}...")
        
        # Assign IDs to initial vocabulary
        for i, token in enumerate(current_vocab):
            self.vocab[token]        = i
            self.id_to_token[i]      = token
        
        # Step 3: Merge until we reach target vocabulary size
        num_merges_needed = target_vocab_size - len(current_vocab)
        
        for merge_step in range(num_merges_needed):
            # Count all adjacent pairs
            pair_counts = self._get_pair_counts(tokenized_words)
            
            if not pair_counts:
                print("No more pairs to merge. Stopping early.")
                break
            
            # Find the most frequent pair
            best_pair  = max(pair_counts, key=pair_counts.get)
            best_count = pair_counts[best_pair]
            
            if best_count < 2:
                # No pair appears more than once — not worth merging
                print(f"All remaining pairs appear only once. Stopping at step {merge_step}.")
                break
            
            # Merge this pair everywhere
            tokenized_words = self._apply_merge(best_pair, tokenized_words)
            
            # Create the merged token and add to vocabulary
            merged_token = best_pair[0] + best_pair[1]
            new_id       = len(self.vocab)
            
            self.vocab[merged_token]      = new_id
            self.id_to_token[new_id]      = merged_token
            self.merges.append((best_pair, merged_token))
            
            # Print progress for first few merges so you can see what is happening
            if merge_step < 8 or merge_step % 100 == 0:
                print(f"  Merge {merge_step + 1:4d}: {best_pair[0]!r} + {best_pair[1]!r}"
                      f" → {merged_token!r}  (appeared {best_count} times)")
        
        self.vocab_size = len(self.vocab)
        print(f"\nFinal vocabulary size: {self.vocab_size}")
        print(f"Learned {len(self.merges)} merge rules")
    
    def encode(self, text):
        """
        Encode text using the learned BPE vocabulary.
        
        For each word:
        1. Start with character-level tokens + </w>
        2. Apply each learned merge rule in order
        3. Look up each resulting token in the vocabulary
        """
        result = []
        
        for word in text.split():
            # Start with characters
            tokens = list(word) + ['</w>']
            
            # Apply each merge rule in the order it was learned
            for (pair_to_merge, merged_token) in self.merges:
                new_tokens = []
                i = 0
                while i < len(tokens):
                    is_pair = (
                        i < len(tokens) - 1 and
                        tokens[i]     == pair_to_merge[0] and
                        tokens[i + 1] == pair_to_merge[1]
                    )
                    if is_pair:
                        new_tokens.append(merged_token)
                        i += 2
                    else:
                        new_tokens.append(tokens[i])
                        i += 1
                tokens = new_tokens
            
            # Convert tokens to IDs
            for token in tokens:
                if token in self.vocab:
                    result.append(self.vocab[token])
                else:
                    # Unknown token: fall back to character-level
                    for char in token:
                        if char in self.vocab:
                            result.append(self.vocab[char])
        
        return result
    
    def decode(self, ids):
        """Convert token IDs back to text."""
        tokens = [self.id_to_token.get(i, '?') for i in ids]
        # Join tokens and remove end-of-word markers (replace with space)
        text   = ''.join(tokens).replace('</w>', ' ').strip()
        return text
```

```python
# -------------------------------------------------------
# TRAIN AND TEST THE BPE TOKENIZER
# -------------------------------------------------------

# Use a small sample to show the algorithm clearly
small_sample = """
the cat sat on the mat
the dog ran in the park
a cat and a dog are good animals
the quick brown fox jumps over the lazy dog
she sells seashells by the seashore
how much wood would a woodchuck chuck
""".strip() * 10   # repeat to get more statistics

print("=== BPE TOKENIZER TRAINING ===")
print()
bpe = BPETokenizer()
bpe.train(small_sample, target_vocab_size=80)

print()
print("=== BPE ENCODING EXAMPLES ===")
print()

test_words = ["the", "cat", "animals", "seashells", "woodchuck", "jumps"]
print(f"{'Word':15s}  {'BPE tokens':30s}  {'Num tokens':>10}")
for word in test_words:
    ids     = bpe.encode(word)
    tokens  = [bpe.id_to_token[i] for i in ids]
    decoded = bpe.decode(ids)
    print(f"{word:15s}  {str(tokens):30s}  {len(ids):>10}")

print()
print("Common words get merged into single tokens.")
print("Rare words stay as character-level tokens.")
print()
print("The merge rules are applied in training order.")
print("That is why 'the' becomes one token — 't'+'h' merges, then 'th'+'e' merges.")
```

```python
# -------------------------------------------------------
# COMPARE CHARACTER-LEVEL vs BPE
# Show the practical difference in sequence length
# -------------------------------------------------------

test_sentence = "the quick brown fox jumps over the lazy dog"

char_ids = tokenizer_final.encode(test_sentence)
bpe_ids  = bpe.encode(test_sentence)

print("=== CHARACTER-LEVEL vs BPE COMPARISON ===")
print(f"\nSentence: '{test_sentence}'")
print()
print(f"Character-level: {len(char_ids)} tokens")
print(f"  {char_ids[:20]}...")

print()
print(f"BPE: {len(bpe_ids)} tokens")
print(f"  {bpe_ids}")
print(f"  Decoded: {bpe.decode(bpe_ids)}")
print()
print(f"BPE uses {len(bpe_ids)/len(char_ids)*100:.0f}% as many tokens as character-level.")
print(f"Shorter sequences = less memory + faster attention computation.")
print()
print("For OUR model, we use character-level.")
print("Why? Because it is simpler and transparent.")
print("You can see every single character. Nothing is hidden.")
print("For production models, BPE would be used.")
```

---

## PART 4 — Understanding What the Tokenizer Means for Training

---

### 4.1 The Language Modeling Objective

We train the model to predict the next token given all previous tokens.

Given a sequence: `[22, 8, 47, 3, 15, 7]`
The model learns:
- Given `[22]`, predict `8`
- Given `[22, 8]`, predict `47`
- Given `[22, 8, 47]`, predict `3`
- ...

One sequence of length T gives T separate training examples.

This objective is called **unsupervised learning** because we do not need
labels — the text itself provides both the input and the correct answer.
The correct answer is always "the next character that actually appeared."

---

### 4.2 The Baseline Loss

Before any training, the model assigns equal probability to every token.
With vocab_size tokens, each has probability 1/vocab_size.

Loss = -log(1/vocab_size) = log(vocab_size)

For our vocabulary of ~72 characters:
Loss = log(72) ≈ 4.28

Perplexity = exp(4.28) ≈ 72 (equals vocab_size exactly)

This is the starting point. As training progresses, you will watch
this number drop. By the end of training, you should see perplexity
somewhere around 5-15 for our small model.

---

```python
# -------------------------------------------------------
# COMPUTE THE BASELINE LOSS
# -------------------------------------------------------

import math

vocab_sz = tokenizer_final.vocab_size
baseline_loss = math.log(vocab_sz)
baseline_ppl  = math.exp(baseline_loss)

print("=== LOSS BASELINES FOR YOUR MODEL ===")
print()
print(f"Vocabulary size: {vocab_sz}")
print()
print(f"Before any training:")
print(f"  Loss:       {baseline_loss:.4f}")
print(f"  Perplexity: {baseline_ppl:.1f}  (= vocab size, random guessing)")
print()
print(f"After training (expected for our small model):")
print(f"  Loss:       ≈ 1.5 - 2.5")
print(f"  Perplexity: ≈ 4 - 12")
print()
print(f"Perfect model (theoretical limit):")
print(f"  Loss:       ≈ 1.0 (character entropy of English + Python)")
print(f"  Perplexity: ≈ 2.7")
print()
print("The entropy (~1.0) is the theoretical minimum for a character-level model.")
print("It is the average uncertainty in what the next character is, given all history.")
print("A perfect model cannot do better than entropy — it is a fundamental limit.")
```

---

## ✅ Check Your Understanding

1. The tokenizer maps characters to integers. Why do we sort the unique
   characters before assigning IDs? What would happen if we used a random order?
   (Does it actually matter for the model?)

2. We use a SEQUENTIAL train/val split (first 90%, last 10%).
   Why not random? Give a specific example of how random splitting
   could leak information.

3. A sequence of 128 tokens gives the model 128 training examples
   (predicting each next token). How many total training examples
   do we get from train_data of 900,000 tokens with block_size=128?
   Is this the right way to count?

4. The BPE merge rules must be applied in the SAME ORDER during encoding
   as they were learned during training. Why? Give an example of what
   goes wrong if you apply them in a different order.

5. We add '</w>' at the end of each word in BPE. What would happen
   if we did not use this marker? (Hint: think about 'lower' and 'low'
   sharing the token 'low' — is that the right behavior?)

---

## 🧪 Experiments

**Experiment 1: Vocabulary analysis**
Count how many times each character appears in the training data.
Which character is most common? Least common?
Compute the entropy of the character distribution.
This is the theoretical minimum loss for your model.

**Experiment 2: Sequence length**
Take a sentence of your choice (50-100 characters).
Encode it with the character tokenizer.
How many tokens is it?
If you had a BPE tokenizer with 1000-token vocabulary,
estimate how many tokens the same sentence would be.
(Approximately 3-4 characters per BPE token for English text.)

**Experiment 3: What cannot be encoded?**
Try to encode a string that contains characters not in the training text.
For example, encode a Chinese character or an emoji.
What error do you get?
How would you handle this in a production tokenizer?
(Hint: BPE can be built on bytes rather than characters — "byte-level BPE".)

**Experiment 4: BPE vocabulary growth**
Train BPE with target vocab sizes of 50, 100, 200, 500.
For each, compute the average tokens per word on the test sentence.
Plot: vocab_size vs average_tokens_per_word.
What does the curve look like? Is there a point of diminishing returns?

**Experiment 5: Verify the baseline**
Load train_data.pt. Pick 100 random positions.
For each position, pretend the model predicts uniform probability (1/vocab_size).
Compute the cross-entropy loss at each position.
Average them. Does the average equal log(vocab_size)?

---

> When you are done with all experiments, move to Module 04.
> We build the embedding layer — the bridge from integer IDs to vectors.
> Then we derive and build attention from scratch.
