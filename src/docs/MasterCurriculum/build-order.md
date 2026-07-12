# Series Build Order — Dependency Sequence

Build in this order. Each series only depends on series above it (existing or already built).
Do not skip ahead. A series is only useful once its prerequisites exist.

Existing series are marked ✓. Build targets are numbered.

---

## Tier 0 — Exists

✓ python-fundamentals
✓ javascript-fundamentals
✓ typescript-fundamentals
✓ cpp-fundamentals
✓ csharp-fundamentals
✓ java-fundamentals
✓ sql-fundamentals
✓ dsa-python
✓ html-dom
✓ css-fundamentals → css-selectors → css-box-model → css-layout → css-flexbox → css-grid → css-responsive → css-animation → css-visual-design → css-professional
✓ backend-fundamentals
✓ git-version-control → git-advanced

---

## Tier 1 — Depends only on existing series

**1. software-construction**
Depends on: python-fundamentals OR javascript-fundamentals
Unlocks: everything. The bridge between "knows a language" and "builds software."

**2. cs-foundations**
Depends on: any language fundamentals
Unlocks: performance-engineering, rust-fundamentals, async-programming (event loop)

**3. debugging-fundamentals**
Depends on: any language fundamentals
Unlocks: testing-fundamentals (understanding what fails), professional-engineering

**4. functional-programming**
Depends on: javascript-fundamentals OR python-fundamentals
Unlocks: async-programming (callbacks/promises), react-fundamentals

**5. database-design**
Depends on: sql-fundamentals
Unlocks: rest-apis, professional-engineering

**6. browser-apis**
Depends on: javascript-fundamentals, html-dom
Unlocks: frontend-engineering, web-security

**7. devops-concepts**
Depends on: git-version-control, any language fundamentals
Unlocks: professional-engineering, rest-apis (deployment context)

---

## Tier 2 — Depends on Tier 1 builds

**8. clean-code**
Depends on: software-construction
Unlocks: design-patterns (patterns assume clean code), professional-engineering

**9. oop-design**
Depends on: software-construction
Unlocks: design-patterns, software-architecture

**10. testing-fundamentals**
Depends on: software-construction, debugging-fundamentals
Unlocks: professional-engineering, tdd in later series

**11. performance-engineering**
Depends on: cs-foundations, software-construction
Unlocks: professional-engineering (quality attributes)

**12. async-programming**
Depends on: functional-programming, javascript-fundamentals
Unlocks: react-fundamentals (effects), go-fundamentals (goroutines/channels)

**13. frontend-engineering**
Depends on: browser-apis, javascript-fundamentals, css-fundamentals
Unlocks: react-fundamentals, vue-fundamentals

**14. web-security**
Depends on: browser-apis, backend-fundamentals
Unlocks: rest-apis (auth and security), professional-engineering

---

## Tier 3 — Depends on Tier 2 builds

**15. design-patterns**
Depends on: oop-design, clean-code
Unlocks: software-architecture, professional-engineering

**16. rest-apis**
Depends on: backend-fundamentals, database-design, web-security, devops-concepts
Unlocks: professional-engineering (API design)

**17. react-fundamentals**
Depends on: frontend-engineering, async-programming, javascript-fundamentals
Unlocks: (application-level projects)

**18. vue-fundamentals**
Depends on: frontend-engineering, async-programming, javascript-fundamentals
Unlocks: (application-level projects)

**19. rust-fundamentals**
Depends on: cs-foundations (memory model), software-construction
Unlocks: (systems programming projects)

**20. go-fundamentals**
Depends on: software-construction, async-programming (concurrency concepts)
Unlocks: (backend projects)

---

## Tier 4 — Depends on Tier 3 builds

**21. software-architecture**
Depends on: software-construction, oop-design, design-patterns, clean-code
Unlocks: professional-engineering (architecture quality attributes)

---

## Tier 5 — Capstone discipline

**22. professional-engineering**
Depends on: software-construction, clean-code, testing-fundamentals, oop-design,
            design-patterns, software-architecture, performance-engineering,
            debugging-fundamentals, devops-concepts, rest-apis
This is the synthesis series. Teaches how all disciplines compose at production scale.

---

## After all 22 series: Learning Paths

Once all series exist, wire them into named learning paths:
- Frontend Developer Path
- Backend Developer Path
- Full-Stack Path
- Systems Programmer Path
- Data Engineer Path
- Software Engineering Fundamentals Path
