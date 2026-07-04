import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the JS track — before "Your First Click
// Handler" (which assumes you already know what a variable or function is),
// this teaches let/const and functions from zero, on a small counter widget.
// Kept DOM-connected throughout rather than using abstract console.log
// examples — this tool's whole value is a visible page reacting, so every
// concept lands through something the student can watch happen.
export const jsFoundationsVariables: Lesson = {
  id: "js-foundations-variables",
  title: "Variables, Functions & Events",
  description: "let, const, and functions — the basics of JavaScript, taught through a page that actually reacts.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "intro-counter",
      title: "A button that (for now) does nothing",
      instructions:
        "A heading, a number, and a button — plain HTML and CSS can't make the button change the number. That takes JavaScript, which is what the rest of this lesson builds.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Counter", {}, { fontSize: "22px", margin: "0 0 12px", color: "#0f172a" }),
          el("display", "p", null, 1, "0", { id: "display" }, { fontSize: "36px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px" }),
          el("incrementBtn", "button", null, 2, "+1", { id: "incrementBtn" }, { padding: "8px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
      },
    },
    {
      id: "variables-hold-values",
      title: "A variable is a labeled box holding a value",
      instructions:
        "`const display = document.getElementById('display');` creates a variable named `display` and puts a reference to that paragraph inside it — now writing `display` anywhere means \"that element,\" instead of writing the long `document.getElementById(...)` line every time. Use `const` when what's inside the box won't be swapped out later. `let count = 0;` is a second variable — a number this time, and one that WILL change, which is exactly what `let` is for.",
      patch: {
        javascript: "const display = document.getElementById('display');\nlet count = 0;",
      },
    },
    {
      id: "functions-and-events",
      title: "Functions run code; events say when",
      instructions:
        "`document.getElementById('incrementBtn').addEventListener('click', () => { ... })` attaches a function — a reusable block of instructions — to the button's click event. Every time it's clicked, the code inside the `{ }` runs: add one to `count`, then update the paragraph's `textContent` to match.",
      patch: {
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n});",
      },
    },
    {
      id: "challenge-reset-button",
      title: "Your turn: wire up Reset",
      instructions:
        "A \"Reset\" button has appeared. Write the JavaScript so clicking it sets `count` back to `0` and updates the display to match — same pattern as the increment button, a different job.",
      isChallenge: true,
      patch: {
        elements: [
          el("resetBtn", "button", null, 3, "Reset", { id: "resetBtn" }, { padding: "8px 20px", marginLeft: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
        ],
      },
      hint: "document.getElementById('resetBtn').addEventListener('click', () => { count = 0; display.textContent = count; }); — you can reuse the `count` and `display` variables already declared above; no need to redeclare them.",
      behavior: {
        interactions: [
          { selector: "#incrementBtn", action: "click" },
          { selector: "#incrementBtn", action: "click" },
          { selector: "#resetBtn", action: "click" },
        ],
        assertions: [
          { selector: "#display", property: "textContent", expected: "0" },
        ],
      },
      solutionPatch: {
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n});",
      },
    },
  ],
};
