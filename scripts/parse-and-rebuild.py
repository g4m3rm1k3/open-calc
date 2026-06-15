#!/usr/bin/env python3
"""
parse-and-rebuild.py

Source of truth: src/content/index.js
  1. Parse imports  → variable : folder mappings
  2. Parse curriculum const blocks → ordered (folder, course, is_array) list
  3. Follow each folder to its index.js → chapter title/slug + lesson file list IN ARRAY ORDER
  4. Copy to tmp/courses-rebuilt/{course}/{N}-{chapterSlug}/{NNN}-{lessonSlug}.js

Usage: python3 scripts/parse-and-rebuild.py
"""
import re, shutil
from pathlib import Path

ROOT    = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src' / 'content'
DEST    = ROOT / 'tmp' / 'courses-rebuilt'

# ── helpers ──────────────────────────────────────────────────────────────────

def read(path):
    try:    return Path(path).read_text(encoding='utf-8', errors='ignore')
    except: return ''

def field(text, key):
    m = re.search(rf"^\s*{key}:\s*['\"]([^'\"]+)['\"]", text, re.MULTILINE)
    return m.group(1) if m else None

def lesson_slug(path):
    text = read(path)[:500]
    return field(text, 'slug') or Path(path).stem

# ── parse a chapter index.js that exports ONE chapter object ─────────────────

def parse_single(folder):
    text = read(CONTENT / folder / 'index.js')
    imp  = {}
    for m in re.finditer(r"import\s+(\w+)\s+from\s+['\"]\.\/([^'\"]+\.js)['\"]", text):
        imp[m.group(1)] = m.group(2)

    lessons = []
    lm = re.search(r"lessons:\s*\[([^\]]+)\]", text, re.DOTALL)
    if lm:
        for v in lm.group(1).split(','):
            v = v.strip()
            if v in imp:
                lessons.append(CONTENT / folder / imp[v])

    # fallback: no lessons array — import order
    if not lessons:
        for v, fname in imp.items():
            p = CONTENT / folder / fname
            if p.exists():
                lessons.append(p)

    return [{'title': field(text,'title') or folder,
             'slug':  field(text,'slug')  or folder,
             'lessons': lessons}]

# ── parse a chapter index.js that exports an ARRAY of chapter objects ─────────

def parse_array(folder):
    text = read(CONTENT / folder / 'index.js')

    file_imp = {}   # var → lesson filename
    sub_imp  = {}   # var → subfolder (e.g. physics chapter-0)
    for m in re.finditer(r"import\s+(\w+)\s+from\s+['\"]\.\/([^'\"]+)['\"]", text):
        v, p = m.groups()
        if '/index.js' in p:
            sub_imp[v] = p.replace('/index.js','')
        elif p.endswith('.js'):
            file_imp[v] = p

    # collect const VAR = { ... lessons: [...] ... }
    ch_defs = {}
    for m in re.finditer(
        r'const\s+(\w+)\s*=\s*\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}', text, re.DOTALL
    ):
        vname, body = m.groups()
        if 'lessons' not in body:
            continue
        lm = re.search(r"lessons:\s*\[([^\]]+)\]", body, re.DOTALL)
        lessons = []
        if lm:
            for v in lm.group(1).split(','):
                v = v.strip()
                if v in file_imp:
                    lessons.append(CONTENT / folder / file_imp[v])
        ch_defs[vname] = {
            'title':   field(body,'title') or vname,
            'slug':    field(body,'slug')  or vname.lower(),
            'lessons': lessons
        }

    # respect export default [...] order
    chapters = []
    em = re.search(r'export\s+default\s*\[([^\]]+)\]', text, re.DOTALL)
    if em:
        for item in em.group(1).split(','):
            v = item.strip()
            if v in ch_defs:
                chapters.append(ch_defs[v])
            elif v in sub_imp:
                # nested sub-folder (physics pattern)
                sub    = sub_imp[v]
                st     = read(CONTENT / folder / sub / 'index.js')
                si     = {}
                for m2 in re.finditer(r"import\s+(\w+)\s+from\s+['\"]\.\/([^'\"]+\.js)['\"]", st):
                    si[m2.group(1)] = m2.group(2)
                lessons = []
                lm2 = re.search(r"lessons:\s*\[([^\]]+)\]", st, re.DOTALL)
                if lm2:
                    for v2 in lm2.group(1).split(','):
                        v2 = v2.strip()
                        if v2 in si:
                            lessons.append(CONTENT / folder / sub / si[v2])
                if not lessons:
                    for sv2, fn2 in si.items():
                        p2 = CONTENT / folder / sub / fn2
                        if p2.exists():
                            lessons.append(p2)
                chapters.append({
                    'title':   field(st,'title') or sub,
                    'slug':    field(st,'slug')  or sub,
                    'lessons': lessons
                })
    elif ch_defs:
        chapters = list(ch_defs.values())

    return chapters

# ── parse content/index.js ───────────────────────────────────────────────────

index_text = read(CONTENT / 'index.js')

# variable → folder
var_folder = {}
for m in re.finditer(r"import\s+(\w+)\s+from\s+['\"]\.\/([^'\"\/]+)\/index\.js['\"]", index_text):
    var_folder[m.group(1)] = m.group(2)

# curriculum blocks: const X = EXPR.map(... course: "key" ...)
entries = []  # (folder, course, is_array)

block_re = re.compile(
    r'const\s+\w+\s*=\s*([\s\S]*?)\.map\(\s*\(ch\)\s*=>\s*\(\s*\{.*?course:\s*["\']([^"\']+)["\']',
    re.DOTALL
)

seen = set()
for m in block_re.finditer(index_text):
    if m.start() in seen: continue
    seen.add(m.start())
    expr, course = m.groups()
    expr = expr.strip()

    if expr.startswith('['):
        inner = expr[1 : expr.rfind(']')].strip()
        for item in re.split(r',\s*\n?\s*', inner):
            item = item.strip()
            if item.startswith('...'):
                var = item[3:]
                if var in var_folder:
                    entries.append((var_folder[var], course, True))
            elif item in var_folder:
                entries.append((var_folder[item], course, False))
    else:
        var = expr.strip()
        if var in var_folder:
            entries.append((var_folder[var], course, True))

# ── expand entries into per-course chapter list ───────────────────────────────

course_chapters = {}
for folder, course, is_array in entries:
    chs = parse_array(folder) if is_array else parse_single(folder)
    course_chapters.setdefault(course, []).extend(chs)

# ── copy ─────────────────────────────────────────────────────────────────────

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

copied = warned = 0

for course, chapters in course_chapters.items():
    for ch_n, ch in enumerate(chapters, start=1):
        ch_dir = DEST / course / f"{ch_n}-{ch['slug']}"
        for l_n, lp in enumerate(ch['lessons'], start=1):
            lp = Path(lp)
            if not lp.exists():
                print(f"  WARN missing: {lp.name}")
                warned += 1
                continue
            slug = lesson_slug(lp)
            dest = ch_dir / f"{l_n:03d}-{slug}.js"
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(lp, dest)
            copied += 1

print(f"\n{len(course_chapters)} courses | {copied} lessons | {warned} missing")
print(f"Output: {DEST}")
