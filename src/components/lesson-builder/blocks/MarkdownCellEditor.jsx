import { useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// ── Toolbar definition ────────────────────────────────────────────────────────
// snippet uses Monaco snippet syntax: ${1:placeholder}, $0 = final cursor
// plain = just insert the string as-is (no snippet tabstops)

const GROUPS = [
  {
    label: 'Headings',
    color: '#818cf8',
    buttons: [
      { label: 'H1', title: 'Heading 1', snippet: '# ${1:Heading}\n$0' },
      { label: 'H2', title: 'Heading 2', snippet: '## ${1:Heading}\n$0' },
      { label: 'H3', title: 'Heading 3', snippet: '### ${1:Heading}\n$0' },
      { label: 'H4', title: 'Heading 4', snippet: '#### ${1:Heading}\n$0' },
    ],
  },
  {
    label: 'Format',
    color: '#34d399',
    buttons: [
      { label: '**B**',  title: 'Bold',          snippet: '**${1:text}**$0' },
      { label: '*I*',    title: 'Italic',         snippet: '*${1:text}*$0' },
      { label: '~~S~~',  title: 'Strikethrough',  snippet: '~~${1:text}~~$0' },
      { label: '`code`', title: 'Inline code',    snippet: '`${1:code}`$0' },
      { label: '[link]', title: 'Link',           snippet: '[${1:text}](${2:url})$0' },
    ],
  },
  {
    label: 'Blocks',
    color: '#fb923c',
    buttons: [
      { label: '❝ quote',    title: 'Blockquote',  snippet: '> ${1:text}$0' },
      { label: '``` block',  title: 'Code block',  snippet: '```${1:js}\n${2:code}\n```\n$0' },
      { label: '— rule',     title: 'Horizontal rule', plain: '\n---\n' },
      { label: '• list',     title: 'Bullet list', snippet: '- ${1:item}\n- ${2:item}\n- ${3:item}\n$0' },
      { label: '1. list',    title: 'Numbered list', snippet: '1. ${1:item}\n2. ${2:item}\n3. ${3:item}\n$0' },
      { label: '⊞ table',   title: 'Table (3×3)', plain: '| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| cell  | cell  | cell  |\n| cell  | cell  | cell  |\n' },
    ],
  },
  {
    label: 'Math',
    color: '#f472b6',
    buttons: [
      { label: '$…$',       title: 'Inline math',    snippet: '$$${1:expression}$$0' },
      { label: '$$…$$',     title: 'Display math',   snippet: '\n$$\n${1:expression}\n$$\n$0' },
      { label: 'a/b',       title: 'Fraction',       snippet: '$\\\\frac{${1:a}}{${2:b}}$$0' },
      { label: '√x',        title: 'Square root',    snippet: '$\\\\sqrt{${1:x}}$$0' },
      { label: 'ⁿ√x',      title: 'nth root',       snippet: '$\\\\sqrt[${1:n}]{${2:x}}$$0' },
      { label: 'xⁿ',       title: 'Superscript',    snippet: '${1:x}^{${2:n}}' },
      { label: 'xₙ',       title: 'Subscript',      snippet: '${1:x}_{${2:n}}' },
      { label: 'x²',        title: 'x squared',      plain: 'x^2' },
      { label: 'x³',        title: 'x cubed',        plain: 'x^3' },
      { label: '(  )',      title: 'Big parens',     snippet: '$\\\\left(${1:expr}\\\\right)$$0' },
      { label: '[  ]',      title: 'Big brackets',   snippet: '$\\\\left[${1:expr}\\\\right]$$0' },
      { label: 'align',     title: 'Aligned equations', snippet: '\n$$\n\\\\begin{aligned}\n${1:a} &= ${2:b} \\\\\\\\\n${3:c} &= ${4:d}\n\\\\end{aligned}\n$$\n$0' },
    ],
  },
  {
    label: 'Geometry',
    color: '#38bdf8',
    buttons: [
      { label: '∠',         title: '\\angle ABC',     snippet: '$\\\\angle ${1:ABC}$$0' },
      { label: 'm∠',        title: 'Angle measure',   snippet: '$m\\\\angle ${1:ABC} = ${2:90}^\\\\circ$$0' },
      { label: '△',         title: '\\triangle',      snippet: '$\\\\triangle ${1:ABC}$$0' },
      { label: '⊥',         title: 'Perpendicular',   plain: '⊥' },
      { label: '∥',         title: 'Parallel',        plain: '∥' },
      { label: '≅',         title: 'Congruent',       plain: '≅' },
      { label: '∼',         title: 'Similar',         plain: '∼' },
      { label: '°',         title: 'Degrees',         snippet: '${1:90}^\\\\circ$0' },
      { label: 'AB̄',       title: 'Segment overline', snippet: '$\\\\overline{${1:AB}}$$0' },
      { label: 'arc AB',    title: 'Arc',             snippet: '$\\\\widehat{${1:AB}}$$0' },
      { label: '→',         title: 'Ray',             snippet: '$\\\\overrightarrow{${1:AB}}$$0' },
      { label: '↔',         title: 'Line',            snippet: '$\\\\overleftrightarrow{${1:AB}}$$0' },
    ],
  },
  {
    label: 'Algebra',
    color: '#a78bfa',
    buttons: [
      { label: '≠',   title: 'Not equal',      plain: '≠' },
      { label: '≈',   title: 'Approx equal',   plain: '≈' },
      { label: '≤',   title: 'Less or equal',  plain: '≤' },
      { label: '≥',   title: 'Greater or eq',  plain: '≥' },
      { label: '±',   title: 'Plus minus',     plain: '±' },
      { label: '×',   title: 'Multiply',       plain: '×' },
      { label: '÷',   title: 'Divide',         plain: '÷' },
      { label: '∈',   title: 'Element of',     plain: '∈' },
      { label: '∉',   title: 'Not element of', plain: '∉' },
      { label: '⊂',   title: 'Subset',         plain: '⊂' },
      { label: '∪',   title: 'Union',          plain: '∪' },
      { label: '∩',   title: 'Intersection',   plain: '∩' },
      { label: '∅',   title: 'Empty set',      plain: '∅' },
      { label: '∞',   title: 'Infinity',       plain: '∞' },
      { label: '…',   title: 'Ellipsis',       plain: '…' },
      { label: '∴',   title: 'Therefore',      plain: '∴' },
      { label: '∵',   title: 'Because',        plain: '∵' },
    ],
  },
  {
    label: 'Trig',
    color: '#fbbf24',
    buttons: [
      { label: 'sin',    title: 'sin(x)',    snippet: '$\\\\sin(${1:x})$$0' },
      { label: 'cos',    title: 'cos(x)',    snippet: '$\\\\cos(${1:x})$$0' },
      { label: 'tan',    title: 'tan(x)',    snippet: '$\\\\tan(${1:x})$$0' },
      { label: 'csc',    title: 'csc(x)',    snippet: '$\\\\csc(${1:x})$$0' },
      { label: 'sec',    title: 'sec(x)',    snippet: '$\\\\sec(${1:x})$$0' },
      { label: 'cot',    title: 'cot(x)',    snippet: '$\\\\cot(${1:x})$$0' },
      { label: 'sin⁻¹', title: 'arcsin',    snippet: '$\\\\arcsin(${1:x})$$0' },
      { label: 'cos⁻¹', title: 'arccos',    snippet: '$\\\\arccos(${1:x})$$0' },
      { label: 'tan⁻¹', title: 'arctan',    snippet: '$\\\\arctan(${1:x})$$0' },
      { label: 'sin²',   title: 'sin²(x)',   snippet: '$\\\\sin^2(${1:x})$$0' },
      { label: 'cos²',   title: 'cos²(x)',   snippet: '$\\\\cos^2(${1:x})$$0' },
      { label: 'SOH',    title: 'sin=opp/hyp', plain: '$\\\\sin \\\\theta = \\\\dfrac{\\\\text{opp}}{\\\\text{hyp}}$' },
      { label: 'CAH',    title: 'cos=adj/hyp', plain: '$\\\\cos \\\\theta = \\\\dfrac{\\\\text{adj}}{\\\\text{hyp}}$' },
      { label: 'TOA',    title: 'tan=opp/adj', plain: '$\\\\tan \\\\theta = \\\\dfrac{\\\\text{opp}}{\\\\text{adj}}$' },
      { label: 'SinLaw', title: 'Law of sines', plain: '$\\\\dfrac{a}{\\\\sin A} = \\\\dfrac{b}{\\\\sin B} = \\\\dfrac{c}{\\\\sin C}$' },
      { label: 'CosLaw', title: 'Law of cosines', plain: '$c^2 = a^2 + b^2 - 2ab\\\\cos C$' },
    ],
  },
  {
    label: 'Calculus',
    color: '#f87171',
    buttons: [
      { label: '∑',      title: 'Sum',         snippet: '$\\\\sum_{${1:i=1}}^{${2:n}} ${3:a_i}$$0' },
      { label: '∏',      title: 'Product',     snippet: '$\\\\prod_{${1:i=1}}^{${2:n}} ${3:a_i}$$0' },
      { label: '∫',      title: 'Integral',    snippet: '$\\\\int_{${1:a}}^{${2:b}} ${3:f(x)}\\\\,dx$$0' },
      { label: '∬',      title: 'Double int',  snippet: '$\\\\iint ${1:f(x,y)}\\\\,dx\\\\,dy$$0' },
      { label: '∮',      title: 'Line integral', snippet: '$\\\\oint ${1:f}\\\\,d${2:s}$$0' },
      { label: 'd/dx',   title: 'Derivative',  snippet: '$\\\\frac{d}{dx}\\\\left[${1:f(x)}\\\\right]$$0' },
      { label: '∂/∂x',  title: 'Partial',     snippet: '$\\\\frac{\\\\partial}{\\\\partial ${1:x}}\\\\left[${2:f}\\\\right]$$0' },
      { label: 'lim',    title: 'Limit',       snippet: '$\\\\lim_{${1:x \\\\to \\\\infty}} ${2:f(x)}$$0' },
      { label: '∇',      title: 'Nabla',       plain: '$\\\\nabla$' },
      { label: 'e^x',    title: 'e^x',         plain: '$e^x$' },
      { label: 'ln',     title: 'Natural log', snippet: '$\\\\ln(${1:x})$$0' },
      { label: 'log',    title: 'Log base n',  snippet: '$\\\\log_{${1:n}}(${2:x})$$0' },
    ],
  },
  {
    label: 'Greek',
    color: '#86efac',
    buttons: [
      { label: 'α', title: 'alpha',   plain: 'α' },
      { label: 'β', title: 'beta',    plain: 'β' },
      { label: 'γ', title: 'gamma',   plain: 'γ' },
      { label: 'δ', title: 'delta',   plain: 'δ' },
      { label: 'ε', title: 'epsilon', plain: 'ε' },
      { label: 'ζ', title: 'zeta',    plain: 'ζ' },
      { label: 'η', title: 'eta',     plain: 'η' },
      { label: 'θ', title: 'theta',   plain: 'θ' },
      { label: 'λ', title: 'lambda',  plain: 'λ' },
      { label: 'μ', title: 'mu',      plain: 'μ' },
      { label: 'ν', title: 'nu',      plain: 'ν' },
      { label: 'ξ', title: 'xi',      plain: 'ξ' },
      { label: 'π', title: 'pi',      plain: 'π' },
      { label: 'ρ', title: 'rho',     plain: 'ρ' },
      { label: 'σ', title: 'sigma',   plain: 'σ' },
      { label: 'τ', title: 'tau',     plain: 'τ' },
      { label: 'φ', title: 'phi',     plain: 'φ' },
      { label: 'χ', title: 'chi',     plain: 'χ' },
      { label: 'ψ', title: 'psi',     plain: 'ψ' },
      { label: 'ω', title: 'omega',   plain: 'ω' },
      { label: 'Γ', title: 'Gamma',   plain: 'Γ' },
      { label: 'Δ', title: 'Delta',   plain: 'Δ' },
      { label: 'Θ', title: 'Theta',   plain: 'Θ' },
      { label: 'Λ', title: 'Lambda',  plain: 'Λ' },
      { label: 'Π', title: 'Pi',      plain: 'Π' },
      { label: 'Σ', title: 'Sigma',   plain: 'Σ' },
      { label: 'Φ', title: 'Phi',     plain: 'Φ' },
      { label: 'Ψ', title: 'Psi',     plain: 'Ψ' },
      { label: 'Ω', title: 'Omega',   plain: 'Ω' },
    ],
  },
  {
    label: 'Vectors',
    color: '#67e8f9',
    buttons: [
      { label: 'v⃗',    title: 'Vector arrow',   snippet: '$\\\\vec{${1:v}}$$0' },
      { label: 'v̂',    title: 'Unit vector',    snippet: '$\\\\hat{${1:v}}$$0' },
      { label: '**v**', title: 'Bold vector',    snippet: '$\\\\mathbf{${1:v}}$$0' },
      { label: '|v|',   title: 'Magnitude',      snippet: '$|${1:v}|$$0' },
      { label: '‖v‖',  title: 'Norm',           snippet: '$\\\\|${1:v}\\\\|$$0' },
      { label: '·',     title: 'Dot product',    snippet: '$\\\\vec{${1:u}} \\\\cdot \\\\vec{${2:v}}$$0' },
      { label: '×',     title: 'Cross product',  snippet: '$\\\\vec{${1:u}} \\\\times \\\\vec{${2:v}}$$0' },
      { label: '⟨a,b⟩', title: 'Component form', snippet: '$\\\\langle ${1:a}, ${2:b} \\\\rangle$$0' },
      { label: '3D',    title: '3D component',   snippet: '$\\\\langle ${1:a}, ${2:b}, ${3:c} \\\\rangle$$0' },
    ],
  },
  {
    label: 'Matrices',
    color: '#c4b5fd',
    buttons: [
      { label: '2×2',   title: '2×2 matrix',    plain: '$\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$' },
      { label: '3×3',   title: '3×3 matrix',    plain: '$\\\\begin{pmatrix} a & b & c \\\\\\\\ d & e & f \\\\\\\\ g & h & i \\\\end{pmatrix}$' },
      { label: 'det',   title: 'Determinant',   snippet: '$\\\\det\\\\begin{pmatrix} ${1:a} & ${2:b} \\\\\\\\ ${3:c} & ${4:d} \\\\end{pmatrix}$$0' },
      { label: 'Aᵀ',   title: 'Transpose',     snippet: '${1:A}^T$0' },
      { label: 'A⁻¹',  title: 'Inverse',       snippet: '${1:A}^{-1}$0' },
    ],
  },
]

// ── Toolbar component ─────────────────────────────────────────────────────────

function Toolbar({ onInsert }) {
  return (
    <div
      className="overflow-x-auto shrink-0 py-2 px-3 flex flex-col gap-2"
      style={{ background: '#161b22', borderBottom: '1px solid #30363d', maxHeight: 240 }}
    >
      {GROUPS.map(group => (
        <div key={group.label} className="flex items-start gap-1.5 flex-wrap">
          <span
            className="text-[9px] font-bold uppercase tracking-widest shrink-0 mt-1 w-14 text-right pr-1.5"
            style={{ color: group.color }}
          >
            {group.label}
          </span>
          {group.buttons.map(btn => (
            <button
              key={btn.label}
              title={btn.title}
              onClick={() => onInsert(btn)}
              className="px-2 py-0.5 text-xs rounded transition-colors shrink-0 hover:brightness-125"
              style={{
                background: '#21262d',
                border: `1px solid ${group.color}44`,
                color: '#e6edf3',
                fontFamily: btn.label.match(/[αβγδεζηθλμνξπρστφχψωΓΔΘΛΠΣΦΨΩ∑∏∫∬∮∇]/) ? 'serif' : 'monospace',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MarkdownCellEditor({ cell, onSave, onClose }) {
  const editorRef = useRef(null)
  const [preview, setPreview] = useState(cell.instruction ?? '')

  const insertBtn = useCallback((btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) {
      ed.trigger('keyboard', 'type', { text: btn.plain })
    } else if (btn.snippet) {
      ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    }
    ed.focus()
  }, [])

  const handleSave = () => {
    onSave({ ...cell, instruction: preview })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: '#8b949e' }}
        >
          ← Close
        </button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>📝 Markdown Editor</span>
        <span className="text-xs" style={{ color: '#8b949e' }}>
          Live preview · KaTeX · GFM tables · Click toolbar buttons to insert at cursor
        </span>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-sm font-bold rounded-lg"
            style={{ background: '#238636', color: '#ffffff' }}
          >
            Save to cell
          </button>
        </div>
      </div>

      {/* Symbol / snippet toolbar */}
      <Toolbar onInsert={insertBtn} />

      {/* Split: editor | preview */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Monaco */}
        <div className="flex flex-col min-h-0" style={{ width: '52%', borderRight: '1px solid #30363d' }}>
          <div
            className="px-3 py-1 text-xs shrink-0"
            style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
          >
            Markdown source
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              defaultValue={cell.instruction ?? ''}
              language="markdown"
              theme="vs-dark"
              options={{
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
              onChange={v => setPreview(v ?? '')}
              onMount={editor => { editorRef.current = editor }}
            />
          </div>
        </div>

        {/* Right: live preview */}
        <div
          className="flex flex-col min-h-0 flex-1 overflow-hidden"
        >
          <div
            className="px-3 py-1 text-xs shrink-0"
            style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
          >
            Rendered preview
          </div>
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ background: '#0d1117', color: '#e6edf3' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold mb-4 pb-2" style={{ borderBottom: '1px solid #30363d', color: '#e6edf3' }}>{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold mt-6 mb-3" style={{ color: '#e6edf3' }}>{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-bold mt-5 mb-2" style={{ color: '#c9d1d9' }}>{children}</h3>,
                h4: ({children}) => <h4 className="text-base font-semibold mt-4 mb-2" style={{ color: '#c9d1d9' }}>{children}</h4>,
                p: ({children}) => <p className="mb-4 leading-7" style={{ color: '#c9d1d9' }}>{children}</p>,
                strong: ({children}) => <strong style={{ color: '#e6edf3', fontWeight: 700 }}>{children}</strong>,
                em: ({children}) => <em style={{ color: '#c9d1d9' }}>{children}</em>,
                code: ({inline, children}) => inline
                  ? <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#21262d', color: '#f97316', border: '1px solid #30363d' }}>{children}</code>
                  : <pre className="p-4 rounded-lg overflow-x-auto mb-4" style={{ background: '#161b22', border: '1px solid #30363d' }}><code className="text-sm font-mono" style={{ color: '#e6edf3' }}>{children}</code></pre>,
                blockquote: ({children}) => <blockquote className="pl-4 my-4 italic" style={{ borderLeft: '4px solid #388bfd', color: '#8b949e' }}>{children}</blockquote>,
                ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: '#c9d1d9' }}>{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1" style={{ color: '#c9d1d9' }}>{children}</ol>,
                li: ({children}) => <li className="leading-6">{children}</li>,
                table: ({children}) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                thead: ({children}) => <thead style={{ background: '#161b22' }}>{children}</thead>,
                th: ({children}) => <th className="px-3 py-2 text-left font-semibold" style={{ border: '1px solid #30363d', color: '#e6edf3' }}>{children}</th>,
                td: ({children}) => <td className="px-3 py-2" style={{ border: '1px solid #30363d', color: '#c9d1d9' }}>{children}</td>,
                hr: () => <hr className="my-6" style={{ borderColor: '#30363d' }} />,
                a: ({href, children}) => <a href={href} style={{ color: '#388bfd' }} className="underline underline-offset-2">{children}</a>,
              }}
            >
              {preview || '*Start typing to see preview…*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
