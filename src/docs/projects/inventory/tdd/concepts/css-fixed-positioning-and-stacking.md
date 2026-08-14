# Concept: `position: fixed`/`absolute`, `inset`, and Stacking with `z-index`

**What you'll understand by the end:** how to take an element completely out of a page's normal, flowing layout and place it exactly where you want, and how to control which of several overlapping elements draws on top.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Any plain HTML file — no install, no build tool needed.

## The Problem

Normal CSS layout ("static" positioning, the default) places every element in the order it appears in the document, each one affecting where the next one goes — exactly the model every earlier lesson's stacked page used. Some real UI can't work that way: a background layer that should always fill the screen regardless of what else is on the page, with other elements floating on top of it at fixed screen positions, is a fundamentally different arrangement normal flow can't produce.

## The Isolated Example

```html
<div class="background">background</div>
<div class="overlay">overlay</div>
```
```css
.background {
  position: fixed;
  inset: 0;
  background: navy;
  z-index: 0;
}
.overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  background: orange;
  z-index: 1;
  padding: 10px;
}
```

**Real, rendered result:** `.background` fills the entire browser viewport edge to edge, regardless of the page's real content size or scroll position — it does not scroll away, and nothing before or after it in the HTML affects its size or position at all. `.overlay` renders as a small orange box floating 20px from the top-left corner of the *viewport* (not of wherever it happens to sit in the HTML), drawn *on top of* the background — confirmed by removing `z-index: 1` from `.overlay` and setting `.background`'s to `2` instead: the orange box disappears completely behind the navy layer.

## Mechanical Walkthrough

- `position: fixed` — **(a) first appearance** — removes the element from normal document flow entirely and positions it relative to the **viewport** (the visible browser window) rather than relative to any parent element or the page's own scroll position — it stays in the same screen position even if the page scrolls (irrelevant here, since the shell itself never scrolls, but the defining real behavior of this value).
- `position: absolute` — **(a) first appearance** — also removed from normal flow, but positioned relative to its nearest **positioned** ancestor (any ancestor with a `position` other than the default `static`) — not the viewport. Here, with no positioned ancestor at all, it falls back to the initial containing block, which behaves like the viewport for this simple example; inside a real component tree, it's almost always positioned relative to the nearest real `position: relative`/`fixed`/`absolute` parent instead.
- `inset: 0` — **(a) first appearance** — a real shorthand for `top: 0; right: 0; bottom: 0; left: 0;` all at once — only meaningful on an element that's already `fixed`/`absolute`/`relative` (per the two bullets above), and exactly what "fill the entire positioned area, in every direction" means concretely.
- `top: 20px; left: 20px` — **(c) already established** — ordinary CSS length values, now controlling *offset from the positioning context* rather than nothing at all (a `static` element ignores these properties completely).
- `z-index: 0` / `z-index: 1` — **(a) first appearance** — on elements that both have a `position` other than `static`, a higher `z-index` draws *in front of* a lower one, regardless of which appears earlier in the HTML — confirmed directly by the swapped-values experiment above, where the visual order flipped exactly opposite to the HTML source order.

## CS Lens

This is a real, browser-specific instance of **explicit spatial layering** — the same general idea any graphics/windowing system uses (each surface assigned a draw order independent of when it was created), here controlled directly by a single, comparable number per element rather than an implicit "most-recently-created wins" rule.

Also recognized in: any layered graphics API (Photoshop's own layer stack, a game engine's render-order/sorting-layer system), and a desktop operating system's own window manager deciding which application window draws on top when several overlap — directly relevant to this project's own real goal, a desktop-style layered UI.

## SE Lens

Normal document flow is the right default for almost all content — text, forms, lists — precisely because it requires no manual positioning at all and reflows correctly as content changes. The real, deliberate tradeoff of `fixed`/`absolute` here: taking an element out of flow means nothing else on the page can push it around by accident, which is exactly the guarantee a background render layer needs (nothing about a sibling panel's size should ever be able to resize it) — but it also means *this* element no longer participates in reflow either, so its size and position have to be stated explicitly rather than inferred from its content, a real responsibility flow positioning would otherwise have handled for free.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md`. Directly relevant to any UI with independently-layered regions — a fixed header, a modal overlay, a game's HUD over its render canvas, and this project's own real use: a full-screen 3D viewport that must never resize just because a side panel did.

## Try It Yourself

1. Add a third `position: relative` element as a normal, in-flow sibling *before* `.background` in the HTML, give it real height, and confirm `.background` still fills the whole viewport rather than starting below it — direct proof `fixed` genuinely ignores its position in the document.
2. Nest `.overlay` inside a new `position: relative` wrapper `div` instead of leaving it a direct child of `body`, and confirm its `top`/`left` now offset from that wrapper's corner instead of the viewport's — the concrete difference `absolute`'s "nearest positioned ancestor" rule makes.
3. Give both elements equal `z-index: 0` and reason about (or confirm) which one draws on top — then explain the real tiebreaker from what you already know about the cascade (`css-rule-syntax-selectors-cascade.md`'s own source-order rule).
