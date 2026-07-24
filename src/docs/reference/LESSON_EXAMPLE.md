# New Lesson Format — Canonical Reference

## The rules

1. **No positional metadata in the file.**
   `chapter`, `order`, `course` come from folder structure and filename. Never write them in the lesson.

2. **The renderer owns the display order.** Always:
   `hook → sections → challenges → quiz → crossRefs`
   The lesson file does not control this sequence.

3. **Sections contain ordered blocks.**
   A block is a `{ type, ...fields }`. The renderer loops through blocks in order.
   This lets you interleave prose, callouts, code, and viz naturally.

4. **`export const lesson`** — named export everywhere. Consistent, editor-friendly.

5. **Videos live in one file per course.** Tag with `chapter` number to group them.
   To add a video: append a line. Never dig through lesson files.

---

## Folder layout

```
src/content/lessons/
  git-0/
    meta.json          ← course title, description, color, icon
    videos.json        ← ALL videos for this course (tag by chapter)
    1-fundamentals/
      001-why-version-control.js
      002-first-commit.js
      003-branches.js
    2-collaboration/
      001-remotes.js
      002-pull-requests.js
```

---

## meta.json
```json
{
  "title": "Git Fundamentals",
  "description": "Version control from first principles.",
  "color": "emerald",
  "icon": "git"
}
```

---

## videos.json — one file for the whole course
```json
[
  { "title": "Git in 100 Seconds",     "url": "https://youtube.com/...", "chapter": 1 },
  { "title": "Git Branches Explained", "url": "https://youtube.com/...", "chapter": 1 },
  { "title": "Merging vs Rebasing",    "url": "https://youtube.com/...", "chapter": 2 },
  { "title": "GitHub Pull Requests",   "url": "https://youtube.com/...", "chapter": 2 }
]
```

- All videos accessible from anywhere in the course
- Current chapter's videos surface at the top of the panel
- To add a video: append one line. Done.

---

## Block types (the building blocks of sections)

| `type`      | Required fields | Notes |
|-------------|-----------------|-------|
| `prose`     | `text`          | Markdown string. Renders as a paragraph. |
| `callout`   | `variant`, `title`, `body` | variant: `insight` `warning` `important` `procedure` |
| `viz`       | `id`, `props`   | Embeds a viz component inline. Optional `title`, `caption`. |
| `code`      | `language`, `cells` | language: `python` `javascript` `matlab`. Renders the correct runner. |
| `example`   | `title`, `body` | Worked example block. Body is markdown. |
| `image`     | `src`, `alt`    | Static image. Optional `caption`. |

---

## 001-why-version-control.js — full example

```js
export const lesson = {
  // ── Identity ──────────────────────────────────────────────────────────
  id:       'git-0-001',
  slug:     'why-version-control',
  title:    'What Is Git?',
  subtitle: 'The save button that actually works',
  tags:     ['git', 'version-control', 'commits', 'history'],

  // ── Hook ──────────────────────────────────────────────────────────────
  hook: {
    question: 'You spent three hours getting a feature working. You made one more change, broke everything, and closed the editor. Now what?',
    realWorldContext: `Before Git, developers solved this by copying folders — project/, project-backup/,
project-old/, project-FINAL/, project-FINAL-real/. For one person it barely holds together.
For a team it collapses immediately.`,
  },

  // ── Sections ──────────────────────────────────────────────────────────
  // Each section has an optional heading and an ordered array of blocks.
  // Blocks render top to bottom — mix prose, callouts, viz, and code freely.
  sections: [
    {
      heading: 'The timeline model',
      blocks: [
        {
          type: 'prose',
          text: `Git replaces the folder graveyard with a proper timeline. Every time you reach
a state worth preserving, you take a **commit** — a labeled snapshot of every tracked file,
timestamped and linked to the previous one.`,
        },
        {
          type: 'callout',
          variant: 'insight',
          title: 'Commit when something works — not when it\'s "done"',
          body: 'Every commit is a restore point. The question is how much work you\'re willing to lose.',
        },
        {
          type: 'prose',
          text: `That chain of commits is your history. You can jump to any point instantly,
compare any two commits, or restore any file. Nothing in the chain can be lost.`,
        },
        {
          type: 'callout',
          variant: 'important',
          title: 'Git never destroys committed work',
          body: 'If it was in a commit, it still exists — no matter what you do to the files afterward.',
        },
      ],
    },
    {
      heading: 'Three ways to use Git — same commands underneath',
      blocks: [
        {
          type: 'prose',
          text: `You work with Git in three places: the **terminal** (raw commands),
a **GUI** like GitKraken or Fork, or your **editor's built-in panel** (VS Code Source Control, Cmd+Shift+G).
All three run the same commands.`,
        },
        {
          type: 'viz',
          id:    'GitWorkspace',
          title: 'VS Code Source Control panel',
          caption: 'Edit the file, type a commit message, click Commit. A dot appears in the graph — your first permanent checkpoint.',
          props: {
            label: 'dungeon-explorer',
            instanceId: 'git-0-001',
            showStaging: false,
            initialFiles: {
              'game-design.txt': 'GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.',
            },
          },
        },
        {
          type: 'prose',
          text: 'Try it: make two commits using the panel above. Then open the terminal view and run `git log --oneline`. You should see both commits listed.',
        },
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────
  challenges: [
    {
      id:     'git-0-001-c1',
      prompt: 'Make a commit in the panel above. Then make a second commit with a different message. How many dots appear in the graph?',
      hint:   'Each commit creates one dot.',
    },
    {
      id:     'git-0-001-c2',
      prompt: 'Run `git log --oneline` in the terminal. What does each line represent?',
      hint:   'Each line is one commit — its short hash and message.',
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────────────
  quiz: [
    {
      question: 'What does a Git commit store?',
      options: [
        'Only the lines that changed',
        'A snapshot of every tracked file at that moment',
        'A compressed zip of the entire project folder',
        'A pointer to the previous file on disk',
      ],
      answer:      1,
      explanation: 'A commit stores a full snapshot of every tracked file. Git computes diffs from snapshots on demand.',
    },
  ],

  // ── Definitions ───────────────────────────────────────────────────────
  // Auto-indexed by autoLoader into the global GLOSSARY.
  definitions: [
    { term: 'commit',  definition: 'A permanent snapshot of every tracked file, linked in a chain to the previous commit.' },
    { term: 'staging', definition: 'Telling Git which changes to include in the next commit, via `git add`.' },
    { term: 'HEAD',    definition: 'A pointer to the commit you are currently on.' },
  ],

  // ── Cross-references ──────────────────────────────────────────────────
  crossRefs: [
    { slug: 'git-0-003-branches', title: 'Branches', reason: 'Commits form the nodes — branches are labels that point to them.' },
  ],
}
```

---

## Coding lesson example (Python)

```js
export const lesson = {
  id:       'python-1-001',
  slug:     'numbers-and-structure',
  title:    'Numbers & Structure',
  subtitle: 'What numbers really are — and what computers do to them',
  tags:     ['python', 'float', 'int', 'precision'],

  hook: {
    question: 'Why does Python say 0.1 + 0.2 = 0.30000000000000004?',
    realWorldContext: `In 1991 a Patriot missile system failed because a 0.000000095 second
clock error, accumulated over 100 hours, caused a 687-metre targeting miss.
Not a software bug — a consequence of representing real numbers in a fixed number of bits.`,
  },

  sections: [
    {
      heading: 'The number hierarchy',
      blocks: [
        {
          type: 'prose',
          text: 'Numbers fall into families: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Python\'s type system mirrors this — `int` is exact and unbounded, `float` is approximate.',
        },
        {
          type: 'callout',
          variant: 'important',
          title: 'int is exact. float is approximate.',
          body: '`int` uses arbitrary-precision arithmetic — 2**1000 is exact. `float` is a 64-bit IEEE 754 binary fraction — 0.1 is stored as an approximation.',
        },
        {
          type: 'code',
          language: 'python',
          cells: [
            {
              id:    'c1',
              label: 'See the difference',
              code:  `print(2 ** 1000)        # int — exact, no limit\nprint(0.1 + 0.2)        # float — approximate\nprint(0.1 + 0.2 == 0.3) # False!`,
            },
          ],
        },
        {
          type: 'prose',
          text: 'Run that. The last line prints `False` — not because Python is broken, but because neither 0.1 nor 0.2 can be represented exactly in binary.',
        },
        {
          type: 'callout',
          variant: 'procedure',
          title: 'Safe float comparison',
          body: 'Never use `==` to compare floats. Use `math.isclose(a, b)` which checks if two values are within a tolerance.',
        },
        {
          type: 'code',
          language: 'python',
          cells: [
            {
              id:    'c2',
              label: 'The right way to compare floats',
              code:  `import math\nprint(math.isclose(0.1 + 0.2, 0.3))  # True`,
            },
          ],
        },
      ],
    },
  ],

  challenges: [
    {
      id:     'python-1-001-c1',
      prompt: 'What is `sys.float_info.epsilon`? Run `import sys; print(sys.float_info.epsilon)` and explain what the number means.',
      hint:   'It\'s the smallest float such that 1.0 + epsilon ≠ 1.0.',
    },
  ],

  definitions: [
    { term: 'float',   definition: 'A 64-bit IEEE 754 binary fraction. ~15-17 significant decimal digits of precision.' },
    { term: 'epsilon', definition: 'The smallest float such that 1.0 + epsilon ≠ 1.0. About 2.22e-16 in Python.' },
  ],

  quiz: [
    {
      question: 'Which Python type can represent 2^1000 exactly?',
      options: ['float', 'int', 'decimal', 'complex'],
      answer:      1,
      explanation: 'Python int is arbitrary-precision — it grows as large as memory allows with no rounding.',
    },
  ],
}
```

---

## What changed from the old format

| Old | New |
|-----|-----|
| `export default { ... }` | `export const lesson = { ... }` |
| `chapter: 'dsa1'` in file | derived from folder name |
| `order: 3` in file | derived from filename `003-slug.js` |
| `intuition: { prose: [], callouts: [] }` | `sections: [{ blocks: [...] }]` |
| `mentalModel`, `applications`, `walkthroughs`, `story` | more sections with headings |
| `python: { cells }` / `openmat` / `notebooks` | `{ type: 'code', language: 'python', cells }` block inside a section |
| `visualizations: [{ id, props }]` at top level | `{ type: 'viz', id, props }` block inside the section that needs it |
| `supplementalVisualizations` | more sections |
| `aliases` | merged into `tags` |
| `timeToComplete`, `prerequisites`, `nextLesson` | deleted |
| `videos.json` per chapter | `videos.json` per course with `chapter` tag |
