export default {
  id: 'geo-6-3',
  slug: 'volume-3d',
  chapter: 'geometry-6',
  title: 'Volume and Surface Area of 3D Shapes',
  subtitle: 'How to measure the inside and outside of any common solid',
  tags: ['geometry', 'volume', 'surface-area', '3D', 'prism', 'cylinder', 'cone', 'sphere', 'pyramid'],
  hook: {
    question: 'You have a rectangular box, a can, a cone, and a ball — how much material went into each, and how much can each hold?',
    realWorldContext: 'Packaging engineers minimize surface area (material cost) while maximizing volume (contents). Architects compute concrete volumes for construction. Pharmacists calculate capsule volumes. Every 3D object in the real world has both a volume (how much it holds) and a surface area (how much material covers it).',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**The organizing principle.** Every common 3D solid fits into one of two families: **prism-like** (constant cross-section, $V = A_{\\text{base}} \\times h$) or **pyramid-like** (tapers to a point, $V = \\frac{1}{3} A_{\\text{base}} \\times h$). Memorize the family, not the specific formulas.',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{prism/cylinder}} = A_{\\text{base}} \\cdot h \\qquad\\qquad V_{\\text{pyramid/cone}} = \\tfrac{1}{3} A_{\\text{base}} \\cdot h',
        caption: 'Two families. The ⅓ factor always appears in the tapering (pyramid/cone) family.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Rectangular prism (box).** Base area $= lw$, so $V = lwh$. Surface area: 6 rectangular faces in three pairs — top/bottom ($lw$ each), front/back ($lh$ each), sides ($wh$ each):',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{box}} = lwh \\qquad SA_{\\text{box}} = 2(lw + lh + wh)',
        caption: 'The box — most common 3D shape in everyday engineering',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Cylinder.** Base area $= \\pi r^2$, so $V = \\pi r^2 h$. Surface area: two circular caps plus the lateral face (which unrolls into a rectangle of width $2\\pi r$ and height $h$):',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{cylinder}} = \\pi r^2 h \\qquad SA_{\\text{cylinder}} = 2\\pi r^2 + 2\\pi r h',
        caption: 'Cylinder — prism family with circular base',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Cone.** Base area $= \\pi r^2$, so $V = \\frac{1}{3}\\pi r^2 h$. For surface area, the lateral face unrolls into a sector with slant height $\\ell = \\sqrt{r^2 + h^2}$. The lateral area of that sector is $\\pi r \\ell$:',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{cone}} = \\tfrac{1}{3}\\pi r^2 h \\qquad SA_{\\text{cone}} = \\pi r^2 + \\pi r \\ell \\quad (\\ell = \\sqrt{r^2+h^2})',
        caption: 'Cone — pyramid family with circular base. Slant height ℓ is NOT the same as h.',
      },
      {
        type: 'viz',
        id: 'G4_1_PrismsCylinders',
        title: 'Prisms and Cylinders',
        mathBridge: 'Compare the prism and cylinder side by side. Both are in the $V = A_{\\text{base}} \\times h$ family. Change the height and watch volume scale linearly. Change the radius: volume scales with $r^2$. Surface area grows more slowly than volume because volume is 3D and surface area is 2D.',
      },
      {
        type: 'viz',
        id: 'G4_2_PyramidsCones',
        title: 'Pyramids and Cones',
        mathBridge: 'The cone holds exactly $\\frac{1}{3}$ of the cylinder volume. Pour it out: three full cones fill the cylinder. For any pyramid, three of them pack perfectly into the corresponding prism. The $\\frac{1}{3}$ factor is not an approximation — it is exact.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Sphere.** The sphere stands alone — it is neither a prism nor a pyramid. Its volume and surface area formulas come from Archimedes:',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{sphere}} = \\tfrac{4}{3}\\pi r^3 \\qquad SA_{\\text{sphere}} = 4\\pi r^2',
        caption: 'Sphere — the most efficient shape (maximum volume per unit surface area)',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Comparing shapes.** For equal volumes, a sphere has the smallest surface area of any solid — this is the **isoperimetric inequality**, and it is why bubbles are spherical (minimizing surface energy) and why cells are roughly spherical.',
          '**Scaling laws.** When you scale a 3D shape by a factor of $k$: length scales by $k$, surface area scales by $k^2$, volume scales by $k^3$. This is why large animals have proportionally thinner legs than small animals (more volume relative to cross-section), and why ice melts faster when crushed (more surface area per unit volume).',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Scale by }k:\\quad \\text{length}\\times k,\\quad \\text{area}\\times k^2,\\quad \\text{volume}\\times k^3',
        caption: 'The scaling laws — one of the most important facts in applied geometry',
      },
      {
        type: 'viz',
        id: 'G4_3_Sphere',
        title: 'The Sphere',
        mathBridge: 'Adjust the sphere radius. Volume grows as $r^3$ (cubic growth) while surface area grows as $r^2$ (quadratic growth). At small $r$, surface dominates; at large $r$, volume grows faster. This gap between $r^2$ and $r^3$ is why the volume-to-surface ratio increases with size — a key fact in biology and engineering.',
      },
    ],
  },
  mentalModel: [
    'Two families: prism/cylinder use V=A·h; pyramid/cone use V=⅓A·h. The ⅓ always goes with tapering shapes',
    'Surface area = sum of all faces. For curved shapes: unroll the lateral surface to find its flat area (rectangle for cylinder, sector for cone)',
    'Sphere: V=⁴⁄₃πr³, SA=4πr². Derived by Archimedes using the comparison to a cylinder-minus-cone',
    'Scaling by k: length×k, area×k², volume×k³. Doubling all dimensions makes volume 8× larger but surface area only 4× larger',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A rectangular box is $4$ cm × $5$ cm × $6$ cm. Its volume is…',
      options: ['$60$ cm³', '$120$ cm³', '$148$ cm³'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A cylinder has radius $3$ cm and height $10$ cm. Its volume is…',
      options: ['$30\\pi$ cm³', '$90\\pi$ cm³', '$300\\pi$ cm³'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A cone has radius $6$ cm and height $8$ cm. Its volume is…',
      options: ['$288\\pi$ cm³', '$96\\pi$ cm³', '$48\\pi$ cm³'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A sphere has radius $3$ cm. Its volume is…',
      options: ['$36\\pi$ cm³', '$12\\pi$ cm³', '$9\\pi$ cm³'],
      correct: 0,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A cone has the same base and height as a cylinder. The cone\'s volume is what fraction of the cylinder\'s?',
      options: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{2}{3}$'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A cylinder has radius $5$ cm and height $12$ cm. Its total surface area is…',
      options: ['$170\\pi$ cm²', '$120\\pi$ cm²', '$60\\pi$ cm²'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'You scale a sphere\'s radius from $2$ cm to $6$ cm (tripling it). Its volume increases by a factor of…',
      options: ['3', '9', '27'],
      correct: 2,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'A cone has radius $5$ cm and height $12$ cm. Its slant height is…',
      options: ['13 cm', '17 cm', '$\\sqrt{119}$ cm'],
      correct: 0,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Why is the sphere the most efficient shape for enclosing volume?',
      options: [
        'It is the shape that contains the most volume for a given surface area — proved by the isoperimetric inequality',
        'It is the easiest shape to manufacture',
        'It is efficient only for very large objects',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A cube has side $4$ cm. You double all sides to $8$ cm. How many times larger is the new volume?',
      options: ['2', '4', '8'],
      correct: 2,
    },
  ],
};
