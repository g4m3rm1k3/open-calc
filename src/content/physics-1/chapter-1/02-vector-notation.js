export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'ch1-002',
  slug: 'vector-notation',
  chapter: 1,
  order: 2,
  title: 'Vector Notation',
  subtitle: 'Every symbol physicists use for vectors — and why there are so many.',
  tags: ['vector notation', 'unit vector', 'hat notation', 'component form', 'bold notation'],
  aliases: 'arrow hat i j k notation bracket angle',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question:
      'You open three different physics textbooks. One writes $\\vec{F}$, one writes $\\mathbf{F}$, ' +
      'one writes $F_x\\hat{i} + F_y\\hat{j}$. Are they talking about the same thing?',
    realWorldContext:
      'Physics uses several notational systems for vectors — each invented for a different context. ' +
      'Handwriting uses arrows, print uses bold, engineering uses unit-vector notation. ' +
      'Not knowing the equivalences leads to confusion on every exam and in every textbook.',
    previewVisualizationId: 'NotationGallery',
  },

  // ── YouTube ─────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (2 of 21) Vector Notation',
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/iG-UyKjSaMI" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (3 of 21) Components and Magnitudes of a Vector',
      embedCode:
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/f5Mj3_qjyg0" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      'A vector is a single mathematical idea — but it gets dressed in different clothes ' +
        'depending on the context. Think of it like a person\'s name: ' +
        '"Elizabeth", "Liz", and "Dr. Smith" all refer to the same person.',
      'In handwriting you draw a small arrow over the symbol: $\\vec{F}$. ' +
        'Arrows are slow to typeset, so printed textbooks use bold: $\\mathbf{F}$. ' +
        'In engineering and computation, you write out the components explicitly using ' +
        'unit vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$.',
      'The magnitude of a vector — its size stripped of direction — ' +
        'is written with vertical bars: $|\\vec{A}|$ or sometimes just $A$ (no arrow, no bold). ' +
        'Context always tells you which is meant.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Unit vector',
        body:
          'A vector of magnitude exactly 1. Written with a "hat": $\\hat{u}$. ' +
          'Unit vectors only carry direction — no size. ' +
          '$\\hat{i}$ points along $+x$, $\\hat{j}$ along $+y$, $\\hat{k}$ along $+z$.',
      },
      {
        type: 'insight',
        title: 'All notations are the same object',
        body:
          '$\\vec{A}$, $\\mathbf{A}$, $(A_x,A_y)$, $A_x\\hat{i}+A_y\\hat{j}$, and ' +
          '$|\\vec{A}|\\angle\\theta$ all describe the same vector. ' +
          'The notation choice is a matter of context, not meaning.',
      },
    ],
    visualizations: [
      {
        // Pillar 1
        id: 'NotationGallery',
        title: 'Click a notation — see the same vector appear five ways',
        mathBridge:
          'Each notation card shows the same vector $\\vec{A} = (3, 4)$. ' +
          'Clicking highlights the shared meaning.',
        caption: 'Same object, five outfits.',
        props: { vector: [3, 4] },
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      'The **unit vector** in the direction of $\\vec{A}$ is found by dividing $\\vec{A}$ by its magnitude:',
      'This works because dividing each component by $|\\vec{A}|$ shrinks the arrow to length 1 ' +
        'without changing its direction.',
      'In 3-D, we add a third component and a third basis vector $\\hat{k}$ along the $z$-axis:',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Unit vector in the direction of $\\vec{A}$',
        body:
          '\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} = ' +
          '\\frac{A_x\\hat{i} + A_y\\hat{j}}{\\sqrt{A_x^2+A_y^2}}',
      },
      {
        type: 'theorem',
        title: '3-D unit-vector notation',
        body: '\\vec{A} = A_x\\hat{i} + A_y\\hat{j} + A_z\\hat{k}',
      },
      {
        type: 'definition',
        title: 'Standard basis vectors',
        body:
          '\\hat{i} = (1,0,0),\\quad \\hat{j} = (0,1,0),\\quad \\hat{k} = (0,0,1). ' +
          '\\text{ Each has magnitude 1 and points along one coordinate axis.}',
      },
      {
        type: 'warning',
        title: 'Don\'t confuse $\\hat{i}$ with $i = \\sqrt{-1}$',
        body:
          'In physics, $\\hat{i}$ is the unit vector along $+x$. ' +
          'In mathematics, $i$ is the imaginary unit. ' +
          'Context (and the hat) distinguishes them.',
      },
    ],
    visualizations: [
      {
        // Pillar 4
        id: 'UnitVectorBuilder',
        title: 'Build a unit vector from any arrow',
        mathBridge:
          'Input any $(A_x, A_y)$. The viz shows $\\vec{A}$, computes $|\\vec{A}|$, ' +
          'then divides to produce $\\hat{A}$ — always length 1.',
        caption: 'Dividing by the magnitude never changes direction, only length.',
        props: { showScaleStep: true },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The basis vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$ are special because they are ' +
        '**orthonormal**: mutually perpendicular (orthogonal) and each of unit length (normal). ' +
        'Any vector in 3-D space can be written uniquely as a linear combination of them.',
      'The uniqueness of the representation is what makes component form so powerful: ' +
        'there is exactly one set of numbers $(A_x, A_y, A_z)$ for each vector $\\vec{A}$ ' +
        'relative to a given orthonormal basis.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Orthonormal basis',
        body:
          'A set of vectors $\\{\\hat{e}_1, \\hat{e}_2, \\hat{e}_3\\}$ is orthonormal if ' +
          '\\hat{e}_i \\cdot \\hat{e}_j = \\delta_{ij} ' +
          '\\text{ where } \\delta_{ij}=1 \\text{ if } i=j \\text{ else } 0.',
      },
      {
        type: 'insight',
        title: 'Why orthonormal?',
        body:
          'Any other basis works mathematically but makes arithmetic messy. ' +
          'Orthonormal bases make dot products, magnitudes, and projections clean — ' +
          'which is why $\\hat{i},\\hat{j},\\hat{k}$ are used everywhere in physics.',
      },
    ],
    visualizationId: 'BasisVectorProof',
    proofSteps: [
      {
        expression: '\\vec{A} = A_x \\hat{i} + A_y \\hat{j}',
        annotation: 'We start with a vector in its standard unit-vector expansion. We want to find its unit vector Â.',
      },
      {
        expression: '\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|}',
        annotation: 'The definition of a unit vector: divide the vector by its own magnitude to keep the direction but set length to 1.',
      },
      {
        expression: '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}',
        annotation: 'Calculate the magnitude using the Pythagorean theorem on the components.',
      },
      {
        expression: '\\hat{A} = \\left(\\frac{A_x}{|\\vec{A}|}\\right) \\hat{i} + \\left(\\frac{A_y}{|\\vec{A}|}\\right) \\hat{j}',
        annotation: 'Divide each component by the magnitude. The arrow shrinks to unit length on the diagram.',
      },
      {
        expression: '|\\hat{A}|^2 = \\left(\\frac{A_x}{|\\vec{A}|}\\right)^2 + \\left(\\frac{A_y}{|\\vec{A}|}\\right)^2 = \\frac{A_x^2+A_y^2}{|\\vec{A}|^2} = 1',
        annotation: 'The Pythagorean identity confirms the resulting magnitude is exactly 1. Â is now a valid unit vector.',
      },
    ],
    title: 'Proof: dividing by magnitude gives a unit vector',
    visualizations: [
      {
        id: 'BasisVectorProof',
        title: 'Step through the unit-vector derivation',
        mathBridge: 'Each step rescales the arrow — watch its length shrink to exactly 1.',
        caption: 'The proof is just one division — but worth seeing geometrically.',
      },
    ],
  },

  // ── Examples ────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-002-ex1',
      title: 'Writing a vector in every notation',
      problem:
        '\\text{A force } \\vec{F} \\text{ has components } F_x = 3\\,N,\\; F_y = 4\\,N. ' +
        '\\text{Write it in (a) component notation, (b) unit-vector notation, (c) magnitude–angle form, (d) as a unit vector.}',
      steps: [
        {
          expression: '\\text{(a) } \\vec{F} = (3,\\,4)\\,N',
          annotation: 'Component/bracket notation.',
        },
        {
          expression: '\\text{(b) } \\vec{F} = 3\\hat{i} + 4\\hat{j}\\,N',
          annotation: 'Unit-vector notation — write each component times its basis vector.',
        },
        {
          expression: '\\text{(c) } |\\vec{F}| = \\sqrt{9+16} = 5\\,N,\\quad \\theta = \\arctan(4/3) \\approx 53.1°',
          annotation: 'Magnitude–angle form. Both components positive → Quadrant I, no correction needed.',
        },
        {
          expression:
            '\\text{(d) } \\hat{F} = \\frac{\\vec{F}}{|\\vec{F}|} = \\frac{3\\hat{i}+4\\hat{j}}{5} = 0.6\\hat{i}+0.8\\hat{j}',
          annotation: 'Divide each component by the magnitude. The result has magnitude 1.',
        },
      ],
      conclusion: 'Any vector can be translated between all four notations. Practice until the conversions are automatic.',
    },
    {
      id: 'ch1-002-ex2',
      title: 'Identifying notation in the wild',
      problem:
        '\\text{Match each expression to its notation type: } ' +
        '(a)\\;\\mathbf{v},\\; ' +
        '(b)\\;|\\vec{v}|,\\; ' +
        '(c)\\;v_x\\hat{i}+v_y\\hat{j},\\; ' +
        '(d)\\;(v_x,v_y),\\; ' +
        '(e)\\;\\hat{v}.',
      steps: [
        {
          expression: '\\text{(a) } \\mathbf{v} \\Rightarrow \\text{bold notation (vector)}',
          annotation: 'Bold in print = arrow in handwriting.',
        },
        {
          expression: '\\text{(b) } |\\vec{v}| \\Rightarrow \\text{magnitude (scalar)}',
          annotation: 'Vertical bars strip the direction — result is a positive number.',
        },
        {
          expression: '\\text{(c) } v_x\\hat{i}+v_y\\hat{j} \\Rightarrow \\text{unit-vector notation (vector)}',
          annotation: 'Expanded into basis vectors.',
        },
        {
          expression: '\\text{(d) } (v_x,v_y) \\Rightarrow \\text{component notation (vector)}',
          annotation: 'Ordered pair of components.',
        },
        {
          expression: '\\text{(e) } \\hat{v} \\Rightarrow \\text{unit vector (magnitude = 1)}',
          annotation: 'The hat signals direction only, magnitude = 1.',
        },
      ],
      conclusion: 'Notation fluency is a prerequisite for every subsequent topic. If any of these felt slow, drill the pattern viz.',
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-002-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Find the unit vector in the direction of } \\vec{A} = (-5,\\,12).',
      hint: 'Compute $|\\vec{A}|$ first, then divide each component.',
      walkthrough: [
        {
          expression: '|\\vec{A}| = \\sqrt{(-5)^2 + 12^2} = \\sqrt{25+144} = \\sqrt{169} = 13',
          annotation: 'The 5-12-13 Pythagorean triple.',
        },
        {
          expression:
            '\\hat{A} = \\frac{(-5,\\,12)}{13} = \\bigl(-\\tfrac{5}{13},\\;\\tfrac{12}{13}\\bigr)',
          annotation: 'Divide each component by 13.',
        },
        {
          expression:
            '\\text{Verify: } \\bigl|\\hat{A}\\bigr| = \\sqrt{(5/13)^2+(12/13)^2} = \\sqrt{25/169+144/169} = \\sqrt{169/169} = 1\\checkmark',
          annotation: 'Always verify the result has magnitude 1.',
        },
      ],
      answer: '\\hat{A} = \\bigl(-\\tfrac{5}{13},\\;\\tfrac{12}{13}\\bigr)',
    },
    {
      id: 'ch1-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 3-D vector is given as } \\vec{B} = 2\\hat{i} - 6\\hat{j} + 3\\hat{k}. ' +
        '\\text{Find } |\\vec{B}| \\text{ and } \\hat{B}.',
      hint: 'The Pythagorean theorem extends to 3-D: $|\\vec{B}| = \\sqrt{B_x^2+B_y^2+B_z^2}$.',
      walkthrough: [
        {
          expression: '|\\vec{B}| = \\sqrt{2^2+(-6)^2+3^2} = \\sqrt{4+36+9} = \\sqrt{49} = 7',
          annotation: '3-D Pythagorean theorem.',
        },
        {
          expression:
            '\\hat{B} = \\frac{2\\hat{i}-6\\hat{j}+3\\hat{k}}{7} = \\tfrac{2}{7}\\hat{i} - \\tfrac{6}{7}\\hat{j} + \\tfrac{3}{7}\\hat{k}',
          annotation: 'Divide each component by 7.',
        },
      ],
      answer: '|\\vec{B}| = 7,\\quad \\hat{B} = \\tfrac{2}{7}\\hat{i} - \\tfrac{6}{7}\\hat{j} + \\tfrac{3}{7}\\hat{k}',
    },
  ],

  // ── Pillar 3 — Pattern-recognition viz ───────────────────────────────────
  patternViz: {
    id: 'NotationPatternSpotter',
    placement: 'math',
    title: 'Which expression is a vector, which is a scalar? — 10 rounds',
    mathBridge: 'Rapid-fire notation recognition. You will see this on every problem set.',
    caption: 'Arrows, bold, hats, bars — learn to read them all automatically.',
    prerequisiteRecaps: [
      {
        concept: 'What is a vector?',
        summary: 'A quantity with both magnitude and direction.',
        lessonSlug: 'what-is-a-vector',
      },
    ],
    props: {
      rounds: [
        { expression: '\\vec{F}', answer: 'vector' },
        { expression: '|\\vec{F}|', answer: 'scalar' },
        { expression: '\\hat{k}', answer: 'vector (unit)', note: 'magnitude = 1' },
        { expression: 'F_x', answer: 'scalar', note: 'a single component is a number' },
        { expression: '\\mathbf{A}', answer: 'vector' },
        { expression: 'A_x\\hat{i}+A_y\\hat{j}', answer: 'vector' },
        { expression: '\\sqrt{A_x^2+A_y^2}', answer: 'scalar', note: 'this is $|\\vec{A}|$' },
        { expression: '(3,\\,-4)', answer: 'vector', note: 'component notation' },
        { expression: '\\hat{F} \\cdot 10\\,N', answer: 'vector', note: 'scalar × unit vector = vector' },
        { expression: '5\\,N', answer: 'scalar', note: 'no direction given' },
      ],
    },
  },

  // ── Pillar 5 — Recognition/exhaustive-forms viz ──────────────────────────
  recognitionViz: {
    id: 'NotationFormRecogniser',
    placement: 'examples_end',
    title: 'Complete notation reference — every form at once',
    mathBridge: 'A lookup table you should be able to reconstruct from memory.',
    caption: 'All notations side by side. Close this and try to reproduce them without looking.',
    prerequisiteRecaps: [
      {
        concept: 'Vectors vs scalars',
        summary: 'Vectors carry direction; scalars do not.',
        lessonSlug: 'what-is-a-vector',
      },
    ],
    props: {
      forms: [
        { notation: '\\vec{A}', meaning: 'Vector A (handwritten / introductory texts)' },
        { notation: '\\mathbf{A}', meaning: 'Vector A (printed / linear algebra texts)' },
        { notation: '(A_x, A_y)', meaning: 'Component / bracket form (2-D)' },
        { notation: 'A_x\\hat{i}+A_y\\hat{j}+A_z\\hat{k}', meaning: 'Unit-vector form (3-D)' },
        { notation: '|\\vec{A}|\\angle\\theta', meaning: 'Magnitude–angle (polar) form' },
        { notation: '\\hat{A} = \\vec{A}/|\\vec{A}|', meaning: 'Unit vector in direction of A' },
        { notation: '|\\vec{A}|\\text{ or }A', meaning: 'Magnitude of A (scalar)' },
      ],
    },
  },
}
