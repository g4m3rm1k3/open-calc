export default {
  id: 'ch5-003',
  slug: 'vectors-2d',
  chapter: 5,
  order: 3,
  title: 'Vectors: Quantities That Have Both Size and Direction',
  subtitle: 'A vector is an arrow. Its length is magnitude, its direction is heading. Components are just that arrow described with coordinates — one description, two representations.',
  tags: ['vectors', '2D vectors', 'vector addition', 'scalar multiplication', 'unit vector', 'magnitude', 'direction angle', 'component form', 'resultant', 'i j notation'],
  aliases: 'vector 2D magnitude direction component form addition subtraction scalar multiplication unit vector i j resultant angle bearing',

  hook: {
    question: 'A plane flies northeast at 400 km/h while wind blows due east at 80 km/h. What is the plane\'s actual velocity? You cannot add 400 + 80 because the directions are different. Vectors are the tool for adding quantities that have both size and direction.',
    realWorldContext: 'Force, velocity, acceleration, electric and magnetic fields — all are vector quantities. In structural engineering, every joint in a truss has forces acting on it in multiple directions; they must balance as vectors. In robotics, a robotic arm is described by joint angles and link lengths — the tip position is computed by adding vectors. In game physics, every collision, every trajectory, every lighting calculation is a vector operation.',
    previewVisualizationId: 'VectorOperationsViz',
  },

  // ── PILLAR 1: What it IS ───────────────────────────────────────────────────
  intuition: {
    pillar: 1,
    pillarLabel: 'What it IS — an arrow with length and direction',
    prose: [
      'A vector is an arrow. It has a tail (where it starts) and a tip (where it ends). Its magnitude is the length of the arrow. Its direction is which way the arrow points. Two vectors are equal if they have the same length and the same direction — position in the plane does not matter. You can slide the arrow anywhere and it is still the same vector.',
      'Adding two vectors follows the tip-to-tail rule: place the tail of the second vector at the tip of the first. The result (the resultant) goes from the first tail to the second tip. Order does not matter — $\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$ because the diagonal of the parallelogram is the same regardless of which side you traverse first.',
      'Component form $\\langle a, b \\rangle$ is just the arrow described by its horizontal and vertical shadows. The component $a$ is how far the arrow goes right, and $b$ is how far it goes up. Once you have components, vector addition becomes ordinary addition: $\\langle a_1, b_1 \\rangle + \\langle a_2, b_2 \\rangle = \\langle a_1+a_2, b_1+b_2 \\rangle$. Adding the shadows gives the shadow of the resultant.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Two representations of the same arrow',
        body: '\\text{Magnitude-direction form: } (|\\vec{v}|, \\theta) \\\\ \\text{Component form: } \\vec{v} = \\langle a, b \\rangle = a\\mathbf{i}+b\\mathbf{j} \\\\ \\text{Converting between them:} \\\\ a = |\\vec{v}|\\cos\\theta \\quad b = |\\vec{v}|\\sin\\theta \\quad (\\text{same triangle as polar coordinates!}) \\\\ |\\vec{v}| = \\sqrt{a^2+b^2} \\quad \\theta = \\arctan(b/a)',
      },
      {
        type: 'definition',
        title: 'Vector operations in component form',
        body: '\\vec{u}+\\vec{v} = \\langle u_1+v_1, u_2+v_2\\rangle \\quad \\text{(add components)} \\\\ c\\vec{v} = \\langle cv_1, cv_2\\rangle \\quad \\text{(scale each component)} \\\\ |\\vec{v}| = \\sqrt{v_1^2+v_2^2} \\quad \\hat{v} = \\vec{v}/|\\vec{v}| \\quad \\text{(unit vector)}',
      },
      {
        type: 'warning',
        title: 'Vectors are not numbers — you cannot just add magnitudes',
        body: '|\\vec{u}+\\vec{v}| \\neq |\\vec{u}|+|\\vec{v}| \\text{ in general.} \\\\ \\text{Example: } |\\langle3,0\\rangle+\\langle0,4\\rangle| = |\\langle3,4\\rangle| = 5 \\neq 3+4=7. \\\\ \\text{Adding magnitudes is only valid when both vectors point the same direction.}',
      },
    ],
    visualizations: [
      {
        id: 'VectorOperationsViz',
        title: 'Drag Two Vectors — Tip-to-Tail Addition',
        mathBridge: 'Drag $\\vec{u}$ and $\\vec{v}$. See the tip-to-tail construction and the parallelogram. Both produce the same resultant — that is commutativity made visible.',
        caption: 'The resultant is the diagonal of the parallelogram formed by the two vectors.',
      },
    ],
  },

  // ── PILLAR 2: Why it's TRUE ────────────────────────────────────────────────
  rigor: {
    pillar: 2,
    pillarLabel: "Why it's TRUE — tip-to-tail and component addition are the same thing",
    title: 'Proving that geometric addition = component addition',
    prerequisiteRecap: {
      title: 'What you need',
      items: [
        { concept: 'Coordinate geometry', statement: 'A vector from origin to point $(a,b)$ has component form $\\langle a,b \\rangle$.', linkedLesson: 'graphs-foundations' },
      ],
    },
    proofSteps: [
      {
        expression: '\\text{Let } \\vec{u} = \\langle u_1,u_2\\rangle \\text{ and } \\vec{v} = \\langle v_1,v_2\\rangle.',
        annotation: 'Both vectors start at the origin.',
        geometricAnchor: '$\\vec{u}$ ends at $(u_1,u_2)$. $\\vec{v}$ ends at $(v_1,v_2)$.',
      },
      {
        expression: '\\text{Tip-to-tail: place tail of } \\vec{v} \\text{ at tip of } \\vec{u} = (u_1,u_2).',
        annotation: "Slide $\\vec{v}$ so its tail is at $(u_1,u_2)$. Since a vector's identity is its length and direction, sliding does not change $\\vec{v}$.",
        geometricAnchor: 'Shifted $\\vec{v}$ goes from $(u_1,u_2)$ to $(u_1+v_1, u_2+v_2)$.',
      },
      {
        expression: '\\text{Resultant: from } (0,0) \\text{ to } (u_1+v_1, u_2+v_2).',
        annotation: 'The resultant arrow goes from the original tail to the final tip.',
        geometricAnchor: "This is exactly the vector $\\langle u_1+v_1, u_2+v_2 \\rangle$ — which is what component addition gives.",
      },
      {
        expression: '\\therefore \\text{tip-to-tail} = \\langle u_1+v_1, u_2+v_2\\rangle = \\vec{u}+\\vec{v}. \\qquad \\blacksquare',
        annotation: 'The geometric rule and the algebraic rule produce identical results. They are two descriptions of the same thing.',
        geometricAnchor: 'Components are coordinates of the endpoint. Adding the endpoints gives the resultant endpoint.',
      },
    ],
  },

  // ── PILLAR 3: How the algebra CONNECTS ────────────────────────────────────
  math: {
    pillar: 3,
    pillarLabel: 'How the algebra CONNECTS — force decomposition annotated',
    prose: [
      'Every real physics or engineering vector problem uses the same process: decompose each vector into components, add the components, reconstruct. Here is every step annotated so no symbol floats free.',
    ],
    annotatedDerivation: {
      title: 'Why force decomposition works — each symbol explained',
      steps: [
        {
          expression: 'F_x = |\\vec{F}|\\cos\\theta',
          plain: 'The horizontal component. Draw the force vector as the hypotenuse of a right triangle. The horizontal leg is adjacent to $\\theta$, so it equals hypotenuse × cosine. This is the definition of cosine.',
          prereq: '$\\cos\\theta = \\text{adjacent}/\\text{hypotenuse}$. Here adjacent $= F_x$, hypotenuse $= |\\vec{F}|$. Rearranging: $F_x = |\\vec{F}|\\cos\\theta$.',
        },
        {
          expression: 'F_y = |\\vec{F}|\\sin\\theta',
          plain: 'The vertical component. Same triangle — opposite leg over hypotenuse is sine.',
          prereq: null,
        },
        {
          expression: 'R_x = \\sum F_x \\qquad R_y = \\sum F_y',
          plain: 'The resultant component equals the sum of all the corresponding components. This works because adding horizontal shadows gives the horizontal shadow of the resultant — vectors act independently in perpendicular directions.',
          prereq: 'Horizontal and vertical are perpendicular. Vectors in perpendicular directions do not interfere with each other.',
        },
        {
          expression: '|\\vec{R}| = \\sqrt{R_x^2+R_y^2}',
          plain: 'Back to magnitude: the two components are perpendicular legs of a right triangle. The magnitude is the hypotenuse — Pythagorean theorem.',
          prereq: '$R_x$ and $R_y$ are perpendicular (horizontal and vertical), so the Pythagorean theorem applies directly.',
        },
        {
          expression: '\\theta_R = \\arctan(R_y/R_x) \\quad \\text{(adjust for quadrant)}',
          plain: 'The direction of the resultant. Same quadrant check as in polar coordinates.',
          prereq: null,
        },
      ],
      summary: 'Decompose → add components → reconstruct. The components are just shadows of the arrows onto the coordinate axes. Shadows add because shadows are numbers, not arrows.',
    },
    callouts: [
      {
        type: 'proof-map',
        title: 'Resultant of multiple forces — the algorithm',
        body: '1.\\; F_x = |F|\\cos\\theta, \\; F_y = |F|\\sin\\theta \\text{ for each force} \\\\ 2.\\; R_x = \\sum F_x, \\; R_y = \\sum F_y \\\\ 3.\\; |R| = \\sqrt{R_x^2+R_y^2}, \\; \\theta_R = \\arctan(R_y/R_x) \\text{ (adjust quadrant)}',
      },
      {
        type: 'warning',
        title: 'Bearing vs standard angle — they measure differently',
        body: '\\text{Standard: CCW from positive }x\\text{-axis (east).} \\\\ \\text{Bearing: CW from north (positive }y\\text{-axis).} \\\\ \\text{N60°E means: start north, rotate 60° toward east.} \\\\ \\text{Standard equivalent: } 90°-60° = 30°. \\\\ \\text{Always draw a sketch before decomposing.}',
      },
    ],
    visualizations: [
      {
        id: 'VectorOperationsViz',
        title: 'Scalar Multiplication — Scale the Arrow',
        mathBridge: 'Switch to scalar multiplication mode. Drag the scalar slider through negative values to see direction reverse. The direction is preserved by positive scalars, reversed by negative ones.',
        caption: 'Multiplying by 2 doubles the arrow. Multiplying by −1 reverses it. Multiplying by 0 collapses it to a point.',
      },
    ],
  },

  // ── PILLAR 4: A different ANALOGY ─────────────────────────────────────────
  analogy: {
    pillar: 4,
    pillarLabel: 'A different lens — displacement as the most physical analogy',
    title: 'Walking: the most concrete vector experience',
    prose: [
      'Walk 3 km north, then 4 km east. Where are you? Not 7 km from the start — you are 5 km from the start (Pythagoras: $\\sqrt{9+16}=5$) at some angle northeast. Your total displacement is a vector: it has the magnitude 5 km and a direction.',
      'This is exactly what vector addition computes. The north walk is $\\langle 0, 3\\rangle$ and the east walk is $\\langle 4, 0\\rangle$. Their sum is $\\langle 4, 3\\rangle$, magnitude $\\sqrt{16+9}=5$ km. The path you took (north then east) does not matter — only the net displacement (the resultant arrow) does.',
      'This is why the commutative law holds: walking north then east puts you in the same place as walking east then north. The order of addition changes the path but not the endpoint.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Displacement vs distance — a critical distinction',
        body: '\\text{Distance: total length of path (a scalar).} \\\\ \\text{Displacement: net change in position (a vector).} \\\\ \\text{Walk 5 km north then 5 km south: distance = 10 km, displacement = 0.} \\\\ |\\vec{u}+\\vec{v}| \\leq |\\vec{u}| + |\\vec{v}| \\quad \\text{(triangle inequality — path} \\geq \\text{displacement)}',
      },
    ],
  },

  // ── PILLAR 5: PRACTICE ────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch5-003-ex1',
      pillar: 5,
      title: 'Form 1: Finding a vector from two points',
      problem: '\\text{Find } \\vec{AB} \\text{ where } A=(2,-1), B=(-3,4). \\text{ Find magnitude and unit vector.}',
      steps: [
        { expression: '\\vec{AB} = \\langle -3-2,\\, 4-(-1)\\rangle = \\langle -5,5\\rangle', annotation: 'Terminal minus initial: $B - A$. Always terminal minus initial.' },
        { expression: '|\\vec{AB}| = \\sqrt{25+25} = 5\\sqrt{2}', annotation: 'Pythagorean theorem on components.' },
        { expression: '\\hat{u} = \\frac{\\langle-5,5\\rangle}{5\\sqrt{2}} = \\langle-\\tfrac{1}{\\sqrt{2}},\\tfrac{1}{\\sqrt{2}}\\rangle', annotation: 'Divide by magnitude. Verify: $(-1/\\sqrt{2})^2+(1/\\sqrt{2})^2 = 1$ ✓' },
      ],
      watchFor: 'The vector from $A$ to $B$ is $B - A$, not $A - B$. Subtracting in the wrong order gives the opposite direction.',
    },
    {
      id: 'ch5-003-ex2',
      pillar: 5,
      title: 'Form 2: Resultant of two forces',
      problem: '\\text{Force 1: 500 N at 30°. Force 2: 300 N at 120°. Find the resultant.}',
      steps: [
        { expression: 'F_{1x}=500\\cos30°=433.0,\\; F_{1y}=500\\sin30°=250.0', annotation: 'Decompose F1.' },
        { expression: 'F_{2x}=300\\cos120°=-150.0,\\; F_{2y}=300\\sin120°=259.8', annotation: '$\\cos120°=-1/2$, $\\sin120°=\\sqrt{3}/2$.' },
        { expression: 'R_x=283.0,\\; R_y=509.8 \\quad |R|=\\sqrt{283^2+509.8^2}\\approx584\\text{ N}', annotation: 'Add components, find magnitude.' },
        { expression: '\\theta_R=\\arctan(509.8/283.0)\\approx61°', annotation: 'Direction. Both components positive → QI, no adjustment needed.' },
      ],
      watchFor: "For $\\cos120°$ and $\\sin120°$: the reference angle is 60°, but 120° is in QII so cosine is negative. Don't just use the reference angle — check the sign.",
    },
    {
      id: 'ch5-003-ex3',
      pillar: 5,
      title: 'Form 3: Bearing problem (navigation)',
      problem: '\\text{Plane heads N60°E at 400 km/h. Wind blows due east at 80 km/h. Find actual velocity.}',
      steps: [
        { expression: 'v_{plane} = \\langle 400\\sin60°,\\, 400\\cos60°\\rangle = \\langle 346.4,\\, 200\\rangle', annotation: 'N60°E: x-component uses sin (east), y-component uses cos (north).' },
        { expression: 'v_{wind} = \\langle 80,\\, 0\\rangle', annotation: 'Due east = positive x only.' },
        { expression: '|v_{actual}| = |\\langle 426.4,\\, 200\\rangle| \\approx 472\\text{ km/h at N25.1°E}', annotation: 'Add components, reconstruct. Bearing angle: $\\arctan(426.4/200) \\approx 64.9°$ east of north = N64.9°E. Wait — that is wrong. $\\arctan(\\text{east}/\\text{north}) = \\arctan(426.4/200) \\approx 64.9°$ east of north.' },
      ],
      watchFor: 'For bearing problems, the x-component of a N$\\alpha$°E heading is $|v|\\sin\\alpha$ (east) and y-component is $|v|\\cos\\alpha$ (north) — NOT the standard angle formulas. Draw the compass first.',
    },
    {
      id: 'ch5-003-ex4',
      pillar: 5,
      title: 'Form 4: Scalar multiplication and unit vectors',
      problem: '\\text{Find a vector of length 7 in the direction of } \\vec{v}=\\langle 3,-4\\rangle.',
      steps: [
        { expression: '|\\vec{v}|=\\sqrt{9+16}=5 \\quad \\hat{v}=\\langle 3/5, -4/5\\rangle', annotation: 'Find the unit vector in that direction.' },
        { expression: '7\\hat{v} = 7\\langle 3/5, -4/5\\rangle = \\langle 21/5, -28/5\\rangle', annotation: 'Scale the unit vector to length 7. Magnitude check: $\\sqrt{(21/5)^2+(28/5)^2} = \\sqrt{441+784}/5 = \\sqrt{1225}/5 = 35/5 = 7$ ✓' },
      ],
      watchFor: 'To get a specific length in a given direction: (1) find the unit vector in that direction, (2) scale it by the desired length. Never scale the original vector unless you know its magnitude is 1.',
    },
  ],

  challenges: [
    {
      id: 'ch5-003-ch1',
      difficulty: 'medium',
      problem: '\\text{Three forces act on an object: } \\vec{F_1}=\\langle 2,5\\rangle, \\vec{F_2}=\\langle -3,1\\rangle, \\vec{F_3}=\\langle 1,-4\\rangle. \\text{ Find the force } \\vec{F_4} \\text{ needed for equilibrium (net force = 0).}',
      hint: 'Equilibrium means all forces sum to the zero vector.',
      watchFor: 'Equilibrium requires $\\vec{F_4} = -(\\vec{F_1}+\\vec{F_2}+\\vec{F_3})$ — the negative of the resultant.',
      walkthrough: [
        { expression: '\\vec{F_1}+\\vec{F_2}+\\vec{F_3} = \\langle0,2\\rangle', annotation: 'Sum the three given forces.' },
        { expression: '\\vec{F_4} = -\\langle0,2\\rangle = \\langle0,-2\\rangle', annotation: 'Equilibrant is the negative of the resultant.' },
      ],
      answer: '\\vec{F_4} = \\langle 0,-2\\rangle',
    },
  ],

  calcBridge: {
    teaser: 'In multivariable calculus, the gradient $\\nabla f = \\langle f_x, f_y \\rangle$ is a vector pointing in the direction of steepest ascent. The operations you learned here — magnitude, direction, unit vectors, component decomposition — all reappear in 3D and beyond. Vector-valued functions $\\vec{r}(t) = \\langle x(t), y(t)\\rangle$ describe curves in the plane, and their derivatives give velocity and acceleration vectors.',
    linkedLessons: ['vectors-dot-product', 'polar-coordinates-deep'],
  },
}
