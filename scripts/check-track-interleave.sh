#!/usr/bin/env bash
# Runs check-narrative-lessons.mjs against src/docs/projects/track/, but
# filters its output down to only the new, lettered prerequisite lesson
# files (e.g. "Lesson 0a Class.md") — track/'s own 35 immutable capstone
# lessons predate several of the checker's rules and produce a large,
# permanent, unrelated set of issues that would otherwise drown out
# anything actually worth seeing here.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/check-narrative-lessons.mjs src/docs/projects/track 2>&1 | awk '
  /^track[\\\/]Lesson [0-9]+[a-z]/ { keep=1; print; next }
  /^track[\\\/]Lesson [0-9]+ / { keep=0; next }
  /^[0-9]+ lesson file/ { print; next }
  keep { print }
'
