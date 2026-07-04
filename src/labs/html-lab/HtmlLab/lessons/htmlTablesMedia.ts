import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Fourth HTML lesson — a small class-schedule page. Tables and images are
// two of the most commonly misused areas of HTML (divs styled to look like
// grids instead of real <table>s; images with no alt text at all). "What is
// a table," the header row, alt text, and <figure> each get their own step.
const CELL = { padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "left" as const };

export const htmlTablesMedia: Lesson = {
  id: "html-tables-media",
  title: "Tables for Real Data",
  description: "table, thead/th, tbody/td, alt text, and figure — one idea at a time, on a class schedule.",
  topic: "html",
  unit: "Tables & Media",
  steps: [
    {
      id: "what-is-a-table",
      title: "Rows and columns of related data is a <table>",
      instructions:
        "Rows and columns that actually relate to each other — a schedule, a price list, a spreadsheet — belong in a real `<table>`, not a grid of styled `<div>`s pretending to be one. A real table gives a screen reader the ability to announce which row and column a cell belongs to; a div grid never can.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Studio Class Schedule", {}, { fontSize: "26px", margin: "0 0 16px", color: "#0f172a" }),
          el("schedule", "table", null, 1, "", {}, { borderCollapse: "collapse", width: "100%", color: "#334155" }),
        ],
      },
    },
    {
      id: "table-header-row",
      title: "The header row: <thead> and <th>",
      instructions:
        "`<thead>` holds the header row — the one naming what each column IS, rather than any actual data. Cells inside it are `<th>` (table header), not `<td>` — a different tag specifically because a header cell means something different from a data cell, the same way `<h1>` means something different from `<p>`.",
      patch: {
        elements: [
          el("thead", "thead", "schedule", 0, "", {}, {}),
          el("head-row", "tr", "thead", 0, "", {}, {}),
          el("th-day", "th", "head-row", 0, "Day", {}, { ...CELL, borderBottom: "2px solid #0f172a", fontWeight: "700" }),
          el("th-time", "th", "head-row", 1, "Time", {}, { ...CELL, borderBottom: "2px solid #0f172a", fontWeight: "700" }),
          el("th-class", "th", "head-row", 2, "Class", {}, { ...CELL, borderBottom: "2px solid #0f172a", fontWeight: "700" }),
        ],
      },
    },
    {
      id: "add-tbody-rows",
      title: "The actual data: <tbody>, <tr>, and <td>",
      instructions:
        "Every real row of data lives inside `<tbody>` — a sibling of `<thead>`, not nested inside it. Each row is a `<tr>` (table row), and each cell this time is `<td>` (table data) rather than `<th>`, since these cells hold actual values, not column names.",
      patch: {
        elements: [
          el("tbody", "tbody", "schedule", 1, "", {}, {}),
          el("row1", "tr", "tbody", 0, "", {}, {}),
          el("row1-day", "td", "row1", 0, "Monday", {}, CELL),
          el("row1-time", "td", "row1", 1, "6:00 PM", {}, CELL),
          el("row1-class", "td", "row1", 2, "Vinyasa Flow", {}, CELL),
          el("row2", "tr", "tbody", 1, "", {}, {}),
          el("row2-day", "td", "row2", 0, "Wednesday", {}, CELL),
          el("row2-time", "td", "row2", 1, "7:30 PM", {}, CELL),
          el("row2-class", "td", "row2", 2, "Power Yoga", {}, CELL),
        ],
      },
    },
    {
      id: "challenge-third-row",
      title: "Your turn: add a row",
      instructions:
        "Add one more `<tr>` to `<tbody>` — a Friday class, whatever you'd like — with three `<td>` cells: day, time, and class name.",
      isChallenge: true,
      patch: {},
      hint: "Add a new <tr> as a child of the existing <tbody> (not <thead>), with three <td> children inside it, same shape as the two rows already there.",
      expected: [
        { tag: "h1" },
        {
          tag: "table",
          children: [
            { tag: "thead" },
            { tag: "tbody", children: [{ tag: "tr" }, { tag: "tr" }, { tag: "tr" }] },
          ],
        },
      ],
      solutionPatch: {
        elements: [
          el("row3", "tr", "tbody", 2, "", {}, {}),
          el("row3-day", "td", "row3", 0, "Friday", {}, CELL),
          el("row3-time", "td", "row3", 1, "5:30 PM", {}, CELL),
          el("row3-class", "td", "row3", 2, "Restorative", {}, CELL),
        ],
      },
    },
    {
      id: "img-alt-text",
      title: "An image's alt text is what a screen reader says instead",
      instructions:
        "`<img>`'s `alt` attribute isn't optional decoration — for someone who can't see the image, it's what gets read out loud INSTEAD of the picture. That means it should actually describe what's in the image, specifically, the same way you'd describe it to someone over the phone.",
      patch: {
        elements: [
          el("fig1-img", "img", null, 2, "", { alt: "Sunlit studio room with wood floors and rolled-up mats along the wall", src: "" }, { width: "100%", borderRadius: "8px", background: "#e2e8f0", display: "block", aspectRatio: "16/9", marginTop: "24px" }),
        ],
      },
    },
    {
      id: "figure-and-figcaption",
      title: "<figure> groups an image with its caption",
      instructions:
        "When an image has a visible caption underneath it, `<figure>` wraps both the `<img>` and a `<figcaption>` together as one unit — telling a reader (and assistive tech) that the caption belongs to that specific image, not just to whatever happens to be nearby on the page.",
      patch: {
        elements: [
          el("fig1", "figure", null, 2, "", {}, { margin: "24px 0 0" }),
          el("fig1-img", "img", "fig1", 0, "", { alt: "Sunlit studio room with wood floors and rolled-up mats along the wall", src: "" }, { width: "100%", borderRadius: "8px", background: "#e2e8f0", display: "block", aspectRatio: "16/9" }),
          el("fig1-caption", "figcaption", "fig1", 1, "Our studio on a quiet Tuesday morning.", {}, { fontSize: "13px", color: "#64748b", marginTop: "6px" }),
        ],
      },
    },
    {
      id: "challenge-second-figure",
      title: "Your turn: a second figure",
      instructions:
        "Add one more `<figure>` — another `<img>` with meaningful `alt` text describing a different part of the studio, plus its own `<figcaption>`.",
      isChallenge: true,
      patch: {},
      hint: "Copy the shape of the first <figure>: a <figure> containing one <img> (with a real, descriptive alt attribute) and one <figcaption>.",
      expected: [
        { tag: "h1" },
        { tag: "table" },
        { tag: "figure", children: [{ tag: "img" }, { tag: "figcaption" }] },
        { tag: "figure", children: [{ tag: "img" }, { tag: "figcaption" }] },
      ],
      solutionPatch: {
        elements: [
          el("fig2", "figure", null, 3, "", {}, { margin: "16px 0 0" }),
          el("fig2-img", "img", "fig2", 0, "", { alt: "Front desk with a wall of neatly folded towels and a water station", src: "" }, { width: "100%", borderRadius: "8px", background: "#e2e8f0", display: "block", aspectRatio: "16/9" }),
          el("fig2-caption", "figcaption", "fig2", 1, "Check in here — towels and water are always free.", {}, { fontSize: "13px", color: "#64748b", marginTop: "6px" }),
        ],
      },
    },
  ],
};
