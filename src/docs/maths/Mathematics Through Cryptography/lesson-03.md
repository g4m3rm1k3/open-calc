# Lesson 03 — Breaking the Caesar Cipher

## What You Will Build

An automated Caesar breaker: a program that decrypts a Caesar-encoded
message without knowing the key, using only the statistical patterns
of the English language. You will build a frequency chart using matplotlib
that shows *why* the attack works — the shape of letter frequencies is
preserved by the cipher.

By the end of this lesson you have broken the first cipher in the
curriculum. More importantly, you understand *why* it breaks —
a structural reason that rules out a whole family of ciphers.

---

## What You Need To Know First

- Lesson 00: `encode`, `decode`
- Lesson 01: `shift_character`, modular arithmetic
- Lesson 02: key space, brute force

---

## The Lesson

### The Shape of English

Every language has a fingerprint. In English, the letter `E` appears in
roughly 13% of all text. `T` appears in about 9%. `A`, `O`, `I`, `N`,
`S`, `H`, `R` follow. `Z`, `Q`, `X` are rare.

The Caesar cipher shifts every letter by the same amount. It does not
change *which* letters appear often and which appear rarely — it only
changes *which letter is which*. If `E` appears 13% of the time in the
plaintext, then whatever letter `E` encrypted to will appear 13% of the
time in the ciphertext.

This is the attack: find the most common letter in the ciphertext,
assume it is encrypted `E`, and the shift is the distance between
`E` and that letter.

---

### Counting Letter Frequencies

**The problem:** given a ciphertext, count how often each letter appears.

```python
def count_frequencies(text):
    frequency_counts = {}
    for character in text.upper():
        if character.isalpha():
            if character not in frequency_counts:
                frequency_counts[character] = 0
            frequency_counts[character] = frequency_counts[character] + 1
    return frequency_counts

sample = "KHOOR ZRUOG"
counts = count_frequencies(sample)
print(counts)
```

Run this. You should see a dictionary mapping each letter to its count.

```
{'K': 1, 'H': 1, 'O': 2, 'R': 2, 'Z': 1, 'U': 1, 'G': 1}
```

**Walkthrough:** `frequency_counts = {}` creates an empty **dictionary** —
a Python data structure that maps keys to values. Here the keys will be
letters (`'K'`, `'H'`, etc.) and the values will be integer counts.
`text.upper()` converts the input to uppercase so that `'a'` and `'A'`
are counted together — `.upper()` is a string method that returns a new
string with all characters converted to uppercase.

`character.isalpha()` returns `True` if the character is a letter and
`False` otherwise — spaces, punctuation, and digits are skipped.
`if character not in frequency_counts:` checks whether the letter has
been seen before. If not, `frequency_counts[character] = 0` initialises
its count to zero before incrementing.

**CS lens:** `frequency_counts` is a **hash map** (Python calls it a
dictionary): a data structure that maps keys to values in O(1) time —
looking up whether a letter has been seen and retrieving its count both
happen in constant time regardless of how many letters the dictionary
contains. Inside Python, the dictionary hashes the key (converts it to
an integer index) to locate its storage slot directly, without searching.
Hash maps are one of the most important data structures in computing —
you will use them in every module of this curriculum.

**SE lens:** the function returns the raw counts rather than computing
the percentages internally. This separates two concerns: counting (what
this function does) and interpreting (what the caller does). If the caller
wants percentages, it can compute them. If it wants raw counts, it has them.
A function that returns raw data is more reusable than one that commits
to a specific interpretation.

---

### Converting to Percentages

**The problem:** convert raw counts to percentages so ciphertexts of
different lengths can be compared.

```python
def counts_to_percentages(frequency_counts):
    total_letters = sum(frequency_counts.values())
    percentages = {}
    for letter, count in frequency_counts.items():
        percentages[letter] = (count / total_letters) * 100
    return percentages

counts = count_frequencies("KHOOR ZRUOG")
percentages = counts_to_percentages(counts)
for letter, percentage in sorted(percentages.items(), key=lambda item: item[1], reverse=True):
    print(f"  {letter}: {percentage:.1f}%")
```

Run this. You should see each letter with its percentage, sorted highest first.

**Walkthrough:** `frequency_counts.values()` returns all the count values
from the dictionary (without the letter keys). `sum(...)` adds them to
get the total. For each `letter, count` pair from `frequency_counts.items()`
— which returns each key-value pair as a tuple — the percentage is
`count / total * 100`.

`sorted(..., key=lambda item: item[1], reverse=True)` sorts the items
by their percentage value in descending order. `lambda item: item[1]`
is an **anonymous function** — a function with no name, written inline.
`item` is a `(letter, percentage)` tuple; `item[1]` is the percentage.
`lambda` is explained fully here because this is its first appearance:
`lambda parameters: expression` creates a function that takes `parameters`
and returns `expression`. It is shorthand for:

```python
def get_percentage(item):
    return item[1]
```

Both are equivalent. `lambda` is used when the function is short and
does not need a name.

**CS lens:** sorting by frequency and scanning for the peak is an
O(n log n) operation — the cost of sorting a list of n items. For the
26 letters of the English alphabet, n is always 26 regardless of the
message length. This means the frequency analysis step takes constant
time as far as the alphabet size is concerned. The counting step is O(m)
where m is the length of the message — each character is visited once.

**SE lens:** `counts_to_percentages` takes a dictionary and returns a
dictionary of the same shape. The input and output types match.
Functions that transform data of one shape into the same shape are easy
to chain — the output of one is a valid input to another.

---

### Visualising the Frequencies

The attack is easier to understand visually. Plotting the ciphertext
frequencies next to the known English frequencies shows the shift as
a horizontal displacement between two bar charts with the same shape.

```python
import matplotlib.pyplot as plt

ENGLISH_FREQUENCIES = {
    'A': 8.17, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.70,
    'F': 2.23, 'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15,
    'K': 0.77, 'L': 4.03, 'M': 2.41, 'N': 6.75, 'O': 7.51,
    'P': 1.93, 'Q': 0.10, 'R': 5.99, 'S': 6.33, 'T': 9.06,
    'U': 2.76, 'V': 0.98, 'W': 2.36, 'X': 0.15, 'Y': 1.97,
    'Z': 0.07
}

def plot_frequency_comparison(ciphertext):
    alphabet = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

    cipher_counts = count_frequencies(ciphertext)
    cipher_percentages = counts_to_percentages(cipher_counts)
    cipher_values = [cipher_percentages.get(letter, 0) for letter in alphabet]
    english_values = [ENGLISH_FREQUENCIES[letter] for letter in alphabet]

    fig, axes = plt.subplots(2, 1, figsize=(14, 8))

    axes[0].bar(alphabet, english_values, color='steelblue', alpha=0.8)
    axes[0].set_title("Expected: English Letter Frequencies")
    axes[0].set_ylabel("Frequency (%)")
    axes[0].set_ylim(0, 15)

    axes[1].bar(alphabet, cipher_values, color='tomato', alpha=0.8)
    axes[1].set_title(f"Observed: Letter Frequencies in Ciphertext")
    axes[1].set_ylabel("Frequency (%)")
    axes[1].set_ylim(0, 15)

    plt.tight_layout()
    plt.show()

long_ciphertext = encode(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THE DOG BARKED BACK",
    3
)
plot_frequency_comparison(long_ciphertext)
```

Run this. You will see two bar charts. The top chart shows the characteristic
spike at `E` in English. The bottom chart shows the same spike — shifted
three positions to the right, now sitting at `H`. The shape is preserved.
The shift is visible.

**Walkthrough:** `ENGLISH_FREQUENCIES` is a dictionary of known English
letter frequencies, expressed as percentages — values measured from large
corpora of English text. `cipher_percentages.get(letter, 0)` retrieves
the percentage for a letter, defaulting to 0 if the letter did not appear
in the ciphertext. `.get(key, default)` is a dictionary method that returns
`default` instead of raising an error when the key is absent.

`[cipher_percentages.get(letter, 0) for letter in alphabet]` is a list
comprehension — the same pattern from Lesson 02 — that builds a list of
26 values in alphabetical order. The order must match the alphabet list
so each bar appears above the correct letter.

**CS lens:** this visualisation reveals the **structural weakness** of
substitution ciphers: they preserve frequency information. The mathematical
term for this is that a Caesar cipher is **not diffusive** — it does not
spread the statistical properties of the plaintext across the ciphertext.
Every modern cipher is explicitly designed to destroy frequency information,
so that the ciphertext appears statistically uniform regardless of the
plaintext.

**SE lens:** `ENGLISH_FREQUENCIES` is defined as a module-level constant
with an uppercase name — Python's convention for values that are defined
once and never changed. Module-level constants are visible to every function
in the file. The uppercase name signals to any reader that this value is
fixed. The frequencies themselves are not our code — they are reference
data, measured from real text. Distinguishing data from code is a design
decision with real consequences: data can be updated without changing code.

---

### The Automated Breaker

Now that the frequency pattern is understood, the attack can be automated.

**The problem:** given a ciphertext, find the most likely key without
trying all 25.

```python
def find_key(ciphertext):
    cipher_counts = count_frequencies(ciphertext)

    most_common_letter = max(cipher_counts, key=lambda letter: cipher_counts[letter])

    assumed_plaintext_letter = 'E'
    position_of_most_common = ord(most_common_letter) - ord('A')
    position_of_e = ord(assumed_plaintext_letter) - ord('A')
    key = (position_of_most_common - position_of_e) % 26

    return key

def crack(ciphertext):
    key = find_key(ciphertext)
    plaintext = decode(ciphertext, key)
    print(f"Most likely key: {key}")
    print(f"Decrypted:       {plaintext}")
    return plaintext

long_ciphertext = encode(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THE DOG BARKED BACK",
    3
)
crack(long_ciphertext)
```

Run this. You should see:

```
Most likely key: 3
Decrypted: THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THE DOG BARKED BACK
```

**Walkthrough:** `max(cipher_counts, key=lambda letter: cipher_counts[letter])`
finds the letter with the highest count. `max()` with a `key` argument
applies that function to each element and returns the element for which
the function returns the largest value — here, the letter whose count
is highest.

`position_of_most_common - position_of_e` is the distance from `E`'s
position to the most common letter's position. If `H` is the most common
letter (position 7) and `E` is at position 4, the shift is `7 - 4 = 3`.
The `% 26` handles the case where the subtraction produces a negative
number — if the most common letter is `B` (position 1) and `E` is at
position 4, the naive calculation gives `-3`, but the correct shift is
`-3 % 26 = 23`.

**CS lens:** this is **frequency analysis** — a cryptanalytic technique
discovered by the Arab polymath Al-Kindi in the 9th century, the first
known description of breaking a cipher. The technique works because the
Caesar cipher is a **monoalphabetic substitution**: each plaintext letter
maps to exactly one ciphertext letter. Monoalphabetic substitutions always
preserve frequency distributions. Al-Kindi's insight made every
monoalphabetic cipher obsolete, 1100 years ago.

**SE lens:** `find_key` and `crack` are separate functions. `find_key`
does one thing: return the most likely key. `crack` orchestrates the
attack: find the key, decode, print. The separation means `find_key`
can be tested independently — verify it returns the right key before
verifying the decoded output is correct. When the test fails, you know
exactly which function to look at.

---

### When the Breaker Fails

**The problem:** what happens with short ciphertexts?

```python
crack(encode("HI", 3))
crack(encode("XYZ", 3))
crack(encode("EEE", 3))
```

Run this. Some of these will decrypt incorrectly.

**Walkthrough:** with very short messages, the observed letter frequencies
are dominated by chance rather than the statistical properties of English.
`"HI"` encoded is `"KL"` — two letters, each appearing once. There is no
frequency peak. `"EEE"` encoded is `"HHH"` — the most common letter is
`H`, and the attack correctly identifies the key as 3. But `"XYZ"` encoded
is `"ABC"` — the most common letter could be any of A, B, or C, and
`max()` will return whichever it encounters first, which may not be correct.

**CS lens:** frequency analysis is a **statistical attack** — it works
reliably when the sample is large enough for the underlying distribution
to manifest. A small sample may not reflect the true distribution.
The required sample size depends on the language and the number of keys:
for 26 letters and Caesar's 25 keys, roughly 100+ characters give reliable
results. This is the same principle as any statistical inference —
small samples have high variance.

**SE lens:** `crack` does not validate its input or signal uncertainty.
A production implementation would return a confidence score alongside
the key — something like "key 3 with 87% confidence." Returning a single
answer without uncertainty information misleads the caller into treating
an estimate as a fact. For the purposes of this curriculum the simple
version is correct. In Lesson 06, when the Vigenère breaker returns
key letters, each letter will carry a confidence score.

---

## Connect the Pieces

The Caesar cipher is now fully broken. The attack has two stages:
1. Count letter frequencies in the ciphertext
2. Assume the most common ciphertext letter decrypts to `E`

This works because the Caesar cipher is a monoalphabetic substitution —
one plaintext letter maps to exactly one ciphertext letter, always.

The Vigenère cipher, introduced in Lesson 04, defeats frequency analysis
by using a *different* shift for each letter position. The attack in
Lessons 05 and 06 defeats the Vigenère cipher with a more sophisticated
version of the same idea.

The pattern holds across the curriculum: each cipher defeats the attack
that broke the previous one. Each new attack exploits a structural
weakness that the cipher's designer did not fully eliminate. Modern
ciphers are designed with all known structural weaknesses removed — and
the proof that they are secure is one of the deepest results in
mathematics and computer science.

---

## What Breaks Without This

Remove the `% 26` from `find_key`:

```python
key = (position_of_most_common - position_of_e)   # no % 26
```

Now try:

```python
crack(encode("BALLOON", 7))
```

The most common letter in `"BALLOON"` encoded with shift 7 is one of
the `L`s, which encrypts to `S` (position 18). `E` is at position 4.
`18 - 4 = 14`. The correct key is 7, and `14 % 26 = 14` — so `% 26`
did not affect this case. But try:

```python
crack(encode("AARDVARK", 2))
```

With shift 2, `A` (position 0) encrypts to `C` (position 2).
`position_of_c - position_of_e = 2 - 4 = -2`. Without `% 26`, the key
is returned as `-2`, and `decode(ciphertext, -2)` will produce the wrong
output. With `% 26`, `-2 % 26 = 24`, and `decode(ciphertext, 24)` is
mathematically equivalent to `decode(ciphertext, -2)` — because shifting
forward 24 is the same as shifting backward 2 on a 26-letter wheel.

---

## Definition of Done

- [ ] `crack(encode("HELLO WORLD", 3))` prints key 3 and `HELLO WORLD`
- [ ] `crack(encode("ATTACK AT DAWN", 17))` prints key 17 and `ATTACK AT DAWN`
- [ ] The frequency chart shows the `E` spike shifted by 3 positions to `H`
- [ ] You can explain why frequency analysis works on monoalphabetic ciphers
- [ ] You can explain what Al-Kindi's attack reveals about the structure of the cipher
- [ ] You can explain why `crack("HI")` might fail and `crack` with a 100-character message will not
- [ ] You can explain what `.get(key, default)` does and why it is used instead of `dictionary[key]`

**Commit your work:**

```bash
git add lesson-03.py
git commit -m "Lesson 03: Frequency analysis breaks the Caesar cipher

Implement an automated Caesar breaker using letter frequency analysis.
The attack works because Caesar is monoalphabetic: frequency patterns
are preserved through encryption. Closes Module 0 with a broken cipher
and opens the question: what cipher defeats frequency analysis?
That question is the Vigenère cipher, starting in Lesson 04."
```

---

## Module 0 Complete

You have built a Caesar cipher, fixed its wrapping bug with modular
arithmetic, measured its key space precisely, and broken it automatically
with frequency analysis. All four lessons end with running, visible code.

The cipher is broken. The next question is: can we build one that is not?

Module 1 starts with the Vigenère cipher — the historical answer to that
question. It will also fall. The answer to *that* failure will lead to
the one-time pad, and then to everything else.
