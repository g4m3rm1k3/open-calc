export default {
  id: 'ch1-graphs-001',
  slug: 'graphs-foundations',
  chapter: 'precalc-1',
  order: 1,
  title: 'Graphs: The Invention That Changed Mathematics',
  subtitle: 'Algebra meets Geometry — the foundation of every digital and physical map',
  tags: ['cartesian coordinates', 'distance formula', 'midpoint', 'zeros', 'y-intercept', 'perpendicular lines'],
  aliases: 'coordinate plane x-intercept roots graphing inequalities perpendicular slope Descartes history of graphs distance midpoint',

  hook: {
    question: 'How does your GPS know exactly how far you are from your destination? It boils down to a single formula invented 2,500 years ago.',
    realWorldContext: 'Every digital map, MRI scan, and CNC machine relies on the Cartesian coordinate system. In **Engineering**, we use the distance formula to calculate cable lengths between bridge towers. In **Medicine**, imaging software uses coordinate geometry to measure a tumor\'s size across multiple planes. In **Computer Science**, finding the distance between two objects in a game (to see if they collide) is just the Pythagorean theorem in coordinate form. Fusing geometry (points) and algebra (numbers) allowed us to calculate the world before we even built it.',
  },

  intuition: {
    prose: [
      'Before Descartes, mathematics had two completely separate branches. **Algebra** dealt with equations and symbols; **Geometry** dealt with shapes and space. Fusing them allowed us to suddenly *draw* an equation, or *calculate* a geometric shape. This is the "Great Fusion" that created the modern world.',
      'To "read" a graph, you must understand its landmarks. **Zeros (x-intercepts)** answer the question: *For what inputs does this system output nothing?* In physics, these are points of **Equilibrium**; in engineering, they are **Signal Crossings**. They are the moments a function "touches ground."',
      '**The y-intercept** is the function\'s value at the very "start" ($x=0$). In economics, it represents **Fixed Overhead**; in medicine, it is the **Initial Dosage**. It anchors the system to its baseline.',
      '**Quadrants as Solution Spaces**: The four quadrants tell us the signs of the system. $Q_I$ ($x,y > 0$) is the home of real-world physical values like time and mass. Shifting between quadrants is the visual representation of moving between surplus and deficit.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Descartes\' core idea (1637)',
        body: '\\text{A point in the plane} \\longleftrightarrow \\text{an ordered pair of numbers } (x, y) \\\\ \\text{An equation } f(x,y) = 0 \\longleftrightarrow \\text{a curve in the plane}',
      },
      {
        type: 'insight',
        title: 'Cognitive Framing: The Big Questions',
        body: '\\text{Zeros: "When is the outcome zero?"} \\\\ \\text{Y-Intercept: "What happens at the beginning?"}',
      },
            {
        type: 'definition',
        title: 'What the axes actually represent',
        body: '\\text{The } x\\text{-axis is the set of all points where } y=0. \\\\ \\text{The } y\\text{-axis is the set of all points where } x=0. \\\\ \\text{The origin is where both are zero: } (0,0).',
      },
      {
        type: 'insight',
        title: 'The four quadrants — and why they matter for sign analysis',
        body: 'Q_I: x>0, y>0 \\quad Q_{II}: x<0, y>0 \\quad Q_{III}: x<0, y<0 \\quad Q_{IV}: x>0, y<0',
      },
      {
        type: 'definition',
        title: 'Formal Equivalence',
        body: 'f(c) = 0 \\iff x = c \\text{ is a zero} \\\\ \\iff (c,0) \\text{ is an x-intercept}',
      },
      {
        type: 'warning',
        title: 'Edge Case: Undefined Slopes',
        body: '\\text{The perpendicular rule } m_1 \\cdot m_2 = -1 \\text{ breaks down for vertical and horizontal lines.} \\\\ \\text{Horizontal (m=0) } \\perp \\text{ Vertical (m is undefined).}',
      },
    ],
    visualizations: [
      {
        id: 'CartesianFoundationsViz',
        title: 'The Solution Map',
        mathBridge: 'Observe the signs of the coordinates as you move between quadrants. Notice how the Zeros and Intercepts are the "Anchor Points" where the function switches territory.',
        caption: 'Signs dictate the geometric territory.',
      },
    ],
  },

  math: {
    prose: [
      'Having established the historical bridge between algebra and geometry, we must now define the definitive tools of the coordinate plane with symbolic precision.',
      '**The Algebra-Graph Pipeline**: Equations don\'t just map points; they **predict** them. By factoring an expression like $x^3 - 4x = x(x-2)(x+2)$, we reveal its zeros ($0, 2, -2$) before even drawing a line. This symbolic structure controls the geographic reality.',
      '**The Metric of Distance**: Distance is not merely a number, but the geometric consequence of the **Pythagorean Theorem**. Given two points $(x_1, y_1)$ and $(x_2, y_2)$, the straight-line distance $d$ is the square root of the sum of the squares of the differences: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.',
      '**The Geometry of the Circle**: Every circle is defined as the **Locus of points** situated at a constant distance $r$ from a fixed center $(h, k)$. Squaring the distance formula reveals the Standard Form $(x - h)^2 + (y - k)^2 = r^2$.',
      '**Orthogonality and Slope**: When two paths are **Perpendicular**, their slopes $m_1$ and $m_2$ typically satisfy $m_1 \\cdot m_2 = -1$. However, we must be careful with **Special Cases**: vertical lines have undefined slope, and horizontal lines have zero slope—these are orthogonal but the formula does not apply.',
    ],
    callouts: [
          {
        type: 'definition',
        title: 'Zeros, roots, and $x$-intercepts — three names, one concept',
        body: 'f(c) = 0 \\iff x = c \\text{ is a zero/root} \\iff (c, 0) \\text{ is an } x\\text{-intercept of the graph}',
      },
      {
        type: 'theorem',
        title: 'Perpendicular slope condition',
        body: '\\text{Lines with slopes } m_1 \\text{ and } m_2 \\text{ are perpendicular} \\iff m_1 \\cdot m_2 = -1 \\\\ \\text{i.e., } m_2 = -\\frac{1}{m_1} \\quad (\\text{negative reciprocal})',
      },
      {
        type: 'theorem',
        title: 'Parallel vs perpendicular at a glance',
        body: '\\text{Parallel: same slope, } m_1 = m_2 \\qquad \\text{Perpendicular: } m_1 m_2 = -1 \\\\ \\text{Example: slope } \\tfrac{2}{3} \\text{ is perpendicular to slope } -\\tfrac{3}{2}',
      },
      {
        type: 'warning',
        title: 'Horizontal and vertical lines are a special case',
        body: '\\text{A horizontal line (slope 0) is perpendicular to a vertical line (undefined slope).} \\\\ m_1 \\cdot m_2 = -1 \\text{ breaks down here — handle as a special case.}',
      },
      {
        type: 'theorem',
        title: 'The Coordinate Pipeline',
        body: '\\text{Factored Form } \\implies \\text{Zeros } \\implies \\text{Graph Crossings}',
      },
      {
        type: 'theorem',
        title: 'The Metric of the Plane (Distance)',
        body: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
      },
      {
        type: 'theorem',
        title: 'The Standard Circle (Locus Definition)',
        body: '(x - h)^2 + (y - k)^2 = r^2 \\\\ \\text{Center: } (h, k) \\quad \\text{Radius: } r',
      },
      {
        type: 'theorem',
        title: 'Perpendicularity',
        body: '\\text{Perpendicular slope } m_\\perp = -\\frac{1}{m} \\\\ m_1 \\cdot m_2 = -1',
      },
      {
        type: 'theorem',
        title: 'Graphing Inequalities',
        body: 'y > f(x) \\implies \\text{Shade ABOVE boundary} \\\\ y < f(x) \\implies \\text{Shade BELOW boundary} \\\\ \\text{Use a dashed line for } > < \\text{ and solid for } \\geq \\leq.',
      },
      {
        type: 'definition',
        title: 'Symmetry Tests',
        body: '\\text{Even (y-axis): } f(-x) = f(x) \\\\ \\text{Odd (Origin): } f(-x) = -f(x)',
      },
    ],
    visualizations: [
      {
        id: 'SymmetryViz',
        title: 'Symmetry: The Geometric Mirror',
        mathBridge: 'Toggle between Even and Odd symmetry. Observe how "Even" is a mirror image across the center wall (y-axis), while "Odd" is a 180° rotation around the origin.',
        caption: 'Symmetry simplifies the complexity of the world.',
      },
      {
        id: 'InequalityGeometryViz',
        title: 'Inequality Geometry: Shading the Regions',
        mathBridge: 'Toggle between $>, <, \geq, \leq$. Notice how the shaded region represents the "Feasible Solution Space." Excluding a boundary (dashed line) is the graphical way to say a value is "Approached but never reached."',
        caption: 'Inequalities define territories, not just paths.',
      },
      {
        id: 'ZerosAndInterceptsViz',
        title: 'Anatomy of a Function',
        mathBridge: 'Adjust the sliders to see how the "Roots" (crossings) and "Intercepts" (start) respond. These are the most critical data points in any model.',
        caption: 'Zeros are answers to $f(x)=0$. The $y$-intercept is the answer to $f(0)=?$',
      },
    ],
  },

  rigor: {
    title: 'Formal Proofs in the Plane',
    prose: [
      'Coordinate geometry allows us to prove geometric properties with algebraic certainty. Let\'s prove two fundamental rules.'
    ],
    proofSteps: [
      {
        section: 'The Perpendicular Slope Condition',
        expression: '\\text{Rotate point } (1, m) \\text{ by 90° about the origin.}',
        annotation: 'A line with slope $m$ passing through the origin contains the point $(1, m)$.'
      },
      {
        expression: '(1, m) \\xrightarrow{90^\\circ} (-m, 1)',
        annotation: 'Rotation by 90° swaps $x$ and $y$ and negates the new $x$.'
      },
      {
        expression: 'm_\\perp = \\frac{1 - 0}{-m - 0} = -\\frac{1}{m}',
        annotation: 'Calculate the slope of the new line: rise/run.'
      },
      {
        expression: 'm \\cdot \\left(-\\frac{1}{m}\\right) = -1 \\checkmark',
        annotation: 'Multiplying the slopes always results in -1.'
      },
      {
        section: 'Distance via Pythagoras',
        expression: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
        annotation: 'Derived by treating $(x_2-x_1)$ and $(y_2-y_1)$ as the legs of a right triangle.'
      },
      {
        section: 'Algebraic Symmetry Tests',
        expression: 'f(-x) = f(x) \\implies \\text{Even (y-axis reflection)}',
        annotation: 'Rule: If replacing $x$ with $-x$ results in the original equation, the function is Even.'
      },
      {
        expression: 'f(-x) = -f(x) \\implies \\text{Odd (Origin rotation)}',
        annotation: 'Rule: If the negative input results in a negative output, the function is Odd.'
      }
    ]
  },
    rigor: {
    title: 'Proving the Perpendicular Slope Condition',
    prose: [
      'Why does perpendicularity mean slopes multiply to $-1$? The proof uses vectors and the dot product — a preview of ideas that become central in multivariable calculus.',
    ],

    proofSteps: [
      {
        expression: '\\text{Line 1 has direction vector } \\mathbf{v}_1 = (1, m_1). \\text{ Line 2 has direction vector } \\mathbf{v}_2 = (1, m_2).',
        annotation: 'A line with slope $m$ rises $m$ units for every 1 unit right, so $(1, m)$ points along it.',
      },
      {
        expression: '\\text{Two lines are perpendicular} \\iff \\mathbf{v}_1 \\cdot \\mathbf{v}_2 = 0',
        annotation: 'Vectors are perpendicular iff their dot product is zero — the geometric definition of a right angle.',
      },
      {
        expression: '\\mathbf{v}_1 \\cdot \\mathbf{v}_2 = (1)(1) + (m_1)(m_2) = 1 + m_1 m_2',
        annotation: 'Compute the dot product component by component.',
      },
      {
        expression: '1 + m_1 m_2 = 0 \\iff m_1 m_2 = -1 \\qquad \\blacksquare',
        annotation: 'Set equal to zero and solve. The perpendicularity condition is exactly $m_1 m_2 = -1$.',
      },
    ],
  },

  examples: [
     {
      id: 'ch1-001-ex1',
      title: 'Finding zeros and $y$-intercept of a polynomial',
      problem: '\\text{Find all zeros and the } y\\text{-intercept of } f(x) = x^3 - 4x.',
      steps: [
        {
          expression: 'f(0) = 0^3 - 4(0) = 0',
          annotation: '$y$-intercept: substitute $x=0$. The graph passes through the origin — $(0,0)$ is both the $y$-intercept and a zero.',
        },
        {
          expression: 'x^3 - 4x = 0 \\Rightarrow x(x^2 - 4) = 0 \\Rightarrow x(x-2)(x+2) = 0',
          annotation: 'For zeros, set $f(x)=0$ and factor. Pull out $x$ first, then difference of squares.',
        },
        {
          expression: 'x = 0, \\quad x = 2, \\quad x = -2',
          annotation: 'Three zeros: the graph crosses the $x$-axis at $-2$, $0$, and $2$.',
        },
      ],
      conclusion: 'A cubic with three distinct real zeros crosses the $x$-axis three times. The $y$-intercept is one of those zeros here — that only happens when $f(0)=0$, i.e., when there is no constant term.',
    },
    {
      id: 'ex-gps-dist',
      title: 'GPS: Calculating Distance',
      problem: '\\text{A destination is at } (8, 12) \\text{ and you are at } (2, 4). \\\\ \\text{How many units away is the target?}',
      steps: [
        {
          expression: 'd = \\sqrt{(8-2)^2 + (12-4)^2} = \\sqrt{6^2 + 8^2}',
          annotation: 'Plug coordinates into the distance formula.'
        },
        {
          expression: 'd = \\sqrt{36 + 64} = \\sqrt{100} = 10',
          annotation: 'Simplify. This is a 6-8-10 triangle.'
        }
      ],
      conclusion: 'The target is exactly 10 units away.'
    },
    {
      id: 'ex-inequality-shading',
      title: 'Rigor: The Inequality Decision',
      problem: '\\text{Graph } 2x - 3y > 6. \\text{ How do we decide which region is "True"?}',
      steps: [
        {
          expression: 'y = \\tfrac{2}{3}x - 2',
          annotation: 'Step 1: The Boundary. Find the line where equality holds. (Dashed for pure $>$).'
        },
        {
          expression: '2(0) - 3(0) > 6 \\implies 0 > 6 \\text{ (FALSE)}',
          annotation: 'Step 2: The Decision. Test $(0, 0)$. Since the origin fails the test, its entire side of the boundary is "False." We shade the opposite side.'
        }
      ],
      conclusion: 'The graph visually represents every possible solution to the constraint.'
    },
        {
      id: 'ch1-001-ex2',
      title: 'Writing the equation of a perpendicular line',
      problem: '\\text{Find the line perpendicular to } y = \\tfrac{3}{4}x - 2 \\text{ passing through } (3, 1).',
      steps: [
        {
          expression: 'm_1 = \\tfrac{3}{4} \\Rightarrow m_\\perp = -\\tfrac{4}{3}',
          annotation: 'Perpendicular slope is the negative reciprocal: flip and negate.',
        },
        {
          expression: 'y - 1 = -\\tfrac{4}{3}(x - 3)',
          annotation: 'Point-slope form with the new slope and the given point.',
        },
        {
          expression: 'y = -\\tfrac{4}{3}x + 4 + 1 = -\\tfrac{4}{3}x + 5',
          annotation: 'Simplify. Check: slopes $\\tfrac{3}{4} \\times (-\\tfrac{4}{3}) = -1$ ✓',
        },
      ],
      conclusion: 'Always verify by multiplying the two slopes — the product must be $-1$.',
    },
    {
      id: 'ex-perp-construction',
      title: 'Rigor: Constructing a Perpendicular Line',
      problem: '\\text{Find the equation of the line perpendicular to } y = 2x - 5 \\text{ passing through } (4, 1).',
      steps: [
        {
          expression: 'm_1 = 2 \\implies m_2 = -\\frac{1}{2}',
          annotation: 'Rule: Perpendicular slopes are negative reciprocals.'
        },
        {
          expression: '1 = -\\frac{1}{2}(4) + b',
          annotation: 'Substitute the point $(4, 1)$ into $y = mx + b$ to solve for the intercept.'
        },
        {
          expression: '1 = -2 + b \\implies b = 3',
          annotation: 'Solve for $b$.'
        },
        {
          expression: 'y = -\\frac{1}{2}x + 3',
          annotation: 'Construct the final equation.'
        }
      ],
      conclusion: 'The perpendicular line is y = -1/2x + 3.'
    },
    {
      id: 'ex-engineering-beam',
      title: 'Engineering: Finding a Centroid',
      problem: '\\text{A girder spans from } (-4, 2) \\text{ to } (10, 8). \\text{ Where is the center point?}',
      steps: [
        {
          expression: 'M = \\left( \\frac{-4+10}{2}, \\frac{2+8}{2} \\right)',
          annotation: 'Average the $x$ and $y$ values.'
        },
        {
          expression: 'M = (3, 5)',
          annotation: 'The balance point is at (3, 5).'
        }
      ],
      conclusion: 'The exact center of the girder is located at (3, 5).'
    },
        {
      id: 'ch1-001-ex3',
      title: 'Graphing a linear inequality',
      problem: '\\text{Graph the solution region of } 2x - 3y < 6.',
      steps: [
        {
          expression: '\\text{Boundary: } 2x - 3y = 6 \\Rightarrow y = \\tfrac{2}{3}x - 2',
          annotation: 'First draw the boundary line. Since the inequality is strict ($<$), draw it dashed.',
        },
        {
          expression: '\\text{Test } (0,0): \\quad 2(0) - 3(0) = 0 < 6 \\checkmark',
          annotation: 'The origin satisfies the inequality, so shade the side containing $(0,0)$ — above the line.',
        },
        {
          expression: '\\text{Solution: all points strictly above the dashed line } y = \\tfrac{2}{3}x - 2',
          annotation: 'The shaded region is the half-plane where $y > \\tfrac{2}{3}x - 2$.',
        },
      ],
      conclusion: 'Inequality → region. Strict inequality → dashed boundary. Always test a point to confirm which side.',
    },
  ],

  challenges: [
    {
      id: 'ch-01-01',
      difficulty: 'medium',
      problem: '\\text{Find the equation of a circle centered at } (2, -3) \\text{ with radius 5.}',
      walkthrough: [
        { expression: '(x - 2)^2 + (y - (-3))^2 = 5^2', annotation: 'Plug $h, k, r$ into standard form.' },
        { expression: '(x - 2)^2 + (y + 3)^2 = 25', annotation: 'Simplify signs and square the radius.' }
      ],
      answer: '(x - 2)^2 + (y + 3)^2 = 25'
    },
    {
      id: 'ch-01-03',
      difficulty: 'medium',
      problem: '\\text{Algebraically determine if } f(x) = x^{4} - x^{2} \\text{ is even, odd, or neither.}',
      walkthrough: [
        { expression: 'f(-x) = (-x)^{4} - (-x)^{2}', annotation: 'Substitute $-x$ for every $x$.' },
        { expression: 'f(-x) = x^{4} - x^{2} = f(x)', annotation: 'Simplify. The results are identical.' }
      ],
      answer: '\\text{Even (symmetric across the y-axis).}'
    },
        {
      id: 'ch1-001-ch1',
      difficulty: 'medium',
      problem: '\\text{Are the lines } 3x + 5y = 15 \\text{ and } 5x - 3y = 9 \\text{ perpendicular? Prove it.}',
      hint: 'Convert both to slope-intercept form and check whether the slopes multiply to $-1$.',
      walkthrough: [
        {
          expression: 'y = -\\tfrac{3}{5}x + 3 \\quad \\text{and} \\quad y = \\tfrac{5}{3}x - 3',
          annotation: 'Solve each for $y$. Slopes are $m_1 = -3/5$ and $m_2 = 5/3$.',
        },
        {
          expression: 'm_1 \\cdot m_2 = \\left(-\\tfrac{3}{5}\\right)\\left(\\tfrac{5}{3}\\right) = -1 \\checkmark',
          annotation: 'Product is $-1$, so the lines are perpendicular.',
        },
      ],
      answer: '\\text{Yes. } m_1 \\cdot m_2 = -\\tfrac{3}{5} \\cdot \\tfrac{5}{3} = -1.',
    },
    {
      id: 'ch1-001-ch2',
      difficulty: 'hard',
      problem: '\\text{Find the region satisfying both } y \\geq x^2 \\text{ and } y \\leq x + 2 \\text{ simultaneously.}',
      hint: 'Find intersections first, then test a point in the candidate region.',
      walkthrough: [
        {
          expression: 'x^2 = x + 2 \\Rightarrow x^2 - x - 2 = 0 \\Rightarrow (x-2)(x+1) = 0',
          annotation: 'Intersections at $x=-1$ and $x=2$, giving points $(-1,1)$ and $(2,4)$.',
        },
        {
          expression: '\\text{Test } (0,1): \\quad 1 \\geq 0^2=0 \\checkmark \\quad 1 \\leq 0+2=2 \\checkmark',
          annotation: 'The point $(0,1)$ satisfies both. The region is between the parabola and the line, from $x=-1$ to $x=2$.',
        },
        {
          expression: '\\text{Region: } x^2 \\leq y \\leq x+2 \\text{ for } -1 \\leq x \\leq 2',
          annotation: 'This is also the region whose area integral gives $\\int_{-1}^{2}(x+2-x^2)\\,dx = \\tfrac{9}{2}$ — a preview of integration.',
        },
      ],
      answer: '\\text{The region between the parabola and line: } x^2 \\leq y \\leq x+2, \\; -1 \\leq x \\leq 2.',
    },
  ],
}
