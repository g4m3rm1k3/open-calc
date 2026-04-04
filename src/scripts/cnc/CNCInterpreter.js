/**
 * CNCInterpreter — Full-featured CNC G-code interpreter for OpenCalc CNC Lab
 * V2 — Named variables, extended work offsets, system variables, X#n motion
 * Dialects: fanuc | okuma | siemens
 *
 * Fanuc Macro B:
 *   #1-#33  local vars, #100-#199 common, #500-#999 common persistent
 *   #[NAME] named variable bracket form
 *   #_NAME  named system variable (underscore prefix)
 *   #3000   P/S alarm,  #3006 message stop
 *   #3001   ms timer,   #3011 date YYMMDD, #3012 time HHMMSS
 *   #4001-#4022 modal G groups, #4102/#4107/#4109/#4111/#4115 T/S/F/H/D
 *   #5021-#5023 machine pos XYZ, #5041-#5043 work pos XYZ
 *   G54.1 P1..P48 extended work offsets, G10 L2 data setting
 *
 * Siemens 840D:
 *   R0=, R100= R-variables
 *   DEF INT/REAL varname = expr
 *   IF cond GOTOF/GOTOB label
 *   LOOP/ENDLOOP
 *   G500 (machine), G505-G599 (extended frames)
 *   $P_UIFR read alias
 *
 * Okuma OSP:
 *   V0=, VC[n]= variables
 *   Same G-code base as Fanuc
 */

// ─── Fanuc named system variable → numeric ID ────────────────────────────────
const FANUC_NAMED = {
  '_ALM':     3000,  // P/S alarm trigger (write = raise alarm)
  '_MSG':     3006,  // Custom message + program stop
  '_CLOCK':   3001,  // Millisecond timer (read-only)
  '_TIMER':   3002,  // Hour timer (read/write)
  '_SNGLBLK': 3003,  // Single block disable (0=enable, 1=disable)
  '_FHOLD':   3004,  // Feed-hold disable
  '_SPDL':    3005,  // Cutting feed stop / spindle interlock
  '_DATE':    3011,  // Date YYMMDD (read-only)
  '_TIME':    3012,  // Time HHMMSS (read-only)
  '_ABSMT':   5021,  // Absolute machine pos X alias
  '_ABSKP':   5061,  // Skip signal position X
}

export class CNCInterpreter {
  constructor(dialect = 'fanuc') {
    this.dialect = dialect.toLowerCase()
    this.toolTable = {}
    this.reset()
  }

  setDialect(d) { this.dialect = d.toLowerCase() }
  setToolTable(table) { this.toolTable = table }

  loadProgram(code) {
    this.reset()
    this.blocks = code.split('\n').map((line, idx) => ({
      raw: line,
      lineNum: idx,
      tokens: this._tokenize(line),
    }))
    // Build label → block index map
    this.labels = new Map()
    this.blocks.forEach((b, idx) => {
      const nTok = b.tokens.find(t => t.word === 'N')
      if (nTok) this.labels.set(nTok.value, idx)
      const oTok = b.tokens.find(t => t.word === 'O')
      if (oTok) { this.labels.set(oTok.value, idx); this.labels.set(Math.floor(oTok.value), idx) }
      const lm = b.raw.trim().match(/^([A-Z_][A-Z0-9_]*):\s*$/i)
      if (lm) this.labels.set(lm[1].toUpperCase(), idx)
    })
  }

  step() {
    if (this.state.isDone || this.state.isError) return { ...this.state }
    if (this.state.programPointer >= this.blocks.length) {
      this.state.isDone = true
      return { ...this.state }
    }
    const block = this.blocks[this.state.programPointer]
    this._executeBlock(block)
    if (!this.state.isDone && !this.state.isError) {
      if (!this._jumped) this.state.programPointer++
    }
    this._jumped = false
    return { ...this.state }
  }

  runAll(maxSteps = 12000) {
    const snaps = [{ ...this.state }]
    for (let i = 0; i < maxSteps; i++) {
      if (this.state.isDone || this.state.isError) break
      const s = this.step()
      // Inject canned-cycle plunge/retract intermediate path points
      if (s._cycleSnaps) {
        const off = (s.offsets ?? {})[s.activeOffset] ?? { X:0, Y:0, Z:0 }
        for (const cs of s._cycleSnaps) {
          snaps.push({ ...s, X: cs.X, Y: cs.Y, Z: cs.Z,
            MX: cs.X + (off.X ?? 0), MY: cs.Y + (off.Y ?? 0), MZ: cs.Z + (off.Z ?? 0),
            _cycleSnaps: null })
        }
        s._cycleSnaps = null
      }
      snaps.push(s)
    }
    return snaps
  }

  reset() {
    this._jumped = false
    this.blocks = []
    this.labels = new Map()
    this.whileStack = []
    this.callStack = []

    // Build full offset table
    const offsets = {
      // Standard Fanuc/Okuma/Siemens G54-G59
      G54: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
      G55: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
      G56: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
      G57: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
      G58: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
      G59: { X:0, Y:0, Z:0, A:0, B:0, C:0 },
    }
    // Fanuc G54.1 P1-P48 Extended Work Offsets
    for (let i = 1; i <= 48; i++) offsets[`EWO_P${i}`] = { X:0, Y:0, Z:0, A:0, B:0, C:0 }
    // Siemens G500 (machine, always zero) and G505-G599 (user frames)
    offsets['G500'] = { X:0, Y:0, Z:0, A:0, B:0, C:0 }
    for (let i = 505; i <= 599; i++) offsets[`G${i}`] = { X:0, Y:0, Z:0, A:0, B:0, C:0 }

    this.state = {
      // Workpiece position (current WCS)
      X: 0, Y: 0, Z: 0, A: 0, B: 0, C: 0,
      // Machine position (G53/G500)
      MX: 0, MY: 0, MZ: 0,
      // Modal codes
      motionMode: 'G00',
      posMode:    'G90',
      plane:      'G17',
      units:      'mm',
      cutterComp: 'G40',
      tlOffset:   'G49',
      cycleMode:  'G80',
      // Spindle / feed
      feedrate:    0,
      spindleRPM:  0,
      spindleDir: 'M05',
      coolant:     false,
      // Active tool / offset
      activeT: 0,
      activeH: 0,
      activeD: 0,
      activeOffset: 'G54',
      offsets,
      // Canned cycle params
      cycleR: 5, cycleF: 0, cycleQ: 0, cycleP: 0, cycleL: 1, cycleZ: -5,
      // Arc params
      arcI: 0, arcJ: 0, arcK: 0, arcR: null,
      // Variables: numeric-keyed Map (shared by #n / Rn / Vn)
      vars: new Map(),
      // Named user/system variables: string-keyed Map
      namedVars: new Map(),
      // Execution
      programPointer: 0,
      isDone:  false,
      isError: false,
      error:   null,
      message: '',
    }
  }

  // ─── Block execution dispatcher ───────────────────────────────────────────
  _executeBlock(block) {
    const raw = block.raw
    const line = this._stripComments(raw).trim()
    if (!line) return
    // Block delete /N... skip
    if (line.startsWith('/')) return

    // ── Variable assignment (must test before word parsing to catch #n=, Rn=, etc.)
    if (this._tryAssignment(line)) return

    // ── WHILE[cond]DOx ... ENDx (Fanuc / Okuma) ──────────────────────────────
    const whileM = line.match(/WHILE\s*\[(.+?)\]\s*DO\s*(\d+)/i)
    if (whileM) {
      const cond = this._evalExpr(whileM[1])
      const lid  = parseInt(whileM[2])
      const endIdx = this._findMatchingEnd(block.lineNum, 'END' + lid)
      if (cond) {
        this.whileStack.push({ type: 'while', condStart: block.lineNum, endIdx, lid })
      } else {
        this.state.programPointer = endIdx + 1
        this._jumped = true
      }
      return
    }
    const endM = line.match(/^END\s*(\d+)\s*$/i)
    if (endM) {
      const lid = parseInt(endM[1])
      const frame = this.whileStack[this.whileStack.length - 1]
      if (frame && frame.type === 'while' && frame.lid === lid) {
        const wraw = this.blocks[frame.condStart].raw
        const wm2  = wraw.match(/WHILE\s*\[(.+?)\]\s*DO\s*\d+/i)
        if (wm2 && this._evalExpr(wm2[1])) {
          this.state.programPointer = frame.condStart + 1
          this._jumped = true
        } else {
          this.whileStack.pop()
        }
      }
      return
    }

    // ── Siemens LOOP / ENDLOOP (infinite, break with GOTOF) ──────────────────
    if (/^\s*LOOP\s*$/i.test(line)) {
      this.whileStack.push({ type: 'loop', condStart: block.lineNum })
      return
    }
    if (/^\s*ENDLOOP\s*$/i.test(line)) {
      const frame = this.whileStack[this.whileStack.length - 1]
      if (frame) { this.state.programPointer = frame.condStart + 1; this._jumped = true }
      return
    }

    // ── IF[cond]GOTOn — Fanuc ─────────────────────────────────────────────────
    const ifGoto = line.match(/IF\s*\[(.+?)\]\s*GOTO\s*(\d+)/i)
    if (ifGoto) {
      if (this._evalExpr(ifGoto[1])) this._gotoLabel(parseFloat(ifGoto[2]))
      return
    }

    // ── IF[cond]THEN expr — Fanuc ─────────────────────────────────────────────
    const ifThen = line.match(/IF\s*\[(.+?)\]\s*THEN\s*(.+)/i)
    if (ifThen) {
      if (this._evalExpr(ifThen[1])) this._tryAssignment(ifThen[2])
      return
    }

    // ── IF cond GOTOF/GOTOB label — Siemens ───────────────────────────────────
    const sieIf = line.match(/^IF\s+(.+?)\s+GOTO([FB])\s+(\S+)/i)
    if (sieIf) {
      if (this._evalExpr(sieIf[1])) this._gotoLabel(sieIf[3])
      return
    }

    // ── GOTO n (unconditional) ────────────────────────────────────────────────
    const gtoAbs = line.match(/^GOTO\s*(\d+)\s*$/i)
    if (gtoAbs) { this._gotoLabel(parseFloat(gtoAbs[1])); return }
    const gtoNamed = line.match(/^GOTO[FB]\s+(\S+)/i)
    if (gtoNamed) { this._gotoLabel(gtoNamed[1]); return }

    // ── Standard word processing ──────────────────────────────────────────────
    this._processWords(block.tokens, line)
  }

  // ─── Word-address processing ──────────────────────────────────────────────
  _processWords(tokens, rawLine) {
    let tX = null, tY = null, tZ = null
    let tI = null, tJ = null, tK = null, tR = null
    let hasG10 = false

    for (const t of tokens) {
      if (t.type !== 'word') continue
      const v = t.value
      switch (t.word) {

        case 'G': {
          if ([0,1,2,3].includes(v)) {
            this.state.motionMode = 'G' + String(v).padStart(2, '0')
          }
          else if (v === 4)  { /* G04 dwell — no-op for simulation */ }
          else if (v === 10) { hasG10 = true }
          else if (v === 17) this.state.plane = 'G17'
          else if (v === 18) this.state.plane = 'G18'
          else if (v === 19) this.state.plane = 'G19'
          else if (v === 20) this.state.units = 'inch'
          else if (v === 21) this.state.units = 'mm'
          else if (v === 28) {
            // Reference point return (G91 G28 Z0 first moves, then homes)
            this.state.X = 0; this.state.Y = 0; this.state.Z = 0
            this._updateMachine()
          }
          else if (v === 40) this.state.cutterComp = 'G40'
          else if (v === 41) this.state.cutterComp = 'G41'
          else if (v === 42) this.state.cutterComp = 'G42'
          else if (v === 43) this.state.tlOffset = 'G43'
          else if (v === 44) this.state.tlOffset = 'G44'
          else if (v === 49) { this.state.tlOffset = 'G49'; }
          else if (v === 54)  this.state.activeOffset = 'G54'
          else if (v === 55)  this.state.activeOffset = 'G55'
          else if (v === 56)  this.state.activeOffset = 'G56'
          else if (v === 57)  this.state.activeOffset = 'G57'
          else if (v === 58)  this.state.activeOffset = 'G58'
          else if (v === 59)  this.state.activeOffset = 'G59'
          else if (v === 54.1) {
            // G54.1 Pn — extended work offset; P handled in 'P' case
            // We defer activeOffset update until P is processed
            // Store flag and handle after loop
          }
          else if (v === 90)  this.state.posMode = 'G90'
          else if (v === 91)  this.state.posMode = 'G91'
          else if (v === 500) this.state.activeOffset = 'G500' // Siemens: machine coords
          else if (v >= 505 && v <= 599) this.state.activeOffset = `G${Math.floor(v)}`
          else if (v >= 80 && v <= 89) this.state.cycleMode = 'G' + Math.floor(v)
          else if (v === 65) this._handleG65(tokens)
          break
        }

        case 'M': {
          if (v === 0 || v === 1) {
            this.state.message = 'PROGRAM STOP M' + Math.floor(v)
            this.state.isDone = true
          }
          else if (v === 2 || v === 30) this.state.isDone = true
          else if (v === 3)  this.state.spindleDir = 'M03'
          else if (v === 4)  this.state.spindleDir = 'M04'
          else if (v === 5)  this.state.spindleDir = 'M05'
          else if (v === 6) {
            const tl = this.toolTable[this.state.activeT]
            this.state.message = tl
              ? `T${this.state.activeT}: ${tl.desc ?? ''} ⌀${tl.dia ?? '?'} LC${tl.lenCut ?? '?'}`
              : `T${this.state.activeT} (no tool data)`
          }
          else if (v === 8)  this.state.coolant = true
          else if (v === 9)  this.state.coolant = false
          else if (v === 19) this.state.spindleDir = 'M19'
          else if (v === 98) this._handleM98(tokens)
          else if (v === 99) this._handleM99()
          break
        }

        case 'T': this.state.activeT = Math.floor(v); break
        case 'S': this.state.spindleRPM = v; break
        case 'F': this.state.feedrate = v; break
        case 'H': this.state.activeH = Math.floor(v); break
        case 'D': this.state.activeD = Math.floor(v); break

        case 'X': tX = this._resolveAxisVal(rawLine, 'X', v); break
        case 'Y': tY = this._resolveAxisVal(rawLine, 'Y', v); break
        case 'Z': tZ = this._resolveAxisVal(rawLine, 'Z', v); break
        case 'I': tI = v; break
        case 'J': tJ = v; break
        case 'K': tK = v; break

        case 'R': {
          if (this.dialect !== 'siemens') {
            // Route R to cycleR if a canned cycle G-code is present in this block OR already active
            const hasCycle = tokens.some(t2 => t2.word === 'G' && t2.value >= 81 && t2.value <= 89)
            if (hasCycle || this.state.cycleMode !== 'G80') {
              this.state.cycleR = v
            } else {
              tR = v  // arc radius
            }
          }
          break
        }
        case 'Q': this.state.cycleQ = v; break
        case 'P': {
          // Handle G54.1 Pn extended offset — check if G54.1 was in this block
          const g541 = tokens.find(t2 => t2.word === 'G' && Math.abs(t2.value - 54.1) < 0.01)
          if (g541) {
            this.state.activeOffset = `EWO_P${Math.floor(v)}`
          } else if (this.state.cycleMode !== 'G80') {
            this.state.cycleP = v
          }
          break
        }
        case 'L': this.state.cycleL = v; break
      }
    }

    if (hasG10) { this._handleG10(tokens, rawLine); return }

    // ── Catch axis+variable-ref moves that the tokenizer can't parse numerically
    // e.g. G00 X#104 Y#105  or  G00 X=R5 Y=R6 (Siemens)
    let _avm
    const _axVarRe = /\b([XYZ])\s*#(\d+)/gi
    while ((_avm = _axVarRe.exec(rawLine)) !== null) {
      const ax = _avm[1].toUpperCase()
      const id = _avm[2]
      const sv = this._getSystemVar(parseInt(id))
      const val = sv !== null ? sv : (this.state.vars.get(id) ?? 0)
      if (ax === 'X' && tX === null) tX = val
      if (ax === 'Y' && tY === null) tY = val
      if (ax === 'Z' && tZ === null) tZ = val
    }
    const _axEqRe = /\b([XYZ])\s*=\s*(R\d+|\[[^\]]+\])/gi
    while ((_avm = _axEqRe.exec(rawLine)) !== null) {
      const ax = _avm[1].toUpperCase()
      const val = this._evalExpr(_avm[2])
      if (ax === 'X' && tX === null) tX = val
      if (ax === 'Y' && tY === null) tY = val
      if (ax === 'Z' && tZ === null) tZ = val
    }

    if (tI !== null) this.state.arcI = tI
    if (tJ !== null) this.state.arcJ = tJ
    if (tK !== null) this.state.arcK = tK
    if (tR !== null) this.state.arcR = tR

    if (tX !== null || tY !== null || tZ !== null) {
      this._applyMotion(tX, tY, tZ)
    } else {
      // G43/H, offset change, spindle, coolant — no motion but update machine pos
      this._updateMachine()
    }
  }

  // ─── Motion application ───────────────────────────────────────────────────
  _applyMotion(rX, rY, rZ) {
    if (this.state.posMode === 'G90') {
      if (rX !== null) this.state.X = rX
      if (rY !== null) this.state.Y = rY
      if (rZ !== null) this.state.Z = rZ
    } else {
      if (rX !== null) this.state.X += rX
      if (rY !== null) this.state.Y += rY
      if (rZ !== null) this.state.Z += rZ
    }

    if (this.state.cycleMode !== 'G80') {
      // Store drill depth when Z is commanded, else reuse stored cycleZ
      if (rZ !== null) this.state.cycleZ = this.state.Z
      const drillZ = this.state.cycleZ
      const retZ   = this.state.cycleR
      this.state.message = `${this.state.cycleMode} X${this.state.X.toFixed(3)} Y${this.state.Y.toFixed(3)} Z${drillZ.toFixed(3)}`
      // Generate plunge/retract intermediate snapshots (picked up by runAll)
      // Only when an X or Y move triggers the cycle (positioning pass)
      if (rX !== null || rY !== null) {
        this.state._cycleSnaps = [
          { X: this.state.X, Y: this.state.Y, Z: retZ },    // rapid to R plane
          { X: this.state.X, Y: this.state.Y, Z: drillZ },  // feed to drill depth
          { X: this.state.X, Y: this.state.Y, Z: retZ },    // retract to R (G99)
        ]
      }
      // Leave Z at R plane (G99 return) after cycle
      this.state.Z = retZ
    }
    this._updateMachine()
  }

  // ─── Machine position update (applies work offset + TLO) ─────────────────
  _updateMachine() {
    const off = this.state.offsets[this.state.activeOffset] ?? { X:0, Y:0, Z:0 }
    let tlZ = 0
    if (this.state.activeH > 0) {
      const tl = this.toolTable[this.state.activeH]
      const tlLen = tl ? (tl.len ?? 0) : 0
      if      (this.state.tlOffset === 'G43') tlZ = +tlLen
      else if (this.state.tlOffset === 'G44') tlZ = -tlLen
    }
    this.state.MX = this.state.X + (off.X ?? 0)
    this.state.MY = this.state.Y + (off.Y ?? 0)
    this.state.MZ = this.state.Z + (off.Z ?? 0) + tlZ
    // Keep system position variables in sync
    this.state.vars.set('5041', this.state.X)
    this.state.vars.set('5042', this.state.Y)
    this.state.vars.set('5043', this.state.Z)
    this.state.vars.set('5021', this.state.MX)
    this.state.vars.set('5022', this.state.MY)
    this.state.vars.set('5023', this.state.MZ)
  }

  // ─── G10 data setting ────────────────────────────────────────────────────
  _handleG10(tokens, rawLine) {
    const lv = tokens.find(t => t.word === 'L')?.value ?? 0
    const pv = tokens.find(t => t.word === 'P')?.value ?? 0
    const xv = tokens.find(t => t.word === 'X')
    const yv = tokens.find(t => t.word === 'Y')
    const zv = tokens.find(t => t.word === 'Z')
    const rv = tokens.find(t => t.word === 'R')
    const L = Math.floor(lv), P = Math.floor(pv)

    if (L === 2) {
      // G10 L2 Pn — set work coordinate offset
      // P0=active, P1-6 = G54-G59, P7-54 = EWO P1-P48
      const key = P === 0 ? this.state.activeOffset
        : P <= 6         ? `G${53 + P}`
        : P <= 54        ? `EWO_P${P - 6}` : null
      if (key && this.state.offsets[key]) {
        if (xv) this.state.offsets[key].X = this._resolveAxisVal(rawLine, 'X', xv.value)
        if (yv) this.state.offsets[key].Y = this._resolveAxisVal(rawLine, 'Y', yv.value)
        if (zv) this.state.offsets[key].Z = this._resolveAxisVal(rawLine, 'Z', zv.value)
      }
    } else if (L === 10 || L === 11) {
      // G10 L10/11 Pn R — tool length offset geometry/wear
      if (rv) this.toolTable[P] = { ...(this.toolTable[P] ?? {}), len: rv.value }
    } else if (L === 12 || L === 13) {
      // G10 L12/13 Pn R — cutter radius comp geometry/wear
      if (rv) this.toolTable[P] = { ...(this.toolTable[P] ?? {}), dia: rv.value * 2 }
    }
  }

  // ─── Variable assignment ─────────────────────────────────────────────────
  _tryAssignment(line) {
    const clean = this._stripComments(line).trim()
    if (!clean) return false

    // SETVNM / GETNM — Fanuc variable naming builtins (accept and no-op)
    if (/^(?:SET|GET)VNM/i.test(clean)) return true

    // #[NAME] = expr — named variable (user or system)
    const bracketM = clean.match(/^#\[([^\]]+)\]\s*=\s*(.+)$/i)
    if (bracketM) {
      const name = bracketM[1].trim().toUpperCase()
      const val  = this._evalExpr(bracketM[2])
      this._setNamedVar(name, val)
      return true
    }

    // #_NAME = expr — Fanuc system named variable
    const sysM = clean.match(/^#_([A-Z][A-Z0-9_]*)\s*=\s*(.+)$/i)
    if (sysM) {
      this._setNamedVar('_' + sysM[1].toUpperCase(), this._evalExpr(sysM[2]))
      return true
    }

    // #n = expr  |  Rn = expr  |  Vn = expr  |  VC[n] = expr
    const numM = clean.match(/^(?:#(\d+)|R(\d+)|V(\d+)|VC\[(\d+)\])\s*=\s*(.+)$/i)
    if (numM) {
      const id  = numM[1] ?? numM[2] ?? numM[3] ?? numM[4]
      const val = this._evalExpr(numM[5])
      this._setNumVar(id, val)
      return true
    }

    // Siemens: DEF INT/REAL/BOOL/STRING varname = expr
    const defM = clean.match(/^DEF\s+\w+\s+([A-Z_]\w*)\s*(?:=\s*(.+))?$/i)
    if (defM) {
      if (defM[2]) this.state.namedVars.set(defM[1].toUpperCase(), this._evalExpr(defM[2]))
      return true
    }

    // Siemens: existing named var = expr  (re-assignment without DEF)
    const sieM = clean.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/i)
    if (sieM && this.state.namedVars.has(sieM[1].toUpperCase())) {
      this.state.namedVars.set(sieM[1].toUpperCase(), this._evalExpr(sieM[2]))
      return true
    }

    return false
  }

  _setNumVar(id, val) {
    const n = parseInt(id)
    if (n === 3000) {
      this.state.isError = true
      this.state.error = `P/S ALARM ${Math.floor(val)}`
    } else if (n === 3006) {
      this.state.message = `STOP: ${val}`
    } else {
      this.state.vars.set(String(id), val)
    }
  }

  _setNamedVar(name, val) {
    // Resolve name to system var number if applicable
    const sysNum = FANUC_NAMED[name] ?? FANUC_NAMED[name.startsWith('_') ? name : '_' + name]
    if (sysNum !== undefined) {
      this._setNumVar(String(sysNum), val)
    }
    this.state.namedVars.set(name, val)
  }

  // ─── Expression evaluator ────────────────────────────────────────────────
  _evalExpr(expr) {
    let e = String(expr).trim()
    e = this._stripComments(e).trim()
    if (!e) return 0

    // 1. #[DIGITS] — direct numeric bracket (#[100] same as #100)
    e = e.replace(/#\[(\d+)\]/g, (_, id) => {
      const sv = this._getSystemVar(parseInt(id))
      return sv !== null ? sv : (this.state.vars.get(id) ?? 0)
    })

    // 2. #[NAME] — named variable bracket form
    e = e.replace(/#\[([A-Z_][A-Z0-9_. ]*)\]/gi, (_, name) => {
      const key = name.trim().toUpperCase()
      const sysNum = FANUC_NAMED[key] ?? FANUC_NAMED['_' + key]
      if (sysNum !== undefined) {
        const sv = this._getSystemVar(sysNum)
        return sv !== null ? sv : (this.state.vars.get(String(sysNum)) ?? 0)
      }
      return this.state.namedVars.get(key) ?? this.state.vars.get(key) ?? 0
    })

    // 3. #_NAME — system named variable (underscore prefix, no brackets)
    e = e.replace(/#_([A-Z][A-Z0-9_]*)/gi, (_, name) => {
      const key = '_' + name.toUpperCase()
      const sysNum = FANUC_NAMED[key]
      if (sysNum !== undefined) {
        const sv = this._getSystemVar(sysNum)
        return sv !== null ? sv : (this.state.vars.get(String(sysNum)) ?? 0)
      }
      return this.state.namedVars.get(name.toUpperCase()) ?? 0
    })

    // 4. #n — numeric variable
    e = e.replace(/#(\d+)/g, (_, id) => {
      const sv = this._getSystemVar(parseInt(id))
      return sv !== null ? sv : (this.state.vars.get(id) ?? 0)
    })

    // 5. Rn — Siemens R-variables (ensure word boundary so ROUND/REPEAT don't match)
    e = e.replace(/\bR(\d+)\b/g, (_, id) => this.state.vars.get(id) ?? 0)

    // 6. Vn — Okuma V-variables
    e = e.replace(/\bV(\d+)\b/g, (_, id) => this.state.vars.get(id) ?? 0)

    // 7. Fanuc ATAN[y]/[x] — 4-quadrant arctangent (must be before generic ATAN)
    e = e.replace(/ATAN\[([^\]]+)\]\s*\/\s*\[([^\]]+)\]/gi, (_, y, x) =>
      Math.atan2(this._evalExpr(y), this._evalExpr(x)) * 180 / Math.PI)

    // 8. Math functions — bracket [arg] and paren (arg) syntax
    const FUNS = {
      SIN:   x => Math.sin(x * Math.PI / 180),
      COS:   x => Math.cos(x * Math.PI / 180),
      TAN:   x => Math.tan(x * Math.PI / 180),
      ASIN:  x => Math.asin(Math.max(-1, Math.min(1, x))) * 180 / Math.PI,
      ACOS:  x => Math.acos(Math.max(-1, Math.min(1, x))) * 180 / Math.PI,
      ATAN:  x => Math.atan(x) * 180 / Math.PI,
      SQRT:  x => Math.sqrt(Math.abs(x)),
      ABS:   Math.abs,
      ROUND: Math.round,
      FIX:   Math.trunc,
      FUP:   Math.ceil,
      LN:    x => Math.log(Math.abs(x) + 1e-100),
      EXP:   Math.exp,
      MAX:   (...a) => Math.max(...a),
      MIN:   (...a) => Math.min(...a),
    }
    for (const [name, fn] of Object.entries(FUNS)) {
      const re1 = new RegExp(name + '\\[([^\\]]+)\\]', 'gi')
      e = e.replace(re1, (_, inner) => {
        const args = this._splitArgs(inner).map(a => this._evalExpr(a))
        return fn(...args)
      })
      const re2 = new RegExp(name + '\\(([^)]+)\\)', 'gi')
      e = e.replace(re2, (_, inner) => {
        const args = this._splitArgs(inner).map(a => this._evalExpr(a))
        return fn(...args)
      })
    }

    // 9. Relational & logical operators
    e = e.replace(/\bEQ\b/gi, '===').replace(/\bNE\b/gi, '!==')
         .replace(/\bGT\b/gi, '>').replace(/\bGE\b/gi, '>=')
         .replace(/\bLT\b/gi, '<').replace(/\bLE\b/gi, '<=')
         .replace(/\bAND\b/gi, '&&').replace(/\bOR\b/gi, '||')
         .replace(/\bNOT\b/gi, '!').replace(/\bMOD\b/gi, '%')
         .replace(/\bXOR\b/gi, '^')

    // 10. Brackets → parens  (only remaining plain brackets at this point)
    e = e.replace(/\[/g, '(').replace(/\]/g, ')')

    try {
      const result = Function('"use strict"; return (' + e + ')')()
      if (typeof result === 'boolean') return result ? 1 : 0
      return typeof result === 'number' ? result : 0
    } catch {
      return 0
    }
  }

  // ─── System variable read (#3001, #3011, #5021-5043, #4001-4022, etc.) ────
  _getSystemVar(n) {
    // Work position
    if (n === 5041) return this.state.X
    if (n === 5042) return this.state.Y
    if (n === 5043) return this.state.Z
    // Machine position
    if (n === 5021) return this.state.MX
    if (n === 5022) return this.state.MY
    if (n === 5023) return this.state.MZ
    // Timers / date / time
    if (n === 3001) return Date.now() % 86400000
    if (n === 3011) { const d = new Date(); return parseInt(`${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`) }
    if (n === 3012) { const d = new Date(); return parseInt(`${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`) }
    // Modal groups (group 1 = motion, group 3 = pos mode, group 6 = units)
    if (n === 4001) return parseInt(this.state.motionMode.slice(1))
    if (n === 4003) return parseInt(this.state.posMode.slice(1))
    if (n === 4006) return this.state.units === 'inch' ? 20 : 21
    // Active T, S, F, H, D
    if (n === 4120) return this.state.activeT
    if (n === 4119) return this.state.spindleRPM
    if (n === 4109) return this.state.feedrate
    if (n === 4115) return this.state.activeH
    if (n === 4111) return this.state.activeD
    // Tool offset data: #2000-range
    if (n >= 2001 && n <= 2200) {
      const tNum = n - 2000
      const tl = this.toolTable[tNum]
      return tl ? (tl.len ?? 0) : 0
    }
    // Single block / feed hold state stubs
    if (n === 3003 || n === 3004) return 0
    return null // not a system var — caller reads from vars Map
  }

  // ─── Resolve axis value from raw line (handles X#n, X=[expr], X[expr]) ───
  _resolveAxisVal(rawLine, axis, tokenNum) {
    // X#n — variable reference without brackets (e.g., X#100)
    const varRef = rawLine.match(new RegExp('\\b' + axis + '#(\\d+)', 'i'))
    if (varRef) {
      const sv = this._getSystemVar(parseInt(varRef[1]))
      return sv !== null ? sv : (this.state.vars.get(varRef[1]) ?? 0)
    }
    // X=[expr] or X=Rn (Siemens) or X=[#100+5.0] (Fanuc)
    const eqRef = rawLine.match(new RegExp('\\b' + axis + '\\s*=\\s*([^\\s,;]+)', 'i'))
    if (eqRef) {
      const s = eqRef[1]
      if (/^[\[#R]/.test(s)) return this._evalExpr(s)
    }
    // X[expr] — bare bracket expression
    const brRef = rawLine.match(new RegExp('\\b' + axis + '\\[([^\\]]+)\\]', 'i'))
    if (brRef) return this._evalExpr(brRef[1])
    // Standard numeric value from tokenizer
    return tokenNum
  }

  // ─── Goto ────────────────────────────────────────────────────────────────
  _gotoLabel(label) {
    const key = typeof label === 'number' ? label : String(label).toUpperCase()
    const idx = this.labels.get(key)
    if (idx !== undefined) {
      this.state.programPointer = idx
      this._jumped = true
    } else {
      this.state.error = `GOTO target not found: ${label}`
      this.state.isError = true
    }
  }

  // ─── Find matching END for a WHILE loop (searches forward for /END\d/) ───
  _findMatchingEnd(startLine, pattern) {
    const re = typeof pattern === 'string'
      ? new RegExp('^' + pattern + '\\b', 'i')
      : new RegExp('END\\s*' + pattern + '\\b', 'i')
    for (let i = startLine + 1; i < this.blocks.length; i++) {
      if (re.test(this.blocks[i].raw.trim())) return i
    }
    return this.blocks.length - 1
  }

  // ─── Subroutines ────────────────────────────────────────────────────────
  _handleM98(tokens) {
    const pTok = tokens.find(t => t.word === 'P')
    const lTok = tokens.find(t => t.word === 'L')
    if (!pTok) return
    const pVal = Math.floor(pTok.value)
    const target = this.labels.get(pVal) ?? this.labels.get(pTok.value)
    if (target === undefined) {
      this.state.error = `Subprogram O${pVal} not found`
      this.state.isError = true
      return
    }
    const repeats = lTok ? Math.floor(lTok.value) : 1
    this.callStack.push({ returnPtr: this.state.programPointer + 1, repeatsLeft: repeats - 1 })
    this.state.programPointer = target
    this._jumped = true
  }

  _handleG65(tokens) { this._handleM98(tokens) }

  _handleM99() {
    if (this.callStack.length === 0) { this.state.isDone = true; return }
    const frame = this.callStack[this.callStack.length - 1]
    if (frame.repeatsLeft > 0) {
      frame.repeatsLeft--
      this.state.programPointer = frame.returnPtr - 1
      this._jumped = true
    } else {
      this.callStack.pop()
      this.state.programPointer = frame.returnPtr
      this._jumped = true
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  _splitArgs(inner) {
    // Split comma-separated function args, respecting nested brackets/parens
    const args = []
    let depth = 0, cur = ''
    for (const c of inner) {
      if (c === '[' || c === '(') { depth++; cur += c }
      else if (c === ']' || c === ')') { depth--; cur += c }
      else if (c === ',' && depth === 0) { args.push(cur.trim()); cur = '' }
      else cur += c
    }
    if (cur.trim()) args.push(cur.trim())
    return args
  }

  _stripComments(line) {
    return line.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').replace(/\/\/.*/, '')
  }

  _tokenize(line) {
    const clean = this._stripComments(line).trim()
    if (!clean) return []
    const tokens = []
    const re = /([A-Z])\s*([-+]?\d*\.?\d+(?:E[-+]?\d+)?)/gi
    let m
    while ((m = re.exec(clean)) !== null) {
      tokens.push({ type: 'word', word: m[1].toUpperCase(), value: parseFloat(m[2]) })
    }
    return tokens
  }
}
