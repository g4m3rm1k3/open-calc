export default {
  id: 'la-sandbox',
  slug: 'python-sandbox',
  chapter: 5,
  order: 1,
  title: 'Python Lab: Linear Algebra',
  subtitle: 'Experiment with vectors and matrices using Python in the browser',
  tags: ['sandbox', 'python', 'numpy', 'coding'],
  
  hook: {
    question: "How can we use code to solve massive systems of equations that would take a human centuries to compute?",
    realWorldContext: "In professional data science and engineering, we don't solve matrices by hand. We use libraries like NumPy and SciPy. This sandbox gives you the exact same tools used at NASA and Google, running right in your browser tab via WebAssembly.",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Welcome to the Lab:** Throughout this module, you have learned the geometry and theory of linear algebra. Now it is time to use the engine that powers modern technology.',
      'This sandbox uses **Pyodide**, a version of Python compiled to WebAssembly. It contains a full Python interpreter and supports powerful libraries like NumPy, SymPy, and Matplotlib.',
      'Code in one cell persists to the next. You can define a transformation matrix in Cell 1 and apply it to a batch of vectors in Cell 2. Try it out by running the default code below!'
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why Python for Linear Algebra?',
        body: 'Python has become the industry standard because of its clean syntax and standard libraries. What takes 20 lines of code in C++ takes 2 lines in Python with NumPy.',
      }
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Interactive Python Environment',
        mathBridge: 'Run Python code to perform matrix operations. The results are computed entirely on your device.',
        caption: 'A fully functional Python 3 environment.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              code: `# ── NumPy Matrix Basics ─────────────────────────\nimport numpy as np\n\n# Define variables and matrices\nA = np.array([[1, 2], [3, 4]])\nv = np.array([5, 6])\n\n# Matrix multiplication (A @ v)\nresult = A @ v\nprint(f"Matrix A:\\n{A}")\nprint(f"Vector v: {v}")\nprint(f"A @ v = {result}")`,
              output: '', status: 'idle', figureJson: null
            },
            {
              id: 2,
              code: `# ── Geometry of Transformations ──────────────────\nfrom opencalc import Figure, quick_transform\n\n# Define a shear transformation matrix\nshear_matrix = [[1, 1], [0, 1]]\n\n# Visualize the transformation of the grid\nquick_transform(shear_matrix, vector=[1, 1])`,
              output: '', status: 'idle', figureJson: null
            }
          ]
        }
      }
    ]
  },
  
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  semantics: { core: [] },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Python is a tool for automation.',
    'Code cells share state.',
    'Computation happens locally.'
  ],
  checkpoints: ['read-intuition'],
  quiz: []
};
