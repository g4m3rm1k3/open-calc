# Welcome to Studio

Studio is a full coding environment — read tutorials, write and run code side-by-side, and build your own docs. Everything lives here.

## What You Can Do

| Feature | Description |
|---------|-------------|
| 📖 Tutorials | Browse bundled markdown docs with syntax highlighting, KaTeX math, and runnable code blocks |
| ▶ Code Along | Open a live JS/Python workspace next to any tutorial and run code instantly |
| ✏️ Editor | Write your own markdown docs with live preview, auto-save, and export |
| 🔗 Override | Customize any bundled tutorial with your own local version |
| 📦 Share | Export and import doc packs as `.open-calc-doc.json` files |

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

## Code Along

Click **Code Along** in the top bar to open the live workspace. Then hit **▶ Run** on any code block to send it straight into the editor.

Supported languages: JavaScript, Python, TypeScript, HTML/CSS.

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
function greet(name) {
  return `Hello, ${name}!`;
}
```

### Tables

| Feature | Status |
|---------|--------|
| Markdown rendering | ✅ |
| Math (KaTeX) | ✅ |
| Syntax-highlighted code blocks | ✅ |
| Live code execution | ✅ |
| Personal editor + auto-save | ✅ |
| Tutorial overrides | ✅ |
| Export / import doc packs | ✅ |
| Auto file discovery | ✅ |
