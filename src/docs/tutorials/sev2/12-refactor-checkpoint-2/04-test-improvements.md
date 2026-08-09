# Tutorial 4: Test Improvements

## Introduction

Improve test organization, add integration tests, and increase coverage.

---

## Part 1: Test Structure Review

### Current Structure

```
tests/
├── conftest.py           # Shared fixtures
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   └── value_objects/
│   └── service/
├── integration/
│   └── repository/
└── e2e/                  # New: End-to-end tests
```

---

## Part 2: Integration Test Improvements

### 2.1 Full Workflow Test

```python
# tests/integration/test_workflow_integration.py
"""Integration tests for complete workflows."""

import pytest
from uuid import uuid4

from partflow.dependencies import Dependencies
from partflow.config import Config


class TestPartWorkflowIntegration:
    """Test complete Part workflow."""
    
    @pytest.fixture
    def deps(self):
        config = Config()
        config.DATABASE_PATH = ":memory:"
        return Dependencies(config)
    
    def test_full_part_lifecycle(self, deps):
        """Test: create → edit → submit → approve → activate."""
        # Create
        part = deps.part_service.create_part(
            part_number="PN-12345",
            name="Integration Test Part",
        )
        assert part.status.value == "draft"
        
        # Submit for review
        deps.workflow_service.submit_for_review(
            part.id, "engineer", "Ready for review"
        )
        part = deps.part_service.get_part(part.id)
        assert part.status.value == "review"
        
        # Approve
        deps.workflow_service.approve(
            part.id, "approver", "Looks good"
        )
        part = deps.part_service.get_part(part.id)
        assert part.status.value == "approved"
        
        # Activate
        deps.workflow_service.activate(part.id, "admin")
        part = deps.part_service.get_part(part.id)
        assert part.status.value == "active"
    
    def test_rejection_returns_to_draft(self, deps):
        """Test rejection workflow."""
        part = deps.part_service.create_part(
            part_number="PN-REJECT",
            name="Will Be Rejected",
        )
        
        deps.workflow_service.submit_for_review(part.id, "eng", "Review please")
        deps.workflow_service.reject(part.id, "reviewer", "Needs more info")
        
        part = deps.part_service.get_part(part.id)
        assert part.status.value == "draft"
        
        # Check audit trail
        history = deps.workflow_service.get_transition_history(part.id)
        assert len(history) == 2
```

---

## Part 3: E2E Tests with Test Client

```python
# tests/e2e/test_web_flows.py
"""End-to-end tests for web application."""

import pytest
from partflow.web.app import create_app
from partflow.config import Config


class TestPartWebFlow:
    """Test Part web flows."""
    
    @pytest.fixture
    def client(self):
        config = Config()
        config.DATABASE_PATH = ":memory:"
        config.TESTING = True
        app = create_app(config)
        return app.test_client()
    
    def test_create_part_flow(self, client):
        """Test creating a Part via web."""
        # Go to new Part form
        response = client.get('/parts/new')
        assert response.status_code == 200
        
        # Submit form
        response = client.post('/parts/', data={
            'part_number': 'PN-WEB01',
            'name': 'Web Test Part',
            'description': 'Created via web',
        }, follow_redirects=True)
        
        assert response.status_code == 200
        assert b'PN-WEB01' in response.data
    
    def test_list_parts(self, client):
        """Test Parts list page."""
        response = client.get('/parts/')
        assert response.status_code == 200
        assert b'Parts' in response.data
```

---

## Part 4: Fixture Improvements

Update `tests/conftest.py`:

```python
"""Shared test fixtures."""

import pytest
from uuid import uuid4
from datetime import datetime

from partflow.config import Config
from partflow.dependencies import Dependencies
from partflow.domain.entities.part import Part, PartStatus
from partflow.domain.entities.machine import Machine, ControllerType


@pytest.fixture
def test_config():
    """Test configuration with in-memory database."""
    config = Config()
    config.DATABASE_PATH = ":memory:"
    config.TESTING = True
    return config


@pytest.fixture
def test_deps(test_config):
    """Test dependencies container."""
    Dependencies.reset()
    deps = Dependencies(test_config)
    yield deps
    Dependencies.reset()


@pytest.fixture
def sample_parts():
    """Generate a list of sample Parts."""
    return [
        Part(
            id=uuid4(),
            part_number=f"PN-{i:05d}",
            name=f"Part {i}",
            status=PartStatus.DRAFT,
        )
        for i in range(10)
    ]


@pytest.fixture
def approved_part(test_deps):
    """Create an approved Part."""
    part = test_deps.part_service.create_part(
        part_number="PN-APPROVED",
        name="Approved Part",
    )
    test_deps.workflow_service.submit_for_review(part.id, "eng", "Ready")
    test_deps.workflow_service.approve(part.id, "mgr", "Approved")
    return test_deps.part_service.get_part(part.id)
```

---

## Summary

### Phase 12 Complete!

Improvements made:
- ✅ Performance analysis
- ✅ Query optimization
- ✅ Common utilities extracted
- ✅ Test coverage improved

**Next:** [Phase 13: Access Control →](../13-access-control/README.md)
