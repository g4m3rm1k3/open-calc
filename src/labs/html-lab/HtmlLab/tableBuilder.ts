import type { LabElement } from "./types";

// ─── Grid model ─────────────────────────────────────────────────────────────────
//
// A cell can span rows OR columns, never both at once — extending one axis is
// blocked while the other is already spanning. This keeps merge validity a
// single-cell check (is the one adjacent slot plain and free?) instead of an
// arbitrary-rectangle check, at the cost of not supporting a true 2D block merge.

export interface BuilderCell {
  rowSpan: number;
  colSpan: number;
  covered: boolean; // absorbed by another cell's span — not rendered as its own element
  content: string;  // user-typed text; empty string falls back to a placeholder when built
}

export type BuilderGrid = BuilderCell[][]; // [row][col]

export function createGrid(rows: number, cols: number): BuilderGrid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): BuilderCell => ({ rowSpan: 1, colSpan: 1, covered: false, content: "" })),
  );
}

export function setCellContent(grid: BuilderGrid, r: number, c: number, content: string): BuilderGrid {
  const next = cloneGrid(grid);
  next[r][c] = { ...next[r][c], content };
  return next;
}

function cloneGrid(grid: BuilderGrid): BuilderGrid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

// Resizes to new dimensions, clamping any span that would now overrun the new
// bounds. `covered` is fully recomputed from the (clamped) anchors afterward,
// rather than carried over, so a clamp can never leave an orphaned covered cell.
export function resizeGrid(grid: BuilderGrid, rows: number, cols: number): BuilderGrid {
  const oldRows = grid.length;
  const oldCols = grid[0]?.length ?? 0;

  const next: BuilderGrid = [];
  for (let r = 0; r < rows; r++) {
    const row: BuilderCell[] = [];
    for (let c = 0; c < cols; c++) {
      const src = r < oldRows && c < oldCols ? grid[r][c] : { rowSpan: 1, colSpan: 1, covered: false, content: "" };
      row.push({ ...src });
    }
    next.push(row);
  }

  for (const row of next) for (const cell of row) cell.covered = false;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = next[r][c];
      if (cell.covered) continue;
      cell.rowSpan = Math.min(cell.rowSpan, rows - r);
      cell.colSpan = Math.min(cell.colSpan, cols - c);
      for (let dr = 0; dr < cell.rowSpan; dr++) {
        for (let dc = 0; dc < cell.colSpan; dc++) {
          if (dr === 0 && dc === 0) continue;
          next[r + dr][c + dc].covered = true;
        }
      }
    }
  }
  return next;
}

function isPlainAndFree(cell: BuilderCell | undefined): boolean {
  return !!cell && !cell.covered && cell.rowSpan === 1 && cell.colSpan === 1;
}

export function extendRight(grid: BuilderGrid, r: number, c: number): BuilderGrid {
  const cell = grid[r]?.[c];
  if (!cell || cell.covered || cell.rowSpan > 1) return grid;
  const targetCol = c + cell.colSpan;
  if (targetCol >= (grid[0]?.length ?? 0)) return grid;
  if (!isPlainAndFree(grid[r][targetCol])) return grid;

  const next = cloneGrid(grid);
  next[r][c].colSpan += 1;
  next[r][targetCol].covered = true;
  return next;
}

export function extendDown(grid: BuilderGrid, r: number, c: number): BuilderGrid {
  const cell = grid[r]?.[c];
  if (!cell || cell.covered || cell.colSpan > 1) return grid;
  const targetRow = r + cell.rowSpan;
  if (targetRow >= grid.length) return grid;
  if (!isPlainAndFree(grid[targetRow]?.[c])) return grid;

  const next = cloneGrid(grid);
  next[r][c].rowSpan += 1;
  next[targetRow][c].covered = true;
  return next;
}

export function shrinkRight(grid: BuilderGrid, r: number, c: number): BuilderGrid {
  const cell = grid[r]?.[c];
  if (!cell || cell.colSpan <= 1) return grid;
  const next = cloneGrid(grid);
  next[r][c].colSpan -= 1;
  next[r][c + next[r][c].colSpan].covered = false;
  return next;
}

export function shrinkDown(grid: BuilderGrid, r: number, c: number): BuilderGrid {
  const cell = grid[r]?.[c];
  if (!cell || cell.rowSpan <= 1) return grid;
  const next = cloneGrid(grid);
  next[r][c].rowSpan -= 1;
  next[r + next[r][c].rowSpan][c].covered = false;
  return next;
}

// ─── Grid → LabElement[] ────────────────────────────────────────────────────────

function tel(
  id: string,
  tag: string,
  parentId: string | null,
  order: number,
  content: string,
  attrs: Record<string, string> = {},
  styles: Record<string, string> = {},
): LabElement {
  return { id, tag, parentId, order, content, attrs: { id: "", class: "", ...attrs }, styles, mediaQueries: [] };
}

// Every element in the canvas gets wrapped in an administrative <div> (for the
// drag handle and tag-label badge) whose own `display` is read straight from
// `el.styles.display` (see CanvasPanel.tsx's renderElement). Without an explicit
// table-role `display` here, that wrapper defaults to "block" and the table
// collapses into a single stacked column instead of a grid — so every table
// element needs its CSS table role spelled out explicitly, not left to the
// browser to infer from the tag name.
const TABLE_STYLES = { width: "100%", borderCollapse: "collapse", fontSize: "14px", margin: "0 0 16px 0", display: "table" };
const THEAD_STYLES = { display: "table-header-group" };
const TBODY_STYLES = { display: "table-row-group" };
const TR_STYLES = { display: "table-row" };
const TH_STYLES = { padding: "10px", textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: "600", display: "table-cell" };
const TD_STYLES = { padding: "10px", borderBottom: "1px solid #e2e8f0", display: "table-cell" };

export function buildTableElements(grid: BuilderGrid, hasHeader: boolean): LabElement[] {
  let idCounter = 0;
  const nextId = (): string => `t${idCounter++}`;

  const orderByParent = new Map<string, number>();
  const nextOrder = (parentId: string): number => {
    const o = orderByParent.get(parentId) ?? 0;
    orderByParent.set(parentId, o + 1);
    return o;
  };

  const elements: LabElement[] = [];
  const tableId = nextId();
  elements.push(tel(tableId, "table", null, 0, "", {}, TABLE_STYLES));

  let theadId: string | null = null;
  let tbodyId: string | null = null;

  grid.forEach((row, r) => {
    const isHeaderRow = hasHeader && r === 0;

    let sectionId: string;
    if (isHeaderRow) {
      if (theadId === null) {
        theadId = nextId();
        elements.push(tel(theadId, "thead", tableId, nextOrder(tableId), "", {}, THEAD_STYLES));
      }
      sectionId = theadId;
    } else {
      if (tbodyId === null) {
        tbodyId = nextId();
        elements.push(tel(tbodyId, "tbody", tableId, nextOrder(tableId), "", {}, TBODY_STYLES));
      }
      sectionId = tbodyId;
    }

    const trId = nextId();
    elements.push(tel(trId, "tr", sectionId, nextOrder(sectionId), "", {}, TR_STYLES));

    row.forEach((cell, c) => {
      if (cell.covered) return;
      const tag = isHeaderRow ? "th" : "td";
      const attrs: Record<string, string> = {};
      if (cell.colSpan > 1) attrs.colspan = String(cell.colSpan);
      if (cell.rowSpan > 1) attrs.rowspan = String(cell.rowSpan);
      const content = cell.content.trim() || (isHeaderRow ? `Header ${c + 1}` : "Cell");
      elements.push(tel(nextId(), tag, trId, nextOrder(trId), content, attrs, isHeaderRow ? TH_STYLES : TD_STYLES));
    });
  });

  return elements;
}
