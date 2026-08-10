# Concept: Styling a Scrollbar Directly

**What you'll understand by the end:** how to restyle a browser's own
scrollbar using vendor-prefixed pseudo-elements, and why this is one of
the few remaining CSS areas that isn't yet a stable, cross-browser
standard.

**Prerequisites:** `css-rule-syntax-selectors-cascade.md`.

## Setup

Plain CSS, viewed in a WebKit/Blink-based browser (Chrome, Edge,
Safari) — see the SE Lens for why Firefox needs a different mechanism.

## The Problem

A browser's default scrollbar is drawn by the operating system, not
by the page — it doesn't participate in the page's own color scheme or
design language at all, and on a dark-themed page a light OS scrollbar
can look like a jarring, un-styled seam. Ordinary CSS selectors can't
reach it, because it isn't a real element in the document at all.

## The Isolated Example

```html
<div style="height: 100px; overflow-y: scroll;">
  <div style="height: 400px;">tall content, forces a scrollbar</div>
</div>

<style>
  div::-webkit-scrollbar { width: 12px; }
  div::-webkit-scrollbar-track { background: #eee; }
  div::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
</style>
```

**Real output:** in a WebKit/Blink browser, the scrollbar on this
specific `<div>` renders with a light gray track and a dark, rounded
thumb — visibly different from the browser's own default scrollbar
appearance anywhere else on the page that doesn't have this rule
applied.

**What this proves:** `::-webkit-scrollbar` and its two sub-parts are
real, selectable pseudo-elements — the scrollbar's track and the
draggable thumb inside it can each be styled independently, exactly
like styling any other element's background/border.

## Mechanical Walkthrough

- `::-webkit-scrollbar` — the scrollbar's own overall box (its width,
  for a vertical scrollbar, or height, for a horizontal one).
- `::-webkit-scrollbar-track` — the channel the thumb slides within —
  the empty background behind the draggable part.
- `::-webkit-scrollbar-thumb` — the actual draggable handle — the part
  a user clicks and drags to scroll.
- The `-webkit-` prefix — a vendor prefix, marking this as a
  WebKit/Blink-engine-specific extension to CSS, not (yet) a
  cross-browser standard pseudo-element.

## CS Lens

Not a hard CS concept — a real, practical styling mechanism, not an
algorithm.

## SE Lens

The real cost here is genuine cross-browser inconsistency: Firefox
never adopted `::-webkit-scrollbar` at all, and instead ships its own,
different, standards-track properties (`scrollbar-width`,
`scrollbar-color`) that style a scrollbar with far less granular
control (one thumb/track color pair, no separate track/thumb rules).
A real, production styling pass typically needs *both* — the
`-webkit-` rules for Chrome/Safari/Edge, and `scrollbar-color`/
`scrollbar-width` for Firefox — rather than one universal rule set,
because no single mechanism covers every major engine yet.

## Connection

Builds on `css-rule-syntax-selectors-cascade.md` (pseudo-elements are
just another selector type); has no dependents yet in this catalog.

## Try It Yourself

1. Remove `::-webkit-scrollbar-track`'s rule entirely and reload —
   confirm the track falls back to the browser's own default track
   appearance while the thumb stays custom-styled, proving each
   sub-part is independently optional.
2. Add `scrollbar-width: thin;` and `scrollbar-color: #333 #eee;` to the
   same `div` rule, then check the result in Firefox specifically —
   confirm Firefox honors these two properties (a coarser, single-color
   version of the same visual idea) while ignoring the `-webkit-`
   rules entirely.
3. Change `::-webkit-scrollbar-thumb`'s `background` to use a CSS
   `:hover` pseudo-class variant (`div::-webkit-scrollbar-thumb:hover`)
   and confirm the thumb visibly changes color only while the mouse
   hovers directly over it.
