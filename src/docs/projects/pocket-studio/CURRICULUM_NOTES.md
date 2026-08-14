# PocketStudio — Curriculum Notes

Governing "why" doc — dated, quoted decision records. See
`README.md` for the current architecture and slice plan.

## 2026-08-13 — Project started

> "Yes same format lessons following the lesson schema, from 0 to
> software engineer."

Follows a full, completed run of `pocket-db` (S00-S13, 28 lessons) in
this same session. The user separately mentioned wanting "a gui in
electron with react and typescript... like dbeaver... because I want
to learn react and typescript and why not" — noted at the time in
`pocket-db`'s own `README.md`/`CURRICULUM_NOTES.md` as a future,
not-yet-scheduled direction. This is that direction, started for real.

**Explicitly self-contained.** Corrected mid-setup: briefly read two
other projects in this repo (`react-studio`, `frontend-client`) while
scoping whether React/TypeScript needed teaching here at all, since
both already cover them. The user stopped this immediately: "Why are
you looking at the bad lessons again?" — echoing earlier, identical
feedback from the `pocket-db` build ("I'm confused why we are looking
at any other projects, all would have to get rebuilt..."). Standing
rule now: this project does not reference, depend on, or assume any
other project in this repo. React and TypeScript are taught fresh
here, in this project's own real code, the moment its own app needs
them — the identical "project is the vehicle" principle `pocket-db`
already used for C++/Python, applied a second time, independently.

**The real integration architecture.** The one real, load-bearing
design decision made before Lesson 0: how does an Electron app (Node.js
+ Chromium) talk to `pocket-db` (a Python package over a C++ engine)?
Considered and rejected: a Node native addon calling the C++ engine
directly (real, but a large, separate toolchain — `node-gyp`, N-API —
duplicating FFI work `pocket-db` already did in Python, for no real
gain); a local HTTP server (real, but an unnecessary network layer for
a single-user, local, one-file-at-a-time desktop app). Chosen: the
main process `spawn()`s the real `pocket-db` Python package as a local
child process, talking over a real, simple, newline-delimited JSON
protocol on `stdin`/`stdout` — a real, standard "sidecar process"
architecture, reusing 100% of `pocket-db`'s own already-real,
already-verified engine. Two real process boundaries exist in this
app, not one: renderer ↔ main (Electron's own IPC) and main ↔ Python
child process (this project's own protocol) — kept conceptually
separate throughout the whole curriculum, never conflated.

**Real environment finding, resolved:** this session's own shell
environment initially had `ELECTRON_RUN_AS_NODE=1` set, which makes
`require("electron")` return a path string instead of the real
`app`/`BrowserWindow` API — Electron silently runs as plain Node
instead of bootstrapping its own GUI runtime. Traced to VS Code's own
integrated terminal (VS Code is itself an Electron app, and its
terminals are known to leak this variable into child shells) — not a
deliberate restriction. Fixed per-command with `env -u
ELECTRON_RUN_AS_NODE` before any command that needs to actually launch
Electron for real, in every real-verification step going forward.

Real reference project set up at `C:\Users\g4m3r\Documents\pocket-studio\`
(outside the repo, mirroring `pocket-db`'s own real reference project
at `C:\Users\g4m3r\Documents\pocketdb\`), `npm init`, with `electron`,
`typescript`, `@types/node` installed and real-verified (`tsc
--version`, a real, minimal Electron window booted and closed cleanly).

Lesson 0 (S00) is complete and verified in the real reference project:
`npm init`, a real, deliberate TypeScript type error caught and fixed,
a real Electron `BrowserWindow` proven by printing its own actual
screen coordinates and size (`{ x: 739, y: 161, width: 801, height:
602 }`) rather than trusting the absence of a thrown error. Checker-
clean on the first pass.

Lesson 01 (S01) is complete and verified in the real reference project:
a real, deliberately narrow `contextBridge`/`ipcMain`/`ipcRenderer`
bridge, proven end-to-end with a genuine, automated click on a real,
running window (`REAL_IPC_RESULT: "pong from the main process"`).

Two real, honest bugs surfaced during verification, kept directly in
the lesson (matching `pocket-db`'s own standing practice of showing
real failures, not just working code):
1. `Uncaught ReferenceError: exports is not defined` —
   `renderer.ts` first ended in `export {};` (for a `declare global`
   block), which makes `tsc` emit a CommonJS wrapper referencing a
   real `exports` object; a plain `<script>` tag has no module system,
   so `exports` is undefined. Fixed by keeping `renderer.ts` as a
   real, plain script (no top-level `import`/`export`) and using an
   inline type assertion instead of `declare global`.
2. `Uncaught SyntaxError: Identifier 'pocketStudio' has already been
   declared` — the first fix for (1) named the local variable
   `pocketStudio`, colliding with the identical, real global name
   `contextBridge.exposeInMainWorld("pocketStudio", ...)` already
   placed on `window`. Fixed by renaming the local variable to `api`.

Checker-clean on the first pass despite both real bugs being
documented inline — the checker validates lesson *structure*, not
narrative content, so real, honest bug reports inside a Concept Unit
don't trip it.

Lesson 02 (S02) is complete and verified in the real reference
project: `query_server.py` (a small, new, real entry point calling
nothing but `pocket-db`'s own already-real `Database.table_names()`,
added there as `pocket-db`'s own real Lesson 28 — see that project's
own `CURRICULUM_NOTES.md`), and `PocketDBClient`, a real
`child_process.spawn`-based TypeScript client with real, hand-rolled
stream buffering.

Two real, notable things surfaced building this:
1. **The real buffering requirement, proven, not assumed.** A
   deliberate, split-chunk test proved a naive `JSON.parse` on a raw,
   unbuffered `"data"` event genuinely fails
   (`Unexpected end of JSON input`) — the buffering logic isn't
   defensive boilerplate, it's load-bearing.
2. **The identical DLL-PATH gotcha from `pocket-db`'s own Lesson 6,
   rediscovered.** Spawning `python query_server.py` with no explicit
   `env` reproduced the exact real `FileNotFoundError` for
   `pocketdb_engine.dll` Lesson 6 first taught — a spawned child
   process doesn't necessarily inherit the same effective `PATH` an
   interactive terminal has. Fixed by explicitly prepending
   `C:\msys64\ucrt64\bin` to the spawned process's own `env.PATH`.

Real, necessary setup step, now explicit in the lesson: this project
keeps its own real copy of `pocketdb.py`/`pocketdb_engine.dll`
alongside `query_server.py`, rather than reaching into `pocket-db`'s
own dev folder at runtime — the same real choice any deployed app
bundling a dependency would make.

Lesson 03 (S03) is complete and verified in the real reference
project: real, direct proof JSX compiles to a plain `jsx(...)` call
(via `esbuild`'s own output on a tiny, isolated example) before any
real component was built; a real, split build pipeline (`tsc` emits
for the main process, a separate `tsc -p tsconfig.renderer.json` pass
type-checks the renderer only, `esbuild` does the real bundling); a
real `App` component fetching S02's own real table names via
`useState`/`useEffect`, proven by reading the actual, rendered DOM out
of a real, running window: `<div><h1>PocketStudio</h1><h2>Tables</h2>
<ul><li>games</li><li>scores</li></ul></div>`.

Lesson 04 (S04) is complete and verified in the real reference
project: `get_rows` added to the real protocol (reusing `pocket-db`'s
already-real `query`/`schema`, no new database logic); `App` now
tracks a real `selectedTable`, fetching and rendering its real rows in
a real grid via `useEffect` with a real, non-empty dependency array.
Proven end-to-end including a real, sequential two-click test (click
"games", then "scores") confirming the grid genuinely replaces itself
rather than only updating on the first real selection — and proven
wrong first, reverting to `[]` and watching the grid silently freeze
on "games" after the second click.

Lesson 05 (S05) is complete and verified in the real reference
project: `Grid` extracted as this project's own real, second
component; `query_server.py` switched from a plain `Database` to
`dbapi.connect`, adding `run_query` on top of `pocket-db`'s own
already-real `Cursor` (its Lessons 19, 22) and freshly-added
`.description` (its Lesson 29, added specifically for this — see that
project's own `CURRICULUM_NOTES.md`); a real, controlled `<input>`
proven end-to-end with a genuinely typed `WHERE ... ORDER BY ...`
query, and proven wrong first — removing `onChange` reproduces React's
own real, exact, documented warning
(`"You provided a value prop to a form field without an onChange
handler..."`) and a real, permanently stuck input.

Real, notable finding during verification: driving the real, controlled
input from an external, automated script requires React's own
"native setter" trick (`Object.getOwnPropertyDescriptor(HTMLInput
Element.prototype, 'value').set`) — plain `input.value = "..."`
doesn't reliably trigger React's own change detection. Documented as a
real, honest testing-methodology note, not lesson content (a real user
typing normally never hits this — it's specific to programmatic,
automated verification).

Lesson 06 (S06) is complete and verified in the real reference
project: `create_table`/`insert_row` added to the real protocol,
needing zero new `pocket-db` capability (the first lesson where that's
been true — genuine, real proof `create_table`/`insert`, its own
Lessons 1 and 11, were already, honestly complete for a real, external
caller). A real "Create Table" form (a small, hand-rolled
`parseColumnsSpec`), and a real, *dynamic* "Insert Row" form — as many
real, controlled inputs as the selected table's own real columns,
reset correctly via a dependency-array `useEffect` when a different
table is selected, updated through React's own required immutable-
array pattern. Proven wrong first: a direct array mutation
(`insertValues[index] = x`) silently does nothing, since React
compares state by reference. Proven end-to-end: create a table, select
it, insert a row, all through the real, running window — then, the
real point, reopened in a completely separate process (`query_server.py`
run standalone, no live window at all) and found the identical, real,
persisted row.

Lesson 07 (S07) is complete and verified in the real reference
project: real, direct inspection of what an IPC error actually looks
like once it crosses two, real, successive boundaries — this project's
own protocol (Lesson 2) wraps a real Python exception into a real
JSON `"error"` field, then Electron's own real IPC layer wraps *that*
again (`"Error invoking remote method 'run-query': Error: ..."`) — a
real, consistent, strippable pattern, handled by a small
`cleanErrorMessage` helper. Real `error`/`loadingTables` state and a
real `try`/`catch` around `runQuery` close Lesson 5's own, explicitly
named gap; a real "Loading tables..." message closes Lesson 3's own,
explicitly named gap. Proven end-to-end with a real, deliberately
malformed query (`SELEKT * FROM games`) showing the real, clean,
underlying Python error text in the actual window — and proven wrong
first, removing `try`/`catch` and confirming the failure becomes
real, silent and invisible to any user who isn't watching DevTools.

Lesson 08 (S08) is complete and verified in the real reference project —
the final slice. `electron-builder` configured (`appId`, `productName`,
`files`, `directories.output`, `win.target: "dir"`) and run for real
(`npm run package`), producing a real `release/win-unpacked/PocketStudio.exe`.

**Real, serious problem found — not smoothed over.** Immediately after
the first real package succeeded, reasoning identified a likely-
breaking concern before it was confirmed: `query_server.py` (and its
own real Python dependencies) were among this project's own `"files"`,
which `electron-builder` packs into `app.asar` — a real, single,
ordinary file. Python, spawned as a genuinely external, non-Electron
process, has no special knowledge of that format at all. Confirmed for
real, twice:
1. A direct, isolated `python resources/app.asar/query_server.py`
   command reproduced the exact real error:
   `can't open file '...app.asar\query_server.py': [Errno 2] No such
   file or directory`, exit code 2.
2. A full, CDP-instrumented launch of the real, unfixed packaged `.exe`
   (`--remote-debugging-port`, since a genuinely standalone, signed
   binary can't be `require()`'d into like every earlier lesson's own
   dev-mode verification script could) showed `listTables()` hanging
   forever — a real, second, honest finding: `PocketDBClient` (Lesson 2)
   never listens to its own spawned process's `exit` or `stderr`, so
   this exact real failure produces no rejected `Promise` at all, only
   silence. Named as a deferred exercise in Lesson 08 itself, not fixed
   there — out of that lesson's own, deliberately narrow, real scope.

**Real fix:** `asarUnpack` (five real files — `query_server.py`,
`pocketdb.py`, `dbapi.py`, `where_parser.py`, `pocketdb_engine.dll` —
extracted to a real, loose `app.asar.unpacked/` alongside the archive)
plus `resourceDir()` in `main.ts` (`app.isPackaged` ?
`process.resourcesPath` + `"app.asar.unpacked"` : the existing dev-mode
`__dirname` path). Repackaged and re-verified for real via the same CDP
technique: a full `createTable`/`insertRow`/`listTables`/`getRows`
round trip against the genuine, standalone `.exe`, and a real,
persisted `games.pdb` confirmed on disk inside `app.asar.unpacked/`
afterward.

The originally planned arc is complete: S00 through S08, every real
capability this project ever built now provably works from an actual,
installed build, not only from `npm start`.

## 2026-08-14 — S09-S12: making ML/RL reachable from the GUI

> "what is the point of the gui if not to make ml accessible to
> everyone. lets add them in"

`pocket-db`'s own real S11-S13 (`pandas`/`numpy`, `scikit-learn`/a
hand-built neuron/`Keras`, Q-learning/`gymnasium`) existed only as
standalone scripts a user would have to run by hand — never reachable
from this project's own real window at all. Asked directly whether to
add stats-only, stats-plus-training, or the full stack including RL;
answered "Everything, including RL" — a real, explicit scope decision,
since RL training runs thousands of live episodes and can't be a single
blocking IPC call the way the others can, needing a genuinely new,
real one-way progress-reporting mechanism this project has never
needed before.

Real plan: S09 (`pandas` stats + a histogram, reachable via "Analyze"),
S10 (`scikit-learn` model training + predictions, reachable via
"Train Model"), S11 (a live-training "Train Agent" button, needing
real, one-way main→renderer IPC for progress), S12 (persisting the
converged agent's own experience and replaying it from storage alone,
inside the GUI — the identical real proof `pocket-db`'s own Lesson 27
already made with two separate scripts, made real here with two real
buttons instead).

Lesson 09 (S09) is complete and verified in the real reference
project. A real, latent bug surfaced immediately: Lesson 2's own
DLL-PATH fix (prepending `C:\msys64\ucrt64\bin` to the spawned
process's own `PATH`) had, this whole time, been silently capable of
shadowing the correct `python.exe` with a different, real, separate
one living in that same folder — invisible until this lesson's own
first real `import pandas` line needed a package only the *correct*
interpreter actually had. Reproduced for real
(`ModuleNotFoundError: No module named 'pandas'`), then fixed at its
real, correct, narrow source: `os.add_dll_directory()` inside
`pocketdb.py` itself, letting `PocketDBClient`'s own constructor drop
the `PATH`-prepending trick entirely. `analyze` (a new protocol method)
reuses `pocket-db`'s own Lesson 25 `pandas.DataFrame` pattern, adds
`pd.to_numeric` for automatic numeric-column discovery, a real,
headless `matplotlib` histogram (`Agg` backend, `io.BytesIO`, proven to
produce a real, valid PNG signature with zero windows ever opened), and
base64 encoding — proven necessary, not just convenient, since a real
embedded `\n` byte in raw PNG data would otherwise corrupt this
project's own line-based protocol framing. A real "Analyze" button
now shows real statistics and a real, rendered histogram directly in
the window.

Lesson 10 (S10) is complete and verified in the real reference
project. `train_model` builds a real feature matrix/target vector
(reusing Lesson 9's own `pd.to_numeric` pattern), then trains a real
`sklearn.linear_model.LogisticRegression` — the identical real
classifier `pocket-db`'s own Lesson 26 already gave full treatment to
— reaching a real `0.85` accuracy on a `students` (`hours`/`passed`)
dataset shaped after that same lesson's own real one. `predict`, a
second new protocol method, needed the exact fitted model back on a
later, separate call; proved first, with a small, isolated, throwaway
script, that a plain, module-level Python variable genuinely persists
between two separate real function calls, then used that mechanism
(`trained_model`, joining `conn` as this project's own second and
third persisted global) so a real prediction never needs to retrain or
serialize the model. A real, dynamic form — reusing Lesson 6's own
per-column pattern, this time shaped by whichever features the model
actually used — lets a user type a new input and get a real, live
prediction, verified end-to-end through genuine, simulated clicks and
typing in the actual, running window (train on `students`, predict
`9` hours → real pass; `1` hour → real fail).

Lesson 11 (S11) is complete and verified in the real reference
project. Started by honestly measuring whether live progress reporting
was even needed at all: `pocket-db`'s own Lesson 27 real, `4x4`,
deterministic `FrozenLake` trains in `0.162` real seconds — genuinely
too fast to need it. Switched to a genuinely harder, real `8x8`,
stochastic map instead (`36` real seconds for `5000` episodes) — a real
reason, not a manufactured one. That harder environment then surfaced a
real, second, more serious problem on its own: a full `100,000`-episode
run produced *zero* real goal hits, worse than acting randomly. Traced
to a real, classic bug — `.index(max(...))` breaks ties by always
picking the lowest action index, which silently, systematically biases
every "exploit" decision toward one fixed direction whenever real
Q-values are still tied at zero (the common case early in a large,
real environment) — fixed with real, random tie-breaking
(`best_action`), re-verified with real, honest, non-zero, if imperfect,
win rates (`0.11`-`0.51` across real runs).

With a correct, real, honestly-slow training loop in hand, extended
this project's own JSON-lines protocol (Lesson 2) with a real, new
message shape — `{"id": ..., "progress": {...}}`, sharing its request's
own real `id` instead of ending it — proven with a real, captured
sequence of `25` real progress lines arriving before the one, real,
final response. Then crossed a real, second Electron IPC boundary this
project had never used in ten prior lessons: `webContents.send`/
`ipcRenderer.on`, real publish-subscribe, proven in complete isolation
first (a tiny, separate Electron process pushing three real,
timed messages with zero renderer-side requests at all) before wiring
it into `main.ts` (`mainWindow` lifted to module scope, matching
`dbClient`'s own established pattern) and `App.tsx` (a real
`onAgentProgress` subscription, registered once on mount). A real
"Train Agent" button now shows a real, live episode counter — directly
observed updating, `episode 8000/50000` through `46000/50000`, while
the training request was still genuinely open — then a real, final win
rate.

Lesson 12 (S12) is complete and verified in the real reference
project — the last real slice of the ML/RL arc. Started by directly
measuring whether this project's own already-known, real `95`-row page
capacity (`pocket-db`'s own Lesson 15) was actually compatible with
Lesson 11's own harder, real environment: it wasn't — real, measured
successful episodes ran as long as `97` steps, two of four sampled
already exceeding the real limit on their own. Fixed honestly, not by
raising the limit or guessing a safe episode count in advance, but with
a real, generate-and-test search: attempt a real, greedy episode, keep
it only if it both succeeds *and* fits under a real, deliberate `90`-row
safety margin, `Transaction.rollback()` (`pocket-db`'s own Lesson 24)
discarding everything else — this project's own first real use of
`rollback()` in either curriculum, after every earlier real use only
ever committed.

`replay_agent` then reused `pocket-db`'s own Lesson 27 replay pattern
exactly: a completely fresh `q_table`, trained `50` real passes over
nothing but the stored rows, a live environment touched only once, to
read its own static state/action counts, never stepped. Real, honest
result — `0.10` win rate from `45` stored transitions, genuinely lower
than Lesson 27's own `1.00` — explained directly in the lesson's own SE
Lens rather than smoothed over: a harder, real environment, a real,
imperfect original policy, and one real trajectory's worth of
experience instead of ten. Two real, gated buttons ("Persist
Experience," "Replay From Storage") proven end-to-end through an actual
three-click sequence: train (`0.16` win rate), persist (`1` episode,
`45` rows), replay (`0.10` win rate) — all in the real, running window.

The ML/RL arc is complete: S09 (`pandas` analysis), S10
(`scikit-learn` training/prediction), S11 (live-progress agent
training), and S12 (persist/replay) all reuse `pocket-db`'s own already-
real S11-S13 work, made reachable from the actual GUI for the first
time — the real, direct answer to "what is the point of the GUI if not
to make ML accessible to everyone."
