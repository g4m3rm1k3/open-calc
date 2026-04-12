export default {
  id: 'discrete-1-03',
  slug: 'induction-and-recursion',
  chapter: 'discrete-1',
  order: 5,
  title: 'Induction and Recursion',
  subtitle: 'Proving infinitely scaling logic with finite mechanical work',
  tags: ['induction', 'strong induction', 'recursion', 'recurrence', 'well-ordering'],
  aliases: 'mathematical induction recurrence relation recursive sequence strong induction',

  hook: {
    question: 'How can a Software Engineer mathematically guarantee that a loop or algorithm will definitively work for 10 Billion users, without sitting and testing 10 Billion distinct test cases?',
    realWorldContext: 'Induction is the engine powering all scalable Computer Science logic. It mathematically certifies Loop Invariants, algorithmic correctness (like Divide & Conquer), and recursive data structures like Trees and Graphs. Recursion, on the other hand, is the exact computational mirror of Induction—it executes the logic backwards!',
    previewVisualizationId: 'DominoInductionLab',
  },

  intuition: {
    prose: [
      `### The Problem with Testing

Suppose someone hands you a formula and says: "This formula works for every positive integer." You try it for n = 1. Works. n = 2. Works. n = 3. Works. n = 100. Works. n = 1,000,000. Still works.

Are you convinced?

You shouldn't be. Not mathematically. Here's the brutal reality: no finite number of test cases can prove a claim about infinitely many integers. You'd need to test forever — and you'll never finish.

But there's a more shocking reason you shouldn't trust examples alone. Consider this formula:

f(n) = n² + n + 41

Test it: f(1) = 43 (prime). f(2) = 47 (prime). f(3) = 53 (prime). f(4) = 61 (prime). It keeps producing primes... for n = 0, 1, 2, all the way through n = 39. Forty consecutive values, all prime. Any reasonable person would be convinced.

Then f(40) = 1681 = 41 × 41. Composite. The pattern explodes at the 41st value after appearing perfect for 40 tests.

This is why mathematics invented proof. Not because mathematicians are paranoid, but because patterns that look airtight can fail exactly when you stop looking. Induction is the tool that closes the gap between "seems to work forever" and "provably works forever."`,

      `### The Domino Metaphor: The Correct Mental Model

Here is the single cleanest way to understand mathematical induction:

Imagine you have an infinitely long row of dominoes — one for each positive integer. Domino 1, domino 2, domino 3, extending forever to the right. You want to prove that all dominoes fall.

You don't need to touch each one. You only need to establish two mechanical facts:

**Fact 1 (Base Case):** The first domino falls. You physically push domino 1.

**Fact 2 (Inductive Step):** Every domino, if it falls, will knock over the next one. The spacing is tight enough that domino k falling guarantees domino k+1 falls.

If both facts are true, all dominoes fall — no matter how many there are. The chain reaction propagates forever.

This is not circular logic. You're not assuming all dominoes fall — you're proving that the *mechanism* of propagation holds everywhere. Once you have the mechanism and the starter, infinity handles itself.

Here's the critical insight: **you only need to prove the mechanism for a generic, arbitrary domino k.** Not domino 1. Not domino 1,000,000. An arbitrary k. If the mechanism works for any k, it works for all k.`,

      `### The Two Common Beginner Mistakes

**Mistake 1: Forgetting the base case.**

If you prove the inductive step but skip the base case, you've shown the dominoes would knock each other over — but you never pushed the first one. The chain never starts. The proof is completely invalid.

Even worse: you can sometimes prove the inductive step for a statement that is actually false. Consider "n = n + 1 for all n." The inductive step works vacuously (if n = n+1, then n+1 = n+2). But the base case fails immediately. Without the base case, you'd "prove" something obviously wrong.

**Mistake 2: Not using the inductive hypothesis.**

This is the most common failure in written proofs. You write down the inductive hypothesis (assume it's true for k), then proceed to prove it for k+1 using... completely different reasoning that doesn't involve k at all.

If you never used the hypothesis, you didn't do induction. You did a direct proof for k+1 that happened to work. That's fine — but it means your induction was unnecessary. Worse, it usually means you made an error and the step only worked because you inadvertently assumed what you were trying to prove.

The inductive hypothesis is not decoration. It is the kinetic energy that drives the domino chain. Every valid induction proof visibly uses P(k) to establish P(k+1).`,

      `### The Algebra Gap: How the Substitution Actually Works

Here is where many students freeze. They understand the concept but get stuck when they sit down to write the algebra.

The pattern is always the same:

1. **Write out what you need to prove:** P(k+1). Write the full formula with (k+1) plugged in everywhere.

2. **Manipulate the left side** (usually a sum or product) to isolate the part that matches P(k).

3. **Substitute the inductive hypothesis:** Replace the P(k) part with what the hypothesis says it equals.

4. **Simplify** to match the right side of P(k+1).

The substitution moment is the heart of the proof. It's where you "inject" the kinetic energy of domino k to push domino k+1. If you can't find a place to substitute the hypothesis, you're either doing the algebra wrong or you need strong induction.

Let's see it concretely with the classic sum: 1 + 2 + 3 + ... + n = n(n+1)/2.

For P(k+1): 1 + 2 + ... + k + (k+1) = (k+1)(k+2)/2

Left side: [1 + 2 + ... + k] + (k+1)

The bracket is exactly P(k). Substitute: k(k+1)/2 + (k+1)

Now simplify: (k+1)[k/2 + 1] = (k+1)[(k+2)/2] = (k+1)(k+2)/2 ✓

That bracket substitution — where P(k) appears and gets replaced — is the mechanical heart.`,

      `### Why the Well-Ordering Principle Makes It All Work

There's a deeper question lurking: why does induction actually prove something about all natural numbers?

The answer is the **Well-Ordering Principle**: every non-empty set of positive integers has a smallest element.

This seems obvious — of course there's a smallest — but it's actually a fundamental axiom about the natural numbers that makes induction logically valid.

Here's the argument: suppose induction establishes both the base case and the inductive step, but suppose (for contradiction) that some natural numbers don't satisfy P. By the Well-Ordering Principle, there's a *smallest* such number, call it m. Since the base case holds, m ≠ 1, so m > 1, so m−1 is a natural number. Since m is the smallest failure, m−1 must satisfy P. But the inductive step says P(m−1) → P(m). So P(m) is true. Contradiction.

This is why induction works. The Well-Ordering Principle guarantees a smallest counterexample must exist if any counterexample exists, and the inductive step eliminates that possibility.`,
    ],

    callouts: [
      {
        type: 'warning',
        title: '⚠️ The Absolute Deadline Trap',
        body: 'If you ever complete an Inductive Step proof mathematically, but you never organically substituted your "Inductive Hypothesis P(k)" into the equations to help you solve it... your proof is 100% fundamentally invalid. Every single P(k+1) derivation absolutely requires the mechanical kinetic energy of P(k) to algebraically function!'
      },
      {
        type: 'insight',
        title: '💡 The Base Case Isn\'t Always n=1',
        body: 'The base case is wherever your claim starts. For array indexing, it\'s often n=0. For "all convex polygons with n sides," it\'s n=3. For "all binary trees with n nodes," it\'s n=1 but could be n=0 depending on convention. Always identify what the "first domino" actually is before starting the proof.'
      },
    ],

    visualizations: [
      {
        id: 'InductionFailureViz',
        title: 'Why Examples Aren\'t Enough: The f(n) = n² + n + 41 Trap',
        caption: 'Watch the formula produce primes for 40 consecutive values — then suddenly fail. This is why "it works for many cases" is never a proof.',
        props: { interactive: true },
      },
      {
        id: 'SigmaDecoderLab',
        title: 'The Sigma (Σ) Notation Decoder',
        caption: 'Deconstruct the terrifying Greek symbol into a simple 3-part programming For-Loop before attempting Mathematical Proofs.',
      },
      {
        id: 'InductionAlgebraDecoderLab',
        title: 'The Core "Aha!" Mechanical Substitution',
        caption: 'Watch the exact moment the Inductive Hypothesis P(k) is mathematically injected to flawlessly close the gap.',
      },
      {
        id: 'DominoInductionLab',
        title: 'The Mechanical Engine of Proofs',
        caption: 'Adjust the logic parameters to successfully trigger an infinitely cascading chain of unassailable mathematical truth.',
      },
      {
        id: 'InductionGrowthExplorer',
        title: 'Recursive Growth Explorer',
        caption: 'A second perspective: visualize induction as layered recursive growth from a base seed.',
        mathBridge: 'Complements domino induction by showing how each verified step supports a larger recursive structure.',
        props: { guided: true },
      },
      {
        id: 'InductionStairCase',
        title: 'Induction Staircase Explorer',
        caption: 'Geometric proof perspective: duplicate and flip a staircase to see the rectangle argument for sums.',
        mathBridge: 'Shows why 1 + 2 + ... + n = n(n+1)/2 through geometry and links directly to the inductive step.',
        props: { guided: true },
      },
      {
        id: 'InductionTemplateWalkthrough',
        title: 'Fill-in-the-Blanks Proof Template',
        caption: 'The four-section ritual: Base Case → Inductive Hypothesis → Inductive Step → Conclusion. Walk through a live proof and identify each section.',
        props: { guided: true, example: 'sum-of-integers' },
      },
    ],
  },

  math: {
    prose: [
      `### Strong Induction: When One Domino Isn't Enough

Standard (weak) induction assumes P(k) is true and proves P(k+1). This works when P(k+1) only depends on the immediately preceding step.

But some claims depend on more than just the previous step. The Fibonacci sequence: F(n) = F(n−1) + F(n−2). To prove something about F(n), you need to know about F(n−1) AND F(n−2). Weak induction gives you only one of them.

**Strong Induction** solves this by assuming P is true for *all* values from 1 through k, not just k alone:

Inductive hypothesis: assume P(i) is true for all 1 ≤ i ≤ k.
Then prove: P(k+1).

This is strictly more powerful. You can reach back as far as needed.

The domino metaphor: weak induction uses only the kinetic energy of domino k to push k+1. Strong induction uses the combined weight of all fallen dominoes 1 through k.

Strong induction is necessary for:
- Prime factorization (factors of n are smaller than n — could be any of 2 through n−1)
- Fibonacci proofs (depends on two prior values)
- Binary search correctness (halving means you might use any prior subproblem)
- Any algorithm that recursively calls itself on sub-problems that aren't exactly size k−1`,

      `### Recursion: Induction Running Backwards

Induction builds a proof upward: establish base case, propagate forward to infinity.
Recursion computes a value by building downward: start at n, reduce to n−1, reduce to n−2, until hitting the base case.

They are mirror images of each other.

In induction: P(1) is established. P(1) → P(2). P(2) → P(3). ... → P(n) for any n you want.

In recursion: to compute f(n), compute f(n−1). To compute f(n−1), compute f(n−2). ... until hitting f(1), which is hardcoded.

The base case in induction is the starting gun. The base case in recursion is the stopping condition. Without it, recursion never terminates — an infinite regress, the computational equivalent of forgetting to push the first domino.

**The critical parallel:**
- Every recursive function implicitly makes a claim about all n ≥ base_case.
- If you want to prove that claim, you use induction.
- The structure of the recursion directly maps to the structure of the inductive proof.

This is why proving algorithm correctness for recursive algorithms almost always uses induction: you prove the base case (the function returns the right thing when n = base), and you prove the inductive step (assuming the recursive calls return correct values, the current call returns a correct value).`,

      `### Recurrence Relations

A recurrence relation defines a sequence in terms of previous terms, rather than with a closed formula.

The Fibonacci sequence: F(1) = 1, F(2) = 1, F(n) = F(n−1) + F(n−2) for n ≥ 3.

The recurrence is clean and natural. The closed form (Binet's formula) is: F(n) = (φⁿ − ψⁿ)/√5, where φ = (1 + √5)/2. Beautiful, but not obvious from the recurrence.

The connection between recurrences and induction:
1. You suspect a closed form (or are given one to verify).
2. You use induction to prove the closed form equals the recurrence for all n.
3. The inductive hypothesis assumes the closed form works for smaller values.
4. The inductive step shows that the recurrence — using those smaller values — produces the closed form for the next value.

Recurrences appear everywhere in algorithms: merge sort (T(n) = 2T(n/2) + O(n)), binary search (T(n) = T(n/2) + O(1)), Towers of Hanoi (T(n) = 2T(n−1) + 1). Proving the efficiency of these algorithms means solving and verifying their recurrences — which means induction.`,
    ],

    callouts: [
      {
        type: 'definition',
        title: 'The Well-Ordering Principle',
        body: 'Why does Induction mathematically work at all? Because of the deeply profound Well-Ordering Principle: "Every single non-empty set of positive integers MUST possess an absolute smallest baseline element." Without a true structural floor (Base Case), the mathematical domino chain simply floats in a void and can never begin!'
      },
      {
        type: 'insight',
        title: 'Strong vs. Weak: Which to Use?',
        body: 'Default to weak induction. Switch to strong induction when your proof of P(k+1) needs to refer to any P(i) where i < k (not just i = k). A good signal: if your recursive definition has f(n) depending on f(n-2) or f(n/2) rather than just f(n-1), you almost certainly need strong induction.'
      },
    ],

    visualizations: [
      {
        id: 'StrongVsWeakInductionViz',
        title: 'Strong vs. Weak Induction: The Weight Comparison',
        caption: 'Watch a single domino (weak) fail to push a heavy target, then see the combined weight of all prior dominoes (strong) succeed. Understand exactly when each is needed.',
        props: { interactive: true },
      },
      {
        id: 'StrongInductionWallLab',
        title: 'Visualizing Strong Induction Weight',
        caption: 'Watch a single Domino completely fail to push a heavy target, demanding the massive architectural support of Strong Induction.',
      },
      {
        id: 'RecursionVsInductionMirror',
        title: 'Recursion and Induction: Two Mirrors',
        caption: 'Side-by-side animation showing a recursive computation unwinding (downward) next to an inductive proof propagating (upward). The structural identity is striking.',
        props: { animated: true },
      },
      {
        id: 'RecursiveStackLab',
        title: 'The Recursive Architecture',
        caption: 'Execute the Fibonacci(4) logic cycle. Notice how heavily it relies on Strong Induction to perfectly trace the historical logic dependencies.',
      },
      {
        id: 'RecurrenceExplorer',
        title: 'Recurrence Relations: From Formula to Closed Form',
        caption: 'Enter a recurrence relation, explore its growth pattern, and watch induction verify a proposed closed form.',
        props: { interactive: true },
      },
    ],
  },

  rigor: {
    prose: [
      `### The Four-Section Proof Blueprint

Induction proofs are highly formalized. Every textbook, every professor, every grader expects the same four sections in the same order. This is not bureaucracy — it's communication. The structure ensures the reader can verify each piece independently.

**Section 1: Define P(n).**
State explicitly what proposition you're proving for all n. Be precise. "P(n): The sum of the first n positive integers equals n(n+1)/2." Not "the formula works" — write the exact mathematical claim.

**Section 2: Base Case.**
Prove P(1) (or P(0), or wherever the claim starts). This is usually one or two lines of arithmetic. Write it out explicitly — never skip it.

**Section 3: Inductive Hypothesis.**
Write the exact words: "Assume P(k) is true for some arbitrary integer k ≥ 1." Then state what P(k) says in full mathematical notation. This is the hypothesis you will use in the next step.

**Section 4: Inductive Step.**
State what you need to prove: "We will show P(k+1)." Write out what P(k+1) says. Then prove it — manipulating the left side until you can substitute the inductive hypothesis, then simplifying to match the right side. At the moment you substitute, write "by the inductive hypothesis" explicitly.

**Conclusion.**
"Therefore, by the Principle of Mathematical Induction, P(n) holds for all integers n ≥ 1."

The conclusion is not optional or ceremonial. It's the statement that closes the logical loop: base case + inductive step + principle of induction → claim for all n.`,
    ],

    callouts: [
      {
        type: 'insight',
        title: 'The Proof Scaffolding Template (The Ritual)',
        body: `Induction is a rigorous ritual. Use this guaranteed template:

**1. Define P(n):** "Let P(n) be the statement: [exact claim with n]."

**2. Base Case:** "We prove P([first value]). [Show the math equals perfectly]. Thus, the base case holds. ✓"

**3. Inductive Hypothesis:** "Assume P(k) is true for some arbitrary integer k ≥ [first value]. That is, assume [write the exact formula with k]."

**4. Inductive Step:** "We will prove P(k+1): [write the exact formula with k+1]."
[Execute algebra. At the substitution moment, write:] "...= [IH expression] + (k+1)  [by the inductive hypothesis]..."
[Continue simplifying to match P(k+1).]

**5. Conclusion:** "Therefore, by the Principle of Mathematical Induction, P(n) holds for all n ≥ [first value]. □"`,
      },
    ],

    visualizations: [
      {
        id: 'ProofBlueprintAnnotator',
        title: 'The Four-Section Proof Annotator',
        caption: 'A complete written proof with each section color-coded and explained. Click any line to see which section it belongs to and why it\'s necessary.',
        props: { guided: true, example: 'sum-formula' },
      },
      {
        id: 'ProofEngineViz',
        title: 'Rigorous Proof Engine',
        caption: 'Transition from geometric intuition to Formal Invariants. Watch the system verify the truth of the state at every step.',
        mathBridge: 'Enforces the connection between Algebra (the sum) and Invariants (the row properties) to create an unassailable proof.',
        props: { guided: true },
      },
      {
        id: 'ProofErrorDetector',
        title: 'Find the Flaw: Broken Proofs',
        caption: 'Five deliberately flawed induction proofs. Each has exactly one error. Can you find it? Covers: missing base case, wrong base case, unused hypothesis, circular reasoning, and wrong starting point.',
        props: { interactive: true, difficulty: 'medium' },
      },
    ],
  },

  examples: [
    {
      id: 'discrete-1-03-ex0',
      title: 'Warm-Up: The Pattern That Breaks (f(n) = n² + n + 41)',
      problem: 'Test f(n) = n² + n + 41 for n = 0, 1, 2, 3. What pattern do you see? Now test n = 40. What happens?',
      steps: [
        { expression: 'f(0) = 0 + 0 + 41 = 41 \\text{ (prime)}', annotation: 'f(1) = 43 (prime), f(2) = 47 (prime), f(3) = 53 (prime)...' },
        { expression: 'f(39) = 1521 + 39 + 41 = 1601 \\text{ (prime)}', annotation: '40 consecutive prime values. Looks unbreakable.' },
        { expression: 'f(40) = 1600 + 40 + 41 = 1681 = 41 \\times 41', annotation: 'Composite! The pattern shatters at the 41st test.' },
        { expression: '\\text{Testing 40 cases proved nothing.}', annotation: 'This is why proof requires something stronger than examples.' },
      ],
      conclusion: 'Finite testing can never establish infinite truth. Mathematical induction closes this gap permanently.',
    },
    {
      id: 'discrete-1-03-ex1',
      title: 'The Classic Arithmetic Sum — Full Proof',
      problem: 'Prove: for all positive integers n, 1 + 2 + 3 + ... + n = n(n+1)/2.',
      steps: [
        { expression: '\\textbf{Define } P(n): \\sum_{i=1}^n i = \\frac{n(n+1)}{2}', annotation: 'State exactly what we\'re proving. P(n) is this equation.' },
        { expression: '\\textbf{Base Case } (n=1): \\text{ LHS} = 1,\\quad \\text{RHS} = \\frac{1 \\cdot 2}{2} = 1 \\checkmark', annotation: 'LHS = RHS. Base case holds.' },
        { expression: '\\textbf{Inductive Hypothesis:} \\text{ Assume } \\sum_{i=1}^k i = \\frac{k(k+1)}{2} \\text{ for some } k \\geq 1', annotation: 'We formally assume P(k). This is the kinetic energy of domino k.' },
        { expression: '\\textbf{Inductive Step:} \\text{ Prove } \\sum_{i=1}^{k+1} i = \\frac{(k+1)(k+2)}{2}', annotation: 'This is what P(k+1) says. Write it out before you start.' },
        { expression: '\\sum_{i=1}^{k+1} i = \\underbrace{\\sum_{i=1}^k i}_{\\text{IH applies here}} + (k+1)', annotation: 'Split off the last term. The remaining sum is exactly the IH.' },
        { expression: '= \\frac{k(k+1)}{2} + (k+1) \\quad [\\text{by IH}]', annotation: '💥 Substituting the IH. This is the moment that drives the chain.' },
        { expression: '= (k+1)\\left(\\frac{k}{2} + 1\\right) = \\frac{(k+1)(k+2)}{2} \\checkmark', annotation: 'Factor out (k+1). This matches P(k+1) exactly.' },
        { expression: '\\therefore \\text{ By induction, } P(n) \\text{ holds for all } n \\geq 1. \\quad \\square', annotation: 'Conclusion. All four sections complete.' },
      ],
      conclusion: 'The sum formula is proven for all positive integers. Note the explicit IH substitution — that\'s the mechanical heart of every induction proof.',
    },
    {
      id: 'discrete-1-03-ex2',
      title: 'Strong Induction — Prime Factorization',
      problem: 'Prove that every integer n ≥ 2 can be written as a product of primes.',
      steps: [
        { expression: '\\textbf{Base Case } (n=2): \\text{ 2 is prime.}', annotation: '2 is its own prime factorization.' },
        { expression: '\\textbf{Strong IH:} \\text{ Assume every integer from 2 through } k \\text{ has a prime factorization.}', annotation: 'We assume the claim for ALL values 2 ≤ i ≤ k, not just k alone.' },
        { expression: '\\textbf{Inductive Step:} \\text{ Prove } k+1 \\text{ has a prime factorization.}', annotation: 'Two cases.' },
        { expression: '\\text{Case 1: } k+1 \\text{ is prime.}', annotation: 'Done — k+1 is its own factorization.' },
        { expression: '\\text{Case 2: } k+1 = a \\cdot b \\text{ where } 2 \\leq a, b < k+1', annotation: 'k+1 is composite — it factors into two smaller integers.' },
        { expression: '\\text{Since } 2 \\leq a, b \\leq k, \\text{ the Strong IH applies to both } a \\text{ and } b.', annotation: 'This is why we need strong induction — a and b could be any values up to k, not specifically k.' },
        { expression: 'k+1 = a \\cdot b = (\\text{primes}) \\cdot (\\text{primes}) = \\text{product of primes}. \\quad \\square', annotation: 'Combining the factorizations of a and b gives a factorization of k+1.' },
      ],
      conclusion: 'Strong induction was necessary because the factors a and b could be any values from 2 to k. Weak induction only gives you k, which might not be either factor.',
    },
    {
      id: 'discrete-1-03-ex3',
      title: 'Recursion Mirror: Fibonacci',
      problem: 'The Fibonacci sequence is defined recursively as F(1) = 1, F(2) = 1, F(n) = F(n−1) + F(n−2). Trace F(5) and connect it to strong induction.',
      steps: [
        { expression: 'F(5) = F(4) + F(3)', annotation: 'To compute F(5), we need F(4) and F(3). This is strong induction in reverse.' },
        { expression: 'F(4) = F(3) + F(2) = F(2) + F(1) + F(2) = 1 + 1 + 1 = 3', annotation: 'F(4) unwinds all the way to the base cases.' },
        { expression: 'F(3) = F(2) + F(1) = 1 + 1 = 2', annotation: 'Each sub-computation hits the hardcoded base cases.' },
        { expression: 'F(5) = 3 + 2 = 5', annotation: 'The full recursion tree collapses to a value.' },
        { expression: '\\text{Inductive equivalent: Assume F(k) and F(k-1) are correct.}', annotation: 'Strong IH gives us both. Then F(k+1) = F(k) + F(k-1) must be correct too.' },
      ],
      conclusion: 'Recursion computes by unwinding to base cases. Induction proves by propagating from base cases. Same structure, opposite directions.',
    },
    {
      id: 'discrete-1-03-ex4',
      title: 'Proof by Contradiction: √2 Is Irrational',
      problem: 'Prove √2 cannot be expressed as p/q where p,q are integers with no common factors.',
      steps: [
        { expression: '\\text{Assume } \\sqrt{2} = \\frac{p}{q} \\text{ in lowest terms}', annotation: 'Suppose for contradiction that √2 IS rational and already fully reduced.' },
        { expression: '2 = \\frac{p^2}{q^2} \\Rightarrow p^2 = 2q^2', annotation: 'Square both sides. p² is 2 times something — so p² is even.' },
        { expression: 'p^2 \\text{ even} \\Rightarrow p \\text{ even} \\Rightarrow p = 2k', annotation: 'An odd number squared is odd (check!). So p² even means p is even.' },
        { expression: '(2k)^2 = 2q^2 \\Rightarrow 4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2', annotation: 'Substitute p = 2k. Now q² is even, so q is even.' },
        { expression: '\\text{Both } p \\text{ and } q \\text{ even} \\Rightarrow \\gcd(p,q) \\geq 2', annotation: 'They share a factor of 2 — but we assumed they shared NO factors. Contradiction! ∎' },
      ],
      conclusion: 'The assumption that √2 is rational leads to a logical impossibility. Therefore √2 is irrational.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-03-ch0',
      difficulty: 'easy',
      problem: 'Identify the error: "Proof by induction that all horses are the same color." Base case P(1): trivially true (one horse is the same color as itself). Inductive step: given k+1 horses, remove horse 1 — the remaining k are the same color by IH. Now put horse 1 back and remove the last horse — those k are the same color. So all k+1 horses are the same color. Where does this proof break?',
      hint: 'Trace the argument carefully when k = 1 (proving P(2) from P(1)). Do the two groups actually overlap?',
      walkthrough: [
        { expression: '\\text{Test } P(1) \\to P(2): \\text{ 2 horses}', annotation: 'Remove horse 1: one horse, trivially same color. Remove horse 2: one horse, trivially same color. But there is NO OVERLAP.' },
        { expression: '\\text{Two groups of size 1 share no horses.}', annotation: 'The argument requires the two overlapping groups to share at least one horse — a "color bridge." With k=1, the overlap is empty.' },
        { expression: '\\text{The inductive step fails at } k=1 \\to k+1=2.', annotation: 'The chain breaks at the very first link. Strong spacing only works from k=2 onward, but the base case gives you only k=1.' },
      ],
      answer: 'The inductive step requires the two groups to overlap. When k=1, removing the first horse and removing the last horse gives two singleton groups with no shared member — no color bridge. The chain breaks between P(1) and P(2).',
    },
    {
      id: 'discrete-1-03-ch1',
      difficulty: 'easy',
      problem: 'Quick Check: If you mathematically prove the Inductive Step P(k) → P(k+1), but entirely forget to prove the Base Case P(1), what happens to the Domino line?',
      hint: 'Think about the physical kinetic energy required to start a reaction.',
      walkthrough: [
        { expression: '\\text{No Base Case = No initial push energy}', annotation: 'The dominoes are perfectly spaced, but nothing ever initiates the chain reaction!' },
      ],
      answer: 'The chain NEVER STARTS! You just proved the dominoes are perfectly spaced, but they all remain standing perfectly still forever.',
    },
    {
      id: 'discrete-1-03-ch2',
      difficulty: 'medium',
      problem: 'Prove by induction: 2⁰ + 2¹ + 2² + ... + 2ⁿ = 2ⁿ⁺¹ − 1.',
      hint: 'Start with the base case n=0. For the inductive step, split off the last term 2^(k+1) and substitute the IH for the remaining sum.',
      walkthrough: [
        { expression: '\\text{Base } (n=0): 2^0 = 1, \\quad 2^1 - 1 = 1 \\checkmark', annotation: 'One term, LHS = RHS.' },
        { expression: '\\text{IH: Assume } \\sum_{i=0}^k 2^i = 2^{k+1} - 1', annotation: 'This is what P(k) says.' },
        { expression: '\\sum_{i=0}^{k+1} 2^i = \\left(\\sum_{i=0}^k 2^i\\right) + 2^{k+1} = (2^{k+1} - 1) + 2^{k+1}', annotation: '💥 Substituting the IH.' },
        { expression: '= 2 \\cdot 2^{k+1} - 1 = 2^{k+2} - 1', annotation: 'This matches P(k+1). Chain closed. ∎' },
      ],
      answer: 'By induction: base case n=0 holds, inductive step uses IH to substitute the sum and simplify.',
    },
    {
      id: 'discrete-1-03-ch3',
      difficulty: 'hard',
      problem: 'Prove: any postage of n ≥ 8 cents can be formed using only 3-cent and 5-cent stamps.',
      hint: 'This requires strong induction with base cases for n=8, 9, 10. For n > 10, note that (n−3) ≥ 8, so by the strong IH, n−3 can be formed — then add one 3-cent stamp.',
      walkthrough: [
        { expression: '\\text{Base Cases: } 8 = 3+5, \\quad 9 = 3+3+3, \\quad 10 = 5+5', annotation: 'Three base cases establish the foundation.' },
        { expression: '\\text{Strong IH: Assume all postages from 8 to } k \\text{ can be formed.}', annotation: 'k ≥ 10 for the inductive step.' },
        { expression: '\\text{For } k+1: \\text{ since } k+1 \\geq 11, \\text{ we have } k-2 \\geq 8.', annotation: 'k−2 is within the range of our strong IH.' },
        { expression: 'k-2 \\text{ can be formed (by strong IH)}. \\text{ Add one 3-cent stamp: } (k-2)+3 = k+1.', annotation: 'The strong IH handles k−2; one additional stamp completes k+1.' },
      ],
      answer: 'Strong induction with three base cases. For k+1 ≥ 11: k−2 ≥ 8 is coverable by IH; adding a 3-cent stamp gives k+1.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'P(n)', meaning: 'Proposition — a statement depending on an integer n' },
      { symbol: 'Base Case', meaning: 'The smallest value (e.g., P(1)) for which the statement is directly proven' },
      { symbol: 'Inductive Hypothesis (IH)', meaning: 'The assumption that P(k) is true for some arbitrary k — the "kinetic energy" of the chain' },
      { symbol: 'Inductive Step', meaning: 'Proving that P(k) ⇒ P(k+1) — the spacing between dominoes' },
      { symbol: 'Strong Induction', meaning: 'Assuming P(i) is true for ALL 1 ≤ i ≤ k, not just k' },
      { symbol: 'Recursion', meaning: 'Defining a function in terms of itself with a base case — induction running backwards' },
      { symbol: 'Recurrence Relation', meaning: 'A formula defining the nth term using previous terms' },
      { symbol: 'Well-Ordering Principle', meaning: 'Every non-empty set of positive integers has a smallest element — the deep reason induction works' },
    ],
    rulesOfThumb: [
      'Always write P(n) explicitly before starting. Vague statements produce vague proofs.',
      'Never skip the base case. It is not obvious — it must be verified.',
      'In the inductive step, you MUST visibly use the inductive hypothesis. If you didn\'t use it, you didn\'t do induction.',
      'Strong induction is needed when your proof of P(k+1) needs P(i) for some i < k, not just i = k.',
      'Induction proves; recursion computes. They\'re structurally identical but run in opposite directions.',
      'A single counterexample destroys a universal claim. A single omission of the base case destroys an inductive proof.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'Induction is a specific formal proof technique used for claims involving natural numbers.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-07-recurrence-relations',
        label: 'Recurrence Relations',
        note: 'We will use induction to prove the closed-form solutions of recursive sequences.',
      },
      {
        lessonId: 'discrete-2-01-algorithm-analysis',
        label: 'Algorithm Analysis',
        note: 'Loop invariants are induction in disguise. Every algorithm proof uses the techniques from this lesson.',
      },
    ],
  },

  mentalModel: [
    'Induction is a domino effect: push the first, prove each knocks the next, and all fall.',
    'The inductive hypothesis is kinetic energy — you can\'t close the chain without it.',
    'Strong induction uses the combined weight of all prior dominoes, not just the last one.',
    'Recursion is induction in reverse: start at n, unwind to the base case.',
    'The Well-Ordering Principle is the reason induction actually works — there\'s always a first domino.',
    'Testing examples establishes pattern. Induction establishes proof. Only the latter survives the 41st case.',
  ],

  assessment: {
    questions: [
      {
        id: 'ind-assess-1',
        type: 'choice',
        text: 'What is the "Inductive Hypothesis"?',
        options: ['The base case', 'The conclusion to be proven', 'The assumption that P(k) is true', 'The final step of the proof'],
        answer: 'The assumption that P(k) is true',
        hint: 'You assume the statement holds for k to prove it holds for k+1.',
      },
      {
        id: 'ind-assess-2',
        type: 'input',
        text: 'In recursive Fibonacci f(n) = f(n-1) + f(n-2), how many base cases are needed?',
        answer: '2',
        hint: 'Since it looks back at two prior values, you need two seeds to start.',
      },
      {
        id: 'ind-assess-3',
        type: 'choice',
        text: 'You\'re proving a claim about prime factorization where P(k+1) depends on factors a and b, both strictly less than k+1 but not necessarily equal to k. Which type of induction do you need?',
        options: ['Weak (Standard) Induction', 'Strong Induction', 'Proof by Contradiction', 'Direct Proof'],
        answer: 'Strong Induction',
        hint: 'The factors a and b could be any values from 2 to k. You need the IH to hold for all of them, not just k.',
      },
      {
        id: 'ind-assess-4',
        type: 'choice',
        text: 'A proof writes the inductive hypothesis and then proves P(k+1) correctly — but never references the hypothesis anywhere in the algebra. This proof is:',
        options: ['Valid', 'Invalid — the IH was not used', 'Valid if the base case holds', 'Incomplete but fixable'],
        answer: 'Invalid — the IH was not used',
        hint: 'Using the IH is not optional. It\'s the mechanism that connects domino k to domino k+1.',
      },
    ],
  },

  quiz: [
    {
      id: 'ind-q1',
      type: 'choice',
      text: 'What happens if you prove the Inductive Step but the Base Case is False?',
      options: ['The statement is still True', 'The proof is valid for n > 1', 'The entire statement is unproven', 'The statement is only true for prime numbers'],
      answer: 'The entire statement is unproven',
      hints: ['Without the base case, the domino chain is never initiated.'],
    },
    {
      id: 'ind-q2',
      type: 'choice',
      text: 'When should you use Strong Induction instead of Weak Induction?',
      options: ['When n is very large', 'When the k+1 step depends on multiple previous steps', 'When proving geometric theorems', 'When the base case is n=0'],
      answer: 'When the k+1 step depends on multiple previous steps',
      hints: ['Strong induction allows you to use the entire history of proven cases.'],
    },
    {
      id: 'ind-q3',
      type: 'choice',
      text: 'The base case of a mathematical induction proof for n ≥ 3 should verify P(n) for n =',
      options: ['0', '1', '2', '3'],
      answer: '3',
      hints: ['The base case proves P(n) for the smallest n in the claim. If the claim starts at n=3, start there.'],
    },
    {
      id: 'ind-q4',
      type: 'choice',
      text: 'Which is NOT a valid connection between recursion and induction?',
      options: [
        'A recursive base case corresponds to an inductive base case',
        'A recursive call on smaller input corresponds to using the inductive hypothesis',
        'Recursion computes values bottom-up; induction proves top-down',
        'The structure of a recursive algorithm suggests the structure of its inductive correctness proof',
      ],
      answer: 'Recursion computes values bottom-up; induction proves top-down',
      hints: ['Recursion actually unwinds top-down (from n to base case). Induction propagates bottom-up (from base case to n). They run in opposite directions.'],
    },
  ],
}