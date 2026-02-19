import React from 'react';

/**
 * SidebarItem component - A reusable component for each sidebar tool.
 * Designed to be modern, consistent, and easy to maintain.
 */
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center justify-center w-full py-2 transition-all duration-200 cursor-pointer outline-none
        ${active ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-800'}
      `}
        >
            <div className={`
        relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
        ${active ? 'bg-zinc-100' : 'group-hover:bg-zinc-50'}
      `}>
                {/* Render the icon */}
                <div className="w-5 h-5 flex items-center justify-center">
                    {Icon}
                </div>
            </div>

            {/* Label - very small and subtle */}
            <span className="mt-0.5 text-[8px] font-bold tracking-tighter uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
            </span>
        </button>
    );
};

export default SidebarItem;
