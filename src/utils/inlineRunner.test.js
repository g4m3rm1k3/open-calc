import { describe, it, expect } from 'vitest'
import { runJSInline } from './inlineRunner.js'

describe('runJSInline', () => {
  it('runs plain synchronous code as before', async () => {
    const { output, error } = await runJSInline('console.log(1 + 2)')
    expect(error).toBeNull()
    expect(output).toBe('3')
  })

  it('REGRESSION: supports top-level await (test harnesses append `await fn(...)` for async challenges)', async () => {
    const code = `
async function loadThing() { return { ok: true } }
const result = await loadThing()
console.log(result.ok)
`
    const { output, error } = await runJSInline(code)
    expect(error).toBeNull()
    expect(output).toBe('true')
  })

  it('propagates a rejected top-level await as an error, not a silent hang', async () => {
    const code = `
async function failing() { throw new Error('boom') }
await failing()
`
    const { error } = await runJSInline(code)
    expect(error).toContain('boom')
  })

  it('still captures an explicit top-level return value the way the old synchronous version did', async () => {
    const { output } = await runJSInline('return 42')
    expect(output).toBe('42')
  })
})
