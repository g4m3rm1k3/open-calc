---
concept: 160-gitignore
name: .gitignore
---

## Definition

A `.gitignore` file lists patterns for files and directories that git
should NEVER track or show as "untracked" — commonly build output,
dependency folders, and files containing local secrets — keeping them out
of version control entirely.

## Problem

Not every file in a project belongs in version control — generated build
artifacts, huge dependency folders, local environment secrets, and
editor-specific config files would bloat the repository, cause merge
conflicts on machine-specific content, or (worst case) leak secrets if
committed. `.gitignore` tells git to simply never track matching files, so
they never show up as changes to stage or commit.

## Execution

Project has: source files, a dependency folder (installed packages), an
env file (local secrets), and generated build output
↓
Without `.gitignore`: status shows ALL of these as untracked —
accidentally staging everything would commit secrets and huge generated
folders right along with real source code
↓
Add a `.gitignore` file listing the dependency folder, the env file, and
the build output folder
↓
Status now shows ONLY genuine source file changes — the ignored
files/folders are completely excluded from git's tracking, even when
staging everything
↓
If a file was ALREADY tracked before being added to `.gitignore`, adding
it to `.gitignore` alone does NOT untrack it — it must be explicitly
removed from tracking first

## Computer Science

`.gitignore` uses simple glob-style pattern matching (wildcards,
directory-level patterns) checked against every file git considers
adding — this is purely a client-side, local filtering rule; it doesn't
retroactively affect any file that's already committed to history, only
files git hasn't started tracking yet.

Tags: Glob patterns, Untracked files, Client-side filtering

## Software Engineering

`.gitignore` is one of the most important safety nets against
accidentally committing secrets (API keys, environment files) or
bloating a repository with generated content — most language/framework
ecosystems have well-established, commonly reused `.gitignore` templates
specifically covering their typical generated/local files.

Tags: Secret leakage prevention, Repository bloat, .gitignore templates

## Common Mistakes

- Assuming adding a file to `.gitignore` removes it from git if it was ALREADY tracked before — `.gitignore` only prevents NEWLY untracked files from being added; an already-tracked file needs to be explicitly removed from tracking (and the removal committed) before `.gitignore` takes effect for it.
- Committing an env file (or other secrets) before adding it to `.gitignore` — once something is committed, it remains in the repository's history even if later deleted or ignored, unless history itself is explicitly rewritten (a much more invasive fix).

## Exercises

- Trace through what a status check would show for the project in the example above, both BEFORE and AFTER `.gitignore` is added, assuming none of those files were tracked yet.
- Explain specifically why adding an ALREADY-tracked file to `.gitignore` doesn't remove it from version control, and what extra step is actually needed.

## javascript

```javascript
// Simulating .gitignore's glob-based filtering of untracked files directly.
function matchesIgnorePattern(filename, patterns) {
  return patterns.some(pattern => {
    if (pattern.endsWith('/')) return filename.startsWith(pattern)   // directory-level pattern
    return filename === pattern
  })
}

function gitStatus(allFiles, ignorePatterns, alreadyTracked) {
  return allFiles.filter(f => alreadyTracked.has(f) || !matchesIgnorePattern(f, ignorePatterns))
}

const allFiles = ['index.js', 'node_modules/react.js', '.env', 'dist/bundle.js']
const ignorePatterns = ['node_modules/', '.env', 'dist/']
const alreadyTracked = new Set()   // nothing tracked yet in this example

console.log(gitStatus(allFiles, ignorePatterns, alreadyTracked))
// [ 'index.js' ] -- only the real source file shows up; the rest are excluded by .gitignore
```
Walkthrough: `gitStatus` filters `allFiles` down to just `index.js`,
since `node_modules/react.js`, `.env`, and `dist/bundle.js` all match an
ignore pattern and are not already tracked — exactly mirroring how a real
`.gitignore` keeps matching files from ever appearing as changes to
stage, unless they were tracked beforehand.

## python

```python
def matches_ignore_pattern(filename, patterns):
    for pattern in patterns:
        if pattern.endswith('/'):
            if filename.startswith(pattern):   # directory-level pattern
                return True
        elif filename == pattern:
            return True
    return False


def git_status(all_files, ignore_patterns, already_tracked):
    return [f for f in all_files if f in already_tracked or not matches_ignore_pattern(f, ignore_patterns)]


all_files = ['index.js', 'node_modules/react.js', '.env', 'dist/bundle.js']
ignore_patterns = ['node_modules/', '.env', 'dist/']
already_tracked = set()   # nothing tracked yet in this example

print(git_status(all_files, ignore_patterns, already_tracked))
# ['index.js'] -- only the real source file shows up; the rest are excluded by .gitignore
```
Walkthrough: identical glob-pattern-filtering mechanics as the JavaScript
version — only the non-matching, non-ignored file appears, exactly as a
real `.gitignore` would filter status output.
