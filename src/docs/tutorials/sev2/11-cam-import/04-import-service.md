# Tutorial 4: Import Service

## Introduction

The Import Service orchestrates the full import process—parsing, validation, preview, and persistence.

---

## Part 1: Import Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload     │────▶│    Parse     │────▶│   Validate   │
│   XML File   │     │   to DOM     │     │   Contents   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│   Persist    │◀────│   Confirm    │◀────│   Preview    │
│   to DB      │     │   Import     │     │   Changes    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Part 2: Import Service

Create `src/partflow/service/import_service.py`:

```python
"""Import service for CAM files."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional
from uuid import UUID, uuid4

from partflow.domain.cam import CAMDocument, CAMOperation
from partflow.domain.entities.part import Part, PartStatus
from partflow.import_.cam_parser import CAMParser, ParseResult, ParseError


@dataclass
class ImportPreview:
    """Preview of what will be imported."""
    file_name: str
    machine_name: Optional[str]
    operation_count: int
    tool_count: int
    total_cycle_time: float
    operations: List[dict]
    warnings: List[str]
    
    @property
    def summary(self) -> str:
        return (
            f"{self.file_name}: "
            f"{self.operation_count} operations, "
            f"{self.tool_count} tools, "
            f"~{self.total_cycle_time:.1f}s cycle time"
        )


@dataclass
class ImportResult:
    """Result of import operation."""
    success: bool
    part_id: Optional[UUID] = None
    part_number: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


class ImportService:
    """Service for importing CAM files."""
    
    def __init__(self, part_service, revision_service):
        self._part_service = part_service
        self._revision_service = revision_service
        self._parser = CAMParser()
    
    def parse_and_preview(self, xml_content: str) -> tuple[Optional[ImportPreview], List[str]]:
        """Parse XML and return preview without importing.
        
        Returns:
            Tuple of (preview, errors). Preview is None if parsing failed.
        """
        result = self._parser.parse_string(xml_content)
        
        if not result.success:
            return None, [str(e) for e in result.errors]
        
        doc = result.document
        preview = ImportPreview(
            file_name=doc.file_info.file_name,
            machine_name=doc.file_info.machine_name,
            operation_count=len(doc.operations),
            tool_count=doc.tool_count,
            total_cycle_time=doc.total_cycle_time,
            operations=[
                {
                    "sequence": op.sequence,
                    "name": op.name,
                    "type": op.operation_type,
                    "tool": op.tool.display_name,
                    "spindle": op.parameters.spindle_speed,
                    "feed": op.parameters.feed_rate,
                    "active": op.is_active,
                }
                for op in doc.operations
            ],
            warnings=[str(w) for w in result.warnings],
        )
        
        return preview, []
    
    def validate_for_import(self, xml_content: str) -> List[str]:
        """Validate XML for import. Returns list of validation errors."""
        errors = []
        
        result = self._parser.parse_string(xml_content)
        if not result.success:
            return [str(e) for e in result.errors]
        
        doc = result.document
        
        # Business validations
        if not doc.operations:
            errors.append("File has no operations to import")
        
        # Check for duplicate tool numbers (warning)
        # Check for zero spindle speeds
        for op in doc.operations:
            if op.is_active and op.parameters.spindle_speed == 0:
                errors.append(
                    f"Operation '{op.name}' has zero spindle speed"
                )
        
        return errors
    
    def import_as_new_part(
        self,
        xml_content: str,
        part_number: str,
        imported_by: str,
    ) -> ImportResult:
        """Import CAM file as a new Part.
        
        Creates a new Part with operations stored as metadata.
        """
        # Validate first
        validation_errors = self.validate_for_import(xml_content)
        if validation_errors:
            return ImportResult(
                success=False,
                errors=validation_errors,
            )
        
        # Parse
        result = self._parser.parse_string(xml_content)
        doc = result.document
        
        try:
            # Create Part
            part = self._part_service.create_part(
                part_number=part_number,
                name=doc.file_info.file_name,
                description=self._build_description(doc),
            )
            
            # Create initial revision with CAM data
            # (In full implementation, CAM data would be stored in separate tables)
            self._revision_service.create_revision(
                part_id=part.id,
                changed_by=imported_by,
                change_reason=f"Imported from CAM file: {doc.file_info.file_name}",
            )
            
            return ImportResult(
                success=True,
                part_id=part.id,
                part_number=part_number,
                warnings=[str(w) for w in result.warnings],
            )
            
        except Exception as e:
            return ImportResult(
                success=False,
                errors=[str(e)],
            )
    
    def _build_description(self, doc: CAMDocument) -> str:
        """Build Part description from CAM document."""
        lines = [
            f"Imported from: {doc.file_info.file_name}",
            f"Post Processor: {doc.file_info.post_processor}",
            f"Operations: {len(doc.operations)}",
            f"Estimated Cycle Time: {doc.total_cycle_time:.1f}s",
        ]
        if doc.file_info.machine_name:
            lines.insert(1, f"Machine: {doc.file_info.machine_name}")
        return "\n".join(lines)
```

---

## Part 3: Tests

```python
"""Tests for ImportService."""

import pytest
from unittest.mock import Mock
from partflow.service.import_service import ImportService


VALID_CAM_XML = """<?xml version="1.0"?>
<MastercamDocument>
  <FileInfo>
    <FileName>WIDGET-001</FileName>
    <PostProcessor>HAAS_VF</PostProcessor>
    <MachineName>Haas VF-2</MachineName>
  </FileInfo>
  <Operations>
    <Operation seq="1">
      <Name>FACE MILL</Name>
      <Type>Mill</Type>
      <Tool><Number>1</Number><Description>Face Mill</Description><Diameter>2.0</Diameter></Tool>
      <Parameters><SpindleSpeed>3000</SpindleSpeed><FeedRate>20.0</FeedRate></Parameters>
    </Operation>
  </Operations>
</MastercamDocument>
"""


class TestPreview:
    
    @pytest.fixture
    def service(self):
        return ImportService(Mock(), Mock())
    
    def test_preview_returns_summary(self, service):
        preview, errors = service.parse_and_preview(VALID_CAM_XML)
        
        assert errors == []
        assert preview is not None
        assert preview.file_name == "WIDGET-001"
        assert preview.operation_count == 1
    
    def test_preview_includes_operations(self, service):
        preview, _ = service.parse_and_preview(VALID_CAM_XML)
        
        assert len(preview.operations) == 1
        assert preview.operations[0]["name"] == "FACE MILL"


class TestValidation:
    
    @pytest.fixture
    def service(self):
        return ImportService(Mock(), Mock())
    
    def test_zero_spindle_speed_error(self, service):
        xml = """
        <MastercamDocument>
          <FileInfo><FileName>T</FileName><PostProcessor>P</PostProcessor></FileInfo>
          <Operations>
            <Operation seq="1" active="true">
              <Name>Bad Op</Name><Type>Mill</Type>
              <Tool><Number>1</Number><Description>T</Description><Diameter>1</Diameter></Tool>
              <Parameters><SpindleSpeed>0</SpindleSpeed><FeedRate>10</FeedRate></Parameters>
            </Operation>
          </Operations>
        </MastercamDocument>
        """
        
        errors = service.validate_for_import(xml)
        
        assert any("spindle speed" in e.lower() for e in errors)
```

---

## Summary

### Import Process

| Step | Method |
|------|--------|
| Preview | `parse_and_preview()` |
| Validate | `validate_for_import()` |
| Import | `import_as_new_part()` |

---

## Next Tutorial

[Tutorial 5: Import UI →](./05-import-ui.md)
