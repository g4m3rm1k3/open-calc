import type { BackendFile, HttpRequest } from "./types";
import { runRequest, type RunOutcome } from "./runRequest";

export interface BackendLabState {
  files: BackendFile[];
  activeFileId: string;
  request: HttpRequest;
  lastOutcome: RunOutcome | null;
  postmanTab: "response" | "logs";
  lessonCollapsed: boolean;
}

export type BackendLabAction =
  | { type: "SET_FILE_CODE"; id: string; code: string }
  | { type: "ADD_FILE"; name: string }
  | { type: "SET_ACTIVE_FILE"; id: string }
  | { type: "SET_REQUEST_FIELD"; field: keyof HttpRequest; value: string }
  | { type: "SEND_REQUEST" }
  | { type: "SET_POSTMAN_TAB"; tab: "response" | "logs" }
  | { type: "TOGGLE_LESSON_COLLAPSED" };

export function createInitialState(): BackendLabState {
  const fileId = "file-1";
  return {
    files: [{ id: fileId, name: "server.js", code: "" }],
    activeFileId: fileId,
    request: { method: "GET", path: "/users", headers: {}, body: "" },
    lastOutcome: null,
    postmanTab: "response",
    lessonCollapsed: false,
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

    case "SEND_REQUEST":
      return {
        ...state,
        lastOutcome: runRequest(state.files, state.request),
        postmanTab: "response",
      };

    case "SET_POSTMAN_TAB":
      return { ...state, postmanTab: action.tab };

    case "TOGGLE_LESSON_COLLAPSED":
      return { ...state, lessonCollapsed: !state.lessonCollapsed };

    default:
      return state;
  }
}
