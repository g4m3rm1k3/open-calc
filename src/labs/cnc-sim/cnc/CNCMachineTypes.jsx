import { useState, useEffect } from 'react'

function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const MACHINES = [
  {
    id: 'vmc',
    name: 'Vertical Machining Center',
    short: 'Spindle points down. The workhorse of every shop.',
    icon: '⬇',
    colorKey: 'purple',
    specs: { Axes: '3 standard, 4–5 optional', Spindle: '8,000–30,000 RPM', 'Typical parts': 'Plates, molds, brackets, housings', 'G-code notes': 'Full G-code + canned cycles (G81–G89)' },
    detail: `The VMC is the most common CNC machine in the world. The spindle is vertical — it points straight down at the workpiece. The table moves in X and Y; the spindle moves in Z. Parts are held in a vise or fixture on the table.\n\nVMCs excel at prismatic parts — things with flat faces, pockets, holes. They're less efficient at round features, which belong on a lathe. Common brands: Haas, DMG Mori, Mazak, Makino.\n\nTypical application: An aluminum housing for an electric motor. Drill the mounting holes, mill the mating faces, pocket the motor bore — all in one or two setups on a VMC.`,
  },
  {
    id: 'hmc',
    name: 'Horizontal Machining Center',
    short: 'Spindle horizontal. Built for production runs.',
    icon: '→',
    colorKey: 'blue',
    specs: { Axes: '4 (pallet rotary standard)', Spindle: '6,000–20,000 RPM', 'Typical parts': 'Engine blocks, transmission cases', 'G-code notes': 'Same G-code, different coordinate frame' },
    detail: `In an HMC, the spindle is horizontal. The workpiece sits on a rotary pallet that faces the spindle. This geometry makes chip clearing dramatically better — chips fall away from the cut by gravity instead of piling up in pockets. On long production runs, this matters enormously.\n\nHMCs almost always include two pallets — one being machined while the other is being loaded/unloaded, overlapping cutting time with setup time.\n\nTypical application: Automotive engine blocks. High volume, tight tolerances, deep bores. An HMC can hit all four sides of a block in one program using the rotary B-axis.`,
  },
  {
    id: 'lathe',
    name: 'CNC Lathe / Turning Center',
    short: 'Part spins, tool moves. For round parts.',
    icon: '○',
    colorKey: 'teal',
    specs: { Axes: '2 (X/Z), live tooling adds Y/C', Spindle: '50–6,000 RPM (part rotation)', 'Typical parts': 'Shafts, flanges, fittings, pins', 'G-code notes': 'G96 CSS, G71 rough turn, G76 thread' },
    detail: `On a lathe, the workpiece rotates and the cutting tool moves. X controls diameter (positive = larger diameter); Z controls length (positive = toward tailstock).\n\nTurning-specific G-codes:\n• G96 – Constant Surface Speed: RPM adjusts automatically as diameter changes to maintain constant SFM\n• G97 – Constant RPM (cancels G96)\n• G71 – Rough turning cycle (multi-pass)\n• G76 – Thread cutting cycle\n\nTypical application: A hydraulic fitting. Turn the OD, bore the ID, cut the threads, part off — all in one program.`,
  },
  {
    id: '5axis',
    name: 'Multi-Axis (4 & 5-Axis)',
    short: 'Rotary axes for complex geometry.',
    icon: '✦',
    colorKey: 'amber',
    specs: { Axes: '4 (A or B added) or 5 (A+B or A+C)', Spindle: '15,000–40,000 RPM', 'Typical parts': 'Impellers, blisks, medical implants', 'G-code notes': 'G43.4/G43.5 TCPM required for simultaneous' },
    detail: `4-axis and 5-axis machines add rotary axes (A rotates around X, B around Y, C around Z) to the standard 3-axis setup, allowing the tool to approach the workpiece from multiple angles without re-fixturing.\n\n3+2 (positioning) vs simultaneous 5-axis: Positioning means rotating to a fixed angle, locking, then cutting in 3 axes — simpler. Simultaneous moves all five axes at once — required for turbine blades and impellers but exponentially more complex to program.\n\nTCPM (Tool Center Point Management, G43.4 on Fanuc): When a rotary axis moves, the tool tip travels in an arc. TCPM automatically compensates, keeping the tip on the programmed path.`,
  },
  {
    id: 'router',
    name: 'CNC Router',
    short: 'High-speed, low-force for soft materials.',
    icon: '~',
    colorKey: 'green',
    specs: { Axes: '3 standard', Spindle: '18,000–60,000 RPM', 'Typical parts': 'Signs, furniture, molds, composites', 'G-code notes': 'Often Mach3/LinuxCNC/grbl dialect' },
    detail: `CNC routers look like VMCs but are built for lower-force, higher-speed cutting of soft materials — wood, MDF, foam, plastics, and thin aluminum sheet. The machine structure can be lighter (and cheaper) because cutting forces are much lower.\n\nRouters typically use open-loop stepper motors or lighter servos — lower positional accuracy, no following-error detection. For cabinet parts, signs, and foam molds, this is fine. For tight-tolerance aluminum, use a VMC.\n\nController dialects: Many routers run Mach3/Mach4 (Windows-based), LinuxCNC, or grbl (hobbyist). These run standard G-code with minor variations.`,
  },
  {
    id: 'wedm',
    name: 'Wire EDM',
    short: 'Cuts with electricity through a wire.',
    icon: '⚡',
    colorKey: 'coral',
    specs: { Axes: '4 (X/Y/U/V for taper)', Spindle: 'None — no spindle', 'Typical parts': 'Dies, punches, extrusion tooling', 'G-code notes': 'G-code variant, machine-specific' },
    detail: `Wire EDM (Electrical Discharge Machining) erodes material with controlled electrical sparks between a thin brass wire and the workpiece. The wire is continuously fed from a spool so it never dulls. Cutting happens in deionized water that flushes away eroded particles.\n\nWhat makes it unique: cuts any electrically conductive material regardless of hardness. Hardened D2 tool steel and carbide cut at the same rate as soft steel. This is the go-to process for hardened dies and molds.\n\nTolerance: ±0.002mm is routine. ±0.001mm is achievable with a finishing pass — better than most grinding. Limitation: only cuts through-features; no pockets.`,
  },
  {
    id: 'flat',
    name: 'Laser / Plasma / Waterjet',
    short: 'Sheet cutting — X/Y path, through-cut in Z.',
    icon: '▲',
    colorKey: 'red',
    specs: { Axes: '2.5D (X/Y path, Z focus/standoff)', Spindle: 'None', 'Typical parts': 'Sheet metal, gaskets, panels', 'G-code notes': 'M-codes control beam/arc/jet on/off' },
    detail: `Three different technologies, nearly identical programming structure. All are 2.5D: X/Y motion traces the cut profile, Z sets focus or standoff distance.\n\nLaser: Focused beam melts/vaporizes material. Fast, fine kerf (0.1–0.3mm), excellent for sheet metal up to ~25mm. Leaves heat-affected zone.\n\nPlasma: Ionized gas arc. Much faster than laser on thick plate (>12mm), coarser kerf (~1–3mm). Cheap to run.\n\nWaterjet: High-pressure water + abrasive garnet. No heat — cuts composites, glass, stone, titanium. Slow but zero heat-affected zone.\n\nG-code note: M62/M63 or machine-specific codes control beam on/off. Feedrate controls cut quality as much as beam parameters.`,
  },
]

const COLORS = {
  purple: { light: { card: '#EEEDFE', border: '#AFA9EC', title: '#26215C', sub: '#534AB7', icon: '#534AB7', iconBg: '#EEEDFE' }, dark: { card: '#1e1a3f', border: '#534AB7', title: '#EEEDFE', sub: '#AFA9EC', icon: '#AFA9EC', iconBg: '#26215C' } },
  blue:   { light: { card: '#E6F1FB', border: '#85B7EB', title: '#042C53', sub: '#185FA5', icon: '#185FA5', iconBg: '#E6F1FB' }, dark: { card: '#0a1e35', border: '#378ADD', title: '#E6F1FB', sub: '#B5D4F4', icon: '#B5D4F4', iconBg: '#042C53' } },
  teal:   { light: { card: '#E1F5EE', border: '#5DCAA5', title: '#04342C', sub: '#0F6E56', icon: '#0F6E56', iconBg: '#E1F5EE' }, dark: { card: '#041f1b', border: '#1D9E75', title: '#E1F5EE', sub: '#9FE1CB', icon: '#9FE1CB', iconBg: '#04342C' } },
  amber:  { light: { card: '#FAEEDA', border: '#EF9F27', title: '#412402', sub: '#854F0B', icon: '#854F0B', iconBg: '#FAEEDA' }, dark: { card: '#2a1800', border: '#BA7517', title: '#FAEEDA', sub: '#FAC775', icon: '#FAC775', iconBg: '#412402' } },
  green:  { light: { card: '#EAF3DE', border: '#97C459', title: '#173404', sub: '#3B6D11', icon: '#3B6D11', iconBg: '#EAF3DE' }, dark: { card: '#0f2200', border: '#639922', title: '#EAF3DE', sub: '#C0DD97', icon: '#C0DD97', iconBg: '#173404' } },
  coral:  { light: { card: '#FAECE7', border: '#F0997B', title: '#4A1B0C', sub: '#993C1D', icon: '#993C1D', iconBg: '#FAECE7' }, dark: { card: '#2a0e06', border: '#D85A30', title: '#FAECE7', sub: '#F5C4B3', icon: '#F5C4B3', iconBg: '#4A1B0C' } },
  red:    { light: { card: '#FCEBEB', border: '#F09595', title: '#501313', sub: '#A32D2D', icon: '#A32D2D', iconBg: '#FCEBEB' }, dark: { card: '#200808', border: '#E24B4A', title: '#FCEBEB', sub: '#F7C1C1', icon: '#F7C1C1', iconBg: '#501313' } },
}

export default function CNCMachineTypes({ params = {} }) {
  const dark = useIsDark()
  const [activeId, setActiveId] = useState(null)

  const C = {
    bg:      dark ? '#0f172a' : '#ffffff',
    surface: dark ? '#1e293b' : '#f8fafc',
    border:  dark ? '#334155' : '#e2e8f0',
    text:    dark ? '#f1f5f9' : '#0f172a',
    muted:   dark ? '#94a3b8' : '#475569',
    hint:    dark ? '#475569' : '#94a3b8',
    specBg:  dark ? '#0f172a' : '#ffffff',
  }

  const active = activeId ? MACHINES.find(m => m.id === activeId) : null

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
        {MACHINES.map(m => {
          const col = dark ? COLORS[m.colorKey].dark : COLORS[m.colorKey].light
          const isActive = activeId === m.id
          return (
            <div
              key={m.id}
              onClick={() => setActiveId(isActive ? null : m.id)}
              style={{
                background: isActive ? col.card : C.surface,
                border: `${isActive ? 2 : 1}px solid ${isActive ? col.border : C.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: col.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, marginBottom: 8,
              }}>
                <span style={{ color: col.icon }}>{m.icon}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? col.title : C.text, marginBottom: 3, lineHeight: 1.3 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: isActive ? col.sub : C.hint, lineHeight: 1.4 }}>{m.short}</div>
            </div>
          )
        })}
      </div>

      {/* Detail */}
      {active && (() => {
        const col = dark ? COLORS[active.colorKey].dark : COLORS[active.colorKey].light
        return (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 10 }}>{active.name}</div>
            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6, marginBottom: 12 }}>
              {Object.entries(active.specs).map(([k, v]) => (
                <div key={k} style={{ background: C.specBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px' }}>
                  <div style={{ fontSize: 10, color: C.hint, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Long detail */}
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{active.detail}</div>
          </div>
        )
      })()}
    </div>
  )
}
