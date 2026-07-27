# Lesson 35: A Tokenizer Is Just a Table

**What you will build:** `cnc-web`'s `code` tab held a plain
`<textarea>` (Lesson 27) — no line numbers, no syntax highlighting, no
awareness that the text inside it is G-code at all. This lesson replaces
it with a real Monaco Editor (the component that powers VS Code):
`@monaco-editor/react`, a custom G-code language (a real Monarch
tokenizer recognizing G-words, M-words, comments, macro variables, and
this project's own already-established flow-control keyword list), and a
Monaco theme derived directly from this app's own 18-theme catalog
(Lesson 24) instead of a hand-picked pair. Unlike every other lesson so
far, this one ports nothing — the reference app has no real editor to
port from, just one dead field hinting a Monaco integration was once
planned and never built. The transferable point: a tokenizer doesn't
have to be a hand-written loop (this project's own `core/lexer.py`,
Lessons 2–3) — it can just as validly be a data table a generic engine
walks, and recognizing which shape you're looking at is the real skill,
not memorizing one specific implementation.

**What you need to know first:**
`concepts/declarative-tokenizer-rules.md` (new, this lesson);
`concepts/hardcoded-vs-data-driven-dispatch.md` (the same fixed-vs-data
tension, one pipeline stage earlier); Lesson 24's own 18-entry
`THEMES` catalog and `applyTheme`'s real color-derivation helpers
(`lightenHex`/`darkenHex`/`hexToRgba`), reused directly here; Lesson 30's
own `_KEYWORD_RE` list, reused verbatim as this editor's flow-control
token category.

---

## The Problem, and a Reference That Wasn't There

The request came in as "a real editor with syntax highlighting, line
numbers, that follows the app's themes" — reasonably read as "port
Monaco from the reference," since this project's whole existence has
been porting real, proven pieces of `cnc-sim`. Checked directly, this
session, before writing anything: `cnc-sim/cnc/components/
CodeEditorTextarea.jsx` (the real, already-extracted component) is a
plain `<textarea>`, identical in spirit to this project's own pre-Lesson-27
version. The only trace of Monaco anywhere in the reference is one field,
`monacoDark`, read in `cnc-sim/cnc/theme/useCncTheme.js` (`!activeTheme.
monacoDark?.includes('light')`) — but never *written* by any real theme
definition anywhere in the codebase. It's real, tracked, dead code: a
hook for a Monaco integration that was planned and never built, the same
shape as this project's own already-documented dead fields
(`cssSpeedMax`, `retractPlane` — Lesson 29's own citations). So this
lesson ports nothing; it's new, deliberate feature work, confirmed to
have no real counterpart before a line of it was written.

## Concept Unit: Declarative Tokenizer Rules

### The Problem

`core/lexer.py`'s own `tokenize()` (Lessons 2–3) is a hand-written loop:
one regex finds every match, and surrounding code decides what each one
means. Monaco's own tokenizer format (Monarch) works completely
differently — a plain data table of `[pattern, category]` pairs a
generic, shared engine walks, the same mechanism every language Monaco
knows is built from.

### The Concept, Isolated

Full isolated treatment lives in `concepts/declarative-tokenizer-rules.md`,
run for real this session:

```javascript
const rules = [
  [/\(.*?\)/, "comment"],
  [/\bG\d+\b/, "gword"],
  [/\bM\d+\b/, "mword"],
  [/[XYZ][-+]?\d*\.?\d+/, "axisword"],
  [/\s+/, "whitespace"],
];

console.log(tokenize("G01 X10.5 (rapid to start)", rules));
```

**Real output, run this session:**
```json
[
  { "kind": "gword", "text": "G01", "pos": 0 },
  { "kind": "whitespace", "text": " ", "pos": 3 },
  { "kind": "axisword", "text": "X10.5", "pos": 4 },
  { "kind": "whitespace", "text": " ", "pos": 9 },
  { "kind": "comment", "text": "(rapid to start)", "pos": 10 }
]
```

### Discard

This lab is not part of the project — the real code below is Monaco's
own `IMonarchLanguage` format, not this toy `tokenize()` function.

### CS Lens

Per `declarative-tokenizer-rules.md`: the same real hardcoded-vs-data-driven
tension `hardcoded-vs-data-driven-dispatch.md` already named for
dispatch tables (Lesson 29/32), one stage earlier in the pipeline — a
tokenizer can be a fixed function's own imperative body, or a generic
engine parameterized entirely by a swappable table.

### SE Lens

The real, concrete payoff: Monaco's engine already exists and is shared
across every language it knows — this project only had to supply the
*table* (`GCODE_LANGUAGE`, below), not a whole new tokenizing engine,
which is exactly why adding syntax highlighting for a genuinely new
language into an existing editor is normally a data-authoring task, not
an algorithm-design one.

---

## Project Change: A Real Monaco Editor, Themed From This App's Own Catalog

### Files Affected

`cnc-web/package.json` (new dependencies), `cnc-web/src/monacoGcode.ts`
(new — the real G-code Monarch language + theme generator),
`cnc-web/src/CodeEditor.tsx` (new, replaces the deleted
`CodeEditorTextarea.tsx`), `cnc-web/src/App.tsx` (modified — swaps the
component, threads `themeId` through), `cnc-web/src/theme.css` (modified
— the old textarea rule replaced by a flex-sizing wrapper for Monaco,
which does its own internal styling). Change type: add (new feature, no
reference to port).

### The New Code

```typescript
export function gcodeMonacoTheme(theme: ThemeDefinition): Monaco.editor.IStandaloneThemeData {
  return {
    base: theme.type === "light" ? "vs" : "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword.g", foreground: strip(theme.accentHex), fontStyle: "bold" },
      { token: "keyword.m", foreground: strip(theme.h3), fontStyle: "bold" },
    ],
    colors: { "editor.background": theme.bg0, "editor.foreground": theme.txt1 },
  };
}
```

### The Updated Project

`cnc-web/package.json`'s new real dependencies:
```json
"@monaco-editor/react": "^4.7.0",
"monaco-editor": "^0.56.0",
```

`cnc-web/src/monacoGcode.ts` in full:

```typescript
import type * as Monaco from "monaco-editor";
import type { ThemeDefinition } from "./themes.ts";
import { lightenHex, darkenHex } from "./themes.ts";

// Monaco's own theme `colors` bag expects real hex (`#RRGGBB` or, for
// translucency, `#RRGGBBAA`) -- unlike the rest of this app's own
// `hexToRgba` (themes.ts), which produces an `rgba(...)` CSS string for
// plain DOM custom properties. Monaco doesn't accept that string form for
// theme colors, so translucency here needs its own real hex+alpha helper.
function hexWithAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${clean}${a}`;
}

export const GCODE_LANGUAGE_ID = "gcode";

// Real keyword list, kept identical to cnc-service/core/lexer.py's own
// _KEYWORD_RE (a direct port of cnc/gcodeParser.ts's flow-control
// detection) -- the same words the backend treats as loop/branch
// control, not G/M-code data, get the same real treatment here.
const FLOW_KEYWORDS =
  "WHILE|ENDWHILE|DO\\d*|END\\d+|IF|ELSE|ENDIF|GOTOF|GOTOB|GOTO|" +
  "LOOP|ENDLOOP|REPEAT|UNTIL|CALL|RET|RTS|WAITM|SETM|CLEARM|WBUF|" +
  "DEF|LIMS";

const GCODE_LANGUAGE: Monaco.languages.IMonarchLanguage = {
  ignoreCase: true,
  tokenizer: {
    root: [
      [/\(.*?\)/, "comment"],
      [/;.*$/, "comment"],
      [/^O\d+/, "type.identifier"],
      [/#\d+/, "variable"],
      [new RegExp(`\\b(${FLOW_KEYWORDS})\\b`, "i"), "keyword.flow"],
      [/\bG\d+(\.\d+)?\b/, "keyword.g"],
      [/\bM\d+\b/, "keyword.m"],
      [/\b[XYZIJKRFSTHQD][-+]?\d*\.?\d+\b/, "identifier"],
      [/[-+]?\d+\.?\d*/, "number"],
      [/[[\]]/, "@brackets"],
    ],
  },
};

const GCODE_LANGUAGE_CONFIG: Monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: ";",
    blockComment: ["(", ")"],
  },
  brackets: [["[", "]"]],
};

let registered = false;

// Real Monarch tokenizer + language configuration -- new, not ported: the
// reference's own real editor (cnc-sim/cnc/components/CodeEditorTextarea.jsx)
// is a plain <textarea>, no syntax highlighting at all. Registered once;
// Monaco itself throws if the same language id is registered twice (e.g.
// React StrictMode's double-invoke in development).
export function registerGcodeLanguage(monaco: typeof Monaco): void {
  if (registered) return;
  registered = true;
  monaco.languages.register({ id: GCODE_LANGUAGE_ID });
  monaco.languages.setMonarchTokensProvider(GCODE_LANGUAGE_ID, GCODE_LANGUAGE);
  monaco.languages.setLanguageConfiguration(GCODE_LANGUAGE_ID, GCODE_LANGUAGE_CONFIG);
}

// Builds a real Monaco theme directly from this app's own ThemeDefinition
// (themes.ts's real 18-entry catalog, Lesson 24) -- one generic function
// instead of 18 hand-written Monaco themes, reusing the same color-math
// helpers (lightenHex/darkenHex/hexToRgba) applyTheme() already uses for
// the rest of the app, so the editor derives from the identical real
// palette every other panel does, not an invented approximation of it.
export function gcodeMonacoTheme(theme: ThemeDefinition): Monaco.editor.IStandaloneThemeData {
  const isLight = theme.type === "light";
  const emphasize = (hex: string) => (isLight ? darkenHex(hex, 0.3) : lightenHex(hex, 0.3));
  const strip = (hex: string) => hex.replace(/^#/, "");

  return {
    base: isLight ? "vs" : "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: strip(theme.txt2), fontStyle: "italic" },
      { token: "keyword.g", foreground: strip(theme.accentHex), fontStyle: "bold" },
      { token: "keyword.m", foreground: strip(theme.h3), fontStyle: "bold" },
      { token: "keyword.flow", foreground: strip(theme.h2), fontStyle: "bold" },
      { token: "variable", foreground: strip(emphasize(theme.h2)) },
      { token: "type.identifier", foreground: strip(theme.h3), fontStyle: "bold" },
      { token: "identifier", foreground: strip(theme.txt1) },
      { token: "number", foreground: strip(theme.txt1) },
    ],
    colors: {
      "editor.background": theme.bg0,
      "editor.foreground": theme.txt1,
      "editorLineNumber.foreground": theme.txt2,
      "editorLineNumber.activeForeground": theme.txt1,
      "editor.selectionBackground": hexWithAlpha(theme.accentHex, 0.25),
      "editor.inactiveSelectionBackground": hexWithAlpha(theme.accentHex, 0.15),
      "editor.lineHighlightBackground": theme.bg1,
      "editorCursor.foreground": theme.accentHex,
      "editorWhitespace.foreground": hexWithAlpha(theme.txt2, 0.3),
      "editorIndentGuide.background": theme.border,
      "scrollbarSlider.background": hexWithAlpha(theme.border, 0.5),
      "scrollbarSlider.hoverBackground": hexWithAlpha(theme.border, 0.7),
    },
  };
}
```

`cnc-web/src/CodeEditor.tsx` in full (replaces `CodeEditorTextarea.tsx`):

```typescript
import { useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { findTheme } from "./themes.ts";
import { GCODE_LANGUAGE_ID, registerGcodeLanguage, gcodeMonacoTheme } from "./monacoGcode.ts";

// Real, local monaco-editor package, not the default CDN loader
// @monaco-editor/react otherwise fetches from -- keeps this app running
// fully offline, matching every other real dependency here (Vite/React/
// Three.js are all bundled locally too, no CDN in the loop).
loader.config({ monaco });

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  /** Real app theme id (themes.ts's own 18-entry catalog, Lesson 24) --
   * for now the editor always follows this; an independent editor-theme
   * override is real, deliberately deferred scope, not forgotten. */
  themeId: string;
}

function CodeEditor({ code, onChange, themeId }: CodeEditorProps) {
  const monacoRef = useRef<typeof monaco | null>(null);

  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    const theme = findTheme(themeId);
    m.editor.defineTheme(theme.id, gcodeMonacoTheme(theme));
    m.editor.setTheme(theme.id);
  }, [themeId]);

  const handleMount: OnMount = (_editor, monacoApi) => {
    monacoRef.current = monacoApi;
    const theme = findTheme(themeId);
    monacoApi.editor.defineTheme(theme.id, gcodeMonacoTheme(theme));
    monacoApi.editor.setTheme(theme.id);
  };

  return (
    <div className="code-editor-monaco-wrap">
      <Editor
        width="100%"
        height="100%"
        defaultLanguage={GCODE_LANGUAGE_ID}
        value={code}
        onChange={(value) => onChange(value ?? "")}
        beforeMount={registerGcodeLanguage}
        onMount={handleMount}
        options={{
          fontSize: 12,
          lineHeight: 19,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "off",
          automaticLayout: true,
          renderLineHighlight: "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}

export default CodeEditor;
```

`App.tsx`'s own change — swap the import/component, thread `themeId`
through (already real, existing state, Lesson 24):

```typescript
import CodeEditor from "./CodeEditor.tsx";
...
<CodeEditor code={code} onChange={setCode} themeId={themeId} />
```

`theme.css`'s change — the old textarea rule replaced by a flex-sizing
wrapper (Monaco styles its own internals; this project only needs to
give it a correctly-sized container):

```css
.code-editor-monaco-wrap {
  flex: 1;
  min-height: 0;
  width: 100%;
}
```

### Mechanical Walkthrough

- `hexWithAlpha` — **(a) first appearance** — Monaco's `colors` bag
  needs real `#RRGGBBAA` hex, not the `rgba(...)` string form this
  project's own `hexToRgba` (themes.ts) already produces for plain CSS
  custom properties; a real, concrete case where the identical concept
  (translucent color) needs a genuinely different string format
  depending on which API consumes it.
- `FLOW_KEYWORDS` — **(b) reappearing**, verbatim — the exact same 21-word
  list as `core/lexer.py`'s own `_KEYWORD_RE` (Lesson 30), so a `WHILE`/
  `DO1`/`END1` line highlights consistently with how the backend actually
  treats it, not a second, independently-maintained list that could drift.
- `GCODE_LANGUAGE`'s `tokenizer.root` array — **(a) first appearance**,
  per `declarative-tokenizer-rules.md` — order matters identically to
  `core/lexer.py`'s own keyword-before-word-extraction fix: the flow-keyword
  rule runs before the generic `[XYZIJKRFSTHQD]...` rule, so `END1` is
  never misread as a data word here either.
- `registered` / the early-return guard in `registerGcodeLanguage` — **(a)
  first appearance** — Monaco throws on a duplicate `monaco.languages.
  register({ id })` call; guarding against it is what makes this survive
  React's development-mode double-invoke.
- `gcodeMonacoTheme(theme)` — **(a) first appearance** — one function
  deriving a full Monaco theme from any of the 18 real `ThemeDefinition`
  entries, reusing `lightenHex`/`darkenHex` (Lesson 24) rather than a
  second, hand-maintained color system just for the editor.
- `CodeEditor`'s `useEffect`, keyed on `themeId` — **(a) first
  appearance** — re-defines and re-applies the Monaco theme whenever the
  app's own active theme changes, so switching themes in Settings updates
  the editor live, not just on next mount.
- `loader.config({ monaco })` — **(a) first appearance** — points
  `@monaco-editor/react` at the locally installed `monaco-editor`
  package instead of its default CDN fetch, keeping this app's real,
  established offline-first posture (Vite/React/Three.js are all bundled
  locally already).

### CS Lens

Per `declarative-tokenizer-rules.md`: `GCODE_LANGUAGE.tokenizer.root` is
data, not code — Monaco's own shared tokenizing engine is what actually
walks it, the same engine that tokenizes every other language Monaco
ships with. This project only ever had to author the table.

### SE Lens

The real, honest limit: this is genuinely new feature work with no
reference to verify against, unlike every other lesson so far — its
correctness rests on live, direct verification (below), not on comparing
against a known-proven implementation. The real, deliberately deferred
scope, per the user's own explicit note: an independent editor-theme
override (separate from the app's active theme) is a real, later
feature, not forgotten — `gcodeMonacoTheme` already takes a
`ThemeDefinition` as a plain argument, so adding that later means adding
a second theme picker's selection here, not restructuring this function.

### Commands

```
npm install @monaco-editor/react monaco-editor
npx tsc --noEmit
```

### Run It — Real Output

Verified live, via a real headless browser (Playwright) driven against
the real running dev server, this session:

```
monaco elements: 1
line-number elements: 5
```
Real syntax highlighting confirmed visually: `M3`/`M8` colored via
`keyword.m`, `G0`/`G1` colored via `keyword.g`, matching the active
theme's own real accent colors — no console errors.

Theme-follow, verified live by switching the app's own Settings to a
real, different theme (Monokai) mid-session:
```
editor background after switch: rgb(39, 40, 34)
```
`rgb(39, 40, 34)` is exactly `#272822` — Monokai's real `bg0` value from
`themes.ts`'s own catalog, confirming the editor re-themed to match the
newly selected app theme, not just its initial mount.

Real typing round-trip, verified live (a new line typed directly into
the editor):
```
2026-07-22T00:03:01.297Z INFO App: fetchPath succeeded: 6 points
2026-07-22T00:03:03.673Z INFO App: fetchPath succeeded: 7 points
```
Confirms `onChange` still flows into `code` state, through the existing
900ms debounce (Lesson 27) and the real backend reparse, unchanged.

`npx tsc --noEmit`: clean, no errors.

---

## Connect the Pieces

Follow one theme switch, start to finish:

1. The user picks "Monokai" in Settings (`AppearanceSettings.tsx`,
   Lesson 24, unchanged) — `App.tsx`'s `selectTheme` calls `applyTheme`
   (sets real CSS custom properties on `document.documentElement`) and
   `setThemeId("monokai")`.
2. `App.tsx` re-renders, passing the new `themeId="monokai"` down to
   `<CodeEditor>`.
3. `CodeEditor`'s `useEffect` (keyed on `themeId`) fires: `findTheme(
   "monokai")` resolves the real `ThemeDefinition` from `themes.ts`.
4. `gcodeMonacoTheme(theme)` builds a fresh Monaco theme object from that
   definition's real `bg0`/`txt1`/`accentHex`/`h3` values.
5. `monaco.editor.defineTheme("monokai", ...)` registers it (or
   overwrites the previous definition under the same id — Monaco allows
   redefining), then `monaco.editor.setTheme("monokai")` applies it
   immediately, live, without remounting the editor or losing cursor
   position/undo history.

## What Breaks Without This

Removing the `useEffect` (theme only ever set once, in `handleMount`):
the editor would render correctly on first load, but switching themes in
Settings afterward would update every other panel (DRO, Viewport grid,
ribbon) while the code editor kept showing its original theme's colors —
a real, visible inconsistency, not a crash.

## Exercises

1. Add a rule to `GCODE_LANGUAGE.tokenizer.root` for `T`-word tool
   numbers (`T\d+`) as its own token category (say, `"keyword.t"`), give
   it a real color in `gcodeMonacoTheme`, and confirm live that `T2 M06`
   now highlights `T2` distinctly from the plain `identifier` color it
   gets today.
2. Switch through several of the 18 real themes in Settings and confirm
   live, for each, that `editor.background` matches that theme's own
   real `bg0` value exactly (same technique as this lesson's own
   Monokai check) — find any theme where the result looks wrong, and
   trace whether the bug is in `gcodeMonacoTheme` or in that theme's own
   `ThemeDefinition` entry.
3. `core/lexer.py`'s real `_KEYWORD_RE` and this lesson's `FLOW_KEYWORDS`
   are two independent copies of the same 21-word list. Propose (in
   writing, no code required) a real way to keep them from silently
   drifting apart if one is ever edited without the other — and name the
   real tradeoff your proposal introduces.

## Definition of Done

- [ ] The `code` tab shows a real Monaco editor with line numbers and
      G-code syntax highlighting — verified live.
- [ ] Switching the app's active theme (Settings) re-themes the editor
      immediately, confirmed against that theme's real `bg0` value —
      verified live.
- [ ] Typing in the editor still flows through to `code` state, the
      existing debounce, and a real backend reparse — verified live.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `concepts/declarative-tokenizer-rules.md` exists, with real,
      executed output.
- [ ] `git commit` — message explaining that this is new feature work
      with no reference counterpart (confirmed by reading the real
      `CodeEditorTextarea.jsx` and finding `monacoDark` is dead code),
      naming an independent editor-theme override as real, deliberately
      deferred scope.
