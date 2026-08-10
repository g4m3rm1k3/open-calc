# Concept: Embedding a Real 3D View — `pyvista`/`pyvistaqt`'s `QtInteractor`

**What you'll understand by the end:** how a real, third-party 3D
graphics library (PyVista, built on VTK) provides a ready-made Qt
widget that embeds a real, interactive 3D viewport directly into an
ordinary window — and the one, real, load-bearing limitation this
brings: that widget cannot be constructed under a headless/offscreen
Qt platform at all.

**Prerequisites:** `pyside6-qapplication-and-mainwindow.md`.

## Setup

Python 3 with `pip install pyvista pyvistaqt numpy`.

## The Problem

Building a real, interactive 3D viewport from scratch (a render
window, a camera, mesh geometry, mouse-driven orbit/pan/zoom) is a
substantial, real undertaking — genuinely out of scope for an
application whose real job is editing and visualizing G-code, not
building a 3D engine. A real, mature, purpose-built library (PyVista,
itself built on VTK, the same real toolkit behind ParaView and much of
scientific visualization) already solves this — the real remaining
problem is just embedding it inside an existing Qt application.

## The Isolated Example

```python
import pyvista as pv

mesh = pv.Cube()
print("cube n_points:", mesh.n_points)
print("cube n_cells:", mesh.n_cells)
```

**Real output, run this session:**
```
cube n_points: 8
cube n_cells: 6
```

**What this proves:** `pv.Cube()` builds a real, in-memory mesh (a
`PolyData` object — 8 vertices, 6 faces) with **no** GUI, no window, no
GPU/OpenGL context involved at all — pure geometry construction, safe
to build and inspect anywhere, including a headless test.

`pyvistaqt.QtInteractor` is the real, different piece — a ready-made
`QWidget` subclass wrapping an actual, live VTK render window (a real
GPU/OpenGL surface), embeddable directly as an ordinary widget or tab:

```python
import sys
from PySide6.QtWidgets import QApplication
from pyvistaqt import QtInteractor
import pyvista as pv

app = QApplication.instance() or QApplication(sys.argv)
window_widget = QtInteractor()  # a REAL GPU surface, not headless-safe
window_widget.add_mesh(pv.Cube(), color="tan", show_edges=True)
window_widget.reset_camera()
```

This is exactly the real shape this project's own `BackplotTab` starts
from — a bare placeholder cube, proving the embedding works before any
real toolpath-driven geometry exists.

**The real, load-bearing limitation, confirmed directly this session**
— constructing a real `QtInteractor` under Qt's offscreen platform
(`QT_QPA_PLATFORM=offscreen`, the same platform this project's own
headless tests run under) crashes outright:

```python
import sys
from PySide6.QtWidgets import QApplication

app = QApplication.instance() or QApplication(sys.argv)
from pyvistaqt import QtInteractor
viewport = QtInteractor()  # constructed under QT_QPA_PLATFORM=offscreen
```

**Real output, run this session (`QT_QPA_PLATFORM=offscreen`):**
```
vtkWin32OpenGLRenderWindow (...): failed to get valid pixel format.
WARN| vtkWin32OpenGLRenderWindow (...): Failed to initialize OpenGL functions!
Segmentation fault (exit code 139)
```

**What this proves:** this is a genuine, real crash — not a Python
exception that could be caught with `try`/`except`, an actual
segmentation fault terminating the process. The offscreen platform
plugin has no real GPU surface for VTK's own OpenGL context to attach
to, and VTK's own native code fails at a level Python's own error
handling never gets a chance to intervene in.

## Mechanical Walkthrough

- `pv.Cube()`, `pv.Sphere()`, `pv.PolyData(...)` and similar
  **pure-geometry** constructors build real, in-memory mesh data —
  vertices, cell connectivity — with no window, no rendering, no GPU
  context. These are completely safe to construct, inspect, and unit
  test anywhere, headless or not.
- `QtInteractor()` is a genuinely different real thing: it creates an
  actual, live **VTK render window** wrapped in a `QWidget` — a real
  GPU/OpenGL resource, not just data. `.add_mesh(...)` hands a
  `PolyData` mesh to that live render window to actually display; a
  `PolyData` object itself never needed a `QtInteractor` to exist.
- Under a real, normal desktop session, `QtInteractor` works exactly
  like any other Qt widget — addable to a layout, a tab, a splitter.
  Under an *offscreen* platform (headless CI, a pytest run with no real
  display), there is no real surface for its underlying GPU context to
  attach to, and VTK's own native code — not Python's — fails.

## CS Lens

This is a real, concrete instance of the boundary between **pure data**
and a **live system resource** — the same underlying distinction
`pyside6-deletelater-deferred-destruction.md` and `pyside6-qt-python-
object-lifetime-and-references.md` already draw for Qt/C++ objects
generally, here drawn one level further: a `PolyData` mesh is
comparable to a plain Python value (safe, inert, fully inspectable);
a `QtInteractor` is comparable to an open file handle or a network
socket — a real, live handle to an external resource (a GPU context)
that can fail in ways no amount of correct Python code can prevent,
because the failure happens below Python's own error-handling reach
entirely.

Also recognized in: any GUI toolkit's own OpenGL/Vulkan-backed widget
(a WebGL `<canvas>` context that can fail to acquire in a headless
browser); a database connection object versus the query results it
returns — one is a live resource, the other is inert data.

## SE Lens

The real, practical consequence: no amount of `try`/`except` or careful
Python-level error handling can make constructing a real `QtInteractor`
safe under an offscreen platform — a segfault bypasses Python's own
exception machinery entirely. The only real, working strategy is
**avoidance**: never construct a real `QtInteractor` in a headless test
at all. This project's own real code follows this precisely — a
designer dialog's real `enable_preview` flag exists specifically to
skip constructing one under test, and `BackplotTab` itself has no
pytest coverage of its own real 3D viewport for the identical reason.

## Connection

Builds on `pyside6-qapplication-and-mainwindow.md`. Directly relevant
to `pyside6-headless-gui-testing.md` — this is a real, concrete
exception to that file's own general claim that Qt widgets can be
tested headlessly: a `QtInteractor` genuinely cannot, and the right
response is a real, explicit bypass mechanism, not a workaround that
tries to make it possible.

## Try It Yourself

1. Run the pure `pv.Cube()` example (no `QtInteractor` involved) under
   `QT_QPA_PLATFORM=offscreen` and confirm it works perfectly — direct,
   real proof the crash is specific to the live GPU-backed widget, not
   pyvista or PySide6 in general.
2. Look up `pyvista.OFF_SCREEN` / `pyvista.start_xvfb()` (a real,
   different offscreen-rendering strategy PyVista itself offers, using
   a real virtual framebuffer rather than Qt's own offscreen platform)
   and reason about why this project doesn't reach for it.
3. Find a real, different kind of "live resource that can fail below
   Python's own exception handling" in a codebase you have access to
   (a native database driver, a hardware/serial interface) and compare
   its own real failure mode against this file's `QtInteractor`
   example.
