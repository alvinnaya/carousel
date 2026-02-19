import React from 'react';

/**
 * ElementsPanel - Lists and manages individual objects on the current canvas.
 */
const ElementsPanel = () => {
    const elements = [
        { id: '1', type: 'text', content: 'Creative' },
        { id: '2', type: 'rect', content: 'Shape' },
        { id: '3', type: 'image', content: 'Image' },
    ];

    return (
        <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="flex items-center p-2 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-zinc-300 hover:bg-white cursor-pointer transition-all group shadow-sm"
                >
                    <div className="w-8 h-8 rounded-md bg-white border border-zinc-100 flex items-center justify-center mr-3 text-zinc-400 group-hover:text-zinc-600">
                        {el.type === 'text' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
                            </svg>
                        )}
                        {el.type === 'rect' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            </svg>
                        )}
                        {el.type === 'image' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-700">{el.content}</span>
                </div>
            ))}

            {elements.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[10px] font-bold">No elements found</p>
                </div>
            )}
        </div>
    );
};

export default ElementsPanel;
