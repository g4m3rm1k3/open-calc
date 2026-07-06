export default {
  id: 'editing',
  number: 3,
  title: 'Editing',
  objective: 'Double-click a cell to edit it; Enter or blur to commit; Escape to cancel.',
  concepts: [
    { id: 'fsm',       label: 'Finite state machine — display mode ↔ edit mode' },
    { id: 'vModel',    label: 'v-model — two-way input binding' },
    { id: 'emit',      label: 'emit — child-to-parent event communication' },
    { id: 'parseFloat', label: 'parseFloat — normalising strings to numbers at input' },
  ],
  files: {
    'src/components/Cell.vue':
`<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  value: number | string
  rowIndex: number
  colIndex: number
}>()

const emit = defineEmits<{
  update: [rowIndex: number, colIndex: number, newValue: string]
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
  <div class="cell" @dblclick="startEditing">
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
  width: 80px;
  height: 32px;
  border-right: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  background: white;
  box-sizing: border-box;
  cursor: default;
}
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: 2px solid #41b883;
  font-size: 14px;
  padding: 0 4px;
  box-sizing: border-box;
}
</style>`,

    'src/components/Row.vue':
`<script setup lang="ts">
import Cell from './Cell.vue'

defineProps<{
  cells: (number | string)[]
  rowIndex: number
}>()

defineEmits<{
  updateCell: [rowIndex: number, colIndex: number, value: string]
}>()
</script>

<template>
  <div class="row">
    <Cell
      v-for="(cellValue, colIndex) in cells"
      :key="colIndex"
      :value="cellValue"
      :rowIndex="rowIndex"
      :colIndex="colIndex"
      @update="$emit('updateCell', rowIndex, colIndex, $event)"
    />
  </div>
</template>

<style scoped>
.row { display: flex; }
</style>`,

    'src/components/Grid.vue':
`<script setup lang="ts">
import Row from './Row.vue'

defineProps<{
  rows: (number | string)[][]
}>()

defineEmits<{
  updateCell: [rowIndex: number, colIndex: number, value: string]
}>()
</script>

<template>
  <div class="grid">
    <Row
      v-for="(rowCells, rowIndex) in rows"
      :key="rowIndex"
      :cells="rowCells"
      :rowIndex="rowIndex"
      @update-cell="$emit('updateCell', rowIndex, $event.colIndex, $event.value)"
    />
  </div>
</template>

<style scoped>
.grid {
  display: inline-flex;
  flex-direction: column;
  border-top: 1px solid #cbd5e1;
  border-left: 1px solid #cbd5e1;
}
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { ref } from 'vue'
import Grid from './components/Grid.vue'

const gridData = ref<(number | string)[][]>([
  [5,  10, 15],
  [20, 25, 30],
  [35, 40, 45],
])

function updateCell(rowIndex: number, colIndex: number, newValue: string) {
  const parsed = parseFloat(newValue)
  gridData.value[rowIndex][colIndex] = isNaN(parsed) ? newValue : parsed
}
</script>

<template>
  <div class="spreadsheet">
    <Grid :rows="gridData" @update-cell="updateCell" />
  </div>
</template>

<style scoped>
.spreadsheet { padding: 24px; font-family: system-ui, sans-serif; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/components/Cell.vue': `## Why editValue is a local copy

When the user starts typing, we don't want every keystroke to update the grid. \`editValue\` accumulates the characters locally. The grid only learns the new value when \`commitEdit\` fires (Enter or blur).

This has two benefits:
1. **Performance:** no grid recalculation on every keystroke (critical in lesson 4 when formulas are involved)
2. **User control:** Escape can cancel — if we updated the grid on every keystroke, there would be nothing to cancel

This pattern is called a "controlled input with deferred commit" — the input is controlled (Vue owns its value via \`editValue\`), and the commit is explicit.`,
  },
}
