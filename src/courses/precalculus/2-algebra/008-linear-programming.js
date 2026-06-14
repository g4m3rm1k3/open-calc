export default {
  id: 'ch2-alg-008',
  slug: 'linear-programming',
  chapter: 'precalc-2',
  order: 8,
  title: 'Linear Programming & Optimization',
  subtitle: 'Finding the best possible outcome within a set of constraints',
  tags: ['linear programming', 'optimization', 'constraints', 'feasible region', 'objective function', 'vertex theorem'],
  aliases: 'linear programming optimization constraints feasible region objective function vertex theorem inequalities systems',

  hook: {
    question: 'A factory makes two products with different profit margins and different resource requirements. How many of each should they make to maximize profit without running out of materials?',
    realWorldContext: 'Linear programming is the backbone of logistics and supply chain management. From airline scheduling to hospital staffing and diet optimization, the goal is always to maximize a benefit (profit, throughput) or minimize a cost (waste, time) given limited resources (fuel, beds, budget). Problems involving thousands of variables are solved daily using the simplex algorithm, which builds on the graphical methods taught here.',
  },

  intuition: {
    prose: [
      'Linear programming is a technique for finding the maximum or minimum value of a **linear objective function** (like profit $P = 5x + 3y$) subject to a set of **linear constraints** (inequalities like $x + y \leq 10$).',
      'The set of all points that satisfy all constraints simultaneously is called the **feasible region**. Because the constraints are linear, this region is always a polygon (in 2D).',
      'The **Vertex Theorem** (or Fundamental Theorem of Linear Programming) states that the optimal value (max or min) always occurs at one of the vertices (corners) of the feasible region. This means instead of checking infinitely many points, you only need to check the corners.',
      '**The Grammar of Scheduling**: "Programming" in this context does not mean computer code; it comes from the older sense of "Creating a Schedule" or a "Plan of Action." It is the science of optimal coordination between competing rules.',
      '**Resource Scarcity**: In the real world, you never have "Infinite" anything. You have limited time, limited fuel, and limited space. Linear programming is the mathematical language of Scarcity—how to thrive within the boundaries of what is available.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Objective Function vs. Constraints',
        body: '\\text{Objective: } f(x,y) = ax + by \quad \\text{(what you want to maximize/minimize)} \\\\ \\text{Constraints: } c_1x + d_1y \leq k_1, \dots \quad \\text{(the rules you must follow)}',
      },
      {
        type: 'theorem',
        title: 'The Vertex Theorem',
        body: '\\text{If a linear programming problem has a solution, it must occur at a vertex of the feasible region.}',
      },
      {
        type: 'insight',
        title: 'Bounded vs. Unbounded Regions',
        body: '\\text{If the feasible region is bounded (a closed polygon), both max and min exist.} \\\\ \\text{If it is unbounded, a maximum might not exist if the function can grow infinitely.}',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Grammar of Scheduling',
        body: '\\text{The "Objective" is the Goal. The "Constraints" are the Rules.} \\\\ \\text{Solving the system is finding the best "Sentence" (point) that obeys every rule of the grammar.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: Best of All Possible Worlds',
        body: '\\text{There are infinite valid points in the feasible region, but logic dictates only the extremes matter.} \\\\ \\text{We filter the infinite search space down to finite vertices—the only rational candidates for the title of "Best."}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Math of Scarcity',
        body: '\\text{Imagine a factory with limited metal and limited labor.} \\\\ \\text{The feasible region is the "Operating Window." Any point outside results in a system crash (running out of metal or staff time).}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Polygon of Possibility',
        body: '\\text{Graphing the constraints creates a "Shadowed Safe Zone."} \\\\ \\text{The objective function is a "Sweep Line" moving across the landscape. The last corner it touches before leaving the zone is the Maximum.}',
      },
    ],
    visualizations: [
                ],
  },

  math: {
    prose: [
      'To solve a linear programming problem: (1) Graph each constraint inequality to find the feasible region. (2) Find the coordinates of every vertex (intersection of boundary lines). (3) Evaluate the objective function at each vertex. (4) The largest resulting value is the maximum; the smallest is the minimum.',
      'Finding vertices involves solving systems of two linear equations (the boundary lines) at each corner of the polygon.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Feasible Region',
        body: '\\text{The intersection of all half-planes defined by the constraints. Every point in this region is a "possible" solution.}',
      },
      {
        type: 'insight',
        title: 'Sweeping with Iso-Profit Lines',
        body: '\\text{Every point on } ax+by=k \\text{ gives the same value } k. \\\\ \\text{Solving is finding the largest } k \\text{ such that the line } ax+by=k \\text{ still touches the feasible region.}',
      },
      {
        type: 'theorem',
        title: 'The Simplex Algorithm Path',
        body: '\\text{In high dimensions (thousands of variables), we cannot graph.} \\\\ \\text{The Simplex Algorithm starts at one vertex and "hops" to an adjacent vertex with a better value, step by step, until no better vertex exists.}',
      },
    ],
  },

  rigor: {
    title: 'Why the Vertex? Proof by Level Lines',
    proofSteps: [
      { expression: 'f(x,y) = ax + by = k', annotation: 'Let $k$ be a fixed value of the objective function. This defines a "Level Line."' },
      { expression: '\\vec{\\nabla} f = (a,b)', annotation: 'The direction of maximum increase (the gradient) is constant everywhere in a linear system.' },
      { expression: '\\text{Move the line } ax+by=k \\text{ in the direction of } (a,b).', annotation: 'As $k$ increases, the line sweeps across the feasible region.' },
      { expression: '\\text{The line leaves the region at a "Corner" or along an "Edge."}', annotation: 'If it leaves at a corner, that vertex is the unique maximum. If it leaves along an edge, every point on that edge (including the vertices) is a maximum.' },
      { expression: '\\text{Conclusion: A vertex ALWAYS exists that achieves the maximum.} \\quad \\blacksquare', annotation: 'Checking only finite vertices is a rigorous and complete search strategy.' }
    ],
  },

  examples: [
    {
      id: 'ch2-008-ex1',
      title: 'Maximizing profit with two variables',
      problem: '\\text{Maximize } P = 3x + 2y \\text{ subject to: } \\\\ x + 2y \\leq 4, \\quad x - y \\leq 1, \\quad x \\geq 0, \\quad y \\geq 0.',
      steps: [
        { expression: '\\text{Vertices: } (0,0), (1,0), (2,1), (0,2)', annotation: 'Graphing reveals the vertices. $(2,1)$ is the intersection of $x+2y=4$ and $x-y=1$.' },
        { expression: 'P(0,0)=0, \\quad P(1,0)=3, \\quad P(2,1)=3(2)+2(1)=8, \\quad P(0,2)=4', annotation: 'Plug each vertex into $P = 3x + 2y$.' },
        { expression: 'P_{max} = 8 \\text{ at } (2,1)', annotation: 'Compare the values.' },
      ],
      conclusion: 'The maximum profit of 8 is achieved by producing 2 units of $x$ and 1 unit of $y$.',
    },
    {
      id: 'ex-lp-diet',
      title: 'Minimizing Cost: The Diet Problem',
      problem: '\\text{Minimize Cost } C = 2x + 5y \\text{ subject to: } \\\\ x + y \\geq 10, \\quad x \\geq 2, \\quad y \\geq 3.',
      steps: [
        {
          expression: '\\text{Vertices: } (7,3), (2,8)',
          annotation: 'Step 1: Graph the constraints. This is a minimization problem on a "Bottom-Bounded" feasible region.'
        },
        {
          expression: 'C(7,3) = 2(7) + 5(3) = 14+15 = 29 \\\\ C(2,8) = 2(2) + 5(8) = 4+40 = 44',
          annotation: 'Step 2: Evaluate cost at the vertices.'
        },
        {
          expression: 'C_{min} = 29 \\text{ at } (7,3)',
          annotation: 'Step 3: The lowest cost is found at $(7,3)$—the point most "Opposite" to the direction of cost increase.'
        }
      ],
      conclusion: 'Survival math: often we want to minimize distance or cost while staying above a threshold of necessity.'
    },
  ],

  challenges: [
    {
      id: 'ch2-008-ch1',
      difficulty: 'hard',
      problem: '\\text{Analyze the system subject to: } x - y \\leq 1, \\; x \\geq 0, \\; y \\geq 0. \\\\ \\text{Why does } P = x+y \\text{ have NO maximum value here?}',
      hint: 'Graph the region. It is open at the top. Think about what happens as $x$ and $y$ both get larger and larger.',
      walkthrough: [
        {
          expression: '\\text{Feasible Region: } y \\geq x - 1',
          annotation: 'Step 1: The region is the entire area above the line $y=x-1$ in the first quadrant.'
        },
        {
          expression: 'P(x,y) \\to \\infty \\text{ as } y \\to \\infty',
          annotation: 'Step 2: Since $y$ has no upper bound, we can pick a larger $y$ forever, increasing $P$ without limit.'
        },
        {
          expression: '\\text{Conclusion: Unbounded region } \\implies \\text{ No Maximum}',
          annotation: 'Step 3: Linear Programming requires a "Container" to find a peak. Without a lid, the system is infinite.'
        }
      ],
      answer: 'The region is unbounded in the positive y-direction.'
    }
  ],
};
