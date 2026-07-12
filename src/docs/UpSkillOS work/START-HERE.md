# Start Here — How This Folder Is Organized

This folder is not one continuous curriculum. It's two different kinds of thing,
and they don't chain into each other.

## 1. `flutter-playground-lab/` — a real project, walk it in order

Six lessons, numbered 01 through 06. Start at Lesson 1. Each one builds directly on
the last, and by the end of Lesson 6 you have a real, finished, shipped feature —
`src/labs/flutter-playground/` — that didn't exist before. This is the one series
that's genuinely sequential.

## 2. Standalone fundamentals — pick any, any order, they don't connect

- `useeffect-and-useref-fundamentals/`
- `context-from-scratch/`
- `routing-fundamentals/`
- `async-and-promises/`
- `testing-fundamentals/`

Each of these is **one single lesson**, self-contained, teaching one concept by
reading and extending a small piece of code that **already exists** in this app
(`MatrixReducer.jsx`'s drag logic, `App.jsx`'s routes, `AuthContext.jsx`'s sync
code, etc.). They are real and they matter, but they don't build toward each other,
and they don't build toward Flutter Playground or "the app" as a whole. Do them in
whatever order you want, whenever a specific topic is what you need.

Suggested order if you want one: `useeffect-and-useref` and `routing` come up
constantly across this codebase — those first. `context-from-scratch` and
`async-and-promises` next. `testing` last — it's a habit to adopt more than a
blocking prerequisite for anything else here.

## What this is *not*

Nothing in this folder "builds the full app." The app already exists — this is real
software with years of features already in it. These lessons make you able to
independently read, extend, and trust specific real slices of it; they do not
recreate it from scratch. If that's what you remember being promised earlier in a
prior conversation, that framing was wrong and got corrected here.

## The other lesson sets in this folder

`git-fundamentals/`, `lesson-engine-autofind/`, `matrix-reducer-copy-button/`,
`favoriting-a-lesson/` are older, real, still-correct lesson sets — each was built
one at a time, triggered by a real bug or feature at the time, not planned as part
of one curriculum. Treat them as extra, optional reading, not part of the path
above.

See `concept-map.md` for the full inventory of what's been taught where.
