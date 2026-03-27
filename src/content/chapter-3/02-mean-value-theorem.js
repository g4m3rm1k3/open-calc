// FILE: src/content/chapter-3/02-mean-value-theorem.js
export default {
  id: 'ch3-002',
  slug: 'mean-value-theorem',
  chapter: 3,
  order: 2,
  title: 'The Mean Value Theorem',
  subtitle: 'If your average speed was 75 mph, then at some moment your instantaneous speed was exactly 75 mph — and the proof uses only derivatives',
  tags: ['mean value theorem', 'Rolle\'s theorem', 'average rate', 'instantaneous rate', 'increasing functions', 'antiderivatives', 'Cauchy MVT', 'L\'Hôpital preview'],

  hook: {
    question: "You're driving from city A to city B, 300 miles apart, and arrive in exactly 4 hours. Your average speed was 75 mph. But the speed limit is 70 mph. Can the police prove you were speeding, even without radar catching you at any specific moment? The Mean Value Theorem gives a definitive YES.",
    realWorldContext: "The MVT says that if your average speed over an interval was 75 mph, there must have been at least one moment when your instantaneous speed was exactly 75 mph. Some European toll roads already use \"average speed cameras\": they record your entry and exit times and compute your average speed. If it exceeds the limit, you get a ticket — and the MVT guarantees the ticket is legally valid. Beyond traffic enforcement, the MVT is one of the most-used theorems in mathematical analysis. It underlies the proof that functions with zero derivative everywhere are constant, it is the key step in proving the Fundamental Theorem of Calculus, it appears in error bounds for numerical methods and Taylor polynomials, and Cauchy's generalized version is how L'Hôpital's Rule is proved. The MVT is the bridge between local information (the derivative at a point) and global information (how the function behaves over an interval).",
    previewVisualizationId: 'MVTViz',
  },

  intuition: {
    prose: [
      'The geometric picture makes the MVT obvious once you see it. Draw any smooth curve from point A = (a, f(a)) to point B = (b, f(b)). The secant line from A to B has slope m = (f(b) - f(a))/(b - a) — the average rate of change over the interval. Now imagine a horizontal line sliding up from below, parallel to the secant. At some point, this sliding line first touches the curve — at a tangent point. At that tangent point c, the tangent line is parallel to the secant, meaning f\'(c) = m. That is the entire content of the Mean Value Theorem: somewhere between a and b, the instantaneous slope equals the average slope.',
      "Rolle's Theorem is the special case where f(a) = f(b) — the starting and ending values are equal. In this case, the secant is horizontal (slope 0), and the tangent must also be horizontal somewhere. Geometrically: if you start and end at the same height, the graph must have a horizontal tangent somewhere in between. A ball thrown upward eventually falls — it must stop (instantaneous velocity = 0) at the peak. A pendulum swinging back to its starting position must momentarily stop at the peak. Rolle's Theorem captures this intuition precisely.",
      "To prove the MVT from Rolle's Theorem, define a new function g(x) that subtracts the secant line from f: g(x) = f(x) - [f(a) + ((f(b)-f(a))/(b-a))·(x-a)]. This g measures how far f is above the secant line. Note that g(a) = 0 and g(b) = 0 (f equals the secant at both endpoints). So g satisfies Rolle's hypotheses. Rolle's Theorem gives a point c in (a,b) with g'(c) = 0. But g'(x) = f'(x) - (f(b)-f(a))/(b-a), so g'(c) = 0 means f'(c) = (f(b)-f(a))/(b-a). That is the MVT. The trick is simply to subtract the secant line to create a function that satisfies Rolle's hypothesis.",
      'The most important consequence of the MVT is the characterization of constant functions. If f\'(x) = 0 for all x in (a,b), then the MVT applied to any two points x₁ < x₂ in (a,b) gives: f(x₂) - f(x₁) = f\'(c)(x₂ - x₁) = 0·(x₂ - x₁) = 0. So f(x₂) = f(x₁) for all pairs — f is constant. This theorem, which feels obvious, is actually non-trivial to prove without the MVT. It is the first theorem about antiderivatives: if F and G are both antiderivatives of f (F\' = G\' = f), then (F - G)\' = 0, so F - G is constant, so F = G + C for some constant C. This is why every antiderivative has "+ C".',
      'The MVT also proves that positive derivative implies increasing function. If f\'(x) > 0 for all x in (a,b), then for any x₁ < x₂ in (a,b), the MVT gives f(x₂) - f(x₁) = f\'(c)(x₂ - x₁) > 0 (since f\'(c) > 0 and x₂ - x₁ > 0). So f(x₂) > f(x₁): f is increasing. Similarly, f\'(x) < 0 everywhere means f is decreasing. This result, which seems geometrically obvious, is proved rigorously only through the MVT.',
      "History: the Mean Value Theorem was proved by Joseph-Louis Lagrange in 1797 in his landmark book Théorie des fonctions analytiques, where he attempted to put calculus on a rigorous footing without infinitesimals. Lagrange called it the théorème des accroissements finis (theorem of finite increments). Rolle's Theorem was proved 100 years earlier, in 1691, by Michel Rolle — interestingly, as part of an argument AGAINST calculus. Rolle believed that infinitesimals were logically incoherent, and he published his theorem to demonstrate a paradox in the new calculus. The irony is that the theorem named after him is now used to prove the foundations of the subject he opposed.",
    ],
    callouts: [
      {
        type: 'history',
        title: 'Rolle\'s Paradox: A Theorem Against Calculus',
        body: "Michel Rolle (1652–1719) proved what we now call Rolle's Theorem in 1691, intending it as a counterargument against calculus. He believed infinitesimals were self-contradictory. He was eventually persuaded by Varignon and Bernoulli that calculus was valid. The theorem named after him — now a cornerstone of calculus — is a monument to the irony that rigorous opposition can produce rigorous results.",
      },
      {
        type: 'theorem',
        title: 'Mean Value Theorem',
        body: 'If f is continuous on [a, b] and differentiable on (a, b), then there exists c \\in (a, b) such that\n\\[f\'(c) = \\frac{f(b) - f(a)}{b - a}\\]',
      },
      {
        type: 'misconception',
        title: 'MVT Guarantees Existence, Not Uniqueness',
        body: 'The MVT guarantees at least one c where f\'(c) equals the average slope. There may be many such points — consider f(x) = sin(x) over multiple periods. The theorem only promises existence of at least one c. Do not assume the c is unique unless you have additional information about f.',
      },
      {
        type: 'real-world',
        title: 'Average Speed Cameras',
        body: 'Some toll roads in Europe (notably in the UK, Italy, and the Netherlands) use "average speed enforcement." Your license plate is photographed at entry and exit. If the elapsed time implies an average speed exceeding the limit, you are fined — even if no radar caught you speeding at any single point. The legal basis is the MVT: average speed > limit ⟹ instantaneous speed exceeded the limit at some moment.',
      },
      {
        type: 'prior-knowledge',
        title: 'Average Velocity Equals Instantaneous Velocity Somewhere',
        body: 'In physics, if the average velocity of an object over [t₁, t₂] is v̄, then the instantaneous velocity v(t) = v̄ at some t ∈ (t₁, t₂). This is the MVT applied to position functions s(t): v̄ = (s(t₂) - s(t₁))/(t₂ - t₁) = s\'(c) = v(c) for some c. Every physics problem involving "at some moment the velocity equaled the average" is an application of MVT.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 3.2.2 The Mean Value Theorem",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 3.2.1 Rolle's Theorem",
        props: { url: "" }
      },
    {
        id: 'VideoEmbed',
        title: "Mean Value & Average Value Theorem of Integration Calculus 1 AB",
        props: { url: "" }
      },
    {
        id: 'VideoEmbed',
        title: "Mean Value Theorem for Derivatives Calculus 1 AB",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "The MEAN Value Theorem is Actually Very Nice",
        props: { url: "" }
      },
      {
        id: 'SpeedingTicket',
        title: 'The Speeding Ticket Paradox',
        caption: 'Average speed vs. Instantaneous speed. If the average exceeds the limit, the MVT guarantees you were speeding at some point.',
      },
      {
        id: 'KineticEnergySpeeding',
        title: 'The Energy Cost of Speeding',
        caption: 'Why 10 km/h over the limit is more than 10 km/h of danger. Explore the v² relationship between speed and impact energy.',
      },
      {
        id: 'MVTViz',
        title: 'Mean Value Theorem — Interactive',
        caption: 'Drag the interval endpoints a and b. The green tangent line at c is always parallel to the amber secant. There is always at least one such c.',
      },
    ],
  },

  math: {
    prose: [
      "Rolle's Theorem: Suppose f is continuous on the closed interval [a, b], differentiable on the open interval (a, b), and f(a) = f(b). Then there exists at least one c ∈ (a, b) such that f'(c) = 0. The proof uses the Extreme Value Theorem (EVT): since f is continuous on [a, b], it attains its maximum M and minimum m on [a, b]. If M = m, then f is constant and f' = 0 everywhere — any interior c works. If M ≠ m, then at least one extreme value is attained at some interior point c (it cannot be both maximum and minimum at the endpoints, since f(a) = f(b)). At an interior maximum or minimum c, f'(c) = 0 (by Fermat's theorem: if f has a local extremum at an interior differentiable point, the derivative is zero there). This completes the proof.",
      "The MVT follows from Rolle's Theorem by a tilt transformation. Define the helper function h(x) = f(x) - L(x), where L(x) = f(a) + [(f(b)-f(a))/(b-a)]·(x-a) is the secant line through the endpoints. Then h(a) = f(a) - f(a) = 0 and h(b) = f(b) - [f(a) + (f(b)-f(a))] = 0. Also, h is continuous on [a,b] (difference of continuous functions) and differentiable on (a,b). By Rolle's Theorem, there exists c ∈ (a,b) with h'(c) = 0. But h'(x) = f'(x) - (f(b)-f(a))/(b-a), so h'(c) = 0 gives f'(c) = (f(b)-f(a))/(b-a). That is the MVT.",
      'The corollaries of the MVT are its main applications. Corollary 1: If f\'(x) = 0 for all x in (a,b), then f is constant on (a,b). Proof: for any x₁, x₂ ∈ (a,b) with x₁ < x₂, MVT gives f(x₂) - f(x₁) = f\'(c)(x₂ - x₁) = 0. Corollary 2: If f\'(x) > 0 for all x ∈ (a,b), then f is strictly increasing on (a,b). Corollary 3: If F\'(x) = G\'(x) for all x ∈ (a,b), then F(x) = G(x) + C for some constant C. This is the uniqueness-up-to-constant of antiderivatives. Corollary 4 (Error bound): |f(b) - f(a)| ≤ (b-a)·max_{[a,b]}|f\'|. This bound is used in Taylor polynomial error estimates and numerical analysis.',
      "Cauchy's Generalized Mean Value Theorem: If f and g are continuous on [a,b] and differentiable on (a,b), with g'(x) ≠ 0 on (a,b), then there exists c ∈ (a,b) such that f'(c)/g'(c) = (f(b)-f(a))/(g(b)-g(a)). Proof: apply Rolle's Theorem to h(x) = f(x)(g(b)-g(a)) - g(x)(f(b)-f(a)). This generalization is the key to proving L'Hôpital's Rule: in the 0/0 case with f(a) = g(a) = 0, the Cauchy MVT gives f(x)/g(x) = [f(x)-f(a)]/[g(x)-g(a)] = f'(c)/g'(c) for some c between a and x. As x → a, c → a too (since c is trapped between a and x), giving lim f(x)/g(x) = lim f'(c)/g'(c) = f'(a)/g'(a) when the derivative ratio is continuous.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Rolle's Theorem",
        body: 'If f is continuous on [a,b], differentiable on (a,b), and f(a) = f(b), then\n\\[\\exists\\, c \\in (a,b): f\'(c) = 0\\]',
      },
      {
        type: 'theorem',
        title: 'Key Corollaries of the MVT',
        body: '(1) f\'=0 on (a,b) \\implies f \\text{ is constant.}\\\\ (2) f\'>0 \\implies f \\text{ strictly increasing.}\\\\ (3) F\'=G\' \\implies F = G + C.\\\\ (4) |f(b)-f(a)| \\le (b-a)\\max|f\'|.',
      },
      {
        type: 'theorem',
        title: "Cauchy's Generalized MVT",
        body: 'If f, g \\text{ continuous on } [a,b] \\text{ and differentiable on } (a,b) \\text{ with } g\' \\ne 0:\\\\ \\exists\\, c \\in (a,b): \\dfrac{f\'(c)}{g\'(c)} = \\dfrac{f(b)-f(a)}{g(b)-g(a)}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Proof of Rolle's Theorem in full: Suppose f is continuous on [a,b], differentiable on (a,b), and f(a) = f(b). By the Extreme Value Theorem (which follows from the completeness of ℝ), f attains a maximum value M and a minimum value m on [a,b]. Case 1: M = m. Then f is constant on [a,b], so f'(x) = 0 for all x ∈ (a,b). Any interior point c serves as the guaranteed point. Case 2: M > m. Then M ≠ m, and since f(a) = f(b), it is impossible for both M and m to be attained only at the endpoints a and b (at least one extreme value must occur at an interior point). Suppose (WLOG) that the maximum M is attained at c ∈ (a,b). Then f(c) ≥ f(x) for all x ∈ [a,b]. For h > 0 small enough: [f(c+h) - f(c)]/h ≤ 0 (since f(c+h) ≤ f(c)). Taking h → 0⁺: f'(c) ≤ 0 (right derivative ≤ 0). For h < 0: [f(c+h) - f(c)]/h ≥ 0. Taking h → 0⁻: f'(c) ≥ 0 (left derivative ≥ 0). Since f is differentiable at c, left and right derivatives are equal, so 0 ≤ f'(c) ≤ 0, giving f'(c) = 0. ∎",
      "Proof of the MVT from Rolle's Theorem: Define h(x) = f(x) - f(a) - [(f(b)-f(a))/(b-a)]·(x-a). Then: h is continuous on [a,b] (linear combination of continuous functions). h is differentiable on (a,b). h(a) = f(a) - f(a) - 0 = 0. h(b) = f(b) - f(a) - [(f(b)-f(a))/(b-a)]·(b-a) = f(b) - f(a) - (f(b)-f(a)) = 0. So h satisfies all hypotheses of Rolle's Theorem. Therefore ∃c ∈ (a,b) with h'(c) = 0. Computing: h'(x) = f'(x) - (f(b)-f(a))/(b-a). Setting h'(c) = 0: f'(c) = (f(b)-f(a))/(b-a). This is the MVT. ∎",
      'Proof that f\'=0 everywhere implies f is constant (using MVT directly): Suppose f\'(x) = 0 for all x ∈ (a,b) and let x₁, x₂ ∈ (a,b) with x₁ < x₂. By the MVT applied to f on [x₁, x₂]: f(x₂) - f(x₁) = f\'(c)(x₂ - x₁) for some c ∈ (x₁, x₂). But f\'(c) = 0 by hypothesis. Therefore f(x₂) - f(x₁) = 0·(x₂ - x₁) = 0, giving f(x₂) = f(x₁). Since x₁ and x₂ were arbitrary, f is constant on (a,b). ∎ This proof is the archetype for many other MVT applications — find a function satisfying MVT\'s hypotheses, identify what its derivative is, and conclude about the function\'s behavior.',
      "Cauchy's MVT — proof and application to L'Hôpital: Define h(x) = f(x)[g(b)-g(a)] - g(x)[f(b)-f(a)]. Then h(a) = f(a)[g(b)-g(a)] - g(a)[f(b)-f(a)] = f(a)g(b) - f(a)g(a) - g(a)f(b) + g(a)f(a) = f(a)g(b) - g(a)f(b). Similarly h(b) = f(b)g(b) - f(b)g(a) - g(b)f(b) + g(a)f(b) = -f(b)g(a) + g(a)f(b)... Actually h(a) = h(b): verify directly: h(b) - h(a) = [f(b)-f(a)][g(b)-g(a)] - [g(b)-g(a)][f(b)-f(a)] = 0. So h satisfies Rolle's hypothesis. Therefore ∃c with h'(c) = 0: f'(c)[g(b)-g(a)] - g'(c)[f(b)-f(a)] = 0, rearranging: f'(c)/g'(c) = [f(b)-f(a)]/[g(b)-g(a)]. For L'Hôpital: with f(a) = g(a) = 0, the ratio [f(x)-f(a)]/[g(x)-g(a)] = f(x)/g(x), and Cauchy's MVT gives f(x)/g(x) = f'(c)/g'(c) where c is between a and x. As x → a, c → a, so f(x)/g(x) → f'(a)/g'(a) if the latter limit exists. ∎",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Extreme Value Theorem (Used in Rolle\'s Proof)',
        body: 'If f is continuous on the closed interval [a, b], then f attains its maximum and minimum values on [a, b]. This theorem relies on the completeness of ℝ (every bounded sequence has a convergent subsequence) and is proved in real analysis.',
      },
      {
        type: 'insight',
        title: 'MVT is the Bridge Theorem',
        body: 'The MVT connects local information (f\' at one point) to global information (f\'s change over an interval). This is the fundamental structure of much of analysis. Almost every theorem of the form "f\' has property P ⟹ f has property Q on an interval" is proved using the MVT.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-002-ex1',
      title: 'Verify MVT for f(x) = x² on [1, 3]',
      problem: '\\text{Verify the MVT for } f(x) = x^2 \\text{ on } [1, 3] \\text{ and find all guaranteed points } c.',
      visualizationId: 'MVTViz',
      steps: [
        { expression: '\\frac{f(3)-f(1)}{3-1} = \\frac{9-1}{2} = 4', annotation: 'Compute the average rate of change (slope of the secant from (1,1) to (3,9)).', hints: ['Find the slope between the endpoints.'] },
        { expression: "f'(x) = 2x", annotation: 'Compute the derivative.', hints: ['Power rule for x².'] },
        { expression: "f'(c) = 4 \\Rightarrow 2c = 4 \\Rightarrow c = 2", annotation: 'Set f\'(c) equal to the average rate and solve. c = 2 ∈ (1, 3) ✓.', hints: ['Solve 2c = 4.'] },
        { expression: '\\text{The tangent at } c=2 \\text{ has slope } f\'(2) = 4 = \\text{slope of secant}', annotation: 'Verify: f\'(2) = 4 matches the secant slope. The MVT is satisfied with c = 2.', hints: ['Plug c back into the derivative.'] },
      ],
      conclusion: 'For f(x) = x² on [1,3], the unique MVT point is c = 2, the midpoint of [1,3]. This is not a coincidence for quadratic functions — for any f(x) = x² on [a,b], the MVT point is always c = (a+b)/2 (the midpoint), because f\'(x) = 2x is linear and hits the average value exactly at the midpoint.',
    },
    {
      id: 'ch3-002-ex2',
      title: 'Verify MVT for f(x) = x³ on [-1, 1]',
      problem: '\\text{Find all } c \\text{ satisfying the MVT for } f(x) = x^3 \\text{ on } [-1, 1].',
      steps: [
        { expression: '\\frac{f(1)-f(-1)}{1-(-1)} = \\frac{1-(-1)}{2} = \\frac{2}{2} = 1', annotation: 'Compute the average rate of change.', hints: ['f(1) = 1, f(-1) = -1.'] },
        { expression: "f'(x) = 3x^2", annotation: 'Derivative of x³.', hints: ['Power rule.'] },
        { expression: "f'(c) = 1 \\Rightarrow 3c^2 = 1 \\Rightarrow c^2 = \\frac{1}{3} \\Rightarrow c = \\pm\\frac{1}{\\sqrt{3}} \\approx \\pm 0.577", annotation: 'Solve for c. Two solutions: c = ±1/√3.', hints: ['Solve 3c² = 1.'] },
        { expression: 'c = \\frac{1}{\\sqrt{3}} \\in (-1, 1) \\checkmark, \\quad c = -\\frac{1}{\\sqrt{3}} \\in (-1, 1) \\checkmark', annotation: 'Both values are in the open interval (-1, 1), confirming the MVT. This illustrates that the MVT can have multiple c values.', hints: ['Check if the values are inside the interval.'] },
      ],
      conclusion: 'There are two MVT points for x³ on [-1,1]: c = ±1/√3. The MVT promised at least one; we found two. The function x³ is odd (symmetric about the origin), and the two c values are symmetric as well — another symmetry consequence.',
    },
    {
      id: 'ch3-002-ex3',
      title: 'MVT Proof: |sin(x) - sin(y)| ≤ |x - y|',
      problem: '\\text{Use the MVT to prove that } |\\sin(x) - \\sin(y)| \\leq |x - y| \\text{ for all } x, y \\in \\mathbb{R}.',
      steps: [
        { expression: 'f(t) = \\sin(t), \\quad f\'(t) = \\cos(t)', annotation: 'Apply the MVT to f(t) = sin(t) on the interval between x and y (WLOG x < y).', hints: ['Let the endpoints be the two arbitrary numbers x and y.'] },
        { expression: '\\sin(x) - \\sin(y) = \\cos(c)(x - y) \\text{ for some } c \\in (y, x)', annotation: 'By the MVT: f(x) - f(y) = f\'(c)(x-y).', hints: ['Substitute sin and cos into the MVT formula.'] },
        { expression: '|\\sin(x) - \\sin(y)| = |\\cos(c)| \\cdot |x - y|', annotation: 'Take absolute values of both sides. Use |ab| = |a|·|b|.', hints: ['Apply the absolute value operator.'] },
        { expression: '|\\cos(c)| \\leq 1 \\text{ for all } c', annotation: 'The cosine function satisfies |cos(c)| ≤ 1 everywhere.', hints: ['What is the range of the cosine function?'] },
        { expression: '\\therefore |\\sin(x) - \\sin(y)| \\leq 1 \\cdot |x - y| = |x - y|', annotation: 'Multiply the inequality by |x-y| ≥ 0. ∎', hints: ['Combine the steps into the final inequality.'] },
      ],
      conclusion: 'The sine function is Lipschitz continuous with constant 1 — it cannot change faster than the identity function. This is an MVT corollary (the error bound): |f(b)-f(a)| ≤ |b-a|·max|f\'|. Here max|cos| = 1 gives the result.',
    },
    {
      id: 'ch3-002-ex4',
      title: 'Speed Trap Application',
      problem: '\\text{A car travels 200 miles in exactly 3 hours. Prove it exceeded 60 mph at some moment.}',
      steps: [
        { expression: 's(t) = \\text{position (miles), } s(0) = 0, s(3) = 200', annotation: 'Set up: s(t) is the position function. s is continuous (the car moves continuously) and differentiable (it has a velocity) on (0,3).', hints: ['Define a position function for the journey.'] },
        { expression: '\\frac{s(3) - s(0)}{3 - 0} = \\frac{200}{3} \\approx 66.7 \\text{ mph}', annotation: 'Compute the average velocity over the 3-hour trip.', hints: ['What was the average speed?'] },
        { expression: '\\text{By MVT: } \\exists\\, c \\in (0, 3) \\text{ such that } s\'(c) = \\frac{200}{3} \\approx 66.7 \\text{ mph}', annotation: 'Apply the MVT: since s satisfies the hypotheses, there exists c with s\'(c) = 200/3.', hints: ['At some point, the car\'s speed must have hit that average.'] },
        { expression: 's\'(c) = \\frac{200}{3} > 60 \\text{ mph}', annotation: 'The instantaneous speed at time c exceeds 60 mph. ∎', hints: ['Compare the guaranteed speed to the limit.'] },
      ],
      conclusion: 'At time c (some moment during the 3 hours), the instantaneous speed was exactly 200/3 ≈ 66.7 mph > 60 mph. The car definitely exceeded 60 mph at that moment. The MVT makes this a mathematical certainty, not just a suspicion.',
    },
    {
      id: 'ch3-002-ex5',
      title: "Rolle's Theorem: Exactly One Solution in an Interval",
      problem: '\\text{Prove that } x^4 + x = 2 \\text{ has exactly one solution in } [0, 1].',
      steps: [
        { expression: 'g(x) = x^4 + x - 2', annotation: 'Reformulate: find zeros of g(x) = x⁴ + x - 2.' },
        { expression: 'g(0) = 0 + 0 - 2 = -2 < 0, \\quad g(1) = 1 + 1 - 2 = 0', annotation: 'Evaluate at the endpoints. g(1) = 0 — so x = 1 is a solution! We need to show it is the ONLY one in [0,1].' },
        { expression: "g'(x) = 4x^3 + 1 > 0 \\text{ for all } x \\in [0, 1]", annotation: 'g\'(x) = 4x³ + 1 ≥ 1 > 0 for x ∈ [0,1]. So g is strictly increasing on [0,1].' },
        { expression: '\\text{Strictly increasing} \\Rightarrow \\text{at most one zero}', annotation: 'A strictly increasing function can cross zero at most once — it can only go from negative to positive once. So there is at most one solution.' },
        { expression: '\\text{g(0) < 0, g(1) = 0: exactly one zero at } x = 1', annotation: 'Since g is strictly increasing and g(1) = 0, the only zero in [0,1] is x = 1.' },
      ],
      conclusion: 'x⁴ + x = 2 has exactly one solution in [0,1], namely x = 1. The MVT/Rolle\'s approach (via the derivative) proves both existence and uniqueness. Existence: g(0) < 0 < g(1) and IVT (or just g(1) = 0). Uniqueness: g\'> 0 so g is strictly increasing, hence at most one zero.',
    },
    {
      id: 'ch3-002-ex6',
      title: 'MVT Inequality: √(1+x) < 1 + x/2 for x > 0',
      problem: '\\text{Use the MVT to prove } \\sqrt{1+x} < 1 + \\frac{x}{2} \\text{ for all } x > 0.',
      steps: [
        { expression: 'f(t) = \\sqrt{t}, \\text{ apply MVT on } [1, 1+x]', annotation: 'Consider f(t) = √t on [1, 1+x] for x > 0.' },
        { expression: 'f(1+x) - f(1) = f\'(c) \\cdot x \\text{ for some } c \\in (1, 1+x)', annotation: 'MVT: √(1+x) - 1 = f\'(c)·x for some c strictly between 1 and 1+x.' },
        { expression: "f'(t) = \\frac{1}{2\\sqrt{t}}", annotation: 'Derivative of √t.' },
        { expression: 'c > 1 \\Rightarrow \\sqrt{c} > 1 \\Rightarrow \\frac{1}{2\\sqrt{c}} < \\frac{1}{2}', annotation: 'Since c > 1, √c > 1, so 1/(2√c) < 1/2. The c is strictly interior to (1, 1+x), so the strict inequality holds.' },
        { expression: '\\sqrt{1+x} - 1 = \\frac{x}{2\\sqrt{c}} < \\frac{x}{2}', annotation: 'Multiply the inequality 1/(2√c) < 1/2 by x > 0.' },
        { expression: '\\therefore \\sqrt{1+x} < 1 + \\frac{x}{2} \\quad \\text{for all } x > 0 \\quad \\square', annotation: 'Add 1 to both sides.' },
      ],
      conclusion: 'The MVT can be used to prove inequalities by bounding f\'(c) on the relevant interval. The key steps are: (1) write f(b) - f(a) = f\'(c)(b-a), then (2) bound f\'(c) using the known range of c. This technique appears constantly in analysis.',
    },
  ],

  challenges: [
    {
      id: 'ch3-002-ch1',
      difficulty: 'hard',
      problem: 'Prove that |e^x - e^y| ≥ |x - y| for all x, y ≥ 0.',
      hint: 'Apply the MVT to f(t) = e^t on [x,y] (or [y,x]). Bound e^c from below.',
      walkthrough: [
        { expression: 'f(t) = e^t, \\quad f\'(t) = e^t', annotation: 'Apply MVT to e^t on [y, x] (assume x ≥ y ≥ 0 WLOG).' },
        { expression: 'e^x - e^y = e^c(x - y) \\text{ for some } c \\in (y, x)', annotation: 'MVT gives: e^x - e^y = e^c(x-y).' },
        { expression: 'c \\geq y \\geq 0 \\Rightarrow e^c \\geq e^0 = 1', annotation: 'Since c ≥ y ≥ 0, and e^t is increasing, e^c ≥ e^0 = 1.' },
        { expression: '|e^x - e^y| = e^c|x - y| \\geq 1 \\cdot |x - y| = |x - y|', annotation: 'Take absolute values and apply the bound e^c ≥ 1. ∎' },
      ],
      answer: '|e^x - e^y| ≥ |x-y| for x,y ≥ 0. The exponential function is "expanding" on [0,∞) — it stretches distances rather than contracting them. This contrasts with sin (which contracts: |sin(x) - sin(y)| ≤ |x-y|). Both proofs use the MVT with bounds on |f\'(c)|.',
    },
    {
      id: 'ch3-002-ch2',
      difficulty: 'medium',
      problem: "If f'(x) = f(x) for all x and f(0) = 0, prove that f is identically zero.",
      hint: 'Consider g(x) = f(x)·e^{-x} and apply the MVT (or show g\' = 0 everywhere, hence g is constant, hence f = 0).',
      walkthrough: [
        { expression: 'g(x) = f(x) \\cdot e^{-x}', annotation: 'Define the helper function g. We will show g is constant.', hints: ['Use the integration factor e^(-x).'] },
        { expression: "g'(x) = f'(x)e^{-x} + f(x)(-e^{-x}) = [f'(x) - f(x)]e^{-x}", annotation: 'Differentiate g using the product rule.', hints: ['Apply the product rule for g.'] },
        { expression: "f'(x) = f(x) \\Rightarrow f'(x) - f(x) = 0 \\Rightarrow g'(x) = 0", annotation: 'Since f\'(x) = f(x), the bracket is zero, so g\'(x) = 0 for all x.', hints: ['Substitute the given differential equation into g\'.'] },
        { expression: "g'(x) = 0 \\text{ everywhere} \\Rightarrow g \\text{ is constant (by MVT corollary)}", annotation: 'By Corollary 1 of the MVT, g is constant.', hints: ['If the derivative is always 0, what can you say?'] },
        { expression: 'g(0) = f(0) \\cdot e^0 = 0 \\cdot 1 = 0', annotation: 'Evaluate g at 0 using f(0) = 0.', hints: ['Use the initial condition.'] },
        { expression: 'g(x) = 0 \\text{ for all } x \\Rightarrow f(x) \\cdot e^{-x} = 0 \\Rightarrow f(x) = 0', annotation: 'Since g is the constant 0 and e^{-x} ≠ 0, we conclude f(x) = 0. ∎', hints: ['Conclusion: f must be zero everywhere.'] },
      ],
      answer: 'The only function satisfying f\'= f and f(0) = 0 is the zero function. This characterizes e^x uniquely: up to scaling, the exponential is the only function equal to its own derivative. With initial condition f(0) = 1 instead of 0, the unique solution is e^x.',
    },
    {
      id: 'ch3-002-ch3',
      difficulty: 'hard',
      problem: "Prove Cauchy's MVT: if f, g are continuous on [a,b] and differentiable on (a,b), then ∃c ∈ (a,b) with f'(c)(g(b)-g(a)) = g'(c)(f(b)-f(a)).",
      hint: "Define h(x) = f(x)(g(b)-g(a)) - g(x)(f(b)-f(a)) and verify h(a) = h(b), then apply Rolle's Theorem.",
      walkthrough: [
        { expression: 'h(x) = f(x)[g(b)-g(a)] - g(x)[f(b)-f(a)]', annotation: 'Define the helper function h. It is a linear combination of f and g, so h is continuous on [a,b] and differentiable on (a,b).', hints: ['Construct a helper function for Rolle\'s.'] },
        { expression: 'h(a) = f(a)[g(b)-g(a)] - g(a)[f(b)-f(a)]', annotation: 'Evaluate h at a.', hints: ['Plug in a.'] },
        { expression: 'h(b) = f(b)[g(b)-g(a)] - g(b)[f(b)-f(a)]', annotation: 'Evaluate h at b.', hints: ['Plug in b.'] },
        { expression: 'h(b) - h(a) = [f(b)-f(a)][g(b)-g(a)] - [g(b)-g(a)][f(b)-f(a)] = 0', annotation: 'Compute h(b) - h(a). It factors as [f(b)-f(a)][g(b)-g(a)] - [g(b)-g(a)][f(b)-f(a)] = 0 (the two terms are equal). So h(a) = h(b).', hints: ['Show the two endpoints have the same value.'] },
        { expression: "\\text{By Rolle's Theorem: } \\exists\\, c \\in (a,b) \\text{ with } h'(c) = 0", annotation: 'h satisfies Rolle\'s hypotheses (continuous on [a,b], differentiable on (a,b), h(a) = h(b)).', hints: ['Apply Rolle\'s to the helper function.'] },
        { expression: "h'(x) = f'(x)[g(b)-g(a)] - g'(x)[f(b)-f(a)]", annotation: 'Differentiate h.', hints: ['Take the derivative.'] },
        { expression: "h'(c) = 0 \\Rightarrow f'(c)[g(b)-g(a)] = g'(c)[f(b)-f(a)] \\quad \\square", annotation: 'Set h\'(c) = 0 and rearrange. This is Cauchy\'s MVT. ∎', hints: ['Set it to 0 and solve for the desired form.'] },
      ],
      answer: "Cauchy's MVT follows from Rolle's Theorem applied to h(x) = f(x)(g(b)-g(a)) - g(x)(f(b)-f(a)). The classical MVT is the special case g(x) = x.",
    },
  ],

  crossRefs: [
    { lessonSlug: 'tangent-problem', label: 'The Derivative', context: 'The MVT is a theorem about derivatives. The concepts of differentiability and instantaneous rate of change from Chapter 2 are the foundations.' },
    { lessonSlug: 'lhopital', label: "L'Hôpital's Rule", context: "L'Hôpital's Rule is proved using Cauchy's Generalized MVT — the most important application of the MVT in this chapter." },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: 'The increasing/decreasing test (f\' > 0 ⟹ increasing) is proved from the MVT corollaries.' },
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
    'attempted-challenge-hard-1',
    'attempted-challenge-medium',
    'attempted-challenge-hard-2',
  ],
}
