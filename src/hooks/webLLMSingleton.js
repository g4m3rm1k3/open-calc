// src/hooks/webLLMSingleton.js
// Single source of truth for the WebLLM engine shared across ALL in-app AI hooks.
// (Lovelace, Hippocrates, Studio, Compass, RPG Coach all use the same 1B model.)
//
// Why module-level? The browser only caches one copy of the model weights, but
// CreateMLCEngine() allocates WebGPU resources. Calling it more than once wastes
// VRAM and can cause GPU memory errors. One instance, shared forever.
//
// Cache policy: WebLLM stores model weights in the browser Cache API (~900MB per
// model). We automatically prune any cached model that isn't the currently active
// one — so switching models or updating the MODEL_ID never leaves stale GBs behind.

import { CreateMLCEngine } from '@mlc-ai/web-llm'

export const WEBLLM_MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

const WEBLLM_CACHE_PREFIX = 'webllm/'

let _engine = null
let _enginePromise = null

export async function getSharedEngine(onProgress) {
  if (_engine) return _engine
  if (_enginePromise) return _enginePromise

  _enginePromise = CreateMLCEngine(WEBLLM_MODEL_ID, {
    initProgressCallback: ({ text }) => onProgress?.(text || 'Loading…'),
  }).then(engine => {
    _engine = engine
    _enginePromise = null
    return engine
  })

  return _enginePromise
}

/**
 * Deletes a specific cached model by name (without the "webllm/" prefix).
 * Pass '*' to delete all WebLLM caches.
 * Resets the in-memory singleton if the active model is deleted.
 * @param {string} modelName
 */
export async function deleteCachedModel(modelName) {
  if (!('caches' in window)) return
  if (modelName === '*') {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.filter(n => n.startsWith(WEBLLM_CACHE_PREFIX)).map(n => caches.delete(n))
    )
    _engine = null
    _enginePromise = null
    return
  }
  await caches.delete(WEBLLM_CACHE_PREFIX + modelName)
  if (modelName === WEBLLM_MODEL_ID) {
    _engine = null
    _enginePromise = null
  }
}
