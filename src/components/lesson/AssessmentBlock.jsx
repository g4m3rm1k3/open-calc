import { useState, useEffect } from 'react';
import { parseProse } from '../math/parseProse.jsx';
import KatexBlock from '../math/KatexBlock.jsx';
import { useProgress } from '../../hooks/useProgress.js';

// Normalize user input for robust verification
function normalize(str) {
  return String(str ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeEquation(eq) {
  // Very basic normalization for math equations (y=mx+b vs y = mx + b)
  return normalize(eq).replace(/\\/g, ''); // Remove backslashes for simplicity in basic checks
}

export default function AssessmentBlock({ assessment, lessonId }) {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [hints, setHints] = useState({});
  const [progress, setProgress] = useState(0);
  const { markCheckpoint } = useProgress();

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem(`open-calc-assessment-${lessonId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setAnswers(data.answers || {});
      setStatus(data.status || {});
    }
  }, [lessonId]);

  const saveProgress = (newAnswers, newStatus) => {
    localStorage.setItem(`open-calc-assessment-${lessonId}`, JSON.stringify({
      answers: newAnswers,
      status: newStatus
    }));
  };

  const handleCheck = (qId, correctVal, type) => {
    const userVal = answers[qId] ?? '';
    const isCorrect = type === 'choice' 
      ? userVal === correctVal
      : normalizeEquation(userVal) === normalizeEquation(correctVal);

    const newStatus = { ...status, [qId]: isCorrect ? 'correct' : 'incorrect' };
    setStatus(newStatus);
    saveProgress(answers, newStatus);
    
    // Calculate progress
    const correctCount = Object.values(newStatus).filter(v => v === 'correct').length;
    setProgress(Math.round((correctCount / assessment.questions.length) * 100));
    if (correctCount === assessment.questions.length && lessonId) {
      markCheckpoint(lessonId, 'quiz-passed');
    }
  };

  const showHint = (qId) => {
    setHints({ ...hints, [qId]: true });
  };

  if (!assessment?.questions?.length) return null;

  return (
    <div className="mt-12 mb-10 overflow-hidden rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-sm">
      <div className="bg-emerald-600 dark:bg-emerald-900 px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <span>🎯</span> Assessment: Mastery Check
        </h3>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 bg-emerald-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-300 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-[10px] text-emerald-100 font-bold">{progress}%</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {assessment.questions.map((q, idx) => {
          const s = status[q.id] || 'pending';
          const hasHint = hints[q.id];

          return (
            <div key={q.id} className="relative pl-6 border-l-2 border-emerald-100 dark:border-emerald-900/50">
              <span className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {idx + 1}
              </span>
              
              <p className="text-slate-800 dark:text-slate-200 font-semibold mb-3">{parseProse(q.text)}</p>

              {q.type === 'input' && (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck(q.id, q.answer, q.type)}
                    placeholder="Enter your result..."
                    className={`flex-1 px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${s === 'correct' ? 'border-emerald-400' : s === 'incorrect' ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'}`}
                  />
                  <button 
                    onClick={() => handleCheck(q.id, q.answer, q.type)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Check
                  </button>
                </div>
              )}

              {q.type === 'choice' && (
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          const newAns = { ...answers, [q.id]: opt };
                          setAnswers(newAns);
                          // Auto-check for choices
                          const isCorrect = opt === q.answer;
                          const newStatus = { ...status, [q.id]: isCorrect ? 'correct' : 'incorrect' };
                          setStatus(newStatus);
                          saveProgress(newAns, newStatus);
                        }}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${isSelected ? (s === 'correct' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500 bg-rose-50 dark:bg-rose-950/20') : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200 dark:hover:border-emerald-800'}`}
                      >
                       {parseProse(opt)}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                {s === 'correct' && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-left-2">✓ Mastered!</p>
                )}
                {s === 'incorrect' && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-left-2">Not quite. Look closer at the intuition.</p>
                )}
                {s === 'pending' && <p className="text-slate-400 text-xs italic">Ready for attempt...</p>}

                <button 
                  onClick={() => showHint(q.id)}
                  className="text-slate-400 hover:text-emerald-500 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  {hasHint ? 'Hint Active' : 'Show Hint'}
                </button>
              </div>

              {hasHint && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200 italic animate-in zoom-in-95">
                  <span className="font-bold uppercase not-italic mr-1 text-amber-600">Hint:</span> {q.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {progress === 100 && (
        <div className="bg-emerald-500 text-white px-6 py-4 flex items-center justify-center gap-3 animate-in fade-in zoom-in slide-in-from-bottom-5 duration-700">
           <span className="text-2xl">🏆</span>
           <span className="font-bold uppercase tracking-tight">Lesson Mastered: Section Normalized for Calculus Chapter Review</span>
        </div>
      )}
    </div>
  );
}
