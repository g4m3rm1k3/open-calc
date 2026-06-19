# Mathematics Through Cryptography

### A Lesson Series

> **What you need to start:** basic algebra — variables, equations, solving for x.
> Everything else is introduced in the lesson that first needs it.
> No linear algebra. No abstract algebra. No prior cryptography. Nothing assumed.

> **How this works:** every piece of mathematics in this curriculum appears because
> a cipher needs it. You will never be asked to learn a concept in the abstract.
> You will be asked to build something, run into a wall, and discover that the
> mathematics is the way through the wall.

---

## Module 0 — Your First Cipher

_You will build a working cipher in the first lesson. Everything in the curriculum
grows from that first cipher breaking in a specific and interesting way._

| #   | Lesson                           | What math appears                                                         | What you build                                                    |
| --- | -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 00  | **Hiding a Message**             | None yet — just the idea of encoding                                      | A Caesar cipher: encode and decode any message                    |
| 01  | **The Clock That Wraps Around**  | Modular arithmetic — what `mod` means, why it exists, how to calculate it | A generalised shift cipher that works for any alphabet size       |
| 02  | **Every Cipher Has a Key Space** | Counting, multiplication as counting, what "how many possible keys" means | A key space calculator — how long would it take to try every key? |
| 03  | **Breaking the Caesar Cipher**   | Frequency — what it means for letters to appear at predictable rates      | An automated Caesar breaker that decrypts without knowing the key |

_After lesson 03 you have built a cipher and broken it. The rest of the curriculum
is the story of building ciphers strong enough to resist the attack you just wrote._

---

## Module 1 — Making Keys Harder to Guess

_The Caesar cipher breaks because one key shifts everything the same way.
What if the key was longer — a whole word? This is the Vigenère cipher.
It looks much stronger. Lesson 07 will show you it is not._

| #   | Lesson                               | What math appears                                                                                     | What you build                                                                    |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 04  | **A Key That Is a Word**             | None new — applying mod from lesson 01 to multiple positions                                          | A Vigenère cipher: encode and decode with a keyword                               |
| 05  | **Finding the Key Length**           | GCD — what it is, why it exists, how the Euclidean algorithm finds it                                 | A key-length detector using the Kasiski test                                      |
| 06  | **Finishing the Break**              | Index of coincidence — a measure of how "English-shaped" text is                                      | A full Vigenère breaker: key length → key letters → plaintext                     |
| 07  | **What Makes a Cipher Unbreakable?** | Probability — independent events, conditional probability, what "no information" means mathematically | An entropy calculator; a proof-by-code that some ciphers are provably unbreakable |

_Lesson 07 introduces Claude Shannon's result: a provably unbreakable cipher exists.
It is called the one-time pad. It also has a fatal flaw. That flaw drives
everything in Modules 2 and beyond._

---

## Module 2 — XOR and the One-Time Pad

_To understand why the one-time pad works — and why every modern cipher
is trying to approximate it — you need to understand XOR.
XOR is simple arithmetic with strange properties. Those properties are the
foundation of almost all modern cryptography._

| #   | Lesson                                     | What math appears                                                                                          | What you build                                                                       |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 08  | **Binary — What Computers Actually Store** | Binary numbers, converting between binary and decimal, what a bit is                                       | A binary converter and a bit-pattern visualiser                                      |
| 09  | **XOR — Addition Without Carrying**        | XOR as an operation, its truth table, its algebraic properties (its own inverse, commutative, associative) | An XOR calculator with a visualiser showing why XOR undoes itself                    |
| 10  | **The One-Time Pad**                       | Applying XOR as encryption, why random XOR gives away nothing                                              | A working one-time pad: encrypt and decrypt any binary message                       |
| 11  | **Why You Can Never Reuse the Key**        | What happens algebraically when two messages share a key                                                   | A key-reuse attacker — given two ciphertexts with the same key, recover the messages |

---

## Module 3 — Prime Numbers

_The one-time pad is unbreakable but useless at scale: the key must be as long
as the message, and you can never reuse it. Real cryptography needs a different
approach. The solution comes from prime numbers and a surprising property they have._

| #   | Lesson                                         | What math appears                                                                                               | What you build                                             |
| --- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 12  | **What Is a Prime Number?**                    | Primes, composite numbers, the fundamental theorem of arithmetic — every number factors into primes uniquely    | A prime factoriser                                         |
| 13  | **Finding Primes — The Sieve**                 | The sieve of Eratosthenes, how to think about algorithm efficiency                                              | A prime sieve — find all primes up to n                    |
| 14  | **GCD Revisited — and Modular Inverses**       | Extended Euclidean algorithm, what a modular inverse is and when it exists, Bezout's theorem                    | A modular inverse calculator with step-by-step working     |
| 15  | **Euler's Totient — Counting Coprime Numbers** | What coprime means, Euler's totient function φ(n), how to calculate it from prime factors                       | A totient calculator                                       |
| 16  | **Fermat's Little Theorem**                    | What the theorem says, why it is true (proof by example first, then algebraic), what it implies for computation | A fast modular exponentiation calculator using the theorem |

---

## Module 4 — RSA

_RSA is the first cipher in this curriculum where two people who have never
met before can communicate secretly. This seems impossible. It is not.
It depends entirely on the mathematics in Module 3._

| #   | Lesson                                  | What math appears                                                                                      | What you build                                                               |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 17  | **Public Keys — The Lock and Key Idea** | Asymmetry — functions that are easy to compute but hard to reverse                                     | A conceptual model: a combination lock anyone can close, only you can open   |
| 18  | **RSA Key Generation**                  | Putting Modules 3 and 4 together: choose primes → compute n and φ(n) → find e and d                    | An RSA key generator: input two primes, output a public and private key pair |
| 19  | **RSA Encryption and Decryption**       | Modular exponentiation, why the math of decryption undoes encryption                                   | A working RSA encrypt and decrypt                                            |
| 20  | **Why RSA Is Hard to Break**            | Integer factorisation, why it is believed to be hard, what "believed to be hard" means in cryptography | A small-key RSA breaker — and a demonstration of where it fails              |
| 21  | **RSA in Practice — What Goes Wrong**   | Padding, why textbook RSA is insecure, what OAEP is                                                    | A padding oracle demonstration                                               |

---

## Module 5 — Algebra With New Rules

_RSA uses ordinary multiplication and exponentiation — just with `mod` applied.
The next cipher, AES, does something stranger: it multiplies bytes together
using rules that look nothing like ordinary multiplication.
To understand why, you need to understand what makes a set of numbers
a useful algebraic structure. This module introduces that idea from scratch._

| #   | Lesson                           | What math appears                                                                                                                          | What you build                                                                                  |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 22  | **What Is a Group?**             | Groups — a set with one operation satisfying four rules, why those rules matter, everyday examples (integers under addition, a clock face) | A group verifier: given a set and an operation, check whether it forms a group                  |
| 23  | **Cyclic Groups and Generators** | Generators, what it means for a group to be generated by one element, the order of an element                                              | A generator finder for integer groups                                                           |
| 24  | **What Is a Field?**             | Fields — a set with two operations (addition and multiplication) satisfying specific rules, why ℚ is a field and ℤ is not                  | A field axiom checker                                                                           |
| 25  | **Why We Need a Finite Field**   | The problem with doing AES over ordinary integers — the numbers grow without bound and do not wrap cleanly                                 | A demonstration of what goes wrong when you try to build AES over ℤ                             |
| 26  | **The Two-Element Field GF(2)**  | GF(2): the smallest possible field, addition is XOR, multiplication is AND, why this is already familiar                                   | A GF(2) arithmetic calculator — and the realisation that you have been using it since lesson 09 |
| 27  | **Polynomials Over GF(2)**       | What a polynomial is (revisited from basic algebra), polynomial arithmetic over GF(2), why coefficients are just 0 and 1                   | A GF(2) polynomial arithmetic engine                                                            |
| 28  | **Irreducible Polynomials**      | What makes a polynomial irreducible (analogous to what makes a number prime), how to check                                                 | An irreducibility checker for GF(2) polynomials                                                 |
| 29  | **GF(2⁸) — The Field AES Uses**  | Arithmetic in GF(2⁸): add and multiply polynomials mod an irreducible polynomial of degree 8, why the result always fits in one byte       | A GF(2⁸) multiplier — multiply any two bytes, get a byte back                                   |

_After lesson 29 you have built the arithmetic engine that AES runs on.
Every byte in AES is an element of GF(2⁸). Every operation AES performs
is arithmetic in this field. Module 6 assembles the cipher._

---

## Module 6 — AES

_AES is the cipher your browser uses right now for every HTTPS connection.
By the end of this module you will have built it from scratch —
not by calling a library, but by implementing every operation yourself,
understanding every byte._

| #   | Lesson                                   | What math appears                                                                                                                           | What you build                                                                    |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 30  | **What AES Looks Like From the Outside** | None new — just the structure: 16-byte blocks, a key, rounds                                                                                | An AES skeleton: accept a block, pass it through empty round functions, return it |
| 31  | **The State — A Grid of Bytes**          | Matrices introduced from scratch: a rectangular arrangement of values, how to index into one, why a 4×4 grid of bytes is a useful structure | A state visualiser: show the 16 bytes of a block as a 4×4 grid                    |
| 32  | **SubBytes — Looking Up Inverses**       | Multiplicative inverses in GF(2⁸), the affine transformation that builds the S-box                                                          | A SubBytes calculator with derivation of each entry in the lookup table           |
| 33  | **ShiftRows — Moving Bytes Around**      | Permutations, cyclic shifts                                                                                                                 | ShiftRows added to the visualiser                                                 |
| 34  | **MixColumns — Multiplying Columns**     | Matrix multiplication introduced from scratch, matrix multiplication over GF(2⁸)                                                            | MixColumns added to the visualiser                                                |
| 35  | **AddRoundKey and the Key Schedule**     | XOR as field addition (already familiar), how the key is expanded across rounds                                                             | Full AES key schedule                                                             |
| 36  | **AES-128 — One Complete Encryption**    | All of Module 6                                                                                                                             | A working AES-128 encryption and decryption, implemented from scratch             |

---

## Module 7 — Diffie-Hellman and the Discrete Logarithm

_AES is symmetric: both parties need the same key. How do two people
agree on a key when anyone could be listening? This is the key exchange
problem. Diffie and Hellman's solution is one of the most elegant ideas
in the history of mathematics._

| #   | Lesson                                    | What math appears                                                                                              | What you build                                                                            |
| --- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 37  | **The Key Exchange Problem**              | None new — just the problem stated precisely                                                                   | A demonstration of the problem: two people, one eavesdropper, how do they share a secret? |
| 38  | **The Discrete Logarithm**                | What a logarithm is (revisited from basic algebra), why the discrete version is much harder, what "hard" means | A discrete log solver — and a demonstration of where it becomes infeasible                |
| 39  | **Diffie-Hellman Key Exchange**           | Modular exponentiation (familiar from Module 3), why commutativity makes DH work                               | A working DH key exchange                                                                 |
| 40  | **Attacking DH — Small Subgroup Attacks** | Subgroups, Lagrange's theorem revisited, what happens with weak parameters                                     | A small-subgroup attack demonstration                                                     |

---

## Module 8 — Elliptic Curves

_Diffie-Hellman over integers requires very large numbers to be secure.
Elliptic curves give a group where the same problem is much harder —
which means the same security with much smaller keys.
The mathematics of elliptic curves is also some of the most beautiful
in this curriculum._

| #   | Lesson                             | What math appears                                                                                                         | What you build                                  |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 41  | **What Is a Curve?**               | Equations in two variables, what it means to plot a curve, the Weierstrass equation y² = x³ + ax + b                      | An elliptic curve plotter over the real numbers |
| 42  | **Adding Points on a Curve**       | The chord-and-tangent construction, why three collinear points on the curve define a group law                            | An interactive point addition visualiser        |
| 43  | **The Algebra of Point Addition**  | Deriving the slope formulas, the algebraic group law, the point at infinity as the identity                               | A point addition calculator                     |
| 44  | **Curves Over Finite Fields**      | Moving from ℝ to GF(p): what the curve looks like, how the group law still works, Hasse's theorem (how many points exist) | A finite-field curve explorer                   |
| 45  | **Scalar Multiplication**          | Repeated addition, the double-and-add algorithm, why this is the elliptic curve analogue of exponentiation                | A scalar multiplication engine                  |
| 46  | **ECDH — Key Exchange on a Curve** | The elliptic curve discrete logarithm problem                                                                             | A working ECDH key exchange                     |
| 47  | **ECDSA — Signing With a Curve**   | Nonces, the signature equation, verification                                                                              | A working ECDSA sign and verify                 |

---

## Module 9 — Hash Functions

| #   | Lesson                                | What math appears                                                                                           | What you build                                                     |
| --- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 48  | **What Is a Hash Function?**          | Functions (revisited), the properties a cryptographic hash needs: preimage resistance, collision resistance | A hash property tester                                             |
| 49  | **The Birthday Problem**              | Probability: how likely is a collision, why collision resistance is harder than it looks                    | A birthday attack simulator                                        |
| 50  | **The Merkle-Damgård Construction**   | Compression functions, iterated construction                                                                | A Merkle-Damgård skeleton                                          |
| 51  | **SHA-256 From Scratch**              | Bitwise operations (familiar from Module 2), the message schedule, round constants                          | A working SHA-256 implementation                                   |
| 52  | **Length Extension Attacks and HMAC** | What goes wrong with naive hash-based MACs, the HMAC fix                                                    | An HMAC implementation and a length extension attack demonstration |

---

## Module 10 — A Secure Channel

_Every lesson in this curriculum has built one piece of a secure channel.
This module assembles them._

| #   | Lesson                                       | What math appears                                                         | What you build                                                                                      |
| --- | -------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 53  | **AES-GCM — Encryption With Authentication** | Galois field multiplication (familiar from Module 5), GHASH, the GCM mode | A working AES-GCM encrypt and decrypt                                                               |
| 54  | **A Toy TLS Handshake**                      | None new — this is engineering, not mathematics                           | An ECDH handshake followed by AES-GCM: two parties, no prior shared secret, fully encrypted channel |

---

## What You Will Know at the End

**Mathematics you will have learned, from scratch:**
modular arithmetic · GCD and the Euclidean algorithm · prime numbers and factorisation ·
Euler's totient · Fermat's little theorem · probability and entropy · binary arithmetic ·
groups · fields · polynomial arithmetic · finite field arithmetic · matrices ·
elliptic curves · discrete logarithms · cryptographic hash functions

**Linear algebra you will have learned, through AES:**
matrices as data structures · matrix indexing · matrix multiplication ·
matrix multiplication over a finite field · why the MDS property matters

**Cryptography you will have built:**
Caesar cipher · Vigenère cipher · one-time pad · RSA ·
AES-128 (from scratch) · Diffie-Hellman · ECDH · ECDSA ·
SHA-256 (from scratch) · HMAC · AES-GCM · a toy secure channel

---

## A Note on Linear Algebra

Linear algebra appears in Module 6 (AES), introduced from scratch.
You will meet matrices for the first time when AES needs them —
as a 4×4 grid of bytes, and a specific way of mixing the columns of that grid.
By the time the word "matrix" appears you will already understand why it is useful
before you know what it is called.

This is the right way to learn linear algebra. The abstraction sticks
when you have already felt the need for it.
