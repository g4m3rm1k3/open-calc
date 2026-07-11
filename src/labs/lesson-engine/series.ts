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
    description: 'Learn Python from scratch — variables, functions, data structures, and algorithms. Write real code against real tests from the very first lesson.',
    levels: [
      { level: 0, title: 'Variables & Types', file: 'python-fundamentals/level-0.md' },
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
