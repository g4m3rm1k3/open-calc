#!/usr/bin/env python3
"""
Reads tmp/viz-move-log.json and fixes all import statements in src/
that still reference old viz file locations.

Usage: python3 scripts/fix-viz-imports.py [--dry-run]
"""
import json, re, sys
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
LOG     = ROOT / 'tmp' / 'viz-move-log.json'
DRY_RUN = '--dry-run' in sys.argv

moves = json.loads(LOG.read_text())

# Build: old_rel_path → new_rel_path  (first destination only)
# Both relative to ROOT
old_to_new = {}
for entry in moves:
    src  = entry['src']                  # e.g. src/components/viz/react/AtomViewer.jsx
    dest = entry['destinations'][0]      # e.g. src/courses/chemistry/viz/AtomViewer.jsx
    old_to_new[src] = dest

# Scan all JS/JSX source files (excluding courses viz files themselves and node_modules)
scan_dirs = [ROOT / 'src']
files_changed = 0
imports_fixed = 0

for scan_dir in scan_dirs:
    for f in scan_dir.rglob('*'):
        if f.suffix not in ('.js', '.jsx', '.ts', '.tsx'):
            continue
        if 'node_modules' in f.parts:
            continue
        # Skip the viz files we just moved (they're the new canonical location)
        if '/courses/' in str(f) and '/viz/' in str(f):
            continue

        text = f.read_text(encoding='utf-8', errors='ignore')
        new_text = text

        for old_src, new_dest in old_to_new.items():
            # old_src is relative to ROOT: src/components/viz/react/AtomViewer.jsx
            # We need to find any import that resolves to this file
            # Strategy: look for the filename in import strings and verify path matches

            stem = Path(old_src).stem   # e.g. AtomViewer

            # Match import/from strings containing this filename
            pattern = re.compile(
                r"""(from\s+|import\s+)(['"])((?:[^'"]*/)""" + re.escape(stem) + r"""(?:\.jsx?)?['"])""",
                re.MULTILINE
            )

            for m in pattern.finditer(new_text):
                import_path = m.group(3)   # the path string value
                # Resolve relative to the file's directory
                try:
                    resolved = (f.parent / import_path).resolve()
                    old_abs   = (ROOT / old_src).resolve()
                    if resolved == old_abs:
                        # Compute new relative path from f's directory to new_dest
                        new_abs = (ROOT / new_dest).resolve()
                        new_rel = new_abs.relative_to(f.parent.resolve())
                        new_rel_str = './' + str(new_rel).replace('\\', '/')
                        if not new_rel_str.startswith('./..'):
                            new_rel_str = new_rel_str
                        # Also handle ../ paths
                        new_rel_str = str(Path(new_rel_str))
                        if not new_rel_str.startswith('.'):
                            new_rel_str = './' + new_rel_str

                        old_full = m.group(1) + m.group(2) + import_path + m.group(2)[-1] if False else m.group(0)
                        new_full = m.group(1) + m.group(2) + new_rel_str
                        # Preserve the closing quote
                        new_full = new_full + m.group(2)[-1]

                        new_text = new_text.replace(m.group(0), new_full, 1)
                        imports_fixed += 1
                except Exception:
                    pass

        if new_text != text:
            files_changed += 1
            if not DRY_RUN:
                f.write_text(new_text, encoding='utf-8')
                print(f"  Fixed: {f.relative_to(ROOT)}")
            else:
                print(f"  Would fix: {f.relative_to(ROOT)}")

print(f"\n{'DRY RUN — ' if DRY_RUN else ''}Fixed {imports_fixed} imports across {files_changed} files")
