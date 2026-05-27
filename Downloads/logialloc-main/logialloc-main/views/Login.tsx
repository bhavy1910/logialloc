
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DB } from '../store';
import { Truck } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  onGoToSignup: () => void;
  isDarkMode?: boolean;
}

const Login: React.FC<Props> = ({ onLogin, onGoToSignup, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = DB.getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      onLogin(user);
    } else {
        const mockUser: User = {
            id: 'U1',
            email: 'admin@logialloc.com',
            fullName: 'Amanda Site',
            companyName: 'Global Logistics Corp',
            role: UserRole.SITE_MANAGER,
            contactNumber: '+1 234 567 890',
            siteLocation: 'New York, USA',
            gender: 'Female',
            language: 'English'
        };
        onLogin(mockUser);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium">
              Log in to manage your industrial logistics fleet.
            </p>
          </div>

          <form onSubmit={handleSignin} className="space-y-10">
            <div className="space-y-3">
              <label className="text-base font-bold text-slate-700 dark:text-slate-300 ml-1">Email / ID</label>
              <input 
                type="email" 
                placeholder="Example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-base font-bold text-slate-700 dark:text-slate-300">Password</label>
                <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot Password?</button>
              </div>
              <input 
                type="password" 
                placeholder="At least 8 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-xl shadow-sm"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-6 bg-[#0f172a] dark:bg-blue-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] dark:hover:bg-blue-500 shadow-2xl shadow-blue-500/20 transition-all text-2xl tracking-wide uppercase"
            >
              Sign in
            </button>
          </form>

          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t-2 border-slate-100 dark:border-slate-800"></div>
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-white dark:bg-slate-950 px-6 text-slate-400 font-black tracking-[0.3em]">OR</span>
             </div>
          </div>

          <button className="w-full py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-7 h-7" alt="Google" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">Sign in with Google</span>
          </button>

          <p className="text-center text-lg text-slate-500 dark:text-slate-400 font-medium">
            Don't you have an account? <button onClick={onGoToSignup} className="text-blue-600 dark:text-blue-400 font-black hover:underline ml-1">Sign up</button>
          </p>
          
          <div className="pt-8 text-center text-[11px] text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] font-black">
            © 2026 LOGIALLOC • GLOBAL LOGISTICS SYSTEMS
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block bg-slate-50 dark:bg-slate-900 p-12 transition-colors duration-300">
        <div className="h-full w-full bg-blue-600 rounded-[4.5rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-video bg-white/10 backdrop-blur-2xl rounded-[3.5rem] border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center p-16">
            <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-10 shadow-2xl animate-pulse">
                <Truck size={64} />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">Industrial Supply <br/> Reimagined</h2>
            <p className="text-blue-100 max-w-sm text-xl font-medium opacity-90 leading-relaxed">The single source of truth for site managers and fleet owners.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
