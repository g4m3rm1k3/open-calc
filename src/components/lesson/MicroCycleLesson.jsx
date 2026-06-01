/**
 * MicroCycleLesson — single-column "Micro-Cycle" lesson layout.
 *
 * Each knowledge section flows vertically in order:
 *   🧠 Intuition  →  📐 Mathematics  →  ∴ Formal Proof  →  📝 Practice
 *
 * Visualizations are embedded full-width inside their section, not in a sidebar.
 * Mathematics starts open; Formal Proof starts collapsed ("prove it when ready").
 */
import { useState, useEffect } from "react";
import VizFrame from "../viz/VizFrame.jsx";
import Callout from "../ui/Callout.jsx";
import StepThrough from "./StepThrough.jsx";
import DynamicProof from "./DynamicProof.jsx";
import ScrubbableExample from "./ScrubbableExample.jsx";
import ChallengeBlock from "./ChallengeBlock.jsx";
import NarrativeStory from "./NarrativeStory.jsx";
import FirstPrinciplesLesson from "./FirstPrinciplesLesson.jsx";
import GuidedWalkthrough from "./GuidedWalkthrough.jsx";
import UnifiedLearningDock from "./UnifiedLearningDock.jsx";
import AssessmentBlock from "./AssessmentBlock.jsx";
import { parseProse } from "../math/parseProse.jsx";
import MarkdownProse from "../math/MarkdownProse.jsx";
import KatexBlock from "../math/KatexBlock.jsx";
import { useProgress } from "../../hooks/useProgress.js";
import StickyNote from "../ui/StickyNote.jsx";

// Re-export parseProse so existing imports from IntegratedLesson still work
export { parseProse } from "../math/parseProse.jsx";

// ─── Shared prose utilities ────────────────────────────────────────────────

const HEADING_PREFIX = /^\*\*([^*\n]+)\*\*\s*/;

function ProseParagraph({ text, isFirst }) {
  const match = text.match(HEADING_PREFIX);
  if (match) {
    const heading = match[1];
    const body = text.slice(match[0].length).trim();
    return (
      <div
        className={`${isFirst ? "" : "pt-6 border-t border-slate-100 dark:border-slate-800"} pb-2 last:pb-0`}
      >
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-600 dark:text-sky-400 mb-2">
          {heading}
        </p>
        {body && <MarkdownProse text={body} />}
      </div>
    );
  }
  return (
    <div
      className={`${isFirst ? "" : "pt-5 border-t border-slate-100 dark:border-slate-800"} last:pb-0`}
    >
      <MarkdownProse text={text} />
    </div>
  );
}

const BULLET_RE = /^[•\-*]\s+/;
const ORDERED_RE = /^\d+\.\s+/;

function renderMixedProse(prose) {
  const out = [];
  let i = 0;
  while (i < prose.length) {
    const p = prose[i];
    if (BULLET_RE.test(p)) {
      const items = [];
      while (i < prose.length && BULLET_RE.test(prose[i])) {
        items.push(prose[i].replace(BULLET_RE, ""));
        i++;
      }
      out.push(
        <ul
          key={`ul-${i}`}
          className="list-disc pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300"
        >
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {parseProse(item)}
            </li>
          ))}
        </ul>,
      );
    } else if (ORDERED_RE.test(p)) {
      const items = [];
      while (i < prose.length && ORDERED_RE.test(prose[i])) {
        items.push(prose[i].replace(ORDERED_RE, ""));
        i++;
      }
      out.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal pl-5 space-y-1.5 mb-4 text-slate-700 dark:text-slate-300"
        >
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {parseProse(item)}
            </li>
          ))}
        </ol>,
      );
    } else {
      out.push(
        <ProseParagraph key={`p-${i}`} text={p} isFirst={out.length === 0} />,
      );
      i++;
    }
  }
  return out;
}

function normalizeProse(paragraphs = []) {
  const merged = [];
  for (const raw of paragraphs) {
    const current = String(raw ?? "").trim();
    if (!current) continue;
    const isListLike = /^(?:\d+\.|[•*-])\s/.test(current);
    const isHeadingLike = current.startsWith("**");
    const words = current.split(/\s+/).filter(Boolean);
    const isTinyFragment = words.length <= 2 && current.length <= 18;
    if (!isListLike && !isHeadingLike && isTinyFragment && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${current}`;
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function SectionContent({ data }) {
  if (!data) return null;

  // Blocks format — render all block types in natural order
  const rawBlocks = data.blocks ?? [];
  const contentBlocks = rawBlocks.filter((b) => b.type !== "callout" || true); // include all types
  if (contentBlocks.length > 0) {
    return (
      <div className="space-y-4">
        {contentBlocks.map((block, i) => {
          if (block.type === "prose") {
            return (
              <div
                key={i}
                className="prose-content text-slate-700 dark:text-slate-300"
              >
                {renderMixedProse(normalizeProse(block.paragraphs ?? []))}
              </div>
            );
          }
          if (block.type === "callout") return <Callout key={i} {...block} />;
          if (block.type === "stepthrough")
            return <StepThrough key={i} {...block} />;
          if (block.type === "viz") {
            const norm = normalizeViz(block);
            return norm ? <VizCard key={i} viz={norm} /> : null;
          }
          return null;
        })}
        {(data.callouts ?? []).map((c, i) => (
          <Callout key={`extra-${i}`} {...c} />
        ))}
      </div>
    );
  }

  // Legacy format (prose + callouts arrays, no blocks)
  const prose = normalizeProse(data.prose);
  return (
    <div className="space-y-4">
      {renderMixedProse(prose)}
      {(data.callouts ?? []).map((c, i) => (
        <Callout key={i} {...c} />
      ))}
    </div>
  );
}

// Normalize a visualization entry — supports {id} and legacy {vizId}
function normalizeViz(v) {
  if (!v) return null;
  const id = v.id ?? v.vizId;
  if (!id) return null;
  return {
    id,
    initialProps: v.initialProps,
    props: v.props ?? v.visualizationProps ?? {},
    title: v.title,
    caption: v.caption,
    mathBridge: v.mathBridge,
  };
}

function getSectionVizzes(section) {
  if (!section) return [];
  const vizzes = [];
  if (section.visualizationId) {
    vizzes.push({
      id: section.visualizationId,
      props: section.visualizationProps ?? {},
    });
  }
  for (const v of section.visualizations ?? []) {
    const norm = normalizeViz(v);
    if (norm) vizzes.push(norm);
  }
  // De-duplicate by ID + props (allows multiple VideoEmbed with different URLs)
  const seen = new Set();
  return vizzes.filter((v) => {
    const key = `${v.id}:${JSON.stringify(v.initialProps ?? v.props ?? {})}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Section divider ───────────────────────────────────────────────────────

function SectionDivider({ icon, label, color = "slate", noteId }) {
  const themes = {
    slate:
      "from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300",
    brand:
      "from-brand-50 to-white dark:from-brand-950/40 dark:to-slate-950 border-brand-100 dark:border-brand-900/60 text-brand-700 dark:text-brand-300",
    emerald:
      "from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-950 border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300",
    purple:
      "from-purple-50 to-white dark:from-purple-950/40 dark:to-slate-950 border-purple-100 dark:border-purple-900/60 text-purple-700 dark:text-purple-300",
  };

  return (
    <div
      id={noteId ? noteId.replace(/:/g, "-") : undefined}
      className={`group relative flex items-center gap-4 mb-8 p-1.5 pr-6 rounded-full border shadow-sm bg-gradient-to-r transition-all duration-300 hover:shadow-md ${themes[color]}`}
    >
      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-inherit flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-black text-[11px] uppercase tracking-[0.2em]">
        {label}
      </span>
      <div className="flex-1" />
      {noteId && <StickyNote noteId={noteId} />}
    </div>
  );
}

// ─── Full-width viz card ───────────────────────────────────────────────────

function VizCard({
  viz,
  noteId,
  borderColor = "border-slate-200 dark:border-slate-700",
}) {
  return (
    <div
      id={noteId ? noteId.replace(/:/g, "-") : undefined}
      className={`rounded-2xl overflow-hidden border ${borderColor} shadow-sm bg-white dark:bg-slate-900`}
    >
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        {viz.title ? (
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {viz.title}
          </p>
        ) : (
          <span />
        )}
        {noteId && <StickyNote noteId={noteId} />}
      </div>
      {viz.mathBridge && (
        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 [&_p]:text-sm [&_p]:text-indigo-900 [&_p]:dark:text-indigo-200 [&_strong]:text-indigo-800 [&_strong]:dark:text-indigo-100">
          <MarkdownProse text={viz.mathBridge} />
        </div>
      )}
      <VizFrame
        id={viz.id}
        initialProps={viz.initialProps ?? viz.props ?? {}}
        title={viz.title}
      />
      {viz.caption && (
        <p className="text-xs text-slate-400 dark:text-slate-500 px-4 py-2.5 italic text-center leading-relaxed border-t border-slate-100 dark:border-slate-800">
          {parseProse(viz.caption)}
        </p>
      )}
    </div>
  );
}

// ─── Tab group for multiple vizzes in one section ─────────────────────────

const VIZ_TAB_LABELS = {
  GitWorkspace: "VS Code Panel",
  GitTerminal: "Terminal",
  GitKrakenView: "GitKraken",
  ShellTerminal: "Terminal",
};

function VizTabGroup({ vizzes, lessonId }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (vizzes.length <= 1) {
    return vizzes.length === 1 ? (
      <VizCard
        viz={vizzes[0]}
        noteId={lessonId ? `${lessonId}:viz:${vizzes[0].id}` : undefined}
        borderColor="border-slate-200 dark:border-slate-700"
      />
    ) : null;
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        {vizzes.map((viz, i) => {
          const label = viz.title ?? VIZ_TAB_LABELS[viz.id] ?? viz.id;
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-brand-500 text-brand-700 dark:text-brand-300 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {vizzes.map((viz, i) => (
        <div key={i} style={{ display: i === activeIdx ? "block" : "none" }}>
          {viz.mathBridge && (
            <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 [&_p]:text-sm [&_p]:text-indigo-900 [&_p]:dark:text-indigo-200 [&_strong]:text-indigo-800 [&_strong]:dark:text-indigo-100">
              <MarkdownProse text={viz.mathBridge} />
            </div>
          )}
          <VizFrame
            id={viz.id}
            initialProps={viz.initialProps ?? viz.props ?? {}}
          />
        </div>
      ))}
    </div>
  );
}

// ─── 📘 Semantic Layer ─────────────────────────────────────────────────────

function SemanticsBlock({ semantics }) {
  if (!semantics) return null;
  return (
    <div className="mb-10 rounded-3xl border border-sky-100 dark:border-sky-900/40 bg-gradient-to-br from-sky-50/80 via-white/90 to-sky-100/80 dark:from-slate-900 dark:via-slate-950 dark:to-sky-900/40 overflow-hidden shadow-2xl shadow-sky-200/40 dark:shadow-sky-900/60">
      <div className="px-4 py-4 bg-gradient-to-r from-sky-200/80 via-sky-100/80 to-white/80 dark:from-sky-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-100 dark:border-sky-900/40">
        <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-800 dark:text-sky-200 drop-shadow-md">
          Semantic Layer: Symbols & Meaning
        </h3>
      </div>
      <div className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {semantics.core?.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-stretch gap-2 p-4 rounded-2xl bg-gradient-to-br from-white/90 via-sky-50/80 to-sky-100/80 dark:from-slate-900 dark:via-slate-950 dark:to-sky-900/60 border border-sky-200 dark:border-sky-800 shadow-xl shadow-sky-200/40 dark:shadow-sky-900/60 min-h-[120px] transition-all duration-200 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-300/50 dark:hover:border-sky-400 dark:hover:shadow-sky-800/80 relative overflow-hidden"
              style={{
                boxShadow:
                  "0 4px 32px 0 rgba(56,189,248,0.10), 0 1.5px 8px 0 rgba(56,189,248,0.10) inset",
              }}
            >
              <div className="flex-shrink-0 w-full flex justify-center mb-1">
                <div className="p-2 rounded-lg bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-sky-900 border border-sky-100 dark:border-sky-800 text-center font-mono text-base font-bold text-sky-600 dark:text-sky-300 shadow-inner w-full">
                  <KatexBlock expr={item.symbol} />
                </div>
              </div>
              <div className="flex-1 min-h-[2.5rem] text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed break-words drop-shadow-sm">
                <MarkdownProse text={item.meaning} />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent hover:border-sky-300 dark:hover:border-sky-400 transition-all duration-200" />
            </div>
          ))}
        </div>
        {semantics.rulesOfThumb?.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-sky-900/60 border border-sky-100 dark:border-sky-800/50 p-4 shadow-md shadow-sky-100/30 dark:shadow-sky-900/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-2">
              Rules of Thumb
            </p>
            <ul className="space-y-2">
              {semantics.rulesOfThumb.map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="text-sky-500 mt-0.5">→</span>
                  {parseProse(rule)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 🌉 Multi-Perspective Synchronization ──────────────────────────────────

function PerspectiveSync({ perspectives, bridge }) {
  if (!perspectives?.length) return null;
  return (
    <div className="mb-10 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-slate-900 overflow-hidden shadow-premium">
      <div className="px-4 py-4 oc-header-gradient border-b border-indigo-100 dark:border-indigo-900/40">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-800 dark:text-indigo-300">
          Perspective Synchronization
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {perspectives.map((p, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-50 dark:border-indigo-800 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400 dark:text-indigo-500 mb-1">
              {p.type}
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {p.statement}
            </p>
          </div>
        ))}
      </div>
      {bridge && (
        <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800 text-center">
          <p className="inline-block px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            {bridge}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── ⚠️ Failure Modes ───────────────────────────────────────────────────────

function FailureModes({ modes }) {
  if (!modes?.length) return null;
  return (
    <div className="mb-10 rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-slate-900 overflow-hidden shadow-premium">
      <div className="px-4 py-4 oc-header-gradient border-b border-rose-100 dark:border-rose-900/40">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400 flex items-center gap-2">
          <span>🚨</span> Failure Modes: Where Logic Breaks
        </h3>
      </div>
      <div className="px-4 py-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-rose-100 dark:border-rose-900/50">
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">
                Case
              </th>
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">
                Example
              </th>
              <th className="pb-2 font-bold text-rose-600 dark:text-rose-400">
                Internal Logic Failure
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-50 dark:divide-rose-900/20">
            {modes.map((m, i) => (
              <tr
                key={i}
                className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors"
              >
                <td className="py-3 pr-4 font-bold text-slate-800 dark:text-slate-200">
                  {m.case}
                </td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 font-mono">
                  <KatexBlock expr={m.example} />
                </td>
                <td className="py-3 italic text-rose-700 dark:text-rose-300">
                  {m.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 🔍 Local Linearity ────────────────────────────────────────────────────

function LocalLinearity({ config }) {
  if (!config) return null;
  return (
    <div className="mb-8 p-5 p-5 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/10 dark:bg-emerald-950/5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          🔍
        </div>
        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
          Local Linearity Principle
        </h3>
      </div>
      <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 leading-snug">
        {config.statement}
      </p>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900 shadow-sm mb-3 text-center">
        <KatexBlock expr={config.formula} />
      </div>
      <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
        Meaning: {config.meaning}
      </p>
    </div>
  );
}

// ─── 🎯 Recall Triggers ───────────────────────────────────────────────────

function TriggerSystem({ triggers }) {
  if (!triggers?.length) return null;
  return (
    <div className="mt-8 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
        Internal Trigger & Recall System
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {triggers.map((p, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors cursor-default group"
          >
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight mb-1">
              Trigger
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 transition-colors">
              "{p.prompt}"
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-brand-500 font-bold uppercase mb-1">
                Recall
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 italic">
                {p.recall}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 🧠 Intuition block ────────────────────────────────────────────────────

function IntuitionBlock({ data, lesson }) {
  const hasAlternate =
    data?.alternate?.prose?.length > 0 ||
    data?.alternate?.callouts?.length > 0 ||
    data?.alternate?.visualizations?.length > 0;

  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0;
  // If blocks format, vizzes are already rendered inline by SectionContent — don't render them again
  const primaryVizzes = isBlocksFormat ? [] : getSectionVizzes(data);
  const hasPrimary =
    data?.prose?.length > 0 ||
    data?.callouts?.length > 0 ||
    primaryVizzes.length > 0 ||
    isBlocksFormat;
  const alternateVizzes = hasAlternate ? getSectionVizzes(data.alternate) : [];
  if (!hasPrimary && !hasAlternate) return null;

  return (
    <div className="oc-shell-card mb-12 overflow-hidden">
      <div className="oc-header-gradient px-4 sm:px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl shadow-sm">
          🧠
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Conceptual
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
            Intuition
          </span>
        </div>
        <div className="flex-1" />
        {lesson?.id && <StickyNote noteId={`${lesson.id}:intuition`} />}
      </div>

      <div className="px-4 sm:px-6 py-6">
        <SemanticsBlock semantics={data.semantics ?? lesson?.semantics} />
        <SectionContent data={data} />
        {data.perspectives?.length > 0 && (
          <PerspectiveSync
            perspectives={data.perspectives}
            bridge={data.bridge}
          />
        )}
        {data.localLinearity && <LocalLinearity config={data.localLinearity} />}
        {primaryVizzes.length > 0 && (
          <div className="mt-6">
            <VizTabGroup vizzes={primaryVizzes} lessonId={lesson?.id} />
          </div>
        )}
        {data.failureModes?.length > 0 && (
          <FailureModes modes={data.failureModes} />
        )}
        {hasAlternate && (
          <>
            <div className="my-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Another Perspective
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <SectionContent data={data.alternate} />
            {alternateVizzes.length > 0 && (
              <div className="mt-6 space-y-4">
                {alternateVizzes.map((viz, i) => (
                  <VizCard
                    key={`alt-${viz.id}-${i}`}
                    viz={viz}
                    noteId={
                      lesson?.id ? `${lesson.id}:viz:alt-${viz.id}` : undefined
                    }
                    borderColor="border-slate-200 dark:border-slate-700"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── 📐 Mathematics block ──────────────────────────────────────────────────

function MathBlock({ data, lessonId }) {
  const [open, setOpen] = useState(true);
  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0;
  const vizzes = isBlocksFormat ? [] : getSectionVizzes(data);
  const hasProse = data?.prose?.length > 0 || isBlocksFormat;
  const hasCallouts = data?.callouts?.length > 0;
  if (!hasProse && !hasCallouts && !vizzes.length) return null;

  return (
    <div
      id={lessonId ? `${lessonId}-math` : undefined}
      className="oc-shell-card mb-12 overflow-hidden group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)
        }
        className="oc-header-gradient w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 hover:opacity-90 transition-all text-left cursor-pointer border-b border-brand-100 dark:border-brand-900/60"
      >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-xl shadow-sm">
          📐
        </div>
        <div className="flex flex-col">
          <span className="font-black text-brand-900 dark:text-brand-100 text-[10px] uppercase tracking-[0.2em]">
            Operational
          </span>
          <span className="font-bold text-brand-800 dark:text-brand-200 text-sm uppercase tracking-wider">
            Mathematics
          </span>
        </div>
        <div className="flex-1" />
        {lessonId && (
          <span onClick={(e) => e.stopPropagation()}>
            <StickyNote noteId={`${lessonId}:math`} />
          </span>
        )}
        <span className="bg-brand-100 dark:bg-brand-900/60 px-3 py-1 rounded-full text-brand-600 dark:text-brand-300 text-[10px] font-bold uppercase tracking-wider transition-transform group-hover:scale-105">
          {open ? "Collapse ▲" : "Expand ▼"}
        </span>
      </div>
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6 bg-white dark:bg-slate-900">
          {data.processDefinition?.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-200 mb-3">
                Operational Thinking: Finding the Derivative
              </p>
              <ol className="space-y-3">
                {data.processDefinition.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-4 text-sm font-semibold border-l-2 border-brand-400/30 pl-4 items-center"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center text-[10px] text-brand-300 flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <SectionContent data={data} />
          {vizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {vizzes.map((viz, i) => (
                <VizCard
                  key={`${viz.id}-${i}`}
                  viz={viz}
                  noteId={lessonId ? `${lessonId}:viz:${viz.id}` : undefined}
                  borderColor="border-brand-100 dark:border-brand-900"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ∴ Rigor / Formal Proof block ─────────────────────────────────────────

function RigorBlock({ data, lessonId }) {
  const [open, setOpen] = useState(false);
  const isBlocksFormat = (data?.blocks?.length ?? 0) > 0;
  const vizzes = isBlocksFormat ? [] : getSectionVizzes(data);
  const proofVizId = data?.visualizationId;
  const proofVizPropsKey = JSON.stringify(data?.visualizationProps ?? {});
  const extraVizzes = vizzes.filter((viz) => {
    if (!proofVizId) return true;
    if (viz.id !== proofVizId) return true;
    return (
      JSON.stringify(viz.initialProps ?? viz.props ?? {}) !== proofVizPropsKey
    );
  });
  const hasProse = data?.prose?.length > 0 || isBlocksFormat;
  const hasCallouts = data?.callouts?.length > 0;
  const hasProofSteps = data?.proofSteps?.length > 0;
  if (!hasProse && !hasCallouts && !vizzes.length && !hasProofSteps)
    return null;

  return (
    <div
      id={lessonId ? `${lessonId}-rigor` : undefined}
      className="oc-shell-card mb-12 overflow-hidden group"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)
        }
        className="oc-header-gradient w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 hover:opacity-90 transition-all text-left cursor-pointer border-b border-purple-100 dark:border-purple-900/60"
      >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-xl shadow-sm">
          ∴
        </div>
        <div className="flex flex-col">
          <span className="font-black text-purple-900 dark:text-purple-100 text-[10px] uppercase tracking-[0.2em]">
            Formal
          </span>
          <span className="font-bold text-purple-800 dark:text-purple-200 text-sm uppercase tracking-wider">
            Rigor & Proof
          </span>
        </div>
        <div className="flex-1" />
        {!open && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 dark:text-purple-500 mr-4 hidden sm:inline">
            Show the logic
          </span>
        )}
        {lessonId && (
          <span onClick={(e) => e.stopPropagation()}>
            <StickyNote noteId={`${lessonId}:rigor`} />
          </span>
        )}
        <span className="bg-purple-100 dark:bg-purple-900/60 px-3 py-1 rounded-full text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider transition-transform group-hover:scale-105">
          {open ? "Collapse" : "Prove It"}
        </span>
      </div>
      {open && (
        <div className="px-4 sm:px-6 py-6 space-y-6 bg-white dark:bg-slate-900">
          {hasProse || hasCallouts || isBlocksFormat ? (
            <SectionContent data={data} />
          ) : null}
          {hasProofSteps ? (
            <DynamicProof
              steps={data.proofSteps}
              visualizationId={data.visualizationId}
              visualizationProps={data.visualizationProps ?? {}}
            />
          ) : null}
          {extraVizzes.length > 0 && (
            <div className="mt-4 space-y-4">
              {extraVizzes.map((viz, i) => (
                <VizCard
                  key={`${viz.id}-${i}`}
                  viz={viz}
                  noteId={lessonId ? `${lessonId}:viz:${viz.id}` : undefined}
                  borderColor="border-purple-100 dark:border-purple-900"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 📝 Practice block ─────────────────────────────────────────────────────

function PracticeBlock({ examples, challenges, triggers, lessonId }) {
  const hasExamples = examples?.length > 0;
  const hasChallenges = challenges?.length > 0;
  if (!hasExamples && !hasChallenges) return null;

  return (
    <div className="mt-10">
      {hasExamples && (
        <div className="mb-10">
          <SectionDivider icon="📝" label="Worked Examples" color="emerald" />
          <div className="space-y-6">
            {examples.map((ex, i) => (
              <ScrubbableExample
                key={ex.id ?? i}
                example={ex}
                number={i + 1}
                lessonId={lessonId}
              />
            ))}
          </div>
        </div>
      )}
      {hasChallenges && (
        <div>
          <SectionDivider icon="🎯" label="Challenge Problems" color="slate" />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-5">
            Try each problem before revealing the walkthrough — the struggle is
            where learning happens.
          </p>
          <div className="space-y-4">
            {challenges.map((ch, i) => (
              <ChallengeBlock key={ch.id ?? i} challenge={ch} number={i + 1} />
            ))}
          </div>
        </div>
      )}
      {triggers?.length > 0 && <TriggerSystem triggers={triggers} />}
    </div>
  );
}

// ─── 🔗 Spiral Links block ─────────────────────────────────────────────────

function SpiralBlock({ spiral }) {
  if (!spiral) return null;
  const { recoveryPoints = [], futureLinks = [] } = spiral;
  if (!recoveryPoints.length && !futureLinks.length) return null;
  return (
    <div className="mt-12 mb-10 rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900 overflow-hidden shadow-premium">
      <div className="px-6 py-4 oc-header-gradient border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
        <span className="text-lg">🔗</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
          Spiral Learning: Context & Progression
        </h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {recoveryPoints.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">
              ↩ Recovering From
            </p>
            <div className="space-y-3">
              {recoveryPoints.map((pt, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-800/50 shadow-sm"
                >
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">
                    {pt.label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pt.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {futureLinks.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              → Unlocking Next
            </p>
            <div className="space-y-3">
              {futureLinks.map((pt, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
                >
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                    {pt.label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pt.note}
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

// ─── ✅ Assessment block ──────────────────────────────────────────────────────

// Notebook IDs that should render in the labs section (after examples), not inside Math/Rigor
const LAB_VIZ_IDS = new Set(["PythonNotebook", "OpenMatNotebook", "GcodeNotebook"]);

function extractLabVizzes(section) {
  if (!section?.visualizations?.length) return { section, labs: [] };
  const labs = section.visualizations.filter((v) =>
    LAB_VIZ_IDS.has(v.id ?? v.vizId),
  );
  const remaining = section.visualizations.filter(
    (v) => !LAB_VIZ_IDS.has(v.id ?? v.vizId),
  );
  return { section: { ...section, visualizations: remaining }, labs };
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function MicroCycleLesson({ lesson }) {
  // Pull notebook vizzes out of math so they render after examples instead of mid-lesson
  const { section: mathWithoutLabs, labs: mathLabs } = extractLabVizzes(
    lesson.math,
  );
  const openmatFromMath = mathLabs.filter(
    (v) => (v.id ?? v.vizId) === "OpenMatNotebook",
  );
  const pythonFromMath = mathLabs.filter(
    (v) => (v.id ?? v.vizId) === "PythonNotebook",
  );

  return (
    <div className="w-full">
      <IntuitionBlock data={lesson.intuition} lesson={lesson} />
      {lesson.mentalModel?.length > 0 && (
        <div className="mb-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-4 border-b-brand-500 shadow-md dark:shadow-2xl overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 pt-5 pb-4 text-center">
            Final Mental Model Compression
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y divide-slate-200 dark:divide-slate-800 sm:divide-y-0 sm:divide-x border-t border-slate-200 dark:border-slate-800">
            {lesson.mentalModel.map((item, i) => (
              <div
                key={i}
                className={`px-5 py-4 ${i > 0 ? "sm:border-t-0" : ""}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 dark:text-brand-500 block mb-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <MarkdownProse
                  text={item}
                  className="[&_p]:text-sm [&_p]:font-semibold [&_p]:leading-snug [&_p]:text-slate-800 [&_p]:dark:text-slate-300 [&_p]:mb-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {lesson.applications && (
        <div className="mb-8">
          <SectionDivider
            icon="🧩"
            label="Applying the Theorem"
            color="emerald"
            noteId={lesson.id ? `${lesson.id}:applications` : undefined}
          />
          <SectionContent data={lesson.applications} />
          {getSectionVizzes(lesson.applications).map((viz, i) => (
            <VizCard
              key={`app-viz-${i}`}
              viz={viz}
              borderColor="border-emerald-200 dark:border-emerald-800"
            />
          ))}
        </div>
      )}
      <MathBlock data={mathWithoutLabs} lessonId={lesson.id} />
      <RigorBlock data={lesson.rigor} lessonId={lesson.id} />
      {lesson.walkthroughs?.length > 0 && (
        <div className="mb-2">
          <SectionDivider
            icon="🗺"
            label="Guided Walkthroughs"
            color="brand"
            noteId={lesson.id ? `${lesson.id}:walkthroughs` : undefined}
          />
          <GuidedWalkthrough walkthroughs={lesson.walkthroughs} />
        </div>
      )}
      <UnifiedLearningDock lesson={lesson} />
      {lesson.discovery &&
        (Array.isArray(lesson.discovery) ? (
          lesson.discovery.map((d, i) => (
            <FirstPrinciplesLesson
              key={`${lesson.id}-discovery-${i}`}
              discovery={d}
            />
          ))
        ) : (
          <FirstPrinciplesLesson
            key={`${lesson.id}-discovery`}
            discovery={lesson.discovery}
          />
        ))}
      {lesson.story &&
        (Array.isArray(lesson.story) ? (
          lesson.story.map((s, i) => (
            <NarrativeStory key={`${lesson.id}-story-${i}`} story={s} />
          ))
        ) : (
          <NarrativeStory key={`${lesson.id}-story`} story={lesson.story} />
        ))}
      <PracticeBlock
        examples={lesson.examples}
        challenges={lesson.challenges}
        triggers={lesson.triggers}
        lessonId={lesson.id}
      />
      {(() => {
        // OpenMAT / MATLAB lab — from top-level lesson.openmat field OR extracted from math.visualizations
        const openmatRaw = lesson.openmat ?? lesson.openmatLab;
        const cells = openmatRaw?.cells ?? openmatRaw?.initialCells;
        let visualizations = openmatRaw?.visualizations ?? [];
        if (visualizations.length === 0 && cells?.length > 0) {
          visualizations = [
            {
              id: "OpenMatNotebook",
              initialProps: { initialCells: cells },
              title: openmatRaw.title ?? "OpenMAT / MATLAB Lab",
            },
          ];
        }
        // Append any notebooks extracted from math.visualizations
        const allOpenmat = [...visualizations, ...openmatFromMath];
        if (!allOpenmat.length) return null;
        return (
          <div className="mb-8">
            <SectionDivider
              icon="⚙️"
              label={openmatRaw?.title ?? "OpenMAT / MATLAB Lab"}
              color="amber"
              noteId={lesson.id ? `${lesson.id}:openmat` : undefined}
            />
            {(openmatRaw?.description ?? openmatRaw?.intro) && (
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {openmatRaw.description ?? openmatRaw.intro}
              </p>
            )}
            {allOpenmat.map((v, i) => (
              <VizCard
                key={i}
                viz={v}
                noteId={
                  lesson.id ? `${lesson.id}:openmat:${v.id ?? i}` : undefined
                }
                borderColor="border-amber-200 dark:border-amber-900/60"
              />
            ))}
          </div>
        );
      })()}
      {(() => {
        // Python lab — from top-level lesson.python field OR extracted from math.visualizations
        const pythonRaw = lesson.python ?? lesson.pythonLab;
        const cells = pythonRaw?.cells ?? pythonRaw?.initialCells;
        let visualizations = pythonRaw?.visualizations ?? [];
        if (visualizations.length === 0 && cells?.length > 0) {
          visualizations = [
            {
              id: "PythonNotebook",
              props: { initialCells: cells },
              title: pythonRaw.title ?? "Python Lab",
            },
          ];
        }
        // Append any notebooks extracted from math.visualizations
        const allPython = [...visualizations, ...pythonFromMath];
        if (!allPython.length) return null;
        return (
          <div className="mb-8">
            <SectionDivider
              icon="🐍"
              label={pythonRaw?.title ?? "Python Lab"}
              color="brand"
              noteId={lesson.id ? `${lesson.id}:python` : undefined}
            />
            {(pythonRaw?.description ?? pythonRaw?.intro) && (
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {pythonRaw.description ?? pythonRaw.intro}
              </p>
            )}
            {allPython.map((v, i) => (
              <VizCard
                key={i}
                viz={v}
                noteId={
                  lesson.id ? `${lesson.id}:python:${v.id ?? i}` : undefined
                }
                borderColor="border-brand-200 dark:border-brand-900/60"
              />
            ))}
          </div>
        );
      })()}
      <SpiralBlock spiral={lesson.spiral} />
      {lesson.assessment?.questions?.length > 0 && (
        <AssessmentBlock assessment={lesson.assessment} />
      )}
      {lesson.supplementalVisualizations?.length > 0 && (
        <div className="mt-12 space-y-8">
          <SectionDivider icon="🚀" label="Guided Walkthroughs" color="brand" />
          {lesson.supplementalVisualizations.map((v, i) => (
            <VizCard
              key={i}
              viz={v}
              noteId={`${lesson.id}:viz:supp-${v.id ?? i}`}
              borderColor="border-brand-200 dark:border-brand-900/60"
            />
          ))}
        </div>
      )}
    </div>
  );
}
