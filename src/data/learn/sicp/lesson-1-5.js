export const lesson = {
  id: 'sicp-1-5',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.4–1.2.6  Exponentiation, GCD, and Primality',
  checkpoints: [
    { id: 'cp-fast-expt',  label: 'Fast Exponentiation' },
    { id: 'cp-gcd-prime',  label: 'GCD & Primality' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Sections 1.2.4 through 1.2.6 are a showcase of algorithmic ideas. Three classic problems — raising a number to a power, finding the greatest common divisor, testing for primality — each solved with an algorithm whose cleverness dramatically beats the naive approach. The recurring theme is that a smarter formulation of the problem can reduce the cost from linear to logarithmic.',
      code: null,
    },

    // ── Terminology: Order of Growth ──────────────────────────────────────────────
    {
      type: 'narration',
      id: 'order-of-growth-vocab',
      text: 'SICP measures algorithm cost with order of growth. The notation Θ(f(n)) — read "theta of f of n" — means the resource usage grows proportionally to f(n) as the input n grows. Θ(n) is linear: double the input, roughly double the work. Θ(log n) is logarithmic: double the input, add a fixed amount of work. Θ(1) is constant: the input size does not affect the cost. Order of growth describes the shape of the cost curve — not the exact number of steps, but how the count scales with the problem size.',
      code: null,
    },

    // ── Exponentiation ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'naive-expt',
      text: 'The naive way to compute b to the n is to multiply b by itself n times. That is n-1 multiplications — Θ(n) in the number of steps. For large exponents this is slow. Each time we double n, the work doubles too.',
      code: 'function power(b, n) {\n  if (n === 0) return 1;\n  return b * power(b, n - 1);\n}\n\npower(2, 10)  // 1024 — 10 multiplications',
    },

    // ── Terminology: Successive Squaring ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'successive-squaring-vocab',
      text: 'The fast algorithm exploits a key observation: squaring a number costs the same as one multiplication, but it doubles the exponent. If you want b to the 8, you can compute b², then (b²)², then ((b²)²) — three multiplications instead of seven. More generally: if the exponent is even, square the half-power; if it is odd, peel off one factor and recurse on n-1. This technique is called successive squaring, and it reduces the number of steps to Θ(log n) — adding 1 to the input\'s bit length adds roughly one step.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fast-expt',
      text: 'Here is successive squaring in code. When n is even, we square the result of half the exponent. When n is odd, we peel off one factor. Running power(2, 32) takes only 5 multiplications instead of 32. This same algorithm is used in cryptography to raise numbers to thousand-digit exponents — it is one of the most practically important algorithms you will learn.',
      code: 'function square(x) { return x * x; }\n\nfunction power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}\n\nconsole.log(power(2, 10));  // 1024\nconsole.log(power(2, 32));  // 4294967296 — only 5 multiplications',
    },
    {
      type: 'codelens',
      id: 'codelens-fast-expt',
      text: 'Open CodeLens on power(2, 16). Watch how many recursive calls it actually makes — the exponent halves each time the branch is even, so you reach the base case in log₂(16) = 4 steps instead of 16. Step through it and count the multiplications. Each doubling of n adds exactly one step.',
      code: 'function square(x) { return x * x; }\n\nfunction power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}\n\nconsole.log(power(2, 16));',
    },
    {
      type: 'checkpoint',
      id: 'cp-fast-expt',
    },
    {
      type: 'challenge',
      id: 'challenge-power',
      text: 'Write the fast power function yourself using successive squaring. Base case: power(b, 0) = 1. Even case: square(power(b, n/2)). Odd case: b * power(b, n-1). power(3, 4) should be 81, power(2, 10) should be 1024.',
      expectedOutput: '1\n81\n1024',
      startCode: 'function square(x) { return x * x; }\n\nfunction power(b, n) {\n  if (n === 0) return 1;\n  // even case: square(power(b, n/2))\n  // odd  case: b * power(b, n-1)\n}\n\nconsole.log(power(5, 0));   // 1\nconsole.log(power(3, 4));   // 81\nconsole.log(power(2, 10));  // 1024\n',
      hint: 'function power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}',
      tests: [
        { call: 'power(5, 0)',  expected: 1    },
        { call: 'power(3, 4)',  expected: 81   },
        { call: 'power(2, 10)', expected: 1024 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof power === 'function' && power(5,0)===1 && power(3,4)===81 && power(2,10)===1024`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── GCD ───────────────────────────────────────────────────────────────────────

    // ── Terminology: GCD ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'gcd-vocab',
      text: 'The greatest common divisor (GCD) of two positive integers a and b is the largest integer that divides both with no remainder. GCD(48, 18) is 6 because 6 divides both 48 and 18, and no larger integer does. Computing GCDs is a foundational operation in number theory and computer science — you will use it for reducing fractions, and it appears inside many cryptographic algorithms. The oldest algorithm in recorded mathematics, due to Euclid around 300 BC, finds the GCD in Θ(log n) steps.',
      code: null,
    },
    {
      type: 'narration',
      id: 'gcd-intro',
      text: 'Euclid\'s insight: the GCD of a and b equals the GCD of b and the remainder when a is divided by b. Keep applying that rule until the remainder is zero — then b is the answer. In code this is one line. Run the examples and verify by hand.',
      code: 'function gcd(a, b) {\n  return b === 0 ? a : gcd(b, a % b);\n}\n\nconsole.log(gcd(206, 40));  // 2\nconsole.log(gcd(48, 18));   // 6\nconsole.log(gcd(100, 75));  // 25',
    },
    {
      type: 'codelens',
      id: 'codelens-gcd',
      text: 'Open CodeLens on gcd(48, 18). Watch how the pair shrinks at each step: (48,18) → (18,12) → (12,6) → (6,0). The algorithm terminates because the second argument strictly decreases each step and is always non-negative. Step through it and notice how quickly the numbers converge — this is the logarithmic behaviour.',
      code: 'function gcd(a, b) {\n  return b === 0 ? a : gcd(b, a % b);\n}\n\nconsole.log(gcd(48, 18));',
    },

    // ── Primality ─────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'primality-vocab',
      text: 'A prime number is a positive integer greater than 1 whose only divisors are 1 and itself. Primality testing is fundamental in cryptography — the security of RSA encryption depends on the difficulty of factoring large primes. The simple trial division test we build here runs in Θ(√n) steps: if n has no divisors up to its square root, it has none at all. Any factor larger than √n would need a co-factor smaller than √n, which we would have already found.',
      code: null,
    },
    {
      type: 'narration',
      id: 'primality-intro',
      text: 'The strategy: find the smallest divisor of n starting from 2. If the smallest divisor is n itself, n is prime. We stop testing at √n because of the argument above — if no divisor is found up to that point, there are none. find_divisor uses recursion to test each candidate.',
      code: 'function square(x) { return x * x; }\n\nfunction find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\n\nfunction smallest_divisor(n) {\n  return find_divisor(n, 2);\n}\n\nfunction is_prime(n) {\n  return n > 1 && smallest_divisor(n) === n;\n}\n\nconsole.log(is_prime(7));    // true\nconsole.log(is_prime(12));   // false\nconsole.log(is_prime(997));  // true',
    },
    {
      type: 'narration',
      id: 'primality-primes',
      text: 'With is_prime we can generate primes. Here we collect every prime up to 50. The square root bound means find_divisor runs in Θ(√n) steps per candidate — far better than testing all divisors up to n. Notice how few primes there are relative to the numbers tested.',
      code: 'function square(x) { return x * x; }\nfunction find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\nfunction smallest_divisor(n) { return find_divisor(n, 2); }\nfunction is_prime(n) { return n > 1 && smallest_divisor(n) === n; }\n\nconst primes = [];\nfor (let i = 2; i <= 50; i++) {\n  if (is_prime(i)) primes.push(i);\n}\nconsole.log(primes.join(\', \'));',
    },
    {
      type: 'checkpoint',
      id: 'cp-gcd-prime',
    },
    {
      type: 'challenge',
      id: 'challenge-prime-count',
      text: 'Using the is_prime function provided, write count_primes(limit) that counts how many prime numbers exist from 2 up to and including limit. count_primes(10) is 4 (the primes 2, 3, 5, 7). count_primes(50) is 15.',
      expectedOutput: '4\n15',
      startCode: 'function square(x) { return x * x; }\nfunction find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\nfunction smallest_divisor(n) { return find_divisor(n, 2); }\nfunction is_prime(n) { return n > 1 && smallest_divisor(n) === n; }\n\n// Write count_primes(limit)\n\n\nconsole.log(count_primes(10));  // 4\nconsole.log(count_primes(50));  // 15\n',
      hint: 'function count_primes(limit) {\n  let count = 0;\n  for (let i = 2; i <= limit; i++) {\n    if (is_prime(i)) count++;\n  }\n  return count;\n}',
      tests: [
        { call: 'count_primes(10)', expected: 4  },
        { call: 'count_primes(50)', expected: 15 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\n` +
            `return typeof count_primes === 'function' && count_primes(10) === 4 && count_primes(50) === 15`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
