export default {
  id: 'geo-2-4',
  slug: 'areas-arcs',
  chapter: 'geometry-2',
  title: 'Area Formulas and Circle Arcs',
  subtitle: 'Mastering Area and Arc foundations',
  tags: ['geometry', 'area', 'circles'],
  hook: {
    question: 'Why does area = half base times height for a triangle?',
    realWorldContext: 'Almost every area formula used in architecture and design stems from the basic rectangle.'
  },
  intuition: {
    prose: [
      'Every area formula for polygons is built from a rectangle using the "half a parallelogram" or "shearing" argument. To understand arc length, π, and sector area, we must use radians.'
    ],
    visualizations: [
      {
        id: 'G2_5_AreaFormulas',
        title: 'Polygonal Area Formula Derivations',
        props: {}
      },
      {
        id: 'G2_6_ArcSectorPi',
        title: 'Arc Lengths and Radian Efficiency',
        props: {}
      }
    ]
  }
};
