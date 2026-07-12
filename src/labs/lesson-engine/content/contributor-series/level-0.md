---
series: contributor-series
level: 0
title: What Markdown Is
lang: javascript
---

# What Markdown Is

Every lesson in the lesson engine — the text you're reading right now — is a plain text file. No Word document, no CMS, no special editor required. Contributors write lessons in their text editor of choice, commit the file to git, and the lesson engine turns it into an interactive lesson automatically.

The format that makes this possible is Markdown: a set of simple conventions where `##` becomes a heading, `**text**` becomes bold, and a triple-backtick block becomes a runnable code cell. Learning Markdown is the first step to contributing a lesson, because that's what you'll be writing.

By the end of this lesson you will understand what Markdown is and why it's used for lesson content, recognize the most common Markdown elements (headings, bold, italic, lists, code blocks), and be able to write a simple Markdown document that renders correctly.

## Plain text with meaning

```text
Markdown source:
  # This becomes a big heading
  ## This becomes a smaller heading
  This is a normal paragraph.
  **This text is bold.** _This is italic._

What it renders to:
  ┌─────────────────────────────┐
  │  This becomes a big heading  │  ← <h1>
  │  ─────────────────────────   │
  │  This becomes a smaller      │  ← <h2>
  │  heading                     │
  │                              │
  │  This is a normal paragraph. │  ← <p>
  │  This text is bold. This     │
  │  is italic.                  │
  └─────────────────────────────┘
```

**CS lens:** Markdown is a **markup language** — it adds meaning (semantics) to plain text using lightweight symbols. HTML is also a markup language, but more verbose: `<h1>Big heading</h1>` vs `# Big heading`. Markdown was designed by John Gruber in 2004 to be readable as plain text while also being convertible to HTML. Most documentation, README files, and educational platforms (including this one) use Markdown.

## The syntax you'll use most

```text
Headings:
  # H1 — lesson title
  ## H2 — section heading
  ### H3 — sub-section heading

Text:
  **bold text**
  _italic text_
  `inline code` — monospace, used for code snippets inline in text

Lists:
  - First item
  - Second item
  - Third item

Code blocks (triple backticks + language name):
  ```javascript
  const x = 5
  console.log(x)
  ```

  ```css
  .box { background: red; }
  ```

Line breaks:
  Leave a blank line between paragraphs.
  Lines without a blank line between them are the same paragraph.
```

## Code blocks are the core of every lesson

```text
A lesson is mostly a sequence of code blocks — examples the learner can see and run.
The language name after the triple backtick matters:

  ```python        → Python code (runs in Pyodide)
  ```javascript    → JavaScript code (runs in the browser)
  ```css           → CSS (renders as live preview with paired html block)
  ```html          → HTML (paired with css block for live preview)
  ```text          → Plain text (shows as output/explanation, not runnable)
  ```bash          → Shell commands (shown but not run)
  ```test          → Test assertions (the challenge test runner reads these)

The triple backtick must be closed with another triple backtick.
The most common mistake: forgetting to close a code block.
```

**SE lens:** Markdown is the de facto standard for technical writing. GitHub README files, Notion documents, Obsidian notes, Slack messages, and millions of documentation sites all use Markdown. Learning it once makes you effective in all of those contexts. It's also version-control-friendly — plain text diffs cleanly in git, unlike Word documents or PDFs.

**Common mistakes:**
- Forgetting the blank line before and after a code block — without it, the code block may not render correctly in some parsers.
- Putting the language name on the wrong line — the backticks and language name must be on the same line: ` ```javascript `, not ` ``` ` then `javascript` on the next line.

**Debug tip:** VS Code shows a Markdown preview when you open a `.md` file — press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows) to open the preview pane. This lets you see how your Markdown renders without running the dev server.

**Next:** Git basics — how to save your work and collaborate with others.

## Challenge: markdown_syntax

Complete the Markdown examples.

```challenge
const markdown = {
  // Write a Markdown H2 heading that says "Introduction":
  h2Heading: '',
  // Write inline code for the word "console.log":
  inlineCode: '',
  // What language name goes after the backticks for a runnable Python block?
  pythonBlockLang: '',
  // What language name goes after the backticks for explanatory text (not runnable)?
  textBlockLang: '',
}
```

```test
assert markdown.h2Heading.startsWith('##')
assert markdown.h2Heading.includes('Introduction')
assert markdown.inlineCode.startsWith('`') && markdown.inlineCode.endsWith('`')
assert markdown.inlineCode.includes('console.log')
assert markdown.pythonBlockLang === 'python'
assert markdown.textBlockLang === 'text'
```
