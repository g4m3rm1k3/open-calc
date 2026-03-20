import { useRef, useEffect } from 'react'

/**
 * Bridge between React's render cycle and D3's imperative DOM mutation.
 * renderFn receives the raw DOM node, may return a cleanup function.
 */
export function useD3(renderFn, dependencies) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const cleanup = renderFn(ref.current)
    return () => { if (typeof cleanup === 'function') cleanup() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  return ref
}
