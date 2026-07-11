import LessonEngine from '../../engine/lesson/LessonEngine'
import demoMd from './demoLesson.md?raw'
import styles from './LessonEngineDemo.module.css'

interface Props {
  onBack?: () => void
}

export default function LessonEngineDemo({ onBack }: Props) {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        {onBack && (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← Labs
          </button>
        )}
        <span className={styles.title}>Lesson Engine</span>
        <span className={styles.badge}>Demo</span>
      </header>
      <main className={styles.content}>
        <LessonEngine markdown={demoMd} />
      </main>
    </div>
  )
}
