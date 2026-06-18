// FILE: src/content/chapter-3/00-related-rates.js
export default {
  id: "ch3-000",
  slug: "related-rates",
  chapter: 3,
  order: 4,
  title: "Related Rates",
  subtitle:
    "When two quantities are geometrically linked, their rates of change are linked too — by the chain rule",
  tags: [
    "related rates",
    "chain rule",
    "implicit differentiation",
    "Pythagorean theorem",
    "geometry",
    "time derivatives",
    "optimization preview",
  ],

  hook: {
    question:
      "A 10-foot ladder is leaning against a wall. The base slides away from the wall at 2 ft/s. How fast is the top of the ladder sliding DOWN the wall at the moment the base is 6 feet from the wall? At that same moment, is the top sliding down faster or slower than the base is sliding out?",
    realWorldContext:
      "Air traffic controllers face this problem every second: a radar system tracks an aircraft's slant range (the straight-line distance from the antenna to the plane) and the angle of elevation. The rate of change of slant range and the rate of change of angle are different quantities, linked through trigonometry. Neither one directly gives the aircraft's speed, but together they do. The same mathematics governs water draining from conical tanks (a classic engineering problem), balloons inflating, shadows lengthening as the sun moves, and the distances between moving vehicles on a highway. Whenever two geometric quantities are constrained by a relationship — a fixed triangle, a fixed volume, similar triangles — differentiating that constraint with respect to time gives you a new equation linking their rates.",
  },

  intuition: {
    prose: [
      "You have the chain rule, implicit differentiation, and all the tools of Chapter 2. Related rates is their first application in the wild. The setup is always this: two quantities are geometrically linked (a fixed triangle, a fixed volume, a fixed distance), and you want to know how fast one changes when you know how fast the other changes. The chain rule does the work — you just need to know when to apply it. Every air traffic controller, every civil engineer tracking water levels, every physician modeling drug concentration is doing related rates in some form.",
      "The key insight behind all related rates problems is this: two quantities are linked by a geometric or physical relationship, and that relationship does not just constrain the values — it also constrains the rates of change. If the position of the base of a ladder is x(t) and the position of the top is y(t), the Pythagorean theorem says x² + y² = L² (where L is the fixed ladder length). This equation holds for every value of t, not just one particular instant. It is an identity in t, valid throughout the motion.",
      'Because x² + y² = L² holds for all t, we can differentiate both sides with respect to t. The right side is constant, so its derivative is 0. The left side requires the chain rule: d/dt[x²] = 2x·(dx/dt) and d/dt[y²] = 2y·(dy/dt). So we get 2x(dx/dt) + 2y(dy/dt) = 0. This single equation is the "rate equation" — it links dx/dt and dy/dt at every moment. Given one rate, you can solve for the other.',
      "The chain rule is the engine driving every related rates calculation. Whenever you differentiate a function of a variable that itself depends on t, you must multiply by the derivative of that variable with respect to t. This is d/dt[f(x(t))] = f'(x)·(dx/dt). In the ladder problem, x is a function of t, so d/dt[x²] = 2x·(dx/dt) — you cannot just write 2x. The (dx/dt) factor is essential because x itself is changing in time.",
      "Walk through the ladder problem conceptually to build intuition before any algebra. When the base is very close to the wall (x ≈ 0), the ladder is nearly vertical, and a small horizontal motion of the base produces almost no downward motion of the top. As the base slides further out, the geometry becomes more extreme: the top drops faster and faster. When the base is at 45° from the wall (x = y = L/√2), the top drops at exactly the same speed the base slides out. And as the base approaches L (the ladder is almost flat), the top plummets toward the floor at infinite speed — the constraint collapses to a degenerate triangle. The rate equation 2x(dx/dt) + 2y(dy/dt) = 0 captures all of this: dy/dt = -(x/y)·(dx/dt), and as y → 0 this ratio blows up.",
      "Radar tracking works by the same logic. An aircraft is at horizontal distance x(t) from the radar station and at altitude h (constant for simplicity). The slant range r = √(x² + h²). Differentiating: dr/dt = x/r · (dx/dt). So dr/dt — the rate the range changes — depends on the current angle of depression, not just the aircraft's ground speed dx/dt. A slow plane flying directly toward the radar may have a very fast dr/dt when it is nearly overhead; a fast plane flying perpendicular to the line of sight may have dr/dt = 0. Air traffic controllers account for exactly this effect.",
      "The five-step procedure for related rates is reliable in every situation. Step 1: Draw and label a diagram. Put variables (not numbers) on all the changing quantities. Step 2: Write the equation that relates those variables — this is the geometric or physical constraint. Step 3: Differentiate both sides with respect to t, applying the chain rule to every variable-dependent term. Step 4: Substitute in the known numerical values at the specific instant — both positions and rates. Step 5: Solve algebraically for the unknown rate. The crucial discipline is in Step 4: you must differentiate FIRST, then substitute. Substituting before differentiating destroys the rate information.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Related Rates is Implicit Differentiation in t",
        body: "You already know implicit differentiation — differentiating both sides of an equation with respect to x even when y depends on x. Related rates is exactly the same idea, but the independent variable is t (time). Every variable in your geometric equation is a function of t, so every term gets a (d/dt) factor via the chain rule. The technique is identical; only the name of the independent variable changes.",
      },
      {
        type: "real-world",
        title: "Aircraft Radar: Two Rates, One Aircraft",
        body: "A radar antenna measures slant range r(t) (distance from antenna to aircraft) and azimuth angle θ(t). The aircraft's ground speed v and altitude h are related to these by r² = h² + d²(t) and tan(θ) = h/d(t). Differentiating both simultaneously gives a system of equations for dr/dt and dθ/dt in terms of v. Air traffic controllers solve related rates in real time to compute aircraft velocity vectors and predict conflicts.",
      },
      {
        type: "warning",
        title: "Do NOT Substitute Before Differentiating",
        body: "This is the most common error in related rates. If the base is at 6 ft at the specific instant you care about, you might be tempted to write x = 6 in the equation x² + y² = 100 immediately, getting y = 8, and then wonder what to differentiate. But you must write the equation with variables x and y, differentiate to get 2x(dx/dt) + 2y(dy/dt) = 0, and THEN substitute x = 6, y = 8. Substituting first replaces the variables with constants, eliminating the rates entirely.",
      },
      {
        type: "tip",
        title: "Geometry First, Differentiate Second",
        body: "Draw and label the full geometry before writing derivatives. Most related-rates errors are diagram/setup errors, not differentiation errors.",
      },
      {
        type: "geometric",
        title: "The Sliding Ladder Geometry",
        body: "The ladder, wall, and ground always form a right triangle with hypotenuse L (fixed). As x increases from 0 to L, y decreases from L to 0. The rate equation dy/dt = -(x/y)·(dx/dt) shows: when x/y is small (nearly vertical ladder), the top slides slowly. When x/y is large (nearly horizontal ladder), the top plummets. The singularity at y = 0 is a genuine physical phenomenon — the top accelerates without bound as it approaches the floor.",
      },
      {
        type: "misconception",
        title: "Differentiating x² Does NOT Give 2x in Related Rates",
        body: "In related rates, d/dt[x²] = 2x·(dx/dt), NOT just 2x. Every variable depends on t, so every differentiation must include the chain rule factor. Forgetting dx/dt turns a rate equation into a position equation — completely wrong. If you see 2x without a (dx/dt) factor, you forgot the chain rule.",
      },
      {
        type: "history",
        title: "Archimedes and the Sand Reckoner",
        body: "Archimedes (287–212 BC) computed rates of change for geometric quantities — the area of a growing circle, the volume of a filling sphere — using arguments remarkably similar to modern related rates. His 'method of exhaustion' anticipated calculus by 2000 years. The formalized chain rule came from Leibniz in the 1680s.",
      },
    ],

    visualizations: [
      {
        id: "RelatedRatesLadder",
        title: "Sliding Ladder: Live Rate Animation",
        mathBridge:
          "The ladder is 10 ft long. Set x = 6 ft (base from wall). By Pythagorean theorem, y = √(100 − 36) = 8 ft. The rate equation from differentiating x² + y² = 100 is 2x(dx/dt) + 2y(dy/dt) = 0. Plug in: 2(6)(2) + 2(8)(dy/dt) = 0. Solve: dy/dt = −24/16 = −1.5 ft/s. The top drops slower than the base slides out. Verify with the animation.",
        caption:
          "Watch the ladder slide and observe how dy/dt changes as x grows — the top accelerates as the ladder approaches horizontal.",
      },
      {
        id: "RelatedRatesBalloon",
        title: "Balloon Problem: How Radius Speed Shrinks as Volume Grows",
        mathBridge:
          "V = (4/3)πr³ → dV/dt = 4πr²·(dr/dt). Solve for dr/dt = dV/dt / (4πr²). As r increases, the denominator 4πr² grows — so dr/dt shrinks even though dV/dt is constant. Drag the sliders to see this live.",
        caption:
          "Sets dV/dt and observe how dr/dt (green arrow) shrinks as the balloon grows. The surface area is the 'spreading factor' that slows the radius.",
      },
      {
        id: "RelatedRatesRocket",
        title: "The Premier Related Rates Lab: Rocket & Plane",
        mathBridge:
          "Two classic problems in one tool. 🚀 Rocket: A camera d ft away tracks a rising rocket (tan θ = h/d). ✈️ Plane: An observer tracks a plane flying at altitude H (x² + H² = s²). Both use the chain rule to link the measurable rate to the unknown rate. Use the 'Math' tab to see step-by-step symbolic and numeric derivations for both scenarios side-by-side.",
        caption:
          "Explore two different geometric constraints (triangles) and see how their rate equations are derived through implicit differentiation.",
      },
      {
        id: "Ch6_TwoTanks",
        title: "Story Mode: Two Tanks, One Valve",
        mathBridge:
          "Two linear-in-time quantity models are solved as a system to find an equilibrium moment. This mirrors related-rates setup discipline: define variables, write constraints, preserve equality, then solve for the target rate/time.",
        caption:
          "Narrative system-solving scenario that complements formal related-rates workflows.",
      },
      {
        id: "SlidingLadder",
        title: "Sliding Ladder: Premium Interaction",
        mathBridge:
          "A premium 13ft ladder model. Features live dx/dt and dy/dt panels and a dark-mode optimized interface. Notice how the top speed accelerates as it approach the floor.",
        caption:
          "Explore the nonlinear relationship x² + y² = 13² in this hifi lab.",
      },
      {
        id: "RocketCamera",
        title: "Rocket Camera: Derivation Engine",
        mathBridge:
          "Step through the 5 logical stages of related rates derivation: from variable setup to the 'Master Formula' θ' = D·h'/s². This lab proves that trig identities can sometimes hide the underlying simplicity.",
        caption:
          "Click through the steps 1-5 to see the math evolve alongside the rising rocket.",
      },
    ],
  },

  math: {
    prose: [
      "The most general setup uses the multivariable chain rule. If a quantity Q depends on several variables x, y, z that all vary with time t, then dQ/dt = (∂Q/∂x)(dx/dt) + (∂Q/∂y)(dy/dt) + (∂Q/∂z)(dz/dt). This is the chain rule applied to a function of multiple time-dependent inputs. In most Chapter 3 problems, only one or two variables change at a time, simplifying the computation considerably.",
      "For the volume of a sphere: V = (4/3)πr³. Differentiating with respect to t: dV/dt = 4πr²·(dr/dt). The factor 4πr² is the surface area of the sphere — this is not a coincidence. The rate of volume increase equals the surface area times the rate of radius increase, because new volume is being added in a thin spherical shell of thickness dr/dt·dt. This geometric interpretation deepens understanding: the rate equation is a statement about geometry, not just algebra.",
      "For a cone with fixed proportional dimensions: if the radius r and height h satisfy r/h = k (a fixed ratio from the tank's geometry), then r = kh and V = (1/3)πr²h = (1/3)π(kh)²h = (πk²/3)h³. Now dV/dt = πk²h²·(dh/dt). The simplification r = kh is crucial — it reduces the problem from two variables (r, h) to one variable (h), making differentiation immediate. This substitution must happen before differentiation, using the geometric constraint to eliminate a variable, not to substitute a specific number.",
      "Shadow problems use similar triangles. A streetlight of height H stands at the origin. A person of height h walks away from the base at speed dx/dt = v. Let x be the person's distance and s be their shadow length. The similar triangles give H/(x+s) = h/s (the light, tip of shadow, and top of person form similar triangles). Solving: Hs = h(x+s), so s(H-h) = hx, giving s = hx/(H-h). Therefore ds/dt = h/(H-h)·(dx/dt). Notice the shadow length increases at a constant rate (since ds/dt depends only on dx/dt and fixed constants) — the person and their shadow accelerate apart at a constant rate, regardless of how far from the light post they are.",
      "The general geometric relationships and their rate forms are: Circle area A = πr² → dA/dt = 2πr·(dr/dt). Sphere volume V = (4/3)πr³ → dV/dt = 4πr²·(dr/dt). Cone volume V = (1/3)πr²h → dV/dt = (2πrh/3)·(dr/dt) + (πr²/3)·(dh/dt). Pythagorean theorem x² + y² = L² → 2x(dx/dt) + 2y(dy/dt) = 0 (when L is constant). These rate equations are the toolkit; the problem-specific geometry tells you which constraints apply and what substitutions to make.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Related Rates — General Template",
        body: "If Q = f(x, y, \\ldots) where x, y, \\ldots all depend on t, then\n\\[\\frac{dQ}{dt} = \\frac{\\partial f}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial f}{\\partial y}\\frac{dy}{dt} + \\cdots\\]\nThis is the chain rule for functions of multiple time-dependent variables.",
      },
      {
        type: "definition",
        title: "The 5-Step Method",
        body: "(1) Draw and label a diagram with variable names (not numbers) on all changing quantities.\n(2) Write the equation relating those variables.\n(3) Differentiate both sides with respect to t (chain rule on every term).\n(4) Substitute the known numerical values at the specific instant.\n(5) Solve for the unknown rate.",
      },
      {
        type: "warning",
        title: "Units Must Be Consistent",
        body: "If x is in feet and t is in seconds, then dx/dt is in feet per second. Volume in cubic feet gives dV/dt in cubic feet per second. If different units appear (meters and centimeters, seconds and minutes), convert everything to a single system before computing.",
      },
    ],
    visualizations: [
      {
        id: "ImplicitDiffProof",
        title: "Proof: x² + y² = r²  →  dy/dx = −x/y",
        caption:
          "Related rates differentiates x² + y² = L² with respect to t. This proof shows the same equation differentiated with respect to x — the technique is identical, only the independent variable changes.",
      },
      {
        id: "RelatedRatesEngine",
        title: "The Machine Behind Every Related Rates Problem",
        mathBridge:
          "The gear animation shows the abstract structure: two quantities locked by a geometric equation, the chain rule as the transmitting gear. The Anatomy tab shows the same three-step structure across four different problem types simultaneously. The Scenarios tab shows five classic problems reduced to their geometric equation and rates equation. Use the 'Which equation?' decision guide when you are stuck on step 1.",
        caption:
          "Use the Anatomy and Scenarios tabs to see that every related rates problem — balloon, ladder, plane, cone, shadow — is the same three-step structure. Only the geometric equation changes.",
      },
      {
        id: "PythonNotebook",
        title: "Python Lab: Compute & Visualize Related Rates",
        caption:
          "Run each cell to numerically verify the classic related-rates results. Modify parameters and re-run to build intuition for how geometry drives the rates.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "The 5-Step Method — Ladder Problem",
              prose: [
                "**The Setup**: A 10-ft ladder leans against a wall. The base slides away at $dx/dt = 2$ ft/s.",
                "We want $dy/dt$ when $x = 6$ ft.",
                "## The 5 Steps",
                "- **Step 1** — Constraint: $x^2 + y^2 = 100$",
                "- **Step 2** — Differentiate: $2x\\dot{x} + 2y\\dot{y} = 0$",
                "- **Step 3** — Find y at $x=6$: $y = \\sqrt{100 - 36} = 8$",
                "- **Step 4** — Substitute: $2(6)(2) + 2(8)\\dot{y} = 0$",
                "- **Step 5** — Solve: $\\dot{y} = -3/2$ ft/s",
              ],
              instructions:
                "Change `x0` to 3, 8, or 9.9 and re-run. Watch dy_dt blow up as the ladder approaches the floor!",
              code: `import math

# ── Ladder parameters (try changing x0) ──
L    = 10.0   # ladder length (ft)
dx   = 2.0    # base sliding speed (ft/s)
x0   = 6.0    # position of base at the instant we care about

# Step 3: find y
y0 = math.sqrt(L**2 - x0**2)

# Step 5: solve for dy/dt from 2x dx/dt + 2y dy/dt = 0
dy = -(x0 / y0) * dx

print(f"Ladder length L = {L} ft")
print(f"Base position  x = {x0} ft")
print(f"Top position   y = {y0:.4f} ft")
print(f"dx/dt = {dx} ft/s  (base sliding out)")
print(f"dy/dt = {dy:.4f} ft/s  (top sliding down)")
print()
print(f"Ratio |dy/dt| / dx/dt = {abs(dy/dx):.4f}  (= x/y = {x0/y0:.4f})")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: "Visualize how dy/dt changes across all positions",
              prose: [
                "The rate equation is $dy/dt = -(x/y) \\cdot dx/dt$.",
                "As the ladder approaches horizontal ($y \\to 0$), the ratio $x/y \\to \\infty$, so $|dy/dt| \\to \\infty$.",
                "This singularity is **physical**, not a math artifact.",
              ],
              code: `from opencalc import Figure
import math

L   = 10.0
dx  = 2.0

# Plot dy/dt as a function of x from 0 to L
def dy_dt(x):
    if x <= 0 or x >= L:
        return None
    y = math.sqrt(L**2 - x**2)
    return -(x / y) * dx

fig = Figure(xmin=0, xmax=10, ymin=-30, ymax=0,
    title="dy/dt vs x (ladder base position, L=10, dx/dt=2)")
fig.grid(step=2).axes()
fig.plot(dy_dt, xmin=0.1, xmax=9.9, color='red', label='dy/dt', width=2.5)
fig.vline(6, color='amber')
fig.point([6, dy_dt(6)], color='amber', label=f'x=6: dy/dt={dy_dt(6):.2f}', radius=7)
fig.text([6.2, -3], 'x = 6 ft', color='amber', size=11)
fig.hline(-2, color='blue', dashed=True)
fig.text([1, -2.5], 'dx/dt = 2 ft/s', color='blue', size=10)
fig.show()`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Balloon: dV/dt = 100 cm³/s, find dr/dt when r = 5",
              prose: [
                "For a sphere: $V = \\tfrac{4}{3}\\pi r^3$ → $\\dfrac{dV}{dt} = 4\\pi r^2 \\dfrac{dr}{dt}$.",
                "The factor $4\\pi r^2$ is the **surface area** — new volume is added in a thin shell.",
                "As $r$ grows, the same $dV/dt$ produces a smaller $dr/dt$.",
              ],
              instructions:
                "Change `dV_dt` or `r_target` and re-run to see how the radius growth rate depends on size.",
              code: `from opencalc import Figure
import math

dV_dt    = 100.0   # cm³/s
r_target = 5.0     # cm

# At r = r_target:
dr_dt = dV_dt / (4 * math.pi * r_target**2)
print(f"dV/dt  = {dV_dt} cm³/s")
print(f"r      = {r_target} cm")
print(f"4πr²   = {4*math.pi*r_target**2:.4f} cm²  (surface area)")
print(f"dr/dt  = {dr_dt:.6f} cm/s")
print()
print("dr/dt as r increases (same dV/dt):")
for r in [1, 2, 3, 5, 8, 12]:
    print(f"  r={r:3d}  dr/dt={dV_dt/(4*math.pi*r**2):.5f} cm/s")

# Plot dr/dt vs r
fig = Figure(xmin=0, xmax=15, ymin=0, ymax=9,
    title="dr/dt vs balloon radius (dV/dt=100 cm³/s)")
fig.grid(step=2).axes()
fig.plot(lambda r: dV_dt/(4*math.pi*r**2) if r > 0 else None,
    xmin=0.3, xmax=15, color='green', label='dr/dt', width=2.5)
fig.point([r_target, dr_dt], color='amber',
    label=f'r={r_target}: dr/dt≈{dr_dt:.3f}', radius=7)
fig.show()`,
              output: "",
              status: "idle",
              figureJson: null,
            },
            {
              id: 4,
              challengeType: "write",
              challengeTitle: "Your Turn: Two Cars at an Intersection",
              difficulty: "medium",
              prompt:
                "Car A heads north at 60 mph, Car B heads west at 80 mph, both toward an intersection.\nWhen A is 5 mi away and B is 12 mi away, find dz/dt (how fast the gap is closing).\n\nConstraint: z² = x² + y²\nDiff: 2z dz/dt = 2x dx/dt + 2y dy/dt\nNote: dx/dt and dy/dt are NEGATIVE (cars approach).",
              hint: "z = √(5² + 12²) = 13. dx/dt = -80, dy/dt = -60. Plug into 2z dz/dt = 2x dx/dt + 2y dy/dt and solve.",
              code: `import math

# ── Fill in the values ──
x = 12       # Car B distance from intersection (mi)
y  = 5       # Car A distance from intersection (mi)
dx = -80     # Car B rate: moving TOWARD intersection
dy = -60     # Car A rate: moving TOWARD intersection

# Step: compute z
z = math.sqrt(x**2 + y**2)
print(f"z (current gap) = {z} mi")

# YOUR CODE: solve for dz/dt using 2z*dz_dt = 2x*dx + 2y*dy
# dz_dt = ???
# print(f"dz/dt = {dz_dt:.4f} mph")`,
              output: "",
              status: "idle",
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "The theoretical foundation of related rates is the chain rule for functions of several variables. Suppose x(t) and y(t) are both differentiable at t₀, and F(x, y) is a function with continuous partial derivatives. Then the composite function h(t) = F(x(t), y(t)) is differentiable at t₀, and h'(t₀) = (∂F/∂x)·x'(t₀) + (∂F/∂y)·y'(t₀). This is a theorem from multivariable calculus, but in single-variable settings (where F depends on only one variable at a time), it reduces to the familiar chain rule d/dt[f(x(t))] = f'(x)·x'(t).",
      "For the chain rule to apply, we need the geometric constraint F(x(t), y(t)) = C to hold for all t in some open interval around t₀, not just at the single instant t₀. This is a continuity requirement: the relationship must be maintained throughout the motion. In the ladder problem, x² + y² = 100 holds for all t from the moment the ladder starts moving until it hits the floor. We can differentiate it with respect to t at any interior point of that interval.",
      'The singularity in the ladder problem deserves careful attention. The rate equation is dy/dt = -(x/y)·(dx/dt). As y → 0⁺, dy/dt → -∞ for any fixed positive dx/dt. This is not a mathematical artifact — it reflects a real physical breakdown. As the ladder approaches horizontal, the constraint equation x² + y² = L² becomes increasingly ill-conditioned: small changes in x (near L) produce disproportionately large changes in y (near 0). The same phenomenon appears in the well-known "barn door" problem in mechanics and in the kinematics of robotic arms near singular configurations.',
      "A subtlety often overlooked: the rate equation 2x(dx/dt) + 2y(dy/dt) = 0 was derived by differentiating a constraint that assumed L is constant. If the ladder were also changing length (say, telescoping), the right side would not be zero — it would be 2L(dL/dt). The related rates method always differentiates the constraint as it actually holds, accounting for any quantities that are truly constant versus those that vary. Identifying which quantities are constant is therefore the first critical step in every problem.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Chain Rule for Composite Functions (Rigorous Form)",
        body: "If x(t) and y(t) are differentiable at t₀ and F has continuous partial derivatives, then\n\\[\\frac{d}{dt}F(x(t),y(t))\\bigg|_{t=t_0} = \\frac{\\partial F}{\\partial x}\\,x'(t_0) + \\frac{\\partial F}{\\partial y}\\,y'(t_0)\\]",
      },
      {
        type: "warning",
        title: "The Constraint Must Hold on an Interval",
        body: "You cannot differentiate a constraint that holds only at a single instant. The equation F(x(t), y(t)) = C must be an identity — true for all t in some interval — to allow differentiation with respect to t. If it holds only at one moment, you have a condition, not a constraint.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: "ch3-000-ex1",
      title: "Ladder Sliding Down a Wall",
      problem:
        "\\text{A 10-ft ladder leans against a wall. The base slides away at } \\frac{dx}{dt} = 2 \\text{ ft/s. Find } \\frac{dy}{dt} \\text{ when } x = 6 \\text{ ft.}",

      steps: [
        {
          expression: "x^2 + y^2 = 100",
          annotation:
            "The Pythagorean theorem: base x, height y, and the fixed 10-ft hypotenuse. This holds for all t.",
          strategyTitle: "Step 1 of 5: Write the geometric constraint equation",
          checkpoint:
            "This equation must be true at EVERY moment, not just one instant. Is it a geometric identity (Pythagorean theorem, volume formula, similar triangles)?",
          hints: [
            "Identify the fixed hypotenuse (the ladder) and the two changing sides (x and y). The Pythagorean theorem gives the geometric relationship.",
            "The triangle is a right triangle, so x² + y² = L². Variables x and y appear (not numbers) because the equation must hold for all values of t throughout the motion.",
            "This is the same operation as implicit differentiation from Ch2 lesson 8 — the constraint holds for all t, just as an implicit curve holds for all (x, y). The independent variable is t instead of x.",
          ],
        },
        {
          expression: "2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0",
          annotation:
            "Differentiate both sides with respect to t. The right side is 0 because 100 is constant. The chain rule gives the factor dx/dt and dy/dt on each term.",
          strategyTitle:
            "Step 2 of 5: Differentiate BOTH sides with respect to t — chain rule on every variable",
          checkpoint:
            "Every variable that depends on t picks up a d/dt factor from the chain rule. Which variables here depend on t?",
          hints: [
            "Apply d/dt term by term to both sides: d/dt[x²] + d/dt[y²] = d/dt[100].",
            "Chain rule: d/dt[x²] = 2x·(dx/dt) because x = x(t). Similarly d/dt[y²] = 2y·(dy/dt). Both x and y depend on t.",
            "Connect to implicit differentiation (Ch2 lesson 8): differentiating x² + y² = 100 with respect to t is exactly the same operation as differentiating with respect to x — only the independent variable changes. Here t is the independent variable.",
          ],
        },
        {
          expression:
            "x = 6 \\Rightarrow y = \\sqrt{100 - 36} = \\sqrt{64} = 8",
          annotation:
            "Find y at the instant x = 6 using the original equation. We must know the current position of BOTH variables before substituting rates.",
          strategyTitle:
            "Step 3 of 5: Find all missing position values at the specific instant",
          checkpoint:
            "Do you know the values of every variable (not rate) that appears in the differentiated equation? If any position is missing, use the original constraint to find it now.",
          hints: [
            "Solve for the missing side at the specific moment mentioned. Substitute x = 6 back into the original Pythagorean equation.",
            "Plug x = 6 into x² + y² = 100 and solve: y = √(100 − 36) = √64 = 8 ft.",
          ],
        },
        {
          expression: "2(6)(2) + 2(8)\\,\\frac{dy}{dt} = 0",
          annotation:
            "Substitute x = 6, y = 8, and dx/dt = 2 into the rate equation.",
          strategyTitle:
            "Step 4 of 5: Substitute the known VALUES — but only AFTER differentiating",
          checkpoint:
            "Warning: you must differentiate first, then substitute. Why would substituting first destroy the rate information?",
          hints: [
            "Substitute the position values (not velocities yet) from the given instant: x = 6, y = 8. Then substitute the known rate dx/dt = 2.",
            "If you substituted x = 6 into x² + y² = 100 before differentiating, you would get a constant (no variables to differentiate); the rate information would be completely lost.",
            "The rates dx/dt and dy/dt are still unknowns at this point — dx/dt = 2 is given, dy/dt is what you solve for. Substitute the known rate (dx/dt = 2) and positions (x = 6, y = 8) into the differentiated equation.",
          ],
        },
        {
          expression: "24 + 16\\,\\frac{dy}{dt} = 0",
          annotation: "Simplify the left side.",
          strategyTitle:
            "Step 4b of 5: Simplify arithmetic before isolating the unknown rate",
          checkpoint:
            "Have all the known numerical values been correctly substituted? Check each term: 2·6·2 = 24 and 2·8 = 16.",
          hints: ["Perform the multiplication: 2 × 6 × 2 = 24 and 2 × 8 = 16."],
        },
        {
          expression:
            "\\frac{dy}{dt} = -\\frac{24}{16} = -\\frac{3}{2} \\text{ ft/s}",
          annotation:
            "Solve for dy/dt. The negative sign means y is decreasing — the top slides DOWN. At this moment the top drops at 3/2 ft/s while the base slides out at 2 ft/s — the top moves slower than the base because the ladder is more horizontal than vertical (x > y).",
          strategyTitle:
            "Step 5 of 5: Solve algebraically for the unknown rate",
          checkpoint:
            "Verify the sign of your answer makes physical sense — should this rate be positive (increasing) or negative (decreasing)?",
          hints: [
            "Linear algebra: isolate the unknown rate dy/dt by subtracting 24 from both sides and dividing by 16.",
            "Check units: distances in ft and time in seconds, so rates should be in ft/s. dy/dt = −24/16 = −3/2 ft/s. ✓",
            "Physical interpretation: negative dy/dt means y is decreasing (top sliding down) — this is expected since the ladder is falling. The top drops at 3/2 ft/s while the base slides out at 2 ft/s, consistent with the ratio −(x/y) = −(6/8) = −3/4.",
          ],
        },
      ],
      conclusion:
        "The top of the ladder slides down at 3/2 ft/s when the base is 6 ft from the wall. The ratio -(x/y) = -(6/8) = -3/4 shows that dy/dt = (3/4)·(-dx/dt) — the top slides slower than the base at this configuration. When x = y = 5√2 (the 45° configuration), dy/dt = -dx/dt exactly.",
    },
    {
      id: "ch3-000-ex2",
      title: "Inflating Spherical Balloon",
      problem:
        "\\text{Air is pumped into a spherical balloon at } \\frac{dV}{dt} = 100 \\text{ cm}^3/\\text{s. Find } \\frac{dr}{dt} \\text{ when } r = 5 \\text{ cm.}",
      steps: [
        {
          expression: "V = \\frac{4}{3}\\pi r^3",
          annotation: "Volume of a sphere. r and V are both functions of t.",
          strategyTitle: "Step 1 of 5: Write the geometric constraint equation",
          checkpoint:
            "This equation must be true at EVERY moment, not just one instant. Is it a geometric identity (Pythagorean theorem, volume formula, similar triangles)?",
          hints: [
            "The geometry here is a sphere — the standard volume formula V = (4/3)πr³ is the geometric identity linking V and r.",
            "Both V and r are functions of t (not fixed numbers). The equation must hold for all t as the balloon inflates, not just at r = 5 cm.",
            "This is the same as implicit differentiation from Ch2 lesson 8 — the constraint V = (4/3)πr³ holds for all t, so it is an identity in t that we can differentiate on both sides.",
          ],
        },
        {
          expression: "\\frac{dV}{dt} = 4\\pi r^2 \\,\\frac{dr}{dt}",
          annotation:
            "Differentiate both sides with respect to t. d/dt[(4/3)πr³] = (4/3)π·3r²·(dr/dt) = 4πr²·(dr/dt). The factor 4πr² is the surface area — new volume is added in a thin surface layer.",
          strategyTitle:
            "Step 2 of 5: Differentiate BOTH sides with respect to t — chain rule on every variable",
          checkpoint:
            "Every variable that depends on t picks up a d/dt factor from the chain rule. Which variables here depend on t?",
          hints: [
            "Apply d/dt term by term to both sides: d/dt[V] on the left = d/dt[(4/3)πr³] on the right.",
            "Chain rule: d/dt[r³] = 3r²·(dr/dt) because r = r(t). So d/dt[(4/3)πr³] = (4/3)π·3r²·(dr/dt) = 4πr²·(dr/dt). Both V and r depend on t.",
            "Connect to implicit differentiation (Ch2 lesson 8): differentiating V = (4/3)πr³ with respect to t is the same operation — t is the independent variable, r is a function of t, so the chain rule produces the dr/dt factor.",
          ],
        },
        {
          expression: "100 = 4\\pi(5)^2 \\cdot \\frac{dr}{dt}",
          annotation: "Substitute dV/dt = 100 and r = 5.",
          strategyTitle:
            "Step 4 of 5: Substitute the known VALUES — but only AFTER differentiating",
          checkpoint:
            "Warning: you must differentiate first, then substitute. Why would substituting first destroy the rate information?",
          hints: [
            "Substitute the position value from the given instant: r = 5. Then substitute the known rate dV/dt = 100.",
            "If you substituted r = 5 into V = (4/3)π(5)³ before differentiating, you would get a constant number — no variables left to differentiate and no rate information.",
            "The rate dr/dt is still unknown at this point — dV/dt = 100 is given, dr/dt is what you solve for. Substitute the known rate and position into the differentiated equation.",
          ],
        },
        {
          expression:
            "100 = 4\\pi(25)\\,\\frac{dr}{dt} = 100\\pi\\,\\frac{dr}{dt}",
          annotation: "Simplify: 4π·25 = 100π.",
          strategyTitle:
            "Step 4b of 5: Simplify arithmetic before isolating the unknown rate",
          checkpoint:
            "Have all known values been substituted correctly? Verify: 4π·(5)² = 4π·25 = 100π.",
          hints: [
            "Square the radius: (5)² = 25. Then multiply: 4π × 25 = 100π.",
          ],
        },
        {
          expression:
            "\\frac{dr}{dt} = \\frac{100}{100\\pi} = \\frac{1}{\\pi} \\approx 0.318 \\text{ cm/s}",
          annotation:
            "Solve for dr/dt. The radius grows at 1/π cm/s at this moment.",
          strategyTitle:
            "Step 5 of 5: Solve algebraically for the unknown rate",
          checkpoint:
            "Verify the sign of your answer makes physical sense — should this rate be positive (increasing) or negative (decreasing)?",
          hints: [
            "Linear algebra: isolate the unknown rate dr/dt by dividing both sides by 100π.",
            "Check units: volume in cm³ and time in seconds, so dV/dt is in cm³/s and dr/dt is in cm/s. ✓",
            "Physical interpretation: positive dr/dt means r is increasing (balloon expanding) — this is expected since air is being pumped in. As r grows, dr/dt = dV/dt/(4πr²) decreases, meaning the radius grows more slowly as the balloon gets larger.",
          ],
        },
      ],
      conclusion:
        "When r = 5 cm, the radius grows at 1/π ≈ 0.318 cm/s. As the balloon inflates, r increases, so dr/dt = dV/dt/(4πr²) decreases — a fixed rate of air input inflates the balloon more slowly as it gets larger, because the same volume of air produces a thinner shell. This is why it's harder to blow up a large balloon than a small one.",
    },
    {
      id: "ch3-000-ex3",
      title: "Water Draining from a Conical Tank",
      problem:
        "\\text{A conical tank (vertex down) has radius 3 m at the top and height 4 m. Water drains at } \\frac{dV}{dt} = -2 \\text{ m}^3/\\text{min. Find } \\frac{dh}{dt} \\text{ when } h = 2 \\text{ m.}",
      steps: [
        {
          expression:
            "\\frac{r}{h} = \\frac{3}{4} \\Rightarrow r = \\frac{3h}{4}",
          annotation:
            "Similar triangles: the tank has radius 3 when height is 4. At any water height h, the water surface radius r satisfies r/h = 3/4. This is the key geometric constraint that reduces two variables to one.",
          strategyTitle: "Step 1 of 5: Write the geometric constraint equation",
          checkpoint:
            "This equation must be true at EVERY moment, not just one instant. Is it a geometric identity (Pythagorean theorem, volume formula, similar triangles)?",
          hints: [
            "The cone's fixed proportions give the geometric identity: the cross-section of the tank is a triangle, so the water surface radius and water height are always in the same ratio as the tank's full radius to full height (similar triangles).",
            "Both r and h are functions of t (not fixed numbers). The ratio r/h = 3/4 holds for all values of t throughout the draining — it is a geometric identity, not a number-specific substitution.",
            "This is the same as implicit differentiation from Ch2 lesson 8 — the similar-triangles constraint r/h = 3/4 holds for all t, allowing us to differentiate it. Here we use it to eliminate r before differentiating (reducing two variables to one).",
          ],
        },
        {
          expression:
            "V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\left(\\frac{3h}{4}\\right)^2 h = \\frac{3\\pi h^3}{16}",
          annotation:
            "Substitute r = 3h/4 into the cone volume formula. Now V is a function of h alone — a single-variable relationship.",
          strategyTitle:
            "Step 2 of 5: Use the geometric constraint to eliminate a variable before differentiating",
          checkpoint:
            "Are you substituting a geometric identity (valid for all t) or a specific number? Substituting r = 3h/4 is valid here because it holds for all t — this is different from substituting h = 2, which is only true at one instant.",
          hints: [
            "Substitute r = 3h/4 into the volume formula V = (1/3)πr²h. This is a symbolic substitution (r in terms of h, both varying in time) — not substituting a specific number.",
            "Simplify: V = (1/3)π(3h/4)²h = (1/3)π(9h²/16)h = (3π/16)h³. Now V is a function of h alone, making the next differentiation step simpler.",
          ],
        },
        {
          expression: "\\frac{dV}{dt} = \\frac{9\\pi h^2}{16}\\,\\frac{dh}{dt}",
          annotation:
            "Differentiate V = 3πh³/16 with respect to t. d/dt[3πh³/16] = (9πh²/16)·(dh/dt).",
          strategyTitle:
            "Step 3 of 5: Differentiate BOTH sides with respect to t — chain rule on every variable",
          checkpoint:
            "Every variable that depends on t picks up a d/dt factor from the chain rule. Which variables here depend on t?",
          hints: [
            "Apply d/dt term by term to both sides: d/dt[V] on the left = d/dt[(3π/16)h³] on the right.",
            "Chain rule: d/dt[h³] = 3h²·(dh/dt) because h = h(t). So d/dt[(3π/16)h³] = (3π/16)·3h²·(dh/dt) = (9πh²/16)·(dh/dt). Both V and h depend on t.",
            "Connect to implicit differentiation (Ch2 lesson 8): differentiating V = (3π/16)h³ with respect to t uses the same chain rule — t is the independent variable, h is a function of t, so every power of h produces a dh/dt factor.",
          ],
        },
        {
          expression:
            "-2 = \\frac{9\\pi(2)^2}{16}\\,\\frac{dh}{dt} = \\frac{9\\pi}{4}\\,\\frac{dh}{dt}",
          annotation:
            "Substitute dV/dt = -2 (negative because draining) and h = 2. Simplify: 9π·4/16 = 9π/4.",
          strategyTitle:
            "Step 4 of 5: Substitute the known VALUES — but only AFTER differentiating",
          checkpoint:
            "Warning: you must differentiate first, then substitute. Why would substituting first destroy the rate information?",
          hints: [
            "Substitute the position value from the given instant: h = 2. Then substitute the known rate dV/dt = −2 (negative because water is draining out).",
            "If you substituted h = 2 into V = (3π/16)(2)³ before differentiating, you would get a constant number — no variables left to differentiate and no rate information.",
            "The rate dh/dt is still unknown at this point — dV/dt = −2 is given, dh/dt is what you solve for. Substitute the known rate (dV/dt = −2) and the position (h = 2) into the differentiated equation.",
          ],
        },
        {
          expression:
            "\\frac{dh}{dt} = \\frac{-2 \\cdot 4}{9\\pi} = \\frac{-8}{9\\pi} \\approx -0.283 \\text{ m/min}",
          annotation: "Solve for dh/dt. The water level drops at 8/(9π) m/min.",
          strategyTitle:
            "Step 5 of 5: Solve algebraically for the unknown rate",
          checkpoint:
            "Verify the sign of your answer makes physical sense — should this rate be positive (increasing) or negative (decreasing)?",
          hints: [
            "Linear algebra: isolate the unknown rate dh/dt by dividing both sides by 9π/4, which is equivalent to multiplying by 4/(9π).",
            "Check units: volume in m³ and time in minutes, so dV/dt is in m³/min and dh/dt is in m/min. ✓",
            "Physical interpretation: negative dh/dt means h is decreasing (water level dropping) — this is expected since dV/dt = −2 (tank is draining). The water level drops faster as h decreases, because the cone narrows near the vertex.",
          ],
        },
      ],
      conclusion:
        "The water level drops at 8/(9π) ≈ 0.283 m/min when h = 2 m. Notice that as h decreases, dh/dt = -32/(9πh²) would increase in magnitude — the water level drops faster as the cone narrows near the vertex, because each meter drop corresponds to less volume lost.",
    },
    {
      id: "ch3-000-ex4",
      title: "Shadow Length Problem",
      problem:
        "\\text{A 20-ft streetlight illuminates a person 6 ft tall walking at 5 ft/s away from the base. Find the rate the shadow tip moves.}",
      steps: [
        {
          expression:
            "\\text{Let } x = \\text{person's distance from base, } s = \\text{shadow length}",
          annotation:
            "Define variables. Both x and s are functions of t. The tip of the shadow is at distance x + s from the base.",
          hints: [
            "Declare your coordinate system.",
            "Identify that there are two separate moving parts: the person and the shadow tip.",
          ],
        },
        {
          expression: "\\frac{20}{x + s} = \\frac{6}{s}",
          annotation:
            "Similar triangles: the streetlight, the tip of the shadow, and the person's top form similar triangles. The full triangle (from base to shadow tip, height 20) is similar to the small triangle (from person to shadow tip, height 6).",
          hints: [
            "Look at the big triangle formed by the streetlight and the shadow tip.",
            "Look at the small triangle formed by the person and the shadow tip.",
            "The ratios of height to base must be equal.",
          ],
        },
        {
          expression:
            "20s = 6(x + s) \\Rightarrow 20s = 6x + 6s \\Rightarrow 14s = 6x",
          annotation:
            "Cross-multiply and simplify. This gives the constraint between s and x.",
          hints: [
            "Solve the proportion by cross-multiplying.",
            "Isolate the variables on opposite sides.",
          ],
        },
        {
          expression: "s = \\frac{3x}{7}",
          annotation: "Solve for s in terms of x.",
          hints: [
            "Express one variable in terms of the other to simplify differentiation.",
          ],
        },
        {
          expression:
            "\\frac{ds}{dt} = \\frac{3}{7}\\,\\frac{dx}{dt} = \\frac{3}{7}(5) = \\frac{15}{7} \\approx 2.14 \\text{ ft/s}",
          annotation:
            "Differentiate both sides with respect to t. Since 3/7 is constant, ds/dt = (3/7)·(dx/dt). The shadow length grows at a constant 15/7 ft/s.",
          hints: [
            "Differentiate with respect to t.",
            "Plug in the person's walking speed dx/dt = 5.",
          ],
        },
        {
          expression:
            "\\text{Shadow tip speed} = \\frac{d}{dt}(x + s) = \\frac{dx}{dt} + \\frac{ds}{dt} = 5 + \\frac{15}{7} = \\frac{50}{7} \\approx 7.14 \\text{ ft/s}",
          annotation:
            "The tip moves at the person's speed plus the shadow growth rate. The shadow tip outpaces the person.",
          hints: [
            "The shadow tip is at position x + s.",
            "Its velocity is the sum of the rates d/dt[x] and d/dt[s].",
          ],
        },
      ],
      conclusion:
        "The shadow's tip moves at 50/7 ≈ 7.14 ft/s, faster than the person's 5 ft/s walking speed. The shadow stretches as the person walks, so the tip moves even faster than the walker. This rate is constant regardless of how far from the post — a consequence of the linear similar-triangles relationship.",
    },
    {
      id: "ch3-000-ex5",
      title: "Angle of Elevation of a Rising Balloon",
      problem:
        "\\text{A balloon rises at 10 ft/s. An observer is 500 ft horizontally from the launch point. Find } d\\theta/dt \\text{ when the balloon is at height } h = 500 \\text{ ft.}",
      steps: [
        {
          expression: "\\tan(\\theta) = \\frac{h}{500}",
          annotation:
            "The angle of elevation θ satisfies tan(θ) = opposite/adjacent = h/500. Both θ and h vary with t.",
          hints: [
            "Relate the angle to the changing height and constant distance using a trig function.",
            "Tangent is usually easiest here since it involves opposite and adjacent.",
          ],
        },
        {
          expression:
            "\\sec^2(\\theta)\\,\\frac{d\\theta}{dt} = \\frac{1}{500}\\,\\frac{dh}{dt}",
          annotation:
            "Differentiate both sides with respect to t. d/dt[tan(θ)] = sec²(θ)·(dθ/dt) by the chain rule. The right side: d/dt[h/500] = (1/500)·(dh/dt).",
          hints: [
            "The derivative of tan(u) is sec²(u) * du/dt.",
            "The right side is just a constant times h, so its derivative is straightforward.",
          ],
        },
        {
          expression:
            "h = 500 \\Rightarrow \\tan(\\theta) = 1 \\Rightarrow \\theta = \\frac{\\pi}{4}",
          annotation: "At h = 500 ft, tan(θ) = 500/500 = 1, so θ = π/4 (45°).",
          hints: ["Find the specific angle at the instant of interest."],
        },
        {
          expression:
            "\\sec^2\\!\\left(\\frac{\\pi}{4}\\right) = \\frac{1}{\\cos^2(\\pi/4)} = \\frac{1}{(1/\\sqrt{2})^2} = 2",
          annotation:
            "Compute sec²(π/4). cos(π/4) = 1/√2, so cos²(π/4) = 1/2, so sec²(π/4) = 2.",
          hints: ["Evaluate the trig coefficient.", "This is 1/cos²(π/4)."],
        },
        {
          expression:
            "2\\,\\frac{d\\theta}{dt} = \\frac{10}{500} = \\frac{1}{50}",
          annotation:
            "Substitute sec²(θ) = 2 and dh/dt = 10 into the rate equation.",
          hints: [
            "Plug in all your known values: sec²(θ) and the rising rate dh/dt.",
          ],
        },
        {
          expression: "\\frac{d\\theta}{dt} = \\frac{1}{100} \\text{ rad/s}",
          annotation:
            "Solve for dθ/dt. The angle increases at 1/100 radian per second at this moment — about 0.57°/s.",
          hints: ["Divide by 2 to isolate dθ/dt."],
        },
      ],
      conclusion:
        "The angle of elevation increases at 1/100 rad/s when the balloon is at 500 ft. As the balloon continues to rise, θ approaches π/2 and sec²(θ) → ∞, which drives dθ/dt → 0 for fixed dh/dt — the angle barely changes when the balloon is nearly overhead because the geometry is almost degenerate.",
    },
    {
      id: "ch3-000-ex6",
      title: "Two Cars Approaching an Intersection",
      problem:
        "\\text{Car A moves north at 60 mph and Car B moves east at 80 mph, both toward an intersection. Find } dz/dt \\text{ when A is 5 mi away and B is 12 mi away.}",
      steps: [
        {
          expression: "z^2 = x^2 + y^2",
          annotation:
            "Let x = Car B's distance from intersection, y = Car A's distance, z = distance between cars. The cars are on perpendicular roads, so the Pythagorean theorem applies.",
          hints: [
            "Model the cars on the x and y axes moving toward the origin.",
            "The hypotenuse z is the line-of-sight distance.",
          ],
        },
        {
          expression:
            "2z\\,\\frac{dz}{dt} = 2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt}",
          annotation: "Differentiate both sides with respect to t.",
          hints: [
            "Differentiate the Pythagorean equation with respect to time.",
            "Note that x, y, and z are all changing.",
          ],
        },
        {
          expression:
            "x = 12, \\; y = 5 \\Rightarrow z = \\sqrt{144 + 25} = \\sqrt{169} = 13 \\text{ mi}",
          annotation:
            "Compute z using the Pythagorean theorem. The 5-12-13 right triangle gives z = 13.",
          hints: ["Find the current distance between the cars."],
        },
        {
          expression: "\\frac{dx}{dt} = -80, \\quad \\frac{dy}{dt} = -60",
          annotation:
            "Both cars approach the intersection, so their distances decrease: dx/dt = -80 mph (B moves east toward intersection), dy/dt = -60 mph (A moves north toward intersection).",
          hints: [
            "The distances are narrowing, so the rates of change for x and y are negative.",
          ],
        },
        {
          expression: "2(13)\\,\\frac{dz}{dt} = 2(12)(-80) + 2(5)(-60)",
          annotation: "Substitute all values into the rate equation.",
          hints: [
            "Plug in the current positions (12, 5) and the current velocities (-80, -60).",
          ],
        },
        {
          expression: "26\\,\\frac{dz}{dt} = -1920 - 600 = -2520",
          annotation: "Simplify the right side.",
          hints: ["Multiply the terms on the right."],
        },
        {
          expression:
            "\\frac{dz}{dt} = \\frac{-2520}{26} = -\\frac{1260}{13} \\approx -96.9 \\text{ mph}",
          annotation:
            "The negative sign means the cars are getting closer. They approach each other at about 96.9 mph.",
          hints: ["Solve for dz/dt."],
        },
      ],
      conclusion:
        "The cars are closing distance at ≈96.9 mph. Note that this is NOT simply 60 + 80 = 140 mph — that would be the rate if they were driving toward each other on a straight road. Because they are on perpendicular roads, the geometry moderates the closure rate through the 5-12-13 triangle.",
    },
    {
      id: "ch3-000-ex7",
      title: "Spreading Circular Oil Slick",
      problem:
        "\\text{A circular oil slick grows at } dA/dt = 50 \\text{ m}^2/\\text{hr. Find } dr/dt \\text{ when } r = 10 \\text{ m.}",
      steps: [
        {
          expression: "A = \\pi r^2",
          annotation: "Area of a circle. Both A and r depend on t.",
          hints: [
            "Use the formula for the area of a circle.",
            "Remember that both A and r are functions of time.",
          ],
        },
        {
          expression: "\\frac{dA}{dt} = 2\\pi r\\,\\frac{dr}{dt}",
          annotation:
            "Differentiate both sides with respect to t. d/dt[πr²] = 2πr·(dr/dt).",
          hints: [
            "Apply the power rule and chain rule to r².",
            "π is a constant.",
          ],
        },
        {
          expression:
            "50 = 2\\pi(10)\\,\\frac{dr}{dt} = 20\\pi\\,\\frac{dr}{dt}",
          annotation: "Substitute dA/dt = 50 and r = 10.",
          hints: [
            "Plug in the given rate of area change and the specific radius.",
          ],
        },
        {
          expression:
            "\\frac{dr}{dt} = \\frac{50}{20\\pi} = \\frac{5}{2\\pi} \\approx 0.796 \\text{ m/hr}",
          annotation: "Solve for dr/dt.",
          hints: ["Divide by 20π to isolate the radial rate."],
        },
      ],
      conclusion:
        "The radius grows at 5/(2π) ≈ 0.796 m/hr when r = 10 m. As the slick spreads, r increases, and the same rate of area increase produces a smaller rate of radius increase — the circle spreads more slowly in radial terms the larger it gets.",
    },
  ],

  story: {
    title: "The Descent: A Calculus Thriller",
    subtitle:
      "A 13-foot ladder. A rain-slicked alley. One question calculus was born to answer.",
    acts: [
      {
        label: "The Scene",
        title: "A Dark Alley, a Perfect Corner",
        content: `Imagine a dark, rain-slicked alleyway in the dead of night. A towering, unforgiving brick wall plunges straight down, meeting the flat concrete ground. Because the builders used a plumb line (perfectly straight up) and a level (perfectly flat across), the wall and the floor meet at exactly a **90-degree angle**.

Think of a full circle as a pie cut into 360 tiny, equal slices called degrees. If you stand facing perfectly forward and turn exactly one-quarter of the way around, you have turned 90 degrees. This creates a sharp, perfect corner — what mathematicians call a **right angle**.

Resting against this wall is a pristine aluminum ladder, exactly **13 feet long**.

Everything is completely still. But the concrete is slick with rain, and suddenly, the bottom of the ladder begins to slide away from the wall. It doesn't slip chaotically; it slides outward into the alley at a steady, relentless pace of **2 feet per second**.

Up at the top of the ladder, gravity demands its due. As the bottom slides out, the top *must* slide down.

**The central mystery:** At the exact, freeze-frame moment when the bottom of the ladder is exactly **5 feet** away from the wall, how fast is the top of the ladder plummeting downward?

This is not a static picture. Geometry deals with frozen shapes. Our world is **moving**. To solve this mystery, we need the mathematics of motion — **Calculus** — and we will build every piece of that machinery right here, from scratch.`,
      },
      {
        label: "Act I",
        title: "The Ancient Law of the Crime Scene",
        content: `Before we can track the motion, we must understand the unbreakable physical laws of the alleyway.

Whenever a straight line (the floor) meets another straight line (the wall) at a perfect 90-degree right angle, and you connect them with a third straight line (the ladder), you create a shape called a **right triangle**.

- One leg runs along the floor. Call its length $x$.
- One leg runs up the wall. Call its length $y$.
- The ladder itself is the longest side, slanting between them — the **hypotenuse**.

Over 2,000 years ago, Pythagoras proved an absolute truth about *every* right triangle: the lengths of the sides are locked together in a permanent mathematical embrace.

Imagine drawing a square attached to the bottom leg — $x$ wide and $x$ tall. Its area is $x^2$. Draw a square attached to the wall leg: area $y^2$. Pythagoras proved that these two areas *always* perfectly equal the area of a square built on the hypotenuse.

Our ladder is a constant 13 feet long. A square built on it has area $13^2 = 169$. Therefore, our unchanging law of the alleyway is:

\\[x^2 + y^2 = 169\\]

This equation is a cosmic handcuff. If the ladder slides outward ($x$ gets bigger), the top *must* slide downward ($y$ gets smaller) by the exact amount required to keep the sum at 169.`,
      },
      {
        label: "Act II",
        title: "The Paradox of the Freeze-Frame",
        content: `We know *where* the ladder is. But our mystery asks *how fast* it is moving.

Speed is simply a distance traveled divided by the time it took. But here we face a profound paradox. We want the speed at an *exact, frozen instant* — the moment $x = 5$. But in a frozen instant, zero time passes. The ladder moves zero feet. Speed is $\\frac{0}{0}$, which breaks all of algebra.

To solve this, mathematicians invented **Calculus** — specifically, the **derivative**.

Instead of freezing time completely, a derivative looks at an infinitely microscopic sliver of time, called $dt$. During that microscopic $dt$, the bottom of the ladder moves a microscopic distance $dx$.

- $\\frac{dx}{dt}$ = the tiny change in $x$ divided by the tiny change in time = **instantaneous speed of the bottom**
- $\\frac{dy}{dt}$ = the tiny change in $y$ over time = **instantaneous speed of the top**

The problem gives us a massive clue. The bottom slides outward at 2 feet per second:

\\[\\frac{dx}{dt} = 2\\]

Our mission is to find the downward speed:

\\[\\frac{dy}{dt} = ?\\]`,
      },
      {
        label: "Act III",
        title: "The Machinery of Change",
        content: `We have a static geometric equation: $x^2 + y^2 = 169$. We need a dynamic motion equation. To get it, we mathematically "press play" — we take the **derivative of both sides with respect to time** $t$.

**Piece 1: the floor square $x^2$**

Use the **Power Rule**: pull the exponent down to the front, giving $2x$. But $x$ is a moving physical object — it has its own internal speed. When a moving quantity is trapped inside another operation, the **Chain Rule** says to multiply the outer change by the inner speed:

\\[\\frac{d}{dt}(x^2) = 2x\\,\\frac{dx}{dt}\\]

**Piece 2: the wall square $y^2$**

By identical logic:

\\[\\frac{d}{dt}(y^2) = 2y\\,\\frac{dy}{dt}\\]

**Piece 3: the constant 169**

The ladder never stretches. The rate of change of a constant is **0**.

Putting it all together — our motion equation:

\\[2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0\\]

This says the motion of the bottom and the motion of the top, when combined, cancel to zero. They are forever linked.`,
      },
      {
        label: "Act IV",
        title: "The Interrogation",
        content: `The scene freezes at $x = 5$. We need to find $y$ at this moment.

Plug $x = 5$ into the original static equation:

\\[5^2 + y^2 = 169\\]
\\[25 + y^2 = 169\\]
\\[y^2 = 144\\]
\\[y = 12\\]

*(We take the positive root — the ladder hasn't phased through the concrete!)*

We now have all the evidence:
- $x = 5$
- $y = 12$
- $\\frac{dx}{dt} = 2$`,
      },
      {
        label: "Act V",
        title: "The Confession",
        content: `Substitute into our motion equation:

\\[2(5)(2) + 2(12)\\,\\frac{dy}{dt} = 0\\]
\\[20 + 24\\,\\frac{dy}{dt} = 0\\]
\\[24\\,\\frac{dy}{dt} = -20\\]
\\[\\frac{dy}{dt} = -\\frac{20}{24} = -\\frac{5}{6}\\]

The answer is $-\\frac{5}{6}$ feet per second.

The **negative sign** is the storyteller. A positive rate means a quantity is growing (the bottom was sliding *out* at $+2$). A negative rate means a quantity is shrinking — the top is sliding *down*.

At the exact instant the bottom is 5 feet from the wall, the top is plunging downward at $\\frac{5}{6}$ of a foot per second.`,
      },
    ],
    resolution: `The mystery is solved — not by magic, but by the unbreakable laws of geometry and the precise machinery of calculus.

**What we built from scratch:**
- The Pythagorean constraint $x^2 + y^2 = 169$ — the static law of the scene
- Implicit differentiation with respect to time — pressing play on the geometry
- The Chain Rule — connecting the speed of $x$ to the speed of $y$
- Algebraic substitution — plugging in the freeze-frame values to extract the answer

Every related rates problem follows this exact structure: find the geometric constraint, differentiate it with respect to time, substitute known values, solve for the unknown rate. No leaps. No hidden assumptions. Just pure, rigorous truth.`,
  },

  discovery: [
    {
      title: `Why Is My Shadow Running Away From Me?`,
      persona: `It's late. I just left a restaurant and I'm walking home along an empty sidewalk. There's a single streetlight behind me, casting my shadow ahead of me on the pavement. I notice something strange: my shadow seems to be racing ahead. The faster I walk, the faster the tip of my shadow moves — but the tip seems to be moving *faster than I am*. How is that possible? And exactly how fast is it moving?`,
      steps: [
        {
          phase: "need",
          title: `What I already know how to do`,
          content: `I know how to handle things that change at constant rates. If I walk at 4 feet per second, then after $t$ seconds my position is $x = 4t$. Done.

I also know how to use the derivative. If my position is some function $f(t)$, then $f'(t)$ gives my velocity at any moment.

And I know the geometry of similar triangles — two triangles that have the same angles have sides in the same ratio.

These are the tools I have. Let me try to use them to answer the shadow question.`,
        },
        {
          phase: "need",
          title: `Setting up the geometry — two quantities I can measure`,
          content: `Here's the scene from above. The streetlight is a pole of height $H = 16$ feet, standing at the origin. I am 6 feet tall, walking away from the pole.

At any moment, let:
- $x$ = my distance from the base of the pole (feet)
- $y$ = the distance from the pole to the **tip** of my shadow (feet)

I can track both of these quantities over time. They are both functions of time: $x(t)$ and $y(t)$.

The shadow tip is always farther than me: $y > x$. My shadow's length is $y - x$.

I know my walking speed: $\dfrac{dx}{dt} = 4$ ft/s.

The question: what is $\dfrac{dy}{dt}$? How fast is the shadow tip moving?`,
        },
        {
          phase: "need",
          title: `The breakdown — I have one equation, but both variables are moving`,
          content: `The geometry gives me a relationship between $x$ and $y$. The lamppost, my head, and the shadow tip form two similar triangles:

- The large triangle: base $y$, height $H = 16$ (from ground to lamp)
- The small triangle: base $y - x$, height $h = 6$ (from ground to my head)

Similar triangles: corresponding sides are proportional.

$$\\frac{H}{y} = \\frac{h}{y - x} \implies \\frac{16}{y} = \\frac{6}{y - x}$$

Cross-multiply:

$$16(y - x) = 6y \implies 16y - 16x = 6y \implies 10y = 16x \implies y = \\frac{8}{5}x$$

This is a clean, exact equation. It tells me: **at every moment**, the shadow tip is always $\\frac{8}{5}$ times as far from the lamp as I am.

But here's the problem. I know $\dfrac{dx}{dt}$. I want $\dfrac{dy}{dt}$. The equation $y = \\frac{8}{5}x$ relates **positions**, not **rates**. I have no formula that gives me $\dfrac{dy}{dt}$ directly.

I could try to substitute $x = 4t$ to get $y = \\frac{8}{5}(4t) = \\frac{32}{5}t$ and then differentiate $y$ with respect to $t$. That works here — but only because this problem was simple enough to solve for $y$ explicitly. What if the equation relating $x$ and $y$ couldn't be solved for one variable? What if it was something like $x^2 + xy + y^2 = 100$? There's no way to isolate $y$ cleanly.

I need a method that works whether or not I can isolate variables.`,
        },
        {
          phase: "discovery",
          title: `Key insight — both sides of an equation can be differentiated`,
          content: `Here is the equation I have:

$$10y = 16x$$

Both sides are equal. They are equal at every instant in time. So they must be changing at the same rate over time.

Think of it this way: if two quantities are always equal, then their rates of change must also always be equal. If they ever diverged even slightly, they wouldn't be equal anymore.

This means I can **differentiate both sides with respect to time $t$** and the equation will still hold:

$$\\frac{d}{dt}[10y] = \\frac{d}{dt}[16x]$$

Now I apply the rules I know:
- On the left: $\\frac{d}{dt}[10y] = 10\\frac{dy}{dt}$ (constant multiple rule)
- On the right: $\\frac{d}{dt}[16x] = 16\\frac{dx}{dt}$ (constant multiple rule)

So:

$$10\\frac{dy}{dt} = 16\\frac{dx}{dt}$$

Solve for $\dfrac{dy}{dt}$:

$$\\frac{dy}{dt} = \\frac{16}{10}\\frac{dx}{dt} = \\frac{8}{5}\\frac{dx}{dt}$$

The rates are related by **the same fraction** as the positions. That's not a coincidence — it follows directly from differentiating the relationship.`,
        },
        {
          phase: "discovery",
          title: `Plug in what I know — get the answer`,
          content: `I know: $\dfrac{dx}{dt} = 4$ ft/s (my walking speed).

$$\\frac{dy}{dt} = \\frac{8}{5} \\times 4 = \\frac{32}{5} = 6.4 \\text{ ft/s}$$

The shadow tip is moving at **6.4 ft/s** — even though I'm only walking at 4 ft/s.

The shadow tip is moving **faster than I am** by a factor of $\\frac{8}{5}$. That same factor shows up three different ways:
- In the positions: $y = \\frac{8}{5}x$
- In the rates: $\\frac{dy}{dt} = \\frac{8}{5}\\frac{dx}{dt}$
- In the geometry: lamp height $16$, my height $6$, ratio $\\frac{16}{16-6} = \\frac{16}{10} = \\frac{8}{5}$

They're all the same statement — just evaluated at different moments. The derivative converted the static geometry into a live relationship between rates.

**Bonus — how fast is the shadow itself growing?**

Shadow length $= y - x$. So:

$$\\frac{d}{dt}[y - x] = \\frac{dy}{dt} - \\frac{dx}{dt} = 6.4 - 4 = 2.4 \\text{ ft/s}$$

My shadow grows 2.4 ft longer every second. The tip races ahead at 6.4 ft/s because it picks up both my walking speed (4 ft/s) and the shadow's own growth (2.4 ft/s).`,
        },
        {
          phase: "discovery",
          title: `What if the relationship wasn't linear? Try a harder case`,
          content: `The shadow problem worked out cleanly because the geometric relationship $10y = 16x$ was linear — differentiating it was trivial.

Now try a case that isn't linear. I'm at the same streetlight, but now I care about the **distance** $D$ from the lamp directly to my head (not along the ground — the straight-line, slant distance through the air).

By the Pythagorean theorem (my head is at coordinates $(x, 6)$, the lamp is at $(0, 16)$):

$$D^2 = x^2 + (16 - 6)^2 = x^2 + 100$$

Differentiate both sides with respect to $t$. The left side: $\\frac{d}{dt}[D^2]$. Here $D$ is a function of $t$, so I need the **chain rule**:

$$\\frac{d}{dt}[D^2] = 2D \cdot \\frac{dD}{dt}$$

The right side: $\\frac{d}{dt}[x^2 + 100] = 2x\\frac{dx}{dt} + 0 = 2x\\frac{dx}{dt}$

So:

$$2D\\frac{dD}{dt} = 2x\\frac{dx}{dt}$$

$$\\frac{dD}{dt} = \\frac{x}{D}\\frac{dx}{dt}$$

At the moment $x = 8$ ft: $D = \sqrt{64 + 100} = \sqrt{164} \approx 12.8$ ft.

$$\\frac{dD}{dt} = \\frac{8}{12.8} \\times 4 \approx 2.5 \\text{ ft/s}$$

The straight-line distance from the lamp to my head grows at 2.5 ft/s — even though I'm walking at 4 ft/s. The slant distance grows more slowly because part of my walking motion is "sideways" relative to the lamp direction.

This step required the chain rule to differentiate $D^2$. That is the heart of related rates: **the chain rule, applied to both sides of a geometric constraint, with respect to time**.`,
        },
        {
          phase: "formalization",
          title: `Name the method: differentiating a constraint with respect to time`,
          content: `What we just did has a name: **related rates**.

The method in full generality:

Two quantities $u$ and $v$ are related by a constraint equation:

$$F(u, v) = \\text{constant} \quad \\text{or} \quad G(u, v) = H(u, v)$$

Both $u$ and $v$ are functions of time $t$. Differentiating both sides with respect to $t$ — and applying the chain rule wherever a variable appears — gives a new equation:

$$\\frac{d}{dt}[F(u, v)] = 0 \quad \\text{or} \quad \\frac{d}{dt}[G(u, v)] = \\frac{d}{dt}[H(u, v)]$$

This new equation relates the **rates** $\dfrac{du}{dt}$ and $\dfrac{dv}{dt}$.

**The chain rule is what makes this work.** When you differentiate $u^2$ with respect to $t$:

$$\\frac{d}{dt}[u^2] = 2u \cdot \\frac{du}{dt}$$

The $\dfrac{du}{dt}$ appears because $u$ is a function of $t$, not a constant. Every time you differentiate a variable with respect to $t$, its rate $\dfrac{d(\cdot)}{dt}$ appears. This is the chain rule: $\dfrac{d}{dt}[f(u(t))] = f'(u) \cdot \dfrac{du}{dt}$.

This is also called **implicit differentiation with respect to time** — the same technique from Chapter 2 (implicit differentiation), but with $t$ playing the role of $x$.`,
        },
        {
          phase: "formalization",
          title: `The four-step procedure — same structure every time`,
          content: `Every related rates problem, regardless of how it's dressed up, follows the same four steps:

---

**Step 1 — Draw and label.**

Define variables for every changing quantity. Label all fixed quantities as constants. Draw the scene if it helps. Be explicit: name $x(t)$, $y(t)$, $D(t)$, etc.

**Step 2 — Write the constraint.**

Find the geometric or physical law that links your variables at every instant:
- Similar triangles → ratios of sides
- Pythagorean theorem → $a^2 + b^2 = c^2$
- Area or volume formula → $V = \\frac{4}{3}\pi r^3$, $A = \pi r^2$, etc.
- Any other equation that's always true during the problem

**Step 3 — Differentiate both sides with respect to $t$.**

Apply chain rule to every term containing a variable. Every variable $u$ that changes in time produces a $\dfrac{du}{dt}$:

$$\\frac{d}{dt}[u^n] = nu^{n-1}\\frac{du}{dt}, \qquad \\frac{d}{dt}[uv] = \\frac{du}{dt} \cdot v + u \cdot \\frac{dv}{dt}, \qquad \\frac{d}{dt}[c] = 0$$

**Step 4 — Substitute and solve.**

Plug in the values of all known quantities (positions, lengths) and all known rates at the specific instant in question. Solve for the unknown rate.

---

**Our shadow problem, in the template:**

| Step | Work |
|---|---|
| Label | $x(t)$: my position; $y(t)$: shadow tip; $H=16$, $h=6$ |
| Constraint | $\\frac{H}{y} = \\frac{h}{y-x} \Rightarrow 10y = 16x$ |
| Differentiate | $10\\frac{dy}{dt} = 16\\frac{dx}{dt}$ |
| Substitute | $\\frac{dx}{dt} = 4 \Rightarrow \\frac{dy}{dt} = \\frac{16}{10}(4) = 6.4$ ft/s |

The template never changes. Only the constraint equation changes from problem to problem.`,
        },
      ],
      resolution: `**Related Rates — the complete method:**

Two quantities changing in time are linked by a geometric constraint. Differentiate both sides of the constraint with respect to $t$ (applying the chain rule), then substitute known values to find the unknown rate.

**The four steps:**

1. **Label** every changing quantity as a function of $t$; mark all constants
2. **Constraint** — find the equation that links them (similar triangles, Pythagorean theorem, area/volume formula)
3. **Differentiate** both sides with respect to $t$ — every variable $u$ produces a $\\dfrac{du}{dt}$ via the chain rule
4. **Substitute** known positions and known rates at the instant in question; solve for the unknown rate

**Why the chain rule is the engine:**

$$\\frac{d}{dt}[u^2] = 2u\\frac{du}{dt} \\qquad \\frac{d}{dt}[uv] = \\frac{du}{dt} v + u \\frac{dv}{dt} \\qquad \\frac{d}{dt}[c] = 0$$

**The shadow result:** if you are $h$ feet tall and a lamp is $H$ feet tall, the shadow tip always moves at $\\dfrac{H}{H - h}$ times your walking speed — regardless of where you are. The ratio is locked in by the geometry, and the derivative transmits that ratio directly to the rates.

**What you discovered:** differentiating a geometric relationship with respect to time converts a static picture into a live equation between rates. The math that described the shape of the scene now describes how the scene is moving. That is the full power of the derivative — not just "slope of a curve," but *the rate of any changing quantity linked by any equation*.`,
    },
    {
      title: `The Chain and the Cloud`,
      persona: `I'm learning that calculus isn't really about slopes on a graph — it's about **coupled systems**. Pull a string here, something moves over there. Add users to an app, the server load explodes. I want to understand: when one quantity changes, how fast does a linked quantity have to change? And why does the answer depend on *where you are*, not just *how fast you're going*?`,
      steps: [
        {
          phase: "need",
          title: `What I already know — and where it stops working`,
          content: `I can compute derivatives. I can differentiate $f(t) = t^2$ and get $f'(t) = 2t$. I know what that means: at any moment $t$, the function is changing at rate $2t$.

What I haven't done yet is handle a situation where **two different quantities are linked**, and I know the rate of one but need the rate of the other.

Here's the question that comes up constantly in real engineering:

> You're adding users to an app at 10 per day. How fast is the server load growing?

The server load is not the same thing as the number of users. They're connected by a formula. But if I want the **rate** the load is growing, I can't just plug in a number — I need to know how the rates themselves are linked.

This is the core problem of related rates: **two quantities are locked together by an equation. One rate is known. Find the other.**`,
        },
        {
          phase: "need",
          title: `The simplest locked system — a bicycle chain`,
          content: `Before apps and servers, start with something mechanical. A 10-speed bicycle.

Your feet drive the **front chainring** (50 teeth). The chain connects it to the **rear cog** (25 teeth) on the back wheel. The chain physically locks the two gears together — they cannot move independently.

Define:
- $P(t)$ = pedaling speed in RPM at time $t$
- $W(t)$ = wheel speed in RPM at time $t$

The gear ratio is fixed: for every tooth on the front that moves, one tooth on the back must move. The front has 50 teeth, the back has 25, so:

$$W = \\frac{50}{25} P = 2P$$

This equation is always true — at every instant. It's the **constraint**. The chain enforces it.

Now I know one rate: $\\dfrac{dP}{dt} = 5$ RPM/s (I'm spinning up). What's $\\dfrac{dW}{dt}$?

I'm stuck. I know how positions relate ($W = 2P$), but I want how **rates** relate.`,
        },
        {
          phase: "discovery",
          title: `Differentiate the constraint — the rates fall out`,
          content: `The equation $W = 2P$ holds at every instant. So both sides are changing together — I can differentiate both sides with respect to time:

$$\\frac{d}{dt}[W] = \\frac{d}{dt}[2P]$$

$$\\frac{dW}{dt} = 2 \\cdot \\frac{dP}{dt}$$

The rates obey the **same ratio** as the quantities. If the gear ratio says the wheel spins twice as fast as the pedals, it also says the wheel *accelerates* twice as fast as the pedals.

Plug in $\\dfrac{dP}{dt} = 5$:

$$\\frac{dW}{dt} = 2 \\times 5 = 10 \\text{ RPM/s}$$

The wheel is spinning up at 10 RPM per second.

---

**This makes physical sense.** The chain is rigid. If your feet speed up by 5 RPM, the chain has to deliver that change to the wheel immediately. The wheel can't decide to speed up less — the hardware locks the rates together.

**Key observation:** for this linear constraint ($W = 2P$), differentiating is trivial. The rate equation looks exactly like the position equation. That won't always be the case.`,
        },
        {
          phase: "discovery",
          title: `A nonlinear constraint — the network app`,
          content: `Now something that matters. You're building a group chat app. Every user can connect to every other user. Count the total possible connections:

- 2 users: 1 connection
- 3 users: 3 connections
- 4 users: 6 connections
- 10 users: 45 connections
- 100 users: 4,950 connections

The pattern: with $U$ users, there are $\\dfrac{U(U-1)}{2}$ connections. For large $U$, this is approximately:

$$C \\approx \\frac{1}{2}U^2$$

This is the **constraint** — the formula that locks connections to users.

Your marketing team is adding users at a steady rate: $\\dfrac{dU}{dt} = 10$ users/day. How fast is the connection count (and therefore the server load) growing?

Same process: differentiate the constraint with respect to time.

$$\\frac{d}{dt}\\left[C\\right] = \\frac{d}{dt}\\left[\\frac{1}{2}U^2\\right]$$

The right side requires the **chain rule** — $U$ is a function of $t$:

$$\\frac{dC}{dt} = \\frac{1}{2} \\cdot 2U \\cdot \\frac{dU}{dt} = U \\cdot \\frac{dU}{dt}$$

This is the rate equation. Now plug in:`,
        },
        {
          phase: "discovery",
          title: `The revelation — the same input causes wildly different outputs`,
          content: `The rate equation is $\\dfrac{dC}{dt} = U \\cdot \\dfrac{dU}{dt}$.

Your marketing team holds $\\dfrac{dU}{dt} = 10$ users/day constant. But what happens to $\\dfrac{dC}{dt}$ as the app grows?

| Users $U$ | $\\dfrac{dU}{dt}$ | $\\dfrac{dC}{dt} = U \\cdot \\dfrac{dU}{dt}$ |
|---|---|---|
| $10$ | $10$/day | $100$ connections/day |
| $100$ | $10$/day | $1{,}000$ connections/day |
| $1{,}000$ | $10$/day | $10{,}000$ connections/day |
| $10{,}000$ | $10$/day | $100{,}000$ connections/day |

The marketing team is doing the exact same work every day. The user growth rate is constant. But the **server load growth rate is exploding** — it's proportional to $U$.

This is what the rate equation $\\dfrac{dC}{dt} = U \\cdot \\dfrac{dU}{dt}$ tells you: the "gear ratio" between user growth and connection growth is not fixed. It's $U$ itself — it grows with the system. The bigger the network, the harder it is to absorb each new user.

This is why apps that feel fast at launch start lagging at scale. The constraint was nonlinear. That nonlinearity transmits directly into the rates.

---

**Compare the two systems:**

| System | Constraint | Rate equation | Gear ratio |
|---|---|---|---|
| Bicycle | $W = 2P$ | $\\dfrac{dW}{dt} = 2\\dfrac{dP}{dt}$ | Fixed: always $2$ |
| Network | $C = \\frac{1}{2}U^2$ | $\\dfrac{dC}{dt} = U\\dfrac{dU}{dt}$ | Variable: grows with $U$ |

Linear constraint → constant gear ratio. Nonlinear constraint → variable gear ratio. The nonlinearity in the position equation becomes a nonlinearity in the rate equation.`,
        },
        {
          phase: "formalization",
          title: `The method: differentiate the constraint with respect to time`,
          content: `Both problems — the bicycle and the network — used the same procedure. Now name it.

**Related rates** is the technique of differentiating a constraint equation with respect to time to find how the rates of change of two coupled quantities are related.

**The general setup:**

Two quantities $A(t)$ and $B(t)$ are linked by a constraint:

$$F(A, B) = k \quad \text{(some constant or fixed equation)}$$

Differentiate both sides with respect to $t$. The chain rule gives a rate of $\\dfrac{dA}{dt}$ or $\\dfrac{dB}{dt}$ wherever $A$ or $B$ appears:

$$\\frac{d}{dt}[F(A, B)] = 0$$

This produces a new equation relating $\\dfrac{dA}{dt}$ and $\\dfrac{dB}{dt}$. If you know one, you can find the other.

---

**Why the chain rule is unavoidable:**

When you differentiate $A^2$ with respect to $t$, you get $2A \\cdot \\dfrac{dA}{dt}$ — not just $2A$. The $\\dfrac{dA}{dt}$ appears because $A$ is a function of $t$. Every term containing a variable picks up a rate factor. This is the chain rule:

$$\\frac{d}{dt}[A^n] = nA^{n-1} \\cdot \\frac{dA}{dt}$$

For the network: $\\dfrac{d}{dt}\\left[\\frac{1}{2}U^2\\right] = U \\cdot \\dfrac{dU}{dt}$. The $U$ out front is the current "gear ratio" — it came from the power rule applied via the chain rule.`,
        },
        {
          phase: "formalization",
          title: `The four-step template — every related rates problem`,
          content: `Whether it's gears, networks, tanks draining, or shadows moving, the structure never changes:

**Step 1 — Identify the constraint.**
What equation links the two quantities at every moment? This is the "hardware" of the problem — the chain, the formula, the geometry. Write it down.

**Step 2 — Differentiate both sides with respect to $t$.**
Apply the chain rule to every term that contains a variable (something that changes in time). Constants stay constant — their derivatives are zero.

**Step 3 — Substitute the known rate.**
Plug in the rate you were given ($\\dfrac{dP}{dt}$, $\\dfrac{dU}{dt}$, etc.) and any known values of the variables at the instant you care about.

**Step 4 — Solve for the unknown rate.**
The unknown rate ($\\dfrac{dW}{dt}$, $\\dfrac{dC}{dt}$, etc.) is the only thing left. Solve for it.

---

**The two problems in the template:**

| | Bicycle | Network |
|---|---|---|
| Constraint | $W = 2P$ | $C = \\frac{1}{2}U^2$ |
| Differentiate | $\\dfrac{dW}{dt} = 2\\dfrac{dP}{dt}$ | $\\dfrac{dC}{dt} = U\\dfrac{dU}{dt}$ |
| Substitute | $\\dfrac{dP}{dt} = 5$ | $\\dfrac{dU}{dt} = 10$, $U = 1000$ |
| Solve | $\\dfrac{dW}{dt} = 10$ RPM/s | $\\dfrac{dC}{dt} = 10{,}000$ connections/day |

The same four steps. The same chain rule. Only the constraint changes.`,
        },
      ],
      resolution: `**Related Rates — the complete method:**

Two quantities changing in time are locked together by a constraint equation. Differentiating both sides with respect to $t$ converts the position constraint into a rate constraint.

**The four steps:**
1. **Constraint** — write the equation that links the two quantities at every moment
2. **Differentiate** both sides with respect to $t$; every variable picks up a $\\dfrac{d(\\cdot)}{dt}$ via the chain rule
3. **Substitute** known rates and known values at the instant in question
4. **Solve** for the unknown rate

**Linear vs. nonlinear constraints:**

| Constraint type | Rate equation | What it means |
|---|---|---|
| Linear: $B = kA$ | $\\dfrac{dB}{dt} = k\\dfrac{dA}{dt}$ | Fixed gear ratio — rates scale the same way as positions |
| Nonlinear: $C = \\frac{1}{2}U^2$ | $\\dfrac{dC}{dt} = U\\dfrac{dU}{dt}$ | Variable gear ratio — the rate relationship depends on where you are |

**The deeper insight:** a nonlinear constraint means the "gear ratio" between two rates is not a constant — it's a function of the current state. The bicycle feels the same on every hill. The network gets harder to manage the bigger it gets. The derivative of the constraint equation tells you exactly how much harder, at every moment.`,
    },
    {
      title: "The Winch Crank",
      persona:
        "I'm using a manual winch to haul a heavy anchor up onto the dock. I turn the crank at a steady 30 revolutions per minute. The drum starts with a small radius and gets thicker as rope winds on. I can feel the load getting harder to turn, but I need to know: exactly how fast is the anchor rising **right now**? My turning speed is constant, but the effective pulling speed changes because the radius is growing. One mechanical action (my crank) drives another (the rope moving). I want to see the exact relationship between my rotation and the anchor's speed — and why the chain rule shows up naturally when things are linked.",
      steps: [
        {
          phase: "need",
          title: "The mechanical constraint I can measure",
          content:
            "The winch has a drum. Let:\n\n- $\\theta(t)$ = angle the crank has turned (in radians) at time $t$\n- $r(t)$ = current radius of the wound rope on the drum (in feet)\n- $s(t)$ = length of rope that has been wound in (so the anchor rises by $s(t)$)\n\nThe key relationship is simple geometry: the length of rope wound equals the angle turned times the current radius:\n\n$$s = r \\cdot \\theta$$\n\nThis equation must be true at **every instant**. It is the mechanical constraint — the rope is physically wrapped around the drum, so the two quantities are locked together. I know my crank speed (I can count turns), and I can measure the current radius, but I need the **speed** of the anchor right now, not just the total length wound.",
        },
        {
          phase: "need",
          title: "Why my old tools fail",
          content:
            "If the radius were constant, it would be easy:\n\n$$\\text{anchor speed} = r \\times \\text{crank speed}$$\n\nBut the radius $r$ is **changing** as more rope winds on. My crank angular speed is constant:\n\n$$\\frac{d\\theta}{dt} = 30 \\text{ rev/min} = \\pi \\text{ rad/s}$$\n\nI know $\\frac{d\\theta}{dt}$, I know the current $r$, but I cannot just multiply because $r$ itself is a function of time. The simple product rule I learned in algebra doesn't directly give me the rate of $s$. I need a way to handle the fact that **both** $r$ and $\\theta$ are changing at the same time.",
        },
        {
          phase: "discovery",
          title: "Building the rate with finite slices",
          content:
            "I break time into tiny intervals of length $\\Delta t$. In one small slice:\n\n- The crank turns an extra $\\Delta \\theta$\n- The radius grows by a tiny $\\Delta r$ (because more rope is wound on)\n\nThe extra rope length wound in that slice is approximately:\n\n$$\\Delta s \\approx r \\cdot \\Delta \\theta + \\theta \\cdot \\Delta r$$\n\n(This is the finite version of the product rule — I add the two contributions separately.)\n\nThe average speed of the anchor over that tiny interval is:\n\n$$\\frac{\\Delta s}{\\Delta t} \\approx r \\cdot \\frac{\\Delta \\theta}{\\Delta t} + \\theta \\cdot \\frac{\\Delta r}{\\Delta t}$$\n\nAs I make $\\Delta t$ smaller and smaller, the approximation gets better. The terms $\\frac{\\Delta \\theta}{\\Delta t}$ and $\\frac{\\Delta r}{\\Delta t}$ become the instantaneous rates $\\frac{d\\theta}{dt}$ and $\\frac{d r}{dt}$. So the instantaneous speed of the anchor must be:\n\n$$\\frac{ds}{dt} = r \\cdot \\frac{d\\theta}{dt} + \\theta \\cdot \\frac{dr}{dt}$$\n\nThis is the exact relationship I need.",
        },
        {
          phase: "discovery",
          title: "Plugging in real numbers at one moment",
          content:
            "Right now:\n- Crank speed $\\frac{d\\theta}{dt} = \\pi$ rad/s (30 rpm)\n- Current radius $r = 0.5$ ft\n- The rate at which the radius is growing $\\frac{dr}{dt} = 0.02$ ft/s (I measured how fast the rope layer is building up)\n- Current angle $\\theta = 20$ radians (about 3 full turns already wound)\n\nSubstitute into the relationship:\n\n$$\\frac{ds}{dt} = (0.5) \\cdot (\\pi) + (20) \\cdot (0.02)$$\n\n$$\\frac{ds}{dt} = 1.57 + 0.4 = 1.97 \\text{ ft/s}$$\n\nThe anchor is rising at almost 2 feet per second right now — faster than the simple $r \\times$ crank speed would suggest, because the growing radius is adding extra speed.",
        },
        {
          phase: "formalization",
          title: "The chain rule appears naturally",
          content:
            "We have reconstructed the exact rate using only measurable quantities and finite slices. Now we compress it into clean notation.\n\nThe length $s = r \\cdot \\theta$ is a **product** of two functions that both depend on time. The rate of change of a product is:\n\n$$\\frac{d}{dt}(r \\cdot \\theta) = r \\cdot \\frac{d\\theta}{dt} + \\theta \\cdot \\frac{dr}{dt}$$\n\nThis is the **product rule**. It is the chain rule in disguise when one quantity drives another through a changing relationship.\n\nIn mechanical terms, the crank (angular motion) drives the rope (linear motion), but the effective “gear ratio” is the current radius $r$, which itself is changing. The product rule captures exactly how those two linked motions combine.",
        },
        {
          phase: "formalization",
          title: "Why this is the chain rule in mechanical form",
          content:
            "Think of it as gears: the crank is one gear, the drum radius is the effective size of the second “gear.” Because the radius changes, it is like a continuously variable transmission. The chain rule (or product rule here) is the mathematical way of saying “the total output speed is the sum of the direct drive plus the effect of the changing ratio.”\n\nIn any mechanical system where one motion drives another through a changing dimension (cams, belts with stretch, screws with varying pitch, winches with winding rope), the same structure appears: you end up with a product or composition that requires the chain rule to get the true output speed.",
        },
      ],
      resolution:
        "**The mechanical chain rule — earned from the winch**\n\nWe started with a real mechanical constraint ($s = r \\cdot \\theta$). We built the rate using finite slices and the product of two changing quantities. Only at the end did we name it the product rule / chain rule.\n\n**The four-step process for any linked mechanical system:**\n1. **Write the constraint** — the physical relationship that locks the two quantities together at every instant.\n2. **Differentiate the constraint** — allow both quantities to be functions of time and apply the product/chain rule term by term.\n3. **Substitute known rates and current values** — plug in the driving speed and the current state.\n4. **Interpret the result** — the output rate tells you exactly how fast the driven part is moving right now.\n\nThe chain rule is not an abstract formula — it is the natural description of how one mechanical motion drives another when the connection itself is changing. Next time you turn a crank, pull a rope, or shift gears, you’ll see the same relationship at work.",
    },
  ],

  challenges: [
    {
      id: "ch3-000-ch1",
      difficulty: "hard",
      problem:
        "A kite flies at constant height 100 m. The string is let out at 5 m/s. Find the rate the horizontal distance from the flier increases when 200 m of string has been let out.",
      hint: "Let L = string length (the hypotenuse), x = horizontal distance (one leg), height = 100 m (the other leg, fixed). Use x² + 100² = L². Differentiate and substitute.",
      walkthrough: [
        {
          expression: "\\text{Step 1: Read the problem and name every quantity}",
          annotation: "Before touching any math, list what changes, what is fixed, what rate you know, and what rate you need.",
          prereq: `**How to read a related rates problem:**

Every related rates problem gives you:
- Quantities that **change over time** — give each a letter ($x$, $L$, $r$, $h$)
- Quantities that are **fixed (constant)** — their derivative is zero
- A **known rate** — a $\\dfrac{d(\\cdot)}{dt}$ value given to you
- An **unknown rate** — the $\\dfrac{d(\\cdot)}{dt}$ you must find

For this problem:

| Quantity | Type | Given? |
|---|---|---|
| $x$ = horizontal distance from flier to point below kite | changes | No — must compute |
| $L$ = total string let out | changes | $L = 200$ m at the moment we care about |
| Height $= 100$ m | fixed | Yes — always 100 m |
| $\\dfrac{dL}{dt} = 5$ m/s | known rate | Yes |
| $\\dfrac{dx}{dt}$ = how fast $x$ grows | unknown rate | This is what we find |`,
        },
        {
          expression: "x^2 + 100^2 = L^2",
          annotation: "The Pythagorean theorem is the constraint — true at every instant. Both $x$ and $L$ are functions of time. The 100 is a constant.",
          prereq: `**What is a constraint equation, and why the Pythagorean theorem?**

A **constraint** is an equation that is always true — not just at one moment, but at every moment in time.

The kite, the string, and the ground form a right triangle at every instant:
- Horizontal leg = $x$ (changes)
- Vertical leg = 100 m (fixed — kite stays at constant height)
- Hypotenuse = string $L$ (changes)

For any right triangle: leg² + leg² = hypotenuse²:
$$x^2 + 100^2 = L^2$$

This is the constraint. Differentiating it converts it from a position equation into a rate equation.`,
        },
        {
          expression: "\\frac{d}{dt}[x^2 + 100^2] = \\frac{d}{dt}[L^2]",
          annotation: "Differentiate both sides with respect to $t$.",
          prereq: `**Why can we differentiate both sides of an equation?**

If $A(t) = B(t)$ for all $t$, then both sides must be changing at the same rate — otherwise they would stop being equal.

So: $\\dfrac{dA}{dt} = \\dfrac{dB}{dt}$.

We differentiate both sides of $x^2 + 100^2 = L^2$ with respect to $t$:
$$\\frac{d}{dt}[x^2 + 100^2] = \\frac{d}{dt}[L^2]$$

This is always legal when both sides are equal. It turns the static constraint into a live equation between rates.`,
        },
        {
          expression: "2x\\,\\frac{dx}{dt} + 0 = 2L\\,\\frac{dL}{dt}",
          annotation: "Each variable picks up a rate factor via the chain rule. The constant $100^2$ differentiates to zero.",
          prereq: `**How to differentiate $x^2$ with respect to $t$ — why the answer is NOT just $2x$:**

This is the most common stumbling point.

$x$ is a function of $t$. The **chain rule** says: $\\dfrac{d}{dt}[f(x(t))] = f'(x) \\cdot \\dfrac{dx}{dt}$

Here $f(x) = x^2$, so $f'(x) = 2x$. Multiply by $\\dfrac{dx}{dt}$:
$$\\frac{d}{dt}[x^2] = 2x \\cdot \\frac{dx}{dt}$$

**Same for $L^2$:**
$$\\frac{d}{dt}[L^2] = 2L \\cdot \\frac{dL}{dt}$$

**What about $100^2$?** It equals 10000 — a constant. Constants never change:
$$\\frac{d}{dt}[10000] = 0$$

**The pattern:** every variable produces a rate factor $\\dfrac{d(\\cdot)}{dt}$. Every constant produces zero.`,
        },
        {
          expression: "x\\,\\frac{dx}{dt} = L\\,\\frac{dL}{dt}",
          annotation: "Divide both sides by 2. Optional cleanup — makes the next substitution slightly less cluttered.",
          prereq: `**Dividing both sides of an equation by the same number:**

If $2A = 2B$, then $A = B$.

Starting from $2x\\,\\dfrac{dx}{dt} = 2L\\,\\dfrac{dL}{dt}$, divide every term by 2:
$$x\\,\\frac{dx}{dt} = L\\,\\frac{dL}{dt}$$

Nothing changed mathematically. This is the rate equation we substitute known values into.`,
        },
        {
          expression: "x = \\sqrt{L^2 - 100^2}",
          annotation: "We need the value of $x$ at the moment $L = 200$. Solve the constraint for $x$.",
          prereq: `**Why do we need to find $x$ separately?**

The rate equation is $x\\,\\dfrac{dx}{dt} = L\\,\\dfrac{dL}{dt}$.

To solve for $\\dfrac{dx}{dt}$ we must know the current value of $x$. We were not given $x$ — so we find it from the original constraint at the instant $L = 200$.

Solve $x^2 + 100^2 = L^2$ for $x$:
$$x^2 = L^2 - 100^2 \\implies x = \\sqrt{L^2 - 100^2}$$

Positive root because $x$ is a distance.`,
        },
        {
          expression: "x = \\sqrt{200^2 - 100^2} = \\sqrt{40000 - 10000} = \\sqrt{30000}",
          annotation: "Substitute $L = 200$, compute $200^2 = 40000$ and $100^2 = 10000$, subtract.",
          prereq: `**Computing $200^2$ and $100^2$:**

$200^2 = 200 \\times 200 = 40{,}000$

$100^2 = 100 \\times 100 = 10{,}000$

$40{,}000 - 10{,}000 = 30{,}000$

So $x = \\sqrt{30{,}000}$. Next: simplify the square root.`,
        },
        {
          expression: "x = \\sqrt{10000 \\cdot 3} = 100\\sqrt{3} \\approx 173.2 \\text{ m}",
          annotation: "Factor $30000 = 10000 \\times 3$, then pull out $\\sqrt{10000} = 100$.",
          prereq: `**How to simplify a square root by factoring:**

Rule: $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ when $a, b \\geq 0$.

Find the largest perfect square dividing 30000:
$$30000 = 10000 \\times 3 \\qquad \\sqrt{10000} = 100$$

So:
$$\\sqrt{30000} = 100\\sqrt{3} \\approx 173.2 \\text{ m}$$

**Why keep the exact form $100\\sqrt{3}$?** Decimals introduce rounding error. The exact form carries cleanly into the next calculation.`,
        },
        {
          expression: "(100\\sqrt{3})\\,\\frac{dx}{dt} = (200)(5)",
          annotation: "Substitute all known values into $x\\,\\frac{dx}{dt} = L\\,\\frac{dL}{dt}$.",
          prereq: `**What goes where — the substitution table:**

| Variable | Value | Source |
|---|---|---|
| $x$ | $100\\sqrt{3}$ | just computed |
| $L$ | $200$ m | given |
| $\\dfrac{dL}{dt}$ | $5$ m/s | given |
| $\\dfrac{dx}{dt}$ | **unknown** | solve for this |

Substitute into $x\\,\\dfrac{dx}{dt} = L\\,\\dfrac{dL}{dt}$:
$$(100\\sqrt{3}) \\cdot \\frac{dx}{dt} = (200)(5)$$

Right side is all numbers. Left side has the unknown.`,
        },
        {
          expression: "\\frac{dx}{dt} = \\frac{1000}{100\\sqrt{3}} = \\frac{10}{\\sqrt{3}}",
          annotation: "Right side: $200 \\times 5 = 1000$. Divide both sides by $100\\sqrt{3}$ to isolate $\\frac{dx}{dt}$.",
          prereq: `**Isolating the unknown by dividing:**

$(100\\sqrt{3}) \\cdot \\dfrac{dx}{dt} = 1000$

Divide both sides by $100\\sqrt{3}$:
$$\\frac{dx}{dt} = \\frac{1000}{100\\sqrt{3}} = \\frac{10}{\\sqrt{3}}$$

$\\dfrac{1000}{100} = 10$ — the 100s cancel. The $\\sqrt{3}$ stays for now.`,
        },
        {
          expression: "\\frac{dx}{dt} = \\frac{10}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{10\\sqrt{3}}{3} \\approx 5.77 \\text{ m/s}",
          annotation: "Rationalize the denominator by multiplying by $\\frac{\\sqrt{3}}{\\sqrt{3}} = 1$.",
          prereq: `**How to rationalize a denominator:**

$\\dfrac{10}{\\sqrt{3}}$ has a square root in the denominator. Multiply top and bottom by $\\sqrt{3}$ (= multiplying by 1, so the value is unchanged):

$$\\frac{10}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{10\\sqrt{3}}{3}$$

**Why $\\sqrt{3} \\cdot \\sqrt{3} = 3$?** Because $\\sqrt{a} \\cdot \\sqrt{a} = a$.

Decimal: $\\dfrac{10\\sqrt{3}}{3} \\approx \\dfrac{17.32}{3} \\approx 5.77$ m/s.`,
        },
      ],
      answer:
        "\\dfrac{dx}{dt} = \\dfrac{10\\sqrt{3}}{3} \\approx 5.77 \\text{ m/s}",
    },
    {
      id: "ch3-000-ch2",
      difficulty: "medium",
      problem:
        "Gravel is dumped onto a conical pile at 30 ft³/min. The cone always satisfies h = 2r (height equals twice the base radius). Find dh/dt when h = 10 ft.",
      hint: "Write V in terms of h alone using r = h/2. Then differentiate.",
      walkthrough: [
        {
          expression:
            "\\text{Definition: Volume of a cone is } V = \\frac{1}{3} \\pi r^2 h",
          annotation:
            "This is the standard formula. Here both r and h change with time, but they are related by the fixed ratio h = 2r.",
        },
        {
          expression:
            "\\text{Given relation: } h = 2r \\implies r = \\frac{h}{2}",
          annotation:
            "The pile maintains a constant shape (similar cones). We want dh/dt, so eliminate r in favor of h.",
        },
        {
          expression:
            "\\text{Substitute into volume: } V = \\frac{1}{3} \\pi \\left(\\frac{h}{2}\\right)^2 h = \\frac{1}{3} \\pi \\cdot \\frac{h^2}{4} \\cdot h = \\frac{\\pi h^3}{12}",
          annotation:
            "Careful algebra: (h/2)² = h²/4, then times h = h³/4, then 1/3 π gives π h³ / 12. Now V depends only on h.",
        },
        {
          expression:
            "\\text{Differentiate both sides with respect to t: } \\frac{dV}{dt} = \\frac{d}{dt} \\left( \\frac{\\pi}{12} h^3 \\right)",
          annotation: "Chain rule will appear because h = h(t).",
        },
        {
          expression:
            "\\frac{dV}{dt} = \\frac{\\pi}{12} \\cdot 3 h^2 \\cdot \\frac{dh}{dt} = \\frac{\\pi h^2}{4} \\cdot \\frac{dh}{dt}",
          annotation:
            "Power rule on h³ gives 3h², then multiply by π/12 and dh/dt. Simplified coefficient: 3π/12 = π/4.",
        },
        {
          expression:
            "\\text{We know } \\frac{dV}{dt} = 30 \\text{ ft³/min (gravel added at constant rate)}",
          annotation: "Positive because volume is increasing.",
        },
        {
          expression: "30 = \\frac{\\pi (10)^2}{4} \\cdot \\frac{dh}{dt}",
          annotation: "Plug in h = 10 ft at the moment of interest.",
        },
        {
          expression:
            "30 = \\frac{\\pi \\cdot 100}{4} \\cdot \\frac{dh}{dt} = 25\\pi \\cdot \\frac{dh}{dt}",
          annotation: "100/4 = 25, times π.",
        },
        {
          expression:
            "\\frac{dh}{dt} = \\frac{30}{25\\pi} = \\frac{6}{5\\pi} \\text{ ft/min}",
          annotation:
            "Simplify fraction: divide numerator and denominator by 5. Approximate ≈ 0.382 ft/min. The height rises slowly because the pile is getting wider as it grows.",
        },
        {
          expression:
            "\\text{Aha insight: Even though volume increases at constant rate, dh/dt decreases as h grows because the cone is spreading out — more volume is needed to raise the height the same amount later.}",
          annotation: "This is why the rate is smaller at larger heights.",
        },
      ],
      answer:
        "\\dfrac{dh}{dt} = \\dfrac{6}{5\\pi} \\approx 0.382 \\text{ ft/min}",
    },
    {
      id: "ch3-000-ch3",
      difficulty: "medium",
      problem:
        "A boat is pulled toward a dock by a rope passing over a pulley 12 ft above the water. The rope is pulled in at 3 ft/s. How fast is the boat moving toward the dock when 15 ft of rope extends from the pulley?",
      hint: "Let x = horizontal distance of boat from the dock, L = length of rope from pulley to boat. These satisfy x² + 12² = L². Differentiate. Note: the boat moves horizontally, not along the rope.",
      walkthrough: [
        {
          expression:
            "\\text{Setup: The pulley is 12 ft above the water (fixed vertical distance).}",
          annotation:
            "The rope goes from boat to pulley (length L), then presumably to the person pulling. We care about the segment from pulley to boat.",
        },
        {
          expression:
            "\\text{Pythagorean relation: } x^2 + 12^2 = L^2 \\quad \\text{or} \\quad x^2 + 144 = L^2",
          annotation:
            "x is the horizontal distance from the point directly below the pulley to the boat. L is the slant length of the rope.",
        },
        {
          expression:
            "\\text{Differentiate with respect to t: } 2x \\frac{dx}{dt} + 0 = 2L \\frac{dL}{dt}",
          annotation: "Chain rule again. Constant 144 drops out.",
        },
        {
          expression: "\\text{Simplify: } x \\frac{dx}{dt} = L \\frac{dL}{dt}",
          annotation: "Divided by 2 for cleanliness.",
        },
        {
          expression: "\\text{At the instant of interest: L = 15 ft}",
          annotation: "Given directly.",
        },
        {
          expression:
            "x = \\sqrt{L^2 - 144} = \\sqrt{225 - 144} = \\sqrt{81} = 9 \\text{ ft}",
          annotation: "Positive root because distance.",
        },
        {
          expression:
            "\\text{Rate at which rope is pulled: } \\frac{dL}{dt} = -3 \\text{ ft/s}",
          annotation:
            "Important: pulled in means the length L is decreasing, so negative sign. This is a common source of sign errors in related rates.",
        },
        {
          expression:
            "\\text{Substitute into the rate equation: } 9 \\cdot \\frac{dx}{dt} = 15 \\cdot (-3)",
          annotation: "x = 9, L = 15, dL/dt = -3.",
        },
        {
          expression:
            "9 \\frac{dx}{dt} = -45 \\implies \\frac{dx}{dt} = -5 \\text{ ft/s}",
          annotation:
            "Solve for dx/dt. The negative sign means x is decreasing — the boat is moving toward the dock.",
        },
        {
          expression:
            "\\text{Interpretation: The boat approaches the dock at 5 ft/s (speed is the absolute value).}",
          annotation:
            "The question asks 'how fast is the boat moving toward the dock' — so we report the positive speed 5 ft/s, but the signed rate is -5 ft/s.",
        },
        {
          expression:
            "\\text{Aha insight: When the rope is steeper (smaller x), pulling the rope moves the boat faster horizontally. Here at L=15, x=9, the boat moves faster (5 ft/s) than the rope is pulled (3 ft/s).}",
          annotation:
            "The angle converts the rope speed into a larger horizontal component.",
        },
      ],
      answer: "\\text{The boat approaches the dock at } 5 \\text{ ft/s.}",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "implicit-differentiation",
      label: "Implicit Differentiation",
      context:
        "Related rates is implicit differentiation with t as the independent variable. Review Chapter 2's implicit differentiation lesson.",
    },
    {
      lessonSlug: "chain-rule",
      label: "The Chain Rule",
      context:
        "Every related rates calculation applies the chain rule. The chain rule is the mathematical engine behind d/dt[f(x(t))] = f'(x)·(dx/dt).",
    },
    {
      lessonSlug: "optimization",
      label: "Optimization",
      context:
        "Optimization also requires setting up geometric equations and using calculus to extract information. The modeling skills are closely related.",
    },
  ],

  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "dx/dt",
        meaning:
          "rate of change of x with respect to time — how fast x is changing right now",
      },
      {
        symbol: "d/dt[x²]",
        meaning:
          "2x·(dx/dt), NOT just 2x — the chain rule factor dx/dt is mandatory",
      },
      {
        symbol: "geometric constraint",
        meaning:
          "an equation that links the changing quantities — e.g., x²+y²=L² for a right triangle with fixed hypotenuse",
      },
    ],
    rulesOfThumb: [
      "NEVER substitute numbers before differentiating. Differentiate with variables, then substitute.",
      "Identify which quantities are constant (they disappear when differentiated) and which vary (they generate rate terms).",
      "The 5-step method: diagram → constraint equation → differentiate → substitute → solve.",
      "Draw the diagram. Most setup errors are geometry errors, not calculus errors.",
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        label: "Implicit Differentiation (Ch. 2)",
        note: "Related rates IS implicit differentiation with time as the variable — every variable in your equation is a function of t",
      },
      {
        label: "Chain Rule (Ch. 2)",
        note: "d/dt[f(x(t))] = f'(x)·(dx/dt) — the chain rule is why every term picks up a (d/dt) factor",
      },
      {
        label: "Pythagorean Theorem / Geometry",
        note: "Most related-rates diagrams produce geometric constraints (x² + y² = L², similar triangles, volume = (1/3)πr²h) — draw first, always",
      },
    ],
    futureLinks: [
      {
        label: "Optimization (Lesson 6)",
        note: "Optimization asks: at what INSTANT is the rate zero? Related rates asks: what IS the rate at a given instant? Same tools, different question",
      },
      {
        label: "Parametric Equations (Ch. 6)",
        note: "In parametric curves, x(t) and y(t) are exactly the time-dependent quantities of related rates — dy/dx = (dy/dt)/(dx/dt)",
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "rr-assess-1",
        type: "choice",
        text: "In related rates, d/dt[r²] equals:",
        options: ["2r", "2r·(dr/dt)", "2r + dr/dt", "r²·(dr/dt)"],
        answer: "2r·(dr/dt)",
        hint: "Chain rule: outer derivative 2r, multiplied by the inner derivative dr/dt.",
      },
      {
        id: "rr-assess-2",
        type: "choice",
        text: "When should you substitute the specific numerical values into a related rates equation?",
        options: [
          "Before differentiating",
          "After differentiating and collecting rates",
          "At any point — order doesn't matter",
          "Never",
        ],
        answer: "After differentiating and collecting rates",
        hint: "Substituting before differentiating replaces variables with constants, destroying all rate information. Always differentiate first.",
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "d/dt[f(x(t))] = f'(x)·(dx/dt) (chain rule in t)",
    "5 steps: diagram → constraint → differentiate → substitute → solve",
    "Constant quantities vanish; variable quantities generate rate factors",
    "Substitute numbers AFTER differentiating — never before",
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "completed-example-4",
    "completed-example-5",
    "completed-example-6",
    "completed-example-7",
    "attempted-challenge-hard",
    "attempted-challenge-medium-1",
    "attempted-challenge-medium-2",
  ],

  quiz: [
    {
      id: "rr-q1",
      type: "input",
      text: "A spherical balloon is being inflated. Its volume is $V = \\frac{4}{3}\\pi r^3$. Differentiate both sides with respect to time $t$ to find $\\frac{dV}{dt}$ in terms of $r$ and $\\frac{dr}{dt}$. If $r = 5$ cm and $\\frac{dr}{dt} = 2$ cm/s, what is $\\frac{dV}{dt}$ (in cm³/s)? Enter a number.",
      answer: "200*pi",
      hints: [
        "Differentiate $V = \\frac{4}{3}\\pi r^3$ w.r.t. $t$ using the chain rule: $\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}$.",
        "Substitute $r = 5$ and $\\frac{dr}{dt} = 2$: $4\\pi(25)(2) = 200\\pi$.",
      ],
      reviewSection: "Intuition — Setting up the rate equation",
    },
    {
      id: "rr-q2",
      type: "choice",
      text: "In a related rates problem, when must you substitute known numerical values for position (e.g. $x = 6$)?",
      options: [
        "Before differentiating, to simplify the equation",
        "After differentiating, into the rate equation",
        "It does not matter — substituting before or after gives the same result",
        "You never substitute; you always keep everything symbolic",
      ],
      answer: "After differentiating, into the rate equation",
      hints: [
        "Substituting a position value before differentiating turns a variable into a constant, destroying its rate $dx/dt$.",
      ],
      reviewSection: "Intuition — Do NOT substitute before differentiating",
    },
    {
      id: "rr-q3",
      type: "input",
      text: "A 10-ft ladder leans against a wall. Its base slides away at $\\frac{dx}{dt} = 2$ ft/s. The constraint is $x^2 + y^2 = 100$. Differentiating w.r.t. $t$: $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$. At the instant $x = 6$ ft, what is $y$ (in ft)?",
      answer: "8",
      hints: [
        "Use $x^2 + y^2 = 100$ with $x = 6$: $36 + y^2 = 100$, so $y^2 = 64$.",
      ],
      reviewSection: "Intuition — The sliding ladder geometry",
    },
    {
      id: "rr-q4",
      type: "input",
      text: "Continuing the ladder problem: $x = 6$ ft, $y = 8$ ft, $\\frac{dx}{dt} = 2$ ft/s. Using $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$, find $\\frac{dy}{dt}$ (in ft/s). Enter a signed number (negative = sliding down).",
      answer: "-3/2",
      hints: [
        "Solve for $\\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt} = -\\frac{6}{8}\\cdot 2 = -\\frac{3}{2}$.",
      ],
      reviewSection: "Intuition — The sliding ladder geometry",
    },
    {
      id: "rr-q5",
      type: "input",
      text: "Water drains from a conical tank (apex down) of fixed proportions so that $V = \\frac{\\pi}{3}h^3$ (already simplified using similar triangles). If $\\frac{dV}{dt} = -2\\pi$ m³/min, find $\\frac{dh}{dt}$ when $h = 3$ m. Enter the value in m/min.",
      answer: "-2/9",
      hints: [
        "Differentiate $V = \\frac{\\pi}{3}h^3$ w.r.t. $t$: $\\frac{dV}{dt} = \\pi h^2 \\frac{dh}{dt}$.",
        "Substitute: $-2\\pi = \\pi(9)\\frac{dh}{dt}$, so $\\frac{dh}{dt} = -\\frac{2}{9}$.",
      ],
      reviewSection: "Examples — Conical tank",
    },
    {
      id: "rr-q6",
      type: "choice",
      text: "Related rates problems use implicit differentiation with respect to which variable?",
      options: ["$x$", "$y$", "$t$ (time)", "$r$ (radius)"],
      answer: "$t$ (time)",
      hints: [
        "All quantities in a related rates problem are functions of time $t$, so you differentiate the geometric equation w.r.t. $t$.",
      ],
      reviewSection:
        "Intuition — Related rates is implicit differentiation in $t$",
    },
    {
      id: "rr-q7",
      type: "input",
      text: "Two cars start at the same intersection. Car A travels east at 60 mph; Car B travels north at 80 mph. Let $z$ be the distance between them. The constraint is $z^2 = x^2 + y^2$. After 1 hour, $x = 60$, $y = 80$, $z = 100$. Find $\\frac{dz}{dt}$ (mph) at that moment.",
      answer: "100",
      hints: [
        "Differentiate: $2z\\frac{dz}{dt} = 2x\\frac{dx}{dt} + 2y\\frac{dy}{dt}$.",
        "$\\frac{dz}{dt} = \\frac{60\\cdot60 + 80\\cdot80}{100} = \\frac{3600+6400}{100} = 100$.",
      ],
      reviewSection: "Examples — Two moving vehicles",
    },
    {
      id: "rr-q8",
      type: "input",
      text: "A streetlight is 15 ft high. A 6-ft-tall person walks away from the base at 4 ft/s. Let $s$ be the length of the shadow. By similar triangles, $\\frac{15}{6} = \\frac{x+s}{s}$, giving $s = \\frac{6}{9}x = \\frac{2}{3}x$. Find $\\frac{ds}{dt}$ (ft/s).",
      answer: "8/3",
      hints: [
        "Differentiate $s = \\frac{2}{3}x$ w.r.t. $t$: $\\frac{ds}{dt} = \\frac{2}{3}\\frac{dx}{dt} = \\frac{2}{3}(4) = \\frac{8}{3}$.",
      ],
      reviewSection: "Examples — Shadow problem",
    },
    {
      id: "rr-q9",
      type: "choice",
      text: "For the ladder problem, as $y \\to 0$ (the top nears the ground), what happens to $|dy/dt|$?",
      options: [
        "It approaches 0 — the top slows down",
        "It stays constant",
        "It grows without bound — the top falls faster and faster",
        "It equals $dx/dt$ exactly",
      ],
      answer: "It grows without bound — the top falls faster and faster",
      hints: [
        "$\\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt}$. As $y \\to 0$ with $x \\to L$, the ratio $x/y \\to \\infty$.",
      ],
      reviewSection: "Intuition — The sliding ladder geometry",
    },
    {
      id: "rr-q10",
      type: "input",
      text: "A point moves along the curve $y = x^2$. If $\\frac{dx}{dt} = 3$ units/s when $x = 2$, find $\\frac{dy}{dt}$ at that instant.",
      answer: "12",
      hints: [
        "Differentiate $y = x^2$ w.r.t. $t$: $\\frac{dy}{dt} = 2x\\frac{dx}{dt}$.",
        "At $x = 2$: $\\frac{dy}{dt} = 2(2)(3) = 12$.",
      ],
      reviewSection: "Examples — Point on a curve",
    },
  ],
};
