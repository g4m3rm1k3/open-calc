export default {
  id: 'ch2-alg-006',
  slug: 'complex-numbers',
  chapter: 'precalc-2',
  order: 6,
  title: 'Complex Numbers & the Complex Plane',
  subtitle: 'Inventing $i$ was not arbitrary — it was the only way to make algebra complete',
  tags: ['complex numbers', 'imaginary unit', 'complex plane', 'modulus', 'argument', 'Euler formula', 'conjugate'],
  aliases: 'complex number imaginary real part imaginary part modulus argument polar form Euler formula e^i rotation conjugate',

  hook: {
    question: 'What does it mean to rotate a number? Multiplying by $i$ does exactly that — rotates 90° in the complex plane. This is not a coincidence. It is the key to Euler\'s formula $e^{i\\pi} + 1 = 0$.',
    realWorldContext: 'Complex numbers are not a mathematical curiosity — they are the language of electrical engineering (impedance $Z = R + jX$), signal processing (Fourier transforms), and quantum mechanics (wavefunctions are complex-valued). Every AC circuit analysis uses complex exponentials. Every digital filter is designed in the complex plane.',
  },

  intuition: {
    prose: [
      'The real numbers have a gap: $x^2 = -1$ has no solution. Rather than accepting this as impossible, mathematicians defined $i$ as the number satisfying $i^2 = -1$. This is not magic — it is the same move made when extending naturals to integers (to solve $x + 5 = 3$) and integers to rationals (to solve $2x = 3$). Each extension filled a gap.',
      'A complex number $a + bi$ is a point $(a, b)$ in the complex plane. The real axis is the $x$-axis; the imaginary axis is the $y$-axis. Addition of complex numbers is vector addition — add the real parts, add the imaginary parts. Multiplication is more interesting: it rotates and scales simultaneously.',
      'Multiplying by $i$ rotates 90° counterclockwise: $1 \\to i \\to -1 \\to -i \\to 1$. Four multiplications by $i$ bring you full circle. This is where the mysterious pattern $i^1=i, i^2=-1, i^3=-i, i^4=1$ comes from — it is rotation, not arithmetic magic.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Complex number anatomy',
        body: 'z = \\underbrace{a}_{\\text{real part}} + \\underbrace{b}_{\\text{imaginary part}}i \\qquad a, b \\in \\mathbb{R} \\\\ |z| = \\sqrt{a^2+b^2} \\text{ (modulus = distance from origin)} \\\\ \\arg(z) = \\theta = \\arctan(b/a) \\text{ (argument = angle from positive real axis)}',
      },
      {
        type: 'insight',
        title: 'Multiplication = rotation + scaling',
        body: '|z_1 z_2| = |z_1||z_2| \\qquad \\arg(z_1 z_2) = \\arg(z_1) + \\arg(z_2) \\\\ \\text{Multiplying complex numbers multiplies magnitudes and adds angles.}',
      },
      {
        type: 'theorem',
        title: 'Euler\'s formula — the most beautiful equation',
        body: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\\\ \\text{At } \\theta = \\pi: \\quad e^{i\\pi} = -1 \\implies e^{i\\pi} + 1 = 0 \\\\ \\text{This connects }e, i, \\pi, 1, 0 \\text{ — the five fundamental constants.}',
      },
    ],
    visualizations: [
      {
        id: 'ComplexPlaneViz',
        title: 'The Complex Plane — Multiplication as Rotation',
        mathBridge: 'Place two complex numbers. Multiply them. Watch the moduli multiply and the angles add. Drag one to animate.',
        caption: 'Multiplying by $e^{i\\theta}$ is a pure rotation by $\\theta$ — no scaling. This is the geometric heart of Euler\'s formula.',
      },
                            ],
  },

  math: {
    callouts: [
      {
        type: 'theorem',
        title: 'Complex arithmetic',
        body: '(a+bi)+(c+di) = (a+c)+(b+d)i \\\\ (a+bi)(c+di) = (ac-bd)+(ad+bc)i \\\\ \\overline{a+bi} = a-bi \\quad (\\text{conjugate}) \\\\ \\frac{a+bi}{c+di} = \\frac{(a+bi)\\overline{(c+di)}}{|c+di|^2} \\quad (\\text{multiply by conjugate over conjugate})',
      },
      {
        type: 'theorem',
        title: 'De Moivre\'s theorem',
        body: '(r\\,e^{i\\theta})^n = r^n e^{in\\theta} = r^n(\\cos n\\theta + i\\sin n\\theta) \\\\ \\text{Used to find }n\\text{th roots: each root is } r^{1/n}e^{i(\\theta+2\\pi k)/n}, \\; k=0,1,\\ldots,n-1',
      },
    ],
    prose: [
      'The fundamental theorem of algebra — every polynomial of degree $n$ with complex coefficients has exactly $n$ roots in $\\mathbb{C}$ (counted with multiplicity) — means the complex numbers are algebraically closed. No further extensions are needed. Every polynomial factors completely there.',
    ],
  },

  rigor: {
    title: 'Why multiplying complex numbers adds their angles',
    proofSteps: [
      { expression: 'z_1 = r_1 e^{i\\theta_1}, \\quad z_2 = r_2 e^{i\\theta_2}', annotation: 'Write both in polar (exponential) form.' },
      { expression: 'z_1 z_2 = r_1 e^{i\\theta_1} \\cdot r_2 e^{i\\theta_2} = r_1 r_2\\, e^{i(\\theta_1+\\theta_2)}', annotation: 'Multiply: real parts multiply, exponents add (standard exponential law).' },
      { expression: '|z_1 z_2| = r_1 r_2, \\quad \\arg(z_1 z_2) = \\theta_1 + \\theta_2 \\qquad \\blacksquare', annotation: 'Read off: magnitude multiplied, angle added. This is the geometric content of complex multiplication.' },
    ],
  },

  examples: [
    {
      id: 'ch2-006-ex1',
      title: 'Dividing complex numbers',
      problem: '\\text{Compute } \\dfrac{3+4i}{1-2i}.',
      steps: [
        { expression: '= \\frac{(3+4i)(1+2i)}{(1-2i)(1+2i)}', annotation: 'Multiply numerator and denominator by the conjugate of the denominator.' },
        { expression: '= \\frac{3+6i+4i+8i^2}{1+4} = \\frac{3+10i-8}{5}', annotation: 'Expand. Use $i^2 = -1$.'},
        { expression: '= \\frac{-5+10i}{5} = -1+2i', annotation: 'Simplify. The answer is a complex number in standard form.' },
      ],
      conclusion: 'Always multiply by the conjugate to divide. The denominator becomes real (a sum of squares), and the result is in standard form.',
    },
    {
      id: 'ch2-006-ex2',
      title: 'Finding all cube roots of 1',
      problem: '\\text{Find all solutions to } z^3 = 1 \\text{ in } \\mathbb{C}.',
      steps: [
        { expression: '1 = e^{i \\cdot 0} = e^{i \\cdot 2\\pi} = e^{i \\cdot 4\\pi}', annotation: 'Write 1 in polar form with all equivalent angles.' },
        { expression: 'z = e^{i \\cdot 2\\pi k/3}, \\quad k = 0, 1, 2', annotation: 'Apply De Moivre for cube roots: divide angles by 3.' },
        { expression: 'z_0=1, \\quad z_1=e^{2\\pi i/3}=-\\tfrac{1}{2}+\\tfrac{\\sqrt{3}}{2}i, \\quad z_2=e^{4\\pi i/3}=-\\tfrac{1}{2}-\\tfrac{\\sqrt{3}}{2}i', annotation: 'Three roots equally spaced at 120° on the unit circle.' },
      ],
      conclusion: 'The $n$ nth-roots of any complex number are equally spaced on a circle in the complex plane. This geometric regularity is only visible through the complex plane.',
    },
  ],

  challenges: [
    {
      id: 'ch2-006-ch1',
      difficulty: 'hard',
      problem: '\\text{Use Euler\'s formula to prove: } \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta.',
      hint: 'Expand $e^{i \\cdot 2\\theta} = (e^{i\\theta})^2$ using Euler\'s formula on both sides.',
      walkthrough: [
        { expression: 'e^{i \\cdot 2\\theta} = \\cos 2\\theta + i\\sin 2\\theta', annotation: 'Euler on the left.' },
        { expression: '(e^{i\\theta})^2 = (\\cos\\theta+i\\sin\\theta)^2 = \\cos^2\\theta - \\sin^2\\theta + 2i\\sin\\theta\\cos\\theta', annotation: 'Expand the square.' },
        { expression: '\\text{Equate real parts: } \\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta \\qquad \\blacksquare', annotation: 'Imaginary parts give $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$ as a bonus.' },
      ],
      answer: '\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta',
    },
  ],

  calcBridge: {
    teaser: 'In calculus, complex exponentials $e^{i\\theta}$ are used in Fourier series and Laplace transforms. The solutions to second-order differential equations with negative discriminant are complex exponentials — which correspond to oscillatory (sinusoidal) behaviour. Understanding complex numbers means understanding oscillation.',
    linkedLessons: ['trig-identities-deep-dive'],
  },
}
