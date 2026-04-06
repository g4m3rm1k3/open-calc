// ═══════════════════════════════════════════════════════════════
// CNC MACRO SYSTEMS — Full Curriculum (28 lessons)
// Fanuc-first. Complete beginner → Macro B parametric programming.
// Both metric and imperial throughout.
// ═══════════════════════════════════════════════════════════════

// ── Part 1: CNC Foundations ──────────────────────────────────
import whatIsCnc          from './00-what-is-cnc.js'
import machineAxes        from './01-machine-axes.js'
import unitsAndMeasurement from './02-units-and-measurement.js'

// ── Part 2: The Language of CNC ─────────────────────────────
import programStructure    from './03-program-structure.js'
import modalGroups         from './04-modal-groups.js'
import absoluteVsIncremental from './05-absolute-vs-incremental.js'

// ── Part 3: Setup & Positioning ─────────────────────────────
import machineHome        from './06-machine-home.js'
import coordinateOffsets  from './03-coordinate-offsets.js'   // order 7
import toolLengthComp     from './08-tool-length-comp.js'

// ── Part 4: Core Motion ──────────────────────────────────────
import rapidMotion        from './09-rapid-motion.js'
import linearMotion       from './01-linear-motion.js'         // order 10 (G01)
import circularArcs       from './02-circular-arcs.js'         // order 11
import planeSelection     from './12-plane-selection.js'       // order 12

// ── Part 5: Machine Functions ────────────────────────────────
import spindleCoolant     from './13-spindle-coolant.js'
import toolChanges        from './14-tool-changes.js'          // order 14
import dwell              from './15-dwell.js'                 // order 15
import cannedCycles       from './16-canned-cycles.js'

// ── Part 6: Program Architecture ────────────────────────────
import feedsAndSpeeds     from './17-feeds-and-speeds.js'
import programFormat      from './18-program-format.js'
import macroSubroutines   from './06-macro-subroutines.js'     // order 19

// ── Part 7: Fanuc Macro B ────────────────────────────────────
import pseudolanguage     from './20-pseudolanguage-intro.js'
import macroVariables     from './04-macro-variables.js'       // order 21 (renumbered)
import arithmeticFunctions from './21-arithmetic-functions.js'
import logicLoops         from './05-logic-loops.js'           // order 23
import variableScopes     from './07-variable-scopes.js'       // order 24
import systemVariables    from './08-system-variables.js'      // order 25
import parametricProgramming from './25-parametric-programming.js' // order 26

// ── Part 8: Advanced Topics ──────────────────────────────────
import lookaheadSmoothing from './26-lookahead-smoothing.js'   // order 27
import controllerDialects from './09-controller-dialects.js'   // order 28

export default {
  id: 'cnc-1',
  number: 'cnc-1',
  title: 'CNC Macro Systems',
  slug: 'cnc-logic',
  description:
    'Master the language and logic of the machine — from first principles. ' +
    'What CNC is, how axes and units work, the grammar of G-code, modal state machines, ' +
    'motion, tooling, and Fanuc Macro B parametric programming. ' +
    'Metric and imperial throughout. Fanuc-first with dialect notes for Siemens and Okuma.',
  color: 'slate',
  lessons: [
    // Part 1 — Foundations
    whatIsCnc,
    machineAxes,
    unitsAndMeasurement,

    // Part 2 — The Language of CNC
    programStructure,
    modalGroups,
    absoluteVsIncremental,

    // Part 3 — Setup & Positioning
    machineHome,
    coordinateOffsets,
    toolLengthComp,

    // Part 4 — Core Motion
    rapidMotion,
    linearMotion,
    circularArcs,
    planeSelection,

    // Part 5 — Machine Functions
    spindleCoolant,
    toolChanges,
    dwell,
    cannedCycles,

    // Part 6 — Program Architecture
    feedsAndSpeeds,
    programFormat,
    macroSubroutines,

    // Part 7 — Fanuc Macro B
    pseudolanguage,
    macroVariables,
    arithmeticFunctions,
    logicLoops,
    variableScopes,
    systemVariables,
    parametricProgramming,

    // Part 8 — Advanced Topics
    lookaheadSmoothing,
    controllerDialects,
  ],
}
