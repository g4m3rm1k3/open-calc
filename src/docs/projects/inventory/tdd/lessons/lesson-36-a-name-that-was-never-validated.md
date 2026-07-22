# Lesson 36: A Name That Was Never Validated

**What you will build:** Lesson 35's `CodeEditor.tsx` passed
`theme.id` straight to Monaco's own `defineTheme`/`setTheme` — real,
correct data, from this app's own 18-entry `THEMES` catalog (Lesson 24).
Confirmed live, this session, restarting the dev server: Monaco itself
throws `Error: Illegal theme name!` the moment a theme whose id contains
an underscore (`tokyo_night`, `one_dark` — two of the real 18) is
selected. Lesson 35's own "verified live" claim was real but incomplete
— it checked exactly two themes (`slate`, `monokai`), neither with an
underscore, so this never surfaced. This lesson adds one real,
boundary-only sanitizing function and confirms it against all 19 real
theme ids, not two. The transferable point: "verified live" is only as
strong as what was actually exercised — two passing cases don't stand in
for nineteen, especially when the two happen to share a property (no
underscore) that turns out to be exactly what mattered.

**What you need to know first:** Lesson 35's own `gcodeMonacoTheme`/
`CodeEditor.tsx`; Lesson 24's own 18-entry `THEMES` catalog (`themes.ts`),
specifically that theme *ids* (`tokyo_night`, `one_dark`, `catppuccin-latte`,
`cyberFuchsia`, ...) were never constrained to any particular character
set — they only ever needed to be unique strings for `findTheme`/
`localStorage` lookups until this lesson.

---

## Project Change (no new concept): Sanitizing at the Monaco Boundary

### The Problem

Confirmed directly, this session, restarting the dev server with a
`tokyo_night`-themed session already in `localStorage`:

```
Error: Illegal theme name!
  at StandaloneThemeService.defineTheme
  at Object.handleMount [as current] src/CodeEditor.tsx:37:21
```

### Reference Source, Read for Real This Session

Monaco's own real validation, `node_modules/monaco-editor/esm/vs/editor/
standalone/browser/standaloneThemeService.js`:
```js
defineTheme(themeName, themeData) {
    if (!/^[a-z0-9\-]+$/i.test(themeName)) {
        throw new Error('Illegal theme name!');
    }
```
Only letters (either case, via the `i` flag), digits, and hyphens are
legal — an underscore, present in two of this project's own real 18
theme ids, is not.

### Files Affected

`cnc-web/src/monacoGcode.ts` (modified — new `monacoThemeName`
function), `cnc-web/src/CodeEditor.tsx` (modified — both call sites that
previously passed `theme.id` directly). Change type: fix (a real,
previously-uncaught crash for two specific, real inputs).

### The New Code

```typescript
export function monacoThemeName(themeId: string): string {
  return themeId.replace(/[^a-zA-Z0-9-]/g, "-");
}
```

### The Updated Project

`monacoGcode.ts`'s new function, placed right after `GCODE_LANGUAGE_ID`:

```typescript
export const GCODE_LANGUAGE_ID = "gcode";

// Monaco's real theme-name validator (standaloneThemeService.js's own
// defineTheme) only accepts /^[a-z0-9-]+$/i -- confirmed live: two of
// this app's own real 18 theme ids (Lesson 24), "tokyo_night" and
// "one_dark", contain a real underscore and fail it outright, throwing
// "Illegal theme name!" the moment either was selected. Sanitizing the
// name only at the Monaco boundary, rather than renaming the ids
// themselves, keeps themes.ts's own ids as the real, stored/serialized
// identity (localStorage, findTheme lookups) completely untouched.
export function monacoThemeName(themeId: string): string {
  return themeId.replace(/[^a-zA-Z0-9-]/g, "-");
}
```

`CodeEditor.tsx`'s two call sites, both now sanitizing:

```typescript
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    const theme = findTheme(themeId);
    m.editor.defineTheme(monacoThemeName(theme.id), gcodeMonacoTheme(theme));
    m.editor.setTheme(monacoThemeName(theme.id));
  }, [themeId]);

  const handleMount: OnMount = (_editor, monacoApi) => {
    monacoRef.current = monacoApi;
    const theme = findTheme(themeId);
    monacoApi.editor.defineTheme(monacoThemeName(theme.id), gcodeMonacoTheme(theme));
    monacoApi.editor.setTheme(monacoThemeName(theme.id));
  };
```

### Mechanical Walkthrough

- `themeId.replace(/[^a-zA-Z0-9-]/g, "-")` — **(a) first appearance** —
  a general character-class sanitizer, not a special case for
  underscores specifically: any character Monaco's own regex wouldn't
  accept becomes a hyphen, so a future theme id with, say, a space or an
  apostrophe would be handled by the same line, not require a second fix.
- The sanitizing happens only at the two Monaco call sites, never
  touching `theme.id` itself anywhere else (`findTheme`, `localStorage`,
  `applyTheme`) — **(a) first appearance of this specific boundary
  discipline** in this project: the real, stored identity of a theme and
  the name Monaco is willing to accept are two different real
  constraints, kept separate rather than collapsing `themes.ts`'s own ids
  to satisfy Monaco's narrower rule.

### CS Lens

Two different consumers of the identical string (`localStorage`/
`findTheme`, which accept anything; Monaco's `defineTheme`, which
doesn't) impose two different real constraints — sanitizing at the one
boundary that actually needs it, rather than narrowing the shared data
itself, is the same general shape as validating/escaping input only at
the edge of a system that needs it, not upstream where the data is still
generically useful.

### SE Lens

The real, honest gap this lesson closes in its own predecessor: Lesson
35 claimed "verified live" backed by exactly two themes. Two passing
cases were treated as sufficient evidence for a claim about all 18 —
they weren't, and the two chosen happened to share the one property
(no underscore) that mattered. The fix here is paired with checking
all 19 real ids this time, not assuming two is still enough.

### Commands

None new.

### Run It — Real Output

Before the fix, live, this session (dev server restart with a
`tokyo_night`-themed session in `localStorage`):
```
Error: Illegal theme name!
  at StandaloneThemeService.defineTheme
  at Object.handleMount [as current] src/CodeEditor.tsx:37:21
```

After the fix, run live this session against all 19 real theme ids from
`themes.ts` (every one, not a sample):
```
themes tested: 19
errors: none
```

## What Breaks Without This

Reverting `CodeEditor.tsx`'s two call sites to pass `theme.id` directly:
```typescript
m.editor.defineTheme(theme.id, gcodeMonacoTheme(theme));
m.editor.setTheme(theme.id);
```
Real, reproduced-live behavior: selecting "Tokyo Night" or "One Dark" in
Settings throws `Illegal theme name!` inside `handleMount`/the
`themeId`-effect, and React logs "An error occurred in the <Ve>
component" — the code editor's Monaco theme silently fails to update
(though the rest of the app's CSS-variable-driven theme still applies
correctly, since that path never goes through Monaco at all).

## Exercises

1. Add a 20th theme to `themes.ts` with an id containing a space (e.g.
   `"retro wave"`) and confirm live that `monacoThemeName` still produces
   a legal Monaco theme name for it, with no code changes needed anywhere
   else.
2. Explain, in your own words, why sanitizing happened in
   `monacoGcode.ts`/`CodeEditor.tsx` rather than by simply renaming
   `tokyo_night`/`one_dark` to `tokyo-night`/`one-dark` directly in
   `themes.ts`. What real, stored data (think `localStorage`) would a
   rename silently break for a user who already had one of those two
   themes selected before the rename?
3. This project now has two independent test surfaces for "does this
   work across every real theme" (Lesson 35's spot-check of two, this
   lesson's real check of all 19). Write down, in plain English, what a
   permanent, repeatable version of this lesson's own 19-theme check
   would look like as part of this project's real tooling, rather than a
   one-off script.

## Definition of Done

- [ ] Every one of the 19 real theme ids in `themes.ts` can be selected
      without Monaco throwing `Illegal theme name!` — verified live,
      checked against all of them, not a sample.
- [ ] `theme.id` itself (in `themes.ts`, `localStorage`, `findTheme`)
      remains completely unchanged — the fix is boundary-only.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `git commit` — message explaining that this closes a real crash
      Lesson 35's own incomplete verification (two themes checked, not
      eighteen) allowed to slip through, and naming the fix as
      boundary-only sanitizing, not a rename of the underlying theme ids.
