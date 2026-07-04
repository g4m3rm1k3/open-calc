import { computeSolvedFoldAtStep } from "./lessonEngine";
import { jsDomElements } from "./jsDomElements";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Fifth and final JS Foundations lesson — the favorites list has always
// added a hardcoded 'Pizza'. This lesson replaces that with a real input
// field and validates it before doing anything with it, which is what
// basically every real form does before submitting. `.value`, clearing an
// input, "why validate," early `return`, and the actual empty-check each
// get their own step.
const priorFold = computeSolvedFoldAtStep(jsDomElements, jsDomElements.steps.length - 1);

export const jsFormsValidation: Lesson = {
  id: "js-forms-validation",
  title: "Forms & Validation with JS",
  description: "Reading a real input field and validating it before acting on it — one idea at a time.",
  topic: "js",
  unit: "The DOM",
  steps: [
    {
      id: "recap-page",
      title: "Here's the practice page so far",
      instructions: "Every favorite added so far has been a hardcoded 'Pizza'. Time for a real input field.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "input-value-property",
      title: "An input field's current text lives in .value",
      instructions:
        "A text field is an element like any other, but it has one property the others don't: `.value`, which always holds whatever the user has currently typed into it. Read it any time — `input.value` is just a string, the same kind of value as anything else you've stored in a variable — and it's always up to date with what's in the box right now.",
      patch: {
        elements: [
          el("favInput", "input", null, 13.5, "", { id: "favInput", type: "text", placeholder: "Add a favorite..." }, { padding: "6px 10px", marginTop: "6px", border: "1px solid #cbd5e1", borderRadius: "6px" }),
        ],
      },
    },
    {
      id: "reading-input-on-click",
      title: "Read .value instead of using a hardcoded word",
      instructions:
        "The Add button's handler used to always push the literal text `'Pizza'`. Now it reads `document.getElementById('favInput').value` first, storing whatever that currently is in a variable called `value`, and uses THAT everywhere it used to use `'Pizza'` — for the array, and for the new list item's text.",
      patch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  const input = document.getElementById('favInput');\n  const value = input.value;\n\n  favorites.push(value);\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const item = document.createElement('li');\n  item.textContent = value;\n  document.querySelector('#favList').appendChild(item);\n});",
        }],
      },
    },
    {
      id: "clearing-the-input",
      title: "Reset the box for the next entry",
      instructions:
        "Just like reading `.value` gives you what's typed, ASSIGNING to it changes what's in the box. `input.value = '';` sets it back to empty — added to the very end of the Add handler, so the field clears itself out automatically right after each favorite is added, ready for the next one.",
      patch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  const input = document.getElementById('favInput');\n  const value = input.value;\n\n  favorites.push(value);\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const item = document.createElement('li');\n  item.textContent = value;\n  document.querySelector('#favList').appendChild(item);\n\n  input.value = '';\n});",
        }],
      },
    },
    {
      id: "why-validate",
      title: "Nothing stops an empty submission — yet",
      instructions:
        "Right now, clicking Add with a completely empty box happily adds an empty favorite to the list. Checking user input BEFORE acting on it — instead of just trusting whatever came in — is called validation, and it's something almost every real form does: an empty name field, a badly formatted email, a password that's too short, all get caught by validation before anything happens with them.",
      patch: {},
    },
    {
      id: "early-return",
      title: "return can exit a function early",
      instructions:
        "`return` immediately stops a function and exits — anything written after it, inside that same function, simply never runs for that call. That's exactly the tool needed here: if the input turns out to be invalid, `return` right away, before the code that pushes to the array or creates a new list item ever gets a chance to execute.",
      patch: {},
    },
    {
      id: "checking-for-empty",
      title: "Put it together: check for empty, then return",
      instructions:
        "`.trim()` removes whitespace from both ends of a string, so a box containing only spaces still counts as empty. `if (value === '') { error.textContent = 'Type something before adding it.'; return; }` checks that FIRST, before anything else in the handler — if it's true, an error message appears and the function exits immediately via `return`, skipping the rest entirely. A new empty paragraph, `favError`, is where that message appears; `error.textContent = '';` clears it again once a valid entry comes through.",
      patch: {
        elements: [
          el("favError", "p", null, 13.7, "", { id: "favError" }, { color: "#dc2626", fontSize: "12px", marginTop: "4px" }),
        ],
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  const input = document.getElementById('favInput');\n  const value = input.value.trim();\n  const error = document.getElementById('favError');\n\n  if (value === '') {\n    error.textContent = 'Type something before adding it.';\n    return;\n  }\n  error.textContent = '';\n\n  favorites.push(value);\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const item = document.createElement('li');\n  item.textContent = value;\n  document.querySelector('#favList').appendChild(item);\n\n  input.value = '';\n});",
        }],
      },
    },
    {
      id: "challenge-length-check",
      title: "Your turn: add a length check",
      instructions:
        "Add a second validation check, right after the empty check and before the line that clears the error: if the trimmed input's `.length` is greater than 20, show the error \"Keep it under 20 characters.\" and `return` — the same shape as the empty check, just a different condition and a different message.",
      isChallenge: true,
      patch: {},
      hint: "if (value.length > 20) { error.textContent = 'Keep it under 20 characters.'; return; } — place this right after the empty check, before error.textContent = '';.",
      behavior: {
        interactions: [
          { selector: "#favInput", action: "input", value: "this sentence is way too long" },
          { selector: "#addFavBtn", action: "click" },
        ],
        assertions: [
          { selector: "#favError", property: "textContent", expected: "Keep it under 20 characters." },
        ],
      },
      solutionPatch: {
        jsBlocks: [{
          id: "add-handler",
          code: "document.getElementById('addFavBtn').addEventListener('click', () => {\n  const input = document.getElementById('favInput');\n  const value = input.value.trim();\n  const error = document.getElementById('favError');\n\n  if (value === '') {\n    error.textContent = 'Type something before adding it.';\n    return;\n  }\n  if (value.length > 20) {\n    error.textContent = 'Keep it under 20 characters.';\n    return;\n  }\n  error.textContent = '';\n\n  favorites.push(value);\n  document.getElementById('favDisplay').textContent = favorites.length + ' favorite(s): ' + favorites.join(', ');\n  document.getElementById('userSummary').textContent = user.name + ' has ' + user.favorites.length + ' favorite(s).';\n\n  const item = document.createElement('li');\n  item.textContent = value;\n  document.querySelector('#favList').appendChild(item);\n\n  input.value = '';\n});",
        }],
      },
    },
  ],
};
