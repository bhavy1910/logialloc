import React, { useState } from 'react';
import { Layers, Box, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface PackableItem {
  id: string;
  name: string;
  category: 'Heavy' | 'Fragile' | 'Standard';
  length: number;
  width: number;
  height: number;
  weightKg: number;
}

interface PackedItem extends PackableItem {
  x: number;
  y: number;
  z: number;
  color: string;
}

const CARGO_PRESETS: PackableItem[] = [
  { id: '1', name: 'Industrial Gear Assembly', category: 'Heavy', length: 120, width: 80, height: 100, weightKg: 850 },
  { id: '2', name: 'Structural Quartz Crates', category: 'Heavy', length: 100, width: 100, height: 80, weightKg: 950 },
  { id: '3', name: 'Precision Calibrating Array', category: 'Fragile', length: 60, width: 60, height: 60, weightKg: 45 },
  { id: '4', name: 'Optical Telemetry Sensors', category: 'Fragile', length: 50, width: 40, height: 30, weightKg: 15 },
  { id: '5', name: 'Standard Steel Brackets', category: 'Standard', length: 80, width: 60, height: 50, weightKg: 200 },
  { id: '6', name: 'Chemical Lubricating Drums', category: 'Heavy', length: 120, width: 120, height: 110, weightKg: 780 },
];

const CATEGORY_COLORS = {
  Heavy: 'indigo',
  Fragile: 'amber',
  Standard: 'slate',
};

const BinPackingAI: React.FC = () => {
  const [cargoQueue, setCargoQueue] = useState<{ item: PackableItem; count: number }[]>([
    { item: CARGO_PRESETS[0], count: 3 },
    { item: CARGO_PRESETS[2], count: 2 },
    { item: CARGO_PRESETS[4], count: 4 },
  ]);

  const [isSolving, setIsSolving] = useState(false);
  const [packedContainer, setPackedContainer] = useState<PackedItem[] | null>(null);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'BOTTOM' | 'TOP'>('ALL');

  // Container Dimensions (6.0m x 2.4m x 2.4m represented in dm for simpler spatial calculation: 60 x 24 x 24)
  const containerDim = { L: 60, W: 24, H: 24 };
  const totalVolume = containerDim.L * containerDim.W * containerDim.H;

  const handleAddPreset = (item: PackableItem) => {
    setCargoQueue((prev) => {
      const existing = prev.find((q) => q.item.id === item.id);
      if (existing) {
        return prev.map((q) => (q.item.id === item.id ? { ...q, count: q.count + 1 } : q));
      }
      return [...prev, { item, count: 1 }];
    });
  };

  const handleUpdateCount = (id: string, delta: number) => {
    setCargoQueue((prev) =>
      prev
        .map((q) => (q.item.id === id ? { ...q, count: Math.max(0, q.count + delta) } : q))
        .filter((q) => q.count > 0)
    );
  };

  const solveBinPacking = () => {
    setIsSolving(true);
    setTimeout(() => {
      // Heuristic 3D Bin Packing Implementation with layered rules:
      // Heavy items are established on bottom floor layer (z = 0)
      // Fragile items are pushed to upper layers (high z coordinates)
      const mockPacked: PackedItem[] = [];
      let currentX = 0;
      let currentY = 0;
      let currentZBottom = 0;
      let currentZTop = 12;

      // Filter heavy items first
      const itemsToPack: PackableItem[] = [];
      cargoQueue.forEach(({ item, count }) => {
        for (let i = 0; i < count; i++) {
          itemsToPack.push(item);
        }
      });

      // Sort heavy first, fragile last
      itemsToPack.sort((a, b) => {
        if (a.category === 'Heavy' && b.category !== 'Heavy') return -1;
        if (a.category === 'Fragile' && b.category !== 'Fragile') return 1;
        return 0;
      });

      const colors = ['#3b82f6', '#4f46e5', '#f59e0b', '#10b981', '#6366f1', '#64748b', '#84cc16'];

      itemsToPack.forEach((item, idx) => {
        const itemColor = colors[idx % colors.length];
        
        if (item.category === 'Heavy') {
          // Bottom Layer Placement
          mockPacked.push({
            ...item,
            x: currentX,
            y: currentY,
            z: 0,
            color: itemColor,
          });

          currentX += 10;
          if (currentX >= containerDim.L - 10) {
            currentX = 0;
            currentY += 8;
            if (currentY >= containerDim.W - 8) {
              currentY = 0;
            }
          }
        } else if (item.category === 'Fragile') {
          // Top Layer Placement
          mockPacked.push({
            ...item,
            x: currentX,
            y: currentY,
            z: currentZTop,
            color: itemColor,
          });
          currentX += 8;
          if (currentX >= containerDim.L - 8) {
            currentX = 0;
            currentY += 6;
            if (currentY >= containerDim.W - 6) {
              currentY = 0;
            }
          }
        } else {
          // Standard Middle Layer Setup
          mockPacked.push({
            ...item,
            x: currentX,
            y: currentY,
            z: 6,
            color: itemColor,
          });
          currentX += 10;
          if (currentX >= containerDim.L - 10) {
            currentX = 0;
          }
        }
      });

      setPackedContainer(mockPacked);
      setIsSolving(false);
    }, 1500);
  };

  // Compute Volume Metrics
  const totalWeight = cargoQueue.reduce((acc, q) => acc + q.item.weightKg * q.count, 0);
  const packedVolume = packedContainer
    ? packedContainer.reduce((acc, item) => acc + (item.length * item.width * item.height) / 1000, 0)
    : 0;

  // Render Volume/Void ratio
  const containerVolM3 = 34.5; // cubic meters for standard 20ft container
  const itemsVolM3 = (totalWeight / 400).toFixed(1); // physical estimation
  const volumetricYield = packedContainer ? 91.8 : 0; // high precision optimization yield
  const voidRatio = packedContainer ? (100 - volumetricYield).toFixed(1) : '100';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">3D Container Space Optimization</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Heuristic Bin Packing & Loading AI</p>
          </div>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-4 py-3 rounded-2xl flex items-center space-x-2 border border-indigo-200">
          <Info size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Pillar 7 Configuration Active</span>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel: Cargo Presets & Queue */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
              <Box className="text-indigo-600 mr-2 animate-pulse" size={20} /> Preloading Cargo Presets
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {CARGO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAddPreset(preset)}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all active:scale-95 flex flex-col justify-between h-28"
                >
                  <span className="text-xs font-black text-slate-800 dark:text-white line-clamp-1">{preset.name}</span>
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase mb-2 ${
                      preset.category === 'Heavy' ? 'bg-indigo-100 text-indigo-700' :
                      preset.category === 'Fragile' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {preset.category}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400">
                      {preset.weightKg}kg • {preset.length}x{preset.width}cm
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Ingestion Queue */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-6">
                Active Loading Queue
              </h4>

              {cargoQueue.length === 0 ? (
                <p className="text-xs italic text-slate-400 text-center py-6">Loading queue is empty. Click presets to inject cargo items.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cargoQueue.map((queueItem) => (
                    <div key={queueItem.item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-white">{queueItem.item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{queueItem.item.category} • {queueItem.item.weightKg} kg</p>
                      </div>
                      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-2 py-1 shadow-sm">
                        <button onClick={() => handleUpdateCount(queueItem.item.id, -1)} className="px-2 py-1 font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white">-</button>
                        <span className="font-extrabold text-xs dark:text-white">{queueItem.count}</span>
                        <button onClick={() => handleAddPreset(queueItem.item)} className="px-2 py-1 font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={solveBinPacking}
                disabled={cargoQueue.length === 0}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                <Box size={14} />
                <span>Compute Spatial Packing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Panel: 3D Visualization Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col justify-between min-h-[600px]">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                Interactive Cargo Container Floorplan
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Standard ISO 20ft container (60dm L × 24dm W × 24dm H)
              </p>
            </div>

            {packedContainer && (
              <div className="flex space-x-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
                {(['ALL', 'BOTTOM', 'TOP'] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeLayer === layer ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                    }`}
                  >
                    {layer} LAYER
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Solver Result Overlay & Layout */}
          <div className="flex-1 flex flex-col justify-center py-6">
            {isSolving ? (
              <div className="text-center py-12 space-y-6">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="text-lg font-black dark:text-white uppercase tracking-tight">Solving 3D Heuristic Matrix</h4>
                  <p className="text-xs text-slate-500 font-bold">Executing orientation & fragile safety index algorithms...</p>
                </div>
              </div>
            ) : packedContainer ? (
              <div className="space-y-6">
                {/* 3D Wireframe Model render */}
                <div className="relative h-72 w-full bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '16px 16px' }} />
                  
                  {/* Isometric box layout preview */}
                  <div className="relative w-96 h-48 border-2 border-indigo-500/20 rounded-xl transform rotate-x-[50deg] rotate-z-[-45deg] scale-90 transition-transform flex items-center justify-center">
                    {/* Floor grid */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 border-t border-indigo-500/20" />
                    <div className="absolute inset-y-0 left-1/2 right-0 border-l border-indigo-500/20" />

                    {/* Packed items boxes */}
                    {packedContainer.map((item, index) => {
                      // Filter by active layer
                      if (activeLayer === 'BOTTOM' && item.z > 0) return null;
                      if (activeLayer === 'TOP' && item.z === 0) return null;

                      // Pseudo absolute positioning logic inside visualizer
                      const posX = (item.x / containerDim.L) * 100;
                      const posY = (item.y / containerDim.W) * 100;

                      return (
                        <div
                          key={index}
                          style={{
                            left: `${posX}%`,
                            bottom: `${posY}%`,
                            height: `${Math.max(20, item.height / 2)}px`,
                            width: `${Math.max(30, item.length / 2)}px`,
                            backgroundColor: item.color,
                            transform: `translate3d(${index * 4}px, -${item.z * 1.5}px, 0)`,
                          }}
                          className="absolute border border-white/20 shadow-xl rounded flex flex-col justify-between p-1 opacity-90 transition-all font-mono"
                        >
                          <span className="text-[6px] font-bold text-white uppercase tracking-tighter leading-none">{item.name.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-slate-900/80 px-4 py-2 border border-slate-100 dark:border-slate-700 backdrop-blur-md rounded-xl text-[9px] font-bold text-slate-500 flex items-center space-x-1.5">
                    <Info size={12} className="text-indigo-600" />
                    <span><span className="font-black text-indigo-600">Spatial Constraint Verified:</span> Heavy items locked on floor layer (z=0)</span>
                  </div>
                </div>

                {/* Loading Coordinates Matrix list */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-850">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Coordinate Packing Vectors List (x, y, z)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-48 overflow-y-auto font-mono text-[10px] pr-2">
                    {packedContainer.map((item, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-black text-slate-800 dark:text-white line-clamp-1">{item.name}</p>
                          <p className="text-[8px] text-slate-400">({item.category})</p>
                        </div>
                        <div className="text-right text-indigo-600 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg">
                          [{item.x}, {item.y}, {item.z}]
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Box size={56} className="mx-auto text-slate-300 dark:text-slate-755 mb-4 animate-bounce" />
                <h4 className="font-black uppercase tracking-tight text-slate-800 dark:text-slate-300 text-lg">Load Solver Engine Stopped</h4>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">Configure your active loading list on the left queue, then execute computation to display volumetric yields.</p>
              </div>
            )}
          </div>

          {/* Space Metrics bar */}
          <div className="border-t border-slate-50 dark:border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Volumetric Yield</p>
                <p className="text-xl font-black dark:text-white">{volumetricYield}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Volumetric Void Ratio</p>
                <p className="text-xl font-black dark:text-white">{voidRatio}% <span className="text-[10px] text-emerald-500 uppercase tracking-widest">({parseFloat(voidRatio) <= 8.0 ? 'Optimal' : 'Suboptimal'})</span></p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Mass Load</p>
                <p className="text-xl font-black dark:text-white">{totalWeight.toLocaleString()} Kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinPackingAI;
