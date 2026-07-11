import { useState } from 'react'
import type { UiTheme } from './types'

interface Props {
  html: string
  ui: UiTheme
}

interface TreeNode {
  tag: string
  id: string
  classes: string[]
  attrs: { name: string; value: string }[]
  text: string
  children: TreeNode[]
  selfClosing: boolean
}

const SELF_CLOSING = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])

function domToTree(node: Element): TreeNode {
  const tag = node.tagName.toLowerCase()
  const id = node.id || ''
  const classes = node.className ? node.className.split(' ').filter(Boolean) : []
  const attrs: { name: string; value: string }[] = []

  for (const attr of Array.from(node.attributes)) {
    if (attr.name === 'id' || attr.name === 'class') continue
    attrs.push({ name: attr.name, value: attr.value })
  }

  const children: TreeNode[] = []
  let text = ''
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(domToTree(child as Element))
    } else if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent?.trim() ?? ''
      if (t) text = text ? text + ' ' + t : t
    }
  }

  return { tag, id, classes, attrs, text, children, selfClosing: SELF_CLOSING.has(tag) }
}

function NodeRow({ node, depth, ui }: { node: TreeNode; depth: number; ui: UiTheme }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children.length > 0 || (node.text && !node.selfClosing)

  return (
    <div>
      <div
        className={`flex items-start gap-0.5 py-[2px] pr-2 rounded cursor-pointer hover:bg-brand-500/5 select-none`}
        style={{ paddingLeft: depth * 14 + 4 }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        {/* Collapse toggle */}
        <span className={`text-[9px] w-3 shrink-0 mt-[3px] ${ui.txt2}`}>
          {hasChildren ? (open ? '▾' : '▸') : ''}
        </span>

        {/* Tag */}
        <span className="font-mono text-[12px]">
          <span className="text-sky-400">&lt;</span>
          <span className="text-sky-300 font-semibold">{node.tag}</span>

          {node.id && (
            <span className="text-amber-400 font-bold"> #{node.id}</span>
          )}

          {node.classes.map(cls => (
            <span key={cls} className="text-emerald-400"> .{cls}</span>
          ))}

          {node.attrs.map(a => (
            <span key={a.name} className="text-purple-400">
              {' '}{a.name}
              {a.value && <span className="text-purple-300">={'"'}{a.value}{'"'}</span>}
            </span>
          ))}

          {node.selfClosing
            ? <span className="text-sky-400"> /&gt;</span>
            : <span className="text-sky-400">&gt;</span>
          }

          {/* Inline text preview when collapsed or no block children */}
          {node.text && (!open || node.children.length === 0) && (
            <span className={`text-[11px] ml-1 ${ui.txt2} italic`}>
              {node.text.length > 36 ? node.text.slice(0, 36) + '…' : node.text}
            </span>
          )}

          {!node.selfClosing && !hasChildren && (
            <span className="text-sky-400">&lt;/{node.tag}&gt;</span>
          )}
        </span>
      </div>

      {open && hasChildren && (
        <div>
          {node.text && node.children.length === 0 && (
            <div
              className={`font-mono text-[11px] italic py-[2px] ${ui.txt2}`}
              style={{ paddingLeft: (depth + 1) * 14 + 4 + 12 }}
            >
              "{node.text.length > 60 ? node.text.slice(0, 60) + '…' : node.text}"
            </div>
          )}
          {node.children.map((child, i) => (
            <NodeRow key={i} node={child} depth={depth + 1} ui={ui} />
          ))}
          {!node.selfClosing && (
            <div
              className="font-mono text-[12px] text-sky-400 py-[2px]"
              style={{ paddingLeft: depth * 14 + 4 + 12 }}
            >
              &lt;/{node.tag}&gt;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DomTreePanel({ html, ui }: Props) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const roots = Array.from(doc.body.children).map(el => domToTree(el as Element))

  return (
    <div className="flex-1 overflow-auto">
      {/* Legend */}
      <div className={`flex items-center gap-3 px-3 py-2 border-b ${ui.border} ${ui.bg1} shrink-0 text-[10px] font-mono`}>
        <span className="text-sky-300 font-semibold">tag</span>
        <span className="text-amber-400 font-bold">#id</span>
        <span className="text-emerald-400">.class</span>
        <span className="text-purple-400">attr</span>
        <span className={`ml-auto ${ui.txt2} italic`}>click to expand</span>
      </div>

      <div className="py-1">
        {roots.length === 0 ? (
          <div className={`text-xs ${ui.txt2} px-4 py-6 text-center`}>No HTML elements to show.</div>
        ) : (
          roots.map((node, i) => (
            <NodeRow key={i} node={node} depth={0} ui={ui} />
          ))
        )}
      </div>
    </div>
  )
}
