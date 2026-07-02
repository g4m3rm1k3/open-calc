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
      {/* Compact scene header — label only, no dots */}
      <div className="shrink-0 px-4 py-2 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 leading-none mb-0.5">
            Visualisation
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{meta.label}</div>
        </div>

        {/* Compact checkpoint score — only when answered */}
        {totalAnswered > 0 && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            totalCorrect === totalAnswered
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
          }`}>
            {totalCorrect === totalAnswered ? '✓' : ''} {totalCorrect}/{totalAnswered}
          </div>
        )}
      </div>

      {/* Canvas — fills all remaining space */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<SceneFallback />}>
          <Scene key={sceneId} />
        </Suspense>
      </div>

      {/* Checkpoint dots — only when quizzes answered */}
      {totalAnswered > 0 && (
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700/60 px-4 py-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">
            Checkpoints
          </span>
          {quizEntries.map(([id, correct]) => (
            <div
              key={id}
              title={correct ? 'Correct' : 'Incorrect'}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
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
    </div>
  )
}
