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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Why homogeneous coordinates?** Translation is not a linear operation in standard coordinates ($T(\\mathbf{x} + \\mathbf{y}) \\neq T(\\mathbf{x}) + T(\\mathbf{y})$). Homogeneous coordinates fix this by working in $\\mathbb{R}^{n+1}$: a 3D point $(x, y, z)$ becomes $(x, y, z, 1)$. Now translation by $(t_x, t_y, t_z)$ is the matrix $\\begin{bmatrix}I & \\mathbf{t}\\\\ \\mathbf{0}^\\top & 1\\end{bmatrix}$. Composing transformations = multiplying matrices.',
      '**The 4×4 transformation matrices.** In homogeneous coordinates (point = $(x,y,z,1)^\\top$, direction = $(x,y,z,0)^\\top$):\n\n**Translation**: $T(t_x,t_y,t_z) = I_{4\\times4}$ with last column $(t_x,t_y,t_z,1)^\\top$.\n\n**Scaling**: $S(s_x,s_y,s_z) = \\text{diag}(s_x,s_y,s_z,1)$.\n\n**Rotation** about $z$-axis by $\\theta$: $R_z(\\theta) = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta&0&0\\\\\\sin\\theta&\\cos\\theta&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}$.\n\nComposition: apply rotation first, then translate: $T \\cdot R$ (right-to-left: rightmost applied first).',
      '**Projection.** A perspective projection maps a 3D point to the image plane. The projection matrix $P$ in homogeneous coordinates produces $(x/z, y/z)$ (perspective division) — a nonlinear operation made linear by working in homogeneous coordinates and dividing by the $w$ component at the end. The full pipeline: $\\mathbf{v}_{clip} = P \\cdot V \\cdot M \\cdot \\mathbf{v}_{model}$. Divide by $w$ for NDC (Normalized Device Coordinates).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Transformation Composition Order',
        body: 'Transformations are applied right-to-left in the matrix product:\n\n$M_{total} = M_n \\cdots M_2 M_1$\n\nApplied as: $M_{total}\\mathbf{v} = M_n(\\cdots(M_2(M_1 \\mathbf{v})))$\n\nIn graphics: $M_{mvp} = P \\cdot V \\cdot M$\n- $M$: model → world (object\'s own transform)\n- $V$: world → camera (inverse camera transform)\n- $P$: camera → clip (perspective or orthographic)\n\nMatrix multiplication is NOT commutative: order matters critically!',
      },
      {
        type: 'insight',
        title: 'Rotation Matrices Are Orthogonal',
        body: 'All rotation matrices $R$ satisfy $R^\\top R = I$ (orthogonal). This has powerful consequences:\n\n$R^{-1} = R^\\top$ (fast inversion)\n$\\det(R) = 1$ (preserves orientation)\n$\\|R\\mathbf{v}\\| = \\|\\mathbf{v}\\|$ (preserves lengths)\nAngles between vectors preserved\n\nThe inverse view matrix (camera transform) is easy: $(V)^{-1} = V^\\top$ for pure rotation cameras.',
      },
    ],
    visualizations: [
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
              prose: ['Construct translation, rotation, and scaling matrices in homogeneous coordinates.'],
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
              prose: ['Apply the composed transform to vertices of a triangle in 3D.'],
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
              prose: ['Build a perspective projection matrix and project 3D points.'],
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
  ],

  challenges: [
    {
      id: 'ch-la8-004-1',
      title: 'Non-commutativity',
      difficulty: 'easy',
      prompt: 'Show that translation and rotation do not commute: construct a $4\\times 4$ example where $TR \\neq RT$.',
      hint: 'Apply both orders to the same point and compare.',
      solution: 'Let $T = $ translate by $(1,0,0)$ and $R = R_z(90°)$. Point $\\mathbf{p} = (1,0,0,1)^\\top$. $TR\\mathbf{p}$: first rotate to $(0,1,0,1)$, then translate to $(1,1,0,1)$. $RT\\mathbf{p}$: first translate to $(2,0,0,1)$, then rotate to $(0,2,0,1)$. Results differ, so $TR \\neq RT$.',
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
    { id: 'cp-la8-004-1', question: 'Why are homogeneous coordinates used in computer graphics?', answer: 'To represent all affine transformations (including translation) as matrix multiplication, enabling efficient composition via matrix products.' },
    { id: 'cp-la8-004-2', question: 'What property do rotation matrices satisfy?', answer: '$R^\\top R = I$ (orthogonal) and $\\det R = 1$, so $R^{-1} = R^\\top$.' },
    { id: 'cp-la8-004-3', question: 'In the MVP pipeline, in what order are the matrices applied to a vertex?', answer: 'First $M$ (model), then $V$ (view), then $P$ (projection): $P \\cdot V \\cdot M \\cdot \\mathbf{v}$.' },
  ],

  assessment: 'Build a $4\\times4$ matrix that rotates $45°$ around the $y$-axis, then scales by $2$, then translates by $(3, 0, 0)$. Apply it to the point $(1, 1, 1)^\\top$ and verify the result.',

  quiz: [
    { id: 'q-la8-004-1', question: 'In homogeneous coordinates, a 3D point $(x,y,z)$ is represented as:', options: ['$(x,y,z)$', '$(x,y,z,0)$', '$(x,y,z,1)$', '$(x/z, y/z, 1, 0)$'], answer: '$(x,y,z,1)$' },
    { id: 'q-la8-004-2', question: 'Translation cannot be represented as a linear map in $\\mathbb{R}^3$ because:', options: ['Translation is not invertible', '$T(\\mathbf{x}+\\mathbf{y}) \\neq T(\\mathbf{x})+T(\\mathbf{y})$', 'Translation matrices are singular', 'Translation changes vector length'], answer: '$T(\\mathbf{x}+\\mathbf{y}) \\neq T(\\mathbf{x})+T(\\mathbf{y})$' },
    { id: 'q-la8-004-3', question: 'Rotation matrices $R$ satisfy $R^{-1} = $', options: ['$-R$', '$R$', '$R^\\top$', '$R^2$'], answer: '$R^\\top$' },
  ],
};
