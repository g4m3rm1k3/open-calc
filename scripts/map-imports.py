#!/usr/bin/env python3
"""
map-imports.py

Parse src/content/index.js → follow imports → extract lesson FILE PATHS.
No slug matching. File paths come directly from import statements.

Output: JSON array of {course, chN, chSlug, lN, file}
Usage: python3 scripts/map-imports.py > /tmp/curriculum-files.json
"""
import re, sys, json
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src' / 'content'

def read(p):
    try:    return Path(p).read_text(encoding='utf-8', errors='ignore')
    except: return ''

# ── Parse a folder's index.js → ordered list of chapters ─────────────────────
# Returns: [(ch_slug, [abs_file_path, ...]), ...]

def parse_folder(folder):
    """Given a content folder, return ordered [(slug, [file, ...]), ...] chapters."""
    text = read(folder / 'index.js')
    if not text:
        sys.stderr.write(f"WARN: missing index.js in {folder}\n")
        return []

    # Build import map: varName → what it points to
    file_imp = {}   # varName → Path (lesson .js file)
    sub_imp  = {}   # varName → sub-folder path (index.js imports)

    for m in re.finditer(r"import\s+([\s\S]*?)\s+from\s+['\"](\./[^'\"]+)['\"]", text):
        import_clause, rel = m.group(1).strip(), m.group(2)
        # Collect all local variable names from the import clause
        # Handles: default, { X }, { X as Y }, default, { X as Y }, etc.
        local_vars = []
        # Remove braces block and process aliases
        brace_m = re.search(r'\{([^}]+)\}', import_clause)
        if brace_m:
            named = brace_m.group(1)
            for alias_m in re.finditer(r'\w+\s+as\s+(\w+)', named):
                local_vars.append(alias_m.group(1))
            # Non-aliased named imports
            no_alias = re.sub(r'\w+\s+as\s+\w+', '', named)
            for wm in re.finditer(r'\b(\w+)\b', no_alias):
                local_vars.append(wm.group(1))
            # Default import (before the comma + brace)
            before_brace = import_clause[:brace_m.start()].replace(',', '').strip()
            if re.match(r'^\w+$', before_brace):
                local_vars.insert(0, before_brace)
        else:
            # Just a default import or namespace import
            dm = re.match(r'^(\w+)$', import_clause)
            if dm:
                local_vars.append(dm.group(1))

        for var in local_vars:
            if not var:
                continue
            if rel.endswith('/index.js') or ('/' in rel and not rel.endswith('.js')):
                sub_imp[var] = folder / re.sub(r'/index\.js$', '', rel.lstrip('./'))
            elif rel.endswith('.js'):
                file_imp[var] = folder / rel.lstrip('./')

    # ── Sub-folder pattern (physics-1 style) ─────────────────────────────────
    # All imports are sub-index.js → recurse into each sub-folder
    if sub_imp and not file_imp:
        return _parse_subfolder_index(folder, text, sub_imp)

    # ── Flat folder pattern ───────────────────────────────────────────────────
    return _parse_flat_index(folder, text, file_imp)


def _vars_to_files(var_list, file_imp, folder):
    """Convert a list of variable names to absolute file paths."""
    files = []
    for v in var_list:
        v = v.strip()
        if not v or not re.match(r'^\w+$', v):
            continue
        if v in file_imp:
            files.append(str(file_imp[v]))
        else:
            sys.stderr.write(f"  WARN: var '{v}' not in imports of {folder}\n")
    return files


def _parse_subfolder_index(folder, text, sub_imp):
    """physics-1 pattern: imports are all sub-index.js files."""
    # export default [CH0, CH1, ...]  or  export default CH0
    exp_m = re.search(r'export\s+default\s+\[([^\]]+)\]', text, re.DOTALL)
    if exp_m:
        vars_ = [v.strip() for v in exp_m.group(1).split(',') if v.strip()]
    else:
        # export default VAR (single)
        exp_m = re.search(r'export\s+default\s+(\w+)', text)
        vars_ = [exp_m.group(1)] if exp_m else list(sub_imp.keys())

    chapters = []
    for v in vars_:
        if v in sub_imp:
            chapters.extend(parse_folder(sub_imp[v]))
    return chapters


def _parse_flat_index(folder, text, file_imp):
    """Flat folder: all lesson files are in this folder."""

    # Extract named chapter consts: const VARNAME = { ... lessons: [...] ... }
    # We use a state-machine approach to handle multi-line blocks
    named_chapters = {}  # varName → (slug, [file_path, ...])

    # Find all `const VAR = {` blocks by scanning for pattern
    # Strategy: find `lessons: [...]` arrays and work outward to find slug
    # Use a simpler approach: find each `const VAR = {` and extract slug + lessons
    _extract_named_consts(text, file_imp, folder, named_chapters)

    # Now determine chapter order from export default
    # Pattern A: export default { ... } — single chapter object inline
    # Pattern B: export default [VAR, VAR, ...] — named vars
    # Pattern C: export default [\n  {...}, ...] — inline array of objects
    # Pattern D: export default VAR — single named var

    exp_text = _get_export_default(text)
    if not exp_text:
        # Fallback: return named chapters in definition order
        return list(named_chapters.values())

    exp_text = exp_text.strip()

    # Pattern D: single var (not array, not object)
    if re.match(r'^\w+$', exp_text):
        var = exp_text
        if var in named_chapters:
            return [named_chapters[var]]
        return []

    # Pattern A: single object { ... }
    if exp_text.startswith('{'):
        slug = _field(exp_text, 'slug') or _field(exp_text, 'title') or 'chapter-1'
        lessons_m = re.search(r'lessons:\s*\[([^\]]+)\]', exp_text, re.DOTALL)
        if lessons_m:
            arr_text = re.sub(r'//[^\n]*', '', lessons_m.group(1))
            vars_ = [v.strip() for v in arr_text.split(',')]
            return [(slug, _vars_to_files(vars_, file_imp, folder))]
        return []

    # Pattern B/C: array [...]
    if exp_text.startswith('['):
        inner = exp_text[1:exp_text.rfind(']')]
        # Check if items are variable names (Pattern B) or inline objects (Pattern C)
        # If we see a { in the inner content, it's likely inline objects
        if '{' not in inner:
            # Pattern B: named vars
            vars_ = [v.strip() for v in inner.split(',') if v.strip()]
            chapters = []
            for v in vars_:
                if v in named_chapters:
                    chapters.append(named_chapters[v])
                else:
                    sys.stderr.write(f"  WARN: export var '{v}' not found in {folder}\n")
            return chapters
        else:
            # Pattern C: inline objects — find all lessons: [...] in order
            return _parse_inline_array(inner, file_imp, folder)

    # Fallback: named chapters in order
    return list(named_chapters.values())


def _extract_named_consts(text, file_imp, folder, out):
    """Extract named chapter const blocks → out[varName] = (slug, [files])."""
    # Match: const VARNAME = { ... } (possibly multi-line)
    # Use brace counting to find the end of each object
    for m in re.finditer(r'const\s+(\w+)\s*=\s*\{', text):
        var = m.group(1)
        start = m.end() - 1  # position of opening {
        # Count braces to find closing }
        depth = 0
        end = start
        for i in range(start, len(text)):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        body = text[start:end]
        if 'lessons' not in body:
            continue
        slug = _field(body, 'slug') or _field(body, 'title') or var.lower()
        lessons_m = re.search(r'lessons:\s*\[([^\]]*)\]', body, re.DOTALL)
        if not lessons_m:
            continue
        arr_text = re.sub(r'//[^\n]*', '', lessons_m.group(1))  # strip // comments
        vars_ = [v.strip() for v in arr_text.split(',') if v.strip()]
        files = _vars_to_files(vars_, file_imp, folder)
        out[var] = (slug, files)


def _parse_inline_array(inner, file_imp, folder):
    """Parse array of inline chapter objects: [{lessons:[...]}, ...]"""
    chapters = []
    # Find each { ... } block in the inner content
    depth = 0
    start = None
    for i, ch in enumerate(inner):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                block = inner[start:i+1]
                slug = _field(block, 'slug') or _field(block, 'title') or f'chapter-{len(chapters)+1}'
                lessons_m = re.search(r'lessons:\s*\[([^\]]*)\]', block, re.DOTALL)
                if lessons_m:
                    arr_text = re.sub(r'//[^\n]*', '', lessons_m.group(1))
                    vars_ = [v.strip() for v in arr_text.split(',') if v.strip()]
                    files = _vars_to_files(vars_, file_imp, folder)
                    chapters.append((slug, files))
                start = None
    return chapters


def _get_export_default(text):
    """Extract the value after 'export default' (may be multiline)."""
    m = re.search(r'export\s+default\s+', text)
    if not m:
        return None
    rest = text[m.end():]
    # If starts with { or [, count brackets to find end
    if rest and rest[0] in '{[':
        open_, close_ = rest[0], '}' if rest[0] == '{' else ']'
        depth = 0
        for i, ch in enumerate(rest):
            if ch == open_:
                depth += 1
            elif ch == close_:
                depth -= 1
                if depth == 0:
                    return rest[:i+1]
        return rest
    # Otherwise it's a variable name or simple expr
    m2 = re.match(r'(\w+)', rest)
    return m2.group(1) if m2 else None


def _field(text, key):
    m = re.search(rf"^\s*{key}:\s*['\"]([^'\"]+)['\"]", text, re.MULTILINE)
    return m.group(1) if m else None


# ── Parse top-level index.js to get (folders, course) order ──────────────────

def parse_curriculum():
    text = read(CONTENT / 'index.js')

    # 1. var → folder  (from import statements)
    var_folder = {}
    for m in re.finditer(
        r"import\s+(\w+)\s+from\s+['\"]\.\/([^'\"\/]+)\/index\.js['\"]",
        text
    ):
        var_folder[m.group(1)] = m.group(2)

    # 2. curriculum const → (course, [folder, ...])
    #    Handles both: var.map(...) and [var1, var2].map(...)
    const_course = {}   # constName → (course, [folder])
    for m in re.finditer(
        r'const\s+(\w+)\s*=\s*([\s\S]*?)\.map\s*\(\s*\(ch\)\s*=>\s*\(',
        text
    ):
        const_name = m.group(1)
        expr = m.group(2).strip()
        # Find course in the map() body
        rest = text[m.end():]
        cm = re.search(r'course:\s*["\']([^"\']+)["\']', rest[:200])
        if not cm:
            continue
        course = cm.group(1)

        if expr.startswith('['):
            inner = expr[1:expr.rfind(']')]
            folders = []
            for item in re.split(r',\s*', inner):
                item = item.strip().lstrip('.')
                if item in var_folder:
                    folders.append(var_folder[item])
        elif expr in var_folder:
            folders = [var_folder[expr]]
        else:
            continue
        const_course[const_name] = (course, folders)

    # 3. CURRICULUM order: export const CURRICULUM = [...CONST, ...]
    curr_m = re.search(r'export const CURRICULUM\s*=\s*\[([\s\S]*?)\];', text)
    if not curr_m:
        sys.stderr.write("ERROR: could not find CURRICULUM array\n")
        sys.exit(1)

    order = []  # list of (course, folder) in CURRICULUM order
    for m in re.finditer(r'\.\.\.([\w]+)', curr_m.group(1)):
        cname = m.group(1)
        if cname in const_course:
            course, folders = const_course[cname]
            for folder in folders:
                order.append((course, folder))

    return order


# ── Main ──────────────────────────────────────────────────────────────────────

curriculum_order = parse_curriculum()

out = []
course_ch_n = {}  # course → chapter counter

for course, folder_name in curriculum_order:
    folder = CONTENT / folder_name
    chapters = parse_folder(folder)

    for (ch_slug, files) in chapters:
        course_ch_n[course] = course_ch_n.get(course, 0) + 1
        ch_n = course_ch_n[course]

        for l_n, filepath in enumerate(files, start=1):
            out.append({
                'course':  course,
                'chN':     ch_n,
                'chSlug':  ch_slug,
                'lN':      l_n,
                'file':    filepath,
            })

missing = sum(1 for x in out if not x['file'])
courses  = len(set(x['course'] for x in out))
sys.stderr.write(f"{courses} courses | {len(out)} lessons | {missing} missing files\n")

print(json.dumps(out, indent=2))
