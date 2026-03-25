import React from 'react';
import { Search, Bell } from 'lucide-react';

const DashboardHeader = ({ user }) => (
  <header className="h-20 flex items-center justify-between px-10">
    <div className="relative w-96 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
      <input 
        type="text" 
        placeholder="Search designs..." 
        className="mus-tool-input !pl-12 h-12 w-full bg-white/50 focus:bg-white border-2 border-[var(--border-light)] focus:border-[var(--border-dark)] shadow-none transition-all"
      />
    </div>
    
    <div className="flex items-center gap-6">
      <button className="mus-button-ghost p-3 relative">
        <Bell size={22} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--bg-main)]"></span>
      </button>
      <div className="h-10 w-[1px] bg-[var(--border-light)]"></div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-black leading-none">{user?.userName || user?.email || 'User'}</p>
          <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">Pro Plan</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[var(--border-light)] border-2 border-[var(--border-dark)] overflow-hidden shadow-[var(--shadow-sm)]">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.userName || 'User'}`} alt="avatar" className="scale-110" />
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
