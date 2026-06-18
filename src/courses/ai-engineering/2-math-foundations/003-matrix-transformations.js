export default {
  id: 'ae-p1-03-matrix-transformations',
  slug: 'matrix-transformations',
  chapter: 'ae-p1',
  order: 2,
  title: 'Matrix Transformations',
  subtitle: 'A matrix is a machine that reshapes space. Learn what it does to every point, and you understand the whole transformation.',
  tags: ['rotation', 'scaling', 'shearing', 'reflection', 'eigenvalues', 'eigenvectors', 'pca', 'composition', 'determinant'],

  hook: {
    question: 'What does PCA mean when it says "find the eigenvectors of the covariance matrix"?',
    realWorldContext:
      'You read about PCA and see "find the eigenvectors of the covariance matrix." You read about model stability and see "check if all eigenvalues have magnitude less than 1." You read about data augmentation and see "apply a random rotation." None of this makes sense until you understand what matrices do to space geometrically. Matrices are not just grids of numbers — they are spatial machines. A rotation matrix spins points. A scaling matrix stretches them. A shearing matrix tilts them.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every linear transformation in 2D can be written as a 2×2 matrix. The matrix tells you exactly where the basis vectors [1,0] and [0,1] end up — everything else follows. Applying transformation A then B is `result = B @ A @ point`. Order matters: rotating then scaling gives different results than scaling then rotating.',
      'Eigenvectors are the special directions a matrix only scales, never rotates. The scaling factor is the eigenvalue. For PCA: the eigenvectors of the covariance matrix are the principal components. For RNN stability: eigenvalues > 1 cause outputs to explode (exploding gradient problem stated in one sentence).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The determinant is the volume scaling factor',
        body: 'det=1: area preserved (rotation). det=2: area doubled. det=0: space crushed to lower dimension (singular matrix). det=-1: area preserved but orientation flipped (reflection). |det(Scale sx, sy)| = sx × sy.',
      },
      {
        type: 'insight',
        title: 'Eigenvalues determine RNN stability',
        body: 'In recurrent networks, repeated matrix multiplication by a matrix amplifies eigenvalue directions. Eigenvalues > 1 cause exponential growth (exploding gradients). Eigenvalues < 1 cause exponential decay (vanishing gradients). This is the entire vanishing/exploding gradient problem.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Matrix Transformations',
        mathBridge: 'Rotation matrix: R(θ) = [[cos θ, -sin θ], [sin θ, cos θ]]. The columns are where [1,0] and [0,1] go. Eigenvalues from characteristic equation: det(A - λI) = 0 → λ² - trace(A)·λ + det(A) = 0.',
        caption: 'Build every standard 2D transformation from scratch, then compute eigenvalues to see what PCA finds.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rotation, scaling, shearing, and reflection matrices',
              prose: [
                '## Every 2D transformation has a matrix',
                'The matrix\'s columns are where the basis vectors land:\n- **Rotation** R(θ) = [[cos θ, -sin θ], [sin θ, cos θ]]\n- **Scaling** S(sx, sy) = [[sx, 0], [0, sy]]\n- **Shear x** = [[1, k], [0, 1]]\n- **Reflect y-axis** = [[-1, 0], [0, 1]]',
              ],
              code: `import math

def rotation_2d(theta):
    c, s = math.cos(theta), math.sin(theta)
    return [[c, -s], [s, c]]

def scaling_2d(sx, sy):
    return [[sx, 0], [0, sy]]

def shearing_2d(kx, ky):
    return [[1, kx], [ky, 1]]

def reflection_x():
    return [[1, 0], [0, -1]]

def reflection_y():
    return [[-1, 0], [0, 1]]

def mat_vec_mul(matrix, vector):
    return [
        sum(matrix[i][j] * vector[j] for j in range(len(vector)))
        for i in range(len(matrix))
    ]

def mat_mul(a, b):
    rows_a, cols_b = len(a), len(b[0])
    cols_a = len(a[0])
    return [
        [sum(a[i][k] * b[k][j] for k in range(cols_a)) for j in range(cols_b)]
        for i in range(rows_a)
    ]

point = [1.0, 0.0]
angle = math.pi / 4

rotated = mat_vec_mul(rotation_2d(angle), point)
print(f"Rotate (1,0) by 45 deg: ({rotated[0]:.4f}, {rotated[1]:.4f})")

scaled = mat_vec_mul(scaling_2d(2, 3), [1.0, 1.0])
print(f"Scale (1,1) by (2,3): ({scaled[0]:.1f}, {scaled[1]:.1f})")

sheared = mat_vec_mul(shearing_2d(1, 0), [1.0, 1.0])
print(f"Shear (1,1) kx=1: ({sheared[0]:.1f}, {sheared[1]:.1f})")

reflected = mat_vec_mul(reflection_y(), [2.0, 1.0])
print(f"Reflect (2,1) across y: ({reflected[0]:.1f}, {reflected[1]:.1f})")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Composition of transformations (order matters)',
              prose: [
                '## Composition: chaining transformations',
                'Applying transformation A then B = `B @ A @ point`. Order matters — rotation then scaling ≠ scaling then rotation.',
                '**Rotate 90° then scale (2, 0.5):**\n[1,0] → rotate → [0,1] → scale → [0, 0.5]\n\n**Scale (2, 0.5) then rotate 90°:**\n[1,0] → scale → [2,0] → rotate → [0, 2]\n\nDifferent results. Matrix multiplication is not commutative.',
              ],
              code: `R = rotation_2d(math.pi / 2)
S = scaling_2d(2, 0.5)

rotate_then_scale = mat_mul(S, R)
scale_then_rotate = mat_mul(R, S)

point = [1.0, 0.0]
result1 = mat_vec_mul(rotate_then_scale, point)
result2 = mat_vec_mul(scale_then_rotate, point)

print(f"Rotate 90 then scale (2,0.5): ({result1[0]:.2f}, {result1[1]:.2f})")
print(f"Scale (2,0.5) then rotate 90: ({result2[0]:.2f}, {result2[1]:.2f})")
print(f"Same? {[round(x,4) for x in result1] == [round(x,4) for x in result2]}")

def det_2x2(matrix):
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

print(f"\\nDeterminant properties:")
print(f"  det(rotation 45) = {det_2x2(rotation_2d(math.pi/4)):.4f}  (area preserved)")
print(f"  det(scale 2,3)   = {det_2x2(scaling_2d(2, 3)):.1f}  (area scaled by 6)")
print(f"  det(shear kx=1)  = {det_2x2(shearing_2d(1, 0)):.1f}  (area preserved)")
print(f"  det(reflect y)   = {det_2x2(reflection_y()):.1f}  (orientation flipped)")
singular = [[1, 2], [2, 4]]
print(f"  det(singular)    = {det_2x2(singular):.1f}  (space collapsed to a line)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Eigenvalues and eigenvectors from scratch',
              prose: [
                '## What eigenvectors are',
                'Most vectors change direction when multiplied by a matrix. Eigenvectors are special: the matrix only scales them, never rotates.\n`A @ v = λ × v`\nv is the eigenvector (direction that survives), λ is the eigenvalue (how much it stretches).',
                '## Finding eigenvalues of a 2×2 matrix',
                'Solve the characteristic equation: `λ² - trace(A)·λ + det(A) = 0`',
                '## Why eigenvalues matter for AI',
                '**PCA:** eigenvectors of covariance matrix = principal components. Eigenvalues = variance captured.\n**Stability:** eigenvalues > 1 → exploding gradients. Eigenvalues < 1 → vanishing gradients.\n**Spectral clustering:** uses eigenvalues of the graph Laplacian.',
              ],
              code: `def eigenvalues_2x2(matrix):
    a, b = matrix[0]
    c, d = matrix[1]
    trace = a + d
    det = a * d - b * c
    discriminant = trace ** 2 - 4 * det
    if discriminant < 0:
        real = trace / 2
        imag = (-discriminant) ** 0.5 / 2
        return (complex(real, imag), complex(real, -imag))
    sqrt_disc = discriminant ** 0.5
    return ((trace + sqrt_disc) / 2, (trace - sqrt_disc) / 2)

def eigenvector_2x2(matrix, eigenvalue):
    a, b = matrix[0]
    c, d = matrix[1]
    if abs(b) > 1e-10:
        v = [b, eigenvalue - a]
    elif abs(c) > 1e-10:
        v = [eigenvalue - d, c]
    else:
        v = [1, 0] if abs(a - eigenvalue) < 1e-10 else [0, 1]
    mag = (v[0] ** 2 + v[1] ** 2) ** 0.5
    return [v[0] / mag, v[1] / mag]

A = [[2, 1], [1, 2]]
vals = eigenvalues_2x2(A)
print(f"Matrix: {A}")
print(f"Eigenvalues: {vals[0]:.4f}, {vals[1]:.4f}")

for val in vals:
    vec = eigenvector_2x2(A, val)
    result = mat_vec_mul(A, vec)
    scaled = [val * vec[0], val * vec[1]]
    print(f"  lambda={val:.1f}, v={[round(x,4) for x in vec]}")
    print(f"    A@v = {[round(x,4) for x in result]}")
    print(f"    l*v = {[round(x,4) for x in scaled]}")
    print(f"    Same: {all(abs(r - s) < 1e-6 for r, s in zip(result, scaled))}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'NumPy: transformations and eigendecomposition',
              prose: [
                '## NumPy for transformations',
                '```python\nimport numpy as np\n\ntheta = np.pi / 4\nR = np.array([[np.cos(theta), -np.sin(theta)],\n              [np.sin(theta),  np.cos(theta)]])\n\npoint = np.array([1.0, 0.0])\nprint(f"Rotate (1,0) by 45 deg: {R @ point}")\n```',
                '## Eigendecomposition A = V @ D @ V⁻¹',
                'V = matrix of eigenvectors (columns), D = diagonal matrix of eigenvalues.',
              ],
              code: `import numpy as np

theta = np.pi / 4
R = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])

point = np.array([1.0, 0.0])
print(f"Rotate (1,0) by 45 deg: {R @ point}")

S = np.diag([2.0, 3.0])
composed = S @ R
print(f"Scale(2,3) after Rotate(45): {composed @ point}")

A = np.array([[2, 1], [1, 2]], dtype=float)
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"\\nEigenvalues: {eigenvalues}")
print(f"Eigenvectors (columns):\\n{eigenvectors}")

for i in range(len(eigenvalues)):
    v = eigenvectors[:, i]
    lam = eigenvalues[i]
    print(f"  Verify: A@v{i} ≈ lambda*v{i}: {np.allclose(A @ v, lam * v)}")

print(f"\\ndet(R) = {np.linalg.det(R):.4f}  (rotation preserves area)")
print(f"det(S) = {np.linalg.det(S):.1f}   (scaling multiplies area)")

B = np.array([[3, 1], [0, 2]], dtype=float)
vals, vecs = np.linalg.eig(B)
D = np.diag(vals)
V = vecs
reconstructed = V @ D @ np.linalg.inv(V)
print(f"\\nEigendecomposition A = V @ D @ V^-1:")
print(f"  Original B == Reconstructed: {np.allclose(B, reconstructed)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Transformation composition pipeline',
              difficulty: 'easy',
              prompt: 'Write `compose_transforms(transforms)` that takes a list of 2×2 transformation matrices (each a list of lists) and returns the composed transformation matrix by multiplying them left to right. Then write `apply_transform(matrix, points)` that applies a 2×2 matrix to a list of [x, y] points and returns transformed points.',
              code: `import math

def compose_transforms(transforms):
    """
    Compose a list of 2x2 transformation matrices.
    Returns the composed matrix (left-to-right application order).
    transforms: list of [[a, b], [c, d]] matrices
    Note: to apply A then B, order in list should be [B, A] (B @ A)
    """
    pass

def apply_transform(matrix, points):
    """
    Apply a 2x2 transformation matrix to a list of [x, y] points.
    Returns list of transformed [x, y] points.
    """
    pass

# Rotation then scaling
R = [[0, -1], [1, 0]]   # 90 degree rotation
S = [[2, 0], [0, 0.5]]  # scale x by 2, y by 0.5

# Apply R first, then S: composed = S @ R
composed = compose_transforms([S, R])
print(f"Composed (S @ R) = {[[round(x, 4) for x in row] for row in composed]}")

# Apply to unit vectors
points = [[1, 0], [0, 1], [1, 1]]
transformed = apply_transform(composed, points)
print(f"\\nTransformed points:")
for orig, new in zip(points, transformed):
    print(f"  {orig} → {[round(x, 4) for x in new]}")

# Verify: three 90-degree rotations = one 270-degree rotation
R90 = [[0, -1], [1, 0]]
R270 = compose_transforms([R90, R90, R90])  # three 90-degree rotations
print(f"\\n3x90° rotations: {[[round(x, 2) for x in row] for row in R270]}")
print(f"Expected 270° rot: {[[round(x, 2) for x in row] for row in [[0, 1], [-1, 0]]]}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'compose_transforms' not in dir() or 'apply_transform' not in dir():
    res = "ERROR: compose_transforms or apply_transform not defined."
else:
    # Identity: compose with identity = same matrix
    I = [[1, 0], [0, 1]]
    R = [[0, -1], [1, 0]]
    composed_with_I = compose_transforms([I, R])
    expected = [[0, -1], [1, 0]]
    ok1 = all(abs(composed_with_I[i][j] - expected[i][j]) < 1e-6 for i in range(2) for j in range(2))
    if not ok1:
        res = f"ERROR: compose(I, R) should give R, got {composed_with_I}"
    else:
        pts = [[1, 0], [0, 1]]
        transformed = apply_transform(I, pts)
        if transformed[0] != [1, 0] and not (abs(transformed[0][0]-1)<0.001 and abs(transformed[0][1])<0.001):
            res = f"ERROR: apply identity to [1,0] should give [1,0], got {transformed[0]}"
        else:
            # Three 90-degree rotations = 270 degrees
            R90 = [[0, -1], [1, 0]]
            R270 = compose_transforms([R90, R90, R90])
            pt = apply_transform(R270, [[1, 0]])[0]
            if abs(pt[0]) > 0.001 or abs(pt[1] - (-1)) > 0.001:
                # 270 degree rotation of [1,0] = [0,-1]
                res = f"ERROR: 3x90° rotation of [1,0] should give [0,-1], got {pt}"
            else:
                res = "SUCCESS: compose_transforms and apply_transform work correctly."
res
`,
              hint: 'compose_transforms: start with transforms[0], then multiply each subsequent matrix on the left. mat_mul([a,b],[c,d]) pattern. apply_transform: for each [x,y], result = [matrix[0][0]*x + matrix[0][1]*y, matrix[1][0]*x + matrix[1][1]*y].',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Eigenvalue stability analyzer',
              difficulty: 'medium',
              prompt: 'Write `analyze_stability(weight_matrix)` that takes a 2×2 matrix and returns a dict with `"eigenvalues"` (list of floats/complex), `"max_magnitude"` (largest |eigenvalue|), `"status"` (one of "stable", "unstable", "marginally_stable"), and `"interpretation"` (a string explaining what this means for a recurrent network). Stable means all |λ| < 1, unstable means any |λ| > 1, marginally stable means all |λ| ≤ 1 with at least one = 1.',
              code: `import math

def eigenvalues_2x2(matrix):
    a, b = matrix[0]
    c, d = matrix[1]
    trace = a + d
    det = a * d - b * c
    discriminant = trace ** 2 - 4 * det
    if discriminant < 0:
        real = trace / 2
        imag = (-discriminant) ** 0.5 / 2
        return [complex(real, imag), complex(real, -imag)]
    sqrt_disc = discriminant ** 0.5
    return [(trace + sqrt_disc) / 2, (trace - sqrt_disc) / 2]

def analyze_stability(weight_matrix):
    """
    Analyze the stability of a recurrent weight matrix based on eigenvalues.
    Returns: {eigenvalues, max_magnitude, status, interpretation}
    """
    pass

test_cases = [
    {"name": "Stable (vanishing)", "matrix": [[0.5, 0.1], [0.0, 0.4]]},
    {"name": "Unstable (exploding)", "matrix": [[1.5, 0.2], [0.1, 1.3]]},
    {"name": "Marginally stable", "matrix": [[1.0, 0.0], [0.0, 0.9]]},
    {"name": "Rotation (stable)", "matrix": [[0, -1], [1, 0]]},
]

for case in test_cases:
    result = analyze_stability(case["matrix"])
    print(f"{case['name']}:")
    print(f"  eigenvalues: {[round(abs(v), 4) if isinstance(v, complex) else round(v, 4) for v in result['eigenvalues']]}")
    print(f"  max |lambda|: {result['max_magnitude']:.4f}")
    print(f"  status: {result['status']}")
    print(f"  interpretation: {result['interpretation']}")
    print()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'analyze_stability' not in dir():
    res = "ERROR: analyze_stability not defined."
else:
    stable = analyze_stability([[0.5, 0.0], [0.0, 0.3]])
    if stable.get('status') != 'stable':
        res = f"ERROR: [[0.5,0],[0,0.3]] should be stable, got {stable.get('status')}"
    else:
        unstable = analyze_stability([[1.5, 0.0], [0.0, 0.8]])
        if unstable.get('status') != 'unstable':
            res = f"ERROR: [[1.5,0],[0,0.8]] should be unstable, got {unstable.get('status')}"
        elif unstable.get('max_magnitude', 0) < 1.4:
            res = f"ERROR: max_magnitude should be ~1.5, got {unstable.get('max_magnitude')}"
        else:
            marginal = analyze_stability([[1.0, 0.0], [0.0, 0.5]])
            if marginal.get('status') != 'marginally_stable':
                res = f"ERROR: [[1,0],[0,0.5]] should be marginally_stable, got {marginal.get('status')}"
            else:
                res = "SUCCESS: analyze_stability correctly classifies eigenvalue stability."
res
`,
              hint: 'Compute eigenvalues_2x2, then for each eigenvalue compute abs() (handles complex). max_magnitude = max of all magnitudes. status: all < 1 → stable, any > 1 → unstable, else marginally_stable.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is an eigenvector of a matrix?',
      options: [
        'The largest row in the matrix',
        'A vector that the matrix only scales (never rotates) when multiplied',
        'A vector perpendicular to all columns of the matrix',
        'The diagonal entries of the matrix expressed as a vector',
      ],
      correct: 1,
      explanation: 'An eigenvector v satisfies Av = lambda*v, meaning the matrix A only stretches v by the scalar factor lambda (the eigenvalue) without changing its direction.',
    },
    {
      id: 'q2',
      question: 'What does the determinant of a 2D transformation matrix represent geometrically?',
      options: [
        'The angle of rotation applied by the matrix',
        'The factor by which the matrix scales area',
        'The number of eigenvectors the matrix has',
        'The trace of the matrix',
      ],
      correct: 1,
      explanation: 'The determinant measures how much the transformation scales area. det=1 preserves area (rotation), det=2 doubles area, det=0 crushes to a lower dimension, and det=-1 preserves area but flips orientation.',
    },
    {
      id: 'q3',
      question: 'Why does the order of matrix transformations matter? (i.e., why is R @ S different from S @ R?)',
      options: [
        'Matrix addition is not commutative',
        'Matrix multiplication is not commutative: rotating then scaling gives a different result than scaling then rotating',
        'The determinants are different for each order',
        'One order produces a larger matrix than the other',
      ],
      correct: 1,
      explanation: 'Matrix multiplication is not commutative. Rotating (1,0) by 90 degrees then scaling by (2,0.5) gives (0,0.5), but scaling first then rotating gives (0,2). The geometric operations compose differently.',
    },
    {
      id: 'q4',
      question: 'In a recurrent neural network, what happens when the weight matrix has eigenvalues with magnitude greater than 1?',
      options: [
        'The network learns faster',
        'Outputs explode exponentially over time steps (exploding gradient problem)',
        'The network becomes more stable',
        'The eigenvalues converge to 1 over training',
      ],
      correct: 1,
      explanation: 'Repeated multiplication by a matrix amplifies the eigenvalue directions. Eigenvalues > 1 cause exponential growth (exploding gradients), while eigenvalues < 1 cause exponential decay (vanishing gradients).',
    },
    {
      id: 'q5',
      question: 'The matrix A = [[2, 1], [1, 2]] has eigenvalues 3 and 1. What does eigendecomposition A = V @ D @ V^(-1) reveal?',
      options: [
        'A is equivalent to two rotations',
        'A stretches space by 3x along the [1,1] direction and leaves the [1,-1] direction unchanged',
        'A compresses all vectors by a factor of 2',
        'A has rank 1 and maps all vectors to a line',
      ],
      correct: 1,
      explanation: 'The eigenvalue 3 with eigenvector [1,1] means A stretches 3x along the diagonal. The eigenvalue 1 with eigenvector [1,-1] means A leaves the anti-diagonal unchanged. D holds {3,1}, V holds the eigenvectors.',
    },
  ],
}
