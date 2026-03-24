# Calculus Audit + Physics Bridge Plan (Chapters 1–6)

## Scope

- Included: `src/content/chapter-1` through `src/content/chapter-6`
- Excluded by request: `chapter-0`
- Goal: strengthen intuition-first calculus instruction, ensure section completeness, pair concepts with physics intuition, and reduce LaTeX-in-JS rendering mistakes.

## Quick Quality Findings

### Strong already

- Many lessons already have deep prose, rich examples, and strong theorem-level rigor (especially in derivative and FTC-heavy files).
- Visual coverage is broad and includes both conceptual and procedural tools.

### Highest-impact improvements

1. **Math string reliability**
   - Several lessons contain LaTeX commands in JS strings that are under-escaped (e.g., `\text`, `\delta` cases). These can silently degrade rendering.
2. **Visualization consistency**
   - Some lessons include many `VideoEmbed` entries with little/no explicit “what this viz teaches” guidance.
   - Target: each visualization should have a `title` + `mathBridge` + `caption` where pedagogically useful.
3. **Physics pairing strategy**
   - Pairing exists in some lessons, but it is not yet systematically chapter-aligned across all Calc chapters.

## Concrete Fixes Applied in this pass

- Escaping fixes:
  - `src/content/chapter-1/03-epsilon-delta.js`
    - Fixed unescaped `\delta` in callout bodies.
  - `src/content/chapter-2/06-reading-derivatives.js`
    - Fixed under-escaped math commands in projectile derivative example (`\Rightarrow`, `\approx`, `\text`).

## Chapter-by-Chapter Bridge Map (Calc ↔ Physics)

## Chapter 1 — Limits & Continuity

- **Core intuition**: “approach behavior” before exact value.
- **Physics bridge**: average velocity over shrinking interval.
- **Use now**:
  - `SecantToTangent`
  - `LimitRacingCar`
  - `ContinuityViz`
  - `EpsilonDelta`
- **Add/expand prompts**:
  - “What measurement device corresponds to `h -> 0`?”
  - “What physical breakdown happens if continuity fails?”

## Chapter 2 — Derivatives

- **Core intuition**: tangent slope = instantaneous rate.
- **Physics bridge**: `x(t) -> v(t) -> a(t)` chain.
- **Use now**:
  - `PositionVelocityAcceleration`
  - `DerivativeBuilder`
  - `TangentLineConstructor`
  - `SketchDerivativeGame`
- **Add/expand prompts**:
  - Interpret maxima/minima as turning points in motion.
  - Connect sign of derivative to direction of travel.

## Chapter 3 — Applications of Derivatives

- **Core intuition**: derivatives as decision tools (optimize, estimate, constrain).
- **Physics bridge**: related rates, local linear models, Newton iteration as physical correction loop.
- **Use now**:
  - `RelatedRatesLadder`
  - `LinearApproximation`
  - `NewtonsMethod`
  - `OptimizationViz`
- **Add/expand prompts**:
  - “Which variable is controlled vs measured?”
  - “What does the sign of rate physically mean here?”

## Chapter 4 — Integration

- **Core intuition**: accumulation with sign.
- **Physics bridge**: `a -> v -> x` via integration, work as force accumulation.
- **Use now**:
  - `RiemannSum`
  - `FTCLink`
  - `AreaAccumulator`
  - `SignedArea`
  - `WaterTank`
- **Add/expand prompts**:
  - “What quantity is being accumulated?”
  - “Which sign regions represent gain/loss physically?”

## Chapter 5 — Sequences & Series

- **Core intuition**: infinite processes as controlled approximation.
- **Physics bridge**: model approximation, truncation error, local expansions.
- **Use now**:
  - `ConvergenceViz`
  - `SeriesConvergenceLab`
  - `TaylorApproximation`
- **Add/expand prompts**:
  - “What does the remainder term mean in physical prediction?”
  - “How many terms are enough for engineering tolerance?”

## Chapter 6 — Parametric, Polar, Vectors

- **Core intuition**: coordinate choice reveals structure.
- **Physics bridge**: trajectory components, angular/radial decomposition, vector rates.
- **Use now**:
  - `PolarCurve`
  - `ParametricCurve3D`
  - `VectorKinematicsLab`
- **Add/expand prompts**:
  - “When is polar representation simpler than Cartesian?”
  - “Which derivative is radial vs tangential change?”

## New Shared Viz Concepts (Calc + Physics)

1. **Rate Pipeline Studio**
   - One editable signal; live derivative/integral chain with units panel.
   - Targets: Ch2 derivatives, Ch4 integration, Physics kinematics.
2. **Error Lens Lab**
   - Visualize linearization error and Taylor remainder against tolerance bands.
   - Targets: Ch3 linear approximation, Ch5 Taylor series, physics measurement uncertainty.
3. **Model Validity Switchboard**
   - Toggle assumptions: constant acceleration, no drag, small angle, smoothness.
   - Shows where formulas fail and why.
4. **Signed Accumulation Mapper**
   - Explicit positive/negative accumulation regions with physical interpretation badges.
   - Targets: Ch4 definite integrals + work/displacement contexts.

## Content Upgrade Checklist per Lesson

- Hook has a real decision/problem (not just a definition).
- Intuition explains _why_ the operation is needed before formula.
- Math section includes operational recipe and common traps.
- Rigor section includes one formal statement + proof skeleton or logic chain.
- At least one example has interpretation, not only computation.
- At least one challenge checks transfer (new context, same concept).
- Every key viz has:
  - `title` (what it is)
  - `mathBridge` (what to notice mathematically)
  - `caption` (why it matters)

## LaTeX-in-JS Safety Rules

- In JS strings, prefer double escaping for LaTeX commands:
  - `\\text{...}`, `\\delta`, `\\varepsilon`, `\\Rightarrow`, `\\approx`
- Keep math strings inside plain JS strings; avoid accidental escape sequences.
- If a formula is long, split conceptually into multiple proof steps instead of one giant string.
- Rebuild after edits to catch malformed strings early.

## Recommended Next Execution Order

1. Standardize viz explanation fields (`mathBridge`, `caption`) on foundational lessons in Ch1–Ch2.
2. Add explicit “physics bridge callout” blocks to 1–2 anchor lessons per chapter.
3. Add one transfer challenge per chapter that reuses the same math in a physics context.
4. Introduce first shared new viz: **Rate Pipeline Studio**.
