# Tutorial 1: Event-Driven Architecture

## Introduction

Events decouple components—when something happens, multiple parts of the system can react without knowing about each other.

---

## Part 1: Why Events?

### 1.1 Tight Coupling Problem

**Without events:**
```python
def create_part(self, ...):
    part = Part(...)
    self._repo.save(part)
    
    # Direct calls - tight coupling
    self._audit_service.log_create(part)
    self._notification_service.notify(part)
    self._analytics_service.track(part)
    self._cache_service.invalidate()
```

Every new feature requires modifying this method.

### 1.2 Event-Driven Solution

**With events:**
```python
def create_part(self, ...):
    part = Part(...)
    self._repo.save(part)
    
    # Publish event - loose coupling
    self._event_bus.publish(PartCreated(part))
```

Handlers subscribe to events without the publisher knowing.

---

## Part 2: Event Model

### 2.1 Base Event

```python
# src/partflow/events/base.py
"""Base event classes."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict
from uuid import UUID, uuid4


@dataclass
class Event:
    """Base class for domain events.
    
    All events have:
    - Unique ID
    - Timestamp
    - Type name
    - Payload data
    """
    id: UUID = field(default_factory=uuid4)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def event_type(self) -> str:
        return self.__class__.__name__
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize event to dictionary."""
        return {
            'id': str(self.id),
            'type': self.event_type,
            'timestamp': self.timestamp.isoformat(),
            'data': self._get_data(),
        }
    
    def _get_data(self) -> Dict[str, Any]:
        """Override to provide event-specific data."""
        return {}
```

### 2.2 Domain Events

```python
# src/partflow/events/part_events.py
"""Part-related domain events."""

from dataclasses import dataclass
from uuid import UUID

from partflow.domain.entities.part import Part, PartStatus
from partflow.events.base import Event


@dataclass
class PartCreated(Event):
    """Raised when a new Part is created."""
    part_id: UUID
    part_number: str
    created_by: str
    
    def _get_data(self):
        return {
            'part_id': str(self.part_id),
            'part_number': self.part_number,
            'created_by': self.created_by,
        }


@dataclass
class PartUpdated(Event):
    """Raised when a Part is updated."""
    part_id: UUID
    changed_fields: list
    updated_by: str


@dataclass
class PartStatusChanged(Event):
    """Raised when Part status changes."""
    part_id: UUID
    from_status: PartStatus
    to_status: PartStatus
    changed_by: str


@dataclass
class PartApproved(Event):
    """Raised when a Part is approved."""
    part_id: UUID
    approved_by: str
    comments: str = ""
```

---

## Part 3: Event Bus

```python
# src/partflow/events/event_bus.py
"""In-process event bus."""

from typing import Callable, Dict, List, Type
from partflow.events.base import Event


EventHandler = Callable[[Event], None]


class EventBus:
    """Simple in-process event bus.
    
    Handlers are called synchronously when event is published.
    """
    
    _handlers: Dict[Type[Event], List[EventHandler]] = {}
    
    @classmethod
    def subscribe(cls, event_type: Type[Event], handler: EventHandler) -> None:
        """Subscribe handler to event type."""
        if event_type not in cls._handlers:
            cls._handlers[event_type] = []
        cls._handlers[event_type].append(handler)
    
    @classmethod
    def publish(cls, event: Event) -> None:
        """Publish event to all subscribers."""
        event_type = type(event)
        handlers = cls._handlers.get(event_type, [])
        
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                # Log but don't fail
                print(f"Handler error: {e}")
    
    @classmethod
    def clear(cls) -> None:
        """Clear all handlers (for testing)."""
        cls._handlers.clear()
```

---

## Part 4: Event Handlers

```python
# src/partflow/events/handlers.py
"""Event handlers."""

from partflow.events.event_bus import EventBus
from partflow.events.part_events import PartCreated, PartApproved, PartStatusChanged


def handle_part_created(event: PartCreated) -> None:
    """Log Part creation."""
    print(f"Part created: {event.part_number} by {event.created_by}")


def handle_part_approved(event: PartApproved) -> None:
    """Handle Part approval."""
    print(f"Part {event.part_id} approved by {event.approved_by}")
    # Could: send email, update cache, trigger workflow


def register_handlers() -> None:
    """Register all event handlers."""
    EventBus.subscribe(PartCreated, handle_part_created)
    EventBus.subscribe(PartApproved, handle_part_approved)
```

---

## Part 5: Usage in Services

```python
# In PartService

from partflow.events.event_bus import EventBus
from partflow.events.part_events import PartCreated


def create_part(self, ...) -> Part:
    part = Part(...)
    self._repo.save(part)
    
    # Publish event
    EventBus.publish(PartCreated(
        part_id=part.id,
        part_number=str(part.part_number),
        created_by=created_by,
    ))
    
    return part
```

---

## Summary

### Event Architecture

| Component | Purpose |
|-----------|---------|
| Event | Data class describing what happened |
| EventBus | Routes events to handlers |
| Handler | Reacts to specific event |

---

## Next Tutorial

[Tutorial 2: Logging Architecture →](./02-logging.md)
