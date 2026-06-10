# FlowBoard Masterclass — LAB 00 — From Data to Cards (Indirect Mode)

**Prerequisites:** Basic HTML tags, basic CSS rules, variables, arrays, functions.

**What this lab adds:**
- A complete mental model for rendering UI from data using an isolated example
- A reusable render abstraction with an explicit invariant
- A repeatable debugging pattern for duplicated UI output

**Time:** 90-120 minutes

---

## What You Will Build

You will build a small isolated "Task Wall" example that is not your app.

Before:
- One hardcoded card in HTML

After:
- Cards generated from an array of task data
- A "Render Again" button that does not duplicate cards
- A render function you can reason about and reuse

Visual shape at the end:

```text
+----------------------------------+
| Task Wall (isolated example)     |
| [Render Again]                   |
|                                  |
| [Bug]   Fix login redirect       |
| [Feat]  Add dark mode toggle     |
| [Docs]  Write API overview       |
+----------------------------------+
```

---

> **Quick Check — answer before reading further:**
>
> 1. If the same render logic runs twice, should the screen change the second time?
> 2. Why is hardcoded HTML for repeated cards fragile?
> 3. What does it mean for a render process to be deterministic?
> 4. Prediction: if a button click appends cards every time without clearing old cards, what happens after 5 clicks?
>
> *(Answers at the end of this lab)*

### Forward-Reference Table (Indirect Mode)

| Term | Enough to read the examples | Full block |
|---|---|---|
| DOM (Document Object Model) | The browser's in-memory tree of page elements that JavaScript can read and change. | LAB 00 |
| Idempotent | Running the same operation multiple times with the same input gives the same final result. | LAB 00 |
| Invariant | A rule that must always remain true if the system is correct. | LAB 00 |

---

### Concept: DOM (Document Object Model)

**What it is:** The DOM is the browser's live object representation of the page.

**The problem before:** If HTML is only text in a file and cannot be manipulated as objects, runtime updates (like generating cards from data) are impossible.

**The solution:** The browser parses HTML into a structured tree (the DOM), and JavaScript updates nodes in that tree.

**Canonical example (General Explanation):**
- Real-world analogy: a building blueprint turned into a building model with editable rooms
- Minimal code form: select a node, then change its text
- Why this works: you are modifying the live page model, not static source text

**Project Application (The "Why" here):** In this lab's isolated Task Wall, card content will come from data, so we need to read and write page nodes programmatically.

**Smallest possible example:**

```html
<p id="status">Pending</p>
<script>
  const statusEl = document.getElementById('status'); // DOM lookup by id
  statusEl.textContent = 'Done'; // DOM text update
</script>
```

**Why it matters here:** No DOM access means no data-driven cards.

**Constraints:** The target node must exist before lookup. If script runs before markup exists, lookups can return null.

**Failure modes:** Dynamic updates can silently fail when selectors mismatch actual markup.

**Operational reality:** Large DOM trees can make repeated full re-renders expensive without careful batching or virtualized techniques.

**You will see this again in:**
- Vanilla JavaScript apps
- React internals (virtual DOM eventually updates the real DOM)
- Vue/Svelte runtime updates
- Browser extension UIs
- Interview questions about rendering pipelines

**Watch for:** `getElementById` returning `null` because id values do not match exactly.

---

## Step 1 — Build Bare Structure First (No Styling Yet)

Type this minimal structure in any scratch HTML playground or local HTML page:

```html
<div class="wall"> <!-- <- add this: wall container -->
  <h1 class="wall-title">Task Wall</h1> <!-- <- add this: visible heading -->
  <button id="render-again">Render Again</button> <!-- <- add this: behavior trigger -->
  <div id="card-list"> <!-- <- add this: render target -->
    <article class="card"> <!-- <- add this: one temporary static card -->
      <span class="label">Bug</span>
      <h2 class="card-title">Fix login redirect</h2>
    </article>
  </div>
</div>
```

### CSS AND SEE

Save and open in the browser.

You should see:
- A heading
- A button
- One unstyled card block with text

Compare:
- Before this step: blank page
- After this step: complete visual skeleton exists

Change something:
- Change heading text to `Task Wall Demo`
- Save and confirm text changes
- Change it back

---

## Step 2 — Add CSS Incrementally (One Visual Layer at a Time)

Add only this first rule:

```css
.wall { /* <- add this */
  max-width: 640px;
  margin: 24px auto;
}
```

### CSS AND SEE

You should see content centered in a narrower column.

Now add the second rule:

```css
.card { /* <- add this */
  border: 1px solid #d7d7d7;
  border-radius: 10px;
  padding: 12px;
  margin-top: 10px;
}
```

### CSS AND SEE

You should see a bordered card shape.

Now add label styling:

```css
.label { /* <- add this */
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  background: #eef2ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 999px;
}
```

### CSS AND SEE

You should see the label styled as a pill.

Change something:
- Change `background` to `#fee2e2`
- Save and confirm pill color changes
- Change it back

---

### Concept: Data Record for UI

**What it is:** A data record is one object that holds all fields needed to render one UI item.

**The problem before:** Hardcoded repeated HTML couples content to structure. Every content change requires manual markup edits in multiple places.

**The solution:** Put card content into objects and render from those objects.

**What it hides:**
- Hidden complexity: manual repeated text edits across many markup blocks
- Protected invariant: every rendered card has the same required field shape (`id`, `label`, `title`)

**Canonical example (General Explanation):**
- Analogy: a shipping label template populated by a package record
- Minimal code: one object with named fields
- Why it works: template structure stays fixed while data changes independently

**Project Application (The "Why" here):** The isolated Task Wall will move from one hardcoded card to many cards driven by an array of records.

**Smallest possible example:**

```js
const task = {
  id: 't1',
  label: 'Bug',
  title: 'Fix login redirect',
};
```

**Why it matters here:** Data-driven rendering is the foundation for lists in any UI framework.

**Constraints:** Field names must be consistent. Missing fields produce missing UI output.

**Failure modes:** Schema drift across teams causes runtime render bugs (for example, `taskTitle` vs `title`).

**Operational reality:** In production, records usually come from APIs, so contracts are enforced with types and validation.

**You will see this again in:**
- REST/GraphQL response handling
- Table row rendering
- Form initialization
- Caching layers
- Interview tasks involving object arrays

**Watch for:** Using inconsistent key names between data and render code.

---

## Step 3 — Replace Hardcoded Card with Data-Driven Single Render

Remove the temporary static card markup inside `#card-list`, then add this script:

```html
<script>
  const oneTask = { // <- add this: first data record
    id: 't1',
    label: 'Bug',
    title: 'Fix login redirect',
  };

  const cardListEl = document.getElementById('card-list'); // <- add this: target container

  cardListEl.innerHTML = `
    <article class="card" data-id="${oneTask.id}"> <!-- <- add this: generated card -->
      <span class="label">${oneTask.label}</span>
      <h2 class="card-title">${oneTask.title}</h2>
    </article>
  `;
</script>
```

### SAVE AND TRY

Save and reload.

You should see:
- The same single card appearance as before
- But now content comes from `oneTask` data

In DevTools Console, run:

```js
document.querySelectorAll('.card').length
```

Expected:
- `1`

Change something:
- Change `oneTask.title` to `Fix OAuth callback`
- Save and confirm title updates
- Change it back

---

## Step 4 — Show the Failure First: Duplicate Cards

Now intentionally introduce a naive render approach to trigger failure.

Add this tasks array and naive function:

```html
<script>
  const tasks = [ // <- add this: multiple records
    { id: 't1', label: 'Bug', title: 'Fix login redirect' },
    { id: 't2', label: 'Feat', title: 'Add dark mode toggle' },
    { id: 't3', label: 'Docs', title: 'Write API overview' },
  ];

  const cardListEl = document.getElementById('card-list');
  const renderAgainBtn = document.getElementById('render-again'); // <- add this: button handle

  function naiveRender() { // <- add this: intentionally flawed
    tasks.forEach((task) => {
      cardListEl.innerHTML += `
        <article class="card" data-id="${task.id}">
          <span class="label">${task.label}</span>
          <h2 class="card-title">${task.title}</h2>
        </article>
      `;
    });
  }

  naiveRender(); // <- add this: first render
  renderAgainBtn.addEventListener('click', naiveRender); // <- add this: repeat render
</script>
```

### SAVE AND TRY

Save and click `Render Again` 3 times.

You should see:
- Cards duplicate every click
- List grows from 3 to 6 to 9 to 12...

In DevTools Console, run:

```js
document.querySelectorAll('.card').length
```

Expected:
- Number keeps increasing after each click

Change something:
- Click once more and observe duplication increases again

This is the required problem-before-solution moment.

---

### Concept: Idempotent Render Function

**What it is:** An idempotent render function produces the same final UI when run repeatedly with the same input state.

**The problem before:** Naive append-based rendering (`+=`) accumulates duplicates on repeated renders.

**The solution:** Rebuild the rendered output from current state in one pass and replace container content each time.

**What it hides:**
- Hidden complexity: manual cleanup of previously rendered nodes
- Protected invariant: for a fixed `tasks` array, screen output is exactly one card per task, no duplicates

**Canonical example (General Explanation):**
- Analogy: rewriting a whiteboard list from the source spreadsheet each refresh, instead of appending old lines again
- Minimal code form: `container.innerHTML = tasks.map(...).join('')`
- Why this works: output is a pure transform of current state

**Project Application (The "Why" here):** In this isolated wall, clicking `Render Again` should not change UI when data has not changed.

**Smallest possible example:**

```js
function renderNames(names, container) {
  container.innerHTML = names.map((n) => `<li>${n}</li>`).join('');
}
```

**Why it matters here:** Idempotence makes rerendering safe and predictable.

**Constraints:** Input state must be authoritative. Hidden side effects inside render break determinism.

**Failure modes:** Partial updates from multiple async sources can race and cause stale or flickering UI.

**Operational reality:** Framework renderers (React/Vue/Svelte) are built around idempotent render principles for correctness and reconciliation.

**You will see this again in:**
- React component rendering
- Server-side templates
- PDF/report generation pipelines
- Sync jobs that recompute target state
- Interview questions on render determinism

**Watch for:** Mixing mutation and render logic in the same function.

---

### Concept: `Array.prototype.map` for UI Transformation

**What it is:** `map` transforms each element of an array into a corresponding output element.

**The problem before:** Manual repeated card markup is verbose and error-prone.

**The solution:** Use `map` to transform each task record into one card markup string.

**Canonical example (General Explanation):**
- Analogy: translating a list of names into ID badges using one badge template rule
- Minimal code: `numbers.map(n => n * 2)`
- Why this works: one transformation rule applied consistently to each item

**Project Application (The "Why" here):** We transform every task record into a card snippet, then join those snippets into one HTML string.

**Smallest possible example:**

```js
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2); // [2, 4, 6]
```

**Why it matters here:** `map` gives one predictable rule for one record-to-one-card rendering.

**Constraints:** Callback must return a value each time; otherwise output includes `undefined`.

**Failure modes:** Heavy synchronous mapping on very large arrays can block the main thread.

**Operational reality:** Large list rendering usually adds pagination, virtualization, or windowing.

**You will see this again in:**
- React JSX list rendering
- Data export transformations
- API response shaping
- ETL pipelines
- Coding interviews on arrays

**Watch for:** Forgetting to return from a block-body callback.

---

## Step 5 — Apply the Fix with Idempotent Rendering

Replace `naiveRender` with this version:

```html
<script>
  const tasks = [
    { id: 't1', label: 'Bug', title: 'Fix login redirect' },
    { id: 't2', label: 'Feat', title: 'Add dark mode toggle' },
    { id: 't3', label: 'Docs', title: 'Write API overview' },
  ];

  const cardListEl = document.getElementById('card-list');
  const renderAgainBtn = document.getElementById('render-again');

  function renderTaskWall() { // <- was: naiveRender
    const cardsMarkup = tasks.map((task) => { // <- add this: transform data to markup
      return `
        <article class="card" data-id="${task.id}">
          <span class="label">${task.label}</span>
          <h2 class="card-title">${task.title}</h2>
        </article>
      `;
    }).join(''); // <- add this: merge array of strings

    cardListEl.innerHTML = cardsMarkup; // <- was: += append, now replace content
  }

  renderTaskWall(); // <- was: naiveRender
  renderAgainBtn.addEventListener('click', renderTaskWall); // <- was: naiveRender
</script>
```

### SAVE AND TRY

Save and click `Render Again` 5 times.

You should see:
- Exactly 3 cards always
- No duplication

In DevTools Console, run:

```js
document.querySelectorAll('.card').length
```

Expected:
- Always `3`, no matter how many times you click

Change something:
- Add one more task object to `tasks`
- Save and verify card count becomes `4`
- Click `Render Again` repeatedly and verify it remains `4`

---

## 🎯 Challenge: Add Priority Without Breaking the Invariant

**You know:** Data records, `map`, and idempotent rendering.

**Task:** Add a `priority` field (`P1`, `P2`, `P3`) to each task and render it on each card under the title while keeping render idempotent.

**Starting code:** Current Step 5 code.

**Hints:**
1. Extend each task object first.
2. Add one more line in the mapped template string.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const tasks = [
  { id: 't1', label: 'Bug', title: 'Fix login redirect', priority: 'P1' },
  { id: 't2', label: 'Feat', title: 'Add dark mode toggle', priority: 'P2' },
  { id: 't3', label: 'Docs', title: 'Write API overview', priority: 'P3' },
];

function renderTaskWall() {
  const cardsMarkup = tasks.map((task) => {
    return `
      <article class="card" data-id="${task.id}">
        <span class="label">${task.label}</span>
        <h2 class="card-title">${task.title}</h2>
        <p class="card-priority">Priority: ${task.priority}</p>
      </article>
    `;
  }).join('');

  cardListEl.innerHTML = cardsMarkup;
}
```

**Key insight:** You can add fields and presentation details without changing the render invariant: one state snapshot in, one deterministic UI snapshot out.

</details>

---

## 🎯 Challenge: Demonstrate the Alternative and Explain the Tradeoff

**You know:** We chose idempotent replacement rendering.

**Task:** Temporarily switch back to append rendering (`+=`) and record what fails after three clicks. Then restore idempotent rendering and record what changes.

**Starting code:** Current Step 5 code.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
// Temporary wrong alternative for demonstration only:
cardListEl.innerHTML += cardsMarkup;

// Correct version to restore:
cardListEl.innerHTML = cardsMarkup;
```

**Key insight:** We chose replacement rendering because repeated renders are expected in real apps. Append rendering can be valid for infinite feed loading, but it is wrong for full-state rerendering.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Isolated example renders cards from data | Reload and confirm card text matches `tasks` array values |
| Render is idempotent | Click `Render Again` multiple times; card count remains constant |
| Problem-before-solution was observed | Reintroduce append (`+=`) and confirm duplication returns |
| `map` transformation is active | Add a task record and verify one new card appears after save |
| Invariant holds | For unchanged `tasks`, repeated renders produce identical UI |

---

## Quick Check Answers

**1. If the same render logic runs twice, should the screen change the second time?**
If input state is unchanged and render is idempotent, the final UI should be identical. In this lab, `renderTaskWall()` with replacement rendering keeps card count stable.

**2. Why is hardcoded HTML for repeated cards fragile?**
It duplicates structure and content editing work. Data-driven rendering keeps structure in one place and content in records, reducing divergence and mistakes.

**3. What does it mean for a render process to be deterministic?**
The same input state always produces the same output UI. Here, the same `tasks` array always generates the same `cardsMarkup`.

**4. Prediction: if a button click appends cards every time without clearing old cards, what happens after 5 clicks?**
The UI accumulates duplicates linearly with each click. In the naive version, each click appended another full copy of all cards.

---

## What You Can Build Now

You can now take any list of structured records and render a stable, repeatable card-style UI from it using an idempotent render abstraction. You know how to diagnose duplication bugs, compare alternatives (`+=` append vs full replacement), and protect a render invariant so repeated rerenders stay correct. If it works: repeated render triggers do not inflate the UI, and visible output always matches current data exactly.
