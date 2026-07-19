// Temporary debug: run the simulation inline and report where NaN first appears
// node scripts/_tmp-debug-graph.mjs

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, resolve, relative, basename } from 'path'
import { fileURLToPath } from 'url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SRC  = join(ROOT, 'src')
const SKIP_DIRS = new Set(['courses', 'content', 'assets', 'docs'])

function walk(dir, depth = 0) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
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

const allFiles = walk(SRC)
const relOf    = p => relative(SRC, p).replace(/\\/g, '/')
const relSet   = new Set(allFiles.map(relOf))

const IMPORT_RE  = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g
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

const nodes  = allFiles.map((abs, i) => ({ id: relOf(abs), abs, idx: i }))
const idxOf  = Object.fromEntries(nodes.map(n => [n.id, n.idx]))
const edgeSet = new Set()
const edges   = []

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
    if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([node.idx, toIdx]) }
  }
}

const N  = nodes.length
const px = new Float64Array(N), py = new Float64Array(N), pz = new Float64Array(N)
const vx = new Float64Array(N), vy = new Float64Array(N), vz = new Float64Array(N)

let seed = 42
function rand() { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff }

for (let i = 0; i < N; i++) {
  const theta = rand() * Math.PI * 2
  const phi   = Math.acos(2 * rand() - 1)
  const r     = 5 + rand() * 6
  px[i] = r * Math.sin(phi) * Math.cos(theta)
  py[i] = r * Math.sin(phi) * Math.sin(theta)
  pz[i] = r * Math.cos(phi)
}

// Check init
const initNaN = Array.from(px).findIndex(isNaN)
console.log(`Init NaN at idx: ${initNaN} (should be -1)`)
console.log(`Sample px[0..4]: ${Array.from(px).slice(0,4).map(v=>v.toFixed(3)).join(', ')}`)

const K_REP = 4.0, K_SPR = 0.05, DAMP = 0.80, CENTER = 0.002
const ITERATIONS = 5  // just 5 to debug fast

for (let iter = 0; iter < ITERATIONS; iter++) {
  const fx = new Float64Array(N), fy = new Float64Array(N), fz = new Float64Array(N)
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = px[i]-px[j], dy = py[i]-py[j], dz = pz[i]-pz[j]
      const dist2 = dx*dx + dy*dy + dz*dz + 0.25
      const dist  = Math.sqrt(dist2)
      const f     = K_REP / dist2
      const ux = dx/dist, uy = dy/dist, uz = dz/dist
      fx[i] += ux*f; fy[i] += uy*f; fz[i] += uz*f
      fx[j] -= ux*f; fy[j] -= uy*f; fz[j] -= uz*f
    }
  }
  for (const [a,b] of edges) {
    const dx=px[b]-px[a], dy=py[b]-py[a], dz=pz[b]-pz[a]
    const dist=Math.sqrt(dx*dx+dy*dy+dz*dz)+0.01, f=K_SPR*dist
    const ux=dx/dist, uy=dy/dist, uz=dz/dist
    fx[a]+=ux*f; fy[a]+=uy*f; fz[a]+=uz*f
    fx[b]-=ux*f; fy[b]-=uy*f; fz[b]-=uz*f
  }
  for (let i=0; i<N; i++) { fx[i]-=px[i]*CENTER; fy[i]-=py[i]*CENTER; fz[i]-=pz[i]*CENTER }
  for (let i=0; i<N; i++) {
    vx[i]=(vx[i]+fx[i])*DAMP; vy[i]=(vy[i]+fy[i])*DAMP; vz[i]=(vz[i]+fz[i])*DAMP
    px[i]+=vx[i]; py[i]+=vy[i]; pz[i]+=vz[i]
  }
  const nanIdx = Array.from(px).findIndex(isNaN)
  if (nanIdx >= 0) {
    console.log(`NaN appeared at iter ${iter}, node ${nanIdx} (${nodes[nanIdx]?.id})`)
    console.log('  px:', px[nanIdx], 'vx:', vx[nanIdx], 'fx:', fx[nanIdx])
    process.exit(1)
  }
}

let maxR = 0
for (let i=0; i<N; i++) maxR = Math.max(maxR, Math.sqrt(px[i]**2+py[i]**2+pz[i]**2))
const scale = 4 / (maxR || 1)
console.log(`maxR: ${maxR.toFixed(3)}, scale: ${scale.toFixed(6)}`)
for (let i=0; i<N; i++) { px[i]*=scale; py[i]*=scale; pz[i]*=scale }

const finalNaN = Array.from(px).findIndex(isNaN)
console.log(`Final NaN at idx: ${finalNaN} (should be -1)`)
console.log(`Sample final px[0..4]: ${Array.from(px).slice(0,4).map(v=>(+v.toFixed(3)).toString()).join(', ')}`)
console.log(`JSON check: ${JSON.stringify(+px[0].toFixed(3))}`)
console.log('DONE - simulation is working correctly if no errors above')
