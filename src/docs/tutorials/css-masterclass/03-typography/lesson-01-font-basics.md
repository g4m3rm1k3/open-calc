# Lesson 1: Font Basics

## 1. The Mental Model & Problem Solved

Web browsers ship with a default set of system fonts (usually Times New Roman for serif, Arial for sans-serif). 

**The Problem:** Default browser fonts make websites look like 1990s academic papers. We need precise control over the typographic voice of our application—from the exact typeface used, to its size, and how thick the letterforms are drawn.
**The Solution:** The CSS Font properties (`font-family`, `font-size`, `font-weight`, `font-style`) interface directly with the operating system's font rendering engine to select and scale typefaces.

## 2. The Complete Grammar

### `font-family`
- **Formal syntax:** `font-family: [ <family-name> | <generic-family> ]#`
- **Accepted value types:** Strings (e.g., `"Helvetica Neue"`), Keywords (`sans-serif`, `serif`, `monospace`, `system-ui`).
- **Initial value:** Browser dependent (usually a serif font).
- **Inherited:** **Yes.** 
- **Animatable:** No.
- **Percentages allowed?:** No.
- **Computed value:** As specified.
- **Applies to:** All elements.

### `font-size`
- **Formal syntax:** `font-size: <absolute-size> | <relative-size> | <length-percentage>`
- **Accepted value types:** Lengths (`px`, `rem`, `em`), percentages (`%`), keywords (`small`, `large`).
- **Initial value:** `medium` (Which resolves to `16px` in all major browsers by default).
- **Inherited:** **Yes.**
- **Animatable:** Yes.
- **Percentages allowed?:** Yes (Relative to parent element's font size).
- **Computed value:** Absolute length (`px`).

### `font-weight`
- **Formal syntax:** `font-weight: <font-weight-absolute> | bolder | lighter`
- **Accepted value types:** Numbers (`100` to `900`), keywords (`normal`=400, `bold`=700).
- **Initial value:** `normal` (400).
- **Inherited:** **Yes.**
- **Animatable:** Yes (If using a Variable Font!).

### `font-style`
- **Formal syntax:** `font-style: normal | italic | oblique`
- **Initial value:** `normal`.
- **Inherited:** **Yes.**

## 3. Syntax Evolution & Modern Usage

**The Font Stack (Fallbacks)**
You can never guarantee a user has a specific font installed on their computer. Therefore, `font-family` accepts a comma-separated list called a "Font Stack". The browser checks the OS for the first font. If it's missing, it falls back to the second, and so on.
```css
/* Old approach: explicitly listing OS-specific fonts */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

/* Modern approach: Let the browser pick the OS default automatically */
font-family: system-ui, sans-serif;
```

**Variable Fonts**
Historically, if you wanted `normal` (400) and `bold` (700) and `black` (900) weights, the user had to download 3 separate font files. Modern CSS supports **Variable Fonts**, which bundle the entire weight spectrum (100 to 900) into a single file, allowing you to animate the font weight smoothly on hover.

## 4. CSS Parsing, Error Recovery, & Invalid Values

```css
.card {
  font-family: Roboto Arial sans-serif; /* Invalid! */
  font-size: 16;                        /* Invalid! */
  font-weight: super-bold;              /* Invalid! */
}
```

**Error Recovery:**
- `font-family: Roboto Arial;` is dropped. You **must** separate font names with commas. If a font name has a space in it (like `"Times New Roman"`), you **must** wrap it in quotes.
- `font-size: 16;` is dropped. You must provide a unit (e.g., `px` or `rem`).
- `font-weight: super-bold;` is dropped. The parser only understands numeric weights or the explicit `normal`/`bold` keywords.

## 5. Accessibility (A11y)

**Never use `px` for `font-size`.**
If you hardcode `font-size: 16px`, you override the user's operating system preferences. Visually impaired users often set their OS default font size to 24px so they can read the internet. Your `16px` rule forces it back down, breaking accessibility.
**Rule:** Always use `rem` (Root EM) for font sizes. `1rem` equals the user's preferred default size. If their default is 16px, `1rem` = 16px. If they are visually impaired and their default is 24px, `1rem` = 24px. It scales perfectly.

## 6. DevTools & Performance (Real Browser Visualization)

1. Open DevTools -> **Inspect** a paragraph of text.
2. In the right panel, find the **Computed** tab.
3. Scroll all the way to the bottom. You will see a special section called **Rendered Fonts**.
4. This tells you *exactly* which font file the browser actually chose from your font stack, and whether it pulled it from the network or the Local OS. If a font looks wrong, check this tab to prove whether your custom font actually loaded.
5. **Performance impact:** Web fonts are heavy. When a browser downloads a custom font, it often hides the text (Flash of Invisible Text, FOIT) until the font arrives. We'll learn how to fix this with `font-display: swap` in advanced modules.

## 7. Prediction Checkpoints

### Checkpoint 1: The Inherited Cascade
```html
<style>
  body { font-family: sans-serif; }
  h1 { font-family: serif; }
  .wrapper { font-weight: bold; }
</style>
<body>
  <div class="wrapper">
    <h1>Hello World</h1>
  </div>
</body>
```
**Question:** Is the `<h1>` text sans-serif or serif? Is it bold or normal weight?

*...predict your answer before reading below...*

**Explanation:** It is **serif** and **bold**. 
The `<h1>` inherits `sans-serif` from the body, but explicitly overrides it to `serif`. It inherits `font-weight: bold` from the `.wrapper`. Remember: almost all typography properties inherit down the tree.

## 8. Compare Similar Features

### `em` vs `rem`
- **`rem` (Root EM):** Relative to the `<html>` root font size (the user's OS preference). If root is 16px, `2rem` is *always* 32px everywhere on the page. Use this for `font-size`.
- **`em`:** Relative to the *parent* element's font size. If a parent is 20px, an `em` child is 20px. If an `em` is nested inside an `em` inside an `em`, the math compounds exponentially. Use this for padding/margins that need to scale relative to the text size, but avoid it for `font-size`.

## 9. Decision Guide

- **I want a modern, native-feeling app** -> `font-family: system-ui, sans-serif;`
- **I want accessible text sizing** -> `font-size: 1rem;` (Avoid `px`).
- **I want slightly thicker text but not full bold** -> `font-weight: 500;` (Medium).
- **I want to emphasize a quote** -> `font-style: italic;`

## 10. The Real Project

Apply this to our `styles.css`. We will set a modern `system-ui` font on the `<body>` so everything inherits it, and configure our `.card` typography.

```css
/* styles.css */
body {
  /* Set a clean, modern OS font for the entire page */
  font-family: system-ui, -apple-system, sans-serif;
}

.card {
  /* ... previous properties ... */
  
  /* Ensure the card text is accessible and standard size */
  font-size: 1rem;
}

/* We will style a title inside the card */
.card-title {
  font-size: 1.25rem;
  font-weight: 600; /* Semi-bold */
}
```

## 11. Mastery Checklist

- [ ] I can write a fallback font stack with commas.
- [ ] I know why we use `rem` instead of `px` for font sizes (Accessibility).
- [ ] I know that numeric font weights map to concepts like normal (400) and bold (700).
- [ ] I can use the DevTools "Rendered Fonts" panel to prove which font actually loaded.
- [ ] I have applied the typography baseline to my project code.
