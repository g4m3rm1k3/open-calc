export default {
  id: 'geo-4-2',
  slug: 'sphere-cavalieri',
  chapter: 'geometry-4',
  title: 'The Sphere and Cavalieri\'s Principle',
  subtitle: 'How Archimedes found sphere volume without calculus — and the slicing principle that makes it work',
  tags: ['geometry', 'sphere', 'cavalieri', 'surface-area', 'archimedes'],
  hook: {
    question: 'How did Archimedes discover the volume of a sphere — 2,000 years before calculus was invented?',
    realWorldContext: 'The sphere is the most efficient shape in nature: it encloses the maximum volume for a given surface area. Every bubble, ball bearing, and planet is drawn toward this shape. Archimedes was so proud of his sphere theorem that he requested a sphere-in-cylinder diagram be engraved on his tombstone.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Cavalieri\'s Principle.** Two solids have equal volume if, at every height, their horizontal cross-sections have equal area. You do not need to know the shape — only the cross-sectional areas at every level.',
          'This principle, stated by Bonaventura Cavalieri in 1635, is essentially pre-calculus integration: volume is the "sum" of infinitely many cross-sectional slices. Cavalieri formalized what Archimedes had already used implicitly in 250 BCE.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Archimedes\' brilliant comparison.** To find the volume of a sphere of radius $r$, Archimedes compared it to a shape whose volume he already knew: a cylinder with a cone removed (a "cylindrical shell with a cone excavated from each end").',
          'Consider a hemisphere of radius $r$ sitting next to a cylinder of radius $r$ and height $r$ with a cone of the same dimensions removed from it. At height $h$ from the base:',
          '— The hemisphere\'s cross-section is a disk of radius $\\sqrt{r^2 - h^2}$ (by Pythagoras), so its area is $\\pi(r^2 - h^2)$.',
          '— The cylinder-minus-cone cross-section: the outer cylinder has area $\\pi r^2$, and the removed cone at height $h$ has radius $h$ (since the cone tapers linearly), so its area is $\\pi r^2 - \\pi h^2 = \\pi(r^2 - h^2)$.',
          'The cross-sectional areas are always equal! By Cavalieri\'s Principle, the two solids have equal volume.',
        ],
      },
      {
        type: 'math',
        tex: 'V_{\\text{hemisphere}} = V_{\\text{cylinder}} - V_{\\text{cone}} = \\pi r^2 h - \\frac{1}{3}\\pi r^2 h = \\frac{2}{3}\\pi r^3',
        caption: "Archimedes' comparison: hemisphere = cylinder minus cone, both of radius r and height r",
      },
      {
        type: 'math',
        tex: 'V_{\\text{sphere}} = 2 \\times \\frac{2}{3}\\pi r^3 = \\frac{4}{3}\\pi r^3',
        caption: 'Doubling the hemisphere gives the full sphere volume',
      },
      {
        type: 'viz',
        id: 'G4_3_Sphere',
        title: "Archimedes' Sphere Theorem",
        mathBridge: 'Watch the cross-section slicing at each height $h$. The hemisphere disk area (blue) and the cylinder-minus-cone area (red) are always equal — Cavalieri\'s Principle in action. Adjust the height slider to verify at any level. The volume of the sphere follows: $\\frac{4}{3}\\pi r^3$.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Surface area of a sphere.** Archimedes also proved that the surface area of a sphere equals the lateral surface area of the smallest cylinder that fits around it. That cylinder has radius $r$ and height $2r$, so its lateral surface is $2\\pi r \\cdot 2r = 4\\pi r^2$.',
        ],
      },
      {
        type: 'math',
        tex: 'SA_{\\text{sphere}} = 4\\pi r^2',
        caption: 'Equal to the lateral surface of the circumscribed cylinder — another Archimedes discovery',
      },
      {
        type: 'prose',
        paragraphs: [
          'The number $4\\pi$ appears because the sphere\'s surface covers exactly four great circles: if you project the sphere onto a flat disk, it takes four such disks to cover the full spherical surface.',
          '**Cross-sections of common solids.** Cavalieri\'s Principle extends to every 3D shape. Knowing the cross-sectional area formula $A(h)$ as a function of height $h$ allows you to find any volume by "adding up" (integrating) the slices:',
        ],
      },
      {
        type: 'math',
        tex: 'V = \\int_0^H A(h)\\,dh',
        caption: 'The calculus generalization of Cavalieri — sum all cross-section areas over the height',
      },
      {
        type: 'prose',
        paragraphs: [
          'Even without calculus, Cavalieri\'s Principle allows comparison: if two solids always have equal cross-sectional areas, they have equal volume. A skewed cylinder (like a leaning stack of coins) has the same volume as an upright cylinder with the same base and height — because at every level, the circular cross-sections are the same.',
        ],
      },
      {
        type: 'viz',
        id: 'G4_4_CrossSections',
        title: "Cavalieri's Principle in 3D",
        mathBridge: 'Skew the solid horizontally. The cross-sectional area at every height does not change — only the position shifts. By Cavalieri\'s Principle, the volume is unchanged. This confirms the formula $V = A_{\\text{base}} \\times h$ applies even to leaning prisms and cylinders.',
      },
    ],
  },
  mentalModel: [
    "Cavalieri's Principle: equal cross-section areas at every height → equal volumes. The slicing idea behind integration.",
    'Sphere volume: Archimedes compared a hemisphere to a cylinder-minus-cone and showed equal cross-sections at every height → V = ⁴⁄₃πr³',
    'Sphere surface area = 4πr² — equal to the lateral surface of the circumscribed cylinder',
    'Skewed solids have the same volume as upright ones with the same base and height — cross-sections never change under shearing',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: "Cavalieri's Principle states that two solids have equal volume when…",
      options: [
        'They have the same surface area',
        'At every height, their cross-sectional areas are equal',
        'They are made of the same material',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A sphere has radius $3$ cm. Its volume is…',
      options: ['$36\\pi$ cm³', '$9\\pi$ cm³', '$12\\pi$ cm³'],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Archimedes proved sphere volume by comparing a hemisphere to…',
      options: [
        'Two stacked cones',
        'A cylinder with a cone removed, of the same radius and height',
        'A cube with the same side length as the radius',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The surface area of a sphere with radius $5$ cm is…',
      options: ['$20\\pi$ cm²', '$100\\pi$ cm²', '$50\\pi$ cm²'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Why does a leaning (skewed) cylinder have the same volume as an upright cylinder of the same base and height?',
      options: [
        'They are both cylinders, so the formula applies regardless of angle',
        "By Cavalieri's Principle — at every height, the circular cross-sections have the same area, so the total volumes must be equal",
        'The leaning changes the surface area but not the volume formula',
      ],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The surface area of a sphere equals the lateral surface of which cylinder?',
      options: [
        'A cylinder with the same radius and half the sphere height',
        'The smallest cylinder that fits around the sphere — radius $r$, height $2r$',
        'A cylinder with the same volume as the sphere',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'At height $h$ from the base of a hemisphere of radius $r$, the cross-section disk has area…',
      options: [
        '$\\pi h^2$',
        '$\\pi(r^2 - h^2)$',
        '$\\pi r^2$',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: "The hemisphere in Archimedes' proof has the same cross-sectional area as which shape?",
      options: [
        'A pyramid of the same height',
        'A cylinder of radius $r$ and height $r$ with a cone of the same dimensions removed',
        'A cone of radius $r$ and height $2r$',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A sphere has the same volume as how many of the circumscribed cylinders (radius $r$, height $2r$)?',
      options: [
        'Two-thirds ($\\frac{2}{3}$ of one cylinder)',
        'Half ($\\frac{1}{2}$ of one cylinder)',
        'One full cylinder',
      ],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: "Cavalieri's Principle is essentially the geometric version of which calculus operation?",
      options: [
        'Differentiation — finding the rate of change of volume',
        'Integration — summing infinitely thin cross-sectional slices over the height',
        'The chain rule — composing area and height functions',
      ],
      correct: 1,
    },
  ],
};
