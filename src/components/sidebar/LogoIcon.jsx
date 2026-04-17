import React from 'react';

const LogoIcon = () => {
    return (
        <div 
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
        >
            <span 
                className="text-xl font-bold select-none translate-y-[-0.5px]" 
                style={{ 
                    fontFamily: '"DM Serif Display", serif',
                    color: 'var(--text-inverse)'
                }}
            >
                F
            </span>
        </div>
    );
};

export default LogoIcon;
