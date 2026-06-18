import { useEffect, useRef } from 'react'
import { NODES, EDGES } from '../../data/codebaseGraph.js'

// Adjacency list for hover highlight
const ADJ = Array.from({ length: NODES.length }, () => [])
for (const [a, b] of EDGES) { ADJ[a].push(b); ADJ[b].push(a) }

// App.jsx is the hub — start view centred on it
const APP_IDX = NODES.findIndex(n => n.id === 'App.jsx')

function project(x, y, z, rx, ry, scale, fov) {
  const x1 =  x * Math.cos(ry) + z * Math.sin(ry)
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry)
  const y2 = y  * Math.cos(rx) - z1 * Math.sin(rx)
  const z2 = y  * Math.sin(rx) + z1 * Math.cos(rx)
  const d  = fov + z2
  return { px: (x1 * scale) / d, py: (y2 * scale) / d, sz: z2 }
}

export default function CodeMapBackground({ dark }) {
  const canvasRef = useRef(null)
  const labelRef  = useRef(null)
  const darkRef   = useRef(dark)
  useEffect(() => { darkRef.current = dark }, [dark])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const FOV  = 5
    const ZOOM = 10  // start zoomed in on App.jsx cluster

    const st = {
      rx: 0.22, ry: 0.35,
      zoom: ZOOM,
      panX: 0, panY: 0,
      drag: null, rxD: 0, ryD: 0, panXD: 0, panYD: 0, isPan: false,
      mx: -99999, my: -99999,
      hovered: -1,
      centred: false,
    }

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Left-drag = rotate │ Shift+drag = pan
    const ISEL = 'a,button,input,select,textarea,[role="button"],[tabindex]'
    // Returns true when the element is inside a UI panel (sidebar, topbar, modal…)
    // that should keep its native scroll/click behaviour.
    const isOverUI = target => {
      let el = target
      while (el && el !== document.documentElement) {
        const s = getComputedStyle(el)
        if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return true
        if (s.position === 'fixed' && parseInt(s.zIndex, 10) > 0) return true
        el = el.parentElement
      }
      return false
    }

    const onDown = e => {
      if (e.target.closest(ISEL)) return
      if (isOverUI(e.target)) return
      st.drag = { x: e.clientX, y: e.clientY }
      st.isPan = e.shiftKey
      st.rxD = st.rx; st.ryD = st.ry
      st.panXD = st.panX; st.panYD = st.panY
    }
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      st.mx = (e.clientX - rect.left) * devicePixelRatio
      st.my = (e.clientY - rect.top)  * devicePixelRatio
      if (!st.drag) return
      if (st.isPan || e.shiftKey) {
        st.panX = st.panXD + (e.clientX - st.drag.x) * devicePixelRatio
        st.panY = st.panYD + (e.clientY - st.drag.y) * devicePixelRatio
      } else {
        const rect2 = canvas.getBoundingClientRect()
        const dx = (e.clientX - st.drag.x) / rect2.width
        const dy = (e.clientY - st.drag.y) / rect2.height
        st.ry = st.ryD + dx * 5
        st.rx = Math.max(-1.4, Math.min(1.4, st.rxD + dy * 3))
      }
    }
    const onUp = () => { st.drag = null }

    const onWheel = e => {
      if (isOverUI(e.target)) return
      e.preventDefault()
      const rect  = canvas.getBoundingClientRect()
      const mx    = (e.clientX - rect.left) * devicePixelRatio
      const my    = (e.clientY - rect.top)  * devicePixelRatio
      const W = canvas.width, H = canvas.height
      const f     = e.deltaY < 0 ? 1.12 : 1 / 1.12
      const nz    = Math.max(0.15, Math.min(16, st.zoom * f))
      const ratio = nz / st.zoom
      const cx = W / 2 + st.panX, cy = H / 2 + st.panY
      st.panX += (mx - cx) * (1 - ratio)
      st.panY += (my - cy) * (1 - ratio)
      st.zoom = nz
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('wheel', onWheel, { passive: false })

    let raf = null

    const draw = () => {
      const ctx  = canvas.getContext('2d')
      const W    = canvas.width, H = canvas.height
      const dpr  = devicePixelRatio
      const isDark = darkRef.current
      ctx.clearRect(0, 0, W, H)

      const BASE  = Math.min(W, H) * 0.22
      const scale = BASE * st.zoom

      // On first real frame, snap pan so App.jsx is screen-centre
      if (!st.centred && APP_IDX >= 0) {
        st.centred = true
        const n = NODES[APP_IDX]
        const p = project(n.x, n.y, n.z, st.rx, st.ry, scale, FOV)
        st.panX = -p.px
        st.panY = -p.py
      }

      const ox = W / 2 + st.panX
      const oy = H / 2 + st.panY

      // Project + index
      const projByIdx = new Array(NODES.length)
      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i]
        const p = project(n.x, n.y, n.z, st.rx, st.ry, scale, FOV)
        projByIdx[i] = { sx: ox + p.px, sy: oy + p.py, sz: p.sz, n, i }
      }

      // Sort back-to-front
      const sorted = projByIdx.slice().sort((a, b) => a.sz - b.sz)

      // Hover — nearest within 26 css-px
      let hovIdx = -1, minD = 26 * dpr
      for (const p of sorted) {
        const d = Math.hypot(p.sx - st.mx, p.sy - st.my)
        if (d < minD) { minD = d; hovIdx = p.i }
      }
      const hovSet = hovIdx >= 0 ? new Set(ADJ[hovIdx]) : null
      const anyHov = hovIdx >= 0

      // depth factor [0..1], nearer = higher
      const df = sz => Math.max(0, Math.min(1, (sz + FOV) / (FOV * 2)))

      // ── Pass 1: NEBULA GLOW (additive 'lighter' blend) ─────────────────────
      // 'lighter' = true additive: overlapping glows from nearby nodes literally
      // sum their RGB values → dense clusters blaze, sparse areas glow softly.
      // This is what particle FX / space sims use for the nebula look.
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      for (const { sx, sy, sz, n, i } of sorted) {
        if (sx < -400 || sx > W + 400 || sy < -400 || sy > H + 400) continue
        const isHov  = i === hovIdx
        const isNbr  = !isHov && hovSet?.has(i)
        const depth  = df(sz)
        const [r, g, b] = n.rgb
        const coreR  = (n.size * 4 + 4) * dpr

        // Each node gets TWO glow rings that spread far beyond the core.
        // Hub nodes (large size) cast enormous halos that define visible clusters.
        const intensity = isHov ? 0.55 : isNbr ? 0.35 : (0.10 + depth * 0.12)

        // Outer cloud — large, very soft
        const outerR = coreR * (isHov ? 28 : 20)
        const g1 = ctx.createRadialGradient(sx, sy, 0, sx, sy, outerR)
        g1.addColorStop(0,    `rgba(${r},${g},${b},${(intensity * 0.30).toFixed(3)})`)
        g1.addColorStop(0.2,  `rgba(${r},${g},${b},${(intensity * 0.10).toFixed(3)})`)
        g1.addColorStop(0.6,  `rgba(${r},${g},${b},${(intensity * 0.025).toFixed(3)})`)
        g1.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = g1
        ctx.beginPath(); ctx.arc(sx, sy, outerR, 0, Math.PI * 2); ctx.fill()

        // Inner corona — tighter
        const innerR = coreR * (isHov ? 8 : 5)
        const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, innerR)
        g2.addColorStop(0,   `rgba(${r},${g},${b},${(intensity * 0.55).toFixed(3)})`)
        g2.addColorStop(0.4, `rgba(${r},${g},${b},${(intensity * 0.18).toFixed(3)})`)
        g2.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = g2
        ctx.beginPath(); ctx.arc(sx, sy, innerR, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()

      // ── Pass 2: EDGES ──────────────────────────────────────────────────────
      ctx.save()
      for (const [ai, bi] of EDGES) {
        const a = projByIdx[ai], b = projByIdx[bi]
        if (!a || !b) continue
        if (Math.max(a.sx, b.sx) < -60 || Math.min(a.sx, b.sx) > W + 60) continue
        if (Math.max(a.sy, b.sy) < -60 || Math.min(a.sy, b.sy) > H + 60) continue

        const isHot = anyHov && (ai === hovIdx || bi === hovIdx)
        const depth = df((a.sz + b.sz) / 2)
        const [r, g, bb] = a.n.rgb
        const alpha = isHot
          ? (isDark ? 0.85 : 0.70)
          : (isDark ? 0.08 + depth * 0.18 : 0.05 + depth * 0.12)
        ctx.strokeStyle = `rgba(${r},${g},${bb},${alpha})`
        ctx.lineWidth   = isHot ? 1.8 : 0.9
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke()
      }
      ctx.restore()

      // ── Pass 3: SPHERE CORES (back→front) ──────────────────────────────────
      for (const { sx, sy, sz, n, i } of sorted) {
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue

        const isHov  = i === hovIdx
        const isNbr  = !isHov && hovSet?.has(i)
        const isGray = anyHov && !isHov && !isNbr
        const depth  = df(sz)
        const [r, g, b] = n.rgb
        const coreR  = (n.size * 4 + 4) * dpr * (isHov ? 2.1 : isNbr ? 1.45 : 1)

        const bright = (c) => Math.min(255, c + 90)
        const dark_  = (c) => Math.round(c * 0.35)
        const ca = isGray
          ? 0.22
          : (isDark ? 0.65 + depth * 0.35 : 0.50 + depth * 0.40)

        // Sphere illusion: off-centre highlight at top-left
        const sGrd = ctx.createRadialGradient(
          sx - coreR * 0.30, sy - coreR * 0.30, coreR * 0.05,
          sx, sy, coreR
        )
        sGrd.addColorStop(0,    `rgba(${bright(r)},${bright(g)},${bright(b)},${ca.toFixed(2)})`)
        sGrd.addColorStop(0.40, `rgba(${r},${g},${b},${ca.toFixed(2)})`)
        sGrd.addColorStop(1,    `rgba(${dark_(r)},${dark_(g)},${dark_(b)},${(ca * 0.7).toFixed(2)})`)
        ctx.beginPath(); ctx.arc(sx, sy, coreR, 0, Math.PI * 2)
        ctx.fillStyle = sGrd; ctx.fill()

        // Specular pinpoint
        if (isHov || isNbr || depth > 0.55) {
          ctx.beginPath()
          ctx.arc(sx - coreR * 0.26, sy - coreR * 0.26, coreR * 0.28, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${isHov ? 0.90 : isNbr ? 0.50 : 0.28 * depth})`
          ctx.fill()
        }

        if (isHov) {
          ctx.font      = `bold ${Math.round(11 * dpr)}px ui-monospace,monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(10,5,40,0.95)'
          ctx.fillText(n.label, sx, sy - coreR - 4 * dpr)
        }
      }

      // ── Tooltip ──────────────────────────────────────────────────────────────
      const lbl = labelRef.current
      if (lbl) {
        if (hovIdx >= 0) {
          const p    = projByIdx[hovIdx]
          const rect = canvas.getBoundingClientRect()
          lbl.style.left    = `${p.sx / dpr + rect.left + 16}px`
          lbl.style.top     = `${p.sy / dpr + rect.top  - 48}px`
          lbl.style.opacity = '1'
          const n = NODES[hovIdx]
          const [r, g, b] = n.rgb
          lbl.style.color   = `rgb(${r},${g},${b})`
          lbl.innerHTML     = `<span style="opacity:0.5;font-size:10px">${n.folder}/</span><br/><b>${n.label}</b><br/><span style="opacity:0.4;font-size:9px">${n.id}</span>`
        } else {
          lbl.style.opacity = '0'
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  const bg = dark
    ? 'radial-gradient(ellipse 130% 90% at 20% 10%, #0c0820 0%, #060612 50%, #020208 100%)'
    : 'radial-gradient(ellipse 130% 90% at 20% 10%, #eef2ff 0%, #f4f4ff 50%, #ffffff 100%)'

  return (
    <>
      <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 0, background: bg }} />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full select-none pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div
        ref={labelRef}
        className="fixed pointer-events-none font-mono leading-snug px-3 py-2 rounded-xl transition-opacity duration-75 whitespace-nowrap"
        style={{
          zIndex: 1, opacity: 0, fontSize: 11,
          background: dark ? 'rgba(4,3,18,0.88)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.7)' : '0 4px 16px rgba(0,0,0,0.18)',
          border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
        }}
      />
    </>
  )
}
