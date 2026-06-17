// DSA + Design Patterns — Lesson 39
// P vs NP — Complexity Theory

export const lesson = {
  id: 'dsa-patterns-39',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '39. P vs NP — Complexity Theory',
  checkpoints: [
    { id: 'cp-p-np',       label: 'P and NP' },
    { id: 'cp-np-complete', label: 'NP-Complete' },
    { id: 'cp-reductions',  label: 'Reductions' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'An interviewer mentions "this problem is NP-hard" and moves on. A colleague says the travelling salesman problem "cannot be solved efficiently." A paper claims their compiler optimisation is NP-complete. All three statements carry the same implicit message: there is no known polynomial-time algorithm for this problem, and there is deep theoretical reason to believe none exists. But what does that actually mean? What separates problems that computers can solve quickly from those they cannot? This lesson answers that question — not with hand-waving but with the precise definitions that computer scientists have used since the 1970s.',
      code: null,
    },

    // ── Step 1: Decision problems and complexity classes ──────────────────────

    {
      type: 'narration',
      id: 'step1-decision',
      text: 'Complexity theory focuses on decision problems — problems with a yes/no answer — because they are the cleanest model. "Is there a route from A to B shorter than 100 miles?" is a decision problem; "find the shortest route" is an optimisation problem. Every optimisation problem has a corresponding decision problem, and the two have the same difficulty. P (Polynomial time) is the class of decision problems solvable by a deterministic algorithm in O(n^k) steps for some constant k. Examples: sorting (is this array sorted?), shortest path (is there a path of length ≤ k?), primality testing (is n prime? — proved to be in P in 2002 by Agrawal, Kayal, and Saxena).',
      code: `// Examples of problems in P — polynomial-time algorithms exist

// Is-sorted? — O(n)
function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i-1]) return false   // found an inversion — not sorted
  }
  return true
}

// Is-prime? — O(sqrt(n)) trial division (not the AKS algorithm, but polynomial in digits)
function isPrime(n) {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

// Is-connected? — O(V + E) BFS
function isConnected(adj, n) {
  const visited = new Set([0])
  const queue = [0]
  while (queue.length) {
    const node = queue.shift()
    for (const nb of (adj[node] || [])) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
    }
  }
  return visited.size === n   // true if all nodes reachable from node 0
}

console.log(isSorted([1, 2, 3, 4]))    // true
console.log(isSorted([1, 3, 2, 4]))    // false
console.log(isPrime(17))               // true
console.log(isPrime(18))               // false
const adj = [[1,2],[0,2],[0,1,3],[2]]   // 4-node cycle
console.log(isConnected(adj, 4))       // true`,
    },

    // ── Step 2: NP and polynomial verifiability ───────────────────────────────

    {
      type: 'narration',
      id: 'step2-np',
      text: 'NP (Nondeterministic Polynomial time) is the class of decision problems where, given a proposed solution (a "certificate" or "witness"), you can verify whether the answer is yes in polynomial time. The certificate might be exponentially hard to find, but checking it is fast. Example: the Hamiltonian cycle problem asks whether a graph contains a cycle that visits every node exactly once. Finding such a cycle might require checking n! permutations. But verifying a proposed cycle takes O(n) — just check that consecutive nodes are connected and all n nodes appear. P ⊆ NP always holds: if you can solve a problem in polynomial time, you can certainly verify a solution in polynomial time (just solve it again). Whether P = NP is the most famous unsolved problem in mathematics.',
      code: `// Verifier for Hamiltonian cycle — polynomial time O(n)
// Certificate (witness): a proposed ordering of all nodes claiming to form a cycle
// Verification: check adjacency between consecutive nodes, check all nodes appear once

function verifyHamiltonianCycle(adj, n, cycle) {
  // Check 1: cycle must contain exactly n distinct nodes
  if (cycle.length !== n) return false
  const seen = new Set(cycle)
  if (seen.size !== n) return false        // duplicate nodes
  for (let i = 0; i < n; i++) {
    if (!seen.has(i)) return false         // missing node
  }

  // Check 2: consecutive nodes in cycle must be adjacent
  // Also check that last node connects back to first (it's a cycle)
  for (let i = 0; i < n; i++) {
    const u = cycle[i]
    const v = cycle[(i + 1) % n]           // wrap around: last → first
    if (!(adj[u] || []).includes(v)) return false  // edge u→v must exist
  }

  return true   // verified: O(n) total — checking each of n edges once
}

// Graph: square with a diagonal — 4 nodes, edges 0-1, 1-2, 2-3, 3-0, 0-2
const adj = [[1,2,3],[0,2],[0,1,3],[0,2]]
const n   = 4

const good = [0, 1, 2, 3]   // valid Hamiltonian cycle
const bad  = [0, 1, 3, 2]   // invalid: 1→3 edge doesn't exist

console.log('good cycle valid:', verifyHamiltonianCycle(adj, n, good))   // true
console.log('bad cycle valid:', verifyHamiltonianCycle(adj, n, bad))     // false`,
    },

    // ── Step 3: NP-complete and SAT ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-np-complete',
      text: 'NP-complete problems are the hardest problems in NP. Formally, a problem X is NP-complete if: (1) X is in NP — solutions can be verified in polynomial time, and (2) every problem in NP can be reduced to X in polynomial time. A polynomial-time reduction from problem A to problem B is an algorithm that transforms any instance of A into an instance of B such that A has a "yes" answer if and only if B has a "yes" answer. The Boolean Satisfiability Problem (SAT) was the first problem proved NP-complete (Cook-Levin theorem, 1971). SAT asks: given a Boolean formula in conjunctive normal form (CNF) — AND of clauses, each clause being an OR of literals — is there an assignment of true/false to variables that makes the whole formula true?',
      code: `// SAT verifier — polynomial time O(clauses * literals)
// CNF formula: array of clauses, each clause is array of literals
// Literal: positive integer i means variable i is true; negative -i means variable i is false
// Assignment: object { 1: true, 2: false, ... }

function verifySAT(clauses, assignment) {
  // Every clause must be satisfied (at least one true literal)
  return clauses.every(clause =>
    clause.some(literal => {
      const varIndex = Math.abs(literal)
      const isPositive = literal > 0
      const value = assignment[varIndex]
      return isPositive ? value : !value   // literal satisfied?
    })
  )
}

// Formula: (x1 OR x2) AND (NOT x1 OR x3) AND (NOT x2 OR NOT x3)
// Variables: x1=1, x2=2, x3=3
const clauses = [
  [1, 2],       // x1 OR x2
  [-1, 3],      // NOT x1 OR x3
  [-2, -3],     // NOT x2 OR NOT x3
]

const assignment1 = { 1: false, 2: true, 3: true }    // x1=F, x2=T, x3=T
const assignment2 = { 1: true,  2: true, 3: false }   // x1=T, x2=T, x3=F

console.log('assignment1 satisfies:', verifySAT(clauses, assignment1))   // true
console.log('assignment2 satisfies:', verifySAT(clauses, assignment2))   // check

// Brute force solver — exponential O(2^n), shows why SAT is hard to SOLVE
function bruteForceSAT(clauses, numVars) {
  for (let mask = 0; mask < (1 << numVars); mask++) {
    const assignment = {}
    for (let i = 1; i <= numVars; i++) {
      assignment[i] = Boolean(mask & (1 << (i - 1)))
    }
    if (verifySAT(clauses, assignment)) return assignment
  }
  return null   // unsatisfiable
}

const solution = bruteForceSAT(clauses, 3)
console.log('satisfying assignment:', solution)`,
    },

    // ── Challenge 1: clique verifier ──────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-clique-verifier',
      text: 'The Clique problem: given an undirected graph and an integer k, does the graph contain a clique of size k? (A clique is a subset of k nodes where every pair is connected.) Implement verifyClique(adj, clique) that checks if the proposed clique is valid in O(k²) time. Test it on a graph where nodes 0,1,2 form a triangle (clique of size 3), and verify that [0,1,2] is a valid clique but [0,1,3] is not (assume node 3 is not connected to all of 0,1,2). Log both results.',
      expectedOutput: null,
      startCode: `// adj[i] = array of neighbours of node i (undirected graph)
// clique = array of node indices claiming to form a clique
// A clique: every pair of nodes in the subset must share an edge

function verifyClique(adj, clique) {
  // Check every pair (i, j) in the clique
  for (let i = 0; i < clique.length; i++) {
    for (let j = i + 1; j < clique.length; j++) {
      const u = clique[i], v = clique[j]
      // YOUR CODE HERE: if u and v are not adjacent, return false
    }
  }
  return true   // all pairs connected
}

// Graph: 0-1, 1-2, 0-2 (triangle), plus node 3 connected only to 0
const adj = [
  [1, 2, 3],  // node 0: connected to 1,2,3
  [0, 2],     // node 1: connected to 0,2
  [0, 1],     // node 2: connected to 0,1
  [0],        // node 3: connected only to 0
]

console.log('clique [0,1,2]:', verifyClique(adj, [0, 1, 2]))   // true
console.log('clique [0,1,3]:', verifyClique(adj, [0, 1, 3]))   // false (1-3 edge missing)
`,
      hint: 'if (!(adj[u]||[]).includes(v)) return false',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        const trueCount  = (flat.match(/true/g)  || []).length
        const falseCount = (flat.match(/false/g) || []).length
        return trueCount >= 1 && falseCount >= 1
      },
    },

    { type: 'checkpoint', id: 'cp-p-np' },

    // ── Step 4: NP-hard and canonical reductions ──────────────────────────────

    {
      type: 'narration',
      id: 'step4-reductions',
      text: 'NP-hard means "at least as hard as every NP-complete problem." A problem is NP-hard if every problem in NP can be reduced to it in polynomial time — but it need not itself be in NP. Examples of NP-hard problems that are also NP-complete: 3-SAT (each clause has exactly 3 literals), Clique (find k mutually connected nodes), Vertex Cover (find k nodes that touch every edge), Hamiltonian Cycle, Travelling Salesman Decision (is there a tour of length ≤ k?). Reductions form a chain: SAT → 3-SAT → Clique → Vertex Cover. If you can solve any one of these in polynomial time, you can solve them all — and P = NP. The practical implication: if your problem is NP-hard, seek approximation algorithms, heuristics, or exponential-time exact solvers on small inputs.',
      code: `// Illustration: brute-force clique finder — exponential O(2^n * k^2)
// Demonstrates that there is no known polynomial-time algorithm

function findClique(adj, n, k) {
  // Try every subset of size k
  function choose(start, current) {
    if (current.length === k) {
      // Verify this subset is a clique
      for (let i = 0; i < k; i++) {
        for (let j = i + 1; j < k; j++) {
          if (!(adj[current[i]] || []).includes(current[j])) return null
        }
      }
      return [...current]   // found a clique
    }
    for (let i = start; i < n; i++) {
      current.push(i)
      const result = choose(i + 1, current)
      if (result) return result
      current.pop()
    }
    return null
  }
  return choose(0, [])
}

// Small graph: 5 nodes, various edges — looking for clique of size 3
const adj5 = [
  [1,2,3],   // 0 connected to 1,2,3
  [0,2],     // 1 connected to 0,2
  [0,1,3,4], // 2 connected to 0,1,3,4
  [0,2,4],   // 3 connected to 0,2,4
  [2,3],     // 4 connected to 2,3
]

console.log('clique of size 3:', findClique(adj5, 5, 3))   // [0,1,2] or similar
console.log('clique of size 4:', findClique(adj5, 5, 4))   // null or [2,3,4,...] if exists

// On n=20 nodes, 2^20 = 1,048,576 subsets — already slow
// On n=50 nodes, 2^50 ≈ 10^15 — completely intractable`,
    },

    // ── Challenge 2: brute-force SAT ──────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-sat-brute',
      text: 'Implement bruteForceSAT(clauses, numVars) that tries all 2^numVars assignments and returns the first satisfying one, or null if unsatisfiable. Test on: clauses = [[1,2],[-1,3],[-2,-3]] with 3 variables (satisfiable). Also test clauses = [[1],[-1]] with 1 variable (unsatisfiable — x1 must be both true and false). Log the results.',
      expectedOutput: null,
      startCode: `function verifySAT(clauses, assignment) {
  return clauses.every(clause =>
    clause.some(literal => {
      const v = Math.abs(literal)
      return literal > 0 ? assignment[v] : !assignment[v]
    })
  )
}

function bruteForceSAT(clauses, numVars) {
  // Try all 2^numVars bit masks
  for (let mask = 0; mask < (1 << numVars); mask++) {
    const assignment = {}
    for (let i = 1; i <= numVars; i++) {
      // YOUR CODE HERE: set assignment[i] based on bit (i-1) of mask
    }
    if (verifySAT(clauses, assignment)) return assignment
  }
  return null
}

const satisfiable   = [[1,2],[-1,3],[-2,-3]]
const unsatisfiable = [[1],[-1]]

console.log('satisfiable result:', bruteForceSAT(satisfiable, 3))
console.log('unsatisfiable result:', bruteForceSAT(unsatisfiable, 1))
`,
      hint: 'assignment[i] = Boolean(mask & (1 << (i-1)))',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('null') && !flat.startsWith('null')
      },
    },

    { type: 'checkpoint', id: 'cp-np-complete' },

    // ── Step 5: Reductions in practice ───────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-reductions-practice',
      text: 'A polynomial-time reduction from problem A to problem B means: given any instance of A, construct an instance of B in polynomial time such that the answer to B is the same as the answer to A. If you have a solver for B, you can solve A by transforming the input. The 3-colouring problem (can a graph be coloured with 3 colours so no adjacent nodes share a colour?) can be reduced to SAT: create 3 Boolean variables per node (one per colour), add clauses that exactly one colour is chosen per node, and add clauses that adjacent nodes have different colours. The resulting SAT formula is satisfiable if and only if the original graph is 3-colourable. This reduction is polynomial: O(V + E) clauses for a graph with V vertices and E edges.',
      code: `// Reduction: 3-colouring → SAT
// Variables: for node i and colour c (0,1,2): variable index = i*3 + c + 1
// Clauses:
//   At-least-one-colour per node: (c0 OR c1 OR c2) for each node
//   At-most-one-colour: for each pair of colours, NOT both: (-c0 OR -c1) for each node
//   Adjacent nodes different: for each edge (u,v) and each colour c: (-u_c OR -v_c)

function threeColorToSAT(adj, n) {
  const clauses = []
  const varId = (node, color) => node * 3 + color + 1  // 1-indexed variable

  for (let i = 0; i < n; i++) {
    // At least one colour: node i has colour 0 OR colour 1 OR colour 2
    clauses.push([varId(i,0), varId(i,1), varId(i,2)])

    // At most one colour: for each pair, not both
    clauses.push([-varId(i,0), -varId(i,1)])
    clauses.push([-varId(i,0), -varId(i,2)])
    clauses.push([-varId(i,1), -varId(i,2)])
  }

  for (let u = 0; u < n; u++) {
    for (const v of (adj[u] || [])) {
      if (u < v) {  // each edge once
        for (let c = 0; c < 3; c++) {
          // u and v cannot both have colour c
          clauses.push([-varId(u,c), -varId(v,c)])
        }
      }
    }
  }

  return { clauses, numVars: n * 3 }
}

// Triangle graph: 3 nodes, all connected — needs exactly 3 colours (3-colourable)
const triangle = [[1,2],[0,2],[0,1]]
const { clauses, numVars } = threeColorToSAT(triangle, 3)
console.log('SAT clauses for 3-colouring a triangle:', clauses.length)
// The triangle is 3-colourable, so SAT should be satisfiable
// (brute-force check left as exercise — exponential, educational only)`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting-point',
      text: 'This is not a DSA + design pattern lesson in the usual sense — there is no pattern to apply, and the honest conclusion is that NP-complete problems have no known efficient algorithm. The "meeting point" here is between theory and practice: knowing a problem is NP-hard tells you to stop searching for a polynomial-time exact algorithm and start looking elsewhere — approximation algorithms (guaranteed ratio from optimal), parameterised algorithms (exponential only in a small parameter, not n), heuristics (no guarantee but fast in practice), or problem reformulation (perhaps the actual instances you face have special structure that makes them tractable). Understanding the theory shapes which tools you reach for.',
      code: `// Approximation for Vertex Cover — 2-approximation in O(V + E)
// Vertex Cover: find a set S of nodes such that every edge has at least one endpoint in S
// Optimal VC is NP-complete; this greedy gives |S| <= 2 * OPT
// Greedy: pick any uncovered edge, add BOTH endpoints to S, mark all their edges covered

function approxVertexCover(adj, n) {
  const covered = new Set()   // edges covered
  const cover   = new Set()   // nodes in cover

  for (let u = 0; u < n; u++) {
    for (const v of (adj[u] || [])) {
      if (u < v) {  // each edge once
        const edgeKey = u + '-' + v
        if (!covered.has(edgeKey)) {
          cover.add(u)           // add both endpoints
          cover.add(v)
          // Mark all edges of u and v as covered
          for (const nb of (adj[u] || [])) covered.add(Math.min(u,nb) + '-' + Math.max(u,nb))
          for (const nb of (adj[v] || [])) covered.add(Math.min(v,nb) + '-' + Math.max(v,nb))
        }
      }
    }
  }

  return [...cover]
}

// Petersen-like graph
const adj = [[1,4],[0,2],[1,3],[2,4],[3,0]]
const vc = approxVertexCover(adj, 5)
console.log('approx vertex cover:', vc)
console.log('cover size:', vc.length, '(optimal for 5-cycle is 2 or 3)')`,
    },

    // ── Challenge 3: combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Implement verifyVertexCover(adj, n, cover) that checks in O(V + E) whether the proposed set of nodes covers every edge. Then test it on the 5-cycle graph (adj = [[1,4],[0,2],[1,3],[2,4],[3,0]]): verify that [1,3] covers all edges (expected true), and that [0] does not cover all edges (expected false). Log both results labelled.',
      expectedOutput: null,
      startCode: `function verifyVertexCover(adj, n, cover) {
  const coverSet = new Set(cover)
  // Check every edge: at least one endpoint must be in the cover
  for (let u = 0; u < n; u++) {
    for (const v of (adj[u] || [])) {
      if (u < v) {  // each edge once
        // YOUR CODE HERE: if neither u nor v is in coverSet, return false
      }
    }
  }
  return true
}

const adj = [[1,4],[0,2],[1,3],[2,4],[3,0]]
const n   = 5

console.log('[1,3] covers all edges:', verifyVertexCover(adj, n, [1, 3]))   // true
console.log('[0] covers all edges:', verifyVertexCover(adj, n, [0]))         // false
`,
      hint: 'if (!coverSet.has(u) && !coverSet.has(v)) return false',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        const trueCount  = (flat.match(/true/gi)  || []).length
        const falseCount = (flat.match(/false/gi) || []).length
        return trueCount >= 1 && falseCount >= 1
      },
    },

    { type: 'checkpoint', id: 'cp-reductions' },

    // ── Step 6: P=NP implications ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-implications',
      text: 'Why does P vs NP matter practically? Cryptography (RSA, elliptic curve) relies on the assumption that factoring large integers and computing discrete logarithms are hard — if P = NP, all public-key cryptography breaks instantly. Optimisation: logistics companies spend billions running approximation algorithms for routing — if P = NP, exact optimal solutions become feasible. Biology: protein folding prediction is NP-hard in simplified models — a P = NP proof would transform drug discovery. Most researchers believe P ≠ NP, but the separation has never been proved. The Clay Mathematics Institute offers a $1 million Millennium Prize for a proof in either direction. For your day-to-day work, the practical takeaway is this: if your problem is in P, look for a better polynomial-time algorithm; if it is NP-complete, switch to a different strategy.',
      code: `// Practical decision tree: what to do when a problem is hard

// Step 1: Is the problem NP-complete? Check if it reduces from a known NP-complete problem.
// If YES: do not search for a polynomial exact algorithm.

// Options for NP-complete problems:
// A. Approximation: polynomial time, guaranteed approximation ratio
// B. Parameterised: exact, but exponential only in a small "parameter"
// C. Heuristic: no guarantee, but fast in practice
// D. Special cases: is your input always small n? Use exponential exact solver.
// E. Reformulation: does the problem have extra structure you can exploit?

// Example: Knapsack (NP-complete in general)
// — if all weights are integers bounded by W, DP in O(nW) — "pseudo-polynomial"
// — if n is small (say ≤ 20), brute force 2^n is feasible
// — if approximate is fine, greedy by value/weight ratio gives 2-approximation

// 0-1 Knapsack DP — O(n * capacity) — pseudo-polynomial
function knapsack(weights, values, capacity) {
  const n  = weights.length
  const dp = Array.from({length: n+1}, () => new Array(capacity+1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i-1][w]                                    // don't take item i
      if (weights[i-1] <= w) {                                  // can we take item i?
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])  // take it
      }
    }
  }

  return dp[n][capacity]
}

console.log(knapsack([2,3,4,5],[3,4,5,6], 8))   // 10 (items 1 and 3: weight 6, value 8)
// This works because capacity=8 is small — for capacity=10^9, this DP would be impractical`,
    },

    // ── Challenge 4: combined knapsack ────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-knapsack',
      text: 'Use the Knapsack DP on weights=[1,3,4,5], values=[1,4,5,7], capacity=7. Expected answer: 9 (items with weight 3+4=7, values 4+5=9). Log the answer labelled. Also verify that the empty knapsack (capacity=0) returns 0.',
      expectedOutput: null,
      startCode: `function knapsack(weights, values, capacity) {
  const n  = weights.length
  const dp = Array.from({length: n+1}, () => new Array(capacity+1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i-1][w]
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])
      }
    }
  }

  return dp[n][capacity]
}

// YOUR CODE HERE: call knapsack with the given inputs and log labelled results
const weights  = [1, 3, 4, 5]
const values   = [1, 4, 5, 7]
const capacity = 7
`,
      hint: 'console.log("max value:", knapsack(weights,values,capacity)); console.log("empty:", knapsack(weights,values,0));',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(9) && nums.includes(0)
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the Knapsack DP. Watch the 2D table fill row by row. For each item i and capacity w, see the comparison: is it better to skip item i (dp[i-1][w]) or include it (dp[i-1][w - weights[i-1]] + values[i-1])? Watch how dp[n][capacity] accumulates the optimal value. This is the tractable sub-case of an NP-complete problem — tractable because capacity is small.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-np',
      text: 'Step through the Knapsack DP. Watch the table fill for each item/capacity combination. Observe how the "take or skip" decision propagates through the table. Compare with the brute-force SAT solver — the SAT loop tries 2^n assignments, doubling work with each new variable, while the Knapsack loop adds only one row per item.',
      code: `function knapsack(weights,values,capacity){
  const n=weights.length
  const dp=Array.from({length:n+1},()=>new Array(capacity+1).fill(0))
  for(let i=1;i<=n;i++)
    for(let w=0;w<=capacity;w++){
      dp[i][w]=dp[i-1][w]
      if(weights[i-1]<=w)dp[i][w]=Math.max(dp[i][w],dp[i-1][w-weights[i-1]]+values[i-1])
    }
  return dp[n][capacity]
}
console.log(knapsack([1,3,4,5],[1,4,5,7],7))
console.log(knapsack([2,3,4,5],[3,4,5,6],8))`,
      lang: 'js',
    },

  ],
}
