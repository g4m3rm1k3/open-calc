// Used only by LabShell — lazy-loads lab components on demand.
// Display metadata (for LabsPage / LabsPanel) comes from labRegistryLoader.js.
import { LABS } from './labRegistryLoader.js'

const LOADERS = import.meta.glob('./**/index.{jsx,tsx}')

export async function getLabEntry(key) {
  const loader = LOADERS[`./${key}/index.tsx`] ?? LOADERS[`./${key}/index.jsx`]
  if (!loader) return null
  const mod = await loader()
  const meta = LABS.find((l) => l.key === key)
  return {
    key,
    ...meta,
    path: meta?.path ?? `/lab/${key}`,
    component: mod.default,
  }
}
