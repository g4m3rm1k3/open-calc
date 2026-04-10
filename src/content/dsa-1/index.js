// Data Structures & Algorithms — Content Index
// Course key: 'dsa-1'
// Each chapter maps to a Phase in the curriculum.

import dsa0_001 from './dsa0-001-execution-model.js';
import dsa0_002 from './dsa0-002-big-o.js';
import dsa0_003 from './dsa0-003-algorithmic-thinking.js';
import dsa1_001 from './dsa1-001-arrays.js';
import dsa1_002 from './dsa1-002-linked-lists.js';
import dsa1_003 from './dsa1-003-stacks-and-queues.js';
import dsa1_004 from './dsa1-004-strings.js';
import dsa2_001 from './dsa2-001-recursion-basics.js';
import dsa2_002 from './dsa2-002-recursion-trees.js';
import dsa2_003 from './dsa2-003-backtracking.js';
import dsa3_001 from './dsa3-001-hash-tables.js';
import dsa3_002 from './dsa3-002-hashmap-applications.js';
import dsa4_001 from './dsa4-001-binary-trees.js';
import dsa4_002 from './dsa4-002-binary-search-trees.js';
import dsa4_003 from './dsa4-003-heaps.js';
import dsa5_001 from './dsa5-001-graph-bfs-dfs.js';
import dsa5_002 from './dsa5-002-shortest-paths-topo.js';
import dsa6_001 from './dsa6-001-sorting.js';
import dsa6_002 from './dsa6-002-binary-search.js';
import dsa7_001 from './dsa7-001-algorithmic-paradigms.js';

const DSA_CH0 = {
  title: 'Computational Foundations',
  number: 'dsa0',
  slug: 'computational-foundations',
  description: 'Build the mental model that everything else rests on: how programs execute, what memory is, and how we measure algorithmic cost.',
  course: 'dsa-1',
  lessons: [
    dsa0_001,
    dsa0_002,
    dsa0_003,
  ],
};

const DSA_CH1 = {
  title: 'Linear Structures',
  number: 'dsa1',
  slug: 'linear-structures',
  description: 'Arrays, strings, linked lists, stacks, and queues — the backbone of every algorithm.',
  course: 'dsa-1',
  lessons: [
    dsa1_001,
    dsa1_002,
    dsa1_003,
    dsa1_004,
  ],
};

const DSA_CH2 = {
  title: 'Recursion & State',
  number: 'dsa2',
  slug: 'recursion-and-state',
  description: 'Understand how function calls create state, build recursion trees, and prune search spaces with backtracking.',
  course: 'dsa-1',
  lessons: [
    dsa2_001,
    dsa2_002,
    dsa2_003,
  ],
};

const DSA_CH3 = {
  title: 'Hashing',
  number: 'dsa3',
  slug: 'hashing',
  description: 'Build hash tables from scratch, handle collisions, and understand the power of O(1) average-case lookup.',
  course: 'dsa-1',
  lessons: [
    dsa3_001,
    dsa3_002,
  ],
};

const DSA_CH4 = {
  title: 'Trees',
  number: 'dsa4',
  slug: 'trees',
  description: 'Binary trees, BSTs, heaps, AVL trees, and tries — hierarchical structures that dominate real software.',
  course: 'dsa-1',
  lessons: [dsa4_001, dsa4_002, dsa4_003],
};

const DSA_CH5 = {
  title: 'Graphs',
  number: 'dsa5',
  slug: 'graphs',
  description: 'Represent relationships. BFS, DFS, shortest paths, topological sort, and spanning trees.',
  course: 'dsa-1',
  lessons: [dsa5_001, dsa5_002],
};

const DSA_CH6 = {
  title: 'Sorting & Searching',
  number: 'dsa6',
  slug: 'sorting-and-searching',
  description: 'From bubble sort to merge sort to radix. Binary search and its generalizations.',
  course: 'dsa-1',
  lessons: [dsa6_001, dsa6_002],
};

const DSA_CH7 = {
  title: 'Algorithmic Paradigms',
  number: 'dsa7',
  slug: 'algorithmic-paradigms',
  description: 'Divide & conquer, greedy algorithms, and dynamic programming — the three master patterns.',
  course: 'dsa-1',
  lessons: [dsa7_001],
};

export default [DSA_CH0, DSA_CH1, DSA_CH2, DSA_CH3, DSA_CH4, DSA_CH5, DSA_CH6, DSA_CH7];
