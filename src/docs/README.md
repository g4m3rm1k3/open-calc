# Welcome to Open-Calc Docs

## Want to contribute a lesson or video?

Open the **contributing** folder in the sidebar. Start with `01 Overview` for the full guide, or jump straight to the template for your lesson type:

- **03 Concept Template** — math, physics, linear algebra, calculus
- **04 Coding Template** — Python and JavaScript lessons
- **05 Simulation Template** — Three.js and Canvas 2D simulations
- **06 Science Template** — chemistry and lab-style lessons
- **08 Adding Videos** — link YouTube videos to lessons

---

This is your documentation hub. Tutorials live here and are available to everyone.

## Adding Your Own Tutorials

Drop `.md` files into any folder inside `src/docs/`. They appear automatically — no configuration needed.

**Naming convention:** Prefix files with a number to control order.

```
src/docs/
  tutorials/
    cad/
      01-overview.md
      02-sketching.md
      03-extrude.md
    javascript/
      01-variables.md
```

## Writing Markdown

Everything is supported: headings, tables, code blocks, and math.

### Math

Inline math: $E = mc^2$

Block math:

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### Code

```js
function hello(name) {
  return `Hello, ${name}!`;
}
```

### Tables

| Feature | Status |
|---------|--------|
| Markdown rendering | ✅ |
| Math (KaTeX) | ✅ |
| Personal editor | ✅ |
| Auto file discovery | ✅ |
