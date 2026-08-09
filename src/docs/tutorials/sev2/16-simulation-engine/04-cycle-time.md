# Tutorial 4: Cycle Time Estimation

## Introduction

Accurate cycle time estimation helps with job quoting and scheduling.

---

## Part 1: Time Components

| Component | Description |
|-----------|-------------|
| Cutting time | Feed moves at feed rate |
| Rapid time | Rapid moves at max speed |
| Tool change time | Fixed time per change |
| Dwell time | Programmed pauses (G04) |

---

## Part 2: Time Calculator

```python
# src/partflow/simulation/time.py
"""Cycle time calculation."""

from dataclasses import dataclass
from typing import List

from partflow.simulation.motion import MotionSegment
from partflow.simulation.state import MotionMode


@dataclass
class MachineConfig:
    """Machine-specific timing parameters."""
    rapid_rate: float = 10000.0      # mm/min for rapids
    tool_change_time: float = 10.0   # seconds per change
    spindle_accel_time: float = 3.0  # seconds to speed up
    coolant_delay: float = 1.0       # seconds for coolant


@dataclass
class TimeBreakdown:
    """Breakdown of cycle time."""
    cutting_time: float = 0.0
    rapid_time: float = 0.0
    tool_change_time: float = 0.0
    other_time: float = 0.0
    
    @property
    def total(self) -> float:
        return (self.cutting_time + self.rapid_time + 
                self.tool_change_time + self.other_time)
    
    def format(self) -> str:
        """Format for display."""
        total = self.total
        mins = int(total // 60)
        secs = int(total % 60)
        return f"{mins}:{secs:02d}"


def calculate_time(
    segments: List[MotionSegment],
    tool_changes: int = 0,
    config: MachineConfig = None,
) -> TimeBreakdown:
    """Calculate detailed time breakdown."""
    if config is None:
        config = MachineConfig()
    
    result = TimeBreakdown()
    
    for seg in segments:
        if seg.mode == MotionMode.RAPID:
            time = seg.distance / config.rapid_rate * 60
            result.rapid_time += time
        else:
            result.cutting_time += seg.time_seconds
    
    result.tool_change_time = tool_changes * config.tool_change_time
    
    # Add spindle accelerations (once per tool)
    result.other_time = tool_changes * config.spindle_accel_time
    
    return result
```

---

## Part 3: Enhanced Engine

```python
# Update SimulationResult

@dataclass
class SimulationResult:
    # ... existing fields ...
    time_breakdown: TimeBreakdown = None
    
    @property
    def formatted_time(self) -> str:
        if self.time_breakdown:
            return self.time_breakdown.format()
        mins = int(self.total_time // 60)
        secs = int(self.total_time % 60)
        return f"{mins}:{secs:02d}"
```

---

## Part 4: Usage

```python
from partflow.simulation.time import calculate_time, MachineConfig

# Custom machine configuration
haas_config = MachineConfig(
    rapid_rate=15000,       # Fast rapids
    tool_change_time=8.0,   # Quick changer
)

# Calculate
breakdown = calculate_time(
    segments=result.segments,
    tool_changes=len(result.tools_used),
    config=haas_config,
)

print(f"Cutting: {breakdown.cutting_time:.1f}s")
print(f"Rapids: {breakdown.rapid_time:.1f}s")
print(f"Tool changes: {breakdown.tool_change_time:.1f}s")
print(f"Total: {breakdown.format()}")
```

---

## Summary

### Curriculum Complete! 🎉

**Phase 16** finishes the tutorial series with:
- ✅ Simulation concepts
- ✅ Motion engine
- ✅ SVG visualization
- ✅ Cycle time estimation

---

## What You've Built

| Phase | Topic | Tutorials |
|-------|-------|-----------|
| 00 | Engineering Mindset | 4 |
| 01 | Engineering Foundation | 6 |
| 02 | Development Environment | 5 |
| 03 | Project Structure | 4 |
| 04 | Testing Discipline | 4 |
| 05 | Parts Domain | 6 |
| 06 | Machines & Relationships | 5 |
| 07 | Refactor Checkpoint #1 | 5 |
| 08 | Concurrency & Locking | 5 |
| 09 | Revision Control | 5 |
| 10 | Workflows & Governance | 5 |
| 11 | CAM Import | 5 |
| 12 | Refactor Checkpoint #2 | 4 |
| 13 | Access Control | 4 |
| 14 | Eventing & Observability | 4 |
| 15 | G-code Parsing | 4 |
| 16 | Simulation Engine | 4 |
| **Total** | | **79 tutorials** |

---

## Next Steps

1. **Work through the tutorials** in order
2. **Build the actual code** as you go
3. **Run tests** after each section
4. **Extend** with your own features

**Congratulations on completing the PartFlow curriculum!**
