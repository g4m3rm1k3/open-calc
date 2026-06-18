const LOADERS = import.meta.glob('./**/index.jsx')

export async function getGameEntry(key) {
  const loader = LOADERS[`./${key}/index.jsx`]
  if (!loader) return null
  const mod = await loader()
  return {
    key,
    ...mod.meta,
    component: mod.default,
  }
}
