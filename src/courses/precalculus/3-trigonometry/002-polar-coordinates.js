export default {
  id: 'precalc3-polar-coordinates',
  slug: 'polar-coordinates',
  chapter: 'precalc-3',
  order: 8,
  title: "Polar Coordinates",
  subtitle: "Navigating the 2D plane through angle and radius.",
  tags: ["polar coordinates","graphs"],
  hook: {
    question: "If you're at the center of a lake, does it make more sense to say 'Go 3 miles North and 4 miles East' (Rectangular) or 'Look 53 degrees and travel 5 miles' (Polar)?",
    realWorldContext: 'Radar, Sonar, and planetary orbits all use Polar coordinates. Submarines and Air Traffic Controllers track objects by distance and bearing, not by X-Y grids. Master this, and you master the geometry of the sweep.'
  },
  intuition: {
    prose: [
      '**The Radial Map**: Every point on the plane can be identified by its "Distance from the Center" ($r$) and its "Rotation" ($\\theta$). This is the Polar Coordinate system—a method that mirrors natural scanning motion like the turning of a neck or the sweep of a radar beam.',
      '**The Infinite Address**: Unlike the unique X-Y grid, every polar point has "Infinite Names." Because you can spin around a circle and land back in the same spot, $(r, \\theta)$ is the same as $(r, \\theta + 2k\\pi)$. You can even have negative radii—which mean "Look this way, but step backwards."',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Linguistic Learner: The Language of the Pole',
        body: '\\text{"Pole" refers to the center point (the origin).} \\\\ \\text{"Radial" comes from the same root as "Radius" and "Radiate"—the outward spokes of a wheel that define your distance.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Infinite Address',
        body: '\\text{Rotation is modular.} \\\\ \\text{Every } 360^\\circ \\text{ the world repeats itself. Logic implies that Polar coordinates are an "Iterative Mapping" rather than a unique mapping.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Scanning Radar',
        body: '\\text{Imagine you are a security camera.} \\\\ \\text{You turn your head to a specific angle ($\\theta$) and then look out to a specific distance ($r$). This physical sweep is how drones and satellites calculate their relative position to the earth.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: Concentric Reality',
        body: '\\text{Swap the square graph paper for a target.} \\\\ \\text{Visualizing the coordinate system as concentric circles (radii) and spokes (angles) makes it clear why circles are so easy to write in polar form ($r = 5$), but hard in rectangular form ($x^2 + y^2 = 25$).}',
      },
    ],
  },
  math: {
    prose: [
      'Conversion between Polar and Rectangular forms relies on the standard definition of sine and cosine in a right triangle. The distance to the origin is the hypotenuse, and the x and y coordinates are the horizontal and vertical projections.',
      'To convert from $(r, \\theta)$ to $(x, y)$, used the formulas $x = r\\cos\\theta$ and $y = r\\sin\\theta$. To go backwards from $(x, y)$ to $(r, \\theta)$, use $r^2 = x^2 + y^2$ and $\\tan\\theta = y/x$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Right Triangle Projection',
        body: 'x = r\\cos\\theta \\qquad y = r\\sin\\theta \\\\ \\text{This is the direct trigonometric mapping from rotation to grid position.}',
      },
      {
        type: 'theorem',
        title: 'The Magnitude of Reach',
        body: 'r^2 = x^2 + y^2 \\\\ \\text{This is the Pythagorean distance from the pole.}',
      },
      {
        type: 'warning',
        title: 'The Arctan Pitfall',
        body: '\\theta = \\arctan(y/x) \\text{ requires a sign check.} \\\\ \\text{Because arctan only outputs in Q1 or Q4, you must manually add } \\pi \\text{ if your point is in Q2 or Q3.}',
      },
    ],
  },
  rigor: {
    title: 'Proving Coordinate Conversion via Projection',
    proofSteps: [
      {
         expression: '\\text{Let } (r, \\theta) \\text{ be a point in the polar plane.}',
         annotation: 'Step 1: Set up the radial distance and rotation.'
      },
      {
         expression: '\\text{Opposite} = y, \\text{ Adjacent} = x, \\text{ Hypotenuse} = r',
         annotation: 'Step 2: Construct a right triangle with vertices at the origin, (x,0), and (x,y).'
      },
      {
         expression: '\\cos \\theta = \\frac{x}{r} \\implies x = r\\cos \\theta',
         annotation: 'Step 3: Definition of cosine links horizontal position to radius.'
      },
      {
         expression: '\\sin \\theta = \\frac{y}{r} \\implies y = r\\sin \\theta \\qquad \\blacksquare',
         annotation: 'Step 4: Definition of sine links vertical position to radius.'
      }
    ],
  },
  examples: [
    {
      id: 'ex-polar-equivalents',
      title: 'Encrypting the Spot: Infinite Names',
      problem: '\\text{Give four unique names for the polar point } (2, 30^\\circ).',
      steps: [
        {
          expression: '(2, 30^\\circ + 360^\\circ) = (2, 390^\\circ)',
          annotation: 'Name 1: Add a full rotation.'
        },
        {
          expression: '(-2, 30^\\circ + 180^\\circ) = (-2, 210^\\circ)',
          annotation: 'Name 2: Negative radius—look at 210 degrees but step backward 2 units.'
        },
        {
          expression: '(2, 30^\\circ - 360^\\circ) = (2, -330^\\circ)',
          annotation: 'Name 3: Standard radius with a negative angle.'
        },
        {
          expression: '(-2, 30^\\circ - 180^\\circ) = (-2, -150^\\circ)',
          annotation: 'Name 4: Negative radius with a negative angle.'
        }
      ],
      conclusion: 'A single coordinate in polar is an "Iterative State"—it can be described by infinitely many angle-radius combinations.'
    },
    {
      id: 'ex-polar-circular-eq',
      title: 'Identifying the Curve: The Displaced Circle',
      problem: '\\text{Convert } r = 6\\cos\\theta \\text{ to rectangular form and identify the curve.}',
      steps: [
        {
          expression: 'r^2 = 6r\\cos\\theta',
          annotation: 'Step 1: Multiply both sides by r. This creates the r² and r cos coefficients we need.'
        },
        {
          expression: 'x^2 + y^2 = 6x',
          annotation: 'Step 2: Substitute r² = x² + y² and x = r cos.'
        },
        {
          expression: '(x-3)^2 + y^2 = 9',
          annotation: 'Step 3: Complete the square on the x terms.'
        }
      ],
      conclusion: 'This is a circle centered at (3, 0) with radius 3. Simple polar forms often describe shifted circles.'
    }
  ],
  challenges: [
    {
      id: 'ch3-polar-008-ch1',
      difficulty: 'harder',
      problem: '\\text{The area of a polar sector is } A = \\frac{1}{2}r^2\\theta. \\text{ Use this to prove } A = \\pi r^2 \\text{ for a full circle.}',
      hint: 'Substitute the total angle of a full circle into the sector formula.',
      walkthrough: [
        {
          expression: '\\theta = 2\\pi \\text{ radians}',
          annotation: 'Step 1: A full circle is a rotation of 2 pi.'
        },
        {
          expression: 'A = \\frac{1}{2}r^2(2\\pi)',
          annotation: 'Step 2: Plug the total rotation into the area ratio.'
        },
        {
          expression: 'A = \\pi r^2 \\qquad \\blacksquare',
          annotation: 'Step 3: Simplify. The fundamental area of a circle is simply a full-rotation polar sector.'
        }
      ],
      answer: '\\text{Area} = \\pi r^2'
    }
  ],
}
