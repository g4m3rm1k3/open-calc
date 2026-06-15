import { useState, useRef } from "react";
import styles from "./MusicLab.module.css";

const TOTAL_BARS = 32;

export default function ArrangerPanel({
  patterns, arrangement, activePatternId, songMode, currentBar,
  onSetBlock, onClearBlock, onClear, onToggleSongMode,
}) {
  const [brushPatternId, setBrushPatternId] = useState(activePatternId);
  const [painting, setPainting] = useState(false); // true = paint, false = erase
  const dragRef = useRef(false);

  const blockMap = {};
  arrangement.forEach(b => { blockMap[b.bar] = b.patternId; });

  const getPattern = (id) => patterns.find(p => p.id === id);

  const handleCellDown = (bar, e) => {
    e.preventDefault();
    const existing = blockMap[bar];
    if (existing === brushPatternId) {
      onClearBlock(bar);
      dragRef.current = "erase";
    } else {
      onSetBlock(bar, brushPatternId);
      dragRef.current = "paint";
    }
  };

  const handleCellEnter = (bar) => {
    if (!dragRef.current) return;
    if (dragRef.current === "paint") onSetBlock(bar, brushPatternId);
    else if (dragRef.current === "erase") onClearBlock(bar);
  };

  return (
    <div
      className={styles.arranger}
      onMouseUp={() => { dragRef.current = false; }}
      onMouseLeave={() => { dragRef.current = false; }}
    >
      {/* Header */}
      <div className={styles.arrangerHeader}>
        <span className={styles.arrangerTitle}>Song Arranger</span>

        <div className={styles.arrangerBrushRow}>
          <span className={styles.arrangerLabel}>Paint:</span>
          {patterns.map(p => (
            <button
              key={p.id}
              className={`${styles.arrangerBrushBtn} ${brushPatternId === p.id ? styles.arrangerBrushActive : ""}`}
              style={brushPatternId === p.id ? { borderColor: "#a78bfa", color: "#a78bfa" } : {}}
              onClick={() => setBrushPatternId(p.id)}
              title={`Paint with ${p.name}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className={styles.arrangerActions}>
          <button
            className={`${styles.tbBtn} ${songMode ? styles.tbBtnActive : ""}`}
            onClick={onToggleSongMode}
            title={songMode ? "Switch to pattern loop mode" : "Switch to song arrangement mode"}
          >
            {songMode ? "▤ Song" : "↺ Loop"}
          </button>
          <button className={styles.tbBtn} onClick={onClear} title="Clear all blocks">
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Bar numbers */}
      <div className={styles.arrangerGrid}>
        <div className={styles.arrangerRowLabel} />
        {Array.from({ length: TOTAL_BARS }, (_, i) => (
          <div
            key={i}
            className={`${styles.arrangerBarNum} ${i % 4 === 0 ? styles.arrangerBarNumBold : ""} ${i === currentBar ? styles.arrangerBarNumActive : ""}`}
          >
            {i % 4 === 0 ? i + 1 : "·"}
          </div>
        ))}
      </div>

      {/* Pattern rows */}
      <div className={styles.arrangerRows}>
        {patterns.map(pattern => (
          <div key={pattern.id} className={styles.arrangerRow}>
            <div className={styles.arrangerRowLabel} title={pattern.name}>
              {pattern.name}
            </div>
            {Array.from({ length: TOTAL_BARS }, (_, bar) => {
              const filled = blockMap[bar] === pattern.id;
              const isCurrentBar = bar === currentBar && songMode;
              return (
                <div
                  key={bar}
                  className={[
                    styles.arrangerCell,
                    filled ? styles.arrangerCellFilled : "",
                    bar % 4 === 0 ? styles.arrangerCellGroup : "",
                    isCurrentBar ? styles.arrangerCellCurrent : "",
                  ].join(" ")}
                  style={filled ? { "--arr-color": "#a78bfa" } : undefined}
                  onMouseDown={(e) => handleCellDown(bar, e)}
                  onMouseEnter={() => handleCellEnter(bar)}
                  title={`${pattern.name} — Bar ${bar + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
