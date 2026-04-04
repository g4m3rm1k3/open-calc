import linearMotion from './01-linear-motion.js'
import circularArcs from './02-circular-arcs.js'
import coordinateOffsets from './03-coordinate-offsets.js'
import macroVariables from './04-macro-variables.js'
import logicLoops from './05-logic-loops.js'
import macroSubroutines from './06-macro-subroutines.js'
import variableScopes from './07-variable-scopes.js'
import systemVariables from './08-system-variables.js'
import controllerDialects from './09-controller-dialects.js'

export default {
  id: 'cnc-1',
  number: 'cnc-1',
  title: 'CNC Macro Systems',
  slug: 'cnc-logic',
  description: 'Master the logic behind the machine. From G-code motion fundamentals and modal state machines to advanced parametric programming in Fanuc, Siemens, and Okuma (UserTask). Learn how to build intelligent, adaptive toolpaths from first principles.',
  color: 'slate',
  lessons: [
    linearMotion,
    circularArcs,
    coordinateOffsets,
    macroVariables,
    logicLoops,
    macroSubroutines,
    variableScopes,
    systemVariables,
    controllerDialects,
  ],
}
