export default {
  id: 'conditionals',
  number: 4,
  title: 'Conditionals & Lists',
  objective: 'Render different UI based on data with v-if and v-for.',
  concepts: [
    { id: 'vIf',   label: 'v-if / v-else — conditional DOM rendering' },
    { id: 'vFor',  label: 'v-for — list rendering from arrays' },
    { id: 'key',   label: ':key — stable identity for list items' },
    { id: 'class', label: ':class — dynamic CSS classes' },
  ],
  files: {
    'src/App.vue':
`<script setup lang="ts">
import { ref, computed } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
  { id: 3, text: 'Ship it', done: false },
])
const filter = ref('all')

const filtered = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done')   return todos.value.filter(t => t.done)
  return todos.value
})

function toggle(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <div class="app">
    <h2>Todo List</h2>
    <div class="filters">
      <button v-for="f in ['all', 'active', 'done']" :key="f"
        :class="{ active: filter === f }" @click="filter = f">
        {{ f }}
      </button>
    </div>
    <p v-if="filtered.length === 0" class="empty">Nothing here yet.</p>
    <ul v-else>
      <li v-for="todo in filtered" :key="todo.id"
        :class="{ done: todo.done }" @click="toggle(todo.id)">
        {{ todo.text }}
      </li>
    </ul>
    <div class="summary">{{ todos.filter(t => !t.done).length }} remaining</div>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 380px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.filters { display: flex; gap: 6px; margin-bottom: 16px; }
.filters button { padding: 4px 12px; border-radius: 16px; border: 1px solid #cbd5e1; background: none; cursor: pointer; font-size: 13px; text-transform: capitalize; }
.filters button.active { background: #41b883; color: white; border-color: #41b883; }
.empty { color: #94a3b8; font-style: italic; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }
li.done { opacity: 0.4; text-decoration: line-through; }
.summary { margin-top: 16px; font-size: 13px; color: #64748b; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/App.vue': `## Why v-if and v-for

Vue's directives are **reactive** — they re-run whenever the data they depend on changes. \`v-for="todo in filtered"\` re-renders whenever \`filtered\` (a computed) changes. \`v-if="filtered.length === 0"\` swaps between the empty state and the list automatically.

**The CS concept:** Declarative data binding — the template describes the desired UI state, and Vue reconciles the DOM to match it. You never manually add/remove DOM nodes.`,
  },
}
