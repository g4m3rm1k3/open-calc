export const lesson = {
  id: 'sicp-1-4b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.3  Orders of Growth',
  checkpoints: [
    { id: 'cp-theta-notation',   label: 'Θ Notation' },
    { id: 'cp-comparing-growth', label: 'Comparing Growth' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'We have described processes as "linear," "logarithmic," or "exponential" but never defined those words precisely. Section 1.2.3 provides the definition. It is not about getting exact step counts — a precise count depends on the machine, the compiler, and a dozen other factors. What matters is the shape of the cost curve: does doubling the input double the work? Triple it? Square it? That shape is what order of growth captures.',
      code: null,
    },

    // ── Terminology: Θ notation ────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'theta-vocab',
      text: 'The notation R(n) = Θ(f(n)) — read "R of n is theta of f of n" — means R grows proportionally to f. More precisely: there exist positive constants k₁ and k₂ such that k₁·f(n) ≤ R(n) ≤ k₂·f(n) for all sufficiently large n. The constants do not matter — they are absorbed into the Θ. What remains is the shape. Θ(n) means linear: double the input, roughly double the resource. Θ(log n) means logarithmic: double the input, add a constant amount. Θ(2ⁿ) means exponential: add 1 to the input, roughly double the resource.',
      code: null,
    },
    {
      type: 'narration',
      id: 'theta-examples-code',
      text: 'Here are the five most important orders of growth shown as runtime measurements. Run it — watch how the cost changes as n doubles. The pattern is the definition made concrete.',
      code: 'function time(f, n) {\n  const start = Date.now();\n  f(n);\n  return Date.now() - start;\n}\n\n// Θ(1) — constant: same cost regardless of n\nfunction constant_work(n) { return 42; }\n\n// Θ(n) — linear: double n, double work\nfunction linear_work(n) {\n  let sum = 0;\n  for (let i = 0; i < n; i++) sum += i;\n  return sum;\n}\n\n// Θ(n²) — quadratic: double n, quadruple work\nfunction quadratic_work(n) {\n  let sum = 0;\n  for (let i = 0; i < n; i++)\n    for (let j = 0; j < n; j++) sum += i * j;\n  return sum;\n}\n\n// Θ(log n) — logarithmic: double n, add 1 step\nfunction log_work(n) {\n  let count = 0;\n  while (n > 1) { n = Math.floor(n / 2); count++; }\n  return count;\n}\n\nconsole.log(`n=1000:  log=${log_work(1000)}  linear approx=${1000}`);\nconsole.log(`n=2000:  log=${log_work(2000)}  linear approx=${2000}`);\nconsole.log(`n=1000000: log=${log_work(1000000)} — still only 20 steps`);',
    },

    // ── The doubling test ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'doubling-test-vocab',
      text: 'The easiest way to identify an order of growth is the doubling test: what happens to the resource requirement when the input doubles? If it roughly doubles, the process is linear. If it roughly quadruples, it is quadratic. If it barely changes (adds about 1 to the step count), it is logarithmic. If it doubles or more, it could be exponential. This test does not require solving a recurrence — just double the input and observe.',
      code: null,
    },
    {
      type: 'narration',
      id: 'doubling-test-code',
      text: 'Here is the doubling test applied to our factorial functions. Count the recursive calls for n and 2n. The ratio tells us the order of growth.',
      code: 'let calls = 0;\n\nfunction fac_recursive(n) {\n  calls++;\n  return n <= 1 ? 1 : n * fac_recursive(n - 1);\n}\n\nfunction fac_iter(n) {\n  function iter(product, counter) {\n    calls++;\n    return counter > n ? product : iter(product * counter, counter + 1);\n  }\n  return iter(1, 1);\n}\n\n// Doubling test for recursive factorial\n[5, 10, 20, 40].forEach(n => {\n  calls = 0; fac_recursive(n);\n  const c = calls;\n  console.log(`recursive fac(${n}): ${c} calls`);\n});\n\n// Ratio stays at ~2 — this is Θ(n)',
    },
    {
      type: 'checkpoint',
      id: 'cp-theta-notation',
    },

    // ── Applying Θ to known processes ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'theta-factorial',
      text: 'The recursive factorial uses n recursive calls and n stack frames — Θ(n) time and Θ(n) space. The iterative factorial still takes n calls — Θ(n) time — but uses Θ(1) space because the stack never grows deeper than the iter frame. Time complexity and space complexity are separate measures. The iterative version wins on space while being identical on time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'theta-fibonacci',
      text: 'Tree-recursive Fibonacci is dramatically different. Each call spawns two more calls, so the number of calls grows as fast as Fibonacci itself — roughly φⁿ where φ ≈ 1.618. Exponential time. The stack depth is the length of the deepest branch, which is n — Θ(n) space. The iterative version is Θ(n) time, Θ(1) space. The exponential vs linear difference becomes catastrophic for large n: fib(50) by tree recursion requires tens of billions of calls; fib(50) by iteration requires exactly 50.',
      code: 'let tree_calls = 0;\nlet iter_calls  = 0;\n\nfunction fib_tree(n) {\n  tree_calls++;\n  if (n <= 1) return n;\n  return fib_tree(n - 1) + fib_tree(n - 2);\n}\n\nfunction fib_iter(n) {\n  function step(a, b, count) {\n    iter_calls++;\n    return count === 0 ? b : step(a + b, a, count - 1);\n  }\n  return step(1, 0, n);\n}\n\n// Compare at n = 10, 15, 20\n[10, 15, 20].forEach(n => {\n  tree_calls = 0; iter_calls = 0;\n  fib_tree(n); fib_iter(n);\n  console.log(`n=${n}: tree=${tree_calls} calls, iter=${iter_calls} calls`);\n});',
    },
    {
      type: 'narration',
      id: 'theta-fast-power',
      text: 'Fast exponentiation by successive squaring is Θ(log n) time. Each step halves the exponent (or almost halves it). The number of steps to reach the base case is the number of times you can halve n before reaching 1 — that is log₂(n). Adding 1 to the bit length of the exponent adds at most 2 steps. The space used by the recursive version is also Θ(log n) — the stack depth equals the step count. An iterative version would use Θ(1) space.',
      code: 'let power_calls = 0;\n\nfunction fast_power(b, n) {\n  power_calls++;\n  if (n === 0) return 1;\n  if (n % 2 === 0) return fast_power(b, n / 2) ** 2;\n  return b * fast_power(b, n - 1);\n}\n\n// Doubling test: each doubling of n adds only ~2 calls\n[10, 20, 40, 80, 160, 320, 640].forEach(n => {\n  power_calls = 0;\n  fast_power(2, n);\n  console.log(`fast_power(2, ${n}): ${power_calls} calls`);\n});',
    },
    {
      type: 'codelens',
      id: 'codelens-orders',
      text: 'Open CodeLens on fast_power(2, 16). Watch the call stack depth — it never exceeds log₂(16) = 4. Compare this to a linear power function which would have a call stack of depth 16. The call count is the cleanest measure of the order of growth.',
      code: 'function fast_power(b, n) {\n  if (n === 0) return 1;\n  if (n % 2 === 0) return fast_power(b, n / 2) ** 2;\n  return b * fast_power(b, n - 1);\n}\nfunction slow_power(b, n) {\n  if (n === 0) return 1;\n  return b * slow_power(b, n - 1);\n}\n\nconsole.log(fast_power(2, 16)); // 65536, ~4 calls\nconsole.log(slow_power(2, 16)); // 65536, 16 calls',
    },
    {
      type: 'checkpoint',
      id: 'cp-comparing-growth',
    },
    {
      type: 'challenge',
      id: 'challenge-predict-growth',
      text: 'For each function below, predict the order of growth (time and space), then verify by running the doubling test. Write your predictions as comments. (a) length(lst) — count elements of a list. (b) count_change(amount, coins) — count ways to make change. Which one surprises you most?',
      expectedOutput: 'length doubles with n',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nlet calls = 0;\n\nfunction length(lst) {\n  calls++;\n  return is_null(lst) ? 0 : 1 + length(tail(lst));\n}\n\n// Build lists of size n and 2n, compare call counts\nfunction make_list(n) {\n  return Array.from({length:n},(_,i)=>i).reduceRight((acc,x)=>pair(x,acc),null);\n}\n\n// Doubling test\n[10, 20, 40].forEach(n => {\n  calls = 0;\n  length(make_list(n));\n  console.log(`length of ${n}-element list: ${calls} calls`);\n});\n\nconsole.log(\'length doubles with n\');\n',
      hint: 'length is Θ(n) time, Θ(n) space (recursive). The calls double when n doubles.',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('doubles')),
    },
  ],
}
