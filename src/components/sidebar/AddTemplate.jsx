import React from 'react';

const AddTemplate = () => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Popular Layouts</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group relative aspect-[4/3] rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden cursor-pointer hover:border-zinc-300 transition-all">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-zinc-500 transition-colors">Layout {i}</span>
                            </div>
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-900 text-white text-[8px] font-bold rounded uppercase">Free</div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                    {['Business', 'Education', 'Minimalist', 'Creative'].map((cat) => (
                        <div key={cat} className="p-3 rounded-lg border border-zinc-100 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors">
                            {cat}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddTemplate;
