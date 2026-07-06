const LESSON_MODULES = import.meta.glob('./markdown/*.md', { query: '?raw', import: 'default', eager: true })

function pathToSlug(path) {
  return path.replace(/^.*\/markdown\//, '').replace(/\.md$/, '')
}

function titleFromContent(raw, slug) {
  const h1 = raw.split('\n').find((l) => l.startsWith('# '))
  return h1 ? h1.replace(/^# /, '').trim() : slug.replace(/-/g, ' ')
}

export const VUE_LESSONS = Object.entries(LESSON_MODULES)
  .map(([path, raw]) => {
    const slug = pathToSlug(path)
    return { slug, title: titleFromContent(raw, slug), content: raw }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
