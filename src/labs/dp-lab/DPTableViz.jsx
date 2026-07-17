// DP Lab's table visualizer — generalizes DSA01Arrays.jsx's MemoryViz (a single
// highlighted row) into a full 1D-strip-or-2D-grid renderer for DP tables.
// Not imported from DSA01 (no lab imports another lab's internals) — built
// fresh, modeled closely on MemoryViz's per-cell conditional-styling cascade
// and monospace visual language.
//
// Internally every table is normalized to a 2D grid (dp1d becomes a single
// row) so there is exactly one cell-rendering code path; only the outer
// wrapper differs on whether row labels are shown.

const mono = "'JetBrains Mono','Fira Code',monospace";

function samePos(a, b) {
  if (!a || !b) return false;
  if ("index" in a) return a.index === b.index;
  return a.row === b.row && a.col === b.col;
}

function flagFor(row, col, { cursor2d, sources2d, cellKind, value }) {
  const pos = { row, col };
  if (samePos(pos, cursor2d)) return cellKind; // "base" | "compute" | "unreachable" | "done"
  if (sources2d.some((s) => samePos(s, pos))) return "source";
  if (value === null || value === undefined) return "pending";
  return "filled";
}

function cellStyle(flag, C) {
  switch (flag) {
    case "base":
      return { bg: "#0f2010", border: `1px solid ${C.green}`, text: C.green, dashed: false };
    case "compute":
      return { bg: "#2a1a00", border: `1px solid ${C.amber}`, text: C.amber, dashed: false };
    case "source":
      return { bg: "#1a1a40", border: `1px solid ${C.blue}`, text: C.blue, dashed: false };
    case "unreachable":
      return { bg: "#2a0810", border: `1px dashed ${C.red}`, text: C.red, dashed: true };
    case "done":
      return { bg: "#1a4020", border: `2px solid ${C.green}`, text: C.green, dashed: false };
    case "filled":
      return { bg: C.dim, border: `1px solid ${C.border2}`, text: C.text, dashed: false };
    case "pending":
    default:
      return { bg: "transparent", border: `1px dashed ${C.border2}`, text: C.muted, dashed: true };
  }
}

export default function DPTableViz({
  kind,
  table,
  cursor,
  sources = [],
  cellKind,
  decision = null,
  rowLabels,
  colLabels,
  subLabels,
  label,
  C,
}) {
  const grid = kind === "dp1d" ? [table] : table;
  const cursor2d = kind === "dp1d" && cursor ? { row: 0, col: cursor.index } : cursor;
  const sources2d = kind === "dp1d" ? sources.map((s) => ({ row: 0, col: s.index })) : sources;
  const showRowLabels = kind === "dp2d";
  const cellSize = 44;

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Column header row */}
      <div style={{ display: "flex", gap: 0, marginBottom: 2 }}>
        {showRowLabels && <div style={{ width: 40, flexShrink: 0 }} />}
        {grid[0].map((_, j) => (
          <div
            key={j}
            style={{
              width: cellSize, flexShrink: 0, textAlign: "center",
              fontSize: 9, color: C.textDim, fontFamily: mono,
            }}
          >
            {colLabels ? colLabels[j] : j}
          </div>
        ))}
      </div>

      {/* Rows */}
      {grid.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 0, alignItems: "stretch", marginBottom: 2 }}>
          {showRowLabels && (
            <div
              style={{
                width: 40, flexShrink: 0, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 10, color: C.textDim, fontFamily: mono, fontWeight: 600,
              }}
            >
              {rowLabels ? rowLabels[i] : i}
            </div>
          )}
          {row.map((value, j) => {
            const flag = flagFor(i, j, { cursor2d, sources2d, cellKind, value });
            const style = cellStyle(flag, C);
            const isCursor = samePos({ row: i, col: j }, cursor2d);
            return (
              <div key={j} style={{ width: cellSize, flexShrink: 0 }}>
                <div
                  style={{
                    height: cellSize, background: style.bg, border: style.border,
                    borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: mono, fontSize: 13, fontWeight: 600, color: style.text,
                    transition: "all .18s", position: "relative",
                  }}
                >
                  {flag === "unreachable" ? "—" : value === null || value === undefined ? "" : value}
                  {isCursor && decision && (
                    <div
                      style={{
                        position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                        background: style.text, color: "#080c0f", fontSize: 7, fontWeight: 700,
                        padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", fontFamily: mono,
                      }}
                    >
                      {decision}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Sub-labels (dp1d only — e.g. the input array under each dp[i] cell) */}
      {kind === "dp1d" && subLabels && (
        <div style={{ display: "flex", gap: 0, marginTop: 3 }}>
          {subLabels.map((v, j) => (
            <div
              key={j}
              style={{
                width: cellSize, flexShrink: 0, textAlign: "center",
                fontSize: 9, color: C.muted, fontFamily: mono,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      )}

      {label && (
        <div
          style={{
            marginTop: 10, fontFamily: mono, fontSize: 11, color: C.textDim, lineHeight: 1.5,
            padding: "6px 10px", background: C.dim, borderRadius: 4, borderLeft: `2px solid ${C.border2}`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
