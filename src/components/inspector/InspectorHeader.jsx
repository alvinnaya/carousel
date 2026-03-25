import React from 'react';

/**
 * InspectorHeader - Elegant tab switcher for the right inspector panel.
 */
const InspectorHeader = ({ activeTab, onTabChange }) => {
    const tabs = ['Elements', 'Layers'];

    return (
        <div className="p-3 mus-border-b-soft">
            <div className="mus-nav-container">
                {/* Animated Background Pill */}
                <div
                    className="absolute h-[calc(100%-8px)] mus-nav-pill border transition-all duration-300 ease-in-out"
                    style={{
                        width: 'calc(50% - 4px)',
                        left: activeTab === 'Elements' ? '4px' : 'calc(50% + 0px)'
                    }}
                />

                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`mus-nav-btn ${activeTab === tab ? 'mus-nav-btn-active' : ''}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InspectorHeader;
