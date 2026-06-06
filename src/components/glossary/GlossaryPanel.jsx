import { useState, useMemo } from "react";
import { X, Search, BookOpen } from "lucide-react";
import { GLOSSARY } from "../../content/autoLoader.js";
import { Link } from "react-router-dom";
import { CURRICULUM } from "../../content/index.js";

function buildCourseTitle(courseId) {
  return courseId
    .replace(/-\d+$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getLessonPath(entry) {
  const chapter = CURRICULUM.find((c) => String(c.number) === String(entry.chapterNumber));
  if (!chapter) return null;
  return `/chapter/${chapter.number}/${entry.slug}`;
}

export default function GlossaryPanel({ onClose }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return GLOSSARY;
    const q = query.toLowerCase();
    return GLOSSARY.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q),
    );
  }, [query]);

  // Group by course → lesson
  const grouped = useMemo(() => {
    const map = {};
    for (const entry of filtered) {
      const courseKey = entry.course;
      if (!map[courseKey]) map[courseKey] = {};
      const lessonKey = entry.lessonId;
      if (!map[courseKey][lessonKey]) {
        map[courseKey][lessonKey] = {
          title: entry.lessonTitle,
          slug: entry.lessonSlug,
          chapterNumber: entry.chapterNumber,
          terms: [],
        };
      }
      map[courseKey][lessonKey].terms.push(entry);
    }
    return map;
  }, [filtered]);

  const courseIds = Object.keys(grouped);

  return (
    <div className="fixed right-4 top-16 bottom-4 z-[150] w-[380px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Glossary</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{GLOSSARY.length} terms</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {courseIds.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-12">No terms match your search.</p>
        ) : (
          courseIds.map((courseId) => (
            <div key={courseId}>
              {/* Course header */}
              <div className="sticky top-0 z-10 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  {buildCourseTitle(courseId)}
                </span>
              </div>

              {Object.entries(grouped[courseId]).map(([lessonId, lesson]) => {
                const path = getLessonPath(lesson);
                return (
                  <div key={lessonId} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    {/* Lesson subheader */}
                    <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{lesson.title}</span>
                      {path && (
                        <Link
                          to={path}
                          className="text-[10px] text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                        >
                          Go to lesson →
                        </Link>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="px-4 pb-3 space-y-2">
                      {lesson.terms.map((entry) => (
                        <div key={entry.term} className="text-sm">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.term}</span>
                          {entry.symbol && (
                            <span className="ml-1.5 text-slate-400 font-mono text-xs">{entry.symbol}</span>
                          )}
                          <span className="text-slate-500 dark:text-slate-400"> — {entry.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
