import React, { useState } from 'react';
import ProjectName from './ProjectName';
import ZoomControls from './ZoomControls';
import ExportModal from './ExportModal';

/**
 * TopNavigation - Floating top bar layout container.
 * Orchestrates modular sections like ProjectName and ZoomControls.
 */
const TopNavigation = () => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-6 px-6 py-2.5 mus-panel min-w-[480px] justify-between shadow-lg">
                <div className="flex items-center gap-4">

                    <ProjectName />
                </div>

                <ZoomControls />

                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="mus-button-amber px-5 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export
                </button>
            </nav>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </>
    );
};

export default TopNavigation;
