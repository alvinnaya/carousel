import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const ProjectsView = ({ designs, loading, error, fetchDesigns, handleCreateNew, handleDeleteDesign, user }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
        <p className="font-bold text-[var(--text-muted)]">Fetching your workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mus-panel p-10 bg-red-50 border-red-200 text-center">
        <p className="text-[var(--danger)] font-bold">{error}</p>
        <button onClick={fetchDesigns} className="mt-4 mus-button-amber px-6 py-2">Try Again</button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-3">Welcome back, <span className="text-[var(--accent)]">{user?.userName?.split(' ')[0] || 'User'}.</span></h1>
          <p className="text-[var(--text-muted)] font-bold">You have {designs.length} active projects this week.</p>
        </div>
        <button onClick={handleCreateNew} className="mus-button-amber px-10 py-4 font-black flex items-center gap-3 shadow-[var(--shadow-md)] text-lg">
          <Plus size={24} />
          New Design
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {designs.map((design) => (
          <Link key={design.id} to={`/editor/${design.id}`} className="group">
            <div className="mus-panel p-4 h-80 flex flex-col justify-between bg-white overflow-hidden relative border-2 border-[var(--border-dark)] hover:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transition-all duration-300">
              <div 
                className="absolute top-0 left-0 w-full h-2.5" 
                style={{ backgroundColor: design.color || 'var(--accent)' }}
              />
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full h-full bg-[var(--bg-main)] rounded-2xl border-2 border-dashed border-[var(--border-light)] flex items-center justify-center group-hover:bg-[var(--bg-surface)] transition-colors overflow-hidden">
                    <div className="w-full h-full p-4 flex flex-col gap-2">
                      <div className="w-full h-3/4 bg-white/50 rounded-lg flex items-center justify-center">
                          <span className="text-5xl opacity-20 group-hover:opacity-40 transition-opacity">🖼️</span>
                      </div>
                      <div className="flex gap-2">
                          <div className="h-6 flex-1 bg-white/30 rounded"></div>
                          <div className="h-6 w-12 bg-white/30 rounded"></div>
                      </div>
                    </div>
                </div>
              </div>
              <div className="mt-2 p-3 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-xl leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">{design.title}</h3>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">
                    {design.updatedAt ? new Date(design.updatedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDeleteDesign(e, design.id)}
                  className="p-1 mus-button-ghost rounded-lg text-[var(--danger)] hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Link>
        ))}

        {/* Create New Card */}
        <div onClick={handleCreateNew} className="mus-panel p-4 h-80 border-dashed border-[var(--border-light)] flex flex-col items-center justify-center gap-6 hover:border-[var(--border-dark)] bg-transparent hover:bg-white/30 transition-all cursor-pointer group">
          <div className="w-20 h-20 rounded-[2.5rem] border-2 border-dashed border-[var(--border-light)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--border-dark)] group-hover:rotate-45 transition-all duration-500">
            <Plus size={40} className="text-[var(--text-muted)] group-hover:text-[var(--border-dark)]" />
          </div>
          <div className="text-center">
            <span className="font-black text-lg text-[var(--text-muted)] group-hover:text-[var(--text-primary)] block">Create New Template</span>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1 italic">Start with a blank canvas</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsView;
