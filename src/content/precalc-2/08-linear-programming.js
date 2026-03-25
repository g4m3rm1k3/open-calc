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
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: 'Linear Programming',
        props: { videoId: "pre-7-6" },
      },
      {
        id: 'VideoEmbed',
        title: 'Systems of Inequalities',
        props: { videoId: "pre-7-5" },
      },
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
    ],
  },

  examples: [
    {
      id: 'ch2-008-ex1',
      title: 'Maximizing profit with two variables',
      problem: '\\text{Maximize } P = 3x + 2y \\text{ subject to: } \\\\ x + 2y \leq 4, \quad x - y \leq 1, \quad x \geq 0, \quad y \geq 0.',
      steps: [
        { expression: '\\text{Vertices: } (0,0), (1,0), (2,1), (0,2)', annotation: 'Graphing reveals the vertices. $(2,1)$ is the intersection of $x+2y=4$ and $x-y=1$.' },
        { expression: 'P(0,0)=0, \\quad P(1,0)=3, \\quad P(2,1)=3(2)+2(1)=8, \\quad P(0,2)=4', annotation: 'Plug each vertex into $P = 3x + 2y$.' },
        { expression: 'P_{max} = 8 \\text{ at } (2,1)', annotation: 'Compare the values.' },
      ],
      conclusion: 'The maximum profit of 8 is achieved by producing 2 units of $x$ and 1 unit of $y$.',
    },
  ],
};
