# CSS Masterclass — Lesson 9: Selectors, Pseudo-classes, Pseudo-elements & Modern CSS

---

## 1. Selector Reference

### Basic selectors

```css
*            { }   /* universal — every element */
div          { }   /* type/element */
.card        { }   /* class */
#hero        { }   /* ID */
[type]       { }   /* has attribute */
[type="text"]{ }   /* exact attribute value */
[class*="card"]{ } /* attribute contains "card" */
[href^="https"]{ } /* attribute starts with "https" */
[href$=".pdf"] { } /* attribute ends with ".pdf" */
```

### Combinators

```css
.parent .child  { }  /* descendant (any depth) */
.parent > .child{ }  /* direct child only */
.a + .b         { }  /* adjacent sibling (immediately after) */
.a ~ .b         { }  /* general sibling (any .b after .a) */
```

### Pseudo-classes — element state

```css
/* User interaction */
:hover       { }   /* cursor over element */
:focus       { }   /* keyboard/programmatic focus */
:focus-within{ }   /* element or descendant is focused */
:focus-visible{ }  /* focused via keyboard (not mouse click) — prefer over :focus for outlines */
:active      { }   /* being clicked/pressed */
:visited     { }   /* visited link */

/* Structural */
:root        { }   /* <html> element — use for global variables */
:empty       { }   /* no children (including text) */
:first-child { }   /* first sibling of its parent */
:last-child  { }   /* last sibling */
:only-child  { }   /* no siblings */
:nth-child(n){ }   /* nth child */
:nth-last-child(n){ }  /* nth from end */
:first-of-type { }
:last-of-type  { }
:nth-of-type(n){ }

/* Form states */
:checked     { }   /* checked checkbox/radio */
:disabled    { }   /* disabled input */
:enabled     { }   /* enabled input */
:required    { }   /* required input */
:optional    { }   /* optional (not required) */
:valid       { }   /* passes validation */
:invalid     { }   /* fails validation */
:placeholder-shown { } /* placeholder is visible */
:read-only   { }   /* can't be edited */
:indeterminate{ }  /* checkbox in indeterminate state */

/* Logic */
:not(.active)      { }  /* doesn't match .active */
:is(h1, h2, h3)    { }  /* matches any in list — takes highest specificity in list */
:where(h1, h2, h3) { }  /* same but ZERO specificity — great for resets */
:has(.icon)        { }  /* parent selector — element that has a matching descendant */
```

### `:nth-child()` patterns

```css
:nth-child(2)     /* second child exactly */
:nth-child(odd)   /* 1, 3, 5... */
:nth-child(even)  /* 2, 4, 6... */
:nth-child(3n)    /* every 3rd: 3, 6, 9... */
:nth-child(3n+1)  /* every 3rd starting at 1: 1, 4, 7... */
:nth-child(n+4)   /* 4th and beyond */
:nth-child(-n+3)  /* first 3 only */

/* Stripe table rows */
tr:nth-child(even) { background: var(--color-surface); }

/* First 3 cards featured */
.card:nth-child(-n+3) { border: 2px solid var(--color-accent); }
```

---

## 2. `:has()` — The Parent Selector

`:has()` is one of the biggest additions to CSS in years. Select elements based on their children.

```css
/* Card that has an image */
.card:has(img) { padding: 0; }

/* Form that has an invalid input */
form:has(:invalid) { border-color: var(--color-error); }

/* Label next to a required input */
label:has(+ input:required)::after {
  content: ' *';
  color: var(--color-error);
}

/* Grid that has 4+ items — switch to 4 columns */
.grid:has(.item:nth-child(4)) {
  grid-template-columns: repeat(4, 1fr);
}

/* Nav item that's currently active */
.nav:has(.nav-item.active) .nav-dropdown { display: block; }

/* Hide label when input has content (floating label) */
.field:has(input:not(:placeholder-shown)) .label {
  transform: translateY(-100%) scale(0.85);
}

/* Dark body if dark toggle is checked */
body:has(#dark-toggle:checked) {
  --color-bg: #1a1a2e;
  --color-text: #eee;
}
```

---

## 3. Pseudo-elements

Pseudo-elements inject styled content without extra HTML.

```css
::before  { }  /* insert before element's content */
::after   { }  /* insert after element's content */
/* Must have content: '' to render (can be empty string) */

::placeholder { }  /* input placeholder text */
::selection   { }  /* user-selected text */
::first-line  { }  /* first line of a block */
::first-letter{ }  /* first letter (for drop caps) */
::marker      { }  /* list item bullet/number */
::file-selector-button { }  /* file input button */
```

### `::before` and `::after` patterns

```css
/* Decorative quote marks */
blockquote::before {
  content: '"';
  font-size: 4rem;
  color: var(--color-accent);
  line-height: 0;
  vertical-align: -0.5em;
}

/* Required field asterisk */
.required::after {
  content: ' *';
  color: var(--color-error);
}

/* Icon via content */
.external-link::after {
  content: ' ↗';
  font-size: 0.8em;
}

/* Badge count */
.cart-icon::after {
  content: attr(data-count);  /* read from HTML attribute */
  position: absolute;
  top: -8px; right: -8px;
  background: var(--color-error);
  color: white;
  font-size: 0.75rem;
  padding: 2px 5px;
  border-radius: 100px;
}

/* Decorative line through heading */
.heading-with-lines {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.heading-with-lines::before,
.heading-with-lines::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

/* Hover underline */
.fancy-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 2px;
  background: currentColor;
  transition: width 200ms ease-out;
}
.fancy-link:hover::after { width: 100%; }
```

### `::selection`

```css
::selection {
  background: var(--color-accent);
  color: white;
}

/* Per-element selection */
.code-block::selection { background: #264f78; }
```

### `::marker`

```css
li::marker {
  color: var(--color-accent);
  content: '▸ ';   /* custom marker character */
  font-size: 0.8em;
}
```

---

## 4. `:focus-visible` — Keyboard-Friendly Focus

```css
/* Remove ugly outline on mouse click... */
:focus { outline: none; }

/* ...but restore it for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Better pattern: use both */
.btn {
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 150ms ease, box-shadow 150ms ease;
}
.btn:focus-visible {
  outline-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgb(59 130 246 / 0.2);
}
```

---

## 5. CSS Nesting (Modern Native)

Native CSS nesting (no preprocessor needed):

```css
.card {
  padding: 1.5rem;
  border-radius: var(--radius);

  & .title {
    font-size: var(--text-lg);
    /* & = .card — direct nesting */
  }

  &:hover {
    transform: translateY(-4px);
    /* & = .card:hover */
  }

  &.featured {
    border: 2px solid var(--color-accent);
    /* & = .card.featured — no space = AND selector */
  }

  & + & {
    margin-top: 1rem;
    /* .card + .card */
  }

  @media (min-width: 768px) {
    /* Media queries can be nested too */
    display: flex;
    gap: 1.5rem;
  }
}
```

---

## 6. `:is()` and `:where()` — Grouping Without Pain

```css
/* Old way — repeating selectors */
h1 a:hover,
h2 a:hover,
h3 a:hover { color: var(--color-accent); }

/* With :is() */
:is(h1, h2, h3) a:hover { color: var(--color-accent); }

/* :is() specificity = highest specificity in its argument list */
:is(#id, .class) p { }  /* specificity = (1,0,1) because #id is in there */

/* :where() has ZERO specificity — good for base styles */
:where(h1, h2, h3, h4) { line-height: 1.2; }
/* Easy to override — no specificity cost */
```

---

## 7. `@scope` — Scoped Styles (Modern)

```css
/* Styles only apply within .card */
@scope (.card) {
  .title { font-weight: 600; }
  .body  { color: var(--color-text-muted); }
}

/* Scope with exclusion hole */
@scope (.card) to (.card-footer) {
  /* Only applies inside .card but NOT inside .card-footer */
  p { line-height: 1.7; }
}
```

---

## 8. Logical Properties

Logical properties are direction-aware. Essential for internationalization (RTL languages).

```css
/* Physical → Logical */
margin-top     → margin-block-start
margin-bottom  → margin-block-end
margin-left    → margin-inline-start
margin-right   → margin-inline-end

padding-top    → padding-block-start
padding-left   → padding-inline-start

width          → inline-size
height         → block-size
max-width      → max-inline-size
min-height     → min-block-size

/* Shorthand logical */
margin-block: 1rem;         /* top + bottom */
margin-inline: auto;        /* left + right (centering!) */
padding-block: 1rem 2rem;   /* top, bottom */
padding-inline: 1.5rem;

inset-block: 0;             /* top + bottom = 0 */
inset-inline: 0;            /* left + right = 0 */

border-block-end: 1px solid var(--color-border);   /* bottom border */
border-inline-start: 4px solid var(--color-accent); /* left border */
```

**Start using these today:** `margin-inline: auto` instead of `margin: 0 auto`, `padding-inline` instead of `padding-left/right`.

---

## 9. `scroll-snap` — Declarative Carousels & Pagers

```css
/* Scroll container */
.slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;   /* snap on x axis, always snap */
  scroll-snap-type: x proximity;   /* snap only when close to snap point */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
}

/* Snap targets */
.slide {
  scroll-snap-align: start;   /* snap to start of each slide */
  scroll-snap-align: center;  /* snap to center */
  flex-shrink: 0;
  width: 100%;
}

/* Stop overshooting */
.slide {
  scroll-snap-stop: always;  /* prevent skipping slides */
}
```

---

## 10. `aspect-ratio`

```css
/* Responsive images/videos without padding hacks */
.video-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.square { aspect-ratio: 1; }
.portrait-photo { aspect-ratio: 3 / 4; }
.card-image { aspect-ratio: 4 / 3; object-fit: cover; }
```

---

## 11. Modern CSS Properties Cheatsheet

```css
/* Fit text to container */
font-size: fit-content;

/* Avoid widow/orphan words */
text-wrap: balance;    /* balance heading line lengths */
text-wrap: pretty;     /* avoid orphans in paragraphs */

/* Scroll behavior */
scroll-behavior: smooth;  /* on :root or html for page scrolling */

/* Accent color — style native checkboxes, radios */
:root { accent-color: var(--color-accent); }

/* Color scheme (native dark mode for browser UI) */
:root { color-scheme: light dark; }

/* Column gap for multi-column text */
.multi-col {
  columns: 3;
  column-gap: 2rem;
  column-rule: 1px solid var(--color-border);
}

/* Overscroll behavior */
.modal { overscroll-behavior: contain; } /* prevent scroll chaining */
.dropdown { overscroll-behavior-y: contain; }

/* CSS grid masonry (experimental) */
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: masonry;
}

/* View transitions API */
::view-transition-old(main) { animation: slide-out 300ms ease; }
::view-transition-new(main) { animation: slide-in 300ms ease; }
```

---

## Quick Reference Card

```
Selectors:
  :is(a, b, c)     → group, takes highest specificity in list
  :where(a, b, c)  → group, zero specificity (good for resets)
  :has(.child)     → parent selector — element that contains .child
  :not(.active)    → negate
  :focus-visible   → keyboard focus only (use for outlines)

Pseudo-elements:
  ::before / ::after  → inject content (needs content: '')
  ::selection         → custom text selection color
  ::placeholder       → style placeholder text
  ::marker            → style list bullets

:nth-child tricks:
  :nth-child(-n+3)    → first 3
  :nth-child(n+4)     → 4th and beyond
  :nth-child(odd/even)

Logical properties:
  margin-inline: auto  → horizontal centering
  padding-block: 1rem  → top + bottom padding
  inline-size          → width
  block-size           → height

scroll-snap:
  container: scroll-snap-type: x mandatory
  items: scroll-snap-align: start

Other essentials:
  aspect-ratio: 16/9
  text-wrap: balance      → even heading lines
  overscroll-behavior: contain  → trap scroll in modal
  accent-color: var(--accent)   → style native inputs
```

---

## Appendix: Debugging CSS

```css
/* The nuclear debug tool — outline everything */
* { outline: 1px solid red; }

/* Debug a specific subtree */
.problem * { outline: 1px solid tomato; }

/* Highlight elements causing overflow */
* { outline: 1px solid rgba(255,0,0,0.2); }
```

**Browser DevTools shortcuts:**
- **Elements panel → Computed tab**: see final computed values, trace where each comes from
- **Styles panel → Filter box**: search for a property
- **Toggle :hover/:focus/:active**: force pseudo-class states
- **Grid/Flex overlays**: visual badge on grid/flex containers in the elements panel
- **Color contrast checker**: click a color swatch, see WCAG contrast ratio
- **`$0`** in console: refers to selected element in DevTools

**Common gotchas:**
- Text not showing → check `color` and `background` don't match
- Element invisible → check `opacity: 0`, `visibility: hidden`, `display: none`, size = 0
- Element off-screen → check `position: absolute` + `overflow: hidden` on parent
- z-index not working → check element isn't `position: static`; check stacking contexts
- Sticky not sticking → parent has `overflow: hidden` or `height` is too small
- Flex item won't shrink below content → add `min-width: 0` on the flex item

---

**End of CSS Masterclass.** Return to any lesson when you need it.