# Tutorial 1: Project Layout

## Introduction

This tutorial creates the complete PartFlow project structure. Every folder and file has a purpose rooted in the architectural decisions from Phase 01.

> **Structure is not arbitrary. It enforces the architecture.**

---

## Part 1: Why Structure Matters

### 1.1 Structure Enforces Dependencies

Remember from Phase 01:
- Dependencies point inward (toward stability)
- Domain has no external dependencies
- Web depends on Service, which depends on Domain

The folder structure reflects this:

```
src/partflow/
    ├── domain/      ← Core (no dependencies)
    ├── repository/  ← Implements domain interfaces
    ├── service/     ← Uses domain + repository interfaces
    └── web/         ← Uses service
```

When someone imports from `domain` while inside `web`, they're following dependency rules.

### 1.2 Structure Communicates Intent

A new developer should understand the architecture from the folder structure alone:

| Folder | Tells Developer |
|--------|-----------------|
| `domain/` | Business rules and entities live here |
| `repository/` | Database code goes here |
| `service/` | Use case orchestration here |
| `web/` | HTTP handling here |

---

## Part 2: Create the Structure

### 2.1 Create Main Directories

Open terminal in project root (`se-path-v2`) with venv activated:

**Windows PowerShell:**
```powershell
# Create main directories
mkdir src
mkdir src\partflow
mkdir src\partflow\domain
mkdir src\partflow\domain\entities
mkdir src\partflow\domain\value_objects
mkdir src\partflow\domain\interfaces
mkdir src\partflow\repository
mkdir src\partflow\repository\sqlite
mkdir src\partflow\service
mkdir src\partflow\web
mkdir src\partflow\web\routes
mkdir src\partflow\web\templates
mkdir tests
mkdir tests\unit
mkdir tests\integration
mkdir docs
mkdir docs\adr
```

### 2.2 Create __init__.py Files

Python packages need `__init__.py` files:

```powershell
# Root package
New-Item src\partflow\__init__.py -ItemType File

# Domain layer
New-Item src\partflow\domain\__init__.py -ItemType File
New-Item src\partflow\domain\entities\__init__.py -ItemType File
New-Item src\partflow\domain\value_objects\__init__.py -ItemType File
New-Item src\partflow\domain\interfaces\__init__.py -ItemType File

# Repository layer
New-Item src\partflow\repository\__init__.py -ItemType File
New-Item src\partflow\repository\sqlite\__init__.py -ItemType File

# Service layer
New-Item src\partflow\service\__init__.py -ItemType File

# Web layer
New-Item src\partflow\web\__init__.py -ItemType File
New-Item src\partflow\web\routes\__init__.py -ItemType File

# Tests
New-Item tests\__init__.py -ItemType File
New-Item tests\unit\__init__.py -ItemType File
New-Item tests\integration\__init__.py -ItemType File
```

### 2.3 Verify Structure

```powershell
tree src /F
```

You should see:
```
src
└───partflow
    │   __init__.py
    │
    ├───domain
    │   │   __init__.py
    │   │
    │   ├───entities
    │   │       __init__.py
    │   │
    │   ├───interfaces
    │   │       __init__.py
    │   │
    │   └───value_objects
    │           __init__.py
    │
    ├───repository
    │   │   __init__.py
    │   │
    │   └───sqlite
    │           __init__.py
    │
    ├───service
    │       __init__.py
    │
    └───web
        │   __init__.py
        │
        ├───routes
        │       __init__.py
        │
        └───templates
```

---

## Part 3: Directory Purposes

### 3.1 The src/ Layout

```
src/partflow/           # Main application package
```

Using `src/` layout:
- Separates source from tests
- Prevents import confusion
- Industry standard practice

### 3.2 Domain Layer (`domain/`)

```
domain/
├── __init__.py
├── entities/           # Business entities (Part, Machine, etc.)
│   └── __init__.py
├── value_objects/      # Typed values (PartNumber, Revision)
│   └── __init__.py
├── interfaces/         # Abstract repository interfaces
│   └── __init__.py
└── errors.py           # Domain-specific exceptions
```

| Subfolder | Contains | Example |
|-----------|----------|---------|
| `entities/` | Business objects with identity | `part.py`, `machine.py` |
| `value_objects/` | Immutable typed values | `part_number.py` |
| `interfaces/` | Repository abstractions | `part_repository.py` |

### 3.3 Repository Layer (`repository/`)

```
repository/
├── __init__.py
├── sqlite/             # SQLite implementations
│   ├── __init__.py
│   ├── database.py     # Connection management
│   └── part_repository.py
└── memory/             # In-memory for testing (later)
```

### 3.4 Service Layer (`service/`)

```
service/
├── __init__.py
├── part_service.py     # Part use cases
└── machine_service.py  # Machine use cases
```

### 3.5 Web Layer (`web/`)

```
web/
├── __init__.py
├── app.py              # Flask application factory
├── routes/             # Route blueprints
│   ├── __init__.py
│   └── parts.py
└── templates/          # Jinja2 templates
    ├── base.html
    └── parts/
        └── list.html
```

---

## Part 4: Key Files

### 4.1 Create pyproject.toml

This file defines the Python project:

```toml
[project]
name = "partflow"
version = "0.1.0"
description = "Manufacturing Engineering Platform"
requires-python = ">=3.11"
dependencies = [
    "flask>=3.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
```

Save this as `pyproject.toml` in project root.

### 4.2 Create README.md

```markdown
# PartFlow

Manufacturing Engineering Platform for managing CNC-related data, workflows, and manufacturing knowledge.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -e ".[dev]"
```

## Run

```bash
python -m partflow
```

## Test

```bash
pytest
```
```

### 4.3 Create Domain Errors

Create `src/partflow/domain/errors.py`:

```python
"""Domain-level exceptions for PartFlow.

This module defines the exception hierarchy used throughout the application.
All exceptions inherit from PartFlowError for consistent handling.
"""


class PartFlowError(Exception):
    """Base exception for all PartFlow errors."""
    pass


class ValidationError(PartFlowError):
    """User input failed validation."""
    
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


class DuplicateEntityError(PartFlowError):
    """Entity with this identity already exists."""
    
    def __init__(self, entity_type: str, identifier: str):
        self.entity_type = entity_type
        self.identifier = identifier
        super().__init__(f"{entity_type} '{identifier}' already exists")


class NotFoundError(PartFlowError):
    """Requested entity not found."""
    
    def __init__(self, entity_type: str, identifier: str):
        self.entity_type = entity_type
        self.identifier = identifier
        super().__init__(f"{entity_type} '{identifier}' not found")


class NotAuthorizedError(PartFlowError):
    """User not authorized for this action."""
    
    def __init__(self, action: str, resource: str = None):
        self.action = action
        self.resource = resource
        msg = f"Not authorized to {action}"
        if resource:
            msg += f" on {resource}"
        super().__init__(msg)
```

---

## Part 5: Install in Development Mode

### 5.1 Install Package

With venv activated:

```bash
pip install -e ".[dev]"
```

The `-e` flag means "editable"—changes to source are immediately available without reinstalling.

### 5.2 Verify Installation

```bash
python -c "from partflow.domain.errors import ValidationError; print('Success!')"
```

Should print: `Success!`

---

## Part 6: Exercises

### Exercise 1: Verify Structure

Run these commands and verify the output:

```bash
tree src /F    # Windows
# or
find src -type f  # macOS/Linux
```

Confirm you have all `__init__.py` files.

<details>
<summary>Expected Files</summary>

At minimum:
- `src/partflow/__init__.py`
- `src/partflow/domain/__init__.py`
- `src/partflow/domain/entities/__init__.py`
- `src/partflow/domain/value_objects/__init__.py`
- `src/partflow/domain/interfaces/__init__.py`
- `src/partflow/domain/errors.py`
- `src/partflow/repository/__init__.py`
- `src/partflow/repository/sqlite/__init__.py`
- `src/partflow/service/__init__.py`
- `src/partflow/web/__init__.py`
- `src/partflow/web/routes/__init__.py`

</details>

---

### Exercise 2: Test Imports

Open Python REPL and try:

```python
from partflow.domain.errors import ValidationError
from partflow.domain.errors import NotFoundError

# Create an error
err = ValidationError("part_number", "cannot be empty")
print(err.field)
print(err.message)
```

<details>
<summary>Expected Output</summary>

```
part_number
cannot be empty
```

</details>

---

## Summary

### Key Takeaways

| Folder | Purpose | Dependencies |
|--------|---------|--------------|
| `domain/` | Business rules | None |
| `repository/` | Data access | Domain |
| `service/` | Use cases | Domain, Repository interfaces |
| `web/` | HTTP handling | Service |

### Structure Checklist

- [ ] All directories created
- [ ] All `__init__.py` files created
- [ ] `pyproject.toml` created
- [ ] `errors.py` created
- [ ] Package installs with `pip install -e .`
- [ ] Can import from domain layer

---

## Next Tutorial

[Tutorial 2: Python Packages →](./02-python-packages.md)
