# Tutorial 2: Logging Architecture

## Introduction

Proper logging is essential for debugging and monitoring production systems.

---

## Part 1: Logging Basics

### 1.1 Python Logging Module

```python
import logging

# Create logger
logger = logging.getLogger(__name__)

# Log at different levels
logger.debug("Detailed info for debugging")
logger.info("General operational info")
logger.warning("Something unexpected")
logger.error("Something failed")
logger.critical("System is unusable")
```

### 1.2 Log Levels

| Level | When to Use |
|-------|-------------|
| DEBUG | Development details |
| INFO | Normal operations |
| WARNING | Unexpected but handled |
| ERROR | Operation failed |
| CRITICAL | System failure |

---

## Part 2: Logging Configuration

```python
# src/partflow/logging_config.py
"""Logging configuration."""

import logging
import sys
from pathlib import Path


def configure_logging(
    level: str = "INFO",
    log_file: Path = None,
) -> None:
    """Configure application logging.
    
    Args:
        level: Minimum log level
        log_file: Optional file to write logs to
    """
    handlers = []
    
    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    handlers.append(console)
    
    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        handlers.append(file_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        handlers=handlers,
    )
    
    # Quiet noisy libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
```

---

## Part 3: Structured Logging

### 3.1 Include Context

```python
# Better: structured logging
import json


class StructuredLogger:
    """Logger that outputs structured JSON."""
    
    def __init__(self, name: str):
        self._logger = logging.getLogger(name)
    
    def info(self, message: str, **context):
        self._log(logging.INFO, message, context)
    
    def error(self, message: str, **context):
        self._log(logging.ERROR, message, context)
    
    def _log(self, level: int, message: str, context: dict):
        log_data = {
            'message': message,
            **context,
        }
        self._logger.log(level, json.dumps(log_data))


# Usage
logger = StructuredLogger('partflow.service')

logger.info(
    "Part created",
    part_id=str(part.id),
    part_number=str(part.part_number),
    user="engineer123",
)

# Output:
# {"message": "Part created", "part_id": "...", "part_number": "PN-12345", "user": "engineer123"}
```

---

## Part 4: Request Logging

```python
# src/partflow/web/middleware.py
"""Web middleware for logging."""

import time
from uuid import uuid4
from flask import g, request

import logging

logger = logging.getLogger('partflow.web')


def before_request():
    """Log request start."""
    g.request_id = str(uuid4())[:8]
    g.start_time = time.perf_counter()
    
    logger.info(
        f"[{g.request_id}] {request.method} {request.path}"
    )


def after_request(response):
    """Log request completion."""
    duration = (time.perf_counter() - g.start_time) * 1000
    
    logger.info(
        f"[{g.request_id}] {response.status_code} in {duration:.1f}ms"
    )
    
    return response
```

Register in app:

```python
app.before_request(before_request)
app.after_request(after_request)
```

---

## Part 5: Service Logging

```python
# In PartService

import logging

logger = logging.getLogger('partflow.service.part')


class PartService:
    
    def create_part(self, ...) -> Part:
        logger.info(f"Creating Part: {part_number}")
        
        try:
            part = Part(...)
            self._repo.save(part)
            logger.info(f"Part created: {part.id}")
            return part
        except Exception as e:
            logger.error(f"Failed to create Part: {e}")
            raise
```

---

## Summary

### Logging Best Practices

| Practice | Reason |
|----------|--------|
| Use appropriate levels | Easy filtering |
| Include context | Easier debugging |
| Structured format | Machine parseable |
| Request IDs | Trace requests |
| Don't log secrets | Security |

---

## Next Tutorial

[Tutorial 3: Metrics Collection →](./03-metrics.md)
