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

// ── 3. Build node + edge lists ───────────────────────────────────────────────
const nodes = allFiles.map((abs, i) => ({ id: relOf(abs), abs, idx: i }))
const idxOf  = Object.fromEntries(nodes.map(n => [n.id, n.idx]))

const edgeSet = new Set()
const edges   = []   // [fromIdx, toIdx]

for (const node of nodes) {
  let content
  try { content = readFileSync(node.abs, 'utf8') } catch { continue }
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

// ── 4. Assign colours by top-level folder ───────────────────────────────────
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

// ── 5. Seeded pseudo-random (stable across re-runs) ─────────────────────────
let seed = 42
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff
  return seed / 0x7fffffff
}

// ── 6. Force-directed 3-D layout ─────────────────────────────────────────────
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
const K_REP  = 4.0    // repulsion strength
const K_SPR  = 0.05   // spring attraction
const DAMP   = 0.80   // velocity damping
const CENTER = 0.002  // gentle pull toward origin

console.log('Running force simulation...')
const tick = Math.floor(ITERATIONS / 4)

for (let iter = 0; iter < ITERATIONS; iter++) {
  if ((iter + 1) % tick === 0) process.stdout.write(`  ${Math.round((iter+1)/ITERATIONS*100)}%\n`)

  const fx = new Float64Array(N)
  const fy = new Float64Array(N)
  const fz = new Float64Array(N)

  // Repulsion between all pairs — O(N²)
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = px[i] - px[j], dy = py[i] - py[j], dz = pz[i] - pz[j]
      const dist2 = dx*dx + dy*dy + dz*dz + 0.25
      const dist  = Math.sqrt(dist2)
      const f     = K_REP / dist2
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

  // Integrate
  for (let i = 0; i < N; i++) {
    vx[i] = (vx[i] + fx[i]) * DAMP
    vy[i] = (vy[i] + fy[i]) * DAMP
    vz[i] = (vz[i] + fz[i]) * DAMP
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

// ── 7. Compute node degree for visual sizing ──────────────────────────────────
const degree = new Int32Array(N)
for (const [a, b] of edges) { degree[a]++; degree[b]++ }
const maxDeg = Math.max(...degree, 1)

// ── 8. Write output ──────────────────────────────────────────────────────────
const nodesOut = nodes.map((n, i) => ({
  id:    n.id,
  label: basename(n.id),
  folder: n.id.split('/')[0],
  rgb:   folderColor(n.id),
  x:     +px[i].toFixed(3),
  y:     +py[i].toFixed(3),
  z:     +pz[i].toFixed(3),
  size:  +(1 + (degree[i] / maxDeg) * 2.5).toFixed(2),
}))

const out = `// Auto-generated by scripts/generate-graph.mjs — do not edit by hand
// Nodes: ${N}   Edges: ${edges.length}

export const NODES = ${JSON.stringify(nodesOut, null, 2)}

export const EDGES = ${JSON.stringify(edges)}
`

const outPath = join(SRC, 'data', 'codebaseGraph.js')
writeFileSync(outPath, out, 'utf8')
console.log(`\nWrote ${outPath}`)
console.log(`${N} nodes, ${edges.length} edges`)
