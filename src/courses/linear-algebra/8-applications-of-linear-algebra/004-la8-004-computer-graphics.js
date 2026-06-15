export default {
  id: 'la8-004',
  slug: 'computer-graphics-transformations',
  chapter: 'la8',
  order: 4,
  title: 'Computer Graphics Transformations',
  subtitle: 'Every rotation, translation, scaling, and projection in 3D graphics is a matrix multiplication. Homogeneous coordinates unify all affine transformations into 4×4 matrix products.',
  tags: ['computer graphics', 'homogeneous coordinates', 'transformation matrix', 'rotation', 'translation', 'projection', 'camera model', 'MVP matrix'],
  aliases: 'computer graphics homogeneous coordinates 4x4 transformation matrix rotation translation projection camera model MVP model view projection affine',

  hook: {
    question: "A 3D game renders 60 frames per second with millions of triangles. Every vertex must be rotated, translated, and projected onto a 2D screen. How can a GPU do this efficiently for every vertex?",
    realWorldContext: "Modern real-time graphics — from video games to surgical simulations to AR/VR — are built on matrix transformations. The GPU pipeline applies the model matrix (place object in world), view matrix (position camera), and projection matrix (perspective). These three 4×4 matrices are multiplied together into the MVP matrix once per draw call, then multiplied with each vertex. OpenGL, DirectX, Vulkan, and WebGL all use this linear algebra foundation. CAD software (SolidWorks, AutoCAD), visual effects (Maya, Blender), and robotics (forward kinematics) all use the same framework.",
  },

  intuition: {
    prose: [
      '**Where you are in the story.** Chapter 8 has shown you linear algebra applied to data (PCA), networks (PageRank), and differential equations (ODEs). This final lesson brings it home to something you interact with every day: 3D graphics. Every frame of every video game, every rendered 3D model, every AR effect on your phone is computed using the same $4 \\times 4$ matrix multiplication you have been practicing for months. The abstract machinery becomes concrete here in a way you can see and feel.',

      '**The problem with translation.** Rotation and scaling are linear maps: $R(\\mathbf{x} + \\mathbf{y}) = R\\mathbf{x} + R\\mathbf{y}$. But translation is not — adding a displacement vector is not a matrix multiplication in 3D. This is inconvenient: if you want to compose "scale, then rotate, then translate," you need two different types of operations mixed together. The GPU cannot efficiently handle that. The fix: work in one higher dimension.',

      '**Homogeneous coordinates: embed 3D in 4D.** Represent a 3D point $(x, y, z)$ as the 4D vector $(x, y, z, 1)^\\top$. Represent a direction as $(x, y, z, 0)^\\top$. Now translation by $(t_x, t_y, t_z)$ becomes a $4 \\times 4$ matrix with the translation in the last column. The key: now translation, rotation, and scaling are ALL $4 \\times 4$ matrix multiplications. Composing them is just matrix multiplication. The GPU does one matrix multiply per vertex — extremely fast.',

      '**Concrete: rotate then translate.** Rotate $(1,0,0)$ by $90°$ around the $z$-axis, then translate by $(3,2,0)$. Encode as one matrix product: $T \\cdot R_z(90°) \\cdot (1,0,0,1)^\\top$. The rotation gives $(0,1,0,1)^\\top$, then the translation adds $(3,2,0)$ to get $(3,3,0,1)^\\top$ — world position $(3,3,0)$. Order matters: matrix multiplication is not commutative, and the matrices are applied right-to-left (rightmost first).',

      '**Predict before reading on.** You want to scale a point by 2, then rotate $90°$ around the $z$-axis. Is the combined matrix $R_z \\cdot S$ or $S \\cdot R_z$? Which applies the scale first? Write your answer before continuing.',

      '**The MVP pipeline.** In a 3D game engine, every vertex goes through three transforms: the Model matrix $M$ (places the object in world space), the View matrix $V$ (positions the camera — inverse of camera\'s own transform), and the Projection matrix $P$ (creates perspective by dividing by depth). The combined MVP matrix $M_{mvp} = P \\cdot V \\cdot M$ is computed once per draw call on the CPU, then every vertex just multiplies: $\\mathbf{v}_{clip} = M_{mvp}\\mathbf{v}_{model}$. After that, dividing each coordinate by the $w$ component gives the 2D screen position.',

      '**Rotation matrices are orthogonal — and that has consequences.** Every rotation matrix $R$ satisfies $R^\\top R = I$, which means $R^{-1} = R^\\top$. To undo a rotation (go back to camera space from world space), you just take the transpose — no matrix inversion needed. Since all rotations preserve vector lengths ($\\|R\\mathbf{v}\\| = \\|\\mathbf{v}\\|$), the GPU can apply millions of rotations per frame without any accumulating distortion. This orthogonality is why the Schur decomposition (unitary matrices) is so powerful numerically — the same reason rotation matrices are so elegant in graphics.',

      '**Where this is heading.** Chapter 8 showed applications across data science, networks, dynamical systems, and graphics. Chapter 9 returns to numerical methods: iterative solvers for large sparse systems. The conjugate gradient method, GMRES, and preconditioning let you solve million-variable linear systems that would be impossible with direct methods. The tools are different but the core ideas — eigenvalues, condition numbers, orthogonality — are everything you have built so far.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Build and Compose 4×4 Transformation Matrices (4 Steps)',
        body: '1. **Identify the transforms needed** and their order (stated left-to-right in English, e.g., "scale, then rotate, then translate").\n2. **Write each as a 4×4 matrix.** Translation: identity with $(t_x,t_y,t_z)^\\top$ in the last column. Rotation $R_z(\\theta)$: top-left $2\\times2$ is $\\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}$, rest is identity. Scaling: diagonal $(s_x, s_y, s_z, 1)$.\n3. **Compose right-to-left.** If you want "scale first, rotate second, translate third": form $M = T \\cdot R \\cdot S$. The rightmost matrix acts on the vertex first.\n4. **Apply to vertices.** Points as $(x,y,z,1)^\\top$; directions as $(x,y,z,0)^\\top$. After perspective projection, divide $x,y,z$ by $w$ to get normalized device coordinates.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 4 of 4 — Applications of Linear Algebra',
        body: '**Previous (Lesson 3):** ODEs and linear systems — eigenvalues determine stability; matrix exponential.\n**This lesson:** Computer graphics — homogeneous coordinates, 4×4 MVP pipeline, rotation matrices are orthogonal.\n**Next (Chapter 9):** Iterative solvers — conjugate gradient, GMRES, preconditioning for large sparse systems.',
      },
      {
        type: 'insight',
        title: 'Transformation Composition Order',
        body: 'Transformations applied right-to-left: $M_{total}\\mathbf{v} = M_n \\cdots M_2 M_1 \\mathbf{v}$\n\nIn graphics: $M_{mvp} = P \\cdot V \\cdot M$\n- $M$: model → world (object placement)\n- $V$: world → camera (inverse camera transform)\n- $P$: camera → clip (perspective)\n\n**Matrix multiplication is NOT commutative. Order is critical.**',
      },
      {
        type: 'insight',
        title: 'Rotation Matrices Are Orthogonal',
        body: 'All $3 \\times 3$ (or $4 \\times 4$) rotation matrices $R$ satisfy $R^\\top R = I$:\n\n$R^{-1} = R^\\top$ (fast inversion: just transpose)\n$\\det(R) = 1$ (preserves orientation)\n$\\|R\\mathbf{v}\\| = \\|\\mathbf{v}\\|$ (preserves lengths)\nAngles and dot products preserved',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Graphics Transformations with NumPy',
        mathBridge: 'Build 4x4 homogeneous transformation matrices, compose them with matrix multiplication, and implement a simple MVP pipeline.',
        caption: 'Every vertex in a 3D game executes exactly this matrix multiply — just at GPU speed, a billion times per second.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Build 4x4 transformation matrices',
              prose: [
                'Construct translation, rotation, and scaling matrices in homogeneous coordinates.',
                'Translation: `T = np.eye(4); T[:3,3] = [tx,ty,tz]`. Rotation around Z: `theta = np.pi/4; Rz = np.eye(4); Rz[0,0]=Rz[1,1]=np.cos(theta); Rz[0,1]=-np.sin(theta); Rz[1,0]=np.sin(theta)`. Scale: `S = np.diag([sx,sy,sz,1])`. Apply: `M = T @ Rz @ S; point = np.array([1,0,0,1]); result = M @ point`.',
                'The homogeneous coordinate trick: points are `[x,y,z,1]`, vectors are `[x,y,z,0]`. Translation works on points (the 4th component 1 picks up the translation column) but NOT on vectors (4th component 0 cancels it). This is exactly what you want — translating a direction makes no sense geometrically. Test: `M @ np.array([1,0,0,0])` should not include the translation.',
              ],
              code: `import numpy as np

def translation(tx, ty, tz):
    T = np.eye(4)
    T[:3, 3] = [tx, ty, tz]
    return T

def rotation_z(theta):
    c, s = np.cos(theta), np.sin(theta)
    R = np.eye(4)
    R[:2, :2] = [[c, -s], [s, c]]
    return R

def scaling(sx, sy, sz):
    return np.diag([sx, sy, sz, 1.0])

# Compose: scale by 2, rotate 45 deg, translate (3, 1, 0)
M = translation(3, 1, 0) @ rotation_z(np.pi/4) @ scaling(2, 2, 2)
print("Composed transform (Scale -> Rotate -> Translate):")
print(np.round(M, 4))

# Apply to point (1, 0, 0)
p = np.array([1, 0, 0, 1.0])
p_transformed = M @ p
print("\\nTransformed point (1,0,0):", np.round(p_transformed[:3], 4))
`,
            },
            {
              id: 2,
              cellTitle: 'Order matters: commutativity test',
              prose: [
                'Verify that matrix multiplication is NOT commutative for transformations.',
                '`M1 = T @ R` (translate then rotate) vs `M2 = R @ T` (rotate then translate). `np.allclose(M1, M2)` will return False. Apply both to a triangle: `tri = np.array([[0,1,0],[0,0,1],[0,0,0],[1,1,1]])`. Plot `(M1 @ tri)[:2]` and `(M2 @ tri)[:2]` to see the different results.',
                'The geometric intuition: "rotate about the origin, then move" is different from "move, then rotate about the original origin." The order encodes the reference point of the rotation. In game engines, the transform stack is always read right-to-left: `M = T @ R @ S` means "first scale, then rotate, then translate." Reversing gives a completely different object position.',
              ],
              code: `import numpy as np

def rotation_z(theta):
    c, s = np.cos(theta), np.sin(theta)
    R = np.eye(4)
    R[:2, :2] = [[c, -s], [s, c]]
    return R

def translation(tx, ty, tz):
    T = np.eye(4)
    T[:3, 3] = [tx, ty, tz]
    return T

p = np.array([1, 0, 0, 1.0])
R = rotation_z(np.pi/2)   # 90 degrees
T = translation(2, 0, 0)

# Rotate then translate: T @ R
result1 = (T @ R) @ p
# Translate then rotate: R @ T
result2 = (R @ T) @ p

print("Rotate then translate (T @ R @ p):", np.round(result1[:3], 4))
print("Translate then rotate (R @ T @ p):", np.round(result2[:3], 4))
print()
print("Same? ", np.allclose(result1, result2))
print("Order matters! (T @ R) != (R @ T)")
`,
            },
            {
              id: 3,
              cellTitle: 'Simple perspective projection',
              prose: [
                'Apply a perspective projection matrix to see how 3D points become 2D screen coordinates.',
                'Perspective matrix for near=n, far=f, fov=90°: `P = np.array([[1,0,0,0],[0,1,0,0],[0,0,-(f+n)/(f-n),-2*f*n/(f-n)],[0,0,-1,0]])`. Apply to homogeneous point: `q = P @ [x,y,z,1]`. Divide by w (perspective divide): `screen = q[:2]/q[3]`. The z coordinate controls the division — distant objects (large z) divide more → appear smaller.',
                'Project a 3D cube onto 2D. Plot all 8 projected vertices and connect the edges. As the cube moves further from the camera (increase z), observe the projected size shrinking. The perspective divide `x_screen = x/z` and `y_screen = y/z` is the fundamental operation: it is a projective transformation, not a linear one (but it IS a linear map in homogeneous coordinates).',
              ],
              code: `import numpy as np

def perspective(fov_y, aspect, near, far):
    """Perspective projection matrix (OpenGL convention)."""
    f = 1.0 / np.tan(fov_y / 2)
    nf = 1.0 / (near - far)
    P = np.zeros((4, 4))
    P[0, 0] = f / aspect
    P[1, 1] = f
    P[2, 2] = (far + near) * nf
    P[2, 3] = 2 * far * near * nf
    P[3, 2] = -1.0
    return P

P = perspective(np.radians(60), 16/9, 0.1, 100)

# Some 3D points at different depths (homogeneous)
points = np.array([
    [0, 0, -5, 1],    # on z-axis, depth 5
    [1, 0, -5, 1],    # to the right, depth 5
    [0, 0, -2, 1],    # closer (depth 2)
])

print("3D -> clip space -> NDC (normalized device coordinates):")
for p in points:
    clip = P @ p
    ndc = clip[:3] / clip[3]   # perspective divide
    print(f"  World {p[:3]} -> NDC {np.round(ndc, 3)}")

print()
print("Objects at z=-2 appear larger than z=-5 (perspective effect)")
`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Graphics Transformation Matrices',
        mathBridge: 'Build and compose 4x4 homogeneous transformation matrices.',
        caption: 'Compose rotation, translation, and scaling via 4x4 matrix multiplication.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Building transformation matrices',
              prose: [
                'Construct translation, rotation, and scaling matrices in homogeneous coordinates.',
                'Translation: `T = eye(4); T(1:3,4) = [tx;ty;tz]`. Rotation about Z: `theta=pi/4; Rz=eye(4); Rz(1,1)=cos(theta); Rz(1,2)=-sin(theta); Rz(2,1)=sin(theta); Rz(2,2)=cos(theta)`. Scale: `S=diag([sx sy sz 1])`. Compose: `M = T * Rz * S`.',
                'Apply to a 3D point `p=[1;0;0;1]` (homogeneous): `result = M*p`. The 4th component stays 1 (point, not vector). A direction vector `v=[1;0;0;0]` is unaffected by translation: `T*v = v`. This is the geometric reason homogeneous coordinates exist: they unify linear (rotation, scale) and affine (translation) transformations into a single matrix multiplication.',
              ],
              code: `% Translation matrix T(tx,ty,tz)
tx = 3; ty = 1; tz = -2
T = eye(4)
T(1,4) = tx; T(2,4) = ty; T(3,4) = tz
disp('Translation matrix:')
T

% Rotation around z-axis by 45 degrees
theta = pi/4
Rz = eye(4)
Rz(1,1) = cos(theta); Rz(1,2) = -sin(theta)
Rz(2,1) = sin(theta); Rz(2,2) = cos(theta)
disp('Rotation (z-axis, 45 deg):')
Rz

% Uniform scaling by factor 2
s = 2
S = diag([s s s 1])
disp('Scaling matrix (factor 2):')
S

% Compose: scale, then rotate, then translate
M = T * Rz * S
disp('Composed transformation (Scale -> Rotate -> Translate):')
M
`,
            },
            {
              id: 2,
              cellTitle: 'Transform a triangle',
              prose: [
                'Apply the composed transform to vertices of a triangle in 3D.',
                '`verts = [0 1 0.5; 0 0 1; 0 0 0; 1 1 1]` (columns = homogeneous vertices). Apply: `result = M * verts`. Extract 3D coords: `result(1:3,:) ./ result(4,:)`. For affine transforms (w stays 1 throughout), the division does nothing. For perspective, it performs the projection.',
                'Plot original triangle (blue) and transformed triangle (red) side by side. Compose several transforms: `M_total = T2 * R * S * T1` and observe the combined effect. The order matters: `T2 * R * S * T1` means "first T1, then S, then R, then T2" — read right-to-left.',
              ],
              code: `% Triangle vertices in homogeneous coords (columns = points)
V = [1  2  1.5;  % x
     0  0  1.5;  % y
     0  0  0;    % z
     1  1  1]    % w (homogeneous)
disp('Original vertices:')
V(1:3,:)

% Build the composed transform (same as before)
tx=1; ty=2; tz=0; theta=pi/6
T = eye(4); T(1:3,4) = [tx;ty;tz]
Rz = eye(4)
Rz(1,1)=cos(theta); Rz(1,2)=-sin(theta)
Rz(2,1)=sin(theta); Rz(2,2)=cos(theta)
M = T * Rz

% Transform all vertices
V_transformed = M * V
disp('Transformed vertices:')
V_transformed(1:3,:)

% Verify rotation preserves distances
d_before = norm(V(1:3,1) - V(1:3,2))
d_after = norm(V_transformed(1:3,1) - V_transformed(1:3,2))
disp('Distance between v1 and v2 before/after rotation:')
[d_before, d_after]
`,
            },
            {
              id: 3,
              cellTitle: 'Perspective projection',
              prose: [
                'Build a perspective projection matrix and project 3D points.',
                'Near/far clip planes n=1, f=10. `P = [1 0 0 0; 0 1 0 0; 0 0 -(f+n)/(f-n) -2*f*n/(f-n); 0 0 -1 0]`. Apply: `q = P * [x;y;z;1]`. Perspective divide: `screen = q(1:2)/q(4)`. Note q(4) = -z (for camera looking in -z direction), so `screen = [x/-z; y/-z]`.',
                'Project a 3D cube: `cube_verts` with z values from 2 to 8. Closer vertices appear larger (projected coords are larger). Plot the projected 2D positions and draw edges. Vary the z distance of the whole cube and observe the size change — this is perspective scaling, the mathematical foundation of all 3D graphics rendering.',
              ],
              code: `% Perspective projection matrix
% fov=60 deg, aspect=16/9, near=0.1, far=100
fov = pi/3; aspect = 16/9; near = 0.1; far = 100
f = 1 / tan(fov/2)
P = zeros(4,4)
P(1,1) = f / aspect
P(2,2) = f
P(3,3) = (far + near) / (near - far)
P(3,4) = (2*far*near) / (near - far)
P(4,3) = -1
disp('Perspective projection matrix:')
P

% Project a 3D point (2, 1, -5) (in camera space, looking down -z)
p = [2; 1; -5; 1]
p_clip = P * p
disp('Clip coordinates:')
p_clip
% Perspective divide (divide by w)
p_ndc = p_clip(1:3) / p_clip(4)
disp('NDC coordinates (Normalized Device Coordinates):')
p_ndc
`,
            },
          ],
        },
      },
      {
        id: 'TransformLab',
        title: 'Transform Lab — 2D Intuition Before 4×4 Matrices',
        mathBridge: 'Before diving into 4×4 homogeneous coordinates, build 2D intuition: place a shape, rotate it by constructing a rotation matrix, reflect it across an axis, then chain two transforms. Every concept — columns encode basis vector destinations, order matters, composition collapses to a product — carries directly into 3D and the graphics pipeline.',
        caption: 'The 4×4 homogeneous matrix is just this 2×2 story extended into 3D with a translation row appended.',
      },
    ],
  },

  math: {
    prose: [
      '**Rodrigues\' rotation formula.** Rotation by angle $\\theta$ about unit axis $\\hat{\\mathbf{n}} = (n_x, n_y, n_z)$: $R = I\\cos\\theta + \\sin\\theta [\\hat{\\mathbf{n}}]_\\times + (1-\\cos\\theta)\\hat{\\mathbf{n}}\\hat{\\mathbf{n}}^\\top$ where $[\\hat{\\mathbf{n}}]_\\times = \\begin{bmatrix}0&-n_z&n_y\\\\n_z&0&-n_x\\\\-n_y&n_x&0\\end{bmatrix}$ is the cross-product matrix. Every rotation in 3D is a rotation about some axis by some angle.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Gimbal Lock',
        body: 'Composing three Euler angle rotations ($R_x R_y R_z$) suffers from **gimbal lock**: when one rotation aligns two axes, a degree of freedom is lost. Quaternions ($q \\in \\mathbb{H}$, $|q| = 1$) avoid this — every rotation corresponds to a unit quaternion. Quaternions are preferred in animation, robotics, and aerospace for smooth interpolation (SLERP) and no gimbal lock.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**The special orthogonal group SO(3).** All $3 \\times 3$ rotation matrices form the Lie group $\\text{SO}(3) = \\{R \\in \\mathbb{R}^{3 \\times 3} : R^\\top R = I, \\det R = 1\\}$. The tangent space at the identity is the Lie algebra $\\mathfrak{so}(3)$ = skew-symmetric matrices. The exponential map $R = e^{[\\hat{\\mathbf{n}}]_\\times \\theta}$ connects Rodrigues\' formula to the matrix exponential. Affine transformations form the group $\\text{SE}(3) = \\text{SO}(3) \\ltimes \\mathbb{R}^3$ (special Euclidean group).',
      '**Quaternions and SLERP.** Unit quaternions $q = a + b\\mathbf{i} + c\\mathbf{j} + d\\mathbf{k}$ with $|q|=1$ form a double cover of $\\text{SO}(3)$: both $q$ and $-q$ represent the same rotation. Composition is quaternion multiplication (bilinear, associative, non-commutative) — 16 multiplications vs. 27 for $3\\times3$ matrices. **SLERP** (spherical linear interpolation) interpolates $q(t) = q_0 (q_0^{-1} q_1)^t$ smoothly along the great circle on $S^3$, avoiding gimbal lock and producing natural-looking animation. Game engines and IMUs use quaternions internally; $4\\times4$ matrices are only assembled at the last step for the GPU.',
      '**Projective geometry and homogeneous coordinates.** The projective space $\\mathbb{RP}^3$ identifies all scalar multiples $\\lambda(x,y,z,w)$ as the same point. Standard 3D is the affine patch $w \\neq 0$; the plane at infinity is $w = 0$. A perspective camera is a projective transformation (linear map on $\\mathbb{RP}^3$) — this is why parallel lines in 3D meet at a vanishing point on screen. The **cross-ratio** of four collinear points is preserved under all projective transformations — the foundation of projective invariance in computer vision and photogrammetry.',
      '**Numerical drift and reorthogonalization.** Composing many rotation matrices in floating point causes $R^\\top R - I$ to drift away from zero — each multiplication introduces $O(\\varepsilon_{\\text{mach}})$ error, which accumulates. Solutions: (1) use quaternions and renormalize $q \\leftarrow q / |q|$ after each step (4 divisions vs. 9-entry correction); (2) Gram-Schmidt or SVD reorthogonalization — compute SVD $R = U\\Sigma V^\\top$ and replace with $UV^\\top$ (nearest orthogonal matrix in Frobenius norm); (3) use the **polar decomposition** $R = (AA^\\top)^{-1/2} A$ to project any nearly-rotation matrix back to $SO(3)$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Forward Kinematics in Robotics',
        body: 'A robot arm with $n$ joints: each joint applies a transformation $T_i$ (rotation + translation) to the previous frame. End-effector position: $T = T_1 T_2 \\cdots T_n$ (product of $4 \\times 4$ homogeneous matrices). This is exactly the computer graphics model-matrix composition. **Inverse kinematics** (find joint angles to reach target) is the inverse problem — solved via Jacobian methods (using the Jacobian of the forward kinematics).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la8-004-1',
      title: 'Rotate then translate',
      problem: 'Rotate point $(1, 0, 0)^\\top$ by $90°$ around the $z$-axis, then translate by $(2, 0, 0)^\\top$. What is the result?',
      solution: 'Rotation: $(1,0,0) \\mapsto (0,1,0)$ (since $R_z(90°)\\mathbf{e}_1 = \\mathbf{e}_2$). Then translate: $(0,1,0) + (2,0,0) = (2,1,0)$. Matrix form: $T \\cdot R_z \\cdot (1,0,0,1)^\\top = (2,1,0,1)^\\top$.',
    },
    {
      id: 'ex-la8-004-2',
      title: 'Build and compose 4×4 transformation matrices',
      problem: 'Write the $4\\times 4$ matrices for: (a) scale by 3 in $x$, 2 in $y$, 1 in $z$; (b) translate by $(1, -2, 5)$. Then compose them as translate-after-scale and apply to point $(1, 1, 1)^\\top$.',
      steps: [
        {
          expression: 'S = \\begin{bmatrix}3&0&0&0\\\\0&2&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}, \\quad T = \\begin{bmatrix}1&0&0&1\\\\0&1&0&-2\\\\0&0&1&5\\\\0&0&0&1\\end{bmatrix}',
          annotation: 'Scaling: diagonal entries are scale factors. Translation: last column holds offsets $(t_x, t_y, t_z, 1)^\\top$.',
          strategyTitle: 'Write $S$ and $T$',
        },
        {
          expression: 'M = T \\cdot S = \\begin{bmatrix}1&0&0&1\\\\0&1&0&-2\\\\0&0&1&5\\\\0&0&0&1\\end{bmatrix}\\begin{bmatrix}3&0&0&0\\\\0&2&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix} = \\begin{bmatrix}3&0&0&1\\\\0&2&0&-2\\\\0&0&1&5\\\\0&0&0&1\\end{bmatrix}',
          annotation: 'Compose: $M = T \\cdot S$ applies scale first (rightmost), then translate.',
          strategyTitle: 'Compose: $M = T \\cdot S$',
        },
        {
          expression: 'M \\begin{bmatrix}1\\\\1\\\\1\\\\1\\end{bmatrix} = \\begin{bmatrix}3(1)+1\\\\2(1)-2\\\\1(1)+5\\\\1\\end{bmatrix} = \\begin{bmatrix}4\\\\0\\\\6\\\\1\\end{bmatrix}',
          annotation: 'The result is the world point $(4, 0, 6)$. Notice how scale is applied first (multiply), then translate (add offsets) — confirmed by the formula $T \\cdot (S\\mathbf{p}) = T \\cdot (3,2,1)^\\top = (3+1, 2-2, 1+5)^\\top = (4,0,6)^\\top$ ✓.',
          strategyTitle: 'Apply to point $(1,1,1)$',
        },
      ],
    },
    {
      id: 'ex-la8-004-3',
      title: 'Show translation is not linear in standard coordinates',
      problem: 'Let $T$ be translation by $(1, 0)$ in $\\mathbb{R}^2$: $T(x, y) = (x+1, y)$. Verify that $T$ fails linearity (is NOT a linear map), then show it IS a linear map in homogeneous coordinates.',
      steps: [
        {
          expression: 'T(\\mathbf{0}) = T(0,0) = (1,0) \\neq (0,0)',
          annotation: 'A linear map must satisfy $T(\\mathbf{0}) = \\mathbf{0}$. Translation fails immediately.',
          strategyTitle: 'Fails linearity: $T(\\mathbf{0}) \\neq \\mathbf{0}$',
        },
        {
          expression: 'T(\\mathbf{u}+\\mathbf{v}) = (u_1+v_1+1, u_2+v_2) \\neq (u_1+1, u_2) + (v_1+1, v_2) = T(\\mathbf{u})+T(\\mathbf{v})',
          annotation: 'Also fails the additivity condition. Translation by a non-zero vector is an affine (not linear) map.',
          strategyTitle: 'Fails additivity',
        },
        {
          expression: 'T_h\\begin{bmatrix}x\\\\y\\\\1\\end{bmatrix} = \\begin{bmatrix}1&0&1\\\\0&1&0\\\\0&0&1\\end{bmatrix}\\begin{bmatrix}x\\\\y\\\\1\\end{bmatrix} = \\begin{bmatrix}x+1\\\\y\\\\1\\end{bmatrix}',
          annotation: 'In homogeneous coordinates, the same translation IS a linear map — just matrix multiplication by the $3\\times3$ matrix. The trick: the extra coordinate $w=1$ absorbs the affine offset.',
          strategyTitle: 'Homogeneous coordinates: translation is linear!',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la8-004-1',
      title: 'Non-commutativity of rotation and translation',
      difficulty: 'easy',
      problem: 'Let $T$ = translate by $(1,0,0)$ and $R = R_z(90°)$. Apply point $\\mathbf{p} = (1,0,0,1)^\\top$ to both $T \\cdot R$ and $R \\cdot T$. Show $TR \\neq RT$ by computing both results.',
      walkthrough: [
        { expression: 'R_z(90°)\\mathbf{p} = (0,1,0,1)^\\top', annotation: '$R_z(90°)$ maps $(1,0,0) \\to (0,1,0)$ since $\\cos90°=0$, $\\sin90°=1$.' },
        { expression: 'T \\cdot (R_z\\mathbf{p}) = T(0,1,0,1)^\\top = (1,1,0,1)^\\top', annotation: 'Translate $(0,1,0)$ by $(1,0,0)$: add $t_x=1$ to $x$-component.' },
        { expression: 'T\\mathbf{p} = (2,0,0,1)^\\top', annotation: 'Translate $(1,0,0)$ by $(1,0,0)$: $x$ becomes $1+1=2$.' },
        { expression: 'R_z(90°) \\cdot (T\\mathbf{p}) = R_z(2,0,0,1)^\\top = (0,2,0,1)^\\top', annotation: '$R_z(90°)$ maps $(2,0,0) \\to (0,2,0)$.' },
        { expression: 'TR\\mathbf{p} = (1,1,0,1)^\\top \\neq RT\\mathbf{p} = (0,2,0,1)^\\top', annotation: 'The two orders give different results — translation and rotation do NOT commute in 3D.' },
      ],
    },
    {
      id: 'ch-la8-004-2',
      title: 'Verify rotation matrix is orthogonal',
      difficulty: 'easy',
      problem: 'Show that $R_z(\\theta) = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}$ satisfies $R^\\top R = I$ for any $\\theta$.',
      walkthrough: [
        { expression: 'R^\\top = \\begin{bmatrix}\\cos\\theta&\\sin\\theta\\\\-\\sin\\theta&\\cos\\theta\\end{bmatrix}', annotation: 'Transpose: swap rows and columns. The off-diagonal entries swap signs.' },
        { expression: 'R^\\top R = \\begin{bmatrix}\\cos\\theta&\\sin\\theta\\\\-\\sin\\theta&\\cos\\theta\\end{bmatrix}\\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}', annotation: 'Set up the product.' },
        { expression: '(1,1)\\text{ entry}: \\cos^2\\theta + \\sin^2\\theta = 1', annotation: 'Pythagorean identity.' },
        { expression: '(1,2)\\text{ entry}: \\cos\\theta(-\\sin\\theta) + \\sin\\theta\\cos\\theta = 0', annotation: 'Off-diagonal: terms cancel.' },
        { expression: 'R^\\top R = I \\Rightarrow R^{-1} = R^\\top', annotation: 'Orthogonality proved for all $\\theta$ — inverting a rotation costs only a transpose.' },
      ],
    },
    {
      id: 'ch-la8-004-3',
      title: 'Compose scale, rotate, translate',
      difficulty: 'medium',
      problem: 'Build the single $4\\times4$ matrix $M$ that: (1) scales uniformly by $2$; (2) rotates $90°$ around the $z$-axis; (3) translates by $(3,-1,0)$. Apply $M$ to the origin $(0,0,0,1)^\\top$ and to the point $(1,0,0,1)^\\top$.',
      walkthrough: [
        { expression: 'S = \\operatorname{diag}(2,2,2,1)', annotation: 'Scaling matrix: scale factors on diagonal, $w$-entry stays 1.' },
        { expression: 'R_z = \\begin{bmatrix}0&-1&0&0\\\\1&0&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}', annotation: '$\\cos90°=0$, $\\sin90°=1$ — note the $-\\sin$ in position $(1,2)$.' },
        { expression: 'T = \\begin{bmatrix}1&0&0&3\\\\0&1&0&-1\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}', annotation: 'Translation: $(3,-1,0)$ in the last column.' },
        { expression: 'M = T \\cdot R_z \\cdot S = \\begin{bmatrix}0&-2&0&3\\\\2&0&0&-1\\\\0&0&2&0\\\\0&0&0&1\\end{bmatrix}', annotation: 'Compose right-to-left: $S$ first, $R_z$ second, $T$ last. Top-left $3\\times3$ is $R_z \\cdot S = 2R_z$.' },
        { expression: 'M(0,0,0,1)^\\top = (3,-1,0,1)^\\top', annotation: 'The origin maps to the translation offset $(3,-1,0)$ — correct since no rotation/scale changes the zero vector.' },
        { expression: 'M(1,0,0,1)^\\top = (0+3,\\ 2-1,\\ 0,\\ 1)^\\top = (3,1,0,1)^\\top', annotation: 'Scale $(1,0,0) \\to (2,0,0)$; rotate $\\to (0,2,0)$; translate $\\to (3,1,0)$ ✓' },
      ],
    },
  ],

  mentalModel: [
    'Homogeneous coordinates: embed 3D point $(x,y,z)$ as $(x,y,z,1)$ in $\\mathbb{R}^4$. Directions have $w=0$.',
    'All affine transforms (rotation, translation, scaling, shear) become $4 \\times 4$ matrix multiplication.',
    'Compose transforms: multiply matrices (right-to-left order).',
    'Rotation matrices are orthogonal: $R^{-1} = R^\\top$.',
    'GPU pipeline: $\\text{vertex} \\to M \\to V \\to P \\to $ perspective divide $\\to $ screen.',
  ],

  checkpoints: [
    { id: 'cp-la8-004-1', label: 'Read: homogeneous coordinates and transformation matrices', type: 'read' },
    { id: 'cp-la8-004-2', label: 'Read: composition order and MVP pipeline', type: 'read' },
    { id: 'cp-la8-004-3', label: 'Read: Rodrigues formula and SO(3)', type: 'read' },
    { id: 'cp-la8-004-4', label: 'Try: compose rotate and translate in code', type: 'lab' },
    { id: 'cp-la8-004-5', label: 'Try: verify non-commutativity of TR vs RT', type: 'lab' },
    { id: 'cp-la8-004-6', label: 'Work: compose scale and translate matrices', type: 'example' },
    { id: 'cp-la8-004-7', label: 'Work: show translation fails linearity in R^2', type: 'example' },
    { id: 'cp-la8-004-8', label: 'Challenge: non-commutativity of TR vs RT', type: 'challenge' },
  ],

  assessment: 'Build a $4\\times4$ matrix that rotates $45°$ around the $y$-axis, then scales by $2$, then translates by $(3, 0, 0)$. Apply it to the point $(1, 1, 1)^\\top$ and verify the result.',

  quiz: [
    {
      id: 'q-la8-004-1',
      type: 'choice',
      text: 'In homogeneous coordinates, a 3D point $(x,y,z)$ is represented as:',
      options: ['$(x,y,z)$', '$(x,y,z,0)$', '$(x,y,z,1)$', '$(x/z, y/z, 1, 0)$'],
      answer: '$(x,y,z,1)$',
      hints: ['Points get $w=1$; direction vectors get $w=0$. Translation by $(t_x,t_y,t_z)$ adds $(t_x,t_y,t_z,0)$ to $(x,y,z,w)^\\top = (x+t_x w, y+t_y w, z+t_z w, w)^\\top$. With $w=1$ (point), translation applies; with $w=0$ (direction), it does not.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-2',
      type: 'choice',
      text: 'Translation cannot be represented as a linear map in $\\mathbb{R}^3$ because:',
      options: ['Translation is not invertible', '$T(\\mathbf{x}+\\mathbf{y}) \\neq T(\\mathbf{x})+T(\\mathbf{y})$', 'Translation matrices are singular', 'Translation changes vector length'],
      answer: '$T(\\mathbf{x}+\\mathbf{y}) \\neq T(\\mathbf{x})+T(\\mathbf{y})$',
      hints: ['$T(\\mathbf{x}+\\mathbf{y}) = \\mathbf{x}+\\mathbf{y}+\\mathbf{t}$ but $T(\\mathbf{x})+T(\\mathbf{y}) = \\mathbf{x}+\\mathbf{t}+\\mathbf{y}+\\mathbf{t} = \\mathbf{x}+\\mathbf{y}+2\\mathbf{t}$. These differ unless $\\mathbf{t}=0$. Also $T(\\mathbf{0}) = \\mathbf{t} \\neq \\mathbf{0}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-3',
      type: 'choice',
      text: 'Rotation matrices $R \\in SO(3)$ satisfy $R^{-1} = $',
      options: ['$-R$', '$R$', '$R^\\top$', '$R^2$'],
      answer: '$R^\\top$',
      hints: ['$R \\in SO(3)$ means $R^\\top R = I$ (orthogonal) and $\\det(R) = 1$. So $R^{-1} = R^\\top$. This makes inverting a rotation as cheap as transposing — just flip rows and columns.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la8-004-4',
      type: 'choice',
      text: 'In the MVP pipeline, the correct order to apply transforms to a vertex is:',
      options: ['Project → View → Model', 'Model → View → Project', 'View → Model → Project', 'Project → Model → View'],
      answer: 'Model → View → Project',
      hints: ['The vertex starts in model (object-local) space. $M$ puts it in world space; $V$ transforms world space to camera space; $P$ projects to clip space. In matrix form: $\\mathbf{v}_{clip} = P \\cdot V \\cdot M \\cdot \\mathbf{v}_{model}$ — applied right-to-left.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-5',
      type: 'choice',
      text: 'What does the $w$ component equal after applying a perspective projection matrix and before perspective division?',
      options: ['Always 1', 'The depth $z$ of the point', 'Always 0', 'The distance from the camera'],
      answer: 'The depth $z$ of the point',
      hints: ['The perspective projection matrix maps $(x,y,z,1)$ to $(fx, fy, \\ldots, z)$ in homogeneous form. The final $w=z$ (camera-space depth). Perspective division by $w$ then gives the 2D position $(fx/z, fy/z)$, implementing the pinhole camera model.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-6',
      type: 'choice',
      text: 'Matrix $A = R_z(45°) \\cdot T(1,0,0)$ applied to point $(0,0,0,1)^\\top$ gives:',
      options: ['$(\\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}}, 0, 1)^\\top$', '$(1,0,0,1)^\\top$', '$(0,1,0,1)^\\top$', '$(1,1,0,1)^\\top$'],
      answer: '$(\\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}}, 0, 1)^\\top$',
      hints: ['Right-to-left: first apply $T$: $(0,0,0) \\to (1,0,0)$. Then rotate by $45°$: $(1,0,0) \\to (\\cos45°, \\sin45°, 0) = (1/\\sqrt2, 1/\\sqrt2, 0)$. The matrix product $R_z \\cdot T$ applies $T$ first (rightmost), then $R_z$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-7',
      type: 'choice',
      text: 'A direction vector $(1,0,0)$ (like a surface normal) in homogeneous coordinates is:',
      options: ['$(1,0,0,1)$', '$(1,0,0,0)$', '$(0,0,0,1)$', '$(1,1,0,0)$'],
      answer: '$(1,0,0,0)$',
      hints: ['Directions have $w=0$. This ensures translation does NOT affect them (only rotation and scale do). When you apply a translation matrix $T$ to $(1,0,0,0)$: the last column of $T$ only adds $t_i \\cdot w = 0$. This is the correct behavior — translating a coordinate frame should not change direction vectors.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-8',
      type: 'choice',
      text: 'Gimbal lock occurs when using Euler angles because:',
      options: ['Floating-point errors accumulate', 'Two rotation axes become aligned, losing a degree of freedom', 'The rotation matrix becomes non-orthogonal', 'Angles exceed $360°$'],
      answer: 'Two rotation axes become aligned, losing a degree of freedom',
      hints: ['When the middle Euler rotation (typically pitch) reaches $\\pm 90°$, the first and third rotation axes (yaw and roll) align. You can no longer independently control all three rotational degrees of freedom. Quaternions avoid this by representing rotations in $SO(3)$ without this degenerate configuration.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la8-004-9',
      type: 'choice',
      text: 'The inverse of a translation matrix $T(t_x, t_y, t_z)$ is:',
      options: ['$T(-t_x, -t_y, -t_z)$', '$T(1/t_x, 1/t_y, 1/t_z)$', '$T(t_x, t_y, t_z)^\\top$', 'It has no inverse'],
      answer: '$T(-t_x, -t_y, -t_z)$',
      hints: ['Translating by $(t_x,t_y,t_z)$ and then by $(-t_x,-t_y,-t_z)$ gives the identity. In matrix form: the last column of $T^{-1}$ is $(-t_x,-t_y,-t_z,1)^\\top$. All affine transformations (translations, rotations, scalings by non-zero factors) are invertible.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la8-004-10',
      type: 'choice',
      text: 'The GPU applies the MVP matrix to every vertex. This is efficient because:',
      options: ['GPUs can only do matrix multiplication', 'P, V, M are multiplied once per draw call, not once per vertex', 'The matrix is always diagonal', 'Vertices are processed one at a time'],
      answer: 'P, V, M are multiplied once per draw call, not once per vertex',
      hints: ['$P$, $V$, and $M$ are constant for all vertices in one draw call. The GPU multiplies $P \\cdot V \\cdot M$ once (CPU-side or once on GPU), producing the MVP matrix. Then for each of millions of vertices, it only does one $4 \\times 4$ matrix-vector multiplication — a fixed cost of 64 multiplies and 48 adds per vertex.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Write $4 \\times 4$ matrices for rotation, translation, and scaling in homogeneous coordinates. Compose two transformations correctly (in the right order) and apply to a point.',
    explainVerbally: 'Explain why homogeneous coordinates allow translation to be represented as matrix multiplication, and why the $w$ component of direction vectors is 0 while points have $w=1$.',
    detectIncorrectApplication: 'Catch composition-order errors: identify when $T \\cdot R$ vs $R \\cdot T$ is used and which applies first, and check that the correct one matches the desired sequence.',
    transferToUnfamiliar: 'Given a robotics forward kinematics problem (joint transforms), set up the $4 \\times 4$ product chain and compute the end-effector position.',
  },

  misconceptions: [
    {
      falseBelief: 'Transformation matrices are applied left-to-right: the leftmost matrix acts first.',
      whyStudentsThinkIt: 'Students read the matrix product $M_1 M_2 \\mathbf{v}$ left to right and assume $M_1$ is applied first.',
      correctionExample: '$M_1 M_2 \\mathbf{v}$ means: first apply $M_2$ (rightmost), then $M_1$. For $T \\cdot R \\cdot \\mathbf{v}$: $R$ applies first (rotate), then $T$ (translate). This is the standard mathematical convention: function composition $f \\circ g$ means "apply $g$ first."',
      contrastCase: 'Some game engines use row vectors $(\\mathbf{v}^\\top M_1 M_2)$ where order is reversed (left-to-right). Always check whether the convention is column-vectors (standard math) or row-vectors (DirectX, some game engines).',
    },
    {
      falseBelief: 'Composing rotation matrices around different axes commutes — $R_x R_y = R_y R_x$.',
      whyStudentsThinkIt: 'Scalars commute under multiplication; students assume matrices do too.',
      correctionExample: 'Let $R_x(90°)$ and $R_y(90°)$. Apply to $(1,0,0)$: $R_x R_y (1,0,0) = R_x(0,0,-1) = (0,1,0)$. $R_y R_x (1,0,0) = R_y(1,0,0) = (0,0,-1)$. Completely different results. Rotation in 3D is non-commutative.',
      contrastCase: 'Rotations around the SAME axis commute: $R_z(\\theta_1) R_z(\\theta_2) = R_z(\\theta_1 + \\theta_2) = R_z(\\theta_2) R_z(\\theta_1)$. Only multi-axis composition is non-commutative.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A robot arm has 3 joints: shoulder (rotate around $z$), elbow (rotate around $y$), wrist (rotate around $z$). Compute the position of the gripper given joint angles.',
      competingTechniques: 'Track position manually joint by joint, or compose $4 \\times 4$ transformation matrices.',
      whyThisTechniqueWins: 'The homogeneous transformation chain $T_1 R_1 T_2 R_2 T_3 R_3$ gives the full kinematics in one matrix product. Once composed, computing gripper position for any joint angles is a single $4 \\times 4$ matrix-vector multiply. This is forward kinematics — the foundation of robot control.',
    },
    {
      situation: 'A 2D game needs to rotate a sprite around its center (not the origin), then move it to position $(100, 200)$ on screen.',
      competingTechniques: 'Transform each vertex individually, or build a composite transformation matrix.',
      whyThisTechniqueWins: 'To rotate around the center $(c_x, c_y)$: translate center to origin, rotate, translate back, then translate to final position. This is: $T(100,200) \\cdot T(c_x,c_y) \\cdot R(\\theta) \\cdot T(-c_x,-c_y)$. One $3 \\times 3$ matrix (2D homogeneous), applied to all vertices at once.',
    },
  ],

  semantics: {
    core: [
      { symbol: '(x,y,z,1)^\\top', meaning: 'Homogeneous representation of a 3D point — the $w=1$ entry makes translation act as a matrix multiplication.' },
      { symbol: '(x,y,z,0)^\\top', meaning: 'Homogeneous representation of a direction vector — $w=0$ means translation does NOT affect it; only rotation and scaling apply.' },
      { symbol: 'T(t_x,t_y,t_z)', meaning: '$4\\times4$ translation matrix: identity with $(t_x,t_y,t_z)^\\top$ in the last column, $1$ at $(4,4)$.' },
      { symbol: 'M_{mvp} = P \\cdot V \\cdot M', meaning: 'MVP pipeline: $M$ = model-to-world, $V$ = world-to-camera (view), $P$ = camera-to-clip (perspective). Applied right-to-left; computed once per draw call.' },
      { symbol: 'R^\\top R = I,\\quad \\det R = 1', meaning: 'Defining properties of a rotation matrix: orthogonality (inverse = transpose, free) plus orientation-preserving (no reflection).' },
      { symbol: 'R = e^{[\\hat{\\mathbf{n}}]_\\times \\theta}', meaning: 'Rodrigues exponential map: rotation by angle $\\theta$ about unit axis $\\hat{\\mathbf{n}}$ — connects the Lie algebra (skew-symmetric matrices) to the Lie group SO(3).' },
    ],
    rulesOfThumb: [
      'Matrix transforms compose right-to-left: if you want "scale then rotate then translate," write $M = T \\cdot R \\cdot S$.',
      'Points get $w=1$; directions get $w=0$ — this is the only difference, but it controls whether translation acts.',
      '$R^{-1} = R^\\top$ for any rotation matrix — inverting a rotation is free (just transpose).',
      'Parallel lines in 3D converge to vanishing points on screen because perspective projection is a projective (not affine) transformation.',
      'To rotate around a point other than the origin: translate the pivot to origin, rotate, translate back — three matrix multiplications.',
    ],
  },

  spiral: {
    recoveryPoints: ['la7-001', 'la8-003'],
    futureLinks: ['la9-001', 'la10-001'],
  },

  debugging: [
    {
      commonError: 'Applying transformations in the wrong order (e.g., translate before rotate when you want rotate before translate).',
      symptom: 'The object ends up in the wrong position or orientation — rotating around the wrong center point.',
      whyItHappened: 'Matrix multiplication is not commutative. Writing $T \\cdot R$ and thinking $T$ acts first, when actually $R$ acts first.',
      repairStrategy: 'Write out the desired sequence in plain English first: "I want to rotate the object around its own center, then move it to position P." Then build the matrix product right-to-left: last step is leftmost. Test with a simple point like $(1,0,0)$ and trace through manually.',
    },
    {
      commonError: 'Applying a transformation matrix to a direction vector (e.g., surface normal) without setting $w=0$.',
      symptom: 'Normals are translated when the object moves, producing incorrect lighting calculations.',
      whyItHappened: 'The student uses $(n_x, n_y, n_z, 1)$ instead of $(n_x, n_y, n_z, 0)$, causing the translation component to shift the normal.',
      repairStrategy: 'Always use $w=0$ for direction vectors (normals, tangents, velocity). Use $w=1$ only for position points. Also note: normals transform by the inverse-transpose of the model matrix, not the model matrix itself, when non-uniform scaling is involved.',
    },
  ],
};
