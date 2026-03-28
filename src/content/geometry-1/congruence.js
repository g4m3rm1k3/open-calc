export default {
  id: 'geo-1-6',
  slug: 'congruence',
  chapter: 'geometry-1',
  title: 'Congruence: Identical Shapes',
  subtitle: 'Mastering Congruence foundations',
  tags: ['geometry', 'congruence'],
  hook: {
    question: 'How few measurements do you need to identify a triangle?',
    realWorldContext: 'For boat parts or carpentry, knowing which three measurements guarantee an identical match (congruence) is a vital efficiency.'
  },
  intuition: {
    prose: [
      'Albert explains that you don\'t need all six measurements (3 sides + 3 angles) to know two triangles are congruent. Identifying just three — like Side-Angle-Side (SAS) — can be enough if they are in the right combination.'
    ],
    visualizations: [
      {
        id: 'G1_5_Congruence',
        title: 'Congruence Criteria: SAS, SSS, and More',
        props: {}
      }
    ]
  }
};
