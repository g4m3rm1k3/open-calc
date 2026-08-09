# Tutorial 3: Snapshot Strategy

## Introduction

This tutorial covers the **snapshot strategy**—how to capture, store, and compare Part states across revisions.

---

## Part 1: Snapshot Design

### 1.1 What Goes in a Snapshot?

| Data | Include? | Why |
|------|----------|-----|
| Part fields | ✅ Yes | Core data to version |
| Related machines | ✅ Yes | Relationships matter |
| Timestamps | ✅ Yes | Audit trail |
| Internal IDs | ⚠️ Partial | part_number yes, UUID no |
| Computed values | ❌ No | Can be recalculated |

### 1.2 Snapshot Schema

```python
PartSnapshot = {
    "part_number": str,      # Immutable identifier
    "name": str,             # Versioned
    "description": str,      # Versioned
    "status": str,           # Versioned
    "machines": [            # Related data
        {
            "machine_id": str,
            "setup_time": int,
            "is_primary": bool,
        }
    ],
    "captured_at": str,      # ISO timestamp
}
```

---

## Part 2: Implementation

### 2.1 Snapshot Service

Create `src/partflow/service/snapshot_service.py`:

```python
"""Snapshot service for capturing and restoring Part state."""

from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from partflow.domain.entities.part import Part
from partflow.domain.entities.part_machine import PartMachine
from partflow.domain.interfaces.part_repository import PartRepositoryInterface
from partflow.domain.interfaces.part_machine_repository import PartMachineRepositoryInterface
from partflow.domain.interfaces.machine_repository import MachineRepositoryInterface


class SnapshotService:
    """Service for creating and restoring snapshots."""
    
    def __init__(
        self,
        part_repo: PartRepositoryInterface,
        machine_repo: MachineRepositoryInterface,
        part_machine_repo: PartMachineRepositoryInterface,
    ):
        self._part_repo = part_repo
        self._machine_repo = machine_repo
        self._part_machine_repo = part_machine_repo
    
    def capture_part_snapshot(self, part_id: UUID) -> Dict[str, Any]:
        """Capture complete snapshot of a Part.
        
        Args:
            part_id: UUID of Part to snapshot
        
        Returns:
            Complete snapshot as dictionary
        """
        part = self._part_repo.find_by_id(part_id)
        if part is None:
            raise ValueError(f"Part not found: {part_id}")
        
        # Get machine associations
        associations = self._part_machine_repo.find_by_part(part_id)
        
        machines_data = []
        for assoc in associations:
            machine = self._machine_repo.find_by_id(assoc.machine_id)
            if machine:
                machines_data.append({
                    "machine_id": machine.machine_id,
                    "machine_name": machine.name,
                    "setup_time_minutes": assoc.setup_time_minutes,
                    "is_primary": assoc.is_primary,
                })
        
        return {
            "part_number": str(part.part_number),
            "name": part.name,
            "description": part.description,
            "status": part.status.value,
            "machines": machines_data,
            "captured_at": datetime.utcnow().isoformat(),
            "schema_version": "1.0",  # For future compatibility
        }
    
    def create_diff(
        self,
        old_snapshot: Dict[str, Any],
        new_snapshot: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create diff between two snapshots.
        
        Returns:
            Dictionary of changes
        """
        changes = {}
        
        # Compare simple fields
        for field in ["name", "description", "status"]:
            old_val = old_snapshot.get(field)
            new_val = new_snapshot.get(field)
            if old_val != new_val:
                changes[field] = {
                    "old": old_val,
                    "new": new_val,
                }
        
        # Compare machines
        old_machines = {m["machine_id"]: m for m in old_snapshot.get("machines", [])}
        new_machines = {m["machine_id"]: m for m in new_snapshot.get("machines", [])}
        
        machine_changes = {
            "added": [],
            "removed": [],
            "modified": [],
        }
        
        # Added machines
        for mid in new_machines:
            if mid not in old_machines:
                machine_changes["added"].append(new_machines[mid])
        
        # Removed machines
        for mid in old_machines:
            if mid not in new_machines:
                machine_changes["removed"].append(old_machines[mid])
        
        # Modified machines
        for mid in new_machines:
            if mid in old_machines:
                if new_machines[mid] != old_machines[mid]:
                    machine_changes["modified"].append({
                        "machine_id": mid,
                        "old": old_machines[mid],
                        "new": new_machines[mid],
                    })
        
        if any(machine_changes.values()):
            changes["machines"] = machine_changes
        
        return changes
```

---

## Part 3: Diff Visualization

### 3.1 Format Diff for Display

```python
def format_diff_for_display(diff: Dict[str, Any]) -> List[str]:
    """Format a diff for human-readable display."""
    lines = []
    
    for field, change in diff.items():
        if field == "machines":
            # Handle machine changes specially
            if change["added"]:
                for m in change["added"]:
                    lines.append(f"+ Added machine: {m['machine_id']}")
            if change["removed"]:
                for m in change["removed"]:
                    lines.append(f"- Removed machine: {m['machine_id']}")
            if change["modified"]:
                for m in change["modified"]:
                    lines.append(f"~ Modified machine: {m['machine_id']}")
        else:
            lines.append(f"~ {field}: '{change['old']}' → '{change['new']}'")
    
    return lines
```

### 3.2 Example Diff Output

```
~ name: 'Widget v1' → 'Widget v2'
~ status: 'draft' → 'active'
+ Added machine: MCH-003
- Removed machine: MCH-001
```

---

## Part 4: Schema Versioning

### 4.1 Why Version the Schema?

The snapshot format may change over time. Old snapshots need to remain readable.

```python
CURRENT_SCHEMA_VERSION = "1.0"

def migrate_snapshot(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """Migrate old snapshot formats to current."""
    version = snapshot.get("schema_version", "0.0")
    
    if version == CURRENT_SCHEMA_VERSION:
        return snapshot
    
    # Migrate from older versions
    if version == "0.0":
        # Add missing fields
        if "machines" not in snapshot:
            snapshot["machines"] = []
        snapshot["schema_version"] = "1.0"
    
    return snapshot
```

---

## Part 5: Tests

```python
"""Tests for snapshot service."""

import pytest
from uuid import uuid4
from unittest.mock import Mock


class TestSnapshotCapture:
    """Tests for capturing snapshots."""
    
    def test_capture_includes_part_data(self):
        from partflow.service.snapshot_service import SnapshotService
        
        # Setup mocks
        mock_part = Mock()
        mock_part.part_number = "PN-12345"
        mock_part.name = "Test Part"
        mock_part.description = "A test"
        mock_part.status.value = "draft"
        
        mock_part_repo = Mock()
        mock_part_repo.find_by_id.return_value = mock_part
        
        mock_machine_repo = Mock()
        mock_pm_repo = Mock()
        mock_pm_repo.find_by_part.return_value = []
        
        service = SnapshotService(mock_part_repo, mock_machine_repo, mock_pm_repo)
        snapshot = service.capture_part_snapshot(uuid4())
        
        assert snapshot["part_number"] == "PN-12345"
        assert snapshot["name"] == "Test Part"
        assert snapshot["status"] == "draft"
        assert "captured_at" in snapshot


class TestSnapshotDiff:
    """Tests for comparing snapshots."""
    
    def test_diff_detects_name_change(self):
        from partflow.service.snapshot_service import SnapshotService
        
        service = SnapshotService(Mock(), Mock(), Mock())
        
        old = {"name": "Old Name", "status": "draft", "machines": []}
        new = {"name": "New Name", "status": "draft", "machines": []}
        
        diff = service.create_diff(old, new)
        
        assert "name" in diff
        assert diff["name"]["old"] == "Old Name"
        assert diff["name"]["new"] == "New Name"
    
    def test_diff_detects_added_machine(self):
        from partflow.service.snapshot_service import SnapshotService
        
        service = SnapshotService(Mock(), Mock(), Mock())
        
        old = {"name": "Part", "machines": []}
        new = {"name": "Part", "machines": [
            {"machine_id": "MCH-001", "setup_time_minutes": 30}
        ]}
        
        diff = service.create_diff(old, new)
        
        assert "machines" in diff
        assert len(diff["machines"]["added"]) == 1
```

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Full snapshot** | Complete state capture |
| **Schema version** | Future migration support |
| **Diff creation** | Compare versions |
| **Display formatting** | Human-readable changes |

---

## Next Tutorial

[Tutorial 4: Revision Service →](./04-revision-service.md)
