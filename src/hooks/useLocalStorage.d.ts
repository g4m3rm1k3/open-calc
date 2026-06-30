export function writeLocalStorageKey(key: string, value: unknown): void

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
