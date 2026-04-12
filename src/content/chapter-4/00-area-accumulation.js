// FILE: src/content/chapter-4/00-area-accumulation.js
export default {
  id: 'ch4-000',
  slug: 'area-accumulation',
  chapter: 4,
  order: 0,
  title: 'Area and Accumulation',
  subtitle: 'The area under a rate curve equals the total accumulated quantity — the founding idea of integral calculus',
  tags: ['accumulation', 'area under curve', 'rate functions', 'signed area', 'integral notation', 'velocity', 'displacement', 'net change'],

  hook: {
    question: 'A factory pump pushes water into a tank at a rate that varies over time: r(t) = 20 − 3t litres per minute. How much total water enters the tank over the first 6 minutes? You cannot simply multiply rate × time because the rate is changing at every moment. Yet the answer is completely determined by the function r(t). How do we find it?',
    realWorldContext: 'Accumulation from a varying rate is everywhere in science and engineering. Your electricity meter integrates power (watts) over time to give energy consumed (watt-hours) — every utility bill is an integral. GPS odometers integrate velocity to compute distance traveled. Medical devices integrate blood flow rate to compute total volume delivered. Climate scientists integrate CO₂ emission rates over decades to compute total atmospheric accumulation. A rocket\'s fuel consumption rate is a function of time; total fuel burned is the integral of that rate. Wherever a quantity builds up continuously from a rate that changes, the integral is the tool that computes the total.',
    previewVisualizationId: 'WaterTank',
  },

  intuition: {
    prose: [
      'The simplest accumulation problem is constant rate: if water flows at a steady 5 litres per minute for 3 minutes, the total is 5 × 3 = 15 litres. On a graph of rate r versus time t, the rate is a horizontal line at r = 5. The total accumulated quantity is the area of the rectangle under that line: width 3 (time interval) times height 5 (rate) equals 15. This geometric observation — area under the rate curve equals total accumulated quantity — is the seed of integration.',
      'Now suppose the rate is not constant but changes linearly: r(t) = 3t m/s (a car accelerating from rest). In the first 4 seconds, the rate rises from 0 to 12 m/s. The velocity-time graph is a straight line through the origin. The region under the graph from t = 0 to t = 4 is a right triangle with base 4 and height 12. Its area is ½ × 4 × 12 = 24. The car travels 24 metres. This is not a coincidence — it is the same logic. Distance is area under the velocity curve, because each thin vertical strip of the graph has width dt (a tiny time interval) and height v(t) (speed at that instant), contributing v(t) dt metres to the total.',
      '**One more step before curved functions: a stepped rate.** Suppose water flows at 8 L/min for the first 2 minutes, then 5 L/min for the next 2 minutes, then 2 L/min for the final 2 minutes. You can handle this with pure arithmetic — three rectangles: (8×2) + (5×2) + (2×2) = 16 + 10 + 4 = 30 L. Now imagine the same idea with 10 steps instead of 3: each step narrower, each height matching the actual rate more closely. Then 100 steps. Then 1000. The approximation improves each time. The limit of this process — infinitely many infinitely thin rectangles, each with width dt and height r(t) — is the exact total. That limit is the definite integral. The stepped example is not a warm-up we discard; it is the integral itself, with the slice count taken to infinity.',
      'For curved rate functions, the triangle and rectangle formulas no longer apply directly. But the underlying logic is unchanged. Slice the time axis into many small intervals. In each tiny interval [tᵢ, tᵢ₊₁] of width Δt, the rate barely changes — it is approximately r(tᵢ). The amount accumulated in that slice is approximately r(tᵢ) · Δt, the area of a thin rectangle. Sum all these rectangles, and you have an approximation to the total. The more slices you use, the finer the approximation and the closer you get to the true total. In the limit as the slice width approaches zero, the sum of rectangles becomes the area under the curve exactly.',
      'This limit of sums is the definite integral, written ∫ₐᵇ f(x) dx. The elongated S symbol (∫) stands for "sum" — Leibniz chose it to emphasize that the integral is a limiting summation. The symbol dx represents the infinitesimal width of each slice. The limits a and b mark the start and end of the interval. The entire expression means: "sum up f(x) · dx for every x from a to b." This is the most compact and powerful notation ever invented for an accumulation process.',
      'The connection between area and accumulation has a directional aspect: signed area. If a velocity is negative (moving backward), the contribution to displacement is negative. If a rate function dips below the t-axis, the integral subtracts that portion. The definite integral computes net accumulation — positive contributions minus negative contributions. For total accumulation (ignoring direction), you integrate the absolute value |f(x)|. This signed vs. unsigned distinction is important in applications: displacement (net change in position) uses the signed integral, while total distance traveled uses the integral of |v(t)|.',
      'The historical roots of integration go back to Archimedes, who computed the area of a parabolic segment around 250 BC by exhausting it with triangles — a method strikingly close to modern Riemann sums. Cavalieri in the 1630s summed infinitesimal slices to compute volumes. But the real leap came from Newton and Leibniz in the 1660s–1680s: they independently discovered that the process of accumulation is the inverse of the process of differentiation. This Fundamental Theorem of Calculus — which we develop in Lesson 3 — transforms integration from a geometric puzzle into an algebraic calculation.',
      '**The accumulation function: a new idea.** So far, the definite integral $\\int_a^b f(t)\\,dt$ has been a fixed number — you pin down both limits and get one answer. But now ask a different question: *what if the upper limit is a variable?* Define a new function:',
      '$A(x) = \\int_0^x r(t)\\,dt$',
      'For the water-tank example, $A(x)$ is the total water accumulated from time $0$ up to time $x$. It is not a single number — it changes as $x$ changes. As $x$ increases by a tiny $\\Delta x$, the tank gains approximately $r(x) \\cdot \\Delta x$ more litres (rate times tiny time step). So:',
      '$A(x + \\Delta x) - A(x) \\approx r(x) \\cdot \\Delta x$',
      'Divide both sides by $\\Delta x$ and take the limit as $\\Delta x \\to 0$:',
      '$A\'(x) = r(x)$',
      'The **derivative of the accumulation function is the original rate**. This is the central insight of the Fundamental Theorem of Calculus. In plain language: the rate at which area accumulates at any point is exactly the height of the function at that point. If the water is flowing in fast, the total is growing fast. If the flow slows, the total grows slowly.',
      '**What this means for antiderivatives.** $A(x)$ is a function whose derivative is $r(x)$. That is the definition of an antiderivative. So the accumulation function $A(x) = \\int_0^x r(t)\\,dt$ *is* an antiderivative of $r$ — not an abstract algebraic construct, but a physically meaningful running total.',
      'Conversely, if $F(x)$ is any function with $F\'(x) = r(x)$, then $F$ is also an antiderivative of $r$. Different antiderivatives of the same function differ only by a constant. You can see why: $A(x)$ starts accumulating from $t = 0$, so $A(0) = 0$. If instead you started accumulating from $t = 1$, you would get $B(x) = \\int_1^x r(t)\\,dt = A(x) - A(1)$ — the same function shifted down by a constant $A(1)$. Different starting points give the same shape, offset vertically by a constant.',
      '**Indefinite integral notation.** Because there are infinitely many antiderivatives (one for each starting point, or equivalently one for each vertical shift), we write:',
      '$\\int r(t)\\,dt = F(t) + C$',
      'This is called the **indefinite integral**. The absence of limits means "find any antiderivative." The $+C$ captures all possible vertical shifts — all functions you could get by choosing different starting points for accumulation. This is not mathematical pedantry: the constant $C$ carries real physical information. For the water tank, $C$ is the initial amount already in the tank at $t = 0$. For the car, $C$ is the starting position.',
      '**Three faces of the same idea** (keep these distinct):',
      '— **Definite integral** $\\int_a^b r(t)\\,dt$: a **number** — the total accumulation from $a$ to $b$. Result has units (litres, metres, etc.).',
      '— **Accumulation function** $A(x) = \\int_0^x r(t)\\,dt$: a **specific function** — the running total starting from $0$. Satisfies $A\'(x) = r(x)$ and $A(0) = 0$.',
      '— **Indefinite integral** $\\int r(t)\\,dt = F(t) + C$: a **family of functions** — all antiderivatives, differing by a constant. No starting point is fixed.',
      'The connection between definite and indefinite integrals is the payoff of Lesson 3 (FTC Part 2): once you know any antiderivative $F$, you compute $\\int_a^b r = F(b) - F(a)$. That is why finding antiderivatives (Lesson 4) is the work that makes definite integrals computable by algebra rather than by drawing rectangles.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Reading the ∫ Symbol for the First Time',
        body: 'The elongated S, $\\int$, is Leibniz\'s shorthand for *summa* (Latin: sum). The full notation\n$$\\int_a^b r(t)\\,dt$$\nis read **"the integral from $a$ to $b$ of $r(t)$ dt"** and means:\n\n> Add up $r(t) \\cdot dt$ for every infinitesimal thin slice from $t=a$ to $t=b$.\n\n**$a$, $b$** — the *limits of integration*: where accumulation starts and stops.\n\n**$r(t)$** — the *integrand*: the height of the rectangle at position $t$ (the rate at that instant).\n\n**$dt$** — the *infinitesimal width* of each slice. This is not a number to substitute; it is a signal that $t$ is the variable being summed over.\n\n**The letter $t$** — a *dummy variable*. $\\int_a^b r(t)\\,dt$ and $\\int_a^b r(x)\\,dx$ and $\\int_a^b r(u)\\,du$ all mean the exact same thing. The letter vanishes after integration.',
      },
      {
        type: 'warning',
        title: 'What "dt" (or "dx") Actually Means',
        body: '$dt$ is **not a number** you can cancel, move across an equal sign, or substitute a value into. It carries two pieces of information:\n\n1. **Which variable is being summed** — $\\int r(t)\\,dt$ accumulates over $t$; $\\int r(x)\\,dx$ accumulates over $x$.\n2. **The infinitesimal slice width** in the limit — each rectangle has width $dt$, height $r(t)$, and contributes area $r(t)\\cdot dt$.\n\nLater you will see expressions like $du = 2x\\,dx$ in the substitution rule. That notation works for a precise reason — but at this stage, treat $dt$ as a label for the variable, not as arithmetic.',
      },
      {
        type: 'tip',
        title: 'Units: The Integral Is Dimensionally Meaningful',
        body: 'The result of an integral inherits units by multiplication — *integrand units × variable units*:\n\n— $\\int r(t)\\,dt$ with $r$ in L/min and $t$ in min → **(L/min) × min = L** ✓\n\n— $\\int v(t)\\,dt$ with $v$ in m/s and $t$ in s → **(m/s) × s = m** ✓\n\n— $\\int P(t)\\,dt$ with $P$ in watts and $t$ in hours → **watt·hours** (energy) ✓\n\nThis is a quick sanity check: if the units of your integral don\'t make physical sense, recheck the setup before computing.',
      },
      {
        type: 'prior-knowledge',
        title: 'You Already Know Area Formulas',
        body: 'You can already compute the area under many rate functions using geometry: rectangles (constant rate), triangles (linearly growing rate), trapezoids (linearly changing rate between two values), and semicircles (r(t) = √(R² − t²)). Integration generalizes this to any curve. When the rate function is a straight line or constant, you should always use the geometric formula — it\'s faster and more elegant than any algebraic method.',
      },
      {
        type: 'geometric',
        title: 'Circle Area as Unwrapped Rings',
        body: 'If you cut a circle into many thin rings and unwrap them, they approximate a triangle with base 2πr and height r, giving area (1/2)(2πr)r = πr². This is integration by geometry.',
      },
      {
        type: 'real-world',
        title: 'Every Energy Bill Is an Integral',
        body: 'Your household power consumption P(t) in watts varies minute by minute — it spikes when the kettle switches on and drops when appliances turn off. The total energy consumed in a month (measured in kilowatt-hours and billed accordingly) is ∫₀ᵀ P(t) dt / 1000, where T is the number of hours in the month. Your electricity meter is a hardware integrator, continuously summing P(t) dt and displaying the running total. The same principle underlies data usage meters (integrating bytes/second), water meters (litres/second), and gas meters (cubic feet/second).',
      },
      {
        type: 'geometric',
        title: 'Area Under v(t) = Distance Traveled',
        body: 'For a particle moving along a line with velocity v(t), the displacement over [a, b] is ∫ₐᵇ v(t) dt = the signed area between the velocity curve and the t-axis. Positive velocity (moving right) contributes positive area; negative velocity (moving left) contributes negative area. The net area is the net displacement: final position minus initial position. The total path length (total distance without regard to direction) is ∫ₐᵇ |v(t)| dt.',
      },
      {
        type: 'warning',
        title: 'Area vs. Signed Area',
        body: 'The integral ∫ₐᵇ f(x) dx is the SIGNED area — it subtracts regions where f < 0. If you want the total geometric area (all regions counted positively), integrate |f(x)|. For example, ∫₀^(2π) sin(x) dx = 0 (positive and negative lobes cancel), but ∫₀^(2π) |sin(x)| dx = 4 (both lobes counted positively). Always clarify which you need before computing.',
      },
      {
        type: 'misconception',
        title: '∫ₐᵇ f(x) dx Is NOT Always Positive',
        body: "Many students assume integrals are always positive because they're 'areas.' But ∫₀^π cos(x) dx = 0 — the positive half exactly cancels the negative half. And ∫₀^(3π/2) sin(x) dx = 1, despite the function going negative on [π, 3π/2]. The integral measures SIGNED area. Only ∫|f(x)|dx (the total area) is always ≥ 0.",
      },
      {
        type: 'history',
        title: 'Archimedes and the Quadrature of the Parabola (250 BC)',
        body: "Archimedes proved that the area under a parabola from 0 to 1 is exactly 1/3 of the enclosing rectangle — the same result we get from ∫₀¹ x² dx = 1/3. He did this without calculus, using an infinite geometric series of inscribed triangles. His proof was one of the earliest uses of the 'method of exhaustion,' the ancient precursor to taking limits of Riemann sums.",
      },
      {
        type: 'definition',
        title: 'The Accumulation Function A(x)',
        body: 'Let $f$ be a continuous rate function. The **accumulation function** is:\n$A(x) = \\int_0^x f(t)\\,dt$\nThis is a **function of the upper limit** $x$ — it gives the running total of $f$ from $0$ to $x$. Key fact: $A\'(x) = f(x)$. The rate at which area accumulates equals the height of the curve. This is FTC Part 1.',
      },
      {
        type: 'definition',
        title: 'Antiderivative and Indefinite Integral',
        body: 'A function $F(x)$ is an **antiderivative** of $f(x)$ if $F\'(x) = f(x)$. Because the accumulation function $A(x) = \\int_0^x f(t)\\,dt$ satisfies $A\'(x) = f(x)$, it is one antiderivative. All others differ from it by a constant.\n\nThe **indefinite integral** collects all antiderivatives into one family:\n$\\int f(x)\\,dx = F(x) + C$\nNo limits means "no starting point fixed." The $+C$ represents the unknown initial amount — the constant information that the derivative cannot tell you.',
      },
      {
        type: 'warning',
        title: 'Three Very Different Things That Look Similar',
        body: '**Definite integral** $\\int_a^b f(x)\\,dx$ → a **number** (7, 25, −3.14…). Both limits are fixed.\n\n**Accumulation function** $A(x) = \\int_0^x f(t)\\,dt$ → a **specific function** of $x$. Lower limit is fixed (0), upper is variable.\n\n**Indefinite integral** $\\int f(x)\\,dx = F(x) + C$ → a **family of functions**. No limits at all.\n\nThe $\\int$ symbol appears in all three, but means something different each time. Context — specifically, the presence or absence of limits — determines which one you are dealing with.',
      },
    ],
    visualizations: [
                                            {
        id: 'WaterTank',
        title: 'Variable Flow Rate → Water Accumulation',
        mathBridge: 'The accumulated volume at time $t$ is $V(t) = \\int_0^t r(s)\\,ds$ — the signed area under the rate curve from $0$ to $t$. When $r(t) > 0$ (rate is positive), $V$ increases. When $r(t) < 0$ (water flowing out), $V$ decreases. This is the integral as a running total: $V\'(t) = r(t)$, which is the Fundamental Theorem of Calculus in action.',
        caption: 'The left panel shows the flow rate r(t) over time. The right panel shows the total water volume accumulated. As the rate dips below zero (water flowing out), the total decreases. The accumulated total at any time t is the signed area under the rate curve from 0 to t.',
      },
    ],
  },

  math: {
    prose: [
      'Formally, suppose f is a rate function defined on [a, b]. We introduce the notation ∫ₐᵇ f(x) dx for the total accumulation of f over [a, b]. This is called the definite integral of f from a to b. The variable x is a dummy variable — ∫ₐᵇ f(x) dx and ∫ₐᵇ f(t) dt and ∫ₐᵇ f(u) du all denote the same number. The integral depends only on the function f and the limits a and b, not on the name of the variable of integration.',
      'Three basic properties follow immediately from the signed-area interpretation. First, ∫ₐᵃ f(x) dx = 0: integrating over a zero-width interval accumulates nothing. Second, ∫ₐᵇ f(x) dx = − ∫ᵦᵃ f(x) dx: reversing the limits of integration changes the sign, because we are now "sweeping" in the opposite direction. Third, linearity: ∫ₐᵇ [c·f(x) + g(x)] dx = c·∫ₐᵇ f(x) dx + ∫ₐᵇ g(x) dx for any constants c. These properties let us split, reverse, and scale integrals algebraically.',
      'The additive interval property is essential in applications: ∫ₐᵇ f(x) dx + ∫ᵦᶜ f(x) dx = ∫ₐᶜ f(x) dx. Total accumulation from a to c equals accumulation from a to b plus accumulation from b to c, regardless of where b falls (even outside [a, c]). This property allows us to break complex intervals into simpler pieces and reassemble the result.',
      'Two comparison properties complete the foundation. If f(x) ≥ 0 on [a, b], then ∫ₐᵇ f(x) dx ≥ 0 (the area of a non-negative function is non-negative). If f(x) ≥ g(x) on [a, b], then ∫ₐᵇ f ≥ ∫ₐᵇ g. These allow bounding integrals without computing them exactly: if m ≤ f(x) ≤ M on [a, b], then m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a). This sandwich estimate is useful in numerical analysis and in proving convergence of approximation methods.',
      'The connection between accumulation and antiderivatives gives us a practical method for computing definite integrals. Instead of summing infinitely many rectangles, we look for a function $F$ with $F\'= f$ and compute $F(b) - F(a)$. The simplest cases come directly from reversing the derivative rules you already know. For a constant rate $r(t) = k$: the accumulation from $0$ to $t$ is $kt$, so the antiderivative is $F(t) = kt$ (a rectangle). For a linearly growing rate $r(t) = mt$: the accumulation is a triangle of area $\\frac{1}{2}mt^2$, so $F(t) = \\frac{1}{2}mt^2$. Differentiating confirms: $\\frac{d}{dt}[\\frac{1}{2}mt^2] = mt$. These two cases — which you have been computing geometrically throughout this lesson — are precisely the power rule for integration at $n=0$ and $n=1$.',
      'In general, the **power rule for antidifferentiation** says: if $f(t) = t^n$ ($n \\neq -1$), then $F(t) = \\frac{t^{n+1}}{n+1}$ because $F\'(t) = \\frac{(n+1)t^n}{n+1} = t^n$. This works for any power — including fractional and negative ones. The full toolkit of antiderivative rules is developed in Lesson 4. For this lesson, the key insight is that computing a definite integral $\\int_a^b f(t)\\,dt$ is equivalent to finding any $F$ with $F\' = f$, then computing $F(b) - F(a)$. Every example in this lesson that uses "antiderivative verification" is a preview of exactly that process.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Definite Integral (Informal)',
        body: 'For a function f defined on [a, b], the definite integral\n\\[\\int_a^b f(x)\\,dx\\]\nis the signed area between the graph of f and the x-axis over [a, b]. Regions above the x-axis contribute positively; regions below contribute negatively. The precise definition as a limit of Riemann sums is given in Lesson 1.',
      },
      {
        type: 'theorem',
        title: 'Basic Properties of the Definite Integral',
        body: '\\[\\int_a^a f(x)\\,dx = 0\\]\n\\[\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx\\]\n\\[\\int_a^b [c\\,f(x) + g(x)]\\,dx = c\\int_a^b f(x)\\,dx + \\int_a^b g(x)\\,dx\\]\n\\[\\int_a^b f(x)\\,dx + \\int_b^c f(x)\\,dx = \\int_a^c f(x)\\,dx\\]',
      },
      {
        type: 'theorem',
        title: 'Bounds on Integrals',
        body: 'If \\(m \\leq f(x) \\leq M\\) for all \\(x \\in [a,b]\\), then\n\\[m(b-a) \\leq \\int_a^b f(x)\\,dx \\leq M(b-a).\\]',
      },
      {
        type: 'theorem',
        title: 'FTC Part 1 (Preview): The Accumulation Function',
        body: 'If $f$ is continuous on $[a, b]$, the accumulation function\n$A(x) = \\int_a^x f(t)\\,dt$\nis differentiable and $A\'(x) = f(x)$. In words: **differentiating the running total gives back the rate**. This will be proved rigorously in Lesson 3.',
      },
      {
        type: 'theorem',
        title: 'FTC Part 2 (Preview): Evaluating via Antiderivatives',
        body: 'If $F\'= f$ on $[a,b]$ (i.e., $F$ is any antiderivative of $f$), then\n$\\int_a^b f(x)\\,dx = F(b) - F(a)$\nThis converts area computation into pure algebra: find $F$, plug in the endpoints, subtract. Every "antiderivative verification" step in this lesson\'s examples is using this formula.',
      },
      {
        type: 'tip',
        title: 'The Simplest Antiderivatives Come From This Lesson',
        body: 'Every constant-rate and linear-rate problem in this lesson already uses antiderivatives:\n\n— Constant $r = k$: antiderivative is $F(t) = kt$. Area = rectangle.\n\n— Linear $r = mt$: antiderivative is $F(t) = \\frac{1}{2}mt^2$. Area = triangle.\n\n— Quadratic $r = at^2$: antiderivative is $F(t) = \\frac{a}{3}t^3$. These all follow the **power rule**: $\\int t^n\\,dt = \\frac{t^{n+1}}{n+1} + C$. The full table is in Lesson 4.',
      },
      {
        type: 'warning',
        title: 'The Integral Is Not the Antiderivative',
        body: 'Three related but distinct objects — keep them separate:\n\n**Antiderivative**: a function $F$ satisfying $F\'(x) = f(x)$. It exists on its own, with no integral symbol in sight.\n\n**Definite integral** $\\int_a^b f(x)\\,dx$: a **number** — the signed area. FTC Part 2 (Lesson 3) says you *use* an antiderivative to *compute* it via $F(b) - F(a)$. The antiderivative is the tool; the definite integral is the result.\n\n**Indefinite integral** $\\int f(x)\\,dx = F(x) + C$: shorthand for the entire *family* of antiderivatives — no specific number, no specific starting point.\n\nThe imprecise phrase "the integral of $f$ is $F$" conflates all three. Precise language: *"An antiderivative of $f$ is $F$; the definite integral of $f$ from $a$ to $b$ is $F(b)-F(a)$."*',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The signed-area interpretation of the definite integral is intuitive but not yet mathematically precise. To define ∫ₐᵇ f(x) dx rigorously, we need to specify exactly what "area under a curve" means for a general function f, including functions with corners, kinks, and even discontinuities. The rigorous definition via Riemann sums — developed in Lesson 1 — fills this gap. For now, it suffices to note that the informal definition is consistent with all the properties stated above, and that a formal proof of each property follows directly from the limit definition once it is established.',
      'The property ∫ₐᵇ f = −∫ᵦᵃ f is not merely a convention — it is required for the additive property to be consistent. If ∫ₐᵇ f + ∫ᵦᵃ f were required to equal ∫ₐᵃ f = 0, then ∫ᵦᵃ f = −∫ₐᵇ f follows by algebra. So the reversed-limits sign rule is dictated by the interval additivity property. Once we define the integral via Riemann sums for a ≤ b, we extend the definition to a > b by declaring ∫ᵦᵃ f = −∫ₐᵇ f.',
      'The linearity property — ∫(cf + g) = c∫f + ∫g — has deep consequences. It means the integral is a linear functional on the space of integrable functions. The set of Riemann-integrable functions on [a, b] forms a vector space, and the map f ↦ ∫ₐᵇ f(x) dx is a linear map from that vector space to ℝ. Linear functionals are central objects in functional analysis and underlie the theory of distributions (which extends integration to "generalized functions" like the Dirac delta). The simple linearity property of the integral is the entry point to one of the richest areas of modern mathematics.',
      'The bound m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a) has a celebrated consequence: the Mean Value Theorem for Integrals. If f is continuous on [a, b], then the average value (1/(b−a))∫ₐᵇ f lies between m and M, and by the Intermediate Value Theorem applied to f, there exists a point c ∈ (a, b) where f(c) equals this average. This MVT for integrals is the integral analog of the derivative MVT and is used in the proof of the Fundamental Theorem of Calculus.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Mean Value Theorem for Integrals',
        body: 'If f is continuous on [a, b], then there exists c ∈ (a, b) such that\n\\[\\int_a^b f(x)\\,dx = f(c)(b-a).\\]\nIn other words, f attains its average value at some interior point.',
      },
      {
        type: 'warning',
        title: 'The Integral Is a Number, Not a Function',
        body: '\\(\\int_a^b f(x)\\,dx\\) is a real number — the value depends on f, a, and b, but not on x. The x is a "dummy variable" that disappears after integration. Do not confuse the definite integral \\(\\int_a^b f(x)\\,dx\\) (a number) with the indefinite integral \\(\\int f(x)\\,dx\\) (a family of functions), or with the accumulation function \\(A(x) = \\int_a^x f(t)\\,dt\\) (a function of the upper limit).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-000-ex1',
      title: 'Distance from a Triangular Velocity Profile',
      problem: '\\text{A car accelerates from rest with velocity } v(t) = 3t \\text{ m/s for } t \\in [0, 4]. \\text{ Find the total distance traveled.}',
      visualizationId: 'WaterTank',
      steps: [
        { expression: '\\text{Graph: } v(t) = 3t \\text{ is a straight line through the origin, reaching } v(4) = 12 \\text{ m/s.}', annotation: 'The velocity-time graph is a straight line from (0,0) to (4,12). The region under it is a right triangle.' },
        { expression: '\\text{Area of triangle} = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times 4 \\times 12 = 24 \\text{ m}', annotation: 'Distance = area under v(t). The triangle has base 4 (time) and height 12 (speed at t=4).' },
        { expression: '\\int_0^4 3t\\,dt = \\left[\\frac{3t^2}{2}\\right]_0^4 = \\frac{3(16)}{2} - 0 = 24 \\text{ m}', annotation: 'Verification using antiderivatives (from Lesson 3): the antiderivative of 3t is 3t²/2. Evaluating at t=4 and t=0 gives 24 − 0 = 24 m.' },
        { expression: '\\text{The triangle formula and the integral agree: distance} = 24 \\text{ m.}', annotation: 'The geometric and algebraic approaches are two faces of the same calculation.' },
      ],
      conclusion: 'The car travels 24 metres in the first 4 seconds. The velocity-time graph is a right triangle, and its area gives the displacement. This confirms the core idea: distance = area under the velocity curve.',
    },
    {
      id: 'ch4-000-ex2',
      title: 'Water Tank: Linear Flow Rate',
      problem: '\\text{Water flows into a tank at } r(t) = 10 - 2t \\text{ L/min for } t \\in [0, 5]. \\text{ How much total water enters the tank?}',
      steps: [
        { expression: '\\text{At } t=0: r = 10. \\text{ At } t=5: r = 10 - 10 = 0. \\text{ The flow rate decreases linearly to zero.}', annotation: 'The rate function r(t) is a straight line from 10 (at t=0) to 0 (at t=5). The flow is always non-negative on this interval, so no water flows OUT.' },
        { expression: '\\text{The region under } r(t) \\text{ on } [0,5] \\text{ is a right triangle with base 5 and height 10.}', annotation: 'Draw the graph: r(0)=10, r(5)=0. The region is a right triangle.' },
        { expression: '\\text{Total water} = \\frac{1}{2} \\times 5 \\times 10 = 25 \\text{ L}', annotation: 'Area of right triangle = ½ × base × height = ½ × 5 × 10 = 25 litres.' },
        { expression: '\\int_0^5 (10 - 2t)\\,dt = \\left[10t - t^2\\right]_0^5 = (50 - 25) - 0 = 25 \\text{ L}', annotation: 'Antiderivative confirmation: ∫(10−2t)dt = 10t−t². Evaluated at 5 minus at 0 gives 25.' },
      ],
      conclusion: '25 litres enter the tank over 5 minutes. The flow rate decreases linearly from 10 to 0, forming a right triangle in the rate-time graph. Area = ½ × 5 × 10 = 25 L.',
    },
    {
      id: 'ch4-000-ex3',
      title: 'Estimating Distance from a Velocity Graph (No Formula)',
      problem: '\\text{A runner\'s velocity (m/s) is read from a graph at } t = 0, 2, 4, 6, 8, 10 \\text{ s: values are } 0, 3, 5, 4, 2, 0. \\text{ Estimate the total distance.}',
      steps: [
        { expression: '\\text{No formula is given — we use the area interpretation directly.}', annotation: 'When the velocity function is given as a graph or table, we estimate the area by geometric methods.' },
        { expression: '\\text{Approximation: connect the points with straight lines, compute area as trapezoids.}', annotation: 'Trapezoidal rule: each pair of adjacent readings forms a trapezoid. Area = ½(v₁+v₂) × Δt.' },
        { expression: '[0,2]: \\tfrac{1}{2}(0+3)(2) = 3 \\quad [2,4]: \\tfrac{1}{2}(3+5)(2) = 8 \\quad [4,6]: \\tfrac{1}{2}(5+4)(2) = 9', annotation: 'Trapezoid areas for the first three intervals.' },
        { expression: '[6,8]: \\tfrac{1}{2}(4+2)(2) = 6 \\quad [8,10]: \\tfrac{1}{2}(2+0)(2) = 2', annotation: 'Trapezoid areas for the last two intervals.' },
        { expression: '\\text{Total} \\approx 3 + 8 + 9 + 6 + 2 = 28 \\text{ m}', annotation: 'Sum all trapezoid areas. The runner travels approximately 28 metres.' },
      ],
      conclusion: 'Without a formula, we estimate area using trapezoids — averaging adjacent velocity readings and multiplying by the time width. The runner traveled approximately 28 m. This is essentially the trapezoidal rule for numerical integration, covered more formally in Lesson 1.',
    },
    {
      id: 'ch4-000-ex4',
      title: 'Electricity Usage: Writing the Integral',
      problem: '\\text{A building\'s power consumption is } P(t) = 200 + 50\\cos(\\pi t / 12) \\text{ watts, where } t \\text{ is hours. Write the integral for total energy used over 24 hours, and evaluate the average power.}',
      steps: [
        { expression: 'E = \\int_0^{24} P(t)\\,dt = \\int_0^{24} \\left(200 + 50\\cos\\!\\left(\\frac{\\pi t}{12}\\right)\\right) dt', annotation: 'Total energy (in watt-hours) is the definite integral of power over the 24-hour period.' },
        { expression: '\\int_0^{24} 200\\,dt = 200 \\times 24 = 4800 \\text{ Wh}', annotation: 'The constant term contributes 200 × 24 = 4800 watt-hours (using ∫constant = constant × width).' },
        { expression: '\\int_0^{24} 50\\cos\\!\\left(\\frac{\\pi t}{12}\\right)dt = 50 \\cdot \\frac{12}{\\pi}\\left[\\sin\\!\\left(\\frac{\\pi t}{12}\\right)\\right]_0^{24} = \\frac{600}{\\pi}(\\sin(2\\pi) - \\sin(0)) = 0', annotation: 'The cosine term integrates to zero over a full period (24 hours = 2 full periods of the cosine). The oscillation contributes no net energy.' },
        { expression: 'E = 4800 + 0 = 4800 \\text{ Wh} = 4.8 \\text{ kWh}', annotation: 'Total energy is 4800 watt-hours = 4.8 kilowatt-hours over 24 hours.' },
        { expression: 'P_{\\text{avg}} = \\frac{1}{24}\\int_0^{24} P(t)\\,dt = \\frac{4800}{24} = 200 \\text{ W}', annotation: 'Average power = total energy / time. The oscillation averages out; the average power is just the constant term 200 W.' },
      ],
      conclusion: 'Total energy = 4.8 kWh; average power = 200 W. The cosine fluctuation (daytime peaks, nighttime troughs) contributes zero net energy over a full 24-hour cycle. This illustrates the key property: ∫cos = sin, and sin(2π)−sin(0) = 0.',
    },
    {
      id: 'ch4-000-ex5',
      title: 'CO₂ Accumulation: Interpreting a Definite Integral',
      problem: '\\text{Global CO}_2 \\text{ emissions follow } R(t) = 40 + 2t \\text{ billion tonnes/year, where } t \\text{ is years since 2010. Interpret } \\int_0^{10} R(t)\\,dt \\text{ and compute it.}',
      steps: [
        { expression: '\\int_0^{10} R(t)\\,dt = \\int_0^{10}(40 + 2t)\\,dt', annotation: 'The integral of an emission rate over time gives the total cumulative emissions over that period — in this case, from 2010 to 2020.' },
        { expression: '= \\left[40t + t^2\\right]_0^{10} = (400 + 100) - 0 = 500 \\text{ billion tonnes}', annotation: 'Antiderivative: ∫(40+2t)dt = 40t+t². Evaluate at t=10: 400+100=500. Subtract the value at t=0 (which is 0).' },
        { expression: '\\text{Interpretation: 500 billion tonnes of CO}_2 \\text{ was emitted globally from 2010 to 2020.}', annotation: 'The definite integral converts the time-varying emission rate into a total cumulative quantity.' },
        { expression: '\\text{Geometric check: trapezoid with } R(0)=40, \\; R(10)=60, \\; \\text{width}=10.', annotation: 'Area = ½(40+60)×10 = ½×100×10 = 500. Confirms the calculation.' },
      ],
      conclusion: '500 billion tonnes of CO₂ were emitted over the decade. The integral converts a rate (tonnes/year) into a quantity (tonnes), just as integrating speed (m/s) gives distance (m). The units work out: [tonnes/year] × [year] = [tonnes].',
    },
    {
      id: 'ch4-000-ex6',
      title: 'Physics Derivation: Why Displacement = ∫v dt',
      problem: '\\text{Starting from Newton\'s second law, derive why displacement equals the integral of velocity.}',
      steps: [
        { expression: 'v(t) = \\frac{dx}{dt}', annotation: 'By definition, velocity is the derivative of position with respect to time. This is the starting point.' },
        { expression: '\\text{Over a tiny time interval } [t, t+dt]: \\; dx \\approx v(t)\\,dt', annotation: 'Rearranging: dx = v(t) dt. The infinitesimal change in position equals velocity times the infinitesimal time step. This is just the linearisation of x(t) over dt.' },
        { expression: '\\text{Total displacement} = \\sum_{\\text{all intervals}} v(t_i)\\,dt', annotation: 'Sum all infinitesimal displacements over the full time interval [a, b]. This is a Riemann sum for v(t).' },
        { expression: 'x(b) - x(a) = \\lim_{dt \\to 0} \\sum v(t_i)\\,dt = \\int_a^b v(t)\\,dt', annotation: 'As dt → 0, the sum converges to the definite integral. This is the Fundamental Theorem of Calculus applied to velocity and position.' },
        { expression: '\\text{Similarly, velocity = } \\int a\\,dt \\text{ (momentum accumulates from force: } p = \\int F\\,dt \\text{)}', annotation: 'The same logic gives: velocity = integral of acceleration; momentum = integral of force (impulse-momentum theorem).' },
      ],
      conclusion: 'Displacement = ∫v dt is not a formula imposed from outside — it follows directly from the definition v = dx/dt. The integral undoes the derivative. This is the Fundamental Theorem of Calculus in physical disguise, and it motivates the entire development in Lesson 3.',
    },
    {
      id: 'ch4-000-ex7',
      title: 'The Accumulation Function: Area as a Function of the Upper Limit',
      problem: 'The water tank from Example 2 fills at $r(t) = 10 - 2t$ L/min. Instead of asking "how much water after 5 minutes?", ask: **how much water has entered the tank by time $x$?** Build the accumulation function $A(x) = \\int_0^x (10-2t)\\,dt$ and explore what it tells us.',
      steps: [
        {
          expression: 'A(x) = \\int_0^x (10 - 2t)\\,dt',
          annotation: 'We have turned the upper limit into a variable $x$. Now $A$ is a **function** of $x$, not just a single number. This is the key conceptual shift: area as a machine that accepts a time and returns total volume.',
        },
        {
          expression: 'A(x) = \\left[10t - t^2\\right]_0^x = (10x - x^2) - (0 - 0) = 10x - x^2',
          annotation: 'The antiderivative of $10-2t$ is $10t - t^2$ (power rule: $\\int 2t\\,dt = t^2$). Evaluate from $0$ to $x$ by plugging $t=x$ into the antiderivative and subtracting the value at $t=0$ (which is zero).',
        },
        {
          expression: 'A(0) = 10(0) - 0^2 = 0',
          annotation: 'The tank starts empty — no surprise. But notice: this is built into the formula automatically because we chose the lower limit to be 0. The initial condition $A(0) = 0$ is satisfied by construction.',
        },
        {
          expression: "A'(x) = \\frac{d}{dx}(10x - x^2) = 10 - 2x = r(x)",
          annotation: '**The accumulation function differentiates back to the rate.** This is the FTC Part 1 — differentiate the area function and you recover the integrand. The rate of change of the running total is the current rate. Geometrically: as $x$ increases by a sliver $dx$, the new area added is approximately $r(x)\\cdot dx$.',
        },
        {
          expression: 'A(5) = 10(5) - 5^2 = 50 - 25 = 25 \\text{ L}',
          annotation: 'Recover the answer from Example 2 instantly. No integral to compute — just evaluate $A(5)$. This is the power of the antiderivative: you do the calculus **once** (find $F$ with $F\'=r$), then answer any "total by time $x$" question by simple substitution.',
        },
        {
          expression: 'V(x) = 10x - x^2 + C, \\quad C = V_0 \\text{ (initial water in tank)}',
          annotation: 'If the tank starts with $V_0$ liters already inside, the total volume at time $x$ is $A(x) + V_0 = 10x - x^2 + V_0$. The constant $C$ encodes the initial condition. Every function of the form $10x - x^2 + C$ has the same derivative $10-2x$ — that is the whole family of antiderivatives, and the $+C$ is the mathematical trace of "which starting amount."',
        },
      ],
      conclusion: 'This example makes the leap from "the definite integral is a number" to "the indefinite integral is a family of functions." The formula $A(x) = 10x - x^2$ is one member of that family — the one with $A(0) = 0$. Every member differs only in how full the tank was at $t=0$. Lesson 4 will build the full toolkit for finding antiderivatives of any rate function.',
    },
  ],

  challenges: [
    {
      id: 'ch4-000-ch1',
      difficulty: 'easy',
      problem: 'A car moves at constant velocity v = 30 m/s for t ∈ [0, 5] s. (a) Compute the displacement using the rectangle formula. (b) Write this as a definite integral and verify using the antiderivative.',
      hint: 'The velocity-time graph is a horizontal line at v = 30. Area = base × height. The antiderivative of a constant v is vt.',
      walkthrough: [
        { expression: '\\text{(a) Rectangle: area} = \\text{base} \\times \\text{height} = 5 \\times 30 = 150 \\text{ m}', annotation: 'Simple rectangle: width 5 seconds, height 30 m/s.' },
        { expression: '\\text{(b) } \\int_0^5 30\\,dt = \\left[30t\\right]_0^5 = 150 - 0 = 150 \\text{ m}', annotation: 'The antiderivative of 30 is 30t. Evaluate from 0 to 5.' },
      ],
      answer: '\\text{Displacement} = 150 \\text{ m}',
    },
    {
      id: 'ch4-000-ch2',
      difficulty: 'medium',
      problem: 'A cyclist\'s velocity profile is v(t) = 6t − t² m/s for t ∈ [0, 6]. (a) Sketch the velocity-time graph and identify when v = 0. (b) Use the geometric area of a parabolic region to estimate the distance traveled. The exact area under a parabola f(t)=6t−t² from 0 to 6 is ∫₀⁶(6t−t²)dt — compute this using antiderivatives.',
      hint: 'v(0) = 0 and v(6) = 0. Maximum velocity at t = 3: v(3) = 9 m/s. The antiderivative of 6t−t² is 3t²−t³/3.',
      walkthrough: [
        { expression: 'v(t) = 6t - t^2 = t(6-t)', annotation: 'Factor: v = 0 at t = 0 and t = 6. Maximum at t = 3 where v(3) = 18 − 9 = 9 m/s.' },
        { expression: '\\int_0^6 (6t - t^2)\\,dt = \\left[3t^2 - \\frac{t^3}{3}\\right]_0^6', annotation: 'Antiderivative: ∫6t dt = 3t², ∫t² dt = t³/3.' },
        { expression: '= \\left(3(36) - \\frac{216}{3}\\right) - 0 = 108 - 72 = 36 \\text{ m}', annotation: 'Evaluate at t=6: 3×36 = 108, 216/3 = 72. Subtract: 36 m.' },
      ],
      answer: '\\displaystyle\\int_0^6 (6t-t^2)\\,dt = 36 \\text{ m}',
    },
    {
      id: 'ch4-000-ch3',
      difficulty: 'hard',
      problem: 'A particle moves with velocity v(t) = e^(−t) m/s for t ∈ [0, ∞). (a) Explain why the total distance traveled in infinite time is finite. (b) Compute ∫₀^∞ e^(−t) dt as the limit lim_{b→∞} ∫₀ᵇ e^(−t) dt. (c) Interpret the result physically.',
      hint: 'The antiderivative of e^(−t) is −e^(−t). As b→∞, e^(−b)→0. The velocity decays exponentially — the particle slows down so rapidly that it only ever travels a finite total distance.',
      walkthrough: [
        { expression: '\\int_0^b e^{-t}\\,dt = \\left[-e^{-t}\\right]_0^b = -e^{-b} + e^0 = 1 - e^{-b}', annotation: 'Antiderivative of e^{−t} is −e^{−t}. Evaluate from 0 to b.' },
        { expression: '\\lim_{b \\to \\infty}(1 - e^{-b}) = 1 - 0 = 1 \\text{ m}', annotation: 'As b → ∞, e^{−b} → 0. The total area under the curve is exactly 1.' },
        { expression: '\\text{Physical interpretation: the particle starts at } v = 1 \\text{ m/s and decelerates exponentially. It travels exactly 1 m total, forever asymptotically approaching a fixed point.}', annotation: 'Even though time is infinite, the total distance is finite because the velocity decays fast enough. This is analogous to the geometric series: 1 + 1/2 + 1/4 + ... = 2 (finite sum of infinitely many terms).' },
      ],
      answer: '\\displaystyle\\int_0^\\infty e^{-t}\\,dt = 1 \\text{ m}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'riemann-sums', label: 'Riemann Sums', context: 'This lesson introduced area informally. Lesson 1 makes it precise via Riemann sums — the rigorous limiting process that defines the definite integral.' },
    { lessonSlug: 'fundamental-theorem', label: 'Fundamental Theorem of Calculus', context: 'The connection between area (integration) and antiderivatives (differentiation) is made explicit by the Fundamental Theorem in Lesson 3. Everything in this lesson anticipates that theorem.' },
    { lessonSlug: 'indefinite-integrals', label: 'Indefinite Integrals', context: 'Computing definite integrals algebraically requires antiderivatives. Lesson 4 builds the antiderivative toolkit.' },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "area under a curve",
            "meaning": "the region between the function graph and the x-axis — counted positively above, negatively below"
        },
        {
            "symbol": "accumulation",
            "meaning": "the running total of the area as the upper limit x increases"
        },
        {
            "symbol": "signed area",
            "meaning": "area above x-axis is positive; area below is negative — the two can cancel"
        }
    ],
    "rulesOfThumb": [
        "Think physically: if f(t) is rate of flow (gallons/min), the area under f from 0 to T is total gallons accumulated.",
        "The accumulation function A(x) = ∫₀ˣ f(t) dt is a new function of x — its derivative is f(x) (this is the FTC!).",
        "Negative regions do not mean the area calculation is wrong — they represent net change, not total change."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch2-tangent-problem",
            "label": "Ch. 2: The Derivative",
            "note": "The derivative asks: how fast is f changing at x? The integral asks: how much of f has accumulated from a to x? These are inverse questions — and the FTC makes that inversion precise."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch4-riemann-sums",
            "label": "Next: Riemann Sums",
            "note": "Area accumulation is formalized through Riemann sums — approximating curved areas with rectangles. The limit of those sums defines the definite integral."
        },
        {
            "lessonId": "ch4-fundamental-theorem",
            "label": "Ch. 4: Fundamental Theorem",
            "note": "FTC Part 1 says: d/dx[A(x)] = f(x). The derivative of the accumulation function is f itself. This lesson introduces that idea intuitively before the formal proof."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "aa-assess-1",
            "type": "choice",
            "text": "If f(t) is the rate of fuel consumption in gallons/hour, what does ∫₀³ f(t) dt represent?",
            "options": [
                "The fuel consumption rate at t=3",
                "Total gallons consumed from hour 0 to hour 3",
                "Average consumption rate",
                "Instantaneous rate at some moment"
            ],
            "answer": "Total gallons consumed from hour 0 to hour 3",
            "hint": "Integrating a rate gives accumulated quantity. Area under a rate curve = total amount."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Integral = accumulated area (signed: positive above, negative below)",
    "Rate × time = amount (integral generalizes this)",
    "A(x) = ∫₀ˣ f(t) dt is a new function; its derivative is f(x)"
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
      id: 'area-accum-q1',
      type: 'input',
      text: 'A car moves with velocity \\(v(t) = 4\\) m/s (constant) for \\(t \\in [0, 5]\\). The displacement equals the area of the rectangle under the velocity curve. What is the displacement (in metres)?',
      answer: '20',
      hints: ['Area of a rectangle = width × height.', 'Width = 5 − 0 = 5, height = 4.'],
      reviewSection: 'Intuition — Area as accumulation',
    },
    {
      id: 'area-accum-q2',
      type: 'input',
      text: 'A car accelerates from rest with velocity \\(v(t) = 6t\\) m/s. The velocity–time graph is a straight line through the origin. Use geometry (triangle area) to find the total displacement from \\(t = 0\\) to \\(t = 4\\). Enter your answer in metres (just the number).',
      answer: '48',
      hints: ['The region under \\(v(t)=6t\\) on [0,4] is a right triangle.', 'Area = ½ × base × height. Height = v(4) = 24.'],
      reviewSection: 'Intuition — Triangular area for linear rate',
    },
    {
      id: 'area-accum-q3',
      type: 'choice',
      text: 'The definite integral \\(\\int_a^b f(x)\\,dx\\) computes:',
      options: [
        'The slope of \\(f\\) at \\(x = a\\)',
        'The net signed area between \\(f\\) and the \\(x\\)-axis on \\([a,b]\\)',
        'The maximum value of \\(f\\) on \\([a,b]\\)',
        'The average rate of change of \\(f\\) on \\([a,b]\\)',
      ],
      answer: 'The net signed area between \\(f\\) and the \\(x\\)-axis on \\([a,b]\\)',
      hints: ['Regions above the axis are positive, below are negative.'],
      reviewSection: 'Intuition — Signed area',
    },
    {
      id: 'area-accum-q4',
      type: 'input',
      text: 'Using geometry, evaluate \\(\\int_0^3 2x\\,dx\\). The graph is a straight line through the origin; the region under it is a triangle.',
      answer: '9',
      hints: ['Area = ½ × base × height.', 'At x = 3, f(3) = 6. So area = ½ × 3 × 6.'],
      reviewSection: 'Math — Geometric evaluation',
    },
    {
      id: 'area-accum-q5',
      type: 'input',
      text: 'The accumulation function is defined as \\(A(x) = \\int_0^x f(t)\\,dt\\). If \\(f(t) = 3\\) (constant), what is \\(A(5)\\)?',
      answer: '15',
      hints: ['A(x) = 3x for a constant rate of 3.', 'A(5) = 3 × 5.'],
      reviewSection: 'Math — Accumulation function',
    },
    {
      id: 'area-accum-q6',
      type: 'choice',
      text: 'If \\(f(x) < 0\\) on the interval \\([a,b]\\), then \\(\\int_a^b f(x)\\,dx\\) is:',
      options: ['Positive', 'Zero', 'Negative', 'Undefined'],
      answer: 'Negative',
      hints: ['Area below the \\(x\\)-axis contributes negatively to the signed integral.'],
      reviewSection: 'Intuition — Signed area',
    },
    {
      id: 'area-accum-q7',
      type: 'input',
      text: 'A pump runs at rate \\(r(t) = 10\\) litres/min for 3 minutes, then at \\(r(t) = 5\\) litres/min for 2 minutes. What is the total volume (litres) accumulated?',
      answer: '40',
      hints: ['Split into two constant-rate intervals.', 'Total = 10×3 + 5×2.'],
      reviewSection: 'Intuition — Piecewise accumulation',
    },
    {
      id: 'area-accum-q8',
      type: 'input',
      text: 'Using geometry, evaluate \\(\\int_{-2}^{2} \\sqrt{4 - x^2}\\,dx\\). The graph of \\(y = \\sqrt{4-x^2}\\) is the upper half of a circle of radius 2.',
      answer: '2*pi',
      hints: ['Area of a semicircle of radius \\(r\\) is \\(\\frac{1}{2}\\pi r^2\\).', 'Here \\(r = 2\\), so area = ½π(4) = 2π.'],
      reviewSection: 'Math — Geometric evaluation (semicircle)',
    },
    {
      id: 'area-accum-q9',
      type: 'choice',
      text: 'The elongated S symbol \\(\\int\\) in integral notation was chosen by Leibniz to represent:',
      options: ['Slope', 'Sum', 'Surface', 'Secant'],
      answer: 'Sum',
      hints: ['The integral is defined as a limit of sums of thin rectangles.'],
      reviewSection: 'Intuition — Notation',
    },
    {
      id: 'area-accum-q10',
      type: 'input',
      text: 'A velocity function is \\(v(t) = t\\) on \\([0, 6]\\). The car travels from \\(t=0\\) to \\(t=6\\). Use the triangle area formula to find the total displacement. Enter your answer in metres (just the number).',
      answer: '18',
      hints: ['The area is a right triangle with base 6 and height v(6) = 6.', 'Area = ½ × 6 × 6 = 18.'],
      reviewSection: 'Intuition — Triangle area for linear velocity',
    },
    {
      id: 'area-accum-q11',
      type: 'choice',
      text: 'The accumulation function \\(A(x) = \\int_0^x r(t)\\,dt\\) measures the total amount accumulated by time \\(x\\). Which of the following is true?',
      options: [
        '\\(A\'(x) = A(x)\\) — the accumulation function equals its own derivative',
        '\\(A\'(x) = r(x)\\) — the derivative of the running total is the current rate',
        '\\(A\'(x) = \\int_0^x r\'(t)\\,dt\\) — you differentiate inside the integral',
        '\\(A\'(x) = r(0)\\) — the derivative equals the initial rate',
      ],
      answer: '\\(A\'(x) = r(x)\\) — the derivative of the running total is the current rate',
      hints: [
        'Think physically: if water is entering at rate $r(x)$ right now, how fast is the total volume growing at this moment?',
        'The rate of change of accumulated amount equals the current rate. This is FTC Part 1.',
      ],
      reviewSection: 'Math — Accumulation function and FTC Part 1',
    },
    {
      id: 'area-accum-q12',
      type: 'input',
      text: 'The water tank from Example 2 has inflow rate \\(r(t) = 10 - 2t\\) L/min. The antiderivative is \\(F(t) = 10t - t^2\\). Use the FTC formula \\(\\int_a^b r(t)\\,dt = F(b) - F(a)\\) to compute \\(\\int_0^5 (10-2t)\\,dt\\).',
      answer: '25',
      hints: [
        'Compute $F(5) = 10(5) - 5^2 = 50 - 25 = 25$.',
        'Compute $F(0) = 10(0) - 0^2 = 0$.',
        'Answer: $F(5) - F(0) = 25 - 0 = 25$.',
      ],
      reviewSection: 'Math — FTC Part 2 preview (evaluating via antiderivatives)',
    },
  ],
}
