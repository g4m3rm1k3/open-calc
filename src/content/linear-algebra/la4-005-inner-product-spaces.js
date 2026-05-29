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
  },

  intuition: {
    prose: [
      'Two polynomials: $f(x) = x$ and $g(x) = x^2$ on $[0,1]$. Their "similarity": $\\langle f,g \\rangle = \\int_0^1 x \\cdot x^2\\,dx = \\int_0^1 x^3\\,dx = 1/4$. Their "lengths": $\\|f\\| = \\sqrt{1/3}$, $\\|g\\| = \\sqrt{1/5}$. Angle: $\\cos\\theta = (1/4)/(\\sqrt{1/3}\\sqrt{1/5}) = (\\sqrt{15}/4) \\approx 0.968$ — these polynomials are nearly aligned ($\\theta \\approx 15°$). There are no components here, just an integral — yet we get length, angle, and orthogonality exactly like in $\\mathbb{R}^n$. An inner product is any function that extends this geometry to any vector space.',
      '**The standard dot product.** On $\\mathbb{R}^n$: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\mathbf{u}^\\top \\mathbf{v} = \\sum_{i=1}^n u_i v_i$. This is the canonical example. The norm it induces is $\\|\\mathbf{v}\\| = \\sqrt{\\langle \\mathbf{v}, \\mathbf{v} \\rangle} = \\sqrt{\\sum v_i^2}$ — Euclidean length.',
      '**A weighted inner product.** On $\\mathbb{R}^n$ with positive weights $w_1, \\ldots, w_n$: $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\sum w_i u_i v_i = \\mathbf{u}^\\top W \\mathbf{v}$ where $W = \\text{diag}(w_1, \\ldots, w_n)$. This inner product arises in statistics (weighted least squares) and finite elements (energy-based norms).',
      '**Inner products on function spaces.** On the space of continuous functions $C[a,b]$: $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$. Two functions are orthogonal if this integral is zero. This makes the sine and cosine functions of different frequencies orthogonal — the basis for Fourier series.',
      '**CNC and signal processing applications.** In CNC machining, vibration sensors record acceleration signals $f(t)$ during cutting. To detect **chatter**, engineers compute the inner product $\\langle f, \\sin(\\omega_{\\text{chatter}} t) \\rangle = \\int_0^T f(t)\\sin(\\omega t)\\,dt$ — if this is large, the cutting force contains that frequency. This is exactly the Fourier coefficient: how much of the chatter basis function lives in the measured signal. In **finite element analysis** for CNC frame design, the stiffness matrix entries are $K_{ij} = \\int_{\\Omega} \\nabla\\phi_i \\cdot \\nabla\\phi_j\\,d\\Omega$ — an inner product of basis function gradients over the material domain. The weighted inner product appears in **weighted least squares**, where measurement noise with unequal variance $\\sigma_i^2$ gets inner product weights $w_i = 1/\\sigma_i^2$ so that precise measurements count more.',
      '**What makes an inner product valid — the three axioms.** Not every formula that takes two vectors and returns a number qualifies. A valid inner product must satisfy: (1) **Positive definiteness** — $\\langle \\mathbf{v}, \\mathbf{v} \\rangle > 0$ for $\\mathbf{v} \\neq \\mathbf{0}$ and $\\langle \\mathbf{0}, \\mathbf{0} \\rangle = 0$ (you cannot have zero length unless you are the zero vector); (2) **Symmetry** — $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = \\langle \\mathbf{v}, \\mathbf{u} \\rangle$ (distance from $A$ to $B$ equals distance from $B$ to $A$); (3) **Linearity** — $\\langle c\\mathbf{u} + \\mathbf{w}, \\mathbf{v} \\rangle = c\\langle \\mathbf{u}, \\mathbf{v} \\rangle + \\langle \\mathbf{w}, \\mathbf{v} \\rangle$ (scaling and adding vectors commutes with the inner product). The weighted inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\mathbf{u}^T W \\mathbf{v}$ satisfies all three whenever $W$ is symmetric positive definite.',
      '**Where this is heading.** The abstract inner product is the gateway to infinite-dimensional analysis. The Spectral Theorem in the next lesson says that every symmetric matrix can be diagonalized with orthonormal eigenvectors — and orthonormality here means exactly the dot-product inner product. After that, the same ideas extend to infinite dimensions: $L^2$ function spaces, Fourier series, and quantum mechanics all live in Hilbert spaces (complete inner product spaces). The abstract framework you are building here is the same one used to prove that Fourier series converge, that quantum observables have real eigenvalues, and that finite element approximations improve as the mesh is refined.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 4):** SVD — the universal factorization $A = U\\Sigma V^T$.\n**This lesson:** Inner Product Spaces — abstracting the dot product to define geometry in any vector space.\n**Next (Lesson 6):** Spectral Theorem — why symmetric matrices are always diagonalizable with orthogonal eigenvectors.',
      },
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
      {
        type: 'insight',
        title: 'Prediction',
        body: 'For the weighted inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 2u_1v_1 + 5u_2v_2$: are $\\mathbf{u} = [5,-2]^T$ and $\\mathbf{v} = [1,1]^T$ orthogonal under this inner product? Are they orthogonal under the standard dot product? Predict both answers, then compute.',
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Trig function orthogonality — the integral inner product',
              prose: 'The inner product $\\langle f, g \\rangle = \\int_{-\\pi}^{\\pi} f(x)g(x)\\,dx$ on functions works exactly like the dot product. Two trig functions $\\sin(mx)$ and $\\sin(nx)$ are orthogonal when $m \\neq n$ — their inner product is zero. We verify this numerically using np.trapz (the trapezoidal rule for numerical integration).',
              code: `import numpy as np
import matplotlib.pyplot as plt

# Standard inner product and alternatives
u = np.array([1., 2., 3.])
v = np.array([4., -1., 2.])

# Standard: <u,v> = u^T v
ip_std = np.dot(u, v)
# Weighted: <u,v>_W = u^T W v with W = diag(2,1,3)
W = np.diag([2., 1., 3.])
ip_weighted = u @ W @ v

print(f"Standard  <u,v> = {ip_std}")
print(f"Weighted  <u,v>_W = {ip_weighted}")
print(f"||u|| = {np.linalg.norm(u):.4f}")
print(f"||u||_W = {np.sqrt(u @ W @ u):.4f}")
print(f"Cauchy-Schwarz: |<u,v>| = {abs(ip_std):.4f} <= ||u||*||v|| = {np.linalg.norm(u)*np.linalg.norm(v):.4f}")

# Visualize: angle between vectors via inner product
theta = np.arccos(ip_std / (np.linalg.norm(u) * np.linalg.norm(v)))
fig, ax = plt.subplots(figsize=(6, 4))
ax.bar(['<u,v>', '||u||*||v||', '|<u,v>_W|', '||u||_W*||v||_W'],
       [abs(ip_std), np.linalg.norm(u)*np.linalg.norm(v),
        abs(ip_weighted), np.sqrt(u@W@u)*np.sqrt(v@W@v)],
       color=['steelblue','darkorange','green','crimson'], alpha=0.85, edgecolor='k')
ax.set_title(f"Cauchy-Schwarz: |<u,v>| <= ||u||*||v||\nAngle = {np.degrees(theta):.1f} deg", fontsize=11)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Weighted inner product — geometry changes with weights',
              prose: 'The weighted inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = \\mathbf{u}^T W \\mathbf{v}$ with $W = \\text{diag}(w_1,\\ldots,w_n)$ arises in weighted least squares. When sensors have unequal noise variance $\\sigma_i^2$, set $w_i = 1/\\sigma_i^2$ so precise measurements count more. The same vectors $\\mathbf{u},\\mathbf{v}$ can have completely different angles under the standard vs. weighted inner product.',
              code: `import numpy as np

variances = np.array([0.01, 0.01, 1.0, 1.0])
weights = 1.0 / variances
W = np.diag(weights)

u = np.array([1.0, 2.0, 3.0, 4.0])
v = np.array([4.0, 3.0, 2.0, 1.0])

ip_std = np.dot(u, v)
ip_w   = u @ W @ v

cos_std = ip_std / (np.linalg.norm(u) * np.linalg.norm(v))
norm_u_w = np.sqrt(u @ W @ u)
norm_v_w = np.sqrt(v @ W @ v)
cos_w = ip_w / (norm_u_w * norm_v_w)

print(f"Standard ip: {ip_std}")
print(f"Weighted ip: {ip_w}")
print(f"Standard angle: {np.degrees(np.arccos(cos_std)):.2f} deg")
print(f"Weighted angle: {np.degrees(np.arccos(np.clip(cos_w, -1, 1))):.2f} deg")
print("Different inner products give different geometries on the same space.")`,
            },
            {
              id: 3,
              cellTitle: 'CNC chatter detection as a function inner product',
              prose: 'To detect chatter at frequency $\\omega_c$, compute $\\langle f, \\sin(\\omega_c t) \\rangle = \\int_0^T f(t)\\sin(\\omega_c t)\\,dt$. If this Fourier coefficient is large, the cutting force contains that frequency. This is the inner product on the function space $L^2[0,T]$ — orthogonality of trig functions means each frequency is tested independently.',
              code: `import numpy as np

T = 1.0; fs = 4096
t = np.linspace(0, T, int(T * fs), endpoint=False)

f_cutting = (np.sin(2*np.pi*120*t) +
             0.8 * np.sin(2*np.pi*650*t) +
             0.1 * np.random.randn(len(t)))

def fourier_coeff(f, freq):
    s = np.sin(2*np.pi*freq*t)
    c = np.cos(2*np.pi*freq*t)
    return (2/T)*np.trapz(f*s, t), (2/T)*np.trapz(f*c, t)

print(f"{'Freq':>6} | {'Amplitude':>10} | Detection")
for freq in [120, 300, 500, 650, 800]:
    cs, cc = fourier_coeff(f_cutting, freq)
    amp = np.sqrt(cs**2 + cc**2)
    flag = "<-- CHATTER" if amp > 0.5 else ""
    print(f"{freq:>6} | {amp:>10.4f} | {flag}")`,
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
    {
      id: 'ex-la4-005-3',
      title: 'Fourier orthogonality: sin and cos are perpendicular',
      problem: 'Using the function inner product $\\langle f, g \\rangle = \\int_{-\\pi}^{\\pi} f(x)g(x)\\,dx$, verify that $f(x) = \\sin(x)$ and $g(x) = \\cos(x)$ are orthogonal, and compute $\\|\\sin(x)\\|$ and $\\|\\cos(x)\\|$.',
      steps: [
        {
          expression: '\\langle \\sin(x), \\cos(x) \\rangle = \\int_{-\\pi}^{\\pi} \\sin(x)\\cos(x)\\,dx = \\frac{1}{2}\\int_{-\\pi}^{\\pi} \\sin(2x)\\,dx',
          annotation: 'Use the identity $\\sin(x)\\cos(x) = \\frac{1}{2}\\sin(2x)$.',
          strategyTitle: 'Apply product-to-sum identity',
          checkpoint: 'Why do we expect this to be zero before computing?',
          hints: ['sin(x)cos(x) is an odd function (f(-x) = -f(x)). The integral of any odd function over a symmetric interval [-π,π] is zero.'],
        },
        {
          expression: '= \\frac{1}{2}\\left[-\\frac{\\cos(2x)}{2}\\right]_{-\\pi}^{\\pi} = \\frac{1}{2}\\left(-\\frac{\\cos(2\\pi)}{2} + \\frac{\\cos(-2\\pi)}{2}\\right) = 0',
          annotation: '$\\cos(2\\pi) = \\cos(-2\\pi) = 1$, so the antiderivative evaluates to the same value at both endpoints — difference is zero. ✓',
          strategyTitle: 'Evaluate integral',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\|\\sin(x)\\|^2 = \\int_{-\\pi}^{\\pi} \\sin^2(x)\\,dx = \\int_{-\\pi}^{\\pi} \\frac{1-\\cos(2x)}{2}\\,dx = \\left[\\frac{x}{2} - \\frac{\\sin(2x)}{4}\\right]_{-\\pi}^{\\pi} = \\pi',
          annotation: 'Use $\\sin^2(x) = (1-\\cos(2x))/2$. The $\\cos(2x)$ term integrates to zero over a full period.',
          strategyTitle: 'Compute norm of sin(x)',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\|\\cos(x)\\|^2 = \\int_{-\\pi}^{\\pi} \\cos^2(x)\\,dx = \\pi \\quad (\\text{by symmetry})',
          annotation: '$\\cos^2(x) = (1+\\cos(2x))/2$, same argument. So $\\|\\sin(x)\\| = \\|\\cos(x)\\| = \\sqrt{\\pi}$.',
          strategyTitle: 'Compute norm of cos(x)',
          checkpoint: 'What is the orthonormal pair (unit-length vectors)?',
          hints: ['Divide by the norm: e₁ = sin(x)/âˆšπ and e₁ = cos(x)/âˆšπ. These form an orthonormal pair in function space — the same role as standard basis vectors in ℝⁿ.'],
        },
      ],
      conclusion: '$\\sin(x) \\perp \\cos(x)$ in function space, with $\\|\\sin(x)\\| = \\|\\cos(x)\\| = \\sqrt{\\pi}$. Normalized: $\\{\\sin(x)/\\sqrt{\\pi}, \\cos(x)/\\sqrt{\\pi}\\}$ is an orthonormal pair. This orthogonality is the reason Fourier series work: each frequency is independent (contributes independently to the total signal).',
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
    { id: 'cp-la4-005-1', label: 'Read: State the three inner product axioms', type: 'read' },
    { id: 'cp-la4-005-2', label: 'Read: State the Cauchy-Schwarz inequality and when equality holds', type: 'read' },
    { id: 'cp-la4-005-3', label: 'Read: Explain what makes a space a Hilbert space', type: 'read' },
    { id: 'cp-la4-005-4', label: 'Lab: Compute function inner products and verify orthogonality', type: 'lab' },
    { id: 'cp-la4-005-5', label: 'Lab: Compute angle between two functions using inner product', type: 'lab' },
    { id: 'cp-la4-005-6', label: 'Example: Compute inner products in function space', type: 'example' },
    { id: 'cp-la4-005-7', label: 'Example: Verify weighted inner product axioms', type: 'example' },
    { id: 'cp-la4-005-8', label: 'Challenge: Apply Gram-Schmidt to polynomials', type: 'challenge' },
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
    {
      id: 'q-la4-005-5',
      type: 'choice',
      text: 'Under the weighted inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 2u_1v_1 + 5u_2v_2$, are $\\mathbf{u} = [5,-2]^T$ and $\\mathbf{v} = [1,1]^T$ orthogonal?',
      options: ['Yes — $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 0$', 'No — $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 3$', 'No — $\\mathbf{u}^T\\mathbf{v} = 3 \\neq 0$', 'Yes — both are unit vectors'],
      answer: 'Yes — $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_W = 0$',
      hints: ['âŸ¨u,vâŸ©_W = 2·5·1 + 5·(-2)·1 = 10 - 10 = 0. They are W-orthogonal even though u·v = 3 ≠ 0 under the standard dot product.'],
      reviewSection: 'Examples — weighted inner product',
    },
    {
      id: 'q-la4-005-6',
      type: 'choice',
      text: 'Which of the following is NOT a valid inner product on $\\mathbb{R}^2$?',
      options: [
        '$\\langle \\mathbf{u}, \\mathbf{v} \\rangle = 3u_1v_1 + 7u_2v_2$',
        '$\\langle \\mathbf{u}, \\mathbf{v} \\rangle = u_1v_1 - u_2v_2$',
        '$\\mathbf{u}^T A \\mathbf{v}$ for $A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}$',
        '$\\langle \\mathbf{u}, \\mathbf{v} \\rangle = u_1v_1 + 2u_2v_2$',
      ],
      answer: '$\\langle \\mathbf{u}, \\mathbf{v} \\rangle = u_1v_1 - u_2v_2$',
      hints: ['Take v=[0,1]ᵀ: âŸ¨v,vâŸ© = 0 - 1 = -1 < 0. Positive definiteness fails — inner products require âŸ¨v,vâŸ© > 0 for all non-zero v.'],
      reviewSection: 'Intuition — positive definiteness axiom',
    },
    {
      id: 'q-la4-005-7',
      type: 'choice',
      text: 'Parseval\'s identity $\\|f\\|^2 = \\sum_n |\\langle f, e_n \\rangle|^2$ (for an orthonormal basis $\\{e_n\\}$) is the infinite-dimensional version of:',
      options: ['Cauchy-Schwarz inequality', 'The Pythagorean theorem', 'The triangle inequality', 'Gram-Schmidt'],
      answer: 'The Pythagorean theorem',
      hints: ['In ℝⁿ: –v–² = Σᵢ|âŸ¨v,eᵢâŸ©|² (sum of squared components along an ONB). Parseval says the same thing holds in infinite dimensions: total energy = sum of squared Fourier coefficients.'],
      reviewSection: 'Rigor — Parseval and completeness',
    },
    {
      id: 'q-la4-005-8',
      type: 'choice',
      text: 'A complete inner product space is called a Hilbert space. The space of continuous functions $C[0,1]$ under $\\langle f,g\\rangle = \\int_0^1 fg$ is NOT Hilbert because:',
      options: [
        'The inner product is not symmetric',
        'A Cauchy sequence of continuous functions can converge to a discontinuous limit (not in the space)',
        'The space has infinite dimension',
        'Cauchy-Schwarz does not hold there',
      ],
      answer: 'A Cauchy sequence of continuous functions can converge to a discontinuous limit (not in the space)',
      hints: ['Completeness requires every Cauchy sequence to converge within the space. Example: a sequence of continuous functions approximating the step function — the limit is discontinuous, hence not in C[0,1]. The completion is L²[0,1].'],
      reviewSection: 'Rigor — Hilbert vs. inner product spaces',
    },
    {
      id: 'q-la4-005-9',
      type: 'choice',
      text: 'Gram-Schmidt applied to polynomials $\\{1, x, x^2\\}$ on $[-1,1]$ with the $L^2$ inner product produces:',
      options: ['The monomials $\\{1, x, x^2\\}$ unchanged', 'The Legendre polynomials $\\{P_0, P_1, P_2\\}$', 'The Taylor basis', 'The Fourier basis'],
      answer: 'The Legendre polynomials $\\{P_0, P_1, P_2\\}$',
      hints: ['Gram-Schmidt orthogonalizes the monomial basis using the L² inner product on [-1,1]. The output is the Legendre polynomial basis — the natural orthogonal basis for polynomial approximation on [-1,1].'],
      reviewSection: 'Challenges — Gram-Schmidt on polynomial space',
    },
    {
      id: 'q-la4-005-10',
      type: 'choice',
      text: 'In quantum mechanics, $|\\langle \\psi_n, \\psi \\rangle|^2$ gives the probability of measuring eigenvalue $n$. This is meaningful because:',
      options: [
        'Wave functions are always real-valued',
        'The eigenstates $\\{\\psi_n\\}$ form an orthonormal basis — Parseval guarantees the probabilities sum to 1',
        'The SchrÃ¶dinger equation is linear',
        'Energy levels are always integers',
      ],
      answer: 'The eigenstates $\\{\\psi_n\\}$ form an orthonormal basis — Parseval guarantees the probabilities sum to 1',
      hints: ['Parseval: –Ïˆ–² = Σ₁™|âŸ¨Ïˆ₁™,ÏˆâŸ©|². If –Ïˆ–=1 (normalized state), then Σ₁™|âŸ¨Ïˆ₁™,ÏˆâŸ©|² = 1. The probabilities |âŸ¨Ïˆ₁™,ÏˆâŸ©|² automatically sum to 1 by the inner product structure.'],
      reviewSection: 'Transfer — quantum mechanics',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'An inner product is the same as the dot product.',
      whyStudentsThinkIt: 'The dot product is the first inner product students encounter, so they generalize it incorrectly as the only option.',
      correctionExample: 'The function inner product $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$ satisfies all three axioms but involves no components at all. The weighted dot product $\\sum w_i u_i v_i$ is also a valid inner product when all weights $w_i > 0$, giving a different geometry.',
      contrastCase: 'Under the weighted inner product with $w_1=2, w_2=5$, the vectors $[5,-2]^T$ and $[1,1]^T$ are orthogonal — but under the standard dot product they are not. Same vectors, different "angle" depending on the inner product.',
    },
    {
      falseBelief: 'Orthogonality is an intrinsic property of two vectors, independent of the inner product.',
      whyStudentsThinkIt: 'Students learn orthogonality as a geometric property (perpendicularity) and think it is absolute.',
      correctionExample: 'The same pair of vectors can be orthogonal under one inner product and not orthogonal under another. "Orthogonal" means $\\langle \\mathbf{u}, \\mathbf{v} \\rangle = 0$ — which depends on the specific inner product being used.',
      contrastCase: 'In weighted least squares, the "normal equations" use the weighted inner product, not the standard dot product. The residual is orthogonal to the column space under the correct (weighted) inner product.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You want to find the best polynomial approximation to a function $f$ on $[-1,1]$ in the $L^2$ sense.',
      competingTechniques: ['Taylor expansion', 'Interpolation at chosen nodes', 'Projection via function inner product'],
      whyThisTechniqueWins: 'The $L^2$ projection onto the polynomial subspace (using Legendre polynomials as ONB) minimizes $\\|f - p\\|_{L^2}^2$ — the average squared error. Taylor minimizes pointwise error near a single point; interpolation forces exact agreement at discrete points. The inner product projection gives the globally best fit.',
    },
    {
      situation: 'In signal processing, you want to extract the amplitude of a specific frequency $\\omega_0$ from a noisy signal $f(t)$.',
      competingTechniques: ['Bandpass filter', 'Fourier transform at $\\omega_0$', 'Inner product with the basis function'],
      whyThisTechniqueWins: 'The Fourier coefficient is $c_n = \\langle f, e^{i\\omega_0 t} \\rangle / \\|e^{i\\omega_0 t}\\|^2$ — an inner product. Because the Fourier basis is orthogonal, this extracts exactly the $\\omega_0$ component without contamination from other frequencies.',
    },
  ],

  debugging: [
    {
      commonError: 'Trying to define an inner product with a negative weight, like $\\langle u,v \\rangle = u_1v_1 - u_2v_2$.',
      symptom: '$\\langle \\mathbf{v}, \\mathbf{v} \\rangle < 0$ for $\\mathbf{v} = [0,1]^T$ — violates positive definiteness.',
      whyItHappened: 'For a weighted inner product $\\sum w_i u_i v_i$ to satisfy positive definiteness, all weights must be positive. The minus sign makes $w_2 = -1 < 0$.',
      repairStrategy: 'Check: for every non-zero $\\mathbf{v}$, compute $\\langle \\mathbf{v}, \\mathbf{v} \\rangle$ — must be $> 0$. For the matrix form $\\mathbf{u}^T A \\mathbf{v}$: $A$ must be symmetric positive definite (all eigenvalues positive).',
    },
    {
      commonError: 'Computing the inner product of two functions by evaluating $f(x) \\cdot g(x)$ at a single point instead of integrating.',
      symptom: 'Gets a number that varies with $x$ — an inner product is a single fixed scalar, not a function of $x$.',
      whyItHappened: 'Confusing pointwise multiplication with integration. The function inner product is $\\int_a^b f(x)g(x)\\,dx$ — a definite integral that outputs one number.',
      repairStrategy: 'Always check: inner product inputs are two vectors/functions, output is one scalar. If you have $x$ in your answer, you have not finished the computation.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Verify inner product axioms, compute norms and angles in function space, identify orthogonal pairs, and state Cauchy-Schwarz.',
    explainVerbally: 'Explain what an inner product generalizes beyond the dot product, why orthogonality depends on the inner product choice, and what completeness (Hilbert space) means.',
    detectIncorrectApplication: 'Catch negative-weight inner products (fails positive definiteness); catch pointwise vs. integral confusion; catch assuming orthogonality is absolute.',
    transferToUnfamiliar: 'Apply function inner products to Fourier series, quantum mechanics, or polynomial approximation — any context where geometry extends to infinite-dimensional function spaces.',
  },
};
