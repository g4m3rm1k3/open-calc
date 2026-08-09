# Phase 15: G-Code Parsing (Advanced Track)

## Overview

> ⚠️ **ADVANCED TRACK**: This phase is optional and for advanced learners.

This phase parses **G-code files** to extract machining intelligence—understanding what the machine actually does.

---

## What You Will Build

- G-code lexer and parser
- Operation extraction
- Tool change detection
- Cycle time estimation

---

## G-Code Basics

### Sample G-Code

```gcode
O0001                 ; Program number
N10 G21               ; Metric units
N20 G90               ; Absolute positioning
N30 T1 M06            ; Tool 1, tool change
N40 S5000 M03         ; Spindle 5000 RPM, CW
N50 G00 X0 Y0 Z50     ; Rapid to start
N60 G01 Z-5 F100      ; Feed to Z-5 at 100mm/min
N70 X100              ; Linear move
N80 G00 Z50           ; Rapid retract
N90 M30               ; Program end
```

### G-Code Structure

| Code Type | Examples | Meaning |
|-----------|----------|---------|
| G codes | G00, G01, G02 | Motion commands |
| M codes | M03, M06, M30 | Machine functions |
| Addresses | X, Y, Z, F, S | Parameters |
| N codes | N10, N20 | Line numbers |
| O codes | O0001 | Program numbers |

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [G-Code Fundamentals](./01-gcode-fundamentals.md) | 45 min |
| 2 | [Lexer Implementation](./02-lexer.md) | 60 min |
| 3 | [Parser Design](./03-parser.md) | 60 min |
| 4 | [Operation Extraction](./04-operations.md) | 45 min |
| 5 | [Tool Analysis](./05-tool-analysis.md) | 30 min |

---

## Parser Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PARSING PIPELINE                      │
│                                                          │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐ │
│  │  Raw    │──▶│  Lexer  │──▶│  Parser │──▶│  Domain  │ │
│  │  G-Code │   │ (tokens)│   │  (AST)  │   │  Objects │ │
│  └─────────┘   └─────────┘   └─────────┘   └──────────┘ │
│                                                          │
│  "G01 X100"   [G,01,X,100]   GCodeLine    LinearMove    │
└──────────────────────────────────────────────────────────┘
```

---

## Verification Checklist

- [ ] Can parse basic G-code
- [ ] Tool changes detected
- [ ] Operations extracted
- [ ] Cycle time estimated
- [ ] Errors reported clearly

---

## Next Phase

[Phase 16: Simulation Engine (Advanced) →](../16-simulation-engine/README.md)
