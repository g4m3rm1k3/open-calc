export default {
  id: 'ch0-sets-and-logic',
  slug: 'sets-and-logic',
  chapter: 0,
  order: 0.1,
  title: 'Sets & the Language of Logic',
  subtitle: 'The vocabulary every proof is written in',
  tags: ['sets', 'logic', 'quantifiers', 'for all', 'there exists', 'set-builder notation', 'union', 'intersection', 'complement', 'subset', 'element', 'empty set', 'Venn diagram', 'connectives', 'and', 'or', 'not', 'implies', 'if and only if', 'iff', 'proof', 'foundations'],

  hook: {
    question: 'How can two sentences that sound completely different mean exactly the same thing mathematically?',
    realWorldContext:
      'Every database query you run, every search filter you apply, and every logical condition in a program uses set operations and logical connectives. ' +
      'SQL uses UNION, INTERSECT, AND, OR — these are literally set theory and logic. ' +
      'When a doctor says "all patients with fever AND cough OR shortness of breath," the precise meaning depends on grouping — logic removes the ambiguity. ' +
      'Learning this language once means you can read any mathematical proof, any formal specification, and any legal contract with precision.',
    previewVisualizationId: null,
  },

  intuition: {
    prose: [
      'A **set** is simply a collection of objects, called **elements** or **members**. We write $a \\in S$ to mean "a is an element of S" and $a \\notin S$ to mean "a is not in S." That is the entire definition — sets are containers, and things are either in them or not.',

      'You can describe a set in two ways. **Roster notation** lists the elements explicitly: $\\{2, 4, 6, 8\\}$. **Set-builder notation** describes a rule: $\\{x \\in \\mathbb{Z} : x \\text{ is even and } 0 < x < 10\\}$. The colon (or vertical bar |) reads as "such that." Both describe the same set.',

      'The **empty set** $\\emptyset = \\{\\}$ contains no elements. It is a valid set — think of it as an empty box. Every set contains $\\emptyset$ as a subset, which might feel strange, but it is true by a logical technicality we will see in the rigor tab.',

      'Now for combining sets. The **union** $A \\cup B$ is everything in A or B (or both) — think of it as "gathering together." The **intersection** $A \\cap B$ is everything in both A and B — think of it as "overlap." The **complement** $A^c$ (or $\\overline{A}$) is everything NOT in A (relative to some universal set). The **set difference** $A \\setminus B$ is everything in A that is not in B.',

      'Logic is the grammar of mathematics. The basic **connectives** are: AND ($\\wedge$), OR ($\\vee$), NOT ($\\neg$), IMPLIES ($\\Rightarrow$), and IF AND ONLY IF ($\\Leftrightarrow$). In math, OR is always **inclusive** — "A or B" means "A or B or both." This differs from everyday English where "or" often means "one or the other but not both."',

      'The two **quantifiers** are the heart of formal mathematics. The **universal quantifier** $\\forall$ means "for all" or "for every." The **existential quantifier** $\\exists$ means "there exists" or "there is at least one." The statement $\\forall x \\in \\mathbb{R},\\; x^2 \\geq 0$ says "every real number squared is non-negative." The statement $\\exists x \\in \\mathbb{R} : x^2 = 2$ says "there is some real number whose square is 2."',

      'Negating quantified statements follows a beautiful pattern: the negation of "for all" is "there exists one that does not," and the negation of "there exists" is "for all, it is not." Symbolically: $\\neg(\\forall x, P(x)) \\equiv \\exists x, \\neg P(x)$ and $\\neg(\\exists x, P(x)) \\equiv \\forall x, \\neg P(x)$. This is crucial for understanding epsilon-delta proofs, where you often need to negate a limit definition.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Sets are Containers',
        body: 'Think of a set as a bag of objects. You can ask: is this item in the bag? You can combine bags (union), find shared items (intersection), or remove items (difference). Order does not matter, and duplicates are ignored: {1, 2, 3} = {3, 1, 2} = {1, 1, 2, 3}.',
      },
      {
        type: 'tip',
        title: 'Reading Set-Builder Notation',
        body: 'Read {x ∈ S : P(x)} as "the set of all x in S such that P(x) is true." Example: {x ∈ ℝ : x > 0} = "all positive real numbers" = (0, ∞).',
      },
      {
        type: 'misconception',
        title: 'OR Means "One or Both" in Math',
        body: 'In everyday English, "Would you like tea or coffee?" usually means pick one. In math, A ∨ B (A or B) is true when A is true, when B is true, or when BOTH are true. The exclusive "one but not both" is a different operation (XOR).',
      },
      {
        type: 'technique',
        title: 'Negating Quantifiers',
        body: 'Flip each quantifier and negate the predicate. ¬(∀x, P(x)) becomes ∃x, ¬P(x). ¬(∃x, P(x)) becomes ∀x, ¬P(x). Apply this rule from left to right through nested quantifiers.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      'We now formalize the key set operations. Let $U$ denote a **universal set** — the "universe" of all objects under consideration. For calculus, $U = \\mathbb{R}$ most of the time.',

      '**Subset**: $A \\subseteq B$ means every element of $A$ is also in $B$: $\\forall x,\\; x \\in A \\Rightarrow x \\in B$. If additionally $A \\neq B$, we write $A \\subsetneq B$ (proper subset). Two sets are equal when $A \\subseteq B$ and $B \\subseteq A$.',

      '**Union and intersection** generalize naturally. For a family of sets $A_1, A_2, \\ldots, A_n$, we write $\\displaystyle \\bigcup_{i=1}^{n} A_i$ for the union (elements in at least one $A_i$) and $\\displaystyle \\bigcap_{i=1}^{n} A_i$ for the intersection (elements in every $A_i$).',

      'An **implication** $P \\Rightarrow Q$ is read "if P then Q." P is the **hypothesis** and Q is the **conclusion**. The implication is false only when P is true but Q is false. Crucially, when P is false, the implication $P \\Rightarrow Q$ is **vacuously true** regardless of Q. This is why "all elements of the empty set are pink elephants" is a true statement.',

      'The **contrapositive** of $P \\Rightarrow Q$ is $\\neg Q \\Rightarrow \\neg P$. These are logically equivalent — proving one proves the other. The **converse** $Q \\Rightarrow P$ is a completely different statement that may or may not be true. Confusing an implication with its converse is one of the most common logical errors.',

      'A **biconditional** $P \\Leftrightarrow Q$ means $P \\Rightarrow Q$ AND $Q \\Rightarrow P$. We say "P if and only if Q" (abbreviated "iff"). To prove an iff statement, you must prove both directions.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Set Operations',
        body: 'A \\cup B = \\{x : x \\in A \\text{ or } x \\in B\\} \\\\ A \\cap B = \\{x : x \\in A \\text{ and } x \\in B\\} \\\\ A \\setminus B = \\{x : x \\in A \\text{ and } x \\notin B\\} \\\\ A^c = \\{x \\in U : x \\notin A\\}',
      },
      {
        type: 'theorem',
        title: "De Morgan's Laws",
        body: '(A \\cup B)^c = A^c \\cap B^c \\\\[4pt] (A \\cap B)^c = A^c \\cup B^c \\\\[6pt] \\text{Equivalently for logic:} \\\\[4pt] \\neg(P \\vee Q) \\equiv (\\neg P) \\wedge (\\neg Q) \\\\ \\neg(P \\wedge Q) \\equiv (\\neg P) \\vee (\\neg Q)',
      },
      {
        type: 'definition',
        title: 'Implication Truth Table',
        body: 'P \\Rightarrow Q \\text{ is FALSE only when } P \\text{ is TRUE and } Q \\text{ is FALSE.} \\\\ \\text{All other combinations yield TRUE.}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The claim that $\\emptyset \\subseteq A$ for every set $A$ follows from vacuous truth. We need to verify: $\\forall x,\\; x \\in \\emptyset \\Rightarrow x \\in A$. Since there is no $x$ with $x \\in \\emptyset$, the hypothesis is always false, so the implication is vacuously true for every $x$. Therefore $\\emptyset \\subseteq A$.',

      'De Morgan\'s Laws can be proved by showing mutual subset inclusion. To prove $(A \\cup B)^c \\subseteq A^c \\cap B^c$: let $x \\in (A \\cup B)^c$. Then $x \\notin A \\cup B$, meaning $x \\notin A$ AND $x \\notin B$ (if $x$ were in either, it would be in the union). So $x \\in A^c$ and $x \\in B^c$, hence $x \\in A^c \\cap B^c$. The reverse inclusion follows by reversing the argument.',

      'The logical equivalence of an implication and its contrapositive can be verified by truth table: $P \\Rightarrow Q$ and $\\neg Q \\Rightarrow \\neg P$ have identical truth values for all combinations of P and Q. This is not true for the converse $Q \\Rightarrow P$ or the inverse $\\neg P \\Rightarrow \\neg Q$.',

      'A subtle but important point: the order of quantifiers matters. The statement $\\forall x \\in \\mathbb{R},\\; \\exists y \\in \\mathbb{R},\\; y > x$ says "for every real number, there is a larger one" — this is true. The swapped version $\\exists y \\in \\mathbb{R},\\; \\forall x \\in \\mathbb{R},\\; y > x$ says "there is a real number larger than all others" — this is false. Swapping quantifiers changes the meaning entirely.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Vacuous Truth',
        body: '\\text{If } P \\text{ is false, then } P \\Rightarrow Q \\text{ is true for any } Q. \\\\ \\text{Consequence: } \\emptyset \\subseteq A \\text{ for every set } A.',
      },
      {
        type: 'tip',
        title: 'Proving Set Equality',
        body: 'To prove A = B, prove A ⊆ B (pick arbitrary x ∈ A, show x ∈ B) AND B ⊆ A (pick arbitrary x ∈ B, show x ∈ A). This "double containment" technique is the standard method.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-set-builder',
      title: 'Translating Set-Builder Notation',
      problem: 'Write the set $S = \\{x \\in \\mathbb{Z} : x^2 < 10\\}$ in roster notation.',
      steps: [
        { expression: 'x^2 < 10 \\implies |x| < \\sqrt{10} \\approx 3.16', annotation: 'Find which integers satisfy the condition.' },
        { expression: 'x \\in \\{-3, -2, -1, 0, 1, 2, 3\\}', annotation: 'List all integers with absolute value less than 3.16.' },
        { expression: '\\text{Check: } (-3)^2 = 9 < 10\\;\\checkmark, \\quad (4)^2 = 16 \\not< 10\\;\\times', annotation: 'Verify the boundary cases.' },
        { expression: 'S = \\{-3, -2, -1, 0, 1, 2, 3\\}', annotation: 'Seven elements in total.' },
      ],
      conclusion: 'Set-builder notation describes a rule; roster notation lists the results. For infinite sets, only set-builder works.',
    },
    {
      id: 'ex-union-intersection',
      title: 'Union and Intersection of Intervals',
      problem: 'Let $A = [-2, 3)$ and $B = (1, 5]$. Find $A \\cup B$, $A \\cap B$, and $A \\setminus B$.',
      steps: [
        { expression: 'A = [-2, 3), \\quad B = (1, 5]', annotation: 'Draw both intervals on a number line to visualize overlap.' },
        { expression: 'A \\cup B = [-2, 5]', annotation: 'Union: everything in either interval. A covers [-2, 3) and B covers (1, 5], together they cover [-2, 5].' },
        { expression: 'A \\cap B = (1, 3)', annotation: 'Intersection: the overlap region. Both intervals contain (1, 3). At x = 1: 1 ∉ B. At x = 3: 3 ∉ A.' },
        { expression: 'A \\setminus B = [-2, 1]', annotation: 'Difference: elements in A but not B. This is A with the overlap removed. x = 1 is in A but not in B, so it stays.' },
      ],
      conclusion: 'Visualizing intervals on a number line makes set operations concrete. Always check endpoints carefully.',
    },
    {
      id: 'ex-negate-quantifiers',
      title: 'Negating a Quantified Statement',
      problem: 'Negate the statement: $\\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x,\\; |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon$.',
      steps: [
        { expression: '\\neg\\bigl(\\forall \\varepsilon > 0,\\; \\exists \\delta > 0,\\; \\forall x,\\; |x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon\\bigr)', annotation: 'This is the epsilon-delta definition of a limit. We negate it step by step.' },
        { expression: '\\exists \\varepsilon > 0,\\; \\neg\\bigl(\\exists \\delta > 0,\\; \\forall x,\\; |x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon\\bigr)', annotation: 'Flip ∀ to ∃, push negation inward.' },
        { expression: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\neg\\bigl(\\forall x,\\; |x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon\\bigr)', annotation: 'Flip ∃ to ∀, push negation inward.' },
        { expression: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x,\\; \\neg\\bigl(|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon\\bigr)', annotation: 'Flip ∀ to ∃, push negation inward.' },
        { expression: '\\exists \\varepsilon > 0,\\; \\forall \\delta > 0,\\; \\exists x,\\; |x-a|<\\delta \\;\\wedge\\; |f(x)-L| \\geq \\varepsilon', annotation: 'Negate the implication: ¬(P ⟹ Q) ≡ P ∧ ¬Q.' },
      ],
      conclusion: 'The negation says: "there exists an epsilon such that no matter how small you make delta, you can find an x within delta of a where f(x) is at least epsilon away from L." This is exactly what it means for a limit NOT to exist.',
    },
    {
      id: 'ex-contrapositive',
      title: 'Contrapositive vs. Converse',
      problem: 'Consider the statement: "If $n^2$ is even, then $n$ is even." State its contrapositive, converse, and inverse. Which are equivalent to the original?',
      steps: [
        { expression: '\\text{Original: } n^2 \\text{ even} \\Rightarrow n \\text{ even}', annotation: 'This is P ⟹ Q.' },
        { expression: '\\text{Contrapositive: } n \\text{ odd} \\Rightarrow n^2 \\text{ odd}', annotation: '¬Q ⟹ ¬P. This is logically equivalent to the original.' },
        { expression: '\\text{Converse: } n \\text{ even} \\Rightarrow n^2 \\text{ even}', annotation: 'Q ⟹ P. This happens to be true here, but it is NOT logically equivalent.' },
        { expression: '\\text{Inverse: } n^2 \\text{ odd} \\Rightarrow n \\text{ odd}', annotation: '¬P ⟹ ¬Q. Equivalent to the converse, not to the original.' },
      ],
      conclusion: 'Only the contrapositive is logically equivalent to the original implication. The converse and inverse are equivalent to each other but not to the original.',
    },
  ],

  challenges: [
    {
      id: 'ch0-sets-c1',
      difficulty: 'easy',
      problem: 'Let $A = \\{1,2,3,4,5\\}$ and $B = \\{3,4,5,6,7\\}$. Find $A \\cup B$, $A \\cap B$, $A \\setminus B$, and $B \\setminus A$.',
      hint: 'Union gathers everything, intersection keeps only shared elements, difference removes the second set from the first.',
      walkthrough: [
        { expression: 'A \\cup B = \\{1,2,3,4,5,6,7\\}', annotation: 'Every element that appears in either set.' },
        { expression: 'A \\cap B = \\{3,4,5\\}', annotation: 'Elements common to both sets.' },
        { expression: 'A \\setminus B = \\{1,2\\}', annotation: 'Elements in A but not in B.' },
        { expression: 'B \\setminus A = \\{6,7\\}', annotation: 'Elements in B but not in A.' },
      ],
      answer: 'A ∪ B = {1,2,3,4,5,6,7}, A ∩ B = {3,4,5}, A \\ B = {1,2}, B \\ A = {6,7}',
    },
    {
      id: 'ch0-sets-c2',
      difficulty: 'medium',
      problem: 'Negate the statement: "For every student in the class, there exists a problem on the exam that they answered correctly."',
      hint: 'Translate to symbols first: ∀ student s, ∃ problem p, s answered p correctly. Then flip quantifiers and negate the predicate.',
      walkthrough: [
        { expression: '\\forall s,\\; \\exists p,\\; \\text{Correct}(s, p)', annotation: 'Symbolize the original statement.' },
        { expression: '\\neg(\\forall s,\\; \\exists p,\\; \\text{Correct}(s, p))', annotation: 'We want the negation.' },
        { expression: '\\exists s,\\; \\forall p,\\; \\neg\\text{Correct}(s, p)', annotation: 'Flip each quantifier, negate the predicate.' },
      ],
      answer: '"There exists a student in the class who answered every problem on the exam incorrectly." In other words, at least one student got a zero.',
    },
    {
      id: 'ch0-sets-c3',
      difficulty: 'hard',
      problem: 'Prove using De Morgan\'s Laws that $(A \\cup B) \\setminus C = (A \\setminus C) \\cup (B \\setminus C)$.',
      hint: 'Rewrite set difference using intersection and complement: X \\ Y = X ∩ Y^c. Then distribute.',
      walkthrough: [
        { expression: '(A \\cup B) \\setminus C = (A \\cup B) \\cap C^c', annotation: 'Rewrite difference as intersection with complement.' },
        { expression: '= (A \\cap C^c) \\cup (B \\cap C^c)', annotation: 'Distribute intersection over union (this is a set-theoretic law).' },
        { expression: '= (A \\setminus C) \\cup (B \\setminus C)', annotation: 'Rewrite back as set differences.' },
      ],
      answer: 'The distributive law for intersection over union gives us the result directly: (A ∪ B) \\ C = (A \\ C) ∪ (B \\ C).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'real-numbers', label: 'Real Numbers', context: 'Sets and logic provide the language to describe number systems precisely.' },
    { lessonSlug: 'inequalities', label: 'Inequalities', context: 'Set-builder notation is used heavily to describe solution sets of inequalities.' },
    { lessonSlug: 'epsilon-delta', label: 'Epsilon-Delta', context: 'The epsilon-delta definition of a limit uses nested quantifiers — understanding how to read and negate them is essential.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
