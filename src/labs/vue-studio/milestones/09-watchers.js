export default {
  id: 'watchers',
  number: 9,
  title: 'Watchers',
  objective: 'React to data changes with side effects using watch() and watchEffect().',
  concepts: [
    { id: 'watch',       label: 'watch() — observe a specific source' },
    { id: 'watchEffect', label: 'watchEffect() — auto-track all reads inside' },
    { id: 'oldNew',      label: 'old / new values — comparing before and after' },
    { id: 'debounce',    label: 'debounce — delaying expensive work on rapid input' },
  ],
  starter: {
    'src/App.vue':
`<script setup lang="ts">
</script>

<template>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 420px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; }
.input:focus { border-color: #41b883; box-shadow: 0 0 0 3px rgba(65,184,131,0.15); }
.hint { color: #94a3b8; font-size: 13px; margin-top: 12px; }
ul { list-style: none; padding: 0; margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 12px; font-size: 13px; font-family: monospace; }
.empty { color: #94a3b8; font-style: italic; font-size: 14px; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },

  files: {
    'src/App.vue':
`<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

const query = ref('')
const results = ref<string[]>([])
const searching = ref(false)

const WORDS = [
  'array', 'async', 'await', 'boolean', 'class', 'computed',
  'const', 'emit', 'interface', 'null', 'props', 'reactive',
  'readonly', 'ref', 'string', 'template', 'type', 'undefined',
  'watch', 'watchEffect',
]

// Debounced search watcher
let timer: ReturnType<typeof setTimeout>

watch(query, (newVal) => {
  clearTimeout(timer)
  if (!newVal.trim()) {
    results.value = []
    searching.value = false
    return
  }
  searching.value = true
  timer = setTimeout(() => {
    results.value = WORDS.filter(w => w.includes(newVal.toLowerCase()))
    searching.value = false
  }, 300)
})

// watchEffect: logs whenever query or results change — no need to list sources
watchEffect(() => {
  console.log(\`query: "\${query.value}" → \${results.value.length} result(s)\`)
})
</script>

<template>
  <div class="app">
    <h2>Watcher Demo</h2>
    <input v-model="query" class="input" placeholder="Search Vue concepts..." />
    <p class="hint" v-if="searching">Searching...</p>
    <ul v-else>
      <li v-for="word in results" :key="word" class="chip">{{ word }}</li>
      <li v-if="query && !results.length" class="empty">No results for "{{ query }}"</li>
    </ul>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 420px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; }
.input:focus { border-color: #41b883; box-shadow: 0 0 0 3px rgba(65,184,131,0.15); }
.hint { color: #94a3b8; font-size: 13px; margin-top: 12px; }
ul { list-style: none; padding: 0; margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 12px; font-size: 13px; font-family: monospace; }
.empty { color: #94a3b8; font-style: italic; font-size: 14px; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/App.vue': `## Why watch() instead of a computed()

\`computed()\` is for deriving a value. \`watch()\` is for triggering a side effect — something that changes the world outside the reactive graph (an HTTP request, a localStorage write, a \`setTimeout\`).

A debounced search is a side effect. The user types; 300ms later, a search fires. Without a watcher, you would call the search on every keystroke — one HTTP request per character. The debounce collapses rapid input into a single call.

**watch vs watchEffect:**
- \`watch(query, fn)\` — explicit source, receives old and new value, opt-in to which refs trigger it
- \`watchEffect(fn)\` — implicit, auto-tracks every ref it reads; runs immediately on mount too

Use \`watch\` when you need old/new values or when you want to be explicit. Use \`watchEffect\` for logging and other effects that should re-run whenever any of their inputs change.`,
  },
}
