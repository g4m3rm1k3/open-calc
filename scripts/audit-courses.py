#!/usr/bin/env python3
"""
audit-courses.py

Replicates courseLoader.js exactly — parses src/courses/ by path only.
Shows what the app sees: course → chapters → lessons, in order.

Usage:
  python3 scripts/audit-courses.py              # all courses
  python3 scripts/audit-courses.py calculus     # one course
  python3 scripts/audit-courses.py calculus physics  # multiple
"""

import re, sys
from pathlib import Path

ROOT         = Path(__file__).resolve().parent.parent
COURSES_ROOT = ROOT / "src" / "courses"

filters = [a for a in sys.argv[1:] if not a.startswith("--")]
root_arg = next((a.split("=",1)[1] for a in sys.argv[1:] if a.startswith("--root=")), None)
if root_arg:
    COURSES_ROOT = Path(root_arg)

def slug_to_title(slug):
    return " ".join(w.capitalize() for w in slug.split("-"))

# Build tree exactly like courseLoader.js
# {courseId} / {N}-{chapterSlug} / {NNN}-{lessonSlug}.js
tree = {}

for path in sorted(COURSES_ROOT.rglob("*.js")):
    rel   = path.relative_to(COURSES_ROOT)
    parts = rel.parts
    if len(parts) != 3:
        continue
    course_id, chapter_folder, filename = parts
    cm = re.match(r"^(\d+)-(.+)$", chapter_folder)
    fm = re.match(r"^(\d+)-(.+)\.js$", filename)
    if not cm or not fm:
        continue
    ch_num  = int(cm.group(1))
    ch_slug = cm.group(2)
    l_order = int(fm.group(1))
    l_slug  = fm.group(2)
    tree.setdefault(course_id, {})
    tree[course_id].setdefault(ch_num, {"slug": ch_slug, "lessons": []})
    tree[course_id][ch_num]["lessons"].append((l_order, l_slug))

courses = sorted(tree.keys())
if filters:
    courses = [c for c in courses if any(f in c for f in filters)]

total_lessons = 0
for course_id in courses:
    chapters = tree[course_id]
    print(f"\n{'='*60}")
    print(f"  {course_id}")
    print(f"{'='*60}")
    for ch_num in sorted(chapters.keys()):
        ch = chapters[ch_num]
        lessons = sorted(ch["lessons"])
        total_lessons += len(lessons)
        print(f"\n  {ch_num}. {slug_to_title(ch['slug'])}  ({len(lessons)} lessons)")
        for order, slug in lessons:
            print(f"     {order:03d}  {slug}")

print(f"\n  {len(courses)} course(s)  |  {total_lessons} lessons")
