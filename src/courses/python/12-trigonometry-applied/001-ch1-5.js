// Chapter 1.5 — Trigonometry Applied
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   1.  The unit circle — angles, coordinates, and where sin/cos come from
//   2.  Radians vs degrees — why radians are the natural unit
//   3.  The six trig functions — sin, cos, tan and their reciprocals
//   4.  Key values — 0, π/6, π/4, π/3, π/2 and symmetry
//   5.  Plotting sin and cos — amplitude, period, phase
//   6.  Transformations — A·sin(Bx + C) + D
//   7.  The Pythagorean identity — sin²(x) + cos²(x) = 1
//   8.  opencalc: fig.point() in polar style — unit circle diagram
//   9.  Inverse trig — arcsin, arccos, arctan and their ranges
//  10.  Solving trig equations — general solutions and principal values
//  11.  Real-world modelling — periodic data (temperature, sound, tides)
//  12.  Fitting a sinusoid to data — amplitude and period from data
//  13.  Fourier decomposition preview — sum of sines
//  14.  Lissajous figures — parametric trig curves

export default {
  id: 'py-1-5-trigonometry-applied',
  slug: 'trigonometry-applied',
  chapter: 1.5,
  order: 4,
  title: 'Trigonometry Applied',
  subtitle: 'Angles, oscillations, and the mathematics of anything that repeats',
  tags: ['sin', 'cos', 'tan', 'unit circle', 'radians', 'amplitude', 'period', 'phase', 'inverse trig', 'Fourier', 'parametric', 'opencalc'],

  hook: {
    question: 'Sound, light, tides, AC electricity, and the weights inside every neural network that processes audio — what do they all have in common?',
    realWorldContext:
      'Trigonometric functions describe everything that oscillates or rotates. ' +
      'Sound is a pressure wave modelled by A·sin(2πft + φ). ' +
      'AC electricity is V(t) = 170·sin(2π·60·t) in North America. ' +
      'A GPS receiver uses trig to triangulate position from satellite distances. ' +
      'Fourier analysis — the mathematical backbone of JPEG compression, audio codecs, and MRI imaging — ' +
      'decomposes any periodic signal into a sum of sines and cosines. ' +
      'This lesson builds the trig foundation you need before any of that.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Sine and cosine are not just ratios in a right triangle — they are the ' +
      '**x and y coordinates of a point moving around the unit circle**. ' +
      'As the angle θ increases from 0 to 2π, cos(θ) traces the horizontal position ' +
      'and sin(θ) traces the vertical position. ' +
      'That circular motion, when "unwrapped" onto a flat graph, produces the familiar wave.',
      'Every periodic phenomenon in nature is built from these two waves. ' +
      'The period — how long one cycle takes — and the amplitude — how high the wave reaches — ' +
      'are the two numbers that characterise any oscillation.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'General sinusoidal model',
        body: 'f(x) = A \\cdot \\sin(Bx + C) + D \\quad \\text{where } A=\\text{amplitude},\\; \\frac{2\\pi}{B}=\\text{period},\\; C=\\text{phase shift},\\; D=\\text{vertical shift}',
      },
      {
        type: 'insight',
        title: 'Unit circle definition',
        body: 'For angle θ measured from the positive x-axis: cos(θ) = x-coordinate, sin(θ) = y-coordinate of the point on the unit circle. This works for ALL angles — not just those in a right triangle.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Trigonometry Applied',
        mathBridge: 'sin²(θ) + cos²(θ) = 1. Period = 2π/B. Amplitude = |A|. Every periodic signal decomposes into sines and cosines.',
        caption: 'Work through every cell. The final cells produce a Fourier decomposition and parametric Lissajous figures.',
        props: {
          initialCells: [

            // ── UNIT CIRCLE ───────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The unit circle — where sin and cos come from',
              prose: [
                'The **unit circle** is a circle of radius 1 centred at the origin. For any angle θ (measured counter-clockwise from the positive x-axis), the point on the circle is **(cos θ, sin θ)**. This is the geometric definition of sine and cosine — more fundamental than the right-triangle ratio definition because it works for all angles, not just those between 0° and 90°.',
                '## Why radians?',
                '- **1 radian** = the angle that subtends an arc of length 1 on a unit circle\n- A full circle = **2π radians** = 360°\n- Conversion: `radians = degrees × π / 180`\n- Radians are dimensionless — they make calculus formulas clean (d/dx sin x = cos x, only in radians)\n- Python\'s math module always expects **radians**',
                '## Key angle coordinates',
                '- θ = 0 → (1, 0): cos 0 = 1, sin 0 = 0\n- θ = π/2 → (0, 1): cos π/2 = 0, sin π/2 = 1\n- θ = π → (−1, 0): cos π = −1, sin π = 0\n- θ = 3π/2 → (0, −1): cos 3π/2 = 0, sin 3π/2 = −1',
              ],
              code: `import math

# Degrees to radians — and verifying key values
def deg(angle_degrees):
    return angle_degrees * math.pi / 180

key_angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360]

print(f"{'Degrees':>8}  {'Radians':>8}  {'cos':>8}  {'sin':>8}  {'tan':>10}")
print("-" * 52)
for d in key_angles:
    r = deg(d)
    c = math.cos(r)
    s = math.sin(r)
    try:
        t = math.tan(r)
        t_str = f"{t:>10.4f}"
    except:
        t_str = "  undefined"
    print(f"{d:>8}°  {r:>8.4f}  {c:>8.4f}  {s:>8.4f}  {t_str}")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 2,
              cellTitle: 'Visualizing the unit circle',
              prose: [
                'The unit circle diagram makes the sign of sin and cos immediately readable: in quadrant I both are positive; in quadrant II cos is negative but sin is positive; in quadrant III both are negative; in quadrant IV cos is positive but sin is negative. The quadrant determines the sign; the angle determines the magnitude.',
                '**Library technique:** We use `fig.point()` and `fig.line()` to build the diagram manually — marking key angles, drawing radius lines, and labelling the (cos θ, sin θ) coordinates. `square=True` on the Figure ensures the circle looks round (equal x/y scaling).',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GREEN, GRAY, PURPLE

fig = Figure(xmin=-1.5, xmax=1.5, ymin=-1.5, ymax=1.5,
             title="Unit Circle — (cos θ, sin θ)", square=True)
fig.grid().axes()

# Draw the unit circle using fig.plot() with parametric trick:
# plot cos as a function of angle, but we need (x,y) pairs
# Instead: draw many points forming the circle
import math
N = 200
circle_xs = [math.cos(2 * math.pi * i / N) for i in range(N + 1)]
circle_ys = [math.sin(2 * math.pi * i / N) for i in range(N + 1)]

# Plot circle outline as a parametric curve via scatter with tiny dots
for i in range(0, N + 1, 2):
    fig.point([circle_xs[i], circle_ys[i]], color=GRAY, radius=1)

# Key angles — mark the point, radius, and coordinates
key = [0, math.pi/6, math.pi/4, math.pi/3, math.pi/2,
       math.pi, 3*math.pi/2]
colors = [RED, BLUE, GREEN, AMBER, PURPLE, RED, BLUE]
labels_deg = ["0°", "30°", "45°", "60°", "90°", "180°", "270°"]

for theta, color, lbl in zip(key, colors, labels_deg):
    cx, cy = math.cos(theta), math.sin(theta)
    fig.line([0, 0], [cx, cy], color=color, width=1.5)
    fig.point([cx, cy], color=color, radius=6,
              label=f"{lbl}: ({cx:.2f},{cy:.2f})")

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SIN AND COS WAVES ─────────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Plotting sin and cos — the wave view',
              prose: [
                'When you "unroll" the unit circle by plotting the y-coordinate (sin θ) or x-coordinate (cos θ) against the angle θ, you get the familiar wave shapes. Both waves have the same shape — cos is just sin shifted left by π/2.',
                '## Wave properties',
                '- **Period:** 2π — one complete oscillation every 2π radians\n- **Amplitude:** 1 — the wave reaches from −1 to +1\n- **cos(0) = 1** — starts at maximum\n- **sin(0) = 0** — starts at zero, rises first\n- **Phase difference:** cos(x) = sin(x + π/2) — cos leads sin by a quarter cycle',
                '**Library:** Passing `math.sin` and `math.cos` directly to `fig.plot()` — no lambda needed, built-in functions work as callables.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

fig = Figure(xmin=-0.5, xmax=7, ymin=-1.5, ymax=1.5,
             title="sin(x) and cos(x) — one full cycle (0 to 2π)")
fig.grid().axes()

fig.plot(math.sin, color=BLUE, label='sin(x)', width=3)
fig.plot(math.cos, color=RED,  label='cos(x)', width=3)

# Mark the period
fig.vline(2 * math.pi, color=GRAY)
fig.text([6.4, 1.3], "2π", color='gray', size=12, bold=True)

# Mark key values
fig.point([0,               0], color=BLUE, radius=6, label='sin(0)=0')
fig.point([math.pi/2,       1], color=BLUE, radius=6, label='sin(π/2)=1')
fig.point([math.pi,         0], color=BLUE, radius=6, label='sin(π)=0')
fig.point([0,               1], color=RED,  radius=6, label='cos(0)=1')
fig.point([math.pi/2,       0], color=RED,  radius=6, label='cos(π/2)=0')

# The quarter-cycle shift
fig.arrow([math.pi/2, -1.3], [0, -1.3], color=AMBER, width=2,
          label='cos leads sin by π/2')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 4,
              cellTitle: 'The six trig functions',
              prose: [
                'Sine and cosine are the primary functions. The other four are defined in terms of them.',
                '## The six functions',
                '- **sin(θ)** = y/r = opposite/hypotenuse\n- **cos(θ)** = x/r = adjacent/hypotenuse\n- **tan(θ)** = sin(θ)/cos(θ) = y/x — undefined when cos(θ) = 0 (vertical asymptotes at π/2, 3π/2, …)\n- **csc(θ)** = 1/sin(θ) — undefined when sin(θ) = 0\n- **sec(θ)** = 1/cos(θ) — undefined when cos(θ) = 0\n- **cot(θ)** = cos(θ)/sin(θ) = 1/tan(θ)',
                '## In practice',
                'You will mostly use sin, cos, and tan. Python\'s `math` module only has those three (plus their inverses). The reciprocals — csc, sec, cot — are computed by hand as `1/math.sin(x)` etc. In physics: tan gives the slope angle; in navigation: atan2 gives the bearing.',
              ],
              code: `import math

# Define all six
def trig_all(theta):
    s = math.sin(theta)
    c = math.cos(theta)
    t = s / c if abs(c) > 1e-12 else float('inf')
    csc = 1/s  if abs(s) > 1e-12 else float('inf')
    sec = 1/c  if abs(c) > 1e-12 else float('inf')
    cot = c/s  if abs(s) > 1e-12 else float('inf')
    return s, c, t, csc, sec, cot

print(f"{'θ (deg)':>8}  {'sin':>7}  {'cos':>7}  {'tan':>9}  {'csc':>7}  {'sec':>7}  {'cot':>9}")
print("-" * 65)
for deg in [30, 45, 60, 90, 180]:
    rad = math.radians(deg)
    s, c, t, csc, sec, cot = trig_all(rad)
    def fmt(v):
        return f"{'∞':>7}" if v == float('inf') else f"{v:>7.4f}"
    print(f"{deg:>8}°  {fmt(s)}  {fmt(c)}  {fmt(t):>9}  {fmt(csc)}  {fmt(sec)}  {fmt(cot):>9}")

from opencalc import Figure, BLUE, RED, GREEN, GRAY
fig = Figure(xmin=-0.5, xmax=7, ymin=-4, ymax=4,
             title="sin, cos, tan — note the asymptotes of tan")
fig.grid().axes()
fig.plot(math.sin, color=BLUE, label='sin(x)', width=2)
fig.plot(math.cos, color=RED,  label='cos(x)', width=2)
fig.plot(lambda x: math.tan(x) if abs(math.cos(x)) > 0.05 else None,
         color=GREEN, label='tan(x)', width=2)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── TRANSFORMATIONS ───────────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Transformations — A·sin(Bx + C) + D',
              prose: [
                'The general sinusoidal model **A·sin(Bx + C) + D** lets you tune four independent properties of the wave. Understanding each parameter independently is the key to reading and writing trig models.',
                '## The four parameters',
                '- **A — amplitude:** half the peak-to-trough distance; |A| stretches the wave vertically; negative A flips it\n- **B — angular frequency:** controls the period; **period = 2π/B** — larger B means more cycles per unit x\n- **C — phase shift:** shifts the wave horizontally by **−C/B** units (positive C shifts left)\n- **D — vertical shift:** lifts the midline from y=0 to y=D',
                '## Reading a real signal',
                'Given a wave that oscillates between 3 and 11 with period 4: A = (11−3)/2 = 4, D = (11+3)/2 = 7, B = 2π/4 = π/2. The model is f(x) = 4·sin(πx/2) + 7.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, GRAY, PURPLE

base = lambda x: math.sin(x)

fig = Figure(xmin=0, xmax=7, ymin=-4, ymax=6,
             title="Transformations of sin(x)")
fig.grid().axes()

fig.plot(base,                                    color=GRAY,   label='sin(x) — base',        width=1.5)
fig.plot(lambda x: 2 * math.sin(x),              color=BLUE,   label='2·sin(x) — A×2',       width=2)
fig.plot(lambda x: math.sin(2 * x),              color=RED,    label='sin(2x) — period π',    width=2)
fig.plot(lambda x: math.sin(x - math.pi/4),      color=GREEN,  label='sin(x−π/4) — shift →',  width=2)
fig.plot(lambda x: math.sin(x) + 2,              color=AMBER,  label='sin(x)+2 — shift ↑',    width=2)
fig.plot(lambda x: 1.5*math.sin(2*x - 1) + 1,   color=PURPLE, label='1.5·sin(2x−1)+1',       width=2)

# Mark periods
fig.vline(math.pi, color='gray')
fig.text([math.pi + 0.1, 3.5], "π", color='gray', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 6,
              cellTitle: 'The Pythagorean identity',
              prose: [
                'The most important trig identity: **sin²(θ) + cos²(θ) = 1 for all θ**. It follows directly from the unit circle — (cos θ, sin θ) is always on the circle x² + y² = 1, so by substitution you get the identity immediately. Every other trig identity can be derived from this one.',
                '## Derived identities',
                '- Divide by cos²: **tan²(θ) + 1 = sec²(θ)**\n- Divide by sin²: **1 + cot²(θ) = csc²(θ)**\n- Double angle: **sin(2θ) = 2·sin(θ)·cos(θ)**\n- Double angle: **cos(2θ) = cos²(θ) − sin²(θ) = 1 − 2sin²(θ) = 2cos²(θ) − 1**',
                '**Python pattern:** Verify identities numerically by checking them at many random angles with `math.isclose()`. If they hold at 10,000 random angles to 12 decimal places, you can be confident they are true (this is a numerical sanity check, not a proof).',
              ],
              code: `import math, random

random.seed(1)

# Verify sin²(θ) + cos²(θ) = 1 at 10000 random angles
angles = [random.uniform(-10 * math.pi, 10 * math.pi) for _ in range(10000)]
identity_holds = all(
    math.isclose(math.sin(t)**2 + math.cos(t)**2, 1.0, abs_tol=1e-12)
    for t in angles
)
print(f"sin²(θ) + cos²(θ) = 1  holds at 10,000 angles: {identity_holds}")

# Double angle identity: sin(2θ) = 2·sin(θ)·cos(θ)
double_angle_holds = all(
    math.isclose(math.sin(2*t), 2*math.sin(t)*math.cos(t), abs_tol=1e-12)
    for t in angles
)
print(f"sin(2θ) = 2·sin(θ)·cos(θ)  holds: {double_angle_holds}")

# Visualize: sin²(x) + cos²(x) should be the constant 1
from opencalc import Figure, BLUE, RED, AMBER, GRAY
fig = Figure(xmin=0, xmax=7, ymin=-0.1, ymax=1.5,
             title="sin²(x) + cos²(x) = 1 — always")
fig.grid().axes()
fig.plot(lambda x: math.sin(x)**2, color=BLUE,  label='sin²(x)', width=2)
fig.plot(lambda x: math.cos(x)**2, color=RED,   label='cos²(x)', width=2)
fig.plot(lambda x: math.sin(x)**2 + math.cos(x)**2,
         color=AMBER, label='sin²+cos²=1', width=3)
fig.hline(1, color=GRAY)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── INVERSE TRIG ──────────────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Inverse trig — arcsin, arccos, arctan',
              prose: [
                'Inverse trig functions answer "what angle produces this ratio?" They are the tool you use when you know sin(θ) = 0.6 and need to find θ. Because trig functions are periodic they are not invertible over all of ℝ — the inverses are only defined on **restricted domains** that produce a single output.',
                '## Restricted ranges',
                '- **arcsin(x):** input ∈ [−1, 1], output ∈ [−π/2, π/2] — "first and fourth quadrant"\n- **arccos(x):** input ∈ [−1, 1], output ∈ [0, π] — "first and second quadrant"\n- **arctan(x):** input ∈ (−∞, ∞), output ∈ (−π/2, π/2) — all reals, bounded output',
                '## atan2 — the practical tool',
                '`math.atan2(y, x)` returns the angle of the point (x, y) in [−π, π] — handling all four quadrants correctly by taking both coordinates. Use this instead of `atan(y/x)` whenever you need a full-circle angle (navigation, robotics, game physics).',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER

# Inverse trig — finding the angle from the ratio
print("arcsin examples:")
for v in [-1.0, -0.5, 0.0, 0.5, 1.0]:
    theta = math.asin(v)
    print(f"  arcsin({v:5.1f}) = {theta:7.4f} rad = {math.degrees(theta):7.2f}°")

print("\\narctan examples (no domain restriction on input):")
for v in [-100, -1, 0, 1, 100]:
    theta = math.atan(v)
    print(f"  arctan({v:5}) = {theta:7.4f} rad = {math.degrees(theta):7.2f}°")

# atan2: full quadrant-aware angle
print("\\natan2(y, x) — quadrant-aware:")
points = [(1,1), (-1,1), (-1,-1), (1,-1), (0,2), (-3,0)]
for x, y in points:
    angle = math.atan2(y, x)
    print(f"  point ({x:3},{y:3}): angle = {math.degrees(angle):8.2f}°")

# Plot all three inverse functions
fig = Figure(xmin=-1.1, xmax=1.1, ymin=-2, ymax=4,
             title="Inverse trig functions — restricted ranges")
fig.grid().axes()
fig.plot(math.asin, xmin=-1, xmax=1, color=BLUE,  label='arcsin — range [−π/2, π/2]', width=2.5)
fig.plot(math.acos, xmin=-1, xmax=1, color=RED,   label='arccos — range [0, π]',      width=2.5)
# arctan is defined for all x — plot over wider range
fig.plot(math.atan,                  color=GREEN, label='arctan — range (−π/2, π/2)', width=2.5)
fig.hline(math.pi/2,  color='gray')
fig.hline(-math.pi/2, color='gray')
fig.hline(math.pi,    color='gray')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── REAL-WORLD MODELLING ──────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Real-world modelling — periodic data',
              prose: [
                'Any real-world quantity that repeats regularly — daily temperature, tidal height, audio signal voltage, seasonal sales — can be approximated by a sinusoidal model. The strategy is to read off the four parameters (A, B, C, D) directly from the data before fitting.',
                '## Reading parameters from data',
                '- **D** = (max + min) / 2 — the midline (vertical centre)\n- **A** = (max − min) / 2 — the amplitude (half the peak-to-trough distance)\n- **B** = 2π / period — angular frequency (estimate period from the data)\n- **C** = phase shift — fine-tune by inspecting where the first peak occurs',
                'Once you have a rough model, you can refine it using least squares on the transformed data — or treat it as a good starting point for numerical optimisation.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GREEN, GRAY

# Average monthly temperature — London, UK (approximate)
months = list(range(1, 13))                       # 1=Jan … 12=Dec
temps  = [4.5, 5.0, 7.5, 10.5, 14.0, 17.0,
          19.0, 18.5, 15.5, 11.5, 7.5, 5.0]      # °C

# Read parameters from data
T_max, T_min = max(temps), min(temps)
D = (T_max + T_min) / 2          # midline
A = (T_max - T_min) / 2          # amplitude
period = 12                        # 12 months per year
B = 2 * math.pi / period          # angular frequency
# Peak is around month 7 (July) → phase shift so sin peaks at month 7
# sin(B*t + C) peaks when B*t + C = π/2  →  C = π/2 - B*7
C = math.pi/2 - B * 7

model = lambda t: A * math.sin(B * t + C) + D

print(f"Temperature range: {T_min}°C – {T_max}°C")
print(f"Midline D = {D:.1f}°C,  Amplitude A = {A:.1f}°C")
print(f"Period = {period} months,  B = {B:.4f}")
print(f"\\nModel vs actual (months 1–12):")
for m, actual in zip(months, temps):
    predicted = model(m)
    print(f"  Month {m:2}: actual={actual:.1f}°C  predicted={predicted:.1f}°C")

fig = Figure(xmin=0.5, xmax=12.5, ymin=-2, ymax=23,
             title="London Monthly Temperature — sinusoidal model")
fig.grid().axes()
fig.scatter(months, temps, color=AMBER, radius=7)
fig.plot(model, xmin=1, xmax=12, color=BLUE, label='A·sin(Bt+C)+D', width=3)
fig.hline(D, color=GRAY)
fig.text([0.6, D + 0.5], f"midline D={D:.1f}°C", color='gray', size=11)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 9,
              cellTitle: 'Fitting a sinusoid — estimating period and amplitude',
              prose: [
                'Fitting a sinusoid analytically is harder than fitting a line — the parameters appear inside a nonlinear function. The practical approach for clean periodic data is: (1) estimate period from the data, (2) compute A and D from max/min, (3) refine the phase by finding the first peak.',
                '## Fitting algorithm',
                '1. `D = (max + min) / 2` — midline\n2. `A = (max − min) / 2` — amplitude\n3. Estimate the period T from the spacing between peaks (or zero-crossings × 2)\n4. `B = 2π / T`\n5. Find the x-position of the first maximum → compute `C = π/2 − B·x_peak`',
                '**Python:** `max()` and `min()` with a list give the extremes in one call. Scanning for the peak index with `ys.index(max(ys))` gives a rough phase estimate — good enough to start, and refined visually.',
              ],
              code: `import math, random
from opencalc import Figure, BLUE, RED, AMBER, GREEN

random.seed(3)

# Generate noisy sinusoidal data
true_A, true_B, true_C, true_D = 3.0, 0.8, 0.4, 1.5
true_fn = lambda x: true_A * math.sin(true_B * x + true_C) + true_D
xs = [i * 0.5 for i in range(32)]        # 0 to 15.5, step 0.5
ys = [true_fn(x) + random.gauss(0, 0.2) for x in xs]

# Estimate parameters from data
y_max, y_min = max(ys), min(ys)
D_est = (y_max + y_min) / 2
A_est = (y_max - y_min) / 2

# Estimate period: find first peak index
peak_idx = ys.index(max(ys))
x_peak = xs[peak_idx]
# Find second peak: search for next local maximum after first
next_peak_idx = peak_idx
for i in range(peak_idx + 1, len(ys) - 1):
    if ys[i] > ys[i-1] and ys[i] > ys[i+1]:
        next_peak_idx = i
        break
period_est = xs[next_peak_idx] - x_peak if next_peak_idx != peak_idx else 2*math.pi
B_est = 2 * math.pi / period_est if period_est > 0 else 0.8
C_est = math.pi/2 - B_est * x_peak

model_est = lambda x: A_est * math.sin(B_est * x + C_est) + D_est

print(f"True:      A={true_A}, B={true_B}, C={true_C}, D={true_D}")
print(f"Estimated: A={A_est:.2f}, B={B_est:.3f}, C={C_est:.3f}, D={D_est:.2f}")

fig = Figure(xmin=-0.5, xmax=16, ymin=-3, ymax=6,
             title="Sinusoid fitting from noisy data")
fig.grid().axes()
fig.scatter(xs, ys, color=AMBER, radius=4)
fig.plot(true_fn,   color=GREEN, label='true signal', width=1.5)
fig.plot(model_est, color=BLUE,  label='estimated model', width=3)
fig.point([x_peak, max(ys)], color=RED, radius=7, label=f'peak at x={x_peak}')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── FOURIER PREVIEW ───────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Solving trig equations — general solutions',
              prose: [
                'Solving sin(x) = 0.5 yields x = π/6 — but because sin is periodic with period 2π, there are **infinitely many solutions**: x = π/6 + 2πk and x = 5π/6 + 2πk for any integer k. The **principal value** from arcsin is just one of them.',
                '## General solution pattern',
                '- **sin(x) = v:** x = arcsin(v) + 2πk  OR  x = π − arcsin(v) + 2πk\n- **cos(x) = v:** x = ±arccos(v) + 2πk\n- **tan(x) = v:** x = arctan(v) + πk (period is π, not 2π)',
                '**Python strategy:** Find the principal value with `math.asin/acos/atan`, then generate multiple solutions by adding multiples of the period. Filter to the desired domain (e.g. [0, 4π]).',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Solve sin(x) = 0.5 on [0, 4π]
v = 0.5
principal = math.asin(v)          # π/6 ≈ 0.5236

# All solutions in [0, 4π]: x = principal + 2πk  OR  x = π - principal + 2πk
domain_max = 4 * math.pi
solutions = []
k = 0
while True:
    s1 = principal + 2 * math.pi * k
    s2 = math.pi - principal + 2 * math.pi * k
    added = False
    if 0 <= s1 <= domain_max:
        solutions.append(s1)
        added = True
    if 0 <= s2 <= domain_max:
        solutions.append(s2)
        added = True
    if not added and k > 0:
        break
    k += 1

solutions.sort()
print(f"sin(x) = {v}  →  solutions on [0, 4π]:")
for s in solutions:
    print(f"  x = {s:.4f} rad = {math.degrees(s):.1f}°  (verify: sin={math.sin(s):.4f})")

# Visualize
fig = Figure(xmin=0, xmax=4*math.pi + 0.5, ymin=-1.5, ymax=1.5,
             title=f"sin(x) = {v} — all solutions on [0, 4π]")
fig.grid().axes()
fig.plot(math.sin, color=BLUE, label='sin(x)', width=2.5)
fig.hline(v, color=GRAY)
fig.text([0.2, v + 0.1], f"y = {v}", color='gray', size=11)
for s in solutions:
    fig.point([s, v], color=AMBER, radius=7, label=f'{s:.3f}')
    fig.vline(s, color=RED)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 11,
              cellTitle: 'Fourier decomposition preview — sum of sines',
              prose: [
                '**Fourier\'s theorem** states that any periodic function can be written as an infinite sum of sines and cosines. This is one of the most powerful results in all of mathematics — it underlies JPEG compression, MP3 audio, FM radio, MRI imaging, and spectral analysis. This cell gives an intuition for how a square wave builds up from sine waves.',
                '## How the approximation works',
                '- A **square wave** alternates between +1 and −1 with period 2π\n- Its Fourier series uses only **odd harmonics:** sin(x) + sin(3x)/3 + sin(5x)/5 + sin(7x)/7 + …\n- Adding more terms → better approximation of the sharp corners\n- With ∞ terms → exact square wave (except at the discontinuities — the **Gibbs phenomenon**)',
                'The key insight: a function that looks completely unlike a sine wave is secretly a superposition of many sine waves at different frequencies.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, GRAY, PURPLE

def fourier_square(x, n_terms):
    """
    Fourier series of a square wave using n_terms odd harmonics.
    Square wave = (4/π) * Σ sin((2k-1)x) / (2k-1)  for k=1,2,3,...
    """
    result = 0
    for k in range(1, n_terms + 1):
        harmonic = 2*k - 1   # 1, 3, 5, 7, ...
        result += math.sin(harmonic * x) / harmonic
    return (4 / math.pi) * result

fig = Figure(xmin=-0.5, xmax=7, ymin=-1.4, ymax=1.4,
             title="Fourier approximation of a square wave")
fig.grid().axes()

# True square wave (piecewise)
fig.plot(lambda x: 1 if math.sin(x) > 0 else -1 if math.sin(x) < 0 else 0,
         color=GRAY, label='square wave', width=1.5)

# Fourier approximations with increasing number of terms
colors = [RED, BLUE, GREEN, AMBER, PURPLE]
for n, color in zip([1, 3, 5, 10, 20], colors):
    fig.plot(lambda x, n=n: fourier_square(x, n),
             color=color, label=f'{n} terms', width=2)

fig.show()

print("Fourier series of square wave: (4/π)[sin(x) + sin(3x)/3 + sin(5x)/5 + ...]")
print("With 1 term:  rough approximation")
print("With 20 terms: sharp corners emerge — but Gibbs phenomenon at edges")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 12,
              cellTitle: 'Lissajous figures — parametric trig curves',
              prose: [
                'A **parametric curve** defines x and y as separate functions of a parameter t: x(t) = cos(at + δ), y(t) = sin(bt). As t runs from 0 to 2π, the point (x(t), y(t)) traces a path. When a and b are integer multiples of each other, the result is a closed **Lissajous figure** — the shape seen on an oscilloscope when two sine-wave signals are fed to the x and y inputs.',
                '## Patterns by ratio a:b',
                '- **1:1** — ellipse (or circle if δ=π/2)\n- **2:1** — figure-eight (parabola)\n- **3:2** — three-lobed curve\n- **3:1** — S-curve with three loops\n- **4:3** — complex braided figure',
                '**Library technique:** We generate (x, y) coordinate lists and use `fig.scatter()` with tiny dots to draw a parametric curve — there is no built-in parametric plot, so this is the practical workaround.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE

def lissajous(a, b, delta=math.pi/2, n=1000):
    """
    Parametric Lissajous figure:
    x(t) = cos(a*t + delta)
    y(t) = sin(b*t)
    Returns (xs, ys) lists.
    """
    ts = [2 * math.pi * i / n for i in range(n + 1)]
    xs = [math.cos(a * t + delta) for t in ts]
    ys = [math.sin(b * t)         for t in ts]
    return xs, ys

# Plot a 2×2 grid of Lissajous figures side by side
configs = [
    (1, 1, math.pi/2, BLUE,   "1:1"),
    (2, 1, math.pi/4, RED,    "2:1"),
    (3, 2, math.pi/4, GREEN,  "3:2"),
    (4, 3, math.pi/6, AMBER,  "4:3"),
]

# Arrange in a single figure with offsets
fig = Figure(xmin=-4.5, xmax=4.5, ymin=-2.5, ymax=2.5,
             title="Lissajous figures — x=cos(at+δ), y=sin(bt)", square=True)

offsets = [(-3, 0.8), (-1, 0.8), (1, 0.8), (3, 0.8)]   # centres (adjusted for readability)

# Use a single tall figure instead
fig2 = Figure(xmin=-8, xmax=8, ymin=-1.5, ymax=1.5,
              title="Lissajous figures — x=cos(at+δ), y=sin(bt)", square=False)
fig2.grid()

for (a, b, delta, color, label), (ox, oy) in zip(configs, [(-6,0),(-2,0),(2,0),(6,0)]):
    xs, ys = lissajous(a, b, delta)
    # Scale to fit in offset region
    scaled_xs = [x * 1.5 + ox for x in xs]
    scaled_ys = [y * 1.0 + oy for y in ys]
    fig2.scatter(scaled_xs, scaled_ys, color=color, radius=1)
    fig2.text([ox - 0.5, 1.2], label, color=color, size=12, bold=True)

fig2.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Unit circle — fill in the coordinates',
              difficulty: 'easy',
              prompt: 'Fill in the `cos` and `sin` values for each angle using the unit circle. Do not use `math.cos` or `math.sin` — write the exact values you know from memory.',
              starterBlock: `import math

# Fill in the exact values (use fractions like math.sqrt(3)/2)
# θ = 0 rad
cos_0 = ___     # cos(0) = ?
sin_0 = ___     # sin(0) = ?

# θ = π/6 (30°)
cos_pi6 = ___   # cos(π/6) = √3/2
sin_pi6 = ___   # sin(π/6) = 1/2

# θ = π/4 (45°)
cos_pi4 = ___   # cos(π/4) = √2/2
sin_pi4 = ___   # sin(π/4) = √2/2

# θ = π/3 (60°)
cos_pi3 = ___   # cos(π/3) = 1/2
sin_pi3 = ___   # sin(π/3) = √3/2

# θ = π/2 (90°)
cos_pi2 = ___   # cos(π/2) = 0
sin_pi2 = ___   # sin(π/2) = 1

# Verify
for name, got, expected in [
    ("cos(0)",   cos_0,   math.cos(0)),
    ("sin(0)",   sin_0,   math.sin(0)),
    ("cos(π/6)", cos_pi6, math.cos(math.pi/6)),
    ("sin(π/6)", sin_pi6, math.sin(math.pi/6)),
    ("cos(π/4)", cos_pi4, math.cos(math.pi/4)),
    ("sin(π/4)", sin_pi4, math.sin(math.pi/4)),
    ("cos(π/3)", cos_pi3, math.cos(math.pi/3)),
    ("sin(π/3)", sin_pi3, math.sin(math.pi/3)),
    ("cos(π/2)", cos_pi2, math.cos(math.pi/2)),
    ("sin(π/2)", sin_pi2, math.sin(math.pi/2)),
]:
    ok = math.isclose(got, expected, abs_tol=1e-9)
    print(f"  {name:10s} = {got:.5f}  {'✓' if ok else '✗ expected ' + str(round(expected,5))}")`,
              code: `import math

cos_0   = ___
sin_0   = ___
cos_pi6 = ___
sin_pi6 = ___
cos_pi4 = ___
sin_pi4 = ___
cos_pi3 = ___
sin_pi3 = ___
cos_pi2 = ___
sin_pi2 = ___

for name, got, expected in [
    ("cos(0)",   cos_0,   math.cos(0)),
    ("sin(0)",   sin_0,   math.sin(0)),
    ("cos(π/6)", cos_pi6, math.cos(math.pi/6)),
    ("sin(π/6)", sin_pi6, math.sin(math.pi/6)),
    ("cos(π/4)", cos_pi4, math.cos(math.pi/4)),
    ("sin(π/4)", sin_pi4, math.sin(math.pi/4)),
    ("cos(π/3)", cos_pi3, math.cos(math.pi/3)),
    ("sin(π/3)", sin_pi3, math.sin(math.pi/3)),
    ("cos(π/2)", cos_pi2, math.cos(math.pi/2)),
    ("sin(π/2)", sin_pi2, math.sin(math.pi/2)),
]:
    ok = math.isclose(got, expected, abs_tol=1e-9)
    print(f"  {name:10s} = {got:.5f}  {'OK' if ok else 'WRONG expected ' + str(round(expected,5))}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
vals = {
    'cos_0': (cos_0, math.cos(0)),
    'sin_0': (sin_0, math.sin(0)),
    'cos_pi6': (cos_pi6, math.cos(math.pi/6)),
    'sin_pi6': (sin_pi6, math.sin(math.pi/6)),
    'cos_pi4': (cos_pi4, math.cos(math.pi/4)),
    'sin_pi4': (sin_pi4, math.sin(math.pi/4)),
    'cos_pi3': (cos_pi3, math.cos(math.pi/3)),
    'sin_pi3': (sin_pi3, math.sin(math.pi/3)),
    'cos_pi2': (cos_pi2, math.cos(math.pi/2)),
    'sin_pi2': (sin_pi2, math.sin(math.pi/2)),
}
errors = [f"{k}: got {v[0]:.5f}, expected {v[1]:.5f}"
          for k, v in vals.items() if not math.isclose(v[0], v[1], abs_tol=1e-9)]
if errors:
    res = "ERROR: " + "; ".join(errors[:3])
else:
    res = "SUCCESS: All 10 unit circle values correct — cos/sin for 0, π/6, π/4, π/3, π/2."
res
`,
              hint: 'cos(0)=1, sin(0)=0. cos(π/6)=√3/2=math.sqrt(3)/2, sin(π/6)=1/2. cos(π/4)=sin(π/4)=√2/2=math.sqrt(2)/2. cos(π/3)=1/2, sin(π/3)=√3/2. cos(π/2)=0, sin(π/2)=1.',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Read a sinusoidal model from a description',
              difficulty: 'easy',
              prompt: 'A tide gauge measures water level that oscillates between 0.5 m and 3.5 m with a period of 12.4 hours. High tide first occurs at t = 3.1 hours. Write `tide_model(t)` that returns the water level at time t (hours). Then plot one full tidal cycle.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, GREEN, GRAY

def tide_model(t):
    """
    Water level at time t hours.
    Range: 0.5 m to 3.5 m. Period: 12.4 hr. First peak at t=3.1 hr.

    Steps:
      D = (max + min) / 2
      A = (max - min) / 2
      B = 2*pi / period
      C = pi/2 - B * t_peak    (so that the model peaks at t_peak)
    """
    pass

# Test: at t=3.1 the model should be near maximum (3.5 m)
print(f"tide_model(0)   = {tide_model(0):.3f} m   (rising)")
print(f"tide_model(3.1) = {tide_model(3.1):.3f} m   (should be ≈ 3.5)")
print(f"tide_model(9.3) = {tide_model(9.3):.3f} m   (should be ≈ 0.5 — low tide)")

fig = Figure(xmin=0, xmax=12.4, ymin=0, ymax=4,
             title="Tidal cycle — one period (12.4 hours)")
fig.grid().axes()
fig.plot(tide_model, xmin=0, xmax=12.4, color=BLUE, label='water level (m)', width=3)
fig.hline(2.0, color=GRAY)
fig.text([0.2, 2.1], "mean sea level (2.0 m)", color='gray', size=11)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'tide_model' not in dir():
    res = "ERROR: tide_model not defined."
elif tide_model(0) is None:
    res = "ERROR: function returned None — fill in the formula."
else:
    peak = tide_model(3.1)
    trough_t = 3.1 + 12.4/2
    trough = tide_model(trough_t)
    mid = tide_model(0)
    if not math.isclose(peak, 3.5, abs_tol=0.05):
        res = f"ERROR: peak at t=3.1 should be ≈3.5m, got {peak:.3f}."
    elif not math.isclose(trough, 0.5, abs_tol=0.05):
        res = f"ERROR: trough at t={trough_t:.1f} should be ≈0.5m, got {trough:.3f}."
    else:
        res = f"SUCCESS: tide_model correct — peak={peak:.3f}m, trough={trough:.3f}m, mean={mid:.3f}m."
res
`,
              hint: 'D=(3.5+0.5)/2=2.0, A=(3.5-0.5)/2=1.5, B=2*math.pi/12.4, C=math.pi/2 - B*3.1. Return A*math.sin(B*t + C) + D.',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Verify the Pythagorean identity and explore a derived identity',
              difficulty: 'medium',
              prompt: 'Write `verify_identity(lhs_fn, rhs_fn, n=10000)` that tests whether lhs_fn(θ) ≈ rhs_fn(θ) at n random angles, returning (True/False, max_error). Use it to verify: (1) sin²+cos²=1, (2) sin(2θ)=2·sin(θ)·cos(θ), (3) cos(2θ)=1−2·sin²(θ). Then plot all three identities to show they are constant or overlapping.',
              code: `import math, random

def verify_identity(lhs_fn, rhs_fn, n=10000, tol=1e-10):
    """
    Test lhs_fn(θ) ≈ rhs_fn(θ) at n random angles.
    Returns (holds: bool, max_error: float).
    """
    pass

# Test the three identities
id1_holds, id1_err = verify_identity(
    lambda t: math.sin(t)**2 + math.cos(t)**2,
    lambda t: 1.0
)
print(f"sin²+cos²=1:           holds={id1_holds},  max_err={id1_err:.2e}")

id2_holds, id2_err = verify_identity(
    lambda t: math.sin(2*t),
    lambda t: 2 * math.sin(t) * math.cos(t)
)
print(f"sin(2θ)=2sinθcosθ:     holds={id2_holds},  max_err={id2_err:.2e}")

id3_holds, id3_err = verify_identity(
    lambda t: math.cos(2*t),
    lambda t: 1 - 2*math.sin(t)**2
)
print(f"cos(2θ)=1-2sin²θ:      holds={id3_holds},  max_err={id3_err:.2e}")

from opencalc import Figure, BLUE, RED, GREEN
fig = Figure(xmin=0, xmax=7, ymin=-1.5, ymax=1.5,
             title="sin(2x) vs 2·sin(x)·cos(x) — they overlap exactly")
fig.grid().axes()
fig.plot(lambda x: math.sin(2*x),              color=BLUE, label='sin(2x)',         width=3)
fig.plot(lambda x: 2*math.sin(x)*math.cos(x),  color=RED,  label='2·sin(x)·cos(x)', width=1.5)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math, random
if 'verify_identity' not in dir():
    res = "ERROR: verify_identity not defined."
else:
    r1, e1 = verify_identity(lambda t: math.sin(t)**2+math.cos(t)**2, lambda t: 1.0)
    r2, e2 = verify_identity(lambda t: math.sin(2*t), lambda t: 2*math.sin(t)*math.cos(t))
    r3, e3 = verify_identity(lambda t: math.cos(2*t), lambda t: 1-2*math.sin(t)**2)
    if r1 is None:
        res = "ERROR: returned None — fill in the function body."
    elif not r1:
        res = f"ERROR: sin²+cos²=1 should hold, max_err={e1:.2e}."
    elif not r2:
        res = f"ERROR: sin(2θ)=2sinθcosθ should hold, max_err={e2:.2e}."
    elif not r3:
        res = f"ERROR: cos(2θ)=1-2sin²θ should hold, max_err={e3:.2e}."
    else:
        res = f"SUCCESS: all three identities hold — max errors: {e1:.1e}, {e2:.1e}, {e3:.1e}."
res
`,
              hint: 'Generate n random angles with random.uniform(-4*pi, 4*pi). Compute errors = [abs(lhs_fn(t) - rhs_fn(t)) for t in angles]. max_error = max(errors). holds = max_error < tol. Return (holds, max_error).',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Sound wave — construct and mix two tones',
              difficulty: 'medium',
              prompt: 'Write `sine_wave(freq, amplitude=1.0, phase=0.0)` that returns a function of time t (seconds) giving `amplitude * sin(2π·freq·t + phase)`. Create: A = 440 Hz (concert A), B = 554 Hz (C#). Mix them (add the waves) and plot 0.01 seconds of all three: wave A, wave B, and the mix.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, GRAY

def sine_wave(freq, amplitude=1.0, phase=0.0):
    """Return f(t) = amplitude * sin(2π * freq * t + phase)."""
    pass

# Concert A (440 Hz) and C# (554 Hz)
note_A  = sine_wave(freq=440, amplitude=1.0)
note_Cs = sine_wave(freq=554, amplitude=0.8)
mix     = lambda t: note_A(t) + note_Cs(t)

# Verify: at t=0 both should equal 0 (no phase offset)
print(f"note_A(0)  = {note_A(0):.4f}   (should be 0)")
print(f"note_Cs(0) = {note_Cs(0):.4f}  (should be 0)")

# Period of A: 1/440 ≈ 0.00227 s
period_A = 1 / 440
print(f"\\nPeriod of A: {period_A*1000:.3f} ms")
print(f"note_A(period_A) = {note_A(period_A):.6f}  (should be ≈ 0, full cycle)")

# Plot 0.01 seconds
fig = Figure(xmin=0, xmax=0.01, ymin=-2.2, ymax=2.2,
             title="Sound waves: A=440Hz + C#=554Hz → mix")
fig.grid().axes()
fig.plot(note_A,  color=BLUE,  label='A (440 Hz)',  width=2, xmin=0, xmax=0.01)
fig.plot(note_Cs, color=RED,   label='C# (554 Hz)', width=2, xmin=0, xmax=0.01)
fig.plot(mix,     color=GREEN, label='mix',         width=2.5, xmin=0, xmax=0.01)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'sine_wave' not in dir():
    res = "ERROR: sine_wave not defined."
elif sine_wave(440)(0) is None:
    res = "ERROR: returned None — fill in the formula."
else:
    f440 = sine_wave(440)
    f554 = sine_wave(554, 0.8)
    t_half_period_A = 1/(2*440)
    # At half-period the wave should be near 0 (crossed once already, near 0 again)
    v_peak = f440(1/(4*440))   # quarter period — should be near max (1.0)
    v_zero = f440(0)
    if abs(v_zero) > 1e-10:
        res = f"ERROR: f440(0) should be 0, got {v_zero}."
    elif not math.isclose(abs(v_peak), 1.0, abs_tol=0.001):
        res = f"ERROR: peak at quarter period should be ≈1.0, got {v_peak:.4f}."
    elif not math.isclose(abs(f554(1/(4*554))), 0.8, abs_tol=0.001):
        res = f"ERROR: C# amplitude should be 0.8."
    else:
        res = f"SUCCESS: sine_wave correct — A(0)={v_zero:.4f}, peak={v_peak:.4f}, C# peak={f554(1/(4*554)):.4f}."
res
`,
              hint: 'return lambda t: amplitude * math.sin(2 * math.pi * freq * t + phase). The angular frequency is 2π·freq — this converts cycles per second (Hz) into radians per second.',
            },

            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Compound: full sinusoidal modelling workflow',
              difficulty: 'hard',
              prompt: 'Monthly average daylight hours for a northern-hemisphere city are given below. Detect whether the data is sinusoidal, fit a model (estimate A, B, C, D from the data), compute the month with maximum daylight, and produce a fully annotated plot with the data, the model, and the peak marked.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GREEN, GRAY, PURPLE

# Average daylight hours per month (approximate — Edinburgh, Scotland)
months  = list(range(1, 13))
daylight = [7.1, 8.6, 11.1, 13.8, 16.2, 17.6,
            17.1, 15.2, 12.5, 9.8, 7.5, 6.4]  # hours

# 1. Estimate A, D, B, C from the data
y_max, y_min = max(daylight), min(daylight)
D = ___             # midline
A = ___             # amplitude
period = 12         # months
B = ___             # angular frequency
peak_month = months[daylight.index(max(daylight))]
C = ___             # phase shift so model peaks at peak_month

model = lambda t: A * math.sin(B * t + C) + D

# 2. Print model parameters
print(f"D (midline)   = {D:.2f} hours")
print(f"A (amplitude) = {A:.2f} hours")
print(f"B (ang. freq) = {B:.4f}")
print(f"Peak month    = {peak_month}  (C = {C:.4f})")

# 3. Model accuracy
print("\\nMonth-by-month comparison:")
for m, actual in zip(months, daylight):
    pred = model(m)
    print(f"  Month {m:2}: actual={actual:.1f}  predicted={pred:.1f}  err={abs(actual-pred):.2f}")

# 4. Month with maximum daylight (check: should be June)
max_month = max(months, key=lambda m: model(m))
print(f"\\nPeak daylight month (model): {max_month}")

# 5. Full annotated plot
fig = Figure(xmin=0.5, xmax=12.5, ymin=4, ymax=20,
             title="Daylight hours — Edinburgh, Scotland")
fig.grid().axes()

# Your code: scatter of actual data, fitted model curve,
# midline reference, peak annotation, vertical guides for solstices
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'model' not in dir():
    res = "ERROR: model not defined — assign it in the cell."
else:
    daylight = [7.1,8.6,11.1,13.8,16.2,17.6,17.1,15.2,12.5,9.8,7.5,6.4]
    months = list(range(1,13))
    y_max, y_min = max(daylight), min(daylight)
    D_exp = (y_max+y_min)/2
    A_exp = (y_max-y_min)/2
    peak = model(6)
    trough = model(12)
    mid_val = model(3)
    if abs(peak - y_max) > 1.5:
        res = f"ERROR: model at month 6 should be ≈{y_max:.1f}, got {peak:.2f}."
    elif abs(trough - y_min) > 1.5:
        res = f"ERROR: model at month 12 should be ≈{y_min:.1f}, got {trough:.2f}."
    else:
        errors = [abs(model(m) - d) for m, d in zip(months, daylight)]
        mae = sum(errors)/len(errors)
        res = f"SUCCESS: model fits — peak={peak:.2f}hr, trough={trough:.2f}hr, MAE={mae:.2f}hr."
res
`,
              hint: 'D=(max+min)/2, A=(max-min)/2, B=2*math.pi/12, C=math.pi/2 - B*peak_month. For the plot: scatter for data, fig.plot(model, xmin=1, xmax=12) for the curve, fig.point([6, model(6)]) for the solstice peak. Add fig.vline(6) and fig.vline(12) for summer/winter solstice markers.',
            },
          ],
        },
      },
    ],
  },
}
