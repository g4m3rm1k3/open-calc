import VisualCodeStudio from "./VisualCodeStudio.tsx";

export const meta = {
  label: 'Visual Code Studio',
  emoji: '🧩',
  color: 'violet',
  desc: 'Build programs with block-based visual programming. Drag and drop logical blocks to generate real JavaScript, Python, or C++ code automatically. Live preview your creations instantly.',
  tags: ['CS', 'Logic', 'Visual', 'Blocks', 'Programming', 'Interactive', 'JavaScript', 'Python', 'C++'],
  cover: { grad: 'from-violet-600 via-fuchsia-700 to-indigo-950', mark: '🧩', sub: 'Blocks · Code · Live' },
}

export default function VisualCodeEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <VisualCodeStudio onBack={onBack} />
    </div>
  )
}
