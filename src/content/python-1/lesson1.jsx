export default {
  id: 'py-0',
  slug: 'python-syntax',
  chapter: 0.2,
  order: 1,
  title: 'Python Essentials: Variables & Logic',
  subtitle: 'Master the building blocks of data science and automation',
  tags: ['basics', 'python', 'coding', 'variables'],
  
  hook: {
    question: "How do computers store and manipulate information? Before we solve matrices, we must learn to speak the language of logic.",
    realWorldContext: "Python is the world's most popular language for science. Every great model at OpenAI or data pipeline at Google starts with the same simple variables and loops you are about to learn here.",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      "**Your First Code:** In Python, we create 'variables' to store data. Think of a variable as a labeled box.",
      "Unlike some older languages, Python is dynamic -- you do not need to tell it that a variable is a number; it figures it out automatically.",
      "In the first cell below, we define a variable x. In the second, we perform a calculation. In the third, we will start using the opencalc library to turn those numbers into visuals."
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Variables are Names, not Equations',
        body: 'In math, `x = x + 1` is impossible. In Python, it means "Take the value in x, add 1 to it, and put the result back into x."',
      }
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Python Building Blocks',
        mathBridge: 'Observe how data flows from variables into calculations and finally into visualizations.',
        caption: 'A guided introduction to Python syntax.',
        initialProps: {
          initialCells: [
              {
                id: 1,
                code: `# ── Step 1: Variables ───────────────────────────\nname = "Student"\nage = 20\n\nprint(f"Hello {name}, you are {age} years old.")`,
                output: '', status: 'idle', figureJson: null,
                testCode: `if 'name' in globals() and 'age' in globals(): "SUCCESS: Variables created!"\nelse: "Make sure you define 'name' and 'age'"`
              },
              {
                id: 2,
                code: `# ── Step 2: Basic Math ──────────────────────────\nradius = 5\narea = 3.14159 * (radius ** 2)\n\nprint(f"A circle with radius {radius} has area {area:.2f}")`,
                output: '', status: 'idle', figureJson: null,
                testCode: `if 'area' in globals() and abs(area - 3.14159 * (radius**2)) < 0.001:\n    if radius == 8: "SUCCESS: You updated the radius to 8!"\n    else: "Math is correct! Now try changing radius to 8."\nelse: "Check your area calculation."`
              },
              {
                id: 3,
                code: `# ── Step 3: Visualization ───────────────────────\nfrom opencalc import Figure\n\nfig = Figure(xmin=0, xmax=10, ymin=0, ymax=100)\nfig.grid().axes()\nfig.point([radius, area], color='teal', label="Area Point")\nfig.show()`,
                output: '', status: 'idle', figureJson: null,
                testCode: `SUCCESS: Visualization rendered using your live variables!`
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
      title: 'The Dynamic Circle',
      description: 'Change the radius to 8 in Cell 2. Run Cell 2, then Run Cell 3. Watch the visualization update!',
      hint: 'The variables persist between cells, so Cell 3 "knows" what happened in Cell 2.'
    }
  ],
  semantics: { core: [] },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Variables store state.',
    'Cells share state in order.',
    'Python is case-sensitive.'
  ],
  checkpoints: ['read-intuition'],
  quiz: []
};
