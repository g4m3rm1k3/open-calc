# Lesson 43: Randomness That an Attacker Can Reproduce Isn't Random

## What you will build

A password generator built on Python's `secrets` module rather than
`random` — demonstrated to matter with a real, working proof that
`random`'s output can be exactly reproduced by anyone who knows (or
guesses) its seed — plus a passphrase generator, and a real, measured
entropy comparison between the two styles of "strong password."

## What you need to know first

- **Lesson 42** — `os.urandom`, introduced there as the correct source
  of security-sensitive randomness, in passing. Today explains *why* in
  full, contrasted directly against the module it's easy to reach for
  instead.

---

## The Problem, in prose, no code yet

Python's `random` module is the obvious tool for "give me something
random" — it's been in the standard library forever, every tutorial
uses it, and for shuffling a card game or picking a random quiz question
it's exactly right. It is also, by design, completely unsuitable for
generating a password, a session token, or anything else where an
attacker being able to *predict* the output is the actual threat model —
and the reason isn't a bug or an edge case, it's `random`'s core design
working exactly as intended, for a purpose password generation isn't.

---

## Concept Unit: `random` Is Deterministic, and That's the Whole Problem

### The Problem

`random.random()` and friends are built on a **pseudorandom number
generator** — an algorithm (Python uses the Mersenne Twister) that
produces a long sequence of numbers that *looks* statistically random,
but is entirely determined by its starting internal state, called a
**seed**. Two generators started with the identical seed will, forever
after, produce the identical sequence of "random" values — deterministic,
not random, underneath the statistical appearance.

### Introduce the concept in isolation

```python
import random

attacker_guess = 12345

victim_generator = random.Random(attacker_guess)
victim_password = "".join(victim_generator.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(12))
print("victim's 'random' password:", victim_password)

attacker_generator = random.Random(attacker_guess)
attacker_prediction = "".join(attacker_generator.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(12))
print("attacker's predicted password:", attacker_prediction)

print("attacker guessed it exactly:", victim_password == attacker_prediction)
```

Run it:

```
victim's 'random' password: 0atxmr1kxh1q
attacker's predicted password: 0atxmr1kxh1q
attacker guessed it exactly: True
```

What this proves: `random.Random(attacker_guess)` (**first appearance of
constructing a separate, explicitly-seeded generator instance**, as
opposed to the module-level `random.seed()`/`random.choice()` functions,
which share one global instance) creates a generator whose entire future
output is fixed the instant the seed is chosen. Two completely separate
`Random` objects, seeded identically, produced byte-for-byte identical
output — proving that "knowing the seed" is functionally equivalent to
"knowing the password," with no cracking, guessing, or brute force
required at all. This lab used an obviously-guessable seed
(`12345`) to make the point starkly, but the underlying determinism is
absolute: it's true of *any* seed, guessable or not — the risk in
practice is entirely about how hard the seed itself is to determine or
narrow down (a common real mistake: seeding with the current time, which
an attacker who knows roughly when a password was generated can search
over in seconds).

This lab is deleted now; it never appears in the project. What survives
is the disqualification: any tool built on `random` inherits this
determinism, no matter how the seed is chosen, which makes it wrong for
this specific job regardless of how careful the surrounding code is.

### CS Lens

This is the distinction between **pseudorandomness** (statistically
random-looking, but fully deterministic given the seed — correct for
simulations, games, sampling) and **cryptographically secure
randomness** (built from a source of genuine physical unpredictability —
correct for anything security-sensitive). The two solve visibly
similar-looking problems and are not interchangeable.

Also recognized in: Monte Carlo simulations (deliberately want
reproducibility via a fixed seed — the *opposite* preference from
security use, worth noting directly since it shows `random`'s
determinism is a feature in that context, not a universal flaw), game
world generation seeded from a shareable code, this curriculum's own
Lesson 39 macro recorder (predictable, reproducible timing was exactly
the goal there — determinism is contextually good or bad, never
inherently either).

### SE Lens

Python doesn't disable `random`'s determinism, or refuse to let it be
seeded predictably, because that determinism is genuinely the right
behavior for the large majority of `random`'s actual use cases. Instead,
Python provides a second, entirely separate module for the minority of
cases — security — that need the opposite property. The design
responsibility falls on knowing *which* module a given problem actually
calls for, which is precisely the judgment this lesson exists to build.

---

## Concept Unit: `secrets`

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** new file, `password_generator.py`.
- **Change type:** add.
- **Dependencies:** `secrets`, `string`, `math` — standard library only.

### The New Code

```python
import secrets
import string

CHARACTER_POOL = string.ascii_letters + string.digits + string.punctuation


def generate_password(length=16, pool=CHARACTER_POOL):
    return "".join(secrets.choice(pool) for _ in range(length))
```

### The Updated Project

A new, freestanding function with nothing surrounding it yet.

### Mechanical Walkthrough

- `import secrets` — **first appearance.** `secrets` is a standard
  library module built specifically, and only, for security-sensitive
  randomness — tokens, passwords, session identifiers. Internally, it's
  built on `os.urandom` (established in Lesson 42), the same
  operating-system-provided source of genuine, non-deterministic
  randomness, wrapped in a small, purpose-built API.
- `string.ascii_letters`, `string.digits`, `string.punctuation` — **first
  appearance of the `string` module's character-class constants.**
  `ascii_letters` is `"abc...xyzABC...XYZ"`, `digits` is `"0123456789"`,
  `punctuation` is every standard ASCII symbol character (`!"#$%...`) —
  concatenated together with `+` (reused string concatenation) into one
  94-character pool.
- `secrets.choice(pool)` — **first appearance.** Directly parallel to
  `random.choice`, used in the previous unit's lab — same call shape,
  same job (pick one random element from a sequence) — but backed by
  `os.urandom` instead of the Mersenne Twister, making its output
  immune to the exact reproduction attack just demonstrated: there is no
  seed to know, guess, or narrow down at all.
- `"".join(... for _ in range(length))` — a **hard concept reappearing**
  from throughout this curriculum's text-building code: a generator
  expression joined into one string, run `length` times.

### Run it

```python
password = generate_password()
print("random password:", password)
```

```
random password: m(k])tlq_V.FN"Z0
```

---

## Concept Unit: Two Ways to Be Unpredictable, Measured

### The Problem

A random character string and a random sequence of dictionary words are
both legitimate approaches to a strong password — but "strong" needs a
real, comparable number behind it, not just a feeling that both "look
random enough."

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `password_generator.py`.
- **Change type:** add.
- **Location:** below `generate_password`.

### The New Code

```python
WORDLIST = [
    "anchor", "bridge", "canyon", "delta", "ember", "falcon", "granite",
    "harbor", "island", "jungle", "kernel", "lantern", "meadow", "nebula",
    "oyster", "prairie", "quartz", "river", "summit", "tundra", "umbrella",
    "valley", "willow", "xenon", "yonder", "zephyr",
]


def generate_passphrase(word_count=6, wordlist=WORDLIST, separator="-"):
    return separator.join(secrets.choice(wordlist) for _ in range(word_count))


def entropy_bits(pool_size, length):
    return length * math.log2(pool_size)
```

### Mechanical Walkthrough

- `WORDLIST` — a small, 26-word list, deliberately kept short for this
  lesson's own readability; a real passphrase tool (the well-known
  "Diceware" scheme this design is modeled on) uses a list of exactly
  7776 words, for a reason the numbers below make concrete.
- `generate_passphrase` — structurally identical to `generate_password`,
  `secrets.choice` applied to a list of words instead of a string of
  characters, joined with a separator instead of concatenated directly.
- `entropy_bits(pool_size, length)` — **first appearance of an actual
  entropy calculation** in this curriculum. `math.log2(pool_size)`
  (reused arithmetic, new specific function) is the number of bits
  needed to represent one choice from `pool_size` equally likely
  options — multiplying by `length` gives the total number of bits
  needed to represent the *entire* random choice, assuming (as
  `secrets.choice` guarantees) every option at every position was chosen
  independently and uniformly.

### Run it

```python
password = generate_password()
print(f"entropy: {entropy_bits(len(CHARACTER_POOL), len(password)):.1f} bits "
      f"(pool size {len(CHARACTER_POOL)}, length {len(password)})")

passphrase = generate_passphrase()
print(f"entropy: {entropy_bits(len(WORDLIST), 6):.1f} bits "
      f"(pool size {len(WORDLIST)}, 6 words)")
```

```
random password: m(k])tlq_V.FN"Z0
entropy: 104.9 bits (pool size 94, length 16)

passphrase: quartz-valley-oyster-delta-prairie-harbor
entropy: 28.2 bits (pool size 26, 6 words)
```

Taken at face value, the 16-character password's `104.9` bits looks
overwhelmingly stronger than the passphrase's `28.2` — but that
comparison is skewed by this lesson's deliberately tiny, 26-word demo
list. Computing what a *real* Diceware-sized wordlist (7776 words, the
actual standard list size) would give for the same 6 words, using the
exact same `entropy_bits` function with no code changes:

```python
print(entropy_bits(7776, 6))
```

```
77.54887502163469
```

A real 6-word Diceware passphrase carries about **77.5 bits** of
entropy — still less than the 16-character password's `104.9`, but in
the same broad neighborhood, not two orders of magnitude apart the way
the toy demo numbers suggested, and (per `entropy_bits(94, 12)`,
computed the same way) roughly equivalent to a fully random *12*-
character password (`78.7` bits) — while remaining, for a human, vastly
easier to memorize and type correctly than either.

### CS Lens

This is **information entropy** in Shannon's original sense: a direct
measure of how much genuine uncertainty (equivalently, how many bits of
information) a random choice contains, independent of *how* that choice
is represented — a 6-word passphrase and a 78-bit-equivalent character
password represent comparable amounts of genuine unpredictability
despite looking completely different on the page.

Also recognized in: cryptographic key length discussions ("128-bit
security," "256-bit security" — literally this same unit), compression
algorithms (a value's entropy is a hard lower bound on how small it can
be losslessly compressed), password-strength meters in real signup
forms, which — when implemented well — are estimating exactly this
number rather than checking superficial rules like "contains a symbol."

### SE Lens

The tradeoff this unit's numbers make concrete: a character-based
password of comparable strength is shorter to type but effectively
impossible to memorize accurately, while a passphrase is longer to type
but genuinely memorable — the well-known real-world argument (popularized
publicly by the XKCD "correct horse battery staple" comic, referencing
exactly this entropy-versus-memorability tradeoff) for preferring
passphrases specifically for passwords a human must actually remember
and type themselves, while reserving fully random character strings for
credentials a password manager stores and no human ever needs to
recall.

---

## Connect the pieces

One password, traced through the whole lesson: `generate_password`
calls `secrets.choice`, which draws from `os.urandom`'s
operating-system-level randomness — genuinely unpredictable, with no
seed an attacker could ever reconstruct, unlike the opening lab's
`random.Random(12345)`, which any attacker who narrowed down the seed
could reproduce exactly. `entropy_bits` then puts a real, calculated
number on exactly how much unpredictability that password (or an
alternative passphrase, built the identical way from a word list instead
of a character pool) actually contains — turning "this looks random" into
a comparable, defensible number.

## What breaks without this

Swapping `secrets.choice` back for `random.choice` inside
`generate_password`, then generating a password with a freshly, but
predictably, seeded `random.Random(int(time.time()))` (a real mistake —
seeding from the current time, which an attacker who knows roughly when
an account was created can search over in a very small number of
attempts) reproduces this lesson's opening lab exactly: a "random"
password that is, in fact, fully reproducible by anyone who can narrow
down when it was generated, with the code otherwise running perfectly
and producing output that looks exactly as random as the secure version.

## Definition of done

- [ ] Two `random.Random` instances seeded identically produce identical
      output, demonstrated directly, not just asserted.
- [ ] `generate_password` produces different output on every call, with
      no seed or reproducibility possible.
- [ ] `entropy_bits` correctly computes `104.9` bits for a 16-character
      password drawn from a 94-character pool, and you can explain the
      calculation without looking it up.
- [ ] You can state, using this lesson's own real numbers, why a 6-word
      Diceware-style passphrase and roughly a 12-character fully random
      password are comparably strong, not wildly different.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add password_generator.py
  git commit -m "Add secrets-based password and passphrase generation with real entropy calculations — random.Random's determinism, proven directly with a matching seed, disqualifies it for this use regardless of how the seed is chosen"
  ```

## What's next

Lesson 42's `hash_password` and this lesson's `generate_password` are
natural partners in Lesson 53's password vault: a user's *master*
password gets Lesson 42's salted PBKDF2 treatment to be verified, while
every *stored* password inside the vault — needing to be recovered in
full, not just checked — will need Lesson 45's symmetric encryption
instead, and could be generated in the first place using exactly the
`generate_password` built here.
