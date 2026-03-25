export default {
  id: 'ch1-graphs-005',
  slug: 'beyond-cartesian',
  chapter: 'precalc-1',
  order: 5,
  title: 'Beyond Cartesian: Polar, Parametric, Vectors, and 3D',
  subtitle: 'New coordinate systems open new shapes — and every system connects back to the Cartesian plane',
  tags: ['polar coordinates', 'parametric curves', 'implicit curves', 'vectors', '3D coordinates', 'transformations 3D'],
  aliases: 'polar curve rose cardioid parametric curve vector dot product cross product 3D xyz space transformation rotation',

  hook: {
    question: 'A circle is messy in Cartesian coordinates: $x^2 + y^2 = r^2$. In polar, it\'s just $r = $ constant. Why do some shapes have simple equations in one coordinate system but not another?',
    realWorldContext: 'CNC machining uses parametric curves to trace tool paths — the cutter position is $(x(t), y(t))$ as $t$ runs over time. Polar coordinates are used in radar systems and antenna design. Vectors are the language of force analysis in structural engineering. Every 3D computer graphics transformation — rotation, scaling, translation — is a matrix acting on vectors. These coordinate systems are not abstract: they are the languages different engineering domains speak.',
  },

  intuition: {
    prose: [
      '**Polar coordinates** locate a point not by its $(x, y)$ offset from the origin but by its *distance* $r$ from the origin and *angle* $\\theta$ from the positive $x$-axis. Same plane, different address system. The conversion is just trig: $x = r\\cos\\theta$, $y = r\\sin\\theta$. Polar is natural for anything with rotational structure: circles, spirals, roses, cardioids.',
      '**Parametric curves** describe a path by giving $x$ and $y$ as separate functions of a third variable $t$ (often time). Instead of "what is $y$ for a given $x$?", you ask "where is the point at time $t$?" This lets you describe curves that would fail the vertical line test — like a full circle, or a figure-eight. The curve itself is the set of all points $(x(t), y(t))$ as $t$ varies.',
      '**Implicit curves** are defined by an equation $F(x, y) = 0$ rather than $y = f(x)$. A circle $x^2 + y^2 = 4$ is implicit — no explicit formula for $y$ in terms of $x$ covers the whole circle. Implicit curves can have any shape: loops, cusps, self-intersections. They connect directly to multivariable calculus via implicit differentiation.',
      '**Vectors** are the bridge to 3D. A vector is a quantity with magnitude and direction — an arrow, not a point. In 2D, $\\mathbf{v} = \\langle a, b \\rangle$ means "move $a$ in $x$ and $b$ in $y$". In 3D, add a $z$ component. Vectors add by component, scale by multiplying all components. The dot product measures how much two vectors point in the same direction; the cross product produces a vector perpendicular to both.',
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
    ],
    visualizations: [
      {
        id: 'PolarCartesianViz',
        title: 'Polar vs Cartesian — Same Point, Two Addresses',
        mathBridge: 'Drag a point in either system and see the other coordinates update. Watch how polar curves trace out as $\\theta$ sweeps from $0$ to $2\\pi$.',
        caption: 'Neither system is "right" — each makes different shapes simple.',
      },
      {
        id: 'VideoEmbed',
        title: 'Understanding Polar Coordinates',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Converting Coordinates between Polar and Rectangular Form',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Converting Equations Between Polar & Rectangular Form',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Graphing Polar Equations, Test for Symmetry & 4 Examples Corrected',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Introduction to Vectors',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Writing Vector in terms of Magnitude & Direction Example',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Vector Application Examples',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Dot Product & Angle Between Vectors',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Projection of a Vector onto another Vector',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Introduction to Parametric Equations',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Parametric Equations Eliminating Parameter T',
        props: { url: "" },
      },
    ],
  },

  math: {
    prose: [
      'The **dot product** $\\mathbf{u} \\cdot \\mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$ has a geometric meaning: $\\mathbf{u} \\cdot \\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$ where $\\theta$ is the angle between them. If the dot product is zero, the vectors are perpendicular. This generalises the perpendicular slope condition to any dimension.',
      'The **cross product** $\\mathbf{u} \\times \\mathbf{v}$ produces a new vector perpendicular to both inputs, with magnitude $|\\mathbf{u}||\\mathbf{v}|\\sin\\theta$. It only exists in 3D. The magnitude equals the area of the parallelogram formed by the two vectors — a fact used in physics for torque and in calculus for surface integrals.',
      '**3D Cartesian coordinates** add a $z$-axis perpendicular to the $xy$-plane. Every point is $(x, y, z)$. Surfaces are defined by equations in three variables: $z = f(x,y)$ (explicit) or $F(x,y,z) = 0$ (implicit). The sphere $x^2+y^2+z^2=r^2$ is the 3D analogue of a circle.',
      '**3D transformations** are linear maps — they can be represented as $3 \\times 3$ matrices acting on coordinate vectors. Rotation by angle $\\theta$ about the $z$-axis has a clean matrix form. Scaling, shearing, and reflection are all matrix operations. Composing transformations = multiplying matrices. This is the foundation of 3D computer graphics.',
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
        title: 'Vectors, Dot Product, and Cross Product',
        mathBridge: 'Adjust two vectors and see the dot product (scalar) and cross product (perpendicular vector) computed live. Watch how the angle between vectors affects both products.',
        caption: 'Dot product → parallel component. Cross product → perpendicular area vector.',
      },
    ],
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
  ],

  challenges: [
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
