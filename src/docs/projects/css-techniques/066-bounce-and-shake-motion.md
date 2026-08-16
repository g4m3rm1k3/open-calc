---
concept: 066-bounce-and-shake-motion
name: CSS Bounce & Shake Motion Masterclass
category: CSS Animations, Physics-Based Motion & Micro-Interactions
difficulty: Intermediate to Advanced
tags: [css, animations, keyframes, bounce-motion, shake-motion, cubic-bezier, spring-physics, linear-easing, micro-interactions, ui-feedback, error-shake, notification-bounce, squash-and-stretch, modern-css]
---

# 066: CSS Bounce & Shake Motion Masterclass

## Overview & Executive Summary

In user interface design, static transitions feel sterile and disconnected from physical intuition. Physical objects in the real world possess **mass**, **inertia**, **elasticity**, and **momentum**—they do not instantly stop at precise coordinate targets without dissipation of kinetic energy. **Bounce and shake motions** are foundational physical micro-interactions in digital product design:

- **Bounce motion** injects elasticity, tactile delight, gravity, and spatial depth (e.g., dropping modal dialogues, rubbery pull-to-refresh indicators, bouncy toggle switches, and celebratory reward badges).
- **Shake motion** communicates friction, rejection, critical feedback, structural disruption, or urgency (e.g., password validation failures, invalid form inputs, notification bell jiggles, deletion "wobble mode", and gaming screen trauma).

```
+-------------------------------------------------------------------------------+
|                      CSS BOUNCE & SHAKE MOTION TAXONOMY                       |
|                                                                               |
|   1. Linear Cartesian Error Shake      2. Angular Pendulum Wiggle             |
|      (Input Validation / Auth Deny)       (Notification Bells / Alerts)       |
|       ┌───────────┐                         \   /                             |
|     ◀─│  Invalid  │─▶                         ●   (Origin: Top Center)        |
|       └───────────┘                        /     \                            |
|      Decaying ±X Translation             Decaying ±θ Rotational Swing         |
|                                                                               |
|   3. Gravity Drop with Squash/Stretch  4. Damped Spring Micro-Overshoot       |
|      (Modals, Badges, Dropdowns)          (Button Releases, Toggles, CTAs)    |
|        ●  (Fall)                            ╭──────────╮                      |
|        │                                    │  Submit  │ ──> [Pop!] ──> [Rest]|
|       ( ) (Squash at base)                  ╰──────────╯                      |
|       🠛  🠙 (Decaying Rebound)             cubic-bezier(0.34, 1.56, 0.64, 1)   |
|                                                                               |
|   5. Continuous Jiggle / Wobble Grid   6. 2D Multi-Axis Trauma Jitter         |
|      (iOS Icon Edit / Reorder Mode)       (Critical Hit, Damage, Impact)      |
|       ┌──┐  ┌──┐  ┌──┐                     ▒ ┌─────────┐ ▒                    |
|       │✦ │~ │✦ │~ │✦ │~                    ░ │ CRITICAL│ ░                    |
|       └──┘  └──┘  └──┘                       └─────────┘                      |
|      Desynchronized Phase Shakes          Perlin / Multi-Axis Jitter          |
+-------------------------------------------------------------------------------+
```

While naive CSS animations often rely on linear steps or simplistic `ease-in-out` curves that feel artificial or jarring, **physics-accurate motion** requires an understanding of **damped harmonic oscillations**, **energy attenuation decay rates**, **volume-preserving squash & stretch geometry**, and modern CSS primitives like **`linear()` spring curves** and **GPU-accelerated compositing pipelines**.

---

## Quick Reference Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Name** | CSS Bounce & Shake Motion (`@keyframes`, `cubic-bezier`, `linear()`, `transform`) |
| **Category** | CSS Animations, Physics-Based Motion & Micro-Interactions |
| **Difficulty** | Intermediate to Advanced (3.5 / 5) |
| **What it produces** | Tactile, organic, high-performance physical motion primitives—including horizontal error shakes, rotational pendulum bells, gravity-fed impact bounces with squash & stretch, iOS-style jiggle grids, and multi-axis impact trauma shakes. |
| **Core Primitives** | `@keyframes`, `transform` (`translate3d`, `scale`, `rotate`), `transform-origin`, `cubic-bezier()`, `linear()` easing function (CSS Easing Level 2), `will-change`. |
| **Physics Foundations** | Damped Harmonic Oscillation ($x(t) = A e^{-\gamma t} \cos(\omega t + \phi)$), Hooke's Law Spring Equilibrium, Kinetic Energy Dissipation, Volume Preservation ($\Delta V \approx 0$). |
| **Rendering Pipeline** | 100% GPU Compositor Thread execution when isolated to `transform` and `opacity` properties, achieving locked 60 FPS / 120 FPS frame rates without triggering Layout (Reflow) or Paint (Repaint). |
| **Accessibility Requirement** | `@media (prefers-reduced-motion: reduce)` fallbacks that eliminate rapid spatial oscillations in favor of subtle opacity fades, color shifts, or border flashes to protect users with vestibular disorders. |

### Quick Preview

```html
<!-- Instant Error Shake Demonstration -->
<div class="shake-field-demo">
  <input type="password" class="input-error-shake" value="wrong_password" aria-invalid="true" />
  <button type="button" class="btn-bounce-elastic">Submit</button>
</div>
```

```css
/* 1. Damped Horizontal Error Shake */
@keyframes error-shake-horizontal {
  0%, 100% { transform: translateX(0); }
  15%      { transform: translateX(-12px); }
  30%      { transform: translateX(10px); }
  45%      { transform: translateX(-7px); }
  60%      { transform: translateX(5px); }
  75%      { transform: translateX(-2px); }
  90%      { transform: translateX(1px); }
}

.input-error-shake {
  border: 2px solid #ef4444;
  outline: none;
  animation: error-shake-horizontal 500ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  will-change: transform;
}

/* 2. Modern CSS Spring Elastic Bounce Button */
.btn-bounce-elastic {
  transition: transform 600ms linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
    0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.002 50.1%, 1.003 62%, 0.999 73.6%, 1
  );
}

.btn-bounce-elastic:hover {
  transform: scale(1.08);
}

.btn-bounce-elastic:active {
  transform: scale(0.92);
}
```

---

## 1. Physics & Mathematical Mental Models

### 1.1 The Mathematics of Damped Harmonic Oscillation

All realistic physical shakes and bounces are expressions of a **damped harmonic oscillator**. In classical Newtonian mechanics, when a spring or elastic body displaced by distance $x$ from its equilibrium position is released, it is subjected to two opposing forces:
1. **Restoring Force (Hooke's Law)**: $F_{\text{spring}} = -k x$ (where $k$ is spring stiffness).
2. **Damping / Friction Force**: $F_{\text{damping}} = -c \frac{dx}{dt}$ (where $c$ is the damping coefficient).

The differential equation governing position $x(t)$ over time $t$ is:

$$m \frac{d^2x}{dt^2} + c \frac{dx}{dt} + k x = 0$$

For the underdamped condition ($\zeta = \frac{c}{2\sqrt{m k}} < 1$), which describes all visible bounces and shakes, the exact solution is:

$$x(t) = A_0 \cdot e^{-\gamma t} \cdot \cos(\omega_d t + \phi)$$

Where:
- $A_0$ is the initial perturbation amplitude (e.g., initial displacement in pixels or degrees).
- $\gamma = \frac{c}{2m}$ is the exponential attenuation decay factor.
- $\omega_d = \sqrt{\frac{k}{m} - \gamma^2}$ is the damped angular frequency.
- $\phi$ is the initial phase angle.

```
Amplitude (Pixels / Degrees)
  ▲
A0│   ╭───╮                ─── Upper Exponential Envelope: +A0 * e^(-γt)
  │  ╱     ╲
  │ ╱       ╲      ╭───╮
 0┼─┼────────┼─────┼───┼──────────────┼──────────────▶ Time (ms)
  │           ╲   ╱     ╲   ╭─╮
  │            ╲ ╱       ╲ ╱   ╲
-A│             ╰─────────╯     ╰───  ─── Lower Exponential Envelope: -A0 * e^(-γt)
  ▼
  |◄─ Period ─►|
```

#### Peak Value Attenuation Table for Keyframe Construction

When handcrafting `@keyframes` for a $500\text{ms}$ shake or bounce with an exponential decay factor of $\gamma = 0.5$, successive oscillation extrema decrease geometrically:

| Oscillation Cycle | Normalized Keyframe Time ($t$) | Amplitude Fraction ($e^{-\gamma t}$) | Signed Displacement ($\pm 16\text{px}$ Base) |
| :--- | :--- | :--- | :--- |
| **Trigger / Origin** | `0%` ($0\text{ms}$) | $0.00$ | $0.00\text{px}$ |
| **Peak 1 (Right)** | `15%` ($75\text{ms}$) | $+1.00$ | $+16.00\text{px}$ |
| **Peak 2 (Left)** | `30%` ($150\text{ms}$) | $-0.65$ | $-10.40\text{px}$ |
| **Peak 3 (Right)** | `45%` ($225\text{ms}$) | $+0.40$ | $+6.40\text{px}$ |
| **Peak 4 (Left)** | `60%` ($300\text{ms}$) | $-0.22$ | $-3.50\text{px}$ |
| **Peak 5 (Right)** | `75%` ($375\text{ms}$) | $+0.10$ | $+1.60\text{px}$ |
| **Peak 6 (Left)** | `90%` ($450\text{ms}$) | $-0.03$ | $-0.50\text{px}$ |
| **Rest (Equilibrium)** | `100%` ($500\text{ms}$) | $0.00$ | $0.00\text{px}$ |

---

### 1.2 Disney's Squash & Stretch Principle in Digital Interfaces

The first and most vital of Disney's *12 Basic Principles of Animation* is **Squash and Stretch**. When an elastic object collides with a boundary (such as a card hitting the bottom of a container or a button being pressed down), its kinetic energy compresses it along the axis of movement while expanding it perpendicular to movement to **preserve perceived mass and volume**.

```
                NATURAL VOLUME CONSERVATION (ΔV = 0)
    
     [ Airborne / Freefall ]       [ Impact Compression ]         [ Rebound Elasticity ]
          ┌─────────┐                    ┌───────────────┐               ┌───────┐
          │         │                    │               │               │       │
          │         │                    └───────────────┘               │       │
          │         │                                                    │       │
          └─────────┘                     scale(1.3, 0.7)                │       │
        scale(0.95, 1.05)            (Squashed: Wide & Short)            └───────┘
     (Stretched: Thin & Tall)                                         scale(0.9, 1.1)
                                                                    (Elastic Springback)
```

#### The Volume Preservation Formula
To maintain visual mass constant during a 2D transform deformation:

$$\text{scaleX} \times \text{scaleY} \approx 1.0$$

- If an element squashes vertically to $\text{scaleY} = 0.75$ ($-25\%$), its horizontal scale must expand to:
  $$\text{scaleX} = \frac{1.0}{0.75} \approx 1.33 \quad (+33\%)$$
- If an element stretches vertically to $\text{scaleY} = 1.20$ ($+20\%$), its horizontal scale must compress to:
  $$\text{scaleX} = \frac{1.0}{1.20} \approx 0.83 \quad (-17\%)$$

> [!IMPORTANT]
> **Anchor Point (`transform-origin`):**
> When animating ground-impact bounces, setting `transform-origin: center center` causes the element to expand upward and downward simultaneously, making it appear to float through the floor. You **must** set `transform-origin: bottom center` (or `50% 100%`) so the base remains pinned to the contact plane while deformation occurs upward.

---

### 1.3 Cubic-Bézier Overshoot vs. Multi-Stage Keyframes vs. CSS `linear()` Spring Easing

Developers have three distinct architectural options in modern CSS to author elastic motion:

```
               COMPARISON OF CSS ELASTIC TIMING MECHANISMS
               
1. Single-Peak Overshoot        2. Multi-Bounce Decay           3. Modern CSS linear() Spring
   cubic-bezier(0.34,1.56,0.64,1)  @keyframes (Hand-Coded Steps)   linear(0, 0.05 5%, 1.2 25%, 0.9 45%, 1.02 70%, 1)
   Value                           Value                           Value
    ▲     ╭───╮                     ▲   ╭─╮                         ▲   ╭─╮
 1.0┼────╱─────╲────────           1.0┼──╱───╲──╭─╮────          1.0┼──╱───╲──╭─╮────
    │   ╱       ╰───────              │ ╱     ╲╱   ╰───             │ ╱     ╲╱   ╰───
    │  ╱                              │╱                            │╱
   0┼─╯                            0┼─╯                          0┼─╯
    └──────────────▶ Time             └──────────────▶ Time         └──────────────▶ Time
   (Single overshoot; cannot         (Full control over decay;     (True mathematical spring;
    reverse multiple times)           requires verbose CSS)         works directly in transition)
```

| Technique | Method | Strengths | Limitations | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`cubic-bezier()` Overshoot** | `cubic-bezier(x1, y1, x2, y2)` with $y2 > 1.0$ | Ultra-lightweight; works natively in `transition: transform`. | Can only exceed target value **once**; cannot oscillate back and forth across 0. | Subtle button click springs, hover expansions, toggle snaps. |
| **Multi-Keyframe Decay** | `@keyframes` with explicit percentage stops (`0%` to `100%`) | Universal legacy browser support; full control over distinct property changes (e.g., squash + rotation + opacity). | Verbose; requires `@keyframes` block; cannot be dynamically adjusted without CSS custom properties. | Complex gravity drops, multi-peak error shakes, trauma jitter. |
| **CSS `linear()` Spring Function** | `linear(p0, p1 t1%, p2 t2%, ...)` (CSS Easing Level 2) | Mathematical precision; supports multiple oscillations directly inside `transition` properties without `@keyframes`. | Requires modern browsers (Baseline 2023: Chrome 113+, Safari 17.2+, Firefox 112+). | State transitions, modal entrances, draggable releases. |

---

## 2. The 5 Core CSS Bounce & Shake Primitives

### Primitive 1: Damped Horizontal Cartesian Error Shake

The horizontal error shake is the universal digital convention for expressing invalid input (analogous to shaking one's head "no").

```css
:root {
  --shake-intensity: 12px;
  --shake-duration: 450ms;
}

@keyframes shake-cartesian-x {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  15% {
    transform: translate3d(calc(var(--shake-intensity) * -1), 0, 0);
  }
  30% {
    transform: translate3d(calc(var(--shake-intensity) * 0.8), 0, 0);
  }
  45% {
    transform: translate3d(calc(var(--shake-intensity) * -0.5), 0, 0);
  }
  60% {
    transform: translate3d(calc(var(--shake-intensity) * 0.3), 0, 0);
  }
  75% {
    transform: translate3d(calc(var(--shake-intensity) * -0.15), 0, 0);
  }
  90% {
    transform: translate3d(calc(var(--shake-intensity) * 0.05), 0, 0);
  }
}

.shake-target-x {
  will-change: transform;
  animation: shake-cartesian-x var(--shake-duration) cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
```

---

### Primitive 2: Angular Pendulum Notification Wiggle

Simulates a physical bell or hanging sign suspended from an overhead pivot point (`transform-origin: top center`).

```css
:root {
  --wiggle-angle: 18deg;
  --wiggle-duration: 650ms;
}

@keyframes pendulum-wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(calc(var(--wiggle-angle) * 1));
  }
  30% {
    transform: rotate(calc(var(--wiggle-angle) * -0.75));
  }
  45% {
    transform: rotate(calc(var(--wiggle-angle) * 0.5));
  }
  60% {
    transform: rotate(calc(var(--wiggle-angle) * -0.25));
  }
  75% {
    transform: rotate(calc(var(--wiggle-angle) * 0.1));
  }
  90% {
    transform: rotate(calc(var(--wiggle-angle) * -0.04));
  }
}

.pendulum-target {
  transform-origin: top center; /* Anchor top pivot */
  will-change: transform;
  animation: pendulum-wiggle var(--wiggle-duration) cubic-bezier(0.445, 0.05, 0.55, 0.95) both;
}
```

---

### Primitive 3: Gravity Drop with Parabolic Rebounds & Squash

Combines quadratic acceleration ($d \propto t^2$) during fall phases with rapid compression upon boundary contact.

```css
@keyframes gravity-bounce-squash {
  0% {
    opacity: 0;
    transform: translateY(-240px) scale(0.9, 1.15); /* Airborne: stretched */
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Accelerate */
  }
  24% {
    opacity: 1;
    transform: translateY(0) scale(1.25, 0.75); /* Ground Impact 1: Squash */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); /* Decelerate up */
  }
  40% {
    transform: translateY(-60px) scale(0.95, 1.05); /* Peak 1: Stretch */
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Fall */
  }
  56% {
    transform: translateY(0) scale(1.12, 0.88); /* Ground Impact 2: Minor Squash */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  70% {
    transform: translateY(-16px) scale(0.98, 1.02); /* Peak 2 */
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  84% {
    transform: translateY(0) scale(1.04, 0.96); /* Ground Impact 3 */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: translateY(0) scale(1, 1); /* Equilibrium */
  }
}

.bounce-target-gravity {
  transform-origin: bottom center;
  will-change: transform, opacity;
  animation: gravity-bounce-squash 1000ms both;
}
```

---

### Primitive 4: Modern CSS Spring Physics using `linear()` Easing

CSS Easing Level 2 allows developers to define multi-point piecewise linear approximations of continuous differential spring equations.

```css
:root {
  /* High-energy bouncy spring curve generated via spring physics simulation */
  --ease-spring-bounce: linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 6.8%,
    0.25 10.4%, 0.383 14.3%, 0.536 18.5%, 0.707 23.2%,
    0.887 28.5%, 0.97 31.4%, 1.044 34.6%, 1.106 38.2%,
    1.149 42.3%, 1.168 47.1%, 1.157 52.4%, 1.119 58.3%,
    1.066 64.8%, 1.011 72.2%, 0.977 80.4%, 0.971 85.3%,
    0.978 90.7%, 1 100%
  );
  
  /* Snappy, critically damped UI spring */
  --ease-spring-snappy: linear(
    0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%,
    1.017 20.2%, 1.049 23.6%, 1.054 27.3%, 1.038 31.5%,
    1.015 36.3%, 0.999 41.8%, 0.993 48.2%, 0.996 55.9%,
    1 100%
  );
}

.spring-interactive-card {
  transition: transform 750ms var(--ease-spring-bounce);
  will-change: transform;
}

.spring-interactive-card:hover {
  transform: translateY(-16px) scale(1.03);
}

.spring-interactive-card:active {
  transform: translateY(2px) scale(0.96);
  transition-duration: 250ms;
}
```

---

### Primitive 5: 2D Multi-Axis Impact Trauma Jitter (Gaming / Critical Hit)

Simulates randomized perlin/screen trauma by rapidly perturbing $X$, $Y$, and $\theta$ (rotation) simultaneously across prime-number steps to prevent visible harmonic cycling.

```css
@keyframes screen-trauma-shake {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  10%      { transform: translate3d(-10px, 8px, 0) rotate(-2.5deg); }
  20%      { transform: translate3d(9px, -7px, 0) rotate(2deg); }
  30%      { transform: translate3d(-7px, -6px, 0) rotate(-1.5deg); }
  40%      { transform: translate3d(6px, 5px, 0) rotate(1.2deg); }
  50%      { transform: translate3d(-4px, 3px, 0) rotate(-0.8deg); }
  60%      { transform: translate3d(3px, -2px, 0) rotate(0.6deg); }
  70%      { transform: translate3d(-2px, -1px, 0) rotate(-0.3deg); }
  80%      { transform: translate3d(1px, 1px, 0) rotate(0.1deg); }
  90%      { transform: translate3d(-0.5px, 0px, 0) rotate(0deg); }
}

.trauma-shake-active {
  will-change: transform;
  animation: screen-trauma-shake 550ms cubic-bezier(0.1, 0.9, 0.2, 1) both;
}
```

---

## 3. Comprehensive Implementation Patterns

---

### Pattern 1: Complete Authentication Form with Damped Error Shake & Chromatic Glow

A production-grade form input system that displays tactile error shakes, dynamic shake triggers, input border illumination, and assistive technology alerts.

```
┌──────────────────────────────────────────────────────────────┐
│  AUTHENTICATION ERROR SHAKE ARCHITECTURE                     │
│                                                              │
│  [ Invalid Submit Event ]                                    │
│             │                                                │
│             ▼                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. Inject `.has-error` class to input container       │  │
│  │ 2. Trigger `@keyframes form-error-decay` (±14px decay) │  │
│  │ 3. Flash Box-Shadow: `0 0 0 4px rgba(239, 68, 68, 0.4)`│  │
│  │ 4. Announce message via `aria-live="polite"`           │  │
│  └────────────────────────────────────────────────────────┘  │
│             │                                                │
│             ▼                                                │
│    ◀───[ Shake Layer: GPU-Accelerated translateX ]───▶       │
└──────────────────────────────────────────────────────────────┘
```

#### HTML

```html
<section class="auth-card" aria-labelledby="auth-title">
  <header class="auth-header">
    <div class="auth-icon-badge">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h2 id="auth-title">Secure Vault Login</h2>
    <p>Enter your cryptographic passkey to proceed.</p>
  </header>

  <form id="auth-form" class="auth-form" novalidate>
    <div class="form-group" id="input-group">
      <label for="passkey" class="form-label">Master Passkey</label>
      
      <div class="input-wrapper">
        <input 
          type="password" 
          id="passkey" 
          name="passkey"
          class="form-input" 
          placeholder="••••••••••••" 
          required 
          autocomplete="current-password"
          aria-describedby="error-feedback"
        />
        <button type="button" class="btn-toggle-vis" id="btn-toggle-vis" aria-label="Toggle password visibility">
          <svg class="icon-eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      
      <div id="error-feedback" class="error-feedback" role="alert" aria-live="polite">
        <!-- Dynamic error message injected via JavaScript -->
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary-bounce" id="btn-submit">
        <span class="btn-label">Authenticate</span>
        <svg class="btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
        </svg>
      </button>
      
      <button type="button" class="btn-secondary" id="btn-demo-error">
        Simulate Error Shake
      </button>
    </div>
  </form>
</section>
```

#### CSS

```css
:root {
  --color-bg: #090d16;
  --color-surface: #111827;
  --color-border: #1f2937;
  --color-text-main: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-error: #ef4444;
  --color-error-glow: rgba(239, 68, 68, 0.25);
  
  --radius-lg: 16px;
  --radius-md: 10px;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Shake parameters */
  --shake-distance: 14px;
}

/* Card Container */
.auth-card {
  max-inline-size: 420px;
  inline-size: 100%;
  margin-inline: auto;
  padding: 32px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7),
              0 0 0 1px rgba(255, 255, 255, 0.05);
  font-family: var(--font-sans);
  color: var(--color-text-main);
}

.auth-header {
  text-align: center;
  margin-block-end: 28px;
}

.auth-icon-badge {
  inline-size: 52px;
  block-size: 52px;
  margin-inline: auto;
  margin-block-end: 16px;
  display: grid;
  place-items: center;
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-primary);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
}

.auth-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0;
}

/* Form Styles */
.form-group {
  margin-block-end: 24px;
  position: relative;
}

.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-block-end: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  /* Transform container for GPU shake */
  will-change: transform;
}

.form-input {
  inline-size: 100%;
  padding: 12px 42px 12px 16px;
  font-size: 0.9375rem;
  background-color: var(--color-bg);
  color: var(--color-text-main);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.btn-toggle-vis {
  position: absolute;
  inset-inline-end: 12px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  transition: color 150ms ease;
}

.btn-toggle-vis:hover {
  color: var(--color-text-main);
}

/* Error State & Keyframe Animation */
@keyframes form-input-shake {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  12.5% {
    transform: translate3d(calc(var(--shake-distance) * -1), 0, 0);
  }
  25% {
    transform: translate3d(calc(var(--shake-distance) * 0.85), 0, 0);
  }
  37.5% {
    transform: translate3d(calc(var(--shake-distance) * -0.65), 0, 0);
  }
  50% {
    transform: translate3d(calc(var(--shake-distance) * 0.45), 0, 0);
  }
  62.5% {
    transform: translate3d(calc(var(--shake-distance) * -0.25), 0, 0);
  }
  75% {
    transform: translate3d(calc(var(--shake-distance) * 0.12), 0, 0);
  }
  87.5% {
    transform: translate3d(calc(var(--shake-distance) * -0.04), 0, 0);
  }
}

/* Trigger Class Applied by JS */
.has-error .input-wrapper {
  animation: form-input-shake 480ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.has-error .form-input {
  border-color: var(--color-error);
  box-shadow: 0 0 0 4px var(--color-error-glow);
  background-color: rgba(239, 68, 68, 0.04);
}

.error-feedback {
  min-block-size: 20px;
  font-size: 0.8125rem;
  color: var(--color-error);
  margin-block-start: 6px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 200ms ease, transform 200ms ease;
}

.has-error .error-feedback {
  opacity: 1;
  transform: translateY(0);
}

/* Button with Spring Pop Release */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary-bounce {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
  
  /* Elastic Overshoot Transition */
  transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease,
              filter 200ms ease;
  will-change: transform;
}

.btn-primary-bounce:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.45);
}

.btn-primary-bounce:active {
  transform: translateY(1px) scale(0.96);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
  transition-duration: 150ms;
}

.btn-spinner {
  display: none;
  animation: spin 800ms linear infinite;
  margin-inline-start: 8px;
}

.btn-primary-bounce.is-loading .btn-spinner {
  display: inline-block;
}

.btn-primary-bounce.is-loading .btn-label {
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-secondary {
  padding: 10px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: var(--color-text-main);
}
```

---

### Pattern 2: Interactive Notification Bell with Multi-Stage Pendulum Jiggle & Badge Elastic Pop

A notification system demonstrating angular decay oscillation around the suspension apex with a secondary badge spring pop.

```
          [ SUSPENSION PIVOT (transform-origin: top center) ]
                                   ●
                                 ╱   ╲  ±20° Initial Arc
                                ╱     ╲
                               ┌───────┐
                               │  BELL │ ──▶ Decaying Radial Arc
                               └───────┘
                                   O ──▶ [ Clapper Follow-Through ]
                                   
                                [ +3 ] ──▶ [ scale(0) ──> scale(1.4) ──> scale(1.0) ]
                                            (Elastic Badge Pop-In)
```

#### HTML

```html
<div class="notification-system">
  <div class="notification-bell-widget" id="bell-widget">
    <button class="btn-bell" id="btn-trigger-bell" aria-label="Notifications (3 unread)">
      <!-- SVG Bell Structure -->
      <svg class="icon-bell" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path class="bell-dome" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path class="bell-clapper" d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      
      <!-- Elastic Animated Counter Badge -->
      <span class="notification-badge" id="notif-badge">3</span>
    </button>
  </div>

  <div class="bell-controls">
    <button type="button" class="btn-trigger-action" id="btn-ring-bell">
      Send Notification (Trigger Wiggle)
    </button>
  </div>
</div>
```

#### CSS

```css
:root {
  --bell-gold: #f59e0b;
  --badge-red: #ef4444;
  --spring-overshoot: cubic-bezier(0.34, 1.75, 0.64, 1);
}

.notification-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: #0f172a;
  border-radius: 20px;
  border: 1px solid #1e293b;
}

.notification-bell-widget {
  position: relative;
  display: inline-block;
}

.btn-bell {
  position: relative;
  inline-size: 64px;
  block-size: 64px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
}

.btn-bell:hover {
  background-color: #273549;
  border-color: #475569;
  color: #f8fafc;
}

/* Bell Dome Animation with Angular Decay */
@keyframes bell-ring-pendulum {
  0%, 100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(22deg);
  }
  20% {
    transform: rotate(-18deg);
  }
  32% {
    transform: rotate(14deg);
  }
  44% {
    transform: rotate(-10deg);
  }
  56% {
    transform: rotate(6deg);
  }
  68% {
    transform: rotate(-3deg);
  }
  80% {
    transform: rotate(1.5deg);
  }
  90% {
    transform: rotate(-0.5deg);
  }
}

/* Clapper Secondary Phase Delay Animation */
@keyframes clapper-swing {
  0%, 100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-4px);
  }
  30% {
    transform: translateX(3.5px);
  }
  45% {
    transform: translateX(-2.5px);
  }
  60% {
    transform: translateX(1.5px);
  }
  75% {
    transform: translateX(-0.8px);
  }
}

/* Active Ring State */
.is-ringing .icon-bell {
  transform-origin: top center; /* Critical: pivot from hanger loop */
  animation: bell-ring-pendulum 800ms cubic-bezier(0.33, 1, 0.68, 1) both;
  color: var(--bell-gold);
}

.is-ringing .bell-clapper {
  animation: clapper-swing 800ms ease-out both;
}

/* Elastic Pop-in Badge */
.notification-badge {
  position: absolute;
  inset-block-start: 2px;
  inset-inline-end: 2px;
  min-inline-size: 22px;
  block-size: 22px;
  padding-inline: 6px;
  background-color: var(--badge-red);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  border: 2px solid #0f172a;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
  
  /* Rest State */
  transform: scale(1);
  transition: transform 400ms var(--spring-overshoot);
  will-change: transform;
}

@keyframes badge-elastic-pop {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.45);
  }
  70% {
    transform: scale(0.85);
  }
  85% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.is-ringing .notification-badge {
  animation: badge-elastic-pop 700ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.btn-trigger-action {
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}

.btn-trigger-action:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-trigger-action:active {
  transform: translateY(1px);
}
```

---

### Pattern 3: Physics-Accurate Gravity Drop Modal with Dynamic Contact Shadows

A modal dialog that drops from the ceiling under gravitational acceleration ($g = 9.8\text{m/s}^2$), squashes upon hitting the viewport floor, rebounds twice, and synchronizes its contact shadow spread and opacity.

```
            [ CEILING / AIRBORNE ]
              ┌───────────────┐  scale(0.88, 1.15) ── Height stretched
              │  MODAL CARD   │
              └───────────────┘
                      │
                      ▼ Gravitational Acceleration: cubic-bezier(0.47, 0, 0.745, 0.715)
                      │
             ┌─────────────────┐ scale(1.22, 0.78) ── Width squashed on impact
             │   MODAL CARD    │
  ═══════════╧═════════════════╧════════════ contact baseline
             (•••••••••••••••••) Shadow: max blur & max opacity on contact
```

#### HTML

```html
<div class="modal-viewport-wrapper">
  <!-- Backdrop Overlay -->
  <div class="modal-backdrop" id="modal-backdrop" aria-hidden="true"></div>

  <!-- Animated Modal Stage -->
  <div class="modal-stage">
    <div class="modal-shadow-anchor" id="modal-shadow"></div>
    
    <dialog class="gravity-modal-card" id="gravity-modal" aria-labelledby="modal-heading" open>
      <div class="modal-status-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h3 id="modal-heading">Deployment Successful</h3>
      <p class="modal-desc">
        Edge cluster nodes have synchronized across 14 geographical regions with zero-downtime health status.
      </p>

      <div class="modal-footer">
        <button type="button" class="btn-modal-dismiss" id="btn-retrigger-drop">
          Replay Gravity Drop
        </button>
      </div>
    </dialog>
  </div>
</div>
```

#### CSS

```css
:root {
  --modal-bg: #18181b;
  --modal-border: #27272a;
  --color-success: #10b981;
}

.modal-viewport-wrapper {
  position: relative;
  min-block-size: 520px;
  inline-size: 100%;
  display: grid;
  place-items: center;
  background: #09090b;
  border-radius: 20px;
  overflow: hidden;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  opacity: 1;
  transition: opacity 300ms ease;
}

.modal-stage {
  position: relative;
  inline-size: 100%;
  max-inline-size: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

/* Modal Card Gravity Keyframes */
@keyframes gravity-card-drop {
  0% {
    opacity: 0;
    transform: translate3d(0, -320px, 0) scale3d(0.85, 1.25, 1);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Fall in */
  }
  28% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale3d(1.24, 0.76, 1); /* Floor Contact 1 */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); /* Rebound up */
  }
  46% {
    transform: translate3d(0, -65px, 0) scale3d(0.94, 1.08, 1); /* Apex 1 */
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Fall 2 */
  }
  64% {
    transform: translate3d(0, 0, 0) scale3d(1.1, 0.9, 1); /* Floor Contact 2 */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); /* Rebound 2 */
  }
  78% {
    transform: translate3d(0, -18px, 0) scale3d(0.98, 1.02, 1); /* Apex 2 */
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  90% {
    transform: translate3d(0, 0, 0) scale3d(1.03, 0.97, 1); /* Floor Contact 3 */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale3d(1, 1, 1); /* Rest */
  }
}

/* Synchronized Contact Shadow Keyframes */
@keyframes contact-shadow-pulse {
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 1);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  28% {
    opacity: 0.8;
    transform: scale3d(1.2, 1, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  46% {
    opacity: 0.25;
    transform: scale3d(0.65, 0.65, 1);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  64% {
    opacity: 0.7;
    transform: scale3d(1.08, 1, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  78% {
    opacity: 0.45;
    transform: scale3d(0.85, 0.85, 1);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  90% {
    opacity: 0.65;
    transform: scale3d(1.02, 1, 1);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    opacity: 0.6;
    transform: scale3d(1, 1, 1);
  }
}

.gravity-modal-card {
  position: relative;
  inline-size: 100%;
  margin: 0;
  padding: 32px 28px;
  background: var(--modal-bg);
  border: 1px solid var(--modal-border);
  border-radius: 24px;
  color: #f4f4f5;
  text-align: center;
  
  /* CRITICAL: transform origin set to bottom baseline */
  transform-origin: bottom center;
  will-change: transform, opacity;
  animation: gravity-card-drop 1100ms both;
}

.modal-shadow-anchor {
  position: absolute;
  inset-block-end: -12px;
  inline-size: 85%;
  block-size: 20px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9) 0%, transparent 75%);
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity;
  animation: contact-shadow-pulse 1100ms both;
}

.modal-status-icon {
  inline-size: 60px;
  block-size: 60px;
  margin-inline: auto;
  margin-block-end: 20px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.gravity-modal-card h3 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.modal-desc {
  color: #a1a1aa;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.btn-modal-dismiss {
  inline-size: 100%;
  padding: 12px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  background: #2563eb;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 150ms;
}

.btn-modal-dismiss:hover {
  background: #1d4ed8;
  transform: scale(1.02);
}

.btn-modal-dismiss:active {
  transform: scale(0.97);
}
```

---

### Pattern 4: iOS App Deletion "Jiggle Mode" (Continuous Asynchronous Shake Grid)

An interface reproducing the iconic operating system "edit/wobble mode" with desynchronized animation phases across cards and spring-loaded delete badges.

```
┌─────────────────────────────────────────────────────────────┐
│  DESYNCHRONIZED PHASE JIGGLE GRID ARCHITECTURE              │
│                                                             │
│  Item 1: --delay: -0.15s; --angle:  1.6deg;                │
│  Item 2: --delay: -0.35s; --angle: -1.8deg; (Phase Shift)  │
│  Item 3: --delay: -0.05s; --angle:  1.4deg;                │
│  Item 4: --delay: -0.25s; --angle: -1.5deg;                │
│                                                             │
│  Result: Eliminates robotic synchronous lockstep oscillation│
└─────────────────────────────────────────────────────────────┘
```

#### HTML

```html
<section class="jiggle-workspace" aria-label="App Workspace">
  <div class="workspace-header">
    <h3>Launchpad Grid</h3>
    <button type="button" class="btn-toggle-jiggle" id="btn-toggle-jiggle">
      Toggle Edit Mode
    </button>
  </div>

  <div class="app-grid" id="app-grid">
    <!-- App Item 1 -->
    <div class="app-card" style="--phase-delay: -0.12s; --rot-limit: 1.8deg; --trans-limit: 1px;">
      <button class="btn-delete-badge" aria-label="Delete Analytics App">×</button>
      <div class="app-icon icon-purple">📊</div>
      <span class="app-title">Analytics</span>
    </div>

    <!-- App Item 2 -->
    <div class="app-card" style="--phase-delay: -0.38s; --rot-limit: -2.1deg; --trans-limit: 1.2px;">
      <button class="btn-delete-badge" aria-label="Delete Cloud App">×</button>
      <div class="app-icon icon-blue">☁️</div>
      <span class="app-title">Cloud Vault</span>
    </div>

    <!-- App Item 3 -->
    <div class="app-card" style="--phase-delay: -0.22s; --rot-limit: 1.6deg; --trans-limit: 0.8px;">
      <button class="btn-delete-badge" aria-label="Delete Security App">×</button>
      <div class="app-icon icon-emerald">🛡️</div>
      <span class="app-title">Firewall</span>
    </div>

    <!-- App Item 4 -->
    <div class="app-card" style="--phase-delay: -0.45s; --rot-limit: -1.9deg; --trans-limit: 1.1px;">
      <button class="btn-delete-badge" aria-label="Delete Settings App">×</button>
      <div class="app-icon icon-amber">⚙️</div>
      <span class="app-title">Settings</span>
    </div>
  </div>
</section>
```

#### CSS

```css
.jiggle-workspace {
  padding: 32px;
  background: #0f172a;
  border-radius: 20px;
  border: 1px solid #1e293b;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: 28px;
}

.workspace-header h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  margin: 0;
}

.btn-toggle-jiggle {
  padding: 8px 16px;
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.btn-toggle-jiggle:hover {
  background: #475569;
}

/* App Grid Layout */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  user-select: none;
  cursor: pointer;
}

.app-icon {
  inline-size: 72px;
  block-size: 72px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 2rem;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.5);
  transition: transform 200ms ease;
}

.icon-purple  { background: linear-gradient(135deg, #a855f7, #6366f1); }
.icon-blue    { background: linear-gradient(135deg, #38bdf8, #2563eb); }
.icon-emerald { background: linear-gradient(135deg, #34d399, #059669); }
.icon-amber   { background: linear-gradient(135deg, #fbbf24, #d97706); }

.app-title {
  color: #cbd5e1;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Delete Button Badge with Elastic Reveal */
.btn-delete-badge {
  position: absolute;
  inset-block-start: -6px;
  inset-inline-start: 6px;
  inline-size: 24px;
  block-size: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: #ffffff;
  border: 2px solid #0f172a;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 10;
  
  /* Hidden by Default */
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease;
}

/* The Organic Jiggle Keyframes */
@keyframes os-icon-wobble {
  0% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
  25% {
    transform: rotate(var(--rot-limit)) translate3d(var(--trans-limit), calc(var(--trans-limit) * -1), 0);
  }
  50% {
    transform: rotate(0deg) translate3d(calc(var(--trans-limit) * -1), var(--trans-limit), 0);
  }
  75% {
    transform: rotate(calc(var(--rot-limit) * -1)) translate3d(var(--trans-limit), var(--trans-limit), 0);
  }
  100% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
}

/* Active Edit Mode Styles */
.is-editing .app-card {
  will-change: transform;
  animation: os-icon-wobble 260ms ease-in-out infinite alternate;
  animation-delay: var(--phase-delay);
}

.is-editing .btn-delete-badge {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
```

---

### Pattern 5: High-Impact Game UI Critical Strike Trauma Shake with Chromatic Aberration

A multi-axis screen trauma shake combined with pseudo-chromatic aberration color offsets for games, esports dashboards, or critical system breach alarms.

```
┌────────────────────────────────────────────────────────────┐
│  GAME IMPACT TRAUMA SHAKE WITH CHROMATIC SHIFT             │
│                                                            │
│       Layer R (Red):   translateX(+4px) blend-mode: screen │
│   ──▶ Layer Base:      Heavy Random 2D Trauma Displacement │
│       Layer B (Cyan):  translateX(-4px) blend-mode: screen │
│                                                            │
│   Trauma Equation: Displacement = Max * (Trauma_Level)^2   │
└────────────────────────────────────────────────────────────┘
```

#### HTML

```html
<div class="impact-viewport" id="impact-viewport">
  <div class="trauma-screen-layer" id="trauma-layer">
    <div class="hud-card">
      <div class="hud-header">
        <span class="hud-badge">REACTOR CORE</span>
        <span class="hud-alert-level">SEVERITY 5</span>
      </div>

      <div class="hud-meter-container">
        <div class="hud-meter-bar" style="inline-size: 88%;"></div>
      </div>

      <div class="hud-stat-grid">
        <div class="hud-stat">
          <span class="stat-label">PRESSURE</span>
          <span class="stat-value">942.8 kPa</span>
        </div>
        <div class="hud-stat">
          <span class="stat-label">TEMP</span>
          <span class="stat-value text-danger">1,480 °C</span>
        </div>
      </div>

      <button type="button" class="btn-detonate-trauma" id="btn-trigger-impact">
        TRIGGER IMPACT TRAUMA
      </button>
    </div>
  </div>
</div>
```

#### CSS

```css
.impact-viewport {
  position: relative;
  padding: 40px;
  background: #000000;
  border-radius: 20px;
  overflow: hidden;
}

/* Multi-Axis Trauma Keyframes */
@keyframes trauma-impact-shake {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0));
  }
  8% {
    transform: translate3d(-18px, 12px, 0) rotate(-3.5deg);
    filter: drop-shadow(6px 0 0 rgba(239, 68, 68, 0.8)) drop-shadow(-6px 0 0 rgba(6, 182, 212, 0.8));
  }
  18% {
    transform: translate3d(16px, -14px, 0) rotate(3deg);
    filter: drop-shadow(-4px 0 0 rgba(239, 68, 68, 0.7)) drop-shadow(4px 0 0 rgba(6, 182, 212, 0.7));
  }
  30% {
    transform: translate3d(-12px, -8px, 0) rotate(-2deg);
    filter: drop-shadow(3px 0 0 rgba(239, 68, 68, 0.5)) drop-shadow(-3px 0 0 rgba(6, 182, 212, 0.5));
  }
  44% {
    transform: translate3d(9px, 8px, 0) rotate(1.5deg);
    filter: drop-shadow(-2px 0 0 rgba(239, 68, 68, 0.3)) drop-shadow(2px 0 0 rgba(6, 182, 212, 0.3));
  }
  58% {
    transform: translate3d(-6px, 4px, 0) rotate(-0.8deg);
  }
  72% {
    transform: translate3d(3px, -2px, 0) rotate(0.4deg);
  }
  86% {
    transform: translate3d(-1px, 1px, 0) rotate(-0.2deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
  }
}

.trauma-screen-layer.is-traumatized {
  will-change: transform, filter;
  animation: trauma-impact-shake 650ms cubic-bezier(0.12, 0.9, 0.24, 1) both;
}

/* Sci-Fi HUD Container */
.hud-card {
  max-inline-size: 380px;
  margin-inline: auto;
  padding: 28px;
  background: #0a0a0c;
  border: 1.5px solid #27272a;
  border-radius: 16px;
  color: #fafafa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: 20px;
}

.hud-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #71717a;
  letter-spacing: 0.05em;
}

.hud-alert-level {
  font-size: 0.75rem;
  font-weight: 800;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  padding: 4px 8px;
  border-radius: 4px;
}

.hud-meter-container {
  inline-size: 100%;
  block-size: 8px;
  background: #18181b;
  border-radius: 4px;
  margin-block-end: 20px;
  overflow: hidden;
}

.hud-meter-bar {
  block-size: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}

.hud-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-block-end: 28px;
}

.hud-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.6875rem;
  color: #71717a;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.text-danger {
  color: #ef4444;
}

.btn-detonate-trauma {
  inline-size: 100%;
  padding: 14px;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #000000;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}

.btn-detonate-trauma:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-detonate-trauma:active {
  transform: translateY(1px);
}
```

---

## 4. Modern CSS Spring Easing Engine (`linear()`)

The CSS Easing Level 2 `linear()` function allows front-end developers to express complex spring physics without requiring `@keyframes` declarations or heavy external JavaScript animation libraries (like GSAP or Framer Motion).

### 4.1 How the `linear()` Easing Function Works

Instead of interpolating linearly between a single starting value ($0$) and ending value ($1$), `linear(p0, p1 t1%, p2 t2%, ...)` takes an array of mathematical sample points. The browser smoothly interpolates between these control points on the compositor thread.

```
CSS linear() Spring Parameterization:
linear(
  0,                  /* Start at 0% */
  0.006, 0.025 2.8%,  /* Initial slow inertia */
  0.539 18.9%,        /* Rapid acceleration */
  1.168 47.1%,        /* Peak overshoot (+16.8%) */
  0.971 85.3%,        /* Minor undershoot (-2.9%) */
  1 100%              /* Settle at 100% */
)
```

### 4.2 Production Spring Curve Presets

Copy and paste these mathematically simulated presets directly into your design system tokens:

```css
:root {
  /* Preset 1: Gentle Elastic (Subtle UI components, tooltips, dropdowns) */
  --spring-gentle: linear(
    0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%,
    1.017 20.2%, 1.049 23.6%, 1.054 27.3%, 1.038 31.5%,
    1.015 36.3%, 0.999 41.8%, 0.993 48.2%, 0.996 55.9%,
    1 100%
  );

  /* Preset 2: Bouncy Spring (Toggle switches, game icons, reward badges) */
  --spring-bouncy: linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%,
    0.849 31.5%, 0.937 38.1%, 0.968 41.8%, 0.991 45.7%,
    1.002 50.1%, 1.003 62%, 0.999 73.6%, 1 100%
  );

  /* Preset 3: Ultra Wobbly / Rubber Band (Popups, celebratory cards) */
  --spring-wobbly: linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 6.8%,
    0.25 10.4%, 0.383 14.3%, 0.536 18.5%, 0.707 23.2%,
    0.887 28.5%, 0.97 31.4%, 1.044 34.6%, 1.106 38.2%,
    1.149 42.3%, 1.168 47.1%, 1.157 52.4%, 1.119 58.3%,
    1.066 64.8%, 1.011 72.2%, 0.977 80.4%, 0.971 85.3%,
    0.978 90.7%, 1 100%
  );
}

/* Usage in Pure CSS Transitions */
.interactive-spring-box {
  transition: transform 800ms var(--spring-bouncy);
}

.interactive-spring-box:hover {
  transform: translateY(-12px) scale(1.05);
}
```

---

## 5. Performance, Compositing & GPU Pipelines

To maintain 60 FPS on low-power mobile devices and 120 FPS on high-refresh ProMotion displays, bounce and shake animations must run exclusively on the **GPU Compositor Thread**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BROWSER RENDERING PIPELINE IMPACT                        │
│                                                                             │
│  Property Animated     Layout (Reflow)      Paint (Repaint)    Composite    │
│  ─────────────────     ───────────────      ───────────────    ─────────    │
│  `left` / `top`        ❌ Triggers Layout   ❌ Triggers Paint  ✅ Runs       │
│  `margin`              ❌ Triggers Layout   ❌ Triggers Paint  ✅ Runs       │
│  `width` / `height`    ❌ Triggers Layout   ❌ Triggers Paint  ✅ Runs       │
│  `transform`           🟢 Skipped           🟢 Skipped         ✅ GPU Fast  │
│  `opacity`             🟢 Skipped           🟢 Skipped         ✅ GPU Fast  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Rules for GPU-Accelerated Shakes:

1. **Never Animate Positional Properties**:
   - 🚫 **Bad**: `left: -10px; margin-left: 10px;` (Triggers layout recalculation for all sibling DOM elements).
   - ✅ **Good**: `transform: translate3d(-10px, 0, 0);` (GPU hardware texture offset).

2. **Use 3D Transforms to Promote Elements to Compositor Layers**:
   - Using `translate3d(x, y, 0)` or adding `will-change: transform` instructs the browser rendering engine (Blink/Gecko/WebKit) to isolate the element onto its own dedicated GPU backing store layer before animation starts, preventing paint-invalidation artifacts.

3. **Clean Up `will-change` on Static Elements**:
   - While `will-change: transform` optimizes active animations, leaving dozens of static elements with `will-change` permanently active consumes excess GPU VRAM. Apply it only during active states or on primary interactive triggers.

---

## 6. Accessibility & Reduced Motion Engineering

Rapid spatial oscillations, violent shakes, and erratic bounces can trigger **vertigo, nausea, migraines, or severe disorientation** in users with vestibular disorders. The WCAG 2.2 guideline **2.3.3 (Animation from Interactions)** requires mechanisms to disable non-essential motion.

```
┌─────────────────────────────────────────────────────────────┐
│             REDUCED MOTION ADAPTATION STRATEGY              │
│                                                             │
│  Standard Mode:                                             │
│  Horizontal Cartesian Shake (±14px rapid oscillation)       │
│                                                             │
│  Reduced Motion Mode (@media prefers-reduced-motion):       │
│  1. Spatial displacement stripped (`transform: none`)       │
│  2. Subtle chromatic/opacity pulse substituted             │
│  3. Duration shortened to prevent lingering focus traps     │
└─────────────────────────────────────────────────────────────┘
```

### Comprehensive Reduced Motion Fallback Implementation

```css
/* Universal Reduced-Motion Reset for Bounce & Shake */
@media (prefers-reduced-motion: reduce) {
  /* 1. Kill rapid position and rotation oscillations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* 2. Provide accessible static/fade alternatives for Error Shakes */
  .has-error .input-wrapper {
    animation: accessible-error-flash 300ms ease-in-out !important;
  }

  /* 3. Provide non-spatial pulse for Notification Bells */
  .is-ringing .icon-bell {
    animation: accessible-bell-pulse 400ms ease !important;
  }

  /* 4. Provide instant modal opacity fade without drop physics */
  .gravity-modal-card {
    animation: accessible-modal-fade 200ms ease-out both !important;
  }
}

@keyframes accessible-error-flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes accessible-bell-pulse {
  0%, 100% {
    color: inherit;
  }
  50% {
    color: var(--bell-gold);
  }
}

@keyframes accessible-modal-fade {
  from {
    opacity: 0;
    transform: none;
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

---

## 7. Interactive JavaScript State Controller

When triggering CSS animations via JavaScript, a common pitfall is that **re-applying a class does not restart the animation if the class is already active**. The browser coalesces DOM updates and ignores repeated additions.

Here is the production-grade **JavaScript Animation Lifecycle Controller** providing clean re-triggering via DOM reflow flushing, Web Animations API (WAAPI), and event listener cleanup:

```javascript
/**
 * Master Controller for CSS Bounce & Shake Micro-Interactions
 */
class MotionController {
  /**
   * Triggers a CSS keyframe animation on a target element,
   * safely re-triggering even if already active.
   * 
   * @param {HTMLElement} element - Target DOM node
   * @param {string} animationClass - CSS class defining the animation
   * @param {Function} [onComplete] - Optional completion callback
   */
  static triggerAnimation(element, animationClass, onComplete) {
    if (!element) return;

    // 1. Remove class if currently applied
    element.classList.remove(animationClass);

    // 2. Force DOM Reflow (flushes layout queue to restart animation engine)
    void element.offsetWidth;

    // 3. Re-add class to trigger keyframe sequence
    element.classList.add(animationClass);

    // 4. One-time clean-up listener on animation end
    const handleAnimationEnd = (event) => {
      // Ensure we only listen to events bubbling from target itself
      if (event.target !== element) return;

      element.removeEventListener('animationend', handleAnimationEnd);
      element.classList.remove(animationClass);

      if (typeof onComplete === 'function') {
        onComplete(element);
      }
    };

    element.addEventListener('animationend', handleAnimationEnd, { once: true });
  }

  /**
   * Programmatic Web Animations API (WAAPI) Fallback for dynamic physics
   */
  static triggerDynamicShake(element, intensity = 14, duration = 450) {
    if (!element) return;

    // Check user preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.animate([
        { opacity: 1 },
        { opacity: 0.4 },
        { opacity: 1 }
      ], { duration: 300 });
      return;
    }

    const keyframes = [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: `translate3d(-${intensity}px, 0, 0)` },
      { transform: `translate3d(${intensity * 0.8}px, 0, 0)` },
      { transform: `translate3d(-${intensity * 0.5}px, 0, 0)` },
      { transform: `translate3d(${intensity * 0.25}px, 0, 0)` },
      { transform: `translate3d(-${intensity * 0.1}px, 0, 0)` },
      { transform: 'translate3d(0, 0, 0)' }
    ];

    element.animate(keyframes, {
      duration: duration,
      easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      fill: 'none'
    });
  }
}

// Global Initialization & UI Binding
document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth Form Error Shake Binding
  const authForm = document.getElementById('auth-form');
  const inputGroup = document.getElementById('input-group');
  const errorFeedback = document.getElementById('error-feedback');
  const btnDemoError = document.getElementById('btn-demo-error');
  const passkeyInput = document.getElementById('passkey');

  function triggerFormError(msg = 'Invalid cryptographic passkey. Please verify credentials.') {
    errorFeedback.textContent = msg;
    inputGroup.classList.add('has-error');
    passkeyInput.setAttribute('aria-invalid', 'true');

    // Trigger shake animation cycle
    MotionController.triggerAnimation(inputGroup.querySelector('.input-wrapper'), 'input-wrapper-anim', () => {
      // Re-focus input for accessibility
      passkeyInput.focus();
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!passkeyInput.value.trim() || passkeyInput.value.length < 8) {
        triggerFormError();
      }
    });
  }

  if (btnDemoError) {
    btnDemoError.addEventListener('click', () => {
      triggerFormError();
    });
  }

  // Clear error on input typing
  if (passkeyInput) {
    passkeyInput.addEventListener('input', () => {
      if (inputGroup.classList.contains('has-error')) {
        inputGroup.classList.remove('has-error');
        passkeyInput.removeAttribute('aria-invalid');
        errorFeedback.textContent = '';
      }
    });
  }

  // 2. Notification Bell Ring Binding
  const bellWidget = document.getElementById('bell-widget');
  const btnRingBell = document.getElementById('btn-ring-bell');
  const notifBadge = document.getElementById('notif-badge');

  if (btnRingBell && bellWidget) {
    btnRingBell.addEventListener('click', () => {
      // Increment badge count
      const currentCount = parseInt(notifBadge.textContent, 10) || 0;
      notifBadge.textContent = currentCount + 1;

      // Trigger bell ring wobble
      MotionController.triggerAnimation(bellWidget, 'is-ringing');
    });
  }

  // 3. Gravity Modal Replay Binding
  const gravityModal = document.getElementById('gravity-modal');
  const modalShadow = document.getElementById('modal-shadow');
  const btnRetriggerDrop = document.getElementById('btn-retrigger-drop');

  if (btnRetriggerDrop && gravityModal && modalShadow) {
    btnRetriggerDrop.addEventListener('click', () => {
      MotionController.triggerAnimation(gravityModal, 'gravity-modal-anim');
      MotionController.triggerAnimation(modalShadow, 'modal-shadow-anim');
    });
  }

  // 4. iOS Jiggle Mode Toggle Binding
  const appGrid = document.getElementById('app-grid');
  const btnToggleJiggle = document.getElementById('btn-toggle-jiggle');

  if (btnToggleJiggle && appGrid) {
    btnToggleJiggle.addEventListener('click', () => {
      const isEditing = appGrid.classList.toggle('is-editing');
      btnToggleJiggle.textContent = isEditing ? 'Done Editing' : 'Toggle Edit Mode';
      btnToggleJiggle.setAttribute('aria-pressed', isEditing ? 'true' : 'false');
    });
  }

  // 5. Sci-Fi Trauma Impact Shake Binding
  const traumaLayer = document.getElementById('trauma-layer');
  const btnTriggerImpact = document.getElementById('btn-trigger-impact');

  if (btnTriggerImpact && traumaLayer) {
    btnTriggerImpact.addEventListener('click', () => {
      MotionController.triggerAnimation(traumaLayer, 'is-traumatized');
    });
  }
});
```

---

## 8. Common Pitfalls, Edge Cases & Debugging Matrix

```
+-----------------------------------+---------------------------------------+---------------------------------------+
| Symptom / Bug                     | Root Cause                            | Production Solution                   |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Animation only fires once         | Browser ignores duplicate class add   | Execute reflow `void el.offsetWidth`  |
| when button clicked repeatedly    | if class is already present in DOM.   | before re-adding animation class.     |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Text or sub-pixels become blurry  | Unaccelerated transforms render onto  | Use `translate3d(x,y,0)` or set       |
| during or after bounce/shake      | non-integer rasterization planes.     | `backface-visibility: hidden`.        |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Bouncing object expands downward  | `transform-origin` defaults to        | Set `transform-origin: bottom center` |
| below the floor line on impact    | `center center` (50% 50%).            | (50% 100%) for ground impacts.        |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Jiggle grid looks like a synchronized| All grid children share the same   | Assign randomized `--phase-delay`     |
| mechanical military march         | `animation-delay` and angle limits.   | offsets (e.g., `-0.12s`, `-0.35s`).   |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Stuttering / frame drops during   | Animating layout properties (`left`,  | Animate only `transform` and          |
| shake on mobile devices           | `margin`, `width`, `height`).         | isolate layer via `will-change`.      |
+-----------------------------------+---------------------------------------+---------------------------------------+
| Motion causes nausea / vertigo    | No `@media (prefers-reduced-motion)`  | Swap spatial displacement for subtle  |
| for users with vestibular issues  | fallback provided.                    | opacity fades or color flashes.       |
+-----------------------------------+---------------------------------------+---------------------------------------+
```

---

## 9. Master Production Checklist

Before shipping bounce and shake animations to production, verify compliance with this engineering checklist:

- [ ] **Physics Realism**:
  - [ ] Does the motion exhibit natural exponential amplitude decay rather than halting abruptly?
  - [ ] Are gravity impacts accompanied by volume-preserving squash & stretch ($\text{scaleX} \times \text{scaleY} \approx 1.0$)?
  - [ ] Is `transform-origin` correctly set (`top center` for pendulums, `bottom center` for ground impacts)?

- [ ] **Rendering & Performance**:
  - [ ] Are animations restricted strictly to `transform` and `opacity` properties?
  - [ ] Are positional properties (`top`, `left`, `margin`) completely avoided?
  - [ ] Is hardware layer promotion utilized via `translate3d(x,y,z)` or `will-change: transform`?
  - [ ] Does the animation run at 60 FPS / 120 FPS without dropped frames on target mobile hardware?

- [ ] **Accessibility & UX**:
  - [ ] Is a comprehensive `@media (prefers-reduced-motion: reduce)` media query implemented?
  - [ ] Are error states announced clearly to screen readers via `aria-live="polite"` or `role="alert"`?
  - [ ] Is the animation duration calibrated appropriately ($300\text{ms}$ to $550\text{ms}$ for error feedback; never exceeding $1000\text{ms}$ for functional UI)?
  - [ ] Can the animation be safely re-triggered without DOM race conditions or UI lockups?
