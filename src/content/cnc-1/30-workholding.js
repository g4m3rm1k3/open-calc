/**
 * LESSON: WORKHOLDING
 * Vises, soft jaws, tombstones, fixtures, and the principles that govern them all.
 * Every machined part in history started as a fixturing problem.
 */

export default {
  id: 'cnc-workholding',
  slug: 'workholding',
  chapter: 'cnc-1',
  order: 30,
  title: 'Workholding',
  subtitle: 'Vises, Soft Jaws, Fixtures, and the Six Degrees of Freedom',
  tags: ['workholding', 'vise', 'soft jaws', 'fixture', 'tombstone', 'datum', 'clamp', '6DOF', '3-2-1', 'chucking', 'collet chuck', 'toe clamp', 'strap clamp'],

  semantics: {
    core: [
      {
        symbol: '6 Degrees of Freedom (DOF)',
        meaning:
          'A rigid body in 3D space has 6 possible motions: translation in X, Y, Z and rotation about X (pitch), Y (roll), Z (yaw). ' +
          'Complete workholding means constraining all 6 DOF — no translation, no rotation. ' +
          'Under-constrained: the part can move during cutting (catastrophic). ' +
          'Over-constrained: the part is stressed by the fixture itself (distortion).',
      },
      {
        symbol: '3-2-1 Locating Principle',
        meaning:
          'The minimal, non-redundant method to fully constrain a prismatic part. ' +
          '3 contact points on the primary (base) plane — establishes Z and X/Y rotations (3 DOF). ' +
          '2 contact points on the secondary (side) face — establishes X and Z-rotation (2 DOF). ' +
          '1 contact point on the tertiary (end) face — establishes Y (1 DOF). ' +
          'Total: 6 DOF constrained exactly. Any additional locating points over-constrain.',
      },
      {
        symbol: 'Datum',
        meaning:
          'The reference surface, edge, or feature from which all workpiece measurements originate. ' +
          'In CNC, the datum is the feature you probe to establish Work Coordinate System (WCS) zero. ' +
          'Datum shift: any movement of the part relative to the datum between operations ' +
          'causes dimensional variation. Consistent datums across all operations = dimensional consistency.',
      },
      {
        symbol: 'Precision Machine Vise',
        meaning:
          'The most common milling workholding device. Fixed jaw provides X/Y/Z reference. ' +
          'Moving jaw applies clamping force. Key specs: jaw opening, jaw width, clamping force (kN), parallelism. ' +
          'Kurt D688 (6-inch): industry standard for VMC work. ' +
          'Problem: moving jaw "lift" — the jaw rises as it tightens, causing the part to lift off the parallels. ' +
          'Solution: use a dead-blow mallet to reseat the part after initial tightening.',
      },
      {
        symbol: 'Parallels',
        meaning:
          'Ground steel bars of precise, matched height placed under the part in the vise. ' +
          'Lifts the part so the end mill clears the vise jaws. Must be in matched pairs. ' +
          'The part should rest solidly on both parallels — rocking means a twisted part or contamination. ' +
          'Always confirm by pushing the parallel with your finger — it should not move.',
      },
      {
        symbol: 'Soft Jaws',
        meaning:
          'Replaceable aluminum or mild steel jaw inserts that can be machined to match the exact profile ' +
          'of the part. Used when the part is round, irregular, or requires precise location from a second operation. ' +
          'Procedure: bore the soft jaws while under clamping pressure to eliminate jaw deflection. ' +
          'The bored profile then perfectly matches the part geometry for Op-2 and beyond.',
      },
      {
        symbol: 'Tombstone',
        meaning:
          'A 4-sided or 6-sided block mounted on a 4th-axis rotary table. Parts are mounted on all faces. ' +
          'The rotary index between tool changes, machining multiple parts or multiple sides without manual ' +
          're-fixturing. Used for high-mix, low-volume work where setup time must be minimized.',
      },
      {
        symbol: 'Toe Clamp / Strap Clamp',
        meaning:
          'Direct part clamping to the table using T-nuts and step blocks. Flexible but slow to set up. ' +
          'Toe clamp: contacts the part edge with a wedge-shaped foot — applies downward and inward force. ' +
          'Strap clamp: a bar that spans the part, clamped at both ends — applies purely downward force. ' +
          'Used for parts too large for a vise or requiring access from all sides.',
      },
      {
        symbol: 'Collet Chuck (Lathe)',
        meaning:
          'A precision spring-steel collet grips bar stock or shaft OD. ' +
          'More accurate than a 3-jaw chuck (0.005–0.015 mm TIR vs 0.02–0.05 mm). ' +
          'Limited to round stock (or hex with appropriate collet). ' +
          'ER collets: the standard interchangeable collet system for lathes and mill spindles. ' +
          '5C collets: common on rotary indexers and manual lathes.',
      },
      {
        symbol: 'Clamping Force and Chip Load',
        meaning:
          'The workholding must resist the maximum cutting force without allowing part movement. ' +
          'Cutting force (F_c) can be estimated from material and chip load. ' +
          'The friction force holding the part = µ × clamping force (µ ≈ 0.1–0.15 for metal-on-metal). ' +
          'Under-clamping causes part movement mid-cut — usually detected too late. ' +
          'Safety factor of 3–5× is standard practice.',
      },
    ],
    rulesOfThumb: [
      'Always confirm parallels are not rocking before you tighten. One bad seating ruins the setup.',
      'Machine soft jaws while under clamping load. The jaw deflects when clamped — machine it in the clamped state to compensate.',
      'The primary datum (3-point plane) should always be the largest, most stable surface on the part.',
      'Clamp as close to the cutting forces as possible. Clamping far from the cut introduces lever-arm deflection.',
      'Never rely on a vise to hold a part on its first operation if the part bottom is unmachined (as-cast, saw-cut). The surface is not flat — the part will rock. Use soft jaws or a dedicated fixture.',
      'For any second operation: machine a datum from Op-1 and reference it in Op-2. Never reference a raw surface twice.',
      'Tombstones are most valuable when setup time > machining time. Below 5-minute cycle times, tombstones typically pay for themselves in 2 shifts.',
    ],
  },

  hook: {
    question: 'A part passes all G-code simulation checks, runs correctly on the first piece, and then the 10th piece is 0.4 mm out of location. The program was never changed. What happened?',
    realWorldContext:
      'The workholding shifted. Workholding is the single most common source of dimensional variation in CNC machining — ' +
      'not the G-code, not the machine, not the tool. A vise jaw with 0.02 mm of contamination on the parallel seat ' +
      'tilts the part, translating to a 0.4 mm error at the top of a 20 mm tall workpiece. ' +
      'A clamping sequence done out of order stress-relieves and springs the part. ' +
      'Soft jaws machined without preload spring out 0.05 mm when you put the part in. ' +
      'Every experienced machinist has a workholding failure story. This lesson is how to avoid writing yours.',
  },

  intuition: {
    visualizations: [],
    prose: [
      '**The 3-2-1 Principle in a Standard Vise**: A Kurt vise applies this automatically. ' +
      'The fixed jaw provides the 2-point X-location contact (secondary plane). ' +
      'The parallels provide 2 of the 3 Z-location contacts (primary plane — you need the third from the part width). ' +
      'The stop pin or end of the jaw provides the 1-point Y-location (tertiary plane). ' +
      'When you "ding" a part in against the parallels and stop, you are applying 3-2-1 locating. ' +
      'The vise clamping force is restraint, not location — the part should already be located before the clamp is tight.',

      '**Soft Jaws — The Setup That Pays for Itself**: A typical CNC shop runs the same family of parts for years. ' +
      'A machined aluminum soft jaw set for a 50 mm diameter part costs 30 minutes to make and 3 months to pay off. ' +
      'Once made, setup time drops from 15 minutes (indicate-in a round part) to 2 minutes (drop and clamp). ' +
      'The key is boring the soft jaws under clamping load: close the vise to your desired clamping gap (e.g., 48 mm), ' +
      'then bore the 50 mm pocket. When you open to 50 mm and insert the part, the jaw springs out 1 mm — ' +
      'but in the clamped position, it perfectly matches the 50 mm OD with uniform contact.',

      '**Tombstones and the Spindle Uptime Equation**: On a VMC, the spindle is only making chips while the spindle is turning. ' +
      'Every setup, every table move, every tool change is spindle-off time. ' +
      'A 4-sided tombstone with 4 identical parts loaded means the spindle makes chips on 4 parts per cycle. ' +
      'While the spindle cuts parts 2–4, the operator is loading part 1. ' +
      'Spindle utilization jumps from 40–60% (single vise) to 80–90% (tombstone). ' +
      'This is why job shops invest in 4th-axis tombstone setups for parts they run weekly.',

      '**Clamping Sequence Matters**: For a part with multiple clamps (such as a fixture plate setup), ' +
      'the clamping sequence changes the distortion pattern. ' +
      'Always clamp from the datum outward — never the opposite direction. ' +
      'Sequence: primary datum clamp first → secondary → tertiary → remaining clamps. ' +
      'Clamping from the far end first can spring the part off the datum surface, ' +
      'causing a tilt that won\'t show until you measure the finished part on the CMM.',

      '**Cutting Force vs. Clamping Force — The Safety Factor**: ' +
      'The tangential cutting force in steel at typical roughing parameters is 200–500 N. ' +
      'A standard 150 mm Kurt vise develops 12,000–20,000 N clamping force. ' +
      'The friction coefficient for steel-on-steel (parallels to vise jaw) is ≈ 0.12. ' +
      'Friction force = 0.12 × 15,000 N = 1,800 N. Safety factor: 1,800 / 500 = 3.6×. ' +
      'This is fine for standard milling. However, during a crash or tool catch, ' +
      'instantaneous forces can spike to 10–20× normal — well above any friction force. ' +
      'This is why soft stops and feed overrides exist: they limit peak forces before they move the part.',
    ],
  },

  math: {
    prose: [
      '**Clamping Force Requirement**: To resist a cutting force $F_c$ with a friction coefficient $\\mu$, ' +
      'the required clamping force $F_{clamp}$ is:',
      '$F_{clamp} \\geq \\frac{F_c \\cdot k_{safety}}{\\mu}$',
      'With $F_c = 400\\,\\text{N}$, $\\mu = 0.12$ (steel on ground steel), and $k_{safety} = 3$:',
      '$F_{clamp} \\geq \\frac{400 \\times 3}{0.12} = 10{,}000\\,\\text{N} = 10\\,\\text{kN}$',
      'A standard 6-inch Kurt vise provides 15–20 kN — adequate for most steel milling.',

      '**Lever Arm Effect on Clamp Location**: If the part overhang distance from the vise jaw to ' +
      'the cutting force application point is $L$, the effective lifting moment on the part is:',
      '$M = F_c \\cdot L$',
      'This moment is resisted by the clamping couple. The longer the overhang, ' +
      'the higher the vise clamping force must be to prevent lift — or the part must be supported at the far end.',

      '**Soft Jaw Bore Calculation**: To machine a soft jaw that will grip a diameter $D$ with preload:',
      '$D_{bore} = D - 2 \\delta_{spring}$',
      'where $\\delta_{spring}$ is the spring-back of the jaw when unclamped. ' +
      'In practice, the method is: clamp to the target closing gap (leaving $D$ between jaws), bore to $D$, ' +
      'and the geometry self-compensates without needing to know $\\delta_{spring}$ explicitly.',
    ],
  },

  rigor: {
    prose: [
      '**Thermal Growth and Datum Shift**: A 300 mm long vise body at 20 °C will grow 0.003 mm per °C (steel: 11.7 µm/m/°C). ' +
      'After 2 hours of operation, coolant and cutting heat raise the fixture temperature by 10 °C → 0.035 mm growth. ' +
      'This is the datum shift that "explained" the morning-vs-afternoon tolerance scatter many shops accept as normal. ' +
      'Solutions: machine datum features on the fixture, always re-probe before critical operations, ' +
      'or use Invar (36 Ni-Fe alloy, 1.5 µm/m/°C) fixture plates for precision work.',

      '**Harmonic Clamping and Chatter**: Overly tight clamping on thin-wall parts adds preload that raises the natural frequency. ' +
      'Under-clamping allows micro-vibration that develops into chatter. ' +
      'The optimal clamping force for thin-wall parts is the minimum that prevents movement — ' +
      'add support to the part opposite the cut (a jack screw or support plug) rather than ' +
      'increasing jaw pressure. This raises the natural frequency without adding clamping distortion.',

      '**5-Axis Fixturing — "Fixtures that think"**: In 5-axis machining, the fixture must not only hold the part ' +
      'but must be designed to stay out of the tool envelope during all machine rotations. ' +
      '5-axis fixture design always begins with a tombstone-free-rotation simulation before any metal is cut. ' +
      'A fixture collision at 12,000 rpm B-axis is a total machine loss. ' +
      'Modular fixture systems (Schunk, Jergens Ball Lock, Erowa) allow rapid change while maintaining ' +
      'sub-10 µm repeatability — essential when parts return for Op-2 weeks after Op-1.',
    ],
  },

  examples: [
    {
      id: 'ex-workholding-opsequence',
      title: 'Operation Sequence — Milling a Rectangular Part from Bar Stock',
      problem:
        'You receive a 75 × 50 × 40 mm saw-cut steel billet. ' +
        'You need to machine all six faces, drill 4 holes on the top face, and maintain ±0.05 mm overall. ' +
        'Design the operation sequence and workholding for each operation.',
      steps: [
        {
          expression: 'Op-1: Machine the primary datum (bottom face)',
          annotation:
            'Mount billet on parallels in vise. The saw-cut bottom is uneven — set parallels wide apart. ' +
            'Face mill the TOP surface: this creates Op-1 datum. Light cut (0.5 mm) to clean up without removing stock. ' +
            'Flip: now the clean face is down on the parallels. Face mill the bottom (original saw face). ' +
            'Result: two flat, parallel faces. This is your Op-1 primary datum (Z reference).',
        },
        {
          expression: 'Op-2: Machine the two 75 mm faces (width)',
          annotation:
            'Stand the part on the Op-1 datum face. Mill both 50 × 40 mm side faces. ' +
            'Use a 1-2-3 block or precision parallel against the fixed jaw to locate consistently. ' +
            'Result: four clean, square faces. Part is now a precision rectangular block.',
        },
        {
          expression: 'Op-3: Machine top face + drill holes',
          annotation:
            'Part sits on Op-1 datum. The clean Op-2 face touches the fixed jaw (secondary datum). ' +
            'A stop pin locates the length (tertiary datum). ' +
            'Set WCS G54 from the corner where the fixed jaw and stop intersect — this is the stable datum. ' +
            'Now face mill, drill 4 holes. Every hole position is relative to the same datum used for all prior faces. ' +
            '±0.05 mm is achievable because no datum shift occurred between operations.',
        },
      ],
    },
  ],

  mastery: {
    checkpoints: [
      'Explain the 3-2-1 principle. What does each number represent and which surfaces do they correspond to in a standard vise setup?',
      'Why must soft jaws be bored under clamping load? What defect does this procedure prevent?',
      'A part fails to meet tolerance on every 5th piece but not on pieces 1–4. The program hasn\'t changed. List three workholding-related causes.',
      'Calculate the required clamping force to resist 600 N cutting force with µ=0.12 and a safety factor of 4.',
      'Why is a tombstone more effective for a 3-minute cycle time than a 20-minute cycle time?',
    ],
  },
}
