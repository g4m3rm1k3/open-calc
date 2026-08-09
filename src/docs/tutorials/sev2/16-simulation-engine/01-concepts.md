# Tutorial 1: Simulation Concepts

## Introduction

A simulation engine predicts CNC machine behavior from G-code—toolpaths, cycle times, and possible collisions.

---

## Part 1: What is Simulation?

### 1.1 Simulation Purpose

| Purpose | Value |
|---------|-------|
| Verify toolpaths | Catch errors before machining |
| Estimate time | Quote and schedule jobs |
| Detect collisions | Prevent crashes |
| Visualize | Communicate with operators |

### 1.2 Simulation Types

| Type | Complexity | What It Does |
|------|------------|--------------|
| **Geometric** | Low | Draw toolpaths |
| **Kinematic** | Medium | Track motion and time |
| **Dynamic** | High | Include physics |

We implement **kinematic simulation** (motion + time).

---

## Part 2: Machine State

### 2.1 State Model

```python
# src/partflow/simulation/state.py
"""Machine state for simulation."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class MotionMode(Enum):
    RAPID = "G00"
    LINEAR = "G01"
    ARC_CW = "G02"
    ARC_CCW = "G03"


class PositionMode(Enum):
    ABSOLUTE = "G90"
    INCREMENTAL = "G91"


class Units(Enum):
    INCH = "G20"
    METRIC = "G21"


@dataclass
class Position:
    """3D position."""
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    
    def distance_to(self, other: 'Position') -> float:
        """Calculate distance to another position."""
        return (
            (self.x - other.x) ** 2 +
            (self.y - other.y) ** 2 +
            (self.z - other.z) ** 2
        ) ** 0.5
    
    def copy(self) -> 'Position':
        return Position(self.x, self.y, self.z)


@dataclass
class MachineState:
    """Current state of the simulated machine."""
    position: Position = field(default_factory=Position)
    motion_mode: MotionMode = MotionMode.RAPID
    position_mode: PositionMode = PositionMode.ABSOLUTE
    units: Units = Units.METRIC
    feed_rate: float = 0.0
    spindle_speed: int = 0
    spindle_on: bool = False
    coolant_on: bool = False
    current_tool: Optional[int] = None
    
    def copy(self) -> 'MachineState':
        """Create a copy of this state."""
        return MachineState(
            position=self.position.copy(),
            motion_mode=self.motion_mode,
            position_mode=self.position_mode,
            units=self.units,
            feed_rate=self.feed_rate,
            spindle_speed=self.spindle_speed,
            spindle_on=self.spindle_on,
            coolant_on=self.coolant_on,
            current_tool=self.current_tool,
        )
```

---

## Part 3: Motion Segments

```python
# src/partflow/simulation/motion.py
"""Motion segment representation."""

from dataclasses import dataclass
from typing import Optional

from partflow.simulation.state import Position, MotionMode


@dataclass
class MotionSegment:
    """A single motion from one point to another."""
    start: Position
    end: Position
    mode: MotionMode
    feed_rate: float
    tool: Optional[int]
    
    @property
    def distance(self) -> float:
        """Calculate segment distance."""
        return self.start.distance_to(self.end)
    
    @property
    def time_seconds(self) -> float:
        """Calculate time for this segment."""
        if self.mode == MotionMode.RAPID:
            # Rapid: assume ~10000 mm/min
            return self.distance / 10000 * 60
        elif self.feed_rate > 0:
            # Feed move: use feed rate (mm/min)
            return self.distance / self.feed_rate * 60
        return 0.0
```

---

## Part 4: Key Concepts

### 4.1 Modal Codes

G-codes are **modal**—they stay active until changed:

```gcode
G01 X10      ; Linear feed starts
X20          ; Still linear feed (G01 active)
Y30          ; Still linear feed
G00 X0       ; Now rapid (G00 replaces G01)
```

### 4.2 Coordinate Systems

| Mode | Meaning |
|------|---------|
| G90 (Absolute) | Coordinates are from origin |
| G91 (Incremental) | Coordinates are from current position |

---

## Summary

### Simulation Building Blocks

| Component | Purpose |
|-----------|---------|
| MachineState | Current machine status |
| Position | 3D coordinates |
| MotionSegment | One move |
| Modal tracking | Remember active codes |

---

## Next Tutorial

[Tutorial 2: Simulation Engine →](./02-engine.md)
