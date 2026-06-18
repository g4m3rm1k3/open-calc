export default {
  id: 'ch3-trig-002',
  slug: 'triangle-geometry',
  chapter: 'precalc-3',
  order: 2,
  title: 'Triangle Geometry: The Foundation Everything Else Stands On',
  subtitle: "Thales' theorem, similar triangles, the Pythagorean theorem proved, and Pythagorean triples",
  tags: ['triangles', 'similar triangles', 'congruent triangles', 'Pythagorean theorem', 'Pythagorean triples', "Thales' theorem", 'triangle sum', 'distance formula 3D'],
  aliases: "triangle angle sum similar congruent Pythagorean theorem proof triples 3-4-5 Thales theorem distance 3D space",

  hook: {
    question: "Thales of Miletus, around 600 BCE, proved that any angle inscribed in a semicircle is a right angle. He reportedly discovered this while looking at reflections in water. How do you prove something that visually obvious — and why does it matter for trigonometry?",
    realWorldContext: "Similar triangles are the engine behind trigonometry: the trig ratios are defined for a right triangle, but they work for any angle because all right triangles with the same angle are similar. Pythagorean triples appear in construction (the 3-4-5 rope trick to make a right angle), GPS signal processing, and error-correcting codes. The 3D distance formula underlies every computation in 3D graphics and physics.",
    previewVisualizationId: 'TriangleGeometryViz',
  },

  intuition: {
    prose: [
      "**Where you are in the story:** In the previous lesson (Angles & Radians) you established how to measure angles and why radians are the natural unit. Now you need the geometric scaffolding that makes trigonometry work: specifically, why the trig ratios are well-defined at all. The answer is similar triangles — and this lesson fills that gap by building up from the angle sum theorem through Thales' theorem to the Pythagorean theorem and its triples.",
      "The angles of any triangle always sum to 180°. This is not just a rule — it follows from the parallel line axiom of Euclidean geometry. Draw a line through the apex of any triangle parallel to the base. The three angles of the triangle line up along it, making a straight angle of 180°. This proof works for every triangle, every time.",
      "Two triangles are similar (∼) if their angles match — one is a scaled copy of the other. Similar triangles have equal ratios of corresponding sides. This is why the trigonometric ratios are well-defined: in any right triangle with a given acute angle, the ratio opposite/hypotenuse is always the same number, regardless of the triangle's size. That number is the sine of the angle.",
      "Two triangles are congruent (≅) if they have the same angles and the same side lengths — they are identical, not just scaled copies. The congruence conditions (SSS, SAS, ASA, AAS, HL for right triangles) tell you the minimum information needed to guarantee two triangles are identical.",
      "**The Language of Inclosure**: A triangle is the simplest possible enclosure in flat space. It is the only polygon that is 'Rigid'—meaning its shape is completely determined by its side lengths. This unique property makes it the universal building block of stable structures.",
      "**Structural Rigidity**: Unlike a square, which can 'shear' into a rhombus without changing its side lengths, a triangle cannot be deformed. To change an angle, you MUST change a side length. This is WHY bridges, cranes, and roof trusses are built from interconnected triangles.",
      "**Where this is heading:** With triangle geometry solid, the next lesson (Trig Ratios in Right Triangles) defines all six trig functions as ratios of the sides — and the similar-triangle argument you just saw is exactly why those ratios depend only on the angle, not on the triangle's size. Every SOH-CAH-TOA ratio is a similar-triangle relationship in disguise.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc-3 arc — Lesson 2 of 11',
        body: '← Angles & Radians | **Triangle Geometry** | Trig Ratios in Right Triangles →',
      },
      {
        type: 'theorem',
        title: 'Triangle angle sum theorem',
        body: '\\text{In any triangle: } \\alpha + \\beta + \\gamma = 180° \\\\ \\text{Exterior angle} = \\text{sum of the two non-adjacent interior angles}',
      },
      {
        type: 'theorem',
        title: 'Similar triangle properties',
        body: '\\triangle ABC \\sim \\triangle DEF \\iff \\text{angles equal AND sides proportional} \\\\ \\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} = k \\quad (\\text{scale factor})',
      },
      {
        type: 'insight',
        title: "Thales' theorem — an angle inscribed in a semicircle",
        body: '\\text{If } AB \\text{ is a diameter and } C \\text{ is any point on the circle, then } \\angle ACB = 90°. \\\\ \\text{This is why the unit circle definition of trig connects to right triangles.}',
      },
      {
        type: 'theorem',
        title: 'Pythagorean triples — generating formula',
        body: '(m^2-n^2,\\; 2mn,\\; m^2+n^2) \\text{ for integers } m > n > 0 \\\\ m=2,n=1 \\to (3,4,5) \\quad m=3,n=2 \\to (5,12,13) \\\\ m=4,n=1 \\to (15,8,17) \\quad m=4,n=3 \\to (7,24,25)',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Language of Inclosure',
        body: '\\text{The word "Triangle" (3 angles) implies "Trigon" (3 sides).} \\\\ \\text{In geometry, these are inseparable. To define three corners is to define three boundaries—the most efficient cage for a 2D area.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Sum of All Things',
        body: '\\text{Why 180?} \\\\ \\text{Parallel translation tells us that as you walk the perimeter, your total turning must equal half a circle to return to the start.} \\\\ \\text{It is the logical boundary of Euclidean space.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: Structural Rigidity',
        body: '\\text{A square can collapse; a triangle cannot.} \\\\ \\text{In engineering, "Triangulation" is the method of creating rigid frameworks. If the sides are fixed, the bridge is safe.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Half-Box Concept',
        body: '\\text{Area} = \\frac{1}{2}bh. \\\\ \\text{Visualize a rectangle with base } b \\text{ and height } h. \\\\ \\text{No matter where the apex of the triangle is, it will always take up exactly 50% of that box\'s volume.}',
      },
    ],
    visualizations: [
      {
        id: 'TriangleGeometryViz',
        title: 'Similar Triangles, Thales, and the Pythagorean Proof',
        mathBridge: 'Before interacting, observe the three triangles shown and note their angles are marked. Step 1: Drag any vertex of the main triangle and watch the angle sum display stay locked at 180°. Step 2: Switch to "Similar Triangles" mode and scale the triangle — notice the ratios of corresponding sides remain constant. Step 3: Switch to "Thales" mode, drag point C along the semicircle, and confirm that the angle at C is always 90°. The key lesson: similar triangles guarantee trig ratios are scale-free; Thales guarantees the unit circle connects to right triangles.',
        caption: 'Every trig ratio is secretly a similar-triangle relationship.',
      },
      { id: 'VideoCarousel', title: "Triangle Geometry & Thales' Theorem", props: { videos: [
          { url: "", title: 'TR-07 — Geometry Review of Triangles' },
          { url: "", title: "TR-07Z — Thales' Theorem Proof" },
        ]},
      },
            { id: 'VideoCarousel', title: 'The Pythagorean Theorem', props: { videos: [
          { url: "", title: 'TR-09 — The Pythagorean Theorem' },
          { url: "", title: 'TR-09Z — Proof of Pythagorean Theorem' },
        ]},
      },
            {
        id: 'ImplicitDiffProof',
        title: 'Proof: x² + y² = r²  →  dy/dx = −x/y',
        mathBridge: 'The circle $x^2 + y^2 = r^2$ is the Pythagorean theorem applied to every point on the circle. When calculus arrives, differentiating this equation implicitly reveals that the tangent at any point is perpendicular to the radius — a fact that geometry predicts and calculus confirms.',
        caption: 'A calculus preview: see how the Pythagorean circle equation yields the slope formula dy/dx = −x/y.',
      },
      { id: 'VideoCarousel', title: 'Distance Between Points', props: { videos: [
          { url: "", title: 'TR-11 — Distance in a Plane' },
          { url: "", title: 'TR-12 — Distance in Space' },
        ]},
      },
    ],
  },

  math: {
    prose: [
      "The Pythagorean theorem $a^2 + b^2 = c^2$ has over 370 known proofs. The most visual is the area rearrangement: start with a square of side $(a+b)$, place four copies of the right triangle inside it, and the remaining area is $c^2$. Rearrange the triangles differently and the remaining area shows $a^2 + b^2$. Same total area → same result.",
      "A Pythagorean triple is a set of three positive integers $(a, b, c)$ satisfying $a^2 + b^2 = c^2$. All primitive triples (no common factor) are generated by $m^2-n^2$, $2mn$, $m^2+n^2$ for coprime integers $m > n > 0$ with $m-n$ odd. The 3-4-5 triple has been used in construction since ancient Egypt — stretch a 12-unit rope into a 3-4-5 triangle and you have a perfect right angle.",
      "The 3D distance formula extends the 2D version by one more Pythagorean step. Given points $(x_1,y_1,z_1)$ and $(x_2,y_2,z_2)$: first find the horizontal distance $d_{xy} = \\sqrt{(\\Delta x)^2+(\\Delta y)^2}$, then the full 3D distance $d = \\sqrt{d_{xy}^2 + (\\Delta z)^2} = \\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}$. It is the Pythagorean theorem applied twice.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Pythagorean theorem and its converse',
        body: 'a^2 + b^2 = c^2 \\iff \\text{the triangle is right-angled at } C \\\\ \\text{Converse: if } a^2+b^2=c^2 \\text{, the angle opposite } c \\text{ is exactly } 90°',
      },
      {
        type: 'theorem',
        title: '2D and 3D distance formulas',
        body: 'd_{2D} = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} \\\\ d_{3D} = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}',
      },
      {
        type: 'insight',
        title: 'Common Pythagorean triples — memorise these',
        body: '3{-}4{-}5 \\quad 5{-}12{-}13 \\quad 8{-}15{-}17 \\quad 7{-}24{-}25 \\\\ \\text{Multiples also work: } 6{-}8{-}10,\\; 9{-}12{-}15,\\; 10{-}24{-}26 \\ldots',
      },
      {
        type: 'theorem',
        title: 'The Parallel Line Argument (Angle Sum)',
        body: '\\text{Draw a line through the apex triangle parallel to the base.} \\\\ \\text{Alternate interior angles show that the three angles of any triangle perfectly tessellate a straight line ($180^\\circ$).}',
      },
      {
        type: 'theorem',
        title: 'The Exterior Angle Extension',
        body: '\\text{The exterior angle of a triangle is equal to the sum of the two opposite interior angles.} \\\\ \\text{If interior angles are } \\alpha, \\beta, \\gamma \\text{, then } Ext_\\gamma = \\alpha + \\beta.',
      },
    ],
  },

  rigor: {
    title: "Proof of Thales' Theorem: any angle in a semicircle is 90°",
    visualizationId: 'TriangleGeometryViz',
    proofSteps: [
      {
        expression: '\\text{Let } AB \\text{ be a diameter of a circle with centre } O. \\text{ Let } C \\text{ be any other point on the circle.}',
        annotation: 'Setup: diameter as base, arbitrary point on the circumference.',
      },
      {
        expression: '\\text{Draw radius } OC. \\text{ Now } OA = OB = OC = r \\text{ (all radii).}',
        annotation: 'The key move: draw the radius to C. This creates two isosceles triangles.',
      },
      {
        expression: '\\triangle OAC \\text{ is isosceles} \\Rightarrow \\angle OAC = \\angle OCA = \\alpha',
        annotation: 'OA = OC (radii), so the base angles of △OAC are equal. Call them α.',
      },
      {
        expression: '\\triangle OBC \\text{ is isosceles} \\Rightarrow \\angle OBC = \\angle OCB = \\beta',
        annotation: 'OB = OC (radii), so the base angles of △OBC are equal. Call them β.',
      },
      {
        expression: '\\angle ACB = \\alpha + \\beta',
        annotation: 'The angle at C is made up of the two base angles from each isosceles triangle.',
      },
      {
        expression: '\\text{Triangle } ABC\\text{: } \\alpha + (\\alpha + \\beta) + \\beta = 180°',
        annotation: 'Angle sum of the full triangle ABC: angles at A (=α), at C (=α+β), at B (=β).',
      },
      {
        expression: '2(\\alpha + \\beta) = 180° \\Rightarrow \\alpha + \\beta = 90° \\Rightarrow \\angle ACB = 90° \\qquad \\blacksquare',
        annotation: "The angle at C is always 90°, regardless of where C sits on the circle. This is Thales' theorem.",
      },
      {
        expression: '\\text{--- Part II: The Area Subtraction (Pythagorean Proof) ---}',
        annotation: 'Let us prove $a^2 + b^2 = c^2$ using the geometry of a large square $(a+b) \\times (a+b)$.'
      },
      {
        expression: '\\text{Total Area} = (a+b)^2 = a^2 + 2ab + b^2',
        annotation: 'Step 1: Calculate the area of the large outer bounding square.'
      },
      {
        expression: '\\text{Inner Area} = 4 \\cdot (\\tfrac{1}{2}ab) + c^2',
        annotation: 'Step 2: The same space is made of 4 right triangles plus a tilted inner square of area $c^2$.'
      },
      {
        expression: 'a^2 + 2ab + b^2 = 2ab + c^2',
        annotation: 'Step 3: Equate the two expressions for the same total area.'
      },
      {
        expression: 'a^2 + b^2 = c^2 \\qquad \\blacksquare',
        annotation: 'Step 4: Subtract $2ab$ from both sides. The algebraic identity mirrors the geometric reality.'
      }
    ],
  },

  examples: [
    {
      id: 'ch3-trig-002-ex1',
      title: 'Using similar triangles to find an unknown side',
      problem: '\\triangle ABC \\sim \\triangle DEF. \\text{ If } AB=6, BC=9, AC=12, \\text{ and } DE=4, \\text{ find } EF \\text{ and } DF.',
      steps: [
        {
          expression: '\\text{Scale factor: } k = \\frac{DE}{AB} = \\frac{4}{6} = \\frac{2}{3}',
          annotation: 'Find the ratio of corresponding sides. DE corresponds to AB.',
          hint: 'When triangles are similar, the scale factor is the ratio of any pair of corresponding sides. Identify which sides correspond using the order of letters in the similarity statement.',
        },
        {
          expression: 'EF = k \\cdot BC = \\frac{2}{3} \\times 9 = 6 \\qquad DF = k \\cdot AC = \\frac{2}{3} \\times 12 = 8',
          annotation: 'Multiply all sides of the original triangle by the scale factor.',
          hint: 'Multiply every side of the original by the same scale factor. This works because similar triangles are proportional copies of each other.',
        },
      ],
      conclusion: 'Similar triangles: find the scale factor from any pair of corresponding sides, then multiply all others by it.',
    },
    {
      id: 'ch3-trig-002-ex2',
      title: 'Verifying and generating Pythagorean triples',
      problem: '\\text{(a) Verify 8-15-17 is a Pythagorean triple. (b) Generate a triple using } m=3, n=1.',
      steps: [
        {
          expression: '8^2 + 15^2 = 64 + 225 = 289 = 17^2 \\checkmark',
          annotation: 'Check: does $a^2 + b^2 = c^2$?',
          hint: 'Square each leg and check if they sum to the square of the largest number (hypotenuse). Always assign the largest number to $c$.',
        },
        {
          expression: 'm=3, n=1: \\quad a = m^2-n^2 = 8, \\quad b = 2mn = 6, \\quad c = m^2+n^2 = 10',
          annotation: 'Apply the generating formula. This gives the triple (6, 8, 10) — a multiple of (3, 4, 5).',
          hint: 'Substitute $m$ and $n$ into the three formulas $m^2-n^2$, $2mn$, $m^2+n^2$. Check that $m > n > 0$.',
        },
      ],
      conclusion: 'The generating formula produces all primitive triples when $\\gcd(m,n)=1$ and $m-n$ is odd. Multiples of primitives also work.',
    },
    {
      id: 'ch3-trig-002-ex3',
      title: '3D distance between two points',
      problem: '\\text{Find the distance between } A(1, -2, 4) \\text{ and } B(3, 1, -1).',
      steps: [
        {
          expression: 'd = \\sqrt{(3-1)^2 + (1-(-2))^2 + (-1-4)^2}',
          annotation: 'Apply the 3D distance formula.',
          hint: 'Subtract coordinates in the same dimension, square each difference, then sum and take the square root. Be careful with negative signs when subtracting negative coordinates.',
        },
        {
          expression: '= \\sqrt{4 + 9 + 25} = \\sqrt{38}',
          annotation: 'Two applications of the Pythagorean theorem: first in the $xy$-plane, then adding the $z$ component.',
          hint: 'Evaluate each squared difference: $(3-1)^2=4$, $(1-(-2))^2=9$, $(-1-4)^2=25$. Sum and simplify under the root.',
        },
      ],
      conclusion: 'The 3D distance formula is exactly the Pythagorean theorem applied in three dimensions. There is nothing new to memorise — just one more square under the root.',
    },
    {
      id: 'ex-triangle-3d-diag',
      title: 'The Room Diagonal: Distancing in Space',
      problem: '\\text{A box has dimensions 3m } \\times \\text{ 4m } \\times \\text{ 12m. What is the longest distance between two opposite corners?}',
      steps: [
        {
          expression: 'd_{floor} = \\sqrt{3^2 + 4^2} = 5',
          annotation: 'Step 1: Calculate the diagonal of the floor. This is a 3-4-5 triangle.',
          hint: 'Start with the 2D diagonal of the base. Recognize that 3, 4, 5 is a Pythagorean triple to skip the computation.',
        },
        {
          expression: 'd_{room} = \\sqrt{5^2 + 12^2} = 13',
          annotation: 'Step 2: Use the floor diagonal as one leg and the height (12) as the other. This is a 5-12-13 triangle.',
          hint: 'Now apply Pythagoras again: the floor diagonal and the vertical height form the two legs of a new right triangle. Recognize 5-12-13 as a standard triple.',
        }
      ],
      conclusion: '3D distance is just Pythagoras twice. The "Diagonal of the Box" is the ultimate test of spatial geometry.'
    },
    {
      id: 'ex-triangle-factory',
      title: 'The Triple Factory: Generating Primitives',
      problem: '\\text{Use Euclid\'s formula with } m=5, n=2 \\text{ to generate a primitive Pythagorean triple.}',
      steps: [
        {
          expression: 'a = 5^2 - 2^2 = 25 - 4 = 21',
          annotation: 'Step 1: Calculate the first leg.',
          hint: 'Apply the formula $a = m^2 - n^2$ directly. This always gives a positive result when $m > n$.',
        },
        {
          expression: 'b = 2(5)(2) = 20',
          annotation: 'Step 2: Calculate the second leg.',
          hint: 'Apply $b = 2mn$. This leg is always even since it is a product of 2.',
        },
        {
          expression: 'c = 5^2 + 2^2 = 25 + 4 = 29',
          annotation: 'Step 3: Calculate the hypotenuse.',
          hint: 'Apply $c = m^2 + n^2$. This is always the largest of the three values.',
        },
        {
          expression: '21^2 + 20^2 = 441 + 400 = 841 = 29^2 \\checkmark',
          annotation: 'Step 4: Verify the result. 21-20-29 is a primitive triple.',
          hint: 'Always verify by checking $a^2 + b^2 = c^2$. A primitive triple has no common factor — check that $\\gcd(20, 21, 29) = 1$.',
        }
      ],
      conclusion: 'Euclid\'s formula is a powerful engine for discovery. It proves that there are infinitely many integer solutions to the right-triangle problem.'
    },
  ],

  challenges: [
    {
      id: 'ch3-trig-002-ch1',
      difficulty: 'medium',
      problem: '\\text{A 10-foot ladder leans against a wall. Its base is 6 feet from the wall. How high up the wall does it reach? Is the foot-to-top distance a Pythagorean triple?}',
      hint: 'This is a right triangle with hypotenuse 10 and one leg 6.',
      walkthrough: [
        {
          expression: 'h^2 + 6^2 = 10^2 \\Rightarrow h^2 = 100-36 = 64 \\Rightarrow h = 8',
          annotation: 'Pythagorean theorem. The height is 8 feet.',
        },
        {
          expression: '(6, 8, 10) = 2 \\times (3, 4, 5) \\checkmark',
          annotation: 'Yes — a multiple of the 3-4-5 triple. Recognising triples saves time on exams.',
        },
      ],
      answer: 'h = 8 \\text{ ft; yes, } (6,8,10) = 2\\times(3,4,5)',
    },
    {
      id: 'ch3-trig-002-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove: the midpoint of the hypotenuse of a right triangle is equidistant from all three vertices.}',
      hint: 'Place the right angle at the origin. The midpoint of the hypotenuse is the average of the two other vertices.',
      walkthrough: [
        {
          expression: '\\text{Let the right angle be at } O=(0,0), A=(2a,0), B=(0,2b). \\text{ Midpoint } M = (a,b).',
          annotation: 'Convenient coordinates. Using $2a$ and $2b$ makes the midpoint calculation clean.',
        },
        {
          expression: '|OM| = \\sqrt{a^2+b^2} \\quad |AM| = \\sqrt{(2a-a)^2+b^2} = \\sqrt{a^2+b^2} \\quad |BM| = \\sqrt{a^2+(2b-b)^2} = \\sqrt{a^2+b^2}',
          annotation: 'All three distances equal $\\sqrt{a^2+b^2}$ — the midpoint is equidistant from all three vertices.',
        },
        {
          expression: '\\therefore M \\text{ is the circumcentre of the right triangle, and the circumradius} = \\tfrac{1}{2}|AB|. \\qquad \\blacksquare',
          annotation: "This is why Thales' theorem works: the circumcentre of a right triangle lies exactly at the midpoint of the hypotenuse.",
        },
      ],
      answer: '|OM| = |AM| = |BM| = \\sqrt{a^2+b^2} = \\tfrac{1}{2}|AB|',
    },
    {
      id: 'ch3-trig-002-ch3',
      difficulty: 'harder',
      problem: '\\text{Verify Thales\' Theorem for a triangle with vertices } (0,0), (6,0), \\text{ and } (0,8). \\text{ Find the midpoint of the hypotenuse and check its distance to all three corners.}',
      hint: 'The midpoint is the center of the circumscribed circle. It should be equidistant from the right angle and the two sharp corners.',
      walkthrough: [
        {
          expression: 'M = (3,4)',
          annotation: 'Step 1: Calculate the midpoint of the hypotenuse from (6,0) to (0,8).'
        },
        {
          expression: 'd_{origin} = \\sqrt{3^2 + 4^2} = 5',
          annotation: 'Step 2: Calculate the distance from (3,4) to the origin (0,0).'
        },
        {
          expression: 'd_{A} = \\sqrt{(3-6)^2 + (4-0)^2} = 5 \\\\ d_{B} = \\sqrt{(3-0)^2 + (4-8)^2} = 5',
          annotation: 'Step 3: Calculate the distance to the other two corners. All are equal.'
        }
      ],
      answer: 'Distances to (0,0), (6,0), (0,8) are all 5.'
    }
  ],

  calcBridge: {
    teaser: 'Similar triangles are secretly behind every trig derivative proof. When we compute $\\lim_{h\\to 0}(\\sin(x+h)-\\sin x)/h$, we use the angle addition formula — which itself comes from comparing similar triangles on the unit circle. The 3D distance formula becomes the magnitude of a vector in multivariable calculus, and surfaces of revolution use the Pythagorean theorem to compute arc length.',
    linkedLessons: ['trig-ratios-right-triangles', 'trig-identities-deep-dive'],
  },

  crossRefs: [
    { slug: 'angles-foundations', reason: 'Angle measurement and the radian definition set up the coordinate framework that triangle geometry uses.' },
    { slug: 'trig-ratios-right-triangles', reason: 'The similar-triangle argument here directly justifies why trig ratios depend only on the angle, not the triangle size.' },
    { slug: 'solving-triangles', reason: 'Law of Cosines is proved using the coordinate distance formula developed here.' },
  ],

  checkpoints: [
    'Why do the angles of any triangle sum to 180°? Sketch the parallel-line proof.',
    'What is the difference between similar and congruent triangles?',
    "State Thales' theorem and explain why it connects to the unit circle definition of trig.",
    'Given two points in 3D space, how do you find the distance between them?',
    'Can you generate a Pythagorean triple using Euclid\'s formula with $m=4, n=1$?',
  ],

  semantics: {
    symbols: [
      { symbol: '\\sim', meaning: 'Similar — same shape, different size' },
      { symbol: '\\cong', meaning: 'Congruent — identical shape and size' },
      { symbol: 'k', meaning: 'Scale factor between two similar triangles' },
      { symbol: 's', meaning: 'Semi-perimeter (half the perimeter), used in Heron\'s formula' },
    ],
    rulesOfThumb: [
      'Two triangles are similar if any two angles match (AA criterion).',
      'The side ratios in similar triangles are always equal to the scale factor.',
      'A triple $(a, b, c)$ with $a^2 + b^2 = c^2$ is Pythagorean; if the GCD is 1, it is primitive.',
      'Pythagorean triples: memorize 3-4-5, 5-12-13, 8-15-17, 7-24-25 — they appear constantly.',
      'The 3D distance formula is Pythagoras applied twice — no new principle is needed.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Coordinate plane and plotting points', where: 'Precalc-1 — Coordinate geometry', why: 'The distance formula and all coordinate proofs depend on fluent coordinate manipulation.' },
      { topic: 'Solving quadratic equations', where: 'Precalc-2 — Algebra', why: 'Verifying Pythagorean triples and deriving Heron\'s formula involve quadratic structure.' },
    ],
    futureLinks: [
      { topic: 'Trig ratios as side ratios', where: 'Trig Ratios in Right Triangles (Lesson 3)', why: 'The similar-triangle argument here is the direct justification for SOH-CAH-TOA.' },
      { topic: 'Law of Cosines', where: 'Solving Triangles (Lesson 5)', why: 'The Law of Cosines proof places the triangle in coordinates and uses the 2D distance formula.' },
      { topic: 'Vector magnitude', where: 'Calculus — Multivariable introduction', why: 'The 3D distance formula generalizes to the Euclidean norm in any dimension.' },
    ],
  },

  assessment: [
    {
      question: 'Two triangles share two angles. Are they similar, congruent, or neither?',
      answer: 'Similar (AA criterion) — same angles means proportional sides.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Is (9, 40, 41) a Pythagorean triple?',
      answer: '$9^2 + 40^2 = 81 + 1600 = 1681 = 41^2$ ✓ — yes.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Find the distance between $(0, 0, 0)$ and $(2, 3, 6)$.',
      answer: '$\\sqrt{4+9+36} = \\sqrt{49} = 7$',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Similar triangles: same shape, different scale — all side ratios are locked.',
    'The angle sum of a triangle is 180° because of the parallel postulate, not by coincidence.',
    "Thales' theorem: any point on a semicircle sees the diameter at exactly 90°.",
    'Pythagorean triples are integer solutions to $a^2+b^2=c^2$ — infinitely many exist.',
    'The 3D distance formula is nothing new: just Pythagoras applied twice in perpendicular planes.',
  ],

  quiz: [
    {
      id: 'q-trig-geo-1',
      type: 'choice',
      text: 'Two triangles have angles 40°, 60°, 80°. They are:',
      options: ['Similar but not necessarily congruent', 'Congruent', 'Neither similar nor congruent', 'Equilateral'],
      answer: 'Similar but not necessarily congruent',
      hints: ['AA criterion: matching angles implies similarity.', 'Without knowing side lengths you cannot confirm congruence.'],
      reviewSection: 'Intuition tab — similar triangle properties',
    },
    {
      id: 'q-trig-geo-2',
      type: 'input',
      text: 'A triangle has sides 5, 12, and 13. What is the area?',
      answer: '30',
      hints: ['Check if it is a right triangle first.', '$5^2+12^2=169=13^2$, so it is a right triangle. Area $= \\frac{1}{2}(5)(12)=30$.'],
      reviewSection: 'Math tab — Pythagorean theorem',
    },
    {
      id: 'q-trig-geo-3',
      type: 'input',
      text: 'Use Euclid\'s formula with $m=3, n=2$ to find a Pythagorean triple.',
      answer: '(5, 12, 13)',
      hints: ['Compute $m^2-n^2$, $2mn$, and $m^2+n^2$.', '$9-4=5$, $2(3)(2)=12$, $9+4=13$.'],
      reviewSection: 'Math tab — Pythagorean triples generating formula',
    },
    {
      id: 'q-trig-geo-4',
      type: 'input',
      text: 'Find the distance between $A(1,2,3)$ and $B(4,6,3)$.',
      answer: '5',
      hints: ['Apply the 3D distance formula.', '$\\sqrt{(4-1)^2+(6-2)^2+(3-3)^2}=\\sqrt{9+16+0}=\\sqrt{25}=5$.'],
      reviewSection: 'Math tab — 2D and 3D distance formulas',
    },
    {
      id: 'q-trig-geo-5',
      type: 'choice',
      text: "Thales' theorem states that an angle inscribed in a semicircle is always:",
      options: ['90°', '45°', '60°', '180°'],
      answer: '90°',
      hints: ['Think about what happens when you draw a radius to the point on the circle.', 'Two isosceles triangles form — their base angles sum to exactly 90°.'],
      reviewSection: "Intuition tab — Thales' theorem",
    },
    {
      id: 'q-trig-geo-6',
      type: 'input',
      text: '$\\triangle ABC \\sim \\triangle DEF$ with $AB=8$, $DE=6$. If $BC=10$, find $EF$.',
      answer: '7.5',
      hints: ['Find the scale factor $k = DE/AB$.', '$k = 6/8 = 3/4$. So $EF = (3/4)(10) = 7.5$.'],
      reviewSection: 'Examples tab — using similar triangles to find an unknown side',
    },
    {
      id: 'q-trig-geo-7',
      type: 'choice',
      text: 'Why does the Pythagorean theorem only apply to right triangles?',
      options: [
        'Because the proof requires the area of a square formed on the hypotenuse, which only exists when one angle is exactly 90°.',
        'Because all triangles have an angle sum of 180°.',
        'Because it was only tested on right triangles historically.',
        'Because the formula $a^2+b^2=c^2$ only produces integers for right triangles.',
      ],
      answer: 'Because the proof requires the area of a square formed on the hypotenuse, which only exists when one angle is exactly 90°.',
      hints: ['Think about the area rearrangement proof.', 'The proof constructs squares on each side — the inner tilted square only closes perfectly when the angle is 90°.'],
      reviewSection: 'Rigor tab — Pythagorean area subtraction proof',
    },
    {
      id: 'q-trig-geo-8',
      type: 'input',
      text: 'A box is 6m × 8m × 24m. What is the length of the space diagonal?',
      answer: '26',
      hints: ['Apply Pythagoras twice: first on the floor, then add the height.', '$d_{floor}=\\sqrt{36+64}=10$. Then $d_{space}=\\sqrt{100+576}=\\sqrt{676}=26$.'],
      reviewSection: 'Examples tab — the room diagonal',
    },
    {
      id: 'q-trig-geo-9',
      type: 'choice',
      text: 'If two triangles satisfy SSS (all three pairs of sides are equal), they are:',
      options: ['Congruent', 'Similar but not congruent', 'Only similar', 'Not necessarily related'],
      answer: 'Congruent',
      hints: ['Equal sides fix both shape and size.', 'SSS is a congruence condition — all three sides equal means the triangles are identical.'],
      reviewSection: 'Intuition tab — congruence conditions',
    },
    {
      id: 'q-trig-geo-10',
      type: 'input',
      text: 'The exterior angle of a triangle is 110°. If one of the non-adjacent interior angles is 65°, find the other.',
      answer: '45°',
      hints: ['Exterior angle = sum of the two non-adjacent interior angles.', '$110° = 65° + x \\Rightarrow x = 45°$.'],
      reviewSection: 'Math tab — exterior angle theorem',
    },
  ],
}
