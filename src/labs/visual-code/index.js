export { default as VisualCodeStudio } from "./VisualCodeStudio";
export { BLOCK_COLORS, BLOCK_GROUPS, BLOCK_LIBRARY, createBlock, blockDefinition, canContainChildren, childOptionsFor } from "./blocks";
export {
  DEFAULT_PROJECT,
  TARGETS,
  cloneProject,
  findBlock,
  insertBlock,
  moveBlock,
  normalizeProject,
  parseProject,
  registerTarget,
  removeBlock,
  serializeProject,
  transpileProject,
  updateBlock,
} from "./transpiler";
export { buildRunnableHtml } from "./runJavaScript";
