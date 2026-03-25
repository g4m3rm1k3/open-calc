// ch2-002-kinematic-equations.js
export const ch2_002 = {
  id: 'ch2-002', slug: 'kinematic-equations', chapter: 2, order: 2,
  title: 'Kinematic Equations',
  subtitle: 'The five equations that solve every constant-acceleration problem.',
  tags: ['kinematic equations','SUVAT','constant acceleration','equations of motion'],
  aliases: 'suvat equations of motion big five kinematics',
  hook: {
    question: 'A car accelerates from rest at 3 m/s² for 5 s. How far does it travel? You need the kinematic equations.',
    realWorldContext: 'These five equations are the engine of classical mechanics. Every projectile, every braking distance, every rocket launch uses them.',
    previewVisualizationId: 'KinematicEquationsIntuition',
  },
  videos: [{
    title: 'Physics 2 – Motion in One Dimension (2 of 22) Equations in Kinematics',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],
  intuition: {
    prose: [
      'When acceleration is **constant**, four quantities are related: displacement $\\Delta x$, initial velocity $v_0$, final velocity $v$, acceleration $a$, and time $t$. Any three known quantities let you find the other two.',
      'There are five equations, each leaving out one of the five variables. Identify what\'s missing from the problem, pick the equation that doesn\'t need it.',
    ],
    callouts: [
      { type: 'definition', title: 'The five kinematic equations', body: 'v = v_0 + at \\quad (1)\\\\\\Delta x = \\tfrac{1}{2}(v_0+v)t \\quad (2)\\\\\\Delta x = v_0t + \\tfrac{1}{2}at^2 \\quad (3)\\\\\\Delta x = vt - \\tfrac{1}{2}at^2 \\quad (4)\\\\v^2 = v_0^2 + 2a\\Delta x \\quad (5)' },
      { type: 'mnemonic', title: 'SUVAT', body: 's = displacement (Δx), u = initial velocity (v₀), v = final velocity, a = acceleration, t = time. Each equation omits one.' },
      { type: 'warning', title: 'Only valid for constant acceleration', body: 'These equations break down the moment acceleration changes. For variable acceleration, use calculus (integration).' },
    ],
    visualizations: [{ id: 'KinematicEquationsIntuition', title: 'Pick a missing variable — the right equation highlights', mathBridge: 'Select which quantity is unknown. The viz highlights the equation that doesn\'t contain it.', caption: 'One missing variable → one equation.' }],
  },
  math: {
    prose: ['The equations are derived from the definitions of velocity and acceleration assuming $a = \\text{const}$:'],
    callouts: [
      { type: 'theorem', title: 'Derivation of equation 3', body: '\\Delta x = \\int_0^t v\\,dt = \\int_0^t (v_0+at)\\,dt = v_0t + \\tfrac{1}{2}at^2' },
      { type: 'theorem', title: 'Derivation of equation 5', body: 'v^2 = v_0^2 + 2a\\Delta x\\text{ — eliminates }t\\text{ using eq 1 and 3}' },
    ],
    visualizations: [{ id: 'KinematicEquationSelector', title: 'Interactive equation chooser', mathBridge: 'Input known quantities, get the equation and answer.', caption: 'SUVAT in action.' }],
  },
  rigor: {
    prose: ['All five equations follow from two fundamental relations: $v = v_0 + at$ and $\\Delta x = v_0 t + \\frac{1}{2}at^2$. The other three are algebraic rearrangements.'],
    callouts: [{ type: 'insight', title: 'Only two are independent', body: 'Equations 1 and 3 are the two primary equations. Equations 2, 4, and 5 are derived by combining them. You only ever need to memorise two.' }],
    visualizationId: 'KinematicProof',
    proofSteps: [
      { expression: 'a = \\text{const} \\implies v(t) = v_0 + at', annotation: 'Integrate constant acceleration. This is equation 1.' },
      { expression: '\\Delta x = \\int_0^t v\\,dt = v_0t + \\tfrac{1}{2}at^2', annotation: 'Integrate velocity. This is equation 3.' },
      { expression: 'v^2 = (v_0+at)^2 = v_0^2 + 2av_0t + a^2t^2 = v_0^2 + 2a(v_0t+\\tfrac{1}{2}at^2)', annotation: 'Square equation 1 and substitute equation 3.' },
      { expression: '\\therefore\\; v^2 = v_0^2 + 2a\\Delta x', annotation: 'Equation 5 — time eliminated.' },
    ],
    title: 'Deriving the kinematic equations from first principles',
    visualizations: [{ id: 'KinematicProof', title: 'Each derivation step animated', mathBridge: 'Watch the integral produce each equation in sequence.' }],
  },
  examples: [
    { id: 'ch2-002-ex1', title: 'Car accelerates from rest', problem: 'v_0=0,\\;a=3\\,\\text{m/s}^2,\\;t=5\\,\\text{s. Find }\\Delta x\\text{ and }v.', steps: [{ expression: 'v = 0+3(5) = 15\\,\\text{m/s}', annotation: 'Equation 1.' }, { expression: '\\Delta x = 0(5)+\\tfrac{1}{2}(3)(25) = 37.5\\,\\text{m}', annotation: 'Equation 3.' }], conclusion: 'v = 15 m/s, Δx = 37.5 m.' },
    { id: 'ch2-002-ex2', title: 'Braking distance', problem: 'v_0=30\\,\\text{m/s},\\;v=0,\\;a=-6\\,\\text{m/s}^2\\text{. Find }\\Delta x.', steps: [{ expression: '0 = 900 + 2(-6)\\Delta x', annotation: 'Equation 5 — time unknown, not needed.' }, { expression: '\\Delta x = 900/12 = 75\\,\\text{m}', annotation: 'Braking distance.' }], conclusion: 'Δx = 75 m.' },
  ],
  challenges: [
    { id: 'ch2-002-ch1', difficulty: 'easy', problem: 'v_0=10,\\;a=2,\\;t=3.\\text{ Find }v\\text{ and }\\Delta x.', hint: 'Equations 1 and 3.', walkthrough: [{ expression: 'v=16\\,\\text{m/s},\\;\\Delta x=39\\,\\text{m}', annotation: 'Direct substitution.' }], answer: 'v=16\\,\\text{m/s},\\;\\Delta x=39\\,\\text{m}' },
    { id: 'ch2-002-ch2', difficulty: 'hard', problem: 'A stone is thrown upward at 20 m/s. Find max height and time to return.', hint: 'At max height, v=0. Use a=−9.8 m/s².', walkthrough: [{ expression: 'v^2=400-2(9.8)h\\implies h\\approx20.4\\,\\text{m}', annotation: 'Equation 5.' }, { expression: 't_{up}=20/9.8\\approx2.04\\,\\text{s},\\;t_{total}\\approx4.08\\,\\text{s}', annotation: 'Equation 1 then double.' }], answer: 'h\\approx20.4\\,\\text{m},\\;t\\approx4.08\\,\\text{s}' },
  ],
}

export default ch2_002
