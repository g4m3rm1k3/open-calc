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
    realWorldContext: 'Every digital map, MRI scan, and CNC machine relies on the Cartesian coordinate system. In **Engineering**, we use the distance formula to calculate cable lengths between bridge towers. In **Medicine**, imaging software uses coordinate geometry to measure a tumor\'s size across multiple planes. In **Computer Science**, finding the distance between two objects in a game (to check collision) is just the Pythagorean theorem in coordinate form. Fusing geometry (points) and algebra (numbers) allowed us to calculate the world before we even built it.',
    previewVisualizationId: 'CartesianFoundationsViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Until now, algebra and geometry have been two separate languages — equations on one side, shapes on the other. René Descartes fused them in 1637 with a single insight: assign every point in space a pair of numbers $(x, y)$. Suddenly every equation became a picture, and every picture became an equation. This lesson builds that bridge. Every graph you will ever draw in mathematics lives here.',
      'To "read" a graph, you must understand its landmarks. **Zeros (x-intercepts)** answer: *For what inputs does this system output nothing?* In physics, these are equilibrium points; in engineering, they are signal crossings. They are the moments a function "touches ground."',
      'The **y-intercept** is the function\'s value at $x = 0$ — the "start" of the story. In economics, it represents fixed overhead; in medicine, the initial drug dosage. It anchors the system to its baseline. Think of a graph as a map of a journey: the y-intercept is where you begin, the zeros are every place you return to sea level, and the slope is how steeply you\'re climbing at any moment.',
      'The four **quadrants** encode the signs of both variables. $Q_I$ ($x, y > 0$) holds real-world physical values like time and distance. Moving between quadrants visually represents switching between surplus and deficit, positive and negative territory.',
      '**Where this is heading:** The next lesson uses this Cartesian foundation to ask: what happens when you shift, stretch, or flip a function? Transformations are the "remote control" of the coordinate plane — and understanding them requires knowing the landmarks this lesson builds.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc arc — Lesson 1 of 5',
        body: '(Algebra & Geometry as separate disciplines) | **Graphs & Coordinate Geometry** | Function Transformations →',
      },
      {
        type: 'insight',
        title: 'Descartes\' core idea (1637)',
        body: '\\text{A point in the plane} \\longleftrightarrow \\text{an ordered pair of numbers } (x, y) \\\\ \\text{An equation } f(x,y) = 0 \\longleftrightarrow \\text{a curve in the plane}',
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
        title: 'Zeros, roots, and $x$-intercepts — three names, one concept',
        body: 'f(c) = 0 \\iff x = c \\text{ is a zero} \\\\ \\iff (c,0) \\text{ is an x-intercept}',
      },
      {
        type: 'warning',
        title: 'Edge case: undefined slopes',
        body: '\\text{The perpendicular rule } m_1 \\cdot m_2 = -1 \\text{ breaks down for vertical and horizontal lines.} \\\\ \\text{Horizontal (m=0) } \\perp \\text{ Vertical (m undefined) — handle as a special case.}',
      },
    ],
    visualizations: [
      {
        id: 'CartesianFoundationsViz',
        title: 'The Solution Map',
        mathBridge: 'Step 1: Click anywhere on the plane and read off the $(x, y)$ coordinates. Notice which quadrant you are in and what that tells you about the signs. Step 2: Drag the point through each of the four quadrants — watch the coordinate signs flip at each axis crossing. Step 3: Move the point to an axis. When it lands on the $x$-axis, $y = 0$; that is the definition of a zero. When it lands on the $y$-axis, $x = 0$; that is the y-intercept. The key lesson: zeros and intercepts are not special formulas — they are what happens when one coordinate is exactly zero.',
        caption: 'Signs dictate the geometric territory.',
      },
    ],
  },

  math: {
    prose: [
      'Having established the historical bridge between algebra and geometry, we define the coordinate plane\'s core tools with algebraic precision.',
      '**The Algebra-Graph Pipeline**: Equations don\'t just map points — they *predict* them. By factoring $x^3 - 4x = x(x-2)(x+2)$, we reveal its zeros ($0, 2, -2$) before drawing a single point. The symbolic structure controls the geometric reality.',
      '**The Metric of Distance**: Distance is the geometric consequence of the Pythagorean Theorem. The straight-line distance between $(x_1, y_1)$ and $(x_2, y_2)$ is $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$. The midpoint formula $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$ simply averages both coordinates.',
      '**The Geometry of the Circle**: Every circle is the set of points at constant distance $r$ from center $(h, k)$. Squaring the distance formula gives standard form $(x-h)^2 + (y-k)^2 = r^2$.',
      '**Orthogonality and Slope**: When two lines are perpendicular, their slopes satisfy $m_1 \\cdot m_2 = -1$. Vertical and horizontal lines are the exception — they are perpendicular to each other, but the formula does not apply.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Coordinate Pipeline',
        body: '\\text{Factored Form } \\implies \\text{Zeros } \\implies \\text{Graph Crossings}',
      },
      {
        type: 'theorem',
        title: 'Distance and midpoint formulas',
        body: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} \\qquad M = \\left(\\tfrac{x_1+x_2}{2}, \\tfrac{y_1+y_2}{2}\\right)',
      },
      {
        type: 'theorem',
        title: 'Standard circle equation',
        body: '(x - h)^2 + (y - k)^2 = r^2 \\qquad \\text{Center: } (h, k) \\quad \\text{Radius: } r',
      },
      {
        type: 'theorem',
        title: 'Perpendicular slope condition',
        body: '\\text{Lines with slopes } m_1 \\text{ and } m_2 \\text{ are perpendicular} \\iff m_1 \\cdot m_2 = -1 \\\\ \\text{i.e., } m_2 = -\\tfrac{1}{m_1} \\quad (\\text{negative reciprocal})',
      },
      {
        type: 'theorem',
        title: 'Parallel vs perpendicular at a glance',
        body: '\\text{Parallel: same slope, } m_1 = m_2 \\qquad \\text{Perpendicular: } m_1 m_2 = -1 \\\\ \\text{Example: slope } \\tfrac{2}{3} \\text{ is perpendicular to slope } -\\tfrac{3}{2}',
      },
      {
        type: 'theorem',
        title: 'Graphing inequalities',
        body: 'y > f(x) \\implies \\text{Shade ABOVE boundary} \\\\ y < f(x) \\implies \\text{Shade BELOW boundary} \\\\ \\text{Strict } (>, <): \\text{ dashed boundary.} \\quad \\text{Non-strict } (\\geq, \\leq): \\text{ solid boundary.}',
      },
      {
        type: 'definition',
        title: 'Even/odd symmetry tests',
        body: '\\text{Even (y-axis): } f(-x) = f(x) \\\\ \\text{Odd (Origin): } f(-x) = -f(x)',
      },
    ],
    visualizations: [
      {
        id: 'SymmetryViz',
        title: 'Symmetry: The Geometric Mirror',
        mathBridge: 'Step 1: Select "Even function" and observe the graph. Notice that the left side is a perfect mirror of the right side across the $y$-axis. Step 2: Select "Odd function." The graph now has 180° rotational symmetry around the origin — fold it over the origin and it lands on itself. Step 3: Test a point: pick $x = 2$ on an even function, then look at $x = -2$. Same $y$-value. On an odd function, same magnitude but opposite sign. The key lesson: symmetry is not a visual observation — it is the algebraic statement $f(-x) = f(x)$ or $f(-x) = -f(x)$.',
        caption: 'Even: mirror across $y$-axis. Odd: 180° rotation around origin.',
      },
      {
        id: 'InequalityGeometryViz',
        title: 'Inequality Geometry: Shading the Regions',
        mathBridge: 'Step 1: Look at the boundary line. This is the set of all points where equality holds — the "edge" of the solution set. Step 2: Toggle between $>$ and $<$. Watch which side of the line gets shaded — the shading represents all points where the inequality is true. Step 3: Toggle between $>$ and $\\geq$. Notice the boundary switches from dashed to solid. The key lesson: a dashed line means the boundary is not included (strict inequality); a solid line means it is. Always test a point like $(0,0)$ to confirm which side to shade.',
        caption: 'Inequalities define territories, not just paths.',
      },
      {
        id: 'ZerosAndInterceptsViz',
        title: 'Anatomy of a Function',
        mathBridge: 'Step 1: Adjust the sliders and watch where the graph crosses the $x$-axis. These are the zeros — inputs that produce output zero. Step 2: Locate the $y$-intercept. This is always at $x = 0$ — the leftmost anchor of the curve. Step 3: Count the zeros. A polynomial of degree $n$ has at most $n$ real zeros. The key lesson: the structure of the equation (its factors) completely determines the number and location of its zeros before you draw anything.',
        caption: 'Zeros are answers to $f(x)=0$. The $y$-intercept is the answer to $f(0)=?$',
      },
    ],
  },

  rigor: {
    title: 'Proving the perpendicular slope condition',

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
      problem: 'Find all zeros and the $y$-intercept of $f(x) = x^3 - 4x$.',
      steps: [
        {
          expression: 'f(0) = 0^3 - 4(0) = 0',
          annotation: '$y$-intercept: substitute $x=0$. The graph passes through the origin.',
          hint: 'The $y$-intercept is always found by substituting $x = 0$. No factoring needed.',
        },
        {
          expression: 'x^3 - 4x = 0 \\Rightarrow x(x^2 - 4) = 0 \\Rightarrow x(x-2)(x+2) = 0',
          annotation: 'For zeros: set $f(x) = 0$ and factor. Factor out $x$ first, then apply difference of squares.',
          hint: 'Always look for a common factor first. $x^3 - 4x = x(x^2 - 4)$. Then $x^2 - 4 = (x-2)(x+2)$ is a difference of squares.',
        },
        {
          expression: 'x = 0, \\quad x = 2, \\quad x = -2',
          annotation: 'Three zeros: the graph crosses the $x$-axis at $-2$, $0$, and $2$.',
          hint: 'Set each factor equal to zero: $x = 0$, $x - 2 = 0 \\Rightarrow x = 2$, $x + 2 = 0 \\Rightarrow x = -2$.',
        },
      ],
      conclusion: 'A cubic with three distinct real zeros crosses the $x$-axis three times. The $y$-intercept coincides with a zero here because there is no constant term — $f(0) = 0$.',
    },
    {
      id: 'ch1-001-ex2',
      title: 'Writing the equation of a perpendicular line',
      problem: 'Find the line perpendicular to $y = \\tfrac{3}{4}x - 2$ passing through $(3, 1)$.',
      steps: [
        {
          expression: 'm_1 = \\tfrac{3}{4} \\Rightarrow m_\\perp = -\\tfrac{4}{3}',
          annotation: 'Perpendicular slope is the negative reciprocal: flip the fraction and negate.',
          hint: 'To get the negative reciprocal: flip $\\frac{3}{4}$ to $\\frac{4}{3}$, then negate to get $-\\frac{4}{3}$.',
        },
        {
          expression: 'y - 1 = -\\tfrac{4}{3}(x - 3)',
          annotation: 'Point-slope form with the perpendicular slope and the given point $(3,1)$.',
          hint: 'Point-slope form: $y - y_1 = m(x - x_1)$. Plug in $m = -\\frac{4}{3}$, $x_1 = 3$, $y_1 = 1$.',
        },
        {
          expression: 'y = -\\tfrac{4}{3}x + 4 + 1 = -\\tfrac{4}{3}x + 5',
          annotation: 'Simplify. Verify: $\\tfrac{3}{4} \\times (-\\tfrac{4}{3}) = -1$ ✓',
          hint: 'Distribute: $-\\frac{4}{3}(x-3) = -\\frac{4}{3}x + 4$. Then $y = -\\frac{4}{3}x + 4 + 1$.',
        },
      ],
      conclusion: 'Always verify by multiplying the two slopes — the product must be $-1$.',
    },
    {
      id: 'ch1-001-ex3',
      title: 'Graphing a linear inequality',
      problem: 'Graph the solution region of $2x - 3y < 6$.',
      steps: [
        {
          expression: '\\text{Boundary: } 2x - 3y = 6 \\Rightarrow y = \\tfrac{2}{3}x - 2',
          annotation: 'First draw the boundary line. Since the inequality is strict ($<$), draw it dashed.',
          hint: 'Solve for $y$: $-3y = -2x + 6 \\Rightarrow y = \\frac{2}{3}x - 2$. Dashed because $<$ does not include the boundary.',
        },
        {
          expression: '\\text{Test } (0,0): \\quad 2(0) - 3(0) = 0 < 6 \\checkmark',
          annotation: 'The origin satisfies the inequality — shade the side containing $(0, 0)$, which is above the line.',
          hint: 'Pick any easy test point not on the boundary. $(0,0)$ is usually the simplest. If it satisfies the inequality, shade its side.',
        },
        {
          expression: '\\text{Solution: all points strictly above the dashed line } y = \\tfrac{2}{3}x - 2',
          annotation: 'The shaded region is the half-plane where $2x - 3y < 6$.',
          hint: 'Since $(0,0)$ is above the line $y = \\frac{2}{3}x - 2$ and it satisfies the inequality, the solution region is above.',
        },
      ],
      conclusion: 'Inequality → region. Strict inequality → dashed boundary. Always test a point to confirm which side.',
    },
    {
      id: 'ch1-001-ex4',
      title: 'Distance and midpoint: a bridge engineering application',
      problem: 'A girder spans from $(-4, 2)$ to $(10, 8)$. Find the length and center point.',
      steps: [
        {
          expression: 'd = \\sqrt{(10-(-4))^2 + (8-2)^2} = \\sqrt{14^2 + 6^2} = \\sqrt{196 + 36} = \\sqrt{232}',
          annotation: 'Apply the distance formula. $\\sqrt{232} \\approx 15.2$ units.',
          hint: 'Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. Be careful with $x_1 = -4$: $10 - (-4) = 14$.',
        },
        {
          expression: 'M = \\left(\\frac{-4+10}{2}, \\frac{2+8}{2}\\right) = (3, 5)',
          annotation: 'Midpoint: average the $x$- and $y$-coordinates separately.',
          hint: 'Midpoint formula: $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$.',
        },
      ],
      conclusion: 'The girder is approximately 15.2 units long with its balance point (centroid) at $(3, 5)$.',
    },
  ],

  challenges: [
    {
      id: 'ch1-001-ch1',
      difficulty: 'medium',
      problem: 'Are the lines $3x + 5y = 15$ and $5x - 3y = 9$ perpendicular? Prove it.',
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
      problem: 'Find the region satisfying both $y \\geq x^2$ and $y \\leq x + 2$ simultaneously.',
      hint: 'Find the intersections first, then test a point in the candidate region.',
      walkthrough: [
        {
          expression: 'x^2 = x + 2 \\Rightarrow x^2 - x - 2 = 0 \\Rightarrow (x-2)(x+1) = 0',
          annotation: 'Intersections at $x = -1$ and $x = 2$, giving points $(-1, 1)$ and $(2, 4)$.',
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
    {
      id: 'ch1-001-ch3',
      difficulty: 'medium',
      problem: 'Find the equation of a circle centered at $(2, -3)$ that passes through $(6, 0)$.',
      hint: 'First find the radius using the distance formula, then write standard form.',
      walkthrough: [
        {
          expression: 'r = \\sqrt{(6-2)^2 + (0-(-3))^2} = \\sqrt{16+9} = 5',
          annotation: 'Radius = distance from center to the point on the circle.',
        },
        {
          expression: '(x-2)^2 + (y+3)^2 = 25',
          annotation: 'Standard circle form with $h=2$, $k=-3$, $r^2=25$.',
        },
      ],
      answer: '(x-2)^2 + (y+3)^2 = 25',
    },
  ],

  crossRefs: [
    { slug: 'function-transformations', reason: 'Transformations act on the Cartesian coordinates established here' },
    { slug: 'function-behaviour', reason: 'Asymptotes and intercepts are read from graphs using the coordinate concepts built here' },
    { slug: '00-intro-limits', reason: 'Limits describe what happens to the $y$-coordinate as $x$ approaches a value — built on this graphing foundation' },
  ],

  checkpoints: [
    'Can you find all zeros of a polynomial by factoring, without graphing?',
    'Can you write the equation of a line perpendicular to a given line through a given point?',
    'Do you know all four formulas: distance, midpoint, circle equation, and perpendicular slope?',
    'Can you determine which region to shade for an inequality by testing a point?',
    'Can you test even/odd symmetry algebraically using $f(-x)$?',
  ],

  semantics: {
    symbols: [
      { symbol: '(x, y)', meaning: 'Ordered pair — Cartesian address of a point in the plane' },
      { symbol: 'd = \\sqrt{\\cdots}', meaning: 'Distance formula — Pythagoras applied to coordinate differences' },
      { symbol: 'M = (\\bar{x}, \\bar{y})', meaning: 'Midpoint — average of the two endpoints\' coordinates' },
      { symbol: 'f(c) = 0', meaning: 'Zero (root): $x = c$ is a zero iff $c$ is an input that produces output 0' },
      { symbol: 'm_\\perp = -1/m', meaning: 'Negative reciprocal — slope of a line perpendicular to slope $m$' },
    ],
    rulesOfThumb: [
      'To find $y$-intercept: substitute $x = 0$. To find zeros: set $f(x) = 0$ and solve.',
      'Perpendicular slopes multiply to $-1$. Parallel slopes are equal.',
      'The standard circle $(x-h)^2 + (y-k)^2 = r^2$ has center $(h, k)$ and radius $r$.',
      'For inequalities: draw boundary (dashed if strict), test $(0,0)$, shade the correct side.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Algebra — factoring', where: 'Algebra 2 / Pre-algebra', why: 'Finding zeros requires factoring; revisit if you cannot factor quadratics and cubics fluently' },
      { topic: 'Slope and linear equations', where: 'Algebra 1', why: 'Perpendicular and parallel lines require solid slope intuition' },
      { topic: 'Pythagorean theorem', where: 'Geometry', why: 'The distance formula IS the Pythagorean theorem in coordinate form' },
    ],
    futureLinks: [
      { topic: 'Function transformations', where: 'Precalc Lesson 2', why: 'Shifts and stretches move points in the coordinate plane using the coordinates defined here' },
      { topic: 'Limits and continuity', where: 'Chapter 1 Calculus', why: 'Limits describe $y$-coordinate behavior as $x$ approaches a value — reading graphs is prerequisite' },
      { topic: 'Dot product and vectors', where: 'Precalc Lesson 5 / Calculus 3', why: 'The perpendicularity condition $m_1 m_2 = -1$ generalises to the dot product in $n$ dimensions' },
    ],
  },

  assessment: [
    {
      question: 'Find the distance between $(1, -3)$ and $(4, 1)$.',
      answer: '$d = \\sqrt{9+16} = 5$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'A line has slope $\\frac{2}{5}$. What is the slope of a perpendicular line?',
      answer: '$m_\\perp = -\\frac{5}{2}$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Is $f(x) = x^4 - x^2$ even, odd, or neither?',
      answer: 'Even: $f(-x) = (-x)^4 - (-x)^2 = x^4 - x^2 = f(x)$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Every point in the plane has a unique address $(x, y)$. Every equation draws a set of addresses.',
    'Zeros = where the function hits ground ($y = 0$). $y$-intercept = where it starts ($x = 0$).',
    'Distance is Pythagoras in disguise: $d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$.',
    'Perpendicular slopes: flip, negate. Product is always $-1$.',
    'Inequality shading: draw boundary, test a point, shade the true side.',
  ],

  quiz: [
    {
      id: 'pc1-001-q1',
      type: 'input',
      text: 'Find the distance between the points $(-1, 2)$ and $(3, 5)$.',
      answer: '5',
      hints: [
        'Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.',
        '$d = \\sqrt{(3-(-1))^2 + (5-2)^2} = \\sqrt{16+9} = \\sqrt{25} = 5$.',
      ],
      reviewSection: 'Math tab — distance formula',
    },
    {
      id: 'pc1-001-q2',
      type: 'input',
      text: 'Find the midpoint of the segment from $(2, -4)$ to $(6, 2)$.',
      answer: '(4, -1)',
      hints: [
        'Midpoint: average the $x$-coordinates and average the $y$-coordinates.',
        '$M = \\left(\\frac{2+6}{2}, \\frac{-4+2}{2}\\right) = (4, -1)$.',
      ],
      reviewSection: 'Math tab — distance and midpoint formulas',
    },
    {
      id: 'pc1-001-q3',
      type: 'input',
      text: 'Find all zeros of $f(x) = x^2 - 5x + 6$.',
      answer: 'x = 2 and x = 3',
      hints: [
        'Set $f(x) = 0$ and factor: find two numbers that multiply to 6 and add to $-5$.',
        '$x^2 - 5x + 6 = (x-2)(x-3) = 0 \\Rightarrow x = 2$ or $x = 3$.',
      ],
      reviewSection: 'Intuition tab — zeros as x-intercepts',
    },
    {
      id: 'pc1-001-q4',
      type: 'choice',
      text: 'A line has slope $m = -\\frac{3}{2}$. What is the slope of a line perpendicular to it?',
      options: ['$\\frac{3}{2}$', '$\\frac{2}{3}$', '$-\\frac{2}{3}$', '$-\\frac{3}{2}$'],
      answer: '$\\frac{2}{3}$',
      hints: [
        'Perpendicular slope is the negative reciprocal: flip and negate.',
        'Flip $-\\frac{3}{2}$ to $-\\frac{2}{3}$, then negate: $\\frac{2}{3}$. Check: $(-\\frac{3}{2})(\\frac{2}{3}) = -1$ ✓',
      ],
      reviewSection: 'Math tab — perpendicular slope condition',
    },
    {
      id: 'pc1-001-q5',
      type: 'input',
      text: 'Write the equation of the circle centered at $(0, 3)$ with radius $4$.',
      answer: 'x^2 + (y-3)^2 = 16',
      hints: [
        'Standard form: $(x-h)^2 + (y-k)^2 = r^2$.',
        'Center $(0, 3)$ gives $h=0$, $k=3$. Radius $4$ gives $r^2 = 16$. So $x^2 + (y-3)^2 = 16$.',
      ],
      reviewSection: 'Math tab — standard circle equation',
    },
    {
      id: 'pc1-001-q6',
      type: 'choice',
      text: 'Which of the following is the $y$-intercept of $f(x) = 3x^2 - 7x + 4$?',
      options: ['$0$', '$4$', '$-7$', '$3$'],
      answer: '$4$',
      hints: [
        'The $y$-intercept is the value of $f(0)$.',
        '$f(0) = 3(0)^2 - 7(0) + 4 = 4$.',
      ],
      reviewSection: 'Intuition tab — y-intercept as baseline',
    },
    {
      id: 'pc1-001-q7',
      type: 'choice',
      text: 'For the inequality $y > 2x - 1$, what does the dashed boundary line signify?',
      options: [
        'The boundary is included in the solution',
        'The boundary is NOT included in the solution',
        'The inequality has no solution',
        'The shading is above the line',
      ],
      answer: 'The boundary is NOT included in the solution',
      hints: [
        'Strict inequalities ($>$, $<$) use dashed lines. Non-strict ($\\geq$, $\\leq$) use solid lines.',
        'Dashed means points on the line do NOT satisfy the inequality — they are excluded from the solution set.',
      ],
      reviewSection: 'Math tab — graphing inequalities',
    },
    {
      id: 'pc1-001-q8',
      type: 'choice',
      text: 'Is $f(x) = x^3 - 2x$ even, odd, or neither?',
      options: ['Even', 'Odd', 'Neither', 'Both'],
      answer: 'Odd',
      hints: [
        'Compute $f(-x)$ and compare to $f(x)$ and $-f(x)$.',
        '$f(-x) = (-x)^3 - 2(-x) = -x^3 + 2x = -(x^3 - 2x) = -f(x)$. So $f$ is odd.',
      ],
      reviewSection: 'Math tab — even/odd symmetry tests',
    },
    {
      id: 'pc1-001-q9',
      type: 'input',
      text: 'In which quadrant is the point $(-3, 5)$?',
      answer: 'Quadrant II',
      hints: [
        'Check the signs: $x < 0$ and $y > 0$.',
        'Negative $x$, positive $y$ places the point in Quadrant II.',
      ],
      reviewSection: 'Intuition tab — four quadrants',
    },
    {
      id: 'pc1-001-q10',
      type: 'input',
      text: 'Find the slope of the line passing through $(1, 3)$ and $(4, 9)$.',
      answer: '2',
      hints: [
        'Slope formula: $m = \\frac{y_2 - y_1}{x_2 - x_1}$.',
        '$m = \\frac{9-3}{4-1} = \\frac{6}{3} = 2$.',
      ],
      reviewSection: 'Math tab — perpendicular slope condition',
    },
  ],
}
