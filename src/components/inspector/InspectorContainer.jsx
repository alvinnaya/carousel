import React, { useState } from 'react';
import InspectorHeader from './InspectorHeader';
import LayersPanel from './LayersPanel';
import ElementsPanel from './ElementsPanel';

/**
 * InspectorContainer - The main right sidebar for element and layer management.
 */
const InspectorContainer = () => {
    const [activeTab, setActiveTab] = useState('Layers');

    return (
        <aside
            className="fixed right-4 top-4 bottom-4 w-64 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50"
            onWheel={(e) => e.stopPropagation()}
        >
            {/* Header with tab switcher */}
            <InspectorHeader
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
            />

            {/* Dynamic Content Area */}
            {activeTab === 'Layers' ? <LayersPanel /> : <ElementsPanel />}

            {/* Footer / Drag Indicator (Visual only) */}
            <div className="p-2 border-t border-zinc-50 flex items-center justify-center opacity-20">
                {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                </svg> */}
            </div>
        </aside>
    );
};

export default InspectorContainer;
