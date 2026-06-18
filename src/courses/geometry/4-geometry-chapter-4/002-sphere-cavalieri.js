export default {
  id: 'geo-4-2',
  slug: 'sphere-cavalieri',
  chapter: 'geometry-4',
  title: 'The Sphere and Cavalieri',
  subtitle: 'Mastering Sphere foundations',
  tags: ['geometry', 'sphere', 'cavalieri'],
  hook: {
    question: 'How did Archimedes discover the sphere volume without calculus?',
    realWorldContext: 'The sphere is the most efficient shape in the universe, enclosing the maximum volume with the minimum surface area.'
  },
  intuition: {
    prose: [
      'Archimedes used the method of exhaustion to prove the volume of a sphere is 4/3 πr³. This was the first major step toward modern integration.'
    ],
    visualizations: [
      {
        id: 'G4_3_Sphere',
        title: 'Archimedes\' Sphere Theorem',
        props: {}
      },
      {
        id: 'G4_4_CrossSections',
        title: 'Cavalieri\'s Principle in 3D',
        props: {}
      }
    ]
  }
};
