# 019: Glitch Text Effect

## 0. PREAMBLE: Context & Prerequisites

### 0.1 Prerequisites
Before starting this lesson, the student must understand:
* Absolute positioning and the `position` property.
* Pseudo-elements (`::before` and `::after`) and the `content` property, specifically `content: attr()`.
* The concept of the Z-axis and basic stacking order.

### 0.2 Learning Dependencies
This technique relies on structural mechanics from across the curriculum:
* ✓ Stacking Contexts & Absolute Positioning
* ✓ Generated Content (`::before` / `::after`)
* ✓ The `clip-path` property
* ✓ Keyframe Animation Internals

### 0.3 Specification Reference
* **Specification:** [CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/), [CSS Animations Level 1](https://www.w3.org/TR/css-animations-1/)
* **Relevant Sections:** Clipping paths (`clip-path`), Keyframes (`@keyframes`)

---

## 1. Mental Model & Problem

The "Glitch Text Effect" creates the illusion of a digital distortion, reminiscent of a broken VHS tape or a failing monitor. 

**The Structural Problem:** HTML text is a single, solid rendering layer. To make parts of a word "tear" horizontally while shifting colors, we need multiple copies of the text stacked perfectly on top of each other, where we can independently slice and move specific horizontal bands.

**The Solution:** We use `::before` and `::after` pseudo-elements to create two identical clones of the text via `content: attr(data-text)`. We absolutely position them directly over the original text, offset them slightly in opposite directions, give them contrasting text shadows or colors (e.g., cyan and red), and animate their `clip-path` properties to rapidly reveal and hide different horizontal slices.

**What This Technique Does NOT Do:**
* ❌ 1. **Does not modify the original text node:** The original DOM text remains fully intact and un-animated; we only animate the generated pseudo-element clones.
* ❌ 2. **Does not require multiple DOM elements:** We do not need `<span class="glitch-1">Text</span>` etc. A single text node with a data attribute is sufficient.
* ❌ 3. **Does not alter the layout document flow:** Because the clones are `position: absolute`, their slicing and shifting do not cause siblings to reflow or move.

---

## 2. Complete Language Reference & Value Grammar

This technique relies on combining three CSS domains. Here is the technical grammar for the primary driver, `clip-path`:

* **Formal Syntax Table: `clip-path`**
  * **Accepted Value Types:** `<clip-source> | [ <basic-shape> || <geometry-box> ] | none`
  * **CSS Value Grammar Types Taught:** `<basic-shape>` (specifically `inset()` and `polygon()`).
  * **Initial Value:** `none`
  * **Inherited:** No
  * **Animatable:** Yes, as a basic shape (if the number and types of vertices match).
  * **Applies To:** All elements.
  * **Percentages:** Relative to the reference box (usually the border-box).
  * **Computed Value:** As specified, but with `<length>` values made absolute.

---

## 3. Complete Feature Surface

To build a glitch effect, we utilize:
* **`content: attr(data-text)`:** Pulls the text string directly from the HTML element so we don't duplicate content in CSS.
* **`clip-path: inset(top right bottom left)`:** Defines a visible rectangle. Anything outside the inset is clipped (invisible). By changing the `top` and `bottom` values, we create a thin horizontal band.
* **`@keyframes`:** We define a sequence of percentages (0%, 5%, 10%... 100%) where the `clip-path: inset(...)` changes violently and unpredictably.

---

## 4. Evolution & Modern CSS

* **Historical Syntax:** Before `clip-path`, developers achieved this by creating multiple `<span>` elements and using `clip: rect(top, right, bottom, left)` (a deprecated property that only worked on absolutely positioned elements). 
* **Modern Syntax:** `clip-path` provides standard masking. `inset()` is much easier to reason about than the old `rect()` syntax.
* **Browser Compatibility:** `clip-path` is fully supported in all modern browsers. Older Safari versions required the `-webkit-` prefix.

---

## 5. Browser Behavior, Formatting Contexts & The Cascade

* **Stacking Context:** The `position: relative` on the main text creates a containing block. The `position: absolute` pseudo-elements sit perfectly on top. We can assign them `z-index: -1` if we want the original text on top, or leave them on top and let their clippings obscure the original text.
* **Paint Phase:** `clip-path` runs purely in the Paint and Compositing phases. Changing `clip-path` inside an animation **does not trigger Layout (Reflow)**, making it highly performant for 60fps animations.

---

## 6. Browser Algorithm

How the engine renders the glitch effect:
1. **DOM Parsing:** Engine reads `<h1 data-text="GLITCH">GLITCH</h1>`.
2. **Style Calculation:** Resolves `::before` and `::after` content rules, finding `attr(data-text)`.
3. **Layout:** The `h1` gets its dimensions. The pseudo-elements are absolutely positioned and given identical dimensions to the `h1`.
4. **Animation Tick:** At each keyframe step, the browser calculates the new `clip-path: inset(...)` boundaries.
5. **Paint & Composite:** The browser masks the pseudo-elements, painting only the thin horizontal bands, offsetting their cyan/red pixels, and rendering the final composite frame without disturbing layout.

---

## 7. Invalid CSS & Error Recovery

* **Syntax Errors in `clip-path`:** If you write `clip-path: inset(10px 20px)` but suddenly transition to `clip-path: polygon(...)`, the browser will *drop the interpolation*. It cannot tween an `inset()` to a `polygon()`. It will step directly from one to the next.
* **Missing Attributes:** If the HTML is missing the `data-text` attribute, `content: attr(data-text)` computes to an empty string, and the glitch clones will vanish silently.

---

## 8. Interaction With Other CSS Features & CSSOM Runtime

* **Text Wrapping:** If the parent text wraps across multiple lines, the absolute `::before` and `::after` will also wrap perfectly, assuming their font properties match exactly.
* **CSS Custom Properties:** We can map CSS variables to the animation delay or glitch offset sizes to randomize the glitch intensity via JavaScript.

---

## 9. Accessibility (A11y)

* **Screen Readers:** Because we use `content: attr(data-text)` on pseudo-elements, most modern screen readers will ignore the pseudo-elements, reading only the real DOM text node. This prevents the screen reader from stuttering "GLITCH GLITCH GLITCH".
* **Reduced Motion:** The rapid flashing of a glitch effect is a severe trigger for vestibular disorders and photosensitive epilepsy. **You MUST wrap this animation in `@media (prefers-reduced-motion: no-preference)`.**

```css
@media (prefers-reduced-motion: reduce) {
  .glitch::before,
  .glitch::after {
    animation: none;
    display: none;
  }
}
```

---

## 10. Performance, Runtime Costs & Security

* **Rendering Stage Triggered:** `clip-path` mutation triggers Paint and Compositing. It avoids expensive Layout Reflows.
* **Frame Budgets:** Running multiple rapid, infinite animations can drain mobile battery. Pause the animation when the element is off-screen (using Intersection Observer) or trigger it only on `:hover`.

---

## 11. DevTools Investigation

* **Styles Pane:** Inspect the `.glitch::before` element.
* **Animations Pane (Chrome DevTools):** Open the Animations drawer. Record the timeline. You will see the dense `@keyframes` blocks. You can scrub the timeline to pause the exact frame where the "tear" happens.
* **Rendering Drawer:** Turn on "Paint flashing" to verify that only the clipped areas are repainting.

---

## 12. Visual Mental Models

```text
The Geometry of the Glitch
--------------------------
1. Base HTML Element
+------------------------------------+
|             G L I T C H            | (Static, relative)
+------------------------------------+

2. ::before Pseudo-element (Cyan, Offset Left -2px)
+------------------------------------+
| . . . . . . G L I T C H . . . . . .| (Absolute)
+------------------------------------+
   \__ clip-path: inset(40% 0 50% 0) __/
        Only a middle slice is visible!
        =====[L I T]===== 

3. ::after Pseudo-element (Red, Offset Right 2px)
+------------------------------------+
| . . . . . . . G L I T C H . . . . .| (Absolute)
+------------------------------------+
   \__ clip-path: inset(10% 0 80% 0) __/
        Only a top slice is visible!
        =====[G L I]=====

Final Composited Stack:
The user sees the static black text, with a cyan "L I T" slice shifting left, 
and a red "G L I" slice shifting right.
```

---

## 13. Prediction Checkpoints

* **Code Snippet:** 
  ```css
  .glitch::before {
    clip-path: inset(20% 0 70% 0);
  }
  ```
* **Prediction:** What percentage of the text height is visible?
* **Answer:** Only 10% of the height is visible. The top 20% is clipped away, and the bottom 70% is clipped away. $100\% - 20\% - 70\% = 10\%$.

---

## 14. Compare Similar Features

* `clip-path: inset(...)` vs `clip: rect(...)`: `clip: rect` is deprecated and requires absolute positioning. `clip-path` is modern, supports percentages, and works on any element.
* `text-shadow` animation vs `clip-path` clones: Animating `text-shadow` can create a blur or color split, but it cannot "tear" or shift horizontal slices of the text in opposite directions.

---

## 15. Decision Guide

> **I want to...** $\longrightarrow$ **Use...**
* Create a simple neon glow or color split without tearing $\longrightarrow$ Animate `text-shadow`.
* Create an aggressive digital tearing/slice effect $\longrightarrow$ Generate clones with `::before`/`::after` and animate `clip-path: inset()`.
* Make a whole image glitch $\longrightarrow$ Use SVG `<filter>` with `<feDisplacementMap>`.

---

## 16. Common Bugs, Edge Cases & Debugging Workflow

* **Symptom:** The glitch clones don't perfectly align with the original text initially.
  * **Cause:** The `h1` parent might have `text-align: center`, and the `position: absolute` clones are collapsing to their intrinsic size rather than matching the parent width.
  * **Solution:** Give the pseudo-elements `width: 100%; top: 0; left: 0;`.
* **Symptom:** The glitch effect stutters instead of animating smoothly.
  * **Cause:** Intentionally, this is desired for a glitch effect! If you *don't* want interpolation, ensure the keyframes are close together, or use the `steps()` timing function.

---

## 17. Interactive Experiments (Throwaway Labs)

1. **The Inset Slicer:** Create a single div with background color. Apply `clip-path: inset(10% 0 80% 0)`. Change the 10% and 80% to see how the visible band moves up and down.
2. **The Color Offset:** Change `.glitch::before` to `left: -5px` and `.glitch::after` to `left: 5px`. See how the horizontal tear becomes far more aggressive.

---

## 18. Real Project Integration

* **Target File:** `src/components/HeroTitle.css`
* **Exact Location:** Applied to the main landing page header.
* **Code Modification:**
```css
.hero-title {
  position: relative;
  font-size: 4rem;
  font-weight: 900;
}

.hero-title::before,
.hero-title::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--bg-color); /* Matches parent background to hide text underneath the slice */
}

.hero-title::before {
  left: -2px;
  text-shadow: -1px 0 cyan;
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}

.hero-title::after {
  left: 2px;
  text-shadow: -1px 0 red;
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0% { clip-path: inset(20% 0 80% 0); }
  20% { clip-path: inset(60% 0 10% 0); }
  40% { clip-path: inset(40% 0 50% 0); }
  60% { clip-path: inset(80% 0 5% 0); }
  80% { clip-path: inset(10% 0 70% 0); }
  100% { clip-path: inset(30% 0 50% 0); }
}

@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 60% 0); }
  20% { clip-path: inset(30% 0 20% 0); }
  40% { clip-path: inset(70% 0 10% 0); }
  60% { clip-path: inset(20% 0 50% 0); }
  80% { clip-path: inset(50% 0 30% 0); }
  100% { clip-path: inset(5% 0 80% 0); }
}
```
* **Engineering Justification:** Adds high-impact visual flair to the landing page without adding unnecessary DOM nodes, maintaining semantic purity.

---

## 19. Mastery Challenge

* **Predict & Defend:** If the parent container `.hero-title` has `overflow: hidden` applied to it, and the `::before` pseudo-element shifts `left: -50px` via a keyframe, what happens to the overhanging piece of the text? Defend your answer using containing block algorithms.
* **Answer:** Because `.hero-title` is `position: relative`, it establishes the containing block for the absolutely positioned `::before`. The `overflow: hidden` on the containing block will clip any geometry of the pseudo-element that exceeds the padding box of `.hero-title`.

---

## 20. Mastery Checklist

- [ ] I can explain the problem this feature solves and its mental model in my own words.
- [ ] I can state at least three incorrect assumptions about what this feature does *not* do.
- [ ] I know the complete formal grammar, accepted value types, default values, and inheritance behavior.
- [ ] I can trace the browser's algorithm and intrinsic sizing rules for resolving this feature.
- [ ] I can predict error recovery behaviors for invalid values.
- [ ] I can investigate and verify this property using Browser DevTools and understand its CSSOM manipulation.
- [ ] I understand all accessibility (a11y), security, and performance implications (reflow vs repaint).
- [ ] I have applied this pattern cleanly to the ongoing real-world project.
