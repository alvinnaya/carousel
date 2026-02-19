import React from 'react';

/**
 * InspectorHeader - Elegant tab switcher for the right inspector panel.
 */
const InspectorHeader = ({ activeTab, onTabChange }) => {
    const tabs = ['Elements', 'Layers'];

    return (
        <div className="p-3 bg-zinc-50 border-b border-zinc-100">
            <div className="relative flex p-1 bg-zinc-200/50 rounded-lg">
                {/* Animated Background Pill */}
                <div
                    className="absolute h-[calc(100%-8px)] rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out"
                    style={{
                        width: 'calc(50% - 4px)',
                        left: activeTab === 'Elements' ? '4px' : 'calc(50% + 0px)'
                    }}
                />

                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`
              relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 z-10
              ${activeTab === tab ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InspectorHeader;
