# Contributing to Open-Calc

Open-Calc is an open-source learning platform. Lessons, visualizations, videos, and documentation are all plain files — no database, no CMS. If you can fill in a template, you can contribute.

---

## What you can contribute

| Type | What it is | Skill needed |
|------|-----------|--------------|
| **Lesson** | A full interactive lesson with explanations, examples, and a notebook | Fill in a JS template |
| **Video** | Link a YouTube video to automatically appear on matching lessons | Edit one JSON file |
| **Doc** | A guide, tutorial, or reference page | Write Markdown |

---

## Two paths to contribute

### Path A — Non-developer (download → fill in → submit)

1. Pick the lesson type that fits your content (see **02 — Lesson Types**)
2. Go to the **Templates** tab at the top of this page and download the matching `.js` file
3. Fill in your content — every placeholder is in `UPPER_CASE` with a comment explaining it
4. Submit by emailing `m1k3ymcl34n@gmail.com` with subject `[Lesson Submission] Your Title` and attach the file

A developer will review, test it in the app, and add it.

### Path B — Developer (clone → add file → open PR)

```
git clone https://github.com/g4m3rm1k3/open-calc
cd open-calc
npm install
npm run dev
```

1. Add your lesson file to the right folder in `src/content/<course>/`
2. Register it in that folder's `index.js`
3. Open a pull request

---

## Quality bar

Every submitted lesson must have:

- A compelling `hook.question` — something a student would actually ask
- A `hook.realWorldContext` — where this concept appears outside the classroom
- At least 3 `quiz` questions with 4 options each (answer must match an option exactly)
- At least 1 worked example with step-by-step annotations
- A notebook (Python, JS, or simulation) with real runnable code

Lessons that are too thin, have broken code, or quiz answers that don't match options will be sent back for revision.

---

## Quick links

- **02 — Lesson Types** — which template to use
- **03 — Concept Template** — math/physics/linear algebra lessons
- **04 — Coding Template** — Python and JavaScript lessons
- **05 — Simulation Template** — Three.js and Canvas2D simulations
- **06 — Science Template** — chemistry and lab-style lessons
- **07 — Visualizations** — all interactive viz components you can use
- **08 — Adding Videos** — link YouTube videos to lessons
- **09 — Naming Conventions** — IDs, file names, index.js
