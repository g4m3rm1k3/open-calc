# Business Requirements Document — Unified Manufacturing Programmer Toolkit (C#)

## Status
Draft. This describes a single consolidated C# application replacing a
collection of separate Python tools currently in use: the Mastercam
Setup Sheet parser/editor, a manual balloon-pairing system, a PDF
balloon auto-detection stub (unbuilt), and a standalone bulk tool-data
importer. Each Python tool is prior art for its respective piece of
logic — not a spec this app is obligated to replicate 1:1.

## Problem Statement
Programmers currently work across a dozen separate, disconnected tools
to review Mastercam Setup Sheet data, correct fields the default report
leaves wrong or blank, pair inspection balloon numbers from engineering
print PDFs to specific tools/operations, look up tool data scattered
across Excel files on the network, and produce printable/program-text
outputs. There is no single place that does all of this, and no shared
data model connecting them — each tool has its own separate database.

## Goals
1. **One application, one data model, one database** — every subsystem
   below operates on the same underlying `Part` data, not separate
   disconnected tools with separate SQLite files.
2. Parse Mastercam Setup Sheet XML exports into a structured, typed C#
   data model.
3. Detect and flag placeholder/default-report data rather than treating
   it as valid (see "Known Data Quirks," below).
4. Persist parsed data to a local database as an **editable overlay**:
   the database is the source of truth once imported, not the original
   XML — specific fields (tool comment, holder name, stick-out, TA
   number, etc.) can be corrected without touching the source file, and
   every such change is tracked with a full audit trail (who changed
   what, when, old value vs. new value) — this pattern already exists
   and works in the Python `part_edits`/`balloon_changes` tables and is
   worth preserving as an architectural principle, not just a schema.
5. Provide a WPF interface as the primary surface for viewing and
   editing this data.
6. Support manual balloon pairing — associating an inspection balloon
   number (Diameter/Height/Tool/Program type) from an engineering print
   with a specific tool sequence and operation, stored per-part with
   the same audit trail as other edits.
7. Support (future) automatic balloon detection from an attached
   engineering print PDF, as a suggestion layer the user reviews/edits/
   accepts rather than a trusted final answer — see "PDF Balloon
   Detection," below.
8. Support bulk tool-data import: scanning a directory tree (network
   share) for Excel files, extracting tool/part header data, and
   building a searchable, de-duplicated tool database — as a subsystem
   of this same app rather than a standalone separate tool.
9. Export a polished, printable Excel workbook — at minimum the two
   formats already proven in Python: a general part/setup-sheet export,
   and a dedicated balloon-pairings export (pairings sheet + grouped
   by-sequence sheet).
10. Export an HTML "coloring book" summary of a part's data, as its own
    separate format alongside Excel.
11. Generate machine-specific NC program text via a template system
    (the C# equivalent of the prior tool's Jinja2 `.JINJA` chains).
12. Connect to the Mastercam .NET API directly — both to pull data from
    files without requiring a manually-run XML report, and eventually
    to run inside Mastercam itself as a ribbon-launched panel.

## Known Data Quirks (informs validation logic, not scope)
The default Mastercam Setup Sheet report populates several fields with
literal placeholder label text rather than real values when a shop
hasn't customized the report template — e.g.
`<DESCRIPTION>PART NAME</DESCRIPTION>`, `<CUSTOMER>REV</CUSTOMER>`,
`<DRAWING-NUMBER>PROGRAM NUMBER</DRAWING-NUMBER>`. The app must detect
this condition (a known set of placeholder strings and/or blank fields)
and flag it rather than silently treating placeholder text as real data.

## Non-Goals
- **No export format is an editing surface.** Excel and HTML outputs are
  generated one-way from the database; neither is ever read back in.
- Not rebuilding any prior Python tool's UI or behavior 1:1 — logic is
  reused where it's still sound (the audit-trail pattern, the balloon
  data model, the Excel formatting approach), reimplemented against the
  real C# architecture rather than ported line-for-line.
- Not cross-platform. Mastercam and its API are Windows-only.
- Not attempting to write back to Mastercam's own XML export or
  `.NCI`/`.NC` files — those remain Mastercam-owned outputs.
- The bulk tool importer's own database (`tools.db` in Python) merges
  into the unified app's single database — not kept as a permanently
  separate store once consolidated.

## Users
- Primary: programmers/machinists reviewing, correcting, and printing
  setup sheet and inspection-pairing data for a job.
- Secondary (future): anyone using the in-Mastercam ribbon integration.

## Architecture Overview
- **Data model (C# classes/records)** — typed representation of a parsed
  Setup Sheet (root metadata, `NcFile` list, `Operation`, `Tool` with
  nested `Assembly`/`Holder`), plus balloon pairings and per-field edit
  overrides as first-class parts of the same model, not bolted on.
- **Persistence layer (SQLite)** — single database for the whole app.
  Includes: part data, per-field edit overrides (with audit history),
  balloon pairings (with audit history), imported tool data from the
  bulk importer subsystem, and stored PDF paths per part. Includes the
  backup/integrity-check logic the prior Python tool handled well.
- **UI layer (WPF)** — the primary place data is created, corrected, or
  paired. Reads/writes the database, not the original XML, once
  imported.
- **Balloon pairing subsystem** — UI to associate a balloon number/type
  with a specific sequence + operation, backed by its own audit trail.
- **PDF balloon detection subsystem (future)** — given an attached
  engineering print PDF, suggest balloon number + dimension text + page
  + position pairs for the user to review, using a fallback strategy
  chain (PDF text layer → Unicode circled characters → computer-vision/
  OCR for scanned prints). Every suggestion is reviewable/editable/
  rejectable — never auto-accepted.
- **Tool import subsystem** — scans a directory tree for Excel files,
  extracts tool/part header data, de-duplicates via content hash,
  stores into the same unified database, with its own
  search/filter/report UI inside the main app (not a separate program).
- **Export layer** — multiple one-way, output-only formats generated
  from current database state:
  - Excel (general part export, and a dedicated balloon-pairings
    export with pairing + by-sequence sheets)
  - HTML ("coloring book" summary)
- **NC template generation pipeline** — a machine-type-keyed chain of
  text templates (C# analog of the prior `.JINJA` files, likely via
  Scriban or Fluid) rendered against parsed `Part` data to produce
  actual NC program text.
- **Mastercam .NET API integration** — direct data access from
  Mastercam files/session, and eventually a ribbon-launched in-app panel
  replacing the standalone app's separate launch step.

## Functional Requirements

### Core parsing & data
- FR1: Parse a Setup Sheet XML file into the typed data model, handling
  the real nested structure (repeated `NCFILE` siblings under root;
  `TOOL` appearing at multiple depths — direct `.Elements` vs. recursive
  `.Descendants` chosen deliberately per tag, never assumed).
- FR2: Detect and flag placeholder/default-report data.
- FR3: Persist parsed data to SQLite, supporting re-import/update of an
  existing part.
- FR4: Support per-field edit overrides independent of the source XML,
  each change recorded with a full audit entry (who, when, old value,
  new value).

### UI
- FR5: WPF UI for viewing and editing a part's data — metadata, NC
  programs, operations, tools.

### Balloon pairing
- FR6: Manual balloon pairing UI — associate a balloon number and type
  (Diameter/Height/Tool/Program) with a specific sequence + operation,
  with an optional note, stored per-part with full audit history.
- FR7: Store an associated engineering print PDF path per part.
- FR8 (future): Automatic balloon suggestion from an attached PDF, via
  a fallback strategy chain (text layer → Unicode circles → CV/OCR),
  presented as editable/rejectable suggestions, never auto-committed.

### Tool import
- FR9: Bulk-scan a directory tree for Excel files, extract tool/part
  header data, de-duplicate via content hash, store into the unified
  database, with a searchable/filterable/editable UI inside the main
  app.

### Export
- FR10: Excel export — general part/setup-sheet printable output,
  template-driven, one-way from database state.
- FR11: Excel export — dedicated balloon-pairings workbook (pairings
  sheet + grouped by-sequence sheet), matching the formatting approach
  already proven in the Python version.
- FR12: HTML "coloring book" export — one-way summary output, kept
  separate from Excel.
- FR13: NC program text generation via a machine-type-keyed template
  chain.

### Mastercam integration
- FR14 (future): Direct Mastercam .NET API data access, not solely
  dependent on a manually-run XML report.
- FR15 (future): Mastercam ribbon integration launching this app's UI
  (or a docked variant) from inside Mastercam itself.

## Non-Functional Requirements
- Layered architecture: parsing, persistence, balloon logic, tool
  import, and UI stay separated — no business logic embedded directly
  in UI event handlers.
- Validation and audit-trail logic lives on or near the domain model,
  not scattered across the codebase.
- A single database, not one per subsystem — this is a consolidation
  project as much as a rewrite; per-tool databases are an explicit
  anti-goal.
- Reasonable automated test coverage on parsing, validation, and
  balloon-pairing logic as the project matures past the initial
  data-model stage.

## Open Questions
- Exact set of placeholder strings/patterns to treat as "default
  report, not real data" — needs a small known list, expandable later.
- Which root-level and per-tool fields need to be user-editable vs.
  read-only/reference.
- Excel template ownership for the general part export — existing
  preferred layout to match, or does this app define its own? (The
  balloon-pairings export already has a proven layout from Python,
  worth carrying forward directly.)
- Exact mechanism for tool-import de-duplication and how imported tool
  data actually surfaces inside part editing (autocomplete? lookup
  reference only? something else?) — the Python version's importer runs
  standalone; this needs real integration design, not just a merged
  database.
- Templating library choice for FR13 (Scriban vs. Fluid vs. other).
- Whether the actual `.JINJA` template files themselves get
  ported/translated, or rewritten from scratch against the new model.
- Exact target .NET version compatible with the Mastercam API, once
  FR14/FR15 are scoped for real.
- PDF library choice for FR8 once that phase is reached (the Python
  stub planned pdfplumber + pdf2image + pytesseract + OpenCV — a C#
  equivalent stack needs its own research, not assumed from the Python
  plan).

## Learning Log
See `LEARNING_LOG.md` for a running session-by-session record of
concepts covered, for continuity across chats.