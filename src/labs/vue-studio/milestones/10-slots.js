export default {
  id: 'slots',
  number: 10,
  title: 'Slots',
  objective: 'Build layout components that accept arbitrary content from the parent.',
  concepts: [
    { id: 'slot',        label: '<slot> — placeholder for parent-provided content' },
    { id: 'namedSlots',  label: 'Named slots — multiple content regions in one component' },
    { id: 'slotsFallback', label: 'Slot fallback — default content when parent provides none' },
    { id: 'scopedSlots', label: 'Scoped slots — passing data from child back to parent' },
  ],
  files: {
    'src/components/Card.vue':
`<script setup lang="ts">
defineProps<{ variant?: 'default' | 'success' | 'warning' }>()
</script>

<template>
  <div class="card" :class="$props.variant || 'default'">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    <div class="card-body">
      <slot>
        <!-- Fallback shown when no default content is provided -->
        <p class="empty">No content yet.</p>
      </slot>
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card { border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; font-family: system-ui, sans-serif; }
.card.success { border-color: #41b883; }
.card.warning { border-color: #f59e0b; }
.card-header { padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 14px; }
.card.success .card-header { background: #f0fdf4; border-color: #86efac; color: #166534; }
.card.warning .card-header { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.card-body { padding: 16px; font-size: 14px; line-height: 1.6; }
.card-footer { padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
.empty { color: #94a3b8; font-style: italic; }
</style>`,

    'src/components/List.vue':
`<script setup lang="ts" generic="T">
defineProps<{ items: T[] }>()
</script>

<template>
  <ul class="list">
    <li v-for="(item, i) in items" :key="i" class="item">
      <!-- Scoped slot: pass item and index back to parent -->
      <slot :item="item" :index="i">
        {{ item }}
      </slot>
    </li>
  </ul>
</template>

<style scoped>
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.item { padding: 10px 14px; background: #f8fafc; border-radius: 8px; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import Card from './components/Card.vue'
import List from './components/List.vue'

const tasks = [
  { label: 'Read the docs', done: true },
  { label: 'Build a component', done: true },
  { label: 'Use slots', done: false },
]
</script>

<template>
  <div class="app">
    <Card variant="success">
      <template #header>✅ Task Tracker</template>
      <!-- Scoped slot — List gives back item + index -->
      <List :items="tasks">
        <template #default="{ item, index }">
          <span :style="{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }">
            {{ index + 1 }}. {{ item.label }}
          </span>
        </template>
      </List>
      <template #footer>{{ tasks.filter(t => t.done).length }}/{{ tasks.length }} complete</template>
    </Card>

    <br />

    <Card variant="warning">
      <template #header>⚠️ Empty Card</template>
      <!-- No default slot content — fallback will show -->
    </Card>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 420px; margin: 40px auto; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/components/Card.vue': `## Why slots exist

Props pass data (strings, numbers, objects) downward. Slots pass **markup** downward — arbitrary Vue template content. This is how you build generic layout components that have no opinion about what goes inside them.

\`Card.vue\` does not know what a header or body contains. The parent decides. The card just provides the frame: border, padding, colour scheme, conditional header/footer rails.

**Named slots** create multiple content regions. \`#header\` and \`#footer\` let the parent fill separate areas. \`$slots.header\` lets the card render the header rail only when the parent provides one.

This pattern is how UI libraries like Headless UI, Radix, and Shadcn work. The component provides behaviour and structure; your code provides the visual content.`,

    'src/components/List.vue': `## Why scoped slots

A scoped slot passes data from the child back up to the parent's template. \`List.vue\` provides each \`item\` and its \`index\`; the parent template decides how to render that item.

This gives you the flexibility of a callback: List handles the loop, keys, and layout. The parent handles the visual content per item. Neither needs to know the internals of the other.

Compare to React's render props pattern — scoped slots are Vue's equivalent, but with template syntax instead of JSX.`,
  },
}
