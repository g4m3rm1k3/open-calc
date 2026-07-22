# Lesson 2: Decoupling Engine IDs from Display Labels

**What you will build** — You will fix broken syntax highlighting for specific languages (like JSX) by decoupling the internal ID sent to the syntax engine from the display label presented to the user.

**What you need to know first** — You need to understand basic React component structure and how dictionaries (objects) are used to map values.

## Concept Unit: Language Mapping Abstraction

### The Problem

When a user writes a Markdown code block with ` ```jsx `, the Monaco Editor is asked to render it using the language `"jsx"`. However, Monaco's built-in syntax engine only recognizes `"javascript"` (which natively supports JSX syntax), not `"jsx"`. We previously used a single variable to represent both the engine language and the display label, so fixing the engine meant breaking the label (making it say "JAVASCRIPT" instead of "JSX"). We need to sever this coupling so both sides get exactly what they need.

### Introduce the concept in isolation

```javascript
// Throwaway Example: Decoupling internal vs external names
const ENGINE_ID = {
  jsx: 'javascript',
  csharp: 'csharp'
};

const DISPLAY_LABEL = {
  jsx: 'JSX',
  csharp: 'C#'
};

function renderCodeBlock(userInput) {
  const engine = ENGINE_ID[userInput] || userInput;
  const label = DISPLAY_LABEL[userInput] || engine;
  
  console.log(`Starting engine for: ${engine}`);
  console.log(`Rendering UI badge: ${label}`);
}

renderCodeBlock('jsx');
```

*Output:*
```
Starting engine for: javascript
Rendering UI badge: JSX
```
*What this proves:* By passing the raw user input through two separate dictionaries rather than using the output of one as the input for the other, we can satisfy two conflicting requirements simultaneously. 

### Discard the throwaway example

This mock function is discarded and will not appear in the project again.

### Project Change

- **Reference Source** — No reference counterpart — this is a domain-specific bugfix for our Monaco/Markdown integration.
- **Files affected** — Modified `src/components/docs/MarkdownHub.jsx`.
- **Change type** — Refactor / Configure.
- **Location** — Inserted imports at the top; updated `MONACO_LANG` mapping near line 60; updated `MdCodeBlock` rendering logic.
- **Dependencies** — `LANG_LABEL` (from `codeDisplay.jsx`).

### The New Code — type it yourself

First, we update our mappings to include the new languages:

```jsx
// In MarkdownHub.jsx imports
import { LANG_LABEL } from '../markdown/codeDisplay.jsx'

// In the file scope constants
const MONACO_LANG = {
  py: 'python', js: 'javascript', ts: 'typescript', sh: 'shell', zsh: 'shell',
  xml: 'html', markup: 'html', bash: 'shell', rb: 'ruby', sqlite: 'sql',
  'c++': 'cpp', bf: 'brainfuck', brainfuck: 'brainfuck',
  jsx: 'javascript', tsx: 'typescript', 'c#': 'csharp', ps1: 'powershell',
  m: 'matlab'
}
```

Next, inside `MdCodeBlock`, we separate the variables:

```jsx
  const monacoLang = MONACO_LANG[language] || language
  const displayLang = LANG_LABEL[language] || monacoLang
```

### The Updated Project — return, immediately, before any explanation

Here is exactly how this logic integrates into the existing `MdCodeBlock` component:

```jsx
  // ... inside MdCodeBlock ...
  // ← new block starts
  const monacoLang = MONACO_LANG[language] || language
  const displayLang = LANG_LABEL[language] || monacoLang
  const runnable   = RUNNABLE_LANGS.has(language)
  // ← new block ends

  // ... 

  return (
    <div className="md-code-block">
      <div className="md-code-header">
        {/* ← new block starts */}
        <span className="md-code-lang">{displayLang}</span>
        {/* ← new block ends */}
        <div className="md-code-actions">
```
The `monacoLang` variable is then passed down to the `<Editor language={monacoLang} />` component.

### Mechanical walkthrough — how it works in isolation

1. `import { LANG_LABEL } from '../markdown/codeDisplay.jsx'` — **Genuinely basic**. Reusing a previously established mapping from another file to ensure consistency across the application.
2. `jsx: 'javascript', tsx: 'typescript'` — **First appearance**. These keys inform the dictionary that if the user explicitly writes `jsx` in the markdown fence, we must substitute it for `javascript` before passing it to Monaco.
3. `monacoLang = MONACO_LANG[language] || language` — **Genuinely basic**. If the dictionary lacks the key, fall back to whatever the user typed.
4. `displayLang = LANG_LABEL[language] || monacoLang` — **First appearance**. We intentionally look up the `language` (e.g., `'jsx'`) in `LANG_LABEL`, NOT the resolved `monacoLang`. If we used `monacoLang` (which is now `'javascript'`), it would incorrectly look up the label for JavaScript. 

### CS lens

This embodies the **Adapter Pattern**. Also recognized in: database drivers, API gateway payload transformations, React synthentic events, and electrical socket travel adapters.

The markdown string acts as the client, and the Monaco Editor acts as the incompatible interface. `MONACO_LANG` acts as the adapter mapping the client's concept of a language (`jsx`) into the system's concept of a language (`javascript`).

### SE lens — why it's engineered this way

**Separation of Concerns:** 

*Alternative not chosen:* We could have forced the user to type ` ```javascript ` in the markdown instead of ` ```jsx ` so Monaco would just work. 

*Tradeoff:* Forcing users to modify their data to accommodate an implementation quirk breaks encapsulation. The UI should accommodate the user's intent. By separating the *presentation* (what the badge says) from the *business logic* (what engine Monaco boots), we prevent the implementation details of a third-party dependency from leaking into our documentation authoring rules. 

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

When rendering a block written as ` ```jsx `, the badge displays:
`JSX`

And the editor background receives the correctly tokenized AST from Monaco's javascript engine, rendering with full syntax highlighting.

### One sentence connecting this unit to what came immediately before.

With the language parser satisfied, it correctly colors the code, and the UI label independently respects the theme.

---

## Closing

- **Connect the pieces** — `language` enters as `"jsx"`. `MONACO_LANG` turns it into `"javascript"` for the engine. `LANG_LABEL` independently turns `"jsx"` into `"JSX"` for the UI.
- **What breaks without this** — Without the `MONACO_LANG` mapping, Monaco sees `"jsx"`, fails to find a parser, and renders plain white text. Without `LANG_LABEL`, Monaco gets `"javascript"`, but the UI badge prints `"JAVASCRIPT"`.
- **Exercises** —
  - Add support for `.vue` syntax by mapping it to `html` for Monaco, while keeping the UI badge as "VUE".
- **Definition of done**
  - [x] Create distinct mappings for engine IDs and display IDs.
  - [x] Update Monaco to ingest the mapped ID.
  - [x] Update UI header to ingest the display ID.
  - [x] Git commit: `"fix: decouple monaco engine language IDs from display labels to restore JSX highlighting"`
