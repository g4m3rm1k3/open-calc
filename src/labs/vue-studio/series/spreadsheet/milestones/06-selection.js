export default {
  id: 'selection',
  number: 6,
  title: 'Selection',
  objective: 'Click a cell to see its address, raw value, and display value in a property panel.',
  concepts: [
    { id: 'provide',     label: 'provide() — make state available to any descendant' },
    { id: 'inject',      label: 'inject() — receive provided state without props' },
    { id: 'injKey',      label: 'InjectionKey<T> — type-safe symbol for provide/inject' },
    { id: 'propDrilling', label: 'Prop drilling — the problem provide/inject solves' },
  ],
  files: {
    'src/composables/useSelection.ts':
`import { ref, provide, inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface SelectedCellInfo {
  row: number
  col: number
}

interface SelectionContext {
  selectedCell: Ref<SelectedCellInfo | null>
  selectCell: (row: number, col: number) => void
  clearSelection: () => void
}

export const SelectionKey: InjectionKey<SelectionContext> = Symbol('selection')

export function provideSelection() {
  const selectedCell = ref<SelectedCellInfo | null>(null)

  function selectCell(row: number, col: number) {
    selectedCell.value = { row, col }
  }

  function clearSelection() {
    selectedCell.value = null
  }

  const context: SelectionContext = { selectedCell, selectCell, clearSelection }
  provide(SelectionKey, context)
  return context
}

export function useSelection(): SelectionContext {
  const context = inject(SelectionKey)
  if (!context) throw new Error('useSelection() must be inside a provideSelection() ancestor')
  return context
}`,

    'src/components/PropertyPanel.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import { useSelection } from '../composables/useSelection'
import type { CellData } from '../types/cell'

const props = defineProps<{
  cells: CellData[][]
  displayData: (number | string)[][]
}>()

const { selectedCell } = useSelection()

function toAddress(row: number, col: number): string {
  return \`\${String.fromCharCode(65 + col)}\${row + 1}\`
}

const info = computed(() => {
  if (!selectedCell.value) return null
  const { row, col } = selectedCell.value
  return {
    address: toAddress(row, col),
    raw: String(props.cells[row]?.[col]?.raw ?? ''),
    display: String(props.displayData[row]?.[col] ?? ''),
  }
})
</script>

<template>
  <div class="panel">
    <template v-if="info">
      <div class="address">{{ info.address }}</div>
      <div class="label">Raw</div>
      <div class="value mono">{{ info.raw }}</div>
      <div class="label">Display</div>
      <div class="value mono">{{ info.display }}</div>
    </template>
    <div v-else class="empty">Click a cell to inspect it</div>
  </div>
</template>

<style scoped>
.panel { width: 180px; padding: 16px; border-left: 1px solid #e2e8f0; font-size: 13px; font-family: system-ui, sans-serif; }
.address { font-size: 20px; font-weight: 700; color: #41b883; margin-bottom: 14px; }
.label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 10px; }
.value { background: #f8fafc; padding: 4px 8px; border-radius: 4px; margin-top: 4px; }
.mono { font-family: monospace; }
.empty { color: #94a3b8; font-style: italic; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import Grid from './components/Grid.vue'
import FormatBar from './components/FormatBar.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { useSpreadsheet } from './composables/useSpreadsheet'
import { provideSelection } from './composables/useSelection'

const { cells, displayData, updateCellValue, updateCellFormat } = useSpreadsheet([
  [5, 10, '=A1+B1'],
  [20, 25, '=A2+B2'],
])

const { selectedCell, selectCell } = provideSelection()
</script>

<template>
  <div class="spreadsheet">
    <FormatBar :format="null" />
    <div class="body">
      <Grid
        :rows="displayData"
        :cellFormats="cells.map(r => r.map(c => c.format))"
        :selectedCell="selectedCell"
        @update-cell="updateCellValue"
        @select-cell="selectCell"
      />
      <PropertyPanel :cells="cells" :displayData="displayData" />
    </div>
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
    'src/composables/useSelection.ts': `## Why InjectionKey instead of a plain string

\`Symbol('selection')\` is globally unique — even if two different parts of the codebase created \`Symbol('selection')\`, they would be different symbols. A string key like \`'selection'\` could collide if another library also used \`provide('selection', ...)\`.

\`InjectionKey<SelectionContext>\` also encodes the type. When \`inject(SelectionKey)\` is called, TypeScript knows the result is \`SelectionContext | undefined\` — not \`unknown\`. The type safety flows from the key itself, not from a manual type assertion at the call site. This is the design pattern that makes Vue Router's \`useRouter()\` type-safe without any manual typing by callers.`,
  },
}
