// DSA + Design Patterns — Lesson 33
export const lesson = {
  id: 'dsa-patterns-33',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '33. Forward Checking & Constraint Propagation',
  checkpoints: [
    { id: 'cp-domains', label: 'Domains & Constraints' },
    { id: 'cp-forward', label: 'Forward Checking' },
    { id: 'cp-ac3', label: 'Arc Consistency' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'Plain backtracking for Sudoku can explore millions of dead-end branches. You place a 7, recurse 40 cells deeper, and only then discover a conflict. What if you could detect that conflict the moment you placed the 7 — before going deeper? That is the core idea: reason about what values are still possible for every unfilled cell, and prune entire branches before entering them.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'A domain is the set of values a variable (cell) can still legally take given the current partial assignment. For an empty Sudoku cell, the initial domain is {1..9} minus all values already present in the same row, column, and 3×3 box. A constraint links two cells: they cannot hold the same value. A Constraint Satisfaction Problem (CSP) is a triple (variables, domains, constraints).',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'Initializing domains: for each empty cell (row, col), scan its row, column, and 3×3 box to collect the "forbidden" values. The domain is {1..9} minus the forbidden set. Cells already filled have a singleton domain — just their assigned value. Computing all initial domains is O(81 × 27) = O(1) for a fixed 9×9 board, but conceptually O(n^2 × constraints) for an n×n board.',
      code:
        'function getBox(board, row, col) {\n' +
        '  const values = new Set();\n' +
        '  const boxRow = Math.floor(row / 3) * 3;\n' +
        '  const boxCol = Math.floor(col / 3) * 3;\n' +
        '  for (let r = boxRow; r < boxRow + 3; r++) {\n' +
        '    for (let c = boxCol; c < boxCol + 3; c++) {\n' +
        '      if (board[r][c] !== 0) values.add(board[r][c]);\n' +
        '    }\n' +
        '  }\n' +
        '  return values;\n' +
        '}\n' +
        '\n' +
        'function initDomains(board) {\n' +
        '  const domains = {}; // key: "r,c"  // ← NEW\n' +
        '  for (let r = 0; r < 9; r++) {\n' +
        '    for (let c = 0; c < 9; c++) {\n' +
        '      if (board[r][c] !== 0) continue; // already filled\n' +
        '      const forbidden = new Set();\n' +
        '      for (let k = 0; k < 9; k++) {\n' +
        '        if (board[r][k] !== 0) forbidden.add(board[r][k]); // row  // ← NEW\n' +
        '        if (board[k][c] !== 0) forbidden.add(board[k][c]); // col  // ← NEW\n' +
        '      }\n' +
        '      getBox(board, r, c).forEach(v => forbidden.add(v)); // box  // ← NEW\n' +
        '      domains[r + "," + c] = new Set([1,2,3,4,5,6,7,8,9].filter(v => !forbidden.has(v)));\n' +
        '    }\n' +
        '  }\n' +
        '  return domains;\n' +
        '}\n' +
        '\n' +
        'const board = [\n' +
        '  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],\n' +
        '  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],\n' +
        '  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]\n' +
        '];\n' +
        'const domains = initDomains(board);\n' +
        'console.log("domain 0,2", JSON.stringify([...domains["0,2"]]));\n' +
        'console.log("empty cells", Object.keys(domains).length);',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'Forward checking: when we assign value v to cell X, immediately remove v from the domains of every cell Y that shares a constraint with X (same row, column, or box). If any domain becomes empty, we have detected a contradiction immediately — backtrack now, before placing any more values. This moves failure detection from O(depth) levels up to the current level.',
      code:
        'function getNeighbors(row, col) {\n' +
        '  const neighbors = new Set();\n' +
        '  for (let k = 0; k < 9; k++) {\n' +
        '    if (k !== col) neighbors.add(row + "," + k); // same row  // ← NEW\n' +
        '    if (k !== row) neighbors.add(k + "," + col); // same col  // ← NEW\n' +
        '  }\n' +
        '  const br = Math.floor(row / 3) * 3;\n' +
        '  const bc = Math.floor(col / 3) * 3;\n' +
        '  for (let r = br; r < br + 3; r++) {\n' +
        '    for (let c = bc; c < bc + 3; c++) {\n' +
        '      if (r !== row || c !== col) neighbors.add(r + "," + c); // same box  // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '  return neighbors;\n' +
        '}\n' +
        '\n' +
        'function forwardCheck(domains, row, col, value) {\n' +
        '  const pruned = {}; // track what was removed so we can restore  // ← NEW\n' +
        '  for (const key of getNeighbors(row, col)) {\n' +
        '    if (!domains[key]) continue;\n' +
        '    if (domains[key].has(value)) {\n' +
        '      domains[key].delete(value); // ← NEW: remove value from neighbor domain\n' +
        '      pruned[key] = value;\n' +
        '      if (domains[key].size === 0) return null; // contradiction detected  // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '  return pruned; // return for undo on backtrack\n' +
        '}\n' +
        '\n' +
        'console.log("neighbors of 0,2", getNeighbors(0, 2).size);',
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'Arc consistency (AC-3) goes further than forward checking. An arc (X, Y) is arc-consistent if for every value in X\'s domain, there exists at least one value in Y\'s domain that satisfies the constraint between X and Y. AC-3 propagates constraints until a fixed point: it uses a queue of arcs to process. When removing a value from X\'s domain, re-enqueue all arcs pointing to X from its neighbors, because their arc consistency may now be violated. Worst case O(n × d^3) where d is domain size — but for Sudoku this runs very fast in practice.',
      code:
        'function ac3(domains, constraints) {\n' +
        '  // constraints is an array of [key1, key2] pairs\n' +
        '  const queue = [...constraints]; // ← NEW: start with all arcs\n' +
        '\n' +
        '  while (queue.length > 0) {\n' +
        '    const [xi, xj] = queue.shift();\n' +
        '    if (!domains[xi] || !domains[xj]) continue;\n' +
        '    const removed = revise(domains, xi, xj); // ← NEW\n' +
        '    if (removed) {\n' +
        '      if (domains[xi].size === 0) return false; // no solution  // ← NEW\n' +
        '      // Re-add arcs from xi\'s neighbors to xi\n' +
        '      for (const key of getNeighbors(...xi.split(",").map(Number))) {\n' +
        '        if (key !== xj && domains[key]) queue.push([key, xi]); // ← NEW\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  return true;\n' +
        '}\n' +
        '\n' +
        'function revise(domains, xi, xj) {\n' +
        '  let revised = false;\n' +
        '  for (const vx of [...domains[xi]]) {\n' +
        '    // Constraint: xi and xj cannot share the same value\n' +
        '    const satisfiable = [...domains[xj]].some(vy => vy !== vx); // ← NEW\n' +
        '    if (!satisfiable) { domains[xi].delete(vx); revised = true; }\n' +
        '  }\n' +
        '  return revised;\n' +
        '}\n' +
        '\n' +
        'console.log("ac3 defined");',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'Combining forward checking with the minimum-remaining-values (MRV) heuristic — always choose the empty cell with the smallest domain — creates a powerful solver. The MRV heuristic is also called "fail-first" because it immediately surfaces the most constrained cell, detecting dead ends earlier. With MRV + forward checking, most standard Sudoku puzzles solve with only a handful of backtracks.',
      code:
        'function pickMRV(domains) {\n' +
        '  let minKey = null;\n' +
        '  let minSize = Infinity;\n' +
        '  for (const [key, domain] of Object.entries(domains)) {\n' +
        '    if (domain.size < minSize) { // ← NEW\n' +
        '      minSize = domain.size;\n' +
        '      minKey = key;\n' +
        '    }\n' +
        '  }\n' +
        '  return minKey;\n' +
        '}\n' +
        '\n' +
        'function solveSudoku(board) {\n' +
        '  const domains = initDomains(board);\n' +
        '\n' +
        '  function backtrack(board, domains) {\n' +
        '    if (Object.keys(domains).length === 0) return board; // solved\n' +
        '    const key = pickMRV(domains); // ← NEW: MRV heuristic\n' +
        '    const [row, col] = key.split(",").map(Number);\n' +
        '    for (const value of domains[key]) {\n' +
        '      const newBoard = board.map(r => [...r]);\n' +
        '      newBoard[row][col] = value;\n' +
        '      const newDomains = {};\n' +
        '      for (const [k, d] of Object.entries(domains)) {\n' +
        '        if (k !== key) newDomains[k] = new Set(d);\n' +
        '      }\n' +
        '      const pruned = forwardCheck(newDomains, row, col, value);\n' +
        '      if (pruned !== null) {\n' +
        '        const result = backtrack(newBoard, newDomains);\n' +
        '        if (result) return result;\n' +
        '      }\n' +
        '    }\n' +
        '    return null;\n' +
        '  }\n' +
        '\n' +
        '  return backtrack(board, domains);\n' +
        '}\n' +
        '\n' +
        'console.log("solver defined");',
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'No design pattern cleanly maps onto constraint propagation — and that is the honest lesson here. Observer is a loose analogy: when a domain changes, observers (constrained neighbors) are notified and update themselves. But Observer is about event broadcasting, not constraint logic. Forcing a GoF pattern onto AC-3 would produce more abstraction than clarity. Some algorithms have their own structure that is more informative than any pattern label.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Implement initDomains: given a 9×9 board (0=empty), return an object mapping "r,c" keys to Sets of valid digits for each empty cell. Print the domain of cell "0,2" for the example board.',
      expectedOutput: null,
      startCode:
        'function initDomains(board) {\n' +
        '  const domains = {};\n' +
        '  for (let r = 0; r < 9; r++) {\n' +
        '    for (let c = 0; c < 9; c++) {\n' +
        '      if (board[r][c] !== 0) continue;\n' +
        '      const forbidden = new Set();\n' +
        '      // TODO: add values from row, column, and 3x3 box to forbidden\n' +
        '      domains[r + "," + c] = new Set([1,2,3,4,5,6,7,8,9].filter(v => !forbidden.has(v)));\n' +
        '    }\n' +
        '  }\n' +
        '  return domains;\n' +
        '}\n' +
        '\n' +
        'const board = [\n' +
        '  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],\n' +
        '  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],\n' +
        '  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]\n' +
        '];\n' +
        'const domains = initDomains(board);\n' +
        'console.log(JSON.stringify([...domains["0,2"]].sort((a,b)=>a-b)));',
      hint: 'For row r: for k in 0..8, add board[r][k] if nonzero. For col c: add board[k][c] if nonzero. For the box: br=floor(r/3)*3, bc=floor(c/3)*3, add board[br+i][bc+j] for i,j in 0..2.',
      validate: ({ logs }) => {
        try {
          const line = logs.find(l => {
            try { const a = JSON.parse(String(l).trim()); return Array.isArray(a); } catch { return false; }
          });
          if (!line) return false;
          const arr = JSON.parse(String(line).trim());
          return arr.includes(1) && arr.includes(2) && arr.includes(4) && arr.includes(6);
        } catch { return false; }
      },
    },
    { type: 'checkpoint', id: 'cp-domains' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'Even without a forced pattern, the architecture of forward checking has a natural structure: a mutable domain store, a prune operation, and an undo operation. These map to a transactional design where each assignment is a reversible step. The "pruned" object returned by forwardCheck records exactly what was removed, enabling clean restoration on backtrack. This is the Memento pattern\'s core idea applied to domain stores.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'Here is the undo mechanism for forward checking. The pruned map records which keys had which value removed. The restore function puts them back. This makes backtracking explicit and clean — no deep cloning of the entire domain store on each step, just a delta record.',
      code:
        'function forwardCheck(domains, row, col, value) {\n' +
        '  const pruned = {};\n' +
        '  const neighbors = getNeighbors(row, col);\n' +
        '  for (const key of neighbors) {\n' +
        '    if (!domains[key]) continue;\n' +
        '    if (domains[key].has(value)) {\n' +
        '      if (!pruned[key]) pruned[key] = [];\n' +
        '      pruned[key].push(value); // ← NEW: record delta\n' +
        '      domains[key].delete(value);\n' +
        '      if (domains[key].size === 0) return null;\n' +
        '    }\n' +
        '  }\n' +
        '  return pruned;\n' +
        '}\n' +
        '\n' +
        'function restoreDomains(domains, pruned) {\n' +
        '  for (const [key, values] of Object.entries(pruned)) {\n' +
        '    if (!domains[key]) domains[key] = new Set();\n' +
        '    for (const v of values) domains[key].add(v); // ← NEW: undo pruning\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'function getNeighbors(row, col) {\n' +
        '  const neighbors = new Set();\n' +
        '  for (let k = 0; k < 9; k++) {\n' +
        '    if (k !== col) neighbors.add(row + "," + k);\n' +
        '    if (k !== row) neighbors.add(k + "," + col);\n' +
        '  }\n' +
        '  const br = Math.floor(row / 3) * 3;\n' +
        '  const bc = Math.floor(col / 3) * 3;\n' +
        '  for (let r = br; r < br + 3; r++)\n' +
        '    for (let c = bc; c < bc + 3; c++)\n' +
        '      if (r !== row || c !== col) neighbors.add(r + "," + c);\n' +
        '  return neighbors;\n' +
        '}\n' +
        '\n' +
        'console.log("forwardCheck + restore defined");',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point here is explicit state management. Forward checking uses a delta record (pruned map) to undo constraint propagation — this is Memento without the class ceremony. The lesson: design patterns are named solutions to named problems. When the algorithmic structure already encodes the solution clearly, adding pattern scaffolding is redundant. Recognizing when a pattern is present "in spirit" without needing its full class hierarchy is a mark of design maturity.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Implement forward checking: given domains, row, col, and a value just assigned, remove that value from all neighbor domains. Return null if any domain empties, otherwise return the pruned delta.',
      expectedOutput: null,
      startCode:
        'function getNeighbors(row, col) {\n' +
        '  const neighbors = new Set();\n' +
        '  for (let k = 0; k < 9; k++) {\n' +
        '    if (k !== col) neighbors.add(row + "," + k);\n' +
        '    if (k !== row) neighbors.add(k + "," + col);\n' +
        '  }\n' +
        '  const br = Math.floor(row / 3) * 3;\n' +
        '  const bc = Math.floor(col / 3) * 3;\n' +
        '  for (let r = br; r < br + 3; r++)\n' +
        '    for (let c = bc; c < bc + 3; c++)\n' +
        '      if (r !== row || c !== col) neighbors.add(r + "," + c);\n' +
        '  return neighbors;\n' +
        '}\n' +
        '\n' +
        'function forwardCheck(domains, row, col, value) {\n' +
        '  const pruned = {};\n' +
        '  for (const key of getNeighbors(row, col)) {\n' +
        '    if (!domains[key]) continue;\n' +
        '    // TODO: remove value from domains[key], record in pruned, return null if empty\n' +
        '  }\n' +
        '  return pruned;\n' +
        '}\n' +
        '\n' +
        'const domains = { "0,1": new Set([3,7]), "0,3": new Set([2,4,6]), "1,2": new Set([2,4]) };\n' +
        'const result = forwardCheck(domains, 0, 2, 4);\n' +
        'console.log(result !== null ? "ok" : "contradiction");\n' +
        'console.log(JSON.stringify([...domains["1,2"]]));',
      hint: 'if (domains[key].has(value)) { pruned[key] = value; domains[key].delete(value); if (domains[key].size === 0) return null; }',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim());
        return strs.includes('ok') && strs.some(s => s.includes('2') && !s.includes('4'));
      },
    },
    { type: 'checkpoint', id: 'cp-forward' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'AC-3 arc consistency can be run once at the start, before any backtracking, to reduce domains globally. In many Sudoku puzzles, AC-3 alone solves the puzzle — no backtracking required. The queue-based propagation ensures every arc is processed at most O(d) times where d is the domain size. After AC-3 reduces domains, forward checking maintains them incrementally during backtracking.',
      code:
        'function buildArcs(domains) {\n' +
        '  const arcs = [];\n' +
        '  for (const key of Object.keys(domains)) {\n' +
        '    const [r, c] = key.split(",").map(Number);\n' +
        '    for (const nKey of getNeighbors(r, c)) {\n' +
        '      if (domains[nKey]) arcs.push([key, nKey]); // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '  return arcs;\n' +
        '}\n' +
        '\n' +
        'function getNeighbors(row, col) {\n' +
        '  const neighbors = new Set();\n' +
        '  for (let k = 0; k < 9; k++) {\n' +
        '    if (k !== col) neighbors.add(row + "," + k);\n' +
        '    if (k !== row) neighbors.add(k + "," + col);\n' +
        '  }\n' +
        '  const br = Math.floor(row / 3) * 3;\n' +
        '  const bc = Math.floor(col / 3) * 3;\n' +
        '  for (let r = br; r < br + 3; r++)\n' +
        '    for (let c = bc; c < bc + 3; c++)\n' +
        '      if (r !== row || c !== col) neighbors.add(r + "," + c);\n' +
        '  return neighbors;\n' +
        '}\n' +
        '\n' +
        'console.log("arc builder defined");',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Implement the revise function for AC-3: remove any value from xi\'s domain for which no consistent value exists in xj\'s domain. Return true if any value was removed.',
      expectedOutput: null,
      startCode:
        'function revise(domains, xi, xj) {\n' +
        '  let revised = false;\n' +
        '  for (const vx of [...domains[xi]]) {\n' +
        '    // The constraint: xi != xj (they cannot share the same value)\n' +
        '    // TODO: check if any value in domains[xj] is different from vx\n' +
        '    // If no such value exists, remove vx from domains[xi]\n' +
        '  }\n' +
        '  return revised;\n' +
        '}\n' +
        '\n' +
        'const domains = { "A": new Set([1]), "B": new Set([1, 2]) };\n' +
        'const changed = revise(domains, "B", "A");\n' +
        'console.log(changed);\n' +
        'console.log(JSON.stringify([...domains["B"]]));',
      hint: 'const satisfiable = [...domains[xj]].some(vy => vy !== vx); if (!satisfiable) { domains[xi].delete(vx); revised = true; }',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim());
        return strs.includes('true') && strs.some(s => s === '[2]');
      },
    },
    { type: 'checkpoint', id: 'cp-ac3' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace domain initialization for a simple partial Sudoku board. Watch how each empty cell\'s domain shrinks based on its row, column, and box constraints.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through domain initialization: for each empty cell, forbidden values are collected and the domain is computed.',
      lang: 'js',
      code:
        'function initDomains(board) {\n' +
        '  const domains = {};\n' +
        '  for (let r = 0; r < 9; r++) {\n' +
        '    for (let c = 0; c < 9; c++) {\n' +
        '      if (board[r][c] !== 0) continue;\n' +
        '      const forbidden = new Set();\n' +
        '      for (let k = 0; k < 9; k++) {\n' +
        '        if (board[r][k]) forbidden.add(board[r][k]);\n' +
        '        if (board[k][c]) forbidden.add(board[k][c]);\n' +
        '      }\n' +
        '      const br = Math.floor(r / 3) * 3;\n' +
        '      const bc = Math.floor(c / 3) * 3;\n' +
        '      for (let i = br; i < br + 3; i++)\n' +
        '        for (let j = bc; j < bc + 3; j++)\n' +
        '          if (board[i][j]) forbidden.add(board[i][j]);\n' +
        '      domains[r + "," + c] = new Set([1,2,3,4,5,6,7,8,9].filter(v => !forbidden.has(v)));\n' +
        '    }\n' +
        '  }\n' +
        '  return domains;\n' +
        '}\n' +
        '\n' +
        'const board = [\n' +
        '  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],\n' +
        '  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],\n' +
        '  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]\n' +
        '];\n' +
        'const domains = initDomains(board);\n' +
        'console.log("cell 0,2 domain", JSON.stringify([...domains["0,2"]].sort((a,b)=>a-b)));\n' +
        'console.log("cell 1,1 domain", JSON.stringify([...domains["1,1"]].sort((a,b)=>a-b)));\n' +
        'console.log("total empty cells", Object.keys(domains).length);',
    },
  ],
};
