# SE Masterclass — LAB-39 — Markdown Editor

**Language: TypeScript (Browser)** — same module as LAB-37–38.

**Prerequisites:** LAB-10/11 (lexer/parser — markdown parsing is the SAME pipeline, a different grammar) and LAB-32 (signals — live preview re-renders reactively on every keystroke).

**What this lab adds:**
- A markdown tokenizer and parser, structurally identical to LAB-10/11's pipeline
- A renderer: AST → HTML, the same "walk the tree, produce output" shape as LAB-12's evaluator
- A live, reactive split-pane preview — typing triggers automatic re-parsing and re-rendering
- XSS safety: why raw user text must be ESCAPED before being inserted as HTML

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `# Hello` should become `<h1>Hello</h1>`. What TWO pipeline stages (named in Phase 1) does turning text into that HTML require?
> 2. If a user types `<script>alert('hacked')</script>` into the markdown editor, what should the PREVIEW show — an alert popup, or literal text?
> 3. Re-parsing the ENTIRE document on every single keystroke — is that wasteful in the way LAB-35 studied, or is it actually fine here?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a two-pane editor — a `<textarea>` on the left, live-rendered HTML on the right — and DevTools console shows:

```
=== Tokenizing Markdown ===
"# Hello" tokens: [ { type: 'HEADING', level: 1, text: 'Hello' } ]
"**bold** and normal" tokens: [ { type: 'TEXT', text: '**bold** and normal' } ]

=== Parsing Block Structure ===
AST: [ { type: 'Heading', level: 1, children: [...] }, { type: 'Paragraph', children: [...] } ]

=== Rendering AST to HTML ===
input: "# Hello\n\nThis is **bold** text."
output: <h1>Hello</h1><p>This is <strong>bold</strong> text.</p>

=== Live Preview: Reactive Re-render ===
typing "# Hi"...
preview: <h1>Hi</h1>
typing "# Hi there"...
preview: <h1>Hi there</h1>
  ← re-rendered automatically on every keystroke — no manual "update preview" call

=== XSS Safety ===
input: "<script>alert('hacked')</script>"
unsafe output (DO NOT USE): <script>alert('hacked')</script>
safe output (escaped): &lt;script&gt;alert('hacked')&lt;/script&gt;
  ← rendered as literal TEXT, never executed as a real <script> tag
```

---

### Concept: Markdown Parsing Is LAB-10/11's Pipeline, Different Grammar

**What it is:** Converting markdown text into HTML follows the EXACT same shape as LAB-10's lexer and LAB-11's parser: raw text → tokens (classified pieces) → an AST (structured tree) → (new to this lab) rendered output. The GRAMMAR is different (headings, bold, lists instead of numbers and operators), but the PIPELINE ARCHITECTURE is identical.

---

## Step 1 — Tokenize Block-Level Markdown

```ts
// md-lexer.ts

interface Token {
  type: 'HEADING' | 'LIST_ITEM' | 'TEXT' | 'BLANK'
  level?: number
  text: string
}

export function tokenizeLine(line: string): Token {
  if (line.trim() === '') {
    return { type: 'BLANK', text: '' }
  }
  const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)         // ← add: one or more '#', a space, then text
  if (headingMatch) {
    return { type: 'HEADING', level: headingMatch[1].length, text: headingMatch[2] }
  }
  const listMatch = line.match(/^-\s+(.*)$/)                     // ← add: '- ' prefix
  if (listMatch) {
    return { type: 'LIST_ITEM', text: listMatch[1] }
  }
  return { type: 'TEXT', text: line }
}

export function tokenize(markdown: string): Token[] {
  return markdown.split('\n').map(tokenizeLine)
}
```

```ts
// main.ts
import { tokenize } from './md-lexer'

console.log('=== Tokenizing Markdown ===')
console.log('"# Hello" tokens:', tokenize('# Hello'))
console.log('"**bold** and normal" tokens:', tokenize('**bold** and normal'))
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
=== Tokenizing Markdown ===
"# Hello" tokens: [ { type: 'HEADING', level: 1, text: 'Hello' } ]
"**bold** and normal" tokens: [ { type: 'TEXT', text: '**bold** and normal' } ]
```

**Confirm this mirrors LAB-10 exactly:** Character-pattern classification (here, regex on a whole line instead of character-by-character scanning) → a typed token — the SAME "classify, then produce a token" shape, just working at LINE granularity instead of CHARACTER granularity, since markdown's block structure (headings, list items, paragraphs) is fundamentally line-oriented.

---

## Step 2 — Parse Into Block Structure

```ts
// md-parser.ts
import { tokenize } from './md-lexer'

export interface HeadingNode { type: 'Heading'; level: number; text: string }
export interface ParagraphNode { type: 'Paragraph'; text: string }
export interface ListNode { type: 'List'; items: string[] }
export type BlockNode = HeadingNode | ParagraphNode | ListNode

export function parse(markdown: string): BlockNode[] {
  const tokens = tokenize(markdown)
  const blocks: BlockNode[] = []
  let currentParagraph: string[] = []
  let currentList: string[] = []

  function flushParagraph(): void {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'Paragraph', text: currentParagraph.join(' ') })
      currentParagraph = []
    }
  }
  function flushList(): void {
    if (currentList.length > 0) {
      blocks.push({ type: 'List', items: currentList })
      currentList = []
    }
  }

  for (const token of tokens) {
    if (token.type === 'HEADING') {
      flushParagraph(); flushList()
      blocks.push({ type: 'Heading', level: token.level!, text: token.text })
    } else if (token.type === 'LIST_ITEM') {
      flushParagraph()
      currentList.push(token.text)
    } else if (token.type === 'BLANK') {
      flushParagraph(); flushList()
    } else {
      flushList()
      currentParagraph.push(token.text)
    }
  }
  flushParagraph(); flushList()
  return blocks
}
```

Add to `main.ts`:

```ts
import { parse } from './md-parser'

console.log('\n=== Parsing Block Structure ===')
console.log('AST:', parse('# Hello\n\nThis is a paragraph.'))
```

### SAVE AND TRY

**Expected (shape):**
```
=== Parsing Block Structure ===
AST: [ { type: 'Heading', level: 1, text: 'Hello' }, { type: 'Paragraph', text: 'This is a paragraph.' } ]
```

**Confirm the flush pattern:** `flushParagraph`/`flushList` are called whenever a DIFFERENT kind of block starts (or a blank line ends the current one) — this "accumulate lines, then commit as one block on a boundary" pattern is exactly why consecutive `TEXT` tokens merge into ONE `Paragraph` node instead of many separate ones.

---

## Step 3 — Render AST to HTML

```ts
// md-renderer.ts
import { BlockNode } from './md-parser'

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')      // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>')                    // *italic*
}

export function render(blocks: BlockNode[]): string {
  return blocks.map(block => {
    if (block.type === 'Heading') return `<h${block.level}>${renderInline(block.text)}</h${block.level}>`
    if (block.type === 'Paragraph') return `<p>${renderInline(block.text)}</p>`
    if (block.type === 'List') return `<ul>${block.items.map(i => `<li>${renderInline(i)}</li>`).join('')}</ul>`
    return ''
  }).join('')
}
```

Add to `main.ts`:

```ts
import { render } from './md-renderer'

console.log('\n=== Rendering AST to HTML ===')
const source = '# Hello\n\nThis is **bold** text.'
console.log(`input: "${source.replace('\n', '\\n')}"`)
console.log(`output: ${render(parse(source))}`)
```

### SAVE AND TRY

**Expected:**
```
=== Rendering AST to HTML ===
input: "# Hello\n\nThis is **bold** text."
output: <h1>Hello</h1><p>This is <strong>bold</strong> text.</p>
```

**Confirm this is LAB-12's evaluator shape:** `render` walks the block AST (LAB-06's tree traversal, at the top level; a flat array here since markdown blocks don't NEST the way expressions do) and, for each node, produces OUTPUT based on `node.type` — exactly LAB-12's `evaluate(node)` branching on `node.type` to decide what to do.

---

## Step 4 — Live, Reactive Preview

```ts
import { createSignal, createEffect } from './signals'

console.log('\n=== Live Preview: Reactive Re-render ===')
const app = document.querySelector<HTMLDivElement>('#app')!
const container = document.createElement('div')
container.style.display = 'flex'
container.style.gap = '16px'

const textarea = document.createElement('textarea')
textarea.style.width = '300px'
textarea.style.height = '200px'
const preview = document.createElement('div')
preview.style.width = '300px'
preview.style.border = '1px solid #ccc'

container.append(textarea, preview)
app.appendChild(container)

const [source2, setSource] = createSignal('')

textarea.addEventListener('input', () => setSource(textarea.value))    // every keystroke updates the signal

createEffect(() => {                                                     // ← add: automatically re-parses AND re-renders
  preview.innerHTML = render(parse(source2()))
})

console.log('typing "# Hi"...')
setSource('# Hi')
console.log(`preview: ${preview.innerHTML}`)
console.log('typing "# Hi there"...')
setSource('# Hi there')
console.log(`preview: ${preview.innerHTML}`)
console.log('  ← re-rendered automatically on every keystroke — no manual "update preview" call')
```

### SAVE AND TRY

Save. Type into the textarea in the browser — confirm the preview pane updates live, on every keystroke.

**Confirm the reactive chain, end to end:** `textarea`'s `input` event → `setSource` (a LAB-32 signal write) → the `createEffect` (which reads `source2()`) automatically re-runs → `parse` (LAB-11's pipeline) → `render` (LAB-12's pipeline) → `preview.innerHTML` updated. Five distinct systems from earlier in this curriculum, composed into one live editor, with NO manual "call updatePreview() after every keystroke" code anywhere — that connection is automatic, exactly like LAB-31's cart bug is now structurally impossible.

---

## 🎯 Challenge: XSS Safety

**You know:** `preview.innerHTML = someString` makes the BROWSER interpret `someString` as real HTML — including `<script>` tags, which would actually EXECUTE if inserted this way.

**Task:** Before rendering user-typed TEXT content (not the markdown syntax characters themselves, but literal text between them), escape HTML special characters (`<`, `>`, `&`) so user input can never inject real HTML/script tags into the page.

<details>
<summary>▶ Show Solution</summary>

```ts
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Modify renderInline to escape FIRST, then apply markdown formatting:
function renderInline(text: string): string {
  const escaped = escapeHtml(text)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}
```

```ts
console.log('\n=== XSS Safety ===')
const dangerousInput = `<script>alert('hacked')</script>`
console.log(`input: "${dangerousInput}"`)
console.log(`unsafe output (DO NOT USE): ${dangerousInput}`)
console.log(`safe output (escaped): ${escapeHtml(dangerousInput)}`)
console.log('  ← rendered as literal TEXT, never executed as a real <script> tag')
```

**Key insight:** `preview.innerHTML = rawUserText` (never escaping) is a REAL, exploitable Cross-Site Scripting (XSS) vulnerability — ANY text a user types that happens to look like HTML gets interpreted as REAL HTML by the browser, including executable `<script>` tags. Escaping (`<` → `&lt;`, etc.) BEFORE inserting into `innerHTML` ensures user text is always treated as literal, inert TEXT, no matter what it contains — this is the same "validate/sanitize at the boundary" instinct from LAB-09, applied to a genuine security concern instead of a correctness one.

</details>

### SAVE AND TRY

**Expected:**
```
=== XSS Safety ===
input: "<script>alert('hacked')</script>"
unsafe output (DO NOT USE): <script>alert('hacked')</script>
safe output (escaped): &lt;script&gt;alert('hacked')&lt;/script&gt;
  ← rendered as literal TEXT, never executed as a real <script> tag
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `tokenize` / `parse` / `render` | `marked`, `remark`, `commonmark` — real markdown libraries, same 3-stage shape |
| Live reactive preview | Typora, Obsidian, GitHub's markdown editor preview pane |
| XSS escaping | Every markdown renderer that accepts untrusted input MUST do this, or it's a security bug |

**Where you will see this again:** LAB-85 (Template Engine) and LAB-89 (Formatter) both reuse this EXACT tokenize → parse → render/transform shape for different text formats.

---

## Final Check

| Feature | How to verify |
|---|---|
| Headings, list items, and plain text lines tokenize with the correct type | Step 1 |
| Consecutive text lines merge into one paragraph block | Step 2 |
| `render()` correctly produces nested HTML tags, including inline bold/italic | Step 3 |
| Typing in the textarea updates the preview automatically, live | Step 4 |
| Malicious input (`<script>`) renders as escaped, inert text, not executable HTML | Challenge |
| You can explain, without notes, why this lab's pipeline mirrors LAB-10/11/12 | Concept box |

---

## Quick Check Answers

**1. `# Hello` → `<h1>Hello</h1>` — what two pipeline stages does this require?**

Tokenizing (LAB-10's shape: classify `# Hello` as a `HEADING` token with `level: 1` and `text: 'Hello'`) and rendering (this lab's new stage: walk the resulting AST and produce the corresponding HTML string, `<h1>Hello</h1>`) — with parsing (LAB-11's shape, Step 2) sitting between them to group tokens into structured BLOCKS before rendering ever happens, exactly mirroring the three-stage lexer → parser → evaluator pipeline from Phase 1's calculator project.

**2. User types `<script>alert('hacked')</script>` — alert popup or literal text?**

Literal text — demonstrated in the Challenge. If the raw string were inserted directly via `innerHTML` unescaped, the browser WOULD execute it as a real `<script>` tag (a genuine XSS vulnerability); after `escapeHtml` converts `<` to `&lt;` and `>` to `&gt;`, the browser has no way to interpret it as an HTML tag at all — it can only ever display it as the literal characters `<script>alert('hacked')</script>`, inert and harmless.

**3. Re-parsing the whole document on every keystroke — wasteful, or fine here?**

Generally fine for a text document of normal size — unlike LAB-35's concern (unnecessary REPEATED DOM writes for the SAME logical update), re-parsing a few hundred lines of markdown on each keystroke is cheap, plain JavaScript work (LAB-08's complexity lens: parsing is roughly O(n) in document length, and `n` here is small). For a VERY large document, a real editor might debounce re-parsing (only re-parse after typing pauses) or incrementally re-parse only the CHANGED region — but for typical document sizes, the simplicity of "just re-parse everything, every time" (this lab's approach) is a completely reasonable engineering trade-off, not a mistake.

---

*Next: [LAB-40 — Drawing App](LAB-40-drawing-app.md) — TypeScript (Browser), same module*
