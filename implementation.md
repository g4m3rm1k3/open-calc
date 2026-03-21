# Fill Content Gaps: Missing Lessons, ε-δ, Squeeze Theorem & Physics

## Problem

After a full audit of all 25 lesson files across 5 chapters, several significant gaps were found:

1. **Chapter 1 is thin** — only 3 lessons vs 6 in every other chapter
2. **ε-δ Definition** — exists as a subsection in intro-limits with 2 proofs, but no standalone lesson; the continuity lesson cross-references a phantom `epsilon-delta` lesson
3. **Squeeze Theorem** — covered only as a sub-topic within limit-laws, not a dedicated lesson
4. **Limits at Infinity** — a single paragraph, no standalone lesson
5. **Continuity lesson** — very thin (149 lines vs 250-300+ in other lessons)
6. **Physics examples** — present in places but could be more interactive; some have `visualizationId` references but lack dedicated visual/animated proofs

## User Review Required

> [!IMPORTANT]
> This plan adds **3 new lessons** to Chapter 1 and significantly expands 1 existing lesson + adds physics-focused worked examples with visualizations across chapters. This is a large change; please review the scope.

> [!NOTE]
> The existing ε-δ content in [00-intro-limits.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/00-intro-limits.js) will remain untouched — the new lesson will build on it with dedicated coverage, more proofs, and animated visualizations. Similarly, the squeeze theorem subsection stays in limit-laws but gets its own full lesson.

## Proposed Changes

### Chapter 1 — New Lessons

---

#### [NEW] [03-epsilon-delta.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/03-epsilon-delta.js)

Full standalone lesson on the ε-δ definition of a limit:
- **Intuition section**: The ε-δ "game" explained step-by-step with everyday analogies
- **Math section**: Formal definition, one-sided ε-δ variants, limits at infinity ε-N version
- **Rigor section**: How to construct ε-δ proofs (scratch work vs formal proof)
- **Worked examples** (5+): linear (δ=ε/k), quadratic (δ=min(1,ε/5)), rational, showing a limit DNE via ε-δ, ε-N for limits at infinity
- **Interactive visualizations**: `EpsilonDelta` viz (already exists) with multiple function configs
- **Callouts**: misconception (δ depends on ε, not the reverse), history (Cauchy vs Weierstrass formalization)

---

#### [NEW] [04-squeeze-theorem.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/04-squeeze-theorem.js)

Full standalone lesson on the Squeeze (Sandwich) Theorem:
- **Intuition section**: Hot-dog-in-a-bun analogy expanded; multiple visual examples
- **Math section**: Formal theorem statement, proof (using ε-δ), connection to absolute value bounds
- **Worked examples** (4+): x·sin(1/x), x²·cos(1/x), sin(x)/x via geometric squeeze, (1-cos x)/x
- **The sin(x)/x proof**: Full geometric argument with unit circle areas, including interactive viz
- **Interactive visualizations**: `SqueezeTheorem` viz (already exists) with custom configs
- **Callouts**: misconception (squeeze only works when bounds share the same limit), physics example (small-angle approximation from squeeze)

---

#### [NEW] [05-limits-at-infinity.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/05-limits-at-infinity.js)

Full lesson on limits at infinity and horizontal/oblique asymptotes:
- **Intuition**: "End behavior" — what does the function do as x → ±∞?
- **Math**: Formal ε-N definition, dominance hierarchy (log ≪ polynomial ≪ exponential), horizontal asymptotes, oblique asymptotes via polynomial long division
- **Worked examples** (4+): rational (degree comparison 3 cases), exponential decay, arctan at infinity, growth rate comparisons
- **Interactive viz**: New or reuse `LimitApproach` with x→∞ mode
- **Callouts**: Misconception (∞ is not a number — "→ ∞" means "grows without bound"), history (Wallis and the "arithmetic of infinities")

---

### Chapter 1 — Existing Lesson Updates

---

#### [MODIFY] [02-continuity.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/02-continuity.js)

Expand from 149 lines to ~250+ lines:
- Add more intuition prose — examples of each discontinuity type with concrete functions
- Add a **physics worked example**: "Does a parachutist's velocity have a jump discontinuity when the chute opens?"
- Add misconception callout: "Continuous ≠ differentiable (|x| is continuous at 0 but not differentiable)"
- Add history callout: Bolzano and the first rigorous continuity definition (1817)
- Fix crossRef: update phantom `epsilon-delta` slug to `03-epsilon-delta` (or whatever the actual slug will be)

---

#### [MODIFY] [index.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-1/index.js)

Register the 3 new lessons in the chapter's lesson array.

---

### Physics Examples with Interactive Visualizations

---

#### [MODIFY] [00-tangent-problem.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-2/00-tangent-problem.js)

Add `visualizationId: 'ProjectileMotion'` to the "Galileo's Falling Ball" worked example (it currently has no viz).

---

#### [MODIFY] [00-related-rates.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-3/00-related-rates.js)

Add a physics-focused worked example: "Expanding circular oil spill" or "Sliding ladder" with the `RelatedRatesLadder` viz tied to the steps.

---

#### [MODIFY] [05-applications.js](file:///c:/Users/g4m3r/Documents/testing%20tutorials/open-calc/src/content/chapter-4/05-applications.js)

Add a worked example: "Spring work (Hooke's law)" with `SpringOscillation` viz and step-by-step derivation W = ½kx².

---

## Verification Plan

### Automated Tests
```bash
# Build check — must exit code 0
cd "c:\Users\g4m3r\Documents\testing tutorials\open-calc"
npx vite build
```
This verifies all imports resolve, no syntax errors, and the content registers correctly.

### Manual Verification
Since there are no unit tests in the project, the build is the primary automated check. After implementing:
1. Run `npm run dev` and open the browser
2. Navigate to Chapter 1 and confirm 6 lessons appear in order
3. Open the new ε-δ lesson and verify visualizations render
4. Open the new Squeeze Theorem lesson and verify the SqueezeTheorem viz renders
5. Open Limits at Infinity and verify content loads
6. Check that the crossRef from Continuity → Epsilon-Delta navigates correctly
