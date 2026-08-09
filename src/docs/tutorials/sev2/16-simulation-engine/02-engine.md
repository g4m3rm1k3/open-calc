# Tutorial 2: Simulation Engine

## Introduction

The engine processes G-code blocks, updating machine state and generating motion.

---

## Part 1: Engine Design

### 1.1 Responsibilities

| Task | Description |
|------|-------------|
| Parse modal codes | Track active modes |
| Calculate positions | Handle absolute/incremental |
| Generate segments | Create motion records |
| Calculate time | Sum segment times |

---

## Part 2: Implementation

```python
# src/partflow/simulation/engine.py
"""G-code simulation engine."""

from dataclasses import dataclass, field
from typing import List

from partflow.gcode.ast import GCodeProgram, GCodeBlock
from partflow.simulation.state import (
    MachineState, Position, MotionMode, 
    PositionMode, Units,
)
from partflow.simulation.motion import MotionSegment


@dataclass
class SimulationResult:
    """Result of simulation."""
    segments: List[MotionSegment] = field(default_factory=list)
    total_time: float = 0.0
    total_distance: float = 0.0
    max_x: float = 0.0
    max_y: float = 0.0
    max_z: float = 0.0
    min_x: float = 0.0
    min_y: float = 0.0
    min_z: float = 0.0
    tools_used: List[int] = field(default_factory=list)


class SimulationEngine:
    """Simulates G-code execution."""
    
    def __init__(self):
        self._state = MachineState()
        self._segments: List[MotionSegment] = []
    
    def simulate(self, program: GCodeProgram) -> SimulationResult:
        """Simulate a G-code program."""
        self._state = MachineState()
        self._segments = []
        
        for block in program.blocks:
            self._process_block(block)
        
        return self._build_result()
    
    def _process_block(self, block: GCodeBlock) -> None:
        """Process one G-code block."""
        # Update modal states from G-codes
        for g in block.g_codes:
            if g == 0:
                self._state.motion_mode = MotionMode.RAPID
            elif g == 1:
                self._state.motion_mode = MotionMode.LINEAR
            elif g == 2:
                self._state.motion_mode = MotionMode.ARC_CW
            elif g == 3:
                self._state.motion_mode = MotionMode.ARC_CCW
            elif g == 20:
                self._state.units = Units.INCH
            elif g == 21:
                self._state.units = Units.METRIC
            elif g == 90:
                self._state.position_mode = PositionMode.ABSOLUTE
            elif g == 91:
                self._state.position_mode = PositionMode.INCREMENTAL
        
        # Update from M-codes
        for m in block.m_codes:
            if m == 3 or m == 4:
                self._state.spindle_on = True
            elif m == 5:
                self._state.spindle_on = False
            elif m == 6 and block.tool:
                self._state.current_tool = block.tool
            elif m == 8:
                self._state.coolant_on = True
            elif m == 9:
                self._state.coolant_on = False
        
        # Update spindle/feed
        if block.spindle:
            self._state.spindle_speed = block.spindle
        if block.feed:
            self._state.feed_rate = block.feed
        if block.tool:
            self._state.current_tool = block.tool
        
        # Calculate motion
        if block.x is not None or block.y is not None or block.z is not None:
            self._generate_motion(block)
    
    def _generate_motion(self, block: GCodeBlock) -> None:
        """Generate motion segment from block."""
        start = self._state.position.copy()
        
        # Calculate end position
        if self._state.position_mode == PositionMode.ABSOLUTE:
            end = Position(
                x=block.x if block.x is not None else start.x,
                y=block.y if block.y is not None else start.y,
                z=block.z if block.z is not None else start.z,
            )
        else:  # Incremental
            end = Position(
                x=start.x + (block.x or 0),
                y=start.y + (block.y or 0),
                z=start.z + (block.z or 0),
            )
        
        # Create segment
        if start.distance_to(end) > 0.001:  # Skip zero-length
            segment = MotionSegment(
                start=start,
                end=end,
                mode=self._state.motion_mode,
                feed_rate=self._state.feed_rate,
                tool=self._state.current_tool,
            )
            self._segments.append(segment)
        
        # Update position
        self._state.position = end
    
    def _build_result(self) -> SimulationResult:
        """Build final result."""
        result = SimulationResult(
            segments=self._segments,
            tools_used=list(set(
                s.tool for s in self._segments 
                if s.tool is not None
            )),
        )
        
        for seg in self._segments:
            result.total_time += seg.time_seconds
            result.total_distance += seg.distance
            
            for pos in [seg.start, seg.end]:
                result.max_x = max(result.max_x, pos.x)
                result.max_y = max(result.max_y, pos.y)
                result.max_z = max(result.max_z, pos.z)
                result.min_x = min(result.min_x, pos.x)
                result.min_y = min(result.min_y, pos.y)
                result.min_z = min(result.min_z, pos.z)
        
        return result
```

---

## Part 3: Tests

```python
"""Tests for simulation engine."""

import pytest
from partflow.gcode.parser import GCodeParser
from partflow.simulation.engine import SimulationEngine


class TestSimulationEngine:
    
    def test_simple_motion(self):
        parser = GCodeParser("G00 X10 Y20")
        program = parser.parse()
        
        engine = SimulationEngine()
        result = engine.simulate(program)
        
        assert len(result.segments) == 1
        seg = result.segments[0]
        assert seg.end.x == 10
        assert seg.end.y == 20
    
    def test_incremental_mode(self):
        parser = GCodeParser("""
        G91
        G00 X10
        G00 X10
        """)
        program = parser.parse()
        
        engine = SimulationEngine()
        result = engine.simulate(program)
        
        # Should end at X=20 (10+10)
        last_seg = result.segments[-1]
        assert last_seg.end.x == 20
    
    def test_total_time(self):
        parser = GCodeParser("""
        G01 X100 F100
        """)
        program = parser.parse()
        
        engine = SimulationEngine()
        result = engine.simulate(program)
        
        # 100mm at 100mm/min = 1 minute = 60 seconds
        assert result.total_time == pytest.approx(60, rel=0.1)
```

---

## Summary

### Engine Flow

1. Process each block
2. Update modal codes
3. Calculate new position
4. Generate motion segment
5. Accumulate results

---

## Next Tutorial

[Tutorial 3: Toolpath Visualization →](./03-visualization.md)
