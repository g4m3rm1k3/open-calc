export default {
  id: 'geo-3-1',
  slug: 'coordinate-geometry',
  chapter: 'geometry-3',
  title: 'Coordinate Geometry',
  subtitle: 'Mastering Coordinate foundations',
  tags: ['geometry', 'coordinates'],
  hook: {
    question: 'How do you find the exact distance between two points on a map?',
    realWorldContext: 'Placing geometry on a grid connects shapes to algebra, allowing us to use the Pythagorean theorem for any distance.'
  },
  intuition: {
    prose: [
      'The distance formula is simply the Pythagorean theorem applied to a coordinate grid. By understanding slope, we can algebraically define when lines are parallel or perpendicular.'
    ],
    visualizations: [
      {
        id: 'G3_1_CoordinatePlane',
        title: 'The Distance Formula and Grid',
        props: {}
      },
      {
        id: 'G3_2_LinesInPlane',
        title: 'Slope and Line relations',
        props: {}
      }
    ]
  }
};
