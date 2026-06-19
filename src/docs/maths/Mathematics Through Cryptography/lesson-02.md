# Lesson 02 — Every Cipher Has a Key Space

## What You Will Build

A key space analyser: a program that tries every possible Caesar key,
shows you all 26 decryptions at once, and calculates how long a computer
would take to try every key by brute force. You will build a matplotlib
bar chart that makes the key space visible.

By the end of this lesson you understand exactly why the Caesar cipher
is weak — not vaguely, but precisely: it has 25 possible keys, and a
computer can try all of them in microseconds.

---

## What You Need To Know First

- Lesson 00: `encode`, `decode`, the structure of a cipher
- Lesson 01: `shift_character`, modular arithmetic, `% 26`

---

## The Lesson

### What Is a Key Space?

The **key** of a cipher is the secret value that controls the transformation.
In the Caesar cipher, the key is the shift amount. The sender and recipient
must agree on the key before communicating — and nobody else must know it.

The **key space** is the set of all possible keys. The Caesar cipher shifts
by a whole number. Shifting by 0 does nothing (the ciphertext equals the
plaintext — useless). Shifting by 26 wraps all the way around to the start
(same as shifting by 0 — also useless). So the useful shifts are 1 through 25.

The key space contains **25 keys**.

**Why does the size of the key space matter?**

An attacker who does not know the key can try every possible key until
they find one that produces readable text. This is called a **brute-force attack** —
trying every possibility without any cleverness. The only defence against
brute force is having too many keys to try in a reasonable amount of time.

25 keys is not too many. A computer can try all of them in less time than
it takes to blink.

---

### Trying Every Key

**The problem:** given an intercepted ciphertext, try every possible key
and print all decryptions.

```python
def brute_force(ciphertext):
    print(f"Brute-forcing: '{ciphertext}'\n")
    for key in range(1, 26):
        candidate = decode(ciphertext, key)
        print(f"  Key {key:2d}: {candidate}")

brute_force("KHOOR ZRUOG")
```

Run this. You should see all 25 candidate decryptions, one per line.
One of them will be readable English.

```
Brute-forcing: 'KHOOR ZRUOG'

  Key  1: JGNNQ YQTNF
  Key  2: IFMMP XPSME
  Key  3: HELLO WORLD
  Key  4: GDKKN VNQKC
  ...
```

**Walkthrough:** `range(1, 26)` produces the integers 1, 2, 3, ... 25 —
Python's `range(start, stop)` generates integers from `start` up to but
not including `stop`. The loop tries each integer as a shift, calls `decode`
with it, and prints the result. `key:2d` inside the f-string is a **format
specifier** — the `:2d` part means "format this integer in a field at least
2 characters wide," which aligns the output into a readable column.

**CS lens:** this is **exhaustive search** — visiting every element of a
search space until the answer is found. It requires no knowledge of the
cipher's structure; it works on any cipher where the key space is small
enough to enumerate. Exhaustive search is always correct and always slow.
The entire discipline of modern cryptography is the project of making
key spaces too large for exhaustive search to finish before the heat
death of the universe.

**SE lens:** `brute_force` calls `decode`, which calls `shift_character`.
Each function does one thing and knows nothing about the others' internals.
`brute_force` does not reimplement shifting — it reuses what already exists.
This is the payoff of writing small, focused functions: they compose.

---

### How Long Does Brute Force Take?

Trying 25 keys feels instant. It is. But the number 25 is the point.

**The problem:** calculate how long a computer would take to brute-force
a cipher with various key space sizes.

```python
def brute_force_time(key_space_size, keys_per_second):
    seconds = key_space_size / keys_per_second
    minutes = seconds / 60
    hours = minutes / 60
    days = hours / 24
    years = days / 365.25

    print(f"Key space size:    {key_space_size:,}")
    print(f"Keys per second:   {keys_per_second:,}")
    print(f"Time to exhaust:")
    print(f"  {seconds:.6f} seconds")
    print(f"  {minutes:.6f} minutes")
    print(f"  {hours:.8f} hours")
    print(f"  {years:.10f} years")
    print()

modern_cpu_keys_per_second = 1_000_000_000

print("=== Caesar cipher (25 keys) ===")
brute_force_time(25, modern_cpu_keys_per_second)

print("=== DES (2^56 keys) ===")
brute_force_time(2**56, modern_cpu_keys_per_second)

print("=== AES-128 (2^128 keys) ===")
brute_force_time(2**128, modern_cpu_keys_per_second)
```

Run this. You should see something like:

```
=== Caesar cipher (25 keys) ===
Key space size:    25
Keys per second:   1,000,000,000
Time to exhaust:
  0.000000 seconds
  ...

=== DES (2^56 keys) ===
Key space size:    72,057,594,037,927,936
Keys per second:   1,000,000,000
Time to exhaust:
  72057594.037928 seconds
  ...

=== AES-128 (2^128 keys) ===
...
```

**Walkthrough:** `1_000_000_000` is one billion — Python allows underscores
in numeric literals as a readability aid, the same way you might write
1,000,000,000 on paper. `2**56` is Python's notation for 2⁵⁶ — the `**`
operator means "raise to the power of." A modern CPU can try approximately
one billion keys per second for a simple cipher. The time to exhaust a
key space is simply `key_space_size / keys_per_second`.

`{key_space_size:,}` is a format specifier that adds commas to large numbers.
`{seconds:.6f}` formats a float to 6 decimal places.

**CS lens:** this calculation demonstrates **computational complexity** in
the most concrete possible form — not as asymptotic notation, but as a
real time measured in seconds and years. The key space of AES-128 is 2¹²⁸,
which is approximately 3.4 × 10³⁸. At one billion keys per second, exhausting
it would take longer than the current age of the universe. This is not
an accident of the specific numbers — it is the design goal of a cipher.

**SE lens:** `modern_cpu_keys_per_second` is stored in a named variable
rather than written as a literal `1000000000` inside the function call.
Named constants communicate intent — reading `modern_cpu_keys_per_second`
you know what the number represents. Reading `1000000000` you do not.
This applies to any "magic number" — a numeric literal whose meaning
is not obvious from context. Name them.

---

### Visualising the Key Space

Numbers are hard to compare when the differences are this extreme.
A chart makes the difference between 25 and 2¹²⁸ visible.

**The problem:** plot the key space sizes of several ciphers on the same
chart so the differences in scale are immediately visible.

```python
import matplotlib.pyplot as plt
import math

cipher_names = ["Caesar\n(this lesson)", "DES\n(broken 1999)", "AES-128\n(current standard)"]
key_space_sizes = [25, 2**56, 2**128]
log_sizes = [math.log2(size) for size in key_space_sizes]

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

axes[0].bar(cipher_names, key_space_sizes, color=['#e74c3c', '#e67e22', '#2ecc71'])
axes[0].set_title("Key Space Size (actual numbers)")
axes[0].set_ylabel("Number of possible keys")
axes[0].ticklabel_format(style='sci', axis='y', scilimits=(0, 0))

axes[1].bar(cipher_names, log_sizes, color=['#e74c3c', '#e67e22', '#2ecc71'])
axes[1].set_title("Key Space Size (log₂ scale)")
axes[1].set_ylabel("Bits of key (log₂ of key count)")
axes[1].set_ylim(0, 140)

for axis in axes:
    axis.set_xlabel("Cipher")
    axis.tick_params(axis='x', labelsize=10)

plt.suptitle("Key Space Comparison: Why Caesar Is Weak", fontsize=14)
plt.tight_layout()
plt.show()
```

Run this. You will see two bar charts side by side. The left chart shows
the actual numbers — AES-128's bar is so tall relative to Caesar's that
Caesar's bar is invisible. The right chart shows the same data on a
logarithmic scale, where each step up represents doubling the key space.

**Walkthrough:** `[math.log2(size) for size in key_space_sizes]` is a
**list comprehension** — a concise Python syntax for building a list by
applying an expression to each element of another list. `math.log2(size)`
returns the base-2 logarithm of `size`: the power to which 2 must be raised
to produce `size`. `math.log2(2**128)` is 128. `math.log2(25)` is
approximately 4.64 — meaning Caesar's key space is smaller than 2⁵.

`plt.subplots(1, 2, figsize=(14, 6))` creates two side-by-side axes.
`axes[0].bar(...)` draws a bar chart on the first axis. `axes[1].bar(...)`
draws on the second. Both axes share the same cipher names on the x-axis.

**CS lens:** the logarithmic scale reveals why cryptographers measure
key space in **bits**: the number of bits in the key is exactly `log₂`
of the key space size. A 128-bit key means a key space of 2¹²⁸.
Each additional bit doubles the key space. This is why modern key sizes
are discussed in bits — it is a compact, precise way to express
the exponential differences between secure and insecure ciphers.

**SE lens:** two charts are shown instead of one because neither alone
tells the full story. The linear chart shows that Caesar is meaningless
compared to AES-128. The log chart shows the structure — that key space
grows exponentially with bit length. Neither chart is redundant.
Choosing the right representation for data is a design decision, not
a cosmetic one.

---

### Why the Caesar Cipher Is Weak: The Full Picture

You can now state the weakness precisely, which is more useful than
stating it vaguely.

```python
def analyse_cipher_strength(cipher_name, key_space_size, keys_per_second=1_000_000_000):
    bits_of_security = math.log2(key_space_size)
    seconds_to_break = key_space_size / keys_per_second
    years_to_break = seconds_to_break / (60 * 60 * 24 * 365.25)

    print(f"Cipher: {cipher_name}")
    print(f"  Key space: {key_space_size:,} keys ({bits_of_security:.1f} bits)")
    print(f"  Brute force time: {seconds_to_break:.2e} seconds ({years_to_break:.2e} years)")
    print()

analyse_cipher_strength("Caesar", 25)
analyse_cipher_strength("DES", 2**56)
analyse_cipher_strength("AES-128", 2**128)
```

Run this. You should see:

```
Cipher: Caesar
  Key space: 25 keys (4.6 bits)
  Brute force time: 2.50e-08 seconds (7.93e-16 years)

Cipher: DES
  Key space: 72,057,594,037,927,936 keys (56.0 bits)
  Brute force time: 7.21e+07 seconds (2.28e+00 years)

Cipher: AES-128
  Key space: 340,282,366,920,938,463,463,374,607,431,768,211,456 keys (128.0 bits)
  Brute force time: 3.40e+29 seconds (1.08e+22 years)
```

The Caesar cipher has **4.6 bits of security**. A brute-force attack takes
25 nanoseconds. AES-128 has **128 bits of security**. A brute-force attack
takes longer than the age of the universe. The difference is entirely in
the size of the key space.

**CS lens:** `2.50e-08` is scientific notation — Python's `:.2e` format
renders a float in the form `X.XXe+YY`, where `e+YY` means "× 10^YY"
and `e-YY` means "× 10^(-YY)". `2.50e-08` is 2.50 × 10⁻⁸ = 0.000000025.

**SE lens:** `analyse_cipher_strength` takes `keys_per_second` as a
parameter with a **default value** of one billion. `def analyse_cipher_strength(cipher_name, key_space_size, keys_per_second=1_000_000_000):`
means callers can omit `keys_per_second` and get the default, or supply
a different value to model a faster or slower attacker. Default parameters
are a design tool: they make functions convenient for the common case while
remaining flexible for other cases.

---

## Connect the Pieces

The Caesar cipher is broken by brute force in this lesson.
Lesson 03 breaks it more cleverly — without trying every key.

The brute-force weakness introduced here is not just about the Caesar cipher.
It is the reason every cipher in this curriculum uses keys measured in
hundreds of bits. Every time you see "AES-128" or "RSA-2048" or "P-256"
in real software, the number is a statement about the key space — about
how long brute force would take.

The calculation you wrote in this lesson — `key_space_size / keys_per_second`
— is one of the most important calculations in applied cryptography.
Security analysts run exactly this calculation when recommending
minimum key sizes.

---

## What Breaks Without This

Change the key space calculation to exclude shift 0:

```python
# Incorrect: starting from 0 includes a non-key
for key in range(0, 26):
    candidate = decode(ciphertext, key)
    print(f"  Key {key:2d}: {candidate}")
```

Shifting by 0 produces the ciphertext unchanged. If the attacker tries
key 0 first and sees the ciphertext echoed back, they might incorrectly
conclude the message was not encrypted. More importantly, including
non-functional keys inflates the apparent key space. A cipher that claims
100 keys but where 50 are equivalent to "no encryption" does not have
a 100-key space — it has a 50-key space. Counting the key space correctly
matters for the security analysis.

---

## Definition of Done

- [ ] `brute_force("KHOOR ZRUOG")` shows `HELLO WORLD` at key 3
- [ ] `brute_force_time(25, 1_000_000_000)` shows a time less than 1 second
- [ ] `brute_force_time(2**128, 1_000_000_000)` shows a time greater than the age of the universe
- [ ] The bar chart displays both linear and log-scale views
- [ ] You can explain in your own words what "bits of security" means
- [ ] You can explain why shifting by 0 or 26 is not a valid key
- [ ] You can explain what a list comprehension is and rewrite `[math.log2(size) for size in key_space_sizes]` as an equivalent `for` loop

**Commit your work:**

```bash
git add lesson-02.py
git commit -m "Lesson 02: Key space analysis and brute-force timing

Build a brute-force attacker for the Caesar cipher and a timing
calculator that shows why 25 keys is catastrophically weak.
Introduces key space, bits of security, and the exponential
relationship between key length and brute-force time.
Sets up Lesson 03: a smarter attack that does not need brute force."
```
