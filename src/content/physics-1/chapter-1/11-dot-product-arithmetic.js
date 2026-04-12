export default {
  id: 'p1-ch1-011',
  slug: 'dot-product-arithmetic',
  chapter: 'p1',
  order: 11,
  title: 'Dot Product — Component Arithmetic',
  subtitle: 'Multiply matching components and add: $A_xB_x + A_yB_y + A_zB_z$.',
  tags: ['dot product', 'component arithmetic', 'scalar product', '3D', 'magnitude squared'],
  aliases: 'dot product component calculation multiply add',

  hook: {
    question: 'You have two 3D force vectors in component form. How do you find their dot product without ever needing the angle?',
    realWorldContext:
      `Computer programs, physics engines, and machine learning algorithms deal entirely in components — never angles. The component dot product formula $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$ is the version that runs on every processor in the world.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (13 of 21) Dot Product: Component and Algebraic Form',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `The previous lesson gave the geometric definition: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. Powerful, but it requires knowing the angle $\\phi$. In practice, vectors are usually given as components — $(A_x, A_y, A_z)$ — and computing $|A|$, $|B|$, and $\\phi$ just to find the dot product is wasteful. The component formula skips all of that.`,

      `The recipe: **multiply the $x$-components together, the $y$-components together, the $z$-components together, and add**. Three multiplications and two additions. That's the entire calculation for any two 3D vectors.`,

      `Why does this work? Because when you expand $\\vec{A}\\cdot\\vec{B}$ using unit vectors, the cross-terms like $\\hat{\\imath}\\cdot\\hat{\\jmath}$ are all zero (they're perpendicular), and the self-terms like $\\hat{\\imath}\\cdot\\hat{\\imath}$ are all 1 (unit vectors). Only the matching pairs survive.`,

      `A special case you'll use constantly: $\\vec{A}\\cdot\\vec{A} = A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2$. Dot a vector with itself to get the magnitude squared. Take the square root to get the magnitude. This is the Pythagorean theorem in disguise.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Component dot product',
        body:
          `\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y \\quad\\text{(2D)}\\n\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z \\quad\\text{(3D)}`,
      },
      {
        type: 'insight',
        title: 'Self-dot = magnitude squared',
        body:
          `\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2\\n\\nTherefore: $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$. This is the Pythagorean theorem written in dot product notation.`,
      },
      {
        type: 'definition',
        title: 'Matrix notation (preview)',
        body:
          `The dot product $\\vec{A}\\cdot\\vec{B}$ can be written as $\\mathbf{A}^T\\mathbf{B}$ in matrix notation, where $\\mathbf{A}^T$ is the row vector (transpose of the column vector $\\mathbf{A}$). This connects directly to Linear Algebra.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Why component multiplication = projection',
        caption:
          `$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$ comes directly from projecting each component onto its matching axis. The geometric formula $|A||B|\\cos\\phi$ and the component formula always give the same number.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Component arithmetic = geometric projection',
        caption: `$A_xB_x + A_yB_y + A_zB_z$ is three multiplications and two additions. Each term is the contribution of one axis to the total "overlap" between the vectors.`,
      },
    ],
  },

  math: {
    prose: [
      'Work through the calculation systematically for any dimension:',
      '**Step 1**: List the components of each vector side by side.',
      '**Step 2**: Multiply matching components: $x$-components together, $y$ together, $z$ together.',
      '**Step 3**: Sum all the products.',
      'The result is the dot product — a single number. Done.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Worked method — component table',
        body:
          `| | $x$ | $y$ | $z$ |\\n|-|-----|-----|-----|\\n| $\\vec{A}$ | $A_x$ | $A_y$ | $A_z$ |\\n| $\\vec{B}$ | $B_x$ | $B_y$ | $B_z$ |\\n| Product | $A_xB_x$ | $A_yB_y$ | $A_zB_z$ |\\n\\n$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$`,
      },
      {
        type: 'theorem',
        title: 'Distributive law (proved via components)',
        body:
          `\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}\\n\\n\\text{Proof: } A_x(B_x+C_x)+A_y(B_y+C_y) = A_xB_x+A_yB_y + A_xC_x+A_yC_y`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Dot product in 2D and 3D',
      caption: `2D: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$. 3D: add $A_zB_z$. The projection diagram extends to 3D — the same geometric interpretation holds in any dimension.`,
    }],
  },

  rigor: {
    prose: [
      `The equivalence $|A||B|\\cos\\phi = A_xB_x + A_yB_y$ is not just algebraically true — it is the **definition** of what cosine means in higher dimensions. In $\\mathbb{R}^n$, we define the angle between two vectors by $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$. The component formula comes first; the geometric interpretation follows.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Distributive law proof via components',
        body: '\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B}+\\vec{A}\\cdot\\vec{C}',
      },
    ],
    proofSteps: [
      {
        title: 'Write component products',
        expression: '\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y',
        annotation: 'The component formula reduces dot products to scalar arithmetic.',
      },
      {
        title: 'Expand the distributive claim',
        expression: '\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = A_x(B_x+C_x) + A_y(B_y+C_y)',
        annotation: 'Apply the component formula to the sum vector $\\vec{B}+\\vec{C}=(B_x+C_x, B_y+C_y)$.',
      },
      {
        title: 'Distribute scalar multiplication',
        expression: '= A_xB_x+A_xC_x + A_yB_y+A_yC_y',
        annotation: 'Standard distributive law for scalars.',
      },
      {
        title: 'Regroup',
        expression: '= (A_xB_x+A_yB_y) + (A_xC_x+A_yC_y) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}',
        annotation: 'Regroup as two dot products. Distributive law proven.',
      },
    ],
    title: 'Formal Derivation of Component Addition',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Self-dot = magnitude squared',
      caption: `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$. This connects the algebraic and geometric definitions: the Pythagorean theorem emerges from the dot product.`,
    }],
  },

  python: {
    title: 'Component Dot Product Lab',
    description: 'Practice the component formula in Python, including 3D vectors and magnitude-squared.',
    placement: 'after_rigor',
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Dot Product Arithmetic Lab',
      mathBridge: 'np.dot() handles 2D and 3D automatically.',
      caption: 'Run each cell top-to-bottom.',
      props: {
        initialCells: [
          {
            id: 1,
            cellTitle: '1 · Component dot product in 2D and 3D',
            prose: 'The formula is the same regardless of dimension — just add more component pairs.',
            code: [
              'import numpy as np',
              '',
              '# 2D dot product',
              'A2 = np.array([3.0, 4.0])',
              'B2 = np.array([2.0, -1.0])',
              'dot_2d = np.dot(A2, B2)',
              'print(f"2D: ({A2}) · ({B2}) = {dot_2d}")',
              '',
              '# 3D dot product',
              'A3 = np.array([1.0, 2.0, -2.0])',
              'B3 = np.array([3.0, -4.0, 0.0])',
              'dot_3d = np.dot(A3, B3)',
              'print(f"3D: ({A3}) · ({B3}) = {dot_3d}")',
              '',
              '# Self-dot = magnitude squared',
              'A3_dot_A3 = np.dot(A3, A3)',
              'print(f"\\nA3 · A3 = {A3_dot_A3}  (= |A3|²)")',
              'print(f"|A3| = {np.linalg.norm(A3):.4f}")',
              'print(f"√(A3·A3) = {np.sqrt(A3_dot_A3):.4f}  ✓")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
          },
          {
            id: 2,
            cellTitle: '2 · Challenge: 3D dot product with physics',
            challengeType: 'fill-in',
            challengeNumber: 1,
            challengeTitle: '3D work calculation',
            difficulty: 'easy',
            prompt:
              `A 3D force acts on a particle: $\\vec{F} = (5, -2, 8)$ N.\nThe displacement is $\\vec{d} = (3, 6, -1)$ m.\nCompute \`W = np.dot(F3, d3)\`. Expected: 5(3) + (-2)(6) + 8(-1) = 15 − 12 − 8 = **−5 J**.`,
            starterBlock: [
              'F3 = np.array([___, ___, ___])   # (5, -2, 8) N',
              'd3 = np.array([___, ___, ___])   # (3, 6, -1) m',
              'W = np.dot(___, ___)',
            ].join('\n'),
            code: [
              'F3 = np.array([5.0, -2.0, 8.0])',
              'd3 = np.array([3.0, 6.0, -1.0])',
              'W = np.dot(F3, d3)',
              'print(f"Work = {W} J")',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "W" in dir(), "Compute W"',
              'assert np.isclose(W, -5.0, atol=0.01), f"W should be -5 J, got {W}"',
              '"SUCCESS: W = 5(3) + (-2)(6) + 8(-1) = 15 - 12 - 8 = -5 J. Force partially opposes motion."',
            ].join('\n'),
            hint: 'np.dot([5,-2,8], [3,6,-1]) = 5*3 + (-2)*6 + 8*(-1) = 15 - 12 - 8 = -5.',
          },
          {
            id: 3,
            cellTitle: '3 · Challenge: dot product table',
            challengeType: 'write',
            challengeNumber: 2,
            challengeTitle: 'All dot products of a set',
            difficulty: 'medium',
            prompt:
              `Given three vectors: $\\vec{u}=(1,2,3)$, $\\vec{v}=(4,-1,2)$, $\\vec{w}=(-1,0,1)$.\nCompute all six combinations (including self-dots):\n\`uu\`, \`vv\`, \`ww\`, \`uv\`, \`uw\`, \`vw\`.\n\nWhich pairs are orthogonal (dot = 0)?`,
            code: [
              '# Define the vectors',
              '# u = np.array([1, 2, 3])',
              '# ...',
              '',
              '# Compute uu = np.dot(u, u), vv = ..., ww = ...',
              '# uv = np.dot(u, v), uw = ..., vw = ...',
            ].join('\n'),
            output: '', status: 'idle', figureJson: null,
            testCode: [
              'import numpy as np',
              'assert "uu" in dir() and "vv" in dir() and "ww" in dir(), "Compute self-dots uu, vv, ww"',
              'assert "uv" in dir() and "uw" in dir() and "vw" in dir(), "Compute cross-dots uv, uw, vw"',
              'u_e = np.array([1,2,3]); v_e = np.array([4,-1,2]); w_e = np.array([-1,0,1])',
              'assert np.isclose(uu, np.dot(u_e,u_e)), f"uu wrong: {uu}"',
              'assert np.isclose(uv, np.dot(u_e,v_e)), f"uv wrong: {uv}"',
              'assert np.isclose(uw, np.dot(u_e,w_e)), f"uw wrong: {uw}"',
              '"SUCCESS! u·v = 8, u·w = 4, v·w = 6 — none are orthogonal here."',
            ].join('\n'),
            hint:
              `u = np.array([1,2,3]). uu = np.dot(u,u). Then vv, ww similarly.\nuv = np.dot(u,v). Orthogonal means dot = 0.`,
          },
        ],
      },
    }],
  },

  examples: [
    {
      id: 'ch1-011-ex1',
      title: '2D component dot product',
      problem: '\\vec{A}=(3,\\,4),\\;\\vec{B}=(2,\\,-1).\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        { expression: '\\vec{A}\\cdot\\vec{B} = (3)(2)+(4)(-1)', annotation: 'Multiply $x$-components, then $y$-components.' },
        { expression: '= 6-4 = 2', annotation: 'Sum the products.' },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = 2$. Positive — the vectors are at an acute angle.',
    },
    {
      id: 'ch1-011-ex2',
      title: '3D component dot product',
      problem: '\\vec{A}=(1,\\,-2,\\,3),\\;\\vec{B}=(4,\\,1,\\,-1).\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        { expression: '(1)(4)=4,\\quad(-2)(1)=-2,\\quad(3)(-1)=-3', annotation: 'Three component products.' },
        { expression: '\\vec{A}\\cdot\\vec{B} = 4+(-2)+(-3) = -1', annotation: 'Sum: the dot product is negative — obtuse angle.' },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = -1$. Slightly negative — vectors are slightly more anti-aligned than aligned.',
    },
  ],

  challenges: [
    {
      id: 'ch1-011-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }\\vec{A}\\cdot\\vec{B}\\text{ for }\\vec{A}=(5,0,2)\\text{ and }\\vec{B}=(1,3,-4).',
      hint: 'Three component pairs: $5\\times1$, $0\\times3$, $2\\times(-4)$. Sum them.',
      walkthrough: [
        { expression: '5(1)+0(3)+2(-4) = 5+0-8 = -3', annotation: 'Component formula in 3D.' },
      ],
      answer: '\\vec{A}\\cdot\\vec{B} = -3',
    },
    {
      id: 'ch1-011-ch2',
      difficulty: 'medium',
      problem: '\\text{Show that }\\vec{A}=(3,4,0)\\text{ and }\\vec{B}=(-4,3,7)\\text{ are perpendicular.}',
      hint: 'Perpendicular iff dot product = 0.',
      walkthrough: [
        { expression: '\\vec{A}\\cdot\\vec{B}=(3)(-4)+(4)(3)+(0)(7)=-12+12+0=0', annotation: 'Zero dot product confirms perpendicularity.' },
      ],
      answer: '\\vec{A}\\cdot\\vec{B}=0 \\Rightarrow \\text{perpendicular}',
    },
    {
      id: 'ch1-011-ch3',
      difficulty: 'hard',
      problem: '\\text{If }|\\vec{A}|=5,\\;|\\vec{B}|=3,\\text{ and }\\vec{A}\\cdot\\vec{B}=9,\\text{ find the angle between them.}',
      hint: 'Use $\\cos\\phi = \\vec{A}\\cdot\\vec{B}/(|A||B|)$.',
      walkthrough: [
        { expression: '\\cos\\phi = 9/(5\\times3) = 9/15 = 3/5', annotation: 'Divide dot product by product of magnitudes.' },
        { expression: '\\phi = \\arccos(3/5) = \\arccos(0.6) \\approx 53.1°', annotation: 'Positive cosine → acute angle, as expected (dot product was positive).' },
      ],
      answer: `\\phi \\approx 53.1°`,
    },
  ],

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-011-q1',
      question: `$\\vec{A} = (1, 2, 3)$, $\\vec{B} = (4, 5, 6)$. What is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$15$`, `$32$`, `$90$`, `$27$`],
      answer: 1,
      explanation: `$(1)(4)+(2)(5)+(3)(6) = 4+10+18 = 32$.`,
    },
    {
      id: 'p1-ch1-011-q2',
      question: `$\\vec{A} = (3, 4)$. What is $\\vec{A}\\cdot\\vec{A}$?`,
      options: [`$7$`, `$12$`, `$25$`, `$5$`],
      answer: 2,
      explanation: `$\\vec{A}\\cdot\\vec{A} = 3^2+4^2 = 9+16 = 25 = |\\vec{A}|^2$.`,
    },
    {
      id: 'p1-ch1-011-q3',
      question: `$(3\\vec{A})\\cdot\\vec{B}$ equals:`,
      options: [`$3(\\vec{A}\\cdot\\vec{B})$`, `$\\vec{A}\\cdot(3\\vec{B})$`, `Both A and B`, `Neither`],
      answer: 2,
      explanation: `Scalar multiplication is associative with the dot product: $(c\\vec{A})\\cdot\\vec{B} = c(\\vec{A}\\cdot\\vec{B}) = \\vec{A}\\cdot(c\\vec{B})$. Both A and B are correct.`,
    },
    {
      id: 'p1-ch1-011-q4',
      question: `The dot product formula $\\vec{A}\\cdot\\vec{B} = A_xB_x+A_yB_y+A_zB_z$ works because:`,
      options: [
        `Vectors are always perpendicular`,
        `Basis vectors $\\hat{i}, \\hat{j}, \\hat{k}$ are orthonormal: cross-terms vanish`,
        `Components are always positive`,
        `Addition is commutative`,
      ],
      answer: 1,
      explanation: `The FOIL expansion produces 9 terms (in 3D). The 6 cross-terms ($\\hat{i}\\cdot\\hat{j}$ etc.) are zero because the basis is orthogonal. The 3 self-terms ($\\hat{i}\\cdot\\hat{i}=1$) give the matching component products.`,
    },
    {
      id: 'p1-ch1-011-q5',
      question: `$\\hat{i}\\cdot\\hat{j} = ?$`,
      options: [`$1$`, `$0$`, `$-1$`, `$\\hat{k}$`],
      answer: 1,
      explanation: `$\\hat{i}$ and $\\hat{j}$ are perpendicular unit vectors. Their dot product is $|\\hat{i}||\\hat{j}|\\cos90° = 1\\cdot1\\cdot0 = 0$.`,
    },
    {
      id: 'p1-ch1-011-q6',
      question: `$\\vec{A}\\cdot(\\vec{B}+\\vec{C})$ equals:`,
      options: [
        `$(\\vec{A}\\cdot\\vec{B})(\\vec{A}\\cdot\\vec{C})$`,
        `$\\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$`,
        `$\\vec{A}\\cdot\\vec{B} - \\vec{A}\\cdot\\vec{C}$`,
        `Undefined`,
      ],
      answer: 1,
      explanation: `The dot product distributes over addition: $\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$.`,
    },
    {
      id: 'p1-ch1-011-q7',
      question: `If $\\vec{A} = (1,0,0)$ and $\\vec{B} = (0,0,1)$, what is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$1$`, `$0$`, `$-1$`, `$\\sqrt{2}$`],
      answer: 1,
      explanation: `$(1)(0)+(0)(0)+(0)(1) = 0$. $\\hat{i}$ and $\\hat{k}$ are perpendicular — their dot product is zero.`,
    },
    {
      id: 'p1-ch1-011-q8',
      question: `A 3D vector has components $(2, -3, 6)$. What is its magnitude from the self-dot formula?`,
      options: [`$5$`, `$7$`, `$11$`, `$49$`],
      answer: 1,
      explanation: `$|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}} = \\sqrt{4+9+36} = \\sqrt{49} = 7$.`,
    },
  ],
}
