import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import SidebarItem from '../../../components/sidebar/SidebarItem';
import Logo from '../../../components/sidebar/Logo';

const Sidebar = ({ tools, activeTab, setActiveTab, logout }) => (
  <div className="fixed left-4 top-4 bottom-4 flex z-50">
    <aside className="h-full w-16 flex flex-col mus-panel overflow-hidden bg-[var(--bg-surface)]">
      <Logo />
      
      <nav className="flex-1 flex flex-col items-center py-2 space-y-2 overflow-y-auto no-scrollbar pt-4">
        {tools.map((tool) => (
          <SidebarItem
            key={tool.name}
            icon={tool.icon}
            label={tool.label}
            active={activeTab === tool.name}
            onClick={() => setActiveTab(tool.name)}
          />
        ))}
      </nav>

      <div className="p-4 flex flex-col items-center border-t mus-border-light space-y-2">
        <button className="p-2 mus-button-ghost">
          <Settings size={20} />
        </button>
        <button onClick={logout} className="p-2 mus-button-ghost text-[var(--danger)]">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  </div>
);

export default Sidebar;
