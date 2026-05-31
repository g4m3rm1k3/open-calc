import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DroneLab from '../components/tools/DroneLab.jsx'

function SkyBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles, raf

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.4,
        size: 0.5 + Math.random() * 1.5,
        opacity: 0.02 + Math.random() * 0.08,
        hue: Math.random() < 0.6 ? 200 : 160,
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: 80 }, () => {
        const p = makeParticle()
        p.y = Math.random() * H
        return p
      })
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -4 || p.x < -4 || p.x > W + 4) Object.assign(p, makeParticle(), { y: H + 2 })
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

export default function DroneLabPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Drone Lab — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at 30% 0%, #091825 0%, #07090f 60%, #080a14 100%)',
      overflow: 'hidden',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <SkyBg />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1400px', height: '100%' }}>
        <DroneLab onBack={() => navigate('/labs')} />
      </div>
    </div>
  )
}
