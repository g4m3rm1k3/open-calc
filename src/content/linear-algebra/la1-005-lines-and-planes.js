export default {
  id: 'la1-005',
  slug: 'lines-and-planes',
  chapter: 'la1',
  order: 5,
  title: 'Lines and Planes in 3D',
  subtitle: 'Parametric, symmetric, and normal-vector forms — the geometric language of linear constraints.',
  tags: ['lines', 'planes', 'parametric equations', 'normal vector', 'dot product geometry', 'distance', 'intersection'],
  aliases: 'parametric line equation plane equation normal vector point-normal form vector equation line plane intersection distance',

  hook: {
    question: "You're designing a robot arm. The end-effector must travel in a straight line in 3D space. How do you describe that line mathematically — and how do you tell if two robot paths will collide?",
    realWorldContext: "Every 3D graphics engine, robotics planner, and physics simulator must answer questions about lines and planes thousands of times per second. Collision detection is a line-plane intersection test. Flight simulators check whether a wing intersects the ground plane. Ray tracing (the rendering algorithm inside Pixar films) fires rays — lines — and finds intersections with planes to determine what a camera sees. The math is all here.",
    previewVisualizationId: 'LinesAndPlanesViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You know what vectors are and how to take dot and cross products. Now we use those tools to describe geometric objects — lines and planes — in a way that extends naturally to any dimension.',
      'Think of a line in 3D. You need two pieces of information: a **point** you start from, and a **direction** to travel. If you start at point $P_0$ and walk in direction $\\mathbf{d}$, after time $t$ you are at $P_0 + t\\mathbf{d}$. That simple idea is the parametric equation of a line.',
      'A plane needs a different description. Instead of a direction to travel ALONG the plane, it is easier to give a direction PERPENDICULAR to the plane — the **normal vector** $\\mathbf{n}$. Every point $\\mathbf{x}$ on the plane satisfies $\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0$: the vector from $P_0$ to $\\mathbf{x}$ is perpendicular to $\\mathbf{n}$.',
      '**Why does the cross product appear here?** If you know two vectors lying IN a plane (say the edges of a triangle), their cross product is perpendicular to both — it IS the normal vector. So the cross product is the machine for finding plane equations from geometric data.',
      'Lines and planes are the 1D and 2D linear subspaces (shifted by a point) of 3D space. Every linear algebra concept — span, basis, orthogonality — has a concrete geometric home in lines and planes.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of LA1 — Vectors & Spaces',
        body: '**Previous:** Systems of Linear Equations — the algebraic side of constraints.\n**This lesson:** Lines and Planes — the geometric side of the same constraints.\n**Next:** Gauss-Jordan RREF Drill — mastering the full row-reduction algorithm.',
      },
      {
        type: 'insight',
        title: 'Two Ways to Describe a Line',
        body: '**Parametric:** $\\mathbf{r}(t) = P_0 + t\\mathbf{d}$\nTravel from $P_0$ in direction $\\mathbf{d}$.\n\n**Symmetric (when $d_i \\neq 0$):** $\\dfrac{x-x_0}{d_x} = \\dfrac{y-y_0}{d_y} = \\dfrac{z-z_0}{d_z}$\nEliminate $t$ to get the ratio form.',
      },
      {
        type: 'insight',
        title: 'Two Ways to Describe a Plane',
        body: '**Normal form:** $\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0$\nEvery point $\\mathbf{x}$ on the plane satisfies this.\n\n**Scalar form:** $ax + by + cz = d$\nwhere $\\mathbf{n} = [a, b, c]$ and $d = \\mathbf{n} \\cdot P_0$.',
      },
      {
        type: 'warning',
        title: 'A Line in 3D ≠ A Single Equation',
        body: 'In 2D, a line = one equation ($ax + by = c$). In 3D, a line = the INTERSECTION of two planes = TWO equations. One equation in 3D defines a **plane**, not a line. This trips up many students.',
      },
    ],
    visualizations: [
      {
        id: 'LinesAndPlanesViz',
        title: 'Interactive Lines and Planes in 3D',
        mathBridge: 'Drag the direction vector to change the line. Drag the normal vector to tilt the plane. Watch how the parametric equation and the scalar equation update live. Check the "intersection" box to find where the line pierces the plane.',
        caption: 'Lines and planes as geometric objects driven by vectors.',
      },
    ],
  },

  math: {
    prose: [
      '**Parametric equation of a line.** Given a point $P_0 = (x_0, y_0, z_0)$ and a nonzero direction vector $\\mathbf{d} = [d_x, d_y, d_z]$, the line through $P_0$ in direction $\\mathbf{d}$ is:\n$$\\mathbf{r}(t) = P_0 + t\\mathbf{d} = (x_0 + td_x,\\ y_0 + td_y,\\ z_0 + td_z), \\quad t \\in \\mathbb{R}$$\nThe scalar $t$ is the parameter — it tells you how far along the line you are.',
      '**Symmetric equations.** If none of $d_x, d_y, d_z$ is zero, solve each parametric equation for $t$ and set them equal:\n$$\\frac{x - x_0}{d_x} = \\frac{y - y_0}{d_y} = \\frac{z - z_0}{d_z}$$\nIf one component is zero (say $d_z = 0$), then $z = z_0$ is one of the equations and the symmetric form uses just the other two ratios.',
      '**Equation of a plane.** A plane is determined by a point $P_0$ and a normal vector $\\mathbf{n} = [a, b, c]$ perpendicular to every vector in the plane. The condition for a point $\\mathbf{x} = (x, y, z)$ to lie on the plane is:\n$$\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0 \\quad \\Longleftrightarrow \\quad a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$$\nExpanding and collecting: $ax + by + cz = d$ where $d = ax_0 + by_0 + cz_0$.',
      '**Distance from a point to a plane.** The distance from point $Q$ to the plane $ax + by + cz = d$ is:\n$$\\text{dist} = \\frac{|a q_x + b q_y + c q_z - d|}{\\sqrt{a^2 + b^2 + c^2}} = \\frac{|\\mathbf{n} \\cdot Q - d|}{\\|\\mathbf{n}\\|}$$\nThis is projection: you project $Q - P_0$ onto the unit normal.',
      '**Line-plane intersection.** To find where a line $P_0 + t\\mathbf{d}$ meets a plane $\\mathbf{n} \\cdot \\mathbf{x} = d$, substitute:\n$$\\mathbf{n} \\cdot (P_0 + t\\mathbf{d}) = d \\quad \\Rightarrow \\quad t = \\frac{d - \\mathbf{n} \\cdot P_0}{\\mathbf{n} \\cdot \\mathbf{d}}$$\nIf $\\mathbf{n} \\cdot \\mathbf{d} = 0$, the line is parallel to the plane (no intersection or the line lies in the plane).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Point-Normal Form of a Plane',
        body: '\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0\n\nor equivalently: $ax + by + cz = d$\n\n$\\mathbf{n} = [a,b,c]$ is perpendicular to every vector lying in the plane.',
      },
      {
        type: 'definition',
        title: 'Normal Vector',
        body: 'A vector $\\mathbf{n}$ is **normal** to a plane if it is perpendicular to every vector that lies in the plane.\n\nGiven two non-parallel vectors $\\mathbf{u}, \\mathbf{v}$ in the plane, $\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v}$.',
      },
      {
        type: 'insight',
        title: 'Cross Product Gives the Normal Immediately',
        body: 'If you know two edges of a triangle (vectors $\\mathbf{u}$ and $\\mathbf{v}$), then $\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v}$ is immediately perpendicular to both — it IS the normal to the plane containing the triangle. No algebra required.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'A **line** in $\\mathbb{R}^n$ is the set $\\{P_0 + t\\mathbf{d} : t \\in \\mathbb{R}\\}$ for a fixed point $P_0$ and nonzero direction $\\mathbf{d}$. This is a 1-dimensional affine subspace — a shifted span of a single vector.',
      'A **plane** in $\\mathbb{R}^n$ is the set $\\{P_0 + s\\mathbf{u} + t\\mathbf{v} : s, t \\in \\mathbb{R}\\}$ for linearly independent $\\mathbf{u}, \\mathbf{v}$. This is a 2-dimensional affine subspace — a shifted span of two vectors.',
      'The equation $\\mathbf{n} \\cdot \\mathbf{x} = d$ defines a hyperplane: a subspace of dimension $n - 1$ in $\\mathbb{R}^n$. In $\\mathbb{R}^3$ that is a plane (dimension 2). In $\\mathbb{R}^2$ that is a line (dimension 1). The normal vector $\\mathbf{n}$ spans the orthogonal complement of the hyperplane.',
      'Two planes in $\\mathbb{R}^3$ intersect in a line (if not parallel), no points (if parallel but distinct), or the whole plane (if identical). The intersection of THREE planes is exactly a system of three linear equations — the content of Lesson LA1-004.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Affine Subspace',
        body: 'A **line** = 1-dimensional affine subspace = $P_0 + \\text{span}\\{\\mathbf{d}\\}$\nA **plane** = 2-dimensional affine subspace = $P_0 + \\text{span}\\{\\mathbf{u}, \\mathbf{v}\\}$\n\n"Affine" = subspace shifted away from the origin by $P_0$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la1-005-ex1',
      title: 'Parametric and Symmetric Equations of a Line',
      problem: 'Find the parametric and symmetric equations of the line through $P_0 = (1, 2, -1)$ with direction $\\mathbf{d} = [3, -1, 2]$.',
      steps: [
        {
          expression: '\\mathbf{r}(t) = (1, 2, -1) + t[3, -1, 2]',
          annotation: 'Plug point and direction into the parametric form $\\mathbf{r}(t) = P_0 + t\\mathbf{d}$.',
          strategyTitle: 'Write parametric form',
          checkpoint: 'What point does t=0 give? What about t=1?',
          hints: ['t=0 gives P₀=(1,2,-1). t=1 gives (1+3, 2-1, -1+2) = (4,1,1).'],
        },
        {
          expression: 'x = 1 + 3t, \\quad y = 2 - t, \\quad z = -1 + 2t',
          annotation: 'Write out the three component equations.',
          strategyTitle: 'Component form',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'x = 1 + 3t \\Rightarrow t = \\frac{x-1}{3}, \\quad y = 2-t \\Rightarrow t = \\frac{y-2}{-1}, \\quad z = -1+2t \\Rightarrow t = \\frac{z+1}{2}',
          annotation: 'Solve each for $t$.',
          strategyTitle: 'Solve each for t',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\frac{x-1}{3} = \\frac{y-2}{-1} = \\frac{z+1}{2}',
          annotation: 'Set all three equal to get the symmetric equations.',
          strategyTitle: 'Set equal — symmetric form',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'Parametric: $(1+3t,\\ 2-t,\\ -1+2t)$. Symmetric: $\\frac{x-1}{3} = \\frac{y-2}{-1} = \\frac{z+1}{2}$. Both describe the same infinite line.',
    },
    {
      id: 'la1-005-ex2',
      title: 'Equation of a Plane from Three Points',
      problem: 'Find the equation of the plane through $A = (1,0,0)$, $B = (0,1,0)$, $C = (0,0,2)$.',
      steps: [
        {
          expression: '\\mathbf{u} = B - A = [-1, 1, 0], \\quad \\mathbf{v} = C - A = [-1, 0, 2]',
          annotation: 'Form two vectors lying in the plane.',
          strategyTitle: 'Two vectors in the plane',
          checkpoint: 'Why are these vectors guaranteed to lie in the plane?',
          hints: ['They connect points that are all on the plane, so the vectors are displacements within the plane.'],
        },
        {
          expression: '\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\-1&1&0\\\\-1&0&2\\end{vmatrix}',
          annotation: 'Compute the cross product to find the normal vector.',
          strategyTitle: 'Cross product for normal',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{n} = \\mathbf{i}(1\\cdot2 - 0\\cdot0) - \\mathbf{j}((-1)\\cdot2 - 0\\cdot(-1)) + \\mathbf{k}((-1)\\cdot0 - 1\\cdot(-1)) = [2, 2, 1]',
          annotation: 'Expand the determinant: $\\mathbf{n} = [2, 2, 1]$.',
          strategyTitle: 'Evaluate cross product',
          checkpoint: 'Verify n·u = 0 and n·v = 0.',
          hints: ['[2,2,1]·[-1,1,0] = -2+2+0 = 0 ✓   [2,2,1]·[-1,0,2] = -2+0+2 = 0 ✓'],
        },
        {
          expression: '\\mathbf{n} \\cdot (\\mathbf{x} - A) = 0 \\quad \\Rightarrow \\quad 2(x-1) + 2(y-0) + 1(z-0) = 0',
          annotation: 'Use point $A = (1,0,0)$ in the point-normal form.',
          strategyTitle: 'Point-normal form',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '2x + 2y + z = 2',
          annotation: 'Expand and simplify to the scalar equation.',
          strategyTitle: 'Scalar equation',
          checkpoint: 'Verify: does A=(1,0,0) satisfy it? B=(0,1,0)? C=(0,0,2)?',
          hints: ['2(1)+2(0)+0=2 ✓   2(0)+2(1)+0=2 ✓   2(0)+2(0)+2=2 ✓'],
        },
      ],
      conclusion: 'The plane through $A$, $B$, $C$ has equation $2x + 2y + z = 2$. Normal vector $[2,2,1]$ is perpendicular to every vector lying in the plane.',
    },
    {
      id: 'la1-005-ex3',
      title: 'Line-Plane Intersection',
      problem: 'Find where the line $\\mathbf{r}(t) = (2, 0, 1) + t[1, -1, 3]$ intersects the plane $x + 2y - z = 4$.',
      steps: [
        {
          expression: '\\mathbf{n} = [1, 2, -1], \\quad d = 4, \\quad P_0 = (2,0,1), \\quad \\mathbf{d} = [1,-1,3]',
          annotation: 'Identify the normal vector of the plane and the line parameters.',
          strategyTitle: 'Identify components',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 't = \\frac{d - \\mathbf{n} \\cdot P_0}{\\mathbf{n} \\cdot \\mathbf{d}} = \\frac{4 - (1\\cdot2 + 2\\cdot0 + (-1)\\cdot1)}{1\\cdot1 + 2\\cdot(-1) + (-1)\\cdot3}',
          annotation: 'Apply the intersection formula.',
          strategyTitle: 'Apply intersection formula',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 't = \\frac{4 - (2 + 0 - 1)}{1 - 2 - 3} = \\frac{4 - 1}{-4} = \\frac{3}{-4} = -\\frac{3}{4}',
          annotation: 'Compute numerator and denominator separately, then divide.',
          strategyTitle: 'Evaluate t',
          checkpoint: 'What if the denominator were 0? What would that mean geometrically?',
          hints: ['Denominator 0 means n·d = 0: the line direction is perpendicular to the normal, so the line runs parallel to the plane.'],
        },
        {
          expression: '\\mathbf{r}\\!\\left(-\\tfrac{3}{4}\\right) = \\left(2 - \\tfrac{3}{4},\\ 0 + \\tfrac{3}{4},\\ 1 - \\tfrac{9}{4}\\right) = \\left(\\tfrac{5}{4},\\ \\tfrac{3}{4},\\ -\\tfrac{5}{4}\\right)',
          annotation: 'Substitute $t = -3/4$ back into the line equation.',
          strategyTitle: 'Find the intersection point',
          checkpoint: 'Verify this point lies on the plane.',
          hints: ['5/4 + 2(3/4) - (-5/4) = 5/4 + 6/4 + 5/4 = 16/4 = 4 ✓'],
        },
      ],
      conclusion: 'The line hits the plane at $\\left(\\frac{5}{4}, \\frac{3}{4}, -\\frac{5}{4}\\right)$.',
    },
    {
      id: 'la1-005-ex4',
      title: 'Distance from a Point to a Plane',
      problem: 'Find the distance from $Q = (1, 2, 3)$ to the plane $2x - y + 2z = 6$.',
      steps: [
        {
          expression: 'a=2, b=-1, c=2, d=6, \\quad \\|\\mathbf{n}\\| = \\sqrt{4+1+4} = 3',
          annotation: 'Extract the normal vector $\\mathbf{n} = [2,-1,2]$ and compute its magnitude.',
          strategyTitle: 'Identify normal, compute magnitude',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{dist} = \\frac{|2(1) + (-1)(2) + 2(3) - 6|}{3} = \\frac{|2 - 2 + 6 - 6|}{3} = \\frac{|0|}{3} = 0',
          annotation: 'Apply the distance formula. The numerator is zero!',
          strategyTitle: 'Apply distance formula',
          checkpoint: 'What does distance = 0 mean?',
          hints: ['It means Q lies exactly ON the plane. Verify: 2(1) - 2 + 2(3) = 2-2+6 = 6 ✓'],
        },
      ],
      conclusion: 'Distance = 0, meaning $Q = (1, 2, 3)$ lies on the plane $2x - y + 2z = 6$. The distance formula gives 0 whenever the query point satisfies the plane equation.',
    },
  ],

  challenges: [
    {
      id: 'la1-005-ch1',
      difficulty: 'easy',
      problem: 'Write parametric equations for the line through $P = (0, 1, -2)$ and $Q = (3, -1, 4)$.',
      hint: 'The direction vector is $Q - P$.',
      walkthrough: [
        {
          expression: '\\mathbf{d} = Q - P = [3-0,\\ -1-1,\\ 4-(-2)] = [3, -2, 6]',
          annotation: 'The direction vector is the displacement from P to Q.',
        },
        {
          expression: '\\mathbf{r}(t) = (0 + 3t,\\ 1 - 2t,\\ -2 + 6t)',
          annotation: 'Parametric form using P as the base point.',
        },
      ],
      answer: 'r(t) = (3t, 1-2t, -2+6t)',
    },
    {
      id: 'la1-005-ch2',
      difficulty: 'medium',
      problem: 'Find the plane containing the three points $P=(2,1,0)$, $Q=(1,3,-1)$, $R=(0,0,4)$. Give the equation in the form $ax+by+cz=d$.',
      hint: 'Find two vectors in the plane, take their cross product for the normal, then use point-normal form.',
      walkthrough: [
        {
          expression: '\\mathbf{u} = Q-P = [-1,2,-1], \\quad \\mathbf{v} = R-P = [-2,-1,4]',
          annotation: 'Two vectors lying in the plane.',
        },
        {
          expression: '\\mathbf{n} = \\mathbf{u}\\times\\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\-1&2&-1\\\\-2&-1&4\\end{vmatrix} = [8-1, -(-4-2), 1+4] = [7, 6, 5]',
          annotation: 'Cross product gives the normal. Check: expand each 2×2 minor.',
        },
        {
          expression: '7(x-2)+6(y-1)+5(z-0)=0 \\quad \\Rightarrow \\quad 7x+6y+5z = 20',
          annotation: 'Point-normal form using P=(2,1,0), then expand.',
        },
      ],
      answer: '7x + 6y + 5z = 20',
    },
    {
      id: 'la1-005-ch3',
      difficulty: 'hard',
      problem: 'Find the distance between the two parallel planes $x + 2y - 2z = 4$ and $x + 2y - 2z = 13$.',
      hint: 'Pick any point on one plane and measure its distance to the other plane.',
      walkthrough: [
        {
          expression: 'P_1: x+2y-2z=4. \\quad \\text{Pick }Q=(4,0,0)\\text{ on }P_1.',
          annotation: 'Set y=z=0 in the first plane equation to get a convenient point.',
        },
        {
          expression: '\\|\\mathbf{n}\\| = \\sqrt{1+4+4} = 3',
          annotation: 'Magnitude of the normal vector [1,2,-2].',
        },
        {
          expression: '\\text{dist} = \\frac{|1(4)+2(0)-2(0)-13|}{3} = \\frac{|4-13|}{3} = \\frac{9}{3} = 3',
          annotation: 'Distance from Q to the second plane P₂: x+2y-2z=13.',
        },
      ],
      answer: 'Distance = 3',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{r}(t) = P_0 + t\\mathbf{d}', meaning: 'Parametric equation of a line through P₀ in direction d' },
      { symbol: 'ax + by + cz = d', meaning: 'Scalar equation of a plane with normal vector [a,b,c]' },
      { symbol: '\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0', meaning: 'Point-normal form: all points x on the plane are perpendicular to n from P₀' },
      { symbol: '\\text{dist} = \\frac{|\\mathbf{n}\\cdot Q - d|}{\\|\\mathbf{n}\\|}', meaning: 'Distance from point Q to the plane with normal n and offset d' },
    ],
    rulesOfThumb: [
      'Line in 3D needs a point + direction vector (parametric form).',
      'Plane in 3D needs a point + normal vector (point-normal form).',
      'Cross product of two in-plane vectors = the normal vector.',
      'One equation in 3D = a plane. A line in 3D needs TWO equations.',
      'If denominator n·d = 0 in the intersection formula, the line is parallel to the plane.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-003', label: 'Dot and Cross Products', note: 'The dot product underpins the plane equation (n·x = d). The cross product produces the normal from two edge vectors.' },
    ],
    futureLinks: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'The parametric form of a line (P₀ + t·d) becomes a matrix equation when you express the constraint as Ax=b — connecting geometry back to linear systems.' },
      { lessonId: 'la4-001', label: 'Orthogonal Projections', note: 'The distance formula is a projection: you project the point onto the normal direction. The full machinery of projections generalizes this to any subspace.' },
    ],
  },

  mentalModel: [
    'Line = point + direction × parameter. One degree of freedom.',
    'Plane = point + normal vector. Perpendicularity condition.',
    'Normal vector = cross product of two in-plane edges.',
    'Line-plane intersection: substitute parametric into plane, solve for t.',
    'Distance to plane = projection of (Q - P₀) onto unit normal.',
  ],

  checkpoints: [
    'read-intuition', 'read-math', 'read-rigor',
    'completed-example-1', 'completed-example-2', 'completed-example-3', 'completed-example-4',
    'attempted-challenge-easy', 'attempted-challenge-medium', 'attempted-challenge-hard',
  ],

  assessment: {
    questions: [
      {
        id: 'la1-005-assess-1',
        type: 'input',
        text: 'What is the normal vector to the plane $3x - y + 4z = 7$?',
        answer: '[3, -1, 4]',
        hint: 'The coefficients of x, y, z in the scalar plane equation ARE the normal vector.',
      },
    ],
  },

  quiz: [
    {
      id: 'la1-005-q1',
      type: 'choice',
      text: 'In 3D, the equation $2x - y + 3z = 5$ defines which geometric object?',
      options: ['A line', 'A plane', 'A point', 'A sphere'],
      answer: 'A plane',
      hints: ['One linear equation in 3 variables always defines a plane (a 2D surface). You need TWO equations to define a line in 3D.'],
      reviewSection: 'Intuition — warning callout',
    },
    {
      id: 'la1-005-q2',
      type: 'choice',
      text: 'You have two vectors $\\mathbf{u}$ and $\\mathbf{v}$ lying in a plane. Which operation gives the normal vector?',
      options: ['u + v', 'u · v', 'u × v', '|u| − |v|'],
      answer: 'u × v',
      hints: ['The cross product produces a vector perpendicular to BOTH inputs — that perpendicularity is exactly the definition of normal to the plane.'],
      reviewSection: 'Intuition — cross product insight',
    },
    {
      id: 'la1-005-q3',
      type: 'choice',
      text: 'The line $\\mathbf{r}(t) = (1,0,2) + t[3,-1,1]$ is tested for intersection with the plane $\\mathbf{n}\\cdot\\mathbf{x}=d$ where $\\mathbf{n}=[3,-1,1]$. Since $\\mathbf{n}\\cdot\\mathbf{d} = 9+1+1 = 11 \\neq 0$, the line:',
      options: ['Is parallel to the plane', 'Lies inside the plane', 'Intersects the plane at exactly one point', 'Is perpendicular to the normal'],
      answer: 'Intersects the plane at exactly one point',
      hints: ['n·d ≠ 0 means the denominator in the formula t = (d - n·P₀)/(n·d) is defined, so there is exactly one intersection.'],
      reviewSection: 'Math — line-plane intersection',
    },
    {
      id: 'la1-005-q4',
      type: 'choice',
      text: 'What is the distance from the origin $(0,0,0)$ to the plane $x + y + z = 3$?',
      options: ['1', '√3', '3', '3/√3 = √3'],
      answer: '√3',
      hints: ['dist = |1(0)+1(0)+1(0)-3| / √(1+1+1) = 3/√3 = √3.'],
      reviewSection: 'Math — distance formula',
    },
    {
      id: 'la1-005-q5',
      type: 'choice',
      text: 'Two planes $ax+by+cz=d_1$ and $ax+by+cz=d_2$ (with $d_1 \\neq d_2$) are:',
      options: ['Identical', 'Intersecting along a line', 'Parallel and distinct', 'Perpendicular'],
      answer: 'Parallel and distinct',
      hints: ['Same normal vector [a,b,c] means same orientation (parallel). Different right-hand sides d₁≠d₂ means different positions (distinct). Parallel lines never intersect.'],
      reviewSection: 'Rigor — parallel planes',
    },
  ],
};
