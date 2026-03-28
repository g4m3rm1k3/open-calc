export default {
  id: 'p1-ch3-100',
  slug: 'projectile-examples',
  chapter: 'p3',
  order: 4,
  title: 'Projectile Worked Examples',
  subtitle: 'Full multi-step problems combining range, height, and velocity — plus a symmetry result from energy conservation.',
  tags: ['projectile-motion', 'worked-examples', 'kinematics-2d', 'problem-solving'],

  hook: {
    question: 'A cannonball is fired and lands on level ground. Is its final speed when it hits the ground the same as its launch speed?',
    realWorldContext: 'Pulling together range, height, time, and velocity in a single problem is the real skill. These worked examples build confidence with the full problem-solving workflow: decompose → solve vertically → solve horizontally → combine. The final symmetry result previews energy conservation — a powerful connection you will formalize in Ch5.',
    previewVisualizationId: 'ProjectileExamplesViz',
  },

  intuition: {
    prose: [
      'Every projectile problem follows the same four-step workflow: (1) decompose v₀ into components, (2) use the vertical equation to find time(s) of interest, (3) use the horizontal equation to find x, (4) combine results to answer the specific question.',
      'Cliff problems are a common variant: horizontal throw (v₀y = 0) from a height H. The fall time depends only on H, and the horizontal distance depends only on v₀x and that fall time.',
      'A hidden symmetry: for a projectile launched and landing at the same height, the final speed |v_f| equals the launch speed v₀. The final velocity direction is mirrored below the horizontal. This is a preview of energy conservation — no energy was added or removed.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Problem-solving workflow',
        body: '1.\\;\\text{Decompose }v_0 \\quad 2.\\;\\text{Solve }y(t)\\text{ for }t \\quad 3.\\;\\text{Find }x = v_{0x}t \\quad 4.\\;\\text{Combine}',
      },
      {
        type: 'insight',
        title: 'Speed symmetry (flat ground)',
        body: '|\\mathbf{v}_{\\text{land}}| = |\\mathbf{v}_0| = v_0 \\quad \\text{(when launch and landing heights match)}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'projectile-arc' },
        title: 'Symmetric arc: same speed at launch and landing',
        caption: 'Velocity vectors at launch and landing are mirror images about the vertical through the peak. The horizontal component vₓ is identical at both ends; the vertical component has equal magnitude but opposite sign.',
      },
      {
        id: 'ProjectileExamplesViz',
        title: 'Step-by-step projectile problem solver',
        mathBridge: 'Follow each variable as it is computed: first v₀x and v₀y, then t_land or t_fall, then x, then final velocity components.',
        caption: 'The four-step workflow applied visually.',
      },
    ],
  },

  math: {
    prose: [
      'For cliff problems, the key equation is y = −½gt² (with v₀y = 0). Solve for t first, then everything else follows.',
      'For full-angle launches, a handy shortcut for 37°/53° angles: use R = 2v₀x·v₀y/g instead of the full sin(2θ) formula — it avoids the double-angle step.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Final speed at landing (flat ground)',
        body: '|\\mathbf{v}_f|^2 = v_{fx}^2 + v_{fy}^2 = v_{0x}^2 + v_{0y}^2 = v_0^2 \\Rightarrow |\\mathbf{v}_f| = v_0',
      },
      {
        type: 'warning',
        title: 'Angle of final velocity',
        body: 'The final speed equals v₀ but the direction is \\theta below the horizontal (not above). The ball arrives at the same angle it left, mirrored downward.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The speed symmetry |v_land| = v₀ can be proven purely from kinematics, without invoking energy conservation.',
      'At landing, vx = v₀x (unchanged) and vy_land = −v₀y (from free-fall symmetry: the ball falls back with equal vertical speed). Therefore |v_land|² = v₀x² + v₀y² = v₀². This is a preview of the work-energy theorem from Ch5.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Kinematic proof of speed symmetry',
        body: 'v_{fy} = v_{0y} - g\\cdot t_{\\text{land}} = v_{0y} - g\\cdot\\frac{2v_{0y}}{g} = -v_{0y} \\Rightarrow |\\mathbf{v}_f|^2 = v_{0x}^2 + v_{0y}^2 = v_0^2',
      },
    ],
    visualizationId: 'ProjectileSymmetry',
    proofSteps: [
      {
        title: 'Write final vertical velocity at t_land',
        expression: 'v_{fy} = v_{0y} - g\\cdot t_{\\text{land}}',
        annotation: 'Standard kinematic equation for vy at any time.',
      },
      {
        title: 'Substitute t_land = 2v₀y/g',
        expression: 'v_{fy} = v_{0y} - g \\cdot \\frac{2v_{0y}}{g} = v_{0y} - 2v_{0y} = -v_{0y}',
        annotation: 'The vertical speed at landing equals the launch vertical speed, but directed downward.',
      },
      {
        title: 'Compute final speed',
        expression: '|\\mathbf{v}_f|^2 = v_{fx}^2 + v_{fy}^2 = v_{0x}^2 + (-v_{0y})^2 = v_{0x}^2 + v_{0y}^2 = v_0^2',
        annotation: 'Horizontal component is unchanged; both squared terms equal their launch values.',
      },
      {
        title: 'Final result',
        expression: '|\\mathbf{v}_f| = v_0',
        annotation: 'The landing speed equals the launch speed. This is kinematic confirmation of energy conservation.',
      },
    ],
    title: 'Derivation: Speed at landing equals launch speed',
    visualizations: [
      {
        id: 'ProjectileSymmetry',
        title: 'Velocity mirror symmetry about the peak',
        mathBridge: 'The vertical component reverses sign at landing while horizontal stays fixed. The Pythagorean combination gives the same magnitude v₀ — a pure algebraic symmetry.',
        caption: 'Launch and landing speeds are equal. This will be re-derived using energy conservation in Ch5.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-100-ex1',
      title: 'Cliff problem — horizontal throw',
      problem: 'A ball is thrown horizontally at v_0 = 15\\,\\text{m/s} from the top of a 45\\,\\text{m} cliff. Use g = 10\\,\\text{m/s}^2. Find (a) time to hit ground, (b) horizontal range, (c) final speed.',
      steps: [
        {
          expression: '45 = \\tfrac{1}{2}(10)t^2 \\Rightarrow t^2 = 9 \\Rightarrow t = 3\\,\\text{s}',
          annotation: 'Vertical fall: 45 = ½gt². Note v₀y = 0 for a horizontal throw.',
        },
        {
          expression: 'x = v_{0x}\\cdot t = 15 \\times 3 = 45\\,\\text{m}',
          annotation: 'Horizontal range: constant velocity for 3 s.',
        },
        {
          expression: 'v_{fy} = g\\,t = 10 \\times 3 = 30\\,\\text{m/s}\\;(\\text{downward})',
          annotation: 'Final vertical speed from free fall.',
        },
        {
          expression: '|\\mathbf{v}_f| = \\sqrt{v_{0x}^2 + v_{fy}^2} = \\sqrt{15^2 + 30^2} = \\sqrt{225 + 900} = \\sqrt{1125} = 15\\sqrt{5} \\approx 33.5\\,\\text{m/s}',
          annotation: 'Combine both components via Pythagorean theorem.',
        },
      ],
      conclusion: 'The ball takes 3 s to fall, lands 45 m from the cliff base, and hits the ground at ≈ 33.5 m/s.',
    },
    {
      id: 'ch3-100-ex2',
      title: 'Full launch at angle — height, range, and final speed',
      problem: 'A ball is launched at v_0 = 25\\,\\text{m/s} at \\theta = 53°. Use \\sin 53° = 0.8,\\;\\cos 53° = 0.6 and g = 10\\,\\text{m/s}^2. Find h_{\\max}, range R, and final speed at landing.',
      steps: [
        {
          expression: 'v_{0x} = 25(0.6) = 15\\,\\text{m/s}, \\quad v_{0y} = 25(0.8) = 20\\,\\text{m/s}',
          annotation: 'Decompose launch velocity.',
        },
        {
          expression: 'h_{\\max} = \\frac{v_{0y}^2}{2g} = \\frac{400}{20} = 20\\,\\text{m}',
          annotation: 'Maximum height using h = v₀y²/(2g).',
        },
        {
          expression: 'R = \\frac{2\\,v_{0x}\\,v_{0y}}{g} = \\frac{2(15)(20)}{10} = \\frac{600}{10} = 60\\,\\text{m}',
          annotation: 'Range using the component form R = 2v₀x·v₀y/g.',
        },
        {
          expression: '|\\mathbf{v}_{\\text{land}}| = v_0 = 25\\,\\text{m/s}',
          annotation: 'Speed symmetry: launch and landing heights are equal, so final speed = launch speed.',
        },
      ],
      conclusion: 'Maximum height = 20 m, range = 60 m, final speed = 25 m/s (same as launch).',
    },
  ],

  challenges: [
    {
      id: 'ch3-100-ch1',
      difficulty: 'medium',
      problem: 'A stone is thrown horizontally from a bridge. It hits the water 4\\,\\text{s} later, 60\\,\\text{m} from the base of the bridge. Use g = 10\\,\\text{m/s}^2. Find (a) the height of the bridge, (b) the initial horizontal speed, (c) the speed just before impact.',
      hint: 'Use vertical equation to find height (v₀y = 0), horizontal equation to find v₀x, then combine for final speed.',
      walkthrough: [
        {
          expression: 'H = \\tfrac{1}{2}g t^2 = \\tfrac{1}{2}(10)(16) = 80\\,\\text{m}',
          annotation: 'Bridge height from vertical free fall.',
        },
        {
          expression: 'v_{0x} = \\frac{x}{t} = \\frac{60}{4} = 15\\,\\text{m/s}',
          annotation: 'Initial horizontal speed.',
        },
        {
          expression: 'v_{fy} = g\\,t = 10(4) = 40\\,\\text{m/s}, \\quad |v_f| = \\sqrt{15^2 + 40^2} = \\sqrt{225 + 1600} = \\sqrt{1825} \\approx 42.7\\,\\text{m/s}',
          annotation: 'Final speed from Pythagorean combination.',
        },
      ],
      answer: 'Bridge height = 80 m, v₀x = 15 m/s, impact speed ≈ 42.7 m/s.',
    },
    {
      id: 'ch3-100-ch2',
      difficulty: 'hard',
      problem: 'A ball is launched at \\theta = 37° and lands on flat ground 120\\,\\text{m} away. Use \\sin 37° = 0.6,\\;\\cos 37° = 0.8 and g = 10\\,\\text{m/s}^2. Find v_0, h_{\\max}, and the time of flight.',
      hint: 'Use the range formula to find v₀, then compute the other quantities from components.',
      walkthrough: [
        {
          expression: 'R = \\frac{v_0^2 \\sin 2(37°)}{10} = \\frac{v_0^2 \\sin 74°}{10}',
          annotation: 'sin(74°) = sin(2×37°) = 2sin(37°)cos(37°) = 2(0.6)(0.8) = 0.96.',
        },
        {
          expression: '120 = \\frac{0.96\\,v_0^2}{10} \\Rightarrow v_0^2 = \\frac{1200}{0.96} = 1250 \\Rightarrow v_0 = 25\\sqrt{2} \\approx 35.4\\,\\text{m/s}',
          annotation: 'Solve for launch speed.',
        },
        {
          expression: 'v_{0y} = 35.4(0.6) \\approx 21.2\\,\\text{m/s} \\Rightarrow h_{\\max} = \\frac{(21.2)^2}{20} \\approx 22.5\\,\\text{m}',
          annotation: 'Max height from vertical component.',
        },
        {
          expression: 't_{\\text{total}} = \\frac{2v_{0y}}{g} = \\frac{2(21.2)}{10} \\approx 4.24\\,\\text{s}',
          annotation: 'Total flight time = 2 × time to peak.',
        },
      ],
      answer: 'v₀ ≈ 35.4 m/s, h_max ≈ 22.5 m, flight time ≈ 4.24 s.',
    },
  ],
}
