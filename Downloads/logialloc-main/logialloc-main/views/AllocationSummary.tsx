
import React from 'react';
import { Allocation, Requirement, ShipmentStatus, Shipment, TransportMode } from '../types';
import { DB } from '../store';
import { Check, X, Printer, Share2, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  allocation: any;
  requirement: Requirement;
  onApprove: () => void;
  onReject: () => void;
}

const AllocationSummary: React.FC<Props> = ({ allocation, requirement, onApprove, onReject }) => {
  const handleApprove = () => {
    // Determine primary driver for dashboard views
    const primaryDriverName = allocation.assignedDrivers?.[0] || 'Unassigned';
    
    const newShipment: Shipment = {
      ...allocation,
      id: 'S-' + Math.random().toString(36).substr(2, 9),
      shipmentNumber: 'EV-' + (Math.floor(Math.random() * 9000000000) + 1000000000),
      requirementId: requirement.id,
      status: ShipmentStatus.ACTIVE,
      materialType: 'Clinker',
      progress: 0,
      route: [
        { lat: 19.0760, lng: 72.8777 }, // Starting Mumbai
        { lat: 21.1458, lng: 79.0882 }  // Target Nagpur example
      ],
      // Explicitly providing driver properties for the Shipment interface
      driverName: primaryDriverName,
      driverId: `D-${primaryDriverName.replace(/\s+/g, '')}`
    };
    DB.createShipment(newShipment);
    onApprove();
  };

  const isRail = allocation.mode === TransportMode.RAIL;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
       <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          {/* Header */}
          <div className={`p-10 text-white flex justify-between items-center ${isRail ? 'bg-emerald-600' : 'bg-blue-600'}`}>
             <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <FileText size={28} />
                </div>
                <div>
                   <h2 className="text-2xl font-black uppercase tracking-tight">Logistics Summary</h2>
                   <p className="text-white/70 font-bold text-xs uppercase tracking-widest">Order ID: {requirement.id}</p>
                </div>
             </div>
             <div className="flex space-x-2">
                <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><Printer size={20} /></button>
                <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><Share2 size={20} /></button>
             </div>
          </div>

          <div className="p-10 md:p-16 space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cargo Details</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Commodity</span>
                            <span className="text-slate-900 dark:text-white font-black">CLINKER (BULK)</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Total Weight</span>
                            <span className="text-slate-900 dark:text-white font-black">{allocation.quantity}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Transport Mode</span>
                            <span className="text-blue-600 dark:text-blue-400 font-black uppercase">{allocation.mode}</span>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Route Info</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Origin</span>
                            <span className="text-slate-900 dark:text-white font-black">{requirement.siteLocation}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Destination</span>
                            <span className="text-slate-900 dark:text-white font-black">{requirement.destination}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Total Distance</span>
                            <span className="text-slate-900 dark:text-white font-black">{requirement.distanceKm} KM</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fleet Assignment</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400 font-bold">Vehicles Required</span>
                         <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-lg font-black text-blue-600 dark:text-blue-400">{allocation.numVehicles}</span>
                      </div>
                      <div className="pt-4 space-y-3">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Personnel</p>
                         <div className="grid grid-cols-1 gap-2">
                            {allocation.assignedDrivers.map((driver: string, i: number) => (
                               <div key={i} className="flex items-center space-x-3 bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm">
                                  <img src={`https://picsum.photos/seed/${driver}/100`} className="w-8 h-8 rounded-full" alt="" />
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{driver}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Estimated Costing</p>
                      <h3 className={`text-5xl font-black ${isRail ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>₹{allocation.totalCost.toLocaleString()}</h3>
                   </div>
                   <div className="flex space-x-4">
                      <button 
                        onClick={onReject}
                        className="px-8 py-5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-400 hover:text-red-500 hover:border-red-500 transition-all flex items-center space-x-2"
                      >
                         <X size={20} />
                         <span>CANCEL</span>
                      </button>
                      <button 
                        onClick={handleApprove}
                        className={`px-12 py-5 rounded-2xl font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-3 ${
                          isRail ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'
                        }`}
                      >
                         <Check size={24} />
                         <span>{isRail ? 'REDIRECT TO RAIL SAHAY' : 'PROCEED WITH FLEET'}</span>
                      </button>
                   </div>
                </div>
                {isRail && (
                  <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center space-x-4 border border-emerald-100 dark:border-emerald-800">
                     <AlertTriangle className="text-emerald-600" />
                     <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed">
                        Note: Clicking proceed will open the official Indian Railways Freight Operations portal. Please ensure you have your enterprise credentials ready for the Clinker rake booking.
                     </p>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default AllocationSummary;
