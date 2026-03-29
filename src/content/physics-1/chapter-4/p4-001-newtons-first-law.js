export default {
  id: 'p1-ch4-001',
  slug: 'newtons-first-law',
  chapter: 'p4',
  order: 0,
  title: "Newton's First Law: Inertia",
  subtitle: 'The natural state of an object is not rest — it is whatever it is already doing.',
  tags: ['newtons-first-law', 'inertia', 'net-force', 'equilibrium', 'dynamics'],

  hook: {
    question: 'A hockey puck sliding on ice gradually slows to a stop. Aristotle used this as proof that objects need a continuous force to keep moving. Newton showed this reasoning was exactly backwards. Who is right, and how do we know?',
    realWorldContext: "For two thousand years, the most respected answer to 'why do things move?' came from Aristotle: objects move because something pushes them, and when the pushing stops, they stop. This felt obviously true — push a book across a table, let go, it stops. Push a cart, let go, it stops. It took Galileo's experiments and Newton's genius to reveal the hidden variable Aristotle missed: friction. Strip friction away, and objects keep moving forever. That insight — the natural state of motion is constant velocity, not rest — overturned two millennia of physics and made the modern world possible.",
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'kinematic-chain' },
  },

  intuition: {
    prose: [
      "**Where you are in the story.** In Chapters 2 and 3, you built a complete toolkit for describing motion: position x(t), velocity v(t), acceleration a(t), the SUVAT equations, projectile motion, circular motion. You could answer every question of the form 'given this acceleration, where does the object end up?' But there was always a variable you accepted without explanation — the acceleration itself. You were told a = 9.8 m/s² downward or a = 5 m/s² to the right and you used it. Chapter 4 asks the deeper question: where does acceleration come from? What causes it? This is the shift from kinematics (describing motion) to dynamics (explaining motion). The answer is Newton's three laws, and this lesson is the first.",

      "**Aristotle's theory — and why it seemed bulletproof.** Push a book across a table. The moment you stop pushing, the book stops moving. Push a cart. The moment your hand leaves it, the cart slows and stops. Aristotle saw this pattern and concluded: motion requires a continuously applied force. Rest is the natural state. Objects return to rest when the force is removed. For over two thousand years this was accepted physics, and it was hard to argue with — you could test it a hundred times and it always seemed true. The problem was not with his observations. The problem was with what he was not observing.",

      "**Galileo's thought experiment: strip away the hidden variable.** Around 1600, Galileo noticed something: a ball rolling on a rough surface stops quickly, but on a smoother surface it rolls much farther before stopping. On a smoother surface still, it goes even farther. He proposed a thought experiment: what if you could make a surface perfectly smooth — perfectly frictionless? The ball would never stop. It would roll forever at constant speed. The thing Aristotle was observing — objects stopping — was not evidence of a natural tendency toward rest. It was evidence that friction is everywhere, slowing everything down. Aristotle mistook the effect of friction for the nature of matter.",

      "**Newton's First Law, precisely stated.** Newton synthesized Galileo's insight into a law: an object at rest remains at rest, and an object in motion remains in motion at constant velocity, unless acted upon by a net external force. The critical phrase is net external force — the vector sum of all forces acting on the object. If that sum is zero, the acceleration is zero, and velocity stays constant (including zero as a special case). The law does not say 'no forces.' It says 'no net force.' A book resting on a table has two forces acting on it: gravity pulling down and the table pushing up. Both are real forces. But they cancel — net force is zero — so the book doesn't accelerate.",

      "**Inertia: resistance to change, not resistance to motion.** The word inertia comes from Latin for 'laziness' or 'idleness,' but it doesn't mean what it sounds like. Inertia is not resistance to moving — it is resistance to changing. A bowling ball at rest resists being kicked into motion. That same bowling ball, once rolling toward you at 5 m/s, resists being stopped just as stubbornly. It is the exact same property — it resists any change in velocity, whether that means starting, stopping, speeding up, slowing down, or turning. Mass is the quantitative measure of inertia: the more mass, the harder it is to change the state of motion. A 200 kg boulder and a 2 kg ball at rest look the same in terms of velocity (both zero), but they have very different resistances to being accelerated.",

      "**Why this is philosophically deep.** Newton's First Law does something radical: it says rest and constant motion are the same thing. A spacecraft coasting through interstellar space — no engines, no friction, billions of kilometers from anything — is in exactly the same physical situation as a spacecraft sitting on a launch pad. Neither is accelerating. Neither requires any net force. They differ only in what velocity they happen to have. This equivalence between 'at rest' and 'moving at constant velocity' was the seed of Einstein's special relativity three centuries later, which proved that there is no experiment you can do inside a closed box to determine whether you are at rest or moving at constant velocity. Newton planted that idea here.",

      "**Where this is heading.** The First Law answers: when is acceleration zero? When net force is zero. But it raises the obvious next question: when there IS a net force, how much acceleration results? The Second Law — the most important equation in classical mechanics — answers this precisely. It is the subject of the next lesson.",
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 9 — The Turn from Kinematics to Dynamics',
        body: "**Chapters 0–3 (Kinematics):** How things move — position, velocity, acceleration, SUVAT, projectiles, circular motion.\n**Chapter 4 (Dynamics, this chapter):** Why things move — forces, Newton's three laws, friction, inclined planes, pulleys.\n**This lesson:** The First Law establishes the baseline — no net force means no acceleration.\n**Next lesson:** The Second Law — when net force IS present, how large is the resulting acceleration?",
      },
      {
        type: 'insight',
        title: "Newton's First Law",
        body: "An object remains at rest or moves at **constant velocity** unless acted upon by a **net external force** (\\(\\sum \\vec{F} \\neq 0\\)).\n\nEquivalently: \\(\\sum \\vec{F} = 0 \\iff \\vec{a} = 0\\)",
      },
      {
        type: 'warning',
        title: "Inertia ≠ Tendency to Stop",
        body: "Aristotle confused friction with inertia. Inertia resists **any change** in velocity — starting, stopping, or turning. A bowling ball rolling at 5 m/s has the same inertia as when it was at rest. The inertia that resisted starting is the same inertia that resists stopping.",
      },
      {
        type: 'connection',
        title: 'Calculus connection: zero net force → linear x(t)',
        body: "\\(\\sum F = 0 \\Rightarrow a = \\dfrac{d^2x}{dt^2} = 0 \\Rightarrow v = \\text{const} \\Rightarrow x(t) = x_0 + v_0 t\\)\n\nZero net force makes position a **linear** function of time. A straight line on an x-t graph is always a signature of zero net force — and therefore of Newton's First Law.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Kinematics to Dynamics: what drives acceleration?',
        mathBridge: "You have used this chain before: position → velocity → acceleration. In Chapters 2–3, you moved left-to-right — given x(t), differentiate to get v(t), differentiate again to get a(t). Chapter 4 reverses the question: what determines a(t)? Newton's First Law answers the zero-force case: if net force is zero, a = 0, and everything to the left stays constant. Look at the chain and ask: for a block sliding on a frictionless surface with no applied force, what are x(t), v(t), and a(t) doing? Position grows linearly, velocity is constant, acceleration is zero. That is the First Law expressed in kinematics language.",
        caption: "The chain x → v → a. Newton's laws explain what controls acceleration — the rightmost quantity and the root cause of all motion change.",
      },
    ],
  },

  math: {
    prose: [
      "The First Law simultaneously defines what we mean by an inertial reference frame and makes a physical claim about what happens in one. An inertial frame is a frame of reference in which a free object (no net force) moves in a straight line at constant speed. The surface of the Earth is approximately inertial for most problems — the rotation of the Earth introduces tiny fictitious forces (Coriolis, centrifugal) that are negligible for lab-scale experiments but matter for long-range projectiles and weather systems.",

      "The condition for equilibrium is ΣF = 0, a vector equation. In 2D problems it means both ΣFₓ = 0 and ΣFᵧ = 0 independently. An object is in mechanical equilibrium if and only if its acceleration is zero — which includes both objects at rest and objects moving at constant velocity. These two cases are physically indistinguishable from the perspective of forces.",

      "Mass is the measure of inertia. It tells you how hard it is to change an object's velocity. The SI unit is the kilogram (kg). Mass is a scalar, always positive, and the same everywhere in the universe — your mass is identical on Earth, on the Moon, and in deep space. This is different from weight, which is a force (W = mg) and changes with the local gravitational field strength g. On the Moon, g ≈ 1.6 m/s², so your weight is about one-sixth of what it is on Earth. Your mass is unchanged.",
    ],
    keyFormulas: [
      {
        label: 'Equilibrium condition',
        formula: '\\sum \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\vec{v}_0 = \\text{const}',
        note: 'Both the vector sum and each component separately must be zero.',
      },
      {
        label: 'Component form',
        formula: '\\sum F_x = 0 \\quad \\text{and} \\quad \\sum F_y = 0',
        note: 'Both conditions must hold simultaneously.',
      },
    ],
  },

  rigor: {
    title: 'The First Law as a definition of inertial frames',
    content: [
      {
        type: 'paragraph',
        text: "Newton's First Law is not just a physical claim — it is the definition of the class of reference frames in which Newton's laws hold. An inertial frame is one in which a free particle (zero net force) travels in a straight line at constant velocity. Non-inertial frames — rotating platforms, accelerating cars, the inside of a rocket under thrust — are frames where objects appear to accelerate even with no real force acting. In those frames, you must introduce fictitious forces (centrifugal, Coriolis, Euler) to make Newton's equations work. All the mechanics in this course assumes an inertial frame unless stated otherwise.",
      },
      {
        type: 'derivation',
        steps: [
          { expression: "\\text{Assume: } \\sum \\vec{F} = 0 \\text{ (no net force on object)}", annotation: "Starting condition: First Law applies" },
          { expression: "\\sum \\vec{F} = m\\vec{a} = 0 \\implies \\vec{a} = 0", annotation: "Using the Second Law to formalize: zero net force → zero acceleration" },
          { expression: "\\vec{a} = \\frac{d\\vec{v}}{dt} = 0 \\implies \\vec{v} = \\vec{v}_0 = \\text{const}", annotation: "Integrate: constant acceleration of zero gives constant velocity" },
          { expression: "x(t) = x_0 + v_0 t", annotation: "Integrate again: position is a linear function of time" },
          { expression: "\\text{x-t graph: straight line with slope } v_0", annotation: "Observable prediction: any deviation from a straight line indicates net force" },
        ],
        answer: "The First Law predicts a straight-line x-t graph whenever net force is zero. Any curve on an x-t graph — any non-constant slope — signals that a net force is acting and the Second Law takes over.",
      },
    ],
    visualizationId: 'InertiaDerivation',
  },

  checkpoints: [
    { id: 'p4-001-cp1', question: "A box slides on a frictionless floor at 4 m/s with no applied force. What is its acceleration?", answer: "0 m/s² — zero net force, so zero acceleration (First Law)." },
    { id: 'p4-001-cp2', question: "Two forces act on a block: 10 N east and 10 N west. Is the block in equilibrium? What is its acceleration?", answer: "Yes — ΣF = 0, so a = 0 and velocity is constant." },
    { id: 'p4-001-cp3', question: "A spacecraft far from all planets has engines off and moves at 2000 m/s. What happens to its speed over the next hour?", answer: "It stays at 2000 m/s — no net force means constant velocity." },
  ],

  quiz: [
    {
      id: 'p4-001-q1',
      type: 'choice',
      text: "Aristotle believed objects in motion naturally slow down and stop. What was the key flaw in his reasoning?",
      options: [
        "He forgot that mass increases with speed",
        "He did not account for friction — friction stops objects, not their natural tendency",
        "He used the wrong units for force",
        "He only studied objects in water",
      ],
      answer: "He did not account for friction — friction stops objects, not their natural tendency",
      hints: ["Galileo's thought experiment: what happens on a perfectly frictionless surface?"],
      reviewSection: "Galileo's Thought Experiment",
    },
    {
      id: 'p4-001-q2',
      type: 'choice',
      text: "A hockey puck slides on frictionless ice at constant velocity. Which statement is correct?",
      options: [
        "A net force must be acting to keep it moving",
        "No net force acts on it — it moves at constant velocity by the First Law",
        "Gravity is the net force keeping it on the ice",
        "The puck will eventually stop because all objects return to rest",
      ],
      answer: "No net force acts on it — it moves at constant velocity by the First Law",
      hints: ["Constant velocity ↔ zero net force. That is the First Law."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q3',
      type: 'choice',
      text: "A 200 kg boulder and a 2 kg ball are both at rest. Which requires more force to accelerate at 1 m/s²?",
      options: [
        "The ball, because it is lighter",
        "The boulder, because it has more inertia",
        "Both require the same force",
        "Neither requires force — they will start moving on their own",
      ],
      answer: "The boulder, because it has more inertia",
      hints: ["Inertia = resistance to acceleration. Mass is the measure of inertia."],
      reviewSection: "Inertia: Resistance to Change",
    },
    {
      id: 'p4-001-q4',
      type: 'choice',
      text: "Two forces act on an object: 15 N north and 15 N south. What is the acceleration?",
      options: ["30 m/s² north", "15 m/s² south", "0 m/s² — the forces cancel", "Cannot be determined without the mass"],
      answer: "0 m/s² — the forces cancel",
      hints: ["Net force = vector sum. Equal and opposite forces give ΣF = 0."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q5',
      type: 'choice',
      text: "In calculus terms, if net force is zero then position x(t) is:",
      options: [
        "A constant function (object doesn't move)",
        "A linear function of t — a straight line on the x-t graph",
        "A quadratic — a parabola on the x-t graph",
        "An exponential function",
      ],
      answer: "A linear function of t — a straight line on the x-t graph",
      hints: ["a = d²x/dt² = 0. Integrate twice: v = const, x = x₀ + v₀t."],
      reviewSection: "Calculus Connection",
    },
    {
      id: 'p4-001-q6',
      type: 'input',
      text: "A 5 kg block moves at 3 m/s on a frictionless surface. Three seconds later, what is its speed? (in m/s)",
      answer: "3",
      hints: ["No friction = no net force = no acceleration = constant velocity."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q7',
      type: 'choice',
      text: "Which is NOT an example of inertia?",
      options: [
        "A passenger lurching forward when a car brakes suddenly",
        "A tablecloth pulled from under dishes (dishes stay put)",
        "A ball slowing because of air resistance",
        "A spacecraft coasting at constant speed with engines off",
      ],
      answer: "A ball slowing because of air resistance",
      hints: ["Air resistance is an external force causing change — that is the opposite of inertia."],
      reviewSection: "Inertia: Resistance to Change",
    },
    {
      id: 'p4-001-q8',
      type: 'choice',
      text: "A book rests on a table. Gravity pulls it down (10 N) and the table pushes up (10 N). Which law explains why it doesn't accelerate?",
      options: [
        "Third Law — gravity and normal force are action-reaction pairs",
        "First Law — ΣF = 0, so a = 0",
        "Second Law — since a = 0, we conclude F = 0",
        "Newton's laws don't apply to objects at rest",
      ],
      answer: "First Law — ΣF = 0, so a = 0",
      hints: ["The book is in equilibrium. ΣF = 0 → a = 0. First Law."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
    {
      id: 'p4-001-q9',
      type: 'choice',
      text: "An inertial reference frame is defined as:",
      options: [
        "Any frame that is at rest",
        "Any frame attached to the Earth's surface",
        "A frame in which Newton's First Law holds — a free particle moves at constant velocity",
        "A frame with no gravity",
      ],
      answer: "A frame in which Newton's First Law holds — a free particle moves at constant velocity",
      hints: ["See the Rigor section on inertial frames."],
      reviewSection: "The Rigor Section",
    },
    {
      id: 'p4-001-q10',
      type: 'choice',
      text: "You push a 10 kg box at constant velocity across a floor. What must be true about the applied force?",
      options: [
        "The applied force is greater than friction",
        "The applied force equals friction exactly — ΣF = 0",
        "No force is needed to maintain constant velocity",
        "The applied force equals mg = 98 N",
      ],
      answer: "The applied force equals friction exactly — ΣF = 0",
      hints: ["Constant velocity → a = 0 → ΣF = 0. Your push exactly cancels friction."],
      reviewSection: "Newton's First Law, Precisely Stated",
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'kinematic-chain' }, title: 'The kinematics chain — forces drive acceleration' },
  ],
}
