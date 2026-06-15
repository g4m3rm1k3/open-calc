#!/usr/bin/env python3
import json, shutil, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'tmp' / 'courses-final'

COURSE_MAP = {
    'precalc':'precalculus','geometry':'geometry','calc':'calculus',
    'discrete':'discrete-math','physics-1':'physics','web-1':'web',
    'linear-algebra':'linear-algebra','python-1':'python',
    'data-science-1':'data-science','javascript-core':'javascript',
    'tetris':'tetris','cs-1':'cs-1','chemistry-1':'chemistry',
    'digital-fundamentals':'digital-fundamentals',
    'elec-0':'electronics','elec-1':'electronics','elec-2':'electronics',
    'elec-3':'electronics','elec-4':'electronics','elec-5':'electronics',
    'elec-6':'electronics','logic-0':'logic',
    'plc-0':'programmable-logic-controllers','cnc-logic':'cnc',
    'git-0':'git','git-logic':'git','dsa-1':'data-structures-and-algorithms',
    'dp-1':'dynamic-programming','design-1':'design',
    'three-js-1':'three-js','three-js-2':'three-js',
    'ai-engineering':'ai-engineering','canvas-1':'canvas',
    'gcode-parser-1':'gcode-parser','sql-0':'sql','sql-1':'sql',
    'nosql-1':'nosql','applied-statistics':'applied-statistics',
    'cli-0':'command-line-interface','cpp':'c-plus-plus','sim-1':'simulation',
}

data = json.loads(open('/tmp/curriculum-files.json').read())

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

chapter_counter = {}
seen_chapters   = {}
moved = 0
skipped = 0

for entry in data:
    course     = entry['course']
    app_folder = COURSE_MAP.get(course)
    if not app_folder:
        skipped += 1
        continue

    chN    = entry['chN']
    chSlug = re.sub(r'[^a-z0-9-]', '-', str(entry.get('chSlug') or f'chapter-{chN}').lower()).strip('-')
    lN     = entry['lN']
    src    = Path(entry['file'])

    map_key = (app_folder, course, chN)
    if map_key not in seen_chapters:
        chapter_counter[app_folder] = chapter_counter.get(app_folder, 0) + 1
        seen_chapters[map_key] = chapter_counter[app_folder]
    app_chN = seen_chapters[map_key]

    ch_dir = DEST / app_folder / f'{app_chN}-{chSlug}'
    ch_dir.mkdir(parents=True, exist_ok=True)

    dest = ch_dir / f'{lN:03d}-{src.stem}.js'
    if dest.exists():
        dest = ch_dir / f'{lN:03d}-{src.stem}-b.js'

    shutil.move(str(src), str(dest))
    moved += 1

print(f"Moved: {moved}  Skipped: {skipped}")
courses = sorted(p.name for p in DEST.iterdir() if p.is_dir())
print(f"{len(courses)} courses")
for c in courses:
    chapters = list((DEST/c).iterdir())
    lessons  = sum(len(list(ch.glob('*.js'))) for ch in chapters)
    print(f"  {c}: {len(chapters)} ch, {lessons} lessons")
