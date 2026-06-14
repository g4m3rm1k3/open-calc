#!/usr/bin/env python3
"""
Global content comparison: every .js file in /content/ vs every .js file in src/courses/.
No folder matching — a file is "found" if its exact bytes exist anywhere in the target tree.
"""

import hashlib
from pathlib import Path
from collections import defaultdict

ROOT    = Path(__file__).parent.parent
CONTENT = ROOT / "src" /  "content"
COURSES = ROOT / "src" / "courses"

SKIP_NAMES = {"index.js", "courseLoader.js"}


def hash_file(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def index_tree(base: Path) -> tuple[dict[str, list[Path]], int]:
    """Hash every .js file under base. Returns (hash→[paths], total_count)."""
    by_hash: dict[str, list[Path]] = defaultdict(list)
    for p in sorted(base.rglob("*.js")):
        if p.name in SKIP_NAMES:
            continue
        by_hash[hash_file(p)].append(p)
    return by_hash, sum(len(v) for v in by_hash.values())


def main():
    print("Indexing /content/ ...")
    c_by_hash, c_total = index_tree(CONTENT)

    print("Indexing src/courses/ ...")
    s_by_hash, s_total = index_tree(COURSES)

    print(f"\n  /content/     {c_total} files  ({len(c_by_hash)} unique)")
    print(f"  src/courses/  {s_total} files  ({len(s_by_hash)} unique)")

    courses_hashes = set(s_by_hash)
    content_hashes = set(c_by_hash)

    # Files in content with no match anywhere in courses
    missing = sorted(
        str(p.relative_to(CONTENT))
        for h, paths in c_by_hash.items()
        if h not in courses_hashes
        for p in paths
    )

    # Files in courses with no match anywhere in content
    extra = sorted(
        str(p.relative_to(COURSES))
        for h, paths in s_by_hash.items()
        if h not in content_hashes
        for p in paths
    )

    # Duplicates in content (same bytes, multiple files)
    c_dups = {h: paths for h, paths in c_by_hash.items() if len(paths) > 1}

    # Duplicates in courses
    s_dups = {h: paths for h, paths in s_by_hash.items() if len(paths) > 1}

    print()
    if missing:
        print(f"MISSING from src/courses/ ({len(missing)}) — in /content/ but no match anywhere in courses:")
        for f in missing:
            print(f"  - {f}")
    else:
        print("MISSING: none")

    print()
    if extra:
        print(f"EXTRA in src/courses/ ({len(extra)}) — no matching content in /content/:")
        for f in extra:
            print(f"  + {f}")
    else:
        print("EXTRA: none")

    print()
    if c_dups:
        print(f"DUPLICATES in /content/ ({len(c_dups)} groups):")
        for paths in c_dups.values():
            print("  " + " == ".join(str(p.relative_to(CONTENT)) for p in paths))

    print()
    if s_dups:
        print(f"DUPLICATES in src/courses/ ({len(s_dups)} groups):")
        for paths in s_dups.values():
            print("  " + " == ".join(str(p.relative_to(COURSES)) for p in paths))


if __name__ == "__main__":
    main()
