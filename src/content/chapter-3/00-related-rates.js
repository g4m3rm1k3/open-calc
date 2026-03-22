// FILE: src/content/chapter-3/00-related-rates.js
export default {
  id: 'ch3-000',
  slug: 'related-rates',
  chapter: 3,
  order: 0,
  title: 'Related Rates',
  subtitle: 'When two quantities are geometrically linked, their rates of change are linked too — by the chain rule',
  tags: ['related rates', 'chain rule', 'implicit differentiation', 'Pythagorean theorem', 'geometry', 'time derivatives', 'optimization preview'],

  hook: {
    question: 'A 10-foot ladder is leaning against a wall. The base slides away from the wall at 2 ft/s. How fast is the top of the ladder sliding DOWN the wall at the moment the base is 6 feet from the wall? At that same moment, is the top sliding down faster or slower than the base is sliding out?',
    realWorldContext: 'Air traffic controllers face this problem every second: a radar system tracks an aircraft\'s slant range (the straight-line distance from the antenna to the plane) and the angle of elevation. The rate of change of slant range and the rate of change of angle are different quantities, linked through trigonometry. Neither one directly gives the aircraft\'s speed, but together they do. The same mathematics governs water draining from conical tanks (a classic engineering problem), balloons inflating, shadows lengthening as the sun moves, and the distances between moving vehicles on a highway. Whenever two geometric quantities are constrained by a relationship — a fixed triangle, a fixed volume, similar triangles — differentiating that constraint with respect to time gives you a new equation linking their rates.',
    previewVisualizationId: 'RelatedRatesLadder',
  },

  intuition: {
    prose: [
      'The key insight behind all related rates problems is this: two quantities are linked by a geometric or physical relationship, and that relationship does not just constrain the values — it also constrains the rates of change. If the position of the base of a ladder is x(t) and the position of the top is y(t), the Pythagorean theorem says x² + y² = L² (where L is the fixed ladder length). This equation holds for every value of t, not just one particular instant. It is an identity in t, valid throughout the motion.',
      'Because x² + y² = L² holds for all t, we can differentiate both sides with respect to t. The right side is constant, so its derivative is 0. The left side requires the chain rule: d/dt[x²] = 2x·(dx/dt) and d/dt[y²] = 2y·(dy/dt). So we get 2x(dx/dt) + 2y(dy/dt) = 0. This single equation is the "rate equation" — it links dx/dt and dy/dt at every moment. Given one rate, you can solve for the other.',
      'The chain rule is the engine driving every related rates calculation. Whenever you differentiate a function of a variable that itself depends on t, you must multiply by the derivative of that variable with respect to t. This is d/dt[f(x(t))] = f\'(x)·(dx/dt). In the ladder problem, x is a function of t, so d/dt[x²] = 2x·(dx/dt) — you cannot just write 2x. The (dx/dt) factor is essential because x itself is changing in time.',
      'Walk through the ladder problem conceptually to build intuition before any algebra. When the base is very close to the wall (x ≈ 0), the ladder is nearly vertical, and a small horizontal motion of the base produces almost no downward motion of the top. As the base slides further out, the geometry becomes more extreme: the top drops faster and faster. When the base is at 45° from the wall (x = y = L/√2), the top drops at exactly the same speed the base slides out. And as the base approaches L (the ladder is almost flat), the top plummets toward the floor at infinite speed — the constraint collapses to a degenerate triangle. The rate equation 2x(dx/dt) + 2y(dy/dt) = 0 captures all of this: dy/dt = -(x/y)·(dx/dt), and as y → 0 this ratio blows up.',
      'Radar tracking works by the same logic. An aircraft is at horizontal distance x(t) from the radar station and at altitude h (constant for simplicity). The slant range r = √(x² + h²). Differentiating: dr/dt = x/r · (dx/dt). So dr/dt — the rate the range changes — depends on the current angle of depression, not just the aircraft\'s ground speed dx/dt. A slow plane flying directly toward the radar may have a very fast dr/dt when it is nearly overhead; a fast plane flying perpendicular to the line of sight may have dr/dt = 0. Air traffic controllers account for exactly this effect.',
      'The five-step procedure for related rates is reliable in every situation. Step 1: Draw and label a diagram. Put variables (not numbers) on all the changing quantities. Step 2: Write the equation that relates those variables — this is the geometric or physical constraint. Step 3: Differentiate both sides with respect to t, applying the chain rule to every variable-dependent term. Step 4: Substitute in the known numerical values at the specific instant — both positions and rates. Step 5: Solve algebraically for the unknown rate. The crucial discipline is in Step 4: you must differentiate FIRST, then substitute. Substituting before differentiating destroys the rate information.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Related Rates is Implicit Differentiation in t',
        body: 'You already know implicit differentiation — differentiating both sides of an equation with respect to x even when y depends on x. Related rates is exactly the same idea, but the independent variable is t (time). Every variable in your geometric equation is a function of t, so every term gets a (d/dt) factor via the chain rule. The technique is identical; only the name of the independent variable changes.',
      },
      {
        type: 'real-world',
        title: 'Aircraft Radar: Two Rates, One Aircraft',
        body: 'A radar antenna measures slant range r(t) (distance from antenna to aircraft) and azimuth angle θ(t). The aircraft\'s ground speed v and altitude h are related to these by r² = h² + d²(t) and tan(θ) = h/d(t). Differentiating both simultaneously gives a system of equations for dr/dt and dθ/dt in terms of v. Air traffic controllers solve related rates in real time to compute aircraft velocity vectors and predict conflicts.',
      },
      {
        type: 'warning',
        title: 'Do NOT Substitute Before Differentiating',
        body: 'This is the most common error in related rates. If the base is at 6 ft at the specific instant you care about, you might be tempted to write x = 6 in the equation x² + y² = 100 immediately, getting y = 8, and then wonder what to differentiate. But you must write the equation with variables x and y, differentiate to get 2x(dx/dt) + 2y(dy/dt) = 0, and THEN substitute x = 6, y = 8. Substituting first replaces the variables with constants, eliminating the rates entirely.',
      },
      {
        type: 'tip',
        title: 'Geometry First, Differentiate Second',
        body: 'Draw and label the full geometry before writing derivatives. Most related-rates errors are diagram/setup errors, not differentiation errors.',
      },
      {
        type: 'geometric',
        title: 'The Sliding Ladder Geometry',
        body: 'The ladder, wall, and ground always form a right triangle with hypotenuse L (fixed). As x increases from 0 to L, y decreases from L to 0. The rate equation dy/dt = -(x/y)·(dx/dt) shows: when x/y is small (nearly vertical ladder), the top slides slowly. When x/y is large (nearly horizontal ladder), the top plummets. The singularity at y = 0 is a genuine physical phenomenon — the top accelerates without bound as it approaches the floor.',
      },
      {
        type: 'misconception',
        title: 'Differentiating x² Does NOT Give 2x in Related Rates',
        body: "In related rates, d/dt[x²] = 2x·(dx/dt), NOT just 2x. Every variable depends on t, so every differentiation must include the chain rule factor. Forgetting dx/dt turns a rate equation into a position equation — completely wrong. If you see 2x without a (dx/dt) factor, you forgot the chain rule.",
      },
      {
        type: 'history',
        title: 'Archimedes and the Sand Reckoner',
        body: "Archimedes (287–212 BC) computed rates of change for geometric quantities — the area of a growing circle, the volume of a filling sphere — using arguments remarkably similar to modern related rates. His 'method of exhaustion' anticipated calculus by 2000 years. The formalized chain rule came from Leibniz in the 1680s.",
      },
    ],
  
      visualizations: [
    {
        id: 'VideoEmbed',
        title: "Calculus Related Rates Example Volume of Cone Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/FoB4qIKQxZ0" }
      },
    {
        id: 'VideoEmbed',
        title: "Related Rates Similar Triangles   4K",
        props: { url: "https://www.youtube.com/embed/I5u0g7QCdMI" }
      },
    {
        id: 'VideoEmbed',
        title: "Related Rates Right Triangles 2 Examples 4K",
        props: { url: "https://www.youtube.com/embed/Z2yQYPPTU2M" }
      },
    {
        id: 'VideoEmbed',
        title: "Related Rates Part 2 Linear vs Angular Speed Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/JBHQYQSdmJQ" }
      },
    {
        id: 'VideoEmbed',
        title: "Related Rates Introduction Area & Volume 4K",
        props: { url: "https://www.youtube.com/embed/DQ5T3ht5ahs" }
      },
      {
        id: 'VideoEmbed',
        title: "Intro to Related Rates",
        props: { url: "https://www.youtube.com/embed/3e27UqwPtMw" }
      },
      ],
    },

  math: {
    prose: [
      'The most general setup uses the multivariable chain rule. If a quantity Q depends on several variables x, y, z that all vary with time t, then dQ/dt = (∂Q/∂x)(dx/dt) + (∂Q/∂y)(dy/dt) + (∂Q/∂z)(dz/dt). This is the chain rule applied to a function of multiple time-dependent inputs. In most Chapter 3 problems, only one or two variables change at a time, simplifying the computation considerably.',
      'For the volume of a sphere: V = (4/3)πr³. Differentiating with respect to t: dV/dt = 4πr²·(dr/dt). The factor 4πr² is the surface area of the sphere — this is not a coincidence. The rate of volume increase equals the surface area times the rate of radius increase, because new volume is being added in a thin spherical shell of thickness dr/dt·dt. This geometric interpretation deepens understanding: the rate equation is a statement about geometry, not just algebra.',
      'For a cone with fixed proportional dimensions: if the radius r and height h satisfy r/h = k (a fixed ratio from the tank\'s geometry), then r = kh and V = (1/3)πr²h = (1/3)π(kh)²h = (πk²/3)h³. Now dV/dt = πk²h²·(dh/dt). The simplification r = kh is crucial — it reduces the problem from two variables (r, h) to one variable (h), making differentiation immediate. This substitution must happen before differentiation, using the geometric constraint to eliminate a variable, not to substitute a specific number.',
      'Shadow problems use similar triangles. A streetlight of height H stands at the origin. A person of height h walks away from the base at speed dx/dt = v. Let x be the person\'s distance and s be their shadow length. The similar triangles give H/(x+s) = h/s (the light, tip of shadow, and top of person form similar triangles). Solving: Hs = h(x+s), so s(H-h) = hx, giving s = hx/(H-h). Therefore ds/dt = h/(H-h)·(dx/dt). Notice the shadow length increases at a constant rate (since ds/dt depends only on dx/dt and fixed constants) — the person and their shadow accelerate apart at a constant rate, regardless of how far from the light post they are.',
      'The general geometric relationships and their rate forms are: Circle area A = πr² → dA/dt = 2πr·(dr/dt). Sphere volume V = (4/3)πr³ → dV/dt = 4πr²·(dr/dt). Cone volume V = (1/3)πr²h → dV/dt = (2πrh/3)·(dr/dt) + (πr²/3)·(dh/dt). Pythagorean theorem x² + y² = L² → 2x(dx/dt) + 2y(dy/dt) = 0 (when L is constant). These rate equations are the toolkit; the problem-specific geometry tells you which constraints apply and what substitutions to make.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Related Rates — General Template',
        body: 'If Q = f(x, y, \\ldots) where x, y, \\ldots all depend on t, then\n\\[\\frac{dQ}{dt} = \\frac{\\partial f}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial f}{\\partial y}\\frac{dy}{dt} + \\cdots\\]\nThis is the chain rule for functions of multiple time-dependent variables.',
      },
      {
        type: 'definition',
        title: 'The 5-Step Method',
        body: '(1) Draw and label a diagram with variable names (not numbers) on all changing quantities.\n(2) Write the equation relating those variables.\n(3) Differentiate both sides with respect to t (chain rule on every term).\n(4) Substitute the known numerical values at the specific instant.\n(5) Solve for the unknown rate.',
      },
      {
        type: 'warning',
        title: 'Units Must Be Consistent',
        body: 'If x is in feet and t is in seconds, then dx/dt is in feet per second. Volume in cubic feet gives dV/dt in cubic feet per second. If different units appear (meters and centimeters, seconds and minutes), convert everything to a single system before computing.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The theoretical foundation of related rates is the chain rule for functions of several variables. Suppose x(t) and y(t) are both differentiable at t₀, and F(x, y) is a function with continuous partial derivatives. Then the composite function h(t) = F(x(t), y(t)) is differentiable at t₀, and h\'(t₀) = (∂F/∂x)·x\'(t₀) + (∂F/∂y)·y\'(t₀). This is a theorem from multivariable calculus, but in single-variable settings (where F depends on only one variable at a time), it reduces to the familiar chain rule d/dt[f(x(t))] = f\'(x)·x\'(t).',
      'For the chain rule to apply, we need the geometric constraint F(x(t), y(t)) = C to hold for all t in some open interval around t₀, not just at the single instant t₀. This is a continuity requirement: the relationship must be maintained throughout the motion. In the ladder problem, x² + y² = 100 holds for all t from the moment the ladder starts moving until it hits the floor. We can differentiate it with respect to t at any interior point of that interval.',
      'The singularity in the ladder problem deserves careful attention. The rate equation is dy/dt = -(x/y)·(dx/dt). As y → 0⁺, dy/dt → -∞ for any fixed positive dx/dt. This is not a mathematical artifact — it reflects a real physical breakdown. As the ladder approaches horizontal, the constraint equation x² + y² = L² becomes increasingly ill-conditioned: small changes in x (near L) produce disproportionately large changes in y (near 0). The same phenomenon appears in the well-known "barn door" problem in mechanics and in the kinematics of robotic arms near singular configurations.',
      'A subtlety often overlooked: the rate equation 2x(dx/dt) + 2y(dy/dt) = 0 was derived by differentiating a constraint that assumed L is constant. If the ladder were also changing length (say, telescoping), the right side would not be zero — it would be 2L(dL/dt). The related rates method always differentiates the constraint as it actually holds, accounting for any quantities that are truly constant versus those that vary. Identifying which quantities are constant is therefore the first critical step in every problem.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Chain Rule for Composite Functions (Rigorous Form)',
        body: 'If x(t) and y(t) are differentiable at t₀ and F has continuous partial derivatives, then\n\\[\\frac{d}{dt}F(x(t),y(t))\\bigg|_{t=t_0} = \\frac{\\partial F}{\\partial x}\\,x\'(t_0) + \\frac{\\partial F}{\\partial y}\\,y\'(t_0)\\]',
      },
      {
        type: 'warning',
        title: 'The Constraint Must Hold on an Interval',
        body: 'You cannot differentiate a constraint that holds only at a single instant. The equation F(x(t), y(t)) = C must be an identity — true for all t in some interval — to allow differentiation with respect to t. If it holds only at one moment, you have a condition, not a constraint.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-000-ex1',
      title: 'Ladder Sliding Down a Wall',
      problem: '\\text{A 10-ft ladder leans against a wall. The base slides away at } \\frac{dx}{dt} = 2 \\text{ ft/s. Find } \\frac{dy}{dt} \\text{ when } x = 6 \\text{ ft.}',
      visualizationId: 'RelatedRatesLadder',
      steps: [
        { expression: 'x^2 + y^2 = 100', annotation: 'The Pythagorean theorem: base x, height y, and the fixed 10-ft hypotenuse. This holds for all t.', hints: ['Identify the fixed hypotenuse (the ladder) and the two changing sides (x and y).', 'The triangle is a right triangle, so x² + y² = L².'] },
        { expression: '2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0', annotation: 'Differentiate both sides with respect to t. The right side is 0 because 100 is constant. The chain rule gives the factor dx/dt and dy/dt on each term.', hints: ['Differentiate with respect to time (t), not x.', 'Apply the chain rule to both x² and y², creating dx/dt and dy/dt terms.', 'Remember d/dt[100] is 0 because the ladder length is constant.'] },
        { expression: 'x = 6 \\Rightarrow y = \\sqrt{100 - 36} = \\sqrt{64} = 8', annotation: 'Find y at the instant x = 6 using the original equation. We must know the current position of BOTH variables before substituting rates.', hints: ['Solve for the "missing" side at the specific moment mentioned.', 'Plug x = 6 back into the original Pythagorean equation.'] },
        { expression: '2(6)(2) + 2(8)\\,\\frac{dy}{dt} = 0', annotation: 'Substitute x = 6, y = 8, and dx/dt = 2 into the rate equation.', hints: ['Now that you have the position (y=8) and the rate (dx/dt=2), plug them into the differentiated equation.', 'Ensure you don\'t mix up x/y with dx/dt / dy/dt.'] },
        { expression: '24 + 16\\,\\frac{dy}{dt} = 0', annotation: 'Simplify the left side.', hints: ['Perform the multiplication: 2 * 6 * 2 = 24 and 2 * 8 = 16.'] },
        { expression: '\\frac{dy}{dt} = -\\frac{24}{16} = -\\frac{3}{2} \\text{ ft/s}', annotation: 'Solve for dy/dt. The negative sign means y is decreasing — the top slides DOWN. At this moment the top drops at 3/2 ft/s while the base slides out at 2 ft/s — the top moves slower than the base because the ladder is more horizontal than vertical (x > y).', hints: ['Isolate the unknown rate dy/dt.', 'The negative result is physically meaningful: the height y is decreasing.'] },
      ],
      conclusion: 'The top of the ladder slides down at 3/2 ft/s when the base is 6 ft from the wall. The ratio -(x/y) = -(6/8) = -3/4 shows that dy/dt = (3/4)·(-dx/dt) — the top slides slower than the base at this configuration. When x = y = 5√2 (the 45° configuration), dy/dt = -dx/dt exactly.',
    },
    {
      id: 'ch3-000-ex2',
      title: 'Inflating Spherical Balloon',
      problem: '\\text{Air is pumped into a spherical balloon at } \\frac{dV}{dt} = 100 \\text{ cm}^3/\\text{s. Find } \\frac{dr}{dt} \\text{ when } r = 5 \\text{ cm.}',
      steps: [
        { expression: 'V = \\frac{4}{3}\\pi r^3', annotation: 'Volume of a sphere. r and V are both functions of t.', hints: ['Start with the standard volume formula for a sphere.', 'Identify V and r as the quantities changing over time.'] },
        { expression: '\\frac{dV}{dt} = 4\\pi r^2 \\,\\frac{dr}{dt}', annotation: 'Differentiate both sides with respect to t. d/dt[(4/3)πr³] = (4/3)π·3r²·(dr/dt) = 4πr²·(dr/dt). The factor 4πr² is the surface area — new volume is added in a thin surface layer.', hints: ['Use the power rule and the chain rule on r³.', 'Notice that the resulting coefficient 4πr² is the sphere\'s surface area.'] },
        { expression: '100 = 4\\pi(5)^2 \\cdot \\frac{dr}{dt}', annotation: 'Substitute dV/dt = 100 and r = 5.', hints: ['Plug in the given rate of air input (dV/dt) and the specific radius (r).'] },
        { expression: '100 = 4\\pi(25)\\,\\frac{dr}{dt} = 100\\pi\\,\\frac{dr}{dt}', annotation: 'Simplify: 4π·25 = 100π.', hints: ['Square the radius and multiply by the coefficients.'] },
        { expression: '\\frac{dr}{dt} = \\frac{100}{100\\pi} = \\frac{1}{\\pi} \\approx 0.318 \\text{ cm/s}', annotation: 'Solve for dr/dt. The radius grows at 1/π cm/s at this moment.', hints: ['Divide by 100π to isolate the radial rate.', 'The units are cm/s since volume was cm³ and time was seconds.'] },
      ],
      conclusion: 'When r = 5 cm, the radius grows at 1/π ≈ 0.318 cm/s. As the balloon inflates, r increases, so dr/dt = dV/dt/(4πr²) decreases — a fixed rate of air input inflates the balloon more slowly as it gets larger, because the same volume of air produces a thinner shell. This is why it\'s harder to blow up a large balloon than a small one.',
    },
    {
      id: 'ch3-000-ex3',
      title: 'Water Draining from a Conical Tank',
      problem: '\\text{A conical tank (vertex down) has radius 3 m at the top and height 4 m. Water drains at } \\frac{dV}{dt} = -2 \\text{ m}^3/\\text{min. Find } \\frac{dh}{dt} \\text{ when } h = 2 \\text{ m.}',
      steps: [
        { expression: '\\frac{r}{h} = \\frac{3}{4} \\Rightarrow r = \\frac{3h}{4}', annotation: 'Similar triangles: the tank has radius 3 when height is 4. At any water height h, the water surface radius r satisfies r/h = 3/4. This is the key geometric constraint that reduces two variables to one.', hints: ['Use similar triangles to relate the radius of the water surface to its current height.', 'Since we want the rate of height change, it\'s best to express r in terms of h.'] },
        { expression: 'V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\left(\\frac{3h}{4}\\right)^2 h = \\frac{3\\pi h^3}{16}', annotation: 'Substitute r = 3h/4 into the cone volume formula. Now V is a function of h alone — a single-variable relationship.', hints: ['Substitute your expression for r into the volume formula V = (1/3)πr²h.', 'Simplify the expression so only h remains.'] },
        { expression: '\\frac{dV}{dt} = \\frac{9\\pi h^2}{16}\\,\\frac{dh}{dt}', annotation: 'Differentiate V = 3πh³/16 with respect to t. d/dt[3πh³/16] = (9πh²/16)·(dh/dt).', hints: ['Apply the power rule to h³ and don\'t forget the dh/dt factor.', 'Keep the constants (3π/16) as a coefficient.'] },
        { expression: '-2 = \\frac{9\\pi(2)^2}{16}\\,\\frac{dh}{dt} = \\frac{9\\pi}{4}\\,\\frac{dh}{dt}', annotation: 'Substitute dV/dt = -2 (negative because draining) and h = 2. Simplify: 9π·4/16 = 9π/4.', hints: ['dV/dt is -2 because the water is leaving the tank.', 'Substitute h = 2 and simplify the coefficient.'] },
        { expression: '\\frac{dh}{dt} = \\frac{-2 \\cdot 4}{9\\pi} = \\frac{-8}{9\\pi} \\approx -0.283 \\text{ m/min}', annotation: 'Solve for dh/dt. The water level drops at 8/(9π) m/min.', hints: ['Isolate dh/dt.', 'The negative value confirms the water level is dropping.'] },
      ],
      conclusion: 'The water level drops at 8/(9π) ≈ 0.283 m/min when h = 2 m. Notice that as h decreases, dh/dt = -32/(9πh²) would increase in magnitude — the water level drops faster as the cone narrows near the vertex, because each meter drop corresponds to less volume lost.',
    },
    {
      id: 'ch3-000-ex4',
      title: 'Shadow Length Problem',
      problem: '\\text{A 20-ft streetlight illuminates a person 6 ft tall walking at 5 ft/s away from the base. Find the rate the shadow tip moves.}',
      steps: [
        { expression: '\\text{Let } x = \\text{person\'s distance from base, } s = \\text{shadow length}', annotation: 'Define variables. Both x and s are functions of t. The tip of the shadow is at distance x + s from the base.', hints: ['Declare your coordinate system.', 'Identify that there are two separate moving parts: the person and the shadow tip.'] },
        { expression: '\\frac{20}{x + s} = \\frac{6}{s}', annotation: 'Similar triangles: the streetlight, the tip of the shadow, and the person\'s top form similar triangles. The full triangle (from base to shadow tip, height 20) is similar to the small triangle (from person to shadow tip, height 6).', hints: ['Look at the big triangle formed by the streetlight and the shadow tip.', 'Look at the small triangle formed by the person and the shadow tip.', 'The ratios of height to base must be equal.'] },
        { expression: '20s = 6(x + s) \\Rightarrow 20s = 6x + 6s \\Rightarrow 14s = 6x', annotation: 'Cross-multiply and simplify. This gives the constraint between s and x.', hints: ['Solve the proportion by cross-multiplying.', 'Isolate the variables on opposite sides.'] },
        { expression: 's = \\frac{3x}{7}', annotation: 'Solve for s in terms of x.', hints: ['Express one variable in terms of the other to simplify differentiation.'] },
        { expression: '\\frac{ds}{dt} = \\frac{3}{7}\\,\\frac{dx}{dt} = \\frac{3}{7}(5) = \\frac{15}{7} \\approx 2.14 \\text{ ft/s}', annotation: 'Differentiate both sides with respect to t. Since 3/7 is constant, ds/dt = (3/7)·(dx/dt). The shadow length grows at a constant 15/7 ft/s.', hints: ['Differentiate with respect to t.', 'Plug in the person\'s walking speed dx/dt = 5.'] },
        { expression: '\\text{Shadow tip speed} = \\frac{d}{dt}(x + s) = \\frac{dx}{dt} + \\frac{ds}{dt} = 5 + \\frac{15}{7} = \\frac{50}{7} \\approx 7.14 \\text{ ft/s}', annotation: 'The tip moves at the person\'s speed plus the shadow growth rate. The shadow tip outpaces the person.', hints: ['The shadow tip is at position x + s.', 'Its velocity is the sum of the rates d/dt[x] and d/dt[s].'] },
      ],
      conclusion: 'The shadow\'s tip moves at 50/7 ≈ 7.14 ft/s, faster than the person\'s 5 ft/s walking speed. The shadow stretches as the person walks, so the tip moves even faster than the walker. This rate is constant regardless of how far from the post — a consequence of the linear similar-triangles relationship.',
    },
    {
      id: 'ch3-000-ex5',
      title: 'Angle of Elevation of a Rising Balloon',
      problem: '\\text{A balloon rises at 10 ft/s. An observer is 500 ft horizontally from the launch point. Find } d\\theta/dt \\text{ when the balloon is at height } h = 500 \\text{ ft.}',
      steps: [
        { expression: '\\tan(\\theta) = \\frac{h}{500}', annotation: 'The angle of elevation θ satisfies tan(θ) = opposite/adjacent = h/500. Both θ and h vary with t.', hints: ['Relate the angle to the changing height and constant distance using a trig function.', 'Tangent is usually easiest here since it involves opposite and adjacent.'] },
        { expression: '\\sec^2(\\theta)\\,\\frac{d\\theta}{dt} = \\frac{1}{500}\\,\\frac{dh}{dt}', annotation: 'Differentiate both sides with respect to t. d/dt[tan(θ)] = sec²(θ)·(dθ/dt) by the chain rule. The right side: d/dt[h/500] = (1/500)·(dh/dt).', hints: ['The derivative of tan(u) is sec²(u) * du/dt.', 'The right side is just a constant times h, so its derivative is straightforward.'] },
        { expression: 'h = 500 \\Rightarrow \\tan(\\theta) = 1 \\Rightarrow \\theta = \\frac{\\pi}{4}', annotation: 'At h = 500 ft, tan(θ) = 500/500 = 1, so θ = π/4 (45°).', hints: ['Find the specific angle at the instant of interest.'] },
        { expression: '\\sec^2\\!\\left(\\frac{\\pi}{4}\\right) = \\frac{1}{\\cos^2(\\pi/4)} = \\frac{1}{(1/\\sqrt{2})^2} = 2', annotation: 'Compute sec²(π/4). cos(π/4) = 1/√2, so cos²(π/4) = 1/2, so sec²(π/4) = 2.', hints: ['Evaluate the trig coefficient.', 'This is 1/cos²(π/4).'] },
        { expression: '2\\,\\frac{d\\theta}{dt} = \\frac{10}{500} = \\frac{1}{50}', annotation: 'Substitute sec²(θ) = 2 and dh/dt = 10 into the rate equation.', hints: ['Plug in all your known values: sec²(θ) and the rising rate dh/dt.'] },
        { expression: '\\frac{d\\theta}{dt} = \\frac{1}{100} \\text{ rad/s}', annotation: 'Solve for dθ/dt. The angle increases at 1/100 radian per second at this moment — about 0.57°/s.', hints: ['Divide by 2 to isolate dθ/dt.'] },
      ],
      conclusion: 'The angle of elevation increases at 1/100 rad/s when the balloon is at 500 ft. As the balloon continues to rise, θ approaches π/2 and sec²(θ) → ∞, which drives dθ/dt → 0 for fixed dh/dt — the angle barely changes when the balloon is nearly overhead because the geometry is almost degenerate.',
    },
    {
      id: 'ch3-000-ex6',
      title: 'Two Cars Approaching an Intersection',
      problem: '\\text{Car A moves north at 60 mph and Car B moves east at 80 mph, both toward an intersection. Find } dz/dt \\text{ when A is 5 mi away and B is 12 mi away.}',
      steps: [
        { expression: 'z^2 = x^2 + y^2', annotation: 'Let x = Car B\'s distance from intersection, y = Car A\'s distance, z = distance between cars. The cars are on perpendicular roads, so the Pythagorean theorem applies.', hints: ['Model the cars on the x and y axes moving toward the origin.', 'The hypotenuse z is the line-of-sight distance.'] },
        { expression: '2z\\,\\frac{dz}{dt} = 2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt}', annotation: 'Differentiate both sides with respect to t.', hints: ['Differentiate the Pythagorean equation with respect to time.', 'Note that x, y, and z are all changing.'] },
        { expression: 'x = 12, \\; y = 5 \\Rightarrow z = \\sqrt{144 + 25} = \\sqrt{169} = 13 \\text{ mi}', annotation: 'Compute z using the Pythagorean theorem. The 5-12-13 right triangle gives z = 13.', hints: ['Find the current distance between the cars.'] },
        { expression: '\\frac{dx}{dt} = -80, \\quad \\frac{dy}{dt} = -60', annotation: 'Both cars approach the intersection, so their distances decrease: dx/dt = -80 mph (B moves east toward intersection), dy/dt = -60 mph (A moves north toward intersection).', hints: ['The distances are narrowing, so the rates of change for x and y are negative.'] },
        { expression: '2(13)\\,\\frac{dz}{dt} = 2(12)(-80) + 2(5)(-60)', annotation: 'Substitute all values into the rate equation.', hints: ['Plug in the current positions (12, 5) and the current velocities (-80, -60).'] },
        { expression: '26\\,\\frac{dz}{dt} = -1920 - 600 = -2520', annotation: 'Simplify the right side.', hints: ['Multiply the terms on the right.'] },
        { expression: '\\frac{dz}{dt} = \\frac{-2520}{26} = -\\frac{1260}{13} \\approx -96.9 \\text{ mph}', annotation: 'The negative sign means the cars are getting closer. They approach each other at about 96.9 mph.', hints: ['Solve for dz/dt.'] },
      ],
      conclusion: 'The cars are closing distance at ≈96.9 mph. Note that this is NOT simply 60 + 80 = 140 mph — that would be the rate if they were driving toward each other on a straight road. Because they are on perpendicular roads, the geometry moderates the closure rate through the 5-12-13 triangle.',
    },
    {
      id: 'ch3-000-ex7',
      title: 'Spreading Circular Oil Slick',
      problem: '\\text{A circular oil slick grows at } dA/dt = 50 \\text{ m}^2/\\text{hr. Find } dr/dt \\text{ when } r = 10 \\text{ m.}',
      visualizationId: 'RelatedRatesLadder',
      steps: [
        { expression: 'A = \\pi r^2', annotation: 'Area of a circle. Both A and r depend on t.', hints: ['Use the formula for the area of a circle.', 'Remember that both A and r are functions of time.'] },
        { expression: '\\frac{dA}{dt} = 2\\pi r\\,\\frac{dr}{dt}', annotation: 'Differentiate both sides with respect to t. d/dt[πr²] = 2πr·(dr/dt).', hints: ['Apply the power rule and chain rule to r².', 'π is a constant.'] },
        { expression: '50 = 2\\pi(10)\\,\\frac{dr}{dt} = 20\\pi\\,\\frac{dr}{dt}', annotation: 'Substitute dA/dt = 50 and r = 10.', hints: ['Plug in the given rate of area change and the specific radius.'] },
        { expression: '\\frac{dr}{dt} = \\frac{50}{20\\pi} = \\frac{5}{2\\pi} \\approx 0.796 \\text{ m/hr}', annotation: 'Solve for dr/dt.', hints: ['Divide by 20π to isolate the radial rate.'] },
      ],
      conclusion: 'The radius grows at 5/(2π) ≈ 0.796 m/hr when r = 10 m. As the slick spreads, r increases, and the same rate of area increase produces a smaller rate of radius increase — the circle spreads more slowly in radial terms the larger it gets.',
    },
  ],

  challenges: [
    {
      id: 'ch3-000-ch1',
      difficulty: 'hard',
      problem: 'A kite flies at constant height 100 m. The string is let out at 5 m/s. Find the rate the horizontal distance from the flier increases when 200 m of string has been let out.',
      hint: 'Let L = string length (the hypotenuse), x = horizontal distance (one leg), height = 100 m (the other leg, fixed). Use x² + 100² = L². Differentiate and substitute.',
      walkthrough: [
        { expression: 'x^2 + 100^2 = L^2', annotation: 'The kite string, horizontal distance, and fixed height form a right triangle. L is the hypotenuse (string length).', hints: ['The height of the kite is constant (100).', 'The horizontal distance (x) and rope length (L) are variables.', 'Apply the Pythagorean theorem.'] },
        { expression: '2x\\,\\frac{dx}{dt} = 2L\\,\\frac{dL}{dt}', annotation: 'Differentiate with respect to t. The height 100 is constant, so d/dt[100²] = 0.', hints: ['Differentiate with respect to time.', 'The constant 100² drops out.', 'Keep the 2x dx/dt and 2L dL/dt terms.'] },
        { expression: 'L = 200 \\Rightarrow x = \\sqrt{200^2 - 100^2} = \\sqrt{30000} = 100\\sqrt{3}', annotation: 'Find x when L = 200 using the Pythagorean theorem.', hints: ['Find the horizontal distance at the specific moment L=200.'] },
        { expression: '2(100\\sqrt{3})\\,\\frac{dx}{dt} = 2(200)(5)', annotation: 'Substitute x = 100√3, L = 200, dL/dt = 5.', hints: ['Plug in all known values: position (x, L) and rate (dL/dt).'] },
        { expression: '\\frac{dx}{dt} = \\frac{10\\sqrt{3}}{3} \\approx 5.77 \\text{ m/s}', annotation: 'Solve for dx/dt and rationalize.', hints: ['Simplify the equation and isolate dx/dt.', 'The result is the horizontal speed.'] },
      ],
      answer: '\\dfrac{dx}{dt} = \\dfrac{10\\sqrt{3}}{3} \\approx 5.77 \\text{ m/s}',
    },
    {
      id: 'ch3-000-ch2',
      difficulty: 'medium',
      problem: 'Gravel is dumped onto a conical pile at 30 ft³/min. The cone always satisfies h = 2r (height equals twice the base radius). Find dh/dt when h = 10 ft.',
      hint: 'Write V in terms of h alone using r = h/2. Then differentiate.',
      walkthrough: [
        { expression: 'r = \\frac{h}{2}', annotation: 'h = 2r means r = h/2. Use this to eliminate r.', hints: ['The problem gives a constant ratio between r and h.', 'Solve for r in terms of h since we want dh/dt.'] },
        { expression: 'V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\left(\frac{h}{2}\\right)^2 h = \\frac{\\pi h^3}{12}', annotation: 'Substitute r = h/2 into the cone volume formula.', hints: ['Replace r in the volume formula.', 'Simplify to get V as a function of only h.'] },
        { expression: '\\frac{dV}{dt} = \\frac{\\pi h^2}{4}\\,\\frac{dh}{dt}', annotation: 'Differentiate V = πh³/12 with respect to t: (π/12)·3h²·(dh/dt) = (πh²/4)·(dh/dt).', hints: ['Apply the power rule to h³.', 'Don\'t forget the chain rule term dh/dt.'] },
        { expression: '30 = \\frac{\\pi(10)^2}{4}\\,\\frac{dh}{dt} = 25\\pi\\,\\frac{dh}{dt}', annotation: 'Substitute dV/dt = 30 and h = 10.', hints: ['Plug in the dumping rate (dV/dt) and target height (h).'] },
        { expression: '\\frac{dh}{dt} = \\frac{6}{5\\pi} \\approx 0.382 \\text{ ft/min}', annotation: 'Solve for dh/dt.', hints: ['Isolate dh/dt.', 'Check units: ft/min because volume was ft³ and time was min.'] },
      ],
      answer: '\\dfrac{dh}{dt} = \\dfrac{6}{5\\pi} \\approx 0.382 \\text{ ft/min}',
    },
    {
      id: 'ch3-000-ch3',
      difficulty: 'medium',
      problem: 'A boat is pulled toward a dock by a rope passing over a pulley 12 ft above the water. The rope is pulled in at 3 ft/s. How fast is the boat moving toward the dock when 15 ft of rope extends from the pulley?',
      hint: 'Let x = horizontal distance of boat from the dock, L = length of rope from pulley to boat. These satisfy x² + 12² = L². Differentiate. Note: the boat moves horizontally, not along the rope.',
      walkthrough: [
        { expression: 'x^2 + 144 = L^2', annotation: 'The pulley is 12 ft above water (constant). x is the boat\'s horizontal distance from below the pulley, L is the rope length. Pythagorean theorem.', hints: ['Identify the constant vertical distance (12) and the variable horizontal distance (x).', 'The rope length L is the hypotenuse.'] },
        { expression: '2x\\,\\frac{dx}{dt} = 2L\\,\\frac{dL}{dt}', annotation: 'Differentiate with respect to t.', hints: ['Differentiate both sides.', 'The constant 144 derivative is 0.'] },
        { expression: 'L = 15 \\Rightarrow x = \\sqrt{225 - 144} = 9 \\text{ ft}', annotation: 'Find x when L = 15.', hints: ['Calculate the horizontal distance at the specific moment.'] },
        { expression: '\\frac{dL}{dt} = -3 \\text{ ft/s}', annotation: 'The rope is being pulled IN, so L decreases: dL/dt = -3.', hints: ['The rate dL/dt must be negative because the rope is shortening.'] },
        { expression: '2(9)\\,\\frac{dx}{dt} = 2(15)(-3) \\Rightarrow 18\\,\\frac{dx}{dt} = -90', annotation: 'Substitute into the rate equation.', hints: ['Substitute all positional and rate data.'] },
        { expression: '\\frac{dx}{dt} = -5 \\text{ ft/s}', annotation: 'The boat moves toward the dock at 5 ft/s. The negative sign confirms x is decreasing.', hints: ['Solve for the boat\'s horizontal velocity.'] },
      ],
      answer: '\\text{The boat approaches the dock at } 5 \\text{ ft/s.}',
    },
  ],


  crossRefs: [
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Related rates is implicit differentiation with t as the independent variable. Review Chapter 2\'s implicit differentiation lesson.' },
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'Every related rates calculation applies the chain rule. The chain rule is the mathematical engine behind d/dt[f(x(t))] = f\'(x)·(dx/dt).' },
    { lessonSlug: 'optimization', label: 'Optimization', context: 'Optimization also requires setting up geometric equations and using calculus to extract information. The modeling skills are closely related.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'attempted-challenge-hard',
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
  ],
}
