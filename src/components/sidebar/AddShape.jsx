import React from 'react';

const AddShape = () => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Basic Shapes</h3>
                <div className="grid grid-cols-3 gap-3">
                    {['rect', 'circle', 'triangle', 'line', 'star', 'hexagon'].map((shape) => (
                        <div key={shape} className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:border-zinc-300 transition-all p-3">
                            <div className={`w-full h-full border-2 border-zinc-400 ${shape === 'circle' ? 'rounded-full' : ''}`} />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Icons</h3>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 cursor-pointer hover:border-zinc-300 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                            </svg>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddShape;
