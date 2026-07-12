# Stage 2, Lesson 2.2 — Graphs of Sine and Cosine
**Threads:** Math · Physics · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

Lesson 2.1 defined sine and cosine as coordinates on the unit circle.
This lesson unrolls that circle into graphs — $\sin$ and $\cos$ as
functions of a real-number input, producing the wave shapes that model
every oscillating process in physics and engineering. Sound is a sine
wave. AC electricity is a sine wave. The motion of a pendulum, the
vibration of a cutting tool, the carrier signal in a radio transmission —
all are sinusoidal. The four parameters that control a sinusoidal wave
(amplitude, period, phase shift, vertical shift) are introduced and
applied here. By the end of this lesson you can sketch any sinusoidal
function from its equation, read the four parameters from a graph, and
identify the transformations that connect any sine or cosine function
to the base graphs.

---

## Historical Context

The sinusoidal wave shape was identified by Galileo (1638) in his study
of pendulum motion and later codified by Euler. But it was Jean-Baptiste
Joseph Fourier who, in 1822, proved the most important theorem about
these curves: every periodic function — no matter how complex — can be
decomposed into a sum of sine and cosine waves of different frequencies
and amplitudes. This is the Fourier series, the foundation of modern
signal processing, audio engineering, and image compression. JPEG,
MP3, and mobile phone signals all use variants of Fourier's idea.
Understanding the graphs in this lesson is the first step toward
understanding Fourier analysis, which appears in Stage 7.

---

## What You Need To Know First

- **Unit circle** — Lesson 2.1. Sine and cosine are defined there.
- **Function transformations** — covered informally in Lesson 1.6
  for exponentials; the same rules apply here.
- **Periodicity** — introduced in Lesson 2.1.

---

## The Lesson

### The Basic Graphs

**$y = \sin x$:**

- **Domain:** $\mathbb{R}$ &emsp; **Range:** $[-1, 1]$
- **Period:** $2\pi$ — repeats every $2\pi$
- **Zeros:** $x = n\pi$ for $n \in \mathbb{Z}$ (every integer multiple of $\pi$)
- **Maximum:** $y = 1$ at $x = \pi/2 + 2\pi n$
- **Minimum:** $y = -1$ at $x = 3\pi/2 + 2\pi n = -\pi/2 + 2\pi n$
- **Passes through the origin:** $\sin(0) = 0$
- **Odd function:** $\sin(-x) = -\sin(x)$

**$y = \cos x$:**

- **Domain:** $\mathbb{R}$ &emsp; **Range:** $[-1, 1]$
- **Period:** $2\pi$
- **Zeros:** $x = \pi/2 + n\pi$ for $n \in \mathbb{Z}$
- **Maximum:** $y = 1$ at $x = 2\pi n$
- **Minimum:** $y = -1$ at $x = \pi + 2\pi n$
- **$y$-intercept:** $\cos(0) = 1$
- **Even function:** $\cos(-x) = \cos(x)$

**The relationship:** $\cos x = \sin(x + \pi/2)$ — cosine is sine
shifted left by $\pi/2$ (a quarter period). The two curves have the
same shape; cosine starts at its maximum while sine starts at zero.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(-2*np.pi, 3*np.pi, 600)
# Three full periods to show the repeating pattern clearly

fig, axes = plt.subplots(2, 1, figsize=(13, 8), sharex=True)
# sharex=True: both subplots share the same x-axis,
# so zooming or panning one affects the other

# --- Top: y = sin(x) ---
axes[0].plot(x, np.sin(x), color='#2980b9', lw=2.5, label='$y=\\sin x$')
axes[0].axhline(0, color='#333', lw=0.8)

# Mark key points for one period [0, 2π]
key_x  = [0, math.pi/2,   math.pi, 3*math.pi/2, 2*math.pi]
key_y  = [0,  1,           0,       -1,           0]
key_lbl= ['$0$','$\\pi/2$','$\\pi$','$3\\pi/2$','$2\\pi$']
axes[0].scatter(key_x, key_y, color='#e74c3c', s=70, zorder=5)
for xi, yi, lbl in zip(key_x, key_y, key_lbl):
    axes[0].annotate(f'({lbl}, {yi})',
                     xy=(xi, yi),
                     xytext=(xi+0.15, yi+0.15),
                     fontsize=8, color='#c0392b')

axes[0].set_ylabel('$y$', fontsize=12)
axes[0].set_title('$y = \\sin x$: odd function, zeros at $n\\pi$, period $2\\pi$',
                  fontsize=11)
axes[0].set_ylim(-1.5, 1.8)
axes[0].legend(fontsize=11, loc='upper right')
axes[0].grid(True, alpha=0.3)

# --- Bottom: y = cos(x) ---
axes[1].plot(x, np.cos(x), color='#e74c3c', lw=2.5, label='$y=\\cos x$')
axes[1].axhline(0, color='#333', lw=0.8)

key_x2  = [0,    math.pi/2, math.pi, 3*math.pi/2, 2*math.pi]
key_y2  = [1,    0,         -1,      0,            1]
key_lbl2= ['$0$','$\\pi/2$','$\\pi$','$3\\pi/2$', '$2\\pi$']
axes[1].scatter(key_x2, key_y2, color='#2980b9', s=70, zorder=5)
for xi, yi, lbl in zip(key_x2, key_y2, key_lbl2):
    axes[1].annotate(f'({lbl}, {yi})',
                     xy=(xi, yi),
                     xytext=(xi+0.15, yi+0.15 if yi >= 0 else yi-0.25),
                     fontsize=8, color='#2471a3')

axes[1].set_xlabel('$x$ (radians)', fontsize=12)
axes[1].set_ylabel('$y$', fontsize=12)
axes[1].set_title('$y = \\cos x$: even function, $y$-intercept at 1, period $2\\pi$',
                  fontsize=11)
axes[1].set_ylim(-1.5, 1.8)
axes[1].legend(fontsize=11, loc='upper right')
axes[1].grid(True, alpha=0.3)

# Mark x-axis with π labels
x_ticks = [k*math.pi/2 for k in range(-4, 7)]
x_tick_labels = []
for k in range(-4, 7):
    n = k  # numerator when denominator is 2
    if n == 0:
        x_tick_labels.append('0')
    elif n == 2:
        x_tick_labels.append('$\\pi$')
    elif n == -2:
        x_tick_labels.append('$-\\pi$')
    elif n % 2 == 0:
        x_tick_labels.append(f'${n//2}\\pi$')
    else:
        x_tick_labels.append(f'$\\frac{{{n}\\pi}}{{2}}$')

axes[1].set_xticks(x_ticks)
axes[1].set_xticklabels(x_tick_labels, fontsize=9)
# ax.set_xticks(positions): set where tick marks appear
# ax.set_xticklabels(labels): set what text appears at each tick

plt.suptitle('Base sinusoidal functions', fontsize=13, y=1.01)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `plt.subplots(2, 1, sharex=True)` creates two stacked
subplots sharing the same $x$-axis — `sharex=True` links the $x$-axes
so both always display the same range, which makes the comparison between
$\sin$ and $\cos$ direct. `ax.set_xticks(positions)` and
`ax.set_xticklabels(labels)` replace the default numerical tick marks
with labels in terms of $\pi$ fractions — a much more readable
presentation for trigonometric graphs. The `$\\frac{...}{...}$` f-string
produces LaTeX fractions in the tick labels.

---

### Even and Odd Functions

Two important symmetry properties follow directly from the unit circle:

**Cosine is even:** $\cos(-\theta) = \cos\theta$.

*Proof:* The point at angle $-\theta$ is the reflection of the point at
angle $\theta$ across the $x$-axis. The $x$-coordinate (which is $\cos$)
is unchanged; the $y$-coordinate (which is $\sin$) flips sign.
Therefore $\cos(-\theta) = \cos\theta$ and $\sin(-\theta) = -\sin\theta$. $\blacksquare$

**Sine is odd:** $\sin(-\theta) = -\sin\theta$.

**Geometric meaning:**
- Even functions are symmetric about the $y$-axis (reflect left/right: same function)
- Odd functions are symmetric about the origin (rotate $180°$: same function)

The cosine graph is a mirror image across the $y$-axis. The sine graph
passes through the origin and is symmetric about it.

---

### Transformations: $y = A\sin(Bx + C) + D$

The general sinusoidal function is:

$$y = A\sin(Bx + C) + D \qquad \text{or} \qquad y = A\cos(Bx + C) + D$$

Each parameter has a specific geometric effect:

**Amplitude $|A|$:** the maximum displacement from the midline.
- Stretches the graph vertically by factor $|A|$
- If $A < 0$, also reflects across the $x$-axis
- Range becomes $[D - |A|,\ D + |A|]$

**Period $P = 2\pi/|B|$:** the length of one complete cycle.
- $|B| > 1$: period is shorter than $2\pi$ (compressed, oscillates faster)
- $|B| < 1$: period is longer than $2\pi$ (stretched, oscillates slower)

**Phase shift $-C/B$:** horizontal translation.
- Positive $-C/B$: shift right
- Negative $-C/B$: shift left

**Vertical shift $D$:** moves the midline from $y=0$ to $y=D$.

**Hand-worked example:** Identify all parameters of
$f(x) = 3\sin(2x - \pi/4) + 1$.

Write in standard form: $f(x) = 3\sin\!\left(2\!\left(x - \frac{\pi}{8}\right)\right) + 1$.

- $A = 3$: amplitude 3; range $[-2, 4]$
- $B = 2$: period $2\pi/2 = \pi$
- Phase shift: $-C/B = (\pi/4)/2 = \pi/8$ to the right
- $D = 1$: midline at $y = 1$
- Maximum: $y = 4$ at $x = \pi/8 + \pi/4 + k\pi$
- Minimum: $y = -2$ at $x = \pi/8 + 3\pi/4 + k\pi$

```python
import numpy as np
import matplotlib.pyplot as plt
import math

x = np.linspace(-math.pi, 3*math.pi, 500)

fig, axes = plt.subplots(2, 2, figsize=(14, 9))

# Each panel shows one transformation relative to y = sin(x)
transformations = [
    (np.sin(x),          '$y = \\sin x$',          'Base function',          '#aaaaaa', '-'),
    (3*np.sin(x),         '$y = 3\\sin x$',          'Amplitude=3 (stretch)',   '#e74c3c', '-'),
    (np.sin(2*x),         '$y = \\sin(2x)$',         'Period=$\\pi$ (compress)','#27ae60', '-'),
    (np.sin(x - math.pi/4),'$y = \\sin(x-\\pi/4)$', 'Phase shift $\\pi/4$ right','#8e44ad','-'),
    (np.sin(x) + 1.5,     '$y = \\sin x + 1.5$',    'Vertical shift up 1.5',  '#e67e22', '-'),
]

panels = [
    (axes[0,0], transformations[0], transformations[1]),
    (axes[0,1], transformations[0], transformations[2]),
    (axes[1,0], transformations[0], transformations[3]),
    (axes[1,1], transformations[0], transformations[4]),
]

for ax, (y_base, base_lbl, _, base_color, _), (y_new, new_lbl, new_desc, new_color, _) in panels:
    ax.plot(x, y_base, color='#cccccc', lw=1.5, linestyle='--',
            label=base_lbl + ' (base)')
    ax.plot(x, y_new,  color=new_color, lw=2.5, label=new_lbl)
    ax.axhline(0, color='#333', lw=0.8)
    ax.set_title(new_desc, fontsize=10)
    ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
    ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
    ax.set_ylim(-4, 5)

plt.suptitle('Transformations of $y = \\sin x$', fontsize=13)
plt.tight_layout()
plt.show()

# Full example: f(x) = 3*sin(2x - pi/4) + 1
print("f(x) = 3*sin(2x - π/4) + 1\n")
A, B, C, D = 3, 2, -math.pi/4, 1
period      = 2*math.pi / abs(B)
phase_shift = -C / B

print(f"  Amplitude:    |A| = {abs(A)}")
print(f"  Period:       2π/|B| = 2π/{B} = {period:.4f} = π")
print(f"  Phase shift:  -C/B = {phase_shift:.4f} = π/8 (right)")
print(f"  Vertical shift: D = {D}")
print(f"  Midline:      y = {D}")
print(f"  Range:        [{D - abs(A)}, {D + abs(A)}]")
```

**Walkthrough:** `panels` is a list of tuples grouping each subplot
with two data series — the base $\sin x$ and the transformed version.
The `for` loop unpacks each tuple and plots both series in the same
panel. `linestyle='--'` makes the base curve dashed so it does not
obscure the transformed curve. This four-panel layout makes the
individual effect of each transformation immediately visible by comparison.

---

### Reading Parameters from a Graph

Given a sinusoidal graph, extract $A$, $P$, phase shift, and $D$:

1. **Midline $D$:** the horizontal line halfway between maximum and minimum.
   $D = (\text{max} + \text{min})/2$

2. **Amplitude $|A|$:** half the distance from max to min.
   $|A| = (\text{max} - \text{min})/2$

3. **Period $P$:** the horizontal distance for one complete cycle.
   Read from peak to next peak (or trough to trough, or zero to same-direction zero).
   Then $|B| = 2\pi/P$.

4. **Phase shift:** find where the first maximum (for cosine) or
   first ascending zero-crossing (for sine) occurs. Compare to $x=0$.

**Hand-worked example:** A graph has maximum $y=5$, minimum $y=1$,
and completes one cycle from $x=\pi/6$ to $x=7\pi/6$.

- $D = (5+1)/2 = 3$ (midline)
- $|A| = (5-1)/2 = 2$ (amplitude)
- $P = 7\pi/6 - \pi/6 = \pi$ (period), so $B = 2\pi/\pi = 2$
- Maximum at $x = \pi/6 + P/4 = \pi/6 + \pi/4 = 5\pi/12$
  (one quarter period past the start of the cycle, if the cycle
  starts at an ascending zero)

```python
import numpy as np
import matplotlib.pyplot as plt
import math

# Generate a mystery curve for students to analyse
A_true, B_true, C_true, D_true = 2.5, 3, -math.pi/4, 1
x = np.linspace(-math.pi, 3*math.pi, 500)
y = A_true * np.cos(B_true*x + C_true) + D_true

fig, ax = plt.subplots(figsize=(11, 6))
ax.plot(x, y, color='#2980b9', lw=2.5)
ax.axhline(0, color='#333', lw=0.8)

# Mark features for the student to read off
y_max = A_true + D_true       # 3.5
y_min = -A_true + D_true      # -1.5
P = 2*math.pi/B_true          # 2π/3
phase = -C_true/B_true        # π/12

# Mark midline
ax.axhline(D_true, color='#27ae60', lw=1.5, linestyle='--',
           label=f'Midline $y=D$')

# Mark first maximum
x_max1 = phase   # first maximum at phase shift
ax.plot(x_max1, y_max, 'v', color='#e74c3c', markersize=12, zorder=5,
        label=f'Max $y={y_max}$')
ax.annotate(f'$y_{{max}} = {y_max}$\n$x = \\pi/12$',
            (x_max1, y_max), xytext=(x_max1+0.4, y_max-0.4),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1),
            fontsize=9, color='#e74c3c')

# Mark first minimum
x_min1 = phase + math.pi/B_true
ax.plot(x_min1, y_min, '^', color='#8e44ad', markersize=12, zorder=5,
        label=f'Min $y={y_min}$')

# Mark period
ax.annotate('',
            xy=(x_max1 + P, y_max - 0.1),
            xytext=(x_max1,  y_max - 0.1),
            arrowprops=dict(arrowstyle='<->', color='#e67e22', lw=1.8))
ax.text(x_max1 + P/2, y_max - 0.35, f'Period $P=2\\pi/3$',
        ha='center', fontsize=9, color='#e67e22')

ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_title('Can you read the parameters from this curve?\n'
             '$y = A\\cos(Bx+C)+D$ — identify $A$, $B$, $C$, $D$',
             fontsize=11)
ax.legend(fontsize=9, loc='lower right')
ax.grid(True, alpha=0.3)
ax.set_ylim(-2.5, 4.5)
plt.tight_layout()
plt.show()

print("Parameters of the mystery curve:")
print(f"  A = {A_true}  (amplitude)")
print(f"  B = {B_true}  (B = 2π/P = 2π/{P:.4f} = {B_true})")
print(f"  C = {C_true:.4f}  (= -π/4)")
print(f"  D = {D_true}  (midline)")
print(f"  Period P = {P:.4f} = 2π/3")
print(f"  Phase shift = {phase:.4f} = π/12 right")
```

**Walkthrough:** `'v'` marker draws a downward-pointing triangle (marking
a maximum intuitively — the triangle points to the peak from above).
`'^'` draws an upward-pointing triangle for the minimum. The double-headed
arrow annotation uses `arrowstyle='<->'` — a new style here — to show
the period as a horizontal span between two maxima.

---

### Physical Interpretation: Waves

The general sinusoidal model for a physical wave is:

$$y(t) = A\sin(2\pi f t + \phi) + D$$

where:
- $A$ = amplitude (metres, Pascals, Volts — depending on context)
- $f$ = frequency in Hz (cycles per second)
- $T = 1/f$ = period (seconds per cycle)
- $\omega = 2\pi f$ = angular frequency (radians per second)
- $\phi$ = phase (radians)
- $D$ = DC offset (average value)

**Converting between $f$, $T$, and $\omega$:**

$$f = \frac{1}{T} \qquad \omega = 2\pi f = \frac{2\pi}{T}$$

**Machining application:** tool vibration at 500 Hz with amplitude 0.05 mm:

$$y(t) = 0.05\sin(2\pi \cdot 500 \cdot t)\ \text{mm}$$

Period: $T = 1/500 = 0.002$ s = 2 ms. The tool oscillates 500 times per second.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

fig, axes = plt.subplots(2, 1, figsize=(12, 8))

# Top: AC mains voltage (50 Hz, 230V RMS = 325V peak)
t1 = np.linspace(0, 0.06, 1000)   # 60 ms, showing 3 cycles
V_peak = 325
f_mains = 50
V = V_peak * np.sin(2*np.pi*f_mains*t1)

axes[0].plot(t1*1000, V, color='#e74c3c', lw=2.5,
             label=f'$V(t) = {V_peak}\\sin(2\\pi\\cdot{f_mains}\\,t)$ V')
axes[0].axhline(0,     color='#333', lw=0.8)
axes[0].axhline(V_peak,  color='#aaa', lw=1, linestyle=':')
axes[0].axhline(-V_peak, color='#aaa', lw=1, linestyle=':')
axes[0].set_xlabel('Time (ms)'); axes[0].set_ylabel('Voltage (V)')
axes[0].set_title(f'AC mains voltage: $f={f_mains}$ Hz, period $T={1000/f_mains:.0f}$ ms',
                  fontsize=10)
axes[0].legend(fontsize=9); axes[0].grid(True, alpha=0.3)

# Bottom: tool vibration (500 Hz, 0.05 mm amplitude) with chatter at 1250 Hz
t2 = np.linspace(0, 0.006, 2000)   # 6 ms
A1, f1 = 0.05, 500
A2, f2 = 0.02, 1250   # chatter component
y_tool = A1*np.sin(2*np.pi*f1*t2) + A2*np.sin(2*np.pi*f2*t2)

axes[1].plot(t2*1000, y_tool, color='#2980b9', lw=1.5,
             label='Tool displacement (vibration + chatter)')
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].set_xlabel('Time (ms)'); axes[1].set_ylabel('Displacement (mm)')
axes[1].set_title('Tool vibration: 500 Hz fundamental + 1250 Hz chatter component',
                  fontsize=10)
axes[1].legend(fontsize=9); axes[1].grid(True, alpha=0.3)

plt.suptitle('Sinusoidal waves in engineering', fontsize=12)
plt.tight_layout()
plt.show()

print("AC mains (50 Hz):")
print(f"  Period:     T = 1/50 = {1000/50:.0f} ms")
print(f"  Angular freq: ω = 2π×50 = {2*math.pi*50:.2f} rad/s")
print(f"  Peak voltage: {V_peak} V")
print(f"  RMS voltage:  {V_peak/math.sqrt(2):.1f} V (= 230 V, what outlets are rated at)")
```

**Walkthrough:** `2*np.pi*f_mains*t1` computes $2\pi f t$ element-wise
on the time array — the argument of the sinusoid. The tool vibration
example sums two sine waves of different frequencies: the fundamental
vibration at 500 Hz and a "chatter" component at 1250 Hz. The resulting
curve is not a pure sine wave — it oscillates at both frequencies
simultaneously. This is the beginning of the idea that complex waveforms
are built from sums of sinusoids, formalised in the Fourier series.

---

## Connect the Pieces

**What this lesson built on:** Unit circle and angle definitions (Lesson 2.1).
Function transformations (Lesson 1.6 — the same $A$, $B$, $h$, $k$
framework). Periodic functions and the modulo operation (Lesson 2.1).

**What this lesson makes possible:** Lesson 2.3 (all six trig functions).
Lesson 2.8 (trig identities — proved using the graphs). Lesson 2.14
(Euler's formula connects $e^{ix}$ to the graphs here).
Stage 5 (Calculus) — $\frac{d}{dx}\sin x = \cos x$ means the
derivative of $\sin$ is $\cos$ shifted left by $\pi/2$ — the slope
of the sine curve at any point is the height of the cosine curve there.
Stage 7 (Fourier analysis) — every signal is a sum of sinusoids.

**In manufacturing:** vibration signatures in CNC machines are sinusoidal.
A spindle running at 12,000 RPM produces a vibration at $12000/60 = 200$
Hz. Measuring this frequency with a sensor and analysing its amplitude
and phase reveals tool wear, bearing damage, or resonance — all from
reading the parameters of a sinusoidal wave.

---

## Summary

**$y = \sin x$:** odd, period $2\pi$, zeros at $n\pi$, max at $\pi/2$.

**$y = \cos x$:** even, period $2\pi$, zeros at $\pi/2 + n\pi$, max at $0$.

**Relationship:** $\cos x = \sin(x + \pi/2)$.

**General form:** $y = A\sin(Bx + C) + D$:
- Amplitude: $|A|$
- Period: $2\pi/|B|$
- Phase shift: $-C/B$ (right if positive)
- Midline: $y = D$; range: $[D-|A|, D+|A|]$

**Reading from a graph:**
$D = (\text{max}+\text{min})/2$, $|A| = (\text{max}-\text{min})/2$,
$P$ from peak-to-peak.

**Physics notation:** $y = A\sin(2\pi f t + \phi) + D$
where $f$ = frequency (Hz), $T=1/f$ = period, $\omega=2\pi f$ = angular frequency.

**New Python:**
- `plt.subplots(m, n, sharex=True)` — linked $x$-axes across subplots
- `ax.set_xticks(positions)` — custom tick mark positions
- `ax.set_xticklabels(labels)` — custom tick labels (LaTeX OK)
- `'v'`, `'^'` marker styles — downward/upward triangle markers
- `arrowstyle='<->'` — double-headed arrow in `ax.annotate`

---

## Problems

### Math

**1.** State the amplitude, period, phase shift, vertical shift, and
range of each function.

(a) $y = 4\sin(3x - \pi) + 2$

(b) $y = -2\cos\!\left(\dfrac{x}{2} + \dfrac{\pi}{4}\right)$

(c) $y = \dfrac{1}{2}\sin(\pi x)$

<details>
<summary>Answers</summary>

(a) $A=4$, $P=2\pi/3$, phase shift $=\pi/3$ right, $D=2$, range $[-2,6]$.

(b) $A=2$ (reflected), $P=4\pi$, phase shift $=-\pi/2$ left, $D=0$, range $[-2,2]$.

(c) $A=1/2$, $P=2\pi/\pi=2$, no phase shift, $D=0$, range $[-1/2, 1/2]$.

</details>

---

**2.** Find a sinusoidal equation matching each description.

(a) Amplitude 3, period $\pi$, phase shift $\pi/4$ to the right,
midline $y = -1$.

(b) Passes through $(0, 0)$, maximum of 5 at $x = \pi/3$,
minimum of $-5$.

<details>
<summary>Answers</summary>

(a) $y = 3\sin(2(x - \pi/4)) - 1 = 3\sin(2x - \pi/2) - 1$.

(b) Amplitude 5 ($A=5$), midline $y=0$ ($D=0$). Maximum at $\pi/3$
means $2(\pi/3) - C = \pi/2$ for $\sin$ with $B=2$... simpler: if max
at $x=\pi/3$, use cosine: $5\cos(B(x-\pi/3))$. Through $(0,0)$:
$5\cos(-B\pi/3)=0 \Rightarrow B\pi/3=\pi/2 \Rightarrow B=3/2$.
$y=5\cos(\frac{3}{2}(x-\frac{\pi}{3})) = 5\cos(\frac{3x}{2}-\frac{\pi}{2}) = 5\sin(\frac{3x}{2})$.
Check: $5\sin(0)=0$ ✓, $5\sin(\pi/2)=5$ at $x=\pi/3$ ✓.
Answer: $y = 5\sin\!\left(\frac{3x}{2}\right)$.

</details>

---

**3.** A sinusoidal wave is measured and has:
maximum value 8, minimum value 2, period 4 seconds,
and passes through a maximum at $t = 1$ second.

Write the equation $y(t) = A\cos(B(t-h)) + D$.

<details>
<summary>Answer</summary>

$D = (8+2)/2 = 5$, $A = (8-2)/2 = 3$, $B = 2\pi/4 = \pi/2$, $h=1$.
$y(t) = 3\cos\!\left(\frac{\pi}{2}(t-1)\right) + 5$.

</details>

---

### Code Challenges

**Challenge 1 — Parameter extractor**

```python
import math

def sinusoidal_parameters(A, B, C, D):
    """
    Given f(x) = A*sin(Bx + C) + D, return a dictionary with:
      'amplitude':    |A|
      'period':       2π/|B|
      'phase_shift':  -C/B  (positive = right)
      'midline':      D
      'range_min':    D - |A|
      'range_max':    D + |A|
    """
    pass  # your code here


# --- tests: do not modify ---
p = sinusoidal_parameters(3, 2, -math.pi/4, 1)
assert math.isclose(p['amplitude'],   3.0,          rel_tol=1e-9)
assert math.isclose(p['period'],      math.pi,      rel_tol=1e-9)
assert math.isclose(p['phase_shift'], math.pi/8,    rel_tol=1e-9)
assert math.isclose(p['midline'],     1.0,          rel_tol=1e-9)
assert math.isclose(p['range_min'],  -2.0,          rel_tol=1e-9)
assert math.isclose(p['range_max'],   4.0,          rel_tol=1e-9)

p2 = sinusoidal_parameters(-2, 0.5, math.pi/4, -3)
assert math.isclose(p2['amplitude'],  2.0,          rel_tol=1e-9)
assert math.isclose(p2['period'],     4*math.pi,    rel_tol=1e-9)
assert math.isclose(p2['range_min'], -5.0,          rel_tol=1e-9)

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Fit sinusoid to data**

```python
import numpy as np
import math

def fit_sinusoid(t_data, y_data):
    """
    Given time series data (t_data, y_data), estimate the parameters
    of the best-fit sinusoid y = A*sin(2*pi*f*t + phi) + D.
    
    Strategy:
    1. D = mean of y_data
    2. A = (max - min) / 2
    3. Estimate period from the data (find peak-to-peak spacing)
       or accept it as a parameter
    
    For simplicity: assume one dominant frequency.
    Returns (A, f, phi, D) where phi is in radians.
    """
    pass  # your code here — use the amplitude and midline formulas


# --- tests: do not modify ---
import numpy as np, math

# Generate clean sinusoidal data
t = np.linspace(0, 2, 200)
A_true, f_true, phi_true, D_true = 3.0, 2.0, math.pi/6, 1.5
y = A_true*np.sin(2*math.pi*f_true*t + phi_true) + D_true

A_fit, f_fit, phi_fit, D_fit = fit_sinusoid(t, y)
assert math.isclose(A_fit, A_true, rel_tol=0.05), f"A: {A_fit} vs {A_true}"
assert math.isclose(D_fit, D_true, rel_tol=0.05), f"D: {D_fit} vs {D_true}"

print("✓ Challenge 2 passed!")
print(f"  True:   A={A_true}, D={D_true}")
print(f"  Fitted: A={A_fit:.3f}, D={D_fit:.3f}")
```

---

**Challenge 3 — Vibration analyser**

A CNC machine's vibration sensor produces a signal that is a sum of
two sinusoids. Plot the combined signal and identify which component
has the higher amplitude.

```python
import numpy as np
import matplotlib.pyplot as plt
import math

def plot_vibration(frequencies, amplitudes, duration=0.01, sample_rate=50000):
    """
    Plot the combined vibration signal from multiple frequency components.
    
    frequencies:  list of frequencies in Hz
    amplitudes:   list of amplitudes in mm
    duration:     time window in seconds
    sample_rate:  samples per second
    
    Plot three panels: component 1, component 2, combined signal.
    Mark the peak-to-peak amplitude of the combined signal.
    """
    pass  # your code here


# No automated test -- verify visually.
plot_vibration(
    frequencies=[500, 1250],
    amplitudes= [0.05, 0.02]
)
```

---

### Extension

**4. ★** Prove that $\cos x = \sin(x + \pi/2)$ directly from the
unit circle definition, without using the addition formula.

<details>
<summary>Answer</summary>

The point at angle $x + \pi/2$ on the unit circle is obtained by
rotating the point at angle $x$ by $90°$ counterclockwise. If the
point at angle $x$ is $(\cos x, \sin x)$, then rotating $90°$ CCW
maps $(a,b) \mapsto (-b, a)$. So the point at angle $x+\pi/2$ is
$(-\sin x, \cos x)$.

By definition, the $x$-coordinate of this point is $\cos(x+\pi/2)$
and the $y$-coordinate is $\sin(x+\pi/2)$.

Therefore $\cos(x+\pi/2) = -\sin x$ and $\sin(x+\pi/2) = \cos x$.

Equivalently: $\cos x = \sin(x+\pi/2)$. $\blacksquare$

</details>

**5. ★** A signal $f(t) = \sin(t) + \sin(2t)$ is not sinusoidal —
it is a sum of two sinusoids. Find all values of $t$ in $[0, 2\pi]$
where $f(t) = 0$.

<details>
<summary>Answer</summary>

$\sin(t) + \sin(2t) = 0$. Using the double angle formula $\sin(2t) = 2\sin t\cos t$:
$\sin t + 2\sin t\cos t = 0 \Rightarrow \sin t(1 + 2\cos t) = 0$.

Either $\sin t = 0$: $t = 0, \pi, 2\pi$.
Or $\cos t = -1/2$: $t = 2\pi/3$ or $t = 4\pi/3$.

Solutions: $t \in \{0, 2\pi/3, \pi, 4\pi/3, 2\pi\}$.

</details>
