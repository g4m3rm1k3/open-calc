import { useState, useEffect, useRef, useCallback } from "react";
import {
  sharedInits,
  getOrCreateEngine,
} from "../../../scripts/git/GitSharedInstances.js";

// ── Graph layout ──────────────────────────────────────────────────────────────

const LANE_COLORS = [
  "#4fc3f7", // blue
  "#81c784", // green
  "#ffb74d", // orange
  "#ba68c8", // purple
  "#f06292", // pink
  "#4db6ac", // teal
];

function buildGraphLayout(git, fullHistory) {
  if (!fullHistory || fullHistory.length === 0) {
    return {
      sorted: [],
      commitLane: new Map(),
      commitBranches: new Map(),
      maxLane: 0,
    };
  }

  const commitLane = new Map();
  let nextLane = 1;

  // main branch → lane 0
  let cur = git.branches["main"];
  while (cur && !commitLane.has(cur)) {
    commitLane.set(cur, 0);
    const obj = git.objects.get(cur);
    if (!obj) break;
    cur = obj.data.parent;
  }

  // other branches → next lane each
  Object.entries(git.branches).forEach(([name, tip]) => {
    if (name === "main" || !tip) return;
    let c = tip;
    while (c && !commitLane.has(c)) {
      commitLane.set(c, nextLane);
      const obj = git.objects.get(c);
      if (!obj) break;
      c = obj.data.parent;
    }
    nextLane++;
  });

  // unassigned → lane 0
  fullHistory.forEach((c) => {
    if (!commitLane.has(c.hash)) commitLane.set(c.hash, 0);
  });

  const commitBranches = new Map();
  Object.entries(git.branches).forEach(([name, tip]) => {
    if (!tip) return;
    if (!commitBranches.has(tip)) commitBranches.set(tip, []);
    commitBranches.get(tip).push(name);
  });

  const maxLane = Math.max(0, ...Array.from(commitLane.values()));
  return { sorted: fullHistory, commitLane, commitBranches, maxLane };
}

function laneColor(lane) {
  return LANE_COLORS[lane % LANE_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GitKrakenView({ params = {} }) {
  const {
    initialFiles = {
      "game-design.txt": "Dungeon Explorer\n\nA top-down adventure game.",
    },
    label = "dungeon-explorer",
    instanceId = null,
  } = params;

  const gitRef = useRef(null);
  if (!gitRef.current) {
    gitRef.current = getOrCreateEngine(instanceId);
  }
  const git = gitRef.current;

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!instanceId || !sharedInits.has(instanceId)) {
      if (instanceId) sharedInits.add(instanceId);
      Object.entries(initialFiles).forEach(([name, content]) => {
        git.writeFile(name, content);
      });
      refresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedCommit, setSelectedCommit] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Collect full commit history across all branches
  const fullHistory = (() => {
    const visited = new Set();
    const all = new Map();
    const queue = Object.values(git.branches).filter(Boolean);
    while (queue.length) {
      const hash = queue.shift();
      if (!hash || visited.has(hash)) continue;
      visited.add(hash);
      const obj = git.objects.get(hash);
      if (!obj || obj.type !== "commit") continue;
      all.set(hash, { hash, ...obj.data });
      if (obj.data.parent) queue.push(obj.data.parent);
      if (obj.data.mergeParent) queue.push(obj.data.mergeParent);
    }
    return Array.from(all.values()).sort((a, b) => b.timestamp - a.timestamp);
  })();

  const { sorted, commitLane, commitBranches, maxLane } = buildGraphLayout(
    git,
    fullHistory,
  );

  const currentBranch = git.head;
  const currentCommitHash = git.branches[currentBranch] ?? null;

  // Layout constants
  const ROW_H = 48;
  const LANE_W = 20;
  const SVG_PADDING = 16;
  const SVG_W = (maxLane + 1) * LANE_W + SVG_PADDING * 2;
  const SVG_H = Math.max(sorted.length * ROW_H, 1);

  const cx = (hash) =>
    SVG_PADDING + (commitLane.get(hash) ?? 0) * LANE_W + LANE_W / 2;
  const cy = (i) => i * ROW_H + ROW_H / 2;
  const idxOf = (hash) => sorted.findIndex((c) => c.hash === hash);

  const edges = sorted.flatMap((commit, i) => {
    const results = [];
    const x1 = cx(commit.hash);
    const y1 = cy(i);
    const color = laneColor(commitLane.get(commit.hash) ?? 0);

    if (commit.parent) {
      const pi = idxOf(commit.parent);
      if (pi >= 0) {
        const x2 = cx(commit.parent);
        const y2 = cy(pi);
        // Curved connector
        const midY = (y1 + y2) / 2;
        results.push(
          <path
            key={`e-${commit.hash}`}
            d={`M ${x1} ${y1 + 7} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 7}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
            opacity={0.7}
          />,
        );
      }
    }
    if (commit.mergeParent) {
      const mi = idxOf(commit.mergeParent);
      if (mi >= 0) {
        const x2 = cx(commit.mergeParent);
        const y2 = cy(mi);
        const mpColor = laneColor(commitLane.get(commit.mergeParent) ?? 0);
        const midY = (y1 + y2) / 2;
        results.push(
          <path
            key={`me-${commit.hash}`}
            d={`M ${x1} ${y1 + 7} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 7}`}
            stroke={mpColor}
            strokeWidth={2}
            fill="none"
            strokeDasharray="4,3"
            opacity={0.5}
          />,
        );
      }
    }
    return results;
  });

  const branchNames = Object.keys(git.branches);

  // Files in selected commit
  const selectedObj = selectedCommit ? git.objects.get(selectedCommit) : null;
  const selectedData = selectedObj?.data ?? null;

  // Get files changed in selected commit
  const getCommitFiles = (hash) => {
    if (!hash) return [];
    const obj = git.objects.get(hash);
    if (!obj || obj.type !== "commit") return [];
    const treeHash = obj.data.tree;
    const treeObj = git.objects.get(treeHash);
    if (!treeObj) return [];
    return Array.from(
      treeObj.data.keys ? treeObj.data.keys() : Object.keys(treeObj.data),
    );
  };

  return (
    <div
      className="flex flex-col h-full min-h-[460px] max-h-[640px] rounded-lg overflow-hidden border"
      style={{
        background: "#1a1d23",
        borderColor: "#2d3139",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── Top toolbar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{ background: "#21262d", borderColor: "#2d3139" }}
      >
        {/* App identity */}
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7l9 5 9-5-9-5z" fill="#4fc3f7" />
            <path
              d="M3 17l9 5 9-5M3 12l9 5 9-5"
              stroke="#4fc3f7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#e6edf3" }}>
            {label}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "#2d3139", color: "#8b949e" }}
          >
            local
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {[
            { icon: "↑", label: "Push" },
            { icon: "↓", label: "Pull" },
            { icon: "⟳", label: "Fetch" },
          ].map(({ icon, label: lbl }) => (
            <button
              key={lbl}
              onClick={() =>
                showToast(`${lbl} simulated — no real remote in this sandbox`)
              }
              className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors"
              style={{
                background: "#2d3748",
                color: "#c9d1d9",
                border: "1px solid #444d56",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2d3748";
              }}
            >
              <span>{icon}</span>
              <span>{lbl}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left sidebar: branches ─────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-shrink-0 overflow-y-auto border-r"
          style={{ width: 160, background: "#161b22", borderColor: "#2d3139" }}
        >
          <div
            className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: "#8b949e" }}
          >
            Local branches
          </div>
          {branchNames.map((branch, bi) => {
            const isCurrent = branch === currentBranch;
            const color = laneColor(bi);
            return (
              <button
                key={branch}
                onClick={() => {
                  git.checkout(branch);
                  refresh();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors w-full"
                style={{
                  background: isCurrent ? "#1f3a5f" : "transparent",
                  color: isCurrent ? "#4fc3f7" : "#c9d1d9",
                  borderLeft: isCurrent
                    ? `3px solid ${color}`
                    : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = "#1f2937";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="truncate">{branch}</span>
                {isCurrent && (
                  <span
                    className="ml-auto text-[9px] px-1 rounded"
                    style={{ background: "#1e3a5f", color: "#4fc3f7" }}
                  >
                    HEAD
                  </span>
                )}
              </button>
            );
          })}

          {branchNames.length === 0 && (
            <div className="px-3 py-2 text-xs italic" style={{ color: "#555" }}>
              no branches yet
            </div>
          )}
        </div>

        {/* ── Center: commit graph ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto min-w-0">
          {sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-3"
              style={{ color: "#555" }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="7" r="3" stroke="#555" strokeWidth="1.5" />
                <line
                  x1="12"
                  y1="10"
                  x2="12"
                  y2="20"
                  stroke="#555"
                  strokeWidth="1.5"
                />
              </svg>
              <p className="text-sm">No commits yet</p>
              <p className="text-xs">
                Use the terminal to make your first commit
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `${SVG_W}px 1fr`,
                minWidth: SVG_W + 280,
              }}
            >
              {/* SVG graph */}
              <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
                {/* Vertical lane guides */}
                {Array.from({ length: maxLane + 1 }, (_, lane) => (
                  <line
                    key={`lane-${lane}`}
                    x1={SVG_PADDING + lane * LANE_W + LANE_W / 2}
                    y1={0}
                    x2={SVG_PADDING + lane * LANE_W + LANE_W / 2}
                    y2={SVG_H}
                    stroke={laneColor(lane)}
                    strokeWidth={1}
                    opacity={0.08}
                  />
                ))}
                {edges}
                {sorted.map((commit, i) => {
                  const isCurrent = commit.hash === currentCommitHash;
                  const isSelected = commit.hash === selectedCommit;
                  const lane = commitLane.get(commit.hash) ?? 0;
                  const color = laneColor(lane);
                  return (
                    <g
                      key={commit.hash}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedCommit(commit.hash)}
                    >
                      {/* Selection/current indicator ring */}
                      {(isCurrent || isSelected) && (
                        <circle
                          cx={cx(commit.hash)}
                          cy={cy(i)}
                          r={9}
                          fill="none"
                          stroke={isCurrent ? "#4fc3f7" : "#6b7280"}
                          strokeWidth={1.5}
                          opacity={0.6}
                        />
                      )}
                      <circle
                        cx={cx(commit.hash)}
                        cy={cy(i)}
                        r={6}
                        fill={isCurrent ? "#4fc3f7" : color}
                        stroke={isSelected ? "#ffffff" : "#1a1d23"}
                        strokeWidth={isSelected ? 2 : 1.5}
                        style={{
                          filter: isCurrent
                            ? "drop-shadow(0 0 4px rgba(79,195,247,0.6))"
                            : "none",
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Commit info rows */}
              <div style={{ paddingTop: 0 }}>
                {sorted.map((commit, i) => {
                  const isCurrent = commit.hash === currentCommitHash;
                  const isSelected = commit.hash === selectedCommit;
                  const branches = commitBranches.get(commit.hash) ?? [];
                  const lane = commitLane.get(commit.hash) ?? 0;
                  const color = laneColor(lane);

                  return (
                    <div
                      key={commit.hash}
                      onClick={() => setSelectedCommit(commit.hash)}
                      style={{
                        height: ROW_H,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 8,
                        paddingRight: 12,
                        gap: 6,
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(79,195,247,0.07)"
                          : "transparent",
                        borderBottom: "1px solid rgba(45,49,57,0.5)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        {/* Branch labels */}
                        {branches.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {branches.map((b) => (
                              <span
                                key={b}
                                className="text-[9px] px-1.5 py-px rounded-full font-semibold"
                                style={{
                                  background: `${color}22`,
                                  color,
                                  border: `1px solid ${color}44`,
                                }}
                              >
                                {b}
                              </span>
                            ))}
                            {isCurrent && (
                              <span
                                className="text-[9px] px-1.5 py-px rounded-full font-semibold"
                                style={{
                                  background: "#1e3a5f",
                                  color: "#4fc3f7",
                                  border: "1px solid #4fc3f744",
                                }}
                              >
                                HEAD
                              </span>
                            )}
                          </div>
                        )}
                        {/* Commit message */}
                        <span
                          className="text-xs truncate"
                          style={{
                            color: isCurrent ? "#e6edf3" : "#adbac7",
                            fontWeight: isCurrent ? 600 : 400,
                          }}
                        >
                          {commit.message}
                        </span>
                        {/* Hash + date */}
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: "#557" }}
                          >
                            {commit.hash.slice(0, 7)}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "#445" }}
                          >
                            {new Date(commit.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: commit detail ─────────────────────────────────────── */}
        <div
          className="flex-shrink-0 border-l overflow-y-auto"
          style={{ width: 200, background: "#161b22", borderColor: "#2d3139" }}
        >
          {selectedData ? (
            <div className="p-3 space-y-3">
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "#8b949e" }}
                >
                  Commit
                </div>
                <div className="font-mono text-xs" style={{ color: "#4fc3f7" }}>
                  {selectedCommit?.slice(0, 10)}
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "#8b949e" }}
                >
                  Message
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: "#e6edf3" }}
                >
                  {selectedData.message}
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "#8b949e" }}
                >
                  Date
                </div>
                <div className="text-xs" style={{ color: "#adbac7" }}>
                  {selectedData.timestamp
                    ? new Date(selectedData.timestamp).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "#8b949e" }}
                >
                  Files
                </div>
                {getCommitFiles(selectedCommit).length === 0 ? (
                  <div className="text-xs italic" style={{ color: "#555" }}>
                    no files
                  </div>
                ) : (
                  <div className="space-y-1">
                    {getCommitFiles(selectedCommit).map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 16 16"
                          fill="#81c784"
                        >
                          <path d="M2 2h8l4 4v10H2V2z" />
                        </svg>
                        <span
                          className="text-[11px] font-mono truncate"
                          style={{ color: "#c9d1d9" }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedData.parent && (
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "#8b949e" }}
                  >
                    Parent
                  </div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: "#6e7681" }}
                  >
                    {selectedData.parent.slice(0, 10)}
                  </div>
                </div>
              )}
              {selectedData.mergeParent && (
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "#8b949e" }}
                  >
                    Merge parent
                  </div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: "#6e7681" }}
                  >
                    {selectedData.mergeParent.slice(0, 10)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full gap-2 p-4"
              style={{ color: "#555" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="7" r="4" stroke="#555" strokeWidth="1.5" />
                <line
                  x1="12"
                  y1="11"
                  x2="12"
                  y2="20"
                  stroke="#555"
                  strokeWidth="1.5"
                />
              </svg>
              <p className="text-[11px] text-center">
                Click a commit to inspect it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs shadow-lg"
          style={{
            background: "#2d3748",
            color: "#e6edf3",
            border: "1px solid #4a5568",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
