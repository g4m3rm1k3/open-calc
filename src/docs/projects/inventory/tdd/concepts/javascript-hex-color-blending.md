# Concept: Blending Hex Colors Toward White or Black

**What you'll understand by the end:** how to convert a `#rrggbb` hex
color to its numeric red/green/blue channels and back, and how to use
that to compute a lighter or darker variant of any color at runtime,
without a design tool or a hardcoded second color.

**Prerequisites:** `javascript-hexadecimal-number-literal.md`,
`typescript-tuple-types.md`.

## Setup

Plain JavaScript or TypeScript — no libraries needed; every operation
below is a built-in string/number method.

## The Problem

A UI that only ever shows *one* fixed color per role (one blue for links,
one gray for borders) can just hardcode a second, pre-chosen "hover" or
"emphasized" shade next to it by hand. But a system that accepts an
arbitrary color at runtime — a user-selected accent, a color loaded from
data — can't hardcode that second shade in advance; it has to be
*computed* from whatever the base color turns out to be, every time.

## The Isolated Example

```javascript
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function lightenHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

console.log("hexToRgb(#63b8ff):", hexToRgb("#63b8ff"));
console.log("lightenHex(#63b8ff, 0.3):", lightenHex("#63b8ff", 0.3));
console.log("lightenHex(#63b8ff, 1.0) — fully toward white:", lightenHex("#63b8ff", 1.0));
```

**Real output, run this session:**
```
hexToRgb(#63b8ff): [ 99, 184, 255 ]
lightenHex(#63b8ff, 0.3): #92cdff
lightenHex(#63b8ff, 1.0) — fully toward white: #ffffff
```

**What this proves:** `hexToRgb` correctly splits a real hex string into
its three numeric channels (`99, 184, 255`); `lightenHex` at `amount: 0.3`
produces a visibly lighter, but still recognizably blue, shade
(`#92cdff`); and at `amount: 1.0` — moving the *entire* remaining distance
to white — it correctly lands on pure white (`#ffffff`), confirming the
blend formula's endpoint behaves exactly as the word "fully" implies.

## Mechanical Walkthrough

- `hex.replace("#", "")` — **(b) reappearing** — `String.prototype.replace`
  used here to strip a fixed leading character, not to reappear with a
  regex.
- `clean.slice(0, 2)` / `.slice(2, 4)` / `.slice(4, 6)` — **(a) first
  appearance** — `String.prototype.slice(start, end)`: returns the
  substring from `start` up to (not including) `end`. Splits a 6-character
  hex string into its three 2-character channel pairs by position.
- `parseInt(str, 16)` — **(a) first appearance** — parses a string as an
  integer in the given base (radix); base 16 (hexadecimal) reads pairs
  like `"63"` as `99`, `"ff"` as `255`. This is the *reverse* direction of
  `.toString(16)`, already taught in `javascript-hexadecimal-number-literal.md`.
- `return [...]` typed as a **(b) reappearing** tuple
  (`typescript-tuple-types.md`) in the real project version — guarantees
  exactly three channels to every caller.
- `Math.round(n)` — **(b) reappearing** — already-established `Math`
  method, applied here to a channel value that may have landed on a
  fractional number after blending.
- `.toString(16)` — **(b) reappearing**, per
  `javascript-hexadecimal-number-literal.md` — converts a number to its
  base-16 string form; here, one channel at a time instead of a whole hex
  literal.
- `.padStart(2, "0")` — **(a) first appearance** as a taught concept
  (though this exact method already appears once in this project's own
  `ToolCardList.tsx`/`ToolImportPanel.tsx`, on tool numbers) —
  `String.prototype.padStart(targetLength, padString)`: pads the string on
  the *left* with `padString` until it reaches `targetLength`. Needed
  because `(10).toString(16)` is `"a"` — one character — but a hex color
  channel always needs exactly two; without padding, `#63b8ff` blended
  down to a low channel value could produce a broken 5-character color
  like `#a...` instead of `#0a...`.
- `r + (255 - r) * amount` — **(a) first appearance** — **linear
  interpolation** toward a target value (here, `255`, white): move `amount`
  fraction of the *remaining distance* to the target, rather than adding a
  fixed offset. At `amount: 0` this returns `r` unchanged; at `amount: 1`
  it returns exactly `255`, regardless of what `r` started as — which is
  exactly what the real output above confirms.

## CS Lens

Linear interpolation (often shortened to "lerp") is a foundational
technique in computer graphics: this exact formula, applied per-channel,
is how animation software blends between two colors or two positions over
time, how image editors preview an opacity slider, and how a GPU shader
blends between two textures at their boundary.

Also recognized in: CSS's own `transition`/`animation` engines internally,
game engines interpolating a character's position between two frames,
gradient rendering in any 2D graphics API, audio crossfading between two
tracks.

## SE Lens

The real alternative is a **fixed palette**: hand-pick and hardcode every
shade a design will ever need (a "500" and a "300" and a "700" of each
color, the way many CSS frameworks ship a fixed numeric scale). That
alternative gives a designer exact, curated control over every value — a
real advantage this computed approach gives up. The computed approach is
worth it specifically when the *base* color itself isn't known ahead of
time (loaded from data, chosen by a user, one of many interchangeable
options) — hand-curating a "lighter" and "darker" shade for every possible
base color simply isn't something that can be done in advance. The real
cost being accepted: a computed blend can land on a shade a human
designer would never have chosen by eye, for some inputs — genuinely
worse in isolated cases than hand-picked values, in exchange for working
automatically across an open-ended set of inputs.

## Connection

Builds on `javascript-hexadecimal-number-literal.md` and
`typescript-tuple-types.md`. Used in this project's real code to derive a
"bright" accent and a "strong" border from each theme's own base colors in
`design-tokens-theming-pattern.md`, instead of hand-authoring a second
shade for every one of many themes.

## Try It Yourself

1. Write `darkenHex(hex, amount)` — the mirror operation, interpolating
   each channel toward `0` (black) instead of `255` — and confirm
   `darkenHex("#63b8ff", 1.0)` produces `#000000`.
2. Call `lightenHex` with `amount` greater than `1` (say, `1.5`) and
   predict the result before running it — reason about whether the
   formula still produces a valid color, and why (or why not).
