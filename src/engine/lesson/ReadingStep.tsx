import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { LessonStep, Executor, UiTheme } from './types'
import type { TraceEvent } from '../../labs/codelens/codelens/types'
import RunExample from './RunExample'
import styles from './LessonEngine.module.css'
import { CodeBlockPre, CodeBlockCode } from '../../components/math/CodeBlock.jsx'

interface Props {
  step: LessonStep
  executor: Executor
  ui: UiTheme
  onTrace?: (events: TraceEvent[], code: string, step: number) => void
}

export default function ReadingStep({ step, executor, ui, onTrace }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {step.prose && (
        <div className={`${styles.prose} ${ui.txt1}`}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              pre: (({ children }: any) => <CodeBlockPre>{children}</CodeBlockPre>) as any,
              code: ({ className, children }: any) => (
                <CodeBlockCode
                  className={className}
                  inlineClassName={`px-1.5 py-0.5 rounded border font-mono text-[0.85em] bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]`}
                >
                  {children}
                </CodeBlockCode>
              )
            }}
          >
            {step.prose}
          </ReactMarkdown>
        </div>
      )}
      {step.examples.map((ex, i) => (
        <RunExample key={i} snippet={ex} executor={executor} ui={ui} onTrace={onTrace} />
      ))}
    </div>
  )
}
