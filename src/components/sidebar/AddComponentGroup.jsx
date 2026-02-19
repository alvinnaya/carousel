import React from 'react';

const AddComponentGroup = () => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Saved Groups</h3>
                <div className="p-8 border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium">No saved component groups yet</p>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Featured Components</h3>
                <div className="space-y-2">
                    {['Pricing Table', 'Team Section', 'Features Grid'].map((name) => (
                        <div key={name} className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-zinc-300 cursor-pointer transition-all flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-700">{name}</span>
                            <span className="text-[10px] text-zinc-400 italic">Pro</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddComponentGroup;
