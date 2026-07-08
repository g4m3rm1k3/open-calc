import { useCallback, useReducer } from "react";
import { useGlobalTheme } from "../../context/ThemeContext.jsx";
import { useThemeColors } from "../../hooks/useThemeColors";
import { STUDIO_THEMES } from "../../utils/studioThemes";
import { backendLabReducer, createInitialState } from "./backendLabReducer";
import type { HttpRequest } from "./types";
import LessonPanel from "./LessonPanel";
import IdePanel from "./IdePanel";
import PostmanPanel from "./PostmanPanel";
// eslint-disable-next-line import/no-unresolved
import lesson01 from "./lessons/01-your-first-endpoint.md?raw";

interface BackendLabProps {
  onBack?: () => void;
}

const LESSON_1_CHECKLIST = [
  "You've seen the honest \"handleRequest is not defined\" error before writing any code",
  "handleRequest returns a real { status: 200, body: ... } response for /users",
  "A path other than /users correctly returns a 404",
  "You can explain what a function parameter is and what return does, in your own words",
  "You can explain why one long if/else chain won't scale to a real backend with many routes",
];

export default function BackendLab({ onBack }: BackendLabProps) {
  // themeStyles.ui / themeStyles.monaco are the REAL studio-theme-reactive
  // system (Vue/Dracula/GitHub/...), sourced from STUDIO_THEMES — the same
  // pairing MarkdownHub.jsx uses. useThemeColors() is a *separate*, light/
  // dark-only palette (its "bg"/"border"/"blue" fields read from CSS
  // variables defined once, statically, in src/styles/index.css — they do
  // NOT change per studio theme, confirmed by reading that file directly).
  // It's kept here only for the response-status colors (green/amber/red),
  // which are deliberately theme-invariant by that hook's own design intent.
  const { studioTheme, themeStyles } = useGlobalTheme();
  const ui = themeStyles.ui;
  const monacoTheme = themeStyles.monaco;
  const accentHex = (STUDIO_THEMES[studioTheme] ?? STUDIO_THEMES.default).accentHex;
  const status = useThemeColors();

  const [state, dispatch] = useReducer(backendLabReducer, undefined, createInitialState);

  const handleSelectFile = useCallback((id: string) => dispatch({ type: "SET_ACTIVE_FILE", id }), []);
  const handleAddFile = useCallback(() => {
    const name = window.prompt("File name", "routes.js");
    if (name) dispatch({ type: "ADD_FILE", name });
  }, []);
  const handleChangeCode = useCallback(
    (id: string, code: string) => dispatch({ type: "SET_FILE_CODE", id, code }),
    []
  );
  const handleFieldChange = useCallback(
    (field: keyof HttpRequest, value: string) => dispatch({ type: "SET_REQUEST_FIELD", field, value }),
    []
  );
  const handleSend = useCallback(() => dispatch({ type: "SEND_REQUEST" }), []);
  const handleTabChange = useCallback(
    (tab: "response" | "logs") => dispatch({ type: "SET_POSTMAN_TAB", tab }),
    []
  );
  const handleToggleLesson = useCallback(() => dispatch({ type: "TOGGLE_LESSON_COLLAPSED" }), []);

  return (
    <div className={`w-full h-screen overflow-hidden flex flex-col ${ui.bg0} ${ui.txt1}`}>
      <div className={`flex items-center gap-2.5 px-3.5 py-2 border-b ${ui.border} shrink-0`}>
        {onBack && (
          <button onClick={onBack} className={`text-[13px] ${ui.txt2} ${ui.hoverTx} transition-colors`}>
            ← Back
          </button>
        )}
        <strong className={`text-sm ${ui.txt1}`}>Backend Lab</strong>
      </div>

      <div className="flex-1 flex min-h-0">
        <LessonPanel
          title="Lesson 1 — Your First Endpoint"
          content={lesson01}
          checklist={LESSON_1_CHECKLIST}
          collapsed={state.lessonCollapsed}
          onToggleCollapsed={handleToggleLesson}
          ui={ui}
          accentHex={accentHex}
        />
        <div className={`flex-1 min-w-0 border-r ${ui.border}`}>
          <IdePanel
            files={state.files}
            activeFileId={state.activeFileId}
            onSelectFile={handleSelectFile}
            onAddFile={handleAddFile}
            onChangeCode={handleChangeCode}
            ui={ui}
            accentHex={accentHex}
            monacoTheme={monacoTheme}
          />
        </div>
        <div className="w-[420px] shrink-0">
          <PostmanPanel
            request={state.request}
            outcome={state.lastOutcome}
            activeTab={state.postmanTab}
            onFieldChange={handleFieldChange}
            onSend={handleSend}
            onTabChange={handleTabChange}
            ui={ui}
            accentHex={accentHex}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}
