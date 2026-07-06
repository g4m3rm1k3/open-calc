export default {
  id: 'dependency-graph',
  number: 10,
  title: 'Dependency Graph',
  objective: 'Visualise which cells depend on which. Highlight affected cells when one changes.',
  concepts: [
    { id: 'dag',     label: 'DAG — directed acyclic graph for cell dependencies' },
    { id: 'dfs',     label: 'DFS — depth-first search for cycle detection and propagation' },
    { id: 'svg',     label: 'SVG — vector graphics bound to reactive data' },
    { id: 'set',     label: 'Set — deduplicated collection for visited nodes' },
  ],
  files: {
    'src/composables/useDependencyGraph.ts':
`import { computed } from 'vue'
import type { Ref } from 'vue'
import type { CellData } from '../types/cell'

export interface CellNode {
  id: string
  row: number
  col: number
  isFormula: boolean
  dependencies: string[]
  dependents: string[]
}

function toAddress(row: number, col: number): string {
  return \`\${String.fromCharCode(65 + col)}\${row + 1}\`
}

function extractCellRefs(formula: string): string[] {
  const matches = formula.match(/[A-Z]+\\d+/g) ?? []
  return [...new Set(matches)]
}

export function useDependencyGraph(cells: Ref<CellData[][]>) {
  const graph = computed<Map<string, CellNode>>(() => {
    const map = new Map<string, CellNode>()

    function ensureNode(row: number, col: number): CellNode {
      const id = toAddress(row, col)
      if (!map.has(id)) {
        map.set(id, { id, row, col, isFormula: false, dependencies: [], dependents: [] })
      }
      return map.get(id)!
    }

    cells.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const node = ensureNode(rowIndex, colIndex)
        if (typeof cell.raw === 'string' && cell.raw.startsWith('=')) {
          node.isFormula = true
          const refs = extractCellRefs(cell.raw)
          node.dependencies = refs
          for (const depId of refs) {
            const match = depId.match(/^([A-Z]+)(\\d+)$/)
            if (match) {
              const col = match[1].charCodeAt(0) - 65
              const row = parseInt(match[2], 10) - 1
              const depNode = ensureNode(row, col)
              if (!depNode.dependents.includes(node.id)) {
                depNode.dependents.push(node.id)
              }
            }
          }
        }
      })
    })

    return map
  })

  function getAffectedCells(address: string): Set<string> {
    const affected = new Set<string>()
    function traverse(current: string) {
      const node = graph.value.get(current)
      if (!node) return
      for (const dependent of node.dependents) {
        if (!affected.has(dependent)) {
          affected.add(dependent)
          traverse(dependent)
        }
      }
    }
    traverse(address)
    return affected
  }

  function hasCircularDependency(start: string, target: string, visited = new Set<string>()): boolean {
    if (start === target) return true
    if (visited.has(start)) return false
    visited.add(start)
    const node = graph.value.get(start)
    return (node?.dependencies ?? []).some(dep => hasCircularDependency(dep, target, visited))
  }

  return { graph, getAffectedCells, hasCircularDependency }
}`,

    'src/components/DependencyGraph.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import type { CellNode } from '../composables/useDependencyGraph'

const props = defineProps<{
  graph: Map<string, CellNode>
  highlighted: Set<string>
}>()

const nodes = computed(() =>
  [...props.graph.values()].filter(n => n.dependencies.length > 0 || n.dependents.length > 0)
)

const positions = computed(() => {
  const map = new Map<string, { x: number; y: number }>()
  nodes.value.forEach((node, i) => {
    map.set(node.id, { x: (i % 3) * 130 + 60, y: Math.floor(i / 3) * 80 + 40 })
  })
  return map
})

function pos(id: string) {
  return positions.value.get(id) ?? { x: 0, y: 0 }
}
</script>

<template>
  <div class="graph-wrap">
    <div class="title">Dependency Graph</div>
    <svg v-if="nodes.length" :width="Math.max(420, (Math.min(nodes.length, 3)) * 130 + 30)" :height="Math.ceil(nodes.length / 3) * 80 + 30">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#94a3b8" />
        </marker>
      </defs>
      <line
        v-for="node in nodes"
        v-for="dep in node.dependencies"
        :key="\`\${dep}-\${node.id}\`"
        :x1="pos(dep).x" :y1="pos(dep).y"
        :x2="pos(node.id).x" :y2="pos(node.id).y"
        stroke="#cbd5e1" stroke-width="1.5"
        marker-end="url(#arrow)"
      />
      <g
        v-for="node in nodes"
        :key="node.id"
        :transform="\`translate(\${pos(node.id).x}, \${pos(node.id).y})\`"
      >
        <rect
          x="-28" y="-14" width="56" height="28" rx="6"
          :fill="props.highlighted.has(node.id) ? '#dcfce7' : '#f8fafc'"
          :stroke="props.highlighted.has(node.id) ? '#41b883' : '#cbd5e1'"
          stroke-width="1.5"
        />
        <text text-anchor="middle" dy="5" font-size="12" font-family="monospace" fill="#0f172a">{{ node.id }}</text>
      </g>
    </svg>
    <p v-else class="empty">Enter a formula (e.g., =A1+B1) to see dependencies</p>
  </div>
</template>

<style scoped>
.graph-wrap { padding: 12px; border-left: 1px solid #e2e8f0; font-family: system-ui, sans-serif; min-width: 200px; }
.title { font-size: 13px; font-weight: 700; color: #41b883; margin-bottom: 10px; }
.empty { font-size: 12px; color: #94a3b8; font-style: italic; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { ref, computed } from 'vue'
import Grid from './components/Grid.vue'
import FormulaBar from './components/FormulaBar.vue'
import DependencyGraph from './components/DependencyGraph.vue'
import { useSheets } from './composables/useSheets'
import { useFormulaBar } from './composables/useFormulaBar'
import { useDependencyGraph } from './composables/useDependencyGraph'
import { provideSelection } from './composables/useSelection'

const { activeSheet, updateCellValue: rawUpdate } = useSheets()
const { selectedCell, selectCell } = provideSelection()
const { graph, getAffectedCells } = useDependencyGraph(computed(() => activeSheet.value.cells))

const highlightedCells = ref<Set<string>>(new Set())
let highlightTimer: ReturnType<typeof setTimeout> | null = null

function updateCellValue(row: number, col: number, value: string) {
  rawUpdate(row, col, value)
  const address = \`\${String.fromCharCode(65 + col)}\${row + 1}\`
  const affected = getAffectedCells(address)
  highlightedCells.value = affected
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => { highlightedCells.value = new Set() }, 1500)
}

const selectedAddress = computed(() => {
  if (!selectedCell.value) return null
  return \`\${String.fromCharCode(65 + selectedCell.value.col)}\${selectedCell.value.row + 1}\`
})

const { formulaBarValue, isEditingFormula, beginEditing, commitFormula, cancelEdit } =
  useFormulaBar(selectedCell, computed(() => activeSheet.value.cells))

const displayData = computed(() =>
  activeSheet.value.cells.map(row => row.map(cell => cell.raw))
)
</script>

<template>
  <div class="spreadsheet">
    <FormulaBar
      v-model:formulaBarValue="formulaBarValue"
      :isEditingFormula="isEditingFormula"
      :selectedAddress="selectedAddress"
      @begin-editing="beginEditing"
      @commit="commitFormula(updateCellValue)"
      @cancel="cancelEdit"
    />
    <div class="body">
      <Grid
        :rows="displayData"
        :cellFormats="activeSheet.cells.map(r => r.map(c => c.format))"
        :selectedCell="selectedCell"
        :highlightedCells="highlightedCells"
        @update-cell="updateCellValue"
        @select-cell="selectCell"
      />
      <DependencyGraph :graph="graph" :highlighted="highlightedCells" />
    </div>
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 680px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.body { display: flex; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useDependencyGraph.ts': `## Why depth-first search for getAffectedCells

When A1 changes, we need every cell that (directly or transitively) depends on A1. DFS follows one dependency chain to its end before backtracking — which naturally discovers all reachable dependents.

The \`visited\` Set (or the \`affected\` Set used as the visited guard) prevents infinite loops in diamond patterns: if B1 and C1 both depend on A1, and D1 depends on both B1 and C1, DFS from A1 visits D1 twice. The Set ensures D1 is only added once and only traversed once.

This is exactly what the V8 JavaScript engine does when it needs to garbage-collect — it traces which objects are reachable from roots. Reachability is DFS on a reference graph.`,
  },
}
