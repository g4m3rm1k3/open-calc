// The reverse of heapUnwrap.ts — takes a real host-side JS value (returned
// from persistent storage that lives outside the interpreter entirely) and
// allocates it into the interpreter's heap, so interpreted student code can
// read it as a real array/object. Mirrors the same allocate/set pattern the
// interpreter's own JSON.parse native uses internally for the same job.
export function heapWrap(value: unknown, heap: any): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    const ref = heap.allocate("Array", { length: value.length });
    value.forEach((item, i) => heap.set(ref, String(i), heapWrap(item, heap)));
    return ref;
  }

  const ref = heap.allocate("Object", {});
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    heap.set(ref, key, heapWrap(val, heap));
  }
  return ref;
}
