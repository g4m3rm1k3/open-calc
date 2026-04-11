// Three.js · Chapter 0 · Lesson 2
// Vectors for Graphics
//
// ============================================================
// LESSON PLAN
// ============================================================
//
// CONCEPT:
//   Vectors are the universal language of graphics: positions, directions,
//   colours, normals, UV coordinates — all are vectors. This lesson builds
//   geometric intuition before algebra: students drag vectors on screen and
//   see the math emerge from the geometry.
//
// HISTORY:
//   - 1843: Hamilton invents quaternions while trying to extend complex numbers to 3D
//   - 1880s: Gibbs and Heaviside extract the vector part of quaternions → modern vector algebra
//   - 1940s–60s: vectors formalized in linear algebra; become standard in physics/engineering
//   - 1976: Diffuse/specular lighting in computer graphics → dot product is THE core operation
//   - 1989: Pixar's RenderMan uses vectors pervasively for shading normals
//   The cross product giving surface normals is what makes 3D lighting possible.
//
// MATHEMATICS (derive all of these interactively):
//   1. Vector addition:      A + B = (ax+bx, ay+by, az+bz)
//   2. Scalar multiplication: kA = (kax, kay, kaz)
//   3. Magnitude:            |A| = √(ax²+ay²+az²)
//   4. Normalisation:        Â = A / |A|   (always length 1 — critical for lighting)
//   5. Dot product:          A·B = ax·bx + ay·by + az·bz = |A||B|cosθ
//                            → cosθ = A·B when both are unit vectors → the lighting equation
//   6. Cross product:        A×B = (ay·bz-az·by, az·bx-ax·bz, ax·by-ay·bx)
//                            → perpendicular to both A and B → surface normals
//   7. Reflection vector:    R = 2(N·L)N - L  (Phong specular needs this)
//
// CELL PLAN (9 cells):
//   Cell 1: markdown — Why vectors? Positions, directions, normals, colours — all vectors
//   Cell 2: js       — Interactive 2D vector playground: drag tip of A and B, see A+B, A-B
//                      Show magnitude bar. Click "normalise" to lock to unit circle.
//   Cell 3: challenge— Q: "Vector A=(3,4). What is |A|? What is Â?"
//   Cell 4: markdown — The dot product: geometric interpretation (projection / angle)
//   Cell 5: js       — Dot product visualiser: two draggable unit vectors on circle
//                      Shows angle θ, cosθ, and A·B numerically. Shows projection of B onto A.
//                      Shade changes from bright to dark as angle > 90° (lighting analogy)
//   Cell 6: challenge— Q: "A surface normal N=(0,1,0). Light direction L=(1,1,0) (normalised).
//                           How bright is this surface? (What is N·L?)"
//   Cell 7: markdown — Cross product: perpendicular to both inputs → surface normals
//   Cell 8: js       — 3D cross product visualiser using canvas with isometric projection
//                      Two draggable 3D arrows A and B, resultant A×B shown perpendicular.
//                      Shows right-hand rule animation. Magnitude = area of parallelogram.
//   Cell 9: challenge— Q: "If A and B are parallel, what is |A×B|? Why?"
//
// INTERACTIVE VISUALIZATIONS:
//   V1 — "Vector Playground" (2D): grid with draggable A and B tips
//        Live readout: A=(x,y), B=(x,y), A+B, A-B, |A|, |B|, Â, B̂
//        Buttons: Toggle show A+B / show A-B / normalise both
//   V2 — "Dot Product Light Meter": two unit vectors on a circle
//        Left side: vectors. Right side: vertical "brightness" bar = max(0, A·B)
//        Drag one vector around full circle; brightness oscillates cos-like
//   V3 — "Cross Product in 3D" (isometric canvas): vectors A, B, A×B shown
//        Label directions X/Y/Z. Show right-hand rule with animated hand.
//        Slider for rotation to view from different angles.
//
// CHALLENGE QUESTIONS:
//   1. |A|=5 when A=(3,4): answer 5 by Pythagoras. Â=(3/5, 4/5)=(0.6, 0.8)
//   2. N·L where N=(0,1,0) and L=(1/√2, 1/√2, 0): answer 1/√2 ≈ 0.707 (45° = 70.7% bright)
//   3. Parallel vectors: A×B = zero vector, |A×B|=0, because sinθ=0 when θ=0°
//
// THREE.JS PARALLEL:
//   THREE.Vector3(x, y, z)       — vector
//   v.length()                   — magnitude
//   v.normalize()                — normalise in place
//   a.dot(b)                     — dot product
//   a.cross(b)                   — cross product (modifies a)
//   a.clone().cross(b)           — non-mutating cross
//   These appear EVERYWHERE in Three.js: camera.position.sub(target).normalize()
//
// STUDENT TASKS:
//   - Compute the normal to a face of a unit cube manually using cross product
//   - Write Three.js code to find angle between camera forward and a target direction
//   - Verify: for unit vectors, dot product equals cosine of angle between them

const LESSON_3JS_0_2 = {
  title: 'Vectors for Graphics',
  subtitle: 'The mathematical language of position, direction, colour, and light.',
  sequential: true,
  cells: [
    {
      type: 'markdown',
      instruction: `## 🚧 Coming Soon — Lesson 0-2

### Vectors for Graphics
*Position, direction, colour, surface normal — every quantity in 3D graphics is a vector.*

---

**🎯 What you'll master:**
- Why vectors are the foundation of every graphics operation
- Vector addition, subtraction, and scalar multiplication — visually and algebraically
- Normalisation: why unit vectors (length = 1) are used everywhere in lighting
- The **dot product**: the single most important operation in shading (encodes the angle between light and surface)
- The **cross product**: how to compute a surface normal from two triangle edges
- The reflection vector R = 2(N·L)N − L — the beating heart of specular highlights

**🔬 Interactive experiments you'll run:**
- Drag two 2D vectors and watch addition, subtraction, and magnitude update live
- Rotate a light direction around a surface — see the brightness meter rise and fall with cosθ
- Manipulate two 3D vectors and watch the cross product point perpendicularly using the right-hand rule

**📐 Mathematics you'll derive:**
- Dot product: A·B = |A||B|cosθ (geometric) = axbx+ayby+azbz (algebraic)
- Cross product: A×B magnitude = |A||B|sinθ = area of the parallelogram spanned by A and B
- Why normalisation is required before using vectors in lighting: N·L only equals cosθ when both have length 1

**⚡ Three.js connection:**
\`THREE.Vector3\` — every position, direction, normal, and colour uses this. \`v.dot(u)\` is called internally thousands of times per frame by MeshStandardMaterial's PBR shader.`,
    },
  ],
};

export default {
  id: 'three-js-0-2-vectors',
  slug: 'vectors-for-graphics',
  chapter: 'three-js.0',
  order: 2,
  title: 'Vectors for Graphics',
  subtitle: 'The mathematical language of position, direction, colour, and light.',
  tags: ['three-js', 'vectors', 'dot-product', 'cross-product', 'normalisation', 'linear-algebra', 'foundations'],
  hook: {
    question: 'A light shines from above. A surface faces sideways. How bright is the surface? The answer is a single multiplication — but only if you understand what "direction" means as a number.',
    realWorldContext: 'The dot product between a surface normal and a light direction is literally the entire diffuse lighting equation. Every 3D renderer — from Minecraft to Pixar — uses this calculation billions of times per second.',
  },
  intuition: {
    prose: [
      'A vector has magnitude (length) and direction. Every position, velocity, and colour in 3D is a vector.',
      'The dot product A·B = |A||B|cosθ. For unit vectors: A·B = cosθ — directly gives the lighting brightness.',
      'The cross product A×B produces a vector perpendicular to both — this is how triangle normals are computed.',
      'Always normalise vectors before using them in lighting. Length matters: only unit vectors give cosθ from dot.',
    ],
    callouts: [
      { type: 'tip', title: 'The lighting shortcut', body: 'If N and L are already unit vectors, brightness = max(0, N·L). No trig functions needed. The dot product encodes everything.' },
    ],
    visualizations: [],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Vector length = |A| = √(x²+y²+z²). Normalise: Â = A/|A|.',
    'Dot product = |A||B|cosθ. Unit vectors: A·B = cosθ. Used for: angle, projection, lighting.',
    'Cross product = vector perpendicular to both. |A×B| = area of parallelogram. Used for: normals, right-hand rule.',
    'Reflection: R = 2(N·L)N − L. The specular highlight vector.',
    'Three.js: THREE.Vector3, .dot(), .cross(), .normalize(), .length()',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_0_2 };
