// Eagerly loads only meta (label, group, icon, etc.) from each tool's meta.js.
// Tool components stay in index.jsx and are lazy-loaded by AppShell on demand.
const META = import.meta.glob('./*/meta.js', { eager: true })

export const TOOLS = Object.entries(META)
  .map(([path, mod]) => ({
    key: path.split('/')[1],
    ...mod.default,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

export function toolsByGroup(group) {
  return TOOLS.filter((t) => t.group === group)
}
