export default {
  id: 'ch4-work',
  slug: 'work-and-force',
  chapter: 4,
  order: 16,
  title: 'Work, Force, and Energy',
  subtitle: 'Integration quantifies physical effort: stretching springs, pumping water, and pressing against pressure',
  tags: ['work', 'force', 'Hooke law', 'spring', 'pumping', 'hydrostatic pressure', 'dam', 'energy', 'physics'],

  hook: {
    question: 'A firefighter pumps water from a tank to the top of a building. The water at the bottom of the tank must travel the full height; water near the top travels barely at all. How do you calculate the total work done when different "particles" of water each travel a different distance?',
    realWorldContext:
      'Work is energy transferred by force over distance, and integration is the tool whenever that force or distance varies. ' +
      'Civil engineers compute the work required to pump water out of reservoirs, sumps, and storage tanks — different layers of water travel different heights, so the work must be integrated over depth. ' +
      'Mechanical engineers use Hooke\'s Law (F = kx) to design springs in car suspensions, mattresses, and seismic isolators; the work to compress or extend by a given distance is ∫kx dx. ' +
      'Dam engineers calculate hydrostatic forces — the water pressure on a dam face increases with depth, and the total force is an integral of pressure times area over the dam face. ' +
      'Rocket scientists integrate the varying thrust force over time to compute the impulse (change in momentum) for launch trajectories. ' +
      'Even elevators use integration: as the counterweight cable pays out, the effective weight being lifted changes, so total work is computed by integration.',
    previewVisualizationId: 'WaterTank',
  },

  intuition: {
    prose: [
      'In basic physics, Work = Force × Distance, but only when force is constant and motion is in one direction. When the force F(x) varies with position x, the work over a small displacement dx is dW = F(x) dx. Summing up all these tiny work contributions gives W = ∫ₐᵇ F(x) dx. This is the fundamental work integral — force is the integrand, and we integrate over displacement.',

      'Springs are the most common variable-force application. Hooke\'s Law says the restoring force of a spring is F = kx, where x is the displacement from natural length and k is the spring constant (in N/m). To stretch a spring from x=0 to x=d, the work is W = ∫₀ᵈ kx dx = (1/2)kd². The quadratic result (not linear) reflects that the force itself grows with displacement — you must do more work per additional millimeter the further you stretch.',

      'Pumping problems are the classic "different particles travel different distances" scenario. Set up a coordinate system with y measured from the bottom of the tank. A thin horizontal slice of water at height y and thickness dy has volume dV = A(y) dy (where A(y) is the cross-sectional area at height y). This slice weighs dW_weight = ρg·A(y)·dy (density × g × volume). To pump it to the top (height H), it must be lifted a distance (H − y). Work for this slice: dW = ρg(H−y)A(y) dy. Total: W = ∫₀ᴴ ρg(H−y)A(y) dy.',

      'Chain and cable problems work similarly. A hanging chain of linear density δ (kg/m) and length L has its lower end at y=0 and upper end at y=L. When you lift the entire chain, each segment at height y must be lifted a distance (L−y) to reach the top. Work = ∫₀ᴸ δg(L−y) dy. If you lift the chain to wind it onto a drum, the "lift distance" for the segment at y is (L−y) regardless — the integral accounts for all the varying distances automatically.',

      'Hydrostatic force (pressure force) on a submerged surface: water pressure at depth d is P = ρgd (force per unit area). For a vertical dam gate with width w(y) at depth d = (H−y) (where H is the water surface height and y is measured from the bottom), the force on a thin strip at height y is dF = P·dA = ρg(H−y)·w(y)·dy. Total force = ∫₀ᴴ ρg(H−y)·w(y) dy. This is structurally identical to the pumping integral — the same "distance to the top" factor (H−y) appears.',

      'The unifying insight across all these applications: integration is the tool whenever something accumulates with a varying rate. Work accumulates at rate F(x) per unit displacement. Hydrostatic force accumulates at rate P(y)·w(y) per unit height. The integral "sums up" infinitely many infinitesimal contributions, each involving a different value of the varying quantity. This is the same conceptual move as area, volume, and all other applications of the integral.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Setting Up Pumping Integrals: The 4-Step Method',
        body: '1. Draw the tank and set up a coordinate y (usually y=0 at the bottom, y=H at the top or outlet).\n2. Write the volume of a thin slice at height y: dV = A(y)dy (A = cross-sectional area).\n3. Write the distance the slice must travel: distance = (outlet height) − y.\n4. Write dW = ρg × distance × dV, then integrate from bottom to top of the water.',
      },
      {
        type: 'strategy',
        title: 'Hooke\'s Law Spring Problems',
        body: 'Key data to extract: spring constant k (N/m), natural length L₀, and the displacement range [a,b] measured from natural length.\nWork = ∫ₐᵇ kx dx = (1/2)k(b²−a²).\nIf given "force of F₀ N stretches the spring by d m", then k = F₀/d.\nAlways confirm: x is measured from the natural length (equilibrium position), not from some arbitrary reference.',
      },
      {
        type: 'real-world',
        title: 'Dam Engineering and Hydrostatic Force',
        body: 'The Hoover Dam holds back about 35 km³ of water. The pressure on the dam face increases linearly with depth (P = ρgh), reaching about 5 MPa at the base (water is 180 m deep). The total hydrostatic force on the dam face requires integrating this varying pressure over the entire face — the widest parts near the base carry the most force because both the pressure and the cross-sectional width are largest there. Total force ≈ 4 × 10¹¹ N.',
      },
      {
        type: 'intuition',
        title: 'Work = Area Under a Force Curve',
        body: 'Since W = ∫F(x)dx, the work is literally the area under the graph of F(x) vs. x. For a spring (F = kx), the F-vs-x graph is a straight line through the origin; the area under it from 0 to d is a triangle of area (1/2)·d·(kd) = (1/2)kd². This is why spring work is quadratic in displacement — the triangular area under a linear force function.',
      },
      {
        type: 'misconception',
        title: 'Pumping: Lift Distance vs. Current Position',
        body: 'A common error: taking "lift distance" as y (the current position) instead of (H−y) (the distance to the outlet). Water at height y must travel UP a distance of (H−y) to reach the pump outlet at height H. Sketch a thin slice and trace its journey — that journey length is what goes in the integrand, not the starting position.',
      },
    ],
    visualizations: [
      {
        id: 'WaterTank',
        title: 'Pumping Water — Interactive Tank',
        caption: 'Adjust the tank dimensions and pump outlet height. The visualization shows how the work contribution of each horizontal slice changes with depth — slices near the bottom contribute more work because they travel further.',
      },
      {
        id: 'FunctionPlotter',
        title: 'Hooke\'s Law: Area = Work',
        caption: 'Plot F = kx. The area under this line from x=0 to x=d is the shaded triangle with area (1/2)kd² — the work done stretching the spring by d.',
      },
    ],
  },

  math: {
    prose: [
      'Let $F(x)$ be a continuous force function on $[a,b]$. The work done by $F$ as an object moves from $x=a$ to $x=b$ is $W = \\int_a^b F(x)\\,dx$. This is a direct application of the definite integral: break $[a,b]$ into small subintervals, on each of which $F$ is approximately constant, compute work = force × distance for each, and sum.',

      'Hooke\'s Law spring work: $F(x) = kx$ where $x$ is displacement from natural length. Work to move from displacement $a$ to $b$: $W = \\int_a^b kx\\,dx = \\tfrac{1}{2}k(b^2-a^2) = \\tfrac{1}{2}k(b+a)(b-a)$.',

      'Pumping work: for a tank with cross-sectional area $A(y)$ at height $y$, filled from $y=0$ to $y=H$, pumped to outlet at height $y=D\\geq H$: $W = \\int_0^H \\rho g\\,(D-y)\\,A(y)\\,dy$. Here $\\rho=1000$ kg/m$^3$ (water density), $g\\approx 9.8$ m/s$^2$. In US customary units, use weight density $\\gamma = 62.4$ lb/ft$^3$ and omit the separate $g$.',

      'Hydrostatic force on a vertical plate: if the plate is submerged with its top at depth $d_1$ and bottom at depth $d_2$ (both measured from the water surface, with $d_1 < d_2$), and has width $w(d)$ at depth $d$: $F = \\int_{d_1}^{d_2}\\rho g\\,d\\,w(d)\\,dd$. The pressure $P = \\rho g d$ increases linearly with depth.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work and Force Formulas',
        body: '\\text{Variable force: } W = \\int_a^b F(x)\\,dx\\\\\n\\text{Hooke\'s Law spring: } W = \\int_a^b kx\\,dx = \\tfrac{1}{2}k(b^2-a^2)\\\\\n\\text{Pumping (coordinate from bottom): } W = \\int_0^H \\rho g(D-y)A(y)\\,dy\\\\\n\\text{Chain/rope lifting: } W = \\int_0^L \\delta g(L-y)\\,dy = \\tfrac{1}{2}\\delta g L^2\\\\\n\\text{Hydrostatic force: } F = \\int_{d_1}^{d_2}\\rho g\\, d\\cdot w(d)\\,dd',
      },
      {
        type: 'theorem',
        title: 'Physical Constants (SI Units)',
        body: '\\text{Water density: } \\rho = 1000 \\text{ kg/m}^3\\\\\n\\text{Gravitational acceleration: } g = 9.8 \\text{ m/s}^2\\\\\n\\text{Weight density of water: } \\rho g = 9800 \\text{ N/m}^3\\\\\n\\text{In US units: } \\gamma_{\\text{water}} = 62.4 \\text{ lb/ft}^3 \\text{ (weight density, g already included)}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The work integral $W = \\int_a^b F(x)\\,dx$ is derived from the Riemann sum approximation. Partition $[a,b]$ into $n$ subintervals. On each subinterval $[x_{i-1},x_i]$, the force is approximately $F(x_i^*)$ (a constant). The work done is approximately $F(x_i^*)\\Delta x_i$. Summing: $W \\approx \\sum_{i=1}^n F(x_i^*)\\Delta x_i$. This is a Riemann sum, and as $n\\to\\infty$ it converges to $\\int_a^b F(x)\\,dx$ when $F$ is continuous. The formula therefore follows from first principles of integration.',

      'For pumping problems, the derivation is a chain of physical reasoning + integration. A horizontal slice of fluid at height $y$ with thickness $dy$ has mass $dm = \\rho A(y)\\,dy$, weight $dW_{\\text{wt}} = \\rho g A(y)\\,dy$, and must be lifted a distance $(D-y)$, doing work $dW = (D-y)\\rho g A(y)\\,dy$. The total work $W = \\int_0^H (D-y)\\rho g A(y)\\,dy$ assumes that: (a) fluid elements are lifted independently (no viscous interaction), (b) the cross-section area $A(y)$ is a known function of $y$, (c) the density is uniform. These assumptions are standard for idealized pump calculations.',

      'Hydrostatic pressure rigorous basis: Pascal\'s principle states that pressure at depth $d$ in a static fluid is $P(d) = P_0 + \\rho g d$ (gauge pressure $= \\rho g d$). The force on an area element $dA$ at depth $d$ is $dF = P\\,dA = \\rho g d\\,dA$. For a vertical plate with width $w(d)$, the area element $dA = w(d)\\,dd$, giving $dF = \\rho g d\\,w(d)\\,dd$. Integrating gives the total hydrostatic force. The key assumption is that the pressure is uniform across any horizontal strip (valid in a static fluid).',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-work-ex1',
      title: 'Hooke\'s Law: Work to Stretch a Spring',
      problem: '\\text{A spring has natural length 0.5 m. A force of 30 N stretches it to 0.8 m. Find the work done stretching it from 0.6 m to 1.0 m.}',
      steps: [
        { expression: '\\text{Stretch from natural length to 0.8 m: }\\Delta x = 0.8 - 0.5 = 0.3\\text{ m}', annotation: 'Displacement from natural length. Hooke\'s Law uses displacement from equilibrium, not total length.' },
        { expression: 'F = k\\Delta x \\Rightarrow 30 = k(0.3) \\Rightarrow k = 100 \\text{ N/m}', annotation: 'Solve for spring constant k using given force and displacement.' },
        { expression: '\\text{Stretch range in problem: from 0.6 m to 1.0 m}', annotation: 'Convert to displacements from natural length: 0.6−0.5 = 0.1 m and 1.0−0.5 = 0.5 m. So integrate x from 0.1 to 0.5.' },
        { expression: 'W = \\int_{0.1}^{0.5} 100x\\,dx = 100\\left[\\frac{x^2}{2}\\right]_{0.1}^{0.5} = 50\\left[(0.5)^2-(0.1)^2\\right]', annotation: 'Apply work integral with k=100 N/m.' },
        { expression: '= 50[0.25-0.01] = 50(0.24) = 12 \\text{ J}', annotation: 'Calculate: 0.25 − 0.01 = 0.24. Multiply by 50.' },
      ],
      conclusion: 'W = 12 J. Key steps: (1) find k from the given data, (2) convert total spring lengths to displacements from natural length, (3) integrate kx over those displacements. The units check: N/m × m² = N·m = J (joules).',
    },
    {
      id: 'ch4-work-ex2',
      title: 'Pumping Water from a Cylindrical Tank',
      problem: '\\text{A cylindrical tank has radius 2 m and height 4 m. It is full of water. Find the work to pump all the water to the top of the tank.}',
      steps: [
        { expression: '\\text{Setup: } y = 0 \\text{ at bottom, } y = 4 \\text{ at top. Outlet is at } y = 4.', annotation: 'Coordinate system. For a cylinder, the cross-sectional area is constant: A(y) = π(2)² = 4π m² for all y.' },
        { expression: '\\text{Thin slice at height } y:\\; dV = 4\\pi\\, dy,\\quad \\text{weight} = \\rho g\\cdot 4\\pi\\, dy = 9800\\cdot 4\\pi\\, dy', annotation: 'Weight of slice = (water density × g) × volume = 9800 × 4π dy N.' },
        { expression: '\\text{Lift distance for slice at height } y: \\; (4 - y) \\text{ m}', annotation: 'The slice at height y must travel (4−y) meters to reach the top at y=4.' },
        { expression: 'W = \\int_0^4 9800\\cdot 4\\pi(4-y)\\,dy = 39200\\pi\\int_0^4(4-y)\\,dy', annotation: 'Assemble: dW = weight × lift distance × dy. Factor out constants.' },
        { expression: '= 39200\\pi\\left[4y - \\frac{y^2}{2}\\right]_0^4 = 39200\\pi\\left[16 - 8\\right] = 39200\\pi\\cdot 8', annotation: 'Evaluate: 4(4)−(16/2) = 16−8 = 8.' },
        { expression: '= 313600\\pi \\approx 985353 \\text{ J} \\approx 985 \\text{ kJ}', annotation: 'About 985 kJ — roughly the energy in a quarter-pound of sugar. Significant but not enormous for a 4-meter tank.' },
      ],
      conclusion: 'W = 313600π ≈ 985 kJ. The key insight is that water near the top requires very little work (small lift distance) while water at the bottom requires the most work. The linear factor (4−y) in the integrand captures this variation. For a full tank, the average lift distance is exactly H/2 = 2 m, which can be verified: W = ρg·A·H·(H/2) = 9800·4π·4·2 = 313600π.',
    },
    {
      id: 'ch4-work-ex3',
      title: 'Lifting a Hanging Chain',
      problem: '\\text{A chain 30 m long has linear density 5 kg/m and hangs vertically. Find the work to lift the entire chain to the top.}',
      steps: [
        { expression: '\\text{Setup: } y = 0 \\text{ at the bottom (free end), } y = 30 \\text{ at the attachment point (top).}', annotation: 'Coordinate system. The chain hangs from y=30 down to y=0.' },
        { expression: '\\text{Thin segment at height } y,\\; \\text{length } dy:\\; \\text{weight} = \\delta g\\, dy = 5\\times 9.8\\,dy = 49\\,dy \\text{ N}', annotation: 'Weight of thin chain segment. Linear density δ = 5 kg/m, so mass per dy is 5 dy kg.' },
        { expression: '\\text{Lift distance: this segment must travel } (30-y) \\text{ m to reach the top at } y=30', annotation: 'The segment currently at height y needs to go up to y=30 — a distance of 30−y.' },
        { expression: 'W = \\int_0^{30} 49(30-y)\\,dy = 49\\left[30y-\\frac{y^2}{2}\\right]_0^{30}', annotation: 'Integrate: dW = 49(30−y)dy.' },
        { expression: '= 49\\left[900 - 450\\right] = 49\\cdot 450 = 22050 \\text{ J}', annotation: 'Evaluate: 30(30)−30²/2 = 900−450 = 450.' },
        { expression: '\\text{Alternative: work = (total weight)×(distance center of mass travels)} = (5\\times 30\\times 9.8)\\times 15 = 22050\\text{ J}\\;\\checkmark', annotation: 'The center of mass of the chain starts at y=15 (midpoint) and travels 15 m to y=30. This shortcut works because density is uniform.' },
      ],
      conclusion: 'W = 22050 J = 22.05 kJ. The shortcut (total weight × distance of center of mass) gives the same answer as integration — but only works when the density is uniform. The integration approach works even when the chain has variable density δ(y), making it more powerful.',
    },
    {
      id: 'ch4-work-ex4',
      title: 'Pumping from a Conical Tank',
      problem: '\\text{A conical tank (vertex down) has height 6 m and top radius 2 m. Full of water. Find work to pump water to 1 m above the top.}',
      steps: [
        { expression: '\\text{Setup: } y = 0 \\text{ at vertex (bottom)}, y = 6 \\text{ at top. Outlet at } y = 7.', annotation: 'Vertex-down cone: narrow at bottom, wide at top. Outlet is 1 m above the rim.' },
        { expression: '\\text{Radius at height } y: \\text{ by similar triangles, } r(y) = \\frac{2}{6}y = \\frac{y}{3}', annotation: 'The cone has radius 2 at y=6 and 0 at y=0. Linear interpolation: r(y)/y = 2/6 = 1/3.' },
        { expression: 'A(y) = \\pi r(y)^2 = \\pi\\frac{y^2}{9}', annotation: 'Cross-sectional area at height y.' },
        { expression: '\\text{Lift distance: } (7 - y)', annotation: 'Each slice at height y must travel to y=7 (outlet).' },
        { expression: 'W = \\int_0^6\\rho g(7-y)\\cdot\\frac{\\pi y^2}{9}\\,dy = \\frac{9800\\pi}{9}\\int_0^6(7y^2 - y^3)\\,dy', annotation: 'Assemble: ρg × lift × area. Factor constants. Distribute (7−y)·y².' },
        { expression: '= \\frac{9800\\pi}{9}\\left[\\frac{7y^3}{3} - \\frac{y^4}{4}\\right]_0^6 = \\frac{9800\\pi}{9}\\left[\\frac{7\\cdot 216}{3} - \\frac{1296}{4}\\right]', annotation: 'Evaluate at y=6: 6³=216, 6⁴=1296.' },
        { expression: '= \\frac{9800\\pi}{9}\\left[504 - 324\\right] = \\frac{9800\\pi\\cdot 180}{9} = 9800\\pi\\cdot 20 = 196000\\pi \\approx 615752 \\text{ J}', annotation: '504−324 = 180. Then 180/9 = 20.' },
      ],
      conclusion: 'W = 196000π ≈ 616 kJ. The conical shape makes A(y) = πy²/9 (not constant), so the integrand is a polynomial in y times (7−y). The similar-triangles step to find r(y) is critical — always set up the geometry carefully before writing the integral.',
    },
    {
      id: 'ch4-work-ex5',
      title: 'Hydrostatic Force on a Trapezoidal Dam Gate',
      problem: '\\text{A vertical dam gate is trapezoidal: 4 m wide at the top, 2 m wide at the bottom, and 3 m tall. Water fills to the top. Find the total hydrostatic force on the gate.}',
      steps: [
        { expression: '\\text{Setup: depth } d \\text{ measured downward from water surface. Gate spans } d\\in[0,3].', annotation: 'Depth d=0 at water surface (top of gate), d=3 at bottom of gate.' },
        { expression: 'w(d) = 4 - \\frac{2}{3}d', annotation: 'Width at depth d: at d=0, w=4 (top, widest); at d=3, w=2 (bottom, narrowest). Linear interpolation: w = 4 − (2/3)d.' },
        { expression: 'P(d) = \\rho g\\,d = 9800d \\text{ N/m}^2', annotation: 'Water pressure at depth d.' },
        { expression: 'dF = P(d)\\cdot w(d)\\cdot dd = 9800d\\left(4 - \\frac{2d}{3}\\right)dd', annotation: 'Force on thin strip of width w(d) and height dd at depth d.' },
        { expression: 'F = 9800\\int_0^3 d\\left(4-\\frac{2d}{3}\\right)dd = 9800\\int_0^3\\left(4d - \\frac{2d^2}{3}\\right)dd', annotation: 'Distribute and integrate.' },
        { expression: '= 9800\\left[2d^2 - \\frac{2d^3}{9}\\right]_0^3 = 9800\\left[18 - \\frac{54}{9}\\right] = 9800\\left[18-6\\right] = 9800\\cdot 12 = 117600 \\text{ N}', annotation: 'Evaluate at d=3: 2(9)=18, 2(27)/9=6. Difference=12.' },
      ],
      conclusion: 'F = 117,600 N ≈ 117.6 kN ≈ 26,400 lb. This is the force the gate must withstand (plus a safety factor). Notice the width decreases with depth while pressure increases — these competing effects mean the force distribution is not simply symmetric. The integral accounts for both effects simultaneously.',
    },
  ],

  challenges: [
    {
      id: 'ch4-work-ch1',
      difficulty: 'easy',
      problem: 'A spring has spring constant k = 40 N/m and natural length 0.25 m. Find the work done compressing it from its natural length to 0.15 m (a compression of 0.10 m).',
      hint: 'Compression means x goes from 0 to 0.10 m (displacement from natural length). W = ∫₀^{0.10} 40x dx.',
      walkthrough: [
        { expression: 'x = 0.25 - 0.15 = 0.10 \\text{ m (displacement from natural length)}', annotation: 'The spring is compressed by 0.10 m.' },
        { expression: 'W = \\int_0^{0.10} 40x\\,dx = 40\\left[\\frac{x^2}{2}\\right]_0^{0.10} = 20(0.01) = 0.20 \\text{ J}', annotation: 'Integrate Hooke\'s Law force over displacement.' },
      ],
      answer: 'W = 0.20 \\text{ J}',
    },
    {
      id: 'ch4-work-ch2',
      difficulty: 'medium',
      problem: 'A hemispherical tank of radius 3 m is full of water. Find the work required to pump all the water to the top of the tank (the flat rim). The tank sits with its flat face up and curved bottom down.',
      hint: 'Set up coordinates with y=0 at the bottom of the hemisphere, y=3 at the top. Cross-sectional radius at height y: by circle equation x²+(y−3)²=9 (center at y=3), so r(y)² = 9−(y−3)² = 6y−y². Outlet is at y=3.',
      walkthrough: [
        { expression: 'r(y)^2 = 9-(y-3)^2 = 6y-y^2\\quad\\text{(radius of circular cross-section at height }y\\text{)}', annotation: 'The hemisphere has center at (0,3) (the flat top), radius 3. Circle equation gives r² at height y.' },
        { expression: 'A(y) = \\pi r(y)^2 = \\pi(6y-y^2)', annotation: 'Cross-sectional area.' },
        { expression: 'W = \\int_0^3 9800(3-y)\\cdot\\pi(6y-y^2)\\,dy = 9800\\pi\\int_0^3(3-y)y(6-y)\\,dy', annotation: 'Lift distance = (3−y). Factor 6y−y² = y(6−y).' },
        { expression: '= 9800\\pi\\int_0^3(3-y)(6y-y^2)\\,dy = 9800\\pi\\int_0^3(18y-3y^2-6y^2+y^3)\\,dy = 9800\\pi\\int_0^3(18y-9y^2+y^3)\\,dy', annotation: 'Expand (3−y)(6y−y²) = 18y−3y²−6y²+y³.' },
        { expression: '= 9800\\pi\\left[9y^2-3y^3+\\frac{y^4}{4}\\right]_0^3 = 9800\\pi\\left[81-81+\\frac{81}{4}\\right] = 9800\\pi\\cdot\\frac{81}{4}', annotation: '9(9)=81, 3(27)=81, these cancel! 3⁴/4=81/4.' },
        { expression: '= \\frac{9800\\cdot 81\\pi}{4} = \\frac{793800\\pi}{4} \\approx 623160 \\text{ J} \\approx 623 \\text{ kJ}', annotation: 'Numerical answer.' },
      ],
      answer: 'W = \\dfrac{793800\\pi}{4} \\approx 623 \\text{ kJ}',
    },
    {
      id: 'ch4-work-ch3',
      difficulty: 'hard',
      problem: 'A cable car on a mountain slope has a cable of length 200 m and linear density 3 kg/m. As the car goes up, the cable on the uphill side lengthens from 0 to 200 m. Find the work done against gravity to move the cable from being fully coiled at the bottom to being fully extended up the slope, assuming the slope makes a 30° angle with horizontal.',
      hint: 'The cable hangs along the slope, not vertically. The component of gravity along the slope is g·sin(30°) = g/2. A segment at distance s from the bottom along the slope rises a height s·sin(30°) = s/2. Work for segment ds: dW = 3·g·(s/2)·ds.',
      walkthrough: [
        { expression: '\\text{Gravity component along slope: } g\\sin 30° = 9.8\\times 0.5 = 4.9 \\text{ m/s}^2', annotation: 'Only the component of gravity along the slope direction does work on the cable.' },
        { expression: 'dW = (\\text{weight element})(\\text{distance traveled along slope})= 3\\cdot 4.9\\cdot s\\,ds', annotation: 'Each segment of length ds at position s along the slope must travel s from the bottom.' },
        { expression: 'W = \\int_0^{200} 3\\cdot 4.9\\cdot s\\,ds = 14.7\\int_0^{200}s\\,ds = 14.7\\cdot\\frac{(200)^2}{2} = 14.7\\cdot 20000 = 294000 \\text{ J}', annotation: 'Integrate. This is the work against the slope component of gravity.' },
        { expression: 'W = 294 \\text{ kJ}', annotation: 'Compare: lifting the same cable vertically (full height = 200·sin30°=100 m) would take ∫₀^{200}3·9.8·(100−s·sin30°)ds ... the slope problem is actually easier because the effective gravity is reduced.' },
      ],
      answer: 'W = 294{,}000 \\text{ J} = 294 \\text{ kJ}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'All work integrals are definite integrals of force over displacement. The Riemann sum interpretation — summing F·Δx over many subintervals — is the physical justification for using integration.' },
    { lessonSlug: 'area-accumulation', label: 'Area and Accumulation', context: 'Work = area under the force curve. The connection between area and accumulated quantities is the unifying theme of all applications of integration.' },
    { lessonSlug: 'centers-of-mass', label: 'Centers of Mass', context: 'For uniform-density chains and ropes, the work to lift equals (total weight) × (distance center of mass travels) — a result provable from the center-of-mass integral.' },
    { lessonSlug: 'applications', label: 'Applications Overview', context: 'Work, area, and volume are the three main types of "accumulation" integrals. All share the same structure: identify the tiny contribution, integrate.' },
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
