export default {
  id: 'plugins',
  number: 12,
  title: 'Plugins',
  objective: 'Load custom formula functions at runtime using a plugin interface.',
  concepts: [
    { id: 'pluginInterface', label: 'SpreadsheetPlugin — the contract every plugin satisfies' },
    { id: 'typeGuard',       label: 'isValidPlugin() — runtime type validation at boundaries' },
    { id: 'openClosed',      label: 'Open/closed — extend without modifying existing code' },
    { id: 'duckTyping',      label: 'Duck typing — validate shape, not class' },
  ],
  files: {
    'src/types/plugin.ts':
`export type FormulaFn = (values: number[]) => number

export interface SpreadsheetPlugin {
  name: string
  version: string
  description: string
  functions: Record<string, FormulaFn>
}

export function isValidPlugin(value: unknown): value is SpreadsheetPlugin {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.functions === 'object' &&
    candidate.functions !== null &&
    Object.values(candidate.functions as object).every(f => typeof f === 'function')
  )
}`,

    'src/plugins/statistics.ts':
`import type { SpreadsheetPlugin } from '../types/plugin'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function standardDeviation(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function percentile(values: number[], pct: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const index = (pct / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower])
}

export const StatisticsPlugin: SpreadsheetPlugin = {
  name: 'Statistics',
  version: '1.0.0',
  description: 'Statistical functions: MEDIAN, STDEV, PERCENTILE',
  functions: {
    MEDIAN:     (values) => median(values),
    STDEV:      (values) => standardDeviation(values),
    PERCENTILE: (values) => percentile(values.slice(0, -1), values[values.length - 1]),
  },
}`,

    'src/composables/usePlugins.ts':
`import { ref, computed } from 'vue'
import type { SpreadsheetPlugin, FormulaFn } from '../types/plugin'
import { isValidPlugin } from '../types/plugin'
import { FORMULA_FUNCTIONS } from '../utils/formulaFunctions'

export function usePlugins() {
  const loadedPlugins = ref<SpreadsheetPlugin[]>([])
  const errors = ref<string[]>([])

  const allFunctions = computed<Record<string, FormulaFn>>(() => ({
    ...FORMULA_FUNCTIONS,
    ...Object.fromEntries(
      loadedPlugins.value.flatMap(plugin => Object.entries(plugin.functions))
    ),
  }))

  function loadPlugin(candidate: unknown): boolean {
    if (!isValidPlugin(candidate)) {
      errors.value.push(\`Invalid plugin: must have name, version, description, and functions object\`)
      return false
    }
    if (loadedPlugins.value.some(p => p.name === candidate.name)) {
      errors.value.push(\`Plugin "\${candidate.name}" is already loaded\`)
      return false
    }
    loadedPlugins.value.push(candidate)
    return true
  }

  function unloadPlugin(name: string) {
    loadedPlugins.value = loadedPlugins.value.filter(p => p.name !== name)
  }

  function clearErrors() {
    errors.value = []
  }

  return { loadedPlugins, allFunctions, errors, loadPlugin, unloadPlugin, clearErrors }
}`,

    'src/components/PluginManager.vue':
`<script setup lang="ts">
import { ref } from 'vue'
import { usePlugins } from '../composables/usePlugins'
import { StatisticsPlugin } from '../plugins/statistics'

const { loadedPlugins, errors, loadPlugin, unloadPlugin, clearErrors } = usePlugins()

const pluginCode = ref('')

const EXAMPLE = \`{
  name: "My Plugin",
  version: "1.0.0",
  description: "Custom functions",
  functions: {
    DOUBLE: ([value]) => value * 2,
    TRIPLE: ([value]) => value * 3
  }
}\`

function loadFromCode() {
  clearErrors()
  try {
    // eslint-disable-next-line no-new-func
    const pluginDef = new Function(\`return (\${pluginCode.value})\`)()
    if (loadPlugin(pluginDef)) pluginCode.value = ''
  } catch (err) {
    errors.value.push(\`Syntax error: \${err instanceof Error ? err.message : String(err)}\`)
  }
}

const statisticsLoaded = () => loadedPlugins.value.some(p => p.name === 'Statistics')
</script>

<template>
  <div class="manager">
    <h4>Plugins</h4>

    <div class="section">
      <div class="section-title">Built-in</div>
      <button @click="loadPlugin(StatisticsPlugin)" :disabled="statisticsLoaded()">
        {{ statisticsLoaded() ? '✓ Statistics loaded' : 'Load Statistics' }}
      </button>
    </div>

    <div class="section">
      <div class="section-title">Custom plugin</div>
      <textarea v-model="pluginCode" class="code" rows="7" :placeholder="EXAMPLE" />
      <button @click="loadFromCode" :disabled="!pluginCode.trim()">Load plugin</button>
    </div>

    <div v-if="loadedPlugins.length" class="section">
      <div class="section-title">Loaded</div>
      <div v-for="plugin in loadedPlugins" :key="plugin.name" class="plugin-row">
        <div>
          <strong>{{ plugin.name }}</strong>
          <span class="version"> v{{ plugin.version }}</span>
        </div>
        <div class="fns">{{ Object.keys(plugin.functions).join(', ') }}</div>
        <button class="unload" @click="unloadPlugin(plugin.name)">Unload</button>
      </div>
    </div>

    <div v-if="errors.length" class="errors">
      <div v-for="(error, i) in errors" :key="i" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.manager { padding: 16px; border-left: 1px solid #e2e8f0; min-width: 220px; font-family: system-ui, sans-serif; font-size: 13px; overflow-y: auto; }
h4 { margin: 0 0 14px; font-size: 13px; font-weight: 700; color: #41b883; }
.section { margin-bottom: 16px; }
.section-title { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
button { padding: 6px 12px; background: #41b883; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.code { width: 100%; font-family: monospace; font-size: 11px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px; resize: vertical; margin-bottom: 8px; box-sizing: border-box; }
.plugin-row { padding: 8px; background: #f8fafc; border-radius: 6px; margin-bottom: 6px; }
.version { color: #94a3b8; font-size: 11px; }
.fns { font-family: monospace; font-size: 11px; color: #64748b; margin: 4px 0; }
.unload { background: #fee2e2; color: #ef4444; padding: 3px 8px; font-size: 11px; margin-top: 4px; }
.errors { margin-top: 8px; }
.error { padding: 6px 8px; background: #fee2e2; color: #ef4444; border-radius: 4px; font-size: 12px; margin-bottom: 4px; }
</style>`,

    'src/App.vue':
`<script setup lang="ts">
import { computed } from 'vue'
import Grid from './components/Grid.vue'
import PluginManager from './components/PluginManager.vue'
import { useSheets } from './composables/useSheets'
import { provideSelection } from './composables/useSelection'

const { activeSheet, updateCellValue } = useSheets()
const { selectedCell, selectCell } = provideSelection()

const displayData = computed(() =>
  activeSheet.value.cells.map(row => row.map(cell => cell.raw))
)
</script>

<template>
  <div class="spreadsheet">
    <div class="header">
      <h2>Spreadsheet — Lesson 12: Plugins</h2>
      <p>Load the Statistics plugin, then try =MEDIAN(A1:A5) or =STDEV(A1:A5) in a cell.</p>
    </div>
    <div class="body">
      <Grid
        :rows="displayData"
        :cellFormats="activeSheet.cells.map(r => r.map(c => c.format))"
        :selectedCell="selectedCell"
        @update-cell="updateCellValue"
        @select-cell="selectCell"
      />
      <PluginManager />
    </div>
  </div>
</template>

<style scoped>
.spreadsheet { font-family: system-ui, sans-serif; max-width: 680px; margin: 24px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.header { padding: 16px; border-bottom: 1px solid #e2e8f0; }
.header h2 { margin: 0 0 6px; font-size: 16px; }
.header p { margin: 0; font-size: 13px; color: #64748b; }
.body { display: flex; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/types/plugin.ts': `## Why isValidPlugin is a type guard, not just a boolean check

\`isValidPlugin(value): value is SpreadsheetPlugin\` has a special return type. In the \`if (isValidPlugin(candidate))\` branch, TypeScript narrows \`candidate\` from \`unknown\` to \`SpreadsheetPlugin\`. You can then access \`candidate.name\` without a type assertion.

Without the type guard, you would write \`(candidate as SpreadsheetPlugin).name\` — a manual assertion that bypasses TypeScript's checks. With the type guard, the assertion is backed by the runtime validation logic. If the object passes all checks in \`isValidPlugin\`, it is safe to treat as \`SpreadsheetPlugin\`.

This pattern — "validate at the boundary, trust inside" — is the foundation of robust software. External data (APIs, user input, plugin code) is unknown. Once validated, it is trusted. Type guards are the mechanism that makes this boundary explicit in TypeScript.`,
  },
}
