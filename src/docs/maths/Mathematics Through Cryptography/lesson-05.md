# Lesson 05 — Finding the Key Length

## A Note on Code Blocks in This Lesson

Starting with this lesson, every code block is self-contained: it includes
every function it needs, even if that function was already written earlier
in this lesson or in a previous lesson. This means you can run any block
on its own, in any order, without first running an earlier block.

Where a function reappears unchanged, it is marked with a comment —
`# unchanged from earlier in this lesson` — and is not re-explained.
The contract's rule still applies: a concept is taught once, then referenced
by name. What changes is that the *code* is repeated so every block runs
standalone. The *teaching* is not repeated.

---

## What You Will Build

A key-length detector for the Vigenère cipher: a program that examines
a ciphertext, finds repeated patterns within it, and uses those patterns
to calculate the most likely length of the keyword — without knowing
the keyword itself. You will build a matplotlib chart that shows *why*
the calculation works: candidate key lengths "vote" based on how well
they explain the repeated patterns, and the correct length wins clearly.

By the end of this lesson, `kasiski_test(ciphertext)` returns the keyword
length of a Vigenère ciphertext it has never seen, using nothing but the
mathematics of remainders.

---

## What You Need To Know First

- Lesson 04: the Vigenère cipher repeats a keyword to produce a sequence
  of shifts. A keyword of length `k` means the shift pattern repeats
  every `k` letters.
- Lesson 01: modular arithmetic, `%` as the remainder operator.
- Lesson 03: the idea of breaking a cipher by exploiting a structural
  weakness rather than guessing.

The Vigenère cipher resists Lesson 03's frequency attack because the
ciphertext frequency distribution is flattened. But the keyword still
*repeats*, and repetition is itself a structural weakness — just a
different one. This lesson exploits it.

---

## The Lesson

### The Insight: Repeats Reveal the Period

If a sequence of plaintext letters happens to repeat somewhere later
in the message, and the distance between the two occurrences is an
exact multiple of the keyword length, then both occurrences will be
shifted by exactly the same sequence of amounts — because the keyword
has cycled back to the same starting position.

When that happens, the two occurrences encrypt to **identical ciphertext**.

This means: if you find a repeated sequence in the *ciphertext*, the
distance between the two occurrences is very likely a multiple of the
keyword length. Find enough repeats, look at all their distances, and
the keyword length is hiding in those numbers.

---

### Seeing the Repeat

**The problem:** encode a message with a repeated phrase and observe
that the ciphertext repeats too.

```python
def shift_character(character, shift):
    # unchanged from Lesson 01
    alphabet_start = ord('A')
    position = ord(character) - alphabet_start
    shifted_position = (position + shift) % 26
    return chr(shifted_position + alphabet_start)

def keyword_to_shifts(keyword):
    # unchanged from Lesson 04
    shifts = []
    for letter in keyword.upper():
        shift_amount = ord(letter) - ord('A')
        shifts.append(shift_amount)
    return shifts

def vigenere_encode(message, keyword):
    # unchanged from Lesson 04
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

plaintext = "THE SUN AND THE MOON"
ciphertext = vigenere_encode(plaintext, "KEY")

print("Plaintext: ", plaintext)
print("Ciphertext:", ciphertext)
```

Run this. You should see:

```
Plaintext:  THE SUN AND THE MOON
Ciphertext: DLC CYL KRB DLC WSMX
```

**Walkthrough:** the word `THE` appears twice in the plaintext.
Both times, it encrypts to `DLC`. Look at the ciphertext: `DLC` appears
at the start, and `DLC` appears again, fourth word in. This is not a
coincidence — it happens because the keyword `KEY` has length 3, and
counting only letters (ignoring spaces, since `vigenere_encode` does not
advance the shift index on spaces), the second `THE` begins exactly
9 letters after the first. 9 is a multiple of 3. The keyword cycle has
returned to the same phase, so the same three letters produce the same
three shifts.

**CS lens:** this is the **Kasiski examination**, named after Friedrich
Kasiski, who published it in 1863 (Charles Babbage found it earlier but
never published). It exploits **periodicity**: a repeating cipher applied
to repeating plaintext produces repeating ciphertext, with the repeat
distance constrained to be a multiple of the period. Once you know that
constraint exists, finding it is just a matter of measuring distances.

**SE lens:** this code block redefines `shift_character`, `keyword_to_shifts`,
and `vigenere_encode` in full, even though they appeared in Lessons 01
and 04. This is the self-contained convention described above. Notice the
block is longer than it would be if it just called functions assumed to
exist — that length is the cost of standalone runnability, and it is
worth paying.

---

### Finding Repeated Sequences

**The problem:** given any ciphertext, find every sequence of letters
that appears more than once, and record where.

```python
def find_repeated_sequences(text, sequence_length):
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()

    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)

    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

ciphertext = "DLC CYL KRB DLC WSMX"
repeats = find_repeated_sequences(ciphertext, 3)
print("Repeated trigrams:", repeats)
```

Run this. You should see:

```
Repeated trigrams: {'DLC': [0, 9]}
```

**Walkthrough:** `letters_only` strips spaces and punctuation, leaving
a single continuous string of letters — `"DLCCYLKRBDLCWSMX"`. The first
loop slides a window of length `sequence_length` (here, 3) across every
possible starting position. `range(len(letters_only) - sequence_length + 1)`
computes the last valid starting position: if the string has 16 letters
and the window is 3 letters wide, the last window starts at position 13
(covering positions 13, 14, 15) — `16 - 3 + 1 = 14`, so `range(14)`
produces 0 through 13. For each window, `occurrences[sequence].append(...)`
records where that exact sequence was seen.

The second loop filters down to sequences seen more than once.
`'DLC'` was seen at letter positions 0 and 9 — confirming the 9-letter
distance noted above.

**CS lens:** this is a **sliding window** algorithm — a fixed-size window
moved one position at a time across a sequence, examining the contents
at each position. Sliding windows appear constantly in string processing,
signal processing, and data streaming: anywhere a fixed-size local view
of a larger sequence is needed. The technique is O(n) in the number of
windows examined, each window taking O(`sequence_length`) to extract —
overall O(n × `sequence_length`), which for a fixed small `sequence_length`
(here, 3) is effectively O(n).

**SE lens:** `find_repeated_sequences` takes `sequence_length` as a
parameter rather than hardcoding 3. Three-letter sequences (trigrams)
are a reasonable default for the Kasiski test, but the function does not
need to know that — it just finds repeats of whatever length the caller
asks for. This separation lets later code experiment with different
window sizes without modifying this function.

---

### The Euclidean Algorithm

The distances between repeats are usually multiples of the keyword
length — but not necessarily *equal* to it. If the keyword length is 3,
distances might be 9, 15, 6, 21 — all multiples of 3, but none of them
is 3 itself. The keyword length is hiding as the **greatest common
divisor** of all the distances.

**The problem:** given two numbers, find the largest number that divides
both of them evenly.

```python
def gcd(a, b):
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a

print(gcd(12, 18))
print(gcd(9, 6))
print(gcd(48, 18))
print(gcd(17, 5))
```

Run this. You should see:

```
6
3
6
1
```

**Walkthrough:** this is the **Euclidean algorithm**, one of the oldest
algorithms in mathematics, described by Euclid around 300 BCE. It relies
on a single fact: the greatest common divisor of `a` and `b` is the same
as the greatest common divisor of `b` and `a % b`. Repeating this
shrinks the numbers until one of them reaches 0 — at that point, the
other number is the answer.

Trace `gcd(48, 18)` by hand: `a=48, b=18`. `48 % 18 = 12` (48 divided by 18
is 2 remainder 12). Now `a=18, b=12`. `18 % 12 = 6`. Now `a=12, b=6`.
`12 % 6 = 0`. Now `a=6, b=0`. The loop condition `b != 0` is false, so
the loop ends and `a` (which is 6) is returned. 6 is indeed the largest
number dividing both 48 and 18 evenly: `48 = 6 × 8` and `18 = 6 × 3`.

**CS lens:** the Euclidean algorithm runs in O(log(min(a, b))) time —
the numbers shrink by at least half every two iterations, so the loop
count grows logarithmically even for very large inputs. This is the
same algorithm, with one extra bookkeeping step, that Lesson 14 extends
into the *extended* Euclidean algorithm — the tool that makes RSA key
generation possible. The version here is the foundation; you are not
seeing it for the last time.

**SE lens:** `gcd` uses a `while` loop rather than recursion, even though
the Euclidean algorithm is often taught recursively
(`gcd(a, b) = gcd(b, a % b)`, with `gcd(a, 0) = a` as the base case).
Both are correct. The loop version avoids the overhead of repeated
function calls and is the more common implementation in performance-sensitive
code. Either is a legitimate engineering choice; this curriculum uses
loops here because the iteration is short and explicit, which makes the
walkthrough above easier to trace by hand.

---

### Computing Distances and Their GCD

**The problem:** turn a dictionary of repeated sequence positions into
a single best guess for the keyword length.

```python
def find_repeated_sequences(text, sequence_length):
    # unchanged from earlier in this lesson
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()
    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)
    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

def compute_distances(repeated_sequences):
    distances = []
    for sequence, positions in repeated_sequences.items():
        for i in range(len(positions) - 1):
            for j in range(i + 1, len(positions)):
                distance = positions[j] - positions[i]
                distances.append(distance)
    return distances

def gcd(a, b):
    # unchanged from earlier in this lesson
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a

ciphertext = "DLC CYL KRB DLC WSMX"
repeats = find_repeated_sequences(ciphertext, 3)
distances = compute_distances(repeats)
print("Distances:", distances)
```

Run this. You should see:

```
Distances: [9]
```

**Walkthrough:** `compute_distances` looks at every sequence that
repeated, and for every *pair* of positions where it occurred, records
the distance between them. The nested loop `for i in range(...)` and
`for j in range(i + 1, ...)` generates every pair without repeating a
pair in reverse order — `(positions[0], positions[1])` is recorded, but
not `(positions[1], positions[0])`, since the distance is the same
either way.

With only one repeated sequence (`'DLC'`, appearing at positions 0 and 9),
there is exactly one pair, and exactly one distance: 9. A single distance
does not yet need a GCD calculation — `gcd` becomes useful when there
are multiple distances to reconcile, which the next block demonstrates.

**CS lens:** generating all pairs from a list of `n` positions takes
O(n²) time — for each of the `n` positions, compare against the
remaining ones. For Kasiski analysis, `n` is the number of times a
specific sequence repeats, which is typically small (2 to 5), so this
quadratic cost is negligible in practice. Recognising when a quadratic
algorithm is fine — because the actual input size is small — is as
important a skill as recognising when it is not.

**SE lens:** `compute_distances` is a pure function with no side effects:
given the same `repeated_sequences` dictionary, it always returns the
same list of distances, in the same order, regardless of when or how
many times it is called. Pure functions are the easiest to test in
isolation, because there is no hidden state to set up beforehand.

---

### A Realistic Example

A single repeated trigram is a weak signal. Real ciphertexts — long
enough to be worth attacking — produce many repeats. The GCD of many
distances is a much stronger signal than the GCD of one.

**The problem:** run the full pipeline on a longer ciphertext and confirm
the GCD correctly identifies the keyword length, which in this case is
unknown to the code — it is discovered.

```python
def shift_character(character, shift):
    # unchanged from Lesson 01
    alphabet_start = ord('A')
    position = ord(character) - alphabet_start
    shifted_position = (position + shift) % 26
    return chr(shifted_position + alphabet_start)

def keyword_to_shifts(keyword):
    # unchanged from Lesson 04
    shifts = []
    for letter in keyword.upper():
        shift_amount = ord(letter) - ord('A')
        shifts.append(shift_amount)
    return shifts

def vigenere_encode(message, keyword):
    # unchanged from Lesson 04
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

def find_repeated_sequences(text, sequence_length):
    # unchanged from earlier in this lesson
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()
    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)
    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

def compute_distances(repeated_sequences):
    # unchanged from earlier in this lesson
    distances = []
    for sequence, positions in repeated_sequences.items():
        for i in range(len(positions) - 1):
            for j in range(i + 1, len(positions)):
                distance = positions[j] - positions[i]
                distances.append(distance)
    return distances

def gcd(a, b):
    # unchanged from earlier in this lesson
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a

plaintext = (
    "THE SECRET MESSAGE IS HIDDEN INSIDE THE SECRET BOX AND ONLY "
    "THE SECRET KEY CAN OPEN THE SECRET BOX TO REVEAL THE SECRET "
    "MESSAGE WRITTEN INSIDE THE SECRET BOX"
)
unknown_keyword = "LION"   # pretend this is unknown to the attacker
ciphertext = vigenere_encode(plaintext, unknown_keyword)

repeats = find_repeated_sequences(ciphertext, 3)
distances = compute_distances(repeats)

print(f"Found {len(repeats)} repeated trigram(s)")
print(f"Distances: {distances}")

running_gcd = distances[0]
for distance in distances[1:]:
    running_gcd = gcd(running_gcd, distance)

print(f"GCD of all distances: {running_gcd}")
print(f"Actual keyword length: {len(unknown_keyword)}")
```

Run this. You should see:

```
Found 21 repeated trigram(s)
Distances: [68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 88, 88, 88, 88, 88, 88, 88, 68, 68, 68, 68, 68, 68, 68]
GCD of all distances: 4
GCD of all distances: 4
Actual keyword length: 4
```

**Walkthrough:** the phrase `"THE SECRET"` and the word `"SECRET BOX"`
each repeat several times in the plaintext, producing 21 repeated trigrams
in the ciphertext once encoded with the 4-letter keyword `LION`.
The distances are all 68, 88, or 20 — every single one of them a multiple
of 4. `running_gcd` starts at the first distance (68) and is repeatedly
combined with the next distance using `gcd`, exactly the way you would
reduce a fraction by finding common factors one pair at a time.
`gcd(68, 88)` is 4. `gcd(4, 20)` is 4. The final result, 4, exactly
matches the true keyword length — even though the code never saw the
keyword `LION` itself.

**CS lens:** this is the complete **Kasiski examination**, end to end:
find repeats, measure distances, take the GCD. The result is not a guess
in the colloquial sense — it is a *constraint*. Every distance between
two identical ciphertext trigrams is provably a multiple of the keyword
length (modulo rare coincidence, addressed below), so the GCD of many
such distances converges on the true length with high confidence as more
repeats are found.

**SE lens:** `unknown_keyword` is named to make the *intent* of the
demonstration explicit: the code that performs the attack
(`find_repeated_sequences`, `compute_distances`, the `gcd` loop) never
references `unknown_keyword` at all — only the `print` statement at the
end does, for verification. This separation mirrors a real attack:
the attacker has the ciphertext and nothing else.

---

### When Coincidence Interferes

Not every repeated trigram is meaningful. Sometimes a trigram repeats
by pure chance — unrelated to the keyword length — and its distance
will not be a multiple of the true keyword length. With enough real
repeats, these coincidences get outvoted. This block visualises that
voting process directly.

**The problem:** instead of trusting a single GCD calculation, have
every plausible key length "vote" based on how many distances it evenly
divides, and visualise the result.

```python
import matplotlib.pyplot as plt

def find_repeated_sequences(text, sequence_length):
    # unchanged from earlier in this lesson
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()
    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)
    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

def compute_distances(repeated_sequences):
    # unchanged from earlier in this lesson
    distances = []
    for sequence, positions in repeated_sequences.items():
        for i in range(len(positions) - 1):
            for j in range(i + 1, len(positions)):
                distance = positions[j] - positions[i]
                distances.append(distance)
    return distances

def shift_character(character, shift):
    # unchanged from Lesson 01
    alphabet_start = ord('A')
    position = ord(character) - alphabet_start
    shifted_position = (position + shift) % 26
    return chr(shifted_position + alphabet_start)

def keyword_to_shifts(keyword):
    # unchanged from Lesson 04
    shifts = []
    for letter in keyword.upper():
        shift_amount = ord(letter) - ord('A')
        shifts.append(shift_amount)
    return shifts

def vigenere_encode(message, keyword):
    # unchanged from Lesson 04
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

plaintext = (
    "THE SECRET MESSAGE IS HIDDEN INSIDE THE SECRET BOX AND ONLY "
    "THE SECRET KEY CAN OPEN THE SECRET BOX TO REVEAL THE SECRET "
    "MESSAGE WRITTEN INSIDE THE SECRET BOX"
)
ciphertext = vigenere_encode(plaintext, "LION")

repeats = find_repeated_sequences(ciphertext, 3)
distances = compute_distances(repeats)

candidate_lengths = list(range(2, 13))
votes = []
for candidate_length in candidate_lengths:
    vote_count = 0
    for distance in distances:
        if distance % candidate_length == 0:
            vote_count = vote_count + 1
    votes.append(vote_count)

fig, axis = plt.subplots(figsize=(10, 6))
bar_colors = ['#2ecc71' if length == 4 else '#3498db' for length in candidate_lengths]
axis.bar(candidate_lengths, votes, color=bar_colors)
axis.set_xlabel("Candidate key length")
axis.set_ylabel("Distances divisible by this length")
axis.set_title("Kasiski Voting: Which Key Length Best Explains the Repeats?")
axis.set_xticks(candidate_lengths)
plt.tight_layout()
plt.show()

print("Candidate lengths and votes:")
for length, vote_count in zip(candidate_lengths, votes):
    print(f"  length {length:2d}: {vote_count} votes")
```

Run this. You will see a bar chart where length 4 and length 2 both
receive the maximum number of votes (35 out of 35 distances), with
smaller peaks at 8 and 11 from coincidence. The chart makes the decision
visual: 4 is the smallest length that explains essentially all of the
repeats.

**Walkthrough:** for each candidate length from 2 to 12, the code counts
how many of the recorded distances are evenly divisible by it —
`distance % candidate_length == 0`. A candidate length of 2 scores well
because every multiple of 4 is also a multiple of 2 — 2 is a divisor of
the true length, so it inherits the same votes. This is why the
*smallest* length with a strong vote count is preferred over larger
ones: 2 is a true divisor of the keyword length, but 4 is the keyword
length itself, and 8 and 11 are coincidental.

`bar_colors = ['#2ecc71' if length == 4 else '#3498db' ...]` is a list
comprehension that produces green for the bar at the true answer (4)
and blue for every other bar — using prior knowledge of the answer to
highlight it for this teaching example. A real attacker would not have
this advantage and would need to examine the chart and reason about
which peak is most likely the true period rather than a multiple or
coincidence of it.

**CS lens:** this is **majority voting** applied to a number-theoretic
question — a pattern that appears throughout statistics and machine
learning: when no single measurement is fully reliable, aggregate many
measurements and let the most consistent answer win. The GCD calculation
from the previous block and this voting calculation are two different
algorithms answering the same question; voting is more robust to
coincidental repeats because a few bad distances cannot derail it the
way they could corrupt a running GCD.

**SE lens:** the voting code does not call the `gcd` function at all —
it solves the same problem with an entirely different algorithm.
Showing two approaches to the same problem, side by side in the same
lesson, is deliberate: it demonstrates that "the right algorithm" is
often a judgement call between approaches with different tradeoffs, not
a single correct answer to compute toward.

---

### The Complete Detector

**The problem:** assemble everything into one function that takes a
ciphertext and returns its most likely keyword length.

```python
def find_repeated_sequences(text, sequence_length):
    # unchanged from earlier in this lesson
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()
    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)
    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

def compute_distances(repeated_sequences):
    # unchanged from earlier in this lesson
    distances = []
    for sequence, positions in repeated_sequences.items():
        for i in range(len(positions) - 1):
            for j in range(i + 1, len(positions)):
                distance = positions[j] - positions[i]
                distances.append(distance)
    return distances

def gcd(a, b):
    # unchanged from earlier in this lesson
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a

def kasiski_test(ciphertext, sequence_length=3):
    repeated_sequences = find_repeated_sequences(ciphertext, sequence_length)
    distances = compute_distances(repeated_sequences)

    if len(distances) == 0:
        print("No repeated sequences found. Try a longer ciphertext or shorter sequence_length.")
        return None

    running_gcd = distances[0]
    for distance in distances[1:]:
        running_gcd = gcd(running_gcd, distance)

    print(f"Found {len(repeated_sequences)} repeated sequence(s) of length {sequence_length}")
    print(f"Distances between repeats: {distances}")
    print(f"GCD of all distances: {running_gcd}")
    print(f"Most likely key length: {running_gcd}")

    return running_gcd

lion_ciphertext = (
    "EPS FPKFRE USFDIUR TA VVOLSA TVGVOM HUP ASPCMH OZF OAO WBYJ BVR DMQEPB "
    "YRJ KOA ZXSA EPS FPKFRE JCK EW FRGMOY EPS FPKFRE USFDIUR HZWGEMB "
    "VYAWQP BVR DMQEPB PBI"
)
kasiski_test(lion_ciphertext)
```

Run this. You should see:

```
Found 21 repeated sequence(s) of length 3
Distances between repeats: [68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 68, 88, 20, 88, 88, 88, 88, 88, 88, 88, 68, 68, 68, 68, 68, 68, 68]
GCD of all distances: 4
Most likely key length: 4
```

**Walkthrough:** `kasiski_test` orchestrates the three pieces built
separately above: find repeats, compute distances, reduce by GCD.
The guard clause `if len(distances) == 0:` handles the case where no
repeats were found at all — short ciphertexts, or ciphertexts where
the keyword happens to be longer than any repeated plaintext sequence —
returning `None` and printing a clear message rather than crashing.

**CS lens:** `kasiski_test` is a **composition** of three single-purpose
functions into one pipeline. Each stage transforms the output of the
previous stage: text → repeated sequences → distances → a single integer.
This pipeline structure — break a problem into stages, each consuming
the previous stage's output — is one of the most common patterns in
software, visible in everything from compilers (Lesson 09 introduces
this explicitly for the calculator project) to data processing systems.

**SE lens:** the guard clause is a **defensive check** — code that
verifies an assumption before proceeding, rather than letting a
violation cause a confusing failure later. Without it, the function
would crash on `distances[0]` with an `IndexError` and no explanation.
With it, the function fails clearly and tells the caller what went wrong
and how to fix it. This is the difference between a function that is
merely correct on valid input and one that is *robust* — correct on
valid input and informative on invalid input.

---

## Connect the Pieces

This lesson exploited a structural weakness in the Vigenère cipher that
Lesson 04 did not anticipate as an attack surface: the keyword *repeats*,
and repetition in the key produces repetition in the ciphertext whenever
the plaintext itself repeats. The Kasiski examination measures that
repetition and reduces it, via the Euclidean algorithm, to a single
number: the keyword length.

Finding the *length* of the keyword is only half the attack. Knowing the
length tells you how many separate Caesar ciphers are interleaved in the
ciphertext — every first letter, fourth letter, seventh letter (for a
keyword of length 3) was all shifted by the same amount, and that group
can be attacked with the frequency analysis from Lesson 03. Lesson 06
does exactly this: splits the ciphertext into groups by position modulo
the keyword length, and breaks each group as its own Caesar cipher.

The Euclidean algorithm you wrote here — `gcd(a, b)` using repeated
remainder — is not a one-time tool. Lesson 14 extends it into the
*extended* Euclidean algorithm, which computes not just the GCD but also
the coefficients that express it as a combination of `a` and `b`.
That extended version is the key generation step of RSA, in Module 4.
The four-line loop you just wrote and traced by hand is doing real work
in a cipher you have not built yet.

---

## What Breaks Without This

Run `kasiski_test` on a ciphertext too short to contain any repeats:

```python
def find_repeated_sequences(text, sequence_length):
    # unchanged from earlier in this lesson
    letters_only = ""
    for character in text:
        if character.isalpha():
            letters_only = letters_only + character.upper()
    occurrences = {}
    for start_position in range(len(letters_only) - sequence_length + 1):
        sequence = letters_only[start_position:start_position + sequence_length]
        if sequence not in occurrences:
            occurrences[sequence] = []
        occurrences[sequence].append(start_position)
    repeated = {}
    for sequence, positions in occurrences.items():
        if len(positions) > 1:
            repeated[sequence] = positions
    return repeated

def compute_distances(repeated_sequences):
    # unchanged from earlier in this lesson
    distances = []
    for sequence, positions in repeated_sequences.items():
        for i in range(len(positions) - 1):
            for j in range(i + 1, len(positions)):
                distance = positions[j] - positions[i]
                distances.append(distance)
    return distances

# the guard clause removed
def kasiski_test_broken(ciphertext, sequence_length=3):
    repeated_sequences = find_repeated_sequences(ciphertext, sequence_length)
    distances = compute_distances(repeated_sequences)
    running_gcd = distances[0]   # no check that distances is non-empty
    return running_gcd

kasiski_test_broken("KHOOR")
```

You will see:

```
IndexError: list index out of range
```

`"KHOOR"` is five letters — too short to contain any repeated trigram.
`find_repeated_sequences` correctly returns an empty dictionary, and
`compute_distances` correctly returns an empty list. But
`distances[0]` asks for the first element of a list that has zero
elements, which Python cannot provide. The guard clause in the working
version (`if len(distances) == 0:`) exists specifically to catch this
case before it reaches the line that would crash. Every time you write
`some_list[0]`, ask: can `some_list` ever be empty here? If yes, check
for it first.

---

## Definition of Done

- [ ] `vigenere_encode("THE SUN AND THE MOON", "KEY")` shows the repeated
      `DLC` trigram in the ciphertext
- [ ] `find_repeated_sequences("DLC CYL KRB DLC WSMX", 3)` returns
      `{'DLC': [0, 9]}`
- [ ] `gcd(48, 18)` returns `6`, and you can trace the Euclidean algorithm
      by hand for this input
- [ ] `kasiski_test(lion_ciphertext)` correctly returns `4`
- [ ] The voting bar chart shows length 4 (and its divisor, 2) with the
      highest votes
- [ ] `kasiski_test("KHOOR")` returns `None` and prints a clear message,
      without crashing
- [ ] You can explain why a repeated ciphertext sequence's distance is
      likely a multiple of the keyword length
- [ ] You can explain what a guard clause is and why `kasiski_test`
      has one but `kasiski_test_broken` does not

**Commit your work:**

```bash
git add lesson-05.py
git commit -m "Lesson 05: Kasiski examination finds the Vigenere key length

Implement repeated-sequence detection, distance computation, and the
Euclidean algorithm for GCD. Combine them into kasiski_test, which
recovers the keyword length of a Vigenere ciphertext using only
repeated patterns and remainder arithmetic. Adds a voting-based
visualisation showing how coincidental repeats are outvoted by the
true period. Sets up Lesson 06: breaking each position group as an
independent Caesar cipher now that the key length is known."
```
