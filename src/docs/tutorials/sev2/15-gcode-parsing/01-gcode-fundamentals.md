# Tutorial 1: G-code Fundamentals

## Introduction

G-code is the language CNC machines understand. This tutorial explains G-code structure and how to parse it.

---

## Part 1: What is G-code?

### 1.1 G-code Basics

G-code is a line-based language that tells CNC machines what to do:

```gcode
%
O1001 (WIDGET PROGRAM)
N10 G21 (METRIC)
N20 G90 (ABSOLUTE)
N30 G00 X0 Y0 Z50.0
N40 M03 S3000
N50 G00 X25.0 Y25.0
N60 G01 Z-5.0 F100
N70 G01 X75.0 F200
N80 G00 Z50.0
N90 M05
N100 M30
%
```

### 1.2 Code Types

| Prefix | Name | Purpose |
|--------|------|---------|
| G | Preparatory | Motion mode, coordinates |
| M | Miscellaneous | Spindle, coolant, stop |
| X, Y, Z | Axis | Position coordinates |
| F | Feed | Feed rate |
| S | Speed | Spindle RPM |
| T | Tool | Tool number |
| N | Line | Line number |
| O | Program | Program number |

---

## Part 2: Common G-codes

### 2.1 Motion Codes

| Code | Meaning | Modal? |
|------|---------|--------|
| G00 | Rapid move | Yes |
| G01 | Linear feed | Yes |
| G02 | Arc CW | Yes |
| G03 | Arc CCW | Yes |

### 2.2 Coordinate Codes

| Code | Meaning |
|------|---------|
| G90 | Absolute positioning |
| G91 | Incremental positioning |
| G20 | Inch units |
| G21 | Metric units |

### 2.3 M-codes

| Code | Meaning |
|------|---------|
| M00 | Program stop |
| M03 | Spindle on CW |
| M04 | Spindle on CCW |
| M05 | Spindle stop |
| M06 | Tool change |
| M08 | Coolant on |
| M09 | Coolant off |
| M30 | Program end |

---

## Part 3: G-code Structure

### 3.1 Blocks and Words

**Block:** One line of G-code
**Word:** Letter + number (e.g., `G01`, `X25.0`)

```
N10 G01 X25.0 Y50.0 F100
│   │   │     │     └── Word: Feed rate 100
│   │   │     └── Word: Y position 50.0
│   │   └── Word: X position 25.0
│   └── Word: Linear feed move
└── Line number 10
```

### 3.2 Comments

```gcode
(This is a comment)
; This is also a comment
G00 X0 Y0 (Move to origin)
```

---

## Part 4: Parsing Strategy

### 4.1 What to Extract

| Data | Why |
|------|-----|
| Tool changes | Know what tools used |
| Spindle speeds | Verify parameters |
| Feed rates | Check for errors |
| Cycle structure | Understand program |
| Comments | Documentation |

### 4.2 Parsing Challenges

| Challenge | Solution |
|-----------|----------|
| Modal codes | Track active modes |
| Expressions | Simple regex first |
| Subprograms | Track call stack |
| Variables | Not for basic parser |

---

## Summary

### G-code Essentials

| Concept | Key Point |
|---------|-----------|
| Block | One line |
| Word | Letter + number |
| Modal | Stays active until changed |
| G00/G01 | Rapid vs feed move |
| M06 | Tool change |

---

## Next Tutorial

[Tutorial 2: Lexer Implementation →](./02-lexer.md)
