/**
 * MobileLessonContent — mobile-optimised lesson layout.
 *
 * Padding model: cards sit mx-4 from screen edges; inner content gets one
 * layer of px-4. No section wrapper ever adds horizontal padding so there
 * is never double-stacked horizontal padding.
 *
 * Tab bar: sticky scroll-spy that also supports tap-to-jump.
 * Vizualizations: collapsed behind a tap-to-open button so desktop-sized
 * iframes don't break the mobile layout.
 */
import { useRef, useState, useEffect, useCallback } from "react";
import VizFrame from "../viz/VizFrame.jsx";
import Callout from "../ui/Callout.jsx";
import SVGImage from "./SVGImage.jsx";
import StepThrough from "./StepThrough.jsx";
import DynamicProof from "./DynamicProof.jsx";
import ScrubbableExample from "./ScrubbableExample.jsx";
import ChallengeBlock from "./ChallengeBlock.jsx";
import NarrativeStory from "./NarrativeStory.jsx";
import FirstPrinciplesLesson from "./FirstPrinciplesLesson.jsx";
import GuidedWalkthrough from "./GuidedWalkthrough.jsx";
import UnifiedLearningDock from "./UnifiedLearningDock.jsx";
import AssessmentBlock from "./AssessmentBlock.jsx";
import MarkdownProse from "../math/MarkdownProse.jsx";
import KatexBlock from "../math/KatexBlock.jsx";
import { parseProse } from "../math/parseProse.jsx";
import StickyNote from "../ui/StickyNote.jsx";

// ─── Prose utilities ───────────────────────────────────────────────────────

const HEADING_PREFIX = /^\*\*([^*\n]+)\*\*\s*/;
const BULLET_RE = /^[•\-*]\s+/;
const ORDERED_RE = /^\d+\.\s+/;

function ProseParagraph({ text, isFirst }) {
  const match = text.match(HEADING_PREFIX);
  if (match) {
    const heading = match[1];
    const body = text.slice(match[0].length).trim();
    return (
      <div className={`${isFirst ? "" : "pt-5 border-t border-slate-100 dark:border-slate-800"} pb-2 last:pb-0`}>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-600 dark:text-sky-400 mb-2">{heading}</p>
        {body && <MarkdownProse text={body} />}
      </div>
    );
  }
  return (
    <div className={`${isFirst ? "" : "pt-4 border-t border-slate-100 dark:border-slate-800"} last:pb-0`}>
      <MarkdownProse text={text} />
    </div>
  );
}

function normalizeProse(paragraphs = []) {
  const merged = [];
  for (const raw of paragraphs) {
    const current = String(raw ?? "").trim();
    if (!current) continue;
    const isListLike = /^(?:\d+\.|[•*-])\s/.test(current);
    const isHeadingLike = current.startsWith("**");
    const words = current.split(/\s+/).filter(Boolean);
    if (!isListLike && !isHeadingLike && words.length <= 2 && current.length <= 18 && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${current}`;
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function renderMixedProse(prose) {
  const out = [];
  let i = 0;
  while (i < prose.length) {
    const p = prose[i];
    if (BULLET_RE.test(p)) {
      const items = [];
      while (i < prose.length && BULLET_RE.test(prose[i])) items.push(prose[i++].replace(BULLET_RE, ""));
      out.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
          {items.map((item, j) => <li key={j} className="leading-relaxed">{parseProse(item)}</li>)}
        </ul>,
      );
    } else if (ORDERED_RE.test(p)) {
      const items = [];
      while (i < prose.length && ORDERED_RE.test(prose[i])) items.push(prose[i++].replace(ORDERED_RE, ""));
      out.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300">
          {items.map((item, j) => <li key={j} className="leading-relaxed">{parseProse(item)}</li>)}
        </ol>,
      );
    } else {
      out.push(<ProseParagraph key={`p-${i}`} text={p} isFirst={out.length === 0} />);
      i++;
    }
  }
  return out;
}

function SectionContent({ data }) {
  if (!data) return null;
  const rawBlocks = data.blocks ?? [];
  if (rawBlocks.length > 0) {
    return (
      <div className="space-y-4">
        {rawBlocks.map((block, i) => {
          if (block.type === "prose") return <div key={i} className="text-slate-700 dark:text-slate-300">{renderMixedProse(normalizeProse(block.paragraphs ?? []))}</div>;
          if (block.type === "callout") return <Callout key={i} {...block} />;
          if (block.type === "stepthrough") return <StepThrough key={i} {...block} />;
          if (block.type === "viz") { const n = normalizeViz(block); return n ? <MobileVizCard key={i} viz={n} /> : null; }
          if (block.type === "math") {
            return (
              <div key={i} className="my-3 overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-4 text-center shadow-sm">
                <KatexBlock expr={block.tex} />
                {block.caption && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">{block.caption}</p>
                )}
              </div>
            );
          }
          if (block.type === "image") {
            return (
              <div key={i} className="px-4">
                <SVGImage
                  src={block.src}
                  alt={block.alt}
                  caption={block.caption}
                />
              </div>
            );
          }
          return null;
        })}
        {(data.callouts ?? []).map((c, i) => <Callout key={`extra-${i}`} {...c} />)}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {renderMixedProse(normalizeProse(data.prose))}
      {(data.callouts ?? []).map((c, i) => <Callout key={i} {...c} />)}
    </div>
  );
}

// ─── Viz utilities ─────────────────────────────────────────────────────────

function normalizeViz(v) {
  if (!v) return null;
  const id = v.id ?? v.vizId;
  if (!id) return null;
  return { id, initialProps: v.initialProps, props: v.props ?? v.visualizationProps ?? {}, title: v.title, caption: v.caption, mathBridge: v.mathBridge };
}

function getSectionVizzes(section) {
  if (!section) return [];
  const vizzes = [];
  if (section.visualizationId) vizzes.push({ id: section.visualizationId, props: section.visualizationProps ?? {} });
  for (const v of section.visualizations ?? []) { const n = normalizeViz(v); if (n) vizzes.push(n); }
  const seen = new Set();
  return vizzes.filter((v) => { const key = `${v.id}:${JSON.stringify(v.initialProps ?? v.props ?? {})}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

const LAB_VIZ_IDS = new Set(["PythonNotebook", "OpenMatNotebook", "GcodeNotebook"]);

function extractLabVizzes(section) {
  if (!section?.visualizations?.length) return { section, labs: [] };
  return {
    labs: section.visualizations.filter((v) => LAB_VIZ_IDS.has(v.id ?? v.vizId)),
    section: { ...section, visualizations: section.visualizations.filter((v) => !LAB_VIZ_IDS.has(v.id ?? v.vizId)) },
  };
}

// ─── Tap-to-open viz card ──────────────────────────────────────────────────

// Vizzes that work well on phone — render directly without a tap-to-expand wrapper
const PHONE_OK_VIZ_IDS = new Set([
  "PythonNotebook", "OpenMatNotebook", "JSNotebook", "SQLNotebook",
  "ScienceNotebook", "GcodeNotebook", "VideoEmbed", "VideoCarousel", "VideoLauncher",
]);

function MobileVizCard({ viz, borderColor = "border-slate-200 dark:border-slate-700" }) {
  const [expanded, setExpanded] = useState(false);

  // Phone-OK components work natively on mobile — skip the tap-to-expand card
  // wrapper entirely. VizFrame is already transparent for these components.
  if (PHONE_OK_VIZ_IDS.has(viz.id)) {
    return (
      <>
        {viz.mathBridge && (
          <div className="px-4 py-3 mb-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 [&_p]:text-sm [&_p]:text-indigo-900 [&_p]:dark:text-indigo-200">
            <MarkdownProse text={viz.mathBridge} />
          </div>
        )}
        <VizFrame id={viz.id} initialProps={viz.initialProps ?? viz.props ?? {}} title={viz.title} />
        {viz.caption && (
          <p className="text-xs text-slate-400 dark:text-slate-500 px-1 pt-2 italic text-center leading-relaxed">
            {parseProse(viz.caption)}
          </p>
        )}
      </>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border ${borderColor} bg-white dark:bg-slate-900`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-colors text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {viz.title ?? "Interactive Visualization"}
        </span>
        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 ml-3 flex-shrink-0">
          {expanded ? "Close ▲" : "View ▼"}
        </span>
      </button>
      {expanded && (
        <>
          {viz.mathBridge && (
            <div className="px-0 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 [&_p]:text-sm [&_p]:text-indigo-900 [&_p]:dark:text-indigo-200">
              <MarkdownProse text={viz.mathBridge} />
            </div>
          )}
          <VizFrame id={viz.id} initialProps={viz.initialProps ?? viz.props ?? {}} title={viz.title} />
          {viz.caption && (
            <p className="text-xs text-slate-400 dark:text-slate-500 px-4 py-2.5 italic text-center leading-relaxed border-t border-slate-100 dark:border-slate-800">
              {parseProse(viz.caption)}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Card primitives ───────────────────────────────────────────────────────
// All cards use mx-4 for screen-edge gutter. Inner content uses px-4 —
// one layer total, never nested.

const CARD_THEMES = {
  slate:   { card: "border-slate-200 dark:border-slate-700",   header: "bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700", icon: "border-slate-200 dark:border-slate-700", kicker: "text-slate-500 dark:text-slate-400", label: "text-slate-800 dark:text-slate-100" },
  brand:   { card: "border-brand-100 dark:border-brand-900/60", header: "bg-brand-50/80 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900/60", icon: "border-brand-200 dark:border-brand-800", kicker: "text-brand-600 dark:text-brand-400", label: "text-brand-800 dark:text-brand-200" },
  purple:  { card: "border-purple-100 dark:border-purple-900/60", header: "bg-purple-50/80 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/60", icon: "border-purple-200 dark:border-purple-800", kicker: "text-purple-600 dark:text-purple-400", label: "text-purple-800 dark:text-purple-200" },
  emerald: { card: "border-emerald-100 dark:border-emerald-900/60", header: "bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60", icon: "border-emerald-200 dark:border-emerald-800", kicker: "text-emerald-600 dark:text-emerald-400", label: "text-emerald-800 dark:text-emerald-200" },
  amber:   { card: "border-amber-100 dark:border-amber-900/60", header: "bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/60", icon: "border-amber-200 dark:border-amber-800", kicker: "text-amber-600 dark:text-amber-400", label: "text-amber-800 dark:text-amber-200" },
};

function CardHeader({ icon, kicker, label, color, noteId, right }) {
  const t = CARD_THEMES[color] ?? CARD_THEMES.slate;
  return (
    <div className={`flex items-center gap-3 px-0 py-3.5 ${t.header}`}>
      <div className={`w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border ${t.icon} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-black uppercase tracking-[0.18em] ${t.kicker} mb-0.5`}>{kicker}</p>
        <p className={`font-bold text-[13px] uppercase tracking-wide leading-tight ${t.label}`}>{label}</p>
      </div>
      {noteId && <span className="flex-shrink-0" onClick={(e) => e.stopPropagation()}><StickyNote noteId={noteId} /></span>}
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

// Static card (Intuition, Practice headers)
function MobileCard({ id, icon, kicker, label, color = "slate", noteId, children }) {
  const t = CARD_THEMES[color] ?? CARD_THEMES.slate;
  return (
    <div id={id} className={`rounded-none sm:rounded-2xl border-x-0 sm:border-x border overflow-hidden bg-white dark:bg-slate-900 ${t.card} scroll-mt-24`}>
      <CardHeader icon={icon} kicker={kicker} label={label} color={color} noteId={noteId} />
      <div className="px-0 pb-5 pt-3">{children}</div>
    </div>
  );
}

// Collapsible card (Math, Proof, Labs)
function MobileCollapsible({ id, icon, kicker, label, color = "slate", defaultOpen = false, noteId, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const t = CARD_THEMES[color] ?? CARD_THEMES.slate;
  const toggle = <span className={`text-[10px] font-bold uppercase tracking-wide ${t.kicker}`}>{open ? "▲" : "▼"}</span>;
  return (
    <div id={id} className={`rounded-none sm:rounded-2xl border-x-0 sm:border-x border overflow-hidden bg-white dark:bg-slate-900 ${t.card} scroll-mt-24`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left active:opacity-80 transition-opacity`}
      >
        <CardHeader
          icon={icon}
          kicker={kicker}
          label={label}
          color={color}
          noteId={noteId}
          right={toggle}
        />
      </button>
      {open && <div className="px-0 py-5">{children}</div>}
    </div>
  );
}

// ─── Section anchor wrapper (no horizontal padding) ────────────────────────

function Anchor({ id, children, className = "" }) {
  return <div id={id} className={`scroll-mt-24 ${className}`}>{children}</div>;
}

// ─── Tab bar ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "intuition", icon: "🧠", label: "Intuition" },
  { id: "math",      icon: "📐", label: "Math" },
  { id: "rigor",     icon: "∴",  label: "Proof" },
  { id: "practice",  icon: "📝", label: "Practice" },
];

function sectionExists(lesson, id) {
  switch (id) {
    case "intuition": return !!(lesson.intuition?.prose?.length || lesson.intuition?.blocks?.length || lesson.intuition?.visualizations?.length || lesson.intuition?.visualizationId);
    case "math":      return !!(lesson.math?.prose?.length || lesson.math?.blocks?.length || lesson.math?.visualizations?.length);
    case "rigor":     return !!(lesson.rigor?.prose?.length || lesson.rigor?.blocks?.length || lesson.rigor?.proofSteps?.length);
    case "practice":  return !!(lesson.examples?.length || lesson.challenges?.length);
    default:          return false;
  }
}

function MobileTabBar({ tabs, activeTab, onTabClick }) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--color-page-bg)] border-b border-slate-200 dark:border-slate-800">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 transition-colors border-b-2 -mb-px active:bg-slate-100 dark:active:bg-slate-800 ${
                isActive
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-slate-400 dark:text-slate-500"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function MobileLessonContent({ lesson }) {
  const [activeTab, setActiveTab] = useState("intuition");
  const observerRef = useRef(null);

  const { section: mathWithoutLabs, labs: mathLabs } = extractLabVizzes(lesson.math);
  const openmatFromMath = mathLabs.filter((v) => (v.id ?? v.vizId) === "OpenMatNotebook");
  const pythonFromMath  = mathLabs.filter((v) => (v.id ?? v.vizId) === "PythonNotebook");

  const visibleTabs = TABS.filter((t) => sectionExists(lesson, t.id));

  // Scroll-spy
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const entries = new Map();
    observerRef.current = new IntersectionObserver(
      (records) => {
        for (const rec of records) entries.set(rec.target.id, rec.isIntersecting);
        for (const tab of visibleTabs) {
          if (entries.get(tab.id)) { setActiveTab(tab.id); break; }
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    for (const tab of visibleTabs) {
      const el = document.getElementById(tab.id);
      if (el) observerRef.current.observe(el);
    }
    return () => observerRef.current?.disconnect();
  }, [lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabClick = useCallback((tabId) => {
    const el = document.getElementById(tabId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab(tabId);
  }, []);

  // ── Viz pre-processing ─────────────────────────────────────────────────
  const intuition = lesson.intuition;
  const isIntBlocks   = (intuition?.blocks?.length ?? 0) > 0;
  const intuitionVizzes = isIntBlocks ? [] : getSectionVizzes(intuition);

  const isMathBlocks = (mathWithoutLabs?.blocks?.length ?? 0) > 0;
  const mathVizzes   = isMathBlocks ? [] : getSectionVizzes(mathWithoutLabs);

  const rigor = lesson.rigor;
  const isRigorBlocks = (rigor?.blocks?.length ?? 0) > 0;
  const allRigorVizzes = isRigorBlocks ? [] : getSectionVizzes(rigor);
  const rigorExtraVizzes = allRigorVizzes.filter((viz) => {
    if (!rigor?.visualizationId) return true;
    if (viz.id !== rigor.visualizationId) return true;
    return JSON.stringify(viz.initialProps ?? viz.props ?? {}) !== JSON.stringify(rigor.visualizationProps ?? {});
  });

  return (
    // Solid bg so the page-bg gradient never bleeds through between cards
    <div className="bg-white dark:bg-slate-950">
      {visibleTabs.length > 1 && (
        <MobileTabBar tabs={visibleTabs} activeTab={activeTab} onTabClick={handleTabClick} />
      )}

      {/* ── Section gap spacer ─── each section is spaced only by py-3 on the anchor */}

      {/* ── Intuition ─────────────────────────────────────────────── */}
      {sectionExists(lesson, "intuition") && (
        <Anchor id="intuition" className="pt-4 pb-2">
          <MobileCard icon="🧠" kicker="Conceptual" label="Intuition" color="slate" noteId={lesson.id ? `${lesson.id}:intuition` : undefined}>
            <SectionContent data={intuition} />
            {intuitionVizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                {intuitionVizzes.map((viz, i) => <MobileVizCard key={i} viz={viz} />)}
              </div>
            )}
            {(intuition?.alternate?.prose?.length > 0 || intuition?.alternate?.blocks?.length > 0) && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-3 text-center">Another Perspective</p>
                <SectionContent data={intuition.alternate} />
                {getSectionVizzes(intuition.alternate).map((viz, i) => <MobileVizCard key={i} viz={viz} />)}
              </div>
            )}
          </MobileCard>
        </Anchor>
      )}

      {/* ── Mental model ───────────────────────────────────────────── */}
      {lesson.mentalModel?.length > 0 && (
        <div className="my-2 rounded-none sm:rounded-2xl border-x-0 sm:border-x bg-white dark:bg-slate-900 border border-brand-100 dark:border-brand-900/60 border-b-4 border-b-brand-500 overflow-hidden">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 pt-3 pb-2 text-center">Mental Model</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
            {lesson.mentalModel.map((item, i) => (
              <div key={i} className="px-0 py-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 dark:text-brand-500 block mb-1">{String(i + 1).padStart(2, "0")}</span>
                <MarkdownProse text={item} className="[&_p]:text-sm [&_p]:font-semibold [&_p]:leading-snug [&_p]:text-slate-800 [&_p]:dark:text-slate-300 [&_p]:mb-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Math ──────────────────────────────────────────────────── */}
      {sectionExists(lesson, "math") && (
        <Anchor id="math" className="pt-2 pb-2">
          <MobileCollapsible icon="📐" kicker="Operational" label="Mathematics" color="brand" defaultOpen={true} noteId={lesson.id ? `${lesson.id}:math` : undefined}>
            {mathWithoutLabs?.processDefinition?.length > 0 && (
              <div className="mb-5 p-4 rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-200 mb-2">Operational Thinking</p>
                <ol className="space-y-2">
                  {mathWithoutLabs.processDefinition.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm font-semibold border-l-2 border-brand-400/30 pl-3 items-center">
                      <span className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-[10px] text-brand-300 flex-shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <SectionContent data={mathWithoutLabs} />
            {mathVizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                {mathVizzes.map((viz, i) => <MobileVizCard key={i} viz={viz} borderColor="border-brand-100 dark:border-brand-900" />)}
              </div>
            )}
          </MobileCollapsible>
        </Anchor>
      )}

      {/* ── Guided walkthroughs ────────────────────────────────────── */}
      {lesson.walkthroughs?.length > 0 && (
        <div className="pb-2">
          <MobileCollapsible icon="🗺" kicker="Step by step" label="Guided Walkthroughs" color="brand" defaultOpen={false} noteId={lesson.id ? `${lesson.id}:walkthroughs` : undefined}>
            <GuidedWalkthrough walkthroughs={lesson.walkthroughs} />
          </MobileCollapsible>
        </div>
      )}

      <UnifiedLearningDock lesson={lesson} />

      {/* ── Rigor / Proof ──────────────────────────────────────────── */}
      {sectionExists(lesson, "rigor") && (
        <Anchor id="rigor" className="pt-2 pb-2">
          <MobileCollapsible icon="∴" kicker="Formal" label="Rigor & Proof" color="purple" defaultOpen={false} noteId={lesson.id ? `${lesson.id}:rigor` : undefined}>
            {(rigor?.prose?.length > 0 || rigor?.callouts?.length > 0 || isRigorBlocks) && <SectionContent data={rigor} />}
            {rigor?.proofSteps?.length > 0 && (
              <DynamicProof steps={rigor.proofSteps} visualizationId={rigor.visualizationId} visualizationProps={rigor.visualizationProps ?? {}} />
            )}
            {rigorExtraVizzes.length > 0 && (
              <div className="mt-4 space-y-3">
                {rigorExtraVizzes.map((viz, i) => <MobileVizCard key={i} viz={viz} borderColor="border-purple-100 dark:border-purple-900" />)}
              </div>
            )}
          </MobileCollapsible>
        </Anchor>
      )}

      {/* ── Discovery / First Principles ──────────────────────────── */}
      {lesson.discovery && (
        Array.isArray(lesson.discovery)
          ? lesson.discovery.map((d, i) => <FirstPrinciplesLesson key={`${lesson.id}-discovery-${i}`} discovery={d} />)
          : <FirstPrinciplesLesson key={`${lesson.id}-discovery`} discovery={lesson.discovery} />
      )}

      {/* ── Stories ───────────────────────────────────────────────── */}
      {lesson.story && (
        Array.isArray(lesson.story)
          ? lesson.story.map((s, i) => <NarrativeStory key={`${lesson.id}-story-${i}`} story={s} />)
          : <NarrativeStory key={`${lesson.id}-story`} story={lesson.story} />
      )}

      {/* ── Practice ──────────────────────────────────────────────── */}
      {sectionExists(lesson, "practice") && (
        <Anchor id="practice" className="pt-2 pb-4">
          {lesson.examples?.length > 0 && (
            <>
              <div className="px-0 mb-3 flex items-center gap-2">
                <span className="text-base">📝</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Worked Examples</p>
              </div>
              <div className="space-y-4">
                {lesson.examples.map((ex, i) => (
                  <ScrubbableExample key={ex.id ?? i} example={ex} number={i + 1} lessonId={lesson.id} />
                ))}
              </div>
            </>
          )}
          {lesson.challenges?.length > 0 && (
            <div className={lesson.examples?.length > 0 ? "mt-5" : ""}>
              <div className="px-4 mb-3 flex items-center gap-2">
                <span className="text-base">🎯</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Challenge Problems</p>
              </div>
              <p className="px-4 text-sm text-slate-500 dark:text-slate-400 italic mb-4">
                Try each problem before revealing the walkthrough.
              </p>
              <div className="space-y-4">
                {lesson.challenges.map((ch, i) => <ChallengeBlock key={ch.id ?? i} challenge={ch} number={i + 1} />)}
              </div>
            </div>
          )}
        </Anchor>
      )}

      {/* ── OpenMAT / MATLAB lab ───────────────────────────────────── */}
      {(() => {
        const openmatRaw = lesson.openmat ?? lesson.openmatLab ?? lesson.notebooks?.matlab;
        const cells = openmatRaw?.cells ?? openmatRaw?.initialCells;
        let visualizations = openmatRaw?.visualizations ?? [];
        if (!visualizations.length && cells?.length) visualizations = [{ id: "OpenMatNotebook", initialProps: { initialCells: cells }, title: openmatRaw.title ?? "OpenMAT / MATLAB Lab" }];
        const all = [...visualizations, ...openmatFromMath];
        if (!all.length) return null;
        return (
          <div className="pb-2">
            <MobileCollapsible icon="⚙️" kicker="Lab" label={openmatRaw?.title ?? "OpenMAT / MATLAB"} color="amber" defaultOpen={false} noteId={lesson.id ? `${lesson.id}:openmat` : undefined}>
              {(openmatRaw?.description ?? openmatRaw?.intro) && <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{openmatRaw.description ?? openmatRaw.intro}</p>}
              {all.map((v, i) => <MobileVizCard key={i} viz={v} borderColor="border-amber-200 dark:border-amber-900/60" />)}
            </MobileCollapsible>
          </div>
        );
      })()}

      {/* ── Python lab ────────────────────────────────────────────── */}
      {(() => {
        const pythonRaw = lesson.python ?? lesson.pythonLab ?? lesson.notebooks?.python;
        const cells = pythonRaw?.cells ?? pythonRaw?.initialCells;
        let visualizations = pythonRaw?.visualizations ?? [];
        if (!visualizations.length && cells?.length) visualizations = [{ id: "PythonNotebook", props: { initialCells: cells }, title: pythonRaw.title ?? "Python Lab" }];
        const all = [...visualizations, ...pythonFromMath];
        if (!all.length) return null;
        return (
          <div className="pb-2">
            <MobileCollapsible icon="🐍" kicker="Lab" label={pythonRaw?.title ?? "Python Lab"} color="brand" defaultOpen={false} noteId={lesson.id ? `${lesson.id}:python` : undefined}>
              {(pythonRaw?.description ?? pythonRaw?.intro) && <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{pythonRaw.description ?? pythonRaw.intro}</p>}
              {all.map((v, i) => <MobileVizCard key={i} viz={v} borderColor="border-brand-200 dark:border-brand-900/60" />)}
            </MobileCollapsible>
          </div>
        );
      })()}

      {/* ── Assessment ────────────────────────────────────────────── */}
      {lesson.assessment?.questions?.length > 0 && (
        <div className="px-4 pb-4">
          <AssessmentBlock assessment={lesson.assessment} />
        </div>
      )}

      {/* Bottom breathing room — must clear fixed bottom nav (h-14 + bottom-6 = ~80px) */}
      <div className="h-24" />
    </div>
  );
}
