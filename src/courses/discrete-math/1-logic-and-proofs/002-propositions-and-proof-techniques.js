// FILE: src/content/discrete-math/01-propositions-and-proof-techniques.js
import implicationTruthTableUrl from '../diagrams/dm-implication-truth-table.svg?url'
import proofStrategiesMapUrl from '../diagrams/dm-proof-strategies-map.svg?url'

export default {
  id: 'discrete-1-01',
  slug: 'propositions-and-proof-techniques',
  chapter: 'discrete-1',
  order: 1,
  title: 'Propositions and Proof Techniques',
  subtitle: 'Building the foundation of mathematical reasoning — from bare statements to verified truth',
  tags: ['propositions', 'logic', 'proof', 'contrapositive', 'contradiction', 'direct proof', 'connectives', 'truth table'],
  aliases: 'discrete logic proofs truth table contrapositive contradiction direct proof connectives',

  semantics: {
    core: [
      { symbol: 'p, q, r', meaning: 'Propositional variables — stand-ins for any declarative true/false statement' },
      { symbol: '¬p', meaning: 'NOT p — the negation of p; True when p is False, False when p is True' },
      { symbol: 'p ∧ q', meaning: 'p AND q — True only when both p and q are True' },
      { symbol: 'p ∨ q', meaning: 'p OR q — True when at least one of p, q is True (inclusive or)' },
      { symbol: 'p → q', meaning: 'If p then q — the conditional; only False when p is True and q is False' },
      { symbol: 'p ↔ q', meaning: 'p if and only if q — the biconditional; True when p and q have the same truth value' },
      { symbol: '≡', meaning: 'Logical equivalence — two compound statements with identical truth tables' },
    ],
    rulesOfThumb: [
      'A proposition must be declarative and have a definite truth value. Questions and commands are not propositions.',
      'The conditional p → q is FALSE in exactly one case: p is True and q is False. Any other combination is True.',
      '"p only if q" translates to p → q, NOT q → p. The direction of the arrow is the direction of obligation.',
      'To prove p → q is False, you need a counterexample where p is True AND q is False simultaneously.',
      'Proof by Contrapositive: p → q has the same truth table as ¬q → ¬p. Prove whichever is easier.',
      'Proof by Contradiction: assume the negation of what you want to prove, then derive a logical impossibility.',
      'De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q and ¬(p ∨ q) ≡ ¬p ∧ ¬q.',
    ],
  },

  hook: {
    question: "If I promise you: 'If you get an A on the test, I will buy you a car.' Then you get a B — but I buy you a car anyway. Did I logically break my promise?",
    realWorldContext: "Almost everyone says yes. In everyday language, we hear 'if' and assume 'only if.' But in mathematics and software engineering, the answer is undeniably NO — and the distinction costs companies millions of dollars every year in buggy security code. Authentication logic, access control policies, and database query conditions all depend on the precise mathematical meaning of 'if-then.' A security engineer who confuses 'if authenticated then grant access' with 'if granted access then must be authenticated' creates a backdoor. Formal logic is not a philosophical game — it is the grammar of every proof you will ever write and every program that must be correct.",
  },

  intuition: {
    prose: [
      "**Where you are in the story.** Every field of mathematics and computer science runs on proofs — rigorous, unbreakable chains of reasoning that certify truth without appeal to authority or intuition. Before you can build those chains, you need to understand the individual links: statements that are either True or False, connected by logical operators. This lesson builds those links from scratch. You will leave it able to dissect any English argument into its logical skeleton, evaluate its truth under any circumstances, and choose the right proof strategy for any claim.",

      "Start with the most primitive concept: a **proposition** is a declarative sentence that is either True or False — never both, never neither. 'The number 7 is prime' is a proposition (True). 'Paris is the capital of Germany' is a proposition (False). 'What time is it?' is not a proposition — it is a question, neither true nor false. 'This sentence is false' is not a proposition — it is a self-referential paradox that cannot be assigned a stable truth value. The boundary matters: every statement in a formal proof must be a proposition.",

      "We use single letters like p, q, and r to substitute for propositions exactly the way algebra uses x and y for numbers. This is not just notation — it is the first act of abstraction. Instead of reasoning about 'the sky is blue' and 'it is raining' specifically, we can reason about p and q in general, and every conclusion we reach will apply to any propositions we later substitute for those variables.",

      "To build complex thoughts, we need to connect propositions. The **logical connectives** play the same role that +, ×, and ÷ play in arithmetic: they combine simple pieces into compound expressions. NOT (¬) reverses a truth value. AND (∧) is True only when both sides are True. OR (∨) is True when at least one side is True. These three are intuitive enough — the dangerous one is the **conditional** (→).",

      "The conditional 'if p then q' — written p → q — is the engine of all mathematical proof. It seems simple, but it behaves in a way that violates human intuition, and that violation causes beginners to stumble on proof problems repeatedly. Let's confront it directly now, before it becomes a mystery. The conditional p → q is False in exactly one situation: when p is True and q is False. In every other situation — including when p is False — it is True. If I promise 'if you get an A, I will buy you a car' and you get a B, I made no promise about what happens when you get a B. My promise was not broken. A promise can only be broken by fulfilling the condition and then failing to deliver.",

      "This single fact — the conditional is only False when the premise is True and the conclusion is False — has a name: **vacuous truth**. When the hypothesis p is False, the conditional p → q is True regardless of q. This is not a loophole or a philosophical curiosity; it is a precise engineering specification. In code, 'if (x > 100) { do something }' only executes the body when x > 100. When x is 3, the condition is False and nothing happens — but the 'if statement' was not violated. It just didn't fire.",

      `![Truth table for p implies q, showing the single False row and the two vacuously-true rows](${implicationTruthTableUrl})`,

      "The table makes the promise metaphor literal. Row 1: the promise was made and kept — True. Row 2: made and broken — the only False row. Rows 3 and 4: p was never True, so the promise was never invoked — vacuously True either way. Every one of the counterintuitive cases lives in rows 3 and 4, and the table shows there is nothing mysterious about them: they are just the rows where the 'if' never fired.",

      "**Two variations that will trick you constantly.** The **converse** of p → q is q → p. These are NOT logically equivalent. 'If it is raining, then the ground is wet' is true. Its converse, 'if the ground is wet, then it is raining,' is False — sprinklers exist. The **contrapositive** of p → q is ¬q → ¬p. These ARE equivalent — they have identical truth tables. 'If it is raining, then the ground is wet' means exactly the same thing as 'if the ground is not wet, then it is not raining.' This equivalence is the foundation of proof by contrapositive: whenever a direct proof is awkward, you can flip the statement and prove the contrapositive instead.",

      "The **biconditional** p ↔ q (read 'p if and only if q') is the two-way version: both p → q AND q → p must hold. It is True when p and q have the same truth value, False when they differ. Mathematical definitions are almost always biconditionals: 'n is even if and only if n = 2k for some integer k.' The 'if and only if' means the definition characterizes evenness completely in both directions.",

      "**De Morgan's Laws** tell you how to distribute a negation over AND and OR. When you negate 'I will study Algebra AND Geometry,' you do NOT get 'I will not study Algebra AND I will not study Geometry.' You get 'I will not study Algebra OR I will not study Geometry' — it suffices to skip one. Symbolically: ¬(p ∧ q) ≡ ¬p ∨ ¬q. The second law: ¬(p ∨ q) ≡ ¬p ∧ ¬q. These laws are used everywhere — in simplifying boolean expressions in code, in negating quantified statements in proofs, and in building correct logic for security conditions.",

      "**Where this is heading.** Once you can evaluate compound propositions, you can build truth tables that exhaustively verify whether a compound statement is always true (a **tautology**, like p ∨ ¬p), always false (a **contradiction**, like p ∧ ¬p), or only sometimes true (a **contingency**). And once you understand tautologies and logical equivalence, you are ready for the three proof templates that will carry you through this entire course: direct proof, proof by contrapositive, and proof by contradiction. Each template is a controlled strategy for building a valid argument — and each one you understand deeply is a new power you carry permanently.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of the Course — The Grammar of Truth',
        body: '**Starting here:** You build the atomic units of mathematical reasoning — propositions and their connectives.\n**This lesson:** The five logical operators, truth tables, logical equivalence, and the three foundational proof techniques.\n**Next lesson:** Predicate logic and quantifiers — scaling propositions from individual statements to sweeping claims about entire sets.',
      },
      {
        type: 'real-world',
        title: 'Where This Appears in Software',
        body: 'Every `if` statement in code is a conditional. Every `&&` is an AND (∧). Every `||` is an OR (∨). Every `!` is a NOT (¬). De Morgan\'s Law tells you how to refactor nested boolean conditions. Proof by Contradiction is the logic behind proofs of security protocols. The conditional truth table is literally the specification that CPU logic gates implement.',
      },
      {
        type: 'definition',
        title: 'The Logic Dictionary',
        body: '| Symbol | Name | Rule |\n|---|---|---|\n| ¬p | Negation | Opposite truth value |\n| p ∧ q | Conjunction (AND) | True only if both True |\n| p ∨ q | Disjunction (OR) | True if at least one True |\n| p → q | Conditional (IF-THEN) | False only if p True, q False |\n| p ↔ q | Biconditional (IFF) | True if same truth value |',
      },
      {
        type: 'misconception',
        title: 'The Converse Is NOT the Contrapositive',
        body: 'Converse of (p → q) is (q → p) — NOT equivalent to the original.\nContrapositive of (p → q) is (¬q → ¬p) — ALWAYS equivalent to the original.\nConfusing these two is the single most common error in discrete math proofs.',
      },
    ],
    visualizations: [
      {
        id: 'LogicalOperatorsExplorer',
        title: 'Logical Operators Explorer',
        mathBridge: 'Set p = True and q = False. Check each connective: AND should be False (not both true), OR should be True (at least one), and IF-THEN should be — what? This is the key case: p is True and q is False, so p → q is False. Now set p = False and q = False. Recheck each connective. Pay special attention to p → q: when p is False, the conditional is True regardless of q. This is vacuous truth. Try every combination of (T,T), (T,F), (F,T), (F,F) and build your own truth table for p → q mentally before checking.',
        caption: 'Toggle p and q through all four combinations. The conditional p → q should be False in exactly one case. Find it — that case is the entire engine of what it means to break a promise.',
      },
      {
        id: 'TruthTableLab',
        title: 'The Dynamic Truth Table Lab',
        mathBridge: 'Start by typing "p AND NOT p" in the expression box. The final column should be all False — this is a Contradiction. Now type "p OR NOT p." The final column should be all True — a Tautology. Now try "NOT (p AND q)" on one line and "(NOT p) OR (NOT q)" on another. If the final columns match perfectly, the two expressions are logically equivalent — this is De Morgan\'s Law. The lab proves equivalences by exhaustive verification, which is only possible for finite truth tables. For infinite domains, we will need quantifiers and proofs.',
        caption: 'Build any expression and read its truth table. Make a Tautology (all T), a Contradiction (all F), or verify two expressions are logically equivalent by comparing their final columns.',
      },
      {
        id: 'ConditionalVariantsLab',
        title: 'Conditional Variants Lab',
        caption: 'Toggle P and Q and watch Converse, Inverse, and Contrapositive update live — see exactly why proof by contrapositive works.',
      },
    ],
  },

  math: {
    prose: [
      "A **truth table** is the complete, systematic enumeration of all possible truth-value combinations for a compound proposition. For n propositional variables, there are 2ⁿ rows — one per possible assignment of True/False to each variable. Truth tables are the ground truth for propositional logic: if you want to know whether two expressions are logically equivalent, you check whether they have identical final columns under every combination. If every row of the final column is True, the expression is a **tautology**. If every row is False, it is a **contradiction**. Otherwise, it is a **contingency** — its truth depends on the world.",

      "Two compound propositions are **logically equivalent** — written ≡ — if they have the same truth value under every possible assignment of truth values to their variables. The most important equivalences in proof strategy are these: the contrapositive (p → q ≡ ¬q → ¬p), implication as disjunction (p → q ≡ ¬p ∨ q), and De Morgan's Laws (¬(p ∧ q) ≡ ¬p ∨ ¬q and ¬(p ∨ q) ≡ ¬p ∧ ¬q). Each one lets you substitute one form of a statement for another — which is exactly what proof techniques do.",

      "Now we can state the four foundational proof templates precisely. The first is **Direct Proof**: to prove that a statement of the form p → q is true, assume p is True and deduce q using a chain of valid logical steps. Each step must follow from the previous step by a known theorem, definition, or algebraic law. The word 'assume' is not optional — you explicitly state 'Assume p' at the beginning, and then every subsequent line is constrained by that assumption and by logic.",

      "The second is **Proof by Contrapositive**: since p → q is logically equivalent to ¬q → ¬p, you can prove the contrapositive instead whenever it is easier. The key move is recognizing when a direct proof requires solving for the hypothesis (which is often algebraically messy), while the contrapositive lets you start with a clean assumption and push forward. The proof of the contrapositive is a direct proof of ¬q → ¬p — you assume ¬q and deduce ¬p.",

      "The third is **Proof by Contradiction**: to prove statement P, assume ¬P (the negation of what you want to prove) and derive a contradiction — any statement of the form Q ∧ ¬Q, or a statement that contradicts a known fact, definition, or the original hypothesis. Since valid logic from a True premise cannot yield a contradiction, your assumption ¬P must have been False, which means P is True. The power of this technique is that it converts an existence claim or an impossibility claim into an algebraic problem.",

      "The fourth is **Proof by Cases**: when the statement you are proving doesn't yield to one clean algebraic path — because different inputs genuinely behave differently — split the universe of possibilities into an exhaustive set of non-overlapping cases, then prove the claim separately within each one. 'Exhaustive' is the load-bearing word: the cases must cover every possibility with no gaps, or the proof has a hole. Case splits typically come from a natural either/or already hiding in the statement: a number is either even or odd, a real number is positive, negative, or zero, an element either belongs to a set or it doesn't. Proving each case is usually just a direct proof restricted to that slice of the universe — the technique isn't a new kind of logical move, it's a strategy for organizing several direct proofs into one complete argument.",

      `![Decision map for the four proof strategies: Direct, Contrapositive, Contradiction, and Cases](${proofStrategiesMapUrl})`,

      "Keep this map close for the rest of the course. Every proof you meet from here on is answerable by one of these four boxes — the only real skill is reading the shape of the claim correctly before you commit to one.",

      "Two definitions are essential for using these proof templates on integer problems. An integer n is **even** if there exists an integer k such that n = 2k. An integer n is **odd** if there exists an integer k such that n = 2k + 1. These definitions are not just descriptions — they are the operational handles that let you do algebra on the abstract property of evenness. Without them, 'n is even' is a phrase; with them, it is an equation you can manipulate.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Contrapositive Equivalence',
        body: 'p \\rightarrow q \\equiv \\neg q \\rightarrow \\neg p\n\nThis is provable by truth table: both expressions have identical final columns. Because they are equivalent, proving the contrapositive is just as valid as a direct proof.',
      },
      {
        type: 'theorem',
        title: "De Morgan's Laws",
        body: '\\[\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q\\]\n\n\\[\\neg(p \\vee q) \\equiv \\neg p \\wedge \\neg q\\]\n\nTo negate AND, flip to OR and negate each part. To negate OR, flip to AND and negate each part.',
      },
      {
        type: 'theorem',
        title: 'Logical Equivalences Worth Memorizing',
        body: 'p \\rightarrow q \\equiv \\neg p \\vee q \\quad \\text{(Implication as Disjunction)}\n\np \\leftrightarrow q \\equiv (p \\rightarrow q) \\wedge (q \\rightarrow p) \\quad \\text{(Biconditional as two conditionals)}\n\n\\neg(p \\rightarrow q) \\equiv p \\wedge \\neg q \\quad \\text{(Negation of a Conditional)}',
      },
      {
        type: 'definition',
        title: 'Even and Odd Integers — The Operational Definitions',
        body: 'n \\text{ is EVEN} \\iff \\exists \\, k \\in \\mathbb{Z} \\text{ such that } n = 2k\n\nn \\text{ is ODD} \\iff \\exists \\, k \\in \\mathbb{Z} \\text{ such that } n = 2k + 1\n\nThese two sets partition the integers: every integer is exactly one of even or odd.',
      },
      {
        type: 'insight',
        title: 'Tautology, Contradiction, Contingency',
        body: '**Tautology:** final column is all T — true in every possible world. Example: p ∨ ¬p.\n**Contradiction:** final column is all F — impossible in any world. Example: p ∧ ¬p.\n**Contingency:** some T, some F — truth depends on the assignment. Example: p → q.',
      },
      {
        type: 'warning',
        title: 'The Conditional Is Vacuously True When p Is False',
        body: 'p → q is True whenever p is False — period. This is not a workaround; it is the definition. When the hypothesis fails, the promise is never tested. In code: when the `if` condition is false, the body never executes, so it cannot "fail." The if-statement is satisfied.',
      },
    ],
    visualizations: [
      {
        id: 'LogicGateSim',
        title: 'Logic Gates in Hardware',
        mathBridge: 'Wire up an AND gate: set both switches to High (True) and observe the output. Now flip one to Low (False) — the output dies. This is p ∧ q. Now wire an OR gate and flip one switch — the output stays High as long as one switch is on. This is p ∨ q. Finally, find the NOT gate and observe that it purely inverts. Now try to build ¬(p ∧ q) two ways: (1) put a NOT gate after an AND gate; (2) put NOT gates on each input, then run through an OR gate. If both produce the same output table, you have verified De Morgan\'s Law in hardware.',
        caption: 'Wire gates and flip switches. Every truth-table row is a physical switch configuration. De Morgan\'s Law shows up as two physically different circuits with identical behavior.',
      },
      {
        id: 'TruthCube3D',
        title: 'The Truth Cube — All 8 Combinations at Once',
        mathBridge: 'Each vertex of this cube is one row of a three-variable truth table. The x-axis encodes p, the y-axis encodes q, the z-axis encodes r. A vertex is highlighted if the compound expression is True at that assignment. Expression p ∧ q ∧ r lights only the (T,T,T) vertex. The expression p ∨ q ∨ r leaves only (F,F,F) dark. Find the expression that lights exactly half the vertices — one corner of each face.',
        caption: 'Every vertex of the cube is a truth assignment. Highlighted vertices satisfy the current expression. Change the expression and watch the pattern of highlighted vertices shift.',
      },
    ],
  },

  rigor: {
    prose: [
      "**The full machinery of rigorous proof.** In the intuition and math sections, we built the vocabulary and identified the four proof templates. Now we execute them — slowly, with every step labelled and every justification named. Read these proofs as a craftsperson reads a master's work: not just for the answer, but for the technique.",

      "**Part I: Truth Tables — The Ground Truth.** Before proofs, we need to deeply understand why truth tables work as a verification tool. A truth table is an exhaustive enumeration: for n propositional variables, there are exactly 2ⁿ rows, one for each possible assignment of True/False to the variables. This exhaustion principle is what makes truth tables authoritative. If a compound proposition is True in every single row, it is True no matter what the world looks like — that is a tautology. You cannot argue with an exhaustive check.",

      "Let's build the truth table for p → q from scratch, column by column. We have two variables, so 2² = 4 rows. The systematic way to fill in the variable columns is to alternate: p cycles T, T, F, F and q cycles T, F, T, F. This ensures every combination appears exactly once. Then we evaluate p → q in each row using the rule: False only when p = T and q = F.",

      "Now let's build the truth tables for p → q and ¬q → ¬p side by side and confirm they are identical. Column ¬p flips every entry in p. Column ¬q flips every entry in q. Column ¬q → ¬p applies the conditional rule to these flipped columns. When you compare the final column of p → q with the final column of ¬q → ¬p row for row, they match exactly. This is not a coincidence — it is the proof that contrapositive equivalence is a tautological truth.",

      "**Part II: Why Each Proof Technique Works — The Deep Logic.** Each proof technique is not just a recipe. It is the *application of a logical equivalence* to a strategic goal. Understanding the logical reason behind each technique lets you invent your own variations in novel situations.",

      "**Why Direct Proof Works.** When you prove p → q directly, you are constructing a witness to the conditional's truth in the only case that matters. The conditional p → q is False only when p is True and q is False. A direct proof starts by granting p = True and then showing, by valid algebra, that q must also be True. Since we have ruled out the only case where the conditional is False (p=T, q=F), we have proved the conditional is True.",

      "**Why Contrapositive Works.** The statement p → q and its contrapositive ¬q → ¬p have identical truth tables. This means they are the same logical assertion — two different English sentences describing the same constraint on reality. Proving the contrapositive directly (assuming ¬q and deducing ¬p) is therefore not an approximation or a shortcut — it is a perfectly rigorous proof of the original statement. The switch to the contrapositive is a switch to an equivalent problem that happens to have a cleaner algebraic structure.",

      "**Why Contradiction Works.** Proof by Contradiction rests on the Law of Excluded Middle: for any proposition P, exactly one of P and ¬P is True. There is no middle ground. If you assume ¬P and the laws of logic force you to conclude something impossible (a contradiction — a statement that is always False, like Q ∧ ¬Q), then ¬P cannot be True. By the Law of Excluded Middle, P must be True. The proof is airtight because the logical laws we use are tautologically valid — they hold in every possible universe.",

      "A subtle point: Proof by Contradiction is more powerful than Proof by Contrapositive in a specific sense. The contrapositive only applies when the statement has the form p → q (a conditional). Contradiction can prove any statement P — existence claims, universal claims, irrationality, infinitude of primes. This extra generality is why some of the most famous proofs in mathematics (infinite primes, irrationality of square roots, undecidability results in computer science) use contradiction.",

      "**Why Proof by Cases Works.** This one rests on nothing more exotic than the Law of Excluded Middle applied repeatedly. If you can show that cases C₁, C₂, …, Cₙ are exhaustive — every element of the domain falls into at least one of them — and you prove the claim holds inside each case individually, then the claim holds everywhere, because 'everywhere' is nothing but the union of the cases. The logical justification is disjunction elimination: from (C₁ ∨ C₂ ∨ … ∨ Cₙ) and (C₁ → claim), (C₂ → claim), …, (Cₙ → claim), you may validly conclude claim. The entire technique lives or dies on that word 'exhaustive' — a case split that quietly skips a possibility (forgetting zero when splitting on positive/negative, say) produces a proof with an invisible hole. Always state explicitly why the cases cover everything, not just that they do.",

      "**Part III: Four Full Proofs — Fully Annotated.** We now work through each technique with complete annotation. For each step, I will label: (A) what we are doing, (B) why we are allowed to do it, and (C) what it gives us.",

      "**Historical note: Why do we demand this level of rigor?** Throughout most of mathematics' history, proofs were written more informally — Euclid assumed things about geometry that were not explicitly stated. In the 19th century, mathematicians discovered that informal reasoning led to contradictions in areas like set theory and analysis. The response was to formalize everything: every step must cite either an axiom, a definition, or a previously proved theorem. The style of proof you are learning here is the modern standard — rigorous enough to be formalized in proof verification software like Lean or Coq, but natural enough to be read by humans.",

      "**For the programmer:** Every formal proof can, in principle, be checked by a machine. Proof assistants like Lean 4, Coq, and Agda let you write mathematics as code and have the computer verify every step. What you are learning is not just mathematics — it is the logic underlying provably correct software. When NASA writes safety-critical code for spacecraft, the gold standard is formal verification using exactly this style of reasoning.",

      "**For the philosopher:** The four proof techniques correspond to four different stances toward truth. Direct proof is constructive: you build the truth from the ground up. Contrapositive is transformative: you rephrase the problem into an equivalent one. Contradiction is eliminative: you rule out falsehood and conclude truth by absence. Cases is combinatorial: you don't find one universal argument at all — you accept that the universe is genuinely heterogeneous and cover it piece by piece. In intuitionistic logic (a branch of mathematical logic), Proof by Contradiction is actually considered weaker than direct proof for certain propositions — because eliminating falsehood does not always mean you can construct a witness to truth. This is deep. For most mathematics, classical logic admits all four as equally valid.",
    ],

    // Flat {expression, annotation} steps — this is what DynamicProof (the
    // component that renders rigor.proofSteps) actually reads per step. The
    // separately-worked theorems (direct/contrapositive/contradiction/cases)
    // live in `examples` below as their own scrubbable walkthroughs, so this
    // one continuous proof covers only what isn't duplicated there: building
    // the two foundational truth tables, then the parity lemma the √2 proof
    // depends on.
    proofSteps: [
      { expression: '\\begin{array}{c|c|c} p & q & p \\rightarrow q \\\\ \\hline T & T & \\\\ T & F & \\\\ F & T & \\\\ F & F & \\end{array}', annotation: '**Setup.** Draw a table with columns p, q, p → q. There are 2² = 4 rows — one per combination of truth values.' },
      { expression: 'T \\rightarrow T = T', annotation: '**Row 1.** Both True. The promise is made and delivered. Conditional: True.' },
      { expression: 'T \\rightarrow F = F', annotation: '**Row 2.** p True, q False. The promise is made but not delivered — this is the only case where the conditional is False.' },
      { expression: 'F \\rightarrow T = T', annotation: '**Row 3.** p False, q True. The promise was never triggered — vacuously True.' },
      { expression: 'F \\rightarrow F = T', annotation: '**Row 4.** Both False. Again, never triggered — vacuously True.' },
      { expression: '\\begin{array}{c|c|c} p & q & p \\rightarrow q \\\\ \\hline T & T & T \\\\ T & F & F \\\\ F & T & T \\\\ F & F & T \\end{array}', annotation: '**Complete table.** Exactly one row is False — this is the entire truth-functional definition of →.' },
      { expression: '\\begin{array}{c|c|c|c} p & q & \\neg p & \\neg q \\\\ \\hline T & T & F & F \\\\ T & F & F & T \\\\ F & T & T & F \\\\ F & F & T & T \\end{array}', annotation: '**Build columns.** Now verify the contrapositive is equivalent. Compute ¬p and ¬q by flipping the base columns.' },
      { expression: '\\begin{array}{c|c|c} p & q & p \\rightarrow q \\\\ \\hline T & T & T \\\\ T & F & F \\\\ F & T & T \\\\ F & F & T \\end{array}', annotation: '**Compute p → q.** Apply the conditional rule to columns p and q — this is the same table as above.' },
      { expression: '\\begin{array}{c|c|c} \\neg q & \\neg p & \\neg q \\rightarrow \\neg p \\\\ \\hline F & F & T \\\\ T & F & F \\\\ F & T & T \\\\ T & T & T \\end{array}', annotation: '**Compute ¬q → ¬p.** Apply the conditional rule again, now to columns ¬q (playing the role of "p") and ¬p (playing the role of "q").' },
      { expression: 'p \\rightarrow q \\equiv \\neg q \\rightarrow \\neg p \\quad \\checkmark', annotation: '**Compare final columns.** T, F, T, T in both cases — identical. This is the proof that contrapositive equivalence is a tautology, not an approximation.' },
      { expression: 'p: n^2 \\text{ is even}, \\quad q: n \\text{ is even}. \\quad \\text{Prove contrapositive: } \\neg q \\rightarrow \\neg p.', annotation: '**Lemma (needed for the √2 proof below): if n² is even, then n is even.** Proved by contrapositive: assume n is odd and show n² is odd.' },
      { expression: 'n = 2k + 1 \\text{ for some } k \\in \\mathbb{Z}', annotation: 'Assume n is odd, using the definition of odd.' },
      { expression: 'n^2 = (2k+1)^2 = 4k^2 + 4k + 1', annotation: 'Square n and expand.' },
      { expression: 'n^2 = 2(2k^2 + 2k) + 1', annotation: 'Factor a 2 out of the first two terms.' },
      { expression: 'n^2 = 2(2k^2+2k)+1 \\implies n^2 \\text{ is odd}', annotation: '2k² + 2k is an integer, so n² has the form 2m + 1 — the definition of odd.' },
      { expression: '\\neg q \\rightarrow \\neg p \\equiv p \\rightarrow q \\quad \\blacksquare', annotation: 'The contrapositive is proved, so by contrapositive equivalence, n² even ⟹ n even. This exact lemma gets used twice in the √2 irrationality proof in the examples below.' },
    ],

    callouts: [
      {
        type: 'proof-map',
        title: 'Which Proof Strategy Do I Use? The Decision Tree',
        body: 'Scan the statement top-down:\n\n1. **Direct:** Can you assume p and push forward to q using definitions and algebra without hitting division or square roots? → Use Direct Proof.\n2. **Contrapositive:** Does the hypothesis p have a messy structure (like "3n+2 is odd") while the negated conclusion (like "n is even") gives you a clean formula? → Write the contrapositive and do a direct proof of it.\n3. **Contradiction:** Are you proving something is irrational, infinite, or impossible? Does the statement have NO conditional structure at all (just a standalone claim)? → Use Contradiction.\n4. **Cases:** Does the statement genuinely behave differently on different parts of the domain (sign, parity, membership) so no single algebraic path covers all of it? → Split into exhaustive, non-overlapping cases and prove each one.\n\nIf several seem possible, try Direct first — it is the most transparent. When Direct stalls because of a genuine split in behavior, use Cases. When Direct stalls for algebraic-messiness reasons, try Contrapositive. When neither works, Contradiction.',
      },
      {
        type: 'history',
        title: 'The Discovery That Rocked Ancient Mathematics',
        body: 'The irrationality of √2 was discovered by the Pythagoreans around 500 BC. According to legend, the discovery was so disturbing — it shattered their belief that all numbers were ratios of integers — that the member who revealed it was drowned. The proof we gave is essentially the one known to ancient Greek mathematicians. In the 19th century, Cantor proved there are infinitely many more irrational numbers than rational numbers — in fact, "almost all" real numbers are irrational in a precise mathematical sense. The proof you just learned is the opening door to all of that.',
      },
      {
        type: 'real-world',
        title: 'Proofs in Software Verification',
        body: 'Modern safety-critical software — used in aircraft autopilots, nuclear reactor control systems, and autonomous vehicles — must be formally verified. Engineers use proof systems like Coq and Isabelle to write machine-checkable proofs that the software satisfies its specification. Every theorem you prove by hand in this course can, in principle, be transcribed into such a system and verified automatically. Proof by Contradiction and Proof by Contrapositive are used constantly in formal verification — the techniques are not academic exercises, they are industrial tools.',
      },
      {
        type: 'insight',
        title: 'The Law of Excluded Middle — Philosophical Depth',
        body: 'Proof by Contradiction relies on the Law of Excluded Middle (LEM): for any proposition P, exactly one of P and ¬P is True. This is an axiom of classical logic, used universally in mathematics. However, in constructive mathematics and intuitionistic logic — championed by the Dutch mathematician L.E.J. Brouwer — the LEM is not accepted as an axiom. In constructive logic, to prove P exists, you must actually construct it; ruling out ¬P is not sufficient. This leads to a fundamentally different style of proof and has connections to programming: a constructive proof of P corresponds to a program that computes a witness to P. This is the deep link between logic and functional programming (the Curry-Howard correspondence).',
      },
      {
        type: 'insight',
        title: 'Why infinite descent is a contradiction technique',
        body: 'The √2 proof has a beautiful hidden structure called infinite descent. We started with a/b in lowest terms. We proved this implies a/b is NOT in lowest terms (there is a common factor of 2). But then the \"reduced\" version a/2 ÷ b/2 would also need to be reduced — and by the same argument, ALSO not in lowest terms. This generates an infinite descending sequence of positive integers, which is impossible (positive integers cannot decrease forever). Fermat used this idea to prove impossibility results that stumped mathematicians for decades. Recognizing the descent is recognizing that the contradiction hides inside an infinite regress.',
      },
    ],
    visualizations: [
      {
        id: 'DominoInductionLab',
        title: 'How Proofs Chain Together — The Domino Model',
        mathBridge: 'Each domino is a proved proposition. When one falls (is proved True), its contact with the next represents a logical implication (p → q). The entire chain falling represents a valid deductive chain. Now remove one domino without proving it — the chain stops. This is what happens when a proof skips a step without justification. Press "add gap" and observe: even if all the other dominoes are correct, an unjustified gap breaks the entire argument. In a real proof, every single line must be justified by either a definition, an axiom, or a previously proved theorem.',
        caption: 'Every step in a proof must be proven, not assumed. Add a gap in the chain and watch the proof fail. This is the visual meaning of rigor.',
      },
      {
        id: 'ProofStrategySelector',
        title: 'Interactive Proof Strategy Decision Tree',
        mathBridge: 'Enter a statement in English (e.g., "if n² is even then n is even"). The visualizer identifies whether it is a conditional, an existence claim, or a universal claim, and suggests the most natural proof strategy. For each suggested strategy, click to see a skeleton of the proof structure — the blank template you would fill in for this specific statement.',
        caption: 'Enter any statement. Get a suggested proof strategy with a structural skeleton. Practice recognizing proof types before starting algebra.',
      },
    ],
  },


  examples: [
    {
      id: 'discrete-1-01-ex0',
      title: 'The Translation Bridge Challenge',
      problem: "\\text{Translate the following English statements into formal logic, where } p\\text{: \"It is raining\"} \\text{ and } q\\text{: \"The ground is wet.\"}",
      steps: [
        {
          expression: '\\text{Statement A: }\\text{\"It is not raining and the ground is wet.\"}',
          annotation: 'Identify the atomic propositions and the operator connecting them.',
          strategyTitle: 'Parse the Sentence Structure',
          checkpoint: 'Which proposition is being negated? Which connective links the two parts?',
          hints: [
            '"Not raining" negates p, giving ¬p. "And" connects ¬p and q with the conjunction operator ∧.',
            'Conjunction (∧) is True only when both sides are True. Here ¬p must be True (it is not raining) AND q must be True (ground is wet).',
            'The structure is: (negation of p) AND (q). The "not" only reaches the first part — "and the ground is wet" is a separate clause joined by the conjunction, not part of what is negated.',
          ],
        },
        {
          expression: '\\neg p \\wedge q',
          annotation: 'Statement A translates cleanly. The NOT applies only to the raining clause.',
        },
        {
          expression: '\\text{Statement B: }\\text{\"The ground is wet only if it is raining.\"}',
          annotation: 'Translate the tricky "only if" structure. This is notoriously counterintuitive.',
          strategyTitle: 'Decode "Only If"',
          checkpoint: 'Does "q only if p" give you q → p or p → q?',
          hints: [
            '"Only if" establishes a necessary condition. "The ground is wet only if it is raining" means rain is a required condition for wetness — if the ground is wet, it must have been raining.',
            'Read it as: "the ground cannot be wet unless it is raining." If wet ground (q) is True, then rain (p) must be True. This gives q → p.',
            'Contrast with "if it is raining then the ground is wet" (p → q). These are converses of each other — different statements with potentially different truth values. The direction of "only if" is opposite to the direction of "if."',
          ],
        },
        {
          expression: 'q \\rightarrow p',
          annotation: 'Statement B. "q only if p" is q → p, not p → q. The arrow points in the direction of necessity.',
        },
        {
          expression: '\\text{Statement C: }\\text{\"If it is raining, then the ground is not wet.\"}',
          annotation: 'A straightforward conditional — but the conclusion is negated.',
          strategyTitle: 'Negated Conclusion',
          checkpoint: 'What is the hypothesis? What is the conclusion? Is the conclusion negated inside or outside the conditional?',
          hints: [
            'Hypothesis: p (it is raining). Conclusion: ¬q (the ground is NOT wet). The negation is inside the conclusion.',
            'The conditional structure p → (¬q) says: whenever it rains, the ground stays dry — this is physically unusual but logically valid.',
          ],
        },
        {
          expression: 'p \\rightarrow \\neg q',
          annotation: 'Statement C. The negation lives inside the conclusion, not wrapping the whole conditional.',
        },
        {
          expression: '\\text{Statement D (Boss Mode): }\\text{\"It is false that: if it is raining, then the ground is not wet.\"}',
          annotation: '"It is false that" is an external negation wrapping an entire compound statement. Work inside-out.',
          strategyTitle: 'Outer Negation of a Compound',
          checkpoint: 'What exactly is being negated — part of the sentence or the entire conditional?',
          hints: [
            '"It is false that" means ¬(entire expression that follows). Parse the inner part first, then wrap it in negation.',
            'The inner part is Statement C: p → ¬q. So the full translation is ¬(p → ¬q).',
            'You can simplify: ¬(p → ¬q) ≡ p ∧ ¬(¬q) ≡ p ∧ q, using ¬(A → B) ≡ A ∧ ¬B. So this says: it is actually raining AND the ground IS wet.',
          ],
        },
        {
          expression: '\\neg(p \\rightarrow \\neg q)',
          annotation: 'Boss Mode: the outer negation wraps the entire conditional. Optionally simplify to p ∧ q.',
        },
      ],
      conclusion: 'The same few English words ("if," "only if," "not," "it is false that") have precise, non-interchangeable meanings in logic. Investing in these translations now pays off in every proof you write for the rest of this course.',
    },
    {
      id: 'discrete-1-01-ex1',
      title: 'Worked Proof: Direct Approach',
      problem: '\\text{Prove: If } a \\text{ and } b \\text{ are even integers, then } (a + b) \\text{ is even.}',
      steps: [
        {
          expression: '\\textbf{Proof.} \\text{ Assume } a \\text{ and } b \\text{ are even integers.}',
          annotation: 'Every proof begins with an explicit statement of what is assumed. In a direct proof, you assume the hypothesis (the "if" part).',
          strategyTitle: 'State the Hypothesis',
          checkpoint: 'What are you allowed to assume? What are you trying to show?',
          hints: [
            'You assume: a is even AND b is even. You are trying to show: a + b is even.',
            'Begin every proof by writing "Assume [hypothesis]." This is not optional — it is the first line of the logical chain.',
          ],
        },
        {
          expression: 'a = 2j \\text{ and } b = 2k \\text{ for some integers } j, k.',
          annotation: 'Apply the definition of even to both variables. This converts abstract properties into algebraic handles.',
          strategyTitle: 'Invoke the Definition',
          checkpoint: 'Why do we use different letters j and k rather than the same letter for both?',
          hints: [
            'Every even integer can be written as 2 times some integer. But a and b may be different even numbers, so their multipliers may differ.',
            'a = 2j, b = 2k. If we used the same letter — say, a = 2k and b = 2k — we would be claiming a = b, which is not assumed.',
            'The variables j and k are integers that exist because a and b are even. We are not choosing them; we are asserting their existence based on the definition.',
          ],
        },
        {
          expression: 'a + b = 2j + 2k = 2(j + k)',
          annotation: 'Substitute into the expression we care about and use algebra to expose its structure.',
          strategyTitle: 'Algebraic Manipulation',
          checkpoint: 'What does it mean for a + b to be even? What exact form does it need to have?',
          hints: [
            'To prove a + b is even, we need to show it equals 2 times some integer.',
            'Factor out the 2: 2j + 2k = 2(j + k). Now the expression has the form 2 × (something).',
            'The "something" must be verified to be an integer before we can call the whole expression even.',
          ],
        },
        {
          expression: '\\text{Let } m = j + k. \\text{ Since } j, k \\in \\mathbb{Z}, \\text{ we have } m \\in \\mathbb{Z}.',
          annotation: 'Name the new integer and verify it actually is an integer using closure of the integers under addition.',
          strategyTitle: 'Verify Integer Closure',
          checkpoint: 'Why must we explicitly confirm m is an integer? Can\'t we just assume it?',
          hints: [
            'Proofs require every claim to be justified. "j and k are integers, so j + k is an integer" uses the fact that integers are closed under addition — the sum of integers is always an integer.',
            'This step feels obvious, but skipping it means your proof has an unjustified claim. In the future, when working in different number systems (rationals, reals, modular arithmetic), closure is not always obvious.',
          ],
        },
        {
          expression: 'a + b = 2m, \\quad m \\in \\mathbb{Z}.',
          annotation: 'The expression a + b now matches the definition of even exactly.',
          strategyTitle: 'Match the Definition',
        },
        {
          expression: '\\text{Therefore, } a + b \\text{ is even.} \\quad \\blacksquare',
          annotation: 'State the conclusion and close the proof with ∎ (the "tombstone" or "QED" symbol). The conclusion must explicitly match what you were asked to prove.',
          strategyTitle: 'Close the Chain',
          checkpoint: 'What was the goal? Does your final statement exactly match it?',
          hints: [
            'The goal: show a + b is even. The definition: even means 2m for some integer m. You have: a + b = 2m with m ∈ ℤ. They match exactly.',
            'Every good proof ends by stating what was proved and why it matches the goal. Never leave the reader to make the connection themselves.',
          ],
        },
      ],
      conclusion: 'The direct proof template: Assume hypothesis → apply definitions → do algebra → match definition of conclusion → state conclusion. This identical skeleton applies to every direct proof of integer parity statements.',
    },
    {
      id: 'discrete-1-01-ex2',
      title: 'Proof by Contrapositive: The Flipped Script',
      problem: '\\text{Prove: If } 3n + 2 \\text{ is odd, then } n \\text{ is odd.}',
      steps: [
        {
          expression: '\\text{Identify: } p = \\text{"} 3n+2 \\text{ is odd"}, \\quad q = \\text{"} n \\text{ is odd"}',
          annotation: 'Label the hypothesis and conclusion to clarify the logical structure before choosing a strategy.',
          strategyTitle: 'Anatomy of the Statement',
          checkpoint: 'Try starting a direct proof: assume 3n + 2 is odd, write 3n + 2 = 2k + 1, and try to solve for n. What goes wrong?',
          hints: [
            'From 3n + 2 = 2k + 1, we get 3n = 2k − 1, so n = (2k − 1)/3. This is not obviously an integer, and its parity depends on k in a non-obvious way.',
            'The direct approach stalls because we end up dividing by 3, which lands us outside well-defined integer arithmetic.',
            'The contrapositive ¬q → ¬p is: "If n is even, then 3n + 2 is even." Starting from n even gives us n = 2m directly — clean multiplication, no division.',
          ],
        },
        {
          expression: '\\text{Contrapositive: If } n \\text{ is even, then } 3n + 2 \\text{ is even.}',
          annotation: 'State the contrapositive explicitly. This is the statement you will actually prove, and its proof automatically validates the original.',
          strategyTitle: 'Write the Contrapositive',
          checkpoint: 'Verify: is this the correct contrapositive? Does flipping the arrow AND negating both sides give this?',
          hints: [
            'Original: p → q. Contrapositive: ¬q → ¬p. Here ¬q = "n is even" and ¬p = "3n + 2 is even." Yes, the contrapositive is correct.',
          ],
        },
        {
          expression: '\\textbf{Proof.} \\text{ Assume } n \\text{ is even. Then } n = 2k \\text{ for some } k \\in \\mathbb{Z}.',
          annotation: 'The proof of the contrapositive is a direct proof of ¬q → ¬p. Assume ¬q and deduce ¬p.',
          strategyTitle: 'Assume the Negated Conclusion',
        },
        {
          expression: '3n + 2 = 3(2k) + 2 = 6k + 2 = 2(3k + 1)',
          annotation: 'Substitute and simplify. Factor out 2 to expose the structure.',
          strategyTitle: 'Substitute and Factor',
          checkpoint: 'Is 3k + 1 guaranteed to be an integer?',
          hints: [
            'Yes: k is an integer, 3k is an integer (integers closed under multiplication), and 3k + 1 is an integer (integers closed under addition).',
          ],
        },
        {
          expression: '\\text{Since } 3k+1 \\in \\mathbb{Z}, \\text{ we have } 3n+2 = 2(3k+1), \\text{ so } 3n+2 \\text{ is even.}',
          annotation: 'Apply the definition of even. The factor 2 is there; the other factor is an integer.',
          strategyTitle: 'Match the Definition of Even',
        },
        {
          expression: '\\text{We proved } \\neg q \\rightarrow \\neg p \\equiv p \\rightarrow q. \\quad \\blacksquare',
          annotation: 'Explicitly note that proving the contrapositive proves the original. This line reminds you — and the reader — why the proof is valid.',
          strategyTitle: 'Close by Citing Equivalence',
        },
      ],
      conclusion: 'Proof by Contrapositive adds exactly one step to a direct proof: write the contrapositive first, then prove it directly. The payoff is that you get to start from a clean, usable assumption (n = 2k) instead of being stuck with a messy equation to untangle.',
    },
    {
      id: 'discrete-1-01-ex3',
      title: 'Proof by Contradiction: √2 Is Irrational',
      problem: '\\text{Prove that } \\sqrt{2} \\text{ is irrational.}',
      steps: [
        {
          expression: '\\textbf{Proof.} \\text{ Suppose for contradiction that } \\sqrt{2} \\text{ is rational.}',
          annotation: 'Assume the opposite of what you want to prove. Name it explicitly: "suppose for contradiction" signals to the reader that you are using this technique.',
          strategyTitle: 'Assume the Negation',
          checkpoint: 'What does it mean to be rational? Unpack the definition before proceeding.',
          hints: [
            'A number is rational if it can be written as a ratio of two integers with nonzero denominator.',
            'We assume √2 = a/b for integers a, b with b ≠ 0 and gcd(a, b) = 1 (the fraction is fully reduced).',
          ],
        },
        {
          expression: '\\sqrt{2} = \\dfrac{a}{b}, \\quad a,b \\in \\mathbb{Z},\\; b \\neq 0,\\; \\gcd(a,b)=1.',
          annotation: 'Write out everything implied by the assumption. The gcd condition is crucial — it is the fact we will ultimately contradict.',
          strategyTitle: 'State the Assumption Precisely',
        },
        {
          expression: '2 = \\dfrac{a^2}{b^2} \\implies a^2 = 2b^2',
          annotation: 'Square both sides and clear the denominator. This converts the irrational square root into an integer equation.',
          strategyTitle: 'Square and Rearrange',
          checkpoint: 'What does this equation tell you about a²? Is a² even or odd?',
          hints: [
            'a² = 2b² means a² is divisible by 2, so a² is even.',
          ],
        },
        {
          expression: 'a^2 \\text{ is even} \\implies a \\text{ is even.}',
          annotation: 'Use the subsidiary fact: if n² is even, then n is even. (Prove this by contrapositive: if n is odd, n² is odd.)',
          strategyTitle: 'Apply the Parity Lemma',
          checkpoint: 'Why doesn\'t it suffice to say "a² is even, so a is even" without justification?',
          hints: [
            'We need to cite a proved fact. The fact "n² even ⟹ n even" is a theorem, not obvious. It follows from: if n = 2k+1, then n² = 4k²+4k+1 = 2(2k²+2k)+1, which is odd. So by contrapositive, n² even ⟹ n even.',
          ],
        },
        {
          expression: 'a = 2c \\text{ for some } c \\in \\mathbb{Z}.',
          annotation: 'Since a is even, write it in the form 2c. This substitution is the key move.',
          strategyTitle: 'Substitute the Even Form of a',
        },
        {
          expression: '(2c)^2 = 2b^2 \\implies 4c^2 = 2b^2 \\implies b^2 = 2c^2',
          annotation: 'Substitute a = 2c into the equation a² = 2b² and simplify.',
          strategyTitle: 'Cascade the Parity',
          checkpoint: 'What does b² = 2c² tell you about b?',
          hints: [
            'b² = 2c² means b² is even. By the same parity lemma, b is even.',
          ],
        },
        {
          expression: 'b \\text{ is even.}',
          annotation: 'By the same parity lemma applied to b.',
          strategyTitle: 'Conclude b Is Even',
        },
        {
          expression: '\\gcd(a,b) \\geq 2 \\quad \\text{— contradiction with } \\gcd(a,b) = 1.',
          annotation: 'Both a and b are divisible by 2, so gcd(a, b) ≥ 2. But we assumed gcd(a, b) = 1 (lowest terms). This is a contradiction.',
          strategyTitle: 'Trigger the Contradiction',
          checkpoint: 'What exactly is being contradicted? Make sure you identify the specific prior assumption that is now violated.',
          hints: [
            'The assumption that √2 = a/b in lowest terms (gcd(a,b) = 1) is contradicted by our derivation that both a and b are divisible by 2.',
          ],
        },
        {
          expression: '\\text{Therefore our assumption was false, and } \\sqrt{2} \\text{ is irrational.} \\quad \\blacksquare',
          annotation: 'State the conclusion of the contradiction proof: since the assumption led to a contradiction, the assumption must be false, so the negation (what we wanted to prove) is true.',
          strategyTitle: 'Close the Contradiction',
        },
      ],
      conclusion: 'Proof by Contradiction is most powerful when proving impossibility or irrationality — situations where you cannot directly construct the answer. The key discipline: clearly state what you are assuming (¬P), relentlessly follow the logic until something breaks, identify the precise contradiction, and cite the assumption that caused it.',
    },
    {
      id: 'discrete-1-01-ex4',
      title: 'Proof by Cases: |xy| = |x||y| for All Real Numbers',
      problem: '\\text{Prove that for all real numbers } x \\text{ and } y, \\quad |xy| = |x||y|.',
      steps: [
        {
          expression: '\\text{This is a standalone universal claim — no "if...then" to flip or negate.}',
          annotation: 'Before picking a strategy, notice what kind of statement this is. It is not a conditional (no contrapositive available) and there is no obvious impossibility to chase (contradiction would be forced and unnatural here).',
          strategyTitle: 'Rule Out the Wrong Tools',
          checkpoint: 'Why would Direct Proof alone struggle here? What is different about x and y depending on their sign?',
          hints: [
            'Direct proof wants one algebraic chain from hypothesis to conclusion — but there is no hypothesis to assume, only "for all real x, y."',
            'The absolute value function itself is defined differently depending on sign: |a| = a if a ≥ 0, and |a| = −a if a < 0. A proof about |·| almost always inherits this sign-dependence.',
          ],
        },
        {
          expression: '\\text{Split on sign: } (x{\\geq}0,y{\\geq}0),\\ (x{<}0,y{\\geq}0),\\ (x{\\geq}0,y{<}0),\\ (x{<}0,y{<}0)',
          annotation: 'Four cases, one per combination of the two variables\' signs. By trichotomy, every real number is exactly one of "≥ 0" or "< 0" — no third option — so these four cases are exhaustive and non-overlapping.',
          strategyTitle: 'Choose the Case Split',
          checkpoint: 'Could you get away with fewer cases? Would splitting only on x (ignoring y) be enough?',
          hints: [
            'No — |xy| depends on the sign of the *product*, which depends on both signs together. Splitting on x alone leaves y\'s sign unresolved inside each case.',
            'Two independent binary choices (sign of x, sign of y) give 2×2 = 4 cases. This is the same counting principle you\'ll formalize later as the multiplication rule.',
          ],
        },
        {
          expression: '\\text{Case 1 (}x,y\\geq0\\text{): } xy \\geq 0 \\implies |xy|=xy=|x||y|',
          annotation: 'Both non-negative, so their product is non-negative, so |xy| = xy directly by definition. And |x| = x, |y| = y. Substitution finishes the case immediately.',
          strategyTitle: 'Case 1 — Both Non-Negative',
        },
        {
          expression: '\\text{Case 2 (}x{<}0,y\\geq0\\text{): } xy \\leq 0 \\implies |xy|=-xy=(-x)(y)=|x||y|',
          annotation: 'Product of a negative and a non-negative is non-positive, so |xy| = −xy. Meanwhile |x| = −x (since x < 0) and |y| = y, so |x||y| = (−x)(y), which is exactly −xy.',
          strategyTitle: 'Case 2 — Mixed Signs',
          checkpoint: 'Why can Case 3 (x ≥ 0, y < 0) be skipped in full detail?',
          hints: ['It is the mirror image of Case 2 with x and y\'s roles swapped — the identical algebra applies with the variable names exchanged.'],
        },
        {
          expression: '\\text{Case 4 (}x,y{<}0\\text{): } xy > 0 \\implies |xy|=xy=(-x)(-y)=|x||y|',
          annotation: 'Negative times negative is positive, so |xy| = xy directly. Meanwhile |x| = −x and |y| = −y, so |x||y| = (−x)(−y) = xy. Both sides land on xy.',
          strategyTitle: 'Case 4 — Both Negative',
        },
        {
          expression: '\\text{All four cases proven, and they exhaust } \\mathbb{R} \\times \\mathbb{R}. \\quad \\therefore |xy|=|x||y| \\text{ always.} \\quad \\blacksquare',
          annotation: 'Every real pair (x, y) falls into exactly one of the four cases — nothing was left uncovered — and the claim held in each one. By disjunction elimination, the claim holds everywhere.',
          strategyTitle: 'Close by Citing Exhaustiveness',
          checkpoint: 'What would go wrong if you had only checked cases 1 and 4 (both-same-sign) and assumed mixed signs "obviously" work the same way?',
          hints: ['That is exactly the kind of unjustified skip the contract warns against — mixed signs flip which factor is negated, and skipping the check is how sign errors slip into "obvious" proofs undetected.'],
        },
      ],
      conclusion: 'Proof by Cases doesn\'t introduce a new logical move — each case is just a direct proof restricted to a slice of the domain. Its discipline is entirely about the split: the cases must be exhaustive (cover every possibility) and it must be clear why they are, or the proof has a silent gap exactly where the missing case would have gone.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-01-ch1',
      difficulty: 'easy',
      problem: 'Classify the truth value of p → q for each of the four truth-value combinations of p and q. Then identify which English sentence shows that "if it is a dog, then it is an animal" is True, but "if it is an animal, then it is a dog" is False.',
      hint: 'Build a two-row truth table for p → q. Then name a specific counterexample animal that is not a dog.',
      walkthrough: [
        { expression: 'p=T, q=T:\\; p \\rightarrow q = T', annotation: '"Dog → animal." A dog is an animal. Both true, conditional true.' },
        { expression: 'p=T, q=F:\\; p \\rightarrow q = F', annotation: 'The conditional is False here — the ONLY false case.' },
        { expression: 'p=F, q=T:\\; p \\rightarrow q = T', annotation: '"Not a dog but is an animal (a cat)." Conditional vacuously true.' },
        { expression: 'p=F, q=F:\\; p \\rightarrow q = T', annotation: '"Not a dog and not an animal (a rock)." Conditional vacuously true.' },
        { expression: '\\text{Counterexample for converse: a cat.}', annotation: 'A cat is an animal (q=T) but not a dog (p=F). This makes the converse q → p False at (F,T).' },
      ],
      answer: 'p → q is False only when p=T and q=F. Counterexample for the converse: any non-dog animal (cat, horse, whale).',
    },
    {
      id: 'discrete-1-01-ch2',
      difficulty: 'medium',
      problem: 'Apply De Morgan\'s Law to simplify ¬(¬p ∨ q). Show each step, verify with a truth table, and state what English sentence the original expression denies if p = "it is raining" and q = "I take an umbrella."',
      hint: 'Apply De Morgan\'s to flip ∨ → ∧ and push ¬ inside. Then simplify using double negation. Build a 4-row truth table to verify.',
      walkthrough: [
        { expression: '\\neg(\\neg p \\vee q)', annotation: 'Original expression.' },
        { expression: '\\equiv \\neg(\\neg p) \\wedge \\neg q', annotation: 'De Morgan\'s Law: ¬(A ∨ B) ≡ ¬A ∧ ¬B, with A = ¬p and B = q.' },
        { expression: '\\equiv p \\wedge \\neg q', annotation: 'Double negation: ¬(¬p) ≡ p.' },
        { expression: '\\text{Truth table verification: } p \\wedge \\neg q \\text{ is True only at } (T,F).', annotation: 'Check: (T,T)=F, (T,F)=T, (F,T)=F, (F,F)=F.' },
        { expression: '\\text{English: "It is raining AND I am not taking an umbrella."}', annotation: 'The expression ¬(¬p ∨ q) denies "Either it is not raining or I take an umbrella" — which is equivalent to saying the rain-without-umbrella scenario holds.' },
      ],
      answer: '¬(¬p ∨ q) ≡ p ∧ ¬q. In English: "It is raining and I am not taking an umbrella."',
    },
    {
      id: 'discrete-1-01-ch3',
      difficulty: 'hard',
      problem: 'Prove: If n² is even, then n is even. Use proof by contrapositive. Then explain why this lemma was essential in the proof that √2 is irrational.',
      hint: 'The contrapositive is "if n is odd, then n² is odd." Write n = 2k + 1 and compute n².',
      walkthrough: [
        { expression: '\\text{Prove contrapositive: If } n \\text{ is odd, then } n^2 \\text{ is odd.}', annotation: 'Identify the contrapositive: ¬(n is even) → ¬(n² is even).' },
        { expression: 'n = 2k+1 \\text{ for some } k \\in \\mathbb{Z}.', annotation: 'Assume n is odd; apply the definition.' },
        { expression: 'n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1', annotation: 'Expand and factor a 2 out of the first two terms.' },
        { expression: '\\text{Let } m = 2k^2 + 2k \\in \\mathbb{Z}.\\; n^2 = 2m + 1.', annotation: 'So n² is odd by definition. Proof of contrapositive complete.' },
        { expression: '\\text{Therefore, by contrapositive, } n^2 \\text{ even} \\implies n \\text{ even.} \\quad \\blacksquare', annotation: 'State the original conclusion from the proved contrapositive.' },
        { expression: '\\text{Role in } \\sqrt{2}\\text{ proof: this lemma justifies both }a^2 \\text{ even} \\implies a \\text{ even, and } b^2 \\text{ even} \\implies b \\text{ even.}', annotation: 'Without this lemma, the √2 proof has an unjustified leap. The lemma is proven separately and then cited, which is standard mathematical practice.' },
      ],
      answer: 'Proved by contrapositive: n odd ⟹ n² odd. The lemma is the key step in the √2 irrationality proof, used twice.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'predicate-logic-and-quantifiers', label: 'Predicate Logic and Quantifiers', context: 'Propositional logic is the foundational layer. Predicate logic extends it to domains and quantifiers, enabling proofs about infinite sets.' },
    { lessonSlug: 'induction-and-recursion', label: 'Mathematical Induction', context: 'Induction is a proof technique built on the conditional and the structure of the integers. The base case and inductive step are a direct proof chain.' },
    { lessonSlug: 'boolean-algebra-and-circuits', label: 'Boolean Algebra and Circuits', context: 'Truth-functional logic maps directly to hardware gates: AND, OR, NOT, XOR. De Morgan\'s Law tells you how to build equivalent circuits.' },
  ],

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-00',
        label: 'The Pigeonhole Principle (Previous Lesson)',
        note: 'The pigeonhole principle already showed you a proof that establishes certainty — "some drawer must hold 2 socks" — without ever constructing which drawer. This lesson gives you the formal machinery (propositions, connectives, proof techniques) to make that same kind of certainty rigorous for claims far more complex than counting socks.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-01a',
        label: 'Predicate Logic and Quantifiers (Next Lesson)',
        note: 'All four proof techniques — direct, contrapositive, contradiction, cases — extend to predicate logic with quantifiers. You will use them constantly. The only change is that the hypotheses involve "for all x" or "there exists x," which requires new proof strategies on top of the ones you just learned.',
      },
      {
        lessonId: 'discrete-1-03',
        label: 'Mathematical Induction (Two Lessons Ahead)',
        note: 'Induction is a proof technique that combines a base case (a direct proof for n = 1) and an inductive step (a direct proof of a conditional). The whole framework is built on propositional logic — specifically the transitivity of implication.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'prop-assess-1',
        type: 'choice',
        text: 'Which is the ONLY truth-value combination that makes p → q FALSE?',
        options: ['p=T, q=T', 'p=T, q=F', 'p=F, q=T', 'p=F, q=F'],
        answer: 'p=T, q=F',
        hint: 'The conditional is broken only when the promise was made (p=T) and the result was not delivered (q=F).',
      },
      {
        id: 'prop-assess-2',
        type: 'input',
        text: 'What is the contrapositive of: "If it is raining, then the roads are wet"?',
        answer: 'If the roads are not wet, then it is not raining.',
        hint: 'Flip the arrow direction and negate both propositions.',
      },
      {
        id: 'prop-assess-3',
        type: 'input',
        text: 'Apply De Morgan\'s Law to simplify ¬(p ∨ q).',
        answer: '¬p ∧ ¬q',
        hint: 'To negate an OR, flip to AND and negate each part individually.',
      },
    ],
  },

  mentalModel: [
    'p → q is False in exactly ONE case: p=T, q=F.',
    'Contrapositive (¬q → ¬p) is logically equivalent to (p → q). Converse (q → p) is NOT.',
    'Direct: assume p, derive q using definitions and algebra.',
    'Contrapositive: prove ¬q → ¬p instead when direct algebra is messy.',
    'Contradiction: assume ¬P, derive an impossibility, conclude P is true.',
    'Cases: split into exhaustive, non-overlapping cases; prove the claim in each one separately.',
    'Even = 2k, Odd = 2k+1. These are the algebraic handles for integer parity proofs.',
  ],

  quiz: [
    {
      id: 'prop-q1',
      type: 'choice',
      text: 'Which of the following is a valid mathematical Proposition?',
      options: [
        'How many sides does a triangle have?',
        'Close the window!',
        'The integer 7 is an even number.',
        'This statement is false.',
      ],
      answer: 'The integer 7 is an even number.',
      hints: ['A proposition must be declarative and have a definite truth value. "7 is even" is declarative and definitively False.'],
      reviewSection: 'Intuition tab — what is a proposition',
    },
    {
      id: 'prop-q2',
      type: 'choice',
      text: 'Evaluate: $p \\rightarrow q$ when $p$ is True and $q$ is False.',
      options: ['True', 'False', 'Undefined', 'Depends on context'],
      answer: 'False',
      hints: ['The conditional p → q is False in exactly this one case: p=T and q=F. Think of it as a broken promise.'],
      reviewSection: 'Intuition tab — the conditional truth table',
    },
    {
      id: 'prop-q3',
      type: 'choice',
      text: 'What is the contrapositive of $p \\rightarrow q$?',
      options: ['$q \\rightarrow p$', '$\\neg p \\rightarrow \\neg q$', '$\\neg q \\rightarrow \\neg p$', '$\\neg p \\rightarrow q$'],
      answer: '$\\neg q \\rightarrow \\neg p$',
      hints: ['The contrapositive flips the arrow direction AND negates both propositions. The converse only flips the arrow.'],
      reviewSection: 'Math tab — contrapositive equivalence',
    },
    {
      id: 'prop-q4',
      type: 'input',
      text: "Apply De Morgan's Law: $\\neg(p \\wedge q) \\equiv$ ?",
      answer: '¬p ∨ ¬q',
      hints: ['To negate AND, flip to OR and negate each part.'],
      reviewSection: 'Math tab — De Morgan\'s Laws',
    },
    {
      id: 'prop-q5',
      type: 'choice',
      text: 'Which proof technique begins by assuming the opposite of what you want to prove?',
      options: ['Direct Proof', 'Proof by Induction', 'Proof by Contrapositive', 'Proof by Contradiction'],
      answer: 'Proof by Contradiction',
      hints: ['Contradiction assumes ¬P at the start and derives an impossibility. Contrapositive proves ¬q → ¬p — still a direct proof, just of the flipped statement.'],
      reviewSection: 'Rigor tab — the three proof techniques',
    },
    {
      id: 'prop-q6',
      type: 'choice',
      text: 'A compound proposition whose final truth-table column is entirely True is called a:',
      options: ['Contingency', 'Tautology', 'Contradiction', 'Biconditional'],
      answer: 'Tautology',
      hints: ['Tautology = always True. Contradiction = always False. Contingency = sometimes True, sometimes False.'],
      reviewSection: 'Math tab — tautology, contradiction, contingency',
    },
    {
      id: 'prop-q7',
      type: 'input',
      text: 'Write the definition of an ODD integer in terms of some integer $k$.',
      answer: 'n = 2k + 1',
      hints: ['An odd integer leaves remainder 1 when divided by 2, which means n = 2k + 1 for some integer k.'],
      reviewSection: 'Math tab — definitions of even and odd',
    },
    {
      id: 'prop-q8',
      type: 'choice',
      text: 'A proof by cases splits the domain into pieces and proves the claim in each. What is the one thing that MUST be true of the cases for the proof to be valid?',
      options: ['They must be equal in size', 'They must be exhaustive — cover every possibility with no gaps', 'There must be exactly two of them', 'Each case must use the same proof technique'],
      answer: 'They must be exhaustive — cover every possibility with no gaps',
      hints: ['A case split that quietly skips a possibility leaves an invisible hole in the proof — the number of cases and their relative size don\'t matter, only that together they cover everything.'],
      reviewSection: 'Rigor tab — why proof by cases works',
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};
