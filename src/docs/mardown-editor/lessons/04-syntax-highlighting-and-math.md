# Lesson 4 — Syntax Highlighting and Math

## What You Will Build

Code blocks become syntax-highlighted: a Python block shows Python keywords in blue, strings
in green, and comments in grey. A fenced block labelled ` ```sql ``` ` gets SQL colouring.
Mathematical expressions — `$E = mc^2$` inline or a `$$` block — render as properly typeset
equations. By the end of this lesson the app looks like a real technical curriculum, not a
plain text reader.

---

## What You Need to Know First

- Lesson 3: `react-markdown`, the AST, `ReactMarkdown`'s `components` prop, `useEffect`,
  loading state

---

## The Lesson

### Step 1 — The Remark/Rehype Pipeline

`react-markdown` processes markdown through a two-stage pipeline. Understanding the pipeline
is the key to extending it.

**Stage 1 — remark: markdown text → mdast (Markdown AST)**
`remark` is a markdown processor. Its plugins transform text into an AST called **mdast**
(Markdown Abstract Syntax Tree). The `remark-math` plugin, for example, recognises `$...$`
and `$$...$$` as math nodes and adds them to the mdast.

**Stage 2 — rehype: mdast → hast (HTML AST) → React elements**
`rehype` takes the mdast, converts it to **hast** (Hypertext Abstract Syntax Tree — the
same tree structure but for HTML), and then `react-markdown` converts the hast to React
elements. The `rehype-katex` plugin converts math nodes in the hast to KaTeX HTML.

**CS lens:** The pipeline is a classic **chain of transformers**. Each plugin is a pure
function: it receives the AST, transforms it, and returns the transformed AST. The
plugins are stateless and composable — you can add, remove, and reorder them. This is
the functional programming concept of function composition applied to a processing pipeline.
It is the same architectural pattern as Unix pipes:

```
cat file.md | remark-math | rehype-katex | react-markdown
```

Each stage receives the output of the previous stage. No stage needs to know anything
about the stages before or after it.

**SE lens:** The pipeline is the **open/closed principle** in action. `react-markdown` is
closed for modification — we do not fork it or change its source. It is open for extension
through plugins. Adding math support is adding `remarkMath` and `rehypeKatex` to the plugin
arrays. Adding a new feature in the future is another plugin, not a modification.

### Step 2 — Install the Packages

```
$ npm install remark-math rehype-katex katex
$ npm install --save-dev @types/katex
```

**Each package explained:**

- `remark-math` — a remark plugin that parses `$...$` and `$$...$$` as math nodes in the AST
- `rehype-katex` — a rehype plugin that converts math AST nodes to KaTeX-rendered HTML
- `katex` — the KaTeX rendering engine itself. KaTeX is a JavaScript library that typesets
  LaTeX math expressions. It is faster than MathJax (the other major option) because it is
  synchronous — it renders immediately without waiting for web fonts to load.
- `@types/katex` — TypeScript type definitions for KaTeX, installed as a `devDependency`
  because types are only needed at compile time

**Why KaTeX and not MathJax?**
MathJax renders more LaTeX features but loads fonts asynchronously — math appears as raw
LaTeX briefly, then re-renders when fonts load (called a "flash of unstyled math"). KaTeX
renders immediately but supports a subset of LaTeX. For a programming curriculum, KaTeX's
subset is sufficient and the immediate rendering is better for the student.

### Step 3 — Syntax Highlighting with Shiki

**What Shiki is:**
Shiki is a syntax highlighter that uses the same grammar files as VS Code — called
TextMate grammars. Every language VS Code highlights, Shiki can highlight. It produces
accurate, VS-Code-quality output.

**How Shiki works:**
Shiki tokenises source code using the TextMate grammar for the language, then applies
a colour theme to the tokens. The output is HTML: each token is wrapped in a `<span>`
with an inline `style` attribute containing the colour. The resulting HTML looks like:

```html
<span style="color: #569cd6">def</span>
<span style="color: #dcdcaa"> greet</span>
```

**Why Shiki over alternatives like highlight.js or Prism?**
highlight.js and Prism use regex-based tokenisers — they are simple but miss edge cases
that VS Code handles correctly (nested string interpolation, complex generics, template
literals). Shiki's TextMate grammars are the same ones tested against millions of real
codebases. For a learning tool where code correctness matters, the grammar quality matters.

**The trade-off:** Shiki loads grammar files lazily — the first time a language is
highlighted, Shiki downloads that language's grammar (~20–100KB). This takes a fraction
of a second on the first highlight. All subsequent highlights of the same language are
immediate. We will address this loading time in Lesson 8.

Install Shiki:

```
$ npm install shiki
```

### Step 4 — The Code Block Component

In `packages/renderer/src/CodeBlock.tsx`:

```typescript
import React, { useEffect, useState } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

let shikiHighlighter: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (shikiHighlighter === null) {
    shikiHighlighter = createHighlighter({
      themes: ['github-dark'],
      langs: [
        'python', 'javascript', 'typescript', 'sql', 'bash',
        'json', 'yaml', 'css', 'html', 'markdown'
      ],
    })
  }
  return shikiHighlighter
}

interface CodeBlockProps {
  readonly language: string | undefined
  readonly children: string
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [highlightedHTML, setHighlightedHTML] = useState<string | null>(null)

  const normalizedLanguage = language?.toLowerCase() ?? 'text'

  useEffect(() => {
    getHighlighter().then(highlighter => {
      const supportedLangs = highlighter.getLoadedLanguages()
      const langToUse = supportedLangs.includes(normalizedLanguage as never)
        ? normalizedLanguage
        : 'text'

      const html = highlighter.codeToHtml(children, {
        lang: langToUse,
        theme: 'github-dark',
      })
      setHighlightedHTML(html)
    })
  }, [children, normalizedLanguage])

  if (highlightedHTML === null) {
    return (
      <pre style={{ background: '#0d1117', padding: '1rem', borderRadius: '6px' }}>
        <code>{children}</code>
      </pre>
    )
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlightedHTML }}
      style={{ borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}
    />
  )
}
```

**Module-level variable for the highlighter:**
`shikiHighlighter` is declared outside the component. It is a module-level variable —
it exists as long as the module is loaded (the lifetime of the app) rather than the
lifetime of a component instance.

The first call to `getHighlighter()` creates the Highlighter and stores the Promise.
Every subsequent call returns the same Promise — the Highlighter is created exactly once
and shared across all `CodeBlock` instances. This is the **flyweight pattern**: one
expensive object (the Shiki highlighter with its loaded grammars) shared by many
lightweight consumers (the code block components).

**CS lens:** The `shikiHighlighter` variable is a **lazy singleton** — it is not created
until it is first needed (lazy), and only one instance ever exists (singleton). The
`if (shikiHighlighter === null)` check is the guard that ensures creation happens once.
This pattern appears everywhere in systems programming: a database connection pool,
a thread pool, a compiled regex.

**SE lens:** Keeping the highlighter at module level rather than component level is a
performance decision: if each `CodeBlock` created its own Shiki instance, a page with
20 code blocks would create 20 highlighters and load the same grammar files 20 times.
One shared instance loads each grammar file once. This is separation of concerns between
the instance lifecycle (module scope) and the component lifecycle (component scope).

**`dangerouslySetInnerHTML` explained:**
Shiki returns a complete HTML string — `<pre><code><span style="color:...">...</span>...`.
To render this HTML in React, we use `dangerouslySetInnerHTML={{ __html: html }}`. React
named this prop "dangerously" to make it explicit that you are bypassing React's XSS
protection: normally React escapes all HTML content, preventing `<script>` tags and other
injected HTML from rendering. `dangerouslySetInnerHTML` turns off that escaping.

**Is this safe here?** Yes, because `html` is generated by Shiki from the code block's
content — it is not user-supplied HTML. The code block content came from a `.md` file on
disk that the student opened. The rendered HTML is Shiki's output: spans with colour styles,
nothing else. The danger label is appropriate — use it only when you are certain of the
source.

**What breaks if you use `innerHTML = highlightedHTML` directly (without React):**
React does not track the DOM node's children — any subsequent React render would overwrite
the `innerHTML` with whatever React thinks the children should be (nothing, since no
`children` prop is passed). Using `dangerouslySetInnerHTML` tells React to manage this
property.

### Step 5 — Adding Math Support to ReactMarkdown

In `packages/renderer/src/ChapterView.tsx`, add the plugins:

```typescript
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { CodeBlock } from './CodeBlock'
import type { Chapter } from '@codex/core'

interface ChapterViewProps {
  readonly chapter: Chapter
  readonly onReadContent: (filePath: string) => Promise<string>
}

export function ChapterView({ chapter, onReadContent }: ChapterViewProps) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setContent(null)

    onReadContent(chapter.filePath)
      .then(text => {
        setContent(text)
        setIsLoading(false)
      })
      .catch(err => {
        setError(String(err))
        setIsLoading(false)
      })
  }, [chapter.filePath, onReadContent])

  if (isLoading) {
    return <div style={{ color: '#888', padding: '2rem' }}>Loading…</div>
  }

  if (error !== null) {
    return (
      <div style={{ color: '#e74c3c', padding: '2rem' }}>
        <strong>Could not load chapter</strong>
        <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{error}</pre>
      </div>
    )
  }

  return (
    <article style={{ padding: '2rem', color: 'white', maxWidth: '800px' }}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const language = match ? match[1] : undefined
            const codeText = String(children).replace(/\n$/, '')

            const isBlock = node?.position !== undefined &&
              node.position.start.line !== node.position.end.line

            if (isBlock && language !== undefined) {
              return <CodeBlock language={language}>{codeText}</CodeBlock>
            }

            return (
              <code
                style={{
                  fontFamily: 'Menlo, Consolas, monospace',
                  fontSize: '0.875em',
                  background: '#0f3460',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '3px',
                }}
                {...props}
              >
                {children}
              </code>
            )
          }
        }}
      >
        {content ?? ''}
      </ReactMarkdown>
    </article>
  )
}
```

**The `components` prop explained:**
`react-markdown`'s `components` prop is a map from HTML element names to React components.
When `react-markdown` would render a `<code>` element, it calls `components.code` instead.
This is the **adapter pattern**: we are replacing `react-markdown`'s default `code` renderer
with our own, without modifying `react-markdown`.

**Distinguishing inline code from fenced code blocks:**
Both inline backtick code (`` `variable` ``) and fenced code blocks (` ``` `) produce
`<code>` elements. The difference:
- Fenced code blocks have a `className` like `language-python` (set by `react-markdown`
  based on the language tag)
- Inline code has no `className`

We also check `node.position.start.line !== node.position.end.line` — a block spans
multiple lines; inline code is on one line.

If it is inline code or has no language, we render a plain styled `<code>` element.
If it is a fenced block with a language, we render our `CodeBlock` component with Shiki
syntax highlighting.

**`import 'katex/dist/katex.min.css'` explained:**
KaTeX needs its own CSS to render equations correctly — it uses CSS classes for layout and
font styling. `import 'katex/dist/katex.min.css'` tells Vite to include this CSS file in
the build. Vite handles CSS imports natively.

**`remarkPlugins` and `rehypePlugins` explained:**
`remarkPlugins={[remarkMath]}` passes `remarkMath` to the remark stage of the pipeline.
`remarkMath` adds a transform that recognises `$...$` and `$$...$$` and creates math nodes.
`rehypePlugins={[rehypeKatex]}` passes `rehypeKatex` to the rehype stage. `rehypeKatex`
finds math nodes and replaces them with KaTeX-rendered HTML.

**Walkthrough of math rendering:**
1. Markdown text contains `$E = mc^2$`
2. remark parses the text; `remarkMath` identifies it as an inline math node
3. The mdast node is: `{ type: 'inlineMath', value: 'E = mc^2' }`
4. rehype converts the mdast to hast; `rehypeKatex` finds the math node
5. `rehypeKatex` calls `katex.renderToString('E = mc^2', { throwOnError: false })`
6. KaTeX returns an HTML string with spans, SVG paths, and CSS classes
7. That HTML is injected into the hast
8. `react-markdown` converts the hast to React elements
9. The browser renders the KaTeX HTML — a properly typeset equation appears

### Step 6 — KaTeX CSS in Electron

Add the KaTeX CSS import to the renderer's HTML entry point. The CSS file contains font
declarations and layout rules that KaTeX requires. Without it, equations appear as
unstyled spans.

In `apps/electron/src/renderer/index.tsx`, the `import 'katex/dist/katex.min.css'` in
`ChapterView.tsx` is sufficient when using Vite — Vite automatically processes CSS imports
and injects them into the page. No manual `<link>` tag is needed.

---

## Connect the Pieces

The `CodeBlock` component from this lesson will be extended in Lesson 5 to add a **Run**
button. The language detection logic (`const match = /language-(\w+)/.exec(className ?? '')`)
is also what Lesson 5 uses to decide whether a Run button should appear — Python gets a
button, YAML does not.

The `components` override in `ChapterView` is the pivot point where the markdown pipeline
meets the execution system. Every lesson that adds behaviour to code blocks extends this
`code` override.

---

## What Breaks Without This

If `import 'katex/dist/katex.min.css'` is omitted, math equations appear with correct
typesetting (KaTeX still renders the HTML) but the layout breaks: fraction bars are
misaligned, superscripts overlap with base text, and radical signs are mispositioned.
The equations are technically present but unreadable. This is a common error when first
integrating KaTeX — the rendering works but the CSS dependency is missed.

---

## Definition of Done

- [ ] A Python fenced code block shows syntax highlighting with at least three distinct colours
- [ ] An SQL block shows SQL keyword highlighting
- [ ] `$E = mc^2$` inline renders as a typeset equation
- [ ] A `$$` display math block renders centred on its own line
- [ ] Inline code (backtick) is styled but not syntax-highlighted
- [ ] Clicking between chapters correctly re-renders highlighting for each chapter's code
- [ ] You can answer: what is a TextMate grammar and why does Shiki use them?
- [ ] You can answer: what is the difference between `remarkPlugins` and `rehypePlugins`?
- [ ] `git commit` with a message explaining why
