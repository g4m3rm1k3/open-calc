// Tests for the Table Builder's pure grid model. The modal only shows an extend
// button when a move is legal, but these functions are the actual source of
// truth — if they're wrong, a bug here means a corrupted table structure that
// only shows up after clicking around the UI in exactly the right order.

import { describe, it, expect } from "vitest";
import { createGrid, resizeGrid, extendRight, extendDown, shrinkRight, setCellContent, buildTableElements } from "./tableBuilder";

describe("buildTableElements — no merges", () => {
  it("puts row 0 in a <thead> of <th> and the rest in a <tbody> of <td>, with no span attrs", () => {
    const grid = createGrid(3, 2);
    const elements = buildTableElements(grid, true);

    const table = elements.find((e) => e.tag === "table")!;
    expect(table).toBeDefined();
    expect(elements.filter((e) => e.tag === "thead")).toHaveLength(1);
    expect(elements.filter((e) => e.tag === "tbody")).toHaveLength(1);
    expect(elements.filter((e) => e.tag === "tr")).toHaveLength(3);
    expect(elements.filter((e) => e.tag === "th")).toHaveLength(2);
    expect(elements.filter((e) => e.tag === "td")).toHaveLength(4);
    for (const cell of elements.filter((e) => e.tag === "th" || e.tag === "td")) {
      expect(cell.attrs.colspan).toBeUndefined();
      expect(cell.attrs.rowspan).toBeUndefined();
    }
  });

  it("omits <thead> entirely when hasHeader is false", () => {
    const grid = createGrid(2, 2);
    const elements = buildTableElements(grid, false);
    expect(elements.filter((e) => e.tag === "thead")).toHaveLength(0);
    expect(elements.filter((e) => e.tag === "tbody")).toHaveLength(1);
    expect(elements.filter((e) => e.tag === "td")).toHaveLength(4);
  });
});

describe("extendRight — column merging", () => {
  it("extending twice produces colspan=3 and excludes the two absorbed cells", () => {
    let grid = createGrid(1, 4);
    grid = extendRight(grid, 0, 0);
    grid = extendRight(grid, 0, 0);

    expect(grid[0][0].colSpan).toBe(3);
    expect(grid[0][1].covered).toBe(true);
    expect(grid[0][2].covered).toBe(true);
    expect(grid[0][3].covered).toBe(false);

    const elements = buildTableElements(grid, false);
    const cells = elements.filter((e) => e.tag === "td");
    expect(cells).toHaveLength(2); // the spanning cell + the one untouched cell
    expect(cells[0].attrs.colspan).toBe("3");
  });

  it("refuses to extend past the last column", () => {
    const grid = createGrid(1, 2);
    const extended = extendRight(grid, 0, 1); // last column, nothing to absorb
    expect(extended).toBe(grid); // no-op, same reference
  });

  it("shrinkRight undoes an extend and un-covers the freed cell", () => {
    let grid = createGrid(1, 3);
    grid = extendRight(grid, 0, 0);
    grid = shrinkRight(grid, 0, 0);
    expect(grid[0][0].colSpan).toBe(1);
    expect(grid[0][1].covered).toBe(false);
  });
});

describe("extendDown — one axis at a time", () => {
  it("is rejected on a cell that already has colSpan > 1", () => {
    let grid = createGrid(3, 3);
    grid = extendRight(grid, 0, 0); // colSpan now 2
    const attempt = extendDown(grid, 0, 0);
    expect(attempt).toBe(grid); // no-op — can't span both axes on one cell
  });

  it("succeeds on a plain cell and produces rowspan=2", () => {
    let grid = createGrid(3, 2);
    grid = extendDown(grid, 0, 0);
    expect(grid[0][0].rowSpan).toBe(2);
    expect(grid[1][0].covered).toBe(true);

    const elements = buildTableElements(grid, false);
    const firstRowFirstCell = elements.find((e) => e.tag === "td" && e.attrs.rowspan === "2");
    expect(firstRowFirstCell).toBeDefined();
  });
});

describe("resizeGrid — clamping instead of dangling spans", () => {
  it("shrinking columns clamps a cell's colSpan down to the new bound", () => {
    let grid = createGrid(2, 4);
    grid = extendRight(grid, 0, 0);
    grid = extendRight(grid, 0, 0); // colSpan=3 across columns 0-2
    grid = resizeGrid(grid, 2, 2); // shrink to 2 columns — only room for colSpan 2

    expect(grid[0][0].colSpan).toBe(2);
    expect(grid[0][1].covered).toBe(true);
    // No cell beyond the new bounds, and no orphaned covered flags anywhere.
    expect(grid[0]).toHaveLength(2);
    const elements = buildTableElements(grid, false);
    // Row 0: one spanning cell (colspan=2). Row 1: two untouched plain cells.
    expect(elements.filter((e) => e.tag === "td")).toHaveLength(3);
  });

  it("growing adds plain, unmerged cells", () => {
    const grid = resizeGrid(createGrid(1, 1), 2, 2);
    expect(grid).toHaveLength(2);
    expect(grid[1]).toHaveLength(2);
    expect(grid[1][1]).toEqual({ rowSpan: 1, colSpan: 1, covered: false, content: "" });
  });
});

describe("setCellContent — typed text", () => {
  it("is used verbatim when set, instead of the placeholder", () => {
    let grid = createGrid(1, 1);
    grid = setCellContent(grid, 0, 0, "Total Revenue");
    const elements = buildTableElements(grid, false);
    expect(elements.find((e) => e.tag === "td")!.content).toBe("Total Revenue");
  });

  it("falls back to the placeholder when left blank", () => {
    const grid = createGrid(1, 1);
    const elements = buildTableElements(grid, true);
    expect(elements.find((e) => e.tag === "th")!.content).toBe("Header 1");
  });

  it("falls back to the placeholder when set to only whitespace", () => {
    let grid = createGrid(1, 1);
    grid = setCellContent(grid, 0, 0, "   ");
    const elements = buildTableElements(grid, false);
    expect(elements.find((e) => e.tag === "td")!.content).toBe("Cell");
  });
});
