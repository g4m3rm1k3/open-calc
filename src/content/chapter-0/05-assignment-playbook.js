export default {
  id: 'ch0-assignment-playbook',
  slug: 'assignment-playbook',
  chapter: 0,
  order: 5,
  title: 'Assignment Playbook',
  subtitle: 'A fast map from problem type to the exact calculus workflow',
  tags: [
    'calc 1 workflow',
    'homework strategy',
    'assignment help',
    'problem types',
    'derivative checklist',
    'integral checklist',
    'related rates setup',
    'optimization setup',
    'implicit differentiation setup',
    'chain rule',
    'product rule',
    'quotient rule',
    'u-substitution',
    'net change',
  ],

  hook: {
    question: 'How do you know what method to use before doing any algebra?',
    realWorldContext:
      'Most calculus errors happen before the first derivative or integral is computed. The wrong setup guarantees the wrong answer. This playbook gives a quick decision path so you can classify a problem in under a minute, choose the right method, and keep your work readable for quizzes, homework, and exams.',
    previewVisualizationId: 'FunctionMachine',
  },

  intuition: {
    prose: [
      'Think of every problem as a translation task: words and diagrams -> function model -> operation (differentiate or integrate) -> interpretation with units.',
      'The fastest way to improve is to classify problem type first. If you skip this and start computing immediately, you often perform a correct technique on the wrong object.',
      'A strong default workflow is: identify target quantity, name variables, write governing equation, choose operation, then solve and unit-check.',
      'For graph-reading questions, derivatives are slope information and integrals are signed area accumulation. If the prompt emphasizes turning points, monotonicity, concavity, velocity/acceleration, or marginal change, you are in derivative territory. If it emphasizes net amount, total accumulation, average value, or area/work, you are in integral territory.',
    ],
    callouts: [
      {
        type: 'workflow',
        title: 'Universal 5-Step Workflow',
        body: '1) Name what is asked. 2) Define variables with units. 3) Build equation/model. 4) Differentiate/integrate with justification. 5) Interpret final value in context.',
      },
      {
        type: 'warning',
        title: 'Most Common Failure Mode',
        body: 'Students often compute first and interpret last. Reverse that: interpret first, compute second.',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Tips for Success in Flipped Classrooms + OMG BABY!!!",
        props: { url: "" }
      },],
  },

  math: {
    prose: [
      'Derivative-class problems typically ask for: instantaneous rate, tangent slope, max/min candidates, increasing/decreasing intervals, concavity, or optimization under constraints.',
      'Integral-class problems typically ask for: total change, accumulation over time, area between curves, average value on an interval, work from variable force, or total distance from velocity magnitude.',
      'Related rates pattern: (i) draw/define geometry, (ii) write a constraint equation linking variables, (iii) differentiate with respect to time, (iv) substitute known values at the instant, (v) solve for the requested rate with units.',
      'Optimization pattern: (i) define objective function, (ii) use constraints to reduce to one variable, (iii) find critical points and boundary values, (iv) justify max/min choice, (v) report with units and practical meaning.',
      'Implicit differentiation pattern: keep variables symbolic, apply chain rule whenever differentiating terms containing y, then solve algebraically for y\'(x).',
      'Integration setup checks: bounds correct, integrand models the intended quantity, and sign conventions are explicit. For total distance from velocity, use |v(t)| or split by sign changes.',
    ],
    callouts: [
      {
        type: 'checklist',
        title: 'Derivative Decision Checklist',
        body: 'Keywords: slope, tangent, instantaneous, rate at a point, critical point, maximize/minimize, concavity, inflection, velocity from position, acceleration from velocity.',
      },
      {
        type: 'checklist',
        title: 'Integral Decision Checklist',
        body: 'Keywords: total, accumulated, net change, area, average value, work, displacement over interval, total distance, consumer surplus.',
      },
      {
        type: 'exam-tip',
        title: 'Before Final Answer',
        body: 'State the meaning of the number in one sentence and include units. This catches many setup mistakes early.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The playbook rests on two structural theorems. First, derivatives are local linear models: f\'(a) is the best first-order rate at x=a. Second, definite integrals are limits of sums, and FTC links them to antiderivatives, turning accumulation into endpoint evaluation.',
      'When you classify correctly, your algebra has a valid target. When classification is wrong, even flawless algebra returns an irrelevant number.',
      'Method selection is therefore not a soft skill; it is part of mathematical correctness.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Net Change Theorem Reminder',
        body: '\\(\\int_a^b F\'(x)\\,dx = F(b)-F(a)\\). Integrate rates to recover change in the underlying quantity.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch0-assignment-playbook-ex1',
      title: 'Classify Before Computing',
      problem: 'Prompt: "Find the maximum area of a rectangle under a fixed perimeter." Which method class applies?',
      steps: [
        { expression: 'Target is an extreme value (maximum).', annotation: 'This signals optimization, a derivative-class problem.' },
        { expression: 'Define objective A(x) and constraint equation from perimeter.', annotation: 'Convert to one-variable objective.' },
        { expression: 'Differentiate A, solve A\'(x)=0, then test boundaries/feasibility.', annotation: 'Standard optimization workflow.' },
      ],
      conclusion: 'Classification: derivative-class -> optimization pipeline.',
    },
    {
      id: 'ch0-assignment-playbook-ex2',
      title: 'Net Change vs Total Distance',
      problem: 'Prompt: "A particle has velocity v(t). Find displacement and total distance on [a,b]."',
      steps: [
        { expression: '\\text{Displacement}=\\int_a^b v(t)\\,dt', annotation: 'Signed area gives net position change.' },
        { expression: '\\text{Distance}=\\int_a^b |v(t)|\\,dt', annotation: 'Magnitude accumulation gives total path length.' },
        { expression: 'Split interval at zeros of v if needed.', annotation: 'Equivalent to absolute-value approach.' },
      ],
      conclusion: 'Same velocity data, two different integrals because the questions ask different physical quantities.',
    },
  ],

  challenges: [
    {
      id: 'ch0-assignment-playbook-ch1',
      difficulty: 'medium',
      problem: 'Classify and outline method only (no full computation): "Given V(r)=4/3*pi*r^3, estimate change in volume from a small radius error dr at r=10 cm."',
      hint: 'This is a local-change question, so use differential/derivative structure.',
      walkthrough: [
        { expression: 'Recognize local approximation request.', annotation: 'Derivative-class (linear approximation / differentials).' },
        { expression: 'Compute dV = V\'(r)dr = 4\\pi r^2 dr.', annotation: 'Evaluate at r=10 with given dr.' },
      ],
      answer: 'Derivative-class: use differentials/linearization, not a definite integral.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'differentiation-rules', label: 'Differentiation Rules', context: 'Use when classifying into derivative mechanics and symbolic rules.' },
    { lessonSlug: 'chain-rule', label: 'Chain Rule', context: 'For nested functions and implicit derivatives with compositions.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'For relation-defined curves and many related-rates setups.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'For time-linked variables and changing geometry.' },
    { lessonSlug: 'optimization', label: 'Optimization', context: 'For max/min design and resource constraints.' },
    { lessonSlug: 'definite-integral', label: 'Definite Integral', context: 'For accumulation and area as limits of sums.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'For net change, area between curves, work, and economic surplus.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-medium',
  ],
}
