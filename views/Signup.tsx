
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DB } from '../store';
import { Truck } from 'lucide-react';

interface Props {
  onSignup: (user: User) => void;
  onGoToLogin: () => void;
}

const Signup: React.FC<Props> = ({ onSignup, onGoToLogin }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    contactNumber: '',
    role: UserRole.SITE_MANAGER,
    password: ''
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'U' + Math.random().toString(36).substr(2, 9),
      fullName: formData.companyName,
      companyName: formData.companyName,
      email: formData.email,
      role: formData.role,
      contactNumber: formData.contactNumber,
      siteLocation: 'Headquarters',
      gender: 'N/A',
      language: 'English'
    };
    DB.addUser(newUser);
    onSignup(newUser);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
              Join the most advanced logistics allocation network.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Company / Site Name</label>
              <input 
                type="text" 
                placeholder="Full Legal Name" 
                required
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Email / Corporate ID</label>
              <input 
                type="email" 
                placeholder="Example@email.com" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Contact Number</label>
              <input 
                type="text" 
                placeholder="+91 xxxxxxxxxx" 
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Who are you?</label>
              <div className="relative">
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none appearance-none cursor-pointer font-bold text-xl shadow-sm"
                >
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="At least 8 characters" 
                required
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-6 bg-[#0f172a] dark:bg-blue-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] dark:hover:bg-blue-500 shadow-2xl shadow-blue-500/20 transition-all text-2xl tracking-widest uppercase mt-4"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-xl text-slate-500 dark:text-slate-400 font-medium pb-8">
            Already have an account? <button onClick={onGoToLogin} className="text-blue-600 dark:text-blue-400 font-black hover:underline ml-1">Sign In</button>
          </p>
          
          <div className="pt-4 text-center text-[11px] text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] font-black">
            © 2026 LOGIALLOC • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block bg-slate-50 dark:bg-slate-900 p-12 transition-colors duration-300">
        <div className="h-full w-full bg-blue-600 rounded-[4.5rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] flex flex-col items-center justify-center text-center p-12">
             <div className="w-full h-[400px] rounded-[3.5rem] overflow-hidden shadow-2xl mb-12 transform group-hover:scale-105 transition-transform duration-1000 relative ring-8 ring-white/10">
                <img src="https://picsum.photos/seed/logistics-signup/1200/800" className="w-full h-full object-cover" alt="Logistics Network" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-900/10 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-left">
                   <p className="text-white/70 text-sm font-black uppercase tracking-[0.2em] mb-2">Network Status</p>
                   <p className="text-white text-2xl font-bold">12,482 Active Shipments Globally</p>
                </div>
             </div>
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-8 shadow-2xl animate-bounce">
                <Truck size={48} />
             </div>
             <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">Enterprise Scale <br/> Ready for You</h2>
             <p className="text-blue-100 text-xl font-medium opacity-90 leading-relaxed">Integrated driver dispatch, real-time telemetry, and automated cost estimation at your fingertips.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
