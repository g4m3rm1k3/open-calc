const DEFAULT_AXES = ["X", "Y", "Z", "B", "C"];

export function makeCoordinateSystem({
  id,
  name,
  type = "user",
  origin = {},
  rotation = {},
  parentId = "machine",
  locked = false,
  visible = true,
} = {}) {
  const safeId =
    id ||
    `${type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: safeId,
    name: name || safeId.toUpperCase(),
    type,
    parentId,
    locked,
    visible,
    origin: {
      X: Number(origin.X ?? origin.x ?? 0) || 0,
      Y: Number(origin.Y ?? origin.y ?? 0) || 0,
      Z: Number(origin.Z ?? origin.z ?? 0) || 0,
    },
    rotation: {
      A: Number(rotation.A ?? rotation.a ?? 0) || 0,
      B: Number(rotation.B ?? rotation.b ?? 0) || 0,
      C: Number(rotation.C ?? rotation.c ?? 0) || 0,
    },
  };
}

export function createDefaultCoordinateSystems(offsets = {}) {
  const frames = [
    makeCoordinateSystem({
      id: "machine",
      name: "Machine Zero",
      type: "machine",
      parentId: null,
      locked: true,
      visible: false,
      origin: { X: 0, Y: 0, Z: 0 },
    }),
    makeCoordinateSystem({
      id: "setup",
      name: "Setup",
      type: "setup",
      parentId: "machine",
      locked: true,
      visible: false,
      origin: { X: 0, Y: 0, Z: 0 },
    }),
  ];

  Object.entries(offsets).forEach(([key, offset]) => {
    frames.push(offsetToCoordinateSystem(key, offset));
  });

  return frames;
}

export function offsetToCoordinateSystem(key, offset = {}) {
  return makeCoordinateSystem({
    id: `wcs_${key}`,
    name: key,
    type: "wcs",
    parentId: "setup",
    visible: key === "G54",
    origin: offset,
    rotation: offset,
  });
}

export function coordinateSystemToOffset(frame, previous = {}) {
  const origin = frame?.origin || {};
  const rotation = frame?.rotation || {};
  return DEFAULT_AXES.reduce(
    (out, axis) => {
      out[axis] =
        Number(origin[axis] ?? rotation[axis] ?? previous[axis] ?? 0) || 0;
      return out;
    },
    {},
  );
}

export function normalizeCoordinateSystems(frames, offsets = {}) {
  const source = Array.isArray(frames) && frames.length
    ? frames
    : createDefaultCoordinateSystems(offsets);
  const seen = new Set();
  const normalized = source.map((frame) => {
    const next = makeCoordinateSystem(frame);
    seen.add(next.id);
    return next;
  });

  if (!seen.has("machine")) {
    normalized.unshift(
      makeCoordinateSystem({
        id: "machine",
        name: "Machine Zero",
        type: "machine",
        parentId: null,
        locked: true,
      }),
    );
  }

  Object.entries(offsets).forEach(([key, offset]) => {
    const id = `wcs_${key}`;
    if (!seen.has(id)) normalized.push(offsetToCoordinateSystem(key, offset));
  });

  return normalized;
}

export function syncCoordinateSystemsFromOffsets(frames, offsets = {}) {
  const current = normalizeCoordinateSystems(frames, offsets);
  const byId = new Map(current.map((frame) => [frame.id, frame]));

  Object.entries(offsets).forEach(([key, offset]) => {
    const id = `wcs_${key}`;
    const existing = byId.get(id);
    byId.set(
      id,
      makeCoordinateSystem({
        ...(existing || {}),
        id,
        name: existing?.name || key,
        type: "wcs",
        parentId: existing?.parentId || "setup",
        origin: offset,
        rotation: offset,
      }),
    );
  });

  return [...byId.values()];
}

export function applyCoordinateSystemToOffsets(offsets = {}, frame) {
  if (!frame?.id?.startsWith("wcs_")) return offsets;
  const key = frame.id.slice(4);
  return {
    ...offsets,
    [key]: coordinateSystemToOffset(frame, offsets[key]),
  };
}

export function coordinateSystemsToBackplotFrames(frames = [], activeId = null) {
  const options =
    activeId && typeof activeId === "object"
      ? activeId
      : { activeId };
  const {
    activeId: selectedId = null,
    activeWCS = "G54",
    zOffset = 0,
    machineClass = "mill",
  } = options;
  const activeWcsId = `wcs_${activeWCS}`;
  return frames
    .filter((frame) => {
      return frame.visible !== false;
    })
    .map((frame) => {
      const origin = frame.origin || {};
      const isProgrammingFrame = frame.type === "wcs" || frame.type === "user";
      const position =
        machineClass === "lathe" && isProgrammingFrame
          ? [origin.Z || 0, 0, (origin.X || 0) / 2]
          : [
              origin.X || 0,
              origin.Y || 0,
              (origin.Z || 0) + (isProgrammingFrame ? zOffset : 0),
            ];
      return {
        id: frame.id,
        name: frame.name,
        type: frame.type,
        active: frame.id === selectedId || frame.id === activeWcsId,
        position,
        rotation: [
          ((frame.rotation?.A || 0) * Math.PI) / 180,
          ((frame.rotation?.B || 0) * Math.PI) / 180,
          ((frame.rotation?.C || 0) * Math.PI) / 180,
        ],
      };
    });
}
