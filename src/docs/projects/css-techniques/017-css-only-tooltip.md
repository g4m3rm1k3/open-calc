---
Name: CSS-Only Tooltip
Category: Visual Effects & Interactivity
Difficulty: 2
What it produces: A tooltip that appears when hovering over an element, created entirely with CSS without JavaScript.
Why it works: It leverages pseudo-elements (`::before` and `::after`) for the tooltip box and arrow, the `content: attr(...)` function to pull text from a data attribute, and `opacity` with `visibility` on `:hover` to show/hide the tooltip smoothly.
Required CSS concepts: `::before` / `::after` pseudo-elements, `content: attr()`, absolute positioning, relative positioning, `opacity`, `visibility`, `transition`, `:hover` pseudo-class.
HTML structure: A single inline or block element with a custom data attribute, e.g., `<span data-tooltip="Tooltip text">Hover me</span>`.
CSS implementation: Relative positioning on the parent. Absolute positioning on the pseudo-elements. The `::before` acts as the tooltip body with `content: attr(data-tooltip)`. The `::after` acts as the tooltip arrow.
Variations: Top, bottom, left, right tooltips; animated tooltips; multiline tooltips.
Parameters to experiment with: Transform offsets, transition duration/easing, tooltip background colors.
Common mistakes: Forgetting `position: relative` on the parent, using `display: none` instead of `visibility: hidden` (which breaks transitions), missing `content` property on pseudo-elements.
Browser considerations: Supported in all modern browsers. Screen readers may read the `data-tooltip` attribute if configured, or require `aria-label` for proper accessibility.
Acceptance criteria: Tooltip appears on hover, has an arrow pointing to the element, is perfectly centered, animates smoothly, and requires no JS.
---

# CSS-Only Tooltip

## 0. PREAMBLE: Context & Prerequisites

### 0.1 Prerequisites
Before starting this lesson, the student must understand:
* Absolute and Relative Positioning (`position: absolute`, `position: relative`)
* Pseudo-classes (`:hover`)
* Transitions (`transition`)

### 0.2 Learning Dependencies
A property or feature often relies on structural mechanics from across the curriculum. Declare the dependency graph:
* ✓ The Box Model
* ✓ Containing Blocks
* ✓ Generated Content (`::before`, `::after`, `content`)

### 0.3 Specification Reference
* **Specification:** CSS Generated Content Module Level 3
* **Relevant Sections:** The `content` property, the `attr()` function, Pseudo-elements

---

## 1. Mental Model & Problem

Tooltips historically required JavaScript to create a DOM node, calculate coordinates, and append it to the body on hover. This caused layout thrashing, performance issues, and bloated code.

The CSS-only tooltip solves this structural problem by using pseudo-elements tied to the hovered element. It borrows text directly from the HTML using the `attr()` function and manages visibility purely via CSS state.

**What This Feature Does NOT Do:**
* ❌ 1. Does not dynamically reposition itself if it hits the edge of the viewport (requires JS or modern Anchor Positioning).
* ❌ 2. Does not allow interactive content (links, buttons) *inside* the tooltip (pseudo-elements cannot be interacted with via pointer events normally, and disappearing tooltips on mouseout makes this impossible).
* ❌ 3. Does not automatically wrap long text without explicit width or `white-space` management.

## 2. Complete Language Reference & Value Grammar

The core mechanic relies on the `content` property and the `attr()` function.

* **Formal Syntax Table (for `attr()`):**
  * **Accepted Value Types & Keywords:** `attr( <attr-name> <type-or-unit>? [ , <attr-fallback> ]? )`
  * **CSS Value Grammar Types Taught:** `<custom-ident>` (attribute name)
  * **Initial Value:** N/A (Function)
  * **Inherited:** No
  * **Animatable:** No
  * **Applies To:** Pseudo-elements (`::before`, `::after`)
  * **Percentages:** N/A
  * **Computed Value:** The string value of the attribute

## 3. Complete Feature Surface

To build a tooltip, you must master the intersection of these features:
* `::before` and `::after` pseudo-elements (must have `content`).
* `content: attr(data-tooltip)` extracts the value of the `data-tooltip` HTML attribute.
* `position: absolute` on the pseudo-elements relative to the `position: relative` parent container.
* `visibility: hidden` and `opacity: 0` for the hidden state. (Using `display: none` cannot be transitioned).
* Transform functions (`translate`) for centering the tooltip.

## 4. Evolution & Modern CSS

* **Historical syntax:** Relying on `title` attributes (ugly, un-styleable, inconsistent delay).
* **Modern syntax:** Using `data-*` attributes and pseudo-elements.
* **Future/Bleeding Edge:** CSS Anchor Positioning (`anchor()`), which will replace the need for manual `position: absolute` math and handle viewport collisions automatically.

## 5. Browser Behavior, Formatting Contexts & The Cascade

* **Containing Block Resolution:** The hovered element MUST have `position: relative` (or `absolute`/`fixed`). This establishes the containing block for the `absolute` pseudo-elements.
* **Stacking Contexts:** The absolute positioning pulls the pseudo-elements out of flow. Assigning `z-index` ensures they appear above sibling elements.
* **Intrinsic Sizing:** The pseudo-element box dimensions are dictated by its intrinsic text content (`max-content`) unless constrained by `width`, `min-width`, or `max-width`. `white-space: nowrap` forces the text onto one line.

## 6. Browser Algorithm

1. Parse the HTML and identify elements with `data-tooltip`.
2. Generate anonymous inline boxes for `::before` and `::after` due to the `content` property.
3. Compute the used value of `attr(data-tooltip)` as a string.
4. Establish the containing block at the parent element (`position: relative`).
5. Calculate absolute offsets (`top`, `left`, `transform`) for the tooltip box and triangle arrow.
6. On `:hover`, style recalculation triggers. `opacity` and `visibility` transition over the defined duration.
7. Paint and composite the tooltip layer above the document flow.

## 7. Invalid CSS & Error Recovery

* **Missing `content` property:** The pseudo-element will not be generated in the render tree. It completely fails silently.
* **Typo in `attr()`:** e.g., `attr(data-tooltp)`. Returns an empty string. The box may still render as an empty rectangle if it has padding/background.
* **Transitioning `display`:** The engine cannot interpolate `display: none` to `display: block`. It snaps instantly. Error recovery here is developer logic: use `visibility` and `opacity` instead.

## 8. Interaction With Other CSS Features & CSSOM Runtime

* **The Box Model:** Padding expands the tooltip background around the text.
* **Transform:** `transform: translateX(-50%) translateY(-10px)` is crucial for true centering. Percentages in `translate` resolve against the pseudo-element's *own* dimensions, not the parent's.
* **Pointer Events:** `pointer-events: none` on the tooltip prevents the tooltip itself from triggering flickering hover states if the mouse moves onto it.

## 9. Accessibility (A11y)

* ⚠️ Screen readers do not automatically announce `data-*` attributes used in pseudo-elements across all browser/AT combinations.
* **Fix:** The parent element must use `aria-label="[Tooltip Text]"` or `title=""` (to suppress default tooltip but keep semantics), or the `data-tooltip` text should be purely decorative.
* Focus visibility: Ensure `:focus-visible` or `:focus` also triggers the tooltip for keyboard users.
  ```css
  .tooltip:hover::before, .tooltip:focus::before { opacity: 1; visibility: visible; }
  ```

## 10. Performance, Runtime Costs & Security

* **Rendering Stage Triggered:** Transitioning `opacity` and `transform` triggers only GPU Composite layers if hardware acceleration is active, avoiding expensive layout reflows on hover.
* **Security:** `attr()` only parses strings. It cannot execute JavaScript (no XSS risk via CSS content injection).

## 11. DevTools Investigation

1. Open Elements panel.
2. Select the tooltip parent element.
3. Force element state -> `:hover`.
4. Expand the DOM node to reveal `::before` and `::after`.
5. Inspect the Computed pane to verify the `translate` matrix offsets.

## 12. Visual Mental Models

```text
+-------------------------+
|     Containing Block    | <-- position: relative
|     (Hovered Element)   |
|                         |
|   +-----------------+   | <-- position: absolute
|   | ::before (Box)  |   |     bottom: 100%
|   | attr() content  |   |     left: 50%
|   +--------+--------+   |     transform: translateX(-50%)
|           / \           | <-- ::after (Arrow)
|          /   \          |     absolute, bottom: 100%, border hack
+-------------------------+
```

## 13. Prediction Checkpoints

**Prediction Code:**
```css
.tooltip { position: relative; }
.tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
}
```
*Question:* Will the tooltip be perfectly centered above the text?
*Answer:* No. `left: 50%` places the *left edge* of the tooltip at the center of the parent. You must add `transform: translateX(-50%)` to pull it back by half of its own width.

## 14. Compare Similar Features

* **CSS Tooltip vs. JS Tooltip:**
  * CSS is instantaneous, zero-dependency, and declarative.
  * JS (like Floating UI) is required if the tooltip contains clickable links, needs to flip direction at viewport edges, or needs complex HTML inside.

## 15. Decision Guide

> **I want to...** $\longrightarrow$ **Use...**
* Show simple explanatory text on hover $\longrightarrow$ CSS-only `data-tooltip` + `::before`.
* Show an interactive form or links on hover $\longrightarrow$ A real hidden DOM node (e.g., `<div>`) toggled by JS or modern CSS `popover`.
* Provide native accessibility without styling $\longrightarrow$ The `title` attribute.

## 16. Common Bugs, Edge Cases & Debugging Workflow

* **Common Bugs Table:**
  * **Symptom:** Tooltip text wraps awkwardly into a tall column.
  * **Cause:** The tooltip is constrained by the parent's width or inherited widths.
  * **Solution:** Apply `white-space: nowrap;` to the `::before`.
  * **Symptom:** Hovering causes rapid flickering.
  * **Cause:** The tooltip appears under the cursor, taking over the hover state, but lacks its own hover state, so it disappears, returning hover to the parent, repeating infinitely.
  * **Solution:** Apply `pointer-events: none;` to the pseudo-elements.

## 17. Interactive Experiments (Throwaway Labs)

1. Change `bottom: 100%` to `top: 100%` and adjust the arrow borders to create a bottom-facing tooltip.
2. Remove `transform: translateX(-50%)` and observe the alignment shift.
3. Change `transition: opacity 0.3s` to `transition: all 0.3s` and add a `translateY(10px)` to the hidden state to create a slide-up animation.

## 18. Real Project Integration

* **Target File:** `src/styles/components/_tooltip.css`
* **Code Modification:**
```css
.u-tooltip {
  position: relative;
  cursor: help;
}
.u-tooltip::before,
.u-tooltip::after {
  position: absolute;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 100;
}
.u-tooltip::before {
  content: attr(data-tooltip);
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  padding: 4px 8px;
  background: #333;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
.u-tooltip::after {
  content: "";
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #333;
}
.u-tooltip:hover::before,
.u-tooltip:hover::after,
.u-tooltip:focus-visible::before,
.u-tooltip:focus-visible::after {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```
* **Engineering Justification:** Adds a lightweight, zero-JS utility class `.u-tooltip` that can be applied to any element across the application to clarify iconography or truncated text.

## 19. Mastery Challenge

* **Find & Fix the Bug:**
  A developer complains their tooltip transition isn't working:
  ```css
  .tooltip::before { display: none; content: attr(data-tooltip); }
  .tooltip:hover::before { display: block; transition: 0.3s; }
  ```
  *Fix:* `display` is a discrete property and generally cannot be transitioned smoothly in legacy browsers. Change `display: none` to `visibility: hidden; opacity: 0;` and `display: block` to `visibility: visible; opacity: 1;`.

## 20. Mastery Checklist

- [ ] I can explain the problem this feature solves and its mental model in my own words.
- [ ] I can state at least three incorrect assumptions about what this feature does *not* do.
- [ ] I know the complete formal grammar, accepted value types, default values, and inheritance behavior.
- [ ] I can trace the browser's algorithm and intrinsic sizing rules for resolving this feature.
- [ ] I can predict error recovery behaviors for invalid values.
- [ ] I can investigate and verify this property using Browser DevTools and understand its CSSOM manipulation.
- [ ] I understand all accessibility (a11y), security, and performance implications (reflow vs repaint).
- [ ] I have applied this pattern cleanly to the ongoing real-world project.
