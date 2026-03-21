export default {
  id: 'ch4-vol-disk',
  slug: 'volumes-disk-washer',
  chapter: 4,
  order: 13,
  title: 'Volumes: Disk and Washer Methods',
  subtitle: 'Rotate a curve around an axis and integrate circular cross-sections to find solid volume',
  tags: ['volume', 'disk method', 'washer method', 'revolution', 'cross section', 'solid of revolution', 'lathe'],

  hook: {
    question: 'A machinist sets a cylindrical rod on a lathe and carves it into a custom shape by rotating a cutting tool along the profile curve. How do engineers calculate exactly how much material is removed — and how much volume the finished part contains?',
    realWorldContext:
      'Every object with rotational symmetry — bolts, pistons, wine glasses, bullets, axles, vases, turbine blades — is a solid of revolution. ' +
      'Machinists on CNC lathes define the shape by a 2D profile curve, then rotate it 360° around the spindle axis. ' +
      'The volume of any such object is computed by integrating the areas of circular cross-sections perpendicular to the axis. ' +
      'Wine barrel volume was historically estimated using Kepler\'s "Doliometria" (barrel measurement) — an early precursor to integral calculus. ' +
      'In CT scanning, a patient\'s organ is reconstructed by stacking circular cross-section images — exactly the disk method run in reverse (given A(x), compute the 3D solid). ' +
      'Ammunition manufacturers use the washer method to compute the interior volume of hollow-point bullets, ensuring the correct propellant-to-cavity ratio for ballistic performance.',
    previewVisualizationId: 'VolumesOfRevolution',
  },

  intuition: {
    prose: [
      'Picture the curve y = f(x) over [a, b]. Grab one end and spin the entire curve 360° around the x-axis. The result is a 3D solid — like a vase or a football. Now imagine slicing that solid with a knife perpendicular to the x-axis at some position x. The slice is a perfect circle (a disk) whose radius equals the height of the original curve: r = f(x). The area of that thin circular slice is πr² = π[f(x)]².',

      'To find the total volume, stack infinitely many such slices. A slice of thickness dx has volume dV = π[f(x)]² dx. Summing (integrating) over all x from a to b gives the Disk Method: V = π∫ₐᵇ [f(x)]² dx. The logic mirrors every other integral setup: identify the tiny piece, write its contribution, then integrate.',

      'The Washer Method handles the case where you rotate the region between two curves f(x) ≥ g(x) ≥ 0 around the x-axis. Each cross-section is now a washer (an annulus) — a disk with a hole. The outer radius is R = f(x) and the inner radius is r = g(x). Area of a washer = π(R² − r²). Volume = π∫ₐᵇ [f(x)² − g(x)²] dx. Think of it as the disk from the outer curve minus the disk from the inner curve.',

      'Rotating around the y-axis instead? You can still use the disk/washer method, but you need to integrate in y and express x as a function of y. If y = f(x), solve for x = f⁻¹(y) = g(y), then V = π∫ [g(y)]² dy over the appropriate y-range. This is natural when the function is already given as x = h(y), but requires inverting when you have y = f(x).',

      'Rotating around a line other than a coordinate axis is common in applications — for example, revolving around y = −1 or around x = 3. The key is that the disk radius is the distance from the curve to the axis of rotation. If rotating y = f(x) around y = k, the radius at x is |f(x) − k|. Always sketch the problem: identify which side of the axis the region lies on, then write the radius as (larger) − (smaller) to keep it positive.',

      'Cross-section visualization is the bridge between the 2D curve and the 3D solid. At every x, there is a circle of radius f(x). The 3D solid is the union of all these circles. Moving x across [a, b] sweeps out the entire object. This "known cross-section" viewpoint generalizes far beyond circles — squares, triangles, or any shape can be the cross-section, giving more exotic solids (explored in advanced calculus).',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'When to Use Disk vs. Washer',
        body: 'Disk method: region between the curve and the axis itself (no hole in cross-section). Washer method: region between two curves f(x) ≥ g(x) ≥ 0 (hole present). If g(x) = 0 (the curve meets the axis), the washer collapses to a disk. Key step: always identify R (outer radius) and r (inner radius) before writing the integral.',
      },
      {
        type: 'strategy',
        title: 'Rotating Around y = k: Adjust the Radius',
        body: 'Rotating y = f(x) around the line y = k (not the x-axis): disk radius = f(x) − k if f(x) > k, or k − f(x) if f(x) < k. For a washer around y = k: R = f(x) − k, r = g(x) − k (when both curves are above the axis y = k). Sketch first — it is easy to get signs wrong without a picture.',
      },
      {
        type: 'real-world',
        title: 'Manufacturing and the Lathe',
        body: 'A lathe rotates a metal rod at high speed; a cutting tool traces a profile curve to remove material. The volume of metal removed is a washer-method integral: V = π∫(R_outer² − r_inner²) dx, where R_outer is the rod radius and r_inner is the finished-part profile. This calculation determines machining time, chip disposal, and material cost.',
      },
      {
        type: 'intuition',
        title: 'The Disk Is a Very Thin Cylinder',
        body: 'A cylinder of radius r and height h has volume V = πr²h. For a thin slice at position x with thickness dx, this becomes dV = π[f(x)]² dx. Integrating is just summing infinitely many such cylinders. The identical logic gives V = ∫A(x) dx whenever you know the cross-sectional area A(x) — a powerful generalization.',
      },
      {
        type: 'misconception',
        title: 'Common Mistake: Squaring Before Subtracting vs. Subtracting Before Squaring',
        body: 'Washer: V = π∫(R² − r²) dx. Do NOT write π∫(R − r)² dx. The washer area is π(R²) − π(r²), not π(R−r)². These are different: (R²−r²) = (R−r)(R+r) ≠ (R−r)². Setting up the integral with (R−r)² is a very common and costly error — always square each radius separately, then subtract.',
      },
    ],
    visualizations: [
      {
        id: 'VolumesOfRevolution',
        title: 'Disk and Washer Cross-Sections — Interactive',
        caption: 'Drag the slider to move the cross-section plane along the x-axis. Watch the circular (or annular) cross-section change radius as it follows the curve. Toggle the washer mode to see the inner hole appear when a second curve is added.',
      },
      {
        id: 'RiemannSum',
        title: 'Approximating Volume with Stacked Disks',
        caption: 'Increase n (number of disks) to see the approximation converge to the exact volume. Each disk contributes π[f(xᵢ)]²·Δx to the sum.',
      },
    ],
  },

  math: {
    prose: [
      'The disk method is a direct application of the general cross-section volume formula. If a solid has cross-sectional area $A(x)$ at each position $x \\in [a,b]$, its volume is $V = \\int_a^b A(x)\\,dx$. For rotation around the $x$-axis, each cross-section is a disk of radius $f(x)$, so $A(x) = \\pi[f(x)]^2$, giving $V = \\pi\\int_a^b [f(x)]^2\\,dx$.',

      'The washer method applies when the region between $f(x) \\geq g(x) \\geq 0$ is rotated around the $x$-axis. The cross-section at $x$ is an annulus with outer radius $R = f(x)$ and inner radius $r = g(x)$. Its area is $A(x) = \\pi R^2 - \\pi r^2 = \\pi([f(x)]^2 - [g(x)]^2)$. Therefore $V = \\pi\\int_a^b\\left([f(x)]^2 - [g(x)]^2\\right)dx$.',

      'Rotating around the $y$-axis using the disk method requires integrating with respect to $y$. Express the boundary as $x = g(y)$ and integrate: $V = \\pi\\int_c^d [g(y)]^2\\,dy$, where $[c,d]$ is the $y$-range of the solid.',

      'Rotating around the horizontal line $y = k$: the disk radius becomes $|f(x) - k|$ and the volume is $V = \\pi\\int_a^b [f(x)-k]^2\\,dx$. For the washer case with two curves both above $y = k$: outer radius $R = f(x) - k$, inner radius $r = g(x) - k$, and $V = \\pi\\int_a^b\\left([f(x)-k]^2 - [g(x)-k]^2\\right)dx$.',

      'All these formulas are special cases of $V = \\int_a^b A(x)\\,dx$. The integrand is always the area of one cross-section expressed in terms of the integration variable. Mastering the setup — identifying the axis, the radii, and the limits — is the skill; the integration itself follows standard techniques.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Disk and Washer Volume Formulas',
        body: '\\text{Disk (rotation around } x\\text{-axis):}\\quad V = \\pi\\int_a^b [f(x)]^2\\,dx\\\\\n\\text{Washer (rotation around } x\\text{-axis):}\\quad V = \\pi\\int_a^b \\left([f(x)]^2 - [g(x)]^2\\right)dx\\\\\n\\text{Disk (rotation around } y\\text{-axis):}\\quad V = \\pi\\int_c^d [g(y)]^2\\,dy\\\\\n\\text{Disk around } y = k:\\quad V = \\pi\\int_a^b [f(x) - k]^2\\,dx',
      },
      {
        type: 'theorem',
        title: 'General Cross-Section Formula',
        body: 'If $A(x)$ is the cross-sectional area of a solid at position $x$, then\n\\[V = \\int_a^b A(x)\\,dx.\\]\nThe disk and washer methods are special cases where $A(x)$ is the area of a circle or annulus.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The disk method formula is rigorously derived from the definition of the definite integral and Cavalieri\'s principle. Given $f$ continuous and non-negative on $[a,b]$, partition the interval into $n$ subintervals of width $\\Delta x = (b-a)/n$. At each sample point $x_i^*$, the thin disk has radius $f(x_i^*)$ and volume $\\pi[f(x_i^*)]^2\\Delta x$. The total volume is approximated by $\\sum_{i=1}^n \\pi[f(x_i^*)]^2\\Delta x$, a Riemann sum for the function $\\pi[f(x)]^2$. As $n\\to\\infty$, this converges to $\\pi\\int_a^b [f(x)]^2\\,dx$ by the definition of the definite integral. The argument is valid whenever $f$ is integrable (continuous suffices).',

      'The washer volume $V = \\pi\\int_a^b([f(x)]^2 - [g(x)]^2)dx$ follows from linearity of the integral: the washer area $\\pi(R^2 - r^2)$ is additive, so the washer volume is the difference of the two disk volumes. Equivalently, Cavalieri\'s principle says that two solids with equal cross-sectional areas at every height have equal volumes — so the hole truly "subtracts" volume linearly.',

      'A subtlety arises when $g(x) < 0$ or when the axis of rotation is not a coordinate axis. In those cases, the radius is an absolute value: $r = |f(x) - k|$, and since we integrate $r^2$, the absolute value disappears (squaring is always non-negative). The formula $V = \\pi\\int_a^b (f(x)-k)^2\\,dx$ is therefore valid without absolute values, as long as the sign of $(f(x)-k)$ is consistent across $[a,b]$. When $f(x)$ crosses the axis $y=k$, additional care is needed to split the integral at the crossing.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-vol-disk-ex1',
      title: 'Disk Method: Revolve y = √x Around the x-Axis',
      problem: '\\text{Find the volume of the solid obtained by rotating } y = \\sqrt{x} \\text{ on } [0,4] \\text{ around the x-axis.}',
      steps: [
        { expression: 'r(x) = f(x) = \\sqrt{x}', annotation: 'At each x, the disk radius equals the curve height. Sketch: the solid looks like a paraboloid.' },
        { expression: 'V = \\pi\\int_0^4 [\\sqrt{x}]^2\\,dx = \\pi\\int_0^4 x\\,dx', annotation: 'Apply the disk formula. Squaring eliminates the square root — a great simplification!' },
        { expression: '= \\pi\\left[\\frac{x^2}{2}\\right]_0^4 = \\pi\\cdot\\frac{16}{2} = 8\\pi', annotation: 'Antiderivative of x is x²/2. Evaluate at x = 4: 4²/2 = 8.' },
      ],
      conclusion: 'V = 8π ≈ 25.1 cubic units. Note how squaring √x gives just x — the integral becomes trivial. The resulting paraboloid solid is wider at x=4 (radius 2) and comes to a point at x=0.',
    },
    {
      id: 'ch4-vol-disk-ex2',
      title: 'Disk Method: Revolve y = x² Around the x-Axis',
      problem: '\\text{Find the volume of the solid obtained by rotating } y = x^2 \\text{ on } [0,2] \\text{ around the x-axis.}',
      steps: [
        { expression: 'r(x) = x^2', annotation: 'The disk radius at position x is x². At x=0, radius is 0; at x=2, radius is 4. The solid is narrower near 0 and wide at 2.' },
        { expression: 'V = \\pi\\int_0^2 [x^2]^2\\,dx = \\pi\\int_0^2 x^4\\,dx', annotation: 'Disk method: square the radius function.' },
        { expression: '= \\pi\\left[\\frac{x^5}{5}\\right]_0^2 = \\pi\\cdot\\frac{32}{5} = \\frac{32\\pi}{5}', annotation: 'Antiderivative of x⁴ is x⁵/5. Evaluate at x=2: 2⁵/5 = 32/5.' },
      ],
      conclusion: 'V = 32π/5 ≈ 20.1 cubic units. Compare this with the y=√x result (8π). Although both functions span x ∈ [0,2] (for y=x²) and x ∈ [0,4] (for y=√x), x² grows faster, giving larger radii near x=2 and a different-shaped solid.',
    },
    {
      id: 'ch4-vol-disk-ex3',
      title: 'Washer Method: Region Between y = x and y = x²',
      problem: '\\text{Rotate the region bounded by } y = x \\text{ and } y = x^2 \\text{ around the x-axis. Find the volume.}',
      steps: [
        { expression: '\\text{Intersection: } x = x^2 \\Rightarrow x(x-1)=0 \\Rightarrow x=0,\\,1', annotation: 'Find where the curves meet to get integration limits. On [0,1], x ≥ x² (check x=1/2: 1/2 > 1/4).' },
        { expression: 'R(x) = x,\\quad r(x) = x^2', annotation: 'Outer radius is the upper curve (y=x) and inner radius is the lower curve (y=x²). Both are non-negative on [0,1].' },
        { expression: 'V = \\pi\\int_0^1\\left([x]^2 - [x^2]^2\\right)dx = \\pi\\int_0^1(x^2 - x^4)\\,dx', annotation: 'Washer formula: π∫(R²−r²)dx. Square each radius function separately.' },
        { expression: '= \\pi\\left[\\frac{x^3}{3} - \\frac{x^5}{5}\\right]_0^1 = \\pi\\left(\\frac{1}{3} - \\frac{1}{5}\\right)', annotation: 'Integrate term by term.' },
        { expression: '= \\pi\\cdot\\frac{5-3}{15} = \\frac{2\\pi}{15}', annotation: 'Common denominator: 1/3 − 1/5 = 5/15 − 3/15 = 2/15.' },
      ],
      conclusion: 'V = 2π/15 ≈ 0.419 cubic units. The washer method neatly handles the hole in the solid by subtracting the inner disk volume. Note: the hole is created by y=x² (the lower curve), which stays away from the x-axis and blocks the interior.',
    },
    {
      id: 'ch4-vol-disk-ex4',
      title: 'Washer Method: Revolve Around y = −1',
      problem: '\\text{Rotate the region between } y = \\sqrt{x} \\text{ and } y = 0 \\text{ on } [0,4] \\text{ around the line } y = -1.',
      steps: [
        { expression: '\\text{Axis: } y = -1.\\text{ Both curves are above this axis on }[0,4].', annotation: 'Draw the setup: the region lies above the x-axis (y=0), which is itself above the axis y=−1. Both curves generate washers with a hole.' },
        { expression: 'R(x) = \\sqrt{x} - (-1) = \\sqrt{x} + 1', annotation: 'Outer radius = distance from the axis y=−1 to the upper curve y=√x. Distance = √x − (−1) = √x + 1.' },
        { expression: 'r(x) = 0 - (-1) = 1', annotation: 'Inner radius = distance from the axis y=−1 to the lower curve y=0. Distance = 0 − (−1) = 1.' },
        { expression: 'V = \\pi\\int_0^4\\left[(\\sqrt{x}+1)^2 - 1^2\\right]dx = \\pi\\int_0^4\\left(x + 2\\sqrt{x} + 1 - 1\\right)dx', annotation: 'Expand (√x+1)² = x + 2√x + 1, then subtract r²=1.' },
        { expression: '= \\pi\\int_0^4\\left(x + 2x^{1/2}\\right)dx = \\pi\\left[\\frac{x^2}{2} + \\frac{4x^{3/2}}{3}\\right]_0^4', annotation: 'Integrate: ∫x dx = x²/2, ∫2x^{1/2} dx = 2·(2/3)x^{3/2} = (4/3)x^{3/2}.' },
        { expression: '= \\pi\\left[\\frac{16}{2} + \\frac{4\\cdot 8}{3}\\right] = \\pi\\left[8 + \\frac{32}{3}\\right] = \\frac{56\\pi}{3}', annotation: 'Evaluate at x=4: x^{3/2} = 4^{3/2} = 8. Common denominator: 24/3 + 32/3 = 56/3.' },
      ],
      conclusion: 'V = 56π/3 ≈ 58.6 cubic units. Rotating around y=−1 instead of y=0 increases the volume because the axis is further away, making all radii larger. The inner radius of 1 (from the x-axis to the axis y=−1) creates a cylindrical hole through the solid.',
    },
    {
      id: 'ch4-vol-disk-ex5',
      title: 'Disk Method Around the y-Axis: Wine Barrel Shape',
      problem: '\\text{Rotate } x = 2 + \\cos(\\pi y/2) \\text{ around the y-axis on } y \\in [-1,1] \\text{ to model a barrel cross-section. Find the volume.}',
      steps: [
        { expression: 'g(y) = 2 + \\cos(\\pi y/2)', annotation: 'The profile curve expressed as x = g(y): at y=0 (middle), x = 2+1 = 3 (widest point); at y=±1 (ends), x = 2+0 = 2 (narrowest). Natural barrel shape.' },
        { expression: 'V = \\pi\\int_{-1}^{1}[g(y)]^2\\,dy = \\pi\\int_{-1}^1\\left(2 + \\cos\\frac{\\pi y}{2}\\right)^2dy', annotation: 'Disk method around y-axis: integrate [radius]² with respect to y.' },
        { expression: '= \\pi\\int_{-1}^1\\left(4 + 4\\cos\\frac{\\pi y}{2} + \\cos^2\\frac{\\pi y}{2}\\right)dy', annotation: 'Expand the square: (2 + cos θ)² = 4 + 4cos θ + cos²θ.' },
        { expression: '\\cos^2\\frac{\\pi y}{2} = \\frac{1}{2}\\left(1 + \\cos(\\pi y)\\right)', annotation: 'Use the identity cos²θ = (1+cos 2θ)/2 with θ = πy/2, so 2θ = πy.' },
        { expression: '= \\pi\\int_{-1}^1\\left(4 + 4\\cos\\frac{\\pi y}{2} + \\frac{1}{2} + \\frac{1}{2}\\cos(\\pi y)\\right)dy = \\pi\\int_{-1}^1\\left(\\frac{9}{2} + 4\\cos\\frac{\\pi y}{2} + \\frac{1}{2}\\cos(\\pi y)\\right)dy', annotation: 'Combine constants: 4 + 1/2 = 9/2.' },
        { expression: '= \\pi\\left[\\frac{9y}{2} + \\frac{8}{\\pi}\\sin\\frac{\\pi y}{2} + \\frac{1}{2\\pi}\\sin(\\pi y)\\right]_{-1}^{1}', annotation: 'Integrate: ∫cos(πy/2)dy = (2/π)sin(πy/2). Evaluate at y=±1.' },
        { expression: '= \\pi\\left[\\left(\\frac{9}{2} + \\frac{8}{\\pi} + 0\\right) - \\left(-\\frac{9}{2} - \\frac{8}{\\pi} + 0\\right)\\right] = \\pi\\left[9 + \\frac{16}{\\pi}\\right] = 9\\pi + 16', annotation: 'At y=1: sin(π/2)=1, sin(π)=0. At y=−1: sin(−π/2)=−1, sin(−π)=0. Differences double.' },
      ],
      conclusion: 'V = 9π + 16 ≈ 44.3 cubic units. This barrel model has a gently curved stave profile. The trigonometric profile is more realistic than a straight-sided cylinder (V = π·4·2 = 8π ≈ 25.1 for a cylinder of radius 2 and height 2), capturing the barrel\'s characteristic bulge.',
    },
  ],

  challenges: [
    {
      id: 'ch4-vol-disk-ch1',
      difficulty: 'easy',
      problem: 'Use the disk method to find the volume of a sphere of radius R by rotating y = √(R² − x²) around the x-axis on [−R, R]. Verify that you get (4/3)πR³.',
      hint: 'Squaring √(R²−x²) gives R²−x², a simple polynomial. The limits are symmetric, so you can integrate on [0,R] and double.',
      walkthrough: [
        { expression: 'V = \\pi\\int_{-R}^R\\left(\\sqrt{R^2-x^2}\\right)^2 dx = \\pi\\int_{-R}^R(R^2-x^2)\\,dx', annotation: 'Disk method — squaring eliminates the square root.' },
        { expression: '= \\pi\\left[R^2 x - \\frac{x^3}{3}\\right]_{-R}^R = \\pi\\left[(R^3-\\frac{R^3}{3}) - (-R^3+\\frac{R^3}{3})\\right]', annotation: 'Evaluate at both limits.' },
        { expression: '= \\pi\\left[\\frac{2R^3}{3} + \\frac{2R^3}{3}\\right] = \\frac{4\\pi R^3}{3}\\;\\checkmark', annotation: 'Combine: 2 × (2R³/3) = 4R³/3.' },
      ],
      answer: 'V = \\dfrac{4}{3}\\pi R^3',
    },
    {
      id: 'ch4-vol-disk-ch2',
      difficulty: 'medium',
      problem: 'Find the volume of the solid generated by rotating the region bounded by y = x² and y = 2x around the line y = −2. Set up and evaluate the washer integral.',
      hint: 'Intersection: x²=2x → x=0,2. On [0,2]: 2x ≥ x². Axis is y=−2, so radii are (curve value − (−2)) = curve value + 2.',
      walkthrough: [
        { expression: 'R(x) = 2x - (-2) = 2x+2,\\quad r(x) = x^2 - (-2) = x^2+2', annotation: 'Outer radius from axis y=−2 to upper curve y=2x; inner radius to lower curve y=x².' },
        { expression: 'V = \\pi\\int_0^2\\left[(2x+2)^2-(x^2+2)^2\\right]dx', annotation: 'Washer formula with shifted radii.' },
        { expression: '= \\pi\\int_0^2\\left[(4x^2+8x+4)-(x^4+4x^2+4)\\right]dx = \\pi\\int_0^2(8x-x^4)\\,dx', annotation: 'Expand and simplify: 4x²−4x² and 4−4 cancel.' },
        { expression: '= \\pi\\left[4x^2 - \\frac{x^5}{5}\\right]_0^2 = \\pi\\left[16 - \\frac{32}{5}\\right] = \\pi\\cdot\\frac{48}{5} = \\frac{48\\pi}{5}', annotation: '4(4)=16=80/5; 32/5; difference = 48/5.' },
      ],
      answer: 'V = \\dfrac{48\\pi}{5}',
    },
    {
      id: 'ch4-vol-disk-ch3',
      difficulty: 'hard',
      problem: 'A bullet profile is given by the curve x = (1/4)y² on the right, for y ∈ [−2, 2] (nose portion). Rotate this around the x-axis to form the bullet nose. Find the volume using the disk method integrated in y, and also set up (but do not evaluate) the disk integral in x.',
      hint: 'For the y-integral: x = g(y) = y²/4, so V = π∫(y²/4)² ... wait — think carefully about which variable is which. The curve x = y²/4 rotated around the x-axis: at each x, the radius is y = √(4x) = 2√x. So for the x-integral: V = π∫[2√x]² dx = π∫4x dx.',
      walkthrough: [
        { expression: '\\text{Express radius as function of } x: y = 2\\sqrt{x} \\text{ (from } x = y^2/4\\text{)}', annotation: 'The bullet nose: when y ranges from 0 to 2, x ranges from 0 to 1. Radius at x is 2√x.' },
        { expression: 'V = \\pi\\int_0^1[2\\sqrt{x}]^2\\,dx = 4\\pi\\int_0^1 x\\,dx = 4\\pi\\left[\\frac{x^2}{2}\\right]_0^1 = 2\\pi', annotation: 'Disk method in x, squaring 2√x = 4x.' },
        { expression: '\\text{Verify in y: the solid sweeps } y\\in[0,2],\\text{ so integrate in } y \\text{ as shell radius}', annotation: 'Actually for disk around x-axis integrated in y, we would use the Shell method — this double-checks the setup.' },
        { expression: '\\text{Bullet nose volume } = 2\\pi \\approx 6.28 \\text{ cubic units.}', annotation: 'A compact but well-defined volume for the curved nose section.' },
      ],
      answer: 'V = 2\\pi',
    },
  ],

  crossRefs: [
    { lessonSlug: 'volumes-shell', label: 'Cylindrical Shell Method', context: 'The shell method is an alternative that avoids inverting y=f(x) when rotating around the y-axis — often simpler for the same problem.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'The washer method extends area-between-curves logic into 3D: the region between two curves becomes the cross-section of a solid.' },
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'All volume integrals are definite integrals of cross-sectional area — review Riemann sums to understand why the disk method works.' },
    { lessonSlug: 'centers-of-mass', label: 'Centers of Mass and Pappus\'s Theorem', context: 'Pappus\'s theorem gives volume of revolution directly from the centroid — a shortcut that connects geometry and integration.' },
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
