# New Lesson Format — Concrete Example

## The rules

1. **No positional metadata in the file.** `chapter`, `order`, `course` all come from
   the folder structure and filename. Never write them in the lesson object.

2. **The renderer owns the display order.** It always renders:
   hook → sections → examples → challenges → quiz → crossRefs
   The lesson file does not control this sequence.

3. **`sections` replaces everything.** No more `intuition`, `mentalModel`, `applications`,
   `walkthroughs`, `discovery`, `story`. They were all just sections with fancy names.
   A section is: optional heading, prose paragraphs, callouts, and/or a viz.

4. **`code` is in the section that needs it.** Not at the top level.
   Language drives which runner appears: `'python'` → Pyodide, `'javascript'` → sandbox,
   `'matlab'` → OpenMAT.

5. **Named export `const lesson`.** Consistent, easy to import, works with the lesson editor.

---

## Folder layout

```
src/content/lessons/git-0/
  meta.json
  1-fundamentals/
    videos.json          ← only videos for THIS chapter
    001-why-version-control.js
    002-first-commit.js
    003-branches.js
```

## meta.json
```json
{
  "title": "Git Fundamentals",
  "description": "Version control from first principles.",
  "color": "emerald",
  "icon": "git"
}
```

## videos.json (per chapter, not per course)
```json
[
  { "title": "Git in 100 Seconds", "url": "https://youtube.com/..." },
  { "title": "Git Branches Explained", "url": "https://youtube.com/..." }
]
```

---

## 001-why-version-control.js  (the new format)

```js
export const lesson = {
  // ── Identity ────────────────────────────────────────────────────────────
  id:       'git-0-001',
  slug:     'why-version-control',
  title:    'What Is Git?',
  subtitle: 'The save button that actually works',
  tags:     ['git', 'version-control', 'commits', 'history'],

  // ── Hook ────────────────────────────────────────────────────────────────
  // Always rendered first. Question sets the problem, context earns attention.
  hook: {
    question: 'You spent three hours getting a feature working. You tried one more change, broke everything, and hit Ctrl+Z for ten minutes. Then you closed the editor. Now what?',
    realWorldContext: `Before Git, developers solved this by copying folders.
You'd end up with project/, project-backup/, project-old/, project-v2/,
project-WORKING/, project-FINAL/, project-FINAL-real/. For one person it barely holds
together. For two people it collapses immediately — two people save different versions
of the same file and there's no way to combine them.`,
  },

  // ── Sections ────────────────────────────────────────────────────────────
  // Rendered in order. Each section is independent — heading is optional.
  // prose is an array of markdown strings (each renders as a paragraph).
  // callouts highlight key ideas. viz embeds a component inline.
  sections: [
    {
      heading: 'The timeline model',
      prose: [
        `Git replaces the folder graveyard with a proper timeline. Every time you reach
a state worth preserving, you take a **commit** — a labeled snapshot of every tracked
file, timestamped and linked to the previous one.`,
        `That chain of commits is your project's history. You can jump to any point in it
instantly, compare any two points, or restore any file to exactly how it was at any commit.
Nothing in the chain can be overwritten or lost.`,
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Commit when something works — not when it\'s "done"',
          body: 'Every commit is a restore point. The question is how much work you\'re willing to lose if something goes wrong.',
        },
        {
          type: 'important',
          title: 'Git never destroys committed work',
          body: 'If it was in a commit, it still exists — no matter what you do to the files afterward.',
        },
      ],
    },
    {
      heading: 'Three ways to use Git — same commands underneath',
      prose: [
        `You work with Git in three places: the **terminal** (raw commands like \`git commit\`,
\`git log\`), a **dedicated GUI** like GitKraken or Fork, or your **editor's built-in
integration** — VS Code's Source Control sidebar (Cmd+Shift+G on Mac).`,
        `All three run the same Git commands. Professionals switch between them depending
on what's faster. The panel below simulates the VS Code sidebar.`,
      ],
      viz: {
        id: 'GitWorkspace',
        title: 'VS Code Source Control Panel',
        caption: 'Edit game-design.txt, type a commit message, click Commit. A dot appears in the graph — your first permanent checkpoint.',
        props: {
          label: 'dungeon-explorer',
          instanceId: 'git-0-001',
          showStaging: false,
          initialFiles: {
            'game-design.txt': `GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.`,
          },
        },
      },
    },
  ],

  // ── Examples ────────────────────────────────────────────────────────────
  // Worked examples — renderer shows these after sections.
  examples: [
    {
      title: 'Your first three commands',
      body: `\`\`\`bash
git init          # start tracking this folder
git add .         # stage all files
git commit -m "Initial commit"  # save the snapshot
\`\`\``,
    },
  ],

  // ── Challenges ──────────────────────────────────────────────────────────
  // Practice tasks — renderer shows these after examples.
  challenges: [
    {
      id:   'git-0-001-c1',
      prompt: 'Make a commit using the panel above. Then make a second commit with a different message. How many dots appear in the graph?',
      hint: 'Each commit creates one dot. Two commits → two dots.',
    },
  ],

  // ── Quiz ────────────────────────────────────────────────────────────────
  quiz: [
    {
      question: 'What does a Git commit store?',
      options: [
        'Only the lines that changed',
        'A snapshot of every tracked file at that moment',
        'A compressed zip of the entire project folder',
        'A pointer to the previous file on disk',
      ],
      answer: 1,
      explanation: 'A commit stores a snapshot of every tracked file — not a diff. Git computes diffs on demand from snapshots, which is why comparing any two commits is fast.',
    },
  ],

  // ── Definitions ─────────────────────────────────────────────────────────
  // Auto-indexed by the autoLoader into the global GLOSSARY.
  definitions: [
    { term: 'commit',  definition: 'A permanent snapshot of every tracked file, linked to the previous commit in a chain.' },
    { term: 'staging', definition: 'The act of telling Git which changes to include in the next commit, using `git add`.' },
    { term: 'HEAD',    definition: 'A pointer to the commit you are currently on. Moving HEAD is how you navigate history.' },
  ],

  // ── Cross-references ────────────────────────────────────────────────────
  crossRefs: [
    { slug: 'git-0-003-branches', title: 'Branches', reason: 'Commits form the nodes — branches are the labels that point to them.' },
  ],
}
```

---

## What a coding lesson looks like (Python example)

```js
export const lesson = {
  id:       'python-1-001',
  slug:     'numbers-and-structure',
  title:    'Numbers & Structure',
  subtitle: 'What numbers really are — and what computers do to them',
  tags:     ['python', 'float', 'int', 'precision'],

  hook: {
    question: 'Why does Python say 0.1 + 0.2 = 0.30000000000000004?',
    realWorldContext: `In 1991 a Patriot missile system failed to intercept a Scud because
a 0.000000095 second clock error, accumulated over 100 hours, caused a 687-metre targeting miss.
Not a software bug — a consequence of representing infinitely many real numbers in a fixed number of bits.`,
  },

  sections: [
    {
      heading: 'The number hierarchy',
      prose: [
        `Numbers fall into families: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Python's type system mirrors this
— \`int\` is exact and unbounded, \`float\` is approximate and bounded.`,
      ],
      callouts: [
        { type: 'important', title: 'int is exact. float is approximate.',
          body: 'Python int uses arbitrary-precision arithmetic. float is a 64-bit IEEE 754 binary fraction — 0.1 is stored as an approximation.' },
      ],
      code: {
        language: 'python',
        cells: [
          {
            id:   'c1',
            label: 'See the difference',
            code: `print(2 ** 1000)        # int — exact, no limit\nprint(0.1 + 0.2)        # float — approximate\nprint(0.1 + 0.2 == 0.3) # False!`,
          },
        ],
      },
    },
  ],

  challenges: [
    {
      id:     'python-1-001-c1',
      prompt: 'Use `import math; math.isclose(0.1 + 0.2, 0.3)` — what does it return and why is it different from `==`?',
      hint:   'isclose checks if two floats are within a tolerance, not exactly equal.',
    },
  ],

  definitions: [
    { term: 'float',   definition: 'A 64-bit IEEE 754 binary fraction. Approximately 15-17 significant decimal digits of precision.' },
    { term: 'epsilon', definition: 'The smallest float such that 1.0 + epsilon ≠ 1.0. About 2.22e-16 in Python.' },
  ],

  quiz: [
    {
      question: 'Which Python type can represent 2^1000 exactly?',
      options: ['float', 'int', 'decimal', 'complex'],
      answer: 1,
      explanation: 'Python int is arbitrary-precision — it grows as large as memory allows with no rounding.',
    },
  ],
}
```

---

## Key differences from the old format

| Old | New |
|-----|-----|
| `export default { ... }` | `export const lesson = { ... }` |
| `chapter: 'dsa1'` in file | derived from folder `1-arrays/` |
| `order: 3` in file | derived from filename `003-arrays.js` |
| `intuition: { prose, callouts }` | `sections: [{ heading, prose, callouts }]` |
| `mentalModel: [...]` | another section with a heading |
| `applications: { ... }` | another section with a heading |
| `python: { cells }` / `openmat: {...}` | `code: { language, cells }` inside a section |
| `visualizations: [...]` at top level | `viz: { id, props }` inside the section that needs it |
| `supplementalVisualizations` | more sections |
| `aliases: [...]` | merged into `tags` |
| `timeToComplete`, `prerequisites` | deleted |
