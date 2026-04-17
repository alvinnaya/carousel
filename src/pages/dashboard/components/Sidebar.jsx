import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../../../components/sidebar/Logo';

const NavSidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      group flex flex-col items-center justify-center w-full py-1 cursor-pointer outline-none transition-all duration-200
      ${isActive ? 'mus-text-primary' : 'mus-text-muted hover:mus-text-primary'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`
          relative flex items-center justify-center w-10 h-10 transition-all duration-200
          ${isActive ? 'mus-button-ghost-active' : 'mus-button-ghost'}
        `}>
          <div className="w-5 h-5 flex items-center justify-center">
            {Icon}
          </div>
        </div>
        <span className="mt-1 text-[8px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const Sidebar = ({ tools, logout }) => (
  <div className="fixed left-4 top-4 bottom-4 flex z-50">
    <aside className="h-full w-16 flex flex-col mus-panel overflow-hidden bg-[var(--bg-surface)] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <Logo />

      <nav className="flex-1 flex flex-col items-center py-2 space-y-2 overflow-y-auto no-scrollbar pt-4">
        {tools.map((tool) => (
          <NavSidebarItem
            key={tool.name}
            icon={tool.icon}
            label={tool.label}
            to={tool.path}
          />
        ))}
      </nav>

      <div className="p-4 flex flex-col items-center border-t mus-border-light">
        <button onClick={logout} className="p-2 mus-button-ghost text-[var(--danger)]">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  </div>
);

export default Sidebar;
