export default {
  id: 'la4-005',
  slug: 'inner-product-spaces',
  chapter: 'la4',
  order: 5,
  title: 'Inner Product Spaces',
  subtitle: 'The dot product is just one example of an inner product. Any function that measures angle and length in a way that satisfies three properties generates a complete geometry — distance, angle, projection, and orthogonality.',
  tags: ['inner product', 'inner product space', 'norm', 'Cauchy-Schwarz', 'orthogonality', 'Gram-Schmidt', 'function space', 'Hilbert space'],
  aliases: 'inner product space norm Cauchy-Schwarz inequality orthogonality Gram-Schmidt Hilbert space function space bilinear',

  hook: {
    question: "The dot product measures angles and lengths in $\\mathbb{R}^n$. But what about polynomials, functions, or matrices — can we define angles and orthogonality there too?",
    realWorldContext: "Inner product spaces unify geometry across wildly different settings. Quantum mechanics is formulated in a complex inner product space (Hilbert space): the inner product gives the probability amplitude between quantum states. Signal processing uses the inner product on function spaces: $\\langle f, g \\rangle = \\int f(t)g(t)\\,dt$ measures how much two signals share. Statistics uses weighted inner products to account for unequal variances. Fourier series work because trig functions form an orthonormal basis in a function inner product space. Understanding the abstract inner product means understanding all of these at once.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**What an inner product is.** An inner product on a vector space $V$ is a function $\\langle \\cdot, \\cdot \\rangle: V \\times V \\to \\mathbb{R}$ (or $\\mathbb{C}$) that satisfies three properties: (1) **Symmetry**: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\langle \\mathbf{v}, \\mathbf{u} \\rangle$; (2) **Linearity in the first argument**: $\\langle c\\mathbf{u} + \\mathbf{w}, \\mathbf{v} \\rangle = c\\langle \\mathbf{u}, \\mathbf{v} \\rangle + \\langle \\mathbf{w}, \\mathbf{v} \\rangle$; (3) **Positive definiteness**: $\\langle \\mathbf{v}, \\mathbf{v} \\rangle > 0$ for all $\\mathbf{v} \\neq \\mathbf{0}$.',
      '**The standard dot product.** On $\\mathbb{R}^n$: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\mathbf{u}^\\top \\mathbf{v} = \\sum_{i=1}^n u_i v_i$. This is the canonical example. The norm it induces is $\\|\\mathbf{v}\\| = \\sqrt{\\langle \\mathbf{v}, \\mathbf{v} \\rangle} = \\sqrt{\\sum v_i^2}$ — Euclidean length.',
      '**A weighted inner product.** On $\\mathbb{R}^n$ with positive weights $w_1, \\ldots, w_n$: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\sum w_i u_i v_i = \\mathbf{u}^\\top W \\mathbf{v}$ where $W = \\text{diag}(w_1, \\ldots, w_n)$. This inner product arises in statistics (weighted least squares) and finite elements (energy-based norms).',
      '**Inner products on function spaces.** On the space of continuous functions $C[a,b]$: $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$. Two functions are orthogonal if this integral is zero. This makes the sine and cosine functions of different frequencies orthogonal — the basis for Fourier series.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz Inequality',
        body: '|\\langle \\mathbf{u}, \\mathbf{v} \\rangle| \\leq \\|\\mathbf{u}\\| \\cdot \\|\\mathbf{v}\\|\n\nEquality holds iff $\\mathbf{u}$ and $\\mathbf{v}$ are linearly dependent (one is a scalar multiple of the other). This is the universal law of angles: the cosine of the angle between $\\mathbf{u}$ and $\\mathbf{v}$ is $\\cos\\theta = \\langle \\mathbf{u}, \\mathbf{v} \\rangle / (\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|) \\in [-1, 1]$.',
      },
      {
        type: 'insight',
        title: 'From Inner Product to Geometry',
        body: '**Norm:** $\\|\\mathbf{v}\\| = \\sqrt{\\langle \\mathbf{v}, \\mathbf{v} \\rangle}$\n**Distance:** $d(\\mathbf{u}, \\mathbf{v}) = \\|\\mathbf{u} - \\mathbf{v}\\|$\n**Angle:** $\\cos\\theta = \\langle \\mathbf{u}, \\mathbf{v} \\rangle / (\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$\n**Orthogonality:** $\\mathbf{u} \\perp \\mathbf{v}$ iff $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = 0$\n**Projection:** $\\text{proj}_{\\mathbf{v}} \\mathbf{u} = \\frac{\\langle \\mathbf{u}, \\mathbf{v} \\rangle}{\\langle \\mathbf{v}, \\mathbf{v} \\rangle} \\mathbf{v}$',
      },
      {
        type: 'insight',
        title: 'Gram-Schmidt in an Inner Product Space',
        body: 'Gram-Schmidt works in any inner product space. Given linearly independent $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$, produce orthonormal $\\{\\mathbf{q}_1, \\ldots, \\mathbf{q}_k\\}$ using the same algorithm — just replace the dot product with $\\langle \\cdot, \\cdot \\rangle$ throughout.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Inner Products and Norms',
        mathBridge: 'Compute standard and weighted inner products; verify Cauchy-Schwarz.',
        caption: 'Different inner products define different geometries on the same vector space.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Standard vs weighted inner products',
              prose: ['Compare the geometry induced by two different inner products on R^2.'],
              code: `u = [3; 1]
v = [1; 2]

% Standard inner product
ip_standard = u' * v
norm_u_std = norm(u)
norm_v_std = norm(v)
cos_theta_std = ip_standard / (norm_u_std * norm_v_std)

% Weighted inner product with W = diag(1, 4)
W = diag([1, 4])
ip_weighted = u' * W * v
norm_u_w = sqrt(u' * W * u)
norm_v_w = sqrt(v' * W * v)
cos_theta_w = ip_weighted / (norm_u_w * norm_v_w)
disp('Different geometries from different inner products:')
disp(['Standard angle (deg): ' num2str(acos(cos_theta_std)*180/pi)])
disp(['Weighted angle (deg): ' num2str(acos(real(cos_theta_w))*180/pi)])
`,
            },
            {
              id: 2,
              cellTitle: 'Cauchy-Schwarz verification',
              prose: ['Verify |<u,v>| <= ||u|| * ||v|| for several vector pairs.'],
              code: `% Test many random pairs
n = 100;
violations = 0;
for i = 1:100
  u = randn(n, 1);
  v = randn(n, 1);
  lhs = abs(u' * v);
  rhs = norm(u) * norm(v);
  if lhs > rhs + 1e-9
    violations = violations + 1;
  end
end
disp('Cauchy-Schwarz violations (should be 0):')
violations

% Equality case: parallel vectors
u = [1; 2; 3]
v = 3 * u
lhs = abs(u' * v)
rhs = norm(u) * norm(v)
disp('Equality when v = 3u: lhs == rhs?')
abs(lhs - rhs) < 1e-9
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Abstract definition.** An **inner product space** is a vector space $V$ over $\mathbb{F}$ (real or complex) equipped with a map $\\langle \\cdot, \\cdot \\rangle: V \\times V \\to \\mathbb{F}$ satisfying: (1) conjugate symmetry: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\overline{\\langle \\mathbf{v}, \\mathbf{u} \\rangle}$; (2) linearity in first argument; (3) positive definiteness. A complete inner product space (where every Cauchy sequence converges) is a **Hilbert space**.',
      '**Proof of Cauchy-Schwarz.** For any $t \\in \\mathbb{R}$: $0 \\leq \\|\\mathbf{u} - t\\mathbf{v}\\|^2 = \\langle \\mathbf{u}, \\mathbf{u} \\rangle - 2t\\langle \\mathbf{u}, \\mathbf{v} \\rangle + t^2 \\langle \\mathbf{v}, \\mathbf{v} \\rangle$. This quadratic in $t$ is always non-negative, so its discriminant is non-positive: $4\\langle \\mathbf{u}, \\mathbf{v} \\rangle^2 - 4\\langle \\mathbf{u}, \\mathbf{u} \\rangle \\langle \\mathbf{v}, \\mathbf{v} \\rangle \\leq 0$, giving $|\\langle \\mathbf{u}, \\mathbf{v} \\rangle|^2 \\leq \\|\\mathbf{u}\\|^2 \\|\\mathbf{v}\\|^2$.',
      '**Triangle inequality.** From Cauchy-Schwarz: $\\|\\mathbf{u} + \\mathbf{v}\\|^2 = \\|\\mathbf{u}\\|^2 + 2\\langle \\mathbf{u}, \\mathbf{v} \\rangle + \\|\\mathbf{v}\\|^2 \\leq \\|\\mathbf{u}\\|^2 + 2\\|\\mathbf{u}\\|\\|\\mathbf{v}\\| + \\|\\mathbf{v}\\|^2 = (\\|\\mathbf{u}\\| + \\|\\mathbf{v}\\|)^2$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Parallelogram Law',
        body: 'A norm $\\|\\cdot\\|$ comes from an inner product iff it satisfies the parallelogram law:\n$\\|\\mathbf{u} + \\mathbf{v}\\|^2 + \\|\\mathbf{u} - \\mathbf{v}\\|^2 = 2(\\|\\mathbf{u}\\|^2 + \\|\\mathbf{v}\\|^2)$\nThe $L^1$ and $L^\\infty$ norms do NOT satisfy this — they cannot come from any inner product.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Hilbert spaces.** An inner product space that is complete (every Cauchy sequence converges) is a Hilbert space. $\\mathbb{R}^n$ and $\\mathbb{C}^n$ are finite-dimensional Hilbert spaces. The space $L^2[a,b]$ of square-integrable functions (with $\\langle f, g \\rangle = \\int_a^b f\\bar{g}$) is an infinite-dimensional Hilbert space. The Riesz representation theorem states that every continuous linear functional on a Hilbert space $H$ has the form $f(\\mathbf{v}) = \\langle \\mathbf{v}, \\mathbf{w} \\rangle$ for some unique $\\mathbf{w} \\in H$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Orthonormal Bases in Hilbert Spaces',
        body: 'In a Hilbert space with orthonormal basis $\\{\\mathbf{e}_k\\}$: every vector $\\mathbf{v} = \\sum_k \\langle \\mathbf{v}, \\mathbf{e}_k \\rangle \\mathbf{e}_k$ (Fourier expansion). The coefficients $\\langle \\mathbf{v}, \\mathbf{e}_k \\rangle$ are the Fourier coefficients. Parseval\'s identity: $\\|\\mathbf{v}\\|^2 = \\sum_k |\\langle \\mathbf{v}, \\mathbf{e}_k \\rangle|^2$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-005-1',
      title: 'Function orthogonality',
      problem: 'Show that $f(x) = \\sin(x)$ and $g(x) = \\cos(x)$ are orthogonal on $[-\\pi, \\pi]$ using $\\langle f, g \\rangle = \\int_{-\\pi}^{\\pi} f(x)g(x)\\,dx$.',
      solution: '$\\int_{-\\pi}^{\\pi} \\sin(x)\\cos(x)\\,dx = \\frac{1}{2}\\int_{-\\pi}^{\\pi} \\sin(2x)\\,dx = \\frac{1}{2}\\left[-\\frac{\\cos(2x)}{2}\\right]_{-\\pi}^{\\pi} = 0$. So $\\sin \\perp \\cos$ in this function space.',
    },
  ],

  challenges: [
    {
      id: 'ch-la4-005-1',
      title: 'Gram-Schmidt in polynomial space',
      difficulty: 'medium',
      prompt: 'Apply Gram-Schmidt to $\\{1, x, x^2\\}$ with inner product $\\langle p, q \\rangle = \\int_{-1}^{1} p(x)q(x)\\,dx$ to produce an orthonormal basis of polynomials up to degree 2.',
      hint: 'These are related to the Legendre polynomials $P_0, P_1, P_2$.',
      solution: '$q_1 = 1/\\sqrt{2}$; $q_2 = x\\sqrt{3/2}$; $q_3 = (3x^2 - 1)/2 \\cdot \\sqrt{5/2}$ (normalized Legendre polynomials).',
    },
  ],

  mentalModel: [
    'An inner product is any function that measures "how aligned" two vectors are — with the dot product as the standard case.',
    'Any inner product induces a norm, distance, angle, and orthogonality.',
    'Cauchy-Schwarz: $|\\langle u,v \\rangle| \\leq \\|u\\|\\|v\\|$ — the cosine of angle is always between -1 and 1.',
    'Gram-Schmidt, projection, and orthogonal complements all work the same way in any inner product space.',
  ],

  checkpoints: [
    { id: 'cp-la4-005-1', question: 'What three properties define an inner product?', answer: 'Symmetry, linearity in first argument, positive definiteness.' },
    { id: 'cp-la4-005-2', question: 'When does equality hold in Cauchy-Schwarz?', answer: 'When $\\mathbf{u}$ and $\\mathbf{v}$ are linearly dependent (parallel).' },
    { id: 'cp-la4-005-3', question: 'What is the inner product of $\\sin(x)$ and $\\cos(x)$ on $[-\\pi, \\pi]$?', answer: '0 — they are orthogonal.' },
  ],

  assessment: 'Define an inner product on $\\mathbb{R}^2$ different from the dot product. Verify all three axioms, and find two non-zero vectors that are orthogonal under your inner product but not under the dot product.',

  quiz: [
    { id: 'q-la4-005-1', question: 'Which property is NOT required of an inner product?', options: ['Positive definiteness', 'Symmetry', 'Linearity in first arg', 'Associativity'], answer: 'Associativity' },
    { id: 'q-la4-005-2', question: 'Cauchy-Schwarz inequality states:', options: ['$\\|\\mathbf{u}+\\mathbf{v}\\| \\leq \\|\\mathbf{u}\\|+\\|\\mathbf{v}\\|$', '$|\\langle\\mathbf{u},\\mathbf{v}\\rangle| \\leq \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$', '$\\langle\\mathbf{u},\\mathbf{v}\\rangle = \\langle\\mathbf{v},\\mathbf{u}\\rangle$', '$\\|\\mathbf{u}\\| = \\|\\mathbf{v}\\|$'], answer: '$|\\langle\\mathbf{u},\\mathbf{v}\\rangle| \\leq \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$' },
    { id: 'q-la4-005-3', question: 'A complete inner product space is called:', options: ['Banach space', 'Hilbert space', 'Normed space', 'Metric space'], answer: 'Hilbert space' },
  ],
};
