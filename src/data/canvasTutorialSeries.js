// Four guided tutorial series — full scenes built step by step from scratch.
// No experience required. Each series teaches a distinct set of canvas skills.
// Follows the Lesson Contract at src/docs/LESSON_CONTRACT.md.

export const SERIES = [

  // ═══════════════════════════════════════════════════════════════════════════
  // TUTORIAL 1 — Analog Clock
  // Skills: ctx.save/restore, ctx.translate/rotate, trigonometry, Date object
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'analog-clock',
    title: 'Analog Clock',
    description: 'Build a live analog clock from scratch — clock face, tick marks, three hands, and real time from the Date object. Teaches canvas transforms and trigonometry.',
    steps: [

      // ── Step 1 ──────────────────────────────────────────────────────────────
      {
        id: 'clock-face',
        title: 'The clock face',
        content: [
          { type: 'build', text: 'By the end of this step you will see a circular clock face centred on the canvas — a dark background with a lighter circle and a subtle glow. Nothing moves yet; we build the visible structure before connecting it to time.' },

          { type: 'h3', text: 'Why this order?' },
          { type: 'p', text: 'We build the face before the hands, and the hands before the live time. At every step you can press ⌘S and see exactly what you have built. This is the agile principle applied to learning: always have something running you can look at. Never build invisible infrastructure first.' },

          { type: 'h3', text: 'The canvas shell' },
          { type: 'code', text: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * devicePixelRatio
      canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // clock drawing goes here

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
    animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}` },
          { type: 'walk', text: 'This is the standard scene shell you will use for every animated canvas scene. `useRef` gives us direct access to the DOM element. `useEffect` with an empty dependency array runs once after the component mounts — this is where we set up drawing that lives outside React\'s render cycle. The `resize` function handles both devicePixelRatio (Retina sharpness) and ResizeObserver (responsive layout). The cleanup function cancels both the animation loop and the observer so they do not leak memory when the component unmounts.' },

          { type: 'h3', text: 'Drawing the clock face' },
          { type: 'code', text: `const clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40
const clockCentreX = canvasWidth  / 2
const clockCentreY = canvasHeight / 2

// Glow behind the face
ctx.beginPath()
ctx.arc(clockCentreX, clockCentreY, clockRadius + 4, 0, Math.PI * 2)
ctx.shadowColor = isDarkMode ? '#6366f1' : '#4f46e5'
ctx.shadowBlur = 24
ctx.fillStyle = 'transparent'
ctx.stroke()
ctx.shadowBlur = 0

// Face fill
ctx.beginPath()
ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'
ctx.fill()

// Face rim
ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'
ctx.lineWidth = 3
ctx.stroke()` },
          { type: 'walk', text: '`clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40` means "40% of whichever dimension is smaller." This keeps the clock circular at any canvas size — never clipped, never squashed. `ctx.arc(x, y, radius, startAngle, endAngle)` traces a circular arc. Angles are in radians; `0` to `Math.PI * 2` is a full circle. We draw the glow first (behind everything else), then the filled face, then the rim outline on top. `shadowBlur` must be reset to `0` immediately after the glow draw or every subsequent drawing call inherits the blur.' },

          { type: 'cs', text: '**Painter\'s algorithm.** Canvas draws in the order you issue commands. Later commands paint over earlier ones. We exploit this deliberately: glow first (background), fill second (covers glow interior), stroke third (sits on top of fill). This is the Painter\'s Algorithm — the same technique 3D renderers use to sort objects back-to-front before drawing.' },
          { type: 'se', text: '**Proportional sizing with a single source of truth.** `clockRadius` is computed once and used everywhere. Every element of the clock — tick marks, hands, numerals — will be derived from this single variable. If you change `0.40` to `0.35`, the entire clock shrinks proportionally with one edit. This is the Single Source of Truth principle.' },
          { type: 'breaks', text: '**Forgetting `ctx.shadowBlur = 0` makes everything glow.** Shadow state is global on the context. Set `shadowBlur = 24` and forget to reset it, and the tick marks, hands, and numerals all glow — producing a blurry mess within two frames.' },
          { type: 'note', text: 'Press ⌘S. You should see a circle centred on the canvas with a subtle glow around its rim. Resize the preview panel — the circle should stay centred and proportional.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * devicePixelRatio
      canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: compute clockRadius, clockCentreX, clockCentreY
      // TODO: draw a glowing circle for the face (fill + stroke)

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

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * devicePixelRatio
      canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const clockRadius  = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth  / 2
      const clockCentreY = canvasHeight / 2

      ctx.beginPath()
      ctx.arc(clockCentreX, clockCentreY, clockRadius + 4, 0, Math.PI * 2)
      ctx.shadowColor = isDarkMode ? '#6366f1' : '#4f46e5'
      ctx.shadowBlur  = 24
      ctx.strokeStyle = 'transparent'
      ctx.stroke()
      ctx.shadowBlur  = 0

      ctx.beginPath()
      ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'
      ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'
      ctx.lineWidth = 3
      ctx.stroke()

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

      // ── Step 2 ──────────────────────────────────────────────────────────────
      {
        id: 'tick-marks',
        title: 'Tick marks',
        content: [
          { type: 'build', text: 'Add 60 tick marks around the clock face — 12 longer marks for hours and 48 shorter marks for minutes. Each mark is drawn using canvas transforms so you always draw vertically and let the coordinate system do the rotation.' },

          { type: 'h3', text: 'Trigonometry: placing points on a circle' },
          { type: 'p', text: 'Every tick mark sits on the rim of the clock at a specific angle. To find the (x, y) position for a mark at angle θ (theta) on a circle of radius r centred at (cx, cy): `x = cx + r × cos(θ)` and `y = cy + r × sin(θ)`. This comes from the unit-circle definition: for any angle θ, the point on the unit circle is (cos θ, sin θ). Multiplying by radius scales it up; adding the centre shifts it to the right position.' },

          { type: 'h3', text: 'ctx.save and ctx.restore — the context stack' },
          { type: 'code', text: `for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
  const isHourMark  = tickIndex % 5 === 0
  const tickAngle   = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2

  const tickLength  = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
  const tickWidth   = isHourMark ? 2.5 : 1.2
  const tickColour  = isHourMark
    ? (isDarkMode ? '#e2e8f0' : '#1e293b')
    : (isDarkMode ? '#475569' : '#94a3b8')

  const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
  const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
  const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
  const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)

  ctx.beginPath()
  ctx.moveTo(outerX, outerY)
  ctx.lineTo(innerX, innerY)
  ctx.strokeStyle = tickColour
  ctx.lineWidth   = tickWidth
  ctx.stroke()
}` },
          { type: 'walk', text: '`tickIndex / 60 * Math.PI * 2` maps each tick (0–59) to an angle around the full circle (0 to 2π radians). Subtracting `Math.PI / 2` rotates the start point to the top (12 o\'clock) — without this, index 0 would be at 3 o\'clock because angles in canvas measure from the positive x-axis (rightward).\n\n`outerX / outerY` is the point on the rim. `innerX / innerY` is the point inset by `tickLength`. Drawing a line between them produces each tick mark. `tickIndex % 5 === 0` is true every 5th tick (indices 0, 5, 10... 55) — exactly 12 marks, one per hour.' },

          { type: 'cs', text: '**Modulo for cyclic patterns.** `tickIndex % 5 === 0` divides the 60-tick cycle into groups of 5. The modulo operator (`%`) returns the remainder of division — it is the standard tool for detecting periodic structure inside a sequence. Clock faces, progress bars, round-robin scheduling, and hash tables all rely on modulo arithmetic.' },
          { type: 'se', text: '**Data drives appearance.** Every tick\'s length, width, and colour is computed from `isHourMark` — a single boolean that captures the semantic distinction between hour and minute marks. There is no separate loop for hour marks and another for minute marks. One loop, one conditional — less code, impossible to get them out of sync.' },
          { type: 'breaks', text: '**Missing `Math.PI / 2` offset → clock starts at 3 o\'clock.** Canvas angles measure from the positive x-axis (rightward). Tick 0 without the offset appears at 3 o\'clock (right side). Subtracting `Math.PI / 2` (90°) rotates the starting point to 12 o\'clock (top). This is a one-line fix that most clock tutorials omit, which is why so many example clocks online have their numbers shifted 90 degrees.' },
          { type: 'note', text: 'Press ⌘S. You should see 12 bold hour marks and 48 finer minute marks around the face. The marks should be evenly spaced and the face should look like a real clock.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const clockRadius  = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2; const clockCentreY = canvasHeight / 2

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()

      // TODO: loop 60 ticks
      //   tickAngle = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
      //   isHourMark = tickIndex % 5 === 0
      //   compute outerX/Y and innerX/Y using cos/sin
      //   draw a line from outer to inner

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

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const clockRadius  = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2
      const clockCentreY = canvasHeight / 2

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()

      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle  = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2)                * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2)                * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength)   * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength)   * Math.sin(tickAngle)

        ctx.beginPath()
        ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth   = isHourMark ? 2.5 : 1.2
        ctx.stroke()
      }

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

      // ── Step 3 ──────────────────────────────────────────────────────────────
      {
        id: 'clock-hands',
        title: 'Three static hands',
        content: [
          { type: 'build', text: 'Add hour, minute, and second hands as lines radiating from the centre, positioned at fixed angles for now. You will learn the ctx.save / ctx.translate / ctx.rotate / ctx.restore pattern — the foundation of all transform-based drawing in canvas.' },

          { type: 'h3', text: 'The transform stack: save, translate, rotate, restore' },
          { type: 'p', text: 'By default, canvas coordinates have (0, 0) at the top-left. If we want to draw a clock hand "pointing at 2 o\'clock", we would need trigonometry to compute the end point. There is a simpler way: move the origin to the clock centre, rotate the coordinate system, draw the hand as a vertical line going upward, then undo all of that. This is the canvas transform pattern.' },
          { type: 'code', text: `function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
  ctx.save()                         // 1. snapshot the current transform state
  ctx.translate(centreX, centreY)    // 2. move origin to clock centre
  ctx.rotate(handAngle)              // 3. rotate the coordinate system

  ctx.beginPath()
  ctx.moveTo(0, handLength * 0.15)   // start slightly past centre (counterbalance)
  ctx.lineTo(0, -handLength)         // draw upward in the rotated system
  ctx.strokeStyle = handColour
  ctx.lineWidth   = handWidth
  ctx.lineCap     = 'round'
  ctx.stroke()

  ctx.restore()                      // 4. undo translate + rotate
}` },
          { type: 'walk', text: '`ctx.save()` pushes the current transformation matrix, fill style, stroke style, and all other context properties onto a stack. `ctx.translate(centreX, centreY)` moves the origin — after this call, coordinate (0, 0) points at the clock centre. `ctx.rotate(handAngle)` rotates the coordinate system by `handAngle` radians around the new origin. Now "upward" in our drawing is the direction the hand should point. We draw the hand as a vertical line: `moveTo(0, 0.15 × length)` slightly below centre (the counterbalance tail), `lineTo(0, -length)` upward. `ctx.restore()` pops the saved state — the origin and rotation return to what they were before `save()`. Without restore, every subsequent draw call would be in the wrong coordinate system.' },

          { type: 'h3', text: 'Converting a clock position to an angle' },
          { type: 'code', text: `// For now, hardcode the time to 10:10:30 so we can see all three hands
const fixedHours   = 10
const fixedMinutes = 10
const fixedSeconds = 30

// Angles in radians — subtract Math.PI/2 to start at 12 o'clock
const secondHandAngle = (fixedSeconds / 60)        * Math.PI * 2 - Math.PI / 2
const minuteHandAngle = (fixedMinutes / 60)        * Math.PI * 2 - Math.PI / 2
const hourHandAngle   = ((fixedHours % 12) / 12 + fixedMinutes / 720) * Math.PI * 2 - Math.PI / 2

drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3,   isDarkMode ? '#e2e8f0' : '#1e293b')
drawHand(clockCentreX, clockCentreY, hourHandAngle,   clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')` },
          { type: 'walk', text: '`fixedSeconds / 60 * 2π` maps seconds (0–59) to the full circle (0 to 2π). The hour angle adds `fixedMinutes / 720` — a full hour hand rotation takes 12 hours (720 minutes), so we add a fraction of the hour swept by elapsed minutes. This is why a real clock\'s hour hand moves smoothly rather than jumping on each hour. The `-Math.PI / 2` offset appears in every hand for the same reason as the tick marks: zero radians points right; we want zero to point up.' },

          { type: 'cs', text: '**Affine transforms as a coordinate system.** `translate + rotate` is an affine transformation — a linear mapping that preserves parallel lines and distances. By changing the coordinate system rather than computing rotated endpoints, we reduce the cognitive load from "where is this point in absolute space?" to "where is this point relative to the hand?" Real game engines, SVG, and CSS transforms use the same model.' },
          { type: 'se', text: '**Encapsulate repeated geometry in a function.** Three hands are drawn with three calls to `drawHand`. Without the function, you would repeat 10 lines of transform code three times — 30 lines where a bug in one hand means a bug to find and fix three times. The function is a contract: "given a centre, angle, length, width, and colour, draw a hand." Each call is readable English.' },
          { type: 'breaks', text: '**Forgetting `ctx.restore()` → all subsequent drawing is rotated.** Call `ctx.save()` then `ctx.rotate(hourAngle)` without a matching `ctx.restore()`, and every tick mark drawn after the first hand call is also rotated by `hourAngle`. The clock face appears to rotate. Always match every `save()` with exactly one `restore()`.' },
          { type: 'note', text: 'Press ⌘S. You should see three hands: a thin red second hand, a medium minute hand, and a thick hour hand. They should show approximately 10:10:30.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    // TODO: write drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour)
    //   ctx.save() → ctx.translate(cx, cy) → ctx.rotate(angle) → draw line → ctx.restore()

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const clockRadius  = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2
      const clockCentreY = canvasHeight / 2

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()

      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle  = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }

      // TODO: hardcode time to 10:10:30
      // TODO: compute secondHandAngle, minuteHandAngle, hourHandAngle
      // TODO: call drawHand three times for second, minute, hour

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

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
      ctx.save()
      ctx.translate(centreX, centreY)
      ctx.rotate(handAngle)
      ctx.beginPath()
      ctx.moveTo(0, handLength * 0.15)
      ctx.lineTo(0, -handLength)
      ctx.strokeStyle = handColour
      ctx.lineWidth   = handWidth
      ctx.lineCap     = 'round'
      ctx.stroke()
      ctx.restore()
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const clockRadius  = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2
      const clockCentreY = canvasHeight / 2

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()

      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle  = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }

      const fixedHours = 10; const fixedMinutes = 10; const fixedSeconds = 30
      const secondHandAngle = (fixedSeconds / 60)                             * Math.PI * 2 - Math.PI / 2
      const minuteHandAngle = (fixedMinutes / 60)                             * Math.PI * 2 - Math.PI / 2
      const hourHandAngle   = ((fixedHours % 12) / 12 + fixedMinutes / 720)  * Math.PI * 2 - Math.PI / 2

      drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
      drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3,   isDarkMode ? '#e2e8f0' : '#1e293b')
      drawHand(clockCentreX, clockCentreY, hourHandAngle,   clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')

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

      // ── Step 4 ──────────────────────────────────────────────────────────────
      {
        id: 'live-time',
        title: 'Live time from Date',
        content: [
          { type: 'build', text: 'Replace the hardcoded time with the real current time using JavaScript\'s built-in `Date` object. The clock will now show your actual local time and the second hand will tick forward every second.' },

          { type: 'h3', text: 'The Date object — reading the current time' },
          { type: 'code', text: `// Inside draw(), replace the hardcoded values:
const now            = new Date()
const currentHours   = now.getHours()    // 0–23 (24-hour clock)
const currentMinutes = now.getMinutes()  // 0–59
const currentSeconds = now.getSeconds()  // 0–59
const currentMilliseconds = now.getMilliseconds() // 0–999

// Smooth second hand (moves continuously rather than ticking)
const smoothSeconds  = currentSeconds + currentMilliseconds / 1000` },
          { type: 'walk', text: '`new Date()` creates a Date object representing the exact moment it is called — your local system time at that millisecond. `getHours()` returns the hour in 24-hour format (0 at midnight, 23 at 11pm). `getMinutes()` and `getSeconds()` return the minute and second within the current hour and minute. We also call `getMilliseconds()` (0–999) and add it as a fraction of a second: `currentSeconds + currentMilliseconds / 1000` gives a floating-point seconds value like `30.750`. Using this for the second hand makes it sweep smoothly rather than jump once per second.' },

          { type: 'h3', text: 'Replacing fixed values with live values' },
          { type: 'code', text: `const secondHandAngle = (smoothSeconds  / 60)                                * Math.PI * 2 - Math.PI / 2
const minuteHandAngle = (currentMinutes / 60)                                * Math.PI * 2 - Math.PI / 2
const hourHandAngle   = ((currentHours % 12) / 12 + currentMinutes / 720)   * Math.PI * 2 - Math.PI / 2` },
          { type: 'walk', text: 'The formulas are identical to the previous step — only the input variables changed from hardcoded numbers to live values from `Date`. `currentHours % 12` converts 24-hour time to 12-hour time: 13:00 becomes 1, 0:00 (midnight) stays 0. Adding `currentMinutes / 720` makes the hour hand glide between hour positions — at 10:30 the hour hand should be exactly halfway between 10 and 11, not sitting at 10 until the minute rolls over.' },

          { type: 'cs', text: '**System calls vs pure computation.** `new Date()` is a system call — it reads state from outside the program (the operating system clock). Unlike pure functions that return the same output for the same input, `new Date()` returns different values every call. This makes it impure. The pattern we use — read `Date` once at the start of `draw()`, compute everything from that snapshot — keeps all the impurity in one place. The rest of `draw()` is pure: the same time value always produces the same frame.' },
          { type: 'se', text: '**Smooth vs discrete animation.** The milliseconds trick (`currentSeconds + ms / 1000`) produces a continuous sweep. Without it the second hand would visibly jump each second, which looks mechanical and jarring. Adding one variable makes the motion analog. This is the same trade-off in any animation: discrete state (integers) is simpler to reason about; continuous state (floats) looks better. Use continuous state at the presentation layer, discrete state in the data layer.' },
          { type: 'breaks', text: '**Using `getHours()` without `% 12` → hour hand maps to 0–23 not 0–12.** `getHours()` returns 14 for 2pm. `14 / 12` maps to 1.17 — a full revolution plus a bit, placing the hand at 2 o\'clock but only by accident. At midnight (0) it is correct. At noon (12) it maps to 1.0 — a full revolution, also correct. At 13:00 it maps to 1.08, placing the hand at about 1 o\'clock, not 1. `% 12` fixes this: 14 % 12 = 2, then 2 / 12 = 0.167, placing the hand correctly at 2.' },
          { type: 'note', text: 'Press ⌘S. The clock should now show your current local time. Watch it for a few seconds — the second hand should sweep smoothly and continuously, not tick.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
      ctx.save(); ctx.translate(centreX, centreY); ctx.rotate(handAngle)
      ctx.beginPath(); ctx.moveTo(0, handLength * 0.15); ctx.lineTo(0, -handLength)
      ctx.strokeStyle = handColour; ctx.lineWidth = handWidth; ctx.lineCap = 'round'; ctx.stroke()
      ctx.restore()
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      const clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2; const clockCentreY = canvasHeight / 2
      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()
      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }

      // TODO: replace these hardcoded values with new Date()
      const fixedHours = 10; const fixedMinutes = 10; const fixedSeconds = 30
      const secondHandAngle = (fixedSeconds / 60)                            * Math.PI * 2 - Math.PI / 2
      const minuteHandAngle = (fixedMinutes / 60)                            * Math.PI * 2 - Math.PI / 2
      const hourHandAngle   = ((fixedHours % 12) / 12 + fixedMinutes / 720) * Math.PI * 2 - Math.PI / 2
      drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
      drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3, isDarkMode ? '#e2e8f0' : '#1e293b')
      drawHand(clockCentreX, clockCentreY, hourHandAngle, clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')
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

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
      ctx.save(); ctx.translate(centreX, centreY); ctx.rotate(handAngle)
      ctx.beginPath(); ctx.moveTo(0, handLength * 0.15); ctx.lineTo(0, -handLength)
      ctx.strokeStyle = handColour; ctx.lineWidth = handWidth; ctx.lineCap = 'round'; ctx.stroke()
      ctx.restore()
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      const clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2; const clockCentreY = canvasHeight / 2
      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()
      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }
      const now                = new Date()
      const currentHours       = now.getHours()
      const currentMinutes     = now.getMinutes()
      const currentSeconds     = now.getSeconds()
      const smoothSeconds      = currentSeconds + now.getMilliseconds() / 1000
      const secondHandAngle    = (smoothSeconds  / 60)                                * Math.PI * 2 - Math.PI / 2
      const minuteHandAngle    = (currentMinutes / 60)                                * Math.PI * 2 - Math.PI / 2
      const hourHandAngle      = ((currentHours % 12) / 12 + currentMinutes / 720)   * Math.PI * 2 - Math.PI / 2
      drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
      drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3, isDarkMode ? '#e2e8f0' : '#1e293b')
      drawHand(clockCentreX, clockCentreY, hourHandAngle, clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')
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

      // ── Step 5 ──────────────────────────────────────────────────────────────
      {
        id: 'clock-polish',
        title: 'Hour numbers and centre cap',
        content: [
          { type: 'build', text: 'Add the 12 hour numerals placed around the face using trigonometry, and a centre cap dot that covers the pivot point of all three hands. This is the finished clock.' },

          { type: 'h3', text: 'Placing 12 numerals with a loop' },
          { type: 'code', text: `const numeralRadius = clockRadius * 0.78

for (let hourNumber = 1; hourNumber <= 12; hourNumber++) {
  const numeralAngle = (hourNumber / 12) * Math.PI * 2 - Math.PI / 2
  const numeralX = clockCentreX + numeralRadius * Math.cos(numeralAngle)
  const numeralY = clockCentreY + numeralRadius * Math.sin(numeralAngle)

  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle    = isDarkMode ? '#94a3b8' : '#475569'
  ctx.font         = \`\${Math.round(clockRadius * 0.14)}px system-ui\`
  ctx.fillText(String(hourNumber), numeralX, numeralY)
}` },
          { type: 'walk', text: '`numeralRadius = clockRadius * 0.78` places the numerals at 78% of the clock radius — inside the face but far enough from the centre that hands pass over them. The angle formula `(hourNumber / 12) * 2π` maps 1–12 evenly around the circle. We use the same cos/sin placement formula as the tick marks. `ctx.textAlign = \'center\'` and `ctx.textBaseline = \'middle\'` ensure the number is centred exactly on the computed point, not offset to its left or above its baseline.' },

          { type: 'h3', text: 'Centre cap' },
          { type: 'code', text: `// Draw after all hands so it sits on top
const capRadius = clockRadius * 0.045
ctx.beginPath()
ctx.arc(clockCentreX, clockCentreY, capRadius, 0, Math.PI * 2)
ctx.fillStyle = '#ef4444'
ctx.fill()
ctx.strokeStyle = isDarkMode ? '#1e293b' : '#ffffff'
ctx.lineWidth = 2
ctx.stroke()` },
          { type: 'walk', text: 'The centre cap is drawn last so it appears on top of all three hands. A clock\'s pivot point would be exposed if we drew it first — the hands would visually overlap and intersect at the centre in a way that looks broken. By drawing the cap last, it covers the messy intersection and ties the three hands to a single visible anchor point. The red matches the second hand, connecting them visually.' },

          { type: 'cs', text: '**Z-order through draw order.** Canvas has no concept of layers or z-index — the last thing drawn is the topmost thing visible. The complete draw order for this clock is: background → face → tick marks → hour numerals → hands → centre cap. Each layer sits on top of the previous. This is a deliberate choice, not an accident.' },
          { type: 'se', text: '**Composition over configuration.** We did not add a "show numerals" flag or a "cap colour" parameter. We built the clock in steps, and each step added to the visible result. Each step produced a working clock. The lesson contract calls this the Agile principle: always have working software. A clock without numerals is still a working clock. A clock with numerals is a better working clock.' },
          { type: 'breaks', text: '**Drawing the cap before the hands → hands overlap the cap.** The cap should be the topmost element. If you draw it before the hands, the hands pass over and through it — you see the pivot covered, then the hand drawn on top, with the cap buried underneath. Always draw the cap last.' },
          { type: 'note', text: 'Press ⌘S. You should see a complete, live analog clock with numerals, three hands, and a centre cap. This is the finished clock scene.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
      ctx.save(); ctx.translate(centreX, centreY); ctx.rotate(handAngle)
      ctx.beginPath(); ctx.moveTo(0, handLength * 0.15); ctx.lineTo(0, -handLength)
      ctx.strokeStyle = handColour; ctx.lineWidth = handWidth; ctx.lineCap = 'round'; ctx.stroke()
      ctx.restore()
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      const clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2; const clockCentreY = canvasHeight / 2
      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()
      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }

      // TODO: add a loop for hourNumber 1–12
      //   angle = (hourNumber / 12) * Math.PI * 2 - Math.PI / 2
      //   place at clockCentreX + radius * cos(angle), clockCentreY + radius * sin(angle)
      //   fillText(String(hourNumber), x, y)

      const now = new Date()
      const smoothSeconds = now.getSeconds() + now.getMilliseconds() / 1000
      const secondHandAngle = (smoothSeconds / 60) * Math.PI * 2 - Math.PI / 2
      const minuteHandAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2
      const hourHandAngle = ((now.getHours() % 12) / 12 + now.getMinutes() / 720) * Math.PI * 2 - Math.PI / 2
      drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
      drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3, isDarkMode ? '#e2e8f0' : '#1e293b')
      drawHand(clockCentreX, clockCentreY, hourHandAngle, clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')

      // TODO: draw the centre cap after the hands

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

export default function ClockScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    function drawHand(centreX, centreY, handAngle, handLength, handWidth, handColour) {
      ctx.save(); ctx.translate(centreX, centreY); ctx.rotate(handAngle)
      ctx.beginPath(); ctx.moveTo(0, handLength * 0.15); ctx.lineTo(0, -handLength)
      ctx.strokeStyle = handColour; ctx.lineWidth = handWidth; ctx.lineCap = 'round'; ctx.stroke()
      ctx.restore()
    }

    function draw() {
      const isDarkMode = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = isDarkMode ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      const clockRadius = Math.min(canvasWidth, canvasHeight) * 0.40
      const clockCentreX = canvasWidth / 2; const clockCentreY = canvasHeight / 2

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius, 0, Math.PI * 2)
      ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#6366f1' : '#4338ca'; ctx.lineWidth = 3; ctx.stroke()

      for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
        const isHourMark = tickIndex % 5 === 0
        const tickAngle = (tickIndex / 60) * Math.PI * 2 - Math.PI / 2
        const tickLength = isHourMark ? clockRadius * 0.12 : clockRadius * 0.06
        const outerX = clockCentreX + (clockRadius - 2) * Math.cos(tickAngle)
        const outerY = clockCentreY + (clockRadius - 2) * Math.sin(tickAngle)
        const innerX = clockCentreX + (clockRadius - 2 - tickLength) * Math.cos(tickAngle)
        const innerY = clockCentreY + (clockRadius - 2 - tickLength) * Math.sin(tickAngle)
        ctx.beginPath(); ctx.moveTo(outerX, outerY); ctx.lineTo(innerX, innerY)
        ctx.strokeStyle = isHourMark ? (isDarkMode ? '#e2e8f0' : '#1e293b') : (isDarkMode ? '#475569' : '#94a3b8')
        ctx.lineWidth = isHourMark ? 2.5 : 1.2; ctx.stroke()
      }

      const numeralRadius = clockRadius * 0.78
      for (let hourNumber = 1; hourNumber <= 12; hourNumber++) {
        const numeralAngle = (hourNumber / 12) * Math.PI * 2 - Math.PI / 2
        const numeralX = clockCentreX + numeralRadius * Math.cos(numeralAngle)
        const numeralY = clockCentreY + numeralRadius * Math.sin(numeralAngle)
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = isDarkMode ? '#94a3b8' : '#475569'
        ctx.font = \`\${Math.round(clockRadius * 0.14)}px system-ui\`
        ctx.fillText(String(hourNumber), numeralX, numeralY)
      }

      const now = new Date()
      const smoothSeconds = now.getSeconds() + now.getMilliseconds() / 1000
      const secondHandAngle = (smoothSeconds / 60) * Math.PI * 2 - Math.PI / 2
      const minuteHandAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2
      const hourHandAngle = ((now.getHours() % 12) / 12 + now.getMinutes() / 720) * Math.PI * 2 - Math.PI / 2
      drawHand(clockCentreX, clockCentreY, secondHandAngle, clockRadius * 0.85, 1.5, '#ef4444')
      drawHand(clockCentreX, clockCentreY, minuteHandAngle, clockRadius * 0.78, 3, isDarkMode ? '#e2e8f0' : '#1e293b')
      drawHand(clockCentreX, clockCentreY, hourHandAngle, clockRadius * 0.55, 4.5, isDarkMode ? '#e2e8f0' : '#1e293b')

      ctx.beginPath(); ctx.arc(clockCentreX, clockCentreY, clockRadius * 0.045, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'; ctx.fill()
      ctx.strokeStyle = isDarkMode ? '#1e293b' : '#ffffff'; ctx.lineWidth = 2; ctx.stroke()

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

  // ═══════════════════════════════════════════════════════════════════════════
  // TUTORIAL 2 — Interactive Paint Canvas
  // Skills: mouse events, freehand drawing, state outside RAF, event cleanup
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'paint-canvas',
    title: 'Interactive Paint Canvas',
    description: 'Build a freehand drawing canvas — mouse down to start a stroke, drag to draw, release to stop. No animation loop needed: canvas redraws only when the user draws.',
    steps: [

      // ── Step 1 ──────────────────────────────────────────────────────────────
      {
        id: 'paint-shell',
        title: 'Event-driven canvas — no animation loop',
        content: [
          { type: 'build', text: 'Set up a canvas that draws only when the user interacts with it — no `requestAnimationFrame` loop. You will see a blank canvas with a dark background. This step teaches the most important design decision in interactive canvas work.' },

          { type: 'h3', text: 'Event-driven vs animation-driven canvas' },
          { type: 'p', text: 'Every scene we have built so far uses `requestAnimationFrame` — a loop that redraws 60 times per second regardless of whether anything changed. For a clock that always shows moving hands, this makes sense. For a paint canvas, it is wasteful and unnecessary. The canvas only needs to change when the user draws. We listen for mouse events and redraw only when they fire. This is **event-driven rendering** — the correct model for interactive tools.' },

          { type: 'h3', text: 'The shell — draw once on mount' },
          { type: 'code', text: `import { useEffect, useRef } from 'react'

export default function PaintCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const previousImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, rect.width, rect.height)
      // Restore drawing after resize (imperfect but preserves work)
      ctx.putImageData(previousImageData, 0, 0)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()

    return () => resizeObserver.disconnect()
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}` },
          { type: 'walk', text: 'Notice there is no `requestAnimationFrame` call anywhere. `resize()` paints the background and restores any existing drawing — but it only runs when the container size changes, not 60 times per second. `ctx.getImageData(0, 0, w, h)` captures the current pixel buffer as a raw byte array; `ctx.putImageData(data, 0, 0)` restores it. This preserves the user\'s drawing when they resize the window. The `cursor: \'crosshair\'` CSS gives users the visual feedback that this is a drawing surface.\n\nThe cleanup function disconnects the ResizeObserver so it does not continue watching a removed canvas element.' },

          { type: 'cs', text: '**Event-driven architecture.** Rather than polling ("has anything changed? no. has anything changed? no. has anything changed? yes — redraw"), event-driven code waits for notifications ("something changed — here\'s what"). The browser fires mouse events only when they occur. This pattern — subscribing to events and reacting — underlies every UI framework, every server request handler, and every message queue in production systems.' },
          { type: 'se', text: '**Choose the right rendering model for the job.** Using `requestAnimationFrame` for a paint tool burns CPU for no benefit — the canvas does not change between user interactions. Choosing event-driven rendering for a static drawing surface and animation loops for animated scenes is a deliberate architectural decision that keeps both simpler. Do not reach for the loop by default.' },
          { type: 'breaks', text: '**Resizing clears the canvas pixel buffer.** Setting `canvas.width` or `canvas.height` — even to the same value — resets the pixel buffer to transparent. This is why we call `getImageData` before the resize and `putImageData` after. Without this, every window resize wipes the user\'s drawing.' },
          { type: 'note', text: 'Press ⌘S. You should see a dark crosshair-cursor canvas. Nothing is interactive yet — that comes in the next step.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function PaintCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // TODO: write a resize() function that:
    //   1. saves the current pixel data with ctx.getImageData
    //   2. resizes canvas.width / canvas.height (× devicePixelRatio)
    //   3. ctx.scale(dpr, dpr)
    //   4. fills a dark background
    //   5. restores the pixel data with ctx.putImageData
    // TODO: create ResizeObserver, call resize() immediately
    // TODO: return cleanup disconnecting the observer

  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function PaintCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const savedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.putImageData(savedPixels, 0, 0)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
    return () => resizeObserver.disconnect()
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}
`,
      },

      // ── Step 2 ──────────────────────────────────────────────────────────────
      {
        id: 'draw-strokes',
        title: 'Draw freehand strokes',
        content: [
          { type: 'build', text: 'Add mouse event listeners so the user can draw by clicking and dragging. Press the mouse button to start a stroke, drag to draw, release to stop. You will learn how to track "is the mouse button currently held down" using a mutable variable outside the event handlers.' },

          { type: 'h3', text: 'Mouse events — the three you need' },
          { type: 'p', text: '`mousedown` fires when the user presses a mouse button. `mousemove` fires every time the mouse moves (up to ~100 times per second). `mouseup` fires when the user releases a button. Together, `mousedown → mousemove → mouseup` describes a "drag" gesture. We also listen to `mouseleave` — if the cursor exits the canvas while the button is held, we treat it as a mouseup so the stroke ends cleanly.' },

          { type: 'code', text: `let isDrawing = false
let lastDrawX = 0
let lastDrawY = 0

function getCanvasCoordinates(mouseEvent) {
  const canvasRect = canvas.getBoundingClientRect()
  return {
    x: mouseEvent.clientX - canvasRect.left,
    y: mouseEvent.clientY - canvasRect.top,
  }
}

function handleMouseDown(mouseEvent) {
  isDrawing = true
  const { x, y } = getCanvasCoordinates(mouseEvent)
  lastDrawX = x; lastDrawY = y
  // Draw a dot at the click position
  ctx.beginPath()
  ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2)
  ctx.fillStyle = strokeColour
  ctx.fill()
}

function handleMouseMove(mouseEvent) {
  if (!isDrawing) return
  const { x, y } = getCanvasCoordinates(mouseEvent)
  ctx.beginPath()
  ctx.moveTo(lastDrawX, lastDrawY)
  ctx.lineTo(x, y)
  ctx.strokeStyle = strokeColour
  ctx.lineWidth   = strokeWidth
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.stroke()
  lastDrawX = x; lastDrawY = y
}

function handleMouseUp()    { isDrawing = false }
function handleMouseLeave() { isDrawing = false }

canvas.addEventListener('mousedown',  handleMouseDown)
canvas.addEventListener('mousemove',  handleMouseMove)
canvas.addEventListener('mouseup',    handleMouseUp)
canvas.addEventListener('mouseleave', handleMouseLeave)

return () => {
  canvas.removeEventListener('mousedown',  handleMouseDown)
  canvas.removeEventListener('mousemove',  handleMouseMove)
  canvas.removeEventListener('mouseup',    handleMouseUp)
  canvas.removeEventListener('mouseleave', handleMouseLeave)
  resizeObserver.disconnect()
}` },
          { type: 'walk', text: '`isDrawing` is a plain boolean variable, not React state. We do not want `isDrawing = true` to trigger a re-render — it would unmount and remount the canvas, wiping the drawing. This is one of the few cases where mutable variables outside React state are the correct choice.\n\n`getCanvasCoordinates` converts from window coordinates (`mouseEvent.clientX`, `clientY` — measured from the top-left of the browser window) to canvas coordinates (measured from the top-left of the canvas element). `canvas.getBoundingClientRect()` returns the canvas element\'s position in the window. Subtracting that gives the position within the canvas.\n\nEach `mousemove` draws a line from `(lastDrawX, lastDrawY)` to the current position. Updating `last` to `current` at the end of each handler chains the segments into a continuous stroke. `lineCap = \'round\'` rounds the endpoints of each segment; `lineJoin = \'round\'` rounds the corners where segments meet — together they produce smooth, gapless strokes.' },

          { type: 'cs', text: '**State machine.** The drawing interaction is a two-state machine: IDLE (not drawing) and DRAWING (mouse held down). `mousedown` transitions IDLE → DRAWING. `mouseup` and `mouseleave` transition DRAWING → IDLE. In IDLE state, `mousemove` does nothing. In DRAWING state, `mousemove` draws. Explicitly naming the states and their transitions is clearer than a boolean — but a boolean encodes the same machine.' },
          { type: 'se', text: '**Always remove event listeners you add.** We add four event listeners in `useEffect`. The cleanup function must remove all four. If you add listeners and never remove them, they accumulate — every time the component mounts (including React StrictMode\'s double-mount), another set of listeners is attached. By the second mount you have two `mousemove` handlers firing simultaneously, both drawing, producing doubled strokes.' },
          { type: 'breaks', text: '**Using React useState for isDrawing → canvas clears on state change.** React re-renders the component when state changes. A re-render re-runs the JSX, potentially unmounting and remounting the `<canvas>` element, which clears its pixel buffer. Every mousedown would wipe the drawing. Keep drawing-interaction state in plain mutable `let` variables, not React state.' },
          { type: 'note', text: 'Press ⌘S. Click and drag on the canvas — you should be able to draw freehand strokes. The strokes use a hardcoded white colour for now; we will make them configurable in the next step.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

const strokeColour = '#ffffff'
const strokeWidth  = 4

export default function PaintCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const savedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.putImageData(savedPixels, 0, 0)
    }

    // TODO: declare isDrawing, lastDrawX, lastDrawY as let variables
    // TODO: write getCanvasCoordinates(mouseEvent) → { x, y } relative to canvas
    // TODO: write handleMouseDown — set isDrawing=true, set last coords, draw a dot
    // TODO: write handleMouseMove — if isDrawing, draw a line from last to current, update last
    // TODO: write handleMouseUp and handleMouseLeave — set isDrawing=false
    // TODO: add all four event listeners
    // TODO: return cleanup removing all four + disconnecting resizeObserver

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

const strokeColour = '#ffffff'
const strokeWidth  = 4

export default function PaintCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const savedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.putImageData(savedPixels, 0, 0)
    }

    let isDrawing = false
    let lastDrawX = 0; let lastDrawY = 0

    function getCanvasCoordinates(mouseEvent) {
      const canvasRect = canvas.getBoundingClientRect()
      return { x: mouseEvent.clientX - canvasRect.left, y: mouseEvent.clientY - canvasRect.top }
    }

    function handleMouseDown(mouseEvent) {
      isDrawing = true
      const { x, y } = getCanvasCoordinates(mouseEvent)
      lastDrawX = x; lastDrawY = y
      ctx.beginPath()
      ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = strokeColour; ctx.fill()
    }

    function handleMouseMove(mouseEvent) {
      if (!isDrawing) return
      const { x, y } = getCanvasCoordinates(mouseEvent)
      ctx.beginPath()
      ctx.moveTo(lastDrawX, lastDrawY); ctx.lineTo(x, y)
      ctx.strokeStyle = strokeColour; ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
      lastDrawX = x; lastDrawY = y
    }

    function handleMouseUp()    { isDrawing = false }
    function handleMouseLeave() { isDrawing = false }

    canvas.addEventListener('mousedown',  handleMouseDown)
    canvas.addEventListener('mousemove',  handleMouseMove)
    canvas.addEventListener('mouseup',    handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize()

    return () => {
      canvas.removeEventListener('mousedown',  handleMouseDown)
      canvas.removeEventListener('mousemove',  handleMouseMove)
      canvas.removeEventListener('mouseup',    handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      resizeObserver.disconnect()
    }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}
`,
      },

      // ── Step 3 ──────────────────────────────────────────────────────────────
      {
        id: 'brush-and-eraser',
        title: 'Brush colour, size, and eraser',
        content: [
          { type: 'build', text: 'Add a React UI for brush colour, brush size, and an eraser. The colour and size values live in React refs so the event handlers always read the latest values. You will see how refs bridge React\'s declarative model with canvas\'s imperative model.' },

          { type: 'h3', text: 'Why refs, not state, for tool settings' },
          { type: 'p', text: 'We need the event handlers inside `useEffect` to read the current brush colour. The problem: event handlers close over values at the time they are created — a stale closure. If we used `useState`, the handlers would always see the initial colour. The fix: store the current values in a `ref`. A ref object (`{ current: value }`) is mutable — the handlers read `colourRef.current` and always get the latest value, because we never replace the ref object itself, only its `.current` property.' },

          { type: 'code', text: `// At the top of the component (outside useEffect):
const colourRef = useRef('#ffffff')
const sizeRef   = useRef(4)
const isErasing = useRef(false)

// Inside handleMouseDown and handleMouseMove, replace hardcoded values:
const activeColour = isErasing.current ? '#0f172a' : colourRef.current
const activeSize   = sizeRef.current

// In JSX — the control bar:
return (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, alignItems: 'center',
      background: '#1e293b', borderRadius: 8, padding: '6px 12px',
      border: '1px solid #334155',
    }}>
      <input type="color" defaultValue="#ffffff"
        onChange={e => { colourRef.current = e.target.value; isErasing.current = false }}
        style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
      />
      <input type="range" min={2} max={40} defaultValue={4}
        onChange={e => { sizeRef.current = Number(e.target.value) }}
        style={{ width: 80 }}
      />
      <button
        onClick={() => { isErasing.current = !isErasing.current }}
        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
          background: '#334155', color: '#e2e8f0', border: '1px solid #475569' }}
      >
        ✦ Eraser
      </button>
      <button
        onClick={() => {
          const ctx = canvasRef.current?.getContext('2d')
          if (!ctx) return
          ctx.fillStyle = '#0f172a'
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }}
        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
          background: '#334155', color: '#e2e8f0', border: '1px solid #475569' }}
      >
        ✕ Clear
      </button>
    </div>
  </div>
)` },
          { type: 'walk', text: '`useRef` outside `useEffect` creates a ref that persists across renders. `colourRef.current = e.target.value` inside the `onChange` handler mutates the ref without triggering a re-render — the canvas does not unmount and the drawing is preserved. Inside the event handlers, `colourRef.current` always reads the latest value because the ref object itself never changes (only its `.current` property does).\n\nThe eraser works by painting with the background colour (`#0f172a`). There is no "undo" concept in the canvas — the eraser literally paints over existing pixels with the background. `type="color"` and `type="range"` are native HTML input types — the browser provides the colour picker and slider UI, we just read the value from `onChange`.' },

          { type: 'cs', text: '**Stale closures and the ref solution.** When you write `canvas.addEventListener(\'mousemove\', handleMouseMove)`, `handleMouseMove` closes over the variables in scope at the time it is created. If those variables are captured by value (like a number), they never update. A ref is an object captured by reference — the event handler holds a reference to the ref object, not to the value inside it. The value inside can change without the handler being recreated.' },
          { type: 'se', text: '**Eraser as colour, not undo.** A true eraser would require storing the full drawing history (an undo stack). Our eraser paints with the background colour — simpler but destructive. When you "erase," you are actually drawing on top of the existing marks. This trade-off (simplicity vs correctness) is a real engineering decision. A production paint tool would implement an undo stack; a demo like this does not need one.' },
          { type: 'breaks', text: '**Using useState for colourRef → canvas unmounts on every colour change.** React re-renders when state changes. A re-render will run the JSX again and potentially replace the canvas element with a new one. The new canvas element has an empty pixel buffer. Every time the user picks a colour, their drawing disappears. This is why we use refs for values that event handlers need to read but that do not need to trigger renders.' },
          { type: 'note', text: 'Press ⌘S. You should see a colour picker, size slider, eraser, and clear button at the bottom. Draw with different colours and sizes. Use the eraser to remove marks. This is the finished Paint Canvas.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function PaintCanvas() {
  // TODO: declare colourRef = useRef('#ffffff')
  // TODO: declare sizeRef   = useRef(4)
  // TODO: declare isErasing = useRef(false)

  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const savedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.putImageData(savedPixels, 0, 0)
    }

    let isDrawing = false; let lastDrawX = 0; let lastDrawY = 0

    function getCanvasCoordinates(mouseEvent) {
      const canvasRect = canvas.getBoundingClientRect()
      return { x: mouseEvent.clientX - canvasRect.left, y: mouseEvent.clientY - canvasRect.top }
    }

    function handleMouseDown(mouseEvent) {
      isDrawing = true
      const { x, y } = getCanvasCoordinates(mouseEvent)
      lastDrawX = x; lastDrawY = y
      // TODO: use colourRef.current and sizeRef.current and isErasing.current
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill()
    }

    function handleMouseMove(mouseEvent) {
      if (!isDrawing) return
      const { x, y } = getCanvasCoordinates(mouseEvent)
      // TODO: read active colour (eraser → '#0f172a', else colourRef.current) and activeSize
      ctx.beginPath(); ctx.moveTo(lastDrawX, lastDrawY); ctx.lineTo(x, y)
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
      lastDrawX = x; lastDrawY = y
    }

    function handleMouseUp()    { isDrawing = false }
    function handleMouseLeave() { isDrawing = false }

    canvas.addEventListener('mousedown', handleMouseDown); canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup',   handleMouseUp);   canvas.addEventListener('mouseleave', handleMouseLeave)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement); resize()
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown); canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup',   handleMouseUp);   canvas.removeEventListener('mouseleave', handleMouseLeave)
      resizeObserver.disconnect()
    }
  }, [])

  // TODO: return a wrapping <div> containing the <canvas> and a control bar
  //   with: colour input (type="color"), size slider (type="range" 2–40),
  //         eraser button, clear button
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function PaintCanvas() {
  const colourRef  = useRef('#ffffff')
  const sizeRef    = useRef(4)
  const isErasing  = useRef(false)
  const canvasRef  = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      const savedPixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width  = rect.width  * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.putImageData(savedPixels, 0, 0)
    }

    let isDrawing = false; let lastDrawX = 0; let lastDrawY = 0

    function getCanvasCoordinates(mouseEvent) {
      const canvasRect = canvas.getBoundingClientRect()
      return { x: mouseEvent.clientX - canvasRect.left, y: mouseEvent.clientY - canvasRect.top }
    }

    function handleMouseDown(mouseEvent) {
      isDrawing = true
      const { x, y } = getCanvasCoordinates(mouseEvent)
      lastDrawX = x; lastDrawY = y
      const activeColour = isErasing.current ? '#0f172a' : colourRef.current
      ctx.beginPath(); ctx.arc(x, y, sizeRef.current / 2, 0, Math.PI * 2)
      ctx.fillStyle = activeColour; ctx.fill()
    }

    function handleMouseMove(mouseEvent) {
      if (!isDrawing) return
      const { x, y } = getCanvasCoordinates(mouseEvent)
      const activeColour = isErasing.current ? '#0f172a' : colourRef.current
      ctx.beginPath(); ctx.moveTo(lastDrawX, lastDrawY); ctx.lineTo(x, y)
      ctx.strokeStyle = activeColour; ctx.lineWidth = sizeRef.current
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
      lastDrawX = x; lastDrawY = y
    }

    function handleMouseUp()    { isDrawing = false }
    function handleMouseLeave() { isDrawing = false }

    canvas.addEventListener('mousedown', handleMouseDown); canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup',   handleMouseUp);   canvas.addEventListener('mouseleave', handleMouseLeave)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement); resize()
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown); canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup',   handleMouseUp);   canvas.removeEventListener('mouseleave', handleMouseLeave)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#1e293b', borderRadius: 8, padding: '6px 12px', border: '1px solid #334155',
      }}>
        <input type="color" defaultValue="#ffffff"
          onChange={e => { colourRef.current = e.target.value; isErasing.current = false }}
          style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
        />
        <input type="range" min={2} max={40} defaultValue={4}
          onChange={e => { sizeRef.current = Number(e.target.value) }}
          style={{ width: 80 }}
        />
        <button onClick={() => { isErasing.current = !isErasing.current }}
          style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
            background: '#334155', color: '#e2e8f0', border: '1px solid #475569' }}>
          ✦ Eraser
        </button>
        <button onClick={() => {
          const ctx = canvasRef.current?.getContext('2d')
          if (!ctx) return
          ctx.fillStyle = '#0f172a'
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
            background: '#334155', color: '#e2e8f0', border: '1px solid #475569' }}>
          ✕ Clear
        </button>
      </div>
    </div>
  )
}
`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TUTORIAL 3 — Particle Gravity Field
  // Skills: object arrays, velocity physics, gravity, mouse repulsion, alpha fade
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'particle-gravity',
    title: 'Particle Gravity Field',
    description: 'Build a field of 80 particles pulled down by gravity, bouncing off the floor, and repelled by the mouse. Teaches object arrays, velocity physics, and per-frame state mutation.',
    steps: [

      {
        id: 'one-moving-particle',
        title: 'One particle that moves',
        content: [
          { type: 'build', text: 'Animate a single particle moving across the canvas using a position + velocity model. This is the foundation that every particle system, game physics engine, and physics simulation in the world is built on.' },
          { type: 'h3', text: 'Position and velocity — the core physics model' },
          { type: 'p', text: 'A particle has a **position** (where it is right now: x, y) and a **velocity** (how fast it is moving: vx, vy — pixels per frame). Each frame, we add the velocity to the position: `x += vx` and `y += vy`. That is the entire simulation model. Gravity is a velocity change: each frame we add a small downward amount to `vy`. This is Euler integration — the simplest numerical method for solving differential equations.' },
          { type: 'code', text: `import { useEffect, useRef } from 'react'

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const particle = { positionX: 100, positionY: 100, velocityX: 2.5, velocityY: 1.2 }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      particle.positionX += particle.velocityX
      particle.positionY += particle.velocityY

      if (particle.positionX < 0)            particle.positionX = canvasWidth
      if (particle.positionX > canvasWidth)  particle.positionX = 0
      if (particle.positionY < 0)            particle.positionY = canvasHeight
      if (particle.positionY > canvasHeight) particle.positionY = 0

      ctx.beginPath()
      ctx.arc(particle.positionX, particle.positionY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'
      ctx.fill()

      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}` },
          { type: 'walk', text: 'The semi-transparent `fillRect` at the start of each frame fills the canvas with a near-black colour at 25% opacity instead of fully clearing it. After 4 frames, an old frame is nearly invisible. This produces motion trails. The trail length is controlled by the opacity: higher opacity = shorter trail.\n\nWrapping (`positionX > canvasWidth → positionX = 0`) teleports the particle to the other side, creating infinite-space feel.' },
          { type: 'cs', text: '**Euler integration.** `position += velocity` each frame is the discretised form of the continuous equation `dx/dt = v`. We approximate the smooth trajectory as a sequence of small straight-line steps. Euler integration is inaccurate for rapidly changing forces but perfectly adequate for game-style physics where visual plausibility matters more than exact accuracy.' },
          { type: 'se', text: '**Name fields for what they are.** `positionX` and `velocityX` rather than `x`, `vx`, `dx`. In a system with many particle fields, abbreviated names become confusing quickly. Descriptive names cost nothing and make `updateAndDrawParticle` readable on its own.' },
          { type: 'breaks', text: '**`ctx.clearRect` instead of semi-transparent fill → no trails.** `clearRect` wipes every pixel to transparent. The trail effect comes from the ghost of prior frames shining through the semi-transparent fill. Replace the fill with `clearRect` and you get a dot that moves with no history — just a point in space.' },
          { type: 'note', text: 'Press ⌘S. A single dot should move diagonally leaving a fading trail. When it hits an edge it wraps to the other side.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    // TODO: create particle object with positionX, positionY, velocityX, velocityY

    function draw() {
      // TODO: semi-transparent fillRect for trails (rgba with ~0.25 alpha)
      // TODO: update position by adding velocity
      // TODO: wrap at canvas edges
      // TODO: draw a circle at particle position
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

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const particle = { positionX: 100, positionY: 100, velocityX: 2.5, velocityY: 1.2 }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particle.positionX += particle.velocityX
      particle.positionY += particle.velocityY
      if (particle.positionX < 0)            particle.positionX = canvasWidth
      if (particle.positionX > canvasWidth)  particle.positionX = 0
      if (particle.positionY < 0)            particle.positionY = canvasHeight
      if (particle.positionY > canvasHeight) particle.positionY = 0
      ctx.beginPath()
      ctx.arc(particle.positionX, particle.positionY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'; ctx.fill()
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

      {
        id: 'particle-array',
        title: '80 particles with gravity',
        content: [
          { type: 'build', text: 'Replace the single particle with an array of 80 particles, each at a random starting position and velocity. Add gravity so every particle accelerates downward. Particles that fall off the bottom respawn at the top.' },
          { type: 'h3', text: 'Creating and initialising a particle array' },
          { type: 'code', text: `const PARTICLE_COUNT = 80
const GRAVITY = 0.12

function createParticle() {
  return {
    positionX:  Math.random() * canvasWidth,
    positionY:  Math.random() * canvasHeight,
    velocityX:  (Math.random() - 0.5) * 3,
    velocityY:  Math.random() * -2 - 0.5,
    radius:     Math.random() * 2.5 + 1,
    hue:        Math.floor(Math.random() * 60) + 220,
  }
}

const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)` },
          { type: 'walk', text: '`Array.from({ length: N }, factory)` creates N elements by calling `factory` once per element — cleaner than a push loop. `(Math.random() - 0.5) * 3` gives a horizontal velocity from -1.5 to +1.5. `Math.random() * -2 - 0.5` gives an upward velocity from -0.5 to -2.5 so particles arc under gravity.\n\n`hue` stores a colour in degrees (220–280 = blue to purple). Used as `hsl(${hue}, 80%, 65%)` — one number drives the entire colour.' },
          { type: 'h3', text: 'Simulating gravity and floor respawn' },
          { type: 'code', text: `function updateAndDrawParticle(particle) {
  particle.velocityY += GRAVITY
  particle.positionX += particle.velocityX
  particle.positionY += particle.velocityY

  if (particle.positionX < -particle.radius)               particle.positionX = canvasWidth + particle.radius
  if (particle.positionX > canvasWidth + particle.radius)  particle.positionX = -particle.radius

  if (particle.positionY > canvasHeight + particle.radius) {
    particle.positionY = -particle.radius
    particle.positionX = Math.random() * canvasWidth
    particle.velocityY = Math.random() * -3 - 1
    particle.velocityX = (Math.random() - 0.5) * 3
  }

  ctx.beginPath()
  ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
  ctx.fillStyle = \`hsl(\${particle.hue}, 80%, 65%)\`
  ctx.fill()
}

// Inside draw():
ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'
ctx.fillRect(0, 0, canvasWidth, canvasHeight)
particles.forEach(updateAndDrawParticle)` },
          { type: 'walk', text: '`particle.velocityY += GRAVITY` is the gravity simulation. Each frame the downward velocity increases by 0.12 px/frame. After 10 frames a particle falls 1.2 px/frame faster than it started. When a particle exits through the floor it resets to the top with a fresh upward velocity — without this the screen empties completely.' },
          { type: 'cs', text: '**The particle system pattern.** Every particle system uses: (1) create N particles with initial state, (2) each frame update every particle (position, velocity, lifetime), (3) draw each particle, (4) respawn dead particles. The logic lives in the update function; the draw function just reads state. Separating update from draw makes the system composable — add new forces without touching drawing code.' },
          { type: 'se', text: '**GRAVITY as a named constant.** `velocityY += 0.12` works but 0.12 is a magic number. `GRAVITY = 0.12` names it and gives it one place to change. Every scene that should feel heavier or lighter is a one-number edit. UPPER_CASE for module-level constants signals "do not mutate this" — a convention borrowed from C.' },
          { type: 'breaks', text: '**No respawn → all particles fall off screen in ~5 seconds.** At 60fps with GRAVITY=0.12, a particle starting at velocity 0 reaches 7 px/frame after 1 second and exits a 600px canvas after ~3 seconds. Without respawn the screen empties. Respawn is what keeps the scene alive.' },
          { type: 'note', text: 'Press ⌘S. 80 particles should arc upward then fall under gravity, wrapping side-to-side and respawning at the floor. The scene should feel like a fountain of blue-purple sparks.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const PARTICLE_COUNT = 80; const GRAVITY = 0.12

    // TODO: write createParticle() → { positionX, positionY, velocityX, velocityY, radius, hue }
    // TODO: const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)
    // TODO: write updateAndDrawParticle(particle):
    //   velocityY += GRAVITY, update positions, wrap sides, floor-respawn, draw arc

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      // TODO: particles.forEach(updateAndDrawParticle)
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

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const PARTICLE_COUNT = 80; const GRAVITY = 0.12

    function createParticle() {
      return {
        positionX: Math.random() * (canvasWidth || 400),
        positionY: Math.random() * (canvasHeight || 400),
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: Math.random() * -2 - 0.5,
        radius:    Math.random() * 2.5 + 1,
        hue:       Math.floor(Math.random() * 60) + 220,
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

    function updateAndDrawParticle(particle) {
      particle.velocityY += GRAVITY
      particle.positionX += particle.velocityX; particle.positionY += particle.velocityY
      if (particle.positionX < -particle.radius)              particle.positionX = canvasWidth + particle.radius
      if (particle.positionX > canvasWidth + particle.radius) particle.positionX = -particle.radius
      if (particle.positionY > canvasHeight + particle.radius) {
        particle.positionY = -particle.radius; particle.positionX = Math.random() * canvasWidth
        particle.velocityY = Math.random() * -3 - 1; particle.velocityX = (Math.random() - 0.5) * 3
      }
      ctx.beginPath()
      ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = \`hsl(\${particle.hue}, 80%, 65%)\`; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particles.forEach(updateAndDrawParticle)
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

      {
        id: 'mouse-repulsion',
        title: 'Mouse repulsion force',
        content: [
          { type: 'build', text: 'Track the mouse position and apply a repulsion force to every particle within 120px of the cursor — the closer the particle, the stronger the push. The mouse becomes a force field.' },
          { type: 'h3', text: 'Computing a repulsion vector from distance' },
          { type: 'p', text: 'For each particle: (1) how far is it from the mouse? `Math.sqrt(dx² + dy²)`. (2) Which direction to push? `(dx / distance, dy / distance)` — a unit vector pointing from the mouse toward the particle. Multiply by force strength to get the actual push.' },
          { type: 'code', text: `const mousePosition = { x: -9999, y: -9999 }
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect()
  mousePosition.x = e.clientX - rect.left
  mousePosition.y = e.clientY - rect.top
})

const REPULSION_RADIUS   = 120
const REPULSION_STRENGTH = 0.6

// Inside updateAndDrawParticle(), after position update:
const deltaX = particle.positionX - mousePosition.x
const deltaY = particle.positionY - mousePosition.y
const distanceToMouse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

if (distanceToMouse < REPULSION_RADIUS && distanceToMouse > 0) {
  const forceFraction = 1 - distanceToMouse / REPULSION_RADIUS
  particle.velocityX += (deltaX / distanceToMouse) * REPULSION_STRENGTH * forceFraction
  particle.velocityY += (deltaY / distanceToMouse) * REPULSION_STRENGTH * forceFraction
}` },
          { type: 'walk', text: '`deltaX = particle.positionX - mousePosition.x` points from the mouse toward the particle. Dividing by distance normalises it to a unit vector. `forceFraction = 1 - distance / REPULSION_RADIUS` makes the force strongest at the cursor (fraction=1) and zero at the radius boundary (fraction=0) — a linear falloff. The guard `distanceToMouse > 0` prevents division by zero.' },
          { type: 'cs', text: '**Normalised vectors for direction.** Dividing `(dx, dy)` by its magnitude gives a unit vector — length 1, same direction. Unit vectors are used everywhere: surface normals, collision response, ray directions. Normalising separates "which way" from "how much" so you control them independently.' },
          { type: 'se', text: '**Falloff radius prevents abrupt force steps.** Without `forceFraction`, a particle just outside the radius feels zero force; one just inside feels full force — an invisible wall. Linear falloff makes the boundary smooth and invisible. Same technique used in 3D lighting attenuation, audio distance falloff, and game AI influence maps.' },
          { type: 'breaks', text: '**Large REPULSION_STRENGTH → particles fly off screen.** Adding 0.6 to velocity per frame adds up: after 10 frames inside radius a particle has +6 px/frame. If you raise REPULSION_STRENGTH, reduce REPULSION_RADIUS or clamp velocity: `Math.max(-MAX, Math.min(MAX, velocity))`.' },
          { type: 'note', text: 'Press ⌘S. Move your mouse over the canvas — particles near the cursor scatter away. Remove the mouse and they fall back under gravity.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const GRAVITY = 0.12; const PARTICLE_COUNT = 80
    const REPULSION_RADIUS = 120; const REPULSION_STRENGTH = 0.6

    // TODO: mousePosition = { x: -9999, y: -9999 }
    // TODO: mousemove listener → compute x/y relative to canvas rect

    function createParticle() {
      return {
        positionX: Math.random() * (canvasWidth || 400), positionY: Math.random() * (canvasHeight || 400),
        velocityX: (Math.random() - 0.5) * 3, velocityY: Math.random() * -2 - 0.5,
        radius: Math.random() * 2.5 + 1, hue: Math.floor(Math.random() * 60) + 220,
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

    function updateAndDrawParticle(particle) {
      particle.velocityY += GRAVITY
      particle.positionX += particle.velocityX; particle.positionY += particle.velocityY
      if (particle.positionX < -particle.radius) particle.positionX = canvasWidth + particle.radius
      if (particle.positionX > canvasWidth + particle.radius) particle.positionX = -particle.radius
      if (particle.positionY > canvasHeight + particle.radius) {
        particle.positionY = -particle.radius; particle.positionX = Math.random() * canvasWidth
        particle.velocityY = Math.random() * -3 - 1; particle.velocityX = (Math.random() - 0.5) * 3
      }
      // TODO: compute deltaX, deltaY, distanceToMouse
      // TODO: if distance < REPULSION_RADIUS → apply force using forceFraction and unit vector
      ctx.beginPath(); ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = \`hsl(\${particle.hue}, 80%, 65%)\`; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particles.forEach(updateAndDrawParticle)
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

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const GRAVITY = 0.12; const PARTICLE_COUNT = 80
    const REPULSION_RADIUS = 120; const REPULSION_STRENGTH = 0.6
    const mousePosition = { x: -9999, y: -9999 }
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect()
      mousePosition.x = e.clientX - rect.left; mousePosition.y = e.clientY - rect.top
    })

    function createParticle() {
      return {
        positionX: Math.random() * (canvasWidth || 400), positionY: Math.random() * (canvasHeight || 400),
        velocityX: (Math.random() - 0.5) * 3, velocityY: Math.random() * -2 - 0.5,
        radius: Math.random() * 2.5 + 1, hue: Math.floor(Math.random() * 60) + 220,
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

    function updateAndDrawParticle(particle) {
      particle.velocityY += GRAVITY
      particle.positionX += particle.velocityX; particle.positionY += particle.velocityY
      if (particle.positionX < -particle.radius) particle.positionX = canvasWidth + particle.radius
      if (particle.positionX > canvasWidth + particle.radius) particle.positionX = -particle.radius
      if (particle.positionY > canvasHeight + particle.radius) {
        particle.positionY = -particle.radius; particle.positionX = Math.random() * canvasWidth
        particle.velocityY = Math.random() * -3 - 1; particle.velocityX = (Math.random() - 0.5) * 3
      }
      const deltaX = particle.positionX - mousePosition.x
      const deltaY = particle.positionY - mousePosition.y
      const distanceToMouse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (distanceToMouse < REPULSION_RADIUS && distanceToMouse > 0) {
        const forceFraction = 1 - distanceToMouse / REPULSION_RADIUS
        particle.velocityX += (deltaX / distanceToMouse) * REPULSION_STRENGTH * forceFraction
        particle.velocityY += (deltaY / distanceToMouse) * REPULSION_STRENGTH * forceFraction
      }
      ctx.beginPath(); ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = \`hsl(\${particle.hue}, 80%, 65%)\`; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particles.forEach(updateAndDrawParticle)
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

      {
        id: 'lifetime-fade',
        title: 'Lifetime and alpha fade',
        content: [
          { type: 'build', text: 'Give each particle a lifetime counter that counts down each frame. As lifetime decreases the particle fades out. When it reaches zero, the particle respawns fresh. This replaces floor-based respawn with a more organic fade cycle.' },
          { type: 'code', text: `// In createParticle(), add:
const lifetime = Math.floor(Math.random() * 150) + 80
return { /* ...rest... */, lifetime, maxLifetime: lifetime }

// In updateAndDrawParticle(), at the top:
particle.lifetime--
if (particle.lifetime <= 0) {
  particle.positionX   = Math.random() * canvasWidth
  particle.positionY   = -10
  particle.velocityX   = (Math.random() - 0.5) * 3
  particle.velocityY   = Math.random() * -2 - 0.5
  particle.hue         = Math.floor(Math.random() * 60) + 220
  particle.lifetime    = Math.floor(Math.random() * 150) + 80
  particle.maxLifetime = particle.lifetime
}

// Compute alpha and draw with hsla:
const lifetimeFraction = particle.lifetime / particle.maxLifetime
const particleAlpha    = Math.min(1, lifetimeFraction * 3)

ctx.beginPath()
ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
ctx.fillStyle = \`hsla(\${particle.hue}, 80%, 65%, \${particleAlpha})\`
ctx.fill()` },
          { type: 'walk', text: '`lifetime--` decrements each frame (~60×/sec). A particle with `lifetime=120` lives 2 seconds. `lifetimeFraction` goes from 1.0 (just spawned) to 0.0 (dying). `Math.min(1, fraction * 3)` clamps to 1 for the first third of life (fully opaque), then fades to 0 over the remaining two-thirds.\n\n`hsla(hue, sat%, light%, alpha)` is the CSS colour format with alpha 0–1.' },
          { type: 'cs', text: '**Parametric fade using normalised time.** `lifetimeFraction` is normalised time — 1 at birth, 0 at death. Plugging `t` into any curve (linear, quadratic, sine) produces smooth transitions. Game engines call this `t` in their lerp and easing functions. Normalised time is the universal parameter for animation.' },
          { type: 'se', text: '**Separating "when to respawn" from "where to spawn."** The lifetime system decides when a particle ends, independently of where it is. This decouples two concerns that were coupled in floor-based respawn. Now a particle can fade out anywhere in the canvas — not just at the bottom — which creates a much more organic effect.' },
          { type: 'breaks', text: '**maxLifetime = 0 before being set → division by zero.** `lifetimeFraction = lifetime / maxLifetime` produces Infinity when maxLifetime is 0. Always set maxLifetime at the same time as lifetime — or compute it in the factory so it is never unset.' },
          { type: 'note', text: 'Press ⌘S. Particles fade in, drift under gravity with mouse repulsion, then fade out and respawn at the top. This is the finished Particle Gravity Field.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const GRAVITY = 0.12; const PARTICLE_COUNT = 80
    const REPULSION_RADIUS = 120; const REPULSION_STRENGTH = 0.6
    const mousePosition = { x: -9999, y: -9999 }
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect()
      mousePosition.x = e.clientX - rect.left; mousePosition.y = e.clientY - rect.top
    })

    function createParticle() {
      // TODO: add lifetime and maxLifetime fields
      return {
        positionX: Math.random() * (canvasWidth || 400), positionY: Math.random() * (canvasHeight || 400),
        velocityX: (Math.random() - 0.5) * 3, velocityY: Math.random() * -2 - 0.5,
        radius: Math.random() * 2.5 + 1, hue: Math.floor(Math.random() * 60) + 220,
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

    function updateAndDrawParticle(particle) {
      // TODO: lifetime-- and respawn when <= 0

      particle.velocityY += GRAVITY
      particle.positionX += particle.velocityX; particle.positionY += particle.velocityY
      if (particle.positionX < -particle.radius) particle.positionX = canvasWidth + particle.radius
      if (particle.positionX > canvasWidth + particle.radius) particle.positionX = -particle.radius

      const deltaX = particle.positionX - mousePosition.x
      const deltaY = particle.positionY - mousePosition.y
      const distanceToMouse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (distanceToMouse < REPULSION_RADIUS && distanceToMouse > 0) {
        const forceFraction = 1 - distanceToMouse / REPULSION_RADIUS
        particle.velocityX += (deltaX / distanceToMouse) * REPULSION_STRENGTH * forceFraction
        particle.velocityY += (deltaY / distanceToMouse) * REPULSION_STRENGTH * forceFraction
      }

      // TODO: compute lifetimeFraction, particleAlpha = Math.min(1, fraction * 3)
      // TODO: draw with hsla(hue, 80%, 65%, alpha)
      ctx.beginPath(); ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = \`hsl(\${particle.hue}, 80%, 65%)\`; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particles.forEach(updateAndDrawParticle)
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

export default function ParticleScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const GRAVITY = 0.12; const PARTICLE_COUNT = 80
    const REPULSION_RADIUS = 120; const REPULSION_STRENGTH = 0.6
    const mousePosition = { x: -9999, y: -9999 }
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect()
      mousePosition.x = e.clientX - rect.left; mousePosition.y = e.clientY - rect.top
    })

    function createParticle() {
      const lifetime = Math.floor(Math.random() * 150) + 80
      return {
        positionX: Math.random() * (canvasWidth || 400), positionY: Math.random() * (canvasHeight || 400),
        velocityX: (Math.random() - 0.5) * 3, velocityY: Math.random() * -2 - 0.5,
        radius: Math.random() * 2.5 + 1, hue: Math.floor(Math.random() * 60) + 220,
        lifetime, maxLifetime: lifetime,
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, createParticle)

    function updateAndDrawParticle(particle) {
      particle.lifetime--
      if (particle.lifetime <= 0) {
        particle.positionX = Math.random() * canvasWidth; particle.positionY = -10
        particle.velocityX = (Math.random() - 0.5) * 3;  particle.velocityY = Math.random() * -2 - 0.5
        particle.hue = Math.floor(Math.random() * 60) + 220
        particle.lifetime = Math.floor(Math.random() * 150) + 80
        particle.maxLifetime = particle.lifetime
      }
      particle.velocityY += GRAVITY
      particle.positionX += particle.velocityX; particle.positionY += particle.velocityY
      if (particle.positionX < -particle.radius) particle.positionX = canvasWidth + particle.radius
      if (particle.positionX > canvasWidth + particle.radius) particle.positionX = -particle.radius
      const deltaX = particle.positionX - mousePosition.x
      const deltaY = particle.positionY - mousePosition.y
      const distanceToMouse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (distanceToMouse < REPULSION_RADIUS && distanceToMouse > 0) {
        const forceFraction = 1 - distanceToMouse / REPULSION_RADIUS
        particle.velocityX += (deltaX / distanceToMouse) * REPULSION_STRENGTH * forceFraction
        particle.velocityY += (deltaY / distanceToMouse) * REPULSION_STRENGTH * forceFraction
      }
      const particleAlpha = Math.min(1, (particle.lifetime / particle.maxLifetime) * 3)
      ctx.beginPath(); ctx.arc(particle.positionX, particle.positionY, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = \`hsla(\${particle.hue}, 80%, 65%, \${particleAlpha})\`; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      particles.forEach(updateAndDrawParticle)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // TUTORIAL 4 — Bouncing Balls Sandbox
  // Skills: wall collision, velocity reflection, ball-ball collision, click spawn
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bouncing-balls',
    title: 'Bouncing Balls Sandbox',
    description: 'Build a sandbox of bouncing balls that collide with walls and each other. Click to spawn new balls. Teaches collision detection, velocity reflection, and click-event spawning.',
    steps: [

      {
        id: 'one-bouncing-ball',
        title: 'One ball, wall bouncing',
        content: [
          { type: 'build', text: 'Animate a single ball moving and bouncing off all four walls. This is the complete wall-collision algorithm. Get it right on one ball and adding a hundred more is just adding them to an array.' },
          { type: 'h3', text: 'Wall collision: detect and reflect' },
          { type: 'p', text: 'A ball bounces when it touches a wall. "Touching the left wall" means `positionX - radius <= 0`. The response: flip the horizontal velocity (`velocityX = -velocityX`). Velocity reflection — reversing the component perpendicular to the wall. We check `positionX - radius` so the collision is at the ball\'s surface, not its centre.' },
          { type: 'code', text: `import { useEffect, useRef } from 'react'

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const ball = { positionX: 200, positionY: 150, velocityX: 4, velocityY: 3, radius: 20, colour: '#6366f1' }

    function updateBall(ball) {
      ball.positionX += ball.velocityX
      ball.positionY += ball.velocityY

      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;                ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    function drawBall(ball) {
      ctx.beginPath()
      ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      updateBall(ball); drawBall(ball)
      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}` },
          { type: 'walk', text: 'Instead of `velocityX = -velocityX` we use `Math.abs(velocityX)` and negate it. `Math.abs(velocityX)` is always the speed without direction. Left wall needs the ball moving right: `+Math.abs`. Right wall moving left: `-Math.abs`. This is the safe form — if the ball somehow embeds in a wall across two frames, the absolute-value form always points velocity toward open space.' },
          { type: 'cs', text: '**Velocity reflection.** Reflecting a velocity off a flat wall negates the component perpendicular to it. For a vertical wall: negate `velocityX`. For a horizontal wall: negate `velocityY`. For an angled wall: the general reflection formula uses the wall\'s surface normal — the same concept used in ray tracing and billiard physics.' },
          { type: 'se', text: '**Push-out before reflection.** After detecting collision, `ball.positionX = ball.radius` moves the ball to exactly touching the wall surface. Without this, a fast ball might penetrate several pixels in one frame and oscillate inside the wall — bouncing back and forth without ever escaping. Position correction (depenetration) is a critical step in all collision systems.' },
          { type: 'breaks', text: '**`velocityX = -velocityX` can tunnel through thin walls.** If the ball moves 10 px/frame and the wall is 2 px thick, the ball can jump through in a single frame — both sides checked, neither triggered. For fast small balls, test whether the path intersects the wall, not just its endpoint.' },
          { type: 'note', text: 'Press ⌘S. A ball should bounce cleanly off all four walls without getting stuck or passing through.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const ball = { positionX: 200, positionY: 150, velocityX: 4, velocityY: 3, radius: 20, colour: '#6366f1' }

    // TODO: write updateBall(ball) — move, then check all 4 walls:
    //   left:   positionX - radius <= 0      → positionX = radius;             velocityX = +Math.abs(vx)
    //   right:  positionX + radius >= width  → positionX = width - radius;     velocityX = -Math.abs(vx)
    //   top:    positionY - radius <= 0      → positionY = radius;             velocityY = +Math.abs(vy)
    //   bottom: positionY + radius >= height → positionY = height - radius;    velocityY = -Math.abs(vy)

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
    }

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      // TODO: updateBall(ball); drawBall(ball)
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

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const ball = { positionX: 200, positionY: 150, velocityX: 4, velocityY: 3, radius: 20, colour: '#6366f1' }

    function updateBall(ball) {
      ball.positionX += ball.velocityX; ball.positionY += ball.velocityY
      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;                ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      updateBall(ball); drawBall(ball)
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

      {
        id: 'ball-ball-collision',
        title: 'Multiple balls with collision',
        content: [
          { type: 'build', text: 'Replace the single ball with an array of 8 balls and add ball-to-ball collision detection. Two circles collide when the distance between centres is less than the sum of their radii. The response swaps velocity components along the collision axis.' },
          { type: 'h3', text: 'Ball–ball collision detection and response' },
          { type: 'p', text: 'Two circles overlap when `sqrt((ax-bx)² + (ay-by)²) < ra + rb`. We compare squared distances to avoid `sqrt` in the check — faster when called 28 times per frame for 8 balls.' },
          { type: 'code', text: `const BALL_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6']

const balls = Array.from({ length: 8 }, (_, index) => ({
  positionX: 80 + index * 60,
  positionY: 150 + (index % 2) * 80,
  velocityX: (Math.random() - 0.5) * 6,
  velocityY: (Math.random() - 0.5) * 6,
  radius:    14 + Math.random() * 10,
  colour:    BALL_COLOURS[index],
}))

function resolveBallCollision(ballA, ballB) {
  const deltaX = ballB.positionX - ballA.positionX
  const deltaY = ballB.positionY - ballA.positionY
  const distanceSquared = deltaX * deltaX + deltaY * deltaY
  const minDistance = ballA.radius + ballB.radius

  if (distanceSquared >= minDistance * minDistance) return   // no overlap

  const distance = Math.sqrt(distanceSquared)
  const normalX  = deltaX / distance
  const normalY  = deltaY / distance

  // Project velocities onto collision normal
  const relativeVelocity = (ballA.velocityX - ballB.velocityX) * normalX
                          + (ballA.velocityY - ballB.velocityY) * normalY

  if (relativeVelocity <= 0) return  // already moving apart

  // Apply elastic impulse (equal masses)
  ballA.velocityX -= relativeVelocity * normalX
  ballA.velocityY -= relativeVelocity * normalY
  ballB.velocityX += relativeVelocity * normalX
  ballB.velocityY += relativeVelocity * normalY

  // Push apart to prevent overlap next frame
  const penetration = (minDistance - distance) * 0.5
  ballA.positionX -= normalX * penetration
  ballA.positionY -= normalY * penetration
  ballB.positionX += normalX * penetration
  ballB.positionY += normalY * penetration
}

// Inside draw(), after updating all balls:
for (let indexA = 0; indexA < balls.length; indexA++)
  for (let indexB = indexA + 1; indexB < balls.length; indexB++)
    resolveBallCollision(balls[indexA], balls[indexB])` },
          { type: 'walk', text: '`relativeVelocity` is the dot product of the velocity difference with the collision normal — how fast the two balls approach each other along the axis between centres. Positive = approaching (collision). Zero or negative = already moving apart (skip). Subtracting from A and adding to B transfers momentum along the collision axis — elastic collision for equal masses.\n\n`indexB = indexA + 1` ensures each pair is checked once. 8 balls = 28 checks per frame.' },
          { type: 'cs', text: '**O(n²) collision detection.** For n balls we do n*(n-1)/2 checks. At 8 balls: 28. At 100 balls: 4950. At 1000 balls: 499,500 per frame. For large n, spatial partitioning (grid, quadtree, BVH) reduces this to O(n log n) by skipping pairs too far apart. Our demo is fine with O(n²) up to ~50 balls.' },
          { type: 'se', text: '**Early exit with squared distance.** Comparing `distanceSquared < minDistance * minDistance` avoids `Math.sqrt` in the common case (most pairs are not colliding). `sqrt` is expensive relative to multiplication. For 50 balls at 60fps = 73,500 checks/second — skipping `sqrt` on 99% of them is meaningful.' },
          { type: 'breaks', text: '**No depenetration → balls clump.** Without pushing the balls apart, they overlap next frame, collision fires again, and they get permanently stuck together. The push-apart (each ball moves half the penetration depth outward) ensures they are not touching at the start of the next frame.' },
          { type: 'note', text: 'Press ⌘S. 8 coloured balls should bounce off walls and each other without clumping or passing through.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const BALL_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
    const balls = Array.from({ length: 8 }, (_, index) => ({
      positionX: 80 + index * 60, positionY: 150 + (index % 2) * 80,
      velocityX: (Math.random() - 0.5) * 6, velocityY: (Math.random() - 0.5) * 6,
      radius: 14 + Math.random() * 10, colour: BALL_COLOURS[index],
    }))

    function updateBall(ball) {
      ball.positionX += ball.velocityX; ball.positionY += ball.velocityY
      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;               ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    // TODO: write resolveBallCollision(ballA, ballB):
    //   deltaX, deltaY, distanceSquared
    //   if distanceSquared >= minDist² → return
    //   distance = sqrt, normalX = deltaX/dist, normalY = deltaY/dist
    //   relativeVelocity = dot((vA-vB), normal)
    //   if relVel <= 0 → return
    //   apply impulse to both velocities
    //   push apart by penetration/2 each

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      balls.forEach(updateBall)
      // TODO: double for-loop → resolveBallCollision(balls[a], balls[b]) for b > a
      balls.forEach(drawBall)
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

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const BALL_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
    const balls = Array.from({ length: 8 }, (_, index) => ({
      positionX: 80 + index * 60, positionY: 150 + (index % 2) * 80,
      velocityX: (Math.random() - 0.5) * 6, velocityY: (Math.random() - 0.5) * 6,
      radius: 14 + Math.random() * 10, colour: BALL_COLOURS[index],
    }))

    function updateBall(ball) {
      ball.positionX += ball.velocityX; ball.positionY += ball.velocityY
      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;               ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    function resolveBallCollision(ballA, ballB) {
      const deltaX = ballB.positionX - ballA.positionX
      const deltaY = ballB.positionY - ballA.positionY
      const distanceSquared = deltaX * deltaX + deltaY * deltaY
      const minDistance = ballA.radius + ballB.radius
      if (distanceSquared >= minDistance * minDistance) return
      const distance = Math.sqrt(distanceSquared)
      const normalX  = deltaX / distance; const normalY = deltaY / distance
      const relativeVelocity = (ballA.velocityX - ballB.velocityX) * normalX + (ballA.velocityY - ballB.velocityY) * normalY
      if (relativeVelocity <= 0) return
      ballA.velocityX -= relativeVelocity * normalX; ballA.velocityY -= relativeVelocity * normalY
      ballB.velocityX += relativeVelocity * normalX; ballB.velocityY += relativeVelocity * normalY
      const penetration = (minDistance - distance) * 0.5
      ballA.positionX -= normalX * penetration; ballA.positionY -= normalY * penetration
      ballB.positionX += normalX * penetration; ballB.positionY += normalY * penetration
    }

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      balls.forEach(updateBall)
      for (let a = 0; a < balls.length; a++)
        for (let b = a + 1; b < balls.length; b++)
          resolveBallCollision(balls[a], balls[b])
      balls.forEach(drawBall)
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

      {
        id: 'click-to-spawn',
        title: 'Click to spawn new balls',
        content: [
          { type: 'build', text: 'Add a click listener so clicking the canvas spawns a new ball at the click position with a random velocity and colour. The array grows dynamically. This is the finished Bouncing Balls Sandbox.' },
          { type: 'code', text: `const SPAWN_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6','#f97316','#06b6d4']

function handleCanvasClick(clickEvent) {
  const canvasRect = canvas.getBoundingClientRect()
  balls.push({
    positionX: clickEvent.clientX - canvasRect.left,
    positionY: clickEvent.clientY - canvasRect.top,
    velocityX: (Math.random() - 0.5) * 8,
    velocityY: (Math.random() - 0.5) * 8,
    radius:    12 + Math.random() * 14,
    colour:    SPAWN_COLOURS[Math.floor(Math.random() * SPAWN_COLOURS.length)],
  })
}
canvas.addEventListener('click', handleCanvasClick)

// In cleanup:
return () => {
  cancelAnimationFrame(animationFrameId)
  canvas.removeEventListener('click', handleCanvasClick)
  resizeObserver.disconnect()
}

// Inside draw(), after drawing balls — a live counter label:
ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; ctx.font = '12px system-ui'
ctx.fillText(\`Click to spawn · \${balls.length} balls\`, canvasWidth / 2, canvasHeight - 8)` },
          { type: 'walk', text: '`canvas.getBoundingClientRect()` gives the canvas position in the viewport. `clientX - rect.left` converts to canvas-relative coordinates. `balls.push(newBall)` adds to the array — existing `forEach` and `for` loops in `draw()` pick up the new entry automatically because they iterate over `balls.length` which now includes it. No changes to the simulation code required.' },
          { type: 'cs', text: '**Dynamic arrays and automatic loop coverage.** `Array.push` is O(1) amortised — JavaScript arrays resize automatically (doubling capacity). The simulation loops iterate over `balls.length` each frame, so newly pushed balls enter the simulation immediately. This is the open-closed principle: the system is open to extension (more balls) without modifying existing code.' },
          { type: 'se', text: '**One event, one concern.** `handleCanvasClick` reads the click position, constructs a ball, pushes it. It does not update, draw, or simulate. The simulation loop handles those on the next frame. Single responsibility makes the handler trivially testable and readable in isolation.' },
          { type: 'breaks', text: '**Not removing the click listener → leak.** Every `useEffect` mount attaches a new `handleCanvasClick`. If the component unmounts and remounts, the old listener stays on the old (removed) canvas — a memory leak. If it mounts again on the same canvas, you have two listeners and every click spawns two balls. Always return a cleanup that removes every listener added in the effect.' },
          { type: 'note', text: 'Press ⌘S. Click anywhere to spawn balls. Fill the canvas. The live count at the bottom updates as you add more. This is the finished Bouncing Balls Sandbox.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const SPAWN_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6','#f97316','#06b6d4']
    const balls = Array.from({ length: 8 }, (_, index) => ({
      positionX: 80 + index * 60, positionY: 150 + (index % 2) * 80,
      velocityX: (Math.random() - 0.5) * 6, velocityY: (Math.random() - 0.5) * 6,
      radius: 14 + Math.random() * 10, colour: SPAWN_COLOURS[index % SPAWN_COLOURS.length],
    }))

    function updateBall(ball) {
      ball.positionX += ball.velocityX; ball.positionY += ball.velocityY
      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;               ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    function resolveBallCollision(ballA, ballB) {
      const deltaX = ballB.positionX - ballA.positionX; const deltaY = ballB.positionY - ballA.positionY
      const distanceSquared = deltaX * deltaX + deltaY * deltaY; const minDistance = ballA.radius + ballB.radius
      if (distanceSquared >= minDistance * minDistance) return
      const distance = Math.sqrt(distanceSquared); const normalX = deltaX / distance; const normalY = deltaY / distance
      const relativeVelocity = (ballA.velocityX - ballB.velocityX) * normalX + (ballA.velocityY - ballB.velocityY) * normalY
      if (relativeVelocity <= 0) return
      ballA.velocityX -= relativeVelocity * normalX; ballA.velocityY -= relativeVelocity * normalY
      ballB.velocityX += relativeVelocity * normalX; ballB.velocityY += relativeVelocity * normalY
      const penetration = (minDistance - distance) * 0.5
      ballA.positionX -= normalX * penetration; ballA.positionY -= normalY * penetration
      ballB.positionX += normalX * penetration; ballB.positionY += normalY * penetration
    }

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    // TODO: write handleCanvasClick(clickEvent):
    //   const rect = canvas.getBoundingClientRect()
    //   balls.push({ positionX: clientX - rect.left, positionY: clientY - rect.top, random velocity/radius/colour })
    // TODO: canvas.addEventListener('click', handleCanvasClick)

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      balls.forEach(updateBall)
      for (let a = 0; a < balls.length; a++)
        for (let b = a + 1; b < balls.length; b++)
          resolveBallCollision(balls[a], balls[b])
      balls.forEach(drawBall)
      // TODO: draw a label showing balls.length at bottom centre
      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    // TODO: return cleanup that removes click listener too
    return () => { cancelAnimationFrame(animationFrameId); resizeObserver.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function BouncingBalls() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, animationFrameId

    function resize() {
      const devicePixelRatio = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * devicePixelRatio; canvas.height = canvasHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const SPAWN_COLOURS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6','#f97316','#06b6d4']
    const balls = Array.from({ length: 8 }, (_, index) => ({
      positionX: 80 + index * 60, positionY: 150 + (index % 2) * 80,
      velocityX: (Math.random() - 0.5) * 6, velocityY: (Math.random() - 0.5) * 6,
      radius: 14 + Math.random() * 10, colour: SPAWN_COLOURS[index % SPAWN_COLOURS.length],
    }))

    function updateBall(ball) {
      ball.positionX += ball.velocityX; ball.positionY += ball.velocityY
      if (ball.positionX - ball.radius <= 0)            { ball.positionX = ball.radius;               ball.velocityX =  Math.abs(ball.velocityX) }
      if (ball.positionX + ball.radius >= canvasWidth)  { ball.positionX = canvasWidth - ball.radius;  ball.velocityX = -Math.abs(ball.velocityX) }
      if (ball.positionY - ball.radius <= 0)            { ball.positionY = ball.radius;                ball.velocityY =  Math.abs(ball.velocityY) }
      if (ball.positionY + ball.radius >= canvasHeight) { ball.positionY = canvasHeight - ball.radius; ball.velocityY = -Math.abs(ball.velocityY) }
    }

    function resolveBallCollision(ballA, ballB) {
      const deltaX = ballB.positionX - ballA.positionX; const deltaY = ballB.positionY - ballA.positionY
      const distanceSquared = deltaX * deltaX + deltaY * deltaY; const minDistance = ballA.radius + ballB.radius
      if (distanceSquared >= minDistance * minDistance) return
      const distance = Math.sqrt(distanceSquared); const normalX = deltaX / distance; const normalY = deltaY / distance
      const relativeVelocity = (ballA.velocityX - ballB.velocityX) * normalX + (ballA.velocityY - ballB.velocityY) * normalY
      if (relativeVelocity <= 0) return
      ballA.velocityX -= relativeVelocity * normalX; ballA.velocityY -= relativeVelocity * normalY
      ballB.velocityX += relativeVelocity * normalX; ballB.velocityY += relativeVelocity * normalY
      const penetration = (minDistance - distance) * 0.5
      ballA.positionX -= normalX * penetration; ballA.positionY -= normalY * penetration
      ballB.positionX += normalX * penetration; ballB.positionY += normalY * penetration
    }

    function drawBall(ball) {
      ctx.beginPath(); ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.colour; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke()
    }

    function handleCanvasClick(clickEvent) {
      const canvasRect = canvas.getBoundingClientRect()
      balls.push({
        positionX: clickEvent.clientX - canvasRect.left,
        positionY: clickEvent.clientY - canvasRect.top,
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: (Math.random() - 0.5) * 8,
        radius:    12 + Math.random() * 14,
        colour:    SPAWN_COLOURS[Math.floor(Math.random() * SPAWN_COLOURS.length)],
      })
    }
    canvas.addEventListener('click', handleCanvasClick)

    function draw() {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      balls.forEach(updateBall)
      for (let a = 0; a < balls.length; a++)
        for (let b = a + 1; b < balls.length; b++)
          resolveBallCollision(balls[a], balls[b])
      balls.forEach(drawBall)
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; ctx.font = '12px system-ui'
      ctx.fillText(\`Click to spawn · \${balls.length} balls\`, canvasWidth / 2, canvasHeight - 8)
      animationFrameId = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
    resize(); animationFrameId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animationFrameId)
      canvas.removeEventListener('click', handleCanvasClick)
      resizeObserver.disconnect()
    }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

]
