import { Suspense } from 'react'
import { SCENE_REGISTRY, SCENE_META } from './scenes/index.js'

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )
}

export default function EngMathRight({ activeScene, quizResults = {} }) {
  const sceneId = activeScene || 'WelcomeScene'
  const Scene = SCENE_REGISTRY[sceneId] || SCENE_REGISTRY.WelcomeScene
  const meta = SCENE_META[sceneId] || SCENE_META.WelcomeScene

  const quizEntries = Object.entries(quizResults)
  const totalAnswered = quizEntries.length
  const totalCorrect = quizEntries.filter(([, v]) => v).length

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
      {/* Scene header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">
            Visualisation
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{meta.label}</div>
        </div>

        {/* Scene position dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          {Object.keys(SCENE_REGISTRY).map((id) => (
            <div
              key={id}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                id === sceneId
                  ? 'bg-indigo-500 scale-125'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Canvas — fills remaining space */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<SceneFallback />}>
          <Scene key={sceneId} />
        </Suspense>
      </div>

      {/* Scene description */}
      {meta.desc && (
        <div className="shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{meta.desc}</p>
        </div>
      )}

      {/* Checkpoint progress panel */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-700/60 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Checkpoints
          </span>
          {totalAnswered > 0 && (
            <span className={`text-xs font-semibold ${
              totalCorrect === totalAnswered
                ? 'text-green-600 dark:text-green-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {totalCorrect} / {totalAnswered} correct
            </span>
          )}
        </div>

        {totalAnswered === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-600 italic">
            Answer checkpoints in the lesson to track progress.
          </p>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {quizEntries.map(([id, correct]) => (
              <div
                key={id}
                title={correct ? 'Correct' : 'Incorrect'}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                  correct
                    ? 'bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                }`}
              >
                {correct ? '✓' : '✗'}
              </div>
            ))}
          </div>
        )}

        {totalAnswered > 0 && totalCorrect === totalAnswered && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">All checkpoints passed ✓</p>
        )}
      </div>
    </div>
  )
}
