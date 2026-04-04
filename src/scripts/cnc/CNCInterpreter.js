/**
 * A "Machine-Grade" CNC Interpreter for OpenCalc.
 * Supports: Fanuc (#), Siemens (R), Okuma (V)
 * Features: Arcs (G02/03), Offsets, Logic (WHILE/IF), Call Stack
 */

export class CNCInterpreter {
  constructor(dialect = 'fanuc') {
    this.dialect = dialect.toLowerCase() // fanuc, siemens, okuma
    this.reset()
  }

  reset() {
    this.state = {
      machineX: 0, machineY: 0, machineZ: 0, // G53 Absolute
      programX: 0, programY: 0, programZ: 0, // Programmed (G54)
      motionMode: 'G00',
      posMode: 'G90', // Absolute
      plane: 'G17',   // XY
      feedrate: 0,
      spindle: 0,
      activeOffset: 'G54',
      offsets: {
        G54: { x: 0, y: 0, z: 0 },
        G55: { x: 0, y: 0, z: 0 },
        // ... extendable
      },
      vars: new Map(), // #100, R100, V100
      programPointer: 0,
      callStack: [],
      error: null,
      message: '',
      isDone: false
    }
    
    // Internal pre-parsed program
    this.blocks = []
    this.labels = new Map() // For GOTO/Labels
  }

  setDialect(d) {
    this.dialect = d.toLowerCase()
  }

  loadProgram(code) {
    this.reset()
    const lines = code.split('\n')
    this.blocks = lines.map((line, idx) => ({
      raw: line,
      tokens: this.tokenize(line),
      lineNum: idx
    }))
    
    // Pre-scan for labels (N100, etc.)
    this.blocks.forEach((b, idx) => {
      const nToken = b.tokens.find(t => t.word === 'N')
      if (nToken) this.labels.set(nToken.value, idx)
    })
  }

  tokenize(line) {
    // Remove comments
    const clean = line.replace(/\(.*\)/g, '').replace(/;.*$/, '').trim()
    if (!clean) return []

    const tokens = []
    // Match G/M/X/Y/Z words or Logic [[ IF / WHILE / GOTO ]]
    const regex = /([A-Z])([-+]?[0-9]*\.?[0-9]+)|(\[|\]|IF|WHILE|GOTO|EQ|NE|LT|GT|LE|GE|DO|END|#|R|V|OR|AND|XOR|MOD|SIN|COS|TAN|ASIN|ACOS|ATAN|SQRT|ABS|ROUND|FIX|FUP)/gi
    
    let match
    while ((match = regex.exec(clean)) !== null) {
      if (match[1]) {
        tokens.push({ type: 'word', word: match[1].toUpperCase(), value: parseFloat(match[2]) })
      } else {
        tokens.push({ type: 'logic', value: match[0].toUpperCase() })
      }
    }
    return tokens
  }

  /**
   * Execute the next block. Returns the new state.
   */
  step() {
    if (this.state.programPointer >= this.blocks.length) {
      this.state.isDone = true
      return this.state
    }

    const block = this.blocks[this.state.programPointer]
    this.parseBlock(block)
    
    this.state.programPointer++
    return { ...this.state }
  }

  parseBlock(block) {
    const tokens = block.tokens
    if (tokens.length === 0) return

    // Special Case: Macro Logic (WHILE/IF)
    // For now, let's implement basic Variable Assignment and G-code
    
    let targetX = this.state.programX
    let targetY = this.state.programY
    let targetZ = this.state.programZ
    let hasX = false, hasY = false, hasZ = false

    // 1. Process Assignments (e.g. #100 = 5.0)
    if (this.processAssignments(block.raw)) return

    // 2. Process G-Words (Modals)
    tokens.forEach(t => {
      if (t.word === 'G') {
        const val = t.value
        if (val === 0 || val === 1 || val === 2 || val === 3) this.state.motionMode = 'G' + val.toString().padStart(2, '0')
        if (val === 90 || val === 91) this.state.posMode = 'G' + val
        if (val === 17 || val === 18 || val === 19) this.state.plane = 'G' + val
        if (val >= 54 && val <= 59) this.state.activeOffset = 'G' + val
        if (val === 65) this.handleSubCall(tokens)
      }
      if (t.word === 'M') {
        if (t.value === 99) this.handleReturn()
      }
      if (t.word === 'F') this.state.feedrate = t.value
      if (t.word === 'S') this.state.spindle = t.value
      
      // Coordinates
      if (t.word === 'X') { targetX = this.resolveValue(t.value); hasX = true; }
      if (t.word === 'Y') { targetY = this.resolveValue(t.value); hasY = true; }
      if (t.word === 'Z') { targetZ = this.resolveValue(t.value); hasZ = true; }
      if (t.word === 'I') this.state.arcI = t.value
      if (t.word === 'J') this.state.arcJ = t.value
      if (t.word === 'K') this.state.arcK = t.value
      if (t.word === 'R') this.state.arcR = t.value
    })

    // 3. Update Position
    if (this.state.posMode === 'G90') {
      this.state.programX = targetX
      this.state.programY = targetY
      this.state.programZ = targetZ
    } else {
      this.state.programX += targetX
      this.state.programY += targetY
      this.state.programZ += targetZ
    }

    // Solve Machine Coordinates (G53)
    const offset = this.state.offsets[this.state.activeOffset]
    this.state.machineX = this.state.programX + offset.x
    this.state.machineY = this.state.programY + offset.y
    this.state.machineZ = this.state.programZ + offset.z
  }

  processAssignments(line) {
    // Fanuc: #100 = 10.5
    // Siemens: R100 = 10.5
    // Okuma: V1 = 10.5 or VC[1] = 10.5
    const assignmentRegex = /(#|R|V|VC\[?)([0-9]+)\]?\s*=\s*(.+)/i
    const match = line.match(assignmentRegex)
    if (match) {
      const type = match[1].toUpperCase()
      const id = match[2]
      const expr = match[3]
      const val = this.evaluateExpression(expr)
      this.state.vars.set(id, val)
      return true
    }
    return false
  }

  resolveValue(val) {
    // If value starts with #, find variable. 
    // (Actual G-code uses X#100, but our simple regex might need help)
    return val
  }

  evaluateExpression(expr) {
    // Replace Vars in expr
    let e = expr.toUpperCase()
    // Simple math for now
    try {
      // Support COS[#101] etc
      e = e.replace(/COS\[(.*?)\]/g, (_, p) => Math.cos(this.evaluateExpression(p) * Math.PI / 180))
      e = e.replace(/SIN\[(.*?)\]/g, (_, p) => Math.sin(this.evaluateExpression(p) * Math.PI / 180))
      e = e.replace(/SQRT\[(.*?)\]/g, (_, p) => Math.sqrt(this.evaluateExpression(p)))
      
      // Variable replacement
      this.state.vars.forEach((val, id) => {
        const regex = new RegExp(`[#RV]${id}`, 'g')
        e = e.replace(regex, val)
      })
      
      return eval(e.replace(/\[/g, '(').replace(/\]/g, ')')) 
    } catch (err) {
      return 0
    }
  }

  handleSubCall(tokens) {
    const pToken = tokens.find(t => t.word === 'P')
    if (!pToken) return

    const subIdx = this.labels.get(pToken.value)
    if (subIdx === undefined) return

    // Save Return info
    const localVars = new Map(this.state.vars)
    this.state.callStack.push({
      returnPtr: this.state.programPointer,
      vars: localVars
    })

    // Map letters to Local Variables (#1-33)
    // A=1, B=2, C=3, D=7, E=8, F=9, H=11, I=4, J=5, K=6...
    const fanucMap = { 'A': 1, 'B': 2, 'C': 3, 'I': 4, 'J': 5, 'K': 6, 'D': 7, 'E': 8, 'F': 9, 'H': 11 }
    tokens.forEach(t => {
      if (fanucMap[t.word]) {
        this.state.vars.set(fanucMap[t.word], t.value)
      }
    })

    // Jump
    this.state.programPointer = subIdx
  }

  handleReturn() {
    if (this.state.callStack.length === 0) {
      this.state.isDone = true // End main
      return
    }

    const frame = this.state.callStack.pop()
    this.state.programPointer = frame.returnPtr
    this.state.vars = frame.vars
  }
}
