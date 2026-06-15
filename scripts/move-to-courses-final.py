#!/usr/bin/env python3
import json, shutil, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'tmp' / 'courses-final'
MAP  = ROOT / 'tmp' / 'content-map.json'

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

def safe(s):
    return re.sub(r'[^a-z0-9-]+', '-', str(s).lower()).strip('-')

data = json.loads(MAP.read_text())

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

chapter_counter = {}
seen_chapters   = {}
moved = skipped_null = skipped_missing = skipped_unmapped = 0

for course in data['courses']:
    key = course['key']
    app_folder = COURSE_MAP.get(key)
    if not app_folder:
        count = sum(len(ch['lessons']) for ch in course['chapters'])
        print(f"  UNMAPPED: {key} ({count} lessons)")
        skipped_unmapped += count
        continue

    for ch_idx, chapter in enumerate(course['chapters']):
        map_key = (app_folder, key, ch_idx)
        if map_key not in seen_chapters:
            chapter_counter[app_folder] = chapter_counter.get(app_folder, 0) + 1
            seen_chapters[map_key] = chapter_counter[app_folder]
        app_chN = seen_chapters[map_key]

        ch_dir = DEST / app_folder / f'{app_chN}-{safe(chapter["title"])}'
        ch_dir.mkdir(parents=True, exist_ok=True)

        for lN, lesson in enumerate(chapter['lessons'], start=1):
            source_file = lesson.get('sourceFile')
            if not source_file:
                skipped_null += 1
                continue
            src_path = ROOT / source_file
            if not src_path.exists():
                print(f"  MISSING: {source_file}")
                skipped_missing += 1
                continue

            dest_path = ch_dir / f'{lN:03d}-{src_path.stem}.js'
            if dest_path.exists():
                n = 2
                while dest_path.exists():
                    dest_path = ch_dir / f'{lN:03d}-{src_path.stem}-{n}.js'
                    n += 1

            shutil.move(str(src_path), str(dest_path))
            moved += 1

print(f"\nMoved:    {moved}")
print(f"Null:     {skipped_null}")
print(f"Missing:  {skipped_missing}")
print(f"Unmapped: {skipped_unmapped}")
