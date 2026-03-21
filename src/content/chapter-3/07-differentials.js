// FILE: src/content/chapter-3/07-differentials.js
export default {
  id: 'ch3-070',
  slug: 'differentials',
  chapter: 3,
  order: 7,
  title: 'Differentials',
  subtitle: 'The notation dy = f\'(x)dx is not just shorthand — it is a precise tool for estimating errors and bridging derivatives to integrals',
  tags: ['differentials', 'dx', 'dy', 'error estimation', 'propagation', 'relative error', 'linear approximation', 'uncertainty'],

  hook: {
    question: 'A spherical tank has a measured radius of 10 meters with a possible error of $\\pm 0.05$ m. The volume $V = \\frac{4}{3}\\pi r^3$ is used to determine how much liquid the tank holds. How much error in the volume does the measurement error in the radius produce?',
    realWorldContext: "Every physical measurement has uncertainty. A machinist cuts a part to 5.00 cm but the tolerance is $\\pm 0.01$ cm. A surveyor measures an angle to within $\\pm 0.1°$. A chemist weighs a sample to $\\pm 0.001$ g. When these measured values are plugged into formulas — areas, volumes, concentrations, forces — the uncertainties propagate through the calculation. Differentials give a clean, systematic way to estimate how errors in inputs produce errors in outputs. The differential $dy = f'(x)\\,dx$ is the linear approximation reframed: instead of approximating the function, we approximate the change in the function. This perspective is fundamental in physics, engineering, and experimental science, and it provides the conceptual bridge from derivatives to integrals.",
    previewVisualizationId: 'LinearApproximation',
  },

  intuition: {
    prose: [
      "You already know linear approximation: $f(x + \\Delta x) \\approx f(x) + f'(x) \\cdot \\Delta x$ when $\\Delta x$ is small. Differentials repackage this idea with a subtle but important shift in emphasis. Instead of approximating the value of $f$ at a nearby point, we approximate the change in $f$. The actual change is $\\Delta y = f(x + \\Delta x) - f(x)$. The approximate change is $dy = f'(x)\\,dx$, where $dx = \\Delta x$ is the change in $x$. The approximation says $\\Delta y \\approx dy$ when $dx$ is small.",
      "What are $dx$ and $dy$ as standalone objects? Think of $dx$ as an independent variable — it represents an arbitrary (small) increment in $x$. Given $dx$, the differential $dy = f'(x)\\,dx$ is defined to be the change along the tangent line, not the change along the curve. The actual change $\\Delta y$ follows the curve; the differential $dy$ follows the tangent. For small $dx$, the tangent and the curve are nearly identical, so $\\Delta y \\approx dy$.",
      "This notation has enormous power in physics and engineering. When a physicist writes $dW = F\\,dx$ (work equals force times displacement) or $dQ = mc\\,dT$ (heat equals mass times specific heat times temperature change), they are using differentials. The equation $dy = f'(x)\\,dx$ looks like you can divide both sides by $dx$ to get $dy/dx = f'(x)$, and indeed this is consistent — differentials are designed so that the ratio $dy/dx$ recovers the derivative. This is why Leibniz notation works so well: the derivative literally is the ratio of differentials.",
      "Error estimation is the most practical application of differentials. Suppose you measure $x$ with an error of $\\pm\\Delta x$. The resulting error in $y = f(x)$ is approximately $\\Delta y \\approx dy = f'(x)\\,\\Delta x$. This converts an error in the input to an error in the output through the derivative. The derivative acts as an amplification factor: if $|f'(x)|$ is large, small input errors produce large output errors; if $|f'(x)|$ is small, the output is insensitive to input errors.",
      "Relative error is often more meaningful than absolute error. If you measure a length as 100 m $\\pm$ 1 m, the relative error is $1/100 = 1\\%$. If you measure it as 10 m $\\pm$ 1 m, the relative error is $1/10 = 10\\%$ — much worse, even though the absolute error is the same. The relative error in $y$ is $\\frac{dy}{y} = \\frac{f'(x)}{f(x)}\\,dx$. For $y = x^n$, this gives $\\frac{dy}{y} = n\\frac{dx}{x}$: the relative error in $x^n$ is $n$ times the relative error in $x$. A 1\\% error in the radius of a sphere produces a 3\\% error in its volume ($V \\propto r^3$).",
      "Differentials also connect derivatives to integrals conceptually. The equation $dy = f'(x)\\,dx$ says that the total change in $y$ is the accumulation of tiny changes $f'(x)\\,dx$. Summing these infinitesimal changes from $a$ to $b$ gives $\\int_a^b f'(x)\\,dx = f(b) - f(a)$ — the Fundamental Theorem of Calculus. The integral literally sums up the differentials. This is why the notation $\\int f(x)\\,dx$ includes the $dx$: you are summing products $f(x) \\cdot dx$ over the interval.",
      "In multiple dimensions, the story generalizes beautifully. If $f$ depends on several variables, $df = \\frac{\\partial f}{\\partial x}dx + \\frac{\\partial f}{\\partial y}dy + \\cdots$. This is the total differential, and it captures how errors in multiple measurements combine. Each partial derivative is an error amplification factor for its respective variable. This is the foundation of uncertainty propagation in experimental science.",
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Linear Approximation Reframed',
        body: 'Linear approximation says $f(a + \\Delta x) \\approx f(a) + f\'(a)\\Delta x$. Differentials rewrite this as $\\Delta y \\approx dy = f\'(a)\\,dx$. Same idea, different emphasis: instead of approximating the function value, we approximate the change.',
      },
      {
        type: 'real-world',
        title: 'Engineering Tolerances',
        body: "A mechanical part must fit within a $\\pm 0.01$ mm tolerance. If the part's dimension depends on a machined radius $r$ through a formula $d = f(r)$, the tolerance on $r$ is determined by $|f'(r)|\\,\\Delta r \\leq 0.01$, giving $\\Delta r \\leq 0.01/|f'(r)|$. Differentials directly translate output tolerances to input tolerances.",
      },
      {
        type: 'tip',
        title: 'Relative Error Rule for Powers',
        body: "If $y = x^n$, the relative error satisfies $\\frac{|dy|}{|y|} = |n| \\cdot \\frac{|dx|}{|x|}$. A 1\\% error in $x$ produces an $|n|\\%$ error in $x^n$. Squaring doubles the relative error; cubing triples it; taking a square root halves it.",
      },
      {
        type: 'warning',
        title: 'Differentials Are Approximations',
        body: 'The differential $dy = f\'(x)\\,dx$ is the tangent-line approximation to $\\Delta y$. For large $dx$, $dy$ and $\\Delta y$ can differ significantly. The quality of the approximation depends on the curvature $f\'\'(x)$ and the size of $dx$: the error is approximately $\\frac{1}{2}f\'\'(x)(dx)^2$.',
      },
      {
        type: 'geometric',
        title: 'Tangent Line vs. Curve',
        body: 'Graphically, $dy$ is the vertical change along the tangent line, while $\\Delta y$ is the vertical change along the curve. The tangent line is the best linear approximation, so $dy$ is the best linear estimate of $\\Delta y$. The gap $\\Delta y - dy$ is the error in the linear approximation.',
      },
    ],
    visualizations: [
      { vizId: 'LinearApproximation', caption: 'Compare $\\Delta y$ (change along the curve) with $dy$ (change along the tangent line). For small $dx$, they are nearly equal.' },
    ],
  },

  math: {
    prose: [
      "**Definition.** If $y = f(x)$ is differentiable, the differential of $y$ is $dy = f'(x)\\,dx$, where $dx$ is an independent variable representing an increment in $x$. The differential $dx$ is simply defined to be $\\Delta x$ (the actual change in $x$). The differential $dy$ is the corresponding change along the tangent line — not the curve.",
      "**Relationship to $\\Delta y$.** The actual change is $\\Delta y = f(x + dx) - f(x)$. By the definition of the derivative, $\\Delta y = f'(x)\\,dx + \\epsilon \\cdot dx$ where $\\epsilon \\to 0$ as $dx \\to 0$. Therefore $\\Delta y - dy = \\epsilon \\cdot dx$, which is $o(dx)$ — the error in the differential approximation vanishes faster than $dx$ itself. More precisely, Taylor's theorem gives $\\Delta y - dy = \\frac{1}{2}f''(\\xi)(dx)^2$ for some $\\xi$ between $x$ and $x + dx$.",
      "**Error estimation formulas.** If $x$ is measured with absolute error $|\\Delta x|$, then: Absolute error in $y$: $|\\Delta y| \\approx |dy| = |f'(x)| \\cdot |\\Delta x|$. Relative error in $y$: $\\frac{|\\Delta y|}{|y|} \\approx \\frac{|f'(x)|}{|f(x)|} \\cdot |\\Delta x|$. Percentage error in $y$: multiply relative error by 100.",
      "**Differentials of common functions.** $d(x^n) = nx^{n-1}\\,dx$. $d(\\sin x) = \\cos x\\,dx$. $d(\\cos x) = -\\sin x\\,dx$. $d(e^x) = e^x\\,dx$. $d(\\ln x) = \\frac{1}{x}\\,dx$. $d(\\tan x) = \\sec^2 x\\,dx$. Every differentiation rule translates directly: $d(fg) = f\\,dg + g\\,df$ (product rule), $d(f/g) = (g\\,df - f\\,dg)/g^2$ (quotient rule), $d(f(g)) = f'(g)\\,dg$ (chain rule).",
      "**Propagation of errors with multiple variables.** If $z = f(x, y)$ where $x$ and $y$ are measured independently with errors $\\Delta x$ and $\\Delta y$, then $dz = f_x\\,dx + f_y\\,dy$, giving $|\\Delta z| \\leq |f_x|\\,|\\Delta x| + |f_y|\\,|\\Delta y|$. For statistically independent errors, the root-sum-square estimate $\\Delta z \\approx \\sqrt{(f_x\\,\\Delta x)^2 + (f_y\\,\\Delta y)^2}$ is used instead.",
      "**Connection to integration.** The equation $dy = f'(x)\\,dx$ can be read as: the infinitesimal change in $y$ equals $f'(x)$ times the infinitesimal change in $x$. Summing (integrating) both sides from $a$ to $b$: $\\int_a^b dy = \\int_a^b f'(x)\\,dx$, which gives $y(b) - y(a) = \\int_a^b f'(x)\\,dx$. This is the Fundamental Theorem of Calculus, derived naturally from the differential notation.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Differential',
        body: 'If $y = f(x)$ is differentiable, then $dy = f\'(x)\\,dx$ where $dx = \\Delta x$ is an independent variable. The differential $dy$ is the change in $y$ along the tangent line corresponding to a change $dx$ in $x$.',
      },
      {
        type: 'theorem',
        title: 'Error Propagation',
        body: 'If $y = f(x)$ and $x$ is measured with error $\\Delta x$, then $|\\Delta y| \\approx |f\'(x)|\\,|\\Delta x|$ (absolute error) and $\\frac{|\\Delta y|}{|y|} \\approx \\left|\\frac{f\'(x)}{f(x)}\\right|\\,|\\Delta x|$ (relative error).',
      },
      {
        type: 'tip',
        title: 'Logarithmic Differentiation for Relative Error',
        body: 'Taking $d(\\ln y) = \\frac{dy}{y}$ gives the relative error directly. For $y = x^n$: $d(\\ln y) = d(n \\ln x) = n\\frac{dx}{x}$, so $\\frac{dy}{y} = n\\frac{dx}{x}$. This is the fastest way to find relative errors of power functions.',
      },
    ],
    visualizations: [
      { vizId: 'LinearApproximation', caption: 'The differential $dy$ (tangent-line change) approximates $\\Delta y$ (curve change). The approximation error is $O(dx^2)$.' },
    ],
  },

  rigor: {
    prose: [
      "**Formal definition of differentials.** Let $f: I \\to \\mathbb{R}$ be differentiable at $x \\in I$. Define the differential $df_x: \\mathbb{R} \\to \\mathbb{R}$ as the linear map $df_x(h) = f'(x) \\cdot h$. Here $h$ plays the role of $dx$. The differential is a linear function of $h$, not a number — it is the best linear approximation to the change $f(x + h) - f(x)$.",
      "**Rigorous error bound.** By Taylor's theorem with the Lagrange remainder, if $f \\in C^2$, then $f(x + h) - f(x) = f'(x)h + \\frac{1}{2}f''(\\xi)h^2$ for some $\\xi$ between $x$ and $x + h$. Therefore $|\\Delta y - dy| = \\frac{1}{2}|f''(\\xi)||h|^2 \\leq \\frac{M_2}{2}h^2$ where $M_2 = \\max|f''|$ on the relevant interval. The approximation error is $O(h^2)$, confirming that the differential is accurate to first order.",
      "**Differentials as linear maps.** In modern differential geometry, the differential $df$ at a point $x$ is a linear functional (a covector) acting on tangent vectors. For functions of one variable, this reduces to $df_x(v) = f'(x) \\cdot v$. The chain rule $d(g \\circ f) = (dg) \\circ (df)$ (composition of linear maps) gives $(g \\circ f)'(x) = g'(f(x)) \\cdot f'(x)$, recovering the familiar chain rule. This abstract perspective explains why the Leibniz notation $\\frac{dy}{dx}$ behaves algebraically like a fraction: it is the ratio of two linear maps applied to the same tangent vector.",
      "**Why $dy/dx$ acts like a fraction.** If $y = f(x)$ and $x = g(t)$, then $dy = f'(x)\\,dx$ and $dx = g'(t)\\,dt$. Substituting: $dy = f'(x) \\cdot g'(t)\\,dt = f'(g(t)) \\cdot g'(t)\\,dt$. Formally, $\\frac{dy}{dt} = \\frac{dy}{dx} \\cdot \\frac{dx}{dt}$, which is the chain rule. The cancellation of $dx$ is rigorous when differentials are understood as linear maps composed together.",
      "**Propagation of uncertainty (rigorous formulation).** If $f: \\mathbb{R}^n \\to \\mathbb{R}$ is $C^1$ and $\\mathbf{x} = (x_1, \\ldots, x_n)$ is measured with errors $\\delta x_i$, the worst-case error bound is $|\\Delta f| \\leq \\sum_{i=1}^n \\left|\\frac{\\partial f}{\\partial x_i}\\right| |\\delta x_i|$. If the errors are independent random variables with standard deviations $\\sigma_i$, the standard deviation of $f$ is $\\sigma_f = \\sqrt{\\sum_{i=1}^n \\left(\\frac{\\partial f}{\\partial x_i}\\right)^2 \\sigma_i^2}$ (the root-sum-square formula, derived from the variance of a linear combination).",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Differential Approximation Error',
        body: 'If $f \\in C^2$, then $|\\Delta y - dy| \\leq \\frac{M_2}{2}(dx)^2$ where $M_2 = \\max_{[x, x+dx]} |f\'\'|$. The differential is a first-order approximation with second-order error.',
      },
      {
        type: 'definition',
        title: 'Differential as a Linear Map',
        body: 'The differential $df_x: \\mathbb{R} \\to \\mathbb{R}$ is the linear map $h \\mapsto f\'(x) \\cdot h$. It is the best linear approximation to $\\Delta f$ in the sense that $\\Delta f - df_x(h) = o(h)$ as $h \\to 0$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-070-ex1',
      title: 'Error in the Volume of a Sphere',
      problem: "\\text{A sphere's radius is measured as } r = 10 \\text{ m with error } \\pm 0.05 \\text{ m. Estimate the error in the volume.}",
      steps: [
        { expression: 'V = \\frac{4}{3}\\pi r^3', annotation: 'Volume formula for a sphere.' },
        { expression: 'dV = 4\\pi r^2\\,dr', annotation: 'Take the differential of both sides. $dV/dr = 4\\pi r^2$, so $dV = 4\\pi r^2\\,dr$.' },
        { expression: 'r = 10, \\quad dr = \\pm 0.05', annotation: 'Substitute the measured radius and the error bound.' },
        { expression: 'dV = 4\\pi(10)^2(\\pm 0.05) = 4\\pi(100)(\\pm 0.05) = \\pm 20\\pi \\approx \\pm 62.83 \\text{ m}^3', annotation: 'Compute the error in volume.' },
        { expression: 'V = \\frac{4}{3}\\pi(10)^3 = \\frac{4000\\pi}{3} \\approx 4188.79 \\text{ m}^3', annotation: 'Compute the nominal volume for the relative error.' },
        { expression: '\\frac{|dV|}{V} = \\frac{20\\pi}{4000\\pi/3} = \\frac{20 \\cdot 3}{4000} = \\frac{3 \\cdot 0.05}{10} = 0.015 = 1.5\\%', annotation: 'Relative error: 1.5\\%. This is 3 times the relative error in $r$ (which was 0.5\\%), consistent with $V \\propto r^3$.' },
      ],
      conclusion: "The volume has an absolute error of approximately $\\pm 62.83$ m$^3$ and a relative error of 1.5\\%. The factor of 3 in the relative error comes from the cubic relationship $V \\propto r^3$: the exponent 3 amplifies the relative error by a factor of 3.",
    },
    {
      id: 'ch3-070-ex2',
      title: 'Estimating a Square Root Using Differentials',
      problem: "\\text{Use differentials to estimate } \\sqrt{4.02}.",
      steps: [
        { expression: 'f(x) = \\sqrt{x}, \\quad a = 4, \\quad dx = 0.02', annotation: 'Choose $a = 4$ (a nearby point where we know the exact value) and $dx = 0.02$.' },
        { expression: "f'(x) = \\frac{1}{2\\sqrt{x}}", annotation: 'Compute the derivative.' },
        { expression: 'dy = f\'(4)\\,dx = \\frac{1}{2\\sqrt{4}} \\cdot 0.02 = \\frac{1}{4}(0.02) = 0.005', annotation: 'The differential gives the approximate change.' },
        { expression: '\\sqrt{4.02} \\approx f(4) + dy = 2 + 0.005 = 2.005', annotation: 'Add the differential to the known value.' },
        { expression: '\\text{Actual: } \\sqrt{4.02} = 2.004994..., \\quad \\text{Error} \\approx 0.000006', annotation: 'The estimate 2.005 is accurate to 4 decimal places. The error is about $6 \\times 10^{-6}$.' },
      ],
      conclusion: "The differential gives $\\sqrt{4.02} \\approx 2.005$, which is off by only $6 \\times 10^{-6}$ from the true value. This demonstrates the power of linear approximation for small perturbations.",
    },
    {
      id: 'ch3-070-ex3',
      title: 'Propagation of Error in a Pendulum Period',
      problem: "\\text{The period of a pendulum is } T = 2\\pi\\sqrt{L/g}. \\text{ If } L = 1.00 \\pm 0.01 \\text{ m and } g = 9.80 \\text{ m/s}^2 \\text{, find the error in } T.",
      steps: [
        { expression: 'T = 2\\pi\\sqrt{L/g} = \\frac{2\\pi}{\\sqrt{g}} \\cdot L^{1/2}', annotation: 'Treat $g$ as exact and $L$ as the measured variable with error.' },
        { expression: 'dT = \\frac{2\\pi}{\\sqrt{g}} \\cdot \\frac{1}{2}L^{-1/2}\\,dL = \\frac{\\pi}{\\sqrt{gL}}\\,dL', annotation: 'Take the differential with respect to $L$.' },
        { expression: 'T = 2\\pi\\sqrt{1/9.80} \\approx 2\\pi(0.3194) \\approx 2.0071 \\text{ s}', annotation: 'Compute the nominal period.' },
        { expression: 'dT = \\frac{\\pi}{\\sqrt{9.80 \\cdot 1.00}} \\cdot (\\pm 0.01) = \\frac{\\pi}{3.130} \\cdot (\\pm 0.01) \\approx \\pm 0.01004 \\text{ s}', annotation: 'Compute the absolute error in $T$.' },
        { expression: '\\frac{|dT|}{T} = \\frac{1}{2} \\cdot \\frac{|dL|}{L} = \\frac{1}{2} \\cdot \\frac{0.01}{1.00} = 0.5\\%', annotation: 'Since $T \\propto L^{1/2}$, the relative error is halved. A 1\\% error in $L$ gives only a 0.5\\% error in $T$.' },
      ],
      conclusion: "The period $T \\approx 2.007 \\pm 0.010$ s. The square root relationship $T \\propto \\sqrt{L}$ is forgiving: it halves the relative error. This is why pendulum clocks can be quite accurate even with imprecise length measurements.",
    },
    {
      id: 'ch3-070-ex4',
      title: 'Error in Area from Angle Measurement',
      problem: "\\text{A triangle has sides } a = 10, b = 8, \\text{ and included angle } \\theta = 30° \\pm 1°. \\text{ Estimate the error in the area } A = \\frac{1}{2}ab\\sin\\theta.",
      steps: [
        { expression: 'A = \\frac{1}{2}(10)(8)\\sin\\theta = 40\\sin\\theta', annotation: 'Area formula with the known side lengths.' },
        { expression: 'dA = 40\\cos\\theta\\,d\\theta', annotation: 'Take the differential. Only $\\theta$ has error; $a$ and $b$ are exact.' },
        { expression: '\\theta = 30° = \\frac{\\pi}{6}, \\quad d\\theta = \\pm 1° = \\pm \\frac{\\pi}{180} \\text{ rad}', annotation: 'Convert to radians. Differentials require radian measure.' },
        { expression: 'dA = 40\\cos(30°) \\cdot \\left(\\pm\\frac{\\pi}{180}\\right) = 40 \\cdot \\frac{\\sqrt{3}}{2} \\cdot \\frac{\\pi}{180} = \\frac{20\\sqrt{3}\\pi}{180} \\approx \\pm 0.605', annotation: 'Compute the absolute error in area.' },
        { expression: 'A = 40\\sin(30°) = 40 \\cdot 0.5 = 20', annotation: 'Compute the nominal area.' },
        { expression: '\\frac{|dA|}{A} = \\frac{0.605}{20} \\approx 3.0\\%', annotation: 'Relative error in area. A $1°$ measurement error (about 3.3\\% of $30°$) produces about 3\\% error in area.' },
      ],
      conclusion: "The area is $20 \\pm 0.6$ square units. The error amplification depends on the angle: $\\frac{dA}{A} = \\frac{\\cos\\theta}{\\sin\\theta}\\,d\\theta = \\cot\\theta\\,d\\theta$. At small angles, $\\cot\\theta$ is large and errors are amplified severely. At $\\theta = 90°$, $\\cot\\theta = 0$ and the area is insensitive to angle errors.",
    },
    {
      id: 'ch3-070-ex5',
      title: 'Differential of a Logarithm',
      problem: "\\text{Use differentials to estimate } \\ln(1.05).",
      steps: [
        { expression: 'f(x) = \\ln(x), \\quad a = 1, \\quad dx = 0.05', annotation: 'Choose $a = 1$ where $\\ln(1) = 0$ is known exactly.' },
        { expression: 'df = \\frac{1}{x}\\,dx', annotation: 'The differential of $\\ln(x)$.' },
        { expression: 'dy = \\frac{1}{1} \\cdot 0.05 = 0.05', annotation: 'Evaluate at $x = 1$ with $dx = 0.05$.' },
        { expression: '\\ln(1.05) \\approx \\ln(1) + 0.05 = 0 + 0.05 = 0.05', annotation: 'The linear approximation.' },
        { expression: '\\text{Actual: } \\ln(1.05) = 0.04879..., \\quad \\text{Error} \\approx 0.00121', annotation: 'The estimate is off by about $1.2 \\times 10^{-3}$, or roughly 2.5\\% relative error.' },
      ],
      conclusion: "The differential gives $\\ln(1.05) \\approx 0.05$, close to the actual value of $0.04879$. This also shows that for small $x$, $\\ln(1 + x) \\approx x$ — a fundamental approximation used throughout physics and engineering.",
    },
  ],

  challenges: [
    {
      id: 'ch3-070-ch1',
      difficulty: 'hard',
      problem: "The resistance of a wire is $R = \\rho L / A$ where $\\rho$ is resistivity (exact), $L = 2.00 \\pm 0.02$ m (length), and $A = 0.50 \\pm 0.01$ mm$^2$ (cross-section area). Find the maximum relative error in $R$.",
      hint: 'Use $dR = \\frac{\\partial R}{\\partial L}dL + \\frac{\\partial R}{\\partial A}dA$. Or use logarithmic differentiation: $\\ln R = \\ln \\rho + \\ln L - \\ln A$.',
      walkthrough: [
        { expression: '\\ln R = \\ln \\rho + \\ln L - \\ln A', annotation: 'Take the log of $R = \\rho L / A$.' },
        { expression: '\\frac{dR}{R} = \\frac{dL}{L} - \\frac{dA}{A}', annotation: 'Differentiate. Since $\\rho$ is exact, $d(\\ln \\rho) = 0$.' },
        { expression: '\\left|\\frac{dR}{R}\\right| \\leq \\left|\\frac{dL}{L}\\right| + \\left|\\frac{dA}{A}\\right| = \\frac{0.02}{2.00} + \\frac{0.01}{0.50} = 0.01 + 0.02 = 0.03', annotation: 'Worst case: errors add. Relative error in $L$ is 1\\%, in $A$ is 2\\%.' },
        { expression: '\\text{Maximum relative error in } R \\text{ is } 3\\%', annotation: 'The area measurement contributes twice as much relative error as the length measurement.' },
      ],
      answer: '\\text{Maximum relative error in } R \\text{ is } 3\\% \\text{ (1\\% from } L \\text{, 2\\% from } A\\text{).}',
    },
    {
      id: 'ch3-070-ch2',
      difficulty: 'medium',
      problem: 'Use differentials to estimate $\\cos(61°)$.',
      hint: 'Use $a = 60° = \\pi/3$ (where $\\cos(60°) = 1/2$) and $dx = 1° = \\pi/180$ rad.',
      walkthrough: [
        { expression: 'f(x) = \\cos(x), \\quad a = \\pi/3, \\quad dx = \\pi/180', annotation: 'Set up with the nearest angle where cosine is known exactly.' },
        { expression: 'dy = -\\sin(a)\\,dx = -\\sin(\\pi/3) \\cdot \\frac{\\pi}{180} = -\\frac{\\sqrt{3}}{2} \\cdot \\frac{\\pi}{180}', annotation: 'Compute the differential.' },
        { expression: 'dy \\approx -0.8660 \\cdot 0.01745 \\approx -0.01511', annotation: 'Numerical value of the differential.' },
        { expression: '\\cos(61°) \\approx \\cos(60°) + dy = 0.5 - 0.01511 = 0.48489', annotation: 'Add to the known value.' },
        { expression: '\\text{Actual: } \\cos(61°) = 0.48481..., \\quad \\text{Error} \\approx 0.00008', annotation: 'Excellent agreement.' },
      ],
      answer: '\\cos(61°) \\approx 0.4849',
    },
    {
      id: 'ch3-070-ch3',
      difficulty: 'medium',
      problem: "A cube's edge is measured as $s = 5.00 \\pm 0.03$ cm. Find the absolute and relative errors in the surface area $A = 6s^2$ and volume $V = s^3$.",
      hint: 'Compute $dA = 12s\\,ds$ and $dV = 3s^2\\,ds$. For relative errors, use the power rule: $n$ times the relative error in $s$.',
      walkthrough: [
        { expression: 'dA = 12s\\,ds = 12(5)(\\pm 0.03) = \\pm 1.8 \\text{ cm}^2', annotation: 'Absolute error in surface area. $A = 6(25) = 150$ cm$^2$.' },
        { expression: '\\frac{|dA|}{A} = 2 \\cdot \\frac{|ds|}{s} = 2 \\cdot \\frac{0.03}{5} = 1.2\\%', annotation: 'Relative error in area: 2 times the relative error in $s$ (since $A \\propto s^2$).' },
        { expression: 'dV = 3s^2\\,ds = 3(25)(\\pm 0.03) = \\pm 2.25 \\text{ cm}^3', annotation: 'Absolute error in volume. $V = 125$ cm$^3$.' },
        { expression: '\\frac{|dV|}{V} = 3 \\cdot \\frac{|ds|}{s} = 3 \\cdot \\frac{0.03}{5} = 1.8\\%', annotation: 'Relative error in volume: 3 times the relative error in $s$ (since $V \\propto s^3$).' },
      ],
      answer: 'A = 150 \\pm 1.8 \\text{ cm}^2 \\;(1.2\\%), \\quad V = 125 \\pm 2.25 \\text{ cm}^3 \\;(1.8\\%).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'linear-approximation', label: 'Linear Approximation', context: 'Differentials are linear approximation reframed: $f(a + dx) \\approx f(a) + dy$ where $dy = f\'(a)\\,dx$.' },
    { lessonSlug: 'newtons-method', label: "Newton's Method", context: "Newton's Method uses the differential $dy = f'(x_n)\\,dx$ to estimate how far the root is from the current guess." },
    { lessonSlug: 'area-accumulation', label: 'Area and Accumulation', context: 'The differential $dy = f\'(x)\\,dx$ motivates integration: summing infinitesimal changes recovers the total change via the Fundamental Theorem.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'Related rates uses $dy = f\'(x)\\,dx$ with $dx$ replaced by $dx/dt \\cdot dt$, connecting differentials to rates of change in time.' },
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
    'attempted-challenge-hard',
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
  ],
}
