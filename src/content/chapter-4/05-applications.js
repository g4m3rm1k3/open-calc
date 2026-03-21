// FILE: src/content/chapter-4/05-applications.js
export default {
  id: 'ch4-005',
  slug: 'applications',
  chapter: 4,
  order: 5,
  title: 'Applications of Integration',
  subtitle: 'Net change, area between curves, average value, work — the integral as a universal measuring tool',
  tags: ['net change theorem', 'area between curves', 'average value', 'displacement vs distance', 'work', 'consumer surplus', 'applications', 'definite integral applications'],

  hook: {
    question: 'The area under a single curve was our starting point. But what about the area BETWEEN two curves? What about the average value of a function, or the work done by a variable force? All of these are integrals in disguise. The key insight is that any quantity that can be described as "the limit of a sum of small pieces" is a definite integral — and FTC converts that integral into an algebraic computation.',
    realWorldContext: 'Applications of integration are the reason calculus was developed. Newton used integration to compute planetary orbit areas (confirming Kepler\'s second law). Engineers compute work against variable gravity when launching satellites. Economists compute consumer surplus — the benefit buyers receive above what they pay — as an integral under the demand curve. Architects compute the volume of irregular solids. Probability theorists compute the likelihood of events as integrals of density functions. Mechanical engineers compute centers of mass and moments of inertia as integrals. Every measurement of a quantity distributed continuously over space or time is, at its mathematical core, a definite integral.',
    previewVisualizationId: 'AreaBetweenCurves',
  },

  intuition: {
    prose: [
      'The Net Change Theorem is FTC Part 2 stated in physical language: ∫ₐᵇ F\'(x) dx = F(b) − F(a). In words: the integral of a rate of change over an interval equals the net change in the quantity. Integrate velocity to get displacement. Integrate acceleration to get change in velocity. Integrate marginal cost to get total cost increase. Integrate population growth rate to get population change. The net change theorem unifies all these under one principle: ∫(rate) = net change.',
      'Area between two curves extends the basic area idea. If f(x) ≥ g(x) on [a, b], the area between them is ∫ₐᵇ [f(x) − g(x)] dx. This formula has a transparent geometric meaning: at each x, the "height" of the region is f(x) − g(x) (the gap between the curves), and integrating these heights over [a, b] gives the total area. The formula is always "upper curve minus lower curve" — never worry about whether either function is above or below the x-axis. Even if both f and g are negative, f − g is positive when f ≥ g, and the formula is correct.',
      'Finding the limits of integration for area between curves requires finding where the curves intersect. At an intersection, f(x) = g(x). Solve this equation to find the x-coordinates where the curves cross. Between adjacent intersections, one curve is consistently above the other — but the labeling may switch. Always check which curve is on top in each subinterval (evaluate at a test point). If the curves cross within your intended interval, split the integral at each crossing and negate the piece where the intended "upper" function is actually below.',
      'Average value is conceptually elegant: f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx. For a temperature function T(t) = 70 + 10sin(πt/12) over 24 hours, the average temperature is (1/24) ∫₀²⁴ T(t) dt. The sinusoidal part integrates to zero over a full period, leaving the average equal to the constant term: 70°F. This is the "DC component" in signal processing, and it represents the baseline around which the temperature oscillates.',
      'Work done by a variable force is W = ∫ₐᵇ F(x) dx, where F(x) is the force at position x and the object moves from x = a to x = b. When the force is constant, W = F × d (force times distance). When it varies, we sum F(x) dx over the path — a Riemann sum in the limit. Lifting an object against gravity: if the object weighs mg Newtons and is lifted from x = 0 to x = h, the work is ∫₀ʰ mg dx = mgh (same as the constant-force formula, since gravity is constant near the Earth\'s surface). Compressing a spring: by Hooke\'s law, F = kx, and work = ∫₀ˣ kx dx = kx²/2 (the energy stored in the spring).',
      'Consumer surplus in economics: the demand function D(x) gives the maximum price a consumer will pay for the x-th unit. If the market price is P*, consumers buying at or below quantity x* = D⁻¹(P*) receive "surplus" — they would have paid more than P* but only paid P*. The total consumer surplus is ∫₀^(x*) [D(x) − P*] dx: the area between the demand curve and the horizontal price line. Producer surplus is the analogous integral below the supply curve. Together, consumer + producer surplus = total economic surplus, a measure of the efficiency of a market — computed by integration.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Net Change Theorem',
        body: '\\[\\int_a^b F\'(x)\\,dx = F(b) - F(a).\\]\nThe integral of a rate of change equals the net change in the quantity. This is FTC Part 2 in physical language: \\(\\int v\\,dt = \\Delta x\\); \\(\\int a\\,dt = \\Delta v\\); \\(\\int MC\\,dq = \\Delta TC\\).',
      },
      {
        type: 'prior-knowledge',
        title: 'Area Between Two Lines Is a Rectangle or Trapezoid',
        body: 'The area between y = 5 and y = 2 over [0, 4] is a rectangle with height 5−2 = 3 and width 4: area = 12. This is ∫₀⁴ (5−2) dx = ∫₀⁴ 3 dx = 12. The formula "upper minus lower, integrated" works even when both functions are constants. Integration generalizes the geometric formulas you already know.',
      },
      {
        type: 'real-world',
        title: 'Physics: Work as an Integral',
        body: 'Lifting a 50 kg satellite from Earth\'s surface to height h: near the surface, gravity ≈ 9.8 m/s² (constant), so W = mgh = 50×9.8×h. But at large heights, gravity varies: F = GMm/r². Then W = ∫_{R}^{R+h} GMm/r² dr = GMm[−1/r]_R^{R+h} = GMm(1/R − 1/(R+h)). The integral accounts for the changing gravitational force — constant-force formulas no longer apply.',
      },
      {
        type: 'warning',
        title: 'Always Check Which Curve Is on Top',
        body: 'For the area between y = x and y = x² on [0, 2]: on [0, 1], x ≥ x² (line is above parabola); on [1, 2], x² ≥ x (parabola is above line). You must split at x = 1: ∫₀¹(x−x²)dx + ∫₁²(x²−x)dx. If you use ∫₀²(x−x²)dx = [x²/2−x³/3]₀² = 2−8/3 = −2/3 (negative!), you get the wrong answer because the formula "upper − lower" was applied with the wrong choice of upper on part of the interval.',
      },
      {
        type: 'misconception',
        title: 'Displacement ≠ Distance Traveled',
        body: "∫ₐᵇ v(t) dt gives DISPLACEMENT (net change in position), not total distance. If v changes sign, parts of the journey cancel. Total distance = ∫ₐᵇ |v(t)| dt. A particle with v(t) = sin(t) on [0,2π] has displacement 0 (returns to start) but distance 4 (moved 2 forward and 2 back). Always ask: does the problem want the net change or the total magnitude?",
      },
      {
        type: 'history',
        title: "Newton's Principia: Integration Proves Kepler's Laws (1687)",
        body: "In the Principia Mathematica (1687), Newton proved Kepler's second law (equal areas in equal times) by showing that the area swept by a planet's radius vector is the integral of angular momentum per unit mass over time — constant by conservation of angular momentum. This was the first major physical application of integration: computing gravitational orbit areas to validate an empirical astronomical law.",
      },
    ],
    visualizations: [
      {
        id: 'AreaBetweenCurves',
        title: 'Area Between Two Curves',
        caption: 'The shaded region shows the area between the upper curve f(x) and the lower curve g(x). Drag the endpoints to change the interval. The integral ∫ₐᵇ [f(x)−g(x)] dx is computed in real time. Notice how the area is always positive (upper minus lower), even when both curves are below the x-axis.',
      },
    ],
  },

  math: {
    prose: [
      'Area between two curves (general): if f and g are continuous on [a, b] and f(x) ≥ g(x) throughout, then Area = ∫ₐᵇ [f(x) − g(x)] dx. If the curves cross at interior points c₁, c₂, …, split the integral at each crossing and take the absolute value of each piece: Area = Σ|∫ between consecutive crossings [f − g] dx|. Equivalently, Area = ∫ₐᵇ |f(x) − g(x)| dx. This is a signed integral that handles all crossings automatically, but requires knowing the sign of f − g on each piece.',
      'Average value and the mean value: f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx. The MVT for integrals guarantees f(c) = f_avg for some c ∈ (a, b) when f is continuous. Average value has a physical interpretation: it is the constant value that, integrated over [a, b], gives the same total as f. In other words, the area of the rectangle with height f_avg and base (b−a) equals the area under f. This is the "equal area" construction: a horizontal line at height f_avg cuts the area under f into two pieces of equal area above and below the line.',
      'Work in physics: for a constant force F over displacement d, work W = F·d. For a variable force F(x) over [a, b]: W = ∫ₐᵇ F(x) dx. This follows from the same "sum of thin pieces" logic: over a tiny displacement dx, the work is approximately F(x)·dx (since force is nearly constant over dx); summing gives the total. For Hooke\'s law: a spring with spring constant k, compressed or stretched by x from equilibrium, exerts force F = kx. Work to stretch from 0 to L: W = ∫₀ᴸ kx dx = kL²/2 = ½kL². This equals the potential energy stored in the spring.',
      'Consumer surplus: let D(x) be a demand function (price as a function of quantity), decreasing from D(0) > 0 to 0. If the market clears at price P* and quantity x*, then D(x*) = P* and CS = ∫₀^(x*) [D(x) − P*] dx. This measures total consumer welfare above what they actually paid. Similarly, if S(x) is a supply function (marginal cost), producer surplus is PS = ∫₀^(x*) [P* − S(x)] dx. Total surplus = CS + PS = ∫₀^(x*) [D(x) − S(x)] dx, maximized at the competitive equilibrium — this is the First Welfare Theorem of economics, proved by integration.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Area Between Curves',
        body: 'If \\(f(x) \\geq g(x)\\) on \\([a,b]\\):\n\\[A = \\int_a^b [f(x)-g(x)]\\,dx.\\]\nIf the curves cross, split at each crossing and sum absolute values of each piece:\n\\[A = \\int_a^b |f(x)-g(x)|\\,dx.\\]',
      },
      {
        type: 'definition',
        title: 'Work Done by a Variable Force',
        body: 'If a force \\(F(x)\\) acts on an object moving from \\(x=a\\) to \\(x=b\\):\n\\[W = \\int_a^b F(x)\\,dx.\\]\nFor Hooke\'s law \\(F(x) = kx\\):\n\\[W = \\int_0^L kx\\,dx = \\frac{1}{2}kL^2.\\]',
      },
      {
        type: 'definition',
        title: 'Consumer Surplus',
        body: 'If \\(D(x)\\) is a demand function and the market price is \\(P^*\\) at quantity \\(x^*\\):\n\\[\\text{CS} = \\int_0^{x^*} [D(x) - P^*]\\,dx.\\]\nThis is the area between the demand curve and the horizontal price line.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The area-between-curves formula ∫ₐᵇ |f−g| requires |f−g| to be integrable. Since f and g are continuous, f−g is continuous, and the absolute value of a continuous function is continuous — hence integrable. The formula Area = ∫ₐᵇ |f(x)−g(x)| dx is therefore well-defined for continuous f, g. For piecewise continuous functions (finitely many jump discontinuities), the absolute value formula still works: integrate separately on each piece where the sign of f−g is known, negate the pieces where f−g < 0, and sum.',
      'The justification for W = ∫F(x)dx as work rests on a physical definition. Work is defined as the dot product of force and displacement: dW = F · dx for infinitesimal displacement dx. For a one-dimensional problem with force F(x) varying with position, the total work over [a, b] is W = ∫ₐᵇ F(x) dx. This is both a physical definition and a mathematical consequence of the limiting Riemann sum: W ≈ Σ F(xᵢ)Δxᵢ over small displacements, and taking the limit gives the integral. The work-energy theorem (W = ΔKE) then follows from applying the fundamental theorem to F = ma = m(dv/dt) = m(dv/dx)(dx/dt) = mv(dv/dx), and integrating.',
      'The consumer surplus formula CS = ∫₀^(x*) [D(x)−P*] dx requires D to be continuous (or at least integrable) and P* = D(x*). In the standard model, D is a strictly decreasing continuous function (the demand curve slopes downward) from D(0) > 0 to D(x*) = P*. Then [D(x)−P*] ≥ 0 on [0, x*] (since D is decreasing and equals P* at x*), and the area is positive. The total surplus CS + PS = ∫₀^(x*)[D(x)−S(x)]dx requires S ≤ D on [0, x*], which holds at the competitive equilibrium by the definition of market clearing. The First Welfare Theorem (competitive equilibrium maximizes total surplus) follows from showing that any other allocation produces a smaller value of the total surplus integral.',
      'A subtle but important point about the net change theorem: ∫ₐᵇ F\'(x)dx = F(b)−F(a) is exactly FTC Part 2, but stated with the emphasis on the derivative F\' being the integrand and F being the antiderivative. The theorem says: knowing the complete history of rates of change over [a,b] is equivalent to knowing the net change in F. This equivalence has deep implications in physics: if we know the velocity v(t) = x\'(t) for all t ∈ [a,b], we know the displacement x(b)−x(a) exactly. Conversely, knowing only x(a) and x(b) gives us only the net displacement, not the detailed trajectory. The definite integral condenses the entire rate-function into a single net number.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work-Energy Theorem',
        body: 'For a mass \\(m\\) moving from position \\(a\\) to \\(b\\) under force \\(F(x) = ma(x)\\):\n\\[W = \\int_a^b F(x)\\,dx = \\frac{1}{2}mv(b)^2 - \\frac{1}{2}mv(a)^2 = \\Delta KE.\\]\nWork equals the change in kinetic energy. This follows from FTC applied to the definition of kinetic energy.',
      },
      {
        type: 'warning',
        title: 'Area Between Curves Requires Finding All Crossings',
        body: 'If you compute ∫ₐᵇ [f(x)−g(x)] dx without checking for crossings inside (a,b), you may get cancellation and a result smaller than the true area. The formula gives SIGNED area (net), not geometric area (total). For geometric area, always integrate |f(x)−g(x)| or split at every crossing.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-005-ex1',
      title: 'Area Between y = x and y = x²',
      problem: '\\text{Find the area between } y = x \\text{ and } y = x^2.',
      visualizationId: 'AreaBetweenCurves',
      steps: [
        { expression: 'x = x^2 \\Rightarrow x^2 - x = 0 \\Rightarrow x(x-1) = 0 \\Rightarrow x = 0, 1', annotation: 'Find intersections: set f = g. The curves meet at x=0 and x=1.' },
        { expression: '\\text{On } [0,1]: x \\geq x^2 \\text{ (check at } x=0.5: 0.5 > 0.25 \\text{)} \\Rightarrow \\text{upper: } y=x, \\text{ lower: } y=x^2', annotation: 'Test a point: at x=1/2, x=0.5 and x²=0.25. The line y=x is above the parabola on [0,1].' },
        { expression: 'A = \\int_0^1(x - x^2)\\,dx', annotation: 'Area = ∫(upper − lower) dx over the interval between intersections.' },
        { expression: '= \\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\left(\\frac{1}{2}-\\frac{1}{3}\\right) - 0 = \\frac{3-2}{6} = \\frac{1}{6}', annotation: 'FTC Part 2: F(x) = x²/2 − x³/3. F(1) = 1/2−1/3 = 1/6. F(0) = 0.' },
      ],
      conclusion: 'The area between y=x and y=x² is 1/6 square units. This is a classic result: the line and parabola intersect at (0,0) and (1,1), enclosing a region of area 1/6.',
    },
    {
      id: 'ch4-005-ex2',
      title: 'Area Under sin(x) on [0, π]',
      problem: '\\text{Find the area between } y = \\sin(x) \\text{ and the x-axis on } [0, \\pi].',
      steps: [
        { expression: '\\sin(x) \\geq 0 \\text{ on } [0,\\pi] \\Rightarrow \\text{Area} = \\int_0^{\\pi}\\sin(x)\\,dx', annotation: 'Sine is non-negative on [0,π], so the area equals the (non-negative) integral directly.' },
        { expression: '= [-\\cos(x)]_0^{\\pi} = -\\cos(\\pi) + \\cos(0) = -(-1)+1 = 2', annotation: 'Antiderivative of sin is −cos. F(π) = −cos(π) = 1. F(0) = −cos(0) = −1. F(π)−F(0) = 1−(−1) = 2.' },
      ],
      conclusion: 'Area = 2 square units. The exact area under one arch of the sine curve is 2. This elegant result is one of the most-cited definite integrals in mathematics.',
    },
    {
      id: 'ch4-005-ex3',
      title: 'Displacement vs. Distance: v(t) = t² − 4t',
      problem: '\\text{For } v(t) = t^2-4t \\text{ m/s on } [0,5], \\text{ find (a) displacement and (b) total distance traveled.}',
      steps: [
        { expression: 'v(t) = t(t-4): \\text{ zero at } t=0,4. \\; v < 0 \\text{ on } (0,4), \\; v > 0 \\text{ on } (4,5).', annotation: 'Factor v. The particle moves in the negative direction until t=4, then reverses.' },
        { expression: '\\text{(a) Displacement} = \\int_0^5(t^2-4t)\\,dt = \\left[\\frac{t^3}{3}-2t^2\\right]_0^5', annotation: 'Displacement = signed integral over [0,5].' },
        { expression: '= \\left(\\frac{125}{3}-50\\right) - 0 = \\frac{125-150}{3} = -\\frac{25}{3} \\approx -8.33 \\text{ m}', annotation: 'F(5)=125/3−50=(125−150)/3=−25/3. Displacement is negative: net movement in the negative direction.' },
        { expression: '\\text{(b) } \\int_0^4(t^2-4t)\\,dt = \\left[\\frac{t^3}{3}-2t^2\\right]_0^4 = \\frac{64}{3}-32 = \\frac{64-96}{3} = -\\frac{32}{3}', annotation: 'Piece on [0,4]: v ≤ 0. Integral = −32/3 (negative, as expected for backward motion).' },
        { expression: '\\int_4^5(t^2-4t)\\,dt = \\left[\\frac{t^3}{3}-2t^2\\right]_4^5 = \\left(\\frac{125}{3}-50\\right)-\\left(\\frac{64}{3}-32\\right) = -\\frac{25}{3}+\\frac{32}{3}\\cdot(-1+1) = \\frac{7}{3}', annotation: 'Piece on [4,5]: v ≥ 0. Integral = [−25/3] − [−32/3] = (−25+32)/3 = 7/3.' },
        { expression: '\\text{Distance} = |{-32/3}| + |7/3| = \\frac{32}{3}+\\frac{7}{3} = \\frac{39}{3} = 13 \\text{ m}', annotation: 'Total distance = |backward| + |forward| = 32/3 + 7/3 = 39/3 = 13 m.' },
      ],
      conclusion: 'Displacement = −25/3 ≈ −8.33 m (net movement in the negative direction). Total distance = 13 m (32/3 m backward + 7/3 m forward). The particle ends 8.33 m behind its starting point.',
    },
    {
      id: 'ch4-005-ex4',
      title: 'Average Temperature Over 24 Hours',
      problem: '\\text{Temperature is } T(t) = 70 + 10\\sin(\\pi t/12) \\degree\\text{F, where } t \\text{ is hours. Find the average over } [0, 24].',
      steps: [
        { expression: 'T_{\\text{avg}} = \\frac{1}{24}\\int_0^{24}\\left(70 + 10\\sin\\!\\left(\\frac{\\pi t}{12}\\right)\\right)dt', annotation: 'Average value formula with b−a = 24.' },
        { expression: '\\int_0^{24}70\\,dt = 70 \\times 24 = 1680', annotation: 'Constant term: 70 × 24 = 1680.' },
        { expression: '\\int_0^{24}10\\sin\\!\\left(\\frac{\\pi t}{12}\\right)dt = 10\\cdot\\left[-\\frac{12}{\\pi}\\cos\\!\\left(\\frac{\\pi t}{12}\\right)\\right]_0^{24} = -\\frac{120}{\\pi}[\\cos(2\\pi)-\\cos(0)] = -\\frac{120}{\\pi}[1-1] = 0', annotation: '∫sin(πt/12)dt = −(12/π)cos(πt/12). Evaluated from 0 to 24: −(120/π)(cos(2π)−cos(0)) = −(120/π)(0) = 0. A full period contributes nothing.' },
        { expression: 'T_{\\text{avg}} = \\frac{1680 + 0}{24} = 70 \\degree\\text{F}', annotation: 'The sinusoidal fluctuation averages to zero; the average temperature equals the constant baseline.' },
      ],
      conclusion: 'Average temperature = 70°F. The sinusoidal day-night variation (peak at 80°F, trough at 60°F) averages to zero, leaving only the baseline 70°F. This is exactly the "DC component" in signal processing — the average value of any zero-mean sinusoidal signal is zero.',
    },
    {
      id: 'ch4-005-ex5',
      title: 'Work Against Gravity: Lifting an Object',
      problem: '\\text{Find the work done lifting a 5 kg object 10 m against gravity (} g = 9.8 \\text{ m/s}^2).',
      visualizationId: 'FunctionPlotter',
      steps: [
        { expression: 'F(x) = mg = 5 \\times 9.8 = 49 \\text{ N (constant force)}', annotation: 'Near Earth\'s surface, gravity is approximately constant. Force = weight = 49 Newtons.' },
        { expression: 'W = \\int_0^{10} F(x)\\,dx = \\int_0^{10} 49\\,dx', annotation: 'Work = ∫ F(x) dx. With constant force, this is just the rectangle under the force function.' },
        { expression: '= [49x]_0^{10} = 490 - 0 = 490 \\text{ J}', annotation: '49 × 10 = 490 Joules. For constant force: W = F × d (as expected).' },
        { expression: '\\text{Check: } W = mgh = 5 \\times 9.8 \\times 10 = 490 \\text{ J} \\checkmark', annotation: 'Confirms the integral gives the same result as the constant-force formula.' },
      ],
      conclusion: 'W = 490 J. For constant gravity, the integral ∫F dx = F·d (force × distance), recovering the familiar formula. The integral approach becomes essential when the force varies — e.g., lifting an object on a spring, or computing gravitational work at heights where g varies significantly.',
    },
    {
      id: 'ch4-005-ex8',
      title: 'Spring Work (Hooke\'s Law)',
      problem: '\\text{A spring has constant } k = 120 \\text{ N/m}. \\text{Find the work required to stretch it from } x=0 \\text{ to } x=0.25 \\text{ m}.',
      visualizationId: 'SpringOscillation',
      steps: [
        { expression: 'F(x) = kx = 120x', annotation: 'Hooke\'s law: force grows linearly with displacement.' },
        { expression: 'W = \\int_0^{0.25} F(x)\\,dx = \\int_0^{0.25} 120x\\,dx', annotation: 'Work is the integral of variable force over displacement.' },
        { expression: '= 120\\left[\\frac{x^2}{2}\\right]_0^{0.25}', annotation: 'Antiderivative of x is x^2/2.' },
        { expression: '= 60(0.25)^2 - 0 = 60(0.0625) = 3.75 \\text{ J}', annotation: 'Evaluate the definite integral.' },
        { expression: '\\text{General formula: } W = \\frac{1}{2}kL^2', annotation: 'For stretching from 0 to L, integral gives the closed form.' },
      ],
      conclusion: 'The spring work is 3.75 J. Because force increases with stretch, this is not force times distance with a constant force; it is the area under the line F(x)=kx, a triangle with area 1/2 kL^2.',
    },
    {
      id: 'ch4-005-ex6',
      title: 'Area Between Two Parabolas',
      problem: '\\text{Find the area between } y = 4-x^2 \\text{ and } y = x^2-4.',
      visualizationId: 'AreaBetweenCurves',
      steps: [
        { expression: '4-x^2 = x^2-4 \\Rightarrow 8 = 2x^2 \\Rightarrow x^2 = 4 \\Rightarrow x = \\pm 2', annotation: 'Find intersections: set the two curves equal. They meet at (−2, 0) and (2, 0).' },
        { expression: '\\text{On } [-2,2]: \\; 4-x^2 \\geq x^2-4 \\text{ (check at } x=0: 4 > -4 \\text{)}', annotation: 'Upper parabola: y=4−x². Lower parabola: y=x²−4.' },
        { expression: 'A = \\int_{-2}^{2}[(4-x^2)-(x^2-4)]\\,dx = \\int_{-2}^{2}(8-2x^2)\\,dx', annotation: 'Upper minus lower: (4−x²)−(x²−4) = 8−2x².' },
        { expression: '= \\left[8x - \\frac{2x^3}{3}\\right]_{-2}^{2}', annotation: 'Antiderivative: ∫(8−2x²)dx = 8x − 2x³/3.' },
        { expression: '= \\left(16 - \\frac{16}{3}\\right) - \\left(-16 + \\frac{16}{3}\\right) = 16-\\frac{16}{3}+16-\\frac{16}{3} = 32 - \\frac{32}{3} = \\frac{96-32}{3} = \\frac{64}{3}', annotation: 'F(2)=16−16/3. F(−2)=−16+16/3. Subtract: 2(16−16/3) = 32−32/3 = 64/3.' },
      ],
      conclusion: 'Area = 64/3 ≈ 21.3 square units. The symmetry property can also be used: the integrand 8−2x² is even, so ∫₋₂²(8−2x²)dx = 2∫₀²(8−2x²)dx = 2[8x−2x³/3]₀² = 2(16−16/3) = 64/3. Same answer.',
    },
    {
      id: 'ch4-005-ex7',
      title: 'Consumer Surplus',
      problem: '\\text{Demand: } D(x) = 100 - 2x \\text{ dollars per unit. Market price: } P^* = 40. \\text{ Find consumer surplus.}',
      steps: [
        { expression: 'D(x^*) = P^* \\Rightarrow 100-2x^* = 40 \\Rightarrow x^* = 30', annotation: 'Find equilibrium quantity: set demand = price. 30 units sold.' },
        { expression: '\\text{CS} = \\int_0^{30}[D(x)-P^*]\\,dx = \\int_0^{30}[(100-2x)-40]\\,dx = \\int_0^{30}(60-2x)\\,dx', annotation: 'Consumer surplus = area under demand curve minus area of price rectangle.' },
        { expression: '= [60x - x^2]_0^{30} = (1800 - 900) - 0 = 900', annotation: 'F(30)=60(30)−30²=1800−900=900. F(0)=0.' },
        { expression: '\\text{CS} = \\$900', annotation: 'Consumers pay 30 × $40 = $1200 total but value the goods at $1200 + $900 = $2100. The $900 is "free surplus" they receive.' },
        { expression: '\\text{Geometric check: the area is a triangle with base 30 and height } D(0)-P^* = 100-40 = 60.', annotation: 'Area of triangle = ½ × 30 × 60 = 900. ✓ Confirms the calculation.' },
      ],
      conclusion: 'Consumer surplus = $900. The demand function is linear, so the surplus region is a triangle with area ½ × base × height = ½ × 30 × 60 = $900. For a nonlinear demand function, the geometric area is not a simple shape, and the integral is essential.',
    },
  ],

  challenges: [
    {
      id: 'ch4-005-ch1',
      difficulty: 'easy',
      problem: 'Find the area enclosed between y = x + 2 and y = x² (a line and a parabola). Find the intersection points first, then integrate.',
      hint: 'Set x+2 = x². Rearrange to x²−x−2=0. Factor or use the quadratic formula. The line is above the parabola between the intersections.',
      walkthrough: [
        { expression: 'x^2 - x - 2 = 0 \\Rightarrow (x-2)(x+1) = 0 \\Rightarrow x = -1, 2', annotation: 'Intersections at x = −1 and x = 2.' },
        { expression: '\\text{On } [-1,2]: x+2 \\geq x^2 \\text{ (check } x=0: 2 > 0 \\text{)}', annotation: 'The line y=x+2 is above the parabola y=x² on the enclosed region.' },
        { expression: 'A = \\int_{-1}^2[(x+2)-x^2]\\,dx = \\left[\\frac{x^2}{2}+2x-\\frac{x^3}{3}\\right]_{-1}^2', annotation: 'Upper minus lower.' },
        { expression: '= \\left(2+4-\\frac{8}{3}\\right)-\\left(\\frac{1}{2}-2+\\frac{1}{3}\\right) = \\frac{10}{3} - \\left(-\\frac{7}{6}\\right) = \\frac{10}{3}+\\frac{7}{6} = \\frac{20+7}{6} = \\frac{27}{6} = \\frac{9}{2}', annotation: 'F(2)=6−8/3=10/3. F(−1)=1/2−2+1/3=3/6−12/6+2/6=−7/6. Difference: 10/3+7/6=27/6=9/2.' },
      ],
      answer: 'A = \\dfrac{9}{2} \\text{ square units}',
    },
    {
      id: 'ch4-005-ch2',
      difficulty: 'medium',
      problem: 'A particle moves with v(t) = t³ − 6t² + 8t m/s for t ∈ [0, 4]. (a) Find all times when the particle changes direction. (b) Find the total displacement. (c) Find the total distance traveled.',
      hint: 'Factor v(t) = t(t−2)(t−4). Zeros at 0, 2, 4. Check sign on (0,2) and (2,4). Displacement = ∫₀⁴ v. Distance = |∫₀²v| + |∫₂⁴v|.',
      walkthrough: [
        { expression: 'v(t) = t(t-2)(t-4): \\text{ zeros at } t=0,2,4.', annotation: 'Factor: v > 0 on (0,2) (test t=1: 1×(−1)×(−3)=3>0), v < 0 on (2,4) (test t=3: 3×1×(−1)=−3<0).' },
        { expression: '\\text{Displacement} = \\int_0^4(t^3-6t^2+8t)\\,dt = \\left[\\frac{t^4}{4}-2t^3+4t^2\\right]_0^4', annotation: 'Antiderivative: t⁴/4 − 2t³ + 4t².' },
        { expression: '= (64-128+64) - 0 = 0', annotation: 'F(4) = 256/4 − 2(64) + 4(16) = 64−128+64 = 0. Displacement = 0.' },
        { expression: '\\int_0^2(t^3-6t^2+8t)\\,dt = \\left[\\frac{t^4}{4}-2t^3+4t^2\\right]_0^2 = (4-16+16)-0 = 4', annotation: 'Forward motion: integral = 4.' },
        { expression: '\\int_2^4(t^3-6t^2+8t)\\,dt = 0-4 = -4', annotation: 'Backward motion: integral = F(4)−F(2) = 0−4 = −4.' },
        { expression: '\\text{Distance} = |4| + |-4| = 4 + 4 = 8 \\text{ m}', annotation: 'Total distance = 4 m forward + 4 m backward = 8 m.' },
      ],
      answer: '\\text{Displacement} = 0 \\text{ m}; \\quad \\text{Distance} = 8 \\text{ m}.',
    },
    {
      id: 'ch4-005-ch3',
      difficulty: 'hard',
      problem: 'A demand curve is D(x) = 50/(x+1) dollars per unit. At market price P* = 10, find (a) the equilibrium quantity x*, (b) consumer surplus, and (c) compare to a linear demand approximation through the same two points.',
      hint: 'Set D(x*)=10: 50/(x*+1)=10 gives x*=4. CS = ∫₀⁴[50/(x+1)−10]dx = [50 ln(x+1)−10x]₀⁴. For the linear approximation, connect (0,50) and (4,10) with a straight line.',
      walkthrough: [
        { expression: 'D(x^*) = 10 \\Rightarrow \\frac{50}{x^*+1} = 10 \\Rightarrow x^*+1 = 5 \\Rightarrow x^* = 4', annotation: 'Market clears at 4 units.' },
        { expression: 'CS = \\int_0^4\\left[\\frac{50}{x+1}-10\\right]dx = \\left[50\\ln(x+1)-10x\\right]_0^4', annotation: 'Consumer surplus integral. Antiderivative of 50/(x+1) is 50 ln(x+1).' },
        { expression: '= (50\\ln 5 - 40) - (50\\ln 1 - 0) = 50\\ln 5 - 40 \\approx 50(1.609)-40 \\approx 80.47-40 = 40.47', annotation: 'Evaluate: ln(5)≈1.609, ln(1)=0.' },
        { expression: '\\text{Linear approx: } L(x) = 50-10x \\text{ (line through } (0,50) \\text{ and } (4,10)\\text{)}', annotation: 'The linear demand through the same two endpoint values.' },
        { expression: 'CS_{\\text{linear}} = \\int_0^4[(50-10x)-10]\\,dx = \\int_0^4(40-10x)\\,dx = [40x-5x^2]_0^4 = 160-80 = 80', annotation: 'Linear CS = triangle with base 4 and height 40: area = ½×4×40=80. The integral confirms.' },
        { expression: 'CS_{\\text{actual}} \\approx 40.47 < CS_{\\text{linear}} = 80', annotation: 'The hyperbolic demand curve lies below the linear approximation for most of [0,4], giving smaller surplus.' },
      ],
      answer: 'CS = 50\\ln 5 - 40 \\approx \\$40.47. \\text{ Linear approximation overestimates surplus at } \\$80.',
    },
    {
      id: 'ch4-005-ch4',
      difficulty: 'hard',
      problem: 'Prove: for any continuous function f on [a,b], the average value f_avg = (1/(b−a))∫ₐᵇ f satisfies m ≤ f_avg ≤ M (where m,M are the min and max of f), and there exists c ∈ (a,b) with f(c) = f_avg. This is the MVT for Integrals — prove it from the EVT, comparison inequalities, and IVT.',
      hint: 'EVT: f attains m = min f and M = max f on [a,b]. Comparison: m(b−a) ≤ ∫f ≤ M(b−a). Divide by (b−a): m ≤ f_avg ≤ M. IVT: f is continuous, takes values m and M, must take f_avg.',
      walkthrough: [
        { expression: '\\text{EVT: } f \\text{ continuous on } [a,b] \\Rightarrow \\exists d,e \\in [a,b]: f(d)=m, f(e)=M.', annotation: 'The Extreme Value Theorem guarantees the minimum m and maximum M are attained.' },
        { expression: 'm \\leq f(x) \\leq M \\text{ for all } x \\in [a,b]', annotation: 'Definition of min and max.' },
        { expression: '\\int_a^b m\\,dx \\leq \\int_a^b f\\,dx \\leq \\int_a^b M\\,dx \\Rightarrow m(b-a) \\leq \\int_a^b f \\leq M(b-a)', annotation: 'Comparison property of integrals: integrating an inequality preserves it. Constant functions integrate to constant × width.' },
        { expression: 'm \\leq \\frac{1}{b-a}\\int_a^b f\\,dx \\leq M \\Rightarrow m \\leq f_{\\text{avg}} \\leq M', annotation: 'Divide through by (b−a) > 0.' },
        { expression: 'f \\text{ is continuous and } f(d) = m \\leq f_{\\text{avg}} \\leq M = f(e). \\text{ By IVT, } \\exists c \\in [d,e] \\subseteq [a,b]: f(c) = f_{\\text{avg}}.', annotation: 'The IVT: a continuous function on an interval takes all intermediate values between any two values it attains. ∎' },
      ],
      answer: '\\text{MVT for Integrals proved: } \\exists c \\in [a,b] \\text{ with } f(c) = f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'The properties of signed area, average value, and comparison inequalities from Lesson 2 are all applied in the application formulas here.' },
    { lessonSlug: 'fundamental-theorem', label: 'Fundamental Theorem of Calculus', context: 'Every definite integral in this lesson is computed via FTC Part 2 using antiderivatives from Lesson 4. Review FTC Part 2 if any evaluations are unclear.' },
    { lessonSlug: 'indefinite-integrals', label: 'Indefinite Integrals', context: 'The antiderivative table from Lesson 4 is the computational tool for all integrals in this lesson.' },
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
    'completed-example-7',
    'completed-example-8',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard-1',
    'attempted-challenge-hard-2',
  ],
}
