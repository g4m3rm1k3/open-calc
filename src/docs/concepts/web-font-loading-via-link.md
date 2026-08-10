# Concept: Loading a Real Web Font

**What you'll understand by the end:** how a browser fetches and
applies a font it doesn't already have installed, why the loading
strategy matters for how the page looks while that font is still in
transit, and what `preconnect` actually buys you.

**Prerequisites:** none beyond ordinary HTML.

## Setup

No packages — this concept is plain HTML/CSS, demonstrated against any
static HTML file opened in a browser.

## The Problem

`font-family: "Some Font", sans-serif` only works if the browser
already has "Some Font" available somewhere — otherwise it silently
falls back to the next name in the list. A real, custom web font has to
be fetched over the network before the browser can use it at all, and
naively doing that can either block the page from showing *any* text
until the font arrives, or cause a visible jump the moment it does.

## The Isolated Example

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', sans-serif;">
  Real text, rendered in a real downloaded font.
</body>
```

**Real output:** opening this in a browser and inspecting the
`Network` tab shows two real requests — one to `fonts.googleapis.com`
for a small CSS file (containing `@font-face` rules), and one to
`fonts.gstatic.com` for the actual font file the CSS references —
confirming a web font is a real, separate network resource, not
something bundled into the HTML/CSS itself.

**What this proves:** `font-family: 'Inter'` only actually renders in
Inter because these three lines fetched it first; deleting the `<link
href="...">` line and reloading falls back silently to the browser's
default sans-serif, with no error — proving the font name in CSS is
just a request for *whichever* font is available under that name, real
or fallen-back.

## Mechanical Walkthrough

- `<link rel="preconnect" href="...">` — tells the browser to start the
  network handshake (DNS lookup, TCP connection, TLS negotiation) to
  that origin *immediately*, before anything on the page actually asks
  for a resource from it — so that when the stylesheet request a moment
  later does need that connection, it's already warm.
- `crossorigin` (on the second `preconnect`, to `fonts.gstatic.com`) —
  the actual font file request will be a cross-origin, credential-less
  fetch; without this attribute the pre-warmed connection wouldn't
  match the one the browser actually opens for that request, wasting
  the optimization.
- `<link href="...css2?family=Inter:wght@400;700&display=swap"
  rel="stylesheet">` — a real stylesheet request; the URL's own query
  string (`family=Inter:wght@400;700`) asks the font-serving CSS
  generator for exactly two weights (regular, bold) of one font family
  — requesting only the weights actually used, not the whole family.
- `&display=swap` — the loading strategy: render text immediately in
  the fallback font (`sans-serif`), then swap to the real font the
  moment it finishes downloading, rather than leaving text invisible
  until the font arrives (the browser's other common default,
  `font-display: block`).

## CS Lens

Not a hard CS concept — this is a real-world networking/rendering
tradeoff (when to fetch, when to block, when to swap), not an
algorithm or data structure.

## SE Lens

`display=swap`'s real tradeoff is a brief layout shift (text visibly
reflows the instant the real font swaps in, since most fonts have
different letter widths) in exchange for never leaving a user staring
at invisible text on a slow connection. The alternative,
`font-display: block` (or no strategy at all, the historical browser
default), avoids that visible swap but risks several seconds of blank
text on a slow connection — a real, opposite tradeoff, and neither
choice is universally correct; it depends on whether a brief reflow or
a blank-text delay is worse for a given page.

## Connection

Builds on nothing else in this catalog; commonly paired with a CSS
`font-family` declaration naming the loaded font first, with a generic
fallback (`sans-serif`, `monospace`) always listed after it for the
window before the real font arrives (or if the request ever fails).

## Try It Yourself

1. Open a page using this technique in a browser's dev tools Network
   tab, throttle the connection to "Slow 3G," and reload — watch the
   fallback font render first, then visibly swap to the real one a
   moment later.
2. Remove the two `preconnect` links (keep the stylesheet link) and
   compare the Network tab's timing waterfall — confirm the DNS/TLS
   handshake to the font's own origin now happens only after the
   stylesheet request begins, not before.
3. Change `&display=swap` to `&display=block` and repeat the slow-
   connection test — confirm text is now invisible for a moment
   instead of showing the fallback font immediately.
