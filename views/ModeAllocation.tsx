
import React, { useState, useMemo } from 'react';
import { TransportMode, Requirement, Driver } from '../types';
import { DB } from '../store';
import { Truck, Train, ArrowRight, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface Props {
  requirement: Requirement;
  onNext: (alloc: any) => void;
}

const ModeAllocation: React.FC<Props> = ({ requirement, onNext }) => {
  const [selectedMode, setSelectedMode] = useState<TransportMode>(TransportMode.TRUCK);
  
  const weight = parseFloat(requirement.materialAmount) || 0;
  const distance = requirement.distanceKm || 100;

  // LOGISTICS ENGINE CALCULATIONS
  const logisticsData = useMemo(() => {
    // 1. Road Calculations
    const roadRatePerTonneKm = 5.5;
    const roadBaseCost = weight * distance * roadRatePerTonneKm;
    const loadingCharges = 2500;
    const unloadingCharges = 2500;
    const totalRoadCost = roadBaseCost + loadingCharges + unloadingCharges;
    
    // Truck Capacity: 25 Tonnes
    const numTrucksNeeded = Math.ceil(weight / 25);
    const availableDrivers = DB.getDrivers().filter(d => d.status === 'Active');
    const assignedDrivers = availableDrivers.slice(0, numTrucksNeeded).map(d => d.name);

    // 2. Rail Calculations
    const railRatePerTonneKm = 2.1;
    const totalRailCost = weight * distance * railRatePerTonneKm;

    return {
      road: {
        total: totalRoadCost,
        vehicles: numTrucksNeeded,
        drivers: assignedDrivers,
        loading: loadingCharges,
        unloading: unloadingCharges,
        duration: distance > 500 ? '2-3 Days' : '1 Day'
      },
      rail: {
        total: totalRailCost,
        duration: '4-6 Days',
        link: 'https://fois.indianrail.gov.in/RailSAHAY/'
      }
    };
  }, [weight, distance]);

  const handleConfirm = () => {
    if (selectedMode === TransportMode.RAIL) {
      window.open(logisticsData.rail.link, '_blank');
    }
    
    onNext({
      mode: selectedMode,
      quantity: `${weight} Tonnes`,
      numVehicles: selectedMode === TransportMode.RAIL ? 1 : logisticsData.road.vehicles,
      assignedDrivers: selectedMode === TransportMode.RAIL ? ['Indian Railways'] : logisticsData.road.drivers,
      loadingCharges: selectedMode === TransportMode.RAIL ? 0 : logisticsData.road.loading,
      unloadingCharges: selectedMode === TransportMode.RAIL ? 0 : logisticsData.road.unloading,
      totalCost: selectedMode === TransportMode.RAIL ? logisticsData.rail.total : logisticsData.road.total,
      duration: selectedMode === TransportMode.RAIL ? logisticsData.rail.duration : logisticsData.road.duration,
      manufacturerContact: '+91 9123456789',
      transportContact: '+91 9988776655'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Select Transport Mode</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Clinker Allocation for {weight} Tonnes over {distance} KM</p>
      </div>

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

            {selectedMode === TransportMode.TRUCK && (
              <div className="bg-black/10 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
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

            <div className={`p-6 rounded-2xl flex items-start space-x-4 ${
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
