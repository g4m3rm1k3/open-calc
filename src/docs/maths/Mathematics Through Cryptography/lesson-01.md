# Lesson 01 — The Clock That Wraps Around

## What You Will Build

A fixed Caesar cipher: one that correctly wraps `X → A`, `Y → B`, `Z → C`
instead of producing punctuation. You will also build a visualiser using
matplotlib that shows the alphabet as a clock face, making the wrapping
behaviour visible.

By the end of this lesson `encode("XYZ", 3)` produces `"ABC"` and you
have a mental model — both visual and algebraic — for why.

---

## What You Need To Know First

- Lesson 00: `encode` and `decode`, `ord()`, `chr()`, the wrapping bug

The bug from Lesson 00 is the starting point. Open `lesson-00.py` and run
`encode("XYZ", 3)` once more to confirm you are looking at the same problem.

---

## The Lesson

### The Problem, Restated

The alphabet has 26 letters. The Caesar cipher shifts each letter forward
by the key. When the shift pushes past `'Z'`, it should wrap back to the
start — `'Z'` shifted by 1 should give `'A'`, not `'['`.

The shift is not happening on a number line. It is happening on a wheel.

Run the visualiser below before reading further. It shows the wheel.

---

### The Clock Face

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import math

def draw_alphabet_wheel(shift):
    fig, axes = plt.subplots(1, 2, figsize=(14, 7))

    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    letter_count = len(alphabet)
    radius = 1.0
    label_radius = 1.25

    for axis_index, (axis, title) in enumerate(zip(axes, ["Original", f"Shifted by {shift}"])):
        axis.set_xlim(-1.6, 1.6)
        axis.set_ylim(-1.6, 1.6)
        axis.set_aspect('equal')
        axis.axis('off')
        axis.set_title(title, fontsize=14, pad=20)

        axis.add_patch(patches.Circle((0, 0), radius, fill=False, linewidth=2))

        for letter_index, letter in enumerate(alphabet):
            angle_radians = math.pi / 2 - (2 * math.pi * letter_index / letter_count)
            dot_x = radius * math.cos(angle_radians)
            dot_y = radius * math.sin(angle_radians)
            axis.plot(dot_x, dot_y, 'o', color='steelblue', markersize=8)

            label_x = label_radius * math.cos(angle_radians)
            label_y = label_radius * math.sin(angle_radians)

            if axis_index == 0:
                display_letter = letter
            else:
                shifted_index = (letter_index + shift) % letter_count
                display_letter = alphabet[shifted_index]

            axis.text(label_x, label_y, display_letter,
                      ha='center', va='center', fontsize=9, fontweight='bold')

    plt.suptitle("The Caesar Cipher as a Wheel", fontsize=16, y=1.02)
    plt.tight_layout()
    plt.show()

draw_alphabet_wheel(3)
```

Run this. You will see two wheels side by side. The left wheel shows the
alphabet in its original positions. The right wheel shows each letter
replaced by the letter 3 positions ahead — and crucially, `X`, `Y`, `Z`
wrap cleanly to `A`, `B`, `C`.

**Walkthrough:** `import matplotlib.pyplot as plt` loads matplotlib's
plotting module and gives it the alias `plt` — a conventional short name.
`import matplotlib.patches as patches` loads the shapes module, used here
for the circle. `import math` loads Python's mathematics module, which
provides `math.pi` (π ≈ 3.14159) and `math.cos` and `math.sin`
(trigonometric functions explained below).

`plt.subplots(1, 2, figsize=(14, 7))` creates a figure containing
a 1×2 grid of subplots — one row, two columns — and returns the figure
object and a list of the two axes. Each axis is an independent drawing area.

For each letter, the angle around the circle is computed as:
`angle_radians = math.pi / 2 - (2 * math.pi * letter_index / letter_count)`.
This places A at the top (12 o'clock) and distributes the remaining letters
clockwise. The trigonometry is explained in full below.

`(letter_index + shift) % letter_count` is the key line — the wrapping
calculation. It is explained in the next section.

**CS lens:** this is a **data visualisation** — a program whose output
is a picture that makes a mathematical relationship visible. The wheel
is not decoration. It reveals the structure of the cipher: the alphabet
is not a line with two ends, it is a cycle. Any operation that works on
a cycle is modular arithmetic.

**SE lens:** the visualiser is a separate function, `draw_alphabet_wheel`,
with one parameter: the shift. This means it can be called with any shift
to show any configuration. If the shift were hardcoded inside the function,
the function could only show one cipher. Parameters make functions reusable.

---

### A Brief Note on Trigonometry

The wheel places letters around a circle. Placing a point on a circle
at a given angle requires two functions: **cosine** and **sine**.

A circle of radius 1 centred at the origin has a precise description:
every point on it satisfies `x² + y² = 1`. To place a point at angle θ
(the Greek letter theta, used by convention for angles) measured from
the positive x-axis:

```
x = cos(θ)
y = sin(θ)
```

Angles in Python's `math` module are measured in **radians**, not degrees.
One full revolution is `2π` radians (≈ 6.28), which equals 360 degrees.
To convert: `radians = degrees × π / 180`.

The wheel starts A at the top of the circle (12 o'clock position), which
is angle `π/2` radians (90 degrees). Each subsequent letter steps clockwise
by `2π / 26` radians — one twenty-sixth of a full revolution.

You do not need to memorise this. The important thing is the principle:
placing things evenly around a circle is a standard pattern, and cosine
and sine are the tools for it. They will appear again in Lesson 41
when elliptic curves are introduced.

---

### Modular Arithmetic

The wrapping behaviour the wheel shows is called **modular arithmetic**.

Ordinary arithmetic happens on a number line that extends to infinity in
both directions. Modular arithmetic happens on a number line with a fixed
length that wraps at both ends — exactly like a clock face.

A 12-hour clock shows this clearly. If it is 11 o'clock and you add 3 hours,
you do not get 14. You get 2. The clock wraps at 12.

Formally: **`a mod n`** is the remainder when `a` is divided by `n`.

```python
print(11 + 3)        # ordinary arithmetic: 14
print((11 + 3) % 12) # modular arithmetic:   2

print(25 % 26)       # 25 divided by 26 = 0 remainder 25 → 25
print(26 % 26)       # 26 divided by 26 = 1 remainder 0  → 0
print(27 % 26)       # 27 divided by 26 = 1 remainder 1  → 1
print(29 % 26)       # 29 divided by 26 = 1 remainder 3  → 3
```

Run this. You should see:

```
14
2
25
0
1
3
```

**Walkthrough:** `%` is Python's modulo operator. It performs division and
returns the remainder. `11 + 3` is 14 on an ordinary number line.
`(11 + 3) % 12` is 2 — the clock wraps at 12, so 14 becomes 2.

`26 % 26` is 0: 26 divides into 26 exactly once with no remainder —
which means position 26 on the wheel is the same as position 0.
`27 % 26` is 1: one step past the wrap point lands on position 1.

For the alphabet, the modulus (the wrap point) is 26, because there are
26 letters. Any letter index that reaches 26 wraps back to 0 (which is A).

**CS lens:** modular arithmetic defines an **equivalence class** — a set
of numbers that all represent the same position. 0, 26, 52, 78 are all
equivalent mod 26: they all land on A. This is formally written as
`0 ≡ 26 (mod 26)`. The `≡` symbol means "is congruent to" — the modular
version of equality. This concept becomes the foundation of RSA in Module 4.

**SE lens:** `%` is a built-in operator, not a function you need to write.
The language provides it because remainder arithmetic appears everywhere
in computing: wrapping array indices, cycling through states, distributing
work across servers. Recognising when a problem has cyclic structure —
and reaching for `%` — is a fundamental programming skill.

---

### Fixing the Encoder

The bug in Lesson 00 was that the shift added directly to the code point,
which pushed past `'Z'` (code point 90) into punctuation.

The fix requires working with **positions within the alphabet** (0–25)
rather than raw code points (65–90), applying mod 26, and then converting
back.

**The problem:** shift a letter by `shift` positions, wrapping at Z.

```python
def shift_character(character, shift):
    alphabet_start = ord('A')
    position = ord(character) - alphabet_start
    shifted_position = (position + shift) % 26
    return chr(shifted_position + alphabet_start)

print(shift_character('H', 3))
print(shift_character('X', 3))
print(shift_character('Y', 3))
print(shift_character('Z', 3))
```

Run this. You should see:

```
K
A
B
C
```

**Walkthrough:** `alphabet_start = ord('A')` stores 65 — the code point
of `'A'`. `position = ord(character) - alphabet_start` translates from
the code point space (65–90) to the position space (0–25). `'A'` has
position 0. `'Z'` has position 25.

`(position + shift) % 26` applies the shift and wraps. `'X'` is position 23.
Adding 3 gives 26. `26 % 26` is 0 — back to position 0, which is `'A'`.

`chr(shifted_position + alphabet_start)` translates back from position
space to code point space by adding 65.

**CS lens:** this is a **coordinate transformation** — a change of reference
point. The code points 65–90 are the computer's coordinate system.
The positions 0–25 are the alphabet's coordinate system. Subtracting
`alphabet_start` moves from one to the other, mod 26 wraps correctly
within 0–25, and adding `alphabet_start` back converts the result to
something `chr()` understands. Coordinate transformations appear in
every system that works across multiple representations.

**SE lens:** `shift_character` has one job: shift one character correctly,
with wrapping. It does not loop. It does not know about messages. It is
the smallest unit that solves the wrapping problem. `encode` will call it —
but `shift_character` does not need to know that. Small functions with
one job are easy to test and easy to reason about in isolation.

---

### Updating Encode and Decode

**The problem:** update `encode` and `decode` to use `shift_character`.

```python
def encode(message, shift):
    encoded_message = ""
    for character in message:
        encoded_message = encoded_message + shift_character(character, shift)
    return encoded_message

def decode(encoded_message, shift):
    decoded_message = ""
    for character in encoded_message:
        decoded_message = decoded_message + shift_character(character, -shift)
    return decoded_message

print(encode("HELLO", 3))
print(encode("XYZ", 3))
print(decode(encode("XYZ", 3), 3))
```

Run this. You should see:

```
KHOOR
ABC
XYZ
```

**Walkthrough:** `encode` now calls `shift_character` for each character
instead of computing the shift inline. `decode` calls `shift_character`
with `-shift` — a negative shift. `shift_character('A', -3)` computes
position 0, then `(0 + (-3)) % 26`. In Python, the `%` operator always
returns a non-negative result when the divisor (26) is positive —
so `-3 % 26` is `23`, which is position `'X'`. This means decoding
is just encoding in the other direction, and one function handles both.

**CS lens:** `decode` reuses `shift_character` with a negative shift rather
than duplicating logic. This is the **DRY principle** — Don't Repeat Yourself.
The wrapping logic lives in exactly one place. If the wrapping logic ever
needs to change, it changes in one function and both encode and decode
benefit automatically. Duplicated logic means two places to find bugs.

**SE lens:** `encode` is now a clean composition: a loop that calls a
function. The loop does not know how shifting works. `shift_character`
does not know about loops. Each has exactly one responsibility.
This composition — assemble behaviour from small, focused pieces —
is a pattern that runs through all of software engineering.

---

## Connect the Pieces

Lesson 00 produced a Caesar cipher with a bug. This lesson fixed it.
The fix is `% 26` — three characters that make the alphabet a wheel.

The concept behind those three characters is modular arithmetic.
Modular arithmetic is not a curiosity. It appears in:

- Every hash function you will build (Modules 8–9)
- RSA, where the entire cipher is multiplication modulo a very large number (Module 4)
- AES, where bytes are combined using modular polynomial arithmetic (Module 6)
- Diffie-Hellman, which is exponentiation modulo a prime (Module 7)

Every one of those uses `%` for the same reason you used it here:
arithmetic that wraps at a fixed boundary instead of running to infinity.

When you see `% n` in code from this point forward, the question to ask is:
what is the wheel, and what is its circumference?

---

## What Breaks Without This

Replace `% 26` with nothing — remove the modular step:

```python
def shift_character_broken(character, shift):
    alphabet_start = ord('A')
    position = ord(character) - alphabet_start
    shifted_position = position + shift        # no % 26
    return chr(shifted_position + alphabet_start)

print(shift_character_broken('X', 3))
print(shift_character_broken('Z', 10))
```

You will see:

```
[
i
```

Without `% 26`, positions above 25 overflow into code points beyond `'Z'`.
The result is punctuation and lowercase letters — characters the decoder
was never designed to receive. The message is corrupted, not encrypted.
The recipient cannot recover the original even with the correct key.

---

## Definition of Done

- [ ] `encode("XYZ", 3)` prints `ABC`
- [ ] `encode("HELLO", 3)` still prints `KHOOR`
- [ ] `decode(encode("ATTACK AT DAWN", 13), 13)` prints `ATTACK AT DAWN`
- [ ] `draw_alphabet_wheel(3)` displays two side-by-side wheels
- [ ] You can explain in your own words what `(position + shift) % 26` does
- [ ] You can explain why `-3 % 26` is `23` in Python and what that means for decoding
- [ ] You can name one other place in this curriculum where modular arithmetic will reappear

**Commit your work:**

```bash
git add lesson-01.py
git commit -m "Lesson 01: Fix Caesar cipher wrapping with modular arithmetic

Replace direct code-point shift with position-space arithmetic mod 26.
Encode and decode now handle the full alphabet correctly, including
X, Y, Z. Introduces modular arithmetic as the foundation for RSA,
AES, and Diffie-Hellman in later modules."
```
