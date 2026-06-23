# SVG Studio

A browser-based SVG editor built with React and Fabric.js. Draw freehand, add
shapes and text, then move, scale, and rotate anything with handles — same as
a real vector tool — and export to SVG or PNG.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Features

- **Freehand drawing** — pencil tool with adjustable stroke width/color
- **Shapes** — rectangle, ellipse, triangle, line, all drag-to-size
- **Text** — click to place editable text, double-click to retype
- **Transform** — drag to move, corner handles to scale, top handle to rotate,
  or type exact x/y/width/height/angle into the side panel
- **Fill & stroke** — color pickers plus a small swatch palette
- **Layers panel** — see every object, click to select, hide, or delete
- **Arrange** — bring to front/back, nudge forward/backward, align to canvas
  edges or center
- **Undo/redo** — full history, Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z
- **Import SVG** — load an existing .svg file onto the canvas as an editable
  group
- **Export** — download as .svg (vector, fully editable later) or .png
  (raster, 2x resolution)

## Keyboard shortcuts

| Key | Action |
|---|---|
| Delete / Backspace | Remove selection |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z (or Ctrl+Y) | Redo |
| Cmd/Ctrl + D | Duplicate selection |
| Cmd/Ctrl + A | Select all |

## Why Fabric.js

Handles, rotate, and scale gizmos, free drawing, and SVG parsing/serialization
are solved problems with a lot of edge cases (bezier curve fitting for the
pencil tool, transform-origin math for rotation, etc). Fabric.js handles that
layer so the app code stays focused on the editing UI and the specific
features you asked for. Everything in `src/App.jsx` is editable — add new
shape tools, gradients, multi-page support, whatever you need next.

## Project structure

```
src/
  App.jsx     — all editor logic and UI
  App.css     — editor styling
  main.jsx    — React entry point
```
