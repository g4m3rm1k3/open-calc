import { useMemo, useState } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';
import { parseProse } from '../math/parseProse.jsx';

function pickGameQuestion(lesson) {
  const examples = Array.isArray(lesson?.examples) ? lesson.examples : [];
  for (const ex of examples) {
    const steps = (ex.steps ?? []).filter((s) => s?.expression && s?.annotation);
    if (steps.length >= 3) {
      const target = steps[Math.min(1, steps.length - 1)];
      const distractors = steps.filter((s) => s !== target).slice(0, 2).map((s) => s.annotation);
      return {
        prompt: target.expression,
        correct: target.annotation,
        options: [target.annotation, ...distractors],
        sourceTitle: ex.title,
      };
    }
  }
  return null;
}

function shuffle(array) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function UnifiedLearningDock({ lesson }) {
  const [choice, setChoice] = useState(null);
  const [tries, setTries] = useState(0);
  const missionPack = lesson?.unifiedMissionPack ?? null;

  const question = useMemo(() => pickGameQuestion(lesson), [lesson]);
  const options = useMemo(() => (question ? shuffle(question.options) : []), [question]);

  if (!question && !missionPack) return null;

  const isCorrect = choice !== null && choice === question.correct;
  const hasAnswered = choice !== null;

  return (
    <section className="mt-10 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300 mb-2">Unified Learning Dock</p>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Connect Visual, Algebra, and Intent</h3>
      {missionPack && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 p-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-sky-600 dark:text-sky-300">Topic Mission</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">{missionPack.label}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{parseProse(missionPack.visualMission)}</p>
          </div>
          <div className="rounded-lg border border-cyan-200 dark:border-cyan-900 bg-white dark:bg-slate-900 p-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-cyan-600 dark:text-cyan-300">Math Translation</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{parseProse(missionPack.mathMission)}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-300">Real-World Example</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{parseProse(missionPack.realWorldExample)}</p>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-300">Mini-Game + Puzzle</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2"><strong>Game:</strong> {parseProse(missionPack.miniGame)}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2"><strong>Puzzle:</strong> {parseProse(missionPack.puzzle)}</p>
          </div>
        </div>
      )}

      {question && (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Mini-game: match the algebra line to the best reasoning statement. This trains the exact bridge between symbolic moves and intuition.
          </p>

          <div className="rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 p-3 mb-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-sky-600 dark:text-sky-300 mb-1">Math Move</p>
            <KatexBlock expr={question.prompt} />
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => {
              const selected = choice === opt;
              const good = selected && isCorrect;
              const bad = selected && hasAnswered && !isCorrect;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChoice(opt);
                    setTries((t) => t + 1);
                  }}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${good ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : ''} ${bad ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20' : ''} ${!selected ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-sky-300 dark:hover:border-sky-700' : ''}`}
                >
                  {parseProse(opt)}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-sm">
            {!hasAnswered && <p className="text-slate-500 dark:text-slate-400">Pick an explanation before moving to the next section.</p>}
            {hasAnswered && isCorrect && (
              <p className="text-emerald-700 dark:text-emerald-300 font-medium">Correct. You are mapping algebra to meaning, not just copying steps.</p>
            )}
            {hasAnswered && !isCorrect && (
              <p className="text-rose-700 dark:text-rose-300 font-medium">Not yet. Try again by asking what structural role this line plays.</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Source example: {question.sourceTitle} · Attempts: {tries}</p>
          </div>
        </>
      )}
    </section>
  );
}
