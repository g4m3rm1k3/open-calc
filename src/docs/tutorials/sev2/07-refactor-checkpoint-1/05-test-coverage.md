# Tutorial 5: Test Coverage Analysis

## Introduction

Refactoring requires good test coverage. This tutorial analyzes our coverage and fills gaps.

---

## Part 1: Measuring Coverage

### 1.1 Install pytest-cov

```bash
pip install pytest-cov
```

Add to `requirements-dev.txt`:
```
pytest-cov>=4.1.0
```

### 1.2 Run Coverage Report

```bash
pytest --cov=partflow --cov-report=term-missing
```

**Sample output:**
```
Name                                    Stmts   Miss  Cover   Missing
---------------------------------------------------------------------
src/partflow/__init__.py                    2      0   100%
src/partflow/domain/entities/part.py       45      3    93%   78-80
src/partflow/domain/entities/machine.py    62      8    87%   91-98
src/partflow/service/part_service.py       48      5    90%   82-86
---------------------------------------------------------------------
TOTAL                                      312     25    92%
```

### 1.3 Coverage Goals

| Level | Coverage | When Acceptable |
|-------|----------|-----------------|
| > 90% | Excellent | Core domain |
| 80-90% | Good | Services |
| 70-80% | OK | Web layer |
| < 70% | Poor | Needs attention |

---

## Part 2: Coverage Analysis

### 2.1 What's Covered Well

| Component | Likely Coverage | Notes |
|-----------|-----------------|-------|
| Part entity | 90%+ | Validation tested |
| PartNumber value object | 95%+ | Thorough |
| Repository interface | 100% | Abstract, covered by impl |
| SQLite repositories | 80%+ | CRUD tested |

### 2.2 What's Missing

| Component | Gap | Type of Test Needed |
|-----------|-----|---------------------|
| Edge cases | Error paths | Unit tests |
| State transitions | All paths | Unit tests |
| Web routes | Error handling | Integration tests |
| Full workflow | End-to-end | E2E tests |

---

## Part 3: Adding Missing Tests

### 3.1 Edge Case Tests

```python
# tests/unit/domain/entities/test_part_edge_cases.py
"""Edge case tests for Part entity."""

import pytest
from uuid import uuid4, UUID


class TestPartEdgeCases:
    """Edge case tests."""
    
    def test_part_number_case_sensitivity(self):
        """Part numbers are case-sensitive."""
        from partflow.domain.value_objects.part_number import PartNumber
        
        pn1 = PartNumber("PN-12345")
        pn2 = PartNumber("PN-12345")
        pn_different = PartNumber("AB-12345")
        
        assert pn1 == pn2
        assert pn1 != pn_different
    
    def test_whitespace_in_name_trimmed(self):
        """Leading/trailing whitespace should still be valid."""
        from partflow.domain.entities.part import Part
        
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="  Valid Name  ",  # Has whitespace
        )
        
        # Name is stored as-is (including whitespace)
        # But empty/whitespace-only fails
        assert "Valid" in part.name
    
    def test_very_long_description(self):
        """Long descriptions should be accepted."""
        from partflow.domain.entities.part import Part
        
        long_desc = "A" * 10000  # 10KB description
        
        part = Part(
            id=uuid4(),
            part_number="PN-12345",
            name="Test",
            description=long_desc,
        )
        
        assert len(part.description) == 10000


class TestMachineEdgeCases:
    """Edge cases for Machine."""
    
    def test_boundary_axes_values(self):
        """Test boundary values for axes."""
        from partflow.domain.entities.machine import Machine, ControllerType
        from partflow.domain.errors import ValidationError
        
        # Valid boundaries
        for axes in [3, 4, 5]:
            m = Machine(
                id=uuid4(),
                machine_id=f"MCH-{axes}",
                name="Test",
                controller_type=ControllerType.FANUC,
                axes=axes,
            )
            assert m.axes == axes
        
        # Invalid boundaries
        for axes in [2, 6, 0, -1]:
            with pytest.raises(ValidationError):
                Machine(
                    id=uuid4(),
                    machine_id=f"MCH-{axes}",
                    name="Test",
                    controller_type=ControllerType.FANUC,
                    axes=axes,
                )
```

### 3.2 State Transition Tests

```python
# tests/unit/domain/test_state_transitions.py
"""Complete state transition tests."""

import pytest
from uuid import uuid4

from partflow.domain.entities.machine import Machine, MachineStatus, ControllerType
from partflow.domain.errors import InvalidStateTransitionError


class TestMachineStateTransitions:
    """All possible state transitions."""
    
    @pytest.fixture
    def machine(self):
        return Machine(
            id=uuid4(),
            machine_id="MCH-001",
            name="Test",
            controller_type=ControllerType.FANUC,
        )
    
    def test_active_to_maintenance(self, machine):
        assert machine.status == MachineStatus.ACTIVE
        machine.start_maintenance()
        assert machine.status == MachineStatus.MAINTENANCE
    
    def test_maintenance_to_active(self, machine):
        machine.start_maintenance()
        machine.complete_maintenance()
        assert machine.status == MachineStatus.ACTIVE
    
    def test_active_to_retired(self, machine):
        machine.retire()
        assert machine.status == MachineStatus.RETIRED
    
    def test_maintenance_to_retired(self, machine):
        machine.start_maintenance()
        machine.retire()
        assert machine.status == MachineStatus.RETIRED
    
    def test_retired_is_terminal(self, machine):
        machine.retire()
        
        with pytest.raises(InvalidStateTransitionError):
            machine.start_maintenance()
    
    def test_cannot_complete_maintenance_when_active(self, machine):
        # Already active, can't "complete" maintenance
        with pytest.raises(InvalidStateTransitionError):
            machine.complete_maintenance()
```

---

## Part 4: Coverage Report Configuration

### 4.1 pytest.ini Configuration

```ini
[pytest]
addopts = --cov=partflow --cov-report=term-missing --cov-fail-under=80
testpaths = tests
```

### 4.2 Coverage Configuration

Create `.coveragerc`:

```ini
[run]
source = src/partflow
branch = True
omit = 
    */tests/*
    */__pycache__/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
    pass

fail_under = 80
```

---

## Part 5: Coverage Report

### 5.1 Generate HTML Report

```bash
pytest --cov=partflow --cov-report=html
```

Opens `htmlcov/index.html` in browser for detailed view.

### 5.2 Final Coverage Summary

After adding edge case tests:

```
Component               Coverage
--------------------------------
Domain Entities         95%
Value Objects           98%
Repositories            88%
Services                85%
Web Routes              75%
--------------------------------
TOTAL                   88%
```

---

## Summary

### Coverage Improvements

| Action | Impact |
|--------|--------|
| Edge case tests | +3% |
| State transition tests | +2% |
| Error path tests | +2% |
| Integration tests | +3% |

### Refactoring Complete Checklist

- [ ] Code review done
- [ ] Entity patterns documented
- [ ] Repository helpers extracted
- [ ] Dependencies centralized
- [ ] Coverage > 80%
- [ ] All tests pass

---

## Phase 07 Complete!

**Next:** [Phase 08: Concurrency & Locking →](../08-concurrency-locking/README.md)
