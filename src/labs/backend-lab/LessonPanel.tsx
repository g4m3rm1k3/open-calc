import { createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  PROSE_REMARK_PLUGINS,
  PROSE_REHYPE_PLUGINS,
  proseComponents,
  InlineCode,
} from "../../components/markdown/proseComponents.jsx";
import StaticCodeBlock from "../../components/markdown/StaticCodeBlock.jsx";
import type { UiTheme } from "./types";

interface LessonPanelProps {
  title: string;
  content: string;
  checklist: string[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  ui: UiTheme;
  accentHex: string;
}

// Same inline-vs-block distinction BlogPost.jsx uses: react-markdown v9+
// dropped the `inline` prop from its `code` component, so a context flag
// set by the `pre` handler is the only way left to tell them apart.
const InPreContext = createContext(false);

function CodeRenderer({ className, children }: any) {
  const isBlock = useContext(InPreContext);
  const lang = (className || "").replace("language-", "");
  const codeStr = String(children).replace(/\n$/, "");
  if (!isBlock) return <InlineCode>{codeStr}</InlineCode>;
  return <StaticCodeBlock language={lang} code={codeStr} />;
}

function PreRenderer({ children }: any) {
  return <InPreContext.Provider value={true}>{children}</InPreContext.Provider>;
}

export default function LessonPanel({
  title,
  content,
  checklist,
  collapsed,
  onToggleCollapsed,
  ui,
  accentHex,
}: LessonPanelProps) {
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false));

  if (collapsed) {
    return (
      <div className={`w-9 shrink-0 border-r ${ui.border} ${ui.bg1} flex justify-center pt-2.5`}>
        <button onClick={onToggleCollapsed} title="Show lesson" className={`bg-transparent border-none cursor-pointer text-base ${ui.txt2}`}>
          »
        </button>
      </div>
    );
  }

  return (
    <div className={`w-[380px] shrink-0 border-r ${ui.border} ${ui.bg1} flex flex-col overflow-hidden`}>
      <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${ui.border} shrink-0`}>
        <strong className={`text-[13px] ${ui.txt1}`}>{title}</strong>
        <button onClick={onToggleCollapsed} title="Collapse" className={`bg-transparent border-none cursor-pointer text-sm ${ui.txt2}`}>
          «
        </button>
      </div>
      <div className="prose-blog flex-1 overflow-auto px-4">
        <ReactMarkdown
          remarkPlugins={PROSE_REMARK_PLUGINS}
          rehypePlugins={PROSE_REHYPE_PLUGINS}
          components={{ ...proseComponents, code: CodeRenderer, pre: PreRenderer }}
        >
          {content}
        </ReactMarkdown>

        <div className="my-4">
          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${ui.txt2}`}>Definition of Done</div>
          {checklist.map((item, i) => (
            <label key={i} className={`flex gap-2 items-start mb-2 text-[13px] cursor-pointer ${ui.txt1}`}>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))}
                className="mt-0.5"
                style={{ accentColor: accentHex }}
              />
              <span className={checked[i] ? `line-through ${ui.txt2}` : ui.txt1}>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
