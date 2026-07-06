export default {
  id: 'named-ranges',
  number: 8,
  title: 'Named Ranges',
  objective: 'Name a range of cells and reference it in formulas as =SUM(PRICES).',
  concepts: [
    { id: 'symbolTable', label: 'Symbol table — map from name to location' },
    { id: 'dispatchTable', label: 'Dispatch table — formula function registry' },
    { id: 'reduce',       label: 'reduce() — functional aggregation over arrays' },
    { id: 'openClosed',   label: 'Open/closed — add formula functions without changing the engine' },
  ],
  files: {
    'src/utils/formulaFunctions.ts':
`export type FormulaFn = (values: number[]) => number

export const FORMULA_FUNCTIONS: Record<string, FormulaFn> = {
  SUM:     (values) => values.reduce((total, value) => total + value, 0),
  AVERAGE: (values) => values.reduce((total, value) => total + value, 0) / values.length,
  MAX:     (values) => Math.max(...values),
  MIN:     (values) => Math.min(...values),
  COUNT:   (values) => values.filter(v => !isNaN(v)).length,
}`,

    'src/types/namedRange.ts':
`export interface CellRange {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface NamedRange {
  name: string
  range: CellRange
  sheetId: string
}

function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
}

function parseCellAddress(address: string): { rowIndex: number; colIndex: number } {
  const match = address.match(/^([A-Z]+)(\\d+)$/)
  if (!match) throw new Error(\`Bad address: \${address}\`)
  return {
    rowIndex: parseInt(match[2], 10) - 1,
    colIndex: columnLetterToIndex(match[1]),
  }
}

export function parseRange(rangeStr: string): CellRange {
  const [startAddr, endAddr] = rangeStr.split(':')
  const start = parseCellAddress(startAddr)
  const end   = parseCellAddress(endAddr)
  return {
    startRow: Math.min(start.rowIndex, end.rowIndex),
    startCol: Math.min(start.colIndex, end.colIndex),
    endRow:   Math.max(start.rowIndex, end.rowIndex),
    endCol:   Math.max(start.colIndex, end.colIndex),
  }
}`,

    'src/composables/useNamedRanges.ts':
`import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { NamedRange, CellRange } from '../types/namedRange'

export function useNamedRanges(activeSheetId: Ref<string>) {
  const namedRanges = ref<NamedRange[]>([])

  const activeSheetRanges = computed(() =>
    namedRanges.value.filter(r => r.sheetId === activeSheetId.value)
  )

  function defineRange(name: string, range: CellRange) {
    const upperName = name.toUpperCase()
    const existingIndex = namedRanges.value.findIndex(
      r => r.name === upperName && r.sheetId === activeSheetId.value
    )
    const entry: NamedRange = { name: upperName, range, sheetId: activeSheetId.value }
    if (existingIndex >= 0) {
      namedRanges.value[existingIndex] = entry
    } else {
      namedRanges.value.push(entry)
    }
  }

  function removeRange(name: string) {
    namedRanges.value = namedRanges.value.filter(
      r => !(r.name === name.toUpperCase() && r.sheetId === activeSheetId.value)
    )
  }

  function findRange(name: string): NamedRange | undefined {
    return namedRanges.value.find(
      r => r.name === name.toUpperCase() && r.sheetId === activeSheetId.value
    )
  }

  return { namedRanges, activeSheetRanges, defineRange, removeRange, findRange }
}`,

    'src/components/NameManager.vue':
`<script setup lang="ts">
import { ref } from 'vue'
import { parseRange } from '../types/namedRange'

const props = defineProps<{
  activeSheetRanges: { name: string; range: { startRow: number; startCol: number; endRow: number; endCol: number } }[]
}>()

const emit = defineEmits<{
  define: [name: string, rangeStr: string]
  remove: [name: string]
}>()

const nameInput = ref('')
const rangeInput = ref('')

function add() {
  if (!nameInput.value.trim() || !rangeInput.value.trim()) return
  emit('define', nameInput.value.trim(), rangeInput.value.trim())
  nameInput.value = ''
  rangeInput.value = ''
}

function toRangeStr(range: { startRow: number; startCol: number; endRow: number; endCol: number }): string {
  const colLetter = (col: number) => String.fromCharCode(65 + col)
  return \`\${colLetter(range.startCol)}\${range.startRow + 1}:\${colLetter(range.endCol)}\${range.endRow + 1}\`
}
</script>

<template>
  <div class="manager">
    <h4>Named Ranges</h4>
    <div class="form">
      <input v-model="nameInput" placeholder="Name (e.g., PRICES)" class="input" />
      <input v-model="rangeInput" placeholder="Range (e.g., A1:A3)" class="input" />
      <button @click="add">Add</button>
    </div>
    <ul class="list">
      <li v-for="range in activeSheetRanges" :key="range.name" class="item">
        <strong>{{ range.name }}</strong>
        <span class="addr">{{ toRangeStr(range.range) }}</span>
        <button @click="$emit('remove', range.name)">×</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.manager { padding: 12px; border-left: 1px solid #e2e8f0; min-width: 180px; font-family: system-ui, sans-serif; font-size: 13px; }
h4 { margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #41b883; }
.form { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.input { padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 12px; }
button { padding: 6px 12px; background: #41b883; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.item { display: flex; align-items: center; gap: 8px; padding: 4px; background: #f8fafc; border-radius: 4px; }
.item strong { min-width: 60px; }
.addr { font-family: monospace; color: #64748b; flex: 1; }
.item button { padding: 2px 6px; background: #fee2e2; color: #ef4444; font-size: 11px; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import Grid from './components/Grid.vue'
import NameManager from './components/NameManager.vue'
import { useSheets } from './composables/useSheets'
import { useNamedRanges } from './composables/useNamedRanges'
import { provideSelection } from './composables/useSelection'
import { parseRange } from './types/namedRange'

const { sheets, activeSheet, activeSheetId, switchSheet, addSheet, updateCellValue } = useSheets()
const { activeSheetRanges, defineRange, removeRange } = useNamedRanges(activeSheetId)
const { selectedCell, selectCell } = provideSelection()

const displayData = computed(() =>
  activeSheet.value.cells.map(row => row.map(cell => cell.raw))
)

function handleDefine(name: string, rangeStr: string) {
  try {
    defineRange(name, parseRange(rangeStr))
  } catch (err) {
    alert('Invalid range. Use format A1:C3.')
  }
}
</script>

<template>
  <div class="spreadsheet">
    <div class="body">
      <Grid
        :rows="displayData"
        :cellFormats="activeSheet.cells.map(r => r.map(c => c.format))"
        :selectedCell="selectedCell"
        @update-cell="updateCellValue"
        @select-cell="selectCell"
      />
      <NameManager
        :activeSheetRanges="activeSheetRanges"
        @define="handleDefine"
        @remove="removeRange"
      />
    </div>
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 640px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.body { display: flex; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/utils/formulaFunctions.ts': `## Why a dispatch table instead of a switch statement

A switch statement for formula functions would look like:

\`\`\`ts
switch (funcName) {
  case 'SUM': return sum(values)
  case 'AVERAGE': return average(values)
  // ... every formula
}
\`\`\`

Every new formula requires modifying this switch — inserting a new case. This is the open/closed violation: to extend, you must modify.

The dispatch table (\`FORMULA_FUNCTIONS[funcName]\`) is open for extension: add a new function by adding one entry to the object. No existing case changes. This is also why plugin functions (lesson 12) can be merged into the same object — the dispatch lookup works identically for built-ins and plugins.`,
  },
}
