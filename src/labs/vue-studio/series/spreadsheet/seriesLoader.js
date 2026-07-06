const LESSON_MODULES = import.meta.glob('./markdown/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function slugFromPath(path) {
  return path.replace('./markdown/', '').replace('.md', '')
}

function titleFromContent(raw, slug) {
  const match = raw.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : slug
}

export const SPREADSHEET_LESSONS = Object.entries(LESSON_MODULES)
  .map(([path, raw]) => {
    const slug = slugFromPath(path)
    return { slug, title: titleFromContent(raw, slug), content: raw }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))
