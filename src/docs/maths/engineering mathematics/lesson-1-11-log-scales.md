# Stage 1, Lesson 1.11 — Logarithmic Scales: Decibels, pH, and the Richter Scale
**Threads:** Math · Physics  
**Estimated time:** 50–60 minutes

---

## What This Lesson Is About

Some physical quantities span such an enormous range that a linear scale
becomes useless. Sound pressure at a rock concert is about 1,000,000
times greater than the threshold of human hearing. The hydrogen ion
concentration in battery acid is $10^{13}$ times greater than in bleach.
A magnitude-9 earthquake releases roughly $10^{15}$ times more energy
than a barely-perceptible magnitude-2 tremor. No graph, no ruler, no
instrument dial could show all these quantities on one linear scale.
Logarithms solve this by converting multiplication into addition: a
scale that spans $10^{14}$ in linear space spans only 14 on a log scale.
By the end of this lesson you will understand exactly why each log scale
is defined the way it is, be able to convert between the scale value and
the underlying physical quantity, compute how much greater one measurement
is than another, and critically evaluate claims like "this machine is
twice as loud" — which turns out to mean something very specific and often
surprising.

---

## Historical Context

The decibel scale was developed by Bell Telephone Laboratories in the
1920s to measure signal loss along telephone cables — the "bel" (later
split into tenths, "decibels") was named after Alexander Graham Bell.
The pH scale was introduced by the Danish chemist Søren Sørensen in
1909, who was standardising enzyme reactions at the Carlsberg Laboratory
(yes, the brewery). He originally wrote it as $p_H$, with $p$ from
the Danish *potenz* (power) and $H$ for hydrogen. The Richter scale
was developed by Charles Richter and Beno Gutenberg in 1935 at Caltech,
where Richter famously refused to let journalists use it for anything
larger than magnitude 7 because he thought public understanding of the
scale was too poor.

---

## What You Need To Know First

- **Logarithm laws** — Lesson 1.9. The scales in this lesson are all
  applications of $\log_{10}$.
- **Solving logarithmic equations** — Lesson 1.10. Converting between
  the scale value and the physical quantity.

---

## The Lesson

### Why Logarithmic Scales?

**The core problem:** human perception of sensation is roughly logarithmic.
A sound that is 10 times more intense does not sound 10 times louder —
it sounds about twice as loud. Doubling perceived loudness requires a
roughly 10-fold increase in intensity. Weber and Fechner formalised this
in the 19th century: perceived sensation $\propto \log(\text{stimulus})$.

A logarithmic scale matches the way we actually experience quantities.
It also compresses enormous ranges into manageable numbers. Both reasons
justify building log scales into science and engineering.

```python
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: linear scale -- most data piled at the bottom
quantities = [1e-12, 1e-10, 1e-6, 1e-3, 1, 100]
labels     = ['Threshold', 'Whisper', 'Quiet room', 'Conversation', 'Concert', 'Jet']

axes[0].barh(labels, quantities, color='#2980b9', alpha=0.8)
axes[0].set_xlabel('Sound intensity (W/m²)')
axes[0].set_title('Linear scale\n(all quiet sounds invisible)', fontsize=11)
axes[0].grid(True, alpha=0.3, axis='x')

# Right: same data on log scale -- all values visible
axes[1].barh(labels, quantities, color='#e74c3c', alpha=0.8)
axes[1].set_xscale('log')
# ax.set_xscale('log'): logarithmic x-axis -- same data, all visible now
axes[1].set_xlabel('Sound intensity (W/m²) — log scale')
axes[1].set_title('Logarithmic scale\n(all values clearly visible)', fontsize=11)
axes[1].grid(True, alpha=0.3, axis='x')

plt.suptitle('Why logarithmic scales: linear fails when data spans 14 orders of magnitude',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `axes[1].set_xscale('log')` switches the $x$-axis
to logarithmic after the plot — the same data, presented on a log scale,
suddenly makes all values visible. On the linear scale, every bar except
the last two is indistinguishably close to zero.

---

### Decibels

The **decibel (dB)** scale measures sound level. There are two equivalent
forms depending on whether you measure pressure or intensity:

$$L = 20 \log_{10}\!\frac{p}{p_0} \quad \text{(pressure form)}$$

$$L = 10 \log_{10}\!\frac{I}{I_0} \quad \text{(intensity form)}$$

where:
- $p_0 = 20\ \mu\text{Pa} = 2 \times 10^{-5}\ \text{Pa}$ — threshold of human hearing (pressure)
- $I_0 = 10^{-12}\ \text{W/m}^2$ — threshold of human hearing (intensity)

The factor of 20 (not 10) in the pressure form arises because intensity
is proportional to pressure squared ($I \propto p^2$), so
$10\log_{10}(I/I_0) = 10\log_{10}(p/p_0)^2 = 20\log_{10}(p/p_0)$.

**Key reference values:**

| Sound | dB | Pressure (Pa) |
|-------|----|---------------|
| Threshold of hearing | 0 | $2 \times 10^{-5}$ |
| Whisper | 20 | $2 \times 10^{-4}$ |
| Normal conversation | 60 | $0.02$ |
| CNC machining centre | 90 | $0.632$ |
| Pain threshold | 120 | $20$ |
| Jet engine (30 m) | 140 | $200$ |

**The key insight:** every 20 dB increase multiplies pressure by 10.
Every 6 dB increase roughly doubles pressure.

**Converting backwards** (dB → pressure):

$$p = p_0 \cdot 10^{L/20}$$

**Comparing two sounds:** if one source is $L_1$ dB and another $L_2$ dB:

$$\frac{p_1}{p_2} = 10^{(L_1 - L_2)/20}$$

**Hand-worked examples:**

(a) A machine runs at 90 dB. A second identical machine is added.
What is the combined level?

Combined intensity doubles: $I_\text{total} = 2I$. In dB:
$$L = 10\log_{10}\!\frac{2I}{I_0} = 10\log_{10} 2 + 10\log_{10}\!\frac{I}{I_0} = 10\log_{10} 2 + 90 \approx 3.01 + 90 = 93 \text{ dB}$$

Adding an identical source adds about 3 dB — not double.

(b) How much greater is the pressure at 90 dB vs 60 dB?

$$\frac{p_{90}}{p_{60}} = 10^{(90-60)/20} = 10^{1.5} \approx 31.6$$

A factor of ~32 in pressure, only 30 dB difference.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

p0 = 20e-6   # Pa

def pressure_to_dB(p):
    return 20 * math.log10(p / p0)

def dB_to_pressure(L):
    return p0 * 10**(L / 20)
    # 10**(L/20): raise 10 to the power L/20

# Reference table
print(f"{'Sound':>25} {'Pressure (Pa)':>16} {'dB':>8}")
print("-" * 55)
sources = [
    ("Threshold",         2e-5),
    ("Whisper",           2e-4),
    ("Quiet office",      6.3e-4),
    ("Conversation",      2e-2),
    ("CNC mill (light)",  2e-1),
    ("CNC mill (heavy)",  6.32e-1),
    ("OSHA 8hr limit",    3.56e-1),
    ("Pain threshold",    20.0),
]
for label, p in sources:
    dB = pressure_to_dB(p)
    print(f"{label:>25} {p:>16.2e} {dB:>8.1f}")

print()
# Visualise dB scale
fig, ax = plt.subplots(figsize=(10, 6))
dB_vals = np.linspace(0, 140, 400)
pressure = p0 * 10**(dB_vals/20)

ax.plot(dB_vals, pressure, color='#2980b9', lw=2.5)
ax.set_yscale('log')   # log y-axis: both axes needed to show the linear relationship

for label, p in sources[::2]:  # every other point to avoid crowding
    dB = pressure_to_dB(p)
    ax.plot(dB, p, 'o', color='#e74c3c', markersize=8, zorder=5)
    ax.text(dB+1, p, label, fontsize=8, va='center')

ax.set_xlabel('Sound level $L$ (dB)')
ax.set_ylabel('Sound pressure $p$ (Pa) — log scale')
ax.set_title('$p = p_0 \\cdot 10^{L/20}$: converting dB to pressure', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `ax.set_yscale('log')` makes the $y$-axis logarithmic.
Combined with a linear $x$-axis (dB), the exponential relationship
$p = p_0 \cdot 10^{L/20}$ appears as a straight line — because $\log p$
is a linear function of $L$. `sources[::2]` slices every other element
of the list — the `::2` step skips one entry between each selected one
to reduce label crowding.

---

### pH

The **pH scale** measures the acidity of a solution:

$$\text{pH} = -\log_{10}[\text{H}^+]$$

where $[\text{H}^+]$ is the hydrogen ion concentration in mol/L.
The negative sign means larger pH = lower $[\text{H}^+]$ = more basic.

**Reference values:**

| Solution | $[\text{H}^+]$ (mol/L) | pH |
|----------|-----------------------|----|
| Battery acid | $10^{-1}$ | 1 |
| Lemon juice | $3.16 \times 10^{-3}$ | 2.5 |
| Coffee | $10^{-5}$ | 5 |
| Pure water | $10^{-7}$ | 7 (neutral) |
| Blood | $3.98 \times 10^{-8}$ | 7.4 |
| Baking soda | $3.16 \times 10^{-9}$ | 8.5 |
| Bleach | $10^{-12}$ | 12 |

**Converting backwards:**

$$[\text{H}^+] = 10^{-\text{pH}}$$

**Comparing two solutions:** a difference of $\Delta$pH means:

$$\frac{[\text{H}^+]_1}{[\text{H}^+]_2} = 10^{\Delta\text{pH}}$$

Each unit of pH = factor of 10 in $[\text{H}^+]$. Battery acid (pH 1) has
$10^6 = 1{,}000{,}000$ times the hydrogen ion concentration of pure water (pH 7).

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def pH_to_concentration(pH):
    return 10**(-pH)    # [H+] = 10^(-pH)

def concentration_to_pH(H):
    return -math.log10(H)

# Visualise the pH scale as a number line
fig, ax = plt.subplots(figsize=(13, 4))

pH_range = np.linspace(0, 14, 1000)
# Colour from red (acid) to blue (base)
colors = plt.cm.RdYlBu(pH_range / 14)
# plt.cm.RdYlBu: Red-Yellow-Blue colormap, accessed as a callable
# dividing by 14 maps pH [0,14] to the [0,1] colormap range

for i in range(len(pH_range) - 1):
    ax.fill_between([pH_range[i], pH_range[i+1]], 0, 1,
                    color=colors[i], alpha=0.8)

# Annotate key substances
substances = [
    (1,   'Battery\nacid'),
    (2.5, 'Lemon'),
    (5,   'Coffee'),
    (7,   'Water'),
    (7.4, 'Blood'),
    (8.5, 'Baking\nsoda'),
    (12,  'Bleach'),
]
for ph, label in substances:
    ax.plot(ph, 0.5, 'v', color='black', markersize=10, zorder=5)
    ax.text(ph, -0.15, f'{label}\npH={ph}', ha='center', fontsize=7.5, va='top')

ax.set_xlim(0, 14); ax.set_ylim(-0.5, 1.2)
ax.set_xlabel('pH', fontsize=12)
ax.set_title('pH scale: each unit = factor of 10 in $[H^+]$ concentration\n'
             '$\\text{pH} = -\\log_{10}[H^+]$', fontsize=11)
ax.set_yticks([])   # hide y-axis ticks: not meaningful here
ax.text(2, 1.1, 'ACIDIC', ha='center', color='#c0392b', fontweight='bold')
ax.text(7, 1.1, 'NEUTRAL', ha='center', color='#888888', fontweight='bold')
ax.text(12, 1.1, 'BASIC', ha='center', color='#2980b9', fontweight='bold')
ax.grid(True, alpha=0.2, axis='x')
plt.tight_layout()
plt.show()

# Numerical examples
print("pH comparison:")
for label, pH in [("battery acid", 1), ("coffee", 5), ("water", 7)]:
    H = pH_to_concentration(pH)
    print(f"  {label} (pH={pH}): [H+] = {H:.2e} mol/L")
print()
print("Battery acid vs water: H+ ratio =",
      pH_to_concentration(1) / pH_to_concentration(7))
```

**Walkthrough:** `plt.cm.RdYlBu` is a **colormap** — a function that
maps values in $[0,1]$ to RGBA colours, going from red through yellow
to blue. `plt.cm.RdYlBu(pH_range / 14)` evaluates this at 1000 evenly
spaced points, returning an array of colours. `ax.fill_between` draws
thin vertical coloured strips, one per consecutive pH pair, creating
a smooth gradient across the scale. `ax.set_yticks([])` removes the
$y$-axis tick marks since the $y$-axis has no quantitative meaning here —
the strip is just for visual display.

---

### The Richter Scale

The **Richter magnitude** measures ground motion amplitude in an
earthquake:

$$M = \log_{10}\!\frac{A}{A_0}$$

where $A$ is the measured amplitude (in micrometres, recorded on a
standard seismograph at 100 km) and $A_0 = 1\ \mu\text{m}$ is a
reference amplitude.

Each integer increase in magnitude means 10 times the ground amplitude.
But energy scales even more steeply — each unit of magnitude corresponds
to roughly $10^{1.5} \approx 31.6$ times more energy released:

$$E \propto 10^{1.5M}$$

So a magnitude-8 earthquake releases $10^{1.5 \times 2} = 10^3 = 1000$
times more energy than a magnitude-6 earthquake, even though the
magnitude numbers differ by only 2.

**Hand-worked example:** An M6 earthquake is recorded. An M8 earthquake
occurs in the same region. How much greater is the amplitude? The energy?

- Amplitude: $10^{8-6} = 10^2 = 100$ times greater
- Energy: $10^{1.5 \times 2} = 10^3 = 1000$ times greater

```python
import numpy as np
import matplotlib.pyplot as plt
import math

magnitudes = np.linspace(1, 9, 400)
amplitude  = 10**magnitudes          # A = A0 * 10^M
energy     = 10**(1.5 * magnitudes)  # E proportional to 10^(1.5M)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: amplitude vs magnitude
axes[0].semilogy(magnitudes, amplitude, color='#e74c3c', lw=2.5)
# ax.semilogy: logarithmic y-axis, linear x-axis
# straight line on this plot confirms A = 10^M (exponential in M)

earthquakes = [(2,'Minor'),(4,'Light'),(6,'Strong'),(8,'Great')]
for M, label in earthquakes:
    A = 10**M
    axes[0].plot(M, A, 'o', color='#2980b9', markersize=9, zorder=5)
    axes[0].text(M+0.1, A, f'M{M}: {label}', fontsize=8, va='center')

axes[0].set_xlabel('Richter magnitude $M$')
axes[0].set_ylabel('Ground amplitude (relative) — log scale')
axes[0].set_title('$A = 10^M$: each unit = ×10 in amplitude', fontsize=11)
axes[0].grid(True, alpha=0.3)

# Right: energy vs magnitude — steeper slope
axes[1].semilogy(magnitudes, energy, color='#8e44ad', lw=2.5)
for M, label in earthquakes:
    E = 10**(1.5*M)
    axes[1].plot(M, E, 'o', color='#e67e22', markersize=9, zorder=5)
    axes[1].text(M+0.1, E, f'M{M}', fontsize=8, va='center')

axes[1].set_xlabel('Richter magnitude $M$')
axes[1].set_ylabel('Energy released (relative) — log scale')
axes[1].set_title('$E \\propto 10^{1.5M}$: each unit = ×31.6 in energy', fontsize=11)
axes[1].grid(True, alpha=0.3)

plt.suptitle('Richter scale: amplitude and energy scale very differently',
             fontsize=12)
plt.tight_layout()
plt.show()

print("Richter scale comparisons:")
for M1, M2 in [(6,8),(5,7),(4,8)]:
    amp_ratio    = 10**(M2-M1)
    energy_ratio = 10**(1.5*(M2-M1))
    print(f"  M{M2} vs M{M1}: amplitude ×{amp_ratio:,.0f}, energy ×{energy_ratio:,.0f}")
```

**Walkthrough:** `axes[0].semilogy(...)` plots with a logarithmic
$y$-axis and linear $x$-axis — the exponential $A = 10^M$ appears
as a straight line because $\log_{10}(10^M) = M$, which is linear in $M$.
`axes[1].semilogy` does the same for $E \propto 10^{1.5M}$, which appears
as a steeper straight line (slope 1.5 on the log-linear plot vs slope 1).
The visual comparison makes immediately clear why energy scaling matters
more than amplitude scaling.

---

### Comparing Measurements: The General Formula

All three scales have the same mathematical structure. If two measurements
on a log scale differ by $\Delta$, the ratio of the underlying physical
quantities is:

| Scale | $\Delta$ units | Physical ratio |
|-------|---------------|----------------|
| Decibels (dB, pressure) | $\Delta L$ | $10^{\Delta L/20}$ |
| Decibels (dB, intensity) | $\Delta L$ | $10^{\Delta L/10}$ |
| pH | $\Delta\text{pH}$ | $10^{\Delta\text{pH}}$ (in $[\text{H}^+]$) |
| Richter (amplitude) | $\Delta M$ | $10^{\Delta M}$ |
| Richter (energy) | $\Delta M$ | $10^{1.5\,\Delta M}$ |

In every case: **log scale difference → power of 10 ratio in reality**.

```python
import math

print("How much greater is the physical quantity?\n")
print(f"{'Scale':>20} {'Difference':>12} {'Physical ratio':>18}")
print("-" * 55)

comparisons = [
    ("dB (pressure)",  20,  10**(20/20)),
    ("dB (pressure)",  60,  10**(60/20)),
    ("dB (intensity)", 20,  10**(20/10)),
    ("pH",             3,   10**3),
    ("pH",             7,   10**7),
    ("Richter (amp)",  2,   10**2),
    ("Richter (energy)",2,  10**(1.5*2)),
]
for label, diff, ratio in comparisons:
    print(f"{label:>20} {diff:>12} {ratio:>18,.1f}")
```

---

## Connect the Pieces

**What this lesson built on:** $\log_{10}$ (Lesson 1.9) — all three
scales use base-10 logarithms. Solving log equations (Lesson 1.10) —
converting between the scale value and the underlying quantity is solving
$\log_{10}(x/x_0) = L$ for $x$.

**What this lesson makes possible:** Stage 2 (Trigonometry) introduces
log-log and semi-log plots, which are the standard graphical tool for
any data following a power law or exponential law. Stage 7 (Signals and
Systems) builds on the decibel scale for frequency response analysis.

**In manufacturing:** machine noise is regulated by OSHA in decibels;
cutting fluid pH must be maintained in a specific range to prevent
corrosion and bacterial growth; vibration levels in machining are sometimes
reported on log scales. All three scales from this lesson appear in daily
manufacturing practice.

---

## Summary

**Decibels (pressure):** $L = 20\log_{10}(p/p_0)$, $p_0 = 20\ \mu$Pa.
Inverse: $p = p_0 \cdot 10^{L/20}$. Each 20 dB = ×10 in pressure.

**pH:** $\text{pH} = -\log_{10}[\text{H}^+]$.
Inverse: $[\text{H}^+] = 10^{-\text{pH}}$. Each unit = ×10 in $[\text{H}^+]$.

**Richter:** $M = \log_{10}(A/A_0)$.
Each unit = ×10 in amplitude; ×31.6 in energy.

**Universal pattern:** log scale difference $\Delta$ → physical ratio $10^\Delta$
(with appropriate scaling factor).

**New Python:**
- `plt.cm.RdYlBu` — a red-yellow-blue colormap callable
- `axes.semilogy(...)` — logarithmic $y$-axis, linear $x$-axis
- `ax.set_yticks([])` — remove $y$-axis tick marks
- `sources[::2]` — slice every other element of a list

---

## Problems

### Math

**1.** Convert each sound pressure to decibels.

(a) $p = 2 \times 10^{-3}$ Pa &emsp;
(b) $p = 6.32$ Pa &emsp;
(c) $p = 2 \times 10^{-5}$ Pa

<details>
<summary>Answers</summary>

(a) $L = 20\log_{10}(2\times10^{-3}/2\times10^{-5}) = 20\log_{10}(100) = 40$ dB

(b) $L = 20\log_{10}(6.32/2\times10^{-5}) = 20\log_{10}(316000) \approx 110$ dB

(c) $L = 20\log_{10}(1) = 0$ dB (threshold of hearing)

</details>

---

**2.** A solution has pH = 3.7. Find its $[\text{H}^+]$ concentration.
How does this compare to pure water (pH = 7)?

<details>
<summary>Answer</summary>

$[\text{H}^+] = 10^{-3.7} \approx 2.0 \times 10^{-4}$ mol/L.

Compared to water: $10^{7-3.7} = 10^{3.3} \approx 2000$ times more acidic.

</details>

---

**3.** The 2011 Tōhoku earthquake was magnitude 9.1. The 1994 Northridge
earthquake was magnitude 6.7. How many times greater was the amplitude?
The energy?

<details>
<summary>Answer</summary>

$\Delta M = 9.1 - 6.7 = 2.4$.

Amplitude ratio: $10^{2.4} \approx 251$.

Energy ratio: $10^{1.5 \times 2.4} = 10^{3.6} \approx 3981$.

</details>

---

**4.** (Proof) Prove that adding $n$ identical independent sound sources,
each at level $L$ dB, produces a combined level of $L + 10\log_{10}(n)$ dB.

<details>
<summary>Answer</summary>

Each source has intensity $I = I_0 \cdot 10^{L/10}$. The total intensity
of $n$ independent sources is $nI = n I_0 \cdot 10^{L/10}$.
The combined level is:
$$L_n = 10\log_{10}\frac{nI}{I_0} = 10\log_{10}(n \cdot 10^{L/10})
= 10\log_{10}(n) + 10 \cdot \frac{L}{10} = L + 10\log_{10}(n)$$
$\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Log scale converter**

```python
import math

def dB_to_pressure(L, p0=20e-6):
    """Convert sound level L (dB) to pressure (Pa)."""
    pass

def pressure_to_dB(p, p0=20e-6):
    """Convert pressure p (Pa) to sound level (dB)."""
    pass

def pH_to_concentration(pH):
    """Convert pH to [H+] concentration (mol/L)."""
    pass

def concentration_to_pH(H):
    """Convert [H+] concentration to pH."""
    pass

def richter_amplitude_ratio(M1, M2):
    """Return amplitude ratio A2/A1 for earthquakes of magnitude M1 and M2."""
    pass

def richter_energy_ratio(M1, M2):
    """Return energy ratio E2/E1 for earthquakes of magnitude M1 and M2."""
    pass


# --- tests: do not modify ---
assert math.isclose(pressure_to_dB(20e-6),  0.0,   abs_tol=0.001)
assert math.isclose(pressure_to_dB(2e-4),   20.0,  abs_tol=0.001)
assert math.isclose(dB_to_pressure(0),       20e-6, rel_tol=1e-6)
assert math.isclose(dB_to_pressure(60),      0.02,  rel_tol=1e-4)
assert math.isclose(pH_to_concentration(7),  1e-7,  rel_tol=1e-6)
assert math.isclose(concentration_to_pH(1e-5), 5.0, rel_tol=1e-6)
assert math.isclose(richter_amplitude_ratio(6, 8), 100.0, rel_tol=1e-6)
assert math.isclose(richter_energy_ratio(6, 8),    1000.0, rel_tol=1e-4)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Combining sound sources**

```python
import math

def combine_dB(levels):
    """
    Compute the combined sound level (dB) from multiple independent sources.
    
    When independent sources combine, intensities (not pressures) add:
    I_total = I1 + I2 + ...
    L_total = 10 * log10(sum(10^(Li/10) for Li in levels))
    
    levels: list of individual dB levels
    Returns: combined dB level
    """
    pass


# --- tests: do not modify ---
# Two identical 80 dB sources -> ~83 dB
assert math.isclose(combine_dB([80, 80]),     83.01, abs_tol=0.01)
# Three sources at 70 dB -> 70 + 10*log10(3) = ~74.77 dB
assert math.isclose(combine_dB([70,70,70]),   74.77, abs_tol=0.01)
# Single source unchanged
assert math.isclose(combine_dB([65]),         65.0,  abs_tol=0.01)
# Very different levels: dominated by the louder
assert math.isclose(combine_dB([90, 60]),     90.00, abs_tol=0.1)

print("✓ Challenge 2 passed!")
print(f"  Two 80 dB sources:  {combine_dB([80,80]):.2f} dB")
print(f"  Four 80 dB sources: {combine_dB([80,80,80,80]):.2f} dB")
print(f"  Ten 80 dB sources:  {combine_dB([80]*10):.2f} dB")
```

---

**Challenge 3 — Visualise all three scales**

Build a three-panel figure showing decibels, pH, and Richter magnitude on
the same style of visualisation: a horizontal scale coloured by intensity,
with annotated real-world reference points.

```python
import matplotlib.pyplot as plt
import numpy as np

# Your code here.
# Each panel: horizontal coloured bar from min to max,
# with reference points marked below using ax.plot and ax.text.
# Use ax.set_yticks([]) to hide the meaningless y-axis.
# Suggested colourmaps:
#   dB:      plt.cm.Greys  (quiet=white, loud=black)
#   pH:      plt.cm.RdYlBu (acid=red, base=blue)
#   Richter: plt.cm.YlOrRd (small=yellow, large=red)
```

---

### Extension

**4. ★** The **Fletcher-Munson curves** (equal-loudness contours) show
that human hearing is not equally sensitive across all frequencies — we
are most sensitive around 3–4 kHz and much less sensitive at very low
or high frequencies.

At 1000 Hz, 0 dB SPL is the threshold of hearing.
At 100 Hz, about 20 dB SPL is needed to sound equally loud.
At 50 Hz, about 40 dB SPL is needed.

(a) What is the pressure ratio at 100 Hz vs 1000 Hz for "equal loudness"?

(b) What is the pressure ratio at 50 Hz vs 1000 Hz?

(c) Explain in terms of the log scale why "twice as loud" does not mean
"twice the decibels."

<details>
<summary>Answers</summary>

(a) $10^{20/20} = 10$ — you need 10 times more pressure at 100 Hz to
achieve the same perceived loudness as at 1000 Hz.

(b) $10^{40/20} = 100$ — 100 times more pressure at 50 Hz.

(c) "Twice as loud" in perception corresponds to about +10 dB, which
is a factor of $10^{10/20} \approx 3.16$ in pressure and a factor of 10
in intensity. Doubling the decibel number (e.g., going from 40 to 80 dB)
means a pressure increase by $10^{40/20} = 10{,}000$, not 2. The log scale
maps perception (which is roughly logarithmic) to numbers, so arithmetic
on dB values does not correspond to arithmetic on pressures.

</details>
