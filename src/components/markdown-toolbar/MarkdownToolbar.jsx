import { useState, useRef, useEffect } from 'react'

// Shared markdown/LaTeX toolbar — used by the Lesson Builder's MarkdownCellEditor
// (Monaco-backed) and Studio's MarkdownHub (plain-textarea-backed). Both pass an
// onInsert(btn) callback; btn is either { plain: string } (insert as-is) or
// { snippet: string } (Monaco snippet syntax: ${1:placeholder}, $0 = final
// cursor — callers without real snippet support should strip that syntax
// themselves before inserting, see MarkdownHub's stripSnippetSyntax).

export const GROUPS = [
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
      { label: 'a/b',       title: 'Fraction',       snippet: '$\\frac{${1:a}}{${2:b}}$$0' },
      { label: '√x',        title: 'Square root',    snippet: '$\\sqrt{${1:x}}$$0' },
      { label: 'ⁿ√x',      title: 'nth root',       snippet: '$\\sqrt[${1:n}]{${2:x}}$$0' },
      { label: 'xⁿ',       title: 'Superscript',    snippet: '${1:x}^{${2:n}}' },
      { label: 'xₙ',       title: 'Subscript',      snippet: '${1:x}_{${2:n}}' },
      { label: 'x²',        title: 'x squared',      plain: 'x^2' },
      { label: 'x³',        title: 'x cubed',        plain: 'x^3' },
      { label: '(  )',      title: 'Big parens',     snippet: '$\\left(${1:expr}\\right)$$0' },
      { label: '[  ]',      title: 'Big brackets',   snippet: '$\\left[${1:expr}\\right]$$0' },
      { label: 'align',     title: 'Aligned equations', snippet: '\n$$\n\\begin{aligned}\n${1:a} &= ${2:b} \\\\\n${3:c} &= ${4:d}\n\\end{aligned}\n$$\n$0' },
    ],
  },
  {
    label: 'Geometry',
    color: '#38bdf8',
    buttons: [
      { label: '∠',         title: '\\angle ABC',     snippet: '$\\angle ${1:ABC}$$0' },
      { label: 'm∠',        title: 'Angle measure',   snippet: '$m\\angle ${1:ABC} = ${2:90}^\\circ$$0' },
      { label: '△',         title: '\\triangle',      snippet: '$\\triangle ${1:ABC}$$0' },
      { label: '⊥',         title: 'Perpendicular',   plain: '⊥' },
      { label: '∥',         title: 'Parallel',        plain: '∥' },
      { label: '≅',         title: 'Congruent',       plain: '≅' },
      { label: '∼',         title: 'Similar',         plain: '∼' },
      { label: '°',         title: 'Degrees',         snippet: '${1:90}^\\circ$0' },
      { label: 'AB̄',       title: 'Segment overline', snippet: '$\\overline{${1:AB}}$$0' },
      { label: 'arc AB',    title: 'Arc',             snippet: '$\\widehat{${1:AB}}$$0' },
      { label: '→',         title: 'Ray',             snippet: '$\\overrightarrow{${1:AB}}$$0' },
      { label: '↔',         title: 'Line',            snippet: '$\\overleftrightarrow{${1:AB}}$$0' },
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
      { label: 'sin',    title: 'sin(x)',    snippet: '$\\sin(${1:x})$$0' },
      { label: 'cos',    title: 'cos(x)',    snippet: '$\\cos(${1:x})$$0' },
      { label: 'tan',    title: 'tan(x)',    snippet: '$\\tan(${1:x})$$0' },
      { label: 'csc',    title: 'csc(x)',    snippet: '$\\csc(${1:x})$$0' },
      { label: 'sec',    title: 'sec(x)',    snippet: '$\\sec(${1:x})$$0' },
      { label: 'cot',    title: 'cot(x)',    snippet: '$\\cot(${1:x})$$0' },
      { label: 'sin⁻¹', title: 'arcsin',    snippet: '$\\arcsin(${1:x})$$0' },
      { label: 'cos⁻¹', title: 'arccos',    snippet: '$\\arccos(${1:x})$$0' },
      { label: 'tan⁻¹', title: 'arctan',    snippet: '$\\arctan(${1:x})$$0' },
      { label: 'sin²',   title: 'sin²(x)',   snippet: '$\\sin^2(${1:x})$$0' },
      { label: 'cos²',   title: 'cos²(x)',   snippet: '$\\cos^2(${1:x})$$0' },
      { label: 'SOH',    title: 'sin=opp/hyp', plain: '$\\sin \\theta = \\dfrac{\\text{opp}}{\\text{hyp}}$' },
      { label: 'CAH',    title: 'cos=adj/hyp', plain: '$\\cos \\theta = \\dfrac{\\text{adj}}{\\text{hyp}}$' },
      { label: 'TOA',    title: 'tan=opp/adj', plain: '$\\tan \\theta = \\dfrac{\\text{opp}}{\\text{adj}}$' },
      { label: 'SinLaw', title: 'Law of sines', plain: '$\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}$' },
      { label: 'CosLaw', title: 'Law of cosines', plain: '$c^2 = a^2 + b^2 - 2ab\\cos C$' },
    ],
  },
  {
    label: 'Calculus',
    color: '#f87171',
    buttons: [
      { label: '∑',      title: 'Sum',         snippet: '$\\sum_{${1:i=1}}^{${2:n}} ${3:a_i}$$0' },
      { label: '∏',      title: 'Product',     snippet: '$\\prod_{${1:i=1}}^{${2:n}} ${3:a_i}$$0' },
      { label: '∫',      title: 'Integral',    snippet: '$\\int_{${1:a}}^{${2:b}} ${3:f(x)}\\,dx$$0' },
      { label: '∬',      title: 'Double int',  snippet: '$\\iint ${1:f(x,y)}\\,dx\\,dy$$0' },
      { label: '∮',      title: 'Line integral', snippet: '$\\oint ${1:f}\\,d${2:s}$$0' },
      { label: 'd/dx',   title: 'Derivative',  snippet: '$\\frac{d}{dx}\\left[${1:f(x)}\\right]$$0' },
      { label: '∂/∂x',  title: 'Partial',     snippet: '$\\frac{\\partial}{\\partial ${1:x}}\\left[${2:f}\\right]$$0' },
      { label: 'lim',    title: 'Limit',       snippet: '$\\lim_{${1:x \\to \\infty}} ${2:f(x)}$$0' },
      { label: '∇',      title: 'Nabla',       plain: '$\\nabla$' },
      { label: 'e^x',    title: 'e^x',         plain: '$e^x$' },
      { label: 'ln',     title: 'Natural log', snippet: '$\\ln(${1:x})$$0' },
      { label: 'log',    title: 'Log base n',  snippet: '$\\log_{${1:n}}(${2:x})$$0' },
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
      { label: 'v⃗',    title: 'Vector arrow',   snippet: '$\\vec{${1:v}}$$0' },
      { label: 'v̂',    title: 'Unit vector',    snippet: '$\\hat{${1:v}}$$0' },
      { label: '**v**', title: 'Bold vector',    snippet: '$\\mathbf{${1:v}}$$0' },
      { label: '|v|',   title: 'Magnitude',      snippet: '$|${1:v}|$$0' },
      { label: '‖v‖',  title: 'Norm',           snippet: '$\\|${1:v}\\|$$0' },
      { label: '·',     title: 'Dot product',    snippet: '$\\vec{${1:u}} \\cdot \\vec{${2:v}}$$0' },
      { label: '×',     title: 'Cross product',  snippet: '$\\vec{${1:u}} \\times \\vec{${2:v}}$$0' },
      { label: '⟨a,b⟩', title: 'Component form', snippet: '$\\langle ${1:a}, ${2:b} \\rangle$$0' },
      { label: '3D',    title: '3D component',   snippet: '$\\langle ${1:a}, ${2:b}, ${3:c} \\rangle$$0' },
    ],
  },
  {
    label: 'Matrices',
    color: '#c4b5fd',
    buttons: [
      { label: '2×2',   title: '2×2 matrix',    plain: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$' },
      { label: '3×3',   title: '3×3 matrix',    plain: '$\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}$' },
      { label: 'det',   title: 'Determinant',   snippet: '$\\det\\begin{pmatrix} ${1:a} & ${2:b} \\\\ ${3:c} & ${4:d} \\end{pmatrix}$$0' },
      { label: 'Aᵀ',   title: 'Transpose',     snippet: '${1:A}^T$0' },
      { label: 'A⁻¹',  title: 'Inverse',       snippet: '${1:A}^{-1}$0' },
    ],
  },
]

// ── Quick-insert wizards: ask what you want, build the syntax for you ─────────

const CODE_LANGS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'r', label: 'R' },
  { value: 'julia', label: 'Julia' },
  { value: 'lua', label: 'Lua' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'scala', label: 'Scala' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'matlab', label: 'MATLAB' },
  { value: 'sql', label: 'SQL' },
  { value: '', label: 'Terminal output (no language)' },
]

function QuickAddPopover({ title, onClose, wide, children }) {
  return (
    <div className={`absolute z-10 top-full left-0 mt-1 rounded-lg shadow-xl border p-3 space-y-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 ${wide ? 'w-auto max-w-[min(90vw,640px)]' : 'w-72'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</span>
        <button onClick={onClose} className="text-xs px-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">✕</button>
      </div>
      {children}
    </div>
  )
}

function NumField({ label, value, onChange, min = 1, max = 20 }) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
      {label}
      <input
        type="number" min={min} max={max} value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="w-16 text-xs rounded px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
      />
    </label>
  )
}

// Builds an r×c grid, reusing whatever values already exist at surviving
// indices so resizing rows/cols doesn't throw away what you've typed.
function resizeGrid(prev, rows, cols, fill) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => prev[r]?.[c] ?? fill(r, c))
  )
}

function GridInput({ value, onChange, placeholder, isHeader, width = 80 }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`text-[11px] rounded border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 ${isHeader ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-slate-700'}`}
      style={{ width, padding: '3px 6px' }}
    />
  )
}

function TableQuickAdd({ onInsert, onClose }) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [header, setHeader] = useState(true)
  const [cells, setCells] = useState(() =>
    resizeGrid([], 3, 3, (r, c) => (r === 0 ? `Header ${c + 1}` : ''))
  )

  const resize = (newRows, newCols) => setCells(prev =>
    resizeGrid(prev, newRows, newCols, (r, c) => (r === 0 && header ? `Header ${c + 1}` : ''))
  )
  const setCell = (r, c, val) => setCells(prev => {
    const next = prev.map(row => row.slice())
    next[r][c] = val
    return next
  })

  const insert = () => {
    const line = row => `| ${row.map(v => v.trim()).join(' | ')} |`
    const sep = `| ${cols && Array.from({ length: cols }, () => '---').join(' | ')} |`
    const lines = [line(cells[0] ?? []), sep, ...cells.slice(1).map(line)]
    onInsert({ plain: '\n' + lines.join('\n') + '\n' })
    onClose()
  }

  return (
    <QuickAddPopover title="▦ Insert table" onClose={onClose} wide>
      <div className="flex items-center gap-3">
        <NumField label="Rows" value={rows} onChange={v => { setRows(v); resize(v, cols) }} min={1} max={12} />
        <NumField label="Columns" value={cols} onChange={v => { setCols(v); resize(rows, v) }} min={1} max={8} />
        <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <input type="checkbox" checked={header} onChange={e => setHeader(e.target.checked)} />
          First row is a header
        </label>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">Type the actual cell values below — they'll be inserted exactly as written.</p>
      <div className="overflow-x-auto">
        <table className="border-collapse"><tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => (
                <td key={c} className="p-0.5">
                  <GridInput
                    value={val}
                    onChange={v => setCell(r, c, v)}
                    isHeader={r === 0 && header}
                    placeholder={r === 0 && header ? `Header ${c + 1}` : `r${r + 1}c${c + 1}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody></table>
      </div>
      <button onClick={insert} className="w-full text-xs font-bold py-1.5 rounded bg-[#238636] text-white">Insert</button>
    </QuickAddPopover>
  )
}

const MATRIX_STYLES = [
  { key: 'pmatrix', label: '( )  Parentheses' },
  { key: 'bmatrix', label: '[ ]  Brackets' },
  { key: 'vmatrix', label: '| |  Bars (determinant)' },
]

function MatrixQuickAdd({ onInsert, onClose }) {
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)
  const [style, setStyle] = useState('pmatrix')
  const [cells, setCells] = useState(() => resizeGrid([], 2, 2, () => ''))

  const resize = (newRows, newCols) => setCells(prev => resizeGrid(prev, newRows, newCols, () => ''))
  const setCell = (r, c, val) => setCells(prev => {
    const next = prev.map(row => row.slice())
    next[r][c] = val
    return next
  })

  const insert = () => {
    const body = cells.map(row => row.map(v => v.trim() || '0').join(' & ')).join(' \\\\ ')
    onInsert({ plain: `$\\begin{${style}} ${body} \\end{${style}}$` })
    onClose()
  }

  return (
    <QuickAddPopover title="⊞ Insert matrix" onClose={onClose} wide>
      <div className="flex items-center gap-3">
        <NumField label="Rows" value={rows} onChange={v => { setRows(v); resize(v, cols) }} min={1} max={6} />
        <NumField label="Columns" value={cols} onChange={v => { setCols(v); resize(rows, v) }} min={1} max={6} />
        <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          Style
          <select value={style} onChange={e => setStyle(e.target.value)} className="text-xs rounded px-1.5 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
            {MATRIX_STYLES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">Type each entry — numbers, variables, or LaTeX like \frac&#123;1&#125;&#123;2&#125;. Blank cells become 0.</p>
      <div className="overflow-x-auto">
        <table className="border-collapse"><tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {row.map((val, c) => (
                <td key={c} className="p-0.5">
                  <GridInput value={val} onChange={v => setCell(r, c, v)} placeholder="0" width={56} />
                </td>
              ))}
            </tr>
          ))}
        </tbody></table>
      </div>
      <button onClick={insert} className="w-full text-xs font-bold py-1.5 rounded bg-[#238636] text-white">Insert</button>
    </QuickAddPopover>
  )
}

function CodeBlockQuickAdd({ onInsert, onClose }) {
  const [lang, setLang] = useState('javascript')
  const isOutput = lang === ''

  const preview = isOutput
    ? '```\noutput goes here\n```'
    : `\`\`\`${lang}\n// your code here\n\`\`\``

  const insert = () => {
    const text = isOutput
      ? '\n```\noutput goes here\n```\n'
      : `\n\`\`\`${lang}\n// your code here\n\`\`\`\n`
    onInsert({ plain: text })
    onClose()
  }

  return (
    <QuickAddPopover title="⌥ Insert code block" onClose={onClose} wide>
      <label className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        Language
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="text-xs rounded px-1.5 py-1 flex-1 ml-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
        >
          {CODE_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </label>
      <pre className="text-[11px] rounded p-2 leading-5 font-mono mt-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-green-700 dark:text-green-400">
        {preview}
      </pre>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        {isOutput ? 'Rendered as a dark terminal block — no run button.' : 'A runnable code cell. Fill in your code after inserting.'}
      </p>
      <button onClick={insert} className="w-full text-xs font-bold py-1.5 rounded bg-[#238636] text-white">Insert</button>
    </QuickAddPopover>
  )
}

// ── Visual math editor (MathLive) ────────────────────────────────────────────
// Lazily registers the <math-field> web component the first time this popover
// opens, so it doesn't bloat the initial bundle.

let mathliveLoaded = false

function MathEditorQuickAdd({ onInsert, onClose }) {
  const mfRef = useRef(null)
  const [display, setDisplay] = useState(false)
  const [preview, setPreview] = useState('')
  const [ready, setReady] = useState(mathliveLoaded)

  useEffect(() => {
    if (mathliveLoaded) { setReady(true); return }
    import('mathlive').then(() => { mathliveLoaded = true; setReady(true) })
  }, [])

  // Attach native event listener after the web component is in the DOM
  useEffect(() => {
    if (!ready || !mfRef.current) return
    const el = mfRef.current
    const handler = () => setPreview(el.value ?? '')
    el.addEventListener('input', handler)
    return () => el.removeEventListener('input', handler)
  }, [ready])

  const getLatex = () => mfRef.current?.getValue?.() ?? mfRef.current?.value ?? ''

  const insert = () => {
    const latex = getLatex().trim()
    if (!latex) { onClose(); return }
    const wrapped = display ? `\n$$\n${latex}\n$$\n` : `$${latex}$`
    onInsert({ plain: wrapped })
    onClose()
  }

  return (
    <QuickAddPopover title="∫≈ Visual math editor" onClose={onClose} wide>
      <div className="flex items-center gap-3 mb-1">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 select-none cursor-pointer">
          <input type="checkbox" checked={display} onChange={e => setDisplay(e.target.checked)} />
          Display (block) — unchecked = inline
        </label>
      </div>

      {!ready && (
        <div className="flex items-center justify-center py-8 text-slate-400 dark:text-slate-500 text-sm">
          Loading math editor…
        </div>
      )}

      {ready && (
        <>
          {/* MathLive web component — styled to look like a proper input field */}
          <div className="rounded border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 min-h-[56px] flex items-center text-lg">
            <math-field
              ref={mfRef}
              style={{ width: '100%', minHeight: 40, outline: 'none', fontSize: 20, color: 'inherit' }}
            />
          </div>

          {/* Raw LaTeX preview */}
          {preview && (
            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 break-all">
              {display ? `$$${preview}$$` : `$${preview}$`}
            </div>
          )}

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Type or click the virtual keyboard to build any expression. Click Insert to drop it into your lesson at the cursor.
          </p>
        </>
      )}

      <button
        onClick={insert}
        className="w-full text-xs font-bold py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white disabled:opacity-40 mt-2"
        disabled={!ready}
      >
        ➕ Insert Math into Note
      </button>
    </QuickAddPopover>
  )
}

// ── Toolbar component ─────────────────────────────────────────────────────────
// Symbol groups are shown one at a time behind tabs (instead of all ~150 buttons
// stacked at once) so the panel stays scannable; table/matrix get a GUI wizard
// instead of a fixed-size insert, since "how many rows/cols" varies every time.

export default function MarkdownToolbar({ onInsert }) {
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].label)
  const [openQuickAdd, setOpenQuickAdd] = useState(null) // 'table' | 'matrix' | 'code' | 'math' | null
  const group = GROUPS.find(g => g.label === activeGroup) ?? GROUPS[0]

  return (
    <div className="shrink-0 py-2 px-3 space-y-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      {/* Quick-add wizards */}
      <div className="flex items-center gap-1.5 relative flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest shrink-0 w-14 text-right pr-1.5 text-amber-600 dark:text-amber-400">
          Quick add
        </span>
        <button
          onClick={() => setOpenQuickAdd(o => o === 'math' ? null : 'math')}
          className="px-2 py-0.5 text-xs rounded font-semibold bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
        >∫≈ Visual Math…</button>
        {openQuickAdd === 'math' && <MathEditorQuickAdd onInsert={onInsert} onClose={() => setOpenQuickAdd(null)} />}
        <button
          onClick={() => setOpenQuickAdd(o => o === 'code' ? null : 'code')}
          className="px-2 py-0.5 text-xs rounded font-semibold bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 text-slate-700 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
        >⌥ Code…</button>
        {openQuickAdd === 'code' && <CodeBlockQuickAdd onInsert={onInsert} onClose={() => setOpenQuickAdd(null)} />}
        <button
          onClick={() => setOpenQuickAdd(o => o === 'table' ? null : 'table')}
          className="px-2 py-0.5 text-xs rounded font-semibold bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 text-slate-700 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
        >▦ Table…</button>
        {openQuickAdd === 'table' && <TableQuickAdd onInsert={onInsert} onClose={() => setOpenQuickAdd(null)} />}
        <button
          onClick={() => setOpenQuickAdd(o => o === 'matrix' ? null : 'matrix')}
          className="px-2 py-0.5 text-xs rounded font-semibold bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 text-slate-700 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
        >⊞ Matrix…</button>
        {openQuickAdd === 'matrix' && <MatrixQuickAdd onInsert={onInsert} onClose={() => setOpenQuickAdd(null)} />}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {GROUPS.map(g => {
          const isActive = activeGroup === g.label
          return (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label)}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded transition-colors ${!isActive ? 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' : ''}`}
              style={isActive ? { background: `${g.color}33`, border: `1px solid ${g.color}`, color: g.color } : {}}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* Active group's symbol buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {group.buttons.map(btn => (
          <button
            key={btn.label}
            title={btn.title}
            onClick={() => onInsert(btn)}
            className="px-2 py-0.5 text-xs rounded transition-colors shrink-0 hover:brightness-110 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            style={{
              border: `1px solid ${group.color}44`,
              fontFamily: btn.label.match(/[αβγδεζηθλμνξπρστφχψωΓΔΘΛΠΣΦΨΩ∑∏∫∬∮∇]/) ? 'serif' : 'monospace',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Strip Monaco snippet tabstop syntax for callers with no real snippet support
// (e.g. a plain <textarea>) — keeps the placeholder text, drops the tabstops.
export function stripSnippetSyntax(s) {
  return s
    .replace(/\$\{\d+:([^}]*)\}/g, '$1')
    .replace(/\$\{\d+\}/g, '')
    .replace(/\$0\b/g, '')
    .replace(/\$(\d+)\b/g, '')
}
