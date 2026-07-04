import { computeSolvedFoldAtStep } from "./lessonEngine";
import { jsConditionalsLoops } from "./jsConditionalsLoops";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Third JS Foundations lesson — adds a small "favorites" feature to the
// growing practice page. This is the file that was rewritten from scratch:
// it used to hold several ~600-character hand-typed strings (one full copy
// of the accumulated script per step), which is exactly what made a small
// edit dump 100 unrelated lines back at a learner. Now every step adds or
// changes exactly one named jsBlock, and arrays/objects each get their own
// explanation instead of being introduced side by side in one paragraph.
const priorFold = computeSolvedFoldAtStep(jsConditionalsLoops, jsConditionalsLoops.steps.length - 1);

export const jsArraysObjects: Lesson = {
  id: "js-arrays-objects",
  title: "Arrays & Objects",
  description: "Ordered lists with array methods, and grouped data with objects — one idea at a time, on a new favorites list.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the practice page so far",
      instructions: "Everything from the last two lessons still works — now adding one more small feature below it.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "what-is-an-array",
      title: "An array is an ordered list of values",
      instructions:
        "`const favorites = [];` creates an array — an ordered list that can hold any number of values, starting out empty here. Think of it as a row of numbered slots: the first thing you add sits at position `0`, the next at position `1`, and so on. You can read a specific slot with `favorites[0]` (the very first item) — though the next few steps mostly use methods that manage the whole list for you, rather than reaching into one slot at a time.",
      patch: {
        elements: [
          el("fav-heading", "h2", null, 9, "My Favorite Foods", {}, { fontSize: "18px", margin: "20px 0 8px", color: "#0f172a" }),
          el("favDisplay", "p", null, 10, "No favorites yet.", { id: "favDisplay" }, { color: "#334155" }),
          el("addFavBtn", "button", null, 11, "Add Pizza", { id: "addFavBtn" }, { padding: "6px 14px", marginTop: "6px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" }),
        ],
        jsBlocks: [{ id: "favorites-array", code: "const favorites = [];" }],
      },
    },
    {
      id: "array-push",
      title: ".push() adds a value to the end of the list",
      instructions:
        "`favorites.push('Pizza')` adds `'Pizza'` onto the end of the array, growing it by one slot. Every array has a `.push()` method — it's not a separate function you write yourself, it comes built in, ready to use on any array. Click Add now and watch it actually run each time.",
      patch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n});",
        }],
      },
    },
    {
      id: "array-length-and-join",
      title: ".length counts items; .join() turns the list into text",
      instructions:
        "`favorites.length` is always the current number of items in the array — not a method you call with `()`, just a value you read. `.join(', ')` turns the WHOLE array into a single piece of text, placing `, ` between each item (`['Pizza', 'Pizza']` becomes `\"Pizza, Pizza\"`). Together, `favorites.length + ' favorite(s): ' + favorites.join(', ')` builds one readable line out of however many favorites are currently in the list. Click Add a few times and watch both the count and the list of names grow.",
      patch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n});",
        }],
      },
    },
    {
      id: "what-is-an-object",
      title: "An object groups related values, each with its own name",
      instructions:
        "An array looks things up by POSITION — `favorites[0]` is \"whatever is first,\" with no name attached. An object looks things up by NAME instead: `{ name: 'Alex', favorites: favorites }` is a single value with two properties — one called `name` holding the text `'Alex'`, and one called `favorites` holding the array from the last few steps. Properties are written `key: value`, separated by commas, inside `{ }`.",
      patch: {
        jsBlocks: [{ id: "user-object", code: "const user = { name: 'Alex', favorites: favorites };" }],
      },
    },
    {
      id: "dot-notation",
      title: ". (dot notation) reads a property by name",
      instructions:
        "`user.name` reads the `name` property straight off the `user` object — it evaluates to `'Alex'`. Dot notation chains, too: `user.favorites` reaches the array stored on `user`, and `user.favorites.length` goes one step further, reaching the `.length` of THAT array — the same `.length` from a few steps ago, just accessed through the object instead of the bare `favorites` variable. A new line of text uses exactly that chain to introduce a summary sentence.",
      patch: {
        elements: [
          el("userSummary", "p", null, 12, "", { id: "userSummary" }, { color: "#64748b", fontSize: "13px", marginTop: "4px" }),
        ],
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  favorites.push('Pizza');\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});",
        }],
      },
    },
    {
      id: "challenge-remove-last",
      title: "Your turn: remove the last favorite",
      instructions:
        "A \"Remove Last\" button has appeared. `.pop()` is `.push()`'s opposite — it removes and returns the LAST item from an array, shrinking it by one slot. Write the JavaScript so clicking Remove Last calls `favorites.pop()`, then updates both lines of text exactly the way the Add handler already does.",
      isChallenge: true,
      patch: {
        elements: [
          el("removeFavBtn", "button", null, 13, "Remove Last", { id: "removeFavBtn" }, { padding: "6px 14px", marginTop: "6px", marginLeft: "6px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
        ],
      },
      hint: "document.getElementById('removeFavBtn').addEventListener('click', () => { favorites.pop(); document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', '); document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).'; }); — reuse the same two update lines from the Add handler, just after popping instead of pushing.",
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
        jsBlocks: [{
          id: "remove-handler",
          code: "document.getElementById('removeFavBtn').addEventListener('click', () => {\n  favorites.pop();\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n});",
        }],
      },
    },
  ],
};
