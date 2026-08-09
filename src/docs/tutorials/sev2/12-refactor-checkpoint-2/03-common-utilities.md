# Tutorial 3: Common Utilities

## Introduction

Extract common utilities used across the codebase.

---

## Part 1: Date/Time Utilities

Create `src/partflow/utils/datetime_utils.py`:

```python
"""Date and time utilities."""

from datetime import datetime, timedelta, timezone
from typing import Optional


def utc_now() -> datetime:
    """Get current UTC time."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M") -> str:
    """Format datetime for display."""
    return dt.strftime(fmt)


def format_relative(dt: datetime) -> str:
    """Format as relative time (e.g., '2 hours ago')."""
    now = utc_now()
    diff = now - dt
    
    if diff < timedelta(minutes=1):
        return "just now"
    elif diff < timedelta(hours=1):
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif diff < timedelta(days=1):
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff < timedelta(days=30):
        days = diff.days
        return f"{days} day{'s' if days != 1 else ''} ago"
    else:
        return format_datetime(dt)


def format_duration(seconds: float) -> str:
    """Format duration in human-readable form."""
    if seconds < 60:
        return f"{seconds:.0f}s"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f}m"
    else:
        hours = seconds / 3600
        return f"{hours:.1f}h"
```

---

## Part 2: String Utilities

Create `src/partflow/utils/string_utils.py`:

```python
"""String manipulation utilities."""

import re
from typing import Optional


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def truncate(text: str, length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length."""
    if len(text) <= length:
        return text
    return text[:length - len(suffix)] + suffix


def normalize_whitespace(text: str) -> str:
    """Collapse multiple whitespace to single space."""
    return ' '.join(text.split())


def is_blank(value: Optional[str]) -> bool:
    """Check if string is None, empty, or whitespace only."""
    return value is None or not value.strip()
```

---

## Part 3: Jinja Filters

Create `src/partflow/web/filters.py`:

```python
"""Custom Jinja2 template filters."""

from flask import Flask
from partflow.utils.datetime_utils import format_relative, format_duration
from partflow.utils.string_utils import truncate


def register_filters(app: Flask) -> None:
    """Register custom template filters."""
    
    @app.template_filter('relative_time')
    def relative_time_filter(dt):
        """Format datetime as relative time."""
        if dt is None:
            return ''
        return format_relative(dt)
    
    @app.template_filter('duration')
    def duration_filter(seconds):
        """Format seconds as duration."""
        if seconds is None:
            return ''
        return format_duration(seconds)
    
    @app.template_filter('truncate_text')
    def truncate_filter(text, length=100):
        """Truncate text with ellipsis."""
        if text is None:
            return ''
        return truncate(text, length)
```

Update `app.py`:

```python
from partflow.web.filters import register_filters

def create_app(config: Optional[Config] = None) -> Flask:
    app = Flask(...)
    # ...
    register_filters(app)
    return app
```

---

## Part 4: Usage in Templates

```html
<!-- Relative time -->
<span>Created {{ part.created_at | relative_time }}</span>

<!-- Duration -->
<span>Cycle time: {{ operation.cycle_time | duration }}</span>

<!-- Truncate -->
<p>{{ part.description | truncate_text(50) }}</p>
```

---

## Summary

### Utilities Created

| Module | Functions |
|--------|-----------|
| `datetime_utils` | utc_now, format_relative, format_duration |
| `string_utils` | slugify, truncate, normalize_whitespace |
| `filters` | Jinja template filters |

---

## Next Tutorial

[Tutorial 4: Test Improvements →](./04-test-improvements.md)
