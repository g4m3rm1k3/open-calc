import HtmlLab from './HtmlLab'

export const meta = {
  label: 'HTML Lab',
  emoji: '🏗️',
  color: 'orange',
  desc: 'Drag, drop, and style real HTML elements on a live canvas — div, p, h1, button, span, and more. Edit inline CSS through a properties panel, watch the code panel sync both ways, and see the box model visualized live.',
  tags: ['HTML', 'CSS', 'Web', 'Interactive'],
  cover: { grad: 'from-orange-600 via-amber-700 to-yellow-950', mark: '</>', sub: 'Elements · Box Model · CSS' },
}

export default function HtmlLabEntry({ onBack }) {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <HtmlLab onBack={onBack} />
    </div>
  )
}
