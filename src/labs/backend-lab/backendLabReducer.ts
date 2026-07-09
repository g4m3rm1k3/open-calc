import type { BackendFile, HttpRequest, SavedRequest } from "./types";
import type { RunOutcome } from "./runRequest";
import { LESSONS } from "./lessons/index";

export interface HeaderRow {
  key: string;
  value: string;
}

export interface BackendLabState {
  files: BackendFile[];
  activeFileId: string;
  request: HttpRequest;
  headerRows: HeaderRow[];
  lastOutcome: RunOutcome | null;
  postmanTab: "response" | "logs" | "saved" | "sql";
  lessonCollapsed: boolean;
  activeLessonId: string;
  savedRequests: SavedRequest[];
  editingSavedRequestId: string | null;
  lessonWidth: number;
  postmanWidth: number;
}

export type BackendLabAction =
  | { type: "SET_FILE_CODE"; id: string; code: string }
  | { type: "ADD_FILE"; name: string }
  | { type: "SET_ACTIVE_FILE"; id: string }
  | { type: "SET_REQUEST_FIELD"; field: keyof HttpRequest; value: string }
  | { type: "ADD_HEADER_ROW" }
  | { type: "SET_HEADER_ROW"; index: number; field: "key" | "value"; value: string }
  | { type: "REMOVE_HEADER_ROW"; index: number }
  | { type: "SET_OUTCOME"; outcome: RunOutcome }
  | { type: "SET_POSTMAN_TAB"; tab: "response" | "logs" | "saved" | "sql" }
  | { type: "TOGGLE_LESSON_COLLAPSED" }
  | { type: "SET_LESSON"; id: string }
  | { type: "SAVE_REQUEST"; name?: string }
  | { type: "LOAD_SAVED_REQUEST"; id: string }
  | { type: "DELETE_SAVED_REQUEST"; id: string }
  | { type: "NEW_REQUEST" }
  | { type: "SET_LESSON_WIDTH"; width: number }
  | { type: "SET_POSTMAN_WIDTH"; width: number }
  | { type: "LOAD_PERSISTED_DATA"; data: PersistedBackendLabData };

const DEFAULT_REQUEST: HttpRequest = { method: "GET", path: "/users", headers: {}, body: "" };

// The only part of Backend Lab's state worth surviving a refresh or
// following a signed-in user to another device — a student's own code and
// saved API requests. Everything else (which panel tab is open, panel
// widths, the in-progress request draft, the last response) is session UI
// state, not real work, and stays in-memory only, the same "keep the sync
// list small" discipline AuthContext.jsx's own SYNC_KEYS already documents.
export const BACKEND_LAB_STORAGE_KEY = "oc-backend-lab";

export interface PersistedBackendLabData {
  files: BackendFile[];
  savedRequests: SavedRequest[];
  activeLessonId: string;
}

function readPersistedData(): PersistedBackendLabData | null {
  try {
    const raw = window.localStorage.getItem(BACKEND_LAB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.files) || parsed.files.length === 0) return null;
    return parsed as PersistedBackendLabData;
  } catch {
    return null;
  }
}

// Header rows are edited as a list (so two blank/duplicate keys mid-edit
// don't collide), then collapsed into the plain Record<string,string>
// HttpRequest.headers actually carries — the same "editable draft shape
// vs. the shape sent to the interpreter" split saved requests already use.
function rowsToHeaders(rows: HeaderRow[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (key) headers[key] = row.value;
  }
  return headers;
}

function headersToRows(headers: Record<string, string>): HeaderRow[] {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

export function createInitialState(): BackendLabState {
  const persisted = readPersistedData();
  if (persisted) {
    return {
      files: persisted.files,
      activeFileId: persisted.files[0].id,
      request: { ...DEFAULT_REQUEST },
      headerRows: [],
      lastOutcome: null,
      postmanTab: "response",
      lessonCollapsed: false,
      activeLessonId: LESSONS.some((l) => l.id === persisted.activeLessonId) ? persisted.activeLessonId : LESSONS[0].id,
      savedRequests: persisted.savedRequests,
      editingSavedRequestId: null,
      lessonWidth: 380,
      postmanWidth: 420,
    };
  }
  const fileId = "file-1";
  return {
    files: [{ id: fileId, name: "server.js", code: "" }],
    activeFileId: fileId,
    request: { ...DEFAULT_REQUEST },
    headerRows: [],
    lastOutcome: null,
    postmanTab: "response",
    lessonCollapsed: false,
    activeLessonId: LESSONS[0].id,
    savedRequests: [],
    editingSavedRequestId: null,
    lessonWidth: 380,
    postmanWidth: 420,
  };
}

export function backendLabReducer(
  state: BackendLabState,
  action: BackendLabAction
): BackendLabState {
  switch (action.type) {
    case "SET_FILE_CODE":
      return {
        ...state,
        files: state.files.map((f) => (f.id === action.id ? { ...f, code: action.code } : f)),
      };

    case "ADD_FILE": {
      const id = `file-${Date.now()}`;
      return {
        ...state,
        files: [...state.files, { id, name: action.name, code: "" }],
        activeFileId: id,
      };
    }

    case "SET_ACTIVE_FILE":
      return { ...state, activeFileId: action.id };

    case "SET_REQUEST_FIELD":
      return { ...state, request: { ...state.request, [action.field]: action.value } };

    case "ADD_HEADER_ROW": {
      const headerRows = [...state.headerRows, { key: "", value: "" }];
      return { ...state, headerRows };
    }

    case "SET_HEADER_ROW": {
      const headerRows = state.headerRows.map((row, i) =>
        i === action.index ? { ...row, [action.field]: action.value } : row
      );
      return {
        ...state,
        headerRows,
        request: { ...state.request, headers: rowsToHeaders(headerRows) },
      };
    }

    case "REMOVE_HEADER_ROW": {
      const headerRows = state.headerRows.filter((_, i) => i !== action.index);
      return {
        ...state,
        headerRows,
        request: { ...state.request, headers: rowsToHeaders(headerRows) },
      };
    }

    // The actual runRequest() call happens in the event handler (BackendLab.tsx),
    // not here — runRequest has a real side effect once persistence (lesson 9)
    // is involved (mutating a module-level "database" outside the interpreter),
    // and React 18 StrictMode double-invokes reducers in development to catch
    // exactly this class of bug: an impure reducer silently double-mutating
    // external state. The reducer only ever stores an already-computed result.
    case "SET_OUTCOME":
      return {
        ...state,
        lastOutcome: action.outcome,
        postmanTab: "response",
      };

    case "SET_POSTMAN_TAB":
      return { ...state, postmanTab: action.tab };

    case "TOGGLE_LESSON_COLLAPSED":
      return { ...state, lessonCollapsed: !state.lessonCollapsed };

    case "SET_LESSON":
      return { ...state, activeLessonId: action.id };

    case "SAVE_REQUEST": {
      if (state.editingSavedRequestId) {
        // Update the existing saved request in place — same "editingId"
        // pattern the calculator series' Formula Editor (lesson 22) used
        // for its own save-or-update branch.
        return {
          ...state,
          savedRequests: state.savedRequests.map((r) =>
            r.id === state.editingSavedRequestId ? { ...r, request: { ...state.request } } : r
          ),
        };
      }
      const name = action.name?.trim();
      if (!name) return state;
      const id = `req-${Date.now()}`;
      return {
        ...state,
        savedRequests: [...state.savedRequests, { id, name, request: { ...state.request } }],
        editingSavedRequestId: id,
      };
    }

    case "LOAD_SAVED_REQUEST": {
      const saved = state.savedRequests.find((r) => r.id === action.id);
      if (!saved) return state;
      return {
        ...state,
        request: { ...saved.request },
        headerRows: headersToRows(saved.request.headers),
        editingSavedRequestId: saved.id,
        postmanTab: "response",
        lastOutcome: null,
      };
    }

    case "DELETE_SAVED_REQUEST":
      return {
        ...state,
        savedRequests: state.savedRequests.filter((r) => r.id !== action.id),
        editingSavedRequestId: state.editingSavedRequestId === action.id ? null : state.editingSavedRequestId,
      };

    case "NEW_REQUEST":
      return {
        ...state,
        request: { ...DEFAULT_REQUEST },
        headerRows: [],
        editingSavedRequestId: null,
        lastOutcome: null,
      };

    case "SET_LESSON_WIDTH":
      return { ...state, lessonWidth: action.width };

    case "SET_POSTMAN_WIDTH":
      return { ...state, postmanWidth: action.width };

    // Fires when AuthContext.jsx's Firestore sync writes a freshly-merged
    // oc-backend-lab value to localStorage after this component already
    // mounted (e.g. sign-in completing async, or another tab's edit
    // arriving) — the same "external write" case useLocalStorage.js
    // handles for plain useState-based state, adapted here for a reducer.
    case "LOAD_PERSISTED_DATA": {
      if (action.data.files.length === 0) return state;
      return {
        ...state,
        files: action.data.files,
        activeFileId: action.data.files.some((f) => f.id === state.activeFileId)
          ? state.activeFileId
          : action.data.files[0].id,
        savedRequests: action.data.savedRequests,
      };
    }

    default:
      return state;
  }
}
