import { useMemo, useState } from "react";
import styles from "../HtmlLab.module.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS hooks file, no type declarations
import { useThemeColors } from "../../../../hooks/useThemeColors.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — JS hooks file, no type declarations
import { useProgress } from "../../../../hooks/useProgress.js";
import { lessonProgressKey } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

interface Props {
  lessons: Lesson[];
  onSelect: (lessonId: string) => void;
  onBack?: () => void;
}

const TOPIC_LABELS: Record<Lesson["topic"], string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

const TOPIC_ORDER: Lesson["topic"][] = ["html", "css", "js"];

export default function LessonCatalog({ lessons, onSelect, onBack }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const C: any = useThemeColors();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { progress, getLessonStatus }: any = useProgress();

  const topicsPresent = TOPIC_ORDER.filter((t) => lessons.some((l) => l.topic === t));
  const [activeTopic, setActiveTopic] = useState<Lesson["topic"]>(topicsPresent[0] ?? "html");

  const unitGroups = useMemo(() => {
    const groups: { unit: string; lessons: Lesson[] }[] = [];
    for (const lesson of lessons) {
      if (lesson.topic !== activeTopic) continue;
      let group = groups.find((g) => g.unit === lesson.unit);
      if (!group) { group = { unit: lesson.unit, lessons: [] }; groups.push(group); }
      group.lessons.push(lesson);
    }
    return groups;
  }, [lessons, activeTopic]);

  const continueLesson = useMemo(() => {
    let best: { lesson: Lesson; at: number } | null = null;
    for (const lesson of lessons) {
      const at: number = progress?.[lessonProgressKey(lesson.id)]?.lastVisitedAt ?? 0;
      if (at > 0 && (!best || at > best.at)) best = { lesson, at };
    }
    return best?.lesson ?? null;
  }, [lessons, progress]);

  const hlVars: Record<string, string> = {
    "--hl-bg": C.bg, "--hl-surface": C.surface, "--hl-surface2": C.surface2,
    "--hl-border": C.border, "--hl-text": C.text, "--hl-muted": C.muted,
    "--hl-accent": C.blue, "--hl-accent-bg": C.blueBg,
    "--hl-positive": C.green, "--hl-positive-bg": C.greenBg,
    "--hl-hint": C.hint,
  };

  return (
    <div className={styles.app} style={hlVars as React.CSSProperties}>
      <div className={styles.toolbar}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} title="Back to Labs">
            ← Labs
          </button>
        )}
        <span className={styles.toolbarLogo}>HTML Lab Lessons</span>
      </div>

      <div className={styles.catalogRoot}>
        {continueLesson && (
          <button className={styles.catalogContinue} onClick={() => onSelect(continueLesson.id)}>
            <span>Continue: {continueLesson.title}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}

        <div className={styles.catalogTabs}>
          {topicsPresent.map((topic) => (
            <button
              key={topic}
              className={`${styles.catalogTab} ${activeTopic === topic ? styles.catalogTabActive : ""}`}
              onClick={() => setActiveTopic(topic)}
            >
              {TOPIC_LABELS[topic]}
            </button>
          ))}
        </div>

        {unitGroups.map((group) => (
          <div key={group.unit} className={styles.catalogUnit}>
            <div className={styles.catalogUnitTitle}>{group.unit}</div>
            {group.lessons.map((lesson) => {
              const status: string = getLessonStatus(lessonProgressKey(lesson.id), lesson.steps.length);
              const pillClass =
                status === "complete" ? styles.catalogStatusComplete :
                status === "in-progress" ? styles.catalogStatusProgress :
                styles.catalogStatusNew;
              const pillLabel =
                status === "complete" ? "✓ Complete" :
                status === "in-progress" ? "In progress" :
                "Not started";
              return (
                <button key={lesson.id} className={styles.catalogLessonRow} onClick={() => onSelect(lesson.id)}>
                  <div>
                    <div className={styles.catalogLessonTitle}>{lesson.title}</div>
                    <div className={styles.catalogLessonDesc}>{lesson.description}</div>
                  </div>
                  <span className={`${styles.catalogStatusPill} ${pillClass}`}>{pillLabel}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
