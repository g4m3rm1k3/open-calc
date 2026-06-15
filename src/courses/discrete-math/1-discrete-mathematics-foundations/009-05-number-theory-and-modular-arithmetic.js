export default {
  id: 'discrete-1-05',
  slug: 'number-theory-and-modular-arithmetic',
  chapter: 'discrete-1',
  order: 7,
  title: 'Number Theory and Modular Arithmetic',
  subtitle: 'Divisibility, primes, gcd, and congruences — the mathematics behind every secure system',
  tags: ['number theory', 'divisibility', 'primes', 'gcd', 'euclidean algorithm', 'modular arithmetic'],
  aliases: 'congruence modulo gcd euclid algorithm modular inverse rsa basics',

  hook: {
    question: 'Why does modern encryption depend on arithmetic that looks like high-school remainders?',
    realWorldContext: 'RSA encryption — which secures your bank connection, your email, and your passwords — is built on a number theory problem: multiplying two large primes is easy, but factoring their product back into primes is computationally infeasible. The entire security of the internet rests on properties of integers that were studied purely for mathematical curiosity two thousand years before anyone thought to use them for cryptography.',
    previewVisualizationId: 'ModClockViz',
  },

  intuition: {
    prose: [
      `### What Number Theory Is — And Why Engineers Need It

Number theory is the study of integers and their properties: divisibility, primality, remainders, and the structure that emerges from these simple ideas. It seems like pure mathematics — and for most of its history it was. Gauss called it "the queen of mathematics." But in the 1970s, Rivest, Shamir, and Adleman discovered that classical number theory was also the most powerful toolkit for building encryption systems.

Today, every time you see "https://" in a browser, every time your phone authenticates to a network, every time a digital signature is verified — number theory is running under the hood. SHA hashing uses modular arithmetic. RSA uses prime factorization. Elliptic curve cryptography uses modular arithmetic on geometric structures. Diffie-Hellman key exchange uses discrete logarithms modulo a prime.

For engineers, number theory is not optional. This lesson covers the core ideas: divisibility, the greatest common divisor, the Euclidean algorithm, and modular arithmetic. These four topics unlock an entire world of algorithmic and cryptographic reasoning.`,

      `### Divisibility: Structure Hiding in Plain Sight

We say a divides b, written a | b, when b is an exact multiple of a — there is an integer k such that b = ak. No remainder, no decimal, exact.

3 | 12 because 12 = 3 × 4.
7 | 49 because 49 = 7 × 7.
5 ∤ 17 because 17 = 5 × 3 + 2 (remainder 2, not exact).

This sounds trivial, but divisibility is the building block of everything else. It defines what prime numbers are. It defines the GCD. It defines modular equivalence. The whole subject unfolds from this single relation.

**Key properties of divisibility:**
- If a | b and a | c, then a | (b + c): a divides any sum of its multiples.
- If a | b and b | c, then a | c: divisibility is transitive.
- If a | b, then a | (b × k) for any integer k.
- If a | b and b | a, then a = b (assuming positive integers).

These properties let you prove divisibility facts by working with the definition rather than checking every case.`,

      `### The Division Algorithm: Pinning Down the Remainder

The Division Algorithm is not an algorithm in the computational sense — it's a theorem that formalizes what "remainder" means.

**Theorem:** For any integer a and positive integer b, there exist unique integers q (quotient) and r (remainder) such that:
a = bq + r, where 0 ≤ r < b

The remainder r is always non-negative and strictly less than b. This uniqueness is critical — every integer has exactly one remainder when divided by any positive integer.

Examples:
17 = 5 × 3 + 2, so 17 mod 5 = 2
100 = 7 × 14 + 2, so 100 mod 7 = 2
−7 = 3 × (−3) + 2, so −7 mod 3 = 2 (be careful with negatives — the remainder is still non-negative)

The Division Algorithm is the foundation of the Euclidean algorithm and modular arithmetic. It tells you that every integer can be classified by its remainder — which is the idea behind modular equivalence.`,

      `### Primes: The Atoms of Arithmetic

A prime number is an integer greater than 1 whose only divisors are 1 and itself. Primes are the building blocks of all integers.

The **Fundamental Theorem of Arithmetic** says: every integer greater than 1 can be written as a product of primes, and this factorization is unique (up to order). This is what makes primes "atomic" — just as chemical elements are the unique building blocks of compounds, primes are the unique building blocks of integers.

24 = 2³ × 3
100 = 2² × 5²
360 = 2³ × 3² × 5

**Why are primes hard to work with computationally?** Finding whether a number is prime or composite is easy for small numbers but becomes difficult for very large ones. Given a 2048-bit number (around 600 decimal digits), testing primality takes milliseconds with modern algorithms. But *factoring* a known composite — finding which primes multiply to give it — is computationally intractable for well-chosen primes. This asymmetry (easy to multiply, hard to factor) is the security of RSA.

**How many primes are there?** Infinitely many. Euclid proved this around 300 BCE with an elegant proof by contradiction: assume finitely many primes p₁, p₂, ..., pₙ. Form the number N = p₁p₂...pₙ + 1. N is either prime (not in our list, contradiction) or has a prime factor not in our list (also contradiction). Either way, the finite list was incomplete.`,

      `### Greatest Common Divisor: Shared Structure

The greatest common divisor of two integers a and b, written gcd(a,b), is the largest positive integer that divides both a and b.

gcd(12, 18): divisors of 12 are {1,2,3,4,6,12}, divisors of 18 are {1,2,3,6,9,18}, common divisors are {1,2,3,6}, greatest is 6.

Finding gcd by listing all divisors works for small numbers but is slow for large ones. The Euclidean algorithm finds it in O(log(min(a,b))) steps — extraordinarily fast.

**Geometric intuition:** gcd(a,b) is the side length of the largest square tile that perfectly fills an a × b rectangle with no waste. gcd(12, 18) = 6 means you can tile a 12 × 18 room with 6 × 6 tiles exactly.

**Why gcd matters:**
- Simplifying fractions: 18/24 = 3/4 because gcd(18,24) = 6.
- LCM: lcm(a,b) = ab/gcd(a,b). The least common multiple is the smallest number both divide evenly.
- Modular inverses: a has an inverse modulo n if and only if gcd(a,n) = 1.
- Bézout's Identity: there always exist integers x,y such that ax + by = gcd(a,b).`,

      `### The Euclidean Algorithm: 2,300 Years of Speed

The Euclidean algorithm is one of the oldest algorithms known to humanity, yet it remains one of the most efficient. It computes gcd(a,b) using one key fact:

**gcd(a, b) = gcd(b, a mod b)**

Why? If d divides both a and b, then d also divides a − bq = r (any linear combination of multiples of d is a multiple of d). So d divides both b and r. The common divisors of (a,b) are exactly the common divisors of (b,r). Therefore the GCDs are equal.

Run this repeatedly until the remainder is 0. The last non-zero remainder is the GCD.

gcd(252, 198):
252 = 198 × 1 + 54 → gcd(252, 198) = gcd(198, 54)
198 = 54 × 3 + 36  → gcd(198, 54) = gcd(54, 36)
54 = 36 × 1 + 18   → gcd(54, 36) = gcd(36, 18)
36 = 18 × 2 + 0    → gcd(36, 18) = 18

Answer: gcd(252, 198) = 18.

**Why is it fast?** Each step reduces the pair's values by at least half (eventually — the remainder is always less than the divisor). After at most 2log₂(min(a,b)) steps, one value reaches 0. For a 1000-digit number, this takes about 2000 steps regardless of the size of the numbers themselves.`,

      `### Modular Arithmetic: Clock Math

Modular arithmetic asks: what is the remainder when you divide by n?

We say a ≡ b (mod n) — "a is congruent to b modulo n" — when a and b have the same remainder when divided by n. Equivalently, n divides (a − b).

13 ≡ 1 (mod 12): both leave remainder 1 when divided by 12. This is why 13:00 on a 24-hour clock is 1:00 PM.
17 ≡ 2 (mod 5): both leave remainder 2 when divided by 5.
−3 ≡ 9 (mod 12): −3 and 9 both leave remainder 9 (or equivalently, 12 divides −3 − 9 = −12). ✓

The "clock" metaphor: on a 12-hour clock, adding 15 hours to 10:00 gives (10 + 15) mod 12 = 25 mod 12 = 1, so it's 1:00. The clock wraps around.

**Why modular arithmetic is an equivalence relation:**
- Reflexive: a ≡ a (mod n) (a − a = 0, divisible by everything)
- Symmetric: if a ≡ b then b ≡ a (if n | a−b then n | b−a)
- Transitive: if a ≡ b and b ≡ c then a ≡ c

This means congruence partitions the integers into n equivalence classes (called residue classes). Mod 5 creates 5 classes: {..., −5, 0, 5, 10, ...}, {..., −4, 1, 6, 11, ...}, etc. Every integer belongs to exactly one class.`,

      `### Modular Arithmetic: The Operations

The power of modular arithmetic is that it's compatible with addition, subtraction, and multiplication:

If a ≡ a' (mod n) and b ≡ b' (mod n), then:
- a + b ≡ a' + b' (mod n)
- a − b ≡ a' − b' (mod n)
- a × b ≡ a' × b' (mod n)

**Practical implication:** to compute large numbers modulo n, you can reduce at every step. You never need to compute the full number.

What is 7¹⁰⁰ mod 11?
7¹ ≡ 7, 7² ≡ 49 ≡ 5, 7³ ≡ 7×5 = 35 ≡ 2, 7⁴ ≡ 7×2 = 14 ≡ 3, 7⁵ ≡ 7×3 = 21 ≡ 10, 7⁶ ≡ 7×10 = 70 ≡ 4, 7⁷ ≡ 7×4 = 28 ≡ 6, 7⁸ ≡ 7×6 = 42 ≡ 9, 7⁹ ≡ 7×9 = 63 ≡ 8, 7¹⁰ ≡ 7×8 = 56 ≡ 1

7¹⁰ ≡ 1 (mod 11). So 7¹⁰⁰ = (7¹⁰)¹⁰ ≡ 1¹⁰ = 1 (mod 11).

This "reduction at every step" is what makes RSA computable — you're raising huge numbers to huge powers modulo a huge modulus, but you never store a number larger than the modulus squared.

**Division in modular arithmetic** doesn't work like regular division. You can't just divide both sides by a number. Instead, you need the **modular inverse** — the number that "undoes" multiplication.`,
    ],

    callouts: [
      {
        type: 'theorem',
        title: 'Division Algorithm',
        body: 'For integers a and positive integer b, there exist unique integers q (quotient) and r (remainder) with:\na = bq + r, where 0 ≤ r < b\n\nThe remainder r is always non-negative and strictly less than b. Negative dividends: −7 mod 3 = 2 (since −7 = 3×(−3) + 2).',
      },
      {
        type: 'theorem',
        title: 'Bézout\'s Identity',
        body: 'For integers a and b (not both zero), there exist integers x and y such that:\nax + by = gcd(a,b)\n\nThe Extended Euclidean Algorithm finds x and y by working backwards through the Euclidean algorithm steps. This is how modular inverses are computed.',
      },
      {
        type: 'theorem',
        title: 'Modular Inverse Criterion',
        body: 'An integer a has a multiplicative inverse modulo n (that is, a number x such that ax ≡ 1 mod n) if and only if gcd(a,n) = 1.\n\nIf gcd(a,n) > 1, then ax mod n cycles through values that are multiples of gcd(a,n), and 1 is never reached.',
      },
    ],

    visualizations: [
      {
        id: 'DivisibilityExplorer',
        title: 'Divisibility: Factor Lattice Visualization',
        caption: 'Enter any two numbers and see all their divisors visualized as a lattice. The GCD is the highest node they share in common.',
        props: { interactive: true },
      },
      {
        id: 'PrimeFactorizationViz',
        title: 'Prime Factorization: The Building Blocks',
        caption: 'Enter any number and watch it decompose into its prime factors step by step. See why factoring large numbers is much harder than multiplying.',
        props: { interactive: true },
      },
      {
        id: 'EuclideanAlgorithmViz',
        title: 'Euclidean Algorithm: The Rectangle Interpretation',
        caption: 'Watch gcd(a,b) computed as the largest square that tiles a rectangle of dimensions a × b. Each algorithm step cuts off a square of side b and continues with the remainder.',
        props: { animated: true, interactive: true },
      },
      {
        id: 'ModClockViz',
        title: 'Modular Clock Explorer',
        caption: 'Watch integers collapse into congruence classes. Verify that addition and multiplication respect congruence — and see why division requires an inverse.',
      },
      {
        id: 'ModularArithmeticGrid',
        title: 'Addition and Multiplication Tables Modulo n',
        caption: 'Choose a modulus and explore the complete addition and multiplication tables. Spot the patterns: when does every element have a multiplicative inverse? (When n is prime.)',
        props: { interactive: true },
      },
      {
        id: 'PascalsTriangle',
        title: 'Pascal Patterns',
        caption: 'Spot modular arithmetic regularities in binomial coefficients.',
      },
    ],
  },

  math: {
    prose: [
      `### The Extended Euclidean Algorithm: Finding Bézout Coefficients

The standard Euclidean algorithm finds gcd(a,b). The extended version also finds integers x and y such that ax + by = gcd(a,b). These coefficients are the key to computing modular inverses.

The extended algorithm works by expressing each remainder as a linear combination of a and b, working backwards through the Euclidean steps.

Example: find x,y such that 252x + 198y = gcd(252, 198) = 18.

Euclidean forward pass:
252 = 198(1) + 54   → 54 = 252 − 198(1)
198 = 54(3) + 36    → 36 = 198 − 54(3)
54 = 36(1) + 18     → 18 = 54 − 36(1)
36 = 18(2) + 0

Back-substitution:
18 = 54 − 36(1)
   = 54 − [198 − 54(3)](1)
   = 54(4) − 198(1)
   = [252 − 198(1)](4) − 198(1)
   = 252(4) − 198(5)

So x = 4, y = −5. Verify: 252(4) + 198(−5) = 1008 − 990 = 18 ✓

**From Bézout to Modular Inverse:** if gcd(a,n) = 1, then ax + ny = 1. Taking this equation mod n: ax ≡ 1 (mod n). So x is the modular inverse of a.`,

      `### Fermat's Little Theorem and Euler's Theorem

**Fermat's Little Theorem:** If p is prime and gcd(a,p) = 1, then:
aᵖ⁻¹ ≡ 1 (mod p)

Example: a = 3, p = 7. 3⁶ = 729 = 7 × 104 + 1, so 3⁶ ≡ 1 (mod 7). ✓

This theorem has two major applications:
1. **Fast modular inverse:** a⁻¹ ≡ aᵖ⁻² (mod p) when p is prime. Compute using fast exponentiation.
2. **Primality testing:** if aⁿ⁻¹ ≢ 1 (mod n) for some a, then n is definitely composite. (The converse isn't always true — Carmichael numbers fool this test.)

**Euler's Theorem (generalization):** For any a with gcd(a,n) = 1:
aᵠ⁽ⁿ⁾ ≡ 1 (mod n)

where φ(n) is Euler's totient function — the count of integers from 1 to n that are coprime to n.

For prime p: φ(p) = p − 1 (all integers 1 through p−1 are coprime to a prime).
For n = pq (product of two distinct primes): φ(pq) = (p−1)(q−1).

This last formula is the heart of RSA. The encryption key e and decryption key d satisfy ed ≡ 1 (mod φ(n)). Finding d requires knowing φ(n), which requires knowing p and q. But n = pq is public — knowing n without knowing its factorization makes finding φ(n) computationally infeasible for large primes.`,

      `### Chinese Remainder Theorem

The Chinese Remainder Theorem (CRT) says: if n₁, n₂, ..., nₖ are pairwise coprime (gcd(nᵢ, nⱼ) = 1 for i ≠ j), then the system of simultaneous congruences:

x ≡ a₁ (mod n₁)
x ≡ a₂ (mod n₂)
...
x ≡ aₖ (mod nₖ)

has a unique solution modulo N = n₁n₂...nₖ.

**Algorithmic use:** CRT lets you perform computations modulo a large N by performing smaller computations modulo each nᵢ and combining results. This parallelism is faster and is used in cryptographic libraries for RSA decryption.

**Number-theoretic use:** CRT tells you that the ring ℤₙ (integers mod n) behaves like a product of simpler rings when n factors into coprime parts. This structural insight powers many advanced number-theoretic algorithms.`,
    ],

    callouts: [
      {
        type: 'theorem',
        title: 'Euclidean Algorithm Principle',
        body: 'gcd(a, b) = gcd(b, a mod b)\n\nRepeat until remainder is 0. The last non-zero remainder is gcd(a,b). Time complexity: O(log(min(a,b))) — extremely fast for very large numbers.',
      },
      {
        type: 'theorem',
        title: 'Fermat\'s Little Theorem',
        body: 'If p is prime and p ∤ a, then aᵖ⁻¹ ≡ 1 (mod p).\n\nCorollary: a⁻¹ ≡ aᵖ⁻² (mod p). Compute modular inverses via fast exponentiation in O(log p) time.',
      },
      {
        type: 'definition',
        title: 'Euler\'s Totient Function φ(n)',
        body: 'φ(n) = count of integers from 1 to n that are coprime to n.\n\nφ(prime p) = p − 1\nφ(p²) = p(p−1)\nφ(pq) = (p−1)(q−1) for distinct primes p, q\n\nThis function is central to RSA: the decryption exponent d satisfies ed ≡ 1 (mod φ(n)).',
      },
    ],

    visualizations: [
      {
        id: 'ExtendedEuclideanViz',
        title: 'Extended Euclidean Algorithm: Finding Bézout Coefficients',
        caption: 'Step through the extended algorithm. See how back-substitution expresses each remainder as a linear combination of the original inputs. Watch the Bézout coefficients emerge.',
        props: { guided: true, interactive: true },
      },
      {
        id: 'ModularInverseExplorer',
        title: 'Modular Inverse: When Does ax ≡ 1 (mod n) Have a Solution?',
        caption: 'Choose a and n. See the full multiplication table and whether a has an inverse. Observe that inverses exist exactly when gcd(a,n) = 1.',
        props: { interactive: true },
      },
      {
        id: 'FermatTheoremViz',
        title: 'Fermat\'s Little Theorem: Powers Cycling Modulo a Prime',
        caption: 'Choose a prime p and a base a. Watch aᵏ cycle through residues and always return to 1 at k = p−1. Change a and watch the cycle length.',
        props: { interactive: true },
      },
    ],
  },

  rigor: {
    prose: [
      `### Proof Structure for Divisibility Claims

Divisibility proofs have a standard pattern: rewrite using the definition (b = ak for some integer k), then algebraically manipulate to show the desired divisibility.

**Template:** To prove d | n, show that n = d × (integer expression).

Example: Prove that if a | b and a | c, then a | (b + c).

Proof: Since a | b, there exists integer j with b = aj. Since a | c, there exists integer k with c = ak. Then b + c = aj + ak = a(j + k). Since j + k is an integer, a | (b + c). □

**Common mistakes in modular proofs:**
1. **Illegal cancellation:** from 6 ≡ 4 (mod 2), you cannot conclude 3 ≡ 2 (mod 1) by dividing by 2. Division in modular arithmetic requires the divisor to be invertible (coprime to the modulus).
2. **Forgetting the definition:** instead of reasoning from "a ≡ b (mod n)," always rewrite as "n | (a − b)" first. This converts to divisibility, where algebraic manipulation is clearer.
3. **Confusing ≡ and =:** a ≡ b (mod n) means they're in the same residue class, not that they're equal. 15 ≡ 3 (mod 12) but 15 ≠ 3.`,

      `### Loop Invariant for the Euclidean Algorithm

To prove the Euclidean algorithm is correct, state a loop invariant:

**Invariant:** At every step with current pair (a', b'), gcd(a', b') = gcd(a, b).

**Base case:** Initially (a', b') = (a, b). Trivially gcd(a,b) = gcd(a,b).

**Inductive step:** After one step, the new pair is (b', a' mod b'). We need gcd(b', a' mod b') = gcd(a', b').

Let r = a' mod b', so a' = b'q + r. Any common divisor d of a' and b' also divides a' − b'q = r, so d | r. Thus d is a common divisor of b' and r. Conversely, any common divisor of b' and r divides b'q + r = a', so it's a common divisor of a' and b'. The sets of common divisors are identical, so the greatest is the same.

**Termination:** The remainder r = a' mod b' satisfies 0 ≤ r < b'. So b' strictly decreases each step. The sequence of b' values is a strictly decreasing sequence of non-negative integers, which must eventually reach 0. □`,
    ],

    callouts: [
      {
        type: 'insight',
        title: 'The RSA Connection',
        body: 'RSA key generation:\n1. Choose large primes p, q\n2. n = pq (public modulus)\n3. φ(n) = (p−1)(q−1)\n4. Choose e with gcd(e, φ(n)) = 1 (public exponent)\n5. Find d with ed ≡ 1 (mod φ(n)) via extended Euclidean (private key)\n\nEncrypt: c = mᵉ mod n. Decrypt: m = cᵈ mod n.\nSecurity: knowing n but not p and q makes finding φ(n) and thus d computationally infeasible.',
      },
    ],

    visualizations: [
      {
        id: 'RSAMiniDemo',
        title: 'RSA in Action: Small-Scale Demonstration',
        caption: 'Choose two small primes and watch the full RSA key generation, encryption, and decryption process with visible numbers. Understand exactly which number theory operations are involved at each step.',
        props: { interactive: true, guided: true },
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-05-ex0',
      title: 'Warm-Up: Clock Arithmetic',
      problem: 'It is 10:00. What time will it be in 37 hours?',
      steps: [
        { expression: '10 + 37 = 47', annotation: 'Add in ordinary arithmetic first.' },
        { expression: '47 \\mod 12 = 47 - 12 \\times 3 = 47 - 36 = 11', annotation: 'Reduce modulo 12 (12-hour clock).' },
        { expression: '11:00', annotation: 'The remainder is the answer.' },
      ],
      conclusion: 'Modular arithmetic is controlled wrap-around. The clock "forgets" how many full cycles passed and only remembers where you landed.',
    },
    {
      id: 'discrete-1-05-ex1',
      title: 'Euclidean Algorithm: gcd(252, 198)',
      problem: 'Use the Euclidean algorithm to compute gcd(252,198). Verify with the rectangle intuition.',
      steps: [
        { expression: '252 = 198 \\times 1 + 54 \\quad \\Rightarrow \\quad \\gcd(252,198)=\\gcd(198,54)', annotation: '252 = 198(1) + 54. New pair: (198, 54).' },
        { expression: '198 = 54 \\times 3 + 36 \\quad \\Rightarrow \\quad \\gcd(198,54)=\\gcd(54,36)', annotation: '198 = 54(3) + 36. New pair: (54, 36).' },
        { expression: '54 = 36 \\times 1 + 18 \\quad \\Rightarrow \\quad \\gcd(54,36)=\\gcd(36,18)', annotation: '54 = 36(1) + 18. New pair: (36, 18).' },
        { expression: '36 = 18 \\times 2 + 0 \\quad \\Rightarrow \\quad \\gcd(36,18)=18', annotation: 'Remainder is 0. Last nonzero remainder is the GCD.' },
      ],
      conclusion: 'gcd(252, 198) = 18. Rectangle check: an 18×18 tile exactly fills a 252×198 room (252 = 18×14, 198 = 18×11).',
    },
    {
      id: 'discrete-1-05-ex2',
      title: 'Modular Inverse via Extended Euclidean',
      problem: 'Find the multiplicative inverse of 7 modulo 26. (Used in the Caesar cipher and affine cipher.)',
      steps: [
        { expression: '\\gcd(7, 26): \\quad 26 = 7(3) + 5, \\quad 7 = 5(1) + 2, \\quad 5 = 2(2) + 1', annotation: 'Euclidean algorithm: gcd(7,26) = 1. Inverse exists.' },
        { expression: '1 = 5 - 2(2)', annotation: 'Back-substitute from the last step.' },
        { expression: '1 = 5 - (7 - 5)(2) = 5(3) - 7(2)', annotation: 'Substitute 2 = 7 − 5(1).' },
        { expression: '1 = (26 - 7 \\cdot 3)(3) - 7(2) = 26(3) - 7(11)', annotation: 'Substitute 5 = 26 − 7(3).' },
        { expression: '7 \\cdot (-11) \\equiv 1 \\pmod{26} \\quad \\Rightarrow \\quad -11 \\equiv 15 \\pmod{26}', annotation: '−11 mod 26 = 15. Verify: 7 × 15 = 105 = 26(4) + 1 ≡ 1 (mod 26). ✓' },
      ],
      conclusion: 'The modular inverse of 7 modulo 26 is 15. In the affine cipher, this is the decryption key when the encryption key is 7.',
    },
    {
      id: 'discrete-1-05-ex3',
      title: 'Fast Modular Exponentiation',
      problem: 'Compute 3⁵⁰ mod 7 using Fermat\'s Little Theorem.',
      steps: [
        { expression: '7 \\text{ is prime and } \\gcd(3,7)=1 \\Rightarrow 3^6 \\equiv 1 \\pmod 7', annotation: 'Fermat\'s Little Theorem: 3^(7-1) = 3^6 ≡ 1 (mod 7).' },
        { expression: '50 = 6 \\times 8 + 2', annotation: 'Decompose the exponent: 50 = 8 full cycles + remainder 2.' },
        { expression: '3^{50} = 3^{6 \\cdot 8 + 2} = (3^6)^8 \\cdot 3^2 \\equiv 1^8 \\cdot 9 \\equiv 9 \\equiv 2 \\pmod 7', annotation: '(3^6)^8 ≡ 1^8 = 1. Then 1 × 3² = 9 ≡ 2 (mod 7).' },
      ],
      conclusion: '3⁵⁰ mod 7 = 2. Fermat\'s theorem reduces large exponents to their remainder modulo p−1.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-05-ch0',
      difficulty: 'easy',
      problem: 'What is 2024 mod 7?',
      hint: 'Divide 2024 by 7 and take the remainder. Or: note 2023 = 7 × 289, so 2024 = 7 × 289 + 1.',
      walkthrough: [
        { expression: '2024 \\div 7 = 289 \\text{ remainder } 1', annotation: '7 × 289 = 2023, so remainder is 2024 − 2023 = 1.' },
      ],
      answer: '1',
    },
    {
      id: 'discrete-1-05-ch1',
      difficulty: 'easy',
      problem: 'Compute gcd(84, 30) using the Euclidean algorithm.',
      walkthrough: [
        { expression: '84 = 30(2) + 24', annotation: 'First step: 84 mod 30 = 24.' },
        { expression: '30 = 24(1) + 6', annotation: 'Second step: 30 mod 24 = 6.' },
        { expression: '24 = 6(4) + 0', annotation: 'Remainder 0. Last nonzero remainder is gcd.' },
      ],
      answer: 'gcd(84, 30) = 6',
    },
    {
      id: 'discrete-1-05-ch2',
      difficulty: 'medium',
      problem: 'Does 14 have a multiplicative inverse modulo 35? Explain why or why not.',
      hint: 'Use the modular inverse criterion: inverse exists iff gcd(14, 35) = 1.',
      walkthrough: [
        { expression: '\\gcd(14, 35): \\quad 35 = 14(2) + 7, \\quad 14 = 7(2) + 0', annotation: 'gcd(14,35) = 7.' },
        { expression: '\\gcd(14,35) = 7 \\neq 1', annotation: 'Since they share a common factor of 7, the inverse does not exist.' },
        { expression: '14x \\equiv 1 \\pmod{35} \\Rightarrow 7(2x) \\equiv 1 \\pmod{35}', annotation: 'Since 7 | 14 and 7 | 35, the left side is always divisible by 7. But 1 is not divisible by 7 — no solution.' },
      ],
      answer: 'No inverse. gcd(14,35) = 7 ≠ 1. An inverse mod n requires the number to be coprime with n.',
    },
    {
      id: 'discrete-1-05-ch3',
      difficulty: 'hard',
      problem: 'Find the smallest nonnegative x such that x ≡ 5 (mod 7) and x ≡ 2 (mod 9).',
      hint: 'Parametrize the first congruence as x = 5 + 7k, then substitute into the second.',
      walkthrough: [
        { expression: 'x = 5 + 7k \\text{ for some integer } k', annotation: 'Encode the first congruence as a parametric equation.' },
        { expression: '5 + 7k \\equiv 2 \\pmod 9 \\Rightarrow 7k \\equiv -3 \\equiv 6 \\pmod 9', annotation: 'Substitute into the second congruence. −3 mod 9 = 6.' },
        { expression: '7^{-1} \\pmod 9: \\quad 7(4)=28=9(3)+1 \\Rightarrow 7^{-1} \\equiv 4 \\pmod 9', annotation: 'Find modular inverse of 7 mod 9: 7×4 = 28 ≡ 1 (mod 9).' },
        { expression: 'k \\equiv 4 \\times 6 = 24 \\equiv 6 \\pmod 9', annotation: 'Multiply both sides by inverse.' },
        { expression: 'k = 6 \\Rightarrow x = 5 + 7(6) = 47', annotation: 'Smallest nonneg solution.' },
      ],
      answer: 'x = 47. Check: 47 mod 7 = 5 ✓, 47 mod 9 = 2 ✓',
    },
    {
      id: 'discrete-1-05-ch4',
      difficulty: 'hard',
      problem: 'A scheduling job runs every 17 hours on a 24-hour clock starting at 03:00. After how many runs does it return to 03:00?',
      hint: 'You need 17k ≡ 0 (mod 24), i.e., the clock returns to start. Since gcd(17,24) = 1, what is the smallest k?',
      walkthrough: [
        { expression: '\\text{Return to start when } 17k \\equiv 0 \\pmod{24}', annotation: 'After k runs, accumulated time is 17k. Return when this is divisible by 24.' },
        { expression: '\\gcd(17,24) = 1 \\Rightarrow 17 \\text{ has an inverse mod 24}', annotation: '17 and 24 are coprime.' },
        { expression: '17k \\equiv 0 \\pmod{24} \\Rightarrow k \\equiv 0 \\pmod{24}', annotation: 'Multiply both sides by 17⁻¹: k ≡ 0. So smallest positive k is 24.' },
        { expression: '\\text{Runs visit times: 03, 20, 13, 06, 23, 16, 09, 02, 19, 12, ...}', annotation: 'The coprime step size 17 visits all 24 residues before repeating.' },
      ],
      answer: '24 runs. A step size coprime to the modulus generates a complete cycle through all residues before repeating.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'a | b', meaning: 'Divisibility — a divides b, i.e., b = ak for some integer k' },
      { symbol: 'gcd(a, b)', meaning: 'Greatest Common Divisor — largest integer dividing both a and b' },
      { symbol: 'lcm(a, b)', meaning: 'Least Common Multiple — smallest positive integer divisible by both. lcm(a,b) = ab/gcd(a,b)' },
      { symbol: 'a ≡ b (mod n)', meaning: 'Congruence — a and b have the same remainder mod n, equivalently n | (a − b)' },
      { symbol: 'a⁻¹ (mod n)', meaning: 'Modular Inverse — x such that ax ≡ 1 (mod n). Exists iff gcd(a,n) = 1' },
      { symbol: 'φ(n)', meaning: 'Euler\'s Totient Function — count of integers from 1 to n coprime to n' },
    ],
    rulesOfThumb: [
      'To prove divisibility: rewrite with the definition (b = ak), then manipulate algebraically.',
      'Euclidean algorithm: O(log(min(a,b))) — extremely fast. Use it first for any gcd computation.',
      'Modular inverse of a mod n exists ONLY when gcd(a,n) = 1. Always check this first.',
      'gcd(a,b) × lcm(a,b) = a × b. Use this to find lcm from gcd.',
      'Large modular exponentiation: use Fermat/Euler to reduce the exponent, then fast exponentiation.',
      'In modular arithmetic, always rewrite ≡ as divisibility before algebraic manipulation. Prevents illegal cancellation.',
    ],
  },

  crossRefs: [
    { lessonSlug: 'logic-and-proofs', label: 'Proof Techniques', context: 'Divisibility and prime arguments use direct proof and contradiction. The infinitude of primes is proven by contradiction.' },
    { lessonSlug: 'induction-and-recursion', label: 'Induction', context: 'The correctness of the Euclidean algorithm is proven with a loop invariant — which is an inductive argument.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations', context: 'Congruence mod n is a canonical equivalence relation. The residue classes are its equivalence classes.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms', context: 'The Euclidean algorithm is a model of efficient computation. RSA uses modular exponentiation (O(log e) multiplications).' },
  ],

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'The Fundamental Theorem of Arithmetic is often proven using strong induction. Infinitely many primes: proof by contradiction.',
      },
      {
        lessonId: 'discrete-1-03',
        label: 'Induction and Recursion',
        note: 'Loop invariant proofs for the Euclidean algorithm use the same inductive reasoning structure.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-10-boolean-algebra-and-circuits',
        label: 'Boolean Algebra',
        note: 'Arithmetic mod 2 (XOR, AND) is the foundation of bitwise operations and hardware circuits.',
      },
      {
        lessonId: 'discrete-2-05-cryptography',
        label: 'Cryptography',
        note: 'RSA, Diffie-Hellman, and elliptic curve cryptography all build directly on the modular arithmetic from this lesson.',
      },
    ],
  },

  mentalModel: [
    'Divisibility: a | b means b = a × (integer). The foundation of all number theory.',
    'Primes are the atoms of the integers. Every integer > 1 factors uniquely into primes.',
    'GCD: largest shared building block. Euclidean algorithm finds it in O(log n) — as fast as counting digits.',
    'Modular arithmetic: clock math. a ≡ b (mod n) means they land at the same position on an n-hour clock.',
    'Modular inverse: the number x such that ax wraps around to 1. Exists exactly when gcd(a,n) = 1.',
    'RSA security: multiplying two primes is easy; factoring the product is computationally infeasible at large scale.',
  ],

  assessment: {
    questions: [
      {
        id: 'nt-assess-1',
        type: 'choice',
        text: 'What is the value of 17 mod 5?',
        options: ['1', '2', '3', '0'],
        answer: '2',
        hint: '17 = 5 × 3 + 2. The remainder when 17 is divided by 5 is 2.',
      },
      {
        id: 'nt-assess-2',
        type: 'input',
        text: 'What is gcd(12, 18)?',
        answer: '6',
        hint: '12 = 2² × 3, 18 = 2 × 3². Common factors: 2 × 3 = 6.',
      },
      {
        id: 'nt-assess-3',
        type: 'choice',
        text: 'Why does the Euclidean algorithm use gcd(a,b) = gcd(b, a mod b)?',
        options: [
          'Because modular arithmetic is defined that way',
          'Because any common divisor of a and b also divides any linear combination of a and b, including the remainder',
          'Because b is always smaller than a',
          'Because the algorithm terminates faster this way',
        ],
        answer: 'Because any common divisor of a and b also divides any linear combination of a and b, including the remainder',
        hint: 'If d|a and d|b, then d|(a − bq) for any q. So d|r. The common divisors of (a,b) are identical to the common divisors of (b,r).',
      },
    ],
  },

  quiz: [
    {
      id: 'nt-q1',
      type: 'choice',
      text: 'For a number a to have a multiplicative inverse mod n, which condition is required?',
      options: ['a must be prime', 'a must be less than n', 'gcd(a,n) = 1', 'n must be prime'],
      answer: 'gcd(a,n) = 1',
      hints: ['gcd(a,n) = 1 is necessary AND sufficient. If they share a common factor, ax mod n cycles through multiples of that factor and never reaches 1.'],
    },
    {
      id: 'nt-q2',
      type: 'choice',
      text: 'The Euclidean algorithm replaces the pair (a,b) with (b, a mod b) at each step. Why does this terminate?',
      options: [
        'Because a mod b is always less than b, so values strictly decrease',
        'Because a mod b is always 0',
        'Because the algorithm counts down from a to 1',
        'Because b always equals gcd(a,b)',
      ],
      answer: 'Because a mod b is always less than b, so values strictly decrease',
      hints: ['The remainder r = a mod b satisfies 0 ≤ r < b. So the second element of the pair strictly decreases each step. A strictly decreasing sequence of non-negative integers must reach 0.'],
    },
    {
      id: 'nt-q3',
      type: 'choice',
      text: 'Why is RSA encryption secure?',
      options: [
        'Because the encryption key is very long',
        'Because multiplying two large primes is easy, but factoring their product back into primes is computationally infeasible',
        'Because modular arithmetic is impossible to compute',
        'Because the primes used are secret',
      ],
      answer: 'Because multiplying two large primes is easy, but factoring their product back into primes is computationally infeasible',
      hints: ['RSA security rests on the asymmetry between multiplication (fast) and factoring (hard for large primes). Without knowing the prime factors, computing φ(n) is infeasible, so the private key d cannot be recovered.'],
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
