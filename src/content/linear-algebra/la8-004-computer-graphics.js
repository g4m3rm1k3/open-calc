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
      'Rotate the point $(1, 0, 0)$ by $90°$ around the $z$-axis, then translate it by $(3, 2, 0)$. Without homogeneous coordinates, you need two separate operations. With them, you write $(1,0,0)$ as $(1,0,0,1)^\\top$ and encode the whole pipeline as one $4 \\times 4$ product:\n\n$\\underbrace{\\begin{bmatrix}1&0&0&3\\\\0&1&0&2\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}}_{\\text{translate}} \\cdot \\underbrace{\\begin{bmatrix}0&-1&0&0\\\\1&0&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}}_{R_z(90°)} \\cdot \\begin{bmatrix}1\\\\0\\\\0\\\\1\\end{bmatrix} = \\begin{bmatrix}1&0&0&3\\\\0&1&0&2\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}\\begin{bmatrix}0\\\\1\\\\0\\\\1\\end{bmatrix} = \\begin{bmatrix}3\\\\3\\\\0\\\\1\\end{bmatrix}$\n\nResult: the world point $(3, 3, 0)$. One matrix product handles both operations — the GPU does this for every vertex at 60fps.',
      '**Why homogeneous coordinates?** Translation is not a linear operation in standard coordinates ($T(\\mathbf{x} + \\mathbf{y}) \\neq T(\\mathbf{x}) + T(\\mathbf{y})$). Homogeneous coordinates fix this by working in $\\mathbb{R}^{n+1}$: a 3D point $(x, y, z)$ becomes $(x, y, z, 1)$. Now translation by $(t_x, t_y, t_z)$ is the matrix $\\begin{bmatrix}I & \\mathbf{t}\\\\ \\mathbf{0}^\\top & 1\\end{bmatrix}$. Composing transformations = multiplying matrices.',
      '**The 4×4 transformation matrices.** In homogeneous coordinates (point = $(x,y,z,1)^\\top$, direction = $(x,y,z,0)^\\top$):\n\n**Translation**: $T(t_x,t_y,t_z) = I_{4\\times4}$ with last column $(t_x,t_y,t_z,1)^\\top$.\n\n**Scaling**: $S(s_x,s_y,s_z) = \\text{diag}(s_x,s_y,s_z,1)$.\n\n**Rotation** about $z$-axis by $\\theta$: $R_z(\\theta) = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta&0&0\\\\\\sin\\theta&\\cos\\theta&0&0\\\\0&0&1&0\\\\0&0&0&1\\end{bmatrix}$.\n\nComposition: apply rotation first, then translate: $T \\cdot R$ (right-to-left: rightmost applied first).',
      '**Projection.** A perspective projection maps a 3D point to the image plane. The projection matrix $P$ in homogeneous coordinates produces $(x/z, y/z)$ (perspective division) — a nonlinear operation made linear by working in homogeneous coordinates and dividing by the $w$ component at the end. The full pipeline: $\\mathbf{v}_{clip} = P \\cdot V \\cdot M \\cdot \\mathbf{v}_{model}$. Divide by $w$ for NDC (Normalized Device Coordinates).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Predict the Order',
        body: 'You want to scale a point by 2, then rotate it $90°$ around the $z$-axis. Before computing: is the combined matrix $R_z \\cdot S$ or $S \\cdot R_z$? Which one applies the scale first? Write your answer, then verify by applying each to the point $(1,0,0,1)^\\top$.',
      },
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
