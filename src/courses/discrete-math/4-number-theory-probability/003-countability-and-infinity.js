import hilbertsHotelUrl from '../diagrams/dm-hilberts-hotel.svg?url'
import cantorDiagonalUrl from '../diagrams/dm-cantor-diagonal.svg?url'

export default {
  id: 'discrete-1-06a',
  slug: 'countability-and-infinity',
  chapter: 'discrete-4',
  order: 2,
  title: 'Countability and Infinity',
  subtitle: 'Some infinities are bigger than others — and a bijection is how you prove it',
  tags: ['countability', 'infinity', 'cantor', 'diagonal argument', 'bijection', 'cardinality'],
  aliases: 'countable uncountable cantor diagonalization hilbert hotel aleph null cardinality of infinite sets',

  hook: {
    question: 'A hotel has infinitely many rooms, numbered 1, 2, 3, .... Every single room is occupied. A new guest arrives. Can the hotel fit them?',
    realWorldContext: 'This is Hilbert\'s Hotel, one of the most famous thought experiments in mathematics. The surprising answer — yes, always — is the doorway into a question that sounds like a philosophy-class trick but has a rigorous, provable answer: are all infinities the same size? The sets-and-functions lesson promised this question would come back; this is where it\'s finally answered, using nothing but the bijection idea already built.',
  },

  intuition: {
    prose: [
      `### Comparing Sizes Without Counting

For finite sets, "same size" obviously means "same count" — {🍎,🍊,🍋} and {🐶,🐱,🐭} both have 3 elements, easy to check by counting. But counting doesn't work for infinite sets — you can't finish counting ℕ = {1, 2, 3, ...} to see "how many" there are. Mathematicians solve this with the one tool from the sets-and-functions lesson that doesn't require counting at all: a **bijection**. Two sets have the *same cardinality* (the same "size," in the sense that matters for infinite sets) if there exists a bijection between them — a perfect 1-to-1 pairing with no element left over on either side, in either direction.

A set is called **countably infinite** if it can be put in bijection with ℕ = {1, 2, 3, ...} — equivalently, if you can list its elements in an infinite sequence: 1st, 2nd, 3rd, .... A set is **countable** if it's finite or countably infinite; **uncountable** if it's infinite but cannot be listed this way, no matter how cleverly you try.`,

      `![Hilbert's Hotel: every room shifts up by one to make room for a new guest](${hilbertsHotelUrl})`,

      `### Hilbert's Hotel, Resolved

The hotel is full — every room 1, 2, 3, ... has a guest. A new guest arrives. The manager's solution: ask the guest in room n to move to room n+1, for every n, simultaneously. Room 1 is now empty, and — critically — every existing guest still has a room, because the move n → n+1 is defined for every single n with no exceptions. The new guest checks into room 1.

This feels like a trick, but it's a fully rigorous proof: the function f(n) = n+1 is a bijection from ℕ to ℕ \\ {1} (this is literally the same style of bijection argument as f(n) = 2n mapping ℤ onto the even integers, from the sets-and-functions lesson). "Adding one guest to an infinite, full hotel" doesn't change the *cardinality* — ℕ and ℕ ∪ {new guest} are the same size, because a bijection between them exists. Finite intuition ("full means full") simply does not transfer to infinite sets, and this is the first hard proof of that fact.`,

      `### Surprising Sets That Are the Same Size as ℕ

Once you accept that "same size" means "bijects with ℕ," some genuinely surprising sets turn out to be countable:

**The integers ℤ** = {..., −2, −1, 0, 1, 2, ...} — twice as large as ℕ at first glance, since ℤ contains all the negatives too — is still countable. Enumerate them by bouncing outward from 0: 0, 1, −1, 2, −2, 3, −3, .... This assigns every integer a unique position 1, 2, 3, ... in the list, which is exactly a bijection with ℕ.

**The positive rationals ℚ⁺** — seemingly far denser than ℕ, since between any two integers there are infinitely many fractions — are *also* countable. Arrange every fraction p/q in a grid (row p, column q), then snake through the grid diagonally: 1/1, 1/2, 2/1, 1/3, 2/2, 3/1, .... skipping any fraction not in lowest terms (to avoid listing 1/2 and 2/4 as if they were different). Every rational eventually appears at some finite position in this list — another bijection with ℕ, despite ℚ feeling "denser" than ℤ.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Cardinality and ℵ₀ (Aleph-Null)',
        body: 'Two sets A and B have the same **cardinality**, written |A| = |B|, if there exists a bijection f: A → B. The cardinality of ℕ (and every countably infinite set) is given the symbol **ℵ₀** ("aleph-null") — the smallest infinite cardinal number.',
      },
      {
        type: 'insight',
        title: 'The Recovery Point: f(n) = 2n',
        body: 'The sets-and-functions lesson proved f(n) = 2n is a bijection from ℤ to the even integers — proof that ℤ and "half of ℤ" are the same size. Hilbert\'s Hotel and the ℚ enumeration above are the exact same move, applied to progressively less obvious pairs of sets.',
      },
    ],
    visualizations: [
      {
        id: 'HilbertHotelSimulator',
        title: "Hilbert's Hotel Simulator",
        caption: 'Trigger a new guest, or an entire infinite bus, and watch the room-shifting bijection play out live.',
      },
    ],
  },

  math: {
    prose: [
      `### Not Every Infinity Is Countable

Every example so far — ℕ, ℤ, ℚ — turned out to be countable, which might suggest *all* infinite sets are the same size. They are not. Georg Cantor proved in 1891 that the real numbers ℝ (even just the reals between 0 and 1) cannot be put into any bijection with ℕ — ℝ is **uncountable**, a strictly larger infinity than ℵ₀.`,

      `![Cantor's diagonal argument: build a new decimal that differs from every listed number in at least one digit](${cantorDiagonalUrl})`,

      `### Cantor's Diagonal Argument

The proof is by contradiction, and it is one of the most celebrated arguments in all of mathematics. Suppose, for contradiction, that the reals between 0 and 1 *are* countable — meaning you could list every single one of them as x₁, x₂, x₃, ..., with each xₙ written as an infinite decimal.

Now construct a new number y digit by digit: for the nth digit of y, look at the nth digit of xₙ (the number in the nth position on the list) and pick a *different* digit — any consistent rule works, e.g. "if it's 5, write 6; otherwise write 5." By construction, y differs from x₁ in at least the 1st digit, from x₂ in at least the 2nd digit, from x₃ in at least the 3rd digit, and so on for every n. So y differs from *every single number on the list*, in at least one digit — meaning y is a real number between 0 and 1 that is not x₁, not x₂, not x₃, not anywhere on the list at all.

But the list was supposed to contain *every* real number between 0 and 1. We just constructed one that isn't there. Contradiction. The assumption — that the reals are countable — must be false.`,

      `### Why This Doesn't Also "Prove" ℚ Is Uncountable

A natural objection: couldn't you run the same argument on the rationals and "prove" ℚ is uncountable too, contradicting the earlier enumeration? No — the diagonal construction produces some infinite decimal y, but there's no guarantee y is *rational*. In fact y is typically irrational (its digits were built by an arbitrary, patternless rule), so it doesn't need to appear on a list of rationals at all. The diagonal argument only breaks a supposed enumeration of the *reals*, because only for the reals does "some infinite decimal exists that isn't on the list" immediately contradict the list's claimed completeness.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Cantor's Theorem (General Form)",
        body: 'For any set S, the power set P(S) (the set of all subsets of S) always has strictly greater cardinality than S itself — even when S is infinite. Applied to S = ℕ, this gives an infinite tower of ever-larger infinities: |ℕ| < |P(ℕ)| < |P(P(ℕ))| < ... — there is no single "largest infinity."',
      },
      {
        type: 'insight',
        title: 'The Continuum Hypothesis',
        body: 'Cantor conjectured there is no cardinality strictly between |ℕ| = ℵ₀ and |ℝ| (called the "continuum"). This is the **Continuum Hypothesis**. In 1963, Paul Cohen proved it is *independent* of the standard axioms of set theory — it can neither be proved nor disproved from them. This is one of the strangest results in 20th-century mathematics: a precise, meaningful question with no answer derivable from the usual foundations.',
      },
    ],
  },

  rigor: {
    prose: [
      'To prove a set S is countable, the standard technique is to exhibit an explicit bijection (or at least an injection) f: ℕ → S that hits every element of S, as done above for ℤ and ℚ. To prove a set is uncountable, direct construction is impossible by definition — you must argue by contradiction, assuming a complete enumeration exists and deriving an element it necessarily missed, exactly as Cantor\'s diagonal argument does.',

      'A common error is to treat "countable" as meaning "small" or "finite-like." Countably infinite sets are still infinite — ℕ, ℤ, and ℚ are all genuinely infinite, unbounded sets. "Countable" means only that the infinity is *enumerable*, listable in a single sequence — not that it is small in any other sense.',

      'Another common error: assuming that because ℚ "contains" ℕ as a subset, ℚ must be strictly larger. For infinite sets, a proper subset can have the *same* cardinality as the whole set — this is precisely what Hilbert\'s Hotel demonstrates (ℕ \\ {1} is a proper subset of ℕ, yet |ℕ \\ {1}| = |ℕ|). "A proper subset must be strictly smaller" is a finite-set intuition that provably fails once sets are infinite.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-06a-ex1',
      title: 'A Bijection Between ℕ and ℤ',
      problem: 'Exhibit an explicit bijection f: ℕ → ℤ, proving |ℕ| = |ℤ|.',
      steps: [
        { expression: '\\text{Define } f(n) = \\begin{cases} n/2 & n \\text{ even} \\\\ -(n-1)/2 & n \\text{ odd} \\end{cases}', annotation: 'This alternates: even n map to positive integers, odd n map to zero and negatives.' },
        { expression: 'f(1)=0,\\ f(2)=1,\\ f(3)=-1,\\ f(4)=2,\\ f(5)=-2,\\ \\ldots', annotation: 'Trace the first few values — this is exactly the "bounce outward from 0" enumeration: 0, 1, −1, 2, −2, ...' },
        { expression: '\\text{Injective: distinct } n \\text{ produce distinct outputs (check even/odd cases separately)}', annotation: 'Two even inputs give different n/2 values; two odd inputs give different −(n−1)/2 values; an even and an odd output can never coincide (one is ≥ 0, tracked by parity of the formula, the other ≤ 0) — a full check goes case by case.' },
        { expression: '\\text{Surjective: every integer } k \\text{ is reached — by } n=2k \\text{ if } k>0,\\ n=1 \\text{ if } k=0,\\ n=-2k+1 \\text{ if } k<0', annotation: 'Every integer, positive, negative, or zero, has a specific n that maps to it — nothing in ℤ is missed.' },
        { expression: '\\therefore f \\text{ is bijective} \\implies |\\mathbb{Z}| = |\\mathbb{N}| = \\aleph_0', annotation: 'A bijection exists, so ℤ is countably infinite — the same cardinality as ℕ, despite containing "twice as many" numbers by naive finite intuition.' },
      ],
      conclusion: 'ℤ is countable. This is the same technique as Hilbert\'s Hotel: a clever relabeling proves two sets that look like they should differ in size are actually the same size.',
    },
    {
      id: 'discrete-1-06a-ex2',
      title: "Cantor's Diagonal Argument, Fully Worked",
      problem: 'Prove that the real numbers strictly between 0 and 1 are uncountable.',
      steps: [
        { expression: '\\text{Assume for contradiction: } (0,1) \\text{ is countable, listed as } x_1, x_2, x_3, \\ldots', annotation: 'Standard proof-by-contradiction setup: assume the opposite of what we want to prove.' },
        { expression: '\\text{Write each } x_i \\text{ in decimal: } x_i = 0.d_{i1}d_{i2}d_{i3}\\ldots', annotation: 'd_{ij} denotes the jth digit after the decimal point of the ith number on the list.' },
        { expression: '\\text{Define } y = 0.e_1e_2e_3\\ldots \\text{ where } e_n = \\begin{cases} 5 & d_{nn} \\neq 5 \\\\ 6 & d_{nn} = 5 \\end{cases}', annotation: 'Build y by walking the diagonal (the nth digit of the nth number) and deliberately picking a different digit at every position.' },
        { expression: 'y \\neq x_n \\text{ for every } n, \\text{ since they differ in digit } n', annotation: 'By construction, y and x_n disagree at position n specifically — so y cannot equal any x_n.' },
        { expression: 'y \\in (0,1) \\text{ but } y \\notin \\{x_1, x_2, x_3, \\ldots\\}', annotation: 'y is a valid real number strictly between 0 and 1, yet it is absent from the supposedly complete list.' },
        { expression: '\\text{Contradiction} \\implies (0,1) \\text{ is uncountable} \\quad \\blacksquare', annotation: 'The list was assumed to contain every real in (0,1); we exhibited one it does not contain. The assumption fails.' },
      ],
      conclusion: 'The reals are uncountable — a strictly larger infinity than ℕ, ℤ, or ℚ. This is the first rigorous proof that "infinity" is not a single size.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-06a-ch1',
      difficulty: 'easy',
      problem: "Hilbert's Hotel is completely full. Instead of 1 new guest, an infinite bus arrives carrying guests numbered 1, 2, 3, .... Can the hotel fit all of them? (Hint: move the existing guest in room n to room 2n first.)",
      hint: 'After making room via n → 2n, which rooms are free, and how many?',
      walkthrough: [
        { expression: '\\text{Move existing guest in room } n \\text{ to room } 2n', annotation: 'Every existing guest now occupies an even-numbered room.' },
        { expression: '\\text{Odd-numbered rooms } 1, 3, 5, \\ldots \\text{ are now empty}', annotation: 'There are infinitely many odd rooms — exactly as many as there are new bus passengers.' },
        { expression: '\\text{Seat bus passenger } k \\text{ in room } 2k - 1', annotation: 'Passenger 1 → room 1, passenger 2 → room 3, passenger 3 → room 5, and so on — every passenger gets a room.' },
      ],
      answer: 'Yes. Move existing guests n → 2n (freeing all odd rooms), then seat bus passenger k in room 2k−1. Everyone — old guests and new — has a room.',
    },
    {
      id: 'discrete-1-06a-ch2',
      difficulty: 'medium',
      problem: 'Explain the flaw: "Cantor\'s diagonal argument, run on a list of all rationals in (0,1) written as decimals, produces a number not on the list — so ℚ ∩ (0,1) must be uncountable too." Why doesn\'t this argument work?',
      hint: 'What kind of number does the diagonal construction actually produce, and is it guaranteed to be rational?',
      walkthrough: [
        { expression: '\\text{The diagonal number } y \\text{ is built digit-by-digit with no arithmetic pattern}', annotation: 'The rule "change digit n" produces a number whose digits have no periodic or terminating structure in general.' },
        { expression: '\\text{Rational numbers have decimal expansions that terminate or eventually repeat}', annotation: 'This is the defining test for rationality in decimal form (established in the propositions lesson\'s discussion of rational vs. irrational decimals).' },
        { expression: '\\text{Generically, } y \\text{ is irrational} \\implies y \\notin \\mathbb{Q} \\cap (0,1)', annotation: 'Since y is very unlikely to be rational, its absence from a list of rationals proves nothing — a list of rationals was never obligated to contain irrational numbers.' },
      ],
      answer: 'The diagonal construction produces some real number y, but nothing guarantees y is rational. Since y is generally irrational, its absence from a rationals-only list is expected and proves nothing about the countability of ℚ.',
    },
    {
      id: 'discrete-1-06a-ch3',
      difficulty: 'hard',
      problem: 'Prove that the set of all finite-length binary strings (like "0", "101", "111000", ...) is countable.',
      hint: 'Group the strings by length. How many strings are there of each fixed length? Then order the groups.',
      walkthrough: [
        { expression: '\\text{For each length } k, \\text{ there are exactly } 2^k \\text{ binary strings of that length}', annotation: 'k independent binary digits, each with 2 choices — the multiplication rule from the counting lesson.' },
        { expression: '\\text{List strings by increasing length: length 0, then length 1, then length 2, } \\ldots', annotation: 'Within each length group (finitely many strings), list them in any fixed order, e.g. numerically.' },
        { expression: '\\text{Every string has a finite length} \\implies \\text{it appears at some finite position in this list}', annotation: 'A string of length k appears after all shorter strings — a finite head start — so it gets a definite, finite position number.' },
        { expression: '\\therefore \\text{ the set of all finite binary strings is countable}', annotation: 'An explicit listing scheme that reaches every element is exactly a bijection with ℕ (or a subset of it).' },
      ],
      answer: 'Countable. Group by length (each length has finitely many strings, by the multiplication rule), then list length-0 strings, then length-1, then length-2, and so on — every string eventually appears at a finite position.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'sets-and-functions-for-discrete', label: 'Sets and Functions', context: 'Bijections, injectivity, and surjectivity — defined there — are the entire toolkit this lesson uses to compare infinite sizes.' },
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: "Cantor's diagonal argument is a proof by contradiction, and the rational-vs-irrational decimal test used in the challenges comes directly from that lesson." },
    { lessonSlug: 'counting-and-combinatorics', label: 'Counting and Combinatorics', context: 'The multiplication rule (2^k binary strings of length k) is exactly the counting tool from that lesson, reused here to prove countability.' },
  ],

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-02a',
        label: 'Sets and Functions',
        note: 'This lesson directly resolves the "Hilbert\'s Hotel & Infinity" callout from that lesson — f(n) = 2n proved ℤ and the evens have the same size; this lesson generalizes that exact idea.',
      },
    ],
    futureLinks: [],
  },

  mentalModel: [
    'Same cardinality = a bijection exists. This is the only definition that works for infinite sets.',
    'Countable = listable in a single infinite sequence 1st, 2nd, 3rd, .... Countably infinite sets are still infinite, just enumerable.',
    "Hilbert's Hotel: a proper subset of an infinite set can have the exact same cardinality as the whole set.",
    'ℕ, ℤ, and ℚ are all countable (same size, ℵ₀) — surprising, since ℚ looks "denser."',
    'ℝ is uncountable — a strictly larger infinity, proved by Cantor\'s diagonal argument (proof by contradiction).',
    "Cantor's Theorem: P(S) is always strictly bigger than S, even for infinite S — there is no largest infinity.",
  ],

  assessment: {
    questions: [
      {
        id: 'ci-assess-1',
        type: 'choice',
        text: 'Two sets have the same cardinality when:',
        options: ['They have the same number of even elements', 'A bijection exists between them', 'One is a subset of the other', 'They are both infinite'],
        answer: 'A bijection exists between them',
        hint: 'This is the only definition of "same size" that works for both finite and infinite sets.',
      },
      {
        id: 'ci-assess-2',
        type: 'input',
        text: "What is the name of Cantor's technique for proving ℝ is uncountable?",
        answer: 'diagonal argument',
        hint: 'It involves walking the diagonal of an assumed list of decimal expansions.',
      },
    ],
  },

  quiz: [
    {
      id: 'ci-q1',
      type: 'choice',
      text: 'Which of these sets is uncountable?',
      options: ['ℕ (natural numbers)', 'ℤ (integers)', 'ℚ (rationals)', 'ℝ (reals)'],
      answer: 'ℝ (reals)',
      hints: ['ℕ, ℤ, and ℚ are all countable — provably the same cardinality as ℕ. ℝ is the odd one out, proved by the diagonal argument.'],
    },
    {
      id: 'ci-q2',
      type: 'choice',
      text: 'In Hilbert\'s Hotel, moving every guest from room n to room n+1 proves:',
      options: [
        'The hotel was not actually full',
        'ℕ and ℕ \\ {1} have the same cardinality',
        'Infinite sets cannot be full',
        'The new guest does not really check in',
      ],
      answer: 'ℕ and ℕ \\ {1} have the same cardinality',
      hints: ['The shift n → n+1 is an explicit bijection between all of ℕ and ℕ with room 1 removed — proof that a proper subset can match the whole set\'s size.'],
    },
    {
      id: 'ci-q3',
      type: 'choice',
      text: "Why doesn't Cantor's diagonal argument also prove ℚ is uncountable?",
      options: [
        'Because ℚ is finite',
        'Because the diagonal number constructed is generally irrational, so its absence from a rationals list proves nothing',
        'Because rationals cannot be written as decimals',
        'Because the argument only works for whole numbers',
      ],
      answer: 'Because the diagonal number constructed is generally irrational, so its absence from a rationals list proves nothing',
      hints: ['The construction produces some real number with no guarantee of rationality — a rationals-only list was never required to contain it.'],
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
