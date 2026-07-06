export default {
  id: 'display-ui',
  number: 1,
  title: 'Display Something',
  objective: 'Mount a Vue application and show reactive data in the browser.',
  concepts: [
    { id: 'script-setup', label: '<script setup> — the Composition API entry point' },
    { id: 'ref',          label: 'ref() — reactive container for a single value' },
    { id: 'template',     label: '<template> — declarative UI description' },
    { id: 'mustache',     label: '{{ }} — binding data into the view' },
    { id: 'createApp',    label: 'createApp() — bootstrapping the application' },
    { id: 'mount',        label: '.mount() — connecting Vue to the HTML page' },
  ],
  files: {
    'src/App.vue':
`<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello from Vue!')
</script>

<template>
  <h1>{{ message }}</h1>
</template>

<style scoped>
h1 {
  color: #41b883;
  font-family: system-ui, sans-serif;
}
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/App.vue': `## Why App.vue exists

Every Vue application has exactly one root component — the starting point that Vue mounts first. **App.vue is that root.**

**The CS concept:** A component is the fundamental unit of composition in Vue — a bundle of reactive state, behaviour, and a description of how to render that state as HTML.

**The SE principle:** Single responsibility. App.vue defines the root of the component tree. It does not implement business logic or fetch data — those belong elsewhere as your project grows.

**In production:** Every Vue project created with \`npm create vue@latest\` has this exact file at \`src/App.vue\`. Vite compiles it from the \`.vue\` format into plain JavaScript before shipping it to the browser.`,

    'src/main.ts': `## Why main.ts exists

**main.ts is the entry point** — the first file the build tool loads. Its only job: create the Vue application and attach it to the HTML page.

\`\`\`typescript
createApp(App).mount('#app')
\`\`\`

\`createApp(App)\` creates the application instance. \`.mount('#app')\` connects it to \`<div id="app">\` in \`index.html\`.

**The SE principle:** Separation of concerns. main.ts has one reason to change: bootstrapping configuration. App.vue has a different reason: the root component's layout or state. Keeping them separate means changing one never risks breaking the other.`,
  },
}
