export default {
  id: 'ch1-graphs-001',
  slug: 'graphs-foundations',
  chapter: 'precalc-1',
  order: 1,
  title: 'Graphs: The Invention That Changed Mathematics',
  subtitle: 'What coordinates actually are, why they were revolutionary, and what every point on a graph is telling you',
  tags: ['cartesian coordinates', 'history', 'zeros', 'y-intercept', 'inequalities', 'perpendicular lines'],
  aliases: 'coordinate plane x-intercept roots graphing inequalities perpendicular slope Descartes history of graphs',

  hook: {
    question: 'Before 1637, algebra and geometry were completely separate subjects. One person fused them forever — and the idea was so simple it seems obvious in hindsight. What was it?',
    realWorldContext: 'Every chart, map, engineering drawing, computer screen, and GPS coordinate uses the idea invented by René Descartes in 1637. Manufacturing uses coordinate measuring machines (CMMs) that locate points in 3D space to micron precision — all Cartesian coordinates. Before graphs existed, mathematicians could not visualize equations. They had to reason purely through symbolic manipulation, which made many problems nearly impossible.',
  },

  intuition: {
    prose: [
      'Before Descartes, mathematics had two completely separate branches. **Algebra** dealt with equations and symbols — abstract, numeric, disconnected from space. **Geometry** dealt with shapes, distances, and angles — visual, spatial, but hard to compute with precisely. The two fields had coexisted for nearly two thousand years without anyone connecting them.',
      'The insight Descartes had — reportedly while watching a fly crawl across a tiled ceiling — was that you could describe the fly\'s *position* using just two numbers: how far across and how far up. That\'s it. Two numbers locate any point in a plane. An equation relating those two numbers describes a *curve*. Algebra and geometry became the same thing.',
      'This seems trivial now because we grew up with it. It was not trivial. It meant you could suddenly *draw* an equation, or *calculate* a geometric shape. Calculus — invented 30 years later by Newton and Leibniz — was only possible because of this bridge. Without coordinate geometry, there is no calculus.',
      'Before graphs, how did mathematicians work? They used **proportions**, **geometric constructions**, and **rhetorical algebra** — describing equations entirely in words. "A square plus twice the side equals 8" instead of $x^2 + 2x = 8$. The ancient Babylonians and Greeks solved quadratics geometrically using areas of rectangles. It worked, but it was slow and couldn\'t generalize easily.',
    ],
    callouts: [
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
    ],
    visualizations: [
      {
        id: 'CartesianFoundationsViz',
        title: 'The Cartesian Plane — Every Point Has an Address',
        mathBridge: 'Click anywhere on the plane to place a point and see its coordinates. Notice how the two numbers uniquely identify every location.',
        caption: 'The coordinate plane is a universal addressing system for the infinite flat plane.',
      },
      {
        id: 'VideoEmbed',
        title: 'Function vs Relation',
        props: { videoId: "pre-1-4" },
      },
      {
        id: 'VideoEmbed',
        title: 'Visually identifying key characteristics of graphs.',
        props: { videoId: "pre-1-1" },
      },
      {
        id: 'VideoEmbed',
        title: 'Identifying Domain and Range from a Graph',
        props: { videoId: "pre-1-5" },
      },
      {
        id: 'VideoEmbed',
        title: 'Equations of Lines and Graphing',
        props: { videoId: "pre-1-3" },
      },
      {
        id: 'VideoEmbed',
        title: 'Graphing Lines in Slope Intercept Form y=mx+b',
        props: { videoId: "pre-1-3" },
      },
      {
        id: 'VideoEmbed',
        title: 'Equation of Parallel & Perpendicular Lines given Point & Line',
        props: { videoId: "pre-1-3" },
      },
    ],
  },

  math: {
    prose: [
      'The **zeros** of a function — where $f(x) = 0$ — are the $x$-coordinates where the graph crosses or touches the $x$-axis. They are also called **roots** or **$x$-intercepts**. They answer the question: "for what inputs does this function output nothing?" In physics, zeros are equilibria. In engineering, they are where a signal crosses baseline. In calculus, zeros of $f\'(x)$ are where $f(x)$ has horizontal tangents.',
      'The **$y$-intercept** is where $x = 0$, i.e., $f(0)$. It is the function\'s value at the "start" — before any input has been applied. For a distance function, it\'s where you began. For a cost function, it\'s the fixed overhead with zero production. It is always the easiest point to find: just substitute $x = 0$.',
      '**Perpendicular lines** have slopes that are negative reciprocals: if one line has slope $m$, any perpendicular line has slope $-1/m$. The geometric reason: rotating a direction vector 90° negates one component and swaps the other, which exactly inverts and negates the slope ratio.',
      '**Graphing inequalities** produces regions, not lines. The line $y = mx + b$ divides the plane into two half-planes. The inequality $y > mx + b$ is the half-plane *above* the line; $y < mx + b$ is *below*. The boundary line is dashed for strict inequalities ($>$, $<$) and solid for inclusive ones ($\\geq$, $\\leq$). To determine which side, test any point not on the line — $(0,0)$ works unless the line passes through the origin.',
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
    ],
    visualizations: [
      {
        id: 'ZerosAndInterceptsViz',
        title: 'Zeros, $y$-intercepts, and What They Mean',
        mathBridge: 'Adjust the polynomial and watch how the graph\'s crossings and starting point change. Each crossing of the $x$-axis is a zero; the $y$-axis crossing is $f(0)$.',
        caption: 'Zeros are answers to $f(x)=0$. The $y$-intercept is the answer to $f(0)=?$',
      },
    ],
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
