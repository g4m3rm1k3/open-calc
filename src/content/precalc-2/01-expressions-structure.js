export default {
  id: 'ch2-alg-001',
  slug: 'expressions-and-structure',
  chapter: 'precalc-2',
  order: 1,
  title: 'Expressions & Algebraic Structure',
  subtitle: 'What variables actually are, how algebra is organised, and why it works the way it does',
  tags: ['expressions', 'variables', 'terms', 'like terms', 'number line', 'algebra structure'],
  aliases: 'variable term coefficient constant like terms combining simplifying expression number line real numbers',

  hook: {
    question: 'A variable like $x$ looks like a mystery number — but it is really something deeper than that. What is it, exactly?',
    realWorldContext: 'Every formula in engineering is an algebraic expression: $F = ma$, $V = IR$, $PV = nRT$. These are not puzzles to solve — they are relationships between quantities. Understanding what variables and expressions mean structurally is the difference between applying a formula and understanding it well enough to rearrange, generalise, or spot when it breaks down.',
  },

  intuition: {
    prose: [
      'A variable is not a mystery number waiting to be found. It is a placeholder — a name for a quantity that can change, or a quantity we have chosen not to specify yet. When you write $A = lw$, the variables $l$ and $w$ do not represent unknown lengths: they represent all possible lengths simultaneously. The formula works for any rectangle.',
      'An algebraic expression is a combination of numbers, variables, and operations — but no equals sign. $3x^2 - 5x + 7$ is an expression. It has a value for every value of $x$, but we have not asked what that value equals. An equation sets two expressions equal: $3x^2 - 5x + 7 = 0$ is now a question with specific answers.',
      'Every expression is made of terms — pieces separated by addition and subtraction. In $3x^2 - 5x + 7$, the terms are $3x^2$, $-5x$, and $7$. Each term has a coefficient (the number part: $3$, $-5$, $1$) and a variable part ($x^2$, $x$, none). Like terms share the same variable part and can be combined — $3x^2 + 2x^2 = 5x^2$ because you have 3 of something plus 2 of the same thing.',
      'The real number line is the geometric home of algebra. Every real number is a point. Operations move you along it: addition shifts right, subtraction shifts left, multiplication scales. Absolute value is distance from zero — always non-negative. Inequalities are intervals on this line.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The anatomy of an expression',
        body: '\\underbrace{3}_{\\text{coeff}}\\underbrace{x^2}_{\\text{var part}} \\underbrace{-}_{\\text{sign}} \\underbrace{5}_{\\text{coeff}}\\underbrace{x}_{\\text{var part}} + \\underbrace{7}_{\\text{constant term}}',
      },
      {
        type: 'insight',
        title: 'Like terms: same variable part, any coefficient',
        body: '3x^2 + 2x^2 = 5x^2 \\quad \\text{but} \\quad 3x^2 + 2x \\text{ cannot be combined} \\\\ \\text{Analogy: 3 apples + 2 apples = 5 apples, but 3 apples + 2 oranges stay separate.}',
      },
      {
        type: 'definition',
        title: 'Expression vs equation vs inequality',
        body: '3x + 1 \\quad \\text{expression (no equals sign, has many values)} \\\\ 3x + 1 = 7 \\quad \\text{equation (a question: which } x\\text{ makes this true?)} \\\\ 3x + 1 > 7 \\quad \\text{inequality (which } x\\text{ makes this hold?)}',
      },
      {
        type: 'mnemonic',
        title: 'The distributive property — the engine of algebra',
        body: 'a(b + c) = ab + ac \\qquad \\text{This single rule justifies expanding, factoring, and combining.} \\\\ \\text{Everything else in algebra is either this rule or a rule about how numbers work.}',
      },
    ],
    visualizations: [
      {
        id: 'NumberLineViz',
        title: 'The Real Number Line — Algebra\'s Geometric Home',
        mathBridge: 'Every number is a point. Operations are movements. Absolute value is distance. Drag points and see algebra happen geometrically.',
        caption: 'The number line is where all of pre-calculus lives. Every inequality, root, and domain is a region on this line.',
      },
    ],
  },

  math: {
    prose: [
      'The real numbers have a precise structure. They are closed under addition, subtraction, multiplication, and (non-zero) division. They have two special elements: $0$ (additive identity, $a + 0 = a$) and $1$ (multiplicative identity, $a \\cdot 1 = a$). Every number $a$ has an additive inverse $-a$ and (if $a \\neq 0$) a multiplicative inverse $1/a$.',
      'Properties you use constantly without noticing: commutativity ($a + b = b + a$, $ab = ba$), associativity ($(a+b)+c = a+(b+c)$), and the distributive property ($a(b+c) = ab + ac$). These are not assumptions — they are provable from the axioms of the real numbers. In abstract algebra, structures that satisfy all these rules are called fields.',
      'The order of operations (PEMDAS/BODMAS) is a convention, not a mathematical law. Its purpose is to write expressions unambiguously without parentheses everywhere. Exponents bind tightest, then multiplication and division (left to right), then addition and subtraction (left to right).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Field properties of the real numbers',
        body: '\\text{Commutativity: } a+b=b+a,\\; ab=ba \\\\ \\text{Associativity: } (a+b)+c=a+(b+c),\\; (ab)c=a(bc) \\\\ \\text{Distributive: } a(b+c)=ab+ac \\\\ \\text{Identities: } a+0=a,\\; a\\cdot 1=a \\\\ \\text{Inverses: } a+(-a)=0,\\; a\\cdot\\frac{1}{a}=1 \\;(a\\neq 0)',
      },
      {
        type: 'warning',
        title: 'Two classic expression errors',
        body: '-(a+b) = -a - b \\quad \\text{NOT} \\quad -a + b \\\\ (a+b)^2 = a^2 + 2ab + b^2 \\quad \\text{NOT} \\quad a^2 + b^2',
      },
      {
        type: 'definition',
        title: 'Polynomial vocabulary',
        body: 'p(x) = a_n x^n + a_{n-1}x^{n-1} + \\cdots + a_1 x + a_0 \\\\ \\text{Degree: highest power } n. \\quad \\text{Leading term: } a_n x^n. \\quad \\text{Constant term: } a_0.',
      },
    ],
  },

  rigor: {
    title: 'Proof: why $(a+b)^2 \\neq a^2 + b^2$ — geometrically and algebraically',
    visualizationId: 'AlgebraSquareViz',
    proofSteps: [
      {
        expression: '(a+b)^2 = (a+b)(a+b)',
        annotation: 'Squaring means multiplying the expression by itself — not squaring each part separately.',
      },
      {
        expression: '= a(a+b) + b(a+b)',
        annotation: 'Distribute the left factor $(a+b)$ across the right.',
      },
      {
        expression: '= a^2 + ab + ba + b^2',
        annotation: 'Distribute again. Four terms arise from four pairwise products.',
      },
      {
        expression: '= a^2 + 2ab + b^2',
        annotation: 'Combine like terms: $ab + ba = 2ab$. The middle term $2ab$ is always present. Geometrically: it is the two rectangles of area $ab$ in a square of side $(a+b)$.',
      },
      {
        expression: '(a+b)^2 = a^2 + 2ab + b^2 \\neq a^2 + b^2 \\quad (\\text{unless } ab = 0) \\qquad \\blacksquare',
        annotation: 'The missing $2ab$ is the most common algebraic error. Skipping it loses real area — you can see it in the geometric proof.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-001-ex1',
      title: 'Simplifying by combining like terms',
      problem: '\\text{Simplify: } 5x^2 - 3x + 2 + 2x^2 + 7x - 9',
      steps: [
        {
          expression: '(5x^2 + 2x^2) + (-3x + 7x) + (2 - 9)',
          annotation: 'Group like terms: same variable part together.',
        },
        {
          expression: '7x^2 + 4x - 7',
          annotation: 'Add coefficients within each group. The variable parts stay unchanged.',
        },
      ],
      conclusion: 'Like terms combine by adding their coefficients. Non-like terms (different variable parts) are left separate.',
    },
    {
      id: 'ch2-001-ex2',
      title: 'Expanding with the distributive property',
      problem: '\\text{Expand: } (2x - 3)(x + 5)',
      steps: [
        {
          expression: '= 2x(x+5) - 3(x+5)',
          annotation: 'Distribute the first factor across the second.',
        },
        {
          expression: '= 2x^2 + 10x - 3x - 15',
          annotation: 'Distribute each term individually.',
        },
        {
          expression: '= 2x^2 + 7x - 15',
          annotation: 'Combine the like terms $10x - 3x = 7x$.',
        },
      ],
      conclusion: 'FOIL is just the distributive property applied twice. The name stands for First, Outer, Inner, Last — the four pairs produced.',
    },
    {
      id: 'ch2-001-ex3',
      title: 'Evaluating an expression — and connecting to function notation',
      problem: '\\text{Let } p(x) = 3x^2 - 2x + 1. \\text{ Find } p(0),\\; p(-1),\\; p(a+1).',
      steps: [
        {
          expression: 'p(0) = 3(0)^2 - 2(0) + 1 = 1',
          annotation: 'Substitute $x = 0$. The constant term is all that survives.',
        },
        {
          expression: 'p(-1) = 3(1) - 2(-1) + 1 = 3 + 2 + 1 = 6',
          annotation: 'Substitute $x = -1$. Watch signs carefully with even/odd powers.',
        },
        {
          expression: 'p(a+1) = 3(a+1)^2 - 2(a+1) + 1 = 3a^2 + 4a + 2',
          annotation: 'Substitute $x = a+1$, expand $(a+1)^2 = a^2 + 2a + 1$, then simplify. This is how function composition works algebraically.',
        },
      ],
      conclusion: 'Substituting an expression (not just a number) into a function is the foundation of the chain rule in calculus: $f(g(x))$ is exactly this idea.',
    },
  ],

  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'medium',
      problem: '\\text{Expand and simplify: } (x + 3)^2 - (x - 3)^2',
      hint: 'Expand each square using $(a+b)^2 = a^2 + 2ab + b^2$ and $(a-b)^2 = a^2 - 2ab + b^2$, then subtract.',
      walkthrough: [
        {
          expression: '(x^2 + 6x + 9) - (x^2 - 6x + 9)',
          annotation: 'Expand both squares. Note the sign change on the second.',
        },
        {
          expression: '= x^2 + 6x + 9 - x^2 + 6x - 9 = 12x',
          annotation: 'Distribute the minus sign, then cancel $x^2$ and the constants. Result is linear.',
        },
      ],
      answer: '12x',
    },
    {
      id: 'ch2-001-ch2',
      difficulty: 'hard',
      problem: '\\text{Show that } (a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3 \\text{ using the distributive property only.}',
      hint: 'Write $(a+b)^3 = (a+b)^2 \\cdot (a+b)$. You already know $(a+b)^2$.',
      walkthrough: [
        {
          expression: '(a+b)^3 = (a^2 + 2ab + b^2)(a+b)',
          annotation: 'Use the known expansion of $(a+b)^2$.',
        },
        {
          expression: '= a^3 + a^2 b + 2a^2 b + 2ab^2 + ab^2 + b^3',
          annotation: 'Distribute each term of $(a^2 + 2ab + b^2)$ across $(a+b)$.',
        },
        {
          expression: '= a^3 + 3a^2b + 3ab^2 + b^3 \\qquad \\blacksquare',
          annotation: 'Combine like terms. These are the binomial coefficients $\\binom{3}{0}, \\binom{3}{1}, \\binom{3}{2}, \\binom{3}{3} = 1,3,3,1$ — Pascal\'s triangle row 3.',
        },
      ],
      answer: 'a^3 + 3a^2b + 3ab^2 + b^3',
    },
  ],

  calcBridge: {
    teaser: 'In calculus, substituting $x + h$ into a function — computing $f(x+h)$ — is exactly this skill. The difference quotient $\\frac{f(x+h)-f(x)}{h}$ requires expanding expressions like $(x+h)^2$ and simplifying. Every derivative you compute starts here.',
    linkedLessons: ['limits-and-continuity', 'derivatives-introduction'],
  },
}
