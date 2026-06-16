// Auto-discovers every src/tools/<key>/index.jsx — each exports a default
// overlay component plus a `meta` object (label, group, icon/glyph, eventTool).
// Adding a new tool folder is enough to make it show up in the nav; no
// AppShell edit needed for the button itself.
const MODULES = import.meta.glob('./*/index.jsx', { eager: true })

export const TOOLS = Object.entries(MODULES)
  .map(([path, mod]) => ({
    key: path.split('/')[1],
    component: mod.default,
    ...mod.meta,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

export function getTool(key) {
  return TOOLS.find((t) => t.key === key) ?? null
}

export function toolsByGroup(group) {
  return TOOLS.filter((t) => t.group === group)
}
