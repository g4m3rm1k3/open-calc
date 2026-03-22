export default {
  id: 'logic-and-proofs',
  slug: 'logic-and-proofs',
  title: 'Logic & Proofs: The Language of Mathematics',
  tags: ['discrete-math', 'logic', 'proofs', 'induction', 'boolean'],
  chapter: 'discrete-1',
  order: 1.5,

  hook: {
    question: 'How do mathematicians know something is DEFINITELY true — not just true in a million examples?',
    context: `A computer checked the Collatz conjecture for every number up to 2⁶⁸. It's always true.
      But that doesn't PROVE it. Math requires certainty beyond any finite number of examples.
      Proof is how we achieve that. And logic is the grammar of proof.`,
    realWorld: `Boolean logic is the foundation of every digital circuit ever made.
      AND, OR, NOT gates implement the same operators you'll learn here.
      Proof-by-induction is how you verify recursive algorithms.
      Every "if-then" in your code is a logical implication.`,
  },

  intuition: {
    summary: `Logic gives us a precise language for making and checking arguments.
      Proof techniques are tools for building airtight logical arguments — each suited
      to different types of claims.`,
    perspectives: [
      {
        style: 'everyday',
        title: 'Logical Connectives in Plain English',
        explanation: `
          AND (∧): Both must be true. "I'll go if it's sunny AND warm."
          OR (∨): At least one true. "Tea or coffee?" — inclusive or.
          NOT (¬): Flips it. "Not raining" = "it's dry."
          IMPLIES (→): P→Q. "If it rains, I take an umbrella." FALSE only when P is true but Q is false.
          IFF (↔): Both directions. "I pass iff I study."`,
        visualizationId: 'TruthTableViz',
      },
      {
        style: 'CS-perspective',
        title: 'Boolean Algebra and De Morgan\'s Laws',
        explanation: `
          De Morgan's Laws are used CONSTANTLY in programming:
          ¬(P ∧ Q) = ¬P ∨ ¬Q   → NOT(A AND B) = (NOT A) OR (NOT B)
          ¬(P ∨ Q) = ¬P ∧ ¬Q   → NOT(A OR B) = (NOT A) AND (NOT B)

          Example in code: if (!(x > 0 && y > 0)) is the same as if (x <= 0 || y <= 0).
          Understanding this saves you from nested NOT bugs.`,
      },
      {
        style: 'proof-toolkit',
        title: 'Choosing Your Proof Strategy',
        explanation: `
          Direct proof: assume P, derive Q step by step. Use when the path is visible.
          Proof by Contradiction: assume ¬Q, derive a contradiction. Use for "there is no..."
          Proof by Contrapositive: prove ¬Q→¬P instead of P→Q. Same thing, sometimes easier.
          Proof by Induction: prove for n=1, then assume n=k → prove n=k+1. Use for all n ∈ ℕ claims.
          Proof by Cases: split into exhaustive cases, prove each. Use when cases have different behavior.`,
      },
    ],
  },

  math: {
    formalDefinition: `A logical argument is valid if whenever all premises are true, the conclusion must be true.
      An argument is sound if it is valid AND all premises are actually true.`,
    truthTables: {
      implication: [
        { P: 'T', Q: 'T', 'P→Q': 'T' },
        { P: 'T', Q: 'F', 'P→Q': 'F' },
        { P: 'F', Q: 'T', 'P→Q': 'T' },
        { P: 'F', Q: 'F', 'P→Q': 'T' },
      ],
      note: 'A false premise makes any implication vacuously true. "If pigs fly, I\'m the king of France" is technically true.',
    },
    quantifiers: [
      { symbol: '∀', name: 'For All', example: '∀x ∈ ℝ, x² ≥ 0' },
      { symbol: '∃', name: 'There Exists', example: '∃x ∈ ℝ, x² = 2' },
      { symbol: '∃!', name: 'There Exists Unique', example: '∃!x ∈ ℝ, x + 3 = 5' },
    ],
    negationRules: [
      { original: '\\forall x, P(x)', negation: '\\exists x, \\neg P(x)' },
      { original: '\\exists x, P(x)', negation: '\\forall x, \\neg P(x)' },
      { original: 'P \\rightarrow Q', negation: 'P \\land \\neg Q' },
    ],
  },

  rigor: {
    visualizationId: 'TruthTableViz',
    title: 'Proof by Strong Induction',
    proofSteps: [
      { expression: '\\text{Claim: Every integer } n \\geq 2 \\text{ has a prime factorization}', annotation: 'We\'ll prove this by strong induction.' },
      { expression: '\\text{Base: } n=2. \\text{ 2 is prime, so it IS its own factorization.}', annotation: 'Base case verified.' },
      { expression: '\\text{Inductive step: Assume true for all } 2 \\leq k < n.', annotation: 'Strong induction: assume the claim for ALL smaller values, not just n-1.' },
      { expression: '\\text{Case 1: } n \\text{ is prime} \\Rightarrow n \\text{ is its own factorization.}', annotation: 'Trivially true if n is prime.' },
      { expression: '\\text{Case 2: } n = a \\cdot b, \\text{ where } 2 \\leq a,b < n', annotation: 'If composite, n splits into two smaller factors.' },
      { expression: '\\text{By hypothesis, } a \\text{ and } b \\text{ both have prime factorizations.}', annotation: 'Apply strong induction hypothesis to a and b.' },
      { expression: '\\therefore n = a \\cdot b \\text{ has a prime factorization.} \\quad \\square', annotation: 'Combine them. By induction, every n≥2 has a prime factorization.' },
    ],
  },

  examples: [
    {
      id: 'dm-lp-ex1',
      title: 'Direct Proof: Even × Even = Even',
      problem: 'Prove: if m and n are even, then mn is even.',
      steps: [
        { expression: 'm = 2a, \\quad n = 2b \\quad \\text{for integers } a, b', annotation: 'Definition of even: divisible by 2.' },
        { expression: 'mn = (2a)(2b) = 4ab = 2(2ab)', annotation: 'Multiply and factor out 2.' },
        { expression: '\\therefore mn \\text{ is even} \\quad \\square', annotation: 'Since 2ab is an integer, mn is divisible by 2.' },
      ],
    },
    {
      id: 'dm-lp-ex2',
      title: 'Proof by Contradiction: √2 is Irrational',
      problem: 'Prove √2 cannot be expressed as p/q where p,q are integers with no common factors.',
      steps: [
        { expression: '\\text{Assume } \\sqrt{2} = \\frac{p}{q} \\text{ in lowest terms}', annotation: 'Suppose for contradiction that √2 IS rational.' },
        { expression: '2 = \\frac{p^2}{q^2} \\Rightarrow p^2 = 2q^2', annotation: 'Square both sides. So p² is even → p is even.' },
        { expression: 'p = 2k \\Rightarrow 4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2', annotation: 'Substitute p=2k. Now q² is even → q is even.' },
        { expression: 'p \\text{ and } q \\text{ both even} \\Rightarrow \\text{common factor 2}', annotation: 'Contradicts "lowest terms." Therefore √2 is irrational. ∎' },
      ],
    },
    {
      id: 'dm-lp-ex3',
      title: 'Induction: Sum of First n Integers',
      problem: 'Prove: 1 + 2 + 3 + ... + n = n(n+1)/2',
      steps: [
        { expression: 'n=1: \\text{ LHS}=1, \\text{ RHS}=\\frac{1 \\cdot 2}{2}=1 \\checkmark', annotation: 'Base case: n=1 works.' },
        { expression: '\\text{Assume: } 1+2+\\cdots+k = \\frac{k(k+1)}{2}', annotation: 'Inductive hypothesis for n=k.' },
        { expression: '1+2+\\cdots+k+(k+1) = \\frac{k(k+1)}{2} + (k+1)', annotation: 'Add the (k+1)th term to both sides.' },
        { expression: '= (k+1)\\left(\\frac{k}{2} + 1\\right) = \\frac{(k+1)(k+2)}{2}', annotation: 'Factor out (k+1). This matches the formula for n=k+1. ∎' },
      ],
    },
  ],

  challenges: [
    {
      id: 'dm-lp-c1',
      difficulty: 'medium',
      problem: 'Prove by contrapositive: if n² is even, then n is even.',
      hint: 'Contrapositive: if n is ODD, then n² is ODD. This is often easier to prove directly.',
      walkthrough: [
        { expression: '\\text{Contrapositive: } n \\text{ odd} \\Rightarrow n^2 \\text{ odd}', annotation: 'Rewrite as contrapositive. Same logical content, easier to prove.' },
        { expression: 'n = 2k+1 \\Rightarrow n^2 = 4k^2 + 4k + 1 = 2(2k^2+2k)+1', annotation: 'An odd number squared. Factor to show it\'s odd.' },
        { expression: '\\therefore n^2 \\text{ is odd} \\quad \\square', annotation: 'Contrapositive proven ⟹ original statement proven.' },
      ],
      answer: 'Proven by contrapositive: n odd ⟹ n² odd, so n² even ⟹ n even.',
    },
    {
      id: 'dm-lp-c2',
      difficulty: 'medium',
      problem: 'Negate this statement: ∀ students, ∃ a problem they cannot solve.',
      hint: 'To negate ∀, change to ∃. To negate ∃, change to ∀. Then negate the inner claim.',
      walkthrough: [
        { expression: '\\text{Original: } \\forall s, \\exists p, \\neg\\text{canSolve}(s,p)', annotation: 'Symbolize the original.' },
        { expression: '\\text{Negate: } \\exists s, \\forall p, \\text{canSolve}(s,p)', annotation: 'Flip each quantifier, negate the predicate.' },
        { expression: '\\text{"There exists a student who can solve every problem."}', annotation: 'In plain English. The negation is a claim about a single superstar student.' },
      ],
      answer: '∃ a student who can solve every problem.',
    },
  ],
}
