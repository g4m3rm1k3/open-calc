# Lesson F0.3: Live vs. Dead Code, Applied Fresh

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, mechanical tool proving that one specific real file, src/pages/ToolingPage_backup.tsx, is genuinely unreachable from this app's real entry point - searching by a component's real import path rather than an assumed binding name, since this project's own two files happen to declare an identically-named real export internally. Then a direct, real structural comparison between that dead file and the live page sitting right next to it: a real, more capable sorting design the live page never has, and one honest, real reason the dead file might never have been safe to ship as-is even if it had been wired in. The transferable problem: "is this code dead" and "was this code ready" are two different real questions, and confirming one never answers the other.

**What you need to know first:** Verifying a claim about a codebase by mechanically searching its real source instead of trusting a manifest, a name, or a filename; distinguishing a construct's own declared identity from an assumption about what that identity probably is.

## Terms used in this lesson

- **Live code** — Code reachable from a real, running entry point through an actual chain of real imports and calls - the only kind of code a real user's session can ever actually execute. Its presence in a source tree says nothing on its own; reachability is what makes it live.
- **Dead code** — Code that still exists in the real source tree but has no real import or call reaching it from any live entry point - provable only by a real, mechanical search confirming zero such callers exist anywhere, never assumed from a file's name, location, or how complete it looks.

## Objects and methods used

- **`ToolingPage`**
  - *What it is:* This app's real, live tool-inventory page component - the one this app's router actually renders when a user visits /tooling.
  - *Implementation:* `export function ToolingPage()`, defined in src/pages/ToolingPage.tsx:8, 347 lines total.
  - *Its use:* Imported by name at src/App.tsx:211 and rendered at the real routes.tooling route - this lesson's own tool confirms that real import mechanically rather than assuming it from the route's name.
  - *Type:* A function component, exported by its own module.
  - *Responsibility:* Fetch this app's real tool assemblies from the backend, let a user search and filter them by type, and render the result as one real HTML table.
  - *Depends on:* apiRequest/ENDPOINTS (src/utils/api.ts / src/utils/env.ts) for its real data; React Router's real routing tree to ever be reached at all.
  - *Connects to:* Rendered inside App.tsx's own real <Routes> block, behind the same real route-guard component this phase's first lesson already traced in full.
  - *Shape:* Takes no props; renders a real, complete page - a search box, a type filter, and one real table of tool assemblies, sorted only by the one call this lesson's second unit finds.

- **`ToolingPage_backup`**
  - *What it is:* A second, real, complete ToolingPage-shaped component sitting in this app's own source tree, never rendered by anything - the actual subject of this lesson.
  - *Implementation:* A function also named `ToolingPage` internally (`export function ToolingPage()`, defined in src/pages/ToolingPage_backup.tsx:124), 611 lines total - the file's own name is the only thing that says 'backup'; its real export never was renamed to match.
  - *Its use:* This lesson's own tool proves, mechanically, that zero real files import from this file's real path - the same real, repeated-shape source search this phase's two earlier tools already used, now applied to a component's own module path.
  - *Type:* A function component, exported by its own module - structurally identical in kind to ToolingPage, above.
  - *Responsibility:* Declared to do the identical job as ToolingPage - fetch, filter, sort, and render tool assemblies - but never actually runs for a real user, since nothing in this app's real routing tree ever reaches it.
  - *Depends on:* Nothing in this app depends on it, since nothing calls it - the reverse of what this field usually states.
  - *Connects to:* No real caller anywhere in src/, confirmed by this lesson's own tool; internally, its own real sort pipeline depends on mockToolAssemblies from src/data/mockData.ts, not this app's real, live API.
  - *Shape:* The same declared shape as ToolingPage - no props, one real page's worth of JSX - but its real internal sort implementation, this lesson's second unit shows, is genuinely more capable than what actually shipped.

- **`ColumnDef`**
  - *What it is:* A real TypeScript interface, declared only inside the dead file, describing one table column's complete shape as data instead of as hand-written JSX.
  - *Implementation:* `interface ColumnDef { id: string; label: string; sortable: boolean; width?: string; accessor: (item: ToolAssembly) => string | number; }`, defined at src/pages/ToolingPage_backup.tsx:61-67.
  - *Its use:* Seven real object literals, each satisfying this exact shape, make up the dead file's own real `columns` array - the actual mechanism its generic sort logic reads instead of one hand-written comparator per column.
  - *Type:* A TypeScript interface - a real, named compound type, not a class or a runtime value.
  - *Responsibility:* Guarantee every real column object in the `columns` array carries the same five real fields, so code reading any one of them (sort logic, header rendering) never has to check whether a given column happens to have an `accessor` or a `sortable` flag.
  - *Depends on:* ToolAssembly, the real domain type its own `accessor` field's function signature is written against.
  - *Connects to:* Every one of the seven real objects in the dead file's `columns: ColumnDef[]` array; that array is read, in turn, by the dead file's own real sort logic, shown in this lesson's second unit.
  - *Shape:* Not a value itself - a compile-time-only shape every real column object must satisfy: two real strings (`id`, `label`), one real boolean (`sortable`), one real optional string (`width`), and one real function taking a `ToolAssembly` and returning either a `string` or a `number`.

## Concept Unit: Confirming Dead Code Mechanically, by Import Path Not a Guessed Name

### The Problem

A file named ToolingPage_backup.tsx sits in src/pages/, right next to the real, live ToolingPage.tsx this app's router actually serves at /tooling. A name like "_backup" reads as a strong hint the file is dead - but a name is not proof, the same standard this phase already applied to a route's own JSX shape and a package's own import shape now applies to a component's own filename.

Before reading on:

- Both real files declare a component. Before writing any search for 'is this file imported anywhere' - what's the first thing worth checking about each file's own real, declared export name?
- If a search for 'is ToolingPage_backup imported anywhere' looked only for that exact string inside a real import statement's braces, what real, different way could this app's own source reference that file's real code without ever typing the string 'ToolingPage_backup' as an imported name?

### Project Change

- **Reference Source:** src/pages/ToolingPage_backup.tsx:124 (`export function ToolingPage() {`) and src/pages/ToolingPage.tsx:8 (`export function ToolingPage() {`), and src/App.tsx:211, all read verbatim this session.
- **Files affected:** `verification/frontend-phase-00/lab_verify_dead_component.py` (new)
- **Change type:** add
- **Location:** New file, alongside this phase's two earlier real tools, in the same verification/frontend-phase-00/ folder.
- **Dependencies:** Python's standard library re and pathlib modules only.

Both ToolingPage.tsx and ToolingPage_backup.tsx declare a real, exported function named exactly `ToolingPage` - the file that reads as a "backup" by its own filename never actually renamed its own real export to match. A search for a real import binding literally spelled `ToolingPage_backup` would search for a string this codebase has no real reason to ever contain; what this unit actually needs to know is which real file path a real import statement's own `from` clause actually names.

### The New Code

New code, typed into a new throwaway file - the same real pattern this phase's two earlier tools used, now searching by a real import path instead of an assumed binding name:

**File:** `verification/frontend-phase-00/lab_verify_dead_component.py` (new)

```python
import re
from pathlib import Path


def find_import(module_name):
    pattern = re.compile(r"from\s+['\"][^'\"]*\b" + re.escape(module_name) + r"\b['\"]")
    for path in sorted(Path("src").rglob("*.ts*")):
        text = path.read_text(encoding="utf-8")
        for line_number, line in enumerate(text.splitlines(), start=1):
            if pattern.search(line):
                return (path, line_number)
    return None


for name in ["ToolingPage", "ToolingPage_backup"]:
    result = find_import(name)
    if result:
        print(f"{name}: real import found at {result[0].as_posix()}:{result[1]}")
    else:
        print(f"{name}: zero real imports found in src/")
```

### Mechanical Walkthrough

- `def find_import(module_name):` — Declares a real, reusable function taking one real module name to search for, returning either the first real match found or `None` (basic Python).
- `pattern = re.compile(r"from\s+['\"][^'\"]*\b" + re.escape(module_name) + r"\b['\"]")` — Builds a real regex matching a real `from '...'`/`from \"...\"` clause whose quoted path ends in the exact real module name, with a real word-boundary immediately before the closing quote - deliberately searching the real import *path*, not an assumed binding name inside braces, because this project's own two real files both declare the identical export name `ToolingPage` internally; searching for `ToolingPage_backup` as a binding name would search for a string this codebase never has any real reason to contain.
- `for path in sorted(Path("src").rglob("*.ts*")):` — The same real, recursive glob this phase's own earlier tool already used (basic `pathlib`), sorted so the real search order stays the same every real run.
- `text = path.read_text(encoding="utf-8"); for line_number, line in enumerate(text.splitlines(), start=1):` — Reads each real file and walks it line by line, tracking the real line number a match happens to appear on (basic Python).
- `if pattern.search(line): return (path, line_number)` — Returns the first real match found - this unit's real question is only whether at least one real import exists, the same real "stop at the first match" reasoning already used earlier this phase.
- `for name in ["ToolingPage", "ToolingPage_backup"]:` — Runs the identical real search twice, once per real file, so the live and dead cases are answered by the exact same real method, side by side.
- `if result: print(f"{name}: real import found at {result[0].as_posix()}:{result[1]}") else: print(f"{name}: zero real imports found in src/")` — Reports either the real file and line where a real import actually lives, or an honest "zero real imports found" - produced by a real, reusable tool rather than a raw, one-off search already run earlier this session.

### CS Lens

A real instance of resolving by canonical identity, never by an assumed label - the same general shape recurs constantly: a symlink's own real target path is what matters, never its own filename; a database foreign key references a real row's real primary key, never that row's own display name; a linker resolving a compiled program's real symbol table, never a source file's own filename.

### SE Lens

The real alternative not chosen: searching by binding name - already shown wrong by this project's own real, coincidental fact that both files export something named identically. Real, honest limitation of this exact tool: it only recognizes an import written with a literal, static string path in its `from` clause - a real, dynamic `import()` expression building a path at runtime would be invisible to this exact regex (none exists for this specific file, confirmed by the broader, phase-level search this session already ran across all of src/ and electron/) - the same honest limitation already named for this phase's two earlier tools.

### Commands needed

- `python verification/frontend-phase-00/lab_verify_dead_component.py` — Run from the manufacturing-platform repository root, same as this phase's earlier tools, so the relative path to src/ resolves correctly.

### Verification

```text
ToolingPage: real import found at src/App.tsx:211
ToolingPage_backup: zero real imports found in src/
```

Full saved run: `verification/frontend-phase-00/lab_verify_dead_component_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: What Going Dead Actually Cost - and What It Never Finished

### The Problem

The unit above proved ToolingPage_backup.tsx is genuinely unreachable - but "unreachable" says nothing about whether it was worth reaching. This unit compares the two files' real sorting capability directly, then finds one honest, real reason the dead file might never have been safe to ship as-is, even if it had been wired in.

Before reading on:

- The live ToolingPage.tsx renders a real table of tool assemblies. Before reading further: would you expect its columns to support click-to-sort, or a fixed row order - and why might a real team ship either one on purpose?
- A real, unfinished feature and a real, finished-but-unwired feature would both currently look like 'dead code that does something.' What's the one, real, mechanical difference in the code itself that would tell those two cases apart?

### Project Change

- **Reference Source:** src/pages/ToolingPage.tsx:18-24 and src/pages/ToolingPage_backup.tsx:59-118 and :128-187, all read verbatim this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - both existing files, nothing added or changed.
- **Dependencies:** None beyond the real repository already checked out on disk.

The live page's entire real sorting capability is one call, shown first below. The dead file's own real sorting capability is a small, generic system - a declared column shape, seven real columns satisfying it, and one real, shared sort function reading whichever column is currently selected - shown second.

### The Updated Project

**File:** `src/pages/ToolingPage.tsx` (already exists — read-only, nothing to type)

```typescript
const toolTypes = useMemo(() => {
    const types = new Set<string>();
    toolAssemblies.forEach(ta => {
        if (ta.toolType) types.add(ta.toolType);
    });
    return Array.from(types).sort();
}, [toolAssemblies]);
```

**File:** `src/pages/ToolingPage_backup.tsx` (already exists — read-only, nothing to type)

```typescript
type SortDirection = 'asc' | 'desc' | null;

interface ColumnDef {
    id: string;
    label: string;
    sortable: boolean;
    width?: string;
    accessor: (item: ToolAssembly) => string | number;
}

const columns: ColumnDef[] = [
    { id: 'toolNumber', label: 'T#', sortable: true, width: 'w-16', accessor: (item) => parseInt(item.id.replace('TA', '')) },
    { id: 'assemblyCode', label: 'Assembly Code', sortable: true, width: 'w-40', accessor: (item) => item.assemblyCode },
    { id: 'toolName', label: 'Tool', sortable: true, accessor: (item) => item.tool.name },
    { id: 'type', label: 'Type', sortable: true, width: 'w-28', accessor: (item) => item.tool.type },
    { id: 'diameter', label: 'Diameter', sortable: true, width: 'w-24', accessor: (item) => item.tool.diameter },
    { id: 'gageLength', label: 'Gage Length', sortable: true, width: 'w-28', accessor: (item) => item.gageLength },
    { id: 'holder', label: 'Holder', sortable: true, width: 'w-32', accessor: (item) => item.holder.taper },
];

const [toolAssemblies, setToolAssemblies] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [typeFilter, setTypeFilter] = useState<string>('all');
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<SortDirection>(null);
const [selectedTool, setSelectedTool] = useState<ToolAssembly | null>(null);

const processedTools = useMemo(() => {
    let result = [...mockToolAssemblies];

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter((tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.assemblyCode.toLowerCase().includes(query) ||
            tool.tool.name.toLowerCase().includes(query) ||
            tool.tool.toolCode.toLowerCase().includes(query)
        );
    }

    if (typeFilter !== 'all') {
        result = result.filter((tool) => tool.tool.type === typeFilter);
    }

    if (sortColumn && sortDirection) {
        const column = columns.find((c) => c.id === sortColumn);
        if (column) {
            result.sort((a, b) => {
                const aVal = column.accessor(a);
                const bVal = column.accessor(b);

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                return sortDirection === 'asc'
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            });
        }
    }

    return result;
}, [searchQuery, typeFilter, sortColumn, sortDirection]);
```

### Mechanical Walkthrough

- `const toolTypes = useMemo(() => { ... return Array.from(types).sort(); }, [toolAssemblies]);` — The live page's only real `.sort()` call anywhere in its 347 lines - and it sorts the real, small list of distinct tool *types* for a filter dropdown's own option list, never the real table rows themselves. A user visiting the live page has no real way to sort the table by any column.
- `interface ColumnDef { id: string; label: string; sortable: boolean; width?: string; accessor: (item: ToolAssembly) => string | number; }` — A real TypeScript interface describing one column's complete shape as data, not as hand-written JSX - each real column becomes one real object satisfying this shape instead of one hand-written table header element.
- `const columns: ColumnDef[] = [ ... 7 real entries ... ];` — Seven real, concrete columns, every one carrying `sortable: true`; each one's own `accessor` is a real function reading one real field off a `ToolAssembly` - the actual real mechanism a shared sort function reuses across every column instead of one hand-written comparator per column.
- `const [toolAssemblies, setToolAssemblies] = useState<any[]>([]); const [loading, ...]; const [error, ...]; const [searchQuery, ...]; const [typeFilter, ...]; const [selectedTool, ...];` — Six more real state declarations this file also carries - `loading`/`error` for a real fetch this unit doesn't trace, `searchQuery`/`typeFilter` for a real search box and type dropdown (the same real idea as the live page's own `toolTypeFilter`), `selectedTool` for a real detail view - none of them this unit's own focus, but real, declared, and referenced below in `processedTools`, so shown here in full rather than left implied.
- `const [sortColumn, setSortColumn] = useState<string | null>(null); const [sortDirection, setSortDirection] = useState<SortDirection>(null);` — Real state the live page has no equivalent of at all; `SortDirection`'s own real `'asc' | 'desc' | null` union gives "no sort applied yet" its own real, named value instead of leaving that case implicit.
- `if (searchQuery) { ... } if (typeFilter !== 'all') { ... }` — Two real, ordinary filter steps - by free-text search, then by exact type match - real and functionally unremarkable; shown here only because they run, in real sequence, before the sort step below, inside the same real `useMemo`.
- `let result = [...mockToolAssemblies];` — The real, honest counter-finding: this whole filter/sort pipeline starts from `mockToolAssemblies`, a real, hardcoded array imported from src/data/mockData.ts - never from `toolAssemblies`, the real state declared one line above it and never referenced again anywhere else in this file (confirmed by this unit's own verification, below). Even if this component had been wired into a real route, it would have rendered fake tool data, not this app's real, API-fetched inventory.
- `if (sortColumn && sortDirection) { const column = columns.find((c) => c.id === sortColumn); if (column) { result.sort((a, b) => { ... }); } }` — The real, working sort implementation the live page never has: looks up which real `ColumnDef` the current `sortColumn` id names, then sorts using that column's own real `accessor`, branching on whether the two real compared values are numbers (subtraction) or strings (`localeCompare`) - one real, generic sort that works for any of the seven real columns without a separate comparator written for each one.

### CS Lens

Names a real, general pattern - a declarative, data-driven table configuration (an array of column descriptors, each carrying its own real accessor) instead of one hand-written comparator per column. Several unrelated real recurrences: a database query planner choosing a comparison strategy from a column's own declared type; a spreadsheet application's own generic column-sort feature, reused identically across every column a user adds; any ORM's declarative field-mapping list, where one shared engine reads a list of field descriptors instead of one hand-written getter per field.

### SE Lens

The real alternative not chosen: shipping the live page's simpler, sort-less table instead of finishing and wiring in the more capable, column-configurable version. Real, honest tradeoff: the sorting capability itself - `columns`, `sortColumn`, `sortDirection` - is real and appears internally consistent, but it was never finished being connected to this app's real data in the first place, since its own `processedTools` reads `mockToolAssemblies`, never the real `toolAssemblies` state sitting unused one line above it. One real column even documents this half-finished state honestly, in its own comment: `toolNumber`'s real `accessor`, `(item) => parseInt(item.id.replace('TA', ''))`, is marked `// Demo: derive from ID` by whoever wrote it. Dead code proven unreachable by the unit above answers only "does this run"; it says nothing about "was this ready to run" - two real, independent questions, and this file answers the second one honestly by never fully answering it.

### Commands needed

- `grep -n "toolAssemblies" src/pages/ToolingPage_backup.tsx` — Run from the manufacturing-platform repository root; confirms, mechanically, that the real toolAssemblies state - not mockToolAssemblies - is referenced exactly once in this file: its own declaration, and nowhere else.

### Verification

```text
128:    const [toolAssemblies, setToolAssemblies] = useState<any[]>([]);
```

### Connection to the previous unit

The unit above proved this file is unreachable; this unit read what it would have done if it had been reachable - a real, genuinely more capable sort than the live page ships, sitting on top of a real, unfinished connection to this app's actual data.

## Connect the pieces

One real filename, ToolingPage_backup.tsx, answered two real, different questions. First: is it reachable - confirmed no, by searching real import paths for the real name both files actually declare internally, rather than trusting the filename's own "_backup" suffix. Second: was it worth reaching - a real, generic, column-configurable sort the live page never shipped, undercut by one real, honest fact the same file's own code admits: its whole pipeline reads from `mockToolAssemblies`, never the real `toolAssemblies` state declared and abandoned one line above it, confirmed by a direct real search finding that state referenced exactly once, its own declaration.

**Next lesson:** A citation-only synthesis closing this phase - what this frontend is still hiding, grounded only in real findings already surfaced across this phase's first three lessons and the fuller investigation behind them, the same shape as the backend curriculum's own closing orientation lesson.