# Lesson 3: Text Alignment and Decoration

## 1. The Mental Model & Problem Solved

Text defaults to sitting on a baseline, aligning to the left edge of its container, and rendering exactly as typed.

**The Problem:** UI design requires hierarchy and emphasis. We need titles centered, links underlined, and buttons capitalized, without forcing the content author to physically type "BUTTON" in all-caps in the HTML database.
**The Solution:** 
- `text-align`: Controls the horizontal justification of inline content within its block container.
- `text-decoration`: Draws lines over, under, or through the text glyphs.
- `text-transform`: Alters the capitalization of the text at the rendering layer, without changing the underlying HTML text data.

## 2. The Complete Grammar

### `text-align`
- **Formal syntax:** `text-align: start | end | left | right | center | justify`
- **Initial value:** `start` (or `left` in LTR languages).
- **Inherited:** **Yes.**
- **Animatable:** No.
- **Percentages allowed?:** N/A.
- **Computed value:** The specified keyword.
- **Applies to:** Block containers (It aligns the *inline* content inside the block, not the block itself!).

### `text-decoration`
- **Formal syntax:** `text-decoration: <line> || <style> || <color> || <thickness>`
- **Accepted value types:** Lines (`underline`, `overline`, `line-through`, `none`), styles (`solid`, `wavy`, `dashed`), colors.
- **Initial value:** `none`.
- **Inherited:** **No.** (But it *looks* like it does because the line is drawn across all child text nodes).
- **Animatable:** Yes (Thickness and color are animatable).
- **Percentages allowed?:** No.
- **Computed value:** The individual longhand properties.
- **Applies to:** All elements.

### `text-transform`
- **Formal syntax:** `text-transform: none | capitalize | uppercase | lowercase`
- **Initial value:** `none`.
- **Inherited:** **Yes.**
- **Animatable:** No.
- **Percentages allowed?:** N/A.

## 3. Syntax Evolution & Modern Usage

**Logical Alignment**
In the past, we wrote `text-align: left;` and `text-align: right;`. 
Modern CSS strongly encourages **logical properties**: `text-align: start;` and `text-align: end;`. 
If your website is translated into Arabic (a Right-To-Left language), `start` automatically becomes the right side of the screen, and `end` becomes the left side. If you hardcode `left`, your layout breaks in RTL languages.

**Modern Underlines**
Historically, `text-decoration: underline` drew a harsh, thick line directly through the descenders of letters like "p" and "g", making them hard to read. Modern CSS introduced `text-underline-offset` and `text-decoration-thickness` to push the line down and thin it out, creating beautiful, magazine-quality links.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  text-align: middle; /* Invalid! */
  text-transform: titlecase; /* Invalid! */
}
```

**Error Recovery:**
- `text-align: middle;` is dropped. The correct keyword is `center`. (`middle` is used for `vertical-align`, a totally different property).
- `text-transform: titlecase;` is dropped. The correct keyword is `capitalize`.

## 5. Accessibility (A11y)

**The `justify` Trap:** 
Never use `text-align: justify;` for body paragraphs on the web. While it looks neat in printed books, web browsers do not have the complex hyphenation engines of Adobe InDesign. Justifying text on the web creates "rivers of white space" (massive, uneven gaps between words) that make reading incredibly difficult for users with dyslexia. 

**The ALL CAPS Trap:**
Screen readers (software used by blind users) often interpret ALL CAPS text as acronyms. If you type `<p>HELLO</p>` in HTML, the screen reader might read it aloud as "H. E. L. L. O." instead of the word "Hello". 
**Rule:** Always type the text normally in HTML (`<p>Hello</p>`), and use CSS `text-transform: uppercase;` to make it visually capitalized. The screen reader will read the normal HTML, but the sighted user will see the caps.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** a link (`<a>`).
2. Add `text-decoration: underline red wavy;`.
3. Zoom in. Notice how the wavy line cuts directly through the bottom of letters like "y" and "j".
4. Add `text-underline-offset: 4px;`. Watch the line snap downward, instantly improving readability.
5. **Performance impact:** These properties are extremely cheap. They trigger Paint, but are heavily optimized by the browser's text rendering engine.

## 7. Prediction Checkpoints

### Checkpoint 1: Aligning the Block vs Aligning the Text
```html
<style>
  .box {
    width: 200px;
    background: blue;
    text-align: center;
  }
</style>
<div class="box">Hello</div>
```
**Question:** Is the blue box centered in the middle of the web page, or is the text "Hello" centered inside the blue box?

*...predict your answer before reading below...*

**Explanation:** The **text is centered inside the box**. 
`text-align` only affects the inline content *inside* the element. It does not move the element itself. (To center the box itself on the page, you would use `margin: 0 auto;`).

## 8. Compare Similar Features

### `text-transform: capitalize` vs `uppercase`
- **`capitalize`:** Transforms only the *first letter* of every word to uppercase (e.g., "hello world" -> "Hello World").
- **`uppercase`:** Transforms *every letter* to uppercase (e.g., "hello world" -> "HELLO WORLD").

## 9. Decision Guide

- **I want to center a paragraph** -> `text-align: center;`
- **I want my button text to look like yelling, but be accessible** -> `text-transform: uppercase;`
- **I want to strike out an old price** -> `text-decoration: line-through;`
- **I want beautiful links** -> `text-decoration: underline; text-underline-offset: 3px;`

## 10. The Real Project

Apply this to our `styles.css`.

```css
/* styles.css */
.card-price-old {
  /* Strike out the old price */
  color: #9ca3af;
  text-decoration: line-through;
}

.card-button {
  /* Make the button text pop without ruining screen readers */
  text-align: center;
  text-transform: uppercase;
}
```

## 11. Mastery Checklist

- [ ] I know why we use `text-align: start` instead of `left` (Internationalization).
- [ ] I understand why typing ALL CAPS in HTML ruins accessibility.
- [ ] I know why `text-align: justify` is terrible for dyslexia on the web.
- [ ] I can use `text-underline-offset` to make readable links.
- [ ] I understand that `text-align` centers the text, not the box.
- [ ] I have applied the alignment and decoration to my project code.
