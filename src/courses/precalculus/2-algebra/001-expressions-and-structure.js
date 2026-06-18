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
      '**Where you are in the story:** You have just finished Precalc-1 (Graphs & Functions), where you plotted relationships and interpreted them visually. Now the chapter shifts: before we can work with any function algebraically — factorise it, solve it, simplify it — we need the raw vocabulary of algebra. This lesson names the pieces and establishes the rules that everything else depends on.',
      'A variable is not a mystery number waiting to be found. It is a placeholder — a name for a quantity that can change, or a quantity we have chosen not to specify yet. When you write $A = lw$, the variables $l$ and $w$ do not represent unknown lengths: they represent all possible lengths simultaneously. The formula works for any rectangle.',
      'An algebraic expression is a combination of numbers, variables, and operations — but no equals sign. $3x^2 - 5x + 7$ is an expression. It has a value for every value of $x$, but we have not asked what that value equals. An equation sets two expressions equal: $3x^2 - 5x + 7 = 0$ is now a question with specific answers.',
      'Every expression is made of terms — pieces separated by addition and subtraction. In $3x^2 - 5x + 7$, the terms are $3x^2$, $-5x$, and $7$. Each term has a coefficient (the number part: $3$, $-5$, $1$) and a variable part ($x^2$, $x$, none). Like terms share the same variable part and can be combined — $3x^2 + 2x^2 = 5x^2$ because you have 3 of something plus 2 of the same thing.',
      'The real number line is the geometric home of algebra. Every real number is a point. Operations move you along it: addition shifts right, subtraction shifts left, multiplication scales. Absolute value is distance from zero — always non-negative. Inequalities are intervals on this line.',
      '**The Grammar of Structure**: Think of algebra as a language. The **Variables** are nouns (the objects we are talking about), the **Operators** are verbs (the actions we take on them), and the **Structure** of the expression is the syntax. Just as you cannot have a sentence without a verb, you cannot have a meaningful algebraic relationship without an operation.',
      '**Where this is heading:** The vocabulary introduced here — terms, coefficients, the distributive property, the difference of squares — will be the exact tools used in the next lesson on Factoring. Every factoring technique is the distributive property in reverse.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc-2 arc — Lesson 1 of 8',
        body: '(Precalc-1: Graphs & Functions) | **Expressions & Algebraic Structure** | Factoring →',
      },
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
        type: 'insight',
        title: 'The distributive property — the engine of algebra',
        body: 'a(b + c) = ab + ac \\qquad \\text{This single rule justifies expanding, factoring, and combining.} \\\\ \\text{Everything else in algebra is either this rule or a rule about how numbers work.}',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Grammar of Math',
        body: '\\text{Variables = Nouns (the things)} \\\\ \\text{Operators = Verbs (the actions)} \\\\ \\text{Terms = Phrases (the units of meaning)} \\\\ \\text{Expressions = Sentences (the complete thought)}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Computational Pipeline',
        body: 'x \\xrightarrow{\\text{Square}} x^2 \\xrightarrow{\\times 3} 3x^2 \\xrightarrow{-5x+7} 3x^2 - 5x + 7 \\\\ \\text{An expression is just a set of ordered instructions for a computer.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Shifting Balance',
        body: '\\text{Addition +3 is a jump 3 units to the Right.} \\\\ \\text{Subtraction -x is a jump } x \\text{ units to the Left.} \\\\ \\text{The variable is the unknown length of your leap.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: Geometric Tiling',
        body: '\\text{The product } (x+1)(x+2) \\text{ is the area of a rectangle with sides } (x+1) \\text{ and } (x+2). \\\\ \\text{Expansion is just finding the area of the individual tiles.}',
      },
    ],
    visualizations: [
      {
        id: 'NumberLineViz',
        title: 'The Real Number Line — Algebra\'s Geometric Home',
        mathBridge: 'Before interacting, notice the number line with labeled points. Step 1: Drag the point labeled $a$ left and right — watch how its absolute value (distance from zero) updates. Step 2: Drag a second point $b$ and observe the interval $[a, b]$ shade in. Step 3: Toggle the "show operations" mode and drag $a$ — addition moves the point right, subtraction moves it left. The key lesson: every algebraic operation on a real number is a geometric movement on this line.',
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
      {
        type: 'theorem',
        title: 'The architectural identities',
        body: '\\text{Difference of Squares: } a^2 - b^2 = (a-b)(a+b) \\\\ \\text{This is the single most important identity for simplifying complex quotients.}',
      },
      {
        type: 'insight',
        title: 'The uniqueness of identity',
        body: '\\text{In any field, there is ONLY ONE 0 and ONLY ONE 1.} \\\\ \\text{This ensures that equations have singular targets of balance.}',
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
      {
        expression: '\\text{--- Part II: The Difference of Squares Geometric Proof ---}',
        annotation: 'Now, let us examine why $a^2 - b^2$ factors into $(a-b)(a+b)$.',
      },
      {
        expression: 'a^2 - b^2 = \\text{Area of a Large Square (side } a \\text{) minus a Small Square (side } b \\text{)}',
        annotation: 'Define the starting geometry: a square with a corner cut out.',
      },
      {
        expression: '\\text{Remaining Area} = (a-b)b + a(a-b)',
        annotation: 'Slice the remaining L-shape into two rectangles: one $b \\times (a-b)$ and one $a \\times (a-b)$.',
      },
      {
        expression: '= (a-b) [ b + a ]',
        annotation: 'Factor out the common width $(a-b)$. This is the Distributive Property in reverse.',
      },
      {
        expression: '= (a-b)(a+b) \\qquad \\blacksquare',
        annotation: 'The result is a single rectangle with dimensions $(a-b)$ and $(a+b)$. Verified by geometry.',
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
          hint: 'Identify which terms share the same variable part: $x^2$ terms go together, $x$ terms go together, constants go together.',
        },
        {
          expression: '7x^2 + 4x - 7',
          annotation: 'Add coefficients within each group. The variable parts stay unchanged.',
          hint: 'Add only the numerical coefficients: $5+2=7$, $-3+7=4$, $2-9=-7$. The variable attached stays the same.',
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
          hint: 'Treat the entire second binomial $(x+5)$ as a single unit and distribute each term of the first binomial across it.',
        },
        {
          expression: '= 2x^2 + 10x - 3x - 15',
          annotation: 'Distribute each term individually.',
          hint: '$2x \\cdot x = 2x^2$, $2x \\cdot 5 = 10x$, $-3 \\cdot x = -3x$, $-3 \\cdot 5 = -15$.',
        },
        {
          expression: '= 2x^2 + 7x - 15',
          annotation: 'Combine the like terms $10x - 3x = 7x$.',
          hint: 'Only $10x$ and $-3x$ are like terms. The $2x^2$ and $-15$ have no matching terms.',
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
          hint: 'Replace every $x$ with $0$. Any term containing $x$ becomes $0$, leaving only the constant.',
        },
        {
          expression: 'p(-1) = 3(1) - 2(-1) + 1 = 3 + 2 + 1 = 6',
          annotation: 'Substitute $x = -1$. Watch signs carefully with even/odd powers.',
          hint: '$(-1)^2 = 1$ (even power gives positive), $-2(-1) = +2$ (negative times negative is positive).',
        },
        {
          expression: 'p(a+1) = 3(a+1)^2 - 2(a+1) + 1 = 3a^2 + 4a + 2',
          annotation: 'Substitute $x = a+1$, expand $(a+1)^2 = a^2 + 2a + 1$, then simplify. This is how function composition works algebraically.',
          hint: 'Replace every $x$ with the block $(a+1)$. Then expand $(a+1)^2 = a^2+2a+1$, distribute the $-2$, and collect like terms.',
        },
      ],
      conclusion: 'Substituting an expression (not just a number) into a function is the foundation of the chain rule in calculus: $f(g(x))$ is exactly this idea.',
    },
    {
      id: 'ex-struct-pascal',
      title: 'Structural Expansion: Pascal\'s Shortcut',
      problem: '\\text{Expand } (2x + 1)^3 \\text{ using the Binomial Theorem coefficients (1, 3, 3, 1).}',
      steps: [
        {
          expression: '1(2x)^3(1)^0 + 3(2x)^2(1)^1 + 3(2x)^1(1)^2 + 1(2x)^0(1)^3',
          annotation: 'Step 1: Apply the 1-3-3-1 coefficients to the descending powers of $2x$ and ascending of $1$.',
          hint: 'The pattern for $(A+B)^3$ is: $1 \\cdot A^3 B^0 + 3 \\cdot A^2 B^1 + 3 \\cdot A^1 B^2 + 1 \\cdot A^0 B^3$. Here $A = 2x$ and $B = 1$.',
        },
        {
          expression: '1(8x^3) + 3(4x^2)(1) + 3(2x)(1) + 1(1)',
          annotation: 'Step 2: Evaluate the powers. $(2x)^3 = 8x^3$ and $(2x)^2 = 4x^2$.',
          hint: 'Compute each power of $2x$ carefully: $(2x)^3 = 2^3 x^3 = 8x^3$, $(2x)^2 = 4x^2$, $(2x)^1 = 2x$.',
        },
        {
          expression: '8x^3 + 12x^2 + 6x + 1',
          annotation: 'Step 3: Simplify the terms. Much faster than three rounds of FOIL.',
          hint: 'Multiply the binomial coefficients by the evaluated powers: $3 \\cdot 4x^2 = 12x^2$, $3 \\cdot 2x = 6x$.',
        },
      ],
      conclusion: 'Expansion is a predictable template. Learning the pattern avoids thousands of small mechanical errors.',
    },
    {
      id: 'ex-struct-sub',
      title: 'Substitution: The Chain Reaction',
      problem: '\\text{If } f(x) = x^2 - 4x, \\text{ find and simplify } f(a+h).',
      steps: [
        {
          expression: '(a+h)^2 - 4(a+h)',
          annotation: 'Step 1: Replace every instance of $x$ with the block $(a+h)$.',
          hint: 'Everywhere you see $x$ in the formula, substitute the entire expression $(a+h)$ — use parentheses to avoid sign errors.',
        },
        {
          expression: '(a^2 + 2ah + h^2) - 4a - 4h',
          annotation: 'Step 2: Expand the binomial and distribute the $-4$.',
          hint: 'Use $(A+B)^2 = A^2 + 2AB + B^2$ with $A=a$, $B=h$. Then distribute $-4$ across $(a+h)$.',
        },
        {
          expression: 'a^2 + 2ah + h^2 - 4a - 4h',
          annotation: 'Step 3: Collect like terms (no combinations possible here).',
          hint: 'Check each term for a matching variable part. Here there are no pairs to combine.',
        },
      ],
      conclusion: 'This is the most common move in First Semester Calculus. The result represents the system after a shift $h$.',
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
    {
      id: 'ch2-001-ch3',
      difficulty: 'hard',
      problem: '\\text{Factor } x^4 - 81 \\text{ completely using the Difference of Squares twice.}',
      walkthrough: [
        { expression: '(x^2 - 9)(x^2 + 9)', annotation: 'First pass: $a=x^2, b=9$.' },
        { expression: '(x-3)(x+3)(x^2 + 9)', annotation: 'Second pass: $(x^2-9)$ is another difference of squares. $(x^2+9)$ remains irreducible over the reals.' },
      ],
      answer: '(x-3)(x+3)(x^2+9)',
    },
    {
      id: 'ch2-001-ch4',
      difficulty: 'hard',
      problem: '\\text{Prove the Sum of Cubes identity: } a^3 + b^3 = (a+b)(a^2 - ab + b^2).',
      hint: 'Multiply the right side out and watch the "middle" terms cancel.',
      walkthrough: [
        {
          expression: 'a(a^2 - ab + b^2) + b(a^2 - ab + b^2)',
          annotation: 'Distribute each term of $(a+b)$ across the trinomial.',
        },
        {
          expression: '(a^3 - a^2b + ab^2) + (a^2b - ab^2 + b^3)',
          annotation: 'Expand. Notice the symmetrical pairs: $-a^2b$ vs $+a^2b$ and $+ab^2$ vs $-ab^2$.',
        },
        {
          expression: 'a^3 + b^3 \\qquad \\blacksquare',
          annotation: 'All middle terms cancel, leaving only the sum of cubes.',
        },
      ],
      answer: '\\text{Proven via distributive expansion.}',
    },
  ],

  crossRefs: [
    { slug: 'factoring-every-method', reason: 'Factoring is the distributive property in reverse — every technique builds directly on the expansion skills practised here.' },
    { slug: 'quadratics-completing-the-square', reason: 'Completing the square requires fluent expansion of $(x+k)^2$, a direct application of the algebraic identities from this lesson.' },
    { slug: 'rational-expressions-partial-fractions', reason: 'Simplifying rational expressions requires recognising difference-of-squares and other patterns from this lesson in both numerator and denominator.' },
  ],

  checkpoints: [
    'What is the difference between a term and a factor in an expression?',
    'Explain why $3x^2 + 2x$ cannot be combined into a single term.',
    'What does the distributive property say, and why is it the "engine" of algebra?',
    'Without expanding, what is the middle term of $(x + 5)^2$?',
    'Why does $(a+b)^2 \\neq a^2 + b^2$? Give a numerical counterexample.',
  ],

  semantics: {
    symbols: [
      { symbol: 'a_n', meaning: 'Coefficient of the $x^n$ term in a polynomial' },
      { symbol: '|x|', meaning: 'Absolute value of $x$ — distance from zero on the number line' },
      { symbol: 'p(x)', meaning: 'Polynomial function evaluated at $x$' },
      { symbol: '\\Delta', meaning: 'Discriminant $b^2 - 4ac$; determines nature of quadratic roots' },
    ],
    rulesOfThumb: [
      'Always check for like terms (same variable part) before declaring an expression simplified.',
      'Distribute a negative sign carefully — it changes the sign of every term inside the parentheses.',
      'The number of terms produced when multiplying two binomials is always 4 before combining.',
      'Constant terms survive substitution of $x=0$; all variable terms vanish.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Signed number arithmetic', where: 'Precalc-1 — real number operations', why: 'Sign errors in coefficients cascade through every algebraic manipulation.' },
      { topic: 'Order of operations', where: 'Precalc-1 — arithmetic review', why: 'Applying PEMDAS correctly is a prerequisite for evaluating expressions at specific values.' },
    ],
    futureLinks: [
      { topic: 'Factoring polynomials', where: 'Precalc-2 Lesson 2 — Factoring', why: 'Every factoring method is the distributive property applied in reverse to the structures introduced here.' },
      { topic: 'Difference quotient', where: 'Calculus — introduction to derivatives', why: 'The difference quotient $[f(x+h)-f(x)]/h$ requires expanding $f(x+h)$, exactly the substitution practised in Ex 5.' },
    ],
  },

  assessment: [
    {
      question: 'Simplify: $4x^2 - 7x + 3x^2 + 2x$',
      answer: '$7x^2 - 5x$',
      difficulty: 'quick-fire',
    },
    {
      question: 'Expand: $(x+4)(x-4)$',
      answer: '$x^2 - 16$',
      difficulty: 'quick-fire',
    },
    {
      question: 'If $f(x) = x^2 + 1$, find $f(3)$.',
      answer: '$10$',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'An expression is a machine: plug in $x$, get a value. No equals sign means no question yet.',
    'Like terms are terms with the identical variable part — only their coefficients get added.',
    'The distributive property is the one rule: $a(b+c) = ab + ac$. Everything follows from this.',
    '$(a+b)^2 = a^2 + 2ab + b^2$ — the middle term $2ab$ is the "cross rectangle" in the geometric proof.',
    'Substituting an expression like $(x+h)$ into $f$ is the algebraic form of function composition.',
  ],

  quiz: [
    {
      id: 'q-es-01',
      type: 'input',
      text: 'Simplify: $3x^2 - 5x + 2x^2 + 8x - 4$',
      answer: '5x^2 + 3x - 4',
      hints: ['Group terms with the same variable part: $x^2$ terms together, $x$ terms together, constants together.', 'Add coefficients within each group: $3+2=5$, $-5+8=3$, $-4$ stays.'],
      reviewSection: 'Intuition tab — like terms',
    },
    {
      id: 'q-es-02',
      type: 'choice',
      text: 'Which of the following is a correct expansion of $(x+3)^2$?',
      options: ['$x^2 + 9$', '$x^2 + 3x + 9$', '$x^2 + 6x + 9$', '$x^2 + 6x + 3$'],
      answer: '$x^2 + 6x + 9$',
      hints: ['$(a+b)^2 = a^2 + 2ab + b^2$. Identify $a=x$ and $b=3$.', 'The middle term is $2 \\cdot x \\cdot 3 = 6x$. The last term is $3^2 = 9$.'],
      reviewSection: 'Rigor tab — why $(a+b)^2 \\neq a^2+b^2$',
    },
    {
      id: 'q-es-03',
      type: 'input',
      text: 'Expand: $(2x-1)(3x+4)$',
      answer: '6x^2 + 5x - 4',
      hints: ['Use FOIL (or distribution): First $2x \\cdot 3x$, Outer $2x \\cdot 4$, Inner $-1 \\cdot 3x$, Last $-1 \\cdot 4$.', 'Combine the like terms: $8x - 3x = 5x$.'],
      reviewSection: 'Examples tab — expanding with the distributive property',
    },
    {
      id: 'q-es-04',
      type: 'choice',
      text: 'Which expression is NOT the same as $-(a - b)$?',
      options: ['$-a + b$', '$b - a$', '$-(a-b)$', '$-a - b$'],
      answer: '$-a - b$',
      hints: ['Distribute the negative sign: $-(a - b) = -a + b$.', '$-a - b$ would come from $-(a + b)$, not $-(a-b)$.'],
      reviewSection: 'Math tab — two classic expression errors',
    },
    {
      id: 'q-es-05',
      type: 'input',
      text: 'If $f(x) = 2x^2 - x + 3$, evaluate $f(-2)$.',
      answer: '13',
      hints: ['Substitute $x = -2$: $2(-2)^2 - (-2) + 3$.', '$(-2)^2 = 4$, so $2(4) = 8$. Then $8 + 2 + 3 = 13$.'],
      reviewSection: 'Examples tab — evaluating an expression',
    },
    {
      id: 'q-es-06',
      type: 'choice',
      text: 'What is the degree of the polynomial $5x^3 - 2x^4 + x - 7$?',
      options: ['3', '4', '1', '0'],
      answer: '4',
      hints: ['The degree is the highest power of $x$ in the polynomial.', 'The term $-2x^4$ has the highest power: $4$.'],
      reviewSection: 'Math tab — polynomial vocabulary',
    },
    {
      id: 'q-es-07',
      type: 'input',
      text: 'Factor using difference of squares: $x^2 - 49$',
      answer: '(x-7)(x+7)',
      hints: ['$a^2 - b^2 = (a-b)(a+b)$. Identify $a = x$ and $b = 7$.', '$49 = 7^2$, so this fits the pattern perfectly.'],
      reviewSection: 'Math tab — the architectural identities',
    },
    {
      id: 'q-es-08',
      type: 'choice',
      text: 'Which of the following are like terms?',
      options: ['$3x^2$ and $3x$', '$5xy$ and $5x^2y$', '$7ab$ and $-2ab$', '$4x$ and $4y$'],
      answer: '$7ab$ and $-2ab$',
      hints: ['Like terms must have the exact same variable part (same variables to the same powers).', '$7ab$ and $-2ab$ both have the variable part $ab$, so they are like terms.'],
      reviewSection: 'Intuition tab — like terms: same variable part, any coefficient',
    },
    {
      id: 'q-es-09',
      type: 'input',
      text: 'Expand and simplify: $(x+5)^2 - (x-5)^2$',
      answer: '20x',
      hints: ['Expand each square separately: $(x+5)^2 = x^2+10x+25$ and $(x-5)^2 = x^2-10x+25$.', 'Subtract: $(x^2+10x+25)-(x^2-10x+25)$. Distribute the minus sign, then cancel.'],
      reviewSection: 'Challenges — expand and simplify',
    },
    {
      id: 'q-es-10',
      type: 'choice',
      text: 'If $f(x) = x^2 - 3$, what is $f(a+1)$?',
      options: ['$a^2 - 2$', '$a^2 + 2a - 2$', '$a^2 + a - 2$', '$a^2 + 2a + 1 - 3$'],
      answer: '$a^2 + 2a - 2$',
      hints: ['Substitute $x = (a+1)$: $f(a+1) = (a+1)^2 - 3$.', 'Expand $(a+1)^2 = a^2 + 2a + 1$, then subtract $3$: $a^2 + 2a + 1 - 3 = a^2 + 2a - 2$.'],
      reviewSection: 'Examples tab — evaluating an expression',
    },
  ],
}
