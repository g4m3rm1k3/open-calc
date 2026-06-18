export default {
  id: 'geo-4-1',
  slug: 'prisms-cones',
  chapter: 'geometry-4',
  title: 'Prisms, Cylinders, and Cones',
  subtitle: 'Mastering 3D Volume foundations',
  tags: ['geometry', '3d', 'volume'],
  hook: {
    question: 'Why is a cone exactly one-third the volume of a cylinder?',
    realWorldContext: 'From fuel tanks to conical bows, 3D volume determines how much material we need and how much a container can hold.'
  },
  intuition: {
    prose: [
      'Volume is simply the base area stacked over a height. Cavalieri\'s principle shows that leaning shapes have the same volume as straight ones, provided their cross-sections match.'
    ],
    visualizations: [
      {
        id: 'G4_1_PrismsCylinders',
        title: 'Prism and Cylinder Volumes',
        props: {}
      },
      {
        id: 'G4_2_PyramidsCones',
        title: 'The One-Third Factor in Pyramids',
        props: {}
      }
    ]
  }
};
