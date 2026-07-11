import LessonEngineLab from './LessonEngineLab.tsx'

export const meta = {
  label: 'Learn to Code',
  emoji: '📖',
  color: 'blue',
  kind: 'lesson',
  subject: 'CS Theory',
  desc: 'Write real code against real tests. Variable watch and step-through debugging show you what your code is actually doing. Python, JavaScript, DSA, and more.',
  tags: ['Learning', 'Python', 'JavaScript', 'DSA', 'Interactive', 'Challenges'],
  cover: { grad: 'from-blue-600 via-indigo-700 to-slate-900', mark: '</>', sub: 'Write · Test · Understand' },
}

export default function LessonEngineEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <LessonEngineLab onBack={onBack} />
    </div>
  )
}
