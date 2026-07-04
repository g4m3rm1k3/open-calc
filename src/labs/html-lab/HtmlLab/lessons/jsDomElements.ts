import { computeSolvedFoldAtStep } from "./lessonEngine";
import { jsArraysObjects } from "./jsArraysObjects";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Fourth JS Foundations lesson, and the one everything before it was
// building toward: the favorites list has only ever updated existing text.
// This lesson makes it build REAL new elements — one <li> per favorite —
// using querySelector, createElement, appendChild, and .remove(), each
// introduced on its own before being combined with the others.
const priorFold = computeSolvedFoldAtStep(jsArraysObjects, jsArraysObjects.steps.length - 1);

export const jsDomElements: Lesson = {
  id: "js-dom-elements",
  title: "Selecting & Creating Elements",
  description: "querySelector, createElement, appendChild, and remove() — one idea at a time, on real list items.",
  topic: "js",
  unit: "The DOM",
  steps: [
    {
      id: "recap-page",
      title: "Here's the practice page so far",
      instructions: "The favorites list has only ever been one line of text summarizing an array. Time to make it a real list.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "queryselector",
      title: "querySelector finds an element with a CSS selector",
      instructions:
        "`document.querySelector('#favList')` finds an element the same way `getElementById` does, but using any CSS selector instead of just an id — `#favList` (an id, same as `getElementById('favList')` would find), `.someClass` (a class), or even just `li` (every element with that tag, though `querySelector` only ever returns the FIRST match). It's one more tool for reaching an element, useful the moment you want to select by something other than an id.",
      patch: {
        elements: [
          el("favList", "ul", null, 14, "", { id: "favList" }, { margin: "8px 0 0", paddingLeft: "20px", color: "#334155" }),
        ],
      },
    },
    {
      id: "createelement",
      title: "createElement builds a brand new element",
      instructions:
        "Every element you've seen so far already existed on the page before any JavaScript ran. `document.createElement('li')` is different — it builds a completely NEW `<li>` element that doesn't exist anywhere yet, and hands it back to you sitting in memory, not yet visible anywhere. Setting its `.textContent` — the same property you've already used to change existing text — works exactly the same way on this brand new element too.",
      patch: {},
    },
    {
      id: "appendchild",
      title: "appendChild actually puts the new element on the page",
      instructions:
        "A freshly created element isn't visible until it's attached somewhere in the page's structure. `list.appendChild(item)` adds `item` as the newest child of `list`, at the very end — which is the step that actually makes it appear on screen. Put together: create the `<li>`, set its text, then append it into `favList`. Click Add now and watch a real list item appear each time.",
      patch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const item = document.createElement('li');\n  item.textContent = 'Pizza';\n  document.querySelector('#favList').appendChild(item);\n});",
        }],
      },
    },
    {
      id: "removing-elements",
      title: ".remove() takes an element off the page entirely",
      instructions:
        "`.textContent = ''` empties an element's text but leaves the (now blank) element sitting there. `.remove()` is different — it deletes the element itself, completely, as if it had never been added. `favList.lastElementChild` reaches whichever `<li>` was added most recently (the last child element inside the list) — call `.remove()` on that, and the list shrinks by exactly the one item Remove Last is supposed to take away.",
      patch: {
        jsBlocks: [{
          id: "remove-handler",
          code: "document.getElementById('removeFavBtn').addEventListener('click', () => {\n  favorites.pop();\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const list = document.querySelector('#favList');\n  if (list.lastElementChild) {\n    list.lastElementChild.remove();\n  }\n});",
        }],
      },
    },
    {
      id: "challenge-clear-all",
      title: "Your turn: clear the whole list",
      instructions:
        "A \"Clear All\" button has appeared. `favorites.length = 0;` is a quick way to empty an array completely in place. Removing every `<li>` needs a loop, since there's no built-in \"remove everything\" method: `while (list.firstChild) { list.firstChild.remove(); }` keeps removing whatever is CURRENTLY first, which — because the list keeps shrinking — eventually removes everything. Write the handler so it empties the array, empties the list, and updates both text summaries to show zero favorites.",
      isChallenge: true,
      patch: {
        elements: [
          el("clearAllBtn", "button", null, 15, "Clear All", { id: "clearAllBtn" }, { padding: "6px 14px", marginTop: "6px", marginLeft: "6px", background: "#fecaca", color: "#7f1d1d", border: "none", borderRadius: "6px" }),
        ],
      },
      hint: "favorites.length = 0; empties the array. Then get the list with querySelector('#favList') and use while (list.firstChild) { list.firstChild.remove(); } to remove every item. Finish by updating favDisplay and userSummary the same way the other handlers already do.",
      behavior: {
        interactions: [
          { selector: "#addFavBtn", action: "click" },
          { selector: "#addFavBtn", action: "click" },
          { selector: "#clearAllBtn", action: "click" },
        ],
        assertions: [
          { selector: "#favList", property: "textContent", expected: "" },
          { selector: "#favDisplay", property: "textContent", expected: "0 favorite(s): " },
        ],
      },
      solutionPatch: {
        jsBlocks: [{
          id: "clear-all-handler",
          code: "document.getElementById('clearAllBtn').addEventListener('click', () => {\n  favorites.length = 0;\n  const list = document.querySelector('#favList');\n  while (list.firstChild) {\n    list.firstChild.remove();\n  }\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});",
        }],
      },
    },
  ],
};
