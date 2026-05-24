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
      '**Abstract vector spaces in engineering.** The solution set of any homogeneous linear ODE $y\'\' + p(t)y\' + q(t)y = 0$ is a vector space (of functions!) — you can add solutions and scale them. In CNC motion control, the set of all possible velocity profiles satisfying $v(0) = v(T) = 0$ (zero start/end speed) forms a function space; finding the "smoothest" profile is a minimization in that space. The set of all $3\\times 3$ rotation matrices is NOT a vector space (you can\'t add two rotations and get a rotation), but the space of antisymmetric matrices $\\mathfrak{so}(3)$ (the Lie algebra) is — it is the tangent space to rotations at the identity, directly relevant to CNC axis interpolation and robot kinematics.',
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
      {
        type: 'insight',
        title: 'Dimension of Concrete Spaces',
        body: '$\\dim(\\mathbb{R}^n) = n$\n$\\dim(P_n) = n + 1$ (basis: $1, x, x^2, \\ldots, x^n$)\n$\\dim(M_{m\\times n}) = mn$ (basis: $n \\cdot m$ elementary matrices $E_{ij}$)\n$\\dim(C[a,b]) = \\infty$ (no finite basis)\nIsomorphic spaces have the same dimension — they are algebraically identical.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Subspace Tests and Polynomial Spaces',
        mathBridge: 'Verify subspace conditions computationally, explore polynomial vector spaces, and see solutions to homogeneous ODEs as a vector space.',
        caption: 'Any structure satisfying the 10 axioms is a vector space — the axioms are everything.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np

# Subspace test: W = {(x,y,z) : x + 2y - z = 0} in R^3
# This is the null space of [1, 2, -1], so it IS a subspace

def in_W(v):
    return abs(v[0] + 2*v[1] - v[2]) < 1e-10

# Check 1: zero vector
print("Check 1 - zero in W:", in_W([0, 0, 0]))

# Check 2: closure under addition
u = np.array([1., 0., 1.])   # 1+0-1=0 ✓
v = np.array([2., 1., 4.])   # 2+2-4=0 ✓
print("u in W:", in_W(u))
print("v in W:", in_W(v))
print("u+v in W:", in_W(u + v))

# Check 3: closure under scalar multiplication
print("7*u in W:", in_W(7*u))

print()
print("All checks passed: W is a subspace (the null space of [1, 2, -1])")
print()

# Non-example: W2 = {(x,y,z) : x + y = 1} — NOT a subspace
def in_W2(v):
    return abs(v[0] + v[1] - 1) < 1e-10

p = np.array([0.5, 0.5, 3.])
q = np.array([0.3, 0.7, 1.])
print("Non-example: W2 = {x+y=1}")
print("p in W2:", in_W2(p))
print("p+q in W2:", in_W2(p + q), " <- FAILS (sum has x+y=1.6, not 1)")
print("Not a subspace: doesn't contain zero vector and not closed under addition")
`,
            },
            {
              id: 2,
              cell_type: 'code',
              source: `import numpy as np
from numpy.polynomial import polynomial as P

# Polynomials as vectors: P_2 is isomorphic to R^3
# Represent p(x) = a0 + a1*x + a2*x^2 as coefficient array [a0, a1, a2]

p = np.array([1., 2., 3.])   # p(x) = 1 + 2x + 3x^2
q = np.array([4., 0., -1.])  # q(x) = 4 - x^2

# Vector space operations on polynomials
print("p + q =", p + q, "  means: (1+4) + (2+0)x + (3-1)x^2 =", P.Polynomial(p+q))
print("3*p =",   3*p,    "  means: 3 + 6x + 9x^2")
print("zero polynomial:", np.zeros(3))

# Verify span: do {1+x, 1-x} span P_1?
# We need to solve [1,1; 1,-1] @ [c1;c2] = [a0;a1] for any a0,a1
A = np.array([[1., 1.], [1., -1.]])
print()
print("Spanning test for {1+x, 1-x} in P_1:")
for target in [[2., 4.], [3., -1.], [0., 5.]]:
    coeffs = np.linalg.solve(A, target)
    print(f"  {target[0]} + {target[1]}x = {coeffs[0]:.2f}(1+x) + {coeffs[1]:.2f}(1-x)")

print("=> {1+x, 1-x} spans P_1 ✓")
`,
            },
            {
              id: 3,
              cell_type: 'code',
              source: `import numpy as np
from scipy.integrate import odeint

# ODE solution space: y'' + y = 0 has solutions {sin(t), cos(t)} as basis
# The solution space is a 2-dimensional vector space

t = np.linspace(0, 2*np.pi, 200)

def ode(y, t):
    return [y[1], -y[0]]   # y'' = -y

# Three solutions with different initial conditions
y1 = odeint(ode, [0., 1.], t)[:, 0]   # sin(t): y(0)=0, y'(0)=1
y2 = odeint(ode, [1., 0.], t)[:, 0]   # cos(t): y(0)=1, y'(0)=0
y3 = odeint(ode, [2., 3.], t)[:, 0]   # 2cos+3sin: y(0)=2, y'(0)=3

# Verify y3 = 2*y2 + 3*y1 (linear combination of basis solutions)
combo = 2*y2 + 3*y1
print("Solution space of y'' + y = 0:")
print(f"Max error |y3 - (2*cos + 3*sin)|: {np.max(np.abs(y3 - combo)):.2e}")
print()
print("=> y3 is exactly a linear combination of y1 and y2")
print("=> The solution space is a 2D vector space spanned by {sin, cos}")
print()
print("General solution: y(t) = c1*cos(t) + c2*sin(t)")
print("  c1 = y(0), c2 = y'(0)")
print("  (Each choice of c1,c2 gives a DIFFERENT solution — 2D space)")
`,
            },
          ],
        },
      },
    ],
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
      steps: [
        {
          expression: 'A = \\mathbf{0} \\in W? \\quad \\mathbf{0}^\\top = \\mathbf{0} \\checkmark',
          annotation: 'The zero matrix is symmetric.',
          strategyTitle: 'Check condition 1: zero vector',
        },
        {
          expression: 'A, B \\in W \\Rightarrow (A+B)^\\top = A^\\top + B^\\top = A + B \\Rightarrow A+B \\in W \\checkmark',
          annotation: 'Transpose is linear: $(A+B)^\\top = A^\\top + B^\\top$. The sum of symmetric matrices is symmetric.',
          strategyTitle: 'Check condition 2: closed under addition',
        },
        {
          expression: 'A \\in W, c \\in \\mathbb{R} \\Rightarrow (cA)^\\top = cA^\\top = cA \\Rightarrow cA \\in W \\checkmark',
          annotation: 'Scaling a symmetric matrix preserves symmetry.',
          strategyTitle: 'Check condition 3: closed under scalar mult.',
        },
        {
          expression: 'W \\text{ is a subspace of } M_{2\\times 2}, \\quad \\dim(W) = 3',
          annotation: 'Basis for $W$: $\\{\\begin{bmatrix}1&0\\\\0&0\\end{bmatrix}, \\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}, \\begin{bmatrix}0&0\\\\0&1\\end{bmatrix}\\}$ — three parameters for the three free entries of a symmetric matrix.',
          strategyTitle: 'Conclude and find dimension',
        },
      ],
    },
    {
      id: 'ex-la6-001-2',
      title: 'Span of polynomials',
      problem: 'Show that $\\{1 + x, 1 - x\\}$ spans all polynomials of degree $\\leq 1$.',
      steps: [
        {
          expression: 'a + bx = c_1(1+x) + c_2(1-x) = (c_1+c_2) + (c_1-c_2)x',
          annotation: 'We need to solve: $c_1 + c_2 = a$ and $c_1 - c_2 = b$.',
          strategyTitle: 'Set up the spanning condition',
        },
        {
          expression: 'c_1 = \\frac{a+b}{2}, \\quad c_2 = \\frac{a-b}{2}',
          annotation: 'Unique solution for any $a, b \\in \\mathbb{R}$ — the system always has a solution.',
          strategyTitle: 'Solve for coefficients',
        },
        {
          expression: 'a + bx = \\frac{a+b}{2}(1+x) + \\frac{a-b}{2}(1-x) \\quad \\text{for all } a, b',
          annotation: 'Every polynomial in $P_1$ is a linear combination of $\\{1+x, 1-x\\}$, so they span $P_1$. Since there are 2 vectors and $\\dim(P_1) = 2$, they are also a basis.',
          strategyTitle: 'Conclude: spans $P_1$',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la6-001-1',
      title: 'Non-example of a vector space',
      difficulty: 'easy',
      problem: 'Let $V = \\mathbb{R}^2$ with addition defined by $(x_1, y_1) \\oplus (x_2, y_2) = (x_1 x_2, y_1 y_2)$ (coordinatewise multiplication) and standard scalar multiplication. Is this a vector space? If not, which axiom fails?',
      hint: 'Try to find the zero vector first: what $(0_x, 0_y)$ satisfies $(x,y) \\oplus (0_x, 0_y) = (x,y)$ for all $(x,y)$?',
      walkthrough: [
        '**Find the proposed zero vector:** $(x,y) \\oplus (0_x, 0_y) = (x \\cdot 0_x, y \\cdot 0_y) = (x, y)$ requires $0_x = 1, 0_y = 1$. So the "zero vector" would be $(1, 1)$.',
        '**Test scalar multiplication:** Axiom 8 says $(c+d)\\mathbf{v} = c\\mathbf{v} + d\\mathbf{v}$. But here scalar multiplication means $c \\cdot (x,y) = (cx, cy)$ (standard). So $(0+0)(x,y) = 0 \\cdot (x,y) = (0,0)$, but $0(x,y) \\oplus 0(x,y) = (0,0) \\oplus (0,0) = (0 \\cdot 0, 0 \\cdot 0) = (0,0)$. That checks out...',
        '**Find the real failure:** Axiom 5 (additive inverse): need $\\mathbf{v} \\oplus (-\\mathbf{v}) = (1,1)$. So $(x,y) \\oplus (-x,-y) = (-x^2, -y^2) \\neq (1,1)$ unless $x = \\pm i$. The additive inverse of $(x,y)$ would need to be $(1/x, 1/y)$, which fails when $x = 0$ or $y = 0$.',
        '**Conclusion:** Not a vector space — additive inverses fail for any vector with a zero component. Also, with $(0,0)$ present in $\\mathbb{R}^2$ but no valid zero vector $(1,1) \\notin \\{(x,y) : x = 0 \\text{ or } y = 0\\}$, the closure fails immediately.',
      ],
    },
    {
      id: 'ch-la6-001-2',
      title: 'Solution space dimension',
      difficulty: 'medium',
      problem: 'The set of solutions to $y\'\'\' - y\' = 0$ forms a vector space. What is its dimension, and find a basis.',
      hint: 'Try solutions of the form $y = e^{rt}$. The characteristic equation $r^3 - r = 0$ factors as $r(r-1)(r+1) = 0$.',
      walkthrough: [
        '**Characteristic equation:** Substitute $y = e^{rt}$ → $r^3 e^{rt} - r e^{rt} = 0$ → $r(r^2-1) = 0$ → $r = 0, 1, -1$.',
        '**Three independent solutions:** $y_1 = 1$ (from $r=0$), $y_2 = e^t$ (from $r=1$), $y_3 = e^{-t}$ (from $r=-1$).',
        '**Independence:** The Wronskian determinant at $t=0$ is non-zero: $\\det[y_i^{(j-1)}(0)] = \\det\\begin{bmatrix}1&1&1\\\\0&1&-1\\\\0&1&1\\end{bmatrix} = 2 \\neq 0$.',
        '**Conclusion:** $\\dim = 3$. Basis: $\\{1, e^t, e^{-t}\\}$. General solution: $y = c_1 + c_2 e^t + c_3 e^{-t}$ for arbitrary $c_1, c_2, c_3 \\in \\mathbb{R}$.',
      ],
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

  assessment: {
    questions: [
      {
        id: 'assess-la6-001-1',
        type: 'proof',
        text: 'Prove that $W = \\{p \\in P_3 : p(1) = 0\\}$ (polynomials of degree $\\leq 3$ with root at $x=1$) is a subspace of $P_3$. Then find a basis for $W$ and state its dimension.',
        answer: '(1) Zero poly: $p(x) = 0$ satisfies $p(1) = 0$ ✓. (2) Closure under addition: if $p(1) = q(1) = 0$, then $(p+q)(1) = p(1)+q(1) = 0$ ✓. (3) Closure under scalar mult: $(cp)(1) = c \\cdot p(1) = 0$ ✓. Basis: $\\{x-1, x^2-1, x^3-1\\}$ (each vanishes at 1, and any degree-$\\leq 3$ polynomial with root at 1 is a combination). $\\dim(W) = 3$.',
        hint: 'For the basis, note that $\\{(x-1), (x-1)x, (x-1)x^2\\}$ also works — factor out $(x-1)$ from the general form.',
      },
      {
        id: 'assess-la6-001-2',
        type: 'computation',
        text: 'Is the set $S = \\{(x,y,z) : x^2 + y^2 = z^2\\}$ a subspace of $\\mathbb{R}^3$? Check each of the three subspace conditions.',
        answer: '$S$ is NOT a subspace. (1) Zero vector $(0,0,0)$: $0^2 + 0^2 = 0 = 0^2$ ✓. (2) Closure under addition FAILS: $(1,0,1) \\in S$ (since $1+0=1$) and $(0,1,1) \\in S$ (since $0+1=1$), but $(1,1,2) \\in S?$ checks $1+1=4$ — NO, $2 \\neq 4$. So $S$ is not closed under addition. The constraint $x^2+y^2=z^2$ is non-linear, so $S$ is not a subspace.',
        hint: 'The key test is whether the constraint is a linear equation. Quadratic constraints cannot define subspaces (except for degenerate cases like the zero vector only).',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la6-001-1',
      type: 'choice',
      text: 'Which of the following is a vector space with standard operations?',
      options: [
        '$\\{(x,y): x+y=1\\}$ in $\\mathbb{R}^2$',
        'Polynomials of degree exactly 3 (not ≤ 3)',
        'All $2\\times 2$ real matrices',
        'The positive real numbers $\\mathbb{R}_{>0}$',
      ],
      answer: 'All $2\\times 2$ real matrices',
      hints: ['The set $x+y=1$ does not contain the zero vector. Degree exactly 3 is not closed under addition (two degree-3 polys can sum to degree 2). Positive reals fail: $(-1) \\cdot 2 = -2 \\notin \\mathbb{R}_{>0}$. Only $M_{2\\times2}$ satisfies all axioms.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-001-2',
      type: 'choice',
      text: 'The three conditions for $W$ to be a subspace of $V$ are:',
      options: [
        'Linear independence, span, and orthogonality',
        'Contains zero, closed under addition, closed under scalar multiplication',
        'Rank equals dimension, nullity is zero, determinant is non-zero',
        'Commutativity, associativity, and distributivity hold',
      ],
      answer: 'Contains zero, closed under addition, closed under scalar multiplication',
      hints: ['The three-condition test is sufficient because the other axioms are inherited from $V$. Equivalently: $W$ is non-empty and closed under all linear combinations (which combines conditions 2 and 3).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-001-3',
      type: 'choice',
      text: '$P_3$ (polynomials of degree $\\leq 3$) is isomorphic to:',
      options: ['$\\mathbb{R}^3$', '$\\mathbb{R}^4$', '$M_{2\\times 2}$', '$\\mathbb{R}^{3\\times 3}$'],
      answer: '$\\mathbb{R}^4$',
      hints: ['$\\dim(P_3) = 4$ since the standard basis is $\\{1, x, x^2, x^3\\}$. Two vector spaces are isomorphic iff they have the same dimension. $\\dim(\\mathbb{R}^4) = 4$. Note: $M_{2\\times 2}$ also has dimension 4, so $P_3 \\cong M_{2\\times 2}$ is also true!'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-001-4',
      type: 'choice',
      text: 'The set of solutions to the homogeneous ODE $y\'\' + 4y = 0$ is a vector space. What is its dimension?',
      options: ['1', '2', '4', 'Infinite'],
      answer: '2',
      hints: ['The characteristic equation $r^2 + 4 = 0$ has two roots $r = \\pm 2i$, giving solutions $\\{\\cos(2t), \\sin(2t)\\}$. A 2nd-order linear homogeneous ODE always has a 2-dimensional solution space — one dimension per order.'],
      reviewSection: 'intuition',
    },
  ],
};
