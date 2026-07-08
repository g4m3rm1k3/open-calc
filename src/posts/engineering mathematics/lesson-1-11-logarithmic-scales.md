# Stage 1, Lesson 1.11 — Logarithmic Scales: Decibels, pH, and Richter
**Threads:** Math · Physics · CS  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Some quantities vary over ranges so enormous that a linear scale is
useless for comparing them. Sound intensity ranges from the threshold
of hearing at $10^{-12}$ W/m² to a jet engine at $10^2$ W/m² — a
factor of $10^{14}$. Hydrogen ion concentration in solutions ranges
from $10^{-14}$ mol/L to $10^0 = 1$ mol/L. Earthquake energy spans
factors of $10^{20}$ between barely detectable tremors and the largest
recorded events. In each case, plotting the values on a linear axis
would make most of the range invisible. The solution is a logarithmic
scale: compress the enormous range by applying $\log_{10}$, which
converts factors of 10 into equal intervals of 1. This lesson derives
three of the most important logarithmic scales — decibels, pH, and
Richter magnitude — from first principles, and shows how to interpret
them, convert between them, and compute with them. By the end you can
explain why a 10 dB increase sounds twice as loud (approximately),
why a pH difference of 1 means 10 times more acidic, and why each
Richter unit represents about 32 times more energy.

---

## Historical Context

The decibel was developed in the 1920s at Bell Telephone Laboratories
to describe signal power loss in telephone cables. The name honours
Alexander Graham Bell, though Bell himself never used it. Engineers
found that the human ear perceives loudness approximately
**logarithmically** — a doubling of intensity does not sound twice as
loud but only slightly louder. This psychoacoustic property, known as
the Weber-Fechner law (1860), established that sensation is proportional
to the logarithm of stimulus — which is why logarithmic scales match
human perception of sound, light, and even earthquakes. Søren Peder
Lauritz Sørensen introduced the pH scale in 1909 to measure acid
concentration in enzyme studies; he chose $-\log_{10}[\text{H}^+]$
precisely because the linear scale was too compressed to be useful.
Charles Richter devised his earthquake magnitude scale in 1935 in
collaboration with Beno Gutenberg, using $\log_{10}$ of wave amplitude
because earthquake amplitudes span $10^5$ or more orders of magnitude.

---

## What You Need To Know First

- **Logarithm base 10** — Lesson 1.9. $\log_{10} x$ converts a power
  of 10 to its exponent: $\log_{10}(10^k) = k$.
- **Logarithm laws** — Lesson 1.9: especially $\log(MN) = \log M + \log N$
  and $\log(M/N) = \log M - \log N$.
- **Exponential equations** — Lesson 1.10. Converting between the
  logarithmic scale value and the original physical quantity requires
  solving $10^L = x$ for $x$ or $\log x = L$ for $x$.

---

## The Lesson

### Why Logarithmic Scales?

The key insight: a logarithmic scale converts **multiplicative changes**
into **additive steps**.

If $I$ doubles (×2), then $\log_{10}(2I) = \log_{10} I + \log_{10} 2
\approx \log_{10} I + 0.301$. Every doubling adds $0.301$ to the log.

If $I$ increases by a factor of 10 (×10), then $\log_{10}(10I) = \log_{10} I + 1$.
Every decade (factor of 10) adds exactly 1 to the log.

This is why a logarithmic scale places $10, 100, 1000, 10000$ at equal
intervals of 1 — they are equally spaced multiplicatively even though
they are enormously spread out linearly.

**Geometric lens:** On a log scale, multiplication becomes translation.
Multiplying by 10 shifts the log value right by 1. Multiplying by 100
shifts by 2. This is the same reason that a slide rule works: sliding
two log scales together physically adds logarithms, which multiplies
the underlying numbers.

```python
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 1, figsize=(12, 6))

# Linear scale: 1 to 10^6
x_linear = np.array([1, 10, 100, 1_000, 10_000, 100_000, 1_000_000])
labels   = ['1', '10', '100', '1K', '10K', '100K', '1M']

axes[0].scatter(x_linear, np.zeros_like(x_linear), s=100, color='#2980b9', zorder=5)
for v, lab in zip(x_linear, labels):
    axes[0].annotate(lab, xy=(v, 0), xytext=(v, 0.1), ha='center', fontsize=9)
axes[0].set_xlim(-50000, 1_100_000)
axes[0].set_ylim(-0.5, 0.5)
axes[0].set_xlabel('Value (linear scale)')
axes[0].set_yticks([])
axes[0].set_title('Linear scale: 1 to 1,000,000 — all small values crushed together')
axes[0].axhline(0, color='#333', lw=1.5)

# Log scale: same values equally spaced
log_vals = np.log10(x_linear)   # 0, 1, 2, 3, 4, 5, 6
axes[1].scatter(log_vals, np.zeros_like(log_vals), s=100, color='#e74c3c', zorder=5)
for v, lab in zip(log_vals, labels):
    axes[1].annotate(lab, xy=(v, 0), xytext=(v, 0.1), ha='center', fontsize=9)
axes[1].set_xlim(-0.5, 6.5)
axes[1].set_ylim(-0.5, 0.5)
axes[1].set_xlabel('$\\log_{10}$(value) — equally spaced')
axes[1].set_yticks([])
axes[1].set_title('Logarithmic scale: same values now equally spaced — each interval is ×10')
axes[1].axhline(0, color='#333', lw=1.5)

plt.suptitle('Logarithmic scaling compresses enormous ranges into equal intervals',
             fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.log10(x_linear)` computes $\log_{10}$ of each
value in `x_linear` element-wise, giving $[0, 1, 2, 3, 4, 5, 6]$.
The top panel plots the values on a linear axis — points at 1, 10,
100 are squashed near the left while 1,000,000 is far right. The
bottom panel plots the log values $[0,1,2,3,4,5,6]$ — now evenly
spaced. `np.zeros_like(x_linear)` creates an array of zeros the same
shape as `x_linear`, placing all points on the horizontal axis.

---

### The Decibel Scale

**Problem this solves:** sound intensity varies over $10^{14}$ in the
range of human hearing. We need a scale where quiet office sounds
and jet engines are both legible.

**Definition:**

$$L = 10 \log_{10}\!\left(\frac{I}{I_0}\right) \text{ dB}$$

where:
- $L$ is the sound level in **decibels (dB)**
- $I$ is the intensity of the sound in W/m²
- $I_0 = 10^{-12}$ W/m² is the **reference intensity** (threshold of hearing)

**Why 10?** The factor of 10 converts **bels** (the natural unit from
Bell Labs) to decibels, giving more convenient numbers — a comfortable
conversation is about 6 bels, or 60 dB.

**Formal lens:** the decibel is not a unit of sound — it is a dimensionless
number (a ratio). Two sounds are compared by their intensity ratio
$I/I_0$; the decibel is simply $10\log_{10}$ of that ratio.

**Key values:**

| Situation | $I$ (W/m²) | dB |
|-----------|-----------|-----|
| Threshold of hearing | $10^{-12}$ | 0 |
| Whisper | $10^{-10}$ | 20 |
| Office | $10^{-6}$ | 60 |
| Conversation | $10^{-5}$ | 70 |
| Loud music | $10^{-2}$ | 100 |
| Jet engine | $10^{2}$ | 140 |

**Inverse formula:** given dB, find intensity:

$$I = I_0 \cdot 10^{L/10}$$

**Effect of doubling intensity:**

$$\Delta L = 10\log_{10}\!\left(\frac{2I}{I}\right) = 10\log_{10}(2) \approx 10 \times 0.301 = 3.01 \text{ dB}$$

Doubling intensity adds approximately **3 dB**. This means "3 dB louder"
means "twice the intensity." A 10 dB increase is $10\times$ the intensity
(not $10\times$ the loudness — see below under Weber-Fechner).

**Adding two sources:** if two independent sources each have intensity $I$,
the combined intensity is $2I$, adding ~3 dB — not doubling the dB value.

**Hand-worked example:** A room has background noise at 50 dB. A machine
turns on, adding 50 dB more. What is the combined level?

Both sources have $I = I_0 \cdot 10^{50/10} = I_0 \cdot 10^5$.
Combined: $2I_0 \cdot 10^5$.

$$L = 10\log_{10}\!\left(\frac{2 I_0 \cdot 10^5}{I_0}\right)
    = 10\log_{10}(2 \times 10^5)
    = 10(\log_{10} 2 + 5) \approx 10(0.301 + 5) = 53.01 \text{ dB}$$

The combined level is about 53 dB — not 100 dB. Adding identical
sources in dB is never additive; you must add intensities, then
convert back.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

I0 = 1e-12   # reference intensity (W/m^2)

def intensity_to_dB(I, I_ref=I0):
    """Convert intensity I (W/m^2) to decibels."""
    if I <= 0: raise ValueError("Intensity must be positive")
    return 10 * math.log10(I / I_ref)

def dB_to_intensity(L, I_ref=I0):
    """Convert decibel level L to intensity (W/m^2)."""
    return I_ref * 10**(L / 10)

def combine_dB_sources(*levels):
    """
    Combine multiple dB sources correctly:
    convert each to intensity, sum, convert back.
    """
    total_intensity = sum(dB_to_intensity(L) for L in levels)
    return intensity_to_dB(total_intensity)

# Key sound levels
sounds = [
    ("Threshold of hearing",  1e-12, 0),
    ("Whisper",               1e-10, 20),
    ("Office",                1e-6,  60),
    ("Conversation",          1e-5,  70),
    ("Loud music",            1e-2,  100),
    ("Jet engine",            1e2,   140),
]

print(f"{'Source':<24} | {'I (W/m²)':>12} | {'Computed dB':>12} | {'Expected':>10}")
print("-" * 65)
for name, I, expected in sounds:
    L = intensity_to_dB(I)
    print(f"{name:<24} | {I:>12.2e} | {L:>12.2f} | {expected:>10}")

print("\nCombining sources:")
print(f"  Two 50 dB sources: {combine_dB_sources(50, 50):.2f} dB  (not 100 dB)")
print(f"  Three 60 dB sources: {combine_dB_sources(60, 60, 60):.2f} dB")
print(f"  Doubling: +{intensity_to_dB(2*dB_to_intensity(60)) - 60:.2f} dB  (confirming ~3 dB)")

# Plot: dB scale vs linear intensity
I_range = np.logspace(-12, 2, 200)   # 10^-12 to 10^2 W/m^2
dB_range = 10 * np.log10(I_range / I0)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: linear scale -- enormous range
axes[0].plot(I_range, dB_range, color='#2980b9', lw=2)
axes[0].set_xscale('linear')
axes[0].set_xlabel('Intensity I (W/m²) — linear')
axes[0].set_ylabel('Level L (dB)')
axes[0].set_title('Linear intensity scale\nMost sounds invisible near I=0', fontsize=11)
axes[0].grid(True, alpha=0.3)

# Right: log scale -- decibel is linear here
axes[1].plot(I_range, dB_range, color='#e74c3c', lw=2)
axes[1].set_xscale('log')   # logarithmic x-axis
axes[1].set_xlabel('Intensity I (W/m²) — log scale')
axes[1].set_ylabel('Level L (dB)')
axes[1].set_title('Logarithmic intensity scale\ndB is linear here (that\'s the point)', fontsize=11)
axes[1].grid(True, alpha=0.3)

for ax in axes:
    for name, I, L in sounds:
        ax.plot(I, L, 'o', color='#27ae60', markersize=6, zorder=5)

plt.suptitle('Decibels: $L = 10\\log_{10}(I/I_0)$', fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `10**(L/10)` in `dB_to_intensity` uses Python's
exponentiation to compute $10^{L/10}$ without calling `math.pow` —
both work identically for scalar values. `combine_dB_sources(*levels)`
uses `*` to unpack a variable number of arguments; `sum(...)` adds
a generator expression converting each level to intensity.
`ax.set_xscale('log')` switches the $x$-axis to logarithmic scale.

---

### The pH Scale

**Problem this solves:** hydrogen ion concentrations in solutions range
from $10^{-14}$ to 1 mol/L — a factor of $10^{14}$. A linear scale
would hide almost all variation.

**Definition:**

$$\text{pH} = -\log_{10}[\text{H}^+]$$

where $[\text{H}^+]$ is the molar concentration of hydrogen ions (mol/L).
The negative sign is a convention that makes pH positive for the
useful range.

**Key values:**

| Solution | $[\text{H}^+]$ (mol/L) | pH |
|----------|------------------------|-----|
| Hydrochloric acid (1M) | $1 = 10^0$ | 0 |
| Stomach acid | $10^{-2}$ | 2 |
| Lemon juice | $10^{-2.5}$ | 2.5 |
| Coffee | $10^{-5}$ | 5 |
| Pure water | $10^{-7}$ | 7 |
| Blood | $10^{-7.4}$ | 7.4 |
| Baking soda | $10^{-9}$ | 9 |
| Bleach | $10^{-12}$ | 12 |
| NaOH (1M) | $10^{-14}$ | 14 |

**pH < 7** is acidic; **pH = 7** is neutral; **pH > 7** is basic (alkaline).

**Interpretation of pH difference:**

$$\Delta\text{pH} = 1 \implies \frac{[\text{H}^+]_1}{[\text{H}^+]_2} = 10$$

A difference of 1 pH unit means 10 times more (or fewer) hydrogen ions.
A difference of 2 pH units means 100 times. pH is a scale where each unit
is a factor of 10 in acidity.

**Inverse formula:**

$$[\text{H}^+] = 10^{-\text{pH}}$$

**Hand-worked example:** Blood has pH 7.4. Coffee has pH 5.

$$\frac{[\text{H}^+]_{\text{coffee}}}{[\text{H}^+]_{\text{blood}}}
= \frac{10^{-5}}{10^{-7.4}} = 10^{-5-(-7.4)} = 10^{2.4} \approx 251$$

Coffee is about 250 times more acidic than blood.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def pH_to_concentration(pH):
    """Return [H+] in mol/L given pH."""
    return 10**(-pH)   # [H+] = 10^(-pH)

def concentration_to_pH(H_conc):
    """Return pH given [H+] in mol/L."""
    if H_conc <= 0:
        raise ValueError("[H+] must be positive")
    return -math.log10(H_conc)

# Table of common solutions
solutions = [
    ("HCl (1M)",    0),
    ("Stomach acid",2),
    ("Lemon juice", 2.5),
    ("Coffee",      5),
    ("Pure water",  7),
    ("Blood",       7.4),
    ("Seawater",    8),
    ("Baking soda", 9),
    ("Bleach",      12),
    ("NaOH (1M)",   14),
]

print(f"{'Solution':<18} | {'pH':>5} | {'[H+] (mol/L)':>16} | {'Classification'}")
print("-" * 65)
for name, pH in solutions:
    conc = pH_to_concentration(pH)
    classif = "Acidic" if pH < 7 else ("Neutral" if pH == 7 else "Basic")
    print(f"{name:<18} | {pH:>5.1f} | {conc:>16.2e} | {classif}")

print("\nRatio comparisons:")
print(f"  Coffee (pH 5) vs blood (pH 7.4):")
ratio = pH_to_concentration(5) / pH_to_concentration(7.4)
print(f"  [H+] ratio = 10^(7.4-5) = 10^{7.4-5:.1f} = {ratio:.0f}")

# Plot pH scale
pH_vals = np.linspace(0, 14, 300)
H_concs = 10**(-pH_vals)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: pH vs [H+] on linear concentration axis
axes[0].plot(H_concs, pH_vals, color='#2980b9', lw=2.5)
axes[0].set_xlabel('[H⁺] (mol/L) — linear')
axes[0].set_ylabel('pH')
axes[0].set_title('pH vs [H⁺]: the curve compresses\na huge range into 0–14', fontsize=11)
axes[0].grid(True, alpha=0.3)

# Right: pH vs log[H+] — straight line
axes[1].plot(-pH_vals, pH_vals, color='#e74c3c', lw=2.5)
# -pH_vals = log10([H+]) because pH = -log10([H+])
axes[1].set_xlabel('$\\log_{10}$[H⁺]')
axes[1].set_ylabel('pH')
axes[1].set_title('pH = $-\\log_{10}$[H⁺]: perfect straight line\n(pH is a logarithmic scale)', fontsize=11)
axes[1].grid(True, alpha=0.3)

# Mark acid/neutral/base regions
for ax in axes:
    ax.axhline(7, color='#27ae60', lw=1.5, linestyle='--', alpha=0.7, label='Neutral pH=7')
    ax.legend(fontsize=9)

plt.suptitle("pH = $-\\log_{10}$[H⁺]: each pH unit = factor of 10 in acidity", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `10**(-pH)` computes $10^{-\text{pH}}$ using Python's
standard exponentiation. The left plot uses `H_concs = 10**(-pH_vals)`,
which (with numpy) computes $10^{-\text{pH}_i}$ element-wise — the
array `pH_vals` goes from 0 to 14, and `H_concs` goes from $10^0 = 1$
down to $10^{-14}$. The right plot uses `-pH_vals` as the $x$-axis
(which equals $\log_{10}[\text{H}^+]$), giving a straight line — the
hallmark of a logarithmic scale.

---

### The Richter Scale

**Problem this solves:** earthquake amplitudes (and energies) span
$10^5$ or more orders of magnitude. A linear amplitude scale would
make all but the largest earthquakes invisible.

**Definition:** the Richter magnitude of an earthquake is:

$$M = \log_{10}\!\left(\frac{A}{A_0}\right)$$

where $A$ is the maximum amplitude measured by a seismograph at a
standard distance, and $A_0$ is a reference amplitude (the smallest
detectable tremor, approximately $10^{-3}$ mm).

**Interpretation:** each unit of magnitude corresponds to a factor
of **10 in amplitude** and approximately **32 in energy**.

The energy relationship: $E \propto 10^{1.5M}$, so:

$$\Delta M = 1 \implies \frac{E_2}{E_1} = 10^{1.5} \approx 31.6 \approx 32$$

One magnitude unit = 32 times more energy. Two units = $32^2 \approx 1000$
times more energy. This is why a magnitude 8 earthquake releases about
1000 times more energy than a magnitude 6.

**Key scale:**

| Magnitude | Approximate effect |
|-----------|--------------------|
| $< 2$ | Microearthquake, not felt |
| 3 | Often felt, rarely causes damage |
| 5 | Moderate: some damage |
| 6 | Strong: destructive in populated areas |
| 7 | Major: serious damage over large areas |
| 8+ | Great: devastating; 2011 Tōhoku was 9.0 |

**Hand-worked example:** compare a M6 and a M8 earthquake.

Amplitude ratio: $10^{8-6} = 10^2 = 100$ (the M8 has 100× the amplitude).

Energy ratio: $10^{1.5 \times (8-6)} = 10^3 = 1000$ (the M8 has 1000× the energy).

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def richter_amplitude_ratio(M1, M2):
    """Ratio of amplitudes: M2 amplitude / M1 amplitude."""
    return 10**(M2 - M1)

def richter_energy_ratio(M1, M2):
    """Ratio of energies: E(M2) / E(M1). Uses E ∝ 10^(1.5*M)."""
    return 10**(1.5 * (M2 - M1))

print("Richter scale comparisons:")
print(f"\n{'Comparison':>30} | {'Amplitude ratio':>16} | {'Energy ratio':>14}")
print("-" * 66)
pairs = [
    (3, 4, "M4 vs M3"),
    (5, 6, "M6 vs M5"),
    (6, 7, "M7 vs M6"),
    (6, 8, "M8 vs M6"),
    (7, 9, "M9 vs M7 (2011 Tōhoku vs typical major)"),
]
for M1, M2, label in pairs:
    amp = richter_amplitude_ratio(M1, M2)
    eng = richter_energy_ratio(M1, M2)
    print(f"{label:>30} | {amp:>16,.0f}× | {eng:>14,.1f}×")

# Plot: energy vs magnitude
M_vals = np.linspace(2, 9, 200)
# Relative energy (M=2 as reference = 1)
E_rel = 10**(1.5 * (M_vals - 2))

fig, ax = plt.subplots(figsize=(9, 6))
ax.semilogy(M_vals, E_rel, color='#e74c3c', lw=2.5)
# semilogy: y-axis is logarithmic -- appropriate since E grows exponentially in M

# Mark key earthquakes
notable = [
    (3.0,  "Minor",    '#aaaaaa'),
    (5.0,  "Moderate", '#27ae60'),
    (7.0,  "Major",    '#e67e22'),
    (9.0,  "2011 Tōhoku", '#e74c3c'),
]
for M, label, color in notable:
    E = 10**(1.5*(M-2))
    ax.scatter([M], [E], s=100, color=color, zorder=6)
    ax.annotate(f'M{M:.0f}: {label}\n{E:,.0f}× energy',
                xy=(M, E), xytext=(M+0.1, E*2),
                fontsize=8, color=color)

ax.set_xlabel('Richter Magnitude')
ax.set_ylabel('Relative Energy (M=2 = 1)')
ax.set_title('Earthquake Energy vs Richter Magnitude\n'
             'Each unit = ×32 energy; two units = ×1000', fontsize=11)
ax.grid(True, which='both', alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `10**(1.5*(M_vals - 2))` computes $10^{1.5(M-2)}$
element-wise on the array. `ax.semilogy(...)` uses a logarithmic
$y$-axis, so the exponential energy curve appears as a straight line —
confirming that energy grows as $10^{1.5M}$ (a straight line on a
log scale). `ax.grid(True, which='both', ...)` shows both major and
minor grid lines on the log axis, making it easier to read values.

---

### Comparing the Three Scales

All three scales follow the same mathematical structure:

| Scale | Formula | Base ratio | Per-unit change |
|-------|---------|------------|----------------|
| Decibel | $L = 10\log_{10}(I/I_0)$ | $I/I_0$ | +10 dB = ×10 in $I$ |
| pH | $\text{pH} = -\log_{10}[\text{H}^+]$ | $[\text{H}^+]/1$ | +1 pH = ×0.1 in $[\text{H}^+]$ |
| Richter | $M = \log_{10}(A/A_0)$ | $A/A_0$ | +1 M = ×10 in $A$ |

Each scale measures "how many powers of 10" separate the quantity from
a reference. The decibel multiplies by 10 to get convenient numbers;
pH negates to make the scale increase with decreasing $[\text{H}^+]$.

**Converting between scales** is done by inverting: from scale value to
physical quantity using $10^{(\cdot)}$, then applying the other scale's
formula. For example, to convert intensity ratio to dB, then to amplitude
ratio, you would go through the physical quantity.

---

## Connect the Pieces

**What this lesson built on:** Logarithm laws (Lesson 1.9) — specifically
$\log(MN) = \log M + \log N$, which explains why equal intervals on a log
scale correspond to equal multiplicative factors. Exponential equations
(Lesson 1.10) — converting from a dB/pH/Richter value back to the physical
quantity uses $10^{(\cdot)}$.

**What this lesson makes possible:** Lesson 8.11 (information theory,
entropy) — entropy $H = -\sum p_i \log_2 p_i$ is another logarithmic
scale, measuring information in bits. Stage 7 (Fourier transform) — the
spectrum of a signal is plotted in dB. Stage 9 (algorithm complexity) —
$O(\log n)$ is an informal log scale for algorithm performance.

**In engineering and science:** Any measurement system that spans more
than 4–5 orders of magnitude uses a logarithmic scale. Signal attenuation
in dB (a 20 dB loss = $1\%$ of power remains), gain in amplifiers in dB,
antenna aperture in dBi. Frequency spectra in audio and control systems
use log-frequency axes. Bode plots (control engineering) use both log
frequency and dB gain axes.

---

## Summary

**Decibel:**
$$L = 10\log_{10}\!\left(\frac{I}{I_0}\right) \text{ dB}, \qquad I_0 = 10^{-12} \text{ W/m}^2$$
$$+3\ \text{dB} \approx \times 2\ \text{intensity}; \quad +10\ \text{dB} = \times 10\ \text{intensity}$$

**pH:**
$$\text{pH} = -\log_{10}[\text{H}^+], \qquad [\text{H}^+] = 10^{-\text{pH}}$$
$$\Delta\text{pH} = 1 \iff [\text{H}^+]\ \text{differs by factor}\ 10$$

**Richter:**
$$M = \log_{10}(A/A_0)$$
$$\Delta M = 1 \implies 10\times\ \text{amplitude},\ 32\times\ \text{energy}$$
$$\Delta M = 2 \implies 100\times\ \text{amplitude},\ 1000\times\ \text{energy}$$

**All three:** logarithmic scale = equal intervals = equal multiplicative ratios.

**New Python:**
- `ax.set_xscale('log')` / `ax.set_yscale('log')` — log axes
- `ax.semilogx(...)` / `ax.semilogy(...)` — one log axis
- `ax.grid(True, which='both', ...)` — major and minor gridlines

---

## Problems

### Math

**1.** (a) Find the dB level for $I = 10^{-5}$ W/m².
(b) Find the intensity for $L = 85$ dB.
(c) A speaker produces 90 dB. Adding an identical speaker makes the
total intensity $2I$. What is the new dB level?

<details>
<summary>Answers</summary>

(a) $L = 10\log_{10}(10^{-5}/10^{-12}) = 10\log_{10}(10^7) = 70$ dB.

(b) $I = 10^{-12} \cdot 10^{85/10} = 10^{-12} \cdot 10^{8.5} = 10^{-3.5} \approx 3.16 \times 10^{-4}$ W/m².

(c) New $I = 2 \times 10^{-12} \cdot 10^{90/10} = 2 \times 10^{-3}$.
$L_{\text{new}} = 10\log_{10}(2 \times 10^{-3}/10^{-12}) = 10\log_{10}(2 \times 10^9) = 10(9 + \log_{10}2) \approx 93.0$ dB.

</details>

---

**2.** (a) What is the $[\text{H}^+]$ concentration for pH 3.5?
(b) If a solution's pH changes from 4 to 6, by what factor does $[\text{H}^+]$ change?
(c) A biochemical reaction requires the pH to stay within 0.1 of 7.4.
What is the allowed range of $[\text{H}^+]$?

<details>
<summary>Answers</summary>

(a) $[\text{H}^+] = 10^{-3.5} \approx 3.16 \times 10^{-4}$ mol/L.

(b) $\Delta \text{pH} = 2$, so $[\text{H}^+]$ changes by factor $10^2 = 100$ (decreases 100-fold).

(c) pH range $[7.3, 7.5]$: $[\text{H}^+] \in [10^{-7.5}, 10^{-7.3}] = [3.16 \times 10^{-8}, 5.01 \times 10^{-8}]$ mol/L.

</details>

---

**3.** (a) How many times more energy does an M7.5 earthquake release than an M6?
(b) A seismometer reads an amplitude 500 times the reference $A_0$. What Richter magnitude is this?
(c) The 1960 Valdivia earthquake (M9.5) and the 2011 Tōhoku (M9.0) — what is their amplitude ratio and energy ratio?

<details>
<summary>Answers</summary>

(a) Energy ratio: $10^{1.5(7.5-6)} = 10^{2.25} \approx 178$.

(b) $M = \log_{10}(500) \approx 2.70$.

(c) Amplitude ratio: $10^{9.5-9.0} = 10^{0.5} \approx 3.16$.
Energy ratio: $10^{1.5 \times 0.5} = 10^{0.75} \approx 5.6$.

</details>

---

**4.** (Proof) Two independent sounds with intensities $I_1$ and $I_2$ have
combined level $L_{\text{combined}}$. Show that if $L_1 = L_2 = L$:

$$L_{\text{combined}} = L + 10\log_{10}(2) \approx L + 3.01 \text{ dB}$$

<details>
<summary>Answer</summary>

$L_1 = L_2 = L$ means $I_1 = I_2 = I_0 \cdot 10^{L/10}$.
Combined: $I_c = 2I_0 \cdot 10^{L/10}$.
$L_c = 10\log_{10}(2 I_0 \cdot 10^{L/10} / I_0)
      = 10\log_{10}(2 \cdot 10^{L/10})
      = 10(\log_{10} 2 + L/10)
      = L + 10\log_{10} 2 \approx L + 3.01$ dB. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Scale converter**

```python
import math

I0_dB = 1e-12   # reference intensity for dB

def intensity_to_dB(I):
    """
    Convert intensity I (W/m^2) to decibels.
    L = 10 * log10(I / I0)
    Raise ValueError if I <= 0.
    """
    pass  # your code here

def dB_to_intensity(L):
    """
    Convert decibel level L to intensity (W/m^2).
    I = I0 * 10^(L/10)
    """
    pass  # your code here

def pH_to_H_concentration(pH):
    """Return [H+] in mol/L: [H+] = 10^(-pH)."""
    pass  # your code here

def H_concentration_to_pH(H_conc):
    """Return pH = -log10([H+]). Raise ValueError if H_conc <= 0."""
    pass  # your code here

def richter_amplitude(M, A0=1.0):
    """Return amplitude A = A0 * 10^M."""
    pass  # your code here

def richter_magnitude(A, A0=1.0):
    """Return M = log10(A/A0). Raise ValueError if A <= 0."""
    pass  # your code here


# --- tests: do not modify ---
# dB
assert abs(intensity_to_dB(1e-12) - 0)   < 1e-10   # threshold = 0 dB
assert abs(intensity_to_dB(1e-6)  - 60)  < 1e-10   # 60 dB
assert abs(intensity_to_dB(1e2)   - 140) < 1e-10   # jet engine = 140 dB
# Round-trip
for L in [0, 20, 60, 100, 140]:
    assert abs(intensity_to_dB(dB_to_intensity(L)) - L) < 1e-10
# Error
try:
    intensity_to_dB(0)
    assert False
except ValueError:
    pass

# pH
assert abs(pH_to_H_concentration(7)  - 1e-7) < 1e-20
assert abs(H_concentration_to_pH(1e-7) - 7)  < 1e-10
# Round-trip
for pH in [1, 3.5, 7, 7.4, 12]:
    assert abs(H_concentration_to_pH(pH_to_H_concentration(pH)) - pH) < 1e-10
# Error
try:
    H_concentration_to_pH(-0.001)
    assert False
except ValueError:
    pass

# Richter
assert abs(richter_amplitude(3) - 1000)  < 1e-8   # 10^3
assert abs(richter_magnitude(100, 1.0) - 2) < 1e-10
# Round-trip
for M in [2, 4.5, 6, 8, 9]:
    assert abs(richter_magnitude(richter_amplitude(M)) - M) < 1e-10

print("✓ Challenge 1 passed!")
print(f"  Office (60 dB) intensity: {dB_to_intensity(60):.2e} W/m²")
print(f"  Stomach acid [H+]: {pH_to_H_concentration(2):.2e} mol/L")
print(f"  M8 amplitude: {richter_amplitude(8):,.0f}× A0")
```

<details>
<summary>Hint</summary>

`intensity_to_dB`: `return 10 * math.log10(I / I0_dB)`.
`dB_to_intensity`: `return I0_dB * 10**(L/10)`.
`pH_to_H_concentration`: `return 10**(-pH)`.
`H_concentration_to_pH`: check > 0, then `return -math.log10(H_conc)`.
`richter_amplitude`: `return A0 * 10**M`.
`richter_magnitude`: check > 0, then `return math.log10(A/A0)`.

</details>

---

**Challenge 2 — Combining dB sources**

```python
import math

I0 = 1e-12

def combine_dB(*levels):
    """
    Combine multiple independent sound sources given in dB.
    Converts each to intensity, sums, converts back to dB.
    
    *levels: any number of dB values
    Returns: combined dB level (float)
    """
    pass  # your code here

def dB_difference(L1, L2):
    """
    Compute the combined dB level when source 1 is added to source 2.
    Returns (combined_level, increase_over_L2).
    """
    pass  # your code here


# --- tests: do not modify ---
# Two equal sources: +3 dB
combined = combine_dB(60, 60)
assert abs(combined - (60 + 10*math.log10(2))) < 1e-8

# Same: 50+50=53 dB (not 100)
assert abs(combine_dB(50, 50) - (50 + 10*math.log10(2))) < 1e-8

# Three equal 60 dB: +10*log10(3) ≈ +4.77 dB
combined3 = combine_dB(60, 60, 60)
assert abs(combined3 - (60 + 10*math.log10(3))) < 1e-8

# Dominant source: very loud + very quiet ≈ loud
assert abs(combine_dB(90, 40) - 90) < 0.1   # 40 dB has negligible effect

# Single source: unchanged
assert abs(combine_dB(75) - 75) < 1e-10

# dB_difference
combined, increase = dB_difference(60, 60)
assert abs(increase - 10*math.log10(2)) < 1e-8

# Louder source dominates: adding 50 dB to 90 dB barely changes anything
combined, increase = dB_difference(50, 90)
assert increase < 0.1   # less than 0.1 dB increase

print("✓ Challenge 2 passed!")
print(f"  50+50 dB combined: {combine_dB(50, 50):.2f} dB")
print(f"  60+60+60 dB combined: {combine_dB(60, 60, 60):.2f} dB")
print(f"  Adding 50 dB to 90 dB: +{dB_difference(50,90)[1]:.3f} dB")
```

<details>
<summary>Hint</summary>

`combine_dB`: `total = sum(I0 * 10**(L/10) for L in levels)`;
`return 10 * math.log10(total / I0)`.
`dB_difference`: `combined = combine_dB(L1, L2)`;
`return combined, combined - L2`.

</details>

---

**Challenge 3 — Log scale plotter**

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def plot_three_scales():
    """
    Create a 3-panel figure showing:
    Panel 1: dB level vs intensity (I from 10^-12 to 10^2 W/m^2)
    Panel 2: pH vs [H+] concentration (pH from 0 to 14)
    Panel 3: Richter energy ratio vs magnitude (M from 2 to 9)
    
    Each panel should use a logarithmic scale on the physical quantity axis.
    Label at least 3 notable points on each panel.
    """
    pass  # your code here


# No automated test -- the visual is the result.
# Run and check:
# Panel 1: straight line on log-intensity x-axis; dB values 0 to 140
# Panel 2: straight line on log-[H+] x-axis; pH 0 to 14
# Panel 3: straight line on log-energy y-axis; M 2 to 9
plot_three_scales()
```

<details>
<summary>Hint</summary>

Panel 1: `I_vals = np.logspace(-12, 2, 300)`;
`L_vals = 10 * np.log10(I_vals / 1e-12)`; plot `I_vals` vs `L_vals`
with `ax.set_xscale('log')`.
Panel 2: `pH_vals = np.linspace(0, 14, 300)`;
`H_vals = 10**(-pH_vals)`; plot `H_vals` vs `pH_vals` with log x-axis.
Panel 3: `M_vals = np.linspace(2, 9, 300)`;
`E_rel = 10**(1.5*(M_vals - 2))`; plot `M_vals` vs `E_rel` with log y-axis.

</details>

---

### Extension

**4. ★** The **Weber-Fechner law** states that perceived loudness $P$ is
proportional to $\log_{10}(I/I_0)$:

$$P = k\log_{10}\!\left(\frac{I}{I_0}\right)$$

(a) Show that doubling $I$ increases $P$ by the constant $k\log_{10} 2 \approx 0.301k$.

(b) An $n$-fold increase in $I$ increases $P$ by $k\log_{10} n$.
Find how many doublings are needed to increase $P$ by 1 unit when $k = 1$.

(c) The Stevens power law is a more accurate model: $P = c \cdot I^\alpha$ where
$\alpha \approx 0.3$ for loudness. Show that this implies $\log P = \log c + \alpha\log I$
— a linear relationship on a log-log scale. At what $\alpha$ does the power law reduce to
the Weber-Fechner law?

**5. ★** Derive the formula $E \propto 10^{1.5M}$ from the fact that
seismic wave amplitude $A \propto E^{2/3}$ (the Gutenberg-Richter relation),
using $M = \log_{10}(A/A_0)$.

<details>
<summary>Answer to 5</summary>

$M = \log_{10}(A/A_0)$ so $A = A_0 \cdot 10^M$.
Since $A \propto E^{2/3}$: $E^{2/3} \propto 10^M$, so $E \propto 10^{3M/2} = 10^{1.5M}$. $\square$

</details>
