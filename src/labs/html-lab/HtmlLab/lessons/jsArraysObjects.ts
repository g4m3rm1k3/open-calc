import { computeSolvedStateAtStep } from "./lessonEngine";
import { jsConditionalsLoops } from "./jsConditionalsLoops";
import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Third JS Foundations lesson — adds a small "favorites" feature to the
// growing practice page. Arrays and objects are the last piece before
// "Selecting & Creating Elements," which is where looping over an array to
// BUILD new DOM elements finally happens — this lesson keeps to updating
// existing text so array/object syntax doesn't get tangled up with DOM
// creation in the same lesson.
const priorPage = computeSolvedStateAtStep(jsConditionalsLoops, jsConditionalsLoops.steps.length - 1);

const SCRIPT_BEFORE_FAVORITES =
  "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});\n\ndocument.getElementById('sumBtn').addEventListener('click', () => {\n  let total = 0;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total + i;\n  }\n  document.getElementById('sumResult').textContent = 'Sum: ' + total;\n});\n\ndocument.getElementById('factorialBtn').addEventListener('click', () => {\n  let total = 1;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total * i;\n  }\n  document.getElementById('factorialResult').textContent = total;\n});";

export const jsArraysObjects: Lesson = {
  id: "js-arrays-objects",
  title: "Arrays & Objects",
  description: "Ordered lists with array methods, and grouped data with objects — a favorites list added to the practice page.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the practice page so far",
      instructions: "Everything from the last two lessons still works — now adding one more small feature below it.",
      patch: { elements: priorPage.elements },
    },
    {
      id: "arrays-hold-lists",
      title: "An array is an ordered list of values",
      instructions:
        "`const favorites = [];` creates an empty array — an ordered list that can hold any number of values. `.push('Pizza')` adds a value to the END of the list. `.length` tells you how many items are in it, and `.join(', ')` turns the whole array into one string, with `, ` between each item. Click Add a few times and watch the count and list both grow.",
      patch: {
        elements: [
          el("fav-heading", "h2", null, 9, "My Favorite Foods", {}, { fontSize: "18px", margin: "20px 0 8px", color: "#0f172a" }),
          el("favDisplay", "p", null, 10, "No favorites yet.", { id: "favDisplay" }, { color: "#334155" }),
          el("addFavBtn", "button", null, 11, "Add Pizza", { id: "addFavBtn" }, { padding: "6px 14px", marginTop: "6px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
        javascript: `${SCRIPT_BEFORE_FAVORITES}\n\nconst favorites = [];\n\ndocument.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n});`,
      },
    },
    {
      id: "objects-group-related-data",
      title: "An object groups related values by name",
      instructions:
        "An array looks things up by position (`favorites[0]` is the first item). An *object* looks things up by NAME instead: `{ name: 'Alex', favorites: favorites }` has a `name` property and a `favorites` property. `user.name` reads the name, `user.favorites.length` reaches right through to the array's length. Add a favorite and watch the new summary line update too.",
      patch: {
        elements: [
          el("userSummary", "p", null, 12, "", { id: "userSummary" }, { color: "#64748b", fontSize: "13px", marginTop: "4px" }),
        ],
        javascript: `${SCRIPT_BEFORE_FAVORITES}\n\nconst favorites = [];\nconst user = { name: 'Alex', favorites: favorites };\n\ndocument.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});`,
      },
    },
    {
      id: "challenge-remove-last",
      title: "Your turn: remove the last favorite",
      instructions:
        "A \"Remove Last\" button has appeared. Write the JavaScript so clicking it removes the most recently added favorite and updates both lines of text — `.pop()` removes and returns the LAST item from an array (the opposite of `.push()`).",
      isChallenge: true,
      patch: {
        elements: [
          el("removeFavBtn", "button", null, 13, "Remove Last", { id: "removeFavBtn" }, { padding: "6px 14px", marginTop: "6px", marginLeft: "6px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
        ],
      },
      hint: "document.getElementById('removeFavBtn').addEventListener('click', () => { favorites.pop(); document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', '); document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).'; }); — reuse the same two lines that update the text, just after popping instead of pushing.",
      behavior: {
        interactions: [
          { selector: "#addFavBtn", action: "click" },
          { selector: "#addFavBtn", action: "click" },
          { selector: "#removeFavBtn", action: "click" },
        ],
        assertions: [
          { selector: "#favDisplay", property: "textContent", expected: "1 favorite(s): Pizza" },
        ],
      },
      solutionPatch: {
        javascript: `${SCRIPT_BEFORE_FAVORITES}\n\nconst favorites = [];\nconst user = { name: 'Alex', favorites: favorites };\n\ndocument.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});\n\ndocument.getElementById('removeFavBtn').addEventListener('click', () => {\n  favorites.pop();\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});`,
      },
    },
  ],
};
