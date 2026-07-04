import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// The actual starting point of the JS track. Rewritten to teach one idea per
// step instead of bundling several into one short paragraph — a beginner
// hitting `document.getElementById`, `const`/`let`, functions, and
// addEventListener all in one four-sentence step has no real chance of
// absorbing any of it. Every new API is now introduced with a plain-language
// explanation and a concrete example BEFORE it's combined with anything
// else. JS is written as named `jsBlocks` (one block per handler/decl) so a
// later step only ever adds or changes ONE block, never retypes everything.
export const jsFoundationsVariables: Lesson = {
  id: "js-foundations-variables",
  title: "Variables, Functions & Events",
  description: "let, const, functions, and addEventListener — one idea at a time, taught through a page that actually reacts.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "intro-counter",
      title: "A button that (for now) does nothing",
      instructions:
        "Here's a heading, a number, and a button. Right now, clicking the button does nothing at all — HTML describes structure and CSS describes appearance, but neither one can make anything happen in response to an action like a click. Only JavaScript can react to things happening. That's the whole subject of this lesson: making this button actually do something.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Counter", {}, { fontSize: "22px", margin: "0 0 12px", color: "#0f172a" }),
          el("display", "p", null, 1, "0", { id: "display" }, { fontSize: "36px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px" }),
          el("incrementBtn", "button", null, 2, "+1", { id: "incrementBtn" }, { padding: "8px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
      },
    },
    {
      id: "what-is-a-variable",
      title: "A variable is a labeled box holding a value",
      instructions:
        "Picture an actual labeled box you could hold in your hands. You put something inside it — a number, some text, anything — and from then on, instead of remembering what's inside, you just look at the label and it's there. A variable in code is exactly that idea: `let score = 0;` creates a box named `score` and puts the number `0` inside it. From that line on, writing `score` anywhere else in the code means \"whatever is currently in that box\" — and if you later write `score = 5;`, every future use of `score` reflects the new value, without you having to go hunt down and change anything else.",
      patch: {},
    },
    {
      id: "const-vs-let",
      title: "const locks the box; let leaves it open",
      instructions:
        "`const` and `let` both create a variable the same way — the difference is whether you're allowed to put something new in the box afterward. `const score = 0;` locks the box: write `score = 5;` on a later line and JavaScript stops you with an error, because `const` is a promise that this box's contents will never change once set. `let score = 0;` leaves the box unlocked, so `score = 5;` later on works fine. A sensible default is to reach for `const` first, and only switch to `let` when you already know the value is going to need to change later — like a running total, or a counter that goes up every time a button is clicked.",
      patch: {},
    },
    {
      id: "reaching-into-the-page",
      title: "document.getElementById finds one thing on the page",
      instructions:
        "Every element on this page — the heading, the number, the button — is something JavaScript can reach, read, and change, because the browser keeps a live, structured copy of the whole page available to code. That structure is called the DOM (the Document Object Model), and `document` is how you talk to it from JavaScript. `document.getElementById('display')` searches the entire DOM for the one element whose `id` attribute is exactly `\"display\"` — that's the number paragraph from the first step, since it was given `id=\"display\"` when it was built — and hands that element back to you so your code can use it.",
      patch: {},
    },
    {
      id: "storing-the-element",
      title: "Combine both ideas: save the element in a variable",
      instructions:
        "Put the last two ideas together. `const display = document.getElementById('display');` looks up the number paragraph ONCE, then stores a reference to it in a variable named `display` — from here on, writing `display` anywhere in the code means \"that exact paragraph,\" which is a lot shorter than writing `document.getElementById('display')` every single time it's needed. `let count = 0;` is a second, separate variable — an ordinary number, starting at zero — declared with `let` specifically because, unlike `display`, its value is about to start changing every time the button is clicked.",
      patch: {
        jsBlocks: [{ id: "counter-setup", code: "const display = document.getElementById('display');\nlet count = 0;" }],
      },
    },
    {
      id: "what-is-a-function",
      title: "A function is a saved set of instructions",
      instructions:
        "A function bundles up a block of code so it can be run later, on command, as many times as needed, without retyping it. `() => { ... }` is how modern JavaScript writes one kind of function, called an arrow function: the `()` is where any inputs would be listed (this one needs none, so it's empty), and everything between `{ }` is the actual instructions that run each time the function is called. On its own, writing a function doesn't run it — something else has to actually call it, which is exactly what the next step does.",
      patch: {},
    },
    {
      id: "listening-for-clicks",
      title: "addEventListener: run a function WHEN something happens",
      instructions:
        "An event is something that happens on the page — a click, a key press, a page finishing loading. `someElement.addEventListener('click', someFunction)` tells the browser \"when this element gets clicked, run this function\" — it doesn't run the function right away, it just remembers to, for every click from now on. Here, clicking `incrementBtn` runs a function that adds `1` to `count` and then sets `display.textContent` — the paragraph's visible text — to match the new value. `.textContent` is how you read or change the text inside an element from JavaScript. Click the button a few times now and watch the number actually change — this is the first thing in the whole lesson JavaScript can take real credit for.",
      patch: {
        jsBlocks: [{
          id: "increment-handler",
          code: "document.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n});",
        }],
      },
    },
    {
      id: "challenge-reset-button",
      title: "Your turn: wire up Reset",
      instructions:
        "A \"Reset\" button has appeared next to Increment. Write the JavaScript so clicking it sets `count` back to `0` and updates `display.textContent` to match — the exact same two-step pattern as the increment handler (change the variable, then update the text), just resetting instead of adding.",
      isChallenge: true,
      patch: {
        elements: [
          el("resetBtn", "button", null, 3, "Reset", { id: "resetBtn" }, { padding: "8px 20px", marginLeft: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
        ],
      },
      hint: "document.getElementById('resetBtn').addEventListener('click', () => { count = 0; display.textContent = count; }); — reuse the `count` and `display` variables already declared earlier; there's no need to declare them again.",
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
        jsBlocks: [{
          id: "reset-handler",
          code: "document.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n});",
        }],
      },
    },
  ],
};
