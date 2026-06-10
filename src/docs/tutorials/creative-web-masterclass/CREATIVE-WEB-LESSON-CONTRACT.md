# Creative Web Masterclass — Lesson Contract

## §1 — Purpose

This course teaches CSS, JavaScript, Canvas 2D, and Three.js by building one thing: a stunning
personal portfolio site. Every lab produces a runnable result. The portfolio builds section by
section until the final lab, when all the pieces assemble into a polished, animated, mobile-ready
site with a Three.js background, scroll-driven reveals, a ribbon navigation, and interactive
mini-apps embedded in each section.

The audience is someone who wants to write beautiful front-end code from scratch — no frameworks,
no build tools, no npm. Just HTML files that open in a browser. After this course, the student
will be able to build any visual interface they can imagine using the web platform directly.

Tech stack: vanilla HTML5 + CSS3 + JavaScript (ES2020+) + Three.js (CDN). No framework. No
build tool. Every file opens in Chrome by double-clicking or via VS Code Live Server.

---

## §2 — The Two-File Rule

Every lesson for Creative Web Masterclass is governed by two documents simultaneously.
Neither overrides the other. Before writing any lesson, the agent must read both.
(1) CURRICULUM.json — the lab index, concept list, tags, and visible results.
(2) This file — the concept block template, laws, naming rules, and self-check.

---

## §3 — The Tech Stack (authoritative)

```
Frontend:    HTML5 + CSS3 + JavaScript ES2020 (vanilla, no framework)
3D:          Three.js r165+ (loaded via importmap from CDN — jspm.io or esm.sh)
Controls:    Three.js/examples/jsm/controls/OrbitControls.js (same CDN)
Canvas:      HTML5 Canvas API (native, no library)
Styling:     Plain CSS (custom properties, flexbox, grid, animations)
Tooling:     VS Code + Live Server extension (or open index.html directly)
Testing:     Manual — visual inspection in Chrome DevTools
Build:       None — files are served as-is
```

No library may be used that is not listed here. If a new library is introduced, it must have
its own "Introducing [library]" lab that explains what it is, why it is needed, and what the
CDN import looks like.

---

## §4 — Naming Rules (non-negotiable)

All names in lesson code examples must follow these rules. Violations are errors.

| Item | Rule | Example |
|---|---|---|
| HTML files | lowercase-hyphenated | `index.html`, `lab-17-scene.html` |
| CSS files | lowercase-hyphenated | `styles.css`, `portfolio.css` |
| JS files | lowercase-hyphenated | `particles.js`, `scene.js` |
| Project folders | `lab-NN-short-name/` | `lab-17-three-scene/` |
| CSS class names | kebab-case | `.hero-section`, `.nav-dot`, `.card-grid` |
| CSS custom properties | `--kebab-case` | `--color-primary`, `--spacing-lg` |
| JS functions | camelCase verbs | `updateParticles`, `trackScroll`, `initScene` |
| JS classes (rare) | PascalCase nouns | `ParticleSystem`, `SceneBuilder` |
| JS variables | camelCase nouns | `particleArray`, `scrollY`, `mouseX` |
| JS constants (fixed) | camelCase | `canvas`, `ctx`, `renderer` — NOT ALL_CAPS unless a true config constant |
| Three.js root objects | match Three.js convention | `scene`, `camera`, `renderer`, `clock` |
| Particle objects | stored in array named `particles` | `const particles = []` |
| Animation loop function | always named `animate` | `function animate() { requestAnimationFrame(animate) }` |
| Three.js objects in a scene | camelCase descriptive noun | `torusKnot`, `pointLight`, `floorPlane` |

**Domain-specific rules:**

**Three.js setup** — Every Three.js lab must declare `scene`, `camera`, `renderer` as the
first three variables. No shortening, no renaming. Students reading any Three.js lab must
recognize the same three names every time.

**Particle systems** — The particle array is always named `particles`. Each particle is a
plain object `{ x, y, vx, vy }` for 2D or `{ x, y, z, vx, vy, vz }` for 3D. No classes
for particles unless the lab explicitly teaches classes.

**Animation loops** — The top-level animation function is always named `animate`. It always
ends with `requestAnimationFrame(animate)`. Students must see this pattern consistently.

**CSS custom properties** — Color tokens follow the pattern `--color-[role]` (e.g.
`--color-primary`, `--color-bg`, `--color-text`). Spacing tokens follow `--spacing-[size]`
(e.g. `--spacing-sm`, `--spacing-md`, `--spacing-lg`).

---

## §5 — The Concept Block Template (mandatory)

Every concept that is tagged in CURRICULUM.json must have a concept block in the lesson.
The concept block has exactly 6 sections in this order. No section may be omitted. No
section may be reordered.

```markdown
### Concept: [Name]

**What it is:** One sentence. The precise definition. Not a metaphor. The actual thing.
If the concept is an abstraction, say what it abstracts.

**The problem without it:** Show the code or situation that exists WITHOUT this concept.
Concrete — running code that produces wrong output, or a behavior the student has seen fail.
Do not describe the problem in prose only. Show it.

**How it works:** The mechanism. Not just what it does — why it does it that way.
The causal chain from input to output. For abstractions: what it hides, what the raw
version looks like, what invariant it protects.

**The code:** The minimal working example. Every line explained. No unexplained syntax.
No forward references. If a keyword appears that has not been defined in a prior lab,
define it here before showing the block.

**Try it differently:** An alternative the student can switch to in under 30 seconds
that produces a different (usually worse) result. Name the alternative, show exactly
what to change, describe what they will see. Then tell them to switch back.

**Transfer:** Where does this concept appear OUTSIDE this specific project? One concrete
example from a different domain. This prevents the student from thinking the concept is
portfolio-specific.
```

---

## §6 — Lesson Structure (mandatory)

Every lesson markdown file must contain these sections in this order:

1. **Header** — series name, lab number, title, prerequisites, what this lab adds, time estimate
2. **What You Will Build** — exact visible end state with ASCII art or description; not goals
3. **Quick Check Questions** — 2–4 questions the student answers before reading (active recall)
4. **Concept Blocks** — one full block per tag, in the order the concepts appear in the steps
5. **Step-by-Step Build** — numbered steps; every step is runnable; every step has a CSS AND SEE or SAVE AND TRY checkpoint
6. **What Just Happened** — narrative that connects the steps back to the concept blocks
7. **Self-Check** — 3–5 questions the student answers from memory after completing the lab
8. **What's Next** — one sentence preview of the next lab
9. **Transfer Exercise** — one task that applies today's concept in a non-portfolio context

**Code block size rule:** No code block longer than ~8 lines without an explanatory paragraph
between them. If a block is longer, split it and explain the second part.

**Checkpoint rule:** Every step that produces a visible result must be followed by a
**CSS AND SEE** block (for pure CSS changes) or **SAVE AND TRY** block (for HTML or JS
changes) telling the student exactly what to look for.

---

## §7 — Self-Check (agent must pass before submitting any lesson)

Before delivering any lesson, verify all of the following. If any check fails, the lesson
is not complete.

```
[ ] Every tag in CURRICULUM.json for this lab has a concept block in the lesson
[ ] Every concept block has all 6 sections in the correct order
[ ] Every step in the build sequence produces a runnable result (Law 1)
[ ] No term appears before it is defined (Law 6)
[ ] Every decision in the lesson names an alternative and explains why it was not chosen (Law 9)
[ ] visibleAtEnd from CURRICULUM.json matches the end state described in §2 of the lesson
[ ] No library is used that is not in the tech stack list (§3 of this contract)
[ ] Naming rules (§4) are followed in all code examples
[ ] The Transfer exercise uses a domain different from portfolio/web (a game, a data tool, a simulation)
[ ] The lesson can be completed in one sitting (under 90 minutes)
[ ] No code block is longer than ~8 lines without an explanatory paragraph between them
[ ] Every Three.js lesson declares scene, camera, renderer as the first three variables
[ ] Every animation loop function is named animate and ends with requestAnimationFrame(animate)
```

---

## §8 — The 9 Teaching Laws (summary)

These are stated in full in LESSON-REQUIREMENTS-UNIVERSAL.md. All nine apply to every lesson.

1. **Always Runnable** — every step runs NOW. Never write code that "will work after step 8."
2. **Visible Before Styled** — HTML before CSS. Structure before appearance. See the skeleton first.
3. **Build Naturally** — minimum code that lets you see the next thing. No speculative infrastructure.
4. **Try Before You See** — ask the student to predict before revealing the answer.
5. **Explain, Don't Describe** — state WHY and HOW, not just WHAT. Insight over catalog.
6. **Define Before Use** — every term and keyword defined before it appears in code.
7. **Name the Abstraction** — for every abstraction: what it hides, the raw version, the protected invariant.
8. **Show the Problem First** — introduce every pattern or solution by showing the pain it fixes.
9. **Name Alternatives** — every design decision explains what was NOT chosen and why.

---

## §9 — Project Folder Structure

```
creative-web-masterclass/
  CURRICULUM.json                     ← authoritative lab index
  CREATIVE-WEB-LESSON-CONTRACT.md     ← this file
  README.md                           ← course overview
  lessons/
    LAB-00-DevTools-Your-First-HTML-File.md
    LAB-01-LiveServer-Auto-Reload-Workflow.md
    ...
  projects/
    lab-00/
      index.html
    lab-01/
      index.html
      styles.css
    ...
    portfolio/                        ← the final assembled portfolio
      index.html
      styles.css
      main.js
      scene.js
```
