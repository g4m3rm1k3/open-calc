export interface SeriesMeta {
  id: string
  label: string
  lang: string
  emoji: string
  description: string
  levels: { level: number; title: string; file: string }[]
}

export const SERIES: SeriesMeta[] = [
  {
    id: 'python-fundamentals',
    label: 'Python Fundamentals',
    lang: 'python',
    emoji: '🐍',
    description: 'Learn Python the way professionals think about it — not just the syntax, but how the interpreter works, how to read and debug code, and the CS and SE ideas underneath every line.',
    levels: [
      // Phase 0 — The Programmer's Mental Model
      { level: 0,  title: 'What Programming Is',          file: 'python-fundamentals/level-0.md'  },
      { level: 1,  title: 'How Python Reads Your Code',   file: 'python-fundamentals/level-1.md'  },
      { level: 2,  title: 'The Debugger',                 file: 'python-fundamentals/level-2.md'  },
      { level: 3,  title: 'Reading Error Messages',       file: 'python-fundamentals/level-3.md'  },
      // Phase 1 — Core Language
      { level: 4,  title: 'print()',                      file: 'python-fundamentals/level-4.md'  },
      { level: 5,  title: 'Variables',                    file: 'python-fundamentals/level-5.md'  },
      { level: 6,  title: 'Types',                        file: 'python-fundamentals/level-6.md'  },
      { level: 7,  title: 'Numbers & Arithmetic',         file: 'python-fundamentals/level-7.md'  },
      { level: 8,  title: 'Strings',                      file: 'python-fundamentals/level-8.md'  },
      { level: 9,  title: 'String Methods',               file: 'python-fundamentals/level-9.md'  },
      { level: 10, title: 'f-strings',                    file: 'python-fundamentals/level-10.md' },
      { level: 11, title: 'Comments',                     file: 'python-fundamentals/level-11.md' },
      { level: 12, title: 'Input & Type Conversion',       file: 'python-fundamentals/level-12.md' },
      { level: 13, title: 'Comparisons & Booleans',       file: 'python-fundamentals/level-13.md' },
      { level: 14, title: 'if / elif / else',             file: 'python-fundamentals/level-14.md' },
      { level: 15, title: 'while Loops',                  file: 'python-fundamentals/level-15.md' },
      { level: 16, title: 'for Loops',                    file: 'python-fundamentals/level-16.md' },
      { level: 17, title: 'range()',                      file: 'python-fundamentals/level-17.md' },
      { level: 18, title: 'Functions',                    file: 'python-fundamentals/level-18.md' },
      { level: 19, title: 'Scope',                        file: 'python-fundamentals/level-19.md' },
      { level: 20, title: 'Lists',                        file: 'python-fundamentals/level-20.md' },
      { level: 21, title: 'List Methods',                 file: 'python-fundamentals/level-21.md' },
      { level: 22, title: 'Tuples',                       file: 'python-fundamentals/level-22.md' },
      { level: 23, title: 'Dictionaries',                 file: 'python-fundamentals/level-23.md' },
      { level: 24, title: 'Sets',                         file: 'python-fundamentals/level-24.md' },
      { level: 25, title: 'Modules & Imports',            file: 'python-fundamentals/level-25.md' },
      { level: 26, title: 'Exceptions',                   file: 'python-fundamentals/level-26.md' },
      // Phase 2 — Writing Programs
      { level: 27, title: 'List Comprehensions',          file: 'python-fundamentals/level-27.md' },
      { level: 28, title: 'Files',                         file: 'python-fundamentals/level-28.md' },
      { level: 29, title: 'Testing',                      file: 'python-fundamentals/level-29.md' },
      { level: 30, title: 'Refactoring',                  file: 'python-fundamentals/level-30.md' },
      // Phase 3 — Professional Python
      { level: 31, title: 'Type Hints',                   file: 'python-fundamentals/level-31.md' },
      { level: 32, title: 'Virtual Environments & pip',   file: 'python-fundamentals/level-32.md' },
      { level: 33, title: 'Formatting & Linting',         file: 'python-fundamentals/level-33.md' },
      { level: 34, title: 'JSON',                         file: 'python-fundamentals/level-34.md' },
      { level: 35, title: 'CSV',                          file: 'python-fundamentals/level-35.md' },
      { level: 36, title: 'SQLite',                       file: 'python-fundamentals/level-36.md' },
    ],
  },
  {
    id: 'dsa-python',
    label: 'Data Structures & Algorithms in Python',
    lang: 'python',
    emoji: '🧮',
    description: 'Master the core DSA patterns used in every technical interview and production codebase — lists, two pointers, hash maps, stacks, queues, linked lists, binary search, recursion, sorting, trees, and graphs.',
    levels: [
      { level: 0,  title: 'Lists & Indexing',      file: 'dsa-python/level-0.md'  },
      { level: 1,  title: 'Two Pointers',           file: 'dsa-python/level-1.md'  },
      { level: 2,  title: 'Hash Maps & Sets',       file: 'dsa-python/level-2.md'  },
      { level: 3,  title: 'Stacks',                 file: 'dsa-python/level-3.md'  },
      { level: 4,  title: 'Queues & Deques',        file: 'dsa-python/level-4.md'  },
      { level: 5,  title: 'Linked Lists',           file: 'dsa-python/level-5.md'  },
      { level: 6,  title: 'Binary Search',          file: 'dsa-python/level-6.md'  },
      { level: 7,  title: 'Recursion',              file: 'dsa-python/level-7.md'  },
      { level: 8,  title: 'Sorting',                file: 'dsa-python/level-8.md'  },
      { level: 9,  title: 'Trees',                  file: 'dsa-python/level-9.md'  },
      { level: 10, title: 'Graphs',                 file: 'dsa-python/level-10.md' },
    ],
  },
]

export function getSeries(id: string): SeriesMeta | undefined {
  return SERIES.find(s => s.id === id)
}
