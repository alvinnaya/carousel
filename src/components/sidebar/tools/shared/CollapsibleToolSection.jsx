import React, { useState } from 'react';

const CollapsibleToolSection = ({ title, defaultOpen = false, actionButton = null, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 group cursor-pointer transition-colors"
                >
                    <span className="mus-tool-label !p-0 !m-0" style={{ color: isOpen ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {title.toUpperCase()}
                    </span>
                    <svg
                        className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                {actionButton && (
                    <div>
                        {actionButton}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="pt-3 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </section>
    );
};

export default CollapsibleToolSection;
