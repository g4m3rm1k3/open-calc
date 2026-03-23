export default {
  id: 'discrete-1-09',
  slug: 'trees-and-hierarchies',
  chapter: 'discrete-1',
  order: 11,
  title: 'Trees and Hierarchies',
  subtitle: 'Rooted trees, traversals, and why hierarchical structure dominates computer systems',
  tags: ['tree', 'rooted tree', 'binary tree', 'traversal', 'spanning tree'],
  aliases: 'dfs preorder inorder postorder rooted tree binary tree expression tree',

  hook: {
    question:
      'Why do file systems, parser syntax, DOM structure, and many search structures all end up as trees?',
    realWorldContext:
      'Trees are the most useful constrained graph family in computing. They support efficient indexing, parsing, scheduling, and hierarchical representation.',
    previewVisualizationId: 'GraphNetwork3D',
  },

  intuition: {
    prose: [
      'A tree is a connected acyclic graph. In rooted trees, one node is designated as root and every other node has a parent relation.',
      'Tree language mirrors family language: ancestor, descendant, sibling, leaf, depth, and height.',
      'Traversal order matters because it determines computation order for interpreters, compilers, and many recursive algorithms.',
      'Expression trees make algebra executable: evaluating or differentiating an expression is a traversal problem over a rooted structure.',
      'Binary trees are common but not universal. Many real systems use variable-arity trees.',
    ],
    visualizations: [
      {
        id: 'CountingTreeLab',
        title: 'Branching and Choice Trees',
        caption: 'See how each node in a tree represents a brand new set of choices, leading to geometric growth.',
      },
      {
        id: 'StrongInductionWallLab',
        title: 'Structural Induction Foundation',
        caption: 'Tree proofs often require the combined weight of ALL descendant nodes (Strong Induction) to prove a property holds for the parent.',
      }
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Tree Characterizations',
        body: 'For a finite graph G, any two imply the third: connected and acyclic, connected with |E|=|V|-1, acyclic with |E|=|V|-1.',
      },
    ],
  },

  math: {
    prose: [
      'In rooted trees, recursive definitions are natural: size(T)=1+sum size(children).',
      'Traversals: preorder (node then children), postorder (children then node), inorder (binary-tree specific).',
      'Spanning trees in a graph keep all vertices with minimal edge count and support network design and protocol planning.',
    ],
  },

  rigor: {
    prose: [
      'Tree proofs often use structural induction: prove for leaf, then assume true for children and prove for parent.',
      'When proving uniqueness claims (such as unique simple path in tree), explicitly use acyclicity to rule out alternatives.',
    ],
  },

  examples: [
    {
      id: 'discrete-1-09-ex1',
      title: 'Edge Count in a Rooted Tree',
      problem: 'A rooted tree has 20 vertices. How many edges?',
      steps: [
        { expression: '|E|=|V|-1', annotation: 'Tree invariant.' },
        { expression: '|E|=19', annotation: 'Substitute.' },
      ],
      conclusion: 'Every finite tree with 20 nodes has 19 edges.',
    },
    {
      id: 'discrete-1-09-ex2',
      title: 'Traversal Use Case',
      problem: 'Which traversal naturally evaluates arithmetic expression trees bottom-up?',
      steps: [
        { expression: 'Need children before parent operator', annotation: 'Operands must be known first.' },
        { expression: 'Use postorder traversal', annotation: 'Visit subexpressions first.' },
      ],
      conclusion: 'Postorder supports bottom-up expression evaluation.',
    },
  ],

  challenges: [
    {
      id: 'discrete-1-09-ch1',
      difficulty: 'easy',
      problem: 'Can a tree on 8 vertices have 8 edges?',
      walkthrough: [
        { expression: 'Tree invariant: |E|=|V|-1', annotation: 'Always true for finite trees.' },
        { expression: 'If |V|=8, then |E|=7', annotation: 'Direct substitution.' },
      ],
      answer: 'No. A tree on n vertices has n-1 edges, so 7 edges.',
    },
    {
      id: 'discrete-1-09-ch2',
      difficulty: 'medium',
      problem: 'Prove every tree has at least two leaves when it has at least two vertices.',
      hint: 'Use a longest simple path argument.',
      walkthrough: [
        { expression: 'Take a longest simple path v_1...v_k', annotation: 'This path exists in finite tree.' },
        { expression: 'If v_1 had extra neighbor outside path, path could be extended', annotation: 'Contradicts maximality.' },
        { expression: 'So v_1 and v_k each have degree 1', annotation: 'Both endpoints are leaves.' },
      ],
      answer: 'Endpoints of a longest path must be leaves; otherwise path can be extended.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'graph-theory', label: 'Graph Theory', context: 'Trees are a key special case with stronger invariants.' },
    { lessonSlug: 'induction-and-recursion', label: 'Induction and Recursion', context: 'Structural induction is native to tree proofs.' },
    { lessonSlug: 'algorithms-and-complexity', label: 'Algorithms and Complexity', context: 'Tree traversals and balanced trees are central algorithmic patterns.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}
