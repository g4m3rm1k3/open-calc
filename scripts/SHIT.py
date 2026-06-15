#!/usr/bin/env python3
import json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'tmp' / 'courses-final'
MAP  = ROOT / 'tmp' / 'content-map.json'

data = json.loads(MAP.read_text())

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

moved = skipped_null = skipped_missing = 0

for course in data['courses']:
    for ch_idx, chapter in enumerate(course['chapters'], start=1):
        ch_dir = DEST / course['key'] / f"{ch_idx}"
        ch_dir.mkdir(parents=True, exist_ok=True)

        for lesson in chapter['lessons']:
            source_file = lesson.get('sourceFile')
            if not source_file:
                skipped_null += 1
                continue
            src_path = ROOT / source_file
            if not src_path.exists():
                skipped_missing += 1
                continue
            shutil.move(str(src_path), str(ch_dir / src_path.name))
            moved += 1

print(f"Moved: {moved}  Null: {skipped_null}  Missing: {skipped_missing}")