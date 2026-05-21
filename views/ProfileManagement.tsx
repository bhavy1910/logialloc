
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { Mail, Factory, MapPin, Globe, Award, Upload, Briefcase, Calendar, CheckCircle, FileText } from 'lucide-react';

interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileManagement: React.FC<Props> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({...user});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(formData);
    alert('Profile updated successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const isManufacturer = user.role === UserRole.MANUFACTURER;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Banner & Avatar Section */}
      <div className="relative">
          {/* Profile Info Overlay Container */}
          <div className="flex flex-col md:flex-row md:items-end justify-between px-8 py-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-24 h-24 rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-md bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0">
                     <img src={`https://picsum.photos/seed/${user.id}/200`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="text-center md:text-left pb-1">
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-[200px] md:max-w-md">{user.fullName}</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">{user.email}</p>
                  </div>
              </div>
              
              <div className="pb-1 flex justify-center">
                  <button 
                    onClick={handleSave}
                    className="bg-[#0f172a] dark:bg-blue-600 hover:scale-105 active:scale-95 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-black shadow-2xl transition-all uppercase tracking-widest text-xs md:text-sm whitespace-nowrap"
                  >
                    Save Profile
                  </button>
              </div>
          </div>
      </div>

      <div className="pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-8">
              {/* Common Details */}
              <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                  <div className="flex items-center space-x-3 mb-2">
                     <Briefcase className="text-blue-600" size={20} />
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">General Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Company Full Name</label>
                          <input 
                            type="text" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Site Location / City</label>
                          <input 
                            type="text" 
                            value={formData.siteLocation}
                            onChange={(e) => setFormData({...formData, siteLocation: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" 
                          />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Contact Phone</label>
                          <input 
                            type="text" 
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Preferred Language</label>
                          <select 
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 appearance-none font-bold dark:text-white"
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>Hindi</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* Manufacturer Specific Section */}
              {isManufacturer && (
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 animate-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center space-x-3 mb-2">
                       <Factory className="text-emerald-600" size={20} />
                       <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Manufacturing Capacity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Daily Capacity (MT/Day)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="e.g. 5000 Tonnes"
                                    value={formData.dailyCapacity || ''}
                                    onChange={(e) => setFormData({...formData, dailyCapacity: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 pr-12 focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white" 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px]">MT</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Specific Plant Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Chakan Phase II, Pune"
                                    value={formData.manufacturingLocation || ''}
                                    onChange={(e) => setFormData({...formData, manufacturingLocation: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 pl-12 focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8">
                        <div className="flex items-center space-x-3 mb-4">
                           <Award className="text-amber-500" size={20} />
                           <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Industrial License Verification</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">License Type</label>
                                <select 
                                  value={formData.licenseType || ''}
                                  onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-amber-500 font-bold dark:text-white appearance-none"
                                >
                                  <option value="">Select License Type</option>
                                  <option value="Factory License">Factory License</option>
                                  <option value="Pollution Board NOC">Pollution Board NOC</option>
                                  <option value="Trade License">Trade License</option>
                                  <option value="GST Registration">GST Registration</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">License Expiry Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="date" 
                                        value={formData.licenseExpiryDate || ''}
                                        onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 pl-12 focus:ring-2 focus:ring-amber-500 font-bold dark:text-white" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Business License / GSTIN Number</label>
                            <div className="relative">
                                <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. 27AAAAA0000A1Z5"
                                    value={formData.licenseId || ''}
                                    onChange={(e) => setFormData({...formData, licenseId: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 pl-12 focus:ring-2 focus:ring-amber-500 font-bold dark:text-white uppercase tracking-widest" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>

          <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-6">
                     <Award className="text-blue-600" size={20} />
                     <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Industrial Document</h3>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${selectedFile ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'} rounded-3xl p-8 md:p-10 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors group cursor-pointer`}
                  >
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all shadow-sm ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                          {selectedFile ? <CheckCircle size={32} /> : <Upload size={32} />}
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedFile ? 'Document Ready' : 'Upload New Copy'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-2 truncate">
                        {selectedFile ? selectedFile : 'PDF, PNG (Max 10MB)'}
                      </p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                  </div>
              </div>

              <div className="bg-slate-900 dark:bg-blue-600 p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <FileText size={120} />
                  </div>
                  <h3 className="font-black text-xl mb-4 tracking-tight">Enterprise Shield</h3>
                  <p className="text-blue-100/70 text-sm font-bold leading-relaxed mb-6">Your manufacturing data and certificates are secured with industrial encryption. Keeping your licenses updated ensures zero delays in shipment logistics.</p>
                  <button className="w-full bg-white text-slate-900 font-black p-4 rounded-xl hover:bg-blue-50 transition-colors uppercase tracking-widest text-xs shadow-xl relative z-10">Audit Security</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
