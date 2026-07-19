import hasseDiagramUrl from '../diagrams/dm-hasse-diagram.svg?url'
import equivalencePartitionUrl from '../diagrams/dm-equivalence-partition.svg?url'

export default {
  id: 'discrete-1-02',
  slug: 'relations-and-structures',
  chapter: 'discrete-2',
  order: 1,
  title: 'Relations, Equivalence, and Order',
  subtitle: 'How Discrete Math organizes raw unstructured data into hierarchies and partitions',
  tags: ['sets', 'relations', 'equivalence relation', 'partial order', 'functions', 'poset'],
  aliases: 'relation matrix reflexive symmetric transitive antisymmetric equivalence class poset',

  hook: {
    question: 'When is a relationship between objects "well-behaved" enough to let us group them cleanly or rank them reliably?',
    realWorldContext: 'Equivalence relations power modular arithmetic, database normalization, and file deduplication. Partial orders appear in task scheduling, version control (Git branches), and topological sorting of dependencies.',
  },

  intuition: {
    prose: [
      '### 1. The Anatomy of a Relation (Wiring the Grid)',
      'A <span class="tooltip" data-tooltip="A binary relation R on a set A is a subset of A × A. We write a R b when (a,b) is in the relation.">relation</span> is any way of pairing elements from a set with itself (or between two sets).',
      'Some relations are especially useful. An <span class="tooltip" data-tooltip="An equivalence relation is reflexive, symmetric, and transitive. It cleanly partitions the set into equivalence classes.">equivalence relation</span> groups elements that “belong together” — like numbers with the same remainder modulo 5.',
      'A <span class="tooltip" data-tooltip="A partial order is reflexive, antisymmetric, and transitive. It lets us compare elements without requiring every pair to be comparable (e.g., divisibility on integers).">partial order</span> gives us hierarchy and ranking while allowing incomparable elements (like two tasks that can be done in either order).',
      'The interactive explorer below lets you build a small set, define relations by clicking pairs, and instantly see whether the relation is an equivalence relation or a partial order. The tutor explains the properties as they appear and connects directly to the formal definitions.',
      'The Cartesian Product (A × B) creates every possible raw combinatorial coordinate pair. But what if we want to aggressively filter that massive grid using a strict rule?',
      'A **Relation R** on a Set is mathematically just a subset of its Cartesian Grid. It is a strict Yes/No mapping filter. If the pair (a, b) successfully clears the rule, we officially write it as **a R b** ("a is related to b"). If it fails, the connecting arrow simply doesn\'t exist!',
      'Because they just map items to other items using arrows, Relations are literally exactly the same thing as **Directed Graphs**.',
      '### 2. Relation vs. Function (The Showdown)',
      'Beginners constantly confuse these two systems! Every Function is technically a Relation, but very few Relations are Functions.',
      'A **Function** is incredibly strict and "loyal"—every single input is absolutely forced to shoot exactly ONE outward arrow. A **Relation**, however, is structurally "wild"—an input can securely fire 5 arrows at once, or zero arrows!',
      '### 3. The Holy Trinity of Data Properties',
      'To engineer complex logical machinery (like databases or social networks), mathematicians classify relations based on three fundamental structural laws:',
      '• **Reflexive:** *Everyone trusts themselves.* Every element points an arrow back to itself. In a matrix, the main diagonal is fully filled in.',
      '• **Symmetric:** *If I trust you, you must trust me.* Every arrow is bidirectional. If a → b exists, the return edge b → a must also exist. The data matrix is mirrored across its diagonal.',
      '• **Transitive:** *Shortcuts are enforced — if I trust you, and you trust Bob, I trust Bob.* If the path A → B exists, and B → C exists, there must also be a direct edge A → C. If it\'s missing, transitivity fails.',
      'Vocabulary bridge: A <span class="tooltip" data-tooltip="A relation R on A is a subset of A × A.">relation</span> can become an <span class="tooltip" data-tooltip="Reflexive + symmetric + transitive.">equivalence relation</span> or a <span class="tooltip" data-tooltip="Reflexive + antisymmetric + transitive.">partial order</span> depending on which structural laws it satisfies.',
      'Intuition anchor: equivalence relations split sets into <span class="tooltip" data-tooltip="A partition is a family of disjoint non-empty subsets whose union is the whole set.">partitions</span>, while partial orders build <span class="tooltip" data-tooltip="A poset is a set equipped with a partial order relation.">posets</span> where some elements can remain incomparable.'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Asymmetric vs. Antisymmetric (The Logic Trap)',
        body: 'A common trap: "antisymmetric" is not simply the opposite of "symmetric."\n\n• **Asymmetric:** (Strictly Taller Than.) If A → B exists, B → A cannot. Self-loops (A → A) are also forbidden.\n• **Antisymmetric:** (Greater Than or Equal To.) A mutual pair (A → B and B → A) is only allowed when A and B are the same node. Self-loops are fine — often required.'
      },
      {
        type: 'insight',
        title: 'How to Use This Interactive Lesson',
        body: '1. Keep diagonal entries on to satisfy reflexivity. 2. In equivalence mode, use mirrored pairs for symmetry. 3. In order mode, avoid two-way links between distinct nodes to satisfy antisymmetry. 4. Use the transitivity warning panel to fill missing shortcut pairs.'
      },
      {
        type: 'insight',
        title: 'Second Perspective: Guided Relation Builder',
        body: 'Use the added RelationsExplorer as a second perspective. In equivalence mode, enforce reflexive/symmetric/transitive. In order mode, enforce reflexive/antisymmetric/transitive. The tutor panel maps each click to the formal definitions.'
      }
    ],
    visualizations: [
      {
        id: 'RelationMatrixLab',
        title: 'The Relation Architect Lab',
        caption: 'Wire the boolean matrix grid by clicking the intersections. Watch how the real-time geometric structural analysis instantly updates the properties of your mathematical web!'
      },
      {
        id: 'RelationsExplorer',
        title: 'Interactive Relations Explorer (Guided)',
        caption: 'Build relation pairs directly and watch reflexive/symmetric/antisymmetric/transitive checks update live.',
        mathBridge: 'Designed to connect intuitive clicking behavior to formal relation properties.',
        props: { guided: true, initialMode: 'equivalence' }
      }
    ]
  },

  math: {
    prose: [
      '### 4. Equivalence Relations (Slicing the Pie)',
      'Every equivalence relation on a set A corresponds to a <span class="tooltip" data-tooltip="A partition of A is a collection of non-empty, disjoint subsets whose union is A.">partition</span> of A into <span class="tooltip" data-tooltip="An equivalence class [a] is the set of all elements related to a under the equivalence relation.">equivalence classes</span>.',
      'A partial order ≤ on A makes (A, ≤) a <span class="tooltip" data-tooltip="A partially ordered set, or poset.">poset</span>. If every pair of elements is comparable, it becomes a total order (like the usual ≤ on numbers).',
      'What mathematically happens when a Relation is completely **Reflexive AND Symmetric AND Transitive** all at the exact same time? You achieve the legendary **Equivalence Relation**.',
      'An Equivalence Relation is so structurally flawless that it perfectly slices its Universe Set into mutually exclusive chunks called **Equivalence Classes (or Partitions).** Every single piece of data is neatly sorted into exactly one category bucket. Nothing is left resting outside, and absolutely NO data overlaps between buckets.',
      'For example: the relation "has the same birthday month as you" is an equivalence relation. It splits people into exactly 12 buckets, one per month. Programmers use this exact structure whenever they group objects by an equality-like key.',

      `![Congruence mod 3 splits the integers into three disjoint classes: [0], [1], [2]](${equivalencePartitionUrl})`,

      'This is the same "same remainder" idea from the Pigeonhole Principle lesson, now formalized: congruence mod 3 is an equivalence relation, and its equivalence classes [0], [1], [2] are exactly the partition shown above. Every integer lands in exactly one bucket — nothing is left out, nothing is double-counted.',
      '### 5. Partial Orders vs. Total Orders (The Poset Hierarchy)',
      'What happens if we swap out Symmetric for **Antisymmetric**? If the relation is strictly **Reflexive AND Antisymmetric AND Transitive**, we create a **Partial Order (Poset)**.',
      'A Partial Order is the ultimate mathematical model for Prerequisites! In a Poset, some tasks run perfectly in parallel (e.g. A front-end dev and a back-end dev working at the exact same time). They are validly "Incomparable" mathematically!',
      'If instead we require every pair of elements to be comparable (everyone stands in a single-file rank), the poset collapses into a **total order**. You use this every day: 1, 2, 3, 4 under the usual ≤ is a total order.',
      '### 6. Cleaning the Spaghetti (Hasse Diagrams)',
      'Because Partial Orders have so many transitive shortcut arrows and reflexive loops naturally mandated, drawing them as a raw Directed Graph creates an absolutely unreadable mess of overlapping spaghetti wires.',
      'To actually read them, mathematicians invented the **Hasse Diagram**. It strips away the reflexive loops (we already know they\'re there), removes every transitively-implied shortcut arrow, and places "larger" elements higher up than smaller ones. What remains is just the covering relations — the direct, non-redundant steps of the hierarchy.',

      `![Hasse diagram of divisibility on {1, 2, 3, 4, 6, 12} — only the direct covering edges are drawn](${hasseDiagramUrl})`,

      'Notice what\'s missing: there\'s no edge from 1 straight to 12, even though 1 divides 12 — that edge is implied by 1→2→4→12 (or any other path upward), so drawing it would be redundant. A Hasse diagram shows exactly the edges you need to reconstruct every other relationship by transitivity, and not one more.',
      'Definition bridge: every equivalence relation determines <span class="tooltip" data-tooltip="An equivalence class [a] is all elements related to a.">equivalence classes</span>, and these classes form a partition of the base set.'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Partition Theorem',
        body: 'Every equivalence relation generates a set partition. Conversely, any partition of a set into chunks defines an equivalence relation (a R b iff a and b are in the same chunk). They are two sides of the same coin.'
      }
    ],
    visualizations: [
      {
        id: 'EquivalenceDecoderLab',
        title: 'The Grammar of Partitions',
        caption: 'Hover over the advanced bracket notation to decode exactly how mathematicians programmatically assign data into class buckets.'
      },
      {
        id: 'ModuloPartitionLab',
        title: 'Equivalence Classes (Splitting the Universe)',
        caption: 'Watch modular arithmetic act as an equivalence relation, slicing the integers into non-overlapping remainder classes.'
      },
      {
        id: 'HasseTransformerLab',
        title: 'Hasse Hierarchy Compiler',
        caption: 'Click the toggle to watch the structural engine strip away all redundant transitive "shortcut" arrows to reveal the elegant, strictly-functional hierarchy.'
      }
    ]
  },

  rigor: {
    title: 'Formal Definitions',
    visualizationId: 'RelationsExplorer',
    proofSteps: [
      {
        expression: 'R \\text{ is reflexive } \\Leftrightarrow \\forall a \\in A\\;(aRa)',
        annotation: 'Every element must relate to itself.'
      },
      {
        expression: 'R \\text{ is symmetric } \\Leftrightarrow \\forall a,b \\in A\\;(aRb \\Rightarrow bRa)',
        annotation: 'If one direction exists, reverse direction must also exist.'
      },
      {
        expression: 'R \\text{ is transitive } \\Leftrightarrow \\forall a,b,c \\in A\\;(aRb \\land bRc \\Rightarrow aRc)',
        annotation: 'Composed two-step paths must imply the direct shortcut.'
      },
      {
        expression: 'R \\text{ is an equivalence relation } \\Leftrightarrow \\text{reflexive} \\land \\text{symmetric} \\land \\text{transitive}',
        annotation: 'This is the exact checklist for equivalence structure.'
      },
      {
        expression: 'R \\text{ is a partial order } \\Leftrightarrow \\text{reflexive} \\land \\text{antisymmetric} \\land \\text{transitive}',
        annotation: 'Replace symmetry by antisymmetry to model hierarchy.'
      }
    ],
    prose: [
      '### 7. Proving and Breaking the Rules',
      'When your Computer Science professor asks you to prove Structural Relations on an exam, you deploy very specific attack angles:',
      '• **Breaking Symmetry:** All you need is ONE single counterexample bullet. If you can physically find just one (a, b) where (b, a) does not exist, the relation structurally collapses and is Not Symmetric.',
      '• **Proving Transitivity:** You cannot just use examples. You must pull three total generic variables. Assume rigidly that a R b and b R c. Then, using aggressive algebraic substitution, manually force the equation to prove that a R c MUST also mathematically be true!',
      '• **Relation Composition (Grandparent Logic):** Just like chaining functions ($g \\circ f$), you can aggressively chain relations via Matrix multiplications! If Relation $R$ is defined as "is the parent of", then chaining it exactly mapped as $R \\circ R$ structurally morphs the query to output "is the Grandparent of!"',
      '• **A Note on Transitivity Vacuous Logic:** Watch out! If there is absolutely no chain to even check in the first place (like if a R b exists, but b points to literally nothing else), the Transitive rule is technically "Vacuously True" because it was never physically violated. (No broken laws = mathematical innocence!).'
    ],
    callouts: [
      {
        type: 'warning',
        title: '⚠️ Empty Relation Matrix Trap',
        body: 'Here is a classic trick question: If the Relation Matrix is 100% physically blank (no arrows at all), is it Symmetric and Transitive?\n\n**YES!** It is vacuously true! Because there are no arrows, it never breaks the rule "if A->B, then..." However, it is definitively **NOT** Reflexive, because Reflexive explicitly demands the presence of the main diagonal loops!'
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-02-ex1',
      title: 'Congruence Mod 3: The Ultimate Equivalence Relation',
      problem: 'On the set of integers, define a relation **a R b** if and only if (a mod 3 = b mod 3). Check it property by property to prove it is an equivalence relation.',
      steps: [
        { expression: '\\text{Reflexivity: } a \\pmod 3 = a \\pmod 3', annotation: 'Every integer always equals itself. Flawlessly True.' },
        { expression: '\\text{Symmetry: If } a \\pmod 3 = b \\pmod 3 \\text{ then } b \\pmod 3 = a \\pmod 3', annotation: 'Basic equality can obviously be completely flipped. Flawlessly True.' },
        { expression: '\\text{Transitive: If } a = b \\text{ and } b = c, \\text{ then } a = c', annotation: 'Because a mod 3 equals b mod 3, AND b equals c... the algebraic transitive chain perfectly links a to c.' }
      ],
      conclusion: 'Because all three holy trinity pillars hold mathematically true, Modulo 3 creates a flawless Equivalence Relation that perfectly slices all integers into 3 distinct disjoint class buckets (Remainders 0, 1, and 2)!'
    },
    {
      id: 'discrete-1-02-ex2',
      title: 'Divisibility is a Hierarchy (Partial Order)',
      problem: 'On positive integers, define a relation **a R b** IF AND ONLY IF (a divides into b cleanly without remainders). Show exactly why this creates a hierarchic Partial Order.',
      steps: [
        { expression: '\\text{Reflexive: } a | a', annotation: 'Because a = a * 1. An integer always cleanly divides itself.' },
        { expression: '\\text{Antisymmetric: If } a | b \\text{ AND } b | a, \\text{ then strictly } a = b', annotation: 'For positive integers, the ONLY way two numbers divide each other cleanly is if they are identically the same number! No mutual loops exist.' },
        { expression: '\\text{Transitive: If } a | b \\text{ AND } b | c, \\text{ then } a | c', annotation: 'If 2 goes into 4, and 4 goes into 8... 2 mathematically skips straight to 8. Transitivity completely holds.' }
      ],
      conclusion: 'Reflexive + Antisymmetric + Transitive proves it is a strict Partial Order (Poset). Notice how 2 and 3 are totally incomparable! Neither divides the other. This accurately simulates parallel independent tasks on an Operating System timeline.'
    },
    {
      id: 'discrete-1-02-ex3',
      title: 'Proof by Contradiction: The "Sister" Trap',
      problem: 'On the set of all human beings, define **a R b** IF AND ONLY IF "a is the sister of b". Prove by contradiction that this relation completely fails to be an Equivalence Relation.',
      steps: [
        { expression: '\\text{Assume Transitivity: If } a \\text{ R } b \\text{ and } b \\text{ R } c, \\text{ then } a \\text{ R } c', annotation: 'Let\'s assume it holds True. If Alice is Bob\'s sister, and Bob is Charlie\'s sister, therefore Alice must be Charlie\'s sister.' },
        { expression: '\\text{The Contradiction}', annotation: 'If Bob is Charlie\'s sister, Bob must be female — but "Bob" is being used here as a male name. The premise contradicts itself.' },
        { expression: '\\text{Symmetry Check: If } a \\text{ R } b \\implies b \\text{ R } a', annotation: 'Try another property. If Alice is Bob\'s sister, must Bob be Alice\'s sister? No — Bob would be her brother.' }
      ],
      conclusion: 'The relation fails both transitivity and symmetry. Breaking just one property is enough to prove it is not an equivalence relation.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-02-ch1',
      difficulty: 'easy',
      problem: 'If I define a logical relationship on a group of high school students where **"Alice R Bob" simply means "Alice is taller than Bob"**. What fundamental property completely prevents this relation from ever being an Equivalence class?',
      hint: 'Run it through the Holy Trinity checklist! Can Alice be strictly taller than herself?',
      walkthrough: [
        { expression: '\\text{Test Reflexivity: } a \\text{ R } a', annotation: 'Is a student explicitly taller than themselves?' },
        { expression: '\\text{False}', annotation: 'It physically fails the Reflexive test immediately.' },
        { expression: '\\text{Test Symmetry: If } a \\text{ R } b \\implies b \\text{ R } a', annotation: 'If Alice is taller than Bob, must Bob be taller than Alice?' },
        { expression: '\\text{False}', annotation: 'It physically fails the Symmetry test.' }
      ],
      answer: 'It instantly fails both Reflexivity (you cannot be taller than yourself) and Symmetry (if you are taller than me, I am shorter than you). It only passes Transitivity!'
    },
    {
      id: 'discrete-1-02-ch2',
      difficulty: 'medium',
      problem: 'Build a relation matrix on the set {1, 2, 3} that is reflexive and symmetric, but fails transitivity.',
      hint: 'Give 1 a link to 2, and 2 a link to 3, but leave out the link from 1 to 3.',
      walkthrough: [
        { expression: '\\text{Include all diagonal loops: } (1,1), (2,2), (3,3)', annotation: 'This immediately secures the Reflexive property threshold.' },
        { expression: '\\text{Include pairs: } (1,2) \\text{ and } (2,1)', annotation: 'This creates a localized symmetric bubble between 1 and 2.' },
        { expression: '\\text{Include pairs: } (2,3) \\text{ and } (3,2)', annotation: 'This creates a secondary symmetric bubble between 2 and 3.' },
        { expression: '\\text{Ensure } (1,3) \\text{ is left out}', annotation: 'The link 1→2 exists, and 2→3 exists, but 1→3 is missing — exactly the gap transitivity forbids.' }
      ],
      answer: 'The matrix pairs are: {(1,1), (2,2), (3,3), (1,2), (2,1), (2,3), (3,2)}. You deliberately sabotaged the transitive architecture.'
    },
    {
      id: 'discrete-1-02-ch3',
      difficulty: 'easy',
      problem: 'Quick Check: Is the relation "a is a sibling of b" Reflexive?',
      hint: 'To be historically reflexive, every single person must map identically back to themselves.',
      walkthrough: [
        { expression: '\\text{Does } a \\text{ R } a \\text{ hold true?}', annotation: 'Are you legally your own sibling?' }
      ],
      answer: 'NO! You are definitively not your own sibling. Since a R a organically fails, the relation is NOT Reflexive.'
    },
    {
      id: 'discrete-1-02-ch4',
      difficulty: 'easy',
      problem: 'Quick Check: A completely blank Relation Matrix (0 total arrows) is mathematically Symmetric. True or False?',
      hint: 'Are there any arrows currently breaking the rule: "if an arrow goes out, it must securely come back"?',
      walkthrough: [
        { expression: '\\text{If } a \\to b, \\text{ then strictly } b \\to a', annotation: 'Since literally zero arrows exist, the rule is mathematically never broken.' }
      ],
      answer: 'True — it is vacuously symmetric. With no arrows present, the rule "if a→b then b→a" is never violated, the same way a traffic law can\'t be broken by a car that was never on the road.'
    },
    {
      id: 'discrete-1-02-ch5',
      difficulty: 'easy',
      problem: 'Quick Check: The Identity Relation Matrix (where ONLY the main diagonal has loops) achieves which grand architectural structure?',
      hint: 'Run it aggressively through all three pillars of the Holy Trinity check.',
      walkthrough: [
        { expression: '\\text{Reflexive: } a \\to a \\text{ exists for all elements.}', annotation: 'Yes, the main diagonal is fully illuminated.' },
        { expression: '\\text{Symmetric: If } a \\to b, \\text{ then } b \\to a', annotation: 'Only a->a exists. It is perfectly symmetrical because there are no outbound arrows to test.' },
        { expression: '\\text{Transitive: If } a \\to b \\text{ and } b \\to c, \\text{ then } a \\to c', annotation: 'Only a->a exists. It formally passes transitively without any breaches.' }
      ],
      answer: 'It passes all three properties. The identity relation is the simplest possible equivalence relation — every element is related only to itself.'
    }
  ],
  semantics: {
    core: [
      { symbol: 'R', meaning: 'Relation — a subset of the Cartesian Product A × B' },
      { symbol: 'a R b', meaning: 'Infix notation — element a is related to element b' },
      { symbol: 'Reflexive', meaning: '∀a, (a, a) ∈ R' },
      { symbol: 'Symmetric', meaning: 'a R b ⇒ b R a' },
      { symbol: 'Transitive', meaning: 'a R b ∧ b R c ⇒ a R c' },
      { symbol: 'Antisymmetric', meaning: 'a R b ∧ b R a ⇒ a = b' },
      { symbol: '[a]', meaning: 'Equivalence Class — set of all elements related to a' },
      { symbol: 'A / R', meaning: 'Quotient Set — the set of all equivalence classes' },
    ],
    rulesOfThumb: [
      'Equivalence Relation = Reflexive + Symmetric + Transitive. It partitions the set.',
      'Partial Order = Reflexive + Antisymmetric + Transitive. It creates a hierarchy (Poset).',
      'Relations are just directed graphs.',
      'A Hasse diagram is a cleaned-up visualization of a partial order (no loops, no transitive shortcuts).',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-02a',
        label: 'Sets and Functions',
        note: 'Relations are the raw combinatorial soil (Cartesian Products) from which Functions are carefully selected.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'graph-theory-intro',
        label: 'Graph Theory',
        note: 'Every relation is a graph. We will study the structural properties of these networks in detail, starting right after this lesson.',
      },
    ],
  },

  mentalModel: [
    'Relations are the "anything goes" version of functions.',
    'Equivalence relations are like "Grouping by property"; Partial orders are like "Prerequisites".',
    'Transitivity is the "Shortcut" rule.',
    'Partitions and equivalence relations are two sides of the same coin.',
  ],

  assessment: {
    questions: [
      {
        id: 'rel-assess-1',
        type: 'choice',
        text: 'Which property is required for an Equivalence Relation but NOT for a Partial Order?',
        options: ['Reflexive', 'Symmetric', 'Transitive', 'Antisymmetric'],
        answer: 'Symmetric',
        hint: 'Partial orders swap Symmetry for Antisymmetry.',
      },
      {
        id: 'rel-assess-2',
        type: 'input',
        text: 'If a relation on {1, 2, 3} contains only (1,1), (2,2), (3,3), is it symmetric?',
        answer: 'Yes',
        hint: 'For symmetry, if (a,b) is there, (b,a) must be there. Since only self-loops exist, it is vacuously symmetric.',
      },
    ],
  },

  quiz: [
    {
      id: 'rel-q1',
      type: 'choice',
      text: 'What is a "partition" of a set?',
      options: ['A collection of overlapping subsets', 'A collection of disjoint subsets whose union is the original set', 'A subset containing only prime numbers', 'The set of all subsets'],
      answer: 'A collection of disjoint subsets whose union is the original set',
      hints: ['Equivalence relations slice a set into these non-overlapping pieces.'],
    },
    {
      id: 'rel-q2',
      type: 'choice',
      text: 'In a Hasse diagram, why do we leave out the loops at each vertex?',
      options: ['To save space', 'Because partial orders are already assumed to be reflexive', 'Because loops are illegal in partial orders', 'Because they are too hard to draw'],
      answer: 'Because partial orders are already assumed to be reflexive',
      hints: ['Hasse diagrams only show the "interesting" essential connections.'],
    },
  ],
}
