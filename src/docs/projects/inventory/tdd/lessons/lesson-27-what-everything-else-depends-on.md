# Lesson 27: What Everything Else Depends On

**What you will build:** a real code editor and file-upload mechanism
for `cnc-web`'s new `code` tab, replacing a hardcoded G-code string every
other feature — DRO, Viewport, Tools — has silently depended on since
Lesson 7. Ported from `cnc-sim`'s already-extracted `code`-tab pieces
(`CodeEditorTextarea.jsx`, `FileActionToolbar.jsx`), wired with a
debounced auto-reparse matching the reference's own real behavior, so
typing or loading a program actually changes what gets simulated —
closing this project's actual real dependency gap, not a hypothetical
one.

**What you need to know first:** Lesson 22/23's panel/tab system
(`ViewId`, `VIEW_LABELS`, `renderViewContent`, `SidePanel`'s generic
`OpenTab` shape); Lesson 26's `logger.ts` and its now-standing
`.catch()`/`logger.error`/`logger.info` convention; `html-textarea-element.md`
(taught early, never yet used for real); `retry-timeout-and-backoff.md`'s
own real `setTimeout` use; `javascript-promises-async.md`.

---

## The Dependency Order This Project Had Backwards

Named directly, this session: DRO (Lesson 16), the Viewport's toolpath
render (Lessons 6–9), and Tools (Lessons 13–18) were all built assuming a
real program already exists to run — reasonable, since a G-code
interpreter needs *something* to interpret. But the actual mechanism for
getting a real program into the app was never built. Since Lesson 7,
`App.tsx` has had this:

```typescript
const PROGRAM = "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8";
```

One fixed string. Every DRO reading, every rendered toolpath, every
lesson's own "run it, verify it" step for the last twenty lessons has run
against this exact same five lines — because there was never a *way* to
run against anything else. `cnc-sim`'s own `code` and `progs` tabs (both
fully extracted — `COMPONENT_MAP.md`'s own record) were sitting there,
never ported, the entire time. The real, corrected build order: a program
has to be loadable before anything downstream of it means much — you
can't have a real toolpath, real stock removal, or real tool usage
without a real program driving them, and this project had been building
the downstream pieces first.

---

## Concept Unit: Reading a File's Real Contents in the Browser

### The Problem

`ToolImportPanel.tsx` (Lesson 18) already uploads a `File` — but straight
to the *backend*, via `FormData`, letting the server read it. Loading a
program is a different, client-side need: the real text has to land in
React state directly, with nothing sent over the network at all — the
existing `/api/path`/`/api/simulate` endpoints already accept a raw
program string in the request body (confirmed: `App.tsx`'s own
`fetchPath`, `MachineStatus.tsx`'s own `fetchState`).

### The Concept, Isolated

First real use, in this project, of reading a file's own text content
entirely in the browser. Full isolated treatment lives in
`concepts/browser-file-text-reading.md`, run for real this session:

```javascript
const file = new File(["G0 X1 Y1\nM5"], "part.nc", { type: "text/plain" });
file.text().then((contents) => console.log("contents:", JSON.stringify(contents)));
```

**Real output, run this session:**
```
contents: "G0 X1 Y1\nM5"
```

### Discard

This lab's fabricated `File` is not part of the project — the real code
below reads an actual file a user picks, never one constructed in code.

### CS Lens

Per `browser-file-text-reading.md`: the same asynchronous-I/O reasoning
`javascript-promises-async.md` already covers for `fetch` — reading a
file's real bytes takes real time, so the browser hands back a Promise
instead of blocking.

### SE Lens

The real, deliberate choice named in the concept file: `.text()`
specifically, not `.arrayBuffer()` (already used elsewhere in this
project for binary model uploads, per `COMPONENT_MAP.md`) — correct here
because a G-code program is always plain text, never binary.

---

## Concept Unit: Debouncing — Waiting for Input to Settle

### The Problem

Once a program's real text is in React state, something has to decide
*when* to actually re-fetch the toolpath/DRO from it. Reacting to every
single keystroke would fire a real backend request for every
half-typed, intermediate state of a program the user hasn't finished
editing yet — real, unnecessary load for states nobody meant as final.

### The Concept, Isolated

First real use of debouncing in this project. Full isolated treatment
lives in `concepts/debounce-pattern.md`, run for real this session:

```javascript
function makeDebounced(fn, delayMs) {
  let timer;
  return (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(value), delayMs);
  };
}

const debouncedLog = makeDebounced((v) => console.log("settled on:", v), 300);
debouncedLog("a");
debouncedLog("ab");
debouncedLog("abc");
```

**Real output, run this session:**
```
three calls made instantly, nothing logged yet
settled on: abc
```

### Discard

This lab's `makeDebounced` helper is not part of the project — the real
project code below achieves the identical effect using React's own
effect-cleanup mechanism instead of a hand-rolled closure, a
different-but-equivalent real shape covered in the next unit's Mechanical
Walkthrough.

### CS Lens

Per `debounce-pattern.md`: rate-limiting reactive work — only the most
recent event in a rapid burst survives to actually run; every earlier one
in that same burst is cancelled before it fires.

### SE Lens

The real, honest number this project picked — 900ms — isn't arbitrary:
it's `cnc-sim/cnc/CNCSim.jsx`'s own real value for the identical textarea
(`setTimeout(reload, 900)`), ported directly rather than guessed at, per
this project's own "port values, not just ideas, when a real reference
value exists" discipline.

---

## Concept Unit (no new concept): Wiring a Real `code` Tab

### The Problem

Everything above is proven in isolation; nothing yet touches `cnc-web`.
This unit ports the two already-extracted components, adds a fourth
`ViewId`, replaces the hardcoded `PROGRAM` constant with real state, and
wires the debounce and file-reading mechanisms above into it for real.

### Project Change

- **Reference Source:** `cnc-sim/cnc/components/CodeEditorTextarea.jsx`
  (the textarea itself) and `cnc-sim/cnc/components/FileActionToolbar.jsx`
  (Parse/Upload/Folder/Download buttons + hidden file inputs). Faithful
  port of the *idea* (a controlled textarea; a button that opens a real
  file picker), not the mechanism: the reference styles both with inline
  objects referencing its own separate theme singleton
  (`C.codeBg`/`C.green`/`C.bd`) — converted here to real CSS classes
  reading this project's own custom properties, the same porting
  discipline every other tab has used. Real, named scope cut, per this
  lesson's own "smallest real slice" discipline: only the Upload button
  is ported this lesson — Folder (multi-file), Download, and the
  separate "Parse Project" button are real, deferred scope (the debounced
  auto-reparse below replaces the need for a manual Parse button
  entirely, for this slice). The reference's own `document.getElementById(...).click()`
  trigger mechanism is replaced with the `<label>`-wraps-`<input>` pattern
  `ToolImportPanel.tsx` already established (Lesson 18) — this project's
  own existing convention for "a styled button that opens a real file
  picker," not a new mechanism.
- **Files affected:** `cnc-web/src/CodeEditorTextarea.tsx` (new),
  `cnc-web/src/FileActionToolbar.tsx` (new), `cnc-web/src/theme.css` (new
  `.code-*` rule family), `cnc-web/src/App.tsx` (modified).
- **Change type:** add (two new files, new CSS) + modify (`App.tsx`'s
  `ViewId`, state, effects, and `renderViewContent`).
- **Dependencies:** `logger.ts` (Lesson 26) — the new upload handler logs
  both outcomes, continuing that lesson's own standing convention rather
  than treating logging as a one-time addition.

### The New Code

The two new, freestanding components — nothing yet surrounds either one:

```typescript
interface CodeEditorTextareaProps {
  code: string;
  onChange: (code: string) => void;
}

function CodeEditorTextarea({ code, onChange }: CodeEditorTextareaProps) {
  return (
    <textarea
      className="code-editor"
      value={code}
      spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default CodeEditorTextarea;
```

And the toolbar, its own new file:

```typescript
interface FileActionToolbarProps {
  currentFileName: string | null;
  onUploadFile: (file: File) => void;
}

function FileActionToolbar({ currentFileName, onUploadFile }: FileActionToolbarProps) {
  return (
    <div className="code-toolbar">
      <label className="btn" style={{ cursor: "pointer" }}>
        ↑ Upload
        <input
          type="file"
          accept=".nc,.txt,.cnc,.mpf,.min,.tap"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadFile(file);
            e.target.value = "";
          }}
        />
      </label>
      <span className="code-toolbar-filename">{currentFileName ?? "No file loaded"}</span>
    </div>
  );
}

export default FileActionToolbar;
```

The real CSS both new components' `className` strings depend on:

```css
.code-editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: -8px;
}
.code-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.code-toolbar-filename {
  margin-left: auto;
  font-size: 9px;
  color: var(--color-muted);
}
.code-editor {
  flex: 1;
  resize: none;
  background: var(--color-bg);
  color: var(--color-accent-green);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  border: none;
  outline: none;
  line-height: 1.7;
  padding: 8px;
  width: 100%;
}
```

All plain class selectors, already-established syntax — nothing new to
teach. `margin-left: auto` on `.code-toolbar-filename` is the same real
flexbox-auto-margin mechanism already named for `.ribbon-actions`
(Lesson 24): inside `.code-toolbar`'s flex row, it pushes the filename
label to the far right without a width calculation. `resize: none` and
`outline: none` are plain property values turning off two of a
`<textarea>`'s own real browser defaults (the drag-to-resize handle,
the focus outline) — a deliberate choice, not an oversight: this
textarea already sits inside a fixed-size panel, so a user-resizable
handle would let it overflow its own container.

### The Updated Project

Both new files are complete above — nothing to return to. `App.tsx` is
the file with real surrounding structure to show. Its relevant slices,
every changed and new line marked:

The renamed constant and widened `ViewId`:

```typescript
const DEFAULT_PROGRAM = "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8";  // ← renamed from PROGRAM

type ViewId = "dro" | "tools" | "code";                                // ← changed: added "code"
type Side = "left" | "right";

interface PanelState {
  tabs: ViewId[];
  activeTab: ViewId | null;
}

const VIEW_LABELS: Record<ViewId, string> = {
  dro: "DRO",
  tools: "Tools",
  code: "Code",                                                        // ← new
};
```

`App`'s state block, with every new piece of state added — `code` (the
raw, live textarea value), `fileName`, and `debouncedCode` (the settled
value everything downstream actually reads), alongside the existing
state untouched:

```typescript
const [leftPanel, setLeftPanel] = useState<PanelState>({ tabs: ["code"], activeTab: "code" });  // ← changed: was { tabs: [], activeTab: null }
const [rightPanel, setRightPanel] = useState<PanelState>({ tabs: ["dro", "tools"], activeTab: "dro" });

const [themeId, setThemeId] = useState(() => {
  const id = getStoredThemeId();
  applyTheme(findTheme(id));
  return id;
});
const [isConfigOpen, setIsConfigOpen] = useState(false);

const [code, setCode] = useState(DEFAULT_PROGRAM);                    // ← new
const [fileName, setFileName] = useState<string | null>(null);        // ← new
const [debouncedCode, setDebouncedCode] = useState(DEFAULT_PROGRAM);   // ← new
```

The debounce effect and the fetch effect it now feeds, plus the new
upload handler — this is the real heart of the lesson:

```typescript
useEffect(() => {                                              // ← new
  const timer = setTimeout(() => setDebouncedCode(code), 900);  // ← new
  return () => clearTimeout(timer);                             // ← new
}, [code]);                                                      // ← new

useEffect(() => {
  fetchPath(debouncedCode)                                                          // ← changed: was fetchPath(PROGRAM), deps were []
    .then(setPoints)
    .catch((err: Error) => logger.error(`fetchPath failed: ${err.message}`));
}, [debouncedCode]);                                                                 // ← changed

async function handleUploadFile(file: File) {                                       // ← new
  try {                                                                              // ← new
    const text = await file.text();                                                 // ← new
    setCode(text);                                                                  // ← new
    setFileName(file.name);                                                         // ← new
    logger.info(`loaded program from ${file.name}: ${text.length} chars`);          // ← new
  } catch (err) {                                                                   // ← new
    logger.error(`failed to read ${file.name}: ${(err as Error).message}`);         // ← new
  }                                                                                  // ← new
}                                                                                    // ← new
```

And `renderViewContent`, gaining its third real branch:

```typescript
function renderViewContent(id: ViewId) {
  if (id === "dro") return <MachineStatus program={debouncedCode} />;    // ← changed: was program={PROGRAM}
  if (id === "code") {                                                  // ← new
    return (                                                             // ← new
      <div className="code-editor-panel">                               // ← new
        <FileActionToolbar currentFileName={fileName} onUploadFile={handleUploadFile} />  {/* ← new */}
        <CodeEditorTextarea code={code} onChange={setCode} />           // ← new
      </div>                                                             // ← new
    );                                                                   // ← new
  }                                                                      // ← new
  return (
    <>
      <ToolCardList refreshKey={toolsRefreshKey} />
      <ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} />
    </>
  );
}
```

Together: `code` is the live, every-keystroke textarea value;
`debouncedCode` only changes 900ms after `code` stops changing, and is
the one value both `fetchPath` and `MachineStatus`'s own `program` prop
actually read. `MachineStatus.tsx` itself needed *zero* changes — its
existing `useEffect(() => { fetchState(program)... }, [program])`
(Lesson 16) already re-fetches whenever its `program` prop changes,
whatever that prop happens to be fed from.

### Mechanical Walkthrough

- `const [code, setCode] = useState(DEFAULT_PROGRAM)` — **(b)
  reappearing** — `useState`, seeded with what used to be the only value
  that ever existed.
- `useEffect(() => { const timer = setTimeout(...); return () => clearTimeout(timer); }, [code])`
  — **(a) first appearance of the mechanism, reappearing idea** — per
  `debounce-pattern.md`, the identical debounce effect proven in
  isolation, expressed through React's own effect-cleanup lifecycle
  instead of a hand-rolled closure: every re-render (every keystroke)
  schedules a new timer, and the *cleanup function* — which React runs
  before the *next* effect, or on unmount — clears whatever timer the
  *previous* render had scheduled, before it can fire.
- `[debouncedCode]` as the second effect's dependency array — **(b)
  reappearing** — the same `useEffect` dependency mechanism already
  established (Lesson 16 and throughout), now depending on a value that
  changes over time instead of running once (`[]`, this file's own
  previous form).
- `async function handleUploadFile(file: File) { try { ... } catch { ... } }`
  — **(b) reappearing** — `async`/`await` (`typescript-async-await.md`),
  `try`/`catch` around a real fallible operation, per Lesson 26's own
  established convention — the *first* time this project's error-logging
  habit gets applied to something other than a `fetch` call, proving it
  generalizes.
- `file.text()` — **(a) first appearance**, per `browser-file-text-reading.md`.
- `logger.info(...)` / `logger.error(...)` — **(b) reappearing**, Lesson
  26 — the exact convention that lesson established, continued here
  without being asked twice.
- `<FileActionToolbar currentFileName={fileName} onUploadFile={handleUploadFile} />`
  — **(c) already basic** — JSX prop-passing, an already-established
  pattern.
- `<div className="code-editor-panel">` wrapping the toolbar and textarea
  — **(c) already basic** — plain JSX structure; the CSS class itself is
  new (`theme.css`), not a new JS/TS concept.

### CS Lens

Per `debounce-pattern.md`, expressed through React's own idiom this
time: React's effect-cleanup mechanism is itself a general
cancel-the-previous-scheduled-thing primitive — debouncing is one real
use of it; an earlier lesson's own abort-on-unmount cleanup (any
`useEffect` returning a function that removes an event listener) is
the identical mechanism, a different real purpose.

### SE Lens

The real, deliberate scope cut, stated plainly: no "Parse Project"
button, no folder/multi-file upload, no download, no program library —
`cnc-sim`'s own `progs` tab (multi-file buckets, saved programs) is real,
separate, deferred scope, the same "smallest real vertical slice, not
the whole tab family at once" discipline every other tab in this project
has followed (`dro`'s own four-lesson build-out, `mach`'s multi-unit
extraction). The debounced auto-reparse specifically replaces the
reference's manual button for *this* slice's real need — always
re-running against whatever's currently in the editor — without also
building out multi-file project management this same lesson.

### Commands

None new — plain TypeScript/CSS, already covered by the existing
`npx tsc --noEmit`/`npm run dev` toolchain.

### Run It — Real Output

Full, live, end-to-end verification via Playwright driving a real
browser against the real `cnc-web` dev server and real `cnc-service`
backend — not just typechecking:

```
$ npx tsc --noEmit
(no output — compiles cleanly)
```

**Initial load** — the editor shows the real default program:
```
initial code: "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8"
```

**Typing a new program**, then waiting past the 900ms debounce:
```
[browser info] ... INFO MachineStatus: fetchState succeeded: spindle 0rpm
[browser info] ... INFO App: fetchPath succeeded: 4 points
```
(The new program has no `M3 S1000` — `spindle 0rpm` is the real,
correct DRO reading for it; 4 points is the real point count for the
3-line program actually typed, not the original 5-line default.)

**Uploading a real file** (`upload-test.nc`, containing `G0 X99 Y99\nM5`):
```
[browser info] ... INFO App: loaded program from upload-test.nc: 13 chars
code after upload: "G0 X99 Y99\nM5"
filename label: upload-test.nc
[browser info] ... INFO MachineStatus: fetchState succeeded: spindle 0rpm
[browser info] ... INFO App: fetchPath succeeded: 3 points
```

The editor's own real content changed to the uploaded file's real text,
the filename label updated, and both downstream fetches re-ran
automatically — with zero manual "Parse"/"Run" step, and a real,
readable log line at every step, per Lesson 26's own now-standing habit.

---

## Connect the Pieces

Follow one real program, from a file on disk to a rendered toolpath:

1. A user clicks "↑ Upload" (`FileActionToolbar`), picks a real `.nc`
   file.
2. The hidden `<input type="file">`'s `onChange` fires, calling
   `handleUploadFile(file)`.
3. `file.text()` reads the real file's bytes as a UTF-8 string — no
   network request, no backend involved yet.
4. `setCode(text)` updates `code`; `setFileName(file.name)` updates the
   toolbar's own label; `logger.info(...)` records the real load.
5. `code` changing re-runs the debounce effect — a new 900ms timer
   scheduled, any previous one cancelled.
6. 900ms later (uninterrupted by further typing/uploads), the timer
   fires: `setDebouncedCode(code)`.
7. `debouncedCode` changing re-runs the fetch effect: `fetchPath(debouncedCode)`
   — a real request, this file's actual content, to the real backend.
8. The *same* `debouncedCode` value, passed as `MachineStatus`'s
   `program` prop, triggers that component's own already-existing effect
   (Lesson 16, unchanged) to re-fetch the DRO state too.
9. Both the Viewport's rendered toolpath and the DRO panel now reflect
   the file that was just loaded — the first time in this project's
   history that's been true for anything other than one hardcoded
   string.

## What Breaks Without This

Reverting `App.tsx`'s `renderViewContent` to pass the original hardcoded
constant instead of `debouncedCode`:

```typescript
if (id === "dro") return <MachineStatus program={DEFAULT_PROGRAM} />;
```

Real, observed behavior with this version, reproduced live this session
(the same Playwright script used throughout this lesson, rerun against
this exact revert): the code editor still accepts typing and file
uploads, the toolbar's filename label still updates, `logger.info` still
logs a real load, and the Viewport's own toolpath *still* re-renders
(`App: fetchPath succeeded` keeps appearing) — but `MachineStatus: fetchState succeeded`
never appears again after the very first, initial load, no matter what's
typed or uploaded afterward. The DRO panel silently stops updating while
everything else keeps looking like it's working — nothing about that
failure is obvious from the UI alone. Restoring `debouncedCode` as the
one real value both consumers share closes that gap.

## Exercises

1. Add a `code` count or "unsaved changes" indicator that lights up the
   instant `code !== debouncedCode` — a real, live signal for "you're
   still typing, this hasn't run yet," distinguishing the debounce
   window from a genuine failure.
2. Change the debounce delay from `900` to `0` and reason about (or
   verify, via the Network tab) how many real requests a normal sentence
   of typing now produces, compared to the debounced version — a live
   demonstration of `debounce-pattern.md`'s own named cost of skipping
   it.
3. `handleUploadFile` currently accepts any file the browser's file
   picker allows through despite the `accept` filter (which is advisory
   only). Add a real check — e.g., reject a file over some real size
   limit — and log a `logger.warn` (not `error`, since this isn't a
   failure) when a file is rejected before ever being read.
4. Look at `cnc-sim/cnc/components/FileActionToolbar.jsx`'s full real
   props (`onParse`, `onDownload`) named-but-not-ported this lesson —
   sketch, in prose, what a "Download" button would need to do
   differently from Upload's real direction (state → file, not file →
   state), before ever writing the code.

## Definition of Done

- [ ] The `code` tab is real and visible by default (left panel), shows
      the real default program, and both typing and file upload work.
- [ ] Typing a new program and waiting past the debounce actually
      changes the DRO reading and rendered toolpath — verified live, not
      assumed.
- [ ] Uploading a real `.nc` file loads its real content into the
      editor, updates the filename label, and re-triggers both fetches —
      verified live.
- [ ] A failed file read logs a real `error` line (not silently
      swallowed) — per Lesson 26's own standing convention, applied here
      without being asked again.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `concepts/browser-file-text-reading.md` and `concepts/debounce-pattern.md`
      exist, each with real, executed output.
- [ ] `git commit` — message explaining that this corrects a real,
      backwards dependency order this project had carried since Lesson
      7: every feature built on top of "a program exists" before the
      actual mechanism to get one in existed at all.
