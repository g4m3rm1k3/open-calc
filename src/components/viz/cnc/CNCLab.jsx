import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CNCInterpreter } from '../../../scripts/cnc/CNCInterpreter.js'
import CNCBackplot from './CNCBackplot.jsx'

// ─── Preset program library ────────────────────────────────────────────────────
const PROGRAM_LIBRARY = {
  fanuc: [
    {
      id: 'O0001', name: 'Simple Square Pocket',
      desc: 'G01 linear moves in a square pattern. Teaches: G00, G01, G90.',
      code: `O0001 (SIMPLE SQUARE POCKET)
G10 L2 P1 X0 Y0 Z0 (G54 PART ORIGIN AT MACHINE HOME)
G21 G90 G17 G40 G49 G80
T1 M06
G43 H1
S1500 M03
M08
G00 X0 Y0
G00 Z5.
G01 Z-2. F100
G01 X50. F200
G01 Y50.
G01 X0
G01 Y0
G00 Z50.
M09
M05
M30`
    },
    {
      id: 'O0002', name: 'Bolt Circle (WHILE Loop)',
      desc: 'Drills 8 holes equally spaced on a circle using a WHILE macro loop. Teaches: #vars, WHILE, SIN, COS.',
      code: `O0002 (BOLT CIRCLE - 8 HOLES)
G10 L2 P1 X0 Y0 Z0 (G54 PART ORIGIN)
G21 G90 G17 G40 G49 G80
T2 M06
G43 H2
S2000 M03
G54
#100 = 0    (ANGLE COUNTER)
#101 = 8    (NUMBER OF HOLES)
#102 = 40.  (RADIUS)
WHILE [#100 LT #101] DO1
  #103 = #100 * 360. / #101       (CURRENT ANGLE DEG)
  #104 = #102 * COS[#103]         (X POSITION)
  #105 = #102 * SIN[#103]         (Y POSITION)
  G00 X#104 Y#105
  G81 Z-10. R3. F80
  #100 = #100 + 1
END1
G80
G00 Z50.
M05
M30`
    },
    {
      id: 'O0003', name: 'Arc Pocket (G02/G03)',
      desc: 'Circular pocket using arc interpolation. Teaches: G02, G03, I, J.',
      code: `O0003 (CIRCULAR POCKET)
G10 L2 P1 X0 Y0 Z0 (G54 PART ORIGIN)
G21 G90 G17
T1 M06
G43 H1
S1800 M03
G00 X0 Y0 Z5.
G01 Z-3. F80
G01 X20. F150
G02 X20. Y0 I-20. J0 F200
G00 Z50.
M05
M30`
    },
    {
      id: 'O0004', name: 'Subroutine Demo (M98/M99)',
      desc: 'Main program calls a drilling subroutine at multiple positions. Teaches: M98, M99, L repeats.',
      code: `O0004 (SUBROUTINE DEMO)
G10 L2 P1 X0 Y0 Z0 (G54 PART ORIGIN)
G21 G90
T1 M06
S2000 M03
G00 X10. Y10.
M98 P9001
G00 X40. Y10.
M98 P9001
G00 X40. Y40.
M98 P9001
G00 Z50.
M05
M30
(SUBROUTINE - DRILL CYCLE)
N9001
G00 Z5.
G01 Z-8. F60
G00 Z5.
M99`
    },
    {
      id: 'O0006', name: 'Named Variables (#_ALM, #[NAME])',
      desc: 'Fanuc Macro B named variables. Teaches: #[RADIUS], #_ALM, system vars #5041-5043, #3011.',
      code: `O0006 (NAMED MACRO VARIABLES DEMO)
G10 L2 P1 X0 Y0 Z0 (G54 PART ORIGIN)
G21 G90 G17 G40 G49 G80
(DEFINE NAMED USER VARIABLES)
#[RADIUS]   = 50.0  (BOLT CIRCLE RADIUS)
#[NUM_HOLES] = 6    (NUMBER OF HOLES)
#[DEPTH]    = -12.0 (DRILL DEPTH)
T2 M06
G43 H2
S2000 M03 M08
G54
(READ DATE AND TIME INTO VARS)
#[TODAY] = #_DATE
#[NOW]   = #_TIME
G00 X0 Y0 Z5.
(LOOP USING NAMED VARIABLE)
#100 = 0
WHILE [#100 LT #[NUM_HOLES]] DO1
  #101 = #100 * 360. / #[NUM_HOLES]
  #102 = #[RADIUS] * COS[#101]
  #103 = #[RADIUS] * SIN[#101]
  G00 X#102 Y#103
  G01 Z#[DEPTH] F80.
  G00 Z5.
  #100 = #100 + 1
END1
(VERIFY FINAL POSITION USING SYSTEM VARS)
(#5041=X #5042=Y #5043=Z work pos)
G00 Z50. M09 M05
M30`
    },
    {
      id: 'O0007', name: 'Extended Work Offsets (G54.1)',
      desc: 'Programs G54.1 P1-P3 extended offsets via G10, then machines a pattern in each. Teaches: G54.1, G10 L2.',
      code: `O0007 (EXTENDED WORK OFFSETS G54.1)
G21 G90 G40 G49 G80
(SET EWO P1 VIA G10)
G10 L2 P7 X0 Y0 Z0
G10 L2 P8 X100. Y0 Z0
G10 L2 P9 X200. Y0 Z0
T1 M06
G43 H1
S1500 M03 M08
(MACHINE IN EWO P1)
G54.1 P1
G00 X0 Y0 Z5.
G01 Z-2. F80
G01 X20. F150
G01 Y20.
G00 Z5.
(MACHINE IN EWO P2)
G54.1 P2
G00 X0 Y0 Z5.
G01 Z-2. F80
G01 X20. F150
G01 Y20.
G00 Z5.
(MACHINE IN EWO P3)
G54.1 P3
G00 X0 Y0 Z5.
G01 Z-2. F80
G01 X20. F150
G00 Z50.
M09 M05
M30`
    },
    {
      id: 'O0005', name: 'Work Offsets (G54-G56)',
      desc: 'Machines the same pattern in three different work coordinate systems. Teaches: G54, G55, G56.',
      code: `O0005 (WORK OFFSETS DEMO)
G21 G90
T1 M06
S1500 M03
G54
G00 X0 Y0 Z5.
G01 Z-2. F80
G01 X20. F150
G01 Y20.
G00 Z5.
G55
G00 X0 Y0
G01 Z-2. F80
G01 X20. F150
G01 Y20.
G00 Z5.
G56
G00 X0 Y0
G01 Z-2. F80
G01 X20. F150
G00 Z50.
M05
M30`
    }
  ],
  siemens: [
    {
      id: 'MPF001', name: 'Simple Contour',
      desc: 'Basic linear moves. Siemens syntax uses = for assignment.',
      code: `; SIMPLE CONTOUR - SIEMENS 840D
G21 G90 G17
T1 D1
M06
S1500 M03
G00 X0 Y0 Z5
G01 Z-2 F100
G01 X50 F200
G01 Y50
G01 X0
G01 Y0
G00 Z50
M05
M30`
    },
    {
      id: 'MPF002', name: 'Bolt Circle (R-variables)',
      desc: 'Bolt circle using Siemens R-variables and GOTOF. Teaches: R-vars, IF, GOTOF.',
      code: `; BOLT CIRCLE - SIEMENS R-VARS
G21 G90
T1 D1 M06
S2000 M03
R1 = 0
R2 = 8
R3 = 40
STARTHOLE:
R4 = R1 * 360 / R2
R5 = R3 * COS(R4)
R6 = R3 * SIN(R4)
G00 X=R5 Y=R6
G01 Z-10 F80
G00 Z5
R1 = R1 + 1
IF R1 < R2 GOTOB STARTHOLE
G00 Z50
M05
M30`
    }
  ],
  okuma: [
    {
      id: 'O1001', name: 'Okuma Basic Contour',
      desc: 'Okuma OSP syntax. Uses VCALL for subroutines.',
      code: `O1001 (OKUMA BASIC CONTOUR)
G15 H1
BLK FORM 0.1 Z-30 X0 Y0
BLK FORM 0.2 X100 Y100 Z0
T1 M06
G90 G00 S1500 M03
G43 Z50 H1
X0 Y0
G01 Z-3 F80
X50 F200
Y50
X0
Y0
G00 Z50
M05
M30`
    }
  ]
}

// ─── Default tool table ────────────────────────────────────────────────────────
// dia = cutting diameter (mm)
// len = gauge/TLO length (G43 offset, spindle face → tip)
// lenCut = flute / length of cut (how deep the tool can cut)
// lenTotal = overall body length (for clearance checking)
const DEFAULT_TOOLS = {
  1: { dia: 10,  len: 75.0,  lenCut: 22.0,  lenTotal: 75.0,  desc: '#1 - 10mm 4-Flute End Mill' },
  2: { dia: 6,   len: 82.0,  lenCut: 28.0,  lenTotal: 82.0,  desc: '#2 - 6mm Drill' },
  3: { dia: 8,   len: 79.0,  lenCut: 20.0,  lenTotal: 79.0,  desc: '#3 - 8mm Ball End Mill' },
  4: { dia: 12,  len: 68.0,  lenCut: 30.0,  lenTotal: 68.0,  desc: '#4 - 12mm Face Mill' },
  5: { dia: 3,   len: 60.0,  lenCut: 8.0,   lenTotal: 60.0,  desc: '#5 - 3mm Slot Drill' },
}

const DIALECTS = ['fanuc', 'okuma', 'siemens']
const DIALECT_LABELS = { fanuc: 'FANUC', okuma: 'OKUMA OSP', siemens: 'SIEMENS 840D' }
const DIALECT_COLORS = { fanuc: '#3b82f6', okuma: '#f59e0b', siemens: '#10b981' }

const C = {
  bg:      '#0f172a',
  surface: '#1e293b',
  border:  '#334155',
  text:    '#f1f5f9',
  muted:   '#94a3b8',
  hint:    '#475569',
  green:   '#4ade80',
  amber:   '#fbbf24',
  red:     '#f87171',
  blue:    '#38bdf8',
  teal:    '#2dd4bf',
  purple:  '#a78bfa',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CNCLab({ initialCode = '', dialect: initialDialect = 'fanuc', lessonProgram = null }) {
  // ── Dialect & machine ──────────────────────────────────────────────────────
  const [dialect, setDialect] = useState(initialDialect)
  const [singleBlock, setSingleBlock] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // ── Program management ──────────────────────────────────────────────────────
  const [code, setCode] = useState(lessonProgram ?? initialCode ?? (PROGRAM_LIBRARY.fanuc[0]?.code ?? ''))
  const [panel, setPanel] = useState('dro')   // dro | offsets | macros | tools | code | program

  // ── Interpreter ────────────────────────────────────────────────────────────
  const interpRef    = useRef(null)
  const stepCountRef  = useRef(0)   // monotonic step call counter — indexes into pathPoints
  const [machineState, setMachineState] = useState(null)
  const [pathPoints, setPathPoints]   = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  // ── Tool table ──────────────────────────────────────────────────────────────
  const [toolTable, setToolTable] = useState({ ...DEFAULT_TOOLS })
  const [editingTool, setEditingTool] = useState(null)  // tool number being edited

  // ── Jog ─────────────────────────────────────────────────────────────────────
  const [jogAxis, setJogAxis] = useState('X')
  const [jogStep, setJogStep] = useState(1.0)
  const [jogPos, setJogPos] = useState({ X:0, Y:0, Z:0 })

  // ── Work offset editing ──────────────────────────────────────────────────────
  const [editingOffset, setEditingOffset] = useState(null)

  // ── Upload ref ───────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null)

  // ─── Init / reload interpreter ─────────────────────────────────────────────
  const loadAndRun = useCallback((prog, dial, tbl) => {
    const interp = new CNCInterpreter(dial)
    interp.setToolTable(tbl)
    interp.loadProgram(prog)
    interpRef.current = interp

    // Pre-run for backplot
    const preview = new CNCInterpreter(dial)
    preview.setToolTable(tbl)
    preview.loadProgram(prog)
    const snaps = preview.runAll(12000)
    // Use work coords (X/Y/Z) not machine coords: MZ includes TLO which
    // offsets the whole path upward relative to the workpiece visually.
    setPathPoints(snaps.map(s => ({ machineX: s.X ?? 0, machineY: s.Y ?? 0, machineZ: s.Z ?? 0 })))
    stepCountRef.current = 0
    setCurrentStep(0)
    setMachineState({ ...interp.state })
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    loadAndRun(code, dialect, toolTable)
  }, [code, dialect, toolTable])

  // ─── Step ──────────────────────────────────────────────────────────────────
  const stepNext = useCallback(() => {
    if (!interpRef.current) return
    if (interpRef.current.state.isDone || interpRef.current.state.isError) return
    const s = interpRef.current.step()
    setMachineState({ ...s })
    // Use a monotonic counter so backplot tool position indexes correctly into pathPoints
    stepCountRef.current++
    setCurrentStep(stepCountRef.current)
  }, [])

  const resetProgram = useCallback(() => {
    loadAndRun(code, dialect, toolTable)
  }, [code, dialect, toolTable, loadAndRun])

  // Auto-play with single-block awareness
  useEffect(() => {
    let timer
    if (isPlaying && machineState && !machineState.isDone && !machineState.isError) {
      timer = setTimeout(() => {
        stepNext()
        if (singleBlock) setIsPlaying(false)
      }, singleBlock ? 0 : 280)
    } else {
      setIsPlaying(false)
    }
    return () => clearTimeout(timer)
  }, [isPlaying, machineState, singleBlock])

  // ─── Jog ──────────────────────────────────────────────────────────────────
  const jog = useCallback((dir) => {
    setJogPos(prev => ({
      ...prev,
      [jogAxis]: parseFloat((prev[jogAxis] + dir * jogStep).toFixed(4))
    }))
  }, [jogAxis, jogStep])

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setCode(ev.target.result) }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  // ─── Download program ───────────────────────────────────────────────────────────
  const downloadProgram = useCallback(() => {
    const ext = dialect === 'siemens' ? '.mpf' : dialect === 'okuma' ? '.min' : '.nc'
    const blob = new Blob([code], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `cnc_program${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [code, dialect])

  // ─── LocalStorage save / load ───────────────────────────────────────────────────────
  const LS_KEY = 'cnc_saved_programs'
  const [savedPrograms, setSavedPrograms] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
  })
  const [saveNameInput, setSaveNameInput] = useState('')

  const saveToMemory = useCallback(() => {
    const name = saveNameInput.trim() || `Program ${new Date().toLocaleTimeString()}`
    const entry = { name, code, dialect, savedAt: Date.now() }
    setSavedPrograms(prev => {
      const next = [...prev, entry]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
    setSaveNameInput('')
  }, [code, dialect, saveNameInput])

  const deleteSaved = useCallback((idx) => {
    setSavedPrograms(prev => {
      const next = prev.filter((_, i) => i !== idx)
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // ─── Load preset program ───────────────────────────────────────────────────
  const loadPreset = useCallback((prog) => {
    setCode(prog.code)
    setPanel('code')
  }, [])

  const ms = machineState

  return (
    <div className="flex flex-col font-mono text-xs select-none"
      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>

      {/* ── TOP STATUS BAR ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {/* Run light */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full"
              style={{ background: isPlaying ? C.green : ms?.isDone ? C.amber : C.hint,
                boxShadow: isPlaying ? `0 0 8px ${C.green}` : 'none' }} />
            <span style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>
              {ms?.isError ? 'ALARM' : ms?.isDone ? 'COMPLETED' : isPlaying ? 'EXECUTING' : 'READY'}
            </span>
          </div>
          {/* Coolant indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full"
              style={{ background: ms?.coolant ? C.blue : C.hint }} />
            <span style={{ color: C.hint, fontSize: 9 }}>COOLANT</span>
          </div>
          {/* Spindle direction */}
          <span style={{ color: ms?.spindleDir === 'M03' ? C.green : ms?.spindleDir === 'M04' ? C.amber : C.hint, fontSize: 9 }}>
            {ms?.spindleDir === 'M03' ? 'CW ▶' : ms?.spindleDir === 'M04' ? '◀ CCW' : 'SPN OFF'}
          </span>
          {/* Block */}
          <span style={{ color: C.hint, fontSize: 9 }}>BLK {ms?.programPointer ?? 0}</span>
          {/* Error */}
          {ms?.isError && <span style={{ color: C.red, fontSize: 9 }}>ERR: {ms.error}</span>}
          {ms?.message && !ms.isError && <span style={{ color: C.teal, fontSize: 9 }}>{ms.message}</span>}
        </div>

        {/* Dialect selector */}
        <div className="flex items-center gap-2">
          {DIALECTS.map(d => (
            <button key={d} onClick={() => setDialect(d)}
              className="px-2 py-1 rounded text-[9px] font-bold transition"
              style={{
                background: dialect === d ? DIALECT_COLORS[d] + '30' : 'transparent',
                color: dialect === d ? DIALECT_COLORS[d] : C.hint,
                border: `1px solid ${dialect === d ? DIALECT_COLORS[d] + '60' : C.border}`,
              }}>
              {DIALECT_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTROL PANEL ROW ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2"
        style={{ background: '#0d1b2a', borderBottom: `1px solid ${C.border}` }}>

        {/* CYCLE START */}
        <button onClick={() => setIsPlaying(p => !p)}
          className="px-4 py-2 rounded text-xs font-bold transition"
          style={{
            background: isPlaying ? C.amber + '20' : C.green + '20',
            color: isPlaying ? C.amber : C.green,
            border: `1px solid ${isPlaying ? C.amber + '50' : C.green + '50'}`,
            minWidth: 120
          }}>
          {isPlaying ? '⏹ STOP' : '▶ CYCLE START'}
        </button>

        {/* SINGLE BLOCK toggle + step button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSingleBlock(p => !p)}
            className="px-3 py-2 rounded text-[10px] font-bold transition"
            style={{
              background: singleBlock ? C.blue + '25' : 'transparent',
              color: singleBlock ? C.blue : C.hint,
              border: `1px solid ${singleBlock ? C.blue + '60' : C.border}`,
            }}>
            SBK {singleBlock ? 'ON' : 'OFF'}
          </button>
          <button onClick={stepNext}
            disabled={ms?.isDone || ms?.isError}
            className="px-3 py-2 rounded text-[10px] font-bold transition"
            style={{
              background: C.blue + '15',
              color: C.blue,
              border: `1px solid ${C.blue + '40'}`,
              opacity: (ms?.isDone || ms?.isError) ? 0.3 : 1
            }}>
            STEP ▸
          </button>
        </div>

        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* RESET */}
        <button onClick={resetProgram}
          className="px-3 py-2 rounded text-[10px] font-bold"
          style={{ background: C.hint + '15', color: C.muted, border: `1px solid ${C.border}` }}>
          ↺ RESET
        </button>

        {/* Upload */}
        <button onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 rounded text-[10px] font-bold"
          style={{ background: C.purple + '15', color: C.purple, border: `1px solid ${C.purple}40` }}>
          ⬆ UPLOAD
        </button>
        {/* Download */}
        <button onClick={downloadProgram}
          className="px-3 py-2 rounded text-[10px] font-bold"
          style={{ background: C.teal + '15', color: C.teal, border: `1px solid ${C.teal}40` }}>
          ⬇ DOWNLOAD
        </button>
        <input ref={fileInputRef} type="file" accept=".nc,.txt,.cnc,.mpf,.min"
          style={{ display: 'none' }} onChange={handleUpload} />

        <div style={{ flex: 1 }} />

        {/* Speed */}
        {isPlaying && (
          <span style={{ color: C.muted, fontSize: 9 }}>
            AUTO PLAY
          </span>
        )}
      </div>

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────── */}
      <div className="flex" style={{ minHeight: 520 }}>

        {/* ── LEFT PANEL: Control Screen ───────────────────────────────── */}
        <div className="flex flex-col" style={{ width: 280, borderRight: `1px solid ${C.border}`, background: C.surface }}>

          {/* Screen tabs */}
          <div className="flex" style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            {[
              { k: 'dro',     l: 'DRO' },
              { k: 'offsets', l: 'WCS' },
              { k: 'macros',  l: 'VARS' },
              { k: 'tools',   l: 'TOOLS' },
              { k: 'code',    l: 'CODE' },
              { k: 'program', l: 'PROG' },
            ].map(t => (
              <button key={t.k} onClick={() => setPanel(t.k)}
                className="flex-1 py-1.5 transition"
                style={{
                  fontSize: 8, fontWeight: 'bold', letterSpacing: 1,
                  color: panel === t.k ? C.blue : C.hint,
                  borderBottom: `2px solid ${panel === t.k ? C.blue : 'transparent'}`,
                  background: panel === t.k ? C.blue + '10' : 'transparent',
                }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto p-3" style={{ fontSize: 10 }}>

            {/* ── DRO ── */}
            {panel === 'dro' && ms && (
              <div className="flex flex-col gap-3">
                {/* Big coordinate display */}
                <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3 }}>{ms.activeOffset} WORK POSITION</div>
                {['X','Y','Z'].map(ax => (
                  <div key={ax} className="flex items-center justify-between px-3 py-2 rounded"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: C.hint }}>{ax}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: C.green, fontVariantNumeric: 'tabular-nums' }}>
                      {(ms[ax] ?? 0).toFixed(4)}
                    </span>
                  </div>
                ))}
                {/* Machine (G53) position */}
                <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, marginTop: 4 }}>G53 MACHINE POSITION</div>
                {['MX','MY','MZ'].map((ax, i) => (
                  <div key={ax} className="flex items-center justify-between px-3 py-1 rounded"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <span style={{ color: C.hint, fontSize: 13, fontWeight: 700 }}>{'XYZ'[i]}</span>
                    <span style={{ color: C.muted, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                      {(ms[ax] ?? 0).toFixed(4)}
                    </span>
                  </div>
                ))}
                {/* Feed / Spindle */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <div style={{ color: C.hint, fontSize: 8 }}>FEEDRATE</div>
                    <div style={{ color: C.amber, fontSize: 16 }}>{ms.feedrate.toFixed(0)} <span style={{ fontSize: 9, color: C.hint }}>{ms.units === 'inch' ? 'IPM' : 'MM/MIN'}</span></div>
                  </div>
                  <div className="p-2 rounded" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <div style={{ color: C.hint, fontSize: 8 }}>SPINDLE</div>
                    <div style={{ color: C.blue, fontSize: 16 }}>{ms.spindleRPM} <span style={{ fontSize: 9, color: C.hint }}>RPM</span></div>
                  </div>
                </div>
                {/* Modal codes */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {[ms.motionMode, ms.posMode, ms.plane, ms.units === 'inch' ? 'G20' : 'G21',
                    ms.cutterComp, ms.tlOffset, ms.cycleMode, `T${ms.activeT}`, `H${ms.activeH}`].map(m => (
                    <span key={m} className="px-1.5 py-0.5 rounded" style={{ background: C.hint + '25', color: C.muted, fontSize: 9 }}>{m}</span>
                  ))}
                </div>

                {/* ── JOG PANEL ── */}
                <div className="mt-2 p-2 rounded" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <div style={{ color: C.hint, fontSize: 8, letterSpacing: 2, marginBottom: 6 }}>JOG / HANDWHEEL</div>
                  {/* Axis select */}
                  <div className="flex gap-1 mb-2">
                    {['X','Y','Z'].map(ax => (
                      <button key={ax} onClick={() => setJogAxis(ax)}
                        className="flex-1 py-1 rounded font-bold"
                        style={{
                          background: jogAxis === ax ? C.purple + '30' : 'transparent',
                          color: jogAxis === ax ? C.purple : C.hint,
                          border: `1px solid ${jogAxis === ax ? C.purple : C.border}`,
                          fontSize: 11
                        }}>
                        {ax}
                      </button>
                    ))}
                  </div>
                  {/* Step size */}
                  <div className="flex gap-1 mb-2">
                    {[0.001, 0.01, 0.1, 1.0, 10.0].map(s => (
                      <button key={s} onClick={() => setJogStep(s)}
                        className="flex-1 py-0.5 rounded"
                        style={{
                          background: jogStep === s ? C.blue + '25' : 'transparent',
                          color: jogStep === s ? C.blue : C.hint,
                          border: `1px solid ${jogStep === s ? C.blue : C.border}`,
                          fontSize: 8
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {/* +/- buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => jog(-1)}
                      className="flex-1 py-2 rounded font-bold text-sm"
                      style={{ background: C.red + '20', color: C.red, border: `1px solid ${C.red}50` }}>
                      − {jogAxis}
                    </button>
                    <button onClick={() => jog(+1)}
                      className="flex-1 py-2 rounded font-bold text-sm"
                      style={{ background: C.green + '20', color: C.green, border: `1px solid ${C.green}50` }}>
                      + {jogAxis}
                    </button>
                  </div>
                  {/* Jog position display */}
                  <div className="flex justify-between mt-2">
                    {['X','Y','Z'].map(ax => (
                      <div key={ax} className="text-center">
                        <div style={{ color: C.hint, fontSize: 8 }}>{ax}</div>
                        <div style={{ color: C.muted, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{jogPos[ax].toFixed(3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── WORK OFFSETS ── */}
            {panel === 'offsets' && ms && (() => {
              // Standard G54-G59 always shown;
              // Extended EWO_Pn / G5xx shown only if active or if dialect matches
              const stdKeys = ['G54','G55','G56','G57','G58','G59']
              const activeIsEwo = ms.activeOffset.startsWith('EWO_P')
              const activeIsGxx = /^G[5-9]\d\d$/.test(ms.activeOffset)
              const ewoKeys = activeIsEwo ? [ms.activeOffset] : []
              const gxxKeys = (activeIsGxx && dialect === 'siemens') ? [ms.activeOffset] : []
              const visibleKeys = [...stdKeys, ...ewoKeys, ...gxxKeys]
              const OffsetRow = ({ name, vals }) => (
                <div key={name} className="rounded p-2"
                  style={{
                    background: ms.activeOffset === name ? C.blue + '15' : C.bg,
                    border: `1px solid ${ms.activeOffset === name ? C.blue : C.border}`
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontWeight: 700, color: ms.activeOffset === name ? C.blue : C.text }}>
                      {name.startsWith('EWO_P') ? `G54.1 P${name.slice(5)}` : name}
                    </span>
                    <div className="flex items-center gap-1">
                      {ms.activeOffset === name && (
                        <span style={{ fontSize: 7, background: C.blue, color: '#fff', borderRadius: 3, padding: '1px 4px' }}>ACTIVE</span>
                      )}
                      <button onClick={() => setEditingOffset(editingOffset === name ? null : name)}
                        style={{ color: C.hint, fontSize: 9 }}>✎</button>
                    </div>
                  </div>
                  {editingOffset === name ? (
                    <div className="flex flex-col gap-1 mt-1">
                      {['X','Y','Z'].map(ax => (
                        <div key={ax} className="flex items-center gap-1">
                          <span style={{ color: C.hint, width: 12 }}>{ax}:</span>
                          <input type="number" step="0.001"
                            defaultValue={vals[ax] ?? 0}
                            className="rounded px-1 py-0.5 text-right"
                            style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, width: '100%', fontSize: 10 }}
                            onChange={(ev) => {
                              const v = parseFloat(ev.target.value) || 0
                              if (interpRef.current) {
                                interpRef.current.state.offsets[name][ax] = v
                                setMachineState({ ...interpRef.current.state })
                              }
                            }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {['X','Y','Z'].map(ax => (
                        <div key={ax} style={{ color: C.muted, fontSize: 9 }}>
                          {ax}: <span style={{ color: (vals[ax] ?? 0) !== 0 ? C.amber : C.text }}>{(vals[ax] ?? 0).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: C.hint, fontSize: 8, letterSpacing: 3 }}>WORK COORDINATE OFFSETS</span>
                    {dialect === 'fanuc' && <span style={{ color: C.hint, fontSize: 8 }}>G54.1 P1-P48 extended available</span>}
                  </div>
                  {visibleKeys.map(k => ms.offsets[k] && <OffsetRow key={k} name={k} vals={ms.offsets[k]} />)}
                  {dialect === 'fanuc' && (
                    <div className="mt-1">
                      <div style={{ color: C.hint, fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>JUMP TO EWO (G54.1 Pn)</div>
                      <div className="flex gap-1">
                        <input type="number" min="1" max="48" placeholder="P#" id="ewo-jump"
                          className="rounded px-2 py-1 flex-1"
                          style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, fontSize: 10 }} />
                        <button
                          className="px-2 py-1 rounded text-[9px]"
                          style={{ background: C.blue + '20', color: C.blue, border: `1px solid ${C.blue}40` }}
                          onClick={() => {
                            const pn = parseInt(document.getElementById('ewo-jump')?.value)
                            if (pn >= 1 && pn <= 48 && interpRef.current) {
                              interpRef.current.state.activeOffset = `EWO_P${pn}`
                              setMachineState({ ...interpRef.current.state })
                              setEditingOffset(`EWO_P${pn}`)
                            }
                          }}>GO</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── VARIABLE WATCH ── */}
            {panel === 'macros' && ms && (
              <div className="flex flex-col gap-2">
                <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>
                  {dialect === 'siemens' ? 'R-VARIABLE' : dialect === 'okuma' ? 'V-VARIABLE' : 'MACRO-VARIABLE'} WATCH
                </div>
                {/* Named variables (#[NAME] / user named) */}
                {ms.namedVars && ms.namedVars.size > 0 && (
                  <>
                    <div style={{ color: C.teal, fontSize: 8, letterSpacing: 2 }}>NAMED VARIABLES</div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {[...ms.namedVars.entries()].map(([name, val]) => (
                        <div key={name} className="flex justify-between px-2 py-1 rounded"
                          style={{ background: C.bg, border: `1px solid ${C.teal}30` }}>
                          <span style={{ color: C.teal, fontSize: 9 }}>{name.startsWith('_') ? `#${name}` : `#[${name}]`}</span>
                          <span style={{ color: C.purple }}>{typeof val === 'number' ? val.toFixed(3) : String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {/* Numeric variables — skip system position vars updated automatically */}
                {ms.vars.size === 0 && (!ms.namedVars || ms.namedVars.size === 0) ? (
                  <div style={{ color: C.hint, textAlign: 'center', padding: '2rem 0', fontSize: 10 }}>
                    No variables defined yet.<br/>Run a program with #100=... assignments.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    {[...ms.vars.entries()]
                      .filter(([id]) => { const n = parseInt(id); return !(n >= 5020 && n <= 5050) })
                      .map(([id, val]) => (
                        <div key={id} className="flex justify-between px-2 py-1 rounded"
                          style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <span style={{ color: C.hint }}>
                            {dialect === 'siemens' ? `R${id}` : dialect === 'okuma' ? `V${id}` : `#${id}`}
                          </span>
                          <span style={{ color: C.purple }}>{typeof val === 'number' ? val.toFixed(3) : val}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TOOL TABLE ── */}
            {panel === 'tools' && (
              <div className="flex flex-col gap-2">
                <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>TOOL TABLE</div>
                <div style={{ color: C.text, fontWeight: 700, marginBottom: 4 }}>
                  Active: T{ms?.activeT ?? 0} / H{ms?.activeH ?? 0}
                </div>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(tNum => {
                  const tool = toolTable[tNum] ?? {}
                  const isActive = ms?.activeT === tNum
                  const isEditing = editingTool === tNum
                  return (
                    <div key={tNum} className="rounded p-2"
                      style={{
                        background: isActive ? C.amber + '10' : C.bg,
                        border: `1px solid ${isActive ? C.amber : C.border}`
                      }}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontWeight: 700, color: isActive ? C.amber : C.text }}>T{tNum}</span>
                        {isActive && <span style={{ fontSize: 7, background: C.amber, color: '#000', borderRadius: 3, padding: '1px 4px' }}>IN SPINDLE</span>}
                        <button onClick={() => setEditingTool(isEditing ? null : tNum)}
                          style={{ color: C.hint, fontSize: 9, marginLeft: 'auto' }}>✎</button>
                      </div>
                      {isEditing ? (
                        <div className="flex flex-col gap-1 mt-1">
                          {[
                            ['desc',     'Description',     'text'],
                            ['dia',      'Dia ⌀ (mm)',       'number'],
                            ['len',      'TLO / Gauge (mm)', 'number'],
                            ['lenCut',   'Len of Cut (mm)',  'number'],
                            ['lenTotal', 'Total Body (mm)',  'number'],
                          ].map(([field, label, type]) => (
                            <div key={field} className="flex items-center gap-1">
                              <span style={{ color: C.hint, width: 80, fontSize: 8, flexShrink: 0 }}>{label}</span>
                              <input
                                type={type}
                                step="0.001"
                                defaultValue={tool[field] ?? ''}
                                className="rounded px-1 py-0.5"
                                style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, flex: 1, fontSize: 9 }}
                                onChange={(e) => {
                                  const v = type === 'text' ? e.target.value : (parseFloat(e.target.value) || 0)
                                  setToolTable(prev => ({
                                    ...prev,
                                    [tNum]: { ...prev[tNum], [field]: v }
                                  }))
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: C.muted, fontSize: 9, lineHeight: 1.8 }}>
                          <div>{tool.desc ?? '(empty slot)'}</div>
                          {tool.dia      && <span style={{ color: C.hint }}>⌀{tool.dia}  </span>}
                          {tool.len      && <span style={{ color: C.hint }}>TLO:{tool.len}  </span>}
                          {tool.lenCut   && <span style={{ color: C.hint }}>LC:{tool.lenCut}  </span>}
                          {tool.lenTotal && <span style={{ color: C.hint }}>LT:{tool.lenTotal}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── CODE EDITOR ── */}
            {panel === 'code' && (
              <div className="flex flex-col h-full gap-2" style={{ height: 420 }}>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  className="flex-1 p-3 rounded resize-none"
                  style={{
                    background: '#000', color: C.green, fontFamily: 'monospace',
                    fontSize: 11, border: `1px solid ${C.border}`, lineHeight: 1.6,
                    height: 390, outline: 'none'
                  }}
                  placeholder={`G-Code / ${DIALECT_LABELS[dialect]} program...`}
                />
                <button onClick={() => fileInputRef.current?.click()}
                  className="py-1 rounded text-[10px]"
                  style={{ background: C.purple + '15', color: C.purple, border: `1px solid ${C.purple}40` }}>
                  ⬆ Upload .nc / .mpf / .min file
                </button>
              </div>
            )}

            {/* ── PROGRAM LIBRARY ── */}
            {panel === 'program' && (
              <div className="flex flex-col gap-2">
                <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>MEMORY — PROGRAM LIST</div>
                {(PROGRAM_LIBRARY[dialect] ?? []).map(prog => (
                  <div key={prog.id} className="rounded p-2 cursor-pointer"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                    onClick={() => loadPreset(prog)}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 700, color: C.blue }}>{prog.id}</span>
                      <span style={{ color: C.green, fontSize: 9 }}>LOAD ▸</span>
                    </div>
                    <div style={{ color: C.text, fontWeight: 600, marginTop: 2 }}>{prog.name}</div>
                    <div style={{ color: C.muted, fontSize: 9, marginTop: 2, lineHeight: 1.5 }}>{prog.desc}</div>
                  </div>
                ))}
                {(PROGRAM_LIBRARY[dialect]?.length === 0) && (
                  <div style={{ color: C.hint, textAlign: 'center', padding: '2rem 0' }}>No programs for {DIALECT_LABELS[dialect]}</div>
                )}
                <div style={{ color: C.hint, fontSize: 8, marginTop: 8, letterSpacing: 2 }}>UPLOAD FROM DISK</div>
                <button onClick={() => fileInputRef.current?.click()}
                  className="py-2 rounded"
                  style={{ background: C.purple + '15', color: C.purple, border: `1px solid ${C.purple}40` }}>
                  ⬆ Upload .nc / .mpf / .min
                </button>
                {/* Saved to memory */}
                <div style={{ color: C.hint, fontSize: 8, marginTop: 8, letterSpacing: 2 }}>SAVE TO MACHINE MEMORY</div>
                <div className="flex gap-1">
                  <input
                    value={saveNameInput}
                    onChange={e => setSaveNameInput(e.target.value)}
                    placeholder="Program name..."
                    className="flex-1 rounded px-2 py-1"
                    style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, fontSize: 9 }}
                  />
                  <button onClick={saveToMemory}
                    className="px-2 py-1 rounded text-[9px] font-bold"
                    style={{ background: C.green + '20', color: C.green, border: `1px solid ${C.green}40` }}>
                    SAVE
                  </button>
                </div>
                {savedPrograms.length > 0 && (
                  <>
                    <div style={{ color: C.hint, fontSize: 8, marginTop: 6, letterSpacing: 2 }}>SAVED PROGRAMS</div>
                    {savedPrograms.map((sp, idx) => (
                      <div key={idx} className="rounded p-2 flex items-center justify-between"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                        <div>
                          <div style={{ color: C.text, fontSize: 9, fontWeight: 700 }}>{sp.name}</div>
                          <div style={{ color: C.hint, fontSize: 8 }}>{DIALECT_LABELS[sp.dialect] ?? sp.dialect} · {new Date(sp.savedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setCode(sp.code); if (sp.dialect) setDialect(sp.dialect); setPanel('code') }}
                            style={{ color: C.green, fontSize: 9 }}>LOAD ▸</button>
                          <button onClick={() => deleteSaved(idx)}
                            style={{ color: C.red, fontSize: 9 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Backplot + Program trace ─────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1" style={{ minHeight: 360 }}>
            <CNCBackplot pathPoints={pathPoints} currentStep={currentStep} height="360" />
          </div>

          {/* Program trace */}
          <div className="overflow-hidden flex flex-col" style={{ height: 160, borderTop: `1px solid ${C.border}`, background: C.surface }}>
            <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, padding: '6px 12px', borderBottom: `1px solid ${C.border}` }}>
              PROGRAM TRACE — N{ms?.programPointer ?? 0}
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
              {interpRef.current?.blocks?.map((b, idx) => {
                const isActive = ms?.programPointer === idx
                return (
                  <div key={idx}
                    className="px-2 py-0.5 rounded transition-colors"
                    style={{
                      background: isActive ? C.blue + '20' : 'transparent',
                      color: isActive ? C.blue : C.hint,
                      borderLeft: `2px solid ${isActive ? C.blue : 'transparent'}`,
                      fontSize: 10
                    }}>
                    <span style={{ opacity: 0.4, marginRight: 8, fontSize: 8 }}>{idx}</span>
                    {b.raw}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
