// The shared interpreter (src/engines/js/interpreter) represents every object
// and array as a heap reference ({ __kind: 'reference', objectId }), not a
// real JS object — environment.js's own serializeValue only returns a
// shallow { $ref: objectId } marker for these, which is enough for its own
// debug-snapshot purpose but not enough to actually read a value back into
// real host JS. This walks a reference (and everything reachable from it)
// into a genuine plain JS value, using the same heap.ownKeys/heap.get calls
// the interpreter's own native Object.keys/Object.values implementations use.
export function heapUnwrap(value: any, heap: any, seen: Set<number> = new Set()): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  if (value.__kind === "reference") {
    const objectId = value.objectId;
    if (seen.has(objectId)) return "[Circular]";
    seen.add(objectId);

    const keys: string[] = heap.ownKeys(value);
    const isArrayLike =
      keys.includes("length") && keys.every((k) => k === "length" || /^\d+$/.test(k));

    if (isArrayLike) {
      const length = heap.get(value, "length");
      const arr: unknown[] = [];
      for (let i = 0; i < length; i++) {
        arr.push(heapUnwrap(heap.get(value, String(i)), heap, seen));
      }
      return arr;
    }

    const obj: Record<string, unknown> = {};
    for (const key of keys) {
      obj[key] = heapUnwrap(heap.get(value, key), heap, seen);
    }
    return obj;
  }

  if (value.__kind === "function" || value.__kind === "native" || value.__kind === "class") {
    return `[Function: ${value.name ?? "(anonymous)"}]`;
  }

  return value;
}
