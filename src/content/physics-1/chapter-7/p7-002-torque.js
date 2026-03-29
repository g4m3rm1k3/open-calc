export default {
  id: 'p1-ch7-002',
  slug: 'torque',
  chapter: 'p7',
  order: 2,
  title: 'Torque: The Rotational Force',
  subtitle: 'Force applied at a distance — the lever arm is everything.',
  tags: ['torque', 'lever arm', 'moment', 'cross product', 'tau = rF sin theta', 'wrench', 'rotation'],

  hook: {
    question:
      'You need to loosen a very tight bolt. You have two wrenches: one with a 10 cm handle, one with a 40 cm handle. ' +
      'You apply the same 50 N force to each. ' +
      'Which wrench is more effective — and by exactly how much? ' +
      'What physical quantity are you actually controlling?',
    realWorldContext:
      'Torque is why door handles are on the far edge from the hinge, why steering wheels are large, ' +
      'and why a longer wrench makes a mechanic\'s job easier. ' +
      'It is also why the human forearm works the way it does: ' +
      'the bicep attaches close to the elbow joint (short lever arm) but must support loads far from the joint. ' +
      'Torque governs everything from opening a jar to the orbital mechanics of a spacecraft.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**The answer:** The 40 cm wrench produces 4× more torque: \\(\\tau = r F = (0.40)(50) = 20\\) N·m vs \\((0.10)(50) = 5\\) N·m. ' +
        'The quantity you\'re controlling is **torque** — the rotational effectiveness of a force.',

      '**Why distance matters:** A force applied at the rotation axis produces zero rotation — no lever arm means no torque. ' +
        'Push on a door right at the hinge: nothing moves. Push at the far edge: easy rotation. ' +
        'Same force, completely different effect. The perpendicular distance from the axis to the line of force — the **lever arm** — is what multiplies the force.',

      '**The angle matters too:** If you push perpendicular to the wrench, all your force contributes to rotation. ' +
        'If you push along the wrench (parallel to the handle), zero rotation — you\'re just pushing toward or away from the axis. ' +
        'The effective component is \\(F\\sin\\theta\\), where \\(\\theta\\) is the angle between the force and the lever arm. ' +
        'So the full formula is \\(\\tau = rF\\sin\\theta\\).',

      '**Torque is a vector (cross product):** \\(\\vec{\\tau} = \\vec{r} \\times \\vec{F}\\). ' +
        'The direction is given by the right-hand rule: curl fingers from \\(\\vec{r}\\) toward \\(\\vec{F}\\), thumb points along the torque vector. ' +
        'Counterclockwise torques are positive; clockwise are negative (by convention).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — Torque: the cause of angular acceleration',
        body:
          '**Lesson 1:** Angular kinematics describes HOW rotation happens (θ, ω, α).\n' +
          '**This lesson:** Torque is WHY rotation happens — the rotational analogue of force.\n' +
          '**Next:** Rotational dynamics: τ = Iα (Newton\'s Second Law for rotation).',
      },
      {
        type: 'definition',
        title: 'Torque',
        body: '\\tau = rF\\sin\\theta = r_{\\perp}F = rF_{\\perp} \\qquad [\\text{SI: N·m}]',
      },
      {
        type: 'theorem',
        title: 'Torque as cross product',
        body: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} \\qquad |\\vec{\\tau}| = rF\\sin\\theta',
      },
      {
        type: 'insight',
        title: 'Three equivalent interpretations of τ = rF sin θ',
        body:
          '1. \\(\\tau = r \\cdot (F\\sin\\theta)\\) — full radius × perpendicular component of force.\n' +
          '2. \\(\\tau = (r\\sin\\theta) \\cdot F\\) — perpendicular distance (lever arm) × full force.\n' +
          '3. \\(\\tau = \\vec{r} \\times \\vec{F}\\) — cross product magnitude. All three are the same.',
      },
      {
        type: 'warning',
        title: 'Torque units look like energy — they are not the same',
        body:
          'Work W = F·d has units N·m = J. Torque τ = rF has units N·m. ' +
          'Numerically identical units, physically completely different. ' +
          'Work is a dot product (scalar). Torque is a cross product (vector). ' +
          'To avoid confusion, some texts write torque in N·m and energy in J.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: work done by a torque',
        body:
          'When a torque \\(\\tau\\) rotates an object by angle \\(d\\theta\\): \\(dW = \\tau\\,d\\theta\\). ' +
          'For constant torque: \\(W = \\tau\\theta\\). ' +
          'For variable torque: \\(W = \\int\\tau\\,d\\theta\\). ' +
          'This mirrors \\(W = \\int F\\,dx\\) — the rotational version of work.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'torque-lever' },
        title: 'Lever arm and torque — drag the force position',
        caption:
          'Drag the point where force is applied. Watch torque = r × F sin θ update. ' +
          'At the hinge (r = 0): τ = 0. At the far edge (maximum r): maximum τ. ' +
          'Change the angle θ: perpendicular gives maximum torque; parallel gives zero.',
      },
    ],
  },

  math: {
    prose: [
      'Torque about an axis: \\(\\tau = rF\\sin\\theta\\), where \\(r\\) is the distance from axis to point of force application, ' +
        '\\(F\\) is the force magnitude, and \\(\\theta\\) is the angle between \\(\\vec{r}\\) and \\(\\vec{F}\\).',
      'For a system in **rotational equilibrium**, the net torque about any axis must be zero:',
      '\\(\\sum \\tau = 0 \\quad \\Leftrightarrow \\quad \\alpha = 0\\)',
      'This extends statics (Chapter 4) to rotating systems: a balanced seesaw or a horizontal beam has zero net torque.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rotational equilibrium',
        body: '\\sum \\tau = 0 \\quad (\\text{and } \\sum \\vec{F} = 0 \\text{ for full static equilibrium})',
      },
      {
        type: 'mnemonic',
        title: 'Sign convention',
        body:
          'Counterclockwise torques: positive (+τ).\n' +
          'Clockwise torques: negative (−τ).\n' +
          'Set this convention at the start of every statics problem and never switch mid-problem.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'balanced-seesaw' },
        title: 'Seesaw balance — torque equilibrium',
        caption:
          'Move the masses and their positions. The seesaw balances when the clockwise and counterclockwise torques about the pivot are equal. ' +
          'A heavy child close to the pivot can be balanced by a lighter child far from it — the lever arm compensates for the mass difference.',
      },
    ],
  },

  rigor: {
    title: 'Why τ = r × F (cross product definition)',
    proofSteps: [
      {
        expression: 'W = \\vec{F}\\cdot d\\vec{s} = F\\,ds\\cos\\phi',
        annotation: 'Work done by force F through arc displacement ds = r dθ.',
      },
      {
        expression: 'dW = F\\,r\\,d\\theta\\,\\cos\\phi = F\\sin\\theta\\,r\\,d\\theta',
        annotation: 'Here φ is angle between F and ds (tangential direction). The tangential component of F is F sin θ, where θ is angle between r and F.',
      },
      {
        expression: 'dW = \\tau\\,d\\theta \\quad \\Rightarrow \\quad \\tau = rF\\sin\\theta',
        annotation: 'Defining torque as τ = rF sin θ makes the rotational work equation W = ∫τ dθ exactly mirror W = ∫F dx.',
      },
      {
        expression: '\\vec{\\tau} = \\vec{r}\\times\\vec{F}: \\;|\\vec{\\tau}| = rF\\sin\\theta, \\; \\text{direction by right-hand rule}',
        annotation: 'The cross product packages magnitude and direction into one vector. For 2D problems, we only need the magnitude.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-002-ex1',
      title: 'Opening a door — torque at different positions',
      problem:
        '\\text{A door is 0.9 m wide. A force of 30 N is applied perpendicular to the door at: ' +
        '(a) 0.9 m from hinge, (b) 0.3 m from hinge, (c) 0.9 m at 60° to the door plane.}',
      steps: [
        { expression: '\\tau_a = (0.9)(30)\\sin 90° = 27\\,\\text{N·m}', annotation: 'Maximum torque at far edge.' },
        { expression: '\\tau_b = (0.3)(30)\\sin 90° = 9\\,\\text{N·m}', annotation: '3× less torque — 3× harder to open.' },
        { expression: '\\tau_c = (0.9)(30)\\sin 60° = (0.9)(30)(0.866) = 23.4\\,\\text{N·m}', annotation: 'Angled force is less effective than perpendicular.' },
      ],
      conclusion: 'Maximum torque at far edge, perpendicular. This is why door handles are placed at the far edge.',
    },
    {
      id: 'ch7-002-ex2',
      title: 'Balanced beam — rotational equilibrium',
      problem:
        '\\text{A uniform 5 m beam (mass 20 kg) is supported at its center. ' +
        'A 40 kg weight hangs at 1 m from the left end. Where must a 50 kg weight hang to balance?}',
      steps: [
        {
          expression: '\\text{Pivot at center (2.5 m from each end). 40 kg is at }(2.5-1.0) = 1.5\\text{ m left of pivot.}',
          annotation: 'Set pivot as reference. Left of pivot is negative, right is positive (or choose your own convention).',
        },
        {
          expression: '\\sum\\tau = 0: -(40)(9.8)(1.5) + (50)(9.8)d = 0',
          annotation: 'Clockwise torque from 40 kg, counterclockwise from 50 kg. Beam weight through center contributes zero torque.',
        },
        {
          expression: 'd = \\frac{(40)(1.5)}{50} = 1.2\\,\\text{m right of pivot}',
          annotation: '1.2 m right of center = 3.7 m from left end.',
        },
      ],
      conclusion: '50 kg weight must be 1.2 m right of center (at 3.7 m from the left end).',
    },
  ],

  challenges: [
    {
      id: 'ch7-002-ch1',
      difficulty: 'easy',
      problem: '\\text{A 25 N force acts at the end of a 0.6 m wrench at 90° to the handle. Find the torque.}',
      hint: 'τ = rF sin θ. At 90°, sin 90° = 1.',
      walkthrough: [
        { expression: '\\tau = (0.6)(25)(1) = 15\\,\\text{N·m}', annotation: 'Perpendicular force → maximum torque.' },
      ],
      answer: 'τ = 15 N·m.',
    },
    {
      id: 'ch7-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 3 m horizontal bar is supported at one end. A 200 N weight hangs at 2 m from the support. ' +
        'A vertical cable at the far end holds the bar horizontal. Find the cable tension.}',
      hint: 'Take torques about the support point (left end). The cable tension creates a counterclockwise torque; the weight creates a clockwise torque.',
      walkthrough: [
        {
          expression: '\\sum\\tau_{\\text{left}} = 0: T(3) - 200(2) = 0',
          annotation: 'Cable at 3 m, weight at 2 m, both measured from support.',
        },
        {
          expression: 'T = 400/3 \\approx 133\\,\\text{N}',
          annotation: 'Less than the hanging weight — leverage at work.',
        },
      ],
      answer: 'T ≈ 133 N.',
    },
    {
      id: 'ch7-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A ladder (5 m, 30 kg) leans against a frictionless wall at 70° from horizontal. ' +
        'A 70 kg person stands 3.5 m up the ladder. Find: (a) wall normal force, (b) floor friction force.}',
      hint: 'Take torques about the base of the ladder. Wall normal force is horizontal at the top.',
      walkthrough: [
        {
          expression:
            '\\sum\\tau_{\\text{base}} = 0: N_w(5\\sin 70°) - (30)(9.8)(2.5\\cos 70°) - (70)(9.8)(3.5\\cos 70°) = 0',
          annotation: 'Torques about base: wall force (perpendicular distance = 5 sin 70°); weights (horizontal distances from base = L cos 70°).',
        },
        {
          expression:
            'N_w(4.698) = (294)(0.855) + (686)(1.197) = 251.4 + 821 = 1072.4 \\Rightarrow N_w = 228\\,\\text{N}',
          annotation: 'Wall normal force.',
        },
        {
          expression: '\\sum F_x = 0: f_{\\text{floor}} = N_w = 228\\,\\text{N}',
          annotation: 'Floor friction must balance the wall force.',
        },
      ],
      answer: 'N_wall ≈ 228 N; floor friction ≈ 228 N.',
    },
  ],
}
