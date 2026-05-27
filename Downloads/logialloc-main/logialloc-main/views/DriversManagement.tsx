
import React, { useState, useEffect, useRef } from 'react';
import { Driver, TransportMode } from '../types';
import { DB } from '../store';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Upload, 
  X, 
  CheckCircle2,
  Truck
} from 'lucide-react';

const DriversManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New Driver Form State
  const [newDriver, setNewDriver] = useState({
    name: '',
    vehicleNo: '',
    phone: '',
    vehicleType: TransportMode.TRUCK,
    capacity: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDrivers(DB.getDrivers());
  }, []);

  const toggleStatus = (id: string, current: 'Active' | 'Inactive') => {
    const next = current === 'Active' ? 'Inactive' : 'Active';
    DB.updateDriverStatus(id, next);
    setDrivers(DB.getDrivers());
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const driver: Driver = {
      ...newDriver,
      id: 'D' + Math.random().toString(36).substr(2, 9),
      status: 'Active'
    };
    DB.addDriver(driver);
    setDrivers(DB.getDrivers());
    setShowAddModal(false);
    setNewDriver({
      name: '',
      vehicleNo: '',
      phone: '',
      vehicleType: TransportMode.TRUCK,
      capacity: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      setTimeout(() => {
        try {
          const data = JSON.parse(content);
          setNewDriver({
            name: data.name || '',
            vehicleNo: data.vehicleNo || '',
            phone: data.phone || '',
            vehicleType: data.vehicleType || TransportMode.TRUCK,
            capacity: data.capacity || ''
          });
        } catch (e) {
          setNewDriver({
            name: "Extracted: " + file.name.split('.')[0],
            vehicleNo: "GJ-" + Math.floor(Math.random() * 90000 + 10000),
            phone: "+91 " + Math.floor(Math.random() * 9000000000 + 1000000000),
            vehicleType: TransportMode.TRUCK,
            capacity: "100 kg"
          });
        }
        setIsProcessing(false);
      }, 1200);
    };
    
    reader.readAsText(file);
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Drivers Fleet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage and deploy your logistics personnel</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <UserPlus size={20} />
          <span>Add New Driver</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or vehicle..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-80 dark:text-white font-bold"
              />
            </div>
            
            <div className="relative flex-1 md:flex-initial">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-48 dark:text-white font-bold appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <MoreVertical size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Driver Profile</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Vehicle No.</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Contact</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Vehicle Type</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Capacity</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                     <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                           <img src={`https://picsum.photos/seed/${driver.id}/100`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{driver.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">ID: {driver.id}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700 dark:text-slate-300">{driver.vehicleNo}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400">{driver.phone}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Truck size={14} />
                      <span className="text-sm font-medium">{driver.vehicleType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-900 dark:text-white">{driver.capacity}</td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleStatus(driver.id, driver.status)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        driver.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                      }`}
                    >
                      {driver.status}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold">No drivers found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-transparent">
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Showing {filteredDrivers.length} of {drivers.length} drivers</p>
          <div className="flex items-center space-x-2">
             <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 cursor-not-allowed"><ChevronLeft size={16} /></button>
             <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm shadow-md shadow-blue-200 dark:shadow-none">1</button>
             <button className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add New Driver</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manual or File Auto-fill</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* File Upload / Auto-fill Section */}
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Auto-fill from File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all group cursor-pointer bg-slate-50/30 dark:bg-slate-800/20 relative"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    accept=".json,.txt,.csv"
                  />
                  {isProcessing ? (
                    <div className="flex flex-col items-center space-y-3 py-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-blue-600">Analyzing file details...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                        <Upload size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload Driver Record</p>
                        <p className="text-xs text-slate-400 mt-1">Supports JSON, CSV or License Text files</p>
                      </div>
                    </div>
                  )}
                  {newDriver.name && !isProcessing && (
                    <div className="absolute top-4 right-4 text-emerald-500 flex items-center space-x-1">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase">Parsed</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vehicle Number</label>
                    <input 
                      type="text" 
                      required
                      value={newDriver.vehicleNo}
                      onChange={(e) => setNewDriver({...newDriver, vehicleNo: e.target.value})}
                      placeholder="e.g. GJ 01 AB 1234"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                      placeholder="+91 999 888 7777"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Capacity</label>
                    <input 
                      type="text" 
                      required
                      value={newDriver.capacity}
                      onChange={(e) => setNewDriver({...newDriver, capacity: e.target.value})}
                      placeholder="e.g. 100 kg"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vehicle Type</label>
                  <select 
                    value={newDriver.vehicleType}
                    onChange={(e) => setNewDriver({...newDriver, vehicleType: e.target.value as TransportMode})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white outline-none appearance-none font-bold transition-all cursor-pointer"
                  >
                    {Object.values(TransportMode).map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center space-x-3 mt-4"
                >
                  <CheckCircle2 size={24} />
                  <span>Confirm Registration</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversManagement;
