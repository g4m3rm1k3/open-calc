# Phase 11: CAM Import

## Overview

This phase imports **Mastercam XML files** containing manufacturing data—tool paths, operations, and machining parameters.

> **Real-world data import is messy. This phase teaches you how to handle it.**

---

## What You Will Build

- XML parsing for Mastercam files
- Data mapping to domain entities
- Validation and error reporting
- Import preview and confirmation

---

## CAM Data Structure

```
┌──────────────────────────────────────────────┐
│ CAM File (.xml)                              │
├──────────────────────────────────────────────┤
│ ├── FileInfo                                 │
│ │   ├── FileName                             │
│ │   ├── PostProcessor                        │
│ │   └── MachineType                          │
│ ├── ToolPaths[]                              │
│ │   ├── Operation                            │
│ │   │   ├── Name                             │
│ │   │   ├── Type (drill, mill, etc.)         │
│ │   │   └── Parameters                       │
│ │   └── Tool                                 │
│ │       ├── ToolNumber                       │
│ │       ├── Description                      │
│ │       └── Geometry                         │
│ └── NcOutput                                 │
│     ├── GCodeFile                            │
│     └── SimulationData                       │
└──────────────────────────────────────────────┘
```

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [XML Parsing Basics](./01-xml-parsing.md) | 45 min |
| 2 | [CAM File Structure](./02-cam-structure.md) | 30 min |
| 3 | [Import Entities](./03-import-entities.md) | 45 min |
| 4 | [Import Service](./04-import-service.md) | 60 min |
| 5 | [Import UI](./05-import-ui.md) | 45 min |

---

## Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Invalid XML | Reject with parse error |
| Missing required fields | Collect all errors, show list |
| Duplicate data | Offer update or skip |
| Unknown fields | Warn but continue |

---

## Verification Checklist

After this phase:

- [ ] Can upload CAM XML file
- [ ] Data extracted correctly
- [ ] Validation errors shown
- [ ] Import preview working
- [ ] Data persisted on confirm

---

## Next Phase

[Refactor Checkpoint #2 →](../12-refactor-checkpoint-2/README.md)
