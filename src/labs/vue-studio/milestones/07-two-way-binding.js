export default {
  id: 'two-way-binding',
  number: 7,
  title: 'Two-Way Binding',
  objective: 'Keep form inputs in sync with reactive state using v-model.',
  concepts: [
    { id: 'vModel',   label: 'v-model — two-way binding shorthand' },
    { id: 'vModelEx', label: ':value + @input — what v-model expands to' },
    { id: 'prevent',  label: '@submit.prevent — preventing browser form reload' },
    { id: 'disabled', label: ':disabled — disabling a button from state' },
  ],
  files: {
    'src/components/AddTodo.vue':
`<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ add: [text: string] }>()

const inputText = ref('')

function submit() {
  const trimmed = inputText.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  inputText.value = ''
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <input v-model="inputText" placeholder="What needs doing?" class="input" />
    <button type="submit" :disabled="!inputText.trim()">Add</button>
  </form>
</template>

<style scoped>
.add-form { display: flex; gap: 8px; margin-bottom: 16px; }
.input { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; }
.input:focus { border-color: #41b883; box-shadow: 0 0 0 3px rgba(65,184,131,0.15); }
button { padding: 10px 18px; background: #41b883; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>`,

    'src/components/TodoItem.vue':
`<script setup lang="ts">
const props = defineProps<{ id: number; text: string; done: boolean }>()
const emit = defineEmits<{ toggle: [id: number] }>()
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
import AddTodo from './components/AddTodo.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
])
let nextId = 3

function addTodo(text: string) {
  todos.value.push({ id: nextId++, text, done: false })
}

function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
</script>

<template>
  <div class="app">
    <h2>Todos</h2>
    <AddTodo @add="addTodo" />
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
    'src/components/AddTodo.vue': `## Why AddTodo manages its own input state

The input text is local to the form — App.vue does not need to know what the user is typing until they hit Add. \`inputText\` lives in \`AddTodo.vue\`.

When the form is submitted, \`AddTodo\` emits \`add\` with the final text and then clears its own input. App.vue receives the text and adds it to the list.

**v-model** connects the DOM input to \`inputText\` with no boilerplate. Without it, you would write \`:value="inputText" @input="inputText = $event.target.value"\` — what v-model compiles to.`,
  },
}
