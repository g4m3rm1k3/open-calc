export default {
  id: 'p0-002',
  slug: 'units-and-dimensions',
  chapter: 'p0',
  order: 1,
  title: 'Units and Dimensions',
  subtitle: 'The grammar of physics equations — why 9.8 without "m/s²" is meaningless, and how units expose algebra errors.',
  tags: ['SI units', 'dimensions', 'dimensional analysis', 'unit conversion', 'significant figures', 'meters', 'kilograms', 'seconds'],

  hook: {
    question:
      `In 1999, NASA lost the Mars Climate Orbiter a 327 million spacecraft — because one engineering team reported thruster force in pound-force seconds, and another team's software expected newton-seconds. Nobody caught it. The spacecraft entered the Martian atmosphere at the wrong angle and burned up. A $327 million mistake caused by a unit mismatch. How does something this simple destroy a spacecraft — and how do you make sure it never happens to you?`,
    realWorldContext:
      `Units are not administrative overhead. They are physical reality encoded in mathematics. Every number in physics is incomplete without a unit — "9.8" means nothing; "9.8 m/s²" is a specific claim about the universe. Dimensional analysis — tracking units through every calculation — is the single fastest way to find algebra errors, check whether an equation could possibly be right, and convert between measurement systems. Engineers, physicists, chemists, and pharmacists all use it daily. You will use it in every chapter of this course.`,
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `**Every number in physics has a physical type — its dimension.** The dimension of a quantity tells you *what kind of thing it is*: a length, a time, a mass, a speed. The unit tells you *how big your measuring stick is*: meters vs feet, seconds vs hours. You can change units freely — 1 meter = 100 centimeters — but you cannot change dimension: a length is always a length, never a time. When an equation adds a length to a time, something has gone catastrophically wrong.`,

      `**The SI system — the universal language of physics.** The International System of Units (SI) defines seven base units from which every other unit is built. In mechanics, you need exactly three: the **meter** [m] for length, the **kilogram** [kg] for mass, and the **second** [s] for time. Every mechanics quantity — velocity, force, energy, pressure — is a combination of these three. Velocity: [m/s]. Acceleration: [m/s²]. Force: [kg·m/s²] (which we call a Newton). Energy: [kg·m²/s²] (which we call a Joule). Learning these combinations is not memorization — it is understanding what the quantity *is*.`,

      `**Dimensional analysis: the most powerful error-checking tool in physics.** Here is the central rule: **both sides of every equation must have the same dimension**. If the left side is a length [m] and the right side comes out to [m/s], the equation is wrong — period. No amount of numerical cleverness can fix a dimensional mismatch. This means you can check any equation you derive, without knowing the answer, just by tracking units. It is a complete, automatic error-detector.`,

      `**Unit conversion: multiply by 1, cleverly.** Converting between units is just multiplication by a cleverly written "1". 1 minute = 60 seconds, so (1 min / 60 s) = 1. Multiply any quantity by this fraction and you change the label without changing the physical value. 60 km/h × (1000 m / 1 km) × (1 h / 3600 s) = 16.67 m/s. Every unit except the one you want cancels — like factors in algebra. Set it up so the unit you are removing appears in the denominator of the conversion factor, and the unit you want appears in the numerator. Then cancel.`,

      `**Order of magnitude: knowing when to care about precision.** Not all problems need 6 decimal places. A rough estimate within a factor of 10 is often enough to check feasibility, catch blunders, or choose a method. The mass of a car is "about 1,000 kg" — whether it is 980 kg or 1,100 kg rarely matters in a first calculation. This is called an **order of magnitude** estimate. Galileo, Fermi, and Einstein all used them constantly. A physicist who insists on 5 significant figures for a rough estimate wastes time; one who ignores units entirely destroys spacecraft.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 8 — Chapter 0: Orientation',
        body:
          `**Previous (Lesson 1):** What physics is — the model-building cycle, Galileo, free fall.\\n**This lesson:** Units, dimensions, SI system, dimensional analysis, conversion.\\n**Next (Lesson 3):** Variables and functions — what x(t) really means.\\n**Why it matters:** Every equation in every future lesson carries units. Catch errors here.`,
      },
      {
        type: 'definition',
        title: 'The three SI base units of mechanics',
        body:
          `\\text{Length: meter [m] — distance from one point to another}\\\\\\text{Mass: kilogram [kg] — amount of matter}\\\\\\text{Time: second [s] — duration of an interval}\\\\\\text{Everything else is built from these three.}`,
      },
      {
        type: 'definition',
        title: 'Dimension vs Unit',
        body:
          `\\text{Dimension = the physical type of a quantity (length, mass, time, ...)}\\\\\\text{Unit = the scale used to measure it (m, cm, ft, km, ...)}\\\\\\text{Example: velocity has dimension [L/T]; unit is m/s or km/h.}`,
      },
      {
        type: 'theorem',
        title: 'Principle of Dimensional Homogeneity',
        body:
          `\\text{Every term in a valid physics equation must have the same dimension.}\\\\\\text{You can only add or subtract quantities of the same dimension.}\\\\\\text{If dimensions don't match, the equation is wrong.}`,
      },
      {
        type: 'insight',
        title: 'Derived units — combinations of base units',
        body:
          `\\text{Velocity: [m/s] = [L T}^{-1}\\text{]}\\\\\\text{Acceleration: [m/s}^2\\text{] = [L T}^{-2}\\text{]}\\\\\\text{Force (Newton): [kg·m/s}^2\\text{] = [M L T}^{-2}\\text{]}\\\\\\text{Energy (Joule): [kg·m}^2\\text{/s}^2\\text{] = [M L}^2 \\text{ T}^{-2}\\text{]}`,
      },
      {
        type: 'warning',
        title: 'The NASA Mars Orbiter lesson',
        body:
          `Never mix unit systems within a calculation. Always label every number with its unit. If a number arrives from outside your calculation (from a table, another engineer, a sensor), verify its unit explicitly before using it.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dimensions-equation' },
        title: 'Dimensional check of the SUVAT equations',
        mathBridge:
          `Before reading the diagram, pick one SUVAT term — say "½at²" — and ask: what dimension is it? a has dimension [L/T²] and t² has dimension [T²], so a×t² has dimension [L]. The diagram shows every term being checked this way. Notice: every single term has dimension [L] (length). They can all be added together — the equation is dimensionally valid.`,
        caption: 'Every term in Δx = v₀t + ½at² has dimension [m] — the equation passes the dimensional test.',
      },
      {
        id: 'PythonNotebook',
        title: 'Unit conversion with Python — and catching errors with dimensional analysis',
        mathBridge:
          `Run each cell. Stage 1 shows how unit conversion is just multiplication by 1. Stage 2 shows how to track units through a calculation. Stage 3 shows a deliberate unit error — observe how the result makes no physical sense.`,
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Unit Conversion (multiply by 1)',
              prose: `Converting between units means multiplying by a fraction equal to 1. The value doesn't change; the label does.`,
              instructions: 'Run. Then change speed_kmh to other values.',
              code: [
                '# Converting km/h to m/s',
                'speed_kmh = 100  # km/h',
                '',
                '# Multiply by (1000 m / 1 km) and (1 h / 3600 s)',
                'speed_ms = speed_kmh * (1000 / 1) * (1 / 3600)',
                '',
                'print(f"{speed_kmh} km/h = {speed_ms:.4f} m/s")',
                'print(f"Check: 100 km/h ≈ 27.78 m/s ✓")',
                '',
                '# A useful fact: 1 m/s = 3.6 km/h',
                'print(f"\\nConversion factor: 1 m/s = {1*3600/1000:.1f} km/h")',
              ].join('\n'),
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Track Units Through a Calculation',
              prose: `Use x = ½at². Track the units at every step to confirm the result is in meters.`,
              instructions: 'Run. Change a and t to see how units automatically validate the equation.',
              code: [
                '# x = ½ a t²',
                'a = 9.8   # m/s²',
                't = 3.0   # s',
                '',
                '# Step by step with units',
                't_squared = t**2         # s²',
                'a_times_t2 = a * t_squared  # (m/s²) × s² = m',
                'x = 0.5 * a_times_t2     # m',
                '',
                'print(f"t² = {t_squared} s²")',
                'print(f"a × t² = {a} m/s² × {t_squared} s² = {a_times_t2} m")',
                'print(f"x = ½ × {a_times_t2} m = {x} m")',
                'print(f"\\nUnits: (m/s²)(s²) = m ✓ — dimension [L]")',
              ].join('\n'),
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — Spotting a Unit Error',
              prose: `A unit error produces a result that looks like a number but means nothing. Let's see one.`,
              instructions: 'Run. The "distance" result is in kg·m/s — not meters. This is physically nonsense.',
              code: [
                '# WRONG: accidentally using F=ma result instead of acceleration',
                'mass = 5.0    # kg',
                'a = 9.8       # m/s²',
                't = 3.0       # s',
                '',
                '# A confused student uses F instead of a',
                'F = mass * a  # kg·m/s²  (this is a force, not acceleration!)',
                'wrong_distance = 0.5 * F * t**2',
                '',
                'print(f"F = {F} kg·m/s²")',
                'print(f"WRONG x = ½ × F × t² = {wrong_distance}")',
                'print(f"Units: (kg·m/s²)(s²) = kg·m  ← NOT meters!")',
                'print(f"\\nThe number looks fine. The units reveal the error.")',
                '',
                '# Correct version:',
                'correct_distance = 0.5 * a * t**2',
                'print(f"\\nCorrect x = ½ × a × t² = {correct_distance} m ✓")',
              ].join('\n'),
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Convert 60 mph to m/s',
              difficulty: 'medium',
              prompt:
                `Convert 60 miles per hour to meters per second. Store the result in speed_ms. Use: 1 mile = 1609.34 m, 1 hour = 3600 s.`,
              instructions:
                `1. Start from 60 mph as a number.\n2. Multiply by (1609.34 m / 1 mile) to get m/h.\n3. Multiply by (1 h / 3600 s) to get m/s.`,
              code: [
                '# Convert 60 mph to m/s',
                'speed_mph = 60  # miles/hour',
                '',
                '# Your calculation here:',
                'speed_ms = ',
                '',
                'print(f"60 mph = {speed_ms:.4f} m/s")',
              ].join('\n'),
              output: '',
              status: 'idle',
              testCode: [
                'expected = 60 * 1609.34 / 3600',
                'if abs(speed_ms - expected) > 0.1:',
                '    raise ValueError(f"Expected ≈{expected:.4f} m/s, got {speed_ms}")',
                'res = f"SUCCESS: 60 mph = {speed_ms:.4f} m/s ≈ 26.82 m/s"',
                'res',
              ].join('\n'),
              hint: 'speed_ms = 60 * 1609.34 / 3600',
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      `**Dimensional analysis as algebra.** Dimensions behave exactly like algebraic variables: they multiply, divide, cancel. Write every unit as a fraction and cancel like terms. 60 km/h = 60 × (km/h). To convert: multiply by (1000 m / 1 km) and (1 h / 3600 s). km cancels with km; h cancels with h. Result: 60 × 1000/3600 m/s = 16.67 m/s.`,
      `**Checking a formula: does ½at² have dimension [m]?** Step 1: Write the dimensions. [a] = m/s² and [t²] = s². Step 2: Multiply. [a·t²] = (m/s²)(s²) = m·s²/s² = m. The s² cancels. Result: [½at²] = m. ✓ It has dimension length — exactly what we need for a displacement.`,
      `**Significant figures — how many digits are justified.** Every measurement has uncertainty. The number of *significant figures* (sig figs) encodes how precise the measurement is. 9.8 m/s² has 2 sig figs. 9.80 m/s² has 3. 9.800 m/s² has 4. When multiplying or dividing, the result can have no more sig figs than the least precise input. 9.8 × 3.0 = 29 (2 sig figs), not 29.4000. When adding or subtracting, align decimal places: 9.80 + 0.3 = 10.1 (limited by 0.3).`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Unit conversion algorithm',
        body:
          `\\text{Multiply by } \\frac{\\text{(new unit)}}{\\text{(old unit)}} = 1 \\text{ so old unit cancels.}\\\\\\text{Example: } 100\\,\\frac{\\text{km}}{\\text{h}} \\times \\frac{1000\\,\\text{m}}{1\\,\\text{km}} \\times \\frac{1\\,\\text{h}}{3600\\,\\text{s}} = \\frac{100\\,000}{3600}\\,\\frac{\\text{m}}{\\text{s}} \\approx 27.8\\,\\text{m/s}`,
      },
      {
        type: 'insight',
        title: 'The dimension-check shortcut',
        body:
          `\\text{In } x = v_0 t + \\tfrac{1}{2}at^2:\\\\[v_0 t] = \\frac{\\text{m}}{\\text{s}} \\cdot \\text{s} = \\text{m} \\quad\\checkmark\\\\[\\tfrac{1}{2}at^2] = \\frac{\\text{m}}{\\text{s}^2} \\cdot \\text{s}^2 = \\text{m} \\quad\\checkmark\\\\\\text{Both terms are [m] — they can be added. The equation is dimensionally valid.}`,
      },
      {
        type: 'definition',
        title: 'Significant figures rules',
        body:
          `\\text{× or ÷: answer has as many sig figs as the input with the fewest.}\\\\\\text{+ or −: answer has the same decimal place as the least precise input.}\\\\\\text{Exact numbers (like the "2" in } \\tfrac{1}{2}at^2\\text{) have unlimited sig figs.}`,
      },
      {
        type: 'mnemonic',
        title: 'SI prefixes to know cold',
        body:
          `\\text{kilo- (k): } \\times 10^3 \\quad \\text{mega- (M): } \\times 10^6 \\quad \\text{giga- (G): } \\times 10^9\\\\\\text{centi- (c): } \\times 10^{-2} \\quad \\text{milli- (m): } \\times 10^{-3} \\quad \\text{micro- (μ): } \\times 10^{-6}`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dimensions-equation' },
        title: 'Every term in Δx = v₀t + ½at² checked dimension by dimension',
        mathBridge:
          `Cover the diagram and work out the dimension of each term yourself. Then reveal the diagram to check. This is exactly what you should do with every new formula you encounter.`,
        caption: 'Dimensional homogeneity is a necessary (though not sufficient) condition for a correct equation.',
      },
    ],
  },

  rigor: {
    prose: [
      `**Dimensional analysis as a theorem-checker.** More formally: if $Q$ has dimension $[L^a M^b T^c]$, then any equation $Q = f(...)$ requires every term of $f$ to also have dimension $[L^a M^b T^c]$. This is a theorem — it follows from the requirement that physics laws be independent of the choice of unit scale. Changing from meters to feet multiplies every length by a constant $k$. For an equation to hold in both unit systems, every term must contain the same power of length — otherwise the equation breaks when you change units.`,
      `**The Buckingham Pi theorem — dimensional analysis for the serious.** Given a physical problem with $n$ variables and $k$ independent dimensions, you can form $n - k$ dimensionless groups (called $\\Pi$ groups). The physics of the problem can always be expressed as a relationship among these groups. This is used in fluid mechanics, heat transfer, and engineering design to predict behavior of full-scale systems from small-scale experiments.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why dimensional analysis works — the deep reason',
        body:
          `\\text{Physics laws must be } \\textit{independent of the choice of unit system.}\\\\\\text{Switching from m to cm multiplies every [L] by 100.}\\\\\\text{For an equation to survive this, both sides must scale the same way.}\\\\\\text{This forces both sides to have the same dimension.}`,
      },
      {
        type: 'definition',
        title: 'Dimensionless numbers — when dimension disappears',
        body:
          `\\text{A pure number (like } \\pi \\text{, or a ratio of lengths) has no dimension.}\\\\\\text{Example: } \\theta \\text{ in radians = arc/radius = [m]/[m] = dimensionless.}\\\\\\text{Functions like } \\sin, \\cos, \\ln, e^x \\text{ only take dimensionless inputs.}\\\\\\text{Writing } \\sin(5\\text{ m}) \\text{ is meaningless — } 5\\text{ m} \\text{ is not dimensionless.}`,
      },
    ],
    proofSteps: [
      {
        expression: `\\text{Claim: } [\\Delta x] = [v_0 t + \\tfrac{1}{2}at^2] \\text{ requires all terms to be [L]}`,
        annotation: `We want to verify the SUVAT equation x = v₀t + ½at² is dimensionally consistent.`,
      },
      {
        expression: `[v_0] = \\text{m/s} = \\text{L T}^{-1}`,
        annotation: `v₀ is a velocity — dimension length per time.`,
      },
      {
        expression: `[v_0 t] = \\text{L T}^{-1} \\cdot \\text{T} = \\text{L} \\quad \\checkmark`,
        annotation: `v₀ × t: T cancels T⁻¹. Result: dimension L.`,
      },
      {
        expression: `[a] = \\text{m/s}^2 = \\text{L T}^{-2}`,
        annotation: `a is acceleration — dimension length per time squared.`,
      },
      {
        expression: `[at^2] = \\text{L T}^{-2} \\cdot \\text{T}^2 = \\text{L} \\quad \\checkmark`,
        annotation: `a × t²: T² cancels T⁻². Result: dimension L.`,
      },
      {
        expression: `[\\Delta x] = [v_0 t] + [\\tfrac{1}{2}at^2] = \\text{L} + \\text{L} = \\text{L} \\quad \\checkmark`,
        annotation: `All three terms have dimension L. The equation is dimensionally homogeneous.`,
      },
    ],
    title: 'Proving Δx = v₀t + ½at² passes the dimensional test',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dimensions-equation' },
        title: 'Full dimensional proof, term by term',
        mathBridge: `Follow the proof steps above while looking at the diagram — each arrow corresponds to a step.`,
        caption: 'A dimensional proof is a theorem: any equation failing it is provably wrong.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-002-ex1',
      title: 'Convert 90 km/h to m/s',
      problem: `\\text{A car travels at 90 km/h. What is this speed in m/s?}`,
      steps: [
        {
          expression: `90\\,\\frac{\\text{km}}{\\text{h}} \\times \\frac{1000\\,\\text{m}}{1\\,\\text{km}} \\times \\frac{1\\,\\text{h}}{3600\\,\\text{s}}`,
          annotation: `Write the starting value. Multiply by two conversion fractions — each equals 1.`,
        },
        {
          expression: `= \\frac{90 \\times 1000}{3600}\\,\\frac{\\text{m}}{\\text{s}}`,
          annotation: `km cancels km. h cancels h. Combine numerators and denominators.`,
        },
        {
          expression: `= \\frac{90\\,000}{3600}\\,\\text{m/s} = 25\\,\\text{m/s}`,
          annotation: `90,000 ÷ 3600 = 25. The car travels at 25 m/s.`,
        },
      ],
      conclusion: `90 km/h = 25 m/s. Quick check: 90/3.6 = 25. The factor 3.6 converts km/h → m/s.`,
    },
    {
      id: 'p0-002-ex2',
      title: 'Dimensional check of the kinetic energy formula',
      problem:
        `\\text{The kinetic energy formula is } KE = \\tfrac{1}{2}mv^2. \\text{ Verify it has dimension [energy] = [kg·m²/s²].}`,
      steps: [
        {
          expression: `[m] = \\text{kg} \\qquad [v^2] = (\\text{m/s})^2 = \\text{m}^2/\\text{s}^2`,
          annotation: `Write the dimension of each variable.`,
        },
        {
          expression: `[mv^2] = \\text{kg} \\cdot \\frac{\\text{m}^2}{\\text{s}^2} = \\text{kg}\\cdot\\text{m}^2\\cdot\\text{s}^{-2}`,
          annotation: `Multiply dimensions: kg × m²/s².`,
        },
        {
          expression: `[KE] = [\\tfrac{1}{2}mv^2] = \\text{kg}\\cdot\\text{m}^2/\\text{s}^2 = \\text{J (Joule)} \\quad \\checkmark`,
          annotation: `The ½ is dimensionless. The result has dimension [M·L²·T⁻²], which is the Joule. Correct.`,
        },
      ],
      conclusion: `KE = ½mv² passes the dimensional test. Its unit is kg·m²/s², which we define as the Joule (J).`,
    },
    {
      id: 'p0-002-ex3',
      title: 'Catching an error with dimensional analysis',
      problem:
        `\\text{A student writes: } t = \\sqrt{\\frac{x}{a}} \\text{ for the fall time from height } x. \\text{ Is this dimensionally correct?}`,
      steps: [
        {
          expression: `[x/a] = \\frac{\\text{m}}{\\text{m/s}^2} = \\frac{\\text{m} \\cdot \\text{s}^2}{\\text{m}} = \\text{s}^2`,
          annotation: `Compute the dimension of x/a. Meters cancel; s² remains.`,
        },
        {
          expression: `[\\sqrt{x/a}] = \\sqrt{\\text{s}^2} = \\text{s}`,
          annotation: `Square root of s² is s.`,
        },
        {
          expression: `[t] = \\text{s} \\quad \\checkmark`,
          annotation: `The left side is [s]. The right side is [s]. The equation passes the dimensional test.`,
        },
      ],
      conclusion:
        `The formula t = √(x/a) is dimensionally correct. (The exact formula from x = ½at² is t = √(2x/a); the student dropped the factor of 2, which is a numerical error — but not a dimensional error.)`,
    },
    {
      id: 'p0-002-ex4',
      title: 'Order of magnitude estimate — the height of Mount Everest in SI units',
      problem:
        `\\text{Estimate the height of Mount Everest in meters without looking it up. Then check by converting from feet (29,032 ft, since 1 ft = 0.3048 m).}`,
      steps: [
        {
          expression: `\\text{Estimate: "about 9,000 m" (order of magnitude: } 10^4\\text{ m)}`,
          annotation:
            `Mount Everest is famous for being ~29,000 feet. Feet × 0.3 ≈ meters: 29,000 × 0.3 = 8,700 m. Estimating "about 9,000 m" is a reasonable order-of-magnitude guess.`,
        },
        {
          expression: `29{,}032\\,\\text{ft} \\times \\frac{0.3048\\,\\text{m}}{1\\,\\text{ft}} = 8{,}849\\,\\text{m}`,
          annotation: `Exact conversion. ft cancels ft. Result: 8,849 m.`,
        },
        {
          expression: `\\text{Error: } \\frac{9000 - 8849}{8849} \\approx 1.7\\%`,
          annotation: `Our estimate was only 1.7% high. Order-of-magnitude thinking gives useful answers fast.`,
        },
      ],
      conclusion: `Mount Everest is 8,849 m (≈ 8.85 km) above sea level. Our estimate of ~9 km was excellent.`,
    },
  ],

  challenges: [
    {
      id: 'p0-002-ch1',
      difficulty: 'easy',
      problem: `\\text{Convert 15 m/s to km/h.}`,
      hint: `Multiply by (1 km / 1000 m) × (3600 s / 1 h). The km/h factor is ×3.6.`,
      walkthrough: [
        {
          expression: `15\\,\\frac{\\text{m}}{\\text{s}} \\times \\frac{1\\,\\text{km}}{1000\\,\\text{m}} \\times \\frac{3600\\,\\text{s}}{1\\,\\text{h}}`,
          annotation: `Set up conversion. m cancels m. s cancels s.`,
        },
        {
          expression: `= 15 \\times \\frac{3600}{1000}\\,\\frac{\\text{km}}{\\text{h}} = 15 \\times 3.6 = 54\\,\\text{km/h}`,
          annotation: `15 × 3.6 = 54.`,
        },
      ],
      answer: `54 km/h`,
    },
    {
      id: 'p0-002-ch2',
      difficulty: 'medium',
      problem:
        `\\text{A formula claims: } F = \\frac{mv}{t^2}. \\text{ What dimension does F have under this formula? Is it the same as force [kg·m/s²]? If not, the formula is wrong.}`,
      hint: `Compute [mv/t²] = [kg · m/s / s²] = [kg · m / s³]. Compare to [kg · m / s²].`,
      walkthrough: [
        {
          expression: `[mv/t^2] = \\frac{\\text{kg} \\cdot \\text{m/s}}{\\text{s}^2} = \\frac{\\text{kg}\\cdot\\text{m}}{\\text{s}^3}`,
          annotation: `Compute dimension of mv/t².`,
        },
        {
          expression: `[F] = \\text{kg}\\cdot\\text{m/s}^2 \\neq \\text{kg}\\cdot\\text{m/s}^3`,
          annotation: `Force has [s²] in denominator; this formula gives [s³]. The dimensions do not match.`,
        },
      ],
      answer:
        `The formula F = mv/t² has dimension [kg·m/s³], not [kg·m/s²]. It is dimensionally wrong — the formula cannot be correct.`,
    },
    {
      id: 'p0-002-ch3',
      difficulty: 'hard',
      problem:
        `\\text{You are told: "The period of a pendulum depends only on its length } L \\text{ and the gravitational acceleration } g\\text{." Using dimensional analysis alone, derive the form of the period } T\\text{.}`,
      hint:
        `T has dimension [s]. L has dimension [m]. g has dimension [m/s²]. Find a and b such that [L^a · g^b] = [s]. Set up equations for exponents of m and s.`,
      walkthrough: [
        {
          expression: `[T] = [L^a g^b] = \\text{m}^a \\cdot \\left(\\frac{\\text{m}}{\\text{s}^2}\\right)^b = \\text{m}^{a+b} \\cdot \\text{s}^{-2b}`,
          annotation: `Write the dimension equation in terms of unknowns a and b.`,
        },
        {
          expression: `\\text{Need [s}^1\\text{]:}\\quad -2b = 1 \\Rightarrow b = -\\tfrac{1}{2}`,
          annotation: `Match the exponent of s: −2b = 1, so b = −½.`,
        },
        {
          expression: `\\text{Need [m}^0\\text{]:}\\quad a + b = 0 \\Rightarrow a = \\tfrac{1}{2}`,
          annotation: `Match the exponent of m: a + b = 0, so a = +½.`,
        },
        {
          expression: `T = C \\sqrt{\\frac{L}{g}}`,
          annotation:
            `The period must be proportional to √(L/g). The constant C = 2π (which dimensional analysis cannot determine — you need physics for that).`,
        },
      ],
      answer:
        `T = C√(L/g). Dimensional analysis gives the form; experiment determines C = 2π. Full answer: T = 2π√(L/g).`,
    },
  ],

  semantics: {
    core: [
      { symbol: '[L]', meaning: 'dimension of length — meters, centimeters, kilometers all have this dimension' },
      { symbol: '[M]', meaning: 'dimension of mass — kilograms, grams all have this dimension' },
      { symbol: '[T]', meaning: 'dimension of time — seconds, minutes all have this dimension' },
      { symbol: '[L T^{-1}]', meaning: 'dimension of velocity — length divided by time' },
      { symbol: '[L T^{-2}]', meaning: 'dimension of acceleration — length divided by time squared' },
      { symbol: '[M L T^{-2}]', meaning: 'dimension of force (= Newton) — mass × acceleration' },
      { symbol: '[M L^2 T^{-2}]', meaning: 'dimension of energy (= Joule) — force × length' },
      {
        symbol: '\\text{dimensional homogeneity}',
        meaning:
          `every term in a valid equation has the same dimension; if they differ, the equation is wrong`,
      },
    ],
    rulesOfThumb: [
      `Always write units next to every number. Never write a bare "9.8" — write "9.8 m/s²".`,
      `To convert: multiply by fractions equal to 1 so the unwanted unit cancels.`,
      `Before trusting any formula, check its dimensions — 30 seconds, catches most errors.`,
      `Functions like sin, cos, ln take dimensionless inputs only — if an argument has units, something is wrong.`,
      `When unsure whether two quantities can be added, check if they have the same dimension first.`,
      `Sig figs for multiplication: answer matches fewest sig figs of inputs.`,
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-001',
        label: 'Lesson 1 — What is Physics?',
        note:
          `If the idea of "checking equations" feels abstract, re-read Lesson 1 on models. Dimensional analysis is just checking that your model speaks correct physical grammar.`,
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch2-001',
        label: 'Ch. 2, Lesson 1 — Kinematics: Definitions',
        note:
          `Every kinematic quantity (position, velocity, acceleration) has a SI unit. Ch. 2 uses m/s, m/s², and m throughout — the units from this lesson.`,
      },
      {
        lessonId: 'p1-ch4-002',
        label: "Ch. 4 — Newton's Second Law",
        note:
          `F = ma. The dimension of force is [M·L·T⁻²] = kg·m/s² = Newton. This lesson gives you the tools to verify F = ma dimensionally — and to spot any wrong version of it.`,
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-002-assess-1',
        type: 'input',
        text: `Convert 72 km/h to m/s. Give your answer as a decimal.`,
        answer: '20',
        hint: `72 ÷ 3.6 = 20. Or: 72 × 1000/3600.`,
      },
      {
        id: 'p0-002-assess-2',
        type: 'choice',
        text: `Which dimension does the product "mass × velocity²" have?`,
        options: ['[M·L·T⁻¹]', '[M·L²·T⁻²]', '[M·L²·T⁻¹]', '[M·L·T⁻²]'],
        answer: '[M·L²·T⁻²]',
        hint: `[M] × [L/T]² = [M·L²/T²] = [M·L²·T⁻²]. This is energy.`,
      },
      {
        id: 'p0-002-assess-3',
        type: 'choice',
        text: `A student writes F = mv²/x. What is the dimension of this expression?`,
        options: ['[M·L·T⁻²]', '[M·L⁻¹·T⁻²]', '[M·L·T⁻¹]', '[M·L²·T⁻²]'],
        answer: '[M·L·T⁻²]',
        hint: `[mv²/x] = kg·(m/s)²/m = kg·m/s². This IS force dimension — the formula passes dimensionally.`,
      },
    ],
  },

  mentalModel: [
    `Every number in physics needs a unit — "9.8" alone is meaningless`,
    `SI mechanics: meter [m], kilogram [kg], second [s] — everything else is built from these`,
    `Dimensional homogeneity: both sides of any equation must have the same dimension`,
    `Unit conversion = multiply by 1, written as (new unit / old unit) so old unit cancels`,
    `Dimensional analysis catches formula errors in ~30 seconds — always check before computing`,
    `Functions (sin, ln, exp) take dimensionless inputs only`,
    `Significant figures: multiplication/division → match fewest sig figs; addition/subtraction → match least precise decimal place`,
  ],

  quiz: [
    {
      id: 'units-q1',
      type: 'input',
      text: `Convert 108 km/h to m/s. (Divide by 3.6.)`,
      answer: '30',
      hints: ['108 ÷ 3.6 = 30'],
      reviewSection: 'Examples — unit conversion',
    },
    {
      id: 'units-q2',
      type: 'choice',
      text: `What is the SI unit of force?`,
      options: ['Joule', 'Newton', 'Pascal', 'Watt'],
      answer: 'Newton',
      hints: ['Newton = kg·m/s². It is named after Isaac Newton.'],
      reviewSection: 'Intuition — derived units',
    },
    {
      id: 'units-q3',
      type: 'choice',
      text: `A formula gives a result with dimension [kg·m/s³]. This is the dimension of:`,
      options: ['force', 'energy', 'power', 'none of the above — no standard quantity has this dimension'],
      answer: 'power',
      hints: ['Power = energy/time = [kg·m²/s²] / [s] = [kg·m²/s³]. Close but not quite — think more carefully.'],
      reviewSection: 'Rigor — dimensional analysis',
    },
    {
      id: 'units-q4',
      type: 'choice',
      text: `A formula claims T = √(m·g). Does this pass a dimensional check? (T is period [s], m is mass [kg], g is [m/s²])`,
      options: [
        'Yes — the dimensions match',
        'No — [√(kg·m/s²)] = [kg^{1/2}·m^{1/2}/s] ≠ [s]',
        'Yes — because the square root cancels the dimension',
        'Cannot be determined without more information',
      ],
      answer: 'No — [√(kg·m/s²)] = [kg^{1/2}·m^{1/2}/s] ≠ [s]',
      hints: ['Compute [m·g] = kg·m/s². Then √(kg·m/s²) ≠ s.'],
      reviewSection: 'Challenges — pendulum dimensional analysis',
    },
    {
      id: 'units-q5',
      type: 'input',
      text: `Convert 5 cm/s to m/s. Express as a decimal.`,
      answer: '0.05',
      hints: ['1 cm = 0.01 m. So 5 cm/s = 5 × 0.01 m/s = 0.05 m/s.'],
      reviewSection: 'Math — unit conversion algorithm',
    },
    {
      id: 'units-q6',
      type: 'choice',
      text: `Which of the following equations is dimensionally impossible?`,
      options: [
        'v = v₀ + at',
        'x = v₀ + ½at²',
        'v² = v₀² + 2aΔx',
        'a = Δv/Δt',
      ],
      answer: 'x = v₀ + ½at²',
      hints: ['x has dimension [m]. v₀ has dimension [m/s]. You cannot add [m] and [m/s].'],
      reviewSection: 'Rigor — dimensional proof',
    },
    {
      id: 'units-q7',
      type: 'choice',
      text: `sin(x) requires x to be:`,
      options: ['in meters', 'in seconds', 'dimensionless (a pure number, such as radians)', 'in kilograms'],
      answer: 'dimensionless (a pure number, such as radians)',
      hints: ['Transcendental functions take dimensionless arguments — otherwise the Taylor series mixes [1], [m], [m²], ... which cannot be added.'],
      reviewSection: 'Rigor — dimensionless numbers',
    },
    {
      id: 'units-q8',
      type: 'input',
      text: `The period of a pendulum is T = 2π√(L/g). If L = 1 m and g = 9.8 m/s², what is T in seconds? (Use π ≈ 3.14159.)`,
      answer: '2.006',
      hints: [
        'L/g = 1/9.8 ≈ 0.1020. Then √0.1020 ≈ 0.3194.',
        'T = 2π × 0.3194 ≈ 2.007 s. Accept answers from 2.00 to 2.01.',
      ],
      reviewSection: 'Challenges — pendulum',
    },
  ],
}
