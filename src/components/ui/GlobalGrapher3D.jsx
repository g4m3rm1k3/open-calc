import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Center, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { X, Box, Layers, Settings2, Trash2, Plus, Info, Activity } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

// --- 3D Grid Helper ---
const Scene = ({ functions, settings }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls makeDefault dampingFactor={0.1} />
      
      {/* Dynamic Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionThickness={1.5}
        sectionColor={settings.isDark ? '#4f46e5' : '#818cf8'}
      />

      <Center top>
        {functions.map((fn, i) => (
          <Function3D key={fn.id} fn={fn} settings={settings} />
        ))}
      </Center>
      
      {/* Origin Axis Labels */}
      <Text position={[5.5, 0, 0]} fontSize={0.5} color="red">X</Text>
      <Text position={[0, 5.5, 0]} fontSize={0.5} color="green">Y</Text>
      <Text position={[0, 0, 5.5]} fontSize={0.5} color="blue">Z</Text>
    </>
  )
}

// --- Dynamic Function Surface ---
const Function3D = ({ fn, settings }) => {
  const meshRef = useRef()
  
  const geometry = useMemo(() => {
    const size = settings.range || 10
    const segments = settings.resolution || 64
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    
    // Rotate to be horizontal
    geo.rotateX(-Math.PI / 2)
    
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getZ(i) 
      
      let z = 0
      try {
        const expr = fn.latex
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/exp/g, 'Math.exp')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/abs/g, 'Math.abs')
          .replace(/log/g, 'Math.log' )
          .replace(/\^/g, '**')
          .replace(/pi/g, 'Math.PI')

        const evalFn = new Function('x', 'y', `return ${expr}`)
        z = evalFn(x, y)
        
        if (isNaN(z) || !isFinite(z)) z = 0
      } catch (e) {
        z = 0
      }
      
      pos.setY(i, z) 
    }
    
    geo.computeVertexNormals()
    return geo
  }, [fn.latex, settings.range, settings.resolution])

  if (!fn.visible) return null

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={fn.color} 
        side={THREE.DoubleSide} 
        wireframe={fn.wireframe}
        transparent
        opacity={fn.opacity ?? 0.8}
      />
    </mesh>
  )
}

const GlobalGrapher3D = ({ isOpen, onClose, onSwitchTo2D, onSwitchToJSX }) => {
  const [functions, setFunctions] = useLocalStorage('global-grapher-3d-funcs', [
    { id: 1, latex: 'sin(x) * cos(y)', color: '#6366f1', visible: true, wireframe: false, opacity: 0.8 }
  ])
  
  const [settings, setSettings] = useLocalStorage('global-grapher-3d-settings', {
    isDark: document.documentElement.classList.contains('dark'),
    showGrid: true,
    range: 10,
    resolution: 64,
    autoRotate: false
  })

  // Sync dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    if (settings.isDark !== isDark) {
      setSettings(s => ({ ...s, isDark }))
    }
  }, [isOpen])

  if (!isOpen) return null

  const addFunction = () => {
    const colors = ['#6366f1', '#ec4899', '#facc15', '#22c55e', '#ef4444', '#a855f7']
    const nextColor = colors[functions.length % colors.length]
    setFunctions([...functions, { id: Date.now(), latex: 'x*y/5', color: nextColor, visible: true, wireframe: false, opacity: 0.8 }])
  }

  const updateFunction = (id, updates) => {
    setFunctions(functions.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeFunction = (id) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id))
    } else {
      setFunctions([{ id: Date.now(), latex: '0', color: '#6366f1', visible: true, wireframe: false, opacity: 0.8 }])
    }
  }

  const updateSetting = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-xl overflow-hidden sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl w-full sm:max-w-7xl flex flex-col md:flex-row h-full sm:h-[92vh] overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-950/30 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
              <Box className="w-5 h-5 text-indigo-500" />
              3D Plotter
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={onSwitchTo2D}
                title="Switch to 2D Plotter (G)"
                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <Activity className="w-5 h-5 transition-transform hover:scale-110" />
              </button>
              <button 
                onClick={onSwitchToJSX}
                title="Switch to JSXGraph Pro (X)"
                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
              >
                <Settings2 className="w-5 h-5 transition-transform hover:scale-110" />
              </button>
              <button 
                onClick={addFunction}
                className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={onClose} title="Close"
                className="md:hidden p-1.5 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {functions.map((func) => (
              <div key={func.id} className="group flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateFunction(func.id, { visible: !func.visible })}
                    className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0 ${func.visible ? '' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50'}`}
                    style={{ backgroundColor: func.visible ? func.color : undefined, borderColor: func.color }}
                  />
                  <input 
                    value={func.latex}
                    onChange={(e) => updateFunction(func.id, { latex: e.target.value })}
                    className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-700 dark:text-slate-200"
                    placeholder="z = f(x, y)"
                  />
                  <button onClick={() => removeFunction(func.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                   <button 
                    onClick={() => updateFunction(func.id, { wireframe: !func.wireframe })}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${func.wireframe ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                   >
                     WIREFRAME
                   </button>
                   <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={func.opacity} 
                    onChange={e => updateFunction(func.id, { opacity: parseFloat(e.target.value) })}
                    className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                   />
                </div>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Render Settings
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Plot Range (size)</span>
                <input 
                  type="number" value={settings.range} 
                  onChange={e => updateSetting('range', parseInt(e.target.value) || 10)}
                  className="w-12 bg-slate-100 dark:bg-slate-800 border-none rounded px-1.5 py-0.5 text-center text-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Resolution</span>
                <select 
                  value={settings.resolution}
                  onChange={e => updateSetting('resolution', parseInt(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded px-1 text-[10px] text-slate-700 dark:text-slate-100"
                >
                  <option value="32">Low (Speed)</option>
                  <option value="64">Medium</option>
                  <option value="128">High (Detail)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" checked={settings.autoRotate} 
                  onChange={e => updateSetting('autoRotate', e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Auto-Rotate Camera</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50/30 dark:bg-indigo-950/10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 mt-1" />
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">3D Syntax</p>
                <p>Functions take <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">x</code> and <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">y</code> as inputs.</p>
                <p>Try: <code className="italic">Math.sqrt(x*x + y*y)</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-950">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-xl"
          >
            <X className="w-6 h-6" />
          </button>

          <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
            <color attach="background" args={[settings.isDark ? '#020617' : '#f8fafc']} />
            <Scene functions={functions} settings={settings} />
            {settings.autoRotate && <OrbitControls autoRotate autoRotateSpeed={0.5} />}
          </Canvas>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
               <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase">X-Axis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase">Y-Axis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase">Z-Height</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalGrapher3D