# Games

Each subfolder under `src/games/` is a self-contained game package. The goal
is that someone can read one folder, understand the whole game, and copy the
folder as a starting point for a new one without having to learn the rest of
the app.

## Package shape

```
src/games/[game-key]/
  index.jsx          # required — default export (component) + `meta`
  [GameName]Page.jsx  # optional thin route wrapper, if the game needs route-level chrome
  [GameName].jsx       # the game itself (split into lib/, hooks/, components/ if it grows large)
```

`index.jsx` is the only file the rest of the app imports by convention
(`src/games/gameLoader.js` globs `./**/index.jsx`). It must export:

```js
export { default } from './YourGame.jsx'
export const meta = { key: 'your-game', label: 'Your Game' }
```

`registry.js` is the source of truth for how a game is presented on the
Games page (emoji, color, description, tags, cover art) — it's separate from
`meta` because the registry entry is about marketing/discovery, not runtime.

## The close-handler contract

A game can be opened three different ways: as a route (`/game/:key`), as a
floating/maximized window from the desktop's Start Menu, or (for a few
physics labs) as a full-screen overlay dispatched straight from `AppShell`.
**Always accept both `onClose` and `onBack` as the same thing** — pick
whichever reads better in your component, but don't assume only one will be
passed. `FloatingWindow.jsx` passes both for exactly this reason; a
component that only reads `onClose` silently gets no close handler at all
when opened through the window manager (this broke Mini Golf's close button
*and* its fullscreen layout, since it used `Boolean(onClose)` to decide
whether to render `position: fixed; inset: 0`). If your game's "fullscreen
vs. embedded" layout depends on whether a close handler exists, check
`Boolean(onClose || onBack)`, not just one of them.

## Shared infra — `src/games/shared/`

- `GameHelp.jsx` — drop-in floating "?" button + modal. Every game should
  use this instead of inventing its own help text placement. Give it three
  sections: **what you're learning** (the concept), **how to play**
  (controls), and **goal** (win condition). This exists because several
  games either had no in-game explanation of their purpose or buried it
  somewhere a player would never look.

## Mobile

There's no project-wide touch abstraction yet — most games were built
mouse/keyboard-only. When polishing a game, prefer:
- Three.js camera controls: `OrbitControls` already supports touch by
  default: don't disable it.
- Native `<input type="range">` sliders are touch-friendly as-is.
- Layout: add a `max-width` media query that stacks side panels instead of
  fixed-width columns, rather than rebuilding controls from scratch.
