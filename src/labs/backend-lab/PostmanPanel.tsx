import type { HttpRequest, StatusColors, UiTheme } from "./types";
import type { RunOutcome } from "./runRequest";

interface PostmanPanelProps {
  request: HttpRequest;
  outcome: RunOutcome | null;
  activeTab: "response" | "logs";
  onFieldChange: (field: keyof HttpRequest, value: string) => void;
  onSend: () => void;
  onTabChange: (tab: "response" | "logs") => void;
  ui: UiTheme;
  accentHex: string;
  status: StatusColors;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function PostmanPanel({
  request,
  outcome,
  activeTab,
  onFieldChange,
  onSend,
  onTabChange,
  ui,
  accentHex,
  status,
}: PostmanPanelProps) {
  const statusColor = (code: number) => (code < 300 ? status.green : code < 500 ? status.amber : status.red);
  const statusBg = (code: number) => (code < 300 ? status.greenBg : code < 500 ? status.amberBg : status.redBg);

  return (
    <div className={`flex flex-col h-full min-w-0 ${ui.bg0} ${ui.txt1}`}>
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
          onClick={onSend}
          className="px-4 py-1.5 rounded-md text-white font-semibold text-[13px]"
          style={{ background: accentHex }}
        >
          Send
        </button>
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
        {(["response", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
              activeTab === tab ? ui.primary : `${ui.txt2} ${ui.hoverTx}`
            }`}
            style={{ borderBottomColor: activeTab === tab ? accentHex : "transparent" }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3.5 font-mono text-[13px]">
        {!outcome && <div className={ui.txt2}>Click Send to try your request.</div>}

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
    </div>
  );
}
