import treeTraversalOrdersUrl from '../diagrams/dm-tree-traversal-orders.svg?url'
import expressionTreeUrl from '../diagrams/dm-expression-tree.svg?url'

export default {
  id: 'discrete-1-09',
  slug: 'trees-and-hierarchies',
  chapter: 'discrete-5',
  order: 1,
  title: 'Trees and Hierarchies',
  subtitle: 'Rooted trees, traversals, and why hierarchical structure dominates computer systems',
  tags: ['tree', 'rooted tree', 'binary tree', 'traversal', 'spanning tree'],
  aliases: 'dfs preorder inorder postorder rooted tree binary tree expression tree',

  hook: {
    question:
      'Why do file systems, parser syntax, DOM structure, and many search structures all end up as trees?',
    realWorldContext:
      'Trees are the most useful constrained graph family in computing. They support efficient indexing, parsing, scheduling, and hierarchical representation.',
  },

  intuition: {
    prose: [
      'A tree is a connected acyclic graph — the graph-theory lesson\'s definition, specialized. In a **rooted tree**, one node is designated the root, and every other node gains a well-defined parent (the neighbor one step closer to the root), which is what turns an undirected connectivity structure into a genuine hierarchy.',

      'Tree vocabulary mirrors family vocabulary for a reason — it\'s the same shape: **ancestor** and **descendant** describe the chain up or down from a node, **sibling** describes nodes sharing a parent, a **leaf** is a node with no children (a dead end), **depth** is a node\'s distance from the root, and **height** is the longest depth found anywhere in the tree.',

      `![Preorder, inorder, and postorder traversals of the same binary tree, producing three genuinely different sequences](${treeTraversalOrdersUrl})`,

      'Traversal order is not a cosmetic choice — it determines the actual computation order for interpreters, compilers, and recursive algorithms in general. The diagram above walks the *same* tree three different ways and gets three different sequences: preorder visits a node before its children (useful for copying a tree structure, or printing a prefix expression), postorder visits children before the node (essential when you need every child\'s result *before* you can compute the parent\'s — see the expression tree below), and inorder (binary trees only) visits left child, node, right child — which, for a binary search tree specifically, produces every value in sorted order for free.',

      `![Expression tree for (3 + 4) × 2, with postorder evaluation order shown](${expressionTreeUrl})`,

      'Expression trees make algebra literally executable: each internal node is an operator, each leaf is a value, and evaluating the whole expression is exactly a postorder traversal — you cannot compute a node\'s operator until both of its children\'s values are already known, which is precisely what "children before parent" guarantees. The same tree structure supports symbolic differentiation, too: differentiating a node is a recursive rule applied to its children first, then combined at the node using the product rule, chain rule, or sum rule depending on the operator.',

      'Binary trees (at most 2 children per node) are common because they map cleanly onto yes/no decisions and comparisons, but they are not universal — file systems, org charts, and parse trees for languages with variable-argument function calls all commonly use trees where a node can have any number of children.',
    ],
    visualizations: [
      {
        id: 'TreeTraversalAnimator',
        title: 'Tree Traversal Animator',
        caption: 'Step through pre-order, in-order, post-order, and level-order on the same tree and watch each order actually differ.',
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
      'Rooted trees invite recursive definitions almost automatically: size(T) = 1 + Σ size(child) summed over T\'s immediate children, with size(leaf) = 1 as the base case. This single recursive equation, combined with the fact that a tree has no cycles to worry about (so no subtree ever contains its own ancestor), is what makes every tree algorithm expressible as "handle the base case, recurse on the children, combine the results."',

      'To restate the three traversal orders precisely: **preorder** visits node, then left subtree, then right subtree — the node always comes before its descendants. **Postorder** visits left subtree, then right subtree, then node — the node always comes after its descendants, which is exactly the property expression evaluation needs. **Inorder** (binary trees only) visits left subtree, node, right subtree — and for a binary *search* tree specifically (where every left descendant is smaller and every right descendant is larger than the node), this produces every value in sorted order, with no separate sorting step required.',

      'A **spanning tree** of a graph keeps every vertex reachable using the minimum possible edge count (|V| − 1, matching the tree edge-count identity from the graph theory lesson) — this is directly useful for network design (the cheapest way to keep every node connected) and protocol planning (broadcast/multicast trees that avoid redundant message loops).',
    ],
  },

  rigor: {
    prose: [
      'Tree proofs commonly use **structural induction**, a variant of induction that recurses on the shape of the tree rather than on an integer: prove the claim for a leaf (the base case, since a leaf has no children to depend on), then assume it holds for every child of a node and prove it holds for the node itself using those assumptions (the inductive step) — the "prove every tree has at least two leaves" challenge below is a worked example of exactly this style, via a longest-path argument rather than a direct recursive one.',

      'When proving uniqueness claims — such as "there is exactly one simple path between any two nodes in a tree" — explicitly invoke acyclicity to rule out alternatives: if two distinct paths existed between the same pair of nodes, they would together trace out a cycle (follow one path forward, the other backward), contradicting that the graph is a tree. This is the standard proof pattern anytime a tree-uniqueness claim needs a rigorous justification rather than just an appeal to intuition.',
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
  semantics: {
    core: [
      { symbol: 'Root', meaning: 'The designated top-level node in a tree' },
      { symbol: 'Leaf', meaning: 'A node with no children (degree 1 in unrooted trees)' },
      { symbol: 'Parent / Child', meaning: 'The direct ancestor and descendant in a rooted tree' },
      { symbol: 'Height', meaning: 'The longest path from the root to a leaf' },
      { symbol: 'Preorder', meaning: 'Traversal: Root -> Left -> Right' },
      { symbol: 'Postorder', meaning: 'Traversal: Left -> Right -> Root' },
      { symbol: 'Inorder', meaning: 'Traversal: Left -> Root -> Right (Binary trees only)' },
    ],
    rulesOfThumb: [
      'A tree with n vertices ALWAYS has n-1 edges.',
      'There is exactly one unique path between any two nodes in a tree.',
      'Adding any edge to a tree creates exactly one cycle.',
      'Removing any edge from a tree makes it disconnected.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-08',
        label: 'Graph Theory',
        note: 'Trees are the special case of graphs where connectivity is achieved with the minimum possible number of edges.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-13',
        label: 'Algorithms and Complexity',
        note: 'Balanced trees (like AVL or Red-Black trees) ensure O(log n) performance for search and insertion.',
      },
    ],
  },

  mentalModel: [
    'A tree is a graph that never loops back on itself.',
    'Hierarchies represent nested relationships (e.g., folders, logic, HTML).',
    'Traversals are different ways of reading the "Story" of the tree.',
    'Leaves are the "Dead Ends" of the structure.',
  ],

  assessment: {
    questions: [
      {
        id: 'tree-assess-1',
        type: 'choice',
        text: 'In a rooted tree, what do you call a node with zero children?',
        options: ['Root', 'Parent', 'Leaf', 'Internal Node'],
        answer: 'Leaf',
        hint: 'Leaves are the terminals of the branching structure.',
      },
      {
        id: 'tree-assess-2',
        type: 'input',
        text: 'If a tree has 100 vertices, how many edges does it have?',
        answer: '99',
        hint: '|E| = |V| - 1.',
      },
    ],
  },

  quiz: [
    {
      id: 'tree-q1',
      type: 'choice',
      text: 'Which traversal visits the root first, then the children?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
      answer: 'Preorder',
      hints: ['"Pre" means the root comes before the children.'],
    },
    {
      id: 'tree-q2',
      type: 'choice',
      text: 'What property is guaranteed if you add an edge between two existing nodes in a tree?',
      options: ['It becomes a faster tree', 'A cycle is created', 'A leaf is removed', 'The height increases'],
      answer: 'A cycle is created',
      hints: ['Trees are acyclic. Connecting two existing nodes provides a second path, creating a loop.'],
    },
  ],
}
