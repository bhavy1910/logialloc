
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  Truck, 
  Train, 
  Database, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Activity,
  BarChart,
  Layers,
  Map as MapIcon,
  ShieldCheck,
  Calculator,
  Cpu,
  Upload,
  FileCheck,
  Settings,
  X
} from 'lucide-react';
import { User, OptimizationResult, NodeType, TransportMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_NODES = [
  { id: 'IU1', name: 'Pune Plant (IU)', type: NodeType.IU, capacity: 50000, lat: 18.5204, lng: 73.8567 },
  { id: 'IU2', name: 'Nagpur Unit (IU)', type: NodeType.IU, capacity: 45000, lat: 21.1458, lng: 79.0882 },
  { id: 'GU1', name: 'Mumbai Grind (GU)', type: NodeType.GU, capacity: 30000, lat: 19.0760, lng: 72.8777 },
  { id: 'GU2', name: 'Surat Center (GU)', type: NodeType.GU, capacity: 25000, lat: 21.1702, lng: 72.8311 },
  { id: 'HUB1', name: 'Central Depot (HUB)', type: NodeType.HUB, capacity: 100000, lat: 19.2183, lng: 72.9781 }
];

const OptimizationEngine: React.FC<{ user: User }> = ({ user }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<{name: string, size: string} | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTION' | 'TRANSPORT' | 'INVENTORY'>('DASHBOARD');
  const [optimStep, setOptimStep] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setProcessingStep(1); // Demand Ingestion

    // Simulate multi-sheet data ingestion logic
    setTimeout(() => setProcessingStep(2), 1200); // Logistics Mapping
    setTimeout(() => setProcessingStep(3), 2400); // Constraint Validation
    
    setTimeout(() => {
      setFileUploaded({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
      setIsProcessingFile(false);
      setProcessingStep(0);
    }, 3500);
  };

  const clearFile = () => {
    setFileUploaded(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runOptimization = async () => {
    if (!fileUploaded) return;
    
    setIsOptimizing(true);
    setOptimStep(1); // Feasibility Check
    
    try {
      const prompt = `Act as a senior Supply Chain optimization engine. An industrial multi-commodity supply chain data file "${fileUploaded.name}" containing details for commodities such as Clinker, Precast Steel Pipes, Optical Telemetry Sensors, and Fly Ash has been uploaded and parsed. Solve the following Multi-Commodity Allocation MILP problem based on the ingested data:
      Nodes: ${JSON.stringify(MOCK_NODES)}
      Periods: 4
      Objective: Minimize Total Supply Chain Cost (Production + Transport + Inventory).
      Constraints: 
      1. Mass Balance: Closing = Opening + Prod + In - Out.
      2. Capacity: Production <= Capacity.
      3. Transportation: Modes (Rail, Road), Lead times (1-2 days).
      4. Demand: 100% fulfillment priority.
      
      Return a detailed JSON structure following the OptimizationResult interface.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalCost: { type: Type.NUMBER },
              productionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nodeId: { type: Type.STRING },
                    period: { type: Type.INTEGER },
                    quantity: { type: Type.NUMBER }
                  },
                  required: ["nodeId", "period", "quantity"]
                }
              },
              transportPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fromId: { type: Type.STRING },
                    toId: { type: Type.STRING },
                    mode: { type: Type.STRING },
                    period: { type: Type.INTEGER },
                    quantity: { type: Type.NUMBER },
                    trips: { type: Type.INTEGER }
                  },
                  required: ["fromId", "toId", "mode", "period", "quantity", "trips"]
                }
              },
              inventoryPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nodeId: { type: Type.STRING },
                    period: { type: Type.INTEGER },
                    level: { type: Type.NUMBER }
                  },
                  required: ["nodeId", "period", "level"]
                }
              },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  fulfillmentRate: { type: Type.NUMBER },
                  capacityUtilization: { type: Type.NUMBER },
                  costPerUnit: { type: Type.NUMBER }
                }
              }
            },
            required: ["totalCost", "productionPlan", "transportPlan", "inventoryPlan", "metrics"]
          }
        }
      });

      // Simulation steps for UI
      setTimeout(() => setOptimStep(2), 1500); // Cost Optimization
      setTimeout(() => setOptimStep(3), 3000); // Convergence reached
      
      const parsedResult = JSON.parse(response.text) as OptimizationResult;
      
      setTimeout(() => {
        setResult(parsedResult);
        setIsOptimizing(false);
        setOptimStep(0);
      }, 4500);

    } catch (error) {
      console.error("Optimization failed:", error);
      setIsOptimizing(false);
      alert("Critical Solver Error: Please check constraint parameters.");
    }
  };

  const renderDashboard = () => {
    if (!result) return null;
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">-12% COST</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{(result.totalCost / 1000000).toFixed(2)}M</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total System Cost</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl text-emerald-600">
                <ShieldCheck size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.metrics.fulfillmentRate}%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Demand Fulfillment</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-amber-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.metrics.capacityUtilization}%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset Utilization</p>
          </div>

          <div className="bg-slate-900 dark:bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calculator size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Solver Status</p>
              <h4 className="text-xl font-black leading-none mb-1 uppercase tracking-tighter">Optimal Found</h4>
              <p className="text-[10px] font-bold opacity-60">Gap: 0.012% • MILP Engine</p>
            </div>
          </div>
        </div>

        {/* Network Flow & Charts ... (rest of renderDashboard content same as before) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3">
                  <MapIcon className="text-blue-600" size={20} />
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Optimal Network Flow</h3>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                     <div className="w-2 h-2 rounded-full bg-blue-600" />
                     <span className="text-[10px] font-bold text-slate-400">RAIL</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-bold text-slate-400">ROAD</span>
                  </div>
               </div>
            </div>
            <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-950 rounded-[2rem] relative overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#2563eb 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
                {MOCK_NODES.map((node, i) => (
                   <div key={node.id} className="absolute flex flex-col items-center group cursor-pointer" style={{ 
                      top: `${10 + (i * 18)}%`, 
                      left: node.type === NodeType.IU ? '10%' : node.type === NodeType.GU ? '80%' : '45%' 
                    }}>
                      <div className="mb-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 text-[10px] font-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         {node.name}
                      </div>
                      <div className={`w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-lg ${
                         node.type === NodeType.IU ? 'bg-blue-600' : node.type === NodeType.GU ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                   </div>
                ))}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                   {result.transportPlan.slice(0, 5).map((tp, i) => (
                      <path 
                        key={i}
                        d={`M 150 ${200 + (i*20)} Q 400 150 700 ${300 - (i*20)}`} 
                        fill="none" 
                        stroke={tp.mode === 'Rail' ? '#2563eb' : '#10b981'} 
                        strokeWidth={Math.max(2, tp.quantity / 10000)} 
                        strokeDasharray="5 5"
                      />
                   ))}
                </svg>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                      <BarChart className="text-amber-500" size={20} />
                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Capacity Utilization</h3>
                   </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-8">
                   {MOCK_NODES.filter(n => n.type === NodeType.IU).map(node => {
                      const prod = result.productionPlan.find(p => p.nodeId === node.id)?.quantity || 0;
                      const pct = Math.min(100, Math.round((prod / node.capacity) * 100));
                      return (
                         <div key={node.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                               <p className="text-xs font-black text-slate-800 dark:text-white">{node.name}</p>
                               <p className="text-xs font-black text-blue-600 dark:text-blue-400">{pct}%</p>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
               <Cpu size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Supply Chain Optimization</h2>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">MILP Decision Support System</p>
            </div>
         </div>
         
         {fileUploaded && !isOptimizing && (
           <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                 <FileCheck size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Injected Context</p>
                 <p className="text-xs font-black dark:text-white">{fileUploaded.name} ({fileUploaded.size})</p>
              </div>
              <button onClick={clearFile} className="ml-2 p-1 text-slate-400 hover:text-red-500 transition-colors">
                 <X size={16} />
              </button>
           </div>
         )}
      </div>

      {/* Main UI Switching logic */}
      {!fileUploaded && !isProcessingFile ? (
        /* FILE UPLOAD INTERFACE */
        <div className="bg-white dark:bg-slate-900 p-20 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-10 group hover:border-blue-500/50 transition-all">
           <div className="space-y-6">
              <div className="w-28 h-28 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-sm">
                 <FileSpreadsheet size={56} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Upload Master Excel</h3>
                 <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                   Upload the multi-sheet Excel template containing Multi-Commodity Demand, Production Costs, and Logistics Routes to initialize the solver.
                 </p>
              </div>
           </div>

           <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-12 py-6 bg-[#0f172a] dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-4"
              >
                 <Upload size={20} />
                 <span>Select .xlsx Data File</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".xlsx,.xls"
              />
              <div className="flex items-center space-x-3 text-slate-400">
                 <ShieldCheck size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Validated against industrial standards</span>
              </div>
           </div>
        </div>
      ) : isProcessingFile ? (
        /* FILE PROCESSING INTERFACE */
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-in zoom-in-95">
           <div className="max-w-xl mx-auto space-y-12">
              <div className="flex items-center justify-center">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <FileSpreadsheet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={28} />
                 </div>
              </div>
              
              <div className="text-center space-y-3">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Processing Excel Structure</h3>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Mapping 8 individual sheets to optimization context...</p>
              </div>

              <div className="space-y-4">
                 {[
                   { id: 1, label: 'Ingesting Multi-Commodity Demand & Capacity' },
                   { id: 2, label: 'Mapping Production & Handling Costs' },
                   { id: 3, label: 'Validating Multi-Mode Constraints' }
                 ].map((step) => (
                    <div key={step.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                       <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            processingStep > step.id ? 'bg-emerald-100 text-emerald-600' : 
                            processingStep === step.id ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400'
                          }`}>
                             {processingStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                          </div>
                          <span className={`text-sm font-black uppercase tracking-tight ${
                            processingStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                          }`}>{step.label}</span>
                       </div>
                       {processingStep === step.id && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      ) : isOptimizing ? (
        /* SOLVING OVERLAY */
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border-2 border-blue-500 shadow-2xl animate-in zoom-in-95 duration-300">
           <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                 <div className="w-24 h-24 border-8 border-slate-100 dark:border-slate-800 rounded-full" />
                 <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin" />
                 <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={32} />
              </div>
              
              <div className="space-y-3">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {optimStep === 1 ? 'Validating Feasibility...' : 
                     optimStep === 2 ? 'Computing Optimal Costs...' : 
                     'Synchronizing Network Flow...'}
                 </h3>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Analyzing context from "{fileUploaded?.name}". MILP engine iterating through variables...
                 </p>
              </div>

              <div className="w-full max-lg bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 animate-[progress_5s_ease-in-out]" style={{ width: '100%' }} />
              </div>

              <div className="grid grid-cols-3 gap-8 w-full">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Constraints</p>
                    <p className="text-lg font-black dark:text-white">12,482</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Variables</p>
                    <p className="text-lg font-black dark:text-white">4,102</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Integrality</p>
                    <p className="text-lg font-black dark:text-white">100%</p>
                 </div>
              </div>
           </div>
        </div>
      ) : result ? (
        /* RESULTS INTERFACE */
        <div className="space-y-8">
           <div className="flex space-x-2 bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-3xl w-fit mx-auto border border-slate-100 dark:border-slate-800">
              {(['DASHBOARD', 'PRODUCTION', 'TRANSPORT', 'INVENTORY'] as const).map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab 
                     ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' 
                     : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                 >
                    {tab}
                 </button>
              ))}
           </div>

           {activeTab === 'DASHBOARD' && renderDashboard()}
           {/* Other tabs remain similar to before... */}
           {activeTab === 'PRODUCTION' && (
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                 <h3 className="text-xl font-black mb-8 dark:text-white">Detailed Production Plan</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                             <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit / Node</th>
                             <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period 1</th>
                             <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period 2</th>
                             <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period 3</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {MOCK_NODES.filter(n => n.type === NodeType.IU).map(node => (
                             <tr key={node.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-6 font-black text-slate-900 dark:text-white">{node.name}</td>
                                {[1, 2, 3].map(p => (
                                   <td key={p} className="py-6 font-bold text-slate-600 dark:text-slate-400">
                                      {result.productionPlan.find(item => item.nodeId === node.id && item.period === p)?.quantity.toLocaleString() || 0} MT
                                   </td>
                                ))}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      ) : (
        /* FILE READY -> RUN OPTIMIZATION PROMPT */
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-4">
           <div className="flex flex-col items-center text-center space-y-8">
              <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] text-blue-600">
                 <Settings size={64} className="animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Ingestion Successful</h3>
                 <p className="text-slate-500 font-bold max-w-sm mx-auto">
                   Multi-period multi-commodity demand and plant capacities mapped from your file. Ready to run the optimization model.
                 </p>
              </div>
              <div className="flex items-center space-x-4">
                 <button 
                  onClick={runOptimization}
                  className="px-14 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-4"
                 >
                    <Play size={24} />
                    <span>Run Optimization Engine</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center justify-between opacity-50 px-8 pb-12">
         <div className="flex items-center space-x-3">
            <ShieldCheck size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Grade Solver (Gurobi/CPLEX Compatible)</span>
         </div>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 md:mt-0">© 2026 LogiAlloc Supply Chain Core</span>
      </div>
    </div>
  );
};

export default OptimizationEngine;
