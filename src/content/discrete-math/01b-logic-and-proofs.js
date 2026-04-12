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
    prose: [
      `### What Logic Actually Is

Most people think of logic as "being smart" or "thinking clearly." That's not wrong, but mathematics needs something sharper: a precise language where every statement has an unambiguous truth value, and where you can chain statements together in ways that are guaranteed to preserve truth.

Think of it like this. In everyday conversation, the sentence "You can have cake or pie" usually means one or the other, but not both. In logic, "or" means at least one — possibly both. That tiny ambiguity in English becomes chaos in a proof. Logic eliminates the ambiguity entirely.

A **proposition** is the simplest possible thing: a statement that is either True or False. Not maybe, not probably — exactly one of two values.

- "2 + 2 = 4" → True
- "The sky is green" → False  
- "This statement is false" → Not a proposition (it's a paradox — logic doesn't allow self-reference)

Everything in formal logic is built from propositions, connected by **logical connectives** — the glue that assembles simple statements into complex ones.`,

      `### The Five Connectives You Need

**NOT (¬)** is the simplest. It flips the truth value. If P is "it is raining," then ¬P is "it is not raining." If P is True, ¬P is False. If P is False, ¬P is True. That's the entire definition.

**AND (∧)** requires both. P ∧ Q is True only when P is True AND Q is True simultaneously. One false ingredient poisons the whole thing. "I will pass if I study AND attend class" — skip either one and you fail.

**OR (∨)** requires at least one. P ∨ Q is True when P is True, or Q is True, or both are True. It's only False when both are False. This is called *inclusive or* — it includes the case where both are true. (English "or" is often exclusive — "coffee or tea?" — but logic uses inclusive.)

**IMPLIES (→)** is the most important and the most misunderstood. P → Q means "if P then Q." The only way an implication is False is when P is True but Q is False — when the premise is met but the conclusion fails. Concretely: "If it rains, I carry an umbrella." This promise is only broken if it actually rains and I don't carry an umbrella.

What trips people up: if P is False, the implication is True regardless of Q. "If pigs fly, I'll give you a million dollars." Since pigs don't fly, I haven't broken any promise — the statement is vacuously True. This feels weird but it's logically necessary. A conditional is a promise, and you can only break a promise when the condition is met.

**IFF (↔)** — "if and only if" — is a two-way implication. P ↔ Q means P → Q and also Q → P. Both directions must hold. "I pass iff I study" means: if I study I pass, AND if I pass it means I studied.`,

      `### Truth Tables: The Multiplication Tables of Logic

A truth table is an exhaustive inventory. For any logical expression involving n variables, there are 2ⁿ possible combinations of True/False values, and a truth table lists them all with the expression's value for each.

With 2 variables (P and Q) there are 4 rows. With 3 variables there are 8 rows. Truth tables are finite, mechanically completable, and leave nothing to chance — which is exactly what makes them powerful. They can definitively prove that two expressions are equivalent, or that one is always true (a tautology), or always false (a contradiction).`,

      `### The Connective You Must Get Right: Implication

The implication P → Q deserves its own section because it's the backbone of almost every proof you'll ever write.

Here's the key insight: an implication says nothing about *why* things are connected. It only says: whenever P is true, Q is also true. The cause doesn't matter. The mechanism doesn't matter. Just the correlation.

Think of it as a filter. Every time you see P is True, you look at Q. If Q is also True, the filter passes. The implication is only violated — marked False — when the filter catches a case where P is True and Q is False.

This is why False → True and False → False are both marked True. A false premise triggers the filter, but since P was never True to begin with, the implication was never tested. It never had a chance to be violated.

The contrapositive (¬Q → ¬P) is logically identical to the original (P → Q). This is not an approximation — they have exactly the same truth table. This identity is the foundation of proof-by-contrapositive.`,

      `### De Morgan's Laws: The Logic of Negation

De Morgan's Laws tell you how negation distributes over AND and OR:

¬(P ∧ Q) = ¬P ∨ ¬Q  
¬(P ∨ Q) = ¬P ∧ ¬Q

In plain English: "NOT (both P and Q)" is the same as "NOT P or NOT Q." "NOT (P or Q)" is the same as "NOT P and NOT Q."

You use these constantly in programming:

\`\`\`
if (!(x > 0 && y > 0))
\`\`\`
is identical to:
\`\`\`
if (x <= 0 || y <= 0)
\`\`\`

When you're optimizing conditionals, refactoring nested NOTs, or simplifying boolean logic in circuits, De Morgan's Laws are the tool. Memorize them the way you memorized multiplication tables.`,

      `### Quantifiers: From One Statement to Infinitely Many

So far our propositions have been specific — they're either True or False as stated. But mathematics needs to make claims about entire sets of objects: "every even number is divisible by 2," "there exists a prime larger than a billion," "for all triangles, the angles sum to 180°."

These are called **quantified statements**, and they use two symbols:

**∀ (for all)**: ∀x ∈ ℝ, x² ≥ 0. "For every real number x, x-squared is non-negative." To prove this, you can't check every real number — there are infinitely many. You need a proof that covers all cases at once.

**∃ (there exists)**: ∃x ∈ ℝ, x² = 2. "There exists a real number whose square is 2." (That number is √2.) To prove this, you just need to exhibit one example.

Negating quantified statements follows a mechanical rule:
- The negation of ∀x, P(x) is ∃x, ¬P(x) — "some x fails"
- The negation of ∃x, P(x) is ∀x, ¬P(x) — "no x works"

This is why a single counterexample destroys a universal claim. "Every swan is white" (∀x, white(x)) is disproved by finding one black swan (∃x, ¬white(x)). One exception is enough.`,

      `### Four Proof Strategies

A proof is a logically airtight argument that a statement is true. The trick is choosing the right strategy for the structure of what you're trying to prove.

**Direct Proof**: Assume P, derive Q step by step. Best when the logical path from assumption to conclusion is visible. Most proofs are direct proofs.

**Proof by Contradiction**: Assume ¬P (what you want to prove is false), then derive a statement that is clearly false or contradicts something you know to be true. Since assuming ¬P leads to nonsense, P must be true. Best for "there is no..." statements or when the direct path is unclear.

**Proof by Contrapositive**: Instead of proving P → Q, prove ¬Q → ¬P. Since these are logically equivalent, proving one proves the other. Best when it's easier to work backward from a failure than forward from a hypothesis.

**Proof by Cases**: Split the universe of possibilities into exhaustive, non-overlapping cases. Prove the claim for each case separately. Since every possibility is covered, the claim holds in general. Best when different subcategories behave differently — like "even" and "odd," or "positive, negative, and zero."

Choosing the right strategy is an art that comes with practice, but the decision tree is logical: Can I see a direct path? → Direct proof. Am I trying to prove nonexistence? → Contradiction. Is the contrapositive simpler? → Contrapositive. Do different cases behave differently? → Cases.`,
    ],

    visualizations: [
      {
        id: 'TruthTableViz',
        title: 'Truth Table Visualizer',
        caption: 'The original perspective: inspect logic outcomes across all assignments.',
      },
      {
        id: 'LogicConnectiveBuilder',
        title: 'Build Your Own Logic Expressions',
        caption: 'Combine propositions with connectives and see the full truth table update live. Try building De Morgan\'s Laws yourself.',
        props: { guided: true },
      },
      {
        id: 'ImplicationExplorer',
        title: 'Implication: When Is a Promise Broken?',
        caption: 'The interactive shows every combination of P and Q with a real-world promise. See exactly why False → True is vacuously true.',
        props: { guided: true },
      },
      {
        id: 'TruthTableBuilderDemo',
        title: 'Truth Table Builder (Second Perspective)',
        caption: 'Build from an expression and watch truth rows update instantly.',
      },
      {
        id: 'DeMorganViz',
        title: 'De Morgan\'s Laws: Visual Proof',
        caption: 'Two Venn diagrams side by side. Watch ¬(P ∧ Q) and ¬P ∨ ¬Q shade identically — a visual proof of equivalence.',
        props: { animated: true },
      },
      {
        id: 'QuantifierExplorer',
        title: 'Universal vs. Existential: How One Counterexample Destroys Everything',
        caption: 'Drop marbles into a universe. Watch how ∀ requires every single one to satisfy P, while ∃ only needs one.',
        props: { interactive: true },
      },
      {
        id: 'ProofStrategyChooser',
        title: 'Which Proof Strategy Should I Use?',
        caption: 'Describe the shape of the claim you want to prove. The interactive guides you to the right technique.',
        props: { guided: true },
      },
    ],

    summary: `Logic is the grammar of certainty. The five connectives (¬, ∧, ∨, →, ↔) build complex statements from simple ones. Truth tables exhaustively verify logical equivalences. Quantifiers (∀, ∃) extend statements over entire sets. Four proof strategies — direct, contradiction, contrapositive, cases — cover the vast majority of mathematical claims.`,

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
        style: 'builder-perspective',
        title: 'Truth Table Builder (Second Perspective)',
        explanation: `
          Instead of reading a pre-built table, build one from an expression and watch rows update.
          This perspective helps beginners connect symbols to outcomes by immediate feedback.
          Keep the original visual and use this as a complementary sandbox.`,
        visualizationId: 'TruthTableBuilderDemo',
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
        visualizationId: 'DeMorganViz',
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
        visualizationId: 'ProofStrategyChooser',
      },
    ],
  },

  math: {
    prose: [
      `### The Truth Table for Implication — Fully Explained

The truth table for P → Q has the one row that confuses everyone: P = False, Q = True → the implication is True. And P = False, Q = False → also True. How?

Think of the implication as a conditional promise: "If you score 90%, you get an A." When does this promise get broken? Only when you score 90% and don't get the A. If you don't score 90%, the promise was never invoked — whatever grade you get, the promise was never broken.

In symbols:
- P = T, Q = T: Scored 90%, got A. Promise kept. TRUE.
- P = T, Q = F: Scored 90%, didn't get A. Promise broken. FALSE.
- P = F, Q = T: Didn't score 90%, got A anyway. Promise wasn't invoked. TRUE.
- P = F, Q = F: Didn't score 90%, didn't get A. Promise wasn't invoked. TRUE.

The implication is a constraint only on the case where the premise is true. When the premise is false, there's nothing to constrain.`,

      `### Logical Equivalence and Tautologies

Two expressions are **logically equivalent** if they have identical truth tables — they evaluate to the same value for every possible input. We write this as P ≡ Q (or P ⟺ Q when talking about equivalence rather than biconditional).

A **tautology** is an expression that is True for every possible combination of inputs. P ∨ ¬P is a tautology — "P or not P" is always true. This is called the Law of Excluded Middle.

A **contradiction** is an expression that is False for every input. P ∧ ¬P is a contradiction — "P and not P" is never true.

The most important equivalences to memorize:
- P → Q ≡ ¬P ∨ Q (implication as disjunction)
- P → Q ≡ ¬Q → ¬P (contrapositive)
- ¬(P ∧ Q) ≡ ¬P ∨ ¬Q (De Morgan)
- ¬(P ∨ Q) ≡ ¬P ∧ ¬Q (De Morgan)
- P ↔ Q ≡ (P → Q) ∧ (Q → P) (biconditional decomposition)`,
    ],

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
      { symbol: '∀', name: 'For All', example: '∀x ∈ ℝ, x² ≥ 0', negation: '∃x ∈ ℝ, x² < 0' },
      { symbol: '∃', name: 'There Exists', example: '∃x ∈ ℝ, x² = 2', negation: '∀x ∈ ℝ, x² ≠ 2' },
      { symbol: '∃!', name: 'There Exists Unique', example: '∃!x ∈ ℝ, x + 3 = 5', negation: 'Either no x or more than one x satisfies x + 3 = 5' },
    ],

    negationRules: [
      { original: '\\forall x, P(x)', negation: '\\exists x, \\neg P(x)', plain: 'If "every x satisfies P" is false, then some x fails P.' },
      { original: '\\exists x, P(x)', negation: '\\forall x, \\neg P(x)', plain: 'If "some x satisfies P" is false, then no x satisfies P.' },
      { original: 'P \\rightarrow Q', negation: 'P \\land \\neg Q', plain: 'An implication is false only when the premise holds but the conclusion fails.' },
    ],
  },

  rigor: {
    visualizationId: null,
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
      id: 'dm-lp-ex0',
      title: 'Building Intuition: Why P → Q Is Not "P Causes Q"',
      problem: 'Determine the truth value: "If 2 + 2 = 5, then the moon is made of cheese."',
      steps: [
        { expression: 'P = (2 + 2 = 5)', annotation: 'P is False. 2 + 2 equals 4, not 5.' },
        { expression: 'Q = (\\text{moon is made of cheese})', annotation: 'Q is also False. The moon is rock.' },
        { expression: 'P \\to Q \\text{ where P = F, Q = F: Result = TRUE}', annotation: 'A false premise makes the whole implication vacuously true. The conditional was never tested — P was never met.' },
      ],
      conclusion: 'TRUE. This surprises most people, but it\'s logically sound. An implication is a promise about what happens when P is true. Since P is never true here, the promise is never broken.',
    },
    {
      id: 'dm-lp-ex1',
      title: 'Direct Proof: Even × Even = Even',
      problem: 'Prove: if m and n are even, then mn is even.',
      steps: [
        { expression: 'm = 2a, \\quad n = 2b \\quad \\text{for integers } a, b', annotation: 'Definition of even: divisible by 2. We write m and n in terms of their definition.' },
        { expression: 'mn = (2a)(2b) = 4ab = 2(2ab)', annotation: 'Multiply and factor out 2. The product is 2 times an integer.' },
        { expression: '\\therefore mn \\text{ is even} \\quad \\square', annotation: 'Since 2ab is an integer, mn is divisible by 2. QED.' },
      ],
      conclusion: 'Direct proof — we assumed what we were given (m and n even) and derived what we wanted to show (mn even) in three algebraic steps.',
    },
    {
      id: 'dm-lp-ex2',
      title: 'Proof by Contradiction: √2 is Irrational',
      problem: 'Prove √2 cannot be expressed as p/q where p,q are integers with no common factors.',
      steps: [
        { expression: '\\text{Assume } \\sqrt{2} = \\frac{p}{q} \\text{ in lowest terms}', annotation: 'Suppose FOR CONTRADICTION that √2 IS rational and already fully reduced.' },
        { expression: '2 = \\frac{p^2}{q^2} \\Rightarrow p^2 = 2q^2', annotation: 'Square both sides. p² is 2 times something — so p² is even.' },
        { expression: 'p^2 \\text{ even} \\Rightarrow p \\text{ even} \\Rightarrow p = 2k', annotation: 'A square is even iff the number itself is even. (Prove this by contrapositive!)' },
        { expression: '(2k)^2 = 2q^2 \\Rightarrow 4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2', annotation: 'Substitute p=2k. Now q² is also even, so q is even.' },
        { expression: 'p \\text{ and } q \\text{ both even} \\Rightarrow \\text{common factor 2}', annotation: 'Both divisible by 2 — but we assumed lowest terms! Contradiction. ∎' },
      ],
      conclusion: 'The assumption that √2 is rational leads to a logical impossibility. Therefore √2 is irrational.',
    },
    {
      id: 'dm-lp-ex3',
      title: 'Proof by Contrapositive: Odd Square ↔ Odd Number',
      problem: 'Prove: if n² is odd, then n is odd. (Using contrapositive.)',
      steps: [
        { expression: '\\text{Original: } n^2 \\text{ odd} \\Rightarrow n \\text{ odd}', annotation: 'This is what we want to prove. The direct path is awkward.' },
        { expression: '\\text{Contrapositive: } n \\text{ even} \\Rightarrow n^2 \\text{ even}', annotation: 'Logically equivalent, and much easier to work with directly.' },
        { expression: 'n = 2k \\Rightarrow n^2 = 4k^2 = 2(2k^2)', annotation: 'If n is even, n² is clearly even. Contrapositive proved.' },
        { expression: '\\therefore n^2 \\text{ odd} \\Rightarrow n \\text{ odd} \\quad \\square', annotation: 'Since the contrapositive is true, the original is true.' },
      ],
      conclusion: 'Contrapositive proof — we proved the logically equivalent statement because it was simpler. The original claim follows automatically.',
    },
    {
      id: 'dm-lp-ex4',
      title: 'Proof by Cases: |xy| = |x||y|',
      problem: 'Prove that for all real numbers x and y, |xy| = |x||y|.',
      steps: [
        { expression: '\\text{Case 1: Both x, y \\ge 0}', annotation: 'xy ≥ 0, so |xy| = xy = |x||y|. ✓' },
        { expression: '\\text{Case 2: x < 0, y \\ge 0}', annotation: 'xy ≤ 0, so |xy| = −xy = (−x)(y) = |x||y|. ✓' },
        { expression: '\\text{Case 3: x \\ge 0, y < 0}', annotation: 'Symmetric to Case 2. |xy| = |x||y|. ✓' },
        { expression: '\\text{Case 4: Both x, y < 0}', annotation: 'xy > 0, so |xy| = xy = (−x)(−y) = |x||y|. ✓' },
        { expression: '\\text{All four cases exhausted.} \\quad \\square', annotation: 'Every possible sign combination has been covered. The claim holds universally.' },
      ],
      conclusion: 'Proof by cases — we split on the sign of x and y, giving four exhaustive scenarios. Each was handled separately.',
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
    {
      id: 'dm-lp-c3',
      difficulty: 'hard',
      problem: 'Determine whether this argument is valid: "All mammals are warm-blooded. Dolphins are warm-blooded. Therefore dolphins are mammals." If not valid, explain why and construct a counterexample.',
      hint: 'Map to logical form: ∀x, M(x)→W(x). W(dolphin). ∴ M(dolphin). Is this a valid inference?',
      walkthrough: [
        { expression: '\\text{Premises: } \\forall x, M(x) \\to W(x). \\quad W(d).', annotation: 'All mammals are warm-blooded AND dolphins are warm-blooded.' },
        { expression: '\\text{Converse error: } W(d) \\text{ and } \\forall x, M(x)\\to W(x) \\not\\vdash M(d)', annotation: 'Knowing P→Q is true and Q is true does NOT let us conclude P. This is the fallacy of affirming the consequent.' },
        { expression: '\\text{Counterexample: } \\forall x, M(x) \\to W(x). \\quad W(\\text{sparrow}).', annotation: 'Sparrows are warm-blooded. The same argument would "prove" sparrows are mammals. Since sparrows are birds, not mammals, the inference form is invalid.' },
      ],
      answer: 'INVALID. This is the fallacy of affirming the consequent. Knowing P→Q and Q does not prove P. Sparrows are warm-blooded but not mammals.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'P, Q', meaning: 'Propositions — statements that are either True or False' },
      { symbol: '¬', meaning: 'Negation — the logical NOT operator' },
      { symbol: '∧, ∨', meaning: 'Conjunction (AND) and Disjunction (OR)' },
      { symbol: '→', meaning: 'Conditional — "If P then Q." False only when P is True and Q is False.' },
      { symbol: '↔', meaning: 'Biconditional — "P if and only if Q." True when P and Q have the same value.' },
      { symbol: '∀, ∃', meaning: 'Universal (For All) and Existential (There Exists) quantifiers' },
      { symbol: '∴', meaning: 'Therefore — precedes a conclusion in a deductive argument' },
      { symbol: '≡', meaning: 'Logical equivalence — same truth table for all inputs' },
      { symbol: '⊢', meaning: 'Proves — P ⊢ Q means Q can be derived from P' },
    ],
    rulesOfThumb: [
      'Proof is not about examples; it is about universal exhaustion of possibilities.',
      'A single counterexample destroys a universal claim (∀).',
      'The conditional P → Q is only False when P is True and Q is False.',
      'Contrapositive (¬Q → ¬P) is always logically equivalent to the original implication.',
      'De Morgan: negation flips AND↔OR and propagates inward.',
      'To negate a quantified statement: flip ∀↔∃ and negate the predicate.',
      'Valid argument: if premises are true, conclusion must be true. Sound: valid + premises are actually true.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-00-logic-puzzles',
        label: 'Logic Puzzles',
        note: 'The informal reasoning used to solve grid puzzles is organized here into a formal system of symbols and rules.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-01a-predicate-logic',
        label: 'Predicate Logic',
        note: 'We will take these single propositions and extend them to range over infinite collections using quantifiers.',
      },
      {
        lessonId: 'discrete-1-03',
        label: 'Induction and Recursion',
        note: 'Mathematical induction is a specific proof strategy for claims about all natural numbers.',
      },
    ],
  },

  mentalModel: [
    'Logic is the grammar of certainty — it removes ambiguity from language.',
    'A truth table is an exhaustive audit. If every row passes, the claim is universally true.',
    'Implication is a promise. It\'s only broken when the premise is met and the conclusion fails.',
    'Negation flips quantifiers and connectives: ∀↔∃, ∧↔∨.',
    'Four proof strategies cover most mathematics: direct, contradiction, contrapositive, cases.',
    'Proof is not about checking examples. It\'s about constructing an argument that leaves no case uncovered.',
  ],

  assessment: {
    questions: [
      {
        id: 'lp-assess-1',
        type: 'choice',
        text: 'Which row of the truth table for P → Q is False?',
        options: ['P=T, Q=T', 'P=T, Q=F', 'P=F, Q=T', 'P=F, Q=F'],
        answer: 'P=T, Q=F',
        hint: 'A promise is only broken if the condition is met but the result is not.',
      },
      {
        id: 'lp-assess-2',
        type: 'input',
        text: 'What is the logical negation of "Every bird can fly"?',
        answer: 'Some bird cannot fly',
        hint: 'Negating a universal (∀) gives an existential (∃) of the negated property.',
      },
      {
        id: 'lp-assess-3',
        type: 'choice',
        text: 'P → Q is logically equivalent to which of the following?',
        options: ['Q → P', '¬P → ¬Q', '¬Q → ¬P', '¬P ∧ Q'],
        answer: '¬Q → ¬P',
        hint: 'The contrapositive flips and negates both sides. It has an identical truth table.',
      },
      {
        id: 'lp-assess-4',
        type: 'input',
        text: 'Apply De Morgan\'s Law: simplify ¬(A ∨ B)',
        answer: '¬A ∧ ¬B',
        hint: 'De Morgan: negation of OR becomes AND of negations.',
      },
    ],
  },

  quiz: [
    {
      id: 'lp-q1',
      type: 'choice',
      text: 'If the hypothesis of an "if-then" statement is False, what is the truth value of the entire statement?',
      options: ['True', 'False', 'Depends on the conclusion', 'Undefined'],
      answer: 'True',
      hints: ['A conditional with a false premise is "vacuously true" because the promise is never broken.'],
    },
    {
      id: 'lp-q2',
      type: 'choice',
      text: 'Which proof technique involves assuming the opposite of what you want to prove?',
      options: ['Direct Proof', 'Contradiction', 'Induction', 'Contrapositive'],
      answer: 'Contradiction',
      hints: ['Assuming ¬P and finding a conflict proves P must be true.'],
    },
    {
      id: 'lp-q3',
      type: 'choice',
      text: 'You want to prove: "If a number is divisible by 6, it is divisible by 2." The easiest proof strategy is:',
      options: ['Proof by Contradiction', 'Direct Proof', 'Proof by Cases', 'Proof by Induction'],
      answer: 'Direct Proof',
      hints: ['There\'s a clear direct path: if 6|n then n=6k, so n=2(3k). The logical road is straight.'],
    },
    {
      id: 'lp-q4',
      type: 'choice',
      text: 'Which of the following is a tautology?',
      options: ['P ∧ ¬P', 'P ∨ Q', 'P ∨ ¬P', 'P → Q'],
      answer: 'P ∨ ¬P',
      hints: ['"P or not P" — one of these must always be true. Every row in its truth table is True.'],
    },
  ],
}