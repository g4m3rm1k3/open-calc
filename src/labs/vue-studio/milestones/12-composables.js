export default {
  id: 'composables',
  number: 12,
  title: 'Composables',
  objective: 'Package reactive logic into reusable functions that any component can call.',
  concepts: [
    { id: 'composable',   label: 'Composable — a function that uses Vue reactivity' },
    { id: 'usePrefix',    label: 'use* naming convention — signals a composable' },
    { id: 'cleanup',      label: 'onUnmounted — cleaning up timers, listeners, subscriptions' },
    { id: 'encap',        label: 'Encapsulation — hiding state, exposing only what callers need' },
  ],
  files: {
    'src/composables/useCounter.ts':
`import { ref } from 'vue'

export function useCounter(initial = 0, step = 1) {
  const count = ref(initial)

  function increment() { count.value += step }
  function decrement() { count.value -= step }
  function reset()     { count.value = initial }

  return { count, increment, decrement, reset }
}`,

    'src/composables/useLocalStorage.ts':
`import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const value = ref<T>(stored !== null ? JSON.parse(stored) : defaultValue)

  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return value
}`,

    'src/composables/useTimer.ts':
`import { ref, onUnmounted } from 'vue'

export function useTimer(intervalMs = 1000) {
  const seconds = ref(0)
  const running = ref(false)

  let id: ReturnType<typeof setInterval> | null = null

  function start() {
    if (running.value) return
    running.value = true
    id = setInterval(() => { seconds.value++ }, intervalMs)
  }

  function stop() {
    running.value = false
    if (id !== null) { clearInterval(id); id = null }
  }

  function reset() {
    stop()
    seconds.value = 0
  }

  // Critical: clean up the interval when the component unmounts
  onUnmounted(stop)

  return { seconds, running, start, stop, reset }
}`,

    'src/App.vue':
`<script setup lang="ts">
import { useCounter } from './composables/useCounter'
import { useLocalStorage } from './composables/useLocalStorage'
import { useTimer } from './composables/useTimer'

const { count, increment, decrement, reset } = useCounter(0, 5)
const name = useLocalStorage('vue-name', 'World')
const { seconds, running, start, stop, reset: resetTimer } = useTimer()

function pad(n: number) { return String(n).padStart(2, '0') }
const display = () => \`\${pad(Math.floor(seconds.value / 60))}:\${pad(seconds.value % 60)}\`
</script>

<template>
  <div class="app">

    <section class="card">
      <h3>Counter (step 5)</h3>
      <div class="row">
        <button @click="decrement">−</button>
        <span class="value">{{ count }}</span>
        <button @click="increment">+</button>
        <button class="ghost" @click="reset">Reset</button>
      </div>
    </section>

    <section class="card">
      <h3>Persistent Name</h3>
      <input v-model="name" class="input" placeholder="Your name" />
      <p class="hint">Stored in localStorage — reload the page.</p>
      <p>Hello, <strong>{{ name }}</strong>!</p>
    </section>

    <section class="card">
      <h3>Timer</h3>
      <div class="timer">{{ display() }}</div>
      <div class="row">
        <button v-if="!running" @click="start">Start</button>
        <button v-else @click="stop">Stop</button>
        <button class="ghost" @click="resetTimer">Reset</button>
      </div>
    </section>

  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 380px; margin: 40px auto; display: flex; flex-direction: column; gap: 16px; }
.card { padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
h3 { margin: 0 0 14px; font-size: 14px; font-weight: 700; color: #41b883; }
.row { display: flex; align-items: center; gap: 10px; }
.value { font-size: 24px; font-weight: 700; min-width: 48px; text-align: center; }
button { padding: 8px 16px; background: #41b883; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
button.ghost { background: #f1f5f9; color: #475569; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 10px; }
.hint { font-size: 12px; color: #94a3b8; margin: 0 0 8px; }
.timer { font-size: 40px; font-weight: 700; font-variant-numeric: tabular-nums; color: #41b883; margin-bottom: 12px; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useTimer.ts': `## Why onUnmounted matters in useTimer

The \`setInterval\` inside \`useTimer\` runs independently of Vue's reactivity system. If the component that called \`useTimer\` is removed from the DOM (navigated away, toggled off with v-if), the interval keeps firing — incrementing \`seconds\` that no one is watching, and holding a reference that prevents garbage collection.

\`onUnmounted\` registers a cleanup callback that runs exactly when the component leaves the DOM. This is the lifecycle hook contract: set up side effects in setup or onMounted, clean them up in onUnmounted.

**The CS concept:** Resource management. Heap allocations have destructors. Event listeners have \`removeEventListener\`. Intervals have \`clearInterval\`. Composables encapsulate both the setup and the teardown — callers never have to remember to clean up.`,

    'src/composables/useLocalStorage.ts': `## Why watch() syncs to localStorage

\`useLocalStorage\` returns a ref — callers use it exactly like any other ref, with \`v-model\` or direct \`.value\` assignment. The sync to localStorage is invisible to callers.

\`watch(value, fn, { deep: true })\` fires the callback whenever the ref's value changes — even if it's an object and a nested property changed. The callback serialises and writes to localStorage.

**The pattern:** expose a normal reactive interface; hide the side effect inside the composable. Callers don't need to know the value is persisted. They get a ref — same API, extra behaviour.`,

    'src/composables/useCounter.ts': `## Why composables are better than utility functions

A utility function returns a value. A composable returns **reactive** state and the functions that manage it — bundled together, inseparable.

If you extracted the counter logic as plain variables (\`let count = 0\`), the template would not update when count changes. \`ref()\` makes the value trackable. The composable packages the trackable state with the functions that are allowed to mutate it — that is the encapsulation.`,
  },
}
