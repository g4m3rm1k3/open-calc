// Term.tsx
// Wraps a piece of text with a dotted underline; hovering (or tapping on
// touch) reveals a small popover with its glossary definition. Used the first
// time a term appears in element/molecule info panels and calculator prose.

import { useState, type ReactNode } from 'react'
import { GLOSSARY } from './chemistry_data'
import { useThemeColors } from '../../hooks/useThemeColors.js'

type ThemeColors = ReturnType<typeof useThemeColors>

interface TermProps {
  word: string
  children: ReactNode
  C: ThemeColors
}

export default function Term({ word, children, C }: TermProps) {
  const [open, setOpen] = useState(false)
  const definition = GLOSSARY[word.toLowerCase()]
  if (!definition) return <>{children}</>

  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(o => !o)}
      style={{ position:'relative', display:'inline-block', cursor:'help',
        borderBottom:`1px dotted ${C.hint}` }}
    >
      {children}
      {open && (
        <span style={{
          position:'absolute', bottom:'calc(100% + 6px)', left:0, zIndex:50,
          width:220, padding:'8px 10px', borderRadius:8, fontSize:11.5, lineHeight:1.5,
          fontWeight:400, whiteSpace:'normal', cursor:'auto',
          background:C.surface, color:C.text, border:`1px solid ${C.border}`,
          boxShadow:'0 8px 24px rgba(0,0,0,0.25)',
        }}>
          {definition}
        </span>
      )}
    </span>
  )
}
