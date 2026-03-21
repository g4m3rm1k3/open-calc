export default {
  id: 'ch0-functions',
  slug: 'functions',
  chapter: 0,
  order: 1,
  title: 'Functions',
  subtitle: 'Machines that take inputs and produce exactly one output',
  tags: ['functions', 'domain', 'range', 'composition', 'inverse', 'graphs', 'transformations', 'piecewise', 'even', 'odd'],

  hook: {
    question: 'Is the rule "for each person, give me their age" a function?',
    realWorldContext:
      'Yes — each person maps to exactly one age at any given moment. But "for each age, give me the person" is NOT a function — multiple people share the same age, so a single input (age 25) would need to produce multiple outputs. ' +
      'Functions are everywhere in mathematics and physics: your paycheck is a function of your hours worked, the height of a thrown ball is a function of time, the temperature at a location is a function of position, the current through a circuit is a function of voltage. ' +
      'All of differential and integral calculus is the study of how functions change and accumulate. ' +
      'Understanding functions deeply — their domains, transformations, compositions, and inverses — is the single most important prerequisite for everything that follows.',
    previewVisualizationId: 'FunctionMachine',
  },

  intuition: {
    prose: [
      'Think of a function as a machine with a single input slot and a single output slot. You feed in an input, and the machine reliably spits out exactly one output. Same input → same output, every time. No randomness, no ambiguity, no "it depends."',

      'The crucial word is **exactly one**. A machine that sometimes gives two different outputs for the same input is not a function. This is why a circle is not a function of x: for x = 0, a circle of radius 1 gives both y = 1 and y = −1.',

      'The **vertical line test** for graphs: draw every possible vertical line. If any vertical line intersects the graph at more than one point, the graph does not represent a function (because that x-value maps to multiple y-values).',

      'The set of all allowed inputs is called the **domain**. The set of all actual outputs is called the **range** (or image). These might be smaller than you expect: the function f(x) = x² has domain ℝ, but its range is [0, ∞) — you can never get a negative output by squaring a real number.',

      'We write **f : A → B** to say "f is a function from domain A to codomain B." We write **f(x) = [rule]** to specify the rule. The notation f(x) is read "f of x" — it means the output of the function f when given input x. It does NOT mean f times x.',

      'When no domain is stated, we use the **natural domain**: the largest set of real numbers for which the formula produces a well-defined real output. Three things can go wrong:',
      '1. **Division by zero**: exclude x values making the denominator zero.',
      '2. **Even roots of negatives**: the expression under √ (or ⁴√, ⁶√, etc.) must be ≥ 0.',
      '3. **Logarithm of a non-positive number**: log requires a strictly positive argument.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You Use Functions Every Day',
        body: 'Spreadsheet formulas (=SUM(A1:A5)), Google Maps routes (distance is a function of route), vending machines (press B3, get a snack) — these are all functions. You put something in, you get exactly one thing out. The math definition is the same idea, just more precise.',
      },
      {
        type: 'intuition',
        title: 'The Machine Metaphor',
        body: 'Input x → ⎡ f ⎤ → Output f(x). One input, one output. f(x) is a value, not a product.',
      },
      {
        type: 'warning',
        title: 'Common notation confusion',
        body: 'f(x) does NOT mean "f times x." The parentheses denote function application. Similarly, f(x+1) means "evaluate f at the input x+1" — do NOT simplify as f(x) + f(1) unless f is linear.',
      },
      {
        type: 'misconception',
        title: 'f(a + b) ≠ f(a) + f(b) in general',
        body: "This property (called additivity) is only true for LINEAR functions. For example, (a+b)² ≠ a² + b², and sin(a+b) ≠ sin(a) + sin(b). Don't distribute functions like they're multiplication!",
      },
    ],
    visualizationId: 'FunctionMachine',
    visualizationProps: {},
  },

  math: {
    prose: [
      'Given a function, the first questions to ask are: what is its domain? What is its range? How does its graph look?',

      '**Finding the natural domain**: set up inequalities to avoid all problems. If there is both a square root AND a denominator, both conditions must hold simultaneously (intersection of the constraint sets).',

      '**Even and odd functions** — these symmetries simplify calculus significantly:',
      '• A function is **even** if f(−x) = f(x) for all x in the domain. The graph is symmetric about the y-axis. Examples: f(x) = x², f(x) = cos x, f(x) = |x|.',
      '• A function is **odd** if f(−x) = −f(x) for all x in the domain. The graph is symmetric about the origin (180° rotational symmetry). Examples: f(x) = x³, f(x) = sin x, f(x) = x.',
      '• Most functions are neither even nor odd.',

      '**Composition** f ∘ g means "apply g first, then apply f to the result": (f ∘ g)(x) = f(g(x)). The output of g becomes the input to f. Composition is generally not commutative: f ∘ g ≠ g ∘ f.',

      '**Inverse functions**: f has an inverse f⁻¹ if and only if f is **one-to-one** (injective) — distinct inputs always produce distinct outputs. Graphically: the graph passes the horizontal line test. The inverse satisfies f⁻¹(f(x)) = x and f(f⁻¹(y)) = y. Geometrically, the graph of f⁻¹ is the reflection of the graph of f across the line y = x.',

      '**Graph transformations** — understanding these lets you graph complicated functions from simple ones:',
      '• y = f(x) + k: vertical shift UP by k',
      '• y = f(x) − k: vertical shift DOWN by k',
      '• y = f(x + h): horizontal shift LEFT by h (counterintuitive!)',
      '• y = f(x − h): horizontal shift RIGHT by h',
      '• y = af(x): vertical stretch by factor |a|; reflects over x-axis if a < 0',
      '• y = f(bx): horizontal compression by factor |b|; reflects over y-axis if b < 0',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Function (Formal)',
        body: 'A function f: A \\to B assigns to each x \\in A exactly one element f(x) \\in B. \\\\ \\text{Domain} = A, \\quad \\text{Range} = \\{f(x) : x \\in A\\} \\subseteq B',
      },
      {
        type: 'definition',
        title: 'Even and Odd',
        body: '\\text{Even: } f(-x) = f(x) \\text{ for all } x \\in \\text{dom}(f) \\\\ \\text{Odd: } f(-x) = -f(x) \\text{ for all } x \\in \\text{dom}(f)',
      },
      {
        type: 'definition',
        title: 'Inverse Function',
        body: 'f^{-1} \\text{ exists iff } f \\text{ is one-to-one.} \\\\ f^{-1}(f(x)) = x \\text{ for all } x \\in \\text{dom}(f) \\\\ f(f^{-1}(y)) = y \\text{ for all } y \\in \\text{range}(f)',
      },
    ],
    visualizationId: 'FunctionPlotter',
    visualizationProps: { fn: 'x^2', xRange: [-3, 3], showGrid: true },
  },

  rigor: {
    prose: [
      'In set theory, a function f : A → B is formally defined as a **relation** — a set of ordered pairs (x, y) with x ∈ A and y ∈ B — such that for each x ∈ A, there is **exactly one** y with (x, y) in the relation. No formula required.',

      'This allows us to speak of functions that have no closed-form expression. The **Dirichlet function** D: ℝ → ℝ defined by D(x) = 1 if x ∈ ℚ, D(x) = 0 if x ∉ ℚ, is a perfectly valid function. It is discontinuous at every single real number — impossible to draw, but rigorously well-defined.',

      'The precise taxonomy of functions is defined as follows:',
      '• **Injective (one-to-one)**: f(a) = f(b) ⟹ a = b. Different inputs always give different outputs.',
      '• **Surjective (onto)**: for every y ∈ B, there exists x ∈ A with f(x) = y. Every element of the codomain is hit.',
      '• **Bijective**: both injective and surjective. These are exactly the functions that have inverses.',

      'A bijection f : A → B means A and B have the same "size" (cardinality). This is how we formalize the idea that the real numbers in (0,1) are just as numerous as all of ℝ — there exists a bijection between them. Calculus uses bijections constantly when making substitutions.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Injective, Surjective, Bijective',
        body: '\\text{Injective: } f(a)=f(b) \\Rightarrow a=b \\\\ \\text{Surjective: } \\forall\\,y\\in B,\\;\\exists\\,x\\in A: f(x)=y \\\\ \\text{Bijective: injective AND surjective}',
      },
      {
        type: 'tip',
        title: 'Why injectivity is needed for inverses',
        body: 'If f(2) = f(3) = 5, then f⁻¹(5) would need to return both 2 and 3 simultaneously — impossible for a function (which must return exactly one value). One-to-one-ness is exactly the condition that prevents this.',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-domain',
      title: 'Finding the Natural Domain',
      problem: 'Find the domain of \\displaystyle f(x) = \\frac{\\sqrt{x + 3}}{x - 1}.',
      steps: [
        { expression: 'f(x) = \\frac{\\sqrt{x+3}}{x-1}', annotation: 'Two potential problems: a square root (requires non-negative argument) and division (requires nonzero denominator). Both conditions must hold simultaneously.' },
        { expression: '\\textbf{Condition 1 (square root):}\\quad x + 3 \\geq 0', annotation: 'The radicand must be non-negative.' },
        { expression: 'x \\geq -3', annotation: 'Subtract 3.' },
        { expression: '\\textbf{Condition 2 (denominator):}\\quad x - 1 \\neq 0', annotation: 'Denominator cannot be zero.' },
        { expression: 'x \\neq 1', annotation: '' },
        { expression: '\\textbf{Combine:}\\quad x \\geq -3 \\text{ AND } x \\neq 1', annotation: 'Both conditions must hold simultaneously — take the intersection.' },
        { expression: '\\text{Domain} = [-3,\\;1) \\cup (1,\\;+\\infty)', annotation: 'All x ≥ −3 with x = 1 punched out. Write as a union of two intervals.' },
      ],
      conclusion: 'Domain = [−3, 1) ∪ (1, +∞). Always solve for each constraint separately, then intersect. f(0) = √3/(-1) = −√3 is defined. f(1) is undefined (zero denominator). f(−4) is undefined (negative radicand).',
    },
    {
      id: 'ex-composition',
      title: 'Function Composition — Order Matters',
      problem: 'Let f(x) = x^2 + 1 and g(x) = 2x - 3. Compute (f \\circ g)(x), (g \\circ f)(x), and (f \\circ f)(x).',
      steps: [
        { expression: '(f \\circ g)(x) = f(g(x))', annotation: 'Apply g first, then f.' },
        { expression: '= f(\\underbrace{2x-3}_{\\text{this is the new input}})', annotation: 'g(x) = 2x−3 becomes the input to f.' },
        { expression: '= (2x-3)^2 + 1', annotation: 'Apply f: replace x in f(x) = x²+1 with the entire expression (2x−3).' },
        { expression: '= (4x^2 - 12x + 9) + 1', annotation: 'Expand (2x−3)²: use (a−b)² = a²−2ab+b² with a=2x, b=3.' },
        { expression: '= 4x^2 - 12x + 10', annotation: 'Simplify.' },
        { expression: '', annotation: '— Now reverse the order —' },
        { expression: '(g \\circ f)(x) = g(f(x)) = g(x^2+1)', annotation: 'Apply f first, then g.' },
        { expression: '= 2(x^2+1) - 3', annotation: 'Apply g: replace x in g(x) = 2x−3 with (x²+1).' },
        { expression: '= 2x^2 + 2 - 3 = 2x^2 - 1', annotation: 'Distribute and simplify.' },
        { expression: '', annotation: '— Composing f with itself —' },
        { expression: '(f \\circ f)(x) = f(f(x)) = f(x^2+1)', annotation: '' },
        { expression: '= (x^2+1)^2 + 1', annotation: 'Replace x with (x²+1) in f(x) = x²+1.' },
        { expression: '= x^4 + 2x^2 + 1 + 1 = x^4 + 2x^2 + 2', annotation: 'Expand (x²+1)² = x⁴+2x²+1.' },
      ],
      conclusion: 'f∘g ≠ g∘f: composition is generally NOT commutative. Notice how (f∘g)(x) = 4x²−12x+10 is completely different from (g∘f)(x) = 2x²−1.',
    },
    {
      id: 'ex-even-odd',
      title: 'Testing Even/Odd/Neither',
      problem: 'Classify each function as even, odd, or neither: (a) f(x) = x^4 - 3x^2,\\; (b) g(x) = x^3 + x^2,\\; (c) h(x) = x^5 - 2x.',
      steps: [
        { expression: '\\textbf{(a) } f(x) = x^4 - 3x^2', annotation: 'Compute f(−x).' },
        { expression: 'f(-x) = (-x)^4 - 3(-x)^2 = x^4 - 3x^2', annotation: '(−x)⁴ = x⁴ and (−x)² = x².' },
        { expression: 'f(-x) = f(x) \\implies \\textbf{even}', annotation: 'Passes even function test. Graph symmetric about y-axis.' },
        { expression: '', annotation: '' },
        { expression: '\\textbf{(b) } g(x) = x^3 + x^2', annotation: 'Compute g(−x).' },
        { expression: 'g(-x) = (-x)^3 + (-x)^2 = -x^3 + x^2', annotation: '(−x)³ = −x³, (−x)² = x².' },
        { expression: 'g(-x) = -x^3+x^2 \\neq g(x) = x^3+x^2', annotation: 'Not equal to g(x).' },
        { expression: '-g(x) = -(x^3+x^2) = -x^3-x^2 \\neq g(-x)', annotation: 'Also not equal to −g(x). Neither even nor odd.' },
        { expression: '\\implies \\textbf{neither}', annotation: '' },
        { expression: '', annotation: '' },
        { expression: '\\textbf{(c) } h(x) = x^5 - 2x', annotation: 'Compute h(−x).' },
        { expression: 'h(-x) = (-x)^5 - 2(-x) = -x^5 + 2x', annotation: '' },
        { expression: '-h(x) = -(x^5 - 2x) = -x^5 + 2x', annotation: '' },
        { expression: 'h(-x) = -h(x) \\implies \\textbf{odd}', annotation: 'h(−x) exactly equals −h(x). Graph has 180° rotational symmetry about origin.' },
      ],
      conclusion: '(a) even, (b) neither, (c) odd. Quick rule: a polynomial with only even-degree terms (x², x⁴, …) is even; only odd-degree terms (x, x³, x⁵, …) is odd; mixed degrees → neither (usually).',
    },
    {
      id: 'ex-transformations',
      title: 'Graphing via Transformations',
      problem: 'Starting from y = x^2, describe step-by-step how to graph y = -2(x+3)^2 + 1, identifying the vertex.',
      steps: [
        { expression: 'y = x^2', annotation: 'Start with the basic parabola. Vertex at (0, 0), opens upward, symmetric about y-axis.' },
        { expression: 'y = (x+3)^2', annotation: 'Replace x with (x+3): horizontal shift LEFT by 3. The "+3 inside" means left, because we need x+3 = 0 → x = −3. New vertex: (−3, 0).' },
        { expression: 'y = 2(x+3)^2', annotation: 'Multiply by 2: vertical STRETCH by factor 2. Parabola is now narrower (points are twice as far from x-axis). Vertex unchanged: (−3, 0).' },
        { expression: 'y = -2(x+3)^2', annotation: 'Multiply by −1 (the negative sign): REFLECT over x-axis. Parabola now opens DOWNWARD. Vertex unchanged: (−3, 0).' },
        { expression: 'y = -2(x+3)^2 + 1', annotation: 'Add 1: vertical shift UP by 1. Vertex moves to (−3, 1).' },
        { expression: '\\text{Final vertex: } (-3,\\; 1)', annotation: '' },
        { expression: '\\text{Opens downward, narrower than standard.}', annotation: '' },
      ],
      conclusion: 'The vertex form y = a(x−h)² + k gives: vertex at (h, k), opens up if a > 0, down if a < 0, narrower if |a| > 1, wider if 0 < |a| < 1. Here a = −2, h = −3, k = 1.',
    },
    {
      id: 'ex-piecewise',
      title: 'Evaluating and Graphing a Piecewise Function',
      problem: 'Let \\displaystyle f(x) = \\begin{cases} x^2 & x < 0 \\\\ 2x + 1 & 0 \\leq x < 3 \\\\ 7 & x \\geq 3 \\end{cases}. Evaluate f(-2), f(0), f(2), f(3), f(5). Then determine whether f is one-to-one.',
      steps: [
        { expression: 'f(-2): \\text{ Since } -2 < 0, \\text{ use } x^2.', annotation: '' },
        { expression: 'f(-2) = (-2)^2 = 4', annotation: '' },
        { expression: 'f(0): \\text{ Since } 0 \\leq 0 < 3, \\text{ use } 2x+1.', annotation: '' },
        { expression: 'f(0) = 2(0)+1 = 1', annotation: '' },
        { expression: 'f(2): \\text{ Since } 0 \\leq 2 < 3, \\text{ use } 2x+1.', annotation: '' },
        { expression: 'f(2) = 2(2)+1 = 5', annotation: '' },
        { expression: 'f(3): \\text{ Since } 3 \\geq 3, \\text{ use } 7.', annotation: '' },
        { expression: 'f(3) = 7', annotation: '' },
        { expression: 'f(5): \\text{ Since } 5 \\geq 3, \\text{ use } 7.', annotation: '' },
        { expression: 'f(5) = 7', annotation: '' },
        { expression: '\\textbf{One-to-one?}\\quad f(3) = f(5) = 7', annotation: 'Two different inputs (3 and 5) give the same output (7).' },
        { expression: '\\therefore\\; f \\text{ is NOT one-to-one.}', annotation: 'It fails the horizontal line test: the horizontal line y = 7 hits the graph at every x ≥ 3.' },
      ],
      conclusion: 'f is not one-to-one — the constant piece "7 for x ≥ 3" makes many inputs share the same output. For a function to have an inverse, every output must come from exactly one input.',
    },
    {
      id: 'ex-inverse',
      title: 'Finding an Inverse Function',
      problem: 'Find f^{-1}(x) for f(x) = \\dfrac{2x+1}{x-3}, and state its domain.',
      steps: [
        { expression: 'y = \\frac{2x+1}{x-3}', annotation: 'Replace f(x) with y.' },
        { expression: 'x = \\frac{2y+1}{y-3}', annotation: 'SWAP x and y. This is the key step that finds the inverse.' },
        { expression: 'x(y-3) = 2y+1', annotation: 'Multiply both sides by (y−3).' },
        { expression: 'xy - 3x = 2y + 1', annotation: 'Distribute x.' },
        { expression: 'xy - 2y = 3x + 1', annotation: 'Move all y-terms to the left, all non-y terms to the right.' },
        { expression: 'y(x - 2) = 3x + 1', annotation: 'Factor y from the left side.' },
        { expression: 'y = \\frac{3x+1}{x-2}', annotation: 'Divide by (x−2), valid when x ≠ 2.' },
        { expression: 'f^{-1}(x) = \\frac{3x+1}{x-2}, \\quad \\text{Domain: } x \\neq 2', annotation: 'Domain of f⁻¹ = range of f. Since f has a horizontal asymptote at y = 2, f never outputs 2, so x = 2 is excluded.' },
        { expression: '\\textbf{Verify:}\\; f(f^{-1}(x)) = f\\!\\left(\\frac{3x+1}{x-2}\\right) = \\frac{2\\cdot\\frac{3x+1}{x-2}+1}{\\frac{3x+1}{x-2}-3}', annotation: 'Check by plugging f⁻¹(x) into f.' },
        { expression: '= \\frac{\\frac{6x+2}{x-2}+\\frac{x-2}{x-2}}{\\frac{3x+1}{x-2}-\\frac{3(x-2)}{x-2}} = \\frac{\\frac{7x}{x-2}}{\\frac{7}{x-2}} = x\\;\\checkmark', annotation: 'Simplify over common denominator (x−2). Result is x. ✓' },
      ],
      conclusion: 'f⁻¹(x) = (3x+1)/(x−2), domain all x ≠ 2. The verification confirms the algebra is correct.',
    },
  ],

  challenges: [
    {
      id: 'ch0-f-c1',
      difficulty: 'easy',
      problem: 'Find the domain and range of f(x) = \\sqrt{4 - x^2}.',
      hint: 'Think geometrically: 4 − x² = (2−x)(2+x). What curve is y = √(4−x²)?',
      walkthrough: [
        { expression: '4 - x^2 \\geq 0', annotation: 'Need the radicand ≥ 0 for the square root to be defined.' },
        { expression: '(2-x)(2+x) \\geq 0', annotation: 'Factor as a difference of squares.' },
        { expression: '-2 \\leq x \\leq 2', annotation: 'Product ≥ 0 when both factors have the same sign. Sign analysis: (2−x) > 0 for x < 2; (2+x) > 0 for x > −2. Both positive on [−2, 2].' },
        { expression: '\\text{Domain} = [-2,\\; 2]', annotation: '' },
        { expression: 'y = \\sqrt{4-x^2} \\geq 0 \\text{ always (square root is non-negative)}', annotation: '' },
        { expression: '\\text{Maximum: at } x=0,\\; f(0) = \\sqrt{4} = 2', annotation: '' },
        { expression: '\\text{Minimum: at endpoints } x=\\pm 2,\\; f(\\pm 2) = 0', annotation: '' },
        { expression: '\\text{Range} = [0,\\; 2]', annotation: 'All values from 0 to 2 are achieved.' },
        { expression: '\\text{Note: } x^2 + y^2 = 4 \\text{ is a circle of radius 2.}', annotation: 'y = √(4−x²) is the UPPER semicircle — this explains the domain and range geometrically.' },
      ],
      answer: 'Domain: [−2, 2], Range: [0, 2]',
    },
    {
      id: 'ch0-f-c2',
      difficulty: 'medium',
      problem: 'Show that the composition of two odd functions is odd.',
      hint: 'Let f and g both be odd, so f(−x) = −f(x) and g(−x) = −g(x). Compute (f∘g)(−x) and compare to −(f∘g)(x).',
      walkthrough: [
        { expression: '\\text{Given: } f(-x) = -f(x) \\text{ and } g(-x) = -g(x)', annotation: 'Both f and g are odd.' },
        { expression: '(f \\circ g)(-x) = f(g(-x))', annotation: 'Definition of composition.' },
        { expression: '= f(-g(x))', annotation: 'Since g is odd: g(−x) = −g(x).' },
        { expression: '= -f(g(x))', annotation: 'Since f is odd: f(−u) = −f(u), applied with u = g(x).' },
        { expression: '= -(f \\circ g)(x)', annotation: 'By definition of f∘g.' },
        { expression: '\\therefore\\; (f \\circ g)(-x) = -(f \\circ g)(x) \\implies f \\circ g \\text{ is odd.}\\;\\blacksquare', annotation: '' },
      ],
      answer: 'Proved: composition of two odd functions is odd',
    },
    {
      id: 'ch0-f-c3',
      difficulty: 'hard',
      problem: 'Every function f: \\mathbb{R} \\to \\mathbb{R} can be written as the sum of an even function and an odd function. Find the decomposition for f(x) = e^x.',
      hint: 'Define E(x) = [f(x) + f(−x)]/2 and O(x) = [f(x) − f(−x)]/2. Verify E is even and O is odd, and that E + O = f.',
      walkthrough: [
        { expression: 'E(x) = \\frac{e^x + e^{-x}}{2} = \\cosh x', annotation: 'The even part. This is the hyperbolic cosine.' },
        { expression: 'O(x) = \\frac{e^x - e^{-x}}{2} = \\sinh x', annotation: 'The odd part. This is the hyperbolic sine.' },
        { expression: 'E(-x) = \\frac{e^{-x}+e^x}{2} = E(x)\\;\\checkmark', annotation: 'E is even.' },
        { expression: 'O(-x) = \\frac{e^{-x}-e^x}{2} = -\\frac{e^x-e^{-x}}{2} = -O(x)\\;\\checkmark', annotation: 'O is odd.' },
        { expression: 'E(x) + O(x) = \\frac{e^x+e^{-x}}{2} + \\frac{e^x-e^{-x}}{2} = \\frac{2e^x}{2} = e^x\\;\\checkmark', annotation: 'They sum to the original function.' },
      ],
      answer: 'eˣ = cosh(x) + sinh(x)',
    },
  ],

  crossRefs: [
    { lessonSlug: 'real-numbers', label: 'Previous: Real Numbers', context: 'Functions map real numbers to real numbers.' },
    { lessonSlug: 'trig-review', label: 'Next: Trigonometry', context: 'The sine and cosine are the most important functions in calculus.' },
    { lessonSlug: 'limits/introduction', label: 'See Also: Limits', context: 'Limits describe how functions behave near a point.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
