#!/usr/bin/env python3
"""
Reads all viz files, scans lesson files for viz ids, moves each viz
into the course that owns it. Duplicates if multiple courses reference
the same viz. Logs all moves. Orphaned viz files stay in place.

Usage: python3 scripts/move-vizzes.py [--dry-run]
"""
import re, sys, shutil, json
from pathlib import Path
from collections import defaultdict

ROOT     = Path(__file__).resolve().parent.parent
COURSES  = ROOT / 'src' / 'courses'
DRY_RUN  = '--dry-run' in sys.argv

# ── 1. Find all candidate viz files ─────────────────────────────────────────
# Walk these directories for .jsx files whose name starts with a capital letter
VIZ_DIRS = [
    ROOT / 'src' / 'components' / 'viz',   # remaining / not-yet-moved
    *[ROOT / 'src' / 'courses' / c / 'viz' for c in
      [p.name for p in (ROOT / 'src' / 'courses').iterdir() if p.is_dir()]],
]

viz_by_name = {}   # stem → Path  (remaining files in components/viz take priority)
for d in reversed(VIZ_DIRS):   # components/viz last so it wins
    if not d.exists():
        continue
    for f in d.rglob('*'):
        if f.suffix in ('.jsx', '.js') and f.is_file():
            viz_by_name[f.stem] = f

print(f"Found {len(viz_by_name)} candidate viz files")

# ── 2. Scan lesson files for viz ids ────────────────────────────────────────
# course → set of viz ids
course_vizzes = defaultdict(set)
# viz id → set of courses
viz_courses   = defaultdict(set)

# Read all lesson files once
lesson_texts = {}   # course → combined text
for lesson_file in COURSES.rglob('*.js'):
    parts = lesson_file.relative_to(COURSES).parts
    if len(parts) < 2:
        continue
    course = parts[0]
    text = lesson_file.read_text(encoding='utf-8', errors='ignore')
    lesson_texts[course] = lesson_texts.get(course, '') + text

# For each viz filename, search for it literally in lesson text
for viz_name, viz_path in viz_by_name.items():
    for course, text in lesson_texts.items():
        if viz_name in text:
            course_vizzes[course].add(viz_name)
            viz_courses[viz_name].add(course)

# Also: if a viz file imports another viz file, pull the dependency along
# with the same course assignments. Do multiple passes until stable.
viz_texts = {stem: path.read_text(encoding='utf-8', errors='ignore')
             for stem, path in viz_by_name.items()}

changed = True
while changed:
    changed = False
    for dep_name in list(viz_by_name.keys()):
        if dep_name in viz_courses:
            continue  # already assigned
        for parent_name, courses in list(viz_courses.items()):
            parent_text = viz_texts.get(parent_name, '')
            if dep_name in parent_text:
                for course in courses:
                    course_vizzes[course].add(dep_name)
                    viz_courses[dep_name].add(course)
                changed = True
                break

total_refs = sum(len(v) for v in course_vizzes.values())
print(f"Found {len(viz_courses)} unique viz ids across {len(course_vizzes)} courses ({total_refs} total references)")

# ── 3. Move / duplicate viz files ───────────────────────────────────────────
move_log   = []   # { viz_id, src, destinations, action }
not_found  = []   # viz ids referenced in lessons but no matching file

for viz_id, courses in sorted(viz_courses.items()):
    src = viz_by_name.get(viz_id)
    if not src:
        not_found.append(viz_id)
        continue

    destinations = []
    for course in sorted(courses):
        viz_dir  = COURSES / course / 'viz'
        dest     = viz_dir / f'{viz_id}.jsx'
        destinations.append(dest)
        if not DRY_RUN:
            viz_dir.mkdir(parents=True, exist_ok=True)

    action = 'move' if len(destinations) == 1 else f'duplicate×{len(destinations)}'

    if not DRY_RUN:
        for i, dest in enumerate(destinations):
            if i == 0:
                shutil.move(str(src), str(dest))
            else:
                shutil.copy2(str(destinations[0]), str(dest))

    move_log.append({
        'viz_id':       viz_id,
        'src':          str(src.relative_to(ROOT)),
        'destinations': [str(d.relative_to(ROOT)) for d in destinations],
        'action':       action,
    })

# ── 4. Report ────────────────────────────────────────────────────────────────
print(f"\n{'DRY RUN — ' if DRY_RUN else ''}Processed {len(move_log)} vizzes:")
for entry in move_log:
    print(f"  [{entry['action']}] {entry['viz_id']}")
    print(f"    from: {entry['src']}")
    for d in entry['destinations']:
        print(f"      to: {d}")

if not_found:
    print(f"\nViz ids in lessons but no file found ({len(not_found)}):")
    for v in not_found:
        print(f"  {v}  ← referenced by: {', '.join(sorted(viz_courses[v]))}")

# Remaining viz files not moved
moved_srcs = {entry['src'] for entry in move_log}
orphans = [
    str(f.relative_to(ROOT))
    for f in viz_by_name.values()
    if str(f.relative_to(ROOT)) not in moved_srcs
]
print(f"\nOrphaned viz files not referenced by any lesson ({len(orphans)}):")
for o in sorted(orphans):
    print(f"  {o}")

# Save log
log_path = ROOT / 'tmp' / 'viz-move-log.json'
log_path.write_text(json.dumps(move_log, indent=2))
print(f"\nLog saved to {log_path.relative_to(ROOT)}")
