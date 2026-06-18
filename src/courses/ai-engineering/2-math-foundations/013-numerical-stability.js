export default {
  id: 'ae-p1-13-numerical-stability',
  slug: 'numerical-stability',
  chapter: 'ae-p1',
  order: 12,
  title: 'Numerical Stability',
  subtitle: 'Mathematically correct code can produce garbage. Here is why, and how to fix it.',
  tags: ['numerical-stability', 'overflow', 'underflow', 'logsumexp', 'softmax', 'sigmoid', 'gradient-check', 'float32'],

  hook: {
    question: 'Why does `math.exp(1000)` crash your program even though e^1000 is a perfectly valid number?',
    realWorldContext:
      'float32 can represent numbers up to about 3.4×10³⁸. exp(90) ≈ 1.2×10³⁹ — already overflow. exp(100) = inf. A naive softmax implementation explodes on logits > 88. Yet every production ML framework uses softmax daily on logits that vary wildly. The solution is the LogSumExp trick — subtract the maximum before exponentiation. This single technique prevents overflow in softmax, log-softmax, and cross-entropy. Similar stability tricks exist for sigmoid, binary cross-entropy, and gradient checking. Understanding numerical stability separates engineers who write ML code that works from those who copy code that almost works.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Floating point numbers have finite precision (float32: ~7 decimal digits) and finite range (max ≈ 3.4×10³⁸, min positive ≈ 1.2×10⁻³⁸). Overflow: a number is too large to represent → becomes inf. Underflow: a number is too small → becomes 0 (loss of signal). Catastrophic cancellation: subtracting two nearly equal large numbers loses most significant digits.',
      'The LogSumExp trick exploits the fact that log(Σ exp(xᵢ)) = c + log(Σ exp(xᵢ - c)) for any constant c. Choosing c = max(x) ensures that the largest exponent is exp(0) = 1, preventing overflow. Since log is monotone, the math is unchanged. This same trick stabilizes log-softmax, making cross-entropy loss numerically safe for any logit values.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Never compute softmax(x) then log — always use log_softmax',
        body: 'log(softmax(x)) computes exp, normalizes to get probs, then takes log — potentially squashing small values to 0 before the log. log_softmax(x) = x - logsumexp(x) avoids this entirely. PyTorch\'s F.cross_entropy calls log_softmax internally, not softmax then log.',
      },
      {
        type: 'insight',
        title: 'Gradient checking validates your analytical gradient',
        body: 'Numerical gradient: f\'(x) ≈ (f(x+h) - f(x-h)) / (2h). If your analytical gradient and numerical gradient agree to ~5 significant digits, your backprop is correct. This is how every major ML framework validates new operations during development.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Numerical Stability',
        mathBridge: 'logsumexp(x) = c + log(Σ exp(xᵢ-c)), c = max(x). log_softmax(x)ᵢ = xᵢ - logsumexp(x). Stable sigmoid(x) = 1/(1+exp(-x)) for x≥0, exp(x)/(1+exp(x)) for x<0.',
        caption: 'See where naive implementations break and how the tricks fix them.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Float limits and overflow',
              prose: [
                '## Float32 Limits',
                '```\nfloat32 max:   3.4 × 10³⁸  (exp(88) ≈ 1.6×10³⁸ — near limit)\nfloat64 max:   1.8 × 10³⁰⁸ (exp(709) near limit)\nfloat32 eps:   1.2 × 10⁻⁷  (smallest difference from 1.0)\n```',
                '## What Goes Wrong',
                '- **Overflow**: exp(large) → inf. Then inf/inf = NaN in softmax.',
                '- **Underflow**: exp(-large) → 0. Then log(0) = -inf.',
                '- **Cancellation**: (1000001 - 1000000) in float32 may lose digits.',
              ],
              code: `import math
import struct

# Float64 limits (Python's default float)
print("Python float (float64) limits:")
print(f"  max: {1.7976931348623157e+308:.2e}")
print(f"  exp(709): {math.exp(709):.4e}")
try:
    val = math.exp(710)
    print(f"  exp(710): {val}")
except OverflowError as e:
    print(f"  exp(710): OverflowError! ({e})")

# In numpy float32 the limit is much lower
import numpy as np
x32 = np.float32(88)
print(f"\\nnp.exp(float32(88)):  {np.exp(x32):.4e}")
x32b = np.float32(89)
print(f"np.exp(float32(89)):  {np.exp(x32b)}")  # inf!

# Catastrophic cancellation demo
a = 1000000.0
b = 1000000.001
diff = b - a
print(f"\\nCancellation: {b} - {a} = {diff}")
print(f"  Computed: {diff}  Exact: {0.001}")

# What happens to naive softmax with large logits
def softmax_naive(logits):
    exps = [math.exp(z) for z in logits]
    total = sum(exps)
    return [e / total for e in exps]

try:
    result = softmax_naive([1000, 1001, 1002])
    print(f"\\nNaive softmax([1000,1001,1002]): {result}")
except (OverflowError, ZeroDivisionError) as e:
    print(f"\\nNaive softmax([1000,1001,1002]): FAILED ({e})")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The LogSumExp trick',
              prose: [
                '## LogSumExp(x) = c + log(Σ exp(xᵢ - c))',
                'Choose c = max(x). The largest term becomes exp(0) = 1, preventing overflow.',
                '```\nlogsumexp([1000, 1001, 1002]):\n  c = 1002\n  = 1002 + log(exp(-2) + exp(-1) + exp(0))\n  = 1002 + log(0.135 + 0.368 + 1.0)\n  = 1002 + log(1.503)\n  = 1002.41  ✓ (no overflow)\n```',
                '## log_softmax(x)ᵢ = xᵢ - logsumexp(x)',
                'This avoids computing softmax at all, then taking log. Direct and stable.',
              ],
              code: `import math

def logsumexp(values):
    """Numerically stable log-sum-exp."""
    c = max(values)
    return c + math.log(sum(math.exp(v - c) for v in values))

def log_softmax(logits):
    """Stable log-softmax: x_i - logsumexp(x)."""
    lse = logsumexp(logits)
    return [z - lse for z in logits]

def softmax_stable(logits):
    """Stable softmax via log_softmax."""
    log_probs = log_softmax(logits)
    return [math.exp(lp) for lp in log_probs]

def cross_entropy_stable(logits, true_class):
    """Stable cross-entropy: -log_softmax[true_class]."""
    return -log_softmax(logits)[true_class]

# Test: large logits that break naive softmax
cases = [[1.0, 2.0, 3.0], [100, 101, 102], [1000, 1001, 1002], [-1000, -999, -998]]
for logits in cases:
    probs = softmax_stable(logits)
    lse = logsumexp(logits)
    print(f"logits={logits}")
    print(f"  probs={[round(p,4) for p in probs]}  sum={sum(probs):.6f}")
    print(f"  logsumexp={lse:.4f}")

# Verify: log-sum-exp formula
x = [1.0, 2.0, 3.0]
naive_lse = math.log(sum(math.exp(v) for v in x))
stable_lse = logsumexp(x)
print(f"\\nVerify logsumexp([1,2,3]): naive={naive_lse:.6f}  stable={stable_lse:.6f}  match={abs(naive_lse-stable_lse)<1e-10}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Stable sigmoid and binary cross-entropy',
              prose: [
                '## Stable Sigmoid',
                '```\nNaive:  σ(x) = 1 / (1 + exp(-x))     → exp(-(-1000)) = exp(1000) = inf\nStable: if x >= 0: 1/(1+exp(-x))      ← exp(-x) ≤ 1, safe\n        if x < 0:  exp(x)/(1+exp(x))   ← exp(x) ≤ 1, safe\n```',
                '## Stable Binary Cross-Entropy',
                'Given logit z (pre-sigmoid) and true label y:',
                '```\nBCE(z, y) = max(z,0) - y·z + log(1 + exp(-|z|))\n```',
                'This is equivalent to -[y·log(σ(z)) + (1-y)·log(1-σ(z))] but avoids log(0).',
              ],
              code: `import math

def sigmoid_naive(x):
    return 1.0 / (1.0 + math.exp(-x))

def sigmoid_stable(x):
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    else:
        z = math.exp(x)
        return z / (1.0 + z)

def bce_stable(logit, y_true):
    """Stable binary cross-entropy from logit."""
    # = max(z,0) - y*z + log(1 + exp(-|z|))
    return max(logit, 0) - y_true * logit + math.log(1 + math.exp(-abs(logit)))

# Sigmoid stability test
print("Sigmoid stability:")
for x in [0, 1, -1, 100, -100, 1000, -1000]:
    try:
        naive = sigmoid_naive(x)
    except OverflowError:
        naive = "OVERFLOW"
    stable = sigmoid_stable(x)
    print(f"  x={x:>6}: naive={naive!s:>10}  stable={stable:.6f}")

# BCE stability
print("\\nBinary cross-entropy (stable):")
for logit, y in [(0.0, 1), (2.0, 1), (-2.0, 0), (100.0, 0), (-100.0, 1)]:
    loss = bce_stable(logit, y)
    # compare to naive where possible
    try:
        p = sigmoid_naive(logit)
        naive = -(y * math.log(p) + (1-y) * math.log(1-p))
    except (OverflowError, ValueError):
        naive = "FAILED"
    print(f"  logit={logit:>7}, y={y}: stable={loss:.4f}  naive={naive!s}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Gradient checking',
              prose: [
                '## Numerical Gradient Check',
                'Verify analytical gradients by comparing to finite differences:',
                '```\nf\'(x) ≈ (f(x+h) - f(x-h)) / (2h)     h = 1e-5\n```',
                'Central differences (two-sided) are much more accurate than one-sided.',
                'The relative error between analytical and numerical should be < 1e-5.',
                '## Why This Matters',
                'Every time you implement a new layer or loss, gradient check it. A wrong gradient silently causes wrong training. Many production bugs are gradient bugs that survived testing because the model still converged (just slowly or to a wrong solution).',
              ],
              code: `import math

def numerical_gradient(f, x, h=1e-5):
    """Central difference gradient for a scalar-output function."""
    grad = []
    for i in range(len(x)):
        xp = x[:]
        xm = x[:]
        xp[i] += h
        xm[i] -= h
        grad.append((f(xp) - f(xm)) / (2 * h))
    return grad

def relative_error(analytical, numerical):
    denom = max(abs(a) for a in analytical) + 1e-10
    return max(abs(a - n) / denom for a, n in zip(analytical, numerical))

# Test: gradient of quadratic f(x) = sum(x_i^2), grad = 2x
def quad(x):
    return sum(xi**2 for xi in x)

def quad_grad(x):
    return [2*xi for xi in x]

x = [1.0, 2.0, 3.0]
analytical = quad_grad(x)
numerical = numerical_gradient(quad, x)
err = relative_error(analytical, numerical)
print(f"Quadratic gradient check:")
print(f"  Analytical: {analytical}")
print(f"  Numerical:  {[round(g,8) for g in numerical]}")
print(f"  Relative error: {err:.2e}  {'PASS' if err < 1e-5 else 'FAIL'}")

# Test: cross-entropy gradient (w.r.t. logits)
import numpy as np
def cross_entropy_np(logits, true_class):
    logits = np.array(logits)
    exp_l = np.exp(logits - logits.max())
    log_probs = np.log(exp_l / exp_l.sum())
    return float(-log_probs[true_class])

def ce_grad_analytical(logits, true_class):
    """CE gradient w.r.t. logits = softmax - one_hot."""
    logits = np.array(logits)
    exp_l = np.exp(logits - logits.max())
    probs = exp_l / exp_l.sum()
    grad = probs.copy()
    grad[true_class] -= 1
    return list(grad)

logits = [2.0, 1.0, 0.5]
true_class = 0
analytical_ce = ce_grad_analytical(logits, true_class)
numerical_ce = numerical_gradient(lambda x: cross_entropy_np(x, true_class), logits)
err_ce = relative_error(analytical_ce, numerical_ce)
print(f"\\nCross-entropy gradient check:")
print(f"  Analytical: {[round(g,6) for g in analytical_ce]}")
print(f"  Numerical:  {[round(g,6) for g in numerical_ce]}")
print(f"  Relative error: {err_ce:.2e}  {'PASS' if err_ce < 1e-5 else 'FAIL'}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement stable logsumexp and log_softmax',
              difficulty: 'easy',
              prompt: 'Implement `logsumexp(x)` using the max-subtraction trick, and `log_softmax(x)` using it. Then verify that `exp(log_softmax(x))` matches stable `softmax(x)` for normal logits, AND that it handles extreme logits like [1000, 1001, 1002] without overflow.',
              code: `import math

def logsumexp(x):
    """Numerically stable log(sum(exp(xᵢ)))."""
    pass

def log_softmax(x):
    """Numerically stable log-softmax: xᵢ - logsumexp(x)."""
    pass

def softmax_from_log(x):
    """Compute softmax via log_softmax to ensure stability."""
    log_probs = log_softmax(x)
    return [math.exp(lp) for lp in log_probs]

# Test on normal logits
x1 = [2.0, 1.0, 0.1]
probs = softmax_from_log(x1)
print(f"softmax({x1}):")
print(f"  probs = {[round(p, 4) for p in probs]}")
print(f"  sum   = {sum(probs):.8f}  (should be 1.0)")

# Test on extreme logits
x2 = [1000, 1001, 1002]
probs2 = softmax_from_log(x2)
print(f"\\nsoftmax({x2}):")
print(f"  probs = {[round(p, 4) for p in probs2]}")
print(f"  sum   = {sum(probs2):.8f}  (should be 1.0, not NaN)")

# log_softmax values
lsp = log_softmax(x1)
print(f"\\nlog_softmax({x1}):")
print(f"  values = {[round(lp, 4) for lp in lsp]}")
print(f"  should all be <= 0: {all(lp <= 0 for lp in lsp)}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'logsumexp' not in dir() or 'log_softmax' not in dir():
    res = "ERROR: logsumexp or log_softmax not defined."
else:
    # Basic test
    lse = logsumexp([1.0, 2.0, 3.0])
    expected = math.log(math.exp(1) + math.exp(2) + math.exp(3))
    if abs(lse - expected) > 1e-8:
        res = f"ERROR: logsumexp([1,2,3]) = {lse:.6f}, expected {expected:.6f}"
    else:
        # Extreme logits should not overflow
        try:
            lse2 = logsumexp([1000, 1001, 1002])
            if math.isinf(lse2) or math.isnan(lse2):
                res = f"ERROR: logsumexp([1000,1001,1002]) overflowed: {lse2}"
            else:
                # log_softmax should sum to log(1) = 0 in log space
                lsp = log_softmax([2.0, 1.0, 0.1])
                if abs(sum(math.exp(p) for p in lsp) - 1.0) > 1e-8:
                    res = "ERROR: exp(log_softmax) should sum to 1"
                else:
                    res = f"SUCCESS: logsumexp and log_softmax handle normal and extreme logits."
        except (OverflowError, ValueError) as e:
            res = f"ERROR: extreme logits caused exception: {e}"
res
`,
              hint: 'logsumexp: c = max(x). return c + math.log(sum(math.exp(v - c) for v in x)). log_softmax: lse = logsumexp(x). return [z - lse for z in x].',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'Why does naive softmax fail on logits like [1000, 1001, 1002]?',
      options: [
        'Softmax is undefined for positive logits',
        'exp(1000) overflows float range, producing inf, making inf/inf = NaN',
        'The logits are too close together for softmax to differentiate',
        'Softmax requires logits to sum to zero',
      ],
      correct: 1,
      explanation: 'exp(1000) ≈ 10^434, far above float64 max (≈10^308). Result is inf. Then inf/inf = NaN. The stable fix: subtract max first. exp(1000-1002)=exp(-2)≈0.135, exp(-1)≈0.368, exp(0)=1. All small values, no overflow.',
    },
    {
      id: 'q2',
      question: 'The LogSumExp trick computes c + log(Σ exp(xᵢ - c)) where c = max(x). Why is this mathematically equivalent to log(Σ exp(xᵢ))?',
      options: [
        'Because subtracting a constant from logits does not change the distribution',
        'Because log(Σ exp(xᵢ)) = log(exp(c) × Σ exp(xᵢ - c)) = c + log(Σ exp(xᵢ - c))',
        'Because exp(max) ≈ 1 for any input',
        'Because the max term dominates all other terms in the sum',
      ],
      correct: 1,
      explanation: 'Factor out exp(c): Σ exp(xᵢ) = exp(c) × Σ exp(xᵢ - c). Taking log: log(Σ exp(xᵢ)) = c + log(Σ exp(xᵢ - c)). With c = max(x), the largest term in the inner sum is exp(0) = 1, preventing overflow.',
    },
    {
      id: 'q3',
      question: 'Stable sigmoid uses two formulas: 1/(1+exp(-x)) for x≥0 and exp(x)/(1+exp(x)) for x<0. Why?',
      options: [
        'For accuracy — the two formulas give slightly different results',
        'For x≥0, exp(-x)≤1 (safe). For x<0, naive would compute exp(-x)=exp(|x|) which overflows',
        'To handle integer and float inputs separately',
        'Because the derivative formula differs in each region',
      ],
      correct: 1,
      explanation: 'For x = -1000: naive computes 1/(1 + exp(1000)) → exp(1000) = inf → 1/inf = 0 or crashes. Stable uses exp(-1000)/(1 + exp(-1000)) ≈ 0/1 = 0 correctly. For x = 1000: naive computes 1/(1 + exp(-1000)) = 1/(1+0) = 1 correctly — no fix needed.',
    },
    {
      id: 'q4',
      question: 'Central difference gradient (f(x+h) - f(x-h)) / 2h is more accurate than forward difference (f(x+h) - f(x)) / h. Why?',
      options: [
        'Central difference is faster to compute',
        'Central difference has O(h²) error while forward difference has O(h) error',
        'Central difference does not require computing f at multiple points',
        'Forward difference overflows for large h values',
      ],
      correct: 1,
      explanation: 'Taylor expansion: f(x+h) = f(x) + h·f\'(x) + h²/2·f\'\'(x) + ... Forward difference error ≈ h·f\'\'(x)/2 = O(h). Central difference: (f(x+h) - f(x-h))/2h cancels the h² term, giving error O(h²). At h=1e-5: forward error ≈ 10⁻⁵, central error ≈ 10⁻¹⁰.',
    },
    {
      id: 'q5',
      question: 'In PyTorch, F.cross_entropy(logits, labels) is preferable to F.nll_loss(F.softmax(logits).log(), labels) because:',
      options: [
        'F.cross_entropy is faster due to CUDA optimizations',
        'F.cross_entropy internally uses log_softmax, avoiding numerical instability from softmax → log',
        'F.softmax clips values to [0,1] which distorts the gradients',
        'F.nll_loss does not support batch inputs',
      ],
      correct: 1,
      explanation: 'softmax then log loses precision: small softmax values (near 0) get squashed to log(≈0) = -inf. log_softmax directly computes xᵢ - logsumexp(x) without this intermediate loss. F.cross_entropy calls log_softmax internally, which is both more stable and faster.',
    },
  ],
}
