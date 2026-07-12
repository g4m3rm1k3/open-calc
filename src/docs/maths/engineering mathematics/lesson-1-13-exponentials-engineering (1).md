# Stage 1, Lesson 1.13 — Exponentials in Engineering
**Threads:** Math · Physics · Manufacturing  
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

This is the capstone of Stage 1, Chapter 1B. Everything built in
Lessons 1.6 through 1.12 — exponential functions, the number $e$,
natural logarithms, log laws, and solving exponential equations — now
gets applied to three models that appear daily in manufacturing and
electrical engineering. The **Taylor Tool Life equation** is the
fundamental relationship between cutting speed and tool life; the
**Newton's Law of Cooling** governs heat treatment, quenching, and
thermal management; and the **RC circuit discharge** models capacitor
behaviour in every electronic control system. All three are exponential
models, and all three require the same mathematical toolkit. By the end
of this lesson you can derive each model from its physical law, solve for
any variable, fit the model to measured data, and plot the results.

---

## Historical Context

Frederick Winslow Taylor, the founder of scientific management, spent
26 years (1880–1906) at Bethlehem Steel measuring how cutting speed
affected tool life. His 1906 paper "On the Art of Cutting Metals" is
one of the longest engineering papers ever published and contains the
equation that bears his name. Taylor's work was the first systematic
attempt to optimise a manufacturing process using measured data and
mathematical models — the beginning of modern manufacturing science.
Newton's Law of Cooling appeared in Newton's 1701 paper on heat;
it was the first quantitative heat transfer model. The RC circuit
model follows directly from Ohm's Law and Kirchhoff's laws, developed
in the 1840s.

---

## What You Need To Know First

- **Exponential functions** — Lesson 1.6
- **The number $e$ and $e^x$** — Lesson 1.7
- **Natural logarithm $\ln$** — Lesson 1.8
- **Logarithm laws** — Lesson 1.9
- **Solving exponential equations** — Lesson 1.10
- **Fitting power laws with $\ln$** — Lesson 1.8, Challenge 3

---

## The Lesson

### Model 1 — The Taylor Tool Life Equation

**The physics:** when a cutting tool removes material, the tool tip
wears. Higher cutting speeds generate more heat and wear the tool
faster. Taylor found empirically that the relationship between cutting
speed $V$ (m/min) and tool life $T$ (min) follows a power law:

$$VT^n = C$$

where $n$ (the **Taylor exponent**) and $C$ (the **Taylor constant**)
are material-dependent constants determined by experiment.

Typical values:
- HSS tool cutting steel: $n \approx 0.125$, $C \approx 60$–$200$
- Carbide tool cutting steel: $n \approx 0.25$, $C \approx 500$–$1000$

**Solving for tool life** given cutting speed $V$:

$$T = \left(\frac{C}{V}\right)^{1/n}$$

**Solving for cutting speed** that gives tool life $T$:

$$V = \frac{C}{T^n}$$

**Linearising with logarithms:** taking $\ln$ of both sides of $VT^n = C$:

$$\ln V + n \ln T = \ln C$$

$$\ln V = \ln C - n \ln T$$

This is a linear equation in $(\ln T, \ln V)$ — a line with slope $-n$
and intercept $\ln C$. This is why machinists plot tool life data on
**log-log paper**: the power law becomes a straight line, easy to fit.

**Hand-worked example:** A carbide tool has $n = 0.25$ and $C = 500$.

- At $V = 200$ m/min: $T = (500/200)^{1/0.25} = (2.5)^4 = 39.06$ min
- At $V = 300$ m/min: $T = (500/300)^4 = (1.667)^4 \approx 7.72$ min
- Speed for 30-min life: $V = 500 / 30^{0.25} \approx 500/2.34 \approx 213.6$ m/min

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Taylor Tool Life: VT^n = C
n_hss      = 0.125;  C_hss      = 200   # HSS tool
n_carbide  = 0.25;   C_carbide  = 500   # Carbide tool

T_range = np.logspace(0, 3, 400)
# np.logspace(0, 3, 400): 400 points from 10^0=1 to 10^3=1000 min
# log spacing appropriate because T varies over orders of magnitude

V_hss     = C_hss     / T_range**n_hss
V_carbide = C_carbide / T_range**n_carbide

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: standard plot (curved)
axes[0].plot(T_range, V_hss,     color='#2980b9', lw=2.5, label='HSS ($n=0.125$)')
axes[0].plot(T_range, V_carbide, color='#e74c3c', lw=2.5, label='Carbide ($n=0.25$)')
axes[0].set_xlabel('Tool life $T$ (min)')
axes[0].set_ylabel('Cutting speed $V$ (m/min)')
axes[0].set_title('Taylor Tool Life: $VT^n = C$\n(linear axes — curved)', fontsize=10)
axes[0].legend(fontsize=10); axes[0].grid(True, alpha=0.3)

# Right: log-log plot (straight line)
axes[1].loglog(T_range, V_hss,     color='#2980b9', lw=2.5, label='HSS ($n=0.125$)')
axes[1].loglog(T_range, V_carbide, color='#e74c3c', lw=2.5, label='Carbide ($n=0.25$)')
# ax.loglog: both axes logarithmic -- power law appears as a straight line
axes[1].set_xlabel('Tool life $T$ (min) — log scale')
axes[1].set_ylabel('Cutting speed $V$ (m/min) — log scale')
axes[1].set_title('Same data on log-log axes:\n'
                  'slope $= -n$, intercept $= \\ln C$', fontsize=10)
axes[1].legend(fontsize=10); axes[1].grid(True, alpha=0.3, which='both')
# which='both': grid lines for both major and minor log-scale divisions

plt.suptitle("Taylor Tool Life Equation: $VT^n = C$", fontsize=12)
plt.tight_layout()
plt.show()

# Numerical example
n, C = 0.25, 500
print("Carbide tool (n=0.25, C=500):\n")
print(f"{'V (m/min)':>12}  {'T (min)':>12}  {'T (hr)':>10}")
print("-" * 40)
for V in [100, 150, 200, 250, 300, 400]:
    T_min = (C/V)**(1/n)
    print(f"{V:>12}  {T_min:>12.2f}  {T_min/60:>10.3f}")

print(f"\nSpeed for T=30 min: V = {C/30**n:.2f} m/min")
```

**Walkthrough:** `ax.loglog(x, y)` plots with both axes on logarithmic
scales — the simplest way to verify (and visualise) a power law.
`grid(True, alpha=0.3, which='both')` draws grid lines at both major
tick marks (powers of 10) and minor ones (2, 3, 4... between powers) —
`which='both'` is new here and only meaningful on log-scale axes.

---

### Fitting the Taylor Equation to Data

In practice, $n$ and $C$ are not known — they are determined by running
experiments at different speeds and measuring the resulting tool life.
Linearising with $\ln$ converts this into a straight-line fitting problem.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Simulated experimental data (with measurement noise)
np.random.seed(7)
n_true, C_true = 0.25, 500

T_measured = np.array([5, 10, 20, 40, 80, 160], dtype=float)
V_measured = C_true / T_measured**n_true * (1 + 0.05*np.random.randn(6))
# Adding 5% random noise to simulate measurement variation
# np.random.randn(6): 6 standard-normal random values (mean 0, std 1)

# Linearise: take ln of both sides
lnT = np.log(T_measured)   # np.log: natural log, element-wise
lnV = np.log(V_measured)

# Fit a line to (lnT, lnV): lnV = lnC - n*lnT
# np.polyfit(x, y, degree) returns [slope, intercept] for degree=1
coeffs = np.polyfit(lnT, lnV, 1)
n_fit    = -coeffs[0]          # slope is -n
lnC_fit  =  coeffs[1]          # intercept is ln(C)
C_fit    =  math.exp(lnC_fit)  # recover C from ln(C)

print(f"True values:   n={n_true:.4f},  C={C_true:.2f}")
print(f"Fitted values: n={n_fit:.4f},  C={C_fit:.2f}")

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: raw data and fitted curve on log-log
T_fit = np.logspace(0, 3, 300)
V_fit = C_fit / T_fit**n_fit

axes[0].loglog(T_measured, V_measured, 'o', color='#e74c3c',
               markersize=9, zorder=5, label='Measured data')
axes[0].loglog(T_fit, V_fit, color='#2980b9', lw=2,
               label=f'Fitted: $n={n_fit:.3f}$, $C={C_fit:.1f}$')
axes[0].set_xlabel('$T$ (min)'); axes[0].set_ylabel('$V$ (m/min)')
axes[0].set_title('Log-log: data and fitted power law', fontsize=10)
axes[0].legend(fontsize=9); axes[0].grid(True, alpha=0.3, which='both')

# Right: linearised data and fitted line
lnT_line = np.linspace(lnT.min()-0.3, lnT.max()+0.3, 100)
axes[1].scatter(lnT, lnV, color='#e74c3c', s=80, zorder=5, label='$(\\ln T, \\ln V)$')
axes[1].plot(lnT_line, coeffs[0]*lnT_line + coeffs[1],
             color='#2980b9', lw=2,
             label=f'Fit: slope$={coeffs[0]:.3f}$')
axes[1].set_xlabel('$\\ln T$'); axes[1].set_ylabel('$\\ln V$')
axes[1].set_title('Linearised: straight-line fit gives $n$ and $C$', fontsize=10)
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)

plt.suptitle('Fitting the Taylor Tool Life equation from experimental data',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `np.random.randn(6)` generates 6 random numbers from
a standard normal distribution — mean 0, standard deviation 1. Multiplying
by 0.05 gives 5% random noise. `np.polyfit(lnT, lnV, 1)` fits a
degree-1 polynomial (straight line) to the log-transformed data and
returns `[slope, intercept]`. Since the model is $\ln V = \ln C - n\ln T$,
the slope is $-n$ (so `n_fit = -coeffs[0]`) and the intercept is $\ln C$
(so `C_fit = math.exp(coeffs[1])`).

---

### Model 2 — Newton's Law of Cooling

**The physics:** the rate at which a hot object loses heat is proportional
to the temperature difference between the object and its surroundings.
If $T(t)$ is the object's temperature at time $t$ and $T_\text{env}$
is the environment temperature:

$$\frac{dT}{dt} = -k(T - T_\text{env})$$

This is a differential equation (formally solved in Stage 7). Its
solution is:

$$T(t) = T_\text{env} + (T_0 - T_\text{env})\,e^{-kt}$$

where $T_0 = T(0)$ is the initial temperature and $k > 0$ is the
**cooling constant** (depends on material and geometry).

**Solving for time:** when does the part reach temperature $T_\text{target}$?

$$T_\text{target} = T_\text{env} + (T_0 - T_\text{env})e^{-kt}$$

$$\frac{T_\text{target} - T_\text{env}}{T_0 - T_\text{env}} = e^{-kt}$$

$$t = \frac{-1}{k}\ln\!\left(\frac{T_\text{target} - T_\text{env}}{T_0 - T_\text{env}}\right)$$

**Manufacturing application — quenching:** steel is heated to 800°C
for hardening, then quenched in oil (20°C). With cooling constant
$k = 0.05\ \text{s}^{-1}$, how long until it reaches 100°C for safe
handling?

$$t = \frac{-1}{0.05}\ln\!\left(\frac{100-20}{800-20}\right) = -20\ln(0.1026) \approx 45.5 \text{ s}$$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

T_env = 20    # Oil bath temperature (°C)
T0    = 800   # Initial steel temperature (°C)
k     = 0.05  # Cooling constant (1/s)

def T_cooling(t, T0, T_env, k):
    """Newton's Law of Cooling: T(t) = T_env + (T0-T_env)*e^(-k*t)"""
    return T_env + (T0 - T_env) * np.exp(-k * t)
    # np.exp: e^x element-wise, works on arrays and scalars

t = np.linspace(0, 120, 400)
T = T_cooling(t, T0, T_env, k)

# Solve for time to reach T_target
def time_to_reach(T_target, T0, T_env, k):
    """Solve T_env + (T0-T_env)*e^(-kt) = T_target for t."""
    ratio = (T_target - T_env) / (T0 - T_env)
    if ratio <= 0 or ratio >= 1:
        return None   # unreachable temperature
    return -math.log(ratio) / k

fig, ax = plt.subplots(figsize=(9, 6))

ax.plot(t, T, color='#e74c3c', lw=2.5,
        label=f'$T(t)=20+780e^{{-0.05t}}$')
ax.axhline(T_env, color='#aaa', lw=1, linestyle='--',
           label=f'$T_{{env}}={T_env}°C$ (oil bath)')

# Mark critical temperatures
for T_crit, label, color in [
    (300, 'Handle with tongs\n(300°C)', '#8e44ad'),
    (100, 'Safe to handle\n(100°C)',    '#2980b9'),
]:
    t_crit = time_to_reach(T_crit, T0, T_env, k)
    ax.plot(t_crit, T_crit, 'o', color=color, markersize=10, zorder=5)
    ax.axvline(t_crit, color=color, lw=1, linestyle=':')
    ax.annotate(f'{label}\n$t={t_crit:.1f}$ s',
                xy=(t_crit, T_crit), xytext=(t_crit+5, T_crit+80),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.2),
                fontsize=9, color=color)

ax.set_xlabel('Time (s)'); ax.set_ylabel('Temperature (°C)')
ax.set_title("Newton's Law of Cooling: steel quench\n"
             "$T(t) = 20 + 780\\,e^{-0.05t}$", fontsize=11)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# Print time table
print("Steel quench cooling profile:\n")
print(f"{'t (s)':>8}  {'T (°C)':>10}")
print("-" * 22)
for t_val in [0, 10, 20, 30, 45.5, 60, 90, 120]:
    T_val = T_cooling(t_val, T0, T_env, k)
    print(f"{t_val:>8.1f}  {T_val:>10.1f}")
```

**Walkthrough:** `T_cooling` is defined as a regular Python function
but accepts both scalars (for single values) and numpy arrays (for the
plot) because `np.exp` handles both. `time_to_reach` uses `math.log`
(scalar logarithm) since it is called with a single target temperature.
The `ratio <= 0 or ratio >= 1` check catches physically unreachable
temperatures — you cannot cool below $T_\text{env}$ or above $T_0$.

---

### Model 3 — RC Circuit Discharge

**The physics:** a capacitor charged to voltage $V_0$ discharges
through a resistor $R$. The voltage decays as:

$$V(t) = V_0\,e^{-t/\tau}, \qquad \tau = RC$$

where $\tau = RC$ is the **time constant** (in seconds, when $R$ is
in ohms and $C$ in farads). After one time constant, the voltage is
$V_0/e \approx 36.8\%$ of its initial value.

This model appears in every electronic control system — motor drivers,
CNC controllers, sensor signal conditioning, and power supplies all
contain RC circuits.

**Solving for time** to reach voltage $V_\text{target}$:

$$t = -\tau \ln\!\left(\frac{V_\text{target}}{V_0}\right) = \tau \ln\!\left(\frac{V_0}{V_\text{target}}\right)$$

**Design question:** a CNC controller needs the supply voltage to stay
above 10V during a 50ms power interruption. What minimum capacitance is
needed, given $R = 100\ \Omega$ and $V_0 = 24$V?

$$50 \times 10^{-3} = \tau \ln\!\left(\frac{24}{10}\right) \implies \tau = \frac{0.05}{\ln(2.4)} \approx 0.0568 \text{ s}$$

$$C = \frac{\tau}{R} = \frac{0.0568}{100} \approx 568\ \mu\text{F}$$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

V0  = 24     # Initial voltage (V)
R   = 100    # Resistance (Ω)

# Compare different capacitances
capacitances = {
    '$C=100\\ \\mu$F':   100e-6,
    '$C=470\\ \\mu$F':   470e-6,
    '$C=1000\\ \\mu$F': 1000e-6,
}

t = np.linspace(0, 0.5, 500)

fig, ax = plt.subplots(figsize=(9, 6))

colors = ['#2980b9', '#e74c3c', '#27ae60']
for (label, C_val), color in zip(capacitances.items(), colors):
    tau = R * C_val    # time constant tau = RC
    V = V0 * np.exp(-t / tau)
    ax.plot(t, V, color=color, lw=2.5, label=f'{label}, $\\tau={tau*1000:.0f}$ ms')

# Target voltage line
ax.axhline(10, color='#aaa', lw=1.5, linestyle='--', label='Min voltage (10V)')
ax.axvline(0.050, color='#555', lw=1, linestyle=':', label='50 ms mark')

ax.set_xlabel('Time (s)'); ax.set_ylabel('Voltage (V)')
ax.set_title('RC discharge: $V(t) = V_0\\,e^{-t/RC}$\n'
             'Which capacitance keeps voltage above 10V for 50 ms?', fontsize=11)
ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
ax.set_ylim(0, 26)
plt.tight_layout()
plt.show()

# Design calculation
V_min = 10
t_hold = 0.050
tau_needed = t_hold / math.log(V0 / V_min)
C_needed   = tau_needed / R

print(f"Design requirement: V >= {V_min}V for {t_hold*1000:.0f} ms")
print(f"Required tau = {tau_needed*1000:.2f} ms")
print(f"Required C   = {C_needed*1e6:.1f} µF")
print(f"Choose standard value: 680 µF (next standard size above {C_needed*1e6:.0f} µF)")
```

**Walkthrough:** `np.exp(-t / tau)` divides the entire `t` array by
the scalar `tau` element-wise, then passes the resulting array to
`np.exp` — both operations are element-wise and produce arrays of the
same length as `t`. `math.log(V0 / V_min)` computes $\ln(24/10) =
\ln(2.4)$ as a scalar for the design equation. The three curves show
directly that $C = 100\ \mu$F is insufficient (voltage drops below 10V
before 50 ms), while $C = 470\ \mu$F and $C = 1000\ \mu$F both satisfy
the requirement.

---

### The Common Structure

All three models share the same mathematical structure:

| Model | Equation | Unknown of interest |
|-------|----------|-------------------|
| Taylor Tool Life | $V T^n = C$ | $T$ given $V$, or $V$ given $T$ |
| Newton Cooling | $T(t) = T_e + (T_0-T_e)e^{-kt}$ | $t$ given $T_\text{target}$ |
| RC Discharge | $V(t) = V_0 e^{-t/\tau}$ | $t$ or $\tau$ given targets |

In every case, the solution strategy is:

1. Isolate the exponential (or the power law)
2. Apply $\ln$ to both sides
3. Solve the resulting linear equation

The difference is only in the physical interpretation.

---

## Connect the Pieces

**What this lesson built on:** the entire Chapter 1B toolkit —
exponential functions (1.6), $e$ (1.7), $\ln$ (1.8), log laws (1.9),
solving equations (1.10), log scales (1.11). The power law fitting
from Lesson 1.8 Challenge 3 is used directly for the Taylor equation.

**What this lesson makes possible:** Stage 5 (Calculus) will derive
Newton's Law of Cooling properly — the differential equation
$dT/dt = -k(T-T_e)$ is the source of the exponential solution.
Stage 7 (Differential Equations) covers a whole family of models
with this structure. Stage 9 (Algorithms) uses the RC circuit as
an analogy for algorithmic decay.

---

## Summary

**Taylor Tool Life:** $VT^n = C$. Linearise as $\ln V = \ln C - n\ln T$.
Fit on log-log axes. Solve for $V$ or $T$ using logs.

**Newton Cooling:** $T(t) = T_e + (T_0-T_e)e^{-kt}$.
Solve for $t$: $t = -\frac{1}{k}\ln\!\left(\frac{T_\text{target}-T_e}{T_0-T_e}\right)$.

**RC Discharge:** $V(t) = V_0 e^{-t/\tau}$, $\tau=RC$.
Solve for $t$: $t = \tau\ln(V_0/V_\text{target})$.
Solve for $\tau$: $\tau = t / \ln(V_0/V_\text{target})$.

**New Python:**
- `ax.loglog(x, y)` — both axes logarithmic
- `ax.grid(True, which='both')` — major and minor gridlines on log axes
- `np.random.randn(n)` — $n$ random standard-normal values
- `np.random.seed(n)` — reproducible randomness

---

## Problems

### Math

**1.** A HSS tool ($n=0.125$, $C=150$) is being used to cut at 120 m/min.

(a) What is the expected tool life?

(b) If you reduce speed by 20%, by what factor does tool life increase?

(c) At what speed would you get exactly 60 minutes of tool life?

<details>
<summary>Answers</summary>

(a) $T = (150/120)^{1/0.125} = (1.25)^8 \approx 5.96$ min

(b) New speed: $120 \times 0.8 = 96$ m/min.
$T_\text{new} = (150/96)^8 = (1.5625)^8 \approx 23.3$ min.
Factor: $23.3/5.96 \approx 3.9\times$ longer.

(c) $V = 150/60^{0.125} = 150/1.668 \approx 89.9$ m/min.

</details>

---

**2.** Steel cools from 900°C in water at 15°C with cooling constant
$k = 0.08\ \text{s}^{-1}$.

(a) Write the cooling model $T(t)$.

(b) What is the temperature after 30 seconds?

(c) How long to cool to 50°C?

<details>
<summary>Answers</summary>

(a) $T(t) = 15 + 885\,e^{-0.08t}$

(b) $T(30) = 15 + 885\,e^{-2.4} = 15 + 885(0.0907) \approx 95.3°C$

(c) $t = -\frac{1}{0.08}\ln\!\left(\frac{35}{885}\right) = -12.5\ln(0.0395) \approx 40.0$ s

</details>

---

**3.** (Proof) Show that in the Newton cooling model, the time to cool
from any temperature $T_1$ to any temperature $T_2$ (both above $T_e$)
depends only on the ratio $(T_1-T_e)/(T_2-T_e)$, not on the starting time.

<details>
<summary>Answer</summary>

$T(t_1) = T_1$ and $T(t_2) = T_2$ give:
$T_1 - T_e = (T_0-T_e)e^{-kt_1}$ and $T_2-T_e=(T_0-T_e)e^{-kt_2}$.
Dividing: $\frac{T_1-T_e}{T_2-T_e} = e^{-k(t_1-t_2)}$, so
$\Delta t = t_2-t_1 = -\frac{1}{k}\ln\!\left(\frac{T_1-T_e}{T_2-T_e}\right)$.

This depends only on the ratio, not on $T_0$ or $t_1$ — the process
is memoryless. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Taylor Tool Life calculator**

```python
import math

def tool_life(V, n, C):
    """Return tool life T (min) given speed V, exponent n, constant C."""
    pass

def cutting_speed(T, n, C):
    """Return cutting speed V given tool life T, exponent n, constant C."""
    pass

def taylor_n_C_from_data(V_data, T_data):
    """
    Fit n and C from lists of measured (V, T) pairs.
    Returns (n, C).
    Uses linearisation: fit a line to (ln(T), ln(V)).
    """
    pass


# --- tests: do not modify ---
import math, numpy as np

assert math.isclose(tool_life(200, 0.25, 500),    (500/200)**4,    rel_tol=1e-6)
assert math.isclose(cutting_speed(30, 0.25, 500), 500/30**0.25,   rel_tol=1e-6)

# Fit from clean data
T_data = [5, 10, 20, 40, 80, 160]
V_data = [500/T**0.25 for T in T_data]
n_fit, C_fit = taylor_n_C_from_data(V_data, T_data)
assert math.isclose(n_fit, 0.25,  rel_tol=0.01)
assert math.isclose(C_fit, 500.0, rel_tol=0.01)

print("✓ Challenge 1 passed!")
print(f"  n={n_fit:.4f}, C={C_fit:.2f}")
```

---

**Challenge 2 — Newton cooling solver**

```python
import math

def cooling_temperature(t, T0, T_env, k):
    """T(t) = T_env + (T0-T_env)*e^(-k*t)"""
    pass

def cooling_time(T_target, T0, T_env, k):
    """
    Solve for t when T(t) = T_target.
    Returns None if T_target is outside the reachable range.
    """
    pass

def fit_cooling_constant(t_data, T_data, T_env):
    """
    Fit k from measured (t, T) data and known T_env.
    Linearise: ln(T - T_env) = ln(T0 - T_env) - k*t
    Returns (k, T0).
    """
    pass


# --- tests: do not modify ---
import math

# Basic evaluation
assert math.isclose(cooling_temperature(0,   800, 20, 0.05), 800.0,    rel_tol=1e-9)
assert math.isclose(cooling_temperature(100, 800, 20, 0.05), 20 + 780*math.exp(-5), rel_tol=1e-6)

# Time calculation
t = cooling_time(100, 800, 20, 0.05)
assert math.isclose(cooling_temperature(t, 800, 20, 0.05), 100.0, rel_tol=1e-6)
assert cooling_time(10, 800, 20, 0.05) is None  # below T_env -- unreachable

# Fit from data
t_data = [0, 10, 20, 30, 60, 90]
T_data = [cooling_temperature(t, 800, 20, 0.05) for t in t_data]
k_fit, T0_fit = fit_cooling_constant(t_data, T_data, 20)
assert math.isclose(k_fit,  0.05,  rel_tol=0.01)
assert math.isclose(T0_fit, 800.0, rel_tol=0.01)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — RC circuit designer**

```python
import math

def capacitor_voltage(t, V0, R, C):
    """V(t) = V0 * e^(-t/(R*C))"""
    pass

def min_capacitance(V0, V_min, t_hold, R):
    """
    Find minimum capacitance C so that voltage stays above V_min
    for at least t_hold seconds when discharged through R.
    Solve: V_min = V0 * e^(-t_hold / (R*C)) for C.
    """
    pass


# --- tests: do not modify ---
import math

# Voltage at t=tau should be V0/e
V0, R, C = 12, 1000, 1e-3
tau = R * C
assert math.isclose(capacitor_voltage(tau, V0, R, C), V0/math.e, rel_tol=1e-6)
assert math.isclose(capacitor_voltage(0,   V0, R, C), V0,        rel_tol=1e-9)

# Design: 24V supply, hold above 10V for 50ms, R=100ohm
C_min = min_capacitance(24, 10, 0.050, 100)
assert C_min > 500e-6,  "Need more than 500µF"
assert C_min < 700e-6,  "Should be under 700µF"
# Verify: with C_min, voltage at t=50ms is exactly 10V
assert math.isclose(capacitor_voltage(0.050, 24, 100, C_min), 10.0, rel_tol=1e-5)

print("✓ Challenge 3 passed!")
print(f"  Min capacitance: {C_min*1e6:.1f} µF")
print(f"  Choose standard: 680 µF")
```

---

### Extension

**4. ★** The **extended Taylor equation** includes the effect of depth
of cut $d$ and feed rate $f$:

$$V T^n d^x f^y = C$$

Taking $\ln$ of both sides and rearranging:

$$\ln T = \frac{1}{n}\ln C - \frac{1}{n}\ln V - \frac{x}{n}\ln d - \frac{y}{n}\ln f$$

This is a **multiple linear regression** problem in the variables
$(\ln V, \ln d, \ln f)$.

(a) Given the following experimental data, set up the system of equations
to solve for $n$, $x$, $y$, and $C$ using `np.linalg.lstsq`.

```python
import numpy as np

# Each row: [V, d, f, T] -- speed, depth, feed, tool life
data = np.array([
    [200, 2, 0.2, 15.0],
    [150, 2, 0.2, 38.2],
    [200, 3, 0.2,  9.1],
    [200, 2, 0.3,  8.4],
    [150, 3, 0.3, 14.7],
    [100, 1, 0.1, 98.3],
])

V, d, f, T = data[:,0], data[:,1], data[:,2], data[:,3]

# Build the matrix A where each row is [1, -ln(V), -ln(d), -ln(f)]
# and the target vector b = ln(T)
# Then A @ [ln(C)/n, 1/n, x/n, y/n] = ln(T)
A = np.column_stack([
    np.ones(len(V)),    # intercept: ln(C)/n
    -np.log(V),         # coefficient of ln(V): 1/n... wait
    # your code here: fill in -ln(d) and -ln(f) columns
])
b = np.log(T)

# Solve using least squares
# np.linalg.lstsq(A, b, rcond=None) returns (solution, residuals, rank, singular_values)
solution, *_ = np.linalg.lstsq(A, b, rcond=None)
print("Solution:", solution)
# Recover n, x, y, C from the solution vector
```

(b) What does this model predict for tool life at $V=180$, $d=2.5$, $f=0.25$?

