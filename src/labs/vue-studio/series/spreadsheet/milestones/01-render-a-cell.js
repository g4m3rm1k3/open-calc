export default {
  id: 'render-a-cell',
  number: 1,
  title: 'Render a Cell',
  objective: 'Build and display one spreadsheet cell on screen.',
  concepts: [
    { id: 'sfc',         label: 'Single File Component — script + template + style in one file' },
    { id: 'defineProps', label: 'defineProps<T>() — declaring typed component inputs' },
    { id: 'mustache',    label: '{{ value }} — safe text interpolation' },
    { id: 'scoped',      label: '<style scoped> — CSS that cannot leak out' },
  ],
  files: {
    'src/components/Cell.vue':
`<script setup lang="ts">
defineProps<{
  value: number | string
}>()
</script>

<template>
  <div class="cell">
    {{ value }}
  </div>
</template>

<style scoped>
.cell {
  width: 80px;
  height: 32px;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  background: white;
  box-sizing: border-box;
}
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import Cell from './components/Cell.vue'
</script>

<template>
  <div class="spreadsheet">
    <Cell :value="42" />
  </div>
</template>

<style scoped>
.spreadsheet {
  padding: 24px;
  font-family: system-ui, sans-serif;
}
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/components/Cell.vue': `## Why Cell.vue is its own file

A spreadsheet is made of thousands of cells. If the cell markup lived in App.vue, changing its appearance would require finding it amongst hundreds of other lines. \`Cell.vue\` is a single file with a single job: render one cell value.

**Single Responsibility Principle:** each file has one reason to change. \`Cell.vue\` changes when the cell's visual design changes. It does not change when the grid layout changes or when formulas are added. That separation is what makes the file small, focused, and easy to find.

**\`<style scoped>\`:** the \`.cell\` class applies only to elements inside this component. If another component also has a \`.cell\` class, they don't interfere. Without scoped, CSS in one component bleeds into all others — a common source of mysterious visual bugs.`,
  },
}
