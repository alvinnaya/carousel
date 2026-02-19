import React, { useState } from 'react';
import Logo from './Logo';
import EditTool from './EditTool';
import AddText from './AddText';
import AddShape from './AddShape';
import AddImage from './AddImage';
import AddComponentGroup from './AddComponentGroup';
import AddTemplate from './AddTemplate';

/**
 * Menu Component - The main responsive sidebar.
 * It wraps all tool components and handles their active states.
 */
const Menu = () => {
    const [activeTool, setActiveTool] = useState('Tools');

    const tools = [
        { name: 'Edit', component: EditTool },
        { name: 'Text', component: AddText },
        { name: 'Shape', component: AddShape },
        { name: 'Image', component: AddImage },
        { name: 'Group', component: AddComponentGroup },
        { name: 'Templates', component: AddTemplate },
    ];

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-16 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm z-50 transition-all duration-300 overflow-hidden">
            {/* Top Logo Section */}
            <Logo />

            {/* Main Tools Section */}
            <nav className="flex-1 flex flex-col items-center py-2 space-y-1 overflow-y-auto no-scrollbar">
                {tools.map((tool) => {
                    const ToolComponent = tool.component;
                    return (
                        <ToolComponent
                            key={tool.name}
                            active={activeTool === tool.name}
                            onClick={() => setActiveTool(tool.name)}
                        />
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="py-4 flex flex-col items-center space-y-4 border-t border-zinc-100">
                <button className="text-zinc-400 hover:text-zinc-800 transition-colors duration-200 p-2 rounded-lg hover:bg-zinc-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Menu;
