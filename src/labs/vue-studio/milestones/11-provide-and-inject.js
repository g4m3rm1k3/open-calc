export default {
  id: 'provide-and-inject',
  number: 11,
  title: 'Provide & Inject',
  objective: 'Share state across distant components without threading props through every level.',
  concepts: [
    { id: 'provide',     label: 'provide() — make a value available to all descendants' },
    { id: 'inject',      label: 'inject() — receive a provided value anywhere in the tree' },
    { id: 'injectionKey', label: 'InjectionKey<T> — type-safe provide/inject' },
    { id: 'composable',  label: 'useTheme() — wrapping inject in a composable' },
  ],
  files: {
    'src/composables/useTheme.ts':
`import { provide, inject, ref } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface Theme {
  name: 'light' | 'dark'
  bg: string
  fg: string
  accent: string
}

const LIGHT: Theme = { name: 'light', bg: '#ffffff', fg: '#0f172a', accent: '#41b883' }
const DARK:  Theme = { name: 'dark',  bg: '#0f172a', fg: '#f1f5f9', accent: '#41b883' }

// The injection key carries the type — prevents mismatches between provide/inject
export const ThemeKey: InjectionKey<Ref<Theme>> = Symbol('theme')

// Called once at the root component
export function provideTheme() {
  const theme = ref<Theme>(LIGHT)

  function toggle() {
    theme.value = theme.value.name === 'light' ? DARK : LIGHT
  }

  provide(ThemeKey, theme)
  return { theme, toggle }
}

// Called in any descendant — throws if not provided
export function useTheme() {
  const theme = inject(ThemeKey)
  if (!theme) throw new Error('useTheme() called outside of a ThemeProvider')
  return theme
}`,

    'src/components/ThemeToggle.vue':
`<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const theme = useTheme()
</script>

<template>
  <button class="toggle" @click="$emit('toggle')">
    {{ theme.name === 'light' ? '🌙 Dark' : '☀️ Light' }}
  </button>
</template>

<style scoped>
.toggle { padding: 8px 16px; border-radius: 8px; border: 1px solid currentColor; background: transparent; cursor: pointer; font-size: 13px; }
</style>`,

    'src/components/ThemedCard.vue':
`<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineProps<{ title: string; body: string }>()

const theme = useTheme()
</script>

<template>
  <div class="card" :style="{ background: theme.bg, color: theme.fg, borderColor: theme.accent + '44' }">
    <h3 :style="{ color: theme.accent }">{{ title }}</h3>
    <p>{{ body }}</p>
  </div>
</template>

<style scoped>
.card { padding: 20px; border-radius: 12px; border: 1px solid; margin-bottom: 12px; transition: background 0.3s, color 0.3s; }
h3 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
p { margin: 0; font-size: 13px; line-height: 1.6; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { provideTheme } from './composables/useTheme'
import ThemeToggle from './components/ThemeToggle.vue'
import ThemedCard from './components/ThemedCard.vue'

const { theme, toggle } = provideTheme()
</script>

<template>
  <div class="app" :style="{ background: theme.bg, color: theme.fg, minHeight: '100vh' }">
    <header class="header">
      <h2>Theme Demo</h2>
      <ThemeToggle @toggle="toggle" />
    </header>
    <ThemedCard
      title="Provide & Inject"
      body="Both ThemeToggle and ThemedCard read the same theme ref — injected directly, without props being threaded through App.vue."
    />
    <ThemedCard
      title="No Prop Drilling"
      body="If ThemedCard were nested three levels deep inside other components, it would still get the theme. provide() makes it available to the entire subtree."
    />
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 24px; transition: background 0.3s; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h2 { margin: 0; font-size: 20px; font-weight: 700; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useTheme.ts': `## Why provide/inject instead of props

Props require every component in the chain to accept and forward values they don't use. If ThemedCard is inside PageLayout inside Section inside App, all three intermediate components must declare and pass \`theme\` — even though they never use it themselves. This is **prop drilling**.

\`provide\` registers a value at a parent. \`inject\` reads it anywhere in the subtree — no matter how deep. The intermediate components don't know it exists.

**InjectionKey<T>** gives TypeScript information about what type you're injecting. Without it, \`inject()\` returns \`unknown\`. With it, the type flows automatically from the provide site to every inject call.

**The wrapping composable pattern** (useTheme wrapping inject) is idiomatic. It adds the missing-provider error and hides the Symbol from callers. Callers just call \`useTheme()\` — they don't need to import the key.`,

    'src/App.vue': `## Why App.vue calls provideTheme()

App.vue is the root — the highest component in the tree. \`provideTheme()\` provides the theme ref to every descendant. If you called \`provideTheme()\` inside ThemedCard, only ThemedCard's own children could inject it.

**Rule:** call \`provide\` as high as the sharing needs to reach. Call \`inject\` as low (as deep) as you need the value.`,
  },
}
