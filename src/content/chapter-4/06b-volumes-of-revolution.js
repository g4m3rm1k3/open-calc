// FILE: src/content/chapter-4/06b-volumes-of-revolution.js
// Note: This lesson comes after u-substitution (06) in Chapter 4's applications arc
export default {
  id: 'ch4-006b',
  slug: 'volumes-of-revolution',
  chapter: 4,
  order: 6.5,
  title: 'Volumes of Revolution',
  subtitle: 'Rotating curves around axes generates 3D solids — Disk, Washer, and Shell methods',
  tags: ['volume', 'disk method', 'washer method', 'shell method', 'solid of revolution', 'Pappus', 'rotation', 'definite integral', '3D'],

  hook: {
    question: 'How do you compute the volume of a vase, a bullet, or a donut? If the object has rotational symmetry — like virtually any machined part — you can generate it by rotating a 2D curve around an axis. Its volume is then a definite integral.',
    realWorldContext:
      'Volumes of revolution are fundamental to manufacturing and engineering. Every lathe-turned object — wheels, axles, bolts, pistons, wine glasses, vases, turbine blades — is a solid of revolution. ' +
      'Pharmaceutical capsules are ellipsoids of revolution; their fill volumes require integration. ' +
      'The fuel tank on a rocket nose cone is a paraboloid (parabola rotated around its axis); its volume is π∫r²dx. ' +
      'In medicine, CT scans reconstruct 3D organ volumes by rotating 2D cross-sections — the mathematical structure is the disk method. ' +
      'Pappus\'s theorem (a 4th-century Greek result) computes the volume of any solid of revolution using the centroid of the generating region: V = 2πr̄A — no calculus, just clever geometry.',
    previewVisualizationId: 'VolumesOfRevolution',
  },

  intuition: {
    prose: [
      'Imagine spinning the region under y = f(x) on [a, b] around the x-axis. At each x-position, the spinning creates a circular cross-section (a disk) of radius r = f(x) and area πr² = π[f(x)]². The volume is the limit of the sum of thin disk volumes: ∑ π[f(x)]² Δx → ∫ₐᵇ π[f(x)]² dx. This is the **Disk Method**.',

      'When the region is between two curves f(x) ≥ g(x) ≥ 0 and you rotate around the x-axis, each cross-section is a **washer** with outer radius R = f(x) and inner radius r = g(x). Area of washer = π(R² − r²). Volume = ∫ₐᵇ π[f(x)² − g(x)²] dx. This is the **Washer Method** — disk method with a hole.',

      'The **Shell Method** takes a different slice. Instead of slicing perpendicular to the axis of rotation (giving disks), we slice parallel to the axis (giving cylindrical shells). The volume of a cylindrical shell of radius r, height h, and thickness dr is approximately 2πr·h·dr. When rotating around the y-axis: V = ∫ₐᵇ 2πx·f(x) dx. The shell method is often simpler when the natural integration variable is perpendicular to the rotation axis (e.g., rotating around the y-axis but expressing the curve as y = f(x)).',

      'Choosing disk vs. shell: if the axis of rotation is the x-axis, disk/washer slices in the x-direction and integrates in x (natural for y = f(x)). Shell slices in the x-direction and also integrates in x, but applies when rotating around the y-axis. A good rule: if you would need to invert the function x = f(y) to use disk method, try shells first.',

      'Rotation around other lines (y = k or x = h): shift the problem. If rotating y = f(x) around y = 2, the disk radius is |f(x) − 2| instead of f(x). If rotating around x = -1, the shell radius is (x + 1) instead of x. Always draw the problem to identify the correct radii.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Disk-Washer vs. Shell — Quick Decision',
        body: 'Disk/Washer: slice ⊥ to rotation axis. Volume = π∫R² dx (or π∫(R²−r²) dx for washer).\nShell: slice ∥ to rotation axis. Volume = 2π∫r·h dr.\nChoose whichever gives a simpler integral. Often: disk for x-axis rotation with y=f(x); shell for y-axis rotation with y=f(x) (avoids inverting).',
      },
      {
        type: 'intuition',
        title: 'The Disk is Just a Very Thin Cylinder',
        body: 'V = π r² h → for a thin slice of thickness dx, this becomes π[f(x)]² dx. Integrating sums up infinitely many disks. The same reasoning that gives ∫F(x)dx as work (summing tiny force × distance pieces) applies here: summing tiny volume pieces gives total volume.',
      },
      {
        type: 'real-world',
        title: 'Pappus\'s Centroid Theorem',
        body: 'The volume of a solid of revolution = 2π × (centroid distance to axis) × (area of the region). Classic application — the torus: rotate a disk of radius r whose center is at distance R from the axis (R > r). The centroid of the disk is at distance R, and the area is πr². So V = 2π·R·(πr²) = 2π²Rr². This gives the exact torus volume formula without setting up any integral — a stunning shortcut from 4th-century geometry!',
      },
      {
        type: 'misconception',
        title: 'π is Outside the Integral',
        body: 'V = π∫[f(x)]² dx, NOT ∫π[f(x)]² dx ... actually these are equal! Since π is a constant, it can move in and out of the integral. Both forms are correct. The first form (π outside) is traditional. Just don\'t forget π — it is the area of the circular cross-section and is always present in disk/washer methods.',
      },
    ],
    visualizations: [
      {
        id: 'VolumesOfRevolution',
        title: '3D Solid of Revolution — Interactive',
        caption: 'Rotate the plane region around the axis and see the 3D solid form. Toggle between disk, washer, and shell representations. Drag n to see how more slices approximate the volume better.',
      },
      {
        id: 'PoiseuilleBloodFlow',
        title: 'Biology: Integrating Laminar Blood Flow',
        caption: 'The Washer Method describes more than physical geometry—it describes total accumulation of concentric rings. In medicine, Poiseuilles Law integrates the velocity of blood layers across an artery to find total flow Q.',
      },
    ],
  },

  math: {
    prose: [
      'Disk Method (rotation around x-axis): if f(x) ≥ 0 on [a, b], then V = π∫ₐᵇ [f(x)]² dx.',
      'Washer Method (rotation around x-axis, f ≥ g ≥ 0): V = π∫ₐᵇ {[f(x)]² − [g(x)]²} dx. Outer radius R = f(x), inner radius r = g(x).',
      'Shell Method (rotation around y-axis): V = 2π∫ₐᵇ x·f(x) dx, where [a,b] is on the x-axis and f(x) ≥ 0.',
      'Rotation around y = k: disk radius = |f(x) − k|, washer: outer and inner radii both adjusted by subtracting k.',
      'Rotation around x = h (shell method): shell radius = |x − h| instead of x.',
      'Converting between methods: any disk/washer integral can be converted to a shell integral and vice versa — they give the same answer. The choice is purely about which integral is easier to evaluate.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Volume Formulas Summary',
        body: '\\text{Disk (x-axis): } V = \\pi\\int_a^b [f(x)]^2\\,dx\\\\\n\\text{Washer (x-axis): } V = \\pi\\int_a^b \\left([f(x)]^2-[g(x)]^2\\right)dx\\\\\n\\text{Shell (y-axis): } V = 2\\pi\\int_a^b x\\,f(x)\\,dx',
      },
      {
        type: 'theorem',
        title: 'Pappus\'s Centroid Theorem',
        body: 'If a plane region $\\mathcal{R}$ with area $A$ is revolved around an external axis, the volume of the solid of revolution is:\n\\[V = 2\\pi \\bar{r}\\, A\\]\nwhere $\\bar{r}$ is the distance from the centroid of $\\mathcal{R}$ to the axis of revolution.',
      },
    ],
    visualizations: [
      {
        id: 'VolumesOfRevolution',
        title: 'Interactive Volume Calculator',
        caption: 'Choose disk or shell method and see exact volume calculations update in real time as you adjust the function and bounds.',
      },
    ],
  },

  rigor: {
    prose: [
      'The disk method formula V = π∫ₐᵇ [f(x)]² dx is rigorously justified by Cavalieri\'s principle and the definition of the definite integral. The volume of a solid with known cross-sectional area A(x) is V = ∫ₐᵇ A(x) dx (Cross-Section Formula). For a solid of revolution around the x-axis, the cross-section at x is a disk of radius f(x) and area A(x) = π[f(x)]². The disk method is therefore a special case of the cross-section formula.',
      'The shell method requires a different argument. Consider a thin cylindrical shell at radius x with height f(x) and thickness Δx. Its volume is (outer volume) − (inner volume) = π(x+Δx)²f(x) − πx²f(x) = π[(x+Δx)² − x²]f(x) = π[2xΔx + (Δx)²]f(x) ≈ 2πx·f(x)·Δx for small Δx. Summing: ΣᵢΔxᵢ 2πxᵢ·f(xᵢ) → ∫ 2πx·f(x) dx as Δx → 0.',
      'The equivalence of the disk and shell methods for the same solid follows from the fact that both compute the same volume — they are just different decompositions of the same 3D region. A rigorous proof uses Fubini\'s theorem (change of the order of integration in 2D), but the intuitive justification is sufficient for Calc 1.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cross-Section Formula (Cavalieri\'s Principle)',
        body: 'If a solid has cross-sectional area $A(x)$ at position $x$, then its volume is\n\\[V = \\int_a^b A(x)\\,dx.\\]\nThe disk method is the special case $A(x) = \\pi[f(x)]^2$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-006b-ex1',
      title: 'Disk Method: Volume of a Cone',
      problem: '\\text{Find the volume of a cone of radius } R \\text{ and height } h \\text{ using the disk method. (Rotate } y = Rx/h \\text{ around the x-axis on [0,h].)}',
      steps: [
        { expression: 'f(x) = \\frac{R}{h}x \\text{ (cross-sections are disks of radius } r = Rx/h\\text{)}', annotation: 'The slant side of the cone is a straight line from (0,0) to (h, R).' },
        { expression: 'V = \\pi\\int_0^h \\left[\\frac{R}{h}x\\right]^2 dx = \\pi\\cdot\\frac{R^2}{h^2}\\int_0^h x^2\\,dx', annotation: 'Disk method: V = π∫r² dx. Factor out the constant.' },
        { expression: '= \\frac{\\pi R^2}{h^2}\\cdot\\left[\\frac{x^3}{3}\\right]_0^h = \\frac{\\pi R^2}{h^2}\\cdot\\frac{h^3}{3} = \\frac{\\pi R^2 h}{3}', annotation: 'Antiderivative of x² is x³/3. Evaluate at limits.' },
      ],
      conclusion: 'V = (1/3)πR²h — the classic cone volume formula, now derived rigorously from calculus. The 1/3 comes from the ∫x² factor. Compare with a cylinder (no 1/3): the cone has 1/3 the volume of the cylinder with same base and height.',
    },
    {
      id: 'ch4-006b-ex2',
      title: 'Washer Method: Volume Between Two Curves',
      problem: '\\text{Find the volume generated by rotating the region between } y = \\sqrt{x} \\text{ and } y = x \\text{ on [0,1] around the x-axis.}',
      steps: [
        { expression: '\\text{On } [0,1]: \\sqrt{x} \\geq x \\geq 0 \\text{ (check at } x=1/4: 1/2 > 1/4\\text{)}', annotation: 'Outer radius R = √x, inner radius r = x.' },
        { expression: 'V = \\pi\\int_0^1 \\left[(\\sqrt{x})^2 - x^2\\right]dx = \\pi\\int_0^1 (x - x^2)\\,dx', annotation: 'Washer formula: π∫(R² − r²) dx = π∫(x − x²) dx.' },
        { expression: '= \\pi\\left[\\frac{x^2}{2} - \\frac{x^3}{3}\\right]_0^1 = \\pi\\left(\\frac{1}{2} - \\frac{1}{3}\\right) = \\frac{\\pi}{6}', annotation: 'Evaluate: 1/2 − 1/3 = 1/6.' },
      ],
      conclusion: 'V = π/6. Interesting: this is the same as the AREA between y=x and y=x² (from earlier) times π — but that is a coincidence of the specific functions here, not a general rule.',
    },
    {
      id: 'ch4-006b-ex3',
      title: 'Shell Method: Rotation Around the y-Axis',
      problem: '\\text{Find the volume generated by rotating the region under } y = x^2 \\text{ on [0,2] around the y-axis.}',
      steps: [
        { expression: 'V = 2\\pi\\int_0^2 x \\cdot f(x)\\,dx = 2\\pi\\int_0^2 x \\cdot x^2\\,dx = 2\\pi\\int_0^2 x^3\\,dx', annotation: 'Shell method for y-axis rotation: V = 2π∫x·f(x)dx. Shell radius = x, height = f(x) = x².' },
        { expression: '= 2\\pi\\left[\\frac{x^4}{4}\\right]_0^2 = 2\\pi\\cdot\\frac{16}{4} = 2\\pi\\cdot 4 = 8\\pi', annotation: 'Antiderivative of x³ is x⁴/4. Evaluate at x=2: 16/4 = 4.' },
      ],
      conclusion: 'V = 8π. The shell method was simpler here because expressing x as a function of y (inverting y = x² to get x = √y) would have required disk integration from y = 0 to y = 4 — still doable, but with a square root in the integrand.',
    },
    {
      id: 'ch4-006b-ex4',
      title: 'Volume of a Sphere (Disk Method)',
      problem: '\\text{Derive the volume of a sphere of radius } R \\text{ by rotating the semicircle } y = \\sqrt{R^2 - x^2} \\text{ around the x-axis.}',
      steps: [
        { expression: 'V = \\pi\\int_{-R}^R \\left(\\sqrt{R^2-x^2}\\right)^2 dx = \\pi\\int_{-R}^R (R^2-x^2)\\,dx', annotation: 'Disk method. Squaring eliminates the square root!' },
        { expression: '= \\pi\\left[R^2 x - \\frac{x^3}{3}\\right]_{-R}^R', annotation: 'Antiderivative: ∫(R²−x²)dx = R²x − x³/3.' },
        { expression: '= \\pi\\left[\\left(R^3 - \\frac{R^3}{3}\\right) - \\left(-R^3 + \\frac{R^3}{3}\\right)\\right]', annotation: 'Evaluate at x = R and x = −R.' },
        { expression: '= \\pi\\left[\\frac{2R^3}{3} + \\frac{2R^3}{3}\\right] = \\frac{4\\pi R^3}{3}', annotation: 'Combine: 2(2R³/3) = 4R³/3.' },
      ],
      conclusion: 'V = (4/3)πR³ — the sphere volume formula from calculus. Archimedes proved this without calculus using exhaustion, but note how naturally integration handles it: once you square the semicircle equation, the √ disappears and you integrate a simple polynomial!',
    },
    {
      id: 'ch4-006b-ex5',
      title: 'Rotation Around a Non-Axis Line',
      problem: '\\text{Find the volume generated by rotating } y = x^2 \\text{ from } x=0 \\text{ to } x=2 \\text{ around the line } y = 4.',
      steps: [
        { expression: '\\text{Disk radius: } r(x) = 4 - x^2', annotation: 'We are rotating around y=4. At each x, the radius = distance from the axis y=4 down to the curve y=x². Since x²≤4 on [0,2], this is always positive: r = 4−x².' },
        { expression: '\\text{This is a disk (not washer) — the axis } y=4 \\text{ is the outer boundary itself, so no hole.}', annotation: 'The region sweeps solid disks of radius (4−x²) at each x. There is no inner hole because we are rotating the region between y=x² and the axis y=4.' },
        { expression: 'V = \\pi\\int_0^2 (4-x^2)^2\\,dx = \\pi\\int_0^2(16-8x^2+x^4)\\,dx', annotation: 'Disk method with radius = 4−x². Expand the square.' },
        { expression: '= \\pi\\left[16x - \\frac{8x^3}{3} + \\frac{x^5}{5}\\right]_0^2', annotation: 'Integrate term by term.' },
        { expression: '= \\pi\\left[32 - \\frac{64}{3} + \\frac{32}{5}\\right] = \\pi\\cdot\\frac{480 - 320 + 96}{15} = \\frac{256\\pi}{15}', annotation: 'Common denominator 15: 32 = 480/15, 64/3 = 320/15, 32/5 = 96/15.' },
      ],
      conclusion: 'V = 256π/15. When the axis of rotation is y = k, the disk radius is |f(x) − k|. Always draw the problem first — identify which side of the axis the curve lives on to get the correct sign.',
    },
  ],

  challenges: [
    {
      id: 'ch4-006b-ch1',
      difficulty: 'easy',
      problem: 'Use the disk method to find the volume generated by rotating y = 2x on [0, 3] around the x-axis. Verify using the cone formula V = (1/3)πR²h.',
      hint: 'Disk radius = 2x. R = f(3) = 6, h = 3.',
      walkthrough: [
        { expression: 'V = \\pi\\int_0^3(2x)^2\\,dx = 4\\pi\\int_0^3 x^2\\,dx', annotation: 'Apply disk method.' },
        { expression: '= 4\\pi\\left[\\frac{x^3}{3}\\right]_0^3 = 4\\pi\\cdot 9 = 36\\pi', annotation: 'Evaluate.' },
        { expression: '\\text{Verify: }\\frac{1}{3}\\pi(6)^2(3) = \\frac{1}{3}\\pi\\cdot 36\\cdot 3 = 36\\pi\\;\\checkmark', annotation: 'Cone formula with R=6, h=3.' },
      ],
      answer: 'V = 36\\pi',
    },
    {
      id: 'ch4-006b-ch2',
      difficulty: 'medium',
      problem: 'Use BOTH the disk/washer method AND the shell method to find the volume of the solid generated by rotating the region bounded by y = x and y = x² around the y-axis. Show the two give the same answer.',
      hint: 'Disk (around y-axis): integrate in y, slicing perpendicular to y-axis. Shell (around y-axis): integrate in x.',
      walkthrough: [
        { expression: '\\text{Shell method: } V = 2\\pi\\int_0^1 x(x-x^2)\\,dx = 2\\pi\\int_0^1(x^2-x^3)\\,dx', annotation: 'Shell radius = x, height = x − x² (top curve minus bottom).' },
        { expression: '= 2\\pi\\left[\\frac{x^3}{3}-\\frac{x^4}{4}\\right]_0^1 = 2\\pi\\left(\\frac{1}{3}-\\frac{1}{4}\\right) = 2\\pi\\cdot\\frac{1}{12} = \\frac{\\pi}{6}', annotation: 'Evaluate.' },
        { expression: '\\text{Disk/Washer: rotate around y-axis. Slice at height } y: x_{\\text{outer}}=\\sqrt{y}, x_{\\text{inner}}=y', annotation: 'For y-axis disk, solve for x in terms of y. y=x² → x=√y; y=x → x=y.' },
        { expression: 'V = \\pi\\int_0^1(y - y^2)\\,dy = \\pi\\left[\\frac{y^2}{2}-\\frac{y^3}{3}\\right]_0^1 = \\pi\\left(\\frac{1}{2}-\\frac{1}{3}\\right) = \\frac{\\pi}{6}\\;\\checkmark', annotation: 'Outer radius √y, inner radius y. R²−r² = y−y². Same answer!' },
      ],
      answer: 'V = \\dfrac{\\pi}{6} \\text{ by both methods}',
    },
    {
      id: 'ch4-006b-ch3',
      difficulty: 'hard',
      problem: 'Use Pappus\'s centroid theorem to find the volume of the torus (donut) generated by rotating a disk of radius r with center at distance R from the rotation axis (R > r). Then verify with the washer method.',
      hint: 'The centroid of the disk is at distance R from the axis. Area of disk = πr². Pappus: V = 2π·R·(πr²).',
      walkthrough: [
        { expression: 'V = 2\\pi \\bar{r} A = 2\\pi R \\cdot \\pi r^2 = 2\\pi^2 R r^2', annotation: 'Pappus\'s theorem directly.' },
        { expression: '\\text{Washer verify: disk has outer radius } R+r, \\text{ inner radius } R-r, \\text{ for each y-slice}', annotation: 'More precisely, at height y above the disk center, the outer radius = R + √(r²−y²), inner = R − √(r²−y²).' },
        { expression: 'V = \\pi\\int_{-r}^{r}\\left[(R+\\sqrt{r^2-y^2})^2 - (R-\\sqrt{r^2-y^2})^2\\right]dy', annotation: 'Washer method integrating in y.' },
        { expression: '= \\pi\\int_{-r}^{r} 4R\\sqrt{r^2-y^2}\\,dy = 4\\pi R \\cdot \\frac{\\pi r^2}{2} = 2\\pi^2 Rr^2\\;\\checkmark', annotation: 'Since (A+B)²−(A−B)² = 4AB, and ∫₋ᵣʳ√(r²−y²)dy = πr²/2 (semicircle area).' },
      ],
      answer: 'V = 2\\pi^2 R r^2',
    },
  ],

  crossRefs: [
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Area between curves, average value, and work — the foundational applications that lead into 3D volumes here.' },
    { lessonSlug: 'u-substitution', label: 'U-Substitution', context: 'Some volume integrals require substitution to evaluate — trig sub for spheres and ellipsoids, power sub for compound forms.' },
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'All volume formulas are definite integrals. The cross-section formula V = ∫A(x)dx is the definite integral applied to 3D.' },
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Volumes of surfaces like spheres and cones often arise in polar/spherical coordinates in multivariable calculus.' },
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
