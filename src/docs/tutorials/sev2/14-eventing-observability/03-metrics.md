# Tutorial 3: Metrics Collection

## Introduction

Metrics help you understand system behavior—request rates, error rates, latencies.

---

## Part 1: What to Measure

### 1.1 Key Metrics

| Metric | Type | Purpose |
|--------|------|---------|
| Request count | Counter | Volume |
| Request latency | Histogram | Performance |
| Error count | Counter | Reliability |
| Active parts | Gauge | Business |
| DB query time | Histogram | Performance |

### 1.2 Metric Types

| Type | Description | Example |
|------|-------------|---------|
| **Counter** | Only increases | Total requests |
| **Gauge** | Can go up/down | Current users |
| **Histogram** | Distribution | Response times |

---

## Part 2: Simple Metrics Collection

```python
# src/partflow/metrics.py
"""Simple metrics collection."""

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from threading import Lock
from typing import Dict, List


@dataclass
class MetricsCollector:
    """Simple in-memory metrics collector."""
    
    counters: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    gauges: Dict[str, float] = field(default_factory=dict)
    histograms: Dict[str, List[float]] = field(default_factory=lambda: defaultdict(list))
    _lock: Lock = field(default_factory=Lock)
    
    def increment(self, name: str, value: int = 1) -> None:
        """Increment a counter."""
        with self._lock:
            self.counters[name] += value
    
    def set_gauge(self, name: str, value: float) -> None:
        """Set a gauge value."""
        with self._lock:
            self.gauges[name] = value
    
    def observe(self, name: str, value: float) -> None:
        """Record a histogram observation."""
        with self._lock:
            self.histograms[name].append(value)
    
    def get_stats(self) -> dict:
        """Get all metrics."""
        with self._lock:
            result = {
                'counters': dict(self.counters),
                'gauges': dict(self.gauges),
                'histograms': {},
            }
            
            for name, values in self.histograms.items():
                if values:
                    sorted_vals = sorted(values)
                    result['histograms'][name] = {
                        'count': len(values),
                        'min': min(values),
                        'max': max(values),
                        'avg': sum(values) / len(values),
                        'p50': sorted_vals[len(values) // 2],
                        'p95': sorted_vals[int(len(values) * 0.95)],
                    }
            
            return result


# Global instance
metrics = MetricsCollector()
```

---

## Part 3: Metrics Integration

### 3.1 Request Metrics

```python
# In middleware

from partflow.metrics import metrics


def after_request(response):
    duration = (time.perf_counter() - g.start_time) * 1000
    
    # Record metrics
    metrics.increment('http_requests_total')
    metrics.observe('http_request_duration_ms', duration)
    
    if response.status_code >= 400:
        metrics.increment('http_errors_total')
    
    return response
```

### 3.2 Business Metrics

```python
# In PartService

from partflow.metrics import metrics


def create_part(self, ...):
    part = Part(...)
    self._repo.save(part)
    
    metrics.increment('parts_created_total')
    return part


def update_status_metrics(self):
    """Update gauge with Part counts by status."""
    for status in PartStatus:
        count = self._repo.count_by_status(status)
        metrics.set_gauge(f'parts_{status.value}', count)
```

---

## Part 4: Metrics Endpoint

```python
# src/partflow/web/routes/health.py

from partflow.metrics import metrics


@health_bp.route('/metrics')
def get_metrics():
    """Expose metrics for monitoring."""
    return jsonify(metrics.get_stats())
```

Output:
```json
{
  "counters": {
    "http_requests_total": 1523,
    "parts_created_total": 45,
    "http_errors_total": 3
  },
  "gauges": {
    "parts_draft": 12,
    "parts_active": 30
  },
  "histograms": {
    "http_request_duration_ms": {
      "count": 1523,
      "min": 5.2,
      "max": 450.3,
      "avg": 45.7,
      "p50": 28.0,
      "p95": 150.3
    }
  }
}
```

---

## Summary

### Metrics Best Practices

| Practice | Reason |
|----------|--------|
| Use counters for totals | Monotonic, reliable |
| Use gauges for current state | Snapshot values |
| Use histograms for latency | Distribution insight |
| Expose endpoint | Easy monitoring |

---

## Next Tutorial

[Tutorial 4: Health Checks →](./04-health-checks.md)
