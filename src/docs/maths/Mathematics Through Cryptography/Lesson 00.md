# Lesson 00 — Hiding a Message

## What You Will Build

A Caesar cipher: a program that takes any message and shifts every letter
forward by a fixed number of positions, producing scrambled text that cannot
be read without knowing the shift. You will build an encoder, a decoder,
and run them together to confirm the decoder recovers the original message.

By the end of this lesson you have working, runnable code. You will also
hit a bug on the last run. That bug is not a mistake in the lesson —
it is the question that Lesson 01 exists to answer.

---

## What You Need To Know First

This is the first lesson. The only prerequisite is basic algebra:
variables, substituting a value for a symbol, the idea that a function
takes inputs and produces an output.

Every Python construct used here is explained at the moment it appears.

---

## Before You Write Code — Set Up Git

Git is a version control system. It records the history of every change
you make to your code. If you break something, you can return to any
earlier state. If you want to understand your own work six months from now,
the history tells you why each change was made.

You will use git for every lesson in this curriculum. The setup is one-time.

Run these commands in your terminal — the program you type commands into,
separate from the code editor. Each line is a separate command:

```bash
git init crypto-math
cd crypto-math
```

**What these do:**

`git` is the version control program. `init` is a subcommand — an instruction
to git telling it what to do. `git init crypto-math` creates a new folder
called `crypto-math` and initialises it as a git repository, meaning git
will now track every file you create or change inside it.

`cd crypto-math` moves your terminal into that folder. `cd` stands for
"change directory" — directory is the technical term for folder.

You will not need to use git again until the Definition of Done at the
end of this lesson, where the full commit workflow is explained.

---

## The Lesson

### The Idea: Shift Every Letter

In 50 BCE, Julius Caesar sent military orders across the Roman Empire.
If a messenger was captured, the orders would be read. His solution
was simple: shift every letter in the message three positions forward
in the alphabet.

```
A → D    H → K
B → E    E → H
C → F    L → O
...      L → O
         O → R
```

HELLO becomes KHOOR.

A captured message was meaningless without knowing the shift.
Only the recipient — who knew the shift was 3 — could reverse it.

This is the **Caesar cipher**. It is the simplest cipher that contains
every structural idea modern cryptography is built from:

- A **message** — what you want to send
- A **key** — the secret that controls the transformation (here, the number 3)
- An **encoding function** — uses the key to scramble the message
- A **decoding function** — uses the same key to unscramble it

Build the visible result first. Before computing anything, establish
what the output should look like.

---

### The Output

**The problem:** we want to see what a Caesar-encoded message looks like
before we know how to compute it.

```python
message = "HELLO"
encoded = "KHOOR"

print("Original:", message)
print("Encoded: ", encoded)
```

Run this. You should see:

```
Original: HELLO
Encoded:  KHOOR
```

**Walkthrough:** `message` and `encoded` are variables — names that hold
values, exactly as in algebra. The values they hold are strings: sequences
of characters enclosed in quotes. `print()` is a Python built-in function
that writes its arguments to the console. Multiple arguments are separated
by commas and printed with a space between them.

**CS lens:** this is output — the visible end state of what we are building.
Nothing computes anything yet. The encoded string is hardcoded. This is
intentional: the contract for this curriculum is to build the visible result
first, then build the machinery that produces it. Every line of code written
after this block has one job — replace `"KHOOR"` with a computed value.

**SE lens:** starting with hardcoded output creates a target. Without it,
it is easy to build internal machinery and lose track of what it is for.
The hardcoded string is also the first test: when the encoder is written,
you will know it is correct because it produces exactly this output.

---

### Characters Are Numbers

To shift a letter, the program needs to treat it as a number.
Every character stored in a computer already is one.

**The problem:** how does Python shift `'H'` to `'K'`? It needs a way
to convert between characters and numbers.

```python
print(ord('H'))
print(chr(75))
print(ord('A'))
print(ord('Z'))
```

Run this. You should see:

```
72
K
65
90
```

**Walkthrough:** `ord()` is a Python built-in that takes a single character
and returns its **Unicode code point** — the integer that uniquely identifies
that character in the Unicode standard, which assigns a number to every
character in every human writing system. `chr()` is the inverse: it takes
an integer and returns the character at that code point.

`'H'` is code point 72. `chr(75)` is `'K'`. The uppercase letters A through Z
occupy code points 65 through 90 — 26 consecutive integers, one per letter.
Shifting a letter by 3 means adding 3 to its code point.

**CS lens:** the mapping from characters to integers is called a
**character encoding**. Unicode is the modern standard; the A–Z portion
is inherited from ASCII (American Standard Code for Information Interchange),
defined in 1963. When you shift a letter, you are doing integer arithmetic
on its code point. The cipher is arithmetic, not magic.

**SE lens:** `ord()` and `chr()` are the interface between the human concept
of a "letter" and the integer arithmetic the shift needs. Using the built-in
encoding means the program does not need its own mapping table — and the
built-in is correct and well-tested by everyone who uses Python.

---

### Shifting One Character

**The problem:** given one character and a shift amount, compute the result.

```python
character = 'H'
shift = 3

character_number = ord(character)
shifted_number = character_number + shift
shifted_character = chr(shifted_number)

print(f"'{character}' shifted by {shift} is '{shifted_character}'")
```

Run this. You should see:

```
'H' shifted by 3 is 'K'
```

**Walkthrough:** `ord('H')` returns 72. Adding `shift` (3) gives 75.
`chr(75)` returns `'K'`. The `f"..."` on the last line is an **f-string**
— a Python string prefixed with `f` that evaluates any expression inside
curly braces `{}` and inserts the result directly into the string.
`{character}` becomes `H`, `{shift}` becomes `3`, `{shifted_character}`
becomes `K`.

**CS lens:** this is a **pure function** in the mathematical sense —
the output depends only on the inputs, with no other effects. Given the
same character and shift, it always returns the same result. Pure functions
are the easiest code to test: no state to track, no order of operations
to worry about, just input and output.

**SE lens:** `character_number` and `shifted_number` are named intermediate
values rather than writing `chr(ord(character) + shift)` in one line.
The nested version is technically equivalent but forces the reader to
parse the nesting to understand what is happening. Named intermediates
make each step readable on its own. Readable code is not a preference —
it is the difference between code you can debug and code you cannot.

---

### Encoding a Full Message

**The problem:** apply the shift to every character in a message.

```python
def encode(message, shift):
    encoded_message = ""
    for character in message:
        shifted_character = chr(ord(character) + shift)
        encoded_message = encoded_message + shifted_character
    return encoded_message

print(encode("HELLO", 3))
```

Run this. You should see:

```
KHOOR
```

This matches the hardcoded string from the first code block.
The computation now produces what you hardcoded before.

**Walkthrough:** `def encode(message, shift):` defines a function named
`encode` that accepts two **parameters**: the message to encode and the
shift amount. Parameters are the named slots a function expects to receive
values through — `message` and `shift` here work exactly like variables,
but their values come from whoever calls the function.

`encoded_message = ""` starts with an empty string — a string containing
no characters. `for character in message:` iterates over the string:
Python strings are sequences, and a `for` loop over a sequence visits
each element in order, left to right. On each iteration, `character`
holds the current letter. After shifting it, `encoded_message + shifted_character`
concatenates — joins end to end — the accumulated result with the new
character. `return encoded_message` sends the completed string back to
the caller when the loop finishes.

**CS lens:** this is a **linear scan** — the loop visits every character
exactly once. The encoded message is built by **accumulation**: starting
empty and extending it one character at a time. The time this takes grows
linearly with the length of the message. A message twice as long takes
twice as long to encode.

**SE lens:** the function takes `message` and `shift` as parameters rather
than hardcoding the shift as 3. This is **parametric design**: the function
is general — it encodes any message with any shift. If the shift were
hardcoded inside the function, the function would be unusable for any
other key. Parameters are how functions stay reusable.

---

### Decoding

Encoding is only useful if the recipient can reverse it.

**The problem:** given an encoded message and the same shift, recover
the original.

```python
def decode(encoded_message, shift):
    decoded_message = ""
    for character in encoded_message:
        original_character = chr(ord(character) - shift)
        decoded_message = decoded_message + original_character
    return decoded_message

encoded = encode("HELLO", 3)
decoded = decode(encoded, 3)

print("Encoded:", encoded)
print("Decoded:", decoded)
```

Run this. You should see:

```
Encoded: KHOOR
Decoded: HELLO
```

**Walkthrough:** `decode` is structurally identical to `encode` with one
difference: it subtracts the shift instead of adding it. `ord('K')` is 75.
Subtracting 3 gives 72. `chr(72)` is `'H'`. Each letter is shifted back
by the same amount it was shifted forward.

**CS lens:** `encode` and `decode` are **inverse functions** — applying
one then the other returns the original input. In mathematical notation:
`decode(encode(message, key), key) = message` for any message and key.
Every cipher must have this property, or decryption is impossible.

**SE lens:** `decode` is a separate function from `encode` rather than
a single function with a "direction" parameter. A single function with
two modes is harder to test and harder to read than two functions with
one job each. This is the **single responsibility principle**: each
function does exactly one thing. `encode` encodes. `decode` decodes.
Neither does anything else.

---

### The Bug

Try a message that ends near the end of the alphabet.

```python
print(encode("XYZ", 3))
```

Run this. You should see:

```
[\]
```

**Walkthrough:** `ord('X')` is 88. Adding 3 gives 91. `chr(91)` is `[` —
a bracket, not a letter. The uppercase letters end at `'Z'` (code point 90).
Adding 3 pushes past the end of the alphabet into punctuation characters.
The shift does not wrap around.

A real Caesar cipher wraps: X shifts to A, Y to B, Z to C.
The alphabet is a wheel, not a line. Shifting past Z should return to A.

Fixing this requires a mathematical idea that has not appeared yet:
arithmetic on a number line that wraps at a fixed boundary.

That is **modular arithmetic**. That is Lesson 01.

---

## Connect the Pieces

`encode` and `decode` are a pair. Neither is useful without the other.
Together they define the Caesar cipher completely — except for the bug.

The relationship between them is the first instance of a pattern that
runs through every lesson in this curriculum: **encryption and decryption
are inverse operations**. RSA, AES, ECDH — all of them are pairs of
functions with this property. You are learning the shape of all of them.

The bug is also a pattern. Cryptography is full of edge cases where
a naive implementation produces wrong or insecure output for a subset
of inputs. The edge cases are not incidental — they are where the
mathematics lives. Every fix to a cryptographic bug in this curriculum
introduces a mathematical concept.

---

## What Breaks Without This

Remove the `return` statement from `encode`:

```python
def encode(message, shift):
    encoded_message = ""
    for character in message:
        shifted_character = chr(ord(character) + shift)
        encoded_message = encoded_message + shifted_character
    # return statement removed
```

Run:

```python
result = encode("HELLO", 3)
print(result)
```

You will see:

```
None
```

**What happened:** Python functions that do not explicitly return a value
return `None` — a special value meaning "nothing here." The encoded
message was computed correctly, accumulated in `encoded_message`, and
then silently discarded when the function ended without returning it.
No error is raised. The bug is invisible until you inspect the output.

This is one of the most common bugs in Python: the function ran,
the computation was correct, and the result was lost. The fix is always
the same — add `return`.

---

## Definition of Done

Verify each item before moving to Lesson 01:

- [ ] `encode("HELLO", 3)` prints `KHOOR`
- [ ] `decode("KHOOR", 3)` prints `HELLO`
- [ ] `decode(encode("ATTACK AT DAWN", 7), 7)` prints `ATTACK AT DAWN`
- [ ] `encode("XYZ", 3)` prints `[\]` — you can see the bug
- [ ] You can explain in your own words why `chr(ord(character) + shift)` shifts the letter
- [ ] You can explain why `decode` subtracts instead of adds
- [ ] You can explain what `None` is and why removing `return` produces it

**Commit your work:**

```bash
git add lesson-00.py
git commit -m "Lesson 00: Caesar cipher encode and decode

Build encode and decode functions for a Caesar cipher.
Establishes the core pattern of the curriculum: a key, an encoding
function, and its inverse. Exposes the wrapping bug that Lesson 01
fixes with modular arithmetic."
```

**The commit command explained:**

`git add lesson-00.py` stages the file — tells git to include this file
in the next commit. A file can be changed without being staged; staging
is the step where you choose which changes to record.

`git commit -m "..."` records a permanent snapshot of all staged files.
The `-m` flag provides the commit message inline. The message has two
parts: a short summary on the first line (what changed), and a longer
explanation after a blank line (why it matters and what it connects to).
The summary describes what files changed — git records that automatically.
The explanation is for your future self, six months from now, reading
the history and trying to understand why this code exists.
