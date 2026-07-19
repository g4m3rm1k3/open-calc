/**
 * Walks src/, parses imports, runs a 3-D force simulation, writes
 * src/data/codebaseGraph.js with every file as a node and every
 * resolvable import as an edge.
 *
 * Run:  node scripts/generate-graph.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, resolve, relative, extname, basename } from 'path'
import { fileURLToPath } from 'url'

const ROOT  = dirname(dirname(fileURLToPath(import.meta.url)))
const SRC   = join(ROOT, 'src')

// ── 1. Collect all source files ─────────────────────────────────────────────
// Exclude pure content/data directories — they're lesson payloads, not app architecture
const SKIP_DIRS = new Set(['courses', 'content', 'assets', 'docs'])

function walk(dir, depth = 0) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    // Skip content-heavy dirs at the top level of src/
    if (depth === 0 && SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walk(full, depth + 1))
    } else if (/\.(jsx?|tsx?)$/.test(entry)) {
      results.push(full)
    }
  }
  return results
}

const allFiles   = walk(SRC)
const relOf      = p  => relative(SRC, p).replace(/\\/g, '/')
const relSet     = new Set(allFiles.map(relOf))

// ── 2. Parse imports from each file ─────────────────────────────────────────
const IMPORT_RE = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g
const DYNAMIC_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g

function extractImports(content) {
  const paths = []
  let m
  IMPORT_RE.lastIndex = 0
  while ((m = IMPORT_RE.exec(content)) !== null) paths.push(m[1])
  DYNAMIC_RE.lastIndex = 0
  while ((m = DYNAMIC_RE.exec(content)) !== null) paths.push(m[1])
  return paths.filter(p => p.startsWith('.'))
}

function resolveImport(fromAbs, importPath) {
  const base = resolve(dirname(fromAbs), importPath)
  const EXTS = ['.jsx', '.js', '.tsx', '.ts', '']
  for (const ext of EXTS) {
    try { statSync(base + ext); return base + ext } catch {}
  }
  for (const ext of EXTS) {
    try { statSync(join(base, 'index' + ext)); return join(base, 'index' + ext) } catch {}
  }
  return null
}

// ── 3. Extract optional meta export from a file ─────────────────────────────
// Looks for:  export const meta = { title: '...', description: '...', ... }
// Only handles simple string values — no computed properties or expressions.
function extractMeta(src) {
  const marker = 'export const meta = {'
  const start  = src.indexOf(marker)
  if (start === -1) return null

  let depth = 0, i = start + marker.length - 1
  while (i < src.length) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') { depth--; if (depth === 0) break }
    i++
  }

  const block  = src.slice(start + marker.length, i)
  const fields = {}
  const re     = /(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/g
  let m
  while ((m = re.exec(block)) !== null) {
    fields[m[1]] = (m[2] ?? m[3] ?? m[4]).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\`/g, '`').replace(/\\n/g, '\n')
  }
  return Object.keys(fields).length > 0 ? fields : null
}

// ── 4. Build node + edge lists ───────────────────────────────────────────────
const nodes = allFiles.map((abs, i) => ({ id: relOf(abs), abs, idx: i }))
const idxOf  = Object.fromEntries(nodes.map(n => [n.id, n.idx]))

const edgeSet = new Set()
const edges   = []   // [fromIdx, toIdx]

for (const node of nodes) {
  let content
  try { content = readFileSync(node.abs, 'utf8') } catch { continue }
  node.meta = extractMeta(content)
  for (const imp of extractImports(content)) {
    const abs = resolveImport(node.abs, imp)
    if (!abs) continue
    const rel = relOf(abs)
    if (!relSet.has(rel)) continue
    const toIdx = idxOf[rel]
    if (toIdx === undefined || toIdx === node.idx) continue
    const key = `${node.idx}:${toIdx}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      edges.push([node.idx, toIdx])
    }
  }
}

console.log(`Nodes: ${nodes.length}  Edges: ${edges.length}`)

// ── 5. Assign colours by top-level folder ───────────────────────────────────
const FOLDER_COLORS = {
  components:  [129, 140, 248],  // indigo
  pages:       [56,  189, 248],  // sky
  courses:     [52,  211, 153],  // emerald
  labs:        [163, 230,  53],  // lime
  games:       [251, 146,  60],  // orange
  features:    [251, 191,  36],  // amber
  hooks:       [232, 121, 249],  // fuchsia
  context:     [148, 163, 184],  // slate
  tools:       [250, 204,  21],  // yellow
  utils:       [94,  234, 212],  // teal
  data:        [196, 181, 253],  // violet-light
  reference:   [253, 164, 175],  // rose
  engines:     [134, 239, 172],  // green-light
  three:       [125, 211, 252],  // sky-light
  scripts:     [148, 163, 184],  // slate
  styles:      [249, 168, 212],  // pink
  default:     [100, 116, 139],  // slate-500
}

function folderColor(id) {
  const folder = id.split('/')[0]
  return FOLDER_COLORS[folder] ?? FOLDER_COLORS.default
}

// ── 6. Seeded pseudo-random (stable across re-runs) ─────────────────────────
let seed = 42
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff
  return seed / 0x7fffffff
}

// ── 7. Force-directed 3-D layout ─────────────────────────────────────────────
const N = nodes.length
const px = new Float64Array(N), py = new Float64Array(N), pz = new Float64Array(N)
const vx = new Float64Array(N), vy = new Float64Array(N), vz = new Float64Array(N)

// Initialise on a sphere so all nodes start spread out
for (let i = 0; i < N; i++) {
  const theta = rand() * Math.PI * 2
  const phi   = Math.acos(2 * rand() - 1)
  const r     = 5 + rand() * 6
  px[i] = r * Math.sin(phi) * Math.cos(theta)
  py[i] = r * Math.sin(phi) * Math.sin(theta)
  pz[i] = r * Math.cos(phi)
}

// Build adjacency set for O(1) edge lookup during spring forces
const adjSet = new Set(edges.map(([a, b]) => `${a}:${b}`))
const hasEdge = (a, b) => adjSet.has(`${a}:${b}`) || adjSet.has(`${b}:${a}`)

const ITERATIONS = 180
// K_REP is scaled inversely with N so the *total* repulsion force per node
// stays constant regardless of graph size. Without this, a 1400-node graph
// blows up in the first few iterations because each node receives N×K_REP
// force — causing exponential velocity growth and NaN positions.
const K_REP  = (2.0 * 800) / N   // repulsion strength (N-normalised)
const K_SPR  = 0.04               // spring attraction
const DAMP   = 0.88               // velocity damping (higher = more stable)
const CENTER = 0.003              // gentle pull toward origin
const MAX_F  = 2.0                // per-axis force clamp (prevents NaN from node overlap)

console.log('Running force simulation...')
const tick = Math.floor(ITERATIONS / 4)

for (let iter = 0; iter < ITERATIONS; iter++) {
  if ((iter + 1) % tick === 0) process.stdout.write(`  ${Math.round((iter+1)/ITERATIONS*100)}%\n`)

  const fx = new Float64Array(N)
  const fy = new Float64Array(N)
  const fz = new Float64Array(N)

  // Repulsion between all pairs — O(N²)
  // Each force contribution is clamped to MAX_F per axis so that two nodes
  // which start at nearly-identical positions can't inject infinite energy.
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = px[i] - px[j], dy = py[i] - py[j], dz = pz[i] - pz[j]
      const dist2 = dx*dx + dy*dy + dz*dz + 0.5   // +0.5 softens close-range
      const dist  = Math.sqrt(dist2)
      const f     = Math.min(K_REP / dist2, MAX_F) // clamp prevents explosion
      const ux = dx/dist, uy = dy/dist, uz = dz/dist
      fx[i] += ux*f; fy[i] += uy*f; fz[i] += uz*f
      fx[j] -= ux*f; fy[j] -= uy*f; fz[j] -= uz*f
    }
  }

  // Spring attraction along edges
  for (const [a, b] of edges) {
    const dx = px[b]-px[a], dy = py[b]-py[a], dz = pz[b]-pz[a]
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01
    const f = K_SPR * dist
    const ux = dx/dist, uy = dy/dist, uz = dz/dist
    fx[a] += ux*f; fy[a] += uy*f; fz[a] += uz*f
    fx[b] -= ux*f; fy[b] -= uy*f; fz[b] -= uz*f
  }

  // Gravity toward origin
  for (let i = 0; i < N; i++) {
    fx[i] -= px[i] * CENTER
    fy[i] -= py[i] * CENTER
    fz[i] -= pz[i] * CENTER
  }

  // Integrate — clamp velocity to prevent compounding blowup across iterations
  const MAX_V = 1.5
  for (let i = 0; i < N; i++) {
    vx[i] = Math.max(-MAX_V, Math.min(MAX_V, (vx[i] + fx[i]) * DAMP))
    vy[i] = Math.max(-MAX_V, Math.min(MAX_V, (vy[i] + fy[i]) * DAMP))
    vz[i] = Math.max(-MAX_V, Math.min(MAX_V, (vz[i] + fz[i]) * DAMP))
    px[i] += vx[i]
    py[i] += vy[i]
    pz[i] += vz[i]
  }
}

// Normalise to radius ~4 — tighter packing so nodes are visible at default zoom
let maxR = 0
for (let i = 0; i < N; i++) maxR = Math.max(maxR, Math.sqrt(px[i]**2 + py[i]**2 + pz[i]**2))
const scale = 4 / (maxR || 1)
for (let i = 0; i < N; i++) { px[i] *= scale; py[i] *= scale; pz[i] *= scale }

// ── 8. Compute node degree for visual sizing ──────────────────────────────────
const degree = new Int32Array(N)
for (const [a, b] of edges) { degree[a]++; degree[b]++ }
const maxDeg = Math.max(...degree, 1)

// ── 9. Write output ──────────────────────────────────────────────────────────
// Guard: if simulation diverged to NaN or Inf, abort rather than silently
// writing a file full of nulls (JSON.stringify(NaN) === 'null').
const nanCount = Array.from(px).filter(v => !isFinite(v)).length
if (nanCount > 0) {
  console.error(`ERROR: ${nanCount} nodes have non-finite x positions after simulation.`)
  console.error('The force constants may be unstable for this graph size. Aborting.')
  process.exit(1)
}

const nodesOut = nodes.map((n, i) => {
  const node = {
    id:    n.id,
    label: basename(n.id),
    folder: n.id.split('/')[0],
    rgb:   folderColor(n.id),
    x:     +px[i].toFixed(3),
    y:     +py[i].toFixed(3),
    z:     +pz[i].toFixed(3),
    size:  +(1 + (degree[i] / maxDeg) * 2.5).toFixed(2),
  }
  if (n.meta) node.meta = n.meta
  return node
})

const out = `// Auto-generated by scripts/generate-graph.mjs — do not edit by hand
// Nodes: ${N}   Edges: ${edges.length}

export const NODES = ${JSON.stringify(nodesOut, null, 2)}

export const EDGES = ${JSON.stringify(edges)}
`

const outPath = join(SRC, 'data', 'codebaseGraph.js')
writeFileSync(outPath, out, 'utf8')
console.log(`\nWrote ${outPath}`)
console.log(`${N} nodes, ${edges.length} edges`)
