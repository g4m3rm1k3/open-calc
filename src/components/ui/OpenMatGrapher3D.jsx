import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { X, Box, Layers, Settings2, Trash2, Plus, Info, Activity } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const COLOR_MAPS = {
  parula: ["#352a87", "#0f5cdd", "#00b5a6", "#7fd34e", "#f5e663"],
  jet: ["#00007f", "#0055ff", "#00d4ff", "#ffe600", "#ff5500", "#7f0000"],
  viridis: ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"],
  hot: ["#200000", "#7f0000", "#ff5500", "#ffd200", "#ffffcc"],
};

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const sampleColorMap = (name = "parula", t = 0) => {
  const palette = COLOR_MAPS[String(name).toLowerCase()] || COLOR_MAPS.parula;
  const normalized = clamp01(t);
  if (palette.length === 1) return new THREE.Color(palette[0]);
  const scaled = normalized * (palette.length - 1);
  const index = Math.floor(scaled);
  const localT = scaled - index;
  const start = new THREE.Color(palette[index]);
  const end = new THREE.Color(palette[Math.min(index + 1, palette.length - 1)]);
  return start.lerp(end, localT);
};

const normalizeRange = (range, fallbackValues = []) => {
  if (Array.isArray(range) && range.length >= 2 && Number.isFinite(range[0]) && Number.isFinite(range[1]) && range[0] !== range[1]) {
    return [Number(range[0]), Number(range[1])];
  }
  const values = fallbackValues.filter((value) => Number.isFinite(value));
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? [min, min + 1] : [min, max];
};

const valuesToColorAttribute = (values = [], range, colorMap = "parula") => {
  const [min, max] = normalizeRange(range, values);
  const colors = new Float32Array(values.length * 3);
  values.forEach((value, index) => {
    const mapped = sampleColorMap(colorMap, (Number(value) - min) / (max - min || 1));
    colors[index * 3] = mapped.r;
    colors[index * 3 + 1] = mapped.g;
    colors[index * 3 + 2] = mapped.b;
  });
  return colors;
};

const buildPointsGeometry = (xs = [], ys = [], zs = []) => {
  const count = Math.min(xs.length, ys.length, zs.length);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = xs[i] ?? 0;
    positions[i * 3 + 1] = zs[i] ?? 0;
    positions[i * 3 + 2] = ys[i] ?? 0;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
};

const buildLinePoints = (xs = [], ys = [], zs = []) => {
  const count = Math.min(xs.length, ys.length, zs.length);
  const points = [];
  for (let i = 0; i < count; i += 1) {
    points.push([xs[i] ?? 0, zs[i] ?? 0, ys[i] ?? 0]);
  }
  return points;
};

const BoxFrame = ({ xlim, ylim, zlim, isDark }) => {
  const minX = xlim?.[0] ?? -6;
  const maxX = xlim?.[1] ?? 6;
  const minY = ylim?.[0] ?? -6;
  const maxY = ylim?.[1] ?? 6;
  const minZ = zlim?.[0] ?? -6;
  const maxZ = zlim?.[1] ?? 6;
  const color = isDark ? "#334a74" : "#9fb7df";
  const axisColor = isDark ? "#1a2740" : "#d4e2f5";
  const sizeX = Math.max(maxX - minX, 4);
  const sizeY = Math.max(maxY - minY, 4);
  const sizeZ = Math.max(maxZ - minZ, 4);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const edges = [
    [[minX, minZ, minY], [maxX, minZ, minY]],
    [[minX, minZ, maxY], [maxX, minZ, maxY]],
    [[minX, minZ, minY], [minX, minZ, maxY]],
    [[maxX, minZ, minY], [maxX, minZ, maxY]],
    [[minX, maxZ, minY], [maxX, maxZ, minY]],
    [[minX, maxZ, maxY], [maxX, maxZ, maxY]],
    [[minX, maxZ, minY], [minX, maxZ, maxY]],
    [[maxX, maxZ, minY], [maxX, maxZ, maxY]],
    [[minX, minZ, minY], [minX, maxZ, minY]],
    [[maxX, minZ, minY], [maxX, maxZ, minY]],
    [[minX, minZ, maxY], [minX, maxZ, maxY]],
    [[maxX, minZ, maxY], [maxX, maxZ, maxY]],
  ];

  return (
    <group>
      <Grid
        args={[sizeX, sizeY]}
        cellSize={Math.max(Math.max(sizeX, sizeY) / 20, 0.5)}
        cellThickness={0.6}
        cellColor={axisColor}
        sectionSize={Math.max(Math.max(sizeX, sizeY) / 4, 2)}
        sectionThickness={1.2}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        position={[centerX, minZ, centerY]}
      />
      <Grid
        args={[sizeX, sizeZ]}
        cellSize={Math.max(Math.max(sizeX, sizeZ) / 20, 0.5)}
        cellThickness={0.45}
        cellColor={axisColor}
        sectionSize={Math.max(Math.max(sizeX, sizeZ) / 4, 2)}
        sectionThickness={1}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        rotation={[Math.PI / 2, 0, 0]}
        position={[centerX, centerZ, minY]}
      />
      <Grid
        args={[sizeZ, sizeY]}
        cellSize={Math.max(Math.max(sizeZ, sizeY) / 20, 0.5)}
        cellThickness={0.45}
        cellColor={axisColor}
        sectionSize={Math.max(Math.max(sizeZ, sizeY) / 4, 2)}
        sectionThickness={1}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        position={[minX, centerZ, centerY]}
      />
      {edges.map((points, index) => (
        <Line key={index} points={points} color={color} lineWidth={1} transparent opacity={0.95} />
      ))}
    </group>
  );
};

const OpenMatCameraController = ({ view, bounds, autoRotate = false }) => {
  const { camera } = useThree();

  useEffect(() => {
    const xlim = bounds.xlim || [-6, 6];
    const ylim = bounds.ylim || [-6, 6];
    const zlim = bounds.zlim || [-6, 6];
    const center = new THREE.Vector3(
      (xlim[0] + xlim[1]) / 2,
      (zlim[0] + zlim[1]) / 2,
      (ylim[0] + ylim[1]) / 2,
    );
    const span = Math.max(xlim[1] - xlim[0], ylim[1] - ylim[0], zlim[1] - zlim[0], 6);
    let position;
    if (Array.isArray(view) && view.length >= 2) {
      const az = THREE.MathUtils.degToRad(Number(view[0]) || 45);
      const el = THREE.MathUtils.degToRad(Number(view[1]) || 30);
      const radius = span * 1.45;
      position = new THREE.Vector3(
        center.x + radius * Math.cos(el) * Math.cos(az),
        center.y + radius * Math.sin(el),
        center.z + radius * Math.cos(el) * Math.sin(az),
      );
    } else {
      switch (String(view ?? "3")) {
        case "2":
          position = new THREE.Vector3(center.x, center.y + span * 1.6, center.z);
          break;
        case "front":
          position = new THREE.Vector3(center.x, center.y + span * 0.35, center.z + span * 1.45);
          break;
        case "side":
          position = new THREE.Vector3(center.x + span * 1.45, center.y + span * 0.35, center.z);
          break;
        default:
          position = new THREE.Vector3(center.x + span * 1.15, center.y + span * 0.85, center.z + span * 1.15);
      }
    }
    camera.position.copy(position);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [bounds.xlim, bounds.ylim, bounds.zlim, camera, view, autoRotate]);

  return null;
};

const OpenMatFunction3D = ({ fn, settings }) => {
  const linePoints = useMemo(() => {
    if (fn.plotType === "line3") {
      return buildLinePoints(fn.xs || [], fn.ys || [], fn.zs || []);
    }
    return [];
  }, [fn.plotType, fn.xs, fn.ys, fn.zs]);

  const geometry = useMemo(() => {
    if (fn.plotType === "scatter3") {
      const geo = buildPointsGeometry(fn.xs || [], fn.ys || [], fn.zs || []);
      if (Array.isArray(fn.colorValues) && fn.colorValues.length) {
        const colorValues = fn.colorValues.slice(0, Math.min(fn.xs?.length || 0, fn.ys?.length || 0, fn.zs?.length || 0)).map(Number);
        geo.setAttribute("color", new THREE.BufferAttribute(valuesToColorAttribute(colorValues, fn.colorRange, fn.colorMap), 3));
      }
      return geo;
    }
    if (fn.surfaceData?.Z) {
      const { X, Y, Z } = fn.surfaceData;
      const rows = Z.length;
      const cols = rows ? Z[0].length : 0;
      const geo = new THREE.PlaneGeometry(1, 1, Math.max(cols - 1, 1), Math.max(rows - 1, 1));
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          pos.setX(index, X?.[row]?.[col] ?? col);
          pos.setZ(index, Y?.[row]?.[col] ?? row);
          pos.setY(index, Z?.[row]?.[col] ?? 0);
        }
      }
      const flatZ = Z.flat().map(Number);
      geo.setAttribute("color", new THREE.BufferAttribute(valuesToColorAttribute(flatZ, fn.colorRange, fn.colorMap), 3));
      geo.computeVertexNormals();
      return geo;
    }
    const size = settings.range || 10;
    const segments = settings.resolution || 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getZ(i);
      let z = 0;
      try {
        const expr = fn.latex
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/exp/g, "Math.exp")
          .replace(/sqrt/g, "Math.sqrt")
          .replace(/abs/g, "Math.abs")
          .replace(/log/g, "Math.log")
          .replace(/\^/g, "**")
          .replace(/pi/g, "Math.PI");
        const evalFn = new Function("x", "y", `return ${expr}`);
        z = evalFn(x, y);
        if (Number.isNaN(z) || !Number.isFinite(z)) z = 0;
      } catch {
        z = 0;
      }
      pos.setY(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [fn.latex, fn.surfaceData, fn.plotType, fn.xs, fn.ys, fn.zs, settings.range, settings.resolution]);

  if (!fn.visible) return null;

  if (fn.plotType === "line3") {
    return <Line points={linePoints} color={fn.color} lineWidth={2.25} transparent opacity={fn.opacity ?? 1} />;
  }

  if (fn.plotType === "scatter3") {
    const pointSizeValues = Array.isArray(fn.pointSizes) ? fn.pointSizes.map(Number).filter((value) => Number.isFinite(value)) : [];
    const pointSize = pointSizeValues.length
      ? Math.max(0.05, Math.min(0.45, pointSizeValues.reduce((sum, value) => sum + value, 0) / pointSizeValues.length / 100))
      : (fn.pointSize ?? 0.12);
    return (
      <points geometry={geometry}>
        <pointsMaterial
          color={fn.color}
          size={pointSize}
          transparent
          opacity={fn.opacity ?? 0.95}
          sizeAttenuation
          vertexColors={geometry.getAttribute("color") != null}
        />
      </points>
    );
  }

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={fn.color}
          side={THREE.DoubleSide}
          wireframe={fn.wireframe}
          transparent
          opacity={fn.opacity ?? 0.82}
          vertexColors={geometry.getAttribute("color") != null}
        />
      </mesh>
      {!fn.wireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial color={fn.color} wireframe transparent opacity={0.16} />
        </mesh>
      )}
    </group>
  );
};

const OpenMatScene = ({ functions, settings }) => {
  const xlim = settings.xlim || [-Math.max(settings.range || 10, 4) / 2, Math.max(settings.range || 10, 4) / 2];
  const ylim = settings.ylim || [-Math.max(settings.range || 10, 4) / 2, Math.max(settings.range || 10, 4) / 2];
  const zlim = settings.zlim || [-Math.max(settings.range || 10, 4) / 2, Math.max(settings.range || 10, 4) / 2];
  const centerX = (xlim[0] + xlim[1]) / 2;
  const centerY = (ylim[0] + ylim[1]) / 2;
  const centerZ = (zlim[0] + zlim[1]) / 2;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 14, 8]} intensity={1.2} />
      <directionalLight position={[-8, 6, -4]} intensity={0.35} />
      <OpenMatCameraController
        view={settings.view}
        bounds={{ xlim, ylim, zlim }}
        autoRotate={settings?.autoRotate}
      />
      <OrbitControls makeDefault dampingFactor={0.1} target={[centerX, centerZ, centerY]} autoRotate={settings?.autoRotate} autoRotateSpeed={0.5} />
      {settings.showGrid && <BoxFrame xlim={xlim} ylim={ylim} zlim={zlim} isDark={settings.isDark} />}
      {functions.map((fn) => (
        <OpenMatFunction3D key={fn.id} fn={fn} settings={settings} />
      ))}
      <Text position={[xlim[1] + 0.9, zlim[0], centerY]} fontSize={0.45} color="#ff5d5d">
        {settings.xlabel || "X"}
      </Text>
      <Text position={[centerX, zlim[0], ylim[1] + 0.9]} fontSize={0.45} color="#30d158">
        {settings.ylabel || "Y"}
      </Text>
      <Text position={[xlim[0] - 0.9, zlim[1], ylim[0]]} fontSize={0.45} color="#4d7cff">
        {settings.zlabel || "Z"}
      </Text>
    </>
  );
};

const OpenMatGrapher3D = ({ isOpen, onClose, onSwitchTo2D, onSwitchToJSX, launchConfig, embedded = false }) => {
  const [functions, setFunctions] = useLocalStorage("openmat-grapher-3d-funcs", [
    { id: 1, latex: "sin(x) * cos(y)", color: "#6366f1", visible: true, wireframe: false, opacity: 0.82 },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useLocalStorage("openmat-grapher-3d-settings", {
    isDark: document.documentElement.classList.contains("dark"),
    showGrid: true,
    range: 12,
    resolution: 64,
    autoRotate: false,
  });
  const lastLaunchSignatureRef = useRef("");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    if (settings.isDark !== isDark) {
      setSettings((s) => ({ ...s, isDark }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !launchConfig) return;
    const launchSignature = JSON.stringify({
      functions: launchConfig.functions || [],
      settings: launchConfig.settings || {},
      replace: launchConfig.replace !== false,
      title: launchConfig.title || "",
    });
    if (lastLaunchSignatureRef.current === launchSignature) return;
    lastLaunchSignatureRef.current = launchSignature;
    if (Array.isArray(launchConfig.functions) && launchConfig.functions.length) {
      const nextFunctions = launchConfig.functions.map((fn, index) => ({
        id: fn.id ?? Date.now() + index,
        latex: fn.latex || fn.expr || fn.label || "surface",
        color: fn.color || "#6366f1",
        visible: fn.visible !== false,
        wireframe: !!fn.wireframe,
        opacity: fn.opacity ?? 0.82,
        surfaceData: fn.surfaceData ?? null,
        plotType: fn.plotType ?? null,
        xs: fn.xs ?? [],
        ys: fn.ys ?? [],
        zs: fn.zs ?? [],
        pointSize: fn.pointSize ?? 0.12,
        pointSizes: fn.pointSizes ?? [],
        colorValues: fn.colorValues ?? [],
        colorMap: fn.colorMap ?? launchConfig.settings?.colormap ?? "parula",
        colorRange: fn.colorRange ?? null,
        filled: !!fn.filled,
      }));
      setFunctions((current) => (launchConfig.replace === false ? [...current, ...nextFunctions] : nextFunctions));
    }
    if (launchConfig.settings) {
      setSettings((current) => ({ ...current, ...launchConfig.settings }));
    }
  }, [isOpen, launchConfig, setFunctions, setSettings]);

  if (!isOpen) return null;

  const addFunction = () => {
    const colors = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#a855f7"];
    const nextColor = colors[functions.length % colors.length];
    setFunctions([
      ...functions,
      { id: Date.now(), latex: "x*y/5", color: nextColor, visible: true, wireframe: false, opacity: 0.82 },
    ]);
  };

  const updateFunction = (id, updates) => {
    setFunctions(functions.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFunction = (id) => {
    if (functions.length > 1) {
      setFunctions(functions.filter((f) => f.id !== id));
    } else {
      setFunctions([{ id: Date.now(), latex: "surface", color: "#6366f1", visible: true, wireframe: false, opacity: 0.82 }]);
    }
  };

  const updateSetting = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const colorbarInfo = useMemo(() => {
    if (!settings.colorbar) return null;
    const coloredFunction = functions.find((fn) =>
      Array.isArray(fn.colorValues) && fn.colorValues.length && Array.isArray(fn.colorRange) && fn.colorRange.length >= 2,
    ) || functions.find((fn) => Array.isArray(fn.colorRange) && fn.colorRange.length >= 2);
    if (!coloredFunction) return null;
    return {
      map: coloredFunction.colorMap || settings.colormap || "parula",
      range: normalizeRange(coloredFunction.colorRange, coloredFunction.colorValues || []),
    };
  }, [functions, settings.colorbar, settings.colormap]);

  return (
    <div className={embedded ? "h-full w-full overflow-hidden" : "fixed inset-0 z-[70] overflow-hidden bg-slate-900/80 backdrop-blur-xl sm:flex sm:items-center sm:justify-center sm:p-4"}>
      <div className={embedded ? "flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex-row" : "flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-2xl dark:bg-slate-900 sm:h-[92vh] sm:max-w-7xl sm:rounded-3xl sm:border sm:border-slate-200 dark:sm:border-slate-800 md:flex-row"}>
        {sidebarOpen && (
          <div className="flex w-full flex-col border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30 md:w-[19rem] lg:w-[20.5rem]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/50 p-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="flex items-center gap-2 font-black tracking-tight text-slate-800 dark:text-slate-100">
                <Box className="h-5 w-5 text-indigo-500" />
                {launchConfig?.title || "OpenMAT 3D"}
              </h3>
              <div className="flex items-center gap-1">
                {typeof onSwitchTo2D === "function" && (
                  <button
                    onClick={onSwitchTo2D}
                    title="Switch to 2D Plotter"
                    className="rounded-lg border border-transparent p-1.5 text-indigo-600 transition-all hover:border-indigo-100 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/40"
                  >
                    <Activity className="h-5 w-5 transition-transform hover:scale-110" />
                  </button>
                )}
                {typeof onSwitchToJSX === "function" && (
                  <button
                    onClick={onSwitchToJSX}
                    title="Switch to JSXGraph Pro"
                    className="rounded-lg border border-transparent p-1.5 text-emerald-600 transition-all hover:border-emerald-100 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/40"
                  >
                    <Settings2 className="h-5 w-5 transition-transform hover:scale-110" />
                  </button>
                )}
                <button
                  onClick={addFunction}
                  className="rounded-xl bg-indigo-500 p-1.5 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 hover:bg-indigo-600"
                >
                  <Plus className="h-5 w-5" />
                </button>
                {!embedded && onClose && (
                  <button
                    onClick={onClose}
                    title="Close"
                    className="ml-1 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/40 dark:hover:text-red-400 md:hidden"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
              {functions.map((func) => (
                <div key={func.id} className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateFunction(func.id, { visible: !func.visible })}
                      className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all ${func.visible ? "" : "border-slate-300 bg-slate-200 opacity-50 dark:border-slate-700 dark:bg-slate-800"}`}
                      style={{ backgroundColor: func.visible ? func.color : undefined, borderColor: func.color }}
                    />
                    <input
                      value={func.latex}
                      onChange={(e) => updateFunction(func.id, { latex: e.target.value })}
                      className="flex-1 border-none bg-transparent font-mono text-sm text-slate-700 focus:ring-0 dark:text-slate-200"
                      placeholder="z = f(x, y)"
                    />
                    <button onClick={() => removeFunction(func.id)} className="text-slate-300 transition-colors hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFunction(func.id, { wireframe: !func.wireframe })}
                      className={`rounded-md border px-2 py-1 text-[10px] font-bold transition-all ${func.wireframe ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 text-slate-500 dark:border-slate-800"}`}
                    >
                      WIREFRAME
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={func.opacity}
                      onChange={(e) => updateFunction(func.id, { opacity: parseFloat(e.target.value) })}
                      className="h-1 w-16 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-500 dark:bg-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-slate-200 p-5 dark:border-slate-800">
              <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <Settings2 className="h-3 w-3" /> Render Settings
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Plot Range (size)</span>
                  <input
                    type="number"
                    value={settings.range}
                    onChange={(e) => updateSetting("range", parseInt(e.target.value, 10) || 10)}
                    className="w-12 rounded bg-slate-100 px-1.5 py-0.5 text-center text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Resolution</span>
                  <select
                    value={settings.resolution}
                    onChange={(e) => updateSetting("resolution", parseInt(e.target.value, 10))}
                    className="rounded bg-slate-100 px-1 text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="32">Low (Speed)</option>
                    <option value="64">Medium</option>
                    <option value="128">High (Detail)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoRotate}
                    onChange={(e) => updateSetting("autoRotate", e.target.checked)}
                    className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 dark:border-slate-700"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Auto-Rotate Camera</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-slate-100 px-2 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    View: <span className="font-semibold text-slate-800 dark:text-slate-100">{Array.isArray(settings.view) ? `${settings.view[0]}°, ${settings.view[1]}°` : (settings.view || "3")}</span>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-2 py-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Map: <span className="font-semibold text-slate-800 dark:text-slate-100">{settings.colormap || "parula"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-indigo-50/30 p-6 dark:border-slate-800 dark:bg-indigo-950/10">
                <div className="flex items-start gap-3">
                <Info className="mt-1 h-4 w-4 text-indigo-500" />
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">OpenMAT 3D Syntax</p>
                  <p>OpenMAT renders into a boxed lab viewport instead of the general-purpose grapher scene.</p>
                  <p>Try: <code className="italic">surf(X,Y,Z)</code>, <code className="italic">scatter3(x,y,z,s,c,'filled')</code>, <code className="italic">colorbar</code>, <code className="italic">colormap('parula')</code>, or <code className="italic">view(3)</code>.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex-1 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={() => setSidebarOpen((current) => !current)}
            className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-2xl border bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xl backdrop-blur-md transition-all hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Layers className="h-4 w-4" />
            {sidebarOpen ? "Hide Controls" : "Show Controls"}
          </button>
          {!embedded && (
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-20 rounded-2xl border border-slate-200 bg-white/80 p-2 text-slate-500 shadow-xl backdrop-blur-md transition-all hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          <Canvas camera={{ position: [12, 10, 12], fov: 42 }}>
            <color attach="background" args={[settings.isDark ? "#020617" : "#f8fafc"]} />
            <OpenMatScene functions={functions} settings={settings} />
            {/* autoRotate handled by the OrbitControls inside OpenMatScene */}
          </Canvas>

          <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="pointer-events-auto flex gap-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" /> <span className="text-[10px] font-bold uppercase text-slate-400">X-Axis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" /> <span className="text-[10px] font-bold uppercase text-slate-400">Y-Axis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" /> <span className="text-[10px] font-bold uppercase text-slate-400">Z-Height</span>
                </div>
              </div>
            </div>
            {colorbarInfo && (
              <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
                <div
                  className="h-24 w-4 rounded-full"
                  style={{
                    background: `linear-gradient(to top, ${(COLOR_MAPS[colorbarInfo.map] || COLOR_MAPS.parula).join(", ")})`,
                  }}
                />
                <div className="flex h-24 flex-col justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                  <span>{Number(colorbarInfo.range[1]).toFixed(2)}</span>
                  <span className="uppercase tracking-[0.2em] text-slate-400">{colorbarInfo.map}</span>
                  <span>{Number(colorbarInfo.range[0]).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenMatGrapher3D;
