export default {
  id: 'formula-editor',
  number: 9,
  title: 'Formula Editor',
  objective: 'A formula bar at the top shows the raw formula of the selected cell and lets you edit it.',
  concepts: [
    { id: 'watch',      label: 'watch() — sync the bar with the selected cell' },
    { id: 'controlled', label: 'Controlled input — local state, commit on confirm' },
    { id: 'vModelCustom', label: 'v-model:prop — custom two-way binding convention' },
    { id: 'circular',   label: 'Circular reactivity guard — isEditingFormula flag' },
  ],
  files: {
    'src/composables/useFormulaBar.ts':
`import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { CellData } from '../types/cell'

interface SelectedCellRef {
  row: number
  col: number
}

export function useFormulaBar(
  selectedCell: Ref<SelectedCellRef | null>,
  cells: Ref<CellData[][]>
) {
  const formulaBarValue = ref('')
  const isEditingFormula = ref(false)

  watch(
    [selectedCell, cells],
    () => {
      if (isEditingFormula.value) return
      if (!selectedCell.value) { formulaBarValue.value = ''; return }
      const { row, col } = selectedCell.value
      const cell = cells.value[row]?.[col]
      formulaBarValue.value = cell ? String(cell.raw) : ''
    },
    { immediate: true, deep: true }
  )

  function beginEditing() {
    isEditingFormula.value = true
  }

  function commitFormula(updateCell: (row: number, col: number, value: string) => void) {
    if (!selectedCell.value) { isEditingFormula.value = false; return }
    const { row, col } = selectedCell.value
    updateCell(row, col, formulaBarValue.value)
    isEditingFormula.value = false
  }

  function cancelEdit() {
    if (!selectedCell.value) { isEditingFormula.value = false; return }
    const { row, col } = selectedCell.value
    const cell = cells.value[row]?.[col]
    formulaBarValue.value = cell ? String(cell.raw) : ''
    isEditingFormula.value = false
  }

  return { formulaBarValue, isEditingFormula, beginEditing, commitFormula, cancelEdit }
}`,

    'src/components/FormulaBar.vue':
`<script setup lang="ts">
defineProps<{
  formulaBarValue: string
  isEditingFormula: boolean
  selectedAddress: string | null
}>()

defineEmits<{
  'update:formulaBarValue': [value: string]
  beginEditing: []
  commit: []
  cancel: []
}>()
</script>

<template>
  <div class="formula-bar">
    <div class="address-box">{{ selectedAddress ?? '—' }}</div>
    <div class="divider" />
    <input
      class="formula-input"
      :class="{ editing: isEditingFormula }"
      :value="formulaBarValue"
      :disabled="!selectedAddress"
      :placeholder="selectedAddress ? 'Value or formula' : 'Select a cell'"
      @focus="$emit('beginEditing')"
      @input="$emit('update:formulaBarValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter.prevent="$emit('commit')"
      @keydown.escape="$emit('cancel')"
      @blur="$emit('commit')"
    />
  </div>
</template>

<style scoped>
.formula-bar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; background: white; }
.address-box { width: 52px; text-align: center; font-size: 13px; font-weight: 700; color: #41b883; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px; flex-shrink: 0; }
.divider { width: 1px; height: 20px; background: #e2e8f0; flex-shrink: 0; }
.formula-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: monospace; background: transparent; }
.formula-input.editing { outline: 1px solid #41b883; border-radius: 2px; padding: 0 3px; }
.formula-input:disabled { color: #94a3b8; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import Grid from './components/Grid.vue'
import FormulaBar from './components/FormulaBar.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { useSheets } from './composables/useSheets'
import { useFormulaBar } from './composables/useFormulaBar'
import { provideSelection } from './composables/useSelection'

const { activeSheet, updateCellValue } = useSheets()
const { selectedCell, selectCell } = provideSelection()

const selectedAddress = computed(() => {
  if (!selectedCell.value) return null
  const { row, col } = selectedCell.value
  return \`\${String.fromCharCode(65 + col)}\${row + 1}\`
})

const {
  formulaBarValue,
  isEditingFormula,
  beginEditing,
  commitFormula,
  cancelEdit,
} = useFormulaBar(selectedCell, computed(() => activeSheet.value.cells))

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
        @update-cell="updateCellValue"
        @select-cell="selectCell"
      />
      <PropertyPanel :cells="activeSheet.cells" :displayData="displayData" />
    </div>
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 580px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.body { display: flex; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useFormulaBar.ts': `## Why the isEditingFormula guard

\`watch([selectedCell, cells], ...)\` fires whenever \`cells\` changes — including when the user commits a formula edit (which calls \`updateCellValue\`, which mutates \`cells\`). Without the guard, this sequence would happen:

1. User types "=A1+1" in the bar
2. commitFormula runs → updateCellValue → cells changes
3. watch fires → formulaBarValue = cells[row][col].raw → "=A1+1"
4. No visible problem — but the cursor resets to position 0

With the guard (\`if (isEditingFormula.value) return\`), step 3 is skipped while the user is typing. The bar stays exactly as the user left it. The guard is a common pattern whenever two reactive systems need to communicate without forming a loop.`,
  },
}
