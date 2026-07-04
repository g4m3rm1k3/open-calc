import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// A small standalone widget (not chained to the HTML/CSS pages) reviewing
// addEventListener from "Variables, Functions & Events," and introducing
// classList as its own dedicated idea before combining it with a click.
export const jsFirstClickHandler: Lesson = {
  id: "js-first-click-handler",
  title: "Your First Click Handler",
  description: "Review addEventListener, then learn classList — toggling a CSS class from JavaScript.",
  topic: "js",
  unit: "Events & the DOM",
  steps: [
    {
      id: "intro-widget",
      title: "A button that does nothing — yet",
      instructions:
        "Here's a button and a message. Right now clicking the button does absolutely nothing — HTML and CSS can't react to a click, only JavaScript can. That's what the rest of this lesson adds.",
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
      title: "A CSS class the script can turn on and off",
      instructions:
        "JavaScript almost never writes styles directly, property by property — instead, it adds or removes a CSS CLASS, and the class itself does the actual styling. Here's `.highlight`, a class that isn't attached to anything yet, sitting ready for the next few steps to apply.",
      patch: {
        cssBlocks: [{ id: "highlight-class", code: ".highlight {\n  background: #fef08a;\n  padding: 4px 8px;\n  border-radius: 4px;\n}" }],
      },
    },
    {
      id: "what-is-classlist",
      title: "classList lets JavaScript add or remove a class",
      instructions:
        "Every element has a `.classList` property — think of it as the live list of CSS classes currently applied to that element. `.classList.add('highlight')` puts the class on, `.classList.remove('highlight')` takes it off, and `.classList.toggle('highlight')` is a shortcut for \"whichever of those two makes sense right now\" — it adds the class if the element doesn't have it, and removes it if the element already does.",
      patch: {},
    },
    {
      id: "add-click-handler",
      title: "Put it together: toggle the class on click",
      instructions:
        "`document.getElementById('toggleBtn').addEventListener('click', () => { document.getElementById('msg').classList.toggle('highlight'); })` combines everything so far: when the button is clicked, the message's `highlight` class flips — on if it was off, off if it was on — which is exactly what makes the message's background flash yellow and back on every click.",
      patch: {
        jsBlocks: [{
          id: "toggle-handler",
          code: "document.getElementById('toggleBtn').addEventListener('click', () => {\n  document.getElementById('msg').classList.toggle('highlight');\n});",
        }],
      },
    },
    {
      id: "challenge-clear-button",
      title: "Your turn: wire up Clear",
      instructions:
        "A \"Clear\" button has appeared next to Highlight. Write the JavaScript so clicking it removes the `highlight` class from the message — this time use `.classList.remove('highlight')` specifically, not `.toggle()`, so Clear reliably turns the highlight off no matter what state it was already in.",
      isChallenge: true,
      patch: {
        elements: [
          el("clearBtn", "button", null, 3, "Clear", { id: "clearBtn" }, {
            padding: "8px 16px", marginLeft: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px",
          }),
        ],
      },
      hint: "document.getElementById('clearBtn').addEventListener('click', () => { document.getElementById('msg').classList.remove('highlight'); }); — same addEventListener shape as the Highlight button, .classList.remove() instead of .toggle().",
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
        jsBlocks: [{
          id: "clear-handler",
          code: "document.getElementById('clearBtn').addEventListener('click', () => {\n  document.getElementById('msg').classList.remove('highlight');\n});",
        }],
      },
    },
  ],
};
