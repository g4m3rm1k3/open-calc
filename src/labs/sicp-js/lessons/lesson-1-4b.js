export const lesson = {
  id: 'sicp-1-4b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '1.2.3  Orders of Growth',
  checkpoints: [
    { id: 'cp-theta',    label: 'Θ Notation' },
    { id: 'cp-examples', label: 'Comparing Growth' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'We have been calling processes "linear" and "exponential" without defining those words precisely. Section 1.2.3 provides the definition. The key insight: we do not care about exact step counts — those depend on the machine, compiler, and operating system. What we care about is how the cost GROWS as the input grows. Does doubling the input double the work? Square it? Make almost no difference? That shape is what order of growth captures.',
      code: null,
    },

    // ── Theta notation ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'theta-vocab',
      text: 'The notation R(n) = Θ(f(n)) — read "R of n is theta of f of n" — means R grows proportionally to f. Precisely: there exist positive constants k₁ and k₂ such that k₁·f(n) ≤ R(n) ≤ k₂·f(n) for all sufficiently large n. The constants are absorbed by the Θ — only the shape of the curve matters.\n\nThe five most important:\n  Θ(1)  — constant: same cost regardless of input size\n  Θ(log n) — logarithmic: doubling input adds a fixed amount\n  Θ(n)  — linear: doubling input doubles the work\n  Θ(n²) — quadratic: doubling input quadruples the work\n  Θ(2ⁿ) — exponential: adding 1 to input roughly doubles the work',
      code: null,
    },
    {
      type: 'narration',
      id: 'theta-concrete',
      text: 'The doubling test is the easiest way to identify an order of growth: observe how the cost changes when the input doubles. Measure it directly.',
      code: `let calls = 0;

function log_work(n) {   // Θ(log n) — halves n each step
  calls++;
  return n <= 1 ? 0 : 1 + log_work(Math.floor(n / 2));
}
function linear_work(n) {  // Θ(n)
  calls++;
  return n <= 0 ? 0 : linear_work(n - 1);
}

// Doubling test for log_work
console.log('log_work — doubling n adds ~1 step:');
for (const n of [10, 20, 40, 80]) {
  calls = 0; log_work(n);
  console.log(\`  n=\${n}: \${calls} calls\`);
}`,
    },
    {
      type: 'narration',
      id: 'theta-linear-vs-log',
      text: 'The contrast between linear and logarithmic becomes staggering at scale.',
      code: `let calls = 0;

function log_steps(n)    { calls++; return n<=1?0:1+log_steps(Math.floor(n/2)); }
function linear_steps(n) { calls++; return n<=0?0:linear_steps(n-1); }

console.log('Input n   | log steps | linear steps');
for (const n of [10, 100, 1000, 10000]) {
  calls = 0; log_steps(n);    const l = calls;
  calls = 0; linear_steps(n); const li = calls;
  console.log(\`n=\${n}: \${l} log steps, \${li} linear steps\`);
}`,
    },
    { type: 'checkpoint', id: 'cp-theta' },

    // ── Apply Θ to known processes ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'theta-factorial',
      text: 'Apply the analysis to processes we have seen:\n\n  Recursive factorial: Θ(n) time (n calls), Θ(n) space (n stack frames).\n  Iterative factorial: Θ(n) time (n calls), Θ(1) space (one frame reused).\n\nSame time complexity. Different space complexity. The iterative version wins on space without giving up anything on time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'theta-fibonacci',
      text: 'Tree-recursive Fibonacci: Θ(φⁿ) time (exponential), Θ(n) space (depth of deepest branch).\nIterative Fibonacci: Θ(n) time, Θ(1) space.\n\nMeasure the exponential directly.',
      code: `let calls = 0;

function fib_tree(n) {
  calls++;
  return n <= 1 ? n : fib_tree(n-1) + fib_tree(n-2);
}
function fib_iter(n) {
  function step(a, b, c) { calls++; return c===0?b:step(a+b,a,c-1); }
  return step(1, 0, n);
}

console.log('n   | tree calls | iter calls');
for (const n of [10, 15, 20, 25]) {
  calls = 0; fib_tree(n); const t = calls;
  calls = 0; fib_iter(n); const i = calls;
  console.log(\`n=\${n}: \${t} tree, \${i} iter\`);
}`,
    },
    {
      type: 'narration',
      id: 'theta-fast-power',
      text: 'Fast exponentiation by successive squaring: Θ(log n) time and Θ(log n) space (for the recursive version). Adding one bit to the exponent adds at most two steps.',
      code: `let calls = 0;

function slow_power(b, n) { calls++; return n===0?1:b*slow_power(b,n-1); }
function fast_power(b, n) {
  calls++;
  if(n===0) return 1;
  if(n%2===0) return fast_power(b,n/2)**2;
  return b*fast_power(b,n-1);
}

console.log('n    | slow calls | fast calls');
for (const n of [10, 100, 1000]) {
  calls = 0; slow_power(2, n); const s = calls;
  calls = 0; fast_power(2, n); const f = calls;
  console.log(\`n=\${n}: \${s} slow, \${f} fast\`);
}`,
    },
    { type: 'checkpoint', id: 'cp-examples' },

    {
      type: 'challenge',
      id: 'challenge-predict-growth',
      text: 'Before running, predict the order of growth (time and space) for each:\n  (a) length(lst) — count elements of a list recursively\n  (b) fast_power(b, n)\n  (c) fib_tree(n)\n\nThen run the doubling test for length: make lists of sizes 10, 20, 40 and count calls. Does the call count double when the list doubles?',
      expectedOutput: 'calls double with list size',
      startCode: `function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}

let calls = 0;

function length(lst) {
  calls++;
  return is_null(lst) ? 0 : 1 + length(tail(lst));
}

function make_list(n) {
  return Array.from({length:n},(_,i)=>i).reduceRight((acc,x)=>pair(x,acc),null);
}

// Doubling test for length
[10, 20, 40].forEach(n => {
  calls = 0;
  length(make_list(n));
  console.log(\`length of \${n}-element list: \${calls} calls\`);
});

console.log('calls double with list size');  // your prediction
`,
      hint: 'length is Θ(n) time and Θ(n) space — the calls double because each element requires one recursive call.',
      validate: ({ logs }) => logs.some(l => l.includes('doubles')),
    },
  ],
}
