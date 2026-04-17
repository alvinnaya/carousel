import React from 'react';
import EditTool from './section/EditTool';
import AddText from './section/AddText';
import AddShape from './section/AddShape';
import AddImage from './section/AddImage';
import AddComponentGroup from './section/AddComponentGroup';
import AddTemplate from './section/AddTemplate';
import { useCanvasContext } from '../../context/CanvasContext';
import FilterList from './tools/shared/ImageFilterTool/FilterList';

/**
 * ContentPanel - The expandable section to the right of the navigation bar.
 * It renders tool-specific content based on the activeTab.
 */
const ContentPanel = ({ activeTab, onClose }) => {
    const { activeSubView, setActiveSubView } = useCanvasContext();

    if (!activeTab) return null;

    // Sub-view mapping
    const SubView = {
        'FILTER_LIST': FilterList,
        // Add more sub-views here as needed
    }[activeSubView];

    // Component mapping for each tool panel
    const PanelContent = {
        'Tools': EditTool,
        'Text': AddText,
        'Shape': AddShape,
        'Image': AddImage,
        'Group': AddComponentGroup,
        'Templates': AddTemplate,
    }[activeTab] || (() => <p className="text-xs text-zinc-500">Section for {activeTab} content will go here.</p>);

    return (
        <aside className="w-90 h-full mus-panel overflow-hidden flex flex-col transition-all duration-300 animate-in slide-in-from-left-4 fade-in relative">
            {/* If a sub-view is active, it takes over the entire panel (including header) */}
            {SubView ? (
                <SubView onBack={() => setActiveSubView(null)} />
            ) : (
                <>
                    <div className="p-4 border-b mus-border-light flex items-center justify-between">
                        <h2 className="text-sm font-bold mus-text-primary uppercase tracking-tight">{activeTab}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 mus-button-ghost"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <PanelContent />
                    </div>
                </>
            )}
        </aside>
    );
};

export default ContentPanel;
