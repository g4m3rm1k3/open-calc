# Junior to Senior — T10·L8 — DXF File Import

**Prerequisites:** T10·L7 (Polygon Boolean Operations). You have the full geometry library.
This lesson explains the DXF format by showing you its STRUCTURE — what a DXF file actually
contains — before writing any import code, so you understand what `ezdxf` is doing for you.

**What this lab adds:**
- WHAT a DXF file looks like inside — groups, codes, sections, entities
- WHY you use `ezdxf` instead of reading the DXF file yourself
- HOW each DXF entity type maps to your internal geometry types — the specific fields
- WHY unit conversion must happen at import time, not later
- Testing the import with a DXF file you create in the test itself

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A DXF LINE entity has these fields: `start`, `end`, `layer`. Why does the importer
>    need to know the `layer` name?
> 2. A DXF file was created in a program that uses INCHES. Your geometry library uses
>    millimetres. At what point in the import pipeline do you apply the conversion factor?
> 3. A DXF `LWPOLYLINE` (lightweight polyline) has 6 vertices. How many `Segment`
>    objects does it produce? What if it is a CLOSED polyline?
>
> *(Answers at the end of this lab)*

---

## What a DXF File Looks Like

DXF files are plain text (you can open them in a text editor). They use a "group code" format:
each pair of lines is a (code, value) pair.

```
  0        ← group code (what kind of thing follows)
SECTION    ← value (a section starts)
  2
ENTITIES   ← which section
  0
LINE       ← a LINE entity begins
  8
0          ← layer name (layer "0")
 10        ← code 10 = start X
0.0
 20        ← code 20 = start Y
0.0
 11        ← code 11 = end X
50.0
 21        ← code 21 = end Y
25.0
  0
ENDSEC
```

The structure is: `SECTION → entity type → field codes → values`. Code 10/20/30 are X/Y/Z
of a point. Code 8 is the layer name. Code 11/21/31 are the second point's X/Y/Z.

Without a library, you would parse this yourself — thousands of lines of code to handle all
entity types, optional fields, and version differences. `ezdxf` parses it and gives you
Python objects with named attributes.

---

## Step 1 — Install and Verify

```bash
pip install ezdxf
```

```bash
python -c "
import ezdxf
print('ezdxf version:', ezdxf.__version__)

# Read one entity programmatically to understand the structure:
doc = ezdxf.new()
msp = doc.modelspace()
msp.add_line((0, 0), (50, 25))

for entity in msp:
    print('Entity type:', entity.dxftype())
    print('Start:', entity.dxf.start)  # Vec3(0, 0, 0)
    print('End:',   entity.dxf.end)    # Vec3(50, 25, 0)
    print('Layer:', entity.dxf.layer)  # '0' (default layer)
"
```

**You should see:**
```
ezdxf version: 1.x.x
Entity type: LINE
Start: (0, 0, 0)
End: (50, 25, 0)
Layer: 0
```

`ezdxf` gives you Python objects with `.dxf.start`, `.dxf.end`, `.dxf.layer` attributes.
You do not write any group-code parsing.

---

### Concept: Why `ezdxf` Instead of Manual Parsing

**The DXF problem:** The DXF specification is 2,000+ pages. It has been revised 15+ times.
Different CAD software writes slightly different DXF. Manual parsing handles the spec version
you test, and breaks on the next version or the next software.

**What `ezdxf` hides:** The group code parsing, version detection, entity attribute lookup,
coordinate system transforms, and dozens of optional field defaults. You call
`entity.dxf.start` and get a 3D vector — regardless of whether the DXF file used the
old or new attribute format.

**The specific mapping you DO write:**

```python
# ezdxf gives you this:
line_entity.dxf.start  # Vec3(x, y, z)
line_entity.dxf.end    # Vec3(x, y, z)

# You convert to your types:
Segment(
    Point(line_entity.dxf.start.x, line_entity.dxf.start.y),
    Point(line_entity.dxf.end.x,   line_entity.dxf.end.y),
)
```

The conversion is simple because `ezdxf` did the hard part.

**You will see this again in:**
- SVG import: use `svgpathtools` instead of parsing SVG XML manually
- Excel import: use `openpyxl` instead of parsing XLSX ZIP archives manually
- The general rule: use a library for any established file format

---

## Step 2 — Build the Importer

Create `src/dxf_importer.py`:

```python
# src/dxf_importer.py
from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Optional
import ezdxf
from ezdxf.entities import DXFGraphic


@dataclass
class Segment2D:
    start: tuple[float, float]
    end:   tuple[float, float]


@dataclass
class Arc2D:
    centre:      tuple[float, float]
    radius:      float
    start_angle: float   # radians
    end_angle:   float   # radians
    clockwise:   bool    # DXF arcs are always CCW, so this is always False


@dataclass
class GeometryResult:
    segments: list[Segment2D] = field(default_factory=list)
    arcs:     list[Arc2D]     = field(default_factory=list)
    errors:   list[str]       = field(default_factory=list)


def _deg_to_rad(d: float) -> float:
    return d * math.pi / 180.0


def import_dxf(
    filepath:         str,
    layer:            Optional[str] = None,
    units_per_mm:     float         = 1.0,
) -> GeometryResult:
    """
    Imports 2D geometry from a DXF file.

    units_per_mm: conversion factor. Set to 25.4 to convert from inches.
    layer: if given, only import entities on this layer.
    """
    result = GeometryResult()

    try:
        doc = ezdxf.readfile(filepath)
    except Exception as e:
        result.errors.append(f'Failed to read DXF: {e}')
        return result

    msp = doc.modelspace()

    for entity in msp:
        # Layer filter — skip entities not on the requested layer:
        if layer is not None and entity.dxf.layer != layer:
            continue

        try:
            _import_entity(entity, result, units_per_mm)
        except Exception as e:
            result.errors.append(f'Error importing {entity.dxftype()}: {e}')

    return result


def _scale(v: float, units_per_mm: float) -> float:
    """Convert from file units to millimetres."""
    return v / units_per_mm


def _import_entity(
    entity:       DXFGraphic,
    result:       GeometryResult,
    units_per_mm: float,
) -> None:
    s = lambda v: _scale(v, units_per_mm)   # shorthand

    t = entity.dxftype()

    if t == 'LINE':
        start = entity.dxf.start
        end   = entity.dxf.end
        result.segments.append(Segment2D(
            start = (s(start.x), s(start.y)),
            end   = (s(end.x),   s(end.y)),
        ))

    elif t == 'ARC':
        centre = entity.dxf.center
        result.arcs.append(Arc2D(
            centre      = (s(centre.x), s(centre.y)),
            radius      = s(entity.dxf.radius),
            start_angle = _deg_to_rad(entity.dxf.start_angle),
            end_angle   = _deg_to_rad(entity.dxf.end_angle),
            clockwise   = False,   # DXF arcs are always CCW by spec
        ))

    elif t == 'CIRCLE':
        centre = entity.dxf.center
        result.arcs.append(Arc2D(
            centre      = (s(centre.x), s(centre.y)),
            radius      = s(entity.dxf.radius),
            start_angle = 0.0,
            end_angle   = math.pi * 2,
            clockwise   = False,
        ))

    elif t == 'LWPOLYLINE':
        pts = list(entity.get_points('xy'))
        for i in range(len(pts) - 1):
            result.segments.append(Segment2D(
                start = (s(pts[i][0]),   s(pts[i][1])),
                end   = (s(pts[i+1][0]), s(pts[i+1][1])),
            ))
        if entity.is_closed and len(pts) >= 2:
            # Closing segment: last point back to first:
            result.segments.append(Segment2D(
                start = (s(pts[-1][0]), s(pts[-1][1])),
                end   = (s(pts[0][0]),  s(pts[0][1])),
            ))

    elif t == 'SPLINE':
        # Approximate spline as a polyline (flattened to 0.01mm tolerance):
        pts = list(entity.flattening(0.01 * units_per_mm))
        for i in range(len(pts) - 1):
            result.segments.append(Segment2D(
                start = (s(pts[i].x),   s(pts[i].y)),
                end   = (s(pts[i+1].x), s(pts[i+1].y)),
            ))
```

---

## Step 3 — Write Tests That Create DXF Files

The tests create DXF files programmatically — no external test files needed:

```python
# tests/test_dxf_importer.py
import pytest
import math
import tempfile
import os
import ezdxf
from src.dxf_importer import import_dxf, GeometryResult


def make_dxf(entities_fn) -> str:
    """Creates a temporary DXF file. Returns the path."""
    doc = ezdxf.new()
    msp = doc.modelspace()
    entities_fn(msp)
    tmp = tempfile.NamedTemporaryFile(suffix='.dxf', delete=False)
    doc.saveas(tmp.name)
    return tmp.name


class TestLineImport:

    def test_imports_a_line_as_a_segment(self) -> None:
        # Create a DXF with one LINE entity:
        path = make_dxf(lambda msp: msp.add_line((0, 0), (50, 25)))
        try:
            result = import_dxf(path)
            assert len(result.segments) == 1
            seg = result.segments[0]
            assert abs(seg.start[0] - 0) < 0.001
            assert abs(seg.end[0] - 50) < 0.001
            assert abs(seg.end[1] - 25) < 0.001
        finally:
            os.unlink(path)

    def test_imports_multiple_lines(self) -> None:
        def add_lines(msp):
            msp.add_line((0, 0), (10, 0))
            msp.add_line((10, 0), (10, 10))

        path = make_dxf(add_lines)
        try:
            result = import_dxf(path)
            assert len(result.segments) == 2
        finally:
            os.unlink(path)


class TestArcImport:

    def test_imports_an_arc(self) -> None:
        path = make_dxf(
            lambda msp: msp.add_arc(center=(0, 0), radius=5, start_angle=0, end_angle=90)
        )
        try:
            result = import_dxf(path)
            assert len(result.arcs) == 1
            arc = result.arcs[0]
            assert abs(arc.radius - 5) < 0.001
            assert abs(arc.end_angle - math.pi/2) < 0.001   # 90° = π/2 radians
        finally:
            os.unlink(path)

    def test_imports_a_circle_as_full_arc(self) -> None:
        path = make_dxf(lambda msp: msp.add_circle((10, 10), radius=3))
        try:
            result = import_dxf(path)
            assert len(result.arcs) == 1
            assert abs(result.arcs[0].end_angle - 2 * math.pi) < 0.001
        finally:
            os.unlink(path)


class TestLayerFiltering:

    def test_filters_by_layer_name(self) -> None:
        def add_entities(msp):
            msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'PROFILE'})
            msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'DIMENSIONS'})

        path = make_dxf(add_entities)
        try:
            result = import_dxf(path, layer='PROFILE')
            assert len(result.segments) == 1   # only PROFILE layer
        finally:
            os.unlink(path)


class TestUnitConversion:

    def test_converts_inches_to_mm(self) -> None:
        # 1 inch line:
        path = make_dxf(lambda msp: msp.add_line((0, 0), (1, 0)))
        try:
            # units_per_mm = 1/25.4 means: 1 file unit = 1 inch = 25.4mm
            result = import_dxf(path, units_per_mm=1/25.4)
            # 1 inch = 25.4mm:
            assert abs(result.segments[0].end[0] - 25.4) < 0.1
        finally:
            os.unlink(path)
```

### SAVE AND TRY

```bash
pytest tests/test_dxf_importer.py -v
```

Expected: all tests pass.

**Change something:** Change `units_per_mm=1/25.4` to `units_per_mm=1.0` in the unit conversion test.
Expected: the test FAILS because the 1-inch line is now treated as 1mm. This demonstrates that
unit conversion MUST be applied at import time — not later — and that the conversion factor must
be correct for the source file.

---

## 🎯 Challenge: Import a Polyline With Correct Segment Count

**You know:** DXF LWPOLYLINE, how it maps to segments.

**Task:** Write a test that:
1. Creates a DXF with a closed LWPOLYLINE with 4 vertices (a rectangle)
2. Imports it
3. Verifies the correct number of segments: 4 for a closed polyline (not 3)

The test must fail first (write it before checking the code), then pass.

---

<details>
<summary>▶ Show Solution</summary>

```python
def test_closed_lwpolyline_produces_n_segments() -> None:
    def add_rect(msp):
        msp.add_lwpolyline(
            [(0,0), (10,0), (10,10), (0,10)],
            close=True,   # this is a closed polyline
        )

    path = make_dxf(add_rect)
    try:
        result = import_dxf(path)
        # 4 vertices + closed = 4 segments (the closing segment connects vertex 3 back to vertex 0)
        assert len(result.segments) == 4
    finally:
        os.unlink(path)
```

**Key insight:** An open LWPOLYLINE with 4 vertices produces 3 segments (between consecutive pairs).
A CLOSED LWPOLYLINE produces 4 segments — the 4th connects the last vertex back to the first.
The importer code handles this with `if entity.is_closed: append closing segment`.
Without `close=True`, a rectangle would be open at one corner.

</details>

---

## Final Check

| DXF Entity | Imported as | Fields used |
|---|---|---|
| `LINE` | One `Segment2D` | `start`, `end` |
| `ARC` | One `Arc2D` | `center`, `radius`, `start_angle`, `end_angle` |
| `CIRCLE` | One `Arc2D` (0° to 360°) | `center`, `radius` |
| `LWPOLYLINE` | N `Segment2D`s | `get_points('xy')`, `is_closed` |
| `SPLINE` | N `Segment2D`s | `flattening(tolerance)` |

---

## Quick Check Answers

**1. DXF LINE has layer name. Why does the importer need it?**

DXF files have layers, like Photoshop. A typical engineering drawing has layers: PROFILE
(the shape to cut), DIMENSIONS (annotations), CONSTRUCTION (reference lines not to cut),
ANNOTATIONS (text labels). The importer filters by layer so it only processes the geometry
meant for machining — not the annotations or dimensions that should not become toolpaths.

**2. Unit conversion — at what point in the pipeline?**

At import time — the first step after reading each coordinate from the DXF. Never store
DXF coordinates in your internal types (Segment2D, Arc2D) without converting. If you store
raw values and convert later, it is easy to apply the conversion twice or forget it. The
`_scale(v, units_per_mm)` call is applied inside `_import_entity` before any geometry is created.

**3. LWPOLYLINE with 6 vertices — how many Segment objects? If closed?**

Open LWPOLYLINE: 5 segments (between vertex 0-1, 1-2, 2-3, 3-4, 4-5).
Closed LWPOLYLINE: 6 segments — the 6th connects vertex 5 back to vertex 0.
The importer adds the closing segment explicitly: `if entity.is_closed: append(last→first)`.
