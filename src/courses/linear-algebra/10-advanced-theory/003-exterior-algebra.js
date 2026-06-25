import wedgeOrientationUrl from '../diagrams/la-wedge-orientation.svg?url';
import wedgeShearUrl from '../diagrams/la-wedge-shear-invariance.svg?url';

export default {
  id: 'la10-003',
  slug: 'exterior-algebra',
  chapter: 'la10',
  order: 3,
  title: 'Exterior Algebra and Determinants',
  subtitle: 'The wedge product $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k$ measures oriented $k$-dimensional volume. The determinant is the top-degree wedge product. Differential forms are dual wedge products — the foundation of integration on manifolds.',
  tags: ['exterior algebra', 'wedge product', 'determinant', 'differential forms', 'volume form', 'alternating multilinear', 'Grassmann algebra', 'orientation'],
  aliases: 'exterior algebra wedge product alternating multilinear determinant volume form differential forms Grassmann algebra orientation integration manifold',

  hook: {
    question: "Why does the determinant satisfy $\\det(AB) = \\det(A)\\det(B)$ and $\\det$ changes sign when two rows are swapped? These properties aren\'t coincidences — they follow from a single algebraic structure: the exterior algebra.",
    realWorldContext: "The exterior algebra is the algebraic foundation of differential geometry and modern physics. Maxwell\'s equations in their natural form are written using differential forms (wedge products on spacetime). The integral theorems (Green\'s, Stokes\', Gauss\') become a single formula $\\int_M d\\omega = \\int_{\\partial M} \\omega$. In robotics and computer vision, the wedge product computes cross products and oriented areas. In algebraic topology, homology groups are computed using the exterior algebra.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Where you are in the story: tensor products gave you a way to combine two vectors into an element of a higher-dimensional space, preserving all bilinear information. But most interesting geometric quantities — area, volume, orientation — are not just bilinear; they are **antisymmetric**. Swapping two vectors should negate the result because swapping two edges of a parallelogram reverses its orientation. Exterior algebra is the tensor product algebra with antisymmetry built in, and it turns out that the determinant, the cross product, and the integral theorems of calculus are all special cases.',
      'The concrete starting point: take $\\mathbf{u} = (3,1)$ and $\\mathbf{v} = (1,2)$ in $\\mathbb{R}^2$. The unsigned area of the parallelogram they span is $|3 \\cdot 2 - 1 \\cdot 1| = 5$. But orientation matters. Walking along $\\mathbf{u}$ then $\\mathbf{v}$ goes counterclockwise — positive orientation. The **wedge product** $\\mathbf{u} \\wedge \\mathbf{v}$ encodes this as $+5$. Walking $\\mathbf{v}$ then $\\mathbf{u}$ goes clockwise: $\\mathbf{v} \\wedge \\mathbf{u} = -5$. The fundamental rule is $\\mathbf{v} \\wedge \\mathbf{u} = -(\\mathbf{u} \\wedge \\mathbf{v})$, which implies $\\mathbf{u} \\wedge \\mathbf{u} = 0$ (a parallelogram with two equal edges has zero area). This antisymmetry is the algebraic DNA of the exterior algebra.',
      ] },
      { type: 'image', src: wedgeOrientationUrl,
        alt: 'Two panels showing the same parallelogram spanned by u and v: walking u then v traces it counterclockwise giving +5, walking v then u traces it clockwise giving -5',
        caption: 'Same shape, opposite walking order, opposite sign — the wedge product remembers orientation, area alone does not.' },
      { type: 'prose', paragraphs: [
      'The $k$-th exterior power $\\Lambda^k V$ is the space of all formal antisymmetric $k$-fold tensor products. It is spanned by $\\mathbf{e}_{i_1} \\wedge \\mathbf{e}_{i_2} \\wedge \\cdots \\wedge \\mathbf{e}_{i_k}$ for all ordered index tuples $i_1 < i_2 < \\cdots < i_k$ (antisymmetry makes the ordering canonical). Dimension: $\\dim \\Lambda^k V = \\binom{n}{k}$. For $V = \\mathbb{R}^3$: $\\dim \\Lambda^1 = 3$, $\\dim \\Lambda^2 = 3$, $\\dim \\Lambda^3 = 1$. The top exterior power $\\Lambda^n V$ always has dimension 1 — there is only one oriented $n$-volume up to scaling.',
      'The determinant is the element of $\\Lambda^n V$ produced by wedging all $n$ columns of a matrix. Precisely: for $A = [\\mathbf{v}_1 | \\cdots | \\mathbf{v}_n]$, the wedge product $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_n = \\det(A) \\cdot (\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n)$. Since $\\Lambda^n \\mathbb{R}^n$ is 1-dimensional, everything is a scalar multiple of the "standard volume element" $\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n$, and that scalar is the determinant. All three familiar determinant properties fall out of the wedge product rules: antisymmetry of $\\wedge$ gives the row-swap sign change; distributivity gives multilinearity; and $\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n = \\det(I) \\cdot \\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n$ forces $\\det(I)=1$.',
      '**Predict before reading on:** Let $\\mathbf{u} = (2,0)$ and $\\mathbf{v} = (0,3)$. Predict the signed area $\\mathbf{u} \\wedge \\mathbf{v}$. Is it positive or negative? What is $\\mathbf{v} \\wedge \\mathbf{u}$? And what is $\\mathbf{u} \\wedge (\\mathbf{u} + \\mathbf{v})$ — does adding $\\mathbf{u}$ to the second vector change the area?',
      'Answers: $\\mathbf{u} \\wedge \\mathbf{v} = \\det\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix} = +6$ (counterclockwise). $\\mathbf{v} \\wedge \\mathbf{u} = -6$ (clockwise). $\\mathbf{u} \\wedge (\\mathbf{u}+\\mathbf{v}) = \\mathbf{u} \\wedge \\mathbf{u} + \\mathbf{u} \\wedge \\mathbf{v} = 0 + 6 = 6$ — same area, because shifting $\\mathbf{v}$ by $\\mathbf{u}$ slides the parallelogram without changing its area (a shear). This is exactly why row operations of type "add multiple of one row to another" leave the determinant unchanged.',
      ] },
      { type: 'image', src: wedgeShearUrl,
        alt: 'A dashed parallelogram spanned by u and v next to a solid sheared parallelogram spanned by u and u+v, both with identical base and height',
        caption: 'Sliding the top edge along u (a shear) never changes the base or the height — so the wedge product, and the area, stay the same.' },
      { type: 'prose', paragraphs: [
      'The $k$-dimensional volume of the parallelepiped spanned by $k$ vectors in $\\mathbb{R}^n$ (where $k < n$) is $\\|\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k\\| = \\sqrt{\\det(V^\\top V)}$ where $V$ is the $n \\times k$ matrix with those vectors as columns. The matrix $G = V^\\top V$ is the **Gram matrix**, and $\\sqrt{\\det G}$ is the **Gram determinant**. This formula appears whenever you change variables in a multi-dimensional integral: the Jacobian determinant is the signed volume of the image of the unit cube under the transformation.',
      'Differential forms are the dual side of exterior algebra. A $k$-form on $\\mathbb{R}^n$ is an element of $\\Lambda^k(\\mathbb{R}^n)^*$ — an antisymmetric $k$-linear functional on tangent vectors. The 1-form $dx$ measures how much a curve moves in the $x$-direction; the 2-form $dx \\wedge dy$ measures oriented area in the $xy$-plane. The exterior derivative $d$ maps $k$-forms to $(k+1)$-forms, and the fundamental theorem of calculus, Green\'s theorem, Stokes\' theorem, and the divergence theorem all become a single equation: $\\int_M d\\omega = \\int_{\\partial M} \\omega$.',
      'Where this is heading: the next lesson extends the analysis from finite-dimensional vector spaces to infinite-dimensional **Hilbert spaces** and the operators on them. In finite dimensions, every symmetric matrix has real eigenvalues and an orthonormal eigenbasis. In infinite dimensions, this becomes the spectral theorem for compact self-adjoint operators — the mathematical foundation of quantum mechanics, Fourier analysis, and the study of differential equations.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Exterior Algebra in Python',
        mathBridge: 'Compute signed areas and volumes as determinants, verify the Gram determinant formula, and see how shear operations preserve area.',
        caption: 'Determinant = signed volume of parallelepiped; antisymmetry explains every determinant rule.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Signed area, orientation, and antisymmetry',
              prose: [
                'Verify the three wedge product rules computationally: antisymmetry (swap = negate), nilpotency (v∧v = 0), and that shears preserve area.',
                'In 2D, the wedge product `u∧v` is represented by `np.cross(u,v)` (the scalar determinant). Antisymmetry: `np.cross(u,v) == -np.cross(v,u)`. Nilpotency: `np.cross(u,u) == 0`. Shear: `S = np.array([[1,k],[0,1]])`. Area of parallelogram: `np.cross(u,v)`. After shear: `np.cross(S@u, S@v) == np.linalg.det(S) * np.cross(u,v) == np.cross(u,v)` (since det(S)=1).',
                'Visualise: draw parallelogram with vertices 0, u, v, u+v (blue). Draw sheared parallelogram 0, Su, Sv, Su+Sv (red). Both have the same area (|cross product|). The shapes look very different but signed area is preserved. This is the geometric meaning of determinant = 1 for shear matrices.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Polygon

# In 2D, u∧v = det([u|v]) = u[0]*v[1] - u[1]*v[0]
def wedge_2d(u, v):
    return u[0]*v[1] - u[1]*v[0]

u = np.array([3., 1.])
v = np.array([1., 2.])

print(f"u = {u}, v = {v}")
print(f"u ∧ v = {wedge_2d(u, v):.3f}  (signed area, counterclockwise)")
print(f"v ∧ u = {wedge_2d(v, u):.3f}  (same area, flipped sign)")
print(f"u ∧ u = {wedge_2d(u, u):.3f}  (zero: degenerate)")

# Shear preserves area: u ∧ (v + c*u) = u ∧ v
c = 3.7
print(f"\\nShear test: u ∧ (v + {c}*u) = {wedge_2d(u, v + c*u):.3f}")
print(f"u ∧ v = {wedge_2d(u, v):.3f}  (shear preserves area ✓)")

# Visualize parallelograms
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
for ax, (A, B, title) in zip(axes, [
    (u, v, f"u ∧ v = +{wedge_2d(u,v):.1f}"),
    (v, u, f"v ∧ u = {wedge_2d(v,u):.1f}")]):
    O = np.array([0.,0.])
    pts = np.array([O, A, A+B, B, O])
    ax.fill(pts[:,0], pts[:,1], alpha=0.3,
            color='green' if wedge_2d(A,B)>0 else 'red')
    ax.annotate('', xy=A, xytext=O, arrowprops=dict(arrowstyle='->', lw=2, color='blue'))
    ax.annotate('', xy=B, xytext=O, arrowprops=dict(arrowstyle='->', lw=2, color='orange'))
    ax.set_aspect('equal'); ax.grid(True)
    ax.set_title(title + ' (green=+, red=-)')
plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,

              cellTitle: 'Gram determinant: k-dimensional volume',
              prose: [
                'Compute the volume of a k-dimensional parallelepiped in R^n using the Gram determinant formula sqrt(det(V^T V)).',
                '`V = np.column_stack([v1, v2, ..., vk])` — k vectors as columns. k-volume = `np.sqrt(np.linalg.det(V.T @ V))`. For k=2 in R^3: this equals `np.linalg.norm(np.cross(v1,v2))` (area of parallelogram). For k=1: it equals `np.linalg.norm(v1)`. For k=n: it equals `abs(np.linalg.det(V))`.',
                'Verify the cross-product agreement: `v1 = np.array([1,0,0]); v2 = np.array([0,1,0])`. Gram: `np.sqrt(det(V.T@V)) = 1`. Cross product magnitude: `norm(cross(v1,v2)) = 1`. Now rotate both vectors: `area` is preserved (since det(rotation)=1). This confirms Gram determinant gives the intrinsic k-dimensional volume independent of the ambient embedding.',
              ],
              code: `import numpy as np

# Three vectors in R^4 — compute the 3D volume of the parallelepiped they span
V = np.array([[1, 0, 1, 0],
              [0, 2, 0, 1],
              [1, 1, 2, 0]], dtype=float).T  # 4x3 matrix: columns are vectors

# Gram determinant: Vol = sqrt(det(V^T V))
G = V.T @ V
print("Gram matrix G = V^T V:")
print(G.round(4))
vol_gram = np.sqrt(np.linalg.det(G))
print(f"\\n3D volume via Gram determinant: sqrt(det G) = {vol_gram:.4f}")

# For n=k (square matrix), should equal |det A|
A = np.array([[2, 1, 0],
              [0, 3, 1],
              [1, 0, 4]], dtype=float)
vol_direct = abs(np.linalg.det(A))
G_sq = A.T @ A
vol_gram_sq = np.sqrt(np.linalg.det(G_sq))
print(f"\\nFor square 3x3 matrix:")
print(f"|det A| = {vol_direct:.4f}")
print(f"sqrt(det(A^T A)) = {vol_gram_sq:.4f}")
print(f"Equal? {np.isclose(vol_direct, vol_gram_sq)}")

# Geometric meaning: volume scales under linear maps
# det(A): signed volume of image of unit cube
scale = 2.0
print(f"\\nIf we scale A by {scale}: new volume = {scale**3 * vol_direct:.4f}")
print(f"det({scale}*A) = {np.linalg.det(scale * A):.4f}  = {scale}^3 * det(A)")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Wedge Products and Determinants',
        mathBridge: 'Compute determinants as volumes and explore exterior algebra properties.',
        caption: 'Determinant = signed volume of parallelepiped = alternating multilinear form.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Determinant as oriented area',
              prose: [
                'Verify that the determinant gives signed area/volume and satisfies alternating property.',
                '`u=[3;1]; v=[1;2]; area_signed = det([u v])`. Swap: `area_swapped = det([v u])`. Verify: `area_swapped == -area_signed`. Nilpotency: `det([u u]) == 0`. Multilinearity: `det([2*u v]) == 2*det([u v])`.',
                'Visualisation: `fill([0 u(1) u(1)+v(1) v(1)], [0 u(2) u(2)+v(2) v(2)], \'blue\', \'FaceAlpha\', 0.3)`. The signed area is positive if u,v have counter-clockwise orientation and negative if clockwise. This sign is the key feature that makes determinants so powerful — they detect orientation.',
              ],
              code: `% 2D: det gives signed area of parallelogram
u = [3; 1]
v = [1; 2]
A = [u, v]

% Signed area = det
area_signed = det(A)
disp('Signed area of parallelogram (u,v):')
area_signed
area_unsigned = abs(area_signed)
disp('Unsigned area:')
area_unsigned

% Swap u and v: sign changes
area_swapped = det([v, u])
disp('Swapped (should negate):')
area_swapped

% 3D volume
a = [1;0;0]; b=[0;2;0]; c=[0;0;3]
vol = det([a,b,c])
disp('Volume of box (should be 1*2*3=6):')
vol
`,
            },
            {
              id: 2,
              cellTitle: 'Gram determinant for k-volume',
              prose: [
                'Compute the k-dimensional volume of a parallelotope using the Gram determinant.',
                '`V = [v1 v2]` (columns). Gram determinant: `vol = sqrt(det(V\'*V))`. For 2 vectors in R^3: this equals `norm(cross(v1,v2))`. For 3 vectors in R^3: `sqrt(det(V\'*V)) == abs(det(V))` (same as ordinary determinant for square V).',
                'Test: `v1=[1;0;0]; v2=[0;1;0]`. Gram: `sqrt(det([v1 v2]\'*[v1 v2])) = 1`. Rotate both: `R=expm([0 -pi/4 0; pi/4 0 0; 0 0 0]); v1r=R*v1; v2r=R*v2; sqrt(det([v1r v2r]\'*[v1r v2r]))` still equals 1. The Gram determinant gives intrinsic area that is rotation-invariant — it measures the "size" of the 2D subspace, not the orientation in R^3.',
              ],
              code: `% Volume of parallelogram in R^3 spanned by 2 vectors
% (result lives in a 2D plane, 2D volume)
v1 = [1; 2; 0]
v2 = [0; 1; 3]
V = [v1, v2]

% Gram matrix G = V^T V
G = V' * V
disp('Gram matrix:')
G

% k-dimensional volume = sqrt(det(G))
vol_2d = sqrt(det(G))
disp('2D volume (area) in R^3:')
vol_2d

% Cross-check via cross product (only works in R^3)
cross_prod = cross(v1, v2)
area_cross = norm(cross_prod)
disp('Area via cross product:')
area_cross

% They should agree
disp('Difference (should be 0):')
abs(vol_2d - area_cross)
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Compute with the Wedge Product (4 Steps)',
        body: '1. **Expand bilinearly.** Distribute over addition and pull out scalars: $(\\alpha\\mathbf{u}+\\beta\\mathbf{w}) \\wedge \\mathbf{v} = \\alpha(\\mathbf{u}\\wedge\\mathbf{v}) + \\beta(\\mathbf{w}\\wedge\\mathbf{v})$. Apply linearity in both arguments.\n2. **Apply the alternating property.** Immediately replace $\\mathbf{e}_i \\wedge \\mathbf{e}_i = 0$ (any repeated factor vanishes) and $\\mathbf{e}_j \\wedge \\mathbf{e}_i = -(\\mathbf{e}_i \\wedge \\mathbf{e}_j)$ (swapping reverses sign). Always rewrite each basis term with indices in increasing order.\n3. **Read off the determinant or k-minor.** The coefficient of $\\mathbf{e}_{i_1}\\wedge\\cdots\\wedge\\mathbf{e}_{i_k}$ in $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k$ is the $k \\times k$ minor of $[\\mathbf{v}_1|\\cdots|\\mathbf{v}_k]$ using rows $i_1,\\ldots,i_k$.\n4. **Compute k-volume.** For $k$ vectors in $\\mathbb{R}^k$ (square case): $\\text{Vol} = |\\det[\\mathbf{v}_1|\\cdots|\\mathbf{v}_k]|$. For $k$ vectors in $\\mathbb{R}^n$ with $k < n$ (non-square case): use the Gram determinant $\\text{Vol} = \\sqrt{\\det(V^\\top V)}$ where $V = [\\mathbf{v}_1|\\cdots|\\mathbf{v}_k]$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 3 of 5 — Advanced Theory',
        body: '**Previous (Lesson 2):** Tensor Products — bilinear maps, universal property, Kronecker product, vectorization identity.\n**This lesson:** Exterior Algebra — antisymmetric tensors, wedge product, determinants as volume, differential forms.\n**Next (Lesson 4):** Operator Theory — bounded operators, spectrum, spectral theorem for compact self-adjoint operators.',
      },
      {
        type: 'theorem',
        title: 'Determinant from Wedge Product',
        body: 'The determinant is the unique alternating multilinear form on $\\mathbb{R}^n$ with $\\det(I) = 1$. Equivalently:\n\n$\\det A = $ coefficient of $\\mathbf{e}_1 \\wedge \\cdots \\wedge \\mathbf{e}_n$ in $A\\mathbf{e}_1 \\wedge \\cdots \\wedge A\\mathbf{e}_n$\n\nThe three determinant properties follow:\n- Alternating (swap rows → sign change): $\\mathbf{v}_i \\wedge \\mathbf{v}_j = -\\mathbf{v}_j \\wedge \\mathbf{v}_i$\n- Multilinear in each row\n- $\\det I = 1$',
      },
      {
        type: 'insight',
        title: 'Exterior Powers and Gram Determinant',
        body: 'The $k$-dimensional volume of the parallelepiped spanned by $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$ in $\\mathbb{R}^n$ is:\n\n$\\text{Vol}_k = \\|\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k\\| = \\sqrt{\\det(V^\\top V)}$\n\nwhere $V = [\\mathbf{v}_1 | \\cdots | \\mathbf{v}_k]$ and $G = V^\\top V$ is the **Gram matrix**.\n\n$\\sqrt{\\det G}$ = Gram determinant. This formula appears in multi-variable integration (change of variables, Jacobians).',
      },
    ],
  },

  math: {
    prose: [
      '**Exterior power basis.** For $V = \\mathbb{R}^n$ with basis $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$: the basis of $\\Lambda^k V$ is $\\{\\mathbf{e}_{i_1} \\wedge \\cdots \\wedge \\mathbf{e}_{i_k} : i_1 < \\cdots < i_k\\}$. This has $\\binom{n}{k}$ elements. Any $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_k$ can be written as a linear combination of these basis elements, with coefficients equal to the $k \\times k$ minors of the matrix $[\\mathbf{v}_1 | \\cdots | \\mathbf{v}_k]$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Plücker Relations',
        body: 'The $k$-vectors (elements of $\\Lambda^k V$) that come from actual $k$-tuples of vectors in $V$ are called **decomposable**. A general element of $\\Lambda^k V$ may not be decomposable (for $k \\geq 2$, $n \\geq 4$).\n\nThe Plücker embedding identifies the Grassmannian $\\text{Gr}(k,n)$ (set of $k$-planes in $\\mathbb{R}^n$) with a subvariety of $\\mathbb{P}(\\Lambda^k \\mathbb{R}^n)$ via $W \\mapsto \\mathbf{w}_1 \\wedge \\cdots \\wedge \\mathbf{w}_k$ (for any basis $\\{\\mathbf{w}_i\\}$ of $W$).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Stokes\' theorem unifies everything.** Let $\\omega$ be a smooth $(k-1)$-form and $M$ a compact $k$-dimensional manifold with boundary $\\partial M$. Then $\\int_M d\\omega = \\int_{\\partial M} \\omega$. This single formula specializes to: the fundamental theorem of calculus ($k=1$), Green\'s theorem ($k=2$ in $\\mathbb{R}^2$), classical Stokes\' theorem ($k=2$ in $\\mathbb{R}^3$), and the divergence theorem ($k=3$). The exterior derivative $d$ and the wedge product are the algebraic machinery behind all of these.',
      '**The exterior derivative and $d^2=0$.** The exterior derivative $d: \\Omega^k(M) \\to \\Omega^{k+1}(M)$ generalizes gradient, curl, and divergence to arbitrary differential forms. For a 0-form (scalar function) $f$: $df = \\sum_i \\frac{\\partial f}{\\partial x_i}\\,dx_i$ — this is the gradient. For a 1-form $\\omega = \\sum_i f_i\\,dx_i$: $d\\omega = \\sum_{i<j}\\left(\\frac{\\partial f_j}{\\partial x_i} - \\frac{\\partial f_i}{\\partial x_j}\\right) dx_i \\wedge dx_j$ — this is the curl. For a 2-form in $\\mathbb{R}^3$: $d$ produces the divergence form. The defining property is $d^2 = 0$: applying $d$ twice always gives zero. In classical vector calculus: $\\text{curl}(\\nabla f) = 0$ and $\\text{div}(\\text{curl}\\,\\mathbf{F}) = 0$ are both special cases of $d^2 = 0$. This single algebraic fact unifies two otherwise-separate vector calculus identities.',
      '**De Rham cohomology.** Since $d^2 = 0$, the image of $d$ (exact forms) is always a subspace of the kernel of $d$ (closed forms). The **de Rham cohomology** $H^k_{\\text{dR}}(M) = \\ker(d: \\Omega^k \\to \\Omega^{k+1}) / \\text{im}(d: \\Omega^{k-1} \\to \\Omega^k)$ measures the difference — it is zero unless the space has "holes" that prevent exact forms from accounting for all closed forms. The de Rham theorem establishes $H^k_{\\text{dR}}(M) \\cong H^k(M;\\mathbb{R})$ (singular cohomology with real coefficients), connecting differential forms to topological invariants. Concretely: a closed but non-exact 1-form on a circle ($\\mathbb{S}^1$) corresponds to the fact that you cannot globally define a single-valued antiderivative of $d\\theta$ — it detects the "hole" in the circle.',
      '**Pfaffian and skew-symmetric determinants.** For a $2n \\times 2n$ skew-symmetric matrix $A$ ($A^\\top = -A$), the determinant is always a perfect square: $\\det(A) = (\\text{Pf}(A))^2$. The **Pfaffian** $\\text{Pf}(A)$ arises from the exterior algebra: it is the coefficient of $(e_1 \\wedge \\cdots \\wedge e_{2n})$ in $\\frac{1}{n!}\\left(\\sum_{i<j} a_{ij}\\, e_i \\wedge e_j\\right)^n$. For a $4\\times 4$ skew matrix: $\\text{Pf}(A) = a_{12}a_{34} - a_{13}a_{24} + a_{14}a_{23}$. The Pfaffian appears in quantum field theory (fermionic Gaussian integrals), the combinatorics of perfect matchings in graphs (Kasteleyn\'s theorem for counting matchings in planar graphs), and numerical eigenvalue algorithms for skew-symmetric matrices.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Hodge Star and Duality',
        body: 'On a Riemannian manifold with volume form $\\text{vol}$, the **Hodge star** $\\star: \\Lambda^k V \\to \\Lambda^{n-k} V$ satisfies $\\alpha \\wedge \\star\\beta = \\langle\\alpha,\\beta\\rangle \\cdot \\text{vol}$.\n\nIn $\\mathbb{R}^3$: $\\star(dx) = dy \\wedge dz$, $\\star(dy \\wedge dz) = dx$. The cross product $\\mathbf{u} \\times \\mathbf{v} = \\star(\\mathbf{u} \\wedge \\mathbf{v})$.\n\nHodge decomposition: every $k$-form = exact + co-exact + harmonic. Used in numerical PDE, fluid simulation, and the Laplacian on forms.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-003-1',
      title: 'Wedge product in $\\mathbb{R}^3$',
      problem: 'Compute $(2\\mathbf{e}_1 + \\mathbf{e}_2) \\wedge (\\mathbf{e}_1 + 3\\mathbf{e}_3)$ in $\\Lambda^2\\mathbb{R}^3$ and identify the result with a cross product.',
      steps: [
        { explanation: 'Expand by bilinearity: $(2e_1+e_2)\\wedge(e_1+3e_3) = 2e_1\\wedge e_1 + 6e_1\\wedge e_3 + e_2\\wedge e_1 + 3e_2\\wedge e_3$.' },
        { explanation: 'Apply alternating property: $e_1\\wedge e_1 = 0$; $e_2\\wedge e_1 = -(e_1\\wedge e_2)$. Result: $0 + 6e_1\\wedge e_3 - e_1\\wedge e_2 + 3e_2\\wedge e_3$.' },
        { explanation: 'Reorder to standard basis $\\{e_1\\wedge e_2, e_1\\wedge e_3, e_2\\wedge e_3\\}$: $= -e_1\\wedge e_2 + 6e_1\\wedge e_3 + 3e_2\\wedge e_3$. So coordinates in $\\Lambda^2\\mathbb{R}^3$ are $(-1, 6, 3)$.' },
        { explanation: 'Cross product connection via Hodge star: $(2,1,0)\\times(1,0,3) = \\det\\begin{pmatrix}e_1&e_2&e_3\\\\2&1&0\\\\1&0&3\\end{pmatrix} = (3,-6,-1)$. The coordinates in $\\Lambda^2$ correspond to the cross product up to sign convention: $\\star(-e_{12}+6e_{13}+3e_{23}) = (3,-6,-1)^\\top$ ✓.' },
      ],
    },
    {
      id: 'ex-la10-003-2',
      title: 'Determinant as top wedge coefficient',
      problem: 'Verify that $\\det\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix} = 5$ using the wedge product approach: compute $(3e_1+e_2)\\wedge(e_1+2e_2)$ and read off the coefficient of $e_1\\wedge e_2$.',
      steps: [
        { explanation: 'Expand: $(3e_1+e_2)\\wedge(e_1+2e_2) = 3e_1\\wedge e_1 + 6e_1\\wedge e_2 + e_2\\wedge e_1 + 2e_2\\wedge e_2$.' },
        { explanation: 'Apply alternating: $e_1\\wedge e_1=0$, $e_2\\wedge e_2=0$, $e_2\\wedge e_1 = -e_1\\wedge e_2$. Result: $0 + 6e_1\\wedge e_2 - e_1\\wedge e_2 + 0 = 5e_1\\wedge e_2$.' },
        { explanation: 'The coefficient is $5$, which equals $\\det\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix} = 6-1=5$ ✓. The determinant IS this coefficient.' },
        { explanation: 'Sign interpretation: positive coefficient means the frame $(\\mathbf{u},\\mathbf{v})$ has the same orientation as the standard frame $(e_1,e_2)$ — counterclockwise. A negative coefficient would mean opposite orientation.' },
      ],
    },
    {
      id: 'ex-la10-003-3',
      title: 'Gram determinant for area in $\\mathbb{R}^3$',
      problem: 'Find the area of the parallelogram spanned by $\\mathbf{v}_1=(1,2,0)^\\top$ and $\\mathbf{v}_2=(0,1,3)^\\top$ in $\\mathbb{R}^3$ using the Gram determinant formula $\\sqrt{\\det(V^\\top V)}$.',
      steps: [
        { explanation: 'Form the matrix $V = [\\mathbf{v}_1 | \\mathbf{v}_2]$. Compute $V^\\top V = \\begin{pmatrix}\\mathbf{v}_1^\\top\\mathbf{v}_1 & \\mathbf{v}_1^\\top\\mathbf{v}_2 \\\\ \\mathbf{v}_2^\\top\\mathbf{v}_1 & \\mathbf{v}_2^\\top\\mathbf{v}_2\\end{pmatrix}$.' },
        { explanation: '$\\mathbf{v}_1^\\top\\mathbf{v}_1 = 1+4+0=5$, $\\mathbf{v}_1^\\top\\mathbf{v}_2 = 0+2+0=2$, $\\mathbf{v}_2^\\top\\mathbf{v}_2 = 0+1+9=10$. So $V^\\top V = \\begin{pmatrix}5&2\\\\2&10\\end{pmatrix}$.' },
        { explanation: '$\\det(V^\\top V) = 50-4 = 46$. Area $= \\sqrt{46} \\approx 6.78$.' },
        { explanation: 'Cross-check via cross product: $\\mathbf{v}_1 \\times \\mathbf{v}_2 = (2\\cdot3-0\\cdot1,\\, 0\\cdot0-1\\cdot3,\\, 1\\cdot1-2\\cdot0) = (6,-3,1)$. Area $= \\|(6,-3,1)\\| = \\sqrt{36+9+1} = \\sqrt{46}$ ✓.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la10-003-1',
      title: 'Alternating property implies antisymmetry',
      difficulty: 'medium',
      problem: 'Using only the alternating property $\\mathbf{v} \\wedge \\mathbf{v} = 0$ and bilinearity, prove that $\\mathbf{u} \\wedge \\mathbf{v} = -(\\mathbf{v} \\wedge \\mathbf{u})$. Then use this to explain why swapping two rows of a matrix changes the determinant sign.',
      walkthrough: [
        {
          expression: '(\\mathbf{u} + \\mathbf{v}) \\wedge (\\mathbf{u} + \\mathbf{v}) = 0 \\quad (\\text{alternating: any vector wedged with itself is 0})',
          annotation: 'Apply the alternating property to the vector $\\mathbf{u} + \\mathbf{v}$: since anything wedged with itself gives 0, the whole expression is 0.',
        },
        {
          expression: '\\mathbf{u}\\wedge\\mathbf{u} + \\mathbf{u}\\wedge\\mathbf{v} + \\mathbf{v}\\wedge\\mathbf{u} + \\mathbf{v}\\wedge\\mathbf{v} = 0',
          annotation: 'Expand using bilinearity (distributivity over addition in both factors). Each term is a wedge of two vectors.',
        },
        {
          expression: '0 + \\mathbf{u}\\wedge\\mathbf{v} + \\mathbf{v}\\wedge\\mathbf{u} + 0 = 0 \\quad \\Rightarrow \\quad \\mathbf{u}\\wedge\\mathbf{v} = -(\\mathbf{v}\\wedge\\mathbf{u})',
          annotation: 'The two self-wedge terms vanish by alternating property: $\\mathbf{u}\\wedge\\mathbf{u} = 0$ and $\\mathbf{v}\\wedge\\mathbf{v}=0$. The remaining two terms must sum to zero, so they are negatives of each other.',
        },
        {
          expression: '\\text{Row swap in det}: \\mathbf{v}_1\\wedge\\cdots\\wedge\\mathbf{v}_i\\wedge\\cdots\\wedge\\mathbf{v}_j\\wedge\\cdots = -(\\mathbf{v}_1\\wedge\\cdots\\wedge\\mathbf{v}_j\\wedge\\cdots\\wedge\\mathbf{v}_i\\wedge\\cdots)',
          annotation: 'For the determinant: swapping rows $i$ and $j$ in $[\\mathbf{v}_1|\\cdots|\\mathbf{v}_n]$ swaps the two corresponding factors in $\\mathbf{v}_1 \\wedge \\cdots \\wedge \\mathbf{v}_n$, which negates the whole product by the antisymmetry we just proved.',
        },
      ],
    },
    {
      id: 'ch-la10-003-2',
      title: 'Compute a wedge product and read the determinant',
      difficulty: 'easy',
      problem: 'Expand the wedge product $(2\\mathbf{e}_1 + \\mathbf{e}_2) \\wedge (\\mathbf{e}_1 + 3\\mathbf{e}_2)$ in $\\mathbb{R}^2$ and read off the value of $\\det\\begin{pmatrix}2&1\\\\1&3\\end{pmatrix}$.',
      walkthrough: [
        {
          expression: '(2\\mathbf{e}_1+\\mathbf{e}_2)\\wedge(\\mathbf{e}_1+3\\mathbf{e}_2) = 2\\mathbf{e}_1\\wedge\\mathbf{e}_1 + 6\\mathbf{e}_1\\wedge\\mathbf{e}_2 + \\mathbf{e}_2\\wedge\\mathbf{e}_1 + 3\\mathbf{e}_2\\wedge\\mathbf{e}_2',
          annotation: 'Expand bilinearly: distribute the wedge product over addition in both factors.',
        },
        {
          expression: '= 0 + 6\\mathbf{e}_1\\wedge\\mathbf{e}_2 - \\mathbf{e}_1\\wedge\\mathbf{e}_2 + 0 = 5\\mathbf{e}_1\\wedge\\mathbf{e}_2',
          annotation: 'Apply alternating: $\\mathbf{e}_1\\wedge\\mathbf{e}_1 = 0$ and $\\mathbf{e}_2\\wedge\\mathbf{e}_2 = 0$. Apply antisymmetry: $\\mathbf{e}_2\\wedge\\mathbf{e}_1 = -\\mathbf{e}_1\\wedge\\mathbf{e}_2$. Collect terms.',
        },
        {
          expression: '\\mathbf{v}_1\\wedge\\mathbf{v}_2 = 5\\,(\\mathbf{e}_1\\wedge\\mathbf{e}_2) = \\det\\begin{pmatrix}2&1\\\\1&3\\end{pmatrix} \\cdot (\\mathbf{e}_1\\wedge\\mathbf{e}_2)',
          annotation: 'The coefficient of the basis element $\\mathbf{e}_1\\wedge\\mathbf{e}_2$ in the top exterior power is exactly the determinant. Reading off: $\\det = 5$.',
        },
        {
          expression: '\\det\\begin{pmatrix}2&1\\\\1&3\\end{pmatrix} = 6 - 1 = 5 \\; \\checkmark',
          annotation: 'Direct verification: $2 \\cdot 3 - 1 \\cdot 1 = 5$. The wedge product computation gives the same answer as cofactor expansion — they are the same thing from different angles.',
        },
      ],
    },
    {
      id: 'ch-la10-003-3',
      title: 'Gram determinant gives 2-volume in R^4',
      difficulty: 'hard',
      problem: 'Compute the area of the parallelogram spanned by $\\mathbf{v}_1=(1,0,1,0)^\\top$ and $\\mathbf{v}_2=(0,1,0,1)^\\top$ in $\\mathbb{R}^4$. Explain why there is no cross product formula here.',
      walkthrough: [
        {
          expression: 'V = \\begin{pmatrix}1&0\\\\0&1\\\\1&0\\\\0&1\\end{pmatrix} \\in \\mathbb{R}^{4\\times 2}, \\quad G = V^\\top V = \\begin{pmatrix}\\mathbf{v}_1^\\top\\mathbf{v}_1 & \\mathbf{v}_1^\\top\\mathbf{v}_2 \\\\ \\mathbf{v}_2^\\top\\mathbf{v}_1 & \\mathbf{v}_2^\\top\\mathbf{v}_2\\end{pmatrix}',
          annotation: 'Form the $4\\times 2$ matrix $V$ with the two vectors as columns, then compute the $2\\times 2$ Gram matrix $G = V^\\top V$. The Gram matrix encodes all pairwise inner products.',
        },
        {
          expression: '\\mathbf{v}_1^\\top\\mathbf{v}_1 = 1+0+1+0 = 2, \\quad \\mathbf{v}_1^\\top\\mathbf{v}_2 = 0+0+0+0 = 0, \\quad \\mathbf{v}_2^\\top\\mathbf{v}_2 = 0+1+0+1 = 2',
          annotation: 'Compute each inner product: $\\mathbf{v}_1^\\top\\mathbf{v}_1 = 2$, $\\mathbf{v}_1^\\top\\mathbf{v}_2 = 0$ (orthogonal!), $\\mathbf{v}_2^\\top\\mathbf{v}_2 = 2$.',
        },
        {
          expression: 'G = \\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}, \\quad \\det G = 4, \\quad \\text{Area} = \\sqrt{\\det G} = 2',
          annotation: 'Since $\\mathbf{v}_1 \\perp \\mathbf{v}_2$ (inner product = 0) and both have length $\\sqrt{2}$, the Gram matrix is diagonal. The parallelogram is a rectangle: area $= \\sqrt{2} \\cdot \\sqrt{2} = 2$.',
        },
        {
          expression: '\\text{No cross product in } \\mathbb{R}^4: \\; \\text{cross product} \\cong \\star(\\mathbf{v}_1 \\wedge \\mathbf{v}_2) \\in \\Lambda^{4-2}\\mathbb{R}^4 = \\Lambda^2\\mathbb{R}^4 \\quad (6\\text{-dimensional})',
          annotation: 'The Hodge star in $\\mathbb{R}^4$ maps $\\Lambda^2\\mathbb{R}^4 \\to \\Lambda^2\\mathbb{R}^4$ (both 6-dimensional). The result is a 2-vector, not a single vector. A "cross product" producing a vector from two vectors only works in $\\mathbb{R}^3$ (where $\\Lambda^{3-2} = \\Lambda^1$ is the original vector space). The Gram determinant formula works in any dimension.',
        },
      ],
    },
  ],

  mentalModel: [
    '$\\mathbf{u} \\wedge \\mathbf{v}$: oriented area. $\\mathbf{u} \\wedge \\mathbf{v} = -(\\mathbf{v} \\wedge \\mathbf{u})$. $\\mathbf{u} \\wedge \\mathbf{u} = 0$.',
    '$\\Lambda^k V$ has dimension $\\binom{n}{k}$. $\\Lambda^n V$ is 1D — determinant lives here.',
    'Determinant = top-degree wedge = signed $n$-volume. Properties follow from wedge product axioms.',
    'Gram determinant $\\sqrt{\\det V^\\top V}$ = $k$-dimensional volume in $\\mathbb{R}^n$.',
    'Differential forms = wedge products varying smoothly. Stokes\' theorem unifies all integral theorems.',
  ],

  checkpoints: [
    { id: 'cp-la10-003-1', label: 'Read the signed area intro with concrete numbers', type: 'read' },
    { id: 'cp-la10-003-2', label: 'Read how the determinant lives in the top exterior power', type: 'read' },
    { id: 'cp-la10-003-3', label: 'Read the Gram determinant formula for k-volume', type: 'read' },
    { id: 'cp-la10-003-4', label: 'Run the oriented area notebook cell', type: 'lab' },
    { id: 'cp-la10-003-5', label: 'Compute Gram determinant for two vectors in R^3', type: 'lab' },
    { id: 'cp-la10-003-6', label: 'Trace the wedge product expansion example', type: 'example' },
    { id: 'cp-la10-003-7', label: 'Trace the determinant as top wedge coefficient example', type: 'example' },
    { id: 'cp-la10-003-8', label: 'Prove swapping two rows changes the determinant sign using wedge properties', type: 'challenge' },
  ],

  assessment: 'For $\\mathbf{u} = (1,2,0)^\\top$ and $\\mathbf{v} = (0,1,3)^\\top$: (a) compute the Gram matrix and the 2D area they span in $\\mathbb{R}^3$; (b) verify this equals $\\|\\mathbf{u} \\times \\mathbf{v}\\|$.',

  quiz: [
    {
      id: 'q-la10-003-1',
      type: 'choice',
      text: 'The wedge product $\\mathbf{u} \\wedge \\mathbf{v}$ satisfies:',
      options: ['$\\mathbf{u} \\wedge \\mathbf{v} = \\mathbf{v} \\wedge \\mathbf{u}$', '$\\mathbf{u} \\wedge \\mathbf{v} = -\\mathbf{v} \\wedge \\mathbf{u}$', '$\\mathbf{u} \\wedge \\mathbf{v} = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$', '$\\mathbf{u} \\wedge \\mathbf{v} \\in \\mathbb{R}$ always'],
      answer: '$\\mathbf{u} \\wedge \\mathbf{v} = -\\mathbf{v} \\wedge \\mathbf{u}$',
      hints: ['The wedge product is alternating.', 'Swapping the factors reverses orientation — negates the signed volume.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-2',
      type: 'choice',
      text: '$\\dim \\Lambda^2(\\mathbb{R}^4)$ equals:',
      options: ['$2$', '$4$', '$6$', '$8$'],
      answer: '$6$',
      hints: ['$\\dim \\Lambda^k V = \\binom{n}{k}$.', '$\\binom{4}{2} = 6$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-3',
      type: 'choice',
      text: 'The $k$-dimensional volume of vectors $\\mathbf{v}_1,\\ldots,\\mathbf{v}_k$ is:',
      options: ['$\\det[\\mathbf{v}_i]$', '$\\sqrt{\\det(V^\\top V)}$', '$\\|\\mathbf{v}_1\\|\\cdots\\|\\mathbf{v}_k\\|$', '$\\text{tr}(V^\\top V)$'],
      answer: '$\\sqrt{\\det(V^\\top V)}$',
      hints: ['The Gram matrix $G = V^\\top V$ encodes inner products between the vectors.', '$\\sqrt{\\det G}$ is the Gram determinant, giving the $k$-dimensional volume.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-4',
      type: 'choice',
      text: 'For $\\mathbf{u}=(3,1)$ and $\\mathbf{v}=(1,2)$ in $\\mathbb{R}^2$, the signed area $\\mathbf{u}\\wedge\\mathbf{v}$ equals:',
      options: ['$3$', '$5$', '$7$', '$-5$'],
      answer: '$5$',
      hints: ['Signed area = $\\det[\\mathbf{u}|\\mathbf{v}]$.', '$\\det\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix} = 6-1=5$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-5',
      type: 'choice',
      text: 'What is $\\mathbf{e}_2 \\wedge \\mathbf{e}_1$ in terms of $\\mathbf{e}_1 \\wedge \\mathbf{e}_2$?',
      options: ['$\\mathbf{e}_1 \\wedge \\mathbf{e}_2$', '$-\\mathbf{e}_1 \\wedge \\mathbf{e}_2$', '$0$', '$\\mathbf{e}_1 \\wedge \\mathbf{e}_1$'],
      answer: '$-\\mathbf{e}_1 \\wedge \\mathbf{e}_2$',
      hints: ['The alternating property: $\\mathbf{u} \\wedge \\mathbf{v} = -(\\mathbf{v} \\wedge \\mathbf{u})$.', 'Swapping order flips sign.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-6',
      type: 'choice',
      text: 'The dimension of $\\Lambda^n V$ when $\\dim V = n$ is:',
      options: ['$n$', '$n!$', '$1$', '$2^n$'],
      answer: '$1$',
      hints: ['$\\binom{n}{n} = 1$.', 'There is only one basis element: $e_1 \\wedge e_2 \\wedge \\cdots \\wedge e_n$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-7',
      type: 'choice',
      text: 'The determinant $\\det[\\mathbf{v}_1|\\cdots|\\mathbf{v}_n]$ equals the signed volume because:',
      options: [
        'It is the coefficient of $e_1\\wedge\\cdots\\wedge e_n$ in $v_1\\wedge\\cdots\\wedge v_n$',
        'It equals $\\|v_1\\|\\cdots\\|v_n\\|$',
        'It satisfies $\\det(AB) = \\det(A)+\\det(B)$',
        'It counts pivot positions in row reduction',
      ],
      answer: 'It is the coefficient of $e_1\\wedge\\cdots\\wedge e_n$ in $v_1\\wedge\\cdots\\wedge v_n$',
      hints: ['$\\Lambda^n V$ is 1-dimensional, spanned by $e_1\\wedge\\cdots\\wedge e_n$.', 'The determinant IS this scalar coefficient.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-8',
      type: 'choice',
      text: 'The cross product $\\mathbf{u} \\times \\mathbf{v}$ in $\\mathbb{R}^3$ is related to the wedge product by:',
      options: [
        '$\\mathbf{u} \\times \\mathbf{v} = \\star(\\mathbf{u} \\wedge \\mathbf{v})$ (Hodge star)',
        '$\\mathbf{u} \\times \\mathbf{v} = \\mathbf{u} \\wedge \\mathbf{v}$ directly',
        '$\\mathbf{u} \\times \\mathbf{v} = \\mathbf{u} \\otimes \\mathbf{v}$',
        '$\\mathbf{u} \\times \\mathbf{v} = \\det(\\mathbf{u}, \\mathbf{v})$',
      ],
      answer: '$\\mathbf{u} \\times \\mathbf{v} = \\star(\\mathbf{u} \\wedge \\mathbf{v})$ (Hodge star)',
      hints: ['The Hodge star maps $\\Lambda^2\\mathbb{R}^3 \\to \\Lambda^1\\mathbb{R}^3$.', 'It converts the wedge product (area bivector) to the perpendicular vector.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la10-003-9',
      type: 'choice',
      text: 'Why does swapping two rows of a determinant change its sign?',
      options: [
        'Because the wedge product is alternating: swapping two factors negates the wedge',
        'Because row operations multiply the determinant by $-1$ by definition',
        'Because the matrix inverse has a negative sign',
        'Because the trace changes sign under row swaps',
      ],
      answer: 'Because the wedge product is alternating: swapping two factors negates the wedge',
      hints: ['The determinant = coefficient of top wedge product.', 'Swapping $v_i \\leftrightarrow v_j$ in $v_1 \\wedge \\cdots \\wedge v_n$ negates it by the alternating property.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-003-10',
      type: 'choice',
      text: 'For $\\mathbf{v}_1=(1,2,0)$ and $\\mathbf{v}_2=(0,1,3)$ in $\\mathbb{R}^3$, the Gram matrix $V^\\top V$ is:',
      options: [
        '$\\begin{pmatrix}5&2\\\\2&10\\end{pmatrix}$',
        '$\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$',
        '$\\begin{pmatrix}5&0\\\\0&10\\end{pmatrix}$',
        '$\\begin{pmatrix}2&1\\\\0&3\\end{pmatrix}$',
      ],
      answer: '$\\begin{pmatrix}5&2\\\\2&10\\end{pmatrix}$',
      hints: ['$G_{ij} = v_i^\\top v_j$ (dot products).', '$v_1^\\top v_1 = 1+4+0=5$, $v_1^\\top v_2 = 0+2+0=2$, $v_2^\\top v_2 = 0+1+9=10$.'],
      reviewSection: 'examples',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Expand a wedge product like $(ae_1+be_2)\\wedge(ce_1+de_2)$ using bilinearity and alternating property; read off the determinant as the coefficient; compute k-volume using the Gram determinant.',
    explainVerbally: 'Explain why the three determinant properties (alternating, multilinear, det(I)=1) all follow directly from the wedge product, and why the cross product is the Hodge star of the wedge product.',
    detectIncorrectApplication: 'Catch errors like $e_2\\wedge e_1 = e_1\\wedge e_2$ (missing sign flip) or confusing unsigned area $\\sqrt{\\det G}$ with signed determinant.',
    transferToUnfamiliar: 'Given two vectors in $\\mathbb{R}^n$ (for $n>3$), compute the 2-dimensional area they span using the Gram determinant formula.',
  },

  misconceptions: [
    {
      falseBelief: 'The wedge product is the same as the cross product.',
      whyStudentsThinkIt: 'Both $\\mathbf{u}\\wedge\\mathbf{v}$ and $\\mathbf{u}\\times\\mathbf{v}$ are "anti-symmetric" operations on two vectors, and they agree in $\\mathbb{R}^3$ up to the Hodge star identification. Students conflate the two.',
      correctionExample: 'The cross product $\\mathbf{u}\\times\\mathbf{v}$ lives in $\\mathbb{R}^3$ (a vector), while $\\mathbf{u}\\wedge\\mathbf{v}$ lives in $\\Lambda^2\\mathbb{R}^3$ (a bivector). The Hodge star $\\star(\\mathbf{u}\\wedge\\mathbf{v}) = \\mathbf{u}\\times\\mathbf{v}$ converts between them — only in 3D.',
      contrastCase: 'In $\\mathbb{R}^4$, there is no cross product, but there is still a wedge product $\\mathbf{u}\\wedge\\mathbf{v} \\in \\Lambda^2\\mathbb{R}^4$ (6-dimensional space).',
    },
    {
      falseBelief: 'The determinant equals the area because it equals the product of side lengths.',
      whyStudentsThinkIt: 'For axis-aligned rectangles, $\\det\\begin{pmatrix}a&0\\\\0&d\\end{pmatrix}=ad$ which is indeed width times height. Students overgeneralize to all parallelograms.',
      correctionExample: 'For $\\mathbf{u}=(3,1)$, $\\|\\mathbf{u}\\|=\\sqrt{10}$, $\\mathbf{v}=(1,2)$, $\\|\\mathbf{v}\\|=\\sqrt{5}$. Product of lengths $=\\sqrt{50}\\approx7.07$. But $|\\det|=5$. The determinant gives AREA, not the product of lengths.',
      contrastCase: 'The product of lengths gives the area of the rectangle containing the parallelogram. The determinant gives the area of the parallelogram itself, which is smaller whenever the vectors are not perpendicular.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are computing the Jacobian of a change of variables in a double integral. The Jacobian matrix $J$ maps $du\\,dv$ to $dx\\,dy$. How does the wedge product explain why you multiply by $|\\det J|$ in the change-of-variables formula?',
      competingTechniques: 'Just memorize the formula $dx\\,dy = |\\det J|\\,du\\,dv$ vs use the wedge product: $dx \\wedge dy = \\det(J)\\, du \\wedge dv$, deriving the factor from first principles.',
      whyThisTechniqueWins: 'The wedge product derivation shows WHY the formula holds and generalizes immediately to $n$ dimensions and to manifolds (Stokes\' theorem). The memorized formula is just the 2D case.',
    },
    {
      situation: 'In computer graphics, you need to test whether point $P$ is inside triangle $(A,B,C)$ using only signed areas.',
      competingTechniques: 'Use barycentric coordinates (requires solving a linear system) vs check signs of three 2D wedge products: $(B-A)\\wedge(P-A)$, $(C-B)\\wedge(P-B)$, $(A-C)\\wedge(P-C)$.',
      whyThisTechniqueWins: 'The wedge product test ($P$ is inside iff all three have the same sign) is three $2\\times 2$ determinants — no linear system needed, and the sign encodes orientation for free.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{u} \\wedge \\mathbf{v}', meaning: 'Wedge product: antisymmetric bilinear operation; measures oriented area. $\\mathbf{u}\\wedge\\mathbf{v} = -(\\mathbf{v}\\wedge\\mathbf{u})$; $\\mathbf{u}\\wedge\\mathbf{u}=0$. In coordinates: the $2\\times 2$ minor of $[\\mathbf{u}|\\mathbf{v}]$.' },
      { symbol: '\\Lambda^k V', meaning: '$k$-th exterior power: antisymmetric $k$-tensors. $\\dim \\Lambda^k V = \\binom{n}{k}$. Basis: $\\mathbf{e}_{i_1}\\wedge\\cdots\\wedge\\mathbf{e}_{i_k}$ for $i_1 < \\cdots < i_k$. Top power $\\Lambda^n V$ is 1-dimensional.' },
      { symbol: '\\det A', meaning: 'Coefficient of $\\mathbf{e}_1\\wedge\\cdots\\wedge\\mathbf{e}_n$ in $\\mathbf{v}_1\\wedge\\cdots\\wedge\\mathbf{v}_n$: the unique alternating multilinear form with $\\det(I)=1$. All determinant properties follow from wedge product axioms.' },
      { symbol: '\\sqrt{\\det(V^\\top V)}', meaning: 'Gram determinant: $k$-dimensional volume of the parallelepiped spanned by the columns of $V \\in \\mathbb{R}^{n\\times k}$. Reduces to $|\\det V|$ when $k=n$. Required for $k<n$ where a square determinant doesn\'t exist.' },
      { symbol: 'd^2 = 0', meaning: 'Exterior derivative $d: \\Omega^k \\to \\Omega^{k+1}$ satisfies $d \\circ d = 0$. Encodes curl(grad f)=0 and div(curl F)=0 as one identity. The source of de Rham cohomology.' },
      { symbol: '\\int_M d\\omega = \\int_{\\partial M} \\omega', meaning: 'Generalized Stokes\' theorem: a single formula unifying FTC ($k=1$), Green\'s ($k=2$, $\\mathbb{R}^2$), classical Stokes\' ($k=2$, $\\mathbb{R}^3$), and Gauss\' divergence theorem ($k=3$).' },
    ],
    rulesOfThumb: [
      'Always rewrite wedge products with indices in increasing order immediately: $\\mathbf{e}_j \\wedge \\mathbf{e}_i = -\\mathbf{e}_i \\wedge \\mathbf{e}_j$ for $i<j$. Failure to do this is the most common sign error.',
      '$\\dim \\Lambda^k V = \\binom{n}{k}$: product rule at $k=1$ gives $n$, at $k=n$ gives 1 (determinant lives in 1D space). For $k=2$, $n=3$: dimension 3 — same as $V$ itself.',
      'Cross product works only in $\\mathbb{R}^3$ because $\\Lambda^{n-2}\\mathbb{R}^n$ is 1-dimensional only when $n=3$. In $\\mathbb{R}^4$, the result of a "cross product" is a bivector in $\\Lambda^2\\mathbb{R}^4$ (6 dimensions), not a vector.',
      'To compute $k$-volume in $\\mathbb{R}^n$ for $k<n$: always use the Gram determinant $\\sqrt{\\det(V^\\top V)}$. Trying to apply a square determinant formula will fail.',
      '$d^2 = 0$ is the unified source of "curl of grad = 0" and "div of curl = 0" — remember both as one law, not two.',
    ],
  },

  spiral: {
    recoveryPoints: ['la2-007', 'la10-002'],
    futureLinks: ['la10-004', 'la10-005'],
  },

  debugging: [
    {
      commonError: 'Forgetting to flip sign when reordering wedge factors.',
      symptom: 'Student expands $(e_1+e_2)\\wedge(e_1-e_2)$ and writes $e_1\\wedge e_1 - e_1\\wedge e_2 + e_2\\wedge e_1 - e_2\\wedge e_2 = -e_1\\wedge e_2 + e_2\\wedge e_1 = 0$, forgetting $e_2\\wedge e_1 = -e_1\\wedge e_2$.',
      whyItHappened: 'Students treat $e_2\\wedge e_1$ as a new, independent basis element instead of $-(e_1\\wedge e_2)$.',
      repairStrategy: 'Always rewrite every wedge product with indices in increasing order immediately. Set $e_2\\wedge e_1 = -e_1\\wedge e_2$ as you go. Correct: $-e_1\\wedge e_2 + e_2\\wedge e_1 = -e_1\\wedge e_2 - e_1\\wedge e_2 = -2e_1\\wedge e_2$. The correct answer is $-2e_1\\wedge e_2$, corresponding to $\\det\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}=-2$.',
    },
    {
      commonError: 'Using $\\det[v_1|\\cdots|v_k]$ for $k$-volume when $k < n$ (vectors in $\\mathbb{R}^n$).',
      symptom: 'Student tries to compute the area of two vectors in $\\mathbb{R}^3$ using a $3\\times 3$ determinant, but can only form a $3\\times 2$ matrix.',
      whyItHappened: 'The formula $\\text{Vol} = |\\det M|$ applies when the matrix is square (same dimension as the space). For $k < n$, the correct formula is the Gram determinant $\\sqrt{\\det(V^\\top V)}$.',
      repairStrategy: 'For two vectors in $\\mathbb{R}^3$: form the $3\\times 2$ matrix $V$, compute $V^\\top V$ (a $2\\times 2$ Gram matrix), then area $= \\sqrt{\\det(V^\\top V)}$. Equivalently, use the cross product for $k=2$, $n=3$.',
    },
  ],
};
