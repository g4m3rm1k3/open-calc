# Lesson File Schema

Every lesson must be a `.js` file exported as `lesson` and placed in
`src/data/learn/dsa-patterns/`. The file name matches the lesson ID
(e.g. `dsa-1-1-1.js`). Do not register it in `LearnPage.jsx` until
the user approves it.

---

## Top-level shape

```js
export const lesson = {
  id:          String,   // e.g. 'dsa-patterns-1-1-1'
  series:      { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title:       String,   // e.g. '1.1.1 Memory: Stack and Heap'
  checkpoints: Array,    // see Checkpoint below
  segments:    Array,    // see Segment types below
}
```

---

## Checkpoint

```js
{ id: String, label: String }
```

One checkpoint per major section of the lesson. The lesson plan spec
requires at least 3 checkpoints per lesson (one per chapter section).

---

## Segment types

All segments live in the `segments` array in order.

### narration

Plain teaching segment. No interaction.

```js
{
  type: 'narration',
  id:   String,   // kebab-case, unique within the lesson
  text: String,   // the narration — spoken and displayed. No markdown.
                  // Plain prose only. Every term used here must have
                  // been defined in an earlier narration segment.
  code: String | null,  // JS code shown in the editor alongside the text.
                        // null if this is a pure prose segment.
                        // Built incrementally — each narration segment
                        // adds only what its text just explained.
                        // New lines marked with // ← NEW in comments.
}
```

### challenge

Interactive coding exercise.

```js
{
  type:           'challenge',
  id:             String,
  text:           String,   // the task description — specific, no vague instructions
  expectedOutput: null,     // always null (validated by validate fn instead)
  startCode:      String,   // the scaffold the student starts from
  hint:           String,   // one concrete hint, not the solution
  validate:       Function, // ({ logs: string[] }) => boolean
                            // logs is the array of console.log outputs as strings
}
```

### checkpoint

Section marker. Must match an id in the top-level `checkpoints` array.

```js
{ type: 'checkpoint', id: String }
```

### codelens

The final segment of every lesson. Contains the complete lesson code
for the student to step through in the visualiser.

```js
{
  type: 'codelens',
  id:   String,
  text: String,   // specific step-by-step instructions: which function to
                  // step through, what to watch in the Variables panel,
                  // what the call stack will show at each key moment.
                  // Must name at least 4 specific things to observe.
  code: String,   // complete, clean version of the lesson's final code.
                  // No // ← NEW markers. No scaffolding comments.
  lang: 'js',
}
```

---

## Required segment order

Every lesson must follow this order:

```
intro           (narration, code: null)
vocabulary      (narration, code: null) — define every term used in the lesson
prereq          (narration, code: null) — state prerequisites explicitly

[concept steps] (narration segments, code builds incrementally)
                Each narration adds only what it just explained.
                New lines marked // ← NEW.

ch-[section]    (challenge)
cp-[section]    (checkpoint)

... repeat concept → challenge → checkpoint for each major section ...

pattern-bridge  (narration + code) — connect DSA to the design pattern
ch-pattern      (challenge)
cp-pattern      (checkpoint)

codelens-setup  (narration) — tell the student what to watch
cl-[lesson-id]  (codelens)  — complete final code
```

---

## Code rules

- Each narration `code` block shows the **full current state** of the
  file, with new lines marked `// ← NEW` or changed lines `// ← CHANGED`.
- No segment adds more than ~12 new lines of code.
- Variable names are always meaningful. No unexplained single letters
  except loop counters `i`, `j` (which must be described in the text).
- Every non-obvious line has an inline comment.
- The final `codelens` segment contains the complete, clean code with
  no `// ← NEW` markers and no scaffolding comments.

---

## Text rules

- `text` fields are plain prose. No markdown headers, no bullet lists.
- Every technical term must be defined the first time it appears —
  either in the `vocabulary` segment or inline in the narration before use.
- No forward references: never mention something that will be explained
  later. Either explain it now or do not mention it.
- No "as you know" or "recall that" — prerequisites are handled by the
  `prereq` segment. Narration text does not assume unstated knowledge.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| File name | `{lesson-id}.js` | `dsa-1-1-1.js` |
| `lesson.id` | `'dsa-patterns-{id}'` | `'dsa-patterns-1-1-1'` |
| `lesson.title` | `'{id} {Title}'` | `'1.1.1 Memory: Stack and Heap'` |
| Segment ids | kebab-case | `'step1-stack-frame'` |
| Checkpoint ids | `'cp-{topic}'` | `'cp-stack'` |
| Challenge ids | `'ch-{topic}'` | `'ch-stack'` |
| CodeLens id | `'cl-{lesson-id}'` | `'cl-1-1-1'` |
