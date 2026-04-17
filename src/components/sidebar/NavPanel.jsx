import React from 'react';
import SidebarItem from './SidebarItem';

/**
 * NavPanel - Vertical navigation bar containing tool icons.
 * Defines icons internally to keep tool components focused on content.
 */
const NavPanel = ({ activeTab, onTabClick }) => {
    const tools = [
        {
            name: 'Text',
            label: 'Text',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
            )
        },
        {
            name: 'Shape',
            label: 'Shape',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
            )
        },
        {
            name: 'Image',
            label: 'Image',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            )
        },
        {
            name: 'Group',
            label: 'Group',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            )
        },
        {
            name: 'Templates',
            label: 'Templates',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
            )
        }
    ];

    const isToolsActive = activeTab === 'Tools';

    return (
        <aside className="mus-sidebar-container-ref pointer-events-auto">
            {/* Top Circle - Tools / Editor Section */}
            <div 
                onClick={() => onTabClick('Tools')}
                className={`mus-sidebar-circle-outer group ${isToolsActive ? 'active' : ''}`}
            >
                <div className="mus-sidebar-btn-inner relative flex items-center justify-center">
                    {/* Icon */}
                    <div className={`
                        relative z-10 w-5 h-5 flex items-center justify-center transition-colors duration-200
                        ${isToolsActive ? 'text-white' : 'mus-text-muted group-hover:text-white'}
                    `}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Bottom Pill - Other Tools */}
            <nav className="mus-sidebar-nav-pill space-y-2">
                {tools.map((tool) => (
                    <SidebarItem
                        key={tool.name}
                        icon={tool.icon}
                        label={tool.label}
                        active={activeTab === tool.name}
                        onClick={() => onTabClick(tool.name)}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default NavPanel;
