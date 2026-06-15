// Used only by LabShell — lazy-loads lab components on demand.
// Display metadata (for LabsPage / LabsPanel) lives in src/data/labs.js.
const LOADERS = import.meta.glob('./**/index.jsx')

export async function getLabEntry(key) {
  const loader = LOADERS[`./${key}/index.jsx`]
  if (!loader) return null
  const mod = await loader()
  return {
    key,
    ...mod.meta,
    path: mod.meta?.path ?? `/lab/${key}`,
    component: mod.default,
  }
}
