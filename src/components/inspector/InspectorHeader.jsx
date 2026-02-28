import React from 'react';

/**
 * InspectorHeader - Elegant tab switcher for the right inspector panel.
 */
const InspectorHeader = ({ activeTab, onTabChange }) => {
    const tabs = ['Elements', 'Layers'];

    return (
        <div className="p-3 mus-border-light border-b">
            <div className="relative flex p-1 bg-[#E0D8CC] rounded-xl border border-[#D4CBBA]/30">
                {/* Animated Background Pill */}
                <div
                    className="absolute h-[calc(100%-8px)] rounded-lg mus-button-amber shadow-none border transition-all duration-300 ease-in-out"
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
              relative flex-1 py-1.5 text-[10px] uppercase tracking-wider font-black rounded-lg transition-colors duration-200 z-10
              ${activeTab === tab ? 'mus-text-primary' : 'mus-text-muted hover:mus-text-primary'}
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
