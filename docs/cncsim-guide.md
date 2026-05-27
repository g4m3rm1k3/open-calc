# CNCSim — User Guide

CNCSim is an in-browser CNC G-code simulator with 2D viewport, 3D backplot, multi-dialect parsing, tool library management, stock/fixture visualisation, and setup import/export.

---

## Contents

1. [Machine Selection](#1-machine-selection)
2. [Tool Library](#2-tool-library)
   - [Tool Schema Reference](#tool-schema-reference)
   - [Creating & Editing Tools](#creating--editing-tools)
   - [Tool Import Format](#tool-import-format)
3. [Stock Setup](#3-stock-setup)
4. [Fixtures (Additional Stock Pieces)](#4-fixtures)
5. [Work Offsets (WCS)](#5-work-offsets-wcs)
6. [Program Library & File Management](#6-program-library--file-management)
7. [Setup Import / Export (.cncsetup)](#7-setup-import--export-cncsetup)
8. [Simulation Controls](#8-simulation-controls)
9. [B-Axis Multi-Part Example](#9-b-axis-multi-part-example)
10. [Reference JSON Schemas](#10-reference-json-schemas)

---

## 1. Machine Selection

Choose a machine from the **Preset** dropdown in the top bar. The preset controls:

| Field         | Effect                                                           |
| ------------- | ---------------------------------------------------------------- |
| `dialect`     | G-code parsing rules (FANUC, Siemens, Okuma, HAAS, Mazak)        |
| `class`       | `mill` or `lathe` — changes default tool types, view orientation |
| `axes.linear` | Axis letters accepted as linear moves                            |
| `axes.rotary` | Accepted rotary axis letters (A, B, C)                           |
| `channels`    | Number of simultaneous channels                                  |

Changing the machine preset **reloads the program library** with dialect-appropriate examples and resets the stock shape to the machine default.

---

## 2. Tool Library

The tool library is split into **mill** and **lathe** tables.  
Tools persist in `localStorage` as `cnc_tool_libraries_v1` between sessions.

### Tool Schema Reference

Every tool is stored as a normalised object with the following fields:

```jsonc
{
  "schema": 2, // internal version — always 2

  // Identity
  "n": 1, // tool number (integer)
  "cls": "mill", // "mill" | "lathe"
  "type": "Flat End Mill", // human-readable type string
  "desc": "Ø10 2-flute", // free-text description
  "source": "Sandvik", // optional — supplier / library origin
  "sourceId": "CoroMill-316-10", // optional — supplier catalogue ID

  // Units — IMPORTANT
  "units": "mm", // "mm" | "inch" — native units for this tool
  // All dimension fields below are stored internally
  // in mm regardless of this flag, but the UI
  // displays and accepts input in the tool's native units.

  // Geometry (always stored in mm)
  "dia": 10.0, // cutting diameter
  "cr": 0.5, // corner radius (0 = sharp)
  "tlo": 75.0, // tool length offset (gauge length)
  "lc": 22.0, // flute / cutting length
  "lt": 90.0, // overall length
  "shank": 10.0, // shank diameter

  // Holder (optional)
  "hdia": 40.0, // holder body diameter
  "hlen": 60.0, // holder projection length

  // Neck (optional — for long-reach tools)
  "neckDia": 8.0, // neck diameter
  "neckLen": 15.0, // neck length

  // Flutes / material
  "fl": 2, // flute count
  "mat": "Carbide", // "HSS" | "Carbide" | "Ceramic" | "CBN" | "Diamond"

  // Wear offsets (always mm; applied on top of nominal geometry)
  "wearR": 0.0, // radial wear — added to cutting radius for compensation
  "wearL": 0.0, // length wear — subtracted from tool length for TLO

  // Angle fields (degrees — dimensionless)
  "iAngle": 118, // included angle (drills, countersinks)
  "relief": 12, // relief / clearance angle
}
```

> **Mixed-unit tables**: You can have a metric drill alongside an imperial reamer in the same table. Each tool carries its own `units` flag. The engine works in mm internally; conversions happen automatically.

---

### Creating & Editing Tools

1. Click **+ Add Tool** in the **Tools** panel.
2. Select units (`mm` / `inch`) — this sets the display and input units for this tool only.
3. Fill in geometry fields. Only `dia` and `tlo` are required for simulation.
4. Click **Save** to commit. The tool is immediately available at `T{n}` in the program.

Clicking an existing tool card opens it in the editor. The card shows dimensions in the tool's own units.

---

### Tool Import Format

Import a JSON file from the **Tools → Import** button. Three accepted shapes:

**1. Array of tools**

```json
[
  {
    "toolNumber": 1,
    "type": "Drill",
    "diameter": 12.0,
    "units": "mm",
    "fluteLength": 35,
    "overallLength": 80,
    "lengthOffset": 80,
    "material": "Carbide",
    "flutes": 2
  },
  {
    "toolNumber": 2,
    "type": "Reamer",
    "diameter": 0.5,
    "units": "inch",
    "fluteLength": 1.25,
    "overallLength": 3.0,
    "lengthOffset": 3.0,
    "radiusWear": 0.0005,
    "lengthWear": 0.001
  }
]
```

**2. Object map** (key = tool number)

```json
{
  "1": { "type": "Drill", "dia": 12, "tlo": 80, "units": "mm" },
  "2": {
    "type": "Reamer",
    "dia": 12.7,
    "tlo": 76.2,
    "units": "mm",
    "wearR": 0.01
  }
}
```

**3. CAM-export wrapper** (any of the above nested under a key)

```json
{
  "tools": [ ... ],
  "machine": "HAAS UMC-750",
  "postProcessor": "Fusion360"
}
```

#### Supported Field Aliases

The importer accepts both CNCSim-native names and common CAM export names:

| CNCSim field | Accepted aliases                                       |
| ------------ | ------------------------------------------------------ |
| `n`          | `toolNumber`, `number`, `id`, `tool_number`            |
| `dia`        | `diameter`, `cutDiameter`, `cuttingDiameter`           |
| `cr`         | `cornerRadius`, `cornerRad`, `noseRadius`, `tipRadius` |
| `tlo`        | `lengthOffset`, `gaugeLength`, `toolLength`, `gl`      |
| `lc`         | `fluteLength`, `cuttingLength`, `flute_length`         |
| `lt`         | `overallLength`, `bodyLength`, `overall_length`        |
| `shank`      | `shankDiameter`, `shank_diameter`                      |
| `hdia`       | `holderDiameter`, `holder_diameter`                    |
| `hlen`       | `holderLength`, `holder_length`                        |
| `fl`         | `flutes`, `fluteCount`, `numberOfFlutes`               |
| `mat`        | `material`, `substrate`, `grade`                       |
| `wearR`      | `radiusWear`, `radius_wear`, `diameterWear`            |
| `wearL`      | `lengthWear`, `length_wear`                            |
| `units`      | `uom`, `unit`, `measurementSystem`                     |
| `type`       | `toolType`, `category`, `toolClass`                    |

> **Tip**: If your CAM system exports a file that doesn't parse correctly, open it and check the field names against this table. You can rename fields manually or add them to `normalizeImportedToolPayload` in `CNCSim.jsx`.

---

## 3. Stock Setup

Configure the raw workpiece in the **Setup → Stock** panel.

### Stock Shape: `box`

```
Width  (X) ×  Depth  (Y)  ×  Height (Z)
```

The stock origin `(x, y, z)` sets the **bottom-left-front corner** of the box in machine coordinates.

### Stock Shape: `cyl`

```
Diameter × Length (along Z for mill, along X for lathe)
```

The origin sets the **centre of the bottom face**.

### Stock Units

Select `mm` or `in` using the units dropdown. All displayed and entered values use the selected unit. Internally everything is stored in mm.

### Stock JSON (inside a `.cncsetup` file)

```jsonc
// Box stock example
"stock": {
  "shape": "box",
  "width": 150,    // mm — X extent
  "depth": 100,    // mm — Y extent
  "height": 50,    // mm — Z extent
  "x": -75,        // mm — origin X (machine coord)
  "y": -50,        // mm — origin Y
  "z": -50         // mm — origin Z (bottom of stock = -50 from spindle home)
}

// Cylinder stock example
"stock": {
  "shape": "cyl",
  "diameter": 80,  // mm
  "length": 150,   // mm
  "x": 0, "y": 0, "z": 0
}
```

---

## 4. Fixtures

Fixtures are **additional rectangular solid objects** displayed in the viewport. Use them to represent:

- Multiple workpieces (one per WCS offset)
- Vises, chucks, tombstone faces
- Clamp bodies or tooling plates

### Adding a Fixture

Click **+ Add Fixture** in the **Setup → Fixtures** panel. A new fixture appears at a default position. Edit:

| Field           | Meaning                                                      |
| --------------- | ------------------------------------------------------------ |
| `X` / `Y` / `Z` | Position of the fixture's corner in machine coordinates (mm) |
| `W`             | Width along X                                                |
| `H`             | Height along Z                                               |
| `D`             | Depth along Y                                                |

### Fixture JSON (inside a `.cncsetup` file)

```jsonc
"fixtures": [
  {
    "id": 1,
    "name": "Part 1 (G54)",
    "x": 80,  "y": 80,  "z": 0,
    "w": 60,  "h": 40,  "d": 60
  },
  {
    "id": 2,
    "name": "Part 2 (G55)",
    "x": -140, "y": 80,  "z": 0,
    "w": 60,   "h": 40,  "d": 60
  },
  {
    "id": 3,
    "name": "Part 3 (G56)",
    "x": -140, "y": -140, "z": 0,
    "w": 60,   "h": 40,   "d": 60
  },
  {
    "id": 4,
    "name": "Part 4 (G57)",
    "x": 80,   "y": -140, "z": 0,
    "w": 60,   "h": 40,   "d": 60
  }
]
```

> **Convention**: When setting up a 4-part tombstone, position each fixture's `(x, y, z)` to match the **work offset origin** defined in the WCS tab for that piece. This makes the visual layout match the program.

---

## 5. Work Offsets (WCS)

The **WCS panel** (left sidebar → `WCS` tab) lists all active work offsets: G54 through G59 and extended offsets.

Click any row to make it the **active WCS** for jog and simulation display.

### Setting WCS Values

**In the UI**: Click an offset row, then edit the X / Y / Z fields shown.

**In the program (G10)**:

```gcode
(Set G54 to X80 Y80 Z0)
G10 L2 P1 X80. Y80. Z0.

(Set G55 to X-80 Y80 Z0)
G10 L2 P2 X-80. Y80. Z0.
```

`L2` = absolute work offset, `P1`=G54, `P2`=G55, `P3`=G56, `P4`=G57.

### WCS JSON (inside a `.cncsetup` file)

```jsonc
"offsets": {
  "G54": { "x":  80, "y":  80, "z": 0, "a": 0, "b": 0, "c": 0 },
  "G55": { "x": -80, "y":  80, "z": 0, "a": 0, "b": 0, "c": 0 },
  "G56": { "x": -80, "y": -80, "z": 0, "a": 0, "b": 0, "c": 0 },
  "G57": { "x":  80, "y": -80, "z": 0, "a": 0, "b": 0, "c": 0 }
}
```

---

## 6. Program Library & File Management

The **program library** dropdown (top bar) lists built-in example programs filtered to the active machine dialect.

### Loading an Example

Select a program from the dropdown to load it into the editor and reset the simulation.

### Saving a Program

Use **File → Save Program** (or the save icon) to add the current code to the **Saved Programs** list that persists between sessions.

### Multi-File Projects

Programs can be split into **sub-programs** stored as separate files in the project panel (right sidebar). The main program calls subs with `M98 P{number}` (FANUC/HAAS) and sub-programs are stored with a matching program number in their header (`O{number}`).

---

## 7. Setup Import / Export (`.cncsetup`)

A `.cncsetup` file is a JSON snapshot of the complete simulator state. Use it to:

- Share a complete setup (machine + stock + fixtures + WCS + tools + program) with a colleague
- Save a machine-specific configuration template
- Pre-configure a tombstone layout before writing G-code

### Export

**File menu → Export Setup** → downloads `cnc_YYYY-MM-DD.cncsetup`

### Import

**File menu → Import Setup** → select a `.cncsetup` file. All fields are optional; only the ones present are applied.

### Full `.cncsetup` Schema

```jsonc
{
  "version": 5, // file format version
  "ts": "2026-05-27T12:00:00Z", // ISO timestamp

  "machDefId": "haas_mill", // machine preset ID

  // G-code — either projectFiles (preferred) or plain code string
  "projectFiles": [
    {
      "id": "main-001",
      "name": "O9000.nc",
      "content": "O9000\nG21 G90...",
      "bucket": "main",
      "channel": null,
    },
  ],

  // Tool libraries
  "toolLibraries": {
    "mill": {
      "1": {
        "schema": 2,
        "n": 1,
        "cls": "mill",
        "type": "Drill",
        "units": "mm",
        "dia": 12,
        "cr": 0,
        "tlo": 80,
        "lc": 35,
        "lt": 90,
        "fl": 2,
        "mat": "Carbide",
        "wearR": 0,
        "wearL": 0,
      },
    },
    "lathe": {},
  },

  // Stock (primary workpiece)
  "stock": {
    "shape": "box",
    "width": 100,
    "depth": 100,
    "height": 50,
    "x": -50,
    "y": -50,
    "z": -50,
  },

  // Fixtures (additional solids)
  "fixtures": [
    /* see section 4 */
  ],

  // Work offsets
  "offsets": {
    /* see section 5 */
  },
  "wcs": "G54", // active WCS at load time

  // Misc simulation settings
  "geomDepth": -5,
  "geomFeed": 200,
  "home": { "x": 0, "y": 0, "z": 0 },
}
```

---

## 8. Simulation Controls

| Control      | Action                                                        |
| ------------ | ------------------------------------------------------------- |
| **▶ Run**    | Plays the simulation from the beginning                       |
| **⏸ Pause**  | Pauses at the current block                                   |
| **⏭ Step**  | Advances one G-code block                                     |
| **⏮ Reset** | Returns to block 0                                            |
| Slider       | Scrub to any block                                            |
| **3D / 2D**  | Toggle between CNC backplot (Three.js) and 2D canvas viewport |

The tool in the 3D view animates **along interpolated arc points** (not block-to-block jumps). Arc speed follows the path curvature so full circles and partial arcs display smoothly.

---

## 9. B-Axis Multi-Part Example

This section describes the **4-part tombstone** built-in example available under `HAAS UMC` → `4-Part Tombstone (B-Axis)`.

### Machine Setup

- **Machine**: HAAS UMC 750 (or any FANUC-compatible 5-axis with B tilt + C rotation)
- **B axis**: Trunnion tilt — `B0` = top face, `B-90` = side face
- **C axis**: Table rotation — stays at `C0` throughout (all parts drilled at same table angle)

### Part Layout

Four 100×100×50 mm aluminium blocks at the corners of a 320 mm square tombstone:

```
           Y+
           │
  G55 ─────┼───── G54
 (-80,+80) │     (+80,+80)
           │
  ──────── 0 ──────── X+
           │
  G56 ─────┼───── G57
 (-80,-80) │     (+80,-80)
           │
           Y-
```

### Fixture & WCS Configuration

Set the following in the **WCS tab** (or via G10 at program start):

```
G54: X+80  Y+80  Z0
G55: X-80  Y+80  Z0
G56: X-80  Y-80  Z0
G57: X+80  Y-80  Z0
```

Add four 100×50×100 fixtures in the **Setup → Fixtures** panel, positioned to match.

### How the Macro Works

The program uses a FANUC macro B subroutine (`O9100`) to avoid writing the drill sequence eight times. The main program calls the sub once per WCS per face:

```gcode
G65 P9100 A54.     (drill part at G54)
```

Inside `O9100`, the local variable `#1` (the `A` argument) selects the work offset via `IF` statements:

```gcode
IF [#1 EQ 54] G54
IF [#1 EQ 55] G55
...
```

This is the standard real-machine approach; `G[#n]` WCS selection (FANUC extension) is less universally supported.

### G-code Listing

See the built-in example `O9000 – 4-Part Tombstone (B-Axis)` loaded automatically when selecting **HAAS UMC** preset. The key structure:

1. **Tool load + spindle on**
2. **Face 1** (`B0. C0.`): call sub for G54, G55, G56, G57
3. **Safe retract to B0**
4. **Face 2** (`B-90. C0.`): call sub for G54, G55, G56, G57
5. **Return to B0, machine home, M30**

Sub `O9100` drills one hole at `X0 Y0` using `G81`.

---

## 10. Reference JSON Schemas

### Minimal Tool (mill, mm)

```json
{
  "schema": 2,
  "n": 1,
  "cls": "mill",
  "type": "Flat End Mill",
  "units": "mm",
  "dia": 10,
  "tlo": 75,
  "wearR": 0,
  "wearL": 0
}
```

### Minimal Tool (lathe, inch)

```json
{
  "schema": 2,
  "n": 3,
  "cls": "lathe",
  "type": "OD Insert",
  "units": "inch",
  "dia": 1.0,
  "tlo": 3.5,
  "cr": 0.031,
  "wearR": 0,
  "wearL": 0
}
```

### Drill + Reamer Mixed-Unit Import

```json
[
  {
    "toolNumber": 1,
    "type": "Drill",
    "diameter": 11.8,
    "uom": "mm",
    "fluteLength": 38,
    "overallLength": 90,
    "lengthOffset": 90,
    "flutes": 2,
    "material": "Carbide"
  },
  {
    "toolNumber": 2,
    "type": "Reamer",
    "diameter": 0.4724,
    "uom": "inch",
    "fluteLength": 1.5,
    "overallLength": 3.0,
    "lengthOffset": 3.0,
    "radiusWear": 0.0005,
    "lengthWear": 0.001,
    "material": "HSS"
  }
]
```

> Tool 1 is a 11.8 mm metric drill; tool 2 is a 12.0 mm (0.4724″) imperial reamer. Both live in the same tool table; the simulator normalises both to mm internally.

---

_Generated from CNCSim v2 — open-calc project_
