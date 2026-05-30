## What does this PR do?

<!-- One paragraph. What changed and why. -->

## Type of change

- [ ] New lesson(s)
- [ ] New visualization
- [ ] Lesson quality upgrade (adding missing sections)
- [ ] Bug fix
- [ ] Documentation
- [ ] UI / component change
- [ ] Build / tooling

---

## Checklist — All PRs

- [ ] `npm run build` completes without errors
- [ ] No duplicate IDs in any JS content object

## Checklist — New or updated lessons

- [ ] `id` is unique across the entire codebase
- [ ] `slug` is lowercase, hyphenated, ≤ 4 words
- [ ] `chapter` matches the chapter `number` in its `index.js`
- [ ] Lesson is registered in the chapter's `index.js`
- [ ] `quiz` array has at least 6 questions
- [ ] At least one quiz question is type `input` (mathjs-graded)
- [ ] All `choice` answer strings verbatim match one option string
- [ ] All `examples` entries have unique `id` fields
- [ ] `semantics.core` covers every symbol introduced in the lesson
- [ ] `spiral.recoveryPoints` and `spiral.futureLinks` are present
- [ ] `mentalModel` has 3–5 entries (≤ 10 words each)
- [ ] `misconceptions` has at least 2 entries
- [ ] `mastery.targetLevel` is declared
- [ ] `intuition.prose[0]` begins with `**Where you are in the story:**`
- [ ] A `type: 'sequencing'` callout is present in `intuition.callouts`

## Checklist — New visualizations

- [ ] Component is in the correct subfolder (`d3/`, `react/`, `three/`, `matter/`)
- [ ] Registered in `VizFrame.jsx` with a unique string key
- [ ] Accepts `params = {}` prop
- [ ] Dark mode supported (D3: color token object; React: `dark:` classes)
- [ ] D3 visualizations use `ResizeObserver` for responsive redraw
- [ ] `mathBridge` follows: orient → numbered steps → "The key lesson:"

## Screenshots / GIFs (if UI change)

<!-- Drag images here -->

## Related issues

Closes #
