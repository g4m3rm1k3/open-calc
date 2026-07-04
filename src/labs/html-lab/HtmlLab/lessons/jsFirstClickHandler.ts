import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// First JS/DOM lesson — a small standalone widget (not chained to the
// HTML/CSS pages) so the whole lesson stays short. Exercises the
// `javascript`-text playback path (the script "types" itself in on its own
// step, auto-focusing the JavaScript tab) and a `behavior`-validated
// challenge, which the earlier HTML/CSS lessons never touch.
export const jsFirstClickHandler: Lesson = {
  id: "js-first-click-handler",
  title: "Your First Click Handler",
  description: "Wire up a button with addEventListener and change the page in response to a click.",
  topic: "js",
  unit: "Events & the DOM",
  steps: [
    {
      id: "intro-widget",
      title: "A button that does nothing — yet",
      instructions:
        "Here's a button and a message. Right now clicking the button does absolutely nothing — HTML and CSS can't react to a click, only JavaScript can. That's what we're adding next.",
      patch: {
        elements: [
          el("widget-h1", "h1", null, 0, "Click Me", {}, { fontSize: "22px", margin: "0 0 12px", color: "#0f172a" }),
          el("toggleBtn", "button", null, 1, "Highlight", { id: "toggleBtn" }, {
            padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px",
          }),
          el("msg", "p", null, 2, "Nothing has happened yet.", { id: "msg" }, { marginTop: "16px", color: "#334155" }),
        ],
      },
    },
    {
      id: "add-highlight-style",
      title: "A CSS class the script can toggle",
      instructions:
        "JavaScript doesn't usually write styles directly — it adds or removes a CSS class, and the class does the styling. Here's `.highlight`, sitting unused until something applies it.",
      patch: {
        customCss: ".highlight {\n  background: #fef08a;\n  padding: 4px 8px;\n  border-radius: 4px;\n}",
      },
    },
    {
      id: "add-click-handler",
      title: "addEventListener connects the two",
      instructions:
        "`addEventListener('click', ...)` runs a function every time the button is clicked. Inside it, `classList.toggle('highlight')` adds the class if it's missing and removes it if it's already there — flipping the message's look on every click.",
      patch: {
        javascript:
          "document.getElementById('toggleBtn').addEventListener('click', () => {\n  document.getElementById('msg').classList.toggle('highlight');\n});",
      },
    },
    {
      id: "challenge-clear-button",
      title: "Your turn: wire up Clear",
      instructions:
        "A \"Clear\" button has appeared next to Highlight. Write the JavaScript to make clicking it remove the `highlight` class from the message — use `classList.remove('highlight')`, not `toggle`, so Clear always turns it off no matter what state it's in.",
      isChallenge: true,
      patch: {
        elements: [
          el("clearBtn", "button", null, 3, "Clear", { id: "clearBtn" }, {
            padding: "8px 16px", marginLeft: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px",
          }),
        ],
      },
      hint: "document.getElementById('clearBtn').addEventListener('click', () => { ... }) — inside, call classList.remove('highlight') on the #msg element, same way the Highlight button reaches it.",
      behavior: {
        interactions: [
          { selector: "#toggleBtn", action: "click" },
          { selector: "#clearBtn", action: "click" },
        ],
        assertions: [
          { selector: "#msg", property: "className", expected: "" },
        ],
      },
      solutionPatch: {
        javascript:
          "document.getElementById('toggleBtn').addEventListener('click', () => {\n  document.getElementById('msg').classList.toggle('highlight');\n});\n\ndocument.getElementById('clearBtn').addEventListener('click', () => {\n  document.getElementById('msg').classList.remove('highlight');\n});",
      },
    },
  ],
};
