// FILE: src/content/chapter-6/00-parametric-equations.js
export default {
  id: 'ch6-parametric',
  slug: 'parametric-equations',
  chapter: 6,
  order: 0,
  title: 'Parametric Equations',
  subtitle: 'When a single variable cannot capture the path — let time drive both x and y independently',
  tags: ['parametric', 'parameter', 'curve', 'cycloid', 'Lissajous', 'parametric derivative', 'eliminate parameter'],
  aliases: 'trajectory equations x(t) y(t) tangent vector velocity from parametric equations dy dx from dt',

  hook: {
    question: 'A point traces a circle at constant speed. You know it starts at (1, 0) and sweeps counterclockwise. Can you describe its position at every instant with a single equation y = f(x)? Why does that fail, and what replaces it?',
    realWorldContext: 'Every GPS satellite broadcasts its position as three functions of time: x(t), y(t), z(t). A roller-coaster track is designed by specifying height and curvature as functions of arc length. Robotic arms move by controlling each joint angle as a function of time — the tip traces a path that no single y = f(x) equation could capture. Computer fonts like TrueType describe letter outlines using parametric Bezier curves. Parametric equations are the natural language for any path where direction matters, where the curve may loop back on itself, or where an explicit function simply does not exist.',
    previewVisualizationId: 'ParametricCurve3D',
  },

  intuition: {
    prose: [
      'Think of a parametric curve as a set of instructions for a moving point: at time t, go to x-coordinate f(t) and y-coordinate g(t). The parameter t is the clock. As t advances, the point traces out a curve in the xy-plane. The same curve can be traversed at different speeds, in different directions, or even retraced — all by changing how f(t) and g(t) depend on t. This is fundamentally different from y = f(x), which says nothing about when or how fast the curve is traversed.',
      'The simplest example is the unit circle. The equation x² + y² = 1 describes the shape but not the motion. The parametrization x = cos(t), y = sin(t) says the point starts at (1, 0) when t = 0 and sweeps counterclockwise at unit angular speed. A different parametrization, x = cos(2t), y = sin(2t), traces the same circle but twice as fast. And x = cos(-t), y = sin(-t) traces it clockwise. The shape is the same; the motion is different.',
      'Why not just use y = f(x)? Because many interesting curves fail the vertical line test. A circle, a figure-eight, a spiral that loops back over itself — none of these can be expressed as a single function of x. Parametric equations sidestep this entirely. Each coordinate is a separate function of the parameter, and there is no requirement that x(t) be one-to-one. The curve can cross itself, backtrack, or form any shape whatsoever.',
      'The cycloid is a beautiful example: the curve traced by a point on the rim of a rolling wheel. If the wheel has radius a and rolls along the x-axis, the parametrization is x = a(t - sin t), y = a(1 - cos t). The point touches the ground every time t is a multiple of 2pi, creating a series of arches. This curve turns out to be the brachistochrone — the path of fastest descent under gravity — and the tautochrone — the path on which the time of descent is the same regardless of starting point. Both discoveries, by Johann Bernoulli and Christiaan Huygens respectively, were landmarks in the history of mathematics.',
      'Lissajous figures arise when x and y are sinusoidal with different frequencies: x = A cos(at + d), y = B sin(bt). When the frequency ratio a/b is rational, the curve closes; when irrational, it fills a rectangle densely. These patterns appear on oscilloscopes when comparing two electrical signals, and they were historically used to calibrate tuning forks. The shape depends entirely on the ratio a/b and the phase shift d.',
      'To find the slope of a parametric curve, think about what dy/dx means physically. The point moves with horizontal velocity dx/dt and vertical velocity dy/dt. The slope is the ratio of vertical to horizontal velocity: dy/dx = (dy/dt) / (dx/dt). This is just the chain rule in disguise. The formula breaks down when dx/dt = 0 — at those moments the tangent line is vertical, which makes geometric sense: the point is moving straight up or down with no horizontal component.',
      'Eliminating the parameter means finding a direct relationship between x and y by removing t. For x = cos t, y = sin t, the identity cos²t + sin²t = 1 gives x² + y² = 1. For x = t², y = t³, you can write t = x^(1/2) and substitute: y = x^(3/2). Elimination recovers the shape but loses the motion information — direction, speed, and timing all disappear. Sometimes elimination is algebraically impossible or impractical, which is another reason to keep parametric form.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You Already Know One Parametrization',
        body: 'Every function y = f(x) can be written parametrically as x = t, y = f(t). The parameter is just x itself. Parametric equations generalize this by allowing x to be any function of t, not just t itself.',
      },
      {
        type: 'real-world',
        title: 'Bezier Curves in Computer Graphics',
        body: 'Every letter you read on screen is drawn using parametric cubic Bezier curves. The curves x(t) and y(t) are cubic polynomials in t, controlled by four "anchor" points. PostScript, TrueType, and SVG all use this representation. Parametric form lets the renderer compute any point on the curve at any resolution simply by evaluating two polynomials.',
      },
      {
        type: 'warning',
        title: 'dy/dx Is NOT dy/dt',
        body: 'A common error is to compute dy/dt and call it the slope. The slope of the curve in the xy-plane is dy/dx = (dy/dt)/(dx/dt). You need both derivatives, and you need to divide them. Only when the parameter happens to be x itself does dy/dt equal dy/dx.',
      },
      {
        type: 'tip',
        title: 'Use a Table of Values to Sketch',
        body: 'When meeting a new parametric curve, make a table: choose several values of t, compute (x, y) for each, and plot the points. Draw arrows showing the direction of increasing t. This simple technique reveals the shape and direction of traversal before any algebra.',
      },
      {
        type: 'history',
        title: 'The Brachistochrone Problem (1696)',
        body: 'Johann Bernoulli challenged the mathematicians of Europe: find the curve of fastest descent between two points under gravity. The answer — the cycloid — was found independently by Newton, Leibniz, L\'Hopital, and Jakob Bernoulli. It launched the calculus of variations and demonstrated the power of parametric thinking.',
      },
    ],
    visualizations: [
      { id: 'ParametricCurve3D', title: 'Parametric Curve Explorer', caption: 'Adjust the parametric equations and watch the curve trace out in real time. Observe how changing the parameter range and speed affects the path.' },
      { id: 'VectorKinematicsLab', title: 'Motion Vectors on Parametric Paths', caption: 'Track r(t), v(t), and a(t) on the same curve to connect geometric tracing with derivative vectors and speed.' },
    ],
  },

  math: {
    prose: [
      'A parametric curve in the plane is a pair of continuous functions $x = f(t)$, $y = g(t)$ defined on an interval $I$. The curve $C$ is the set of points $\\{(f(t), g(t)) : t \\in I\\}$. If $f$ and $g$ are differentiable, the tangent vector at parameter value $t$ is $\\langle f\'(t), g\'(t) \\rangle$. When $f\'(t) \\neq 0$, the slope of the tangent line is $\\frac{dy}{dx} = \\frac{g\'(t)}{f\'(t)}$.',
      'The second derivative $\\frac{d^2y}{dx^2}$ measures concavity of the curve as seen in the $xy$-plane. To compute it, apply the quotient rule to $\\frac{dy}{dx}$ viewed as a function of $t$, then divide by $\\frac{dx}{dt}$: $\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}\\!\\left(\\frac{dy}{dx}\\right)}{\\frac{dx}{dt}} = \\frac{f\'(t)\\,g\'\'(t) - g\'(t)\\,f\'\'(t)}{[f\'(t)]^3}.$ This formula is essential for determining where a parametric curve is concave up or down.',
      'Arc length of a parametric curve from $t = a$ to $t = b$ is $L = \\int_a^b \\sqrt{[f\'(t)]^2 + [g\'(t)]^2}\\, dt$. The integrand $\\sqrt{(dx/dt)^2 + (dy/dt)^2}$ is the speed of the moving point — the magnitude of the velocity vector. When the curve is the graph of $y = f(x)$, parametrize as $x = t$, $y = f(t)$, and the formula reduces to the familiar $\\int \\sqrt{1 + [f\'(x)]^2}\\, dx$.',
      'For a circle of radius $a$ parametrized by $x = a\\cos t$, $y = a\\sin t$ with $0 \\le t \\le 2\\pi$: the speed is $\\sqrt{(-a\\sin t)^2 + (a\\cos t)^2} = a$, so $L = \\int_0^{2\\pi} a\\, dt = 2\\pi a$, confirming the circumference formula. For the cycloid $x = a(t - \\sin t)$, $y = a(1 - \\cos t)$, $0 \\le t \\le 2\\pi$: one arch has length $\\int_0^{2\\pi} \\sqrt{a^2(1-\\cos t)^2 + a^2 \\sin^2 t}\\, dt = \\int_0^{2\\pi} a\\sqrt{2 - 2\\cos t}\\, dt = 8a$.',
      'The tangent line at parameter $t = t_0$ passes through $(f(t_0), g(t_0))$ with slope $m = g\'(t_0)/f\'(t_0)$, giving the equation $y - g(t_0) = m\\,(x - f(t_0))$. A point where $f\'(t_0) = 0$ and $g\'(t_0) \\neq 0$ yields a vertical tangent. A point where both $f\'(t_0) = 0$ and $g\'(t_0) = 0$ is a singular point — the tangent direction is indeterminate and must be analyzed with higher derivatives or L\'Hopital\'s rule on the ratio $g\'(t)/f\'(t)$ as $t \\to t_0$.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Parametric Derivative',
        body: 'If $x = f(t)$ and $y = g(t)$ with $f\'(t) \\neq 0$, then\n\\[\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{g\'(t)}{f\'(t)}\\]',
      },
      {
        type: 'formula',
        title: 'Parametric Arc Length',
        body: '\\[L = \\int_a^b \\sqrt{\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2}\\, dt\\]',
      },
      {
        type: 'formula',
        title: 'Second Derivative in Parametric Form',
        body: '\\[\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}\\!\\left(\\frac{dy}{dx}\\right)}{\\frac{dx}{dt}}\\]',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'A parametric curve $\\gamma: I \\to \\mathbb{R}^2$ given by $\\gamma(t) = (f(t), g(t))$ is called regular at $t_0$ if $\\gamma\'(t_0) = (f\'(t_0), g\'(t_0)) \\neq (0, 0)$. At regular points, the curve has a well-defined tangent line and locally looks like a smooth arc. The implicit function theorem guarantees that near a regular point where $f\'(t_0) \\neq 0$, the curve can be locally expressed as $y = h(x)$ for some differentiable function $h$.',
      'Two parametrizations $\\gamma_1(t)$ and $\\gamma_2(s)$ represent the same oriented curve if there exists a continuously differentiable bijection $t = \\phi(s)$ with $\\phi\'(s) > 0$ such that $\\gamma_1(\\phi(s)) = \\gamma_2(s)$ for all $s$. The condition $\\phi\' > 0$ preserves orientation (direction of traversal). If $\\phi\' < 0$, the curve is traversed in the opposite direction. Arc length, curvature, and tangent direction are geometric invariants — they depend on the curve itself, not on the choice of parametrization.',
      'The arc length function $s(t) = \\int_{t_0}^{t} \\|\\gamma\'(u)\\| \\, du$ provides a canonical parametrization by arc length. When a curve is parametrized by arc length, the speed is identically 1: $\\|\\gamma\'(s)\\| = 1$ for all $s$. This parametrization is unique up to the choice of starting point and direction, and it simplifies many formulas — for instance, curvature becomes simply $\\kappa = \\|\\gamma\'\'(s)\\|$.',
      'At a singular point where $\\gamma\'(t_0) = (0,0)$, the curve may exhibit cusps, self-intersections, or other non-smooth behavior. The cycloid has cusps at $t = 2k\\pi$ where both $f\'(t) = a(1 - \\cos t)$ and $g\'(t) = a \\sin t$ vanish simultaneously. Near such points, the tangent direction can sometimes be recovered by computing $\\lim_{t \\to t_0} g\'(t)/f\'(t)$ using L\'Hopital\'s rule, but the geometric behavior may still be qualitatively different from that at regular points.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-parametric-ex1',
      title: 'Slope and Tangent Line on a Cycloid',
      problem: '\\text{Find the slope and tangent line to the cycloid } x = t - \\sin t,\\; y = 1 - \\cos t \\text{ at } t = \\pi/3.',
      steps: [
        { expression: '\\frac{dx}{dt} = 1 - \\cos t, \\quad \\frac{dy}{dt} = \\sin t', annotation: 'Differentiate each coordinate function with respect to t.' },
        { expression: '\\frac{dy}{dx} = \\frac{\\sin t}{1 - \\cos t}', annotation: 'Apply the parametric derivative formula: slope = (dy/dt)/(dx/dt).' },
        { expression: 't = \\frac{\\pi}{3}: \\quad \\frac{dy}{dx} = \\frac{\\sin(\\pi/3)}{1 - \\cos(\\pi/3)} = \\frac{\\sqrt{3}/2}{1 - 1/2} = \\frac{\\sqrt{3}/2}{1/2} = \\sqrt{3}', annotation: 'Substitute t = pi/3. The slope equals sqrt(3), corresponding to a 60-degree angle.' },
        { expression: 'x_0 = \\frac{\\pi}{3} - \\frac{\\sqrt{3}}{2}, \\quad y_0 = 1 - \\frac{1}{2} = \\frac{1}{2}', annotation: 'Compute the point on the curve at t = pi/3.' },
        { expression: 'y - \\frac{1}{2} = \\sqrt{3}\\left(x - \\frac{\\pi}{3} + \\frac{\\sqrt{3}}{2}\\right)', annotation: 'Write the tangent line in point-slope form.' },
      ],
      conclusion: 'The tangent line has slope sqrt(3) at t = pi/3, making a 60-degree angle with the x-axis. Notice that the formula dy/dx = sin(t)/(1 - cos(t)) is undefined at t = 0 and t = 2pi — these are the cusp points where the cycloid touches the x-axis.',
    },
    {
      id: 'ch6-parametric-ex2',
      title: 'Eliminating the Parameter',
      problem: '\\text{Eliminate the parameter from } x = 2\\cos t,\\; y = 3\\sin t \\text{ and identify the curve.}',
      steps: [
        { expression: '\\cos t = \\frac{x}{2}, \\quad \\sin t = \\frac{y}{3}', annotation: 'Solve each equation for the trig function.' },
        { expression: '\\cos^2 t + \\sin^2 t = 1', annotation: 'Use the Pythagorean identity to eliminate t.' },
        { expression: '\\frac{x^2}{4} + \\frac{y^2}{9} = 1', annotation: 'Substitute to get the Cartesian equation. This is an ellipse with semi-axes a = 2 (horizontal) and b = 3 (vertical).' },
      ],
      conclusion: 'The parametric equations trace an ellipse centered at the origin with semi-major axis 3 along y and semi-minor axis 2 along x. The parametrization starts at (2, 0) when t = 0 and traverses counterclockwise. Elimination reveals the shape but hides the direction and speed of traversal.',
    },
    {
      id: 'ch6-parametric-ex3',
      title: 'Arc Length of One Arch of a Cycloid',
      problem: '\\text{Find the arc length of one arch of the cycloid } x = a(t - \\sin t),\\; y = a(1 - \\cos t),\\; 0 \\le t \\le 2\\pi.',
      steps: [
        { expression: '\\frac{dx}{dt} = a(1 - \\cos t), \\quad \\frac{dy}{dt} = a\\sin t', annotation: 'Compute the derivatives of each coordinate.' },
        { expression: '\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2 = a^2(1-\\cos t)^2 + a^2\\sin^2 t', annotation: 'Square and add.' },
        { expression: '= a^2(1 - 2\\cos t + \\cos^2 t + \\sin^2 t) = a^2(2 - 2\\cos t)', annotation: 'Expand and use cos^2(t) + sin^2(t) = 1.' },
        { expression: '\\sqrt{a^2(2-2\\cos t)} = a\\sqrt{2}\\,\\sqrt{1-\\cos t} = a\\sqrt{2}\\cdot \\sqrt{2\\sin^2(t/2)} = 2a\\sin(t/2)', annotation: 'Use the half-angle identity: 1 - cos(t) = 2sin^2(t/2). Since 0 <= t <= 2pi, sin(t/2) >= 0.' },
        { expression: 'L = \\int_0^{2\\pi} 2a\\sin(t/2)\\,dt = 2a\\left[-2\\cos(t/2)\\right]_0^{2\\pi} = 2a(-2\\cos\\pi + 2\\cos 0) = 2a(2+2) = 8a', annotation: 'Evaluate the integral.' },
      ],
      conclusion: 'One arch of a cycloid generated by a circle of radius a has arc length 8a — exactly four times the diameter. This elegant result, discovered by Christopher Wren in 1658, shows that the cycloid is exactly "four diameters long" per arch.',
    },
    {
      id: 'ch6-parametric-ex4',
      title: 'Projectile Motion as a Parametric Curve',
      problem: '\\text{A projectile is launched at speed } v_0 = 50 \\text{ m/s at angle } \\alpha = 30°. \\text{ Find the parametric equations and the range.}',
      steps: [
        { expression: 'x = (v_0 \\cos\\alpha)\\,t = 50\\cos 30°\\cdot t = 25\\sqrt{3}\\,t', annotation: 'Horizontal position: constant velocity, no air resistance.' },
        { expression: 'y = (v_0 \\sin\\alpha)\\,t - \\frac{1}{2}gt^2 = 25t - 4.9t^2', annotation: 'Vertical position: initial upward velocity minus gravitational deceleration.' },
        { expression: 'y = 0 \\Rightarrow t(25 - 4.9t) = 0 \\Rightarrow t = 0 \\text{ or } t = \\frac{25}{4.9} \\approx 5.10 \\text{ s}', annotation: 'The projectile lands when y = 0 again (excluding t = 0).' },
        { expression: 'R = x(5.10) = 25\\sqrt{3}(5.10) \\approx 220.9 \\text{ m}', annotation: 'Range is the horizontal distance at landing time.' },
      ],
      conclusion: 'The projectile follows a parametric parabola with range approximately 221 m. Eliminating t gives y = x tan(alpha) - gx^2/(2v_0^2 cos^2(alpha)), a downward-opening parabola. The parametric form is more natural because it preserves the time information — we know where the projectile is at every moment, not just the shape of its path.',
    },
    {
      id: 'ch6-parametric-ex5',
      title: 'Second Derivative and Concavity',
      problem: '\\text{Find } \\frac{d^2y}{dx^2} \\text{ for } x = t^2,\\; y = t^3 \\text{ and determine concavity at } t = 1.',
      steps: [
        { expression: '\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{3t^2}{2t} = \\frac{3t}{2}', annotation: 'First derivative by the parametric formula.' },
        { expression: '\\frac{d}{dt}\\!\\left(\\frac{dy}{dx}\\right) = \\frac{d}{dt}\\!\\left(\\frac{3t}{2}\\right) = \\frac{3}{2}', annotation: 'Differentiate dy/dx with respect to t.' },
        { expression: '\\frac{d^2y}{dx^2} = \\frac{3/2}{dx/dt} = \\frac{3/2}{2t} = \\frac{3}{4t}', annotation: 'Divide by dx/dt to get the second derivative with respect to x.' },
        { expression: 't = 1: \\quad \\frac{d^2y}{dx^2} = \\frac{3}{4} > 0', annotation: 'Positive second derivative means the curve is concave up at t = 1.' },
      ],
      conclusion: 'At t = 1, the curve y = x^(3/2) is concave up with d^2y/dx^2 = 3/4. The second derivative 3/(4t) is positive for all t > 0, so the curve is concave up throughout the first quadrant. At t = 0 the second derivative is undefined — that is the cusp at the origin.',
    },
  ],

  challenges: [
    {
      id: 'ch6-parametric-ch1',
      difficulty: 'hard',
      problem: 'Find the total arc length of the astroid x = cos^3(t), y = sin^3(t) for 0 <= t <= 2pi.',
      hint: 'By symmetry, compute the arc length in the first quadrant (0 <= t <= pi/2) and multiply by 4. Use the identity cos^2(t) + sin^2(t) = 1 after computing the speed.',
      walkthrough: [
        { expression: '\\frac{dx}{dt} = -3\\cos^2 t\\,\\sin t, \\quad \\frac{dy}{dt} = 3\\sin^2 t\\,\\cos t', annotation: 'Differentiate x and y.' },
        { expression: '\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2 = 9\\cos^4 t\\,\\sin^2 t + 9\\sin^4 t\\,\\cos^2 t = 9\\sin^2 t\\,\\cos^2 t(\\cos^2 t + \\sin^2 t) = 9\\sin^2 t\\,\\cos^2 t', annotation: 'Factor out common terms and use the Pythagorean identity.' },
        { expression: '\\text{Speed} = 3|\\sin t\\,\\cos t| = \\frac{3}{2}|\\sin 2t|', annotation: 'Take the square root.' },
        { expression: 'L = 4\\int_0^{\\pi/2} \\frac{3}{2}\\sin 2t\\,dt = 6\\left[-\\frac{\\cos 2t}{2}\\right]_0^{\\pi/2} = 6\\cdot\\frac{-(-1)+1}{2} = 6', annotation: 'Use symmetry and evaluate. In the first quadrant, sin(2t) >= 0.' },
      ],
      answer: 'L = 6',
    },
    {
      id: 'ch6-parametric-ch2',
      difficulty: 'medium',
      problem: 'Find dy/dx and all points where the tangent line is horizontal for the curve x = t^3 - 3t, y = t^2 - 4.',
      hint: 'Horizontal tangent means dy/dx = 0, which means dy/dt = 0 (provided dx/dt is nonzero at those points).',
      walkthrough: [
        { expression: '\\frac{dy}{dx} = \\frac{2t}{3t^2 - 3} = \\frac{2t}{3(t^2-1)}', annotation: 'Compute dy/dt = 2t and dx/dt = 3t^2 - 3, then divide.' },
        { expression: '\\frac{dy}{dx} = 0 \\Rightarrow 2t = 0 \\Rightarrow t = 0', annotation: 'Horizontal tangent when the numerator is zero. Check: dx/dt at t = 0 is -3, which is nonzero.' },
        { expression: 't = 0: \\quad x = 0 - 0 = 0, \\; y = 0 - 4 = -4', annotation: 'The horizontal tangent occurs at the point (0, -4).' },
      ],
      answer: '\\text{Horizontal tangent at } (0, -4) \\text{ when } t = 0.',
    },
    {
      id: 'ch6-parametric-ch3',
      difficulty: 'medium',
      problem: 'A particle moves along x = e^t cos(t), y = e^t sin(t). Find its speed at t = 0 and show the speed grows exponentially.',
      hint: 'Compute dx/dt and dy/dt using the product rule. Then find the magnitude of the velocity vector.',
      walkthrough: [
        { expression: '\\frac{dx}{dt} = e^t(\\cos t - \\sin t), \\quad \\frac{dy}{dt} = e^t(\\sin t + \\cos t)', annotation: 'Product rule on each coordinate.' },
        { expression: 'v^2 = e^{2t}(\\cos t - \\sin t)^2 + e^{2t}(\\sin t + \\cos t)^2 = e^{2t}[\\cos^2 t - 2\\sin t\\cos t + \\sin^2 t + \\sin^2 t + 2\\sin t\\cos t + \\cos^2 t]', annotation: 'Square and add the components.' },
        { expression: 'v^2 = e^{2t}[1 + 1] = 2e^{2t} \\Rightarrow v = e^t\\sqrt{2}', annotation: 'Cross terms cancel. Speed grows as e^t.' },
        { expression: 'v(0) = \\sqrt{2}', annotation: 'At t = 0, the speed is sqrt(2).' },
      ],
      answer: 'v(t) = e^t\\sqrt{2}; \\text{ at } t=0, \\; v = \\sqrt{2}.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'The parametric derivative formula dy/dx = (dy/dt)/(dx/dt) is a direct application of the chain rule.' },
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Polar curves r = f(theta) can be viewed as parametric curves x = f(theta)cos(theta), y = f(theta)sin(theta) with parameter theta.' },
    { lessonSlug: 'vector-calculus-preview', label: 'Vector-Valued Functions', context: 'A parametric curve is equivalent to a vector-valued function r(t) = <f(t), g(t)>. Chapter 6 lesson 4 develops this viewpoint.' },
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
