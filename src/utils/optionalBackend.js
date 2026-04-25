const FALLBACK_BACKEND_URL = 'http://127.0.0.1:4318'

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function getOptionalBackendBaseUrl() {
  const configured = import.meta.env.VITE_OPEN_CALC_BACKEND_URL?.trim()
  if (configured) {
    return trimTrailingSlash(configured)
  }
  return FALLBACK_BACKEND_URL
}

export function buildOptionalBackendUrl(pathname, searchParams) {
  const baseUrl = getOptionalBackendBaseUrl()
  const url = new URL(pathname, `${baseUrl}/`)
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function mergeLessonOverride(baseLesson, overrideLesson) {
  if (!overrideLesson) return baseLesson
  if (!baseLesson) return overrideLesson

  const result = { ...baseLesson }
  for (const [key, value] of Object.entries(overrideLesson)) {
    if (Array.isArray(value)) {
      result[key] = value.slice()
      continue
    }
    if (isPlainObject(value) && isPlainObject(baseLesson[key])) {
      result[key] = mergeLessonOverride(baseLesson[key], value)
      continue
    }
    result[key] = value
  }
  return result
}
