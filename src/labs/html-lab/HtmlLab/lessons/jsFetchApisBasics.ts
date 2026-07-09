import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Fresh standalone JS lesson — a "Fact of the Moment" card. Fetch/Promise/
// .then/.catch are taught end to end against a REAL public API (narrated,
// not graded — network timing genuinely can't be graded deterministically).
// The graded challenge uses a second button that fetches a `data:` URL
// instead of a network address — a completely real `fetch()` call, just
// pointed at data encoded directly in the URL rather than a server, so it's
// exactly as real but fully offline-safe and deterministic. Graded via
// `behavior` + `settleMs` (this lesson is the reason that field exists —
// see lessonEngine.ts's validateBehavior — since the click here kicks off
// real async work that has to resolve before the DOM state exists to check).
export const jsFetchApisBasics: Lesson = {
  id: "js-fetch-apis-basics",
  title: "Fetch & APIs Basics",
  description: "fetch, Promises, .then/.catch, and a real API call — one idea at a time.",
  topic: "js",
  unit: "Fetch & APIs",
  steps: [
    {
      id: "setup",
      title: "A fact card, with a button that does nothing yet",
      instructions:
        "A heading, a button, and a paragraph where a fact will eventually appear. Clicking the button doesn't do anything yet — that's what the rest of this lesson wires up.",
      patch: {
        elements: [
          el("title", "h1", null, 0, "Fact of the Moment", {}, { fontSize: "24px", margin: "0 0 16px", color: "#0f172a" }),
          el("fact-btn", "button", null, 1, "Get a Fact", { type: "button", id: "fact-btn" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
          el("factDisplay", "p", null, 2, "Click the button to load a fact.", { id: "factDisplay" }, { marginTop: "16px", color: "#334155", lineHeight: "1.6", maxWidth: "420px" }),
        ],
      },
    },
    {
      id: "what-is-an-api",
      title: "An API is a URL that answers with DATA, not a webpage",
      instructions:
        "Visiting a normal URL in a browser gets back a webpage — HTML meant to be displayed. An API is a URL meant to be requested FROM CODE instead, and it answers with raw data — almost always as JSON — for that code to use however it wants. `fetch()` is the built-in JavaScript function for making that request.",
      patch: {},
    },
    {
      id: "fetch-returns-a-promise",
      title: "fetch() can't return the data immediately — it returns a Promise",
      instructions:
        "A network request takes real time — milliseconds at least, sometimes much longer — so `fetch(url)` can't just hand back the response right away; the data doesn't exist yet at the moment that line runs. Instead it returns a PROMISE: a placeholder standing in for a value that will be filled in later. `.then(callback)` registers that callback to run once the real value actually arrives — everything after a `.then()` happens later, not immediately, even though it's written as the very next line.",
      patch: {},
    },
    {
      id: "wiring-the-real-fetch",
      title: "Put it together: a real fetch, end to end",
      instructions:
        "`fetch('https://catfact.ninja/fact')` starts the request. Its `.then(response => response.json())` reads the raw response as JSON — which is ALSO a Promise (parsing takes a moment too), so a second `.then(data => { ... })` is what actually runs once the parsed data is ready. `data.fact` is the actual fact text, written into the paragraph below. Click the button and watch a real fact load in from a real server.",
      patch: {
        jsBlocks: [{
          id: "fact-handler",
          code: "document.getElementById('fact-btn').addEventListener('click', () => {\n  fetch('https://catfact.ninja/fact')\n    .then(response => response.json())\n    .then(data => {\n      document.getElementById('factDisplay').textContent = data.fact;\n    });\n});",
        }],
      },
    },
    {
      id: "catching-errors",
      title: ".catch() handles it when the request itself fails",
      instructions:
        "A network request can fail outright — no connection, the server is down — and when it does, none of the `.then()` callbacks ever run at all. `.catch(error => { ... })`, added at the end of the chain, runs instead, exactly once, if anything earlier in the chain failed — the one place this handler deals with failure, instead of leaving a visitor staring at a button that silently does nothing.",
      patch: {
        jsBlocks: [{
          id: "fact-handler",
          code: "document.getElementById('fact-btn').addEventListener('click', () => {\n  fetch('https://catfact.ninja/fact')\n    .then(response => response.json())\n    .then(data => {\n      document.getElementById('factDisplay').textContent = data.fact;\n    })\n    .catch(error => {\n      document.getElementById('factDisplay').textContent = 'Could not load a fact — try again.';\n    });\n});",
        }],
      },
    },
    {
      id: "a-pretend-api-for-practice",
      title: "fetch() also works on a data: URL — no network at all",
      instructions:
        "A `data:` URL is a value that IS the content, encoded directly into the URL itself, rather than an address pointing at content stored somewhere else. `fetch()` treats one exactly like a real network address — same Promise, same `.then()` chain — which makes it a genuinely real way to practice fetch/JSON handling without depending on any actual server. A second button and display paragraph, for exactly that.",
      patch: {
        elements: [
          el("demo-btn", "button", null, 3, "Load Demo Profile", { type: "button", id: "demo-btn" }, { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", marginTop: "12px" }),
          el("profileDisplay", "p", null, 4, "", { id: "profileDisplay" }, { marginTop: "12px", color: "#334155", lineHeight: "1.6", maxWidth: "420px" }),
        ],
      },
    },
    {
      id: "challenge-wire-the-demo-fetch",
      title: "Your turn: fetch and render the demo profile",
      instructions:
        "Wire the Load Demo Profile button: build a `demoData` object with `name: 'Jordan Lee'` and `email: 'jordan@example.com'`, `fetch('data:application/json,' + encodeURIComponent(JSON.stringify(demoData)))`, then `.then(response => response.json())` and a second `.then(data => { ... })` that sets `profileDisplay`'s text to `data.name + ' — ' + data.email`. `encodeURIComponent` escapes characters (spaces, quotes) that aren't allowed to appear raw in a URL — necessary here since the JSON text is being embedded directly into one.",
      isChallenge: true,
      patch: {},
      hint: "document.getElementById('demo-btn').addEventListener('click', () => {\n  const demoData = { name: 'Jordan Lee', email: 'jordan@example.com' };\n  fetch('data:application/json,' + encodeURIComponent(JSON.stringify(demoData)))\n    .then(response => response.json())\n    .then(data => {\n      document.getElementById('profileDisplay').textContent = data.name + ' — ' + data.email;\n    });\n});",
      behavior: {
        interactions: [{ selector: "#demo-btn", action: "click" }],
        settleMs: 200,
        assertions: [
          { selector: "#profileDisplay", property: "textContent", expected: "Jordan Lee — jordan@example.com" },
        ],
      },
      solutionPatch: {
        jsBlocks: [{
          id: "demo-handler",
          code: "document.getElementById('demo-btn').addEventListener('click', () => {\n  const demoData = { name: 'Jordan Lee', email: 'jordan@example.com' };\n  fetch('data:application/json,' + encodeURIComponent(JSON.stringify(demoData)))\n    .then(response => response.json())\n    .then(data => {\n      document.getElementById('profileDisplay').textContent = data.name + ' — ' + data.email;\n    });\n});",
        }],
      },
    },
  ],
};
