import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Fourth HTML lesson — a small class-schedule page. Tables and images are
// two of the most commonly misused areas of HTML (divs styled to look like
// grids instead of real <table>s; images with no alt text at all), so this
// is entirely about "use the real structural tag instead of faking it."
// Two challenges again: extend the table mid-lesson, add a second figure at
// the end.
const CELL = { padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "left" as const };

export const htmlTablesMedia: Lesson = {
  id: "html-tables-media",
  title: "Tables for Real Data",
  description: "Build a real class schedule with <table>, then add images the right way with <figure> and alt text.",
  topic: "html",
  unit: "Tables & Media",
  steps: [
    {
      id: "intro-table",
      title: "A grid of related data is a <table>",
      instructions:
        "Rows and columns that actually relate to each other — a schedule, a price list, a spreadsheet — belong in a real `<table>`, not a grid of styled `<div>`s. `<thead>` holds the header row, and each header cell is a `<th>`, not a `<td>`.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Studio Class Schedule", {}, { fontSize: "26px", margin: "0 0 16px", color: "#0f172a" }),
          el("schedule", "table", null, 1, "", {}, { borderCollapse: "collapse", width: "100%", color: "#334155" }),
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
      title: "The data itself goes in <tbody>",
      instructions:
        "Every actual row of data lives inside `<tbody>` — a sibling of `<thead>`, not nested inside it. Each row is a `<tr>`, and this time the cells are `<td>` (table data), not `<th>`.",
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
      id: "add-figure",
      title: "An image needs <figure>, <figcaption>, and real alt text",
      instructions:
        "`<img>`'s `alt` attribute isn't optional decoration — it's what a screen reader says instead of the picture, so it should describe what's actually in the image. When an image has a caption, `<figure>` wraps both the `<img>` and a `<figcaption>` together as one unit.",
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
