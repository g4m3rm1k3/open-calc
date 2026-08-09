# Tutorial 2: CAM File Structure

## Introduction

This tutorial analyzes the Mastercam XML structure and creates domain objects to represent it.

---

## Part 1: Mastercam XML Structure

### 1.1 Top-Level Elements

```xml
<MastercamDocument>
  <FileInfo>...</FileInfo>       <!-- File metadata -->
  <Operations>...</Operations>   <!-- Toolpath operations -->
  <Tools>...</Tools>             <!-- Tool definitions (optional) -->
  <Stock>...</Stock>             <!-- Material/stock definition (optional) -->
</MastercamDocument>
```

### 1.2 FileInfo Section

```xml
<FileInfo>
  <FileName>WIDGET-001</FileName>
  <FilePath>C:\CAM\Projects\Widget\WIDGET-001.mcam</FilePath>
  <PostProcessor>HAAS_VF</PostProcessor>
  <MachineName>Haas VF-2</MachineName>
  <PostDate>2024-01-15</PostDate>
  <ProgramNumber>1001</ProgramNumber>
</FileInfo>
```

### 1.3 Operations Section

```xml
<Operations>
  <Operation seq="1" active="true">
    <Name>FACE MILL</Name>
    <Type>Mill</Type>
    <Comment>Face the top surface</Comment>
    <Tool>
      <Number>1</Number>
      <Description>2" Face Mill</Description>
      <Diameter>2.0</Diameter>
      <Length>3.0</Length>
      <Flutes>4</Flutes>
    </Tool>
    <Parameters>
      <SpindleSpeed>3000</SpindleSpeed>
      <FeedRate>20.0</FeedRate>
      <PlungeRate>10.0</PlungeRate>
      <DepthOfCut>0.050</DepthOfCut>
      <StepOver>1.5</StepOver>
      <Coolant>Flood</Coolant>
    </Parameters>
    <Geometry>
      <CycleTime>45.2</CycleTime>
      <Volume>1.25</Volume>
    </Geometry>
  </Operation>
</Operations>
```

---

## Part 2: Domain Objects for CAM Data

### 2.1 CAM File Info

```python
# src/partflow/domain/cam/file_info.py
"""CAM file information."""

from dataclasses import dataclass
from datetime import date
from typing import Optional


@dataclass
class CAMFileInfo:
    """Information about a CAM file.
    
    Extracted from XML FileInfo section.
    """
    file_name: str
    post_processor: str
    machine_name: Optional[str] = None
    program_number: Optional[int] = None
    post_date: Optional[date] = None
    file_path: Optional[str] = None
```

### 2.2 Tool

```python
# src/partflow/domain/cam/tool.py
"""Tool definition from CAM file."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CAMTool:
    """A cutting tool from CAM data.
    
    Contains tool geometry and identification.
    """
    number: int
    description: str
    diameter: float
    length: Optional[float] = None
    flutes: Optional[int] = None
    tool_type: Optional[str] = None
    
    @property
    def display_name(self) -> str:
        """Human-readable tool name."""
        return f"T{self.number} - {self.description}"
```

### 2.3 Operation

```python
# src/partflow/domain/cam/operation.py
"""Operation from CAM file."""

from dataclasses import dataclass
from typing import Optional
from .tool import CAMTool


@dataclass
class CAMOperationParameters:
    """Cutting parameters for an operation."""
    spindle_speed: int = 0
    feed_rate: float = 0.0
    plunge_rate: Optional[float] = None
    depth_of_cut: Optional[float] = None
    step_over: Optional[float] = None
    coolant: Optional[str] = None


@dataclass
class CAMOperation:
    """A machining operation from CAM data.
    
    Represents one toolpath operation.
    """
    sequence: int
    name: str
    operation_type: str
    tool: CAMTool
    parameters: CAMOperationParameters
    comment: Optional[str] = None
    is_active: bool = True
    cycle_time: Optional[float] = None
    
    @property
    def display_name(self) -> str:
        """Human-readable operation name."""
        status = "" if self.is_active else " [INACTIVE]"
        return f"{self.sequence}. {self.name}{status}"
```

### 2.4 CAM Document

```python
# src/partflow/domain/cam/document.py
"""Complete CAM document."""

from dataclasses import dataclass, field
from typing import List
from .file_info import CAMFileInfo
from .operation import CAMOperation


@dataclass
class CAMDocument:
    """A complete CAM document parsed from XML.
    
    Contains all data from a Mastercam file.
    """
    file_info: CAMFileInfo
    operations: List[CAMOperation] = field(default_factory=list)
    
    @property
    def total_cycle_time(self) -> float:
        """Total cycle time of all operations."""
        return sum(
            op.cycle_time or 0 
            for op in self.operations 
            if op.is_active
        )
    
    @property
    def tool_count(self) -> int:
        """Number of unique tools used."""
        tool_numbers = {op.tool.number for op in self.operations}
        return len(tool_numbers)
    
    @property
    def active_operations(self) -> List[CAMOperation]:
        """Get only active operations."""
        return [op for op in self.operations if op.is_active]
```

---

## Part 3: Package Organization

```
src/partflow/domain/cam/
├── __init__.py
├── file_info.py
├── tool.py
├── operation.py
└── document.py
```

Create `src/partflow/domain/cam/__init__.py`:

```python
"""CAM data domain objects."""

from .file_info import CAMFileInfo
from .tool import CAMTool
from .operation import CAMOperation, CAMOperationParameters
from .document import CAMDocument

__all__ = [
    'CAMFileInfo',
    'CAMTool',
    'CAMOperation',
    'CAMOperationParameters',
    'CAMDocument',
]
```

---

## Part 4: Tests

```python
"""Tests for CAM domain objects."""

import pytest
from partflow.domain.cam import (
    CAMFileInfo, CAMTool, CAMOperation, 
    CAMOperationParameters, CAMDocument,
)


class TestCAMDocument:
    
    def test_total_cycle_time(self):
        doc = CAMDocument(
            file_info=CAMFileInfo(
                file_name="TEST",
                post_processor="HAAS",
            ),
            operations=[
                CAMOperation(
                    sequence=1, name="Op1", operation_type="Mill",
                    tool=CAMTool(1, "Tool", 1.0),
                    parameters=CAMOperationParameters(),
                    cycle_time=30.0,
                ),
                CAMOperation(
                    sequence=2, name="Op2", operation_type="Mill",
                    tool=CAMTool(2, "Tool", 0.5),
                    parameters=CAMOperationParameters(),
                    cycle_time=45.0,
                ),
            ]
        )
        
        assert doc.total_cycle_time == 75.0
    
    def test_inactive_excluded_from_cycle_time(self):
        doc = CAMDocument(
            file_info=CAMFileInfo("TEST", "HAAS"),
            operations=[
                CAMOperation(
                    sequence=1, name="Op1", operation_type="Mill",
                    tool=CAMTool(1, "Tool", 1.0),
                    parameters=CAMOperationParameters(),
                    cycle_time=30.0,
                    is_active=True,
                ),
                CAMOperation(
                    sequence=2, name="Op2", operation_type="Mill",
                    tool=CAMTool(2, "Tool", 0.5),
                    parameters=CAMOperationParameters(),
                    cycle_time=45.0,
                    is_active=False,  # Inactive
                ),
            ]
        )
        
        assert doc.total_cycle_time == 30.0
```

---

## Summary

### CAM Data Model

| Object | Purpose |
|--------|---------|
| `CAMFileInfo` | File metadata |
| `CAMTool` | Tool definition |
| `CAMOperationParameters` | Cutting parameters |
| `CAMOperation` | Single toolpath |
| `CAMDocument` | Complete file |

---

## Next Tutorial

[Tutorial 3: Import Parser →](./03-import-entities.md)
