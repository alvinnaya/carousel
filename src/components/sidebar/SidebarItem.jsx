import React from 'react';

/**
 * SidebarItem component - A reusable component for each sidebar tool.
 * Designed to be modern, consistent, and easy to maintain.
 */
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center justify-center w-full py-1 cursor-pointer outline-none transition-all duration-200
        ${active ? 'mus-text-primary' : 'mus-text-muted hover:mus-text-primary'}
      `}
        >
            <div className={`
        relative flex items-center justify-center w-10 h-10 
        ${active ? 'mus-button-ghost-active' : 'mus-button-ghost'}
      `}>
                {/* Render the icon */}
                <div className="w-5 h-5 flex items-center justify-center">
                    {Icon}
                </div>
            </div>

            {/* Label - very small and subtle */}
            <span className="mt-1 text-[8px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
            </span>
        </button>
    );
};

export default SidebarItem;
