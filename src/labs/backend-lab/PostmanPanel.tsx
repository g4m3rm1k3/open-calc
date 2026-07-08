import type { HttpRequest, SavedRequest, StatusColors, UiTheme } from "./types";
import type { RunOutcome } from "./runRequest";
import type { HeaderRow } from "./backendLabReducer";
import SqlPanel from "./SqlPanel";

interface PostmanPanelProps {
  request: HttpRequest;
  headerRows: HeaderRow[];
  outcome: RunOutcome | null;
  activeTab: "response" | "logs" | "saved" | "sql";
  onFieldChange: (field: keyof HttpRequest, value: string) => void;
  onAddHeaderRow: () => void;
  onSetHeaderRow: (index: number, field: "key" | "value", value: string) => void;
  onRemoveHeaderRow: (index: number) => void;
  onSend: () => void;
  onTabChange: (tab: "response" | "logs" | "saved" | "sql") => void;
  ui: UiTheme;
  accentHex: string;
  status: StatusColors;
  savedRequests: SavedRequest[];
  editingSavedRequestId: string | null;
  onSaveRequest: () => void;
  onLoadSavedRequest: (id: string) => void;
  onDeleteSavedRequest: (id: string) => void;
  onNewRequest: () => void;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function PostmanPanel({
  request,
  headerRows,
  outcome,
  activeTab,
  onFieldChange,
  onAddHeaderRow,
  onSetHeaderRow,
  onRemoveHeaderRow,
  onSend,
  onTabChange,
  ui,
  accentHex,
  status,
  savedRequests,
  editingSavedRequestId,
  onSaveRequest,
  onLoadSavedRequest,
  onDeleteSavedRequest,
  onNewRequest,
}: PostmanPanelProps) {
  const statusColor = (code: number) => (code < 300 ? status.green : code < 500 ? status.amber : status.red);
  const statusBg = (code: number) => (code < 300 ? status.greenBg : code < 500 ? status.amberBg : status.redBg);
  const editingName = savedRequests.find((r) => r.id === editingSavedRequestId)?.name ?? null;

  return (
    <div className={`flex flex-col h-full min-w-0 ${ui.bg0} ${ui.txt1}`}>
      <div className={`flex items-center justify-between px-2.5 pt-2 ${ui.bg1}`}>
        <span className={`text-[11px] ${ui.txt2}`}>
          {editingName ? (
            <>
              Editing <strong className={ui.txt1}>{editingName}</strong>
            </>
          ) : (
            "Unsaved request"
          )}
        </span>
        {editingName && (
          <button onClick={onNewRequest} className={`text-[11px] ${ui.txt2} ${ui.hoverTx}`}>
            + New request
          </button>
        )}
      </div>

      <div className={`flex gap-2 p-2.5 border-b ${ui.border} ${ui.bg1}`}>
        <select
          value={request.method}
          onChange={(e) => onFieldChange("method", e.target.value)}
          className={`px-2 py-1.5 rounded-md border ${ui.border} ${ui.bg0} ${ui.txt1} font-mono text-[13px]`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={request.path}
          onChange={(e) => onFieldChange("path", e.target.value)}
          placeholder="/users"
          className={`flex-1 px-2.5 py-1.5 rounded-md border ${ui.border} ${ui.bg0} ${ui.txt1} font-mono text-[13px]`}
        />
        <button
          onClick={onSaveRequest}
          className={`px-3 py-1.5 rounded-md border ${ui.btnBorder} ${ui.txt1} font-semibold text-[13px] ${ui.hoverBg}`}
          title={editingSavedRequestId ? "Update saved request" : "Save this request"}
        >
          Save
        </button>
        <button
          onClick={onSend}
          className="px-4 py-1.5 rounded-md text-white font-semibold text-[13px]"
          style={{ background: accentHex }}
        >
          Send
        </button>
      </div>

      <div className={`p-2.5 border-b ${ui.border}`}>
        <div className="flex items-center justify-between mb-1">
          <label className={`text-[11px] ${ui.txt2}`}>Headers (optional)</label>
          <button onClick={onAddHeaderRow} className={`text-[11px] ${ui.txt2} ${ui.hoverTx}`}>
            + Add Header
          </button>
        </div>
        {headerRows.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {headerRows.map((row, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  value={row.key}
                  onChange={(e) => onSetHeaderRow(i, "key", e.target.value)}
                  placeholder="Authorization"
                  className={`flex-1 min-w-0 px-2 py-1 rounded border ${ui.border} ${ui.bg0} ${ui.txt1} font-mono text-xs`}
                />
                <input
                  value={row.value}
                  onChange={(e) => onSetHeaderRow(i, "value", e.target.value)}
                  placeholder="secret123"
                  className={`flex-1 min-w-0 px-2 py-1 rounded border ${ui.border} ${ui.bg0} ${ui.txt1} font-mono text-xs`}
                />
                <button onClick={() => onRemoveHeaderRow(i)} className={`${ui.txt2} ${ui.hoverTx}`} title="Remove">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-2.5 border-b ${ui.border}`}>
        <label className={`text-[11px] block mb-1 ${ui.txt2}`}>Body (JSON, optional)</label>
        <textarea
          value={request.body}
          onChange={(e) => onFieldChange("body", e.target.value)}
          rows={3}
          placeholder='{ "name": "Mike" }'
          className={`w-full p-2 rounded-md border ${ui.border} ${ui.bg0} ${ui.txt1} font-mono text-xs resize-y box-border`}
        />
      </div>

      <div className={`flex border-b ${ui.border}`}>
        {(["response", "logs", "saved", "sql"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
              activeTab === tab ? ui.primary : `${ui.txt2} ${ui.hoverTx}`
            }`}
            style={{ borderBottomColor: activeTab === tab ? accentHex : "transparent" }}
          >
            {tab}
            {tab === "saved" && savedRequests.length > 0 ? ` (${savedRequests.length})` : ""}
          </button>
        ))}
      </div>

      {activeTab === "sql" ? (
        <SqlPanel ui={ui} accentHex={accentHex} />
      ) : (
      <div className="flex-1 overflow-auto p-3.5 font-mono text-[13px]">
        {activeTab === "saved" && (
          <>
            {savedRequests.length === 0 ? (
              <div className={ui.txt2}>
                No saved requests yet — click <strong className={ui.txt1}>Save</strong> above to keep one.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {savedRequests.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md border ${
                      r.id === editingSavedRequestId ? ui.primaryBg : ui.bg1
                    } ${ui.border}`}
                  >
                    <button onClick={() => onLoadSavedRequest(r.id)} className="text-left flex-1 min-w-0">
                      <div className={`font-semibold ${ui.txt1}`}>{r.name}</div>
                      <div className={`text-[11px] ${ui.txt2}`}>
                        {r.request.method} {r.request.path}
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteSavedRequest(r.id)}
                      className={`ml-2 ${ui.txt2} ${ui.hoverTx}`}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab !== "saved" && !outcome && <div className={ui.txt2}>Click Send to try your request.</div>}

        {outcome && activeTab === "response" && (
          <>
            {outcome.error ? (
              <div style={{ color: status.red }}>
                <div className="font-bold mb-1.5">{outcome.error.type ?? "Error"}</div>
                <div>{outcome.error.message}</div>
              </div>
            ) : outcome.response ? (
              <>
                <div className="mb-2.5">
                  <span
                    className="px-2 py-0.5 rounded font-bold"
                    style={{
                      background: statusBg(outcome.response.status),
                      color: statusColor(outcome.response.status),
                      border: `1px solid ${statusColor(outcome.response.status)}`,
                    }}
                  >
                    {outcome.response.status}
                  </span>
                </div>
                <pre className="m-0 whitespace-pre-wrap">{JSON.stringify(outcome.response.body, null, 2)}</pre>
              </>
            ) : (
              <div className={ui.txt2}>
                Your code ran, but never sent a response back — make sure <code>handleRequest</code> returns a value.
              </div>
            )}
          </>
        )}

        {outcome && activeTab === "logs" && (
          <>
            {outcome.logs.length === 0 ? (
              <div className={ui.txt2}>No console output.</div>
            ) : (
              outcome.logs.map((line, i) => <div key={i}>{line}</div>)
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
}
