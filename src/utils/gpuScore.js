export async function getGpuScore() {
  if (!navigator.gpu) return 0
  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
    if (!adapter) return 1
    const mem = navigator.deviceMemory ?? 4
    // isFallbackAdapter = true means software/CPU fallback, not a real GPU
    return (adapter.isFallbackAdapter ? 5 : 50) + mem
  } catch {
    return 0
  }
}
