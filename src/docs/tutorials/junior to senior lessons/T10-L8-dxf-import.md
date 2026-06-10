# Junior to Senior — T10·L8 — DXF File Import

**Prerequisites:** T10·L7 (Polygon Boolean Operations). You have the full geometry
library. This lesson adds DXF import — the universal way customers deliver CAD
drawings to the CAD/CAM application.

**What this lab adds:**
- DXF structure: sections (HEADER, ENTITIES), entity types
- `ezdxf` Python library: reading entities without implementing the DXF spec
- Mapping DXF entities to internal geometry types
- Layer filtering: import only the selected layer
- Epsilon handling: DXF coordinates need rounding on import

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A DXF file has a `LINE` entity and an `ARC` entity. What internal types
>    do they map to?
> 2. A DXF file was created in inches but your CAD/CAM works in millimetres.
>    Where do you apply the unit conversion?
> 3. A DXF `INSERT` entity places a block named `BOLT` at position (100, 50).
>    What must the importer do?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A Python DXF importer that converts a `.dxf` file into the internal geometry types:

```python
from dxf_importer import import_dxf, GeometryResult

result = import_dxf('part.dxf', layer='0')
print(f'{len(result.segments)} segments, {len(result.arcs)} arcs')
```

---

### Concept: DXF Entity Types

| DXF Entity | Description | Import as |
|---|---|---|
| `LINE` | Two-point line | `Segment` |
| `ARC` | Centre/radius arc | `Arc` |
| `CIRCLE` | Full circle | `Arc` (0° to 360°) |
| `LWPOLYLINE` | 2D polyline | `Polyline` (segments + optional arc bulges) |
| `SPLINE` | NURBS spline | Approximated as `Polyline` |
| `INSERT` | Block insertion | Resolved to actual entities |

---

## Step 1 — Python DXF Importer

```bash
pip install ezdxf
```

Create `src/dxf_importer.py`:

```python
from __future__ import annotations
import math
from dataclasses import dataclass, field
from typing import Optional
import ezdxf
from ezdxf.entities import DXFGraphic


@dataclass
class Point2D:
    x: float
    y: float


@dataclass
class Segment2D:
    start: Point2D
    end:   Point2D


@dataclass
class Arc2D:
    centre:      Point2D
    radius:      float
    start_angle: float  # radians
    end_angle:   float  # radians
    clockwise:   bool


@dataclass
class GeometryResult:
    segments: list[Segment2D] = field(default_factory=list)
    arcs:     list[Arc2D]     = field(default_factory=list)
    errors:   list[str]       = field(default_factory=list)


def _deg_to_rad(d: float) -> float:
    return d * math.pi / 180.0


def import_dxf(
    filepath:   str,
    layer:      Optional[str] = None,
    units_per_mm: float       = 1.0,  # set to 25.4 for inch DXF files
) -> GeometryResult:
    """Imports geometry from a DXF file into internal types."""
    result = GeometryResult()

    try:
        doc = ezdxf.readfile(filepath)
    except Exception as e:
        result.errors.append(f'Failed to read DXF: {e}')
        return result

    msp = doc.modelspace()

    for entity in msp:
        if layer is not None and entity.dxf.layer != layer:
            continue

        try:
            _process_entity(entity, result, units_per_mm)
        except Exception as e:
            result.errors.append(f'Error processing {entity.dxftype()}: {e}')

    return result


def _scale(value: float, units_per_mm: float) -> float:
    return value / units_per_mm


def _process_entity(
    entity:       DXFGraphic,
    result:       GeometryResult,
    units_per_mm: float,
) -> None:
    s = lambda v: _scale(v, units_per_mm)

    entity_type = entity.dxftype()

    if entity_type == 'LINE':
        start = entity.dxf.start
        end   = entity.dxf.end
        result.segments.append(Segment2D(
            start = Point2D(s(start.x), s(start.y)),
            end   = Point2D(s(end.x),   s(end.y)),
        ))

    elif entity_type == 'ARC':
        centre = entity.dxf.center
        result.arcs.append(Arc2D(
            centre      = Point2D(s(centre.x), s(centre.y)),
            radius      = s(entity.dxf.radius),
            start_angle = _deg_to_rad(entity.dxf.start_angle),
            end_angle   = _deg_to_rad(entity.dxf.end_angle),
            clockwise   = False,  # DXF arcs are always CCW
        ))

    elif entity_type == 'CIRCLE':
        centre = entity.dxf.center
        result.arcs.append(Arc2D(
            centre      = Point2D(s(centre.x), s(centre.y)),
            radius      = s(entity.dxf.radius),
            start_angle = 0.0,
            end_angle   = 2 * math.pi,
            clockwise   = False,
        ))

    elif entity_type == 'LWPOLYLINE':
        points = list(entity.get_points('xy'))
        for i in range(len(points) - 1):
            result.segments.append(Segment2D(
                start = Point2D(s(points[i][0]),   s(points[i][1])),
                end   = Point2D(s(points[i+1][0]), s(points[i+1][1])),
            ))
        if entity.is_closed and len(points) >= 2:
            result.segments.append(Segment2D(
                start = Point2D(s(points[-1][0]), s(points[-1][1])),
                end   = Point2D(s(points[0][0]),  s(points[0][1])),
            ))

    elif entity_type == 'SPLINE':
        # Approximate spline as a polyline (flatten to segments):
        flattened = list(entity.flattening(0.01))  # tolerance 0.01mm
        for i in range(len(flattened) - 1):
            result.segments.append(Segment2D(
                start = Point2D(s(flattened[i].x),   s(flattened[i].y)),
                end   = Point2D(s(flattened[i+1].x), s(flattened[i+1].y)),
            ))
```

---

## Step 2 — Write Tests

Create `tests/test_dxf_importer.py`:

```python
import pytest
import math
import tempfile
import os
import ezdxf
from src.dxf_importer import import_dxf, GeometryResult


def make_test_dxf(entities: list) -> str:
    """Creates a temporary DXF file with the given entities."""
    doc = ezdxf.new()
    msp = doc.modelspace()
    for entity_fn in entities:
        entity_fn(msp)
    tmp = tempfile.NamedTemporaryFile(suffix='.dxf', delete=False)
    doc.saveas(tmp.name)
    return tmp.name


class TestLineImport:

    def test_imports_a_line_as_a_segment(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_line((0, 0), (50, 25))
        ])
        try:
            result = import_dxf(filepath)
            assert len(result.segments) == 1
            seg = result.segments[0]
            assert abs(seg.start.x - 0) < 1e-6
            assert abs(seg.end.x - 50) < 1e-6
            assert abs(seg.end.y - 25) < 1e-6
        finally:
            os.unlink(filepath)

    def test_imports_multiple_lines(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_line((0, 0), (10, 0)),
            lambda msp: msp.add_line((10, 0), (10, 10)),
        ])
        try:
            result = import_dxf(filepath)
            assert len(result.segments) == 2
        finally:
            os.unlink(filepath)


class TestArcImport:

    def test_imports_an_arc(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_arc(center=(0, 0), radius=5, start_angle=0, end_angle=90)
        ])
        try:
            result = import_dxf(filepath)
            assert len(result.arcs) == 1
            arc = result.arcs[0]
            assert abs(arc.radius - 5) < 1e-6
            assert abs(arc.start_angle - 0) < 1e-6
            assert abs(arc.end_angle - math.pi/2) < 1e-6
        finally:
            os.unlink(filepath)

    def test_imports_a_circle_as_full_arc(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_circle((10, 10), radius=3)
        ])
        try:
            result = import_dxf(filepath)
            assert len(result.arcs) == 1
            arc = result.arcs[0]
            assert abs(arc.end_angle - 2 * math.pi) < 1e-6
        finally:
            os.unlink(filepath)


class TestLayerFiltering:

    def test_filters_by_layer_name(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'PROFILE'}),
            lambda msp: msp.add_line((0, 0), (10, 0), dxfattribs={'layer': 'DIMENSIONS'}),
        ])
        try:
            result = import_dxf(filepath, layer='PROFILE')
            assert len(result.segments) == 1  # only the PROFILE layer segment
        finally:
            os.unlink(filepath)


class TestUnitConversion:

    def test_converts_inch_units_to_mm(self) -> None:
        filepath = make_test_dxf([
            lambda msp: msp.add_line((0, 0), (1, 0))  # 1 inch
        ])
        try:
            result = import_dxf(filepath, units_per_mm=1.0/25.4)  # 1 inch = 25.4mm
            assert abs(result.segments[0].end.x - 25.4) < 0.001
        finally:
            os.unlink(filepath)
```

### SAVE AND TRY

```bash
pytest tests/test_dxf_importer.py -v
```

Expected: all tests pass.

---

## 🎯 Challenge: Export to Internal Format

**You know:** DXF import, `Segment2D`, `Arc2D`.

**Task:** Write `to_polylines(result: GeometryResult) -> list[list[tuple[float, float]]]`
that converts the imported geometry to a list of polylines (ordered point sequences)
by connecting segments that share endpoints.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
def to_polylines(
    result: GeometryResult,
    epsilon: float = 1e-6,
) -> list[list[tuple[float, float]]]:
    """Chains segments into polylines by connecting shared endpoints."""
    if not result.segments:
        return []

    unvisited = set(range(len(result.segments)))
    polylines: list[list[tuple[float, float]]] = []

    while unvisited:
        # Start a new polyline:
        idx = min(unvisited)
        unvisited.remove(idx)
        seg = result.segments[idx]
        chain = [(seg.start.x, seg.start.y), (seg.end.x, seg.end.y)]

        # Try to extend the chain:
        extended = True
        while extended:
            extended = False
            end = chain[-1]
            for i in list(unvisited):
                s = result.segments[i]
                if abs(s.start.x - end[0]) < epsilon and abs(s.start.y - end[1]) < epsilon:
                    chain.append((s.end.x, s.end.y))
                    unvisited.remove(i)
                    extended = True
                    break
                elif abs(s.end.x - end[0]) < epsilon and abs(s.end.y - end[1]) < epsilon:
                    chain.append((s.start.x, s.start.y))
                    unvisited.remove(i)
                    extended = True
                    break

        polylines.append(chain)

    return polylines
```

</details>

---

## Final Check

| DXF Entity | Internal Type | Notes |
|---|---|---|
| `LINE` | `Segment2D` | Direct mapping |
| `ARC` | `Arc2D` | DXF arcs are always CCW |
| `CIRCLE` | `Arc2D` | 0° to 360° |
| `LWPOLYLINE` | Multiple `Segment2D` | One segment per consecutive pair |
| `SPLINE` | Multiple `Segment2D` | Flattened to polyline |

---

## Quick Check Answers

**1. DXF `LINE` and `ARC` entities — internal types?**

`LINE` → `Segment2D` (or `Segment` in TypeScript). Directly maps the two endpoint
coordinates. `ARC` → `Arc2D` (or `Arc`). Maps centre, radius, start angle, and end
angle. DXF arcs are always CCW — the direction flag is not needed.

**2. Inch DXF, mm CAD/CAM — where to apply unit conversion?**

At import time in the importer. Each coordinate is divided by `units_per_mm` (1.0/25.4
for inch → mm). Never store mixed units internally — convert once at the boundary.
The `import_dxf(filepath, units_per_mm=1.0/25.4)` parameter makes this explicit.

**3. DXF `INSERT` entity places block `BOLT`. What must the importer do?**

Resolve the block reference to actual geometry. The importer must:
1. Find the block definition named `BOLT` in the DXF file's BLOCKS section
2. Apply the INSERT's position, rotation, and scale transforms to all entities in the block
3. Add the transformed entities to the result as if they were regular entities

`ezdxf` provides `entity.virtual_entities()` which handles this automatically —
iterating virtual entities of an INSERT yields the transformed block contents.
