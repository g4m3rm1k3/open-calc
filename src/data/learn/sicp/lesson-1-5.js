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
      text: 'Sections 1.2.4 through 1.2.6 are a showcase of algorithmic ideas. Three classic problems — raising a number to a power, finding the greatest common divisor, testing for primality — each solved with an algorithm whose cleverness dramatically beats the naive approach.',
      code: null,
    },

    // ── Exponentiation ────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'naive-expt',
      text: 'The naive way to compute b to the n is to multiply b by itself n times. That is n minus one multiplications — linear in n. For large exponents this is slow. But there is a much better way that exploits the fact that squaring a number costs no more than one multiplication.',
      code: 'function power(b, n) {\n  if (n === 0) return 1;\n  return b * power(b, n - 1);\n}\n\npower(2, 10)  // 1024 — 10 multiplications',
    },
    {
      type: 'narration',
      id: 'fast-expt',
      text: 'Successive squaring: if the exponent is even, square the half-power. If it is odd, peel off one factor and recurse. b to the 8 is just b-squared squared squared — three multiplications instead of seven. The number of steps is logarithmic in n. This algorithm is used in cryptography to raise numbers to thousand-digit exponents.',
      code: 'function square(x) { return x * x; }\n\nfunction power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}\n\nconsole.log(power(2, 10));  // 1024\nconsole.log(power(2, 32));  // 4294967296 — only 5 multiplications',
    },
    {
      type: 'codelens',
      id: 'codelens-fast-expt',
      text: 'Open CodeLens on power(2, 16). Watch how many recursive calls it actually makes — the exponent halves each time the branch is even, so you reach the base case in log₂(16) = 4 steps instead of 16. Step through it and count the multiplications.',
      code: 'function square(x) { return x * x; }\n\nfunction power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}\n\nconsole.log(power(2, 16));',
    },
    {
      type: 'checkpoint',
      id: 'cp-fast-expt',
    },
    {
      type: 'challenge',
      id: 'challenge-power',
      text: 'Write the fast power function yourself. Use square(x) = x * x. Base case: power(b, 0) = 1. Even case: square(power(b, n/2)). Odd case: b * power(b, n-1). power(3, 4) should be 81, power(2, 10) should be 1024.',
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

    // ── GCD ────────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'gcd-intro',
      text: 'The greatest common divisor of two integers is the largest integer that divides both with no remainder. Euclid discovered an algorithm for it around 300 BC. The idea: gcd of a and b equals gcd of b and the remainder when a is divided by b. Keep applying that rule until the remainder is zero — then b is the answer.',
      code: 'function gcd(a, b) {\n  return b === 0 ? a : gcd(b, a % b);\n}\n\nconsole.log(gcd(206, 40));  // 2\nconsole.log(gcd(48, 18));   // 6\nconsole.log(gcd(100, 75));  // 25',
    },
    {
      type: 'codelens',
      id: 'codelens-gcd',
      text: 'Open CodeLens on gcd(48, 18). Watch how the pair shrinks: (48,18) → (18,12) → (12,6) → (6,0). The algorithm terminates because the second argument strictly decreases each step. This is one of the oldest algorithms in mathematics — and it is still logarithmic.',
      code: 'function gcd(a, b) {\n  return b === 0 ? a : gcd(b, a % b);\n}\n\nconsole.log(gcd(48, 18));',
    },

    // ── Primality ─────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'primality-intro',
      text: 'A number n is prime if its only divisors are 1 and itself. The simplest test: find the smallest divisor of n. If it equals n, n is prime. We only need to test divisors up to the square root of n — if n has a factor larger than its square root it must also have one smaller.',
      code: 'function square(x) { return x * x; }\n\nfunction find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\n\nfunction smallest_divisor(n) {\n  return find_divisor(n, 2);\n}\n\nfunction is_prime(n) {\n  return n > 1 && smallest_divisor(n) === n;\n}\n\nconsole.log(is_prime(7));    // true\nconsole.log(is_prime(12));   // false\nconsole.log(is_prime(997));  // true',
    },
    {
      type: 'narration',
      id: 'primality-primes',
      text: 'With is_prime we can generate primes. Here we collect every prime up to 50. The square-root bound means find_divisor runs in order root-n steps per number — far better than checking all divisors up to n.',
      code: 'function square(x) { return x * x; }\nfunction find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\nfunction smallest_divisor(n) { return find_divisor(n, 2); }\nfunction is_prime(n) { return n > 1 && smallest_divisor(n) === n; }\n\nconst primes = [];\nfor (let i = 2; i <= 50; i++) {\n  if (is_prime(i)) primes.push(i);\n}\nconsole.log(primes.join(\', \'));',
    },
    {
      type: 'checkpoint',
      id: 'cp-gcd-prime',
    },
    {
      type: 'challenge',
      id: 'challenge-prime-count',
      text: 'Using the is_prime function provided, write count_primes(limit) that counts how many prime numbers exist from 2 up to and including limit. count_primes(10) is 4 (the primes are 2, 3, 5, 7). count_primes(50) is 15.',
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
