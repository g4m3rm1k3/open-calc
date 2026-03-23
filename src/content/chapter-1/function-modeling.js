export default {
  id: 'ch1-007',
  slug: 'function-modeling',
  chapter: 1,
  order: 7,
  title: 'Modeling with Functions: Building Equations from Real Situations',
  subtitle: 'Translating a word problem into a function is a skill — here is the systematic process',
  tags: ['modeling', 'function modeling', 'optimization', 'applied functions', 'word problems', 'domain', 'area', 'volume', 'revenue', 'constraint'],
  aliases: 'modeling functions word problems applied optimization area volume revenue constraint real world function building',

  hook: {
    question: 'A farmer has 400 m of fencing and wants to enclose the largest possible rectangular area. This is a calculus optimization problem — but the hard part is not the calculus. It is writing down the function to optimize in the first place.',
    realWorldContext: 'Every engineering problem starts with a model: a function that represents the quantity you care about in terms of variables you can control. A manufacturing engineer minimising material cost, a supply chain manager maximising throughput, a structural engineer minimising deflection — all are building and optimising functions. The modelling step determines whether the calculus even has a chance of giving the right answer.',
    previewVisualizationId: 'FunctionModelingViz',
  },

  intuition: {
    prose: [
      'Modeling has a four-step process every time. First, identify the quantity you want to express as a function — the output. Second, identify the variable(s) it depends on — the input(s). Third, use constraints to reduce to one variable if necessary. Fourth, state the domain explicitly, because the function only makes physical sense on a restricted interval.',
      'Constraints are the bridge between multiple variables. If a rectangle has perimeter 400 m, then $2l + 2w = 400$, so $w = 200 - l$. Now area $A = lw = l(200-l)$ depends on only one variable. The constraint eliminated $w$. This reduction step is where most students get stuck — the algebra is straightforward once you see what to substitute.',
      'The domain is not optional. Area $A = l(200-l)$ is a parabola defined for all real $l$, but the problem only makes sense for $l \\in (0, 200)$ — both dimensions must be positive. Always ask: what values of the input are physically meaningful? That is your domain.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'The four-step modeling process',
        body: '1.\\; \\text{Name the output: what are you finding a formula for?} \\\\ 2.\\; \\text{Name the input variable(s).} \\\\ 3.\\; \\text{Write any constraint equations and use them to eliminate variables.} \\\\ 4.\\; \\text{State the domain — what values are physically valid?}',
      },
      {
        type: 'insight',
        title: 'Constraints always reduce variables',
        body: '\\text{One constraint equation} \\Rightarrow \\text{eliminate one variable} \\\\ \\text{Two constraints} \\Rightarrow \\text{eliminate two variables} \\\\ \\text{Goal: one output expressed as one input.}',
      },
      {
        type: 'warning',
        title: 'Always state the domain',
        body: '\\text{Physical constraints create the domain.} \\\\ \\text{Length, width, radius} > 0 \\quad \\text{(no negative lengths)} \\\\ \\text{Probability} \\in [0,1] \\quad \\text{Revenue} \\geq 0 \\\\ \\text{A function without a domain is an incomplete model.}',
      },
    ],
    visualizations: [
      {
        id: 'FunctionModelingViz',
        title: 'Fence Problem — Watch the Area Function Build',
        mathBridge: 'Drag the length slider. See the rectangle reshape and the area function plot in real time. The constraint keeps the perimeter fixed at 400 m.',
        caption: 'The maximum area occurs at the critical point of the function — calculus finds what geometry suggests.',
      },
    ],
  },

  math: {
    prose: [
      'Revenue models combine price and quantity. If a company sells $x$ units at price $p(x) = 50 - 0.1x$ (demand decreases as quantity increases), then revenue $R(x) = x \\cdot p(x) = 50x - 0.1x^2$. This is a downward parabola — revenue increases up to a maximum, then decreases as price drops too far. Domain: $x \\geq 0$ and $p(x) \\geq 0$, so $x \\in [0, 500]$.',
      'Volume and surface area problems require geometry formulas as building blocks. A cylinder with radius $r$ and height $h$ has volume $V = \\pi r^2 h$ and surface area $S = 2\\pi r^2 + 2\\pi rh$. If you want to minimise material (surface area) for a fixed volume, set $V = k$ (the constraint), solve for $h = k/(\\pi r^2)$, and substitute into $S$ to get a one-variable function.',
      'Composition appears naturally in modeling. If cost depends on the number of workers, and the number of workers depends on the time of year, then cost is a composition of two functions. Identifying when a model requires function composition versus a simple formula is part of building modeling fluency.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Common model types',
        body: '\\text{Area/perimeter: } A = lw, \\; P = 2l+2w \\\\ \\text{Revenue: } R = x \\cdot p(x) \\quad (\\text{quantity} \\times \\text{price}) \\\\ \\text{Cylinder: } V = \\pi r^2 h, \\; S = 2\\pi r^2 + 2\\pi rh \\\\ \\text{Sphere: } V = \\tfrac{4}{3}\\pi r^3, \\; S = 4\\pi r^2',
      },
      {
        type: 'insight',
        title: 'When to use composition vs direct formula',
        body: 'f(g(x)) \\text{ when output of one process feeds into another.} \\\\ \\text{e.g. cost}(\\text{workers}(t)) \\text{ — cost depends on workers, workers depend on time.} \\\\ \\text{Direct: both variables are directly related by a single equation.}',
      },
    ],
  },

  rigor: {
    title: 'Building and optimising the fence model completely',
    visualizationId: 'FunctionModelingViz',
    proofSteps: [
      {
        expression: '\\text{Output: Area } A. \\text{ Variables: length } l \\text{ and width } w.',
        annotation: 'Step 1 and 2: name the output and inputs.',
      },
      {
        expression: '\\text{Constraint: } 2l + 2w = 400 \\Rightarrow w = 200 - l',
        annotation: 'Step 3: write the perimeter constraint and solve for $w$.',
      },
      {
        expression: 'A(l) = l(200 - l) = 200l - l^2 \\quad l \\in (0, 200)',
        annotation: 'Substitute into the area formula. Domain: both dimensions must be positive.',
      },
      {
        expression: "A'(l) = 200 - 2l = 0 \\Rightarrow l = 100",
        annotation: 'Find the critical point by setting the derivative to zero.',
      },
      {
        expression: 'A(100) = 100(100) = 10000 \\text{ m}^2 \\qquad \\blacksquare',
        annotation: 'The maximum area is a 100×100 square — the most efficient rectangle is always a square.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-007-ex1',
      title: 'Revenue model from a demand function',
      problem: 'A store sells $x$ units of a product at price $p = 80 - 0.5x$ dollars. Write the revenue function and find the quantity that maximises revenue.',
      steps: [
        {
          expression: 'R(x) = x \\cdot p(x) = x(80 - 0.5x) = 80x - 0.5x^2',
          annotation: 'Revenue = quantity × price. Substitute the demand function.',
        },
        {
          expression: '\\text{Domain: } x \\geq 0 \\text{ and } p \\geq 0 \\Rightarrow 80-0.5x \\geq 0 \\Rightarrow x \\leq 160. \\text{ So } x \\in [0, 160].',
          annotation: 'Price cannot be negative — that gives the upper bound on quantity.',
        },
        {
          expression: "R'(x) = 80 - x = 0 \\Rightarrow x = 80 \\text{ units}",
          annotation: 'Critical point: sell 80 units at price $p = 80 - 40 = \\$40$.',
        },
        {
          expression: 'R(80) = 80(40) = \\$3200',
          annotation: 'Maximum revenue is $3200.',
        },
      ],
      conclusion: 'The revenue-maximising quantity is always at the midpoint of the demand range for a linear demand function. Here: $[0, 160]$ midpoint is $80$.',
    },
    {
      id: 'ch1-007-ex2',
      title: 'Box with open top — surface area minimisation',
      problem: '\\text{A box with a square base and no top must have volume } 32 \\text{ cm}^3. \\text{ Write surface area as a function of base side length } x.',
      steps: [
        {
          expression: 'V = x^2 h = 32 \\Rightarrow h = \\frac{32}{x^2}',
          annotation: 'Volume constraint: solve for height $h$ in terms of base side $x$.',
        },
        {
          expression: 'S = x^2 + 4xh = x^2 + 4x \\cdot \\frac{32}{x^2} = x^2 + \\frac{128}{x}',
          annotation: 'Surface area = base + four sides. No top. Substitute the constraint.',
        },
        {
          expression: '\\text{Domain: } x > 0 \\quad (\\text{side length must be positive})',
          annotation: '$S(x)$ is defined for all $x > 0$. As $x \\to 0^+$ or $x \\to \\infty$, $S \\to \\infty$.',
        },
      ],
      conclusion: 'The function $S(x) = x^2 + 128/x$ has a minimum somewhere in $(0, \\infty)$. Setting $S\'(x) = 0$ gives $x = \\sqrt[3]{64} = 4$ cm, with $h = 2$ cm.',
    },
    {
      id: 'ch1-007-ex3',
      title: 'Modeling with composition',
      problem: 'A spherical balloon is being inflated. The radius grows as $r(t) = 2\\sqrt{t}$ cm. Write volume as a function of time.',
      steps: [
        {
          expression: 'V(r) = \\tfrac{4}{3}\\pi r^3',
          annotation: 'Volume of a sphere in terms of radius.',
        },
        {
          expression: 'V(t) = V(r(t)) = \\tfrac{4}{3}\\pi (2\\sqrt{t})^3 = \\tfrac{4}{3}\\pi \\cdot 8t^{3/2} = \\frac{32\\pi}{3} t^{3/2}',
          annotation: 'Compose: substitute $r(t)$ into $V(r)$.',
        },
      ],
      conclusion: 'Volume as a function of time is $\\frac{32\\pi}{3} t^{3/2}$. Its derivative $\\frac{dV}{dt} = 16\\pi \\sqrt{t}$ gives the rate of inflation — which increases over time.',
    },
  ],

  challenges: [
    {
      id: 'ch1-007-ch1',
      difficulty: 'medium',
      problem: '\\text{A Norman window (rectangle topped by semicircle) has perimeter 12 m. Write area as a function of the rectangle width } x.',
      hint: 'The perimeter includes: two sides of height $h$, the bottom width $x$, and the semicircle of diameter $x$ (circumference $\\pi x/2$).',
      walkthrough: [
        {
          expression: 'P = x + 2h + \\frac{\\pi x}{2} = 12 \\Rightarrow h = \\frac{12 - x - \\pi x/2}{2} = 6 - \\frac{x}{2} - \\frac{\\pi x}{4}',
          annotation: 'Write and solve the perimeter constraint for $h$.',
        },
        {
          expression: 'A = xh + \\frac{\\pi}{2}\\left(\\frac{x}{2}\\right)^2 = xh + \\frac{\\pi x^2}{8}',
          annotation: 'Area = rectangle + semicircle. Semicircle radius is $x/2$.',
        },
        {
          expression: 'A(x) = x\\left(6 - \\frac{x}{2} - \\frac{\\pi x}{4}\\right) + \\frac{\\pi x^2}{8} = 6x - \\frac{x^2}{2} - \\frac{\\pi x^2}{8}',
          annotation: 'Substitute and simplify. Domain: $x > 0$ and $h > 0$.',
        },
      ],
      answer: 'A(x) = 6x - \\frac{x^2}{2} - \\frac{\\pi x^2}{8}',
    },
  ],

  calcBridge: {
    teaser: 'Modeling is the setup for optimisation — which is one of the two core applications of derivatives in calculus (the other is related rates). Every optimization problem in Calc 1 follows exactly this four-step process: write the objective function, apply the constraint, reduce to one variable, then differentiate and find the critical point.',
    linkedLessons: ['rate-of-change', 'function-behaviour'],
  },
}
