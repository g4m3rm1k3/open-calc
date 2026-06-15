export default {
  id: 'discrete-1-01a',
  slug: 'predicate-logic-and-quantifiers',
  chapter: 'discrete-1',
  order: 2,
  title: 'Predicate Logic and Quantifiers',
  subtitle: 'Scaling truth from single statements to universal laws — the language of databases, proofs, and infinite sets',
  tags: ['predicate logic', 'quantifiers', 'forall', 'exists', 'nested quantifiers', 'domain', 'negation'],
  aliases: 'first order logic quantified statements quantifier negation domain of discourse predicate',

  semantics: {
    core: [
      { symbol: 'P(x)', meaning: 'A predicate — a statement with a variable that becomes True or False once x is assigned a value' },
      { symbol: 'D', meaning: 'The domain of discourse — the set of all allowable values for variables' },
      { symbol: '∀x P(x)', meaning: 'For all x in the domain, P(x) is True — every single element satisfies P' },
      { symbol: '∃x P(x)', meaning: 'There exists at least one x in the domain for which P(x) is True' },
      { symbol: '∀x ∃y', meaning: 'For every x, there exists a y — y may depend on x (flexible)' },
      { symbol: '∃y ∀x', meaning: 'There exists a single y that works for all x — y is fixed first (rigid)' },
      { symbol: '¬(∀x P(x)) ≡ ∃x ¬P(x)', meaning: "De Morgan for quantifiers: negate 'for all' by finding one exception" },
      { symbol: '¬(∃x P(x)) ≡ ∀x ¬P(x)', meaning: "De Morgan for quantifiers: negate 'there exists' by showing none work" },
    ],
    rulesOfThumb: [
      'A predicate P(x) has no truth value until x is substituted — it is a template, not a statement.',
      'To DISPROVE ∀x P(x), find ONE counterexample. To PROVE ∃x P(x), find ONE witness.',
      'To PROVE ∀x P(x), you must argue for an arbitrary x — you cannot cherry-pick.',
      'Quantifier order matters: ∀x ∃y ≠ ∃y ∀x in general. Read strictly left to right.',
      'Negation pushes inward: each quantifier flips (∀↔∃) and the negation lands on the predicate.',
      'A universal statement over an empty domain is vacuously True — no counterexample exists.',
      'Free variables must be bound before a predicate becomes a proposition with a definite truth value.',
    ],
  },

  hook: {
    question: "If I say 'Someone in this room is a spy,' how many people must you check to prove it true? What if I claim 'Everyone in this room is a spy' — how many do you need to check to prove that FALSE?",
    realWorldContext: "Propositional logic is powerful but limited — it can only reason about specific, fixed statements. A database of one million users cannot be queried with one million hand-written 'AND' statements. SQL's WHERE clause, Python's 'any()' and 'all()' functions, and every mathematical proof about infinite sets all rely on predicate logic: a system that lets you make a single statement ranging over an entire domain. When a mathematician writes 'for all integers n, if n is even then n² is even,' they are using the universal quantifier to make one claim that covers infinitely many cases simultaneously. This lesson builds the language behind that power.",
    previewVisualizationId: 'QuantifierGridLab',
  },

  intuition: {
    prose: [
      "**Where you are in the story.** In the last lesson you learned propositional logic: fixed statements p and q that are simply True or False. That is enough to analyze individual arguments. But mathematics and computer science routinely make claims about entire collections — all integers, all users, all graph nodes. To express those claims, we need a richer language. Predicate logic provides it, and this lesson is where your reasoning power scales from the finite to the infinite.",

      "A **predicate** is a declarative sentence with a gap — a placeholder that waits to be filled. Think of it as a Mad Libs blank: 'x is a prime number.' On its own, that sentence has no truth value. Fill in x = 7 and it becomes True. Fill in x = 9 and it becomes False. Symbolically we write P(x), and we say P is a predicate and x is a free variable. The moment we substitute a specific value for x, the predicate becomes a proposition — a full, evaluatable statement.",

      "Every predicate lives inside a **domain of discourse** — the universe of allowable values for x. The domain is not optional decoration; it is a core part of the logical structure. The statement 'x² ≥ 0' is True for all real numbers but False for some complex numbers. If you change the domain, you can flip the truth value of a predicate without changing a single symbol inside it. Always identify the domain before evaluating anything.",

      "To turn a predicate into a proposition that covers an entire domain, we use **quantifiers**. There are exactly two. The **universal quantifier** (∀, read 'for all') says P(x) is True for every element of the domain without exception. It is equivalent to a giant AND across the whole domain: P(a₁) ∧ P(a₂) ∧ P(a₃) ∧ ... If even one element fails, the whole universal statement is False. The **existential quantifier** (∃, read 'there exists') says P(x) is True for at least one element. It is equivalent to a giant OR: P(a₁) ∨ P(a₂) ∨ P(a₃) ∨ ... One success is enough.",

      "This asymmetry in proof effort is crucial. To **prove** ∀x P(x), you cannot test every element — there may be infinitely many. You must argue for a generic, arbitrary element and show P holds without using any special property of that element. To **disprove** ∀x P(x), you only need a single counterexample — one element where P fails. Conversely, to **prove** ∃x P(x), you only need to produce one witness — one specific element where P is True. To **disprove** ∃x P(x), you must show P fails for every element — a universal proof in disguise.",

      "**The Spy Room.** 'Someone in this room is a spy' is ∃x Spy(x). To prove it true, you point to one spy — done. 'Everyone in this room is a spy' is ∀x Spy(x). To prove it false, you point to one non-spy — a counterexample. Notice how the effort is reversed for proof vs. disproof depending on the quantifier. This is not a trick — it is the formal manifestation of what 'for all' and 'there exists' mean.",

      "**Negating quantified statements.** What does it mean to deny 'Every apple in this basket is red'? You are NOT claiming 'Every apple in this basket is not red.' You are claiming 'At least one apple is not red.' Formally: ¬(∀x P(x)) ≡ ∃x ¬P(x). The negation pushes inward, flips the quantifier, and lands on the predicate. The same logic applies in reverse: ¬(∃x P(x)) ≡ ∀x ¬P(x). To deny 'There is a spy in this room,' you must show every person is not a spy. These are the De Morgan's Laws for quantifiers — exact analogues of the propositional versions, but now ranging over domains.",

      "**Where this is heading.** The single biggest payoff of predicate logic is enabling proofs about infinite sets. Every theorem about all integers, all real numbers, all graphs, all programs, uses quantifiers. Understanding how to read, negate, and prove quantified statements is the engine behind every major result in this course — induction, combinatorics, graph theory, and computability all speak this language.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 — Scaling Beyond Single Statements',
        body: '**Previous (01):** Propositional logic — fixed True/False statements connected by ∧, ∨, →, ¬.\n**This lesson:** Predicate logic — statements ranging over entire domains via ∀ and ∃, with De Morgan negation rules for quantifiers.\n**Next (01b):** Combining propositions and predicates into a full proof framework.',
      },
      {
        type: 'definition',
        title: 'Domain Notation Reference',
        body: '| Symbol | Name | Contains |\n|---|---|---|\n| ℕ | Natural numbers | 0, 1, 2, 3, … |\n| ℤ | Integers | …, −2, −1, 0, 1, 2, … |\n| ℚ | Rationals | All fractions p/q, q ≠ 0 |\n| ℝ | Real numbers | All points on the number line |\n| ∈ | "is in" | x ∈ ℤ means x is an integer |',
      },
      {
        type: 'insight',
        title: 'The Proof Effort Asymmetry',
        body: '| Goal | ∀x P(x) | ∃x P(x) |\n|---|---|---|\n| **To PROVE** | Argue for arbitrary x — heavy | Find one witness — easy |\n| **To DISPROVE** | Find one counterexample — easy | Show all x fail — heavy |',
      },
      {
        type: 'misconception',
        title: 'Negating ∀ Does NOT Give ∀¬',
        body: '¬(∀x P(x)) is NOT ∀x ¬P(x).\nThe correct negation is ∃x ¬P(x) — we flip the quantifier.\n\nEnglish check: "Not every apple is red" does NOT mean "Every apple is not red." It means "At least one apple is not red." The quantifier flips.',
      },
      {
        type: 'real-world',
        title: 'Quantifiers in Programming and Databases',
        body: '`∀x P(x)` maps to `all(P(x) for x in domain)` in Python, or `WHERE NOT EXISTS (SELECT 1 FROM ... WHERE NOT P(x))` in SQL.\n`∃x P(x)` maps to `any(P(x) for x in domain)` in Python, or `WHERE EXISTS (SELECT 1 FROM ... WHERE P(x))` in SQL.\nEvery database query, type-checking rule, and loop invariant is a quantified statement in disguise.',
      },
    ],
    visualizations: [
      {
        id: 'QuantifierGridLab',
        title: 'The Quantifier Grid — ∀ vs. ∃ in Action',
        mathBridge: 'The grid shows all elements of the domain. Each cell is one element; green means P(x) is True, red means False. Set the predicate to "x is even" and domain to {1,2,3,4,5,6}. Is ∀x P(x) True? No — 1, 3, 5 are red. Is ∃x P(x) True? Yes — 2, 4, 6 are green. Now switch to "x > 0" over the naturals ℕ: every cell is green, so ∀x P(x) is True. Remove all green cells (make P always False): ∀x P(x) is False and ∃x P(x) is False. This is the only case both are False simultaneously.',
        caption: 'Green = P(x) True. ∀x P(x) requires ALL green; ∃x P(x) requires AT LEAST ONE green. Find the predicate that makes exactly half the grid green.',
      },
      {
        id: 'DomainExplorerLab',
        title: 'The Domain Switcher — Same Predicate, Different Universe',
        mathBridge: 'Set P(x) to "x² ≥ 0" and observe it is True for all real numbers (∀x P(x) over ℝ is True). Now switch the domain to "complex numbers": suddenly x = i gives i² = −1 < 0, making ∀x P(x) False. The predicate did not change — only the domain did. This is why every quantified statement MUST specify its domain. Now try "x + 1 > x" — True over ℝ, but what about over modular arithmetic (e.g., ℤ₅)? The domain changes everything.',
        caption: 'Same predicate, radically different truth value when the domain changes. Domain is not decoration — it is load-bearing.',
      },
    ],
  },

  math: {
    prose: [
      "**Nested quantifiers — the turn-based game.** Real mathematical statements often require more than one variable and more than one quantifier. 'For every real number x, there exists a real number y such that x + y = 0' uses both ∀ and ∃. When quantifiers nest, their order determines who controls whose choice — and the order radically changes the meaning.",

      "Think of nested quantifiers as a two-player game between you and Nature. Each ∀ quantifier means Nature makes a choice; each ∃ quantifier means you make a choice. The choices are made in the order quantifiers appear, left to right. If ∀x comes before ∃y, Nature picks x first, then you respond with a y that can depend on x. If ∃y comes before ∀x, you must lock in y first without knowing x, and then Nature tries to find an x that breaks your choice.",

      "∀x ∃y P(x,y): Nature picks any x. You respond with a y tailored to that x. This is flexible — your y is allowed to be a function of x. For the statement ∀x ∃y (x + y = 0) over ℝ: no matter what x Nature picks, you can always respond with y = −x. The statement is True.",

      "∃y ∀x P(x,y): You must pick ONE fixed y first. Then Nature picks any x it wants to try to break the statement. For ∃y ∀x (x + y = 0) over ℝ: you must pick a single number y such that x + y = 0 for EVERY real x simultaneously. That would require y = −x for every x at once — impossible. The statement is False.",

      "The lesson: ∀x ∃y is almost always easier to satisfy than ∃y ∀x, because ∃y ∀x demands a single universal solution while ∀x ∃y allows a custom response to each challenge. Swapping quantifier order is not a trivial rewrite — it can change a True statement into a False one.",

      "**Free and bound variables.** A variable is **bound** when a quantifier has captured it: in ∀x P(x), the variable x is bound to the ∀. A variable is **free** when no quantifier has claimed it. A statement with free variables is not a proposition — it has no definite truth value until the free variable is substituted. For example, P(x): 'x > 5' is neither True nor False until we assign x a value. ∀x (x > 5) is false over ℤ (e.g., x = 3). Always check that every variable is bound before asserting a truth value.",

      "**Vacuous truth.** If the domain is empty, ∀x P(x) is trivially True — there are no elements to serve as counterexamples. This is not a paradox; it is a logical convention called vacuous truth. The statement 'All my pet dragons breathe fire' is True even if you have no dragons — you cannot point to a dragon that does not breathe fire. Vacuous truth appears in program verification: 'for all inputs in this set, the program terminates' is vacuously True if the set of inputs is empty.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "De Morgan's Laws for Quantifiers",
        body: '\\neg(\\forall x\\, P(x)) \\equiv \\exists x\\, (\\neg P(x))\n\n\\neg(\\exists x\\, P(x)) \\equiv \\forall x\\, (\\neg P(x))\n\nTo push ¬ past a quantifier: flip ∀ to ∃ (or ∃ to ∀), then land ¬ on the predicate.',
      },
      {
        type: 'theorem',
        title: 'Quantifier Order Is Not Commutative',
        body: '\\forall x\\, \\exists y\\, P(x,y) \\not\\equiv \\exists y\\, \\forall x\\, P(x,y) \\quad \\text{in general}\n\nThe left is true whenever a response to each challenge exists.\nThe right requires a single fixed response that works for every challenge simultaneously.',
      },
      {
        type: 'insight',
        title: 'Vacuously True — Innocent Until Proven Guilty',
        body: 'If the domain is empty, ∀x P(x) is True with no evidence required — there is nothing to contradict it. This feels odd but is logically consistent: the claim "every counterexample fails" is trivially satisfied when counterexamples cannot exist.',
      },
      {
        type: 'warning',
        title: 'Free Variables Cannot Be Evaluated',
        body: 'P(x): "x is prime" has no truth value. You must either:\n1. Substitute a specific value (P(7) = True), or\n2. Bind x with a quantifier (∀x P(x) or ∃x P(x)).\nA proof that references a free variable without binding it is incomplete.',
      },
    ],
    visualizations: [
      {
        id: 'BipartiteQuantifierViz',
        title: 'Nested Quantifiers — The Game Board',
        mathBridge: 'The left column is the domain for x (Nature\'s choices); the right column is the domain for y (your choices). For ∀x ∃y (x+y=0): Nature picks any row on the left; you draw an arrow to y=−x on the right. Every row can be matched — statement True. Now switch to ∃y ∀x: you must pick ONE y on the right first, then Nature draws arrows from every x to that single y. Can x+y=0 hold for every x with the same y? No — try any fixed y and watch Nature find an x that breaks it.',
        caption: 'Nature picks x; you pick y. ∀x ∃y: custom y per x (easy). ∃y ∀x: one fixed y for all x (hard). The visual arrows show who wins the game.',
      },
    ],
  },

  rigor: {
    prose: [
      "**Part I: The Machinery of Quantifier Negation.** Negating a quantified statement is not intuition — it is a mechanical algorithm. Each negation sign, as it passes inward through a sequence of quantifiers, flips every quantifier it encounters (∀ becomes ∃, ∃ becomes ∀) and finally lands on the innermost predicate. This works because ∀ is an infinite AND and ∃ is an infinite OR, and De Morgan's Laws tell us exactly how negation distributes over AND and OR.",

      "The formal justification: ¬(∀x P(x)) says 'It is not the case that P holds for all x.' This is logically equivalent to 'There is some x for which P fails,' which is ∃x ¬P(x). Symmetrically, ¬(∃x P(x)) says 'There is no x for which P holds,' which means P fails for every x: ∀x ¬P(x). These are not definitions — they are theorems that can be verified by considering what it would mean for each side to be True or False.",

      "**Part II: Proving Universal Statements.** To prove ∀x P(x), you introduce an arbitrary element of the domain — typically called 'let x be an arbitrary element of D' — and then prove P(x) holds using only the fact that x is in D, without any special assumption about which element it is. This is called a **universal generalization**. The power is that by proving P for one generic x, you have simultaneously proved it for every element.",

      "This is why you cannot prove ∀x P(x) by checking examples. Confirming P(1), P(2), and P(3) proves nothing about P(1000) unless your argument was general. But disproving ∀x P(x) requires only one counterexample — the asymmetry that makes universal claims harder to prove than to refute.",

      "**Part III: The Limit Definition — A Masterclass in Nested Quantifiers.** The formal epsilon-delta definition of a limit is the most celebrated application of nested quantifiers in all of calculus: lim(x→c) f(x) = L means ∀ε > 0, ∃δ > 0, ∀x ∈ ℝ, (0 < |x−c| < δ → |f(x)−L| < ε). Reading this as a game: Nature picks any tolerance ε > 0 (a challenge). You respond with a neighborhood δ > 0 (your move). Nature then picks any x within δ of c. You win if f(x) is within ε of L. The limit equals L if you can always win regardless of Nature's challenge. Negating this definition — finding the exact formal statement that the limit does NOT equal L — requires pushing ¬ through all three quantifiers, and produces the precise criterion for a limit failing.",

      "**For the programmer.** Every loop invariant in program verification is a universal statement: ∀ iterations i, property P(i) holds. Proving the invariant requires a universal generalization argument (induction). Every assertion of the form 'this function works for all inputs of type T' is a universal claim. Understanding quantifier structure helps you write and verify correct loop invariants and function contracts.",
    ],

    proofSteps: [
      {
        title: 'Negating a Simple Universal Statement',
        description: 'Show that ¬(∀x ∈ ℤ, x² ≥ 0) ≡ ∃x ∈ ℤ, x² < 0 — step by step.',
        steps: [
          { tag: 'Original', instruction: 'Start with the statement to negate.', math: '\\forall x \\in \\mathbb{Z},\\; x^2 \\geq 0' },
          { tag: 'Apply ¬', instruction: 'Wrap in negation.', math: '\\neg(\\forall x \\in \\mathbb{Z},\\; x^2 \\geq 0)' },
          { tag: 'Push ¬ Past ∀', instruction: 'Flip ∀ to ∃; land ¬ on predicate.', math: '\\exists x \\in \\mathbb{Z},\\; \\neg(x^2 \\geq 0)' },
          { tag: 'Simplify Predicate', instruction: 'Negate the inequality: ¬(x² ≥ 0) becomes x² < 0.', math: '\\exists x \\in \\mathbb{Z},\\; x^2 < 0' },
          { tag: 'Interpret', instruction: 'The negation claims there is an integer whose square is negative. Over ℤ this is False — confirming the original ∀ statement is True.', math: '\\text{No such integer exists} \\implies \\text{original } \\forall \\text{ is True.}' },
        ],
      },
      {
        title: 'Negating the Formal Definition of a Limit',
        description: 'Push ¬ through all three quantifiers in the epsilon-delta definition.',
        steps: [
          { tag: 'Limit Definition', instruction: 'The formal definition: limit = L means the following holds.', math: '\\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x \\in \\mathbb{R},\\; (0 < |x-c| < \\delta \\implies |f(x)-L| < \\varepsilon)' },
          { tag: 'Wrap in ¬', instruction: 'We want to negate the entire statement — the limit does NOT equal L.', math: '\\neg\\bigl(\\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x,\\; P(x)\\bigr)' },
          { tag: 'Push past ∀ε', instruction: 'Flip ∀ to ∃.', math: '\\exists \\varepsilon > 0,\\; \\neg\\bigl(\\exists \\delta > 0,\\; \\forall x,\\; P(x)\\bigr)' },
          { tag: 'Push past ∃δ', instruction: 'Flip ∃ to ∀.', math: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\neg\\bigl(\\forall x,\\; P(x)\\bigr)' },
          { tag: 'Push past ∀x', instruction: 'Flip ∀ to ∃; ¬ lands on the inner conditional.', math: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x \\in \\mathbb{R},\\; \\neg(0 < |x-c| < \\delta \\implies |f(x)-L| < \\varepsilon)' },
          { tag: 'Negate the Conditional', instruction: '¬(A → B) ≡ A ∧ ¬B (from Lesson 01).', math: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x \\in \\mathbb{R},\\; \\bigl(0 < |x-c| < \\delta \\;\\wedge\\; |f(x)-L| \\geq \\varepsilon\\bigr)' },
          { tag: 'Interpret', instruction: 'The limit is NOT L means: there is a fixed tolerance ε such that no matter how small a δ you choose, there is always an x within δ of c with f(x) outside the ε-band around L.', math: '\\text{This is the classical definition of "the limit fails to equal } L\\text{."}' },
        ],
      },
      {
        title: 'Proving a Universal Statement: ∀n ∈ ℤ, if n is even then n² is even',
        description: 'A complete proof by universal generalization — the template for all universal proofs.',
        steps: [
          { tag: 'State Goal', instruction: 'We want to prove: for all integers n, if n is even then n² is even.', math: '\\forall n \\in \\mathbb{Z},\\; \\text{Even}(n) \\implies \\text{Even}(n^2)' },
          { tag: 'Introduce Arbitrary n', instruction: '"Let n be an arbitrary integer." We make no assumption about n other than n ∈ ℤ.', math: 'n \\in \\mathbb{Z} \\text{ (arbitrary)}' },
          { tag: 'Assume n Is Even', instruction: 'We are proving a conditional, so assume the hypothesis: n is even.', math: 'n = 2k \\text{ for some } k \\in \\mathbb{Z}' },
          { tag: 'Compute n²', instruction: 'Square both sides.', math: 'n^2 = (2k)^2 = 4k^2 = 2(2k^2)' },
          { tag: 'Identify Structure', instruction: 'Let m = 2k². Since k ∈ ℤ, we have m ∈ ℤ. So n² = 2m — even by definition.', math: 'n^2 = 2m,\\; m \\in \\mathbb{Z} \\implies n^2 \\text{ is even}' },
          { tag: 'Universal Generalization', instruction: 'Since n was arbitrary, the result holds for all integers n.', math: '\\therefore\\; \\forall n \\in \\mathbb{Z},\\; \\text{Even}(n) \\implies \\text{Even}(n^2). \\quad \\blacksquare' },
        ],
      },
      {
        title: 'Disproving a Universal Statement: Counterexample',
        description: 'Disprove ∀n ∈ ℤ, n² > n by providing a counterexample.',
        steps: [
          { tag: 'Identify Goal', instruction: 'To disprove ∀n ∈ ℤ, n² > n, we need exactly one n where n² ≤ n.', math: '\\text{Disprove: } \\forall n \\in \\mathbb{Z},\\; n^2 > n' },
          { tag: 'Try n = 1', instruction: 'Substitute n = 1 and check.', math: '1^2 = 1 \\not> 1' },
          { tag: 'Counterexample Found', instruction: 'n = 1 gives n² = n, which violates n² > n (strictly greater than).', math: 'n = 1:\\; n^2 = 1 \\leq 1 = n \\quad \\checkmark \\text{ counterexample}' },
          { tag: 'Conclude', instruction: 'Since we found one n ∈ ℤ where n² > n is False, the universal statement is False.', math: '\\therefore\\; \\forall n \\in \\mathbb{Z},\\; n^2 > n \\text{ is FALSE.} \\quad \\blacksquare' },
        ],
      },
    ],

    callouts: [
      {
        type: 'proof-map',
        title: 'Universal vs. Existential Proof Strategies',
        body: '**To prove ∀x P(x):**\n→ Introduce "let x be arbitrary in D."\n→ Prove P(x) using only x ∈ D (no special assumptions).\n→ Conclude by universal generalization.\n\n**To prove ∃x P(x):**\n→ Exhibit a specific witness x₀ ∈ D.\n→ Verify P(x₀) is True.\n→ Conclude the existential is True.\n\n**To disprove ∀x P(x):**\n→ Find one counterexample x₀ where P(x₀) is False.\n\n**To disprove ∃x P(x):**\n→ Prove ∀x ¬P(x) — show no witness exists.',
      },
      {
        type: 'history',
        title: 'The Birth of First-Order Logic',
        body: 'Predicate logic (first-order logic) was created by Gottlob Frege in his 1879 work Begriffsschrift — "Concept Script." Frege\'s goal was to construct a formal language powerful enough to express all of arithmetic and prove theorems mechanically. Bertrand Russell later discovered a paradox in Frege\'s system (Russell\'s Paradox), which led to the modern axiomatic set theory we use today. The quantifiers ∀ and ∃ are the core of every formal proof system used in mathematics, logic programming (Prolog), and formal verification (Coq, Lean, Isabelle).',
      },
      {
        type: 'real-world',
        title: 'Type Systems as Universal Quantifiers',
        body: 'A function signature `f: Int → Bool` in a typed language implicitly asserts ∀x ∈ Int, f(x) ∈ Bool. The type checker verifies this universal statement at compile time — rejecting programs where the predicate fails for some input type. Generic types (like Java\'s `<T>`) are even more explicit: `∀T, f(t: T) → T` means "for every type T, this function takes a T and returns a T." Type theory is predicate logic applied to programs.',
      },
    ],
    visualizations: [
      {
        id: 'QuantifierNegationPusher',
        title: 'The Negation Pusher — Watch ¬ Travel Inward',
        mathBridge: 'Enter any quantified statement and press "Negate." Watch the ¬ symbol move left to right through each quantifier, flipping ∀ to ∃ and ∃ to ∀ at each step, until it rests on the innermost predicate. Then use the De Morgan\'s panel below to verify the final negated predicate matches the expected English interpretation. Try: negate ∀x ∃y (x + y = 0) and verify the result matches "there is some x for which no y satisfies x + y = 0."',
        caption: 'The ¬ symbol moves inward, flipping every quantifier it passes. De Morgan\'s Laws for quantifiers in animated form.',
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-01a-ex1',
      title: 'Translating English to Predicate Logic',
      problem: '\\text{Translate into predicate logic over the domain of all people: (A) "Everyone loves someone." (B) "Someone loves everyone." (C) "No one loves everyone."}',
      steps: [
        {
          expression: '\\text{(A) "Everyone loves someone."}',
          annotation: 'Identify the quantifiers in order: "every" person has "some" person they love.',
          strategyTitle: 'Parse the English Quantifier Order',
          checkpoint: 'Which quantifier comes first? Does the loved person depend on the lover?',
          hints: [
            '"Everyone" binds the outer variable (the lover). "Someone" binds the inner (the loved). The loved person can be different for each lover.',
            'This is ∀x ∃y — for every x, there exists a y such that x loves y. The y depends on x.',
            'Compare to "Someone exists who is loved by everyone" — that would be ∃y ∀x, a different and much stronger claim.',
          ],
        },
        { expression: '\\forall x\\, \\exists y\\, \\text{Loves}(x, y)', annotation: '(A): Every person x has some person y they love. y may be different for each x.' },
        {
          expression: '\\text{(B) "Someone loves everyone."}',
          annotation: 'Now "someone" (a single fixed person) is the one doing the universal loving.',
          strategyTitle: 'Spot the Fixed Witness',
          checkpoint: 'Is the "someone" fixed first, or chosen in response to each "everyone"?',
          hints: [
            '"Someone" here is a single fixed person: ∃x. That person then loves ALL others: ∀y.',
            'This is ∃x ∀y Loves(x, y). One x is fixed, and Loves(x, y) must hold for every y.',
            'Compare to (A): in (A) different people can love different people. In (B), one person loves everyone.',
          ],
        },
        { expression: '\\exists x\\, \\forall y\\, \\text{Loves}(x, y)', annotation: '(B): There is one person who loves everybody. Much stronger than (A).' },
        {
          expression: '\\text{(C) "No one loves everyone."}',
          annotation: '"No one" means "there does not exist anyone who..." — this is negation of an existential.',
          strategyTitle: 'Translate "No One"',
          checkpoint: 'Is "no one loves everyone" the same as "everyone does not love everyone"?',
          hints: [
            '"No one loves everyone" = "It is not the case that someone loves everyone" = ¬(∃x ∀y Loves(x,y)).',
            'By De Morgan: ¬(∃x ∀y Loves(x,y)) ≡ ∀x ¬(∀y Loves(x,y)) ≡ ∀x ∃y ¬Loves(x,y).',
            'English check: "For every person x, there is someone y that x does not love." That matches "no one loves everyone."',
          ],
        },
        { expression: '\\forall x\\, \\exists y\\, \\neg\\text{Loves}(x, y)', annotation: '(C): For every person, there is someone they do not love. Equivalent to ¬(∃x ∀y Loves(x,y)) by De Morgan.' },
      ],
      conclusion: 'The difference between (A) and (B) is purely quantifier order — the same predicate, but ∀x ∃y vs. ∃x ∀y. In real life, (A) is probably true and (B) almost certainly false. In mathematics, the distinction is equally dramatic.',
    },
    {
      id: 'discrete-1-01a-ex2',
      title: 'Negating the Limit Definition',
      problem: '\\text{Negate the epsilon-delta definition: } \\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x \\in \\mathbb{R},\\; (0 < |x-c| < \\delta \\implies |f(x)-L| < \\varepsilon)',
      steps: [
        {
          expression: '\\neg\\bigl(\\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x,\\; P(x)\\bigr)',
          annotation: 'Wrap the entire statement in ¬. Now push the negation inward one quantifier at a time.',
          strategyTitle: 'Wrap and Push',
          checkpoint: 'How many quantifiers will flip? What is the rule for each flip?',
          hints: [
            'There are 3 quantifiers: ∀ε, ∃δ, ∀x. Each one flips as ¬ passes through it.',
            'Rule: ¬ passing ∀ produces ∃; ¬ passing ∃ produces ∀.',
          ],
        },
        { expression: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x \\in \\mathbb{R},\\; \\neg P(x)', annotation: 'After pushing through all three quantifiers: ∀→∃, ∃→∀, ∀→∃.' },
        {
          expression: '\\neg(A \\implies B) \\equiv A \\wedge \\neg B',
          annotation: 'Now negate the inner conditional P(x) using the rule from Lesson 01.',
          strategyTitle: 'Negate the Conditional',
          hints: ['¬(A → B) ≡ A ∧ ¬B. Here A = (0 < |x−c| < δ) and B = (|f(x)−L| < ε).'],
        },
        { expression: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x,\\; \\bigl(0 < |x-c| < \\delta \\;\\wedge\\; |f(x)-L| \\geq \\varepsilon\\bigr)', annotation: 'Final result: the limit does NOT equal L.' },
      ],
      conclusion: 'Reading the negation as a game: you (the one claiming the limit fails) pick a fixed ε. For every δ your opponent tries, you find an x close to c with f(x) far from L. This is exactly the standard definition of a limit not existing — derived purely by mechanical negation.',
    },
    {
      id: 'discrete-1-01a-ex3',
      title: 'Existential Witness — Proving ∃ with a Single Example',
      problem: '\\text{Prove: } \\exists n \\in \\mathbb{Z}\\text{ such that }n^2 - n - 6 = 0.',
      steps: [
        {
          expression: '\\text{Strategy: find one integer } n_0 \\text{ satisfying the predicate.}',
          annotation: 'This is an existential claim. No general argument needed — just one witness.',
          strategyTitle: 'Identify as Existential — Find a Witness',
          checkpoint: 'Can we solve n² − n − 6 = 0 algebraically to find candidate witnesses?',
          hints: [
            'Factor: n² − n − 6 = (n−3)(n+2) = 0 gives n = 3 or n = −2. Both are integers. Either is a valid witness.',
          ],
        },
        { expression: '\\text{Let } n_0 = 3.', annotation: 'State the witness explicitly.' },
        { expression: '(3)^2 - (3) - 6 = 9 - 3 - 6 = 0 \\quad \\checkmark', annotation: 'Verify the predicate is True for this witness.' },
        { expression: '\\therefore\\; \\exists n \\in \\mathbb{Z},\\; n^2 - n - 6 = 0. \\quad \\blacksquare', annotation: 'One verified witness is sufficient to conclude the existential.' },
      ],
      conclusion: 'Existential proofs are "point and verify." The entire proof is: name the witness, check it works. No algebraic generality is needed. (Note: n = −2 is also a valid witness — there can be many witnesses, but one suffices.)',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-01a-ch1',
      difficulty: 'easy',
      problem: 'Translate: "Every student has submitted at least one assignment." Use domains Students and Assignments.',
      hint: '"Every student" = ∀s ∈ Students. "At least one assignment" = ∃a ∈ Assignments. The predicate connects them.',
      walkthrough: [
        { expression: '\\forall s \\in \\text{Students},\\; \\exists a \\in \\text{Assignments},\\; \\text{Submitted}(s,a)', annotation: 'Every student (∀) has some assignment (∃) they submitted.' },
      ],
      answer: '∀s ∈ Students, ∃a ∈ Assignments, Submitted(s, a)',
    },
    {
      id: 'discrete-1-01a-ch2',
      difficulty: 'medium',
      problem: 'Is ∀x ∃y (x + y = 0) True or False over ℤ? What about ∃y ∀x (x + y = 0)?',
      hint: 'For the first: given any x, can you always find y? For the second: can one fixed y work for every x?',
      walkthrough: [
        { expression: '\\forall x \\in \\mathbb{Z},\\; \\exists y \\in \\mathbb{Z},\\; x + y = 0', annotation: 'Choose y = −x. Since −x ∈ ℤ for any x ∈ ℤ, this works. TRUE.' },
        { expression: '\\exists y \\in \\mathbb{Z},\\; \\forall x \\in \\mathbb{Z},\\; x + y = 0', annotation: 'Fix any y. Then x = 1 − y gives x + y = 1 ≠ 0. No single y works for all x. FALSE.' },
      ],
      answer: '∀x ∃y: TRUE. ∃y ∀x: FALSE. Swapping quantifier order changes the truth value.',
    },
    {
      id: 'discrete-1-01a-ch3',
      difficulty: 'hard',
      problem: 'Negate the statement: ∀x ∈ ℝ, ∃y ∈ ℝ, (y > x ∧ y is rational). Then interpret the negation in plain English.',
      hint: 'Push ¬ through ∀ then ∃, then apply De Morgan to the conjunction inside.',
      walkthrough: [
        { expression: '\\neg(\\forall x\\, \\exists y,\\; y > x \\wedge \\text{Rational}(y))', annotation: 'Wrap in ¬.' },
        { expression: '\\exists x\\, \\forall y,\\; \\neg(y > x \\wedge \\text{Rational}(y))', annotation: 'Push ¬ through ∀→∃ and ∃→∀.' },
        { expression: '\\exists x\\, \\forall y,\\; (y \\leq x \\vee \\neg\\text{Rational}(y))', annotation: 'Apply De Morgan to the conjunction: ¬(A∧B) ≡ ¬A∨¬B.' },
        { expression: '\\text{English: There is a real number } x \\text{ such that every rational number is} \\leq x.', annotation: 'In other words: the rational numbers are bounded above. This is FALSE — rationals are unbounded.' },
      ],
      answer: '∃x ∈ ℝ, ∀y ∈ ℝ, (y ≤ x ∨ y is irrational). In English: there is a real number that is an upper bound for all rationals — FALSE.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: 'Predicate logic extends propositional logic: quantifiers bind variables, and the same connectives (∧, ∨, →, ¬) operate on predicates. De Morgan\'s Laws for quantifiers mirror the propositional versions.' },
    { lessonSlug: 'induction-and-recursion', label: 'Mathematical Induction', context: 'Induction is the primary method for proving ∀n ∈ ℕ, P(n). The base case proves P(0), the inductive step proves ∀k (P(k) → P(k+1)). Induction makes universal quantification over ℕ tractable.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Relation properties (reflexive, symmetric, transitive) are expressed as universally quantified statements over a domain of pairs.' },
  ],

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01-propositions',
        label: 'Propositions and Proof Techniques',
        note: 'Predicate logic builds directly on propositional logic. The conditional (→), negation (¬), and De Morgan\'s Laws you learned there are used constantly here — especially when negating predicates inside quantified statements.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-02-induction',
        label: 'Mathematical Induction',
        note: 'Induction is the machine for proving universal statements ∀n ∈ ℕ, P(n). Every induction proof is a proof of a universally quantified statement — you will use the universal generalization pattern from this lesson constantly.',
      },
      {
        lessonId: 'discrete-1-03-counting',
        label: 'Counting and Combinatorics',
        note: 'Many combinatorial identities are stated as universal claims: ∀n ∈ ℕ, C(n,k) = n!/(k!(n−k)!). Proving them rigorously requires the universal generalization techniques from this lesson.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'pred-assess-1',
        type: 'choice',
        text: 'To disprove ∀x ∈ ℤ, x² > x, you need:',
        options: ['Prove x² ≤ x for all integers', 'Find one integer where x² ≤ x', 'Show x² ≤ x for infinitely many integers', 'Negate the predicate algebraically'],
        answer: 'Find one integer where x² ≤ x',
        hint: 'Disproving a universal only requires one counterexample.',
      },
      {
        id: 'pred-assess-2',
        type: 'input',
        text: 'What is ¬(∃x P(x)) equivalent to?',
        answer: '∀x ¬P(x)',
        hint: 'De Morgan for quantifiers: flip ∃ to ∀, land ¬ on the predicate.',
      },
    ],
  },

  mentalModel: [
    'P(x) is a template — no truth value until x is assigned or bound.',
    '∀x P(x): all elements satisfy P. One failure destroys it.',
    '∃x P(x): at least one element satisfies P. One success proves it.',
    'Proving ∀: introduce arbitrary x, prove P(x) generally.',
    'Proving ∃: exhibit one specific witness x₀, verify P(x₀).',
    '¬(∀x P(x)) ≡ ∃x ¬P(x). ¬(∃x P(x)) ≡ ∀x ¬P(x). Quantifiers flip, ¬ lands on predicate.',
    '∀x ∃y ≠ ∃y ∀x — order determines who chooses first and whether choices can depend on prior choices.',
    'Empty domain → ∀x P(x) is vacuously True.',
  ],

  quiz: [
    {
      id: 'pred-q1',
      type: 'choice',
      text: 'Which of the following has a definite truth value?',
      options: ['P(x): "x is prime"', '∀x ∈ ℕ, x > 0', 'x + 1 > x (x free)', '"x is odd" with no domain'],
      answer: '∀x ∈ ℕ, x > 0',
      hints: ['Only fully bound quantified statements are propositions with truth values. Free variables prevent evaluation.'],
      reviewSection: 'Intuition — free vs. bound variables',
    },
    {
      id: 'pred-q2',
      type: 'choice',
      text: 'What does ¬(∀x P(x)) simplify to?',
      options: ['∀x ¬P(x)', '∃x P(x)', '∃x ¬P(x)', '¬∃x P(x)'],
      answer: '∃x ¬P(x)',
      hints: ['De Morgan for quantifiers: ¬ flips ∀ to ∃ and lands on the predicate.'],
      reviewSection: 'Rigor — De Morgan for quantifiers',
    },
    {
      id: 'pred-q3',
      type: 'choice',
      text: 'To prove ∃x ∈ ℤ such that x² = 4, you should:',
      options: ['Show x² = 4 for all integers', 'Find one specific integer where x² = 4', 'Use induction', 'Apply the contrapositive'],
      answer: 'Find one specific integer where x² = 4',
      hints: ['Existential proofs just need a single witness. x = 2 or x = −2 both work.'],
      reviewSection: 'Math — proving existential statements',
    },
    {
      id: 'pred-q4',
      type: 'choice',
      text: 'Over the domain ℝ, is ∃y ∀x (x + y = 0) True or False?',
      options: ['True — let y = 0', 'True — let y = −x', 'False — no single y works for all x', 'False — x + y = 0 has no solution'],
      answer: 'False — no single y works for all x',
      hints: ['y must be fixed before x is chosen. Any fixed y fails when x ≠ −y.'],
      reviewSection: 'Math — nested quantifier order',
    },
    {
      id: 'pred-q5',
      type: 'input',
      text: 'Translate: "There exists a student who has submitted every assignment." Use variables s (students) and a (assignments).',
      answer: '∃s ∀a Submitted(s, a)',
      hints: ['"There exists" = ∃s. "Every assignment" = ∀a. The existential comes before the universal.'],
      reviewSection: 'Examples — translation',
    },
    {
      id: 'pred-q6',
      type: 'choice',
      text: 'If the domain is empty, what is the truth value of ∀x P(x)?',
      options: ['False', 'True (vacuously)', 'Undefined', 'Depends on P'],
      answer: 'True (vacuously)',
      hints: ['With no elements to serve as counterexamples, the universal is vacuously True.'],
      reviewSection: 'Math — vacuous truth',
    },
    {
      id: 'pred-q7',
      type: 'choice',
      text: 'What is the correct negation of ∀x ∃y (x < y)?',
      options: ['∀x ∀y (x ≥ y)', '∃x ∀y (x ≥ y)', '∃x ∃y (x ≥ y)', '∀x ∃y (x ≥ y)'],
      answer: '∃x ∀y (x ≥ y)',
      hints: ['Push ¬ through ∀→∃, then ∃→∀. Then negate x < y to get x ≥ y.'],
      reviewSection: 'Rigor — quantifier negation steps',
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};
