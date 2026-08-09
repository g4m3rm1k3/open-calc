# Phase 03: Project Structure

## Overview

Now that your environment is ready, we create the PartFlow project skeleton. This phase implements the architectural decisions from Phase 01.

> **Good structure makes good code easier. Bad structure makes bad code inevitable.**

---

## What You Will Learn

| Topic | Why It Matters |
|-------|----------------|
| Project layout | Where code goes |
| Python packages | Module organization |
| Layer separation | Domain, repository, service, web |
| Configuration | Settings, environment |
| Entry points | How the app starts |

---

## Prerequisites

- Complete [Phase 02: Development Environment](../02-development-environment/README.md)
- Virtual environment activated

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Project Layout](./01-project-layout.md) | 45 min |
| 2 | [Python Packages](./02-python-packages.md) | 30 min |
| 3 | [Configuration System](./03-configuration.md) | 30 min |
| 4 | [Application Factory](./04-app-factory.md) | 30 min |

---

## What You Will Build

By the end of this phase, your project will have this structure:

```
se-path-v2/
├── src/
│   └── partflow/
│       ├── __init__.py
│       ├── domain/
│       │   ├── __init__.py
│       │   ├── entities/
│       │   ├── value_objects/
│       │   ├── interfaces/
│       │   └── errors.py
│       ├── repository/
│       │   ├── __init__.py
│       │   └── sqlite/
│       ├── service/
│       │   └── __init__.py
│       ├── web/
│       │   ├── __init__.py
│       │   ├── app.py
│       │   ├── routes/
│       │   └── templates/
│       └── config.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   └── integration/
├── docs/
│   └── adr/
├── venv/
├── requirements.txt
├── pyproject.toml
└── README.md
```

---

## Verification Checklist

After this phase:

- [ ] Project structure matches diagram
- [ ] `python -m partflow` starts the app
- [ ] Tests can import from all layers
- [ ] Configuration loads correctly

---

## Next Phase

[Phase 04: Testing Discipline →](../04-testing-discipline/README.md)
