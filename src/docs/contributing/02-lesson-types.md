# Lesson Types

There are five lesson types. Pick the one that fits your content, then download the matching template.

---

## 1. Concept Lesson
**Template: 03 — Concept Template**

Use for: mathematics, physics, linear algebra, discrete math, calculus — any subject where you are teaching a formula, theorem, or technique.

**Structure:**
- `hook` — the motivating question and real-world context
- `intuition` — prose paragraphs building the idea from the ground up, with callouts and interactive visualizations
- `math` — the formal derivation or procedure, written precisely
- `rigor` — the proof or edge cases (optional but encouraged)
- `examples` — 3+ worked examples (easy → medium → hard), every step annotated
- `quiz` — 6+ multiple-choice questions
- `challenges` — harder problems with walkthroughs
- `notebooks` — a Python notebook and optionally an OpenMat (MATLAB) notebook

**Good for:** Calculus, Physics, Linear Algebra, Geometry, Precalc, Discrete Math

---

## 2. Coding Lesson — Python
**Template: 04 — Coding Template**

Use for: Python lessons where the student writes and runs code in a notebook.

**Structure:**
- `hook` — the motivating question
- `intuition` — brief prose context
- `PythonNotebook` cells — 4 cells: concept → visualization → application → challenge

Each cell has:
- `type: 'python'`
- `instruction` — what the student is about to do and why
- `startCode` — the starter code (runnable or with blanks to fill)
- `testCode` — optional: code that checks the student's answer

**Good for:** Python-1, Data Science, AI Engineering

---

## 3. Coding Lesson — JavaScript / Web
**Template: 04 — Coding Template (JS section)**

Use for: JavaScript, HTML/CSS, web development lessons where the student writes live web code.

**Structure:**
- Same as Python, but cells have `type: 'js'` with `html`, `css`, and `startCode` fields
- The output panel renders a live webpage in an iframe

**Good for:** Web-1, JavaScript-1, CS-1

---

## 4. Simulation Lesson
**Template: 05 — Simulation Template**

Use for: Three.js 3D simulations or Canvas 2D animations. The student writes `init()` and `update(dt)` functions in a sandbox that runs at 60 fps.

**Structure:**
- `hook` — the simulation concept
- `SimNotebook` cells with `type: '3d'` or `type: '2d'`
- Each cell gives the student scaffolded code to build or modify a simulation

**Good for:** Sim-1, Sim-2, Sim-3, Physics simulations, game logic

---

## 5. Science Lesson
**Template: 06 — Science Template**

Use for: Chemistry, Biology, Earth Science — lessons that mix narrative, interactive demos, and concept checks.

**Structure:**
- Narrative `markdown` cells tell the story
- Interactive `js` cells show the phenomenon with sliders/animations
- `choice` challenge cells let the student answer questions

**Good for:** Chemistry-1 through Chemistry-4, Physics conceptual lessons

---

## Callout types (used in all lessons)

Callouts are labeled boxes that appear inline. Use them to break up prose.

| type | When to use |
|------|------------|
| `sequencing` | Position in the chapter — what came before, what's next |
| `procedure` | A numbered list of steps (the algorithm for this topic) |
| `insight` | A non-obvious connection or shortcut |
| `warning` | A common mistake or edge case |
| `strategy` | A problem-solving approach |
| `real-world` | A real-world application callout |

```js
{
  type: 'insight',
  title: 'Why this works',
  body: 'The chain rule is just the product rule applied to a composed function...',
}
```
