#!/usr/bin/env python3
"""
copy-to-courses.py

Reads /tmp/curriculum.json and copies lesson files to tmp/courses-rebuilt/
using the ACTUAL app folder names from src/courses/, merging multi-part
content courses (elec-0..elec-6 → electronics, etc.) into one folder.

Usage: python3 scripts/copy-to-courses.py
"""
import json, shutil, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'tmp' / 'courses-rebuilt'

# Map content course key → app folder name
# Multiple content keys mapping to the same folder are merged as consecutive chapters
COURSE_MAP = {
    'precalc':          'precalculus',
    'geometry':         'geometry',
    'calc':             'calculus',
    'discrete':         'discrete-math',
    'physics-1':        'physics',
    'web-1':            'web',
    'linear-algebra':   'linear-algebra',
    'python-1':         'python',
    'data-science-1':   'data-science',
    'javascript-core':  'javascript',
    'tetris':           'tetris',
    'cs-1':             'cs-1',
    'chemistry-1':      'chemistry',
    'digital-fundamentals': 'digital-fundamentals',
    'elec-0':           'electronics',
    'elec-1':           'electronics',
    'elec-2':           'electronics',
    'elec-3':           'electronics',
    'elec-4':           'electronics',
    'elec-5':           'electronics',
    'elec-6':           'electronics',
    'logic-0':          'logic',
    'plc-0':            'programmable-logic-controllers',
    'cnc-logic':        'cnc',
    'git-0':            'git',
    'git-logic':        'git',
    'dsa-1':            'data-structures-and-algorithms',
    'dp-1':             'dynamic-programming',
    'design-1':         'design',
    'three-js-1':       'three-js',
    'ai-engineering':   'ai-engineering',
    'three-js-2':       'three-js',
    'canvas-1':         'canvas',
    'gcode-parser-1':   'gcode-parser',
    'sql-0':            'sql',
    'sql-1':            'sql',
    'nosql-1':          'nosql',
    'applied-statistics': 'applied-statistics',
    'cli-0':            'command-line-interface',
    'cpp':              'c-plus-plus',
    'sim-1':            'simulation',
}

def safe_slug(s):
    if not s:
        return ''
    return re.sub(r'[^a-z0-9-]', '-', str(s).lower()).strip('-')

data = json.load(open('/tmp/curriculum.json'))

if DEST.exists():
    shutil.rmtree(DEST)

# Track per-app-folder chapter counter so merged courses number consecutively
# Key: (app_folder, content_course, content_chN) → app_chN
chapter_number = {}   # app_folder → next chapter number
seen_chapters  = {}   # (app_folder, content_course, content_chN) → app_chN

copied = skipped = 0

for x in data:
    content_key = x['course']
    app_folder  = COURSE_MAP.get(content_key)
    if not app_folder:
        print(f"  SKIP unmapped course: {content_key}")
        skipped += 1
        continue

    src = Path(x['file'])
    if not src.exists():
        print(f"  MISSING: {src}")
        skipped += 1
        continue

    # Assign a consecutive chapter number within the app folder
    map_key = (app_folder, content_key, x['chN'])
    if map_key not in seen_chapters:
        chapter_number[app_folder] = chapter_number.get(app_folder, 0) + 1
        seen_chapters[map_key] = chapter_number[app_folder]
    app_chN = seen_chapters[map_key]

    ch_slug = x.get('chSlug') or f"chapter-{app_chN}"
    l_slug  = x.get('lSlug')  or f"lesson-{x['lN']}"

    dest = DEST / app_folder / f"{app_chN}-{safe_slug(ch_slug)}" / f"{x['lN']:03d}-{safe_slug(l_slug)}.js"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    copied += 1

print(f"\nCopied {copied} files → {DEST}")
if skipped:
    print(f"Skipped {skipped}")

# Summary
courses = sorted(set(DEST.iterdir()), key=lambda p: p.name)
print(f"{len(list(courses))} course folders")
