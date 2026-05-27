
import React, { useState, useEffect } from 'react';
import { Shipment, User, UserRole, TransportMode } from '../types';
import { DB } from '../store';
import { Search, MapPin, Truck, ChevronRight } from 'lucide-react';

const TrackingDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    let data = DB.getShipments();
    if (user?.role === UserRole.TRANSPORT_PROVIDER) {
      data = data.filter(shipment => {
        const req = DB.getRequirementById(shipment.requirementId);
        return req && req.selectedMode === TransportMode.TRUCK;
      });
    }
    setShipments(data);
    if (data.length > 0) setSelectedShipment(data[0]);
  }, [user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left List */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search shipment..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-white"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ongoing Delivery</h2>
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div 
                key={shipment.id}
                onClick={() => setSelectedShipment(shipment)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                  selectedShipment?.id === shipment.id 
                    ? 'border-blue-600 shadow-md ring-1 ring-blue-600' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Shipment number</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{shipment.shipmentNumber}</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                    <Truck size={20} className="text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 ring-4 ring-blue-50 dark:ring-blue-900/30" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-200">2972 Westheimer</p>
                        <p className="text-[10px] text-slate-400">Rd. Santa Ana, Illinois 85486</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-200">8502 Preston</p>
                        <p className="text-[10px] text-slate-400">Rd. Inglewood, Maine 98380</p>
                      </div>
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={`https://picsum.photos/seed/${shipment.driverId}/100`} className="w-8 h-8 rounded-full border border-white dark:border-slate-700 shadow-sm" alt="" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{shipment.driverName}</p>
                      <p className="text-[10px] text-slate-400">Driver</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Map Mockup */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative min-h-[600px]">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
                backgroundImage: `radial-gradient(#2563eb 0.5px, transparent 0.5px), radial-gradient(#2563eb 0.5px, transparent 0.5px)`, 
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
            }} />
            
            {selectedShipment && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path 
                        d="M 150 200 Q 400 100 600 400" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="4" 
                        strokeDasharray="8 4" 
                        className="animate-[dash_20s_linear_infinite]"
                    />
                </svg>
            )}

            <div className="absolute top-[20%] left-[15%] flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 mb-2">
                    <p className="text-[10px] font-bold dark:text-white">Origin</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/40" />
            </div>

            <div className="absolute bottom-[20%] right-[15%] flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 mb-2">
                    <p className="text-[10px] font-bold dark:text-white">Destination</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/40" />
            </div>

            {selectedShipment && (
                <div className="absolute top-8 left-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-64">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Status</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{selectedShipment.shipmentNumber}</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Progress</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{selectedShipment.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${selectedShipment.progress}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-400">Commodity</p>
                                <p className="text-xs font-bold dark:text-white truncate">{selectedShipment.materialType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Quantity</p>
                                <p className="text-xs font-bold dark:text-white">{selectedShipment.quantity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TrackingDashboard;
