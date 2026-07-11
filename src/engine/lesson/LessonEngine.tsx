import { useMemo } from 'react'
import LessonView from './LessonView'
import { parseLesson } from './parser'
import { executeCode } from './executor'
import { useGlobalTheme } from '../../context/ThemeContext'
import type { UiTheme } from './types'

export default function LessonEngine({ markdown }: { markdown: string }) {
  const { themeStyles } = useGlobalTheme() as any
  const t = themeStyles ?? {}
  
  const ui: UiTheme = useMemo(() => ({
    bg0: t.bg0 ?? 'bg-slate-950',
    bg1: t.bg1 ?? 'bg-slate-900',
    bg2: t.bg2 ?? 'bg-slate-800',
    border: t.border ?? 'border-slate-800',
    txt1: t.txt1 ?? 'text-slate-100',
    txt2: t.txt2 ?? 'text-slate-400',
    hoverBg: t.hoverBg ?? 'hover:bg-slate-800',
    hoverTx: t.hoverTx ?? 'hover:text-slate-100',
    btnBorder: t.btnBorder ?? 'border-slate-700',
    primary: t.primary ?? 'text-brand-500',
    primaryBg: t.primaryBg ?? 'bg-brand-500',
  }), [t])

  const lesson = useMemo(() => parseLesson(markdown), [markdown])

  return (
    <LessonView 
      lesson={lesson} 
      executor={executeCode} 
      ui={ui} 
    />
  )
}
