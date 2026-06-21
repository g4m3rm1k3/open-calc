import { useCallback, useEffect, useMemo, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   GoalSystem
   ────────────────────────────────────────────────────────────────────────
   Turns a goal into a SYSTEM, not a checklist:
     - a causal loop  (Input → Action → Output → Feedback → back to Input)
     - named leverage points (which input moves the outcome most)
     - explicit failure modes (where the system breaks, stated up front)
     - a drift signal (live, computed from logged data — not a streak count)

   INTEGRATION
   ───────────
   `generateSystem(goalText)` is provided by the caller — in Compass this is
   wired to `generateSystemSpec()` in `../systemTemplates.ts`: a curated,
   deterministic, free template lookup, NOT an LLM call. See that file for
   why — asking a free local model to invent leverage-point reasoning is
   exactly the failure mode that caused the original goal-decomposer bug.

   If you don't pass `generateSystem`, the component falls back to a visible
   "not connected" state — it never silently fakes a system.
   ════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "goal-system:v1";

const C = {
  bg: "#0B0E14",
  panel: "#11151D",
  panelAlt: "#151A23",
  line: "#232B38",
  lineActive: "#5EEAD4",
  text: "#E8ECF1",
  sub: "#8A93A6",
  mono: "#5EEAD4",
  amber: "#FB923C",
  red: "#F43F5E",
  green: "#34D399",
};

const FONT_MONO =
  "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const FONT_SANS =
  "'Inter', 'Söhne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — degrade silently, system still works in-session */
  }
}

function impactColor(impact) {
  if (impact === "high") return C.amber;
  if (impact === "medium") return C.lineActive;
  return C.sub;
}

/* ── Drift math ──────────────────────────────────────────────────────────
   For each logged input, compare the most recent entry against its target.
   A system "drifts" when an input has been below target for multiple
   consecutive entries — that's the actual signal a tracker never computes. */
function computeDrift(input, entries) {
  const recent = (entries[input.key] || []).slice(-5);
  if (recent.length === 0) return { status: "no-data", streakBelow: 0 };
  const target = Number(input.target) || 0;
  let streakBelow = 0;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    if (Number(recent[i].value) < target * 0.85) streakBelow += 1;
    else break;
  }
  const status = streakBelow >= 3 ? "drift" : streakBelow >= 1 ? "watch" : "on-track";
  return { status, streakBelow, latest: recent[recent.length - 1]?.value ?? null };
}

/* ════════════════════════════════════════════════════════════════════════
   Loop diagram (SVG) — the signature element. Four nodes in a cycle with
   animated flow along the connecting paths, and a pulse on whichever node
   currently has the worst drift.
   ════════════════════════════════════════════════════════════════════════ */
function LoopDiagram({ loop, worstKey }) {
  const nodes = [
    { key: "input", ...loop.input, x: 90, y: 70 },
    { key: "action", ...loop.action, x: 410, y: 70 },
    { key: "output", ...loop.output, x: 410, y: 230 },
    { key: "feedback", ...loop.feedback, x: 90, y: 230 },
  ];
  const byKey = Object.fromEntries(nodes.map((n) => [n.key, n]));
  const edges = [
    ["input", "action"],
    ["action", "output"],
    ["output", "feedback"],
    ["feedback", "input"],
  ];

  return (
    <svg viewBox="0 0 500 300" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <marker id="gs-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={C.lineActive} />
        </marker>
        <style>{`
          @keyframes gs-dash { to { stroke-dashoffset: -24; } }
          @keyframes gs-pulse { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
          .gs-flow { stroke-dasharray: 6 6; animation: gs-dash 1.1s linear infinite; }
          .gs-pulse-ring { animation: gs-pulse 1.6s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .gs-flow { animation: none; }
            .gs-pulse-ring { animation: none; opacity: .6; }
          }
        `}</style>
      </defs>

      {edges.map(([from, to], i) => {
        const a = byKey[from];
        const b = byKey[to];
        const path =
          a.x === b.x
            ? `M${a.x},${a.y < b.y ? a.y + 34 : a.y - 34} L${b.x},${a.y < b.y ? b.y - 34 : b.y + 34}`
            : `M${a.x + (b.x > a.x ? 78 : -78)},${a.y} L${b.x - (b.x > a.x ? 78 : -78)},${b.y}`;
        return (
          <path
            key={i}
            d={path}
            stroke={C.lineActive}
            strokeWidth="1.5"
            fill="none"
            className="gs-flow"
            opacity="0.55"
            markerEnd="url(#gs-arrow)"
          />
        );
      })}

      {nodes.map((n) => {
        const isWorst = n.key === worstKey;
        return (
          <g key={n.key}>
            {isWorst && (
              <rect
                x={n.x - 80}
                y={n.y - 30}
                width="160"
                height="60"
                rx="10"
                fill="none"
                stroke={C.red}
                strokeWidth="1.5"
                className="gs-pulse-ring"
              />
            )}
            <rect
              x={n.x - 76}
              y={n.y - 26}
              width="152"
              height="52"
              rx="8"
              fill={C.panelAlt}
              stroke={isWorst ? C.red : C.line}
              strokeWidth="1.25"
            />
            <text
              x={n.x}
              y={n.y - 5}
              textAnchor="middle"
              fontFamily={FONT_MONO}
              fontSize="9.5"
              letterSpacing="1.5"
              fill={C.sub}
            >
              {n.key.toUpperCase()}
            </text>
            <text
              x={n.x}
              y={n.y + 14}
              textAnchor="middle"
              fontFamily={FONT_SANS}
              fontSize="12"
              fontWeight="600"
              fill={C.text}
            >
              {(n.label || "").length > 24 ? `${n.label.slice(0, 22)}…` : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════════════ */
export default function GoalSystem({ generateSystem }) {
  const [phase, setPhase] = useState("input"); // input | loading | error | system
  const [goalText, setGoalText] = useState("");
  const [system, setSystem] = useState(null);
  const [entries, setEntries] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [logDraft, setLogDraft] = useState({});

  useEffect(() => {
    const saved = loadSaved();
    if (saved?.system) {
      setSystem(saved.system);
      setEntries(saved.entries || {});
      setGoalText(saved.goalText || "");
      setPhase("system");
    }
  }, []);

  useEffect(() => {
    if (system) saveState({ system, entries, goalText });
  }, [system, entries, goalText]);

  const handleGenerate = useCallback(async () => {
    if (!goalText.trim()) return;
    if (typeof generateSystem !== "function") {
      setPhase("error");
      setErrorMsg(
        "No generateSystem function was passed to <GoalSystem />. Wire your LLM call through that prop — see the comment block at the top of this file for the expected request/response shape.",
      );
      return;
    }
    setPhase("loading");
    setErrorMsg("");
    try {
      const result = await generateSystem(goalText.trim());
      if (!result || !result.loop || !result.inputsToLog) {
        throw new Error("Response is missing required fields (loop, inputsToLog).");
      }
      setSystem(result);
      setEntries({});
      setPhase("system");
    } catch (err) {
      setPhase("error");
      setErrorMsg(err?.message || "The system couldn't be generated. Try again.");
    }
  }, [goalText, generateSystem]);

  const handleLogSubmit = useCallback(
    (key) => {
      const raw = logDraft[key];
      if (raw === undefined || raw === "" || Number.isNaN(Number(raw))) return;
      setEntries((prev) => {
        const next = { ...prev };
        const list = next[key] ? [...next[key]] : [];
        list.push({ value: Number(raw), at: Date.now() });
        next[key] = list;
        return next;
      });
      setLogDraft((prev) => ({ ...prev, [key]: "" }));
    },
    [logDraft],
  );

  const handleReset = useCallback(() => {
    setSystem(null);
    setEntries({});
    setGoalText("");
    setPhase("input");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const driftByKey = useMemo(() => {
    if (!system) return {};
    const map = {};
    for (const input of system.inputsToLog) {
      map[input.key] = computeDrift(input, entries);
    }
    return map;
  }, [system, entries]);

  const worstKey = useMemo(() => {
    if (!system) return null;
    let worst = null;
    let worstScore = -1;
    for (const input of system.inputsToLog) {
      const d = driftByKey[input.key];
      const score = d.status === "drift" ? 2 : d.status === "watch" ? 1 : 0;
      if (score > worstScore) {
        worstScore = score;
        worst = input.key;
      }
    }
    // Map an input's drift to the nearest loop node — input drift maps to
    // "input" or "feedback" depending on which loop stage it belongs to.
    // Simplest honest mapping: surface it on "input" by default.
    return worstScore > 0 ? "input" : null;
  }, [system, driftByKey]);

  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        background: C.bg,
        color: C.text,
        borderRadius: 16,
        border: `1px solid ${C.line}`,
        padding: 0,
        overflow: "hidden",
        maxWidth: 760,
        width: "100%",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              letterSpacing: 2,
              color: C.sub,
              marginBottom: 4,
            }}
          >
            GOAL → SYSTEM
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {system ? system.goal : "Define a goal"}
          </div>
        </div>
        {system && (
          <button onClick={handleReset} style={ghostBtnStyle}>
            New system
          </button>
        )}
      </div>

      {/* ── INPUT PHASE ── */}
      {phase === "input" && (
        <div style={{ padding: 24 }}>
          <label style={{ fontSize: 12.5, color: C.sub, display: "block", marginBottom: 8 }}>
            What's the goal? Be specific — a number and a timeframe help the system find real
            leverage points instead of generic advice.
          </label>
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. Run a sub-20-minute 5K by October"
            rows={3}
            style={{
              width: "100%",
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              color: C.text,
              padding: "12px 14px",
              fontSize: 14,
              fontFamily: FONT_SANS,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.lineActive)}
            onBlur={(e) => (e.target.style.borderColor = C.line)}
          />
          <button
            onClick={handleGenerate}
            disabled={!goalText.trim()}
            style={{
              ...primaryBtnStyle,
              marginTop: 14,
              opacity: goalText.trim() ? 1 : 0.45,
              cursor: goalText.trim() ? "pointer" : "not-allowed",
            }}
          >
            Build the system
          </button>
        </div>
      )}

      {/* ── LOADING ── */}
      {phase === "loading" && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              color: C.lineActive,
              letterSpacing: 1,
            }}
          >
            mapping inputs → outputs → feedback…
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === "error" && (
        <div style={{ padding: 24 }}>
          <div
            style={{
              background: "rgba(244,63,94,0.08)",
              border: `1px solid ${C.red}55`,
              borderRadius: 10,
              padding: "14px 16px",
              fontSize: 13,
              color: C.text,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, color: C.red, marginBottom: 4 }}>
              System not generated
            </div>
            {errorMsg}
          </div>
          <button onClick={() => setPhase("input")} style={{ ...ghostBtnStyle, marginTop: 14 }}>
            Back
          </button>
        </div>
      )}

      {/* ── SYSTEM PHASE ── */}
      {phase === "system" && system && (
        <div>
          {/* Loop diagram */}
          <div style={{ padding: "20px 22px 6px" }}>
            <SectionLabel>The loop</SectionLabel>
            <LoopDiagram loop={system.loop} worstKey={worstKey} />
            <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
              {["input", "action", "output", "feedback"].map((k) => (
                <div key={k} style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                  <span style={{ fontFamily: FONT_MONO, color: C.lineActive, fontSize: 10.5 }}>
                    {k.toUpperCase()}
                  </span>{" "}
                  — {system.loop[k]?.detail}
                </div>
              ))}
            </div>
          </div>

          {/* Leverage points */}
          <div style={{ padding: "18px 22px 6px", borderTop: `1px solid ${C.line}` }}>
            <SectionLabel>Leverage points</SectionLabel>
            <div style={{ display: "grid", gap: 8 }}>
              {(system.leveragePoints || []).map((lp, i) => (
                <div
                  key={i}
                  style={{
                    background: C.panel,
                    border: `1px solid ${C.line}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: impactColor(lp.impact),
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {lp.label}{" "}
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          color: impactColor(lp.impact),
                          marginLeft: 6,
                        }}
                      >
                        {lp.impact?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{lp.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Failure modes */}
          <div style={{ padding: "18px 22px 6px", borderTop: `1px solid ${C.line}` }}>
            <SectionLabel>Where this breaks</SectionLabel>
            <div style={{ display: "grid", gap: 8 }}>
              {(system.failureModes || []).map((fm, i) => (
                <div key={i} style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                  <span style={{ color: C.red, fontWeight: 600 }}>{fm.label}</span> —{" "}
                  {fm.consequence}
                </div>
              ))}
            </div>
          </div>

          {/* Inputs + logging */}
          <div style={{ padding: "18px 22px 22px", borderTop: `1px solid ${C.line}` }}>
            <SectionLabel>Log inputs</SectionLabel>
            <div style={{ display: "grid", gap: 10 }}>
              {system.inputsToLog.map((input) => {
                const drift = driftByKey[input.key];
                const statusColor =
                  drift.status === "drift" ? C.red : drift.status === "watch" ? C.amber : C.green;
                const statusLabel =
                  drift.status === "drift"
                    ? "Drifting"
                    : drift.status === "watch"
                      ? "Watch"
                      : drift.status === "no-data"
                        ? "No data yet"
                        : "On track";
                return (
                  <div
                    key={input.key}
                    style={{
                      background: C.panel,
                      border: `1px solid ${C.line}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{input.label}</div>
                      <div
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10.5,
                          color: statusColor,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: statusColor,
                            display: "inline-block",
                          }}
                        />
                        {statusLabel}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        value={logDraft[input.key] ?? ""}
                        onChange={(e) =>
                          setLogDraft((prev) => ({ ...prev, [input.key]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleLogSubmit(input.key);
                        }}
                        placeholder={`Target: ${input.target} ${input.unit}`}
                        style={{
                          flex: 1,
                          background: C.bg,
                          border: `1px solid ${C.line}`,
                          borderRadius: 7,
                          color: C.text,
                          padding: "7px 10px",
                          fontSize: 12.5,
                          fontFamily: FONT_MONO,
                          outline: "none",
                        }}
                      />
                      <button onClick={() => handleLogSubmit(input.key)} style={smallBtnStyle}>
                        Log
                      </button>
                      {drift.latest != null && (
                        <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.sub }}>
                          last: {drift.latest} {input.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10.5,
        letterSpacing: 1.8,
        color: C.sub,
        marginBottom: 10,
      }}
    >
      {String(children).toUpperCase()}
    </div>
  );
}

const primaryBtnStyle = {
  background: C.lineActive,
  color: "#06121A",
  border: "none",
  borderRadius: 9,
  padding: "11px 18px",
  fontSize: 13.5,
  fontWeight: 700,
  fontFamily: FONT_SANS,
};

const ghostBtnStyle = {
  background: "transparent",
  color: C.sub,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 12.5,
  cursor: "pointer",
  fontFamily: FONT_SANS,
};

const smallBtnStyle = {
  background: C.panelAlt,
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 7,
  padding: "7px 12px",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: FONT_SANS,
  whiteSpace: "nowrap",
};
