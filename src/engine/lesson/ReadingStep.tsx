import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { LessonStep, Executor, UiTheme } from './types'
import type { TraceEvent } from '../../labs/codelens/codelens/types'
import RunExample from './RunExample'
import styles from './LessonEngine.module.css'

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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.prose}</ReactMarkdown>
        </div>
      )}
      {step.examples.map((ex, i) => (
        <RunExample key={i} snippet={ex} executor={executor} ui={ui} onTrace={onTrace} />
      ))}
    </div>
  )
}
