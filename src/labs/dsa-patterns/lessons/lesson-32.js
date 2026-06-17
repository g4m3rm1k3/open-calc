// DSA + Design Patterns — Lesson 32
export const lesson = {
  id: 'dsa-patterns-32',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '32. Backtracking + State Pattern',
  checkpoints: [
    { id: 'cp-backtrack', label: 'Backtracking' },
    { id: 'cp-nqueens', label: 'N-Queens' },
    { id: 'cp-state', label: 'State Pattern' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      text: 'You need to find all valid arrangements of a set of elements — all permutations of a list, all ways to place chess queens so none attacks another, all subsets that sum to a target. The naive approach builds every possible arrangement and checks validity at the end. But most arrangements fail partway through. You need a way to detect failure early and undo partial work — without rebuilding from scratch each time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-1',
      text: 'Backtracking is a systematic method for exploring all configurations of a problem. It builds a solution incrementally, one choice at a time. At each step it checks a constraint — if the partial solution is already invalid, it prunes (abandons) that branch immediately and backtracks — undoing the last choice and trying the next alternative. This turns an exponential search into a much smaller explored tree in practice.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-2',
      text: 'Permutations are the simplest backtracking example. To generate all permutations of [1,2,3]: at each position, try placing each unused element. After placing, recurse for the next position. After the recursion returns, remove the placed element (backtrack) and try the next. The call tree has n! leaves but backtracking ensures we visit each permutation exactly once. Time: O(n × n!) because each permutation takes O(n) to copy.',
      code:
        'function permutations(arr) {\n' +
        '  const result = [];\n' +
        '\n' +
        '  function backtrack(current, remaining) {\n' +
        '    if (remaining.length === 0) {\n' +
        '      result.push([...current]); // ← NEW: found a complete permutation\n' +
        '      return;\n' +
        '    }\n' +
        '    for (let i = 0; i < remaining.length; i++) {\n' +
        '      current.push(remaining[i]); // choose  // ← NEW\n' +
        '      backtrack(current, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);\n' +
        '      current.pop(); // backtrack: undo the choice  // ← NEW\n' +
        '    }\n' +
        '  }\n' +
        '\n' +
        '  backtrack([], arr);\n' +
        '  return result;\n' +
        '}\n' +
        '\n' +
        'const perms = permutations([1, 2, 3]);\n' +
        'console.log("count", perms.length);\n' +
        'console.log("first", JSON.stringify(perms[0]));',
    },
    {
      type: 'narration',
      id: 'dsa-3',
      text: 'N-Queens: place N non-attacking queens on an N×N chessboard. Two queens attack each other if they share a row, column, or diagonal. The constraint check: for a queen placed at (row, col), no previous queen shares the same column, or the diagonals (row - prevRow === ±(col - prevCol)). We place one queen per row (since no two can share a row), so the search tree has at most N! leaves, heavily pruned by constraint checks.',
      code:
        'function solveNQueens(n) {\n' +
        '  const solutions = [];\n' +
        '  const queens = []; // queens[row] = col placement\n' +
        '\n' +
        '  function isValid(row, col) { // ← NEW\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = queens[r];\n' +
        '      if (c === col) return false; // same column\n' +
        '      if (Math.abs(r - row) === Math.abs(c - col)) return false; // diagonal\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '\n' +
        '  function backtrack(row) {\n' +
        '    if (row === n) { solutions.push([...queens]); return; } // ← NEW\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      if (isValid(row, col)) {\n' +
        '        queens[row] = col; // place queen  // ← NEW\n' +
        '        backtrack(row + 1);\n' +
        '        queens[row] = undefined; // backtrack  // ← NEW\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '\n' +
        '  backtrack(0);\n' +
        '  return solutions;\n' +
        '}\n' +
        '\n' +
        'const sol4 = solveNQueens(4);\n' +
        'console.log("4-queens count", sol4.length);\n' +
        'console.log("first solution", JSON.stringify(sol4[0]));',
    },
    {
      type: 'narration',
      id: 'dsa-4',
      text: 'Subset sum: find all subsets of an array that sum to a target. At each element we make a binary choice — include it or exclude it. If the running sum exceeds the target, prune immediately. This makes subset sum a good example of constraint pruning reducing the search space from 2^n to something much smaller in practice.',
      code:
        'function subsetSum(arr, target) {\n' +
        '  const results = [];\n' +
        '\n' +
        '  function backtrack(index, current, sum) {\n' +
        '    if (sum === target) { results.push([...current]); return; } // ← NEW\n' +
        '    if (sum > target || index >= arr.length) return; // prune  // ← NEW\n' +
        '\n' +
        '    current.push(arr[index]);\n' +
        '    backtrack(index + 1, current, sum + arr[index]); // include\n' +
        '    current.pop();\n' +
        '    backtrack(index + 1, current, sum); // exclude  // ← NEW\n' +
        '  }\n' +
        '\n' +
        '  backtrack(0, [], 0);\n' +
        '  return results;\n' +
        '}\n' +
        '\n' +
        'console.log("subsets summing to 6", JSON.stringify(subsetSum([1,2,3,4,5], 6)));',
    },
    {
      type: 'narration',
      id: 'dsa-5',
      text: 'Each recursive call in backtracking represents a distinct state of the search: which choices have been made, what the current partial solution looks like, what choices remain. When we backtrack, we restore the previous state. This is precisely what the State design pattern formalizes: an object whose behavior depends on its current state, with explicit transitions between states.',
      code: null,
    },
    {
      type: 'narration',
      id: 'dsa-6',
      text: 'The State pattern encapsulates each state as an object with an enter() and execute() method. The context holds the current state object and delegates to it. For backtracking, each recursive frame maps to a state: PlacingState (trying the next queen), ValidatingState (checking constraints), and SolutionState (recording a complete solution). Making states explicit also enables the Memento pattern — you can snapshot a state and restore it, which is exactly what backtracking does implicitly.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-1',
      text: 'Generate all permutations of [1, 2, 3]. Print the count and the full array with console.log.',
      expectedOutput: null,
      startCode:
        'function permutations(arr) {\n' +
        '  const result = [];\n' +
        '  function backtrack(current, remaining) {\n' +
        '    if (remaining.length === 0) { result.push([...current]); return; }\n' +
        '    for (let i = 0; i < remaining.length; i++) {\n' +
        '      // TODO: choose, recurse, backtrack\n' +
        '    }\n' +
        '  }\n' +
        '  backtrack([], arr);\n' +
        '  return result;\n' +
        '}\n' +
        '\n' +
        'const perms = permutations([1, 2, 3]);\n' +
        'console.log(perms.length);\n' +
        'console.log(JSON.stringify(perms));',
      hint: 'Inside the loop: current.push(remaining[i]), recurse with remaining without index i, then current.pop().',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '6');
      },
    },
    { type: 'checkpoint', id: 'cp-backtrack' },
    {
      type: 'narration',
      id: 'pattern-intro',
      text: 'The State pattern says: instead of encoding state as scattered variables and conditionals, make each state a first-class object with its own behavior. The context delegates to whichever state it currently holds. Transitions are explicit method calls: context.transitionTo(new NextState()). This maps perfectly onto backtracking: each recursive level is a state, entering is placing a queen, exiting is backtracking.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pattern-code',
      text: 'Here is a State-pattern wrapper for the N-Queens solver. Each state knows how to advance (place the next queen) and how to transition. BoardState holds the current queens array and exposes a clone() method, which is the Memento concept: snapshot the state before advancing so it can be restored on backtrack.',
      code:
        'class BoardState {\n' +
        '  constructor(queens, n) {\n' +
        '    this.queens = [...queens]; // snapshot (Memento)  // ← NEW\n' +
        '    this.n = n;\n' +
        '  }\n' +
        '\n' +
        '  isValid(row, col) {\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = this.queens[r];\n' +
        '      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '\n' +
        '  place(row, col) {\n' +
        '    const next = new BoardState(this.queens, this.n); // ← NEW: clone before mutating\n' +
        '    next.queens[row] = col;\n' +
        '    return next;\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        'function solveWithState(n) {\n' +
        '  const solutions = [];\n' +
        '  function dfs(state, row) {\n' +
        '    if (row === n) { solutions.push([...state.queens]); return; }\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      if (state.isValid(row, col)) {\n' +
        '        dfs(state.place(row, col), row + 1); // ← NEW: transition to new state\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  dfs(new BoardState([], n), 0);\n' +
        '  return solutions;\n' +
        '}\n' +
        '\n' +
        'console.log("4-queens with state", solveWithState(4).length);',
    },
    {
      type: 'narration',
      id: 'pattern-meeting',
      text: 'The meeting point: backtracking IS the State pattern implemented implicitly on the call stack. Every recursive call creates a new "state frame" — the queens array at that depth. Returning from the call restores the previous frame. The State pattern makes this implicit stack explicit: BoardState objects are the frames, place() creates transitions, and each state is immutable. Immutable state objects are the functional equivalent of the "undo" that backtracking performs on the call stack.',
      code: null,
    },
    {
      type: 'challenge',
      id: 'challenge-2',
      text: 'Solve 4-Queens using the solveNQueens function. Print the number of valid solutions.',
      expectedOutput: null,
      startCode:
        'function solveNQueens(n) {\n' +
        '  const solutions = [];\n' +
        '  const queens = [];\n' +
        '  function isValid(row, col) {\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = queens[r];\n' +
        '      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '  function backtrack(row) {\n' +
        '    if (row === n) { solutions.push([...queens]); return; }\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      // TODO: check isValid, place, recurse, backtrack\n' +
        '    }\n' +
        '  }\n' +
        '  backtrack(0);\n' +
        '  return solutions;\n' +
        '}\n' +
        '\n' +
        'console.log(solveNQueens(4).length);',
      hint: 'Inside the loop: if (isValid(row, col)) { queens[row] = col; backtrack(row + 1); queens[row] = undefined; }',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '2');
      },
    },
    { type: 'checkpoint', id: 'cp-nqueens' },
    {
      type: 'narration',
      id: 'combined-narration',
      text: 'Combining backtracking and explicit state objects gives us a solver that is both correct and debuggable. The BoardState snapshots make it easy to inspect the search tree at any depth. This is why the State + Memento combination appears in many AI search engines and game solvers — you can serialize a state, send it over the network, or replay it for debugging. The algorithm\'s correctness does not change; what changes is observability.',
      code:
        'class BoardState {\n' +
        '  constructor(queens, n) { this.queens = [...queens]; this.n = n; }\n' +
        '  isValid(row, col) {\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = this.queens[r];\n' +
        '      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '  place(row, col) { const s = new BoardState(this.queens, this.n); s.queens[row] = col; return s; }\n' +
        '  serialize() { return JSON.stringify(this.queens); } // ← NEW: Memento-style snapshot\n' +
        '}\n' +
        '\n' +
        'function solveWithLogging(n) {\n' +
        '  const solutions = [];\n' +
        '  let calls = 0;\n' +
        '  function dfs(state, row) {\n' +
        '    calls++;\n' +
        '    if (row === n) { solutions.push(state.serialize()); return; }\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      if (state.isValid(row, col)) dfs(state.place(row, col), row + 1);\n' +
        '    }\n' +
        '  }\n' +
        '  dfs(new BoardState([], n), 0);\n' +
        '  return { solutions, calls };\n' +
        '}\n' +
        '\n' +
        'const { solutions, calls } = solveWithLogging(4);\n' +
        'console.log("solutions", solutions.length, "calls", calls);',
    },
    {
      type: 'challenge',
      id: 'challenge-3',
      text: 'Using the BoardState class, solve 4-Queens and print the number of solutions.',
      expectedOutput: null,
      startCode:
        'class BoardState {\n' +
        '  constructor(queens, n) { this.queens = [...queens]; this.n = n; }\n' +
        '  isValid(row, col) {\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = this.queens[r];\n' +
        '      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '  place(row, col) { const s = new BoardState(this.queens, this.n); s.queens[row] = col; return s; }\n' +
        '}\n' +
        '\n' +
        'function solve(n) {\n' +
        '  const solutions = [];\n' +
        '  function dfs(state, row) {\n' +
        '    if (row === n) { solutions.push([...state.queens]); return; }\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      // TODO: check isValid, then recurse with state.place(row, col)\n' +
        '    }\n' +
        '  }\n' +
        '  dfs(new BoardState([], n), 0);\n' +
        '  return solutions;\n' +
        '}\n' +
        '\n' +
        'console.log(solve(4).length);',
      hint: 'if (state.isValid(row, col)) { dfs(state.place(row, col), row + 1); } — no explicit backtrack needed because place() returns a new immutable state.',
      validate: ({ logs }) => {
        return logs.some(l => String(l).trim() === '2');
      },
    },
    { type: 'checkpoint', id: 'cp-state' },
    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Let\'s trace the N-Queens backtracking search step by step. Watch how queens are placed, constraints are checked, and invalid branches are pruned before going deeper.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-1',
      text: 'Step through 4-Queens backtracking: placement, validation, and pruning in action.',
      lang: 'js',
      code:
        'function solveNQueens(n) {\n' +
        '  const solutions = [];\n' +
        '  const queens = [];\n' +
        '  function isValid(row, col) {\n' +
        '    for (let r = 0; r < row; r++) {\n' +
        '      const c = queens[r];\n' +
        '      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n' +
        '    }\n' +
        '    return true;\n' +
        '  }\n' +
        '  function backtrack(row) {\n' +
        '    if (row === n) {\n' +
        '      console.log("solution", JSON.stringify([...queens]));\n' +
        '      solutions.push([...queens]);\n' +
        '      return;\n' +
        '    }\n' +
        '    for (let col = 0; col < n; col++) {\n' +
        '      if (isValid(row, col)) {\n' +
        '        queens[row] = col;\n' +
        '        backtrack(row + 1);\n' +
        '        queens[row] = undefined;\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  backtrack(0);\n' +
        '  return solutions;\n' +
        '}\n' +
        'console.log("total", solveNQueens(4).length);',
    },
  ],
};
