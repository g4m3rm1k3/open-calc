export default {
  id: 'emit-events',
  number: 6,
  title: 'Emit Events',
  objective: 'Let child components communicate up to parents with defineEmits.',
  concepts: [
    { id: 'defineEmits', label: 'defineEmits<T>() — declaring custom events' },
    { id: 'emit',        label: 'emit("event", payload) — firing an event' },
    { id: 'atEvent',     label: '@event="handler" — listening to custom events' },
    { id: 'upward',      label: 'One-way data flow — children never mutate parent state' },
  ],
  starter: {
    'src/components/TodoItem.vue':
`<script setup lang="ts">
</script>

<template>
</template>

<style scoped>
li { padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; user-select: none; }
li.done { opacity: 0.4; text-decoration: line-through; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
</script>

<template>
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

  files: {
    'src/components/TodoItem.vue':
`<script setup lang="ts">
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()
</script>

<template>
  <li :class="{ done: props.done }" @click="emit('toggle', props.id)">
    {{ props.text }}
  </li>
</template>

<style scoped>
li { padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; user-select: none; }
li.done { opacity: 0.4; text-decoration: line-through; }
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
        :id="todo.id"
        :text="todo.text"
        :done="todo.done"
        @toggle="toggle"
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
    'src/components/TodoItem.vue': `## Why TodoItem emits instead of mutating

TodoItem does not have access to the \`todos\` array — it only knows its own \`id\`, \`text\`, and \`done\`. This is intentional. If TodoItem could reach up and mutate the parent's data, you would have invisible side effects: changing the list from a component buried deep in the tree, with no clear signal that it happens.

**emit** is the contract for upward communication. The parent decides what to do when the event fires. TodoItem just signals: "I was clicked with id N."`,

    'src/App.vue': `## Why App.vue handles toggle

App.vue owns \`todos\`. It is the only place that should change \`todos\`. When TodoItem emits \`toggle\`, App.vue's \`toggle(id)\` function runs — in the same file as the data it changes.

This is the **single source of truth** principle. Data lives in one place. Changes happen in one place. Debugging is predictable.`,
  },
}
