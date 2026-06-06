export default {
  id: 'p0-001',
  slug: 'what-is-physics',
  chapter: 'p0',
  order: 0,
  title: 'What Is Physics?',
  subtitle: 'How humans learned to predict the future by building models of reality.',
  tags: ['modeling', 'assumptions', 'prediction', 'Galileo', 'Newton', 'scientific method', 'idealization'],

  hook: {
    question:
      'A feather and a bowling ball are dropped from the same height at the same moment. Which hits the ground first? For 2,000 years the answer was obvious to every educated person on Earth — the bowling ball, of course. It\'s heavier. Aristotle said so. Then one man climbed a tower, dropped two cannonballs of different weights, and watched them hit the ground at exactly the same time. Everything changed. Why was everyone wrong for two millennia — and what exactly did Galileo do that nobody had done before?',
    realWorldContext:
      'Physics is the reason your phone knows where you are, why airplanes don\'t fall out of the sky, why nuclear power plants work, why MRI machines can see inside your body without cutting you open, and why the internet can send information at the speed of light through glass cables. Every piece of technology you use descended from someone asking "why does that happen?" and then doing the experiment to find out.',
    previewVisualizationId: 'ModelVsReality',
  },

  intuition: {
    prose: [
      '**The 2,000-year mistake — and what it teaches us. ** Aristotle was the smartest person of his era. He had a theory for why heavy objects fall faster: everything in the universe wants to reach its natural place. Heavy objects have more "earth" in them, so they want to reach the ground more urgently. It was a beautiful, logical argument. It felt right. And for 2,000 years, nobody bothered to test it — because *of course* it was right. Aristotle said so. This is the first lesson of physics: **authority is not evidence**. A beautiful argument that contradicts experiment is wrong. Full stop.',

      '**Galileo\'s revolution: making physics a science. ** Around 1590, Galileo Galilei did something radical. Instead of arguing from logic, he did experiments. He rolled balls down inclined ramps (slow enough to measure with a water clock), and he found that the distance covered grew as the *square* of the time elapsed — not linearly. A ball rolling for 2 seconds covered 4 times the distance of one rolling for 1 second. 3 seconds: 9 times the distance. This was not common sense. It was a discovery. Galileo also introduced something else revolutionary: **idealization**. He imagined perfectly smooth ramps, perfectly round balls, no air resistance. Real ramps are rough. Real balls wobble. But the idealized version revealed the underlying pattern — and the underlying pattern is what physics is actually about.',

      '**What a model is — and what it isn\'t. ** A physics model is not a perfect copy of reality. It is a *simplified version* that keeps the dominant causes and throws away weak effects. When you drop a bowling ball, gravity dominates. Air resistance is tiny in comparison. So the model says: ignore air resistance. The model gives you an answer that is *close enough to be useful*. An engineer designing a building doesn\'t need the exact air resistance on every molecule of concrete. They need to know if the building will stand. The model is a tool — and like all tools, it has a job it\'s good at and situations where it breaks down.',

      '**The model-building loop — how physics actually works. ** Physics has a four-step cycle that has powered every discovery from Galileo to gravitational waves: **(1) Observe** — look at the world carefully and notice a pattern. **(2) Model** — build a simplified mathematical description that captures the pattern. **(3) Predict** — use the model to calculate something you haven\'t measured yet. **(4) Test** — do the experiment and check if the prediction is right. If the prediction fails, refine or replace the model and repeat. This loop never ends. Newton\'s model of gravity was "correct" for 200 years — then Einstein showed it broke down near massive stars. Einstein\'s model is "correct" — until we find where it breaks. Progress in physics is not about finding perfect models. It is about finding better ones.',

      '**Newton and the laws that ran the world. ** Isaac Newton (1643–1727) built on Galileo\'s experiments and created a mathematical framework so powerful it predicted the orbits of planets, the tides of oceans, and the trajectory of cannonballs — all from three simple laws. Newton\'s laws ran engineering for 250 years. Bridges, steam engines, factories, railroads, ships — all classical mechanics applied. When NASA launched the Apollo missions in 1969, they used Newton\'s equations. Newton\'s model is not "wrong" — it is an excellent approximation for objects moving much slower than light and not too close to a black hole. This is exactly what physics models are: *good enough for a domain*.',

      '**Where you are in the story, and where this course is going. ** You are starting physics from the very beginning — from Galileo\'s ramps. By the time you finish, you will understand Newton\'s three laws, energy, momentum, rotation, waves, and the mathematical language that connects them all. Calculus is part of that language — but you don\'t need it to start. We will build it in alongside the physics, teaching the mathematical tools exactly when you need them. Everything connects. Nothing is arbitrary. Physics is not a collection of formulas to memorize. It is a way of thinking — and this lesson is where that thinking starts.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 8 — Chapter 0: Orientation',
        body:
          '**This lesson:** What physics is, how models work, the Galileo story.\\n**Next (Lesson 2):** Units and dimensions — the grammar of physics equations.\\n**Chapter 1:** Kinematics — using equations to describe and predict motion.\\n**The arc:** Every chapter after this builds on the model-building habit you\'re starting here.',
      },
      {
        type: 'definition',
        title: 'What a physics model is',
        body:
          '\\text{A model is a simplified mathematical description of a physical system.}\\\\\\text{It keeps dominant causes and drops weak effects.}\\\\\\text{Its job: make accurate predictions within a defined domain.}',
      },
      {
        type: 'insight',
        title: 'The four-step physics cycle',
        body:
          '\\text{Observe} \\rightarrow \\text{Model} \\rightarrow \\text{Predict} \\rightarrow \\text{Test} \\rightarrow \\text{Repeat}\\\\\\text{Every discovery in physics follows this loop.}',
      },
      {
        type: 'insight',
        title: 'Galileo\'s two gifts to science',
        body:
          '\\text{1. Experiment beats authority: check claims against reality.}\\\\\\text{2. Idealization: strip away weak effects to reveal the core pattern.}',
      },
      {
        type: 'warning',
        title: 'A model that fails outside its domain is not "wrong" — it\'s limited',
        body:
          'Newton\'s gravity is not wrong for dropping a ball. It is wrong near a neutron star. Every model has a domain of validity. Knowing that domain is as important as knowing the model itself.',
      },
      {
        type: 'real-world',
        title: 'How far Newton\'s model reaches',
        body:
          '\\text{Newton\'s laws were published in 1687.}\\\\\\text{They were used to land on the Moon in 1969 — 282 years later.}\\\\\\text{The Apollo trajectory calculation used } F = ma \\text{ essentially unchanged.}',
      },
    ],
    visualizations: [
      {
        id: 'ModelVsReality',
        title: 'Same drop, different models — toggle air resistance',
        mathBridge:
          'Step 1: Click "No air resistance" and watch the ball fall. Note how long it takes. Step 2: Click "With air resistance" and watch the same drop. The ball takes longer. Step 3: Now drag the density slider. Feather (low density) → huge difference. Bowling ball (high density) → almost no difference. The key lesson: the no-air-resistance model is excellent for dense objects, poor for light ones. This is what "domain of validity" means — not that the model is wrong, but that it has limits.',
        caption: 'The simplest model (no drag) is accurate for dense objects and misleading for light ones. Every model has a domain.',
        props: { showAirResistance: false, interactive: true },
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The model chain: position, velocity, acceleration',
        mathBridge:
          'Before reading the diagram, ask yourself: what three things would you need to describe motion completely? The chain shows the answer: where something is (position x), how fast it\'s moving (velocity v), and what\'s causing that speed to change (acceleration a). The arrows show that calculus connects these — but we will build that connection from algebra first, before we ever write a derivative.',
        caption: 'Physics models motion through three linked quantities: position, velocity, and acceleration. They form a chain — change one and the others respond.',
      },
      {
        id: 'FreeFallExplorer',
        title: 'Free fall explorer — drag the time slider',
        mathBridge:
          'Move the time slider and watch the position, velocity, and x = ½gt² value update in real time. Notice how the position curve bends — it is not a straight line because the object keeps accelerating. The velocity increases linearly (constant acceleration). Connect these two curves to x = ½gt²: the position curve is exactly ½ × 9.8 × t².',
        caption: 'Every point on the position curve satisfies x = ½gt². The velocity curve (v = gt) is its derivative — the slope of position at that instant.',
      },
    ],
  },

  math: {
    prose: [
      '**Variables, proportions, and the language of prediction. **',
      'A variable is a symbol that stands for a measurable quantity. In physics, the most important variables in mechanics are: \\(x\\) for position (measured in meters), \\(t\\) for time (measured in seconds), \\(v\\) for velocity (meters per second), \\(a\\) for acceleration (meters per second squared), and \\(m\\) for mass (kilograms).',
      'Galileo discovered that the distance an object falls from rest is proportional to the square of the time: \\(x \\propto t^2\\). This means if you double the time, the distance quadruples. Triple the time — nine times the distance. The full equation (which we will derive properly in Chapter 1) is: \\(x = \\frac{1}{2}at^2\\).',
      'The constant \\(a\\) is the acceleration due to gravity, which Galileo measured (roughly) and Newton later explained: \\(a = g \\approx 9.8 \\text{ m/s}^2\\). This is the same for all objects in free fall — bowling balls, feathers, and everything in between — provided air resistance is negligible.',
      '**Substituting into a model: the basic skill. **  Using a physics model means plugging numbers in for variables and computing the result. This is pure algebra — no calculus needed. If \\(x = \\frac{1}{2}(9.8)t^2\\) and you want to know how far an object falls in \\(t = 3\\) seconds: substitute \\(t = 3\\), compute \\(t^2 = 9\\), then \\(x = \\frac{1}{2}(9.8)(9) = 44.1 \\text{ m}\\). That\'s it. The model does the physics. The algebra does the arithmetic.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The five core variables of mechanics',
        body:
          'x \\text{ — position [m]}\\\\t \\text{ — time [s]}\\\\v \\text{ — velocity [m/s]}\\\\a \\text{ — acceleration [m/s}^2\\text{]}\\\\m \\text{ — mass [kg]}',
      },
      {
        type: 'theorem',
        title: 'Galileo\'s free-fall result (no air resistance)',
        body:
          'x = \\tfrac{1}{2}g t^2 \\qquad g = 9.8\\,\\text{m/s}^2\\\\\\text{distance doubles with every 1.4× increase in time (because } \\sqrt{2} \\approx 1.4\\text{)}\\\\\\text{holds for any object, any mass — as long as drag is negligible}',
      },
      {
        type: 'insight',
        title: 'Why x ∝ t² and not x ∝ t',
        body:
          '\\text{If distance were proportional to time (}x \\propto t\\text{), speed would be constant.}\\\\\\text{But free fall keeps getting faster — speed grows with time.}\\\\\\text{Accumulating speed means distance grows faster than time — hence } t^2.',
      },
      {
        type: 'definition',
        title: 'What ∝ means',
        body:
          'a \\propto b \\text{ means "a is proportional to b": double b → double a.}\\\\a \\propto b^2 \\text{ means "a is proportional to b squared": double b → quadruple a.}\\\\\\text{Proportionality tells you the shape of a relationship before you know the constant.}',
      },
      {
        type: 'mnemonic',
        title: 'The substitution checklist',
        body:
          '1. Write the model equation.\\n2. List what you know (write down numbers and units).\\n3. Identify what you want to find.\\n4. Substitute known values for variables.\\n5. Compute the arithmetic.\\n6. Check the units in your answer.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'x = ½gt² — distance vs time for free fall',
        mathBridge:
          'The curve shows distance fallen vs time. Notice it curves upward — distance grows faster and faster. At t = 1 s: about 4.9 m. At t = 2 s: about 19.6 m (four times as much). At t = 3 s: about 44.1 m (nine times as much). This curvature is the signature of t² — it is not a straight line because the object keeps accelerating. A straight-line x-t graph would mean constant speed. The curve tells you there is acceleration.',
        caption: 'x = ½(9.8)t². The curve bends upward because speed keeps increasing — this is what acceleration looks like on an x-t graph.',
        props: { expression: '0.5*9.8*x*x', variable: 't', xMin: 0, xMax: 4, label: 'x (m)' },
      },
    ],
  },

  rigor: {
    title: 'Why all objects fall at the same rate: the logic behind Galileo\'s result',
    prose: [
      'This is one of the most surprising results in all of physics. Here is the logical argument — no calculus required, just careful reasoning.',
    ],
    proofSteps: [
      {
        expression: '\\text{Assume heavier objects fall faster (Aristotle\'s claim).}',
        annotation:
          'Start by assuming Aristotle is right. We will derive a contradiction — a logical impossibility — which means the assumption must be wrong.',
      },
      {
        expression: '\\text{Take a heavy stone (H) and a light stone (L). By assumption: } v_H > v_L.',
        annotation: 'Concrete setup. Heavy stone falls faster than the light one.',
      },
      {
        expression: '\\text{Now tie them together. The combined object has mass } m_H + m_L > m_H.',
        annotation: 'The combined object is heavier than the heavy stone alone. So by Aristotle\'s rule, it should fall faster than H.',
      },
      {
        expression:
          '\\text{But: the slow stone (L) drags on the fast stone (H), slowing the pair down.}\\\\\\text{So the combined object should fall slower than H alone.}',
        annotation:
          'This is the contradiction. If heavier = faster, the combined object should be fastest. But if the light stone retards the heavy one, the pair should be slower. These two conclusions cannot both be true. Aristotle\'s assumption leads to a logical impossibility.',
      },
      {
        expression:
          '\\text{Contradiction. The only escape: all objects fall at the same rate regardless of mass.}',
        annotation:
          'Galileo\'s insight: this thought experiment — done on paper, not in a lab — already defeats Aristotle. The experiment confirms it. This argument is called a "reductio ad absurdum" — reduce the assumption to an absurdity to disprove it.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-001-ex1',
      title: 'Free fall: how far does an object fall in 2 seconds?',
      problem:
        '\\text{An object is dropped from rest. Using } x = \\tfrac{1}{2}(9.8)t^2, \\text{ find how far it falls in } t = 2 \\text{ s.}',
      steps: [
        {
          expression: 'x = \\tfrac{1}{2}(9.8)(2)^2',
          annotation:
            'Substitute t = 2 s into the model. Write out every step — do not skip the squaring.',
        },
        {
          expression: 'x = \\tfrac{1}{2}(9.8)(4)',
          annotation: '2² = 4. Always square before multiplying.',
        },
        {
          expression: 'x = \\tfrac{1}{2}(39.2) = 19.6\\,\\text{m}',
          annotation: 'Multiply 9.8 × 4 = 39.2, then take half. Answer: 19.6 m.',
        },
      ],
      conclusion:
        'The object falls 19.6 m — about the height of a 6-story building — in just 2 seconds. This shows how fast free fall accelerates.',
    },
    {
      id: 'p0-001-ex2',
      title: 'The proportionality rule: doubling time',
      problem:
        '\\text{An object falls } 19.6 \\text{ m in } 2 \\text{ s. Without computing, predict how far it falls in } 4 \\text{ s.}',
      steps: [
        {
          expression: '\\text{Because } x \\propto t^2, \\text{ doubling } t \\text{ multiplies } x \\text{ by } 2^2 = 4.',
          annotation:
            'This is the power of proportionality reasoning. You don\'t need to recompute from scratch — you just reason about ratios.',
        },
        {
          expression: 'x(4\\,\\text{s}) = 4 \\times x(2\\,\\text{s}) = 4 \\times 19.6 = 78.4\\,\\text{m}',
          annotation: 'Four times the distance in twice the time. The t² relationship does the work.',
        },
      ],
      conclusion:
        'Proportionality reasoning is a physicist\'s superpower. Once you know the shape of a relationship (like x ∝ t²), you can predict how the answer scales without recalculating everything.',
    },
    {
      id: 'p0-001-ex3',
      title: 'Finding time from distance — working backwards',
      problem:
        '\\text{You drop a coin into a well and hear a splash after } 3 \\text{ s. How deep is the well? (Ignore the travel time of sound.)}',
      steps: [
        {
          expression: 'x = \\tfrac{1}{2}(9.8)(3)^2',
          annotation: 'Substitute t = 3 s. The problem gives us time, we want depth.',
        },
        {
          expression: 'x = \\tfrac{1}{2}(9.8)(9) = \\tfrac{1}{2}(88.2)',
          annotation: '3² = 9. Then 9.8 × 9 = 88.2.',
        },
        {
          expression: 'x = 44.1\\,\\text{m}',
          annotation:
            'The well is about 44 m deep. For context: a 14-story building is about 42 m. Note the model assumption: we ignored how long the sound takes to travel back up. For a 44 m well, sound (343 m/s) takes about 0.13 s — small but nonzero. A better model would account for this.',
        },
      ],
      conclusion:
        '44 m. And notice: we just identified a place where the model could be improved. This is the model-building habit — always ask "what did we ignore, and does it matter?"',
    },
    {
      id: 'p0-001-ex4',
      title: 'Identifying model assumptions',
      problem:
        '\\text{A skydiver jumps from a plane and falls for } 10 \\text{ s. The model } x = \\tfrac{1}{2}(9.8)(10)^2 = 490 \\text{ m. The actual distance fallen is about 400 m. What is the model missing?}',
      steps: [
        {
          expression: '\\text{Model predicts: } x = \\tfrac{1}{2}(9.8)(100) = 490\\,\\text{m}',
          annotation: 'Straightforward substitution. The model says 490 m.',
        },
        {
          expression: '\\text{Reality: } \\approx 400\\,\\text{m}',
          annotation: 'The skydiver fell less far than the model predicted.',
        },
        {
          expression: '\\text{Error} = 490 - 400 = 90\\,\\text{m}, \\text{ about } 18\\% \\text{ overestimate.}',
          annotation:
            'The model overestimates because it ignores air resistance. A skydiver (arms out) experiences significant drag — especially after the first few seconds when speed builds up. The simple model is wrong because air resistance is NOT negligible for a human body at terminal velocity.',
        },
      ],
      conclusion:
        'The model x = ½gt² assumes no air resistance. For a skydiver, that assumption breaks down badly by the 10-second mark. A better model adds a drag term. This is exactly the model-building loop in action: test → failure → refine.',
    },
  ],

  challenges: [
    {
      id: 'p0-001-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Using } x = \\tfrac{1}{2}(9.8)t^2, \\text{ how far does an object fall in 5 seconds?}',
      hint:
        'Substitute t = 5 s. Remember to square t first, then multiply by 9.8, then take half.',
      walkthrough: [
        {
          expression: 'x = \\tfrac{1}{2}(9.8)(5)^2 = \\tfrac{1}{2}(9.8)(25)',
          annotation: '5² = 25.',
        },
        {
          expression: 'x = \\tfrac{1}{2}(245) = 122.5\\,\\text{m}',
          annotation: '9.8 × 25 = 245, divide by 2.',
        },
      ],
      answer: 'x = 122.5 m',
    },
    {
      id: 'p0-001-ch2',
      difficulty: 'medium',
      problem:
        '\\text{An object falls from rest and covers 80 m. Using } x = \\tfrac{1}{2}(9.8)t^2, \\text{ how long did it fall?}',
      hint:
        'You know x, you want t. Rearrange the equation: t² = 2x/g. Then take the square root.',
      walkthrough: [
        {
          expression: '80 = \\tfrac{1}{2}(9.8)t^2',
          annotation: 'Write the model with x = 80.',
        },
        {
          expression: 't^2 = \\frac{2(80)}{9.8} = \\frac{160}{9.8} \\approx 16.33',
          annotation: 'Rearrange: multiply both sides by 2, divide by 9.8.',
        },
        {
          expression: 't = \\sqrt{16.33} \\approx 4.04\\,\\text{s}',
          annotation: 'Take the square root. Always take the positive root (time is positive).',
        },
      ],
      answer: 't ≈ 4.04 s',
    },
    {
      id: 'p0-001-ch3',
      difficulty: 'hard',
      problem:
        '\\text{On the Moon, gravity is } g_{Moon} = 1.6\\,\\text{m/s}^2 \\text{ (about 1/6 of Earth\'s). An astronaut drops a wrench from 10 m height. (a) How long does it take to hit the Moon\'s surface? (b) How much longer is that than on Earth? (c) Why does this support Galileo, not Aristotle?}',
      hint:
        'Use t² = 2x/g with the appropriate g for each location. For part (c): the wrench and a feather would hit at exactly the same time on the Moon (no atmosphere = no air resistance).',
      walkthrough: [
        {
          expression: 't_{Moon}^2 = \\frac{2(10)}{1.6} = 12.5 \\Rightarrow t_{Moon} = \\sqrt{12.5} \\approx 3.54\\,\\text{s}',
          annotation: 'Moon gravity is 1.6 m/s². Takes much longer.',
        },
        {
          expression: 't_{Earth}^2 = \\frac{2(10)}{9.8} \\approx 2.04 \\Rightarrow t_{Earth} \\approx 1.43\\,\\text{s}',
          annotation: 'Same height, Earth gravity.',
        },
        {
          expression: '\\text{Difference: } 3.54 - 1.43 = 2.11\\,\\text{s longer on the Moon.}',
          annotation: 'The Moon astronaut waits about 2 extra seconds.',
        },
        {
          expression: '\\text{On the Moon: no air, so a feather and a wrench fall identically. Galileo confirmed.}',
          annotation:
            'Apollo 15 astronaut David Scott actually did this experiment live on the Moon in 1971 — dropped a feather and a hammer. They hit at exactly the same time.',
        },
      ],
      answer:
        '(a) ≈ 3.54 s on Moon. (b) About 2.11 s longer than on Earth. (c) Without air resistance, mass is irrelevant — all objects fall together.',
    },
  ],

  semantics: {
    core: [
      {
        symbol: 'x',
        meaning: 'position — where the object is, measured from a reference point, in meters',
      },
      {
        symbol: 't',
        meaning: 'time — when the measurement is taken, in seconds from some starting moment',
      },
      {
        symbol: 'g',
        meaning: 'gravitational acceleration near Earth\'s surface — 9.8 m/s², the same for all objects',
      },
      {
        symbol: 'x \\propto t^2',
        meaning:
          '"x is proportional to t squared" — doubling t multiplies x by 4; tripling t multiplies x by 9',
      },
      {
        symbol: 'model',
        meaning: 'a simplified mathematical description of a physical system, valid within a specific domain',
      },
      {
        symbol: 'idealization',
        meaning:
          'deliberately ignoring weak effects (air resistance, friction) to expose the dominant physics',
      },
    ],
    rulesOfThumb: [
      'Always write the full equation first, then substitute — never substitute mentally while writing.',
      'Square before multiplying: in x = ½gt², compute t² first, then multiply by g, then by ½.',
      'When a model gives a wrong answer, don\'t panic — ask what assumption failed.',
      'Proportionality (∝) lets you predict scaling without recalculating: if x ∝ t², tripling t gives 9x.',
      'Check your answer with a reality check: does the number make physical sense? 500 km of free fall in 1 second is impossible.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-002',
        label: 'Units and Dimensions (Lesson 2)',
        note:
          'If the algebra above feels shaky, Lesson 2 on units will solidify the notation — every variable has a physical type, and checking those types catches algebra errors early.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch1-001',
        label: 'Ch. 1: Kinematics — Constant Acceleration',
        note:
          'The equation x = ½gt² introduced here is a special case of the full SUVAT equation x = v₀t + ½at². Chapter 1 derives all five SUVAT equations from the same model-building logic you learned here.',
      },
      {
        lessonId: 'p1-ch2-001',
        label: 'Ch. 2: Newton\'s Laws',
        note:
          'Galileo measured g = 9.8 m/s² experimentally. Newton\'s Second Law (F = ma) explains why — gravity exerts a force F = mg on every mass m, giving acceleration a = g.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-001-assess-1',
        type: 'input',
        text: 'Using x = ½(9.8)t², how far does an object fall in 1 second?',
        answer: '4.9',
        hint: 'Substitute t = 1. Then 1² = 1, so x = ½ × 9.8 × 1.',
      },
      {
        id: 'p0-001-assess-2',
        type: 'choice',
        text: 'Galileo\'s most important methodological contribution to science was:',
        options: [
          'Proving Aristotle wrong in a public debate',
          'Replacing observation and experiment with logical argument',
          'Using experiment and idealization to discover mathematical patterns in nature',
          'Calculating the exact value of g = 9.8 m/s²',
        ],
        answer: 'Using experiment and idealization to discover mathematical patterns in nature',
        hint: 'Galileo\'s revolution was not about Aristotle — it was about how you find out what is true.',
      },
      {
        id: 'p0-001-assess-3',
        type: 'input',
        text: 'If an object falls 20 m in 2 s, how far will it fall in 6 s? (Use proportionality: x ∝ t².)',
        answer: '180',
        hint: '6 s is 3× the original 2 s. So x multiplies by 3² = 9. What is 9 × 20?',
      },
    ],
  },

  formulas: [
    {
      id: 'p0-001-f1',
      latex: 'x = \\tfrac{1}{2}g t^2',
      description: 'Distance fallen from rest under constant gravitational acceleration (no air resistance).',
      variables: { x: 'distance fallen (m)', g: 'gravitational acceleration (9.8 m/s² on Earth)', t: 'time elapsed (s)' },
    },
    {
      id: 'p0-001-f2',
      latex: 't = \\sqrt{\\dfrac{2x}{g}}',
      description: 'Time to fall a distance x from rest (rearrangement of free-fall equation).',
      variables: { t: 'fall time (s)', x: 'distance fallen (m)', g: 'gravitational acceleration (m/s²)' },
    },
    {
      id: 'p0-001-f3',
      latex: 'x \\propto t^2',
      description: 'Proportionality form: distance in free fall is proportional to time squared. Doubling t quadruples x.',
      variables: { x: 'distance fallen', t: 'time' },
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Free Fall: x = ½gt²',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8   # m/s²  (Earth)
t = np.linspace(0, 5, 300)
x = 0.5 * g * t**2

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Distance vs time
axes[0].plot(t, x, 'b-', linewidth=2)
axes[0].set_xlabel('Time t (s)')
axes[0].set_ylabel('Distance fallen x (m)')
axes[0].set_title('Free fall: x = ½gt²')
axes[0].grid(True)

# Mark specific times
for t_mark in [1, 2, 3, 4]:
    x_mark = 0.5 * g * t_mark**2
    axes[0].plot(t_mark, x_mark, 'ro', markersize=7)
    axes[0].annotate(f't={t_mark}s\\n{x_mark:.1f}m',
                     xy=(t_mark, x_mark), xytext=(t_mark+0.1, x_mark-8),
                     fontsize=8)

# Distance vs t² (should be a straight line — proves the proportionality)
axes[1].plot(t**2, x, 'g-', linewidth=2)
axes[1].set_xlabel('t² (s²)')
axes[1].set_ylabel('Distance fallen x (m)')
axes[1].set_title('x vs t² — straight line confirms x ∝ t²')
axes[1].grid(True)

plt.tight_layout()
plt.show()

print("Key distances:")
for t_val in [1, 2, 3, 4, 5]:
    print(f"  t = {t_val}s → x = {0.5*g*t_val**2:.1f} m")`,
          prose: [
            '`x = 0.5 * g * t**2` is the direct implementation of x = ½gt². NumPy applies this element-wise across all 300 time values simultaneously.',
            'The right plot shows x vs t² — a straight line. This is the visual proof that x is proportional to t²: if x ∝ t² then a plot of x against t² must be linear. Galileo confirmed this with his ramps.',
            'The marked points show how distance grows: at t=1s, 4.9m; at t=2s, 19.6m (4×); at t=3s, 44.1m (9×). The ratios are 1:4:9 = 1²:2²:3². This is the t² signature.',
          ],
        },
        {
          cellTitle: 'Earth vs Moon vs Mars — same model, different g',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

planets = {
    'Earth':   {'g': 9.8,  'color': 'royalblue'},
    'Moon':    {'g': 1.62, 'color': 'slategray'},
    'Mars':    {'g': 3.72, 'color': 'tomato'},
    'Jupiter': {'g': 24.8, 'color': 'goldenrod'},
}

t = np.linspace(0, 6, 300)

fig, ax = plt.subplots(figsize=(10, 6))
for name, data in planets.items():
    x = 0.5 * data['g'] * t**2
    ax.plot(t, x, linewidth=2.5, color=data['color'], label=f"{name} (g={data['g']} m/s²)")

ax.set_xlabel('Time (s)', fontsize=12)
ax.set_ylabel('Distance fallen (m)', fontsize=12)
ax.set_title('Free fall on different worlds — same formula, different g', fontsize=13)
ax.legend(fontsize=11)
ax.grid(True, alpha=0.4)
ax.set_ylim(0, 450)
plt.tight_layout()
plt.show()

# Table comparison at t = 3s
print("Distance fallen after 3 seconds:")
for name, data in planets.items():
    x3 = 0.5 * data['g'] * 3**2
    print(f"  {name:8}: {x3:.1f} m")`,
          prose: [
            'The model x = ½gt² works on every body in the solar system — only g changes. Same formula, just swap the constant. This is what "model" means: a structure that generalizes across situations.',
            'Jupiter\'s curve is nearly off the chart in 3 seconds — the same object that falls 44 m on Earth falls 334 m on Jupiter. That\'s not a different law of physics; it\'s the same law with a much larger g.',
            'The Moon\'s shallow curve explains why Apollo astronauts could jump so high and why the famous hammer-and-feather drop (g_Moon = 1.62 m/s²) took noticeably longer than it would on Earth.',
          ],
        },
        {
          cellTitle: 'Model failure: skydiver with air resistance',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

g = 9.8
m = 80      # kg  skydiver mass
k = 0.3     # drag coefficient (approximate for spread-eagle position)

def free_fall_drag(state, t):
    x, v = state
    drag = k * v**2 / m   # acceleration due to drag (opposes motion)
    a = g - drag
    return [v, a]

t = np.linspace(0, 15, 500)

# No air resistance (simple model)
x_simple = 0.5 * g * t**2
v_simple  = g * t

# With air resistance (ODE solution)
sol = odeint(free_fall_drag, [0, 0], t)
x_drag = sol[:, 0]
v_drag  = sol[:, 1]

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

axes[0].plot(t, x_simple, 'b--', linewidth=2, label='Model: no drag')
axes[0].plot(t, x_drag,   'r-',  linewidth=2, label='Reality: with drag')
axes[0].set_xlabel('Time (s)'); axes[0].set_ylabel('Distance fallen (m)')
axes[0].set_title('Distance: model vs reality')
axes[0].legend(); axes[0].grid(True)

axes[1].plot(t, v_simple, 'b--', linewidth=2, label='Model: no drag (v = gt)')
axes[1].plot(t, v_drag,   'r-',  linewidth=2, label='Reality: with drag')
axes[1].axhline(y=g*m/k**0.5 if False else max(v_drag)*0.99,
                color='green', linestyle=':', label='Terminal velocity')
axes[1].set_xlabel('Time (s)'); axes[1].set_ylabel('Speed (m/s)')
axes[1].set_title('Speed: model vs reality — notice terminal velocity')
axes[1].legend(); axes[1].grid(True)

plt.tight_layout()
plt.show()

print(f"At t=10s — simple model: {0.5*g*100:.0f}m  |  with drag: {x_drag[np.argmin(abs(t-10))]:.0f}m")
print(f"Model overestimates by: {0.5*g*100 - x_drag[np.argmin(abs(t-10))]:.0f}m at 10s")`,
          prose: [
            '`odeint` solves the equation of motion with drag: ma = mg − kv². This is the "better model" — it adds the drag term the simple x = ½gt² ignores.',
            'The distance plots diverge after about 5 seconds. At t=10s the simple model predicts 490m but reality is about 400m — an 18% overestimate, exactly the skydiver example from the lesson.',
            'The speed plot shows the key difference: the simple model has speed growing forever (v = gt, a straight line). The drag model shows speed levelling off at "terminal velocity" — the point where drag equals gravity. This is why skydivers don\'t accelerate indefinitely.',
          ],
        },
        {
          cellTitle: 'Challenge — find g from drop times',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'An experiment drops a ball from three known heights and records the fall times. Heights: [1.0, 2.0, 4.5] m. Times measured: [0.452, 0.639, 0.957] s. (1) Use x = ½gt² rearranged to t² = 2x/g to compute g from each pair. (2) Find the mean and standard deviation of your g estimates. (3) Plot measured time vs √(2x/g_true) to check linearity. How close is your estimated g to 9.8 m/s²?',
          starterCode: `import numpy as np

heights = np.array([1.0, 2.0, 4.5])   # m
times   = np.array([0.452, 0.639, 0.957])  # s

# TODO: From t² = 2x/g, rearrange to g = 2x/t²
# TODO: Compute g for each measurement
# TODO: Print mean and std of g estimates
# TODO: Compare to 9.8 m/s²`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Free Fall: x = ½gt²',
          type: 'code',
          language: 'matlab',
          code: `g = 9.8;
t = linspace(0, 5, 300);
x = 0.5 * g * t.^2;

figure;
subplot(1,2,1)
plot(t, x, 'b-', 'LineWidth', 2)
xlabel('Time t (s)'); ylabel('Distance x (m)')
title('Free fall: x = ½gt²'); grid on
% Mark specific times
hold on
for t_mark = 1:4
    x_mark = 0.5 * g * t_mark^2;
    plot(t_mark, x_mark, 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'r')
    text(t_mark+0.05, x_mark-5, sprintf('t=%ds\\n%.1fm', t_mark, x_mark), 'FontSize', 8)
end

subplot(1,2,2)
plot(t.^2, x, 'g-', 'LineWidth', 2)
xlabel('t² (s²)'); ylabel('Distance x (m)')
title('x vs t² — straight line confirms x ∝ t²'); grid on

fprintf('Key distances:\\n')
for t_val = 1:5
    fprintf('  t = %ds → x = %.1f m\\n', t_val, 0.5*g*t_val^2)
end`,
          prose: [
            '`x = 0.5 * g * t.^2` uses element-wise squaring `.^2` — essential in MATLAB when t is a vector. Without the dot, MATLAB would try matrix exponentiation and error.',
            'The subplot(1,2,2) plots x vs t² — the straight line visually confirms x ∝ t². Galileo effectively did this with his water-clock ramp experiments: equal increments of t² gave equal increments of distance.',
            'The `for` loop uses scalar indexing (t_val^2 not t_val.^2) because we\'re computing one value at a time. The fprintf call prints a readable table of key results.',
          ],
        },
        {
          cellTitle: 'Earth vs Moon vs Mars',
          type: 'code',
          language: 'matlab',
          code: `g_vals   = [9.8,   1.62,   3.72,  24.8];
names    = {'Earth', 'Moon', 'Mars', 'Jupiter'};
colors   = {'b',     'k',    'r',   'y'};
t = linspace(0, 6, 300);

figure; hold on
for i = 1:length(g_vals)
    x = 0.5 * g_vals(i) * t.^2;
    plot(t, x, colors{i}, 'LineWidth', 2.5, ...
         'DisplayName', sprintf('%s (g=%.2f m/s²)', names{i}, g_vals(i)))
end
xlabel('Time (s)'); ylabel('Distance fallen (m)')
title('Free fall on different worlds')
legend('Location','northwest'); grid on; ylim([0 450])

fprintf('\\nDistance fallen after 3 seconds:\\n')
for i = 1:length(g_vals)
    fprintf('  %-8s: %.1f m\\n', names{i}, 0.5*g_vals(i)*9)
end`,
          prose: [
            'Cell arrays `names = {\'Earth\', ...}` store strings in MATLAB. Indexing uses `names{i}` (curly braces) not `names(i)` — the distinction matters: curly extracts content, round gives a cell array.',
            '`sprintf(\'%s (g=%.2f)\', names{i}, g_vals(i))` builds the legend label dynamically. The `%s` formats a string, `%.2f` formats a float to 2 decimal places.',
            'Jupiter\'s curve nearly fills the vertical axis — 334m in 3 seconds vs Earth\'s 44m. The same formula, just a different g. This is what mathematical models give you: one structure that works across all situations.',
          ],
        },
        {
          cellTitle: 'Challenge — Proportionality Reasoning',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'An object falls 44.1 m in 3 seconds on Earth. Without using x = ½gt² directly: (1) Use proportionality (x ∝ t²) to predict how far it falls in 6 s, 9 s, and 1.5 s. (2) Verify each answer by computing x = ½(9.8)t² directly. (3) Plot both the proportionality prediction and the direct formula on the same graph — they should be identical.',
          starterCode: `% Known: at t=3s, x = 44.1 m
t_ref = 3; x_ref = 44.1;
t_query = [6, 9, 1.5];

% TODO: x_prop = x_ref * (t_query / t_ref).^2   (proportionality)
% TODO: x_direct = 0.5 * 9.8 * t_query.^2      (direct formula)
% TODO: compare and print both
% TODO: plot both on same axes`,
        },
      ],
    },
  },

  misconceptions: [
    {
      id: 'p0-001-m1',
      misconception: 'Heavier objects fall faster.',
      correction: 'All objects fall at the same rate in vacuum regardless of mass. Galileo proved this with a thought experiment (tied stones paradox) and experiment. The equation x = ½gt² has no mass term. On Earth, light/fluffy objects seem to fall slower because air resistance is proportionally larger for them — but that\'s drag, not gravity.',
      correctionExample: 'Drop a coin and a sheet of paper. The paper falls slower — but crumple the paper into a tight ball and drop both: they hit at almost the same time. Same mass, same result. The difference was always air resistance, not mass.',
    },
    {
      id: 'p0-001-m2',
      misconception: 'x = ½gt² means x grows proportionally to t (if you double t, you double x).',
      correction: 'x ∝ t², not t. Doubling t multiplies x by 4, not 2. Tripling t multiplies x by 9. The t² relationship means distance grows much faster than time — this is what acceleration looks like.',
      correctionExample: 'At t=1s: x = 4.9 m. At t=2s: x = 19.6 m (4× more, not 2×). The ratio of distances equals the ratio of times squared: (2/1)² = 4.',
    },
    {
      id: 'p0-001-m3',
      misconception: 'A model that is sometimes wrong is useless.',
      correction: 'Every model has a domain of validity. x = ½gt² is wrong for a skydiver at terminal velocity but exactly right for a dense ball dropped from 10 m. The model is not wrong — it is limited. Knowing its limits is part of knowing the model.',
      correctionExample: 'Newton\'s gravity was "wrong" by Einstein\'s standard but was used to navigate to the Moon in 1969. The question is never "is this model perfect?" — it is "is this model good enough for this problem?"',
    },
  ],

  transferPrompts: [
    {
      id: 'p0-001-tp1',
      prompt: 'A camera dropped from a drone takes 2.3 s to hit the ground. Using x = ½gt², estimate the drone\'s height. Then identify one assumption you made and whether it affects the answer significantly.',
      connection: 'x = ½(9.8)(2.3²) = ½(9.8)(5.29) ≈ 25.9 m. Assumption: no air resistance. A camera is dense enough that this barely matters — the simple model is accurate here. This is exactly the model-validity analysis the lesson introduces.',
    },
    {
      id: 'p0-001-tp2',
      prompt: 'The equation x = ½at² describes free fall with constant acceleration. The equation d = ½at² also describes how far a car travels from rest under constant acceleration a. Is the same model being reused? What physical insight does this reveal?',
      connection: 'Yes — it is the same model. "Distance covered from rest under constant acceleration" is a single mathematical structure that applies to falling objects, accelerating cars, rockets, and anything else with constant acceleration. Physics reuses models because the underlying mathematics is the same regardless of what\'s physically causing the acceleration.',
    },
  ],

  debugging: [
    {
      id: 'p0-001-db1',
      scenario: 'A student computes x = ½ × 9.8 × 3 = 14.7 m for a 3-second fall.',
      error: 'Did not square the time. The formula is x = ½g·t², not ½g·t. The student computed ½ × 9.8 × 3 instead of ½ × 9.8 × 3².',
      fix: 'Always write t² explicitly: x = ½ × 9.8 × (3)² = ½ × 9.8 × 9 = 44.1 m. The correct answer is 44.1 m, not 14.7 m. Check: does the answer make sense? 14.7 m in 3 s would mean the ball was barely accelerating — but we know free fall builds speed rapidly.',
    },
    {
      id: 'p0-001-db2',
      scenario: 'A student says the model x = ½gt² is wrong because a feather doesn\'t follow it on Earth.',
      error: 'Confusing model failure with model wrongness. The model assumes no air resistance. A feather has high drag relative to its weight — the model\'s assumption is violated for a feather in air. The model is correct within its domain (negligible air resistance); the domain simply doesn\'t include feathers in air.',
      fix: 'Always check whether the problem satisfies the model\'s assumptions before applying it. For the feather-in-air case, a better model includes drag. The original model is not wrong — it\'s outside its domain.',
    },
  ],

  mastery: {
    targetLevel: 'Apply x = ½gt² to compute distances and times; use proportionality to predict scaling without recomputing; identify what a model assumes and where it breaks down.',
    checklistItems: [
      'Can substitute t into x = ½gt² and compute the answer correctly (squaring t first)',
      'Can rearrange x = ½gt² to solve for t given x',
      'Can use x ∝ t² to predict new distances from known ones without re-deriving',
      'Can identify at least two assumptions built into x = ½gt² and one situation where each fails',
      'Can explain in one sentence what a physics model is and why idealization is useful',
    ],
    commonStruggles: [
      'Forgetting to square t — computing ½ × 9.8 × t instead of ½ × 9.8 × t²',
      'Thinking heavier objects fall faster (Aristotelian intuition is deeply persistent)',
      'Treating a model\'s domain limitation as a flaw rather than a feature',
    ],
    nextSteps: 'Lesson 2 introduces units and dimensions — the grammar that keeps physics equations consistent. Every variable in x = ½gt² has units, and tracking them reveals errors and builds intuition about what equations must look like before you solve them.',
  },

  mentalModel: [
    'Physics = model + prediction + test — not memorized formulas',
    'Galileo: experiment beats authority, idealization reveals patterns',
    'Free fall: x = ½gt² — distance grows as t², not t',
    'Proportionality: double t → quadruple x (because x ∝ t²)',
    'Every model has a domain — outside it, results are wrong, not the model',
    'Most common mistake: computing ½ × 9.8 × t before squaring t',
  ],

  quiz: [
    {
      id: 'what-is-physics-q1',
      type: 'choice',
      text: 'Aristotle claimed heavier objects fall faster than lighter ones. Galileo refuted this by:',
      options: [
        'Arguing logically that Aristotle must be wrong',
        'Performing experiments that showed all objects (regardless of mass) fall at the same rate in vacuum',
        'Asking Newton to calculate the correct formula',
        'Measuring the exact value of g = 9.8 m/s²',
      ],
      answer:
        'Performing experiments that showed all objects (regardless of mass) fall at the same rate in vacuum',
      hints: [
        'The key word is "experiment" — Galileo replaced authority with observation.',
      ],
      reviewSection: 'Intuition tab — Galileo\'s revolution',
    },
    {
      id: 'what-is-physics-q2',
      type: 'input',
      text: 'Using $x = \\tfrac{1}{2}(9.8)t^2$, how far does an object fall from rest in $t = 3$ s? Give your answer in meters.',
      answer: '44.1',
      hints: [
        'Substitute t = 3. Compute t² = 9 first.',
        'x = ½ × 9.8 × 9 = ½ × 88.2 = 44.1 m',
      ],
      reviewSection: 'Examples — free fall substitution',
    },
    {
      id: 'what-is-physics-q3',
      type: 'choice',
      text: 'An object falls 20 m in 2 s. How far does it fall in 4 s? (Use proportionality — do not recompute from scratch.)',
      options: ['40 m', '60 m', '80 m', '160 m'],
      answer: '80 m',
      hints: [
        'Since x ∝ t², doubling t multiplies x by 2² = 4. So 4 × 20 m = 80 m.',
      ],
      reviewSection: 'Examples — proportionality reasoning',
    },
    {
      id: 'what-is-physics-q4',
      type: 'choice',
      text: 'A physics model predicts a ball travels 100 m, but the measured value is 85 m. The best conclusion is:',
      options: [
        'The model is wrong and should be discarded',
        'The measurement was made incorrectly',
        'The model has a missing effect (like air resistance) that is not negligible in this situation',
        'The discrepancy is too small to matter',
      ],
      answer: 'The model has a missing effect (like air resistance) that is not negligible in this situation',
      hints: [
        'A model overestimating by 15% suggests a real physical effect is being ignored.',
      ],
      reviewSection: 'Intuition tab — what a model is',
    },
    {
      id: 'what-is-physics-q5',
      type: 'input',
      text: 'On the Moon, $g = 1.6\\,\\text{m/s}^2$. An object is dropped from rest. How far does it fall in $t = 5$ s? Give your answer in meters.',
      answer: '20',
      hints: [
        'Same formula: x = ½gt². Replace g with 1.6.',
        'x = ½ × 1.6 × 25 = ½ × 40 = 20 m',
      ],
      reviewSection: 'Challenges — Moon gravity',
    },
    {
      id: 'what-is-physics-q6',
      type: 'choice',
      text: 'What is the correct order of the physics model-building cycle?',
      options: [
        'Model → Predict → Observe → Test',
        'Observe → Model → Predict → Test',
        'Test → Model → Observe → Predict',
        'Predict → Observe → Test → Model',
      ],
      answer: 'Observe → Model → Predict → Test',
      hints: [
        'You can\'t build a model of something you haven\'t looked at. Observation always comes first.',
      ],
      reviewSection: 'Intuition tab — the model-building loop',
    },
    {
      id: 'what-is-physics-q7',
      type: 'input',
      text: 'An object falls from rest and is observed to have fallen $122.5$ m. Using $t^2 = 2x/g$ with $g = 9.8$, find the fall time $t$ in seconds.',
      answer: '5',
      hints: [
        't² = 2 × 122.5 / 9.8 = 245 / 9.8 = 25. Then t = √25.',
        't = √25 = 5 s',
      ],
      reviewSection: 'Challenges — rearranging for t',
    },
    {
      id: 'what-is-physics-q8',
      type: 'choice',
      text: 'The equation $x = \\tfrac{1}{2}gt^2$ predicts that a feather and a cannonball dropped together will hit the ground at the same time. This is only true when:',
      options: [
        'The objects are dropped from a great height',
        'Air resistance is negligible (e.g., in a vacuum)',
        'The cannonball is heavier than the feather by more than a factor of 10',
        'The experiment is done on Earth specifically',
      ],
      answer: 'Air resistance is negligible (e.g., in a vacuum)',
      hints: [
        'The model ignores air resistance — so it is accurate only when air resistance is actually negligible.',
      ],
      reviewSection: 'Intuition tab — model domain of validity',
    },
    {
      id: 'what-is-physics-q9',
      type: 'choice',
      text: 'Galileo\'s thought experiment (tying a heavy and light stone together) showed that Aristotle\'s theory leads to:',
      options: [
        'A result that needs more experimental data to test',
        'A logical contradiction — the tied stones must fall both faster and slower than H alone',
        'Proof that heavier objects do fall faster, confirming Aristotle',
        'A result that only applies in vacuum',
      ],
      answer: 'A logical contradiction — the tied stones must fall both faster and slower than H alone',
      hints: [
        'If heavier = faster, the combined object is heavier than H, so it should fall faster. But L should drag H back, making them slower. Both can\'t be true.',
      ],
      reviewSection: 'Rigor tab — the contradiction proof',
    },
    {
      id: 'what-is-physics-q10',
      type: 'input',
      text: 'An object falls with $x \\propto t^2$. At $t = 2$ s it has fallen $19.6$ m. At $t = 6$ s, how far has it fallen? (Use proportionality.)',
      answer: '176.4',
      hints: [
        't went from 2 to 6, which is a factor of 3. Since x ∝ t², x is multiplied by 3² = 9.',
        '9 × 19.6 = 176.4 m',
      ],
      reviewSection: 'Examples — proportionality reasoning',
    },
  ],
}
