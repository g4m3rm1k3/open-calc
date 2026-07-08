export default {
  id: 'handle-events',
  number: 2,
  title: 'Handle Events',
  objective: 'React to user clicks with @click and update reactive state.',
  concepts: [
    { id: 'click',  label: '@click — listening to DOM events' },
    { id: 'vOn',    label: 'v-on: — full event directive syntax' },
    { id: 'mutate', label: '.value++ — mutating reactive state' },
  ],
  starter: {
    'src/App.vue':
`<script setup lang="ts">
</script>

<template>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 400px; margin: 40px auto; text-align: center; }
button { padding: 10px 24px; background: #41b883; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
button:hover { background: #33a06f; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },

  files: {
    'src/App.vue':
`<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <div class="app">
    <h1>Count: {{ count }}</h1>
    <button @click="increment">Click me</button>
  </div>
</template>

<style scoped>
.app {
  font-family: system-ui, sans-serif;
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}
button {
  padding: 10px 24px;
  background: #41b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
button:hover { background: #33a06f; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/App.vue': `## Why @click exists

HTML has \`onclick\`. Vue has \`@click\`. The difference: Vue's event system is declarative and scoped to the component, not global. \`@click="increment"\` names a function defined in \`<script setup>\`. Vue routes the event to it automatically — no \`addEventListener\`, no cleanup.

**The CS concept:** Event-driven programming. The application waits for user input, then responds. Vue's event directives are the bridge between browser DOM events and your reactive state.`,
  },
}
