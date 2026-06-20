export default {
  id: 'geo-5-1',
  slug: 'similarity',
  chapter: 'geometry-5',
  title: 'Similarity and the AA Postulate',
  subtitle: 'Same shape, different size — and why two angles are enough to guarantee it',
  tags: ['geometry', 'similarity', 'AA-postulate', 'similar-triangles', 'scale-factor', 'proportional'],
  hook: {
    question: 'How do you know two triangles are the same shape without measuring all six parts?',
    realWorldContext: 'Architects scale blueprints. Photographers scale images. Surveyors measure inaccessible heights by shadow length. All of these use the fact that two triangles with equal angles are similar — and similar triangles have proportional sides. You can find the height of a tree or the width of a river without ever touching it.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Similar figures have the same shape but not necessarily the same size.** When you zoom in or out on a photo, you create a similar image: every angle is preserved, every length changes by the same scale factor. Two figures are **similar** (written $\\triangle ABC \\sim \\triangle DEF$) if:',
          '(1) All corresponding angles are equal, AND',
          '(2) All corresponding sides are proportional (same ratio between each pair).',
          'Both conditions always hold together — you do not need to check them separately if you know either one is true, as the AA Postulate will show.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**The scale factor.** If $\\triangle ABC \\sim \\triangle DEF$ with scale factor $k$, then every side of $\\triangle DEF$ is $k$ times the corresponding side of $\\triangle ABC$: $DE = k \\cdot AB$, $EF = k \\cdot BC$, $DF = k \\cdot AC$. Areas scale by $k^2$ (not $k$) because area is two-dimensional.',
        ],
      },
      {
        type: 'math',
        tex: '\\frac{DE}{AB} = \\frac{EF}{BC} = \\frac{DF}{AC} = k \\qquad \\text{and} \\qquad \\frac{\\text{Area}(DEF)}{\\text{Area}(ABC)} = k^2',
        caption: 'Scale factor k applies to sides; k² applies to areas',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The AA (Angle-Angle) Postulate.** If two angles of one triangle are equal to two angles of another triangle, then the triangles are similar.',
          'Why is two angles enough? Because the three angles of any triangle sum to 180°. If two angles match, the third must also match (180° minus the same two numbers always gives the same result). So two equal angles force all three to be equal — and equal angles force the sides to be proportional.',
          'The AA Postulate is the most useful similarity test because angles are often the easiest things to identify from a diagram (especially when parallel lines create equal alternate interior angles).',
        ],
      },
      {
        type: 'viz',
        id: 'G2_4_SimilarTriangles',
        title: 'Similar Triangles Explorer',
        mathBridge: 'Drag the vertices of both triangles. When two angle pairs match (watch the angle readouts), the side ratios become equal automatically. Try making a large and small triangle with the same angles — the scale factor $k$ appears in the side-ratio display. This confirms: AA → similar → proportional sides.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Other similarity tests.** While AA is most common, there are two more:',
          '**SAS Similarity:** If two sides of one triangle are proportional to two sides of another, and the included angles are equal, the triangles are similar.',
          '**SSS Similarity:** If all three pairs of corresponding sides are proportional, the triangles are similar.',
          'Note: ASS (two sides and a non-included angle) does NOT guarantee similarity — this is the "ambiguous case," where two different triangles can satisfy the conditions.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Applications of similar triangles.** The most powerful use is indirect measurement — finding lengths that are difficult or impossible to measure directly.',
          '**Shadow method:** A person $1.8$ m tall casts a $2.4$ m shadow. A nearby tree casts a $14.4$ m shadow. The person and their shadow form a triangle similar to the tree and its shadow (both have a right angle at ground level, and the sun makes the same angle for both). So:',
        ],
      },
      {
        type: 'math',
        tex: '\\frac{\\text{tree height}}{\\text{tree shadow}} = \\frac{\\text{person height}}{\\text{person shadow}} \\quad \\Rightarrow \\quad h = \\frac{1.8 \\times 14.4}{2.4} = 10.8\\text{ m}',
        caption: 'Indirect measurement via similar triangles — the method surveyors and architects use',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Triangle Proportionality Theorem.** If a line is drawn parallel to one side of a triangle and intersects the other two sides, it divides those sides proportionally. This theorem is the reason that the midsegment of a triangle (connecting the midpoints of two sides) is parallel to the third side and exactly half its length.',
        ],
      },
    ],
  },
  mentalModel: [
    'Similar triangles: same shape, different size — equal angles AND proportional sides (the two always go together)',
    'AA Postulate: two equal angle pairs → similar. Since angles sum to 180°, two equal angles force the third to match',
    'Scale factor k: sides scale by k, areas scale by k². Always specify which triangle is which when writing a ratio',
    'Indirect measurement: similar triangle ratios let you find inaccessible lengths from measurable shadows or distances',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Two triangles are similar. One has sides 3, 4, 5. The other has a shortest side of 6. What is its longest side?',
      options: ['8', '10', '12'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The AA Postulate says two triangles are similar when…',
      options: [
        'All three angles and all three sides correspond',
        'Two pairs of corresponding angles are equal',
        'Two pairs of corresponding sides are proportional',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is knowing two pairs of equal angles sufficient to conclude similarity?',
      options: [
        'Two angles determine the shape uniquely because the third is forced by the 180° rule',
        'Two angles are easier to measure than sides, so they are used for convenience',
        'Two angles guarantee equal sides, which guarantees similarity',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'If two similar triangles have a scale factor of 3, their areas differ by a factor of…',
      options: ['3', '6', '9'],
      correct: 2,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A 2 m stick casts a 3 m shadow. A flagpole casts an 18 m shadow. How tall is the flagpole?',
      options: ['9 m', '12 m', '27 m'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: '$\\triangle ABC \\sim \\triangle DEF$. If $AB = 4$, $DE = 10$, and $BC = 6$, what is $EF$?',
      options: ['15', '12', '8'],
      correct: 0,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'The SAS Similarity theorem requires which of the following?',
      options: [
        'Two equal angles and one equal side',
        'Two proportional sides AND the included angle (between those sides) is equal',
        'Two proportional sides regardless of angle',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The midsegment of a triangle connects the midpoints of two sides. It is always parallel to the third side and…',
      options: [
        'Equal in length to the third side',
        'Half the length of the third side',
        'One-third the length of the third side',
      ],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Which similarity test does NOT work? (The "ambiguous case")',
      options: ['AA', 'SSS Similarity', 'SSA (two sides and a non-included angle)'],
      correct: 2,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Two triangles have all three pairs of corresponding angles equal. Are they necessarily congruent?',
      options: [
        'Yes — equal angles force equal sides',
        'No — they are similar but may be different sizes (the scale factor may not be 1)',
        'Only if one angle is a right angle',
      ],
      correct: 1,
    },
  ],
};
