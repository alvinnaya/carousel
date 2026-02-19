import React from 'react';

const AddImage = () => {
    return (
        <div className="space-y-6">
            <button className="w-full py-3 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm">
                Upload Image
            </button>

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Library</h3>
                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-300 transition-all">
                            <img
                                src={`https://picsum.photos/seed/${i + 10}/200`}
                                alt="placeholder"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AddImage;
