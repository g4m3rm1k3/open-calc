export const EXTERNAL_WRITE_EVENT: string

export function writeLocalStorageKey(key: string, value: unknown): void

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
