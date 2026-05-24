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
      '**CNC and signal processing applications.** In CNC machining, vibration sensors record acceleration signals $f(t)$ during cutting. To detect **chatter**, engineers compute the inner product $\\langle f, \\sin(\\omega_{\\text{chatter}} t) \\rangle = \\int_0^T f(t)\\sin(\\omega t)\\,dt$ — if this is large, the cutting force contains that frequency. This is exactly the Fourier coefficient: how much of the chatter basis function lives in the measured signal. In **finite element analysis** for CNC frame design, the stiffness matrix entries are $K_{ij} = \\int_{\\Omega} \\nabla\\phi_i \\cdot \\nabla\\phi_j\\,d\\Omega$ — an inner product of basis function gradients over the material domain. The weighted inner product appears in **weighted least squares**, where measurement noise with unequal variance $\\sigma_i^2$ gets inner product weights $w_i = 1/\\sigma_i^2$ so that precise measurements count more.',
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
      '**Abstract definition.** An **inner product space** is a vector space $V$ over $\\mathbb{F}$ (real or complex) equipped with a map $\\langle \\cdot, \\cdot \\rangle: V \\times V \\to \\mathbb{F}$ satisfying: (1) conjugate symmetry: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\overline{\\langle \\mathbf{v}, \\mathbf{u} \\rangle}$; (2) linearity in first argument; (3) positive definiteness. A complete inner product space (where every Cauchy sequence converges) is a **Hilbert space**.',
      '**Proof of Cauchy-Schwarz.** For any $t \\in \\mathbb{R}$: $0 \\leq \\|\\mathbf{u} - t\\mathbf{v}\\|^2 = \\langle \\mathbf{u}, \\mathbf{u} \\rangle - 2t\\langle \\mathbf{u}, \\mathbf{v} \\rangle + t^2 \\langle \\mathbf{v}, \\mathbf{v} \\rangle$. This quadratic in $t$ is always non-negative, so its discriminant is non-positive: $4\\langle \\mathbf{u}, \\mathbf{v} \\rangle^2 - 4\\langle \\mathbf{u}, \\mathbf{u} \\rangle \\langle \\mathbf{v}, \\mathbf{v} \\rangle \\leq 0$, giving $|\\langle \\mathbf{u}, \\mathbf{v} \\rangle|^2 \\leq \\|\\mathbf{u}\\|^2 \\|\\mathbf{v}\\|^2$.',
      '**Triangle inequality.** From Cauchy-Schwarz: $\\|\\mathbf{u} + \\mathbf{v}\\|^2 = \\|\\mathbf{u}\\|^2 + 2\\langle \\mathbf{u}, \\mathbf{v} \\rangle + \\|\\mathbf{v}\\|^2 \\leq \\|\\mathbf{u}\\|^2 + 2\\|\\mathbf{u}\\|\\|\\mathbf{v}\\| + \\|\\mathbf{v}\\|^2 = (\\|\\mathbf{u}\\| + \\|\\mathbf{v}\\|)^2$.',
      '**Orthogonal complement.** Given a subspace $W \\subseteq V$, its orthogonal complement is $W^\\perp = \\{\\mathbf{v} \\in V : \\langle \\mathbf{v}, \\mathbf{w} \\rangle = 0 \\text{ for all } \\mathbf{w} \\in W\\}$. The orthogonal decomposition theorem guarantees that every $\\mathbf{v} \\in V$ can be written uniquely as $\\mathbf{v} = \\mathbf{w} + \\mathbf{w}^\\perp$ where $\\mathbf{w} \\in W$ and $\\mathbf{w}^\\perp \\in W^\\perp$. This is the abstract foundation for projection: the best approximation in $W$ is the projection $\\mathbf{w} = \\text{proj}_W \\mathbf{v}$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Parallelogram Law',
        body: 'A norm $\\|\\cdot\\|$ comes from an inner product iff it satisfies the parallelogram law:\n$\\|\\mathbf{u} + \\mathbf{v}\\|^2 + \\|\\mathbf{u} - \\mathbf{v}\\|^2 = 2(\\|\\mathbf{u}\\|^2 + \\|\\mathbf{v}\\|^2)$\nThe $L^1$ and $L^\\infty$ norms do NOT satisfy this — they cannot come from any inner product.',
      },
      {
        type: 'definition',
        title: 'Common Inner Products',
        body: '**Euclidean:** $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\mathbf{u}^\\top \\mathbf{v}$ on $\\mathbb{R}^n$\n**Weighted:** $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\mathbf{u}^\\top W \\mathbf{v}$, $W = W^\\top \\succ 0$\n**Complex:** $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\mathbf{u}^* \\mathbf{v}$ on $\\mathbb{C}^n$ (conjugate transpose)\n**Function:** $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$ on $C[a,b]$\n**Matrix:** $\\langle A, B \\rangle = \\text{tr}(A^\\top B)$ on $M_{m \\times n}$',
      },
      {
        type: 'insight',
        title: 'Orthogonal Decomposition',
        body: 'For any subspace $W$ in an inner product space:\n$V = W \\oplus W^\\perp$\nEvery vector decomposes uniquely as $\\mathbf{v} = \\underbrace{\\text{proj}_W \\mathbf{v}}_{\\in W} + \\underbrace{(\\mathbf{v} - \\text{proj}_W \\mathbf{v})}_{\\in W^\\perp}$\nThe projection $\\text{proj}_W \\mathbf{v}$ minimizes distance: $\\|\\mathbf{v} - \\text{proj}_W \\mathbf{v}\\| \\leq \\|\\mathbf{v} - \\mathbf{w}\\|$ for all $\\mathbf{w} \\in W$.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Function Inner Products and Signal Analysis',
        mathBridge: 'Numerically compute function inner products, verify orthogonality, and apply to CNC vibration detection.',
        caption: 'The integral inner product on function spaces is the foundation of Fourier analysis and signal processing.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cell_type: 'code',
              source: `import numpy as np
import matplotlib.pyplot as plt

# Numerical function inner product via quadrature
# <f, g> = integral from -pi to pi of f(x)*g(x) dx

x = np.linspace(-np.pi, np.pi, 10000)
dx = x[1] - x[0]

def inner_product(f, g, x):
    return np.trapz(f * g, x)

def norm(f, x):
    return np.sqrt(inner_product(f, f, x))

# Test orthogonality of trig functions
# <sin(mx), sin(nx)> = 0 if m != n, = pi if m == n
print("Trig function orthogonality on [-pi, pi]:")
print(f"<sin(1x), sin(2x)> = {inner_product(np.sin(x), np.sin(2*x), x):.6f}  (expect 0)")
print(f"<sin(1x), cos(1x)> = {inner_product(np.sin(x), np.cos(x), x):.6f}   (expect 0)")
print(f"<sin(1x), sin(1x)> = {inner_product(np.sin(x), np.sin(x), x):.6f}  (expect pi)")
print(f"<cos(2x), cos(2x)> = {inner_product(np.cos(2*x), np.cos(2*x), x):.6f}  (expect pi)")
print()

# Normalized (orthonormal) basis functions
e1 = np.sin(x) / norm(np.sin(x), x)  # unit norm
e2 = np.cos(x) / norm(np.cos(x), x)
print(f"||e1|| = {norm(e1, x):.6f}  (expect 1.0)")
print(f"||e2|| = {norm(e2, x):.6f}  (expect 1.0)")
print(f"<e1, e2> = {inner_product(e1, e2, x):.6f}  (expect 0.0)")
`,
            },
            {
              id: 2,
              cell_type: 'code',
              source: `import numpy as np

# Weighted inner product: <u, v>_W = u^T W v
# Arises in weighted least squares when measurement variances differ

# Example: measuring displacement at 4 sensors
# Sensors 1,2 are precise (low variance), sensors 3,4 are noisy (high variance)
variances = np.array([0.01, 0.01, 1.0, 1.0])  # sigma_i^2
weights = 1.0 / variances  # w_i = 1/sigma_i^2
W = np.diag(weights)

u = np.array([1.0, 2.0, 3.0, 4.0])
v = np.array([4.0, 3.0, 2.0, 1.0])

ip_standard = np.dot(u, v)
ip_weighted = u @ W @ v

print("Standard inner product:", ip_standard)
print("Weighted inner product:", ip_weighted)
print()

# The weighted inner product gives less weight to noisy sensors
# Show how angle changes between the two inner products
cos_std = ip_standard / (np.linalg.norm(u) * np.linalg.norm(v))
norm_u_w = np.sqrt(u @ W @ u)
norm_v_w = np.sqrt(v @ W @ v)
cos_w = ip_weighted / (norm_u_w * norm_v_w)

print(f"Angle under standard inner product: {np.degrees(np.arccos(cos_std)):.2f} degrees")
print(f"Angle under weighted inner product: {np.degrees(np.arccos(np.clip(cos_w, -1, 1))):.2f} degrees")
print()
print("The weighted geometry emphasizes the precise sensors (1,2),")
print("downweighting the noisy sensor disagreement (3,4).")
`,
            },
            {
              id: 3,
              cell_type: 'code',
              source: `import numpy as np

# CNC chatter detection via function inner product (Fourier coefficient)
# If the cutting force signal contains chatter at omega_c Hz,
# the inner product <f, sin(omega_c * t)> will be large

T = 1.0        # 1 second window
fs = 4096      # sampling rate (Hz)
t = np.linspace(0, T, int(T * fs), endpoint=False)
dt = t[1] - t[0]

# Simulate cutting force: smooth baseline + chatter at 650 Hz + noise
omega_c = 2 * np.pi * 650   # chatter frequency
omega_n = 2 * np.pi * 120   # normal cutting frequency

f_cutting = (
    np.sin(omega_n * t) +         # normal cutting force
    0.8 * np.sin(omega_c * t) +   # chatter component
    0.1 * np.random.randn(len(t)) # sensor noise
)

# Inner product with candidate chatter basis functions
def ip_func(f, g, dt):
    return np.sum(f * g) * dt

# Test several candidate chatter frequencies
test_freqs = [120, 300, 500, 650, 800, 1000]
print("Detecting chatter by Fourier inner products:")
print(f"{'Freq (Hz)':>10} | {'|<f, sin>|':>12} | {'|<f, cos>|':>12} | {'Amplitude':>12}")
print("-" * 55)
for freq in test_freqs:
    omega = 2 * np.pi * freq
    basis_sin = np.sin(omega * t)
    basis_cos = np.cos(omega * t)
    # Normalize by T so we get proper amplitudes
    coeff_sin = (2/T) * ip_func(f_cutting, basis_sin, dt)
    coeff_cos = (2/T) * ip_func(f_cutting, basis_cos, dt)
    amplitude = np.sqrt(coeff_sin**2 + coeff_cos**2)
    flag = " <-- CHATTER DETECTED" if amplitude > 0.5 else ""
    print(f"{freq:>10} | {abs(coeff_sin):>12.4f} | {abs(coeff_cos):>12.4f} | {amplitude:>12.4f}{flag}")
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Hilbert spaces.** An inner product space that is complete (every Cauchy sequence converges) is a Hilbert space. $\\mathbb{R}^n$ and $\\mathbb{C}^n$ are finite-dimensional Hilbert spaces. The space $L^2[a,b]$ of square-integrable functions (with $\\langle f, g \\rangle = \\int_a^b f\\bar{g}$) is an infinite-dimensional Hilbert space — every square-integrable function has a convergent Fourier series. Finite-dimensional inner product spaces are always complete (no distinction from Hilbert space in finite dimensions).',
      '**Riesz representation theorem.** Every continuous linear functional $\\phi: H \\to \\mathbb{F}$ on a Hilbert space $H$ is of the form $\\phi(\\mathbf{v}) = \\langle \\mathbf{v}, \\mathbf{w} \\rangle$ for a unique $\\mathbf{w} \\in H$. This profound result means that "measuring by integration against a function" and "taking an inner product" are the same thing. In finite dimensions: any linear functional on $\\mathbb{R}^n$ is a dot product with some vector — the gradient $\\nabla f(\\mathbf{x})$ is exactly this representing vector for the derivative functional.',
      '**Gram-Schmidt and ONB existence.** In any finite-dimensional inner product space, an orthonormal basis (ONB) always exists via Gram-Schmidt. The expansion $\\mathbf{v} = \\sum_{k=1}^n \\langle \\mathbf{v}, \\mathbf{e}_k \\rangle \\mathbf{e}_k$ expresses $\\mathbf{v}$ in the orthonormal basis, and the coefficient $\\langle \\mathbf{v}, \\mathbf{e}_k \\rangle$ is the orthogonal projection of $\\mathbf{v}$ onto the $k$-th basis direction. This is why Fourier coefficients are computed as integrals: $a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx = \\frac{\\langle f, \\cos(nx)\\rangle}{\\|\\cos(nx)\\|^2}$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Orthonormal Bases in Hilbert Spaces',
        body: 'In a Hilbert space with orthonormal basis $\\{\\mathbf{e}_k\\}$: every vector $\\mathbf{v} = \\sum_k \\langle \\mathbf{v}, \\mathbf{e}_k \\rangle \\mathbf{e}_k$ (Fourier expansion). The coefficients $\\langle \\mathbf{v}, \\mathbf{e}_k \\rangle$ are the Fourier coefficients. **Parseval\'s identity:** $\\|\\mathbf{v}\\|^2 = \\sum_k |\\langle \\mathbf{v}, \\mathbf{e}_k \\rangle|^2$\nThis says energy in the signal equals the sum of squared Fourier coefficients — no energy is lost in the transform.',
      },
      {
        type: 'theorem',
        title: 'Riesz Representation Theorem',
        body: 'Let $H$ be a Hilbert space. For every bounded linear functional $\\phi: H \\to \\mathbb{F}$, there exists a unique $\\mathbf{w} \\in H$ such that:\n$\\phi(\\mathbf{v}) = \\langle \\mathbf{v}, \\mathbf{w} \\rangle \\quad \\text{for all } \\mathbf{v} \\in H$\nMoreover $\\|\\phi\\| = \\|\\mathbf{w}\\|$. Consequence: $H$ and its dual $H^*$ are isometrically isomorphic — the inner product identifies them.',
      },
      {
        type: 'insight',
        title: 'Completeness and $L^2$',
        body: 'The space $L^2[a,b]$ of square-integrable functions (technically: equivalence classes where $f = g$ if $\\int |f-g|^2 = 0$) is a Hilbert space. Continuous functions $C[a,b]$ are NOT complete under the $L^2$ norm — a limit of continuous functions may be discontinuous. But $L^2[a,b]$ is the completion of $C[a,b]$, just as $\\mathbb{R}$ is the completion of $\\mathbb{Q}$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la4-005-1',
      title: 'Function orthogonality: $\\sin(x) \\perp \\cos(x)$',
      problem: 'Show that $f(x) = \\sin(x)$ and $g(x) = \\cos(x)$ are orthogonal on $[-\\pi, \\pi]$ using the function inner product $\\langle f, g \\rangle = \\int_{-\\pi}^{\\pi} f(x)g(x)\\,dx$.',
      steps: [
        {
          expression: '\\langle \\sin, \\cos \\rangle = \\int_{-\\pi}^{\\pi} \\sin(x)\\cos(x)\\,dx',
          annotation: 'Write the inner product as a definite integral.',
          strategyTitle: 'Apply the function inner product definition',
        },
        {
          expression: '= \\int_{-\\pi}^{\\pi} \\frac{1}{2}\\sin(2x)\\,dx',
          annotation: 'Use the product-to-sum identity: $\\sin(x)\\cos(x) = \\frac{1}{2}\\sin(2x)$.',
          strategyTitle: 'Trig identity simplifies the integrand',
        },
        {
          expression: '= \\frac{1}{2}\\left[-\\frac{\\cos(2x)}{2}\\right]_{-\\pi}^{\\pi}',
          annotation: 'Integrate: $\\int \\sin(2x)\\,dx = -\\frac{\\cos(2x)}{2}$.',
        },
        {
          expression: '= \\frac{1}{2}\\left(-\\frac{\\cos(2\\pi)}{2} + \\frac{\\cos(-2\\pi)}{2}\\right) = \\frac{1}{2}\\left(-\\frac{1}{2} + \\frac{1}{2}\\right) = 0',
          annotation: 'Cosine is $2\\pi$-periodic: $\\cos(2\\pi) = \\cos(-2\\pi) = 1$, so the terms cancel.',
          checkpoint: 'Why does periodicity make trig functions orthogonal? Because $\\cos(2\\pi) = \\cos(-2\\pi)$ means the boundary terms cancel for any integer-frequency function.',
        },
        {
          expression: '\\langle \\sin, \\cos \\rangle = 0 \\implies \\sin \\perp \\cos \\text{ in } C[-\\pi, \\pi]',
          annotation: 'The zero inner product confirms orthogonality. This works for all distinct frequencies: $\\langle \\sin(mx), \\sin(nx) \\rangle = 0$ when $m \\neq n$ — the foundation of Fourier series.',
          strategyTitle: 'Conclusion',
        },
      ],
    },
    {
      id: 'ex-la4-005-2',
      title: 'Verify a weighted inner product axioms',
      problem: 'Show that $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 2u_1v_1 + 5u_2v_2$ is an inner product on $\\mathbb{R}^2$, then find a pair of non-zero vectors orthogonal under this inner product but not under the standard dot product.',
      steps: [
        {
          expression: '\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\mathbf{u}^\\top W \\mathbf{v}, \\quad W = \\begin{pmatrix} 2 & 0 \\\\ 0 & 5 \\end{pmatrix}',
          annotation: 'Write in matrix form. The weights $w_1=2, w_2=5$ are both positive.',
          strategyTitle: 'Identify the weight matrix $W$',
        },
        {
          expression: '\\text{Symmetry: } \\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 2u_1v_1 + 5u_2v_2 = 2v_1u_1 + 5v_2u_2 = \\langle \\mathbf{v}, \\mathbf{u} \\rangle_W \\checkmark',
          annotation: 'Multiplication is commutative: $u_i v_i = v_i u_i$.',
          strategyTitle: 'Check axiom 1: Symmetry',
        },
        {
          expression: '\\text{Linearity: } \\langle c\\mathbf{u} + \\mathbf{w}, \\mathbf{v} \\rangle_W = 2(cu_1+w_1)v_1 + 5(cu_2+w_2)v_2 = c\\langle\\mathbf{u},\\mathbf{v}\\rangle_W + \\langle\\mathbf{w},\\mathbf{v}\\rangle_W \\checkmark',
          annotation: 'Distribute and collect: linearity follows from linearity of multiplication.',
          strategyTitle: 'Check axiom 2: Linearity',
        },
        {
          expression: '\\text{Positive def: } \\langle \\mathbf{v}, \\mathbf{v} \\rangle_W = 2v_1^2 + 5v_2^2 \\geq 0, \\text{ with equality iff } v_1 = v_2 = 0 \\checkmark',
          annotation: 'Sum of non-negative terms; zero only when all components vanish.',
          strategyTitle: 'Check axiom 3: Positive definiteness',
        },
        {
          expression: '\\text{Find } \\mathbf{u}, \\mathbf{v} \\text{ with } \\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 0: \\quad 2u_1v_1 + 5u_2v_2 = 0',
          annotation: 'Set $\\mathbf{u} = (5, -2)^\\top$ and $\\mathbf{v} = (1, 1)^\\top$: $2(5)(1) + 5(-2)(1) = 10 - 10 = 0$.',
          strategyTitle: 'Find $W$-orthogonal vectors',
        },
        {
          expression: '\\mathbf{u}^\\top \\mathbf{v} = 5(1) + (-2)(1) = 3 \\neq 0',
          annotation: 'Under the standard dot product they are NOT orthogonal. Different geometries from different inner products.',
          strategyTitle: 'Confirm they are not dot-product orthogonal',
          hints: ['To find W-orthogonal vectors, choose $\\mathbf{u} = (w_2, -w_1)^\\top$ and $\\mathbf{v} = (1, 1)^\\top$: $w_1 w_2 - w_2 w_1 = 0$.'],
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la4-005-1',
      title: 'Gram-Schmidt in polynomial space',
      difficulty: 'medium',
      problem: 'Apply Gram-Schmidt to $\\{1, x, x^2\\}$ with inner product $\\langle p, q \\rangle = \\int_{-1}^{1} p(x)q(x)\\,dx$ to produce an orthonormal basis of polynomials up to degree 2.',
      hint: 'Compute $\\langle 1, 1 \\rangle = \\int_{-1}^1 1\\,dx = 2$, so $e_1 = 1/\\sqrt{2}$. For $q_2$: subtract the projection of $x$ onto $e_1$. Note $\\langle x, 1 \\rangle = \\int_{-1}^1 x\\,dx = 0$ (odd function on symmetric interval).',
      walkthrough: [
        '**Step 1 — Normalize $v_1 = 1$:** $\\|v_1\\|^2 = \\int_{-1}^1 1\\,dx = 2$, so $e_1 = \\frac{1}{\\sqrt{2}}$.',
        '**Step 2 — Orthogonalize $v_2 = x$:** $\\langle x, e_1 \\rangle = \\int_{-1}^1 x \\cdot \\frac{1}{\\sqrt{2}}\\,dx = 0$ (odd integrand on $[-1,1]$). So $u_2 = x - 0 = x$. Normalize: $\\|x\\|^2 = \\int_{-1}^1 x^2\\,dx = \\frac{2}{3}$, giving $e_2 = x\\sqrt{\\frac{3}{2}}$.',
        '**Step 3 — Orthogonalize $v_3 = x^2$:** Need to subtract projections onto $e_1$ and $e_2$. $\\langle x^2, e_1 \\rangle = \\frac{1}{\\sqrt{2}}\\int_{-1}^1 x^2\\,dx = \\frac{1}{\\sqrt{2}} \\cdot \\frac{2}{3} = \\frac{\\sqrt{2}}{3}$. $\\langle x^2, e_2 \\rangle = \\sqrt{\\frac{3}{2}}\\int_{-1}^1 x^3\\,dx = 0$ (odd). So $u_3 = x^2 - \\frac{\\sqrt{2}}{3} \\cdot e_1 = x^2 - \\frac{1}{3}$.',
        '**Step 4 — Normalize $u_3$:** $\\|x^2 - \\frac{1}{3}\\|^2 = \\int_{-1}^1 (x^2 - \\frac{1}{3})^2\\,dx = \\frac{8}{45}$. So $e_3 = \\frac{x^2 - 1/3}{\\sqrt{8/45}} = \\frac{3x^2 - 1}{2}\\sqrt{\\frac{5}{2}}$.',
        '**Result — Legendre polynomials:** $e_1 = \\frac{1}{\\sqrt{2}}$, $e_2 = \\sqrt{\\frac{3}{2}}x$, $e_3 = \\sqrt{\\frac{5}{2}}\\cdot\\frac{3x^2-1}{2}$. These are the normalized Legendre polynomials $P_0, P_1, P_2$ — the natural orthonormal basis for polynomial approximation on $[-1,1]$.',
      ],
    },
    {
      id: 'ch-la4-005-2',
      title: 'Parseval\'s identity for a Fourier partial sum',
      difficulty: 'hard',
      problem: 'The function $f(x) = x$ on $[-\\pi, \\pi]$ has Fourier sine series $f(x) = \\sum_{n=1}^\\infty \\frac{2(-1)^{n+1}}{n}\\sin(nx)$. Verify Parseval\'s identity for the first 3 terms numerically: $\\|f\\|^2 = \\sum_{n=1}^3 |\\hat{f}_n|^2 + \\text{error}$, and compute the partial sum error.',
      hint: '$\\|f\\|^2 = \\int_{-\\pi}^\\pi x^2\\,dx = \\frac{2\\pi^3}{3}$. The Fourier coefficients are $\\hat{f}_n = \\frac{1}{\\pi}\\int_{-\\pi}^\\pi x\\sin(nx)\\,dx = \\frac{2(-1)^{n+1}}{n}$, with energy $\\frac{1}{2}|\\hat{f}_n|^2 \\cdot \\pi$ per term.',
      walkthrough: [
        '**Signal energy:** $\\|f\\|^2 = \\int_{-\\pi}^\\pi x^2\\,dx = \\frac{x^3}{3}\\big|_{-\\pi}^\\pi = \\frac{2\\pi^3}{3} \\approx 65.80$.',
        '**Fourier coefficients:** $b_n = \\frac{2(-1)^{n+1}}{n}$. So $b_1 = 2, b_2 = -1, b_3 = 2/3$.',
        '**Energy per mode:** With ONB $e_n(x) = \\frac{1}{\\sqrt{\\pi}}\\sin(nx)$ (since $\\|\\sin(nx)\\|^2 = \\pi$), the ONB coefficient is $c_n = b_n\\sqrt{\\pi}$. By Parseval: $\\|f\\|^2 = \\sum |c_n|^2 = \\pi \\sum b_n^2$.',
        '**First 3 terms:** $\\pi(b_1^2 + b_2^2 + b_3^2) = \\pi(4 + 1 + 4/9) = \\pi \\cdot \\frac{49}{9} \\approx 17.10$. Captured fraction: $\\frac{17.10}{65.80} \\approx 26\\%$ — only 3 terms.',
        '**Convergence:** The full series requires $\\sum_{n=1}^\\infty \\frac{4}{n^2} = \\frac{2\\pi^2}{3}$ (Basel problem), and $\\pi \\cdot \\frac{2\\pi^2}{3} = \\frac{2\\pi^3}{3} = \\|f\\|^2$ ✓. Parseval is confirmed by the Basel problem identity.',
      ],
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

  assessment: {
    questions: [
      {
        id: 'assess-la4-005-1',
        type: 'proof',
        text: 'Define a weighted inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 3u_1v_1 + 7u_2v_2$ on $\\mathbb{R}^2$. (a) Verify all three inner product axioms. (b) Find two non-zero vectors orthogonal under $\\langle \\cdot, \\cdot \\rangle_W$ but not under the dot product. (c) Show that the Cauchy-Schwarz inequality $|\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W|^2 \\leq \\langle \\mathbf{u}, \\mathbf{u} \\rangle_W \\cdot \\langle \\mathbf{v}, \\mathbf{v} \\rangle_W$ holds for $\\mathbf{u} = (1, 1)^\\top$, $\\mathbf{v} = (1, -1)^\\top$.',
        answer: '(a) Symmetry: $w_i u_i v_i = w_i v_i u_i$ ✓; Linearity: distributes over scalar mult and addition ✓; Positive def: $\\sum w_i v_i^2 > 0$ for $\\mathbf{v} \\neq 0$ since $w_i > 0$ ✓. (b) Need $3u_1v_1 + 7u_2v_2 = 0$: take $\\mathbf{u} = (7, -3)^\\top, \\mathbf{v} = (1, 1)^\\top$; $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 21 - 21 = 0$; dot product $= 7 - 3 = 4 \\neq 0$. (c) LHS $= |3 - 7|^2 = 16$; RHS $= (3+7)(3+7) = 100$; $16 \\leq 100$ ✓.',
        hint: 'For part (b), to get $w_1 u_1 v_1 + w_2 u_2 v_2 = 0$, try $\\mathbf{u} = (w_2, -w_1)^\\top$, $\\mathbf{v} = (1, 1)^\\top$.',
      },
      {
        id: 'assess-la4-005-2',
        type: 'computation',
        text: 'Use the function inner product $\\langle f, g \\rangle = \\int_0^1 f(x)g(x)\\,dx$ to: (a) compute $\\langle x, x^2 \\rangle$; (b) find $\\|x\\|$ and $\\|x^2\\|$; (c) compute the angle between $f(x) = x$ and $g(x) = x^2$.',
        answer: '(a) $\\int_0^1 x^3\\,dx = 1/4$. (b) $\\|x\\|^2 = \\int_0^1 x^2\\,dx = 1/3$, so $\\|x\\| = 1/\\sqrt{3}$; $\\|x^2\\|^2 = 1/5$, $\\|x^2\\| = 1/\\sqrt{5}$. (c) $\\cos\\theta = \\frac{1/4}{(1/\\sqrt{3})(1/\\sqrt{5})} = \\frac{\\sqrt{15}}{4} \\approx 0.968$; $\\theta \\approx 14.5°$.',
        hint: 'Use $\\cos\\theta = \\langle f, g \\rangle / (\\|f\\|\\|g\\|)$ exactly as in $\\mathbb{R}^n$.',
      },
    ],
  },

  quiz: [
    {
      id: 'q-la4-005-1',
      type: 'choice',
      text: 'Which property is NOT required of an inner product?',
      options: ['Positive definiteness', 'Symmetry', 'Linearity in first argument', 'Associativity'],
      answer: 'Associativity',
      hints: ['An inner product must satisfy: symmetry, linearity in the first argument, and positive definiteness. Associativity is a property of multiplication/composition, not inner products.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la4-005-2',
      type: 'choice',
      text: 'The Cauchy-Schwarz inequality states:',
      options: [
        '$\\|\\mathbf{u}+\\mathbf{v}\\| \\leq \\|\\mathbf{u}\\|+\\|\\mathbf{v}\\|$',
        '$|\\langle\\mathbf{u},\\mathbf{v}\\rangle| \\leq \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$',
        '$\\langle\\mathbf{u},\\mathbf{v}\\rangle = \\langle\\mathbf{v},\\mathbf{u}\\rangle$',
        '$\\|\\mathbf{u}\\| = \\|\\mathbf{v}\\|$',
      ],
      answer: '$|\\langle\\mathbf{u},\\mathbf{v}\\rangle| \\leq \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$',
      hints: ['The first option is the triangle inequality. The third is symmetry. Cauchy-Schwarz bounds the magnitude of the inner product by the product of the norms — it guarantees $\\cos\\theta \\in [-1,1]$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la4-005-3',
      type: 'choice',
      text: 'A complete inner product space (every Cauchy sequence converges) is called:',
      options: ['Banach space', 'Hilbert space', 'Normed space', 'Metric space'],
      answer: 'Hilbert space',
      hints: ['A Banach space is a complete normed space (no inner product required). A Hilbert space adds the inner product structure — it is a special Banach space where the norm comes from an inner product.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la4-005-4',
      type: 'choice',
      text: 'The function inner product $\\langle f, g \\rangle = \\int_{-\\pi}^\\pi f(x)g(x)\\,dx$ gives $\\langle \\sin(2x), \\sin(3x) \\rangle =$',
      options: ['$\\pi$', '$0$', '$2\\pi$', '$1$'],
      answer: '$0$',
      hints: ['Use the product-to-sum identity: $\\sin(mx)\\sin(nx) = \\frac{1}{2}[\\cos((m-n)x) - \\cos((m+n)x)]$. The integral of $\\cos(kx)$ over a full period is $0$ when $k \\neq 0$. Since $m \\neq n$, both terms vanish.'],
      reviewSection: 'examples',
    },
  ],
};
