# Tutorial 2: Python Packages

## Introduction

This tutorial explains how Python packages work and how they enable our layered architecture.

> **Understanding packages is essential for understanding code organization.**

---

## Part 1: Modules vs Packages

### 1.1 What is a Module?

A **module** is a single Python file:

```
my_module.py  ← This is a module
```

You import it by name:

```python
import my_module
from my_module import some_function
```

### 1.2 What is a Package?

A **package** is a directory containing Python modules:

```
my_package/
├── __init__.py    ← Makes it a package
├── module_a.py
└── module_b.py
```

You import from it:

```python
import my_package
from my_package import module_a
from my_package.module_a import some_function
```

### 1.3 The __init__.py File

The `__init__.py` file:
- Marks a directory as a Python package
- Runs when the package is imported
- Can define what the package exports

---

## Part 2: Package Hierarchy

### 2.1 PartFlow Package Structure

```
src/
└── partflow/             # Root package
    ├── __init__.py
    ├── domain/           # Sub-package
    │   ├── __init__.py
    │   ├── entities/     # Sub-sub-package
    │   │   ├── __init__.py
    │   │   └── part.py   # Module
```

### 2.2 Import Paths

| File | Import Path |
|------|-------------|
| `partflow/__init__.py` | `import partflow` |
| `partflow/domain/__init__.py` | `from partflow import domain` |
| `partflow/domain/entities/part.py` | `from partflow.domain.entities import part` |
| Class inside part.py | `from partflow.domain.entities.part import Part` |

### 2.3 The __init__.py Purpose

**Empty __init__.py:** Just marks directory as package

**__init__.py with exports:** Makes imports cleaner

```python
# partflow/domain/entities/__init__.py
from .part import Part
from .machine import Machine

# Now users can do:
from partflow.domain.entities import Part
# Instead of:
from partflow.domain.entities.part import Part
```

---

## Part 3: Import Conventions

### 3.1 Absolute vs Relative Imports

**Absolute import** (recommended):
```python
from partflow.domain.entities import Part
```

**Relative import** (within same package):
```python
from .part import Part       # Same directory
from ..errors import ValidationError  # Parent directory
```

### 3.2 Our Convention

| Situation | Import Style |
|-----------|--------------|
| Between layers | Absolute |
| Within same layer/package | Absolute or relative |
| Public API | Defined in `__init__.py` |

### 3.3 Example: Imports in a Service

```python
# src/partflow/service/part_service.py

# Absolute imports from other layers
from partflow.domain.entities import Part
from partflow.domain.interfaces import PartRepositoryInterface
from partflow.domain.errors import ValidationError, NotFoundError

class PartService:
    def __init__(self, repo: PartRepositoryInterface):
        self.repo = repo
```

---

## Part 4: Setting Up Exports

### 4.1 Domain Entities Export

Create `src/partflow/domain/entities/__init__.py`:

```python
"""Domain entities for PartFlow.

This module exports all entity classes for clean import syntax.
"""

# When Part class is created, add:
# from .part import Part
# from .machine import Machine

# For now, empty but ready
__all__ = []
```

### 4.2 Domain Root Export

Create `src/partflow/domain/__init__.py`:

```python
"""Domain layer for PartFlow.

Contains business entities, value objects, and interfaces.
No external dependencies allowed in this layer.
"""

from .errors import (
    PartFlowError,
    ValidationError,
    DuplicateEntityError,
    NotFoundError,
    NotAuthorizedError,
)

__all__ = [
    'PartFlowError',
    'ValidationError',
    'DuplicateEntityError',
    'NotFoundError',
    'NotAuthorizedError',
]
```

### 4.3 Root Package

Update `src/partflow/__init__.py`:

```python
"""PartFlow - Manufacturing Engineering Platform.

A centralized system for managing CNC-related data, workflows,
users, and manufacturing knowledge.
"""

__version__ = "0.1.0"
```

---

## Part 5: Verify Imports Work

### 5.1 Test in REPL

```python
python
>>> import partflow
>>> partflow.__version__
'0.1.0'
>>> from partflow.domain import ValidationError
>>> err = ValidationError("test", "message")
>>> print(err)
test: message
```

### 5.2 Test in File

Create `test_imports.py` in project root:

```python
"""Test that all imports work correctly."""

# Package root
import partflow
print(f"PartFlow version: {partflow.__version__}")

# Domain errors
from partflow.domain import ValidationError, NotFoundError
print(f"Loaded: ValidationError, NotFoundError")

# Direct from errors module
from partflow.domain.errors import DuplicateEntityError
print(f"Loaded: DuplicateEntityError")

print("\nAll imports successful!")
```

Run:
```bash
python test_imports.py
```

Expected output:
```
PartFlow version: 0.1.0
Loaded: ValidationError, NotFoundError
Loaded: DuplicateEntityError

All imports successful!
```

---

## Part 6: The __all__ Variable

### 6.1 What is __all__?

`__all__` defines the public API of a module:

```python
# module.py
__all__ = ['public_function', 'PublicClass']

def public_function():
    pass

def _private_function():  # Convention: leading underscore = private
    pass

class PublicClass:
    pass

class _PrivateClass:
    pass
```

When someone does `from module import *`, only items in `__all__` are imported.

### 6.2 Best Practice

- Always define `__all__` in public-facing modules
- Use leading underscore for private functions/classes
- Export through `__init__.py` for clean imports

---

## Part 7: Exercises

### Exercise 1: Trace an Import

Given this import:
```python
from partflow.domain.entities.part import Part
```

What files must exist and what must they contain?

<details>
<summary>Solution</summary>

Files required:
1. `src/partflow/__init__.py` - marks partflow as package
2. `src/partflow/domain/__init__.py` - marks domain as package
3. `src/partflow/domain/entities/__init__.py` - marks entities as package
4. `src/partflow/domain/entities/part.py` - contains `Part` class

Each `__init__.py` can be empty, but must exist.

</details>

---

### Exercise 2: Create Clean Exports

Assume `part.py` and `machine.py` exist with classes `Part` and `Machine`.

Update `entities/__init__.py` so users can do:
```python
from partflow.domain.entities import Part, Machine
```

<details>
<summary>Solution</summary>

```python
# src/partflow/domain/entities/__init__.py
from .part import Part
from .machine import Machine

__all__ = ['Part', 'Machine']
```

</details>

---

### Exercise 3: Fix Import Error

This code fails:
```python
# In src/partflow/service/part_service.py
from domain.entities import Part  # Error!
```

Why does it fail? How do you fix it?

<details>
<summary>Solution</summary>

**Why it fails:**
`domain` is not a top-level package. It's inside `partflow`.

**Fix:**
Use absolute import:
```python
from partflow.domain.entities import Part
```

Or if you want to use the package is installed in editable mode:
```python
from partflow.domain.entities import Part
```

</details>

---

## Summary

### Key Concepts

| Concept | Definition |
|---------|------------|
| **Module** | Single Python file |
| **Package** | Directory with `__init__.py` |
| **__init__.py** | Makes directory a package, can export symbols |
| **__all__** | Defines public API |
| **Absolute import** | `from package.subpackage import module` |
| **Relative import** | `from .module import thing` |

### Package Checklist

- [ ] Every directory has `__init__.py`
- [ ] Public symbols exported in `__init__.py`
- [ ] `__all__` defined for public modules
- [ ] Absolute imports between layers
- [ ] Package installs correctly

---

## Next Tutorial

[Tutorial 3: Configuration System →](./03-configuration.md)
