import React from 'react';

/**
 * LayersPanel - Manages canvas pages with thumbnails and addition logic.
 */
const LayersPanel = () => {
    const pages = [
        { id: 0, thumbnail: 'https://picsum.photos/seed/page0/200/300' },
        { id: 1, thumbnail: null },
        { id: 2, thumbnail: 'https://picsum.photos/seed/page0/200/300' },
        { id: 3, thumbnail: 'https://picsum.photos/seed/page0/200/300' },
    ];

    return (
        <div className="flex-1 flex flex-col p-4 space-y-4 h-full">
            {/* Pages List */}
            <div className="flex-1 space-y-3 overflow-y-scroll overflow-x-hidden pb-4">
                {pages.map((page) => (
                    <div key={page.id} className="relative group">
                        <div className="absolute top-2 left-2 z-10 text-[10px] font-bold text-zinc-900 bg-white/80 px-1 rounded shadow-sm">
                            {page.id}
                        </div>

                        <div className={`
                                w-full  rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all cursor-pointer
                                ${page.id === 0 ? 'border-zinc-300 ring-2 ring-zinc-100 shadow-md' : 'border-zinc-50 bg-white hover:border-zinc-200'}
                                `}>
                            {page.thumbnail ? (
                                <img src={page.thumbnail} alt={`Page ${page.id}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-[150px] bg-white" />
                            )}
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Page Button */}
            <button className="w-full py-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-all hover:shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
            </button>
        </div>
    );
};

export default LayersPanel;
