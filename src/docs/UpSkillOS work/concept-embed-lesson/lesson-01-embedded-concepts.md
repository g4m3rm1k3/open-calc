# Lesson 1: Dynamic Markdown Embedding

**What you will build** — You will build a system to seamlessly intercept specific markdown code blocks within lessons and replace them with a fully rendered, collapsible inline component containing the content of the referenced file. The core problem this solves is maintaining a single source of truth for "Concepts" while naturally embedding them into different lessons where they are mentioned, avoiding the maintenance nightmare of duplicating or copy-pasting concept explanations everywhere.

**What you need to know first** — You need to understand basic React component structure (props, state, effects) and how `react-markdown` uses a `components` map to override the default HTML rendering of markdown elements.

## Concept Unit: The Embedded Concept Component

### The Problem

We have a centralized `concepts/` directory containing markdown files that explain individual topics. In our lessons, we reference these concept files frequently. We want to automatically detect when a lesson references a concept file inside an inline code block (like `` `../concepts/python-decorators.md` `` or `` `python-decorators.md` ``), and instead of rendering plain text, fetch the raw markdown of that file and render it directly inline as a collapsible box. 

### Introduce the concept in isolation

Before we plug into the complex `MarkdownHub`, let's isolate the idea of a component that manages its own fetching and collapsible state.

```jsx
// Throwaway Example: A self-fetching toggle box
import { useState, useEffect } from 'react';

function FetchBox({ fileName }) {
  const [content, setContent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !content) {
      // Simulate fetching a file
      setTimeout(() => setContent(`Contents of ${fileName}`), 500);
    }
  }, [open, fileName, content]);

  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      <button onClick={() => setOpen(!open)}>
        {open ? '▼ Hide' : '▶ Show'} {fileName}
      </button>
      {open && (
        <div style={{ marginTop: '10px' }}>
          {content ? content : 'Loading...'}
        </div>
      )}
    </div>
  );
}
```
*Output when clicking "▶ Show example.md":*
```
▼ Hide example.md
Contents of example.md
```
*What this proves:* We can tie a data fetch to the explicit opening of a component (lazy loading) so we don't load 50 concept files the moment a lesson page loads, but only when the user specifically requests them.

### Discard the throwaway example

We will not use `FetchBox` in our project. It is discarded.

### Project Change

- **Reference Source** — No reference counterpart — this is a from-scratch addition because it's a domain-specific enhancement to our custom MarkdownHub renderer.
- **Files affected** — Modified `src/components/docs/MarkdownHub.jsx`.
- **Change type** — Add new component, modify existing `MdInlineCode` component.
- **Location** — Insert `ConceptEmbed` above `MdLink`. Update `MdInlineCode` body.
- **Dependencies** — `DOCS_MODULES` (the Vite import glob of all markdown files) and `SectionedMarkdown` (the recursive markdown renderer).

### The New Code — type it yourself

First, the component that will render the concept:

```jsx
function ConceptEmbed({ docPath, title }) {
  const [content, setContent] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !content && DOCS_MODULES[docPath]) {
      DOCS_MODULES[docPath]().then((res) => setContent(res))
    }
  }, [open, docPath, content])

  return (
    <span className="my-6 border rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm block w-full">
      <button 
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            📚
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Concept: {title}
          </span>
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-xs">
          {open ? '▼' : '▶'}
        </span>
      </button>
      {open && (
        <span className="block p-6 border-t border-slate-200 dark:border-slate-800 w-full overflow-x-auto bg-white dark:bg-slate-900 cursor-auto" onClick={(e) => e.stopPropagation()}>
          {content === null ? (
            <span className="text-slate-500 animate-pulse text-sm">Loading concept...</span>
          ) : (
            <span className="block w-full">
              <SectionedMarkdown content={content} />
            </span>
          )}
        </span>
      )}
    </span>
  )
}
```

Next, the interceptor logic inside `MdInlineCode`:

```jsx
  const isTddLesson = activeFile?.includes('/projects/inventory/tdd/lessons/')
  if (isTddLesson && text.endsWith('.md')) {
    const filename = text.split('/').pop()
    const forcedHref = `../concepts/${filename}`
    const docPath = resolveDocPath(activeFile, forcedHref)
    if (docPath) {
      const title = filename.replace('.md', '').replace(/[-_]/g, ' ')
      return <ConceptEmbed docPath={docPath} title={title} />
    }
  }
```

### The Updated Project — return, immediately, before any explanation

Here is exactly how this logic integrates into the existing `MdInlineCode` component, which is responsible for rendering all inline code blocks:

```jsx
function MdInlineCode({ children }) {
  const { activeFile } = useContext(DocsCtx)
  const text = String(children)

  // ← new block starts
  const isTddLesson = activeFile?.includes('/projects/inventory/tdd/lessons/')
  if (isTddLesson && text.endsWith('.md')) {
    const filename = text.split('/').pop()
    const forcedHref = `../concepts/${filename}`
    const docPath = resolveDocPath(activeFile, forcedHref)
    if (docPath) {
      const title = filename.replace('.md', '').replace(/[-_]/g, ' ')
      return <ConceptEmbed docPath={docPath} title={title} />
    }
  }
  // ← new block ends

  const ref = TERM_REFS[text]
  return (
    <>
      <code>{text}</code>
      {ref && (
        <span className={`md-ref-badge ${ref.src}`} title={ref.desc} /*...*/ >
          {ref.src}↗
        </span>
      )}
    </>
  )
}
```
The `MdInlineCode` component now acts as a router. When it encounters inline code, it checks if it's a concept reference. If it is, it short-circuits and completely replaces the standard `<code>` output with our full-width interactive `ConceptEmbed`. Otherwise, it falls through to the normal code formatting.

### Mechanical walkthrough — how it works in isolation

1. `isTddLesson = activeFile?.includes('/projects/inventory/tdd/lessons/')` — Basic string checking to ensure we only apply this logic within the specific TDD lessons.
2. `if (isTddLesson && text.endsWith('.md'))` — We check if the text inside the backticks ends in `.md`. This is our heuristic for identifying a concept reference.
3. `filename = text.split('/').pop()` — **First appearance**. The `split('/')` function splits a string into an array separated by slashes. `pop()` removes and returns the last element of an array. Combining these extracts just the filename (e.g., `browser-crypto.md`) regardless of whether the original text was `../concepts/browser-crypto.md` or just `browser-crypto.md`.
4. `forcedHref = '../concepts/' + filename` — We programmatically construct the correct path structure regardless of what the user typed.
5. `resolveDocPath(activeFile, forcedHref)` — **Genuinely basic** (a pre-existing utility function). It converts a relative path into an absolute project path (like `/src/docs/...`) and returns `null` if that path doesn't exist in the project files.
6. `if (docPath)` — We use the resolved path as a validation check. If the path returned `null` (e.g., the inline code was `CURRICULUM.md` but that doesn't exist in the concepts folder), we just skip the block.
7. `DOCS_MODULES[docPath]()` — **First appearance**. Vite's `import.meta.glob` creates an object where keys are file paths and values are functions that return a Promise containing the file's content. Calling it triggers an async network request for the raw markdown.

### CS lens

This technique embodies the **Interceptor Pattern**. Also recognized in: HTTP middleware, OS system call hooks, React Error Boundaries, and Axios request/response interceptors.

The interceptor sits in the middle of a standard processing pipeline (in this case, Markdown AST -> React Elements) and intercepts specific payloads to alter their execution path without the core rendering engine needing to know anything about `ConceptEmbed`.

### SE lens — why it's engineered this way

**The Principle of Robustness (Postel's Law):** "Be conservative in what you do, be liberal in what you accept from others."

The Markdown files were highly inconsistent in how they referenced concepts (some used `../concepts/`, some just used the filename). 
*Alternative not chosen:* Writing a script to mass-edit 300+ markdown files to standardize the string paths. 
*Tradeoff:* Modifying 300 files pollutes the git history and requires policing future lesson authors to enforce the exact formatting. By making the interceptor logic liberal in what it accepts (extracting the filename via `.pop()` and rebuilding the path), we handle the inconsistency at runtime. It costs a tiny bit of CPU time during render but eliminates a massive source of human error and maintenance overhead.

### Commands needed to make this unit real, if any

None. This runs entirely in the existing React application.

### Run it. Show the real output.

When visiting a lesson that contains `` `../concepts/python-namespace-isolation-venv.md` ``, the page output looks like:

```
[ 📚 Concept: python namespace isolation venv                      ▶ ]
```
When clicked, it expands:
```
[ 📚 Concept: python namespace isolation venv                      ▼ ]
|  # Python Namespace Isolation (Venv)
|  
|  Python virtual environments...
```

### One sentence connecting this unit to what came immediately before.

Because `ConceptEmbed` perfectly isolates the markdown fetching, we can safely drop it directly into the AST rendering pipeline without causing synchronous layout stalls.

---

## Closing

- **Connect the pieces** — A user types `` `concepts/my-concept.md` `` in a lesson. `ReactMarkdown` parses it into an AST inline-code node and passes it to `MdInlineCode`. Our interceptor recognizes the `.md` suffix, grabs `my-concept.md`, forces it to `../concepts/my-concept.md`, checks if it exists, and renders a `ConceptEmbed`. When the user clicks the rendered box, the effect fires, calls the Vite glob function, retrieves the text, and renders it through `SectionedMarkdown`.
- **What breaks without this** — If we remove the `if (docPath)` check, any inline code ending in `.md` (like a simple mention of `README.md`) will attempt to mount a ConceptEmbed. Since `README.md` isn't a concept, the glob fetch would fail, and it would render a permanently loading box.
- **Exercises** — 
  - Change the background color of the `ConceptEmbed` when it is in the `open` state.
  - Modify the logic to also intercept markdown *links* (using `MdLink`) instead of just inline code blocks, if they point to the concepts folder.
- **Definition of done**
  - [x] Create `ConceptEmbed` with lazy-loading state.
  - [x] Strip paths from inline code text.
  - [x] Validate against `DOCS_MODULES` before hijacking the render.
  - [x] Git commit: `"feat: intercept inline code concept references to render as embedded markdown components"`
