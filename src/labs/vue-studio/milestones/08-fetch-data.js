export default {
  id: 'fetch-data',
  number: 8,
  title: 'Fetch Data',
  objective: 'Load data from an API when the component mounts and handle loading/error states.',
  concepts: [
    { id: 'onMounted',   label: 'onMounted() — run code when component is in the DOM' },
    { id: 'asyncAwait',  label: 'async/await — waiting for promises cleanly' },
    { id: 'loadState',   label: 'loading / error / data — three-state async pattern' },
    { id: 'nullCheck',   label: 'v-if + v-else — guarding against null during load' },
  ],
  starter: {
    'src/composables/usePosts.ts':
`import { ref, onMounted } from 'vue'

export function usePosts() {
  // Define your reactive state here

  // Use onMounted to fetch data

  // Return the reactive values
}`,

    'src/App.vue':
`<script setup lang="ts">
</script>

<template>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 520px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.state { color: #64748b; }
.error { color: #ef4444; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.card { padding: 16px; background: #f8fafc; border-radius: 10px; }
.card strong { display: block; font-size: 14px; font-weight: 600; text-transform: capitalize; margin-bottom: 6px; }
.card p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },

  files: {
    'src/composables/usePosts.ts':
`import { ref, onMounted } from 'vue'

export interface Post {
  id: number
  title: string
  body: string
}

export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      posts.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  })

  return { posts, loading, error }
}`,

    'src/App.vue':
`<script setup lang="ts">
import { usePosts } from './composables/usePosts'

const { posts, loading, error } = usePosts()
</script>

<template>
  <div class="app">
    <h2>Posts</h2>
    <p v-if="loading" class="state">Loading...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <ul v-else>
      <li v-for="post in posts" :key="post.id" class="card">
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 520px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.state { color: #64748b; }
.error { color: #ef4444; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.card { padding: 16px; background: #f8fafc; border-radius: 10px; }
.card strong { display: block; font-size: 14px; font-weight: 600; text-transform: capitalize; margin-bottom: 6px; }
.card p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/usePosts.ts': `## Why the fetch lives in a composable

App.vue could call \`fetch\` directly in a script block. But if you needed posts in a second component, you would duplicate the logic. A composable extracts the behaviour — not just the data — into a reusable function.

**The CS concept:** Encapsulation. The composable owns its state (\`posts\`, \`loading\`, \`error\`) and the side effect that populates it (\`fetch\`). Callers get the state but cannot see or break the internals.

**The three-state pattern** (loading → data or error) is the industry standard for async UI. Always start with \`loading: true\`. Always wrap in try/catch. Always reset \`loading\` in \`finally\`, not in the \`try\` block.`,

    'src/App.vue': `## Why App.vue uses v-else-if

The template chains \`v-if="loading"\`, \`v-else-if="error"\`, and \`v-else\`. Each branch is mutually exclusive — only one renders at a time. Without this guard, rendering \`posts\` while \`loading\` is true would cause errors because \`posts\` is still an empty array (or null).

Vue renders the DOM declaratively from state — never imperatively. The \`v-if\` chain is the idiomatic way to express: "show me a different UI depending on which state we're in."`,
  },
}
