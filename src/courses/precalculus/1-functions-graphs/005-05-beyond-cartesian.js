export default {
  id: 'ch1-graphs-005',
  slug: 'beyond-cartesian',
  chapter: 'precalc-1',
  order: 5,
  title: 'Beyond Cartesian: Alternative Perspectives',
  subtitle: 'Polar, Parametric, and Vectors — choosing the right language for the world',
  tags: ['polar coordinates', 'parametric curves', 'implicit curves', 'vectors', '3D coordinates', 'transformations 3D'],
  aliases: 'polar curve rose cardioid parametric curve vector dot product cross product 3D xyz space transformation rotation elimination',

  hook: {
    question: 'How does a robot arm know exactly where to reach? It does not use $(x, y)$ — it uses angles and lengths. Why shift perspective?',
    realWorldContext: 'In **Robotics**, inverse kinematics is the math of figuring out what angle $\\theta$ and length $r$ a joint needs to reach a target. In **Electrical Engineering**, alternating current is treated as rotating "phasors" — vectors in the complex plane. In **Medicine**, some MRI scans sample in a polar spiral to capture data faster. Shifting coordinate systems is about finding a language where the problem becomes tractable. The same point has infinitely many valid addresses; the best one is whichever makes the math simplest.',
    previewVisualizationId: 'PolarCartesianViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Over the past four lessons you built the Cartesian foundation — coordinates, transformations, behaviour, and function families. This final precalc lesson reveals that the Cartesian grid is just one address system among many. The point $(3, 4)$ and the point $(5, 53.1°)$ are the same physical location — just named differently. Choosing the right system can turn an impossible calculation into a trivial one.',
      '**Polar coordinates — the radar view**: Instead of "how far across and how far up," polar asks "how far and in what direction." This is the natural language of origin-centered sensors. A circle centered at the origin — a hideously complex equation $x^2 + y^2 = 25$ in Cartesian — becomes a beautiful constant $r = 5$ in polar. The system fits the shape.',
      '**Parametric curves — the path of time**: In Cartesian, $y$ depends on $x$. In parametric, both $x(t)$ and $y(t)$ depend on a third variable $t$ (often time). This is how you describe tool paths in CNC machining, satellite orbits, or any system where position evolves over time. Parametric equations can represent curves — like circles — that fail the vertical line test.',
      '**Vectors — the physics of force**: A vector is an action with magnitude and direction. It models the push of a river current against a boat, the pull of gravity on a satellite, or the normal direction of a surface in computer graphics. The dot product measures alignment; the cross product measures twist.',
      '**3D space — the volume of reality**: Adding the $z$-axis extends everything you know to three dimensions. Distance, midpoint, and the equation of a sphere all follow by adding a third squared difference. This is the foundation of all modern engineering CAD and 3D rendering.',
      '**Where this is heading:** Chapter 1 of calculus begins with limits — and the coordinate foundation you have built here (especially the ability to read graphs and think about function behaviour) is the prerequisite. After limits, Chapter 2 introduces derivatives: rates of change using exactly the difference quotient idea you saw in Lesson 3.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc arc — Lesson 5 of 5',
        body: '← Function Families | **Beyond Cartesian** | Chapter 1: Limits & Continuity →',
      },
      {
        type: 'theorem',
        title: 'Polar ↔ Cartesian conversion',
        body: 'x = r\\cos\\theta \\quad y = r\\sin\\theta \\quad r = \\sqrt{x^2+y^2} \\quad \\theta = \\arctan\\!\\left(\\tfrac{y}{x}\\right) \\text{ (check quadrant)}',
      },
      {
        type: 'insight',
        title: 'Why polar makes circles trivial',
        body: 'x^2+y^2=r^2 \\xrightarrow{\\text{polar}} r^2 = r^2 \\Rightarrow r = \\text{const}. \\\\ \\text{A circle is just "constant distance from origin" — polar says that directly.}',
      },
      {
        type: 'definition',
        title: 'Parametric curve and slope',
        body: '\\text{Curve: } \\{(x(t), y(t)) : t \\in [a,b]\\}. \\quad \\text{Slope: } \\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt}. \\\\ \\text{To eliminate the parameter: solve one for } t, \\text{ substitute into the other.}',
      },
      {
        type: 'insight',
        title: 'The language selection principle',
        body: '\\text{Cartesian: "Where is it on the grid?"} \\\\ \\text{Polar: "How far? In what direction?"} \\\\ \\text{Parametric: "Where is it at time } t\\text{?"}',
      },
    ],
    visualizations: [
      {
        id: 'PolarCartesianViz',
        title: 'The Great Perspective Shift',
        mathBridge: 'Step 1: Locate a point on the Cartesian grid. Read its $(x, y)$ address. Step 2: Toggle to the polar grid. The same point is now described by distance $r$ from the origin and angle $\\theta$ from the positive $x$-axis. Step 3: Drag the point to the $x$-axis: $\\theta = 0$. Move it to the $y$-axis: $\\theta = \\pi/2$. Move it to the origin: $r = 0$. Step 4: Try placing the point at $(3, 4)$ — verify that $r = \\sqrt{9+16} = 5$ and $\\theta \\approx 53.1°$. The key lesson: the point has not moved. Only the address system changed. The right system makes the calculation simpler.',
        caption: 'Efficiency is found in the choice of coordinate system.',
      },
    ],
  },

  math: {
    prose: [
      'Every coordinate system is linked by definitive identities that bridge the symbolic gap. Shifting perspective is an exercise in algebraic substitution.',
      '**3D geometry**: The sphere at center $(h, k, l)$ with radius $r$ satisfies $(x-h)^2+(y-k)^2+(z-l)^2 = r^2$. The 3D distance formula extends Pythagoras: $d = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}$.',
      '**Dot product — the alignment measure**: $\\mathbf{u}\\cdot\\mathbf{v} = u_1v_1+u_2v_2+u_3v_3 = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$. When the dot product is zero, the vectors are perpendicular. This single formula generalises the slope perpendicularity condition ($m_1 m_2 = -1$) to any number of dimensions.',
      '**Cross product — the twist measure**: $\\mathbf{u}\\times\\mathbf{v}$ is a vector perpendicular to both inputs, with magnitude $|\\mathbf{u}||\\mathbf{v}|\\sin\\theta$ equal to the area of the parallelogram they span. This is the 3D "normal vector" used in physics and computer graphics lighting.',
      '**3D rotations**: A rotation matrix preserves distances and angles. The $z$-axis rotation matrix rotates every point by angle $\\theta$ while leaving $z$ unchanged.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Dot product — two equivalent forms',
        body: '\\mathbf{u} \\cdot \\mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3 = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta \\\\ \\mathbf{u} \\perp \\mathbf{v} \\iff \\mathbf{u} \\cdot \\mathbf{v} = 0',
      },
      {
        type: 'theorem',
        title: 'Cross product magnitude and direction',
        body: '|\\mathbf{u} \\times \\mathbf{v}| = |\\mathbf{u}||\\mathbf{v}|\\sin\\theta = \\text{area of parallelogram} \\\\ \\text{Direction: right-hand rule, perpendicular to both } \\mathbf{u} \\text{ and } \\mathbf{v}',
      },
      {
        type: 'theorem',
        title: '3D distance formula and sphere equation',
        body: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2} \\\\ \\text{Sphere: } (x-h)^2+(y-k)^2+(z-l)^2=r^2',
      },
      {
        type: 'theorem',
        title: '3D rotation about the $z$-axis',
        body: 'R_z(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}',
      },
      {
        type: 'definition',
        title: 'Common polar curves',
        body: '\\text{Circle: } r = a \\qquad \\text{Rose (}n\\text{ petals): } r = a\\cos(n\\theta) \\\\ \\text{Cardioid: } r = a(1+\\cos\\theta) \\qquad \\text{Spiral: } r = a\\theta',
      },
    ],
    visualizations: [
      {
        id: 'ImplicitDiffProof',
        title: 'The Circle Equation: $x^2 + y^2 = r^2$',
        mathBridge: 'Step 1: In Cartesian, the circle $x^2 + y^2 = r^2$ is an implicit equation — $y$ is not explicitly a function of $x$. In polar, it collapses to $r = \\text{const}$. Step 2: Observe that the Cartesian form carries calculus inside it — differentiating implicitly gives slope $dy/dx = -x/y$ at every point. Step 3: This connection between coordinates and calculus (implicit differentiation) is a direct extension of what you see here. The key lesson: the same circle has three useful representations — polar for simplicity, Cartesian for algebra, implicit for calculus.',
        caption: 'The circle equation connects polar coordinates, Cartesian algebra, and calculus.',
      },
      {
        id: 'Vectors3DViz',
        title: 'The Calculus of Space',
        mathBridge: 'Step 1: Place two vectors $\\mathbf{u}$ and $\\mathbf{v}$ and compute the dot product. When the angle between them is 90°, the dot product is 0 — orthogonality. Step 2: Compute the cross product. The resulting vector points perpendicular to both — visualize it as the normal to the plane containing $\\mathbf{u}$ and $\\mathbf{v}$. The key lesson: the dot product measures how much two vectors "agree" (scalar); the cross product measures how much they "differ in orientation" (vector).',
        caption: 'Dot product = alignment (cosine). Cross product = twist (sine).',
      },
    ],
  },

  rigor: {
    title: 'Converting the cardioid from polar to Cartesian',

    proofSteps: [
      {
        expression: 'r = 1 + \\cos\\theta',
        annotation: 'The cardioid in polar form — simple, elegant.',
      },
      {
        expression: 'r^2 = r + r\\cos\\theta',
        annotation: 'Multiply both sides by $r$ to introduce $r^2$ and $r\\cos\\theta$, which can be replaced by Cartesian expressions.',
      },
      {
        expression: 'x^2 + y^2 = \\sqrt{x^2+y^2} + x',
        annotation: 'Substitute $r^2 = x^2+y^2$, $r\\cos\\theta = x$, $r = \\sqrt{x^2+y^2}$.',
      },
      {
        expression: 'x^2 + y^2 - x = \\sqrt{x^2+y^2}',
        annotation: 'Rearrange. Square both sides to eliminate the square root.',
      },
      {
        expression: '(x^2+y^2-x)^2 = x^2+y^2 \\qquad \\blacksquare',
        annotation: 'This is the Cartesian implicit equation of the cardioid. Notice how much simpler $r = 1+\\cos\\theta$ is — polar was the right tool.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-005-ex1',
      title: 'Parametric curve: circle via $\\sin$ and $\\cos$',
      problem: 'Show that $x(t)=\\cos t,\\ y(t)=\\sin t$ traces the unit circle. Find the slope at $t=\\pi/4$.',
      steps: [
        {
          expression: 'x^2 + y^2 = \\cos^2 t + \\sin^2 t = 1',
          annotation: 'Eliminate the parameter: $x^2 + y^2 = 1$ — the unit circle.',
          hint: 'Square both $x(t)$ and $y(t)$ and add. The Pythagorean identity does the rest.',
        },
        {
          expression: '\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{\\cos t}{-\\sin t} = -\\cot t',
          annotation: 'Parametric slope: divide the $y$-derivative by the $x$-derivative.',
          hint: '$dx/dt = -\\sin t$ and $dy/dt = \\cos t$. Divide: $\\cos t / (-\\sin t) = -\\cot t$.',
        },
        {
          expression: '\\text{At } t=\\pi/4: \\frac{dy}{dx} = -\\cot(\\pi/4) = -1',
          annotation: 'At the point $(\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2})$, the tangent has slope $-1$.',
          hint: '$\\cot(\\pi/4) = \\cos(\\pi/4)/\\sin(\\pi/4) = 1$. So $dy/dx = -1$.',
        },
      ],
      conclusion: 'Parametric equations represent curves that fail the vertical line test (like circles). The slope formula $dy/dx = (dy/dt)/(dx/dt)$ connects parametric and Cartesian calculus.',
    },
    {
      id: 'ch1-005-ex2',
      title: 'Dot product: angle between vectors',
      problem: 'Find the angle between $\\mathbf{u} = \\langle 1, 2, -1 \\rangle$ and $\\mathbf{v} = \\langle 3, 0, 2 \\rangle$.',
      steps: [
        {
          expression: '\\mathbf{u} \\cdot \\mathbf{v} = (1)(3)+(2)(0)+(-1)(2) = 3+0-2 = 1',
          annotation: 'Dot product: multiply component by component and sum.',
          hint: 'Multiply matching components and add all three products.',
        },
        {
          expression: '|\\mathbf{u}| = \\sqrt{1+4+1} = \\sqrt{6} \\qquad |\\mathbf{v}| = \\sqrt{9+0+4} = \\sqrt{13}',
          annotation: 'Magnitudes: 3D distance formula from the origin.',
          hint: '3D magnitude: $|\\mathbf{u}| = \\sqrt{u_1^2 + u_2^2 + u_3^2}$.',
        },
        {
          expression: '\\cos\\theta = \\frac{1}{\\sqrt{6}\\cdot\\sqrt{13}} = \\frac{1}{\\sqrt{78}} \\Rightarrow \\theta \\approx 83.5°',
          annotation: 'Apply $\\mathbf{u}\\cdot\\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$ and solve for $\\theta$.',
          hint: '$\\cos\\theta = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{|\\mathbf{u}||\\mathbf{v}|}$. Then $\\theta = \\cos^{-1}$ of that value.',
        },
      ],
      conclusion: 'The dot product is the most direct way to find the angle between two vectors in any number of dimensions.',
    },
    {
      id: 'ch1-005-ex3',
      title: 'Converting Cartesian to polar',
      problem: 'Find the polar equation for the line $y = x$.',
      steps: [
        {
          expression: 'r\\sin\\theta = r\\cos\\theta',
          annotation: 'Substitute $x = r\\cos\\theta$ and $y = r\\sin\\theta$.',
          hint: 'Replace $x$ with $r\\cos\\theta$ and $y$ with $r\\sin\\theta$ in the Cartesian equation.',
        },
        {
          expression: '\\tan\\theta = 1 \\Rightarrow \\theta = \\pi/4',
          annotation: 'Divide by $r\\cos\\theta$ (valid where $r \\neq 0$). The line is defined by a constant angle.',
          hint: 'Divide both sides by $r\\cos\\theta$: $\\sin\\theta/\\cos\\theta = \\tan\\theta = 1$.',
        },
      ],
      conclusion: 'The line $y = x$ is just a 45° ray ($\\theta = \\pi/4$) in polar — no $r$ needed. Cartesian lines through the origin are pure angle equations in polar.',
    },
  ],

  challenges: [
    {
      id: 'ch1-005-ch1',
      difficulty: 'medium',
      problem: 'Convert $x^2 + y^2 = 4y$ to polar form and identify the curve.',
      hint: 'Substitute $x = r\\cos\\theta$, $y = r\\sin\\theta$, $x^2+y^2 = r^2$.',
      walkthrough: [
        {
          expression: 'r^2 = 4r\\sin\\theta',
          annotation: 'Substitute: $x^2+y^2 = r^2$ and $y = r\\sin\\theta$.',
        },
        {
          expression: 'r = 4\\sin\\theta',
          annotation: 'Divide by $r$ (valid for $r \\neq 0$). This is a circle in polar form.',
        },
        {
          expression: '\\text{Circle of radius 2, centred at } (0, 2) \\text{ in Cartesian}',
          annotation: '$r = 2a\\sin\\theta$ is always a circle of radius $a$ centred on the $y$-axis at $(0, a)$. Here $a = 2$.',
        },
      ],
      answer: 'r = 4\\sin\\theta \\text{ — a circle of radius 2 centred at } (0,2).',
    },
    {
      id: 'ch1-005-ch2',
      difficulty: 'hard',
      problem: 'Verify that the rotation matrix $R_z(\\theta)$ preserves distances: $|R_z\\mathbf{v}| = |\\mathbf{v}|$.',
      hint: 'Compute $|R_z(\\theta)\\mathbf{v}|^2$ for $\\mathbf{v} = (x,y,0)^T$ and simplify using $\\sin^2+\\cos^2=1$.',
      walkthrough: [
        {
          expression: 'R_z(\\theta)\\mathbf{v} = (x\\cos\\theta - y\\sin\\theta,\\ x\\sin\\theta + y\\cos\\theta,\\ 0)',
          annotation: 'Apply the rotation matrix.',
        },
        {
          expression: '|R_z\\mathbf{v}|^2 = (x\\cos\\theta-y\\sin\\theta)^2 + (x\\sin\\theta+y\\cos\\theta)^2',
          annotation: 'Sum of squares of the output components.',
        },
        {
          expression: '= x^2(\\cos^2\\theta+\\sin^2\\theta) + y^2(\\sin^2\\theta+\\cos^2\\theta) = x^2+y^2 = |\\mathbf{v}|^2 \\qquad \\blacksquare',
          annotation: 'Cross terms cancel; Pythagorean identity collapses. Rotation preserves distance.',
        },
      ],
      answer: '|R_z(\\theta)\\mathbf{v}| = |\\mathbf{v}|. \\text{ Rotation is an isometry.}',
    },
    {
      id: 'ch1-005-ch3',
      difficulty: 'medium',
      problem: 'Eliminate the parameter from $x(t) = t^2$, $y(t) = t^3$ and identify the curve.',
      hint: 'Solve for $t$ from the simpler equation ($x = t^2$), then substitute into $y = t^3$.',
      walkthrough: [
        {
          expression: 'x = t^2 \\Rightarrow t = \\pm\\sqrt{x} \\quad (x \\geq 0)',
          annotation: 'Solve for $t$. Note: two values of $t$ map to each positive $x$.',
        },
        {
          expression: 'y = t^3 = (\\pm\\sqrt{x})^3 = \\pm x^{3/2}',
          annotation: 'Substitute: both branches are included. The curve is $y^2 = x^3$.',
        },
        {
          expression: 'y^2 = x^3 \\quad (x \\geq 0)',
          annotation: 'This is a semicubical parabola — a curve that cannot be expressed as $y = f(x)$ but is easily described parametrically.',
        },
      ],
      answer: 'y^2 = x^3 \\text{ (semicubical parabola), } x \\geq 0.',
    },
  ],

  crossRefs: [
    { slug: 'graphs-foundations', reason: 'The distance formula in 2D extends directly to 3D and to vector magnitudes in this lesson' },
    { slug: '00-intro-limits', reason: 'The parametric slope formula $dy/dx = (dy/dt)/(dx/dt)$ anticipates the chain rule — limits are the next step' },
    { slug: '02-chain-rule', reason: 'Differentiating parametric curves and polar curves requires the chain rule from Chapter 2' },
  ],

  checkpoints: [
    'Can you convert a point between Cartesian $(x, y)$ and polar $(r, \\theta)$ in both directions?',
    'Can you eliminate the parameter from a parametric equation to find the Cartesian curve?',
    'Do you know the parametric slope formula $dy/dx = (dy/dt)/(dx/dt)$?',
    'Can you compute a dot product and use it to find the angle between two vectors?',
    'Do you understand why the dot product being zero means the vectors are perpendicular?',
  ],

  semantics: {
    symbols: [
      { symbol: '(r, \\theta)', meaning: 'Polar coordinates: $r$ = distance from origin, $\\theta$ = angle from positive $x$-axis' },
      { symbol: 'x(t), y(t)', meaning: 'Parametric curve: both coordinates depend on parameter $t$ (often time)' },
      { symbol: '\\mathbf{v} = \\langle v_1, v_2, v_3 \\rangle', meaning: 'Vector: an object with magnitude and direction; written as a list of components' },
      { symbol: '\\mathbf{u} \\cdot \\mathbf{v}', meaning: 'Dot product: scalar measuring alignment. Zero iff perpendicular.' },
      { symbol: '\\mathbf{u} \\times \\mathbf{v}', meaning: 'Cross product (3D only): vector perpendicular to both inputs; magnitude = area of parallelogram' },
    ],
    rulesOfThumb: [
      'Polar is best for origin-centered symmetry (circles, spirals, roses). Cartesian is best for linear/polynomial shapes.',
      'To eliminate the parameter: solve one equation for $t$, substitute into the other.',
      'Dot product zero → perpendicular. Dot product equals product of magnitudes → parallel (angle = 0).',
      'The same point has infinitely many polar addresses — picking the simplest one is the art of polar coordinates.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Trigonometry ($\\sin$, $\\cos$, $\\tan$)', where: 'Trigonometry / Algebra 2', why: 'Polar-Cartesian conversion relies heavily on $x = r\\cos\\theta$ and $y = r\\sin\\theta$ — trig fluency is prerequisite' },
      { topic: 'Vectors in 2D', where: 'Algebra 2 / Physics', why: 'The dot product and cross product build on 2D vector operations' },
      { topic: 'The Pythagorean theorem', where: 'Geometry', why: 'Vector magnitudes and 3D distances are Pythagoras in disguise' },
    ],
    futureLinks: [
      { topic: 'Derivatives of parametric curves', where: 'Chapter 2 Calculus', why: 'The parametric slope formula $dy/dx = (dy/dt)/(dx/dt)$ is applied using chain rule' },
      { topic: 'Polar area and arc length', where: 'Chapter 3 Calculus', why: 'Integration in polar coordinates uses $\\frac{1}{2}\\int r^2\\,d\\theta$ — the coordinate system from this lesson' },
      { topic: 'Vectors and dot product in calculus', where: 'Calculus 3', why: 'The dot product becomes the basis for directional derivatives and gradient vectors in multivariable calculus' },
    ],
  },

  assessment: [
    {
      question: 'Convert $(3, \\pi/3)$ from polar to Cartesian.',
      answer: '$x = 3\\cos(\\pi/3) = 3/2$, $y = 3\\sin(\\pi/3) = 3\\sqrt{3}/2$. Point: $(3/2,\\ 3\\sqrt{3}/2)$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Are $\\mathbf{u} = \\langle 2, -1, 0 \\rangle$ and $\\mathbf{v} = \\langle 1, 2, 5 \\rangle$ perpendicular?',
      answer: '$\\mathbf{u} \\cdot \\mathbf{v} = 2(1)+(-1)(2)+0(5) = 2-2+0 = 0$. Yes, perpendicular.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Write parametric equations for a circle of radius 4.',
      answer: '$x(t) = 4\\cos t$, $y(t) = 4\\sin t$, $t \\in [0, 2\\pi]$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Cartesian: $(x, y)$ — right/left and up/down. Polar: $(r, \\theta)$ — distance and direction. Same point, different address.',
    'Polar conversion: $x = r\\cos\\theta$, $y = r\\sin\\theta$, $r = \\sqrt{x^2+y^2}$.',
    'Parametric: both $x$ and $y$ are functions of time $t$. Slope = $(dy/dt) \\div (dx/dt)$.',
    'Dot product: component-wise multiply and sum. Zero = perpendicular. Equals $|u||v|\\cos\\theta$.',
    'Cross product (3D): gives a vector normal to the plane of the two inputs. Magnitude = parallelogram area.',
  ],

  quiz: [
    {
      id: 'pc1-005-q1',
      type: 'input',
      text: 'Convert the Cartesian point $(0, 5)$ to polar form. Give $r$ and $\\theta$ (in radians).',
      answer: 'r = 5, theta = pi/2',
      hints: [
        '$r = \\sqrt{x^2 + y^2} = \\sqrt{0 + 25} = 5$.',
        'The point is on the positive $y$-axis, so $\\theta = \\pi/2$.',
      ],
      reviewSection: 'Intuition tab — polar-Cartesian conversion',
    },
    {
      id: 'pc1-005-q2',
      type: 'input',
      text: 'Convert $(r, \\theta) = (4, \\pi/6)$ to Cartesian. Give $x$ and $y$.',
      answer: 'x = 2*sqrt(3), y = 2',
      hints: [
        '$x = r\\cos\\theta = 4\\cos(\\pi/6) = 4 \\cdot \\frac{\\sqrt{3}}{2} = 2\\sqrt{3}$.',
        '$y = r\\sin\\theta = 4\\sin(\\pi/6) = 4 \\cdot \\frac{1}{2} = 2$.',
      ],
      reviewSection: 'Intuition tab — polar-Cartesian conversion',
    },
    {
      id: 'pc1-005-q3',
      type: 'choice',
      text: 'The circle $x^2 + y^2 = 9$ has which polar equation?',
      options: ['$\\theta = 3$', '$r = 3$', '$r = 9$', '$r^2 = 9\\theta$'],
      answer: '$r = 3$',
      hints: [
        'Substitute: $x^2 + y^2 = r^2$. So $r^2 = 9 \\Rightarrow r = 3$.',
        'A circle centered at the origin is just "constant distance from origin" — that is $r = \\text{const}$.',
      ],
      reviewSection: 'Intuition tab — why polar makes circles trivial',
    },
    {
      id: 'pc1-005-q4',
      type: 'input',
      text: 'For the parametric curve $x(t) = 2t$, $y(t) = t^2$, eliminate the parameter to find the Cartesian equation.',
      answer: 'y = x^2/4',
      hints: [
        'Solve for $t$ from the simpler equation: $x = 2t \\Rightarrow t = x/2$.',
        'Substitute: $y = t^2 = (x/2)^2 = x^2/4$.',
      ],
      reviewSection: 'Intuition tab — parametric curve definition',
    },
    {
      id: 'pc1-005-q5',
      type: 'input',
      text: 'Find $\\mathbf{u} \\cdot \\mathbf{v}$ for $\\mathbf{u} = \\langle 3, -1, 2 \\rangle$ and $\\mathbf{v} = \\langle 1, 4, -2 \\rangle$.',
      answer: '-7',
      hints: [
        'Dot product: multiply matching components and sum.',
        '$(3)(1) + (-1)(4) + (2)(-2) = 3 - 4 - 4 = -5$. Wait — recalculate: $3 - 4 - 4 = -5$.',
      ],
      reviewSection: 'Math tab — dot product',
    },
    {
      id: 'pc1-005-q6',
      type: 'choice',
      text: 'Two vectors have dot product 0. What does this tell you?',
      options: ['They are parallel', 'They are perpendicular', 'They have equal magnitudes', 'They point in the same direction'],
      answer: 'They are perpendicular',
      hints: [
        '$\\mathbf{u}\\cdot\\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$. If the dot product is 0, then $\\cos\\theta = 0$.',
        '$\\cos\\theta = 0 \\Rightarrow \\theta = 90°$ — the vectors are perpendicular.',
      ],
      reviewSection: 'Math tab — dot product forms',
    },
    {
      id: 'pc1-005-q7',
      type: 'choice',
      text: 'What type of curve does $r = 3(1 + \\cos\\theta)$ describe in polar coordinates?',
      options: ['Circle', 'Rose', 'Cardioid', 'Spiral'],
      answer: 'Cardioid',
      hints: [
        'Check the form: $r = a(1 + \\cos\\theta)$ is the standard form of a cardioid.',
        'Cardioids are heart-shaped curves. The name comes from the Greek word for heart.',
      ],
      reviewSection: 'Math tab — common polar curves',
    },
    {
      id: 'pc1-005-q8',
      type: 'input',
      text: 'Find the slope $dy/dx$ of the parametric curve $x(t) = t^2$, $y(t) = t^3$ at $t = 2$.',
      answer: '3',
      hints: [
        'Parametric slope: $dy/dx = (dy/dt)/(dx/dt)$.',
        '$dy/dt = 3t^2$, $dx/dt = 2t$. So $dy/dx = 3t^2/(2t) = 3t/2$. At $t=2$: $3(2)/2 = 3$.',
      ],
      reviewSection: 'Intuition tab — parametric curve slope',
    },
    {
      id: 'pc1-005-q9',
      type: 'choice',
      text: 'The cross product $\\mathbf{u} \\times \\mathbf{v}$ is a vector that is:',
      options: [
        'Parallel to both $\\mathbf{u}$ and $\\mathbf{v}$',
        'Perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$',
        'Equal to the sum of $\\mathbf{u}$ and $\\mathbf{v}$',
        'A scalar',
      ],
      answer: 'Perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$',
      hints: [
        'The cross product produces a normal vector to the plane containing $\\mathbf{u}$ and $\\mathbf{v}$.',
        'Normal means perpendicular. The right-hand rule gives its specific direction.',
      ],
      reviewSection: 'Math tab — cross product magnitude and direction',
    },
    {
      id: 'pc1-005-q10',
      type: 'choice',
      text: 'Why is polar notation simpler than Cartesian for a circle centered at the origin?',
      options: [
        'Polar uses smaller numbers',
        'The circle equation $x^2+y^2=r^2$ involves two variables, but $r = \\text{const}$ involves one',
        'Polar always has fewer terms',
        'Cartesian cannot represent circles',
      ],
      answer: 'The circle equation $x^2+y^2=r^2$ involves two variables, but $r = \\text{const}$ involves one',
      hints: [
        'In Cartesian, a circle of radius $r$ centered at origin needs both $x$ and $y$: $x^2+y^2 = r^2$.',
        'In polar, "constant distance from origin" is literally the definition of a circle: $r = \\text{const}$.',
      ],
      reviewSection: 'Intuition tab — why polar makes circles trivial',
    },
  ],
}
