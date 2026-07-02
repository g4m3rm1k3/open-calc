/**
 * @opencalc/openmat
 *
 * MATLAB-compatible numeric computation engine.
 * Runs in-browser (ESM) or in Node.js (CJS/ESM).
 *
 * Primary entry points:
 *   executeScript(source, options?) → ExecutionResult
 *   createExecutionEngine(options?) → engine object
 *   runOpenMatScript(source, options?) → NotebookResult (notebook cells)
 */

// Re-export public types
export type {
  Value,
  ComplexLike,
  SymbolicValue,
  MultiValue,
  HistValue,
  HistData,
  WorkspaceEntry,
  Control,
  SliderControl,
  DropdownControl,
  ExecutionResult,
  EngineOptions,
  EngineExtension,
  NotebookResult,
  PlotState,
  PlotSeries,
  ColormapName,
} from './types.js'

// Re-export all engine functions and constants
export {
  // mathjs instance (for advanced users who need raw mathjs access)
  math,

  // Value helpers
  toPlain,
  isComplexLike,
  realValue,
  isMatrix,
  isCollection,
  mapDeep,

  // Array / vector helpers
  normalizeVector,
  flattenNumbers,
  toNumericMatrix,
  inferSize,
  makeDiagonal,
  makeRandomArray,
  toColumnSeries,
  buildLinspace,
  buildLogspace,
  meshgrid,
  clampValue,

  // Vector / matrix operations
  diffArray,
  cumulative,
  dotProduct,
  crossProduct,
  dotMultiply,
  dotDivide,
  dotPow,

  // Polynomial & interpolation
  polyfit,
  polyval,
  interp1Array,
  trapzArray,
  gradientArray,

  // Statistics
  statMean,
  statMedian,
  statStd,
  statVar,
  statMin,
  statMax,
  statSum,
  statProd,
  statSort,
  statUnique,
  statMod,
  statRem,
  statFix,
  statAny,
  statAll,
  statFind,
  reshapeArray,
  repmatArray,
  histArray,
  companionRoots,

  // Linear algebra
  rrefMatrix,
  singularValues,
  matrixRank,
  conditionNumber,
  determinantValue,
  luFactorization,
  orthonormalBasis,
  svdDecomp,

  // Formatting & workspace
  sprintfFormat,
  formatValue,
  inferClass,
  estimateBytes,
  summarizeValue,
  buildWorkspaceSnapshot,

  // Figure / plot
  SERIES_COLORS,
  makePlotState,
  buildFigureFromPlotState,
  convertSurfaceTo3DConfig,
  convertPointSeries3DConfig,

  // Compatibility
  detectMatlabCompatibilityWarnings,

  // Transpiler (advanced use)
  parseBlocks,
  preprocessLine,
  preprocessLine as normalizeLine,

  // Engine helpers
  registerElementwiseUnary,
  HELP_TEXT,

  // Primary API
  createExecutionEngine,
  executeScript,
  runOpenMatScript,
} from './openmatEngine.js'
