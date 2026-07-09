import { useCallback, useEffect, useReducer, useRef } from "react";
import { useGlobalTheme } from "../../context/ThemeContext.jsx";
import { useThemeColors } from "../../hooks/useThemeColors";
import { EXTERNAL_WRITE_EVENT } from "../../hooks/useLocalStorage.js";
import { STUDIO_THEMES } from "../../utils/studioThemes";
import { backendLabReducer, createInitialState, BACKEND_LAB_STORAGE_KEY } from "./backendLabReducer";
import { runRequest } from "./runRequest";
import type { HttpRequest } from "./types";
import LessonPanel from "./LessonPanel";
import IdePanel from "./IdePanel";
import PostmanPanel from "./PostmanPanel";
import { LESSONS } from "./lessons/index";

interface BackendLabProps {
  onBack?: () => void;
}

// Same drag-to-resize technique already proven in ts-lab/TsLab.jsx — an
// invisible full-screen overlay captures mouse movement for the duration of
// the drag (so fast mouse movement never "escapes" the thin 4px handle),
// removed on mouseup.
function useColumnResize(setter: (width: number) => void) {
  return useCallback(
    (getStart: () => number, min: number, max: number, dir: 1 | -1 = 1) =>
      (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startW = getStart();
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;cursor:col-resize;z-index:9999";
        document.body.appendChild(overlay);
        const onMove = (ev: MouseEvent) => setter(Math.max(min, Math.min(max, startW + dir * (ev.clientX - startX))));
        const onUp = () => {
          document.body.removeChild(overlay);
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
    [setter]
  );
}

export default function BackendLab({ onBack }: BackendLabProps) {
  // themeStyles.ui / themeStyles.monaco are the REAL studio-theme-reactive
  // system (Vue/Dracula/GitHub/...), sourced from STUDIO_THEMES — the same
  // pairing MarkdownHub.jsx uses. useThemeColors() is a *separate*, light/
  // dark-only palette kept here only for the response-status colors
  // (green/amber/red), which are deliberately theme-invariant by that
  // hook's own design intent.
  const { studioTheme, themeStyles } = useGlobalTheme();
  const ui = themeStyles.ui;
  const monacoTheme = themeStyles.monaco;
  const accentHex = (STUDIO_THEMES[studioTheme] ?? STUDIO_THEMES.default).accentHex;
  const status = useThemeColors();

  const [state, dispatch] = useReducer(backendLabReducer, undefined, createInitialState);
  const lessonWidthRef = useRef(state.lessonWidth);
  const postmanWidthRef = useRef(state.postmanWidth);
  lessonWidthRef.current = state.lessonWidth;
  postmanWidthRef.current = state.postmanWidth;

  // Persist a student's code and saved requests — the only part of this
  // lab's state worth surviving a refresh — every time either changes.
  // AuthContext.jsx's SYNC_KEYS list (oc-backend-lab) then carries this to
  // Firestore for any signed-in user, the same mechanism every other synced
  // feature in this app already uses; nothing Backend Lab-specific needed
  // on the sync side, only on getting the right key into the right shape.
  // Writes directly via localStorage.setItem, NOT writeLocalStorageKey —
  // that helper also dispatches the external-write event below, which
  // would make this component re-load its own just-written data on every
  // change (new array references every time, since LOAD_PERSISTED_DATA
  // always parses fresh objects), thrashing forever.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        BACKEND_LAB_STORAGE_KEY,
        JSON.stringify({ files: state.files, savedRequests: state.savedRequests, activeLessonId: state.activeLessonId })
      );
    } catch {
      // localStorage unavailable/full — the student's session still works, just unsaved
    }
  }, [state.files, state.savedRequests, state.activeLessonId]);

  // Picks up a Firestore-merged value written to localStorage after this
  // component already mounted (sign-in resolving async, or another tab's
  // edit) — the same external-write case useLocalStorage.js handles
  // internally for plain useState-based state, adapted here for a reducer.
  useEffect(() => {
    const onExternalWrite = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (detail?.key !== BACKEND_LAB_STORAGE_KEY) return;
      try {
        const raw = window.localStorage.getItem(BACKEND_LAB_STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (Array.isArray(data?.files) && data.files.length > 0) {
          dispatch({ type: "LOAD_PERSISTED_DATA", data });
        }
      } catch {
        // ignore malformed data — keep whatever's already in state
      }
    };
    window.addEventListener(EXTERNAL_WRITE_EVENT, onExternalWrite);
    return () => window.removeEventListener(EXTERNAL_WRITE_EVENT, onExternalWrite);
  }, []);

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
  // runRequest() is called here, in the event handler, not inside the
  // reducer — it has a real side effect once persistence (lesson 9) is
  // involved (writing to a "database" that lives outside the interpreter
  // entirely). React 18 StrictMode intentionally double-invokes reducers
  // in development specifically to catch impure reducers; calling a
  // side-effecting function from inside one would silently double-insert
  // every write. The reducer only ever stores an already-computed result.
  const handleSend = useCallback(async () => {
    const outcome = await runRequest(state.files, state.request);
    dispatch({ type: "SET_OUTCOME", outcome });
  }, [state.files, state.request]);
  const handleTabChange = useCallback(
    (tab: "response" | "logs" | "saved" | "sql") => dispatch({ type: "SET_POSTMAN_TAB", tab }),
    []
  );
  const handleToggleLesson = useCallback(() => dispatch({ type: "TOGGLE_LESSON_COLLAPSED" }), []);

  const activeLessonIndex = LESSONS.findIndex((l) => l.id === state.activeLessonId);
  const activeLesson = LESSONS[activeLessonIndex] ?? LESSONS[0];
  const handlePrevLesson = useCallback(() => {
    const prev = LESSONS[activeLessonIndex - 1];
    if (prev) dispatch({ type: "SET_LESSON", id: prev.id });
  }, [activeLessonIndex]);
  const handleNextLesson = useCallback(() => {
    const next = LESSONS[activeLessonIndex + 1];
    if (next) dispatch({ type: "SET_LESSON", id: next.id });
  }, [activeLessonIndex]);

  const handleSaveRequest = useCallback(() => {
    if (state.editingSavedRequestId) {
      dispatch({ type: "SAVE_REQUEST" });
      return;
    }
    const name = window.prompt("Save request as", `${state.request.method} ${state.request.path}`);
    if (name) dispatch({ type: "SAVE_REQUEST", name });
  }, [state.editingSavedRequestId, state.request.method, state.request.path]);
  const handleLoadSavedRequest = useCallback((id: string) => dispatch({ type: "LOAD_SAVED_REQUEST", id }), []);
  const handleDeleteSavedRequest = useCallback((id: string) => dispatch({ type: "DELETE_SAVED_REQUEST", id }), []);
  const handleNewRequest = useCallback(() => dispatch({ type: "NEW_REQUEST" }), []);

  const handleAddHeaderRow = useCallback(() => dispatch({ type: "ADD_HEADER_ROW" }), []);
  const handleSetHeaderRow = useCallback(
    (index: number, field: "key" | "value", value: string) =>
      dispatch({ type: "SET_HEADER_ROW", index, field, value }),
    []
  );
  const handleRemoveHeaderRow = useCallback((index: number) => dispatch({ type: "REMOVE_HEADER_ROW", index }), []);

  const setLessonWidth = useCallback((width: number) => dispatch({ type: "SET_LESSON_WIDTH", width }), []);
  const setPostmanWidth = useCallback((width: number) => dispatch({ type: "SET_POSTMAN_WIDTH", width }), []);
  const startLessonResize = useColumnResize(setLessonWidth);
  const startPostmanResize = useColumnResize(setPostmanWidth);

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
        {!state.lessonCollapsed && (
          <div style={{ width: state.lessonWidth }} className="shrink-0">
            <LessonPanel
              key={activeLesson.id}
              title={activeLesson.title}
              content={activeLesson.content}
              checklist={activeLesson.checklist}
              collapsed={false}
              onToggleCollapsed={handleToggleLesson}
              ui={ui}
              accentHex={accentHex}
              onPrevLesson={handlePrevLesson}
              onNextLesson={handleNextLesson}
              hasPrevLesson={activeLessonIndex > 0}
              hasNextLesson={activeLessonIndex < LESSONS.length - 1}
            />
          </div>
        )}
        {state.lessonCollapsed && (
          <LessonPanel
            key={activeLesson.id}
            title={activeLesson.title}
            content={activeLesson.content}
            checklist={activeLesson.checklist}
            collapsed
            onToggleCollapsed={handleToggleLesson}
            ui={ui}
            accentHex={accentHex}
          />
        )}
        {!state.lessonCollapsed && (
          <div
            onMouseDown={startLessonResize(() => lessonWidthRef.current, 260, 640)}
            className={`w-1 shrink-0 cursor-col-resize border-l ${ui.border} hover:border-l-2 transition-all`}
            style={{ borderLeftColor: accentHex, opacity: 0.35 }}
          />
        )}

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

        <div
          onMouseDown={startPostmanResize(() => postmanWidthRef.current, 320, 720, -1)}
          className={`w-1 shrink-0 cursor-col-resize border-l ${ui.border} hover:border-l-2 transition-all`}
          style={{ borderLeftColor: accentHex, opacity: 0.35 }}
        />
        <div style={{ width: state.postmanWidth }} className="shrink-0">
          <PostmanPanel
            request={state.request}
            headerRows={state.headerRows}
            outcome={state.lastOutcome}
            activeTab={state.postmanTab}
            onFieldChange={handleFieldChange}
            onAddHeaderRow={handleAddHeaderRow}
            onSetHeaderRow={handleSetHeaderRow}
            onRemoveHeaderRow={handleRemoveHeaderRow}
            onSend={handleSend}
            onTabChange={handleTabChange}
            ui={ui}
            accentHex={accentHex}
            status={status}
            savedRequests={state.savedRequests}
            editingSavedRequestId={state.editingSavedRequestId}
            onSaveRequest={handleSaveRequest}
            onLoadSavedRequest={handleLoadSavedRequest}
            onDeleteSavedRequest={handleDeleteSavedRequest}
            onNewRequest={handleNewRequest}
          />
        </div>
      </div>
    </div>
  );
}
