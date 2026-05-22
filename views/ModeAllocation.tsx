
import React, { useState, useMemo } from 'react';
import { TransportMode, Requirement, Driver } from '../types';
import { DB } from '../store';
import { Truck, Train, ArrowRight, CheckCircle2, AlertCircle, Users, Sparkles, TrendingDown, Award, Plus } from 'lucide-react';

interface Props {
  requirement: Requirement;
  onNext: (alloc: any) => void;
  onNavigateView?: (view: string) => void;
}

const ModeAllocation: React.FC<Props> = ({ requirement, onNext, onNavigateView }) => {
  const [selectedMode, setSelectedMode] = useState<TransportMode>(TransportMode.TRUCK);

  const providers = useMemo(() => {
    return {
      rail: [
        { id: 'R_PRV_1', name: 'Indian Railways (National Rake FOIS)', rate: 2.1, duration: '4-6 Days', reliability: '94%' },
        { id: 'R_PRV_2', name: 'Adani Dedicated Logistics (Bulk)', rate: 1.8, duration: '3-4 Days', reliability: '98%' },
        { id: 'R_PRV_3', name: 'Concor India (Multi-modal Cargo)', rate: 2.25, duration: '4-5 Days', reliability: '96%' },
      ],
      road: [
        { id: 'T_PRV_1', name: 'SwiftFlow Elite Fleet (Enterprise)', rate: 5.5, loading: 2500, unloading: 2500, duration: '1-2 Days', reliability: '95%' },
        { id: 'T_PRV_2', name: 'VRL Logistics Carriers (Bulk)', rate: 4.9, loading: 2000, unloading: 2000, duration: '2-3 Days', reliability: '97%' },
        { id: 'T_PRV_3', name: 'Gati Enterprise Service (Express)', rate: 5.2, loading: 2200, unloading: 2200, duration: '2 Days', reliability: '92%' },
      ]
    };
  }, []);

  const [selectedRailIndex, setSelectedRailIndex] = useState(1);
  const [selectedRoadIndex, setSelectedRoadIndex] = useState(0);

  const selectedRailProvider = providers.rail[selectedRailIndex];
  const selectedRoadProvider = providers.road[selectedRoadIndex];
  
  const weight = parseFloat(requirement.materialAmount) || 0;
  const distance = requirement.distanceKm || 100;

  // LOGISTICS ENGINE CALCULATIONS
  const logisticsData = useMemo(() => {
    // 1. Road Calculations
    const roadRatePerTonneKm = selectedRoadProvider.rate;
    const roadBaseCost = weight * distance * roadRatePerTonneKm;
    const loadingCharges = selectedRoadProvider.loading;
    const unloadingCharges = selectedRoadProvider.unloading;
    const totalRoadCost = roadBaseCost + loadingCharges + unloadingCharges;
    
    // Truck Capacity: 25 Tonnes
    const numTrucksNeeded = Math.ceil(weight / 25);
    const availableDrivers = DB.getDrivers().filter(d => d.status === 'Active');
    const assignedDrivers = availableDrivers.slice(0, numTrucksNeeded).map(d => d.name);

    // 2. Rail Calculations
    const railRatePerTonneKm = selectedRailProvider.rate;
    const totalRailCost = weight * distance * railRatePerTonneKm;

    return {
      road: {
        total: totalRoadCost,
        vehicles: numTrucksNeeded,
        drivers: assignedDrivers,
        loading: loadingCharges,
        unloading: unloadingCharges,
        duration: selectedRoadProvider.duration
      },
      rail: {
        total: totalRailCost,
        duration: selectedRailProvider.duration,
        link: 'https://fois.indianrail.gov.in/RailSAHAY/'
      }
    };
  }, [weight, distance, selectedRailProvider, selectedRoadProvider]);

  const handleConfirm = () => {
    if (selectedMode === TransportMode.RAIL) {
      window.open(logisticsData.rail.link, '_blank');
    }
    
    onNext({
      mode: selectedMode,
      quantity: `${weight} Tonnes`,
      numVehicles: selectedMode === TransportMode.RAIL ? 1 : logisticsData.road.vehicles,
      assignedDrivers: selectedMode === TransportMode.RAIL ? [selectedRailProvider.name] : logisticsData.road.drivers,
      loadingCharges: selectedMode === TransportMode.RAIL ? 0 : logisticsData.road.loading,
      unloadingCharges: selectedMode === TransportMode.RAIL ? 0 : logisticsData.road.unloading,
      totalCost: selectedMode === TransportMode.RAIL ? logisticsData.rail.total : logisticsData.road.total,
      duration: selectedMode === TransportMode.RAIL ? logisticsData.rail.duration : logisticsData.road.duration,
      manufacturerContact: '+91 9123456789',
      transportContact: '+91 9988776655'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Sourcing & Requirement Cohesive Tabs */}
      {onNavigateView && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-3xl flex flex-wrap gap-2 shadow-sm max-w-6xl mx-auto">
          <button
            onClick={() => onNavigateView('SUPPLIERS')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Award size={16} />
            <span>1. Sourcing & RFQ Market</span>
          </button>
          <button
            onClick={() => onNavigateView('CREATE_REQ')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus size={16} />
            <span>2. Setup Transport Requirement</span>
          </button>
          <button
            onClick={() => onNavigateView('ALLOCATE')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          >
            <TrendingDown size={16} />
            <span>3. Mode & Provider Allocation</span>
          </button>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Select Transport Mode</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{requirement.materialType || 'Material'} Allocation for {weight} Tonnes over {distance} KM</p>
      </div>

      {requirement.isAiOptimized && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/40 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center space-x-5 text-left">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <Sparkles size={28} className="animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">AI Route Optimization Approved</span>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">Accept Multi-Modal Hybrid Logistics</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                The AI network computed a combined Rail segment (75% via <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{selectedRailProvider.name}</span>) coupled with localized Road dispatch (25% via <span className="text-blue-600 dark:text-blue-400 font-extrabold">{selectedRoadProvider.name}</span>) from {requirement.siteLocation} to {requirement.destination} for an optimized total of <span className="font-extrabold text-emerald-600 font-mono text-sm">₹{Math.round((weight * distance * 0.75 * selectedRailProvider.rate) + (weight * distance * 0.25 * selectedRoadProvider.rate + selectedRoadProvider.loading)).toLocaleString()}</span>.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              onNext({
                mode: 'Hybrid' as any,
                quantity: `${weight} Tonnes`,
                numVehicles: Math.ceil((weight * 0.25) / 25), // local fleet vehicle requirement
                assignedDrivers: [`Rail Segment (75% via ${selectedRailProvider.name})`, `Road Segment (25% via ${selectedRoadProvider.name})`],
                loadingCharges: selectedRoadProvider.loading,
                unloadingCharges: selectedRoadProvider.unloading,
                totalCost: Math.round((weight * distance * 0.75 * selectedRailProvider.rate) + (weight * distance * 0.25 * selectedRoadProvider.rate + selectedRoadProvider.loading)),
                duration: '3-4 Days (Integrated Multi-Modal)',
                manufacturerContact: '+91 9123456789',
                transportContact: '+91 9988776655'
              });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <Sparkles size={16} />
            <span>Lock-In AI Route</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROAD LOGISTICS OPTION */}
        <div 
          onClick={() => setSelectedMode(TransportMode.TRUCK)}
          className={`relative p-10 rounded-[3rem] border-4 transition-all cursor-pointer group flex flex-col justify-between ${
            selectedMode === TransportMode.TRUCK 
            ? 'bg-blue-600 border-blue-400 text-white shadow-2xl shadow-blue-500/40' 
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 text-slate-900 dark:text-white'
          }`}
        >
          {selectedMode === TransportMode.TRUCK && (
            <div className="absolute top-6 right-6 bg-white text-blue-600 p-2 rounded-full shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          )}
          
          <div>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${
              selectedMode === TransportMode.TRUCK ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
            }`}>
              <Truck size={40} />
            </div>
            <h3 className="text-3xl font-black mb-2">Road Logistics</h3>
            <p className={`text-lg font-medium mb-8 ${selectedMode === TransportMode.TRUCK ? 'text-blue-100' : 'text-slate-500'}`}>
              Flexible door-to-door delivery using our enterprise fleet.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-current/10">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Fleet Requirement</span>
                <span className="text-xl font-black">{logisticsData.road.vehicles} Trucks</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-current/10">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Estimated Cost</span>
                <span className="text-2xl font-black">₹{logisticsData.road.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Est. Delivery</span>
                <span className="font-bold">{logisticsData.road.duration}</span>
              </div>
            </div>

            {/* Road Provider Multi-Select Compare Option */}
            <div className="mt-6 pt-6 border-t border-current/10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Compare Road Providers</span>
              <div className="grid grid-cols-3 gap-2">
                {providers.road.map((prv, idx) => (
                  <button
                    key={prv.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoadIndex(idx);
                    }}
                    className={`p-3 rounded-2xl border font-black text-center transition-all flex flex-col items-center justify-between col-span-1 ${
                      selectedRoadIndex === idx
                        ? selectedMode === TransportMode.TRUCK
                          ? 'bg-white text-blue-600 border-white shadow-lg'
                          : 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/10'
                        : 'bg-transparent text-current border-current/20 hover:border-current/40'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider block truncate w-full">{prv.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono mt-1 font-black">₹{prv.rate}/T-KM</span>
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-extrabold opacity-85 mt-2 flex justify-between uppercase tracking-wider">
                <span>Fleet: {selectedRoadProvider.name}</span>
                <span>Rel: {selectedRoadProvider.reliability}</span>
              </div>
            </div>

            {selectedMode === TransportMode.TRUCK && (
              <div className="bg-black/10 rounded-2xl p-6 mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2 text-blue-100 mb-2">
                  <Users size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Assigned Personnel</span>
                </div>
                <div className="flex -space-x-3">
                  {logisticsData.road.drivers.map((name, i) => (
                    <img key={i} src={`https://picsum.photos/seed/${name}/100`} className="w-10 h-10 rounded-full border-2 border-blue-600" title={name} alt="" />
                  ))}
                  {logisticsData.road.drivers.length === 0 && <p className="text-xs italic opacity-70">Searching for available drivers...</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RAIL SAHAY OPTION */}
        <div 
          onClick={() => setSelectedMode(TransportMode.RAIL)}
          className={`relative p-10 rounded-[3rem] border-4 transition-all cursor-pointer group flex flex-col justify-between ${
            selectedMode === TransportMode.RAIL 
            ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl shadow-emerald-500/40' 
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200 text-slate-900 dark:text-white'
          }`}
        >
          <div className="absolute top-8 right-10">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              selectedMode === TransportMode.RAIL ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-700'
            }`}>
              Best Value for Bulk
            </span>
          </div>

          <div>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${
              selectedMode === TransportMode.RAIL ? 'bg-white/20' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
            }`}>
              <Train size={40} />
            </div>
            <h3 className="text-3xl font-black mb-2">Rail Sahay</h3>
            <p className={`text-lg font-medium mb-8 ${selectedMode === TransportMode.RAIL ? 'text-emerald-100' : 'text-slate-500'}`}>
              Direct bulk transfer via Indian Railways FOIS network.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-current/10">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Service Level</span>
                <span className="text-xl font-black">National Freight</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-current/10">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Estimated Cost</span>
                <span className="text-2xl font-black text-emerald-400">₹{logisticsData.rail.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-bold uppercase text-xs tracking-widest opacity-60">Est. Delivery</span>
                <span className="font-bold">{logisticsData.rail.duration}</span>
              </div>
            </div>

            {/* Rail Provider Multi-Select Compare Option */}
            <div className="mt-6 pt-6 border-t border-current/10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Compare Rail Providers</span>
              <div className="grid grid-cols-3 gap-2">
                {providers.rail.map((prv, idx) => (
                  <button
                    key={prv.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRailIndex(idx);
                    }}
                    className={`p-3 rounded-2xl border font-black text-center transition-all flex flex-col items-center justify-between col-span-1 ${
                      selectedRailIndex === idx
                        ? selectedMode === TransportMode.RAIL
                          ? 'bg-white text-emerald-600 border-white shadow-lg'
                          : 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/10'
                        : 'bg-transparent text-current border-current/20 hover:border-current/40'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider block truncate w-full">{prv.name.includes('Railways') ? 'Railways' : prv.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono mt-1 font-black">₹{prv.rate}/T-KM</span>
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-extrabold opacity-85 mt-2 flex justify-between uppercase tracking-wider">
                <span>Rake Service: {selectedRailProvider.name}</span>
                <span>Rel: {selectedRailProvider.reliability}</span>
              </div>
            </div>

            <div className={`p-6 mt-6 rounded-2xl flex items-start space-x-4 ${
              selectedMode === TransportMode.RAIL ? 'bg-black/10' : 'bg-slate-50 dark:bg-slate-800'
            }`}>
              <AlertCircle className="flex-shrink-0 mt-1" size={20} />
              <p className="text-xs font-bold leading-relaxed opacity-80">
                Requires booking via Indian Railways Freight Operations Information System. Our portal will redirect you for final authorization.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={handleConfirm}
          className={`group flex items-center space-x-6 px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl ${
            selectedMode === TransportMode.RAIL 
              ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
              : 'bg-[#0f172a] dark:bg-blue-600 text-white shadow-blue-500/20'
          }`}
        >
          <span>{selectedMode === TransportMode.RAIL ? 'Book via Rail Sahay' : 'Confirm Road Allocation'}</span>
          <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ModeAllocation;
