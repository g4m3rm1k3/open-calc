---
series: css-professional
level: 5
title: "@property — Typed Custom Properties"
lang: css
---

# @property — Typed Custom Properties

CSS custom properties are untyped strings by default. That means `--progress: 0.5` and `--progress: purple` are equally valid — the browser doesn't know it's a number. This has one critical consequence: you cannot animate a custom property from `0` to `1`, because the browser doesn't know how to interpolate between two strings.

`@property` adds a type declaration to a custom property. Once the browser knows `--progress` is a `<number>`, it can interpolate it — and every element that reads `--progress` in its styles will animate smoothly as the value changes.

By the end of this lesson you will understand the `@property` syntax (`syntax`, `inherits`, `initial-value`), know why typed properties enable animation while untyped ones do not, and be able to use `@property` to build gradient animation and other effects impossible with untyped properties.

## The problem with untyped custom properties

```html
<div class="untyped-demo">
  <div class="bar bar-untyped">Untyped (can't animate)</div>
  <div class="bar bar-typed">Typed @property (can animate)</div>
</div>
```

```css
/* Untyped custom property — browsers can't interpolate between values */
.bar-untyped {
  --progress: 0%;
  width: var(--progress);
  transition: --progress 1s ease;  /* ← does NOT work — type unknown */
  background: #6366f1;
  height: 2.5rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
}
.bar-untyped:hover { --progress: 80%; }  /* jumps instantly — no transition */

/* Typed @property — browser knows it's a <percentage>, can interpolate */
@property --progress-typed {
  syntax: '<percentage>';       /* type declaration */
  initial-value: 0%;            /* starting value */
  inherits: false;              /* don't pass to children */
}
.bar-typed {
  --progress-typed: 0%;
  width: var(--progress-typed);
  transition: --progress-typed 600ms ease;  /* ← works! */
  background: #10b981;
  height: 2.5rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
}
.bar-typed:hover { --progress-typed: 80%; }  /* smooth transition */

.untyped-demo { display: flex; flex-direction: column; gap: 0.75rem; font-family: system-ui, sans-serif; }
.bar { width: 20%; min-width: 160px; }
```

**CS lens:** When you write `transition: color 300ms`, the browser knows how to interpolate between two colors because it understands the `color` type. Custom properties are opaque strings — the browser has no idea `--progress: 0%` and `--progress: 80%` are numbers it could interpolate between. `@property` registers the property with the CSS type system, giving the browser the information it needs to interpolate, and also enabling paint worklets (Houdini) to use the typed value.

## Animating a color with @property

```html
<div class="color-anim-demo">
  <div class="gradient-card">
    <h3>Hover for animated gradient</h3>
    <p>The gradient is driven by a typed hue custom property — something impossible without @property.</p>
  </div>
</div>
```

```css
@property --hue-start {
  syntax: '<number>';
  initial-value: 245;
  inherits: false;
}
@property --hue-end {
  syntax: '<number>';
  initial-value: 280;
  inherits: false;
}

.gradient-card {
  padding: 2rem;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    hsl(var(--hue-start), 80%, 55%),
    hsl(var(--hue-end), 80%, 55%)
  );
  color: white;
  transition: --hue-start 600ms ease, --hue-end 600ms ease;
  font-family: system-ui, sans-serif;
}
.gradient-card:hover {
  --hue-start: 160;  /* green */
  --hue-end: 195;    /* teal */
}
.gradient-card h3 { margin: 0 0 0.5rem; }
.gradient-card p  { margin: 0; font-size: 0.875rem; opacity: 0.9; line-height: 1.5; }
```

## @property for validated tokens

```html
<div class="validation-demo">
  <div class="valid-card">Valid card (correct type)</div>
  <div class="invalid-card">Invalid card (wrong type — falls back to initial)</div>
</div>
```

```css
@property --card-opacity {
  syntax: '<number>';      /* only numbers are valid */
  initial-value: 1;
  inherits: false;
}

.valid-card {
  --card-opacity: 0.85;                    /* valid number — works */
  opacity: var(--card-opacity);
  padding: 1.5rem; background: #6366f1; color: white;
  border-radius: 8px; font-family: system-ui, sans-serif;
  font-weight: 600; font-size: 0.875rem;
}

.invalid-card {
  --card-opacity: "very transparent";      /* invalid — falls back to initial-value: 1 */
  opacity: var(--card-opacity);
  padding: 1.5rem; background: #ec4899; color: white;
  border-radius: 8px; font-family: system-ui, sans-serif;
  font-weight: 600; font-size: 0.875rem;
  margin-top: 0.75rem;
}

.validation-demo { font-family: system-ui, sans-serif; }
```

**SE lens:** `@property` is the foundation of CSS Houdini — a set of APIs that let JavaScript plug into the browser's CSS engine. With `@property` + the Paint API, you can write custom CSS paint functions (like a custom gradient algorithm) in JavaScript that behave like native CSS. This is the direction the web platform is heading: CSS authors define the types and contracts, JavaScript fills in the rendering logic when CSS can't.

**Common mistakes:**
- Forgetting `initial-value` — it's required when `inherits: false`. Without it, the browser may reject the `@property` declaration entirely.
- Using `@property` for every custom property — it adds parsing overhead. Only register properties you need to animate or that benefit from type safety.

**Debug tip:** In Chrome DevTools, open the Elements panel and look at the Styles tab for any element using a `@property`. The registered property shows with its type annotation. You can also inspect all registered properties in the CSS overview (DevTools → ... → CSS Overview → Properties).

**Next:** Maintainable CSS at scale — methodologies, file organisation, and avoiding specificity wars in a large codebase.

## Challenge: animated_property

Use @property to make a custom property animatable.

```html
<div id="prop-demo">Hover me</div>
```

```css
@property --demo-size {
  syntax: '<percentage>';
  initial-value: 50%;
  inherits: false;
}

#prop-demo {
  width: var(--demo-size);
  padding: 1rem;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  text-align: center;
  transition: --demo-size 400ms ease;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
#prop-demo:hover {
  --demo-size: 100%;
}
```

```test
const el = document.querySelector('#prop-demo')
const style = getComputedStyle(el)
assert style.transition.includes('--demo-size') || style.transitionProperty.includes('--demo-size')
assert style.backgroundColor !== 'transparent'
const rules = Array.from(document.styleSheets[0].cssRules)
const hasProp = rules.some(r => r.constructor.name === 'CSSPropertyRule' || (r.cssText || '').includes('@property'))
assert hasProp
assert getComputedStyle(el).borderRadius !== '0px'
assert parseFloat(getComputedStyle(el).minHeight) >= 30
```
