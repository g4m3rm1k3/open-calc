// Eagerly loads only meta (label, emoji, path, tags, cover, etc.) from each
// lab's meta.js. Lab components stay in index.jsx/index.tsx (or a page under
// src/pages/) and are lazy-loaded by labLoader.js / App.jsx on demand.
const META = import.meta.glob('./*/meta.js', { eager: true })

export const LABS = Object.entries(META)
  .map(([path, mod]) => ({
    key: path.split('/')[1],
    ...mod.default,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
