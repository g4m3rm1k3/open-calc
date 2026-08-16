---
Name: Radial Spotlight Hover
Category: Interactive Effects
Difficulty: 3
What it produces: A dynamic glow effect that follows the user's cursor as they hover over an element, acting like a flashlight illuminating the background or borders.
Why it works: It relies on mapping the cursor's (X, Y) coordinates to CSS Custom Properties (`--x` and `--y`) via JavaScript. A `radial-gradient()` then uses those coordinates as its origin point, blending a semi-transparent color into the background or a mask.
Required CSS concepts: `radial-gradient()`, CSS Custom Properties (Variables), `:hover` states, `background-image` or `mask-image`, `opacity`.
HTML structure: A container element (e.g., a card or button) that captures mouse events.
CSS implementation: Uses `background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.1), transparent)` paired with JS updating the variables on `mousemove`.
Variations: Border spotlight (using `::before` and `mask`), inverted spotlight, multiple spotlights.
Parameters to experiment with: Gradient size, color opacity, `mix-blend-mode`, easing on movement.
Common mistakes: Forgetting to set a fallback value for variables, not tracking coordinates relative to the element (bounding client rect), causing layout thrashing by updating non-composite properties.
Browser considerations: Performs very well on modern browsers; ensure the JS calculation runs efficiently (e.g., without forcing synchronous reflows).
Acceptance criteria: Hovering the element produces a soft radial gradient that tracks the cursor perfectly. Moving the cursor out hides or resets the spotlight.
---

# 0. PREAMBLE: Context & Prerequisites

### 0.1 Prerequisites
Before starting this lesson, the student must understand:
* CSS Custom Properties (Variables) and fallback values
* The `radial-gradient()` function syntax
* Basic JavaScript event listeners (`mousemove`) and bounding client calculations

### 0.2 Learning Dependencies
* ✓ The Box Model
* ✓ CSS Backgrounds and Borders
* ✓ CSSOM & Runtime Manipulation

### 0.3 Specification Reference
* **Specification:** [CSS Images Module Level 3](https://www.w3.org/TR/css-images-3/#radial-gradients)
* **Relevant Sections:** Radial Gradients, CSS Custom Properties for Cascading Variables Module Level 1

---

# 1. Mental Model & Problem

The Radial Spotlight Hover effect bridges the gap between static CSS and dynamic user input. Traditional CSS `:hover` states apply a uniform change to an element, but they lack spatial awareness of exactly *where* the user is interacting.

* **The Problem:** We want an element to react not just to being hovered, but to the exact location of the pointer, creating a physical "flashlight" effect.
* **The Solution:** We construct a bridge. JavaScript listens for the pointer and passes its exact relative coordinates into the CSS engine via Custom Properties. CSS then uses those coordinates to position the center of a `radial-gradient()`.
* **What This Feature Does NOT Do:**
  * ❌ 1. Does not track the cursor automatically without JavaScript bridging the coordinates.
  * ❌ 2. Does not inherently create a mask; it just paints a background unless explicitly combined with `mask-image`.
  * ❌ 3. Does not trigger expensive layout recalculations if only painting properties (like `background` or `opacity`) are modified.

---

# 2. Complete Language Reference & Value Grammar

The core mechanic relies on the `radial-gradient()` function.

* **Formal Syntax Table:**
  * **Accepted Value Types:** `radial-gradient( [ <ending-shape> || <size> ]? [ at <position> ]? , <color-stop-list> )`
  * **CSS Value Grammar Types Taught:** `<position>` (which we will control dynamically), `<color>`, `<length>`, `<percentage>`.
  * **Initial Value:** N/A (Function)
  * **Inherited:** No
  * **Animatable:** Yes (though we interpolate via Custom Properties)
  * **Applies To:** Any property accepting an `<image>` (background-image, mask-image, border-image).
  * **Percentages:** Relative to the dimensions of the box.
  * **Computed Value:** The specified gradient.

---

# 3. Complete Feature Surface

To master this technique, you must understand how `radial-gradient()` accepts positioning:
* **Shape:** `circle` or `ellipse`.
* **Position:** Defined using `at <x> <y>`. This is where our dynamic variables go: `at var(--x, 50%) var(--y, 50%)`.
* **Color Stops:** Blending from an active color (e.g., `rgba(255,255,255,0.1)`) to `transparent`.

---

# 4. Evolution & Modern CSS

Historically, tracking a cursor required absolute positioning a separate DOM node (a `div` with `border-radius: 50%` and `box-shadow`) and updating its `top` and `left` properties via JS. This caused severe performance issues due to continuous layout/paint thrashing.

Modern CSS leverages Custom Properties. By updating `--x` and `--y` on the element's inline style, we only trigger a repaint of the background, heavily optimized by modern browser rendering engines.

---

# 5. Browser Behavior, Formatting Contexts & The Cascade

* **The Cascade Resolution Order Algorithm:** The inline style updated by JavaScript has high specificity, overriding stylesheet declarations for `--x` and `--y`.
* **Formatting Context Algorithm:** The gradient paints into the element's background painting area, bound by its `border-box` or `padding-box`.
* **Rendering Stages:** 
  JS Updates Style -> Style Calculation (Resolves Variables) -> Paint (Repaints background) -> Compositing.
  Crucially, it skips Layout (Reflow).

---

# 6. Browser Algorithm

1. The user moves the mouse over the element.
2. The `mousemove` event fires.
3. JavaScript calculates the cursor's X/Y offset relative to the element's top-left corner (`clientX - rect.left`).
4. JavaScript writes these values as inline styles: `element.style.setProperty('--x', \`${x}px\`)`.
5. The CSS engine invalidates the previously painted background.
6. It reads the new `--x` and `--y` values into the `radial-gradient()` function.
7. The browser quickly repaints the background image with the new center point.

---

# 7. Invalid CSS & Error Recovery

* **Missing Units:** `element.style.setProperty('--x', 150)` (missing `px`) results in an invalid `<position>` in the gradient. The browser will drop the rule, and the gradient will disappear or fallback to the initial state (e.g., `50%` if fallbacks are used: `var(--x, 50%)`).
* **Parser Error Recovery:** Always use fallback values in your `var()` functions so the gradient still renders statically if JS fails or before the first mouse movement.

---

# 8. Interaction With Other CSS Features & CSSOM Runtime

* **CSSOM Runtime:** This technique is a perfect example of CSSOM manipulation. We are mutating the CSS variables continuously at 60 frames per second.
* **Transitions:** You can apply `transition: background 0.3s` or `opacity 0.3s` to smooth the entry/exit of the spotlight when hovering begins or ends.
* **Masking:** By applying the gradient to `mask-image` instead of `background-image`, you can create a "reveal" effect, showing content underneath only where the spotlight shines.

---

# 9. Accessibility (A11y)

* **Contrast:** Ensure the spotlight does not reduce the contrast of text below WCAG AA thresholds. Use low-opacity whites or blacks.
* **Reduced Motion:** While not strictly motion, some users may find continuous light tracking distracting. Consider disabling it:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .spotlight-card {
      background-image: none !important;
    }
  }
  ```
* **Keyboard Navigation:** The spotlight only follows the pointer. Ensure the element has a distinct `:focus-visible` state that doesn't rely on the pointer coordinates.

---

# 10. Performance, Runtime Costs & Security

* **Rendering Stage Triggered:** Repaint.
* **Browser Limits & Budgets:** Updating variables on `mousemove` fires frequently. Ensure your JS callback does not perform expensive DOM reads (like calling `getBoundingClientRect()` on every tick unnecessarily; cache it on `mouseenter` if the element doesn't resize).
* **Security:** No specific security risks, as variables are constrained to CSS values.

---

# 11. DevTools Investigation

* **Styles Pane:** Select the hovered element. Watch the `element.style` block rapidly update `--x` and `--y` values as you move the mouse.
* **Rendering Overlays:** Turn on "Paint flashing" in DevTools. You should see only the card repainting as you move the mouse, not the entire page.

---

# 12. Visual Mental Models

```mermaid
graph TD
    A[Pointer (clientX, clientY)] -->|JS calculates offset| B[Element (rect.left, rect.top)]
    B -->|JS sets inline style| C[--x: 120px; --y: 45px;]
    C -->|CSS Engine reads var| D[radial-gradient(circle at var(--x) var(--y))]
    D -->|Browser Engine| E[Repaint Element Background]
```

---

# 13. Prediction Checkpoints

**Prediction:** What happens if the CSS is `radial-gradient(circle at var(--x) var(--y), white 0%, transparent 100%)` and the JavaScript has not run yet (e.g., page just loaded, no mouseover)?

> *Explanation:* Because `--x` and `--y` are undefined, the `var()` function fails. The `radial-gradient()` becomes invalid, and no background is drawn. Fix this with fallbacks: `var(--x, 50%) var(--y, 50%)`.

---

# 14. Compare Similar Features

* `radial-gradient` tracking vs **Absolute positioned tracker element**: The gradient method avoids extra DOM nodes and skips layout calculation, providing a massive performance boost over animating absolute positioning.
* `background-image` vs **`mask-image`**: Background adds light/color. Mask hides the element everywhere *except* where the gradient is, revealing content underneath.

---

# 15. Decision Guide

> **I want to...** $\longrightarrow$ **Use...**
* Add a subtle glow behind text on a dark card $\longrightarrow$ `background: radial-gradient(...)`
* Reveal a border gradient only near the cursor $\longrightarrow$ A `::before` pseudo-element with a gradient background, wrapped in a `mask-image: radial-gradient(...)` tracking the cursor.
* Create a flashlight in a dark room game $\longrightarrow$ A full-screen overlay with a `mask-image` tracking the pointer.

---

# 16. Common Bugs, Edge Cases & Debugging Workflow

* **Symptom:** Spotlight jumps wildly when scrolling.
  **Cause:** Using `e.pageX/Y` without accounting for scroll, or calling `getBoundingClientRect()` without scroll compensation. Use `e.clientX - rect.left`.
* **Symptom:** Gradient is stuck in the top left corner.
  **Cause:** JavaScript appended numbers without unit strings (e.g., `setProperty('--x', 150)` instead of `150px`).
* **Symptom:** The rest of the card is entirely white instead of dark.
  **Cause:** The color stops in the gradient don't end in `transparent`, or the gradient size is too large (e.g., missing `100px` after the color stop).

**Diagnostic Workflow:**
1. Check Elements panel: Are `--x` and `--y` updating with `px` units?
2. Check Styles panel: Is the `radial-gradient` rule crossed out as invalid?
3. Check Console: Are there JS errors preventing the `mousemove` listener?

---

# 17. Interactive Experiments (Throwaway Labs)

**Experiment 1: The Basic Glow**
```css
.card {
  background: radial-gradient(
    600px circle at var(--x, 50%) var(--y, 50%), 
    rgba(255,255,255,0.1),
    transparent 40%
  );
}
```
*Tweak:* Change `600px` to `200px`. Observe how the "cone" of light shrinks.

**Experiment 2: The Border Reveal**
Apply the gradient to a `::before` element, set `background: linear-gradient(red, blue)`, and use `mask-image: radial-gradient(...)` with the dynamic variables. Observe how the border only appears near the cursor.

---

# 18. Real Project Integration

* **Target File:** `src/components/Card/Card.css`
* **Exact Location:** Add to `.interactive-card` class.
* **Code Modification:**
```css
.interactive-card {
  position: relative;
  background-color: #1a1a1a;
  overflow: hidden;
}

.interactive-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    800px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.interactive-card:hover::before {
  opacity: 1;
}
```
* **Engineering Justification:** Enhances the dark-mode aesthetic with tactile feedback without degrading performance, using composited opacity transitions for entry/exit.

---

# 19. Mastery Challenge

**Find & Fix the Bug:**
A junior dev wrote this JS:
```js
card.addEventListener('mousemove', e => {
  card.style.setProperty('--x', e.clientX);
  card.style.setProperty('--y', e.clientY);
});
```
And this CSS:
```css
.card {
  background: radial-gradient(circle at var(--x) var(--y), white, black);
}
```
*The gradient doesn't appear at all.*
**Identify the architectural failures and fix them:**
1. CSS requires units for positions (e.clientX provides a raw number). JS must append `'px'`.
2. `e.clientX` is relative to the viewport, not the card. It needs to be `e.clientX - card.getBoundingClientRect().left`.
3. The CSS `var()` lacks fallbacks, breaking it initially.

---

# 20. Mastery Checklist

- [ ] I can explain the problem this feature solves and its mental model in my own words.
- [ ] I can state at least three incorrect assumptions about what this feature does *not* do.
- [ ] I know the complete formal grammar, accepted value types, default values, and inheritance behavior.
- [ ] I can trace the browser's algorithm and intrinsic sizing rules for resolving this feature.
- [ ] I can predict error recovery behaviors for invalid values.
- [ ] I can investigate and verify this property using Browser DevTools and understand its CSSOM manipulation.
- [ ] I understand all accessibility (a11y), security, and performance implications (reflow vs repaint).
- [ ] I have applied this pattern cleanly to the ongoing real-world project.
