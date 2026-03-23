export default {
  id: 'ch5-004',
  slug: 'vectors-dot-product',
  chapter: 5,
  order: 4,
  title: 'The Dot Product: Measuring How Much Two Vectors Agree',
  subtitle: 'The dot product answers one question: how much of $\\vec{u}$ points in the direction of $\\vec{v}$? The answer is a single number — and it encodes the angle, projection, and work all at once.',
  tags: ['dot product', 'scalar product', 'angle between vectors', 'orthogonal', 'projection', 'vector projection', 'scalar projection', 'work', 'cosine similarity'],
  aliases: 'dot product scalar product inner product angle between vectors orthogonal perpendicular projection work component cosine similarity',

  hook: {
    question: 'You push a lawnmower with 60 N of force at 30° below horizontal. How much of that force actually moves the mower forward? You cannot just use 60 N — direction matters. The dot product extracts exactly the part of one vector that acts along another.',
    realWorldContext: 'Work in physics is $W = \\vec{F} \\cdot \\vec{d}$ — only the component of force in the direction of motion counts. In machine learning, how similar are two documents? Cosine similarity is a dot product. In 3D graphics, how bright is a surface? Lambert\'s law is a dot product between the light direction and the surface normal. In navigation, how efficiently is your velocity taking you toward your destination? Dot product. One formula, everywhere.',
    previewVisualizationId: 'DotProductViz',
  },

  // ── PILLAR 1: What it IS ──────────────────────────────────────────────────
  // Geometric/physical intuition before any formula.
  // Student should be able to describe the dot product in plain English
  // after reading this section alone.
  intuition: {
    pillar: 1,
    pillarLabel: 'What it IS — the geometry first',
    prose: [
      'Imagine two arrows pinned at the same point. The dot product is a measure of how much they point in the same direction. If they point exactly the same way, the dot product is large and positive. If they are perpendicular, it is zero — they share no direction at all. If they point opposite ways, it is negative.',
      'There is a physical way to see this. Drop a perpendicular from the tip of $\\vec{u}$ onto the line of $\\vec{v}$. The length of the shadow that $\\vec{u}$ casts on $\\vec{v}$ is the scalar projection. The dot product is that shadow length times $|\\vec{v}|$. When the shadow is long (vectors nearly parallel), the dot product is large. When the shadow is zero (vectors perpendicular), the dot product is zero.',
      'This shadow interpretation is not a metaphor — it is the definition. Formally: $\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta$, where $\\theta$ is the angle between them. The $\\cos\\theta$ captures exactly how much of $\\vec{u}$\'s length is acting along $\\vec{v}$\'s direction.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Before any formula: the shadow test',
        body: '\\text{Point the two vectors from the same origin.} \\\\ \\text{Drop a perpendicular from the tip of } \\vec{u} \\text{ onto } \\vec{v}. \\\\ \\text{The shadow is positive (same side as } \\vec{v}\\text{): dot product} > 0 \\\\ \\text{No shadow (perpendicular): dot product} = 0 \\\\ \\text{Shadow on opposite side: dot product} < 0',
      },
      {
        type: 'definition',
        title: 'The dot product — two equivalent forms',
        body: '\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta \\quad \\text{(angle form — geometric meaning)} \\\\ \\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2 \\quad \\text{(component form — easy to compute)} \\\\ \\text{The proof that these are equal is Pillar 2 (rigor section).}',
      },
      {
        type: 'warning',
        title: 'The dot product is NOT a vector',
        body: '\\vec{u} \\cdot \\vec{v} \\in \\mathbb{R} \\quad \\text{(a number, not an arrow)} \\\\ \\text{Adding a dot product to a vector is meaningless: } \\vec{u} + (\\vec{u}\\cdot\\vec{v}) \\text{ makes no sense.} \\\\ \\text{This trips up students constantly — the result has no direction.}',
      },
    ],
    visualizations: [
      {
        id: 'DotProductViz',
        title: 'Drag Two Vectors — Watch the Shadow',
        mathBridge: 'Drag both vectors. The right panel shows the dot product, angle, and scalar projection updating live. Switch to projection mode to see the shadow explicitly drawn.',
        caption: 'When vectors are perpendicular, the shadow vanishes and the dot product becomes zero — no computation needed.',
      },
    ],
  },

  // ── PILLAR 2: Why it's TRUE ───────────────────────────────────────────────
  // The proof that the component formula = the angle formula.
  // Every step has a geometric justification.
  rigor: {
    pillar: 2,
    pillarLabel: 'Why it\'s TRUE — proof that component form = angle form',
    title: 'Proving $u_1v_1 + u_2v_2 = |\\vec{u}||\\vec{v}|\\cos\\theta$',
    prerequisiteRecap: {
      title: 'What you need to follow this proof',
      items: [
        { concept: 'Law of Cosines', statement: 'For a triangle with sides $a, b, c$ and angle $C$ between $a$ and $b$: $c^2 = a^2 + b^2 - 2ab\\cos C$.', linkedLesson: 'solving-triangles' },
        { concept: 'Vector magnitude', statement: '$|\\vec{v}|^2 = v_1^2 + v_2^2$ — Pythagorean theorem applied to components.', linkedLesson: 'vectors-2d' },
        { concept: 'Vector subtraction', statement: '$\\vec{u} - \\vec{v} = \\langle u_1-v_1, u_2-v_2 \\rangle$', linkedLesson: 'vectors-2d' },
      ],
    },
    proofSteps: [
      {
        expression: '\\text{Place } \\vec{u} \\text{ and } \\vec{v} \\text{ tail-to-tail at the origin.}',
        annotation: 'The three vectors $\\vec{u}$, $\\vec{v}$, and $\\vec{u}-\\vec{v}$ form a triangle. $\\theta$ is the angle at the origin.',
        geometricAnchor: 'This triangle is the key. The Law of Cosines relates all three sides to the angle $\\theta$ — which is exactly what we want.',
      },
      {
        expression: '|\\vec{u}-\\vec{v}|^2 = |\\vec{u}|^2 + |\\vec{v}|^2 - 2|\\vec{u}||\\vec{v}|\\cos\\theta',
        annotation: 'Apply Law of Cosines to the triangle. The side opposite $\\theta$ has length $|\\vec{u}-\\vec{v}|$.',
        geometricAnchor: 'Law of Cosines is just a generalisation of the Pythagorean theorem. Nothing new here — just the right tool for a triangle with a known angle.',
      },
      {
        expression: '|\\vec{u}-\\vec{v}|^2 = (u_1-v_1)^2+(u_2-v_2)^2 = u_1^2-2u_1v_1+v_1^2+u_2^2-2u_2v_2+v_2^2',
        annotation: 'Expand the left side using the magnitude formula. Nothing geometric here — pure algebra.',
        geometricAnchor: null,
      },
      {
        expression: '= (u_1^2+u_2^2) + (v_1^2+v_2^2) - 2(u_1v_1+u_2v_2) = |\\vec{u}|^2 + |\\vec{v}|^2 - 2(u_1v_1+u_2v_2)',
        annotation: 'Regroup. Recognise $u_1^2+u_2^2 = |\\vec{u}|^2$ and $v_1^2+v_2^2 = |\\vec{v}|^2$.',
        geometricAnchor: 'The $u_1v_1+u_2v_2$ group is what the component formula computes. It is about to be identified as $|\\vec{u}||\\vec{v}|\\cos\\theta$.',
      },
      {
        expression: '|\\vec{u}|^2 + |\\vec{v}|^2 - 2(u_1v_1+u_2v_2) = |\\vec{u}|^2 + |\\vec{v}|^2 - 2|\\vec{u}||\\vec{v}|\\cos\\theta',
        annotation: 'Both sides equal $|\\vec{u}-\\vec{v}|^2$. Set them equal.',
        geometricAnchor: null,
      },
      {
        expression: '\\therefore u_1v_1+u_2v_2 = |\\vec{u}||\\vec{v}|\\cos\\theta \\qquad \\blacksquare',
        annotation: 'Cancel the common terms $|\\vec{u}|^2 + |\\vec{v}|^2$. The two formulas are provably equal — connected by the Law of Cosines and the Pythagorean theorem.',
        geometricAnchor: 'The component formula computes exactly the same thing as the angle formula. Neither is more fundamental — they are the same geometric fact in two languages.',
      },
    ],
  },

  // ── PILLAR 3: How the algebra CONNECTS ───────────────────────────────────
  // Takes a specific hard step students encounter (projection formula derivation)
  // and annotates every symbol back to a geometric anchor.
  // Includes inline prerequisite recaps.
  math: {
    pillar: 3,
    pillarLabel: 'How the algebra CONNECTS — every symbol tied to geometry',
    prose: [
      'The projection formula is where most students lose the thread. Here is every step annotated so no symbol is floating free.',
      'We want the vector projection of $\\vec{u}$ onto $\\vec{v}$: the arrow in the direction of $\\vec{v}$ that has the same shadow as $\\vec{u}$. Start from the shadow length (scalar projection), then multiply by the unit vector in the direction of $\\vec{v}$ to get the arrow.',
    ],
    annotatedDerivation: {
      title: 'Where the projection formula actually comes from',
      steps: [
        {
          expression: '\\text{Scalar projection} = |\\vec{u}|\\cos\\theta',
          plain: 'This is just geometry: the length of the shadow $\\vec{u}$ casts on $\\vec{v}$ is $|\\vec{u}|$ times $\\cos\\theta$ (adjacent over hypotenuse in the right triangle).',
          prereq: null,
        },
        {
          expression: '= |\\vec{u}| \\cdot \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}||\\vec{v}|}',
          plain: 'Replace $\\cos\\theta$ using the angle formula: $\\cos\\theta = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}||\\vec{v}|}$.',
          prereq: 'Rearranging $\\vec{u}\\cdot\\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta$ gives $\\cos\\theta = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}||\\vec{v}|}$.',
        },
        {
          expression: '= \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|}',
          plain: 'The $|\\vec{u}|$ cancels. What remains is the scalar projection: just the dot product divided by the length of $\\vec{v}$.',
          prereq: null,
        },
        {
          expression: '\\text{Vector projection} = \\left(\\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|}\\right) \\cdot \\hat{v} = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|} \\cdot \\frac{\\vec{v}}{|\\vec{v}|} = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|^2}\\vec{v}',
          plain: 'Multiply the scalar projection by $\\hat{v}$ (unit vector in direction of $\\vec{v}$) to turn the length into an arrow. $\\hat{v} = \\vec{v}/|\\vec{v}|$.',
          prereq: 'Unit vector: divide any vector by its own magnitude to get length 1 in the same direction. $\\hat{v} = \\vec{v}/|\\vec{v}|$.',
        },
      ],
      summary: 'The formula $\\text{proj}_{\\vec{v}}\\vec{u} = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|^2}\\vec{v}$ is not magic — it is shadow length (dot product / $|\\vec{v}|$) times the unit vector of $\\vec{v}$ (= $\\vec{v}/|\\vec{v}|$), combined into one expression.',
    },
    callouts: [
      {
        type: 'proof-map',
        title: 'Projection formulas — unpacked',
        body: '\\text{Scalar projection (a number): } \\text{comp}_{\\vec{v}}\\vec{u} = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|} \\\\ \\text{Vector projection (an arrow): } \\text{proj}_{\\vec{v}}\\vec{u} = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|^2}\\vec{v} \\\\ \\text{Perpendicular part: } \\vec{u}_{\\perp} = \\vec{u} - \\text{proj}_{\\vec{v}}\\vec{u}',
      },
      {
        type: 'warning',
        title: 'proj$_{\\vec{v}}\\vec{u}$ is NOT the same as proj$_{\\vec{u}}\\vec{v}$',
        body: '\\text{Order matters. } \\text{proj}_{\\vec{v}}\\vec{u} \\text{ is the shadow of } \\vec{u} \\text{ on } \\vec{v}. \\\\ \\text{proj}_{\\vec{u}}\\vec{v} \\text{ is the shadow of } \\vec{v} \\text{ on } \\vec{u}. \\\\ \\text{These have different lengths unless } |\\vec{u}|=|\\vec{v}|.',
      },
    ],
    visualizations: [
      {
        id: 'DotProductViz',
        title: 'Projection Mode — Shadow Made Explicit',
        mathBridge: 'Switch to projection mode. The yellow arrow is proj_v(u). The green dashed arrow is u⊥ — the perpendicular remainder. The right angle square confirms they are truly perpendicular.',
        caption: 'proj + perp = original vector. They always add back to u exactly.',
      },
    ],
  },

  // ── PILLAR 4: A different ANALOGY ─────────────────────────────────────────
  // Physical, real-world, unit-based — a second completely different lens.
  analogy: {
    pillar: 4,
    pillarLabel: 'A different lens — work as a physical analogy',
    title: 'Work: the dot product you already understand physically',
    prose: [
      'You already know work intuitively: pushing a box across the floor does work; holding it still does not. Lifting it vertically while walking horizontally — the lift does no work on the horizontal motion. Why? Because the lift force is perpendicular to the direction of travel.',
      'This is the dot product. $W = \\vec{F} \\cdot \\vec{d} = |\\vec{F}||\\vec{d}|\\cos\\theta$. The angle $\\theta$ is between the force direction and the motion direction. When $\\theta = 0°$ (push in the direction of motion): full force does work. When $\\theta = 90°$ (carry a weight horizontally): zero work on horizontal motion. When $\\theta = 180°$ (friction opposes motion): negative work.',
      'This is not a special case of the dot product — it IS the dot product. Work is the dot product of force and displacement. The formula $W = Fd\\cos\\theta$ that you see in physics textbooks is exactly $\\vec{F}\\cdot\\vec{d}$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why holding a suitcase does zero work',
        body: '\\text{Force: upward (to counteract gravity). Displacement: horizontal (walking).} \\\\ \\theta = 90° \\Rightarrow \\cos 90° = 0 \\Rightarrow W = |\\vec{F}||\\vec{d}| \\cdot 0 = 0 \\\\ \\text{Perpendicular force and displacement: zero dot product, zero work.} \\\\ \\text{Your arms get tired, but physically no work is done on the suitcase horizontally.}',
      },
      {
        type: 'insight',
        title: 'The lawnmower — connecting back to the hook',
        body: 'F = 60 \\text{ N at } 30° \\text{ below horizontal.} \\quad d = \\text{horizontal.} \\\\ W = 60 \\cdot d \\cdot \\cos(30°) = 60 \\cdot d \\cdot \\frac{\\sqrt{3}}{2} \\approx 51.96 d \\text{ J} \\\\ \\text{Only 51.96 N of the 60 N actually moves the mower forward.} \\\\ \\text{The remaining 8 N pushes into the ground — perpendicular to motion.}',
      },
    ],
  },

  // ── PILLAR 5: PRACTICE with feedback ─────────────────────────────────────
  // Covers every surface form. Each has a watchFor annotation.
  // Prerequisites shown inline when a step uses a concept from another lesson.
  examples: [
    {
      id: 'ch5-004-ex1',
      pillar: 5,
      title: 'Form 1: Basic dot product and what its sign means',
      problem: '\\vec{u} = \\langle 4, -1 \\rangle, \\; \\vec{v} = \\langle 2, 3 \\rangle. \\text{ Compute } \\vec{u}\\cdot\\vec{v} \\text{ and describe the angle.}',
      steps: [
        {
          expression: '\\vec{u}\\cdot\\vec{v} = (4)(2)+(-1)(3) = 8-3 = 5',
          annotation: 'Multiply matching components, add. One step.',
        },
        {
          expression: '\\text{Dot product} = 5 > 0 \\Rightarrow \\theta < 90° \\text{ (vectors lean toward each other)}',
          annotation: 'Positive → acute angle. No need to compute θ to know this.',
        },
      ],
      watchFor: 'Students often compute $(4)(-1) + (2)(3)$ instead — mixing up which components pair. Always pair position by position: first×first, second×second.',
    },
    {
      id: 'ch5-004-ex2',
      pillar: 5,
      title: 'Form 2: Finding the angle',
      problem: '\\text{Find the angle between } \\vec{u}=\\langle 3,-1\\rangle \\text{ and } \\vec{v}=\\langle 2,4\\rangle.',
      steps: [
        {
          expression: '\\vec{u}\\cdot\\vec{v} = 6-4 = 2 \\qquad |\\vec{u}|=\\sqrt{10} \\qquad |\\vec{v}|=2\\sqrt{5}',
          annotation: 'Three separate computations. Do them one at a time.',
        },
        {
          expression: '\\cos\\theta = \\frac{2}{\\sqrt{10}\\cdot2\\sqrt{5}} = \\frac{2}{2\\sqrt{50}} = \\frac{1}{\\sqrt{50}}',
          annotation: 'Angle formula: divide dot product by product of magnitudes.',
        },
        {
          expression: '\\theta = \\arccos\\!\\left(\\frac{1}{\\sqrt{50}}\\right) \\approx 81.9°',
          annotation: 'arccos gives the angle. Range is always $[0°, 180°]$.',
        },
      ],
      watchFor: 'arccos always returns angles in $[0°, 180°]$ — this is the correct range for the angle between two vectors. You will never get a negative angle or an angle over 180°.',
    },
    {
      id: 'ch5-004-ex3',
      pillar: 5,
      title: 'Form 3: Testing for perpendicularity',
      problem: '\\text{Are } \\vec{u}=\\langle 3,-2\\rangle \\text{ and } \\vec{v}=\\langle 4,6\\rangle \\text{ perpendicular?}',
      steps: [
        {
          expression: '\\vec{u}\\cdot\\vec{v} = (3)(4)+(-2)(6) = 12-12 = 0',
          annotation: 'If the dot product is zero, the vectors are perpendicular. No arccos needed.',
        },
        {
          expression: '\\text{Yes, } \\vec{u} \\perp \\vec{v}.',
          annotation: 'Perpendicularity test: dot product = 0. The quickest check there is.',
        },
      ],
      watchFor: 'This is the most efficient perpendicularity test — faster than computing the angle. In many problems (finding a normal vector, checking an answer) this is all you need.',
    },
    {
      id: 'ch5-004-ex4',
      pillar: 5,
      title: 'Form 4: Vector projection onto a given direction',
      problem: '\\text{Find } \\text{proj}_{\\vec{v}}\\vec{u} \\text{ where } \\vec{u}=\\langle 4,3\\rangle \\text{ and } \\vec{v}=\\langle 2,1\\rangle.',
      steps: [
        {
          expression: '\\vec{u}\\cdot\\vec{v} = 8+3=11 \\qquad |\\vec{v}|^2 = 4+1=5',
          annotation: 'Two preliminary numbers. Note: use $|\\vec{v}|^2$, not $|\\vec{v}|$ — avoids a square root.',
        },
        {
          expression: '\\text{proj}_{\\vec{v}}\\vec{u} = \\frac{11}{5}\\langle 2,1\\rangle = \\langle\\tfrac{22}{5}, \\tfrac{11}{5}\\rangle',
          annotation: 'Scale $\\vec{v}$ by $\\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|^2}$. The result is a vector in the direction of $\\vec{v}$.',
        },
        {
          expression: '\\vec{u}_{\\perp} = \\vec{u} - \\text{proj}_{\\vec{v}}\\vec{u} = \\langle 4-\\tfrac{22}{5}, 3-\\tfrac{11}{5}\\rangle = \\langle -\\tfrac{2}{5}, \\tfrac{4}{5}\\rangle',
          annotation: 'Perpendicular part: subtract the projection from the original.',
        },
        {
          expression: '\\text{Check: } \\vec{u}_{\\perp}\\cdot\\vec{v} = (-\\tfrac{2}{5})(2)+(\\tfrac{4}{5})(1) = 0 \\checkmark',
          annotation: 'Always verify: the perpendicular part should have zero dot product with $\\vec{v}$.',
        },
      ],
      watchFor: 'Use $|\\vec{v}|^2 = \\vec{v}\\cdot\\vec{v}$ in the denominator, NOT $|\\vec{v}|$. Students often write $\\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{v}|}$ which gives the scalar projection — a number, not the vector you want.',
    },
    {
      id: 'ch5-004-ex5',
      pillar: 5,
      title: 'Form 5: Work done by a force',
      problem: '\\text{Force } \\vec{F}=\\langle 6,2\\rangle \\text{ N. Displacement } \\vec{d}=\\langle 4,0\\rangle \\text{ m. Find the work done.}',
      steps: [
        {
          expression: 'W = \\vec{F}\\cdot\\vec{d} = (6)(4)+(2)(0) = 24 \\text{ J}',
          annotation: 'Work is a dot product. One computation.',
        },
        {
          expression: '\\text{The 2 N vertical component of force does zero work on horizontal motion.}',
          annotation: 'The $(2)(0)$ term confirms it — zero displacement in the vertical direction means the vertical force component contributes nothing.',
        },
      ],
      watchFor: 'Work can be negative (force opposes motion: $\\theta > 90°$). Negative work means the force is removing energy from the system — like friction or braking.',
    },
    {
      id: 'ch5-004-ex6',
      pillar: 5,
      title: 'Form 6: Finding an unknown component to satisfy a dot product condition',
      problem: '\\text{Find } k \\text{ so that } \\langle k, 3\\rangle \\perp \\langle 2, k-1\\rangle.',
      steps: [
        {
          expression: '\\langle k,3\\rangle \\cdot \\langle 2,k-1\\rangle = 0 \\Rightarrow 2k + 3(k-1) = 0',
          annotation: 'Set up perpendicularity condition: dot product = 0.',
        },
        {
          expression: '2k + 3k - 3 = 0 \\Rightarrow 5k = 3 \\Rightarrow k = \\tfrac{3}{5}',
          annotation: 'Solve the linear equation.',
        },
      ],
      watchFor: 'This type of problem appears on exams: "find the value of the parameter so two vectors are perpendicular/parallel." Perpendicular → dot product = 0. Parallel → one is a scalar multiple of the other.',
    },
  ],

  challenges: [
    {
      id: 'ch5-004-ch1',
      difficulty: 'medium',
      problem: '\\text{Find all vectors } \\vec{v}=\\langle x,y\\rangle \\text{ perpendicular to } \\langle 3,-2\\rangle \\text{ with magnitude 5.}',
      hint: 'Two conditions: dot product = 0, magnitude = 5. Two equations, two unknowns.',
      watchFor: 'There will be two solutions — a vector and its negative. Both are valid.',
      walkthrough: [
        {
          expression: '3x-2y=0 \\Rightarrow y = \\tfrac{3x}{2}',
          annotation: 'Perpendicularity.',
        },
        {
          expression: 'x^2+\\tfrac{9x^2}{4}=25 \\Rightarrow \\tfrac{13x^2}{4}=25 \\Rightarrow x=\\pm\\tfrac{10}{\\sqrt{13}}',
          annotation: 'Magnitude condition.',
        },
        {
          expression: '\\vec{v} = \\pm\\langle\\tfrac{10}{\\sqrt{13}}, \\tfrac{15}{\\sqrt{13}}\\rangle',
          annotation: 'Two answers — one pointing each perpendicular direction.',
        },
      ],
      answer: '\\vec{v} = \\pm\\left\\langle\\dfrac{10}{\\sqrt{13}}, \\dfrac{15}{\\sqrt{13}}\\right\\rangle',
    },
    {
      id: 'ch5-004-ch2',
      difficulty: 'hard',
      problem: '\\text{A sled is pulled by a rope at 25° above horizontal with 80 N force over 12 m. Find work done. What angle minimises rope tension for the same horizontal work?}',
      hint: 'Part 1: work = force dot displacement. Part 2: express horizontal work in terms of angle, find the angle that achieves the target work with minimum $|\\vec{F}|$.',
      watchFor: 'Part 2 requires calculus thinking (minimise force subject to a work constraint) but can be approached with the dot product formula directly: $W = |F| \\cdot d \\cdot \\cos\\theta$, so for fixed $W$ and $d$, $|F| = W/(d\\cos\\theta)$ is minimised when $\\cos\\theta$ is maximised, i.e. $\\theta = 0°$.',
      walkthrough: [
        {
          expression: 'W = 80\\cos25° \\cdot 12 \\approx 72.5 \\cdot 12 = 870 \\text{ J}',
          annotation: 'Displacement is horizontal so $\\vec{d} = \\langle 12, 0\\rangle$.',
        },
        {
          expression: '|F| = \\frac{W}{d\\cos\\theta} = \\frac{870}{12\\cos\\theta}',
          annotation: 'Express required force for target work 870 J.',
        },
        {
          expression: '\\text{Minimum when } \\cos\\theta = 1 \\Rightarrow \\theta = 0°. \\text{ Pull horizontally.}',
          annotation: 'Horizontal pull is most efficient — all force goes into work.',
        },
      ],
      answer: 'W \\approx 870 \\text{ J}; minimum tension at } \\theta = 0°',
    },
  ],

  calcBridge: {
    teaser: 'The dot product is the inner product of Euclidean space — the foundation of all geometry in higher dimensions. In multivariable calculus, the directional derivative $D_{\\hat{u}}f = \\nabla f \\cdot \\hat{u}$ is a dot product: it measures how fast $f$ changes in direction $\\hat{u}$. The gradient $\\nabla f$ points in the direction that maximises this dot product — the direction of steepest ascent. Every concept you built here (projection, perpendicularity, angle) reappears in 3D and beyond.',
    linkedLessons: ['vectors-2d', 'trig-ratios-right-triangles', 'solving-triangles'],
  },
}
