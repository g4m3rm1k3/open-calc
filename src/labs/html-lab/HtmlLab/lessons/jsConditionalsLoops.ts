import { computeSolvedFoldAtStep } from "./lessonEngine";
import { jsFoundationsVariables } from "./jsFoundationsVariables";
import { el, foldToPatch } from "./lessonHelpers";
import type { Lesson } from "./lessonTypes";

// Second JS Foundations lesson — continues the counter widget. Rewritten to
// give the modulo operator, if/else, comparison operators, and for loops
// each their own dedicated step instead of introducing 2-3 of them in one
// paragraph. Each new API is explained on its own before it's combined with
// anything else already on the page.
const priorFold = computeSolvedFoldAtStep(jsFoundationsVariables, jsFoundationsVariables.steps.length - 1);

export const jsConditionalsLoops: Lesson = {
  id: "js-conditionals-loops",
  title: "Conditionals & Loops",
  description: "The modulo operator, if/else, comparisons, and for loops — one idea at a time, added to the counter.",
  topic: "js",
  unit: "JS Foundations",
  steps: [
    {
      id: "recap-page",
      title: "Here's the counter so far",
      instructions: "Increment and Reset both already work from the last lesson — now let's make the counter react to its own value.",
      patch: foldToPatch(priorFold),
    },
    {
      id: "the-modulo-operator",
      title: "% (modulo) gives you a division's remainder",
      instructions:
        "`%` is the modulo operator. `count % 2` divides `count` by 2 and gives back the REMAINDER — not the result of the division itself. `4 % 2` is `0`, because 4 divides evenly into 2 with nothing left over. `5 % 2` is `1`, because 2 goes into 5 twice with 1 left over. Every even number divides evenly by 2, so `count % 2` is always exactly `0` for an even count and always exactly `1` for an odd one — which makes it a quick, reliable way to ask \"is this number even?\" in code.",
      patch: {},
    },
    {
      id: "if-else",
      title: "if/else runs one block or the other, never both",
      instructions:
        "`if (condition) { ... } else { ... }` checks whether `condition` works out to true or false. If it's true, only the code inside the FIRST `{ }` runs. If it's false, only the code inside the SECOND `{ }` — after `else` — runs. Never both blocks, and never neither. The `else` part is entirely optional; a plain `if` with nothing after it is perfectly normal when there's simply nothing to do in the false case.",
      patch: {},
    },
    {
      id: "equality-comparison",
      title: "=== checks if two values are exactly equal",
      instructions:
        "`===` compares two values and produces `true` or `false` — nothing else. `count === 5` is `true` only in the exact moment `count` holds `5`, and `false` for every other value. Combined with the last two ideas: `count % 2 === 0` reads as \"the remainder of count divided by 2 — is THAT exactly equal to 0?\" — which is exactly true when `count` is even.",
      patch: {},
    },
    {
      id: "color-changes-with-parity",
      title: "Put it together: color the number by even or odd",
      instructions:
        "`if (count % 2 === 0) { display.style.color = '#16a34a'; } else { display.style.color = '#0f172a'; }` combines everything from the last three steps into the increment handler: when count is even, the condition is true and the number turns green; otherwise it turns black. Click Increment a few times now and watch the color actually flip.",
      patch: {
        jsBlocks: [{
          id: "increment-handler",
          code: "document.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n});",
        }],
      },
    },
    {
      id: "greater-than-comparison",
      title: "> checks if one value is bigger than another",
      instructions:
        "`>` works just like `===`, but asks a different question: \"is greater than.\" `count > 5` is `false` all the way up through `count` being `5`, and becomes `true` the moment count passes it — at 6 and beyond. Together, `===` and `>` (along with `<`, `>=`, and `<=`, which work exactly how they look) are what almost every `if` condition in real code is actually built from.",
      patch: {},
    },
    {
      id: "conditional-message",
      title: "Show a message only when a condition holds",
      instructions:
        "A new, empty paragraph called `milestone` has appeared. `if (count > 5) { milestone.textContent = \"You've clicked a lot!\"; } else { milestone.textContent = ''; }` fills it in once you've passed five clicks — and empties it straight back out if Reset brings the count back down. Same if/else shape as the color change, just a different pair of actions inside it.",
      patch: {
        elements: [
          el("milestone", "p", null, 4, "", { id: "milestone" }, { color: "#0f172a", fontWeight: "700", marginTop: "8px" }),
        ],
        jsBlocks: [
          {
            id: "increment-handler",
            code: "document.getElementById('incrementBtn').addEventListener('click', () => {\n  count = count + 1;\n  display.textContent = count;\n  if (count % 2 === 0) {\n    display.style.color = '#16a34a';\n  } else {\n    display.style.color = '#0f172a';\n  }\n  if (count > 5) {\n    document.getElementById('milestone').textContent = \"You've clicked a lot!\";\n  } else {\n    document.getElementById('milestone').textContent = '';\n  }\n});",
          },
          {
            id: "reset-handler",
            code: "document.getElementById('resetBtn').addEventListener('click', () => {\n  count = 0;\n  display.textContent = count;\n  display.style.color = '#0f172a';\n  document.getElementById('milestone').textContent = '';\n});",
          },
        ],
      },
    },
    {
      id: "what-is-a-loop",
      title: "A loop repeats the same code automatically",
      instructions:
        "Adding the numbers 1 through 5 by hand means writing `1 + 2 + 3 + 4 + 5` — manageable for 5 numbers, completely unworkable for 500. A loop runs the same block of code over and over, changing one value a little each time, until some condition says to stop. That's the whole idea, before any specific syntax: repeat this action, changing this value, until this becomes true.",
      patch: {},
    },
    {
      id: "for-loop-syntax",
      title: "for (start here; keep going while this; do this after each time)",
      instructions:
        "A `for` loop packs three instructions onto one line, separated by semicolons: `for (let i = 1; i <= 5; i = i + 1) { ... }`. The FIRST part (`let i = 1`) runs exactly once, before the loop starts — it creates a counter variable. The SECOND part (`i <= 5`) is checked before every single pass through the loop's body; as long as it's true, the loop keeps going. The THIRD part (`i = i + 1`) runs after every pass, right before that condition gets checked again. Read together: start `i` at 1, keep looping while `i` is 5 or less, and add 1 to `i` every time through.",
      patch: {},
    },
    {
      id: "sum-with-a-loop",
      title: "Use the loop to actually add something up",
      instructions:
        "A \"Sum 1-5\" button has appeared. `let total = 0;` starts a running total at zero. Inside the loop, `total = total + i;` adds whatever `i` currently is onto that total, once per pass. By the time the loop finishes — once `i` finally exceeds 5 — `total` holds `1 + 2 + 3 + 4 + 5`, and the exact same five lines would work just as well summing 1 all the way to 500.",
      patch: {
        elements: [
          el("sumBtn", "button", null, 5, "Sum 1-5", { id: "sumBtn" }, { padding: "6px 14px", marginTop: "8px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "6px" }),
          el("sumResult", "p", null, 6, "", { id: "sumResult" }, { color: "#334155", marginTop: "6px" }),
        ],
        jsBlocks: [{
          id: "sum-handler",
          code: "document.getElementById('sumBtn').addEventListener('click', () => {\n  let total = 0;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total + i;\n  }\n  document.getElementById('sumResult').textContent = 'Sum: ' + total;\n});",
        }],
      },
    },
    {
      id: "challenge-factorial",
      title: "Your turn: multiply instead of add",
      instructions:
        "A \"Factorial\" button has appeared. Write a `for` loop that multiplies the numbers 1 through 5 together (5! = 1 × 2 × 3 × 4 × 5 = 120) and shows the result in the paragraph below it — the same loop shape as the sum button, `total = total * i` instead of `total = total + i`. One important difference: `total` needs to start at `1`, not `0` — multiplying anything by zero always gives zero, which would make every pass through the loop pointless.",
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
        jsBlocks: [{
          id: "factorial-handler",
          code: "document.getElementById('factorialBtn').addEventListener('click', () => {\n  let total = 1;\n  for (let i = 1; i <= 5; i = i + 1) {\n    total = total * i;\n  }\n  document.getElementById('factorialResult').textContent = total;\n});",
        }],
      },
    },
  ],
};
