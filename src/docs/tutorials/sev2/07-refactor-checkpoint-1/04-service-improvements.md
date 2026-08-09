# Tutorial 4: Service Improvements

## Introduction

The service layer has some patterns worth improving, particularly around dependency management.

---

## Part 1: Current Problem

### 1.1 Service Factory in Routes

Currently, each route file has:

```python
def get_part_service():
    from partflow.repository.sqlite.database import Database
    from partflow.repository.sqlite.part_repository import SQLitePartRepository
    from partflow.service.part_service import PartService
    from partflow.config import get_config
    
    config = get_config()
    db = Database(config.DATABASE_PATH)
    repo = SQLitePartRepository(db)
    return PartService(repo)
```

**Problems:**
1. Duplicated in every route file
2. Creates new Database instance every call
3. No sharing of connections

### 1.2 Factory Duplication

| Route | Factory Function |
|-------|------------------|
| parts.py | get_part_service() |
| machines.py | get_machine_service() |

Both do essentially the same thing.

---

## Part 2: Solution: Application Dependencies

### 2.1 Create Dependencies Module

Create `src/partflow/dependencies.py`:

```python
"""Application dependency management.

This module provides a simple dependency container for
managing service instances across the application.
"""

from typing import Optional

from partflow.config import Config, get_config
from partflow.repository.sqlite.database import Database
from partflow.repository.sqlite.part_repository import SQLitePartRepository
from partflow.repository.sqlite.machine_repository import SQLiteMachineRepository
from partflow.repository.sqlite.part_machine_repository import SQLitePartMachineRepository
from partflow.service.part_service import PartService
from partflow.service.machine_service import MachineService


class Dependencies:
    """Container for application dependencies.
    
    Provides lazy initialization of services and repositories.
    Call reset() between tests to get fresh instances.
    """
    
    _instance: Optional['Dependencies'] = None
    
    def __init__(self, config: Optional[Config] = None):
        self._config = config or get_config()
        self._db: Optional[Database] = None
        self._part_repo: Optional[SQLitePartRepository] = None
        self._machine_repo: Optional[SQLiteMachineRepository] = None
        self._part_machine_repo: Optional[SQLitePartMachineRepository] = None
        self._part_service: Optional[PartService] = None
        self._machine_service: Optional[MachineService] = None
    
    @classmethod
    def get(cls) -> 'Dependencies':
        """Get or create the singleton instance."""
        if cls._instance is None:
            cls._instance = Dependencies()
        return cls._instance
    
    @classmethod
    def reset(cls) -> None:
        """Reset singleton (for testing)."""
        cls._instance = None
    
    @property
    def db(self) -> Database:
        """Get Database instance (lazily created)."""
        if self._db is None:
            self._db = Database(self._config.DATABASE_PATH)
        return self._db
    
    @property
    def part_repo(self) -> SQLitePartRepository:
        """Get Part repository."""
        if self._part_repo is None:
            self._part_repo = SQLitePartRepository(self.db)
        return self._part_repo
    
    @property
    def machine_repo(self) -> SQLiteMachineRepository:
        """Get Machine repository."""
        if self._machine_repo is None:
            self._machine_repo = SQLiteMachineRepository(self.db)
        return self._machine_repo
    
    @property
    def part_machine_repo(self) -> SQLitePartMachineRepository:
        """Get Part-Machine repository."""
        if self._part_machine_repo is None:
            self._part_machine_repo = SQLitePartMachineRepository(self.db)
        return self._part_machine_repo
    
    @property
    def part_service(self) -> PartService:
        """Get Part service."""
        if self._part_service is None:
            self._part_service = PartService(self.part_repo)
        return self._part_service
    
    @property
    def machine_service(self) -> MachineService:
        """Get Machine service."""
        if self._machine_service is None:
            self._machine_service = MachineService(
                self.machine_repo,
                self.part_machine_repo,
            )
        return self._machine_service


def get_deps() -> Dependencies:
    """Get the dependencies container."""
    return Dependencies.get()
```

### 2.2 Update Routes

```python
# src/partflow/web/routes/parts.py

from partflow.dependencies import get_deps


@parts_bp.route('/')
def list_parts():
    service = get_deps().part_service
    parts = service.get_all_parts()
    return render_template('parts/list.html', parts=parts)


# Remove the get_part_service() function entirely
```

```python
# src/partflow/web/routes/machines.py

from partflow.dependencies import get_deps


@machines_bp.route('/')
def list_machines():
    service = get_deps().machine_service
    machines = service.get_all_machines()
    return render_template('machines/list.html', machines=machines)
```

---

## Part 3: Testing with Dependencies

### 3.1 Test Fixture for Fresh Dependencies

```python
# tests/conftest.py

import pytest
from partflow.dependencies import Dependencies


@pytest.fixture(autouse=True)
def reset_dependencies():
    """Reset dependencies before each test."""
    Dependencies.reset()
    yield
    Dependencies.reset()


@pytest.fixture
def test_deps():
    """Provide test dependencies with in-memory database."""
    from partflow.config import Config
    
    test_config = Config()
    test_config.DATABASE_PATH = ":memory:"
    
    deps = Dependencies(test_config)
    return deps
```

### 3.2 Integration Test Example

```python
def test_create_and_list_parts(test_deps):
    """Full integration test using dependencies."""
    service = test_deps.part_service
    
    # Create
    part = service.create_part(
        part_number="PN-12345",
        name="Test Part",
    )
    
    # List
    all_parts = service.get_all_parts()
    
    assert len(all_parts) == 1
    assert all_parts[0].name == "Test Part"
```

---

## Part 4: Benefits

### 4.1 Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Factory functions | 2+ copies | 0 |
| Database instances | New per call | Shared |
| Test setup | Manual | Automatic |
| Adding new service | Copy factory | Add property |

### 4.2 Dependency Graph

```
Dependencies
├── Config
├── Database (shared)
├── PartRepository
├── MachineRepository
├── PartMachineRepository
├── PartService
└── MachineService
```

---

## Summary

### Pattern Applied

**Dependency Container** - A simple IoC-like pattern that:
- Centralizes object creation
- Enables sharing (e.g., Database)
- Simplifies testing
- Doesn't require a framework

### Checklist

- [ ] Dependencies module created
- [ ] Routes updated to use get_deps()
- [ ] Factory functions removed
- [ ] Tests use reset fixture
- [ ] All tests pass

---

## Next Tutorial

[Tutorial 5: Test Coverage Analysis →](./05-test-coverage.md)
