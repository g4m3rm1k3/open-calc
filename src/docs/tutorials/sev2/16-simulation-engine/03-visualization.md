# Tutorial 3: Toolpath Visualization

## Introduction

Visualize simulated toolpaths—export to formats suitable for display.

---

## Part 1: Visualization Options

| Option | Pros | Cons |
|--------|------|------|
| **SVG** | Web-friendly, vector | 2D only |
| Canvas/JS | Interactive | Requires frontend |
| 3D viewer | Full visualization | Complex |
| Text report | Simple | Not visual |

We implement **SVG export** for web display.

---

## Part 2: SVG Generator

```python
# src/partflow/simulation/svg.py
"""SVG visualization for toolpaths."""

from dataclasses import dataclass
from typing import List

from partflow.simulation.motion import MotionSegment
from partflow.simulation.state import MotionMode


@dataclass
class SVGConfig:
    """Configuration for SVG output."""
    width: int = 800
    height: int = 600
    margin: int = 20
    rapid_color: str = "#999"
    feed_color: str = "#0066cc"
    background: str = "#f5f5f5"
    stroke_width: float = 1.0


def generate_svg(
    segments: List[MotionSegment],
    config: SVGConfig = None,
) -> str:
    """Generate SVG from motion segments.
    
    Creates a 2D top-down view (X-Y plane).
    """
    if config is None:
        config = SVGConfig()
    
    if not segments:
        return _empty_svg(config)
    
    # Calculate bounds
    min_x = min(min(s.start.x, s.end.x) for s in segments)
    max_x = max(max(s.start.x, s.end.x) for s in segments)
    min_y = min(min(s.start.y, s.end.y) for s in segments)
    max_y = max(max(s.start.y, s.end.y) for s in segments)
    
    # Add padding
    range_x = max_x - min_x or 1
    range_y = max_y - min_y or 1
    
    # Scale factors
    scale_x = (config.width - 2 * config.margin) / range_x
    scale_y = (config.height - 2 * config.margin) / range_y
    scale = min(scale_x, scale_y)
    
    def transform_x(x: float) -> float:
        return config.margin + (x - min_x) * scale
    
    def transform_y(y: float) -> float:
        # Invert Y for SVG coordinate system
        return config.height - config.margin - (y - min_y) * scale
    
    # Build SVG
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{config.width}" height="{config.height}">',
        f'  <rect width="100%" height="100%" fill="{config.background}"/>',
        '  <g id="toolpath">',
    ]
    
    for seg in segments:
        color = config.rapid_color if seg.mode == MotionMode.RAPID else config.feed_color
        x1 = transform_x(seg.start.x)
        y1 = transform_y(seg.start.y)
        x2 = transform_x(seg.end.x)
        y2 = transform_y(seg.end.y)
        
        dash = 'stroke-dasharray="4,2"' if seg.mode == MotionMode.RAPID else ''
        
        lines.append(
            f'    <line x1="{x1:.1f}" y1="{y1:.1f}" '
            f'x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{color}" stroke-width="{config.stroke_width}" {dash}/>'
        )
    
    # Add start point marker
    if segments:
        start = segments[0].start
        lines.append(
            f'    <circle cx="{transform_x(start.x):.1f}" '
            f'cy="{transform_y(start.y):.1f}" r="4" fill="green"/>'
        )
        end = segments[-1].end
        lines.append(
            f'    <circle cx="{transform_x(end.x):.1f}" '
            f'cy="{transform_y(end.y):.1f}" r="4" fill="red"/>'
        )
    
    lines.extend([
        '  </g>',
        '</svg>',
    ])
    
    return '\n'.join(lines)


def _empty_svg(config: SVGConfig) -> str:
    """Generate empty SVG."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" 
width="{config.width}" height="{config.height}">
  <rect width="100%" height="100%" fill="{config.background}"/>
  <text x="50%" y="50%" text-anchor="middle">No toolpath data</text>
</svg>'''
```

---

## Part 3: Web Integration

```python
# In routes

from partflow.gcode.parser import GCodeParser
from partflow.simulation.engine import SimulationEngine
from partflow.simulation.svg import generate_svg


@parts_bp.route('/<uuid:part_id>/toolpath')
def view_toolpath(part_id):
    """Display toolpath visualization."""
    # Get G-code from Part (would be stored)
    gcode = get_gcode_for_part(part_id)
    
    parser = GCodeParser(gcode)
    program = parser.parse()
    
    engine = SimulationEngine()
    result = engine.simulate(program)
    
    svg = generate_svg(result.segments)
    
    return render_template(
        'parts/toolpath.html',
        part=get_part(part_id),
        svg=svg,
        stats=result,
    )
```

Template:

```html
{% extends "base.html" %}

{% block content %}
<h2>Toolpath Visualization</h2>

<div class="toolpath-container">
    {{ svg | safe }}
</div>

<table class="stats-table">
    <tr><th>Total Distance</th><td>{{ "%.1f"|format(stats.total_distance) }} mm</td></tr>
    <tr><th>Estimated Time</th><td>{{ "%.1f"|format(stats.total_time) }} seconds</td></tr>
    <tr><th>X Range</th><td>{{ "%.1f"|format(stats.min_x) }} to {{ "%.1f"|format(stats.max_x) }}</td></tr>
    <tr><th>Y Range</th><td>{{ "%.1f"|format(stats.min_y) }} to {{ "%.1f"|format(stats.max_y) }}</td></tr>
</table>
{% endblock %}
```

---

## Summary

### SVG Features

| Feature | Implementation |
|---------|---------------|
| Scaling | Auto-fit to bounds |
| Colors | Rapid vs feed |
| Dashes | Rapid moves |
| Markers | Start (green) / End (red) |

---

## Next Tutorial

[Tutorial 4: Cycle Time Estimation →](./04-cycle-time.md)
