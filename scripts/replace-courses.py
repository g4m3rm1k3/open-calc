#!/usr/bin/env python3
"""
1. Copy meta.json from src/courses/{course}/ to tmp/courses-final/{course}/
2. Copy courseLoader.js to tmp/courses-final/
3. Replace src/courses/ with tmp/courses-final/
"""
import shutil
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
SRC     = ROOT / 'src' / 'courses'
FINAL   = ROOT / 'tmp' / 'courses-final'

# 1. Copy meta.json files
copied_meta = 0
missing_meta = []
for course_dir in sorted(FINAL.iterdir()):
    if not course_dir.is_dir():
        continue
    src_meta = SRC / course_dir.name / 'meta.json'
    if src_meta.exists():
        shutil.copy2(src_meta, course_dir / 'meta.json')
        copied_meta += 1
    else:
        missing_meta.append(course_dir.name)

print(f"Copied {copied_meta} meta.json files")
if missing_meta:
    print(f"No meta.json in src/courses/ for: {', '.join(missing_meta)}")

# 2. Copy courseLoader.js
shutil.copy2(SRC / 'courseLoader.js', FINAL / 'courseLoader.js')
print("Copied courseLoader.js")

# 3. Replace src/courses/
shutil.rmtree(SRC)
shutil.move(str(FINAL), str(SRC))
print(f"Replaced src/courses/ with tmp/courses-final/")
print(f"\nDone. src/courses/ now has {len(list(SRC.iterdir()))} entries")
