import { computeSolvedStateAtStep } from "./lessonEngine";
import { jsFoundationsVariables } from "./jsFoundationsVariables";
import { el } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second JS Foundations lesson — continues the counter widget from
// "Variables, Functions & Events". Teaches if/else, comparison operators,
// and for loops, all landing as something visible on the same page rather
// than abstract examples.
const counterPage = computeSolvedStateAtStep(jsFoundationsVariables, jsFoundationsVariables.steps.length - 1);

export const jsConditionalsLoops: Lesson = {
  id: "js-conditionals-loops",
  title: "Conditionals & Loops",
  description: "if/else, comparison operators, and for loops — added to the counter from the last lesson.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the counter so far",
      instructions: "Increment and Reset both already work from the last lesson — now let's make the counter react to its own value.",
      patch: { elements: counterPage.elements },
    },
    {
      id: "if-else-parity",
      title: "if/else runs different code based on a condition",
      instructions:
        "`count % 2` is the *remainder* after dividing count by 2 — it's `0` for even numbers, `1` for odd ones. `if (count % 2 === 0) { ... } else { ... }` runs the first block when that condition is true, the second when it's false. Click Increment a few times and watch the number's color flip between green and black.",
      patch: {
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n});",
      },
    },
    {
      id: "comparison-and-messages",
      title: "Comparison operators power the condition",
      instructions:
        "`===` checks \"is exactly equal to,\" `>` checks \"is greater than\" — these comparisons are what conditions are usually built from. Here, `count > 5` becomes true once you've clicked past five, revealing a message that `count <= 5` would keep hidden.",
      patch: {
        elements: [
          el("milestone", "p", null, 4, "", { id: "milestone" }, { color: "#0f172a", fontWeight: "700", marginTop: "8px" }),
        ],
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});",
      },
    },
    {
      id: "for-loops",
      title: "A for loop repeats code a set number of times",
      instructions:
        "`for (let i = 1; i <= 5; i = i + 1) { total = total + i; }` runs its body once for each value of `i` from 1 to 5 — start at 1, keep going *while* `i <= 5`, add 1 to `i` after each pass. Adding up 1 through 5 with a loop instead of typing `1 + 2 + 3 + 4 + 5` is the whole point: the same loop works whether you're adding 5 numbers or 5,000.",
      patch: {
        elements: [
          el("sumBtn", "button", null, 5, "Sum 1-5", { id: "sumBtn" }, { padding: "6px 14px", marginTop: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
          el("sumResult", "p", null, 6, "", { id: "sumResult" }, { color: "#334155", marginTop: "6px" }),
        ],
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});\n\ndocument.getElementById('sumBtn').addEventListener('click', () => {\n  let total = 0;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total + i;\n  }\n  document.getElementById('sumResult').textContent = 'Sum: ' + total;\n});",
      },
    },
    {
      id: "challenge-factorial",
      title: "Your turn: multiply instead of add",
      instructions:
        "A \"Factorial\" button has appeared. Write a `for` loop that multiplies the numbers 1 through 5 together (5! = 1 × 2 × 3 × 4 × 5 = 120) and shows the result in the paragraph below it — same loop shape as the sum button, `total = total * i` instead of `total = total + i` (and `total` needs to start at `1`, not `0` — multiplying by zero would always give zero).",
      isChallenge: true,
      patch: {
        elements: [
          el("factorialBtn", "button", null, 7, "Factorial of 5", { id: "factorialBtn" }, { padding: "6px 14px", marginTop: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
          el("factorialResult", "p", null, 8, "", { id: "factorialResult" }, { color: "#334155", marginTop: "6px" }),
        ],
      },
      hint: "document.getElementById('factorialBtn').addEventListener('click', () => { let total = 1; for (let i = 1; i <= 5; i = i + 1) { total = total * i; } document.getElementById('factorialResult').textContent = total; });",
      behavior: {
        interactions: [{ selector: "#factorialBtn", action: "click" }],
        assertions: [{ selector: "#factorialResult", property: "textContent", expected: "120" }],
      },
      solutionPatch: {
        javascript:
          "const display = document.getElementById('display');\nlet count = 0;\n\ndocument.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});\n\ndocument.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});\n\ndocument.getElementById('sumBtn').addEventListener('click', () => {\n  let total = 0;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total + i;\n  }\n  document.getElementById('sumResult').textContent = 'Sum: ' + total;\n});\n\ndocument.getElementById('factorialBtn').addEventListener('click', () => {\n  let total = 1;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total * i;\n  }\n  document.getElementById('factorialResult').textContent = total;\n});",
      },
    },
  ],
};
