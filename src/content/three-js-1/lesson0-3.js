// Three.js · Chapter 0 · Lesson 3
// Matrices & Transformations
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   A 4×4 matrix is the universal transformation object in 3D graphics.
//   Translation, rotation, scale, perspective projection — all expressed as
//   matrix multiplication. The order of multiplication matters critically.
//   This lesson makes matrix multiplication feel geometric, not algebraic.
//
// HISTORY:
//   - 1858: Cayley invents matrix algebra; multiplication defined
//   - 1940s: Computer graphics pioneers realise a single matrix can encode any linear transform
//   - 1965: Roberts (MIT) uses 4×4 homogeneous matrices for 3D graphics
//   - 1970s: SIGGRAPH establishes the Model-View-Projection pipeline using 4×4 matrices
//   - 1992: OpenGL standardises column-major 4×4 matrix layout (still used today)
//   - 2000s: GLSL built-in types (mat4, vec4) make matrix ops first-class in shaders
//   The 4×4 matrix is unchanged from 1965 — the most stable data structure in computing.
//
// MATHEMATICS (derive and visualise all):
//   1. Matrix × Vector:  Mv = column linear combination
//   2. Translation matrix T (moves a point):
//      [1 0 0 tx]   [x]   [x+tx]
//      [0 1 0 ty] × [y] = [y+ty]
//      [0 0 1 tz]   [z]   [z+tz]
//      [0 0 0  1]   [1]   [  1 ]
//   3. Scale matrix S
//   4. Rotation matrix Ry(θ) — one axis; then explain Euler angles
//   5. TRS order: always Scale first, then Rotate, then Translate
//      Reason: rotation applies BEFORE translation in column-major notation
//   6. Matrix multiplication is NOT commutative: T×R ≠ R×T (show this visually!)
//   7. The identity matrix I and matrix inverse
//   8. MVP = Projection × View × Model  (read right to left)
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — Matrix as a transformation machine. Why 4×4? (W row enables translation)
//   Cell 2: js       — "Matrix Effect" canvas: 3×3 grid of sliders = matrix values
//                      A 2D shape on the right transforms live as sliders change
//   Cell 3: challenge— Q: "You scale by 2, then rotate 45°. Is the result the same as
//                           rotating 45° then scaling by 2?" (No — show why)
//   Cell 4: markdown — Translation only works with 4×4 homogeneous matrices (3×3 can't do it)
//   Cell 5: js       — "TRS Order" visualiser: 3 sliders (T, R, S) with two toggle modes
//                      Mode A: Scale → Rotate → Translate (correct TRS)
//                      Mode B: Translate → Rotate → Scale (wrong order, shows artefact)
//   Cell 6: challenge— Q: "In column-major MVP = P×V×M, which matrix is applied to the
//                           vertex first? (M, V, or P?)"
//   Cell 7: markdown — Euler angles vs Quaternions: gimbal lock explained
//   Cell 8: js       — Gimbal lock simulator: XYZ Euler sliders. At Y=90°, X and Z
//                      rotate the same axis. Show the lost degree of freedom.
//   Cell 9: challenge— Q: "Why does Three.js use quaternions internally for rotation
//                           even though you set Euler angles?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Matrix Sculptor" (2D): 3×3 number grid each cell is an editable input
//        A triangle on the right transforms in real time. Watch shear/rotate/scale emerge.
//   V2 — "TRS Order Comparator": two canvases side by side showing same transforms
//        in different order. The visual result differs. Students adjust order with drag handles.
//   V3 — "Gimbal Lock Demo" (3D isometric): XYZ rotation sliders
//        At specific Euler angle combo, two rotation axes align → one DOF lost.
//        Toggle to quaternion mode: smooth interpolation, no lock.
//
// CHALLENGE QUESTIONS:
//   1. SR ≠ RS: scaling then rotating a non-uniform scale produces shear under rotation
//   2. MVP order: M is applied first (rightmost in multiplication, first to hit the vertex)
//   3. Quaternions avoid gimbal lock by representing rotation as a 4D unit vector,
//      not three sequential axis rotations. Three.js: object.quaternion vs object.rotation
//
// THREE.JS PARALLEL:
//   THREE.Matrix4                  — base type
//   matrix4.makeTranslation(x,y,z) — build T
//   matrix4.makeRotationY(θ)       — build Ry
//   matrix4.makeScale(x,y,z)       — build S
//   object.matrixAutoUpdate = true — Three.js rebuilds from .position/.rotation/.scale
//   object.matrix                  — the Model matrix
//   new THREE.Euler(x,y,z,'XYZ')   — Euler angles (order matters!)
//   new THREE.Quaternion()          — quaternion (gimbal-lock free)
//   object.quaternion.setFromEuler(euler)
//
// STUDENT TASKS:
//   - Manually multiply a translation T by a rotation R and verify against Three.js
//   - Reproduce the gimbal lock state by rotating to (0, 90°, 0) Euler and then try X
//   - Write the identity matrix from memory. Verify: identity * any matrix = same matrix.

const LESSON_3JS_0_3 = {
  title: 'Matrices & Transformations',
  subtitle: 'How translation, rotation, and scale unify into a single multiplication.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 0-3

### Matrices & Transformations
*A single 4×4 matrix multiplication moves, rotates, and scales any object in 3D space.*

---

**🎯 What you'll master:**
- Why 3D graphics uses 4×4 matrices instead of 3×3 (the W row enables translation)
- Translation, rotation, and scale matrices — derived from first principles, not memorised
- Why **matrix multiplication order matters**: T×R ≠ R×T — shown visually with animated objects
- The TRS convention: always Scale → Rotate → Translate, and why breaking it causes artefacts
- The MVP chain: Model × View × Projection — read right to left, applied left to right
- Gimbal lock: the hidden danger of Euler angles, and why Three.js uses quaternions internally

**🔬 Interactive experiments you'll run:**
- Sculpt a 4×4 matrix cell by cell — watch a triangle transform on screen in real time
- Compare TRS vs TSR order: same three transforms, different results — see exactly why order matters
- Induce gimbal lock by rotating to Y=90°, then try rotating X — watch it do nothing new

**📐 Mathematics you'll derive:**
- The 4×4 translation matrix (why W=1 is required)
- Rotation matrix Ry(θ) built from the unit circle definition of cosine and sine
- Matrix inverse: undoes a transform. For orthogonal matrices (pure rotation): M⁻¹ = Mᵀ

**⚡ Three.js connection:**
\`object.position\`, \`object.rotation\`, \`object.scale\` — Three.js builds a \`Matrix4\` from these automatically every frame. \`matrixAutoUpdate = true\` means you almost never touch the matrix directly — but knowing what's inside it is everything.`,
    },
  ],
};

export default {
  id: 'three-js-0-3-matrices',
  slug: 'matrices-and-transformations',
  chapter: 'three-js.0',
  order: 3,
  title: 'Matrices & Transformations',
  subtitle: 'How translation, rotation, and scale unify into a single multiplication.',
  tags: ['three-js', 'matrices', 'transformations', 'trs', 'mvp', 'quaternions', 'euler', 'gimbal-lock', 'foundations'],
  hook: {
    question: 'Why does rotating an object in the wrong order produce a completely different result — and why does Three.js use an invisible fourth number (W) to do translations that 3×3 matrices cannot?',
    realWorldContext: 'The 4×4 homogeneous matrix was introduced in computer graphics in 1965 and has not changed since. Every GPU on the planet processes geometry by multiplying 4×4 matrices together. Understanding this one data structure unlocks all of 3D rendering.',
  },
  intuition: {
    prose: [
      'A 4×4 matrix encodes any combination of translation, rotation, and scale in a single object.',
      'Multiplication order is critical: T×R ≠ R×T. Always compose as S → R → T (TRS order).',
      'MVP = Projection × View × Model. Applied right to left: Model first, Projection last.',
      'Euler angles suffer gimbal lock at ±90°. Quaternions are Three.js\'s internal solution.',
    ],
    callouts: [
      { type: 'warning', title: 'Order matters — always', body: 'In column-major notation, the rightmost matrix applies first. MVP = P×V×M means M transforms the vertex first, then V, then P. Getting this backwards is the most common matrix bug.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    '4×4 needed for translation: 3×3 can\'t encode translation without the W row.',
    'TRS order: scale first, rotate second, translate last. Breaking this order causes shear/skew.',
    'MVP chain: vertex × M gets world position, × V gets camera-relative, × P gets clip space.',
    'Three.js: object.position/rotation/scale → auto-builds object.matrix each frame.',
    'Quaternion = 4D unit vector encoding an axis-angle rotation. Immune to gimbal lock.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_3 };
