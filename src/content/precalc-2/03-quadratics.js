export default {
  id: 'ch2-alg-003',
  slug: 'quadratics-completing-the-square',
  chapter: 'precalc-2',
  order: 3,
  title: 'Quadratics & Completing the Square',
  subtitle: 'The quadratic formula is not magic — it is completing the square, done once for all time',
  tags: ['quadratic', 'completing the square', 'quadratic formula', 'discriminant', 'vertex form', 'parabola'],
  aliases: 'quadratic formula completing square vertex form discriminant parabola roots real complex repeated',

  hook: {
    question: 'Where does the quadratic formula come from? Most students are handed it without explanation. It is actually a geometric argument — and seeing it makes the formula unforgettable.',
    realWorldContext: 'Quadratic equations model projectile motion, profit maximisation, lens optics, and electrical circuit resonance. The discriminant ($b^2 - 4ac$) tells engineers whether a system oscillates, is critically damped, or overdamped — before solving anything. In calculus, completing the square is the technique that makes certain integrals solvable by converting a quadratic into a perfect square form.',
  },

  intuition: {
    prose: [
      'A quadratic $ax^2 + bx + c$ is a parabola. Its vertex — the minimum or maximum point — is the geometric heart of the function. Vertex form $a(x-h)^2 + k$ makes the vertex $(h, k)$ immediately readable. Completing the square is the algebraic procedure that converts standard form into vertex form.',
      'The geometric intuition: $x^2 + bx$ is a square of side $x$ plus a rectangle of width $b$ and height $x$. To complete it into a perfect square, split the rectangle in half and attach one piece to each side of the square. The missing corner is a square of side $b/2$, area $(b/2)^2$. Add it in — and subtract it to keep the value the same. Now you have $(x + b/2)^2 - (b/2)^2$.',
      'The discriminant $b^2 - 4ac$ is not just a formula component — it is the quantity under the square root, telling you how far the vertex is from the $x$-axis. Positive: two real roots (vertex and $x$-axis are on opposite sides). Zero: one repeated root (vertex touches $x$-axis). Negative: no real roots (vertex does not reach the $x$-axis).',
      '**The Symmetry of Change**: Every parabola is perfectly symmetrical. The **Axis of Symmetry** is the vertical line passing through the vertex, dividing the path into mirror images. In physics, this represents the moment an object stops rising and begins to fall—the perfect midpoint of a journey through time and space.',
      '**Turning Points**: Unlike linear relationships that go in one direction forever, quadratics have a **Turning Point**. This vertex represents the absolute limit of the system—the maximum profit, the minimum fuel consumption, or the peak of a projectile’s flight.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Completing the square — geometric picture',
        body: 'x^2 + bx = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 \\\\ \\text{You add the missing corner square, then subtract it: net change = 0.}',
      },
      {
        type: 'definition',
        title: 'The discriminant and its meaning',
        body: '\\Delta = b^2 - 4ac \\\\ \\Delta > 0: \\text{ two distinct real roots} \\\\ \\Delta = 0: \\text{ one repeated real root (vertex on }x\\text{-axis)} \\\\ \\Delta < 0: \\text{ no real roots (complex conjugate pair)}',
      },
      {
        type: 'theorem',
        title: 'The three forms of a quadratic — when to use each',
        body: '\\text{Standard: } ax^2+bx+c \\quad \\text{(easy to find }y\\text{-intercept: it\'s }c\\text{)} \\\\ \\text{Vertex: } a(x-h)^2+k \\quad \\text{(easy to read vertex }(h,k)\\text{ and axis of symmetry)} \\\\ \\text{Factored: } a(x-r_1)(x-r_2) \\quad \\text{(easy to read roots }r_1, r_2\\text{)}',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Etymology of Square',
        body: '\\text{The word "Quadratic" comes from the Latin "Quadratum," meaning Square.} \\\\ \\text{The highest power is 2 because the relationship describes area—literally, the area of a square with side length } x.',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Midpoint Constraint',
        body: '\\text{Because of symmetry, the x-coordinate of the vertex (h) is ALWAYS the exact average of the roots.} \\\\ h = \\frac{r_1 + r_2}{2}. \\text{ This connects Vieta’s formulas directly to the geometry of the vertex.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Parabola of Gravity',
        body: '\\text{A ball thrown in the air follows a quadratic path } y = at^2 + vt + s. \\\\ \\text{The vertex is the maximum height, and the roots represent the time of launch and the time of impact.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Turning Point',
        body: '\\text{The vertex is a snapshot of Momentum in Transition.} \\\\ \\text{It is where the "speed" of the y-value hits zero before reversing direction. Look for where the slope mirrors itself.}',
      },
    ],
    visualizations: [
      {
        id: 'CompleteSquareViz',
        title: 'Completing the Square — Watch the Geometry',
        mathBridge: 'See how $x^2 + bx$ becomes a perfect square. The missing corner has area $(b/2)^2$. Drag $b$ to change the shape.',
        caption: 'Adding and subtracting $(b/2)^2$ is adding zero in disguise — it changes the form but not the value.',
      },
                            ],
  },

  math: {
    prose: [
      'The completing-the-square procedure for $ax^2 + bx + c$: first divide everything by $a$ to get a leading coefficient of 1. Then move $c/a$ to the other side. Add $(b/2a)^2$ to both sides. Factor the left side as a perfect square. Take the square root of both sides (both $\\pm$). Solve for $x$. This procedure, done in full generality, produces the quadratic formula.',
      'The vertex formula $h = -b/(2a)$ comes directly from completing the square: the vertex is at the $x$-value that makes $(x - h) = 0$, which is $x = h = -b/(2a)$. You do not need to memorise it separately from the quadratic formula — it is just the middle term of the formula without the $\\pm\\sqrt{\\Delta}$ part.',
      'Vieta\'s formulas connect the roots to the coefficients without solving: for $ax^2+bx+c = 0$ with roots $r_1, r_2$: $r_1 + r_2 = -b/a$ and $r_1 r_2 = c/a$. These are useful for checking solutions and for constructing quadratics with given roots.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The quadratic formula',
        body: 'ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      },
      {
        type: 'theorem',
        title: 'Vieta\'s formulas for quadratics',
        body: 'r_1 + r_2 = -\\frac{b}{a} \\qquad r_1 r_2 = \\frac{c}{a} \\\\ \\text{Example: roots of } x^2 - 5x + 6 = 0 \\text{ sum to } 5 \\text{ and multiply to } 6 \\Rightarrow r_1=2, r_2=3.',
      },
      {
        type: 'warning',
        title: 'The leading coefficient matters when completing the square',
        body: '2x^2 + 8x + 3: \\text{ factor out 2 first.} \\\\ 2(x^2 + 4x) + 3 = 2(x^2 + 4x + 4) + 3 - 8 = 2(x+2)^2 - 5 \\\\ \\text{Note: adding 4 inside the bracket adds } 2 \\times 4 = 8 \\text{ to the expression — subtract 8 outside.}',
      },
      {
        type: 'theorem',
        title: 'The Average of Roots Proof ($h = -b/2a$)',
        body: '\\text{By the Quadratic Formula, roots are } \\frac{-b}{2a} \\pm \\frac{\\sqrt{\\Delta}}{2a}. \\\\ \\text{The average is } h = \\frac{1}{2}\\left[\\left(\\frac{-b}{2a} + \\frac{\\sqrt{\\Delta}}{2a}\\right) + \\left(\\frac{-b}{2a} - \\frac{\\sqrt{\\Delta}}{2a}\\right)\\right] = -\\frac{b}{2a}. \\\\ \\text{The axis of symmetry is the center of the roots.}',
      },
      {
        type: 'theorem',
        title: 'Vieta\'s Algebraic Symmetries',
        body: 'ax^2+bx+c = a(x-r_1)(x-r_2) = a(x^2 - (r_1+r_2)x + r_1r_2). \\\\ \\text{Matching coefficients gives } -a(r_1+r_2) = b \\implies r_1+r_2 = -b/a \\text{ and } ar_1r_2 = c \\implies r_1r_2 = c/a.',
      },
    ],
  },

  rigor: {
    title: 'Deriving the quadratic formula by completing the square',
    proofSteps: [
      {
        expression: 'ax^2 + bx + c = 0',
        annotation: 'Start with the general quadratic equation.',
      },
      {
        expression: 'x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0',
        annotation: 'Divide through by $a$ (assumed nonzero) to make the leading coefficient 1.',
      },
      {
        expression: 'x^2 + \\frac{b}{a}x = -\\frac{c}{a}',
        annotation: 'Move the constant to the right side.',
      },
      {
        expression: 'x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = -\\frac{c}{a} + \\left(\\frac{b}{2a}\\right)^2',
        annotation: 'Add $(b/2a)^2$ to both sides. This is the "completing" step — we create the missing corner.',
      },
      {
        expression: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}',
        annotation: 'Left side is now a perfect square. Right side simplifies to $\\Delta / (4a^2)$ where $\\Delta = b^2 - 4ac$.',
      },
      {
        expression: 'x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2-4ac}}{2a}',
        annotation: 'Take the square root of both sides. The $\\pm$ is essential — both square roots are valid.',
      },
      {
        expression: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} \\qquad \\blacksquare',
        annotation: 'Subtract $b/(2a)$ from both sides. The quadratic formula is completing the square applied to the general case.',
      },
      {
        expression: '\\text{--- Part II: Completing the Square as Linear Transformation ---}',
        annotation: 'Let us see how vertex form is just a shift of the basic parabola $y = x^2$.',
      },
      {
        expression: 'f(x) = a(x^2 + \\frac{b}{a}x) + c',
        annotation: 'Start with standard form and factor $a$ out of the variable terms.',
      },
      {
        expression: '= a(x^2 + \\frac{b}{a}x + \\frac{b^2}{4a^2}) + c - \\frac{b^2}{4a}',
        annotation: 'Add and subtract the constant $(b/2a)^2$ adjusted by the scale factor $a$.',
      },
      {
        expression: '= a(x + \\frac{b}{2a})^2 + (c - \\frac{b^2}{4a})',
        annotation: 'The vertex $(h,k)$ is the horizontal shift $h = -b/2a$ and vertical shift $k = c - b^2/4a$.',
      },
      {
        expression: 'a(x-h)^2 + k \\qquad \\blacksquare',
        annotation: 'Algebraic structure determines geometric location. Every quadratic is a shifted and scaled unit parabola.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-003-ex1',
      title: 'Converting to vertex form',
      problem: '\\text{Write } f(x) = 2x^2 - 12x + 7 \\text{ in vertex form.}',
      steps: [
        {
          expression: '= 2(x^2 - 6x) + 7',
          annotation: 'Factor the coefficient of $x^2$ out of the first two terms only.',
        },
        {
          expression: '= 2(x^2 - 6x + 9) + 7 - 18',
          annotation: 'Add $(6/2)^2 = 9$ inside the bracket. Because of the factor of 2 outside, we added $2 \\times 9 = 18$ to the expression — subtract 18 outside to compensate.',
        },
        {
          expression: '= 2(x-3)^2 - 11',
          annotation: 'Vertex form. Vertex is at $(3, -11)$, which is the minimum (since $a = 2 > 0$).',
        },
      ],
      conclusion: 'The vertex $(h,k) = (3,-11)$ gives the minimum value, axis of symmetry $x = 3$, and tells you the parabola opens upward. All this information is invisible in standard form.',
    },
    {
      id: 'ch2-003-ex2',
      title: 'Using the discriminant before solving',
      problem: '\\text{Without solving, determine the nature of the roots of } 3x^2 - 5x + 4 = 0.',
      steps: [
        {
          expression: '\\Delta = b^2 - 4ac = 25 - 4(3)(4) = 25 - 48 = -23',
          annotation: 'Compute $\\Delta$ directly.',
        },
        {
          expression: '\\Delta = -23 < 0 \\Rightarrow \\text{no real roots}',
          annotation: 'Negative discriminant means the parabola does not intersect the $x$-axis. The roots exist but are complex conjugates.',
        },
      ],
      conclusion: 'The discriminant is a preliminary test — compute it before solving. It tells you how many solutions to expect and whether complex numbers are needed.',
    },
    {
      id: 'ch2-003-ex3',
      title: 'Constructing a quadratic from its roots — Vieta\'s formulas backwards',
      problem: '\\text{Find a monic quadratic with roots } r_1 = 3 + \\sqrt{2} \\text{ and } r_2 = 3 - \\sqrt{2}.',
      steps: [
        {
          expression: 'r_1 + r_2 = 6 \\qquad r_1 r_2 = (3+\\sqrt{2})(3-\\sqrt{2}) = 9 - 2 = 7',
          annotation: 'Compute sum and product of roots — no need to use the full values until the product step.',
        },
        {
          expression: 'x^2 - (r_1+r_2)x + r_1 r_2 = x^2 - 6x + 7',
          annotation: 'The monic quadratic with these roots is $x^2 - (\\text{sum})x + (\\text{product})$.',
        },
      ],
      conclusion: 'Irrational roots always come in conjugate pairs $p \\pm \\sqrt{q}$ when the coefficients are rational. Vieta\'s formulas let you reconstruct the quadratic directly from the roots.',
    },
    {
      id: 'ex-quad-projectile',
      title: 'Physics: Tracking a Projectile',
      problem: '\\text{A ball is thrown with height } h(t) = -5t^2 + 20t + 2. \\text{ Find the maximum height and the time it hits the ground.}',
      steps: [
        {
          expression: 't_{\\text{peak}} = -\\frac{b}{2a} = -\\frac{20}{2(-5)} = 2 \\text{ seconds}',
          annotation: 'Step 1: The maximum height occurs at the vertex. Use $t = -b/2a$.'
        },
        {
          expression: 'h(2) = -5(4) + 20(2) + 2 = -20 + 40 + 2 = 22 \\text{ meters}',
          annotation: 'Step 2: Substitute $t=2$ into the height function to find the peak.'
        },
        {
          expression: '0 = -5t^2 + 20t + 2 \\implies t = \\frac{-20 \\pm \\sqrt{400 - 4(-5)(2)}}{2(-5)} = \\frac{-20 \\pm \\sqrt{440}}{-10}',
          annotation: 'Step 3: Ground impact occurs when height $h(t) = 0$. Solve using the Quadratic Formula.'
        },
        {
          expression: 't \\approx \\frac{-20 - 20.98}{-10} \\approx 4.1 \\text{ seconds}',
          annotation: 'Step 4: Only the positive time root is physically meaningful.'
        }
      ],
      conclusion: 'The vertex is the peak of the journey, and the roots are the endpoints. Every projectile is a quadratic experiment.'
    },
    {
      id: 'ex-quad-profit',
      title: 'Economics: Profit Maximisation',
      problem: '\\text{A company\'s profit follows } P(x) = -x^2 + 100x - 1200, \\text{ where } x \\text{ is units sold. Find the "Break-Even" points and the optimal sales volume.}',
      steps: [
        {
          expression: '0 = -x^2 + 100x - 1200 \\implies x^2 - 100x + 1200 = 0',
          annotation: 'Step 1: Break-even is where $P(x) = 0$. Solve by factoring: $(x-20)(x-80) = 0$.'
        },
        {
          expression: 'x_{\\text{break-even}} = 20, 80 \\text{ units}',
          annotation: 'Step 2: These are the roots. Any sales between 20 and 80 result in profit.'
        },
        {
          expression: 'x_{\\text{opt}} = -\\frac{100}{2(-1)} = 50 \\text{ units}',
          annotation: 'Step 3: The vertex gives the maximum profit. $x=50$ is exactly half-way between 20 and 80.'
        }
      ],
      conclusion: 'The "sweet spot" of any quadratic system is its vertex. Symmetry ensures that the optimum is always perfectly balanced between the zero-points.'
    },
  ],

  challenges: [
    {
      id: 'ch2-003-ch1',
      difficulty: 'medium',
      problem: '\\text{Find the value of } k \\text{ so that } x^2 + kx + 25 = 0 \\text{ has exactly one real solution.}',
      hint: 'Exactly one solution means the discriminant equals zero.',
      walkthrough: [
        {
          expression: '\\Delta = k^2 - 4(1)(25) = 0',
          annotation: 'Set $\\Delta = 0$ for a repeated root.',
        },
        {
          expression: 'k^2 = 100 \\Rightarrow k = \\pm 10',
          annotation: 'Two values of $k$ work: the quadratic $x^2 + 10x + 25 = (x+5)^2$ and $x^2 - 10x + 25 = (x-5)^2$.',
        },
      ],
      answer: 'k = \\pm 10',
    },
    {
      id: 'ch2-003-ch2',
      difficulty: 'hard',
      problem: '\\text{A parabola has vertex } (2, -3) \\text{ and passes through } (5, 6). \\text{ Find its equation in standard form.}',
      hint: 'Start from vertex form $f(x) = a(x-2)^2 - 3$, then use the given point to find $a$.',
      walkthrough: [
        {
          expression: 'f(x) = a(x-2)^2 - 3',
          annotation: 'Vertex form with vertex $(2, -3)$.',
        },
        {
          expression: '6 = a(5-2)^2 - 3 = 9a - 3 \\Rightarrow a = 1',
          annotation: 'Substitute $(5, 6)$ and solve for $a$.',
        },
        {
          expression: 'f(x) = (x-2)^2 - 3 = x^2 - 4x + 1',
          annotation: 'Expand to standard form.',
        },
      ],
      answer: 'f(x) = x^2 - 4x + 1',
    },
    {
      id: 'ch2-003-ch3',
      difficulty: 'hard',
      problem: '\\text{A parabola has roots at } x = -1 \\text{ and } x = 5. \\text{ If the maximum value of the function is } 18, \\text{ find its standard form equation.}',
      hint: 'The x-coordinate of the vertex must be the midpoint of the roots. Once you have the vertex, use $y = a(x-h)^2 + k$ to find $a$.',
      walkthrough: [
        {
          expression: 'h = \\frac{-1 + 5}{2} = 2',
          annotation: 'Step 1: The vertex $x$ is the average of the roots.'
        },
        {
          expression: '\\text{Vertex} = (2, 18)',
          annotation: 'Step 2: The given "maximum value" is the $y$-coordinate of the vertex.'
        },
        {
          expression: '18 = a(5-2)^2 \\text{ (Relative to roots, use intercept form)} \\\\ f(x) = a(x+1)(x-5) \\implies 18 = a(2+1)(2-5)',
          annotation: 'Step 3: Substitute $(2, 18)$ into the factored form to solve for $a$.'
        },
        {
          expression: '18 = a(3)(-3) \\implies 18 = -9a \\implies a = -2',
          annotation: 'Step 4: Solve for the scale factor. The negative $a$ confirms it was a maximum.'
        },
        {
          expression: 'f(x) = -2(x+1)(x-5) = -2(x^2 - 4x - 5) = -2x^2 + 8x + 10',
          annotation: 'Step 5: Expand to standard form.'
        }
      ],
      answer: 'f(x) = -2x^2 + 8x + 10'
    }
  ],

  calcBridge: {
    teaser: 'In calculus, completing the square appears inside integrals of the form $\\int \\frac{1}{ax^2+bx+c}\\,dx$. The substitution that solves it requires the integrand to look like $\\frac{1}{(x-h)^2 + k^2}$, which is exactly vertex form. You cannot do this integral without completing the square first.',
    linkedLessons: ['trig-identities-deep-dive', 'logarithm-relationships'],
  },
}
