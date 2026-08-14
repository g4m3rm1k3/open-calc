# PocketStudio — a real desktop client for PocketDB

## What this is

A real, working desktop application — a small, honest version of
DBeaver — for browsing and querying `.pdb` files created by the
`pocket-db` project. Built in Electron, React, and TypeScript, all
three taught here, from nothing, the same way `pocket-db` itself
taught C++ and Python: the project is the vehicle. There is no "5
lessons of React basics" before the real app starts — Lesson 0 already
builds and runs a real window.

This isn't coursework — it's self-directed preparation, the same
standing reason `pocket-db` exists, extended to a third language
(TypeScript) and a desktop application framework (Electron) neither
upcoming course covers, but real, professional software regularly
needs.

Every lesson is governed by `../../reference/LESSON SCHEMA.md`. See
`CURRICULUM_NOTES.md` in this folder for the full reasoning behind
every decision below.

## The project is the vehicle — there is no tutorial preamble

There is no "learn TypeScript" chapter and no "learn React" chapter
before the real app exists. **Lesson 0 already builds and runs a real
Electron window.** A TypeScript feature (an `interface`, a generic, a
discriminated union), a React concept (a component, `useState`, a
hook), or an Electron concept (the main process, the renderer process,
`ipcMain`/`ipcRenderer`) is taught exactly at the lesson where the
app's own real code first needs it — never earlier, never as its own
standalone "Learn X" lesson.

This project is self-contained: it doesn't assume, reference, or
depend on any other project in this repo. If a concept it needs (React,
TypeScript) happens to be covered elsewhere too, this project still
teaches it fresh, in its own real, working code, the moment its own
app actually needs it.

## Slices vs. lessons

A **slice** is a milestone: one new, demonstrable, end-to-end
capability — something you can point at and say "this works now,"
from a real click in a real window down to a real byte read from a
real `.pdb` file. A **lesson** is one learning increment inside a
slice. A slice is usually several lessons, not one.

## Architecture

```text
                    Electron Application
        ┌───────────────────────┴───────────────────────┐
        │                                                │
   Main Process                                  Renderer Process
   (Node.js)                                      (Chromium + React)
        │                                                │
   child_process.spawn()                          React components
   real JSON-lines protocol                        useState/useEffect
   over stdin/stdout                               a real query editor
        │                                          a real results grid
        └──────────────── contextBridge ────────────────┘
                        ipcMain / ipcRenderer

        Main Process
             │
     spawns, owns, and talks to:
             │
      python pocketdb (S00-S13, already real, already built)
             │
      a real .pdb file on disk
```

**The real, deliberate integration choice:** the Electron app does not
reimplement any part of the database engine, and does not talk to it
over a network. The main process spawns the existing, real
`pocket-db` Python package (`python -u query_server.py`, this
project's own small, new entry point) as a real, local child process,
and talks to it via a real, simple, newline-delimited JSON protocol
over its own real `stdin`/`stdout` — no HTTP server, no sockets, no
native Node addon. This is a real, standard "sidecar process"
architecture many real desktop apps use to embed a backend written in
a different language, and it means every byte of real database logic
this app uses is `pocket-db`'s own already-real, already-verified
engine — nothing about persistence, indexing, or querying is rebuilt
here.

The renderer process never talks to the child process directly — it
can't; Chromium's own renderer is sandboxed from Node.js by design.
Every real message crosses through `contextBridge`, `ipcRenderer`
(renderer side), and `ipcMain` (main-process side) — a real, second
process boundary, on top of the first.

## Design principles

- **Two real process boundaries, not one.** Renderer ↔ main process
  (Electron's own IPC) and main process ↔ Python child process (this
  project's own JSON-lines protocol) are two, real, separately taught,
  separately tested boundaries — never conflated.
- **TypeScript everywhere, strict mode from Lesson 0.** No `any`
  without a real, stated reason; every IPC message, every Python
  child-process response, gets a real, explicit TypeScript type the
  moment it's first handled.
- **Hand-rolled, not delegated, for the app's own real logic.** No
  third-party state-management library, no UI component library, no
  pre-built data-grid package. React's own built-in state
  (`useState`/`useReducer`/`useContext`) and hand-written components
  are the entire real UI layer, the same "hand-rolled, not delegated"
  principle `pocket-db` already used for its own engine.
- **Every slice is provably real.** Every lesson's own TypeScript
  compiles with `tsc --noEmit` and zero errors; every lesson's own
  Electron app actually boots and is exercised for real (this
  project's own reference build is launched and driven directly, not
  assumed to work from reading the code).
- **The real engine underneath never gets a shortcut.** Every real
  query this app ever runs goes through `pocket-db`'s own real,
  already-built `Database`/`Cursor`/`Record` — this project adds a
  real UI and a real process boundary in front of already-real work,
  not a second, parallel database implementation.

## The slice plan

| Slice | Adds | End-to-end result |
|-------|------|--------------------|
| S00 | Electron toolchain, a `BrowserWindow` | A real, blank window opens and closes cleanly |
| S01 | `contextBridge`/`ipcMain`/`ipcRenderer` | A real button click in the renderer changes real main-process state, and the result comes back |
| S02 | `child_process.spawn`, a JSON-lines protocol, a small Python `query_server.py` entry point | The main process asks the real, already-built PocketDB engine "what tables exist" and gets a real, correct answer back |
| S03 | React, JSX, components, `useState` | A real list of real table names renders in the actual window, fetched through both real process boundaries |
| S04 | A real table/grid component, `useEffect` | Clicking a table name shows its real, actual rows |
| S05 | A real query input, reusing `pocket-db`'s own `WHERE`/`ORDER BY`/`LIMIT` support | Typing a real query and running it shows real, filtered/sorted results |
| S06 | Real forms, controlled inputs | Creating a table and inserting a row through the UI produces real, persistent rows, provable by reopening the file |
| S07 | Real error/loading states, the connection lifecycle | A real, wrong query shows a real, readable error instead of a silent failure or a crash |
| S08 | Packaging (`electron-builder`) | A real, installable build of the app exists on disk |
| S09 | `pandas`/`matplotlib`, base64-encoded images over the protocol | Clicking "Analyze" on a table shows real column statistics and a real, rendered histogram in the window |
| S10 | `scikit-learn` model training | Picking a table and a target column trains a real classifier and shows real accuracy and predictions in the window |
| S11 | One-way main→renderer IPC, live progress | Clicking "Train Agent" shows a real Q-learning agent's win rate updating live as it trains |
| S12 | Persisted experience replay | A real, separate "Replay" pass reloads a converged agent purely from stored rows and reports its own win rate |

Added after the original, planned S00-S08 arc: a real user, on seeing
S00-S08 working, asked "what is the point of the GUI if not to make ML
accessible to everyone" — `pocket-db`'s own real S11-S13 (`pandas`,
`scikit-learn`, Q-learning/`gymnasium`) existed only as standalone
scripts until S09-S12 made them reachable from the actual window.

Lesson counts are filled in as each slice is actually broken into
lessons, the same real, honest practice `pocket-db` used.

## Slice → lesson number map

Updated as lessons are actually written.

| Slice | Lessons |
|-------|---------|
| S00 | `Lesson-00` (a real `npm` project; TypeScript's own real type checker proven by catching a real, deliberate error before fixing it; a real, native Electron `BrowserWindow`, proven by printing its own real screen coordinates and size, not assumed from the absence of an error. **S00 complete.**) |
| S01 | `Lesson-01` (`ipcMain.handle`/`contextBridge.exposeInMainWorld`/`ipcRenderer.invoke` — a real, deliberately narrow IPC bridge between the renderer and the main process; two real, honest bugs found and fixed while building it (a CommonJS module wrapper breaking a plain `<script>` tag; a local variable name colliding with `contextBridge`'s own global) kept directly in the lesson rather than smoothed over; proven end-to-end with a genuine, automated click on a real, running window. **S01 complete.**) |
| S02 | `Lesson-02` (a real, hand-rolled JSON-lines protocol; `query_server.py` — a small, real, new entry point calling nothing but `pocket-db`'s own already-real, already-verified engine; `PocketDBClient` — a real `child_process.spawn`-based TypeScript client, proven to correctly buffer a real response split across two separate stream events, and proven wrong first (a naive, unbuffered parse genuinely fails); the identical real DLL-PATH gotcha `pocket-db`'s own Lesson 6 taught, rediscovered in a spawned child process's own environment, fixed the same real way. **S02 complete.**) |
| S03 | `Lesson-03` (JSX proven to be real, compiled syntax sugar — `<h1>...</h1>` compiles to a real, plain `jsx(...)` call, shown directly via `esbuild`'s own output; a real, split build pipeline — `tsc` emitting for the main process, a real, separate `tsc -p tsconfig.renderer.json` pass for type-checking only, `esbuild` doing the real, actual bundling a plain `<script>` tag needs; `App` — a real component, `useState`/`useEffect` fetching S02's own real table names exactly once, proven by reading the real, rendered DOM directly out of a real, running window. **S03 complete.**) |
| S04 | `Lesson-04` (`get_rows` added to Lesson 2's own real protocol, reusing `pocket-db`'s already-real `query`/`schema` — no new database logic; conditional rendering (`&&`), a Fragment (`<>...</>`), and `useEffect` with a real, non-empty dependency array (`[selectedTable]`), proven to correctly re-fetch and replace the real grid across two, real, sequential clicks on different tables — proven wrong first (an empty dependency array silently freezes the grid on the first real selection). **S04 complete.**) |
| S05 | `Lesson-05` (`Grid` extracted as a real, second component the exact moment a second, real consumer needed it; `query_server.py` switched to `dbapi.connect`, `run_query` reusing `pocket-db`'s own real `Cursor`/`.description` (its own Lessons 19, 22, 29) — no second, competing query engine; a real, controlled `<input>`, proven end-to-end with a real, typed `WHERE`/`ORDER BY` query rendering real, correctly filtered and sorted results — proven wrong first (removing `onChange` real-triggers React's own exact, documented "read-only field" warning). **S05 complete.**) |
| S06 | `Lesson-06` (`create_table`/`insert_row` added to the real protocol, needing zero new `pocket-db` capability — genuine proof its own `create_table`/`insert` (Lessons 1, 11) were already, honestly complete; a real "Create Table" form (`parseColumnsSpec`, a real, small, hand-rolled parser); a real, *dynamic* "Insert Row" form — as many real, controlled inputs as the selected table actually has columns, updated via React's own required immutable-array pattern (`[...insertValues]`), proven wrong first (a direct array mutation silently does nothing); proven end-to-end including a real row surviving a completely separate process reopening the file, no live window at all. **S06 complete.**) |
| S07 | `Lesson-07` (Real, direct inspection of what an IPC error actually contains once it crosses two real, successive boundaries (this project's own protocol, then Electron's own IPC wrapping) — a real, consistent, strippable pattern found and handled (`cleanErrorMessage`); real `error`/`loadingTables` state, a real `try`/`catch` around `runQuery`, closing Lesson 5's own, explicitly named gap; a real "Loading tables..." state closing Lesson 3's own, explicitly named gap — proven end-to-end with a real, deliberately malformed query showing a real, clean, readable error in the actual window, and proven wrong first (no `try`/`catch` leaves a real, silent, invisible failure). **S07 complete.**) |
| S08 | `Lesson-08` (`electron-builder` produces a real, standalone `PocketStudio.exe`; proven wrong first — a real, isolated `python resources/app.asar/query_server.py` command reproduces the exact `[Errno 2] No such file or directory` a packaged app hit for real, since `app.asar` is a real, single, ordinary file no external process can read past; fixed with `asarUnpack` (five real Python-side files extracted to a real, loose `app.asar.unpacked/`) and `resourceDir()` (`app.isPackaged`/`process.resourcesPath`); proven end-to-end against the genuine, packaged binary itself via the Chrome DevTools Protocol (`--remote-debugging-port`) — a real `createTable`/`insertRow`/`listTables`/`getRows` round trip, and a real, persisted `games.pdb` confirmed on disk afterward. **S08 complete — the originally planned S00-S08 arc is done.**) |
| S09 | `Lesson-09` (A real, latent bug found in Lesson 2's own DLL-PATH fix — prepending `C:\msys64\ucrt64\bin` silently shadowed the correct, package-having `python.exe` with a different, package-less one, invisible until this lesson's own `import pandas` needed the correct interpreter; fixed with `os.add_dll_directory`, narrowing the fix to its real, correct source; `pandas.DataFrame` reused from `pocket-db`'s own Lesson 25, `pd.to_numeric` automatically discovering numeric columns with no schema-type lookup needed; a real, headless `matplotlib` histogram (`Agg` backend, `io.BytesIO`, proven to produce a real, valid PNG signature with no window ever opened); base64 encoding proven necessary (a real embedded `\n` byte would otherwise corrupt this project's own line-based protocol) and used to carry the real image through both process boundaries into an actual `<img src="data:...">` in the window. **S09 complete.**) |
| S10 | `Lesson-10` (A real feature matrix/target vector built with Lesson 9's own `pd.to_numeric` pattern; `sklearn.linear_model.LogisticRegression` reused from `pocket-db`'s own Lesson 26 (`.fit`/`.score`/`.coef_`/`.intercept_` already given full treatment there), its own `.predict`/`.predict_proba` used for real, live, single-row predictions for the first time in either curriculum; a real, isolated proof that a plain, module-level Python variable persists across two entirely separate real function calls, applied to keep a trained model server-side (`trained_model`, joining `conn` as this project's own second and third real, persisted globals) so `predict` never needs to retrain or serialize a model across the protocol boundary; a real, dynamic prediction form shaped by whichever real feature columns the model actually used, reusing Lesson 6's own dynamic-form pattern — proven end-to-end through genuine, simulated interaction with the actual, running window: select a table, pick a target column, train, and predict on a new, typed input. **S10 complete.**) |
| S11 | `Lesson-11` (A genuinely harder, real environment (`FrozenLake-v1`, `8x8`, `is_slippery=True`) chosen because it honestly, measurably needs live progress (real tens-of-seconds training), unlike `pocket-db`'s own fast, easy `4x4` case — and, in choosing it, a real, classic argmax tie-breaking bug surfaced (`.index(max(...))` silently, systematically favoring one fixed action whenever Q-values tie at zero, making training measurably worse than random), found via real, honest measurement (zero goal hits across 100,000 episodes) and fixed with real, random tie-breaking; the JSON-lines protocol (Lesson 2) extended with a real, new `progress` message sharing its request's own `id`, proven with a real, captured multi-line stdout sequence; Electron's real, second IPC mechanism — `webContents.send`/`ipcRenderer.on`, real publish-subscribe, this project's first use of it after ten lessons of request-response only — proven in isolation first (three real, unprompted pushes with no renderer request at all), then wired end-to-end into a real, live-updating "Train Agent" button, directly observed updating (`episode 8000/50000` through `46000/50000`) while the training request was still genuinely open. **S11 complete.**) |
| S12 | `Lesson-12` (This project's own already-known, real `95`-row page capacity (`pocket-db`'s own Lesson 15) found to genuinely collide with the harder, real `8x8` environment's own honestly long successful episodes (real, measured lengths up to `97` steps) — resolved with a real, generate-and-test search for one successful episode short enough to fit, using `Transaction.rollback()` for the first real time in either curriculum to discard every attempt that doesn't; `replay_agent` trains a completely fresh, real Q-table purely from those stored rows — no live environment touched during learning at all — reusing `pocket-db`'s own Lesson 27 replay pattern exactly, reaching a real, honest, non-zero win rate; two real, properly gated buttons ("Persist Experience," "Replay From Storage") proven end-to-end through a real, three-click sequence in the actual window. **S12 complete — the ML/RL arc (S09-S12) is done.**) |
