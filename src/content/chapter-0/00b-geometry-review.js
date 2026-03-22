export default {
  id: 'ch0-geometry-review',
  slug: 'geometry-review',
  chapter: 0,
  order: 0.2,
  title: 'Coordinate Geometry Review',
  subtitle: 'Lines, triangles, circles, and the coordinate plane',
  tags: ['geometry', 'coordinate plane', 'distance formula', 'midpoint', 'slope', 'parallel', 'perpendicular', 'equation of a line', 'circle', 'triangle', 'area', 'Pythagorean theorem', 'similar triangles', 'point-slope form', 'slope-intercept', 'standard form'],

  hook: {
    question: 'Why does a² + b² = c² work, and how does one equation connect distances, slopes, and circles?',
    realWorldContext:
      'GPS navigation uses the distance formula to calculate how far you are from your destination. ' +
      'Architects use slope to design wheelchair ramps that meet accessibility codes (no steeper than 1:12). ' +
      'Engineers model satellite orbits as circles and ellipses in coordinate geometry. ' +
      'Even video game collision detection relies on distance formulas and circle equations to determine when objects touch.',
    previewVisualizationId: 'PythagoreanProof',
  },

  intuition: {
    prose: [
      'René Descartes had a revolutionary idea in the 1600s: put a grid on the plane. Assign every point a pair of numbers $(x, y)$. Suddenly, geometry becomes algebra. Shapes become equations. Proofs become calculations. This fusion of geometry and algebra — **coordinate geometry** (or analytic geometry) — is the language calculus is built on.',

      'The **distance formula** is just the Pythagorean theorem wearing a disguise. To find the distance between $(x_1, y_1)$ and $(x_2, y_2)$, form a right triangle with horizontal leg $|x_2 - x_1|$ and vertical leg $|y_2 - y_1|$. By the Pythagorean theorem, the hypotenuse (the distance) is $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.',

      'The **midpoint** between two points is simply the average of their coordinates: $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$. Think of it as meeting your friend halfway — you average your positions.',

      '**Slope** measures steepness: $m = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$, which we read as "rise over run." A positive slope goes uphill left to right, negative goes downhill, zero is flat, and undefined (vertical) means $\\Delta x = 0$. In calculus, the derivative is just the instantaneous slope — so understanding slope now is essential.',

      'Two lines are **parallel** when they have the same slope ($m_1 = m_2$) — they rise at the same rate and never meet. Two lines are **perpendicular** when their slopes are negative reciprocals ($m_1 \\cdot m_2 = -1$) — one rises exactly as fast as the other runs. A visual check: perpendicular lines form a 90° angle at their intersection.',

      'A **circle** is the set of all points at a fixed distance (the radius $r$) from a fixed point (the center $(h, k)$). Using the distance formula directly: $\\sqrt{(x-h)^2 + (y-k)^2} = r$, which squares to $(x-h)^2 + (y-k)^2 = r^2$. This is the standard equation of a circle. Every term in this equation has a geometric meaning.',

      'Triangles are everywhere in calculus — from computing areas under curves to understanding the geometry behind trigonometric functions. The area of a triangle is $A = \\frac{1}{2} \\cdot \\text{base} \\cdot \\text{height}$. **Similar triangles** have the same angles and proportional sides — they are scaled copies of each other, and their corresponding side ratios are equal.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'The Pythagorean Theorem is About Area',
        body: 'The theorem says the area of the square on the hypotenuse equals the sum of the areas of the squares on the other two sides. This is literally what a² + b² = c² means: three squares, and their areas add up.',
      },
      {
        type: 'tip',
        title: 'Three Forms of a Line Equation',
        body: 'Slope-intercept: y = mx + b (best for graphing). Point-slope: y − y₁ = m(x − x₁) (best for writing equations quickly). Standard: Ax + By = C (best for finding intercepts). Convert between them as needed.',
      },
      {
        type: 'misconception',
        title: 'Slope Is Not an Angle',
        body: 'Slope is rise/run, not the angle of inclination. A slope of 1 means a 45° angle, but a slope of 2 does NOT mean 90°. The relationship is m = tan(θ), where θ is the angle. Slope can be any real number; angles are bounded.',
      },
      {
        type: 'technique',
        title: 'Finding Circle Equations from Geometry',
        body: 'Given three points on a circle, set up three equations using (x−h)² + (y−k)² = r² with unknowns h, k, r. Alternatively, the center lies on the perpendicular bisector of any chord — find two perpendicular bisectors and intersect them.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "TR-31: Solving SSA Triangles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/NQSPgObl80M" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-30: SSA Triangles Overview (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/o_t0qqzqqZ4" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-29: The Law of Cosines (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/4yo5nlTtjB8" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-28: The Law of Sines (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/TzsKsxLuwgo" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-27: Triangle Types to Solve (Trigonometry Series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/kuEr6xq7c1A" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-26: Solving Right Triangles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/CE_7EZNcG2s" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-12: Distance Between Points in Space (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/7br1PvhFedQ" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-11: Distance Between Points in a Plane (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/Cy90jWCrPfo" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-09Z: Proof of Pythagorean Theorem (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/0M2aTzmhjXM" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-09: The Pythagorean Theorem (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/4A9iNamXuZk" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-08: Similar and Congruent Triangles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/lNd-ubyTkg4" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-07Z: First Proof Thales' Theorem (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/hfr2Sp8W1uU" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-07: Geometry Review of Triangles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/mRqMtR1D4KE" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-06: Angle Measurement in Radians (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/pQya8y6YC0U" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-05: Introduction to Radians (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/oJ-BbwvwQg0" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-04Z: Degrees Minutes and Seconds (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/eR_KZQtMvx0" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-04: Angle Measurement in Degrees (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/gYKig6D3_Ck" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-03: Angle Relationships (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/ZjAWq2AnZkQ" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-02: Types of Angles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/fqm95DcmJaQ" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-01: Introduction to Angles (Trigonometry series by Dennis F. Davis)",
        props: { url: "https://www.youtube.com/embed/OFK1SRVbkaA" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-00: Introduction to Trigonometry Series by Dennis F. Davis",
        props: { url: "https://www.youtube.com/embed/U23JMdBIJ0M" }
      },
      { id: 'PythagoreanProof', title: 'Visual Proof of the Pythagorean Theorem', caption: 'Watch the squares rearrange to prove a² + b² = c².' },
    ],
  },

  math: {
    prose: [
      'The **distance formula** between points $P_1 = (x_1, y_1)$ and $P_2 = (x_2, y_2)$ is: $d(P_1, P_2) = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. This follows directly from the Pythagorean theorem applied to the right triangle with legs $|x_2 - x_1|$ and $|y_2 - y_1|$.',

      'The **equation of a line** through $(x_1, y_1)$ with slope $m$ is $y - y_1 = m(x - x_1)$ (point-slope form). Distributing gives $y = mx + (y_1 - mx_1) = mx + b$ (slope-intercept form) where $b = y_1 - mx_1$ is the $y$-intercept.',

      'For **parallel lines**, $m_1 = m_2$. For **perpendicular lines**, $m_1 \\cdot m_2 = -1$ (equivalently $m_2 = -1/m_1$). The perpendicularity condition comes from the fact that rotating a direction vector $(1, m)$ by 90° gives $(-m, 1)$, which has slope $-1/m$.',

      'The **standard equation of a circle** with center $(h, k)$ and radius $r$ is $(x - h)^2 + (y - k)^2 = r^2$. The **general form** $x^2 + y^2 + Dx + Ey + F = 0$ is obtained by expanding. To go from general form back to standard form, **complete the square** in both $x$ and $y$.',

      'The area of a triangle with vertices $(x_1, y_1)$, $(x_2, y_2)$, $(x_3, y_3)$ can be computed using the **shoelace formula**: $\\displaystyle A = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|$. This elegant formula avoids needing to identify base and height explicitly.',

      'Two triangles are **similar** (written $\\triangle ABC \\sim \\triangle DEF$) if their corresponding angles are equal. This implies their corresponding sides are proportional: $\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}$. The **AA criterion** says that two angles matching is sufficient (the third must match too, since angles in a triangle sum to 180°).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Pythagorean Theorem',
        body: '\\text{In a right triangle with legs } a, b \\text{ and hypotenuse } c: \\\\ a^2 + b^2 = c^2',
      },
      {
        type: 'definition',
        title: 'Equation of a Circle',
        body: '(x - h)^2 + (y - k)^2 = r^2 \\\\ \\text{Center: } (h, k), \\quad \\text{Radius: } r',
      },
      {
        type: 'theorem',
        title: 'Shoelace Formula for Triangle Area',
        body: 'A = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|',
      },
    ],
    visualizations: [
      { id: 'CircleAreaProof', title: 'Circle Area Visual Proof', caption: 'See how slicing a circle into sectors reveals the area formula πr².' },
    ],
  },

  rigor: {
    prose: [
      'The Pythagorean theorem can be proved in many ways. One elegant proof uses area. Arrange four copies of a right triangle with legs $a, b$ and hypotenuse $c$ inside a large square of side $a + b$. The four triangles leave a square hole of side $c$ in the center. Computing the area two ways: $(a+b)^2 = 4 \\cdot \\frac{1}{2}ab + c^2$. Expanding: $a^2 + 2ab + b^2 = 2ab + c^2$. Cancel $2ab$: $a^2 + b^2 = c^2$.',

      'The distance formula is the Pythagorean theorem applied to the right triangle with vertices at $(x_1, y_1)$, $(x_2, y_1)$, and $(x_2, y_2)$. The horizontal leg has length $|x_2 - x_1|$ and the vertical leg has length $|y_2 - y_1|$. By the Pythagorean theorem, the hypotenuse has length $\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$. Squaring removes the absolute values, which is why the formula works without them.',

      'To prove the perpendicularity condition rigorously: two non-vertical lines with slopes $m_1, m_2$ are perpendicular if and only if $m_1 m_2 = -1$. Take direction vectors $\\vec{v}_1 = (1, m_1)$ and $\\vec{v}_2 = (1, m_2)$. They are perpendicular when $\\vec{v}_1 \\cdot \\vec{v}_2 = 0$, i.e., $1 \\cdot 1 + m_1 \\cdot m_2 = 0$, giving $m_1 m_2 = -1$.',

      'The shoelace formula can be derived from the cross product. The signed area of the triangle with vertices at the origin, $(x_1, y_1)$, and $(x_2, y_2)$ is $\\frac{1}{2}(x_1 y_2 - x_2 y_1)$. For a general triangle, translate one vertex to the origin and apply this formula, or decompose into signed areas of trapezoids.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Perpendicularity Condition',
        body: '\\text{Non-vertical lines with slopes } m_1, m_2 \\text{ are perpendicular} \\\\ \\iff m_1 \\cdot m_2 = -1 \\\\ \\text{Proof: } (1, m_1) \\cdot (1, m_2) = 1 + m_1 m_2 = 0',
      },
      {
        type: 'theorem',
        title: 'Small-Angle Approximations',
        body: '\\text{For small } \\theta \\text{ (in radians):} \\\\ \\sin\\theta \\approx \\theta, \\quad \\cos\\theta \\approx 1, \\quad \\tan\\theta \\approx \\theta \\\\ \\text{Geometric reason: the arc length } s = r\\theta \\text{ and the chord length approach each other as } \\theta \\to 0. \\\\ \\text{These approximations power the proofs of } \\lim_{\\theta\\to 0}\\frac{\\sin\\theta}{\\theta}=1 \\text{ and } \\frac{d}{dx}[\\sin x]=\\cos x.',
      },
    ],
    visualizations: [
      { id: 'TriangleAreaProof', title: 'Triangle Area Proof', caption: 'Visual proof that the area of a triangle is half base times height.' },
    ],
  },

  examples: [
    {
      id: 'ex-distance-midpoint',
      title: 'Distance and Midpoint',
      problem: 'Find the distance between $A = (-1, 3)$ and $B = (5, -1)$, and the midpoint of $\\overline{AB}$.',
      steps: [
        { expression: 'd = \\sqrt{(5-(-1))^2 + (-1-3)^2}', annotation: 'Apply the distance formula.' },
        { expression: '= \\sqrt{6^2 + (-4)^2} = \\sqrt{36 + 16}', annotation: 'Compute the differences and square them.' },
        { expression: '= \\sqrt{52} = 2\\sqrt{13}', annotation: 'Simplify: 52 = 4 × 13.' },
        { expression: 'M = \\left(\\frac{-1+5}{2}, \\frac{3+(-1)}{2}\\right) = (2, 1)', annotation: 'Average the coordinates for the midpoint.' },
      ],
      conclusion: 'The distance is $2\\sqrt{13} \\approx 7.21$ units and the midpoint is $(2, 1)$.',
    },
    {
      id: 'ex-perpendicular-line',
      title: 'Equation of a Perpendicular Line',
      problem: 'Find the equation of the line perpendicular to $y = 3x - 2$ that passes through $(6, 1)$.',
      steps: [
        { expression: 'm_1 = 3', annotation: 'The given line has slope 3.' },
        { expression: 'm_2 = -\\frac{1}{3}', annotation: 'Perpendicular slope is the negative reciprocal.' },
        { expression: 'y - 1 = -\\frac{1}{3}(x - 6)', annotation: 'Point-slope form with the point (6, 1).' },
        { expression: 'y - 1 = -\\frac{1}{3}x + 2', annotation: 'Distribute.' },
        { expression: 'y = -\\frac{1}{3}x + 3', annotation: 'Slope-intercept form.' },
      ],
      conclusion: 'The perpendicular line is $y = -\\frac{1}{3}x + 3$. You can verify: $3 \\times (-\\frac{1}{3}) = -1$.',
    },
    {
      id: 'ex-circle-equation',
      title: 'From General Form to Standard Form (Circle)',
      problem: 'Write $x^2 + y^2 - 6x + 4y - 12 = 0$ in standard form and identify center and radius.',
      steps: [
        { expression: '(x^2 - 6x) + (y^2 + 4y) = 12', annotation: 'Group x-terms and y-terms; move constant to the right.' },
        { expression: '(x^2 - 6x + 9) + (y^2 + 4y + 4) = 12 + 9 + 4', annotation: 'Complete the square in both groups. Half of -6 is -3, squared is 9. Half of 4 is 2, squared is 4.' },
        { expression: '(x - 3)^2 + (y + 2)^2 = 25', annotation: 'Factor the perfect squares.' },
        { expression: '\\text{Center: } (3, -2), \\quad r = \\sqrt{25} = 5', annotation: 'Read off center and radius from standard form.' },
      ],
      conclusion: 'The circle has center $(3, -2)$ and radius 5. Completing the square is the key technique for converting to standard form.',
    },
    {
      id: 'ex-shoelace',
      title: 'Triangle Area Using the Shoelace Formula',
      problem: 'Find the area of the triangle with vertices $A = (1, 2)$, $B = (4, 6)$, $C = (7, 1)$.',
      steps: [
        { expression: 'A = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|', annotation: 'Apply the shoelace formula.' },
        { expression: '= \\frac{1}{2}|1(6 - 1) + 4(1 - 2) + 7(2 - 6)|', annotation: 'Substitute the coordinates.' },
        { expression: '= \\frac{1}{2}|5 + (-4) + (-28)|', annotation: 'Compute each term.' },
        { expression: '= \\frac{1}{2}|-27| = \\frac{27}{2}', annotation: 'Take absolute value and divide by 2.' },
      ],
      conclusion: 'The area is $\\frac{27}{2} = 13.5$ square units. The shoelace formula works for any triangle without needing to find base and height.',
    },
  ],

  challenges: [
    {
      id: 'ch0-geo-c1',
      difficulty: 'easy',
      problem: 'Find the equation of the line through $(-2, 5)$ and $(4, -1)$.',
      hint: 'First find the slope using m = (y₂ − y₁)/(x₂ − x₁), then use point-slope form.',
      walkthrough: [
        { expression: 'm = \\frac{-1 - 5}{4 - (-2)} = \\frac{-6}{6} = -1', annotation: 'Calculate the slope.' },
        { expression: 'y - 5 = -1(x - (-2)) = -(x + 2)', annotation: 'Point-slope form using (-2, 5).' },
        { expression: 'y = -x - 2 + 5 = -x + 3', annotation: 'Simplify to slope-intercept form.' },
      ],
      answer: 'y = −x + 3',
    },
    {
      id: 'ch0-geo-c2',
      difficulty: 'medium',
      problem: 'Prove that the triangle with vertices $A = (0, 0)$, $B = (4, 0)$, $C = (0, 3)$ is a right triangle, and find its area.',
      hint: 'Check if the Pythagorean theorem holds: compute all three side lengths.',
      walkthrough: [
        { expression: 'AB = \\sqrt{(4-0)^2 + (0-0)^2} = 4', annotation: 'Distance from A to B.' },
        { expression: 'AC = \\sqrt{(0-0)^2 + (3-0)^2} = 3', annotation: 'Distance from A to C.' },
        { expression: 'BC = \\sqrt{(4-0)^2 + (0-3)^2} = \\sqrt{16+9} = 5', annotation: 'Distance from B to C.' },
        { expression: 'AB^2 + AC^2 = 16 + 9 = 25 = BC^2\\;\\checkmark', annotation: 'Pythagorean theorem holds, so the right angle is at A.' },
        { expression: 'A = \\frac{1}{2}(4)(3) = 6', annotation: 'Area = ½ × base × height.' },
      ],
      answer: 'It is a right triangle (3-4-5) with area 6 square units.',
    },
    {
      id: 'ch0-geo-c3',
      difficulty: 'hard',
      problem: 'Find the equation of the circle passing through the points $(0, 0)$, $(6, 0)$, and $(0, 8)$.',
      hint: 'The center lies on the perpendicular bisector of each chord. Find two perpendicular bisectors and solve the system.',
      walkthrough: [
        { expression: '\\text{Chord 1: } (0,0) \\text{ to } (6,0). \\text{ Midpoint: } (3,0). \\text{ Perp. bisector: } x = 3.', annotation: 'The chord is horizontal, so its perpendicular bisector is vertical through the midpoint.' },
        { expression: '\\text{Chord 2: } (0,0) \\text{ to } (0,8). \\text{ Midpoint: } (0,4). \\text{ Perp. bisector: } y = 4.', annotation: 'The chord is vertical, so its perpendicular bisector is horizontal.' },
        { expression: '\\text{Center: } (3, 4)', annotation: 'Intersection of x = 3 and y = 4.' },
        { expression: 'r = \\sqrt{(3-0)^2 + (4-0)^2} = \\sqrt{9 + 16} = 5', annotation: 'Distance from center to (0,0).' },
        { expression: '(x-3)^2 + (y-4)^2 = 25', annotation: 'The circle equation.' },
      ],
      answer: '$(x-3)^2 + (y-4)^2 = 25$. Center $(3,4)$, radius 5.',
    },
    {
      id: 'ch0-geo-c4',
      difficulty: 'medium',
      problem: 'Explain geometrically why $\\sin\\theta \\approx \\theta$ for small positive $\\theta$ (in radians). What property of arc length makes this work?',
      hint: 'The arc of the unit circle subtended by angle θ has length θ (since arc = rθ = 1·θ). For small θ, the arc length and the vertical chord (sin θ) are nearly equal.',
      walkthrough: [
        { expression: '\\text{On the unit circle: arc length} = r\\theta = \\theta', annotation: 'For a unit circle (r=1), arc length equals the angle in radians.' },
        { expression: '\\sin\\theta = \\text{vertical distance from axis to point}', annotation: 'This is the chord (straight-line) distance, always ≤ the arc.' },
        { expression: '\\theta \\geq \\sin\\theta \\geq \\theta\\cos\\theta \\quad \\text{for } \\theta \\in [0, \\pi/2]', annotation: 'The arc is longer than the chord; the chord is at least θ·cosθ by similar-triangle geometry.' },
        { expression: '\\text{As } \\theta \\to 0: \\cos\\theta \\to 1 \\Rightarrow \\frac{\\sin\\theta}{\\theta} \\to 1', annotation: 'Squeeze Theorem: the ratio is squeezed between cosθ and 1, both approaching 1.' },
      ],
      answer: '$\\sin\\theta \\approx \\theta$ because arc length $= \\theta$ and the chord (sin θ) becomes indistinguishable from the arc for small θ. This is the geometric engine behind $\\lim_{\\theta\\to 0}\\sin\\theta/\\theta = 1$.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'real-numbers', label: 'Real Numbers', context: 'The coordinate plane is built on pairs of real numbers.' },
    { lessonSlug: 'functions', label: 'Functions', context: 'Lines, circles, and parabolas are all examples of functions or relations on the coordinate plane.' },
    { lessonSlug: 'conic-sections', label: 'Conic Sections', context: 'Circles generalize to ellipses, parabolas, and hyperbolas — the conic sections.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
