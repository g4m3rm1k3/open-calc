// Small "what is this" modal shown when a card in a TopicTable is clicked.
// Follows the same simple modal shell WhatsNewModal.jsx already uses
// (fixed inset-0, backdrop, click-outside-to-dismiss) — not the large
// contributor-tutorial HelpModal.jsx, an unrelated system.
import AppCard from './AppCard.jsx'

export default function ItemInfoModal({ item, onClose, onLaunch, getLessonStatus }) {
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm z-[210] border border-slate-200 dark:border-slate-700"
          title="Close"
        >
          ✕
        </button>

        {/* AppCard renders its own internal <Link to={item.path}> for labs/games
            (and courses) — without this capture-phase intercept, that Link fires
            a raw route navigation to the standalone page before onLaunch ever
            runs, skipping the pin/window system entirely (no floating window,
            no backTo, lands on whatever bare route that path resolves to). */}
        <div onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); onLaunch() }}>
          {item.kind === 'course'
            ? <AppCard item={item.cardItem} variant="course" chapters={item.chapters} getLessonStatus={getLessonStatus} />
            : <AppCard item={item.cardItem} variant={item.kind === 'game' ? 'game' : 'lab'} />
          }
        </div>
      </div>
    </div>
  )
}
