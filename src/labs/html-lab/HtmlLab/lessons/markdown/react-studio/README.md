# React Studio — A Low-Code App Builder

## What You Will Build

A working, visual application builder — a small version of Figma, Retool, or
Appsmith — built entirely in React. You drag widgets onto a canvas, select them,
edit their properties in a panel, group them, wire up click actions, undo mistakes,
save your work, and preview the result as an end user would see it.

This is not a social media frontend. The [Frontend Client](../frontend-client/README.md)
project already teaches architecture and real-world data against a real API — on
purpose, in plain TypeScript, with no framework, so the *reasons* frameworks exist
are felt firsthand before one is used. This project assumes that felt need and
answers it: it exists specifically to teach **React** — components, props, state,
rendering, and composition — using a project where the UI itself is the entire
product, not an interface bolted onto someone else's data. There is no backend here.
Every byte this project manages is the shape of the application being built, live,
in the browser, by the person using it.

By the end you will:
- Understand what React actually does when state changes, and why that is different
  from manually updating the DOM
- Build a growing tree of components that render, select, and edit each other's data
- Lift state, share it across sibling components, and manage it with a reducer
- Build recursive components that render a tree of arbitrary depth (groups within groups)
- Write your first custom hook
- Use a Portal to render UI outside its component's normal place in the tree
- Design a small plugin architecture so new features do not require editing old code

---

## Why This Project, Specifically

Every one of these concepts could be taught with a smaller, purpose-built example —
and many React tutorials do exactly that, one disconnected mini-app per concept.
This project is one continuously evolving codebase instead, because **the reason a
concept like "lifting state up" exists only becomes obvious under real pressure**:
the Properties Panel and the Canvas both need to agree on which widget is selected
and what its current width is, in real time, and they are two different components.
That pressure is what state lifting *is for*. A widget builder puts you under that
exact pressure by lesson 05, honestly, because the feature you actually want (edit a
widget's properties) cannot be built any other way.

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson. This project is written for the same
audience as every other project in this curriculum: a complete beginner should be
able to follow it start to finish, with every construct — JSX, hooks, the virtual
DOM, all of it — explained at the moment it first appears, not assumed.

## How the Lessons Are Ordered

A hardcoded rectangle renders in lesson one. Every lesson after that adds one
capability to something already on screen and already working — selection before
editing, editing before undo, undo before persistence. No lesson builds a data
structure or an abstraction before there is a visible reason it needs to exist. The
widget tree, the reducer, the plugin registry, and the Context all appear at the
exact moment the feature already being built cannot proceed without them.

## Lessons

| # | Title | You Can See | React Concept | Why It's Needed Here |
|---|---|---|---|---|
| 01 | Rendering One Widget | A single rectangle renders on a canvas | JSX, components, props, the virtual DOM | The smallest possible React app: one component, no state yet |
| 02 | A Canvas of Widgets | Ten widgets render from an array | `useState`, rendering lists, `key` | One hardcoded widget cannot demonstrate what React is actually for |
| 03 | Selection | Clicking a widget highlights it | Lifting the simplest possible state up | Two widgets need to agree on which one is selected — neither can own that alone |
| 04 | Dragging | Widgets move with the mouse | Event handlers, immutable state updates, re-rendering | Selection without movement is a display feature, not an editor |
| 05 | The Properties Panel | A sidebar edits the selected widget's exact position and size | Controlled components, state lifted to a common parent | The panel and the canvas must always agree on the truth |
| 06 | Multiple Widget Types | Rectangles, text, and circles all render correctly | Conditional rendering, discriminated unions in props | A builder with one widget type is not a builder |
| 07 | The Layers Panel | A list of every widget; clicking one selects it on the canvas too | Two components reading and writing the same lifted state | Proof that "lifting state up" scales past two components |
| 08 | Grouping | Selected widgets combine into a group that moves as one | Recursive components, tree data structures | A group is a widget that contains widgets — the type must describe itself |
| 09 | Undo and Redo | Ctrl+Z reverts the last change; Ctrl+Shift+Z restores it | `useReducer`, actions, immutable history | Every edit so far has been a dead end with no way back |
| 10 | Wiring Actions | A button's click increments a real counter shown elsewhere in the app | `useContext`, separating design-time data from runtime state | A builder that cannot make widgets interactive is a mockup tool |
| 11 | Save and Load | Reloading the page restores your exact canvas | Custom hooks, `useEffect`, serialization | An editor that forgets everything on refresh is a toy |
| 12 | Performance | Dragging stays smooth with 500 widgets on the canvas | `React.memo`, understanding re-renders | The naive version, measured honestly, actually gets slow |
| 13 | Preview Mode | A full-screen preview shows the app with no editor chrome at all | Portals | Preview needs to escape the editor's own DOM structure entirely |
| 14 | The Widget Registry | Adding a new widget type requires no changes to existing files | A plugin architecture, the open/closed principle, `React.lazy` | Every widget type so far required editing one giant switch statement |
| 15 | Shortcuts and Shipping | Delete, copy, and paste work from the keyboard; the app is live at a URL | Global event listeners in `useEffect`, cleanup functions, production builds | The last rough edges between "a demo" and "a tool you'd actually use" |

## Definition of Done (whole project)

- A widget can be placed, selected, moved, resized, and deleted
- Widgets can be grouped, and a group moves and resizes as one unit
- Every edit can be undone and redone
- A button widget can be wired to a real action that changes visible app state
- The entire canvas survives a page reload
- The canvas stays smooth with hundreds of widgets on screen
- A new widget type can be added by writing one new file, not by editing the renderer
- You can explain, without looking anything up, what "re-render" means and when React decides one is necessary
