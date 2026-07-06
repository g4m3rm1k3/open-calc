export default {
  id: 'undo-redo',
  number: 11,
  title: 'Undo / Redo',
  objective: 'Ctrl+Z / Ctrl+Y to undo and redo cell edits using the Command pattern.',
  concepts: [
    { id: 'command',    label: 'Command pattern — action as an object with execute/undo' },
    { id: 'stack',      label: 'Two-stack undo — undoStack + redoStack' },
    { id: 'lifecycle',  label: 'onMounted / onUnmounted — setup and cleanup' },
    { id: 'memoize',    label: 'History cap — O(1) storage per edit, O(n) max history' },
  ],
  files: {
    'src/types/command.ts':
`export interface Command {
  description: string
  execute(): void
  undo(): void
}`,

    'src/commands/CellEditCommand.ts':
`import type { Command } from '../types/command'
import type { CellData } from '../types/cell'
import type { Ref } from 'vue'

function toAddress(row: number, col: number): string {
  return \`\${String.fromCharCode(65 + col)}\${row + 1}\`
}

export class CellEditCommand implements Command {
  description: string
  private cells: Ref<CellData[][]>
  private row: number
  private col: number
  private previousRaw: number | string
  private nextRaw: number | string

  constructor(
    cells: Ref<CellData[][]>,
    row: number,
    col: number,
    previousRaw: number | string,
    nextRaw: number | string
  ) {
    this.cells = cells
    this.row = row
    this.col = col
    this.previousRaw = previousRaw
    this.nextRaw = nextRaw
    this.description = \`Edit \${toAddress(row, col)}: "\${previousRaw}" → "\${nextRaw}"\`
  }

  execute(): void {
    this.cells.value[this.row][this.col].raw = this.nextRaw
  }

  undo(): void {
    this.cells.value[this.row][this.col].raw = this.previousRaw
  }
}`,

    'src/composables/useHistory.ts':
`import { ref, computed } from 'vue'
import type { Command } from '../types/command'

const MAX_HISTORY = 50

export function useHistory() {
  const undoStack = ref<Command[]>([])
  const redoStack = ref<Command[]>([])

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  const undoCount = computed(() => undoStack.value.length)
  const redoCount = computed(() => redoStack.value.length)

  function execute(command: Command) {
    command.execute()
    undoStack.value.push(command)
    redoStack.value = []
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift()
    }
  }

  function undo() {
    if (!canUndo.value) return
    const command = undoStack.value.pop()!
    command.undo()
    redoStack.value.push(command)
  }

  function redo() {
    if (!canRedo.value) return
    const command = redoStack.value.pop()!
    command.execute()
    undoStack.value.push(command)
  }

  return { execute, undo, redo, canUndo, canRedo, undoCount, redoCount }
}`,

    'src/components/UndoRedoBar.vue':
`<script setup lang="ts">
defineProps<{
  canUndo: boolean
  canRedo: boolean
  undoCount: number
  redoCount: number
}>()

defineEmits<{ undo: []; redo: [] }>()
</script>

<template>
  <div class="bar">
    <button :disabled="!canUndo" @click="$emit('undo')">↩ Undo ({{ undoCount }})</button>
    <button :disabled="!canRedo" @click="$emit('redo')">Redo ({{ redoCount }}) ↪</button>
  </div>
</template>

<style scoped>
.bar { display: flex; gap: 8px; padding: 8px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
button { padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import Grid from './components/Grid.vue'
import FormulaBar from './components/FormulaBar.vue'
import UndoRedoBar from './components/UndoRedoBar.vue'
import { useSheets } from './composables/useSheets'
import { useHistory } from './composables/useHistory'
import { useFormulaBar } from './composables/useFormulaBar'
import { provideSelection } from './composables/useSelection'
import { CellEditCommand } from './commands/CellEditCommand'

const { activeSheet } = useSheets()
const { selectedCell, selectCell } = provideSelection()
const { execute, undo, redo, canUndo, canRedo, undoCount, redoCount } = useHistory()

function updateCellValue(row: number, col: number, newValue: string) {
  const parsed = parseFloat(newValue)
  const nextRaw = isNaN(parsed) ? newValue : parsed
  const previousRaw = activeSheet.value.cells[row][col].raw
  if (previousRaw === nextRaw) return
  execute(new CellEditCommand(
    computed(() => activeSheet.value.cells),
    row, col, previousRaw, nextRaw
  ))
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

function onKeydown(event: KeyboardEvent) {
  const mod = navigator.platform.includes('Mac') ? event.metaKey : event.ctrlKey
  if (mod && event.key === 'z' && !event.shiftKey) { event.preventDefault(); undo() }
  if (mod && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) { event.preventDefault(); redo() }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="spreadsheet">
    <UndoRedoBar :canUndo="canUndo" :canRedo="canRedo" :undoCount="undoCount" :redoCount="redoCount" @undo="undo" @redo="redo" />
    <FormulaBar
      v-model:formulaBarValue="formulaBarValue"
      :isEditingFormula="isEditingFormula"
      :selectedAddress="selectedAddress"
      @begin-editing="beginEditing"
      @commit="commitFormula(updateCellValue)"
      @cancel="cancelEdit"
    />
    <Grid
      :rows="displayData"
      :cellFormats="activeSheet.cells.map(r => r.map(c => c.format))"
      :selectedCell="selectedCell"
      @update-cell="updateCellValue"
      @select-cell="selectCell"
    />
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 520px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/commands/CellEditCommand.ts': `## Why store both previousRaw and nextRaw

\`CellEditCommand\` is a complete record of one change: what cell changed, what it was, and what it became. Both values are captured at construction time — before \`execute()\` is called. This matters because by the time \`undo()\` is called, the cell already has the new value. Without the captured \`previousRaw\`, undo has nothing to restore.

This is the **snapshot approach** to undo — not snapshotting the whole grid (expensive), but snapshotting only what changed (cheap). For formatting changes you would write \`CellFormatCommand\`. For sheet operations, \`AddSheetCommand\`. Each adds one class; the history stack code is unchanged.`,
  },
}
