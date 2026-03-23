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
      "The angles of any triangle always sum to 180°. This is not just a rule — it follows from the parallel line axiom of Euclidean geometry. Draw a line through the apex of any triangle parallel to the base. The three angles of the triangle line up along it, making a straight angle of 180°. This proof works for every triangle, every time.",
      "Two triangles are similar (∼) if their angles match — one is a scaled copy of the other. Similar triangles have equal ratios of corresponding sides. This is why the trigonometric ratios are well-defined: in any right triangle with a given acute angle, the ratio opposite/hypotenuse is always the same number, regardless of the triangle's size. That number is the sine of the angle.",
      "Two triangles are congruent (≅) if they have the same angles and the same side lengths — they are identical, not just scaled copies. The congruence conditions (SSS, SAS, ASA, AAS, HL for right triangles) tell you the minimum information needed to guarantee two triangles are identical.",
    ],
    callouts: [
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
    ],
    visualizations: [
      {
        id: 'TriangleGeometryViz',
        title: 'Similar Triangles, Thales, and the Pythagorean Proof',
        mathBridge: 'Drag vertices to reshape the triangle. See the angle sum stay at 180°. Switch modes to see Thales and the Pythagorean visual proof.',
        caption: 'Every trig ratio is secretly a similar-triangle relationship.',
      },
      { id: 'VideoCarousel', title: "Triangle Geometry & Thales' Theorem", props: { videos: [
          { url: 'https://www.youtube.com/embed/mRqMtR1D4KE', title: 'TR-07 — Geometry Review of Triangles' },
          { url: 'https://www.youtube.com/embed/hfr2Sp8W1uU', title: "TR-07Z — Thales' Theorem Proof" },
        ]},
      },
      { id: 'VideoEmbed', title: 'TR-08: Similar and Congruent Triangles', props: { url: 'https://www.youtube.com/embed/lNd-ubyTkg4' } },
      { id: 'VideoCarousel', title: 'The Pythagorean Theorem', props: { videos: [
          { url: 'https://www.youtube.com/embed/4A9iNamXuZk', title: 'TR-09 — The Pythagorean Theorem' },
          { url: 'https://www.youtube.com/embed/0M2aTzmhjXM', title: 'TR-09Z — Proof of Pythagorean Theorem' },
        ]},
      },
      { id: 'VideoEmbed', title: 'TR-10: Pythagorean Triples', props: { url: 'https://www.youtube.com/embed/ZG2p4jx-i-Q' } },
      {
        id: 'ImplicitDiffProof',
        title: 'Proof: x² + y² = r²  →  dy/dx = −x/y',
        mathBridge: 'The circle $x^2 + y^2 = r^2$ is the Pythagorean theorem applied to every point on the circle. When calculus arrives, differentiating this equation implicitly reveals that the tangent at any point is perpendicular to the radius — a fact that geometry predicts and calculus confirms.',
        caption: 'A calculus preview: see how the Pythagorean circle equation yields the slope formula dy/dx = −x/y.',
      },
      { id: 'VideoCarousel', title: 'Distance Between Points', props: { videos: [
          { url: 'https://www.youtube.com/embed/Cy90jWCrPfo', title: 'TR-11 — Distance in a Plane' },
          { url: 'https://www.youtube.com/embed/7br1PvhFedQ', title: 'TR-12 — Distance in Space' },
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
        type: 'mnemonic',
        title: 'Common Pythagorean triples — memorise these',
        body: '3{-}4{-}5 \\quad 5{-}12{-}13 \\quad 8{-}15{-}17 \\quad 7{-}24{-}25 \\\\ \\text{Multiples also work: } 6{-}8{-}10,\\; 9{-}12{-}15,\\; 10{-}24{-}26 \\ldots',
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
        },
        {
          expression: 'EF = k \\cdot BC = \\frac{2}{3} \\times 9 = 6 \\qquad DF = k \\cdot AC = \\frac{2}{3} \\times 12 = 8',
          annotation: 'Multiply all sides of the original triangle by the scale factor.',
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
        },
        {
          expression: 'm=3, n=1: \\quad a = m^2-n^2 = 8, \\quad b = 2mn = 6, \\quad c = m^2+n^2 = 10',
          annotation: 'Apply the generating formula. This gives the triple (6, 8, 10) — a multiple of (3, 4, 5).',
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
        },
        {
          expression: '= \\sqrt{4 + 9 + 25} = \\sqrt{38}',
          annotation: 'Two applications of the Pythagorean theorem: first in the $xy$-plane, then adding the $z$ component.',
        },
      ],
      conclusion: 'The 3D distance formula is exactly the Pythagorean theorem applied in three dimensions. There is nothing new to memorise — just one more square under the root.',
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
  ],

  calcBridge: {
    teaser: 'Similar triangles are secretly behind every trig derivative proof. When we compute $\\lim_{h\\to 0}(\\sin(x+h)-\\sin x)/h$, we use the angle addition formula — which itself comes from comparing similar triangles on the unit circle. The 3D distance formula becomes the magnitude of a vector in multivariable calculus, and surfaces of revolution use the Pythagorean theorem to compute arc length.',
    linkedLessons: ['trig-ratios-right-triangles', 'trig-identities-deep-dive'],
  },
}
