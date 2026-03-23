import React from 'react';
import { useCanvasContext } from '../../../../context/CanvasContext';

/**
 * SidebarSubView - A reusable wrapper for full-screen sidebar views.
 * It provides a consistent header with back and close buttons.
 */
const SidebarSubView = ({ title, onBack, children }) => {
    const { setActiveTool } = useCanvasContext();

    const handleClose = () => {
        setActiveTool(null);
    };

    return (
        <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="p-4 border-b mus-border-light flex items-center justify-between bg-[var(--bg-surface)]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 mus-button-ghost rounded-full hover:bg-[var(--accent)]/10 transition-colors"
                        title="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h2 className="text-sm font-black mus-text-primary uppercase tracking-tight">{title}</h2>
                </div>
                
                <button
                    onClick={handleClose}
                    className="p-1.5 mus-button-ghost rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]">
                {children}
            </div>
        </div>
    );
};

export default SidebarSubView;
