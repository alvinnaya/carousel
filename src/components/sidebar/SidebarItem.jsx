import React from 'react';

/**
 * SidebarItem component - A reusable component for each sidebar tool.
 * Designed to be modern, consistent, and easy to maintain.
 */
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center w-full py-0.5 cursor-pointer outline-none transition-all duration-200"
        >
            <div className="relative flex items-center justify-center w-10 h-10">
                {/* Background (Active or Hover) */}
                <div className={`
                    absolute inset-1 rounded-full transition-all duration-200
                    ${active ? 'mus-sidebar-active-bg' : 'opacity-0 group-hover:opacity-100 mus-sidebar-item-hover-bg'}
                `} />

                {/* Icon */}
                <div className={`
                    relative z-10 w-5 h-5 flex items-center justify-center transition-colors duration-200
                    ${active ? 'text-white group-hover:text-white' : 'mus-text-muted group-hover:text-white'}
                `}>
                    {Icon}
                </div>
            </div>

            {/* Label - subtle hover state */}
            <span className="mus-text-muted text-[7px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5 pointer-events-none">
                {label}
            </span>
        </button>
    );
};

export default SidebarItem;
