import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LESSON_MAP, ALL_LESSONS, CURRICULUM } from "../content/index.js";
import { useProgress } from "../hooks/useProgress.js";
import MicroCycleLesson from "../components/lesson/MicroCycleLesson.jsx";
import MobileLessonContent from "../components/lesson/MobileLessonContent.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import CrossRef from "../components/lesson/CrossRef.jsx";
import VizFrame from "../components/viz/VizFrame.jsx";
import MarkdownProse from "../components/math/MarkdownProse.jsx";
import { enhanceLessonForUnifiedLearning } from "../content/enhancers/unifiedLessonEnhancer.js";
import OpenInGrapher from "../components/lesson/OpenInGrapher.jsx";
import LessonQuizBlock from "../components/lesson/LessonQuizBlock.jsx";
import { useVideoPlayer } from "../hooks/useVideoPlayer.js";
import TutorPanel from "../components/tutor/TutorPanel.jsx";
import { useOptionalLesson } from "../hooks/useOptionalLesson.js";
import WikiIntro from "../components/lesson/WikiIntro.jsx";
import WikiDiagrams from "../components/lesson/WikiDiagrams.jsx";
export default function LessonPage() {
  const { chapterId, lessonSlug, "*": rest } = useParams();
  const slug = lessonSlug + (rest ? `/${rest}` : "");
  const key = `${chapterId}/${slug}`;
  const rawLesson = LESSON_MAP[key];
  const { lessonSource, lessonOverride, isLoadingOverride } = useOptionalLesson(
    key,
    rawLesson,
  );
  const lesson = useMemo(
    () =>
      lessonOverride ? enhanceLessonForUnifiedLearning(lessonOverride) : null,
    [lessonOverride],
  );
  const {
    markCheckpoint,
    getActiveTab,
    getLessonStatus,
    setReadingProgress,
    getReadingProgress,
  } = useProgress();
  const { setLessonId } = useVideoPlayer();
  const isMobile = useIsMobile();
  const activeTab = getActiveTab(lesson?.id ?? "");
  const initialReadingProgress = getReadingProgress(lesson?.id ?? "");

  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (lesson?.id) setLessonId(lesson.id);
  }, [lesson?.id, setLessonId]);

  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.title} - UpSkillOS`;
    }
    return () => {
      document.title = "UpSkillOS";
    };
  }, [lesson?.id, lesson]);

  useEffect(() => {
    if (!lesson?.id || scrollPercent < 60) return;
    markCheckpoint(lesson.id, `read-${activeTab}`);
  }, [lesson?.id, activeTab, scrollPercent, markCheckpoint]);

  useEffect(() => {
    if (!lesson?.id) return;
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (height === 0) return;
      const scrolled = (winScroll / height) * 100;
      setScrollPercent(scrolled);
      if (scrolled > 10) setReadingProgress(lesson.id, Math.floor(scrolled));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lesson?.id, setReadingProgress]);

  if (!lesson) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-4xl">🔍</p>
        <h2 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-300">
          Lesson not found
        </h2>
        <p className="mb-6 text-slate-500">
          The lesson at chapter/{chapterId}/{slug} doesn&apos;t exist yet.
        </p>
        <Link
          to="/"
          className="text-brand-600 hover:underline dark:text-brand-400"
        >
          Back to curriculum
        </Link>
      </div>
    );
  }

  const lessonIndex = ALL_LESSONS.findIndex((entry) => entry.id === lesson.id);
  const prevLesson = lessonIndex > 0 ? ALL_LESSONS[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[lessonIndex + 1] : null;

  return (
    <div className="flex-1 min-h-screen relative overflow-x-hidden bg-white dark:bg-slate-950">
      <TutorPanel lesson={lesson} />
      <article className="mx-auto max-w-[1440px] pb-24 pt-6 px-4 sm:px-8 md:px-12 min-h-screen relative">

      <div className="pointer-events-none fixed left-0 top-0 z-[10001] h-1 w-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {(() => {
        const chapter = CURRICULUM.find(
          (entry) => String(entry.number) === chapterId,
        );
        return (
          <nav className="mb-6 px-4 md:px-0 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link
              to="/"
              className="hover:text-brand-600 dark:hover:text-brand-400"
            >
              Home
            </Link>
            {chapter?.course && (
              <>
                <span>›</span>
                <Link
                  to={`/course/${chapter.course}`}
                  className="capitalize hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {chapter.course.replace(/-\d+$/, "").replace(/-/g, " ")}
                </Link>
              </>
            )}
            <span>›</span>
            <Link
              to={`/chapter/${chapterId}`}
              className="hover:text-brand-600 dark:hover:text-brand-400"
            >
              {chapter?.title ?? chapterId}
            </Link>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-300">
              {lesson.title}
            </span>
          </nav>
        );
      })()}

      <header className="-mx-4 sm:mx-0 sm:rounded-3xl mb-12 overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border-y sm:border border-slate-200 dark:border-slate-800 relative">
        <div className="oc-header-gradient px-6 py-10 sm:px-12 sm:py-14">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {(() => {
              const chapter = CURRICULUM.find(
                (entry) => String(entry.number) === chapterId,
              );
              return (
                <>
                  <span className="rounded-full bg-brand-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-500/30">
                    {chapter?.title ?? chapterId}
                    {lesson.order !== undefined
                      ? ` · Lesson ${lesson.order + 1}`
                      : ""}
                  </span>
                  {lessonSource === "override" && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Local override
                    </span>
                  )}
                  {isLoadingOverride && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Checking local backend…
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-slate-200 sm:text-6xl lg:text-7xl !leading-[1.1]">
            {lesson.title}
          </h1>
          {lesson.subtitle && (
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium opacity-90">
              {lesson.subtitle}
            </p>
          )}
          {lesson.grapher && (
            <div className="mt-5">
              <OpenInGrapher config={lesson.grapher} />
            </div>
          )}
        </div>
      </header>

      {lesson.hook && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Introduction
            </span>
            <div className="flex-1 h-px bg-brand-100 dark:bg-brand-900/40" />
          </div>
          <div className="mb-8">
            <MarkdownProse
              text={lesson.hook.question}
              className="[&_p]:text-[20px] [&_p]:sm:text-[22px] [&_p]:font-serif [&_p]:font-medium [&_p]:leading-relaxed [&_p]:text-brand-900 [&_p]:dark:text-brand-100 italic border-l-4 border-brand-200 dark:border-brand-800 pl-6 my-6"
            />
          </div>
          <MarkdownProse text={lesson.hook.realWorldContext} />
          {lesson.hook.visualizations?.length > 0
            ? lesson.hook.visualizations.map((viz, index) => (
                <div
                  key={index}
                  className="mt-8 mb-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800"
                >
                  <VizFrame
                    id={viz.id}
                    initialProps={viz.initialProps ?? viz.props ?? {}}
                    title={viz.title}
                  />
                </div>
              ))
            : lesson.hook.previewVisualizationId && (
                <div className="mt-8 mb-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
                  <VizFrame
                    id={lesson.hook.previewVisualizationId}
                    initialProps={lesson.hook.previewVisualizationProps ?? {}}
                  />
                </div>
              )}
        </section>
      )}

      <WikiIntro query={lesson.title} tags={lesson.tags} />
      <WikiDiagrams query={lesson.title} tags={lesson.tags} />

      {lesson.tags?.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-12">
        {isMobile ? (
          <div className="-mx-4 sm:mx-0">
            <MobileLessonContent lesson={lesson} />
          </div>
        ) : (
          <MicroCycleLesson lesson={lesson} />
        )}
      </div>

      {lesson.quiz?.length > 0 && (
        <LessonQuizBlock
          key={key}
          lessonId={lesson.id}
          questions={lesson.quiz}
        />
      )}

      {lesson.crossRefs?.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Related Lessons
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {lesson.crossRefs.map((ref) => (
              <CrossRef key={ref.lessonSlug ?? ref.slug} {...ref} />
            ))}
          </div>
        </section>
      )}

      <nav className="flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-700">
        {prevLesson ? (
          <Link
            to={`/chapter/${prevLesson.chapterNumber}/${prevLesson.slug}`}
            className="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Previous
              </div>
              <div className="font-medium">{prevLesson.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            to={`/chapter/${nextLesson.chapterNumber}/${nextLesson.slug}`}
            className="group flex items-center gap-2 text-right text-sm text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Next
              </div>
              <div className="font-medium">{nextLesson.title}</div>
            </div>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
    </div>
  );
}
