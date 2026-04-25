# Welcome to the Docs

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
