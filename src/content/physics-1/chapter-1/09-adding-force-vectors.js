export default {
  id: 'p1-ch1-009', slug: 'adding-force-vectors-numerically', chapter: 1, order: 9,
  title: 'Adding Force Vectors Numerically',
  subtitle: 'DSMD meets Newton: find the net force and predict the motion.',
  tags: ['force vectors','net force','resultant force','Newton second law','equilibrium','free body diagram'],
  aliases: 'force addition net force resultant statics',
  hook: {
    question: 'Three ropes pull a ring: 50 N at 0°, 70 N at 130°, 40 N at 250°. Will the ring accelerate, and which way?',
    realWorldContext: 'Structural engineering, rocket thrust, biomechanics — every real force problem requires adding vector forces. The net force F⃗_net = ΣF⃗ determines acceleration via Newton\'s second law.',
    previewVisualizationId: 'ForceVectorIntuition',
  },
  videos: [{
    title: 'Physics 1 – Vectors (11 of 21) Adding Force Vectors Numerically',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'Every force on an object is a vector. Newton\'s second law $\\vec{F}_{net} = m\\vec{a}$ requires the **vector sum** of all forces — not the scalar sum of their magnitudes.',
      'The procedure is identical to adding any vectors: DSMD. The only new element is the **free body diagram** — a sketch showing all forces acting on the object with their magnitudes and angles.',
      'A system is in **equilibrium** ($\\vec{a}=0$) if and only if $\\vec{F}_{net} = \\vec{0}$, i.e. $\\sum F_x = 0$ AND $\\sum F_y = 0$ simultaneously.',
    ],
    callouts: [
      { type: 'definition', title: "Newton's second law (vector form)", body: '\\vec{F}_{net} = \\sum_i \\vec{F}_i = m\\vec{a}' },
      { type: 'definition', title: 'Equilibrium condition', body: '\\sum F_x = 0 \\quad\\text{AND}\\quad \\sum F_y = 0' },
      { type: 'warning', title: 'Do not add magnitudes', body: 'F_{net} \\ne F_1 + F_2 + \\cdots\\text{ unless all forces are parallel. Always add components.}' },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Free body diagram — forces as vectors',
        caption: 'Isolate the object. Draw every force as a labeled arrow: Normal N (up), Weight W (down), Applied F (angled), Friction f (opposing motion). Then DSMD gives the net force vector.',
      },
      { id: 'ForceVectorIntuition', title: 'Add up to 4 force vectors — see net force and equilibrium status', mathBridge: 'Net force arrow updates live. Green = significant net force; badge shows equilibrium when |F_net| < 0.1.', caption: 'This is a free body diagram in motion.', props: { maxForces: 4 } },
    ],
  },
  math: {
    prose: ['The component table for force problems adds one column: the force label (e.g. weight, normal, tension). This keeps bookkeeping clear in multi-force problems.'],
    callouts: [
      { type: 'theorem', title: 'Net force components', body: 'F_{net,x} = \\sum_i F_{ix} = \\sum_i |F_i|\\cos\\theta_i \\qquad F_{net,y} = \\sum_i F_{iy} = \\sum_i |F_i|\\sin\\theta_i' },
      { type: 'insight', title: 'Equilibrium check', body: 'After computing F_{net,x} and F_{net,y}, check: if both are zero (within rounding), the object is in equilibrium. If not, \\vec{a} = \\vec{F}_{net}/m.' },
    ],
    visualizations: [{ id: 'ForceComponentTable', title: 'Live force component table — add forces, check equilibrium', mathBridge: 'Edit forces and angles. The equilibrium badge turns green when ΣFₓ ≈ 0 and ΣFᵧ ≈ 0.', caption: 'The component table is the free body diagram in numeric form.' }],
  },
  rigor: {
    prose: ['Newton\'s second law is a vector equation: $\\vec{F}_{net}=m\\vec{a}$. Resolving into components gives two independent scalar equations: $F_{net,x}=ma_x$ and $F_{net,y}=ma_y$. These can be solved independently.'],
    callouts: [
      { type: 'theorem', title: 'Component form of Newton 2', body: '\\sum F_x = ma_x \\qquad \\sum F_y = ma_y' },
      { type: 'insight', title: 'Why components decouple', body: 'The x and y directions are independent in Newtonian mechanics. A horizontal net force produces only horizontal acceleration; vertical forces produce only vertical acceleration.' },
    ],
    visualizationId: 'ForceProof',
    proofSteps: [
      {
        title: "Net force is a vector sum",
        expression: "\\vec{F}_{\\text{net}} = \\sum_i \\vec{F}_i",
        annotation: "Every force is a vector. The net force is their vector sum — not the simple sum of their magnitudes.",
      },
      {
        title: "Expand into components",
        expression: "= \\sum_i (F_{ix} \\hat{i} + F_{iy} \\hat{j})",
        annotation: "Replace each force with its component form. We now have a sum of scalars times the basis vectors.",
      },
      {
        title: "Collect by axis",
        expression: "= (\\sum F_{ix}) \\hat{i} + (\\sum F_{iy}) \\hat{j}",
        annotation: "Group the i-terms together and the j-terms together. Each axis becomes its own independent sum.",
      },
      {
        title: "Newton's 2nd law per axis",
        expression: "\\sum F_x = ma_x \\quad \\text{and} \\quad \\sum F_y = ma_y",
        annotation: "The x and y equations can be solved independently. A net force in the x-direction affects only x-acceleration.",
      },
      {
        title: "Equilibrium condition",
        expression: "\\vec{a} = 0 \\iff \\sum F_x = 0 \\text{ AND } \\sum F_y = 0",
        annotation: "Zero net force requires every component to be zero simultaneously. One non-zero component is enough to cause acceleration.",
      },
    ],
    title: 'Why net force = sum of components',
    visualizations: [{ id: 'ForceProof', title: 'Force components combine independently', mathBridge: 'Each step highlights one axis of the force diagram.' }],
  },
  examples: [
    {
      id: 'ch1-009-ex1', title: 'Three forces on a ring',
      problem: '\\vec{F}_1=50\\,N@0°,\\;\\vec{F}_2=70\\,N@130°,\\;\\vec{F}_3=40\\,N@250°.\\text{ Find }\\vec{F}_{net}.',
      steps: [
        { expression: 'F_{1x}=50,\\;F_{1y}=0', annotation: '0° → full x.' },
        { expression: 'F_{2x}=70\\cos130°=-45.0,\\;F_{2y}=70\\sin130°=53.6', annotation: 'Q II: negative x.' },
        { expression: 'F_{3x}=40\\cos250°=-13.7,\\;F_{3y}=40\\sin250°=-37.6', annotation: 'Q III: both negative.' },
        { expression: 'F_{net,x}=50-45.0-13.7=-8.7\\,N,\\;F_{net,y}=0+53.6-37.6=16.0\\,N', annotation: 'Sum each column.' },
        { expression: '|\\vec{F}_{net}|=\\sqrt{8.7^2+16^2}=\\sqrt{75.7+256}=\\sqrt{331.7}\\approx18.2\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(16/-8.7)\\approx180°-61.5°=118.5°', annotation: 'Q II correction: add 180° to arctan result.' },
      ],
      conclusion: 'Net force ≈ 18.2 N at 118.5°. The ring accelerates in that direction.',
    },
  ],
  challenges: [
    { id: 'ch1-009-ch1', difficulty: 'easy', problem: '\\vec{F}_1=30\\,N\\text{ east, }\\vec{F}_2=40\\,N\\text{ north. Find }|\\vec{F}_{net}|.', hint: 'Perpendicular forces — Pythagorean theorem.', walkthrough: [{ expression: '|\\vec{F}_{net}|=\\sqrt{30^2+40^2}=50\\,N', annotation: '3-4-5 triple.' }], answer: '50\\,N\\text{ at }53.1°' },
    { id: 'ch1-009-ch2', difficulty: 'medium', problem: 'A 5 kg block has forces 20 N east and 15 N north. Find acceleration magnitude.', hint: 'Find F_net first, then a = F_net/m.', walkthrough: [{ expression: 'F_{net}=\\sqrt{20^2+15^2}=25\\,N', annotation: 'Net force.' }, { expression: 'a=25/5=5\\,m/s^2', annotation: 'Newton 2.' }], answer: 'a=5\\,m/s^2' },
  ],
}
