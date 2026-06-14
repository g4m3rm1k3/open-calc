import { Suspense } from "react";
import VizFrame from "../viz/VizFrame.jsx";
import Callout from "../ui/Callout.jsx";
import MarkdownProse from "../math/MarkdownProse.jsx";

// ── Code block → notebook viz id map ─────────────────────────────────────────
const CODE_VIZ = {
  python:     "PythonNotebook",
  javascript: "JSNotebook",
  js:         "JSNotebook",
  matlab:     "OpenMatNotebook",
  openmat:    "OpenMatNotebook",
  sql:        "SQLNotebook",
  threejs:    "SimNotebook",
  sim:        "SimNotebook",
};

// ── Individual block renderers ────────────────────────────────────────────────

function ProseBlock({ block }) {
  const text = block.text ?? "";
  // Split on blank lines to allow multi-paragraph blocks
  const paragraphs = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <MarkdownProse key={i} text={p} />
      ))}
    </div>
  );
}

function CalloutBlock({ block }) {
  return (
    <Callout
      type={block.variant ?? block.type_variant ?? "insight"}
      title={block.title}
      body={block.body}
    />
  );
}

function VizBlock({ block }) {
  return (
    <div className="my-6">
      {block.title && (
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
          {block.title}
        </p>
      )}
      <Suspense fallback={<div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
        <VizFrame
          id={block.id}
          initialProps={block.props ?? {}}
          title={null}
        />
      </Suspense>
      {block.caption && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
          {block.caption}
        </p>
      )}
    </div>
  );
}

function CodeBlock({ block }) {
  const vizId = CODE_VIZ[block.language] ?? "JSNotebook";
  return (
    <div className="my-4">
      <Suspense fallback={<div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
        <VizFrame
          id={vizId}
          initialProps={{ cells: block.cells ?? [], language: block.language }}
          title={null}
        />
      </Suspense>
    </div>
  );
}

function ExampleBlock({ block }) {
  return (
    <div className="my-4 border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
      {block.title && (
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {block.title}
        </h4>
      )}
      <MarkdownProse text={block.body ?? ""} />
    </div>
  );
}

function ImageBlock({ block }) {
  return (
    <figure className="my-4">
      <img
        src={block.src}
        alt={block.alt ?? ""}
        className="rounded-xl max-w-full"
      />
      {block.caption && (
        <figcaption className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Block({ block, index }) {
  switch (block.type) {
    case "prose":   return <ProseBlock block={block} />;
    case "callout": return <CalloutBlock block={block} />;
    case "viz":     return <VizBlock block={block} />;
    case "code":    return <CodeBlock block={block} />;
    case "example": return <ExampleBlock block={block} />;
    case "image":   return <ImageBlock block={block} />;
    default:
      return (
        <div className="text-xs text-amber-500 font-mono p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
          Unknown block type: {block.type}
        </div>
      );
  }
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ section, index }) {
  const blocks = section.blocks ?? [];
  return (
    <div className="space-y-5">
      {section.heading && (
        <h3 className="text-xl font-bold text-slate-900 dark:text-sky-400 mt-8 mb-4 flex items-center gap-3">
          <span className="w-2 h-6 bg-brand-500 dark:bg-brand-400 rounded-full inline-block" />
          {section.heading}
        </h3>
      )}
      {blocks.map((block, i) => (
        <Block key={i} block={block} index={i} />
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Renders a lesson's `sections` array in order.
 * Compatible with both new-format lessons (sections[].blocks[]) and
 * future migration states.
 *
 * Props:
 *   sections  – array of { heading?, blocks[] }
 *   className – optional extra class
 */
export default function SectionRenderer({ sections = [], className = "" }) {
  if (!sections.length) return null;
  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section, i) => (
        <Section key={i} section={section} index={i} />
      ))}
    </div>
  );
}
