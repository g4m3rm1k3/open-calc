export default {
  id: 'ch1-007',
  slug: 'function-modeling',
  chapter: 1,
  order: 13,
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
      '**Where you are in the story:** The previous lesson showed how the limit machinery you built through Chapter 1 leads directly to the derivative — the instantaneous rate of change. Now you use that same functional thinking for a different purpose: building the function itself before any calculus happens. This is the chapter\'s capstone skill. Every optimization problem in calculus begins here, with a model.',
      'Modeling has a four-step process every time. First, identify the quantity you want to express as a function — the output. Second, identify the variable(s) it depends on — the inputs. Third, use constraints to reduce to one variable. Fourth, state the domain explicitly, because the function only makes physical sense on a restricted interval. Think of it like building a machine: you decide what the machine produces (output), what knobs it has (inputs), what the physical limits are (constraints), and what range the knobs can actually turn (domain).',
      'Constraints are the bridge between multiple variables. If a rectangle has perimeter 400 m, then $2l + 2w = 400$, so $w = 200 - l$. Now area $A = lw = l(200-l)$ depends on only one variable. The constraint eliminated $w$. This reduction step is where most students get stuck — the algebra is straightforward once you see what to substitute.',
      'The domain is not optional. Area $A = l(200-l)$ is a parabola defined for all real $l$, but the problem only makes sense for $l \\in (0, 200)$ — both dimensions must be positive. Always ask: what values of the input are physically meaningful? That is your domain. A function without a domain is a blueprint with no instructions for which size screws to use.',
      '**Where this is heading:** Chapter 2 opens with derivatives. Every optimization problem you will encounter — minimizing cost, maximizing area, finding the most efficient shape — uses exactly the four-step process from this lesson, followed by differentiation. This lesson is the setup; Chapter 2 is the payoff.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1 arc — Lesson 13 of 13',
        body: '← Rate of Change (derivatives previewed) | **Modeling with Functions** | Chapter 2: Derivatives →',
      },
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
        mathBridge: 'Step 1: Look at the rectangle on the left panel and the area curve on the right — notice both update together as you drag. Step 2: Drag the length slider slowly from $l = 10$ toward $l = 100$. Watch the rectangle change shape and the area curve rise. Step 3: Continue past $l = 100$ toward $l = 190$. Watch the area fall even as $l$ grows — because $w = 200 - l$ is shrinking faster. Step 4: Identify where the peak of the area curve sits. The key lesson: the maximum area is not at the largest $l$ — it is at the $l$ that best balances length and width. That balance is exactly what calculus finds by setting $A\'(l) = 0$.',
        caption: 'The maximum area occurs at the critical point of the function — calculus finds what geometry suggests.',
      },
    ],
  },

  math: {
    prose: [
      'Revenue models combine price and quantity. If a company sells $x$ units at price $p(x) = 50 - 0.1x$ (demand decreases as quantity increases), then revenue $R(x) = x \\cdot p(x) = 50x - 0.1x^2$. This is a downward parabola — revenue increases up to a maximum, then decreases as price drops too far. Domain: $x \\geq 0$ and $p(x) \\geq 0$, so $x \\in [0, 500]$.',
      'Volume and surface area problems require geometry formulas as building blocks. A cylinder with radius $r$ and height $h$ has volume $V = \\pi r^2 h$ and surface area $S = 2\\pi r^2 + 2\\pi rh$. If you want to minimise material (surface area) for a fixed volume, set $V = k$ (the constraint), solve for $h = k/(\\pi r^2)$, and substitute into $S$ to get a one-variable function. The constraint does the substitution work; geometry provides the raw formulas.',
      'Composition appears naturally in modeling. If cost depends on the number of workers, and the number of workers depends on the time of year, then cost is a composition of two functions. Identifying when a model requires function composition versus a simple formula is part of building modeling fluency. The test: if the output of one function is the input to another, you are composing.',
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
    proofSteps: [
      {
        expression: '\\text{Output: Area } A. \\text{ Variables: length } l \\text{ and width } w.',
        annotation: 'Step 1 and 2: name the output and inputs.',
      },
      {
        expression: '\\text{Constraint: } 2l + 2w = 400 \\Rightarrow w = 200 - l',
        annotation: 'Step 3: write the perimeter constraint and solve for $w$. One constraint, one variable eliminated.',
      },
      {
        expression: 'A(l) = l(200 - l) = 200l - l^2 \\quad l \\in (0, 200)',
        annotation: 'Substitute $w$ into the area formula. Domain: both $l > 0$ and $w = 200 - l > 0$, so $l \\in (0, 200)$.',
      },
      {
        expression: "A'(l) = 200 - 2l = 0 \\Rightarrow l = 100",
        annotation: 'Step 4 (calculus): find the critical point by setting the derivative to zero.',
      },
      {
        expression: 'A(100) = 100(100) = 10000 \\text{ m}^2 \\qquad \\blacksquare',
        annotation: 'The maximum area is a 100×100 square. Among all rectangles with fixed perimeter, the square always has the largest area.',
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
          annotation: 'Revenue = quantity × price. Substitute the demand function for $p$.',
          hint: 'Revenue is always quantity times unit price. The demand function gives price as a function of how many units you sell.',
        },
        {
          expression: '\\text{Domain: } x \\geq 0 \\text{ and } p \\geq 0 \\Rightarrow 80-0.5x \\geq 0 \\Rightarrow x \\leq 160. \\text{ So } x \\in [0, 160].',
          annotation: 'Price cannot be negative — that gives the upper bound on quantity.',
          hint: 'Set $p(x) \\geq 0$ and solve. Selling more units than this would require charging a negative price, which is physically impossible.',
        },
        {
          expression: "R'(x) = 80 - x = 0 \\Rightarrow x = 80 \\text{ units}",
          annotation: 'Critical point: sell 80 units at price $p = 80 - 40 = \\$40$.',
          hint: 'Differentiate $R(x) = 80x - 0.5x^2$ with the power rule and set equal to zero.',
        },
        {
          expression: 'R(80) = 80(40) = \\$3200',
          annotation: 'Maximum revenue is $3200.',
          hint: 'Plug $x = 80$ back into the revenue function (or compute $80 \\times 40$ directly from the price at $x = 80$).',
        },
      ],
      conclusion: 'The revenue-maximising quantity is always at the midpoint of the demand range for a linear demand function. Here: $[0, 160]$ midpoint is $80$.',
    },
    {
      id: 'ch1-007-ex2',
      title: 'Box with open top — surface area minimisation',
      problem: 'A box with a square base and no top must have volume $32 \\text{ cm}^3$. Write surface area as a function of base side length $x$.',
      steps: [
        {
          expression: 'V = x^2 h = 32 \\Rightarrow h = \\frac{32}{x^2}',
          annotation: 'Volume constraint: solve for height $h$ in terms of base side $x$.',
          hint: 'The constraint is the fixed volume. Solve it for the variable you want to eliminate — here, height $h$.',
        },
        {
          expression: 'S = x^2 + 4xh = x^2 + 4x \\cdot \\frac{32}{x^2} = x^2 + \\frac{128}{x}',
          annotation: 'Surface area = base + four sides. No top. Substitute the constraint expression for $h$.',
          hint: 'An open-top box has one base ($x^2$) and four rectangular sides (each $x \\times h$, so $4xh$ total). No lid.',
        },
        {
          expression: '\\text{Domain: } x > 0 \\quad (\\text{side length must be positive})',
          annotation: '$S(x)$ is defined for all $x > 0$. As $x \\to 0^+$ or $x \\to \\infty$, $S \\to \\infty$ — so a minimum exists somewhere in $(0, \\infty)$.',
          hint: 'Physical lengths must be positive. Check behavior at both ends of the domain to confirm a minimum exists.',
        },
      ],
      conclusion: 'The function $S(x) = x^2 + 128/x$ has a minimum somewhere in $(0, \\infty)$. Setting $S\'(x) = 0$ gives $2x - 128/x^2 = 0 \\Rightarrow x^3 = 64 \\Rightarrow x = 4$ cm, with $h = 2$ cm.',
    },
    {
      id: 'ch1-007-ex3',
      title: 'Modeling with composition',
      problem: 'A spherical balloon is being inflated. The radius grows as $r(t) = 2\\sqrt{t}$ cm. Write volume as a function of time.',
      steps: [
        {
          expression: 'V(r) = \\tfrac{4}{3}\\pi r^3',
          annotation: 'Volume of a sphere in terms of radius — this is the outer function.',
          hint: 'Start with the formula for the quantity you want (volume). It is expressed in terms of an intermediate variable ($r$), not the ultimate input ($t$).',
        },
        {
          expression: 'V(t) = V(r(t)) = \\tfrac{4}{3}\\pi (2\\sqrt{t})^3 = \\tfrac{4}{3}\\pi \\cdot 8t^{3/2} = \\frac{32\\pi}{3} t^{3/2}',
          annotation: 'Compose: substitute $r(t) = 2\\sqrt{t}$ into $V(r)$. Simplify $(2\\sqrt{t})^3 = 8t^{3/2}$.',
          hint: 'Replace every $r$ in $V(r)$ with the expression $2\\sqrt{t}$. Then simplify the power: $(2\\sqrt{t})^3 = 2^3 \\cdot (t^{1/2})^3 = 8t^{3/2}$.',
        },
      ],
      conclusion: 'Volume as a function of time is $\\frac{32\\pi}{3} t^{3/2}$. Its derivative $\\frac{dV}{dt} = 16\\pi \\sqrt{t}$ gives the rate of inflation — which increases over time because the balloon\'s surface grows as it expands.',
    },
  ],

  challenges: [
    {
      id: 'ch1-007-ch1',
      difficulty: 'medium',
      problem: 'A Norman window (rectangle topped by semicircle) has perimeter 12 m. Write area as a function of the rectangle width $x$.',
      hint: 'The perimeter includes: two sides of height $h$, the bottom width $x$, and the semicircle of diameter $x$ (circumference $\\pi x/2$). Set up the perimeter equation first, solve for $h$, then substitute into the area formula.',
      walkthrough: [
        {
          expression: 'P = x + 2h + \\frac{\\pi x}{2} = 12 \\Rightarrow h = \\frac{12 - x - \\pi x/2}{2} = 6 - \\frac{x}{2} - \\frac{\\pi x}{4}',
          annotation: 'Write and solve the perimeter constraint for $h$. The semicircle contributes $\\frac{1}{2} \\cdot \\pi x$ to the perimeter (half the circumference of a circle with diameter $x$).',
        },
        {
          expression: 'A = xh + \\frac{\\pi}{2}\\left(\\frac{x}{2}\\right)^2 = xh + \\frac{\\pi x^2}{8}',
          annotation: 'Total area = rectangle area + semicircle area. Semicircle radius is $x/2$, so its area is $\\frac{1}{2}\\pi(x/2)^2 = \\frac{\\pi x^2}{8}$.',
        },
        {
          expression: 'A(x) = x\\left(6 - \\frac{x}{2} - \\frac{\\pi x}{4}\\right) + \\frac{\\pi x^2}{8} = 6x - \\frac{x^2}{2} - \\frac{\\pi x^2}{8}',
          annotation: 'Substitute the constraint expression and simplify. The $\\frac{\\pi x^2}{4}$ from expanding and $\\frac{\\pi x^2}{8}$ from the semicircle partially cancel to leave $-\\frac{\\pi x^2}{8}$.',
        },
      ],
      answer: 'A(x) = 6x - \\frac{x^2}{2} - \\frac{\\pi x^2}{8}',
    },
    {
      id: 'ch1-007-ch2',
      difficulty: 'hard',
      problem: 'A can (cylinder) must hold $500 \\text{ cm}^3$ of liquid. The top and bottom cost twice as much per cm² as the side. Write total cost as a function of the base radius $r$, then find the radius that minimises cost.',
      hint: 'Let cost per cm² of the side $= k$. Then cost per cm² of the top/bottom $= 2k$. Write total cost $C = 2k \\cdot (\\text{top area} + \\text{bottom area}) + k \\cdot (\\text{side area})$. Use the volume constraint to eliminate $h$.',
      walkthrough: [
        {
          expression: 'V = \\pi r^2 h = 500 \\Rightarrow h = \\frac{500}{\\pi r^2}',
          annotation: 'Constraint: fixed volume. Solve for $h$ to eliminate it.',
        },
        {
          expression: 'C(r) = 2k(2\\pi r^2) + k(2\\pi r h) = 4k\\pi r^2 + 2k\\pi r \\cdot \\frac{500}{\\pi r^2} = 4k\\pi r^2 + \\frac{1000k}{r}',
          annotation: 'Top + bottom cost $2k$ per cm²; side costs $k$ per cm². Substitute the constraint for $h$.',
        },
        {
          expression: "C'(r) = 8k\\pi r - \\frac{1000k}{r^2} = 0 \\Rightarrow r^3 = \\frac{1000}{8\\pi} = \\frac{125}{\\pi} \\Rightarrow r = \\left(\\frac{125}{\\pi}\\right)^{1/3}",
          annotation: 'Set $C\'(r) = 0$ and solve. The constant $k$ cancels — the optimal shape is independent of the actual cost per unit area.',
        },
      ],
      answer: 'r = \\left(\\dfrac{125}{\\pi}\\right)^{1/3} \\approx 3.41 \\text{ cm}',
    },
  ],

  crossRefs: [
    { slug: 'rate-of-change', reason: 'Rate of change is the calculus tool applied to the models built here' },
    { slug: '02-chain-rule', reason: 'Composition models (like balloon volume) require the chain rule to differentiate' },
    { slug: 'function-behaviour', reason: 'Finding maximum/minimum of the objective function uses curve analysis' },
  ],

  checkpoints: [
    'Can you write the four modeling steps from memory without looking?',
    'Given a word problem, can you identify the output, input(s), and constraint before writing any equations?',
    'Do you always state the domain and justify it physically, not just mathematically?',
    'Can you tell whether a model requires composition (chain rule) or a direct formula?',
  ],

  semantics: {
    symbols: [
      { symbol: 'A(l)', meaning: 'Area as a function of length — the objective function to optimize' },
      { symbol: 'R(x)', meaning: 'Revenue as a function of quantity sold' },
      { symbol: 'p(x)', meaning: 'Price per unit as a function of quantity — the demand function' },
      { symbol: 'V, S', meaning: 'Volume and surface area — geometry building blocks for 3D models' },
      { symbol: 'h = f(x)', meaning: 'Height expressed via the constraint — the variable you eliminate' },
    ],
    rulesOfThumb: [
      'Count your variables and constraints before writing any equations. Goal: (variables) − (constraints) = 1.',
      'Revenue = quantity × price. Cost = fixed + variable. Profit = revenue − cost.',
      'When two quantities appear, look for the geometry or physics equation that links them — that\'s your constraint.',
      'A domain without physical justification is incomplete. State why each bound holds.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Algebra — substitution', where: 'Precalc Chapter 1', why: 'Constraint elimination is just algebraic substitution; revisit if you freeze at step 3' },
      { topic: 'Geometry formulas', where: 'Precalc Chapter 3', why: 'Area, perimeter, volume, and surface area of standard shapes are prerequisites for any modeling problem' },
      { topic: 'Function composition', where: 'Precalc Chapter 2', why: 'Composing $V(r(t))$ requires fluency with function composition notation' },
    ],
    futureLinks: [
      { topic: 'Optimization (applied derivatives)', where: 'Chapter 2 — Derivatives', why: 'Every optimization problem uses this four-step modeling process plus setting the derivative to zero' },
      { topic: 'Related rates', where: 'Chapter 2 — Derivatives', why: 'Related rates problems are modeling + implicit differentiation; the setup phase is identical to what you practiced here' },
      { topic: 'Multivariable optimization', where: 'Calculus 3', why: 'When constraints can\'t reduce to one variable, Lagrange multipliers generalize the approach' },
    ],
  },

  assessment: [
    {
      question: 'A rectangle has area 64 cm². Write perimeter as a function of one side length $x$.',
      answer: '$P(x) = 2x + 128/x$, domain $x > 0$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'What is the constraint in the fence problem, and what variable does it eliminate?',
      answer: '$2l + 2w = 400$ eliminates $w$ (or $l$), reducing area to a function of one variable.',
      difficulty: 'quick-fire',
    },
    {
      question: 'If $r(t) = \\sqrt{t}$ and $V(r) = r^3$, write $V$ as a function of $t$.',
      answer: '$V(t) = t^{3/2}$. This is function composition: substitute $r(t)$ into $V(r)$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Four steps every time: name output → name inputs → apply constraint → state domain.',
    'One constraint eliminates one variable. Two constraints eliminate two variables.',
    'Revenue = quantity × price. The demand function is price — substitute it in.',
    'Domain = physical validity, not just algebraic existence. Lengths and radii must be positive.',
    'Composition = output of one process feeds into another. Recognize it by the dependency chain.',
  ],

  quiz: [
    {
      id: 'ch1-007-q1',
      type: 'input',
      text: 'A rectangle has perimeter 60 m. Write its area $A$ as a function of its length $l$.',
      answer: 'A(l) = l(30 - l)',
      hints: [
        'Use the perimeter constraint $2l + 2w = 60$ to solve for $w = 30 - l$.',
        'Then area $A = l \\cdot w = l(30 - l)$. Domain: $l \\in (0, 30)$.',
      ],
      reviewSection: 'Intuition tab — four-step modeling process',
    },
    {
      id: 'ch1-007-q2',
      type: 'choice',
      text: 'In the fence problem, why is the domain $(0, 200)$ rather than all real numbers?',
      options: [
        'The function $A(l) = l(200-l)$ is undefined outside this interval',
        'Both $l > 0$ and $w = 200 - l > 0$ must hold for the rectangle to exist',
        'The derivative is undefined outside this interval',
        'The perimeter constraint forces $l < 100$',
      ],
      answer: 'Both $l > 0$ and $w = 200 - l > 0$ must hold for the rectangle to exist',
      hints: [
        'The function $A(l)$ is mathematically defined for all $l$, but think about what it represents physically.',
        'Both dimensions of the rectangle must be positive. Set up the inequalities $l > 0$ and $200 - l > 0$.',
      ],
      reviewSection: 'Intuition tab — always state the domain',
    },
    {
      id: 'ch1-007-q3',
      type: 'input',
      text: 'A product sells at price $p = 100 - 2x$ dollars per unit. Write the revenue function $R(x)$.',
      answer: 'R(x) = 100x - 2x^2',
      hints: [
        'Revenue = quantity × price per unit.',
        '$R(x) = x \\cdot p(x) = x(100 - 2x) = 100x - 2x^2$.',
      ],
      reviewSection: 'Math tab — revenue models',
    },
    {
      id: 'ch1-007-q4',
      type: 'input',
      text: 'For the revenue function $R(x) = 100x - 2x^2$, what is the domain if price must be non-negative?',
      answer: '[0, 50]',
      hints: [
        'Set $p(x) = 100 - 2x \\geq 0$ and solve for $x$.',
        '$100 - 2x \\geq 0 \\Rightarrow x \\leq 50$. Combined with $x \\geq 0$: domain is $[0, 50]$.',
      ],
      reviewSection: 'Examples tab — revenue model from demand function',
    },
    {
      id: 'ch1-007-q5',
      type: 'input',
      text: 'A box with a square base (side $x$) and no lid has volume $V = x^2 h$. If $V = 32$, write $h$ in terms of $x$.',
      answer: 'h = 32/x^2',
      hints: [
        'The volume constraint is $x^2 h = 32$. Solve for $h$.',
        'Divide both sides by $x^2$: $h = 32/x^2$.',
      ],
      reviewSection: 'Examples tab — box with open top',
    },
    {
      id: 'ch1-007-q6',
      type: 'input',
      text: 'Using the constraint $h = 32/x^2$, write the surface area $S = x^2 + 4xh$ as a function of $x$ alone.',
      answer: 'S(x) = x^2 + 128/x',
      hints: [
        'Substitute $h = 32/x^2$ into $S = x^2 + 4xh$.',
        '$S = x^2 + 4x \\cdot \\frac{32}{x^2} = x^2 + \\frac{128}{x}$.',
      ],
      reviewSection: 'Examples tab — box with open top',
    },
    {
      id: 'ch1-007-q7',
      type: 'choice',
      text: 'If $r(t) = 3t$ and $V(r) = \\frac{4}{3}\\pi r^3$, which expression gives $V$ as a function of $t$?',
      options: [
        '$V(t) = \\frac{4}{3}\\pi t^3$',
        '$V(t) = 36\\pi t^3$',
        '$V(t) = \\frac{4}{3}\\pi (3t)^3 = 36\\pi t^3$',
        '$V(t) = \\frac{4}{3}\\pi \\cdot 3t^3$',
      ],
      answer: '$V(t) = \\frac{4}{3}\\pi (3t)^3 = 36\\pi t^3$',
      hints: [
        'Substitute $r = 3t$ into $V(r) = \\frac{4}{3}\\pi r^3$.',
        '$(3t)^3 = 27t^3$, so $V = \\frac{4}{3}\\pi \\cdot 27t^3 = 36\\pi t^3$.',
      ],
      reviewSection: 'Examples tab — modeling with composition',
    },
    {
      id: 'ch1-007-q8',
      type: 'input',
      text: 'How many variables remain after you apply one constraint to a two-variable model?',
      answer: '1',
      hints: [
        'Each constraint equation allows you to eliminate one variable.',
        'Two variables minus one constraint = one remaining variable.',
      ],
      reviewSection: 'Intuition tab — constraints always reduce variables',
    },
    {
      id: 'ch1-007-q9',
      type: 'input',
      text: 'For the fence problem $A(l) = 200l - l^2$, what value of $l$ maximises the area? (Use $A\'(l) = 0$.)',
      answer: '100',
      hints: [
        '$A\'(l) = 200 - 2l$. Set this equal to zero.',
        '$200 - 2l = 0 \\Rightarrow l = 100$.',
      ],
      reviewSection: 'Rigor tab — fence model walkthrough',
    },
    {
      id: 'ch1-007-q10',
      type: 'choice',
      text: 'A balloon\'s volume is $V(r) = \\frac{4}{3}\\pi r^3$ and its radius is $r(t) = 2\\sqrt{t}$. What type of model is $V(t)$?',
      options: [
        'A direct formula — $V$ depends on $t$ through a single equation',
        'A composed function — $V$ depends on $r$, which depends on $t$',
        'A constrained model — $t$ is eliminated using the volume formula',
        'A revenue model — output times input',
      ],
      answer: 'A composed function — $V$ depends on $r$, which depends on $t$',
      hints: [
        'Ask: does $V$ depend on $t$ directly, or through an intermediate variable?',
        '$V$ depends on $r$, and $r$ depends on $t$ — so $V$ is a composition $V(r(t))$.',
      ],
      reviewSection: 'Examples tab — modeling with composition',
    },
  ],
}
