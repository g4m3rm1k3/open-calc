import { useState } from "react";
import styles from "./HtmlLab.module.css";
import { createGrid, resizeGrid, extendRight, extendDown, shrinkRight, shrinkDown, setCellContent, buildTableElements } from "./tableBuilder";
import type { LabElement } from "./types";

interface Props {
  onInsert: (template: LabElement[]) => void;
  onClose: () => void;
}

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;
const MAX_ROWS = 20;
const MAX_COLS = 12;

export default function TableBuilderModal({ onInsert, onClose }: Props) {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [hasHeader, setHasHeader] = useState(true);
  const [grid, setGrid] = useState(() => createGrid(DEFAULT_ROWS, DEFAULT_COLS));

  const updateDims = (nextRows: number, nextCols: number): void => {
    const r = Math.max(1, Math.min(MAX_ROWS, nextRows || 1));
    const c = Math.max(1, Math.min(MAX_COLS, nextCols || 1));
    setRows(r);
    setCols(c);
    setGrid((g) => resizeGrid(g, r, c));
  };

  return (
    <div className={styles.exPickerOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.exPickerBox}>
        <div className={styles.exPickerHeader}>
          <span>Build a Table</span>
          <button className={styles.exPickerClose} onClick={onClose} type="button">✕</button>
        </div>

        <div className={styles.tbControls}>
          <label className={styles.tbControlField}>
            Rows
            <input
              type="number"
              min={1}
              max={MAX_ROWS}
              value={rows}
              onChange={(e) => updateDims(Number(e.target.value), cols)}
            />
          </label>
          <label className={styles.tbControlField}>
            Columns
            <input
              type="number"
              min={1}
              max={MAX_COLS}
              value={cols}
              onChange={(e) => updateDims(rows, Number(e.target.value))}
            />
          </label>
          <label className={styles.tbHeaderToggle}>
            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
            Include header row
          </label>
        </div>

        <div className={styles.tbGridWrap}>
          <div className={styles.tbGrid} style={{ gridTemplateColumns: `repeat(${cols}, minmax(64px, 1fr))` }}>
            {grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell.covered) return null;
                const isHeaderCell = hasHeader && r === 0;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${styles.tbCell} ${isHeaderCell ? styles.tbCellHeader : ""}`}
                    style={{ gridColumn: `span ${cell.colSpan}`, gridRow: `span ${cell.rowSpan}` }}
                  >
                    <input
                      type="text"
                      className={styles.tbCellInput}
                      value={cell.content}
                      placeholder={isHeaderCell ? `Header ${c + 1}` : "Cell"}
                      onChange={(e) => setGrid((g) => setCellContent(g, r, c, e.target.value))}
                      onMouseDown={(e) => e.stopPropagation()}
                    />

                    {cell.rowSpan === 1 && (cell.colSpan > 1 || c + cell.colSpan < cols) && (
                      <div className={`${styles.tbExtendGroup} ${styles.tbExtendGroupRight}`}>
                        {cell.colSpan > 1 && (
                          <button
                            type="button"
                            className={styles.tbExtendBtn}
                            title="Shrink column span"
                            onClick={() => setGrid((g) => shrinkRight(g, r, c))}
                          >◀</button>
                        )}
                        {c + cell.colSpan < cols && (
                          <button
                            type="button"
                            className={styles.tbExtendBtn}
                            title="Merge with cell to the right"
                            onClick={() => setGrid((g) => extendRight(g, r, c))}
                          >▶</button>
                        )}
                      </div>
                    )}

                    {cell.colSpan === 1 && (cell.rowSpan > 1 || r + cell.rowSpan < rows) && (
                      <div className={`${styles.tbExtendGroup} ${styles.tbExtendGroupDown}`}>
                        {cell.rowSpan > 1 && (
                          <button
                            type="button"
                            className={styles.tbExtendBtn}
                            title="Shrink row span"
                            onClick={() => setGrid((g) => shrinkDown(g, r, c))}
                          >▲</button>
                        )}
                        {r + cell.rowSpan < rows && (
                          <button
                            type="button"
                            className={styles.tbExtendBtn}
                            title="Merge with cell below"
                            onClick={() => setGrid((g) => extendDown(g, r, c))}
                          >▼</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className={styles.tbFooter}>
          <button type="button" className={styles.tbCancelBtn} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={styles.tbInsertBtn}
            onClick={() => onInsert(buildTableElements(grid, hasHeader))}
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
}
