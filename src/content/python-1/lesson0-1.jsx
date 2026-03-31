export default {
  id: 'py-0-1',
  slug: 'notebook-basics',
  chapter: 0.1,
  order: 1,
  title: 'Environment: The Notebook Model',
  subtitle: 'Understanding cells, state, and top-to-bottom execution',
  tags: ['basics', 'python', 'notebooks'],
  
  hook: {
    question: "What is a notebook, and why is it the standard tool for data scientists and mathematicians?",
    realWorldContext: "Before we write logic, we must understand our lab environment. Notebooks allow us to interleave deep thought (Markdown) with live execution (Code).",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      "A notebook is not just a text file; it is a **live computational document**. It consists of 'cells' that can be run independently.",
      "The most important rule: **State is Persistent**. If you create a variable in one cell, it stays alive for the next cell.",
      "In this lesson, we will explore how code flows through cells and how to reset our environment when things go wrong."
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Top-to-Bottom Flow',
        body: 'Even though you can run cells out of order, you should always design your notebooks to run from top to bottom. This ensures your results are reproducible.',
      }
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Notebook Fundamentals',
        mathBridge: 'Experience how variables persist across different execution blocks.',
        caption: 'Run these cells in order to see how the computer remembers your data.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              code: "# Cell 1: Define a 'seed' variable\nx = 10\nprint(f'Memory initialized: x is {x}')",
              output: '', status: 'idle', figureJson: null,
              testCode: "if 'x' in globals() and x == 10: 'SUCCESS: Cell 1 complete. x is stored in memory.'\nelse: 'Make sure you define x = 10'"
            },
            {
              id: 2,
              code: "# Cell 2: Use the variable from Cell 1\ny = x * 5\nprint(f'Calculation based on previous state: y is {y}')",
              output: '', status: 'idle', figureJson: null,
              testCode: "if 'y' in globals() and y == 50: 'SUCCESS: You used state from Cell 1!'\nelse: 'Run Cell 1 first, then run this cell.'"
            }
          ]
        }
      }
    ]
  },
  
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [
    {
      title: 'Breaking the Flow',
      description: 'Change x to 20 in Cell 1, but do NOT run Cell 1. Run Cell 2 again. Does y change? Why not?',
      hint: 'Variables only update in the computer\'s memory when you EXECUTE the cell.'
    }
  ],
  semantics: { core: [] },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Notebooks have memory (state).',
    'State is updated only upon execution.',
    'Cells share a single "kernel" (Python session).'
  ],
  checkpoints: ['read-intuition'],
  quiz: []
};
