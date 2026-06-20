export default {
  id: 'geo-1-2',
  slug: 'points-lines-planes',
  chapter: 'geometry-1',
  title: 'Points, Lines, and Planes',
  subtitle: 'Mastering Points, Lines, and Planes foundations',
  tags: ['geometry', 'points-lines-planes'],
  hook: {
    question: 'How do you prove something that "looks" obvious?',
    realWorldContext: 'Visualizing Points, Lines, and Planes is key to engineering and art.'
  },
  intuition: {
    prose: ['Content coming soon...'],
    visualizations: []
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A "point" in geometry has zero dimensions. What does that mean practically?',
      options: [
        'It is too small to see with the naked eye',
        'It represents only a location — no size, length, or width',
        'It must be drawn with a dot that has a finite radius',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'How many distinct points are needed to define exactly one line?',
      options: ['1', '2', '3'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Three points are collinear. What is guaranteed?',
      options: [
        'They form a triangle',
        'They all lie on the same single line',
        'They lie in the same plane but not necessarily on one line',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How many non-collinear points are required to determine a unique plane?',
      options: ['2', '3', '4'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Two distinct planes that are not parallel intersect in what shape?',
      options: ['A single point', 'A line', 'Another plane'],
      correct: 1,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'A postulate differs from a theorem in that a postulate…',
      options: [
        'Has been proven from simpler statements',
        'Is accepted as true without proof',
        'Only applies in Euclidean geometry',
      ],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A ray starts at an endpoint and extends forever in one direction. How does it differ from a full line?',
      options: [
        'A ray has finite length',
        'A ray has one endpoint; a line has none',
        'A ray cannot be bisected',
      ],
      correct: 1,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'If a line intersects a plane and is NOT contained in or parallel to the plane, the intersection is…',
      options: ['A segment', 'A single point', 'A second line'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'Two lines in the same plane are either parallel or they…',
      options: [
        'Are skew',
        'Intersect at exactly one point',
        'Must be perpendicular',
      ],
      correct: 1,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Skew lines are lines that…',
      options: [
        'Are parallel and in different planes',
        'Are not parallel and do not intersect — they lie in different planes',
        'Intersect but are not perpendicular',
      ],
      correct: 1,
    },
  ],
};