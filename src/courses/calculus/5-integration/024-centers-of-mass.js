export default {
  id: 'ch4-centroid',
  slug: 'centers-of-mass',
  chapter: 4,
  order: 17,
  title: 'Centers of Mass and Centroids',
  subtitle: 'Integration finds the balance point of continuous shapes — and Pappus\'s Theorem turns centroids into volumes',
  tags: ['center of mass', 'centroid', 'moment', 'Pappus theorem', 'lamina', 'balance', 'torus', 'stability'],

  hook: {
    question: 'Where should a crane attach a cable to lift an oddly-shaped steel plate without it tipping? Where does a tightrope walker\'s pole need to concentrate its weight to maintain balance? These questions all reduce to finding a single point — the center of mass.',
    realWorldContext:
      'The center of mass (centroid) is one of the most practically important geometric quantities in engineering and physics. ' +
      'Aircraft designers compute the center of gravity (CG) of each fuel configuration — as fuel burns, the CG shifts, changing handling characteristics. FAA regulations require the CG to stay within certified limits throughout flight. ' +
      'Naval architects design ships so the center of buoyancy and center of gravity create a restoring moment — the ship rights itself if tilted. An improperly loaded cargo ship (wrong CG) can capsize in rough seas. ' +
      'Structural engineers locate the centroid of beam cross-sections to compute bending stiffness (the neutral axis passes through the centroid). ' +
      'In robotics, the center of mass of a robot arm determines the torques required at each joint — critical for energy-efficient motion planning. ' +
      'Pappus\'s Theorem (discovered in the 4th century AD) gives a spectacular shortcut: the volume of any solid of revolution equals the area of the generating region times the circumference traced by its centroid. No integration of the solid required — just the centroid of the 2D region.',
    previewVisualizationId: 'AreaAccumulator',
  },

  intuition: {
    prose: [
      'For a system of point masses m₁, m₂, ... at positions x₁, x₂, ..., the center of mass is x̄ = (Σmᵢxᵢ)/(Σmᵢ) — the weighted average of positions, with mass as weight. The quantity Mᵧ = Σmᵢxᵢ is called the moment about the y-axis (moment = mass × distance to axis). The center of mass is x̄ = Mᵧ/m (moment divided by total mass). This is the balance point: if you placed the masses on a seesaw, x̄ is where you put the fulcrum.',

      'For a continuous thin plate (lamina) with density ρ(x,y), the discrete sum ΣmᵢxΙ becomes an integral. For a lamina bounded by f(x) ≥ g(x) on [a,b] with constant density ρ = 1 (a "uniform" lamina), the total mass is m = ∫ₐᵇ[f(x)−g(x)]dx (which equals the area A). The moment about the y-axis is Mᵧ = ∫ₐᵇ x[f(x)−g(x)]dx, giving x̄ = Mᵧ/m. This is the x-coordinate of the centroid.',

      'The moment about the x-axis is Mₓ = ∫ₐᵇ (1/2)[f(x)²−g(x)²]dx. The (1/2) factor comes from the centroid of each thin vertical strip being at its midpoint (f(x)+g(x))/2. The y-coordinate of the centroid is ȳ = Mₓ/m. Together, (x̄, ȳ) is the centroid — the balance point of the lamina.',

      'Why the 1/2? Think of a thin vertical strip of height h = f(x)−g(x) at position x. The centroid of this strip is at its midpoint, which is at y = g(x) + h/2 = (f(x)+g(x))/2. The strip\'s mass contribution is h·dx = (f(x)−g(x))dx. Its moment about the x-axis is (mass)×(y-position of centroid) = (f(x)−g(x))dx × (f(x)+g(x))/2 = (1/2)(f²−g²)dx. That is where the (1/2)[f²−g²] comes from.',

      'Pappus\'s Theorem is a 4th-century gem: if a plane region with area A is rotated around an external axis, the volume of the solid is V = 2π·d̄·A, where d̄ is the distance from the centroid to the axis. Equivalently, V = (area) × (path traced by centroid) = A × (2πd̄). The derivation uses the shell method — V = 2π∫ₐᵇ x[f(x)−g(x)]dx = 2π·Mᵧ = 2π·x̄·m = 2π·x̄·A (for constant density). Pappus replaces an integral over a 3D solid with just the centroid of a 2D region — a massive simplification for symmetric shapes.',

      'The classic application of Pappus is the torus (donut). Rotate a disk of radius r whose center is at distance R from the axis (R > r). The centroid of the disk is at its center, distance R from the axis. Area of disk = πr². Volume by Pappus: V = 2π·R·(πr²) = 2π²Rr². No setup of 3D integrals needed — one application of the centroid formula does everything. This is why centroids matter beyond pure geometry.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Centroid = Balance Point',
        body: 'Cut a cardboard shape and try to balance it on a pencil tip. The single point where it balances perfectly is the centroid. For a rectangle, it is the intersection of the diagonals. For a triangle, it is 1/3 of the height from the base (the medians intersect there). For any shape, it is computed by the moment integrals. The centroid is always inside the shape for convex regions, but can be outside for non-convex ones (like a ring).',
      },
      {
        type: 'strategy',
        title: 'Centroid Setup Checklist',
        body: '1. Area (= mass for unit density): m = ∫ₐᵇ [f(x)−g(x)] dx.\n2. x-moment: Mᵧ = ∫ₐᵇ x[f(x)−g(x)] dx. (Same as shell method integrand!)\n3. y-moment: Mₓ = (1/2)∫ₐᵇ [f(x)²−g(x)²] dx.\n4. Centroid: x̄ = Mᵧ/m, ȳ = Mₓ/m.\nFor symmetric regions: if f(x)−g(x) is symmetric about x=c, then x̄=c automatically (no calculation needed).',
      },
      {
        type: 'real-world',
        title: 'Pappus\'s Theorem: From 2D to 3D Instantly',
        body: 'To find the volume of a solid of revolution, find the centroid of the 2D cross-section and apply V = 2π·d̄·A. Examples:\n- Torus (disk of radius r, center at distance R): V = 2π·R·(πr²) = 2π²Rr².\n- Solid hemisphere (rotate a quarter-disk of radius R): centroid at d̄ = 4R/(3π) from axis, area = πR²/4. V = 2π·(4R/3π)·(πR²/4) = (2/3)πR³ ✓.\n- Any extrusion: if you know the centroid of the cross-section, Pappus gives the volume immediately.',
      },
      {
        type: 'misconception',
        title: 'Mₓ Uses (1/2)[f²−g²], Not ∫y·f(x)dx',
        body: 'The y-moment formula Mₓ = (1/2)∫[f(x)²−g(x)²]dx catches students off guard — the integrand is quadratic in f and g, not linear. This comes from the centroid of each vertical strip being at its midpoint. A common error: writing Mₓ = ∫f(x)dx (just the area integral). Remember: x̄ uses x·(strip area), while ȳ uses (1/2)·(strip area difference of squares).',
      },
    ],
    visualizationId: 'CentroidViz',
    visualizationProps: {},
    visualizations: [
            {
        id: 'AreaAccumulator',
        title: 'Centroid of a Region — Interactive',
        caption: 'The balance point (centroid) is displayed as the region is built up. Notice how adding area far from the current centroid pulls the balance point toward the new area — reflecting the weighted average nature of x̄ and ȳ.',
      },
      {
        id: 'Ch4Review',
        title: 'Chapter 4 Review Board',
        caption: 'A complete map of Integration and its Fundamental Theorem.',
      },
      {
        id: 'Ch4Applied',
        title: 'Chapter 4 Applied Problems',
        caption: 'Real-world applications of integration: distance, displacement, and cost.',
      },
    ],
  },

  math: {
    prose: [
      'For a lamina (thin plate) of uniform density $\\rho = 1$ bounded by $y = f(x) \\geq y = g(x)$ on $[a,b]$, the total mass equals the area: $m = \\int_a^b [f(x)-g(x)]\\,dx$.',

      'The moments are: $M_y = \\int_a^b x[f(x)-g(x)]\\,dx$ (moment about $y$-axis) and $M_x = \\frac{1}{2}\\int_a^b [f(x)^2 - g(x)^2]\\,dx$ (moment about $x$-axis). The centroid coordinates are $\\bar{x} = M_y/m$ and $\\bar{y} = M_x/m$.',

      'For non-uniform density $\\rho(x)$ that depends only on $x$ (a common case for vertically-symmetric plates): $m = \\int_a^b \\rho(x)[f(x)-g(x)]\\,dx$, $M_y = \\int_a^b x\\rho(x)[f(x)-g(x)]\\,dx$, $M_x = \\frac{1}{2}\\int_a^b\\rho(x)[f(x)^2-g(x)^2]\\,dx$.',

      'Pappus\'s Centroid Theorem (volume): if a plane region $\\mathcal{R}$ of area $A$ is revolved around an external axis at distance $\\bar{d}$ from the centroid, the volume is $V = 2\\pi\\bar{d}\\,A$. Pappus\'s Theorem (surface area): if an arc of length $L$ is revolved, the surface area is $S = 2\\pi\\bar{d}\\,L$, where $\\bar{d}$ is the distance from the centroid of the arc to the axis.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Centroid of a Plane Region',
        body: 'For the region between $y=f(x)$ and $y=g(x)$ on $[a,b]$ with uniform density:\n\\[m = \\int_a^b [f(x)-g(x)]\\,dx\\]\n\\[M_y = \\int_a^b x[f(x)-g(x)]\\,dx,\\quad M_x = \\frac{1}{2}\\int_a^b [f^2(x)-g^2(x)]\\,dx\\]\n\\[\\bar{x} = \\frac{M_y}{m},\\qquad \\bar{y} = \\frac{M_x}{m}\\]',
      },
      {
        type: 'theorem',
        title: 'Pappus\'s Centroid Theorem',
        body: 'Let $\\mathcal{R}$ be a plane region of area $A$ whose centroid is at distance $\\bar{d}$ from an external axis $\\ell$. Then the volume of the solid generated by revolving $\\mathcal{R}$ around $\\ell$ is\n\\[V = 2\\pi\\,\\bar{d}\\,A.\\]\nEquivalently, $V = (\\text{path length of centroid})\\times A = 2\\pi\\bar{d}\\cdot A$.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The centroid formulas arise from applying the continuous analog of the discrete center-of-mass definition. For a thin vertical strip at position $x$ with width $dx$ and height $h(x) = f(x)-g(x)$, the strip has mass $dm = h(x)\\,dx$ (unit density), its center is at $(x, (f(x)+g(x))/2)$, and its contributions to the moments are $dM_y = x\\cdot dm = x\\cdot h(x)\\,dx$ and $dM_x = \\frac{f(x)+g(x)}{2}\\cdot dm = \\frac{f+g}{2}(f-g)\\,dx = \\frac{f^2-g^2}{2}\\,dx$. Integrating over all strips gives the formulas. This derivation justifies using the midpoint of each strip for $dM_x$: it is exact, not an approximation, because each infinitesimal strip has its centroid at its geometric center.',

      'Pappus\'s theorem is derived from the shell method. The volume of the solid obtained by rotating the region around the $y$-axis is $V = 2\\pi\\int_a^b x[f(x)-g(x)]\\,dx = 2\\pi M_y = 2\\pi\\,\\bar{x}\\,m = 2\\pi\\,\\bar{x}\\,A$ (for unit density). So $V = 2\\pi\\bar{x}A$ — and $\\bar{x}$ is the centroid distance from the $y$-axis. This is exactly Pappus\'s theorem! The theorem is therefore not an independent result but a restatement of the shell method in terms of the centroid. Pappus discovered it geometrically in the 4th century AD; calculus gives it immediately.',

      'The second moment of area (or area moment of inertia) $I_x = \\int y^2\\,dA$ and $I_y = \\int x^2\\,dA$ are related but distinct from the first moments $M_x, M_y$. These appear in structural engineering (beam bending) and rotational dynamics (moment of inertia). They require squaring the position before integrating, giving integrands $x^2[f(x)-g(x)]$ or $\\frac{1}{3}[f(x)^3-g(x)^3]$. These are covered in Calculus 2 and statics courses.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-centroid-ex1',
      title: 'Centroid of a Triangle: Verify the Geometric Formula',
      problem: '\\text{Find the centroid of the triangle with vertices } (0,0), (b,0), \\text{ and } (0,h) \\text{ and verify it equals } (b/3, h/3).',
      steps: [
        { expression: '\\text{The triangle is bounded by } y = h(1-x/b) \\text{ (hypotenuse)}, y = 0, \\text{ for } x \\in [0,b]', annotation: 'The hypotenuse connects (b,0) and (0,h): slope is −h/b, y-intercept h. Equation: y = h − (h/b)x = h(1−x/b).' },
        { expression: 'm = \\int_0^b h\\left(1-\\frac{x}{b}\\right)dx = h\\left[x-\\frac{x^2}{2b}\\right]_0^b = h\\left[b-\\frac{b}{2}\\right] = \\frac{bh}{2}', annotation: 'Area of triangle (confirms formula: bh/2).' },
        { expression: 'M_y = \\int_0^b x\\cdot h\\left(1-\\frac{x}{b}\\right)dx = h\\int_0^b\\left(x-\\frac{x^2}{b}\\right)dx = h\\left[\\frac{x^2}{2}-\\frac{x^3}{3b}\\right]_0^b = h\\left[\\frac{b^2}{2}-\\frac{b^2}{3}\\right] = \\frac{hb^2}{6}', annotation: 'x-moment: integrate x·(strip height)dx.' },
        { expression: '\\bar{x} = \\frac{M_y}{m} = \\frac{hb^2/6}{bh/2} = \\frac{b}{3}\\;\\checkmark', annotation: 'Divide moment by mass.' },
        { expression: 'M_x = \\frac{1}{2}\\int_0^b\\left[h\\left(1-\\frac{x}{b}\\right)\\right]^2 dx = \\frac{h^2}{2}\\int_0^b\\left(1-\\frac{x}{b}\\right)^2 dx = \\frac{h^2}{2}\\cdot\\frac{b}{3} = \\frac{bh^2}{6}', annotation: '∫₀ᵇ(1−x/b)²dx = [−b(1−x/b)³/3]₀ᵇ = b/3.' },
        { expression: '\\bar{y} = \\frac{M_x}{m} = \\frac{bh^2/6}{bh/2} = \\frac{h}{3}\\;\\checkmark', annotation: 'Centroid is at (b/3, h/3) — one-third of the way from each vertex\'s opposite side.' },
      ],
      conclusion: 'Centroid = (b/3, h/3). This matches the geometric result that the centroid of a triangle is at 1/3 the height from the base and 1/3 the base from the vertical leg. Calculus confirms the geometry — and the method applies to any triangle or region.',
    },
    {
      id: 'ch4-centroid-ex2',
      title: 'Centroid of the Region Under y = √x on [0, 1]',
      problem: '\\text{Find the centroid of the region bounded by } y = \\sqrt{x} \\text{ and } y = 0 \\text{ for } x \\in [0,1].',
      steps: [
        { expression: 'm = \\int_0^1 \\sqrt{x}\\,dx = \\left[\\frac{2x^{3/2}}{3}\\right]_0^1 = \\frac{2}{3}', annotation: 'Area under y=√x from 0 to 1.' },
        { expression: 'M_y = \\int_0^1 x\\sqrt{x}\\,dx = \\int_0^1 x^{3/2}\\,dx = \\left[\\frac{2x^{5/2}}{5}\\right]_0^1 = \\frac{2}{5}', annotation: 'x-moment: ∫x·√x dx = ∫x^{3/2} dx.' },
        { expression: '\\bar{x} = \\frac{M_y}{m} = \\frac{2/5}{2/3} = \\frac{2}{5}\\cdot\\frac{3}{2} = \\frac{3}{5}', annotation: 'Divide. The centroid is pulled toward x=1 where the curve is widest.' },
        { expression: 'M_x = \\frac{1}{2}\\int_0^1(\\sqrt{x})^2\\,dx = \\frac{1}{2}\\int_0^1 x\\,dx = \\frac{1}{2}\\cdot\\frac{1}{2} = \\frac{1}{4}', annotation: 'y-moment: (1/2)∫f²dx with g=0, f=√x.' },
        { expression: '\\bar{y} = \\frac{M_x}{m} = \\frac{1/4}{2/3} = \\frac{3}{8}', annotation: 'y-coordinate of centroid.' },
      ],
      conclusion: 'Centroid = (3/5, 3/8). Notice x̄ = 3/5 > 1/2 — the centroid is to the right of center because the curve y=√x is wider (taller) near x=1, concentrating mass there. Similarly, ȳ = 3/8 < 1/2 — the centroid is below the midline because the region is taller near x=1 but narrows to zero near x=0.',
    },
    {
      id: 'ch4-centroid-ex3',
      title: 'Centroid of a Semicircle: Famous Result ȳ = 4R/(3π)',
      problem: '\\text{Find the centroid of the upper semicircle of radius } R \\text{ (the region bounded by } y=\\sqrt{R^2-x^2} \\text{ and } y=0\\text{).}',
      steps: [
        { expression: 'm = \\frac{\\pi R^2}{2}', annotation: 'Area of a semicircle (half the circle area). No integration needed — known formula.' },
        { expression: '\\bar{x} = 0\\quad\\text{(by symmetry)}', annotation: 'The region is symmetric about x=0. Both f(x)=√(R²−x²) and the region are even functions/regions. x̄=0 by symmetry argument alone.' },
        { expression: 'M_x = \\frac{1}{2}\\int_{-R}^R(\\sqrt{R^2-x^2})^2\\,dx = \\frac{1}{2}\\int_{-R}^R(R^2-x^2)\\,dx', annotation: 'y-moment: (1/2)∫f²dx with g=0. Squaring removes the square root!' },
        { expression: '= \\frac{1}{2}\\left[R^2 x - \\frac{x^3}{3}\\right]_{-R}^R = \\frac{1}{2}\\cdot 2\\left[R^3-\\frac{R^3}{3}\\right] = R^3-\\frac{R^3}{3} = \\frac{2R^3}{3}', annotation: 'Evaluate and use symmetry (integrand is even, integral from −R to R is double the integral from 0 to R).' },
        { expression: '\\bar{y} = \\frac{M_x}{m} = \\frac{2R^3/3}{\\pi R^2/2} = \\frac{2R^3}{3}\\cdot\\frac{2}{\\pi R^2} = \\frac{4R}{3\\pi}', annotation: 'Divide and simplify.' },
      ],
      conclusion: 'Centroid = (0, 4R/(3π)). For R=1, ȳ = 4/(3π) ≈ 0.424. The centroid is slightly less than halfway up the semicircle (which reaches y=1). This result is used in the Pappus Theorem application for the hemisphere volume. Memorize ȳ = 4R/(3π) for the semicircle — it appears frequently in engineering statics.',
    },
    {
      id: 'ch4-centroid-ex4',
      title: 'Pappus\'s Theorem: Volume of a Torus',
      problem: '\\text{A disk of radius } r \\text{ has its center at distance } R > r \\text{ from the y-axis. Rotate this disk around the y-axis to form a torus (donut). Find the volume using Pappus\'s theorem.}',
      steps: [
        { expression: '\\text{Region: a disk of radius } r, \\text{ centered at } (R, 0).\\text{ Area} = \\pi r^2.', annotation: 'The generating region is a filled disk (circle and its interior). Its area is πr².' },
        { expression: '\\text{Centroid of the disk: at its center } (R, 0).\\text{ Distance to y-axis: } \\bar{d} = R.', annotation: 'The centroid of any disk is its geometric center. Its distance from the y-axis is R.' },
        { expression: 'V = 2\\pi\\bar{d}\\cdot A = 2\\pi R\\cdot\\pi r^2 = 2\\pi^2 R r^2', annotation: 'Apply Pappus\'s theorem: V = 2π × (centroid distance) × (area).' },
        { expression: '\\text{Check with washer method: } V = \\pi\\int_{-r}^r\\left[(R+\\sqrt{r^2-y^2})^2-(R-\\sqrt{r^2-y^2})^2\\right]dy', annotation: 'Washer outer radius = R+√(r²−y²), inner = R−√(r²−y²). This integral also equals 2π²Rr² (verified in the Disk/Washer lesson).' },
        { expression: '\\text{Example: R = 5 cm, r = 2 cm (a typical donut):} V = 2\\pi^2(5)(4) = 40\\pi^2 \\approx 394.8 \\text{ cm}^3', annotation: 'Numerical example for a standard donut size.' },
      ],
      conclusion: 'V = 2π²Rr². Pappus\'s theorem gave the answer in one line! Compare to setting up the washer integral (which requires recognizing the outer and inner radii from the circle geometry) — Pappus is dramatically simpler. The key insight: for any solid of revolution, the 3D volume reduces to a 2D centroid calculation.',
    },
    {
      id: 'ch4-centroid-ex5',
      title: 'Centroid of the Region Between y = x and y = x²',
      problem: '\\text{Find the centroid of the region bounded by } y = x \\text{ and } y = x^2 \\text{ on } [0,1].',
      steps: [
        { expression: 'm = \\int_0^1(x-x^2)\\,dx = \\left[\\frac{x^2}{2}-\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{2}-\\frac{1}{3} = \\frac{1}{6}', annotation: 'Area between the curves (we computed this before).' },
        { expression: 'M_y = \\int_0^1 x(x-x^2)\\,dx = \\int_0^1(x^2-x^3)\\,dx = \\left[\\frac{x^3}{3}-\\frac{x^4}{4}\\right]_0^1 = \\frac{1}{3}-\\frac{1}{4} = \\frac{1}{12}', annotation: 'x-moment: ∫x·(f−g)dx = ∫x(x−x²)dx.' },
        { expression: '\\bar{x} = \\frac{M_y}{m} = \\frac{1/12}{1/6} = \\frac{1}{2}', annotation: 'x̄ = 1/2. By symmetry of the lens-shaped region about x=1/2 (since f(x)−g(x)=x−x² is symmetric about x=1/2), this makes sense!' },
        { expression: 'M_x = \\frac{1}{2}\\int_0^1(x^2-x^4)\\,dx = \\frac{1}{2}\\left[\\frac{x^3}{3}-\\frac{x^5}{5}\\right]_0^1 = \\frac{1}{2}\\left(\\frac{1}{3}-\\frac{1}{5}\\right) = \\frac{1}{2}\\cdot\\frac{2}{15} = \\frac{1}{15}', annotation: 'y-moment: (1/2)∫(f²−g²)dx = (1/2)∫(x²−x⁴)dx.' },
        { expression: '\\bar{y} = \\frac{M_x}{m} = \\frac{1/15}{1/6} = \\frac{6}{15} = \\frac{2}{5}', annotation: 'y-coordinate of centroid.' },
      ],
      conclusion: 'Centroid = (1/2, 2/5). The x̄=1/2 confirms the region\'s x-symmetry. The ȳ=2/5 is between 0 and 1 (the y-range of the region), closer to the bottom (y=x² is the lower boundary), which makes sense since there is more area near the bottom of the lens shape.',
    },
  ],

  challenges: [
    {
      id: 'ch4-centroid-ch1',
      difficulty: 'easy',
      problem: 'Find the centroid of the region under y = 4 − x² on [−2, 2] (a downward parabola). Use symmetry for x̄, and compute ȳ by integration.',
      hint: 'The region is symmetric about x=0, so x̄=0 immediately. For ȳ: m = ∫(4−x²)dx over [−2,2], Mₓ = (1/2)∫(4−x²)² dx over [−2,2].',
      walkthrough: [
        { expression: '\\bar{x} = 0\\quad(\\text{symmetry: even function on symmetric interval})', annotation: 'No calculation needed.' },
        { expression: 'm = \\int_{-2}^2(4-x^2)\\,dx = 2\\int_0^2(4-x^2)\\,dx = 2\\left[4x-\\frac{x^3}{3}\\right]_0^2 = 2\\left[8-\\frac{8}{3}\\right] = 2\\cdot\\frac{16}{3} = \\frac{32}{3}', annotation: 'Area by symmetry (double the half-interval integral).' },
        { expression: 'M_x = \\frac{1}{2}\\int_{-2}^2(4-x^2)^2\\,dx = \\int_0^2(16-8x^2+x^4)\\,dx = \\left[16x-\\frac{8x^3}{3}+\\frac{x^5}{5}\\right]_0^2', annotation: '(1/2)∫(4−x²)²dx, using symmetry to integrate on [0,2] only (factor 2 cancels with 1/2).' },
        { expression: '= 32-\\frac{64}{3}+\\frac{32}{5} = \\frac{480-320+96}{15} = \\frac{256}{15}', annotation: 'Common denominator 15.' },
        { expression: '\\bar{y} = \\frac{M_x}{m} = \\frac{256/15}{32/3} = \\frac{256}{15}\\cdot\\frac{3}{32} = \\frac{8}{5}', annotation: 'Divide and simplify.' },
      ],
      answer: '(\\bar{x},\\bar{y}) = \\left(0,\\,\\dfrac{8}{5}\\right)',
    },
    {
      id: 'ch4-centroid-ch2',
      difficulty: 'medium',
      problem: 'Use Pappus\'s theorem and the known centroid of a triangle to find the volume of the cone generated by rotating the triangle with vertices (0,0), (h,0), (0,R) around the x-axis.',
      hint: 'The triangle has base h along the x-axis and height R along the y-axis. Its centroid is at (h/3, R/3). Rotating around the x-axis: centroid distance = ȳ = R/3. Area of triangle = Rh/2. Apply V = 2π·(R/3)·(Rh/2).',
      walkthrough: [
        { expression: '\\text{Triangle vertices: }(0,0),(h,0),(0,R).\\text{ Area} = \\frac{1}{2}\\cdot h\\cdot R = \\frac{Rh}{2}', annotation: 'Base h, height R.' },
        { expression: '\\text{Centroid: }(h/3, R/3)\\quad\\text{(one-third from base/leg)}', annotation: 'Known result for right triangle with legs along the axes.' },
        { expression: 'V = 2\\pi\\bar{y}\\cdot A = 2\\pi\\cdot\\frac{R}{3}\\cdot\\frac{Rh}{2} = \\frac{\\pi R^2 h}{3}\\;\\checkmark', annotation: 'Pappus: centroid distance from x-axis is ȳ = R/3. This gives the cone volume formula!' },
        { expression: '\\text{The disk method gives: } V = \\pi\\int_0^h\\left(\\frac{Rx}{h}\\right)^2 dx = \\frac{\\pi R^2}{h^2}\\cdot\\frac{h^3}{3} = \\frac{\\pi R^2 h}{3}\\;\\checkmark', annotation: 'Verified by direct integration.' },
      ],
      answer: 'V = \\dfrac{\\pi R^2 h}{3}\\text{ (the cone volume formula, derived via Pappus)}',
    },
    {
      id: 'ch4-centroid-ch3',
      difficulty: 'hard',
      problem: 'A lamina occupies the region between y = sin(x) and y = 0 on [0, π] with density ρ(x) = 1 + x/π (density increases toward the right end). Find the x-coordinate of the center of mass.',
      hint: 'Non-uniform density changes the mass integral: m = ∫₀^π ρ(x)·sin(x) dx, and Mᵧ = ∫₀^π x·ρ(x)·sin(x) dx. Integrate by parts where needed.',
      walkthrough: [
        { expression: 'm = \\int_0^\\pi\\left(1+\\frac{x}{\\pi}\\right)\\sin x\\,dx = \\int_0^\\pi\\sin x\\,dx + \\frac{1}{\\pi}\\int_0^\\pi x\\sin x\\,dx', annotation: 'Split the integral.' },
        { expression: '\\int_0^\\pi\\sin x\\,dx = [-\\cos x]_0^\\pi = 2', annotation: 'Standard integral.' },
        { expression: '\\int_0^\\pi x\\sin x\\,dx = [-x\\cos x]_0^\\pi + \\int_0^\\pi\\cos x\\,dx = \\pi + [\\sin x]_0^\\pi = \\pi + 0 = \\pi', annotation: 'Integration by parts: u=x, dv=sin x dx → du=dx, v=−cos x.' },
        { expression: 'm = 2 + \\frac{1}{\\pi}\\cdot\\pi = 2 + 1 = 3', annotation: 'Total (density-weighted) mass.' },
        { expression: 'M_y = \\int_0^\\pi x\\left(1+\\frac{x}{\\pi}\\right)\\sin x\\,dx = \\int_0^\\pi x\\sin x\\,dx + \\frac{1}{\\pi}\\int_0^\\pi x^2\\sin x\\,dx = \\pi + \\frac{1}{\\pi}\\int_0^\\pi x^2\\sin x\\,dx', annotation: 'Using ∫x sin x dx = π from above.' },
        { expression: '\\int_0^\\pi x^2\\sin x\\,dx = [-x^2\\cos x]_0^\\pi + 2\\int_0^\\pi x\\cos x\\,dx = \\pi^2 + 2[x\\sin x + \\cos x]_0^\\pi = \\pi^2 + 2[0 + (-1) - (0+1)] = \\pi^2 - 4', annotation: 'Integration by parts twice: first u=x², dv=sin x; then u=x, dv=cos x.' },
        { expression: 'M_y = \\pi + \\frac{\\pi^2-4}{\\pi} = \\pi + \\pi - \\frac{4}{\\pi} = 2\\pi - \\frac{4}{\\pi}', annotation: 'Combine.' },
        { expression: '\\bar{x} = \\frac{M_y}{m} = \\frac{2\\pi - 4/\\pi}{3} = \\frac{2\\pi^2-4}{3\\pi}', annotation: 'Multiply numerator and denominator through by π.' },
      ],
      answer: '\\bar{x} = \\dfrac{2\\pi^2-4}{3\\pi} \\approx \\dfrac{2(9.87)-4}{9.42} \\approx \\dfrac{15.74}{9.42} \\approx 1.67',
    },
  ],

  crossRefs: [
    { lessonSlug: 'volumes-disk-washer', label: 'Disk and Washer Methods', context: 'The y-moment formula Mₓ = (1/2)∫[f²−g²]dx mirrors the washer integrand. Pappus\'s theorem directly connects the centroid to the volume of revolution.' },
    { lessonSlug: 'volumes-shell', label: 'Shell Method', context: 'The x-moment Mᵧ = ∫x[f(x)−g(x)]dx is identical to the shell method integrand (divided by 2π). The shell method volume is just 2π·Mᵧ = 2π·x̄·A — Pappus\'s theorem in disguise.' },
    { lessonSlug: 'work-and-force', label: 'Work and Force', context: 'For uniform chains and cables, total lifting work equals (weight) × (distance center of mass travels). The center of mass integral underpins this shortcut.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'The mass m of a lamina equals the area between the bounding curves. Setting up the centroid calculation begins with the same bounds and functions used for area.' },
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
