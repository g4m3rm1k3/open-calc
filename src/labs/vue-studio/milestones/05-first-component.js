export default {
  id: 'first-component',
  number: 5,
  title: 'First Component',
  objective: 'Extract reusable UI into its own file and pass data with defineProps.',
  concepts: [
    { id: 'defineProps',  label: 'defineProps<T>() — declaring a component\'s inputs' },
    { id: 'propBinding',  label: ':prop="value" — binding expressions to props' },
    { id: 'scoped',       label: '<style scoped> — CSS that cannot leak' },
    { id: 'reuse',        label: 'Component reuse — one file, use it anywhere' },
  ],
  files: {
    'src/components/TodoItem.vue':
`<script setup lang="ts">
const props = defineProps<{
  text: string
  done: boolean
}>()
</script>

<template>
  <li :class="{ done: props.done }">
    {{ props.text }}
  </li>
</template>

<style scoped>
li {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
li.done {
  opacity: 0.4;
  text-decoration: line-through;
}
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { ref } from 'vue'
import TodoItem from './components/TodoItem.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
  { id: 3, text: 'Ship it', done: false },
])

function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <div class="app">
    <h2>Todos</h2>
    <ul>
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :text="todo.text"
        :done="todo.done"
        @click="toggle(todo.id)"
      />
    </ul>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 380px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/components/TodoItem.vue': `## Why TodoItem.vue exists

When you find yourself copying the same markup in multiple places — or when a block of markup grows complex enough to deserve its own name — extract it into a component.

**The SE principle:** Don't Repeat Yourself (DRY). If the styling or behaviour of a todo item needs to change, you change it in one file. Every instance updates automatically.

**defineProps** is the contract: "I accept \`text\` (string) and \`done\` (boolean) from whoever uses me." TypeScript validates this at compile time. Vue validates it at runtime.`,

    'src/App.vue': `## Why App.vue imports TodoItem

App.vue now delegates rendering individual items to \`TodoItem.vue\`. App knows what todos exist. TodoItem knows how one todo looks. These are different responsibilities — different files.

**The CS concept:** Decomposition — breaking a problem into smaller sub-problems. The component tree is a decomposition of the UI.`,
  },
}
