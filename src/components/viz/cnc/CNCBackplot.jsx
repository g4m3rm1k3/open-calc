import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function CNCBackplot({
  pathPoints = [],
  currentStep = 0,
  activeChannel = 0,
  isDark = true,
  width = "100%",
  height = "400px",
  toolDiameter = 10,
  toolLength = 75,
  toolLenCut = null,
  toolPosition = null,
  stockShape = "box",
  stockDimensions = { width: 100, height: 80, depth: 40 },
  stockOrigin = { x: 0, y: 0, z: 0 },
  showGrid = true,
  showTool = true,
  showStock = true,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pathLayerRef = useRef(null);
  const stockLayerRef = useRef(null);
  const toolRef = useRef(null);
  const gridRef = useRef(null);
  const rafRef = useRef(null);
  const pathFittedRef = useRef(false);
  const mountedRef = useRef(false);

  // Colors based on theme
  const colors = {
    bg: isDark ? 0x0f172a : 0xf1f5f9,
    grid: isDark ? 0x334155 : 0x94a3b8,
    gridAlt: isDark ? 0x1e293b : 0xcbd5e1,
    rapid: isDark ? 0xfacc15 : 0xd97706, // G00
    feed: isDark ? 0x38bdf8 : 0x2563eb, // G01/02/03
    stockFill: isDark ? 0x3b82f6 : 0x2563eb,
    stockEdge: isDark ? 0x93c5fd : 0x1d4ed8,
    channels: [0x63b8ff, 0x46d89f, 0xf0b44c, 0xb89cff],
  };

  // ── Bootstrap Three.js (once) ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    mountedRef.current = true;

    const w = el.clientWidth || 700;
    const h = height.endsWith("%")
      ? el.clientHeight || 400
      : parseInt(height) || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(colors.bg, 1);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors.bg, 0.0015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);
    camera.up.set(0, 0, 1);
    camera.position.set(300, -300, 400);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(100, 100, 300);
    scene.add(dir);

    const grid = new THREE.GridHelper(500, 50, colors.grid, colors.gridAlt);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    gridRef.current = grid;

    const pathLayer = new THREE.Group();
    scene.add(pathLayer);
    pathLayerRef.current = pathLayer;

    const stockLayer = new THREE.Group();
    scene.add(stockLayer);
    stockLayerRef.current = stockLayer;

    const toolGroup = new THREE.Group();
    scene.add(toolGroup);
    toolRef.current = toolGroup;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      try {
        controls.update();
        renderer.render(scene, camera);
      } catch (err) {
        // Stop the loop if rendering fails to avoid console/error floods.
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        mountedRef.current = false;
        console.error("CNCBackplot render loop stopped", err);
      }
    };
    animate();

    const doResize = () => {
      const nw = el.clientWidth;
      if (!nw) return; // still hidden
      const nh = height.endsWith("%")
        ? el.clientHeight || 400
        : parseInt(height) || 400;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(doResize);
    ro.observe(el);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controls.dispose();
      clearGroup(pathLayerRef.current);
      clearGroup(stockLayerRef.current);
      clearGroup(toolRef.current);
      if (gridRef.current) {
        gridRef.current.geometry?.dispose?.();
        gridRef.current.material?.dispose?.();
      }
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      pathLayerRef.current = null;
      stockLayerRef.current = null;
      toolRef.current = null;
      gridRef.current = null;
      rafRef.current = null;
    };
  }, []);

  const clearGroup = (group) => {
    if (!group) return;
    while (group.children.length) {
      const child = group.children.pop();
      child?.traverse?.((node) => {
        if (node.geometry) node.geometry.dispose?.();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m?.dispose?.());
          } else {
            node.material.dispose?.();
          }
        }
      });
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m?.dispose?.());
        } else {
          child.material.dispose?.();
        }
      }
      group.remove(child);
    }
  };

  // Update background/fog when theme changes
  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const currentGrid = gridRef.current;
    if (renderer) renderer.setClearColor(colors.bg);
    if (scene?.fog) scene.fog.color.setHex(colors.bg);
    if (scene && currentGrid) {
      scene.remove(currentGrid);
      currentGrid.geometry?.dispose?.();
      currentGrid.material?.dispose?.();
      const newGrid = new THREE.GridHelper(
        500,
        50,
        colors.grid,
        colors.gridAlt,
      );
      newGrid.rotation.x = Math.PI / 2;
      newGrid.visible = !!showGrid;
      scene.add(newGrid);
      gridRef.current = newGrid;
    }
  }, [isDark, showGrid]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (gridRef.current) gridRef.current.visible = !!showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (toolRef.current) toolRef.current.visible = !!showTool;
  }, [showTool]);

  // ── Rebuild stock block ──────────────────────────────────────────────────
  useEffect(() => {
    const group = stockLayerRef.current;
    if (!group) return;
    clearGroup(group);
    if (!showStock) return;

    const ox = stockOrigin?.x ?? 0;
    const oy = stockOrigin?.y ?? 0;
    const oz = stockOrigin?.z ?? 0;
    const stockMat = new THREE.MeshPhongMaterial({
      color: colors.stockFill,
      transparent: true,
      opacity: isDark ? 0.22 : 0.18,
      shininess: 40,
    });

    let center = new THREE.Vector3(ox, oy, oz);
    let maxDim = 20;

    if (stockShape === "cylinder") {
      const len = Math.max(stockDimensions?.length ?? 150, 0.1);
      const dia = Math.max(stockDimensions?.diameter ?? 80, 0.1);
      const radius = dia / 2;
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 64, 1, false),
        stockMat,
      );
      // Three.js cylinder is Y-axis by default; rotate so axis aligns with X (lathe Z)
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(ox + len / 2, oy, oz + radius);
      group.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(
          new THREE.CylinderGeometry(radius, radius, len, 32),
        ),
        new THREE.LineBasicMaterial({ color: colors.stockEdge }),
      );
      edges.rotation.copy(mesh.rotation);
      edges.position.copy(mesh.position);
      group.add(edges);

      center = mesh.position.clone();
      maxDim = Math.max(len, dia, 20);
    } else {
      const w = Math.max(stockDimensions?.width ?? 100, 0.1);
      const h = Math.max(stockDimensions?.height ?? 80, 0.1);
      const d = Math.max(stockDimensions?.depth ?? 40, 0.1);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stockMat);
      mesh.position.set(ox + w / 2, oy + h / 2, oz + d / 2);
      group.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
        new THREE.LineBasicMaterial({ color: colors.stockEdge }),
      );
      edges.position.copy(mesh.position);
      group.add(edges);

      center = mesh.position.clone();
      maxDim = Math.max(w, h, d, 20);
    }

    if (!pathPoints.length && cameraRef.current && controlsRef.current) {
      const dist = maxDim * 2.2;
      cameraRef.current.position.set(
        center.x + dist * 0.7,
        center.y - dist,
        center.z + dist * 0.8,
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [
    stockShape,
    stockDimensions,
    stockOrigin,
    showStock,
    isDark,
    pathPoints.length,
  ]);

  // ── Rebuild path ──────────────────────────────────────────────────────────
  useEffect(() => {
    const group = pathLayerRef.current;
    const scene = sceneRef.current;
    if (!group || !scene) return;

    while (group.children.length) group.remove(group.children[0]);

    if (pathPoints.length < 2) {
      pathFittedRef.current = false;
      return;
    }

    // Group segments by motion mode + channel so multichannel traces stay distinct
    const segments = [];
    let currentSegment = {
      points: [
        new THREE.Vector3(
          pathPoints[0].machineX,
          pathPoints[0].machineY,
          pathPoints[0].machineZ,
        ),
      ],
      mode: pathPoints[0].motionMode || "G00",
      channelId: pathPoints[0].channelId ?? 0,
    };

    for (let i = 1; i < pathPoints.length; i++) {
      const pt = pathPoints[i];
      const v = new THREE.Vector3(pt.machineX, pt.machineY, pt.machineZ);
      const mode = pt.motionMode || "G00";
      const channelId = pt.channelId ?? 0;

      if (
        mode !== currentSegment.mode ||
        channelId !== currentSegment.channelId
      ) {
        segments.push(currentSegment);
        currentSegment = {
          points: [currentSegment.points[currentSegment.points.length - 1], v],
          mode,
          channelId,
        };
      } else {
        currentSegment.points.push(v);
      }
    }
    segments.push(currentSegment);

    segments.forEach((seg) => {
      const geo = new THREE.BufferGeometry().setFromPoints(seg.points);
      const channelColor =
        colors.channels[seg.channelId % colors.channels.length] || colors.feed;
      const color = seg.mode === "G00" ? colors.rapid : channelColor;
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      const line = new THREE.Line(geo, mat);
      group.add(line);
    });

    // Markers
    const startPt = pathPoints[0];
    const startGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const startM = new THREE.Mesh(
      startGeo,
      new THREE.MeshBasicMaterial({ color: 0x22c55e }),
    );
    startM.position.set(startPt.machineX, startPt.machineY, startPt.machineZ);
    group.add(startM);

    // Fit camera to path bounds
    const bbox = new THREE.Box3().setFromObject(group);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 20);
    if (cameraRef.current && controlsRef.current) {
      const dist = maxDim * 1.8;
      cameraRef.current.position.set(
        center.x + dist * 0.7,
        center.y - dist,
        center.z + dist * 0.8,
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
      pathFittedRef.current = true;
    }
  }, [pathPoints, isDark]);

  // Rebuild tool when dimensions change
  useEffect(() => {
    if (!toolRef.current) return;
    _buildTool(toolRef.current, toolDiameter / 2, toolLength, toolLenCut);
    // Fit camera to show full tool only when no path has been loaded
    if (!pathFittedRef.current && cameraRef.current && controlsRef.current) {
      const halfLen = toolLength / 2;
      const dist = toolLength * 3;
      cameraRef.current.position.set(dist * 0.7, -dist, halfLen + dist * 0.8);
      controlsRef.current.target.set(0, 0, halfLen);
      controlsRef.current.update();
    }
  }, [toolDiameter, toolLength, toolLenCut]);

  // Move tool
  useEffect(() => {
    if (!toolRef.current || pathPoints.length === 0) return;
    if (
      toolPosition &&
      Number.isFinite(toolPosition.machineX) &&
      Number.isFinite(toolPosition.machineY) &&
      Number.isFinite(toolPosition.machineZ)
    ) {
      toolRef.current.position.set(
        toolPosition.machineX,
        toolPosition.machineY,
        toolPosition.machineZ,
      );
      return;
    }
    const targetIndex = Math.min(currentStep, pathPoints.length - 1);
    let pt = pathPoints[targetIndex];
    const channelAtStep = pathPoints
      .slice(0, targetIndex + 1)
      .reverse()
      .find((p) => p.channelId === activeChannel);
    const fallback = [...pathPoints]
      .reverse()
      .find((p) => p.channelId === activeChannel);
    if (channelAtStep) {
      pt = channelAtStep;
    } else if ((pt?.channelId ?? activeChannel) !== activeChannel && fallback) {
      pt = fallback;
    }
    if (pt) toolRef.current.position.set(pt.machineX, pt.machineY, pt.machineZ);
  }, [currentStep, pathPoints, activeChannel, toolPosition]);

  return (
    <div
      className="relative border border-slate-700/30 rounded-xl overflow-hidden bg-slate-900 shadow-inner"
      style={{
        width,
        height,
        minHeight:
          typeof height === "number" ? height : parseInt(height) || 400,
      }}
    >
      <div ref={mountRef} className="w-full h-full" />
      {pathPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-sm">
            Ready for Program Input
          </span>
        </div>
      )}
    </div>
  );
}

function _buildTool(group, radius, length, lenCut) {
  while (group.children.length) group.remove(group.children[0]);

  const r = Math.max(radius, 1.5);
  const len = Math.max(length, 20);
  // Flute (cutting) length — use lenCut if provided, else 30% of total length
  const fl = Math.max(lenCut != null ? lenCut : len * 0.3, r * 2);
  const nk = Math.min(fl * 0.12, r * 0.5); // neck taper height
  const sr = r * 0.88; // shank radius (slightly narrower than flutes)

  // ── Materials ─────────────────────────────────────────────────────────────
  const matFlute = new THREE.MeshPhongMaterial({
    color: 0xc8940c, // carbide gold
    emissive: 0x4a2200,
    shininess: 220,
    specular: 0xffd080,
    side: THREE.DoubleSide,
  });
  const matShank = new THREE.MeshPhongMaterial({
    color: 0x7a8fa6, // steel gray
    emissive: 0x0d1520,
    shininess: 80,
    side: THREE.DoubleSide,
  });

  // ── Flute body — LatheGeometry revolved around Z ───────────────────────────
  // Profile: (radius, height-from-tip). LatheGeometry revolves around Y;
  // we rotate +π/2 on X so Y→Z (tip at z=0, shank goes +Z).
  const fluteProfile = [
    new THREE.Vector2(r, 0), // tip edge
    new THREE.Vector2(r, fl), // top of flute zone
  ];
  const fluteMesh = new THREE.Mesh(
    new THREE.LatheGeometry(fluteProfile, 32),
    matFlute,
  );
  fluteMesh.rotation.x = Math.PI / 2;
  group.add(fluteMesh);

  // ── Neck taper + Shank — LatheGeometry ────────────────────────────────────
  const shankProfile = [
    new THREE.Vector2(r, fl), // join flute top
    new THREE.Vector2(sr, fl + nk), // neck taper
    new THREE.Vector2(sr, len), // shank top
  ];
  const shankMesh = new THREE.Mesh(
    new THREE.LatheGeometry(shankProfile, 24),
    matShank,
  );
  shankMesh.rotation.x = Math.PI / 2;
  group.add(shankMesh);

  // ── Tip face — red flat disc at z = 0 (the cutting face) ──────────────────
  const tipMesh = new THREE.Mesh(
    new THREE.CircleGeometry(r, 32),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }),
  );
  group.add(tipMesh);

  // ── Crosshair lines at tip — always-visible position indicator ─────────────
  const cx = r * 5;
  const mkLine = (ax, ay, az, bx, by, bz, color) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
  };
  group.add(mkLine(-cx, 0, 0, cx, 0, 0, 0xef4444)); // X — red
  group.add(mkLine(0, -cx, 0, 0, cx, 0, 0x22c55e)); // Y — green
  group.add(mkLine(0, 0, -cx * 0.4, 0, 0, cx * 0.4, 0x38bdf8)); // Z — blue
}
