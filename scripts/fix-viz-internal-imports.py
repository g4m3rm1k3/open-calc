#!/usr/bin/env python3
"""
Fix broken internal imports inside moved viz files.

Strategy:
 1. For each destination file in the move log, scan its relative imports.
 2. Try to resolve each import from the original (src) location.
 3. If the file exists there, compute new relative path from dest.
 4. If the file no longer exists there (it was also moved), look it up by
    stem in the move log and use that destination.
"""
import json, os, re, sys
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
LOG     = ROOT / 'tmp' / 'viz-move-log.json'
DRY_RUN = '--dry-run' in sys.argv

moves = json.loads(LOG.read_text())

# Build: old_src_abs → first_dest_abs  (for resolving moved dependencies)
moved_src_to_dest = {}
# Build: stem → first_dest_abs  (for resolving by filename stem)
moved_stem_to_dest = {}
for entry in moves:
    old_src_abs = (ROOT / entry['src']).resolve()
    first_dest  = (ROOT / entry['destinations'][0]).resolve()
    moved_src_to_dest[old_src_abs] = first_dest
    moved_stem_to_dest[Path(entry['src']).stem] = first_dest

# Build: new_dest_abs → old_src_abs
dest_to_src = {}
for entry in moves:
    old_src_abs = (ROOT / entry['src']).resolve()
    for dest in entry['destinations']:
        dest_abs = (ROOT / dest).resolve()
        dest_to_src[dest_abs] = old_src_abs

IMPORT_RE = re.compile(r"""(from\s+|import\s+)(['"])(\.\.?/[^'"]+)(['"])""")

EXTENSIONS = ('', '.jsx', '.js', '.tsx', '.ts')

def resolve_import(from_dir: Path, import_path: str):
    """
    Try to resolve import_path from from_dir.
    Returns the absolute Path of the target file, or None.
    """
    for ext in EXTENSIONS:
        candidate = (from_dir / (import_path + ext)).resolve()
        if candidate.exists():
            return candidate
    # directory/index
    for ext in EXTENSIONS[1:]:
        candidate = (from_dir / import_path / ('index' + ext)).resolve()
        if candidate.exists():
            return candidate
    return None

def find_moved_target(from_dir: Path, import_path: str):
    """
    When the imported file no longer exists at old path (it was also moved),
    find it by: resolve from old dir → look in moved_src_to_dest.
    Falls back to stem lookup.
    """
    # Try full path match in moved_src_to_dest
    for ext in EXTENSIONS:
        candidate = (from_dir / (import_path + ext)).resolve()
        if candidate in moved_src_to_dest:
            return moved_src_to_dest[candidate]
    # Fall back: stem-based lookup
    stem = Path(import_path).stem
    if stem in moved_stem_to_dest:
        return moved_stem_to_dest[stem]
    return None

def make_rel(target_abs: Path, from_file_abs: Path, had_ext: bool) -> str:
    """Compute relative path from from_file_abs's directory to target_abs."""
    rel = os.path.relpath(target_abs, from_file_abs.parent)
    rel = rel.replace('\\', '/')
    if not rel.startswith('.'):
        rel = './' + rel
    if not had_ext:
        for ext in EXTENSIONS[1:]:
            if rel.endswith(ext):
                rel = rel[:-len(ext)]
                break
    return rel

files_changed = 0
imports_fixed = 0

for dest_abs, old_src_abs in sorted(dest_to_src.items()):
    if not dest_abs.exists():
        continue

    text = dest_abs.read_text(encoding='utf-8', errors='ignore')
    new_text = text

    for m in IMPORT_RE.finditer(text):
        import_path = m.group(3)
        had_ext = any(import_path.endswith(e) for e in EXTENSIONS[1:])

        # Try resolving from OLD location
        target = resolve_import(old_src_abs.parent, import_path)

        if target is None:
            # File no longer at old location — check if it was moved
            target = find_moved_target(old_src_abs.parent, import_path)

        if target is None:
            continue  # can't locate target, skip

        # Check if this import is already correct from the new (dest) location
        current_target = resolve_import(dest_abs.parent, import_path)
        if current_target == target:
            continue  # already points to the right place

        new_rel = make_rel(target, dest_abs, had_ext)
        old_full = m.group(0)
        new_full = m.group(1) + m.group(2) + new_rel + m.group(4)

        if old_full != new_full:
            new_text = new_text.replace(old_full, new_full, 1)
            imports_fixed += 1
            if DRY_RUN:
                print(f"  {dest_abs.relative_to(ROOT)}")
                print(f"    {import_path!r} → {new_rel!r}")

    if new_text != text:
        files_changed += 1
        if not DRY_RUN:
            dest_abs.write_text(new_text, encoding='utf-8')
            print(f"Fixed: {dest_abs.relative_to(ROOT)}")

print(f"\n{'DRY RUN — ' if DRY_RUN else ''}Fixed {imports_fixed} imports across {files_changed} files")
