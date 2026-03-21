// FILE: src/content/chapter-6/02-vectors.js
export default {
  id: 'ch6-vectors',
  slug: 'vectors',
  chapter: 6,
  order: 2,
  title: 'Vectors in 2D and 3D',
  subtitle: 'Quantities with magnitude and direction — the language of physics and multivariable calculus',
  tags: ['vector', 'dot product', 'cross product', 'magnitude', 'unit vector', 'component', 'projection', 'angle', 'physics', '3D'],

  hook: {
    question: 'An airplane flies at 400 km/h heading northeast, while a wind blows at 80 km/h due east. What is the plane\'s actual velocity? You need vectors — quantities with both magnitude and direction — and their addition.',
    realWorldContext:
      'Vectors are the natural language of physics, engineering, and computer graphics. ' +
      'Forces, velocities, accelerations, magnetic fields, electric fields, momentum, angular momentum, torque — all are vectors. ' +
      'In structural engineering, analyzing the forces on a bridge requires vector decomposition and equilibrium conditions. ' +
      'In computer graphics, every 3D scene uses vectors for transformations, lighting (dot products compute light intensity), and normals (cross products compute perpendicular direction). ' +
      'Machine learning uses vectors as feature representations — a training example in a neural network is a vector of hundreds of features. ' +
      'Understanding vectors is the gateway from single-variable calculus to multivariable calculus, where derivatives become gradients (vectors) and integration generalizes to line, surface, and volume integrals.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'A vector is an arrow with two attributes: **magnitude** (its length) and **direction** (which way it points). Two vectors are equal if and only if they have the same magnitude and direction — position does not matter. You can slide a vector anywhere in space and it is still the "same" vector.',

      'In coordinates: a 2D vector **v** = ⟨a, b⟩ means "go a units in the x-direction and b units in the y-direction." The magnitude (length) is |**v**| = √(a²+b²) — just the Pythagorean theorem. The direction is the angle θ = arctan(b/a). In 3D: **v** = ⟨a, b, c⟩, |**v**| = √(a²+b²+c²).',

      'Vector **addition** is the famous parallelogram law. To add **u** and **v**: place **v** at the tip of **u**, and draw the arrow from the tail of **u** to the tip of **v**. In components: ⟨a,b⟩ + ⟨c,d⟩ = ⟨a+c, b+d⟩. Geometrically, this is how forces combine (resultant force), how displacements add, and how velocities compose.',

      'Scalar multiplication **kv** stretches (|k| > 1), shrinks (|k| < 1), or reverses (k < 0) a vector while keeping its direction. In components: k⟨a,b⟩ = ⟨ka, kb⟩. A **unit vector** has magnitude 1; the unit vector in the direction of **v** is **v̂** = **v**/|**v**|.',

      'The **dot product** **u** · **v** = |**u**||**v**|cos(θ) = a₁a₂ + b₁b₂ (+ c₁c₂ in 3D) is a SCALAR. It measures the \"amount of **u** in the direction of **v**\". When **u** ⊥ **v**, cos(θ) = 0 so **u** · **v** = 0. This is the algebraic test for perpendicularity. The dot product also gives the projection of **u** onto **v**: proj_v(**u**) = ((**u**·**v**)/|**v**|²) **v**.',

      'The **cross product** **u** × **v** exists in 3D and gives a VECTOR perpendicular to both **u** and **v**, with magnitude |**u**||**v**|sin(θ) (equal to the area of the parallelogram spanned by **u** and **v**). Right-hand rule: curl fingers from **u** toward **v** — thumb points in the direction of **u** × **v**. In components: if **u** = ⟨u₁,u₂,u₃⟩ and **v** = ⟨v₁,v₂,v₃⟩, then **u** × **v** = ⟨u₂v₃−u₃v₂, u₃v₁−u₁v₃, u₁v₂−u₂v₁⟩ (expand a 3×3 determinant).',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Dot Product = Cosine, Cross Product = Sine',
        body: '**u** · **v** = |**u**||**v**|cos θ (scalar) — measures alignment. Zero when perpendicular.\n|**u** × **v**| = |**u**||**v**|sin θ (scalar magnitude) — measures the area of the parallelogram. Zero when parallel.\nTogether: **u** · **v** = 0 ↔ perpendicular; **u** × **v** = **0** ↔ parallel.',
      },
      {
        type: 'real-world',
        title: 'Work = Force · Displacement (Dot Product)',
        body: 'When a force **F** acts on an object that moves displacement **d**, the work done is W = **F** · **d** = |**F**||**d**|cos θ. Only the component of force in the direction of motion does work. If θ = 90° (force perpendicular to motion, like a circular orbit), then W = 0. The dot product captures this "projection onto direction of motion."',
      },
      {
        type: 'misconception',
        title: 'Dot Product Is NOT Multiplication',
        body: '**u** · **v** is a scalar — it gives a NUMBER, not a vector. You cannot write **u** · **v** · **w** because **u** · **v** is a scalar and scalars don\'t have dot products with vectors. The cross product **u** × **v** is a VECTOR. And **u** × **v** = −(**v** × **u**) — cross product is anti-commutative, not commutative!',
      },
      {
        type: 'prior-knowledge',
        title: 'Standard Basis Vectors',
        body: 'i = ⟨1,0,0⟩, j = ⟨0,1,0⟩, k = ⟨0,0,1⟩ are the standard basis vectors. Any 3D vector decomposes as **v** = a**i** + b**j** + c**k** = ⟨a,b,c⟩. Key facts: **i** × **j** = **k**, **j** × **k** = **i**, **k** × **i** = **j** (cyclic), and **i** × **i** = **j** × **j** = **k** × **k** = **0**.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Vector Addition and Dot Product',
        caption: 'Visualize two vectors, their sum, and compute the dot product to see the angle between them.',
      },
    ],
  },

  math: {
    prose: [
      '2D vectors: **v** = ⟨a, b⟩ = a**i** + b**j**. |**v**| = √(a²+b²). Unit vector: **v̂** = ⟨a/|**v**|, b/|**v**|⟩.',
      '3D vectors: **v** = ⟨a,b,c⟩. |**v**| = √(a²+b²+c²).',
      'Vector operations: if **u** = ⟨u₁,u₂,u₃⟩ and **v** = ⟨v₁,v₂,v₃⟩:\n• Addition: **u** + **v** = ⟨u₁+v₁, u₂+v₂, u₃+v₃⟩\n• Scalar mult: k**v** = ⟨kv₁, kv₂, kv₃⟩\n• Dot product: **u** · **v** = u₁v₁ + u₂v₂ + u₃v₃ = |**u**||**v**|cos θ\n• Cross product: **u** × **v** = det([**i** **j** **k**; u₁ u₂ u₃; v₁ v₂ v₃])',
      'Projection of **u** onto **v**: scalar projection = **u** · **v̂** = (**u** · **v**)/|**v**|. Vector projection = ((**u** · **v**)/|**v**|²)**v** = (**u** · **v̂**)**v̂**.',
      'Lines in space: **r**(t) = **r₀** + t**d**, where **r₀** is a point on the line and **d** is the direction vector. In 2D: (x,y) = (x₀,y₀) + t(a,b), giving the parametric equations x = x₀+ta, y = y₀+tb.',
      'Cross product properties: |**u** × **v**| = area of parallelogram spanned by **u**, **v**. (**u** × **v**) · **u** = 0 and (**u** × **v**) · **v** = 0 (the cross product is perpendicular to both). Anti-commutativity: **v** × **u** = −(**u** × **v**).',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Dot Product and Angle',
        body: '\\mathbf{u} \\cdot \\mathbf{v} = u_1v_1 + u_2v_2 + u_3v_3 = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta\\\\\n\\cos\\theta = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{|\\mathbf{u}||\\mathbf{v}|}',
      },
      {
        type: 'definition',
        title: 'Cross Product (3D)',
        body: '\\mathbf{u}\\times\\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\u_1&u_2&u_3\\\\v_1&v_2&v_3\\end{vmatrix}\\\\\n= \\langle u_2v_3-u_3v_2,\\;u_3v_1-u_1v_3,\\;u_1v_2-u_2v_1\\rangle',
      },
      {
        type: 'definition',
        title: 'Vector Projection',
        body: '\\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{|\\mathbf{v}|^2}\\mathbf{v} = (\\mathbf{u}\\cdot\\hat{\\mathbf{v}})\\hat{\\mathbf{v}}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Formally, a vector space over ℝ is a set V with operations + (addition) and · (scalar multiplication) satisfying eight axioms: commutativity and associativity of addition, additive identity and inverses, multiplicative identity and associativity of scalar multiplication, and two distributive laws. The set ℝⁿ with component-wise addition and scalar multiplication is the prototypical vector space.',
      'The dot product is an example of an inner product: a bilinear, symmetric, positive definite operation. Bilinear means linear in each argument separately. Symmetric: **u** · **v** = **v** · **u**. Positive definite: **v** · **v** ≥ 0 with equality only for **v** = **0**. Inner products give a notion of angle (via cos θ = (**u** · **v**)/(|**u**||**v**|)) and orthogonality — the foundation for Fourier analysis, quantum mechanics, and machine learning (kernel methods).',
      'The Cauchy-Schwarz inequality: |**u** · **v**| ≤ |**u**| |**v**|. Proof: for any scalar t, |**u** + t**v**|² ≥ 0. Expanding with the dot product: (|**u**|² + 2t(**u**·**v**) + t²|**v**|²) ≥ 0. This is a quadratic in t with no real roots or a repeated root, so the discriminant is ≤ 0: 4(**u**·**v**)² − 4|**u**|²|**v**|² ≤ 0, giving (**u**·**v**)² ≤ |**u**|²|**v**|². The triangle inequality |**u**+**v**| ≤ |**u**|+|**v**| follows from Cauchy-Schwarz.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz Inequality',
        body: '|\\mathbf{u} \\cdot \\mathbf{v}| \\leq |\\mathbf{u}|\\,|\\mathbf{v}|\\\\\n\\text{with equality iff } \\mathbf{u} \\parallel \\mathbf{v} \\text{ (one is a scalar multiple of the other)}.\\\\\n\\text{This also implies the triangle inequality: } |\\mathbf{u}+\\mathbf{v}| \\leq |\\mathbf{u}|+|\\mathbf{v}|.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-vectors-ex1',
      title: 'Vector Operations: Finding Resultant Velocity',
      problem: '\\text{An airplane has velocity } \\mathbf{v}_p = \\langle 200, 150 \\rangle \\text{ km/h (relative to air). Wind has velocity } \\mathbf{v}_w = \\langle -30, 20 \\rangle \\text{ km/h. Find the actual velocity and speed.}',
      steps: [
        { expression: '\\mathbf{v}_{\\text{actual}} = \\mathbf{v}_p + \\mathbf{v}_w = \\langle 200+(-30),\\; 150+20\\rangle = \\langle 170, 170 \\rangle \\text{ km/h}', annotation: 'Add components.' },
        { expression: '|\\mathbf{v}_{\\text{actual}}| = \\sqrt{170^2+170^2} = 170\\sqrt{2} \\approx 240.4 \\text{ km/h}', annotation: 'Magnitude = speed.' },
        { expression: '\\theta = \\arctan\\!\\left(\\frac{170}{170}\\right) = \\arctan(1) = 45°', annotation: 'Direction: 45° above the positive x-axis (northeast).' },
      ],
      conclusion: 'The actual velocity is 170√2 ≈ 240 km/h northeast. Wind reinforced the eastward component while adding to the northward component.',
    },
    {
      id: 'ch6-vectors-ex2',
      title: 'Dot Product: Angle Between Vectors',
      problem: '\\text{Find the angle between } \\mathbf{u} = \\langle 3, 1, -2 \\rangle \\text{ and } \\mathbf{v} = \\langle 1, 4, 2 \\rangle.',
      steps: [
        { expression: '\\mathbf{u} \\cdot \\mathbf{v} = (3)(1)+(1)(4)+(-2)(2) = 3+4-4 = 3', annotation: 'Compute the dot product via components.' },
        { expression: '|\\mathbf{u}| = \\sqrt{9+1+4} = \\sqrt{14}, \\quad |\\mathbf{v}| = \\sqrt{1+16+4} = \\sqrt{21}', annotation: 'Compute magnitudes.' },
        { expression: '\\cos\\theta = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{|\\mathbf{u}||\\mathbf{v}|} = \\frac{3}{\\sqrt{14}\\cdot\\sqrt{21}} = \\frac{3}{\\sqrt{294}} = \\frac{3}{7\\sqrt{6}}', annotation: '√(14·21) = √294 = 7√6.' },
        { expression: '\\theta = \\arccos\\!\\left(\\frac{3}{7\\sqrt{6}}\\right) \\approx \\arccos(0.1750) \\approx 79.9°', annotation: '3/(7√6) ≈ 3/17.15 ≈ 0.175. Angle ≈ 80°.' },
      ],
      conclusion: 'The two vectors make an angle of about 80°. Since the dot product is positive (not zero), the vectors are not perpendicular; since 80° < 90°, they form an acute angle.',
    },
    {
      id: 'ch6-vectors-ex3',
      title: 'Work Done by a Force (Dot Product Application)',
      problem: '\\text{A force } \\mathbf{F} = \\langle 5, 2, -3 \\rangle \\text{ N moves an object displacement } \\mathbf{d} = \\langle 4, -1, 6 \\rangle \\text{ m. Find the work done.}',
      steps: [
        { expression: 'W = \\mathbf{F} \\cdot \\mathbf{d} = (5)(4)+(2)(-1)+(-3)(6)', annotation: 'Work = dot product of force and displacement.' },
        { expression: '= 20 - 2 - 18 = 0 \\text{ J}', annotation: 'The dot product is exactly zero.' },
      ],
      conclusion: 'W = 0 J. The force did no net work! This means the force **F** is perpendicular to the displacement **d** — all motion was perpendicular to the applied force. Think of a magnetic force on a charged particle: it always acts perpendicular to velocity, so it does no work and cannot change the particle\'s speed, only its direction.',
    },
    {
      id: 'ch6-vectors-ex4',
      title: 'Cross Product: Area of a Triangle',
      problem: '\\text{Find the area of the triangle with vertices } A = (1,0,0), B = (0,1,0), C = (0,0,1).',
      steps: [
        { expression: '\\overrightarrow{AB} = B - A = \\langle -1, 1, 0 \\rangle, \\quad \\overrightarrow{AC} = C - A = \\langle -1, 0, 1 \\rangle', annotation: 'Form two edge vectors from A.' },
        { expression: '\\overrightarrow{AB} \\times \\overrightarrow{AC} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\-1&1&0\\\\-1&0&1\\end{vmatrix}', annotation: 'Cross product via the 3×3 determinant.' },
        { expression: '= \\mathbf{i}(1\\cdot 1 - 0\\cdot 0) - \\mathbf{j}((-1)\\cdot 1 - 0\\cdot(-1)) + \\mathbf{k}((-1)\\cdot 0 - 1\\cdot(-1)) = \\langle 1, 1, 1 \\rangle', annotation: 'Expand each 2×2 minor.' },
        { expression: '|\\overrightarrow{AB} \\times \\overrightarrow{AC}| = \\sqrt{1+1+1} = \\sqrt{3}', annotation: 'Magnitude of the cross product = area of the parallelogram.' },
        { expression: '\\text{Area of triangle} = \\frac{1}{2}|\\overrightarrow{AB}\\times\\overrightarrow{AC}| = \\frac{\\sqrt{3}}{2}', annotation: 'Triangle area = half the parallelogram area.' },
      ],
      conclusion: 'Area = √3/2. This triangle is the face of a regular tetrahedron inscribed in the unit coordinate cube. The cross product gives the area of any triangle in 3D — an essential tool in 3D geometry and computer graphics.',
    },
    {
      id: 'ch6-vectors-ex5',
      title: 'Vector Projection and Orthogonal Decomposition',
      problem: '\\text{Project } \\mathbf{u} = \\langle 4, 2, 0 \\rangle \\text{ onto } \\mathbf{v} = \\langle 1, 1, 0 \\rangle. \\text{ Then find the component perpendicular to } \\mathbf{v}.',
      steps: [
        { expression: '\\mathbf{u} \\cdot \\mathbf{v} = 4(1)+2(1)+0(0) = 6, \\quad |\\mathbf{v}|^2 = 1+1+0 = 2', annotation: 'Compute the dot product and |v|².' },
        { expression: '\\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{|\\mathbf{v}|^2}\\mathbf{v} = \\frac{6}{2}\\langle 1,1,0\\rangle = \\langle 3,3,0\\rangle', annotation: 'Vector projection formula.' },
        { expression: '\\mathbf{u}_{\\perp} = \\mathbf{u} - \\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\langle 4,2,0\\rangle - \\langle 3,3,0\\rangle = \\langle 1,-1,0\\rangle', annotation: 'Perpendicular component = u minus its projection.' },
        { expression: '\\text{Check: } \\mathbf{u}_{\\perp} \\cdot \\mathbf{v} = (1)(1)+(-1)(1)+(0)(0) = 0\\;\\checkmark', annotation: 'The component ⟨1,−1,0⟩ is indeed perpendicular to v.' },
      ],
      conclusion: '**u** decomposes as ⟨3,3,0⟩ + ⟨1,−1,0⟩ — parallel plus perpendicular to **v**. This orthogonal decomposition underlies the Gram-Schmidt process (making orthogonal bases) and is fundamental in linear algebra, signal processing, and quantum mechanics.',
    },
  ],

  challenges: [
    {
      id: 'ch6-vectors-ch1',
      difficulty: 'easy',
      problem: 'Find a unit vector perpendicular to both **u** = ⟨1, 0, 1⟩ and **v** = ⟨0, 1, 1⟩.',
      hint: 'Compute **u** × **v**, then divide by its magnitude.',
      walkthrough: [
        { expression: '\\mathbf{u}\\times\\mathbf{v} = \\langle 0\\cdot1-1\\cdot1,\\;1\\cdot0-1\\cdot1,\\;1\\cdot1-0\\cdot0\\rangle = \\langle -1,-1,1\\rangle', annotation: 'Cross product via the determinant formula.' },
        { expression: '|\\mathbf{u}\\times\\mathbf{v}| = \\sqrt{1+1+1} = \\sqrt{3}', annotation: 'Magnitude.' },
        { expression: '\\hat{n} = \\frac{\\langle-1,-1,1\\rangle}{\\sqrt{3}} = \\left\\langle-\\frac{1}{\\sqrt{3}},-\\frac{1}{\\sqrt{3}},\\frac{1}{\\sqrt{3}}\\right\\rangle', annotation: 'Divide by magnitude to get unit vector.' },
      ],
      answer: '\\hat{n} = \\langle -1/\\sqrt{3},\\;-1/\\sqrt{3},\\;1/\\sqrt{3}\\rangle',
    },
    {
      id: 'ch6-vectors-ch2',
      difficulty: 'medium',
      problem: 'A box of mass 10 kg is pulled up a ramp inclined at 30° to the horizontal by a rope parallel to the ramp. Find: (a) the component of gravity along the ramp, and (b) the component perpendicular to the ramp.',
      hint: 'Gravity = ⟨0, −mg⟩ = ⟨0, −98⟩ N. Unit vector along ramp = ⟨cos30°, sin30°⟩. Use projection.',
      walkthrough: [
        { expression: '\\mathbf{g} = \\langle 0, -98 \\rangle \\text{ N}, \\quad \\hat{r} = \\langle \\cos 30°, \\sin 30° \\rangle = \\langle \\sqrt{3}/2, 1/2 \\rangle', annotation: 'Set up the gravity vector and ramp direction.' },
        { expression: '\\mathbf{g}\\cdot\\hat{r} = (0)(\\sqrt{3}/2)+(-98)(1/2) = -49 \\text{ N}', annotation: 'Scalar projection: component of g along the ramp. Negative means gravity acts DOWN the ramp.' },
        { expression: 'g_{\\text{along ramp}} = -49 \\text{ N (magnitude 49 N, directed down the ramp)}', annotation: 'This is the force the rope must overcome: 49 N up the ramp.' },
        { expression: '\\hat{n} = \\langle -\\sin30°, \\cos30° \\rangle = \\langle -1/2, \\sqrt{3}/2 \\rangle \\text{ (normal to ramp)}', annotation: 'Unit normal to ramp surface.' },
        { expression: 'g_{\\perp} = \\mathbf{g}\\cdot\\hat{n} = (0)(-1/2)+(-98)(\\sqrt{3}/2) = -49\\sqrt{3} \\approx -84.9 \\text{ N}', annotation: 'Normal component (into the ramp surface) = −98sin60° = −49√3 N. Magnitude is the normal force.' },
      ],
      answer: '49 N along ramp, 49\\sqrt{3} \\approx 84.9 \\text{ N perpendicular}',
    },
    {
      id: 'ch6-vectors-ch3',
      difficulty: 'hard',
      problem: 'Prove the vector identity |**u** × **v**|² + (**u** · **v**)² = |**u**|²|**v**|². Interpret geometrically.',
      hint: 'Use |**u** × **v**| = |**u**||**v**|sin θ and **u** · **v** = |**u**||**v**|cos θ. Then sin²θ + cos²θ = 1.',
      walkthrough: [
        { expression: '|\\mathbf{u}\\times\\mathbf{v}|^2 = (|\\mathbf{u}||\\mathbf{v}|\\sin\\theta)^2 = |\\mathbf{u}|^2|\\mathbf{v}|^2\\sin^2\\theta', annotation: 'Cross product magnitude formula.' },
        { expression: '(\\mathbf{u}\\cdot\\mathbf{v})^2 = (|\\mathbf{u}||\\mathbf{v}|\\cos\\theta)^2 = |\\mathbf{u}|^2|\\mathbf{v}|^2\\cos^2\\theta', annotation: 'Dot product formula.' },
        { expression: '|\\mathbf{u}\\times\\mathbf{v}|^2 + (\\mathbf{u}\\cdot\\mathbf{v})^2 = |\\mathbf{u}|^2|\\mathbf{v}|^2(\\sin^2\\theta+\\cos^2\\theta) = |\\mathbf{u}|^2|\\mathbf{v}|^2 \\;\\blacksquare', annotation: 'Pythagorean identity: sin²θ + cos²θ = 1.' },
        { expression: '\\text{Geometric interpretation: } |\\mathbf{u}|^2|\\mathbf{v}|^2 = (\\text{area of parallelogram})^2 + (\\mathbf{u}\\cdot\\mathbf{v})^2', annotation: 'This connects the parallelogram area (cross product) to the oblique projection (dot product) via this Pythagorean-type identity.' },
      ],
      answer: '\\text{Proved via } \\sin^2\\theta+\\cos^2\\theta=1.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Parametric curves can be described using position vectors r(t) = ⟨x(t), y(t)⟩ — the bridge to vector-valued functions.' },
    { lessonSlug: 'polar-coordinates', label: 'Polar Coordinates', context: 'Polar vectors r in the plane have magnitude r and direction θ — a 2D polar coordinate system is a vector description.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'Physical related rates problems (shadow, ladder, etc.) can be set up using vector components to track multiple changing lengths simultaneously.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
