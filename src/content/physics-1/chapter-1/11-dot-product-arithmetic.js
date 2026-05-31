export default {
  id: 'p1-ch1-011',
  slug: 'dot-product-arithmetic',
  chapter: 'p1',
  order: 11,
  title: 'Dot Product — Component Arithmetic',
  subtitle: 'Multiply matching components and add: $A_xB_x + A_yB_y + A_zB_z$.',
  tags: ['dot product', 'component arithmetic', 'scalar product', '3D', 'magnitude squared'],
  aliases: 'dot product component calculation multiply add',

  hook: {
    question: 'You have two 3D force vectors in component form. How do you find their dot product without ever needing the angle?',
    realWorldContext:
      `Computer programs, physics engines, and machine learning algorithms deal entirely in components — never angles. The component dot product formula $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$ is the version that runs on every processor in the world.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (13 of 21) Dot Product: Component and Algebraic Form',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `$\\vec{A} = (3, 4)$ and $\\vec{B} = (1, -2)$. Before reading on, predict the sign of $\\vec{A}\\cdot\\vec{B}$. The $x$-terms give $(3)(1) = +3$; the $y$-terms give $(4)(-2) = -8$. Which wins? Work it out, then read the rule below.`,

      `The previous lesson gave the geometric definition: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. Powerful, but it requires knowing the angle $\\phi$. In practice, vectors are usually given as components — $(A_x, A_y, A_z)$ — and computing $|A|$, $|B|$, and $\\phi$ just to find the dot product is wasteful. The component formula skips all of that.`,

      `The recipe: **multiply the $x$-components together, the $y$-components together, the $z$-components together, and add**. For the prediction above: $3(1) + 4(-2) = 3 - 8 = -5$. Negative — the vectors are at an obtuse angle. Three multiplications and two additions for any pair of 3D vectors.`,

      `Why does this work? Because when you expand $\\vec{A}\\cdot\\vec{B}$ using unit vectors, the cross-terms like $\\hat{\\imath}\\cdot\\hat{\\jmath}$ are all zero (they're perpendicular), and the self-terms like $\\hat{\\imath}\\cdot\\hat{\\imath}$ are all 1 (unit vectors). Only the matching pairs survive.`,

      `A special case you'll use constantly: $\\vec{A}\\cdot\\vec{A} = A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2$. Dot a vector with itself to get the magnitude squared. Take the square root to get the magnitude. This is the Pythagorean theorem in disguise.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Component dot product',
        body:
          `\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y \\quad\\text{(2D)}\\n\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z \\quad\\text{(3D)}`,
      },
      {
        type: 'insight',
        title: 'Self-dot = magnitude squared',
        body:
          `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$, so $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$. This is the Pythagorean theorem written in dot product notation — the magnitude emerges from the inner product.`,
      },
      {
        type: 'insight',
        title: 'Matrix notation (preview)',
        body:
          `The dot product $\\vec{A}\\cdot\\vec{B}$ can be written as $\\mathbf{A}^T\\mathbf{B}$ in matrix notation, where $\\mathbf{A}^T$ is the row vector (transpose of the column vector $\\mathbf{A}$). This connects directly to matrix–vector multiplication in Linear Algebra.`,
      },
      {
        type: 'procedure',
        title: 'Three steps to any dot product',
        body: `1. **List components side by side:** write $A_x, A_y, A_z$ and $B_x, B_y, B_z$\n2. **Multiply matching pairs:** $A_xB_x$, then $A_yB_y$, then $A_zB_z$\n3. **Sum the products:** $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$\n\nSign check: positive → acute; zero → perpendicular; negative → obtuse`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Why component multiplication = projection',
        caption:
          `$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$ comes directly from projecting each component onto its matching axis. The geometric formula $|A||B|\\cos\\phi$ and the component formula always give the same number.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Component arithmetic = geometric projection',
        caption: `$A_xB_x + A_yB_y + A_zB_z$ is three multiplications and two additions. Each term is the contribution of one axis to the total "overlap" between the vectors.`,
      },
    ],
  },

  math: {
    prose: [
      'Work through the calculation systematically for any dimension:',
      '**Step 1**: List the components of each vector side by side.',
      '**Step 2**: Multiply matching components: $x$-components together, $y$ together, $z$ together.',
      '**Step 3**: Sum all the products.',
      'The result is the dot product — a single number. Done.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Worked method — component table',
        body:
          `| | $x$ | $y$ | $z$ |\\n|-|-----|-----|-----|\\n| $\\vec{A}$ | $A_x$ | $A_y$ | $A_z$ |\\n| $\\vec{B}$ | $B_x$ | $B_y$ | $B_z$ |\\n| Product | $A_xB_x$ | $A_yB_y$ | $A_zB_z$ |\\n\\n$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$`,
      },
      {
        type: 'theorem',
        title: 'Distributive law (proved via components)',
        body:
          `\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}\\n\\n\\text{Proof: } A_x(B_x+C_x)+A_y(B_y+C_y) = A_xB_x+A_yB_y + A_xC_x+A_yC_y`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Dot product in 2D and 3D',
      caption: `2D: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$. 3D: add $A_zB_z$. The projection diagram extends to 3D — the same geometric interpretation holds in any dimension.`,
    }],
  },

  rigor: {
    prose: [
      `The equivalence $|A||B|\\cos\\phi = A_xB_x + A_yB_y$ is not just algebraically convenient — in $\\mathbb{R}^n$ for $n \\ge 3$, the component formula comes first and is used to **define** the angle: $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$. The geometric picture ("angle between two arrows") is then derived as a consequence.`,
      `The component formula's validity depends entirely on the orthonormality of the basis: $\\hat{\\imath}\\cdot\\hat{\\jmath}=0$ (orthogonal) and $\\hat{\\imath}\\cdot\\hat{\\imath}=1$ (unit length). If you change to a different basis — say, one where basis vectors are not perpendicular — the component formula changes. The invariant is the dot product itself; the component representation depends on the frame.`,
      `From the component formula, all algebraic properties follow: commutativity ($A_xB_x+A_yB_y = B_xA_x+B_yA_y$), distributivity (standard scalar arithmetic), and scalar associativity ($(c\\vec{A})\\cdot\\vec{B} = cA_xB_x+cA_yB_y = c(A_xB_x+A_yB_y)$). These properties hold in any dimension $n$ and require no geometric argument.`,
      `In $n$ dimensions, the component dot product generalises to $\\vec{A}\\cdot\\vec{B} = \\sum_{i=1}^n A_iB_i$, and the self-dot $|\\vec{A}|^2 = \\sum_{i=1}^n A_i^2$ is the $n$-dimensional Pythagorean theorem. In Linear Algebra, the matrix form $\\mathbf{A}^T\\mathbf{B}$ (a $1\\times n$ row vector dotted with an $n\\times 1$ column vector) shows that every inner product is a special case of matrix multiplication.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Distributive law proof via components',
        body: '\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B}+\\vec{A}\\cdot\\vec{C}',
      },
    ],
    proofSteps: [
      {
        title: 'Write component products',
        expression: '\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y',
        annotation: 'The component formula reduces dot products to scalar arithmetic.',
      },
      {
        title: 'Expand the distributive claim',
        expression: '\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = A_x(B_x+C_x) + A_y(B_y+C_y)',
        annotation: 'Apply the component formula to the sum vector $\\vec{B}+\\vec{C}=(B_x+C_x, B_y+C_y)$.',
      },
      {
        title: 'Distribute scalar multiplication',
        expression: '= A_xB_x+A_xC_x + A_yB_y+A_yC_y',
        annotation: 'Standard distributive law for scalars.',
      },
      {
        title: 'Regroup',
        expression: '= (A_xB_x+A_yB_y) + (A_xC_x+A_yC_y) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}',
        annotation: 'Regroup as two dot products. Distributive law proven.',
      },
    ],
    title: 'Formal Derivation of Component Addition',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Self-dot = magnitude squared',
      caption: `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$. This connects the algebraic and geometric definitions: the Pythagorean theorem emerges from the dot product.`,
    }],
  },

  examples: [
    {
      id: 'ch1-011-ex1',
      title: '2D component dot product',
      problem: '\\vec{A}=(3,\\,4),\\;\\vec{B}=(2,\\,-1).\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        { expression: '\\vec{A}\\cdot\\vec{B} = (3)(2)+(4)(-1)', annotation: 'Multiply $x$-components, then $y$-components.' },
        { expression: '= 6-4 = 2', annotation: 'Sum the products. Positive result → acute angle.' },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = 2$. Positive — the vectors are at an acute angle.',
    },
    {
      id: 'ch1-011-ex2',
      title: '3D component dot product',
      problem: '\\vec{A}=(1,\\,-2,\\,3),\\;\\vec{B}=(4,\\,1,\\,-1).\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        { expression: '(1)(4)=4,\\quad(-2)(1)=-2,\\quad(3)(-1)=-3', annotation: 'Three component products — compute each before summing.' },
        { expression: '\\vec{A}\\cdot\\vec{B} = 4+(-2)+(-3) = -1', annotation: 'Sum: the dot product is negative — obtuse angle.' },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = -1$. Slightly negative — vectors are slightly more anti-aligned than aligned.',
    },
    {
      id: 'ch1-011-ex3',
      title: 'Using self-dot to find magnitude',
      problem: '\\vec{A}=(2,\\,-3,\\,6).\\text{ Use }\\vec{A}\\cdot\\vec{A}=|\\vec{A}|^2\\text{ to find }|\\vec{A}|.',
      steps: [
        {
          expression: '\\vec{A}\\cdot\\vec{A} = (2)(2)+(-3)(-3)+(6)(6) = 4+9+36 = 49',
          annotation: 'Multiply each component by itself and sum. This equals $|\\vec{A}|^2$.',
        },
        {
          expression: '|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}} = \\sqrt{49} = 7',
          annotation: 'Take the square root. The Pythagorean theorem in 3D.',
        },
      ],
      conclusion: '$|\\vec{A}| = 7$. The self-dot formula gives magnitude without computing $\\sqrt{A_x^2+A_y^2+A_z^2}$ separately — the dot product already includes that sum.',
    },
  ],

  challenges: [
    {
      id: 'ch1-011-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }\\vec{A}\\cdot\\vec{B}\\text{ for }\\vec{A}=(5,0,2)\\text{ and }\\vec{B}=(1,3,-4).',
      hint: 'Three component pairs: $5\\times1$, $0\\times3$, $2\\times(-4)$. Sum them.',
      walkthrough: [
        { expression: '5(1)+0(3)+2(-4) = 5+0-8 = -3', annotation: 'Component formula in 3D. The zero in $\\vec{A}$ kills the $y$-contribution entirely.' },
      ],
      answer: '\\vec{A}\\cdot\\vec{B} = -3',
    },
    {
      id: 'ch1-011-ch2',
      difficulty: 'medium',
      problem: '\\text{Show that }\\vec{A}=(3,4,0)\\text{ and }\\vec{B}=(-4,3,7)\\text{ are perpendicular.}',
      hint: 'Perpendicular iff dot product = 0.',
      walkthrough: [
        { expression: '\\vec{A}\\cdot\\vec{B}=(3)(-4)+(4)(3)+(0)(7)=-12+12+0=0', annotation: 'Zero dot product confirms perpendicularity. The $z$-component of $\\vec{B}$ is irrelevant since $A_z=0$.' },
      ],
      answer: '\\vec{A}\\cdot\\vec{B}=0 \\Rightarrow \\text{perpendicular}',
    },
    {
      id: 'ch1-011-ch3',
      difficulty: 'hard',
      problem: '\\text{If }|\\vec{A}|=5,\\;|\\vec{B}|=3,\\text{ and }\\vec{A}\\cdot\\vec{B}=9,\\text{ find the angle between them.}',
      hint: 'Use $\\cos\\phi = \\vec{A}\\cdot\\vec{B}/(|A||B|)$.',
      walkthrough: [
        { expression: '\\cos\\phi = 9/(5\\times3) = 9/15 = 3/5', annotation: 'Divide dot product by product of magnitudes.' },
        { expression: '\\phi = \\arccos(3/5) = \\arccos(0.6) \\approx 53.1°', annotation: 'Positive cosine → acute angle, as expected (dot product was positive).' },
      ],
      answer: `\\phi \\approx 53.1°`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Component dot product in 2D and 3D',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# 2D: multiply matching components, then sum
A2 = np.array([3.0, 4.0])
B2 = np.array([2.0, -1.0])
manual_2d = A2[0]*B2[0] + A2[1]*B2[1]   # 3*2 + 4*(-1) = 2
numpy_2d  = np.dot(A2, B2)
print(f"2D manual: {manual_2d},  np.dot: {numpy_2d}")

# 3D: same formula, one more term
A3 = np.array([1.0, 2.0, -2.0])
B3 = np.array([3.0, -4.0, 0.0])
manual_3d = A3[0]*B3[0] + A3[1]*B3[1] + A3[2]*B3[2]
numpy_3d  = np.dot(A3, B3)
print(f"3D manual: {manual_3d},  np.dot: {numpy_3d}")

# Self-dot = magnitude squared
A3_sq = np.dot(A3, A3)
print(f"\\nA3·A3 = {A3_sq}  (= |A3|²)")
print(f"|A3| from self-dot: {np.sqrt(A3_sq):.4f}")
print(f"|A3| from norm:     {np.linalg.norm(A3):.4f}  (same)")`,
          prose: [
            `The component formula is just three multiplications and a sum: $A_xB_x + A_yB_y + A_zB_z$. \`np.dot\` does this for any dimension — the formula extends to $n$ components by adding more terms.`,
            `The manual computation confirms what \`np.dot\` computes. In practice, always use \`np.dot\` (or the \`@\` operator for matrices) — it's faster and handles all dimensions automatically.`,
            `The self-dot $\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$ is the Pythagorean theorem. \`np.sqrt(np.dot(A, A))\` and \`np.linalg.norm(A)\` give the same answer — they compute the same formula.`,
          ],
        },
        {
          cellTitle: 'Visualising the component contributions',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

A = np.array([3.0, 4.0])
B = np.array([2.0, -1.0])

x_term = A[0] * B[0]   # 3 * 2 = 6
y_term = A[1] * B[1]   # 4 * (-1) = -4
total  = x_term + y_term  # 2

fig, axes = plt.subplots(1, 2, figsize=(11, 4))

# Left: bar chart showing each component's contribution
ax = axes[0]
bars = ax.bar(['x-term\\n(AxBx)', 'y-term\\n(AyBy)', 'Total\\n(dot)'],
              [x_term, y_term, total],
              color=['steelblue', 'tomato', 'seagreen'])
ax.axhline(0, color='k', lw=0.8)
for bar, val in zip(bars, [x_term, y_term, total]):
    ax.text(bar.get_x()+bar.get_width()/2, val + (0.2 if val >= 0 else -0.5),
            f'{val:.0f}', ha='center', fontsize=12, fontweight='bold')
ax.set_title(f'A=(3,4), B=(2,-1)\\nA·B = {total:.0f}', fontsize=11)
ax.set_ylabel('Value'); ax.grid(axis='y', alpha=0.3)

# Right: vector plot
ax2 = axes[1]
ax2.quiver(0,0,A[0],A[1], angles='xy', scale_units='xy', scale=1,
           color='steelblue', width=0.05, label='A=(3,4)')
ax2.quiver(0,0,B[0],B[1], angles='xy', scale_units='xy', scale=1,
           color='tomato', width=0.05, label='B=(2,-1)')
ax2.set_xlim(-1, 5); ax2.set_ylim(-2.5, 5)
ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3)
ax2.legend(); ax2.set_title(f'Vectors in 2D space')

plt.tight_layout(); plt.show()`,
          prose: [
            `The bar chart breaks the dot product into its component contributions. Here $x$-term = $+6$ and $y$-term = $-4$, summing to $+2$. The $y$-terms fight the $x$-terms but don't win — the dot product is still positive.`,
            `The vector plot shows both vectors in 2D space. They point somewhat in the same direction (acute angle), consistent with the positive dot product of 2.`,
            `This decomposition is key: when the dot product is close to zero, it often means the component terms nearly cancel — each axis contributes something but they largely offset each other. That's very different from both terms being zero.`,
          ],
        },
        {
          cellTitle: '3D dot product and orthogonality test',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Test all pairs from three 3D vectors for orthogonality
u = np.array([1.0, 2.0, 3.0])
v = np.array([4.0, -1.0, 2.0])
w = np.array([1.0, -5.0, 3.0])   # hand-crafted to be orthogonal to u

vectors = {'u': u, 'v': v, 'w': w}

print("Dot product table:")
print(f"{'':6}", end='')
for name in vectors:
    print(f"{name:>10}", end='')
print()

for n1, v1 in vectors.items():
    print(f"{n1:6}", end='')
    for n2, v2 in vectors.items():
        dp = np.dot(v1, v2)
        print(f"{dp:>10.1f}", end='')
    print()

print("\\nOrthogonal pairs (dot = 0):")
names = list(vectors.keys())
vecs  = list(vectors.values())
for i in range(len(names)):
    for j in range(i+1, len(names)):
        dp = np.dot(vecs[i], vecs[j])
        if np.isclose(dp, 0):
            print(f"  {names[i]}·{names[j]} = 0 → PERPENDICULAR")
        else:
            print(f"  {names[i]}·{names[j]} = {dp:.1f}")`,
          prose: [
            `The dot product table shows all pairwise dot products. The diagonal entries (self-dots) equal the magnitude squared of each vector: e.g., $\\vec{u}\\cdot\\vec{u} = 1+4+9 = 14 = |\\vec{u}|^2$.`,
            `Scanning for zero entries finds orthogonal pairs. $\\vec{u}\\cdot\\vec{w} = 1(1)+2(-5)+3(3) = 1-10+9 = 0$, confirming $\\vec{u}\\perp\\vec{w}$ even in 3D — you can't visualise this easily, but the component formula makes it algebraically immediate.`,
            `This orthogonality test is the foundation of the Gram-Schmidt process in Linear Algebra and of error-checking in signal processing: if two signals have dot product zero, they carry independent information.`,
          ],
        },
        {
          cellTitle: 'Challenge: 3D work calculation',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A 3D force acts on a particle
# F = (5, -2, 8) N
# d = (3, 6, -1) m
# Compute W = np.dot(F3, d3)

# F3 = np.array([___, ___, ___])
# d3 = np.array([___, ___, ___])
# W = np.dot(F3, d3)

# Then verify manually:
# W_manual = 5*3 + (-2)*6 + 8*(-1) = ?

# print both results`,
          prose: [
            `$W = \\vec{F}\\cdot\\vec{d} = F_xd_x + F_yd_y + F_zd_z$. Each term is the work done by one component of the force along the matching component of displacement. If a force component and displacement component have opposite signs, that term subtracts from total work.`,
            `Expected: $W = 5(3) + (-2)(6) + 8(-1) = 15 - 12 - 8 = -5$ J. The force does negative net work — two of its components oppose the displacement.`,
            `Always verify with the manual formula after using \`np.dot\` — the component breakdown shows exactly which terms contribute and why the result has a particular sign.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Component dot product in 2D and 3D',
          type: 'code',
          language: 'matlab',
          code: `% 2D dot product — manual vs built-in
A2 = [3.0, 4.0];
B2 = [2.0, -1.0];
manual_2d = A2(1)*B2(1) + A2(2)*B2(2);   % 3*2 + 4*(-1) = 2
matlab_2d = dot(A2, B2);
fprintf('2D  manual: %.1f,  dot(): %.1f\\n', manual_2d, matlab_2d);

% 3D dot product — same formula, one more term
A3 = [1.0, 2.0, -2.0];
B3 = [3.0, -4.0, 0.0];
manual_3d = A3(1)*B3(1) + A3(2)*B3(2) + A3(3)*B3(3);
matlab_3d = dot(A3, B3);
fprintf('3D  manual: %.1f,  dot(): %.1f\\n', manual_3d, matlab_3d);

% Self-dot = magnitude squared
A3_sq = dot(A3, A3);
fprintf('\\nA3·A3 = %.1f  (= |A3|^2)\\n', A3_sq);
fprintf('|A3| from self-dot: %.4f\\n', sqrt(A3_sq));
fprintf('|A3| from norm:     %.4f\\n', norm(A3));`,
          prose: [
            `MATLAB's \`dot(A, B)\` computes $A_xB_x + A_yB_y + A_zB_z$ for 2D and 3D vectors identically. Note 1-based indexing: \`A3(1)\` is $A_x$, \`A3(2)\` is $A_y$, \`A3(3)\` is $A_z$.`,
            `The manual formula and \`dot()\` give the same result — \`dot()\` is just a shorthand for the component sum. Use it in practice to avoid indexing errors.`,
            `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$: \`sqrt(dot(A3,A3))\` and \`norm(A3)\` both compute the Euclidean magnitude. They are the same calculation expressed two ways.`,
          ],
        },
        {
          cellTitle: 'Visualising component contributions',
          type: 'code',
          language: 'matlab',
          code: `A = [3, 4];
B = [2, -1];
x_term = A(1) * B(1);   % 6
y_term = A(2) * B(2);   % -4
total  = x_term + y_term; % 2

figure('Position', [100 100 900 350]);

% Bar chart of component contributions
subplot(1, 2, 1);
bar_vals = [x_term, y_term, total];
bar(bar_vals, 'FaceColor', 'flat', 'CData', [0.3 0.5 0.8; 0.9 0.3 0.2; 0.2 0.7 0.4]);
hold on; yline(0, 'k', 'LineWidth', 0.8);
set(gca, 'XTickLabel', {'AxBx', 'AyBy', 'Total'});
title(sprintf('A=(3,4), B=(2,-1)\\nA·B = %g', total));
ylabel('Value'); grid on;
text(1, x_term+0.3, num2str(x_term), 'HorizontalAlignment','center','FontWeight','bold');
text(2, y_term-0.5, num2str(y_term), 'HorizontalAlignment','center','FontWeight','bold');
text(3, total+0.3, num2str(total),   'HorizontalAlignment','center','FontWeight','bold');

% Vector plot
subplot(1, 2, 2);
quiver(0,0,A(1),A(2), 0, 'b', 'LineWidth', 2); hold on;
quiver(0,0,B(1),B(2), 0, 'r', 'LineWidth', 2);
xlim([-1 5]); ylim([-2.5 5]);
axis equal; grid on;
legend('A=(3,4)', 'B=(2,-1)', 'Location', 'northwest');
title('Vectors in 2D space');`,
          prose: [
            `The bar chart shows each component's signed contribution to the dot product. The $x$-term $= +6$ and $y$-term $= -4$ sum to $+2$. You can read the sign of the dot product directly from which bars dominate.`,
            `The vector plot shows the two vectors in 2D. Both point generally rightward and they form an acute angle, consistent with the positive dot product.`,
            `\`bar(..., 'CData', ...)\` assigns custom colours to each bar via the \`flat\` FaceColor option. \`yline(0)\` adds the zero reference line. \`text(...)\` labels each bar with its value.`,
          ],
        },
        {
          cellTitle: '3D dot product and orthogonality test',
          type: 'code',
          language: 'matlab',
          code: `u = [1, 2, 3];
v = [4, -1, 2];
w = [1, -5, 3];   % orthogonal to u

vecs = {u, v, w};
names = {'u', 'v', 'w'};

fprintf('Dot product table:\\n');
fprintf('%6s', '');
for k = 1:3; fprintf('%10s', names{k}); end
fprintf('\\n');

for i = 1:3
    fprintf('%6s', names{i});
    for j = 1:3
        dp = dot(vecs{i}, vecs{j});
        fprintf('%10.1f', dp);
    end
    fprintf('\\n');
end

fprintf('\\nOrthogonal pairs (dot = 0):\\n');
for i = 1:3
    for j = i+1:3
        dp = dot(vecs{i}, vecs{j});
        if abs(dp) < 1e-10
            fprintf('  %s·%s = 0  -> PERPENDICULAR\\n', names{i}, names{j});
        else
            fprintf('  %s·%s = %.1f\\n', names{i}, names{j}, dp);
        end
    end
end`,
          prose: [
            `The nested loop builds a 3×3 dot product table. Diagonal entries are self-dots (magnitudes squared): $\\vec{u}\\cdot\\vec{u} = 1+4+9 = 14 = |\\vec{u}|^2$.`,
            `Scanning for zero off-diagonal entries finds orthogonal pairs. $\\vec{u}\\cdot\\vec{w} = 1-10+9 = 0$, so $\\vec{u}\\perp\\vec{w}$. MATLAB's cell array \`{u, v, w}\` lets you loop over multiple vectors cleanly.`,
            `\`abs(dp) < 1e-10\` handles floating-point near-zero comparisons. Never compare floats with \`== 0\` — use a tolerance. This is a critical programming habit for all numerical work.`,
          ],
        },
        {
          cellTitle: 'Challenge: 3D work calculation',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% A 3D force acts on a particle
% F = (5, -2, 8) N
% d = (3, 6, -1) m
% Compute W = dot(F3, d3)

% F3 = [___, ___, ___];
% d3 = [___, ___, ___];
% W = dot(F3, d3);

% Verify manually: 5*3 + (-2)*6 + 8*(-1) = ?

% fprintf('W = %.1f J\\n', W)`,
          prose: [
            `$W = \\vec{F}\\cdot\\vec{d} = F_xd_x + F_yd_y + F_zd_z$. The three-term formula gives the net work done when force has components in all three directions.`,
            `Expected: $W = 5(3) + (-2)(6) + 8(-1) = 15-12-8 = -5$ J. Negative work means the force takes energy from the particle — two of its three component contributions fight the displacement.`,
            `After computing with \`dot\`, verify with the manual formula to build the habit of checking component-by-component. The manual breakdown shows exactly which terms drive the sign.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-011-q1',
      type: 'choice',
      question: `$\\vec{A} = (1, 2, 3)$, $\\vec{B} = (4, 5, 6)$. What is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$15$`, `$32$`, `$90$`, `$27$`],
      answer: `$32$`,
      hints: [
        'Use the 3D formula: $A_xB_x + A_yB_y + A_zB_z$.',
        '$1\\cdot4 = 4$, $2\\cdot5 = 10$, $3\\cdot6 = 18$. Sum them.',
      ],
      reviewSection: 'intuition',
      explanation: `$(1)(4)+(2)(5)+(3)(6) = 4+10+18 = 32$.`,
    },
    {
      id: 'p1-ch1-011-q2',
      type: 'choice',
      question: `$\\vec{A} = (3, 4)$. What is $\\vec{A}\\cdot\\vec{A}$?`,
      options: [`$7$`, `$12$`, `$25$`, `$5$`],
      answer: `$25$`,
      hints: [
        'Self-dot: multiply each component by itself, then sum.',
        '$3^2 + 4^2 = ?$',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot\\vec{A} = 3^2+4^2 = 9+16 = 25 = |\\vec{A}|^2$.`,
    },
    {
      id: 'p1-ch1-011-q3',
      type: 'choice',
      question: `$(3\\vec{A})\\cdot\\vec{B}$ equals:`,
      options: [`$3(\\vec{A}\\cdot\\vec{B})$`, `$\\vec{A}\\cdot(3\\vec{B})$`, `Both of the above`, `Neither`],
      answer: `Both of the above`,
      hints: [
        'Try the component formula: $(3A_x)B_x + (3A_y)B_y = 3(A_xB_x + A_yB_y)$.',
        'Scalars can be factored out of either side of the dot product.',
      ],
      reviewSection: 'math',
      explanation: `Scalar multiplication is associative with the dot product: $(c\\vec{A})\\cdot\\vec{B} = c(\\vec{A}\\cdot\\vec{B}) = \\vec{A}\\cdot(c\\vec{B})$. Both A and B are correct.`,
    },
    {
      id: 'p1-ch1-011-q4',
      type: 'choice',
      question: `The dot product formula $\\vec{A}\\cdot\\vec{B} = A_xB_x+A_yB_y+A_zB_z$ works because:`,
      options: [
        `Vectors are always perpendicular`,
        `Basis vectors $\\hat{i}, \\hat{j}, \\hat{k}$ are orthonormal: cross-terms vanish`,
        `Components are always positive`,
        `Addition is commutative`,
      ],
      answer: `Basis vectors $\\hat{i}, \\hat{j}, \\hat{k}$ are orthonormal: cross-terms vanish`,
      hints: [
        'Expand $(A_x\\hat{i}+A_y\\hat{j})\\cdot(B_x\\hat{i}+B_y\\hat{j})$ using FOIL.',
        'What is $\\hat{i}\\cdot\\hat{j}$? What is $\\hat{i}\\cdot\\hat{i}$?',
      ],
      reviewSection: 'rigor',
      explanation: `The FOIL expansion produces 9 terms (in 3D). The 6 cross-terms ($\\hat{i}\\cdot\\hat{j}$ etc.) are zero because the basis is orthogonal. The 3 self-terms ($\\hat{i}\\cdot\\hat{i}=1$) give the matching component products.`,
    },
    {
      id: 'p1-ch1-011-q5',
      type: 'choice',
      question: `$\\hat{i}\\cdot\\hat{j} = ?$`,
      options: [`$1$`, `$0$`, `$-1$`, `$\\hat{k}$`],
      answer: `$0$`,
      hints: [
        '$\\hat{i}$ and $\\hat{j}$ are perpendicular unit vectors.',
        'What does the geometric formula give for $\\phi = 90°$?',
      ],
      reviewSection: 'math',
      explanation: `$\\hat{i}$ and $\\hat{j}$ are perpendicular unit vectors. Their dot product is $|\\hat{i}||\\hat{j}|\\cos90° = 1\\cdot1\\cdot0 = 0$.`,
    },
    {
      id: 'p1-ch1-011-q6',
      type: 'choice',
      question: `$\\vec{A}\\cdot(\\vec{B}+\\vec{C})$ equals:`,
      options: [
        `$(\\vec{A}\\cdot\\vec{B})(\\vec{A}\\cdot\\vec{C})$`,
        `$\\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$`,
        `$\\vec{A}\\cdot\\vec{B} - \\vec{A}\\cdot\\vec{C}$`,
        `Undefined`,
      ],
      answer: `$\\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$`,
      hints: [
        'This is the distributive property — the same one that works for scalars.',
        'Try with the component formula: $A_x(B_x+C_x) = A_xB_x + A_xC_x$.',
      ],
      reviewSection: 'math',
      explanation: `The dot product distributes over addition: $\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$.`,
    },
    {
      id: 'p1-ch1-011-q7',
      type: 'choice',
      question: `If $\\vec{A} = (1,0,0)$ and $\\vec{B} = (0,0,1)$, what is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$1$`, `$0$`, `$-1$`, `$\\sqrt{2}$`],
      answer: `$0$`,
      hints: [
        'Apply $A_xB_x + A_yB_y + A_zB_z$ term by term.',
        'These are $\\hat{i}$ and $\\hat{k}$ — are they parallel or perpendicular?',
      ],
      reviewSection: 'intuition',
      explanation: `$(1)(0)+(0)(0)+(0)(1) = 0$. $\\hat{i}$ and $\\hat{k}$ are perpendicular — their dot product is zero.`,
    },
    {
      id: 'p1-ch1-011-q8',
      type: 'choice',
      question: `A 3D vector has components $(2, -3, 6)$. What is its magnitude from the self-dot formula?`,
      options: [`$5$`, `$7$`, `$11$`, `$49$`],
      answer: `$7$`,
      hints: [
        '$|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}} = \\sqrt{A_x^2+A_y^2+A_z^2}$.',
        '$2^2 + (-3)^2 + 6^2 = 4 + 9 + 36 = ?$',
      ],
      reviewSection: 'examples',
      explanation: `$|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}} = \\sqrt{4+9+36} = \\sqrt{49} = 7$.`,
    },
    {
      id: 'p1-ch1-011-q9',
      type: 'choice',
      question: `$\\vec{A} = (3, 4, 0)$ and $\\vec{B} = (-4, 3, 7)$. What is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$0$`, `$-12$`, `$12$`, `$-5$`],
      answer: `$0$`,
      hints: [
        'Apply $A_xB_x + A_yB_y + A_zB_z$ term by term.',
        'Compute $x$-term and $y$-term separately before summing — watch the signs.',
      ],
      reviewSection: 'challenges',
      explanation: `$(3)(-4)+(4)(3)+(0)(7) = -12+12+0 = 0$. The vectors are perpendicular despite having non-zero components in two and three dimensions respectively.`,
    },
    {
      id: 'p1-ch1-011-q10',
      type: 'choice',
      question: `Which statement about the component dot product formula is true?`,
      options: [
        `It only works in 2D`,
        `It requires knowing the angle between the vectors`,
        `It extends to any number of dimensions by adding more component products`,
        `It gives a different answer than the geometric formula $|A||B|\\cos\\phi$`,
      ],
      answer: `It extends to any number of dimensions by adding more component products`,
      hints: [
        'The formula is $\\sum_{i=1}^n A_iB_i$ — does this limit to any particular $n$?',
        'Compare how the formula changes going from 2D to 3D to $n$D.',
      ],
      reviewSection: 'rigor',
      explanation: `The component formula $\\vec{A}\\cdot\\vec{B} = \\sum_{i=1}^n A_iB_i$ works in any dimension — just add more terms. It gives exactly the same result as $|A||B|\\cos\\phi$ (the two formulas are equivalent), and it requires no angle.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-011-m1',
      wrong: 'You can compute the 3D dot product by using only $A_xB_x + A_yB_y$ and ignoring the $z$-components.',
      correction: 'All three terms are required: $A_xB_x + A_yB_y + A_zB_z$. Dropping the $z$-term gives a wrong answer unless $A_z = 0$ or $B_z = 0$. For example, $\\vec{A}=(1,0,3)$ and $\\vec{B}=(1,0,-3)$ give a dot product of $1+0-9=-8$, not $1+0=1$.',
      correctionExample: '$\\vec{A}=(1,0,3),\\;\\vec{B}=(1,0,-3):\\quad$ 2D formula gives $1$, correct 3D formula gives $1+0-9=-8$',
    },
    {
      id: 'p1-ch1-011-m2',
      wrong: 'If $\\vec{A}\\cdot\\vec{B} > 0$, then all individual component products $A_xB_x$, $A_yB_y$, $A_zB_z$ must be positive.',
      correction: 'The dot product is the sum of the component products. Individual terms can be negative as long as they don\'t overcome the positive terms. For $\\vec{A}=(3,4)$ and $\\vec{B}=(2,-1)$: $A_xB_x=6$ (positive) and $A_yB_y=-4$ (negative), yet $\\vec{A}\\cdot\\vec{B}=2>0$.',
      correctionExample: '$\\vec{A}=(3,4),\\;\\vec{B}=(2,-1):\\quad A_xB_x=+6,\\;A_yB_y=-4,\\;$ total $= +2 > 0$',
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-011-t1',
      prompt: `The formula $\\vec{A}\\cdot\\vec{B} = \\sum_{i=1}^n A_iB_i$ works for $n$-dimensional vectors. In data science, a data point might be a 1000-dimensional vector (one component per feature). What does the dot product between two data points measure, and why is it used in machine learning similarity metrics?`,
    },
    {
      id: 'p1-ch1-011-t2',
      prompt: `In MATLAB and NumPy, the expression \`A @ B\` (or \`A' * B\` in MATLAB) computes the same result as \`dot(A, B)\` for column vectors. What does the \`@\` (matrix multiplication) operator have to do with the dot product formula $A_xB_x + A_yB_y + A_zB_z$?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-011-d1',
      buggyCode: `A = [1, 2, 3]
B = [4, 5, 6]
dot_product = A[0]*B[0] + A[1]*B[1]   # forgot z-term
print(dot_product)  # prints 14 instead of 32`,
      language: 'python',
      issue: 'For 3D vectors the formula needs all three terms: $A_xB_x + A_yB_y + A_zB_z$. The code drops the $z$-term, giving 14 instead of the correct 32.',
      fix: `import numpy as np
A = np.array([1, 2, 3])
B = np.array([4, 5, 6])
dot_product = np.dot(A, B)   # handles any dimension automatically
print(dot_product)  # 4+10+18 = 32`,
    },
    {
      id: 'p1-ch1-011-d2',
      buggyCode: `import numpy as np
A = np.array([3, 4])
B = np.array([2, -1])
result = A * B       # element-wise, NOT dot product
print(result)        # prints [6, -4], not 2`,
      language: 'python',
      issue: '`A * B` with NumPy arrays is element-wise multiplication — it returns `[6, -4]`, not the dot product 2. You need `np.dot(A, B)` or `A @ B`.',
      fix: `import numpy as np
A = np.array([3, 4])
B = np.array([2, -1])
result = np.dot(A, B)   # or: result = A @ B
print(result)           # 2 — the scalar dot product`,
    },
  ],

  mastery: {
    targetLevel: 'You can apply the component formula in 2D and 3D, use self-dot to find magnitudes, prove properties algebraically, and identify perpendicular vectors using the zero dot product test.',
    prerequisites: ['Dot product geometric definition: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$', 'Unit vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$ and their orthonormality'],
    unlocks: ['Finding the angle between vectors: $\\cos\\phi = \\vec{A}\\cdot\\vec{B}/(|A||B|)$', 'Scalar and vector projection', 'Matrix–vector multiplication as generalised dot products'],
    checkpoints: [
      'Can compute $\\vec{A}\\cdot\\vec{B}$ for 2D and 3D vectors using the component formula without making sign errors',
      'Can use $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$ to find magnitudes',
      'Can prove the distributive property $\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B}+\\vec{A}\\cdot\\vec{C}$ from the component formula',
      'Can test two vectors for perpendicularity by checking if their dot product is zero',
    ],
  },

  semantics: {
    core: [
      { symbol: 'A_xB_x + A_yB_y + A_zB_z', meaning: 'Component dot product formula — multiply matching components and sum; no angle required' },
      { symbol: '\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2', meaning: 'Self-dot gives magnitude squared — the Pythagorean theorem in dot product form' },
      { symbol: '\\hat{\\imath}\\cdot\\hat{\\jmath} = 0', meaning: 'Basis vectors are orthogonal — this is why cross-terms vanish in the derivation' },
      { symbol: '\\hat{\\imath}\\cdot\\hat{\\imath} = 1', meaning: 'Basis vectors are unit length — this is why matching terms survive as coefficient products' },
      { symbol: '\\mathbf{A}^T\\mathbf{B}', meaning: 'Matrix notation for dot product — connects to matrix multiplication in Linear Algebra' },
    ],
    rulesOfThumb: [
      'In 3D, forget the $z$-term and you get a wrong answer — always check that all three component pairs are included.',
      'Use `np.dot(A, B)` or MATLAB\'s `dot(A, B)` in code — never accumulate component products manually in a loop.',
      'Zero dot product means perpendicular — regardless of what the individual components look like.',
      'The self-dot $\\vec{A}\\cdot\\vec{A}$ and the formula $A_x^2+A_y^2+A_z^2$ compute the same thing — one notation, two writings.',
      'The component formula generalises to any dimension $n$: just sum $n$ component products. This is why NumPy and MATLAB work on vectors of any size.',
    ],
  },
}
