# Lesson 2: Hiding Elements

## 1. The Mental Model & Problem Solved

Sometimes you need an element to exist in the HTML (like a dropdown menu, a modal, or a success message), but you don't want the user to see it until they click a button.

**The Problem:** There are many ways to make something invisible in CSS, but they have radically different consequences for the rendering engine, the page layout, and the screen reader.
**The Solution:** We must choose between `display: none`, `visibility: hidden`, or `opacity: 0` based on whether we want the element to physically occupy space, remain readable to blind users, or be smoothly animated.

## 2. The Complete Grammar

### `display: none`
- **Description:** Completely removes the element and all its children from the browser's rendering tree. It is as if the element was deleted from the HTML file.
- **Inherited:** N/A (The element ceases to exist visually, so children disappear with it).
- **Animatable:** No (Except via modern CSS Level 4 discrete entry/exit animations, which are complex).
- **Computed value:** `none`.

### `visibility: hidden`
- **Formal syntax:** `visibility: visible | hidden | collapse`
- **Description:** The element is invisible, but it **maintains its physical geometry**. It acts like an invisible ghost holding its space in the layout.
- **Inherited:** **Yes.** (Crucially, if a parent is `hidden`, a child can declare `visibility: visible` and reappear while the parent remains invisible!)
- **Animatable:** Yes (It acts as a boolean switch at the end of a transition).

### `opacity: 0`
- **Description:** The element is completely transparent. Like `visibility`, it still takes up physical space. Unlike `visibility`, it can still be clicked!
- **Animatable:** Yes (Smoothly interpolates).

## 3. Syntax Evolution & Modern Usage

**The Accessibility Hiding Hack (Screen Reader Only)**
If you want to hide a label visually (because your UI design has a magnifying glass icon for the search bar instead of the word "Search"), you cannot use `display: none`. If you do, the screen reader will ignore it, and the blind user won't know what the input does.
Historically, developers created the `.sr-only` class to hide things visually but keep them readable by screen readers:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
This physically shrinks the box to an invisible 1-pixel dot, keeping it in the HTML accessibility tree while removing it from the visual UI.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  display: hidden; /* Invalid! */
  visibility: none; /* Invalid! */
}
```

**Error Recovery:**
- `display: hidden;` is dropped. A very common beginner mistake is mixing up the keywords. `display` uses `none`.
- `visibility: none;` is dropped. `visibility` uses `hidden`. 

## 5. Accessibility (A11y)

| Technique | Visually Hidden? | Consumes Space? | Clickeable? | Read by Screen Reader? |
| :--- | :--- | :--- | :--- | :--- |
| `display: none` | Yes | No | No | **No** |
| `visibility: hidden`| Yes | Yes | No | **No** |
| `opacity: 0` | Yes | Yes | **Yes** | **Yes** |
| `.sr-only` hack | Yes | No | No | **Yes** |

**Crucial A11y Rule:** Never use `opacity: 0` to hide a button or link unless you also disable it. Even though it's transparent, it is still physically present and a sighted user might accidentally click the invisible empty space and trigger the action.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** a paragraph.
2. In the Styles tab, add `visibility: hidden`. Notice how the text vanishes, but a massive blank hole remains in your layout where the paragraph used to be.
3. Change it to `opacity: 0`. The visual result is identical.
4. Change it to `display: none`. Notice how the elements below it violently slam upward to fill the void. The element was completely deleted from the layout math.
5. **Performance impact:** Changing `display: none` to `display: block` triggers **Layout**, which is very expensive. Changing `opacity` from `0` to `1` triggers only **Composite**, which is practically free. This is why we fade menus in with `opacity`, rather than animating `display`.

## 7. Prediction Checkpoints

### Checkpoint 1: The Ghost Child
```html
<style>
  .parent { visibility: hidden; }
  .child { visibility: visible; }
</style>
<div class="parent">
  Parent Text
  <div class="child">Child Text</div>
</div>
```
**Question:** Will the user see "Parent Text"? Will they see "Child Text"?

*...predict your answer before reading below...*

**Explanation:** They will see **only "Child Text"**. 
Because `visibility` inherits, the child initially becomes hidden. But because we explicitly override the child to `visible`, it reappears. This creates a floating child element whose parent is completely invisible. (Note: You cannot do this with `display: none` or `opacity: 0`).

## 8. Compare Similar Features

### `display: none` vs `visibility: hidden`
- **`display: none`:** Element is deleted from the layout. Other elements shift to fill the gap.
- **`visibility: hidden`:** Element is rendered, takes up space, but the pixels are left empty. Other elements do not shift.

## 9. Decision Guide

- **I want a dropdown menu to physically disappear and not take up space** -> `display: none;`
- **I want a loading spinner to fade out smoothly** -> `opacity: 0;` (and `pointer-events: none;` so it can't be clicked).
- **I am building a layout grid, and I want an empty cell to hold its shape** -> `visibility: hidden;`
- **I want to hide a label visually but keep it for screen readers** -> Use the `.sr-only` clipping hack.

## 10. The Real Project

Apply this to our `styles.css`. We will create a `.hidden` utility class for our card component that completely removes it from the layout when applied via JavaScript.

```css
/* styles.css */

/* Utility class to forcefully remove elements from the layout */
.hidden {
  display: none !important;
}

/* 
  Example HTML usage:
  <div class="card hidden">This card is in the DOM but deleted from layout</div>
*/
```

## 11. Mastery Checklist

- [ ] I can accurately predict whether elements will shift when hidden.
- [ ] I know why `opacity: 0` is dangerous for hidden interactive elements.
- [ ] I can explain why `display: hidden` is invalid syntax.
- [ ] I know how to use the `.sr-only` hack for screen readers.
- [ ] I have applied the `.hidden` utility class to my project code.
