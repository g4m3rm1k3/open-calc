import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { X, Box, Layers, Settings2, Trash2, Plus, Info, Activity } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";

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

const BoxFrame = ({ range, isDark }) => {
  const half = Math.max(range / 2, 2);
  const top = half;
  const color = isDark ? "#334a74" : "#9fb7df";
  const axisColor = isDark ? "#1a2740" : "#d4e2f5";

  const edges = [
    [[-half, -half, -half], [half, -half, -half]],
    [[-half, -half, half], [half, -half, half]],
    [[-half, -half, -half], [-half, -half, half]],
    [[half, -half, -half], [half, -half, half]],
    [[-half, top, -half], [half, top, -half]],
    [[-half, top, half], [half, top, half]],
    [[-half, top, -half], [-half, top, half]],
    [[half, top, -half], [half, top, half]],
    [[-half, -half, -half], [-half, top, -half]],
    [[half, -half, -half], [half, top, -half]],
    [[-half, -half, half], [-half, top, half]],
    [[half, -half, half], [half, top, half]],
  ];

  return (
    <group>
      <Grid
        args={[range, range]}
        cellSize={Math.max(range / 20, 0.5)}
        cellThickness={0.6}
        cellColor={axisColor}
        sectionSize={Math.max(range / 4, 2)}
        sectionThickness={1.2}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        position={[0, -half, 0]}
      />
      <Grid
        args={[range, range]}
        cellSize={Math.max(range / 20, 0.5)}
        cellThickness={0.45}
        cellColor={axisColor}
        sectionSize={Math.max(range / 4, 2)}
        sectionThickness={1}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -half]}
      />
      <Grid
        args={[range, range]}
        cellSize={Math.max(range / 20, 0.5)}
        cellThickness={0.45}
        cellColor={axisColor}
        sectionSize={Math.max(range / 4, 2)}
        sectionThickness={1}
        sectionColor={color}
        fadeDistance={0}
        infiniteGrid={false}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        position={[-half, 0, 0]}
      />
      {edges.map((points, index) => (
        <Line key={index} points={points} color={color} lineWidth={1} transparent opacity={0.95} />
      ))}
    </group>
  );
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
      return buildPointsGeometry(fn.xs || [], fn.ys || [], fn.zs || []);
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
    return (
      <points geometry={geometry}>
        <pointsMaterial
          color={fn.color}
          size={fn.pointSize ?? 0.12}
          transparent
          opacity={fn.opacity ?? 0.95}
          sizeAttenuation
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
  const range = Math.max(settings.range || 10, 4);
  const half = range / 2;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 14, 8]} intensity={1.2} />
      <directionalLight position={[-8, 6, -4]} intensity={0.35} />
      <OrbitControls makeDefault dampingFactor={0.1} target={[0, 0, 0]} />
      {settings.showGrid && <BoxFrame range={range} isDark={settings.isDark} />}
      {functions.map((fn) => (
        <OpenMatFunction3D key={fn.id} fn={fn} settings={settings} />
      ))}
      <Text position={[half + 0.9, -half, 0]} fontSize={0.45} color="#ff5d5d">
        X
      </Text>
      <Text position={[0, -half, half + 0.9]} fontSize={0.45} color="#30d158">
        Y
      </Text>
      <Text position={[-half - 0.9, half, -half]} fontSize={0.45} color="#4d7cff">
        Z
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
      }));
      setFunctions(launchConfig.replace === false ? [...functions, ...nextFunctions] : nextFunctions);
    }
    if (launchConfig.settings) {
      setSettings((current) => ({ ...current, ...launchConfig.settings }));
    }
  }, [functions, isOpen, launchConfig, setFunctions, setSettings]);

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
              </div>
            </div>

            <div className="border-t border-slate-200 bg-indigo-50/30 p-6 dark:border-slate-800 dark:bg-indigo-950/10">
              <div className="flex items-start gap-3">
                <Info className="mt-1 h-4 w-4 text-indigo-500" />
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">OpenMAT 3D Syntax</p>
                  <p>OpenMAT renders into a boxed lab viewport instead of the general-purpose grapher scene.</p>
                  <p>Try: <code className="italic">surf(X,Y,Z)</code>, <code className="italic">plot3(x,y,z)</code>, <code className="italic">scatter3(x,y,z)</code>, or animate with <code className="italic">animate(...)</code>.</p>
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
            {settings.autoRotate && <OrbitControls autoRotate autoRotateSpeed={0.5} />}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenMatGrapher3D;
