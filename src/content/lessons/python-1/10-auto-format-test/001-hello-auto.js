export default {
  id: 'py1-auto-001-hello',
  slug: 'auto-hello',
  title: 'Hello from the New Format',
  subtitle: 'Auto-discovered lesson — no index.js needed',
  tags: ['python', 'intro', 'python-1'],
  chapter: 10,
  order: 1,

  hook: {
    question: 'What if adding a lesson was as simple as dropping a file in a folder?',
    realWorldContext:
      'This lesson was loaded automatically — no edits to index.js required. ' +
      'Drop a file in src/content/lessons/<course>/<chapter>/<order>-<slug>.js ' +
      'and it shows up here.',
  },

  intuition: {
    prose: [
      'The new lesson format uses folder structure as the source of truth. ' +
      'The folder name encodes the chapter number and title. ' +
      'The filename encodes the order and slug. ' +
      'The lesson file exports the same object structure as always.',

      'Convention:\n\n' +
      '`lessons/python-1/10-auto-format-test/001-hello-auto.js`\n\n' +
      '- Course: `python-1` (must match a key in courses.js)\n' +
      '- Chapter: `10` with title "Auto Format Test"\n' +
      '- Lesson order: `001`, slug: `hello-auto`',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'No index.js required',
        body: 'The auto-loader in `src/content/autoLoader.js` uses `import.meta.glob` to discover every lesson in the `lessons/` folder at build time. Adding a lesson never touches any registry file.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Python Lab',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Hello from the auto-loader',
              prose: [
                'This notebook cell is part of the auto-discovered lesson. ' +
                'Run the cell to confirm the lesson loaded and Python is working.',
              ],
              code: `course = "python-1"\nchapter = 10\nlesson = "auto-hello"\nprint(f"Loaded: {course} / ch{chapter} / {lesson}")`,
            },
          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Where does the chapter number come from in the new lesson format?',
      options: [
        'Declared in a _chapter.js file',
        'The numeric prefix of the chapter folder name',
        'The chapter field inside the lesson export',
      ],
      answer: 'The numeric prefix of the chapter folder name',
      hints: ['Look at the folder name: 10-auto-format-test'],
      reviewSection: 'intuition',
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What file do you need to edit to register a new lesson in the new format?',
      options: [
        'src/content/index.js',
        'src/content/autoLoader.js',
        'No file — just drop the lesson in the correct folder',
      ],
      answer: 'No file — just drop the lesson in the correct folder',
      hints: ['The glob discovers files automatically'],
      reviewSection: 'intuition',
    },
  ],

  checkpoints: ['read-intuition'],
}
