import { useCanvasContext } from '../../context/CanvasContext';
import NavPanel from './NavPanel';
import ContentPanel from './ContentPanel';

/**
 * SidebarContainer - Orchestrates the vertical navigation (NavPanel) 
 * and the dynamic content area (ContentPanel).
 */
const SidebarContainer = () => {
    const { activeTool, setActiveTool } = useCanvasContext();

    const toggleTab = (tabName) => {
        setActiveTool((prev) => (prev === tabName ? null : tabName));
    };

    return (
        <div
            className="fixed left-6 top-[55%] -translate-y-1/2 flex items-center z-50 pointer-events-none"
            onWheel={(e) => e.stopPropagation()}
        >
            {/* 1. Vertical Navigation Bar (Slim Sidebar) */}
            <div className="pointer-events-auto">
                <NavPanel activeTab={activeTool} onTabClick={toggleTab} />
            </div>
            {/* 2. Dynamic Content Panel (Expands to the right) */}
            <div className="pointer-events-auto h-[85vh] max-h-[800px] ml-4 flex items-center">
                <ContentPanel activeTab={activeTool} onClose={() => setActiveTool(null)} />
            </div>
        </div>
    );
};

export default SidebarContainer;
