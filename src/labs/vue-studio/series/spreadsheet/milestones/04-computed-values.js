export default {
  id: 'computed-values',
  number: 4,
  title: 'Computed Values',
  objective: 'Type =A1+B1 in a cell and it shows the result. Change A1 — it updates automatically.',
  concepts: [
    { id: 'computed',   label: 'computed() — cached reactive derivation' },
    { id: 'parsing',    label: 'Formula parsing — string → evaluated result' },
    { id: 'composable', label: 'useSpreadsheet — encapsulating all spreadsheet logic' },
    { id: 'newFn',      label: 'new Function() — dynamic expression evaluation (and its risks)' },
  ],
  files: {
    'src/composables/useSpreadsheet.ts':
`import { ref, computed } from 'vue'

type CellValue = number | string

function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
}

function parseCellAddress(address: string): { rowIndex: number; colIndex: number } {
  const match = address.match(/^([A-Z]+)(\\d+)$/)
  if (!match) throw new Error(\`Invalid cell address: \${address}\`)
  return {
    rowIndex: parseInt(match[2], 10) - 1,
    colIndex: columnLetterToIndex(match[1]),
  }
}

function evaluateFormula(formula: string, rawData: CellValue[][]): number | string {
  const expression = formula.slice(1)

  const resolved = expression.replace(/[A-Z]+\\d+/g, (address) => {
    try {
      const { rowIndex, colIndex } = parseCellAddress(address)
      const cellValue = rawData[rowIndex]?.[colIndex]
      if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
        return String(evaluateFormula(cellValue, rawData))
      }
      return String(Number(cellValue) || 0)
    } catch {
      return '0'
    }
  })

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(\`return (\${resolved})\`)()
    return typeof result === 'number' ? Math.round(result * 1e10) / 1e10 : String(result)
  } catch {
    return '#ERROR'
  }
}

export function useSpreadsheet(initialData: CellValue[][]) {
  const rawData = ref<CellValue[][]>(initialData)

  const displayData = computed<(number | string)[][]>(() =>
    rawData.value.map((row) =>
      row.map((cell) => {
        if (typeof cell === 'string' && cell.startsWith('=')) {
          return evaluateFormula(cell, rawData.value)
        }
        return cell
      })
    )
  )

  function updateCell(rowIndex: number, colIndex: number, newValue: string) {
    const parsed = parseFloat(newValue)
    rawData.value[rowIndex][colIndex] = isNaN(parsed) ? newValue : parsed
  }

  return { rawData, displayData, updateCell }
}`,

    'src/App.vue':
`<script setup lang="ts">
import Grid from './components/Grid.vue'
import { useSpreadsheet } from './composables/useSpreadsheet'

const { displayData, updateCell } = useSpreadsheet([
  [5,   10, '=A1+B1'],
  [20,  25, '=A2+B2'],
  [35,  40, '=A3+B3'],
])
</script>

<template>
  <div class="spreadsheet">
    <p class="hint">Double-click a cell to edit. Try changing A1 and watch C1 update.</p>
    <Grid :rows="displayData" @update-cell="updateCell" />
  </div>
</template>

<style scoped>
.spreadsheet { padding: 24px; font-family: system-ui, sans-serif; }
.hint { font-size: 13px; color: #64748b; margin-bottom: 12px; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/composables/useSpreadsheet.ts': `## Why computed() is the right tool here

\`displayData\` could be a method — called in the template each render. But methods have no cache. For a 100×100 grid with complex formulas, re-evaluating every formula on every keystroke (not just when the data changes) would be slow and unpredictable.

\`computed()\` caches the result. Vue tracks which reactive values \`displayData\` reads (\`rawData.value\`). When \`rawData\` changes, Vue marks \`displayData\` stale. The next template access re-evaluates. Between changes, the cached result is returned instantly.

This is **memoisation** — one of the most important performance techniques in computing. Excel's recalculation engine uses the same idea, tracking cell dependencies to know exactly which cells need recalculation.`,
  },
}
