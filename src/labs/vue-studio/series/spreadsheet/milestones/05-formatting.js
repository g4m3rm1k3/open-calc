export default {
  id: 'formatting',
  number: 5,
  title: 'Formatting',
  objective: 'Select a cell and apply bold, currency, or alignment from a format bar.',
  concepts: [
    { id: 'cellData',   label: 'CellData — separating value from format in the data model' },
    { id: 'partial',    label: 'Partial<T> — TypeScript utility for partial updates' },
    { id: 'dynClass',   label: ':class — dynamic CSS class binding' },
    { id: 'factory',    label: 'defaultCell() — factory function for safe initialisation' },
  ],
  files: {
    'src/types/cell.ts':
`export type TextAlignment = 'left' | 'center' | 'right'

export interface CellFormat {
  bold: boolean
  currency: boolean
  alignment: TextAlignment
}

export interface CellData {
  raw: number | string
  format: CellFormat
}

export function defaultCell(value: number | string = ''): CellData {
  return {
    raw: value,
    format: { bold: false, currency: false, alignment: 'left' },
  }
}

export function formatValue(value: number | string, format: CellFormat): string {
  if (format.currency && typeof value === 'number') {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    })
  }
  return String(value)
}`,

    'src/components/FormatBar.vue':
`<script setup lang="ts">
import type { CellFormat, TextAlignment } from '../types/cell'

const props = defineProps<{
  format: CellFormat | null
}>()

defineEmits<{
  bold: []
  currency: []
  align: [alignment: TextAlignment]
}>()
</script>

<template>
  <div class="format-bar">
    <button :class="{ active: props.format?.bold }" :disabled="!props.format" @click="$emit('bold')" title="Bold">
      <strong>B</strong>
    </button>
    <button :class="{ active: props.format?.currency }" :disabled="!props.format" @click="$emit('currency')" title="Currency">
      $
    </button>
    <div class="sep" />
    <button
      v-for="align in (['left', 'center', 'right'] as TextAlignment[])"
      :key="align"
      :class="{ active: props.format?.alignment === align }"
      :disabled="!props.format"
      @click="$emit('align', align)"
    >
      {{ align === 'left' ? '←' : align === 'center' ? '↔' : '→' }}
    </button>
  </div>
</template>

<style scoped>
.format-bar { display: flex; gap: 4px; padding: 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
button { width: 28px; height: 28px; border: 1px solid #e2e8f0; border-radius: 4px; background: white; cursor: pointer; font-size: 13px; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
button.active { background: #dcfce7; border-color: #41b883; }
.sep { width: 1px; background: #e2e8f0; margin: 0 4px; }
</style>`,

    'src/components/Cell.vue':
`<script setup lang="ts">
import { ref } from 'vue'
import type { CellFormat } from '../types/cell'

const props = defineProps<{
  value: number | string
  format: CellFormat
  rowIndex: number
  colIndex: number
  isSelected: boolean
}>()

const emit = defineEmits<{
  update: [rowIndex: number, colIndex: number, newValue: string]
  select: [rowIndex: number, colIndex: number]
}>()

const isEditing = ref(false)
const editValue = ref(String(props.value))

function startEditing() {
  editValue.value = String(props.value)
  isEditing.value = true
}

function commitEdit() {
  isEditing.value = false
  emit('update', props.rowIndex, props.colIndex, editValue.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') commitEdit()
  if (event.key === 'Escape') isEditing.value = false
}
</script>

<template>
  <div
    class="cell"
    :class="{ selected: props.isSelected, bold: props.format.bold }"
    :style="{ textAlign: props.format.alignment }"
    @click="emit('select', props.rowIndex, props.colIndex)"
    @dblclick="startEditing"
  >
    <input
      v-if="isEditing"
      v-model="editValue"
      class="cell-input"
      @blur="commitEdit"
      @keydown="handleKeydown"
    />
    <span v-else>{{ value }}</span>
  </div>
</template>

<style scoped>
.cell {
  width: 96px; height: 32px;
  border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;
  display: flex; align-items: center; padding: 0 8px;
  font-size: 14px; font-family: system-ui, sans-serif;
  background: white; box-sizing: border-box; cursor: default;
}
.cell.bold span { font-weight: 700; }
.cell.selected { outline: 2px solid #41b883; outline-offset: -2px; }
.cell-input { width: 100%; height: 100%; border: none; outline: 2px solid #41b883; font-size: 14px; padding: 0 4px; box-sizing: border-box; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { ref, computed } from 'vue'
import Grid from './components/Grid.vue'
import FormatBar from './components/FormatBar.vue'
import { useSpreadsheet } from './composables/useSpreadsheet'
import type { TextAlignment } from './types/cell'

const { cells, displayData, updateCellValue, updateCellFormat } = useSpreadsheet([
  [5, 10, 15],
  [20, 25, 30],
])

const selectedCell = ref<{ row: number; col: number } | null>(null)

const selectedFormat = computed(() =>
  selectedCell.value
    ? cells.value[selectedCell.value.row][selectedCell.value.col].format
    : null
)

function selectCell(row: number, col: number) {
  selectedCell.value = { row, col }
}

function applyBold() {
  if (!selectedCell.value) return
  const { row, col } = selectedCell.value
  updateCellFormat(row, col, { bold: !cells.value[row][col].format.bold })
}

function applyCurrency() {
  if (!selectedCell.value) return
  const { row, col } = selectedCell.value
  updateCellFormat(row, col, { currency: !cells.value[row][col].format.currency })
}

function applyAlignment(alignment: TextAlignment) {
  if (!selectedCell.value) return
  updateCellFormat(selectedCell.value.row, selectedCell.value.col, { alignment })
}
</script>

<template>
  <div class="spreadsheet">
    <FormatBar
      :format="selectedFormat"
      @bold="applyBold"
      @currency="applyCurrency"
      @align="applyAlignment"
    />
    <Grid
      :rows="displayData"
      :cellFormats="cells.map(row => row.map(c => c.format))"
      :selectedCell="selectedCell"
      @update-cell="updateCellValue"
      @select-cell="selectCell"
    />
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 500px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/types/cell.ts': `## Why separate raw from format

Both \`raw\` and \`format\` live on the same cell object but they are completely independent. Editing the value does not touch the format. Applying bold does not touch the value. Keeping them separate means each operation is small and precise.

If they were merged — \`{ value, bold, currency, alignment }\` — a bulk "reset all formatting" operation would need to know which fields are "value fields" and which are "format fields." With the current structure, resetting formatting is just \`cell.format = defaultFormat()\` — one assignment, no knowledge of the value.`,
  },
}
