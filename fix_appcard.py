with open('src/components/ui/AppCard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CourseCard hover box-shadow rectangle glitch
content = content.replace(
    'function CourseCard({ item, chapters, getLessonStatus, meta, ref })',
    'function CourseCard({ item, chapters, getLessonStatus, meta, innerRef })'
)
content = content.replace(
    '<div ref={ref} className="group flex flex-col overflow-hidden rounded-[24px]',
    '<div ref={innerRef} className="group flex flex-col overflow-hidden rounded-[24px]'
)
content = content.replace(
    '<Link\\n        ref={ref}\\n        to={item.path}\\n        className="block"\\n        onMouseEnter={() => { if (ref.current) ref.current.style.boxShadow = meta.glow }}\\n        onMouseLeave={() => { if (ref.current) ref.current.style.boxShadow = \\'\\' }}\\n      >\\n        <CourseCard item={item} chapters={chapters} getLessonStatus={getLessonStatus} meta={meta} />\\n      </Link>',
    '<Link\\n        to={item.path}\\n        className="block"\\n        onMouseEnter={() => { if (ref.current && document.documentElement.classList.contains(\\'dark\\')) ref.current.style.boxShadow = meta.glow }}\\n        onMouseLeave={() => { if (ref.current && document.documentElement.classList.contains(\\'dark\\')) ref.current.style.boxShadow = \\'\\' }}\\n      >\\n        <CourseCard innerRef={ref} item={item} chapters={chapters} getLessonStatus={getLessonStatus} meta={meta} />\\n      </Link>'
)
# We also have to handle windows line endings carefully, so regex is better for the Link block
import re
content = re.sub(
    r'<Link[^>]*?>\s*<CourseCard item=\{item\} chapters=\{chapters\} getLessonStatus=\{getLessonStatus\} meta=\{meta\} />\s*</Link>',
    '''<Link
        to={item.path}
        className="block"
        onMouseEnter={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = meta.glow }}
        onMouseLeave={() => { if (ref.current && document.documentElement.classList.contains('dark')) ref.current.style.boxShadow = '' }}
      >
        <CourseCard innerRef={ref} item={item} chapters={chapters} getLessonStatus={getLessonStatus} meta={meta} />
      </Link>''',
    content
)


# Fix Progress bar pop
old_prog = '<div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">\\n            <div className={`h-full rounded-full bg-gradient-to-r ${meta.header} transition-all`}\\n              style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : \\'0%\\' }} />\\n          </div>'

new_prog = '''<div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 relative">
            <div className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${meta.header} transition-all duration-500`}
              style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%', boxShadow: pct > 0 ? meta.glow : 'none' }} />
          </div>'''

content = content.replace(
    '<div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">',
    '<div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 relative">'
)
content = content.replace(
    '<div className={`h-full rounded-full bg-gradient-to-r ${meta.header} transition-all`}',
    '<div className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${meta.header} transition-all duration-500`}'
)
content = content.replace(
    "style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%' }} />",
    "style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%', boxShadow: pct > 0 ? meta.glow.replace('32px', '12px').replace('0.50', '0.8') : 'none' }} />"
)

with open('src/components/ui/AppCard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AppCard updated.")
