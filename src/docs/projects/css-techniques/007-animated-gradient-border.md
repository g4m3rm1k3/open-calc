---
Name: Animated Gradient Border
Category: Visual Effects & Animation
Difficulty: 3
What it produces: A glowing, multi-colored border that smoothly rotates around the perimeter of a card or container.
Why it works: It leverages a rotating `conic-gradient()` applied to a pseudo-element (`::before`) positioned behind the main content. The main content is masked or placed over it using a solid background color, leaving only the edges of the gradient visible. An infinite `@keyframes` animation rotates the gradient.
Required CSS concepts: `conic-gradient()`, `@keyframes`, CSS Custom Properties (Variables), Pseudo-elements (`::before`, `::after`), Positioning (`absolute`, `relative`), Z-index / Stacking Contexts.
HTML structure: A wrapper element containing the main content element.
CSS implementation: Uses `position: absolute`, `inset`, `conic-gradient()`, and `animation: spin linear infinite`.
Variations: Border radius variations, dashed animated borders, glowing borders with `filter: blur()`.
Parameters to experiment with: Animation duration, gradient color stops, border width (via padding or inset), border-radius interpolation.
Common mistakes: Failing to manage stacking contexts, clipping the gradient incorrectly, performance drops due to repaints instead of compositing.
Browser considerations: `conic-gradient()` is widely supported in modern browsers; however, animating `CSS variables` inside gradients requires `@property` for interpolation, or animating the `transform: rotate()` of the pseudo-element for better performance.
Acceptance criteria: The border must smoothly rotate 360 degrees infinitely without layout shifts, remain performant (using transforms if possible), and cleanly clip to the defined border radius.
---

# 0. PREAMBLE: Context & Prerequisites

### 0.1 Prerequisites
Before starting this lesson, the student must understand:
* Absolute positioning and stacking contexts (`z-index`).
* CSS Pseudo-elements (`::before` and `::after`).
* CSS Animations (`@keyframes`, `transform: rotate()`).

### 0.2 Learning Dependencies
A property or feature often relies on structural mechanics from across the curriculum. Declare the dependency graph:
* ✓ The Box Model & Sizing
* ✓ Containing Blocks & Out-of-flow Elements
* ✓ Stacking Contexts

### 0.3 Specification Reference
Teach specification literacy. Every lesson must link to the official standard:
* **Specification:** [CSS Image Values and Replaced Content Module Level 4](https://drafts.csswg.org/css-images-4/#conic-gradients)
* **Relevant Sections:** Conic Gradients, CSS Transforms, Stacking Contexts.

---

# 1. Mental Model & Problem

The CSS `border` property is fundamentally limited: it cannot accept a background that smoothly tracks the perimeter of a shape over time. While `border-image` exists, it does not support animating gradients seamlessly around rounded corners.

To solve this, we don't use the CSS `border` property at all. Instead, we use **Stacking Architecture**:
1. We create a container to act as a **mask** (using `overflow: hidden`).
2. We place an oversized pseudo-element (`::before`) in the background, filled with a `conic-gradient()`, and rotate it infinitely using `transform`.
3. We place another element (or `::after` pseudo-element) on top of it, slightly smaller, acting as the "inner card." The gap between the inner card and the outer container reveals the spinning gradient underneath.

**What This Feature Does NOT Do:**
* ❌ 1. **Does not actually use the CSS `border` property:** The "border" is an optical illusion created by layered boxes.
* ❌ 2. **Does not automatically contour to the child's content size:** The mask size dictates the bounds.
* ❌ 3. **Does not inherently respect transparent inner backgrounds:** Because the inner card is masking the gradient, the inner card *must* have a solid background color, or the entire spinning gradient will be visible.

---

# 2. Complete Language Reference & Value Grammar

This technique heavily relies on `conic-gradient()`.

* **Formal Syntax Table: `conic-gradient()`**
  * **Accepted Value Types & Keywords:** `conic-gradient( [ from <angle> ]? [ at <position> ]?, <angular-color-stop-list> )`
  * **CSS Value Grammar Types Taught:** `<angle>`, `<position>`, `<color>`.
  * **Initial Value:** N/A (Function)
  * **Inherited:** No
  * **Animatable:** Yes (If using `@property` for `<angle>` or when transformed natively).
  * **Applies To:** All elements that accept `<image>` values (e.g., `background-image`).
  * **Percentages:** `<position>` uses percentages relative to the box dimensions.
  * **Computed Value:** An image.
  * **Default Browser Behavior:** If no starting angle is provided, it defaults to `0deg` (pointing up).

---

# 3. Complete Feature Surface

The complete surface for `conic-gradient()` allows adjusting the starting angle and the center point:

```css
/* Basic */
background: conic-gradient(red, yellow, green);

/* Specific starting angle */
background: conic-gradient(from 90deg, red, yellow);

/* Specific center position */
background: conic-gradient(at 20% 50%, red, yellow);

/* Combined */
background: conic-gradient(from 0.5turn at 50% 50%, #f00, #00f);

/* Hard stops (creating pie charts) */
background: conic-gradient(red 0 90deg, blue 90deg 180deg, green 180deg 360deg);
```

---

# 4. Evolution & Modern CSS

* **Historical Syntax:** Before `conic-gradient` was supported, developers used four separate linear gradients or SVG borders animated via JavaScript to achieve this effect.
* **Modern Syntax:** Level 4 Images module introduced `conic-gradient()`. It sweeps color stops around a central point, much like a radar sweep.
* **Cutting Edge:** Modern implementations use `@property` to register a custom angle variable (`--angle`), allowing direct animation of the `conic-gradient(from var(--angle))` instead of rotating a DOM node. This prevents the need for an oversized pseudo-element.

---

# 5. Browser Behavior, Formatting Contexts & The Cascade

* **Stacking Contexts:** The success of this technique relies entirely on `z-index` and stacking contexts. The container must establish a stacking context (e.g., `position: relative`, `isolation: isolate`, or `z-index: 0`). The `::before` pseudo-element sits at `z-index: -1`, effectively behind the content but inside the container's stacking context (preventing it from bleeding behind the container's parent).
* **Containing Blocks:** The container must be `position: relative` to act as the containing block for the `position: absolute` pseudo-elements.
* **Overflow:** `overflow: hidden` on the container ensures the rotating, oversized square gradient does not spill out of the rounded corners.

---

# 6. Browser Algorithm

How the engine processes the animated gradient border:
1. **Layout Context:** Resolves the container's size and sets `position: relative`.
2. **Pseudo-element Generation:** The engine generates anonymous boxes for `::before` and `::after`.
3. **Positioning:** Both are placed absolutely. `::before` is given dimensions larger than the parent (e.g., `150%` or `width/height` with negative insets) so its corners don't show during rotation.
4. **Paint Pipeline:** `conic-gradient()` is computed as a background image.
5. **Compositing:** The `transform: rotate()` animation on `::before` is promoted to the GPU. The browser spins the texture on a hardware-accelerated layer.
6. **Masking:** The `overflow: hidden` on the parent clips the rotating box back to the intended border-radius geometry.

---

# 7. Invalid CSS & Error Recovery

* **Invalid Syntax:** `conic-gradient(red 10px, blue 20px)`. Conic gradients require angular units (`deg`, `turn`, `rad`, `grad`), not linear units like `px`. The engine will drop the rule.
* **Parser Error Recovery:** If `conic-gradient` is misspelled or given invalid units, the property is ignored. Best practice is to provide a fallback:
  ```css
  background: #333; /* Fallback */
  background: conic-gradient(red, blue);
  ```

---

# 8. Interaction With Other CSS Features & CSSOM Runtime

* **Border Radius:** The outer container's `border-radius` coupled with `overflow: hidden` defines the shape of the animated border.
* **`filter: blur()`:** By applying a blur to the gradient pseudo-element, you can create a "glowing" or "neon" animated border.
* **CSSOM Manipulation:** You can use JavaScript to dynamically change the colors of the `conic-gradient()` by modifying CSS Variables tied to the color stops.

---

# 9. Accessibility (A11y)

* **Reduced Motion:** Infinite animations can trigger vestibular disorders in some users. You must wrap the animation in a media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animated-border::before {
      animation: none;
    }
  }
  ```
* **Contrast:** Ensure the gradient colors do not reduce the legibility of text inside the card. The "inner mask" must maintain a minimum 4.5:1 contrast ratio against the text.

---

# 10. Performance, Runtime Costs & Security

* **Rendering Stage Triggered:** Animating `transform: rotate()` triggers **Compositing** only. This is highly performant and runs at 60fps on the GPU.
* **The `@property` alternative:** Animating `--angle` inside `conic-gradient(from var(--angle))` triggers continuous **Paint** operations. While mathematically cleaner (no oversized boxes), it is significantly more expensive on the CPU/GPU than a simple hardware-accelerated `transform`.
* **Budget Limits:** Avoid animating massive boxes (e.g., `4000px` elements) as the texture memory required for the GPU composite layer can cause visual stuttering.

---

# 11. DevTools Investigation

1. Open the **Elements** pane and inspect the card.
2. Select the `::before` pseudo-element.
3. Open the **Animations** tab in DevTools. You should see the continuous infinite timeline.
4. Open the **Rendering** tab and check "Paint flashing". If you are animating `transform`, the box should *not* be flashing green continuously. If it is, you're triggering repaints (bad for performance).

---

# 12. Visual Mental Models

```text
Geometry of the Animated Gradient Border:

   [ The Hidden Overflow Area ]
   - - - - - - - - - - - - - - - 
  |                              |
  |    +--------------------+    |
  |    |  [Inner Card]      |    |
  |    |  Z-index: 1        |    |
  |    |  Solid Background  |    |
  |    |                    |    |
  |    +--------------------+    |  <-- Container Boundary
  |      Z-index: 0                 (overflow: hidden)
  |      + Rotating `::before`      (border-radius: 12px)
  |        Z-index: -1           |
   - - - - - - - - - - - - - - - 

The `::before` layer is 150% the size of the container. 
As it rotates, its corners swing through the hidden overflow area.
Only the thin gap between the Container Boundary and the Inner Card is visible.
```

---

# 13. Prediction Checkpoints

**Prediction 1:**
Look at the following CSS:
```css
.card { position: relative; overflow: hidden; }
.card::before { content: ""; position: absolute; inset: 0; background: conic-gradient(red, blue); transform: rotate(45deg); }
```
**Question:** If `inset: 0` is used, what happens to the corners of the card when the pseudo-element rotates?
**Answer:** The background will "cut off" at the corners. Because the pseudo-element is exactly the size of the box (`inset: 0`), rotating it will expose the background of the parent in the corners, breaking the illusion. It must be larger than the parent (e.g. `inset: -50%`).

---

# 14. Compare Similar Features

* **Animated `border-image` vs Animated Pseudo-element:** `border-image` cannot follow a `border-radius`. The pseudo-element masking technique perfectly respects `border-radius`.
* **`transform: rotate()` vs animating `@property --angle`:** `transform` is GPU accelerated but requires hacky oversized boxes and `overflow: hidden`. `@property` requires no extra markup or sizing hacks, but forces expensive repaints on every frame.

---

# 15. Decision Guide

> **I want to...** $\longrightarrow$ **Use...**
* **Create a standard static gradient border?** $\longrightarrow$ Use `border-image: linear-gradient(...) 1;` (if no rounded corners are needed) or the pseudo-mask technique.
* **Create an animated glowing border that is performant?** $\longrightarrow$ Use `::before` with `conic-gradient()` and animate `transform: rotate()`.
* **Create an animated border on an element with a transparent background?** $\longrightarrow$ You cannot use the mask technique. You must use SVG `stroke-dasharray` animations instead.

---

# 16. Common Bugs, Edge Cases & Debugging Workflow

* **Common Bugs Table:**

| Symptom | Cause | Browser Behavior | Solution |
| :--- | :--- | :--- | :--- |
| Gradient covers the text | Stacking context failure. | `::before` renders over the content. | Add `z-index: 1` to inner content, or `isolation: isolate` to the parent. |
| Corners flash empty during rotation | `::before` box is too small. | The diagonal of the rotating box doesn't cover the bounding box corners. | Set `width: 200%; height: 200%; top: -50%; left: -50%;`. |
| Border-radius disappears | Parent lacks `overflow: hidden` | Rotating box spills completely outside the parent. | Add `overflow: hidden` to the container. |

* **Diagnostic Workflow Checklist:**
  1. Is the `content: ""` property present on the pseudo-element? (It won't render without it).
  2. Is the container `position: relative`?
  3. Is `overflow: hidden` applied to the outer container?
  4. Is the inner card properly inset (e.g., `inset: 2px`) to reveal the border?

---

# 17. Interactive Experiments (Throwaway Labs)

**Lab 1: The Geometry of Rotation**
1. Remove `overflow: hidden` from the parent container.
2. Observe the massively oversized rotating `::before` block.
3. Change the `conic-gradient` to `conic-gradient(red 0deg 90deg, transparent 90deg 360deg)`.
4. Observe how it looks like a radar sweep. Re-apply `overflow: hidden`.

**Lab 2: The Inner Mask**
1. Change the inner card's background color to `rgba(0,0,0, 0.5)`.
2. Notice how the illusion breaks because you can see the spinning gradient behind the text.

---

# 18. Real Project Integration

* **Target File:** `src/components/PremiumCard.css`
* **Engineering Justification:** We need to highlight premium tiers in our pricing table without adding massive DOM weight or JavaScript observers.

**Code Modification:**
```css
.premium-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  /* Setup stacking context */
  isolation: isolate; 
}

/* The spinning gradient */
.premium-card::before {
  content: "";
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(transparent, var(--brand-accent), transparent 30%);
  animation: spin 3s linear infinite;
  z-index: -1;
}

/* The inner solid mask */
.premium-card::after {
  content: "";
  position: absolute;
  inset: 2px; /* Border thickness */
  background: var(--surface-color);
  border-radius: 14px; /* Slightly less than parent to fit perfectly */
  z-index: -1;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .premium-card::before {
    animation-play-state: paused;
  }
}
```

---

# 19. Mastery Challenge

**Find & Fix the Bug:**
A junior engineer submitted this code for an animated border:
```css
.card {
  position: relative;
  width: 300px;
  height: 400px;
}
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: conic-gradient(red, blue);
  animation: spin 1s infinite;
}
.card-content {
  background: white;
  margin: 2px;
}
```
**Critique and Fix:**
1. Missing `overflow: hidden` on `.card`.
2. `inset: 0` on the `::before` means its corners will cut off when it spins. It needs to be much larger (e.g., `width: 200%; top: -50%`).
3. Stacking context issues: The `.card-content` might not sit cleanly above the `::before` without explicit `position: relative` and `z-index`.
4. The animation lacks a `linear` timing function, meaning it will speed up and slow down (ease) during the rotation, ruining the illusion of a continuous sweep.

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
