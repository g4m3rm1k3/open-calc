# Video Notes — A Study Companion, Built in HTML Lab

## What You Will Build

A real application for taking notes while watching lecture or tutorial videos:
paste a YouTube link, watch it, and write timestamped notes that jump the video
back to the exact moment they were written about. Tag notes, search across them,
reorder and sort your library, switch themes, save everything automatically, and
carry your whole library out as a file and back in. By the end, you will have
used almost every fundamental tool of frontend web development — not because a
lesson invented a reason to use it, but because the application genuinely needed
it to do its job.

This project is built entirely inside **HTML Lab** — no separate code editor, no
terminal, nothing to install. Open HTML Lab, and everything in this series
happens in the HTML, CSS, and JavaScript tabs you already see.

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../LESSON_CONTRACT.md).
The contract's principles — nothing assumed, every concept explained at first
use, two lenses on every non-trivial block, agile vertical slices, maximum
extraction — apply here at full strength, for a learner who has never written a
line of code and for one who already knows some JavaScript and wants the gaps
filled in. Where the contract talks about a domain that does not exist in this
environment (there is no terminal, no `npm`, no `git`, no real file system),
the *domain* still matters — version control, dependency management, and
deployment are real, important ideas — but the *how* is taught for what this
environment actually provides: `localStorage` instead of a database, the
Export/Split files buttons instead of a build step and a deploy, and HTML Lab's
own autosave instead of a commit. Every other domain in the contract —
browser APIs, security, debugging, performance, naming, comments — applies
exactly as written.

## Why This Project

Every feature below is something a real note-taking application needs, not a
contrived exercise invented to justify a language feature. A video list needs
arrays. Adding a video needs a form. Playing it needs a real embed. Notes that
survive a reload need `localStorage`. Notes tied to a moment in the video need
a real third-party API, discovered only once a plain `<iframe>` turns out not
to be enough. By the time this series reaches its final refactor — turning a
growing pile of functions into one well-designed class — the reason classes
exist will already be obvious, because the pain they solve will already have
been felt directly.

## How the Lessons Are Ordered

A visible, if minimal, application exists from lesson one: a video list, a
player, and a notes panel, all real HTML and CSS before a single line of
JavaScript is written. Every lesson after that adds one capability to
something already on screen and already working. Nothing is built before
there is a reason, on screen, that it is needed — the YouTube IFrame Player
API in lesson 07 is a direct example: a plain embed is used first, and only
replaced once "jump to the moment this note was written about" turns out to
require real control over the player, not just a rectangle showing video.

## Lessons

| # | Title | You Can See | Concepts |
|---|---|---|---|
| 01 | The App Shell | A static layout: video list, player area, and notes panel, with one hardcoded video | HTML structure, CSS layout (flexbox), the box model, HTML Lab's own tabs and Preview |
| 02 | Rendering the List | The same layout, now built from an array of video objects in a loop | Arrays, objects, iteration, template literals |
| 03 | Adding a Video | Paste a YouTube URL, click Add, it joins the list | Forms, input validation, string/URL parsing, events |
| 04 | Playing a Video | Click a list item — it loads and plays in a real embed; the selected item highlights | `<iframe>` embedding, selection state managed by hand |
| 05 | The Notes Panel | A textarea beside the player, tied to whichever video is selected | Textareas, per-item state modeling, designing a data shape |
| 06 | Saving with localStorage | Reload the page — the whole library is still there | `JSON.stringify`/`parse`, the `localStorage` API, serialization |
| 07 | Timestamped Notes | Notes become a list of `{ text, timestamp }`; "Add Note" captures the real current video time | The YouTube IFrame Player API — discovered as a real need, not assumed upfront |
| 08 | Jumping to a Timestamp | Click a note's time — the video seeks there | `player.seekTo()`, formatting seconds as `mm:ss` |
| 09 | Tags | Add tags to a note, rendered as pills | Arrays of strings, small reusable UI patterns |
| 10 | Filtering by Tag | Click a tag — only matching notes remain visible | `.filter()`, deriving a view from one source of truth |
| 11 | Search | Live text search across notes | String methods, live filtering, debouncing |
| 12 | Sorting | Sort notes by time, videos by date added | `Array.prototype.sort`, comparator functions |
| 13 | Reordering | Drag to reorder videos in the list | The HTML5 Drag and Drop API |
| 14 | Editor / Preview | A split view: raw text on one side, a rendered version on the other | Conditional rendering, writing a small text-transform function |
| 15 | Inline Math | Writing `$$...$$` in a note renders real mathematical notation | Loading and using a third-party library from a CDN (KaTeX — the same one this app's own blog uses) |
| 16 | Settings and Themes | A settings panel; light/dark mode persists across reloads | CSS custom properties, `classList`, a persisted preferences object |
| 17 | Keyboard Shortcuts | `/` focuses search, `n` starts a new note | Global `keydown` listeners, not hijacking keys while a field is focused |
| 18 | From Functions to a Class | The same behavior, reorganized around a `NoteLibrary` class | OOP, encapsulation, refactoring motivated by real, felt repetition |
| 19 *(optional)* | Export, Import, and Monaco | Download your library as a `.json` file and load it back in; an optional code scratchpad loads a real Monaco editor | `Blob` downloads, the File API, `FileReader`, loading a large third-party component via a CDN's own module loader |

## Definition of Done (whole project)

- A video can be added by URL, selected, and played
- Notes can be written, timestamped against the real video position, tagged, searched, sorted, and reordered
- The entire library survives a page reload with no data loss
- Clicking a note's timestamp seeks the actual video to that moment
- Math notation and a raw/preview split both render correctly inside a note
- Light and dark themes both work and persist
- You can explain, without looking anything up, why the project moved from plain functions to a class, and what specifically got easier afterward
