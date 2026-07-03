// Canvas scene tutorials — two complete courses following the Lesson Contract.
// Each step has: content blocks (rendered as lesson), starterCode (loads in Monaco),
// and completeCode (revealed via "Show Answer").

// ── Shared starter shell ──────────────────────────────────────────────────────
// Every canvas scene starts with this shape. Steps build on each other.
const SHELL = `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // ── your drawing code goes here ──

  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`

// ── Content block types ───────────────────────────────────────────────────────
// build   — "What you will build" callout (green border)
// h3      — section heading
// p       — paragraph (supports **bold** inline)
// code    — code block (monospace, dark)
// walk    — line-by-line walkthrough (indented, lighter)
// cs      — CS concept box (blue border)
// se      — SE principle box (purple border)
// breaks  — "What breaks without this" box (red border)
// note    — tip/note (amber border)

export const TUTORIALS = [
  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 1 — Canvas Fundamentals
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'canvas-fundamentals',
    title: 'Canvas Fundamentals',
    description: 'Build a responsive, dark-mode-aware animated scene from scratch. Every API introduced at the moment it first appears.',
    steps: [

      // ── Step 1 ─────────────────────────────────────────────────────────
      {
        id: 'drawing-on-a-surface',
        title: 'Drawing on a surface',
        content: [
          { type: 'build', text: 'By the end of this step you will see a dark background with the words "Hello, canvas" sitting exactly in the centre of the panel.' },

          { type: 'h3', text: 'What a canvas is' },
          { type: 'p', text: 'A `<canvas>` element is a rectangular pixel grid built into every modern browser. Unlike HTML — which describes structure — or SVG — which describes shapes as geometry — canvas is a **raster surface**: you issue drawing commands in JavaScript and they paint pixels immediately. Nothing redraws itself; you are always in control.' },
          { type: 'p', text: 'The pixel grid has its origin at the **top-left corner**. The x axis increases rightward; the y axis increases downward. A point at (0, 0) is the top-left pixel. A point at (width, height) is the bottom-right. This differs from mathematical convention (y upward) because screens historically drew one scan line at a time from top to bottom.' },

          { type: 'h3', text: 'Getting the drawing context' },
          { type: 'code', text: `const ctx = canvas.getContext('2d')` },
          { type: 'walk', text: '`canvas.getContext(\'2d\')` asks the browser to attach a **Canvas 2D rendering context** to this element and return it. The string `\'2d\'` selects the flat drawing API; there is also `\'webgl\'` for 3D graphics. The returned object `ctx` is your drawing tool — every command you will ever issue in this course goes through it. Think of `ctx` as the pen; `canvas` is just the sheet of paper.' },

          { type: 'h3', text: 'Painting a background' },
          { type: 'code', text: `ctx.fillStyle = '#0f172a'\nctx.fillRect(0, 0, canvas.width, canvas.height)` },
          { type: 'walk', text: '`ctx.fillStyle` sets the active fill colour. Any CSS colour works: named colours (`\'red\'`), hex values (`\'#0f172a\'`), or rgba (`\'rgba(255,0,0,0.5)\'`). Setting it is like choosing a paint colour — it applies to everything drawn after this line until you change it.\n\n`ctx.fillRect(x, y, width, height)` draws a solid rectangle. We pass (0, 0, canvas.width, canvas.height) to paint every pixel of the canvas. Without this step, the canvas defaults to transparent — whatever is behind it shows through.' },

          { type: 'h3', text: 'Drawing centred text' },
          { type: 'code', text: `ctx.fillStyle = '#e2e8f0'\nctx.font = 'bold 24px system-ui'\nctx.textAlign = 'center'\nctx.textBaseline = 'middle'\nctx.fillText('Hello, canvas', canvas.width / 2, canvas.height / 2)` },
          { type: 'walk', text: '`ctx.font` accepts any CSS font string: weight, size, then family. `system-ui` uses whatever the operating system\'s default UI font is — sharp on every platform.\n\n`ctx.textAlign = \'center\'` means the x coordinate you pass to fillText is the **horizontal centre** of the text, not the left edge. Without this, text would be left-aligned at x = canvas.width / 2, placing only its left edge in the middle.\n\n`ctx.textBaseline = \'middle\'` means the y coordinate is the **vertical midpoint** of the text. The default baseline is `\'alphabetic\'` — the bottom of capital letters — which would draw text slightly above where you intended.\n\nWith both set to centre/middle, passing `(canvas.width / 2, canvas.height / 2)` puts the text exactly in the centre of the canvas.' },

          { type: 'cs', text: '**Imperative drawing model.** Canvas uses an imperative API: you issue commands in order and they execute immediately. This is the opposite of React\'s declarative model (describe the desired state; the framework figures out the DOM updates). The imperative model gives you pixel-level control but requires you to manually repaint whenever anything changes — the canvas never updates itself.' },
          { type: 'se', text: '**Context as single responsibility.** The `<canvas>` element is just the pixel surface — a container. All drawing goes through `ctx`. This separation means React owns the element (sizing, lifecycle, ref) while you own the rendering. Each object has one job. This is the Single Responsibility Principle: one object, one clearly-named concern.' },
          { type: 'breaks', text: '**Forgotten background → transparent canvas.** If you skip `ctx.fillRect` for the background, the canvas is transparent. On a dark page this looks fine at first — the dark page background shows through. But the moment you add animation and start clearing between frames with `ctx.clearRect`, the cleared area becomes transparent and page content bleeds through on every frame. Always paint a solid background first.' },

          { type: 'note', text: 'Type the code below into the editor (or paste it), then press **⌘S** to see it run. You should see "Hello, canvas" centred on a dark background.' },
        ],
        starterCode: SHELL,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Paint a solid background so nothing bleeds through
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw centred text using both alignment properties
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', canvas.width / 2, canvas.height / 2)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 2 ─────────────────────────────────────────────────────────
      {
        id: 'responsive-sizing',
        title: 'Responsive sizing',
        content: [
          { type: 'build', text: 'Your text currently uses a hardcoded position — resize the panel and it drifts off-centre. This step fixes that with a ResizeObserver and the devicePixelRatio pattern, so the scene stays centred and sharp at any size.' },

          { type: 'h3', text: 'The problem with canvas.width' },
          { type: 'p', text: 'In step 1 we wrote `canvas.width / 2` to find the centre. But `canvas.width` is the canvas\'s **pixel buffer size** — the number of actual pixels it was given when it loaded. If you resize the panel, the CSS makes the canvas element stretch, but the pixel buffer stays the same size. Text drawn at position (canvas.width / 2) is no longer in the visual centre.' },
          { type: 'p', text: 'The fix: every time the canvas element changes size, recalculate its pixel buffer and update our local `w` and `h` variables. We also use these `w` and `h` values for all drawing — never `canvas.width` or `canvas.height` again.' },

          { type: 'h3', text: 'devicePixelRatio — why we multiply the buffer' },
          { type: 'code', text: `const dpr = window.devicePixelRatio || 1\ncanvas.width  = w * dpr\ncanvas.height = h * dpr\nctx.scale(dpr, dpr)` },
          { type: 'walk', text: '`window.devicePixelRatio` is a number that tells you how many physical screen pixels represent one CSS pixel. On a normal screen it is 1 (one physical pixel per CSS pixel). On a Retina / HiDPI display it is 2 — four physical pixels form a 2×2 grid to display one CSS pixel.\n\nIf you do not account for this, the canvas pixel buffer is too small for the physical screen: the browser stretches it and text looks blurry. Multiplying the buffer size by `dpr` gives the canvas enough pixels to fill every physical pixel on the screen.\n\nAfter multiplying the buffer, we call `ctx.scale(dpr, dpr)`. This scales every coordinate you pass in by `dpr`, so you can still write coordinates in CSS pixels (as if `dpr` were 1). You never have to think about DPR in your drawing code — `ctx.scale` handles it.' },

          { type: 'h3', text: 'ResizeObserver — reacting to size changes' },
          { type: 'code', text: `function resize() {\n  const dpr = window.devicePixelRatio || 1\n  const rect = canvas.parentElement.getBoundingClientRect()\n  w = rect.width\n  h = rect.height\n  canvas.width  = w * dpr\n  canvas.height = h * dpr\n  ctx.scale(dpr, dpr)\n}\n\nconst resizeObserver = new ResizeObserver(resize)\nresizeObserver.observe(canvas.parentElement)\nresize()` },
          { type: 'walk', text: '`ResizeObserver` is a browser API that calls a callback whenever the observed element changes its layout size. We observe `canvas.parentElement` — the div that wraps the canvas — because that is the element whose size the CSS controls. When the panel is resized, `resize()` fires, recalculates `w` and `h`, and resizes the canvas buffer.\n\n`canvas.parentElement.getBoundingClientRect()` returns the element\'s size in CSS pixels as it appears on screen right now. `.width` and `.height` are the values we use for all drawing.\n\nThe last line calls `resize()` immediately — before any drawing — to set `w` and `h` for the very first render. Without this, `w` and `h` are undefined and nothing draws.' },

          { type: 'h3', text: 'Drawing with w and h' },
          { type: 'code', text: `ctx.fillText('Hello, canvas', w / 2, h / 2)` },
          { type: 'walk', text: 'Now that `w` and `h` are always current, every position in your drawing code uses them. `w / 2` is always the horizontal centre; `h / 2` is always the vertical centre. Resize the panel and the text stays centred — no special case handling needed.' },

          { type: 'h3', text: 'Cleanup — disconnecting the observer' },
          { type: 'code', text: `return () => resizeObserver.disconnect()` },
          { type: 'walk', text: 'React calls the function returned from `useEffect` when the component unmounts (leaves the screen). `resizeObserver.disconnect()` stops the observer. Without this, the observer keeps holding a reference to the canvas element after React has removed it from the DOM, causing a memory leak.' },

          { type: 'cs', text: '**Observer pattern.** `ResizeObserver` is an implementation of the observer (pub/sub) pattern: the canvas registers itself as a subscriber; the browser is the publisher; size-change events are the messages. You never poll "has the size changed?" — the browser tells you when it does. This is more efficient and less error-prone than checking on every animation frame.' },
          { type: 'se', text: '**Separate resize from draw.** We keep resize logic in its own function rather than mixing it into the draw loop. Resize fires rarely (user drags the panel). Drawing fires 60 times per second. Mixing them would make the draw loop responsible for two distinct jobs — a violation of Single Responsibility.' },
          { type: 'breaks', text: '**Skipping `ctx.scale(dpr, dpr)` → blurry text on Retina.** On a MacBook with a Retina display, `devicePixelRatio` is 2. If you resize the canvas buffer but do not scale, your drawing coordinates are in buffer pixels rather than CSS pixels. Everything you draw appears at half the intended size. The text "Hello, canvas" would appear in the top-left quarter of the canvas instead of the centre.' },

          { type: 'note', text: 'Update your editor code with the resize pattern, then press **⌘S**. Try making the preview panel wider and narrower — the text should stay centred.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    // TODO: add a resize() function that sets w, h, canvas.width/height, and ctx.scale
    // TODO: create a ResizeObserver that calls resize() when the parent div changes size
    // TODO: call resize() once immediately before drawing

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)

    // TODO: return cleanup that disconnects the observer
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)

    return () => resizeObserver.disconnect()
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 3 ─────────────────────────────────────────────────────────
      {
        id: 'dark-mode',
        title: 'Dark mode and the animation loop',
        content: [
          { type: 'build', text: 'This step adds two things: colours that respond to the user\'s dark/light mode preference, and an animation loop that redraws the scene 60 times per second. By the end, your text will gently pulse in and out.' },

          { type: 'h3', text: 'Reading the current theme' },
          { type: 'code', text: `const dark = document.documentElement.classList.contains('dark')` },
          { type: 'walk', text: 'This app toggles a class called `\'dark\'` on the root `<html>` element when the user switches themes. `document.documentElement` is that `<html>` element. `.classList.contains(\'dark\')` returns `true` if the class is present. We check this on every draw call — not just once — so the scene updates immediately when the user toggles the theme without needing to reload.' },
          { type: 'code', text: `ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'\nctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'` },
          { type: 'walk', text: 'The ternary operator `condition ? valueIfTrue : valueIfFalse` chooses between two values. `\'#0f172a\'` is a very dark navy (dark mode background); `\'#f8fafc\'` is an off-white (light mode background). By using these pairs consistently across all scenes, every scene in the app looks coherent in both themes.' },

          { type: 'h3', text: 'requestAnimationFrame — the animation loop' },
          { type: 'code', text: `let animationFrameId\n\nfunction draw(timestamp) {\n  // ... draw here ...\n  animationFrameId = requestAnimationFrame(draw)\n}\n\nanimationFrameId = requestAnimationFrame(draw)\nreturn () => cancelAnimationFrame(animationFrameId)` },
          { type: 'walk', text: '`requestAnimationFrame(callback)` is a browser API that schedules `callback` to run just before the next screen repaint — typically 60 times per second on a 60Hz display. The browser decides the exact timing, aligning redraws with display refresh cycles to prevent tearing.\n\nThe `timestamp` parameter is the time in milliseconds since the page loaded. We use it to drive animation: compute elapsed time, compute a phase from it, draw based on that phase.\n\nThe loop is self-scheduling: at the end of each `draw` call, we schedule the next one with `requestAnimationFrame(draw)`. We store the returned ID so we can cancel it on cleanup.\n\n`cancelAnimationFrame(animationFrameId)` stops the loop when the component unmounts. Without it, the loop continues running after React has removed the canvas from the DOM — trying to draw to a detached element.' },

          { type: 'h3', text: 'Driving animation with the timestamp' },
          { type: 'code', text: `let startTime\n\nfunction draw(timestamp) {\n  if (!startTime) startTime = timestamp\n  const elapsed = timestamp - startTime      // ms since first draw\n  const phase = Math.sin(elapsed / 600)     // oscillates -1 to 1\n  const opacity = 0.6 + 0.4 * phase         // oscillates 0.2 to 1.0\n\n  // ... draw text at this opacity ...\n  animationFrameId = requestAnimationFrame(draw)\n}` },
          { type: 'walk', text: 'We subtract `startTime` from `timestamp` to get milliseconds elapsed since the first frame. This makes the animation start at zero on every mount, regardless of when on the timeline the component appears.\n\n`Math.sin(elapsed / 600)` produces a smooth wave between -1 and 1. Dividing `elapsed` by 600 controls the speed: 600ms per radian, or about 3.77 seconds for a full cycle (2π radians). Increase the divisor to slow the pulse; decrease it to speed it up.\n\n`0.6 + 0.4 * phase` maps the -1 to 1 range onto 0.2 to 1.0 — a more visible range for text opacity. The general formula `mid + amplitude * wave` lets you control both the centre point and the swing around it.\n\nTo draw text at a specific opacity, use `ctx.globalAlpha`:\n```\nctx.globalAlpha = opacity\nctx.fillText(...)\nctx.globalAlpha = 1  // always reset to 1 after\n```\nLeaving `globalAlpha` at a non-1 value means every subsequent drawing operation inherits that opacity — a common source of subtle bugs.' },

          { type: 'cs', text: '**Time-based animation vs frame-count-based animation.** Older animation code counts frames and updates on each frame. `requestAnimationFrame` does not guarantee exactly 60fps — it matches whatever the display runs at (60, 90, 120, 144Hz). Frame-count code runs faster on a 144Hz display than on a 60Hz display. Time-based animation (using the timestamp) runs at the same speed regardless of display refresh rate.' },
          { type: 'se', text: '**The animation loop as a pure function of time.** Every `draw(timestamp)` call produces a complete frame from scratch. It clears, recalculates, repaints — no incremental mutation. This means any bug produces a wrong frame that immediately repaints to the correct one. Contrast this with code that mutates state every frame: a bug produces a wrong state that all future frames inherit.' },
          { type: 'breaks', text: '**Forgetting `cancelAnimationFrame` → ghost loops.** If you never cancel the loop, it keeps running after the component unmounts. In React StrictMode (development), React mounts, unmounts, and remounts every component to test for cleanup bugs. Without cancellation, you get two loops running simultaneously — both trying to draw to the same canvas, producing flickering. In production, unmounting during navigation leaves a loop running in the background forever.' },

          { type: 'note', text: 'Update your code with the full animation loop and dark-mode colours. Press **⌘S** to see the pulsing text. Toggle dark mode in the app and watch the colours change live.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()

    // TODO: add animation loop with requestAnimationFrame
    // TODO: use dark mode: document.documentElement.classList.contains('dark')
    // TODO: pulse text opacity using Math.sin(elapsed / 600)
    // TODO: return cleanup cancelling both loop and observer

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)

    return () => resizeObserver.disconnect()
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      // Clear and repaint background on every frame
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // Pulse opacity between 0.2 and 1.0
      const phase = Math.sin(elapsed / 600)
      const opacity = 0.6 + 0.4 * phase
      ctx.globalAlpha = opacity

      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Hello, canvas', w / 2, h / 2)

      ctx.globalAlpha = 1   // always reset after partial-opacity drawing

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
    animationFrameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 4 ─────────────────────────────────────────────────────────
      {
        id: 'proportional-geometry',
        title: 'Proportional geometry',
        content: [
          { type: 'build', text: 'You will add a coloured circle that stays correctly sized and centred at any canvas dimension. This step introduces the rule that eliminates every layout bug you will encounter in canvas scenes.' },

          { type: 'h3', text: 'The fixed-pixel trap' },
          { type: 'p', text: 'It is tempting to write `ctx.arc(400, 200, 60, 0, Math.PI * 2)` — circle at x=400, y=200, radius=60. This works exactly once, when the canvas happens to be 800×400. At any other size, the circle is in the wrong place or the wrong size. Most canvas overlap bugs come from fixed-pixel positions that made sense during development but break at other sizes.' },

          { type: 'h3', text: 'The proportional rule' },
          { type: 'code', text: `// Sizes derived from w and h — never fixed pixels\nconst circleRadius = Math.min(w * 0.12, 60)  // at most 60px, scales below that\nconst circleX = w / 2\nconst circleY = h * 0.4                       // 40% down from the top` },
          { type: 'walk', text: 'Every position and size is expressed as a **fraction of w or h**. `w * 0.12` means "12% of the canvas width." This scales correctly whether the canvas is 200px or 2000px wide.\n\n`Math.min(w * 0.12, 60)` caps the radius at 60px on large canvases so the circle does not grow absurdly large, while still scaling down on small canvases. The pattern `Math.min(proportion * dimension, maxPixels)` appears in every scene in this codebase — proportional by default, capped at a maximum.\n\nPositions follow the same rule: `h * 0.4` places the circle 40% of the way down the canvas. This always reads as a layout decision rather than an arbitrary pixel.' },

          { type: 'h3', text: 'Drawing a filled circle' },
          { type: 'code', text: `ctx.beginPath()\nctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)\nctx.fillStyle = dark ? '#6366f1' : '#4f46e5'  // indigo\nctx.fill()` },
          { type: 'walk', text: '`ctx.beginPath()` starts a new **path** — a sequence of drawing instructions that are collected but not yet drawn. Every shape you draw in canvas starts with `beginPath()`. Without it, the new arc is appended to any previous path, causing unexpected shapes to be drawn together.\n\n`ctx.arc(x, y, radius, startAngle, endAngle)` traces a circular arc centred at (x, y). Angles are in radians. `0` is the rightmost point (3 o\'clock); `Math.PI * 2` (≈6.28) is a full circle back to the start.\n\n`ctx.fill()` paints the interior of the path with the current `fillStyle`. No outline — just solid colour. `ctx.stroke()` would draw only the outline using `strokeStyle` and `lineWidth`.' },

          { type: 'h3', text: 'Spacing text below the circle' },
          { type: 'code', text: `const labelY = circleY + circleRadius + h * 0.06\nctx.fillText('proportional', w / 2, labelY)` },
          { type: 'walk', text: 'To place a label below the circle, start from the circle\'s centre (`circleY`), add the radius to reach the bottom edge, then add a proportional gap (`h * 0.06`). This produces a gap that scales with the canvas height. A fixed gap like `+ 20` would be too small on large canvases and too large on small ones.' },

          { type: 'cs', text: '**Coordinate space thinking.** Canvas drawing requires you to build a mental model of a 2D coordinate space. Every element has a position (x, y) and size in that space. Proportional sizing keeps all elements in the same ratio relative to the container — the same spatial relationship holds at any scale. This is analogous to using percentages in CSS rather than fixed pixel values.' },
          { type: 'se', text: '**The `Math.min(proportion, cap)` pattern as a design contract.** Using `Math.min(w * 0.12, 60)` embeds two decisions in one line: the element is 12% of width by default, and no larger than 60px in absolute terms. When you read this line later, you immediately understand both the proportional intent and the upper bound. Compare to a bare `60` — the proportionality is invisible and the intent is opaque.' },
          { type: 'breaks', text: '**Fixed vertical spacing → text overlap at small sizes.** If you write `labelY = circleY + circleRadius + 20`, the 20px gap is fine at h=400 but will cause overlap at h=200 (because the circle itself might be 48px radius and 20px barely clears it). At h=100 the label overlaps the circle entirely. Always derive gaps from `h * someSmallFraction`.' },

          { type: 'note', text: 'Add a circle to your scene with proportional sizing. Press **⌘S** to see it. Try toggling dark mode — the circle should switch between light and dark indigo.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // TODO: add a circle using Math.min(w * 0.12, 60) for the radius
      // TODO: place a label below the circle using proportional spacing

      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('Hello, canvas', w / 2, h * 0.75)

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
    animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // Circle — proportional radius, capped at 60px
      const circleRadius = Math.min(w * 0.12, 60)
      const circleX = w / 2
      const circleY = h * 0.4

      ctx.beginPath()
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.fill()

      // Label below the circle with proportional gap
      const labelY = circleY + circleRadius + h * 0.06
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.font = \`bold \${Math.round(h * 0.05)}px system-ui\`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('proportional', w / 2, labelY)

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
    animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 2 — Boxes and Arrows
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'boxes-and-arrows',
    title: 'Boxes and Arrows',
    description: 'Build the box-label-arrow pattern used in every logic and function scene. Fix overlapping text by understanding exactly how vertical space is divided.',
    steps: [

      // ── Step 1 ─────────────────────────────────────────────────────────
      {
        id: 'a-single-box',
        title: 'A single rounded box',
        content: [
          { type: 'build', text: 'A single coloured rounded rectangle, centred on the canvas, with a proportional size. This is the primitive that appears in every logic, function, and set theory scene.' },

          { type: 'h3', text: 'Paths and shapes' },
          { type: 'p', text: 'In step 1 of the fundamentals tutorial we used `ctx.arc` to trace a circle. All canvas shapes — lines, rectangles, arcs, curves — are built from **paths**: sequences of drawing commands collected without painting until you call `fill()` or `stroke()`.' },
          { type: 'code', text: `ctx.beginPath()\nctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, cornerRadius)\nctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'\nctx.fill()\nctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'\nctx.lineWidth = 2.5\nctx.stroke()` },
          { type: 'walk', text: '`ctx.roundRect(x, y, width, height, radii)` draws a rectangle with rounded corners. `x` and `y` are the **top-left corner** — not the centre. `radii` can be a single number (same radius on all corners) or an array of four values (top-left, top-right, bottom-right, bottom-left).\n\nCalling both `fill()` and `stroke()` draws the interior colour first, then the outline on top. The order matters: if you stroked first, the fill would paint over half the stroke width.\n\n`ctx.lineWidth = 2.5` sets the stroke width in CSS pixels. At `devicePixelRatio = 2`, this is 5 physical pixels — visible without being chunky.' },

          { type: 'h3', text: 'Positioning a box at the centre' },
          { type: 'code', text: `const boxWidth  = Math.min(w * 0.35, 160)\nconst boxHeight = Math.min(h * 0.35, 120)\nconst boxLeft   = w / 2 - boxWidth  / 2  // shift left by half the width\nconst boxTop    = h / 2 - boxHeight / 2  // shift up   by half the height` },
          { type: 'walk', text: 'Canvas coordinates describe the **top-left corner** of a rectangle. To centre a rectangle at (cx, cy), subtract half its width to get the left edge, and half its height to get the top edge. This is the standard formula for centring any axis-aligned box in canvas.\n\nWith `boxLeft = cx - boxWidth / 2` and `boxTop = cy - boxHeight / 2`, the rectangle is centred at (cx, cy) regardless of size. When the proportional width changes, the left edge moves automatically — you never have to hand-calculate an offset.' },

          { type: 'cs', text: '**Path as a description, fill/stroke as execution.** `beginPath()` + shape commands build a description of what to draw. `fill()` and `stroke()` execute that description. This separation allows you to define complex paths — combining arcs, lines, and curves — and then decide how to render them (filled, stroked, or both) in a single call. It is the same principle as separating data from presentation.' },
          { type: 'se', text: '**Named geometry variables, not inline arithmetic.** We write `const boxLeft = cx - boxWidth / 2` on its own line with a name, rather than inlining `(w/2 - Math.min(w*0.35,160)/2)` inside `roundRect`. The named version reads as a layout decision; the inlined version reads as arithmetic. Six months later, "box centred horizontally" is immediately clear; the arithmetic requires reconstruction.' },
          { type: 'breaks', text: '**Not calling `beginPath()` → shapes join unintentionally.** If you draw a circle in one function call and then draw a rectangle without `beginPath()`, the rectangle is appended to the circle\'s path. When you call `fill()`, both shapes are filled as a single compound path. The result is a filled region that is the union of both shapes — often the wrong shape, with no obvious error message.' },

          { type: 'note', text: 'Try changing `boxWidth = Math.min(w * 0.5, 200)` in the Properties tab after pressing ⌘S. Watch the box grow without leaving the canvas.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // TODO: declare boxWidth and boxHeight using Math.min(proportion, cap)
      // TODO: compute boxLeft and boxTop to centre the box at (w/2, h/2)
      // TODO: draw the box with ctx.roundRect — fill first, then stroke

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2

      ctx.beginPath()
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'
      ctx.fill()
      ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.lineWidth = 2.5
      ctx.stroke()

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 2 ─────────────────────────────────────────────────────────
      {
        id: 'label-and-value',
        title: 'The label + value layout',
        content: [
          { type: 'build', text: 'A box divided into two zones: a letter label (P, Q, A…) in the top third, and a value (TRUE / FALSE) in the bottom third, separated by a divider line. This pattern is the same in every logic box in this app. Getting it right here fixes every overlapping-text bug at once.' },

          { type: 'h3', text: 'Why text overlaps in boxes' },
          { type: 'p', text: 'The most common bug in canvas scenes is text drawn at positions like `y - 8` and `y + 10`, where y is the box centre. These fixed pixel offsets were chosen when the box was one size. At a different size the offsets still move by exactly 8 and 10 pixels — but the box is a different height, so the text is no longer in the zones it should be in. Fix: derive all vertical positions from the box height, not from fixed offsets.' },

          { type: 'h3', text: 'Dividing the box into thirds' },
          { type: 'code', text: `// cy is the vertical centre of the box\nconst cy = boxTop + boxHeight / 2\n\n// Label in the top third\nconst labelY = cy - boxHeight * 0.18\n\n// Divider line at 5% above centre\nconst dividerY = cy + boxHeight * 0.05\n\n// Value in the bottom third\nconst valueY = cy + boxHeight * 0.30` },
          { type: 'walk', text: '`cy = boxTop + boxHeight / 2` computes the vertical centre of the box. We use this as our reference point for everything inside the box.\n\n`labelY = cy - boxHeight * 0.18` moves the label **up** from centre by 18% of the box height. If the box is 100px tall, that is 18px above centre — solidly in the top third.\n\n`dividerY = cy + boxHeight * 0.05` places the divider just below centre — 5% of box height below. This gives the label slightly more space than the value, which is visually correct because labels (single letters) are typically smaller than value text.\n\n`valueY = cy + boxHeight * 0.30` moves the value **down** from centre by 30% of the box height — firmly in the bottom third.\n\nAll three positions are `boxHeight`-relative. If `boxHeight` doubles, all three positions move proportionally. Text never overlaps regardless of canvas size.' },

          { type: 'h3', text: 'Font sizes from box dimensions' },
          { type: 'code', text: `// Label font: 30% of box height (big, bold letter)\nctx.font = \`bold \${Math.round(boxHeight * 0.30)}px system-ui\`\nctx.fillText('P', cx, labelY)\n\n// Divider line\nctx.beginPath()\nctx.moveTo(boxLeft + 10, dividerY)\nctx.lineTo(boxLeft + boxWidth - 10, dividerY)\nctx.strokeStyle = accentColour + '66'  // 40% opacity\nctx.lineWidth = 1\nctx.stroke()\n\n// Value font: 22% of box height (slightly smaller)\nctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`\nctx.fillText('TRUE', cx, valueY)` },
          { type: 'walk', text: '`boxHeight * 0.30` as a font size means "30% of the box height." If the box is 120px tall, the label font is 36px — large enough to be clearly visible inside the box.\n\nThe divider is drawn from `boxLeft + 10` to `boxLeft + boxWidth - 10`, leaving a 10px margin on each side. We add `\'66\'` to the hex colour (two hex digits = 0.4 alpha) for a subtle separator that does not compete with the text.\n\nThe value uses a monospace font (`JetBrains Mono`) for the TRUE/FALSE text — this is a convention in logic scenes where the value represents a machine-like state rather than natural language. The label uses `system-ui` because it is just a letter name.' },

          { type: 'cs', text: '**Proportional coordinate systems.** Expressing positions as fractions of dimensions (`cy - boxHeight * 0.18`) creates a local coordinate system within the box. This is the same principle as CSS `em` units (relative to the current font size) or flexbox proportional layout. The box becomes a self-contained layout context: change the box size and every interior element moves to its correct proportional position.' },
          { type: 'se', text: '**The pattern is the specification.** The `top-third / divider / bottom-third` layout is an explicit design decision. By encoding it as `cy - boxH * 0.18`, `cy + boxH * 0.05`, `cy + boxH * 0.30`, you have written the specification into the code. Any future developer who changes the box size will see that the interior positions track the box dimensions — no chance of accidentally leaving one zone behind.' },
          { type: 'breaks', text: '**Fixed offsets → guaranteed overlap at small heights.** If you write `labelY = cy - 8` and `valueY = cy + 10`, at `boxHeight = 30` the label is at 18px from the top and the value is at 20px from the top — a 2px difference. Both pieces of text are nearly the same font size. They overlap. The fixed-offset version is always one resize away from a layout collision.' },

          { type: 'note', text: 'Add the label and value to your box from the previous step. Use the exact multipliers from the code above. Press **⌘S** to see the layout. Toggle the ⊞ Grid to verify the text positions make sense relative to the box dimensions.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2
      const cx = w / 2
      const cy = boxTop + boxHeight / 2

      const accentColour = dark ? '#818cf8' : '#4f46e5'

      ctx.beginPath()
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'
      ctx.fill()
      ctx.strokeStyle = accentColour
      ctx.lineWidth = 2.5
      ctx.stroke()

      // TODO: draw 'P' label in the top third   (cy - boxHeight * 0.18)
      // TODO: draw a divider line across the box (cy + boxHeight * 0.05)
      // TODO: draw 'TRUE' in the bottom third    (cy + boxHeight * 0.30)
      // Use boxHeight * 0.30 for label font size, boxHeight * 0.22 for value font size

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2
      const cx = w / 2
      const cy = boxTop + boxHeight / 2

      const accentColour = dark ? '#818cf8' : '#4f46e5'

      // Box shell
      ctx.beginPath()
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'
      ctx.fill()
      ctx.strokeStyle = accentColour
      ctx.lineWidth = 2.5
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = accentColour

      // Label — top third
      ctx.font = \`bold \${Math.round(boxHeight * 0.30)}px system-ui\`
      ctx.fillText('P', cx, cy - boxHeight * 0.18)

      // Divider line
      ctx.beginPath()
      ctx.moveTo(boxLeft + 10, cy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 10, cy + boxHeight * 0.05)
      ctx.strokeStyle = accentColour + '66'
      ctx.lineWidth = 1
      ctx.stroke()

      // Value — bottom third
      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillStyle = accentColour
      ctx.fillText('TRUE', cx, cy + boxHeight * 0.30)

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 3 ─────────────────────────────────────────────────────────
      {
        id: 'two-boxes-with-arrow',
        title: 'Two boxes connected by an arrow',
        content: [
          { type: 'build', text: 'Two boxes (P and Q) sitting side by side, connected by a horizontal arrow. This is the P → Q structure that appears in every implication and function composition scene.' },

          { type: 'h3', text: 'Laying out two boxes horizontally' },
          { type: 'code', text: `const boxWidth  = Math.min(w * 0.22, 100)\nconst boxHeight = Math.min(h * 0.26, 90)\nconst arrowGap  = Math.min(w * 0.08, 40)   // space between boxes\nconst totalWidth = boxWidth * 2 + arrowGap\nconst startX = w / 2 - totalWidth / 2       // left edge of layout\n\nconst pBoxLeft = startX\nconst qBoxLeft = startX + boxWidth + arrowGap` },
          { type: 'walk', text: 'We compute the total layout width (`boxWidth * 2 + arrowGap`) and then offset left by half of it from the canvas centre. This centres the whole layout — both boxes and the arrow — horizontally on the canvas regardless of box size.\n\n`pBoxLeft` is the left edge of the P box. `qBoxLeft` is `pBoxLeft + boxWidth + arrowGap` — it starts immediately after the P box plus the gap. If you add more boxes, continue the pattern: each box\'s left edge is the previous box\'s left edge plus one box width plus one gap.' },

          { type: 'h3', text: 'Drawing the arrow' },
          { type: 'code', text: `const arrowStartX = pBoxLeft + boxWidth + 4   // just right of P box\nconst arrowEndX   = qBoxLeft - 4             // just left of Q box\nconst arrowY      = boxCentreY               // same height as box centres\nconst arrowTip    = 12                        // arrowhead length in px\n\n// Shaft\nctx.beginPath()\nctx.moveTo(arrowStartX, arrowY)\nctx.lineTo(arrowEndX - arrowTip, arrowY)\nctx.strokeStyle = accentColour\nctx.lineWidth = 2.5\nctx.stroke()\n\n// Arrowhead (filled triangle)\nctx.beginPath()\nctx.moveTo(arrowEndX, arrowY)                 // tip\nctx.lineTo(arrowEndX - arrowTip, arrowY - 6) // upper wing\nctx.lineTo(arrowEndX - arrowTip, arrowY + 6) // lower wing\nctx.closePath()\nctx.fillStyle = accentColour\nctx.fill()` },
          { type: 'walk', text: '`ctx.moveTo(x, y)` lifts the pen to a position without drawing. `ctx.lineTo(x, y)` draws a line from the current position to the new point.\n\nThe arrow shaft ends at `arrowEndX - arrowTip` rather than `arrowEndX` so that the shaft does not protrude through the arrowhead. The arrowhead is drawn as a separate filled triangle whose tip is at `arrowEndX`.\n\nThe arrowhead wings use fixed pixel offsets (`± 6`) for their vertical spread. For a horizontal arrow this is fine — the wings are always 6px above and below the arrow line. For arrows at arbitrary angles you would use `Math.atan2` to compute the wing positions, as shown in the Guide tab.' },

          { type: 'h3', text: 'Cycling between values to animate the scene' },
          { type: 'code', text: `const ROWS = [\n  { p: true,  q: true,  result: true  },\n  { p: true,  q: false, result: false },\n  { p: false, q: true,  result: true  },\n  { p: false, q: false, result: true  },\n]\nconst PERIOD = 2200  // ms per row\n\nfunction draw(timestamp) {\n  if (!startTime) startTime = timestamp\n  const elapsed = timestamp - startTime\n  const rowIndex = Math.floor(elapsed / PERIOD) % ROWS.length\n  const { p, q, result } = ROWS[rowIndex]\n  // use p, q, result to colour the boxes and arrow\n}` },
          { type: 'walk', text: '`Math.floor(elapsed / PERIOD)` counts how many complete periods have elapsed — 0 in the first 2.2s, 1 in the next 2.2s, and so on. `% ROWS.length` wraps the count back to 0 after the last row, producing an infinite cycle.\n\nDestructuring `{ p, q, result }` from the current row unpacks three boolean values in one line. We use them to colour the P box (green if true, red if false), the Q box, and the arrow.\n\nThis pattern — a fixed array of states, a period, and a modulo index — appears in nearly every multi-state animation in this codebase. Learn this once and you can build any cycling scene.' },

          { type: 'cs', text: '**Finite state machine.** The four rows are the four states of a two-input logic gate. `Math.floor(elapsed / PERIOD) % 4` is a simple time-driven state machine: time advances the state; the modulo cycles it. Every scene that shows "all cases" of a binary relation uses this pattern.' },
          { type: 'se', text: '**Separating layout from values.** The `ROWS` array holds what to display (the data). The drawing code holds how to display it (the rendering). Changing the sequence of states means editing `ROWS`, not the drawing code. This separation — data from presentation — makes both sides easier to change independently.' },
          { type: 'breaks', text: '**Arrow shaft overlapping arrowhead → double line.** If you draw the shaft all the way to `arrowEndX` rather than stopping at `arrowEndX - arrowTip`, the shaft extends through the arrowhead and visually protrudes past the triangle. The result looks like a line with a blunt triangle glued to the end. Always stop the shaft short by the arrowhead length.' },

          { type: 'note', text: 'This is the complete pattern for building logic scenes. Add cycling to your scene so the boxes change colour with each state. Your finished scene should look similar to the ImplicationScene already in the library.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

const ROWS = [
  { p: true,  q: true  },
  { p: true,  q: false },
  { p: false, q: true  },
  { p: false, q: false },
]
const PERIOD = 2200

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')
      const rowIndex = Math.floor(elapsed / PERIOD) % ROWS.length
      const { p, q } = ROWS[rowIndex]

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // TODO: lay out two boxes using totalWidth centred at w/2
      // TODO: draw each box with the label + value pattern from step 2
      //       use p and q booleans to set green (true) or red (false) colours
      // TODO: draw a horizontal arrow between them
      //       colour it based on whether p implies q (p → q is false only when p=T, q=F)

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

const ROWS = [
  { p: true,  q: true,  result: true  },
  { p: true,  q: false, result: false },
  { p: false, q: true,  result: true  },
  { p: false, q: false, result: true  },
]
const PERIOD = 2200

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animationFrameId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(boxLeft, cy, boxWidth, boxHeight, label, isTrue, dark) {
      const colour = isTrue
        ? (dark ? '#22c55e' : '#16a34a')
        : (dark ? '#ef4444' : '#dc2626')
      const bg = isTrue
        ? (dark ? '#14532d44' : '#dcfce7')
        : (dark ? '#450a0a44' : '#fee2e2')

      ctx.beginPath()
      ctx.roundRect(boxLeft, cy - boxHeight / 2, boxWidth, boxHeight, 10)
      ctx.fillStyle = bg; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = colour

      ctx.font = \`bold \${Math.round(boxHeight * 0.30)}px system-ui\`
      ctx.fillText(label, boxLeft + boxWidth / 2, cy - boxHeight * 0.18)

      ctx.beginPath()
      ctx.moveTo(boxLeft + 8,  cy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, cy + boxHeight * 0.05)
      ctx.strokeStyle = colour + '55'; ctx.lineWidth = 1; ctx.stroke()

      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', boxLeft + boxWidth / 2, cy + boxHeight * 0.30)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')
      const { p, q, result } = ROWS[Math.floor(elapsed / PERIOD) % ROWS.length]

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.22, 100)
      const boxHeight = Math.min(h * 0.26, 90)
      const arrowGap  = Math.min(w * 0.08, 40)
      const totalWidth = boxWidth * 2 + arrowGap
      const startX = w / 2 - totalWidth / 2
      const cy = h * 0.42

      drawBox(startX, cy, boxWidth, boxHeight, 'P', p, dark)
      drawBox(startX + boxWidth + arrowGap, cy, boxWidth, boxHeight, 'Q', q, dark)

      // Horizontal arrow between the boxes
      const arrowColour = result
        ? (dark ? '#22c55e' : '#16a34a')
        : (dark ? '#ef4444' : '#dc2626')
      const arrowStartX = startX + boxWidth + 4
      const arrowEndX   = startX + boxWidth + arrowGap - 4
      const arrowTip    = 12
      ctx.strokeStyle = arrowColour; ctx.lineWidth = 2.5
      ctx.setLineDash(result ? [] : [7, 4])
      ctx.beginPath()
      ctx.moveTo(arrowStartX, cy)
      ctx.lineTo(arrowEndX - arrowTip, cy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(arrowEndX, cy)
      ctx.lineTo(arrowEndX - arrowTip, cy - 6)
      ctx.lineTo(arrowEndX - arrowTip, cy + 6)
      ctx.closePath()
      ctx.fillStyle = arrowColour; ctx.fill()

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },
]
