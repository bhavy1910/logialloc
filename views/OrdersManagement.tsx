
import React, { useState, useEffect } from 'react';
import { Shipment, Requirement, TransportMode, UserRole, User as UserType } from '../types';
import { DB } from '../store';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  IndianRupee, 
  X, 
  Truck, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Factory,
  Lock
} from 'lucide-react';

interface Props {
  user?: UserType;
}

const OrdersManagement: React.FC<Props> = ({ user }) => {
  const [orders, setOrders] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Shipment | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  useEffect(() => {
    let list = DB.getShipments();
    if (user?.role === UserRole.TRANSPORT_PROVIDER) {
      // Filter ONLY orders where the associated requirement selectedMode has been set to TRUCK by AI suggestions
      list = list.filter(order => {
        const req = DB.getRequirementById(order.requirementId);
        return req && req.selectedMode === TransportMode.TRUCK;
      });
    }
    setOrders(list);
  }, [user]);

  const handleOrderClick = (order: Shipment) => {
    setSelectedOrder(order);
    const req = DB.getRequirementById(order.requirementId);
    if (req) setSelectedRequirement(req);
  };

  const filteredOrders = orders.filter(o => 
    o.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Orders Registry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">History of all shipments, requirements and transactions</p>
        </div>
      </div>

      {user?.role === UserRole.TRANSPORT_PROVIDER && (
        <div className="p-6 bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-400 rounded-3xl text-xs space-y-2 font-semibold">
          <div className="flex items-center space-x-2 text-sm font-black uppercase tracking-wider text-amber-600">
            <Lock size={16} />
            <span>CARRIER FILTER ACTIVE</span>
          </div>
          <p className="leading-relaxed">
            This portal displays orders assigned for road/truck transport transit dispatch. Use the filter below or look at active drivers to dispatch vehicles.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or Driver..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-80 dark:text-white font-bold"
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Order Details</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Assignee</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Cargo Info</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Economics</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{order.shipmentNumber}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Ref: {order.requirementId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center space-x-3">
                        <img src={`https://picsum.photos/seed/${order.driverId}/100`} className="w-8 h-8 rounded-full border border-white dark:border-slate-700 shadow-sm" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{order.driverName || 'Unassigned'}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-tight">Personnel</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.quantity}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{order.mode}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                      <IndianRupee size={14} />
                      <span className="text-sm font-black">{order.totalCost.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      order.status.includes('Active') 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Showing {filteredOrders.length} records</p>
          <div className="flex items-center space-x-2">
             <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"><ChevronLeft size={16} /></button>
             <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm">1</button>
             <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-10 bg-[#0f172a] dark:bg-slate-900 text-white flex justify-between items-center relative">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <Package size={180} />
                   </div>
                   <div className="flex items-center space-x-6 relative z-10">
                      <div className="p-5 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20">
                         <Package size={32} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black tracking-tight">{selectedOrder.shipmentNumber}</h3>
                         <div className="flex items-center space-x-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Shipment Status:</span>
                            <span className="px-3 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedOrder.status}</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10"
                   >
                      <X size={24} />
                   </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12">
                   {/* Stakeholder Info Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* SITE MANAGER INFO */}
                      <div className="space-y-6">
                         <div className="flex items-center space-x-3 mb-2">
                            <ShieldCheck className="text-blue-600" size={20} />
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Site Manager (Requestor)</h4>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] p-8 space-y-5 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-4">
                               <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-blue-600">
                                  <User size={24} />
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 dark:text-white text-lg">{selectedRequirement?.managerName || 'System Admin'}</p>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Lead Site Manager</p>
                               </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <Building2 size={16} className="text-slate-300" />
                                  <span>{selectedRequirement?.siteLocation || 'LogiAlloc HQ'}</span>
                               </div>
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <Phone size={16} className="text-slate-300" />
                                  <span>+91 91234 56789</span>
                               </div>
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <MapPin size={16} className="text-slate-300" />
                                  <span>Terminal Gate 4, Industrial Area</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* TRANSPORT PROVIDER INFO */}
                      <div className="space-y-6">
                         <div className="flex items-center space-x-3 mb-2">
                            <Truck className="text-indigo-600" size={20} />
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transport Provider (Allocated By)</h4>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] p-8 space-y-5 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-4">
                               <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-indigo-600">
                                  <Factory size={24} />
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 dark:text-white text-lg">Express Logistics Solutions</p>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Primary Fleet Provider</p>
                               </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <Building2 size={16} className="text-slate-300" />
                                  <span>Fleet Command Center, Nagpur</span>
                               </div>
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <Phone size={16} className="text-slate-300" />
                                  <span>{selectedOrder.transportContact}</span>
                               </div>
                               <div className="flex items-center space-x-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  <Activity size={16} className="text-slate-300" />
                                  <span>Tracking ID: {selectedOrder.id}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Cargo & Logistics Matrix */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-blue-600/5 dark:bg-blue-600/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900/40">
                         <h5 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-4">Cargo Highlights</h5>
                         <div className="space-y-4">
                            <div>
                               <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedOrder.quantity}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Net Weight</p>
                            </div>
                            <div className="pt-4 border-t border-blue-100 dark:border-blue-900/30">
                               <p className="text-xl font-black text-slate-900 dark:text-white">{selectedOrder.materialType}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Class</p>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Logistics Fleet</h5>
                         <div className="space-y-4">
                            <div>
                               <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedOrder.numVehicles} x {selectedOrder.mode}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Allocation</p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                               {selectedOrder.assignedDrivers.map((d, i) => (
                                  <div key={i} className="flex items-center space-x-2 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600">
                                     <div className="w-4 h-4 rounded-full bg-blue-600" />
                                     <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{d}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="bg-emerald-600/5 dark:bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/40">
                         <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4">Financials</h5>
                         <div className="space-y-4">
                            <div>
                               <div className="flex items-center text-3xl font-black text-emerald-600">
                                  <IndianRupee size={24} />
                                  <span>{selectedOrder.totalCost.toLocaleString()}</span>
                               </div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction Value</p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
                               <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-widest">PAID</div>
                               <div className="text-[10px] font-black text-slate-400">PROCESSED ON JAN 07</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Distance & Route Card */}
                   <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-10 group-hover:scale-105 transition-transform duration-1000" style={{ 
                         backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, 
                         backgroundSize: '24px 24px' 
                      }} />
                      <div className="relative z-10 space-y-2">
                         <div className="flex items-center space-x-3">
                            <span className="text-blue-400 font-black text-sm uppercase tracking-widest">Route Metrics</span>
                            <div className="h-0.5 w-12 bg-blue-400" />
                         </div>
                         <div className="flex items-center space-x-6">
                            <h4 className="text-4xl font-black">{selectedRequirement?.distanceKm || 800} KM</h4>
                            <ArrowRight className="text-white/30" />
                            <h4 className="text-4xl font-black text-white/40">{selectedOrder.duration}</h4>
                         </div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">From: {selectedRequirement?.siteLocation} • To: {selectedRequirement?.destination}</p>
                      </div>
                      <div className="relative z-10">
                         <button className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs">
                            View GPS Telemetry
                         </button>
                      </div>
                   </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end">
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="px-10 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-xl hover:bg-slate-300 transition-all uppercase tracking-widest text-xs"
                   >
                      Close Detail
                   </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
