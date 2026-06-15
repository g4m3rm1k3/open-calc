#!/usr/bin/env python3
"""
organize-viz.py

For every .jsx in src/components/viz/, search every .js file under src/content/.
If the viz filename stem (e.g. "SecantToTangent") appears in a course's lesson file,
that course claims the viz.

  One course  → move   to src/content/{course}/viz/{Name}.jsx
  Many courses → copy  to src/content/{course}/viz/{Name}.jsx for each

Orphans (no content file references them) are listed for manual review.
Missing (content references a name with no matching .jsx) are listed as broken.

Usage:
  python3 scripts/organize-viz.py          # dry run — shows what would happen
  python3 scripts/organize-viz.py --execute # actually moves/copies files
"""

import os
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIZ_ROOT = ROOT / "src" / "components" / "viz"
CONTENT_ROOT = ROOT / "src" / "content"

EXECUTE = "--execute" in sys.argv

# ── 1. Collect all viz .jsx files ────────────────────────────────────────────
viz_files: dict[str, Path] = {}  # stem → absolute path
for path in VIZ_ROOT.rglob("*.jsx"):
    stem = path.stem
    if stem in viz_files:
        print(f"⚠️  Duplicate stem '{stem}': {viz_files[stem]} vs {path} — keeping first")
    else:
        viz_files[stem] = path

# ── 2. Collect all content .js files, grouped by course ──────────────────────
# Course = the immediate subdirectory of src/content/ (skip root-level .js files)
course_files: dict[str, list[Path]] = defaultdict(list)  # course → [lesson paths]
for path in CONTENT_ROOT.rglob("*.js"):
    rel = path.relative_to(CONTENT_ROOT)
    parts = rel.parts
    if len(parts) < 2:
        continue  # root-level file, not in a course folder
    course = parts[0]
    course_files[course].append(path)

# ── 3. Build map: viz_stem → set of courses that reference it ────────────────
viz_courses: dict[str, set[str]] = defaultdict(set)
for course, files in course_files.items():
    for fpath in files:
        try:
            text = fpath.read_text(encoding="utf-8")
        except Exception:
            continue
        for stem in viz_files:
            if stem in text:
                viz_courses[stem].add(course)

# ── 4. Plan moves/copies ─────────────────────────────────────────────────────
moves: list[tuple[Path, Path, str]] = []  # (src, dst, action)
orphans: list[str] = []

for stem, src in sorted(viz_files.items()):
    courses = sorted(viz_courses.get(stem, set()))
    if not courses:
        orphans.append(stem)
        continue
    action = "copy" if len(courses) > 1 else "move"
    for course in courses:
        dst = CONTENT_ROOT / course / "viz" / src.name
        moves.append((src, dst, action))

# ── 5. Find broken references (content mentions a name with no matching file) ─
all_mentioned: set[str] = set()
all_jsx_names = set(viz_files.keys())
for course, files in course_files.items():
    for fpath in files:
        try:
            text = fpath.read_text(encoding="utf-8")
        except Exception:
            continue
        # Heuristic: look for PascalCase identifiers in string literals
        for m in re.finditer(r"['\"`]([A-Z][A-Za-z0-9]+)['\"`]", text):
            name = m.group(1)
            if name not in all_jsx_names:
                all_mentioned.add(name)

# ── 6. Report ─────────────────────────────────────────────────────────────────
print(f"\n{'DRY RUN' if not EXECUTE else 'EXECUTING'}")
print("=" * 60)

print(f"\n✅  WILL {'MOVE/COPY' if not EXECUTE else 'MOVED/COPIED'} ({len(moves)} operations):")
last_stem = None
for src, dst, action in moves:
    stem = src.stem
    if stem != last_stem:
        courses = sorted(viz_courses[stem])
        marker = "→" if action == "move" else "⊕"
        print(f"  {marker} {stem}  ({', '.join(courses)})")
        last_stem = stem

    if EXECUTE:
        dst.parent.mkdir(parents=True, exist_ok=True)
        if action == "move":
            shutil.move(str(src), str(dst))
        else:
            shutil.copy2(str(src), str(dst))

print(f"\n🗑️  ORPHANS — no content file references these ({len(orphans)}):")
for stem in orphans:
    print(f"  {stem}  ({viz_files[stem].relative_to(ROOT)})")

print(f"\n📊  SUMMARY")
print(f"  Viz files found : {len(viz_files)}")
print(f"  Moves planned   : {len([m for m in moves if m[2] == 'move'])}")
print(f"  Copies planned  : {len([m for m in moves if m[2] == 'copy'])}")
print(f"  Orphaned        : {len(orphans)}")
print()
if not EXECUTE:
    print("Run with --execute to apply changes.")
