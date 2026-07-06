export default {
  id: 'multiple-sheets',
  number: 7,
  title: 'Multiple Sheets',
  objective: 'Add sheet tabs that switch between independent grids.',
  concepts: [
    { id: 'uuid',      label: 'crypto.randomUUID() — stable identity for data' },
    { id: 'idRef',     label: 'ID reference — stable pointer that survives reordering' },
    { id: 'upsert',    label: 'Upsert pattern — add if absent, update if present' },
    { id: 'sheetType', label: 'Sheet type — named grid with its own CellData[][]' },
  ],
  files: {
    'src/types/sheet.ts':
`import type { CellData } from './cell'
import { defaultCell } from './cell'

export interface Sheet {
  id: string
  name: string
  cells: CellData[][]
}

export function createSheet(name: string, rows = 6, cols = 5): Sheet {
  return {
    id: crypto.randomUUID(),
    name,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => defaultCell())
    ),
  }
}`,

    'src/components/SheetTabs.vue':
`<script setup lang="ts">
import type { Sheet } from '../types/sheet'

defineProps<{
  sheets: Sheet[]
  activeSheetId: string
}>()

defineEmits<{
  switchSheet: [id: string]
  addSheet: []
}>()
</script>

<template>
  <div class="tabs">
    <button
      v-for="sheet in sheets"
      :key="sheet.id"
      class="tab"
      :class="{ active: sheet.id === activeSheetId }"
      @click="$emit('switchSheet', sheet.id)"
    >
      {{ sheet.name }}
    </button>
    <button class="add-tab" @click="$emit('addSheet')" title="New sheet">+</button>
  </div>
</template>

<style scoped>
.tabs { display: flex; align-items: center; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.tab { padding: 8px 16px; border: none; border-right: 1px solid #e2e8f0; background: transparent; cursor: pointer; font-size: 13px; }
.tab.active { background: white; border-top: 2px solid #41b883; font-weight: 600; margin-top: -1px; }
.add-tab { padding: 8px 14px; border: none; background: transparent; cursor: pointer; font-size: 18px; color: #64748b; }
</style>`,

    'src/composables/useSheets.ts':
`import { ref, computed } from 'vue'
import { createSheet } from '../types/sheet'
import type { CellData, CellFormat } from '../types/cell'

export function useSheets() {
  const sheets = ref([
    createSheet('Sheet 1'),
    createSheet('Sheet 2'),
  ])

  const activeSheetId = ref<string>(sheets.value[0].id)

  const activeSheet = computed(() =>
    sheets.value.find(s => s.id === activeSheetId.value)!
  )

  function switchSheet(id: string) {
    activeSheetId.value = id
  }

  function addSheet() {
    const newSheet = createSheet(\`Sheet \${sheets.value.length + 1}\`)
    sheets.value.push(newSheet)
    activeSheetId.value = newSheet.id
  }

  function updateCellValue(row: number, col: number, newValue: string) {
    const parsed = parseFloat(newValue)
    activeSheet.value.cells[row][col].raw = isNaN(parsed) ? newValue : parsed
  }

  function updateCellFormat(row: number, col: number, patch: Partial<CellFormat>) {
    Object.assign(activeSheet.value.cells[row][col].format, patch)
  }

  return { sheets, activeSheet, activeSheetId, switchSheet, addSheet, updateCellValue, updateCellFormat }
}`,

    'src/App.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import Grid from './components/Grid.vue'
import SheetTabs from './components/SheetTabs.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { useSheets } from './composables/useSheets'
import { provideSelection } from './composables/useSelection'

const { sheets, activeSheet, activeSheetId, switchSheet, addSheet, updateCellValue } = useSheets()
const { selectedCell, selectCell } = provideSelection()

// Simple passthrough display (formulas will be wired in a real project)
const displayData = computed(() =>
  activeSheet.value.cells.map(row => row.map(cell => cell.raw))
)
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
      <PropertyPanel :cells="activeSheet.cells" :displayData="displayData" />
    </div>
    <SheetTabs
      :sheets="sheets"
      :activeSheetId="activeSheetId"
      @switch-sheet="switchSheet"
      @add-sheet="addSheet"
    />
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 560px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.body { display: flex; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useSheets.ts': `## Why UUIDs instead of array indices

If we tracked the active sheet by index (\`activeSheetIndex = 0\`), inserting a new sheet before the current one would shift all indices. Sheet 2 becomes index 0. The active index still points to 0 — but now 0 is the newly inserted sheet, not the original Sheet 2. The user is now looking at the wrong sheet.

UUIDs never change. A sheet's ID is assigned when it is created and never updated. The active sheet ID remains valid regardless of what happens to the array structure around it. This is why databases use primary keys instead of array indices: stability under mutation.`,
  },
}
