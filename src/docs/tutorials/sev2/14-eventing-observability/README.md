# Phase 14: Eventing & Observability

## Overview

This phase adds **events and observability**—making the system transparent and reactive.

> **You can't fix what you can't see. Observability is essential.**

---

## What You Will Build

- Domain events (PartCreated, PartApproved, etc.)
- Event logging and audit trails
- Application metrics
- Health monitoring

---

## Event Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    EVENT FLOW                             │
│                                                           │
│  ┌──────────┐   publish    ┌───────────┐    handle       │
│  │  Service │ ───────────▶ │  Event    │ ───────────────▶│
│  │  Layer   │              │  Bus      │                 │
│  └──────────┘              └───────────┘   ┌────────────┐│
│                                 │          │  Handlers  ││
│                                 │          ├────────────┤│
│                                 ├─────────▶│ AuditLog   ││
│                                 │          ├────────────┤│
│                                 └─────────▶│ Metrics    ││
│                                            └────────────┘│
└───────────────────────────────────────────────────────────┘
```

---

## Event Types

| Event | Trigger |
|-------|---------|
| `PartCreated` | New Part saved |
| `PartUpdated` | Part modified |
| `PartApproved` | Part approved |
| `PartLocked` | Part checked out |
| `ImportCompleted` | CAM import finished |
| `UserLoggedIn` | Successful login |

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Event-Driven Architecture](./01-event-architecture.md) | 30 min |
| 2 | [Domain Events](./02-domain-events.md) | 45 min |
| 3 | [Event Bus Implementation](./03-event-bus.md) | 45 min |
| 4 | [Logging Strategy](./04-logging.md) | 30 min |
| 5 | [Metrics & Monitoring](./05-metrics.md) | 30 min |

---

## Observability Stack

| Component | Purpose |
|-----------|---------|
| **Logging** | What happened |
| **Metrics** | How much/how fast |
| **Tracing** | Where in the flow |
| **Alerting** | When things go wrong |

---

## Verification Checklist

- [ ] Events publish correctly
- [ ] Handlers receive events
- [ ] Audit log captures all changes
- [ ] Metrics visible
- [ ] Health endpoint accurate

---

## Next Phase

[Phase 15: G-Code Parsing (Advanced) →](../15-gcode-parsing/README.md)
