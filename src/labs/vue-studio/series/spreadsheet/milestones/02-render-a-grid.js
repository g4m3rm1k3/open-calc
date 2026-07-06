export default {
  id: 'render-a-grid',
  number: 2,
  title: 'Render a Grid',
  objective: 'Compose a 3×3 grid from reactive data using App → Grid → Row → Cell.',
  concepts: [
    { id: 'vFor',      label: 'v-for — render an element for each item in an array' },
    { id: 'key',       label: ':key — unique identity for list items' },
    { id: 'props',     label: 'Props drilling — passing data through component layers' },
    { id: 'matrix',    label: '2D array — row-major data model for a grid' },
  ],
  files: {
    'src/components/Cell.vue':
`<script setup lang="ts">
defineProps<{
  value: number | string
}>()
</script>

<template>
  <div class="cell">{{ value }}</div>
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
}
</style>`,

    'src/components/Row.vue':
`<script setup lang="ts">
import Cell from './Cell.vue'

defineProps<{
  cells: (number | string)[]
}>()
</script>

<template>
  <div class="row">
    <Cell
      v-for="(cellValue, colIndex) in cells"
      :key="colIndex"
      :value="cellValue"
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
</script>

<template>
  <div class="grid">
    <Row
      v-for="(rowCells, rowIndex) in rows"
      :key="rowIndex"
      :cells="rowCells"
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

const gridData = ref([
  [5,  10, 15],
  [20, 25, 30],
  [35, 40, 45],
])
</script>

<template>
  <div class="spreadsheet">
    <Grid :rows="gridData" />
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
    'src/components/Grid.vue': `## Why App → Grid → Row → Cell

Each layer solves a different problem:
- **Grid** knows the shape of the data (2D array of rows)
- **Row** knows what one row looks like (flat array of cells in a flex container)
- **Cell** knows how one value is displayed

If Grid directly rendered cells with two nested \`v-for\`, any change to row layout (add row headers, make rows collapsible) would require editing Grid — violating its responsibility. By introducing Row, row-level concerns belong to Row.

This decomposition is not over-engineering for 3 components. It is the pattern that allows a 100-component spreadsheet to stay maintainable.`,
  },
}
