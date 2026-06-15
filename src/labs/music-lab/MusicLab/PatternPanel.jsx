import { useState } from "react";
import styles from "./MusicLab.module.css";

export default function PatternPanel({ patterns, activePatternId, onSwitch, onAdd, onDuplicate, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startRename = (p, e) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditVal(p.name);
  };

  const commitRename = () => {
    if (editVal.trim()) onRename(editingId, editVal.trim());
    setEditingId(null);
  };

  return (
    <div className={styles.patternPanel}>
      <div className={styles.patternPanelHeader}>
        <span className={styles.patternPanelTitle}>Patterns</span>
        <div className={styles.patternPanelBtns}>
          <button className={styles.patternHeaderBtn} onClick={onAdd} title="New blank pattern">+ New</button>
          <button className={styles.patternHeaderBtn} onClick={onDuplicate} title="Duplicate active pattern">⧉ Dup</button>
        </div>
      </div>
      <div className={styles.patternList}>
        {patterns.map((p, idx) => (
          <div
            key={p.id}
            className={`${styles.patternItem} ${p.id === activePatternId ? styles.patternItemActive : ""}`}
            onClick={() => onSwitch(p.id)}
          >
            <span className={styles.patternIndex}>{idx + 1}</span>
            {editingId === p.id ? (
              <input
                className={styles.patternNameInput}
                value={editVal}
                autoFocus
                onChange={(e) => setEditVal(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={styles.patternName}
                onDoubleClick={(e) => startRename(p, e)}
                title="Double-click to rename"
              >
                {p.name}
              </span>
            )}
            <button
              className={styles.patternDeleteBtn}
              onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
              disabled={patterns.length <= 1}
              title="Delete pattern"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
