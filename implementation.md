# OpenCalc Content Integration Roadmap

This roadmap integrates the best ideas from `incomplete ideas/` into the existing chapter flow, not as a separate review chapter.

## Completed in this pass

- Removed Chapter 5 from learner-facing curriculum.
- Integrated algebra-support concepts into core limits content.
- Integrated geometry-support concepts into trig, related-rates, and integration content.
- Kept `chapter-5` files as staging/reference material only (not published in navigation).

## Where ideas were integrated

### Algebra ideas (`incomplete ideas/algebra.html` + `incomplete ideas/abs-value.html`)

- Added to Chapter 1 intro limits:
  - cancellation rule clarity
  - 0/0 triage workflow
- Added to Chapter 1 epsilon-delta:
  - absolute value interval translation
  - inequality-chain checklist

### Geometry ideas (`incomplete ideas/geometry.html`)

- Added to Chapter 0 trig review:
  - similar triangles as the reason trig ratios are scale-invariant
- Added to Chapter 3 related rates:
  - geometry-first setup emphasis
- Added to Chapter 4 area accumulation:
  - circle-area-from-rings geometric intuition

## Remaining source-to-content mapping

### `incomplete ideas/derivatives.html`

Next target:
- Chapter 3 (`curve-sketching`) and Chapter 2 (`differentiation-rules`):
  - derivative-level reading framework (f, f', f'', f''')
  - sign-chart workflow upgrades

### `incomplete ideas/calc-problems.html`

Next target:
- Distribute into existing challenge blocks across Chapter 1 and Chapter 2:
  - epsilon-delta graph reading
  - piecewise continuity/differentiability practice

### `incomplete ideas/precalc_cheatsheet.html`

Next target:
- Add a compact in-app quick-reference page (nonlinear navigation aid) linked from About and lesson footers.

## Implementation order (next)

1. Integrate derivative-reading framework into Chapter 2 and Chapter 3 lessons.
2. Add 3-5 challenge problems from `calc-problems.html` into existing lessons.
3. Create a lightweight quick-reference page from `precalc_cheatsheet.html`.
4. Refactor high-value standalone HTML demos into reusable React visualization components.

## Weekly workflow while you take calculus

1. Record where lecture/homework felt confusing.
2. Add one explanation block to the matching existing lesson.
3. Add one worked example or challenge in the same lesson.
4. Add a cross-reference from prerequisite to target concept.
5. Build, check links, and keep the main curriculum publish-ready.
