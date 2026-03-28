export default {
  id: 'ch2-alg-005',
  slug: 'systems-of-equations',
  chapter: 'precalc-2',
  order: 5,
  title: 'Systems of Equations & the Geometry of Solutions',
  subtitle: 'Every method — substitution, elimination, matrices — is the same idea from a different angle',
  tags: ['systems', 'linear systems', 'substitution', 'elimination', 'matrix', 'Gaussian elimination', 'geometric interpretation'],
  aliases: 'system equations substitution elimination Gaussian elimination matrix row reduction linear algebra geometric solution',

  hook: {
    question: 'Two equations in two unknowns: geometrically, each is a line. The solution is where they cross. What if they are parallel? What if they are the same line?',
    realWorldContext: 'Systems of equations are everywhere in engineering: structural analysis (force balance at every joint), electrical networks (Kirchhoff\'s laws), economics (supply-demand equilibrium), and computer graphics (ray-surface intersection). Every finite element analysis solves a system of thousands of equations simultaneously using the matrix methods introduced here.',
  },

  intuition: {
    prose: [
      'A linear system is a set of constraints that must all be satisfied simultaneously. Each equation in two variables is a line — its solution set is a whole line of points. The system\'s solution is the set of points satisfying all equations at once. For two lines in a plane, there are exactly three cases: one intersection point (unique solution), parallel lines (no solution), or the same line (infinitely many solutions).',
      'Three methods — substitution, elimination, and matrix row reduction — all find this intersection. They differ in what they manipulate: substitution replaces one variable; elimination adds equations to cancel a variable; matrix methods automate elimination systematically. The Gaussian elimination algorithm is just elimination applied by an organised procedure.',
      'Matrices are a compact notation for systems. The augmented matrix $[A|\\mathbf{b}]$ stores the coefficients and constants. Row operations (swap rows, scale a row, add a multiple of one row to another) correspond exactly to valid moves in elimination — they do not change the solution set.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The three solution types — geometrically',
        body: '\\text{Unique: lines intersect at one point} \\quad \\det(A) \\neq 0 \\\\ \\text{None: parallel lines, same slope different intercept} \\quad \\text{(inconsistent)} \\\\ \\text{Infinite: same line} \\quad \\text{(dependent — one equation is a multiple of the other)}',
      },
      {
        type: 'insight',
        title: 'Why elimination works',
        body: '\\text{Adding a multiple of equation 1 to equation 2 does not change the solution set.} \\\\ \\text{If } (x_0, y_0) \\text{ satisfies both equations, it satisfies any linear combination of them.}',
      },
      {
        type: 'proof-map',
        title: 'Matrix row operations ↔ elimination moves',
        body: 'R_i \\leftrightarrow R_j \\quad \\text{swap rows (reorder equations)} \\\\ kR_i \\to R_i \\quad \\text{scale a row (multiply equation by constant)} \\\\ R_i + kR_j \\to R_i \\quad \\text{eliminate a variable}',
      },
    ],
    visualizations: [
      {
        id: 'SystemsGeometryViz',
        title: 'Systems as Intersecting Lines',
        mathBridge: 'Drag the slope and intercept of each line. Watch the solution point move. Push the lines parallel to see "no solution." Overlap them for infinite solutions.',
        caption: 'The algebra finds a number; the geometry explains what that number means.',
      },
                                                          ],
  },

  math: {
    prose: [
      'Substitution: solve one equation for one variable, substitute into the other. Best when one equation is already solved or easily solved for a variable.',
      'Elimination: multiply equations by constants so that one variable has equal (or opposite) coefficients, then add/subtract to eliminate it. Best for balanced-looking systems.',
      'Gaussian elimination to row echelon form: use row operations to create zeros below the leading entry in each column (the pivot). Back-substitute from the bottom row up. This always works and scales to any number of variables.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cramer\'s rule (2×2)',
        body: 'ax + by = e, \\; cx + dy = f \\\\ x = \\frac{ed-bf}{ad-bc}, \\quad y = \\frac{af-ec}{ad-bc} \\quad (ad-bc \\neq 0)',
      },
      {
        type: 'definition',
        title: 'Augmented matrix and row echelon form',
        body: '\\begin{pmatrix} 2 & 3 & | & 7 \\\\ 1 & -1 & | & 1 \\end{pmatrix} \\xrightarrow{R_1 - 2R_2} \\begin{pmatrix} 2 & 3 & | & 7 \\\\ 0 & 5 & | & 5 \\end{pmatrix} \\\\ \\text{Row echelon: zeros below each pivot. Back-substitute: } y=1, x=2.',
      },
    ],
  },

  rigor: {
    title: 'Why elimination preserves the solution set',
    proofSteps: [
      { expression: '\\text{Let } (x_0, y_0) \\text{ satisfy both } E_1: a_1x+b_1y=c_1 \\text{ and } E_2: a_2x+b_2y=c_2.', annotation: 'Assume $(x_0,y_0)$ is in the solution set.' },
      { expression: '\\text{Form } E_3 = E_1 + kE_2: \\; (a_1+ka_2)x + (b_1+kb_2)y = c_1+kc_2', annotation: 'Create a linear combination.' },
      { expression: 'E_3(x_0,y_0) = (a_1x_0+b_1y_0) + k(a_2x_0+b_2y_0) = c_1 + kc_2 \\checkmark', annotation: '$(x_0,y_0)$ satisfies $E_3$ automatically. Row operations never lose solutions.' },
      { expression: '\\text{Conversely, if } (x,y) \\text{ satisfies } E_3 \\text{ and } E_2, \\text{ then it satisfies } E_3 - kE_2 = E_1.', annotation: 'Solutions of the new system map back to solutions of the original. The solution sets are equal. $\\blacksquare$' },
    ],
  },

  examples: [
    {
      id: 'ch2-005-ex1',
      title: 'Elimination on a 2×2 system',
      problem: '\\text{Solve: } 3x - 2y = 8, \\quad 5x + y = 11',
      steps: [
        { expression: '3x - 2y = 8 \\quad \\text{and} \\quad 10x + 2y = 22', annotation: 'Multiply the second equation by 2 to make $y$ coefficients opposites.' },
        { expression: '13x = 30 \\Rightarrow x = \\tfrac{30}{13}', annotation: 'Add equations. $y$ eliminated.' },
        { expression: 'y = 11 - 5(\\tfrac{30}{13}) = \\tfrac{143-150}{13} = -\\tfrac{7}{13}', annotation: 'Back-substitute.' },
      ],
      conclusion: 'Solution: $(30/13, -7/13)$. This is the intersection point of the two lines.',
    },
    {
      id: 'ch2-005-ex2',
      title: 'Recognising a dependent system',
      problem: '\\text{Solve: } 2x - 4y = 6, \\quad -x + 2y = -3',
      steps: [
        { expression: '\\text{Multiply equation 2 by 2: } -2x + 4y = -6', annotation: 'Prepare for elimination.' },
        { expression: '\\text{Add: } 0 = 0', annotation: 'All variables cancel. The statement $0=0$ is always true — infinitely many solutions.' },
        { expression: 'y = \\frac{2x-6}{4} = \\frac{x-3}{2} \\quad \\text{(parameterise: let } x = t\\text{)}', annotation: 'The equations are multiples of each other. Express solutions in terms of a free parameter.' },
      ],
      conclusion: 'Infinitely many solutions: every point on the line $2x - 4y = 6$. Geometrically, the two equations represent the same line.',
    },
  ],

  challenges: [
    {
      id: 'ch2-005-ch1',
      difficulty: 'hard',
      problem: '\\text{Solve the 3×3 system: } x+y+z=6, \\; 2x-y+z=3, \\; x+2y-z=2',
      hint: 'Set up the augmented matrix and use row operations to reach row echelon form.',
      walkthrough: [
        { expression: '\\begin{pmatrix}1&1&1&|&6\\\\2&-1&1&|&3\\\\1&2&-1&|&2\\end{pmatrix} \\xrightarrow{R_2-2R_1,\\;R_3-R_1} \\begin{pmatrix}1&1&1&|&6\\\\0&-3&-1&|&-9\\\\0&1&-2&|&-4\\end{pmatrix}', annotation: 'Eliminate $x$ from rows 2 and 3.' },
        { expression: '\\xrightarrow{R_3+\\tfrac{1}{3}R_2} \\begin{pmatrix}1&1&1&|&6\\\\0&-3&-1&|&-9\\\\0&0&-\\tfrac{7}{3}&|&-7\\end{pmatrix}', annotation: 'Eliminate $y$ from row 3.' },
        { expression: 'z = 3, \\quad y = \\tfrac{-9+1(3)}{-3} = 2, \\quad x = 6-2-3=1', annotation: 'Back-substitute from bottom up.' },
      ],
      answer: 'x=1, \\; y=2, \\; z=3',
    },
  ],

  calcBridge: {
    teaser: 'In multivariable calculus, every optimisation problem with constraints becomes a system of equations (the critical point conditions). Linear algebra — the generalisation of what you learned here — underlies Jacobian matrices, coordinate transformations, and differential equations.',
    linkedLessons: ['derivatives-introduction'],
  },
}
