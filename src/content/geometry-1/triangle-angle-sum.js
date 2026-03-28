export default {
  id: 'geo-1-5',
  slug: 'triangle-angle-sum',
  chapter: 'geometry-1',
  title: 'The Triangle Angle Sum',
  subtitle: 'Mastering Triangle Angle Sum foundations',
  tags: ['geometry', 'triangle-angle-sum'],
  hook: {
    question: 'Why does every triangle sum to exactly 180 degrees?',
    realWorldContext: 'Measuring hundreds of triangles is evidence, but a proof gives us certainty that it MUST be so.'
  },
  intuition: {
    prose: [
      'By drawing a single parallel line above any triangle, we can use what we learned about parallel lines to prove that its interior angles always sum to 180 degrees — provided we stay on a flat plane.'
    ],
    visualizations: [
      {
        id: 'G1_4_TriangleAngleSum',
        title: 'Proving the 180 Degree Fact',
        props: {}
      }
    ]
  }
};
