import { useState, useEffect, useRef, useCallback } from 'react'

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

function Track({ label, commandedPct, actualPct, C }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ position: 'relative', height: 36, background: C.trackBg, borderRadius: 6, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {/* Rail */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: C.rail, transform: 'translateY(-50%)' }} />
        {/* Commanded (ghost) */}
        <div style={{
          position: 'absolute', top: 4, width: 28, height: 28, borderRadius: '50%',
          background: 'transparent', border: `2px dashed ${C.commanded}`,
          left: `calc(${commandedPct}% - 14px)`,
          transition: 'left .04s linear',
        }} />
        {/* Actual (solid) */}
        <div style={{
          position: 'absolute', top: 4, width: 28, height: 28, borderRadius: '50%',
          background: C.actual, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
          left: `calc(${actualPct}% - 14px)`,
          transition: 'left .04s linear',
        }}>
          ●
        </div>
      </div>
    </div>
  )
}

function LogPane({ lines, C }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])
  return (
    <div ref={ref} style={{
      fontFamily: 'monospace', fontSize: 11, background: C.logBg,
      border: `1px solid ${C.border}`, borderRadius: 6, padding: 8,
      height: 90, overflowY: 'auto', marginTop: 8,
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.type === 'ok' ? C.ok : l.type === 'warn' ? C.warn : l.type === 'alarm' ? C.alarm : C.muted, lineHeight: 1.6 }}>
          {l.text}
        </div>
      ))}
    </div>
  )
}

function StatChip({ label, value, C, highlight }) {
  return (
    <div style={{ background: C.chipBg, border: `1px solid ${highlight ? C.alarm : C.border}`, borderRadius: 6, padding: '5px 10px', minWidth: 100 }}>
      <div style={{ fontSize: 10, color: C.hint, marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: highlight ? C.alarm : C.text, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  )
}

const TABS = ['Servo (closed-loop)', 'Stepper (open-loop)', 'Side by side']

export default function CNCClosedLoopSim({ params = {} }) {
  const dark = useIsDark()
  const [tab, setTab] = useState(0)

  // Servo state
  const [srvCmdPct, setSrvCmdPct] = useState(4)
  const [srvActPct, setSrvActPct] = useState(4)
  const [srvPos, setSrvPos]       = useState(0)
  const [srvErr, setSrvErr]       = useState(0)
  const [srvStatus, setSrvStatus] = useState('READY')
  const [srvLogs, setSrvLogs]     = useState([{ type: 'ok', text: 'Controller ready.' }])
  const [srvRunning, setSrvRunning] = useState(false)
  const srvRaf = useRef(null)
  const srvState = useRef({ pos: 0, done: false, alarm: false })

  // Stepper state
  const [stpCmdPct, setStpCmdPct] = useState(4)
  const [stpActPct, setStpActPct] = useState(4)
  const [stpCmd, setStpCmd]       = useState(0)
  const [stpActual, setStpActual] = useState(0)
  const [stpLost, setStpLost]     = useState(0)
  const [stpLogs, setStpLogs]     = useState([{ type: 'ok', text: 'Controller ready.' }])
  const [stpRunning, setStpRunning] = useState(false)
  const stpRaf = useRef(null)
  const stpState = useRef({ cmd: 0, actual: 0, lost: 0, done: false })

  const C = {
    bg:       dark ? '#0f172a' : '#ffffff',
    surface:  dark ? '#1e293b' : '#f8fafc',
    border:   dark ? '#334155' : '#e2e8f0',
    text:     dark ? '#f1f5f9' : '#0f172a',
    muted:    dark ? '#94a3b8' : '#475569',
    hint:     dark ? '#475569' : '#94a3b8',
    tabActive:dark ? '#3730a3' : '#4338ca',
    tabBg:    dark ? '#1e293b' : '#f1f5f9',
    trackBg:  dark ? '#0f172a' : '#f1f5f9',
    rail:     dark ? '#334155' : '#cbd5e1',
    commanded:dark ? '#818cf8' : '#6366f1',
    actual:   dark ? '#38bdf8' : '#0284c7',
    actualStep:dark ? '#fb923c' : '#ea580c',
    logBg:    dark ? '#020617' : '#f8fafc',
    chipBg:   dark ? '#1e293b' : '#f1f5f9',
    ok:       dark ? '#4ade80' : '#16a34a',
    warn:     dark ? '#fbbf24' : '#d97706',
    alarm:    dark ? '#f87171' : '#dc2626',
    btnBlue:  dark ? '#1d4ed8' : '#2563eb',
    btnGray:  dark ? '#334155' : '#e2e8f0',
  }

  const addSrvLog = (text, type) => setSrvLogs(l => [...l, { text, type }])
  const addStpLog = (text, type) => setStpLogs(l => [...l, { text, type }])

  // --- Servo sim ---
  const resetServo = useCallback(() => {
    if (srvRaf.current) cancelAnimationFrame(srvRaf.current)
    setSrvRunning(false)
    srvState.current = { pos: 0, done: false, alarm: false }
    setSrvCmdPct(4); setSrvActPct(4); setSrvPos(0); setSrvErr(0)
    setSrvStatus('READY')
    setSrvLogs([{ type: 'ok', text: 'Controller reset. Ready.' }])
  }, [])

  const runServo = useCallback((withLoad) => {
    resetServo()
    setTimeout(() => {
      setSrvRunning(true)
      srvState.current = { pos: 0, done: false, alarm: false, withLoad }
      addSrvLog(withLoad ? 'N010 G01 X100.0 F500  (HEAVY CUT)' : 'N010 G01 X100.0 F500', 'ok')

      const step = () => {
        const s = srvState.current
        if (s.done || s.alarm) return

        const loadSpike = s.withLoad && Math.sin(s.pos * 0.18) > 0.6
        const inc = loadSpike ? 0.7 : 1.4
        s.pos = Math.min(100, s.pos + inc)

        const fe = loadSpike ? (Math.random() * 1.2 + 0.4) : (Math.random() * 0.003)

        const cmdPct = 4 + (s.pos / 100) * 88
        const actPct = 4 + (s.pos / 100) * 88 - (fe * 0.4)

        setSrvCmdPct(cmdPct)
        setSrvActPct(actPct)
        setSrvPos(s.pos)
        setSrvErr(+fe.toFixed(3))

        if (fe > 0.9 && s.withLoad) {
          s.alarm = true
          setSrvStatus('ALARM 411')
          setSrvRunning(false)
          addSrvLog('ALARM 411: Excessive following error — E-STOP triggered', 'alarm')
          addSrvLog(`Position at stop: ${s.pos.toFixed(3)}mm  |  Error: ${fe.toFixed(3)}mm`, 'warn')
          addSrvLog('Machine stopped safely. Position is KNOWN. Overload detected.', 'ok')
          return
        }

        if (s.pos >= 100) {
          s.done = true
          setSrvStatus('IN POSITION')
          setSrvRunning(false)
          addSrvLog(`✓ In-position: X100.000  |  Following error: ${fe.toFixed(4)}mm`, 'ok')
          addSrvLog('Encoder confirms: actual position matches commanded.', 'ok')
          return
        }

        srvRaf.current = requestAnimationFrame(step)
      }
      srvRaf.current = requestAnimationFrame(step)
    }, 50)
  }, [resetServo])

  // --- Stepper sim ---
  const resetStepper = useCallback(() => {
    if (stpRaf.current) cancelAnimationFrame(stpRaf.current)
    setStpRunning(false)
    stpState.current = { cmd: 0, actual: 0, lost: 0, done: false }
    setStpCmdPct(4); setStpActPct(4); setStpCmd(0); setStpActual(0); setStpLost(0)
    setStpLogs([{ type: 'ok', text: 'Controller reset. Ready.' }])
  }, [])

  const runStepper = useCallback((withLoad) => {
    resetStepper()
    setTimeout(() => {
      setStpRunning(true)
      stpState.current = { cmd: 0, actual: 0, lost: 0, done: false, withLoad }
      addStpLog(withLoad ? 'N010 G01 X100.0 F500  (HEAVY CUT)' : 'N010 G01 X100.0 F500', 'ok')

      const step = () => {
        const s = stpState.current
        if (s.done) return

        s.cmd = Math.min(100, s.cmd + 1.4)
        const missChance = s.withLoad ? 0.14 + Math.random() * 0.08 : 0.004
        const missed = Math.random() < missChance
        if (missed) { s.lost++; s.actual = Math.min(100, s.actual + 0.2) }
        else { s.actual = Math.min(100, s.actual + 1.4) }

        const cmdPct = 4 + (s.cmd / 100) * 88
        const actPct = 4 + (s.actual / 100) * 88

        setStpCmdPct(cmdPct)
        setStpActPct(actPct)
        setStpCmd(+s.cmd.toFixed(3))
        setStpActual(+s.actual.toFixed(3))
        setStpLost(s.lost)

        if (s.cmd >= 100) {
          s.done = true
          setStpRunning(false)
          const err = Math.abs(s.cmd - s.actual)
          addStpLog(`Program complete. Commanded: 100.000mm`, 'ok')
          if (s.lost > 0) {
            addStpLog(`Actual position: ${s.actual.toFixed(3)}mm  |  Error: ${err.toFixed(3)}mm`, 'alarm')
            addStpLog(`Lost ${s.lost} steps. Controller thinks position is correct. No alarm fired.`, 'alarm')
          } else {
            addStpLog(`Actual: ${s.actual.toFixed(3)}mm — No steps lost this run.`, 'ok')
          }
          return
        }

        stpRaf.current = requestAnimationFrame(step)
      }
      stpRaf.current = requestAnimationFrame(step)
    }, 50)
  }, [resetStepper])

  useEffect(() => () => {
    if (srvRaf.current) cancelAnimationFrame(srvRaf.current)
    if (stpRaf.current) cancelAnimationFrame(stpRaf.current)
  }, [])

  const btn = (label, onClick, variant = 'blue') => (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
      background: variant === 'blue' ? C.btnBlue : variant === 'red' ? C.alarm : C.btnGray,
      color: variant === 'gray' ? C.text : '#fff',
    }}>{label}</button>
  )

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${tab === i ? C.tabActive : C.border}`,
            background: tab === i ? C.tabActive : C.tabBg,
            color: tab === i ? '#fff' : C.muted,
            fontSize: 12, fontWeight: tab === i ? 600 : 400, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* SERVO TAB */}
      {tab === 0 && (
        <div>
          <Track label="Axis position  ○ commanded  ● actual" commandedPct={srvCmdPct} actualPct={srvActPct} C={{ ...C, actual: C.actual }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <StatChip label="Position (mm)" value={srvPos.toFixed(3)} C={C} />
            <StatChip label="Following error" value={`${srvErr.toFixed(3)} mm`} C={C} highlight={srvErr > 0.5} />
            <StatChip label="Status" value={srvStatus} C={C} highlight={srvStatus.startsWith('ALARM')} />
          </div>
          <LogPane lines={srvLogs} C={C} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {btn('▶ Run (no load)', () => runServo(false))}
            {btn('▶ Run (heavy cut)', () => runServo(true))}
            {btn('↺ Reset', resetServo, 'gray')}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.65 }}>
            <strong style={{ color: C.text }}>How it works:</strong> An encoder on the servo motor shaft measures actual position continuously. The controller computes following error every interpolation cycle. Under heavy cutting load the error grows — and when it exceeds threshold, the machine triggers Alarm 411 and stops. That alarm is the system <em>working as designed</em>: it detected overload and stopped safely before damage could compound.
          </p>
        </div>
      )}

      {/* STEPPER TAB */}
      {tab === 1 && (
        <div>
          <Track label="Commanded position  ○ commanded  ● actual" commandedPct={stpCmdPct} actualPct={stpActPct} C={{ ...C, actual: C.actualStep }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <StatChip label="Commanded (mm)" value={stpCmd.toFixed(3)} C={C} />
            <StatChip label="Actual (mm)" value={stpActual.toFixed(3)} C={C} />
            <StatChip label="Lost steps" value={stpLost} C={C} highlight={stpLost > 0} />
          </div>
          <LogPane lines={stpLogs} C={C} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {btn('▶ Run (no load)', () => runStepper(false))}
            {btn('▶ Run (heavy cut)', () => runStepper(true))}
            {btn('↺ Reset', resetStepper, 'gray')}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.65 }}>
            <strong style={{ color: C.text }}>How it fails:</strong> The controller sends pulses and assumes each pulse produces a step. There is no feedback. Under heavy load, the motor loses torque and misses steps silently — the controller continues from the wrong assumed position. No alarm fires. The part is dimensionally wrong and the machine has no idea. This is why industrial CNC machines exclusively use servo drives.
          </p>
        </div>
      )}

      {/* COMPARE TAB */}
      {tab === 2 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {[
              {
                title: 'Servo — closed-loop', color: C.actual,
                items: [
                  { ok: true,  text: 'Encoder feedback on every axis' },
                  { ok: true,  text: 'Following error detection → E-stop if overloaded' },
                  { ok: true,  text: 'Accurate under heavy cutting load' },
                  { ok: true,  text: 'Repeatability ±0.001–0.005mm' },
                  { ok: true,  text: 'Standard on all industrial CNC' },
                  { ok: false, text: 'More complex, requires PID tuning' },
                  { ok: false, text: 'Higher cost than steppers' },
                ],
              },
              {
                title: 'Stepper — open-loop', color: C.actualStep,
                items: [
                  { ok: true,  text: 'Simple, cheap, no tuning required' },
                  { ok: true,  text: 'Fine for 3D printers and light routing' },
                  { ok: false, text: 'No position verification' },
                  { ok: false, text: 'Step loss under load = silent error' },
                  { ok: false, text: 'Errors accumulate, no self-correction' },
                  { ok: false, text: 'Not used on industrial machines' },
                  { ok: false, text: 'Torque drops sharply at high speed' },
                ],
              },
            ].map(col => (
              <div key={col.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: col.color, marginBottom: 10 }}>{col.title}</div>
                {col.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5, fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                    <span style={{ color: item.ok ? C.ok : C.alarm, flexShrink: 0 }}>{item.ok ? '✓' : '✗'}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
            <strong style={{ color: C.text }}>Why this matters for Macro B:</strong> When you write parametric programs that read machine position (system variables #5041–#5043 for work coordinates), that data is only trustworthy because a closed-loop servo system has been continuously verifying it. On a stepper-based machine, those variables reflect commanded position — which may not match actual position after any significant cutting load.
          </div>
        </div>
      )}
    </div>
  )
}
