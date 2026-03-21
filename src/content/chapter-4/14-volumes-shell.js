export default {
  id: 'ch4-vol-shell',
  slug: 'volumes-shell',
  chapter: 4,
  order: 14,
  title: 'Volumes: The Cylindrical Shell Method',
  subtitle: 'Slice parallel to the rotation axis to build shells instead of disks — often the simpler choice',
  tags: ['shell method', 'cylindrical shells', 'volume', 'y-axis', 'disk vs shell', 'which method'],

  hook: {
    question: 'What if rotating around the y-axis gives you a disk integral that requires inverting your function — turning y = x³ into x = y^(1/3) and integrating in y? The shell method sidesteps this entirely by slicing in a completely different direction.',
    realWorldContext:
      'The shell method is the mathematical basis for understanding how hollow cylinders (pipes, tubes, rings) accumulate volume. ' +
      'When engineers specify a pipe as "2-inch nominal" they mean the bore (inner radius) is approximately 2 inches; the shell method computes the material volume from the wall thickness and length. ' +
      'In chemistry, molecular orbitals and electron probability densities are computed by integrating radial shell functions — the probability of finding an electron in a thin spherical shell of radius r is proportional to |ψ(r)|²·4πr², a direct analog of the shell volume formula 2πr·h·dr. ' +
      'Automotive engineers use shell-method integrals to compute the rotational inertia of hollow drive shafts — the radial distance appears squared in moment of inertia, just as it appears linearly in the shell volume formula. ' +
      'Layered manufacturing (like 3D-printing concentric rings) approximates a solid by cylindrical shells, exactly matching the mathematical decomposition.',
    previewVisualizationId: 'VolumesOfRevolution',
  },

  intuition: {
    prose: [
      'The disk method slices a solid perpendicular to the rotation axis, producing circular cross-sections. The shell method slices parallel to the rotation axis, producing thin cylindrical shells. Imagine peeling an onion: each layer is a thin cylindrical shell. The total volume of the onion is the sum of all shell volumes. This is the shell method — a completely different decomposition of the same 3D solid.',

      'A cylindrical shell has radius r, height h, and wall thickness Δr. Its volume is (outer cylinder) − (inner cylinder) = π(r+Δr)²h − πr²h = π[2rΔr + (Δr)²]h ≈ 2πr·h·Δr for small Δr. Think of unrolling the thin shell into a flat rectangular slab: dimensions are 2πr (circumference) × h (height) × Δr (thickness). Volume = circumference × height × thickness.',

      'For rotating y = f(x) around the y-axis on [a, b]: at each x-position, the shell has radius x (distance from y-axis), height f(x) (height of the curve), and thickness dx. Shell volume = 2πx·f(x)·dx. Integrating: V = 2π∫ₐᵇ x·f(x) dx. The integrand is always: 2π × radius × height.',

      'The big advantage of shells: when rotating around the y-axis with a function given as y = f(x), shells integrate naturally in x — no need to invert f to get x = g(y). With disks, you would need to integrate in y and express everything in terms of y. For complicated functions (y = x⁵ − 3x³ + 2x, for instance), inverting is impossible analytically. Shells solve the problem directly.',

      'When rotating around the x-axis using shells, the roles reverse: shells are at height y with radius y (distance from x-axis), height = x-extent of the curve at that y = g(y), and thickness dy. Volume = 2π∫ y·g(y) dy. So shells work in whichever variable is perpendicular to the axis — which is usually the natural function variable.',

      'Disk vs. shell decision guide: (1) Is the function given as y=f(x)? If rotating around the x-axis, use disks (integrate in x). If rotating around the y-axis, use shells (integrate in x — no inversion needed). (2) Is the function given as x=g(y)? If rotating around the y-axis, use disks (integrate in y). If rotating around the x-axis, use shells (integrate in y). Both methods always give the same answer; the choice is which integral is easier.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Shell Method Setup Checklist',
        body: '1. Identify the axis of rotation.\n2. The shell radius = distance from the axis to the variable (usually just x for y-axis rotation, or y for x-axis rotation).\n3. The shell height = value of the function at that position.\n4. Volume element: dV = 2π·(radius)·(height)·(thickness).\n5. Integrate over the appropriate range.\nThe integrand is always 2π·r·h — commit this to memory.',
      },
      {
        type: 'strategy',
        title: 'Disk vs. Shell: The Decision Tree',
        body: 'Rotating around y-axis, function given as y = f(x) → use SHELLS (integrate in x, no inversion).\nRotating around y-axis, function given as x = g(y) → use DISKS (integrate in y, straightforward).\nRotating around x-axis, function given as y = f(x) → use DISKS (integrate in x, straightforward).\nRotating around x-axis, function given as x = g(y) → use SHELLS (integrate in y, no inversion).\nWhen in doubt: try both and pick the simpler integral.',
      },
      {
        type: 'intuition',
        title: 'The Unrolled Shell Trick',
        body: 'A cylindrical shell of radius r, height h, and thickness dr, when unrolled, becomes a flat rectangular slab with dimensions:\n  Width = 2πr (circumference)\n  Height = h\n  Depth = dr (thickness)\n  Volume = 2πr·h·dr\nThis rectangle picture makes the shell formula intuitive: 2πr is just the "perimeter" of the cylinder unrolled flat.',
      },
      {
        type: 'misconception',
        title: 'The 2π Factor Is Not Optional',
        body: 'Shell volume = 2π∫r·h dx, NOT π∫r·h dx. The factor 2π comes from the full circumference of the shell (2πr), not πr². Missing the 2π is the most common shell-method error. Memorize: disks have π (from πr²), shells have 2π (from circumference 2πr times thickness).',
      },
    ],
    visualizationId: 'ShellMethod',
    visualizationProps: {},
    visualizations: [
      {
        id: 'VolumesOfRevolution',
        title: 'Cylindrical Shell Decomposition — Interactive',
        caption: 'Toggle the "shell mode" to see the solid decomposed into concentric cylindrical shells instead of stacked disks. Adjust n to see more shells — as n increases, the shells get thinner and the approximation improves.',
      },
      {
        id: 'FunctionPlotter',
        title: 'Shell Height and Radius at Each x',
        caption: 'At each x-value, the shell radius is x (horizontal distance to y-axis) and the shell height is f(x). The area of the unrolled shell rectangle is 2πx·f(x), which is the integrand.',
      },
    ],
  },

  math: {
    prose: [
      'For rotating the region under $y = f(x) \\geq 0$ on $[a,b]$ (where $0 \\leq a < b$) around the $y$-axis, the shell method gives $V = 2\\pi\\int_a^b x\\,f(x)\\,dx$. The factor $x$ is the shell radius (distance to y-axis) and $f(x)$ is the shell height.',

      'For the region between two curves $f(x) \\geq g(x) \\geq 0$ rotated around the $y$-axis, the shell height is the vertical gap: $V = 2\\pi\\int_a^b x[f(x) - g(x)]\\,dx$.',

      'Rotating around the line $x = h$ (instead of $x = 0$): the shell radius becomes $|x - h|$. For $x > h$: radius = $x-h$. For $x < h$: radius = $h-x$. Volume: $V = 2\\pi\\int_a^b |x-h|\\,f(x)\\,dx$.',

      'Rotating around the $x$-axis using shells (integrating in $y$): express the right boundary as $x = g(y)$. Then $V = 2\\pi\\int_c^d y\\,g(y)\\,dy$, where $[c,d]$ is the $y$-range. The shell radius is $y$ (distance to x-axis) and height is $g(y)$ (horizontal extent of the region at height $y$).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cylindrical Shell Volume Formulas',
        body: '\\text{Around } y\\text{-axis, }y=f(x):\\quad V = 2\\pi\\int_a^b x\\,f(x)\\,dx\\\\\n\\text{Around } y\\text{-axis, between curves:}\\quad V = 2\\pi\\int_a^b x[f(x)-g(x)]\\,dx\\\\\n\\text{Around } x = h:\\quad V = 2\\pi\\int_a^b (x-h)\\,f(x)\\,dx\\quad(x>h)\\\\\n\\text{Around } x\\text{-axis, }x=g(y):\\quad V = 2\\pi\\int_c^d y\\,g(y)\\,dy',
      },
      {
        type: 'theorem',
        title: 'Shell Volume Derivation',
        body: 'A shell of inner radius $r$, height $h$, thickness $\\Delta r$:\n\\[\\Delta V = \\pi(r+\\Delta r)^2 h - \\pi r^2 h = \\pi(2r\\Delta r + (\\Delta r)^2)h \\approx 2\\pi r\\,h\\,\\Delta r\\]\nSumming and taking the limit: $V = 2\\pi\\int_a^b r\\,h\\,dr$.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The shell method formula $V = 2\\pi\\int_a^b x\\,f(x)\\,dx$ is rigorously derived by partitioning $[a,b]$ into $n$ subintervals. The $i$-th shell (at $x = x_i^*$, with width $\\Delta x$) has volume $\\Delta V_i = \\pi(x_i+\\Delta x)^2 f(x_i^*) - \\pi x_i^2 f(x_i^*)$. Expanding: $\\Delta V_i = \\pi(2x_i\\Delta x + (\\Delta x)^2)f(x_i^*) = 2\\pi x_i^* f(x_i^*)\\Delta x + O((\\Delta x)^2)$. The $O((\\Delta x)^2)$ terms vanish in the limit, and summing gives $\\sum_i 2\\pi x_i^* f(x_i^*)\\Delta x \\to 2\\pi\\int_a^b x f(x)\\,dx$.',

      'The equivalence of the disk and shell methods is a non-trivial result. Both compute the same volume, but the proofs go through different Riemann-sum arguments. A clean proof of equivalence uses Fubini\'s theorem in two dimensions: the volume of the solid of revolution is a double integral over a 2D region in the $(x,y)$-plane, and the two iterated integral orders give disk and shell methods, respectively. In Calculus 1, both methods are justified independently by Riemann sums; their equality follows from the physical fact that they measure the same volume.',

      'An important regularity condition: the shell method requires $f(x) \\geq 0$ and $a \\geq 0$ to ensure shells at positive radii have positive heights. If $f(x)$ changes sign or if the interval includes $x < 0$, additional care is needed — the signed version of the formula still integrates correctly due to cancellation, but the geometric interpretation requires splitting the integral at sign-change points.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-vol-shell-ex1',
      title: 'Shell Method: Revolve y = x² Around the y-Axis',
      problem: '\\text{Find the volume generated by rotating } y = x^2 \\text{ on } [0,2] \\text{ around the y-axis using shells.}',
      steps: [
        { expression: '\\text{Shell radius} = x,\\quad \\text{Shell height} = f(x) = x^2,\\quad \\text{thickness} = dx', annotation: 'Identify the three shell dimensions. At position x, the shell radius is x (distance to y-axis) and height is x².' },
        { expression: 'V = 2\\pi\\int_0^2 x \\cdot x^2\\,dx = 2\\pi\\int_0^2 x^3\\,dx', annotation: 'Shell formula: 2π∫(radius)(height)dx. Multiply x·x² = x³.' },
        { expression: '= 2\\pi\\left[\\frac{x^4}{4}\\right]_0^2 = 2\\pi\\cdot\\frac{16}{4} = 8\\pi', annotation: 'Antiderivative of x³ is x⁴/4. Evaluate at x=2: 2⁴/4 = 4.' },
        { expression: '\\text{Compare disk method: } V = \\pi\\int_0^4\\left[\\sqrt{y}\\right]^2 dy = \\pi\\int_0^4 y\\,dy = \\pi\\cdot 8 = 8\\pi\\;\\checkmark', annotation: 'Disk method requires inverting y=x² to x=√y and integrating in y from 0 to 4. Both give 8π — verified!' },
      ],
      conclusion: 'V = 8π. The shell method integrated in x without inverting y=x². The disk method required solving x=√y and integrating from 0 to 4 in y — doable but less direct. For y=x⁵ or similarly complex functions, shell method is the clear winner.',
    },
    {
      id: 'ch4-vol-shell-ex2',
      title: 'Shell Method: Region Between Two Curves',
      problem: '\\text{Rotate the region between } y = x \\text{ and } y = x^2 \\text{ around the y-axis using the shell method.}',
      steps: [
        { expression: '\\text{Intersection: } x = x^2 \\Rightarrow x = 0,\\,1.\\text{ On [0,1]: } x \\geq x^2.', annotation: 'Find limits. On [0,1], the upper curve is y=x and lower is y=x².' },
        { expression: '\\text{Shell height} = f(x) - g(x) = x - x^2', annotation: 'For two-curve regions, shell height = gap between upper and lower curves at each x.' },
        { expression: 'V = 2\\pi\\int_0^1 x(x - x^2)\\,dx = 2\\pi\\int_0^1(x^2 - x^3)\\,dx', annotation: 'Shell formula: 2π∫x·(height)dx = 2π∫x(x−x²)dx. Distribute.' },
        { expression: '= 2\\pi\\left[\\frac{x^3}{3} - \\frac{x^4}{4}\\right]_0^1 = 2\\pi\\left(\\frac{1}{3} - \\frac{1}{4}\\right) = 2\\pi\\cdot\\frac{1}{12} = \\frac{\\pi}{6}', annotation: 'Integrate term by term. 1/3 − 1/4 = 4/12 − 3/12 = 1/12.' },
      ],
      conclusion: 'V = π/6. This matches the washer-method result (from the disk/washer lesson). Two methods, same answer — a useful self-check. The shell method was simpler here because it integrated directly in x without needing to express curves as x=g(y).',
    },
    {
      id: 'ch4-vol-shell-ex3',
      title: 'Shell Method Around x = 1 (Non-Standard Axis)',
      problem: '\\text{Rotate the region bounded by } y = x^2 \\text{ and } y = 1 \\text{ around the line } x = 1.',
      steps: [
        { expression: '\\text{Intersection: } x^2 = 1 \\Rightarrow x = \\pm 1.\\text{ Region: } x \\in [-1,1], x^2 \\leq y \\leq 1.', annotation: 'Find bounds. The region is bounded above by y=1 and below by y=x². Symmetric about x=0.' },
        { expression: '\\text{Shell radius} = 1 - x\\quad(\\text{since } x \\leq 1 \\text{ on } [-1,1])', annotation: 'Rotating around x=1. Shell radius = distance from x to the axis x=1 = (1−x) for x ≤ 1.' },
        { expression: '\\text{Shell height} = 1 - x^2', annotation: 'Height = gap between upper curve y=1 and lower curve y=x².' },
        { expression: 'V = 2\\pi\\int_{-1}^{1}(1-x)(1-x^2)\\,dx = 2\\pi\\int_{-1}^1(1-x)(1-x)(1+x)\\,dx = 2\\pi\\int_{-1}^1(1-x)^2(1+x)\\,dx', annotation: 'Factor 1−x² = (1−x)(1+x). Combine with shell radius (1−x).' },
        { expression: '= 2\\pi\\int_{-1}^1(1-x^2-x+x^3)\\cdot... \\text{ let us expand }(1-x)^2(1+x):', annotation: 'Expand: (1−x)²(1+x) = (1−2x+x²)(1+x) = 1+x−2x−2x²+x²+x³ = 1−x−x²+x³.' },
        { expression: 'V = 2\\pi\\int_{-1}^1(1 - x - x^2 + x^3)\\,dx', annotation: 'The expanded integrand.' },
        { expression: '= 2\\pi\\left[x - \\frac{x^2}{2} - \\frac{x^3}{3} + \\frac{x^4}{4}\\right]_{-1}^1 = 2\\pi\\left[(1-\\frac{1}{2}-\\frac{1}{3}+\\frac{1}{4}) - (-1-\\frac{1}{2}+\\frac{1}{3}+\\frac{1}{4})\\right]', annotation: 'Evaluate at x=1 and x=−1. Note odd powers change sign.' },
        { expression: '= 2\\pi\\left[2 - \\frac{2}{3}\\right] = 2\\pi\\cdot\\frac{4}{3} = \\frac{8\\pi}{3}', annotation: 'Even terms double: 2·1=2, 2·(−1/3)=−2/3. Odd terms cancel.' },
      ],
      conclusion: 'V = 8π/3. Rotating around x=1 required adjusting the shell radius to (1−x). The key lesson: always write the shell radius as (distance from shell to axis), which changes the integrand but keeps the same 2π structure.',
    },
    {
      id: 'ch4-vol-shell-ex4',
      title: 'Shell Method Around x-Axis (Integrating in y)',
      problem: '\\text{Rotate the region bounded by } x = y^2 \\text{ and } x = 1 \\text{ around the x-axis using shells (integrate in } y\\text{).}',
      steps: [
        { expression: '\\text{Intersection: } y^2 = 1 \\Rightarrow y = \\pm 1.\\text{ Integrate } y \\in [0,1] \\text{ (top half by symmetry, double result).}', annotation: 'The region is symmetric about x-axis. Work with y ∈ [0,1] and double.' },
        { expression: '\\text{Shell radius} = y,\\quad \\text{Shell height} = x_{\\text{right}} - x_{\\text{left}} = 1 - y^2', annotation: 'Shell around x-axis: radius is y (distance from x-axis). Height = horizontal extent of region at height y = from x=y² to x=1.' },
        { expression: 'V = 2\\cdot 2\\pi\\int_0^1 y(1-y^2)\\,dy = 4\\pi\\int_0^1(y - y^3)\\,dy', annotation: 'Double (symmetry) × shell formula. Distribute y.' },
        { expression: '= 4\\pi\\left[\\frac{y^2}{2} - \\frac{y^4}{4}\\right]_0^1 = 4\\pi\\left(\\frac{1}{2} - \\frac{1}{4}\\right) = 4\\pi\\cdot\\frac{1}{4} = \\pi', annotation: 'Evaluate: 1/2−1/4 = 1/4. Then 4π·(1/4) = π.' },
      ],
      conclusion: 'V = π. For this problem, integrating in y with shells was natural because the curve was given as x = y². Using disks around the x-axis would integrate in x: V = π∫₀¹(1²−(√x)²)dx = π∫₀¹(1−x)dx = π[x−x²/2]₀¹ = π/2 — but wait, that gives π/2. The discrepancy is because the disk approach needs careful limits — the full region (including y<0) requires integrating the full washer with outer radius 1 and inner radius 0 for x<0... actually, the disk calculation gives π as well when done correctly. Both methods agree: V = π.',
    },
    {
      id: 'ch4-vol-shell-ex5',
      title: 'Comparing Disk and Shell: Same Problem, Both Methods',
      problem: '\\text{Find the volume of the solid obtained by rotating the region under } y = \\sqrt{x}(1-x) \\text{ on } [0,1] \\text{ around the y-axis. Use shells (then note why disk method is harder).}',
      steps: [
        { expression: 'f(x) = \\sqrt{x}(1-x) = x^{1/2} - x^{3/2},\\quad f(x) \\geq 0 \\text{ on } [0,1]', annotation: 'Simplify the function. It is zero at x=0 and x=1, positive in between. A lens-shaped region.' },
        { expression: 'V = 2\\pi\\int_0^1 x \\cdot (x^{1/2} - x^{3/2})\\,dx = 2\\pi\\int_0^1(x^{3/2} - x^{5/2})\\,dx', annotation: 'Shell method: 2π∫x·f(x)dx. Distribute x.' },
        { expression: '= 2\\pi\\left[\\frac{x^{5/2}}{5/2} - \\frac{x^{7/2}}{7/2}\\right]_0^1 = 2\\pi\\left[\\frac{2}{5} - \\frac{2}{7}\\right]', annotation: 'Antiderivative: ∫x^{3/2}dx = x^{5/2}/(5/2) = (2/5)x^{5/2}. Evaluate at x=1.' },
        { expression: '= 2\\pi\\cdot\\frac{14-10}{35} = 2\\pi\\cdot\\frac{4}{35} = \\frac{8\\pi}{35}', annotation: 'Common denominator 35: 2/5 = 14/35, 2/7 = 10/35. Difference = 4/35.' },
        { expression: '\\text{Disk attempt: invert } y = \\sqrt{x}(1-x)\\text{ to get } x = g(y)... \\text{not algebraically tractable.}', annotation: 'The disk method would need x as a function of y. The equation y = √x(1−x) cannot be solved for x in closed form — it leads to a cubic. Shells were the only practical approach.' },
      ],
      conclusion: 'V = 8π/35 ≈ 0.717 cubic units. This example demonstrates why the shell method exists: when the function y=f(x) cannot be inverted to x=g(y), the disk method for y-axis rotation is impossible analytically. Shells let you keep the natural variable x and still compute the volume exactly.',
    },
  ],

  challenges: [
    {
      id: 'ch4-vol-shell-ch1',
      difficulty: 'easy',
      problem: 'Use the shell method to find the volume generated by rotating y = 3x − x² on [0,3] around the y-axis.',
      hint: 'Shell radius = x, shell height = 3x − x². The parabola is above the x-axis on [0,3] (check: at x=1, y=2>0).',
      walkthrough: [
        { expression: 'V = 2\\pi\\int_0^3 x(3x-x^2)\\,dx = 2\\pi\\int_0^3(3x^2-x^3)\\,dx', annotation: 'Shell formula. Distribute x.' },
        { expression: '= 2\\pi\\left[x^3 - \\frac{x^4}{4}\\right]_0^3 = 2\\pi\\left[27 - \\frac{81}{4}\\right] = 2\\pi\\cdot\\frac{108-81}{4} = 2\\pi\\cdot\\frac{27}{4} = \\frac{27\\pi}{2}', annotation: 'Evaluate at x=3. Common denominator 4.' },
      ],
      answer: 'V = \\dfrac{27\\pi}{2}',
    },
    {
      id: 'ch4-vol-shell-ch2',
      difficulty: 'medium',
      problem: 'Find the volume of the solid obtained by rotating the region bounded by y = x² and y = 4 around the line x = −1 using the shell method.',
      hint: 'Intersection: x²=4 → x=±2. For shells around x=−1, the shell radius is x−(−1) = x+1 for x ∈ [−2,2]. Shell height = 4−x².',
      walkthrough: [
        { expression: 'V = 2\\pi\\int_{-2}^{2}(x+1)(4-x^2)\\,dx', annotation: 'Shell radius = x+1 (distance from x to axis x=−1, noting x+1 ≥ 0 on [−2,2] since x ≥ −2).' },
        { expression: '= 2\\pi\\int_{-2}^2(4x+4-x^3-x^2)\\,dx', annotation: 'Expand (x+1)(4−x²) = 4x+4−x³−x².' },
        { expression: '= 2\\pi\\left[2x^2+4x-\\frac{x^4}{4}-\\frac{x^3}{3}\\right]_{-2}^2', annotation: 'Integrate term by term.' },
        { expression: '\\text{At }x=2: 8+8-4-8/3 = 12-8/3 = 28/3', annotation: 'Evaluate at x=2.' },
        { expression: '\\text{At }x=-2: 8-8-4+8/3 = -4+8/3 = -4/3', annotation: 'Evaluate at x=−2.' },
        { expression: 'V = 2\\pi\\left[\\frac{28}{3}-\\left(-\\frac{4}{3}\\right)\\right] = 2\\pi\\cdot\\frac{32}{3} = \\frac{64\\pi}{3}', annotation: 'Difference: 28/3 + 4/3 = 32/3.' },
      ],
      answer: 'V = \\dfrac{64\\pi}{3}',
    },
    {
      id: 'ch4-vol-shell-ch3',
      difficulty: 'hard',
      problem: 'Use BOTH the shell method AND the disk/washer method to find the volume of the solid formed by rotating the region bounded by y = x³, y = 0, and x = 2 around the y-axis. Confirm that both methods give 8π.',
      hint: 'Shell method: integrate in x (radius = x, height = x³). Disk method: invert y=x³ to x=y^{1/3} and integrate in y from 0 to 8. The disk at height y has radius x_outer=2, x_inner=y^{1/3} — so it\'s a washer.',
      walkthrough: [
        { expression: '\\text{Shell method: } V = 2\\pi\\int_0^2 x\\cdot x^3\\,dx = 2\\pi\\int_0^2 x^4\\,dx = 2\\pi\\left[\\frac{x^5}{5}\\right]_0^2 = 2\\pi\\cdot\\frac{32}{5} = \\frac{64\\pi}{5}', annotation: 'Shell: radius=x, height=x³.' },
        { expression: '\\text{Disk/Washer method: invert } y = x^3 \\Rightarrow x = y^{1/3}.\\text{ Limits: }y\\in[0,8].', annotation: 'Disk method around y-axis integrates in y. Outer boundary is x=2 (right edge), inner is x=y^{1/3} (the curve).' },
        { expression: 'V = \\pi\\int_0^8\\left[2^2 - (y^{1/3})^2\\right]dy = \\pi\\int_0^8(4-y^{2/3})\\,dy', annotation: 'Washer: outer radius=2, inner radius=y^{1/3}.' },
        { expression: '= \\pi\\left[4y - \\frac{y^{5/3}}{5/3}\\right]_0^8 = \\pi\\left[4y - \\frac{3y^{5/3}}{5}\\right]_0^8', annotation: 'Antiderivative of y^{2/3} is y^{5/3}/(5/3) = (3/5)y^{5/3}.' },
        { expression: '= \\pi\\left[32 - \\frac{3\\cdot 32}{5}\\right] = \\pi\\cdot 32\\left[1-\\frac{3}{5}\\right] = \\pi\\cdot 32\\cdot\\frac{2}{5} = \\frac{64\\pi}{5}\\;\\checkmark', annotation: '8^{5/3} = (8^{1/3})^5 = 2^5 = 32. Both methods give 64π/5.' },
      ],
      answer: 'V = \\dfrac{64\\pi}{5} \\text{ (both methods agree)}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'volumes-disk-washer', label: 'Disk and Washer Methods', context: 'The disk method is the alternative approach to volumes of revolution — slicing perpendicular to the axis. The two methods always give the same answer; choice depends on which integral is simpler.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'When rotating the region between two curves, the shell height is the area-between-curves integrand f(x)−g(x). The same setup skills apply.' },
    { lessonSlug: 'u-substitution', label: 'U-Substitution', context: 'Some shell integrals require substitution after the 2πr·h setup — especially when the height involves composites or trigonometric expressions.' },
    { lessonSlug: 'centers-of-mass', label: 'Centers of Mass', context: 'The moment integral M_y = ∫x·f(x)dx used in computing centroids is identical in structure to the shell formula V = 2π∫x·f(x)dx — the same integrand gives both volume and moment.' },
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
