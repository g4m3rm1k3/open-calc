export default {
  id: 'la6-001',
  slug: 'abstract-vector-spaces',
  chapter: 'la6',
  order: 1,
  title: 'Abstract Vector Spaces',
  subtitle: 'Vectors are not arrows in space — they are any objects that obey the ten axioms of addition and scalar multiplication. Polynomials, functions, and matrices are all vectors.',
  tags: ['vector space', 'axioms', 'abstract algebra', 'subspace', 'span', 'linear independence', 'polynomial space', 'function space'],
  aliases: 'abstract vector space axioms linear algebra subspace span linear independence polynomial function matrix space',

  hook: {
    question: "You already know how to add vectors in $\\mathbb{R}^n$ and multiply by scalars. But can you add polynomials? Functions? What is it that makes $\\mathbb{R}^n$ a 'vector space' — and do those other things qualify too?",
    realWorldContext: "Abstract vector spaces let you apply all of linear algebra — independence, span, basis, dimension, linear transformations — to any mathematical objects, not just $\\mathbb{R}^n$ arrows. In signal processing, the space of bandlimited functions is a vector space; filters are linear maps. In machine learning, function spaces are vector spaces; regularization is a norm constraint. In differential equations, the set of solutions to a linear ODE is a vector space; its dimension equals the order of the equation. Abstracting away from coordinates reveals structure that would be invisible if you stayed glued to $\\mathbb{R}^n$.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The ten axioms.** A vector space $V$ over a field $\\mathbb{F}$ is a set with two operations — vector addition and scalar multiplication — satisfying ten properties: closure under addition and scalar multiplication, commutativity and associativity of addition, existence of a zero vector, existence of additive inverses, and the four scalar multiplication rules. These ten properties are exactly what you need to do linear algebra.',
      '**Why the axioms matter.** The axioms say nothing about what vectors "look like." They only specify how vectors behave under the two operations. Anything that satisfies all ten axioms is a vector space, and every theorem proved from those axioms applies automatically. This is the power of abstraction: prove once, apply everywhere.',
      '**Key examples.** $\\mathbb{R}^n$ (columns of $n$ real numbers) — the prototype. $P_n$ (polynomials of degree $\\leq n$) — with $(p+q)(x) = p(x) + q(x)$ and $(cp)(x) = c \\cdot p(x)$. $M_{m \\times n}$ (all $m \\times n$ matrices) — with entry-wise addition and scalar multiplication. $C[a,b]$ (continuous functions on $[a,b]$) — with pointwise operations. All are vector spaces.',
      '**Subspaces.** A subset $W \\subseteq V$ is a subspace if (1) $\\mathbf{0} \\in W$, (2) closed under addition, and (3) closed under scalar multiplication. The three-condition check is all you need — the other axioms are inherited from $V$. Examples: any line through the origin in $\\mathbb{R}^2$; the set of polynomials with zero constant term; the set of all solutions to a homogeneous linear ODE.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Ten Axioms (Compressed)',
        body: 'For all $\\mathbf{u}, \\mathbf{v}, \\mathbf{w} \\in V$ and scalars $c, d \\in \\mathbb{F}$:\n1. $\\mathbf{u} + \\mathbf{v} \\in V$ (closure under addition)\n2. $\\mathbf{u} + \\mathbf{v} = \\mathbf{v} + \\mathbf{u}$ (commutativity)\n3. $(\\mathbf{u} + \\mathbf{v}) + \\mathbf{w} = \\mathbf{u} + (\\mathbf{v} + \\mathbf{w})$ (associativity)\n4. $\\exists \\mathbf{0}$: $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$ (zero vector)\n5. $\\exists (-\\mathbf{v})$: $\\mathbf{v} + (-\\mathbf{v}) = \\mathbf{0}$ (negatives)\n6. $c\\mathbf{v} \\in V$ (closure under scalar mult.)\n7. $c(\\mathbf{u}+\\mathbf{v}) = c\\mathbf{u} + c\\mathbf{v}$\n8. $(c+d)\\mathbf{v} = c\\mathbf{v} + d\\mathbf{v}$\n9. $c(d\\mathbf{v}) = (cd)\\mathbf{v}$\n10. $1 \\cdot \\mathbf{v} = \\mathbf{v}$',
      },
      {
        type: 'insight',
        title: 'Subspace Test (Three Conditions)',
        body: '$W$ is a subspace of $V$ iff:\n1. $\\mathbf{0} \\in W$\n2. $\\mathbf{u}, \\mathbf{v} \\in W \\Rightarrow \\mathbf{u} + \\mathbf{v} \\in W$\n3. $\\mathbf{v} \\in W, c \\in \\mathbb{F} \\Rightarrow c\\mathbf{v} \\in W$\n\nEquivalently: $W$ is closed under all linear combinations.',
      },
      {
        type: 'warning',
        title: 'Not Everything Is a Vector Space',
        body: 'The set $\\{(x,y) : x \\geq 0, y \\geq 0\\}$ (first quadrant) is NOT a vector space — it fails closure under scalar multiplication (multiplying by $-1$ leaves the quadrant). A vector space must contain $\\mathbf{0}$ and be closed under all linear combinations, including those with negative and non-integer scalars.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Subspace Tests',
        mathBridge: 'Verify the three subspace conditions for sets defined by linear constraints.',
        caption: 'Any set closed under linear combinations is a subspace.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Checking the subspace conditions',
              prose: ['Is W = {(x,y,z) : x + y + z = 0} a subspace of R^3?'],
              code: `% Check 1: Does zero vector satisfy x+y+z=0?
zero_vec = [0; 0; 0];
disp('Zero vector in W? (0+0+0=0):')
sum(zero_vec) == 0

% Check 2: Closed under addition?
u = [1; -1; 0];  % 1-1+0=0 ok
v = [2;  0; -2]; % 2+0-2=0 ok
w = u + v
disp('u+v in W? (sum of entries = 0):')
sum(w) == 0

% Check 3: Closed under scalar mult?
c = 7;
cu = c * u
disp('7*u in W?:')
sum(cu) == 0

disp('Yes, W is a subspace — it is the null space of [1 1 1]!')
rref([1 1 1])
`,
            },
            {
              id: 2,
              cellTitle: 'Polynomial addition: P2 is a vector space',
              prose: ['Represent polynomials as coefficient vectors and verify closure.'],
              code: `% p(x) = 1 + 2x + 3x^2  represented as [1, 2, 3]
% q(x) = 4 + 0x - x^2   represented as [4, 0, -1]
p = [1; 2; 3]
q = [4; 0; -1]

% Addition: (p+q)(x) coefficients
p_plus_q = p + q

% Scalar mult: (5p)(x) coefficients
five_p = 5 * p

% Zero polynomial
zero_poly = [0; 0; 0]

disp('P_2 with these operations satisfies all 10 axioms')
disp('It is isomorphic to R^3')
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Uniqueness of the zero vector.** Suppose $\\mathbf{0}$ and $\\mathbf{0}\'$ are both zero vectors. Then $\\mathbf{0} = \\mathbf{0} + \\mathbf{0}\' = \\mathbf{0}\'$. Every theorem about the zero vector in $\\mathbb{R}^n$ has the same proof here. Abstraction does not change the arguments — it makes them apply universally.',
      '**Span and independence in abstract spaces.** The span of vectors $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ in any vector space $V$ is $\\text{Span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\} = \\{c_1 \\mathbf{v}_1 + \\cdots + c_k \\mathbf{v}_k : c_i \\in \\mathbb{F}\\}$. Linear independence, basis, and dimension are defined identically. The only difference from $\\mathbb{R}^n$ is that the vectors are not lists of numbers — but all the algebraic arguments are identical.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Span Is Always a Subspace',
        body: 'The span of any set of vectors in $V$ is a subspace of $V$. Proof: $\\mathbf{0} = 0\\mathbf{v}_1 + \\cdots + 0\\mathbf{v}_k \\in $ Span; and any linear combination of elements of Span is itself a linear combination of $\\mathbf{v}_i$ (combine coefficients).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Fields and scalars.** A vector space is defined over a field $\\mathbb{F}$. Common fields: $\\mathbb{R}$ (real numbers), $\\mathbb{Q}$ (rationals), $\\mathbb{C}$ (complex numbers), $\\mathbb{F}_2 = \\{0,1\\}$ (binary field). Linear algebra over $\\mathbb{F}_2$ is used in coding theory and cryptography. The choice of field affects everything: $\\mathbb{R}^n$ over $\\mathbb{R}$ has dimension $n$; the same set of $n$-tuples over $\\mathbb{Q}$ is a completely different vector space.',
      '**Modules.** When scalars come from a ring instead of a field (e.g., integers $\\mathbb{Z}$), the structure is called a **module**. Abelian groups, lattices, and free modules generalize vector spaces. The theory is richer and more complex — not every module has a basis.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Isomorphism: Same Structure, Different Labels',
        body: 'Two vector spaces are isomorphic iff they have the same dimension. $P_n \\cong \\mathbb{R}^{n+1}$, $M_{m \\times n} \\cong \\mathbb{R}^{mn}$. Isomorphic spaces are "the same" for purposes of linear algebra — any basis identification gives an isomorphism.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la6-001-1',
      title: 'Is the set of $2 \\times 2$ symmetric matrices a subspace?',
      problem: 'Is $W = \\{A \\in M_{2\\times 2} : A = A^\\top\\}$ a subspace of $M_{2\\times 2}$?',
      solution: '(1) $0 = 0^\\top$. ✓ (2) If $A = A^\\top$ and $B = B^\\top$: $(A+B)^\\top = A^\\top + B^\\top = A + B$. ✓ (3) $(cA)^\\top = cA^\\top = cA$. ✓. Yes, $W$ is a subspace (dimension 3).',
    },
    {
      id: 'ex-la6-001-2',
      title: 'Span of polynomials',
      problem: 'Show that $1 + x$ and $1 - x$ span all polynomials of degree $\\leq 1$.',
      solution: '$a + bx = \\frac{a+b}{2}(1+x) + \\frac{a-b}{2}(1-x)$. Any linear polynomial is a linear combination of $1+x$ and $1-x$, so they span $P_1$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la6-001-1',
      title: 'Non-example of a vector space',
      difficulty: 'easy',
      prompt: 'Let $V = \\mathbb{R}^2$ with addition defined by $(x_1, y_1) \\oplus (x_2, y_2) = (x_1 x_2, y_1 y_2)$ and standard scalar multiplication. Is this a vector space? If not, which axiom fails?',
      hint: 'Try to find the zero vector, and check if negatives exist.',
      solution: 'The "zero vector" would need $(x,y) \\oplus \\mathbf{0} = (x,y)$, which requires $x \\cdot 0_x = x$, so $0_x = 1$. But then scalars: $0 \\cdot (x,y) = (x^0, y^0) = (1,1) \\neq (0_x, 0_y)$. Axiom 8 fails. Not a vector space.',
    },
  ],

  mentalModel: [
    'A vector space is ANY set with addition and scalar multiplication satisfying the 10 axioms.',
    'Examples: $\\mathbb{R}^n$, polynomial spaces $P_n$, matrix spaces $M_{m\\times n}$, function spaces $C[a,b]$.',
    'Subspace test: just check zero vector, closed addition, closed scalar mult.',
    'All linear algebra (independence, span, basis, dimension, linear maps) works identically in any vector space.',
  ],

  checkpoints: [
    { id: 'cp-la6-001-1', question: 'Name two vector spaces that are NOT $\\mathbb{R}^n$ for any $n$.', answer: '$P_n$ (polynomials of degree ≤ n), $C[a,b]$ (continuous functions), $M_{m\\times n}$ (matrices), etc.' },
    { id: 'cp-la6-001-2', question: 'What are the three conditions for a subspace?', answer: 'Contains zero, closed under addition, closed under scalar multiplication.' },
    { id: 'cp-la6-001-3', question: 'Is the span of any set of vectors always a subspace?', answer: 'Yes — it is the smallest subspace containing those vectors.' },
  ],

  assessment: 'Verify that $M_{2\\times 2}$ (all $2\\times 2$ real matrices) with standard matrix addition and scalar multiplication is a vector space by checking all ten axioms.',

  quiz: [
    { id: 'q-la6-001-1', question: 'Which of the following is a vector space?', options: ['$\\{(x,y): x+y=1\\}$ with standard operations', 'The set of polynomials of degree exactly 3', 'The set of all $2\\times 2$ matrices', 'The positive reals with standard addition'], answer: 'The set of all $2\\times 2$ matrices' },
    { id: 'q-la6-001-2', question: 'The three-condition subspace test checks:', options: ['linear independence, span, orthogonality', 'zero vector, closed addition, closed scalar mult.', 'rank, nullity, determinant', 'commutativity, associativity, distributivity'], answer: 'zero vector, closed addition, closed scalar mult.' },
    { id: 'q-la6-001-3', question: '$P_3$ (polynomials of degree ≤ 3) is isomorphic to:', options: ['$\\mathbb{R}^3$', '$\\mathbb{R}^4$', '$M_{2\\times 2}$', '$\\mathbb{R}^{3\\times 3}$'], answer: '$\\mathbb{R}^4$' },
  ],
};
