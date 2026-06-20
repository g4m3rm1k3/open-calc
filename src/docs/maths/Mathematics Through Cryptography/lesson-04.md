# Lesson 04 — A Key That Is a Word

## What You Will Build

A Vigenère cipher: a cipher that uses a keyword instead of a single
number as its key. Each letter of the message is shifted by a different
amount, determined by the corresponding letter of the keyword.
You will build an encoder, a decoder, and a visualiser that shows
*why* this defeats the frequency analysis that broke the Caesar cipher.

By the end of this lesson `encode("HELLO WORLD", "KEY")` produces
correctly encrypted ciphertext, and a matplotlib chart shows that
the ciphertext frequency distribution is flatter than any Caesar
ciphertext — the spike at `E` has been smeared across multiple letters.

---

## What You Need To Know First

- Lesson 00: `encode`, `decode`, `shift_character`, strings
- Lesson 01: modular arithmetic, `% 26`
- Lesson 03: frequency analysis, why flat frequency distributions
  resist the Caesar breaker

Lesson 03 ended by asking: what cipher defeats frequency analysis?
The answer is any cipher that uses a *different* shift for each letter
position. The Vigenère cipher does exactly this.

---

## The Lesson

### The Problem With a Single Shift

Frequency analysis works because every `E` in the plaintext encrypts
to the same letter in the ciphertext. The cipher is **monoalphabetic**:
one plaintext letter always maps to the same ciphertext letter.

The fix is a **polyalphabetic** cipher: one where the same plaintext
letter can map to *different* ciphertext letters depending on where
it appears in the message.

The simplest way to achieve this: use a different shift for each
position. If the key is `KEY`:

- Position 0 uses shift `K` → shift 10 (K is the 11th letter, index 10)
- Position 1 uses shift `E` → shift 4
- Position 2 uses shift `Y` → shift 24
- Position 3 cycles back: shift `K` → shift 10
- Position 4 uses shift `E` → shift 4
- ...

The keyword repeats to match the length of the message.
This is the Vigenère cipher, invented in 1553 and considered
unbreakable for over 300 years.

---

### Converting a Keyword to Shifts

**The problem:** convert a keyword string into a list of shift amounts.

```python
def keyword_to_shifts(keyword):
    shifts = []
    for letter in keyword.upper():
        shift_amount = ord(letter) - ord('A')
        shifts.append(shift_amount)
    return shifts

print(keyword_to_shifts("KEY"))
print(keyword_to_shifts("SECRET"))
```

Run this. You should see:

```
[10, 4, 24]
[18, 4, 2, 17, 4, 19]
```

**Walkthrough:** `keyword.upper()` converts the keyword to uppercase so
that `"key"` and `"KEY"` produce the same shifts. For each letter,
`ord(letter) - ord('A')` converts from a letter to its position in
the alphabet: `'A'` → 0, `'B'` → 1, ..., `'Z'` → 25. This is the
same coordinate transformation from Lesson 01.

`shifts = []` creates an empty **list** — an ordered sequence of values.
`shifts.append(shift_amount)` adds `shift_amount` to the end of the list.
After the loop, `shifts` contains one integer per letter of the keyword.

**CS lens:** a list is a **dynamic array** — a sequence that grows as
elements are appended. Python manages the underlying memory automatically.
Accessing any element by its index (e.g. `shifts[0]`) takes O(1) time —
direct address lookup. Appending to the end takes amortised O(1) time.
Lists preserve insertion order, which matters here: the shifts must stay
in the same order as the keyword letters.

**SE lens:** `keyword_to_shifts` is a pure conversion function — it takes
a string and returns a list of integers, with no other effects. Separating
the conversion from the encryption means both can be tested independently.
If the encryption produces wrong output, you can verify whether the keyword
was converted correctly before looking at the encryption logic.

---

### Encoding With a Keyword

**The problem:** encode a message using a repeating keyword.

```python
def vigenere_encode(message, keyword):
    shifts = keyword_to_shifts(keyword)
    encoded_message = ""
    shift_index = 0

    for character in message.upper():
        if character.isalpha():
            current_shift = shifts[shift_index % len(shifts)]
            encoded_message = encoded_message + shift_character(character, current_shift)
            shift_index = shift_index + 1
        else:
            encoded_message = encoded_message + character

    return encoded_message

print(vigenere_encode("HELLO WORLD", "KEY"))
```

Run this. You should see:

```
RIJVS GSPVN
```

**Walkthrough:** `shifts = keyword_to_shifts(keyword)` converts the keyword
once before the loop — there is no reason to recompute it for every character.
`shift_index` tracks which keyword letter to use next, starting at 0.

`shifts[shift_index % len(shifts)]` selects the current shift. `len(shifts)`
is the number of shifts — the keyword length. `shift_index % len(shifts)`
cycles through 0, 1, 2, ..., `keyword_length - 1`, then wraps back to 0.
This is the same modular wrapping from Lesson 01, now applied to cycling
through the keyword rather than wrapping the alphabet.

`if character.isalpha():` separates letters from non-letters. Letters
are encoded and advance `shift_index`. Non-letters (spaces, punctuation)
are passed through unchanged — they do not advance the keyword position.
This means spaces in the message do not affect which keyword letter
is applied to which plaintext letter.

**CS lens:** the repeating keyword creates a **periodic function** over
the message positions. The shift at position `i` is determined entirely
by `i % keyword_length`. A function is periodic with period `p` if
`f(i) = f(i + p)` for all `i`. This periodicity is the structural
property that will allow Lesson 05 to detect the keyword length without
knowing the keyword.

**SE lens:** `shift_index` is only incremented when a letter is processed,
not for every character. This is a deliberate decision: spaces are not
part of the message content and should not consume a keyword letter.
If spaces advanced `shift_index`, the same message with and without spaces
would encrypt differently — a surprising and error-prone behaviour.
Making the choice explicit in code (the `if character.isalpha()` branch)
makes the intention clear.

---

### Decoding

**The problem:** given a Vigenère-encoded message and the keyword, recover
the original.

```python
def vigenere_decode(encoded_message, keyword):
    shifts = keyword_to_shifts(keyword)
    decoded_message = ""
    shift_index = 0

    for character in encoded_message:
        if character.isalpha():
            current_shift = shifts[shift_index % len(shifts)]
            decoded_message = decoded_message + shift_character(character, -current_shift)
            shift_index = shift_index + 1
        else:
            decoded_message = decoded_message + character

    return decoded_message

encoded = vigenere_encode("HELLO WORLD", "KEY")
decoded = vigenere_decode(encoded, "KEY")

print("Encoded:", encoded)
print("Decoded:", decoded)
```

Run this. You should see:

```
Encoded: RIJVS GSPVN
Decoded: HELLO WORLD
```

**Walkthrough:** `vigenere_decode` is structurally identical to
`vigenere_encode` with one change: `shift_character(character, -current_shift)`
applies a negative shift instead of a positive one — the same inverse
relationship as Lesson 00's `encode` and `decode`. Each letter is shifted
backward by the same amount it was shifted forward.

**CS lens:** `vigenere_encode` and `vigenere_decode` are **inverse functions**
under the keyword — the same property as the Caesar encode/decode pair,
now generalised to a sequence of shifts. The mathematical structure is
the same; the key is more complex.

**SE lens:** `vigenere_decode` could be implemented by calling
`vigenere_encode(encoded_message, inverted_keyword)` where each shift
is negated — but that would require an `invert_keyword` function and
add indirection without clarity. The direct implementation is clearer:
shift backward, one character at a time. Clarity over cleverness.

---

### Why This Defeats Frequency Analysis

Run the Caesar frequency attack from Lesson 03 on a Vigenère ciphertext
and compare the frequency distributions.

```python
import matplotlib.pyplot as plt

long_plaintext = (
    "THE VIGENERE CIPHER USES A KEYWORD TO APPLY DIFFERENT SHIFTS "
    "TO EACH LETTER OF THE MESSAGE SO THAT THE SAME PLAINTEXT LETTER "
    "CAN ENCRYPT TO DIFFERENT CIPHERTEXT LETTERS DEPENDING ON ITS "
    "POSITION THIS MAKES FREQUENCY ANALYSIS MUCH HARDER TO APPLY "
    "BECAUSE THE FREQUENCY DISTRIBUTION OF THE CIPHERTEXT IS FLATTER "
    "THAN ANY CAESAR CIPHERTEXT WOULD BE"
)

caesar_ciphertext = encode(long_plaintext, 3)
vigenere_ciphertext = vigenere_encode(long_plaintext, "KEY")

def letter_percentages(text):
    counts = count_frequencies(text)
    return counts_to_percentages(counts)

alphabet = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
caesar_values = [letter_percentages(caesar_ciphertext).get(l, 0) for l in alphabet]
vigenere_values = [letter_percentages(vigenere_ciphertext).get(l, 0) for l in alphabet]

fig, axes = plt.subplots(2, 1, figsize=(14, 8))

axes[0].bar(alphabet, caesar_values, color='tomato', alpha=0.8)
axes[0].set_title("Caesar Cipher (key=3): Frequency Distribution")
axes[0].set_ylabel("Frequency (%)")
axes[0].set_ylim(0, 15)

axes[1].bar(alphabet, vigenere_values, color='steelblue', alpha=0.8)
axes[1].set_title("Vigenère Cipher (key='KEY'): Frequency Distribution")
axes[1].set_ylabel("Frequency (%)")
axes[1].set_ylim(0, 15)

plt.tight_layout()
plt.show()
```

Run this. The top chart will show the characteristic English spike pattern —
shifted 3 positions to the right. The bottom chart will be noticeably flatter.
The spike at a single letter is gone; the frequencies are more evenly spread.

**Walkthrough:** `count_frequencies` and `counts_to_percentages` are
reused from Lesson 03 — this is the payoff of writing them as separate,
general functions. `letter_percentages.get(l, 0)` returns 0 for any
letter that did not appear in the ciphertext.

The long plaintext is split across multiple lines using Python's implicit
string concatenation inside parentheses — adjacent string literals
separated only by whitespace are automatically joined into one string.
This is a readability technique: a single string that is too long to fit
on one line can be broken into readable segments without the `+` operator.

**CS lens:** the Vigenère cipher **spreads** the frequency distribution.
Each plaintext `E` encrypts to one of three different letters (H, I, or C
for keyword `KEY`), so no single ciphertext letter dominates. The degree
of flattening depends on the keyword length: a longer keyword spreads
each plaintext letter across more ciphertext letters, producing a flatter
distribution. A keyword as long as the message and never repeated is
the one-time pad — and its frequency distribution is perfectly flat,
revealing nothing. This is what Lesson 07 will prove mathematically.

**SE lens:** `encode` (the Caesar encoder from Lesson 00) and
`vigenere_encode` are both called in this block. They coexist because
they were written with clear, distinct names and consistent interfaces —
both take a message and a key, both return a string. A function named
ambiguously (like `cipher`) would require a comment every time it was
used. Descriptive names make code self-documenting.

---

### Verifying the Cipher Is Correct

A cipher that produces wrong output is worse than no cipher —
the recipient cannot read the message and does not know why.

```python
test_cases = [
    ("HELLO WORLD", "KEY"),
    ("ATTACK AT DAWN", "LEMON"),
    ("THE QUICK BROWN FOX", "CRYPTO"),
    ("AAAA", "ABCD"),
]

print("Verifying encode/decode round trips:\n")
all_passed = True
for plaintext, keyword in test_cases:
    encoded = vigenere_encode(plaintext, keyword)
    decoded = vigenere_decode(encoded, keyword)
    passed = decoded == plaintext
    status = "PASS" if passed else "FAIL"
    print(f"  [{status}] keyword='{keyword}': '{plaintext}' → '{encoded}' → '{decoded}'")
    if not passed:
        all_passed = False

print()
print("All tests passed." if all_passed else "Some tests FAILED.")
```

Run this. Every test case should show `PASS`.

Pay attention to `("AAAA", "ABCD")` — encoding four identical letters
with keyword `ABCD` should produce four *different* ciphertext letters
(`A`, `B`, `C`, `D`), because each position uses a different shift.
This is the core property of a polyalphabetic cipher: the same plaintext
letter produces different ciphertext letters at different positions.

**Walkthrough:** `for plaintext, keyword in test_cases:` is **tuple
unpacking** — each element of `test_cases` is a two-element tuple
`(plaintext, keyword)`, and Python assigns both values in one step.
`decoded == plaintext` compares two strings and returns `True` if they
are identical, `False` otherwise. `"PASS" if passed else "FAIL"` is
a **conditional expression** (also called a ternary expression):
`value_if_true if condition else value_if_false`. It is equivalent to:

```python
if passed:
    status = "PASS"
else:
    status = "FAIL"
```

The conditional expression is used here because the result is a value
being assigned — a single expression is cleaner than a four-line block.

**CS lens:** this is a **round-trip test** — verify that
`decode(encode(message, key), key) == message` for a range of inputs.
Round-trip tests are the minimum test for any codec (encoder/decoder pair).
They do not prove the cipher is secure — a cipher that always returns
the empty string would pass a round-trip test — but they prove the
mathematical inverse property holds. Later lessons add tests that verify
the *output* of encoding, not just that decoding recovers the input.

**SE lens:** testing with a *known* case like `("AAAA", "ABCD")`
is deliberate. An all-identical plaintext with an all-different keyword
stresses the polyalphabetic property specifically. Good tests target
the properties you care about, not just arbitrary inputs. The test cases
were chosen to exercise: a message with spaces, a longer keyword,
a keyword longer than the message word boundaries, and the identical-input case.

---

## Connect the Pieces

The Vigenère cipher defeats frequency analysis by cycling through
multiple shifts. The same plaintext letter encrypts to different
ciphertext letters depending on its position.

This is a real advance. For 300 years, cryptographers believed it was
unbreakable. Charles Babbage (the inventor of the first mechanical
computer) broke it in the 1840s — and kept his method secret for
military reasons. Friedrich Kasiski published the attack independently
in 1863.

The attack works by exploiting the periodicity of the keyword.
Because the keyword repeats, positions that are a multiple of the
keyword length apart use the *same* shift — and their letter frequencies
are shifted by the same amount. Finding those positions reveals the
keyword length. Lesson 05 builds that attack.

---

## What Breaks Without This

Remove the `% len(shifts)` from the index calculation:

```python
current_shift = shifts[shift_index]   # no modular wrap
```

Now try:

```python
vigenere_encode("HELLO WORLD", "KEY")
```

You will see an `IndexError`:

```
IndexError: list index out of range
```

After three letters, `shift_index` is 3. `shifts[3]` does not exist —
`shifts` has only three elements (indices 0, 1, 2). Without the modular
wrap, the keyword does not repeat. The cipher fails on any message longer
than the keyword.

The error message tells you exactly what happened: you tried to access
an index that is outside the valid range of the list. Python list indices
run from 0 to `len(list) - 1`. Any access outside that range raises
`IndexError`. When you see this error, the first question to ask is:
"where am I computing this index, and can it ever be too large?"
`% len(shifts)` is the answer: it guarantees the index is always in range.

---

## Definition of Done

- [ ] `vigenere_encode("HELLO WORLD", "KEY")` prints `RIJVS GSPVN`
- [ ] `vigenere_decode("RIJVS GSPVN", "KEY")` prints `HELLO WORLD`
- [ ] All four round-trip tests pass
- [ ] `vigenere_encode("AAAA", "ABCD")` produces four different letters
- [ ] The frequency chart shows the Vigenère distribution is flatter than Caesar's
- [ ] You can explain why the same plaintext letter encrypts differently at different positions
- [ ] You can explain what `IndexError` means and why `% len(shifts)` prevents it
- [ ] You can explain what tuple unpacking is and rewrite `for plaintext, keyword in test_cases` without it

**Commit your work:**

```bash
git add lesson-04.py
git commit -m "Lesson 04: Vigenère cipher with repeating keyword

Implement Vigenère encode and decode using a cycling keyword.
Establishes polyalphabetic substitution: the same plaintext letter
maps to different ciphertext letters depending on position.
Frequency distribution chart shows the spike from Lesson 03 is
gone. Sets up Lesson 05: finding the keyword length from periodicity."
```
