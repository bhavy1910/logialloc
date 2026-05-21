
import React, { useState, useEffect } from 'react';
import { User, TransportMode, WagonType, RoadVehicleType } from '../types';
import { 
  ArrowRight, 
  Weight, 
  MapPin, 
  Truck, 
  Train, 
  Info, 
  ChevronDown, 
  Layers, 
  Calculator,
  Search,
  ChevronRight
} from 'lucide-react';

interface Props {
  user: User;
  onNext: (req: any) => void;
}

const RequirementCreation: React.FC<Props> = ({ user, onNext }) => {
  const [selectedMode, setSelectedMode] = useState<TransportMode>(TransportMode.RAIL);
  const [formData, setFormData] = useState({
    managerName: user.fullName,
    siteLocation: 'VADODARA MARSHALLING YARD - BRC',
    destination: 'AHMEDABAD',
    materialAmount: '', // In Tonnes
    materialType: 'CLINKER GRADE A',
    wagonType: WagonType.BOXNHL,
    wagonCount: 58,
    roadVehicleType: RoadVehicleType.V12_WHEELER,
    isBatched: false,
    batchCount: 2
  });

  const materialWeight = parseFloat(formData.materialAmount) || 0;
  // Automatically suggest batching for 5-6 figure orders (10,000+ Tonnes)
  const isLargeOrder = materialWeight >= 10000;

  useEffect(() => {
    if (isLargeOrder) {
      setFormData(prev => ({ ...prev, isBatched: true }));
    } else {
      setFormData(prev => ({ ...prev, isBatched: false }));
    }
  }, [isLargeOrder]);

  const getDistance = (dest: string) => {
    const distances: Record<string, number> = {
      'AHMEDABAD': 120,
      'NAGPUR': 750,
      'INDORE': 400,
      'SURAT': 150,
      'MUMBAI': 450
    };
    return distances[dest] || 500;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination || !formData.materialAmount) return;
    
    onNext({
        ...formData,
        id: 'REQ-' + Math.random().toString(36).substr(2, 9),
        selectedMode,
        distanceKm: getDistance(formData.destination),
        createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-2">
         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Requirement Setup</h2>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Industrial Logistics & Allocation</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-800/50 p-2 m-4 rounded-3xl">
           <button 
            type="button"
            onClick={() => setSelectedMode(TransportMode.RAIL)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-black text-sm transition-all ${
              selectedMode === TransportMode.RAIL 
              ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
           >
              <Train size={18} />
              <span>RAIL</span>
           </button>
           <button 
            type="button"
            onClick={() => setSelectedMode(TransportMode.TRUCK)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl font-black text-sm transition-all ${
              selectedMode === TransportMode.TRUCK 
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
           >
              <Truck size={18} />
              <span>ROAD</span>
           </button>
        </div>

        <div className="px-8 pb-10 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Cargo Description Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-4 mb-6 flex items-center">
                 <Search size={14} className="mr-2" /> Cargo Description
              </h3>

              <div className="space-y-4">
                <div className="relative group">
                  <select 
                    value={formData.materialType}
                    onChange={(e) => setFormData({...formData, materialType: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-slate-850 dark:text-white uppercase outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                  >
                     <option value="CLINKER GRADE A">CLINKER GRADE A</option>
                     <option value="FLY ASH">FLY ASH</option>
                     <option value="PRECAST STEEL PIPES">PRECAST STEEL PIPES</option>
                     <option value="SOLAR PANEL ARRAYS">SOLAR PANEL ARRAYS</option>
                     <option value="COAL & LIGNITE">COAL & LIGNITE</option>
                     <option value="LIMESTONE MINERALS">LIMESTONE MINERALS</option>
                     <option value="AGRI-GRAINS BULK">AGRI-GRAINS BULK</option>
                     <option value="HEAVY BOILER MOTORS">HEAVY BOILER MOTORS</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </div>
                </div>

                <button type="button" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 font-black text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm">
                   Check Discount Schemes
                </button>

                <div className="space-y-1">
                   <div className="relative group">
                      <input 
                        type="text" 
                        value={formData.siteLocation}
                        onChange={(e) => setFormData({...formData, siteLocation: e.target.value.toUpperCase()})}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-slate-800 dark:text-white uppercase outline-none focus:border-emerald-500 transition-colors"
                        placeholder="FROM STATION"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <div className="relative group">
                      <select 
                        value={formData.destination}
                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                        className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-slate-800 dark:text-white uppercase outline-none focus:border-emerald-500 transition-colors appearance-none"
                      >
                         <option value="AHMEDABAD">AHMEDABAD</option>
                         <option value="NAGPUR">NAGPUR</option>
                         <option value="INDORE">INDORE</option>
                         <option value="SURAT">SURAT</option>
                         <option value="MUMBAI">MUMBAI</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Mode Specific Logic */}
            <div className="space-y-4 pt-4">
              {selectedMode === TransportMode.RAIL ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button type="button" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 font-black text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm">
                     Select Wagon Type
                  </button>
                  <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {formData.wagonType}
                  </div>
                  
                  <div className="flex border-2 border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800 px-4 py-4 flex items-center border-r border-slate-100 dark:border-slate-700">
                       <select className="bg-transparent font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer">
                          <option>Wagons</option>
                       </select>
                       <ChevronDown size={14} className="ml-1 text-slate-400" />
                    </div>
                    <input 
                      type="number" 
                      value={formData.wagonCount}
                      onChange={(e) => setFormData({...formData, wagonCount: parseInt(e.target.value) || 0})}
                      className="flex-1 p-4 font-black text-xl outline-none dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vehicle Configuration
                  </div>
                  <div className="relative">
                    <select 
                      value={formData.roadVehicleType}
                      onChange={(e) => setFormData({...formData, roadVehicleType: e.target.value as RoadVehicleType})}
                      className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-slate-800 dark:text-white uppercase outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                       {Object.values(RoadVehicleType).map(v => (
                          <option key={v} value={v}>{v}</option>
                       ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tonnage / Weight */}
              <div className="space-y-2 pt-4">
                 <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Material Net Weight (Tonnes)
                 </div>
                 <div className="relative group">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      type="number" 
                      placeholder="ENTER QUANTITY" 
                      value={formData.materialAmount}
                      onChange={(e) => setFormData({...formData, materialAmount: e.target.value})}
                      className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-2xl text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                    />
                 </div>
              </div>

              {/* Batching Toggle for large orders */}
              <div className={`p-6 rounded-3xl border-2 transition-all mt-4 ${
                 isLargeOrder 
                 ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40' 
                 : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <Layers size={18} className={isLargeOrder ? "text-amber-600" : "text-slate-400"} />
                       <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Divide into Batches</h4>
                          <p className="text-[10px] font-bold text-slate-400">Recommended for 5-6 figure volumes</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                          type="checkbox" 
                          checked={formData.isBatched} 
                          onChange={(e) => setFormData({...formData, isBatched: e.target.checked})}
                          className="sr-only peer" 
                       />
                       <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                 </div>

                 {formData.isBatched && (
                    <div className="mt-4 flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-300">
                       <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 font-black text-slate-500 text-[10px] flex items-center border-r border-slate-100 dark:border-slate-700 uppercase">Batches</div>
                       <input 
                          type="number" 
                          value={formData.batchCount}
                          onChange={(e) => setFormData({...formData, batchCount: parseInt(e.target.value) || 1})}
                          className="flex-1 px-4 py-3 bg-transparent font-black text-lg outline-none dark:text-white"
                       />
                    </div>
                 )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-8">
               <button 
                  type="submit"
                  className="w-full bg-[#da3442] hover:bg-[#c12e3a] text-white p-6 rounded-2xl font-black text-xl uppercase tracking-widest flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-red-500/20"
               >
                  <span>Calculate Freight</span>
               </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-4 opacity-50">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <Info size={14} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by IR (FOIS) Logistics Engine</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};

export default RequirementCreation;
