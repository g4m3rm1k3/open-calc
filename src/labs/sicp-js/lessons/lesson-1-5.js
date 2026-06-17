export const lesson = {
  id: 'sicp-1-5',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.4–1.2.6  Exponentiation, GCD & Primality',
  checkpoints: [
    { id: 'cp-fast-expt', label: 'Fast Exponentiation' },
    { id: 'cp-gcd',       label: 'GCD' },
    { id: 'cp-prime',     label: 'Primality' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — FAST EXPONENTIATION (Section 1.2.4)
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'expt-hook',
      text: 'Sections 1.2.4 through 1.2.6 are a showcase of a single idea: the same mathematical operation, computed two different ways, can have dramatically different costs. The same answer — but one algorithm takes a second and the other would take longer than the age of the universe.\n\nWhen you log in to a website over HTTPS, your browser and the server perform an exponentiation — raising a number to a power — where the exponent is a number with 2048 binary digits. That is a number approximately 10^617. The naive approach (multiply b by itself n times) would be utterly hopeless. The fast approach handles it in microseconds. We will build it today.',
      code: null,
    },

    // ── The naive approach ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'expt-naive-intro',
      text: 'Start with the obvious solution. The mathematical definition of bⁿ is b multiplied by itself n times. We can translate that definition directly into code. To compute b to the n, the base case is b⁰ = 1. The recursive case: b to the n is b times b to the (n-1).',
      code: `function power(b, n) {
  if (n === 0) return 1;
  return b * power(b, n - 1);
}`,
    },
    {
      type: 'narration',
      id: 'expt-naive-run',
      text: 'Run it on a few inputs to confirm it works. Nothing surprising here — this is just the definition of exponentiation expressed as a function.',
      code: `function power(b, n) {
  if (n === 0) return 1;
  return b * power(b, n - 1);
}

console.log(power(2, 10));  // 1024
console.log(power(3, 4));   // 81
console.log(power(5, 3));   // 125`,
    },
    {
      type: 'narration',
      id: 'expt-naive-cost',
      text: 'Now count the cost. Add a call counter — a global variable incremented every time power is called. The number of calls tells us exactly how many operations the algorithm performs.',
      code: `let calls = 0;

function power(b, n) {
  calls++;
  if (n === 0) return 1;
  return b * power(b, n - 1);
}

calls = 0; power(2, 10);
console.log(\`power(2, 10): \${calls} calls\`);   // 11 calls

calls = 0; power(2, 100);
console.log(\`power(2, 100): \${calls} calls\`);  // 101 calls

calls = 0; power(2, 1000);
console.log(\`power(2, 1000): \${calls} calls\`); // 1001 calls`,
    },
    {
      type: 'narration',
      id: 'expt-naive-analysis',
      text: 'The pattern is clear: to compute b to the n, the naive version performs n+1 calls. Double the exponent — double the work. Triple the exponent — triple the work. This is Θ(n) — the cost grows linearly with the size of the exponent.\n\nFor an exponent with 2048 digits, n would be a number around 10^617. Even if your computer performed a billion operations per second, it would need more time than the age of the universe. Clearly we need a better approach.',
      code: null,
    },

    // ── The insight ───────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'expt-insight-vocab',
      text: 'Here is the key observation. Consider computing 2 to the 8th power. The naive way: multiply 2 by itself 8 times — 7 multiplications. The smart way:\n\n  2⁸ = (2⁴)² = ((2²)²)²\n\nCompute 2² = 4. Square it: 4² = 16. Square that: 16² = 256. Done — and we only performed 3 multiplications instead of 7.\n\nWhy does this work? Because squaring doubles the exponent for the cost of one multiplication. If n is even, we can compute bⁿ = (b^(n/2))² — halving the exponent in one step instead of decrementing it by one.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expt-insight-trace',
      text: 'Work through the trace for power(2, 10):\n\n  power(2, 10)\n  → square(power(2, 5))      n=10 is even: use b^(n/2)\n  → square(2 * power(2, 4))  n=5 is odd: peel off one factor\n  → square(2 * square(power(2, 2)))\n  → square(2 * square(square(power(2, 1))))\n  → square(2 * square(square(2 * power(2, 0))))\n  → square(2 * square(square(2 * 1)))\n  → ... resolves to 1024\n\nCount the steps: 10 → 5 → 4 → 2 → 1 → 0. That is 5 levels, not 10. Each even step halves the exponent instead of decrementing it. This is logarithmic behaviour.',
      code: null,
    },

    // ── Build fast_power step by step ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'expt-square-helper',
      text: 'Before writing the recursive function, define a square helper. In successive squaring we call squaring many times, and naming it makes the intent explicit.',
      code: `function square(x) {
  return x * x;
}`,
    },
    {
      type: 'narration',
      id: 'expt-fast-base',
      text: 'Now add the base case: b to the 0 is always 1, regardless of b. Any number raised to the zero power equals 1 — that is the mathematical convention and our recursion\'s stopping point.',
      code: `function square(x) {
  return x * x;
}

function power(b, n) {
  if (n === 0) return 1;
  // even and odd cases to be added next
}`,
    },
    {
      type: 'narration',
      id: 'expt-fast-even',
      text: 'Add the even case. When n is even, square the result of b to the (n/2). This is the squaring step that halves the exponent. Notice: we call power(b, n/2) — not power(b, n-1). That single change is what turns a linear process into a logarithmic one.',
      code: `function square(x) {
  return x * x;
}

function power(b, n) {
  if (n === 0) return 1;
  if (n % 2 === 0) return square(power(b, n / 2));
  // odd case to be added next
}`,
    },
    {
      type: 'narration',
      id: 'expt-fast-odd',
      text: 'Add the odd case. When n is odd, we cannot halve it evenly. Peel off one factor of b and reduce to the even case: bⁿ = b × b^(n-1). Since n-1 is now even, the next recursive call will use the squaring step.',
      code: `function square(x) {
  return x * x;
}

function power(b, n) {
  if (n === 0) return 1;
  if (n % 2 === 0) return square(power(b, n / 2));
  return b * power(b, n - 1);
}`,
    },
    {
      type: 'narration',
      id: 'expt-fast-run',
      text: 'Run it and confirm the results are correct.',
      code: `function square(x) { return x * x; }

function power(b, n) {
  if (n === 0) return 1;
  if (n % 2 === 0) return square(power(b, n / 2));
  return b * power(b, n - 1);
}

console.log(power(2, 10));   // 1024
console.log(power(3, 4));    // 81
console.log(power(2, 32));   // 4294967296`,
    },
    {
      type: 'narration',
      id: 'expt-fast-count',
      text: 'Now add the call counter and compare it to the naive version. This is the moment to see the difference directly.',
      code: `function square(x) { return x * x; }

let calls = 0;

function power(b, n) {
  calls++;
  if (n === 0) return 1;
  if (n % 2 === 0) return square(power(b, n / 2));
  return b * power(b, n - 1);
}

for (const n of [10, 100, 1000, 10000]) {
  calls = 0;
  power(2, n);
  console.log(\`power(2, \${n}): \${calls} calls  (naive would need \${n + 1})\`);
}`,
    },
    {
      type: 'narration',
      id: 'expt-fast-analysis',
      text: 'For n = 10 000, the naive algorithm needs 10 001 calls. The fast algorithm needs about 27 — roughly log₂(10000) ≈ 13.3, times about 2 because odd steps add one extra call. This is Θ(log n). Adding 1 to the binary length of n (i.e., doubling n) adds at most 2 steps. That is the defining behaviour of a logarithmic algorithm.\n\nFor the 2048-digit exponent used in HTTPS: the naive algorithm needs ≈ 10^617 operations. The fast algorithm needs ≈ 2048 × 2 = 4096 operations. That difference is why secure communication is possible.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-fast-expt',
      text: 'Open CodeLens on power(2, 16). Step through it and watch the exponent: 16 → 8 → 4 → 2 → 1 → 0. The stack grows 5 levels deep — log₂(16) = 4, plus one for the odd step. Compare: the naive version would push 17 frames. The call tree is narrow and deep, not wide.',
      code: `function square(x) { return x * x; }

function power(b, n) {
  if (n === 0) return 1;
  if (n % 2 === 0) return square(power(b, n / 2));
  return b * power(b, n - 1);
}

console.log(power(2, 16));`,
    },
    {
      type: 'challenge',
      id: 'challenge-power',
      text: 'Write the fast power function from scratch. Three cases: n = 0 returns 1, n even returns square(power(b, n/2)), n odd returns b * power(b, n-1). Then add the call counter and verify that power(2, 64) uses no more than 20 calls.',
      expectedOutput: '18446744073709551616\ncalls: ',
      startCode: `function square(x) { return x * x; }

let calls = 0;

function power(b, n) {
  calls++;
  // base case: n === 0
  // even case: n % 2 === 0
  // odd  case: default
}

console.log(power(2, 64));   // 18446744073709551616
console.log('calls: ' + calls); // should be ≤ 20
`,
      hint: 'function power(b, n) {\n  calls++;\n  if (n === 0) return 1;\n  if (n % 2 === 0) return square(power(b, n / 2));\n  return b * power(b, n - 1);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn calls <= 20 && typeof power === 'function'`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-fast-expt' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — GREATEST COMMON DIVISORS (Section 1.2.5)
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'gcd-hook',
      text: 'The greatest common divisor (GCD) of two integers a and b is the largest integer that divides both with no remainder. gcd(48, 18) = 6 because 6 divides both 48 and 18, and no integer larger than 6 does.\n\nWe used GCD in lesson 2-1 to reduce fractions: the fraction 4/6 reduces to 2/3 because gcd(4, 6) = 2. GCD also appears inside the fast exponentiation algorithm for cryptography — it is fundamental. The algorithm we are about to write was described by Euclid around 300 BC. It is one of the oldest algorithms in recorded mathematics and it is still used.',
      code: null,
    },

    // ── The naive approach ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'gcd-naive',
      text: 'The obvious approach: try every integer from 1 up to min(a, b) and keep track of the largest one that divides both. This is Θ(min(a, b)) — if the smaller number is large, this is slow.',
      code: `function gcd_naive(a, b) {
  let result = 1;
  const limit = Math.min(a, b);
  for (let i = 2; i <= limit; i++) {
    if (a % i === 0 && b % i === 0) result = i;
  }
  return result;
}

console.log(gcd_naive(48, 18));   // 6
console.log(gcd_naive(100, 75));  // 25
console.log(gcd_naive(7, 13));    // 1  (coprime — share no factor)`,
    },

    // ── Euclid's insight ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'gcd-euclid-insight',
      text: 'Euclid\'s key observation: the GCD of a and b is the same as the GCD of b and the remainder when a is divided by b. In symbols: gcd(a, b) = gcd(b, a mod b).\n\nWhy is that true? Any integer that divides both a and b also divides their difference (a - b), and any integer that divides b and the difference (a - b) also divides a. The remainder (a mod b) is just a combination of subtracting b repeatedly. So the set of common divisors of (a, b) is identical to the set of common divisors of (b, a mod b). Their maximum — the GCD — must therefore be equal.',
      code: null,
    },
    {
      type: 'narration',
      id: 'gcd-euclid-trace',
      text: 'Trace gcd(48, 18) step by step through Euclid\'s rule:\n\n  gcd(48, 18)  →  gcd(18, 48 mod 18)  =  gcd(18, 12)\n  gcd(18, 12)  →  gcd(12, 18 mod 12)  =  gcd(12, 6)\n  gcd(12, 6)   →  gcd(6,  12 mod 6)   =  gcd(6, 0)\n  gcd(6, 0)    →  6  (base case: anything divides 0)\n\nFour steps to find GCD(48, 18) = 6. The naive algorithm would try 18 divisors.',
      code: null,
    },

    // ── Build gcd ─────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'gcd-base-case',
      text: 'The base case: gcd(a, 0) = a. If b is zero, then a divides both a and 0, and a is the largest such divisor. Start there.',
      code: `function gcd(a, b) {
  if (b === 0) return a;
  // recursive case to be added
}`,
    },
    {
      type: 'narration',
      id: 'gcd-recursive-case',
      text: 'The recursive case: apply Euclid\'s rule. Replace (a, b) with (b, a mod b). The process must terminate because a mod b is always strictly less than b — the second argument strictly decreases at every step.',
      code: `function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}`,
    },
    {
      type: 'narration',
      id: 'gcd-run',
      text: 'Run it and trace the convergence. Compare the number of calls to the naive algorithm.',
      code: `function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}

console.log(gcd(48, 18));   // 6
console.log(gcd(100, 75));  // 25
console.log(gcd(7, 13));    // 1`,
    },
    {
      type: 'narration',
      id: 'gcd-trace-code',
      text: 'Add a trace to see how fast the pairs converge. Watch how the numbers drop to zero in just a few steps, even for large inputs.',
      code: `function gcd(a, b) {
  console.log(\`  gcd(\${a}, \${b})\`);
  if (b === 0) return a;
  return gcd(b, a % b);
}

console.log('gcd(206, 40):');
console.log('answer:', gcd(206, 40));
console.log('');
console.log('gcd(1000000, 999999):');
console.log('answer:', gcd(1000000, 999999));`,
    },
    {
      type: 'narration',
      id: 'gcd-log-analysis',
      text: 'Lamé\'s Theorem (1844): the number of steps in Euclid\'s algorithm is at most 5 times the number of decimal digits in the smaller input. For gcd(1 000 000, 999 999), the smaller number has 7 digits — so at most 35 steps. In practice it takes far fewer. This is Θ(log n) — the same order of growth as our fast exponentiation.\n\nThis is remarkable: an algorithm from 300 BC is logarithmic.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-gcd',
      text: 'Open CodeLens on gcd(48, 18). Each recursive call is a new frame on the stack. Watch the pair of arguments shrink: (48, 18) → (18, 12) → (12, 6) → (6, 0). The recursion unwinds only after reaching the base case. This is a linear iterative process — no deferred operations, just the two numbers evolving.',
      code: `function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}

console.log(gcd(48, 18));`,
    },

    // ── LCM via GCD ───────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'lcm-intro',
      text: 'The least common multiple (LCM) of a and b is the smallest positive integer divisible by both. LCM is used whenever you need to find a common denominator, or synchronise two periodic events. There is a simple identity connecting LCM to GCD:\n\n  lcm(a, b) = a × b / gcd(a, b)\n\nWith gcd already written, lcm is one line.',
      code: `function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

console.log(lcm(4, 6));    // 12
console.log(lcm(12, 18));  // 36
console.log(lcm(7, 11));   // 77  (primes: lcm = product)`,
    },
    {
      type: 'challenge',
      id: 'challenge-gcd',
      text: 'Write gcd(a, b) from scratch using Euclid\'s rule. Then use it to write a function reduce_fraction(n, d) that returns [n/g, d/g] where g = gcd(|n|, |d|). reduce_fraction(6, 9) should return [2, 3].',
      expectedOutput: '6\n2,3\n1,2',
      startCode: `// Write gcd(a, b) — Euclid's rule: gcd(b, a % b), base: b === 0 return a

function gcd(a, b) {
  // your code
}

function reduce_fraction(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}

console.log(gcd(48, 18));           // 6
console.log(reduce_fraction(6, 9)); // [2, 3]
console.log(reduce_fraction(3, 6)); // [1, 2]
`,
      hint: 'function gcd(a, b) {\n  if (b === 0) return a;\n  return gcd(b, a % b);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof gcd === 'function' && gcd(48,18) === 6 && gcd(100,75) === 25`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-gcd' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — PRIMALITY TESTING (Section 1.2.6)
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'prime-hook',
      text: 'A prime number is a positive integer greater than 1 whose only divisors are 1 and itself. 2, 3, 5, 7, 11, 13, ... The primes are the atoms of arithmetic — every integer is a unique product of primes (the Fundamental Theorem of Arithmetic).\n\nPrimality testing is the beating heart of modern cryptography. RSA encryption — used in every HTTPS connection — works by picking two large primes, multiplying them, and using the difficulty of factoring the product. If you can test whether a number is prime quickly, you can generate RSA keys. Section 1.2.6 introduces two algorithms: a simple Θ(√n) method and a probabilistic Θ(log n) method based on Fermat\'s Little Theorem.',
      code: null,
    },

    // ── Trial division ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'prime-trial-insight',
      text: 'The naive primality test: try dividing n by every integer from 2 to n-1. If none divide evenly, n is prime. That is O(n) operations — fine for small numbers, useless for numbers with hundreds of digits.\n\nThe key improvement: if n has a factor larger than √n, it must also have a factor smaller than √n (because the two factors multiply to n). So we only need to test divisors up to √n. That reduces the cost from Θ(n) to Θ(√n).',
      code: null,
    },
    {
      type: 'narration',
      id: 'prime-find-divisor-start',
      text: 'Start with find_divisor. It takes n and a test divisor, and either finds a factor or confirms there are none up to √n. The base case: if test² > n, no small factor exists — return n itself (meaning n is its own smallest divisor, i.e., prime).',
      code: `function square(x) { return x * x; }

function find_divisor(n, test) {
  if (square(test) > n) return n;    // no divisor found — n is prime
  // check divisibility and recurse
}`,
    },
    {
      type: 'narration',
      id: 'prime-find-divisor-complete',
      text: 'Add the two recursive cases: if test divides n evenly, return test (we found a factor). Otherwise, try the next candidate by incrementing test.',
      code: `function square(x) { return x * x; }

function find_divisor(n, test) {
  if (square(test) > n) return n;
  if (n % test === 0) return test;
  return find_divisor(n, test + 1);
}`,
    },
    {
      type: 'narration',
      id: 'prime-smallest-divisor',
      text: 'smallest_divisor wraps find_divisor, always starting the search from 2 (the smallest possible prime divisor). It returns the smallest factor of n. If that factor is n itself, n is prime.',
      code: `function square(x) { return x * x; }

function find_divisor(n, test) {
  if (square(test) > n) return n;
  if (n % test === 0) return test;
  return find_divisor(n, test + 1);
}

function smallest_divisor(n) {
  return find_divisor(n, 2);
}

console.log(smallest_divisor(12));  // 2 — 12 = 2 × 6
console.log(smallest_divisor(15));  // 3 — 15 = 3 × 5
console.log(smallest_divisor(97));  // 97 — 97 is prime`,
    },
    {
      type: 'narration',
      id: 'prime-is-prime',
      text: 'is_prime: a number n is prime when its smallest divisor is n itself (and n > 1 to exclude 1, which is not considered prime).',
      code: `function square(x) { return x * x; }

function find_divisor(n, test) {
  if (square(test) > n) return n;
  if (n % test === 0) return test;
  return find_divisor(n, test + 1);
}

function smallest_divisor(n) {
  return find_divisor(n, 2);
}

function is_prime(n) {
  return n > 1 && smallest_divisor(n) === n;
}

console.log(is_prime(2));    // true
console.log(is_prime(7));    // true
console.log(is_prime(97));   // true
console.log(is_prime(100));  // false
console.log(is_prime(1));    // false`,
    },
    {
      type: 'narration',
      id: 'prime-list-primes',
      text: 'With is_prime working, generate the first several primes. Notice how few primes there are — they become increasingly sparse as numbers grow larger.',
      code: `function square(x) { return x * x; }

function find_divisor(n, test) {
  if (square(test) > n) return n;
  if (n % test === 0) return test;
  return find_divisor(n, test + 1);
}

function smallest_divisor(n) { return find_divisor(n, 2); }
function is_prime(n)         { return n > 1 && smallest_divisor(n) === n; }

const primes = [];
for (let i = 2; i <= 60; i++) {
  if (is_prime(i)) primes.push(i);
}
console.log(primes.join(', '));
console.log(\`\${primes.length} primes below 60\`);`,
    },

    // ── Fermat test ───────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'fermat-theorem',
      text: 'For large numbers, even Θ(√n) is too slow. If n has 100 digits, √n has 50 digits — far too many trial divisions. Section 1.2.6 introduces a probabilistic test based on Fermat\'s Little Theorem (1640):\n\n  If n is prime and a is any positive integer less than n, then a raised to the n, modulo n, equals a.\n\nIn symbols: if n is prime, then aⁿ ≡ a (mod n) for all 0 < a < n.\n\nThis gives us a test: pick a random a, compute aⁿ mod n, and check if the result equals a. If not, n is definitely not prime. If it does equal a, n is probably prime. Run the test many times with different random values of a — each test that passes increases confidence that n is prime.',
      code: null,
    },
    {
      type: 'narration',
      id: 'fermat-expmod-need',
      text: 'To run the Fermat test we need to compute aⁿ mod n for potentially large n. We cannot compute aⁿ first and then take mod — the intermediate number would have astronomical digits. Instead, we use modular exponentiation: apply the mod operation at each step of fast exponentiation. This keeps all intermediate values below n².',
      code: null,
    },
    {
      type: 'narration',
      id: 'expmod-base',
      text: 'Start expmod with the same structure as power. The base case is identical: base to the 0, mod anything, is 1.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  // even and odd cases next
}`,
    },
    {
      type: 'narration',
      id: 'expmod-even',
      text: 'The even case: square the result of the recursive call, then take mod m. We must take mod after squaring — not before — to get the correct result. This is the modular arithmetic identity: (a × b) mod m = ((a mod m) × (b mod m)) mod m.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return square(expmod(base, exp / 2, m)) % m;
  // odd case next
}`,
    },
    {
      type: 'narration',
      id: 'expmod-odd',
      text: 'The odd case: multiply by base and take mod. The complete expmod runs in Θ(log exp) steps — the same as fast exponentiation, but keeping all values small by reducing mod m at every step.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return square(expmod(base, exp / 2, m)) % m;
  return (base * expmod(base, exp - 1, m)) % m;
}

// Verify: 2^10 mod 1000 = 1024 mod 1000 = 24
console.log(expmod(2, 10, 1000));   // 24
// 3^5 mod 13 = 243 mod 13 = 9
console.log(expmod(3, 5, 13));      // 9`,
    },
    {
      type: 'narration',
      id: 'fermat-test-build',
      text: 'Now write fermat_test. Pick a random integer a between 2 and n-1, then check whether expmod(a, n, n) equals a. If not, n is definitely composite. If it does, n is probably prime. The random choice of a is what makes this probabilistic.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return square(expmod(base, exp / 2, m)) % m;
  return (base * expmod(base, exp - 1, m)) % m;
}

function fermat_test(n) {
  const a = 2 + Math.floor(Math.random() * (n - 2));
  return expmod(a, n, n) === a;
}`,
    },
    {
      type: 'narration',
      id: 'fast-prime-build',
      text: 'fast_prime runs fermat_test k times. If every test passes, we say n is probably prime. Each test independently passes with high probability for primes and low probability for composites. After k tests, the probability of a composite number fooling all tests is astronomically small.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return square(expmod(base, exp / 2, m)) % m;
  return (base * expmod(base, exp - 1, m)) % m;
}

function fermat_test(n) {
  const a = 2 + Math.floor(Math.random() * (n - 2));
  return expmod(a, n, n) === a;
}

function fast_prime(n, times) {
  if (times === 0) return true;
  if (fermat_test(n)) return fast_prime(n, times - 1);
  return false;
}

console.log(fast_prime(97,   50));  // true  — 97 is prime
console.log(fast_prime(100,  50));  // false — 100 = 2 × 2 × 5 × 5
console.log(fast_prime(1009, 50));  // true  — 1009 is prime`,
    },
    {
      type: 'narration',
      id: 'prime-summary',
      text: 'To summarise the two primality algorithms:\n\n  Trial division: Θ(√n). Deterministic — always correct. Practical for numbers up to about 10^15.\n\n  Fermat test: Θ(log n). Probabilistic — almost certainly correct after enough tests. Practical for numbers with hundreds of digits.\n\nReal-world cryptographic systems use the Miller-Rabin test (a strengthened version of the Fermat test) which eliminates a pathological class of numbers called Carmichael numbers that fool the basic Fermat test while not being prime.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-expmod',
      text: 'Open CodeLens on expmod(2, 10, 1000). Compare its structure to power: identical branching logic, but with % m at each step. Watch how the intermediate values stay small (always below m²) even though 2^10 = 1024.',
      code: `function square(x) { return x * x; }

function expmod(base, exp, m) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return square(expmod(base, exp / 2, m)) % m;
  return (base * expmod(base, exp - 1, m)) % m;
}

console.log(expmod(2, 10, 1000));`,
    },
    {
      type: 'challenge',
      id: 'challenge-prime',
      text: 'Write is_prime(n) using trial division — build smallest_divisor and find_divisor from scratch. Then write count_primes(limit) that counts how many primes are in the range 2 to limit inclusive. count_primes(50) should be 15.',
      expectedOutput: '15\n25',
      startCode: `function square(x) { return x * x; }

// Write find_divisor(n, test): square(test) > n → n; n%test===0 → test; else recurse
// Write smallest_divisor(n): find_divisor(n, 2)
// Write is_prime(n): n > 1 && smallest_divisor(n) === n

function count_primes(limit) {
  let count = 0;
  for (let i = 2; i <= limit; i++) {
    if (is_prime(i)) count++;
  }
  return count;
}

console.log(count_primes(50));   // 15
console.log(count_primes(100));  // 25
`,
      hint: 'function find_divisor(n, test) {\n  if (square(test) > n) return n;\n  if (n % test === 0) return test;\n  return find_divisor(n, test + 1);\n}\nfunction smallest_divisor(n) { return find_divisor(n, 2); }\nfunction is_prime(n) { return n > 1 && smallest_divisor(n) === n; }',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof count_primes === 'function' && count_primes(50) === 15 && count_primes(100) === 25`)
          return fn() === true
        } catch { return false }
      },
    },
    { type: 'checkpoint', id: 'cp-prime' },
  ],
}
