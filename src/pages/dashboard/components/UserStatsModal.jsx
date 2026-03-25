import React from 'react';
import { Plus } from 'lucide-react';

const UserStatsModal = ({ stats, onClose }) => {
  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
       <div className="mus-panel bg-white p-8 max-w-md w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 mus-button-ghost p-1">
             <Plus size={24} className="rotate-45" />
          </button>
          <h3 className="text-2xl font-black mb-1">{stats.userName}</h3>
          <p className="text-[var(--text-muted)] font-bold text-sm mb-6">{stats.email}</p>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="mus-panel bg-[var(--bg-main)] p-4 text-center">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Designs</p>
                <p className="text-3xl font-black">{stats.designCount}</p>
             </div>
             <div className="mus-panel bg-[var(--bg-main)] p-4 text-center">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Pages</p>
                <p className="text-3xl font-black">{stats.pageCount}</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default UserStatsModal;
