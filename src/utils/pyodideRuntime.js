let _promise = null

export async function getPyodide() {
  if (!_promise) {
    _promise = (async () => {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Pyodide CDN. Check network.'))
          document.head.appendChild(script)
        })
      }
      return window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        fullStdLib: false,
      })
    })().catch(err => { _promise = null; throw err })
  }
  return _promise
}
