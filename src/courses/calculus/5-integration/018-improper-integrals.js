// FILE: src/content/chapter-4/11-improper-integrals.js
export default {
  id: 'ch4-011',
  slug: 'improper-integrals',
  chapter: 4,
  order: 11,
  title: 'Improper Integrals',
  subtitle: 'Extending integration to infinite intervals and unbounded functions — convergence, divergence, and surprising finite answers',
  tags: ['improper integral', 'convergence', 'divergence', 'infinite limits', 'p-integral', 'comparison test', 'Gabriel horn'],

  hook: {
    question: 'Can you find the area under y = 1/x² from x = 1 to infinity? The region extends infinitely to the right, so the area must be infinite... right? Wrong. ∫₁^∞ 1/x² dx = [−1/x]₁^∞ = 0−(−1) = 1. An infinitely long region with FINITE area. How is this possible? And how do we know when an infinite integral gives a finite answer versus when it diverges to infinity?',
    realWorldContext: 'Improper integrals are fundamental to probability theory: every continuous probability distribution satisfies ∫₋∞^∞ f(x) dx = 1 — an improper integral. The normal distribution integral ∫₋∞^∞ e^(−x²/2) dx = √(2π) is one of the most important results in statistics. In physics, the total energy radiated by a black body is ∫₀^∞ ν³/(e^(hν/kT)−1) dν — an improper integral that Planck evaluated to derive quantum theory. In economics, the present value of a perpetual income stream is ∫₀^∞ R·e^(−rt) dt = R/r — the foundation of bond pricing and asset valuation.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'An improper integral arises when the "standard" Riemann integral definition breaks down — either because the interval is infinite or because the integrand blows up somewhere on the interval. There are two types: Type 1 has an infinite limit of integration (like $\\int_1^\\infty 1/x^2\\,dx$), and Type 2 has a discontinuous integrand (like $\\int_0^1 1/\\sqrt{x}\\,dx$, where $1/\\sqrt{x} \\to \\infty$ as $x \\to 0^+$).',
      'The idea for handling both types is the same: replace the problematic part with a finite limit, compute the ordinary integral, and then take the limit. For Type 1: $\\int_1^\\infty f(x)\\,dx = \\lim_{b \\to \\infty} \\int_1^b f(x)\\,dx$. For Type 2 (discontinuity at $a$): $\\int_a^b f(x)\\,dx = \\lim_{\\epsilon \\to 0^+} \\int_{a+\\epsilon}^b f(x)\\,dx$. If the limit exists and is finite, the integral converges. If the limit is $\\pm\\infty$ or does not exist, the integral diverges.',
      'The $p$-integral test is the most important convergence test: $\\int_1^\\infty 1/x^p\\,dx$ converges if and only if $p > 1$. At the boundary $p = 1$, we get $\\int_1^\\infty 1/x\\,dx = \\lim_{b \\to \\infty} \\ln b = \\infty$ — divergent. For $p > 1$: $\\int_1^\\infty x^{-p}\\,dx = [x^{1-p}/(1-p)]_1^\\infty = 0 - 1/(1-p) = 1/(p-1)$ — convergent. The cutoff is sharp: $1/x^{1.001}$ has finite total area, but $1/x^{0.999}$ does not.',
      'There is also a $p$-test near zero: $\\int_0^1 1/x^p\\,dx$ converges if and only if $p < 1$. This is the mirror image: near zero, $1/x^p$ blows up, but for $p < 1$ it does not blow up fast enough to make the area infinite. At $p = 1$, $\\int_0^1 1/x\\,dx = \\lim_{\\epsilon \\to 0^+}(-\\ln \\epsilon) = \\infty$. So $1/x$ is the "boundary function" for both types.',
      'The comparison test lets you determine convergence without computing the integral. If $0 \\leq f(x) \\leq g(x)$ for all $x$ large enough, then: if $\\int g$ converges, so does $\\int f$ (smaller function, smaller area). If $\\int f$ diverges, so does $\\int g$ (larger function, larger area). Typically you compare against a known $p$-integral. For example, $\\int_1^\\infty e^{-x}\\,dx$ converges because $e^{-x} \\leq 1/x^2$ for large $x$ (exponentials decay faster than any power).',
      'The limit comparison test is often easier: if $\\lim_{x \\to \\infty} f(x)/g(x) = L$ with $0 < L < \\infty$, then $\\int f$ and $\\int g$ either both converge or both diverge. This avoids proving an inequality; you just need the ratio to approach a positive constant. Compare $\\int_1^\\infty (3x+1)/(x^3+x^2)\\,dx$ with $\\int_1^\\infty 3/x^2\\,dx$: the ratio approaches 1, so both converge.',
      'Gabriel\'s Horn (Torricelli\'s trumpet) is a stunning paradox. Rotate $y = 1/x$ for $x \\geq 1$ around the $x$-axis. The volume is $\\pi\\int_1^\\infty 1/x^2\\,dx = \\pi$ — finite! But the surface area is $2\\pi\\int_1^\\infty (1/x)\\sqrt{1+1/x^4}\\,dx \\geq 2\\pi\\int_1^\\infty 1/x\\,dx = \\infty$. You can fill the horn with paint (finite volume), but you cannot paint its surface (infinite area). This is not a contradiction — it reflects the difference between $\\int 1/x^2$ (converges) and $\\int 1/x$ (diverges).',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'When to Check for Improper Integrals',
        body: 'Before evaluating ANY definite integral, check for two things: (1) Are either of the limits ±∞? (2) Does the integrand blow up at any point in [a,b] (including the endpoints)? If yes to either, the integral is improper and you MUST use limits. Applying FTC directly without the limit process can give wrong answers.',
      },
      {
        type: 'theorem',
        title: 'The p-Integral Test',
        body: '∫₁^∞ 1/x^p dx: converges iff p > 1. Value: 1/(p−1).\n∫₀¹ 1/x^p dx: converges iff p < 1. Value: 1/(1−p).\nAt p = 1, both diverge (∫1/x = ln → ∞).',
      },
      {
        type: 'warning',
        title: 'Hidden Discontinuities',
        body: '∫₋₁¹ 1/x² dx looks harmless, but 1/x² → ∞ at x = 0. You MUST split at 0: ∫₋₁⁰ + ∫₀¹, and check each. In fact, ∫₀¹ 1/x² dx = lim[−1/x]₀₊¹ = lim(−1+1/ε) = ∞. The integral diverges! Blindly applying FTC gives [−1/x]₋₁¹ = −1−1 = −2, which is WRONG (a negative "area" for a positive function).',
      },
      {
        type: 'real-world',
        title: 'Probability Distributions Must Integrate to 1',
        body: 'Every probability density function f(x) satisfies ∫₋∞^∞ f(x) dx = 1. For the exponential distribution f(x) = λe^(−λx) (x ≥ 0): ∫₀^∞ λe^(−λx) dx = [−e^(−λx)]₀^∞ = 0−(−1) = 1. The convergence of this improper integral is what makes the exponential distribution a valid probability model.',
      },
      {
        type: 'misconception',
        title: '∞ − ∞ Is Not Zero',
        body: 'For ∫₋∞^∞ f(x) dx, you CANNOT write lim_{b→∞} ∫₋ᵦᵇ f(x) dx (that would be the "principal value," a different concept). You must split: ∫₋∞⁰ + ∫₀^∞, and BOTH must converge independently. If ∫₋∞⁰ x dx = −∞ and ∫₀^∞ x dx = +∞, the integral ∫₋∞^∞ x dx DIVERGES, even though the "symmetric" limit would give 0.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Convergent vs. Divergent Improper Integrals',
        caption: 'Compare 1/x² (convergent, total area = 1) with 1/x (divergent, area grows without bound). Both approach the x-axis, but 1/x² approaches fast enough for the tail area to be finite.',
      },
    ],
  },

  math: {
    prose: [
      'Type 1 (infinite limits): $\\int_a^\\infty f(x)\\,dx = \\lim_{b \\to \\infty}\\int_a^b f(x)\\,dx$. Similarly, $\\int_{-\\infty}^b f(x)\\,dx = \\lim_{a \\to -\\infty}\\int_a^b f(x)\\,dx$. For $\\int_{-\\infty}^{\\infty} f(x)\\,dx$: split at any point $c$: $\\int_{-\\infty}^c f + \\int_c^\\infty f$. Both must converge independently.',
      'Type 2 (discontinuous integrand): if $f$ has a vertical asymptote at $x = c \\in [a,b]$, split at $c$: $\\int_a^b f = \\int_a^c f + \\int_c^b f$, where $\\int_a^c f = \\lim_{\\epsilon \\to 0^+}\\int_a^{c-\\epsilon}f$ and $\\int_c^b f = \\lim_{\\epsilon \\to 0^+}\\int_{c+\\epsilon}^b f$. Both must converge for the original integral to converge.',
      'Direct comparison test: suppose $0 \\leq f(x) \\leq g(x)$ for $x \\geq a$. If $\\int_a^\\infty g$ converges, then $\\int_a^\\infty f$ converges. If $\\int_a^\\infty f$ diverges, then $\\int_a^\\infty g$ diverges. The comparison need only hold for $x$ sufficiently large (behavior near $a$ does not affect convergence at $\\infty$).',
      'Limit comparison test: if $f, g > 0$ for $x \\geq a$ and $\\lim_{x \\to \\infty} f(x)/g(x) = L$ with $0 < L < \\infty$, then $\\int_a^\\infty f$ and $\\int_a^\\infty g$ either both converge or both diverge. This is proved by showing $f \\leq 2Lg$ and $g \\leq (2/L)f$ for large enough $x$.',
      'Key convergent integrals: $\\int_0^\\infty e^{-x}\\,dx = 1$; $\\int_0^\\infty e^{-x^2}\\,dx = \\sqrt{\\pi}/2$ (Gaussian integral); $\\int_0^\\infty x^{n-1}e^{-x}\\,dx = (n-1)!$ (Gamma function, $\\Gamma(n)$); $\\int_1^\\infty 1/x^p\\,dx = 1/(p-1)$ for $p > 1$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Convergence and Divergence',
        body: 'An improper integral converges if the defining limit exists and is finite. Otherwise it diverges. A divergent integral may tend to \\(+\\infty\\), \\(-\\infty\\), or oscillate without approaching any limit.',
      },
      {
        type: 'theorem',
        title: 'Comparison Tests',
        body: 'Direct: if \\(0 \\leq f \\leq g\\) and \\(\\int g\\) converges, then \\(\\int f\\) converges.\nLimit: if \\(f/g \\to L \\in (0,\\infty)\\), then \\(\\int f\\) and \\(\\int g\\) share convergence behavior.\nUsual comparison targets: \\(1/x^p\\) and \\(e^{-x}\\).',
      },
      {
        type: 'theorem',
        title: 'Gaussian Integral',
        body: '\\[\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}\\]\nThis integral has no elementary antiderivative but has a finite value, computed by a polar-coordinates trick (squaring and converting to 2D). It is the foundation of the normal distribution in statistics.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Python Lab: Watch Improper Integrals Converge (or Diverge)',
        caption: 'Compute ∫₁^b f(x)dx as b grows, see partial areas accumulate, and watch the p-test cutoff at p=1 in real time.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'p-Test: ∫₁^∞ 1/xᵖ dx — converge or diverge?',
              prose: [
                '**Theory**: converges iff $p > 1$, value $= 1/(p-1)$.',
                'Watch partial integrals $\\int_1^b x^{-p}\\,dx$ as $b$ grows to see convergence vs divergence.',
              ],
              instructions: 'Change p to 1.5, 0.5, 1.001, 0.999 and see the sharp cutoff at p=1.',
              code: `from opencalc import Figure
import math

p = 2.0   # try 0.5, 1.0, 1.5, 1.001, 0.999

def partial_integral(b, p):
    """∫₁^b x^(-p) dx"""
    if p == 1:
        return math.log(b)
    return (b**(1-p) - 1) / (1-p)

bs = [1, 2, 5, 10, 50, 100, 500, 1000, 5000]
print(f"p = {p}  (converges if p > 1)")
print()
print(f"{'b':>6}  {'∫₁^b x^(-p) dx':>22}  {'limit prediction'}")
print("-" * 55)
if p > 1:
    theory = 1 / (p-1)
    for b in bs:
        v = partial_integral(b, p)
        print(f"{b:>6}  {v:>22.12f}  → {theory:.12f}")
    print(f"\\nConverges to 1/(p-1) = 1/{p-1:.3f} = {theory:.12f}")
else:
    for b in bs:
        v = partial_integral(b, p)
        print(f"{b:>6}  {v:>22.6f}  → ∞ (diverges!)")
    print(f"\\nDiverges (p={p} ≤ 1)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Plot: convergent 1/x² vs divergent 1/x — same picture, different fate',
              prose: [
                'Both $1/x$ and $1/x^2$ approach zero as $x \\to \\infty$.',
                'Yet $\\int_1^\\infty 1/x^2\\,dx = 1$ (finite) while $\\int_1^\\infty 1/x\\,dx = \\infty$.',
                'The **area** under the tail is what matters, not the height alone.',
              ],
              code: `from opencalc import Figure
import math

def running_area(p, b_max=20, n=500):
    """Compute running area ∫₁^b for b in [1, b_max]."""
    db = (b_max - 1) / n
    bs, areas = [1.0], [0.0]
    for i in range(1, n+1):
        b = 1 + i * db
        if p == 1:
            a = math.log(b)
        else:
            a = (b**(1-p) - 1) / (1-p)
        bs.append(b)
        areas.append(a)
    return bs, areas

bs1, a1 = running_area(2)    # 1/x² → total 1
bs2, a2 = running_area(1)    # 1/x  → ∞

fig = Figure(xmin=1, xmax=20, ymin=0, ymax=4,
    title="Running area ∫₁^b xᵖ dx: p=2 (converges to 1) vs p=1 (diverges)")
fig.grid().axes()
for i in range(len(bs1)-1):
    fig.line([bs1[i], a1[i]], [bs1[i+1], a1[i+1]], color='blue', width=2)
for i in range(len(bs2)-1):
    fig.line([bs2[i], a2[i]], [bs2[i+1], a2[i+1]], color='red', width=2)
fig.hline(1.0, color='amber', dashed=True)
fig.text([12, 1.15], '∫1/x² → 1', color='blue', size=11)
fig.text([12, 3.2], '∫1/x → ∞', color='red', size=11)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Gabriel's Horn: finite volume, infinite surface area",
              prose: [
                'Rotate $y = 1/x$ for $x \\geq 1$ around the $x$-axis.',
                '**Volume** $= \\pi \\int_1^\\infty \\frac{1}{x^2}\\,dx = \\pi$ — **finite!**',
                '**Surface area** $\\geq 2\\pi \\int_1^\\infty \\frac{1}{x}\\,dx = \\infty$',
                'You can fill Gabriel\'s Horn with $\\pi$ cm³ of paint — but not paint its outside.',
              ],
              code: `import math

def horn_volume(b):
    """π ∫₁^b (1/x)² dx = π[-1/x]₁^b = π(1 - 1/b)"""
    return math.pi * (1 - 1/b)

def horn_surface_lower(b):
    """Lower bound: 2π ∫₁^b (1/x) dx = 2π ln(b)"""
    return 2 * math.pi * math.log(b)

print("Gabriel's Horn: Rotate y=1/x around x-axis")
print()
print(f"{'b':>8}  {'Volume':>18}  {'Surface (lower bound)':>22}")
print("-" * 55)
for b in [2, 5, 10, 100, 1000, 10000]:
    V = horn_volume(b)
    S = horn_surface_lower(b)
    print(f"{b:>8}  {V:>18.10f}  {S:>22.10f}")

print()
print(f"Volume → π = {math.pi:.10f}")
print("Surface → ∞ (grows without bound)")
print()
print("Paradox resolved:")
print("  Volume integral:  ∫1/x² dx (p=2>1) → CONVERGES to 1")
print("  Surface integral: ∫1/x dx  (p=1)   → DIVERGES to ∞")
print("  One sign difference in the exponent changes everything.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              challengeType: 'write',
              challengeTitle: 'Your Turn: Estimate the Gaussian integral ∫₀^∞ e^(−x²) dx',
              difficulty: 'hard',
              prompt: 'The Gaussian integral ∫₀^∞ e^(−x²) dx = √π/2 ≈ 0.8862...\n\nIt has no elementary antiderivative, but it converges. Verify this numerically:\n\n1. Compute ∫₀^b e^(−x²) dx for b = 1, 2, 3, 5, 10 using a Riemann sum\n2. Confirm it approaches √π/2\n3. Plot the running area as a function of b',
              hint: 'Use a Riemann sum with n=10000 strips: sum f(x)*dx for x from 0 to b. Compare to math.sqrt(math.pi)/2.',
              code: `import math
from opencalc import Figure

f    = lambda x: math.exp(-x**2)
true = math.sqrt(math.pi) / 2   # ≈ 0.8862269...

print(f"True value: √π/2 = {true:.12f}")
print()

# YOUR CODE: compute ∫₀^b e^(-x²) dx for several values of b
# Hint: n=10000 strips, dx = b/n, sum = sum(f(0 + i*dx) * dx for i in range(n))

# for b in [1, 2, 3, 5, 10]:
#     n  = 10000
#     dx = b / n
#     area = sum(f(i*dx) * dx for i in range(n))
#     print(f"  b={b:>4}: ∫₀^b = {area:.10f}  error = {abs(area-true):.2e}")

# Bonus: plot the running area vs b
# bs = ...
# areas = ...
# fig = Figure(...)
# fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
          ]
        }
      },
    ],
  },


  rigor: {
    prose: [
      'The improper integral $\\int_a^\\infty f(x)\\,dx$ is defined as $\\lim_{b \\to \\infty}\\int_a^b f(x)\\,dx$, provided this limit exists in $\\mathbb{R}$. The ordinary Riemann integral $\\int_a^b f$ is well-defined for each finite $b$ (assuming $f$ is integrable on every $[a,b]$). The improper integral extends this to an infinite interval by taking the limit of the finitely-defined object.',
      'For Type 2, the integral $\\int_a^b f(x)\\,dx$ where $f$ has a singularity at $a$ is defined as $\\lim_{\\epsilon \\to 0^+}\\int_{a+\\epsilon}^b f(x)\\,dx$. If $f$ is unbounded near $a$ but integrable on every $[a+\\epsilon, b]$, this limit may or may not exist. The $p$-test provides the criterion: $f(x) \\sim C/(x-a)^p$ near $a$ implies convergence iff $p < 1$.',
      'Proof of the $p$-test ($\\int_1^\\infty x^{-p}\\,dx$). For $p \\neq 1$: $\\int_1^b x^{-p}\\,dx = [x^{1-p}/(1-p)]_1^b = b^{1-p}/(1-p) - 1/(1-p)$. As $b \\to \\infty$: if $1-p < 0$ (i.e., $p > 1$), then $b^{1-p} \\to 0$, giving limit $-1/(1-p) = 1/(p-1)$. If $1-p > 0$ (i.e., $p < 1$), then $b^{1-p} \\to \\infty$, giving divergence. If $1-p = 0$ (i.e., $p = 1$): $\\int_1^b 1/x\\,dx = \\ln b \\to \\infty$.',
      'Gabriel\'s Horn — formal verification. Volume: $V = \\pi\\int_1^\\infty (1/x)^2\\,dx = \\pi\\int_1^\\infty x^{-2}\\,dx = \\pi[−1/x]_1^\\infty = \\pi(0-(-1)) = \\pi$. Surface area: $S = 2\\pi\\int_1^\\infty (1/x)\\sqrt{1+1/x^4}\\,dx \\geq 2\\pi\\int_1^\\infty 1/x\\,dx = \\infty$ (since $\\sqrt{1+1/x^4} \\geq 1$). The volume integral converges ($p = 2 > 1$) while the surface area integral diverges (bounded below by a $p = 1$ integral).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'p-Test Proof',
        body: '\\(\\int_1^\\infty x^{-p}dx = \\frac{b^{1-p}-1}{1-p}\\). As \\(b \\to \\infty\\): \\(b^{1-p} \\to 0\\) iff \\(1-p < 0\\) iff \\(p > 1\\). The borderline case \\(p = 1\\) gives \\(\\ln b \\to \\infty\\). This sharp cutoff explains why \\(1/x^2\\) is integrable but \\(1/x\\) is not.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-011-ex1',
      title: 'Type 1: ∫₁^∞ 1/x² dx',
      problem: '\\text{Evaluate } \\int_1^\\infty \\frac{1}{x^2}\\,dx.',
      steps: [
        { expression: '\\int_1^\\infty \\frac{1}{x^2}\\,dx = \\lim_{b \\to \\infty}\\int_1^b x^{-2}\\,dx', annotation: 'Replace ∞ with a finite limit b.' },
        { expression: '= \\lim_{b \\to \\infty}\\left[-\\frac{1}{x}\\right]_1^b = \\lim_{b \\to \\infty}\\left(-\\frac{1}{b}+1\\right)', annotation: 'Antiderivative of x⁻² is −x⁻¹. Evaluate at limits.' },
        { expression: '= 0 + 1 = 1', annotation: 'As b → ∞, 1/b → 0.' },
      ],
      conclusion: '∫₁^∞ 1/x² dx = 1. The infinite tail has finite area. This is the p-test with p = 2 > 1.',
    },
    {
      id: 'ch4-011-ex2',
      title: 'Type 1 (Divergent): ∫₁^∞ 1/x dx',
      problem: '\\text{Show that } \\int_1^\\infty \\frac{1}{x}\\,dx \\text{ diverges.}',
      steps: [
        { expression: '\\int_1^\\infty \\frac{1}{x}\\,dx = \\lim_{b \\to \\infty}\\int_1^b \\frac{1}{x}\\,dx = \\lim_{b \\to \\infty}[\\ln x]_1^b', annotation: 'Set up the limit.' },
        { expression: '= \\lim_{b \\to \\infty}(\\ln b - \\ln 1) = \\lim_{b \\to \\infty}\\ln b = \\infty', annotation: 'ln b grows without bound.' },
      ],
      conclusion: '∫₁^∞ 1/x dx diverges. Despite 1/x → 0, it approaches zero too slowly for the tail area to be finite. This is the borderline case p = 1.',
    },
    {
      id: 'ch4-011-ex3',
      title: 'Type 1: ∫₀^∞ e^(−x) dx',
      problem: '\\text{Evaluate } \\int_0^\\infty e^{-x}\\,dx.',
      steps: [
        { expression: '\\int_0^\\infty e^{-x}\\,dx = \\lim_{b \\to \\infty}\\int_0^b e^{-x}\\,dx', annotation: 'Replace ∞ with b.' },
        { expression: '= \\lim_{b \\to \\infty}[-e^{-x}]_0^b = \\lim_{b \\to \\infty}(-e^{-b}+e^0)', annotation: 'Antiderivative of e^(−x) is −e^(−x).' },
        { expression: '= 0 + 1 = 1', annotation: 'e^(−b) → 0 as b → ∞ (exponential decay).' },
      ],
      conclusion: '∫₀^∞ e^(−x) dx = 1. Exponentials decay fast enough for convergence. This integral is the total area of the exponential distribution with λ = 1.',
    },
    {
      id: 'ch4-011-ex4',
      title: 'Type 2: ∫₀¹ 1/√x dx',
      problem: '\\text{Evaluate } \\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx.',
      steps: [
        { expression: '\\frac{1}{\\sqrt{x}} \\to \\infty \\text{ as } x \\to 0^+', annotation: 'The integrand has a vertical asymptote at x = 0. This is Type 2.' },
        { expression: '\\int_0^1 x^{-1/2}dx = \\lim_{\\epsilon \\to 0^+}\\int_\\epsilon^1 x^{-1/2}dx', annotation: 'Replace 0 with ε and take the limit.' },
        { expression: '= \\lim_{\\epsilon \\to 0^+}[2x^{1/2}]_\\epsilon^1 = \\lim_{\\epsilon \\to 0^+}(2-2\\sqrt{\\epsilon})', annotation: 'Power rule: ∫x^(−1/2) dx = 2x^(1/2).' },
        { expression: '= 2 - 0 = 2', annotation: '√ε → 0 as ε → 0.' },
      ],
      conclusion: '∫₀¹ 1/√x dx = 2. This is the p-test at 0 with p = 1/2 < 1 — convergent.',
    },
    {
      id: 'ch4-011-ex5',
      title: 'Comparison Test: ∫₁^∞ 1/(x²+x) dx',
      problem: '\\text{Determine whether } \\int_1^\\infty \\frac{1}{x^2+x}\\,dx \\text{ converges and find its value.}',
      steps: [
        { expression: '\\frac{1}{x^2+x} \\leq \\frac{1}{x^2} \\text{ for } x \\geq 1', annotation: 'Comparison: x²+x > x², so 1/(x²+x) < 1/x². Since ∫1/x² converges, so does ∫1/(x²+x).' },
        { expression: '\\frac{1}{x^2+x} = \\frac{1}{x(x+1)} = \\frac{1}{x}-\\frac{1}{x+1}', annotation: 'But we can also compute exactly using partial fractions!' },
        { expression: '\\int_1^b \\left(\\frac{1}{x}-\\frac{1}{x+1}\\right)dx = [\\ln x - \\ln(x+1)]_1^b = \\ln\\frac{b}{b+1}-\\ln\\frac{1}{2}', annotation: 'Telescoping with logs.' },
        { expression: '= \\ln\\frac{b}{b+1}+\\ln 2 \\to \\ln 1 + \\ln 2 = \\ln 2', annotation: 'As b → ∞, b/(b+1) → 1, so ln(b/(b+1)) → 0.' },
      ],
      conclusion: '∫₁^∞ 1/(x²+x) dx = ln 2. We confirmed convergence by comparison and computed the exact value by partial fractions.',
    },
    {
      id: 'ch4-011-ex6',
      title: 'Gabriel\'s Horn: Finite Volume, Infinite Surface Area',
      problem: '\\text{Show that rotating } y = 1/x \\text{ for } x \\geq 1 \\text{ around the x-axis gives volume } \\pi \\text{ but infinite surface area.}',
      steps: [
        { expression: 'V = \\pi\\int_1^\\infty \\left(\\frac{1}{x}\\right)^2 dx = \\pi\\int_1^\\infty \\frac{1}{x^2}\\,dx = \\pi\\cdot 1 = \\pi', annotation: 'Disk method. ∫1/x² from 1 to ∞ = 1 (Example 1).' },
        { expression: 'S = 2\\pi\\int_1^\\infty \\frac{1}{x}\\sqrt{1+\\frac{1}{x^4}}\\,dx', annotation: 'Surface area formula for revolution.' },
        { expression: 'S \\geq 2\\pi\\int_1^\\infty \\frac{1}{x}\\cdot 1\\,dx = 2\\pi\\int_1^\\infty \\frac{1}{x}\\,dx = \\infty', annotation: '√(1+1/x⁴) ≥ 1, so S ≥ 2π∫1/x dx = ∞.' },
      ],
      conclusion: 'Volume = π (finite), surface area = ∞. The horn can be filled with a finite amount of paint, but its surface cannot be painted. The paradox hinges on the difference between p = 2 (converges) and p = 1 (diverges).',
    },
  ],

  challenges: [
    {
      id: 'ch4-011-ch1',
      difficulty: 'easy',
      problem: 'Evaluate ∫₂^∞ 1/x³ dx and ∫₀¹ 1/x^(2/3) dx.',
      hint: 'Both are p-integrals. First: p = 3 > 1, converges. Second: p = 2/3 < 1 at x = 0, converges.',
      walkthrough: [
        { expression: '\\int_2^\\infty x^{-3}dx = \\lim_{b\\to\\infty}\\left[-\\frac{1}{2x^2}\\right]_2^b = 0+\\frac{1}{8} = \\frac{1}{8}', annotation: 'p = 3 > 1. Antiderivative: x^(−2)/(−2).' },
        { expression: '\\int_0^1 x^{-2/3}dx = \\lim_{\\epsilon\\to 0^+}\\left[3x^{1/3}\\right]_\\epsilon^1 = 3-0 = 3', annotation: 'p = 2/3 < 1. Antiderivative: x^(1/3)/(1/3) = 3x^(1/3).' },
      ],
      answer: '\\frac{1}{8} \\text{ and } 3',
    },
    {
      id: 'ch4-011-ch2',
      difficulty: 'medium',
      problem: 'Use the limit comparison test to determine whether ∫₁^∞ (x+3)/(x³−x+1) dx converges.',
      hint: 'For large x, (x+3)/(x³−x+1) behaves like x/x³ = 1/x². Compare with ∫1/x² dx.',
      walkthrough: [
        { expression: '\\text{Let } f(x) = \\frac{x+3}{x^3-x+1},\\; g(x) = \\frac{1}{x^2}', annotation: 'Choose g based on dominant terms for large x.' },
        { expression: '\\frac{f(x)}{g(x)} = \\frac{(x+3)x^2}{x^3-x+1} = \\frac{x^3+3x^2}{x^3-x+1}', annotation: 'Compute the ratio.' },
        { expression: '\\lim_{x\\to\\infty}\\frac{x^3+3x^2}{x^3-x+1} = \\lim_{x\\to\\infty}\\frac{1+3/x}{1-1/x^2+1/x^3} = 1', annotation: 'Divide numerator and denominator by x³.' },
        { expression: 'L = 1 \\in (0,\\infty), \\text{ and } \\int_1^\\infty 1/x^2\\,dx \\text{ converges, so } \\int_1^\\infty f \\text{ converges.}', annotation: 'Limit comparison test applies.' },
      ],
      answer: '\\text{Converges (by limit comparison with } 1/x^2\\text{)}',
    },
    {
      id: 'ch4-011-ch3',
      difficulty: 'hard',
      problem: 'Evaluate ∫₀^∞ x·e^(−x) dx. This integral gives the mean of the exponential distribution with λ = 1.',
      hint: 'Integration by parts with u = x, dv = e^(−x) dx, then take the limit. You will need L\'Hôpital\'s rule to evaluate lim(b→∞) b·e^(−b).',
      walkthrough: [
        { expression: '\\int_0^b xe^{-x}dx: u=x, dv=e^{-x}dx \\Rightarrow du=dx, v=-e^{-x}', annotation: 'By parts.' },
        { expression: '= [-xe^{-x}]_0^b + \\int_0^b e^{-x}dx = -be^{-b}+0+[-e^{-x}]_0^b', annotation: 'Apply the formula.' },
        { expression: '= -be^{-b}+(-e^{-b}+1) = 1-e^{-b}(b+1)', annotation: 'Combine terms.' },
        { expression: '\\lim_{b\\to\\infty}e^{-b}(b+1) = \\lim_{b\\to\\infty}\\frac{b+1}{e^b} = \\lim_{b\\to\\infty}\\frac{1}{e^b} = 0', annotation: 'L\'Hôpital: ∞/∞ form. Derivative of top: 1. Derivative of bottom: eᵇ.' },
        { expression: '\\int_0^\\infty xe^{-x}dx = 1-0 = 1', annotation: 'The integral converges to 1.' },
      ],
      answer: '1 \\text{ (this is } \\Gamma(2) = 1! = 1\\text{)}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Gabriel\'s Horn and other application problems often produce improper integrals.' },
    { lessonSlug: 'partial-fractions-integration', label: 'Partial Fractions', context: 'Partial fractions help evaluate improper integrals of rational functions exactly.' },
    { lessonSlug: 'u-substitution', label: 'U-Substitution', context: 'Many improper integrals are computed using u-sub after setting up the limit definition.' },
    { lessonSlug: 'numerical-integration', label: 'Numerical Integration', context: 'When improper integrals lack closed forms, numerical methods with convergence analysis are used.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  quiz: [
    {
      id: 'improper-q1',
      type: 'choice',
      text: 'Does \\(\\int_1^{\\infty} \\frac{1}{x^2}\\,dx\\) converge or diverge?',
      options: ['Converges', 'Diverges'],
      answer: 'Converges',
      hints: ['\\(p\\)-integral \\(\\int_1^\\infty x^{-p}\\,dx\\) converges when \\(p > 1\\). Here \\(p=2>1\\).'],
      reviewSection: 'Math — p-integral test',
    },
    {
      id: 'improper-q2',
      type: 'input',
      text: 'Evaluate \\(\\int_1^{\\infty} \\frac{1}{x^2}\\,dx = \\lim_{t\\to\\infty} \\int_1^t x^{-2}\\,dx\\).',
      answer: '1',
      hints: ['\\(\\int_1^t x^{-2}\\,dx = [-x^{-1}]_1^t = -1/t + 1\\).', 'As \\(t\\to\\infty\\): \\(0 + 1 = 1\\).'],
      reviewSection: 'Math — Evaluating a convergent improper integral',
    },
    {
      id: 'improper-q3',
      type: 'choice',
      text: 'Does \\(\\int_1^{\\infty} \\frac{1}{x}\\,dx\\) converge or diverge?',
      options: ['Converges', 'Diverges'],
      answer: 'Diverges',
      hints: ['\\(p=1\\) is the borderline case; the harmonic integral diverges.', '\\(\\int_1^t \\frac{1}{x}\\,dx = \\ln t \\to \\infty\\).'],
      reviewSection: 'Math — p-integral test (p=1)',
    },
    {
      id: 'improper-q4',
      type: 'input',
      text: 'Evaluate \\(\\int_0^{\\infty} e^{-x}\\,dx = \\lim_{t\\to\\infty} \\int_0^t e^{-x}\\,dx\\).',
      answer: '1',
      hints: ['\\(\\int_0^t e^{-x}\\,dx = [-e^{-x}]_0^t = -e^{-t}+1\\).', 'As \\(t\\to\\infty\\): \\(0+1=1\\).'],
      reviewSection: 'Math — Improper integral of exponential',
    },
    {
      id: 'improper-q5',
      type: 'choice',
      text: 'Does \\(\\int_1^{\\infty} \\frac{1}{x^{1/2}}\\,dx\\) converge or diverge?',
      options: ['Converges', 'Diverges'],
      answer: 'Diverges',
      hints: ['\\(p = 1/2 < 1\\), so the \\(p\\)-integral diverges.'],
      reviewSection: 'Math — p-integral test (p < 1)',
    },
    {
      id: 'improper-q6',
      type: 'input',
      text: 'Evaluate \\(\\int_1^{\\infty} \\frac{1}{x^3}\\,dx\\).',
      answer: '1/2',
      hints: ['\\(\\int_1^t x^{-3}\\,dx = [-x^{-2}/2]_1^t = -1/(2t^2)+1/2\\).', 'As \\(t\\to\\infty\\): \\(1/2\\).'],
      reviewSection: 'Math — Convergent p-integral evaluation',
    },
    {
      id: 'improper-q7',
      type: 'input',
      text: 'Evaluate the improper integral \\(\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx\\) (integrand blows up at \\(x=0\\)).',
      answer: '2',
      hints: ['\\(\\lim_{t\\to 0^+}\\int_t^1 x^{-1/2}\\,dx = \\lim_{t\\to 0^+}[2\\sqrt{x}]_t^1 = 2 - 0 = 2\\).'],
      reviewSection: 'Math — Improper integral at a lower bound discontinuity',
    },
    {
      id: 'improper-q8',
      type: 'choice',
      text: 'For the improper integral \\(\\int_0^1 \\frac{1}{x^p}\\,dx\\) (singularity at 0), the integral converges when:',
      options: ['\\(p > 1\\)', '\\(p < 1\\)', '\\(p = 1\\)', '\\(p \\geq 0\\)'],
      answer: '\\(p < 1\\)',
      hints: ['The convergence condition flips compared to \\(\\int_1^\\infty\\): near a singularity at 0, converges for \\(p < 1\\).'],
      reviewSection: 'Math — p-integral near 0',
    },
    {
      id: 'improper-q9',
      type: 'input',
      text: 'Evaluate \\(\\int_0^{\\infty} x\\,e^{-x^2}\\,dx\\) using \\(u = x^2\\).',
      answer: '1/2',
      hints: ['\\(u=x^2\\), \\(du=2x\\,dx\\): integral = \\(\\int_0^\\infty \\frac{1}{2}e^{-u}\\,du = \\frac{1}{2}\\).'],
      reviewSection: 'Math — Improper integral with u-substitution',
    },
    {
      id: 'improper-q10',
      type: 'choice',
      text: 'The definition of \\(\\int_a^{\\infty} f(x)\\,dx\\) is:',
      options: [
        '\\(f(\\infty) - f(a)\\)',
        '\\(\\lim_{t\\to\\infty} \\int_a^t f(x)\\,dx\\)',
        '\\(\\int_a^M f(x)\\,dx\\) for some large \\(M\\)',
        '\\(F(\\infty) - F(a)\\) where \\(F\' = f\\)',
      ],
      answer: '\\(\\lim_{t\\to\\infty} \\int_a^t f(x)\\,dx\\)',
      hints: ['Improper integrals are defined as limits of proper integrals.'],
      reviewSection: 'Math — Definition of improper integral',
    },
  ],
}
