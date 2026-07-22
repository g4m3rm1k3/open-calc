# Concept: WebGL's `lineWidth` Is (Almost Always) Ignored

**What you'll understand by the end:** why setting a thicker line width
on a real WebGL line often has zero visible effect, and the real,
different technique GPU-accelerated apps use instead to draw a visibly
thick line.

**Prerequisites:** none.

## Setup

Any browser with WebGL, no packages needed for the underlying fact
(Three.js used for the workaround section, already a real dependency of
this project).

## The Problem

OpenGL's original line-drawing API (and WebGL, which is modeled closely
on a subset of OpenGL) has always had a `lineWidth` setting. On desktop
OpenGL it can genuinely draw a thick line. On nearly every real GPU
driver WebGL actually runs on, though — confirmed by the WebGL
specification itself — `lineWidth` values above `1` are silently
clamped back down to `1`, because those drivers only implement OpenGL's
"core" line rendering path, which never supported wide lines reliably
across vendors. Code that sets `renderer.lineWidth(5)` (or, in Three.js,
`new THREE.LineBasicMaterial({ linewidth: 5 })`) compiles, runs, and
produces no error — it just draws a 1-pixel line regardless, silently.

## The Isolated Example

```javascript
const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl");
console.log("ALIASED_LINE_WIDTH_RANGE:", Array.from(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)));
```

**Real output, run this session** (Chromium, via Playwright, the same
browser this whole project's own live verification has used):
```
ALIASED_LINE_WIDTH_RANGE: [ 1, 1 ]
```

**What this proves:** the browser's own WebGL implementation reports its
*real, actual* supported line-width range as exactly `[1, 1]` — meaning
`1` is the only legal width the driver will honor, not a suggestion. Any
larger value passed to `lineWidth` gets silently clamped to that same
range; there is no error to catch, because from WebGL's own point of
view, `1` is a perfectly valid choice within its reported range.

## Mechanical Walkthrough

- `gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)` is the real, correct way
  to check what a given browser/GPU actually supports — not
  documentation, not assumption, the live driver's own reported range.
- The `[1, 1]` result is near-universal on WebGL specifically because
  wide-line support was never part of the safe, cross-vendor subset the
  WebGL spec standardized on, unlike desktop OpenGL, where it's
  historically been more available (though also inconsistent there).
- Nothing about this is a bug to "fix" in the traditional sense — it's a
  real platform limitation every WebGL-based renderer has to design
  around, not work through.

## CS Lens

This is a real API-surface-versus-actual-capability mismatch: the method
exists, accepts a wider range as a valid argument type, and produces no
error for values it will not honor. A capability that's *representable*
in an API's types isn't the same guarantee as a capability the runtime
will actually provide — checking the real, reported range
(`ALIASED_LINE_WIDTH_RANGE`) is the only way to know for certain, for
this specific driver, right now.

## SE Lens

The real, standard workaround (what this project's own `viewport.ts`
now does, Lesson 38): stop asking the GPU to draw a *thick line
primitive* at all, and instead draw a thin **quad (two triangles) per
line segment**, generated in a vertex shader from the line's real
direction and a requested pixel width — Three.js's own `Line2`/
`LineMaterial`/`LineGeometry` (from its `examples/jsm/lines/` module) is
exactly this technique, pre-built. The line "width" becomes real
triangle geometry the GPU is completely happy to rasterize at any size,
because triangles were never subject to the `[1, 1]` line-specific
limitation in the first place.

## Connection

This project's own first real use is `cnc-web/src/viewport.ts`'s switch
from `THREE.Line`/`THREE.LineBasicMaterial` (Lesson 8) to `Line2`/
`LineMaterial`/`LineGeometry` (Lesson 38) specifically to get a real,
visible `linewidth: 3` on the toolpath — the plain `THREE.LineBasicMaterial`
this project used from Lesson 8 through Lesson 37 had a real `linewidth`
option too, silently ignored the entire time on the whatever GPU driver
was rendering it.

## Try It Yourself

1. Run the isolated example's `gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)`
   in your own browser's console and confirm what it reports.
2. Read Three.js's own `Line2`/`LineMaterial` source (or its official
   "Fat Lines" example) and identify where a line segment becomes two
   real triangles — look for how the vertex shader offsets each vertex
   perpendicular to the line's own direction by half the requested width.
3. Explain, in your own words, why `LineMaterial` needs to be told the
   renderer's real pixel `resolution` (`viewport.ts`'s own
   `resolution: new THREE.Vector2(...)`) when a plain `LineBasicMaterial`
   never did — what would a fat line look like if its width were computed
   in the wrong units entirely?
