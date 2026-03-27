import { parseProse } from '../math/parseProse.jsx';

export default function SpiralLinks({ spiral }) {
  if (!spiral) return null;

  const { recoveryPoints = [], futureLinks = [] } = spiral;

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-bold uppercase tracking-widest">Spiral Learning Pathway</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recoveryPoints.length > 0 && (
          <div className="p-4 rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50/20 dark:bg-sky-950/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-3 flex items-center gap-2">
              <span>⏮️</span> Recovery: You've Seen This Before
            </h4>
            <div className="space-y-3">
              {recoveryPoints.map((point, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                   {/* In a real app, this would be a link */}
                   {point.lessonId.replace('ch', 'Chapter ').replace('-', ': ')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {parseProse(point.note)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {futureLinks.length > 0 && (
          <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <span>⏭️</span> Future Link: Coming Soon
            </h4>
            <div className="space-y-3">
              {futureLinks.map((link, i) => (
                <div key={i} className="flex flex-col gap-1">
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                   {link.lessonId.replace('ch', 'Chapter ').replace('-', ': ')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {parseProse(link.note)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
