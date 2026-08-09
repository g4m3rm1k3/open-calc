# Tutorial 4: Health Checks

## Introduction

Health checks let external systems verify your application is working.

---

## Part 1: Health Check Types

| Type | Purpose | Checks |
|------|---------|--------|
| **Liveness** | Is app running? | Process responding |
| **Readiness** | Can it handle requests? | Dependencies available |
| **Deep** | Is everything working? | All subsystems |

---

## Part 2: Health Check Implementation

```python
# src/partflow/health.py
"""Health check implementation."""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, List


class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class ComponentHealth:
    name: str
    status: HealthStatus
    message: str = ""


def check_database(deps) -> ComponentHealth:
    """Check database connectivity."""
    try:
        with deps.db.connection() as conn:
            conn.execute("SELECT 1").fetchone()
        return ComponentHealth("database", HealthStatus.HEALTHY)
    except Exception as e:
        return ComponentHealth(
            "database", 
            HealthStatus.UNHEALTHY, 
            str(e)
        )


def check_disk_space() -> ComponentHealth:
    """Check available disk space."""
    import shutil
    
    total, used, free = shutil.disk_usage("/")
    free_percent = (free / total) * 100
    
    if free_percent < 10:
        return ComponentHealth(
            "disk", 
            HealthStatus.UNHEALTHY,
            f"Only {free_percent:.1f}% free"
        )
    elif free_percent < 20:
        return ComponentHealth(
            "disk", 
            HealthStatus.DEGRADED,
            f"{free_percent:.1f}% free"
        )
    return ComponentHealth("disk", HealthStatus.HEALTHY)


def get_overall_health(components: List[ComponentHealth]) -> HealthStatus:
    """Determine overall health from components."""
    statuses = [c.status for c in components]
    
    if HealthStatus.UNHEALTHY in statuses:
        return HealthStatus.UNHEALTHY
    if HealthStatus.DEGRADED in statuses:
        return HealthStatus.DEGRADED
    return HealthStatus.HEALTHY
```

---

## Part 3: Health Routes

```python
# src/partflow/web/routes/health.py

from flask import Blueprint, jsonify
from partflow.health import (
    check_database, check_disk_space, 
    get_overall_health, HealthStatus,
)
from partflow.dependencies import get_deps


health_bp = Blueprint('health', __name__)


@health_bp.route('/health')
def health():
    """Basic liveness check."""
    return jsonify({"status": "ok"})


@health_bp.route('/health/ready')
def readiness():
    """Readiness check - can handle requests?"""
    deps = get_deps()
    
    components = [
        check_database(deps),
    ]
    
    overall = get_overall_health(components)
    status_code = 200 if overall == HealthStatus.HEALTHY else 503
    
    return jsonify({
        "status": overall.value,
        "components": [
            {
                "name": c.name,
                "status": c.status.value,
                "message": c.message,
            }
            for c in components
        ]
    }), status_code


@health_bp.route('/health/deep')
def deep_health():
    """Deep health check - all subsystems."""
    deps = get_deps()
    
    components = [
        check_database(deps),
        check_disk_space(),
    ]
    
    overall = get_overall_health(components)
    status_code = 200 if overall != HealthStatus.UNHEALTHY else 503
    
    return jsonify({
        "status": overall.value,
        "components": [
            {
                "name": c.name,
                "status": c.status.value,
                "message": c.message,
            }
            for c in components
        ]
    }), status_code
```

---

## Part 4: Response Examples

### Healthy

```json
{
  "status": "healthy",
  "components": [
    {"name": "database", "status": "healthy", "message": ""},
    {"name": "disk", "status": "healthy", "message": ""}
  ]
}
```

### Degraded

```json
{
  "status": "degraded",
  "components": [
    {"name": "database", "status": "healthy", "message": ""},
    {"name": "disk", "status": "degraded", "message": "15.2% free"}
  ]
}
```

---

## Summary

### Phase 14 Complete!

Observability implemented:
- ✅ Event-driven architecture
- ✅ Logging with context
- ✅ Metrics collection
- ✅ Health check endpoints

**Next:** [Phase 15: G-code Parsing →](../15-gcode-parsing/README.md)
