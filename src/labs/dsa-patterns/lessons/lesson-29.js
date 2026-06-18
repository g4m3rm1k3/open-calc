// DSA + Design Patterns — Lesson 29
export const lesson = {
  id: 'dsa-patterns-29',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '29. Grid DP',
  checkpoints: [
    { id: 'cp-grid-dp', label: 'Grid DP' },
    { id: 'cp-paths', label: 'Unique Paths' },
    { id: 'cp-obstacles', label: 'With Obstacles' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'You are standing at the top-left corner of a grid. Each cell has a cost to enter. You can only move right or down. How do you find the minimum total cost to reach the bottom-right corner? Trying every possible path takes exponential time — the number of paths explodes as the grid grows. We need a smarter approach.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'Dynamic programming (DP) solves a problem by breaking it into overlapping subproblems and storing their results. For a grid, the subproblem is: "What is the minimum cost to reach cell (i, j)?" Once we know the answer for every cell above and to the left, we can answer it for (i, j) in O(1).',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'The recurrence relation is the heart of grid DP. To reach (i, j) you must have come from either (i-1, j) — the cell above — or (i, j-1) — the cell to the left. So dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). The first row and column are base cases filled by simple accumulation.',
      code:
        'const grid = [\n' +
        '  [1, 3, 1],\n' +
        '  [1, 5, 1],\n' +
        '  [4, 2, 1]\n' +
        '];\n' +
        'const rows = grid.length;\n' +
        'const cols = grid[0].length;\n' +
        '\n' +
        '// Build a DP table the same size as the grid  // ← NEW\n' +
        'const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        'dp[0][0] = grid[0][0]; // top-left is just its own cost\n' +
        'console.log("dp[0][0]", dp[0][0]);',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'Fill the first row left-to-right: each cell can only be reached from the left, so dp[0][j] = dp[0][j-1] + grid[0][j]. Fill the first column top-to-bottom similarly. These are O(n + m) base cases — n rows and m columns.',
      code:
        'const grid = [\n' +
        '  [1, 3, 1],\n' +
        '  [1, 5, 1],\n' +
        '  [4, 2, 1]\n' +
        '];\n' +
        'const rows = grid.length;\n' +
        'const cols = grid[0].length;\n' +
        'const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        'dp[0][0] = grid[0][0];\n' +
        '\n' +
        '// Base case: first row  // ← NEW\n' +
        'for (let j = 1; j < cols; j++) {\n' +
        '  dp[0][j] = dp[0][j - 1] + grid[0][j];\n' +
        '}\n' +
        '// Base case: first column  // ← NEW\n' +
        'for (let i = 1; i < rows; i++) {\n' +
        '  dp[i][0] = dp[i - 1][0] + grid[i][0];\n' +
        '}\n' +
        'console.log("first row", dp[0]);\n' +
        'console.log("first col", dp.map(r => r[0]));',
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'Now fill the rest of the table row by row. Each cell takes the minimum of the cell above and the cell to the left, then adds the current cell\'s cost. The final answer is dp[rows-1][cols-1]. The overall time complexity is O(rows × cols) — every cell is visited exactly once. Space is also O(rows × cols) for the table.',
      code:
        'function minCostPath(grid) {\n' +
        '  const rows = grid.length;\n' +
        '  const cols = grid[0].length;\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        '  dp[0][0] = grid[0][0];\n' +
        '  for (let j = 1; j < cols; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];\n' +
        '  for (let i = 1; i < rows; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];\n' +
        '\n' +
        '  // Fill interior cells  // ← NEW\n' +
        '  for (let i = 1; i < rows; i++) {\n' +
        '    for (let j = 1; j < cols; j++) {\n' +
        '      dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[rows - 1][cols - 1]; // ← NEW\n' +
        '}\n' +
        '\n' +
        'const grid = [[1,3,1],[1,5,1],[4,2,1]];\n' +
        'console.log("min cost", minCostPath(grid)); // 7',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'Unique paths is a closely related grid DP problem: count how many distinct paths exist from top-left to bottom-right moving only right or down. Here costs don\'t matter — every cell contributes 1 path to its neighbors. dp[i][j] = dp[i-1][j] + dp[i][j-1]. The base cases are all 1s along the first row and column. The result is Pascal\'s triangle projected onto a 2D grid.',
      code:
        'function uniquePaths(rows, cols) {\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1)); // ← NEW\n' +
        '  // First row and column stay 1 (only one way to reach each)\n' +
        '  for (let i = 1; i < rows; i++) {\n' +
        '    for (let j = 1; j < cols; j++) {\n' +
        '      dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[rows - 1][cols - 1];\n' +
        '}\n' +
        '\n' +
        'console.log("3x3 paths", uniquePaths(3, 3)); // 6\n' +
        'console.log("3x7 paths", uniquePaths(3, 7)); // 28',
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'Obstacles are cells that cannot be entered. If grid[i][j] === -1 (or any sentinel), set dp[i][j] = 0 — zero ways to reach that cell, zero cost contribution. The rest of the recurrence stays identical. This demonstrates how DP tables gracefully encode "impossible" states without restructuring the algorithm.',
      code:
        'function uniquePathsWithObstacles(grid) {\n' +
        '  const rows = grid.length;\n' +
        '  const cols = grid[0].length;\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        '\n' +
        '  // Base: first column — stop at first obstacle  // ← NEW\n' +
        '  for (let i = 0; i < rows; i++) {\n' +
        '    if (grid[i][0] === -1) break;\n' +
        '    dp[i][0] = 1;\n' +
        '  }\n' +
        '  // Base: first row  // ← NEW\n' +
        '  for (let j = 0; j < cols; j++) {\n' +
        '    if (grid[0][j] === -1) break;\n' +
        '    dp[0][j] = 1;\n' +
        '  }\n' +
        '  for (let i = 1; i < rows; i++) {\n' +
        '    for (let j = 1; j < cols; j++) {\n' +
        '      dp[i][j] = grid[i][j] === -1 ? 0 : dp[i - 1][j] + dp[i][j - 1]; // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[rows - 1][cols - 1];\n' +
        '}\n' +
        '\n' +
        'const g = [[0,0,0],[0,-1,0],[0,0,0]];\n' +
        'console.log("paths with obstacle", uniquePathsWithObstacles(g)); // 2',
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Compute the minimum path sum for the grid [[1,3,1],[1,5,1],[4,2,1]]. Print the result with console.log.',
      expectedOutput: null,
      startCode:
        'function minCostPath(grid) {\n' +
        '  const rows = grid.length;\n' +
        '  const cols = grid[0].length;\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        '  dp[0][0] = grid[0][0];\n' +
        '  for (let j = 1; j < cols; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];\n' +
        '  for (let i = 1; i < rows; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];\n' +
        '  // TODO: fill interior cells and return the answer\n' +
        '}\n' +
        '\n' +
        'const grid = [[1,3,1],[1,5,1],[4,2,1]];\n' +
        'console.log(minCostPath(grid));',
      hint: 'For each cell (i,j) where i>0 and j>0: dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]). Return dp[rows-1][cols-1].',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '7');
      },
    },
    { type: 'checkpoint', id: 'cp-grid-dp' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'Grid DP is unusual among the topics in this series: no classic design pattern improves it. The two-dimensional table IS the structure. Its spatial layout — each cell encoding the answer to a subproblem — is the insight. Wrapping it in a Decorator or Strategy would add indirection without clarity. Honesty about fit matters as much as knowing the patterns.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'What the grid DOES give us is a visualization story. We can trace the fill order, highlight the chosen path, and print the full DP table. This transparency — every intermediate answer visible — is why DP is called "memoization made explicit." Here is a helper that reconstructs the optimal path by tracing backwards from the bottom-right.',
      code:
        'function tracePath(dp) {\n' +
        '  const path = [];\n' +
        '  let i = dp.length - 1;\n' +
        '  let j = dp[0].length - 1;\n' +
        '  path.push([i, j]);\n' +
        '  while (i > 0 || j > 0) {\n' +
        '    if (i === 0) { j--; }\n' +
        '    else if (j === 0) { i--; }\n' +
        '    else if (dp[i - 1][j] < dp[i][j - 1]) { i--; }\n' +
        '    else { j--; }\n' +
        '    path.push([i, j]);\n' +
        '  }\n' +
        '  return path.reverse();\n' +
        '}\n' +
        '\n' +
        'const dp = [[1,4,5],[2,7,6],[6,8,7]];\n' +
        'console.log("path", JSON.stringify(tracePath(dp)));',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point here is spatial reasoning. Grid DP and design patterns both ask: "What is the minimal unit of decision?" In DP, that unit is a cell. In patterns like Composite or Flyweight, that unit is an object. The grid makes subproblem boundaries visible in physical space — rows and columns — in the same way that class diagrams make object relationships visible. The table IS the architecture.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Count the number of unique paths on a 3×3 grid (moving only right or down). Print the result with console.log.',
      expectedOutput: null,
      startCode:
        'function uniquePaths(rows, cols) {\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1));\n' +
        '  // TODO: fill interior cells\n' +
        '  return dp[rows - 1][cols - 1];\n' +
        '}\n' +
        '\n' +
        'console.log(uniquePaths(3, 3));',
      hint: 'dp[i][j] = dp[i-1][j] + dp[i][j-1] for i>0 and j>0. First row and column are already filled with 1.',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '6');
      },
    },
    { type: 'checkpoint', id: 'cp-paths' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'Combining everything: the minCostPath, uniquePaths, and obstacle variants share exactly one recurrence template. Only the value stored at each cell changes. This is the deepest lesson of grid DP — the 2D table is a reusable scaffold. Swap the "what to store" rule and you solve a different problem with the same O(rows × cols) machinery.',
      code:
        'function gridDP(grid, cellFn, baseFn) {\n' +
        '  const rows = grid.length;\n' +
        '  const cols = grid[0].length;\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        '  baseFn(dp, grid, rows, cols);\n' +
        '  for (let i = 1; i < rows; i++) {\n' +
        '    for (let j = 1; j < cols; j++) {\n' +
        '      dp[i][j] = cellFn(dp, grid, i, j);\n' +
        '    }\n' +
        '  }\n' +
        '  return dp[rows - 1][cols - 1];\n' +
        '}\n' +
        '\n' +
        'const minCostCell = (dp, g, i, j) => g[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);\n' +
        'const minCostBase = (dp, g, rows, cols) => {\n' +
        '  dp[0][0] = g[0][0];\n' +
        '  for (let j = 1; j < cols; j++) dp[0][j] = dp[0][j-1] + g[0][j];\n' +
        '  for (let i = 1; i < rows; i++) dp[i][0] = dp[i-1][0] + g[i][0];\n' +
        '};\n' +
        '\n' +
        'console.log("min cost", gridDP([[1,3,1],[1,5,1],[4,2,1]], minCostCell, minCostBase));',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Count unique paths on the grid [[0,0,0],[0,-1,0],[0,0,0]] where -1 is an obstacle. Print the result with console.log.',
      expectedOutput: null,
      startCode:
        'function uniquePathsWithObstacles(grid) {\n' +
        '  const rows = grid.length;\n' +
        '  const cols = grid[0].length;\n' +
        '  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        '  for (let i = 0; i < rows; i++) { if (grid[i][0] === -1) break; dp[i][0] = 1; }\n' +
        '  for (let j = 0; j < cols; j++) { if (grid[0][j] === -1) break; dp[0][j] = 1; }\n' +
        '  // TODO: fill interior cells, treating -1 as 0 paths\n' +
        '  return dp[rows - 1][cols - 1];\n' +
        '}\n' +
        '\n' +
        'const g = [[0,0,0],[0,-1,0],[0,0,0]];\n' +
        'console.log(uniquePathsWithObstacles(g));',
      hint: 'dp[i][j] = grid[i][j] === -1 ? 0 : dp[i-1][j] + dp[i][j-1]',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '2');
      },
    },
    { type: 'checkpoint', id: 'cp-obstacles' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace the DP table fill step by step for the 3×3 min-cost grid. Watch how each cell is computed from its top and left neighbors, and how the minimum-cost path emerges.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through the min-cost path DP table fill. Each highlighted line shows a cell being computed.',
      lang: 'js',
      code:
        'const grid = [[1,3,1],[1,5,1],[4,2,1]];\n' +
        'const rows = grid.length;\n' +
        'const cols = grid[0].length;\n' +
        'const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));\n' +
        'dp[0][0] = grid[0][0];\n' +
        'for (let j = 1; j < cols; j++) dp[0][j] = dp[0][j-1] + grid[0][j];\n' +
        'for (let i = 1; i < rows; i++) dp[i][0] = dp[i-1][0] + grid[i][0];\n' +
        'for (let i = 1; i < rows; i++) {\n' +
        '  for (let j = 1; j < cols; j++) {\n' +
        '    dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);\n' +
        '  }\n' +
        '}\n' +
        'console.log("answer", dp[rows-1][cols-1]);\n' +
        'console.log("table row0", dp[0].join(","));\n' +
        'console.log("table row1", dp[1].join(","));\n' +
        'console.log("table row2", dp[2].join(","));',
    },
  ],
};
