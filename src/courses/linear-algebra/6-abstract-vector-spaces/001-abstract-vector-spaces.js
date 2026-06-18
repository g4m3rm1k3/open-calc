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
  },

  intuition: {
    prose: [
      'Take the polynomials $p(x) = 1 + 2x$ and $q(x) = 3 - x$ in $P_1$ (degree $\\leq 1$). Add them: $(p+q)(x) = 4 + x$. Scale: $(5p)(x) = 5 + 10x$. Negate: $(-p)(x) = -1 - 2x$, so $p + (-p) = 0$. The zero polynomial $0(x) = 0$ acts as the additive identity. These operations feel exactly like $\\mathbb{R}^2$ — and that is not a coincidence: $P_1$ and $\\mathbb{R}^2$ satisfy the same ten rules, making them both vector spaces. Now try $W_1 = \\{(x,y) : x + y = 0\\}$ vs. $W_2 = \\{(x,y) : x + y = 1\\}$: check closure under addition for $W_2$: $(1,0) + (0,1) = (1,1)$ — but $1 + 1 = 2 \\neq 1$, so $W_2$ is closed under NOTHING. $W_1$ works (closed under all linear combinations). The homogeneous constraint defines a subspace; the inhomogeneous does not.',
      '**Why the axioms matter.** The axioms say nothing about what vectors "look like." They only specify how vectors behave under the two operations. Anything that satisfies all ten axioms is a vector space, and every theorem proved from those axioms applies automatically. This is the power of abstraction: prove once, apply everywhere.',
      '**Key examples.** $\\mathbb{R}^n$ (columns of $n$ real numbers) — the prototype. $P_n$ (polynomials of degree $\\leq n$) — with $(p+q)(x) = p(x) + q(x)$ and $(cp)(x) = c \\cdot p(x)$. $M_{m \\times n}$ (all $m \\times n$ matrices) — with entry-wise addition and scalar multiplication. $C[a,b]$ (continuous functions on $[a,b]$) — with pointwise operations. All are vector spaces.',
      '**Subspaces.** A subset $W \\subseteq V$ is a subspace if (1) $\\mathbf{0} \\in W$, (2) closed under addition, and (3) closed under scalar multiplication. The three-condition check is all you need — the other axioms are inherited from $V$. Examples: any line through the origin in $\\mathbb{R}^2$; the set of polynomials with zero constant term; the set of all solutions to a homogeneous linear ODE.',
      '**The zero vector is unique.** The axioms guarantee that every vector space has exactly one zero vector. Proof: suppose $\\mathbf{0}$ and $\\mathbf{0}\'$ are both zero vectors. Then $\\mathbf{0} = \\mathbf{0} + \\mathbf{0}\' = \\mathbf{0}\'$ (using axioms 4 on each). Similarly, every vector has a unique additive inverse. This means you cannot have "multiple zeros" — if you find yourself computing with a set that has two different zero-like objects, it is not a vector space. This uniqueness property is why the zero polynomial $0(x)=0$, the zero matrix $\\mathbf{0}$, and the zero function $f(x)=0$ are each the unique zero of their respective spaces.',
      '**Why not every set with addition and scaling is a vector space.** Consider the positive reals $\\mathbb{R}_{>0}$ with "addition" $a \\oplus b = ab$ (multiplication) and "scalar multiplication" $c \\otimes a = a^c$. Check: associativity $(a \\oplus b) \\oplus c = (ab)c = a(bc) = a \\oplus (b \\oplus c)$ ✓. Zero element: $1$ (since $a \\oplus 1 = a \\cdot 1 = a$) ✓. Inverse: $a \\oplus a^{-1} = a \\cdot a^{-1} = 1$ ✓. Scalar mult: $c \\otimes a = a^c$ with $(c+d) \\otimes a = a^{c+d} = a^c \\cdot a^d = (c \\otimes a) \\oplus (d \\otimes a)$ ✓. This actually IS a vector space — just with unusual-looking operations. The point: what matters is the algebraic structure (the axioms), not the visual appearance of the objects.',
      '**Abstract vector spaces in engineering.** The solution set of any homogeneous linear ODE $y\'\' + p(t)y\' + q(t)y = 0$ is a vector space (of functions!) — you can add solutions and scale them. In CNC motion control, the set of all possible velocity profiles satisfying $v(0) = v(T) = 0$ (zero start/end speed) forms a function space; finding the "smoothest" profile is a minimization in that space. The set of all $3\\times 3$ rotation matrices is NOT a vector space (you can\'t add two rotations and get a rotation), but the space of antisymmetric matrices $\\mathfrak{so}(3)$ (the Lie algebra) is — it is the tangent space to rotations at the identity, directly relevant to CNC axis interpolation and robot kinematics.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Test Whether a Subset Is a Subspace (3 Steps)',
        body: '**Given:** A subset $W$ of a known vector space $V$.\n**Step 1.** Check $\\mathbf{0} \\in W$: substitute the zero vector and verify it satisfies the defining condition. If it fails, stop — $W$ is not a subspace.\n**Step 2.** Check closure under addition: take two arbitrary elements $\\mathbf{u}, \\mathbf{v} \\in W$ and verify $\\mathbf{u} + \\mathbf{v} \\in W$.\n**Step 3.** Check closure under scalar multiplication: take arbitrary $\\mathbf{v} \\in W$ and $c \\in \\mathbb{F}$, verify $c\\mathbf{v} \\in W$.\n**Result:** All three pass → $W$ is a subspace (the remaining 7 axioms are inherited from $V$). Any single failure → not a subspace.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 6 — Abstract Vector Spaces',
        body: '**Previous:** This is the start of Chapter 6.\n**This lesson:** Abstract Vector Spaces — defining vector spaces by ten axioms, recognizing when a set qualifies, and testing subspaces.\n**Next:** Basis and Dimension — how to measure the "size" of any vector space with a single number.',
      },
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
      {
        type: 'insight',
        title: 'Prediction',
        body: 'Before working through the subspace examples: which of these is a subspace of $\\mathbb{R}^3$? (a) $\\{(x,y,z) : x + y + z = 0\\}$; (b) $\\{(x,y,z) : x + y + z = 1\\}$; (c) $\\{(x,y,z) : x \\geq 0\\}$; (d) $\\{(x,y,z) : x = 0\\}$. For each, ask: does it contain $\\mathbf{0}$? Is it closed under addition and scalar multiplication?',
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
              prose: [
                'Is W = {(x,y,z) : x + y + z = 0} a subspace of R^3?',
                'Three checks: (1) zero vector — `0+0+0=0` ✓; (2) closure under addition — if `u1+u2+u3=0` and `v1+v2+v3=0` then `(u1+v1)+(u2+v2)+(u3+v3)=0` ✓; (3) closure under scalar multiplication — if `x+y+z=0` then `c*x+c*y+c*z=c*0=0` ✓. Numerically: `u=[1;-1;0]; v=[2;0;-2]; disp(u+v)` should satisfy the constraint.',
                'The MATLAB check: define `in_W = @(p) abs(sum(p)) < 1e-10; disp(in_W([0;0;0]))` (true for zero), `disp(in_W(u+v))` (true for sum), `disp(in_W(3*u))` (true for scalar multiple). All three returning 1 confirms W is a subspace. The geometric picture: W is a plane through the origin (the normal vector [1,1,1] has zero inner product with everything in W).',
              ],
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
              prose: [
                'Represent polynomials as coefficient vectors and verify closure.',
                'Encode p(x) = a + bx + cx² as the column vector [a;b;c]. Addition becomes vector addition: `p+q = p_vec + q_vec`. Scalar multiplication: `2*p = 2*p_vec`. These operations always produce another polynomial of degree ≤ 2, which maps to another vector in R^3. This is the isomorphism P_2 ≅ R^3.',
                'Test: `p = [1;2;3]; q = [0;1;-1]; r = p + q; disp(r)`. Interpret: r encodes 1 + 3x + 2x². Check closure under multiplication by -3: `disp(-3*p)` gives [-3;-6;-9], encoding -3 - 6x - 9x². Both stay in P_2 — confirming P_2 satisfies all vector space axioms under these operations.',
              ],
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Subspace test: two examples',
              prose: [
                'Verify that W = {(x,y,z) : x+2y-z=0} is a subspace of R^3 by checking closure under addition and scalar multiplication. Then show a non-example.',
                '`in_W = lambda v: abs(v[0] + 2*v[1] - v[2]) < 1e-10`. The three checks: `in_W([0,0,0])` (zero vector), `in_W(u + v)` (closure under addition for any u,v in W), `in_W(3*u)` (closure under scalar multiplication). All must return True. For the non-example (e.g. W2 = {x+y=1}), show `in_W2([0,0])` returns False — immediately fails at the zero vector test.',
                'The key insight: any set defined by a HOMOGENEOUS linear equation (equal to zero) is a subspace; sets defined by INHOMOGENEOUS equations (equal to a non-zero constant) are not subspaces because the zero vector fails. This is why the standard subspace test starts with the zero vector — it is the quickest filter.',
              ],
              code: `import numpy as np

def in_W(v):
    return abs(v[0] + 2*v[1] - v[2]) < 1e-10

# Subspace checks
u = np.array([1., 0., 1.])   # 1+0-1=0 ✓
v = np.array([2., 1., 4.])   # 2+2-4=0 ✓
print("W = {x+2y-z=0} subspace checks:")
print("  zero in W:", in_W([0, 0, 0]))
print("  u in W:", in_W(u), " v in W:", in_W(v))
print("  u+v in W:", in_W(u + v), "  7*u in W:", in_W(7*u))
print("=> W is a subspace (null space of [1,2,-1]) ✓")
print()

# Non-example: W2 = {x+y=1}
def in_W2(v):
    return abs(v[0] + v[1] - 1) < 1e-10

p = np.array([0.5, 0.5, 3.])
q = np.array([0.3, 0.7, 1.])
print("Non-example W2 = {x+y=1}:")
print("  p in W2:", in_W2(p), " q in W2:", in_W2(q))
print("  p+q in W2:", in_W2(p + q), " <- FAILS (x+y=1.6 ≠ 1)")
print("=> Not a subspace: doesn't contain zero and not closed under addition")
`,
            },
            {
              id: 2,
              cellTitle: 'Polynomial vector space P_2 ≅ R^3',
              prose: [
                'Treat polynomials as coefficient vectors. Verify vector space operations and test whether {1+x, 1-x} spans P_1.',
                'Encode p(x) = a + bx as `np.array([a, b])`. Addition is `p_vec + q_vec`; scalar multiplication is `c * p_vec`. To test spanning: build the matrix `B = np.column_stack([[1,1],[1,-1]])` (each column = one basis vector). Then `[1,x]` span P_1 iff `np.linalg.matrix_rank(B) == 2` and every vector can be solved: `np.linalg.solve(B, target_vec)` gives the coordinates.',
                'Try to express `5 + 3x` in the {1+x, 1-x} basis: solve `c1*[1,1] + c2*[1,-1] = [5,3]`. The system `B @ [c1,c2] = [5,3]` gives `c1=4, c2=1`. Verify: `4*(1+x) + 1*(1-x) = 5 + 3x` ✓. Since det(B) ≠ 0, this works for ANY target polynomial — confirming {1+x, 1-x} is a basis for P_1.',
              ],
              code: `import numpy as np

# p(x) = a0 + a1*x + a2*x^2 stored as [a0, a1, a2]
p = np.array([1., 2., 3.])   # 1 + 2x + 3x^2
q = np.array([4., 0., -1.])  # 4 - x^2

print("Polynomial arithmetic as vector arithmetic:")
print("  p + q =", p + q, "  (coefficients add pointwise)")
print("  3*p   =", 3*p)
print("  zero  =", np.zeros(3))
print()

# Spanning test: do {1+x, 1-x} span P_1?
A = np.array([[1., 1.], [1., -1.]])
print("Spanning test for {1+x, 1-x} in P_1:")
for target in [[2., 4.], [3., -1.], [0., 5.]]:
    c = np.linalg.solve(A, target)
    print(f"  {target[0]}+{target[1]}x = {c[0]:.2f}(1+x) + {c[1]:.2f}(1-x) ✓")
print("=> {1+x, 1-x} spans P_1")
`,
            },
            {
              id: 3,
              cellTitle: "ODE solution space — a 2D vector space",
              prose: [
                "Solutions to y'' + y = 0 form a 2D vector space spanned by {sin(t), cos(t)}. Verify that any solution is a linear combination of these basis elements.",
                "The Wronskian matrix `W = [[sin(t), cos(t)], [cos(t), -sin(t)]]` has determinant `det(W) = -sin²(t) - cos²(t) = -1 ≠ 0` everywhere — confirming {sin, cos} are linearly independent at every point. In code: `t = np.linspace(0, 2*np.pi, 100); W = np.array([[np.sin(t), np.cos(t)],[np.cos(t), -np.sin(t)]]);  dets = np.linalg.det(W.transpose(2,0,1))` should be all -1.",
                "Any initial condition (y(0)=a, y'(0)=b) determines a unique solution `y(t) = b*sin(t) + a*cos(t)`. The system `[[sin(0),cos(0)],[cos(0),-sin(0)]] @ [c1,c2] = [a,b]` gives `c2=a, c1=b`. Plot several solutions for different (a,b) pairs overlaid — they all look like sine waves with different amplitudes and phases, confirming the 2D nature of the solution space.",
              ],
              code: `import numpy as np
from scipy.integrate import odeint

t = np.linspace(0, 2*np.pi, 200)

def ode(y, t):
    return [y[1], -y[0]]

y1 = odeint(ode, [0., 1.], t)[:, 0]   # sin(t)
y2 = odeint(ode, [1., 0.], t)[:, 0]   # cos(t)
y3 = odeint(ode, [2., 3.], t)[:, 0]   # 2cos+3sin

print("Solution space of y'' + y = 0 (dimension 2):")
print(f"  Max |y3 - (2*y2 + 3*y1)|: {np.max(np.abs(y3 - (2*y2+3*y1))):.2e}")
print("=> y3 is exactly 2*cos(t) + 3*sin(t)")
print("=> Any solution = c1*cos(t) + c2*sin(t) — a 2D vector space")
`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Abstract Vector Spaces — OpenMAT',
        mathBridge: 'Test subspace conditions and explore polynomial spaces using MATLAB-style syntax.',
        caption: 'Subspace = subset closed under addition and scalar multiplication, containing zero.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Subspace check and spanning',
              prose: [
                'Test whether W = {(x,y,z): x+2y-z=0} is a subspace, then check whether {1+x, 1-x} spans P_1.',
                'The subspace test in three lines: `u=[1;-2;-3]; v=[3;0;3]; disp(u(1)+2*u(2)-u(3))` (should be 0), `w=u+v; disp(w(1)+2*w(2)-w(3))` (should be 0), `s=3*u; disp(s(1)+2*s(2)-s(3))` (should be 0). For spanning: `B=[1 1; 1 -1]; disp(rank(B))` should be 2; then solve `B\\[5;3]` to express 5+3x in the new basis.',
                'The key connection: subspace test checks three axioms (zero, addition, scalar); spanning test checks rank. Combining both: a set of vectors is a BASIS for a subspace iff it spans the subspace AND is linearly independent. The `rank(B)==n` check confirms both simultaneously when the matrix is square.',
              ],
              code: `% Subspace check: W = {(x,y,z): x+2y-z=0}
u = [1; 0; 1]   % 1+0-1=0 ✓
v = [2; 1; 4]   % 2+2-4=0 ✓

disp('Closure under addition:')
w = u + v
x_sum = w(1) + 2*w(2) - w(3)
disp(['x+2y-z for u+v = ', num2str(x_sum), ' (should be 0)'])

disp('Closure under scalar multiplication:')
w2 = 7 * u
x_scal = w2(1) + 2*w2(2) - w2(3)
disp(['x+2y-z for 7u = ', num2str(x_scal), ' (should be 0)'])

% Spanning test: {1+x, 1-x} in P_1 — coefficients [1;1] and [1;-1]
A = [1 1; 1 -1]
b = [2; 4]
c = A \\ b
disp('2+4x = c1*(1+x) + c2*(1-x): c =')
c
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
      '**Direct sums.** A vector space $V$ is the **direct sum** $V = U \\oplus W$ of two subspaces $U$ and $W$ if every vector $\\mathbf{v} \\in V$ decomposes uniquely as $\\mathbf{v} = \\mathbf{u} + \\mathbf{w}$ with $\\mathbf{u} \\in U$ and $\\mathbf{w} \\in W$. Equivalently: $U + W = V$ and $U \\cap W = \\{\\mathbf{0}\\}$. The dimension formula follows immediately: $\\dim(U \\oplus W) = \\dim(U) + \\dim(W)$. The symmetric–antisymmetric decomposition $M_{2\\times 2} = \\mathrm{Sym}_2 \\oplus \\mathrm{Skew}_2$ (dimensions $3 + 1 = 4$) is the canonical example — every matrix splits uniquely as $A = \\tfrac{A+A^\\top}{2} + \\tfrac{A-A^\\top}{2}$.',
      '**Quotient spaces.** Given a subspace $W \\subseteq V$, the **quotient space** $V/W$ has cosets $\\{\\mathbf{v} + W : \\mathbf{v} \\in V\\}$ as elements, with $(\\mathbf{u}+W) + (\\mathbf{v}+W) = (\\mathbf{u}+\\mathbf{v})+W$ and $c(\\mathbf{v}+W) = c\\mathbf{v}+W$. The first isomorphism theorem gives $\\dim(V/W) = \\dim(V) - \\dim(W)$. Quotient spaces formalize "ignoring the $W$ directions": if $T: V \\to U$ is a linear map with null space $W$, then $V/W \\cong \\mathrm{Im}(T)$, rewriting rank–nullity as $\\dim(V/W) = \\mathrm{rank}(T)$ — the same bookkeeping, more abstract language.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Isomorphism: Same Structure, Different Labels',
        body: 'Two vector spaces are isomorphic iff they have the same dimension. $P_n \\cong \\mathbb{R}^{n+1}$, $M_{m \\times n} \\cong \\mathbb{R}^{mn}$. Isomorphic spaces are "the same" for purposes of linear algebra — any basis identification gives an isomorphism.',
      },
    ],
    visualizations: [
      {
        id: 'VectorSpacesViz',
        title: 'Vector Spaces — Subspaces, Null Space & Column Space',
        mathBridge: 'A five-tab module: Concept explains the 8 axioms, span, subspaces, and examples (polynomials, functions, matrices); Canonical steps through an RREF computation highlighting pivot vs free columns and identifying the column space and null space; Real World shows null space as the set of all CNC tool positions that produce no output displacement; Interactive lets you enter any 2×3 matrix and visualize its column space and null space; Practice has four problems.',
        caption: 'Pivot columns span the column space; null space is everything the matrix squishes to zero — both revealed by RREF.',
      },
    ],
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
    {
      id: 'ex-la6-001-3',
      title: 'Antisymmetric matrices: a subspace of $M_{2\\times 2}$',
      problem: 'Let $W = \\{A \\in M_{2\\times 2} : A^\\top = -A\\}$ be the set of antisymmetric (skew-symmetric) $2\\times 2$ matrices. Show $W$ is a subspace, find a basis, and state $\\dim(W)$.',
      steps: [
        {
          expression: 'A \\in W \\Leftrightarrow A = \\begin{bmatrix}0 & a \\\\ -a & 0\\end{bmatrix} \\text{ for some } a \\in \\mathbb{R}',
          annotation: 'An antisymmetric $2\\times2$ matrix has zero diagonal (since $A_{ii} = -A_{ii}$ forces $A_{ii} = 0$) and off-diagonals that are negatives of each other.',
          strategyTitle: 'Characterize elements of $W$',
        },
        {
          expression: '\\mathbf{0} = \\begin{bmatrix}0&0\\\\0&0\\end{bmatrix}: \\quad \\mathbf{0}^\\top = \\mathbf{0} = -\\mathbf{0} \\checkmark',
          annotation: 'The zero matrix is antisymmetric (trivially: $0 = -0$).',
          strategyTitle: 'Check condition 1: zero',
        },
        {
          expression: 'A + B = \\begin{bmatrix}0&a\\\\-a&0\\end{bmatrix} + \\begin{bmatrix}0&b\\\\-b&0\\end{bmatrix} = \\begin{bmatrix}0&a+b\\\\-(a+b)&0\\end{bmatrix} \\in W \\checkmark',
          annotation: '$(A+B)^\\top = A^\\top + B^\\top = -A + (-B) = -(A+B)$. Antisymmetric matrices are closed under addition.',
          strategyTitle: 'Check condition 2: closed under addition',
        },
        {
          expression: 'cA = \\begin{bmatrix}0&ca\\\\-ca&0\\end{bmatrix} \\in W \\checkmark',
          annotation: '$(cA)^\\top = cA^\\top = c(-A) = -(cA)$.',
          strategyTitle: 'Check condition 3: closed under scalar mult.',
        },
        {
          expression: '\\text{Basis: } \\left\\{\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}\\right\\}, \\quad \\dim(W) = 1',
          annotation: 'Every element of $W$ is $a \\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$ for a single scalar $a$. One basis vector, dimension 1. Note: the symmetric matrices have dimension 3 and antisymmetric have dimension 1 — together: $3 + 1 = 4 = \\dim(M_{2\\times 2})$. Every matrix decomposes uniquely as symmetric + antisymmetric: $A = \\frac{A+A^\\top}{2} + \\frac{A-A^\\top}{2}$.',
          strategyTitle: 'Find dimension and basis',
          checkpoint: 'Two complementary subspaces of $M_{2\\times 2}$: symmetric (dim 3) and antisymmetric (dim 1). Their dimensions add up to $\\dim(M_{2\\times 2}) = 4$.',
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
    {
      id: 'ch-la6-001-3',
      title: 'Exotic vector space: positive reals with unusual operations',
      difficulty: 'hard',
      problem: 'Define $V = \\mathbb{R}_{>0}$ (positive reals) with "addition" $a \\oplus b = ab$ and "scalar multiplication" $c \\otimes a = a^c$. Verify all 10 vector space axioms (zero vector, additive inverse, four addition laws, four scalar laws) and find the isomorphism between $V$ and $(\\mathbb{R}, +, \\cdot)$.',
      hint: 'Find the "zero vector" first: what element $e$ satisfies $a \\oplus e = a$ for all $a > 0$? Then for the isomorphism, think about what function turns multiplication into addition.',
      walkthrough: [
        { expression: '\\mathbf{0}_V = 1, \\quad a \\oplus 1 = a \\cdot 1 = a \\checkmark', annotation: 'The multiplicative identity 1 plays the role of the zero vector. Axiom 4 holds.' },
        { expression: '(-a)_V = \\tfrac{1}{a} > 0, \\quad a \\oplus \\tfrac{1}{a} = 1 = \\mathbf{0}_V \\checkmark', annotation: 'The reciprocal $1/a$ is the additive inverse. It stays positive, so it lives in $V$. Axiom 5 holds.' },
        { expression: 'c \\otimes (a \\oplus b) = (ab)^c = a^c b^c = (c \\otimes a) \\oplus (c \\otimes b) \\checkmark', annotation: 'Distributivity over addition (axiom 7) follows from $(ab)^c = a^c b^c$.' },
        { expression: '(c+d) \\otimes a = a^{c+d} = a^c a^d = (c \\otimes a) \\oplus (d \\otimes a) \\checkmark', annotation: 'Distributivity over scalar addition (axiom 8) follows from $a^{c+d} = a^c a^d$.' },
        { expression: 'c \\otimes (d \\otimes a) = c \\otimes a^d = (a^d)^c = a^{cd} = (cd) \\otimes a \\checkmark \\quad 1 \\otimes a = a^1 = a \\checkmark', annotation: 'Axioms 9 (associativity of scalar mult.) and 10 (identity scalar) both hold. All remaining axioms (commutativity and associativity of $\\oplus$) follow from commutativity/associativity of multiplication.' },
        { expression: '\\varphi: \\mathbb{R} \\to \\mathbb{R}_{>0}, \\quad \\varphi(x) = e^x \\text{ is an isomorphism}', annotation: '$\\varphi(x+y) = e^{x+y} = e^x e^y = \\varphi(x) \\oplus \\varphi(y)$ and $\\varphi(cx) = e^{cx} = (e^x)^c = c \\otimes \\varphi(x)$. Bijective with inverse $\\ln$. So $(\\mathbb{R}_{>0}, \\oplus, \\otimes) \\cong (\\mathbb{R}, +, \\cdot)$ — same 1D structure, different labels.' },
      ],
      answer: 'All 10 axioms hold: zero vector = 1, inverse of $a$ = $1/a$, distributive laws follow from exponent rules. Isomorphism: $\\varphi(x) = e^x$ with inverse $\\ln$.',
    },
  ],

  mentalModel: [
    'A vector space is ANY set with addition and scalar multiplication satisfying the 10 axioms.',
    'Examples: $\\mathbb{R}^n$, polynomial spaces $P_n$, matrix spaces $M_{m\\times n}$, function spaces $C[a,b]$.',
    'Subspace test: just check zero vector, closed addition, closed scalar mult.',
    'All linear algebra (independence, span, basis, dimension, linear maps) works identically in any vector space.',
  ],

  checkpoints: [
    { id: 'cp-la6-001-1', label: 'Read intuition: polynomial and subspace examples', type: 'read' },
    { id: 'cp-la6-001-2', label: 'Read math: span and independence in abstract spaces', type: 'read' },
    { id: 'cp-la6-001-3', label: 'Read rigor: fields, modules, isomorphism', type: 'read' },
    { id: 'cp-la6-001-4', label: 'Run subspace condition lab', type: 'lab' },
    { id: 'cp-la6-001-5', label: 'Run polynomial vector space lab', type: 'lab' },
    { id: 'cp-la6-001-6', label: 'Work example 1: symmetric matrices subspace', type: 'example' },
    { id: 'cp-la6-001-7', label: 'Work example 2: span of polynomials', type: 'example' },
    { id: 'cp-la6-001-8', label: 'Solve challenge: non-example of a vector space', type: 'challenge' },
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
    {
      id: 'q-la6-001-5',
      type: 'choice',
      text: 'Which set is a subspace of $\\mathbb{R}^3$?',
      options: [
        '$\\{(x,y,z) : x + y + z = 1\\}$',
        '$\\{(x,y,z) : x^2 + y^2 = z^2\\}$',
        '$\\{(x,y,z) : 2x - y + 3z = 0\\}$',
        '$\\{(x,y,z) : x \\geq 0, y \\geq 0, z \\geq 0\\}$',
      ],
      answer: '$\\{(x,y,z) : 2x - y + 3z = 0\\}$',
      hints: ['$x+y+z=1$ fails the zero vector test ($0+0+0 \\neq 1$). $x^2+y^2=z^2$ is quadratic — not closed under addition. The first quadrant fails closure under scalar multiplication (multiply by $-1$). Only $2x-y+3z=0$ is homogeneous and linear — it is the null space of $[2,-1,3]$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-001-6',
      type: 'choice',
      text: 'What is the dimension of the space of $3 \\times 3$ symmetric matrices?',
      options: ['3', '6', '9', '5'],
      answer: '6',
      hints: ['A $3\\times3$ symmetric matrix has 3 diagonal entries and 3 entries above the diagonal (which determine the 3 below by symmetry). Total free entries: $3 + 3 = 6$. Basis: $E_{11}, E_{22}, E_{33}$ (diagonal) and $E_{12}+E_{21}, E_{13}+E_{31}, E_{23}+E_{32}$ (off-diagonal pairs).'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-001-7',
      type: 'choice',
      text: 'The span of any finite set of vectors $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ is:',
      options: [
        'A subspace only if the vectors are linearly independent',
        'Always a subspace of $V$',
        'The entire space $V$ if $k \\geq \\dim(V)$',
        'A subspace only if all vectors are nonzero',
      ],
      answer: 'Always a subspace of $V$',
      hints: ['The span is always a subspace, regardless of independence. Proof: zero = $0\\mathbf{v}_1 + \\cdots + 0\\mathbf{v}_k$ ✓; linear combinations of linear combinations are linear combinations ✓. Independence determines whether the span has dimension $k$ (if independent) or less (if dependent).'],
      reviewSection: 'math',
    },
    {
      id: 'q-la6-001-8',
      type: 'choice',
      text: 'The set of antisymmetric $2\\times 2$ matrices ($A^\\top = -A$) has which dimension?',
      options: ['1', '2', '3', '4'],
      answer: '1',
      hints: ['An antisymmetric $2\\times2$ matrix must have $A_{11} = -A_{11}$ (so $A_{11}=0$), $A_{22}=0$, and $A_{21} = -A_{12}$. One free parameter: $a = A_{12}$. Basis: $\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}$. Dimension = 1.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la6-001-9',
      type: 'choice',
      text: 'Two finite-dimensional vector spaces are isomorphic if and only if:',
      options: [
        'They are both over $\\mathbb{R}$',
        'They have the same dimension',
        'One is a subspace of the other',
        'They have the same basis vectors',
      ],
      answer: 'They have the same dimension',
      hints: ['Isomorphic means there exists a bijective linear map between them. For finite-dimensional vector spaces, this is equivalent to having the same dimension. So $P_3 \\cong \\mathbb{R}^4 \\cong M_{2\\times2}$ — all different "looking" but same dimension 4, hence algebraically identical.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la6-001-10',
      type: 'choice',
      text: 'In CNC motion control, the set of all velocity profiles satisfying $v(0) = v(T) = 0$ (zero start/end speed) is a function space. Which linear algebra operation would you use to find the "smoothest" profile among all valid profiles?',
      options: [
        'Determinant — the smooth profile maximizes the determinant of the function matrix',
        'Minimization of a norm (e.g., minimize $\\|v\'\'\\|^2$) over the subspace of valid profiles',
        'Eigenvalue decomposition of the velocity function',
        'Gram-Schmidt orthogonalization of the velocity space',
      ],
      answer: 'Minimization of a norm (e.g., minimize $\\|v\'\'\\|^2$) over the subspace of valid profiles',
      hints: ['The valid profiles form a vector space (subspace satisfying the linear boundary conditions). "Smoothest" means minimizing jerk or acceleration, which is a norm constraint on the function. This is optimization over an infinite-dimensional vector space — the abstract structure (norm, subspace) carries over from $\\mathbb{R}^n$ to function spaces.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Determine whether a set is a vector space or subspace by checking the three conditions; find a basis and dimension for standard examples like polynomial spaces and matrix spaces.',
    explainVerbally: 'Explain why the span of any set is always a subspace, and why the subspace test only needs three conditions (not all ten axioms).',
    detectIncorrectApplication: 'Catch the two most common errors: (1) forgetting to check the zero vector first — if $\\mathbf{0} \\notin W$, it\'s immediately not a subspace; (2) applying the subspace test to a set defined by a non-linear constraint.',
    transferToUnfamiliar: 'Recognize that ODE solution spaces, function spaces, and matrix subspaces all behave like $\\mathbb{R}^n$ — span, independence, basis, dimension all apply identically.',
  },

  misconceptions: [
    {
      falseBelief: 'Any set defined by an equation is a subspace.',
      whyStudentsThinkIt: 'Lines and planes in $\\mathbb{R}^3$ are often given as equations, and lines/planes through the origin ARE subspaces — students overgeneralize.',
      correctionExample: '$\\{(x,y) : x + y = 1\\}$ is a line but NOT a subspace: it misses the zero vector ($0+0=1$ is false) and is not closed under addition ($((0.5,0.5)+(0.5,0.5)=(1,1)$ but $1+1=2 \\neq 1$).',
      contrastCase: '$\\{(x,y) : x + y = 0\\}$ IS a subspace — the difference is the homogeneous (= 0) vs. inhomogeneous (= 1) constraint. Only homogeneous linear constraints define subspaces.',
    },
    {
      falseBelief: 'A vector space is only a collection of arrows in $\\mathbb{R}^n$.',
      whyStudentsThinkIt: 'The visual picture of vectors as arrows dominates early linear algebra courses.',
      correctionExample: 'The set of continuous functions $C[0,1]$ with $(f+g)(x)=f(x)+g(x)$ and $(cf)(x)=c f(x)$ satisfies all 10 axioms. Functions ARE vectors — you can take linear combinations, they have a zero element ($f=0$), and negatives ($-f$).',
      contrastCase: '$\\mathbb{R}^n$ is one specific vector space where vectors happen to look like arrows. The abstract definition admits any set with the right operations.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are solving a linear ODE $y\'\' + p(t)y\' + q(t)y = 0$ and want to know how many free parameters the general solution has.',
      competingTechniques: 'Guess particular solutions and check by substitution, use series solutions.',
      whyThisTechniqueWins: 'The solution set is a vector space of dimension equal to the order of the ODE (2 for a 2nd-order ODE). You need exactly as many independent basis solutions as the order. This tells you the general solution has exactly 2 free parameters — no guesswork.',
    },
    {
      situation: 'You want to verify that a proposed subspace of a matrix space is valid.',
      competingTechniques: 'Check all 10 axioms, compute a basis and verify closure.',
      whyThisTechniqueWins: 'The three-condition subspace test (zero, closed addition, closed scalar mult.) is sufficient and minimal — the other 7 axioms are inherited from the ambient space. This collapses a 10-step check to 3.',
    },
  ],

  semantics: {
    core: [
      { symbol: '(V, +, \\cdot)', meaning: 'A vector space: a set V with addition and scalar multiplication satisfying the 10 axioms; objects in V are called vectors regardless of appearance' },
      { symbol: '\\mathbf{0}_V', meaning: 'The unique zero vector in V: the additive identity satisfying v + 0 = v for all v' },
      { symbol: 'W \\leq V', meaning: 'W is a subspace of V: a non-empty subset closed under addition and scalar multiplication (equivalently: contains 0 and all linear combinations)' },
      { symbol: 'V \\cong W', meaning: 'V and W are isomorphic: same dimension, connected by a bijective linear map; algebraically identical' },
      { symbol: 'V = U \\oplus W', meaning: 'Direct sum: every vector in V decomposes uniquely as u + w; dim(U ⊕ W) = dim(U) + dim(W)' },
      { symbol: 'V/W', meaning: 'Quotient space: elements are cosets v + W; dim(V/W) = dim(V) − dim(W) by the first isomorphism theorem' },
    ],
    rulesOfThumb: [
      'A homogeneous linear constraint (= 0) always defines a subspace; inhomogeneous (= c ≠ 0) never does — the zero vector fails.',
      `dim(P_n) = n+1, dim(M_{m×n}) = mn, dim(C[a,b]) = ∞ — know these on sight.`,
      'The zero vector test is the cheapest: if 0 ∉ W, stop immediately — it is not a subspace.',
      'Span of any set is always a subspace — use this to build subspaces quickly from spanning vectors.',
      'Isomorphic spaces have the same dimension and are algebraically identical: P_3 ≅ R^4 ≅ M_{2×2} (all dimension 4).',
    ],
  },

  spiral: {
    recoveryPoints: [
      { id: 'la1-001', label: 'Vectors in ℝⁿ', reason: 'The prototype vector space — all 10 axioms hold here; verify abstract axioms in ℝⁿ first' },
      { id: 'la2-001', label: 'Null space and column space', reason: 'Null space = subspace of ℝⁿ; column space = subspace of ℝᵐ; both are abstract subspaces of the most concrete space' },
    ],
    futureLinks: [
      { id: 'la6-002', label: 'Basis and Dimension', reason: 'Dimension is the key invariant of an abstract vector space — formally defined next lesson' },
      { id: 'la6-003', label: 'Linear Transformations', reason: 'Maps between abstract vector spaces; kernel and image are subspaces; rank–nullity is the dimension version of the first isomorphism theorem' },
    ],
  },

  debugging: [
    {
      commonError: 'Concluding a set is a subspace without checking the zero vector first.',
      symptom: 'A set like $\\{(x,y,z) : x+y+z=1\\}$ gets declared a subspace after checking (incorrect) closure.',
      whyItHappened: 'The zero vector check is the cheapest and most often decisive test — it immediately rules out all affine (inhomogeneous) sets. Students sometimes skip it and proceed to the harder closures.',
      repairStrategy: 'Always start with the zero vector test. If $\\mathbf{0} \\notin W$, stop — it\'s not a subspace. Only proceed to closure tests after the zero test passes.',
    },
    {
      commonError: 'Applying subspace reasoning to a non-linear constraint like $\\{x^2 + y^2 = 1\\}$.',
      symptom: 'Check: $(1,0) \\in W$ ✓ and $(0,1) \\in W$ ✓. Then wrongly conclude $W$ is a subspace because the boundary conditions seem to hold.',
      whyItHappened: 'Non-linear sets can contain the zero vector ($0^2+0^2=0 \\neq 1$ so actually it fails here) and might appear closed at a glance. The closure test must be checked algebraically, not geometrically.',
      repairStrategy: 'Test closure algebraically: take two arbitrary elements of $W$ (parameterize them), add them, and check if the result satisfies the defining condition. For $x^2+y^2=1$: $(1,0)+(0,1)=(1,1)$, $1^2+1^2=2 \\neq 1$ — fails.',
    },
  ],
};
