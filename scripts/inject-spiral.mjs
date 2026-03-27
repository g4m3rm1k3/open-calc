// inject-spiral.mjs
// Injects spiral, assessment, semantics, and mentalModel into every lesson
// that does not already have them. Safe to re-run — skips already-updated files.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '../src/content');

// ─── Per-lesson payload map ────────────────────────────────────────────────
// Key: the lesson's `slug` field value
// Value: { semantics, spiral, assessment, mentalModel }
const PAYLOADS = {

  // ── CHAPTER 1: LIMITS ─────────────────────────────────────────────────────

  'limit-laws': {
    semantics: {
      core: [
        { symbol: 'lim[fg]', meaning: 'the limit of a product equals the product of the limits (when both exist)' },
        { symbol: 'sin(x)/x', meaning: 'the fundamental trig limit — approaches 1 as x→0, not 0/0' },
        { symbol: 'Squeeze Theorem', meaning: 'if g≤f≤h and g,h both approach L, then f is forced to L as well' },
      ],
      rulesOfThumb: [
        'Direct substitution works if the denominator is nonzero and the function is continuous at the point.',
        'When you see sin(ax)/bx, multiply and divide by a to force the pattern sin(u)/u.',
        'A composite limit can pass through a continuous outer function: lim f(g(x)) = f(lim g(x)).',
        'The Squeeze Theorem is the go-to tool whenever a bounded function is multiplied by something → 0.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-intro-limits', label: 'Previous: Introduction to Limits', note: 'The informal ε-δ notion you met there is what the Limit Laws formalize. Each law is a proof that the informal \'approach\' behavior is preserved under arithmetic operations.' },
        { lessonId: 'ch0-inequalities', label: 'Ch. 0: Inequalities and the Triangle Inequality', note: 'The proof of the Sum Law uses |a+b| ≤ |a|+|b|. If that feels unfamiliar, revisit the inequalities lesson before reading the rigor section here.' },
      ],
      futureLinks: [
        { lessonId: 'ch1-continuity', label: 'Next: Continuity', note: 'A function is continuous at c iff the Limit Laws guarantee lim f(x) = f(c). Every continuous-function limit in Chapters 2–4 is justified by what you learn here.' },
        { lessonId: 'ch2-trig-derivatives', label: 'Ch. 2: Trig Derivatives', note: 'The derivative of sin(x) requires lim(h→0) sin(h)/h = 1. That IS the fundamental trig limit from this lesson — you will use it directly in the derivation of d/dx[sin x] = cos x.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'll-assess-1', type: 'input', text: 'Evaluate lim(x→0) sin(3x) / x.', answer: '3', hint: 'Factor: sin(3x)/x = 3·[sin(3x)/(3x)]. Let u=3x; as x→0, u→0 and sin(u)/u→1.' },
        { id: 'll-assess-2', type: 'input', text: 'Evaluate lim(x→0) x²·sin(1/x).', answer: '0', hint: 'Since |sin(1/x)| ≤ 1, we have -x² ≤ x²sin(1/x) ≤ x². Both bounds → 0. Squeeze Theorem.' },
        { id: 'll-assess-3', type: 'choice', text: 'Which technique evaluates lim(x→2) (3x²-x+1)/(x+5)?', options: ['Factor and cancel', 'Direct substitution (denominator is 7≠0)', 'Squeeze Theorem', 'Conjugate multiplication'], answer: 'Direct substitution (denominator is 7≠0)', hint: 'Check the denominator first: x+5 at x=2 is 7. Nonzero means direct substitution is valid.' },
        { id: 'll-assess-4', type: 'input', text: 'What does lim(x→0) tan(x)/x equal?', answer: '1', hint: 'tan x = sin x / cos x. Write as [sin x / x] · [1 / cos x]. First factor → 1, second → 1/cos(0) = 1.' },
      ]
    },
    mentalModel: [
      'Limit Laws = arithmetic operations distribute through limits',
      'sin(x)/x → 1 as x→0 (not 0/0 — this is a provable result)',
      'Squeeze Theorem = bound a wild function between two tame ones',
      'Direct substitution = valid iff denominator nonzero and function continuous',
    ]
  },

  'continuity': {
    semantics: {
      core: [
        { symbol: 'f continuous at c', meaning: 'three conditions: f(c) defined, lim exists, and they are equal' },
        { symbol: 'removable discontinuity', meaning: 'the limit exists but f(c) is wrong or missing — fixable by redefining one point' },
        { symbol: 'jump discontinuity', meaning: 'left and right limits both exist but differ — a true break, not fixable by redefining a point' },
        { symbol: 'IVT', meaning: 'if f is continuous on [a,b] and k is between f(a) and f(b), then f hits k somewhere inside' },
      ],
      rulesOfThumb: [
        'Check the three-part checklist in order: (1) defined? (2) limit exists? (3) match?',
        'Polynomials, trig, exponential, log — continuous everywhere on their domains.',
        'Piecewise functions: check continuity at every breakpoint by matching left and right limits.',
        'IVT proves existence of a root when f changes sign on a continuous interval.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-limit-laws', label: 'Previous: Limit Laws', note: 'Continuity is defined using limits. The limit must exist AND match f(c). The Limit Laws tell you when you can compute that limit by direct substitution — which is exactly when the function is continuous.' },
        { lessonId: 'ch1-intro-limits', label: 'Ch. 1: Introduction to Limits', note: 'You learned that the limit cares about the journey (approaching c) not the destination (f(c)). Continuity is the special case where the journey and the destination agree.' },
      ],
      futureLinks: [
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: Differentiability', note: 'Differentiability implies continuity (proven there). Continuity is necessary but not sufficient for differentiability — the function |x| is continuous at 0 but not differentiable.' },
        { lessonId: 'ch3-mean-value-theorem', label: 'Ch. 3: Mean Value Theorem', note: 'The MVT and its corollaries require continuity on [a,b]. Without continuity, the conclusions fail. The IVT you prove here is a precursor to the same style of argument.' },
        { lessonId: 'ch4-fundamental-theorem', label: 'Ch. 4: Fundamental Theorem of Calculus', note: 'FTC Part 2 requires f to be continuous on [a,b]. Discontinuities inside the interval invalidate the evaluation formula — a critical error to avoid.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'cont-assess-1', type: 'choice', text: 'f(c) = 5 but lim(x→c) f(x) = 3. This is a:', options: ['Removable discontinuity', 'Jump discontinuity', 'Infinite discontinuity', 'No discontinuity — it is continuous'], answer: 'Removable discontinuity', hint: 'The limit exists (3) but does not match f(c) = 5. Fixable by redefining f(c) = 3.' },
        { id: 'cont-assess-2', type: 'input', text: 'For f(x) = (x²-4)/(x-2), what value should f(2) be set to for f to be continuous at x=2?', answer: '4', hint: 'Factor: x²-4=(x+2)(x-2). Cancel (x-2) to get x+2. At x=2 that is 4.' },
        { id: 'cont-assess-3', type: 'choice', text: 'Which theorem guarantees that x⁵ - x - 1 = 0 has a real root?', options: ['Mean Value Theorem', 'Intermediate Value Theorem', 'Squeeze Theorem', 'Extreme Value Theorem'], answer: 'Intermediate Value Theorem', hint: 'f(1) = -1 < 0 and f(2) = 29 > 0. f is continuous (polynomial). By IVT, f = 0 somewhere in (1,2).' },
      ]
    },
    mentalModel: [
      'Continuity = limit equals function value (3 conditions)',
      'Removable = limit exists, value wrong (patchable)',
      'Jump = both sides exist but differ (not patchable)',
      'IVT = sign change on continuous function → root inside',
    ]
  },

  'epsilon-delta': {
    semantics: {
      core: [
        { symbol: 'ε (epsilon)', meaning: 'the output tolerance — how close f(x) must stay to L' },
        { symbol: 'δ (delta)', meaning: 'the input radius you choose — if x stays within δ of c, then f(x) stays within ε of L' },
        { symbol: '0 < |x-c| < δ', meaning: 'x is close to c but not equal to c (strict inequality)' },
        { symbol: '|f(x) - L| < ε', meaning: 'the output f(x) is within ε of L' },
      ],
      rulesOfThumb: [
        'The ε-δ game: your opponent picks ε (any positive number). You must respond with a δ that works.',
        'For polynomials: start by factoring |f(x)-L|. Bound the extra factor near c, then choose δ = min(1, ε/bound).',
        'The phrase "for all ε>0 there exists δ>0" is the formal structure of every limit proof.',
        'Direct substitution is the informal version of ε-δ for continuous functions.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-intro-limits', label: 'Ch. 1: Introduction to Limits (informal)', note: 'You met the intuition: the limit is what f(x) approaches. ε-δ is the same idea made mathematically rigorous. Epsilon is the output tolerance; delta is the input radius that guarantees it.' },
        { lessonId: 'ch0-inequalities', label: 'Ch. 0: Inequalities', note: 'The triangle inequality |a+b| ≤ |a|+|b| appears in every ε-δ proof. Reviewing it now will make the proofs flow naturally.' },
      ],
      futureLinks: [
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: Derivative Definition', note: 'The derivative is defined as a limit. The ε-δ definition ensures that limit is unambiguously defined. If you ever need to rigorously prove a derivative, ε-δ is the foundation.' },
        { lessonId: 'ch1-continuity', label: 'Ch. 1: Continuity', note: 'The ε-δ definition of continuity is: for every ε>0 there exists δ>0 such that |x-c|<δ implies |f(x)-f(c)|<ε. This is the same structure, applied directly at c (not just near c).' },
      ]
    },
    assessment: {
      questions: [
        { id: 'ed-assess-1', type: 'choice', text: 'In the ε-δ definition, who chooses ε first?', options: ['You (the prover)', 'Your opponent (the challenger)', 'Both simultaneously', 'Neither — it is given by the problem'], answer: 'Your opponent (the challenger)', hint: 'The definition says "for ALL ε > 0" — meaning ε is arbitrary, chosen by a challenger. You must respond with a δ that works for that ε.' },
        { id: 'ed-assess-2', type: 'input', text: 'To prove lim(x→2) x² = 4 via ε-δ, we need δ = min(1, ε/?). What is the missing number?', answer: '5', hint: 'Near x=2, |x+2| < 5 when δ ≤ 1. So |x²-4| = |x-2||x+2| < δ·5. Set δ = min(1, ε/5).' },
      ]
    },
    mentalModel: [
      'ε = output tolerance (any positive, chosen adversarially)',
      'δ = input radius (you choose this in response to ε)',
      'Proof structure: Given ε>0, let δ = …, then |x-c|<δ ⟹ |f(x)-L|<ε',
      'Every limit you know informally has an ε-δ proof behind it',
    ]
  },

  'squeeze-theorem': {
    semantics: {
      core: [
        { symbol: 'g(x) ≤ f(x) ≤ h(x)', meaning: 'f is bounded between g and h near the point of interest' },
        { symbol: 'lim g = lim h = L', meaning: 'the two bounding functions both converge to the same value L' },
      ],
      rulesOfThumb: [
        'Trigger: you see |sin|, |cos|, or any bounded oscillating function multiplied by something going to 0.',
        'Write the bound: -1 ≤ sin(anything) ≤ 1. Multiply by the expression going to 0. Squeeze.',
        'Both bounding functions must approach the SAME limit for the Squeeze Theorem to conclude anything.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-limit-laws', label: 'Previous: Limit Laws', note: 'The Squeeze Theorem was introduced alongside the Limit Laws. This lesson deepens that tool with more examples and the geometric proof of sin(x)/x.' },
      ],
      futureLinks: [
        { lessonId: 'ch2-trig-derivatives', label: 'Ch. 2: Trig Derivatives', note: 'The derivative of sin(x) cannot be computed without the Squeeze Theorem proof that sin(x)/x → 1. You will use this result directly.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'sq-assess-1', type: 'input', text: 'Evaluate lim(x→0) x²·cos(1/x).', answer: '0', hint: 'Bound: -x² ≤ x²cos(1/x) ≤ x². Both bounds approach 0. Squeeze Theorem says the middle does too.' },
        { id: 'sq-assess-2', type: 'input', text: 'What is lim(x→0) sin(x)/x?', answer: '1', hint: 'This is the fundamental trig limit proved via the Squeeze Theorem and unit circle geometry.' },
      ]
    },
    mentalModel: [
      'Squeeze = pin a wild function between two tame ones with the same limit',
      'Trigger cue: bounded oscillation × vanishing factor',
      'sin(x)/x → 1 as x→0 (proved by squeezing)',
    ]
  },

  'limits-at-infinity': {
    semantics: {
      core: [
        { symbol: 'lim(x→∞) f(x) = L', meaning: 'as x grows without bound, f(x) gets arbitrarily close to L — L is a horizontal asymptote' },
        { symbol: 'leading term', meaning: 'the highest-degree term in a polynomial — it dominates all others for large x' },
        { symbol: 'horizontal asymptote', meaning: 'the line y = L that the function approaches as x → ±∞' },
      ],
      rulesOfThumb: [
        'For rational functions: compare degrees. Same degree → ratio of leading coefficients. Numerator higher → ±∞. Denominator higher → 0.',
        'Divide numerator and denominator by the highest power of x in the denominator.',
        '1/xⁿ → 0 as x→∞ for any n > 0. This is the anchor for all limit-at-infinity computations.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-intro-limits', label: 'Ch. 1: Introduction to Limits', note: 'Limits at infinity follow the same logic as finite limits — the function is approaching a value — but the "approach" is along the x-axis toward ±∞ rather than toward a finite point.' },
      ],
      futureLinks: [
        { lessonId: 'ch3-lhopital', label: 'Ch. 3: L\'Hôpital\'s Rule', note: '∞/∞ is an indeterminate form handled by L\'Hôpital. Many limits at infinity reduce to this form and require that rule.' },
        { lessonId: 'ch3-curve-sketching', label: 'Ch. 3: Curve Sketching', note: 'Horizontal asymptotes are one of the key features to determine when sketching a curve. Limits at infinity give you the end-behavior of the graph directly.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'linf-assess-1', type: 'input', text: 'lim(x→∞) (3x²+5) / (x²-2). What is the answer?', answer: '3', hint: 'Same degree top and bottom. Divide both by x²: (3 + 5/x²)/(1 - 2/x²). As x→∞, those fractions → 0. Left with 3/1 = 3.' },
        { id: 'linf-assess-2', type: 'choice', text: 'lim(x→∞) (x³+1)/(x²+x). The answer is:', options: ['1', '0', '+∞', '-∞'], answer: '+∞', hint: 'Numerator degree (3) > denominator degree (2). The rational function grows without bound.' },
      ]
    },
    mentalModel: [
      'Large x → 1/xⁿ → 0 (this is the anchor)',
      'Rational: compare leading degrees (same, higher top, higher bottom)',
      'Horizontal asymptote y=L ⟺ lim(x→±∞) f(x) = L',
    ]
  },

  // ── CHAPTER 2: DERIVATIVES ────────────────────────────────────────────────

  'differentiation-rules': {
    semantics: {
      core: [
        { symbol: 'Power Rule', meaning: 'd/dx[xⁿ] = nxⁿ⁻¹ (the exponent comes down, decrements by 1)' },
        { symbol: 'Product Rule', meaning: 'd/dx[fg] = f\'g + fg\' (mnemonic: "first times derivative of second plus second times derivative of first")' },
        { symbol: 'Quotient Rule', meaning: 'd/dx[f/g] = (f\'g - fg\') / g² (mnemonic: "low d-high minus high d-low, over low squared")' },
      ],
      rulesOfThumb: [
        'Check if a product/quotient can be simplified algebraically BEFORE differentiating. Often easier.',
        'Quotient rule denominator is g², not g. Forgetting the square is the most common error.',
        'Sum/difference rule: differentiate term by term. Constants vanish.',
        'Every differentiation rule can be proved from the limit definition — but you rarely need to.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-tangent-problem', label: 'Previous: Derivative from the Limit Definition', note: 'The power rule d/dx[xⁿ]=nxⁿ⁻¹ was previewed by computing xⁿ derivatives from the definition. This lesson gives you the shortcut so you never have to use the limit definition again for these forms.' },
      ],
      futureLinks: [
        { lessonId: 'ch2-chain-rule', label: 'Next: Chain Rule', note: 'The chain rule extends differentiation rules to compositions. Without it, you cannot differentiate sin(x²) or e^(3x). Every composite function requires the chain rule layered on top of the rules here.' },
        { lessonId: 'ch3-related-rates', label: 'Ch. 3: Related Rates', note: 'Related rates uses these rules in implicit differentiation with t as the independent variable. Mastering them here makes Ch. 3 far more mechanical.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'dr-assess-1', type: 'input', text: 'd/dx[x⁵] = ?', answer: '5x^4', hint: 'Power rule: bring the 5 down, reduce the exponent by 1.' },
        { id: 'dr-assess-2', type: 'input', text: 'd/dx[x·sin(x)] = ?', answer: 'sin(x) + x·cos(x)', hint: 'Product rule: (1)·sin(x) + x·cos(x).' },
        { id: 'dr-assess-3', type: 'input', text: 'd/dx[x²/cos(x)] = ?', answer: '(2x·cos(x) + x²·sin(x)) / cos²(x)', hint: 'Quotient rule: (low·d-high - high·d-low) / low². = (cos(x)·2x - x²·(-sin(x))) / cos²(x).' },
      ]
    },
    mentalModel: [
      'Power: nxⁿ⁻¹',
      'Product: f\'g + fg\'',
      'Quotient: (f\'g - fg\') / g²',
      'Sum: differentiate term by term; constants vanish',
    ]
  },

  'chain-rule': {
    semantics: {
      core: [
        { symbol: 'f(g(x))', meaning: 'a composition — g is the inner function, f is the outer function' },
        { symbol: 'dy/dx = (dy/du)(du/dx)', meaning: 'Leibniz form of the chain rule: the rates multiply' },
        { symbol: 'outer × inner\'', meaning: 'evaluate the outer derivative at the inner function, then multiply by the inner\'s derivative' },
      ],
      rulesOfThumb: [
        'Identify the innermost function first. Differentiate from outside in.',
        'Never forget to multiply by the inner derivative (du/dx). Forgetting it is the chain rule error.',
        'If you see a function raised to a power: d/dx[f(x)ⁿ] = n·f(x)ⁿ⁻¹·f\'(x).',
        'Multiple compositions: peel layers from outside in, multiplying a new derivative at each layer.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-differentiation-rules', label: 'Previous: Differentiation Rules', note: 'The power, product and quotient rules handle non-composed functions. The chain rule is the single missing piece that handles everything else — any composition, any nesting.' },
      ],
      futureLinks: [
        { lessonId: 'ch2-implicit-differentiation', label: 'Next: Implicit Differentiation', note: 'Implicit differentiation is the chain rule applied to y as a function of x. Every d/dx[y²] term in an implicit equation generates a 2y·(dy/dx) factor — that IS the chain rule.' },
        { lessonId: 'ch3-related-rates', label: 'Ch. 3: Related Rates', note: 'Related rates is implicit differentiation in t. The chain rule factor becomes (dx/dt), (dy/dt), etc. Every related-rates rate equation is a chain rule application.' },
        { lessonId: 'ch4-u-substitution', label: 'Ch. 4: U-Substitution', note: 'U-substitution is the chain rule run in reverse for integration. Recognizing the "inner derivative" factor in the integrand is the key skill — and it comes from deeply understanding the chain rule.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'cr-assess-1', type: 'input', text: 'd/dx[sin(x²)] = ?', answer: 'cos(x²)·2x', hint: 'Outer: sin → cos, evaluated at inner x². Inner: x² → 2x. Multiply.' },
        { id: 'cr-assess-2', type: 'input', text: 'd/dx[(3x+1)⁵] = ?', answer: '5(3x+1)^4 · 3', hint: 'Outer: power rule → 5(3x+1)⁴. Inner: 3x+1 → 3. Multiply: 15(3x+1)⁴.' },
        { id: 'cr-assess-3', type: 'input', text: 'd/dx[e^(cos x)] = ?', answer: 'e^(cos x)·(-sin x)', hint: 'Outer: eᵘ → eᵘ at u=cos x. Inner: cos x → -sin x. Multiply.' },
      ]
    },
    mentalModel: [
      'Chain Rule = outer\'(inner) × inner\'',
      'Leibniz: dy/dx = (dy/du)(du/dx)',
      'Peel layers outside→in, multiply a derivative at each layer',
      'Forgetting the inner derivative is the #1 chain rule error',
    ]
  },

  'implicit-differentiation': {
    semantics: {
      core: [
        { symbol: 'd/dx[y]', meaning: 'dy/dx — the derivative of y with respect to x, generated by the chain rule since y depends on x' },
        { symbol: 'd/dx[y²]', meaning: '2y·(dy/dx) — chain rule: outer derivative 2y, inner derivative dy/dx' },
        { symbol: 'implicit equation', meaning: 'an equation relating x and y that is not solved for y explicitly — y is implicit in x' },
      ],
      rulesOfThumb: [
        'Differentiate both sides of the equation with respect to x.',
        'Every y term gets a dy/dx factor (chain rule). Every x term differentiates normally.',
        'Collect all dy/dx terms on one side, factor out dy/dx, then divide.',
        'The result dy/dx will usually contain both x and y — that is normal and correct.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-chain-rule', label: 'Previous: Chain Rule', note: 'Implicit differentiation IS the chain rule applied to y as a function of x. When you write d/dx[y²] = 2y·dy/dx, that is just the chain rule with u=y(x). Without the chain rule, implicit differentiation is impossible.' },
      ],
      futureLinks: [
        { lessonId: 'ch3-related-rates', label: 'Ch. 3: Related Rates', note: 'Related rates is implicit differentiation with time t as the independent variable instead of x. The technique — differentiate both sides, collect rates — is identical. You just replace dy/dx with dy/dt.' },
        { lessonId: 'ch2-inverse-derivatives', label: 'Derivatives of Inverse Functions', note: 'The derivative of arcsin, arctan, etc. are derived using implicit differentiation on the identity sin(arcsin x) = x.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'id-assess-1', type: 'input', text: 'For x² + y² = 25, find dy/dx.', answer: '-x/y', hint: 'Differentiate: 2x + 2y(dy/dx) = 0. Solve: dy/dx = -x/y.' },
        { id: 'id-assess-2', type: 'input', text: 'For sin(xy) = x, find dy/dx at the point (1, π/2).', answer: '(1 - π/2·cos(π/2)) / cos(π/2)... simplify via product rule on xy', hint: 'Differentiate both sides: cos(xy)·(y + x·dy/dx) = 1. Solve for dy/dx.' },
      ]
    },
    mentalModel: [
      'd/dx[y] = dy/dx (chain rule)',
      'd/dx[y²] = 2y·dy/dx',
      'Algorithm: differentiate both sides → collect dy/dx → factor → divide',
      'Result typically contains both x and y — that is expected',
    ]
  },

  // ── CHAPTER 3: APPLICATIONS ───────────────────────────────────────────────

  'related-rates': {
    semantics: {
      core: [
        { symbol: 'dx/dt', meaning: 'rate of change of x with respect to time — how fast x is changing right now' },
        { symbol: 'd/dt[x²]', meaning: '2x·(dx/dt), NOT just 2x — the chain rule factor dx/dt is mandatory' },
        { symbol: 'geometric constraint', meaning: 'an equation that links the changing quantities — e.g., x²+y²=L² for a right triangle with fixed hypotenuse' },
      ],
      rulesOfThumb: [
        'NEVER substitute numbers before differentiating. Differentiate with variables, then substitute.',
        'Identify which quantities are constant (they disappear when differentiated) and which vary (they generate rate terms).',
        'The 5-step method: diagram → constraint equation → differentiate → substitute → solve.',
        'Draw the diagram. Most setup errors are geometry errors, not calculus errors.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-implicit-differentiation', label: 'Previous (Ch. 2): Implicit Differentiation', note: 'Related rates IS implicit differentiation with t (time) as the independent variable. Every d/dx[y] from implicit differentiation becomes d/dt[y] = dy/dt in related rates. The algebra is identical.' },
        { lessonId: 'ch2-chain-rule', label: 'Ch. 2: Chain Rule', note: 'The rate factor (e.g., dx/dt) in every term comes from the chain rule. Forgetting it is the most common related-rates error — identical to the chain rule error from Ch. 2.' },
      ],
      futureLinks: [
        { lessonId: 'ch3-optimization', label: 'Next: Optimization', note: 'Optimization also requires setting up geometric/physical constraint equations and using calculus to extract information. The modeling discipline is the same; the question is "max/min" instead of "rate."' },
      ]
    },
    assessment: {
      questions: [
        { id: 'rr-assess-1', type: 'choice', text: 'In related rates, d/dt[r²] equals:', options: ['2r', '2r·(dr/dt)', '2r + dr/dt', 'r²·(dr/dt)'], answer: '2r·(dr/dt)', hint: 'Chain rule: outer derivative 2r, multiplied by the inner derivative dr/dt.' },
        { id: 'rr-assess-2', type: 'choice', text: 'When should you substitute the specific numerical values into a related rates equation?', options: ['Before differentiating', 'After differentiating and collecting rates', 'At any point — order doesn\'t matter', 'Never'], answer: 'After differentiating and collecting rates', hint: 'Substituting before differentiating replaces variables with constants, destroying all rate information. Always differentiate first.' },
      ]
    },
    mentalModel: [
      'd/dt[f(x(t))] = f\'(x)·(dx/dt) (chain rule in t)',
      '5 steps: diagram → constraint → differentiate → substitute → solve',
      'Constant quantities vanish; variable quantities generate rate factors',
      'Substitute numbers AFTER differentiating — never before',
    ]
  },

  'linear-approximation': {
    semantics: {
      core: [
        { symbol: 'L(x) = f(a) + f\'(a)(x-a)', meaning: 'the linearization — the tangent line at x=a used as an approximation to f near a' },
        { symbol: 'Δy ≈ f\'(x)·Δx', meaning: 'the differential approximation: output change ≈ derivative × input change' },
        { symbol: 'error', meaning: 'the difference between the true value f(x) and the linear approximation L(x) — grows as (x-a)²' },
      ],
      rulesOfThumb: [
        'The approximation is most accurate when x is close to a. Quality degrades as |x-a| increases.',
        'Differentials df = f\'(x)dx are the infinitesimal version of the same idea.',
        'In physics and engineering, linear approximation is used constantly to simplify nonlinear equations.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch0-lines', label: 'Ch. 0: Lines', note: 'The linearization IS a line — specifically the tangent line from Ch. 0. The formula y - f(a) = f\'(a)(x-a) is the point-slope form of a line with slope f\'(a) through the point (a, f(a)).' },
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: The Derivative and Tangent Lines', note: 'You learned to find the tangent line equation in Ch. 2. The linearization is that same tangent line, now used as an approximating function.' },
      ],
      futureLinks: [
        { lessonId: 'ch5-taylor-maclaurin', label: 'Ch. 5: Taylor Series', note: 'The linearization is the degree-1 Taylor polynomial. Taylor series extend this idea to degree-n polynomial approximations, capturing higher-order curvature.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'la-assess-1', type: 'input', text: 'Find the linearization of f(x) = √x at a = 4.', answer: 'L(x) = 2 + (1/4)(x-4)', hint: 'f(4)=2, f\'(x)=1/(2√x), f\'(4)=1/4. L(x) = 2 + (1/4)(x-4).' },
        { id: 'la-assess-2', type: 'input', text: 'Use linear approximation to estimate √4.1.', answer: '2.025', hint: 'L(4.1) = 2 + (1/4)(4.1-4) = 2 + 0.025 = 2.025.' },
      ]
    },
    mentalModel: [
      'Linearization = tangent line used as an approximating function',
      'L(x) = f(a) + f\'(a)(x-a)',
      'df = f\'(x)dx (differential form)',
      'Error grows like (x-a)² — good near a, poor far away',
    ]
  },

  'mean-value-theorem': {
    semantics: {
      core: [
        { symbol: 'MVT conclusion', meaning: 'there exists c in (a,b) where f\'(c) = [f(b)-f(a)]/(b-a) — the instantaneous slope equals the average slope' },
        { symbol: 'average slope', meaning: '[f(b)-f(a)]/(b-a) — the slope of the secant line from a to b' },
        { symbol: 'hypotheses', meaning: 'f continuous on [a,b] AND differentiable on (a,b) — both required' },
      ],
      rulesOfThumb: [
        'The MVT is an existence theorem — it guarantees c exists but does not find it.',
        'Hypotheses matter: if f is not continuous OR not differentiable, the MVT may fail.',
        'Rolle\'s Theorem is the MVT with f(a) = f(b) — the secant is horizontal, so c has f\'(c)=0.',
        'The speed interpretation: if your average speed was 60 mph, your speedometer must have read exactly 60 at some moment.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch1-continuity', label: 'Ch. 1: Continuity', note: 'The MVT requires continuity on [a,b]. This is not just a technicality — without it the theorem genuinely fails. The piecewise velocity example from Ch. 1 is a discontinuous case where MVT does not apply.' },
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: The Derivative', note: 'The "average slope" [f(b)-f(a)]/(b-a) is the same difference quotient you met in the derivative definition. The MVT says an instantaneous slope must equal that average somewhere.' },
      ],
      futureLinks: [
        { lessonId: 'ch3-curve-sketching', label: 'Next: Curve Sketching', note: 'The MVT is used to prove: if f\'> 0 then f is increasing; if f\'< 0 then f is decreasing; if f\'= 0 everywhere then f is constant. These facts underlie the entire theory of curve sketching.' },
        { lessonId: 'ch4-fundamental-theorem', label: 'Ch. 4: Fundamental Theorem of Calculus', note: 'The FTC Part 2 proof uses the MVT corollary: if two functions have the same derivative, they differ by a constant. This is a direct consequence of the MVT.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'mvt-assess-1', type: 'input', text: 'For f(x) = x² on [1,3], find the value c guaranteed by the MVT.', answer: '2', hint: 'Average slope = (9-1)/(3-1) = 4. Set f\'(c) = 2c = 4, so c = 2.' },
        { id: 'mvt-assess-2', type: 'choice', text: 'The MVT requires:', options: ['Only differentiability on (a,b)', 'Only continuity on [a,b]', 'Continuity on [a,b] AND differentiability on (a,b)', 'Continuity and differentiability everywhere'], answer: 'Continuity on [a,b] AND differentiability on (a,b)', hint: 'Both are needed. Continuity on the closed interval, differentiability on the open interior.' },
      ]
    },
    mentalModel: [
      'MVT: ∃c in (a,b) where f\'(c) = average slope over [a,b]',
      'Requires: continuous on [a,b], differentiable on (a,b)',
      'Existence theorem — guarantees c, does not locate it',
      'Speed corollary: if average speed = 60, speedometer hit 60 at some moment',
    ]
  },

  'curve-sketching': {
    semantics: {
      core: [
        { symbol: 'critical point', meaning: 'x where f\'(x) = 0 or f\'(x) DNE — a candidate for local max/min' },
        { symbol: 'inflection point', meaning: 'x where concavity changes — f\'\'changes sign' },
        { symbol: 'f\' > 0', meaning: 'f is increasing on that interval' },
        { symbol: 'f\'\' > 0', meaning: 'f is concave up (bowl-shaped) on that interval' },
      ],
      rulesOfThumb: [
        'Algorithm: find domain, intercepts, symmetry, asymptotes, f\'(sign chart), critical pts, f\'\'(sign chart), inflection pts.',
        'f\' tells you slope (increasing/decreasing). f\'\' tells you curvature (concave up/down).',
        'A critical point with f\'\'> 0 is a local min; with f\'\'< 0 is a local max.',
        'Inflection points are where f\'\' changes sign — NOT just where f\'\' = 0.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch3-mean-value-theorem', label: 'Previous: Mean Value Theorem', note: 'The proofs that f\'>0 ⟹ f increasing and f\'=0 everywhere ⟹ f constant are direct applications of the MVT. Curve sketching uses those results constantly.' },
        { lessonId: 'ch2-differentiation-rules', label: 'Ch. 2: Differentiation Rules', note: 'Curve sketching demands that you compute f\' and f\'\' efficiently. Every differentiation rule from Ch. 2 is used here.' },
      ],
      futureLinks: [
        { lessonId: 'ch3-optimization', label: 'Next: Optimization', note: 'Optimization is curve sketching with a purpose — you find the global maximum or minimum of f on an interval. The same sign-chart and critical-point machinery applies.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'cs-assess-1', type: 'choice', text: 'If f\'(x) > 0 on (a,b), then on that interval f is:', options: ['Increasing', 'Decreasing', 'Concave up', 'Concave down'], answer: 'Increasing', hint: 'Positive derivative = positive slope = function going up.' },
        { id: 'cs-assess-2', type: 'choice', text: 'If f\'\'(c) = 0 and f\'\'changes sign at c, then c is:', options: ['A local maximum', 'A local minimum', 'An inflection point', 'A critical point'], answer: 'An inflection point', hint: 'Inflection points are where concavity changes direction. f\'\'=0 alone is not sufficient — the sign must change.' },
      ]
    },
    mentalModel: [
      'f\' sign chart → increasing/decreasing intervals',
      'f\'\' sign chart → concave up/down intervals',
      'f\'=0 → critical points (max/min candidates)',
      'f\'\' changes sign → inflection point (concavity flip)',
    ]
  },

  'optimization': {
    semantics: {
      core: [
        { symbol: 'objective function', meaning: 'the quantity you want to maximize or minimize — e.g., area, cost, time' },
        { symbol: 'constraint', meaning: 'the equation that limits your choices — e.g., fixed perimeter, fixed volume' },
        { symbol: 'critical number', meaning: 'where f\'= 0 inside the feasible domain — an interior max/min candidate' },
        { symbol: 'Extreme Value Theorem', meaning: 'guarantees a max and min exist when f is continuous on a closed interval' },
      ],
      rulesOfThumb: [
        '5 steps: understand the problem → draw → label variables → write objective + constraint → use constraint to reduce to one variable → differentiate and solve.',
        'Always verify your critical points are actually max/min using the second derivative test or endpoint comparison.',
        'Check endpoints! On a closed interval, the global max/min might be at an endpoint, not a critical point.',
        'If the domain is open or unbounded, use limits at the boundary to confirm the critical point is a global max/min.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch3-curve-sketching', label: 'Previous: Curve Sketching', note: 'Optimization uses exactly the same critical-point machinery as curve sketching. The difference is that you now have a real-world question attached to the mathematics.' },
        { lessonId: 'ch3-related-rates', label: 'Ch. 3: Related Rates', note: 'Both related rates and optimization require translating a geometric/physical situation into an equation. That modeling discipline — diagram, label, write constraint — is identical.' },
      ],
      futureLinks: [
        { lessonId: 'ch4-applications', label: 'Ch. 4: Applications of Integration', note: 'Some optimization problems involve integrals (e.g., minimizing arc length, maximizing enclosed area). The same modeling approach applies, but the objective function requires integration.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'opt-assess-1', type: 'choice', text: 'After finding f\'(c) = 0, how do you confirm c is a local maximum?', options: ['f(c) > 0', 'f\'\'(c) < 0', 'f\'\'(c) > 0', 'f\'(c) > 0 to the left'], answer: 'f\'\'(c) < 0', hint: 'Second derivative test: f\'\'< 0 → concave down → local max. f\'\'> 0 → concave up → local min.' },
        { id: 'opt-assess-2', type: 'choice', text: 'On a closed interval [a,b], where can the global maximum occur?', options: ['Only at critical points', 'Only at endpoints', 'At critical points OR endpoints', 'Only where f\'\' = 0'], answer: 'At critical points OR endpoints', hint: 'The Closed Interval Method: evaluate f at all critical points AND endpoints. The largest value is the global max.' },
      ]
    },
    mentalModel: [
      'Set up: objective function + constraint → one variable',
      'Solve: differentiate → set to zero → solve for critical point',
      'Verify: second derivative test or endpoint comparison',
      'Check endpoints always on a closed interval',
    ]
  },

  // ── CHAPTER 4: INTEGRATION ────────────────────────────────────────────────

  'area-accumulation': {
    semantics: {
      core: [
        { symbol: 'area under a curve', meaning: 'the region between the function graph and the x-axis — counted positively above, negatively below' },
        { symbol: 'accumulation', meaning: 'the running total of the area as the upper limit x increases' },
        { symbol: 'signed area', meaning: 'area above x-axis is positive; area below is negative — the two can cancel' },
      ],
      rulesOfThumb: [
        'Think physically: if f(t) is rate of flow (gallons/min), the area under f from 0 to T is total gallons accumulated.',
        'The accumulation function A(x) = ∫₀ˣ f(t) dt is a new function of x — its derivative is f(x) (this is the FTC!).',
        'Negative regions do not mean the area calculation is wrong — they represent net change, not total change.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: The Derivative', note: 'The derivative asks: how fast is f changing at x? The integral asks: how much of f has accumulated from a to x? These are inverse questions — and the FTC makes that inversion precise.' },
      ],
      futureLinks: [
        { lessonId: 'ch4-riemann-sums', label: 'Next: Riemann Sums', note: 'Area accumulation is formalized through Riemann sums — approximating curved areas with rectangles. The limit of those sums defines the definite integral.' },
        { lessonId: 'ch4-fundamental-theorem', label: 'Ch. 4: Fundamental Theorem', note: 'FTC Part 1 says: d/dx[A(x)] = f(x). The derivative of the accumulation function is f itself. This lesson introduces that idea intuitively before the formal proof.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'aa-assess-1', type: 'choice', text: 'If f(t) is the rate of fuel consumption in gallons/hour, what does ∫₀³ f(t) dt represent?', options: ['The fuel consumption rate at t=3', 'Total gallons consumed from hour 0 to hour 3', 'Average consumption rate', 'Instantaneous rate at some moment'], answer: 'Total gallons consumed from hour 0 to hour 3', hint: 'Integrating a rate gives accumulated quantity. Area under a rate curve = total amount.' },
      ]
    },
    mentalModel: [
      'Integral = accumulated area (signed: positive above, negative below)',
      'Rate × time = amount (integral generalizes this)',
      'A(x) = ∫₀ˣ f(t) dt is a new function; its derivative is f(x)',
    ]
  },

  'fundamental-theorem': {
    semantics: {
      core: [
        { symbol: 'FTC Part 1', meaning: 'd/dx[∫ₐˣ f(t) dt] = f(x) — differentiation undoes integration' },
        { symbol: 'FTC Part 2', meaning: '∫ₐᵇ f(x) dx = F(b) - F(a) where F\'= f — evaluate via antiderivative' },
        { symbol: '[F(x)]ₐᵇ', meaning: 'shorthand for F(b) - F(a)' },
        { symbol: 'antiderivative', meaning: 'a function F such that F\' = f (also written ∫f dx = F + C)' },
      ],
      rulesOfThumb: [
        'FTC Part 1: the derivative of an integral with variable upper limit = the integrand at that limit.',
        'FTC Part 2: to integrate f, find any antiderivative F and subtract F(a) from F(b).',
        'Chain rule + FTC Part 1: d/dx[∫ₐ^g(x) f] = f(g(x))·g\'(x).',
        'Check for discontinuities inside [a,b] before applying FTC Part 2 — they invalidate it.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch4-area-accumulation', label: 'Previous: Area and Accumulation', note: 'FTC Part 1 is the formal theorem behind the intuition from that lesson: the derivative of the accumulation function is the original function. The height of the bar = the rate of growth of the area.' },
        { lessonId: 'ch2-tangent-problem', label: 'Ch. 2: The Derivative', note: 'The FTC says differentiation and integration are inverse operations. You spent all of Ch. 2 learning differentiation. The FTC is the theorem that connects it to Ch. 4. Read it as: integration undoes differentiation (up to a constant).' },
        { lessonId: 'ch3-mean-value-theorem', label: 'Ch. 3: Mean Value Theorem', note: 'The proof of FTC Part 2 uses the MVT corollary: a function with zero derivative is constant. This is the key logical step linking Part 1 to Part 2.' },
      ],
      futureLinks: [
        { lessonId: 'ch4-u-substitution', label: 'Next: U-Substitution', note: 'U-substitution is the FTC in reverse for composite functions. Recognizing which part of the integrand is the "inner derivative" (chain rule factor) is the core skill.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'ftc-assess-1', type: 'input', text: 'd/dx[∫₀ˣ sin(t²) dt] = ?', answer: 'sin(x²)', hint: 'FTC Part 1: derivative of accumulation function = integrand at upper limit. sin(x²).' },
        { id: 'ftc-assess-2', type: 'input', text: 'd/dx[∫₀^(x³) eᵗ dt] = ?', answer: 'e^(x³)·3x²', hint: 'FTC Part 1 + chain rule: f(g(x))·g\'(x) = e^(x³)·3x².' },
        { id: 'ftc-assess-3', type: 'input', text: '∫₀³ (2x+1) dx = ? Use FTC Part 2.', answer: '12', hint: 'Antiderivative F = x²+x. F(3)-F(0) = (9+3)-(0) = 12.' },
      ]
    },
    mentalModel: [
      'FTC = differentiation and integration are inverse operations',
      'Part 1: d/dx[∫ₐˣ f dt] = f(x)',
      'Part 2: ∫ₐᵇ f = F(b) - F(a) (antiderivative shortcut)',
      'Chain rule version: d/dx[∫ₐ^g(x) f dt] = f(g(x))·g\'(x)',
    ]
  },

  'u-substitution': {
    semantics: {
      core: [
        { symbol: 'u', meaning: 'the inner function — the substitution variable that simplifies the integrand' },
        { symbol: 'du', meaning: 'u\'(x) dx — the differential of u, which must appear (up to a constant) in the integrand' },
        { symbol: 'reverse chain rule', meaning: 'u-substitution undoes the chain rule: ∫f(g(x))g\'(x) dx = ∫f(u) du' },
      ],
      rulesOfThumb: [
        'Look for a factor in the integrand that is the derivative of another factor. That\'s your u.',
        'If the factor is off by a constant, multiply and divide by that constant to fix it.',
        'Change the limits of integration when doing definite integrals with u-substitution.',
        'After substituting, the integral should contain only u — if x remains, the substitution is wrong.',
      ]
    },
    spiral: {
      recoveryPoints: [
        { lessonId: 'ch2-chain-rule', label: 'Ch. 2: Chain Rule', note: 'U-substitution is the chain rule run backwards for integration. If d/dx[F(g(x))] = F\'(g(x))·g\'(x) (chain rule), then ∫F\'(g(x))g\'(x) dx = F(g(x))+C (u-substitution). Recognizing g\'(x) = du/dx as a factor is the key skill from Ch. 2.' },
        { lessonId: 'ch4-fundamental-theorem', label: 'Previous: Fundamental Theorem of Calculus', note: 'FTC guarantees that every continuous function has an antiderivative. U-substitution is a systematic technique to find those antiderivatives for composite integrands.' },
      ],
      futureLinks: [
        { lessonId: 'ch4-trig-substitution', label: 'Ch. 4: Trig Substitution', note: 'Trig substitution is a more advanced form of substitution where you substitute x = sin(θ) or x = tan(θ) to simplify expressions with √(a²-x²). The same logic applies — choose u to simplify.' },
      ]
    },
    assessment: {
      questions: [
        { id: 'us-assess-1', type: 'input', text: '∫ 2x·cos(x²) dx = ?', answer: 'sin(x²) + C', hint: 'Let u = x². Then du = 2x dx. Integral becomes ∫cos(u) du = sin(u) + C = sin(x²) + C.' },
        { id: 'us-assess-2', type: 'input', text: '∫₀¹ 3x²·e^(x³) dx = ?', answer: 'e - 1', hint: 'Let u = x³, du = 3x² dx. When x=0, u=0; when x=1, u=1. Integral = ∫₀¹ eᵘ du = e¹-e⁰ = e-1.' },
      ]
    },
    mentalModel: [
      'U-sub = chain rule in reverse',
      'Identify u (inner fn), compute du, rewrite entirely in u',
      'Trigger: factor in integrand looks like derivative of another factor',
      'Definite integrals: change the bounds when you change variables',
    ]
  },

};

// ─── Template injector ─────────────────────────────────────────────────────
function buildInjection(payload) {
  const { semantics, spiral, assessment, mentalModel } = payload;
  return `
  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: ${JSON.stringify(semantics, null, 4)},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: ${JSON.stringify(spiral, null, 4)},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: ${JSON.stringify(assessment, null, 4)},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: ${JSON.stringify(mentalModel, null, 4)},

`;
}

// ─── File walker ───────────────────────────────────────────────────────────
function processDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'index.js');
  let updated = 0;
  let skipped = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let src = fs.readFileSync(fullPath, 'utf8');

    // Skip already-injected files
    if (src.includes('spiral:') && src.includes('assessment:') && src.includes('mentalModel:')) {
      console.log(`  ✓ already injected: ${file}`);
      skipped++;
      continue;
    }

    // Find the slug
    const slugMatch = src.match(/slug:\s*['"]([^'"]+)['"]/);
    if (!slugMatch) { console.log(`  ⚠ no slug: ${file}`); continue; }
    const slug = slugMatch[1];

    const payload = PAYLOADS[slug];
    if (!payload) { console.log(`  ⚠ no payload for slug '${slug}': ${file}`); continue; }

    // Check it doesn't already have any of the blocks
    const hasSpiral = src.includes('spiral:');
    const hasAssessment = src.includes('assessment:');
    const hasMentalModel = src.includes('mentalModel:');
    if (hasSpiral || hasAssessment || hasMentalModel) {
      console.log(`  ⚠ partially injected, skipping: ${file}`);
      skipped++;
      continue;
    }

    // Find the checkpoints or the closing }; and insert before it
    const injection = buildInjection(payload);
    // Insert before the last `checkpoints:` line if it exists, otherwise before closing `};`
    if (src.includes('  checkpoints:')) {
      src = src.replace(/^(\s{2}checkpoints:)/m, injection + '  checkpoints:');
    } else if (src.includes('  crossRefs:')) {
      src = src.replace(/^(\s{2}crossRefs:)/m, injection + '  crossRefs:');
    } else {
      // Before closing }; or }
      src = src.replace(/^(};\s*$)/m, injection + '$1');
    }

    fs.writeFileSync(fullPath, src, 'utf8');
    console.log(`  ✅ injected: ${file} (${slug})`);
    updated++;
  }
  return { updated, skipped };
}

// ─── Run across Calc 1 chapters ───────────────────────────────────────────
const chapters = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4'];
let totalUpdated = 0, totalSkipped = 0;

for (const ch of chapters) {
  const dir = path.join(contentDir, ch);
  if (!fs.existsSync(dir)) { console.log(`⚠ skipping missing dir: ${ch}`); continue; }
  console.log(`\n📂 ${ch}`);
  const { updated, skipped } = processDir(dir);
  totalUpdated += updated;
  totalSkipped += skipped;
}

console.log(`\n✅ Done: ${totalUpdated} files updated, ${totalSkipped} already injected.`);
