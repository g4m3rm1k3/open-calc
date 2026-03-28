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
    question: 'How does a robot arm know exactly where to reach? It doesn\'t use $(x, y)$—it uses angles and lengths. Why shift your perspective?',
    realWorldContext: 'In **Robotics**, "Inverse Kinematics" is the math of figuring out what angle ($\theta$) and length ($r$) a joint needs to reach a target. In **Electrical Engineering**, we treat Alternating Current (AC) as "Phasors"—rotating vectors. In **Medicine**, some MRI scans scan in a "Polar Spiral" to capture data faster. Shifting coordinate systems is about finding a language where the problem becomes easy to solve.',
  },

  intuition: {
    prose: [
      'The Cartesian grid is perfect for square, static worlds, but it struggles with rotation and dynamic motion. To model the real world, we must choose the language that simplifies the geometry. This is the art of **Coordinate Selection.**',
      '**Polar Coordinates (The Radar POV)**: Instead of "How far across/up," we use "Distance and Angle." This is the natural language of origin-centered sensors. Formally introduced by Newton and Bernoulli, it turns the complex circle $x^2 + y^2 = 25$ into a beautiful constant $r = 5$.',
      '**Parametric Curves (The Path of Time)**: In Cartesian, $y$ depends on $x$. In Parametric, both are slaves to a third variable $t$ (time). This is how we describe **Tool Paths** in CNC machining or the flight of a bird—it’s not a static shape, but a position that evolves over time.',
      '**Vectors (The Physics of Force)**: A vector is an **Action** with magnitude and direction. It models the push of a current against a ship or the pull of gravity on a satellite. It is the fundamental atom of physical simulation.',
      '**3D Space (The Volume of Reality)**: Adding the $z$-axis ($depth$) allows us to step out of the flat page. This is the foundation of all modern engineering CAD and the three-dimensional worlds of modern cinema and gaming.',
    ],
    callouts: [
          {
        type: 'theorem',
        title: 'Polar ↔ Cartesian conversion',
        body: 'x = r\\cos\\theta \\quad y = r\\sin\\theta \\quad r = \\sqrt{x^2+y^2} \\quad \\theta = \\arctan\\!\\left(\\frac{y}{x}\\right) \\text{ (careful with quadrant)}',
      },
      {
        type: 'insight',
        title: 'Why polar makes circles trivial',
        body: 'x^2+y^2=r^2 \\xrightarrow{\\text{polar}} r^2 = r^2 \\Rightarrow r = \\text{const}. \\\\ \\text{A circle is just "constant distance from origin" — polar says that directly.}',
      },
      {
        type: 'definition',
        title: 'Parametric curve',
        body: '\\text{Curve: } \\{(x(t), y(t)) : t \\in [a,b]\\}. \\quad \\text{Slope: } \\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}. \\\\ \\text{Eliminates the parameter: solve one equation for } t, \\text{ substitute into the other.}',
      },
      {
        type: 'insight',
        title: 'Cognitive Framing: The Big Questions',
        body: '\\text{Cartesian: "Where is it on the grid?"} \\\\ \\text{Polar: "How far? In what direction?"} \\\\ \\text{Parametric: "Where is it at time } t\\text{?"}',
      },
      {
        type: 'definition',
        title: 'The Polar Identity',
        body: '\\text{A point is defined by } (r, \\theta). \\\\ r \\text{ is the radial distance from the origin (pole).} \\\\ \\theta \\text{ is the angle from the positive x-axis (polar axis).}',
      },
      {
        type: 'insight',
        title: 'The Persistence of Dimension',
        body: '\\text{Changing coordinates changes the address, but never the destination.} \\\\ \\text{The point } (3, 4) \\text{ is the same physical location as } (5, 53.1^\\circ).',
      },
    ],
    visualizations: [
      {
        id: 'PolarCartesianViz',
        title: 'The Great Perspective Shift',
        mathBridge: 'Toggle between the Square Grid and the Radar Ring. Watch how the same point has two different "Addresses." Choosing the right one is the difference between an elegant solution and an impossible calculation.',
        caption: 'Efficiency is found in the choice of coordinate system.',
      },
    ],
  },

  math: {
    prose: [
      'For the student of mathematics, shifting perspective is an exercise in algebraic translation. Every coordinate system is linked by definitive identities that bridge the symbolic gap.',
      '**3D Implicit Geometry**: A **Sphere** is the set of all points $(x, y, z)$ at distance $r$ from center $(h, k, l)$. The **3D Distance Formula**—an extension of Pythagoras—calculates the linear separation of any two points in space: $d = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}$.',
      '**Vectors: Magnitude & Orientation**: A vector $\\mathbf{v} = \\langle x, y, z \\rangle$ has a magnitude $\|\mathbf{v}\| = \\sqrt{x^2+y^2+z^2}$. A **Unit Vector** ($\mathbf{v}/\|\mathbf{v}\|$) has a magnitude of 1 and defines pure direction without scale.',
      '**The Scalar (Dot) Product**: $\\mathbf{u} \\cdot \\mathbf{v} = \\sum u_i v_i = \|\mathbf{u}\|\|\mathbf{v}\|\\cos\\theta$. If the sum equals zero, the vectors are **Orthogonal** (perpendicular). This is the gatekeeper for 3D alignment.',
      '**The Vector (Cross) Product**: Found only in 3D. It produces a vector perpendicular to both inputs, defining the "Normal" direction of a surface—essential for lighting calculations in computer graphics.',
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
        title: '3D rotation about the $z$-axis',
        body: 'R_z(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{pmatrix} \\\\ \\text{Applies rotation } \\theta \\text{ to any point } (x,y,z)^T',
      },
      {
        type: 'insight',
        title: 'Why transformations compose by matrix multiplication',
        body: '\\text{Apply } T_1 \\text{ then } T_2: \\quad T_2(T_1(\\mathbf{v})) = (T_2 T_1)\\mathbf{v} \\\\ \\text{Order matters: } T_2 T_1 \\neq T_1 T_2 \\text{ in general. Rotation then scale} \\neq \\text{scale then rotation.}',
      },
      {
        type: 'definition',
        title: 'Common polar curves and their equations',
        body: '\\text{Circle: } r = a \\qquad \\text{Rose (}n\\text{ petals): } r = a\\cos(n\\theta) \\qquad \\text{Cardioid: } r = a(1+\\cos\\theta) \\\\ \\text{Spiral: } r = a\\theta \\qquad \\text{Limaçon: } r = a + b\\cos\\theta',
      },
      {
        type: 'theorem',
        title: '3D Distance Formula',
        body: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}',
      },
      {
        type: 'theorem',
        title: 'Polar ↔ Cartesian Translation',
        body: 'x = r\\cos\\theta \\quad y = r\\sin\\theta \\\\ r^2 = x^2+y^2 \\quad \\theta = \\arctan(y/x)',
      },
      {
        type: 'definition',
        title: 'Formal Parameter Removal',
        body: 'x = f(t), y = g(t) \\implies t = f^{-1}(x) \\\\ \\therefore y = g(f^{-1}(x))',
      },
    ],
    visualizations: [
          {
        id: 'ImplicitDiffProof',
        title: 'Proof: x² + y² = r²  →  dy/dx = −x/y',
        mathBridge: 'In Cartesian coordinates a circle is $x^2 + y^2 = r^2$. In polar it collapses to $r = \\text{const}$. But the Cartesian form carries calculus inside it: differentiating implicitly gives the slope $dy/dx = -x/y$ at every point — a preview of what makes the circle equation so central to calculus.',
        caption: 'The circle equation x² + y² = r² connects geometry, polar coordinates, and calculus. See the full proof.',
      },
      {
        id: 'Vectors3DViz',
        title: 'The Calculus of Space',
        mathBridge: 'The Dot Product measures "Alignment" (scaling by cosine), while the Cross Product measures "Twist" (scaling by sine). These two geometric tools allow us to solve every force interaction in 3D.',
        caption: 'Vectors are the atoms of physical measurement.',
      },
    ],
  },

  rigor: {
    title: 'Formal Coordinate Construction',
    prose: [
      'Mathematical perspectives are defined by the formulas that bridge them. We prove two vital vector operations.'
    ],
    proofSteps: [
      {
        section: 'Formal Parameter Elimination',
        expression: 'x(t) = t - 3, y(t) = t^2 + 1 \\implies t = x + 3',
        annotation: 'Rule: Solve for the parameter and substitute.'
      },
      {
        expression: 'y = (x + 3)^2 + 1',
        annotation: 'The parametric path is simply a parabola $y = x^2 + 6x + 10$.'
      },
      {
        section: 'Vector Angles (The Dot Product)',
        expression: '\\mathbf{u} \\cdot \\mathbf{v} = \|\mathbf{u}\|\|\mathbf{v}\|\\cos\\theta',
        annotation: 'Rule: The Dot Product is the bridge between magnitudes and orientation.'
      },
      {
        expression: '\\theta = \\cos^{-1}\\left( \\frac{u_1 v_1 + u_2 v_2}{\|\mathbf{u}\|\|\mathbf{v}\|} \\right)',
        annotation: 'Solve for $\\theta$ to find the angle between two forces or light rays.'
      }
    ]
  },
    rigor: {
    title: 'Converting a polar curve to Cartesian: the cardioid',

    proofSteps: [
      {
        expression: 'r = 1 + \\cos\\theta',
        annotation: 'The cardioid in polar form. We want to understand its Cartesian equation.',
      },
      {
        expression: 'r^2 = r + r\\cos\\theta',
        annotation: 'Multiply both sides by $r$.',
      },
      {
        expression: 'x^2 + y^2 = \\sqrt{x^2+y^2} + x',
        annotation: 'Substitute $r^2 = x^2+y^2$, $r\\cos\\theta = x$, and $r = \\sqrt{x^2+y^2}$.',
      },
      {
        expression: 'x^2 + y^2 - x = \\sqrt{x^2+y^2}',
        annotation: 'Rearrange. Square both sides to eliminate the square root.',
      },
      {
        expression: '(x^2+y^2-x)^2 = x^2+y^2',
        annotation: 'This is the Cartesian implicit equation of the cardioid. Notice how much simpler $r = 1+\\cos\\theta$ is. Polar was the right tool.',
      },
    ],
  },

  examples: [
      {
      id: 'ch1-005-ex1',
      title: 'Parametric curve: circle via $\\sin$ and $\\cos$',
      problem: '\\text{Show that } x(t)=\\cos t,\\ y(t)=\\sin t \\text{ traces a unit circle. Find the slope at } t=\\pi/4.',
      steps: [
        {
          expression: 'x^2 + y^2 = \\cos^2 t + \\sin^2 t = 1',
          annotation: 'Eliminate the parameter: $x^2 + y^2 = 1$ — the unit circle. Parametric curves trace shapes that may fail the vertical line test.',
        },
        {
          expression: '\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{\\cos t}{-\\sin t} = -\\cot t',
          annotation: 'Parametric slope formula: divide the $y$-derivative by the $x$-derivative.',
        },
        {
          expression: '\\text{At } t=\\pi/4: \\frac{dy}{dx} = -\\cot(\\pi/4) = -1',
          annotation: 'At the point $(\\cos\\frac{\\pi}{4}, \\sin\\frac{\\pi}{4}) = (\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2})$, the tangent has slope $-1$.',
        },
      ],
      conclusion: 'Parametric equations can represent curves like circles that have no single-function description. The slope formula $dy/dx = (dy/dt)/(dx/dt)$ connects parametric and Cartesian calculus.',
    },
    {
      id: 'ch1-005-ex2',
      title: 'Dot product: angle between vectors',
      problem: '\\text{Find the angle between } \\mathbf{u} = \\langle 1, 2, -1 \\rangle \\text{ and } \\mathbf{v} = \\langle 3, 0, 2 \\rangle.',
      steps: [
        {
          expression: '\\mathbf{u} \\cdot \\mathbf{v} = (1)(3)+(2)(0)+(-1)(2) = 3+0-2 = 1',
          annotation: 'Dot product: multiply component by component and sum.',
        },
        {
          expression: '|\\mathbf{u}| = \\sqrt{1+4+1} = \\sqrt{6} \\qquad |\\mathbf{v}| = \\sqrt{9+0+4} = \\sqrt{13}',
          annotation: 'Magnitudes from the distance formula in 3D.',
        },
        {
          expression: '\\cos\\theta = \\frac{1}{\\sqrt{6}\\cdot\\sqrt{13}} = \\frac{1}{\\sqrt{78}} \\Rightarrow \\theta \\approx 83.5°',
          annotation: 'Apply $\\mathbf{u}\\cdot\\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$ and solve for $\\theta$.',
        },
      ],
      conclusion: 'The dot product is the most direct way to find the angle between two vectors in any dimension — it generalises the Cartesian perpendicularity condition.',
    },
    {
      id: 'ex-polar-conv',
      title: 'Algebra: Cartesian to Polar',
      problem: '\\text{Find the polar equation for the line } y = x.',
      steps: [
        {
          expression: 'r\\sin\\theta = r\\cos\\theta',
          annotation: 'Substitute the polar identities for $x$ and $y$.'
        },
        {
          expression: '\\frac{\\sin\\theta}{\\cos\\theta} = 1 \\implies \\tan\\theta = 1',
          annotation: 'Divide by $r\\cos\\theta$.'
        },
        {
          expression: '\\theta = \\pi/4',
          annotation: 'Solve for $\\theta$. The line is defined by a constant angle.'
        }
      ],
      conclusion: 'The line y=x is just a 45-degree angle ($\pi/4$) in polar.'
    },
    {
      id: 'ex-robot-kin',
      title: 'Applied: Robot Join Angle',
      problem: '\\text{A robot joint is at } (5, 5). \\\\ \\text{What angle } \\theta \\text{ must the motor be at?}',
      steps: [
        {
          expression: '\\theta = \\tan^{-1}(5/5) = \\tan^{-1}(1)',
          annotation: 'The angle is the inverse tangent of the $(y/x)$ ratio.'
        }
      ],
      conclusion: 'The motor must turn to 45° ($\pi/4$).'
    }
  ],

  challenges: [
    {
      id: 'ch-05-01',
      difficulty: 'medium',
      problem: '\\text{State the parametric equations for a circle of radius 3.}',
      answer: 'x(t) = 3\\cos t, \\quad y(t) = 3\\sin t'
    },
    {
      id: 'ch-05-02',
      difficulty: 'hard',
      problem: '\\text{Why is } \\mathbf{u} \\cdot \\mathbf{v} = 0 \\text{ the test for perpendicularity?}',
      answer: '\\text{Because } \\mathbf{u} \\cdot \\mathbf{v} = |u||v|\\cos\\theta. \\\\ \\text{If } \\theta = 90^\\circ, \\cos\\theta = 0, \\text{ so the entire product must be zero.}'
    },
        {
      id: 'ch1-005-ch1',
      difficulty: 'medium',
      problem: '\\text{Convert } x^2 + y^2 = 4y \\text{ to polar form and identify the curve.}',
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
          expression: '\\text{Circle with diameter 4, centred at } (0, 2) \\text{ in Cartesian}',
          annotation: '$r = 2a\\sin\\theta$ is always a circle of radius $a$ centred on the $y$-axis at $(0,a)$. Here $a=2$.',
        },
      ],
      answer: 'r = 4\\sin\\theta \\text{ — a circle of radius 2 centred at } (0,2).',
    },
    {
      id: 'ch1-005-ch2',
      difficulty: 'hard',
      problem: '\\text{Verify that the rotation matrix } R_z(\\theta) \\text{ preserves distances: } |R_z\\mathbf{v}| = |\\mathbf{v}|.',
      hint: 'Compute $|R_z(\\theta)\\mathbf{v}|^2$ for $\\mathbf{v} = (x,y,0)^T$ and simplify using $\\sin^2+\\cos^2=1$.',
      walkthrough: [
        {
          expression: 'R_z(\\theta)\\mathbf{v} = (x\\cos\\theta - y\\sin\\theta,\\ x\\sin\\theta + y\\cos\\theta,\\ 0)',
          annotation: 'Apply the rotation matrix to $(x, y, 0)^T$.',
        },
        {
          expression: '|R_z\\mathbf{v}|^2 = (x\\cos\\theta-y\\sin\\theta)^2 + (x\\sin\\theta+y\\cos\\theta)^2',
          annotation: 'Sum of squares of components.',
        },
        {
          expression: '= x^2\\cos^2\\theta - 2xy\\cos\\theta\\sin\\theta + y^2\\sin^2\\theta + x^2\\sin^2\\theta + 2xy\\sin\\theta\\cos\\theta + y^2\\cos^2\\theta',
          annotation: 'Expand both squares.',
        },
        {
          expression: '= x^2(\\cos^2\\theta+\\sin^2\\theta) + y^2(\\sin^2\\theta+\\cos^2\\theta) = x^2+y^2 = |\\mathbf{v}|^2 \\qquad \\blacksquare',
          annotation: 'Cross terms cancel. Pythagorean identity collapses the rest. Rotation preserves distance.',
        },
      ],
      answer: '|R_z(\\theta)\\mathbf{v}| = |\\mathbf{v}|. \\text{ Rotation is an isometry.}',
    },
  ],
}
