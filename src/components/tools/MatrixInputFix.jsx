// ─────────────────────────────────────────────────────────────────────────────
//  MatrixInput  —  DROP-IN REPLACEMENT for the one in your MatrixLab.jsx
//
//  FIXES:
//   1. No more stale-closure mid-type glitch (defaultValue + onBlur only).
//      Typing "1.5" no longer commits "1" then "1." then "1.5" on each keystroke.
//   2. onBlur safely parses and commits. Tab/Enter also commits (onKeyDown).
//   3. Empty string clears to 0 on blur, never NaN.
//   4. Local display state (string) so "-" and "1." are valid mid-type.
//   5. Size change preserves existing values; new cells get 0 (not identity).
//
//  USAGE (identical API to your current one):
//    import { MatrixInput } from "./MatrixInputFix";
//    <MatrixInput matrix={customMatrix} onChange={setCustomMatrix} onReset={...} />
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";

// Single controlled cell — manages its own display string
const Cell = ({ value, onCommit, size }) => {
  const [display, setDisplay] = useState(String(value));
  const inputRef = useRef(null);

  // Sync if parent value changes from outside (e.g. size resize or reset)
  useEffect(() => { setDisplay(String(value)); }, [value]);

  const commit = (raw) => {
    const p = parseFloat(raw);
    const v = isNaN(p) ? 0 : p;
    setDisplay(String(v));
    onCommit(v);
  };

  const cellH = size <= 2 ? 40 : size === 3 ? 36 : 30;
  const fs    = size <= 2 ? 14 : size === 3 ? 13 : 11;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={(e) => setDisplay(e.target.value)}
      onBlur={(e)    => commit(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Tab") commit(e.target.value); }}
      onFocus={(e)   => e.target.select()}
      style={{
        width: size <= 2 ? 58 : size === 3 ? 52 : 44,
        height: cellH,
        textAlign: "center",
        background: "#252525",
        border: "1px solid #3a3a3a",
        borderRadius: 4,
        color: "#e8e8e8",
        fontSize: fs,
        fontFamily: "'SF Mono',Menlo,monospace",
        outline: "none",
        transition: "border-color .12s",
      }}
      onMouseEnter={(e) => (e.target.style.borderColor = "#555")}
      onMouseLeave={(e) => (e.target.style.borderColor = "#3a3a3a")}
    />
  );
};

export const MatrixInput = ({ matrix, onChange, onReset }) => {
  const size = matrix.length;
  const cols = matrix[0]?.length ?? size;

  const handleSizeChange = (n) => {
    onChange(
      Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) =>
          r < size && c < cols ? matrix[r][c] : 0
        )
      )
    );
  };

  const commit = (r, c, v) => {
    const m = matrix.map((row) => [...row]);
    m[r][c] = v;
    onChange(m);
  };

  const cellH = size <= 2 ? 40 : size === 3 ? 36 : 30;
  const bracketFs = size <= 2 ? 30 : size === 3 ? 26 : 20;
  const totalH = size * cellH + (size - 1) * 4;

  const Bracket = ({ chars }) => (
    <div style={{
      display: "flex", flexDirection: "column",
      height: totalH, justifyContent: "space-between",
      color: "#555",
    }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ fontSize: bracketFs, fontWeight: 200, lineHeight: `${cellH}px`, display: "block" }}>
          {ch}
        </span>
      ))}
    </div>
  );

  const openBracket  = size === 1 ? ["|"] : ["\u23a1", ...Array(size - 2).fill("\u23a2"), "\u23a3"];
  const closeBracket = size === 1 ? ["|"] : ["\u23a4", ...Array(size - 2).fill("\u23a5"), "\u23a6"];

  return (
    <div>
      {/* Size controls */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Size
        </span>
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => handleSizeChange(n)} style={{
            width: 30, height: 22, borderRadius: 4,
            background: size === n ? "#2d2d2d" : "transparent",
            border: `1px solid ${size === n ? "#555" : "#333"}`,
            color: size === n ? "#c0c0c0" : "#555",
            fontSize: 10, cursor: "pointer", fontFamily: "inherit",
          }}>
            {n}×{n}
          </button>
        ))}
        {onReset && (
          <button onClick={onReset} style={{
            marginLeft: "auto", height: 22, padding: "0 8px", borderRadius: 4,
            background: "transparent", border: "1px solid #333",
            color: "#555", fontSize: 10, cursor: "pointer", fontFamily: "inherit",
          }}>
            ↺ Reset
          </button>
        )}
      </div>

      {/* Matrix with brackets */}
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Bracket chars={openBracket} />
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, auto)`,
          gridTemplateRows:    `repeat(${size}, auto)`,
          gap: 4,
        }}>
          {matrix.map((row, r) =>
            row.map((val, c) => (
              <Cell
                key={`${r}-${c}-${size}`}   /* key forces remount on size change */
                value={val}
                onCommit={(v) => commit(r, c, v)}
                size={size}
              />
            ))
          )}
        </div>
        <Bracket chars={closeBracket} />
      </div>
    </div>
  );
};

export default MatrixInput;
